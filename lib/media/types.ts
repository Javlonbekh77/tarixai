export type VoiceStyle = "teacher" | "narrator";

export type TtsProviderName = "aisha" | "azure" | "muxlisa" | "eidos" | "elevenlabs" | "pollinations" | "browser_fallback";
export type ImageProviderName =
  | "pollinations"
  | "gemini"
  | "huggingface"
  | "wikimedia"
  | "openverse"
  | "pexels"
  | "unsplash"
  | "placeholder";

// ── Existing sync TTS types (used by old providers) ──────────────────────────

export type TtsRequest = {
  sceneId: number;
  lessonId: string;
  text: string;
  voiceStyle?: VoiceStyle;
  language?: "uz-Latn" | string;
};

export type TtsResult = {
  success: true;
  providerUsed: TtsProviderName;
  audioUrl: string | null;
  mode: "server_audio" | "browser_fallback";
  text: string;
};

// ── Async TTS types (Muxlisa async flow) ─────────────────────────────────────

export type TtsJobStatus = "pending" | "processing" | "completed" | "failed";

export type TtsJob = {
  jobId: string;
  muxlisaTaskId?: string;
  lessonId: string;
  sceneId: number;
  textHash: string;
  text: string;
  status: TtsJobStatus;
  audioUrl?: string;
  providerUsed: "muxlisa";
  createdAt: string;
  updatedAt: string;
  rawCreateResponse?: unknown;
  rawWebhookResponse?: unknown;
  error?: string;
};

export type TtsCreateResult = {
  success: boolean;
  providerUsed: TtsProviderName;
  mode: "async_audio" | "server_audio" | "browser_fallback";
  jobId?: string;
  audioUrl?: string | null;
  status: TtsJobStatus | "fallback";
  finalText: string;
  warning?: string;
};

// ── Image types ───────────────────────────────────────────────────────────────

export type ImageRequest = {
  lessonId: string;
  sceneId: number;
  prompt: string;
  title: string;
  visualType: string;
  description?: string;
};

export type ImageResult = {
  success: true;
  providerUsed: ImageProviderName;
  imageUrl: string;
  prompt: string;
  selectedImage?: {
    id: string;
    provider: string;
    title: string;
    imageUrl: string;
    thumbnailUrl?: string;
    sourceUrl?: string;
    creator?: string;
    license?: string;
    licenseUrl?: string;
    attributionText?: string;
    width?: number;
    height?: number;
    score?: number;
    tags?: string[];
  };
  alternatives?: Array<{
    id: string;
    provider: string;
    title: string;
    imageUrl: string;
    thumbnailUrl?: string;
    sourceUrl?: string;
    creator?: string;
    license?: string;
    licenseUrl?: string;
    attributionText?: string;
    width?: number;
    height?: number;
    score?: number;
    tags?: string[];
  }>;
  warning?: string;
};

// ── Scene media types ─────────────────────────────────────────────────────────

export type SceneMediaRequest = {
  lessonId: string;
  scene: {
    sceneId: number;
    teacherSpeech: string;
    presentation: {
      title: string;
      imagePrompt: string;
      type: string;
      description?: string;
    };
  };
};

export type SceneMediaResult = {
  sceneId: number;
  audio: TtsCreateResult;
  image: ImageResult;
};

// ── Provider internals ────────────────────────────────────────────────────────

export type BinaryMedia = {
  providerUsed: Exclude<TtsProviderName, "browser_fallback"> | Exclude<ImageProviderName, "placeholder">;
  data: Buffer;
  extension: "mp3" | "wav" | "png" | "jpg" | "jpeg" | "webp";
  contentType: string;
};

export type TtsProvider = {
  name: Exclude<TtsProviderName, "browser_fallback">;
  isAvailable: () => boolean;
  synthesize: (request: TtsRequest) => Promise<BinaryMedia>;
};

export type ImageProvider = {
  name: Exclude<ImageProviderName, "placeholder">;
  isAvailable: () => boolean;
  generate: (request: ImageRequest, prompt: string) => Promise<BinaryMedia>;
};

// ── Global in-memory job store (server-side, Next.js) ────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __MUXLISA_TTS_JOBS: Map<string, TtsJob> | undefined;
  // eslint-disable-next-line no-var
  var __MUXLISA_UNMATCHED_WEBHOOKS: unknown[] | undefined;
}

export function getMuxlisaJobStore(): Map<string, TtsJob> {
  if (!globalThis.__MUXLISA_TTS_JOBS) {
    globalThis.__MUXLISA_TTS_JOBS = new Map();
  }
  return globalThis.__MUXLISA_TTS_JOBS;
}

export function getUnmatchedWebhooks(): unknown[] {
  if (!globalThis.__MUXLISA_UNMATCHED_WEBHOOKS) {
    globalThis.__MUXLISA_UNMATCHED_WEBHOOKS = [];
  }
  return globalThis.__MUXLISA_UNMATCHED_WEBHOOKS;
}
