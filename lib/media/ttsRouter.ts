import { audioCacheKey, readGeneratedFile, writeGeneratedFile } from "./mediaCache";
import { aishaTtsProvider } from "./providers/aishaTts";
import { eidosCreateAudio } from "./providers/eidosTts";
import { elevenlabsTtsProvider } from "./providers/elevenlabsTts";
import { muxlisaCreateTask } from "./providers/muxlisaTts";
import { chunkTextForTTS, cleanTextForTTS, enhanceTeacherSpeechForTTS } from "./textCleanup";
import type { BinaryMedia, TtsCreateResult, TtsProvider } from "./types";

const syncFallbackProviders: TtsProvider[] = [
  aishaTtsProvider,
  elevenlabsTtsProvider,
];

export async function createUzbekLessonAudio(params: {
  lessonId: string;
  sceneId: number;
  text: string;
  speaker?: number;
}): Promise<TtsCreateResult> {
  const finalText = prepareUzbekSpeechText(params.text);
  if (!finalText) {
    return browserFallback("", "text is empty after cleanup");
  }

  const preset = await getPresetAudio(params.lessonId, params.sceneId, finalText);
  if (preset) return preset;

  const muxlisaResult = await muxlisaCreateTask({
    lessonId: params.lessonId,
    sceneId: params.sceneId,
    text: finalText,
    speaker: params.speaker,
  });

  if (muxlisaResult.mode !== "browser_fallback") {
    return muxlisaResult;
  }

  const eidosResult = await eidosCreateAudio({
    lessonId: params.lessonId,
    sceneId: params.sceneId,
    text: finalText,
  });

  if (eidosResult.mode !== "browser_fallback") {
    return withWarning(eidosResult, muxlisaResult.warning);
  }

  const warnings = [muxlisaResult.warning, eidosResult.warning].filter(Boolean);

  for (const provider of syncFallbackProviders) {
    if (!provider.isAvailable()) continue;

    try {
      const result = await synthesizeWithCache(provider, params.lessonId, params.sceneId, finalText);
      return withWarning(result, warnings.join(" | "));
    } catch (error) {
      warnings.push(`${provider.name}: ${String(error)}`);
    }
  }

  return browserFallback(finalText, warnings.join(" | ") || "No server-side Uzbek TTS provider is configured.");
}

function prepareUzbekSpeechText(text: string) {
  const enhanced = enhanceTeacherSpeechForTTS(text);
  const chunks = chunkTextForTTS(enhanced);
  return cleanTextForTTS(chunks[0] ?? enhanced);
}

async function synthesizeWithCache(
  provider: TtsProvider,
  lessonId: string,
  sceneId: number,
  finalText: string,
): Promise<TtsCreateResult> {
  const voice = getProviderVoice(provider.name);
  const cacheKey = audioCacheKey({
    lessonId,
    sceneId,
    text: finalText,
    provider: provider.name,
    voice,
  });

  for (const ext of ["mp3", "wav"]) {
    const cached = await readGeneratedFile("audio", `${cacheKey}.${ext}`);
    if (cached) {
      return {
        success: true,
        providerUsed: provider.name,
        mode: "server_audio",
        jobId: `cached-${cacheKey}`,
        audioUrl: cached,
        status: "completed",
        finalText,
      };
    }
  }

  const media: BinaryMedia = await provider.synthesize({
    lessonId,
    sceneId,
    text: finalText,
    voiceStyle: "teacher",
    language: "uz-Latn",
  });
  const audioUrl = await writeGeneratedFile("audio", `${cacheKey}.${media.extension}`, media.data);

  return {
    success: true,
    providerUsed: provider.name,
    mode: "server_audio",
    jobId: cacheKey,
    audioUrl,
    status: "completed",
    finalText,
  };
}

function getProviderVoice(provider: string) {
  if (provider === "aisha") {
    return [
      process.env.AISHA_TTS_MODEL || "Gulnoza",
      process.env.AISHA_TTS_MOOD || "Neutral",
      process.env.AISHA_TTS_SPEED || "1.0",
    ].join(":");
  }
  if (provider === "azure") return process.env.AZURE_SPEECH_VOICE || "uz-UZ-SardorNeural";
  if (provider === "elevenlabs") return process.env.ELEVENLABS_VOICE_ID || "default";
  return "default";
}

async function getPresetAudio(
  lessonId: string,
  sceneId: number,
  finalText: string,
): Promise<TtsCreateResult | null> {
  if (lessonId !== "jadidchilik-harakati") return null;

  for (const extension of ["wav", "mp3"]) {
    const audioUrl = await readGeneratedFile("audio", `${lessonId}/scene-${sceneId}.${extension}`);
    if (audioUrl) {
      return {
        success: true,
        providerUsed: "aisha",
        mode: "server_audio",
        jobId: `preset-${lessonId}-scene-${sceneId}`,
        audioUrl,
        status: "completed",
        finalText,
      };
    }
  }

  return null;
}

function withWarning(result: TtsCreateResult, warning?: string): TtsCreateResult {
  if (!warning) return result;
  return {
    ...result,
    warning: result.warning ? `${warning} | ${result.warning}` : warning,
  };
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
