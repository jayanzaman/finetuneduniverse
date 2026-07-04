import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { ProgressionProvider, useProgression } from './ProgressionContext';
import { STORAGE_KEY } from './persistence';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ProgressionProvider>{children}</ProgressionProvider>
);

afterEach(() => {
  window.localStorage.clear();
});

describe('useProgression', () => {
  it('throws outside the provider', () => {
    expect(() => renderHook(() => useProgression())).toThrow(/ProgressionProvider/);
  });

  it('tracks interact + lesson to completion and updates chapter progress', async () => {
    const { result } = renderHook(() => useProgression(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.markInteracted('ch01:entropy'));
    expect(result.current.componentState('ch01:entropy').interacted).toBe(true);
    expect(result.current.chapterProgress(0).done).toBe(0);

    act(() => result.current.markLessonOpened('ch01:entropy'));
    expect(result.current.chapterProgress(0)).toEqual({ done: 1, total: 6, complete: false });
    expect(result.current.frontierChapter()).toBe(0);
  });

  it('marks legacy chapters complete on visit and ignores non-legacy chapters', async () => {
    const { result } = renderHook(() => useProgression(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.markLegacyVisit(1));
    expect(result.current.chapterProgress(1)).toEqual({ done: 1, total: 1, complete: true });

    act(() => result.current.markLegacyVisit(0)); // Ch01 is not legacy
    expect(result.current.chapterProgress(0).done).toBe(0);
  });

  it('persists changes to localStorage', async () => {
    const { result } = renderHook(() => useProgression(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.markPrologueSeen());
    await waitFor(() => {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!).prologueSeen).toBe(true);
    });
  });

  it('hydrates saved progress on mount', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        prologueSeen: true,
        components: { 'ch01:entropy': { interacted: true, lessonOpened: true } },
      })
    );
    const { result } = renderHook(() => useProgression(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.chapterProgress(0).done).toBe(1);
    expect(result.current.state.prologueSeen).toBe(true);
  });
});
