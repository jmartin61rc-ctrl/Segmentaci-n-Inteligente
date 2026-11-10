import React from 'react';
import {
  Layers,
  Database,
  Briefcase,
  FileSpreadsheet,
  Download,
  Printer,
  Sparkles,
  Sun,
  Moon,
  Building2,
} from 'lucide-react';
import { BusinessContext, Dataset } from '../types/segmentation';

interface NavbarProps {
  dataset: Dataset | null;
  context: BusinessContext;
  onOpenContextModal: () => void;
  onExportClick: () => void;
  onPrintClick: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  dataset,
  context,
  onOpenContextModal,
  onExportClick,
  onPrintClick,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0c121e]/90 backdrop-blur-md no-print select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left Section: Active Project & Sector Context */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px] sm:max-w-[200px]">
              {context.sector}
            </span>
          </div>

          <button
            onClick={onOpenContextModal}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Cambiar objetivo de negocio y KPI prioritario"
          >
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[180px]">{context.objective}</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400">Modificar</span>
          </button>
        </div>

        {/* Right Actions: Dataset status, Theme Toggle, PDF Print & Export */}
        <div className="flex items-center gap-2 text-xs">
          {dataset && (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
              <Database className="w-3 h-3 text-emerald-500" />
              <span className="truncate max-w-[130px]">{dataset.fileName}</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{dataset.totalRows} reg</span>
            </div>
          )}

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-xs text-xs font-medium"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Cambiar tema de color"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Modo Oscuro</span>
              </>
            )}
          </button>

          <button
            onClick={onPrintClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Generar informe en PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>PDF Ejecutivo</span>
          </button>

          <button
            onClick={onExportClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
