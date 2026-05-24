import { cleanTextForTTS } from "../textCleanup";
import type { BinaryMedia, TtsProvider } from "../types";

const BASE_URL = "https://back.aisha.group";

type AishaGenerateResponse = {
  audio_path?: string;
  audio_url?: string;
  url?: string;
};

export const aishaTtsProvider: TtsProvider = {
  name: "aisha",
  isAvailable: () => isConfigured(process.env.AISHA_API_KEY),
  async synthesize({ text }) {
    const apiKey = process.env.AISHA_API_KEY;
    if (!isConfigured(apiKey)) throw new Error("Aisha API key is not configured");

    const finalText = cleanTextForTTS(text).slice(0, 980);
    const form = new FormData();
    form.set("transcript", finalText);
    form.set("language", "uz");
    form.set("model", process.env.AISHA_TTS_MODEL || "Gulnoza");
    form.set("mood", process.env.AISHA_TTS_MOOD || "Neutral");
    form.set("speed", process.env.AISHA_TTS_SPEED || "1.0");

    const response = await fetch(`${BASE_URL}/api/v1/tts/post/`, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Accept-Language": "uz",
      },
      body: form,
    });

    if (!response.ok) {
      throw new Error(`Aisha TTS failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as AishaGenerateResponse;
    const audioUrl = normalizeAudioUrl(data.audio_path || data.audio_url || data.url);
    if (!audioUrl) throw new Error("Aisha TTS did not return audio_path");

    const audioResponse = await fetch(audioUrl, {
      headers: {
        "X-Api-Key": apiKey,
      },
    });

    if (!audioResponse.ok) {
      throw new Error(`Aisha audio download failed: ${audioResponse.status} ${audioResponse.statusText}`);
    }

    const contentType = audioResponse.headers.get("content-type") || "audio/wav";
    const extension = contentType.includes("mpeg") || audioUrl.endsWith(".mp3") ? "mp3" : "wav";

    return {
      providerUsed: "aisha",
      data: Buffer.from(await audioResponse.arrayBuffer()),
      extension,
      contentType: extension === "mp3" ? "audio/mpeg" : "audio/wav",
    } satisfies BinaryMedia;
  },
};

function normalizeAudioUrl(value: string | undefined) {
  if (!value) return null;
  if (/^https?:\/\//.test(value)) return value;
  return `${BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function isConfigured(value: string | undefined): value is string {
  if (!value) return false;
  return !/^your_|^YOUR_|^changeme$/i.test(value.trim());
}
