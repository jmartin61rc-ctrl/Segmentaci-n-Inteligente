import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dataset,
  BusinessContext,
  TransformationType,
  ScalingMethod,
  ClusteringAlgorithm,
  ClusterResult,
  ClusterBusinessProfile,
  GlobalExecutiveDashboard,
  OptimalKRecommendation,
  VariableMetadata,
} from './types/segmentation';
import { SAMPLE_DATASETS } from './data/sampleDatasets';
import { createDatasetFromRaw } from './utils/fileParser';
import { fitAndScaleDataset, applyTransformation } from './utils/transformations';
import {
  evaluateOptimalK,
  executeClustering,
  matrixFromArray,
} from './utils/clustering';
import {
  generateHeuristicProfiles,
  fetchAIInterpretation,
} from './utils/profiling';
import { Navbar } from './components/Navbar';
import { WorkflowStepper } from './components/WorkflowStepper';
import { DataUploadModule } from './components/modules/DataUploadModule';
import { VariableValidationModule } from './components/modules/VariableValidationModule';
import { BusinessContextModule } from './components/modules/BusinessContextModule';
import { DescriptiveModule } from './components/modules/DescriptiveModule';
import { TransformationModule } from './components/modules/TransformationModule';
import { OptimalKModule } from './components/modules/OptimalKModule';
import { ClusteringExecutionModule } from './components/modules/ClusteringExecutionModule';
import { ProfilingStrategyModule } from './components/modules/ProfilingStrategyModule';
import { ExecutiveDashboardModule } from './components/modules/ExecutiveDashboardModule';
import { ScenarioComparisonModal } from './components/ScenarioComparisonModal';
import { ExportModal } from './components/ExportModal';

