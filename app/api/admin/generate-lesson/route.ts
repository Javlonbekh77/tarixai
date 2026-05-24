import { NextResponse } from "next/server";
import { generateLessonWithFallback } from "@/lib/ai/aiRouter";
import { getPresetLesson } from "@/lib/ai/presetLessons";

export async function POST(request: Request) {
  const body = await request.json();
  const sourceText = String(body.sourceText ?? "");
  const topic = String(body.topic ?? "Tarix darsi");
  const grade = String(body.grade ?? "8-sinf");
  const presetLesson = getPresetLesson(topic);

  if (presetLesson) {
    return NextResponse.json({
      lesson: { ...presetLesson, grade },
      providerUsed: "preset",
      mode: "preset",
    });
  }

  const result = await generateLessonWithFallback({
    sourceText,
    topic,
    grade,
  });

  return NextResponse.json({
    lesson: result.lesson,
    providerUsed: result.providerUsed,
    mode: result.providerUsed === "mock" ? "fallback" : "ai",
  });
}
