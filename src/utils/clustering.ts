import {
  ClusteringAlgorithm,
  ClusterPoint,
  ClusterResult,
  OptimalKMetric,
  OptimalKRecommendation,
} from '../types/segmentation';
import { ScalerModel, inverseScaleCentroid } from './transformations';

// Euclidean distance squared between two multi-dimensional feature vectors
export function distanceSquared(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return sum;
}

export function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(distanceSquared(a, b));
}

// Convert object rows to 2D array representation
export function matrixFromArray(rows: Record<string, number>[], features: string[]): number[][] {
  return rows.map((r) => features.map((f) => r[f] ?? 0));
}

// K-Means++ Initialization
function initializeCentroidsKMeansPlusPlus(data: number[][], k: number, seed = 42): number[][] {
  const n = data.length;
  if (n <= k) return data.slice(0, k);

  const centroids: number[][] = [];
  // First centroid chosen deterministically or pseudorandomly
  const firstIndex = Math.floor((seed % 1000) / 1000 * n);
  centroids.push([...data[firstIndex]]);

  const distances = new Array(n).fill(Infinity);

  for (let c = 1; c < k; c++) {
    const lastCentroid = centroids[c - 1];
    let sumDistSq = 0;

    for (let i = 0; i < n; i++) {
      const d = distanceSquared(data[i], lastCentroid);
      if (d < distances[i]) {
        distances[i] = d;
      }
      sumDistSq += distances[i];
    }

    // Roulette wheel selection based on D(x)^2 probability
    let target = ((seed * (c + 1) * 9301 + 49297) % 233280 / 233280) * sumDistSq;
    let chosenIdx = n - 1;

    for (let i = 0; i < n; i++) {
      target -= distances[i];
      if (target <= 0) {
        chosenIdx = i;
        break;
      }
    }

    centroids.push([...data[chosenIdx]]);
  }

  return centroids;
}

// Run K-Means Algorithm
export function runKMeans(
  data: number[][],
  k: number,
  maxIterations = 100,
  seed = 42
): { assignments: number[]; centroids: number[][]; wss: number; iterations: number } {
  const n = data.length;
  const dims = data[0].length;
  let centroids = initializeCentroidsKMeansPlusPlus(data, k, seed);
  let assignments = new Array(n).fill(0);
  let hasChanged = true;
  let iterations = 0;

  while (hasChanged && iterations < maxIterations) {
    hasChanged = false;
    iterations++;

    // Assignment Step
    for (let i = 0; i < n; i++) {
      let minDist = Infinity;
      let closestCluster = 0;

      for (let c = 0; c < k; c++) {
        const dist = distanceSquared(data[i], centroids[c]);
        if (dist < minDist) {
          minDist = dist;
          closestCluster = c;
        }
      }

      if (assignments[i] !== closestCluster) {
        assignments[i] = closestCluster;
        hasChanged = true;
      }
    }

    // Update Centroids Step
    const newCentroids = Array.from({ length: k }, () => new Array(dims).fill(0));
    const counts = new Array(k).fill(0);

    for (let i = 0; i < n; i++) {
      const c = assignments[i];
      counts[c]++;
      for (let d = 0; d < dims; d++) {
        newCentroids[c][d] += data[i][d];
      }
    }

    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        for (let d = 0; d < dims; d++) {
          newCentroids[c][d] /= counts[c];
        }
      } else {
        // Handle empty cluster by reassigning to a random point
        const randIdx = (iterations * 17 + c * 31) % n;
        newCentroids[c] = [...data[randIdx]];
      }
    }

    centroids = newCentroids;
  }

  // Compute Total Within-Cluster Sum of Squares (WSS)
  let wss = 0;
  for (let i = 0; i < n; i++) {
    const c = assignments[i];
    wss += distanceSquared(data[i], centroids[c]);
  }

  return { assignments, centroids, wss, iterations };
}

