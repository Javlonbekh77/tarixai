import type { ImageSearchProvider, ImageSearchResult } from "../types";

type OpenverseResponse = {
  results?: Array<{
    id: string;
    title?: string;
    url?: string;
    thumbnail?: string;
    creator?: string;
    license?: string;
    license_url?: string;
    foreign_landing_url?: string;
    width?: number;
    height?: number;
    tags?: Array<{ name?: string }>;
    attribution?: string;
  }>;
};

export const openverseProvider: ImageSearchProvider = {
  name: "openverse",
  isAvailable: () => true,
  async search(query: string) {
    const url = new URL("https://api.openverse.org/v1/images");
    url.searchParams.set("q", query);
    url.searchParams.set("page_size", "10");
    url.searchParams.set("mature", "false");

    const response = await fetch(url.toString(), {
      headers: buildOpenverseHeaders(),
      cache: "no-store",
    });
    if (!response.ok) return [];

    const data = (await response.json()) as OpenverseResponse;
    return (data.results || [])
      .filter((item) => Boolean(item.url))
      .map(
        (item): ImageSearchResult => ({
          id: `openverse:${item.id}`,
          provider: "openverse",
          title: item.title || "Openverse image",
          imageUrl: item.url!,
          thumbnailUrl: item.thumbnail || undefined,
          sourceUrl: item.foreign_landing_url || undefined,
          creator: item.creator || undefined,
          license: item.license || undefined,
          licenseUrl: item.license_url || undefined,
          attributionText: item.attribution || undefined,
          width: item.width,
          height: item.height,
          tags: (item.tags || []).map((tag) => tag.name || "").filter(Boolean),
        }),
      );
  },
};

function buildOpenverseHeaders(): HeadersInit {
  const clientId = process.env.OPENVERSE_CLIENT_ID;

  if (!clientId) {
    return {};
  }

  return {
    "X-Api-Key": clientId,
  };
}
