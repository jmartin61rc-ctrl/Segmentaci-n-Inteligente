import React from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
} from 'lucide-react';
import { Dataset, VariableMetadata } from '../../types/segmentation';

interface VariableValidationModuleProps {
  dataset: Dataset;
  onUpdateMetadata: (metadata: VariableMetadata[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const VariableValidationModule: React.FC<VariableValidationModuleProps> = ({
  dataset,
  onUpdateMetadata,
  onNext,
  onBack,
}) => {
  const metadata = dataset.metadata;

  const aptVariables = metadata.filter((m) => m.suitability === 'apt');
  const excludedVariables = metadata.filter((m) => m.suitability === 'excluded');
  const selectedCount = metadata.filter((m) => m.isSelectedForClustering).length;

  const handleToggleSelect = (varName: string) => {
    const updated = metadata.map((m) => {
      if (m.name === varName) {
        return { ...m, isSelectedForClustering: !m.isSelectedForClustering };
      }
      return m;
    });
    onUpdateMetadata(updated);
  };

  const handleSelectAllApt = () => {
    const updated = metadata.map((m) => ({
      ...m,
      isSelectedForClustering: m.suitability === 'apt',
    }));
    onUpdateMetadata(updated);
  };

  const handleDeselectAll = () => {
    const updated = metadata.map((m) => ({
      ...m,
      isSelectedForClustering: false,
    }));
    onUpdateMetadata(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Módulo 3: Validación de Variables para Clustering
          </h2>
          <p className="text-sm text-slate-400">
            Identificación automática de variables continuas aptas vs. variables no aptas (IDs, fechas, texto, nulos).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 bg-indigo-950/80 border border-indigo-800 text-indigo-300 rounded-lg font-mono">
            {selectedCount} seleccionadas para el modelo
          </span>
        </div>
      </div>

      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-200">Variables Aptas ({aptVariables.length})</h4>
            <p className="text-slate-400 mt-0.5">
              Magnitudes numéricas continuas o escalares con varianza positiva y completitud.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-800/80 flex items-center justify-center text-rose-400 shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-200">Variables Excluidas ({excludedVariables.length})</h4>
            <p className="text-slate-400 mt-0.5">
              Identificadores primarios, fechas temporales, texto libre o categorías sin codificar.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/80 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-200">Recomendación Automática</h4>
            <p className="text-slate-400 mt-0.5">
              Se seleccionan automáticamente las variables continuas con mayor poder discriminante.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Selection Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleSelectAllApt}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            Seleccionar solo Aptas recomendadas
          </button>
          <button
            onClick={handleDeselectAll}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Desmarcar todas
          </button>
        </div>

        {selectedCount < 2 && (
          <span className="text-xs text-amber-400 flex items-center gap-1 font-medium">
            <Info className="w-3.5 h-3.5" />
            Se requieren al menos 2 variables numéricas para calcular distancias espaciales.
          </span>
        )}
      </div>

      {/* Variables Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-3 px-4 w-12 text-center">Incluir</th>
                <th className="py-3 px-4">Variable / Columna</th>
                <th className="py-3 px-4">Tipo Detectado</th>
                <th className="py-3 px-4">Diagnóstico de Aptitud</th>
                <th className="py-3 px-4">Motivo / Criterio Técnico</th>
                <th className="py-3 px-4 text-right">Rango / Muestra</th>
                <th className="py-3 px-4 text-right">% Nulos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {metadata.map((item) => {
                const isApt = item.suitability === 'apt';
                const isChecked = item.isSelectedForClustering;

                return (
                  <tr
                    key={item.name}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isChecked ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(item.name)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-100 font-mono">{item.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          item.type === 'numeric'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/50'
                            : item.type === 'id'
                            ? 'bg-slate-800 text-slate-400'
                            : item.type === 'date'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {isApt ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Apta para Clustering
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> No Apta (Excluida)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={item.exclusionReason}>
                      {item.exclusionReason || 'Variable cuantitativa continua válida para distancias euclidianas.'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {item.min !== undefined && item.max !== undefined ? (
                        <span>
                          [{item.min} ... {item.max}]
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px] truncate max-w-[120px] inline-block">
                          {item.sampleValues.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className={item.nullPercentage > 0 ? 'text-rose-400' : 'text-slate-400'}>
                        {item.nullPercentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs rounded-xl border border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Carga</span>
        </button>

        <button
          onClick={onNext}
          disabled={selectedCount < 2}
          className={`inline-flex items-center gap-2 px-5 py-2.5 font-semibold text-sm rounded-xl shadow-lg transition-all ${
            selectedCount >= 2
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Continuar a Contexto del Negocio</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
