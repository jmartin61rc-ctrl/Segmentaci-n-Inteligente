import { Dataset, VariableMetadata } from '../types/segmentation';

// Seeded pseudorandom number generator for reproducible realistic enterprise datasets
function createRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function gaussianRandom(rng: () => number, mean: number, std: number): number {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return Math.max(0, num * std + mean);
}

// 1. Retail E-Commerce (RFM & LTV)
function generateRetailDataset(): Record<string, any>[] {
  const rng = createRng(104729);
  const rows: Record<string, any>[] = [];
  const channels = ['App Móvil', 'Sitio Web', 'Tienda Física', 'Marketplace'];

  // 4 latent archetype segments to guarantee meaningful clustering
  for (let i = 1; i <= 320; i++) {
    const archetype = i % 4;
    let recency = 0;
    let frequency = 0;
    let totalSpend = 0;
    let returnRate = 0;
    let visits = 0;
    let tenure = 0;

    if (archetype === 0) {
      // VIP Champions: High spend, very frequent, low recency, loyal
      recency = Math.round(gaussianRandom(rng, 14, 8));
      frequency = Math.round(gaussianRandom(rng, 36, 10)) + 12;
      totalSpend = Math.round(gaussianRandom(rng, 4200, 950));
      returnRate = Number((gaussianRandom(rng, 3.2, 1.5)).toFixed(1));
      visits = Math.round(gaussianRandom(rng, 45, 12));
      tenure = Math.round(gaussianRandom(rng, 38, 8)) + 10;
    } else if (archetype === 1) {
      // Potential Loyals / Growing: Moderate frequency, good spend, recent
      recency = Math.round(gaussianRandom(rng, 28, 12));
      frequency = Math.round(gaussianRandom(rng, 18, 5)) + 4;
      totalSpend = Math.round(gaussianRandom(rng, 1750, 400));
      returnRate = Number((gaussianRandom(rng, 6.5, 2.2)).toFixed(1));
      visits = Math.round(gaussianRandom(rng, 26, 8));
      tenure = Math.round(gaussianRandom(rng, 18, 6)) + 3;
    } else if (archetype === 2) {
      // Occasional / Discount Hunters: Low ticket, high returns, medium recency
      recency = Math.round(gaussianRandom(rng, 85, 25));
      frequency = Math.round(gaussianRandom(rng, 5, 2)) + 1;
      totalSpend = Math.round(gaussianRandom(rng, 410, 150));
      returnRate = Number((gaussianRandom(rng, 14.8, 4.5)).toFixed(1));
      visits = Math.round(gaussianRandom(rng, 14, 6));
      tenure = Math.round(gaussianRandom(rng, 12, 5)) + 1;
    } else {
      // Hibernating / Churn Risk: High recency (dormant), formerly frequent, low web visits
      recency = Math.round(gaussianRandom(rng, 195, 45));
      frequency = Math.round(gaussianRandom(rng, 7, 3)) + 1;
      totalSpend = Math.round(gaussianRandom(rng, 880, 280));
      returnRate = Number((gaussianRandom(rng, 9.1, 3.0)).toFixed(1));
      visits = Math.round(gaussianRandom(rng, 4, 2));
      tenure = Math.round(gaussianRandom(rng, 29, 9)) + 6;
    }

    const ticketAvg = frequency > 0 ? Number((totalSpend / frequency).toFixed(1)) : totalSpend;

    rows.push({
      ID_Cliente: `RET-${10000 + i}`,
      Recency_Dias: Math.max(1, recency),
      Frecuencia_Anual: Math.max(1, frequency),
      Gasto_Total_USD: Math.max(80, totalSpend),
      Ticket_Promedio_USD: Math.max(15, ticketAvg),
      Tasa_Devolucion_Pct: Math.min(45, Math.max(0, returnRate)),
      Visitas_Web_Mes: Math.max(1, visits),
      Antiguedad_Meses: Math.max(1, tenure),
      Canal_Preferido: channels[Math.floor(rng() * channels.length)],
    });
  }
  return rows;
}

