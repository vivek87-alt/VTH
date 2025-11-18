import { GoogleGenAI } from "@google/genai";
import { HabitStatus, UserHabit } from "../types";

const getStatusText = (status: HabitStatus) => {
  switch (status) {
    case HabitStatus.SUCCESS: return 'Success';
    case HabitStatus.PARTIAL: return 'Partial Success';
    case HabitStatus.FAIL: return 'Fail';
    default: return 'No record';
  }
};

export const getHabitMotivation = async (habit: UserHabit): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      return "API Key not configured. Please set the API Key to get AI insights.";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Get last 7 days of history
    const today = new Date();
    const history: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const status = habit.logs[dateStr] || HabitStatus.NONE;
      history.push(`${dateStr}: ${getStatusText(status)}`);
    }

    const prompt = `
      I am tracking a habit called "${habit.name}".
      Here is my performance for the last 7 days (most recent first):
      ${history.join('\n')}

      Act as a tough but encouraging coach. 
      Based on this data, give me a 2-sentence specific motivational message or piece of advice.
      If I am failing, be stern. If I am winning, challenge me to keep going.
      Do not use markdown. Just plain text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Keep pushing forward. You got this.";

  } catch (error) {
    console.error("Error fetching motivation:", error);
    return "Consistency is key. Keep logging your progress.";
  }
};