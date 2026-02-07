
import { GoogleGenAI, Type } from "@google/genai";

export interface GenerationResult {
  text: string;
  japaneseText: string;
}

const HAIKU_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    poem: {
      type: Type.STRING,
      description: 'The Haiku poem in Greek (exactly 3 lines).',
    },
    japaneseTranslation: {
      type: Type.STRING,
      description: 'The poetic Japanese translation.',
    },
  },
  required: ['poem', 'japaneseTranslation'],
};

export const generateHaikuPoem = async (keywords: string): Promise<GenerationResult> => {
  // Always create a new instance to pick up the latest API key from the environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Δημιούργησε ένα παραδοσιακό ποίημα Haiku στα Ελληνικά (5-7-5 συλλαβές) με θέμα: "${keywords}". 
      Επίστρεψε το αποτέλεσμα ΑΠΟΚΛΕΙΣΤΙΚΑ σε μορφή JSON με τα κλειδιά "poem" και "japaneseTranslation".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: HAIKU_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Το AI δεν επέστρεψε κείμενο.");
    
    let cleanJson = text.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    }
    
    const data = JSON.parse(cleanJson);
    return { 
      text: data.poem, 
      japaneseText: data.japaneseTranslation 
    };
  } catch (error: any) {
    console.error("Haiku Error:", error);
    throw new Error(error.message || "Αποτυχία δημιουργίας ποιήματος.");
  }
};

export const generateHaikuImage = async (poem: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const visualPrompt = `A serene, minimalist digital art piece representing this poem: "${poem}". Style: Japanese Sumi-e painting with subtle watercolors, minimalist, zen atmosphere, high quality.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: visualPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("Δεν βρέθηκε η εικόνα στην απάντηση.");
    
    return `data:image/png;base64,${part.inlineData.data}`;
  } catch (error: any) {
    console.error("Image Error:", error);
    throw new Error(error.message || "Αποτυχία δημιουργίας εικόνας.");
  }
};
