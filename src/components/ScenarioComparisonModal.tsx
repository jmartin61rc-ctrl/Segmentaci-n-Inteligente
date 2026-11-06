import React, { useState } from 'react';
import { X, Check, ArrowRight, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { OptimalKRecommendation } from '../types/segmentation';

interface ScenarioComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: OptimalKRecommendation;
  selectedK: number;
  onApplyK: (k: number) => void;
}

export const ScenarioComparisonModal: React.FC<ScenarioComparisonModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  selectedK,
  onApplyK,
}) => {
  if (!isOpen) return null;

  const { recommendedK, metrics } = recommendation;
  const [scenarioA, setScenarioA] = useState<number>(recommendedK); // Statistical
  const [scenarioB, setScenarioB] = useState<number>(selectedK !== recommendedK ? selectedK : Math.max(2, recommendedK - 1)); // Business alternative

  const metricA = metrics.find((m) => m.k === scenarioA) || metrics[0];
  const metricB = metrics.find((m) => m.k === scenarioB) || metrics[1];

  const getScenarioAnalysis = (k: number) => {
    if (k <= 3) {
      return {
        operationalFeasibility: 'Muy Alta',
        operationalFeasibilityColor: 'text-emerald-400',
        advantages: [
          'Estructura simple y directa para capacitar a la fuerza de ventas.',
          'Bajo costo de creación de contenidos y campañas de marketing.',
          'Grupos amplios y robustos con bajo riesgo de desactualización.',
        ],
        disadvantages: [
          'Menor granularidad: clientes con necesidades sutilmente distintas quedan agrupados juntos.',
          'Mayor dispersión intra-cluster (WSS superior).',
        ],
        recommendedFor: 'Organizaciones con equipos de marketing pequeños o iniciando su estrategia de segmentación.',
      };
    } else if (k <= 5) {
      return {
        operationalFeasibility: 'Óptima (Equilibrio de Oro)',
        operationalFeasibilityColor: 'text-cyan-400',
        advantages: [
          'Permite diferenciar claramente Champions, Potenciales, Tradicionales y Clientes en Riesgo.',
          'Excelente balance entre interpretabilidad gerencial y precisión matemática.',
          'Campañas de precios y fidelización altamente focalizadas.',
        ],
        disadvantages: [
          'Requiere al menos 3 a 4 flujos de automatización en CRM.',
          'Necesidad de revisiones trimestrales de transición de clientes.',
        ],
        recommendedFor: 'Empresas medianas a grandes con canales comerciales multicanal o CRM activo.',
      };
    } else {
      return {
        operationalFeasibility: 'Exigente / Alta Complejidad',
        operationalFeasibilityColor: 'text-amber-400',
        advantages: [
          'Máxima personalización analítica y mínima inercia WSS intra-cluster.',
          'Detección precisa de micro-nichos de alto valor o riesgos específicos.',
        ],
        disadvantages: [
          'Riesgo de fragmentación: equipos comerciales pueden confundir las propuestas de valor.',
          'Alto esfuerzo de diseño y mantenimiento de matrices de precios y comunicación.',
        ],
        recommendedFor: 'Equipos analíticos avanzados con plataformas de automatización e hiper-personalización basada en IA.',
      };
    }
  };

  const analysisA = getScenarioAnalysis(scenarioA);
  const analysisB = getScenarioAnalysis(scenarioB);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Módulo 10: Comparador de Escenarios (Estadístico vs. Decisión de Negocio)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Evalúe ventajas, desventajas y factibilidad operacional antes de ejecutar el clustering.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Scenario Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scenario A */}
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Escenario A (Estadístico / Referencia)
                </span>
                <select
                  value={scenarioA}
                  onChange={(e) => setScenarioA(Number(e.target.value))}
                  className="px-2.5 py-1 bg-slate-950 border border-indigo-500/60 rounded text-xs text-white font-mono"
                >
                  {metrics.map((m) => (
                    <option key={m.k} value={m.k}>
                      K = {m.k} {m.k === recommendedK ? '(Recomendado)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Silueta:</span>
                  <span className="text-cyan-300 font-bold">{metricA?.silhouette}</span>
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Inercia WSS:</span>
                  <span className="text-indigo-300 font-bold">{metricA?.wss}</span>
                </div>
              </div>

              <div className="text-xs space-y-2 pt-1">
                <div>
                  <span className="text-slate-400 text-[11px] block">Factibilidad de Operación:</span>
                  <span className={`font-semibold ${analysisA.operationalFeasibilityColor}`}>
                    {analysisA.operationalFeasibility}
                  </span>
                </div>

                <div>
                  <span className="text-emerald-400 font-semibold block text-[11px]">✓ Ventajas:</span>
                  <ul className="list-disc pl-4 text-slate-300 text-[11px] space-y-1 mt-0.5">
                    {analysisA.advantages.map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-rose-400 font-semibold block text-[11px]">✕ Desventajas:</span>
                  <ul className="list-disc pl-4 text-slate-400 text-[11px] space-y-1 mt-0.5">
                    {analysisA.disadvantages.map((dis, i) => (
                      <li key={i}>{dis}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  onApplyK(scenarioA);
                  onClose();
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer mt-2"
              >
                Aplicar Escenario A (K = {scenarioA})
              </button>
            </div>

            {/* Scenario B */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  Escenario B (Alternativa de Negocio)
                </span>
                <select
                  value={scenarioB}
                  onChange={(e) => setScenarioB(Number(e.target.value))}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono"
                >
                  {metrics.map((m) => (
                    <option key={m.k} value={m.k}>
                      K = {m.k}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Silueta:</span>
                  <span className="text-cyan-300 font-bold">{metricB?.silhouette}</span>
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Inercia WSS:</span>
                  <span className="text-indigo-300 font-bold">{metricB?.wss}</span>
                </div>
              </div>

              <div className="text-xs space-y-2 pt-1">
                <div>
                  <span className="text-slate-400 text-[11px] block">Factibilidad de Operación:</span>
                  <span className={`font-semibold ${analysisB.operationalFeasibilityColor}`}>
                    {analysisB.operationalFeasibility}
                  </span>
                </div>

                <div>
                  <span className="text-emerald-400 font-semibold block text-[11px]">✓ Ventajas:</span>
                  <ul className="list-disc pl-4 text-slate-300 text-[11px] space-y-1 mt-0.5">
                    {analysisB.advantages.map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-rose-400 font-semibold block text-[11px]">✕ Desventajas:</span>
                  <ul className="list-disc pl-4 text-slate-400 text-[11px] space-y-1 mt-0.5">
                    {analysisB.disadvantages.map((dis, i) => (
                      <li key={i}>{dis}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  onApplyK(scenarioB);
                  onClose();
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-lg transition-colors cursor-pointer mt-2"
              >
                Aplicar Escenario B (K = {scenarioB})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
