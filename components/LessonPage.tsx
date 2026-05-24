"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Coffee,
  Download,
  Lightbulb,
  Loader2,
  MessageCircle,
  Pause,
  Play,
  RefreshCw,
  Send,
  Sparkles,
  Star,
  Users,
  Volume2,
} from "lucide-react";
import { Topic } from "@/lib/types";
import type { LessonJson } from "@/lib/ai/schemas";
import type { ImageSearchResult } from "@/lib/media/imageSearch/types";

type AudioMode = "server_audio" | "async_audio" | "browser_fallback";

type SceneAudio = {
  providerUsed: string;
  audioUrl: string | null;
  mode: AudioMode;
  finalText: string;
  jobId?: string;
  status: "pending" | "processing" | "completed" | "failed" | "fallback";
};

type SceneMedia = {
  sceneId: number;
  audio?: SceneAudio;
  image?: {
    providerUsed: string;
    imageUrl: string;
    prompt: string;
    selectedImage?: ImageSearchResult;
    alternatives?: ImageSearchResult[];
    warning?: string;
  };
};

type PostLessonStage = "notes" | "quiz" | "extraQuiz" | "interview" | "done";

const lessonPlan = [
  { title: "1. Asosiy dars", time: "20:00", icon: Play },
  { title: "2. Tanaffus", time: "05:00", icon: Coffee },
  { title: "3. Savol-javob", time: "07:00", icon: MessageCircle },
  { title: "4. Mashhur inson bilan suhbat", time: "08:00", icon: Users },
  { title: "5. Test va mustahkamlash", time: "10:00", icon: ClipboardCheck },
];

const notesTabs = [
  "Asosiy xulosalar",
  "Muhim sanalar",
  "Sabab-oqibat",
  "Imtihon uchun",
  "1 gaplik xulosa",
];

