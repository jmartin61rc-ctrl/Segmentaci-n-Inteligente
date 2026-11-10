import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Sparkles,
  Award,
  TrendingUp,
  Presentation,
  Check,
  Copy,
  Layers,
  Star,
  Activity,
  ArrowRight,
} from 'lucide-react';
import {
  BusinessContext,
  ClusterBusinessProfile,
  ClusterResult,
  Dataset,
  GlobalExecutiveDashboard,
} from '../../types/segmentation';
import {
  exportToExcel,
  exportToCSV,
  exportPresentationDeck,
} from '../../utils/export';
import { ExecutiveInsightsPanel } from '../ExecutiveInsightsPanel';

interface ExecutiveDashboardModuleProps {
  dataset: Dataset;
  clusterResult: ClusterResult;
  profiles: ClusterBusinessProfile[];
  dashboard: GlobalExecutiveDashboard;
  context: BusinessContext;
  onPrint: () => void;
  onNavigateView?: (view: any) => void;
}

export const ExecutiveDashboardModule: React.FC<ExecutiveDashboardModuleProps> = ({
  dataset,
  clusterResult,
  profiles,
  dashboard,
  context,
  onPrint,
  onNavigateView,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(dashboard.executiveSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const { silhouetteQuality } = dashboard;

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100">
      {/* Top Section: Dashboard Title & Export CTAs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-mono">
              Sector: {context.sector}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Objetivo: {context.objective}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Dashboard Ejecutivo de Segmentación
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Métricas de cartera, diagnóstico de segmentación y directrices comerciales de alta dirección.
          </p>
        </div>

        {/* Export Suite Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportToExcel(dataset, clusterResult, profiles, dashboard, context)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Descargar libro de trabajo Excel con 5 hojas ejecutivas"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => exportToCSV(dataset, clusterResult, profiles)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => exportPresentationDeck(dataset, clusterResult, profiles, dashboard, context)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Descargar presentación de diapositivas tipo consultoría"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Deck Ejecutivo</span>
          </button>

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir PDF</span>
          </button>
        </div>
      </div>

      {/* 5 Core Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Registros cargados */}
        <div className="p-4 rounded-xl border bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Registros Cargados
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {clusterResult.assignments.length.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
            {dataset.fileName}
          </span>
        </div>

        {/* KPI 2: Variables analizadas */}
        <div className="p-4 rounded-xl border bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Variables Analizadas
          </span>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
            {clusterResult.featuresUsed.length}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
            Continuas & escalares aptas
          </span>
        </div>

        {/* KPI 3: Número óptimo de clusters */}
        <div className="p-4 rounded-xl border bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Segmentos (K)
          </span>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              K = {clusterResult.k}
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Validado
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
            Algoritmo: {clusterResult.algorithm.toUpperCase()}
          </span>
        </div>

        {/* KPI 4: Calidad de segmentación (con traducción visual inteligente) */}
        <div className="p-4 rounded-xl border bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-xs space-y-1 sm:col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Calidad de Segmentación
          </span>
          <div className="flex items-center gap-1.5">
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {clusterResult.silhouetteScore.toFixed(2)}
            </p>
            <div className="flex items-center text-amber-500 dark:text-amber-400">
              {Array.from({ length: silhouetteQuality?.ratingStars || 4 }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold leading-tight line-clamp-1">
            {silhouetteQuality?.label || 'Excelente calidad de segmentación'}
          </p>
        </div>

        {/* KPI 5: Estabilidad del modelo */}
        <div className="p-4 rounded-xl border bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-xs space-y-1 sm:col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Estabilidad del Modelo
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Alta Estabilidad
            </p>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate font-mono">
            Convergencia intra-cluster
          </span>
        </div>
      </div>

      {/* Panel de Hallazgos Clave (Executive Insights Panel) */}
      <ExecutiveInsightsPanel dashboard={dashboard} />

      {/* Fichas Ejecutivas de Segmentos (Corporate Style Cards like Bain/McKinsey) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Fichas Ejecutivas de Segmentos Identificados
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cada cluster perfilado con valor de cartera, factores característicos y recomendación accionable.
            </p>
          </div>
          {onNavigateView && (
            <button
              onClick={() => onNavigateView('profiles')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver detalle completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p, idx) => {
            const isHighestValue = idx === 0;
            const isRisk = idx === profiles.length - 1;

            return (
              <div
                key={p.clusterId}
                className="rounded-xl border bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                {/* Header of Segment Card */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Cluster {p.clusterId + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {p.percentage}% ({p.size} clientes)
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {p.businessName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    {p.tagline}
                  </p>
                </div>

                {/* Behavioral Bullets */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <div className="flex items-start gap-1.5">
                    <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">·</span>
                    <span className="leading-snug">
                      <strong>Potencial:</strong> {p.executiveProfile.commercialPotential}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">·</span>
                    <span className="leading-snug">
                      <strong>Diferenciador:</strong> {p.executiveProfile.keyDifferentiators}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold shrink-0">·</span>
                    <span className="leading-snug">
                      <strong>Riesgo:</strong> {p.executiveProfile.associatedRisks}
                    </span>
                  </div>
                </div>

                {/* Priority Action Callout */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/60 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                    Recomendación de Alto Impacto
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug">
                    {p.strategies.pricing}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Corporate Visualizations: Cluster Breakdown & Prioritization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Relative Size & Volume Bar */}
        <div className="lg:col-span-6 rounded-xl border bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Distribución de Volumen de Cartera (Power BI Style)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">K = {clusterResult.k}</span>
          </div>

          <div className="space-y-3.5">
            {profiles.map((p) => (
              <div key={p.clusterId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {p.businessName}
                  </span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">
                    {p.size} ({p.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${p.percentage}%` }}
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap de Implementación (0-30d y 30-90d) */}
        <div className="lg:col-span-6 rounded-xl border bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Plan de Ejecución Inmediato (Roadmap 30-90 Días)
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Priorizado
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                Fase 1: Quick Wins (0 a 30 Días)
              </span>
              <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc pl-4 leading-snug">
                {dashboard.quickWins.map((qw, i) => (
                  <li key={i}>{qw}</li>
                ))}
              </ul>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block mb-1">
                Fase 2: Apuestas Estratégicas (30 a 90 Días)
              </span>
              <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc pl-4 leading-snug">
                {dashboard.strategicBets.map((sb, i) => (
                  <li key={i}>{sb}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
