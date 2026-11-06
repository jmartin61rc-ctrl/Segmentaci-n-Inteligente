import { TransformationType, ScalingMethod } from '../types/segmentation';

// Box-Cox power transform for positive values
export function boxCoxTransform(val: number, lambda: number): number {
  if (val <= 0) val = 0.0001;
  if (Math.abs(lambda) < 1e-4) {
    return Math.log(val);
  }
  return (Math.pow(val, lambda) - 1) / lambda;
}

// Yeo-Johnson power transform (handles positive, zero, and negative values)
export function yeoJohnsonTransform(val: number, lambda: number): number {
  if (val >= 0) {
    if (Math.abs(lambda) < 1e-4) {
      return Math.log(val + 1);
    }
    return (Math.pow(val + 1, lambda) - 1) / lambda;
  } else {
    if (Math.abs(lambda - 2) < 1e-4) {
      return -Math.log(-val + 1);
    }
    return -(Math.pow(-val + 1, 2 - lambda) - 1) / (2 - lambda);
  }
}

// Estimate optimal lambda for Box-Cox or Yeo-Johnson by minimizing skewness
export function estimateOptimalLambda(values: number[], method: 'boxcox' | 'yeojohnson'): number {
  const candidates = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
  let bestLambda = 0;
  let minAbsSkew = Infinity;

  const valid = values.filter((v) => !isNaN(v) && isFinite(v));
  if (valid.length === 0) return 0;

  for (const lambda of candidates) {
    const transformed = valid.map((v) =>
      method === 'boxcox' ? boxCoxTransform(Math.max(0.0001, v), lambda) : yeoJohnsonTransform(v, lambda)
    );
    const mean = transformed.reduce((a, b) => a + b, 0) / transformed.length;
    const std = Math.sqrt(transformed.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / transformed.length);
    if (std === 0) continue;
    const skew = Math.abs(
      transformed.reduce((a, b) => a + Math.pow((b - mean) / std, 3), 0) / transformed.length
    );
    if (skew < minAbsSkew) {
      minAbsSkew = skew;
      bestLambda = lambda;
    }
  }

  return bestLambda;
}

// Apply transformation to a single variable series
export function applyTransformation(
  values: number[],
  transformType: TransformationType
): { transformed: number[]; explanation: string; optimalLambda?: number } {
  const valid = values.map((v) => (isNaN(v) || !isFinite(v) ? 0 : v));

  if (transformType === 'none') {
    return {
      transformed: valid,
      explanation: 'Sin transformación aplicada (valores en escala original de negocio).',
    };
  }

  if (transformType === 'log') {
    const min = Math.min(...valid);
    if (min <= 0) {
      // Automatic shift if non-positive
      const shift = Math.abs(min) + 1;
      return {
        transformed: valid.map((v) => Math.log(v + shift)),
        explanation: `Transformación Logarítmica ln(x + ${shift.toFixed(1)}) para normalizar asimetría positiva en valores con ceros o negativos.`,
      };
    }
    return {
      transformed: valid.map((v) => Math.log(v)),
      explanation: 'Transformación Logarítmica natural ln(x): comprime colas largas superiores y estabiliza varianza.',
    };
  }

  if (transformType === 'log1p') {
    return {
      transformed: valid.map((v) => Math.log(Math.max(0, v) + 1)),
      explanation: 'Transformación ln(1 + x): preserva valores cero intactos (ln(1) = 0) mientras comprime asimetría positiva.',
    };
  }

  if (transformType === 'sqrt') {
    const min = Math.min(...valid);
    const shift = min < 0 ? Math.abs(min) : 0;
    return {
      transformed: valid.map((v) => Math.sqrt(Math.max(0, v + shift))),
      explanation: `Transformación Raíz Cuadrada sqrt(x${shift > 0 ? ` + ${shift}` : ''}): modera colas pesadas con menor agresividad que el logaritmo.`,
    };
  }

  if (transformType === 'boxcox') {
    const lambda = estimateOptimalLambda(valid, 'boxcox');
    return {
      transformed: valid.map((v) => boxCoxTransform(v, lambda)),
      explanation: `Transformación Box-Cox paramétrica optimizada con λ = ${lambda.toFixed(2)} para maximizar simetría gaussiana.`,
      optimalLambda: lambda,
    };
  }

  if (transformType === 'yeojohnson') {
    const lambda = estimateOptimalLambda(valid, 'yeojohnson');
    return {
      transformed: valid.map((v) => yeoJohnsonTransform(v, lambda)),
      explanation: `Transformación Yeo-Johnson paramétrica con λ = ${lambda.toFixed(2)}, válida para valores positivos, nulos y negativos simultáneamente.`,
      optimalLambda: lambda,
    };
  }

  return { transformed: valid, explanation: 'Transformación no reconocida.' };
}

// Standardization / Scaling engine (Module 8)
export interface ScalerModel {
  method: ScalingMethod;
  params: Record<string, { min: number; max: number; mean: number; std: number; median: number; iqr: number }>;
}

export function fitAndScaleDataset(
  matrix: Record<string, number>[],
  features: string[],
  method: ScalingMethod = 'minmax'
): { scaledRows: Record<string, number>[]; scaler: ScalerModel } {
  const params: ScalerModel['params'] = {};

  // Compute scale parameters per feature
  for (const feat of features) {
    const vals = matrix.map((row) => row[feat] ?? 0);
    const sorted = [...vals].sort((a, b) => a - b);
    const n = sorted.length;
    const min = sorted[0] ?? 0;
    const max = sorted[n - 1] ?? 1;
    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = n > 0 ? sum / n : 0;
    const variance = sorted.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / Math.max(1, n - 1);
    const std = Math.sqrt(variance) || 1;
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    const q1 = sorted[Math.floor(n * 0.25)] ?? min;
    const q3 = sorted[Math.floor(n * 0.75)] ?? max;
    const iqr = q3 - q1 || 1;

    params[feat] = { min, max, mean, std, median, iqr };
  }

  // Scale data
  const scaledRows = matrix.map((row) => {
    const scaledRow: Record<string, number> = {};
    for (const feat of features) {
      const v = row[feat] ?? 0;
      const p = params[feat];

      if (method === 'minmax') {
        const range = p.max - p.min;
        scaledRow[feat] = range === 0 ? 0.5 : Number(((v - p.min) / range).toFixed(6));
      } else if (method === 'zscore') {
        scaledRow[feat] = Number(((v - p.mean) / p.std).toFixed(6));
      } else if (method === 'robust') {
        scaledRow[feat] = Number(((v - p.median) / p.iqr).toFixed(6));
      }
    }
    return scaledRow;
  });

  return { scaledRows, scaler: { method, params } };
}

// Invert scaling from normalized back to original units for centroids
export function inverseScaleCentroid(
  scaledCentroid: Record<string, number>,
  scaler: ScalerModel
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const feat of Object.keys(scaledCentroid)) {
    const sVal = scaledCentroid[feat];
    const p = scaler.params[feat];
    if (!p) {
      result[feat] = sVal;
      continue;
    }

    if (scaler.method === 'minmax') {
      result[feat] = Number((sVal * (p.max - p.min) + p.min).toFixed(2));
    } else if (scaler.method === 'zscore') {
      result[feat] = Number((sVal * p.std + p.mean).toFixed(2));
    } else if (scaler.method === 'robust') {
      result[feat] = Number((sVal * p.iqr + p.median).toFixed(2));
    }
  }

  return result;
}