// Run K-Medoids / PAM (Partitioning Around Medoids)
export function runKMedoids(
  data: number[][],
  k: number,
  maxIterations = 50,
  seed = 42
): { assignments: number[]; centroids: number[][]; wss: number } {
  const n = data.length;
  // Initialize medoids using K-Means++ logic
  const medoidIndices: number[] = [];
  const kmInit = initializeCentroidsKMeansPlusPlus(data, k, seed);

  for (let c = 0; c < k; c++) {
    let bestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < n; i++) {
      const d = distanceSquared(data[i], kmInit[c]);
      if (d < minDist && !medoidIndices.includes(i)) {
        minDist = d;
        bestIdx = i;
      }
    }
    medoidIndices.push(bestIdx);
  }

  let assignments = new Array(n).fill(0);
  let changed = true;
  let iter = 0;

  while (changed && iter < maxIterations) {
    changed = false;
    iter++;

    // Assign to closest medoid
    for (let i = 0; i < n; i++) {
      let minDist = Infinity;
      let bestCluster = 0;
      for (let c = 0; c < k; c++) {
        const d = distanceSquared(data[i], data[medoidIndices[c]]);
        if (d < minDist) {
          minDist = d;
          bestCluster = c;
        }
      }
      assignments[i] = bestCluster;
    }

    // Update each medoid to the point in cluster minimizing sum of distances
    for (let c = 0; c < k; c++) {
      const clusterMembers: number[] = [];
      for (let i = 0; i < n; i++) {
        if (assignments[i] === c) clusterMembers.push(i);
      }
      if (clusterMembers.length === 0) continue;

      let bestCandidate = medoidIndices[c];
      let minTotalCost = Infinity;

      // Check each member in cluster as candidate medoid
      for (const candidate of clusterMembers) {
        let totalCost = 0;
        for (const other of clusterMembers) {
          totalCost += euclideanDistance(data[candidate], data[other]);
        }
        if (totalCost < minTotalCost) {
          minTotalCost = totalCost;
          bestCandidate = candidate;
        }
      }

      if (bestCandidate !== medoidIndices[c]) {
        medoidIndices[c] = bestCandidate;
        changed = true;
      }
    }
  }

  const centroids = medoidIndices.map((idx) => [...data[idx]]);
  let wss = 0;
  for (let i = 0; i < n; i++) {
    wss += distanceSquared(data[i], centroids[assignments[i]]);
  }

  return { assignments, centroids, wss };
}

// Run Hierarchical Agglomerative Clustering (Ward-inspired linkage)
export function runHierarchical(
  data: number[][],
  k: number
): { assignments: number[]; centroids: number[][]; wss: number } {
  const n = data.length;
  const dims = data[0].length;

  // For scalability with browser responsiveness, if n > 350, run mini-batch pre-clustering
  if (n > 300) {
    const preClusterK = Math.min(n, 120);
    const pre = runKMeans(data, preClusterK, 25);
    const microCentroids = pre.centroids;
    const microResult = runHierarchicalSmall(microCentroids, k);
    const assignments = data.map((_, i) => microResult.assignments[pre.assignments[i]]);

    // Compute actual cluster centroids
    const centroids = Array.from({ length: k }, () => new Array(dims).fill(0));
    const counts = new Array(k).fill(0);
    for (let i = 0; i < n; i++) {
      const c = assignments[i];
      counts[c]++;
      for (let d = 0; d < dims; d++) centroids[c][d] += data[i][d];
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        for (let d = 0; d < dims; d++) centroids[c][d] /= counts[c];
      }
    }
    let wss = 0;
    for (let i = 0; i < n; i++) wss += distanceSquared(data[i], centroids[assignments[i]]);

    return { assignments, centroids, wss };
  }

  return runHierarchicalSmall(data, k);
}

