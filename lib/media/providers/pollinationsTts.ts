import { sanitizeTtsText } from "../prompts";
import { BinaryMedia, TtsProvider } from "../types";

export const pollinationsTtsProvider: TtsProvider = {
  name: "pollinations",
  isAvailable: () => process.env.POLLINATIONS_TTS_ENABLED === "true",
  synthesize: async ({ text }) => {
    const voice = process.env.POLLINATIONS_TTS_VOICE || "alloy";
    const encoded = encodeURIComponent(sanitizeTtsText(text));
    const res = await fetch(`https://text.pollinations.ai/${encoded}?model=openai-audio&voice=${encodeURIComponent(voice)}`);

    if (!res.ok) {
      throw new Error(`Pollinations TTS failed: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type") || "audio/mpeg";
    if (!contentType.includes("audio")) {
      throw new Error(`Pollinations TTS returned non-audio content: ${contentType}`);
    }

    return {
      providerUsed: "pollinations",
      data: Buffer.from(await res.arrayBuffer()),
      extension: "mp3",
      contentType,
    } satisfies BinaryMedia;
  },
};
