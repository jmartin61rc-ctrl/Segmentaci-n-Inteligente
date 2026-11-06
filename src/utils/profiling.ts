import {
  BusinessContext,
  ClusterBusinessProfile,
  ClusterResult,
  DistinctiveFeature,
  GlobalExecutiveDashboard,
} from '../types/segmentation';

const CLUSTER_COLORS = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#14b8a6', // Teal
  '#f97316', // Orange
];

export function getClusterColor(clusterId: number): string {
  return CLUSTER_COLORS[clusterId % CLUSTER_COLORS.length];
}

// Compute distinctive features comparing cluster centroid with dataset overall mean
export function extractDistinctiveFeatures(
  clusterId: number,
  clusterResult: ClusterResult,
  overallMeans: Record<string, number>
): DistinctiveFeature[] {
  const centroid = clusterResult.centroids[clusterId];
  const features = clusterResult.featuresUsed;

  const diffs: DistinctiveFeature[] = features.map((feat) => {
    const cMean = centroid[feat] ?? 0;
    const gMean = overallMeans[feat] ?? 1;
    const ratio = gMean !== 0 ? cMean / gMean : 1;
    const diffPct = Number(((ratio - 1) * 100).toFixed(1));

    let direction: 'higher' | 'lower' | 'similar' = 'similar';
    let significance: 'high' | 'medium' | 'low' = 'low';

    if (diffPct > 15) {
      direction = 'higher';
      significance = diffPct > 45 ? 'high' : 'medium';
    } else if (diffPct < -15) {
      direction = 'lower';
      significance = diffPct < -45 ? 'high' : 'medium';
    }

    return {
      variable: feat,
      clusterMean: Number(cMean.toFixed(2)),
      overallMean: Number(gMean.toFixed(2)),
      ratio: Number(ratio.toFixed(2)),
      direction,
      significance,
    };
  });

  // Sort by absolute distance from overall mean
  return diffs.sort((a, b) => Math.abs(b.ratio - 1) - Math.abs(a.ratio - 1));
}

