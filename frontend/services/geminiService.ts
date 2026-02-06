
import { QuizQuestion, ChatMessage } from "../types";

const API_BASE = '/api/gemini';

async function callAi<T>(endpoint: string, body: any): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error('Error en la comunicación con el servidor de IA');
  return await response.json();
}

export const formatLessonContent = async (rawContent: string): Promise<string> => {
  const res = await callAi<{text: string}>('/format', { rawContent });
  return res.text;
};

export const generateSummary = async (content: string): Promise<string> => {
  const res = await callAi<{text: string}>('/summary', { content });
  return res.text;
};

export const generateQuiz = async (content: string, numQuestions: number = 5): Promise<QuizQuestion[]> => {
  return await callAi<QuizQuestion[]>('/quiz', { content, numQuestions });
};

export const askQuestion = async (content: string, history: ChatMessage[], question: string): Promise<string> => {
  const res = await callAi<{text: string}>('/ask', { content, history, question });
  return res.text;
};
