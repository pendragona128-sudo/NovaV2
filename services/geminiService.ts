import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { BottleneckCategory } from "../types";

const API_KEY = process.env.API_KEY || '';

let client: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  if (!client) {
    client = new GoogleGenAI({ apiKey: API_KEY });
  }
  return client;
};

export const createDiagnosticChat = (result: BottleneckCategory): Chat => {
  const ai = getClient();
  
  const systemInstruction = `
You are an expert executive consultant for NovaMentors, a high-end management consultancy.
Your tone is concierge-style, professional, elite, calm, and helpful.
You never give legal or HR advice.
You never promise guaranteed results.

The user has just completed the "Manager’s Bottleneck Diagnostic".
Their result is: "${result}".

Your goal is to explain this result to them, provide high-level insights into why this bottleneck usually occurs in medium-to-large companies, and gently encourage them to book a call for a deeper dive.
Keep your responses concise (under 150 words usually) and conversational.
`;

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction,
    },
  });
};

export const sendMessageToChat = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "I apologize, but I couldn't generate a response at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I apologize, I am currently experiencing high traffic. Please try again later.";
  }
};
