/**
 * Muxlisa AI async TTS provider.
 *
 * Endpoint: POST https://service.muxlisa.uz/api/v1/async/tts
 * Response may be async (task_id) or immediate (audio_url / binary audio).
 */

import { randomUUID } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { chunkTextForTTS, cleanTextForTTS, enhanceTeacherSpeechForTTS } from "../textCleanup";
import { audioCacheKey, ensureGeneratedDirs, readGeneratedFile, writeGeneratedFile } from "../mediaCache";
import { getMuxlisaJobStore, TtsCreateResult, TtsJob, TtsProvider, TtsRequest } from "../types";

function isAvailable(): boolean {
  return Boolean(
    process.env.MUXLISA_API_KEY &&
    process.env.MUXLISA_API_KEY !== "YOUR_API_KEY" &&
    process.env.MUXLISA_TTS_ENDPOINT,
  );
}

export async function muxlisaCreateTask(params: {
  lessonId: string;
  sceneId: number;
  text: string;
  speaker?: number;
}): Promise<TtsCreateResult> {
  const speaker = Number(process.env.MUXLISA_TTS_SPEAKER || params.speaker || 1);
  const enhancedText = enhanceTeacherSpeechForTTS(params.text);
  const chunks = chunkTextForTTS(enhancedText);
  const finalText = cleanTextForTTS(chunks[0] ?? enhancedText);

  if (!isAvailable()) {
    console.info("[muxlisaTts] Fallback used: provider is not configured.");
    return browserFallback(finalText, "Muxlisa API key or endpoint not configured.");
  }

  await ensureGeneratedDirs();
  const cacheKey = audioCacheKey({
    lessonId: params.lessonId,
    sceneId: params.sceneId,
    text: finalText,
    provider: "muxlisa",
    voice: String(speaker),
  });

  for (const ext of ["mp3", "wav"]) {
    const cached = await readGeneratedFile("audio", `${cacheKey}.${ext}`);
    if (cached) {
      console.info(`[muxlisaTts] Cache hit for ${params.lessonId} scene ${params.sceneId}.`);
      return {
        success: true,
        providerUsed: "muxlisa",
        mode: "server_audio",
        jobId: `cached-${cacheKey}`,
        audioUrl: cached,
        status: "completed",
        finalText,
      };
    }
  }
  console.info(`[muxlisaTts] Cache miss for ${params.lessonId} scene ${params.sceneId}.`);

  const pendingJob = findPendingJob(params.lessonId, params.sceneId, cacheKey);
  if (pendingJob) {
    console.info(`[muxlisaTts] Reusing pending job ${pendingJob.jobId}.`);
    return {
      success: true,
      providerUsed: "muxlisa",
      mode: pendingJob.audioUrl ? "server_audio" : "async_audio",
      jobId: pendingJob.jobId,
      audioUrl: pendingJob.audioUrl ?? null,
      status: pendingJob.status,
      finalText,
    };
  }

  const apiKey = process.env.MUXLISA_API_KEY!;
  const endpoint = process.env.MUXLISA_TTS_ENDPOINT!;
  const webhookUrl = process.env.MUXLISA_TTS_WEBHOOK_URL;

  const reqBody: Record<string, unknown> = {
    text: finalText,
    speaker,
  };
  if (webhookUrl) reqBody.webhook_url = webhookUrl;

  let rawResponse: unknown;
  let responseOk = false;
  let contentType = "";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(reqBody),
    });

    responseOk = res.ok;
    contentType = res.headers.get("content-type") || "";

    if (contentType.includes("audio")) {
      const ext = contentType.includes("wav") ? "wav" : "mp3";
      const audioBuffer = Buffer.from(await res.arrayBuffer());
      const audioUrl = await writeGeneratedFile("audio", `${cacheKey}.${ext}`, audioBuffer);
      console.info(`[muxlisaTts] Audio saved immediately as ${cacheKey}.${ext}.`);

      const jobId = randomUUID();
      const job: TtsJob = {
        jobId,
        lessonId: params.lessonId,
        sceneId: params.sceneId,
        textHash: cacheKey,
        text: finalText,
        status: "completed",
        audioUrl,
        providerUsed: "muxlisa",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      getMuxlisaJobStore().set(jobId, job);

      return {
        success: true,
        providerUsed: "muxlisa",
        mode: "server_audio",
        jobId,
        audioUrl,
        status: "completed",
        finalText,
      };
    }

    rawResponse = await res.json().catch(() => ({}));
  } catch (error) {
    console.warn("[muxlisaTts] Request failed:", error);
    return browserFallback(finalText, String(error));
  }

  if (!responseOk) {
    console.warn("[muxlisaTts] Non-OK response:", rawResponse);
    return browserFallback(finalText, "Muxlisa returned non-OK status");
  }

  const immediateAudioUrl = extractAudioUrl(rawResponse);
  if (immediateAudioUrl) {
    try {
      const audioRes = await fetch(immediateAudioUrl);
      if (audioRes.ok) {
        const audioCt = audioRes.headers.get("content-type") || "audio/mpeg";
        const ext = audioCt.includes("wav") ? "wav" : "mp3";
        const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
        const audioUrl = await writeGeneratedFile("audio", `${cacheKey}.${ext}`, audioBuffer);
        console.info(`[muxlisaTts] Audio saved from URL as ${cacheKey}.${ext}.`);

        const jobId = randomUUID();
        const job: TtsJob = {
          jobId,
          lessonId: params.lessonId,
          sceneId: params.sceneId,
          textHash: cacheKey,
          text: finalText,
          status: "completed",
          audioUrl,
          providerUsed: "muxlisa",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rawCreateResponse: rawResponse,
        };
        getMuxlisaJobStore().set(jobId, job);

        return {
          success: true,
          providerUsed: "muxlisa",
          mode: "server_audio",
          jobId,
          audioUrl,
          status: "completed",
          finalText,
        };
      }
    } catch (error) {
      console.warn("[muxlisaTts] Failed to download immediate audio URL:", error);
    }
  }

  const muxlisaTaskId = extractTaskId(rawResponse);
  const jobId = randomUUID();
  const job: TtsJob = {
    jobId,
    muxlisaTaskId: muxlisaTaskId ?? undefined,
    lessonId: params.lessonId,
    sceneId: params.sceneId,
    textHash: cacheKey,
    text: finalText,
    status: "processing",
    providerUsed: "muxlisa",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rawCreateResponse: rawResponse,
  };
  getMuxlisaJobStore().set(jobId, job);

  if (muxlisaTaskId) {
    getMuxlisaJobStore().set(`muxlisa-task-${muxlisaTaskId}`, job);
  }

  console.info(`[muxlisaTts] Job created: ${jobId}, muxlisaTaskId=${muxlisaTaskId ?? "unknown"}`);

  return {
    success: true,
    providerUsed: "muxlisa",
    mode: "async_audio",
    jobId,
    audioUrl: null,
    status: "processing",
    finalText,
  };
}

