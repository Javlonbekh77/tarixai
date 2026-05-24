import { setTimeout as delay } from "timers/promises";
import { getCachedImageSearch, setCachedImageSearch } from "./cache";
import { buildImageSearchQueries, buildPrimaryImageQuery } from "./queryBuilder";
import { openverseProvider } from "./providers/openverse";
import { pexelsProvider } from "./providers/pexels";
import { createPlaceholderImageResult } from "./providers/placeholder";
import { unsplashProvider } from "./providers/unsplash";
import { wikimediaProvider } from "./providers/wikimedia";
import { getPresetImageSearch } from "./presetImages";
import { rankImages } from "./ranking";
import type { ImageSearchProvider, ImageSearchResult, SearchImageInput, SearchImageOutput } from "./types";

const providers: ImageSearchProvider[] = [
  wikimediaProvider,
  openverseProvider,
  pexelsProvider,
  unsplashProvider,
];

export async function searchBestSceneImage(input: SearchImageInput): Promise<SearchImageOutput> {
  const preset = getPresetImageSearch(input);
  if (preset) return preset;

  const cached = await getCachedImageSearch(input);
  if (cached) return cached;

  const queries = buildImageSearchQueries(input);
  const collected: ImageSearchResult[] = [];
  const warnings: string[] = [];

  for (const provider of providers) {
    if (!provider.isAvailable()) continue;
    if (shouldSkipProvider(provider.name, input, collected)) continue;

    for (const query of queries) {
      try {
        const results = await provider.search(query, input);
        collected.push(...results);
        if (provider.name === "wikimedia" && hasStrongHistoricalResult(collected, input)) {
          break;
        }
      } catch (error) {
        warnings.push(`${provider.name}: ${String(error)}`);
      }
    }
  }

  const ranked = dedupeResults(rankImages(collected, input));
  const selected = ranked[0] ?? (await createPlaceholderImageResult(input));
  const alternatives = ranked.slice(1, 6);

  const output: SearchImageOutput = {
    success: true,
    providerUsed: selected.provider,
    query: buildPrimaryImageQuery(input),
    selectedImage: selected,
    alternatives,
    warning: warnings.length ? warnings.join(" | ") : undefined,
  };

  await setCachedImageSearch(input, output);
  return output;
}

export async function searchSceneImagesSequentially(params: {
  lessonId: string;
  topic: string;
  scenes: Array<{
    sceneId: number;
    presentation: {
      title: string;
      type: string;
      description?: string;
      imagePrompt?: string;
    };
  }>;
}) {
  const results: Array<{
    sceneId: number;
    selectedImage: ImageSearchResult;
    alternatives: ImageSearchResult[];
    providerUsed: string;
    query: string;
    warning?: string;
  }> = [];

  for (const scene of params.scenes) {
    const search = await searchBestSceneImage({
      lessonId: params.lessonId,
      sceneId: scene.sceneId,
      topic: params.topic,
      sceneTitle: scene.presentation.title,
      sceneDescription: scene.presentation.description || scene.presentation.imagePrompt || params.topic,
      visualType: normalizeVisualType(scene.presentation.type),
      preferredLanguage: "en",
    });

    results.push({
      sceneId: scene.sceneId,
      selectedImage: search.selectedImage,
      alternatives: search.alternatives,
      providerUsed: search.providerUsed,
      query: search.query,
      warning: search.warning,
    });
    await delay(250);
  }

  return {
    success: true,
    results,
  };
}

function dedupeResults(results: ImageSearchResult[]) {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = result.imageUrl || `${result.provider}:${result.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function shouldSkipProvider(
  provider: ImageSearchProvider["name"],
  input: SearchImageInput,
  existing: ImageSearchResult[],
) {
  const historicalSpecific = ["portrait", "map", "newspaper", "timeline"].includes(input.visualType);
  if (!historicalSpecific) return false;
  if ((provider === "pexels" || provider === "unsplash") && hasStrongHistoricalResult(existing, input)) {
    return true;
  }
  return false;
}

function hasStrongHistoricalResult(results: ImageSearchResult[], input: SearchImageInput) {
  return results.some(
    (result) =>
      (result.score ?? 0) >= 45 ||
      (result.provider === "wikimedia" &&
        `${result.title} ${result.sourceUrl || ""}`.toLowerCase().includes(input.sceneTitle.toLowerCase())),
  );
}

function normalizeVisualType(value: string): SearchImageInput["visualType"] {
  const lower = value.toLowerCase();
  if (lower === "portrait-cards") return "portrait";
  if (lower === "video-placeholder" || lower === "comparison") return "general";
  if (
    lower === "map" ||
    lower === "portrait" ||
    lower === "newspaper" ||
    lower === "school" ||
    lower === "timeline" ||
    lower === "quote" ||
    lower === "infographic"
  ) {
    return lower;
  }
  return "general";
}
