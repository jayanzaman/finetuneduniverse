import { describe, expect, it } from 'vitest';
import { CHAPTERS, EVIDENCE_LABELS } from './chapters';

describe('chapter claim metadata', () => {
  it('exposes question, answer, open question, and an evidence status per chapter', () => {
    expect(CHAPTERS).toHaveLength(7);
    for (const chapter of CHAPTERS) {
      expect(chapter.question.length).toBeGreaterThan(10);
      expect(chapter.currentAnswer.length).toBeGreaterThan(10);
      expect(chapter.openQuestion.length).toBeGreaterThan(10);
      expect(chapter.evidence in EVIDENCE_LABELS).toBe(true);
    }
  });

  it('keeps chapter slugs unique and routable', () => {
    const slugs = CHAPTERS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(/^[a-z0-9-]+$/.test(slug)).toBe(true);
    }
  });
});