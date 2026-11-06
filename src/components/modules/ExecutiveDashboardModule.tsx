import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Download,
  Printer,
  Sparkles,
  Award,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Presentation,
  Check,
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

interface ExecutiveDashboardModuleProps {
  dataset: Dataset;
  clusterResult: ClusterResult;
  profiles: ClusterBusinessProfile[];
  dashboard: GlobalExecutiveDashboard;
  context: BusinessContext;
  onPrint: () => void;
  onBack: () => void;
}

export const ExecutiveDashboardModule: React.FC<ExecutiveDashboardModuleProps> = ({
  dataset,
  clusterResult,
  profiles,
  dashboard,
  context,
  onPrint,
  onBack,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(dashboard.executiveSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Módulos 15 y 16: Dashboard Ejecutivo & Suite de Exportación
          </h2>
          <p className="text-sm text-slate-400">
            Resumen de alto nivel, matriz de priorización estratégica y exportación en Excel, CSV, PDF y Presentación.
          </p>
        </div>

        {/* Quick Export Suite Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportToExcel(dataset, clusterResult, profiles, dashboard, context)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 border border-emerald-700/60 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Descargar libro de trabajo Excel con 5 hojas"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => exportToCSV(dataset, clusterResult, profiles)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => exportPresentationDeck(dataset, clusterResult, profiles, dashboard, context)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/80 border border-indigo-700/60 hover:bg-indigo-900 text-indigo-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Descargar diapositivas en formato presentación ejecutiva"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Slides Deck</span>
          </button>

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/80 border border-cyan-700/60 hover:bg-cyan-900 text-cyan-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Macro Scorecard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Entidades Analizadas</span>
          <p className="text-2xl font-bold text-white mt-1 font-mono">
            {clusterResult.assignments.length}
          </p>
          <span className="text-[11px] text-slate-400">{dataset.fileName}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Segmentos Identificados</span>
          <p className="text-2xl font-bold text-indigo-400 mt-1 font-mono">K = {clusterResult.k}</p>
          <span className="text-[11px] text-slate-400">Algoritmo: {clusterResult.algorithm}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Segmento Dominante</span>
          <p className="text-lg font-bold text-cyan-400 mt-1 truncate" title={dashboard.dominantSegment}>
            {dashboard.dominantSegment}
          </p>
          <span className="text-[11px] text-slate-400">Mayor volumen de base</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Índice de Calidad Silhouette</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            {clusterResult.silhouetteScore}
          </p>
          <span className="text-[11px] text-slate-400">Separabilidad estructural</span>
        </div>
      </div>

      {/* Executive Macro Synthesis & Findings */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Síntesis Ejecutiva Global & Hallazgos Estratégicos
            </h3>
          </div>
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Copiado' : 'Copiar texto'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed max-w-4xl">
          {dashboard.executiveSummary}
        </p>

        {/* Quick Wins (0-30 days) and Strategic Bets (30-90 days) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Quick Wins */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400">
              <Award className="w-4 h-4" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                Acciones Inmediatas (Quick Wins: 0 a 30 Días)
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {dashboard.quickWins.map((qw, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono text-emerald-400 font-bold shrink-0">{i + 1}.</span>
                  <span className="leading-snug">{qw}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Strategic Bets */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                Apuestas Estratégicas (30 a 90 Días)
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {dashboard.strategicBets.map((sb, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                  <span className="leading-snug">{sb}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Segment Portfolio Overview & Strategic Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Segments Breakdown Cards */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
            Portafolio Completo de Segmentos Identificados
          </span>

          <div className="space-y-3">
            {profiles.map((p) => (
              <div
                key={p.clusterId}
                style={{ borderLeftColor: p.color }}
                className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 border-l-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-slate-100">{p.businessName}</h5>
                    <span className="text-[10px] text-slate-500 font-mono">Cluster #{p.clusterId + 1}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-200">
                    {p.percentage}% ({p.size} clientes)
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">{p.tagline}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/60">
                  <div>
                    <span className="text-slate-500 font-semibold block">Estrategia Precios:</span>
                    <span className="text-slate-300 line-clamp-1">{p.strategies.pricing}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Estrategia Crecimiento:</span>
                    <span className="text-slate-300 line-clamp-1">{p.strategies.growth}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Prioritization Matrix */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Matriz de Priorización Comercial
            </span>
            <span className="text-[10px] text-slate-500">Valor vs. Esfuerzo</span>
          </div>

          <div className="grid grid-cols-2 gap-3 h-80">
            {/* Quadrant 1: High Value, Low Effort (Quick Wins) */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Quick Wins (Alto Valor / Bajo Esfuerzo)
                </span>
                <p className="text-[11px] text-slate-300 mt-1 font-semibold">
                  {profiles[0]?.businessName || 'Segmento VIP'}
                </p>
              </div>
              <span className="text-[10px] text-emerald-300/80">Proteger margen y fidelizar</span>
            </div>

            {/* Quadrant 2: High Value, High Effort (Strategic Bets) */}
            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/50 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                  Apuestas Clave (Alto Valor / Alto Esfuerzo)
                </span>
                <p className="text-[11px] text-slate-300 mt-1 font-semibold">
                  {profiles[1]?.businessName || 'Segmento en Crecimiento'}
                </p>
              </div>
              <span className="text-[10px] text-indigo-300/80">Cross-sell y up-selling masivo</span>
            </div>

            {/* Quadrant 3: Low Value, Low Effort (Maintenance) */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Mantenimiento Digital (Bajo Esfuerzo)
                </span>
                <p className="text-[11px] text-slate-300 mt-1 font-semibold">
                  {profiles[2]?.businessName || 'Segmento Estable'}
                </p>
              </div>
              <span className="text-[10px] text-slate-500">Autoservicio y flujos automáticos</span>
            </div>

            {/* Quadrant 4: Risk / Attention Required */}
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                  Riesgo / Reactivación Selectiva
                </span>
                <p className="text-[11px] text-slate-300 mt-1 font-semibold">
                  {profiles[profiles.length - 1]?.businessName || 'Segmento en Riesgo'}
                </p>
              </div>
              <span className="text-[10px] text-rose-300/80">Mitigación preventiva de churn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs rounded-xl border border-slate-800 transition-colors cursor-pointer"
        >
          <span>Volver a Perfiles & Estrategias</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToExcel(dataset, clusterResult, profiles, dashboard, context)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar Informe Excel Completo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