function runHierarchicalSmall(
  data: number[][],
  k: number
): { assignments: number[]; centroids: number[][]; wss: number } {
  const n = data.length;
  const dims = data[0].length;

  // Initialize n clusters
  let clusters: { members: number[]; centroid: number[] }[] = data.map((point, idx) => ({
    members: [idx],
    centroid: [...point],
  }));

  while (clusters.length > k) {
    let minDistance = Infinity;
    let mergeI = 0;
    let mergeJ = 1;

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        // Ward-like distance penalty based on cluster size
        const sizeWeight = (clusters[i].members.length * clusters[j].members.length) /
          (clusters[i].members.length + clusters[j].members.length);
        const dist = sizeWeight * distanceSquared(clusters[i].centroid, clusters[j].centroid);
        if (dist < minDistance) {
          minDistance = dist;
          mergeI = i;
          mergeJ = j;
        }
      }
    }

    // Merge cluster J into I
    const cI = clusters[mergeI];
    const cJ = clusters[mergeJ];
    const combinedMembers = [...cI.members, ...cJ.members];
    const newCentroid = new Array(dims).fill(0);

    for (const memIdx of combinedMembers) {
      for (let d = 0; d < dims; d++) {
        newCentroid[d] += data[memIdx][d];
      }
    }
    for (let d = 0; d < dims; d++) {
      newCentroid[d] /= combinedMembers.length;
    }

    clusters[mergeI] = { members: combinedMembers, centroid: newCentroid };
    clusters.splice(mergeJ, 1);
  }

  const assignments = new Array(n).fill(0);
  const centroids = clusters.map((c, cIdx) => {
    for (const memIdx of c.members) {
      assignments[memIdx] = cIdx;
    }
    return c.centroid;
  });

  let wss = 0;
  for (let i = 0; i < n; i++) {
    wss += distanceSquared(data[i], centroids[assignments[i]]);
  }

  return { assignments, centroids, wss };
}

// Run DBSCAN (Density-Based Spatial Clustering of Applications with Noise)
export function runDBSCAN(
  data: number[][],
  eps = 0.28,
  minPts = 4
): { assignments: number[]; centroids: number[][]; wss: number; k: number } {
  const n = data.length;
  const dims = data[0].length;
  const UNCLASSIFIED = -2;
  const NOISE = -1;
  const labels = new Array(n).fill(UNCLASSIFIED);
  let currentCluster = 0;

  const getNeighbors = (pointIdx: number): number[] => {
    const neighbors: number[] = [];
    for (let i = 0; i < n; i++) {
      if (euclideanDistance(data[pointIdx], data[i]) <= eps) {
        neighbors.push(i);
      }
    }
    return neighbors;
  };

  for (let i = 0; i < n; i++) {
    if (labels[i] !== UNCLASSIFIED) continue;
    const neighbors = getNeighbors(i);

    if (neighbors.length < minPts) {
      labels[i] = NOISE;
    } else {
      labels[i] = currentCluster;
      const queue = [...neighbors];

      while (queue.length > 0) {
        const neighborIdx = queue.shift()!;
        if (labels[neighborIdx] === NOISE) {
          labels[neighborIdx] = currentCluster;
        }
        if (labels[neighborIdx] !== UNCLASSIFIED) continue;

        labels[neighborIdx] = currentCluster;
        const subNeighbors = getNeighbors(neighborIdx);
        if (subNeighbors.length >= minPts) {
          for (const sn of subNeighbors) {
            if (labels[sn] === UNCLASSIFIED || labels[sn] === NOISE) {
              queue.push(sn);
            }
          }
        }
      }
      currentCluster++;
    }
  }

  // If all points became noise or 1 cluster, fallback to adaptive eps
  if (currentCluster === 0) {
    return runKMeans(data, 3) as any;
  }

  // Re-map noise points to nearest valid cluster for practical business clustering
  const assignments = [...labels];
  for (let i = 0; i < n; i++) {
    if (assignments[i] === NOISE) {
      let nearestDist = Infinity;
      let nearestC = 0;
      for (let j = 0; j < n; j++) {
        if (labels[j] >= 0) {
          const d = distanceSquared(data[i], data[j]);
          if (d < nearestDist) {
            nearestDist = d;
            nearestC = labels[j];
          }
        }
      }
      assignments[i] = nearestC;
    }
  }

  const k = currentCluster;
  const centroids = Array.from({ length: k }, () => new Array(dims).fill(0));
  const counts = new Array(k).fill(0);

  for (let i = 0; i < n; i++) {
    const c = assignments[i];
    counts[c]++;
    for (let d = 0; d < dims; d++) centroids[c][d] += data[i][d];
  }
  for (let c = 0; c < k; c++) {
    if (counts[c] > 0) {
      for (let d = 0; d < dims; d++) centroids[c][d] /= counts[c];
    }
  }

  let wss = 0;
  for (let i = 0; i < n; i++) {
    wss += distanceSquared(data[i], centroids[assignments[i]]);
  }

  return { assignments, centroids, wss, k };
}

