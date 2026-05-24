import type { ImageSearchResult, SearchImageInput } from "./types";

export function rankImages(results: ImageSearchResult[], input: SearchImageInput) {
  return results
    .map((result) => ({ ...result, score: scoreImage(result, input) }))
    .sort((left, right) => (right.score ?? 0) - (left.score ?? 0));
}

function scoreImage(result: ImageSearchResult, input: SearchImageInput) {
  let score = 0;
  const haystack = `${result.title} ${result.sourceUrl || ""} ${(result.tags || []).join(" ")}`.toLowerCase();
  const titleNeedle = input.sceneTitle.toLowerCase();
  const topicNeedle = input.topic.toLowerCase();
  const visualType = input.visualType.toLowerCase();
  const isHistoricalSpecific = ["portrait", "map", "newspaper", "timeline"].includes(visualType);

  if (haystack.includes(titleNeedle) || haystack.includes(topicNeedle)) score += 30;
  if (result.provider === "wikimedia" && isHistoricalSpecific) score += 20;
  if (result.provider === "openverse" && result.license) score += 15;

  const width = result.width || 0;
  const height = result.height || 0;
  if (width >= 800) score += 10;
  if (width > 0 && height > 0 && width / Math.max(height, 1) >= 1.15) score += 10;
  if (visualTypeMatches(result, visualType)) score += 10;

  if (!result.imageUrl) score -= 50;
  if (looksLikeLogo(haystack) && visualType !== "infographic") score -= 30;
  if (looksIrrelevant(haystack, input)) score -= 20;
  if (visualType === "map" && looksPortrait(haystack)) score -= 15;
  if (visualType === "portrait" && isGenericStockProvider(result.provider) && !haystack.includes(titleNeedle)) score -= 15;

  return score;
}

function visualTypeMatches(result: ImageSearchResult, visualType: string) {
  const tags = `${result.title} ${(result.tags || []).join(" ")}`.toLowerCase();
  if (visualType === "map") return /map|xarita|atlas|cartography/.test(tags);
  if (visualType === "portrait") return /portrait|photo|person|statesman|writer/.test(tags);
  if (visualType === "newspaper") return /newspaper|press|gazeta|journal|matbuot/.test(tags);
  if (visualType === "school") return /school|classroom|education|maktab/.test(tags);
  return true;
}

function looksLikeLogo(haystack: string) {
  return /logo|icon|emblem|symbol|vector/.test(haystack);
}

function looksPortrait(haystack: string) {
  return /portrait|person|man|woman|photograph/.test(haystack);
}

function looksIrrelevant(haystack: string, input: SearchImageInput) {
  if (input.visualType === "general") return false;
  if (input.visualType === "portrait") return !containsOneOf(haystack, [input.sceneTitle, input.topic]);
  if (input.visualType === "map") return !/map|xarita|turkestan|central asia/.test(haystack);
  if (input.visualType === "newspaper") return !/newspaper|gazeta|press|matbuot/.test(haystack);
  return false;
}

function containsOneOf(haystack: string, values: string[]) {
  return values.some((value) => haystack.includes(value.toLowerCase()));
}

function isGenericStockProvider(provider: ImageSearchResult["provider"]) {
  return provider === "pexels" || provider === "unsplash";
}
