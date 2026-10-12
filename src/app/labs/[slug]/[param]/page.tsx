import { notFound, redirect } from 'next/navigation';
import { CHAPTERS } from '../../../../components/hifi/chapters';
import { paramSlug, PARAMS } from '../../../../components/hifi/ch01/params';

export function generateStaticParams() {
  const ch01Slug = CHAPTERS[0].slug;

  const ch01Params = PARAMS.flatMap((p) => [
    { slug: ch01Slug, param: paramSlug(p.key) },
    { slug: ch01Slug, param: p.key },
    { slug: ch01Slug, param: p.n },
  ]);

  const seen = new Set<string>();
  return ch01Params.filter((entry) => {
    const key = `${entry.slug}/${entry.param}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default async function LabSlugParamRedirectPage({
  params,
}: {
  params: Promise<{ slug: string; param: string }>;
}) {
  const { slug, param } = await params;
  const chapter = CHAPTERS.find((item) => item.slug === slug);
  if (!chapter) notFound();

  redirect(`/questions/${slug}/lab/${param}`);
}