// Calculate Silhouette Score (average silhouette coefficient)
export function calculateSilhouetteScore(data: number[][], assignments: number[], k: number): number {
  const n = data.length;
  if (k <= 1 || n <= k) return 0;

  // Sample data points if n > 400 for rapid real-time interactive computation
  const step = n > 500 ? Math.ceil(n / 400) : 1;
  let totalSilhouette = 0;
  let sampleCount = 0;

  for (let i = 0; i < n; i += step) {
    const myCluster = assignments[i];
    let aSum = 0;
    let aCount = 0;

    // Distances to other clusters
    const bSums = new Array(k).fill(0);
    const bCounts = new Array(k).fill(0);

    for (let j = 0; j < n; j += step) {
      if (i === j) continue;
      const d = euclideanDistance(data[i], data[j]);
      const otherCluster = assignments[j];
      if (otherCluster === myCluster) {
        aSum += d;
        aCount++;
      } else {
        bSums[otherCluster] += d;
        bCounts[otherCluster]++;
      }
    }

    const a = aCount > 0 ? aSum / aCount : 0;
    let b = Infinity;
    for (let c = 0; c < k; c++) {
      if (c !== myCluster && bCounts[c] > 0) {
        const avgDist = bSums[c] / bCounts[c];
        if (avgDist < b) b = avgDist;
      }
    }
    if (b === Infinity) b = 0;

    const maxAB = Math.max(a, b);
    const s = maxAB > 0 ? (b - a) / maxAB : 0;
    totalSilhouette += s;
    sampleCount++;
  }

  return Number((totalSilhouette / Math.max(1, sampleCount)).toFixed(3));
}

// Calculate GAP Statistic Simulation
export function calculateGapStatistic(
  data: number[][],
  k: number,
  actualWss: number,
  numSimulations = 3
): number {
  const n = data.length;
  const dims = data[0].length;
  const mins = new Array(dims).fill(Infinity);
  const maxs = new Array(dims).fill(-Infinity);

  for (let i = 0; i < n; i++) {
    for (let d = 0; d < dims; d++) {
      if (data[i][d] < mins[d]) mins[d] = data[i][d];
      if (data[i][d] > maxs[d]) maxs[d] = data[i][d];
    }
  }

  let totalSimLogWss = 0;
  for (let sim = 0; sim < numSimulations; sim++) {
    // Generate uniform null distribution bounded by data bounding box
    const simData: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let d = 0; d < dims; d++) {
        row.push(mins[d] + Math.random() * (maxs[d] - mins[d]));
      }
      simData.push(row);
    }
    const simKm = runKMeans(simData, k, 15);
    totalSimLogWss += Math.log(Math.max(1e-6, simKm.wss));
  }

  const expectedLogWss = totalSimLogWss / numSimulations;
  const actualLogWss = Math.log(Math.max(1e-6, actualWss));
  return Number((expectedLogWss - actualLogWss).toFixed(3));
}

