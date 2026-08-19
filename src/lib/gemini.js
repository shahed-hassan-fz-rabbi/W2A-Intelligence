// Location: src/lib/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeWasteImage(base64Image, mimeType = "image/jpeg") {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Analyze this municipal waste image. Respond in strict JSON format with keys:
  - category: (Plastic, Organic, Metal, Paper, Glass, or E-Waste)
  - priority: (Low, Medium, High, Critical)
  - estimated_weight_kg: (number)
  - reasoning: (brief 1-sentence technical explanation)`;

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  return JSON.parse(response.text().replace(/```json|```/g, "").trim());
}

export async function askCityAdvisor(question, liveContextData) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const systemPrompt = `You are the W2A AI City Sustainability Advisor. Answer questions using this live system data:
  ${JSON.stringify(liveContextData)}
  Keep answers analytical, concise, and focused on route efficiency, budget, and carbon reduction.`;

  const result = await model.generateContent([systemPrompt, question]);
  const response = await result.response;
  return response.text();
}

export async function askSmartAssistant(message, liveContext, chatHistory = []) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const systemInstruction = `You are the W2A Smart Assistant, the official AI interface for the W2A Intelligence Circular Economy Operating System.
You assist Citizens, Certified Recycling Companies, and City Administrators.
Always provide factual, polite, and data-backed answers using this live MySQL platform context:
${JSON.stringify(liveContext)}

Guidelines:
1. For Citizens: Guide them on waste sorting, reporting overflow dumps via the "Report Waste" button, and locating smart bins.
2. For Companies: Highlight recycling performance, active loads, and material conversion.
3. For Admins: Provide accurate totals on collected waste, carbon offsets, and company rankings based directly on the provided context.
4. Keep replies clear, structured, and helpful. Mention relevant metrics (kg, CO2 saved, efficiency scores) when asked.`;

  const prompt = `${systemInstruction}

Conversation History:
${chatHistory.map((c) => `${c.role === "user" ? "User" : "Assistant"}: ${c.text}`).join("\n")}

User Question: ${message}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}