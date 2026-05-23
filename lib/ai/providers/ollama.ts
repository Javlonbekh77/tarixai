import { AIProvider } from "./types";
import { buildGenerateLessonPrompt } from "../prompts";

export const ollamaProvider: AIProvider = {
  name: "ollama",
  isAvailable: () => true, // Assuming it might be available, we'll test it on call
  generateText: async ({ prompt, systemInstruction, temperature = 0.7 }) => {
    const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const model = process.env.OLLAMA_MODEL || "gemma3";
    
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    // Use AbortController for short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

    try {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: { temperature }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Ollama API failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const text = data.message?.content;
      if (!text) throw new Error("Ollama API returned empty text");

      return { text, providerName: "ollama" };
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  },
  generateLessonJson: async ({ sourceText, topic, grade }) => {
    const prompt = buildGenerateLessonPrompt(sourceText, topic, grade);
    const result = await ollamaProvider.generateText({ prompt, temperature: 0.2 });
    
    let text = result.text.trim();
    if (text.startsWith("```json")) text = text.replace(/^```json/, "");
    if (text.endsWith("```")) text = text.replace(/```$/, "");
    
    try {
      return JSON.parse(text.trim());
    } catch (e) {
      throw new Error("Ollama returned invalid JSON");
    }
  }
};
