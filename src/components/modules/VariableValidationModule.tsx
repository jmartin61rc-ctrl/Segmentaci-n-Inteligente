import React from 'react';
import {
  CheckCircle2,
  XCircle,
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
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Módulo 3: Validación de Variables para Clustering
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Diagnóstico de aptitud matemática: separación automática entre magnitudes continuas y variables no aptas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg font-mono font-medium">
            {selectedCount} variables seleccionadas
          </span>
        </div>
      </div>

      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">Variables Aptas ({aptVariables.length})</h4>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Magnitudes numéricas continuas con varianza &gt; 0 y suficiente completitud.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">Variables Excluidas ({excludedVariables.length})</h4>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Identificadores primarios, fechas temporales, texto libre o categorías sin codificar.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">Recomendación de Modelo</h4>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Se seleccionan automáticamente las variables con mayor capacidad de discriminación espacial.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Selection Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleSelectAllApt}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Solo Aptas recomendadas
          </button>
          <button
            onClick={handleDeselectAll}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg transition-colors cursor-pointer"
          >
            Desmarcar todas
          </button>
        </div>

        {selectedCount < 2 && (
          <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
            <Info className="w-3.5 h-3.5" />
            Se requieren al menos 2 variables numéricas para calcular distancias euclidianas.
          </span>
        )}
      </div>

      {/* Variables Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                <th className="py-2.5 px-3 w-12 text-center">Incluir</th>
                <th className="py-2.5 px-3">Variable / Columna</th>
                <th className="py-2.5 px-3">Tipo Detectado</th>
                <th className="py-2.5 px-3">Diagnóstico de Aptitud</th>
                <th className="py-2.5 px-3">Motivo / Criterio Técnico</th>
                <th className="py-2.5 px-3 text-right">Rango / Muestra</th>
                <th className="py-2.5 px-3 text-right">% Nulos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {metadata.map((item) => {
                const isApt = item.suitability === 'apt';
                const isChecked = item.isSelectedForClustering;

                return (
                  <tr
                    key={item.name}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                      isChecked ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(item.name)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">{item.name}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          item.type === 'numeric'
                            ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                            : item.type === 'id'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            : item.type === 'date'
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {isApt ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Apta para Clustering
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Excluida
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={item.exclusionReason}>
                      {item.exclusionReason || 'Magnitud continua cuantitativa válida para distancias espaciales.'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      {item.min !== undefined && item.max !== undefined ? (
                        <span>
                          [{item.min} ... {item.max}]
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] truncate max-w-[120px] inline-block font-sans">
                          {item.sampleValues.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span className={item.nullPercentage > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-400'}>
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
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Carga</span>
        </button>

        <button
          onClick={onNext}
          disabled={selectedCount < 2}
          className={`inline-flex items-center gap-2 px-4 py-2 font-semibold text-xs rounded-lg shadow-sm transition-all ${
            selectedCount >= 2
              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Continuar a Contexto del Negocio</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
