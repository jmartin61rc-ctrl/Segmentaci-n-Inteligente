import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  Scale,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import {
  Dataset,
  ScalingMethod,
  TransformationType,
} from '../../types/segmentation';
import { applyTransformation } from '../../utils/transformations';
import { computeHistogram } from '../../utils/statistics';

interface TransformationModuleProps {
  dataset: Dataset;
  transformations: Record<string, TransformationType>;
  onUpdateTransformations: (transforms: Record<string, TransformationType>) => void;
  scalingMethod: ScalingMethod;
  onUpdateScalingMethod: (method: ScalingMethod) => void;
  onNext: () => void;
  onBack: () => void;
}

export const TransformationModule: React.FC<TransformationModuleProps> = ({
  dataset,
  transformations,
  onUpdateTransformations,
  scalingMethod,
  onUpdateScalingMethod,
  onNext,
  onBack,
}) => {
  const selectedVars = dataset.metadata.filter((m) => m.isSelectedForClustering);
  const selectedVarNames = selectedVars.map((m) => m.name);

  const [activeVarName, setActiveVarName] = useState<string>(selectedVarNames[0] || '');

  // Active variable raw values
  const rawValues = useMemo(() => {
    return dataset.rows
      .map((r) => r[activeVarName])
      .filter((v) => typeof v === 'number' && !isNaN(v));
  }, [dataset, activeVarName]);

  const currentTransform = transformations[activeVarName] || 'none';

  // Transformed values
  const transformResult = useMemo(() => {
    return applyTransformation(rawValues, currentTransform);
  }, [rawValues, currentTransform]);

  // Histograms before & after
  const beforeHistogram = useMemo(() => computeHistogram(rawValues, 10), [rawValues]);
  const afterHistogram = useMemo(
    () => computeHistogram(transformResult.transformed, 10),
    [transformResult.transformed]
  );

  // Auto-recommend transforms across all variables based on skewness
  const handleAutoRecommendTransforms = () => {
    const newTransforms: Record<string, TransformationType> = {};
    for (const vName of selectedVarNames) {
      const vals = dataset.rows
        .map((r) => r[vName])
        .filter((v) => typeof v === 'number' && !isNaN(v));

      if (vals.length < 3) {
        newTransforms[vName] = 'none';
        continue;
      }

      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const std = Math.sqrt(vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length) || 1;
      const skew = vals.reduce((a, b) => a + Math.pow((b - mean) / std, 3), 0) / vals.length;
      const min = Math.min(...vals);

      if (skew > 1.2) {
        newTransforms[vName] = min > 0 ? 'log' : min >= 0 ? 'log1p' : 'yeojohnson';
      } else if (skew > 0.6) {
        newTransforms[vName] = min >= 0 ? 'sqrt' : 'yeojohnson';
      } else if (skew < -0.8) {
        newTransforms[vName] = 'yeojohnson';
      } else {
        newTransforms[vName] = 'none';
      }
    }
    onUpdateTransformations(newTransforms);
  };

  const handleTransformChange = (varName: string, tType: TransformationType) => {
    onUpdateTransformations({
      ...transformations,
      [varName]: tType,
    });
  };

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Módulos 7 y 8: Transformación de Datos & Estandarización
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ajuste de asimetría (Log, Raíz, Box-Cox, Yeo-Johnson) y estandarización a rango homogéneo (Min-Max por defecto).
          </p>
        </div>
        <button
          onClick={handleAutoRecommendTransforms}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Auto-optimizar todas las variables</span>
        </button>
      </div>

      {/* Module 7: Data Transformations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Módulo 7: Transformación No Lineal de Variables
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Variable en análisis:</span>
        </div>

        {/* Variable Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
          {selectedVarNames.map((vName) => {
            const t = transformations[vName] || 'none';
            const isActive = activeVarName === vName;
            return (
              <button
                key={vName}
                onClick={() => setActiveVarName(vName)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <span>{vName}</span>
                {t !== 'none' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-mono">
                    {t}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Variable Transformation Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Options */}
          <div className="lg:col-span-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2.5 shadow-xs">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 block">
              Seleccione la transformación para &apos;{activeVarName}&apos;:
            </span>

            {[
              { id: 'none', label: 'Ninguna (Original)', desc: 'Mantiene valores en su escala cruda.' },
              { id: 'log', label: 'Logarítmica ln(x)', desc: 'Ideal para sesgo positivo con valores positivos.' },
              { id: 'log1p', label: 'Log(1 + x)', desc: 'Preserva ceros intactos (ej. transacciones, reclamos).' },
              { id: 'sqrt', label: 'Raíz Cuadrada sqrt(x)', desc: 'Moderación suave de colas pesadas.' },
              { id: 'boxcox', label: 'Box-Cox Paramétrica', desc: 'Optimiza el parámetro λ para normalidad.' },
              { id: 'yeojohnson', label: 'Yeo-Johnson Paramétrica', desc: 'Válida para positivos, ceros y negativos.' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  currentTransform === opt.id
                    ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500'
                    : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name={`transform-${activeVarName}`}
                  checked={currentTransform === opt.id}
                  onChange={() => handleTransformChange(activeVarName, opt.id as TransformationType)}
                  className="mt-1 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-semibold block text-slate-900 dark:text-slate-100">{opt.label}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">{opt.desc}</span>
                </div>
              </label>
            ))}
          </div>

          {/* Visual Before vs. After Charts */}
          <div className="lg:col-span-8 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                Comparación de Distribución: Antes vs. Después
              </span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono font-medium">
                Transformación: {currentTransform.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before Chart */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                  Antes (Escala Original)
                </span>
                <div className="h-32 flex items-end gap-1 pt-4 pb-1 border-b border-slate-200 dark:border-slate-800">
                  {beforeHistogram.map((bin, i) => {
                    const maxC = Math.max(...beforeHistogram.map((b) => b.count), 1);
                    return (
                      <div
                        key={i}
                        style={{ height: `${Math.max(4, (bin.count / maxC) * 100)}%` }}
                        className="flex-1 bg-slate-400 dark:bg-slate-600 rounded-t-sm"
                        title={`${bin.label}: ${bin.count}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Mín: {beforeHistogram[0]?.binStart ?? 0}</span>
                  <span>Máx: {beforeHistogram[beforeHistogram.length - 1]?.binEnd ?? 0}</span>
                </div>
              </div>

              {/* After Chart */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 block">
                  Después (Transformada)
                </span>
                <div className="h-32 flex items-end gap-1 pt-4 pb-1 border-b border-slate-200 dark:border-slate-800">
                  {afterHistogram.map((bin, i) => {
                    const maxC = Math.max(...afterHistogram.map((b) => b.count), 1);
                    return (
                      <div
                        key={i}
                        style={{ height: `${Math.max(4, (bin.count / maxC) * 100)}%` }}
                        className="flex-1 bg-blue-600 dark:bg-blue-500 rounded-t-sm"
                        title={`${bin.label}: ${bin.count}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Mín: {afterHistogram[0]?.binStart ?? 0}</span>
                  <span>Máx: {afterHistogram[afterHistogram.length - 1]?.binEnd ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Justification Text */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                Justificación Técnica de la Transformación
              </span>
              <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{transformResult.explanation}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Module 8: Standardization & Scaling */}
      <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Módulo 8: Estandarización / Normalización de Magnitudes
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Las distancias euclidianas son sensibles a las escalas. Por defecto se aplica Min-Max Scaling (0 a 1) para ponderar equilibradamente todas las variables.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              id: 'minmax' as ScalingMethod,
              name: 'Min-Max Scaling (0 a 1)',
              badge: 'Por defecto (Recomendado)',
              desc: 'Transforma cada variable al rango acotado [0, 1]. Preserva proporciones exactas sin distorsión negativa.',
            },
            {
              id: 'zscore' as ScalingMethod,
              name: 'Z-Score Standardization',
              badge: 'Media = 0, Desv = 1',
              desc: 'Centra en 0 con varianza unitaria. Recomendado cuando todas las variables son gaussianas simétricas.',
            },
            {
              id: 'robust' as ScalingMethod,
              name: 'Robust Scaler (IQR)',
              badge: 'Resistente a Outliers',
              desc: 'Resta la mediana y divide por el rango intercuartílico (IQR). Previene compresión por valores extremos.',
            },
          ].map((scaler) => {
            const isSelected = scalingMethod === scaler.id;
            return (
              <div
                key={scaler.id}
                onClick={() => onUpdateScalingMethod(scaler.id)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 shadow-xs'
                    : 'bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {scaler.badge}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </div>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white mt-2">{scaler.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{scaler.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Estadística</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <span>Continuar a Selección Óptima de Clusters (K)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
