import { Topic } from "@/lib/types";
import { jadidQuiz } from "./quizzes";

export const topics: Topic[] = [
  {
    id: "jadidchilik-harakati",
    title: "Jadidchilik harakati",
    grade: "8-sinf",
    description: "XIX asr oxiri - XX asr boshlarida Turkistonda ta'lim va jamiyatni isloh qilish harakati.",
    estimatedTime: "25 daqiqa",
    difficulty: "O'rtacha",
    lessonSections: [
      {
        id: "intro",
        title: "Qisqa kirish",
        content: "Jadidchilik - bu Turkistondagi ma'rifatparvarlik harakati bo'lib, xalqni jaholatdan qutqarish va zamonaviy taraqqiyotga boshlashni maqsad qilgan."
      },
      {
        id: "context",
        title: "Kontekst",
        content: "XIX asr oxirida Chor Rossiyasi bosqini ostida Turkiston o'z taraqqiyotidan ortda qolgan, ta'lim tizimi eskirgan va iqtisodiy tushkunlik hukm surar edi."
      },
      {
        id: "reasons",
        title: "Asosiy sabablar",
        content: "Eski maktablarning zamon talabiga javob bermasligi, dunyoviy ilmlarning o'qitilmasligi va milliy o'zlikni anglash ehtiyojining kuchayishi."
      },
      {
        id: "people",
        title: "Asosiy shaxslar",
        content: "Mahmudxo'ja Behbudiy, Munavvarqori Abdurashidxon o'g'li, Abdulla Avloniy va boshqalar bu harakatning yetakchilari bo'lishgan."
      },
      {
        id: "results",
        title: "Oqibatlar",
        content: "Yangi usul maktablari ochildi, milliy teatr va matbuot vujudga keldi, yoshlar chet elga o'qishga yuborildi."
      },
      {
        id: "why",
        title: "Nega muhim?",
        content: "Jadidlar milliy uyg'onishga asos soldi. Ularning g'oyalari keyinchalik mustaqillik harakatlari uchun zamin yaratdi."
      },
      {
        id: "check",
        title: "Tekshiruvchi savol",
        content: "Nima uchun jadidlar o'z islohotlarini aynan maktablarni o'zgartirishdan boshlashdi?"
      }
    ],
    timeline: [
      {
        id: "t1",
        year: "XIX asr oxiri",
        title: "Islohot ehtiyoji kuchaydi",
        explanation: "O'lkadagi qoloqlik va mustamlaka zulmi ziyolilarni harakatga keltirdi.",
        whyImportant: "Bu davr jadidchilik g'oyalarining ilk kurtaklari paydo bo'lishiga sabab bo'ldi."
      },
      {
        id: "t2",
        year: "1900-yillar",
        title: "Yangi usul maktablari paydo bo'ldi",
        explanation: "Tovush usulida o'qitiladigan, dunyoviy fanlar kiritilgan maktablar ochildi.",
        whyImportant: "Savodxonlikni tez va oson oshirish imkonini berdi."
      },
      {
        id: "t3",
        year: "1906–1914",
        title: "Matbuot va ma'rifat faoliyati kuchaydi",
        explanation: "Birinchi milliy gazetalar (\"Taraqqiy\", \"Sadoi Turkiston\") nashr etildi.",
        whyImportant: "Xalqni dunyo voqealaridan xabardor qildi va milliy ongni yuksaltirdi."
      },
      {
        id: "t4",
        year: "1917-yil",
        title: "Siyosiy faollik kuchaydi",
        explanation: "Fevral inqilobidan keyin jadidlar siyosiy maydonga chiqdi.",
        whyImportant: "Turkiston Muxtoriyatini tuzishda asosiy rolni o'ynadilar."
      },
      {
        id: "t5",
        year: "1920-yillar",
        title: "Jadidlar bosim ostida qoldi",
        explanation: "Sho'ro hukumati ularning g'oyalarini xavfli deb hisoblab, ta'qib qila boshladi.",
        whyImportant: "Milliy ziyolilarning qatag'on qilinishiga olib keldi, ammo ularning g'oyalari xalq xotirasida qoldi."
      }
    ],
    causeMap: [
      { id: "c1", title: "Ta'limdagi qoloqlik", explanation: "Eski maktablarda faqat diniy bilimlar, quruq yodlash usulida o'qitilardi.", nextIds: ["c2"] },
      { id: "c2", title: "Islohot ehtiyoji", explanation: "Dunyo taraqqiyotidan ortda qolmaslik uchun ta'limni o'zgartirish kerak edi.", nextIds: ["c3"] },
      { id: "c3", title: "Yangi usul maktablari", explanation: "O'qish va yozishni oson o'rgatadigan maktablar ochildi.", nextIds: ["c4"] },
      { id: "c4", title: "Matbuot va ma'rifat", explanation: "Aholini kengroq qismini uyg'otish uchun gazeta va jurnallar chiqarildi.", nextIds: ["c5"] },
      { id: "c5", title: "Milliy ong", explanation: "Odamlar o'z huquqlari va milliy manfaatlarini tushuna boshladi.", nextIds: ["c6"] },
      { id: "c6", title: "Siyosiy faollik", explanation: "Ma'rifiy harakat siyosiy talablar darajasiga o'sdi.", nextIds: ["c7"] },
      { id: "c7", title: "Jamiyatga ta'sir", explanation: "Butun Turkiston bo'ylab istiqlol va ozodlik g'oyalari tarqaldi.", nextIds: [] }
    ],
    quiz: jadidQuiz
  },
  {
    id: "amir-temur-davlati",
    title: "Amir Temur davlati",
    grade: "8-sinf",
    description: "Markaziy Osiyodagi eng yirik, qudratli saltanat va uning boshqaruv tizimi.",
    estimatedTime: "20 daqiqa",
    difficulty: "Oson",
    lessonSections: [],
    timeline: [],
    causeMap: [],
    quiz: []
  },
  {
    id: "xonliklar-davri",
    title: "Xonliklar davri",
    grade: "8-sinf",
    description: "Buxoro amirligi, Xiva va Qo'qon xonliklarining ijtimoiy-siyosiy hayoti.",
    estimatedTime: "30 daqiqa",
    difficulty: "Qiyin",
    lessonSections: [],
    timeline: [],
    causeMap: [],
    quiz: []
  }
];
