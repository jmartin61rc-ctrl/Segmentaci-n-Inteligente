import React, { useState } from 'react';
import {
  Cpu,
  RefreshCw,
  Layers,
  ArrowRight,
  ArrowLeft,
  ScatterChart,
  Eye,
  Info,
} from 'lucide-react';
import {
  ClusteringAlgorithm,
  ClusterResult,
  Dataset,
} from '../../types/segmentation';
import { getClusterColor } from '../../utils/profiling';

interface ClusteringExecutionModuleProps {
  dataset: Dataset;
  clusterResult: ClusterResult;
  onAlgorithmChange: (algo: ClusteringAlgorithm) => void;
  isExecuting: boolean;
  onNext: () => void;
  onBack: () => void;
}

export const ClusteringExecutionModule: React.FC<ClusteringExecutionModuleProps> = ({
  dataset,
  clusterResult,
  onAlgorithmChange,
  isExecuting,
  onNext,
  onBack,
}) => {
  const [scaleMode, setScaleMode] = useState<'real' | 'standardized'>('real');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  const {
    algorithm,
    k,
    clusterSizes,
    clusterPercentages,
    centroids,
    scaledCentroids,
    silhouetteScore,
    wss,
    interClusterDistances,
    pcaPoints,
    featuresUsed,
    executionTimeMs,
  } = clusterResult;

  // PCA Bounding Box calculation for responsive SVG scatter plot
  const minX = Math.min(...pcaPoints.map((p) => p.x), -1);
  const maxX = Math.max(...pcaPoints.map((p) => p.x), 1);
  const minY = Math.min(...pcaPoints.map((p) => p.y), -1);
  const maxY = Math.max(...pcaPoints.map((p) => p.y), 1);

  const scaleX = (x: number) => ((x - minX) / (maxX - minX || 1)) * 520 + 40;
  const scaleY = (y: number) => 360 - (((y - minY) / (maxY - minY || 1)) * 300 + 30);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Módulo 11: Ejecución & Evaluación de Algoritmos de Clustering
          </h2>
          <p className="text-sm text-slate-400">
            Convergencia de centroides, tamaños de segmento, matriz de separación y proyección dimensional PCA.
          </p>
        </div>

        {/* Algorithm Selector Switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {[
            { id: 'kmeans' as ClusteringAlgorithm, label: 'K-Means++' },
            { id: 'kmedoids' as ClusteringAlgorithm, label: 'K-Medoids (PAM)' },
            { id: 'hierarchical' as ClusteringAlgorithm, label: 'Jerárquico' },
            { id: 'dbscan' as ClusteringAlgorithm, label: 'DBSCAN' },
          ].map((alg) => (
            <button
              key={alg.id}
              onClick={() => onAlgorithmChange(alg.id)}
              disabled={isExecuting}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                algorithm === alg.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {alg.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI execution cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Algoritmo Activo</span>
          <p className="text-lg font-bold text-white mt-1 uppercase font-mono">{algorithm}</p>
          <span className="text-[11px] text-slate-400">Tiempo: {executionTimeMs} ms</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Número de Grupos</span>
          <p className="text-lg font-bold text-indigo-400 mt-1 font-mono">K = {k}</p>
          <span className="text-[11px] text-slate-400">{pcaPoints.length} entidades</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Silueta Promedio</span>
          <p className="text-lg font-bold text-cyan-400 mt-1 font-mono">{silhouetteScore}</p>
          <span className="text-[11px] text-slate-400">
            {silhouetteScore > 0.5 ? 'Estructura fuerte' : 'Separabilidad razonable'}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Inercia Total (WSS)</span>
          <p className="text-lg font-bold text-emerald-400 mt-1 font-mono">{wss}</p>
          <span className="text-[11px] text-slate-400">Dispersión intra-cluster</span>
        </div>
      </div>

      {/* PCA 2D Scatter Plot & Cluster Sizes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive PCA 2D Map */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-slate-200">
                Mapa Bidimensional de Clusters (Proyección PCA 2D)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Componente Principal 1 vs. 2
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Pase el cursor sobre los puntos</span>
          </div>

          {/* SVG Map */}
          <div className="relative w-full aspect-[16/10] bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden">
            <svg viewBox="0 0 600 380" className="w-full h-full">
              {/* Grid lines */}
              <line x1="40" y1="190" x2="560" y2="190" stroke="#1e293b" strokeDasharray="4,4" />
              <line x1="300" y1="30" x2="300" y2="350" stroke="#1e293b" strokeDasharray="4,4" />

              {/* Data points */}
              {pcaPoints.map((pt) => {
                const color = getClusterColor(pt.cluster);
                const isHovered = hoveredPoint?.id === pt.id;
                return (
                  <circle
                    key={pt.id}
                    cx={scaleX(pt.x)}
                    cy={scaleY(pt.y)}
                    r={isHovered ? 6 : 3.5}
                    fill={color}
                    fillOpacity={isHovered ? 1 : 0.75}
                    stroke={isHovered ? '#ffffff' : color}
                    strokeWidth={isHovered ? 2 : 0.5}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
            </svg>

            {/* Hover Tooltip Box */}
            {hoveredPoint && (
              <div className="absolute top-3 right-3 p-3 bg-slate-950/95 border border-slate-700 rounded-xl text-xs shadow-2xl z-20 pointer-events-none max-w-xs space-y-1">
                <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
                  <span className="font-bold text-slate-100">{hoveredPoint.label}</span>
                  <span
                    style={{ color: getClusterColor(hoveredPoint.cluster) }}
                    className="font-mono font-bold"
                  >
                    Cluster {hoveredPoint.cluster + 1}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 space-y-0.5 pt-1">
                  {featuresUsed.slice(0, 4).map((f) => (
                    <div key={f} className="flex justify-between gap-4">
                      <span className="text-slate-500 truncate">{f}:</span>
                      <span className="text-slate-200 font-semibold">{hoveredPoint.data[f]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Visualización de separabilidad espacial y compresión de {featuresUsed.length} dimensiones</span>
            <div className="flex items-center gap-3">
              {Array.from({ length: k }, (_, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span
                    style={{ backgroundColor: getClusterColor(idx) }}
                    className="w-2.5 h-2.5 rounded-full"
                  />
                  <span className="text-[11px] font-mono">C{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cluster Sizes & Shares */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-200 block">
              Distribución de Tamaño por Cluster
            </span>

            <div className="space-y-3">
              {Array.from({ length: k }, (_, c) => {
                const color = getClusterColor(c);
                const count = clusterSizes[c] || 0;
                const pct = clusterPercentages[c] || 0;

                return (
                  <div key={c} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span style={{ backgroundColor: color }} className="w-2.5 h-2.5 rounded-full" />
                        <span className="font-bold text-slate-100">Cluster {c + 1}</span>
                      </div>
                      <span className="font-mono text-slate-300 font-semibold">
                        {count} entidades ({pct}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%`, backgroundColor: color }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inter-Cluster Distance Matrix */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                Matriz de Distancia Inter-Cluster
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Euclidiana</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-[11px] font-mono border-collapse">
                <thead>
                  <tr className="text-slate-400">
                    <th className="p-1"></th>
                    {Array.from({ length: k }, (_, c) => (
                      <th key={c} className="p-1 text-slate-400">C{c + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {interClusterDistances.map((row, i) => (
                    <tr key={i}>
                      <td className="p-1 font-bold text-slate-400 text-left">C{i + 1}</td>
                      {row.map((val, j) => (
                        <td
                          key={j}
                          className={`p-1 ${i === j ? 'text-slate-600' : 'text-slate-200 font-semibold'}`}
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Final Centroids Table */}
      <section className="space-y-3 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Centroides Finales por Variable
            </h3>
            <p className="text-xs text-slate-400">
              Coordenadas de los centros de gravedad de cada cluster.
            </p>
          </div>

          {/* Scale mode toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setScaleMode('real')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                scaleMode === 'real'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Valores Reales de Negocio (Absolutos)
            </button>
            <button
              onClick={() => setScaleMode('standardized')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                scaleMode === 'standardized'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Estandarizados (0 a 1)
            </button>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
                  <th className="py-2.5 px-3">Variable</th>
                  {Array.from({ length: k }, (_, c) => (
                    <th key={c} className="py-2.5 px-3 text-right">
                      <span style={{ color: getClusterColor(c) }} className="font-bold">
                        Cluster {c + 1}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {featuresUsed.map((feat) => (
                  <tr key={feat} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{feat}</td>
                    {Array.from({ length: k }, (_, c) => {
                      const val =
                        scaleMode === 'real'
                          ? centroids[c]?.[feat] ?? 0
                          : scaledCentroids[c]?.[feat] ?? 0;
                      return (
                        <td key={c} className="py-2.5 px-3 text-right text-slate-300 font-bold">
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs rounded-xl border border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Selección K</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <span>Continuar a Perfilamiento & Estrategias IA</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
