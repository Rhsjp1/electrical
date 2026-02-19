
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

export const analyzeJobDescription = async (transcript: string): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an expert master electrician licensed in North Carolina. 
    Analyze the following field technician description. 
    Your analysis MUST strictly adhere to:
    1. The National Electrical Code (NEC) latest standards.
    2. NC General Statutes Chapter 87, Article 4.
    3. Title 21, Chapter 18 of the NC Administrative Code.
    
    Ensure all troubleshooting steps prioritize safety and compliance with the State Board of Examiners of Electrical Contractors.
    
    Problem description: ${transcript}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "A professional one-sentence summary of the electrical issue."
          },
          causes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "At least 3 potential root causes based on electrical theory and NEC standards."
          },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Prioritized troubleshooting or repair steps that comply with NC safety regulations and the NEC."
          }
        },
        required: ["summary", "causes", "steps"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || "{}");
    return data as AIAnalysis;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Could not analyze description. Please ensure you described a valid electrical issue.");
  }
};
