import * as XLSX from 'xlsx';
import { Dataset, VariableMetadata, VariableType, VariableSuitability } from '../types/segmentation';

export interface ParseResult {
  dataset?: Dataset;
  error?: string;
  warnings: string[];
}

// Helper to test if a string represents an ISO/date format
function isDateString(value: any): boolean {
  if (value instanceof Date) return true;
  if (typeof value !== 'string') return false;
  const str = value.trim();
  if (str.length < 8 || str.length > 30) return false;
  // Match standard YYYY-MM-DD, DD/MM/YYYY, etc.
  const dateRegex = /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/;
  const slashRegex = /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/;
  if (!dateRegex.test(str) && !slashRegex.test(str)) return false;
  const parsed = Date.parse(str);
  return !isNaN(parsed);
}

// Helper to determine if a column name indicates an identifier
function isIdColumnName(colName: string): boolean {
  const normalized = colName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const idKeywords = ['id', 'uuid', 'guid', 'codigo', 'cod', 'rut', 'dni', 'cif', 'cedula', 'clienteid', 'customerid', 'accountid', 'idcliente', 'idsuscriptor', 'idcuenta', 'idafiliado'];
  return idKeywords.some((kw) => normalized === kw || normalized.startsWith(kw + '_') || normalized.endsWith('_' + kw) || normalized.includes('identifier'));
}

export function analyzeVariables(rows: Record<string, any>[], headers: string[]): VariableMetadata[] {
  const totalRows = rows.length;

  return headers.map((colName) => {
    let nullCount = 0;
    const values: any[] = [];
    let numericCount = 0;
    let dateCount = 0;
    let stringCount = 0;

    for (let i = 0; i < totalRows; i++) {
      const val = rows[i][colName];
      if (val === undefined || val === null || val === '' || (typeof val === 'number' && isNaN(val))) {
        nullCount++;
      } else {
        values.push(val);
        if (typeof val === 'number') {
          numericCount++;
        } else if (isDateString(val)) {
          dateCount++;
        } else {
          // Check if string can be cleanly cast to number
          const cleanStr = String(val).trim().replace(',', '.');
          const asNum = Number(cleanStr);
          if (!isNaN(asNum) && cleanStr !== '') {
            numericCount++;
          } else {
            stringCount++;
          }
        }
      }
    }

    const nonNullCount = values.length;
    const nullPercentage = Number(((nullCount / Math.max(1, totalRows)) * 100).toFixed(1));
    const uniqueValuesSet = new Set(values.map((v) => String(v)));
    const uniqueCount = uniqueValuesSet.size;
    const uniqueRatio = nonNullCount > 0 ? uniqueCount / nonNullCount : 0;
    const sampleValues = values.slice(0, 5);

    // Determine type
    let type: VariableType = 'categorical';
    if (dateCount > nonNullCount * 0.7) {
      type = 'date';
    } else if (numericCount > nonNullCount * 0.8) {
      type = 'numeric';
    } else if (uniqueRatio > 0.95 && isIdColumnName(colName)) {
      type = 'id';
    } else if (stringCount > nonNullCount * 0.8 && uniqueRatio > 0.6) {
      type = 'text';
    }

    // Double-check ID if column name is an ID indicator
    if (isIdColumnName(colName) && uniqueRatio > 0.8) {
      type = 'id';
    }

    // Calculate descriptive bounds for numeric variables
    let min: number | undefined;
    let max: number | undefined;
    let mean: number | undefined;
    let stdDev: number | undefined;

    if (type === 'numeric' && nonNullCount > 0) {
      const numVals = values
        .map((v) => (typeof v === 'number' ? v : Number(String(v).trim().replace(',', '.'))))
        .filter((v) => !isNaN(v));

      if (numVals.length > 0) {
        min = Math.min(...numVals);
        max = Math.max(...numVals);
        const sum = numVals.reduce((acc, v) => acc + v, 0);
        mean = Number((sum / numVals.length).toFixed(2));
        const variance = numVals.reduce((acc, v) => acc + Math.pow(v - (mean as number), 2), 0) / Math.max(1, numVals.length - 1);
        stdDev = Number(Math.sqrt(variance).toFixed(2));
      }
    }

    // Determine suitability for clustering
    let suitability: VariableSuitability = 'excluded';
    let exclusionReason: string | undefined;

    if (type === 'id') {
      suitability = 'excluded';
      exclusionReason = 'Identificador único (sin valor informativo para agrupación por comportamiento).';
    } else if (type === 'date') {
      suitability = 'excluded';
      exclusionReason = 'Variable temporal / fecha (las distancias euclidianas no aplican directamente sin transformación a antigüedad o recencia).';
    } else if (type === 'text') {
      suitability = 'excluded';
      exclusionReason = 'Texto libre no estructurado (no es una magnitud escalar numérica).';
    } else if (type === 'categorical') {
      suitability = 'excluded';
      exclusionReason = 'Variable categórica nominal (requiere codificación One-Hot o análisis de correspondencias múltiples previo).';
    } else if (type === 'numeric') {
      if (nullPercentage > 40) {
        suitability = 'excluded';
        exclusionReason = `Tasa excesiva de datos faltantes (${nullPercentage}% nulos). Puede distorsionar el cálculo de centroides.`;
      } else if (min !== undefined && max !== undefined && min === max) {
        suitability = 'excluded';
        exclusionReason = 'Varianza cero (valor constante en todos los registros, no discrimina grupos).';
      } else if (uniqueCount <= 1) {
        suitability = 'excluded';
        exclusionReason = 'Unicidad insuficiente (todos los registros tienen el mismo valor).';
      } else {
        suitability = 'apt';
      }
    }

    // Auto-select apt variables by default
    const isSelectedForClustering = suitability === 'apt';

    return {
      name: colName,
      type,
      suitability,
      exclusionReason,
      sampleValues,
      nullCount,
      nullPercentage,
      uniqueCount,
      uniqueRatio: Number(uniqueRatio.toFixed(3)),
      isSelectedForClustering,
      min,
      max,
      mean,
      stdDev,
    };
  });
}

