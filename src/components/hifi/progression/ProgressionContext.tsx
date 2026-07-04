'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CHAPTER_COMPONENTS, legacyComponentId } from './registry';
import {
  INITIAL_STATE,
  chapterProgress,
  componentState,
  frontierChapter,
  markExperienced,
  markInteracted,
  markLessonOpened,
  markPrologueSeen,
  type ChapterProgress,
  type ComponentProgress,
  type ProgressState,
} from './store';
import { loadState, saveState } from './persistence';

export type Progression = {
  state: ProgressState;
  /** False until the mount-time localStorage read has landed. */
  hydrated: boolean;
  markInteracted: (id: string) => void;
  markLessonOpened: (id: string) => void;
  markPrologueSeen: () => void;
  /** Marks a legacy chapter's shim component experienced; no-op for rebuilt chapters. */
  markLegacyVisit: (chapterIndex: number) => void;
  componentState: (id: string) => ComponentProgress;
  chapterProgress: (chapterIndex: number) => ChapterProgress;
  frontierChapter: () => number | null;
};

const ProgressionContext = createContext<Progression | null>(null);

export function ProgressionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const doMarkInteracted = useCallback(
    (id: string) => setState((s) => markInteracted(s, id)),
    []
  );
  const doMarkLessonOpened = useCallback(
    (id: string) => setState((s) => markLessonOpened(s, id)),
    []
  );
  const doMarkPrologueSeen = useCallback(() => setState((s) => markPrologueSeen(s)), []);
  const doMarkLegacyVisit = useCallback((chapterIndex: number) => {
    if (!CHAPTER_COMPONENTS[chapterIndex]?.legacy) return;
    setState((s) => markExperienced(s, legacyComponentId(chapterIndex)));
  }, []);

  const value = useMemo<Progression>(
    () => ({
      state,
      hydrated,
      markInteracted: doMarkInteracted,
      markLessonOpened: doMarkLessonOpened,
      markPrologueSeen: doMarkPrologueSeen,
      markLegacyVisit: doMarkLegacyVisit,
      componentState: (id) => componentState(state, id),
      chapterProgress: (chapterIndex) => chapterProgress(state, chapterIndex),
      frontierChapter: () => frontierChapter(state),
    }),
    [state, hydrated, doMarkInteracted, doMarkLessonOpened, doMarkPrologueSeen, doMarkLegacyVisit]
  );

  return <ProgressionContext.Provider value={value}>{children}</ProgressionContext.Provider>;
}

export function useProgression(): Progression {
  const ctx = useContext(ProgressionContext);
  if (!ctx) throw new Error('useProgression must be used within a ProgressionProvider');
  return ctx;
}
