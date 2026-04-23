import { GoogleGenAI } from '@google/genai';

// Initialize the API wrapper
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

/**
 * Generates a ~200-word summary of the provided text.
 * Explains cost optimization: This is designed to be called ONLY ONCE per post creation,
 * minimizing token usage and saving the summary permanently in the database.
 */
export async function generateSummary(text) {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize the following blog post body in exactly or around 200 words. Respond only with the summary, nothing else. \n\n${text}`
    });
    
    return response.text;
  } catch (error) {
    console.error("AI Generation failed:", error);
    return "Summary generation failed or is unavailable.";
  }
}
