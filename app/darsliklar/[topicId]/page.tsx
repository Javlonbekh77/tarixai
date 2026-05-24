import { notFound } from "next/navigation";
import { LessonPage } from "@/components/LessonPage";
import { topics } from "@/data/topics";

export function generateStaticParams() {
  return topics.map((topic) => ({ topicId: topic.id }));
}

export default function TopicPage({
  params,
}: {
  params: { topicId: string };
}) {
  const topic = topics.find((item) => item.id === params.topicId);

  if (!topic) {
    notFound();
  }

  return <LessonPage topic={topic} />;
}
