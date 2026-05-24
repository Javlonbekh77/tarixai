import { NextResponse } from "next/server";
import { searchBestSceneImage } from "@/lib/media/imageSearch/imageSearchRouter";
import type { SearchImageInput } from "@/lib/media/imageSearch/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input: SearchImageInput = {
      lessonId: String(body.lessonId ?? "lesson"),
      sceneId: Number(body.sceneId ?? 0),
      topic: String(body.topic ?? body.title ?? "Tarix darsi"),
      sceneTitle: String(body.title ?? body.sceneTitle ?? "Tarix darsi"),
      sceneDescription: String(body.description ?? body.prompt ?? body.sceneDescription ?? ""),
      visualType: normalizeVisualType(String(body.visualType ?? "general")),
      preferredLanguage: "en",
    };

    const result = await searchBestSceneImage(input);
    return NextResponse.json({
      success: true,
      providerUsed: result.providerUsed,
      imageUrl: result.selectedImage.imageUrl,
      prompt: result.query,
      selectedImage: result.selectedImage,
      alternatives: result.alternatives,
      warning: result.warning,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        providerUsed: "placeholder",
        imageUrl: "",
        prompt: "",
        selectedImage: null,
        alternatives: [],
        warning: String(error),
      },
      { status: 500 },
    );
  }
}

function normalizeVisualType(value: string): SearchImageInput["visualType"] {
  if (value === "portrait-cards") return "portrait";
  if (value === "video-placeholder" || value === "comparison" || value === "presentation") return "general";
  if (
    value === "map" ||
    value === "portrait" ||
    value === "newspaper" ||
    value === "school" ||
    value === "timeline" ||
    value === "quote" ||
    value === "infographic"
  ) {
    return value;
  }
  return "general";
}
