# Tarixchi AI

Tarixchi AI is an interactive Uzbek history lesson app built with Next.js App Router. It creates lesson scenes, shows presentation visuals, searches for real/openly licensed images, and plays Uzbek lesson audio.

## Features

- Interactive lesson page for Uzbek history topics
- Jadidchilik harakati preset lesson with scene-by-scene narration
- Internet image search via official APIs:
  - Wikimedia Commons
  - Openverse
  - Pexels, if configured
  - Unsplash, if configured
  - placeholder fallback
- Image attribution and alternative image selection
- Uzbek TTS flow with provider fallback:
  - preset Jadidchilik Aisha audio files
  - Muxlisa async TTS
  - Aisha AI TTS
  - Eidos / ElevenLabs fallback
  - browser speech fallback
- Local/generated media cache under `public/generated`

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- API routes
- In-memory and file-based media cache

## Getting Started

Install dependencies:

```bash
npm install
```

Create local environment config:

```bash
cp .env.example .env.local
```

Run the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/darsliklar/jadidchilik-harakati
```

Build:

```bash
npm run build
```

## Environment Variables

The app can run without most API keys because it has local fallbacks. Add keys only for the providers you want to use.

Important variables:

```env
GEMINI_API_KEY=
GROQ_API_KEY=
OPENROUTER_API_KEY=

MUXLISA_API_KEY=
MUXLISA_TTS_ENDPOINT=https://service.muxlisa.uz/api/v1/async/tts

AISHA_API_KEY=
AISHA_TTS_MODEL=Gulnoza
AISHA_TTS_MOOD=Neutral
AISHA_TTS_SPEED=1.0

OPENVERSE_CLIENT_ID=
OPENVERSE_CLIENT_SECRET=
PEXELS_API_KEY=
UNSPLASH_ACCESS_KEY=
```

Never commit `.env.local`.

## Jadidchilik Audio Templates

Jadidchilik scene audio files are pre-generated with Aisha AI and stored at:

```text
public/generated/audio/jadidchilik-harakati/
```

The lesson API returns these files first for `lessonId=jadidchilik-harakati`, so the audio starts without waiting for a remote TTS request.

To regenerate them:

```bash
AISHA_API_KEY=your_key node scripts/generate-jadid-aisha-audio.mjs
```

On PowerShell:

```powershell
$env:AISHA_API_KEY="your_key"; node scripts\generate-jadid-aisha-audio.mjs
```

## Image Search

The media image API searches official/open APIs only. It does not scrape Google Images or random websites.

Endpoints:

```text
POST /api/media/search-image
POST /api/media/search-scene-images
POST /api/media/image
```

For MVP, source and license metadata are shown in the lesson UI. For production, verify licenses before publishing.

## Windows / OneDrive Note

Next.js cache files can be locked by OneDrive on Windows. This project uses:

```js
distDir: ".next-local"
```

If dev cache still gets stuck, stop Node processes and delete `.next-local`, then run `npm run dev` again.
