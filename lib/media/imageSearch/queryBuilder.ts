import type { SearchImageInput } from "./types";

const TOPIC_HINTS: Record<string, string[]> = {
  jadid: ["jadid", "usul-i jadid", "new method school", "Turkestan"],
  behbudiy: ["Mahmudkhoja Behbudi", "Mahmudxoja Behbudiy", "Behbudi Jadid"],
  turkiston: ["Turkestan", "Russian Turkestan", "Central Asia"],
  matbuot: ["press", "newspaper", "gazeta", "Sadoi Turkiston"],
};

export function buildImageSearchQueries(input: SearchImageInput): string[] {
  const visualType = normalizeVisualType(input.visualType);
  const topic = normalize(input.topic);
  const title = normalize(input.sceneTitle);
  const description = normalize(input.sceneDescription);

  const queries = new Set<string>();
  const tokens = `${topic} ${title} ${description}`.toLowerCase();

  if (visualType === "portrait") {
    queries.add(`${transliterateHistoricalName(title)} portrait`);
    queries.add(`${transliterateHistoricalName(title)}`);
    queries.add(`${extractBestTopicAlias(tokens)} portrait`);
  } else if (visualType === "map") {
    queries.add(`${extractRegion(tokens)} historical map`);
    queries.add(`${extractRegion(tokens)} map 19th century`);
    queries.add(`${extractRegion(tokens)} map`);
  } else if (visualType === "newspaper") {
    queries.add(`${extractBestTopicAlias(tokens)} newspaper`);
    queries.add(`${extractBestTopicAlias(tokens)} press Turkestan`);
    queries.add(`${extractNewspaperAlias(tokens)} newspaper`);
  } else if (visualType === "school") {
    queries.add(`${extractBestTopicAlias(tokens)} school Turkestan`);
    queries.add(`new method school Turkestan`);
    queries.add(`usul-i jadid school`);
  } else {
    queries.add(`${transliterateHistoricalName(title)}`);
    queries.add(`${extractBestTopicAlias(tokens)} ${visualType}`);
    queries.add(`${extractBestTopicAlias(tokens)} historical`);
  }

  queries.add(`${transliterateHistoricalName(title)} ${extractBestTopicAlias(tokens)}`.trim());
  queries.add(`${transliterateHistoricalName(topic)} ${transliterateHistoricalName(title)}`.trim());

  return Array.from(queries)
    .map((query) => query.replace(/\s+/g, " ").trim())
    .filter((query) => query.length > 2)
    .slice(0, 5);
}

export function buildPrimaryImageQuery(input: SearchImageInput): string {
  return buildImageSearchQueries(input)[0] || transliterateHistoricalName(input.sceneTitle || input.topic);
}

function normalize(value: string) {
  return (value || "")
    .replace(/[’‘`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeVisualType(value: string) {
  const lower = value.toLowerCase();
  if (["map", "portrait", "newspaper", "school", "timeline", "quote", "infographic"].includes(lower)) {
    return lower;
  }
  return "general";
}

function transliterateHistoricalName(value: string) {
  return normalize(value)
    .replace(/xo['’]ja/gi, "khoja")
    .replace(/g['’]/gi, "gh")
    .replace(/o['’]/gi, "o")
    .replace(/sh/g, "sh")
    .replace(/ch/g, "ch");
}

function extractBestTopicAlias(tokens: string) {
  if (tokens.includes("jadid")) return "Jadid";
  if (tokens.includes("behbud")) return "Behbudi";
  if (tokens.includes("turkiston") || tokens.includes("turkestan")) return "Turkestan";
  if (tokens.includes("matbuot") || tokens.includes("newspaper")) return "Turkestan press";

  for (const [needle, values] of Object.entries(TOPIC_HINTS)) {
    if (tokens.includes(needle)) return values[0];
  }

  return tokens.split(/\s+/).slice(0, 4).join(" ");
}

function extractRegion(tokens: string) {
  if (tokens.includes("turkiston") || tokens.includes("turkestan")) return "Turkestan";
  if (tokens.includes("central asia")) return "Central Asia";
  return extractBestTopicAlias(tokens);
}

function extractNewspaperAlias(tokens: string) {
  if (tokens.includes("sadoi")) return "Sadoi Turkiston";
  if (tokens.includes("tarakkiy")) return "Taraqqiy";
  return "Jadid newspaper";
}
