import { NextResponse } from "next/server";
import { generateTextWithFallback } from "@/lib/ai/aiRouter";
import { buildStudentQuestionPrompt } from "@/lib/ai/prompts";

type LessonAnswer = {
  answer: string;
  followUpQuestion: string;
  suggestedNextAction: "continue_lesson" | "show_timeline" | "review_notes";
  timerAction: "pause";
};

export async function POST(request: Request) {
  const body = await request.json();
  const topic = String(body.topic ?? "Tarix");
  const question = String(body.question ?? "");
  const currentSceneContext = String(body.currentSceneContext ?? "");
  const studentLevel = normalizeStudentLevel(body.studentLevel);

  const result = await generateTextWithFallback({
    prompt: buildStudentQuestionPrompt({
      topic,
      question,
      studentLevel,
      currentSceneContext,
    }),
    systemInstruction: "Siz dars paytida o'quvchining savoliga qisqa va kontekstga mos javob beradigan Tarixchi AI o'qituvchisiz.",
    temperature: 0.4,
  });

  return NextResponse.json({
    ...parseLessonAnswer(result.text),
    timerAction: "pause",
    providerUsed: result.providerName,
    mode: result.providerName === "mock" ? "fallback" : "ai",
  });
}

function normalizeStudentLevel(value: unknown): "slow" | "normal" | "fast" {
  if (value === "slow" || value === "fast") return value;
  return "normal";
}

function parseLessonAnswer(text: string): LessonAnswer {
  try {
    const parsed = JSON.parse(text) as Partial<LessonAnswer>;
    return {
      answer: String(parsed.answer ?? text),
      followUpQuestion: String(parsed.followUpQuestion ?? "Shu javobdan qanday xulosa chiqardingiz?"),
      suggestedNextAction:
        parsed.suggestedNextAction === "show_timeline" || parsed.suggestedNextAction === "review_notes"
          ? parsed.suggestedNextAction
          : "continue_lesson",
      timerAction: "pause",
    };
  } catch {
    return {
      answer: text,
      followUpQuestion: "Shu javobdan qanday xulosa chiqardingiz?",
      suggestedNextAction: "continue_lesson",
      timerAction: "pause",
    };
  }
}
