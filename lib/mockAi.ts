export const getMockAiAnswer = (question: string, topic?: string): string => {
  if (topic === "Jadidchilik harakati" || question.toLowerCase().includes("jadid")) {
    return "Jadidlar ta'limni jamiyatni uyg'otishning eng asosiy vositasi deb ko'rgan. Chunki savodxonlik oshsa, odamlar matbuotni o'qiydi, yangiliklarni tushunadi va jamiyatdagi muammolarni anglay boshlaydi.\n\nKontekst: XIX asr oxirida Turkiston qoloqlik botqog'iga botgan edi.\n\nSabablar: Eski maktablar zamon talabiga javob bermasdi.\n\nOqibatlar: Yangi usul maktablari ochildi, milliy matbuot shakllandi.\n\nNega muhim?: Bu xalqning milliy ongi uyg'onishiga olib keldi.\n\nTekshiruvchi savol: Sizningcha, nima uchun chor hukumati jadidlarning maktablariga qarshilik qilgan?";
  }
  return "Bu savolga hozircha faqat qisqacha javob bera olaman. Tarixiy voqealar odatda o'z davrining siyosiy, iqtisodiy va ijtimoiy sharoitlari bilan bog'liq bo'ladi. Ko'proq ma'lumot olish uchun 'Darsliklar' bo'limiga o'ting.";
};

export const getMockPersonaAnswer = (personaId: string, question: string): string => {
  if (personaId === "amir-temur") {
    return "Men saltanatni adolat va intizom bilan boshqardim. Davlatning kuchi uning qo'shinida emas, balki qonun ustuvorligidadir. 'Kuch adolatdadir' degan so'zlarim bejiz emas. Sen aytayotgan masala ham kuchli qaror va chuqur mulohazani talab qiladi.";
  }
  if (personaId === "behbudiy") {
    return "Millatning dardiga davo - faqat ma'rifatdadir. Biz yoshlarni ilmga, zamonaviy bilimlarga undashimiz kerak. 'Haq olinur, berilmas' - shuni unutmang. Sizning savolingiz ham aynan shu o'zgarishlarga intilishning bir ko'rinishidir.";
  }
  return "Men bu savolga javob berishga biroz qiynalyapman. Balki boshqacharoq so'rab ko'rarsiz?";
};
