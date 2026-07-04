import { describe, expect, it } from 'vitest';
import { CHAPTER_COMPONENTS, legacyComponentId } from './registry';

describe('CHAPTER_COMPONENTS', () => {
  it('covers all 7 chapters in order', () => {
    expect(CHAPTER_COMPONENTS).toHaveLength(7);
    CHAPTER_COMPONENTS.forEach((entry, i) => expect(entry.chapterIndex).toBe(i));
  });

  it('registers the six Ch01 components from params.ts', () => {
    const ch01 = CHAPTER_COMPONENTS[0];
    expect(ch01.legacy).toBe(false);
    expect(ch01.components.map((c) => c.id)).toEqual([
      'ch01:entropy',
      'ch01:expansion',
      'ch01:fluctuations',
      'ch01:shape',
      'ch01:darkEnergy',
      'ch01:temperature',
    ]);
    expect(ch01.components[0].name).toBe('Initial Entropy');
  });

  it('registers a single legacy shim component for chapters 02-07', () => {
    for (let i = 1; i < 7; i++) {
      const entry = CHAPTER_COMPONENTS[i];
      expect(entry.legacy).toBe(true);
      expect(entry.components).toHaveLength(1);
      expect(entry.components[0].id).toBe(legacyComponentId(i));
    }
    expect(legacyComponentId(1)).toBe('ch02:legacy');
  });

  it('has globally unique component ids', () => {
    const ids = CHAPTER_COMPONENTS.flatMap((e) => e.components.map((c) => c.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