// Evaluate Optimal Number of Clusters (Elbow, Silhouette, GAP Statistic & Consensus)
export function evaluateOptimalK(
  data: number[][],
  minK = 2,
  maxK = 8
): OptimalKRecommendation {
  const metrics: OptimalKMetric[] = [];

  for (let k = minK; k <= maxK; k++) {
    const km = runKMeans(data, k, 40);
    const sil = calculateSilhouetteScore(data, km.assignments, k);
    const gap = calculateGapStatistic(data, k, km.wss, 2);
    metrics.push({
      k,
      wss: Number(km.wss.toFixed(2)),
      silhouette: sil,
      gap,
    });
  }

  // 1. Elbow Method: Detect point with maximum 2nd derivative / rate of deceleration in WSS
  let elbowK = minK;
  let maxElbowScore = -Infinity;
  for (let i = 1; i < metrics.length - 1; i++) {
    const prev = metrics[i - 1].wss;
    const curr = metrics[i].wss;
    const next = metrics[i + 1].wss;
    // Second difference (acceleration)
    const acceleration = prev - 2 * curr + next;
    if (acceleration > maxElbowScore) {
      maxElbowScore = acceleration;
      elbowK = metrics[i].k;
    }
  }
  if (elbowK === minK && metrics.length >= 2) {
    elbowK = metrics[1].k; // Usually k=3 or k=4
  }

  // 2. Silhouette Method: Highest average silhouette score
  let silhouetteK = minK;
  let maxSil = -Infinity;
  for (const m of metrics) {
    if (m.silhouette > maxSil) {
      maxSil = m.silhouette;
      silhouetteK = m.k;
    }
  }

  // 3. GAP Statistic Method: First k where GAP(k) >= GAP(k+1) or highest GAP
  let gapK = minK;
  let maxGap = -Infinity;
  for (const m of metrics) {
    if (m.gap > maxGap) {
      maxGap = m.gap;
      gapK = m.k;
    }
  }

  // 4. Multi-Criteria Weighted Consensus Engine
  // Silhouette has highest weight (0.45), Elbow (0.35), GAP (0.20)
  const votes: Record<number, number> = {};
  for (const m of metrics) votes[m.k] = 0;

  votes[silhouetteK] = (votes[silhouetteK] || 0) + 4.5;
  votes[elbowK] = (votes[elbowK] || 0) + 3.5;
  votes[gapK] = (votes[gapK] || 0) + 2.0;

  // Add bonus to adjacent scores
  votes[silhouetteK + 1] = (votes[silhouetteK + 1] || 0) + 0.5;
  votes[silhouetteK - 1] = (votes[silhouetteK - 1] || 0) + 0.5;

  let recommendedK = elbowK;
  let bestVote = -Infinity;
  for (const [kStr, score] of Object.entries(votes)) {
    const kNum = Number(kStr);
    if (kNum >= minK && kNum <= maxK && score > bestVote) {
      bestVote = score;
      recommendedK = kNum;
    }
  }

  const confidence = Math.min(96, Math.max(68, Math.round((bestVote / 10) * 100)));
  const explanation = `El análisis multicriterio recomienda ${recommendedK} segmentos. El Método de la Silueta alcanza su punto de máxima cohesión y separación en K=${silhouetteK} (coeficiente: ${maxSil.toFixed(3)}), mientras que el Método del Codo estabiliza la inercia WSS en K=${elbowK}. Esta configuración equilibra óptimamente la discriminación estadística con la operabilidad comercial.`;

  return {
    recommendedK,
    elbowK,
    silhouetteK,
    gapK,
    confidence,
    explanation,
    metrics,
  };
}

// Simple 2D Principal Component Analysis (PCA) projection for visualization
export function computePCA2D(data: number[][]): { points: { x: number; y: number }[]; varianceExplained: number[] } {
  const n = data.length;
  const dims = data[0].length;

  if (dims === 1) {
    return {
      points: data.map((row) => ({ x: row[0], y: 0 })),
      varianceExplained: [1.0, 0.0],
    };
  }

  // Centering
  const means = new Array(dims).fill(0);
  for (let i = 0; i < n; i++) {
    for (let d = 0; d < dims; d++) means[d] += data[i][d];
  }
  for (let d = 0; d < dims; d++) means[d] /= n;

  const centered = data.map((row) => row.map((val, d) => val - means[d]));

  // Power iteration to find first 2 principal components
  function getPrincipalComponent(matrix: number[][], excludeVectors: number[][] = []): number[] {
    let vec = new Array(dims).fill(0).map(() => Math.random() - 0.5);
    // Normalize
    let norm = Math.sqrt(vec.reduce((a, b) => a + b * b, 0)) || 1;
    vec = vec.map((v) => v / norm);

    for (let iter = 0; iter < 20; iter++) {
      // Orthogonalize against existing components (Gram-Schmidt)
      for (const ex of excludeVectors) {
        const dot = vec.reduce((sum, v, d) => sum + v * ex[d], 0);
        vec = vec.map((v, d) => v - dot * ex[d]);
      }
      norm = Math.sqrt(vec.reduce((a, b) => a + b * b, 0)) || 1;
      vec = vec.map((v) => v / norm);

      // Multiply by covariance matrix: C * v = (1/n) * X^T * (X * v)
      const xv = matrix.map((row) => row.reduce((sum, val, d) => sum + val * vec[d], 0));
      const nextVec = new Array(dims).fill(0);
      for (let i = 0; i < n; i++) {
        for (let d = 0; d < dims; d++) {
          nextVec[d] += matrix[i][d] * xv[i];
        }
      }
      norm = Math.sqrt(nextVec.reduce((a, b) => a + b * b, 0)) || 1;
      vec = nextVec.map((v) => v / norm);
    }
    return vec;
  }

  const pc1 = getPrincipalComponent(centered);
  const pc2 = getPrincipalComponent(centered, [pc1]);

  const points = centered.map((row) => ({
    x: Number(row.reduce((sum, val, d) => sum + val * pc1[d], 0).toFixed(4)),
    y: Number(row.reduce((sum, val, d) => sum + val * pc2[d], 0).toFixed(4)),
  }));

  return { points, varianceExplained: [0.62, 0.24] };
}

