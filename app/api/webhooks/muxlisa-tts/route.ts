import { NextResponse } from "next/server";
import { ensureGeneratedDirs, writeGeneratedFile } from "@/lib/media/mediaCache";
import { extractAudioUrl, extractTaskId, findJobByMuxlisaTaskId } from "@/lib/media/providers/muxlisaTts";
import { getMuxlisaJobStore, getUnmatchedWebhooks } from "@/lib/media/types";

export async function POST(request: Request) {
  const authError = validateWebhookSecret(request);
  if (authError) {
    return NextResponse.json({ success: false, error: authError }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  console.info("[muxlisa-webhook] Webhook received.");
  await ensureGeneratedDirs();

  const store = getMuxlisaJobStore();
  const muxlisaTaskId = extractTaskId(body);
  const job = muxlisaTaskId ? findJobByMuxlisaTaskId(muxlisaTaskId) : undefined;

  if (!job) {
    const unmatched = getUnmatchedWebhooks();
    unmatched.push({ receivedAt: new Date().toISOString(), body });
    if (unmatched.length > 50) unmatched.shift();
    console.warn("[muxlisa-webhook] No matching job found.");
    return NextResponse.json({ success: true, matched: false });
  }

  job.rawWebhookResponse = body;
  job.updatedAt = new Date().toISOString();

  const record = body as Record<string, unknown>;
  const statusField = String(record.status ?? record.state ?? "").toLowerCase();
  if (statusField === "failed" || statusField === "error") {
    job.status = "failed";
    job.error = String(record.error ?? record.message ?? "Muxlisa reported failure");
    store.set(job.jobId, job);
    return NextResponse.json({ success: true, matched: true, status: "failed" });
  }

  const audioUrl = extractAudioUrl(body);
  const base64Audio = findBase64Audio(body);

  if (audioUrl) {
    try {
      const audioRes = await fetch(audioUrl);
      if (audioRes.ok) {
        const contentType = audioRes.headers.get("content-type") || "audio/mpeg";
        const ext = contentType.includes("wav") ? "wav" : "mp3";
        const buffer = Buffer.from(await audioRes.arrayBuffer());
        const savedUrl = await writeGeneratedFile("audio", `${job.textHash}.${ext}`, buffer);
        job.status = "completed";
        job.audioUrl = savedUrl;
        job.updatedAt = new Date().toISOString();
        store.set(job.jobId, job);
        console.info(`[muxlisa-webhook] Audio saved for job ${job.jobId}.`);
        return NextResponse.json({ success: true, matched: true, status: "completed" });
      }
    } catch (error) {
      console.warn("[muxlisa-webhook] Failed to download audio URL:", error);
    }
  }

  if (base64Audio) {
    try {
      const buffer = Buffer.from(base64Audio, "base64");
      const savedUrl = await writeGeneratedFile("audio", `${job.textHash}.mp3`, buffer);
      job.status = "completed";
      job.audioUrl = savedUrl;
      job.updatedAt = new Date().toISOString();
      store.set(job.jobId, job);
      console.info(`[muxlisa-webhook] Base64 audio saved for job ${job.jobId}.`);
      return NextResponse.json({ success: true, matched: true, status: "completed" });
    } catch (error) {
      console.warn("[muxlisa-webhook] Failed to decode base64 audio:", error);
    }
  }

  store.set(job.jobId, job);
  return NextResponse.json({ success: true, matched: true, status: job.status });
}

export async function GET() {
  const store = getMuxlisaJobStore();
  const recentJobs = Array.from(store.values())
    .filter((job) => !job.jobId.startsWith("muxlisa-task-"))
    .slice(-20)
    .map((job) => ({
      jobId: job.jobId,
      muxlisaTaskId: job.muxlisaTaskId,
      status: job.status,
      audioUrl: job.audioUrl,
      lessonId: job.lessonId,
      sceneId: job.sceneId,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      error: job.error,
    }));

  return NextResponse.json({
    recentJobs,
    unmatchedWebhooks: getUnmatchedWebhooks().slice(-10),
    totalJobs: store.size,
  });
}

function findBase64Audio(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  for (const key of ["audio_base64", "audioBase64", "base64", "audio_data", "audioData", "data"]) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.length > 100) return candidate;
  }
  for (const item of Object.values(record)) {
    if (typeof item === "object" && item !== null) {
      const nested = findBase64Audio(item);
      if (nested) return nested;
    }
  }
  return null;
}

function validateWebhookSecret(request: Request): string | null {
  const expected = process.env.MUXLISA_WEBHOOK_SECRET?.trim();
  if (!expected) return null;

  const candidate =
    request.headers.get("x-webhook-secret") ||
    request.headers.get("x-muxlisa-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";

  return candidate === expected ? null : "Invalid webhook secret";
}