// 2. Banca y Finanzas (Credit Risk & Banking Engagement)
function generateBankingDataset(): Record<string, any>[] {
  const rng = createRng(982451653);
  const rows: Record<string, any>[] = [];
  const tiers = ['Personal', 'Preferente', 'Banca Privada', 'PYME'];

  for (let i = 1; i <= 300; i++) {
    const archetype = i % 4;
    let ingreso = 0;
    let saldo = 0;
    let usoCredito = 0;
    let moraDias = 0;
    let txMensuales = 0;
    let score = 0;
    let antiguedad = 0;

    if (archetype === 0) {
      // High Net Worth / Low Risk
      ingreso = Math.round(gaussianRandom(rng, 8500, 1800));
      saldo = Math.round(gaussianRandom(rng, 24000, 6500));
      usoCredito = Number(gaussianRandom(rng, 22, 8).toFixed(1));
      moraDias = 0;
      txMensuales = Math.round(gaussianRandom(rng, 42, 10));
      score = Math.round(gaussianRandom(rng, 810, 35));
      antiguedad = Math.round(gaussianRandom(rng, 8.5, 2.5));
    } else if (archetype === 1) {
      // Middle Class Engaged & Credit Revolvers
      ingreso = Math.round(gaussianRandom(rng, 3400, 750));
      saldo = Math.round(gaussianRandom(rng, 4800, 1200));
      usoCredito = Number(gaussianRandom(rng, 68, 14).toFixed(1));
      moraDias = Math.floor(rng() * 4);
      txMensuales = Math.round(gaussianRandom(rng, 31, 8));
      score = Math.round(gaussianRandom(rng, 690, 45));
      antiguedad = Math.round(gaussianRandom(rng, 4.2, 1.8));
    } else if (archetype === 2) {
      // Young Digital Natives / Low Balance
      ingreso = Math.round(gaussianRandom(rng, 1600, 400));
      saldo = Math.round(gaussianRandom(rng, 1100, 350));
      usoCredito = Number(gaussianRandom(rng, 38, 12).toFixed(1));
      moraDias = Math.floor(rng() * 2);
      txMensuales = Math.round(gaussianRandom(rng, 54, 15));
      score = Math.round(gaussianRandom(rng, 630, 40));
      antiguedad = Math.round(gaussianRandom(rng, 1.8, 0.8));
    } else {
      // Stressed Debt / High Credit Risk
      ingreso = Math.round(gaussianRandom(rng, 2100, 500));
      saldo = Math.round(gaussianRandom(rng, 550, 220));
      usoCredito = Number(gaussianRandom(rng, 91, 7).toFixed(1));
      moraDias = Math.round(gaussianRandom(rng, 34, 16));
      txMensuales = Math.round(gaussianRandom(rng, 18, 6));
      score = Math.round(gaussianRandom(rng, 520, 50));
      antiguedad = Math.round(gaussianRandom(rng, 3.5, 1.5));
    }

    rows.push({
      ID_Cliente: `BNK-${20000 + i}`,
      Ingreso_Mensual_USD: Math.max(600, ingreso),
      Saldo_Promedio_USD: Math.max(50, saldo),
      Uso_Tarjeta_Pct: Math.min(100, Math.max(5, usoCredito)),
      Dias_Mora: Math.max(0, moraDias),
      Transacciones_Mes: Math.max(2, txMensuales),
      Score_Crediticio: Math.min(850, Math.max(300, score)),
      Antiguedad_Anios: Math.max(0.5, antiguedad),
      Segmento_Registro: tiers[Math.floor(rng() * tiers.length)],
    });
  }
  return rows;
}

