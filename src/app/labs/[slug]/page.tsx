import { notFound, redirect } from 'next/navigation';
import { CHAPTERS } from '../../../components/hifi/chapters';

export function generateStaticParams() {
  return CHAPTERS.map((chapter) => ({ slug: chapter.slug }));
}

export default async function LabSlugRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = CHAPTERS.find((item) => item.slug === slug);
  if (!chapter) notFound();

  redirect(`/questions/${slug}/lab`);
}
