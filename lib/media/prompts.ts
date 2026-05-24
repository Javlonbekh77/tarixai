import { ImageRequest, SceneMediaRequest } from "./types";

export function buildHistoricalImagePrompt(request: ImageRequest) {
  return [
    `Topic: ${request.lessonId.replace(/-/g, " ")}`,
    `Subject: ${request.title}, ${request.description || request.prompt}`,
    "Style: masterpiece, highly detailed, 8k resolution, premium historical educational illustration, cinematic lighting, NotebookLM-style presentation art, clean modern visual, vibrant colors, 16:9 composition.",
    "Modifiers: professional illustration, soft volumetric lighting, rich historical details, concept art, school-friendly.",
    "Negative prompt: gore, violence, modern logos, watermark, text, typography, letters, distorted faces, messy background.",
  ].join(", ");
}

export function buildSceneImageRequest(lessonId: string, scene: SceneMediaRequest["scene"]): ImageRequest {
  return {
    lessonId,
    sceneId: scene.sceneId,
    prompt: scene.presentation.imagePrompt || scene.presentation.title,
    title: scene.presentation.title,
    visualType: scene.presentation.type,
    description: scene.presentation.description,
  };
}

export function cleanTextForTTS(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’`]/g, "'")
    .replace(/[–—]/g, ", ")
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
    .replace(/\bAI\b/g, "sun'iy intellekt")
    .replace(/\s+/g, " ")
    .trim();
}

export const sanitizeTtsText = cleanTextForTTS;
