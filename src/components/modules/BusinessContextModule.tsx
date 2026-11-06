import React from 'react';
import {
  Briefcase,
  Target,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Users,
  Award,
} from 'lucide-react';
import { BusinessContext, SectorType, SegmentationObjective } from '../../types/segmentation';

interface BusinessContextModuleProps {
  context: BusinessContext;
  onUpdateContext: (context: BusinessContext) => void;
  onNext: () => void;
  onBack: () => void;
}

const SECTORS: { name: SectorType; desc: string; icon: string }[] = [
  { name: 'Retail y E-Commerce', desc: 'Comportamiento de compra, RFM, ticket medio y tasas de devolución.', icon: '🛒' },
  { name: 'Banca y Servicios Financieros', desc: 'Saldos, solvencia crediticia, transaccionalidad y riesgo de mora.', icon: '🏦' },
  { name: 'Telecomunicaciones', desc: 'Planes, consumo de datos/voz, ARPU y propensión al churn.', icon: '📡' },
  { name: 'Salud y Farmacéutica', desc: 'Siniestralidad médica, consultas, adherencia a tratamientos y copagos.', icon: '🏥' },
  { name: 'Seguros', desc: 'Primas, coberturas, frecuencia de reclamaciones y perfiles de riesgo.', icon: '🛡️' },
  { name: 'Manufactura y B2B', desc: 'Cuentas corporativas, MRR, adopción de producto y contratos.', icon: '🏭' },
  { name: 'Logística y Transporte', desc: 'Volumen de despachos, puntualidad, costos de flete y márgenes.', icon: '🚚' },
  { name: 'Servicios Públicos (Utilities)', desc: 'Consumo kWh/m3, estacionalidad y patrones de pago.', icon: '⚡' },
  { name: 'Educación', desc: 'Retención de alumnos, programas cursados y avance académico.', icon: '🎓' },
  { name: 'Gobierno y Sector Público', desc: 'Acceso a beneficios sociales, tributación y niveles de cumplimiento.', icon: '🏛️' },
];

const OBJECTIVES: { name: SegmentationObjective; desc: string; icon: any }[] = [
  { name: 'Fidelización y Lealtad', desc: 'Maximizar el valor a largo plazo y blindar a los clientes más rentables.', icon: Award },
  { name: 'Crecimiento de Clientes', desc: 'Identificar clientes de alto potencial para acelerar su consumo o adopción.', icon: TrendingUp },
  { name: 'Venta Cruzada (Cross-selling)', desc: 'Descubrir propensiones para colocar productos complementarios.', icon: Users },
  { name: 'Venta Escalonada (Up-selling)', desc: 'Migrar usuarios de planes básicos hacia paquetes superiores de mayor margen.', icon: TrendingUp },
  { name: 'Retención y Prevención de Churn', desc: 'Detectar patrones de enfriamiento antes de la cancelación voluntaria.', icon: ShieldAlert },
  { name: 'Cobranza y Gestión de Mora', desc: 'Segmentar la cartera según nivel de riesgo y comportamiento de pago.', icon: ShieldAlert },
  { name: 'Innovación y Nuevos Productos', desc: 'Detectar early adopters para probar nuevas funcionalidades y ofertas.', icon: Sparkles },
  { name: 'Control de Riesgo Crediticio', desc: 'Diferenciar niveles de solvencia y exposición a default financiero.', icon: ShieldAlert },
  { name: 'Marketing Personalizado', desc: 'Diseñar campañas y promociones hiper-personalizadas por arquetipo.', icon: Target },
];

export const BusinessContextModule: React.FC<BusinessContextModuleProps> = ({
  context,
  onUpdateContext,
  onNext,
  onBack,
}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Módulo 4: Definición del Contexto de Negocio
        </h2>
        <p className="text-sm text-slate-400">
          La plataforma utiliza este contexto para asignar nombres comerciales inteligentes a los clusters, generar perfiles de arquetipos y formular estrategias de negocio personalizadas con IA.
        </p>
      </div>

      {/* Sector Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">1. Seleccione el Sector o Industria Económica</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {SECTORS.map((s) => {
            const isSelected = context.sector === s.name;
            return (
              <div
                key={s.name}
                onClick={() => onUpdateContext({ ...context, sector: s.name })}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-950/50 border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <span className="text-2xl">{s.icon}</span>
                <h4 className="font-semibold text-xs text-slate-100 mt-2">{s.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Objective Selection Grid */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">2. Seleccione el Objetivo Estratégico de la Segmentación</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {OBJECTIVES.map((obj) => {
            const isSelected = context.objective === obj.name;
            const Icon = obj.icon;
            return (
              <div
                key={obj.name}
                onClick={() => onUpdateContext({ ...context, objective: obj.name })}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-100">{obj.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{obj.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI and Context Summary */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Indicador Clave de Rendimiento (KPI) Prioritario:
          </label>
          <input
            type="text"
            value={context.primaryKPI}
            onChange={(e) => onUpdateContext({ ...context, primaryKPI: e.target.value })}
            placeholder="Ej: Customer Lifetime Value (LTV), Tasa de Churn, Margen Bruto, Ticket Promedio..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Permite a la IA orientar las metas operativas hacia este KPI específico.
          </p>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs text-slate-300 space-y-1">
          <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">
            Impacto en el Motor Analítico
          </span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            El contexto seleccionado ajustará las ponderaciones de la heurística de negocio, los nombres asignados a los centroides (ej: &quot;Clientes VIP&quot; vs &quot;Suscriptores Alta Voz&quot;) y las 5 dimensiones de estrategias comerciales (Precios, Lealtad, Innovación, Crecimiento y Riesgo).
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs rounded-xl border border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Variables</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <span>Continuar a Análisis Descriptivo & Sesgo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