export default function App() {
  // Step navigation (1 to 9)
  const [activeStep, setActiveStep] = useState<number>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<number>(9);

  // Business Context State
  const [context, setContext] = useState<BusinessContext>({
    sector: 'Retail y E-Commerce',
    objective: 'Fidelización y Lealtad',
    primaryKPI: 'Customer Lifetime Value (LTV) & Recency',
    description: 'Segmentación de clientes para maximizar recurrencia y ticket promedio.',
  });

  // Dataset State - initialized with Retail E-Commerce RFM for zero-wait exploration
  const [dataset, setDataset] = useState<Dataset | null>(() => {
    const initialSample = SAMPLE_DATASETS[0];
    const rows = initialSample.generate();
    return createDatasetFromRaw(rows, initialSample.fileName, rows.length * 128, 'sample');
  });

  // Transformations State (per variable)
  const [transformations, setTransformations] = useState<Record<string, TransformationType>>({});

  // Scaling Method (Default: Min-Max as required in spec)
  const [scalingMethod, setScalingMethod] = useState<ScalingMethod>('minmax');

  // Clustering Algorithm & K
  const [algorithm, setAlgorithm] = useState<ClusteringAlgorithm>('kmeans');
  const [selectedK, setSelectedK] = useState<number>(4);
  const [isExecutingClustering, setIsExecutingClustering] = useState<boolean>(false);

  // AI Interpretation State
  const [profiles, setProfiles] = useState<ClusterBusinessProfile[]>([]);
  const [dashboard, setDashboard] = useState<GlobalExecutiveDashboard | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiSource, setAiSource] = useState<string>('heurístico');

  // Modals
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);

  // Selected features for clustering
  const selectedFeatures = useMemo(() => {
    if (!dataset) return [];
    return dataset.metadata.filter((m) => m.isSelectedForClustering).map((m) => m.name);
  }, [dataset]);

  // Overall means of selected features (raw original scale)
  const overallMeans = useMemo(() => {
    if (!dataset || selectedFeatures.length === 0) return {};
    const means: Record<string, number> = {};
    for (const f of selectedFeatures) {
      const vals = dataset.rows
        .map((r) => r[f])
        .filter((v) => typeof v === 'number' && !isNaN(v));
      const sum = vals.reduce((a, b) => a + b, 0);
      means[f] = vals.length > 0 ? Number((sum / vals.length).toFixed(2)) : 0;
    }
    return means;
  }, [dataset, selectedFeatures]);

  // Prepared transformed and scaled matrix
  const { scaledRows, scaler } = useMemo(() => {
    if (!dataset || selectedFeatures.length === 0) {
      return { scaledRows: [], scaler: { method: scalingMethod, params: {} } };
    }

    // 1. Apply non-linear transformations per variable
    const transformedMatrix: Record<string, number>[] = dataset.rows.map((row) => {
      const newRow: Record<string, number> = {};
      for (const feat of selectedFeatures) {
        newRow[feat] = Number(row[feat] ?? 0);
      }
      return newRow;
    });

    for (const feat of selectedFeatures) {
      const tType = transformations[feat] || 'none';
      if (tType !== 'none') {
        const colVals = transformedMatrix.map((r) => r[feat]);
        const { transformed } = applyTransformation(colVals, tType);
        transformed.forEach((v, idx) => {
          transformedMatrix[idx][feat] = v;
        });
      }
    }

    // 2. Fit and scale (Min-Max default, Z-Score, or Robust)
    return fitAndScaleDataset(transformedMatrix, selectedFeatures, scalingMethod);
  }, [dataset, selectedFeatures, transformations, scalingMethod]);

  // Optimal K Recommendation (Modules 9 & 10)
  const optimalKRecommendation: OptimalKRecommendation = useMemo(() => {
    if (scaledRows.length === 0 || selectedFeatures.length < 2) {
      return {
        recommendedK: 4,
        elbowK: 3,
        silhouetteK: 4,
        gapK: 4,
        confidence: 85,
        explanation: 'Se requieren variables numéricas seleccionadas para evaluar K.',
        metrics: [],
      };
    }
    const dataMatrix = matrixFromArray(scaledRows, selectedFeatures);
    return evaluateOptimalK(dataMatrix, 2, 8);
  }, [scaledRows, selectedFeatures]);

  // Cluster Execution Result (Module 11)
  const clusterResult: ClusterResult = useMemo(() => {
    if (scaledRows.length === 0 || !dataset || selectedFeatures.length < 2) {
      return {
        algorithm,
        k: selectedK,
        assignments: [],
        clusterSizes: {},
        clusterPercentages: {},
        centroids: {},
        scaledCentroids: {},
        silhouetteScore: 0,
        wss: 0,
        interClusterDistances: [],
        pcaPoints: [],
        featuresUsed: selectedFeatures,
        executionTimeMs: 0,
      };
    }

    return executeClustering(
      scaledRows,
      dataset.rows,
      selectedFeatures,
      algorithm,
      selectedK,
      scaler
    );
  }, [scaledRows, dataset, selectedFeatures, algorithm, selectedK, scaler]);

  // Generate Profiles and Dashboard whenever clusterResult or context changes
  useEffect(() => {
    if (clusterResult.assignments.length === 0) return;

    // Fast heuristic generation for immediate display
    const { profiles: hProfiles, globalDashboard: hDashboard } = generateHeuristicProfiles(
      clusterResult,
      context,
      overallMeans
    );
    setProfiles(hProfiles);
    setDashboard(hDashboard);
    setAiSource('heurístico avanzado');
  }, [clusterResult, context, overallMeans]);

  // Handle regenerating profiles and strategies with Gemini API
  const handleRegenerateWithAI = useCallback(async () => {
    if (clusterResult.assignments.length === 0) return;
    setIsGeneratingAI(true);
    try {
      const result = await fetchAIInterpretation(clusterResult, context, overallMeans);
      setProfiles(result.profiles);
      setDashboard(result.globalDashboard);
      setAiSource(result.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash (Server)' : 'heurístico avanzado');
    } catch (err) {
      console.warn('Error during AI regeneration:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  }, [clusterResult, context, overallMeans]);

  // Navigation handlers
  const handleNextStep = () => {
    setActiveStep((prev) => {
      const next = Math.min(9, prev + 1);
      setMaxReachedStep((m) => Math.max(m, next));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return next;
    });
  };

  const handleBackStep = () => {
    setActiveStep((prev) => {
      const next = Math.max(1, prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return next;
    });
  };

  const handleStepClick = (stepId: number) => {
    setActiveStep(stepId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDatasetLoaded = (newDataset: Dataset) => {
    setDataset(newDataset);
    // Find matching sample dataset context if available
    const matchedSample = SAMPLE_DATASETS.find((s) => s.fileName === newDataset.fileName);
    if (matchedSample) {
      setContext({
        sector: matchedSample.sector,
        objective: matchedSample.objective,
        primaryKPI: matchedSample.kpi,
        description: matchedSample.description,
      });
    }
    // Reset transforms
    setTransformations({});
    setActiveStep(1);
  };

  const handleUpdateMetadata = (newMetadata: VariableMetadata[]) => {
    if (!dataset) return;
    setDataset({
      ...dataset,
      metadata: newMetadata,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        dataset={dataset}
        context={context}
        onOpenContextModal={() => setIsContextModalOpen(true)}
        onExportClick={() => setIsExportModalOpen(true)}
        onPrintClick={handlePrint}
        activeStep={activeStep}
      />

      {/* 9-Step Guided Stepper */}
      <WorkflowStepper
        currentStep={activeStep}
        onStepChange={handleStepClick}
        maxReachedStep={maxReachedStep}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Carga & Exploración (Modules 1 & 2) */}
        {activeStep === 1 && (
          <DataUploadModule
            dataset={dataset}
            onDatasetLoaded={handleDatasetLoaded}
            onNext={handleNextStep}
          />
        )}

        {/* Step 2: Validación de Variables (Module 3) */}
        {activeStep === 2 && dataset && (
          <VariableValidationModule
            dataset={dataset}
            onUpdateMetadata={handleUpdateMetadata}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        )}

        {/* Step 3: Contexto de Negocio (Module 4) */}
        {activeStep === 3 && (
          <BusinessContextModule
            context={context}
            onUpdateContext={setContext}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        )}

        {/* Step 4: Análisis Descriptivo & Sesgo (Modules 5 & 6) */}
        {activeStep === 4 && dataset && (
          <DescriptiveModule
            dataset={dataset}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        )}

        {/* Step 5: Transformación & Escala (Modules 7 & 8) */}
        {activeStep === 5 && dataset && (
          <TransformationModule
            dataset={dataset}
            transformations={transformations}
            onUpdateTransformations={setTransformations}
            scalingMethod={scalingMethod}
            onUpdateScalingMethod={setScalingMethod}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        )}

        {/* Step 6: Número Óptimo de K (Modules 9 & 10) */}
        {activeStep === 6 && (
          <OptimalKModule
            recommendation={optimalKRecommendation}
            selectedK={selectedK}
            onSelectK={setSelectedK}
            onOpenScenarioComparison={() => setIsScenarioModalOpen(true)}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        )}

        {/* Step 7: Ejecución de Clustering (Module 11) */}
        {activeStep === 7 && dataset && (
          <ClusteringExecutionModule
            dataset={dataset}
            clusterResult={clusterResult}
            onAlgorithmChange={setAlgorithm}
            isExecuting={isExecutingClustering}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        )}

        {/* Step 8: Perfilamiento & Estrategias IA (Modules 12, 13 & 14) */}
        {activeStep === 8 && (
          <ProfilingStrategyModule
            profiles={profiles}
            onUpdateProfiles={setProfiles}
            context={context}
            clusterResult={clusterResult}
            onRegenerateWithAI={handleRegenerateWithAI}
            isGeneratingAI={isGeneratingAI}
            aiSource={aiSource}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        )}

        {/* Step 9: Dashboard Ejecutivo & Exportación (Modules 15 & 16) */}
        {activeStep === 9 && dataset && dashboard && (
          <ExecutiveDashboardModule
            dataset={dataset}
            clusterResult={clusterResult}
            profiles={profiles}
            dashboard={dashboard}
            context={context}
            onPrint={handlePrint}
            onBack={handleBackStep}
          />
        )}
      </main>

      {/* Scenario Comparison Modal (Module 10) */}
      <ScenarioComparisonModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        recommendation={optimalKRecommendation}
        selectedK={selectedK}
        onApplyK={(k) => setSelectedK(k)}
      />

      {/* Export Modal (Module 16) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        dataset={dataset}
        clusterResult={clusterResult}
        profiles={profiles}
        dashboard={dashboard}
        context={context}
        onPrint={handlePrint}
      />

      {/* Context Quick-Edit Modal */}
      {isContextModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Ajustar Contexto del Negocio</h3>
            <BusinessContextModule
              context={context}
              onUpdateContext={setContext}
              onNext={() => setIsContextModalOpen(false)}
              onBack={() => setIsContextModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Printable Version View (Only rendered during print) */}
      <div className="hidden print:block p-8 bg-white text-slate-950">
        <h1 className="text-2xl font-bold">Reporte Ejecutivo - Intelligent Segmentation Platform</h1>
        <p className="text-sm text-slate-600 mt-1">
          Sector: {context.sector} · Objetivo: {context.objective} · Dataset: {dataset?.fileName}
        </p>
        <div className="mt-4 border-t border-slate-300 pt-4">
          <h2 className="text-lg font-bold">Síntesis Ejecutiva</h2>
          <p className="text-xs text-slate-800 mt-2">{dashboard?.executiveSummary}</p>
        </div>
        <div className="mt-6 border-t border-slate-300 pt-4">
          <h2 className="text-lg font-bold">Resumen de Segmentos (K = {clusterResult.k})</h2>
          {profiles.map((p) => (
            <div key={p.clusterId} className="mt-4 p-3 border border-slate-200 rounded">
              <h3 className="font-bold text-base text-slate-900">{p.businessName} ({p.percentage}%)</h3>
              <p className="text-xs italic text-slate-600">{p.tagline}</p>
              <p className="text-xs text-slate-800 mt-2">{p.executiveProfile.characterization}</p>
              <p className="text-xs font-semibold text-slate-900 mt-2">Estrategia de Precios:</p>
              <p className="text-xs text-slate-700">{p.strategies.pricing}</p>
              <p className="text-xs font-semibold text-slate-900 mt-2">Estrategia de Crecimiento:</p>
              <p className="text-xs text-slate-700">{p.strategies.growth}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
