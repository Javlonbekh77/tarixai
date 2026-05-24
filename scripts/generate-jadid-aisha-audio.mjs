import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = "https://back.aisha.group";
const OUT_DIR = path.join(process.cwd(), "public", "generated", "audio", "jadidchilik-harakati");

const scenes = [
  {
    sceneId: 1,
    text:
      "Diqqat qiling. Turkiston o'n to'qqizinchi asr oxirida katta chorrahada turibdi. Bir tomonda eski tartiblar, ikkinchi tomonda fan, matbuot va yangi maktablar bor. Jadidchilik mana shu vaziyatda tug'ildi. Jadidlar xalqni uyg'otish uchun avval fikrni o'zgartirish kerakligini tushundi. Ular uchun eng kuchli qurol savod, kitob va maktab edi.",
  },
  {
    sceneId: 2,
    text:
      "Endi yangi usul maktabini tasavvur qiling. Eski ta'limda bola ko'pincha matnni yodlar edi. Jadidlar esa savol beradigan, hisob-kitob qiladigan, xarita ko'radigan va gazeta o'qiydigan avlodni xohladi. Yangi usul maktablari faqat dars joyi emas, kelajakni boshqacha tasavvur qilish mashqi edi.",
  },
  {
    sceneId: 3,
    text:
      "Bu hikoyada Mahmud xo'ja Beh bu diy alohida o'rin tutadi. U muallim, dramaturg, publitsist va jamoat arbobi edi. Beh bu diy maktab, darslik, teatr va matbuotni bir zanjir deb ko'rdi. Uning maqsadi odamlarni o'z hayoti haqida o'ylashga undash edi.",
  },
  {
    sceneId: 4,
    text:
      "Matbuot jadidlar uchun ovoz edi. Gazeta chiqqanda, fikr bir xonadan chiqib butun shaharga tarqaladi. Jadidlar gazeta orqali xalqni savodga, islohotga va hushyorlikka chaqirdi. Ular odamlarni majburlashga emas, ishontirishga urindi.",
  },
  {
    sceneId: 5,
    text:
      "Jadidchilik oson yo'l emas edi. Eski tartibdan foyda ko'rganlar yangi fikrdan qo'rqdi. Mustamlaka hokimiyati ham uyg'ongan xalqni xavf deb bildi. Lekin jadidlarning eng katta merosi shunda: ular xalq o'zgarishi mumkin, degan ishonchni uyg'otdi. Tarixda o'zgarish avval inson fikrida boshlanadi.",
  },
];

const apiKey = process.env.AISHA_API_KEY;
if (!apiKey) {
  console.error("AISHA_API_KEY is required.");
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });

for (const scene of scenes) {
  const audio = await generateAudio(scene.text);
  const contentType = audio.headers.get("content-type") || "";
  const extension = contentType.includes("mpeg") ? "mp3" : "wav";
  const filePath = path.join(OUT_DIR, `scene-${scene.sceneId}.${extension}`);
  await writeFile(filePath, Buffer.from(await audio.arrayBuffer()));
  await writeFile(
    path.join(OUT_DIR, `scene-${scene.sceneId}.json`),
    JSON.stringify(
      {
        sceneId: scene.sceneId,
        provider: "aisha",
        model: process.env.AISHA_TTS_MODEL || "Gulnoza",
        mood: process.env.AISHA_TTS_MOOD || "Neutral",
        speed: process.env.AISHA_TTS_SPEED || "1.0",
        textHash: createHash("sha256").update(scene.text).digest("hex").slice(0, 16),
        audioFile: `scene-${scene.sceneId}.${extension}`,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
  console.log(`scene-${scene.sceneId}.${extension}`);
}

async function generateAudio(text) {
  const form = new FormData();
  form.set("transcript", text.slice(0, 980));
  form.set("language", "uz");
  form.set("model", process.env.AISHA_TTS_MODEL || "Gulnoza");
  form.set("mood", process.env.AISHA_TTS_MOOD || "Neutral");
  form.set("speed", process.env.AISHA_TTS_SPEED || "1.0");

  const response = await fetch(`${BASE_URL}/api/v1/tts/post/`, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      "Accept-Language": "uz",
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Aisha TTS failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const audioUrl = normalizeAudioUrl(data.audio_path || data.audio_url || data.url);
  if (!audioUrl) throw new Error("Aisha TTS did not return audio_path");

  const audioResponse = await fetch(audioUrl, {
    headers: {
      "X-Api-Key": apiKey,
    },
  });

  if (!audioResponse.ok) {
    throw new Error(`Aisha audio download failed: ${audioResponse.status} ${audioResponse.statusText}`);
  }

  return audioResponse;
}

function normalizeAudioUrl(value) {
  if (!value) return null;
  if (/^https?:\/\//.test(value)) return value;
  return `${BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}
