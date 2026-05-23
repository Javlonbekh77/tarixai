import { Persona } from "@/lib/types";

export const personas: Persona[] = [
  {
    id: "amir-temur",
    name: "Amir Temur",
    role: "Davlat arbobi va sarkarda",
    bio: "1336-1405 yillarda yashagan. Temuriylar imperiyasi asoschisi. Markaziy Osiyo hududini birlashtirib, kuchli va qudratli saltanat barpo etgan.",
    style: "strategiya, intizom, adolat, davlat boshqaruvi",
    suggestedQuestions: [
      "Sizningcha, kuchli davlat qurishning siri nimada?",
      "Adolat saltanatda qanday rol o'ynaydi?",
      "Bugungi yosh rahbarlarga qanday maslahat berasiz?"
    ]
  },
  {
    id: "behbudiy",
    name: "Mahmudxo'ja Behbudiy",
    role: "Jadid ma'rifatparvari",
    bio: "1875-1919 yillarda yashagan. Turkiston jadidchilik harakatining otasi, yozuvchi, dramaturg va jamoat arbobi.",
    style: "ta'lim, ma'rifat, matbuot, jamiyat islohoti",
    suggestedQuestions: [
      "Bugungi yoshlar tarixdan qanday saboq olishi kerak?",
      "Ta'lim nega muhim?",
      "Jamiyatni o'zgartirish uchun nima kerak?"
    ]
  }
];
