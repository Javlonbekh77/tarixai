import { AIProvider } from "./types";
import { buildGenerateLessonPrompt } from "../prompts";

export const geminiProvider: AIProvider = {
  name: "gemini",
  isAvailable: () => !!process.env.GEMINI_API_KEY,
  generateText: async ({ prompt, systemInstruction, temperature = 0.7 }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body: any = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature
      }
    };

    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Gemini API failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini API returned empty text");

    return { text, providerName: "gemini" };
  },
  generateLessonJson: async ({ sourceText, topic, grade }) => {
    const prompt = buildGenerateLessonPrompt(sourceText, topic, grade);
    
    // Request specifically with JSON generation config if possible, or just parse text
    const result = await geminiProvider.generateText({ prompt, temperature: 0.2 });
    
    let text = result.text.trim();
    if (text.startsWith("```json")) {
      text = text.replace(/^```json/, "").replace(/```$/, "").trim();
    }
    
    try {
      const json = JSON.parse(text);
      return json;
    } catch (e) {
      throw new Error("Gemini returned invalid JSON");
    }
  }
};
