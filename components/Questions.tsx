"use client";
import { useState } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";

export function Questions() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string; mode?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ask-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg, topic: "General", grade: "8-sinf" }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.answer, mode: data.mode }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.", mode: "error" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[80vh]">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Tarixchi AI ga savol bering</h1>
        <p className="text-slate-500 mt-2">Har qanday tarixiy mavzuda savol bering, AI sizga tushuntirib beradi.</p>
      </div>

      <div className="flex-grow bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Bot className="w-12 h-12 text-slate-300" />
              <p>Savollaringizni pastga yozing...</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user" ? "bg-blue-600 text-white" : "bg-indigo-100 text-indigo-600"
                }`}>
                  {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-4 rounded-2xl max-w-[85%] whitespace-pre-wrap ${
                  msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-50 border text-slate-800"
                }`}>
                  {msg.text}
                  {msg.mode === "fallback" && (
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-2 font-semibold">
                      MOCK JAVOB (API KEY YO'Q)
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border text-slate-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> O'ylanmoqda...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border-t">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Masalan: Jadidlar nega ta'limdan boshlagan?"
              className="w-full bg-white border rounded-full pl-6 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-2 bottom-2 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