// 3. Telecomunicaciones (B2C Churn & Usage Patterns)
function generateTelecomDataset(): Record<string, any>[] {
  const rng = createRng(456789123);
  const rows: Record<string, any>[] = [];
  const planNames = ['Fibra + Móvil 5G', 'Ilimitado Plus', 'Prepago Flex', 'Control Familiar'];

  for (let i = 1; i <= 350; i++) {
    const archetype = i % 4;
    let gb = 0;
    let minutos = 0;
    let arpu = 0;
    let antiguedad = 0;
    let reclamos = 0;
    let descuento = 0;
    let streaming = 0;

    if (archetype === 0) {
      // Data Heavy Streamers: High GB, high streaming, high ARPU
      gb = Math.round(gaussianRandom(rng, 92, 22));
      minutos = Math.round(gaussianRandom(rng, 320, 80));
      arpu = Number(gaussianRandom(rng, 68, 12).toFixed(1));
      antiguedad = Math.round(gaussianRandom(rng, 28, 9));
      reclamos = Math.floor(rng() * 2);
      descuento = Math.round(gaussianRandom(rng, 10, 5));
      streaming = Math.round(gaussianRandom(rng, 28, 8));
    } else if (archetype === 1) {
      // Traditional Voice & Stable: Low data, high voice minutes, loyal
      gb = Math.round(gaussianRandom(rng, 12, 5));
      minutos = Math.round(gaussianRandom(rng, 750, 150));
      arpu = Number(gaussianRandom(rng, 38, 6).toFixed(1));
      antiguedad = Math.round(gaussianRandom(rng, 54, 16));
      reclamos = Math.floor(rng() * 1.5);
      descuento = Math.round(gaussianRandom(rng, 15, 6));
      streaming = Math.round(gaussianRandom(rng, 4, 2));
    } else if (archetype === 2) {
      // Price Sensitive & Low Consumption: Very low ARPU, high discount
      gb = Math.round(gaussianRandom(rng, 18, 7));
      minutos = Math.round(gaussianRandom(rng, 180, 50));
      arpu = Number(gaussianRandom(rng, 19, 4).toFixed(1));
      antiguedad = Math.round(gaussianRandom(rng, 14, 6));
      reclamos = Math.floor(rng() * 2);
      descuento = Math.round(gaussianRandom(rng, 35, 10));
      streaming = Math.round(gaussianRandom(rng, 8, 3));
    } else {
      // Dissatisfied High Churn Risk: Multiple tickets, declining usage, high bill
      gb = Math.round(gaussianRandom(rng, 45, 15));
      minutos = Math.round(gaussianRandom(rng, 240, 70));
      arpu = Number(gaussianRandom(rng, 59, 10).toFixed(1));
      antiguedad = Math.round(gaussianRandom(rng, 19, 8));
      reclamos = Math.round(gaussianRandom(rng, 4.8, 1.6)) + 2;
      descuento = Math.round(gaussianRandom(rng, 5, 4));
      streaming = Math.round(gaussianRandom(rng, 12, 5));
    }

    rows.push({
      ID_Suscriptor: `TEL-${30000 + i}`,
      Consumo_GB_Mes: Math.max(1, gb),
      Minutos_Voz_Mes: Math.max(10, minutos),
      Gasto_Mensual_USD: Math.max(10, arpu),
      Antiguedad_Meses: Math.max(1, antiguedad),
      Reclamos_Soporte: Math.max(0, reclamos),
      Descuento_Activo_Pct: Math.min(70, Math.max(0, descuento)),
      Horas_Streaming_Semana: Math.max(0, streaming),
      Tipo_Plan: planNames[Math.floor(rng() * planNames.length)],
    });
  }
  return rows;
}

