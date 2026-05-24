/**
 * app/api/media/generate-all-scenes/route.ts
 * Generates media (TTS + image) for all lesson scenes sequentially.
 * Each scene gets its own async TTS jobId and immediate image.
 * Will not fail the whole request if one scene fails.
 */

import { NextResponse } from "next/server";
import { muxlisaCreateTask } from "@/lib/media/providers/muxlisaTts";
import { generateGeminiImage } from "@/lib/media/providers/geminiImage";
import { buildHistoricalImagePrompt, createPlaceholderSvg } from "@/lib/media/imagePrompt";
import { imageCacheKey, writeGeneratedFile } from "@/lib/media/mediaCache";
import { cleanTextForTTS } from "@/lib/media/textCleanup";
import type { ImageRequest, ImageResult, TtsCreateResult } from "@/lib/media/types";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lessonId = String(body.lessonId ?? "lesson");
    const scenes: unknown[] = Array.isArray(body.scenes) ? body.scenes : [];

    const results = [];

    for (const sceneRaw of scenes) {
      const scene = sceneRaw as Record<string, unknown>;
      const sceneId = Number(scene.sceneId ?? 0);
      const teacherSpeech = String(scene.teacherSpeech ?? "");
      const presentation = (scene.presentation ?? {}) as Record<string, unknown>;

      let audio: TtsCreateResult;
      let image: ImageResult;

      // ── TTS ──────────────────────────────────────────────────────────────
      try {
        audio = await muxlisaCreateTask({ lessonId, sceneId, text: teacherSpeech });
      } catch (err) {
        console.warn(`[generate-all-scenes] TTS failed for scene ${sceneId}:`, err);
        audio = {
          success: true,
          providerUsed: "browser_fallback",
          mode: "browser_fallback",
          audioUrl: null,
          status: "fallback",
          finalText: cleanTextForTTS(teacherSpeech),
        };
      }

      // ── Image ─────────────────────────────────────────────────────────────
      const imageInput: ImageRequest = {
        lessonId,
        sceneId,
        prompt: String(presentation.imagePrompt || presentation.title || ""),
        title: String(presentation.title || "Tarix darsi"),
        visualType: String(presentation.type || "infographic"),
        description: presentation.description ? String(presentation.description) : undefined,
      };

      try {
        if (process.env.GEMINI_API_KEY) {
          image = await generateGeminiImage(imageInput);
        } else {
          throw new Error("No Gemini key");
        }
      } catch (err) {
        console.warn(`[generate-all-scenes] Image failed for scene ${sceneId}, using placeholder:`, err);
        const prompt = buildHistoricalImagePrompt(imageInput);
        const svg = createPlaceholderSvg(imageInput.title, imageInput.visualType, imageInput.prompt);
        const key = imageCacheKey({ lessonId, sceneId, prompt, width: 1280, height: 720 });
        const imageUrl = await writeGeneratedFile("images", `${key}.svg`, svg);
        image = { success: true, providerUsed: "placeholder", imageUrl, prompt };
      }

      results.push({ sceneId, audio, image });

      // Small delay between image requests to avoid rate limiting
      if (scenes.indexOf(sceneRaw) < scenes.length - 1) {
        await wait(600);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("[generate-all-scenes] Unhandled error:", error);
    return NextResponse.json({ success: true, results: [] }, { status: 200 });
  }
}
