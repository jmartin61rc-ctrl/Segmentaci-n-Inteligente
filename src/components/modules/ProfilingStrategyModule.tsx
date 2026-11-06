import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Tag,
  Award,
  Zap,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Target,
  RefreshCw,
  Edit2,
  Check,
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
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Módulos 12, 13 y 14: Perfiles de Clientes & Estrategias Comerciales con IA
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700/60 text-indigo-300">
              Motor: {aiSource}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            Perfilamiento ejecutivo, indicadores operativos y 5 dimensiones de acciones comerciales personalizadas por segmento.
          </p>
        </div>

        <button
          onClick={onRegenerateWithAI}
          disabled={isGeneratingAI}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
          <span>{isGeneratingAI ? 'Generando con Gemini...' : 'Regenerar con IA'}</span>
        </button>
      </div>

      {/* Cluster Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {profiles.map((p) => {
          const isSelected = p.clusterId === activeClusterId;
          const isEditing = editingNameClusterId === p.clusterId;

          return (
            <div
              key={p.clusterId}
              onClick={() => setActiveClusterId(p.clusterId)}
              style={{ borderLeftColor: p.color }}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all border-l-4 ${
                isSelected
                  ? 'bg-slate-900 border-slate-700 shadow-lg shadow-slate-950/40 ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-400">Cluster {p.clusterId + 1}</span>
                <span className="font-mono text-slate-200 font-semibold">
                  {p.percentage}% ({p.size})
                </span>
              </div>

              {isEditing ? (
                <div className="mt-2 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-950 border border-indigo-500 rounded text-xs text-white"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveName(p.clusterId)}
                    className="p-1 bg-indigo-600 rounded text-white"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="mt-1.5 flex items-center justify-between group">
                  <h4 className="font-bold text-sm text-slate-100 truncate">{p.businessName}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEditName(p);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-opacity p-0.5"
                    title="Editar nombre de segmento"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.tagline}</p>
            </div>
          );
        })}
      </div>

      {/* Main Profile & Strategy View for Active Segment */}
      {activeProfile && (
        <div className="space-y-6">
          {/* Header of Active Segment */}
          <div
            style={{ borderLeftColor: activeProfile.color }}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 border-l-4 space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: activeProfile.color }}
                  className="w-3 h-3 rounded-full"
                />
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {activeProfile.businessName}
                </h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
                Tamaño: {activeProfile.size} entidades ({activeProfile.percentage}% de la cartera)
              </span>
            </div>
            <p className="text-sm text-slate-300 italic">{activeProfile.tagline}</p>
          </div>

          {/* Module 12: Distinctive Features Table & Drivers */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Módulo 12: Variables Clave y Comportamiento Distintivo (Valores Absolutos)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {activeProfile.distinctiveFeatures.slice(0, 4).map((f) => {
                const isHigh = f.direction === 'higher';
                return (
                  <div
                    key={f.variable}
                    className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1 font-mono text-xs"
                  >
                    <span className="text-slate-400 truncate block text-[11px]">{f.variable}</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-bold text-white">{f.clusterMean}</span>
                      <span
                        className={`text-[11px] font-semibold ${
                          isHigh ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {isHigh ? '+' : ''}
                        {Math.round((f.ratio - 1) * 100)}% vs global
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
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
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  Módulo 13.1: Perfil Ejecutivo
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                    ¿Qué caracteriza al segmento?
                  </span>
                  <p className="text-slate-200 mt-0.5 leading-relaxed">
                    {activeProfile.executiveProfile.characterization}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                    ¿Qué lo diferencia drásticamente?
                  </span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    {activeProfile.executiveProfile.keyDifferentiators}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase block">
                      Potencial Comercial
                    </span>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      {activeProfile.executiveProfile.commercialPotential}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-bold text-rose-400 uppercase block">
                      Riesgos Asociados
                    </span>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      {activeProfile.executiveProfile.associatedRisks}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Perfil Operativo */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  Módulo 13.2: Perfil Operativo & Canales
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                    Variables Operativas Críticas
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {activeProfile.operationalProfile.keyVariables.map((v) => (
                      <span
                        key={v}
                        className="px-2 py-1 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-cyan-300"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                    Metas & Indicadores de Gestión (KPI Targets)
                  </span>
                  <p className="text-slate-200 mt-0.5 leading-relaxed font-mono">
                    {activeProfile.operationalProfile.kpiTargets}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                    Canales de Contacto y Atención Recomendados
                  </span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    {activeProfile.operationalProfile.interactionChannels}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Module 14: 5 Strategic Business Dimensions */}
          <div className="space-y-4 pt-2">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Módulo 14: Estrategias de Negocio Asistidas por IA (5 Dimensiones de Acción)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Precios */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <DollarSign className="w-4 h-4" />
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    1. Estrategia de Precios
                  </h5>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeProfile.strategies.pricing}
                </p>
              </div>

              {/* 2. Fidelización */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Award className="w-4 h-4" />
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    2. Estrategia de Fidelización
                  </h5>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeProfile.strategies.loyalty}
                </p>
              </div>

              {/* 3. Innovación */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    3. Estrategia de Innovación
                  </h5>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeProfile.strategies.innovation}
                </p>
              </div>

              {/* 4. Crecimiento */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400">
                  <TrendingUp className="w-4 h-4" />
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    4. Crecimiento (Cross & Up-selling)
                  </h5>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeProfile.strategies.growth}
                </p>
              </div>

              {/* 5. Riesgo */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 md:col-span-2 lg:col-span-2">
                <div className="flex items-center gap-2 text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    5. Gestión de Riesgo, Retención & Prevención de Churn
                  </h5>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeProfile.strategies.riskMitigation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs rounded-xl border border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Algoritmos</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <span>Continuar a Dashboard Ejecutivo & Exportación</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
