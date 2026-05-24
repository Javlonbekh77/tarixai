import { BinaryMedia, ImageProvider } from "../types";

export const huggingfaceImageProvider: ImageProvider = {
  name: "huggingface",
  isAvailable: () => Boolean(process.env.HF_TOKEN),
  generate: async (_request, prompt) => {
    const token = process.env.HF_TOKEN;
    const model = process.env.HF_IMAGE_MODEL || "black-forest-labs/FLUX.1-schnell";
    if (!token) throw new Error("Hugging Face image is not configured");

    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "image/png",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: 1280,
          height: 720,
          num_inference_steps: 4,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Hugging Face image failed: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type") || "image/png";
    if (!contentType.includes("image")) {
      throw new Error(`Hugging Face returned non-image content: ${contentType}`);
    }

    return {
      providerUsed: "huggingface",
      data: Buffer.from(await res.arrayBuffer()),
      extension: contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "png",
      contentType,
    } satisfies BinaryMedia;
  },
};
