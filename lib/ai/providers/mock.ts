import { AIProvider, GenerateTextParams, GenerateLessonParams } from "./types";
import { LessonJson } from "../schemas";

const MOCK_LESSON: LessonJson = {
  id: "jadidchilik-harakati",
  title: "Jadidchilik harakati",
  grade: "8-sinf",
  mission: "Turkistonda jadidchilik qanday boshlanganini va nima uchun u muhimligini tushunish",
  duration: {
    lessonMinutes: 20,
    breakMinutes: 5,
    qaMinutes: 5,
    interviewMinutes: 5,
    threadsMinutes: 5,
    pauseOnQuestion: true
  },
  gamification: {
    xpReward: 250,
    badges: ["Jadidchilik Starter", "Ma'rifatparvar"],
    league: "Oltin Liga",
    streakReward: 10
  },
  scenes: [
    {
      sceneId: 1,
      timeRange: "00:00 - 02:00",
      estimatedSeconds: 120,
      teacherSpeech: "Salom! Bugun biz Turkiston tarixidagi eng yorqin sahifalardan biri – jadidchilik harakati haqida gaplashamiz. Tasavvur qiling, XIX asr oxiri...",
      presentation: {
        type: "map",
        title: "Turkiston xaritasi (XIX-XX asrlar)",
        description: "Mustamlaka davridagi Turkiston o'lkasi, qoloqlik va islohotlarga muhtoj jamiyat manzarasi.",
        assetSuggestion: "vintage map of Turkestan",
        imagePrompt: "Vintage style historical map of Turkestan showing Tashkent, Bukhara, Samarkand",
        animationIdea: "Zoom in on main cities",
        caption: "Bu davrda Turkiston dunyo taraqqiyotidan ancha orqada qolgandi."
      },
      microQuestion: {
        question: "Jadidlar islohotlarni eng birinchi bo'lib qaysi sohadan boshlashgan?",
        options: ["Siyosatdan", "Harbiy sohadan", "Ta'limdan", "Iqtisodiyotdan"],
        correctIndex: 2,
        explanation: "To'g'ri! Ular ta'lim tizimini tubdan isloh qilish (yangi usul maktablari ochish) orqali xalqni uyg'otish mumkin deb hisoblashgan."
      }
    }
  ],
  breakSection: {
    durationMinutes: 5,
    activitySuggestion: "Ko'zingizni yumib, chuqur nafas oling va jadid maktabidagi o'quvchini tasavvur qilib ko'ring."
  },
  qaPrompts: ["Nega jadidlar ta'qib qilingan?", "Behbudiy nima ishlar qilgan?"],
  interview: {
    persona: "Mahmudxo'ja Behbudiy",
    disclaimer: "Bu tarixiy shaxs asosidagi AI simulyatsiya.",
    biographyShort: "Turkiston jadidchilik harakatining otasi, yozuvchi, dramaturg.",
    suggestedQuestions: ["Nega matbuot muhim edi?", "Yoshlarga maslahatingiz nima?"],
    sampleAnswers: ["Matbuot - millatning ko'zi va tilidir."]
  },
  threads: {
    prompt: "Bugungi darsdan eng qiziq xulosa nima bo'ldi?",
    samplePosts: ["Ta'lim orqali millatni o'zgartirish qanchalik muhimligini tushundim."]
  },
  aiNotes: {
    keyTakeaways: ["Jadidlar ma'rifatparvarlik harakatini boshlagan.", "Yangi usul maktablari ochilgan."],
    examTips: ["1913-yildagi Turon gazetasini unutmang."],
    importantDates: ["1875 - Behbudiy tug'ilgan yili", "1913 - Turon gazetasi tashkil topgan yili"],
    causeEffectSummary: ["Qoloqlik -> Yangi usul maktablari -> Milliy uyg'onish"],
    oneSentenceSummary: "Jadidchilik xalqni ma'rifatli qilish orqali milliy uyg'onishga olib kelgan harakatdir."
  },
  timeline: [
    { year: "XIX asr oxiri", title: "Islohot ehtiyoji", explanation: "O'lkadagi qoloqlik ziyolilarni harakatga keltirdi." }
  ],
  causeEffect: [
    { title: "Ta'limdagi qoloqlik", explanation: "Dunyoviy fanlar o'qitilmagan." }
  ],
  quiz: [
    { id: "q1", question: "Jadid so'zining ma'nosi nima?", options: ["Yangi", "Eski", "Boy", "Olim"], correctIndex: 0, explanation: "'Jadid' so'zi arabchadan olingan bo'lib, 'yangi' degan ma'noni anglatadi.", skill: "fact" }
  ],
  flashcards: [
    { front: "Mahmudxo'ja Behbudiy", back: "Jadidchilik harakati yetakchisi" }
  ]
};

