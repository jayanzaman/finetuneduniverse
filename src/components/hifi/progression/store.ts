import { CHAPTER_COMPONENTS } from './registry';

export type ComponentProgress = { interacted: boolean; lessonOpened: boolean };

export type ProgressState = {
  version: 1;
  prologueSeen: boolean;
  components: Record<string, ComponentProgress>;
};

export const INITIAL_STATE: ProgressState = {
  version: 1,
  prologueSeen: false,
  components: {},
};

const EMPTY: ComponentProgress = { interacted: false, lessonOpened: false };

export function componentState(state: ProgressState, id: string): ComponentProgress {
  return state.components[id] ?? EMPTY;
}

export function isExperienced(state: ProgressState, id: string): boolean {
  const c = componentState(state, id);
  return c.interacted && c.lessonOpened;
}

function withComponent(
  state: ProgressState,
  id: string,
  patch: Partial<ComponentProgress>
): ProgressState {
  const prev = componentState(state, id);
  const next: ComponentProgress = { ...prev, ...patch };
  if (
    state.components[id] !== undefined &&
    next.interacted === prev.interacted &&
    next.lessonOpened === prev.lessonOpened
  ) {
    return state;
  }
  return { ...state, components: { ...state.components, [id]: next } };
}

export function markInteracted(state: ProgressState, id: string): ProgressState {
  return withComponent(state, id, { interacted: true });
}

export function markLessonOpened(state: ProgressState, id: string): ProgressState {
  return withComponent(state, id, { lessonOpened: true });
}

export function markExperienced(state: ProgressState, id: string): ProgressState {
  return withComponent(state, id, { interacted: true, lessonOpened: true });
}

export function markPrologueSeen(state: ProgressState): ProgressState {
  return state.prologueSeen ? state : { ...state, prologueSeen: true };
}

export type ChapterProgress = { done: number; total: number; complete: boolean };

export function chapterProgress(state: ProgressState, chapterIndex: number): ChapterProgress {
  const entry = CHAPTER_COMPONENTS[chapterIndex];
  const total = entry.components.length;
  const done = entry.components.filter((c) => isExperienced(state, c.id)).length;
  return { done, total, complete: done === total };
}

/** First incomplete chapter ("continue here"), or null when the descent is finished. */
export function frontierChapter(state: ProgressState): number | null {
  for (const entry of CHAPTER_COMPONENTS) {
    if (!chapterProgress(state, entry.chapterIndex).complete) return entry.chapterIndex;
  }
  return null;
}
