export interface Topic {
  id: string;
  title: string;
  grade: string;
  description: string;
  estimatedTime: string;
  difficulty: string;
  lessonSections: LessonSection[];
  timeline: TimelineEvent[];
  causeMap: CauseNode[];
  quiz: QuizQuestion[];
}

export interface LessonSection {
  id: string;
  title: string;
  content: string;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  explanation: string;
  whyImportant: string;
}

export interface CauseNode {
  id: string;
  title: string;
  explanation: string;
  nextIds?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  isImagePlaceholder?: boolean;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  bio: string;
  style: string;
  suggestedQuestions: string[];
}

export interface ThreadPost {
  id: string;
  author: string;
  content: string;
  likes: number;
  date: string;
}

export interface UserProgress {
  completedTopics: string[];
  quizScores: Record<string, number>;
}
