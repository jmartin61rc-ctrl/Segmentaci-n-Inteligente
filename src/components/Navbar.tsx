import React from 'react';
import {
  Layers,
  Database,
  Briefcase,
  FileSpreadsheet,
  Download,
  Printer,
  Sparkles,
} from 'lucide-react';
import { BusinessContext, Dataset } from '../types/segmentation';

interface NavbarProps {
  dataset: Dataset | null;
  context: BusinessContext;
  onOpenContextModal: () => void;
  onExportClick: () => void;
  onPrintClick: () => void;
  activeStep: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  dataset,
  context,
  onOpenContextModal,
  onExportClick,
  onPrintClick,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-100 tracking-tight">
                Intelligent Segmentation
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3" /> Enterprise AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Plataforma de Clustering y Acciones de Negocio
            </p>
          </div>
        </div>

        {/* Center: Context & Active Dataset */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          {dataset && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium truncate max-w-[180px]">{dataset.fileName}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{dataset.totalRows} registros</span>
            </div>
          )}

          <button
            onClick={onOpenContextModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Editar sector y objetivo de negocio"
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate max-w-[160px] font-medium">{context.sector}</span>
            <span className="text-slate-500">·</span>
            <span className="text-indigo-400 truncate max-w-[140px]">{context.objective}</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrintClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Imprimir o guardar reporte ejecutivo en PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Reporte PDF</span>
          </button>

          <button
            onClick={onExportClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
