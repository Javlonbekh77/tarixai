import { UserProgress, ThreadPost } from "./types";

export const getProgress = (): UserProgress => {
  if (typeof window === "undefined") return { completedTopics: [], quizScores: {} };
  const saved = localStorage.getItem("tarixchi_progress");
  if (saved) return JSON.parse(saved);
  return { completedTopics: [], quizScores: {} };
};

export const saveQuizScore = (topicId: string, score: number) => {
  const progress = getProgress();
  progress.quizScores[topicId] = score;
  localStorage.setItem("tarixchi_progress", JSON.stringify(progress));
};

export const markTopicCompleted = (topicId: string) => {
  const progress = getProgress();
  if (!progress.completedTopics.includes(topicId)) {
    progress.completedTopics.push(topicId);
    localStorage.setItem("tarixchi_progress", JSON.stringify(progress));
  }
};

export const getThreads = (): ThreadPost[] => {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("tarixchi_threads");
  if (saved) return JSON.parse(saved);
  return [];
};

export const saveThread = (post: ThreadPost) => {
  const threads = getThreads();
  threads.unshift(post);
  localStorage.setItem("tarixchi_threads", JSON.stringify(threads));
};

export const likeThread = (postId: string) => {
  const threads = getThreads();
  const post = threads.find((p) => p.id === postId);
  if (post) {
    post.likes += 1;
    localStorage.setItem("tarixchi_threads", JSON.stringify(threads));
  }
};
