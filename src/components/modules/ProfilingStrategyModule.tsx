import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Target,
  Edit2,
  Check,
  Building2,
} from 'lucide-react';
import {
  BusinessContext,
  ClusterBusinessProfile,
  ClusterResult,
} from '../../types/segmentation';

interface ProfilingStrategyModuleProps {
  profiles: ClusterBusinessProfile[];
  onUpdateProfiles: (profiles: ClusterBusinessProfile[]) => void;
  context: BusinessContext;
  clusterResult: ClusterResult;
  onRegenerateWithAI: () => Promise<void>;
  isGeneratingAI: boolean;
  aiSource: string;
  onNext: () => void;
  onBack: () => void;
}

export const ProfilingStrategyModule: React.FC<ProfilingStrategyModuleProps> = ({
  profiles,
  onUpdateProfiles,
  context,
  clusterResult,
  onRegenerateWithAI,
  isGeneratingAI,
  aiSource,
  onNext,
  onBack,
}) => {
  const [activeClusterId, setActiveClusterId] = useState<number>(0);
  const [editingNameClusterId, setEditingNameClusterId] = useState<number | null>(null);
  const [tempName, setTempName] = useState('');

  const activeProfile = profiles.find((p) => p.clusterId === activeClusterId) || profiles[0];

  const handleStartEditName = (p: ClusterBusinessProfile) => {
    setEditingNameClusterId(p.clusterId);
    setTempName(p.businessName);
  };

  const handleSaveName = (clusterId: number) => {
    if (tempName.trim()) {
      const updated = profiles.map((p) =>
        p.clusterId === clusterId ? { ...p, businessName: tempName.trim() } : p
      );
      onUpdateProfiles(updated);
    }
    setEditingNameClusterId(null);
  };

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Fichas de Clientes & Estrategias Comerciales con IA
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              Motor: {aiSource}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Módulos 12, 13 y 14: Perfilamiento ejecutivo, indicadores operativos y 5 dimensiones de acción comercial.
          </p>
        </div>

        <button
          onClick={onRegenerateWithAI}
          disabled={isGeneratingAI}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
          <span>{isGeneratingAI ? 'Analizando con Gemini...' : 'Reinterpretar con IA'}</span>
        </button>
      </div>

      {/* Segment Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {profiles.map((p) => {
          const isSelected = p.clusterId === activeClusterId;
          const isEditing = editingNameClusterId === p.clusterId;

          return (
            <div
              key={p.clusterId}
              onClick={() => setActiveClusterId(p.clusterId)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 shadow-sm ring-1 ring-blue-600/30'
                  : 'bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
                  Cluster {p.clusterId + 1}
                </span>
                <span className="font-mono text-slate-900 dark:text-white font-semibold">
                  {p.percentage}% ({p.size})
                </span>
              </div>

              {isEditing ? (
                <div className="mt-2 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-blue-500 rounded text-xs text-slate-900 dark:text-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveName(p.clusterId)}
                    className="p-1 bg-blue-600 rounded text-white"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="mt-1.5 flex items-center justify-between group">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {p.businessName}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEditName(p);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-opacity p-0.5"
                    title="Editar nombre de segmento"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {p.tagline}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Dossier for Active Segment */}
      {activeProfile && (
        <div className="space-y-6">
          {/* Active Segment Banner */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {activeProfile.businessName}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300">
                Participación: {activeProfile.size} entidades ({activeProfile.percentage}% de la cartera)
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 italic">
              {activeProfile.tagline}
            </p>
          </div>

          {/* Module 12: Distinctive Features Table & Drivers */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Variables Tractoras y Desviación Respecto a la Media General
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {activeProfile.distinctiveFeatures.slice(0, 4).map((f) => {
                const isHigh = f.direction === 'higher';
                return (
                  <div
                    key={f.variable}
                    className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-xs"
                  >
                    <span className="text-slate-500 dark:text-slate-400 truncate block text-[11px] font-sans">
                      {f.variable}
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {f.clusterMean}
                      </span>
                      <span
                        className={`text-[11px] font-semibold ${
                          isHigh ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {isHigh ? '+' : ''}
                        {Math.round((f.ratio - 1) * 100)}% vs base
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-sans">
                      Media Global: {f.overallMean}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Module 13: Executive & Operational Profiles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Perfil Ejecutivo */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                  Perfil Ejecutivo (Comportamiento de Alto Nivel)
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
                    ¿Qué caracteriza al segmento?
                  </span>
                  <p className="text-slate-700 dark:text-slate-200 mt-0.5 leading-relaxed">
                    {activeProfile.executiveProfile.characterization}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
                    Factores Diferenciadores Clave
                  </span>
                  <p className="text-slate-700 dark:text-slate-200 mt-0.5 leading-relaxed">
                    {activeProfile.executiveProfile.keyDifferentiators}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/80 dark:border-emerald-800/40">
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">
                      Potencial Comercial
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] mt-0.5 leading-snug">
                      {activeProfile.executiveProfile.commercialPotential}
                    </p>
                  </div>
                  <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg border border-rose-200/80 dark:border-rose-800/40">
                    <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase block">
                      Riesgos Asociados
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] mt-0.5 leading-snug">
                      {activeProfile.executiveProfile.associatedRisks}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Perfil Operativo */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                  Perfil Operativo & Canales de Contacto
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
                    Variables Operativas Relevantes
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {activeProfile.operationalProfile.keyVariables.map((v) => (
                      <span
                        key={v}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px] text-slate-700 dark:text-slate-300"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
                    Indicadores Clave y Metas (KPI Targets)
                  </span>
                  <p className="text-slate-700 dark:text-slate-200 mt-0.5 leading-relaxed font-mono">
                    {activeProfile.operationalProfile.kpiTargets}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
                    Canales de Interacción Recomendados
                  </span>
                  <p className="text-slate-700 dark:text-slate-200 mt-0.5 leading-relaxed">
                    {activeProfile.operationalProfile.interactionChannels}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Module 14: 5 Strategic Commercial Dimensions */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Estrategias Comerciales en 5 Dimensiones (Asistidas por IA)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Precios */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <DollarSign className="w-4 h-4" />
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200">
                    1. Estrategia de Precios
                  </h5>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeProfile.strategies.pricing}
                </p>
              </div>

              {/* 2. Fidelización */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Award className="w-4 h-4" />
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200">
                    2. Estrategia de Fidelización
                  </h5>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeProfile.strategies.loyalty}
                </p>
              </div>

              {/* 3. Innovación */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200">
                    3. Innovación & Nuevos Servicios
                  </h5>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeProfile.strategies.innovation}
                </p>
              </div>

              {/* 4. Crecimiento */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <TrendingUp className="w-4 h-4" />
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200">
                    4. Crecimiento (Cross & Up-selling)
                  </h5>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeProfile.strategies.growth}
                </p>
              </div>

              {/* 5. Riesgo */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 md:col-span-2 lg:col-span-2">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200">
                    5. Gestión de Riesgo, Retención & Prevención de Abandono
                  </h5>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeProfile.strategies.riskMitigation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Modelado</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <span>Ir a Dashboard Ejecutivo & Exportación</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
