"use client";
import { useState, useEffect } from "react";
import { getThreads, saveThread, likeThread } from "@/lib/storage";
import { initialThreads } from "@/data/demoThreads";
import { ThreadPost } from "@/lib/types";
import { Heart, MessageCircle, Send } from "lucide-react";

export function Threads() {
  const [threads, setThreads] = useState<ThreadPost[]>([]);
  const [newPost, setNewPost] = useState("");

  useEffect(() => {
    let saved = getThreads();
    if (saved.length === 0) {
      initialThreads.forEach(t => saveThread(t));
      saved = getThreads();
    }
    setThreads(saved);
  }, []);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post: ThreadPost = {
      id: `t_${Date.now()}`,
      author: "Demo o'quvchi",
      content: newPost.trim(),
      likes: 0,
      date: new Date().toISOString().split("T")[0],
    };

    saveThread(post);
    setThreads(getThreads());
    setNewPost("");
  };

  const handleLike = (id: string) => {
    likeThread(id);
    setThreads(getThreads());
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tarixchi Threads</h1>
        <p className="text-slate-500 mt-2">Boshqa o'quvchilar bilan fikr almashing</p>
      </div>

      <div className="bg-white border rounded-2xl p-4 shadow-sm mb-8">
        <form onSubmit={handlePost} className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 shrink-0">
            D
          </div>
          <div className="flex-grow relative">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Fikringizni yozing..."
              className="w-full bg-slate-50 border rounded-xl p-3 pb-10 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none h-24"
            />
            <button
              type="submit"
              disabled={!newPost.trim()}
              className="absolute bottom-2 right-2 bg-slate-900 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              Ulashish <Send className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {threads.map((thread) => (
          <div key={thread.id} className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                {thread.author.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-slate-900">{thread.author}</div>
                <div className="text-xs text-slate-400">{thread.date}</div>
              </div>
            </div>
            
            <p className="text-slate-800 mb-4 whitespace-pre-wrap">{thread.content}</p>
            
            <div className="flex gap-6 text-sm font-medium text-slate-500">
              <button 
                onClick={() => handleLike(thread.id)}
                className="flex items-center gap-1.5 hover:text-pink-600 transition-colors"
              >
                <Heart className="w-4 h-4" /> {thread.likes}
              </button>
              <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                <MessageCircle className="w-4 h-4" /> Javob
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
