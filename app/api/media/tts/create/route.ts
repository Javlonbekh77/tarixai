/**
 * app/api/media/tts/create/route.ts
 * Creates an async Muxlisa TTS job for a lesson scene.
 * Returns jobId immediately; frontend polls /api/media/tts/status/[jobId].
 */

import { NextResponse } from "next/server";
import { createUzbekLessonAudio } from "@/lib/media/ttsRouter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lessonId = String(body.lessonId ?? "lesson");
    const sceneId = Number(body.sceneId ?? 0);
    const text = String(body.text ?? "").trim();
    const speaker = Number(body.speaker ?? process.env.MUXLISA_TTS_SPEAKER ?? 1);

    if (!text) {
      return NextResponse.json(
        { success: false, error: "text is required" },
        { status: 400 },
      );
    }

    const result = await createUzbekLessonAudio({ lessonId, sceneId, text, speaker });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[tts/create] Unhandled error:", error);
    return NextResponse.json(
      {
        success: true,
        providerUsed: "browser_fallback",
        mode: "browser_fallback",
        audioUrl: null,
        status: "fallback",
        finalText: "",
        warning: String(error),
      },
      { status: 200 },
    );
  }
}
