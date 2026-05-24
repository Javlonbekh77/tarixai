import { sanitizeTtsText } from "../prompts";
import { BinaryMedia, TtsProvider } from "../types";

export const elevenlabsTtsProvider: TtsProvider = {
  name: "elevenlabs",
  isAvailable: () => isConfigured(process.env.ELEVENLABS_API_KEY) && isConfigured(process.env.ELEVENLABS_VOICE_ID),
  synthesize: async ({ text }) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    if (!apiKey || !voiceId) throw new Error("ElevenLabs is not configured");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let res: Response;
    try {
      res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: sanitizeTtsText(text),
          model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.8,
            style: 0.25,
            use_speaker_boost: true,
          },
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      throw new Error(`ElevenLabs TTS failed: ${res.status} ${res.statusText}`);
    }

    return {
      providerUsed: "elevenlabs",
      data: Buffer.from(await res.arrayBuffer()),
      extension: "mp3",
      contentType: "audio/mpeg",
    } satisfies BinaryMedia;
  },
};

function isConfigured(value: string | undefined): value is string {
  if (!value) return false;
  return !/^your_|^YOUR_|^changeme$/i.test(value.trim());
}
