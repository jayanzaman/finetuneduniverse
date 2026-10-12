import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CHAPTERS } from '../../../../components/hifi/chapters';
import { LabPageShell } from '../../../../components/universe-builder/lab/LabPageShell';

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
    title: `${chapter.t} Laboratory: ${chapter.question} | Finetuned Universe`,
    description: `Interactive fine-tuning laboratory for Chapter ${chapter.n} (${chapter.t}). ${chapter.currentAnswer}`,
    alternates: { canonical: `/questions/${chapter.slug}/lab` },
  };
}

export default async function QuestionLabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapterIndex = CHAPTERS.findIndex((chapter) => chapter.slug === slug);
  if (chapterIndex < 0) notFound();

  return <LabPageShell chapterIndex={chapterIndex} />;
}
