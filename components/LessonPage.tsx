"use client";
import { useState, useEffect } from "react";
import { Topic } from "@/lib/types";
import { 
  Compass, Hourglass, Zap, Flame, Shield, Users,
  Pause, HelpCircle, Sparkles, ArrowRight,
  Book, Coffee, MessageCircle, Mic, FileText,
  ChevronLeft, ChevronRight, CheckCircle2, Bookmark, Send, Edit3, Play, Lightbulb, GraduationCap, Globe
} from "lucide-react";
import Link from "next/link";

export function LessonPage({ topic }: { topic: Topic }) {
  const [activeStep, setActiveStep] = useState(0);
  const [slide, setSlide] = useState(0);
  const [noteInput, setNoteInput] = useState("");

  const steps = [
    { label: "20 min Dars", icon: Book },
    { label: "5 min Tanaflus", icon: Coffee },
    { label: "Savol-javob", icon: MessageCircle },
    { label: "Interview", icon: Mic },
    { label: "Xulosa", icon: FileText }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-[#0a1628] to-[#0f172a] text-slate-300 overflow-y-auto font-sans">
      
      {/* 1. Top Navigation Bar */}
      <nav className="sticky top-0 h-16 bg-[#0f172a]/80 backdrop-blur-md border-b border-cyan-500/20 z-50 px-6 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Link href="/darsliklar" className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform">
            <Compass className="w-6 h-6" />
          </Link>
          <span className="font-bold text-xl text-white tracking-wide">Tarixchi AI</span>
        </div>

        {/* Center */}
        <div className="flex items-center gap-4 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
          <Hourglass className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-white font-semibold tracking-wider text-sm">08:42 qoldi</span>
          <button className="text-slate-400 hover:text-white transition-colors">
            <Pause className="w-4 h-4" />
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6 text-sm font-semibold">
          <div className="flex items-center gap-2 group">
            <Zap className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-white">2,450 XP</span>
            <span className="text-emerald-400 text-xs">+120</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-white">7 kun</span>
            <span className="text-slate-500 text-xs uppercase tracking-wider">Seriya</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-300" />
            <span className="text-white">Oltin Liga</span>
            <span className="text-slate-500 text-xs">Top 12%</span>
          </div>
          <div className="flex items-center gap-2 pl-4 border-l border-slate-700">
            <Users className="w-5 h-5 text-cyan-400" />
            <span className="text-white hidden sm:inline">Do'stlar reytingi</span>
            <span className="text-emerald-400 text-xs">+24</span>
          </div>
        </div>
      </nav>

      {/* 2. Main Content Area */}
      <div className="max-w-[1440px] mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: AI Tutor Panel (1/4 width) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl border border-teal-500/30 p-6 flex-grow flex flex-col items-center text-center relative overflow-hidden shadow-lg shadow-cyan-500/5 group hover:-translate-y-1 transition-all duration-300">
            
            {/* AI Speech Bubble */}
            <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-4 mb-6 relative w-full shadow-lg">
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0f172a] border-b border-r border-cyan-500/30 transform rotate-45"></div>
              <h3 className="text-white font-bold text-lg mb-1">Salom! 👋</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                Bugun <strong>{topic.title}</strong> mavzusini o'rganamiz. Bu harakat Turkiston tarixida burilish yasagan.
              </p>
              <p className="text-cyan-400 font-semibold text-sm">Boshlaymizmi?</p>
            </div>

            {/* AI Character Placeholder */}
            <div className="w-32 h-32 bg-slate-700/50 rounded-full flex items-center justify-center mb-6 relative group-hover:scale-105 transition-transform animate-[pulse_4s_ease-in-out_infinite]">
               <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-[spin_10s_linear_infinite]"></div>
               <Users className="w-16 h-16 text-cyan-400 opacity-80" />
               <div className="absolute -bottom-2 -right-2 bg-slate-800 p-2 rounded-lg border border-slate-600">
                 <Book className="w-4 h-4 text-amber-400" />
               </div>
            </div>

            {/* Controls */}
            <div className="w-full space-y-3 mt-auto">
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors border border-slate-600">
                  <Pause className="w-4 h-4 text-slate-400" /> Pauza
                </button>
                <button className="flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors border border-slate-600">
                  <HelpCircle className="w-4 h-4 text-cyan-400" /> Savol ber
                </button>
              </div>
              <button className="w-full flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors border border-slate-600">
                <Sparkles className="w-4 h-4 text-amber-400" /> Oddiyroq tushuntir
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white py-4 rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all">
                Davom et <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom Progress */}
          <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4">
            <div className="flex justify-between relative">
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-700 -translate-y-1/2 z-0"></div>
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx === activeStep;
                const isPassed = idx < activeStep;
                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center group cursor-pointer" onClick={() => setActiveStep(idx)}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isActive || isPassed ? "bg-slate-900 border-cyan-400" : "bg-slate-800 border-slate-600"}`}>
                      <Icon className={`w-4 h-4 ${isActive || isPassed ? "text-cyan-400" : "text-slate-500"}`} />
                    </div>
                    <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 whitespace-nowrap text-[10px] uppercase tracking-wider font-semibold text-cyan-400 transition-opacity">
                      {step.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Center Column: Lesson Content (2/4 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl border border-cyan-500/20 p-6 flex-grow flex flex-col shadow-lg shadow-cyan-500/5 relative overflow-hidden">
             
             {/* Carousel Nav */}
             <div className="flex justify-between items-center mb-6">
               <button onClick={() => setSlide(s => Math.max(0, s - 1))} className="w-10 h-10 rounded-full bg-slate-700/50 hover:bg-slate-600 flex items-center justify-center text-white border border-slate-600 transition-colors">
                 <ChevronLeft className="w-5 h-5" />
               </button>
               <h2 className="text-xl font-bold text-white tracking-wide">
                 {slide === 0 ? "Turkiston xaritasi (XIX–XX asr boshlarida)" : slide === 1 ? "Jadid ma'rifatparvarlari" : "Jadidchilik harakati: muhim bosqichlar"}
               </h2>
               <button onClick={() => setSlide(s => Math.min(2, s + 1))} className="w-10 h-10 rounded-full bg-slate-700/50 hover:bg-slate-600 flex items-center justify-center text-white border border-slate-600 transition-colors">
                 <ChevronRight className="w-5 h-5" />
               </button>
             </div>

             {/* Slide 1: Map */}
             {slide === 0 && (
               <div className="flex-grow bg-[#0a1220] rounded-2xl border border-slate-700/50 relative overflow-hidden group">
                 <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-overlay"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Globe className="w-32 h-32 text-cyan-900/50 group-hover:scale-110 transition-transform duration-700" />
                 </div>
                 <div className="absolute inset-0 p-8">
                   <div className="w-3 h-3 bg-rose-500 rounded-full absolute top-1/3 left-1/3 shadow-[0_0_15px_rgba(244,63,94,0.8)]"><span className="absolute -bottom-6 -left-4 text-xs font-bold text-slate-300">Buxoro</span></div>
                   <div className="w-3 h-3 bg-cyan-500 rounded-full absolute top-1/4 right-1/3 shadow-[0_0_15px_rgba(6,182,212,0.8)]"><span className="absolute -bottom-6 -left-4 text-xs font-bold text-slate-300">Toshkent</span></div>
                   <div className="w-3 h-3 bg-emerald-500 rounded-full absolute top-1/2 left-1/2 shadow-[0_0_15px_rgba(16,185,129,0.8)]"><span className="absolute -bottom-6 -left-4 text-xs font-bold text-slate-300">Samarqand</span></div>
                   <div className="w-3 h-3 bg-amber-500 rounded-full absolute top-1/3 right-1/4 shadow-[0_0_15px_rgba(245,158,11,0.8)]"><span className="absolute -bottom-6 -left-4 text-xs font-bold text-slate-300">Qo'qon</span></div>
                 </div>
                 <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-400">
                   *Vintage style map placeholder
                 </div>
               </div>
             )}

             {/* Slide 2: Figures */}
             {slide === 1 && (
               <div className="flex-grow grid grid-cols-3 gap-4 items-center">
                 {[
                   { name: "Mahmudxo'ja Behbudiy", years: "1875–1919" },
                   { name: "Abdulla Avloniy", years: "1878–1934" },
                   { name: "Munavvarqori", years: "1878–1931" }
                 ].map((figure, idx) => (
                   <div key={idx} className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 text-center hover:-translate-y-2 transition-transform duration-300 cursor-pointer group h-full flex flex-col">
                     <div className="w-full aspect-square bg-[#1a2333] rounded-xl mb-4 overflow-hidden relative border border-slate-600/50 group-hover:border-cyan-500/50 transition-colors">
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
                       <UserPlaceholder />
                     </div>
                     <h4 className="text-white font-bold text-sm leading-tight mb-1 mt-auto">{figure.name}</h4>
                     <p className="text-slate-500 text-xs font-mono">{figure.years}</p>
                   </div>
                 ))}
               </div>
             )}

             {/* Slide 3: Timeline */}
             {slide === 2 && (
               <div className="flex-grow flex flex-col justify-center px-4 relative">
                 <div className="absolute left-6 right-6 top-1/2 h-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-slate-700 -translate-y-1/2 rounded-full"></div>
                 <div className="flex justify-between relative z-10">
                   {[
                     { year: "1880–1890", text: "Yangi usul maktablari" },
                     { year: "1905–1917", text: "Matbuot va teatr" },
                     { year: "1917–1918", text: "Milliy uyg'onish" },
                     { year: "1918–1924", text: "Jadid kayfiyati" }
                   ].map((node, idx) => (
                     <div key={idx} className="flex flex-col items-center w-24 text-center group">
                       <div className="text-xs font-bold text-cyan-400 mb-4 bg-slate-900 px-2 py-1 rounded-md border border-cyan-900">{node.year}</div>
                       <div className={`w-5 h-5 rounded-full border-4 mb-4 transition-all duration-300 ${idx < 3 ? 'bg-cyan-500 border-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse' : 'bg-slate-900 border-slate-600'}`}></div>
                       <div className="text-xs text-slate-300 font-medium">{node.text}</div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Pagination Dots */}
             <div className="flex justify-center gap-2 mt-8">
               {[0, 1, 2].map(i => (
                 <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === slide ? "bg-cyan-400" : "bg-slate-600"}`} />
               ))}
               <div className="w-2 h-2 rounded-full bg-slate-800" />
               <div className="w-2 h-2 rounded-full bg-slate-800" />
               <div className="w-2 h-2 rounded-full bg-slate-800" />
             </div>
          </div>

          {/* Bottom Cards Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-4 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all group cursor-pointer">
              <div className="h-24 bg-[#1a2333] rounded-xl mb-3 flex items-center justify-center border border-slate-700 group-hover:border-cyan-500/30 overflow-hidden relative">
                <FileText className="w-8 h-8 text-amber-100/20" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute bottom-2 right-2 text-[10px] font-bold text-slate-500">1913</div>
              </div>
              <h4 className="text-white font-bold text-sm mb-1">"Turon" gazetasi</h4>
              <p className="text-slate-400 text-xs leading-relaxed">Jadidlar matbuot orqali xalqni ma'rifatga chaqirgan.</p>
            </div>
            
            <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-4 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all group cursor-pointer">
              <div className="h-24 bg-[#1a2333] rounded-xl mb-3 flex items-center justify-center border border-slate-700 relative group-hover:border-cyan-500/30 overflow-hidden">
                <Users className="w-12 h-12 text-slate-700" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-10 h-10 bg-cyan-500/90 rounded-full flex items-center justify-center text-white backdrop-blur group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">06:45</div>
              </div>
              <h4 className="text-white font-bold text-sm mb-1">Jadid maktabi darsi</h4>
              <p className="text-slate-400 text-xs leading-relaxed">Yangi usul maktablari – zamon talabiga javob bergan ta'lim.</p>
            </div>

            <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-4 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all group cursor-pointer">
              <div className="h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl mb-3 flex items-center justify-center border border-slate-700 group-hover:border-cyan-500/30 relative">
                <Book className="w-10 h-10 text-emerald-400/50" />
                <Lightbulb className="w-4 h-4 text-amber-400 absolute top-4 left-4 animate-bounce" />
                <GraduationCap className="w-5 h-5 text-indigo-400 absolute bottom-4 right-4" />
              </div>
              <h4 className="text-white font-bold text-sm mb-1">Jadidchilik maqsadi</h4>
              <p className="text-slate-400 text-xs leading-relaxed">Ta'lim, taraqqiyot, milliy ong va islohotlar.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Notes & Study Panel (1/4 width) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl border border-teal-500/30 p-6 flex-grow shadow-lg shadow-cyan-500/5 flex flex-col hover:-translate-y-1 transition-transform duration-300">
            
            <div className="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" /> AI qaydlari
              </h2>
              <button className="text-slate-400 hover:text-cyan-400 transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
              {/* Asosiy xulosalar */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Asosiy xulosalar</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Jadidlar ta'lim orqali millatni uyg'otmoqchi bo'lishgan.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Ular yangi usul (tovushli) maktablar ochishgan.</span>
                  </li>
                </ul>
              </div>

              {/* Imtihon eslatmasi */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Qisqa imtihon eslatmasi</h3>
                <p className="text-sm text-slate-300">Mahmudxo'ja Behbudiy harakat yetakchilaridan biri va "Padarkush" dramasi muallifi hisoblanadi.</p>
              </div>

              {/* Muhim nuqtalar */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Muhim nuqtalar</h3>
                <div className="space-y-2">
                  {['Yangi usul maktablari', 'Matbuot va adabiyot', 'Islohot va taraqqiyot', 'Milliy uyg\'onish'].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-sm text-slate-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mt-6 pt-6 border-t border-slate-700/50">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 transition-colors font-medium text-sm group">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bookmark className="w-4 h-4" />
                </div>
                Flashcard qilish
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-500/30 text-teal-300 hover:bg-teal-500/30 transition-colors font-medium text-sm group">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                Testga aylantirish
              </button>
            </div>

            {/* Bottom Input & Progress */}
            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <div className="relative mb-6">
                <textarea 
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder="Bugungi dars haqida o'z fikringni yoz..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none h-20 placeholder:text-slate-500"
                ></textarea>
                <button className="absolute bottom-3 right-3 w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center text-white hover:bg-cyan-500 transition-colors">
                  <Send className="w-4 h-4 -ml-0.5" />
                </button>
              </div>

              <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                {/* SVG Progress Ring */}
                <div className="relative w-12 h-12 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-700" strokeWidth="3" />
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-cyan-400 drop-shadow-[0_0_3px_rgba(34,211,238,0.8)]" strokeWidth="3" strokeDasharray="100" strokeDashoffset="30" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">70%</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">O'zlashtirish</div>
                  <div className="text-xs text-slate-400">darajangiz oshdi</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </div>
  );
}

// Helper component for vintage portrait placeholder
function UserPlaceholder() {
  return (
    <svg className="absolute inset-0 w-full h-full text-slate-700/30" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