// Advanced domain heuristic engine for business naming and strategy generation
export function generateHeuristicProfiles(
  clusterResult: ClusterResult,
  context: BusinessContext,
  overallMeans: Record<string, number>
): { profiles: ClusterBusinessProfile[]; globalDashboard: GlobalExecutiveDashboard } {
  const { k, clusterSizes, clusterPercentages } = clusterResult;
  const profiles: ClusterBusinessProfile[] = [];

  // Sort clusters by overall value indicator
  const clusterScores: { id: number; score: number }[] = [];
  for (let c = 0; c < k; c++) {
    const distinctive = extractDistinctiveFeatures(c, clusterResult, overallMeans);
    // Value score based on positive deviations in high-value metrics
    let score = 0;
    for (const d of distinctive) {
      const isPositiveMetric = /gasto|mrr|ingreso|saldo|ticket|visitas|arpu|adopcion|score|frecuencia/i.test(d.variable);
      const isNegativeMetric = /mora|reclamos|devolucion|churn|recency|siniestralidad/i.test(d.variable);
      if (isPositiveMetric) score += (d.ratio - 1) * 2;
      if (isNegativeMetric) score -= (d.ratio - 1) * 2;
    }
    clusterScores.push({ id: c, score });
  }

  // Rank clusters from highest value to lowest
  clusterScores.sort((a, b) => b.score - a.score);
  const rankMap: Record<number, number> = {};
  clusterScores.forEach((item, idx) => {
    rankMap[item.id] = idx; // 0 = Champion, 1 = Core/Growth, k-1 = Risk/Low
  });

  for (let c = 0; c < k; c++) {
    const rank = rankMap[c];
    const distinctive = extractDistinctiveFeatures(c, clusterResult, overallMeans);
    const topHigh = distinctive.filter((d) => d.direction === 'higher').slice(0, 3);
    const topLow = distinctive.filter((d) => d.direction === 'lower').slice(0, 3);

    let businessName = `Segmento ${c + 1}`;
    let tagline = 'Grupo de clientes con características homogéneas.';
    let characterization = '';
    let keyDifferentiators = '';
    let commercialPotential = 'Medio';
    let associatedRisks = 'Sensibilidad a variaciones de mercado.';
    let pricingStrategy = '';
    let loyaltyStrategy = '';
    let innovationStrategy = '';
    let growthStrategy = '';
    let riskStrategy = '';
    let kpiTarget = 'Retención y aumento de margen anual.';
    let channels = 'Canales mixtos digitales y presenciales.';

    if (rank === 0) {
      // Top Segment / VIP Champions
      businessName = context.sector.includes('Banca')
        ? 'Clientes Premier Alto Patrimonio'
        : context.sector.includes('Telecom')
        ? 'Suscriptores Premium Ultra-Conectados'
        : context.sector.includes('SaaS') || context.sector.includes('B2B')
        ? 'Cuentas Corporativas Power Users'
        : 'Clientes VIP de Alto Valor y Frecuencia';

      tagline = 'Generadores del mayor margen con alta afinidad a la marca y baja sensibilidad a precio.';
      characterization = `Este segmento concentra la mayor contribución financiera relativa. Presenta niveles muy superiores en ${topHigh.map((d) => d.variable).join(', ') || 'las métricas clave'}, con comportamiento transaccional altamente recurrente.`;
      keyDifferentiators = `Supera el promedio general por más del ${topHigh[0]?.ratio ? Math.round((topHigh[0].ratio - 1) * 100) : 40}% en sus indicadores de valor. Son autosuficientes y valoran la agilidad y el estatus.`;
      commercialPotential = 'Muy Alto: Constituyen el núcleo de rentabilidad (Pareto 80/20) y los candidatos idóneos para programas de fidelización exclusivos y embajadores de marca.';
      associatedRisks = 'Impacto severo ante eventual fuga: la pérdida de un solo cliente en este grupo afecta sustancialmente la facturación. Exigen calidad de servicio impecable.';
      pricingStrategy = 'Estrategia de precios Premium y valor agregado sin descuentos agresivos. Introducción de paquetes All-Inclusive y tarifas planas con privilegios exclusivos.';
      loyaltyStrategy = 'Club VIP por niveles, atención prioritaria concierge sin colas de espera, eventos exclusivos y recompensas experienciales no monetarias.';
      innovationStrategy = 'Acceso beta prioritario a nuevos lanzamientos, personalización avanzada de herramientas y co-creación de productos.';
      growthStrategy = 'Venta cruzada (Cross-selling) de servicios de alta gama y consolidación del 100% de su gasto (share-of-wallet).';
      riskStrategy = 'Protocolo de alerta temprana en tiempo real ante caídas en actividad de 15 días o más, con contacto directo de ejecutivos senior.';
      kpiTarget = 'NPS > 85, Tasa de retención anual > 96%, Incremento de ticket promedio +15%.';
      channels = 'Ejecutivo de cuenta dedicado, línea directa VIP y canal digital prioritario.';
    } else if (rank === 1) {
      // Growing / High Potential Segment
      businessName = context.sector.includes('Banca')
        ? 'Clientes en Crecimiento con Demanda de Crédito'
        : context.sector.includes('Telecom')
        ? 'Usuarios Digitales de Consumo Ascendente'
        : 'Clientes Frecuentes con Alto Potencial de Crecimiento';

      tagline = 'Segmento dinámico con excelente respuesta a incentivos y potencial de escalar al segmento VIP.';
      characterization = `Clientes con frecuencia de interacción constante y crecimiento positivo en ${topHigh[0]?.variable || 'consumo'}, pero cuyo ticket promedio o nivel de adopción aún tiene margen de maduración.`;
      keyDifferentiators = `Muestran alta receptividad a promociones y canales digitales, con niveles de ${topHigh[0]?.variable || 'actividad'} superiores al promedio pero sin alcanzar el volumen del segmento líder.`;
      commercialPotential = 'Alto Potencial de Expansión: Son el motor de crecimiento orgánico a mediano plazo si se acompaña su ciclo de vida.';
      associatedRisks = 'Vulnerabilidad ante ofertas agresivas de competidores si perciben falta de incentivos por su lealtad.';
      pricingStrategy = 'Descuentos escalonados por volumen de compra y tarifas con recompensas por recurrencia (ej. cashback o bonificaciones por metas).';
      loyaltyStrategy = 'Gamificación con retos mensuales, acumulación de puntos por hito y aceleradores de estatus.';
      innovationStrategy = 'Soluciones de autoservicio guiado, recomendaciones personalizadas basadas en IA y bundles de productos complementarios.';
      growthStrategy = 'Campañas de Up-selling guiadas hacia planes superiores y paquetes combinados con condiciones preferentes por 6 meses.';
      riskStrategy = 'Detección proactiva de fricciones operativas y encuestas de satisfacción transaccionales automatizadas.';
      kpiTarget = 'Conversión a segmento superior > 20% anual, Crecimiento de facturación +22%.';
      channels = 'App móvil, WhatsApp interactivo y notificaciones push contextuales.';
    } else if (rank === k - 1) {
      // At Risk / Hibernating / Low Engagement
      businessName = context.sector.includes('Banca')
        ? 'Cuentas con Riesgo Crediticio o Inactividad'
        : context.sector.includes('Telecom')
        ? 'Suscriptores en Riesgo de Fuga / Sensibles a Precio'
        : 'Clientes Ocasionales en Riesgo de Abandono';

      tagline = 'Registran baja frecuencia o señales tempranas de desconexión y sensibilidad a costos.';
      characterization = `Este cluster agrupa registros con valores deprimidos en ${topLow.map((d) => d.variable).join(', ') || 'frecuencia y gasto'} o incrementos en variables de riesgo (días de inactividad, morosidad o reclamos).`;
      keyDifferentiators = `Se sitúan significativamente por debajo del promedio global en ${topLow[0]?.variable || 'actividad'} (${topLow[0]?.ratio ? Math.round((1 - topLow[0].ratio) * 100) : 50}% menor).`;
      commercialPotential = 'Bajo a Moderado en volumen actual, pero de alta rentabilidad preventiva si se rescata a los clientes recuperables.';
      associatedRisks = 'Probabilidad inminente de cancelación voluntaria (churn) o incremento de costos de cobranza y soporte.';
      pricingStrategy = 'Planes de retención con precios promocionales temporales, congelamiento de tarifas o esquemas Lite de menor costo de entrada.';
      loyaltyStrategy = 'Campañas de reactivación "Te extrañamos" con incentivos de consumo inmediato sin compromisos forzosos.';
      innovationStrategy = 'Encuestas breves de diagnóstico para descubrir el motivo de desafección y simplificación radical de la experiencia de usuario.';
      growthStrategy = 'Enfoque no en ticket alto sino en reconstruir la recurrencia básica con micro-transacciones.';
      riskStrategy = 'Mapeo de la ruta de abandono, resolución acelerada de quejas pendientes y automatización de alertas de retención.';
      kpiTarget = 'Reducción de tasa de fuga en 30%, Reactivación de al menos el 18% de inactivos.';
      channels = 'Email directo con remitente humano, SMS recordatorio y soporte resolutivo telefónico.';
    } else {
      // Core Middle / Pragmatic / Traditional
      businessName = `Clientes Perfil Estable #${c + 1} (${topHigh[0]?.variable || 'Operativos'})`;
      tagline = 'Base transaccional estable con comportamiento predecible y bajo costo de mantenimiento.';
      characterization = `Clientes con métricas alineadas estrechamente a la media del negocio, que utilizan la solución de forma utilitaria sin requerir atención especializada.`;
      keyDifferentiators = `Consistencia y baja volatilidad en sus indicadores operativos mes a mes.`;
      commercialPotential = 'Medio y Sostenido: Proporcionan el flujo de caja base predecible que amortigua la variabilidad del negocio.';
      associatedRisks = 'Estancamiento: si no se los estimula, tienden a reducir paulatinamente su participación.';
      pricingStrategy = 'Precios estables con compromisos anuales y beneficios por pago anticipado o débito automático.';
      loyaltyStrategy = 'Beneficios de comunidad, descuentos en comercios aliados y sorteos trimestrales.';
      innovationStrategy = 'Tutoriales y cápsulas de descubrimiento para que conozcan módulos que no están aprovechando.';
      growthStrategy = 'Venta cruzada de servicios auxiliares o complementarios de bajo costo.';
      riskStrategy = 'Monitoreo de umbral de actividad trimestral para evitar paso silencioso a la inactividad.';
      kpiTarget = 'Mantenimiento del margen actual, Tasa de adopción de funciones complementarias +12%.';
      channels = 'Portal web de autogestión y boletín informativo mensual con valor agregado.';
    }

    profiles.push({
      clusterId: c,
      businessName,
      tagline,
      size: clusterSizes[c] || 0,
      percentage: clusterPercentages[c] || 0,
      color: getClusterColor(c),
      executiveProfile: {
        characterization,
        keyDifferentiators,
        commercialPotential,
        associatedRisks,
      },
      operationalProfile: {
        keyVariables: topHigh.map((d) => d.variable).slice(0, 3),
        kpiTargets: kpiTarget,
        interactionChannels: channels,
      },
      strategies: {
        pricing: pricingStrategy,
        loyalty: loyaltyStrategy,
        innovation: innovationStrategy,
        growth: growthStrategy,
        riskMitigation: riskStrategy,
      },
      distinctiveFeatures: distinctive,
    });
  }

  // Global Executive Dashboard synthesis
  const dominant = profiles.reduce((max, p) => (p.size > max.size ? p : max), profiles[0]);
  const executiveSummary = `La segmentación en el sector ${context.sector} con objetivo de ${context.objective} identificó exitosamente ${k} agrupaciones estructurales bien diferenciadas con una silueta promedio de ${clusterResult.silhouetteScore.toFixed(3)}. El segmento mayoritario es '${dominant?.businessName || `Segmento ${dominant?.clusterId}`}' con el ${dominant?.percentage}% de la base (${dominant?.size} entidades). La polarización observada valida la necesidad de abandonar la comunicación masiva uniforme y desplegar estrategias hiper-segmentadas de precios, retención y cross-selling.`;

  const quickWins = [
    `Activar protocolo de retención inmediata para '${profiles.find((p) => rankMap[p.clusterId] === k - 1)?.businessName || 'Segmento en Riesgo'}' con oferta promocional de 30 días.`,
    `Lanzar campaña de Cross-selling exclusiva para '${profiles.find((p) => rankMap[p.clusterId] === 1)?.businessName || 'Segmento en Crecimiento'}' enfocada en escalar su ticket promedio.`,
    `Implementar canal de atención VIP sin espera para '${profiles.find((p) => rankMap[p.clusterId] === 0)?.businessName || 'Segmento Líder'}' protegiendo el 80% de la rentabilidad.`,
  ];

  const strategicBets = [
    `Reestructurar la matriz de precios y paquetes para alinear los beneficios con los patrones de uso del ${dominant?.businessName}.`,
    `Integrar la asignación de clusters al CRM operativo para disparar flujos de trabajo automatizados según la transición de estado de cada cliente.`,
  ];

  return {
    profiles,
    globalDashboard: {
      executiveSummary,
      quickWins,
      strategicBets,
      totalEntities: clusterResult.assignments.length,
      kCount: k,
      dominantSegment: dominant?.businessName || '',
      averageSilhouette: clusterResult.silhouetteScore,
      topDrivers: clusterResult.featuresUsed.slice(0, 4),
    },
  };
}

