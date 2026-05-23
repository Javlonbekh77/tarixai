"use client";
import { useState } from "react";
import { QuizQuestion } from "@/lib/types";
import { saveQuizScore, markTopicCompleted } from "@/lib/storage";
import { CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react";

export function Quiz({ topicId, questions }: { topicId: string; questions: QuizQuestion[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!questions || questions.length === 0) return <div>Test mavjud emas.</div>;

  const currentQ = questions[currentIdx];

  const handleSelect = (idx: number) => {
    if (showExplanation) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    if (idx === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((c) => c + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      const finalScore = score + (selectedAnswer === currentQ.correctIndex ? 1 : 0) - (showExplanation && selectedAnswer === currentQ.correctIndex ? 1 : 0);
      const percentage = Math.round((finalScore / questions.length) * 100);
      saveQuizScore(topicId, percentage);
      markTopicCompleted(topicId);
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="text-center p-8 bg-white border rounded-2xl shadow-sm space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Test yakunlandi!</h2>
        <div className="text-4xl font-extrabold text-blue-600">{percentage}%</div>
        <p className="text-slate-600">
          Siz {questions.length} ta savoldan {score} tasiga to'g'ri javob berdingiz.
        </p>
        <div className="p-4 bg-slate-50 rounded-xl mt-4">
          <p className="font-medium text-slate-700">
            {percentage >= 80 ? "Faktlarni yaxshi tushundingiz!" : "Sabab-oqibatni yanada chuqurroq o'rganish kerak."}
          </p>
          {percentage < 80 && (
            <p className="text-sm text-slate-500 mt-1">Keyingi tavsiya: Timeline bo'limini qayta ko'ring.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-sm font-medium text-slate-500 mb-2">
        <span>Savol {currentIdx + 1} / {questions.length}</span>
        <span>{Math.round((currentIdx / questions.length) * 100)}%</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-300" 
          style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        {currentQ.isImagePlaceholder && (
          <div className="w-full h-48 bg-slate-100 rounded-xl mb-6 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed">
            <ImageIcon className="w-8 h-8 mb-2" />
            <span className="text-sm">Rasmli savol placeholder</span>
          </div>
        )}
        <h3 className="text-xl font-semibold text-slate-900 mb-6">{currentQ.question}</h3>
        
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            let btnClass = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50";
            if (showExplanation) {
              if (idx === currentQ.correctIndex) {
                btnClass = "bg-emerald-50 border-emerald-500 text-emerald-800 font-medium";
              } else if (idx === selectedAnswer) {
                btnClass = "bg-rose-50 border-rose-500 text-rose-800";
              } else {
                btnClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-50";
              }
            } else if (selectedAnswer === idx) {
              btnClass = "bg-blue-50 border-blue-500 text-blue-800";
            }

            return (
              <button
                key={idx}
                disabled={showExplanation}
                onClick={() => handleSelect(idx)}
                className={`w-full p-4 rounded-xl border text-left flex justify-between items-center transition-all ${btnClass}`}
              >
                <span>{opt}</span>
                {showExplanation && idx === currentQ.correctIndex && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {showExplanation && idx === selectedAnswer && idx !== currentQ.correctIndex && <XCircle className="w-5 h-5 text-rose-600" />}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-6 p-4 bg-blue-50 text-blue-900 rounded-xl text-sm animate-in fade-in zoom-in-95">
            <span className="font-semibold block mb-1">Tushuntirish:</span>
            {currentQ.explanation}
          </div>
        )}

        {showExplanation && (
          <button
            onClick={handleNext}
            className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            {currentIdx < questions.length - 1 ? "Keyingi savol" : "Natijani ko'rish"}
          </button>
        )}
      </div>
    </div>
  );
}
