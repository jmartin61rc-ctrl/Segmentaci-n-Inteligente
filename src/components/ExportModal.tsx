import React from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Presentation,
  Printer,
  FileText,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Módulo 16: Exportación de Resultados
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Descargue los análisis, asignaciones de cluster y perfiles en múltiples formatos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options */}
        <div className="p-6 space-y-3">
          {/* Option 1: Excel */}
          <div
            onClick={() => {
              if (isReady) {
                exportToExcel(dataset, clusterResult, profiles, dashboard, context);
                onClose();
              }
            }}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isReady
                ? 'bg-emerald-950/20 border-emerald-800/60 hover:bg-emerald-950/40 text-slate-100'
                : 'opacity-50 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Libro Excel Multihabilidades (.xlsx)</h4>
                <p className="text-xs text-slate-400">
                  5 hojas: Resumen Ejecutivo, Perfiles, Estrategias, Centroides y Base Segmentada.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-400">Descargar →</span>
          </div>

          {/* Option 2: CSV */}
          <div
            onClick={() => {
              if (isReady) {
                exportToCSV(dataset, clusterResult, profiles);
                onClose();
              }
            }}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isReady
                ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950 text-slate-100'
                : 'opacity-50 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Dataset Segmentado en CSV</h4>
                <p className="text-xs text-slate-400">
                  Columnas originales + CLUSTER_ID y NOMBRE_SEGMENTO para ingesta en CRM o BI.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-300">Descargar →</span>
          </div>

          {/* Option 3: PowerPoint / Presentation Deck */}
          <div
            onClick={() => {
              if (isReady) {
                exportPresentationDeck(dataset, clusterResult, profiles, dashboard, context);
                onClose();
              }
            }}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isReady
                ? 'bg-indigo-950/20 border-indigo-800/60 hover:bg-indigo-950/40 text-slate-100'
                : 'opacity-50 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400 shrink-0">
                <Presentation className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Presentación Ejecutiva (Deck Slides)</h4>
                <p className="text-xs text-slate-400">
                  Diapositivas formateadas con resumen ejecutivo, portafolio y estrategias comerciales.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-indigo-400">Descargar →</span>
          </div>

          {/* Option 4: PDF Print */}
          <div
            onClick={() => {
              onClose();
              onPrint();
            }}
            className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950 flex items-center justify-between cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Imprimir / Guardar en PDF</h4>
                <p className="text-xs text-slate-400">
                  Genera la vista de impresión optimizada sin elementos interactivos.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-cyan-400">Imprimir →</span>
          </div>
        </div>
      </div>
    </div>
  );
};
