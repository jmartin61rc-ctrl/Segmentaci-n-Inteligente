import React from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Presentation,
  Printer,
} from 'lucide-react';
import {
  BusinessContext,
  ClusterBusinessProfile,
  ClusterResult,
  Dataset,
  GlobalExecutiveDashboard,
} from '../types/segmentation';
import {
  exportToExcel,
  exportToCSV,
  exportPresentationDeck,
} from '../utils/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: Dataset | null;
  clusterResult: ClusterResult | null;
  profiles: ClusterBusinessProfile[];
  dashboard: GlobalExecutiveDashboard | null;
  context: BusinessContext;
  onPrint: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  dataset,
  clusterResult,
  profiles,
  dashboard,
  context,
  onPrint,
}) => {
  if (!isOpen) return null;

  const isReady = dataset && clusterResult && dashboard;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Módulo 16: Centro de Exportación & Entregables
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Descargue los análisis, asignaciones de cluster y perfiles en formatos de alta dirección.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options */}
        <div className="p-5 space-y-3">
          {/* Option 1: Excel */}
          <div
            onClick={() => {
              if (isReady) {
                exportToExcel(dataset, clusterResult, profiles, dashboard, context);
                onClose();
              }
            }}
            className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isReady
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100/60'
                : 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Libro Excel Multihabilidades (.xlsx)</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  5 hojas: Resumen Ejecutivo, Perfiles, Estrategias, Centroides y Base Segmentada.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Descargar →</span>
          </div>

          {/* Option 2: CSV */}
          <div
            onClick={() => {
              if (isReady) {
                exportToCSV(dataset, clusterResult, profiles);
                onClose();
              }
            }}
            className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isReady
                ? 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                : 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Dataset Segmentado en CSV</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Columnas originales + CLUSTER_ID y NOMBRE_SEGMENTO para ingesta en CRM o BI.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Descargar →</span>
          </div>

          {/* Option 3: PowerPoint / Presentation Deck */}
          <div
            onClick={() => {
              if (isReady) {
                exportPresentationDeck(dataset, clusterResult, profiles, dashboard, context);
                onClose();
              }
            }}
            className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isReady
                ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60 hover:bg-blue-100/60'
                : 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                <Presentation className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Presentación Consultoría (Deck Slides)</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Diapositivas estilo McKinsey / Bain con portafolio de segmentos y roadmap de 30-90 días.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Descargar →</span>
          </div>

          {/* Option 4: PDF Print */}
          <div
            onClick={() => {
              onClose();
              onPrint();
            }}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Imprimir / Guardar en PDF</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Genera la vista de impresión optimizada sin elementos interactivos.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Imprimir →</span>
          </div>
        </div>
      </div>
    </div>
  );
};
