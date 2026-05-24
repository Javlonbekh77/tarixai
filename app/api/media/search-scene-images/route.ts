import { NextResponse } from "next/server";
import { searchSceneImagesSequentially } from "@/lib/media/imageSearch/imageSearchRouter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lessonId = String(body.lessonId ?? "lesson");
    const topic = String(body.topic ?? "");
    const scenes: Array<Record<string, unknown>> = Array.isArray(body.scenes) ? body.scenes : [];

    const result = await searchSceneImagesSequentially({
      lessonId,
      topic,
      scenes: scenes.map((scene) => {
        const presentation = (scene.presentation || {}) as Record<string, unknown>;
        return {
          sceneId: Number(scene.sceneId ?? 0),
          presentation: {
            title: String(presentation.title ?? ""),
            type: String(presentation.type ?? "general"),
            description: presentation.description ? String(presentation.description) : undefined,
            imagePrompt: presentation.imagePrompt ? String(presentation.imagePrompt) : undefined,
          },
        };
      }),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        results: [],
      },
      { status: 500 },
    );
  }
}
