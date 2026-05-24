import { NextResponse } from "next/server";
import { searchBestSceneImage } from "@/lib/media/imageSearch/imageSearchRouter";
import type { SearchImageInput } from "@/lib/media/imageSearch/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input: SearchImageInput = {
      lessonId: String(body.lessonId ?? "lesson"),
      sceneId: Number(body.sceneId ?? 0),
      topic: String(body.topic ?? ""),
      sceneTitle: String(body.sceneTitle ?? ""),
      sceneDescription: String(body.sceneDescription ?? ""),
      visualType: normalizeVisualType(String(body.visualType ?? "general")),
      preferredLanguage: body.preferredLanguage === "ru" || body.preferredLanguage === "uz" ? body.preferredLanguage : "en",
    };

    const result = await searchBestSceneImage(input);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
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