// Request AI interpretation via server Gemini endpoint with fallback to heuristic
export async function fetchAIInterpretation(
  clusterResult: ClusterResult,
  context: BusinessContext,
  overallMeans: Record<string, number>
): Promise<{ profiles: ClusterBusinessProfile[]; globalDashboard: GlobalExecutiveDashboard; source: string }> {
  // Always compute base heuristic first to guarantee instant availability
  const fallback = generateHeuristicProfiles(clusterResult, context, overallMeans);

  try {
    const payload = {
      sector: context.sector,
      objective: context.objective,
      segments: fallback.profiles.map((p) => ({
        clusterId: p.clusterId,
        size: p.size,
        percentage: p.percentage,
        centroids: clusterResult.centroids[p.clusterId],
        topDistinctive: p.distinctiveFeatures.slice(0, 4),
      })),
      variableSummaries: clusterResult.featuresUsed.map((feat) => ({
        variable: feat,
        overallMean: overallMeans[feat],
      })),
    };

    const response = await fetch('/api/gemini/interpret-segments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn('Backend returned non-ok for Gemini interpretation, using heuristic profiles.');
      return { ...fallback, source: 'heuristic' };
    }

    const json = await response.json();
    if (!json.data || !json.data.segments) {
      return { ...fallback, source: json.source || 'heuristic' };
    }

    const aiData = json.data;
    // Merge AI generated texts with math metrics and colors
    const enrichedProfiles: ClusterBusinessProfile[] = fallback.profiles.map((baseP) => {
      const match = aiData.segments.find((s: any) => s.clusterId === baseP.clusterId);
      if (!match) return baseP;

      return {
        ...baseP,
        businessName: match.businessName || baseP.businessName,
        tagline: match.tagline || baseP.tagline,
        executiveProfile: {
          characterization: match.executiveProfile?.characterization || baseP.executiveProfile.characterization,
          keyDifferentiators: match.executiveProfile?.keyDifferentiators || baseP.executiveProfile.keyDifferentiators,
          commercialPotential: match.executiveProfile?.commercialPotential || baseP.executiveProfile.commercialPotential,
          associatedRisks: match.executiveProfile?.associatedRisks || baseP.executiveProfile.associatedRisks,
        },
        operationalProfile: {
          keyVariables: match.operationalProfile?.keyVariables || baseP.operationalProfile.keyVariables,
          kpiTargets: match.operationalProfile?.kpiTargets || baseP.operationalProfile.kpiTargets,
          interactionChannels: match.operationalProfile?.interactionChannels || baseP.operationalProfile.interactionChannels,
        },
        strategies: {
          pricing: match.strategies?.pricing || baseP.strategies.pricing,
          loyalty: match.strategies?.loyalty || baseP.strategies.loyalty,
          innovation: match.strategies?.innovation || baseP.strategies.innovation,
          growth: match.strategies?.growth || baseP.strategies.growth,
          riskMitigation: match.strategies?.riskMitigation || baseP.strategies.riskMitigation,
        },
      };
    });

    return {
      profiles: enrichedProfiles,
      globalDashboard: {
        executiveSummary: aiData.executiveSummary || fallback.globalDashboard.executiveSummary,
        quickWins: aiData.quickWins || fallback.globalDashboard.quickWins,
        strategicBets: aiData.strategicBets || fallback.globalDashboard.strategicBets,
        totalEntities: fallback.globalDashboard.totalEntities,
        kCount: fallback.globalDashboard.kCount,
        dominantSegment: enrichedProfiles.reduce((max, p) => (p.size > max.size ? p : max), enrichedProfiles[0]).businessName,
        averageSilhouette: fallback.globalDashboard.averageSilhouette,
        topDrivers: fallback.globalDashboard.topDrivers,
      },
      source: 'gemini-3.8-flash',
    };
  } catch (err) {
    console.warn('Failed to call Gemini API, smoothly using heuristic engine:', err);
    return { ...fallback, source: 'heuristic' };
  }
}
