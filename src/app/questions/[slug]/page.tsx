import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UniverseBuilderApp from '../../../components/universe-builder/UniverseBuilderApp';
import { CHAPTERS } from '../../../components/hifi/chapters';

export function generateStaticParams() {
  return CHAPTERS.map((chapter) => ({ slug: chapter.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chapter = CHAPTERS.find((item) => item.slug === slug);
  if (!chapter) return {};
  return {
    title: `${chapter.question} | Finetuned Universe`,
    description: chapter.currentAnswer,
    alternates: { canonical: `/questions/${chapter.slug}` },
  };
}

export default async function QuestionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapterIndex = CHAPTERS.findIndex((chapter) => chapter.slug === slug);
  if (chapterIndex < 0) notFound();
  return <UniverseBuilderApp initialChapter={chapterIndex} />;
}
