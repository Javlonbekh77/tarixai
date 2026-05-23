"use client";
import { useEffect, useState } from "react";
import { getProgress } from "@/lib/storage";
import { topics } from "@/data/topics";
import { UserProgress } from "@/lib/types";
import { Award, Target, Brain, TrendingUp, CheckCircle2 } from "lucide-react";

export function Profile() {
  const [progress, setProgress] = useState<UserProgress>({ completedTopics: [], quizScores: {} });

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const totalTopics = topics.length;
  const completedCount = progress.completedTopics.length;
  
  const scores = Object.values(progress.quizScores);
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 0;

  const strength = averageScore >= 80 ? "Faktlarni eslab qolish" : "Hali yetarlicha ma'lumot yo'q";
  const weakness = averageScore > 0 && averageScore < 80 ? "Sabab-oqibatni tushuntirish" : "Hali yetarlicha ma'lumot yo'q";
  const recommendation = averageScore > 0 && averageScore < 80 
    ? "Jadidchilik timeline bo'limini qayta ko'rib chiqing." 
    : "Yangi mavzularni o'rganishni davom eting!";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-lg">
        <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-700 shrink-0">
          <span className="text-5xl">🎓</span>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">Demo o'quvchi</h1>
          <p className="text-slate-400 mb-4">Tarixchi AI MVP User</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30">
              8-sinf o'quvchisi
            </span>
            {completedCount > 0 && (
              <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Faol o'quvchi
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Target className="w-6 h-6" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">{completedCount}/{totalTopics}</div>
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">O'rganilgan mavzular</div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">{averageScore}%</div>
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">O'rtacha test natijasi</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <Brain className="w-6 h-6" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">{scores.length}</div>
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Yechilgan testlar</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Analitika</h2>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="text-sm text-slate-500 mb-1">Kuchli tomon</div>
              <div className="font-semibold text-emerald-700">{strength}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="text-sm text-slate-500 mb-1">Zaif tomon</div>
              <div className="font-semibold text-rose-700">{weakness}</div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="text-sm text-blue-500 mb-1 font-medium">Tavsiya</div>
              <div className="font-semibold text-blue-900">{recommendation}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" /> Badges
          </h2>
          <div className="space-y-3">
            <div className={`p-4 rounded-xl border flex items-center gap-4 transition-colors ${completedCount >= 1 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${completedCount >= 1 ? 'bg-amber-200' : 'bg-slate-200 grayscale'}`}>
                🔥
              </div>
              <div>
                <div className="font-bold text-slate-900">Jadidchilik Starter</div>
                <div className="text-sm text-slate-500">Birinchi mavzuni o'rgandingiz</div>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl border flex items-center gap-4 transition-colors ${scores.length >= 1 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${scores.length >= 1 ? 'bg-blue-200' : 'bg-slate-200 grayscale'}`}>
                🗺️
              </div>
              <div>
                <div className="font-bold text-slate-900">Timeline Explorer</div>
                <div className="text-sm text-slate-500">Testni muvaffaqiyatli topshirdingiz</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 opacity-60 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-slate-200 grayscale">
                💡
              </div>
              <div>
                <div className="font-bold text-slate-900">Tarixiy Fikr Boshlovchi</div>
                <div className="text-sm text-slate-500">Threads bo'limida post yozing (Hali olinmadi)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
