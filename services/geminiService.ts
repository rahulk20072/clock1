import { GoogleGenAI } from "@google/genai";

export const generateTimeInsight = async (currentTime: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing. Please check your configuration.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // We use Flash for speed since this is a UI interaction
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `The current time is ${currentTime}. Generate a very short, poetic, philosophical, or interesting thought about this specific time of day. 
      Keep it under 25 words. Do not use quotes. Be atmospheric.`,
    });

    return response.text?.trim() || "Time flows endlessly.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The moment is now.";
  }
};
