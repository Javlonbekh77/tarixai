"use client";
import { useState } from "react";
import { personas } from "@/data/personas";
import { Send, User, ChevronRight, MessageSquareQuote, Loader2 } from "lucide-react";

export function Interview() {
  const [selectedPersonaId, setSelectedPersonaId] = useState(personas[0].id);
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState<{ role: "user" | "persona"; text: string; provider?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedPersona = personas.find((p) => p.id === selectedPersonaId)!;

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim() || isLoading) return;
    setChat((prev) => [...prev, { role: "user", text: questionText }]);
    setQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/interview/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: selectedPersona.name,
          topic: "Tarix",
          question: questionText
        })
      });
      const data = await res.json();
      setChat((prev) => [...prev, { role: "persona", text: data.answer, provider: data.providerUsed }]);
    } catch (e) {
      setChat((prev) => [...prev, { role: "persona", text: "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.", provider: "error" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonaChange = (id: string) => {
    setSelectedPersonaId(id);
    setChat([]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm border border-amber-200">
        <strong>Important disclaimer:</strong> Bu tarixiy shaxs asosidagi AI simulyatsiya. Javoblar tarixiy kontekst, mashhur fikrlar va biografik ma'lumotlarga moslashtirilgan. Bu real shaxsning haqiqiy nutqi emas.
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Shaxsni tanlang</h2>
          {personas.map((persona) => (
            <button
              key={persona.id}
              onClick={() => handlePersonaChange(persona.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedPersonaId === persona.id
                  ? "bg-slate-900 text-white shadow-md border-slate-900"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <h3 className="font-bold text-lg">{persona.name}</h3>
              <p className={`text-sm ${selectedPersonaId === persona.id ? "text-slate-300" : "text-slate-500"}`}>
                {persona.role}
              </p>
            </button>
          ))}

          <div className="bg-white border rounded-2xl p-6 mt-8 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-2">Biografiya</h4>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">{selectedPersona.bio}</p>
            <div className="text-xs text-slate-400">
              <strong>Style:</strong> {selectedPersona.style}
            </div>
          </div>
        </div>

        <div className="md:col-span-8 flex flex-col h-[600px] bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
              {selectedPersona.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-slate-900">{selectedPersona.name}</h2>
              <p className="text-xs text-slate-500">AI Simulyatsiya</p>
            </div>
          </div>

          <div className="flex-grow p-6 overflow-y-auto space-y-6">
            {chat.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6">
                <MessageSquareQuote className="w-12 h-12 text-slate-200" />
                <div className="text-center">
                  <p className="text-slate-500 mb-4">Suhbatni boshlash uchun quyidagi savollardan birini tanlang:</p>
                  <div className="flex flex-col gap-2 w-full max-w-sm mx-auto">
                    {selectedPersona.suggestedQuestions.map((sq, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAsk(sq)}
                        className="p-3 text-sm text-left bg-slate-50 border rounded-xl hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors flex items-center justify-between"
                      >
                        {sq}
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              chat.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-slate-200 text-slate-600" : "bg-indigo-600 text-white font-bold text-sm"
                  }`}>
                    {msg.role === "user" ? <User className="w-5 h-5" /> : selectedPersona.name.charAt(0)}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[80%] whitespace-pre-wrap ${
                    msg.role === "user" ? "bg-slate-100 text-slate-800" : "bg-indigo-50 border border-indigo-100 text-indigo-900"
                  }`}>
                    {msg.text}
                    {msg.provider && msg.role === "persona" && (
                      <div className="text-[10px] uppercase tracking-wider text-indigo-400 mt-2 font-semibold">
                        {msg.provider === "mock" ? "Mock javob" : `AI: ${msg.provider}`}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                  {selectedPersona.name.charAt(0)}
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> O'ylayapman...
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk(query)}
                placeholder="Savolingizni yozing..."
                className="w-full bg-slate-50 border rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleAsk(query)}
                disabled={!query.trim() || isLoading}
                className="absolute right-2 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 -ml-0.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
