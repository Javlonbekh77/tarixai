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
    return {
      text: "Bu Mock provider tomonidan qaytarilgan default javob. Aslida API ishlamayotgan bo'lishi mumkin.",
      providerName: "mock"
    };
  },
  generateLessonJson: async () => {
    return MOCK_LESSON;
  }
};