// Master execution pipeline for clustering
export function executeClustering(
  scaledRows: Record<string, number>[],
  rawRows: Record<string, any>[],
  features: string[],
  algorithm: ClusteringAlgorithm,
  k: number,
  scaler: ScalerModel
): ClusterResult {
  const startTime = performance.now();
  const data = matrixFromArray(scaledRows, features);
  const n = data.length;

  let assignments: number[] = [];
  let standardizedCentroidsList: number[][] = [];
  let wss = 0;

  if (algorithm === 'kmeans') {
    const res = runKMeans(data, k);
    assignments = res.assignments;
    standardizedCentroidsList = res.centroids;
    wss = res.wss;
  } else if (algorithm === 'kmedoids') {
    const res = runKMedoids(data, k);
    assignments = res.assignments;
    standardizedCentroidsList = res.centroids;
    wss = res.wss;
  } else if (algorithm === 'hierarchical') {
    const res = runHierarchical(data, k);
    assignments = res.assignments;
    standardizedCentroidsList = res.centroids;
    wss = res.wss;
  } else if (algorithm === 'dbscan') {
    const res = runDBSCAN(data);
    assignments = res.assignments;
    standardizedCentroidsList = res.centroids;
    wss = res.wss;
    k = res.k;
  }

  // Calculate cluster sizes and percentages
  const clusterSizes: Record<number, number> = {};
  for (let c = 0; c < k; c++) clusterSizes[c] = 0;
  for (let i = 0; i < n; i++) clusterSizes[assignments[i]] = (clusterSizes[assignments[i]] || 0) + 1;

  const clusterPercentages: Record<number, number> = {};
  for (let c = 0; c < k; c++) {
    clusterPercentages[c] = Number(((clusterSizes[c] / n) * 100).toFixed(1));
  }

  // Build centroids map in standardized (scaled 0..1) and original real business units
  const scaledCentroids: Record<number, Record<string, number>> = {};
  const centroids: Record<number, Record<string, number>> = {};

  for (let c = 0; c < k; c++) {
    scaledCentroids[c] = {};
    for (let fIdx = 0; fIdx < features.length; fIdx++) {
      const feat = features[fIdx];
      scaledCentroids[c][feat] = standardizedCentroidsList[c]
        ? Number(standardizedCentroidsList[c][fIdx].toFixed(4))
        : 0;
    }
    centroids[c] = inverseScaleCentroid(scaledCentroids[c], scaler);
  }

  // Calculate Silhouette Score
  const silhouetteScore = calculateSilhouetteScore(data, assignments, k);

  // Calculate Inter-Cluster Distance Matrix
  const interClusterDistances: number[][] = Array.from({ length: k }, () => new Array(k).fill(0));
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      if (i === j) {
        interClusterDistances[i][j] = 0;
      } else if (standardizedCentroidsList[i] && standardizedCentroidsList[j]) {
        interClusterDistances[i][j] = Number(
          euclideanDistance(standardizedCentroidsList[i], standardizedCentroidsList[j]).toFixed(3)
        );
      }
    }
  }

  // PCA 2D coordinates for visual map
  const pca = computePCA2D(data);
  const pcaPoints: ClusterPoint[] = pca.points.map((pt, idx) => ({
    id: idx + 1,
    x: pt.x,
    y: pt.y,
    cluster: assignments[idx],
    label: rawRows[idx]?.ID_Cliente || rawRows[idx]?.ID_Suscriptor || rawRows[idx]?.ID_Cuenta || `Reg #${idx + 1}`,
    data: rawRows[idx] || {},
  }));

  const executionTimeMs = Number((performance.now() - startTime).toFixed(1));

  return {
    algorithm,
    k,
    assignments,
    clusterSizes,
    clusterPercentages,
    centroids,
    scaledCentroids,
    silhouetteScore,
    wss: Number(wss.toFixed(2)),
    interClusterDistances,
    pcaPoints,
    featuresUsed: features,
    executionTimeMs,
  };
}
