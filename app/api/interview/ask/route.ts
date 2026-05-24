import { NextResponse } from "next/server";
import { generateTextWithFallback } from "@/lib/ai/aiRouter";

export async function POST(request: Request) {
  const body = await request.json();
  const persona = String(body.persona ?? "Tarixiy shaxs");
  const topic = String(body.topic ?? "Tarix");
  const question = String(body.question ?? "");

  const result = await generateTextWithFallback({
    prompt: `Shaxs: ${persona}\nMavzu: ${topic}\nSavol: ${question}\nO'zbek tilida javob ber. Bu AI simulyatsiya ekanini unutma.`,
    systemInstruction: "Siz tarixiy shaxs rolida, ammo aniq va ehtiyotkor tarixiy kontekst bilan javob berasiz.",
  });

  return NextResponse.json({
    answer: result.text,
    providerUsed: result.providerName,
  });
}
