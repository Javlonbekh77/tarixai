import { notFound } from "next/navigation";
import { LessonPage } from "@/components/LessonPage";
import { topics } from "@/data/topics";

export function generateStaticParams() {
  return topics.map((topic) => ({ topicId: topic.id }));
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = topics.find((item) => item.id === topicId);

  if (!topic) {
    notFound();
  }

  return <LessonPage topic={topic} />;
}
