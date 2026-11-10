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
  AppNavView,
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
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Breadcrumbs } from './components/Breadcrumbs';
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

// Mapping from Step ID to default AppNavView
const STEP_TO_VIEW_MAP: Record<number, AppNavView> = {
  1: 'upload',
  2: 'validation',
  3: 'settings',
  4: 'transformation',
  5: 'transformation',
  6: 'selection_k',
  7: 'clustering',
  8: 'profiles',
  9: 'dashboard',
};

// Mapping from AppNavView to Step ID
const VIEW_TO_STEP_MAP: Record<AppNavView, number> = {
  dashboard: 9,
  upload: 1,
  exploration: 1,
  validation: 2,
  transformation: 5,
  selection_k: 6,
  clustering: 7,
  profiles: 8,
  strategies: 8,
  reports: 9,
  settings: 3,
};

export default function App() {
  // Theme state: dark (corporate deep blue/slate) vs light
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Active navigation view (default: 'dashboard' for high executive impact on start)
  const [currentView, setCurrentView] = useState<AppNavView>('dashboard');

  // Step navigation (1 to 9)
  const [activeStep, setActiveStep] = useState<number>(9);
  const [maxReachedStep, setMaxReachedStep] = useState<number>(9);

  // Transformation tab toggle when in 'transformation' view: 'stats' (Mods 5-6) or 'scaling' (Mods 7-8)
  const [prepTab, setPrepTab] = useState<'stats' | 'scaling'>('scaling');

  // Apply dark theme class to root html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Business Context State
  const [context, setContext] = useState<BusinessContext>({
    sector: 'Retail y E-Commerce',
    objective: 'Fidelización y Lealtad',
    primaryKPI: 'Customer Lifetime Value (LTV) & Recency',
    description: 'Segmentación de clientes para maximizar recurrencia y ticket promedio.',
  });

  // Dataset State - initialized with Retail E-Commerce RFM sample
  const [dataset, setDataset] = useState<Dataset | null>(() => {
    const initialSample = SAMPLE_DATASETS[0];
    const rows = initialSample.generate();
    return createDatasetFromRaw(rows, initialSample.fileName, rows.length * 128, 'sample');
  });

  // Transformations State (per variable)
  const [transformations, setTransformations] = useState<Record<string, TransformationType>>({});

  // Scaling Method (Default: Min-Max 0 a 1 as required in spec)
  const [scalingMethod, setScalingMethod] = useState<ScalingMethod>('minmax');

  // Clustering Algorithm & K
  const [algorithm, setAlgorithm] = useState<ClusteringAlgorithm>('kmeans');
  const [selectedK, setSelectedK] = useState<number>(4);
  const [isExecutingClustering] = useState<boolean>(false);

  // AI Interpretation State
  const [profiles, setProfiles] = useState<ClusterBusinessProfile[]>([]);
  const [dashboard, setDashboard] = useState<GlobalExecutiveDashboard | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiSource, setAiSource] = useState<string>('heurístico avanzado');

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
  const handleViewChange = (view: AppNavView) => {
    setCurrentView(view);
    const correspondingStep = VIEW_TO_STEP_MAP[view] || 1;
    setActiveStep(correspondingStep);
    setMaxReachedStep((m) => Math.max(m, correspondingStep));
    if (view === 'reports') {
      setIsExportModalOpen(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (stepId: number) => {
    setActiveStep(stepId);
    setCurrentView(STEP_TO_VIEW_MAP[stepId] || 'dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextStep = () => {
    setActiveStep((prev) => {
      const next = Math.min(9, prev + 1);
      setMaxReachedStep((m) => Math.max(m, next));
      setCurrentView(STEP_TO_VIEW_MAP[next] || 'dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return next;
    });
  };

  const handleBackStep = () => {
    setActiveStep((prev) => {
      const next = Math.max(1, prev - 1);
      setCurrentView(STEP_TO_VIEW_MAP[next] || 'dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return next;
    });
  };

  const handleDatasetLoaded = (newDataset: Dataset) => {
    setDataset(newDataset);
    const matchedSample = SAMPLE_DATASETS.find((s) => s.fileName === newDataset.fileName);
    if (matchedSample) {
      setContext({
        sector: matchedSample.sector,
        objective: matchedSample.objective,
        primaryKPI: matchedSample.kpi,
        description: matchedSample.description,
      });
    }
    setTransformations({});
    setActiveStep(1);
    setCurrentView('upload');
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-800 dark:text-slate-100 flex flex-row font-sans selection:bg-blue-600/20 selection:text-blue-900 dark:selection:bg-blue-500/30 dark:selection:text-blue-200 antialiased">
      {/* Enterprise Collapsible Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        dataset={dataset}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        selectedK={selectedK}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Executive Header */}
        <Navbar
          dataset={dataset}
          context={context}
          onOpenContextModal={() => setIsContextModalOpen(true)}
          onExportClick={() => setIsExportModalOpen(true)}
          onPrintClick={handlePrint}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Sub-header Breadcrumb Bar & Quick View Tracker */}
        <div className="bg-white/80 dark:bg-[#0b101c]/80 border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between no-print">
          <Breadcrumbs
            currentView={currentView}
            context={context}
            dataset={dataset}
            onNavigate={handleViewChange}
            selectedK={selectedK}
          />
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Motor IA:</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-semibold">
              {aiSource}
            </span>
          </div>
        </div>

        {/* Optional 9-Step Guided Stepper */}
        <WorkflowStepper
          currentStep={activeStep}
          onStepChange={handleStepClick}
          maxReachedStep={maxReachedStep}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* VIEW: Dashboard Ejecutivo (Módulo 15 y 16) */}
          {(currentView === 'dashboard' || currentView === 'reports') && dataset && dashboard && (
            <ExecutiveDashboardModule
              dataset={dataset}
              clusterResult={clusterResult}
              profiles={profiles}
              dashboard={dashboard}
              context={context}
              onPrint={handlePrint}
              onNavigateView={handleViewChange}
            />
          )}

          {/* VIEW: Carga & Exploración (Módulos 1 y 2) */}
          {(currentView === 'upload' || currentView === 'exploration') && (
            <DataUploadModule
              dataset={dataset}
              onDatasetLoaded={handleDatasetLoaded}
              onNext={handleNextStep}
            />
          )}

          {/* VIEW: Validación de Variables (Módulo 3) */}
          {currentView === 'validation' && dataset && (
            <VariableValidationModule
              dataset={dataset}
              onUpdateMetadata={handleUpdateMetadata}
              onNext={handleNextStep}
              onBack={handleBackStep}
            />
          )}

          {/* VIEW: Transformación & Escala (Módulos 5, 6, 7 y 8) */}
          {currentView === 'transformation' && dataset && (
            <div className="space-y-4">
              {/* Sub-tab navigation between Descriptive analysis & Scalers */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  onClick={() => setPrepTab('stats')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    prepTab === 'stats'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Módulo 5 & 6: Estadísticos, Reglas & Asimetría
                </button>
                <button
                  onClick={() => setPrepTab('scaling')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    prepTab === 'scaling'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Módulo 7 & 8: Transformaciones & Estandarización
                </button>
              </div>

              {prepTab === 'stats' ? (
                <DescriptiveModule
                  dataset={dataset}
                  onNext={() => setPrepTab('scaling')}
                  onBack={handleBackStep}
                />
              ) : (
                <TransformationModule
                  dataset={dataset}
                  transformations={transformations}
                  onUpdateTransformations={setTransformations}
                  scalingMethod={scalingMethod}
                  onUpdateScalingMethod={setScalingMethod}
                  onNext={handleNextStep}
                  onBack={() => setPrepTab('stats')}
                />
              )}
            </div>
          )}

          {/* VIEW: Selección Óptima de K (Módulos 9 y 10) */}
          {currentView === 'selection_k' && (
            <OptimalKModule
              recommendation={optimalKRecommendation}
              selectedK={selectedK}
              onSelectK={setSelectedK}
              onOpenScenarioComparison={() => setIsScenarioModalOpen(true)}
              onNext={handleNextStep}
              onBack={handleBackStep}
            />
          )}

          {/* VIEW: Ejecución de Clustering (Módulo 11) */}
          {currentView === 'clustering' && dataset && (
            <ClusteringExecutionModule
              dataset={dataset}
              clusterResult={clusterResult}
              onAlgorithmChange={setAlgorithm}
              isExecuting={isExecutingClustering}
              onNext={handleNextStep}
              onBack={handleBackStep}
            />
          )}

          {/* VIEW: Fichas & Estrategias Comerciales IA (Módulos 12, 13 y 14) */}
          {(currentView === 'profiles' || currentView === 'strategies') && (
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

          {/* VIEW: Configuración & Contexto de Negocio (Módulo 4) */}
          {currentView === 'settings' && (
            <BusinessContextModule
              context={context}
              onUpdateContext={setContext}
              onNext={handleNextStep}
              onBack={handleBackStep}
            />
          )}
        </main>
      </div>

      {/* Scenario Comparison Modal (Module 10) */}
      <ScenarioComparisonModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        recommendation={optimalKRecommendation}
        selectedK={selectedK}
        onApplyK={(k) => setSelectedK(k)}
      />

      {/* Corporate Export Modal (Module 16) */}
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

      {/* Quick Context Edit Modal */}
      {isContextModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Ajustar Contexto del Negocio y KPI Prioritario
            </h3>
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
