import { TtsRequest, TtsResult } from "../types";

export function browserFallbackTts(request: TtsRequest): TtsResult {
  return {
    success: true,
    providerUsed: "browser_fallback",
    audioUrl: null,
    mode: "browser_fallback",
    text: request.text,
  };
}