export function LessonPage({ topic }: { topic: Topic }) {
  const [elapsed, setElapsed] = useState(0);
  const [activeTab, setActiveTab] = useState(notesTabs[0]);
  const [lesson, setLesson] = useState<LessonJson | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [providerUsed, setProviderUsed] = useState<string>("loading");
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCheckPrompt, setShowCheckPrompt] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [sceneMedia, setSceneMedia] = useState<Record<number, SceneMedia>>({});
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [isAudioPolling, setIsAudioPolling] = useState(false);
  const [showImageAlternatives, setShowImageAlternatives] = useState<number | null>(null);
  const [postLessonStage, setPostLessonStage] = useState<PostLessonStage>("notes");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [extraQuizAnswers, setExtraQuizAnswers] = useState<Record<string, number>>({});
  const [interviewQuestion, setInterviewQuestion] = useState("");
  const [interviewMessages, setInterviewMessages] = useState<Array<{ role: "user" | "persona"; text: string }>>([]);
  const [isInterviewLoading, setIsInterviewLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isSpeaking) return;

    const timer = window.setInterval(() => {
      setElapsed((current) => Math.min(current + 1, 20 * 60));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isSpeaking]);

  useEffect(() => {
    let cancelled = false;

    async function generateLesson() {
      setIsGenerating(true);
      try {
        const res = await fetch("/api/admin/generate-lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: topic.title,
            grade: topic.grade,
            sourceText: buildSourceText(topic),
          }),
        });
        const data = await res.json();
        if (!cancelled) {
          setLesson(data.lesson);
          setProviderUsed(data.providerUsed ?? "unknown");
          setActiveSceneIndex(0);
        }
      } catch {
        if (!cancelled) {
          setLesson(buildLocalLesson(topic));
          setProviderUsed("local-fallback");
        }
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    }

    generateLesson();

    return () => {
      cancelled = true;
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
    };
  }, [topic]);

  const lessonMinutes = 20;
  const totalSeconds = lessonMinutes * 60;
  const remainingSeconds = Math.max(totalSeconds - elapsed, 0);
  const elapsedPercent = Math.round((elapsed / totalSeconds) * 100);
  const displayTime = formatTime(remainingSeconds);

  const sections = topic.lessonSections.length
    ? topic.lessonSections
    : [
        {
          id: "overview",
          title: topic.title,
          content: topic.description,
        },
      ];

  const activeSection = sections[0];
  const scenes = lesson?.scenes ?? [];
  const activeScene = scenes[activeSceneIndex];
  const teacherSpeech = buildTutorSpeech(topic.title, activeScene?.teacherSpeech || activeSection.content || topic.description);
  const presentation = activeScene?.presentation;
  const activeMedia = activeScene ? sceneMedia[activeScene.sceneId] : undefined;
  const sceneProgress = scenes.length ? Math.round(((activeSceneIndex + 1) / scenes.length) * 100) : 0;
  const isLastScene = scenes.length > 0 && activeSceneIndex >= scenes.length - 1;

  const summaryPoints = useMemo(
    () => (lesson ? buildLessonSummaryPoints(lesson) : buildSummaryPoints(topic)),
    [lesson, topic],
  );
  const mainQuizQuestions = useMemo(() => buildPostLessonQuiz(topic, lesson), [lesson, topic]);
  const extraQuizQuestions = useMemo(() => buildExtraPracticeQuiz(topic, lesson), [lesson, topic]);
  const interviewPersona = useMemo(() => buildLessonPersona(topic, lesson), [lesson, topic]);

  function playServerAudio(audioUrl: string, onDone?: () => void) {
    audioRef.current?.pause();
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onplay = () => setIsSpeaking(true);
    audio.onended = () => {
      setIsSpeaking(false);
      onDone?.();
    };
    audio.onerror = () => {
      setIsSpeaking(false);
      onDone?.();
    };
    audio.play().catch(() => {
      setIsSpeaking(false);
      onDone?.();
    });
  }

  function speakBrowser(text: string, onDone?: () => void) {
    if (!("speechSynthesis" in window)) { onDone?.(); return; }
    window.speechSynthesis.cancel();
    const voice = pickBestVoice(window.speechSynthesis.getVoices());
    const chunks = splitSpeechIntoChunks(normalizeSpeechTextForTemplate(text));
    let chunkIndex = 0;

    function speakNextChunk() {
      const chunk = chunks[chunkIndex];
      if (!chunk) {
        setIsSpeaking(false);
        onDone?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunk);
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang || "uz-UZ";
      utterance.rate = getBrowserSpeechRate(voice);
      utterance.pitch = 0.96;
      utterance.volume = 1;
      utterance.onend = () => {
        chunkIndex += 1;
        window.setTimeout(speakNextChunk, 180);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        onDone?.();
      };
      window.speechSynthesis.speak(utterance);
    }

    setIsSpeaking(true);
    speakNextChunk();
  }

  function speakText(text = teacherSpeech, onDone?: () => void, audioUrl?: string | null) {
    if (audioUrl) { playServerAudio(audioUrl, onDone); return; }
    speakBrowser(text, onDone);
  }

  /** Poll /api/media/tts/status/[jobId] every 2s until audio is ready */
  function startPollingAudio(jobId: string, sceneId: number, fallbackText: string, onReady: (url: string) => void) {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    setIsAudioPolling(true);

    const MAX_POLLS = 45; // 90 seconds max
    let count = 0;

    pollTimerRef.current = setInterval(async () => {
      count++;
      try {
        const res = await fetch(`/api/media/tts/status/${jobId}`);
        const data = await res.json();

        if (data.status === "completed" && data.audioUrl) {
          clearInterval(pollTimerRef.current!);
          pollTimerRef.current = null;
          setIsAudioPolling(false);
          // Update scene media with completed audio
          setSceneMedia((prev) => ({
            ...prev,
            [sceneId]: {
              ...prev[sceneId],
              audio: {
                ...(prev[sceneId]?.audio as SceneAudio),
                status: "completed",
                audioUrl: data.audioUrl,
                mode: "server_audio",
              },
            },
          }));
          onReady(data.audioUrl);
        } else if (data.status === "failed" || count >= MAX_POLLS) {
          clearInterval(pollTimerRef.current!);
          pollTimerRef.current = null;
          setIsAudioPolling(false);
          speakBrowser(fallbackText, () => setShowCheckPrompt(true));
        }
      } catch {
        if (count >= MAX_POLLS) {
          clearInterval(pollTimerRef.current!);
          pollTimerRef.current = null;
          setIsAudioPolling(false);
          speakBrowser(fallbackText, () => setShowCheckPrompt(true));
        }
      }
    }, 2000);
  }

  function speakCurrentScene() {
    setShowCheckPrompt(false);
    setAnswer("");

    const audio = activeMedia?.audio;
    const text = audio?.finalText || teacherSpeech;

    // Already have a server audio URL — play it
    if (audio?.audioUrl) {
      speakText(text, () => setShowCheckPrompt(true), audio.audioUrl);
      return;
    }

    // Async job in progress — start polling
    if (audio?.mode === "async_audio" && audio?.jobId) {
      startPollingAudio(audio.jobId, activeScene?.sceneId ?? 0, text, (url) => {
        speakText(text, () => setShowCheckPrompt(true), url);
      });
      return;
    }

    // Browser fallback
    speakBrowser(text, () => setShowCheckPrompt(true));
  }

  function stopSpeaking() {
    audioRef.current?.pause();
    audioRef.current = null;
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }

  function goToNextScene() {
    setAnswer("");
    setQuestion("");
    setShowCheckPrompt(false);
    setShowImageAlternatives(null);
    if (isLastScene) {
      setLessonCompleted(true);
      setPostLessonStage("notes");
      return;
    }
    setActiveSceneIndex((current) => Math.min(current + 1, Math.max(scenes.length - 1, 0)));
  }

  async function askLessonQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    stopSpeaking();
    setIsAsking(true);
    setAnswer("");

    try {
      const res = await fetch("/api/lesson/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson?.id || topic.id,
          sceneId: activeScene?.sceneId ?? activeSceneIndex + 1,
          topic: topic.title,
          question: trimmedQuestion,
          currentSceneContext: teacherSpeech,
          studentLevel: "normal",
        }),
      });
      const data = await res.json();
      const nextAnswer = data.answer ?? "Javob tayyor bo'lmadi. Darsni davom ettiramiz.";
      setAnswer(nextAnswer);
      setQuestion("");
      speakText(nextAnswer);
    } catch {
      const fallback = "Hozir AI javob bera olmadi. Lekin darsni shu joydan davom ettirish mumkin.";
      setAnswer(fallback);
      speakText(fallback);
    } finally {
      setIsAsking(false);
    }
  }

  function selectAlternativeImage(sceneId: number, selectedImage: ImageSearchResult) {
    setSceneMedia((current) => {
      const currentMedia = current[sceneId];
      const image = currentMedia?.image;
      if (!image?.selectedImage) return current;

      const nextAlternatives = [image.selectedImage, ...(image.alternatives || [])]
        .filter((item) => item.id !== selectedImage.id)
        .slice(0, 6);

      return {
        ...current,
        [sceneId]: {
          ...currentMedia,
          image: {
            ...image,
            imageUrl: selectedImage.imageUrl,
            selectedImage,
            alternatives: nextAlternatives,
          },
        },
      };
    });
    setShowImageAlternatives(null);
  }

  async function askInterviewQuestion(questionText: string) {
    const trimmed = questionText.trim();
    if (!trimmed || isInterviewLoading) return;

    setInterviewMessages((current) => [...current, { role: "user", text: trimmed }]);
    setInterviewQuestion("");
    setIsInterviewLoading(true);

    try {
      const res = await fetch("/api/interview/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: interviewPersona.name,
          topic: topic.title,
          question: trimmed,
        }),
      });
      const data = await res.json();
      setInterviewMessages((current) => [
        ...current,
        { role: "persona", text: data.answer || "Bu savolga tarixiy kontekst asosida javob berishga harakat qilaman." },
      ]);
    } catch {
      setInterviewMessages((current) => [
        ...current,
        { role: "persona", text: "Hozir suhbat javobi tayyor bo'lmadi. Lekin savolni qayta berishingiz mumkin." },
      ]);
    } finally {
      setIsInterviewLoading(false);
    }
  }

  // Stop polling when component unmounts or scene changes
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [activeSceneIndex]);

  useEffect(() => {
    if (isGenerating || !lesson || !teacherSpeech || lessonCompleted) return;
    if (activeScene && !sceneMedia[activeScene.sceneId]) return;

    const timeout = window.setTimeout(() => {
      if (!answer) speakCurrentScene();
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    };
  }, [activeSceneIndex, activeScene, isGenerating, lesson, lessonCompleted, sceneMedia]);

  useEffect(() => {
    if (!lesson || !activeScene || sceneMedia[activeScene.sceneId]) return;

    let cancelled = false;
    const currentLessonId = lesson.id;
    const currentScene = activeScene;

    async function generateMedia() {
      setIsMediaLoading(true);
      try {
        const [audioRes, imageRes] = await Promise.all([
          fetch("/api/media/tts/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lessonId: currentLessonId,
              sceneId: currentScene.sceneId,
              text: currentScene.teacherSpeech,
            }),
          }),
          fetch("/api/media/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lessonId: currentLessonId,
              sceneId: currentScene.sceneId,
              topic: topic.title,
              sceneTitle: currentScene.presentation?.title || topic.title,
              prompt: currentScene.presentation?.imagePrompt || currentScene.presentation?.title || topic.title,
              title: currentScene.presentation?.title || topic.title,
              visualType: currentScene.presentation?.type || "presentation",
              description: currentScene.presentation?.description || topic.description,
            }),
          }),
        ]);
        const rawAudio = await audioRes.json();
        const image = await imageRes.json();
        if (!cancelled) {
          const normalizedImage = image
            ? {
                providerUsed: image.providerUsed ?? image.selectedImage?.provider ?? "placeholder",
                imageUrl: image.imageUrl ?? image.selectedImage?.imageUrl ?? "",
                prompt: image.prompt ?? "",
                selectedImage: image.selectedImage,
                alternatives: image.alternatives ?? [],
                warning: image.warning,
              }
            : undefined;

          const normalizedMedia: SceneMedia = {
            sceneId: currentScene.sceneId,
            audio: {
              providerUsed: rawAudio.providerUsed ?? "browser_fallback",
              audioUrl: rawAudio.audioUrl ?? null,
              mode: rawAudio.mode ?? "browser_fallback",
              finalText: rawAudio.finalText ?? currentScene.teacherSpeech ?? "",
              jobId: rawAudio.jobId,
              status: rawAudio.status ?? "fallback",
            },
            image: normalizedImage,
          };
          setSceneMedia((current) => ({
            ...current,
            [normalizedMedia.sceneId]: normalizedMedia,
          }));
        }
      } catch {
        if (!cancelled) {
          setSceneMedia((current) => ({
            ...current,
            [currentScene.sceneId]: { sceneId: currentScene.sceneId },
          }));
        }
      } finally {
        if (!cancelled) setIsMediaLoading(false);
      }
    }

    generateMedia();

    return () => {
      cancelled = true;
    };
  }, [activeScene, lesson, sceneMedia, topic.description, topic.title]);

  useEffect(() => {
    if (!showCheckPrompt || question.trim() || answer || isAsking || lessonCompleted) return;

    const timeout = window.setTimeout(() => {
      goToNextScene();
    }, 6500);

    return () => window.clearTimeout(timeout);
  }, [answer, isAsking, lessonCompleted, question, showCheckPrompt]);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0a0e1a] text-slate-300 antialiased">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_32%),radial-gradient(circle_at_70%_0%,rgba(16,185,129,0.09),transparent_28%),linear-gradient(135deg,#0a0e1a_0%,#111827_48%,#070a13_100%)]" />

      <header className="sticky top-0 z-50 h-14 border-b border-slate-800 bg-[#0a0e1a]/82 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between gap-3 px-4">
          <Link
            href="/darsliklar"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-3 text-sm font-semibold text-slate-200 transition hover:border-purple-400/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Orqaga
          </Link>

          <div className="min-w-0 text-center">
            <h1 className="truncate text-base font-extrabold text-white sm:text-xl">
              {topic.title}
            </h1>
            <div className="mt-0.5 flex items-center justify-center gap-2 text-xs font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)]" />
              {lessonCompleted ? "Dars tugadi" : "Dars davom etmoqda"}
            </div>
          </div>

          <div className="hidden min-w-[92px] text-right text-xs font-semibold text-slate-400 sm:block">
            {scenes.length ? `${activeSceneIndex + 1}/${scenes.length}` : "0/0"}
          </div>
        </div>
      </header>

      {isGenerating && (
        <div className="relative z-40 mx-auto mt-6 flex max-w-xl items-center gap-4 rounded-2xl border border-purple-400/30 bg-slate-900/90 p-5 text-slate-100 shadow-2xl shadow-purple-950/30">
          <Loader2 className="h-8 w-8 animate-spin text-purple-300" />
          <div>
            <div className="text-lg font-black text-white">Dars tayyorlanmoqda...</div>
            <p className="mt-1 text-sm text-slate-400">AI mavzuni sahnalarga ajratib, o'qituvchi matnini yozmoqda.</p>
          </div>
        </div>
      )}

      <main className="relative mx-auto grid max-w-[1440px] gap-3 px-3 py-3 sm:px-4 lg:min-h-[calc(100vh-56px)] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="space-y-3 lg:self-start">
          <section className="rounded-xl border border-violet-500/25 bg-[#13182c]/90 p-3 shadow-2xl shadow-purple-950/20 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              <Sparkles className="h-4 w-4 text-purple-300" />
              AI o'qituvchi
            </div>

            <div className="flex flex-col items-center">
              <TutorAvatar />
              <VoiceWave />
            </div>

            <div className="mt-2 max-h-28 overflow-hidden rounded-lg border border-slate-700/70 bg-slate-800/60 p-3 text-xs leading-relaxed text-slate-200">
              {isGenerating
                ? "Bir oz kuting, dars matni tayyorlanmoqda."
                : teacherSpeech.slice(0, 260)}
              {!isGenerating && teacherSpeech.length > 260 ? "..." : ""}
            </div>
          </section>

          <section className="rounded-xl border border-violet-500/20 bg-[#13182c]/90 p-3 shadow-xl shadow-purple-950/10">
            <button
              onClick={() => setIsPlanOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-2 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400"
            >
              <span className="inline-flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-purple-300" />
                Dars rejasi
              </span>
              <ChevronDown className={`h-4 w-4 transition ${isPlanOpen ? "rotate-180" : ""}`} />
            </button>

            {isPlanOpen && (
            <div className="relative mt-3 space-y-2">
              <div className="absolute left-4 top-7 bottom-7 w-px bg-gradient-to-b from-purple-500 via-slate-700 to-slate-800" />
              {lessonPlan.map((item, index) => {
                const Icon = item.icon;
                const active = getLessonPlanActiveIndex(lessonCompleted, postLessonStage) === index;

                return (
                  <button
                    key={item.title}
                    className={`relative grid w-full grid-cols-[32px_minmax(0,1fr)] items-center gap-2 rounded-xl p-2 text-left transition focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                      active
                        ? "border border-purple-500/25 bg-purple-500/10 shadow-lg shadow-purple-500/10"
                        : "hover:bg-slate-800/55"
                    }`}
                  >
                    <span
                      className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border ${
                        active
                          ? "border-purple-300 bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-[0_0_22px_rgba(168,85,247,0.45)]"
                          : "border-slate-700 bg-slate-900 text-slate-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className={`block truncate text-xs font-bold ${active ? "text-white" : "text-slate-400"}`}>
                        {item.title}
                      </span>
                      <span className={`mt-0.5 block text-[10px] ${active ? "text-emerald-400" : "text-slate-500"}`}>
                        {active ? "Jarayonda" : item.time}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-700/80 bg-slate-800/40 p-3">
            <div className="mb-2 flex items-end justify-between">
              <span className="text-xs font-medium text-slate-400">Progress</span>
              <span className="text-xl font-black text-white">{lessonCompleted ? 100 : sceneProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-900">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-1000"
                style={{ width: `${lessonCompleted ? 100 : sceneProgress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-slate-300">
              <Star className="h-3.5 w-3.5 text-yellow-300" />
              {lessonCompleted ? "Muvaffaqiyatli tugadi" : "Slaydlar ketma-ket o'qiladi"}
            </div>
          </section>
        </aside>

        <section className="min-w-0 space-y-2 lg:flex lg:min-h-0 lg:flex-col">
          <article className="group overflow-hidden rounded-xl border border-slate-700/60 bg-[#1a1625] shadow-2xl shadow-purple-950/30 transition hover:shadow-purple-900/30 lg:min-h-0 lg:flex-1">
            <div className="relative min-h-[330px] overflow-hidden bg-[#d8be86] text-[#24170e] lg:h-full lg:min-h-0">
              <PresentationVisual
                topicId={topic.id}
                sceneId={activeScene?.sceneId ?? activeSceneIndex + 1}
                imageUrl={activeMedia?.image?.imageUrl}
                isLoading={isMediaLoading}
                title={presentation?.title || topic.title}
                caption={presentation?.caption || presentation?.description || topic.description}
              />

              <div className="absolute right-3 top-3 rounded-full bg-slate-950/85 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                {scenes.length ? `${activeSceneIndex + 1} / ${scenes.length}` : "1 / 1"}
              </div>
            </div>

            <div className="border-t border-slate-800/80 bg-slate-950/55 px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex-1 text-[11px] text-slate-300">
                  {activeMedia?.image?.selectedImage ? (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="block truncate">{formatAttribution(activeMedia.image.selectedImage)}</span>
                      {activeMedia.image.selectedImage.sourceUrl ? (
                        <a
                          href={activeMedia.image.selectedImage.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-semibold text-purple-300 hover:text-purple-200"
                        >
                          Manba
                        </a>
                      ) : null}
                    </div>
                  ) : (
                    <span className="block truncate text-slate-500">Rasm manbasi tayyorlanmoqda</span>
                  )}
                </div>
                {activeMedia?.image?.alternatives?.length ? (
                  <button
                    onClick={() =>
                      setShowImageAlternatives((current) =>
                        current === (activeScene?.sceneId ?? 0) ? null : (activeScene?.sceneId ?? 0),
                      )
                    }
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-700 px-3 text-[11px] font-semibold text-slate-200 transition hover:border-purple-300 hover:text-white"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Boshqa rasm tanlash
                  </button>
                ) : null}
              </div>

              {showImageAlternatives === activeScene?.sceneId && activeMedia?.image?.alternatives?.length ? (
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {activeMedia.image.alternatives.map((alternative) => (
                    <button
                      key={alternative.id}
                      onClick={() => selectAlternativeImage(activeScene.sceneId, alternative)}
                      className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900/60 text-left transition hover:border-purple-300"
                    >
                      <div className="aspect-[16/9] overflow-hidden bg-slate-900">
                        <img
                          src={alternative.thumbnailUrl || alternative.imageUrl}
                          alt={alternative.title}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="p-2">
                        <div className="line-clamp-1 text-[11px] font-semibold text-white">{alternative.title}</div>
                        <div className="mt-0.5 text-[10px] text-slate-400">
                          {alternative.creator || alternative.provider}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </article>

          <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_170px]">
            <div className="rounded-lg border border-violet-500/20 bg-[#13182c]/90 p-2.5 shadow-xl shadow-purple-950/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={isSpeaking ? stopSpeaking : () => speakCurrentScene()}
                    disabled={lessonCompleted || isAudioPolling}
                    className="grid h-9 w-9 place-items-center rounded-full border border-slate-600 text-slate-200 transition hover:border-purple-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    aria-label={isSpeaking ? "Ovozni to'xtatish" : "Darsni ovozda o'qish"}
                  >
                    {isSpeaking ? <Pause className="h-4 w-4" /> : isAudioPolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={speakCurrentScene}
                    disabled={lessonCompleted || isAudioPolling}
                    className="grid h-9 w-9 place-items-center rounded-full border border-slate-600 text-slate-200 transition hover:border-purple-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    aria-label="Sahnani qayta eshitish"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      {isAudioPolling ? "Ovoz tayyorlanmoqda..." : "Dars vaqti"}
                    </div>
                    <div className="mt-0.5 flex items-end gap-1.5">
                      {isAudioPolling ? (
                        <span className="text-sm font-bold tabular-nums text-purple-300 animate-pulse">O'zbek audio...</span>
                      ) : (
                        <>
                          <span className="text-xl font-black tabular-nums text-white">{displayTime}</span>
                          <span className="pb-0.5 text-[11px] text-slate-500">/ {lessonMinutes}:00</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={goToNextScene}
                  disabled={!scenes.length || lessonCompleted}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-purple-500/50 px-3 text-xs font-bold text-purple-200 transition hover:bg-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <ChevronRight className="h-4 w-4" />
                  {isLastScene ? "Yakunlash" : "Keyingi"}
                </button>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-900">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${elapsedPercent}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg border border-violet-500/20 bg-[#13182c]/90 p-2.5">
              <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Hozirgi slayd</div>
              <div className="mt-0.5 line-clamp-1 text-xs font-bold leading-snug text-white">
                {presentation?.title || activeSection.title}
              </div>
              <div className="mt-0.5 text-[9px] font-semibold text-purple-200">
                {activeMedia?.image?.providerUsed ? `Image: ${activeMedia.image.providerUsed}` : `Lesson: ${providerUsed}`}
              </div>
            </div>
          </div>

          {!lessonCompleted && showCheckPrompt && (
          <div className="rounded-xl border border-violet-500/20 bg-slate-800/50 p-3">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-yellow-400/15 text-yellow-300">
                  <Lightbulb className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Tekshiruv</div>
                  <p className="mt-1 text-sm font-semibold text-slate-100">
                    Bu slaydni tushundingizmi? Savolingiz bo'lsa yozing, bo'lmasa dars avtomatik davom etadi.
                  </p>
                  {activeScene?.microQuestion?.question && (
                    <p className="mt-1 text-xs text-slate-400">{activeScene.microQuestion.question}</p>
                  )}
                </div>
              </div>
              <form onSubmit={askLessonQuestion} className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  className="min-h-11 flex-1 rounded-xl border border-slate-700 bg-slate-950/60 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-purple-400"
                  placeholder="Dars bo'yicha savol yozing..."
                />
                <button
                  disabled={isAsking || !question.trim()}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 px-6 text-sm font-bold text-white shadow-lg shadow-purple-600/25 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  {isAsking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Savol berish
                </button>
              </form>
              {answer && (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-relaxed text-emerald-50">
                  {answer}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => speakText(answer)}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-300/30 px-3 text-xs font-bold text-emerald-100"
                    >
                      <Volume2 className="h-4 w-4" />
                      Javobni eshitish
                    </button>
                    <button
                      onClick={() => {
                        setAnswer("");
                        goToNextScene();
                      }}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-purple-300/30 px-3 text-xs font-bold text-purple-100"
                    >
                      <Play className="h-4 w-4" />
                      Darsni davom ettirish
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {lessonCompleted && (
          <section className="rounded-xl border border-violet-500/20 bg-[#13182c]/90 p-4 shadow-2xl shadow-purple-950/20">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-200">
                  <Check className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-black text-white">Muvaffaqiyatli tugatdingiz</h2>
                  <p className="text-sm text-slate-500">AI notelar, sanalar va imtihon uchun eslatmalar tayyor</p>
                </div>
              </div>
              <BookOpen className="hidden h-10 w-10 text-purple-300/70 md:block" />
            </div>

            <div className="mt-6 flex gap-2 overflow-x-auto border-b border-slate-800">
              {[
                { id: "notes", label: "AI notelar" },
                { id: "quiz", label: "Test" },
                { id: "extraQuiz", label: "Qo'shimcha test" },
                { id: "interview", label: "Mashhur bilan suhbat" },
                { id: "done", label: "Yakun" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPostLessonStage(tab.id as PostLessonStage)}
                  className={`shrink-0 border-b-2 px-3 pb-3 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    postLessonStage === tab.id
                      ? "border-purple-400 text-purple-200"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {postLessonStage === "notes" && (
              <>
                <div className="mt-6 flex gap-2 overflow-x-auto border-b border-slate-800/80">
                  {notesTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`shrink-0 border-b-2 px-3 pb-3 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                        activeTab === tab ? "border-emerald-400 text-emerald-200" : "border-transparent text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="space-y-3">
                    {summaryPoints.map((point) => (
                      <div key={point} className="flex gap-3 rounded-xl bg-slate-900/35 p-3 text-sm leading-relaxed text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                  <ScrollIllustration />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ActionButton icon={Download} label="PDF yuklab olish" />
                  <ActionButton icon={BookOpen} label="Flashcard qilish" />
                  <button
                    onClick={() => setPostLessonStage("quiz")}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 px-4 text-sm font-bold text-white transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    Testni boshlash
                  </button>
                </div>
              </>
            )}

            {postLessonStage === "quiz" && (
              <PostLessonQuizPanel
                title="Dars testi"
                description="Asosiy tushunchalarni tekshiramiz. Har bir savol darsdagi muhim joyga bog'langan."
                questions={mainQuizQuestions}
                answers={quizAnswers}
                setAnswers={setQuizAnswers}
                onComplete={() => setPostLessonStage("extraQuiz")}
                completeLabel="Qo'shimcha testga o'tish"
              />
            )}

            {postLessonStage === "extraQuiz" && (
              <PostLessonQuizPanel
                title="Qo'shimcha testlar"
                description="Endi sabab-oqibat va tahlil savollari. Bu qism imtihon fikrlashini mustahkamlaydi."
                questions={extraQuizQuestions}
                answers={extraQuizAnswers}
                setAnswers={setExtraQuizAnswers}
                onComplete={() => setPostLessonStage("interview")}
                completeLabel="Mashhur bilan suhbatga o'tish"
              />
            )}

            {postLessonStage === "interview" && (
              <section className="mt-6 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-purple-500/15 text-xl font-black text-purple-100">
                    {interviewPersona.name.charAt(0)}
                  </div>
                  <h3 className="mt-3 text-lg font-black text-white">{interviewPersona.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-purple-200">{interviewPersona.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{interviewPersona.bio}</p>
                  <div className="mt-4 space-y-2">
                    {interviewPersona.suggestedQuestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => askInterviewQuestion(suggestion)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950/40 p-2 text-left text-xs font-semibold text-slate-300 transition hover:border-purple-400 hover:text-white"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex min-h-[360px] flex-col rounded-xl border border-slate-700 bg-slate-950/35">
                  <div className="border-b border-slate-800 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">AI simulyatsiya</div>
                    <div className="mt-1 text-sm text-slate-300">Savol bering, tarixiy shaxs uslubida javob olasiz.</div>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {interviewMessages.length === 0 ? (
                      <div className="grid h-full place-items-center text-center text-sm text-slate-500">
                        Chapdagi savollardan birini tanlang yoki o'zingiz savol yozing.
                      </div>
                    ) : (
                      interviewMessages.map((message, index) => (
                        <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[82%] rounded-2xl p-3 text-sm leading-relaxed ${
                              message.role === "user"
                                ? "bg-purple-600 text-white"
                                : "border border-slate-700 bg-slate-900 text-slate-200"
                            }`}
                          >
                            {message.text}
                          </div>
                        </div>
                      ))
                    )}
                    {isInterviewLoading && (
                      <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-2 text-xs font-bold text-purple-100">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Javob tayyorlanmoqda
                      </div>
                    )}
                  </div>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      askInterviewQuestion(interviewQuestion);
                    }}
                    className="flex gap-2 border-t border-slate-800 p-3"
                  >
                    <input
                      value={interviewQuestion}
                      onChange={(event) => setInterviewQuestion(event.target.value)}
                      className="min-h-10 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-purple-400"
                      placeholder="Savolingizni yozing..."
                    />
                    <button
                      disabled={!interviewQuestion.trim() || isInterviewLoading}
                      className="grid h-10 w-10 place-items-center rounded-lg bg-purple-600 text-white disabled:opacity-50"
                      aria-label="Savol yuborish"
                    >
                      {isInterviewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </form>
                  <div className="flex justify-end border-t border-slate-800 p-3">
                    <button
                      onClick={() => setPostLessonStage("done")}
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-black text-slate-950"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Yakuniy xulosaga o'tish
                    </button>
                  </div>
                </div>
              </section>
            )}

            {postLessonStage === "done" && (
              <section className="mt-6 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400 text-slate-950">
                    <CheckCircle2 className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-white">Dars to'liq yakunlandi</h3>
                    <p className="text-sm text-emerald-100/80">Asosiy dars, testlar va suhbat bosqichi tugadi.</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    `Asosiy test: ${calculateQuizScore(mainQuizQuestions, quizAnswers)}%`,
                    `Qo'shimcha test: ${calculateQuizScore(extraQuizQuestions, extraQuizAnswers)}%`,
                    `Suhbat savollari: ${interviewMessages.filter((message) => message.role === "user").length}`,
                  ].map((item) => (
                    <div key={item} className="rounded-xl border border-emerald-300/20 bg-slate-950/35 p-3 text-sm font-bold text-emerald-50">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setLessonCompleted(false);
                      setActiveSceneIndex(0);
                      setQuizAnswers({});
                      setExtraQuizAnswers({});
                      setInterviewMessages([]);
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-600 px-4 text-sm font-bold text-slate-200"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Darsni qayta boshlash
                  </button>
                  <Link
                    href="/darsliklar"
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 px-4 text-sm font-bold text-white"
                  >
                    <BookOpen className="h-4 w-4" />
                    Boshqa darslar
                  </Link>
                </div>
              </section>
            )}
          </section>
          )}
        </section>
      </main>

      <style jsx>{`
        @keyframes floatTutor {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        @keyframes wavePulse {
          0%, 100% { transform: scaleY(0.35); opacity: 0.55; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function TutorAvatar() {
  return (
    <div className="relative h-32 w-32" style={{ animation: "floatTutor 4s ease-in-out infinite" }}>
      <div className="absolute inset-x-5 bottom-0 h-20 rounded-[1.5rem] bg-gradient-to-br from-cyan-300 to-teal-500 shadow-2xl shadow-purple-500/20" />
      <div className="absolute left-1/2 top-1 h-20 w-20 -translate-x-1/2 rounded-full bg-[#f2c49e] shadow-lg">
        <div className="absolute -top-2 left-3 right-3 h-8 rounded-t-full bg-[#2a1b14]" />
        <div className="absolute left-4 top-9 h-2.5 w-2.5 rounded-full bg-slate-900" />
        <div className="absolute right-4 top-9 h-2.5 w-2.5 rounded-full bg-slate-900" />
        <div className="absolute left-2.5 top-8 h-7 w-7 rounded-full border-2 border-slate-700" />
        <div className="absolute right-2.5 top-8 h-7 w-7 rounded-full border-2 border-slate-700" />
        <div className="absolute left-[36px] top-[43px] h-0.5 w-5 bg-slate-700" />
        <div className="absolute bottom-5 left-1/2 h-2 w-8 -translate-x-1/2 rounded-full border-b-2 border-rose-700" />
      </div>
      <div className="absolute bottom-5 left-9 h-12 w-9 rotate-[-18deg] rounded-full bg-cyan-300" />
      <div className="absolute bottom-6 right-5 h-12 w-7 rotate-[28deg] rounded-full bg-cyan-300" />
      <div className="absolute bottom-5 left-1/2 h-14 w-12 -translate-x-1/2 rounded-t-2xl bg-white" />
      <div className="absolute bottom-11 left-1/2 h-9 w-3 -translate-x-1/2 bg-purple-500" />
    </div>
  );
}

function VoiceWave() {
  return (
    <div className="mt-3 flex h-9 items-center gap-1.5">
      {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
        <span
          key={bar}
          className="h-8 w-2 origin-center rounded-full bg-gradient-to-t from-purple-500 to-violet-300"
          style={{
            animation: "wavePulse 1.1s ease-in-out infinite",
            animationDelay: `${bar * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

function PresentationVisual({
  topicId,
  sceneId,
  imageUrl,
  isLoading,
  title,
  caption,
}: {
  topicId: string;
  sceneId: number;
  imageUrl?: string;
  isLoading: boolean;
  title: string;
  caption: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const assetPath = imageUrl || `/lesson-assets/${topicId}/scene-${sceneId}.png`;

  useEffect(() => {
    setImageFailed(false);
  }, [assetPath]);

  return (
    <div className="relative h-full min-h-[330px] overflow-hidden bg-[#111827] shadow-inner">
      {!imageFailed && (
        <>
          <img
            src={assetPath}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-xl"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.20),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.62),rgba(17,24,39,0.32),rgba(2,6,23,0.68))]" />
          <div className="absolute inset-0 p-2 sm:p-3">
            <img
              src={assetPath}
              alt={title}
              onError={() => setImageFailed(true)}
              className="h-full w-full rounded-lg object-contain drop-shadow-2xl"
            />
          </div>
        </>
      )}
      {imageFailed && <VintageLessonArt topic={title} />}
      {isLoading && (
        <div className="absolute inset-0 grid place-items-center bg-slate-950/50 text-white backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-full border border-white/20 bg-slate-950/70 px-4 py-2 text-sm font-bold">
            <Loader2 className="h-4 w-4 animate-spin" />
            Rasm tayyorlanmoqda
          </div>
        </div>
      )}
    </div>
  );
}

function VintageLessonArt({ topic }: { topic: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#c99651]/30">
      <div className="absolute left-8 top-10 h-48 w-28 rounded-t-full border-4 border-[#70421f] bg-[#b8793d]/55" />
      <div className="absolute left-14 top-4 h-56 w-9 rounded-t-full bg-[#6a3f24]" />
      <div className="absolute left-6 top-24 h-28 w-36 rounded-t-[4rem] border-4 border-[#70421f] bg-[#d7a968]/70" />
      <div className="absolute right-12 top-10 h-28 w-40 rounded-t-full border-4 border-[#70421f] bg-[#deb879]/80" />
      <div className="absolute right-20 top-4 h-16 w-16 rounded-full bg-[#c58b44]" />
      <div className="absolute bottom-12 left-1/2 h-28 w-56 -translate-x-1/2 rotate-[-5deg] rounded-xl border border-[#6b3d1c]/30 bg-[#f4dfac] shadow-xl">
        <div className="absolute inset-y-4 left-1/2 w-px bg-[#80552e]/35" />
        <div className="absolute left-5 top-6 h-1.5 w-20 rounded-full bg-[#8a5b2d]/45" />
        <div className="absolute left-5 top-11 h-1.5 w-16 rounded-full bg-[#8a5b2d]/35" />
        <div className="absolute right-5 top-7 h-1.5 w-20 rounded-full bg-[#8a5b2d]/45" />
        <div className="absolute right-5 top-12 h-1.5 w-14 rounded-full bg-[#8a5b2d]/35" />
      </div>
      <div className="absolute bottom-16 right-10 rotate-6 rounded border-2 border-[#3b2413] bg-[#f5e7bf] px-5 py-4 text-center shadow-xl">
        <div className="text-sm font-black tracking-[0.18em] text-[#3b2413]">TARAQQIY</div>
        <div className="mt-2 h-1 w-24 rounded bg-[#7a5028]/45" />
        <div className="mt-1 h-1 w-20 rounded bg-[#7a5028]/35" />
      </div>
      <div className="absolute bottom-8 left-12 h-2 w-32 rotate-[-25deg] rounded-full bg-[#3b2413]" />
      <div className="absolute bottom-16 left-36 h-10 w-10 rounded-full border-4 border-[#3b2413]" />
      <div className="absolute left-6 bottom-5 rounded-full bg-[#3b2413]/80 px-3 py-1 text-xs font-bold text-[#ffe7aa]">
        {topic}
      </div>
    </div>
  );
}

function ScrollIllustration() {
  return (
    <div className="relative hidden min-h-[230px] overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/40 lg:block">
      <div className="absolute left-8 top-8 h-40 w-48 rotate-[-5deg] rounded-2xl border border-amber-900/35 bg-gradient-to-br from-amber-100 to-amber-300 shadow-xl" />
      <div className="absolute left-14 top-14 h-2 w-28 rounded bg-amber-900/35" />
      <div className="absolute left-14 top-24 h-2 w-36 rounded bg-amber-900/25" />
      <div className="absolute left-14 top-34 h-2 w-24 rounded bg-amber-900/25" />
      <div className="absolute bottom-12 right-12 h-2 w-28 rotate-[-30deg] rounded-full bg-slate-300" />
      <div className="absolute bottom-16 right-20 h-8 w-8 rounded-full bg-purple-400/70 blur-sm" />
      <Sparkles className="absolute right-8 top-9 h-7 w-7 text-purple-300" />
      <Star className="absolute bottom-8 left-12 h-5 w-5 text-yellow-300" />
    </div>
  );
}

function formatAttribution(image: ImageSearchResult) {
  const creator = image.creator || image.provider;
  const license = image.license || "source";
  return `Image: ${image.title} - ${creator}, ${license}`;
}

function ActionButton({
  icon: Icon,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-600 px-4 text-sm font-bold text-slate-300 transition hover:border-purple-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400">
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function PostLessonQuizPanel({
  title,
  description,
  questions,
  answers,
  setAnswers,
  onComplete,
  completeLabel,
}: {
  title: string;
  description: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
  answers: Record<string, number>;
  setAnswers: (next: Record<string, number>) => void;
  onComplete: () => void;
  completeLabel: string;
}) {
  const answeredCount = questions.filter((question) => answers[question.id] !== undefined).length;
  const score = calculateQuizScore(questions, answers);
  const isComplete = answeredCount === questions.length;

  return (
    <section className="mt-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-black text-white">{title}</h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">{description}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-right">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Natija</div>
          <div className="text-2xl font-black text-purple-200">{score}%</div>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-900">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-purple-400 transition-all"
          style={{ width: `${Math.round((answeredCount / Math.max(questions.length, 1)) * 100)}%` }}
        />
      </div>

      <div className="grid gap-3">
        {questions.map((question, index) => {
          const selected = answers[question.id];
          const hasAnswered = selected !== undefined;

          return (
            <div key={question.id} className="rounded-xl border border-slate-700 bg-slate-900/35 p-4">
              <div className="mb-3 flex items-start gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-purple-500/15 text-xs font-black text-purple-100">
                  {index + 1}
                </span>
                <h4 className="text-sm font-bold leading-relaxed text-white">{question.question}</h4>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {question.options.map((option, optionIndex) => {
                  const isCorrect = optionIndex === question.correctIndex;
                  const isSelected = optionIndex === selected;
                  const className = hasAnswered
                    ? isCorrect
                      ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-50"
                      : isSelected
                        ? "border-rose-400/70 bg-rose-400/10 text-rose-50"
                        : "border-slate-700 bg-slate-950/35 text-slate-500"
                    : "border-slate-700 bg-slate-950/35 text-slate-200 hover:border-purple-400";

                  return (
                    <button
                      key={option}
                      onClick={() => !hasAnswered && setAnswers({ ...answers, [question.id]: optionIndex })}
                      disabled={hasAnswered}
                      className={`flex min-h-11 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${className}`}
                    >
                      <span>{option}</span>
                      {hasAnswered && isCorrect ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>
              {hasAnswered && (
                <div className="mt-3 rounded-lg border border-blue-300/20 bg-blue-400/10 p-3 text-xs leading-relaxed text-blue-50">
                  {question.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/35 p-4">
        <div className="text-sm font-semibold text-slate-300">
          {answeredCount} / {questions.length} ta savol bajarildi
        </div>
        <button
          onClick={onComplete}
          disabled={!isComplete}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 px-4 text-sm font-bold text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {completeLabel}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function pickBestVoice(voices: SpeechSynthesisVoice[]) {
  const preferred = [
    "uz-UZ",
    "uz",
    "tr-TR",
    "tr",
    "az-AZ",
    "az",
    "ru-RU",
    "ru",
    "en-US",
    "en",
  ];

  for (const lang of preferred) {
    const voice = voices.find((item) => item.lang.toLowerCase().startsWith(lang.toLowerCase()));
    if (voice) return voice;
  }

  return voices[0] ?? null;
}

function normalizeSpeechText(text: string) {
  return text
    .replace(/[–—]/g, ", ")
    .replace(/['‘’`]/g, "")
    .replace(/\bXIX\b/g, "o'n to'qqizinchi")
    .replace(/\bXX\b/g, "yigirmanchi")
    .replace(/\bAI\b/g, "sun'iy intellekt")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSpeechTextForTemplate(text: string) {
  return normalizeSpeechText(text)
    .replace(/[–—]/g, ". ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’`]/g, "'")
    .replace(/\bXVIII\b/g, "o'n sakkizinchi")
    .replace(/\bXVI\b/g, "o'n oltinchi")
    .replace(/\bMahmudxo'ja\b/g, "Mahmud xo'ja")
    .replace(/\bBehbudiy\b/g, "Beh bu diy")
    .replace(/\bMovarounnahr\b/g, "Movaroun nahr")
    .replace(/\b(\d{4})-yillar\b/g, "$1 yillar")
    .replace(/\b(\d{4})-yil\b/g, "$1 yil")
    .replace(/([.!?])\s*/g, "$1 ")
    .replace(/;\s*/g, ". ")
    .replace(/:\s*/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSpeechIntoChunks(text: string) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > 230) {
      if (current) chunks.push(current);
      current = sentence;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);
  return chunks.length ? chunks : [text];
}

function getBrowserSpeechRate(voice: SpeechSynthesisVoice | null) {
  const lang = voice?.lang.toLowerCase() || "";
  if (lang.startsWith("uz")) return 0.9;
  if (lang.startsWith("tr") || lang.startsWith("az")) return 0.84;
  if (lang.startsWith("ru")) return 0.78;
  return 0.76;
}

function buildTutorSpeech(topicTitle: string, baseSpeech: string) {
  const speech = baseSpeech.trim();
  if (speech.length > 520) return speech;

  return [
    speech,
    `Endi buni sodda qilib bog'laymiz: ${topicTitle} mavzusida eng muhim narsa voqeani yodlash emas, uning sababini ko'rishdir.`,
    "Avval muammo paydo bo'ladi, keyin odamlar shu muammoga javob izlaydi, oxirida jamiyatda yangi fikr yoki harakat tug'iladi.",
    "Shu slaydda aynan qaysi muammo, qaysi yechim va qaysi oqibat borligini ajratib olishga harakat qiling.",
  ].join(" ");
}

function buildSummaryPoints(topic: Topic) {
  const fromSections = topic.lessonSections.slice(0, 3).map((section) => section.content);
  const fromTimeline = topic.timeline.slice(0, 1).map((event) => `${event.year}: ${event.title}. ${event.whyImportant}`);
  const fromCause = topic.causeMap.slice(0, 1).map((node) => `${node.title}: ${node.explanation}`);

  return [
    ...fromSections,
    ...fromTimeline,
    ...fromCause,
    `${topic.title} mavzusini tushunish uchun asosiy savol: bu jarayon jamiyat hayotiga qanday ta'sir qilgan?`,
  ].slice(0, 5);
}

function getLessonPlanActiveIndex(lessonCompleted: boolean, stage: PostLessonStage) {
  if (!lessonCompleted) return 0;
  if (stage === "interview") return 3;
  if (stage === "quiz" || stage === "extraQuiz" || stage === "done") return 4;
  return 2;
}

function buildPostLessonQuiz(topic: Topic, lesson: LessonJson | null) {
  const lessonQuiz = lesson?.quiz?.length
    ? lesson.quiz.map((question) => ({
        id: question.id,
        question: question.question,
        options: question.options,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
      }))
    : [];

  if (lessonQuiz.length) return lessonQuiz.slice(0, 6);

  return topic.quiz.slice(0, 6).map((question) => ({
    id: question.id,
    question: question.question,
    options: question.options,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
  }));
}

function buildExtraPracticeQuiz(topic: Topic, lesson: LessonJson | null) {
  const firstCause = topic.causeMap[0]?.title || "Sabab";
  const firstResult = topic.causeMap[topic.causeMap.length - 1]?.title || "Oqibat";
  const keyTakeaway = lesson?.aiNotes.keyTakeaways[0] || topic.description;

  return [
    {
      id: "extra-cause",
      question: `${topic.title} mavzusida eng muhim sabab-oqibat bog'lanishi qaysi?`,
      options: [
        `${firstCause} -> ${firstResult}`,
        "Faqat sanalarni yodlash -> mavzu tugaydi",
        "Tasodifiy voqea -> hech qanday natija yo'q",
      ],
      correctIndex: 0,
      explanation: "Tarixiy jarayonni tushunish uchun sabab va oqibatni birga ko'rish kerak.",
    },
    {
      id: "extra-analysis",
      question: "Darsdan keyingi eng yaxshi tahliliy xulosa qaysi?",
      options: [
        "Tarixiy jarayonlar odamlar fikri, ehtiyoji va qarori bilan bog'liq.",
        "Tarixda faqat bitta voqea muhim bo'ladi.",
        "Manbalar va dalillar kerak emas.",
      ],
      correctIndex: 0,
      explanation: "Tahliliy fikrlash voqeani yodlashdan ko'ra chuqurroq: u sabab, dalil va natijani bog'laydi.",
    },
    {
      id: "extra-key",
      question: "Quyidagi fikrlardan qaysi biri dars mazmuniga eng yaqin?",
      options: [
        keyTakeaway,
        "Bu mavzuda jamiyat hayotiga ta'sir bo'lmagan.",
        "Bu mavzu faqat bitta shaxs bilan cheklanadi.",
      ],
      correctIndex: 0,
      explanation: "Bu javob darsdagi asosiy xulosani ifodalaydi.",
    },
  ];
}

function buildLessonPersona(topic: Topic, lesson: LessonJson | null) {
  const isJadid = topic.id.includes("jadid");
  return {
    name: lesson?.interview.persona || (isJadid ? "Mahmudxo'ja Behbudiy" : "Tarixiy shaxs"),
    role: isJadid ? "Jadid ma'rifatparvari" : "Tarixiy suhbatdosh",
    bio:
      lesson?.interview.biographyShort ||
      (isJadid
        ? "Turkiston jadidchilik harakatining yetakchilaridan biri, muallim, dramaturg va publitsist."
        : topic.description),
    suggestedQuestions: lesson?.interview.suggestedQuestions?.length
      ? lesson.interview.suggestedQuestions.slice(0, 4)
      : [
          "Bu mavzudan eng muhim saboq nima?",
          "O'sha davr odamlari nimadan xavotirda edi?",
          "Bugungi yoshlar bundan qanday xulosa chiqarishi kerak?",
        ],
  };
}

function calculateQuizScore(
  questions: Array<{ id: string; correctIndex: number }>,
  answers: Record<string, number>,
) {
  if (!questions.length) return 0;
  const correct = questions.filter((question) => answers[question.id] === question.correctIndex).length;
  return Math.round((correct / questions.length) * 100);
}

function buildLessonSummaryPoints(lesson: LessonJson) {
  return [
    ...lesson.aiNotes.keyTakeaways,
    ...lesson.aiNotes.importantDates,
    ...lesson.aiNotes.causeEffectSummary,
    lesson.aiNotes.oneSentenceSummary,
  ].filter(Boolean).slice(0, 5);
}

function buildSourceText(topic: Topic) {
  const sections = topic.lessonSections
    .map((section) => `${section.title}: ${section.content}`)
    .join("\n");
  const timeline = topic.timeline
    .map((event) => `${event.year}: ${event.title}. ${event.explanation} ${event.whyImportant}`)
    .join("\n");
  const causes = topic.causeMap
    .map((node) => `${node.title}: ${node.explanation}`)
    .join("\n");

  return [
    topic.description,
    sections,
    timeline,
    causes,
  ].filter(Boolean).join("\n\n");
}

function buildLocalLesson(topic: Topic): LessonJson {
  const sections = topic.lessonSections.length ? topic.lessonSections : getFallbackLessonSections(topic);

  return {
    id: topic.id,
    title: topic.title,
    grade: topic.grade,
    mission: `${topic.title} mavzusini sabab, jarayon va oqibatlar orqali tushunish`,
    duration: {
      lessonMinutes: 20,
      breakMinutes: 5,
      qaMinutes: 5,
      interviewMinutes: 5,
      threadsMinutes: 5,
      pauseOnQuestion: true,
    },
    gamification: {
      xpReward: 100,
      badges: ["Dars boshlandi"],
      league: "Demo",
      streakReward: 0,
    },
    scenes: sections.slice(0, 8).map((section, index) => ({
      sceneId: index + 1,
      timeRange: `${String(index * 2).padStart(2, "0")}:00 - ${String((index + 1) * 2).padStart(2, "0")}:00`,
      estimatedSeconds: 120,
      teacherSpeech: [
        `${section.title}. ${section.content}`,
        "Bu qismni sabab, jarayon va oqibat sifatida tasavvur qiling.",
        "Avval vaziyat qanday bo'lganini ko'ramiz, keyin shu vaziyat nimani o'zgartirishga majbur qilganini tushunamiz.",
      ].join(" "),
      presentation: {
        type: getFallbackVisualType(topic, section.title, index),
        title: section.title,
        description: section.content,
        assetSuggestion: getFallbackImagePrompt(topic, section.title),
        imagePrompt: getFallbackImagePrompt(topic, section.title),
        animationIdea: "Matn va rasm navbat bilan almashadi",
        caption: section.content,
      },
      microQuestion: {
        question: `${section.title} bo'yicha eng muhim xulosa nima?`,
        options: [],
        correctIndex: 0,
        explanation: section.content,
      },
    })),
    breakSection: {
      durationMinutes: 5,
      activitySuggestion: "Qisqa tanaffus qiling va asosiy sabablarni eslab ko'ring.",
    },
    qaPrompts: [`${topic.title} nima uchun muhim?`],
    interview: {
      persona: "Tarixiy shaxs",
      disclaimer: "Bu tarixiy shaxs asosidagi AI simulyatsiya.",
      biographyShort: topic.description,
      suggestedQuestions: [],
      sampleAnswers: [],
    },
    threads: {
      prompt: "Bugungi darsdan eng muhim xulosangiz nima?",
      samplePosts: [],
    },
    aiNotes: {
      keyTakeaways: sections.slice(0, 3).map((section) => section.content),
      examTips: ["Sabab, voqea va oqibatni alohida yodda saqlang."],
      importantDates: topic.timeline.slice(0, 3).map((event) => `${event.year}: ${event.title}`),
      causeEffectSummary: topic.causeMap.slice(0, 3).map((node) => `${node.title}: ${node.explanation}`),
      oneSentenceSummary: topic.description,
    },
    timeline: topic.timeline.map((event) => ({
      year: event.year,
      title: event.title,
      explanation: event.explanation,
    })),
    causeEffect: topic.causeMap.map((node) => ({
      title: node.title,
      explanation: node.explanation,
    })),
    quiz: topic.quiz.map((question) => ({
      ...question,
      skill: "fact",
    })),
    flashcards: sections.slice(0, 5).map((section) => ({
      front: section.title,
      back: section.content,
    })),
  };
}

function getFallbackLessonSections(topic: Topic) {
  const normalized = topic.id.toLowerCase();

  if (normalized.includes("amir-temur")) {
    return [
      {
        id: "map",
        title: "Temuriylar saltanati xaritasi",
        content:
          "Amir Temur davlati Movarounnahrdan boshlab keng hududlarni birlashtirdi; markaziy boshqaruv, harbiy tartib va savdo yo'llari saltanat kuchining asosiga aylandi.",
      },
      {
        id: "capital",
        title: "Samarqand - siyosiy va madaniy markaz",
        content:
          "Samarqand Temur davrida bunyodkorlik, ilm-fan va diplomatiya markaziga aylandi; me'moriy obidalar davlat qudratini ko'rsatib turardi.",
      },
      {
        id: "governance",
        title: "Boshqaruv va harbiy tartib",
        content:
          "Davlat ulus, viloyat va harbiy tuzilmalar orqali boshqarildi; intizom, mas'uliyat va tezkor aloqa Temur siyosatining muhim qismi edi.",
      },
      {
        id: "legacy",
        title: "Temuriylar merosi",
        content:
          "Amir Temur asos solgan siyosiy va madaniy an'analar keyingi Temuriylar davrida ilm-fan, me'morchilik va davlat boshqaruviga kuchli ta'sir ko'rsatdi.",
      },
    ];
  }

  if (normalized.includes("xonlik")) {
    return [
      {
        id: "map",
        title: "Buxoro, Xiva va Qo'qon xaritada",
        content:
          "Xonliklar davrida Movarounnahr va Xorazm hududida uch yirik siyosiy markaz shakllandi: Buxoro amirligi, Xiva xonligi va Qo'qon xonligi.",
      },
      {
        id: "city",
        title: "Shahar, bozor va hunarmandchilik",
        content:
          "Buxoro, Xiva va Qo'qon shaharlarida savdo, hunarmandchilik, madrasa va bozor hayoti jamiyatning iqtisodiy hamda madaniy markazi bo'lib xizmat qildi.",
      },
      {
        id: "power",
        title: "Ichki raqobat va tashqi bosim",
        content:
          "Xonliklar o'rtasidagi raqobat, boshqaruvdagi ziddiyatlar va tashqi siyosiy bosim mintaqaning keyingi taqdiriga kuchli ta'sir qildi.",
      },
      {
        id: "summary",
        title: "Davr sabog'i",
        content:
          "Xonliklar davri birlik, boshqaruv sifati, savdo yo'llari va diplomatiyaning tarixdagi ahamiyatini ko'rsatadi.",
      },
    ];
  }

  return [{ id: "overview", title: topic.title, content: topic.description }];
}

function getFallbackVisualType(topic: Topic, sectionTitle: string, index: number) {
  const text = `${topic.title} ${sectionTitle}`.toLowerCase();
  if (text.includes("xarita")) return "map";
  if (text.includes("samarqand") || text.includes("shahar") || text.includes("bozor")) return "infographic";
  if (text.includes("boshqaruv") || text.includes("tartib") || text.includes("meros")) return "infographic";
  return index === 0 ? "map" : "infographic";
}

function getFallbackImagePrompt(topic: Topic, sectionTitle: string) {
  const text = `${topic.title} ${sectionTitle}`.toLowerCase();
  if (text.includes("amir temur") && text.includes("xarita")) return "Timurid Empire historical map Central Asia";
  if (text.includes("samarqand")) return "Registan Samarkand Timurid architecture historical monument";
  if (text.includes("amir temur")) return "Amir Timur Timurid history Central Asia manuscript miniature";
  if (text.includes("xonlik") && text.includes("xarita")) return "Bukhara Khiva Kokand khanates historical map Central Asia";
  if (text.includes("xiva")) return "Khiva old city historical architecture";
  if (text.includes("buxoro")) return "Bukhara historical old city madrasa";
  if (text.includes("qo'qon") || text.includes("qoqon")) return "Kokand Khanate palace historical architecture";
  return `${topic.title} ${sectionTitle} historical Central Asia`;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}
