import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Table,
  ArrowRight,
  Database,
  Search,
  Sparkles,
} from 'lucide-react';
import { Dataset } from '../../types/segmentation';
import { parseUploadedFile, createDatasetFromRaw } from '../../utils/fileParser';
import { SAMPLE_DATASETS, SampleDatasetOption } from '../../data/sampleDatasets';

interface DataUploadModuleProps {
  dataset: Dataset | null;
  onDatasetLoaded: (dataset: Dataset) => void;
  onNext: () => void;
}

export const DataUploadModule: React.FC<DataUploadModuleProps> = ({
  dataset,
  onDatasetLoaded,
  onNext,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState<'first3' | 'first5' | 'last5' | 'all10'>('first5');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsParsing(true);
    setErrorMessage(null);
    setWarnings([]);

    const result = await parseUploadedFile(file);
    setIsParsing(false);

    if (result.error) {
      setErrorMessage(result.error);
      if (result.warnings.length > 0) setWarnings(result.warnings);
    } else if (result.dataset) {
      setWarnings(result.warnings);
      onDatasetLoaded(result.dataset);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSampleSelect = (option: SampleDatasetOption) => {
    setIsParsing(true);
    setTimeout(() => {
      const rows = option.generate();
      const ds = createDatasetFromRaw(rows, option.fileName, rows.length * 128, 'sample');
      onDatasetLoaded(ds);
      setIsParsing(false);
      setWarnings([]);
      setErrorMessage(null);
    }, 100);
  };

  // Compute Module 2 Exploration Statistics
  const numericCount = dataset?.metadata.filter((m) => m.type === 'numeric').length || 0;
  const categoricalCount = dataset?.metadata.filter((m) => m.type === 'categorical' || m.type === 'text').length || 0;
  const dateCount = dataset?.metadata.filter((m) => m.type === 'date').length || 0;
  const missingCount = dataset?.metadata.filter((m) => m.nullCount > 0).length || 0;

  // Filter preview rows
  const getPreviewRows = () => {
    if (!dataset || dataset.rows.length === 0) return [];
    let slice: Record<string, any>[] = [];

    if (previewMode === 'first3') {
      slice = dataset.rows.slice(0, 3);
    } else if (previewMode === 'first5') {
      slice = dataset.rows.slice(0, 5);
    } else if (previewMode === 'last5') {
      slice = dataset.rows.slice(-5);
    } else {
      slice = dataset.rows.slice(0, 10);
    }

    if (!searchTerm.trim()) return slice;

    const term = searchTerm.toLowerCase();
    return slice.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(term))
    );
  };

  const previewRows = getPreviewRows();

  return (
    <div className="space-y-8">
      {/* Module 1: Carga de Información */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Módulo 1: Carga de Información & Estructura
            </h2>
            <p className="text-sm text-slate-400">
              Cargue archivos en formato CSV, TXT, XLS, XLSX o TSV, o explore con datasets empresariales prediseñados.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Soporta: .csv, .tsv, .txt, .xls, .xlsx
          </span>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,.xls,.xlsx,.tsv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-950/80 border border-indigo-800/80 flex items-center justify-center text-indigo-400 mb-4">
            <Upload className="w-6 h-6" />
          </div>

          <h3 className="text-base font-semibold text-slate-200">
            {isParsing ? 'Procesando y validando estructura...' : 'Arrastre su archivo de clientes aquí o haga clic'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Detección automática de delimitadores (, ; \t |), validación de encabezados, tipado de columnas y análisis de datos nulos.
          </p>
        </div>

        {/* Pre-loaded Enterprise Datasets (1-Click) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-slate-300">
              O elija un dataset empresarial de referencia para prueba inmediata:
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SAMPLE_DATASETS.map((sample) => {
              const isSelected = dataset?.name === sample.name;
              return (
                <div
                  key={sample.id}
                  onClick={() => handleSampleSelect(sample)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold text-cyan-400">{sample.sector}</span>
                    <span className="text-[11px] text-slate-400 font-mono">Simulado</span>
                  </div>
                  <h5 className="font-medium text-sm text-slate-100 mt-1">{sample.name}</h5>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{sample.description}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                    <span>KPI: {sample.kpi}</span>
                    <span className="text-indigo-400 font-medium">Cargar →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Errors & Warnings */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold">Error en lectura de archivo</h5>
              <p className="text-xs text-rose-300 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold">Observaciones de validación:</span>
            </div>
            <ul className="text-xs text-amber-300/90 list-disc pl-5 space-y-0.5">
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Module 2: Exploración Inicial */}
      {dataset && (
        <section className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Módulo 2: Exploración Inicial del Dataset
              </h2>
              <p className="text-sm text-slate-400">
                Resumen estructural y vista previa con controles de paginación y búsqueda.
              </p>
            </div>
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Estructura Validada
            </span>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Total Registros</span>
              <p className="text-2xl font-bold text-white mt-1 font-mono">{dataset.totalRows}</p>
              <span className="text-[11px] text-slate-400">Entidades a segmentar</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Total Variables</span>
              <p className="text-2xl font-bold text-cyan-400 mt-1 font-mono">{dataset.totalCols}</p>
              <span className="text-[11px] text-slate-400">Columnas detectadas</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Numéricas (Aptas)</span>
              <p className="text-2xl font-bold text-indigo-400 mt-1 font-mono">{numericCount}</p>
              <span className="text-[11px] text-slate-400">Magnitudes continuas</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Categóricas / Texto</span>
              <p className="text-2xl font-bold text-amber-400 mt-1 font-mono">{categoricalCount}</p>
              <span className="text-[11px] text-slate-400">Etiquetas descriptivas</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Fechas</span>
              <p className="text-2xl font-bold text-slate-300 mt-1 font-mono">{dateCount}</p>
              <span className="text-[11px] text-slate-400">Marcas temporales</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Con Valores Nulos</span>
              <p className={`text-2xl font-bold mt-1 font-mono ${missingCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {missingCount}
              </p>
              <span className="text-[11px] text-slate-400">
                {missingCount === 0 ? 'Dataset 100% completo' : 'Requiere imputación'}
              </span>
            </div>
          </div>

          {/* Table Preview Controls */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg">
                <button
                  onClick={() => setPreviewMode('first3')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    previewMode === 'first3' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Primeras 3 filas
                </button>
                <button
                  onClick={() => setPreviewMode('first5')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    previewMode === 'first5' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Primeras 5 filas
                </button>
                <button
                  onClick={() => setPreviewMode('last5')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    previewMode === 'last5' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Últimas 5 filas
                </button>
                <button
                  onClick={() => setPreviewMode('all10')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    previewMode === 'all10' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  10 filas
                </button>
              </div>

              {/* Search in preview */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filtrar en vista previa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    {dataset.headers.map((h) => {
                      const meta = dataset.metadata.find((m) => m.name === h);
                      return (
                        <th key={h} className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-200">{h}</span>
                            <span className="text-[10px] text-indigo-400 font-mono lowercase">
                              {meta?.type || 'string'}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {previewRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors text-slate-300">
                      <td className="py-2 px-3 text-center text-slate-500 text-[11px]">{idx + 1}</td>
                      {dataset.headers.map((h) => (
                        <td key={h} className="py-2 px-3 whitespace-nowrap">
                          {row[h] !== null && row[h] !== undefined ? String(row[h]) : <span className="text-slate-600 italic">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action to proceed */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Continuar a Validación de Variables</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
