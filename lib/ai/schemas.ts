import { z } from "zod";

export const LessonSceneSchema = z.object({
  sceneId: z.number(),
  timeRange: z.string(),
  estimatedSeconds: z.number(),
  teacherSpeech: z.string(),
  presentation: z.object({
    type: z.enum(["map", "portrait-cards", "timeline", "video-placeholder", "quote", "comparison", "newspaper", "school", "infographic"]),
    title: z.string(),
    description: z.string(),
    assetSuggestion: z.string(),
    imagePrompt: z.string(),
    animationIdea: z.string(),
    caption: z.string()
  }),
  microQuestion: z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctIndex: z.number(),
    explanation: z.string()
  }).optional()
});

export const BreakSectionSchema = z.object({
  durationMinutes: z.number(),
  activitySuggestion: z.string()
});

export const InterviewSectionSchema = z.object({
  persona: z.string(),
  disclaimer: z.string(),
  biographyShort: z.string(),
  suggestedQuestions: z.array(z.string()),
  sampleAnswers: z.array(z.string())
});

export const ThreadsSectionSchema = z.object({
  prompt: z.string(),
  samplePosts: z.array(z.string())
});

export const AINotesSchema = z.object({
  keyTakeaways: z.array(z.string()),
  examTips: z.array(z.string()),
  importantDates: z.array(z.string()),
  causeEffectSummary: z.array(z.string()),
  oneSentenceSummary: z.string()
});

export const TimelineEventSchema = z.object({
  year: z.string(),
  title: z.string(),
  explanation: z.string()
});

export const CauseEffectNodeSchema = z.object({
  title: z.string(),
  explanation: z.string()
});

export const QuizQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  correctIndex: z.number(),
  explanation: z.string(),
  skill: z.enum(["fact", "timeline", "cause-effect", "analysis", "visual"])
});

export const FlashcardSchema = z.object({
  front: z.string(),
  back: z.string()
});

export const LessonJsonSchema = z.object({
  id: z.string(),
  title: z.string(),
  grade: z.string(),
  mission: z.string(),
  duration: z.object({
    lessonMinutes: z.number(),
    breakMinutes: z.number(),
    qaMinutes: z.number(),
    interviewMinutes: z.number(),
    threadsMinutes: z.number(),
    pauseOnQuestion: z.boolean()
  }),
  gamification: z.object({
    xpReward: z.number(),
    badges: z.array(z.string()),
    league: z.string(),
    streakReward: z.number()
  }),
  scenes: z.array(LessonSceneSchema),
  breakSection: BreakSectionSchema,
  qaPrompts: z.array(z.string()),
  interview: InterviewSectionSchema,
  threads: ThreadsSectionSchema,
  aiNotes: AINotesSchema,
  timeline: z.array(TimelineEventSchema),
  causeEffect: z.array(CauseEffectNodeSchema),
  quiz: z.array(QuizQuestionSchema),
  flashcards: z.array(FlashcardSchema)
});

export type LessonJson = z.infer<typeof LessonJsonSchema>;
