import { audioCacheKey, ensureGeneratedDirs, readGeneratedFile, writeGeneratedFile } from "../mediaCache";
import { cleanTextForTTS } from "../textCleanup";
import type { TtsCreateResult } from "../types";

export async function eidosCreateAudio(params: {
  lessonId: string;
  sceneId: number;
  text: string;
  voice?: string;
}): Promise<TtsCreateResult> {
  const finalText = cleanTextForTTS(params.text);
  const apiKey = process.env.EIDOS_TTS_API_KEY;
  const endpoint = process.env.EIDOS_TTS_ENDPOINT || "https://eidosspeech.xyz/api/v1/tts";
  const voice = params.voice || process.env.EIDOS_TTS_VOICE || "uz-UZ-SardorNeural";

  if (!isConfigured(apiKey)) {
    return browserFallback(finalText, "Eidos API key is not configured.");
  }
  const configuredApiKey = apiKey;

  await ensureGeneratedDirs();
  const cacheKey = audioCacheKey({
    lessonId: params.lessonId,
    sceneId: params.sceneId,
    text: finalText,
    provider: "eidos",
    voice,
  });

  const cached = await readGeneratedFile("audio", `${cacheKey}.mp3`);
  if (cached) {
    console.info(`[eidosTts] Cache hit for ${params.lessonId} scene ${params.sceneId}.`);
    return {
      success: true,
      providerUsed: "eidos",
      mode: "server_audio",
      jobId: `cached-${cacheKey}`,
      audioUrl: cached,
      status: "completed",
      finalText,
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": configuredApiKey,
      },
      body: JSON.stringify({ text: finalText, voice }),
    });

    if (!response.ok) {
      console.warn("[eidosTts] Non-OK response:", response.status);
      return browserFallback(finalText, `Eidos returned ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("audio") && !contentType.includes("mpeg") && !contentType.includes("octet-stream")) {
      console.warn("[eidosTts] Unexpected content type:", contentType);
      return browserFallback(finalText, "Eidos did not return audio.");
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const audioUrl = await writeGeneratedFile("audio", `${cacheKey}.mp3`, buffer);
    console.info(`[eidosTts] Audio saved as ${cacheKey}.mp3.`);

    return {
      success: true,
      providerUsed: "eidos",
      mode: "server_audio",
      jobId: cacheKey,
      audioUrl,
      status: "completed",
      finalText,
    };
  } catch (error) {
    console.warn("[eidosTts] Request failed:", error);
    return browserFallback(finalText, String(error));
  }
}

function isConfigured(value: string | undefined): value is string {
  if (!value) return false;
  return !/^your_|^YOUR_|^changeme$/i.test(value.trim());
}

function browserFallback(finalText: string, warning?: string): TtsCreateResult {
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
