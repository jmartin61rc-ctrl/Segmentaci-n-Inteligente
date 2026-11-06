import { DescriptiveStats, SkewnessAssessment, SkewnessCategory, TransformationType } from '../types/segmentation';

// Calculate percentile with linear interpolation
export function calculatePercentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  if (p <= 0) return sortedValues[0];
  if (p >= 100) return sortedValues[sortedValues.length - 1];

  const index = (p / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) return sortedValues[lower];
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

// Calculate statistical mode
export function calculateMode(values: number[]): number {
  if (values.length === 0) return 0;
  const frequencyMap = new Map<number, number>();
  let maxFreq = 0;
  let mode = values[0];

  for (const v of values) {
    const rounded = Number(v.toFixed(2));
    const freq = (frequencyMap.get(rounded) || 0) + 1;
    frequencyMap.set(rounded, freq);
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = rounded;
    }
  }
  return mode;
}

// Calculate full descriptive statistics and anomaly alerts for a variable
export function calculateDescriptiveStats(variableName: string, rawValues: any[]): DescriptiveStats {
  const numericValues = rawValues
    .map((v) => (typeof v === 'number' ? v : Number(String(v).trim().replace(',', '.'))))
    .filter((v) => typeof v === 'number' && !isNaN(v) && isFinite(v));

  if (numericValues.length === 0) {
    return {
      variable: variableName,
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      mode: 0,
      stdDev: 0,
      variance: 0,
      iqr: 0,
      skewness: 0,
      kurtosis: 0,
      cv: 0,
      p5: 0,
      p25: 0,
      p50: 0,
      p75: 0,
      p90: 0,
      p95: 0,
      outliersCount: 0,
      inconsistentCount: 0,
      warnings: ['Variable sin registros numéricos computables.'],
    };
  }

  const n = numericValues.length;
  const sorted = [...numericValues].sort((a, b) => a - b);

  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;

  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
  const mode = calculateMode(sorted);

  // Variance & Standard Deviation
  const variance = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / Math.max(1, n - 1);
  const stdDev = Math.sqrt(variance);

  // Percentiles
  const p5 = calculatePercentile(sorted, 5);
  const p25 = calculatePercentile(sorted, 25);
  const p50 = median;
  const p75 = calculatePercentile(sorted, 75);
  const p90 = calculatePercentile(sorted, 90);
  const p95 = calculatePercentile(sorted, 95);

  const iqr = p75 - p25;
  const cv = mean !== 0 ? Math.abs((stdDev / mean) * 100) : 0;

  // Skewness (Fisher-Pearson)
  let skewness = 0;
  let kurtosis = 0;
  if (n > 2 && stdDev > 0) {
    const m3 = sorted.reduce((acc, v) => acc + Math.pow((v - mean) / stdDev, 3), 0);
    skewness = (n / ((n - 1) * (n - 2))) * m3;

    if (n > 3) {
      const m4 = sorted.reduce((acc, v) => acc + Math.pow((v - mean) / stdDev, 4), 0);
      kurtosis = ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * m4 - (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
    }
  }

  // Outliers via Tukey's fences (1.5 * IQR) and 3-sigma
  const lowerFence = p25 - 1.5 * iqr;
  const upperFence = p75 + 1.5 * iqr;
  const outliers = sorted.filter((v) => v < lowerFence || v > upperFence);
  const outliersCount = outliers.length;

  // Business Rules & Warnings Detection
  const warnings: string[] = [];
  let inconsistentCount = 0;

  // Check negative values in typically positive metrics (e.g. spend, duration, age, price)
  const isLikelyPositiveMetric = /edad|monto|gasto|arpu|ingreso|saldo|precio|dias|visitas|gb|minutos|recency|frecuencia|ticket/i.test(variableName);
  const negativeCount = sorted.filter((v) => v < 0).length;
  if (isLikelyPositiveMetric && negativeCount > 0) {
    inconsistentCount += negativeCount;
    warnings.push(`Se detectaron ${negativeCount} valores negativos en '${variableName}', inusual para métricas comerciales.`);
  }

  // High outlier concentration
  const outlierPct = (outliersCount / n) * 100;
  if (outlierPct > 5) {
    warnings.push(`Presencia significativa de outliers (${outlierPct.toFixed(1)}% de registros fuera de 1.5×IQR). Se recomienda escala robusta o transformación.`);
  }

  // Extreme Skewness
  if (Math.abs(skewness) > 1.5) {
    warnings.push(`Asimetría severa (${skewness > 0 ? 'positiva/derecha' : 'negativa/izquierda'}, g₁ = ${skewness.toFixed(2)}). Se aconseja transformación Logarítmica o Box-Cox.`);
  }

  // Extreme Kurtosis / Leptokurtic
  if (kurtosis > 3) {
    warnings.push(`Distribución leptocúrtica con colas pesadas (Kurtosis = ${kurtosis.toFixed(2)}).`);
  }

  return {
    variable: variableName,
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    mode: Number(mode.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    variance: Number(variance.toFixed(2)),
    iqr: Number(iqr.toFixed(2)),
    skewness: Number(skewness.toFixed(2)),
    kurtosis: Number(kurtosis.toFixed(2)),
    cv: Number(cv.toFixed(1)),
    p5: Number(p5.toFixed(2)),
    p25: Number(p25.toFixed(2)),
    p50: Number(p50.toFixed(2)),
    p75: Number(p75.toFixed(2)),
    p90: Number(p90.toFixed(2)),
    p95: Number(p95.toFixed(2)),
    outliersCount,
    inconsistentCount,
    warnings,
  };
}

// Compute histogram bins for visualization
export interface HistogramBin {
  binStart: number;
  binEnd: number;
  label: string;
  count: number;
  density: number;
}

export function computeHistogram(values: number[], numBins = 15): HistogramBin[] {
  const validVals = values.filter((v) => typeof v === 'number' && !isNaN(v) && isFinite(v));
  if (validVals.length === 0) return [];

  const min = Math.min(...validVals);
  const max = Math.max(...validVals);

  if (min === max) {
    return [
      {
        binStart: min,
        binEnd: max,
        label: `${min.toFixed(1)}`,
        count: validVals.length,
        density: 1.0,
      },
    ];
  }

  const binWidth = (max - min) / numBins;
  const bins: HistogramBin[] = Array.from({ length: numBins }, (_, i) => {
    const start = min + i * binWidth;
    const end = i === numBins - 1 ? max : start + binWidth;
    return {
      binStart: Number(start.toFixed(2)),
      binEnd: Number(end.toFixed(2)),
      label: `${start.toFixed(1)} - ${end.toFixed(1)}`,
      count: 0,
      density: 0,
    };
  });

  for (const val of validVals) {
    let placed = false;
    for (let i = 0; i < numBins; i++) {
      if (i === numBins - 1) {
        if (val >= bins[i].binStart && val <= bins[i].binEnd) {
          bins[i].count++;
          placed = true;
          break;
        }
      } else {
        if (val >= bins[i].binStart && val < bins[i].binEnd) {
          bins[i].count++;
          placed = true;
          break;
        }
      }
    }
    if (!placed) {
      bins[numBins - 1].count++;
    }
  }

  const total = validVals.length;
  for (const b of bins) {
    b.density = Number((b.count / total).toFixed(4));
  }

  return bins;
}

// Detect multimodal distribution by counting local peaks in smoothed bins
function isMultimodalDistribution(bins: HistogramBin[]): boolean {
  if (bins.length < 5) return false;
  let peaks = 0;
  for (let i = 1; i < bins.length - 1; i++) {
    if (bins[i].count > bins[i - 1].count && bins[i].count > bins[i + 1].count && bins[i].count > 3) {
      peaks++;
    }
  }
  return peaks >= 2;
}

// Assess skewness, classification, and impact on clustering
export function assessSkewness(stats: DescriptiveStats, values: number[]): SkewnessAssessment {
  const { skewness, kurtosis, variable, min } = stats;
  const bins = computeHistogram(values, 12);
  const multimodal = isMultimodalDistribution(bins);

  let category: SkewnessCategory = 'normal';
  let label = 'Distribución Normal / Simétrica';
  let explanation = 'La distribución de valores es balanceada alrededor de la media; no presenta sesgos pronunciados.';
  let clusteringImpact = 'Impacto favorable: las métricas de distancia euclidiana funcionan óptimamente y los centroides reflejan el núcleo natural de los clusters.';
  let recommendedTransform: TransformationType = 'none';

  if (multimodal && Math.abs(skewness) < 1.0) {
    category = 'multimodal';
    label = 'Distribución Multimodal (Múltiples Picos)';
    explanation = 'Se identifican dos o más concentraciones de datos separadas por valles, indicando la coexistencia de subpoblaciones intrínsecas.';
    clusteringImpact = 'Alta separabilidad natural: los algoritmos particionales tenderán a capturar estos picos como clusters independientes.';
    recommendedTransform = 'none';
  } else if (skewness > 1.2) {
    category = 'positive_heavy';
    label = 'Sesgo Positivo Fuerte (Cola Larga Derecha)';
    explanation = `La gran mayoría de los registros se concentran en valores bajos, mientras que unos pocos valores extremadamente altos estiran la media hacia la derecha (g₁ = ${skewness.toFixed(2)}).`;
    clusteringImpact = 'Riesgo alto para K-Means: los centroides son atraídos fuertemente hacia la cola extrema derecha, distorsionando la separación y creando grupos desbalanceados.';
    recommendedTransform = min > 0 ? 'log' : min >= 0 ? 'log1p' : 'yeojohnson';
  } else if (skewness > 0.5) {
    category = 'positive_moderate';
    label = 'Sesgo Positivo Moderado';
    explanation = `Asimetría hacia valores superiores (g₁ = ${skewness.toFixed(2)}), común en montos de compra y métricas de consumo.`;
    clusteringImpact = 'Impacto moderado: puede causar cierta compresión en los grupos de menor valor.';
    recommendedTransform = min >= 0 ? 'sqrt' : 'yeojohnson';
  } else if (skewness < -1.2) {
    category = 'negative_heavy';
    label = 'Sesgo Negativo Fuerte (Cola Larga Izquierda)';
    explanation = `Concentración de registros en valores altos con una cola prolongada hacia valores mínimos (g₁ = ${skewness.toFixed(2)}).`;
    clusteringImpact = 'Riesgo para K-Means: la dispersión izquierda comprime el grupo principal.';
    recommendedTransform = 'yeojohnson';
  } else if (skewness < -0.5) {
    category = 'negative_moderate';
    label = 'Sesgo Negativo Moderado';
    explanation = `Asimetría leve hacia la izquierda (g₁ = ${skewness.toFixed(2)}).`;
    clusteringImpact = 'Impacto bajo a moderado en la convergencia del algoritmo.';
    recommendedTransform = 'yeojohnson';
  }

  return {
    variable,
    skewness,
    kurtosis,
    category,
    label,
    explanation,
    clusteringImpact,
    recommendedTransform,
  };
}
