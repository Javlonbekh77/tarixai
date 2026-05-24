import { NextResponse } from "next/server";
import { generateTextWithFallback } from "@/lib/ai/aiRouter";

export async function POST(request: Request) {
  const body = await request.json();
  const question = String(body.question ?? "");
  const topic = String(body.topic ?? "General");
  const grade = String(body.grade ?? "8-sinf");

  const result = await generateTextWithFallback({
    prompt: `Sinf: ${grade}\nMavzu: ${topic}\nSavol: ${question}\nO'zbek tilida qisqa, tushunarli tarixiy javob ber.`,
    systemInstruction: "Siz maktab o'quvchilari uchun tarixni sodda tushuntiradigan AI o'qituvchisiz.",
  });

  return NextResponse.json({
    answer: result.text,
    mode: result.providerName === "mock" ? "fallback" : "ai",
    providerUsed: result.providerName,
  });
}
