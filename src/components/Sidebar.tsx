import React from 'react';
import {
  LayoutDashboard,
  Upload,
  Table,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  Cpu,
  Users,
  Sparkles,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { AppNavView, Dataset } from '../types/segmentation';

interface SidebarProps {
  currentView: AppNavView;
  onViewChange: (view: AppNavView) => void;
  dataset: Dataset | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  selectedK: number;
}

interface NavItem {
  id: AppNavView;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  dataset,
  isCollapsed,
  onToggleCollapse,
  selectedK,
}) => {
  const sections: NavSection[] = [
    {
      title: 'VISIÓN EJECUTIVA',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Ejecutivo',
          shortLabel: 'Dashboard',
          icon: LayoutDashboard,
          badge: 'Principal',
        },
      ],
    },
    {
      title: 'DATOS & CALIDAD',
      items: [
        {
          id: 'upload',
          label: 'Carga de Información',
          shortLabel: 'Carga',
          icon: Upload,
        },
        {
          id: 'exploration',
          label: 'Exploración Inicial',
          shortLabel: 'Exploración',
          icon: Table,
          badge: dataset ? `${dataset.totalRows}` : undefined,
        },
        {
          id: 'validation',
          label: 'Validación de Variables',
          shortLabel: 'Variables',
          icon: CheckCircle2,
        },
        {
          id: 'transformation',
          label: 'Transformación & Escala',
          shortLabel: 'Escala',
          icon: SlidersHorizontal,
        },
      ],
    },
    {
      title: 'MACHINE LEARNING',
      items: [
        {
          id: 'selection_k',
          label: 'Selección Óptima de K',
          shortLabel: 'Selección K',
          icon: Compass,
        },
        {
          id: 'clustering',
          label: 'Modelo de Clustering',
          shortLabel: 'Clustering',
          icon: Cpu,
          badge: `K=${selectedK}`,
        },
      ],
    },
    {
      title: 'INTELIGENCIA DE NEGOCIO',
      items: [
        {
          id: 'profiles',
          label: 'Fichas de Segmentos',
          shortLabel: 'Segmentos',
          icon: Users,
        },
        {
          id: 'strategies',
          label: 'Estrategias Comerciales IA',
          shortLabel: 'Estrategias',
          icon: Sparkles,
        },
      ],
    },
    {
      title: 'GOBERNANZA & SALIDAS',
      items: [
        {
          id: 'reports',
          label: 'Reportes & Exportación',
          shortLabel: 'Reportes',
          icon: FileText,
        },
        {
          id: 'settings',
          label: 'Contexto & Parámetros',
          shortLabel: 'Configuración',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <aside
      className={`relative z-30 flex flex-col shrink-0 border-r transition-all duration-200 no-print select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-white dark:bg-[#0c121e] border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-200 dark:border-slate-800/80">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-blue-500/20 shrink-0">
              <span className="tracking-tight">IS</span>
            </div>
            <div className="truncate">
              <span className="font-semibold text-xs tracking-tight text-slate-900 dark:text-white block truncate">
                Intelligent Segmentation
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate">
                Enterprise Analytics Platform
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            <span>IS</span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-0.5">
            {!isCollapsed && (
              <p className="px-2.5 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-400 uppercase">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-200'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-400'
                    }`}
                  />
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between overflow-hidden">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                            isActive
                              ? 'bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Status */}
      {!isCollapsed ? (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-emerald-500" />
              <span>Base Activa</span>
            </span>
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
              {dataset ? `${dataset.totalRows} filas` : 'Sin datos'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-blue-500" />
              <span>Gobernanza</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Auditado
            </span>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-200 dark:border-slate-800/80 flex justify-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500" title="Sistema Activo" />
        </div>
      )}
    </aside>
  );
};
