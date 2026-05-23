import { QuizQuestion } from "@/lib/types";

export const jadidQuiz: QuizQuestion[] = [
  {
    id: "q1",
    question: "Jadidchilik harakatining asosiy maqsadlaridan biri nima edi?",
    options: [
      "Faqat diniy bilimlarni o'rganish",
      "Xalqni ma'rifatli qilish va jamiyatni isloh etish",
      "Yangi davlat tuzish",
      "Savdo-sotiqni rivojlantirish"
    ],
    correctIndex: 1,
    explanation: "Jadidchilikning asosiy maqsadi xalqni jaholatdan qutqarish va ma'rifatli qilish edi."
  },
  {
    id: "q2",
    question: "Jadidlar nega ta'limga katta e'tibor bergan?",
    options: [
      "Chunki ular o'qituvchi bo'lishni xohlashgan",
      "Maktab qurish arzonroq bo'lgani uchun",
      "Jamiyatni o'zgartirishni yosh avlodni o'qitishdan boshlash kerak deb hisoblashgan",
      "Chor hukumati shuni talab qilgan"
    ],
    correctIndex: 2,
    explanation: "Ular ta'limni jamiyatni uyg'otishning asosiy kaliti deb bilishgan."
  },
  {
    id: "q3",
    question: "Yangi usul maktablari nima uchun muhim edi?",
    options: [
      "U yerda o'qish tezroq va osonroq edi, dunyoviy fanlar o'qitilardi",
      "Ular eski maktablar bilan bir xil edi",
      "U yerda faqat rus tili o'qitilardi",
      "Ular tekinga ovqat berishardi"
    ],
    correctIndex: 0,
    explanation: "Tovush (usuli savtiya) usuli orqali bolalar savodni oson chiqarardi."
  },
  {
    id: "q4",
    question: "Jadidchilik faqat maktab ochish bilan cheklanganmi?",
    options: [
      "Ha, faqat ta'lim sohasi bilan shug'ullanishgan",
      "Yo'q, matbuot, teatr va siyosiy faoliyat bilan ham shug'ullanishgan",
      "Yo'q, faqat kitob yozish bilan",
      "Ha, boshqa sohalarga qiziqishmagan"
    ],
    correctIndex: 1,
    explanation: "Jadidlar ijtimoiy hayotning barcha sohalarida islohotlar qilishga harakat qilishgan."
  },
  {
    id: "q5",
    question: "Matbuot jadidlar uchun qanday rol o'ynagan?",
    options: [
      "Daromad olish manbai bo'lgan",
      "Xalqni yangiliklardan xabardor qilish va o'z g'oyalarini tarqatish vositasi",
      "Faqat e'lonlar berish uchun ishlatilgan",
      "Ular matbuotni yomon ko'rishgan"
    ],
    correctIndex: 1,
    explanation: "Gazeta va jurnallar orqali ular o'z g'oyalarini butun Turkistonga yoyishdi."
  },
  {
    id: "q6",
    question: "Rasmli savol: 'Oyna' jurnali va 'Padarkush' dramasi muallifi bo'lgan jadid ma'rifatparvari kim?",
    options: [
      "Munavvarqori",
      "Abdulla Avloniy",
      "Mahmudxo'ja Behbudiy",
      "Cho'lpon"
    ],
    correctIndex: 2,
    explanation: "Mahmudxo'ja Behbudiy jadidchilikning yetakchilaridan bo'lib, 'Oyna' jurnali va 'Padarkush' dramasi asoschisidir.",
    isImagePlaceholder: true
  }
];
