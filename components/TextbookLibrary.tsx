"use client";
import { useState } from "react";
import Link from "next/link";
import { topics } from "@/data/topics";
import { Clock, BarChart, ChevronRight } from "lucide-react";

export function TextbookLibrary() {
  const grades = ["6-sinf", "7-sinf", "8-sinf", "9-sinf", "10-sinf", "11-sinf"];
  const [selectedGrade, setSelectedGrade] = useState("8-sinf");

  const filteredTopics = topics.filter((t) => t.grade === selectedGrade);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Darsliklar</h1>
          <p className="text-slate-500 mt-1">O'zingizga kerakli sinf va mavzuni tanlang</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {grades.map((grade) => (
          <button
            key={grade}
            onClick={() => setSelectedGrade(grade)}
            className={`px-5 py-2.5 rounded-full whitespace-nowrap font-medium text-sm transition-colors ${
              selectedGrade === grade
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border hover:bg-slate-50"
            }`}
          >
            {grade}
          </button>
        ))}
      </div>

      {filteredTopics.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <div key={topic.id} className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                  {topic.grade}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{topic.title}</h3>
              <p className="text-slate-600 text-sm mb-6 flex-grow">{topic.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {topic.estimatedTime}
                </div>
                <div className="flex items-center gap-1">
                  <BarChart className="w-4 h-4" />
                  {topic.difficulty}
                </div>
              </div>

              <Link
                href={`/darsliklar/${topic.id}`}
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-xl transition-colors"
              >
                Darsni boshlash
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed">
          <p className="text-slate-500">Bu sinf uchun hozircha demo mavzular mavjud emas.</p>
          <button onClick={() => setSelectedGrade("8-sinf")} className="text-blue-600 font-medium mt-2 hover:underline">
            8-sinf mavzulariga qaytish
          </button>
        </div>
      )}
    </div>
  );
}
