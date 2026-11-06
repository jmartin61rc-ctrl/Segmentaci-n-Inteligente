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

// Export Presentation HTML / PowerPoint Slides Deck
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
  <title>Presentación Ejecutiva - Segmentación Inteligente</title>
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #0b0f19; color: #f8fafc; margin: 0; padding: 20px; }
    .slide { max-width: 1000px; margin: 40px auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 48px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); page-break-after: always; }
    h1 { color: #6366f1; font-size: 32px; margin-top: 0; }
    h2 { color: #38bdf8; font-size: 24px; border-bottom: 1px solid #374151; padding-bottom: 12px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 24px; }
    .card { background: #1f2937; padding: 20px; border-radius: 12px; border-left: 4px solid #6366f1; }
    .badge { display: inline-block; padding: 4px 12px; background: #312e81; color: #c7d2fe; border-radius: 6px; font-size: 13px; font-weight: 600; margin-bottom: 8px; }
    .metric { font-size: 36px; font-weight: 800; color: #f8fafc; }
    .sub { color: #94a3b8; font-size: 14px; margin-top: 4px; }
    ul { padding-left: 20px; line-height: 1.6; color: #cbd5e1; }
    @media print {
      body { background: #ffffff !important; color: #0f172a !important; }
      .slide { background: #ffffff !important; border: 1px solid #e2e8f0 !important; color: #0f172a !important; box-shadow: none !important; }
      h1, h2 { color: #1e1b4b !important; }
      .card { background: #f8fafc !important; border: 1px solid #cbd5e1 !important; color: #0f172a !important; }
      .badge { background: #e0e7ff !important; color: #3730a3 !important; }
      .metric { color: #0f172a !important; }
      .sub, ul { color: #334155 !important; }
    }
  </style>
</head>
<body>
  <!-- Slide 1: Portada -->
  <div class="slide">
    <span class="badge">ESTRATEGIA ANALÍTICA DE CLIENTES</span>
    <h1>Intelligent Segmentation Platform</h1>
    <p style="font-size: 18px; color: #94a3b8;">Clustering Asistido por Inteligencia Artificial y Acciones Comerciales</p>
    <div style="margin-top: 40px; border-top: 1px solid #374151; padding-top: 24px;">
      <p><strong>Sector:</strong> ${context.sector}</p>
      <p><strong>Objetivo:</strong> ${context.objective}</p>
      <p><strong>Dataset:</strong> ${dataset.fileName} (${clusterResult.assignments.length} registros)</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
  </div>

  <!-- Slide 2: Resumen Ejecutivo -->
  <div class="slide">
    <h2>01. Resumen Ejecutivo y Hallazgos Macro</h2>
    <p style="font-size: 16px; line-height: 1.7; color: #e2e8f0;">${dashboard.executiveSummary}</p>
    <div class="grid">
      <div class="card">
        <div class="badge">QUICK WINS (0-30 DÍAS)</div>
        <ul>
          ${dashboard.quickWins.map((qw) => `<li>${qw}</li>`).join('')}
        </ul>
      </div>
      <div class="card">
        <div class="badge">APUESTAS ESTRATÉGICAS (30-90 DÍAS)</div>
        <ul>
          ${dashboard.strategicBets.map((sb) => `<li>${sb}</li>`).join('')}
        </ul>
      </div>
    </div>
  </div>

  <!-- Slide 3: Panorama de Segmentos -->
  <div class="slide">
    <h2>02. Panorama General de Segmentos (K = ${clusterResult.k})</h2>
    <div class="grid">
      ${profiles
        .map(
          (p) => `
        <div class="card" style="border-left-color: ${p.color};">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 18px; color: ${p.color};">${p.businessName}</strong>
            <span style="font-weight: 700;">${p.percentage}% (${p.size})</span>
          </div>
          <p class="sub">${p.tagline}</p>
          <div style="margin-top: 12px; font-size: 13px; color: #cbd5e1;">
            <strong>Potencial:</strong> ${p.executiveProfile.commercialPotential}<br/>
            <strong>Riesgo:</strong> ${p.executiveProfile.associatedRisks}
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  </div>

  <!-- Slide 4+: Detalles por segmento -->
  ${profiles
    .map(
      (p, i) => `
    <div class="slide">
      <h2>03.${i + 1}. Detalle Estratégico: ${p.businessName}</h2>
      <p class="sub" style="font-size: 16px;">${p.tagline} &middot; <strong>${p.size} entidades (${p.percentage}%)</strong></p>
      
      <div class="card" style="margin-top: 20px;">
        <h4 style="margin: 0 0 8px 0; color: #38bdf8;">Perfil Ejecutivo</h4>
        <p style="font-size: 14px; margin: 0 0 8px 0;">${p.executiveProfile.characterization}</p>
        <p style="font-size: 14px; margin: 0; color: #94a3b8;"><strong>Diferenciador:</strong> ${p.executiveProfile.keyDifferentiators}</p>
      </div>

      <div class="grid" style="margin-top: 20px;">
        <div class="card">
          <strong style="color: #a78bfa;">Estrategia de Precios</strong>
          <p style="font-size: 13px; margin-top: 6px;">${p.strategies.pricing}</p>
        </div>
        <div class="card">
          <strong style="color: #34d399;">Fidelización & Retención</strong>
          <p style="font-size: 13px; margin-top: 6px;">${p.strategies.loyalty}</p>
        </div>
        <div class="card">
          <strong style="color: #38bdf8;">Innovación & Personalización</strong>
          <p style="font-size: 13px; margin-top: 6px;">${p.strategies.innovation}</p>
        </div>
        <div class="card">
          <strong style="color: #fbbf24;">Crecimiento (Cross & Up-sell)</strong>
          <p style="font-size: 13px; margin-top: 6px;">${p.strategies.growth}</p>
        </div>
      </div>
    </div>
  `
    )
    .join('')}

  <script>
    // Auto-trigger print to save as PDF or view as slides
    console.log('Deck cargado exitosamente. Use Ctrl+P para guardar como PDF.');
  </script>
</body>
</html>`;

  const blob = new Blob([slidesHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Presentacion_Segmentacion_Ejecutiva_K${clusterResult.k}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
