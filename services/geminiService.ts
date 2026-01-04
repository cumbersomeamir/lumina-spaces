
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { APP_MODELS } from '../constants';
import { GroundingSource } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generateReimaginedImage(base64Image: string, prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: APP_MODELS.IMAGE,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: 'image/png'
          }
        },
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image was generated in the response.");
}

export async function editImage(originalBase64: string, editPrompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: APP_MODELS.IMAGE,
    contents: {
      parts: [
        {
          inlineData: {
            data: originalBase64.split(',')[1],
            mimeType: 'image/png'
          }
        },
        { text: editPrompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to edit image.");
}

export async function getDesignAdvice(
  message: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[]
): Promise<{ text: string, sources: GroundingSource[] }> {
  const response = await ai.models.generateContent({
    model: APP_MODELS.TEXT,
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: `You are an expert interior design consultant named Lumina. 
      You help users refine their room designs. If they ask about furniture, provide shoppable links using Google Search grounding. 
      Keep advice professional, creative, and practical.`,
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.text || "I'm sorry, I couldn't process that request.";
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const sources: GroundingSource[] = chunks
    .filter(chunk => chunk.web)
    .map(chunk => ({
      title: chunk.web?.title || 'Related Source',
      uri: chunk.web?.uri || ''
    }));

  return { text, sources };
}
