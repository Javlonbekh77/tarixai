"use client";
import { useState } from "react";
import { CauseNode } from "@/lib/types";
import { ArrowDown } from "lucide-react";

export function CauseMap({ nodes }: { nodes: CauseNode[] }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  if (!nodes || nodes.length === 0) {
    return <div className="text-slate-500">Xarita mavjud emas.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-center shadow-sm">
        <p className="text-sm">Endi o'ylab ko'ring: jadidlar nega aynan ta'limdan boshlagan?</p>
      </div>
      
      <div className="flex flex-col items-center">
        {nodes.map((node, index) => (
          <div key={node.id} className="flex flex-col items-center w-full max-w-sm">
            <button
              onClick={() => setSelectedNodeId(selectedNodeId === node.id ? null : node.id)}
              className={`w-full p-4 rounded-xl border text-center font-semibold transition-all ${
                selectedNodeId === node.id
                  ? "bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {node.title}
            </button>
            
            {selectedNodeId === node.id && (
              <div className="w-full mt-2 p-3 bg-indigo-50 text-indigo-800 text-sm rounded-lg animate-in fade-in zoom-in-95">
                {node.explanation}
              </div>
            )}

            {index < nodes.length - 1 && (
              <div className="py-2 text-slate-300">
                <ArrowDown className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
