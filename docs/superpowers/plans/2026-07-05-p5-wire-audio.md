# P5: Wire Audio into Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the P4 AudioDirector into the navigation flow (issue #31, spec §7): prologue drone, chapter-handoff crossfades, Ch01 slider-driven tension as the reference implementation, and `enableFromPref()` on "Begin the descent".

**Architecture:** Two new small modules in `src/components/hifi/audio/` — `palettes.ts` (registers the prologue + Ch01 palettes, maps chapter index → palette id) and `useChapterAudio.ts` (a hook the app shell calls with the active chapter index; fires `setChapter`/`setTension(0)` on every view change). The app shell (`UniverseBuilderApp`) wires `enableFromPref()` into the Begin gesture; `Instrument` (Ch01) drives `setTension` from its score and fires the `lesson-open`/`broken`/`component-complete` cues; `ChapterTransition` gets a one-line guard so legacy chapters (2–7, not yet rebuilt) stop firing an unearned chapter-complete cadence on first arrival.

**Tech Stack:** Next.js 15.5 / React 19, Vitest 4 + jsdom + @testing-library/react, Tone.js (already code-split behind the director's dynamic import — this plan never imports `tone` directly).

---

## Repo facts you must know (read before Task 1)

- **Worktree:** work on branch `feat/p5-wire-audio` off `main` (at `76ab478`), created via `git worktree add .worktrees/p5-wire-audio -b feat/p5-wire-audio main` from the primary checkout `/home/jayan/projects/apps-tools/finetuneduniverse`. Run `npm install` in the worktree.
- **Baseline:** `npx vitest run` → 83 tests / 17 files, all green. Verify before starting.
- **Vitest has NO `globals: true`:** import `describe/it/expect/vi/afterEach/beforeEach` from `'vitest'`, and component tests MUST call `cleanup()` from `@testing-library/react` in an `afterEach` — otherwise later tests see stale DOM.
- **No jest-dom matchers.** Use `expect(x).toBeTruthy()`, `expect(el.className).toContain(...)`, etc.
- **`vi.mock` factories are hoisted** above `const` initializers. If a factory needs a shared fixture, build it with `vi.hoisted(() => ...)`.
- **Lint:** `npm run lint` exits 1 repo-wide (pre-existing debt). The bar is: no NEW errors — run `npx eslint <changed/created paths>` (must be clean) and `npx tsc --noEmit` (must be clean).
- **Existing audio API (all on main, do not modify unless a task says so):**
  - `audio/director.ts` — singleton `audioDirector` with `enable()`, `enableFromPref()` (enables only if the persisted pref is true; must be called from a user-gesture handler), `disable()`, `setChapter(id: string)` (crossfades to `getPalette(id)`, records pending id for late enable; default `'prologue'`), `setTension(t: number)`, `cue(name)`, `subscribe`/`getState`.
  - `audio/palette.ts` — `ChapterPalette` type, `DEFAULT_PALETTE`, `registerPalette(p)`, `getPalette(id)` (falls back to `DEFAULT_PALETTE`).
  - `audio/engine.ts` — consumes palettes; `setTension` clamps to 0..1 (0 = bright/consonant, 1 = dark/detuned); `cue('broken')` is a falling gesture; `cue('chapter-complete')` plays the palette's cadence; crossfade `CROSSFADE_S = 2`.
  - `audio/cues.ts` — `cue(name)` forwarder; `CueName = 'lesson-open' | 'component-complete' | 'chapter-complete' | 'broken'`.
- **Progression:** `useProgression()` provides `hydrated` (false until the mount-time localStorage read lands), `componentState(id) → { interacted, lessonOpened }` (a component is "experienced" when both are true), `chapterProgress(i)`, `markInteracted`, `markLessonOpened`. Persisted under localStorage key `'ftu-progress-v1'`. Ch01 component ids are `ch01:entropy`, `ch01:expansion`, `ch01:fluctuations`, `ch01:shape`, `ch01:darkEnergy`, `ch01:temperature` (see `progression/registry.ts`). Chapters 1–6 (0-based) are `legacy: true` and auto-complete on first arrival via `markLegacyVisit`.
- **App shell:** `src/components/universe-builder/UniverseBuilderApp.tsx` — `view` state is `{ kind: 'landing' } | { kind: 'chapter'; index: number }` (7 chapters, 0-based). "Begin the descent" lives in `PrologueHero`, flows up as `onBegin` through `PrologueLanding` to the app shell, which currently passes `onBegin={() => goChapter(0)}`.
- **Ch01 Instrument:** `src/components/hifi/ch01/Instrument.tsx` computes `total` (score 0..1, exactly 1.0 at default slider values) and `warn` (`outsideBandCount > 0`, which also renders `BrokenState`). `openFocused(key)` opens the lesson (`FocusedView`) and calls `markLessonOpened`.
- **`prefersReducedMotion()`** (`hifi/motion.ts`) uses `window.matchMedia?.(...)` — safe in jsdom (returns false), no stub needed.
- **jsdom quirk:** `window.scrollTo({ behavior: 'smooth' })` logs "Not implemented" — stub it in app-shell tests.

---

### Task 1: Register the prologue + Ch01 palettes

**Files:**
- Create: `src/components/hifi/audio/palettes.ts`
- Test: `src/components/hifi/audio/palettes.test.ts`

Pure data + one mapping function. Registration happens at module scope, so any importer (the hook in Task 2) guarantees the palettes exist before the director asks for them. Chapters 02–07 intentionally fall back to `DEFAULT_PALETTE` — their real palettes arrive with the Wave-2 chapter rebuilds (C2–C7).

- [ ] **Step 1: Write the failing test**

Create `src/components/hifi/audio/palettes.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getPalette } from './palette';
import { CH01_PALETTE, PROLOGUE_PALETTE, chapterAudioId } from './palettes';

describe('palettes', () => {
  it('registers the prologue palette', () => {
    expect(getPalette('prologue')).toBe(PROLOGUE_PALETTE);
  });

  it('registers the ch01 palette', () => {
    expect(getPalette('ch01')).toBe(CH01_PALETTE);
  });

  it('unregistered chapters fall back to the default palette', () => {
    expect(getPalette(chapterAudioId(1)).id).toBe('default');
    expect(getPalette(chapterAudioId(6)).id).toBe('default');
  });

  it('maps 0-based chapter indexes to zero-padded palette ids', () => {
    expect(chapterAudioId(0)).toBe('ch01');
    expect(chapterAudioId(3)).toBe('ch04');
    expect(chapterAudioId(6)).toBe('ch07');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/hifi/audio/palettes.test.ts`
Expected: FAIL — `Cannot find module './palettes'` (or equivalent resolve error).

- [ ] **Step 3: Write the implementation**

Create `src/components/hifi/audio/palettes.ts`:

```ts
import { registerPalette, type ChapterPalette } from './palette';

/**
 * App palettes (spec §7). The prologue is sparse and hollow — a bare fifth.
 * Ch01 "The Beginning" adds a suspended second above it; its tension range is
 * wider than the default so slider dissonance reads clearly. Chapters 02–07
 * fall back to DEFAULT_PALETTE until their Wave-2 rebuilds register real ones.
 */
export const PROLOGUE_PALETTE: ChapterPalette = {
  id: 'prologue',
  drone: { notes: ['C2', 'G2'], gain: 0.4 },
  tension: { brightHz: 900, darkHz: 220, detuneCents: 20 },
  cadence: ['C4', 'G4', 'C5'],
};

export const CH01_PALETTE: ChapterPalette = {
  id: 'ch01',
  drone: { notes: ['C2', 'G2', 'D3'], gain: 0.5 },
  tension: { brightHz: 1400, darkHz: 180, detuneCents: 35 },
  cadence: ['C4', 'E4', 'G4', 'C5'],
};

registerPalette(PROLOGUE_PALETTE);
registerPalette(CH01_PALETTE);

/** Palette id for a 0-based chapter index — 'ch01' … 'ch07'. */
export function chapterAudioId(chapterIndex: number): string {
  return `ch${String(chapterIndex + 1).padStart(2, '0')}`;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/hifi/audio/palettes.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Lint + typecheck the new files, then commit**

```bash
npx eslint src/components/hifi/audio/palettes.ts src/components/hifi/audio/palettes.test.ts
npx tsc --noEmit
git add src/components/hifi/audio/palettes.ts src/components/hifi/audio/palettes.test.ts
git commit -m "feat: register prologue and ch01 audio palettes"
```

---

### Task 2: `useChapterAudio` — the soundtrack follows navigation

**Files:**
- Create: `src/components/hifi/audio/useChapterAudio.ts`
- Test: `src/components/hifi/audio/useChapterAudio.test.ts`

One hook, one effect: whenever the active view changes, crossfade the drone to the matching palette and reset tension to the calm baseline (Ch01's `Instrument` re-drives tension from its sliders right after mount — its local slider state resets to defaults on remount, so baseline 0 is always correct). Importing `./palettes` here is what triggers palette registration app-wide.

- [ ] **Step 1: Write the failing test**

Create `src/components/hifi/audio/useChapterAudio.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, renderHook } from '@testing-library/react';