// Build a structured Dataset object from parsed raw rows
export function createDatasetFromRaw(
  rows: Record<string, any>[],
  fileName: string,
  fileSize: number,
  source: 'upload' | 'sample'
): Dataset {
  if (rows.length === 0) {
    throw new Error('El archivo no contiene registros de datos.');
  }

  const headers = Object.keys(rows[0]);
  const metadata = analyzeVariables(rows, headers);

  return {
    id: `ds-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
    fileName,
    fileSize,
    rows,
    headers,
    totalRows: rows.length,
    totalCols: headers.length,
    metadata,
    source,
  };
}

// Parse an uploaded ArrayBuffer or File (CSV, TSV, TXT, XLS, XLSX)
export async function parseUploadedFile(file: File): Promise<ParseResult> {
  const warnings: string[] = [];

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, {
      type: 'array',
      cellDates: true,
      raw: false, // Reads formatted values nicely
    });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return { error: 'El archivo no contiene hojas de cálculo legibles.', warnings };
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert sheet to json
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: null,
      raw: false,
    });

    if (!rawRows || rawRows.length === 0) {
      return { error: 'La hoja seleccionada está vacía o no tiene formato de tabla válido.', warnings };
    }

    // Clean headers and rows
    const firstRowKeys = Object.keys(rawRows[0]);
    if (firstRowKeys.length < 2) {
      return { error: 'El archivo debe contener al menos 2 columnas para realizar un análisis de clustering.', warnings };
    }

    if (rawRows.length < 5) {
      warnings.push('El archivo contiene menos de 10 registros; el clustering puede no converger de forma estadísticamente robusta.');
    }

    // Ensure numeric columns have real JS numbers where applicable
    const cleanedRows = rawRows.map((row) => {
      const cleanRow: Record<string, any> = {};
      for (const key of Object.keys(row)) {
        let val = row[key];
        if (typeof val === 'string') {
          const trimmed = val.trim();
          // Check if string is a numeric representation with comma or dot
          if (trimmed !== '' && !isDateString(trimmed)) {
            const numVal = Number(trimmed.replace(',', '.'));
            if (!isNaN(numVal)) {
              val = numVal;
            }
          }
        }
        cleanRow[key] = val;
      }
      return cleanRow;
    });

    const dataset = createDatasetFromRaw(cleanedRows, file.name, file.size, 'upload');

    // Check if any apt variables were found
    const aptCount = dataset.metadata.filter((m) => m.suitability === 'apt').length;
    if (aptCount === 0) {
      warnings.push('No se detectaron variables numéricas continuas aptas para clustering por defecto. Revise los tipos de datos en la pestaña de variables.');
    }

    return { dataset, warnings };
  } catch (err: any) {
    return {
      error: `Error al procesar el archivo: ${err?.message || 'Estructura no válida o formato corrupto.'}`,
      warnings,
    };
  }
}
