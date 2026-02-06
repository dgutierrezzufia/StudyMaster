
import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from "@google/genai";

const app = express();

// Middleware con tipado explícito para evitar warnings
app.use(cors() as any);
app.use(express.json({ limit: '10mb' }) as any);

// Inicialización de Gemini - La clave NUNCA llega al cliente
// Use named parameter as required by guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- PERSISTENCIA EN MEMORIA (MOCK DATABASE) ---
// En producción, esto se reemplazaría por una conexión a DB real.
let subjectsStore: any[] = [];
let usersStore: any[] = [
  { id: 'dg-admin-root', email: 'dgutierrez@gecoas.com', password: 'Admin1234', isAdmin: true, name: 'Daniel Gutiérrez' }
];

// --- ENDPOINTS DE INTELIGENCIA ARTIFICIAL ---

// Use 'any' for req and res to bypass pervasive environment-specific TypeScript errors with Express types
app.post('/api/gemini/format', async (req: any, res: any) => {
  try {
    const { rawContent } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Transforma este material en un documento de estudio estructurado en Markdown profesional. 
      Usa ## para secciones. Resalta términos técnicos en **negrita**. 
      Si detectas incidencias o logs, estructúralos como un reporte de diagnóstico.\n\nCONTENIDO:\n${rawContent}`,
    });
    // Access .text property directly as it is not a method
    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gemini/summary', async (req: any, res: any) => {
  try {
    const { content } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera un resumen estratégico denso en Markdown. Ve al grano sin introducciones genéricas.\n\nMaterial:\n${content}`,
    });
    // Access .text property directly
    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gemini/quiz', async (req: any, res: any) => {
  try {
    const { content, numQuestions } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera ${numQuestions} preguntas de opción múltiple de nivel avanzado. Responde SOLO en JSON.\n\nMaterial:\n${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            propertyOrdering: ["question", "options", "correctAnswerIndex", "explanation"]
          }
        }
      },
    });
    // Access .text property directly
    res.json(JSON.parse(response.text || "[]"));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gemini/ask', async (req: any, res: any) => {
  try {
    const { content, history, question } = req.body;
    // Use generateContent for text answers with system instructions and history
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...(history || []).map((m: any) => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text: question }] }
      ],
      config: {
        systemInstruction: `ERES UN TUTOR TÉCNICO DIRECTO. NO SALUDES. NO USES FRASES DE RELLENO. Explica el contenido de referencia de forma académica y precisa.\n\nMATERIAL: ${content}`,
        temperature: 0.1,
      }
    });
    // Access .text property directly
    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- ENDPOINTS DE DATOS (CRUD) ---

app.get('/api/users', (req: any, res: any) => {
  res.json(usersStore);
});

app.post('/api/users', (req: any, res: any) => {
  usersStore = req.body;
  res.sendStatus(201);
});

app.get('/api/subjects', (req: any, res: any) => {
  res.json(subjectsStore);
});

app.post('/api/subjects', (req: any, res: any) => {
  subjectsStore.push(req.body);
  res.status(201).json(req.body);
});

app.put('/api/subjects/:id', (req: any, res: any) => {
  const index = subjectsStore.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    subjectsStore[index] = req.body;
    res.json(subjectsStore[index]);
  } else {
    res.status(404).json({ error: "Asignatura no encontrada" });
  }
});

app.post('/api/subjects/:id', (req: any, res: any) => {
  // Mapping PUT behavior to POST for flexibility if needed by client implementations
  const index = subjectsStore.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    subjectsStore[index] = req.body;
    res.json(subjectsStore[index]);
  } else {
    res.status(404).json({ error: "Asignatura no encontrada" });
  }
});

app.delete('/api/subjects/:id', (req: any, res: any) => {
  subjectsStore = subjectsStore.filter(s => s.id !== req.params.id);
  res.sendStatus(204);
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Servidor StudyMaster en puerto ${PORT}`));
