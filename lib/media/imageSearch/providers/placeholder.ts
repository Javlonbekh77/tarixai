import { createPlaceholderSvg } from "@/lib/media/imagePrompt";
import { imageCacheKey, writeGeneratedFile } from "@/lib/media/mediaCache";
import type { ImageSearchResult, SearchImageInput } from "../types";

export async function createPlaceholderImageResult(input: SearchImageInput): Promise<ImageSearchResult> {
  const prompt = input.sceneDescription || input.topic;
  const svg = createPlaceholderSvg(input.sceneTitle || input.topic, input.visualType, prompt);
  const key = imageCacheKey({
    lessonId: input.lessonId,
    sceneId: input.sceneId,
    prompt: `${input.sceneTitle}|${input.visualType}|${prompt}`,
    width: 1280,
    height: 720,
  });
  const imageUrl = await writeGeneratedFile("images", `${key}.svg`, svg);

  return {
    id: `placeholder:${key}`,
    provider: "placeholder",
    title: input.sceneTitle,
    imageUrl,
    attributionText: "AI visual placeholder",
    license: "N/A",
    tags: [input.visualType, input.topic],
  };
}