vi.mock('./director', () => ({
  audioDirector: { setChapter: vi.fn(), setTension: vi.fn() },
}));
import { audioDirector } from './director';
import { useChapterAudio } from './useChapterAudio';

afterEach(() => {
  cleanup();
  vi.mocked(audioDirector.setChapter).mockClear();
  vi.mocked(audioDirector.setTension).mockClear();
});

describe('useChapterAudio', () => {
  it('sets the prologue palette and calm tension on the landing view', () => {
    renderHook(() => useChapterAudio(null));
    expect(audioDirector.setChapter).toHaveBeenCalledWith('prologue');
    expect(audioDirector.setTension).toHaveBeenCalledWith(0);
  });

  it('crossfades to the chapter palette when the index changes', () => {
    const { rerender } = renderHook(({ i }: { i: number | null }) => useChapterAudio(i), {
      initialProps: { i: null as number | null },
    });
    rerender({ i: 0 });
    expect(audioDirector.setChapter).toHaveBeenLastCalledWith('ch01');
    rerender({ i: 3 });
    expect(audioDirector.setChapter).toHaveBeenLastCalledWith('ch04');
    expect(audioDirector.setChapter).toHaveBeenCalledTimes(3);
  });

  it('does not re-fire on a same-index rerender', () => {
    const { rerender } = renderHook(({ i }: { i: number | null }) => useChapterAudio(i), {
      initialProps: { i: 0 as number | null },
    });
    rerender({ i: 0 });
    expect(audioDirector.setChapter).toHaveBeenCalledTimes(1);
    expect(audioDirector.setTension).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/hifi/audio/useChapterAudio.test.ts`
Expected: FAIL — cannot resolve `./useChapterAudio`.

- [ ] **Step 3: Write the implementation**

Create `src/components/hifi/audio/useChapterAudio.ts`:

```ts
'use client';

import { useEffect } from 'react';
import { audioDirector } from './director';
import { chapterAudioId } from './palettes';

/**
 * Follows navigation with the soundtrack (spec §7): crossfades the drone
 * palette on every view change and resets tension to the calm baseline.
 * `null` means the prologue/landing view. Safe no-op while sound is off —
 * the director records the pending chapter for a late enable.
 */
export function useChapterAudio(chapterIndex: number | null): void {
  useEffect(() => {
    audioDirector.setChapter(chapterIndex === null ? 'prologue' : chapterAudioId(chapterIndex));
    audioDirector.setTension(0);
  }, [chapterIndex]);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/hifi/audio/useChapterAudio.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Lint + typecheck, then commit**

```bash
npx eslint src/components/hifi/audio/useChapterAudio.ts src/components/hifi/audio/useChapterAudio.test.ts
npx tsc --noEmit
git add src/components/hifi/audio/useChapterAudio.ts src/components/hifi/audio/useChapterAudio.test.ts
git commit -m "feat: add useChapterAudio hook driving palette crossfades from navigation"
```

---

### Task 3: Suppress the chapter-complete cadence for legacy chapters

**Files:**
- Modify: `src/components/hifi/transition/ChapterTransition.tsx` (the cue effect, currently lines 32–39)
- Test: `src/components/hifi/transition/ChapterTransition.test.tsx` (add one test)

**Why:** chapters 2–7 are `legacy: true` — arriving at one auto-completes it (`markLegacyVisit`), which flips `progress.complete` false→true live and fires `cue('chapter-complete')`. That cadence is supposed to be an *earned* reward; playing it on mere arrival at every old chapter is unearned noise. Guard on the legacy flag. When each chapter is rebuilt (C2–C7), its flag flips off in the registry and the cue activates automatically — no follow-up needed.

- [ ] **Step 1: Write the failing test**

In `src/components/hifi/transition/ChapterTransition.test.tsx`, add inside the existing `describe('ChapterTransition — earned', ...)` block (after the "does NOT fire cue when mounted already complete" test):

```tsx
  it('does NOT fire cue for a legacy chapter completing on first arrival', async () => {
    // Chapter 1 (0-based) is legacy — its single shim component completes on visit.
    renderTransition(1, <CompleteButton id="ch02:legacy" />);
    await screen.findByText('1 component remains — tap one above to jump to it');
    act(() => screen.getByText('finish-ch02:legacy').click());
    await screen.findByRole('button', { name: /descend/i });
    expect(cue).not.toHaveBeenCalled();
  });
```

(The existing `CompleteButton` helper and `renderTransition` are reused as-is — `markInteracted` + `markLessonOpened` on `ch02:legacy` is equivalent to what `markLegacyVisit(1)` does.)

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/hifi/transition/ChapterTransition.test.tsx`
Expected: FAIL — the new test sees `cue` called with `'chapter-complete'`; the 4 existing cue/earned tests still pass.

- [ ] **Step 3: Implement the guard**

In `src/components/hifi/transition/ChapterTransition.tsx`, replace the cue effect (currently):

```tsx
  // Fire the completion cue only on a live false→true flip after hydration —
  // never for a returning visitor whose chapter is already complete on mount.
  const prevComplete = useRef<boolean | null>(null);
  useEffect(() => {
    if (isLast || !hydrated) return;
    if (prevComplete.current === false && progress.complete) cue('chapter-complete');
    prevComplete.current = progress.complete;
  }, [isLast, hydrated, progress.complete]);
```

with:

```tsx
  // Fire the completion cue only on a live false→true flip after hydration —
  // never for a returning visitor whose chapter is already complete on mount,
  // and never for legacy chapters, which auto-complete on first arrival (the
  // cadence must stay earned; it activates when each chapter is rebuilt).
  const legacy = CHAPTER_COMPONENTS[chapterIndex].legacy;
  const prevComplete = useRef<boolean | null>(null);
  useEffect(() => {
    if (isLast || !hydrated || legacy) return;
    if (prevComplete.current === false && progress.complete) cue('chapter-complete');
    prevComplete.current = progress.complete;
  }, [isLast, hydrated, legacy, progress.complete]);
```

`CHAPTER_COMPONENTS` is already imported in this file (line 5) — no import change needed.

- [ ] **Step 4: Run the full transition suite to verify it passes**

Run: `npx vitest run src/components/hifi/transition/`
Expected: PASS — all previous tests plus the new one.

- [ ] **Step 5: Lint + typecheck, then commit**

```bash
npx eslint src/components/hifi/transition/ChapterTransition.tsx src/components/hifi/transition/ChapterTransition.test.tsx
npx tsc --noEmit
git add src/components/hifi/transition/ChapterTransition.tsx src/components/hifi/transition/ChapterTransition.test.tsx
git commit -m "fix: keep the chapter-complete cadence earned - skip legacy auto-completion"
```

---

### Task 4: Ch01 Instrument — tension, lesson-open, broken, component-complete

**Files:**
- Modify: `src/components/hifi/ch01/Instrument.tsx`
- Test: `src/components/hifi/ch01/Instrument.test.tsx` (new — Instrument currently has no tests)

Ch01 is the reference implementation for chapter audio (spec §7):
- **Tension:** `audioDirector.setTension(1 - total)`. `total` is the weighted score (exactly 1.0 at defaults → tension 0/consonant; catastrophic settings → tension → 1/dark+detuned). Continuous, slider-driven.
- **`cue('lesson-open')`:** in `openFocused` (fires for both the "Read the lesson" button and the maximize button — both open the lesson view and already call `markLessonOpened`).
- **`cue('broken')`:** on a live false→true flip of `warn` (same moment `BrokenState` appears).
- **`cue('component-complete')`:** when a component's experienced count rises after hydration — except the sixth/final one, where the chapter-complete cadence (fired by `ChapterTransition`) is the reward; a chime on top would be mud.

- [ ] **Step 1: Write the failing test**

Create `src/components/hifi/ch01/Instrument.test.tsx`:

```tsx
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Instrument } from './Instrument';
import { PARAMS } from './params';
import { ProgressionProvider } from '../progression/ProgressionContext';

vi.mock('../audio/cues', () => ({ cue: vi.fn() }));
vi.mock('../audio/director', () => ({
  audioDirector: { setTension: vi.fn() },
}));
// The viz canvases and the focused/broken overlays are irrelevant here — stub them.
vi.mock('./viz', () => {
  const Stub = () => <div data-testid="viz-stub" />;
  return {
    VIZ_BY_KEY: {
      entropy: Stub,
      expansion: Stub,
      fluctuations: Stub,
      shape: Stub,
      darkEnergy: Stub,
      temperature: Stub,
    },
  };
});
vi.mock('./FocusedView', () => ({ FocusedView: () => <div data-testid="focused-view" /> }));
vi.mock('./BrokenState', () => ({ BrokenState: () => <div data-testid="broken-state" /> }));

import { cue } from '../audio/cues';
import { audioDirector } from '../audio/director';

const KEY = 'ftu-progress-v1';

function seed(experiencedIds: string[]) {
  const components = Object.fromEntries(
    experiencedIds.map((id) => [id, { interacted: true, lessonOpened: true }])
  );
  localStorage.setItem(KEY, JSON.stringify({ version: 1, prologueSeen: true, components }));
}

function renderInstrument() {
  render(
    <ProgressionProvider>
      <Instrument />
    </ProgressionProvider>
  );
}

/** The grid slider for a param (MobileStepper may render a second one — take the first). */
function slider(name: string): HTMLElement {
  return screen.getAllByRole('slider', { name })[0];
}

function cueCalls(name: string): number {
  return vi.mocked(cue).mock.calls.filter((c) => c[0] === name).length;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.mocked(cue).mockClear();
  vi.mocked(audioDirector.setTension).mockClear();
});

describe('Instrument — tension', () => {
  it('reports calm tension (0) at default slider values', () => {
    renderInstrument();
    expect(audioDirector.setTension).toHaveBeenCalledWith(0);
  });

  it('raises tension when a scored slider leaves its band', () => {
    renderInstrument();
    // End = slam entropy to its max (10 S/k) — score 0, total drops to 0.6.
    fireEvent.keyDown(slider('Initial Entropy'), { key: 'End' });
    const last = vi.mocked(audioDirector.setTension).mock.calls.at(-1)![0];
    expect(last).toBeCloseTo(0.4, 5);
  });
});

describe('Instrument — cues', () => {
  it('fires lesson-open when a lesson is opened', () => {
    renderInstrument();
    fireEvent.click(screen.getAllByRole('button', { name: /read the lesson/i })[0]);
    expect(cueCalls('lesson-open')).toBe(1);
  });

  it('fires broken exactly once per live break', () => {
    renderInstrument();
    expect(cueCalls('broken')).toBe(0);
    fireEvent.keyDown(slider('Initial Entropy'), { key: 'End' });
    expect(cueCalls('broken')).toBe(1);
    // Still broken — nudging further must not re-fire.
    fireEvent.keyDown(slider('Initial Entropy'), { key: 'ArrowDown' });
    expect(cueCalls('broken')).toBe(1);
  });

  it('fires component-complete when a component becomes experienced live', async () => {
    renderInstrument();
    // Wait for hydration so the baseline is recorded before we interact.
    await waitFor(() => expect(audioDirector.setTension).toHaveBeenCalled());
    // ArrowRight = small in-band nudge → marks interacted without breaking anything.
    fireEvent.keyDown(slider('Initial Entropy'), { key: 'ArrowRight' });
    expect(cueCalls('component-complete')).toBe(0);
    fireEvent.click(screen.getAllByRole('button', { name: /read the lesson/i })[0]);
    await waitFor(() => expect(cueCalls('component-complete')).toBe(1));
  });

  it('does NOT chime for a returning visitor whose components are already done', async () => {
    seed(['ch01:entropy', 'ch01:expansion']);
    renderInstrument();
    await waitFor(() => expect(audioDirector.setTension).toHaveBeenCalled());
    expect(cueCalls('component-complete')).toBe(0);
  });

  it('leaves the sixth completion to the chapter-complete cadence', async () => {
    // Everything done except entropy — completing it completes the chapter.
    seed(PARAMS.filter((p) => p.key !== 'entropy').map((p) => `ch01:${p.key}`));
    renderInstrument();
    await waitFor(() => expect(audioDirector.setTension).toHaveBeenCalled());
    fireEvent.keyDown(slider('Initial Entropy'), { key: 'ArrowRight' });
    fireEvent.click(screen.getAllByRole('button', { name: /read the lesson/i })[0]);
    await waitFor(() => expect(cueCalls('lesson-open')).toBe(1));
    expect(cueCalls('component-complete')).toBe(0);
  });
});
```

Notes for the implementer:
- The cards render in `PARAMS` order, so "the first Read the lesson button" belongs to `entropy`. `GoldilocksSlider` gives interactive sliders `role="slider"` with `aria-label` = the param name; `End` emits position 1, `ArrowRight` emits +0.01 (entropy default 1 → ≈1.099, still inside band [0.5, 1.5]).
- `ProgressionProvider` hydrates from localStorage in a mount effect; within React Testing Library's `act` this lands before the first assertion, but the `waitFor` guards make the ordering explicit.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/hifi/ch01/Instrument.test.tsx`
Expected: FAIL — `setTension` never called, `cue` never called (the wiring doesn't exist yet). If it fails on rendering instead (e.g. an unmocked import), fix the mocks, not the component.

- [ ] **Step 3: Implement the wiring in `Instrument.tsx`**

Four edits to `src/components/hifi/ch01/Instrument.tsx`:

**(a)** Update the react import (line 3) and add the audio imports after the existing imports (after line 11):

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
```

```tsx
import { cue } from '../audio/cues';
import { audioDirector } from '../audio/director';
```

**(b)** Pull `componentState` and `hydrated` from progression (line 60):

```tsx
  const { markInteracted, markLessonOpened, componentState, hydrated } = useProgression();
```

**(c)** Add the lesson-open cue inside `openFocused` (currently lines 87–93):

```tsx
  const openFocused = useCallback(
    (key: ParamKey) => {
      setFocusedKey(key);
      markLessonOpened(`ch01:${key}`);
      cue('lesson-open');
    },
    [markLessonOpened]
  );
```

**(d)** After the existing `useMemo` block (ends line 116) and the `const warn = outsideBandCount > 0;` line, add the three audio effects — the final block reads:

```tsx
  const warn = outsideBandCount > 0;

  // Sliders drive musical tension (spec §7): `total` is the score in 0..1
  // (1.0 = all bands centred), so tension is simply its inverse.
  useEffect(() => {
    audioDirector.setTension(1 - total);
  }, [total]);

  // Falling gesture the moment the universe breaks — live flips only.
  const prevWarn = useRef(false);
  useEffect(() => {
    if (!prevWarn.current && warn) cue('broken');
    prevWarn.current = warn;
  }, [warn]);

  // Chime when a component is newly experienced. The first post-hydration run
  // records the baseline (returning visitors get no chime volley), and the
  // sixth completion is left to ChapterTransition's chapter-complete cadence.
  const doneCount = PARAMS.filter((p) => {
    const s = componentState(`ch01:${p.key}`);
    return s.interacted && s.lessonOpened;
  }).length;
  const prevDone = useRef<number | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (prevDone.current !== null && doneCount > prevDone.current && doneCount < PARAMS.length) {
      cue('component-complete');
    }
    prevDone.current = doneCount;
  }, [hydrated, doneCount]);
```

Keep everything after (`const inBandCount = ...` onward) unchanged.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/hifi/ch01/Instrument.test.tsx`
Expected: PASS (7 tests).

- [ ] **Step 5: Run the whole suite, lint, typecheck, commit**

```bash
npx vitest run
npx eslint src/components/hifi/ch01/Instrument.tsx src/components/hifi/ch01/Instrument.test.tsx
npx tsc --noEmit
git add src/components/hifi/ch01/Instrument.tsx src/components/hifi/ch01/Instrument.test.tsx
git commit -m "feat: drive tension and audio cues from the ch01 instrument"
```

---

### Task 5: App shell — enableFromPref on Begin + chapter crossfades

**Files:**
- Modify: `src/components/universe-builder/UniverseBuilderApp.tsx`
- Test: `src/components/universe-builder/UniverseBuilderApp.test.tsx` (new)

Wire `useChapterAudio` to the view state and call `audioDirector.enableFromPref()` inside the "Begin the descent" click handler (a real user gesture, as the autoplay policy requires). Scope note: only the Begin gesture gets `enableFromPref` per issue #31 — visitors who jump straight in via the chapter index can use the nav SoundToggle.

- [ ] **Step 1: Write the failing test**

Create `src/components/universe-builder/UniverseBuilderApp.test.tsx`:

```tsx
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import UniverseBuilderApp from './UniverseBuilderApp';

// framer-motion's exit animations never finish under jsdom (no rAF loop), so
// AnimatePresence mode="wait" would strand the old view. Render pass-through.
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  },
}));

// The chapter frame pulls in canvas-heavy visualizations — keep the shell only.
vi.mock('../hifi/ChapterFrame', () => ({
  ChapterFrame: ({ children, transition }: { children?: ReactNode; transition?: ReactNode }) => (
    <div data-testid="chapter-frame">
      {children}
      {transition}
    </div>
  ),
}));
vi.mock('../hifi/HifiBackdrop', () => ({ HifiBackdrop: () => <div /> }));

vi.mock('./sections/BeginningSection', () => ({ default: () => <div data-testid="section-0" /> }));
vi.mock('./sections/MatterSection', () => ({ default: () => <div data-testid="section-1" /> }));
vi.mock('./sections/StarlightSection', () => ({ default: () => <div data-testid="section-2" /> }));
vi.mock('./sections/GalacticHeartSection', () => ({ default: () => <div data-testid="section-3" /> }));
vi.mock('./sections/PlanetsSection', () => ({ default: () => <div data-testid="section-4" /> }));
vi.mock('./sections/AbiogenesisLabSection', () => ({ default: () => <div data-testid="section-5" /> }));
vi.mock('./sections/LifeSection', () => ({ default: () => <div data-testid="section-6" /> }));

// Full director shape — SoundToggle (in TopNav) needs getState/subscribe.
vi.mock('../hifi/audio/director', () => ({
  audioDirector: {
    getState: () => ({ enabled: false, loading: false }),
    subscribe: () => () => {},
    enable: vi.fn(async () => {}),
    enableFromPref: vi.fn(async () => {}),
    disable: vi.fn(),
    setChapter: vi.fn(),
    setTension: vi.fn(),
    cue: vi.fn(),
  },
}));
import { audioDirector } from '../hifi/audio/director';

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  cleanup();
  vi.mocked(audioDirector.setChapter).mockClear();
  vi.mocked(audioDirector.enableFromPref).mockClear();
});

describe('UniverseBuilderApp — audio wiring', () => {
  it('starts on the landing view with the prologue palette', () => {
    render(<UniverseBuilderApp />);
    expect(audioDirector.setChapter).toHaveBeenCalledWith('prologue');
    expect(audioDirector.enableFromPref).not.toHaveBeenCalled();
  });

  it('Begin the descent re-enables from the preference and crossfades to ch01', () => {
    render(<UniverseBuilderApp />);
    fireEvent.click(screen.getByRole('button', { name: /begin the descent/i }));
    expect(audioDirector.enableFromPref).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('section-0')).toBeTruthy();
    expect(audioDirector.setChapter).toHaveBeenLastCalledWith('ch01');
  });

  it('keyboard navigation crossfades chapter by chapter', () => {
    render(<UniverseBuilderApp />);
    fireEvent.click(screen.getByRole('button', { name: /begin the descent/i }));
    // Fire on body, not window — the app's key handler calls target.closest(),
    // which window doesn't have (real key events always target a DOM node).
    fireEvent.keyDown(document.body, { key: 'ArrowRight' });
    expect(audioDirector.setChapter).toHaveBeenLastCalledWith('ch02');
    fireEvent.keyDown(document.body, { key: 'ArrowLeft' });
    expect(audioDirector.setChapter).toHaveBeenLastCalledWith('ch01');
    fireEvent.keyDown(document.body, { key: 'ArrowLeft' });
    expect(audioDirector.setChapter).toHaveBeenLastCalledWith('prologue');
  });
});
```

Note: the Begin button is always in the DOM (its reveal is CSS-class-driven), so no timer juggling is needed even while the prologue is still animating.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/universe-builder/UniverseBuilderApp.test.tsx`
Expected: FAIL — `setChapter`/`enableFromPref` never called. (If it fails on render, fix mocks first; the three assertions above are the target.)

- [ ] **Step 3: Implement the wiring**

Three edits to `src/components/universe-builder/UniverseBuilderApp.tsx`:

**(a)** Add imports (after the `HandoffOverlay` import, line 24):

```tsx
import { audioDirector } from '../hifi/audio/director';
import { useChapterAudio } from '../hifi/audio/useChapterAudio';
```

**(b)** Move the `activeChapter` computation up and attach the hook. Delete the existing `const activeChapter = ...` line (currently line 100, just above `return`) and add both lines right after the `goChapter` callback definition (after line 47):

```tsx
  const activeChapter = view.kind === 'chapter' ? view.index : null;
  useChapterAudio(activeChapter);
```

**(c)** Wire the Begin gesture — replace `<PrologueLanding onBegin={() => goChapter(0)} onSelectChapter={goChapter} />` (line 123) with:

```tsx
                <PrologueLanding
                  onBegin={() => {
                    // User gesture — the only place the persisted sound pref may re-enable audio.
                    void audioDirector.enableFromPref();
                    goChapter(0);
                  }}
                  onSelectChapter={goChapter}
                />
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/universe-builder/UniverseBuilderApp.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Run the whole suite, lint, typecheck, commit**

```bash
npx vitest run
npx eslint src/components/universe-builder/UniverseBuilderApp.tsx src/components/universe-builder/UniverseBuilderApp.test.tsx
npx tsc --noEmit
git add src/components/universe-builder/UniverseBuilderApp.tsx src/components/universe-builder/UniverseBuilderApp.test.tsx
git commit -m "feat: wire audio into navigation - enableFromPref on begin, palette crossfade per view"
```

---

### Task 6: Full verification — build, bundle, and a live browser probe

**Files:**
- Create: `/tmp/ftu-p5-probe.mjs` (throwaway — NOT committed)

Issue #31's last criterion is empirical: "no audio artifacts on rapid navigation; disable stops everything cleanly." We can't assert sound waves, but we can assert the failure modes that produce artifacts: uncaught exceptions, unhandled rejections, and console errors while hammering navigation with audio enabled, plus a clean disable mid-crossfade.

- [ ] **Step 1: Full test suite + production build**

```bash
npx vitest run
npm run build
```

Expected: all tests green (~100 tests / 21 files); build succeeds. In the build output, `/experience` must still be ~233 kB Size / ~346 kB First Load JS (baseline before this branch) — the new modules are a few hundred bytes and `tone` must remain in its lazy chunk. If First Load JS jumps by more than ~5 kB, something imported `tone` statically — stop and investigate.

- [ ] **Step 2: Start the production server**

```bash
npm run start -- -p 3111 &
```

(Production server, not dev — Turbopack dev eagerly fetches async chunks and pollutes network/console observations.)

- [ ] **Step 3: Write the probe**

Create `/tmp/ftu-p5-probe.mjs`:

```js
// P5 probe — rapid navigation with audio enabled must produce zero errors,
// and disable must land cleanly mid-crossfade. Borrows Playwright from paperclip.
import { createRequire } from 'node:module';
const require = createRequire('/home/jayan/projects/paperclip/package.json');
const { chromium } = require('playwright');

const results = [];
const check = (name, ok, detail = '') =>
  results.push({ name, ok, detail }) && console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

await page.goto('http://localhost:3111/experience', { waitUntil: 'networkidle' });

// T1: enable sound from the nav toggle (user gesture → Tone loads + starts).
const toggle = page.getByRole('button', { name: /sound/i });
await toggle.click();
await page.waitForFunction(
  () => document.body.textContent.includes('Sound · on'),
  null,
  { timeout: 15000 }
);
check('T1 sound enables from the nav toggle', true);

// T2: Begin the descent → ch01 (prologue → ch01 crossfade underneath).
await page.getByRole('button', { name: /begin the descent/i }).click();
await page.waitForTimeout(600);
check(
  'T2 begin the descent lands on chapter 01',
  (await page.getByRole('button', { name: /begin the descent/i }).count()) === 0
);

// T3: rapid keyboard navigation across all chapters, both directions.
for (let i = 0; i < 6; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(120); }
for (let i = 0; i < 6; i++) { await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(120); }
check('T3 rapid navigation survives', true);

// T4: disable mid-crossfade — navigate then immediately toggle off.
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(200);
await toggle.click();
await page.waitForFunction(
  () => document.body.textContent.includes('Sound · off'),
  null,
  { timeout: 5000 }
);
check('T4 disable lands cleanly mid-crossfade', true);

// T5: re-enable after disable still works.
await toggle.click();
await page.waitForFunction(
  () => document.body.textContent.includes('Sound · on'),
  null,
  { timeout: 15000 }
);
check('T5 re-enable after disable works', true);

// T6: zero console/page errors across the whole session.
check('T6 zero console errors', errors.length === 0, errors.slice(0, 5).join(' | '));

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
```

- [ ] **Step 4: Run the probe**

```bash
node /tmp/ftu-p5-probe.mjs
```

Expected: `6/6 passed`. If T6 fails, read the captured errors — a `The AudioContext was not allowed to start` message would mean the gesture wiring regressed; a Tone.js disposal error would point at rapid `setChapter` racing `disable()`.

- [ ] **Step 5: Stop the server, final commit if anything changed**

```bash
kill %1 2>/dev/null || pkill -f "next start" || true
git status
```

No probe files are committed. If Steps 1–4 forced any fixes, commit them with a descriptive `fix:` message and re-run the suite.

---

## Out of scope (deliberate)

- **Palette motifs on component-complete:** `ChapterPalette.motifs` stays unwired — the engine's `cue()` API has no per-component input, no registered palette defines motifs yet, and issue #31 only requires the component-complete cue. Wire motifs when a Wave-2 chapter actually ships one.
- **`enableFromPref` on chapter-index clicks / rail clicks:** only "Begin the descent" per the issue. The nav SoundToggle covers every other entry path.
- **Chapters 02–07 palettes:** fall back to `DEFAULT_PALETTE` until C2–C7.
- **Engine `stopLayer` setTimeout after dispose** (P4 carry-forward): cosmetic, unchanged — the timer fires against already-disposed nodes whose methods are no-ops in Tone.
