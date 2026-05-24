import { BinaryMedia, ImageProvider } from "../types";

export const pollinationsImageProvider: ImageProvider = {
  name: "pollinations",
  isAvailable: () => process.env.POLLINATIONS_IMAGE_ENABLED !== "false",
  generate: async (_request, prompt) => {
    const params = new URLSearchParams({
      width: "1280",
      height: "720",
      model: process.env.POLLINATIONS_IMAGE_MODEL || "flux",
      nologo: "true",
      enhance: "true",
    });
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let res: Response;
    try {
      res = await fetch(url, {
        headers: process.env.POLLINATIONS_API_KEY
          ? { Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY}` }
          : undefined,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      throw new Error(`Pollinations image failed: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type") || "image/png";
    if (!contentType.includes("image")) {
      throw new Error(`Pollinations image returned non-image content: ${contentType}`);
    }

    return {
      providerUsed: "pollinations",
      data: Buffer.from(await res.arrayBuffer()),
      extension: contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "png",
      contentType,
    } satisfies BinaryMedia;
  },
};
