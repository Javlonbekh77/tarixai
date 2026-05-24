import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const PUBLIC_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "public");
const GENERATED_DIR = path.join(PUBLIC_DIR, "generated");
const AUDIO_DIR = resolveGeneratedDir(process.env.MEDIA_AUDIO_DIR, path.join(GENERATED_DIR, "audio"));
const IMAGE_DIR = path.join(GENERATED_DIR, "images");

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export function audioCacheKey(params: {
  lessonId: string;
  sceneId: number;
  text: string;
  provider: string;
  voice: string;
}) {
  return hashValue([
    params.lessonId,
    params.sceneId,
    params.provider,
    params.voice,
    params.text,
  ].join("|"));
}

export function imageCacheKey(params: {
  lessonId: string;
  sceneId: number;
  prompt: string;
  width: number;
  height: number;
}) {
  return hashValue([
    params.lessonId,
    params.sceneId,
    params.width,
    params.height,
    params.prompt,
  ].join("|"));
}

export async function ensureGeneratedDirs() {
  await Promise.all([
    mkdir(AUDIO_DIR, { recursive: true }),
    mkdir(IMAGE_DIR, { recursive: true }),
  ]);
}

export async function readGeneratedFile(kind: "audio" | "images", filename: string) {
  try {
    const filePath = path.join(resolveKindDir(kind), filename);
    await readFile(filePath);
    return toPublicUrl(filePath);
  } catch {
    return null;
  }
}

export async function writeGeneratedFile(kind: "audio" | "images", filename: string, data: Buffer | string) {
  await ensureGeneratedDirs();
  const filePath = path.join(resolveKindDir(kind), filename);
  await writeFile(filePath, data);
  return toPublicUrl(filePath);
}

export async function readGeneratedJson<T>(kind: "audio" | "images", filename: string): Promise<T | null> {
  try {
    const filePath = path.join(resolveKindDir(kind), filename);
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function resolveKindDir(kind: "audio" | "images") {
  return kind === "audio" ? AUDIO_DIR : IMAGE_DIR;
}

function resolveGeneratedDir(rawValue: string | undefined, fallback: string) {
  if (!rawValue) return fallback;
  return path.isAbsolute(rawValue) ? rawValue : path.join(/*turbopackIgnore: true*/ process.cwd(), rawValue);
}

function toPublicUrl(filePath: string) {
  const relative = path.relative(PUBLIC_DIR, filePath).split(path.sep).join("/");
  return `/${relative}`;
}
