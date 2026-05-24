/**
 * app/api/media/generate-scene-media/route.ts
 * Generates TTS (async) + image for a single lesson scene.
 * TTS returns a jobId for polling; image returns immediately or as placeholder.
 */

import { NextResponse } from "next/server";
import { muxlisaCreateTask } from "@/lib/media/providers/muxlisaTts";
import { generateGeminiImage } from "@/lib/media/providers/geminiImage";
import { buildHistoricalImagePrompt, createPlaceholderSvg } from "@/lib/media/imagePrompt";
import { imageCacheKey, writeGeneratedFile } from "@/lib/media/mediaCache";
import type { ImageRequest, ImageResult, TtsCreateResult } from "@/lib/media/types";
import { cleanTextForTTS } from "@/lib/media/textCleanup";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lessonId = String(body.lessonId ?? "lesson");
    const scene = body.scene;

    if (!scene || typeof scene !== "object") {
      return NextResponse.json({ error: "scene is required" }, { status: 400 });
    }

    const sceneId = Number(scene.sceneId ?? 0);
    const teacherSpeech = String(scene.teacherSpeech ?? "");
    const presentation = scene.presentation ?? {};

    // ── TTS (async via Muxlisa) ────────────────────────────────────────────
    let audio: TtsCreateResult;
    try {
      audio = await muxlisaCreateTask({
        lessonId,
        sceneId,
        text: teacherSpeech,
      });
    } catch (err) {
      console.warn("[generate-scene-media] TTS error:", err);
      audio = {
        success: true,
        providerUsed: "browser_fallback",
        mode: "browser_fallback",
        audioUrl: null,
        status: "fallback",
        finalText: cleanTextForTTS(teacherSpeech),
        warning: String(err),
      };
    }

    // ── Image (Gemini → placeholder) ───────────────────────────────────────
    const imageInput: ImageRequest = {
      lessonId,
      sceneId,
      prompt: String(presentation.imagePrompt || presentation.title || ""),
      title: String(presentation.title || "Tarix darsi"),
      visualType: String(presentation.type || "infographic"),
      description: presentation.description ? String(presentation.description) : undefined,
    };

    let image: ImageResult;
    try {
      if (process.env.GEMINI_API_KEY) {
        image = await generateGeminiImage(imageInput);
      } else {
        throw new Error("No Gemini key");
      }
    } catch (err) {
      console.warn("[generate-scene-media] Image error, using placeholder:", err);
      const prompt = buildHistoricalImagePrompt(imageInput);
      const svg = createPlaceholderSvg(imageInput.title, imageInput.visualType, imageInput.prompt);
      const key = imageCacheKey({ lessonId, sceneId, prompt, width: 1280, height: 720 });
      const imageUrl = await writeGeneratedFile("images", `${key}.svg`, svg);
      image = { success: true, providerUsed: "placeholder", imageUrl, prompt };
    }

    return NextResponse.json({ sceneId, audio, image });
  } catch (error) {
    console.error("[generate-scene-media] Unhandled error:", error);
    return NextResponse.json(
      {
        sceneId: 0,
        audio: {
          success: true,
          providerUsed: "browser_fallback",
          mode: "browser_fallback",
          audioUrl: null,
          status: "fallback",
          finalText: "",
        },
        image: {
          success: true,
          providerUsed: "placeholder",
          imageUrl: "",
          prompt: "",
        },
      },
      { status: 200 },
    );
  }
}
