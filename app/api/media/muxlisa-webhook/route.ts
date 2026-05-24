import { NextResponse } from "next/server";
import { readGeneratedJson, writeGeneratedFile } from "@/lib/media/mediaCache";

type PendingMuxlisaAudio = {
  taskId: string;
  cacheKey: string;
  text: string;
  lessonId: string;
  sceneId: number;
  createdAt: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const audioUrl = findAudioUrl(body);
    const id = String(body.id ?? body.task_id ?? body.request_id ?? Date.now());
    const pending = await readGeneratedJson<PendingMuxlisaAudio>("audio", `muxlisa-pending-${id}.json`);

    if (audioUrl) {
      const res = await fetch(audioUrl);
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "audio/mpeg";
        const extension = contentType.includes("wav") ? "wav" : "mp3";
        const audioUrlLocal = await writeGeneratedFile(
          "audio",
          pending ? `${pending.cacheKey}.${extension}` : `muxlisa-${id}.${extension}`,
          Buffer.from(await res.arrayBuffer()),
        );
        return NextResponse.json({ success: true, audioUrl: audioUrlLocal });
      }
    }

    await writeGeneratedFile("audio", `muxlisa-${id}.json`, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true, stored: true });
  } catch (error) {
    console.warn("Muxlisa webhook failed:", error);
    return NextResponse.json({ success: true, stored: false });
  }
}

function findAudioUrl(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  for (const key of ["audio_url", "audioUrl", "url", "file_url", "fileUrl", "result_url", "resultUrl"]) {
    const candidate = record[key];
    if (typeof candidate === "string" && /^https?:\/\//.test(candidate)) return candidate;
  }
  for (const item of Object.values(record)) {
    const nested = findAudioUrl(item);
    if (nested) return nested;
  }
  return null;
}