// 4. B2B SaaS (Product Led Growth & Enterprise Accounts)
function generateSaasDataset(): Record<string, any>[] {
  const rng = createRng(777123999);
  const rows: Record<string, any>[] = [];
  const industries = ['Fintech', 'Healthtech', 'E-Commerce', 'Logistics', 'EdTech'];

  for (let i = 1; i <= 280; i++) {
    const archetype = i % 4;
    let mrr = 0;
    let dau = 0;
    let featureAdoption = 0;
    let tickets = 0;
    let sessions = 0;
    let contractMonths = 0;
    let nps = 0;

    if (archetype === 0) {
      // Enterprise Power Accounts
      mrr = Math.round(gaussianRandom(rng, 6400, 1400));
      dau = Math.round(gaussianRandom(rng, 185, 40));
      featureAdoption = Number(gaussianRandom(rng, 84, 8).toFixed(1));
      tickets = Math.round(gaussianRandom(rng, 3, 1.5));
      sessions = Math.round(gaussianRandom(rng, 22, 5));
      contractMonths = 24;
      nps = Math.round(gaussianRandom(rng, 9.2, 0.8));
    } else if (archetype === 1) {
      // Rapid Expansion / Fast Adopters
      mrr = Math.round(gaussianRandom(rng, 2100, 500));
      dau = Math.round(gaussianRandom(rng, 95, 25));
      featureAdoption = Number(gaussianRandom(rng, 72, 10).toFixed(1));
      tickets = Math.round(gaussianRandom(rng, 4, 2));
      sessions = Math.round(gaussianRandom(rng, 18, 4));
      contractMonths = 12;
      nps = Math.round(gaussianRandom(rng, 8.5, 1.0));
    } else if (archetype === 2) {
      // Low Adoption / Onboarding Blocked
      mrr = Math.round(gaussianRandom(rng, 1200, 350));
      dau = Math.round(gaussianRandom(rng, 18, 6));
      featureAdoption = Number(gaussianRandom(rng, 28, 8).toFixed(1));
      tickets = Math.round(gaussianRandom(rng, 8.5, 2.5)) + 3;
      sessions = Math.round(gaussianRandom(rng, 5, 2));
      contractMonths = 6;
      nps = Math.round(gaussianRandom(rng, 5.1, 1.4));
    } else {
      // Self-Serve Starter Accounts
      mrr = Math.round(gaussianRandom(rng, 450, 120));
      dau = Math.round(gaussianRandom(rng, 8, 3));
      featureAdoption = Number(gaussianRandom(rng, 42, 9).toFixed(1));
      tickets = Math.round(gaussianRandom(rng, 1, 0.8));
      sessions = Math.round(gaussianRandom(rng, 7, 3));
      contractMonths = 1;
      nps = Math.round(gaussianRandom(rng, 7.8, 1.2));
    }

    rows.push({
      ID_Cuenta: `SAAS-${40000 + i}`,
      MRR_USD: Math.max(100, mrr),
      Usuarios_Activos_Diarios: Math.max(1, dau),
      Score_Adopcion_Pct: Math.min(100, Math.max(10, featureAdoption)),
      Tickets_Soporte: Math.max(0, tickets),
      Sesiones_Usuario_Semana: Math.max(1, sessions),
      Contrato_Meses: Math.max(1, contractMonths),
      NPS_Score: Math.min(10, Math.max(0, nps)),
      Industria: industries[Math.floor(rng() * industries.length)],
    });
  }
  return rows;
}

// 5. Salud y Seguros (Patient Health Utilization)
function generateHealthDataset(): Record<string, any>[] {
  const rng = createRng(333222111);
  const rows: Record<string, any>[] = [];

  for (let i = 1; i <= 290; i++) {
    const archetype = i % 4;
    let edad = 0;
    let consultas = 0;
    let siniestralidad = 0;
    let copago = 0;
    let adherencia = 0;
    let cargas = 0;

    if (archetype === 0) {
      // Chronic Intensive Patients (High Cost)
      edad = Math.round(gaussianRandom(rng, 68, 8));
      consultas = Math.round(gaussianRandom(rng, 16, 4)) + 4;
      siniestralidad = Math.round(gaussianRandom(rng, 7800, 1800));
      copago = Math.round(gaussianRandom(rng, 340, 80));
      adherencia = Number(gaussianRandom(rng, 86, 7).toFixed(1));
      cargas = Math.round(gaussianRandom(rng, 1, 0.8));
    } else if (archetype === 1) {
      // Young Families / Preventative Care
      edad = Math.round(gaussianRandom(rng, 36, 6));
      consultas = Math.round(gaussianRandom(rng, 8, 2.5));
      siniestralidad = Math.round(gaussianRandom(rng, 2200, 600));
      copago = Math.round(gaussianRandom(rng, 120, 30));
      adherencia = Number(gaussianRandom(rng, 92, 5).toFixed(1));
      cargas = Math.round(gaussianRandom(rng, 3.2, 1.1)) + 1;
    } else if (archetype === 2) {
      // Healthy Young Professionals / Low Utilizers
      edad = Math.round(gaussianRandom(rng, 27, 4));
      consultas = Math.round(gaussianRandom(rng, 1.8, 1));
      siniestralidad = Math.round(gaussianRandom(rng, 420, 180));
      copago = Math.round(gaussianRandom(rng, 45, 15));
      adherencia = Number(gaussianRandom(rng, 95, 4).toFixed(1));
      cargas = 0;
    } else {
      // Uncontrolled / Non-adherent Moderate Risk
      edad = Math.round(gaussianRandom(rng, 52, 9));
      consultas = Math.round(gaussianRandom(rng, 6, 2));
      siniestralidad = Math.round(gaussianRandom(rng, 4100, 1100));
      copago = Math.round(gaussianRandom(rng, 210, 50));
      adherencia = Number(gaussianRandom(rng, 48, 12).toFixed(1));
      cargas = Math.round(gaussianRandom(rng, 2, 1));
    }

    rows.push({
      ID_Afiliado: `HLT-${50000 + i}`,
      Edad: Math.min(95, Math.max(18, edad)),
      Consultas_Anio: Math.max(0, consultas),
      Costo_Siniestralidad_USD: Math.max(100, siniestralidad),
      Copago_Promedio_USD: Math.max(10, copago),
      Adherencia_Tratamiento_Pct: Math.min(100, Math.max(10, adherencia)),
      Cargas_Familiares: Math.max(0, cargas),
    });
  }
  return rows;
}

