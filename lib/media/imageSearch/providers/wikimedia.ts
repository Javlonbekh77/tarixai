import type { ImageSearchProvider, ImageSearchResult, SearchImageInput } from "../types";

type WikimediaQueryResponse = {
  query?: {
    pages?: Record<
      string,
      {
        title?: string;
        fullurl?: string;
        imageinfo?: Array<{
          url?: string;
          thumburl?: string;
          width?: number;
          height?: number;
          descriptionurl?: string;
          extmetadata?: Record<string, { value?: string }>;
        }>;
      }
    >;
  };
};

export const wikimediaProvider: ImageSearchProvider = {
  name: "wikimedia",
  isAvailable: () => true,
  async search(query: string, input: SearchImageInput) {
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    url.searchParams.set("action", "query");
    url.searchParams.set("format", "json");
    url.searchParams.set("generator", "search");
    url.searchParams.set("gsrnamespace", "6");
    url.searchParams.set("gsrlimit", "10");
    url.searchParams.set("gsrsearch", query);
    url.searchParams.set("prop", "imageinfo|info");
    url.searchParams.set("iiprop", "url|size|extmetadata");
    url.searchParams.set("iiurlwidth", "640");
    url.searchParams.set("inprop", "url");
    url.searchParams.set("origin", "*");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "TarixchiAI/1.0 (educational image search)",
      },
      cache: "no-store",
    });
    if (!response.ok) return [];

    const data = (await response.json()) as WikimediaQueryResponse;
    const pages = Object.values(data.query?.pages || {});

    return pages
      .map((page): ImageSearchResult | null => {
        const info = page.imageinfo?.[0];
        if (!info?.url) return null;
        if ((info.width || 0) < 280) return null;

        const title = stripFilePrefix(page.title || "Wikimedia image");
        if (looksLikeLogo(title) && input.visualType !== "infographic" && input.visualType !== "map") {
          return null;
        }

        const license = info.extmetadata?.LicenseShortName?.value || info.extmetadata?.License?.value;
        const licenseUrl = info.extmetadata?.LicenseUrl?.value;
        const creator = stripHtml(info.extmetadata?.Artist?.value || "");
        const attribution = stripHtml(info.extmetadata?.Attribution?.value || "");

        return {
          id: `wikimedia:${page.title || info.url}`,
          provider: "wikimedia",
          title,
          imageUrl: info.url,
          thumbnailUrl: info.thumburl,
          sourceUrl: info.descriptionurl || page.fullurl,
          creator: creator || undefined,
          license: license || undefined,
          licenseUrl: licenseUrl || undefined,
          attributionText: attribution || undefined,
          width: info.width,
          height: info.height,
          tags: [title, input.topic, input.visualType],
        };
      })
      .filter(Boolean) as ImageSearchResult[];
  },
};

function stripFilePrefix(value: string) {
  return value.replace(/^File:/i, "").replace(/_/g, " ").trim();
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function looksLikeLogo(value: string) {
  return /logo|flag map icon|coat of arms|symbol/i.test(value);
}
