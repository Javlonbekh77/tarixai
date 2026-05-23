import { AIProvider, GenerateTextParams, GenerateLessonParams } from "./providers/types";
import { geminiProvider } from "./providers/gemini";
import { groqProvider } from "./providers/groq";
import { openrouterProvider } from "./providers/openrouter";
import { ollamaProvider } from "./providers/ollama";
import { mockProvider } from "./providers/mock";
import { LessonJson, LessonJsonSchema } from "./schemas";

const providers: AIProvider[] = [
  geminiProvider,
  groqProvider,
  openrouterProvider,
  ollamaProvider,
  mockProvider
];

export async function generateTextWithFallback(params: GenerateTextParams) {
  for (const provider of providers) {
    if (!provider.isAvailable()) continue;
    try {
      const result = await provider.generateText(params);
      return result;
    } catch (e) {
      console.warn(`Provider ${provider.name} failed for text generation:`, e);
      // fallback to next
    }
  }
  // This should realistically never fail completely since mockProvider always succeeds
  return mockProvider.generateText(params);
}

export async function generateLessonWithFallback(params: GenerateLessonParams): Promise<{ lesson: LessonJson, providerUsed: string }> {
  for (const provider of providers) {
    if (!provider.isAvailable()) continue;
    try {
      if (provider.generateLessonJson) {
        const lesson = await provider.generateLessonJson(params);
        // Validate with Zod before accepting
        const validatedLesson = LessonJsonSchema.parse(lesson);
        return { lesson: validatedLesson, providerUsed: provider.name };
      }
    } catch (e) {
      console.warn(`Provider ${provider.name} failed for lesson generation:`, e);
      // fallback to next
    }
  }
  
  // Fallback to mock
  const mockLesson = await mockProvider.generateLessonJson!(params);
  return { lesson: mockLesson, providerUsed: "mock" };
}
