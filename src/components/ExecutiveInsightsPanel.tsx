import React from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { GlobalExecutiveDashboard } from '../types/segmentation';

interface ExecutiveInsightsPanelProps {
  dashboard: GlobalExecutiveDashboard;
  onNavigateToStrategies?: () => void;
}

export const ExecutiveInsightsPanel: React.FC<ExecutiveInsightsPanelProps> = ({
  dashboard,
  onNavigateToStrategies,
}) => {
  const [copied, setCopied] = React.useState(false);
  const { insights } = dashboard;

  const handleCopy = () => {
    const text = `INFORME EJECUTIVO DE SEGMENTACIÓN E INSIGHTS
1. HALLAZGO PRINCIPAL: ${insights.mainFinding}
2. RIESGO PRINCIPAL: ${insights.mainRisk}
3. OPORTUNIDAD PRINCIPAL: ${insights.mainOpportunity}
4. RECOMENDACIÓN PRINCIPAL: ${insights.mainRecommendation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Panel de Hallazgos Clave & Diagnóstico de Negocio
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Síntesis estructurada según estándares de consultoría estratégica directiva.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copiado' : 'Copiar Síntesis'}</span>
        </button>
      </div>

      {/* 4 Pillars Grid (Hallazgo, Riesgo, Oportunidad, Recomendación) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Hallazgo Principal */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Lightbulb className="w-4 h-4" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              1. Hallazgo Principal
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {insights.mainFinding}
          </p>
        </div>

        {/* 2. Riesgo Principal */}
        <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
              2. Riesgo Comercial
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {insights.mainRisk}
          </p>
        </div>

        {/* 3. Oportunidad Principal */}
        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
              3. Oportunidad de Margen
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {insights.mainOpportunity}
          </p>
        </div>

        {/* 4. Recomendación Principal */}
        <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/40 space-y-2">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <CheckCircle2 className="w-4 h-4" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
              4. Recomendación Prioritaria
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {insights.mainRecommendation}
          </p>
        </div>
      </div>
    </div>
  );
};
