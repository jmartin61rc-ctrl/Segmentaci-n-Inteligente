import React, { useMemo } from 'react';
import {
  Compass,
  Activity,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Columns,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  OptimalKRecommendation,
} from '../../types/segmentation';

interface OptimalKModuleProps {
  recommendation: OptimalKRecommendation;
  selectedK: number;
  onSelectK: (k: number) => void;
  onOpenScenarioComparison: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const OptimalKModule: React.FC<OptimalKModuleProps> = ({
  recommendation,
  selectedK,
  onSelectK,
  onOpenScenarioComparison,
  onNext,
  onBack,
}) => {
  const { metrics, recommendedK, elbowK, silhouetteK, gapK, confidence, explanation } =
    recommendation;

  const maxWss = useMemo(() => Math.max(...metrics.map((m) => m.wss), 1), [metrics]);
  const maxSil = useMemo(() => Math.max(...metrics.map((m) => m.silhouette), 0.1), [metrics]);
  const maxGap = useMemo(() => Math.max(...metrics.map((m) => m.gap), 0.1), [metrics]);

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Módulos 9 y 10: Selección Multicriterio del Número de Clusters (K)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evaluación simultánea mediante Método del Codo (WSS), Silueta Promedio y GAP Statistic con consenso asistido.
          </p>
        </div>
        <button
          onClick={onOpenScenarioComparison}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <Columns className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Comparar Escenarios Estadístico vs. Negocio</span>
        </button>
      </div>

      {/* Consensus Recommendation Banner */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#0f172a] border border-blue-200 dark:border-blue-800/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                Consenso Multicriterio Estadístico
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recomendación Óptima del Modelo: K = {recommendedK} Segmentos
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-mono font-semibold">
              Confianza del Algoritmo: {confidence}%
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">{explanation}</p>

        {/* 3 Core Methods Summary pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">1. Método del Codo (WSS):</span>
            <span className="font-mono font-bold text-blue-700 dark:text-blue-300">K = {elbowK}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">2. Coeficiente Silueta:</span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">K = {silhouetteK}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">3. GAP Statistic:</span>
            <span className="font-mono font-bold text-blue-700 dark:text-blue-300">K = {gapK}</span>
          </div>
        </div>
      </div>

      {/* Module 9: 3 Simultaneous Analytical Curves */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2">
          <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Módulo 9: Métricas de Validación Interna de Clusters (K = 2 a 8)
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Curve 1: Elbow WSS */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">1. Método del Codo (WSS)</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">Inercia intra-grupo</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Suma de distancias al cuadrado. El codo marca el punto óptimo de retorno decreciente.
            </p>

            <div className="h-32 flex items-end gap-2 pt-4 pb-1 border-b border-slate-200 dark:border-slate-800">
              {metrics.map((m) => {
                const heightPct = (m.wss / maxWss) * 100;
                const isElbow = m.k === elbowK;
                return (
                  <div
                    key={m.k}
                    onClick={() => onSelectK(m.k)}
                    className="flex-1 flex flex-col items-center group relative cursor-pointer h-full justify-end"
                  >
                    <div
                      style={{ height: `${Math.max(6, heightPct)}%` }}
                      className={`w-full rounded-t-sm transition-all ${
                        isElbow
                          ? 'bg-blue-600 dark:bg-blue-500'
                          : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400'
                      }`}
                    />
                    <span className={`text-[10px] font-mono mt-1 ${isElbow ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400'}`}>
                      k={m.k}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex justify-between">
              <span>WSS K=2: {metrics[0]?.wss}</span>
              <span>WSS K=8: {metrics[metrics.length - 1]?.wss}</span>
            </div>
          </div>

          {/* Curve 2: Silhouette */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">2. Coeficiente de Silueta</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Separabilidad (0 a 1)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Mide cuán similar es un punto a su propio cluster comparado con otros clusters.
            </p>

            <div className="h-32 flex items-end gap-2 pt-4 pb-1 border-b border-slate-200 dark:border-slate-800">
              {metrics.map((m) => {
                const heightPct = (m.silhouette / maxSil) * 100;
                const isSilBest = m.k === silhouetteK;
                return (
                  <div
                    key={m.k}
                    onClick={() => onSelectK(m.k)}
                    className="flex-1 flex flex-col items-center group relative cursor-pointer h-full justify-end"
                  >
                    <div
                      style={{ height: `${Math.max(6, heightPct)}%` }}
                      className={`w-full rounded-t-sm transition-all ${
                        isSilBest
                          ? 'bg-emerald-600 dark:bg-emerald-500'
                          : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400'
                      }`}
                    />
                    <span className={`text-[10px] font-mono mt-1 ${isSilBest ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      k={m.k}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex justify-between">
              <span>Sil K={silhouetteK}: {metrics.find((m) => m.k === silhouetteK)?.silhouette}</span>
              <span>Mayor cohesión</span>
            </div>
          </div>

          {/* Curve 3: GAP Statistic */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">3. GAP Statistic</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">Referencia Nula</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Compara el log(WSS) real contra una distribución uniforme nula sin agrupamiento.
            </p>

            <div className="h-32 flex items-end gap-2 pt-4 pb-1 border-b border-slate-200 dark:border-slate-800">
              {metrics.map((m) => {
                const heightPct = Math.max(10, (m.gap / maxGap) * 100);
                const isGapBest = m.k === gapK;
                return (
                  <div
                    key={m.k}
                    onClick={() => onSelectK(m.k)}
                    className="flex-1 flex flex-col items-center group relative cursor-pointer h-full justify-end"
                  >
                    <div
                      style={{ height: `${Math.max(6, heightPct)}%` }}
                      className={`w-full rounded-t-sm transition-all ${
                        isGapBest
                          ? 'bg-blue-600 dark:bg-blue-500'
                          : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400'
                      }`}
                    />
                    <span className={`text-[10px] font-mono mt-1 ${isGapBest ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400'}`}>
                      k={m.k}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex justify-between">
              <span>GAP K={gapK}: {metrics.find((m) => m.k === gapK)?.gap}</span>
              <span>Diferencia nula</span>
            </div>
          </div>
        </div>
      </section>

      {/* Module 10: Business Cluster Selection & Decision */}
      <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Módulo 10: Decisión Final de Clusters (Negocio vs. Estadística)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Puede aceptar la sugerencia matemática ({recommendedK}) o fijar un K manual según la capacidad de ejecución comercial de su equipo.
            </p>
          </div>
        </div>

        {/* Selection interactive buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {metrics.map((m) => {
            const isSelected = selectedK === m.k;
            const isStatRecommended = m.k === recommendedK;

            return (
              <button
                key={m.k}
                onClick={() => onSelectK(m.k)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 shadow-xs ring-1 ring-blue-600/30'
                    : 'bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">K = {m.k}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </div>

                <div className="mt-2 space-y-0.5 text-[11px] font-mono">
                  <span className="text-slate-500 dark:text-slate-400 block">Sil: {m.silhouette}</span>
                  <span className="text-slate-400 dark:text-slate-400 block truncate">WSS: {m.wss}</span>
                </div>

                {isStatRecommended && (
                  <span className="mt-2 block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
                    ★ Óptimo
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Trade-off summary note */}
        <div className="p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Evaluación de Capacidad Operativa para K = {selectedK}:
            </span>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-[11px] leading-relaxed">
              {selectedK <= 3
                ? 'Alta simplicidad operativa: ideal para fuerzas de ventas reducidas con presupuestos de campaña concentrados.'
                : selectedK <= 5
                ? 'Balance óptimo: permite crear ofertas y campañas diferenciadas sin fragmentar en exceso la gestión comercial.'
                : 'Alta granularidad analítica: requiere equipos de marketing dedicados para atender a cada micro-segmento sin dilución.'}
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Escala</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <span>Ejecutar Clustering con K = {selectedK}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
