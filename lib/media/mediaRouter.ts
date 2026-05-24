import { azureTtsProvider } from "./providers/azureTts";
import { browserFallbackTts } from "./providers/browserFallback";
import { elevenlabsTtsProvider } from "./providers/elevenlabsTts";
import { geminiImageProvider } from "./providers/geminiImage";
import { generatePlaceholderImage } from "./providers/placeholderImage";
import { huggingfaceImageProvider } from "./providers/huggingfaceImage";
import { MuxlisaAsyncAcceptedError, muxlisaTtsProvider } from "./providers/muxlisaTts";
import { pollinationsImageProvider } from "./providers/pollinationsImage";
import { pollinationsTtsProvider } from "./providers/pollinationsTts";
import { buildHistoricalImagePrompt, buildSceneImageRequest, sanitizeTtsText } from "./prompts";
import {
  audioCacheKey,
  imageCacheKey,
  readGeneratedFile,
  writeGeneratedFile,
} from "./mediaCache";
import {
  ImageProvider,
  ImageRequest,
  ImageResult,
  SceneMediaRequest,
  TtsProvider,
  TtsRequest,
  TtsResult,
} from "./types";

const ttsProviders: TtsProvider[] = [
  muxlisaTtsProvider,
  azureTtsProvider,
  elevenlabsTtsProvider,
  pollinationsTtsProvider,
];

const imageProviders: ImageProvider[] = [
  pollinationsImageProvider,
  geminiImageProvider,
  huggingfaceImageProvider,
];

export async function generateTtsWithFallback(request: TtsRequest): Promise<TtsResult> {
  const text = sanitizeTtsText(request.text);

  for (const provider of ttsProviders) {
    if (!provider.isAvailable()) continue;

    const voice = getProviderVoice(provider.name);
    const key = audioCacheKey({
      lessonId: request.lessonId,
      sceneId: request.sceneId,
      text,
      provider: provider.name,
      voice,
    });
    const cached = await readGeneratedFile("audio", `${key}.mp3`);
    if (cached) {
      return {
        success: true,
        providerUsed: provider.name,
        audioUrl: cached,
        mode: "server_audio",
        text,
      };
    }

    try {
      const media = await provider.synthesize({ ...request, text });
      const filename = `${key}.${media.extension}`;
      const audioUrl = await writeGeneratedFile("audio", filename, media.data);
      return {
        success: true,
        providerUsed: provider.name,
        audioUrl,
        mode: "server_audio",
        text,
      };
    } catch (error) {
      if (error instanceof MuxlisaAsyncAcceptedError) {
        await writeGeneratedFile("audio", `muxlisa-pending-${error.taskId}.json`, JSON.stringify({
          taskId: error.taskId,
          cacheKey: key,
          text,
          lessonId: request.lessonId,
          sceneId: request.sceneId,
          createdAt: new Date().toISOString(),
        }, null, 2));
        console.warn(`TTS provider ${provider.name} accepted async request ${error.taskId}; waiting for webhook.`);
        continue;
      }
      console.warn(`TTS provider ${provider.name} failed:`, error);
    }
  }

  return browserFallbackTts({ ...request, text });
}

export async function generateImageWithFallback(request: ImageRequest): Promise<ImageResult> {
  const prompt = buildHistoricalImagePrompt(request);
  const key = imageCacheKey({
    lessonId: request.lessonId,
    sceneId: request.sceneId,
    prompt,
    width: 1280,
    height: 720,
  });

  for (const extension of ["png", "jpg", "jpeg", "webp", "svg"]) {
    const cached = await readGeneratedFile("images", `${key}.${extension}`);
    if (cached) {
      return {
        success: true,
        providerUsed: extension === "svg" ? "placeholder" : "pollinations",
        imageUrl: cached,
        prompt,
      };
    }
  }

  for (const provider of imageProviders) {
    if (!provider.isAvailable()) continue;

    try {
      const media = await provider.generate(request, prompt);
      const imageUrl = await writeGeneratedFile("images", `${key}.${media.extension}`, media.data);
      return {
        success: true,
        providerUsed: provider.name,
        imageUrl,
        prompt,
      };
    } catch (error) {
      console.warn(`Image provider ${provider.name} failed:`, error);
    }
  }

  return generatePlaceholderImage(request, prompt);
}

export async function generateSceneMedia(request: SceneMediaRequest) {
  const [audio, image] = await Promise.all([
    generateTtsWithFallback({
      lessonId: request.lessonId,
      sceneId: request.scene.sceneId,
      text: request.scene.teacherSpeech,
      voiceStyle: "teacher",
      language: "uz-Latn",
    }),
    generateImageWithFallback(buildSceneImageRequest(request.lessonId, request.scene)),
  ]);

  return {
    sceneId: request.scene.sceneId,
    audio,
    image,
  };
}

export async function generateAllScenesMedia(params: {
  lessonId: string;
  scenes: SceneMediaRequest["scene"][];
}) {
  const results = [];

  for (const scene of params.scenes) {
    results.push(await generateSceneMedia({ lessonId: params.lessonId, scene }));
    await wait(800);
  }

  return results;
}

function getProviderVoice(provider: string) {
  if (provider === "azure") return process.env.AZURE_SPEECH_VOICE || "uz-UZ-SardorNeural";
  if (provider === "muxlisa") return "muxlisa";
  if (provider === "elevenlabs") return process.env.ELEVENLABS_VOICE_ID || "default";
  if (provider === "pollinations") return process.env.POLLINATIONS_TTS_VOICE || "alloy";
  return "browser";
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
