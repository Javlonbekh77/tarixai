/**
 * app/api/media/tts/status/[jobId]/route.ts
 * Polling endpoint — frontend calls this every 2s to check if audio is ready.
 */

import { NextResponse } from "next/server";
import { getMuxlisaJobStore } from "@/lib/media/types";

export async function GET(
  _request: Request,
  { params }: { params: { jobId: string } },
) {
  const { jobId } = params;

  if (!jobId) {
    return NextResponse.json({ success: false, error: "jobId is required" }, { status: 400 });
  }

  const store = getMuxlisaJobStore();
  const job = store.get(jobId);

  if (!job) {
    return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    jobId: job.jobId,
    status: job.status,
    audioUrl: job.audioUrl ?? null,
    providerUsed: job.providerUsed,
    error: job.error ?? null,
  });
}
