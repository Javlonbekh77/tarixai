import { LessonJson } from "../schemas";

export type GenerateTextParams = {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
};

export type GenerateTextResult = {
  text: string;
  providerName: string;
};

export type GenerateLessonParams = {
  sourceText: string;
  topic: string;
  grade: string;
};

export interface AIProvider {
  name: string;
  isAvailable: () => boolean;
  generateText: (params: GenerateTextParams) => Promise<GenerateTextResult>;
  generateLessonJson?: (params: GenerateLessonParams) => Promise<LessonJson>;
}
