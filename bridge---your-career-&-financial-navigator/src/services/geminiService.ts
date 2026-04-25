import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const MODEL_NAME = "gemini-3-flash-preview";

export async function getCareerGuidance(userInterests: string) {
  const prompt = `You are an expert career counselor for teenagers. 
  The user is interested in: ${userInterests}.
  Provide a detailed analysis of 3 potential high-demand professions. 
  For each, include:
  1. Real-world market demand and salary expectations (be realistic).
  2. Skills needed.
  3. A "Myth vs Reality" section to debunk common misconceptions.
  4. Suggested educational path.
  Format the response in clear Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I couldn't generate career guidance right now. Please try again later.";
  }
}

export async function getFinancialAdvice(goal: string, estimatedMonthlyBudget: number) {
  const prompt = `You are a financial advisor for students. 
  Goal: ${goal}
  Monthly Budget: $${estimatedMonthlyBudget}
  
  Provide:
  1. A realistic breakdown of hidden costs many students miss.
  2. 3 types of funding sources (specific grants, scholarships, or funds) relevant to this goal.
  3. Tips on how to minimize expenses without sacrificing quality of life.
  Format the response in clear Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I couldn't generate financial advice right now.";
  }
}

export async function packageAchievements(achievements: string) {
  const prompt = `Convert these raw student achievements into a professional "Achievement Portfolio" summary that highlights impact and skills:
  Raw Input: ${achievements}
  
  Provide:
  1. A "Professional Summary" for a high schooler.
  2. Bullet points with impact verbs (e.g., "Led", "Developed", "Achieved").
  3. Suggested "Next Steps" to strengthen the portfolio.
  Format the response in clear Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I couldn't package these achievements right now.";
  }
}
