import React, { useState, useRef } from 'react';
import {
  Upload,
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
    <div className="space-y-8 text-slate-800 dark:text-slate-100">
      {/* Module 1: Carga de Información */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Módulo 1: Carga de Información & Estructura
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cargue archivos en formato CSV, TXT, XLS, XLSX o TSV, o explore con datasets empresariales prediseñados.
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
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
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-xs'
              : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-[#0f172a]'
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

          <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
            <Upload className="w-5 h-5" />
          </div>

          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {isParsing ? 'Validando estructura y tipos de datos...' : 'Arrastre su archivo de clientes aquí o haga clic para examinar'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Validación automática de delimitadores, consistencia de encabezados y diagnóstico de datos nulos.
          </p>
        </div>

        {/* Pre-loaded Enterprise Datasets (1-Click) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              O elija un dataset corporativo pre-cargado para análisis inmediato:
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
                      ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 shadow-xs'
                      : 'bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                      {sample.sector}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Empresarial</span>
                  </div>
                  <h5 className="font-semibold text-xs text-slate-900 dark:text-white mt-1">
                    {sample.name}
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {sample.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                    <span className="truncate max-w-[170px]">KPI: {sample.kpi}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">Cargar →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Errors & Warnings */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-semibold">Error en lectura de archivo</h5>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold">Observaciones de validación:</span>
            </div>
            <ul className="text-xs text-amber-800 dark:text-amber-300 list-disc pl-5 space-y-0.5">
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Module 2: Exploración Inicial */}
      {dataset && (
        <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Módulo 2: Exploración Inicial del Dataset
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Resumen de columnas, tipado automático y visor de datos con controles de paginación.
              </p>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Estructura Validada
            </span>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Registros</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                {dataset.totalRows}
              </p>
              <span className="text-[11px] text-slate-400">Filas cargadas</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Variables</span>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 font-mono">
                {dataset.totalCols}
              </p>
              <span className="text-[11px] text-slate-400">Columnas</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400">Numéricas (Aptas)</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                {numericCount}
              </p>
              <span className="text-[11px] text-slate-400">Continuas</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400">Categóricas / Texto</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                {categoricalCount}
              </p>
              <span className="text-[11px] text-slate-400">Descriptivas</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400">Fechas</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                {dateCount}
              </p>
              <span className="text-[11px] text-slate-400">Temporales</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400">Con Valores Nulos</span>
              <p className={`text-xl font-bold mt-1 font-mono ${missingCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {missingCount}
              </p>
              <span className="text-[11px] text-slate-400">
                {missingCount === 0 ? '100% completo' : 'Requiere filtro'}
              </span>
            </div>
          </div>

          {/* Table Preview Controls */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={() => setPreviewMode('first3')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    previewMode === 'first3' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  3 filas
                </button>
                <button
                  onClick={() => setPreviewMode('first5')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    previewMode === 'first5' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  5 filas
                </button>
                <button
                  onClick={() => setPreviewMode('last5')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    previewMode === 'last5' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Últimas 5
                </button>
                <button
                  onClick={() => setPreviewMode('all10')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    previewMode === 'all10' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  10 filas
                </button>
              </div>

              {/* Search in preview */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar en vista previa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    {dataset.headers.map((h) => {
                      const meta = dataset.metadata.find((m) => m.name === h);
                      return (
                        <th key={h} className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{h}</span>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono lowercase">
                              {meta?.type || 'string'}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono text-slate-700 dark:text-slate-300">
                  {previewRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-3 text-center text-slate-400 text-[11px]">{idx + 1}</td>
                      {dataset.headers.map((h) => (
                        <td key={h} className="py-2 px-3 whitespace-nowrap">
                          {row[h] !== null && row[h] !== undefined ? String(row[h]) : <span className="text-slate-400 italic">null</span>}
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
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
