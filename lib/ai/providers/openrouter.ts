import { AIProvider } from "./types";
import { buildGenerateLessonPrompt } from "../prompts";

export const openrouterProvider: AIProvider = {
  name: "openrouter",
  isAvailable: () => !!process.env.OPENROUTER_API_KEY,
  generateText: async ({ prompt, systemInstruction, temperature = 0.7 }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY is missing");

    const model = process.env.OPENROUTER_MODEL || "openrouter/free";
    
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Tarixchi AI"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature
      })
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("OpenRouter API returned empty text");

    return { text, providerName: "openrouter" };
  },
  generateLessonJson: async ({ sourceText, topic, grade }) => {
    const prompt = buildGenerateLessonPrompt(sourceText, topic, grade);
    const result = await openrouterProvider.generateText({ prompt, temperature: 0.2 });
    
    let text = result.text.trim();
    if (text.startsWith("```json")) text = text.replace(/^```json/, "");
    if (text.endsWith("```")) text = text.replace(/```$/, "");
    
    try {
      return JSON.parse(text.trim());
    } catch (e) {
      throw new Error("OpenRouter returned invalid JSON");
    }
  }
};