export interface SampleDatasetOption {
  id: string;
  name: string;
  sector: 'Retail y E-Commerce' | 'Banca y Servicios Financieros' | 'Telecomunicaciones' | 'Manufactura y B2B' | 'Salud y Farmacéutica';
  objective: any;
  kpi: string;
  description: string;
  generate: () => Record<string, any>[];
  fileName: string;
}

export const SAMPLE_DATASETS: SampleDatasetOption[] = [
  {
    id: 'retail_rfm',
    name: 'Retail E-Commerce (RFM & LTV)',
    sector: 'Retail y E-Commerce',
    objective: 'Fidelización y Lealtad',
    kpi: 'Customer Lifetime Value (LTV) & Recency',
    description: '320 clientes con métricas de comportamiento transaccional (Recency, Frecuencia, Gasto, Ticket, Devoluciones).',
    generate: generateRetailDataset,
    fileName: 'retail_customer_rfm.xlsx',
  },
  {
    id: 'banking_risk',
    name: 'Banca & Finanzas (Riesgo y Transaccionalidad)',
    sector: 'Banca y Servicios Financieros',
    objective: 'Control de Riesgo Crediticio',
    kpi: 'Score Crediticio y Uso de Línea',
    description: '300 clientes bancarios con ingresos, saldos promedio, mora, score crediticio y transaccionalidad mensual.',
    generate: generateBankingDataset,
    fileName: 'banking_credit_engagement.xlsx',
  },
  {
    id: 'telecom_churn',
    name: 'Telecomunicaciones (Consumo y Churn)',
    sector: 'Telecomunicaciones',
    objective: 'Retención y Prevención de Churn',
    kpi: 'ARPU & Reclamos de Soporte',
    description: '350 suscriptores móviles/fibra con consumo GB, minutos de voz, gasto mensual, reclamos y streaming.',
    generate: generateTelecomDataset,
    fileName: 'telecom_churn_usage.xlsx',
  },
  {
    id: 'saas_b2b',
    name: 'B2B SaaS (Product-Led Growth & MRR)',
    sector: 'Manufactura y B2B',
    objective: 'Crecimiento de Clientes',
    kpi: 'MRR Expansion & Feature Adoption',
    description: '280 cuentas corporativas con MRR, usuarios activos diarios (DAU), adopción de features y NPS.',
    generate: generateSaasDataset,
    fileName: 'saas_b2b_accounts.xlsx',
  },
  {
    id: 'health_insurance',
    name: 'Salud & Seguros (Siniestralidad y Adherencia)',
    sector: 'Salud y Farmacéutica',
    objective: 'Innovación y Nuevos Productos',
    kpi: 'Costo Siniestralidad & Adherencia Médica',
    description: '290 afiliados de salud con edad, consultas anuales, costo de siniestros, copagos y adherencia médica.',
    generate: generateHealthDataset,
    fileName: 'health_utilization.xlsx',
  },
];
