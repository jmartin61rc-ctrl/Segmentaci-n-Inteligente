import * as XLSX from 'xlsx';
import {
  BusinessContext,
  ClusterBusinessProfile,
  ClusterResult,
  Dataset,
  GlobalExecutiveDashboard,
} from '../types/segmentation';

// Export Multi-Sheet Excel (.xlsx)
export function exportToExcel(
  dataset: Dataset,
  clusterResult: ClusterResult,
  profiles: ClusterBusinessProfile[],
  dashboard: GlobalExecutiveDashboard,
  context: BusinessContext
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Resumen Ejecutivo
  const resumenData = [
    ['PLATAFORMA INTELIGENTE DE SEGMENTACIÓN - REPORTE EJECUTIVO'],
    ['Fecha de Generación', new Date().toLocaleString()],
    ['Sector de Negocio', context.sector],
    ['Objetivo Estratégico', context.objective],
    ['KPI Principal', context.primaryKPI],
    ['Archivo Origen', dataset.fileName],
    ['Total Entidades / Clientes', clusterResult.assignments.length],
    ['Algoritmo de Clustering', clusterResult.algorithm.toUpperCase()],
    ['Número de Clusters (K)', clusterResult.k],
    ['Calidad Silhouette Score', clusterResult.silhouetteScore],
    ['Inercia WSS', clusterResult.wss],
    ['Segmento Dominante', dashboard.dominantSegment],
    [],
    ['SÍNTESIS EJECUTIVA GLOBAL'],
    [dashboard.executiveSummary],
    [],
    ['ACCIONES RÁPIDAS (QUICK WINS 0-30 DÍAS)'],
    ...dashboard.quickWins.map((qw, i) => [`${i + 1}.`, qw]),
    [],
    ['APUESTAS ESTRATÉGICAS (30-90 DÍAS)'],
    ...dashboard.strategicBets.map((sb, i) => [`${i + 1}.`, sb]),
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen_Ejecutivo');

  // Sheet 2: Perfiles de Segmento
  const perfilesRows = profiles.map((p) => ({
    Cluster_ID: p.clusterId + 1,
    Nombre_Comercial: p.businessName,
    Lema_Tagline: p.tagline,
    Tamaño_Entidades: p.size,
    Participacion_Pct: `${p.percentage}%`,
    Caracterizacion: p.executiveProfile.characterization,
    Diferenciadores_Clave: p.executiveProfile.keyDifferentiators,
    Potencial_Comercial: p.executiveProfile.commercialPotential,
    Riesgos_Asociados: p.executiveProfile.associatedRisks,
    KPIs_Operativos: p.operationalProfile.kpiTargets,
    Canales_Atencion: p.operationalProfile.interactionChannels,
  }));
  const wsPerfiles = XLSX.utils.json_to_sheet(perfilesRows);
  XLSX.utils.book_append_sheet(wb, wsPerfiles, 'Perfiles_Segmentos');

  // Sheet 3: Estrategias de Negocio
  const estrategiasRows = profiles.map((p) => ({
    Cluster_ID: p.clusterId + 1,
    Nombre_Comercial: p.businessName,
    Estrategia_Precios: p.strategies.pricing,
    Estrategia_Fidelizacion: p.strategies.loyalty,
    Estrategia_Innovacion: p.strategies.innovation,
    Estrategia_Crecimiento_CrossUpSell: p.strategies.growth,
    Estrategia_Gestion_Riesgo_Churn: p.strategies.riskMitigation,
  }));
  const wsEstrategias = XLSX.utils.json_to_sheet(estrategiasRows);
  XLSX.utils.book_append_sheet(wb, wsEstrategias, 'Estrategias_Negocio');

  // Sheet 4: Centroides en Valores Reales
  const centroidesRows = profiles.map((p) => {
    const row: Record<string, any> = {
      Cluster_ID: p.clusterId + 1,
      Nombre_Comercial: p.businessName,
      Participacion: `${p.percentage}%`,
    };
    for (const feat of clusterResult.featuresUsed) {
      row[feat] = clusterResult.centroids[p.clusterId]?.[feat] ?? 0;
    }
    return row;
  });
  const wsCentroides = XLSX.utils.json_to_sheet(centroidesRows);
  XLSX.utils.book_append_sheet(wb, wsCentroides, 'Centroides_Reales');

  // Sheet 5: Base de Datos Segmentada
  const clusterNameMap = new Map<number, string>();
  profiles.forEach((p) => clusterNameMap.set(p.clusterId, p.businessName));

  const baseSegmentada = dataset.rows.map((row, idx) => {
    const cId = clusterResult.assignments[idx] ?? 0;
    return {
      ...row,
      CLUSTER_ASIGNADO: cId + 1,
      NOMBRE_SEGMENTO: clusterNameMap.get(cId) || `Cluster ${cId + 1}`,
    };
  });
  const wsBase = XLSX.utils.json_to_sheet(baseSegmentada);
  XLSX.utils.book_append_sheet(wb, wsBase, 'Base_Segmentada');

  // Save XLSX file
  const fileName = `Segmentacion_${context.sector.replace(/[^a-zA-Z0-9]/g, '_')}_K${clusterResult.k}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// Export CSV of segmented data
export function exportToCSV(
  dataset: Dataset,
  clusterResult: ClusterResult,
  profiles: ClusterBusinessProfile[]
) {
  const clusterNameMap = new Map<number, string>();
  profiles.forEach((p) => clusterNameMap.set(p.clusterId, p.businessName));

  const baseSegmentada = dataset.rows.map((row, idx) => {
    const cId = clusterResult.assignments[idx] ?? 0;
    return {
      ...row,
      CLUSTER_ID: cId + 1,
      NOMBRE_SEGMENTO: clusterNameMap.get(cId) || `Cluster ${cId + 1}`,
    };
  });

  const ws = XLSX.utils.json_to_sheet(baseSegmentada);
  const csvOutput = XLSX.utils.sheet_to_csv(ws);

  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Clientes_Segmentados_K${clusterResult.k}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export Presentation HTML / PowerPoint Slides Deck (McKinsey / Bain / Deloitte Consulting Style)
export function exportPresentationDeck(
  dataset: Dataset,
  clusterResult: ClusterResult,
  profiles: ClusterBusinessProfile[],
  dashboard: GlobalExecutiveDashboard,
  context: BusinessContext
) {
  const slidesHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Entregable de Consultoría Estratégica - Intelligent Segmentation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: #0a0f1d; color: #f1f5f9; margin: 0; padding: 32px 16px; -webkit-font-smoothing: antialiased; }
    .slide { max-width: 1120px; min-height: 630px; margin: 32px auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 48px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); page-break-after: always; display: flex; flex-col; justify-content: space-between; }
    .slide-header { border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
    .slide-title { font-size: 24px; font-weight: 700; color: #f8fafc; margin: 0; }
    .slide-category { font-size: 11px; text-transform: uppercase; font-weight: 600; color: #3b82f6; letter-spacing: 0.05em; margin-bottom: 4px; display: block; }
    .slide-footer { border-top: 1px solid #1e293b; padding-top: 14px; margin-top: 24px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .consulting-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; }
    .card-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin: 0 0 8px 0; }
    .metric-value { font-size: 32px; font-weight: 800; color: #38bdf8; font-family: 'JetBrains Mono', monospace; }
    .pillar-box { background: #131d31; border: 1px solid #1e293b; border-radius: 8px; padding: 18px; }
    .pillar-title { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; }
    ul { margin: 8px 0 0 0; padding-left: 18px; line-height: 1.6; font-size: 13px; color: #cbd5e1; }
    @media print {
      body { background: #ffffff !important; color: #0f172a !important; padding: 0 !important; }
      .slide { background: #ffffff !important; border: 1px solid #cbd5e1 !important; color: #0f172a !important; box-shadow: none !important; margin: 0 0 20px 0 !important; min-height: 95vh !important; }
      .slide-header { border-bottom-color: #e2e8f0 !important; }
      .slide-title { color: #0f172a !important; }
      .consulting-card, .pillar-box { background: #f8fafc !important; border-color: #cbd5e1 !important; color: #0f172a !important; }
      .card-title { color: #475569 !important; }
      .metric-value { color: #1d4ed8 !important; }
      ul { color: #334155 !important; }
      .slide-footer { border-top-color: #e2e8f0 !important; color: #64748b !important; }
    }
  </style>
</head>
<body>
  <!-- Slide 1: Portada Ejecutiva Consultoría -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <span class="slide-category">DIAGNÓSTICO ESTRATÉGICO DE CLIENTES</span>
        <h1 class="slide-title" style="font-size: 32px;">Segmentación Inteligente & Acciones Comerciales</h1>
      </div>
      <span style="font-size: 12px; color: #94a3b8; font-mono;">CONFIDENCIAL // ALTA DIRECCIÓN</span>
    </div>
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 24px;">
      <div class="consulting-card" style="padding: 28px;">
        <p style="font-size: 18px; line-height: 1.6; color: #e2e8f0; margin: 0;">
          <strong>Sector:</strong> ${context.sector} &nbsp;|&nbsp; <strong>Objetivo:</strong> ${context.objective}
        </p>
        <p style="font-size: 14px; color: #94a3b8; margin: 8px 0 0 0;">
          Base Analizada: ${dataset.fileName} &middot; ${clusterResult.assignments.length.toLocaleString()} entidades segmentadas con K = ${clusterResult.k} clusters.
        </p>
      </div>
      <div class="grid-4">
        <div class="consulting-card">
          <div class="card-title">CALIDAD DE CLUSTERING</div>
          <div class="metric-value">${clusterResult.silhouetteScore.toFixed(2)}</div>
          <div style="font-size: 11px; color: #10b981; margin-top: 4px;">★ ${dashboard.silhouetteQuality?.label || 'Separabilidad Fuerte'}</div>
        </div>
        <div class="consulting-card">
          <div class="card-title">INERCIA INTRA-GRUPO</div>
          <div class="metric-value" style="color: #a78bfa;">${clusterResult.wss.toFixed(0)}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">WSS Convergencia</div>
        </div>
        <div class="consulting-card">
          <div class="card-title">SEGMENTO MAYORITARIO</div>
          <div style="font-size: 16px; font-weight: 700; color: #f8fafc; margin-top: 6px;">${dashboard.dominantSegment}</div>
          <div style="font-size: 11px; color: #38bdf8; margin-top: 4px;">Máximo volumen</div>
        </div>
        <div class="consulting-card">
          <div class="card-title">FECHA DE EMISIÓN</div>
          <div style="font-size: 15px; font-weight: 600; color: #f8fafc; margin-top: 8px;">${new Date().toLocaleDateString()}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Modelo Auditado</div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Intelligent Segmentation Platform &middot; Executive Deliverable</span>
      <span>Página 1</span>
    </div>
  </div>

  <!-- Slide 2: Resumen Ejecutivo e Insights Clave -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <span class="slide-category">SÍNTESIS DE ALTA DIRECCIÓN</span>
        <h2 class="slide-title">01. Resumen Ejecutivo & 4 Pilares de Decisión</h2>
      </div>
      <span style="font-size: 12px; color: #94a3b8;">HALLAZGOS CLAVE</span>
    </div>
    <div style="flex: 1; display: flex; flex-direction: column; gap: 20px;">
      <div class="consulting-card" style="padding: 18px;">
        <p style="font-size: 14px; line-height: 1.6; margin: 0; color: #e2e8f0;">
          ${dashboard.executiveSummary}
        </p>
      </div>
      <div class="grid-2">
        <div class="pillar-box" style="border-left: 4px solid #3b82f6;">
          <div class="pillar-title" style="color: #60a5fa;">1. Hallazgo Principal</div>
          <p style="font-size: 12px; color: #cbd5e1; margin: 0; line-height: 1.5;">${dashboard.insights.mainFinding}</p>
        </div>
        <div class="pillar-box" style="border-left: 4px solid #f59e0b;">
          <div class="pillar-title" style="color: #fbbf24;">2. Riesgo Comercial</div>
          <p style="font-size: 12px; color: #cbd5e1; margin: 0; line-height: 1.5;">${dashboard.insights.mainRisk}</p>
        </div>
        <div class="pillar-box" style="border-left: 4px solid #10b981;">
          <div class="pillar-title" style="color: #34d399;">3. Oportunidad de Margen</div>
          <p style="font-size: 12px; color: #cbd5e1; margin: 0; line-height: 1.5;">${dashboard.insights.mainOpportunity}</p>
        </div>
        <div class="pillar-box" style="border-left: 4px solid #8b5cf6;">
          <div class="pillar-title" style="color: #a78bfa;">4. Recomendación Prioritaria</div>
          <p style="font-size: 12px; color: #cbd5e1; margin: 0; line-height: 1.5;">${dashboard.insights.mainRecommendation}</p>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Intelligent Segmentation Platform &middot; Executive Deliverable</span>
      <span>Página 2</span>
    </div>
  </div>

  <!-- Slide 3: Portafolio de Segmentos -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <span class="slide-category">ESTRUCTURA DE CARTERA</span>
        <h2 class="slide-title">02. Portafolio de Segmentos (K = ${clusterResult.k})</h2>
      </div>
      <span style="font-size: 12px; color: #94a3b8;">DISTRIBUCIÓN Y VALOR</span>
    </div>
    <div style="flex: 1; display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
      ${profiles.map((p) => `
        <div class="consulting-card" style="border-left: 4px solid ${p.color};">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <strong style="font-size: 15px; color: #f8fafc;">${p.businessName}</strong>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #38bdf8;">${p.percentage}% (${p.size})</span>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 10px 0; font-style: italic;">${p.tagline}</p>
          <div style="font-size: 11px; color: #cbd5e1; line-height: 1.5;">
            <strong>Potencial:</strong> ${p.executiveProfile.commercialPotential}<br/>
            <strong>Diferenciador:</strong> ${p.executiveProfile.keyDifferentiators}
          </div>
          <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #334155; font-size: 11px; color: #38bdf8;">
            <strong>Acción Precios:</strong> ${p.strategies.pricing}
          </div>
        </div>
      `).join('')}
    </div>
    <div class="slide-footer">
      <span>Intelligent Segmentation Platform &middot; Executive Deliverable</span>
      <span>Página 3</span>
    </div>
  </div>

  <!-- Slide 4: Roadmap 30-90 Días -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <span class="slide-category">PLAN DE ACTIVACIÓN</span>
        <h2 class="slide-title">03. Roadmap de Implementación (30 a 90 Días)</h2>
      </div>
      <span style="font-size: 12px; color: #10b981; font-weight: 600;">EJECUCIÓN INMEDIATA</span>
    </div>
    <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div class="consulting-card" style="border-top: 3px solid #10b981;">
        <div class="card-title" style="color: #34d399;">FASE 1: QUICK WINS (0 A 30 DÍAS)</div>
        <ul>
          ${dashboard.quickWins.map((qw) => `<li>${qw}</li>`).join('')}
        </ul>
      </div>
      <div class="consulting-card" style="border-top: 3px solid #3b82f6;">
        <div class="card-title" style="color: #60a5fa;">FASE 2: APUESTAS ESTRATÉGICAS (30 A 90 DÍAS)</div>
        <ul>
          ${dashboard.strategicBets.map((sb) => `<li>${sb}</li>`).join('')}
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Intelligent Segmentation Platform &middot; Executive Deliverable</span>
      <span>Página 4</span>
    </div>
  </div>

  <script>
    console.log('Presentación ejecutiva cargada. Presione Ctrl+P para guardar como PDF.');
  </script>
</body>
</html>`;

  const blob = new Blob([slidesHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Presentacion_Consultoria_Segmentacion_K${clusterResult.k}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

