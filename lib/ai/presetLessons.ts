import type { LessonJson } from "./schemas";

export function getPresetLesson(topic: string): LessonJson | null {
  const normalized = topic.toLowerCase();
  if (normalized.includes("jadid")) return JADIDCHILIK_STORY_LESSON;
  return null;
}

export const JADIDCHILIK_STORY_LESSON: LessonJson = {
  id: "jadidchilik-harakati",
  title: "Jadidchilik harakati",
  grade: "8-sinf",
  mission: "Jadidchilikni quruq fakt emas, uyg'onish hikoyasi sifatida tushunish",
  duration: {
    lessonMinutes: 20,
    breakMinutes: 5,
    qaMinutes: 7,
    interviewMinutes: 5,
    threadsMinutes: 5,
    pauseOnQuestion: true,
  },
  gamification: {
    xpReward: 250,
    badges: ["Ma'rifat yo'li", "Jadidlar izidan"],
    league: "Tarixchi",
    streakReward: 10,
  },
  scenes: [
    {
      sceneId: 1,
      timeRange: "00:00 - 03:00",
      estimatedSeconds: 180,
      teacherSpeech:
        "Tasavvur qiling: Turkiston XIX asr oxirida katta chorrahada turibdi. Bir tomonda eski tartiblar, ikkinchi tomonda esa dunyoda tezlashayotgan fan, matbuot va yangi maktablar bor. Jadidchilik mana shu bosim ichida tug'ildi. Jadidlar xalqni uyg'otish uchun avval odamlarning fikrini o'zgartirish kerakligini tushundi. Ular uchun eng kuchli qurol qilich emas, savod, kitob va maktab edi. Endi xaritaga qarang: bu keng hududda yangi fikr qanday sekin, lekin qat'iy tarqala boshlaganini tasavvur qiling.",
      presentation: {
        type: "map",
        title: "Turkiston: uyg'onish xaritasi",
        description: "XIX asr oxiri va XX asr boshidagi Turkiston: Toshkent, Samarqand, Buxoro va Farg'ona atrofida yangi fikr tarqala boshlagan davr.",
        assetSuggestion: "Russian Turkestan historical map",
        imagePrompt: "Russian Turkestan historical map 1900 Central Asia",
        animationIdea: "Map slowly zooms toward Samarkand, Bukhara, Tashkent.",
        caption: "Jadidchilik hududiy emas, fikriy uyg'onish edi.",
      },
      microQuestion: {
        question: "Nega jadidlar o'zgarishni aynan ta'limdan boshlagan?",
        options: ["Chunki ta'lim dunyoqarashni o'zgartiradi", "Chunki maktab qurish oson edi", "Chunki siyosat kerak emas edi"],
        correctIndex: 0,
        explanation: "Jadidlar fikr o'zgarmasa, jamiyat ham o'zgarmaydi deb hisoblagan.",
      },
    },
    {
      sceneId: 2,
      timeRange: "03:00 - 06:00",
      estimatedSeconds: 180,
      teacherSpeech:
        "Endi bir maktab xonasini ko'z oldingizga keltiring. Eski ta'limda bola ko'pincha matnni yodlar edi, lekin dunyoni tushunish uchun yetarli bilim olmasdi. Jadidlar esa savol beradigan, hisob-kitob qiladigan, xarita ko'radigan, gazeta o'qiydigan avlodni xohladi. Yangi usul maktablari shunchaki dars jadvali emas edi. Bu kelajakni boshqacha tasavvur qilish mashqi edi. Har bir yangi daftar, har bir yangi dars jamiyatga: 'biz ham zamon bilan yuramiz', degan signal edi.",
      presentation: {
        type: "school",
        title: "Yangi usul maktablari",
        description: "Jadid maktablarida tovush usuli, hisob, geografiya va dunyoviy fanlar orqali o'quvchining fikrlashi uyg'otildi.",
        assetSuggestion: "Muslim school Central Asia historical classroom",
        imagePrompt: "Muslim School School Routine Central Asia historical classroom education",
        animationIdea: "Books, map and chalkboard details appear one by one.",
        caption: "Yangi maktab yangi fikrning boshlanishi bo'ldi.",
      },
      microQuestion: {
        question: "Yangi usul maktabi nimani o'zgartirmoqchi edi?",
        options: ["Faqat binoni", "O'qish usuli va dunyoqarashni", "Faqat kiyimni"],
        correctIndex: 1,
        explanation: "Asosiy maqsad o'qish usuli va fikrlash madaniyatini yangilash edi.",
      },
    },
    {
      sceneId: 3,
      timeRange: "06:00 - 09:00",
      estimatedSeconds: 180,
      teacherSpeech:
        "Bu hikoyada Mahmudxo'ja Behbudiy alohida o'rin tutadi. U faqat yozuvchi yoki muallim emas, balki jamiyatni uyg'otishga urinayotgan tashkilotchi edi. Behbudiy maktab, darslik, teatr va matbuotni bir zanjir deb ko'rdi. Agar bola maktabda o'qisa, gazeta orqali fikrini kengaytirsa, teatr orqali jamiyatdagi muammoni ko'rsa, unda u befarq bo'lib qolmaydi. Behbudiy shuni istagan: odamlar o'z hayoti haqida o'ylay boshlasin.",
      presentation: {
        type: "portrait-cards",
        title: "Mahmudxo'ja Behbudiy",
        description: "Turkiston jadidchilik harakatining yetakchilaridan biri: muallim, dramaturg, publitsist va jamoat arbobi.",
        assetSuggestion: "Mahmud Khoja Behbudiy portrait",
        imagePrompt: "Mahmud Khoja Behbudiy portrait Jadid educator",
        animationIdea: "Portrait appears with three keywords: maktab, matbuot, teatr.",
        caption: "Behbudiy jadidchilikni xalq hayotiga yaqinlashtirdi.",
      },
      microQuestion: {
        question: "Behbudiy nega teatr va matbuotga ham e'tibor bergan?",
        options: ["Chunki ular odamga ta'sir qiladi", "Chunki maktab kerak emas edi", "Chunki faqat san'at muhim edi"],
        correctIndex: 0,
        explanation: "Teatr va matbuot xalq bilan gaplashishning kuchli yo'li bo'lgan.",
      },
    },
    {
      sceneId: 4,
      timeRange: "09:00 - 12:00",
      estimatedSeconds: 180,
      teacherSpeech:
        "Matbuot jadidlar uchun ovoz edi. Gazeta chiqqanda, fikr bir xonadan chiqib butun shaharga tarqaladi. Bir maqola odamni o'ylantirishi, bir bahs esa yangi savollar tug'dirishi mumkin. Jadidlar gazeta orqali xalqni savodga, islohotga, hushyorlikka chaqirdi. Bu juda muhim: ular odamlarni majburlashga emas, ishontirishga urindi. Shuning uchun matbuot jadidchilikning yuragi kabi ishladi.",
      presentation: {
        type: "newspaper",
        title: "Matbuot va ma'rifat",
        description: "Gazeta va jurnallar jadidlar uchun xalq bilan gaplashish, savod va islohot g'oyasini yoyish maydoni bo'ldi.",
        assetSuggestion: "Turkestanskie Vedomosti newspaper",
        imagePrompt: "Turkestanskie Vedomosti newspaper 1871 Turkestan press",
        animationIdea: "Newspaper texture pans across the slide.",
        caption: "Matbuot fikrni ko'paytiradigan maydon bo'ldi.",
      },
      microQuestion: {
        question: "Gazeta jadidlar uchun nima vazifa bajargan?",
        options: ["Fikrni tarqatgan", "Faqat e'lon bergan", "Faqat rasm bosgan"],
        correctIndex: 0,
        explanation: "Matbuot jadidlarning fikrini keng ommaga yetkazgan.",
      },
    },
    {
      sceneId: 5,
      timeRange: "12:00 - 16:00",
      estimatedSeconds: 220,
      teacherSpeech:
        "Jadidchilik oson yo'l emas edi. Eski tartibdan foyda ko'rganlar yangi fikrdan qo'rqdi. Mustamlaka hokimiyati ham uyg'ongan xalqni xavf deb bildi. Shuning uchun jadidlar ko'p bosim ko'rdi. Lekin ularning eng katta merosi shunda: ular 'xalq o'zgarishi mumkin', degan ishonchni uyg'otdi. Darsning eng muhim joyi ham shu. Jadidchilik bizga tarixda o'zgarish avval inson fikrida boshlanishini ko'rsatadi.",
      presentation: {
        type: "infographic",
        title: "Merosi: ma'rifat va milliy uyg'onish",
        description: "Jadidlar maktab, matbuot, teatr va jamoatchilik orqali xalqning o'z kelajagi haqida o'ylashiga turtki berdi.",
        assetSuggestion: "Jadid movement education press theatre Turkestan",
        imagePrompt: "Jadid movement education press theatre Turkestan legacy",
        animationIdea: "Three words appear: Ta'lim, Matbuot, Uyg'onish.",
        caption: "Jadidlar tarixda fikr uyg'onishining ramziga aylandi.",
      },
      microQuestion: {
        question: "Jadidchilikning eng katta merosi nimada?",
        options: ["Yangi fikr va ma'rifat uyg'onishida", "Faqat bitta maktabda", "Faqat bitta gazetada"],
        correctIndex: 0,
        explanation: "Jadidchilikning asosiy merosi jamiyatni ma'rifat orqali uyg'otish g'oyasidir.",
      },
    },
  ],
  breakSection: {
    durationMinutes: 5,
    activitySuggestion: "Xaritaga qarab, jadid fikri qaysi yo'llar bilan tarqalganini tasavvur qiling.",
  },
  qaPrompts: [
    "Jadidlar nega ta'limni birinchi o'ringa qo'ygan?",
    "Behbudiy faoliyatida maktab, teatr va matbuot qanday bog'langan?",
    "Jadidchilikning bugungi kun uchun sabog'i nima?",
  ],
  interview: {
    persona: "Mahmudxo'ja Behbudiy",
    disclaimer: "Bu tarixiy shaxs asosidagi AI simulyatsiya.",
    biographyShort: "Turkiston jadidchilik harakatining yetakchilaridan biri, muallim, dramaturg va publitsist.",
    suggestedQuestions: ["Nega maktabdan boshladingiz?", "Matbuot siz uchun nima edi?", "Yoshlarga nima degan bo'lardingiz?"],
    sampleAnswers: ["Millatni uyg'otish uchun avval fikrni uyg'otish kerak."],
  },
  threads: {
    prompt: "Bugungi darsdan keyin siz uchun jadidchilik nimani anglatadi?",
    samplePosts: ["Men jadidchilikni ta'lim orqali jamiyatni uyg'otish harakati deb tushundim."],
  },
  aiNotes: {
    keyTakeaways: [
      "Jadidchilik Turkistonda ta'lim va ma'rifat orqali jamiyatni yangilash harakati edi.",
      "Yangi usul maktablari yodlashdan ko'ra tushunish va zamonaviy bilimga urg'u berdi.",
      "Behbudiy maktab, matbuot va teatrni xalqni uyg'otish vositasi deb ko'rdi.",
    ],
    examTips: [
      "Jadidchilikni ta'lim islohoti, matbuot va milliy uyg'onish bilan bog'lab tushuntiring.",
      "Behbudiy nomini maktab, darslik, teatr va publitsistika bilan eslab qoling.",
    ],
    importantDates: [
      "XIX asr oxiri: Turkistonda islohot zarurati kuchaydi.",
      "XX asr boshi: yangi usul maktablari va jadid matbuoti faollashdi.",
      "1919: Mahmudxo'ja Behbudiy vafot etdi.",
    ],
    causeEffectSummary: [
      "Ta'limdagi qoloqlik -> yangi usul maktablari -> savodli va hushyor avlod g'oyasi.",
      "Matbuotning paydo bo'lishi -> fikr tarqalishi -> jamoatchilik uyg'onishi.",
      "Bosim va ta'qiblar -> jadidlarning merosi yanada ramziy ahamiyat kasb etdi.",
    ],
    oneSentenceSummary:
      "Jadidchilik Turkistonda xalqni savod, matbuot va madaniyat orqali uyg'otishga intilgan ma'rifatparvarlik harakati edi.",
  },
  timeline: [
    { year: "XIX asr oxiri", title: "Islohot ehtiyoji", explanation: "Turkistonda qoloqlik va mustamlaka bosimi yangi fikrga ehtiyoj tug'dirdi." },
    { year: "XX asr boshi", title: "Yangi usul maktablari", explanation: "Jadidlar ta'limni yangilash orqali jamiyatni uyg'otishga urindi." },
    { year: "1919", title: "Behbudiy vafoti", explanation: "Jadidlar bosim va ta'qiblarga duch keldi, ammo ularning merosi saqlanib qoldi." },
  ],
  causeEffect: [
    { title: "Qoloq ta'lim", explanation: "Yangi usul maktablari zaruratini kuchaytirdi." },
    { title: "Matbuotning rivoji", explanation: "Jadid fikrlarini keng ommaga tarqatdi." },
    { title: "Ta'qiblar", explanation: "Jadidchilikning tarixiy ahamiyatini yanada keskin ko'rsatdi." },
  ],
  quiz: [
    {
      id: "jadid-q1",
      question: "Jadidlar islohotni asosan qaysi sohadan boshladi?",
      options: ["Ta'lim", "Harbiy ish", "Savdo", "Sport"],
      correctIndex: 0,
      explanation: "Jadidlar xalqni uyg'otish uchun avval ta'limni yangilash kerak deb bildi.",
      skill: "fact",
    },
  ],
  flashcards: [
    { front: "Jadidchilik", back: "Ta'lim va ma'rifat orqali jamiyatni yangilash harakati." },
    { front: "Yangi usul maktabi", back: "Zamonaviy bilim va tushunishga asoslangan jadid maktabi." },
    { front: "Behbudiy", back: "Jadidchilik yetakchisi, muallim, dramaturg va publitsist." },
  ],
};
