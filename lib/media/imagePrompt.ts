/**
 * lib/media/imagePrompt.ts
 * Builds rich historical image prompts and creates SVG placeholders.
 */

import type { ImageRequest } from "./types";

export function buildHistoricalImagePrompt(input: ImageRequest): string {
  return [
    "Educational historical illustration for Uzbek school history lesson.",
    `Topic/scene: ${input.title}`,
    `Visual type: ${input.visualType}`,
    `Description: ${input.description || input.prompt}`,
    "Style: clean modern presentation slide, historical illustration, school-friendly, soft lighting, vibrant colors, rich details, 16:9 composition.",
    "Quality: masterpiece, highly detailed, 8k resolution, premium concept art, cinematic lighting, professional illustration.",
    "If historical people appear, use respectful illustrated portrait style, not photorealistic fake photos.",
    "Use Central Asian historical atmosphere when relevant.",
    "Negative: no gore, no violence, no propaganda, no modern logos, no watermark, no readable random text, no distorted faces.",
  ].join("\n");
}

export function createPlaceholderSvg(title: string, visualType: string, prompt: string): string {
  const safeTitle = escapeXml((title || "AI visual").slice(0, 60));
  const safeType = escapeXml((visualType || "presentation").slice(0, 40));
  const safeDesc = escapeXml((prompt || "").slice(0, 180));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f1a2e"/>
      <stop offset="48%" stop-color="#1a2744"/>
      <stop offset="100%" stop-color="#0c1520"/>
    </linearGradient>
    <radialGradient id="glow1" cx="25%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="80%" cy="75%" r="55%">
      <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect width="1280" height="720" fill="url(#glow1)"/>
  <rect width="1280" height="720" fill="url(#glow2)"/>
  <!-- Decorative circles -->
  <circle cx="640" cy="360" r="280" fill="none" stroke="#7c3aed" stroke-width="1" opacity="0.15"/>
  <circle cx="640" cy="360" r="220" fill="none" stroke="#0ea5e9" stroke-width="1" opacity="0.10"/>
  <!-- Icon area -->
  <rect x="540" y="220" width="200" height="140" rx="24" fill="#1e2d4e" stroke="#7c3aed" stroke-width="2" opacity="0.8"/>
  <text x="640" y="304" font-family="Arial, sans-serif" font-size="56" text-anchor="middle" fill="#7c3aed" opacity="0.9">📜</text>
  <!-- Title -->
  <text x="640" y="410" font-family="Arial, sans-serif" font-size="42" font-weight="800" text-anchor="middle" fill="#ffffff">${safeTitle}</text>
  <!-- Visual type badge -->
  <rect x="540" y="430" width="200" height="32" rx="16" fill="#7c3aed" opacity="0.6"/>
  <text x="640" y="451" font-family="Arial, sans-serif" font-size="16" font-weight="700" text-anchor="middle" fill="#e9d5ff">${safeType}</text>
  <!-- Description -->
  <foreignObject x="200" y="480" width="880" height="100">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 20px; line-height: 1.4; color: #94a3b8; text-align: center; font-weight: 500;">${safeDesc}</div>
  </foreignObject>
  <!-- Watermark -->
  <text x="640" y="690" font-family="Arial, sans-serif" font-size="14" font-weight="600" text-anchor="middle" fill="#475569" opacity="0.6">AI visual placeholder · Tarixchi AI</text>
</svg>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
