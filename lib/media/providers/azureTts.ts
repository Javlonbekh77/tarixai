import { sanitizeTtsText } from "../prompts";
import { BinaryMedia, TtsProvider } from "../types";

export const azureTtsProvider: TtsProvider = {
  name: "azure",
  isAvailable: () => isConfigured(process.env.AZURE_SPEECH_KEY) && isConfigured(process.env.AZURE_SPEECH_REGION),
  synthesize: async ({ text }) => {
    const region = process.env.AZURE_SPEECH_REGION;
    const key = process.env.AZURE_SPEECH_KEY;
    const voice = process.env.AZURE_SPEECH_VOICE || "uz-UZ-SardorNeural";

    if (!region || !key) throw new Error("Azure Speech is not configured");

    const ssml = [
      `<speak version="1.0" xml:lang="uz-UZ">`,
      `<voice xml:lang="uz-UZ" name="${escapeXml(voice)}">`,
      `<prosody rate="-8%" pitch="+0%">${escapeXml(sanitizeTtsText(text))}</prosody>`,
      `</voice>`,
      `</speak>`,
    ].join("");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let res: Response;
    try {
      res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
          "User-Agent": "TarixchiAI",
        },
        body: ssml,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      throw new Error(`Azure TTS failed: ${res.status} ${res.statusText}`);
    }

    return {
      providerUsed: "azure",
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

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
