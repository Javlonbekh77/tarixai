/**
 * app/api/media/tts/route.ts
 * Legacy TTS endpoint — kept for backward compatibility.
 * Redirects to the new async create endpoint logic.
 */

import { NextResponse } from "next/server";
import { createUzbekLessonAudio } from "@/lib/media/ttsRouter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createUzbekLessonAudio({
      sceneId: Number(body.sceneId ?? 0),
      lessonId: String(body.lessonId ?? "lesson"),
      text: String(body.text ?? ""),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.warn("[tts/route] Failed:", error);
    return NextResponse.json({
      success: true,
      providerUsed: "browser_fallback",
      audioUrl: null,
      mode: "browser_fallback",
      status: "fallback",
      finalText: "",
    });
  }
}