export const mockProvider: AIProvider = {
  name: "mock",
  isAvailable: () => true,
  generateText: async ({ prompt }) => {
    const questionMatch = prompt.match(/savoli:\s*"([^"]+)"/i) || prompt.match(/Savol:\s*(.+)/i);
    const contextMatch = prompt.match(/konteksti:\s*"([^"]+)"/i);
    const question = questionMatch?.[1]?.trim() || "Bu mavzu bo'yicha savol";
    const context = contextMatch?.[1]?.trim();

    if (prompt.includes("suggestedNextAction") || prompt.includes("O'quvchining savoli")) {
      return {
        text: JSON.stringify({
          answer: [
            `Qisqa javob: ${question} savoliga javob shuki, bu jarayon mavzudagi asosiy sabab va oqibatlarni tushunishga yordam beradi.`,
            context ? `Kontekst: ${context}` : "",
            "Nega muhim? Chunki tarixda voqealar alohida emas, bir-biriga bog'langan holda yuz beradi.",
            "Misol: agar ta'lim o'zgarsa, odamlarning dunyoqarashi ham o'zgaradi; dunyoqarash o'zgarsa, jamiyatda islohot talabi kuchayadi.",
          ].filter(Boolean).join("\n\n"),
          followUpQuestion: "Bu voqeaning eng muhim oqibati nima bo'lgan deb o'ylaysiz?",
          suggestedNextAction: "continue_lesson",
        }),
        providerName: "mock",
      };
    }

    return {
      text: `Qisqa javob: ${question}\n\nBu savolga javob berishda mavzuning sababi, jarayoni va oqibatini ajratib ko'rish kerak. Avval nima muammo bo'lganini topamiz, keyin shu muammo qanday harakatga olib kelganini tushunamiz.\n\nTekshiruvchi savol: bu voqea jamiyat hayotida qanday o'zgarish yasagan?`,
      providerName: "mock"
    };
  },
  generateLessonJson: async ({ sourceText, topic, grade }) => {
    if (!sourceText.trim()) return MOCK_LESSON;

    const chunks = sourceText
      .split(/\n+|(?<=\.)\s+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8);

    return {
      ...MOCK_LESSON,
      id: topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || MOCK_LESSON.id,
      title: topic,
      grade,
      mission: `${topic} mavzusini sodda, ketma-ket va sabab-oqibat bilan tushunish`,
      scenes: chunks.map((chunk, index) => ({
        sceneId: index + 1,
        timeRange: `${String(index * 2).padStart(2, "0")}:00 - ${String((index + 1) * 2).padStart(2, "0")}:00`,
        estimatedSeconds: 120,
        teacherSpeech: [
          `Keling, ${topic} mavzusining muhim qismini tushunamiz.`,
          chunk,
          "Bu yerda faqat faktni yodlab olish yetarli emas. Avval qanday muammo bor edi, keyin odamlar qanday yechim izlashdi, oxirida bu jamiyatga qanday ta'sir qildi - shularni ketma-ket ko'ramiz.",
          "Agar shu bog'lanishni tushunsangiz, mavzu imtihonda ham, mustaqil fikrlashda ham ancha oson bo'ladi.",
        ].join(" "),
        presentation: {
          type: "infographic",
          title: index === 0 ? topic : `Sahna ${index + 1}`,
          description: chunk,
          assetSuggestion: `${topic} historical education image`,
          imagePrompt: `${topic} mavzusi uchun tarixiy, maktab darsiga mos rasm`,
          animationIdea: "Rasm almashadi, asosiy jumla asta paydo bo'ladi",
          caption: chunk,
        },
        microQuestion: {
          question: `Bu sahnadan eng muhim xulosa nima?`,
          options: [],
          correctIndex: 0,
          explanation: chunk,
        },
      })),
      aiNotes: {
        ...MOCK_LESSON.aiNotes,
        keyTakeaways: chunks.slice(0, 3),
        oneSentenceSummary: chunks[0] ?? `${topic} bo'yicha qisqa dars.`,
      },
      flashcards: chunks.slice(0, 5).map((chunk, index) => ({
        front: `${topic}: ${index + 1}-xulosa`,
        back: chunk,
      })),
    };
  }
};
