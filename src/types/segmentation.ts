export type VariableType = 'numeric' | 'categorical' | 'date' | 'id' | 'text';

export type VariableSuitability = 'apt' | 'excluded';

export interface VariableMetadata {
  name: string;
  type: VariableType;
  suitability: VariableSuitability;
  exclusionReason?: string;
  sampleValues: (string | number)[];
  nullCount: number;
  nullPercentage: number;
  uniqueCount: number;
  uniqueRatio: number;
  isSelectedForClustering: boolean;
  min?: number;
  max?: number;
  mean?: number;
  stdDev?: number;
}

export interface Dataset {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  rows: Record<string, any>[];
  headers: string[];
  totalRows: number;
  totalCols: number;
  metadata: VariableMetadata[];
  source: 'upload' | 'sample';
}

export type SectorType =
  | 'Telecomunicaciones'
  | 'Banca y Servicios Financieros'
  | 'Seguros'
  | 'Retail y E-Commerce'
  | 'Salud y Farmacéutica'
  | 'Educación'
  | 'Gobierno y Sector Público'
  | 'Servicios Públicos (Utilities)'
  | 'Logística y Transporte'
  | 'Manufactura y B2B';

export type SegmentationObjective =
  | 'Fidelización y Lealtad'
  | 'Crecimiento de Clientes'
  | 'Venta Cruzada (Cross-selling)'
  | 'Venta Escalonada (Up-selling)'
  | 'Retención y Prevención de Churn'
  | 'Cobranza y Gestión de Mora'
  | 'Innovación y Nuevos Productos'
  | 'Control de Riesgo Crediticio'
  | 'Marketing Personalizado';

export interface BusinessContext {
  sector: SectorType;
  objective: SegmentationObjective;
  primaryKPI: string;
  description: string;
}

export interface DescriptiveStats {
  variable: string;
  min: number;
  max: number;
  mean: number;
  median: number;
  mode: number;
  stdDev: number;
  variance: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
  cv: number; // Coefficient of variation %
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  outliersCount: number;
  inconsistentCount: number;
  warnings: string[];
}

export type SkewnessCategory =
  | 'normal'
  | 'positive_moderate'
  | 'positive_heavy'
  | 'negative_moderate'
  | 'negative_heavy'
  | 'multimodal';

export interface SkewnessAssessment {
  variable: string;
  skewness: number;
  kurtosis: number;
  category: SkewnessCategory;
  label: string;
  explanation: string;
  clusteringImpact: string;
  recommendedTransform: TransformationType;
}

export type TransformationType = 'none' | 'log' | 'log1p' | 'sqrt' | 'boxcox' | 'yeojohnson';

export type ScalingMethod = 'minmax' | 'zscore' | 'robust';

export interface OptimalKMetric {
  k: number;
  wss: number;
  silhouette: number;
  gap: number;
}

export interface OptimalKRecommendation {
  recommendedK: number;
  elbowK: number;
  silhouetteK: number;
  gapK: number;
  confidence: number;
  explanation: string;
  metrics: OptimalKMetric[];
}

export type ClusteringAlgorithm = 'kmeans' | 'kmedoids' | 'hierarchical' | 'dbscan';

export interface ClusterPoint {
  id: number;
  x: number;
  y: number;
  cluster: number;
  label?: string;
  data: Record<string, number>;
}

export interface DistinctiveFeature {
  variable: string;
  clusterMean: number;
  overallMean: number;
  ratio: number;
  direction: 'higher' | 'lower' | 'similar';
  significance: 'high' | 'medium' | 'low';
}

export interface ClusterResult {
  algorithm: ClusteringAlgorithm;
  k: number;
  assignments: number[];
  clusterSizes: Record<number, number>;
  clusterPercentages: Record<number, number>;
  centroids: Record<number, Record<string, number>>; // Real original scale
  scaledCentroids: Record<number, Record<string, number>>; // Scaled scale (0..1)
  silhouetteScore: number;
  wss: number;
  interClusterDistances: number[][];
  pcaPoints: ClusterPoint[];
  featuresUsed: string[];
  executionTimeMs: number;
}

export interface StrategySet {
  pricing: string;
  loyalty: string;
  innovation: string;
  growth: string;
  riskMitigation: string;
}

export interface ExecutiveProfile {
  characterization: string;
  keyDifferentiators: string;
  commercialPotential: string;
  associatedRisks: string;
}

export interface OperationalProfile {
  keyVariables: string[];
  kpiTargets: string;
  interactionChannels: string;
}

export interface ClusterBusinessProfile {
  clusterId: number;
  businessName: string;
  tagline: string;
  size: number;
  percentage: number;
  color: string;
  executiveProfile: ExecutiveProfile;
  operationalProfile: OperationalProfile;
  strategies: StrategySet;
  distinctiveFeatures: DistinctiveFeature[];
}

export interface GlobalExecutiveDashboard {
  executiveSummary: string;
  quickWins: string[];
  strategicBets: string[];
  totalEntities: number;
  kCount: number;
  dominantSegment: string;
  averageSilhouette: number;
  topDrivers: string[];
}