function browserFallback(finalText: string, warning?: string): TtsCreateResult {
  console.info("[muxlisaTts] Fallback used: browser speech.");
  return {
    success: true,
    providerUsed: "browser_fallback",
    mode: "browser_fallback",
    audioUrl: null,
    status: "fallback",
    finalText,
    warning,
  };
}

export function extractAudioUrl(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  for (const key of ["audio_url", "audioUrl", "url", "file_url", "fileUrl", "result_url", "resultUrl"]) {
    const candidate = record[key];
    if (typeof candidate === "string" && /^https?:\/\//.test(candidate)) return candidate;
  }
  for (const item of Object.values(record)) {
    const nested = extractAudioUrl(item);
    if (nested) return nested;
  }
  return null;
}

export function extractTaskId(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  for (const key of ["task_id", "taskId", "id", "job_id", "jobId", "uuid", "request_id", "requestId"]) {
    const candidate = record[key];
    if (typeof candidate === "string" || typeof candidate === "number") return String(candidate);
  }
  for (const item of Object.values(record)) {
    if (typeof item === "object" && item !== null) {
      const nested = extractTaskId(item);
      if (nested) return nested;
    }
  }
  return null;
}

export function findJobByMuxlisaTaskId(muxlisaTaskId: string): TtsJob | undefined {
  const direct = getMuxlisaJobStore().get(`muxlisa-task-${muxlisaTaskId}`);
  if (direct) return direct;

  for (const job of Array.from(getMuxlisaJobStore().values())) {
    if (job.muxlisaTaskId === muxlisaTaskId) return job;
  }
  return undefined;
}

function findPendingJob(lessonId: string, sceneId: number, textHash: string): TtsJob | undefined {
  for (const job of Array.from(getMuxlisaJobStore().values())) {
    if (
      !job.jobId.startsWith("muxlisa-task-") &&
      job.lessonId === lessonId &&
      job.sceneId === sceneId &&
      job.textHash === textHash &&
      (job.status === "pending" || job.status === "processing")
    ) {
      return job;
    }
  }
  return undefined;
}

export class MuxlisaAsyncAcceptedError extends Error {
  constructor(public taskId: string) {
    super(`Muxlisa accepted async TTS job ${taskId}`);
    this.name = "MuxlisaAsyncAcceptedError";
  }
}

export const muxlisaTtsProvider: TtsProvider = {
  name: "muxlisa",
  isAvailable,
  async synthesize(request: TtsRequest) {
    const result = await muxlisaCreateTask({
      lessonId: request.lessonId,
      sceneId: request.sceneId,
      text: request.text,
    });

    if (result.mode === "async_audio" && result.jobId) {
      throw new MuxlisaAsyncAcceptedError(result.jobId);
    }

    if (result.mode !== "server_audio" || !result.audioUrl) {
      throw new Error("Muxlisa did not return server audio.");
    }

    const filePath = path.join(process.cwd(), "public", result.audioUrl.replace(/^\//, "").replace(/\//g, path.sep));
    const data = await readFile(filePath);
    const extension = result.audioUrl.endsWith(".wav") ? "wav" : "mp3";

    return {
      providerUsed: "muxlisa",
      data,
      extension,
      contentType: extension === "wav" ? "audio/wav" : "audio/mpeg",
    };
  },
};
