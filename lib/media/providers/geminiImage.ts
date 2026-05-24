/**
 * lib/media/providers/geminiImage.ts
 * Gemini 2.5 Flash image generation provider.
 */

import { buildHistoricalImagePrompt } from "../imagePrompt";
import { imageCacheKey, readGeneratedFile, writeGeneratedFile } from "../mediaCache";
import { ImageRequest, ImageResult } from "../types";

export async function generateGeminiImage(input: ImageRequest): Promise<ImageResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.0-flash-exp";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set");
  }

  const prompt = buildHistoricalImagePrompt(input);

  // ── Cache check ────────────────────────────────────────────────────────────
  const key = imageCacheKey({
    lessonId: input.lessonId,
    sceneId: input.sceneId,
    prompt,
    width: 1280,
    height: 720,
  });

  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    const cached = await readGeneratedFile("images", `${key}.${ext}`);
    if (cached) {
      return { success: true, providerUsed: "gemini", imageUrl: cached, prompt };
    }
  }

  // ── Call Gemini API ────────────────────────────────────────────────────────
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Gemini image API error ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  const parts: unknown[] = data?.candidates?.[0]?.content?.parts ?? [];

  // Find the image part
  type GeminiPart = { inlineData?: { data: string; mimeType: string } };
  const imagePart = (parts as GeminiPart[]).find(
    (p) => p?.inlineData?.data && p?.inlineData?.mimeType?.startsWith("image/"),
  );

  if (!imagePart?.inlineData) {
    throw new Error("Gemini returned no image data in response");
  }

  const mimeType = imagePart.inlineData.mimeType;
  const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "png";
  const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
  const imageUrl = await writeGeneratedFile("images", `gemini-${key}.${ext}`, imageBuffer);

  return { success: true, providerUsed: "gemini", imageUrl, prompt };
}

/** Legacy ImageProvider interface wrapper for use in mediaRouter */
import type { BinaryMedia, ImageProvider } from "../types";

export const geminiImageProvider: ImageProvider = {
  name: "gemini",
  isAvailable: () => Boolean(process.env.GEMINI_API_KEY),
  generate: async (request, _prompt) => {
    const result = await generateGeminiImage(request);
    // We already saved the file in generateGeminiImage; return a dummy buffer for the router
    // (the router re-saves, but we short-circuit via cache check above on next call)
    const placeholder = Buffer.alloc(0);
    return {
      providerUsed: "gemini",
      data: placeholder,
      extension: "png",
      contentType: "image/png",
    } satisfies BinaryMedia;
  },
};
