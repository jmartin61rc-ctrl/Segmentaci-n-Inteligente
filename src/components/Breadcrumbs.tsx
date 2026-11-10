import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { AppNavView, BusinessContext, Dataset } from '../types/segmentation';

interface BreadcrumbsProps {
  currentView: AppNavView;
  context: BusinessContext;
  dataset: Dataset | null;
  onNavigate: (view: AppNavView) => void;
  selectedK: number;
}

const VIEW_TITLES: Record<AppNavView, { label: string; section: string }> = {
  dashboard: { label: 'Dashboard Ejecutivo & KPIs', section: 'Visión General' },
  upload: { label: 'Carga de Información', section: 'Datos & Calidad' },
  exploration: { label: 'Exploración Inicial & Muestreo', section: 'Datos & Calidad' },
  validation: { label: 'Validación de Variables de Clustering', section: 'Datos & Calidad' },
  transformation: { label: 'Transformación de Datos & Estandarización', section: 'Datos & Calidad' },
  selection_k: { label: 'Selección Óptima de Clusters (K)', section: 'Machine Learning' },
  clustering: { label: 'Modelo de Clustering & Proyección PCA', section: 'Machine Learning' },
  profiles: { label: 'Fichas Ejecutivas de Segmentos', section: 'Inteligencia de Negocio' },
  strategies: { label: 'Estrategias Comerciales Asistidas por IA', section: 'Inteligencia de Negocio' },
  reports: { label: 'Reportes Consultoría & Exportación', section: 'Gobernanza' },
  settings: { label: 'Contexto de Industria & Objetivos', section: 'Configuración' },
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  currentView,
  context,
  dataset,
  onNavigate,
  selectedK,
}) => {
  const currentInfo = VIEW_TITLES[currentView] || { label: 'Inicio', section: 'Plataforma' };

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 no-print py-1"
    >
      <button
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
      >
        <Home className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
        <span className="font-medium">Inicio</span>
      </button>

      <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 shrink-0" />

      <button
        onClick={() => onNavigate('settings')}
        className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer font-medium truncate max-w-[150px]"
        title={context.sector}
      >
        {context.sector}
      </button>

      <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 shrink-0" />

      <span className="text-slate-400 dark:text-slate-400 hidden sm:inline truncate">
        {currentInfo.section}
      </span>

      <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 shrink-0 hidden sm:inline" />

      <span className="text-slate-900 dark:text-slate-100 font-semibold truncate">
        {currentInfo.label}
      </span>

      {currentView === 'clustering' && (
        <>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-blue-600 dark:text-blue-400 font-mono text-[11px] font-semibold">
            K={selectedK}
          </span>
        </>
      )}
    </nav>
  );
};
