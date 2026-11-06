import React from 'react';
import {
  Upload,
  CheckCircle2,
  Briefcase,
  BarChart3,
  SlidersHorizontal,
  Compass,
  Cpu,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';

export interface StepItem {
  id: number;
  title: string;
  shortTitle: string;
  modules: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const WORKFLOW_STEPS: StepItem[] = [
  {
    id: 1,
    title: 'Carga & Exploración',
    shortTitle: '1. Carga',
    modules: 'Módulos 1 y 2',
    icon: Upload,
  },
  {
    id: 2,
    title: 'Variables de Clustering',
    shortTitle: '2. Variables',
    modules: 'Módulo 3',
    icon: CheckCircle2,
  },
  {
    id: 3,
    title: 'Contexto de Negocio',
    shortTitle: '3. Contexto',
    modules: 'Módulo 4',
    icon: Briefcase,
  },
  {
    id: 4,
    title: 'Estadística & Sesgo',
    shortTitle: '4. Estadística',
    modules: 'Módulos 5 y 6',
    icon: BarChart3,
  },
  {
    id: 5,
    title: 'Transformación & Escala',
    shortTitle: '5. Escala',
    modules: 'Módulos 7 y 8',
    icon: SlidersHorizontal,
  },
  {
    id: 6,
    title: 'Número Óptimo de K',
    shortTitle: '6. Selección K',
    modules: 'Módulos 9 y 10',
    icon: Compass,
  },
  {
    id: 7,
    title: 'Ejecución de Clustering',
    shortTitle: '7. Algoritmos',
    modules: 'Módulo 11',
    icon: Cpu,
  },
  {
    id: 8,
    title: 'Perfiles & Estrategias IA',
    shortTitle: '8. Perfiles IA',
    modules: 'Módulos 12, 13 y 14',
    icon: Sparkles,
  },
  {
    id: 9,
    title: 'Dashboard Ejecutivo',
    shortTitle: '9. Dashboard',
    modules: 'Módulos 15 y 16',
    icon: LayoutDashboard,
  },
];

interface WorkflowStepperProps {
  currentStep: number;
  onStepChange: (stepId: number) => void;
  maxReachedStep: number;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStep,
  onStepChange,
  maxReachedStep,
}) => {
  return (
    <div className="w-full bg-slate-900/60 border-b border-slate-800/80 px-4 py-2.5 overflow-x-auto scrollbar-none no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[780px] gap-1">
        {WORKFLOW_STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = step.id < currentStep;
          const isAccessible = step.id <= maxReachedStep;

          return (
            <button
              key={step.id}
              onClick={() => isAccessible && onStepChange(step.id)}
              disabled={!isAccessible}
              className={`flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-indigo-600/15 border border-indigo-500/40 text-indigo-300'
                  : isAccessible
                  ? 'hover:bg-slate-800/70 text-slate-400 hover:text-slate-200 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed text-slate-600'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/40'
                    : isCompleted
                    ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <p className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {step.shortTitle}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{step.modules}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
