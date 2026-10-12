import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { CHAPTERS } from '../../../../../components/hifi/chapters';
import { findParam, paramSlug, PARAMS } from '../../../../../components/hifi/ch01/params';
import { ParameterFocusedPageShell } from '../../../../../components/hifi/ch01/ParameterFocusedPageShell';

export function generateStaticParams() {
  const ch01Slug = CHAPTERS[0].slug;

  // Canonical slugs + common aliases so all direct URLs work
  const ch01Params = PARAMS.flatMap((p) => [
    { slug: ch01Slug, param: paramSlug(p.key) },
    { slug: ch01Slug, param: p.key },
    { slug: ch01Slug, param: p.n },
  ]);

  // Deduplicate params
  const seen = new Set<string>();
  return ch01Params.filter((entry) => {
    const key = `${entry.slug}/${entry.param}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; param: string }>;
}): Promise<Metadata> {
  const { slug, param } = await params;

  if (slug === CHAPTERS[0].slug) {
    const paramDef = findParam(param);
    if (!paramDef) return {};

    return {
      title: `Parameter ${paramDef.n} · Focused view: ${paramDef.name} | Finetuned Universe`,
      description: `Focused laboratory view and educator notes for ${paramDef.name} (${paramDef.n}). ${paramDef.question}`,
      alternates: {
        canonical: `/questions/${slug}/lab/${paramSlug(paramDef.key)}`,
      },
    };
  }

  const chapter = CHAPTERS.find((c) => c.slug === slug);
  return {
    title: `Focused View: ${chapter?.t ?? 'Laboratory'} | Finetuned Universe`,
  };
}

export default async function LabParameterPage({
  params,
}: {
  params: Promise<{ slug: string; param: string }>;
}) {
  const { slug, param } = await params;

  if (slug === CHAPTERS[0].slug) {
    const paramDef = findParam(param);
    if (!paramDef) notFound();

    return <ParameterFocusedPageShell param={paramDef} />;
  }

  const chapter = CHAPTERS.find((c) => c.slug === slug);
  if (!chapter) notFound();

  // If visiting an arbitrary subparameter of another chapter, return to its dedicated lab
  redirect(`/questions/${slug}/lab`);
}
