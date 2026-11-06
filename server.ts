import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI client if GEMINI_API_KEY is available
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// Segment interpretation and strategic recommendation endpoint
app.post('/api/gemini/interpret-segments', async (req, res) => {
  try {
    const { sector, objective, segments, variableSummaries, overallMetrics } = req.body;

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return res.status(400).json({ error: 'Segments data is required' });
    }

    if (!ai) {
      // Fallback response handled gracefully by backend if API key is not yet set
      return res.status(200).json({
        source: 'heuristic',
        message: 'No GEMINI_API_KEY detected, generated via advanced heuristic engine.',
        data: null,
      });
    }

    const systemInstruction = `Eres un Chief Data Scientist y Director de Estrategia Comercial de clase mundial.
Tu misión es interpretar rigurosamente los clusters/segmentos generados matemáticamente por algoritmos de Machine Learning (K-Means, K-Medoids, etc.), asignarles nombres ejecutivos de alto impacto, generar perfiles descriptivos y operacionales, y formular estrategias comerciales accionables y diferenciadas.
El sector de la empresa es: "${sector || 'Negocio General'}"
El objetivo estratégico de la segmentación es: "${objective || 'Fidelización y Crecimiento'}"
Debes devolver un JSON estructurado en estricto idioma español profesional de negocios.`;

    const prompt = `Analiza estos ${segments.length} segmentos calculados sobre los clientes/entidades:

Variables analizadas en el dataset:
${JSON.stringify(variableSummaries || [], null, 2)}

Métricas de cada cluster (centroides en valores reales, tamaño y características distintivas):
${JSON.stringify(segments, null, 2)}

Por favor, genera para CADA segmento:
1. "businessName": Un nombre comercial claro, profesional y descriptivo (ej: "Clientes Premium Alta Frecuencia", "Clientes Digitales Ocasionales", "Clientes en Riesgo de Abandono", etc.).
2. "tagline": Frase corta (1 línea) que resume su esencia de negocio.
3. "executiveProfile":
   - "characterization": ¿Qué caracteriza fundamentalmente a este grupo?
   - "keyDifferentiators": ¿En qué variables y comportamientos se distancia drásticamente de los demás?
   - "commercialPotential": Nivel de valor actual y potencial futuro (Alto, Medio, Alto Potencial, Riesgo, etc.) con justificación.
   - "associatedRisks": Principales riesgos comerciales u operacionales.
4. "operationalProfile":
   - "keyVariables": Las 2 o 3 variables operativas más críticas.
   - "kpiTargets": Indicadores o metas sugeridas para medir la gestión del segmento.
   - "interactionChannels": Canales recomendados de contacto/atención.
5. "strategies":
   - "pricing": Estrategia de precios, tarifas, descuentos, paquetes o modelos de cobro.
   - "loyalty": Estrategia de fidelización, lealtad, beneficios y retención de largo plazo.
   - "innovation": Estrategia de innovación, personalización y nuevos productos/servicios.
   - "growth": Estrategia de crecimiento, cross-selling, up-selling y aumento de ticket/adopción.
   - "riskMitigation": Estrategia de gestión de riesgo, mitigación de churn, cobranza preventiva o reenganche.

Además, proporciona una síntesis transversal del análisis:
- "executiveSummary": Resumen ejecutivo global de los hallazgos (1 a 2 párrafos).
- "quickWins": 3 acciones tácticas inmediatas (0-30 días).
- "strategicBets": 2 iniciativas de mediano plazo (30-90 días).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            quickWins: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            strategicBets: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  clusterId: { type: Type.INTEGER },
                  businessName: { type: Type.STRING },
                  tagline: { type: Type.STRING },
                  executiveProfile: {
                    type: Type.OBJECT,
                    properties: {
                      characterization: { type: Type.STRING },
                      keyDifferentiators: { type: Type.STRING },
                      commercialPotential: { type: Type.STRING },
                      associatedRisks: { type: Type.STRING },
                    },
                    required: ['characterization', 'keyDifferentiators', 'commercialPotential', 'associatedRisks'],
                  },
                  operationalProfile: {
                    type: Type.OBJECT,
                    properties: {
                      keyVariables: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      kpiTargets: { type: Type.STRING },
                      interactionChannels: { type: Type.STRING },
                    },
                    required: ['keyVariables', 'kpiTargets', 'interactionChannels'],
                  },
                  strategies: {
                    type: Type.OBJECT,
                    properties: {
                      pricing: { type: Type.STRING },
                      loyalty: { type: Type.STRING },
                      innovation: { type: Type.STRING },
                      growth: { type: Type.STRING },
                      riskMitigation: { type: Type.STRING },
                    },
                    required: ['pricing', 'loyalty', 'innovation', 'growth', 'riskMitigation'],
                  },
                },
                required: ['clusterId', 'businessName', 'tagline', 'executiveProfile', 'operationalProfile', 'strategies'],
              },
            },
          },
          required: ['executiveSummary', 'quickWins', 'strategicBets', 'segments'],
        },
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error('Gemini returned an empty response');
    }

    const parsedData = JSON.parse(outputText);
    return res.status(200).json({
      source: 'gemini-3.8-flash',
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error generating segment interpretation via Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'Error executing Gemini interpretation',
      source: 'error',
      data: null,
    });
  }
});

// Vite Middleware integration for dev server or static build serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Intelligent Segmentation Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
