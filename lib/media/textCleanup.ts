/**
 * Cleans and lightly reshapes lesson text so Uzbek TTS sounds natural.
 * The goal is clarity, short spoken sentences, and factual preservation.
 */

const MAX_SCENE_CHARS = 1450;

export function cleanTextForTTS(text: string): string {
  const normalized = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    .replace(/_{1,3}([^_]+)_{1,3}/g, "$1")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*>\s*/gm, "")
    .replace(/^\s*[{\[].*$/gm, " ")
    .replace(/[\uD83C-\uDBFF][\uDC00-\uDFFF]/g, "")
    .replace(/[\u2600-\u27FF]/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, ". ")
    .replace(/\bAI\b/g, "sun'iy intellekt")
    .replace(/\s+/g, " ")
    .trim();

  return splitLongSentences(normalized);
}

export function enhanceTeacherSpeechForTTS(text: string): string {
  const cleaned = cleanTextForTTS(text);
  if (!cleaned) return "";

  const parts = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => softenTeacherTone(part));

  if (parts.length === 0) return "";

  const result: string[] = [];

  if (parts[0] && !startsWithTeacherHook(parts[0])) {
    result.push(`Diqqat qiling. ${parts[0]}`);
  } else {
    result.push(parts[0]);
  }

  for (let index = 1; index < parts.length; index += 1) {
    result.push(parts[index]);
  }

  const merged = result.join(" ").replace(/\s+/g, " ").trim();
  const withQuestion = appendThinkingQuestion(merged);
  return splitLongSentences(withQuestion);
}

export function chunkTextForTTS(text: string, maxChars = MAX_SCENE_CHARS): string[] {
  const cleaned = cleanTextForTTS(text);
  if (!cleaned) return [];

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (sentence.length > maxChars) {
      const broken = hardSplit(sentence, maxChars);
      for (const piece of broken) {
        if (current) {
          chunks.push(current.trim());
          current = "";
        }
        chunks.push(piece.trim());
      }
      continue;
    }

    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > maxChars) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = next;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

export const sanitizeTtsText = cleanTextForTTS;

function splitLongSentences(text: string): string {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => {
      if (sentence.length <= 220) return sentence.trim();

      return sentence
        .replace(/,\s+(lekin|ammo|biroq|shuning uchun|shu sababli)\s+/gi, ". $1 ")
        .replace(/,\s+(va|hamda)\s+/gi, ", $1 ")
        .replace(/;\s+/g, ". ")
        .trim();
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function softenTeacherTone(sentence: string): string {
  let next = sentence.trim();

  const replacements: Array<[RegExp, string]> = [
    [/\bmazkur\b/gi, "bu"],
    [/\bushbu\b/gi, "bu"],
    [/\bhisoblanadi\b/gi, "deb qaraladi"],
    [/\bnamoyon bo'lgan\b/gi, "ko'ringan"],
    [/\bjarayon\b/gi, "holat"],
  ];

  for (const [pattern, value] of replacements) {
    next = next.replace(pattern, value);
  }

  next = next.replace(/\s+/g, " ").trim();
  return next;
}

function startsWithTeacherHook(sentence: string): boolean {
  return /^(diqqat qiling|eslab qoling|o'ylab ko'ring|endi qarang)/i.test(sentence);
}

function appendThinkingQuestion(text: string): string {
  if (/[?]$/.test(text)) return text;
  if (text.length < 80) return `${text} Shu fikr nimani anglatishini o'ylab ko'ring.`;
  if (/o'ylab ko'ring|savol|nega/i.test(text)) return text;
  return `${text} Endi o'ylab ko'ring: bu o'zgarish nega muhim bo'lgan?`;
}

function hardSplit(text: string, maxChars: number): string[] {
  const parts: string[] = [];
  let remaining = text.trim();

  while (remaining.length > maxChars) {
    let splitAt = remaining.lastIndexOf(" ", maxChars);
    if (splitAt < Math.floor(maxChars * 0.6)) {
      splitAt = maxChars;
    }
    parts.push(`${remaining.slice(0, splitAt).trim()}.`);
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) parts.push(remaining);
  return parts;
}
