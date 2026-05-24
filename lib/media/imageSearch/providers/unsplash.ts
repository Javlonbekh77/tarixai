import type { ImageSearchProvider, ImageSearchResult } from "../types";

type UnsplashResponse = {
  results?: Array<{
    id: string;
    width?: number;
    height?: number;
    alt_description?: string;
    description?: string;
    urls?: {
      regular?: string;
      small?: string;
    };
    user?: {
      name?: string;
      links?: {
        html?: string;
      };
    };
    links?: {
      html?: string;
    };
  }>;
};

export const unsplashProvider: ImageSearchProvider = {
  name: "unsplash",
  isAvailable: () => Boolean(process.env.UNSPLASH_ACCESS_KEY),
  async search(query: string) {
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "10");
    url.searchParams.set("orientation", "landscape");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY || ""}`,
      },
      cache: "no-store",
    });
    if (!response.ok) return [];

    const data = (await response.json()) as UnsplashResponse;
    return (data.results || [])
      .filter((item) => Boolean(item.urls?.regular))
      .map(
        (item): ImageSearchResult => ({
          id: `unsplash:${item.id}`,
          provider: "unsplash",
          title: item.alt_description || item.description || "Unsplash image",
          imageUrl: item.urls?.regular || "",
          thumbnailUrl: item.urls?.small || undefined,
          sourceUrl: item.links?.html || item.user?.links?.html || undefined,
          creator: item.user?.name || undefined,
          attributionText: item.user?.name ? `Photo by ${item.user.name} on Unsplash` : undefined,
          width: item.width,
          height: item.height,
          tags: [item.alt_description || "", item.description || ""].filter(Boolean),
        }),
      );
  },
};
