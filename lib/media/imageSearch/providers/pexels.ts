import type { ImageSearchProvider, ImageSearchResult } from "../types";

type PexelsResponse = {
  photos?: Array<{
    id: number;
    width?: number;
    height?: number;
    alt?: string;
    url?: string;
    photographer?: string;
    photographer_url?: string;
    src?: {
      large?: string;
      large2x?: string;
      medium?: string;
    };
  }>;
};

export const pexelsProvider: ImageSearchProvider = {
  name: "pexels",
  isAvailable: () => Boolean(process.env.PEXELS_API_KEY),
  async search(query: string) {
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "10");
    url.searchParams.set("orientation", "landscape");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: process.env.PEXELS_API_KEY || "",
      },
      cache: "no-store",
    });
    if (!response.ok) return [];

    const data = (await response.json()) as PexelsResponse;
    return (data.photos || [])
      .filter((item) => Boolean(item.src?.large || item.src?.large2x))
      .map(
        (item): ImageSearchResult => ({
          id: `pexels:${item.id}`,
          provider: "pexels",
          title: item.alt || "Pexels image",
          imageUrl: item.src?.large2x || item.src?.large || item.src?.medium || "",
          thumbnailUrl: item.src?.medium || item.src?.large || undefined,
          sourceUrl: item.url || item.photographer_url || undefined,
          creator: item.photographer || undefined,
          attributionText: item.photographer ? `Photo by ${item.photographer} on Pexels` : undefined,
          width: item.width,
          height: item.height,
          tags: item.alt ? item.alt.split(/\s+/) : [],
        }),
      );
  },
};
