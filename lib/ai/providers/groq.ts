import { AIProvider } from "./types";
import { buildGenerateLessonPrompt } from "../prompts";

export const groqProvider: AIProvider = {
  name: "groq",
  isAvailable: () => !!process.env.GROQ_API_KEY,
  generateText: async ({ prompt, systemInstruction, temperature = 0.7 }) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is missing");

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature
      })
    });

    if (!res.ok) {
      throw new Error(`Groq API failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Groq API returned empty text");

    return { text, providerName: "groq" };
  },
  generateLessonJson: async ({ sourceText, topic, grade }) => {
    const prompt = buildGenerateLessonPrompt(sourceText, topic, grade);
    const result = await groqProvider.generateText({ prompt, temperature: 0.2 });
    
    let text = result.text.trim();
    if (text.startsWith("```json")) text = text.replace(/^```json/, "");
    if (text.endsWith("```")) text = text.replace(/```$/, "");
    
    try {
      return JSON.parse(text.trim());
    } catch (e) {
      throw new Error("Groq returned invalid JSON");
    }
  }
};
