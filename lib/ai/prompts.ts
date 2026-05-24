export function buildGenerateLessonPrompt(sourceText: string, topic: string, grade: string): string {
  return `
Sen Tarixchi AI content generation engine’san.
Senga tarix mavzusi bo‘yicha source material beriladi.
Vazifang: source materialni maktab o‘quvchilari uchun interaktiv AI dars JSON formatiga aylantirish.

Mavzu: ${topic}
Sinf: ${grade}
Source Material:
"""
${sourceText}
"""

Qoidalar:
1. Faqat source materialga tayan.
2. Fakt aniq bo‘lmasa, "source needed" deb yoz.
3. O‘zbek Latin tilida yoz.
4. Dars qiziqarli, gamified va visual presentation formatida bo‘lsin.
5. Teacher speech jonli, sodda va storytelling uslubida bo‘lsin.
6. Har bir scene uchun presentation visual kerak.
7. Har bir scene uchun animation idea kerak.
8. Dars 20 minutlik bo‘lsin va 8–10 scene’ga bo‘linsin.
9. 5 minut tanaffus, Q&A, interview, threads, AI notes, quiz, flashcards ham bo‘lsin.
10. Output only valid JSON. No markdown tags like \`\`\`json. Only return the raw JSON string.

Must return exactly the following JSON structure (do not include markdown wrappers):
{
  "id": "...",
  "title": "...",
  "grade": "...",
  "mission": "...",
  "duration": { "lessonMinutes": 20, "breakMinutes": 5, "qaMinutes": 5, "interviewMinutes": 5, "threadsMinutes": 5, "pauseOnQuestion": true },
  "gamification": { "xpReward": 100, "badges": [], "league": "", "streakReward": 10 },
  "scenes": [
    {
      "sceneId": 1,
      "timeRange": "00:00 - 02:00",
      "estimatedSeconds": 120,
      "teacherSpeech": "...",
      "presentation": {
        "type": "map|portrait-cards|timeline|video-placeholder|quote|comparison|newspaper|school|infographic",
        "title": "...",
        "description": "...",
        "assetSuggestion": "...",
        "imagePrompt": "...",
        "animationIdea": "...",
        "caption": "..."
      },
      "microQuestion": { "question": "...", "options": [], "correctIndex": 0, "explanation": "..." }
    }
  ],
  "breakSection": { "durationMinutes": 5, "activitySuggestion": "..." },
  "qaPrompts": ["..."],
  "interview": { "persona": "...", "disclaimer": "...", "biographyShort": "...", "suggestedQuestions": [], "sampleAnswers": [] },
  "threads": { "prompt": "...", "samplePosts": [] },
  "aiNotes": { "keyTakeaways": [], "examTips": [], "importantDates": [], "causeEffectSummary": [], "oneSentenceSummary": "..." },
  "timeline": [{ "year": "...", "title": "...", "explanation": "..." }],
  "causeEffect": [{ "title": "...", "explanation": "..." }],
  "quiz": [{ "id": "...", "question": "...", "options": [], "correctIndex": 0, "explanation": "...", "skill": "fact|timeline|cause-effect|analysis|visual" }],
  "flashcards": [{ "front": "...", "back": "..." }]
}
`;
}

export function buildStudentQuestionPrompt(params: {
  topic: string;
  question: string;
  studentLevel: "slow" | "normal" | "fast";
  currentSceneContext: string;
}): string {
  return `
Sen Tarixchi AI o‘qituvchisisan. Mavzu: ${params.topic}.
O‘quvchi dars paytida savol berdi, shuning uchun timer to‘xtadi.

O'quvchining savoli: "${params.question}"
Joriy dars konteksti: "${params.currentSceneContext}"
Student level: ${params.studentLevel}

Savolga qisqa, aniq, maktab o‘quvchisiga mos javob ber.
StudentLevel qoidalari:
- slow: juda sodda, misol bilan tushuntir
- normal: standart tushuntir
- fast: chuqurroq, sabab-oqibat bilan tushuntir

Javob strukturasi quyidagilarni o'z ichiga olsin:
1. Qisqa javob
2. Nega muhim?
3. Misol yoki sabab-oqibat
4. Bitta tekshiruvchi savol

Til: O‘zbek Latin.
Return only a JSON object like this (no markdown tags):
{
  "answer": "full answer text formatted clearly",
  "followUpQuestion": "check question text",
  "suggestedNextAction": "continue_lesson|show_timeline|review_notes"
}
`;
}
