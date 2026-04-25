import { GoogleGenAI } from "@google/genai";
import { AIResponse, UserState } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured. Please add it to Secrets.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

const SYSTEM_INSTRUCTION = `Ты — ядро интерактивной платформы профориентации "FutureStep AI". Твоя задача — превратить выбор профессии в RPG-игру с реальными кейсами.

### ПРАВИЛА ОТВЕТА (JSON ONLY):
Ты ВСЕГДА отвечаешь строго в формате JSON. Никакого лишнего текста вне структуры.

### СТРУКТУРА JSON:
{
  "message": "Текст обращения",
  "mode": "choice | simulator | portfolio | skill_up | battle | interview",
  "visual_data": {
    "skill_tree_update": ["Навык"],
    "stats": {"hard_skills": 0, "soft_skills": 0, "market_value": 0},
    "battle_details": { "prof1": "...", "prof2": "...", "arguments1": [], "arguments2": [] },
    "salary_data": { "labels": ["5 лет", "10 лет", "15 лет"], "values": [500, 1000, 2000] }
  },
  "interactive_elements": [{"id": "A", "label": "Действие"}],
  "portfolio_entry": null
}

### АЛГОРИТМЫ:
1. ИНИЦИАЦИЯ: В первом сообщении не спрашивай "кем хочешь быть". Спроси про драйв: код, железки или люди.
2. СИМУЛЯЦИЯ: Давай критические ситуации.
3. БИТВА: Если есть сомнения между двумя путями, включай режим battle.
4. ПОРТФОЛИО: Вытаскивай детали проектов.
`;

export async function chatWithAI(userMessage: string, state: UserState): Promise<AIResponse> {
  const ai = getAI();
  
  const history = state.history.map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }]
  }));

  const prompt = `
    Current User Stats: ${JSON.stringify(state.stats)}
    Current User Skills: ${JSON.stringify(state.skills)}
    Current Mode: ${state.currentMode}
    
    User says: ${userMessage}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text || "";
    return JSON.parse(responseText);
  } catch (error) {
    console.error("FutureStep AI: Core Error:", error);
    throw error;
  }
}
