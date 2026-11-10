import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Dataset, DescriptiveStats, SkewnessAssessment } from '../../types/segmentation';
import {
  calculateDescriptiveStats,
  assessSkewness,
  computeHistogram,
} from '../../utils/statistics';

interface DescriptiveModuleProps {
  dataset: Dataset;
  onNext: () => void;
  onBack: () => void;
}

export const DescriptiveModule: React.FC<DescriptiveModuleProps> = ({
  dataset,
  onNext,
  onBack,
}) => {
  const selectedVars = dataset.metadata.filter((m) => m.isSelectedForClustering);
  const selectedVarNames = selectedVars.map((m) => m.name);

  const [activeVarName, setActiveVarName] = useState<string>(selectedVarNames[0] || '');

  // Calculate descriptive stats and skewness for all selected variables
  const statsList: DescriptiveStats[] = useMemo(() => {
    return selectedVarNames.map((vName) => {
      const rawVals = dataset.rows.map((r) => r[vName]);
      return calculateDescriptiveStats(vName, rawVals);
    });
  }, [dataset, selectedVarNames]);

  const skewnessList: SkewnessAssessment[] = useMemo(() => {
    return statsList.map((st) => {
      const vals = dataset.rows
        .map((r) => r[st.variable])
        .filter((v) => typeof v === 'number' && !isNaN(v));
      return assessSkewness(st, vals);
    });
  }, [statsList, dataset]);

  // Active variable statistics and histogram
  const activeStats = statsList.find((s) => s.variable === activeVarName) || statsList[0];
  const activeSkewness = skewnessList.find((s) => s.variable === activeVarName) || skewnessList[0];

  const activeValues = useMemo(() => {
    if (!activeStats) return [];
    return dataset.rows
      .map((r) => r[activeStats.variable])
      .filter((v) => typeof v === 'number' && !isNaN(v));
  }, [dataset, activeStats]);

  const activeHistogram = useMemo(() => {
    return computeHistogram(activeValues, 12);
  }, [activeValues]);

  // Aggregate alerts
  const totalAlerts = statsList.flatMap((s) => s.warnings);
  const totalOutliers = statsList.reduce((acc, s) => acc + s.outliersCount, 0);

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Módulos 5 y 6: Análisis Descriptivo, Reglas de Negocio & Evaluación de Sesgo
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Estadísticos paramétricos y no paramétricos, detección de anomalías y evaluación del impacto en la distancia euclidiana.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 rounded-lg font-mono font-medium">
            {totalOutliers} valores atípicos detectados
          </span>
        </div>
      </div>

      {/* Module 5: Descriptive Table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Tabla de Estadísticos Descriptivos Completos
          </h3>
          <span className="text-xs text-slate-400 font-mono">Percentiles P5 a P95 & IQR</span>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium font-sans">
                  <th className="py-2.5 px-3">Variable</th>
                  <th className="py-2.5 px-3 text-right">Mín</th>
                  <th className="py-2.5 px-3 text-right">Media</th>
                  <th className="py-2.5 px-3 text-right">Mediana</th>
                  <th className="py-2.5 px-3 text-right">Moda</th>
                  <th className="py-2.5 px-3 text-right">Máx</th>
                  <th className="py-2.5 px-3 text-right">Desv. Est.</th>
                  <th className="py-2.5 px-3 text-right">IQR</th>
                  <th className="py-2.5 px-3 text-right">Asimetría (g₁)</th>
                  <th className="py-2.5 px-3 text-right">Curtosis</th>
                  <th className="py-2.5 px-3 text-right">CV%</th>
                  <th className="py-2.5 px-3 text-center">Outliers (1.5×IQR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {statsList.map((st) => (
                  <tr
                    key={st.variable}
                    onClick={() => setActiveVarName(st.variable)}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                      activeVarName === st.variable ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-200 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${activeVarName === st.variable ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-300 dark:bg-slate-700'}`} />
                        {st.variable}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 dark:text-slate-400">{st.min}</td>
                    <td className="py-2.5 px-3 text-right text-blue-700 dark:text-blue-300 font-bold">{st.mean}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">{st.median}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500 dark:text-slate-400">{st.mode}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500 dark:text-slate-400">{st.max}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500 dark:text-slate-400">{st.stdDev}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500 dark:text-slate-400">{st.iqr}</td>
                    <td className={`py-2.5 px-3 text-right ${Math.abs(st.skewness) > 1.2 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                      {st.skewness}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 dark:text-slate-400">{st.kurtosis}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500 dark:text-slate-400">{st.cv}%</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${st.outliersCount > 0 ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                        {st.outliersCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Business Rules & Anomaly Alerts */}
      {totalAlerts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              Alertas de Reglas de Negocio & Datos Inconsistentes
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {totalAlerts.map((alt, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-amber-200/60 dark:border-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">{alt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Module 6: Graphical Analysis & Skewness Assessment Inspector */}
      {activeStats && activeSkewness && (
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Módulo 6: Histograma & Diagnóstico de Sesgo</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono">[{activeStats.variable}]</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Seleccione cualquier variable para inspeccionar su distribución de frecuencia y el sesgo.
              </p>
            </div>

            {/* Variable Dropdown */}
            <select
              value={activeVarName}
              onChange={(e) => setActiveVarName(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            >
              {selectedVarNames.map((vn) => (
                <option key={vn} value={vn}>
                  {vn}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Histogram Chart (Power BI / Tableau style) */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Distribución de Frecuencias (12 Bins)</span>
                <span className="font-mono text-slate-400">
                  Rango: [{activeStats.min} a {activeStats.max}]
                </span>
              </div>

              {/* Bar Histogram */}
              <div className="h-44 flex items-end gap-1.5 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                {activeHistogram.map((bin, i) => {
                  const maxCount = Math.max(...activeHistogram.map((b) => b.count), 1);
                  const heightPct = (bin.count / maxCount) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center group relative h-full justify-end"
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-20 font-mono">
                        {bin.label}: {bin.count} reg ({Math.round(bin.density * 100)}%)
                      </div>
                      <div
                        style={{ height: `${Math.max(4, heightPct)}%` }}
                        className="w-full bg-blue-600 dark:bg-blue-500 rounded-t-sm group-hover:bg-blue-700 dark:group-hover:bg-blue-400 transition-all"
                      />
                    </div>
                  );
                })}
              </div>

              {/* X Axis labels */}
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Mín: {activeStats.min}</span>
                <span>Media: {activeStats.mean}</span>
                <span>Mediana: {activeStats.median}</span>
                <span>Máx: {activeStats.max}</span>
              </div>
            </div>

            {/* Skewness Diagnostic Box */}
            <div className="lg:col-span-5 space-y-3">
              <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Diagnóstico de Asimetría</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    g₁ = {activeSkewness.skewness.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activeSkewness.label}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{activeSkewness.explanation}</p>
                </div>

                {/* Mathematical Impact on Clustering */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                    Impacto sobre el Algoritmo
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {activeSkewness.clusteringImpact}
                  </p>
                </div>

                {/* Recommendation */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Transformación sugerida:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold uppercase">
                    {activeSkewness.recommendedTransform === 'none'
                      ? 'Ninguna'
                      : activeSkewness.recommendedTransform}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Contexto</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <span>Continuar a Transformación & Estandarización</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
