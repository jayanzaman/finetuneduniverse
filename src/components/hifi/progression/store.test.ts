import { describe, expect, it } from 'vitest';
import { CHAPTER_COMPONENTS, legacyComponentId } from './registry';
import {
  INITIAL_STATE,
  chapterProgress,
  componentState,
  frontierChapter,
  isExperienced,
  markExperienced,
  markInteracted,
  markLessonOpened,
  markPrologueSeen,
  type ProgressState,
} from './store';

/** State with every registered component fully experienced. */
function allComplete(): ProgressState {
  let s = INITIAL_STATE;
  for (const entry of CHAPTER_COMPONENTS) {
    for (const c of entry.components) s = markExperienced(s, c.id);
  }
  return s;
}

describe('component transitions', () => {
  it('starts with unknown components not interacted and not opened', () => {
    expect(componentState(INITIAL_STATE, 'ch01:entropy')).toEqual({
      interacted: false,
      lessonOpened: false,
    });
    expect(isExperienced(INITIAL_STATE, 'ch01:entropy')).toBe(false);
  });

  it('requires BOTH interaction and lesson for experienced', () => {
    const a = markInteracted(INITIAL_STATE, 'ch01:entropy');
    expect(isExperienced(a, 'ch01:entropy')).toBe(false);
    const b = markLessonOpened(a, 'ch01:entropy');
    expect(isExperienced(b, 'ch01:entropy')).toBe(true);
  });

  it('markExperienced sets both flags at once', () => {
    const s = markExperienced(INITIAL_STATE, 'ch02:legacy');
    expect(isExperienced(s, 'ch02:legacy')).toBe(true);
  });

  it('returns the same reference when nothing changes', () => {
    const a = markInteracted(INITIAL_STATE, 'ch01:entropy');
    expect(markInteracted(a, 'ch01:entropy')).toBe(a);
    const b = markPrologueSeen(a);
    expect(markPrologueSeen(b)).toBe(b);
  });

  it('does not mutate the previous state', () => {
    const a = markInteracted(INITIAL_STATE, 'ch01:entropy');
    expect(INITIAL_STATE.components['ch01:entropy']).toBeUndefined();
    expect(a).not.toBe(INITIAL_STATE);
  });
});

describe('prologue', () => {
  it('marks the prologue as seen', () => {
    expect(INITIAL_STATE.prologueSeen).toBe(false);
    expect(markPrologueSeen(INITIAL_STATE).prologueSeen).toBe(true);
  });
});

describe('chapterProgress', () => {
  it('reports 0/6 for a fresh Ch01', () => {
    expect(chapterProgress(INITIAL_STATE, 0)).toEqual({ done: 0, total: 6, complete: false });
  });

  it('counts only fully experienced components', () => {
    let s = markInteracted(INITIAL_STATE, 'ch01:entropy'); // half-done: not counted
    s = markExperienced(s, 'ch01:expansion');
    expect(chapterProgress(s, 0)).toEqual({ done: 1, total: 6, complete: false });
  });

  it('reports a legacy chapter complete after its shim is experienced', () => {
    const s = markExperienced(INITIAL_STATE, legacyComponentId(1));
    expect(chapterProgress(s, 1)).toEqual({ done: 1, total: 1, complete: true });
  });
});

describe('frontierChapter', () => {
  it('is chapter 0 for a fresh visitor', () => {
    expect(frontierChapter(INITIAL_STATE)).toBe(0);
  });

  it('is the first incomplete chapter, even with later chapters complete', () => {
    const s = markExperienced(INITIAL_STATE, legacyComponentId(2)); // ch 03 done, ch 01 not
    expect(frontierChapter(s)).toBe(0);
  });

  it('is null when every chapter is complete', () => {
    expect(frontierChapter(allComplete())).toBeNull();
  });
});
