"use client";
import { useState } from "react";
import { TimelineEvent } from "@/lib/types";
import { HelpCircle } from "lucide-react";

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  if (!events || events.length === 0) {
    return <div className="text-slate-500">Timeline mavjud emas.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="relative border-l-2 border-blue-200 ml-4 space-y-8">
        {events.map((event) => (
          <div key={event.id} className="relative pl-8">
            <button
              onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
              className="absolute -left-2.5 top-1.5 w-5 h-5 bg-white border-2 border-blue-500 rounded-full hover:bg-blue-50 transition-colors"
            />
            <div
              className={`cursor-pointer transition-colors p-3 rounded-lg -ml-3 ${
                selectedEvent?.id === event.id ? "bg-blue-50" : "hover:bg-slate-50"
              }`}
              onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
            >
              <div className="text-sm font-bold text-blue-600 mb-1">{event.year}</div>
              <h4 className="text-lg font-semibold text-slate-900">{event.title}</h4>
            </div>
            
            {selectedEvent?.id === event.id && (
              <div className="mt-3 bg-white border rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                <p className="text-slate-700 mb-3">{event.explanation}</p>
                <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm flex gap-2">
                  <HelpCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-semibold block mb-1">Nega muhim?</span>
                    {event.whyImportant}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
