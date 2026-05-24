import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { SearchImageInput, SearchImageOutput } from "./types";

const memoryCache = new Map<string, { expiresAt: number; value: SearchImageOutput }>();
const CACHE_DIR = path.join(process.cwd(), "public", "generated", "image-search");

export async function getCachedImageSearch(input: SearchImageInput): Promise<SearchImageOutput | null> {
  const key = buildCacheKey(input);
  const now = Date.now();
  const fromMemory = memoryCache.get(key);
  if (fromMemory && fromMemory.expiresAt > now) return fromMemory.value;

  try {
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as { expiresAt: number; value: SearchImageOutput };
    if (parsed.expiresAt > now) {
      memoryCache.set(key, parsed);
      return parsed.value;
    }
  } catch {
    return null;
  }

  return null;
}

export async function setCachedImageSearch(input: SearchImageInput, value: SearchImageOutput) {
  const key = buildCacheKey(input);
  const record = {
    expiresAt: Date.now() + getTtlHours() * 60 * 60 * 1000,
    value,
  };
  memoryCache.set(key, record);
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(path.join(CACHE_DIR, `${key}.json`), JSON.stringify(record, null, 2), "utf8");
}

function buildCacheKey(input: SearchImageInput) {
  return createHash("sha256")
    .update(
      [
        input.lessonId,
        input.sceneId,
        input.topic,
        input.sceneTitle,
        input.sceneDescription,
        input.visualType,
      ].join("|"),
    )
    .digest("hex")
    .slice(0, 32);
}

function getTtlHours() {
  const value = Number(process.env.IMAGE_SEARCH_CACHE_TTL_HOURS || 168);
  return Number.isFinite(value) && value > 0 ? value : 168;
}
