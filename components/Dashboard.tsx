import Link from "next/link";
import { BookOpen, Map, BrainCircuit, Users, MessageSquare, Award, PlayCircle, BarChart3, Clock } from "lucide-react";

export function Dashboard() {
  const features = [
    { icon: BookOpen, title: "AI Darsliklar", desc: "Storytelling formatidagi interaktiv mavzular", color: "text-blue-600", bg: "bg-blue-100" },
    { icon: Map, title: "Timeline va xaritalar", desc: "Sabab-oqibatni vizual tarzda tushunish", color: "text-indigo-600", bg: "bg-indigo-100" },
    { icon: Award, title: "Test va feedback", desc: "Bilimni tekshirish va shaxsiy tavsiyalar", color: "text-emerald-600", bg: "bg-emerald-100" },
    { icon: Users, title: "Tarixiy shaxslar", desc: "AI orqali shaxslar bilan suhbat qurish", color: "text-amber-600", bg: "bg-amber-100" },
    { icon: BrainCircuit, title: "Public questions", desc: "Har qanday tarixiy savolga AI orqali javob", color: "text-purple-600", bg: "bg-purple-100" },
    { icon: MessageSquare, title: "Threads community", desc: "Boshqa o'quvchilar bilan fikr almashish", color: "text-pink-600", bg: "bg-pink-100" }
  ];

  const stats = [
    { icon: PlayCircle, label: "3 demo mavzu", value: "8-sinf uchun" },
    { icon: Clock, label: "1 to'liq dars", value: "Interaktiv" },
    { icon: BookOpen, label: "5+ quiz", value: "Tayyor" },
    { icon: BarChart3, label: "Profile progress", value: "Saqlanadi" },
  ];

  return (
    <div className="space-y-12">
      <section className="text-center space-y-6 pt-10 pb-8 border-b">
        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
          Tarixchi AI MVP Demo
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
          Tarixni yodlama. <span className="text-blue-600">Tarixchi kabi o'yla.</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Maktab o'quvchilari uchun interaktiv AI tarix o'qituvchi: storytelling darslar, timeline, sabab-oqibat xaritalari, testlar va shaxsiy progress.
        </p>
        <div className="pt-4">
          <Link href="/darsliklar" className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-lg hover:shadow-xl">
            Darsni boshlash
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border shadow-sm text-center space-y-2">
              <Icon className="w-8 h-8 mx-auto text-slate-400" />
              <div className="font-bold text-lg text-slate-800">{stat.label}</div>
              <div className="text-sm text-slate-500">{stat.value}</div>
            </div>
          );
        })}
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Platforma imkoniyatlari</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.bg} mb-4`}>
                  <Icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-slate-600">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
