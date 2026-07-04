# P3: Earned Chapter Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every chapter ends with a dormant/earned transition block (spec §6, issue #29): veiled next-chapter title + component checklist while components remain; veil lifts with a "Descend ↓" button and a `cue('chapter-complete')` when all components are experienced; Descend plays a ~2.5s skippable collapse → time-roll → bloom handoff.

**Architecture:** A new `ChapterTransition` component reads the P1 progression engine (`useProgression`) and renders per-chapter dormant/earned states inside a new `transition` slot at the bottom of `ChapterFrame` (replacing the old "Next chapter" footer button). A full-screen `HandoffOverlay` lives in `UniverseBuilderApp`; Descend mounts it, it navigates mid-sequence via `goChapter`, then unmounts. A tiny no-op `cue()` stub ships now; P4/P5 replace it with the real AudioDirector. Rail/HUD/keyboard/index navigation stay ungated (soft gate).

**Tech Stack:** Next.js 15 App Router (client components), React 19, existing P1 progression context, Vitest 4 + jsdom + @testing-library/react (NO jest-dom matchers; explicit `cleanup()` required), CSS in `src/app/globals.css` using existing custom properties.

---

## Codebase facts you need (read this first)

- **Progression API** (`src/components/hifi/progression/ProgressionContext.tsx`): `useProgression()` → `{ state, hydrated, prologueSeen, markInteracted(id), markLessonOpened(id), markPrologueSeen(), markLegacyVisit(i), componentState(id) → { interacted, lessonOpened }, chapterProgress(i) → { done, total, complete }, frontierChapter() }`. **Hydration REPLACES state** — anything that must not fire from a mount-time read must be gated on `hydrated`.
- **Registry** (`src/components/hifi/progression/registry.ts`): `CHAPTER_COMPONENTS[i] = { chapterIndex, legacy, components: [{ id, name }] }`. Ch01 (index 0) has six real components with ids `ch01:entropy`, `ch01:expansion`, `ch01:fluctuations`, `ch01:shape`, `ch01:darkEnergy`, `ch01:temperature` (names: Initial Entropy, Expansion Rate, Density Fluctuations, Universe Shape, Dark Energy Λ, CMB Uniformity). Chapters 1–6 are legacy with a single `chNN:legacy` component auto-completed on visit — so their dormant state is transient by design.
- **Chapters** (`src/components/hifi/chapters.ts`): `CHAPTERS[i] = { n: '01', t: 'Beginning', long: 'The Beginning', d, era: '13.8 Bya' }` … index 6 is `{ n: '07', …, era: 'now' }`.
- **Persistence**: localStorage key `ftu-progress-v1`, shape `{ version: 1, prologueSeen, components: { [id]: { interacted, lessonOpened } } }`. Seeding this key **before rendering** `ProgressionProvider` is how tests control progression state.
- **Test infra gotchas**: vitest config has NO `globals: true`, so RTL auto-cleanup never registers — every component test file MUST `import { cleanup } from '@testing-library/react'` and call it in `afterEach`. No jest-dom — use plain assertions (`expect(el.textContent).toContain(...)`, `expect(el.className).toContain(...)`). Don't mix fake timers with `waitFor` — inject small real delays via props (test seams). jsdom lacks `scrollIntoView` — stub it on `HTMLElement.prototype`.
- **App shell** (`src/components/universe-builder/UniverseBuilderApp.tsx`): `view` state (`landing` | `chapter,index`), `goChapter(index)` clamps 0–6, global ArrowRight/ArrowLeft keydown handler that already early-returns when `document.querySelector('.focus-modal')` exists — the handoff overlay uses the same pattern with `.handoff`.
- **Approved mockup** (visual reference, on `design/navigation-redesign` branch): `docs/superpowers/mockups/navigation-redesign/02-transition.html`. Extract with `git show design/navigation-redesign:docs/superpowers/mockups/navigation-redesign/02-transition.html > /tmp/ftu-p3/02-transition.html` if you want to look.
- Run tests: `npx vitest run <path>` or `npm test` (all). Lint: `npm run lint`. Types+prod build: `npm run build`.

## File structure

- Create `src/components/hifi/audio/cues.ts` (+ `cues.test.ts`) — no-op cue stub, replaced by P4/P5.
- Create `src/components/hifi/transition/ChapterTransition.tsx` (+ `.test.tsx`) — dormant/earned block + ch07 closing block + cue firing.
- Create `src/components/hifi/motion.ts` — shared `prefersReducedMotion()` (extracted from PrologueHero).
- Create `src/components/hifi/transition/HandoffOverlay.tsx` (+ `.test.tsx`) — 3-beat skippable overlay.
- Modify `src/components/hifi/ch01/ParameterCard.tsx` — add DOM anchor id `comp-ch01:<key>` for checklist scroll-to.
- Modify `src/components/hifi/prologue/PrologueHero.tsx` — import shared `prefersReducedMotion`.
- Modify `src/components/hifi/ChapterFrame.tsx` — add `transition` slot; delete `nextTitle`/`nextLabel`/`onNext` footer button.
- Modify `src/components/hifi/chapterContent.tsx` — delete now-dead `nextTitle`/`nextLabel` fields.
- Modify `src/components/universe-builder/UniverseBuilderApp.tsx` — handoff state, Descend wiring, keydown guard.
- Modify `src/app/globals.css` — append "Chapter transition (P3)" block.

---

### Task 1: Audio cue stub

**Files:**
- Create: `src/components/hifi/audio/cues.ts`
- Test: `src/components/hifi/audio/cues.test.ts`

The spec says `AudioDirector.cue('chapter-complete')` fires on activation but must be a no-op until P5. This stub gives P3 a stable import site and gives tests something to mock.

- [ ] **Step 1: Write the failing test**

Create `src/components/hifi/audio/cues.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { cue, type CueName } from './cues';

describe('cue (P3 stub — real engine lands in P4/P5)', () => {
  it('accepts every cue name without throwing', () => {
    const names: CueName[] = ['lesson-open', 'component-complete', 'chapter-complete', 'broken'];
    for (const name of names) {
      expect(() => cue(name)).not.toThrow();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/hifi/audio/cues.test.ts`
Expected: FAIL — cannot resolve `./cues`.

- [ ] **Step 3: Write minimal implementation**

Create `src/components/hifi/audio/cues.ts`:

```ts
/** One-shot audio cue names (spec §7). */
export type CueName = 'lesson-open' | 'component-complete' | 'chapter-complete' | 'broken';

/** No-op until the AudioDirector lands (P4/P5); P3 calls it at the moment a chapter is earned. */
export function cue(_name: CueName): void {}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/hifi/audio/cues.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/components/hifi/audio/cues.ts src/components/hifi/audio/cues.test.ts
git commit -m "feat: add no-op audio cue stub for P3 transitions"
```

---

### Task 2: ChapterTransition component (dormant / earned / closing)

**Files:**
- Create: `src/components/hifi/transition/ChapterTransition.tsx`
- Modify: `src/components/hifi/ch01/ParameterCard.tsx` (root div, line 43)
- Test: `src/components/hifi/transition/ChapterTransition.test.tsx`

Behavior contract:
- Props: `{ chapterIndex: number; onDescend: () => void }`.
- Last chapter (index `CHAPTERS.length - 1`): render a closing block (placeholder; real content is issue C7) — no descend, no checklist, no cue.
- Otherwise `earned = hydrated && chapterProgress(chapterIndex).complete`:
  - **Dormant** (also the pre-hydration render, so SSR/first client render match): diagonal veil over the block, eyebrow `Next phase · locked behind understanding`, blurred next-chapter title (`CHAPTERS[chapterIndex + 1].long`), era line `CH {next.n} · {next.era}`, a checklist of `CHAPTER_COMPONENTS[chapterIndex].components` (✓ done / ○ open); each **open** item is a `<button>` that scrolls to the DOM element `id="comp-<componentId>"`; a remain line `N component(s) remain — tap one above to jump to it`.
  - **Earned**: `✓ chapter complete` tag, eyebrow `Threshold crossed`, clear glowing title, era roll `CH {next.n} · {CHAPTERS[chapterIndex].era} → {next.era}` (the animation is pure CSS; a `prefers-reduced-motion` media query in Task 5 makes it static — same markup), and a `Descend ↓` button calling `onDescend`.
- `cue('chapter-complete')` fires exactly when `complete` flips false→true **while hydrated and mounted** — never on a mount or hydration that is already complete (returning visitor).

- [ ] **Step 1: Write the failing tests**

Create `src/components/hifi/transition/ChapterTransition.test.tsx`:

```tsx
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { ChapterTransition } from './ChapterTransition';
import { ProgressionProvider, useProgression } from '../progression/ProgressionContext';

vi.mock('../audio/cues', () => ({ cue: vi.fn() }));
import { cue } from '../audio/cues';

const KEY = 'ftu-progress-v1';
const CH01_IDS = [
  'ch01:entropy',
  'ch01:expansion',
  'ch01:fluctuations',
  'ch01:shape',
  'ch01:darkEnergy',
  'ch01:temperature',
];

function seed(experiencedIds: string[]) {
  const components = Object.fromEntries(
    experiencedIds.map((id) => [id, { interacted: true, lessonOpened: true }])
  );
  localStorage.setItem(KEY, JSON.stringify({ version: 1, prologueSeen: true, components }));
}

/** Exposes a button that marks one component fully experienced, to flip earned live. */
function CompleteButton({ id }: { id: string }) {
  const { markInteracted, markLessonOpened } = useProgression();
  return (
    <button
      type="button"
      onClick={() => {
        markInteracted(id);
        markLessonOpened(id);
      }}
    >
      finish-{id}
    </button>
  );
}

function renderTransition(chapterIndex: number, extra?: React.ReactNode) {
  const onDescend = vi.fn();
  render(
    <ProgressionProvider>
      {extra}
      <ChapterTransition chapterIndex={chapterIndex} onDescend={onDescend} />
    </ProgressionProvider>
  );
  return { onDescend };
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.mocked(cue).mockClear();
});

describe('ChapterTransition — dormant', () => {
  it('shows veiled next chapter, checklist marks, and remain count', async () => {
    seed(CH01_IDS.slice(0, 4)); // 4 of 6 experienced
    renderTransition(0);

    await waitFor(() => {
      expect(screen.getByText('2 components remain — tap one above to jump to it')).toBeTruthy();
    });
    const block = document.querySelector('.transition-block')!;
    expect(block.className).toContain('is-dormant');
    expect(block.querySelector('.transition-veil')).toBeTruthy();
    expect(screen.getByText('Next phase · locked behind understanding')).toBeTruthy();
    expect(screen.getByText('Quarks to Atoms')).toBeTruthy();
    expect(document.querySelectorAll('.transition-check.is-done').length).toBe(4);
    expect(document.querySelectorAll('.transition-check.is-todo').length).toBe(2);
    // no descend button while dormant
    expect(screen.queryByRole('button', { name: /descend/i })).toBeNull();
  });

  it('clicking an open checklist item scrolls to its component anchor', async () => {
    seed(CH01_IDS.slice(0, 5)); // Only ch01:temperature (CMB Uniformity) remains
    const scrollSpy = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollSpy;
    const anchor = document.createElement('div');
    anchor.id = 'comp-ch01:temperature';
    document.body.appendChild(anchor);

    renderTransition(0);
    const item = await screen.findByRole('button', { name: /CMB Uniformity/ });
    act(() => item.click());
    expect(scrollSpy).toHaveBeenCalledTimes(1);

    anchor.remove();
  });
});

describe('ChapterTransition — earned', () => {
  it('shows complete tag, era roll from → to, and Descend calls onDescend', async () => {
    seed(CH01_IDS);
    const { onDescend } = renderTransition(0);

    const descend = await screen.findByRole('button', { name: /descend/i });
    const block = document.querySelector('.transition-block')!;
    expect(block.className).toContain('is-earned');
    expect(screen.getByText('✓ chapter complete')).toBeTruthy();
    expect(screen.getByText('13.8 Bya → t + 1μs')).toBeTruthy();
    act(() => descend.click());
    expect(onDescend).toHaveBeenCalledTimes(1);
  });

  it('fires cue(chapter-complete) when completion happens live', async () => {
    seed(CH01_IDS.slice(0, 5));
    renderTransition(0, <CompleteButton id="ch01:temperature" />);

    await screen.findByText('1 component remains — tap one above to jump to it');
    expect(cue).not.toHaveBeenCalled();
    act(() => screen.getByText('finish-ch01:temperature').click());
    await screen.findByRole('button', { name: /descend/i });
    expect(cue).toHaveBeenCalledTimes(1);
    expect(cue).toHaveBeenCalledWith('chapter-complete');
  });

  it('does NOT fire cue when mounted already complete (returning visitor)', async () => {
    seed(CH01_IDS);
    renderTransition(0);
    await screen.findByRole('button', { name: /descend/i });
    expect(cue).not.toHaveBeenCalled();
  });
});

describe('ChapterTransition — final chapter', () => {
  it('renders the closing block instead of a transition', async () => {
    renderTransition(6);
    await waitFor(() => {
      expect(document.querySelector('.transition-closing')).toBeTruthy();
    });
    expect(screen.getByText('End of the descent')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /descend/i })).toBeNull();
    expect(document.querySelector('.transition-check')).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/hifi/transition/ChapterTransition.test.tsx`
Expected: FAIL — cannot resolve `./ChapterTransition`.

- [ ] **Step 3: Implement ChapterTransition**

Create `src/components/hifi/transition/ChapterTransition.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { CHAPTERS } from '../chapters';
import { CHAPTER_COMPONENTS } from '../progression/registry';
import { useProgression } from '../progression/ProgressionContext';
import { cue } from '../audio/cues';

export type ChapterTransitionProps = {
  chapterIndex: number;
  /** Starts the handoff sequence toward chapterIndex + 1. */
  onDescend: () => void;
};

function scrollToComponent(componentId: string) {
  document
    .getElementById(`comp-${componentId}`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * End-of-chapter transition block (spec §6). Dormant while components remain,
 * earned once the chapter is complete. The final chapter renders a closing
 * block instead (placeholder until C7 defines its content).
 */
export function ChapterTransition({ chapterIndex, onDescend }: ChapterTransitionProps) {
  const { hydrated, chapterProgress, componentState } = useProgression();
  const isLast = chapterIndex === CHAPTERS.length - 1;
  const progress = chapterProgress(chapterIndex);
  const earned = hydrated && progress.complete;

  // Fire the completion cue only on a live false→true flip after hydration —
  // never for a returning visitor whose chapter is already complete on mount.
  const prevComplete = useRef<boolean | null>(null);
  useEffect(() => {
    if (isLast || !hydrated) return;
    if (prevComplete.current === false && progress.complete) cue('chapter-complete');
    prevComplete.current = progress.complete;
  }, [isLast, hydrated, progress.complete]);

  if (isLast) {
    return (
      <div className="transition-closing">
        <div className="transition-eyebrow">End of the descent</div>
        <div className="transition-next">You are here.</div>
        <p className="transition-closing-body">
          Seven thresholds, crossed. The full closing sequence arrives with the final
          chapter&apos;s rebuild.
        </p>
      </div>
    );
  }

  const next = CHAPTERS[chapterIndex + 1];
  const current = CHAPTERS[chapterIndex];
  const remaining = progress.total - progress.done;

  if (earned) {
    return (
      <div className="transition-block is-earned">
        <span className="transition-complete-tag">✓ chapter complete</span>
        <div className="transition-eyebrow">Threshold crossed</div>
        <div className="transition-next">{next.long}</div>
        <div className="transition-era">
          CH {next.n} · <span className="transition-roll">{current.era} → {next.era}</span>
        </div>
        <button type="button" className="transition-descend" onClick={onDescend}>
          Descend <span className="transition-descend-arrow">↓</span>
        </button>
      </div>
    );
  }

  const components = CHAPTER_COMPONENTS[chapterIndex].components;

  return (
    <div className="transition-block is-dormant">
      <div className="transition-veil" aria-hidden />
      <div className="transition-eyebrow">Next phase · locked behind understanding</div>
      <div className="transition-next">{next.long}</div>
      <div className="transition-era">CH {next.n} · {next.era}</div>
      <div className="transition-checklist">
        {components.map((c) => {
          const s = componentState(c.id);
          const done = s.interacted && s.lessonOpened;
          return done ? (
            <span key={c.id} className="transition-check is-done">{c.name}</span>
          ) : (
            <button
              key={c.id}
              type="button"
              className="transition-check is-todo"
              onClick={() => scrollToComponent(c.id)}
            >
              {c.name}
            </button>
          );
        })}
      </div>
      <div className="transition-remain">
        {remaining} component{remaining === 1 ? '' : 's'} remain{remaining === 1 ? 's' : ''} — tap
        one above to jump to it
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add the scroll anchor to ParameterCard**

In `src/components/hifi/ch01/ParameterCard.tsx`, change the root div (line 43):

```tsx
    <div id={`comp-ch01:${p.key}`} className={`param-card${warn ? ' warn' : ''}`}>
```

(This is the anchor `scrollToComponent` targets; `document.getElementById` handles the `:` fine. Rebuilt Wave-2 chapters will follow the same `comp-<componentId>` convention.)

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/components/hifi/transition/ChapterTransition.test.tsx`
Expected: PASS (6 tests). If the "remain" text assertions fail, check the singular/plural logic: 2 remaining → "2 components remain — …", 1 remaining → "1 component remains — …".

- [ ] **Step 6: Run the whole suite**

Run: `npm test`
Expected: all existing tests still pass (ParameterCard change is markup-only).

- [ ] **Step 7: Commit**

```bash
git add src/components/hifi/transition/ src/components/hifi/ch01/ParameterCard.tsx
git commit -m "feat: add dormant/earned ChapterTransition block with completion cue"
```

---

### Task 3: HandoffOverlay (collapse → time roll → bloom)

**Files:**
- Create: `src/components/hifi/motion.ts`
- Create: `src/components/hifi/transition/HandoffOverlay.tsx`
- Modify: `src/components/hifi/prologue/PrologueHero.tsx` (lines 11–13 + call sites)
- Test: `src/components/hifi/transition/HandoffOverlay.test.tsx`

Behavior contract:
- Props: `{ fromIndex, toIndex, onArrive, onDone, beatDurationsMs? }`; default beats `[800, 900, 800]` (~2.5s total).
- Full-screen fixed overlay with `className="handoff"` and `data-beat="collapse" | "roll" | "bloom"`.
- Sequence: mount in `collapse`; after beat 1 call `onArrive()` (the parent navigates to `toIndex` under the overlay) and enter `roll` (era text `{CHAPTERS[fromIndex].era} … {CHAPTERS[toIndex].era}`); after beat 2 enter `bloom`; after beat 3 call `onDone()` (parent unmounts).
- Skippable by any click or key: window `pointerdown`/`keydown` → `onArrive()` (guarded so it never fires twice) then `onDone()`.
- `prefers-reduced-motion`: no beats — call `onArrive()` immediately, render a static `from → to` line, call `onDone()` after a short fade (use beat 3's duration as the fade time so tests can shrink it).
- `onArrive` must be called exactly once per mount in every path.

The reduced-motion check moves to a shared helper because PrologueHero already has an identical private copy.

- [ ] **Step 1: Extract the shared reduced-motion helper**

Create `src/components/hifi/motion.ts`:

```ts
export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}
```

In `src/components/hifi/prologue/PrologueHero.tsx`, delete the private helper (lines 11–13):

```ts
function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}
```

and add to the imports at the top:

```ts
import { prefersReducedMotion } from '../motion';
```

Run: `npx vitest run src/components/hifi/prologue/PrologueHero.test.tsx`
Expected: PASS — the existing tests stub `window.matchMedia`, which the shared helper still reads.

- [ ] **Step 2: Write the failing tests**

Create `src/components/hifi/transition/HandoffOverlay.test.tsx`:

```tsx
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { HandoffOverlay } from './HandoffOverlay';

function stubMatchMedia(reduced: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduced && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

function renderOverlay(beats: [number, number, number] = [40, 40, 40]) {
  const onArrive = vi.fn();
  const onDone = vi.fn();
  render(
    <HandoffOverlay
      fromIndex={0}
      toIndex={1}
      onArrive={onArrive}
      onDone={onDone}
      beatDurationsMs={beats}
    />
  );
  return { onArrive, onDone };
}

beforeEach(() => stubMatchMedia(false));
afterEach(() => cleanup());

describe('HandoffOverlay — beats', () => {
  it('runs collapse → roll → bloom, arriving after beat 1 and finishing after beat 3', async () => {
    const { onArrive, onDone } = renderOverlay();
    const overlay = document.querySelector('.handoff')!;
    expect(overlay.getAttribute('data-beat')).toBe('collapse');
    expect(onArrive).not.toHaveBeenCalled();

    await waitFor(() => expect(overlay.getAttribute('data-beat')).toBe('roll'));
    expect(onArrive).toHaveBeenCalledTimes(1);
    // era roll text shows the two chapters' cosmic times
    expect(overlay.textContent).toContain('13.8 Bya');
    expect(overlay.textContent).toContain('t + 1μs');

    await waitFor(() => expect(overlay.getAttribute('data-beat')).toBe('bloom'));
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(onArrive).toHaveBeenCalledTimes(1);
  });
});

describe('HandoffOverlay — skip', () => {
  it('any key skips: arrives once and finishes immediately', async () => {
    const { onArrive, onDone } = renderOverlay([5000, 5000, 5000]);
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    });
    expect(onArrive).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('a click skips too', async () => {
    const { onArrive, onDone } = renderOverlay([5000, 5000, 5000]);
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerdown'));
    });
    expect(onArrive).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('skipping after arrival does not call onArrive twice', async () => {
    const { onArrive, onDone } = renderOverlay([20, 5000, 5000]);
    await waitFor(() => expect(onArrive).toHaveBeenCalledTimes(1));
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    });
    expect(onArrive).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

describe('HandoffOverlay — reduced motion', () => {
  it('arrives immediately, shows a static from → to line, and fades out', async () => {
    stubMatchMedia(true);
    const { onArrive, onDone } = renderOverlay([5000, 5000, 60]);
    const overlay = document.querySelector('.handoff')!;
    expect(onArrive).toHaveBeenCalledTimes(1);
    expect(overlay.getAttribute('data-beat')).toBe('cut');
    expect(overlay.textContent).toContain('13.8 Bya → t + 1μs');
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/components/hifi/transition/HandoffOverlay.test.tsx`
Expected: FAIL — cannot resolve `./HandoffOverlay`.

- [ ] **Step 4: Implement HandoffOverlay**

Create `src/components/hifi/transition/HandoffOverlay.tsx`:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { CHAPTERS } from '../chapters';
import { prefersReducedMotion } from '../motion';

export type HandoffOverlayProps = {
  fromIndex: number;
  toIndex: number;
  /** Navigate to toIndex — called exactly once, mid-sequence (or immediately on skip / reduced motion). */
  onArrive: () => void;
  /** Sequence finished — parent unmounts the overlay. */
  onDone: () => void;
  /** Test seam — [collapse, roll, bloom] durations. Beat 3 doubles as the reduced-motion fade time. */
  beatDurationsMs?: [number, number, number];
};

type Beat = 'collapse' | 'roll' | 'bloom' | 'cut';

const DEFAULT_BEATS: [number, number, number] = [800, 900, 800];

/**
 * Full-screen handoff between chapters (spec §6): collapse → time roll → bloom,
 * ~2.5s, skippable by any click or key. Reduced motion: a plain fade cut with a
 * static "from → to" era line.
 */
export function HandoffOverlay({
  fromIndex,
  toIndex,
  onArrive,
  onDone,
  beatDurationsMs = DEFAULT_BEATS,
}: HandoffOverlayProps) {
  const [beat, setBeat] = useState<Beat>(() => (prefersReducedMotion() ? 'cut' : 'collapse'));
  const arrivedRef = useRef(false);
  const callbacksRef = useRef({ onArrive, onDone });
  callbacksRef.current = { onArrive, onDone };

  const [d1, d2, d3] = beatDurationsMs;

  useEffect(() => {
    const arrive = () => {
      if (arrivedRef.current) return;
      arrivedRef.current = true;
      callbacksRef.current.onArrive();
    };
    const skip = () => {
      arrive();
      callbacksRef.current.onDone();
    };

    window.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);

    const timers: ReturnType<typeof setTimeout>[] = [];
    if (beat === 'cut') {
      arrive();
      timers.push(setTimeout(() => callbacksRef.current.onDone(), d3));
    } else {
      timers.push(
        setTimeout(() => {
          arrive();
          setBeat('roll');
        }, d1),
        setTimeout(() => setBeat('bloom'), d1 + d2),
        setTimeout(() => callbacksRef.current.onDone(), d1 + d2 + d3)
      );
    }

    return () => {
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      timers.forEach(clearTimeout);
    };
    // Runs once per mount — beat transitions are driven by the timers above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const from = CHAPTERS[fromIndex];
  const to = CHAPTERS[toIndex];

  return (
    <div className="handoff" data-beat={beat} role="presentation">
      {beat === 'collapse' && <div className="handoff-dot handoff-dot--collapse" aria-hidden />}
      {beat === 'roll' && (
        <div className="handoff-roll">
          <span className="handoff-roll-val">{from.era} … {to.era}</span>
          <span className="handoff-roll-sub">cosmic time fast-forwards</span>
        </div>
      )}
      {beat === 'bloom' && <div className="handoff-dot handoff-dot--bloom" aria-hidden />}
      {beat === 'cut' && (
        <div className="handoff-roll">
          <span className="handoff-roll-val">{from.era} → {to.era}</span>
        </div>
      )}
      {beat !== 'cut' && <span className="handoff-skiphint">click / key = skip</span>}
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/components/hifi/transition/HandoffOverlay.test.tsx`
Expected: PASS (6 tests). If the skip tests flake because jsdom lacks `PointerEvent`, replace `new PointerEvent('pointerdown')` with `new Event('pointerdown')` in the test — the listener doesn't read event properties.

- [ ] **Step 6: Run the whole suite**

Run: `npm test`
Expected: all pass, including the untouched PrologueHero tests against the extracted helper.

- [ ] **Step 7: Commit**

```bash
git add src/components/hifi/motion.ts src/components/hifi/transition/HandoffOverlay.tsx src/components/hifi/transition/HandoffOverlay.test.tsx src/components/hifi/prologue/PrologueHero.tsx
git commit -m "feat: add skippable three-beat HandoffOverlay with reduced-motion cut"
```

---

### Task 4: Wire into ChapterFrame and UniverseBuilderApp

**Files:**
- Modify: `src/components/hifi/ChapterFrame.tsx`
- Modify: `src/components/hifi/chapterContent.tsx`
- Modify: `src/components/universe-builder/UniverseBuilderApp.tsx`

The transition block replaces the old in-flow "Next chapter" footer button (the mockup's tblock IS the chapter bottom). Rail, HUD arrows, keyboard arrows, and the index stay ungated — only this in-flow affordance is progression-aware. `nextTitle`/`nextLabel` become dead and are deleted end-to-end (no backwards-compat shims).

There is no new unit test in this task: the pieces are individually tested (Tasks 2–3) and the composed behavior is verified end-to-end in Task 6. TypeScript (`npm run build`) enforces the prop-threading.

- [ ] **Step 1: Add the `transition` slot to ChapterFrame and delete the next-button footer**

In `src/components/hifi/ChapterFrame.tsx`:

1. In `ChapterFrameProps`, delete these three fields:

```tsx
  /** Title shown in the bottom-right "Next chapter" footer. */
  nextTitle?: ReactNode;
  nextLabel?: ReactNode;
  onNext?: () => void;
```

and add in their place:

```tsx
  /** End-of-chapter transition block (dormant/earned) — rendered after the footer. */
  transition?: ReactNode;
```

2. In the destructured parameters, replace `nextTitle, nextLabel, onNext,` with `transition,`.

3. Replace the footer's next-button cluster — everything from `{nextTitle && (` through the `{!nextTitle && (…End of the descent…)}` fallback — so the actions side keeps only the Previous button:

```tsx
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {onPrev && (
              <button type="button" className="hifi-btn" onClick={onPrev}>
                ← Previous
              </button>
            )}
          </div>
```

4. Delete the trailing `{nextLabel && (…)}` block entirely, and render the transition slot in its place (still inside the padded content div, after the footer):

```tsx
        {transition && <div style={{ marginTop: 72 }}>{transition}</div>}
```

- [ ] **Step 2: Delete the dead fields from chapterContent**

In `src/components/hifi/chapterContent.tsx`:

1. Remove `nextTitle?: ReactNode;` and `nextLabel?: ReactNode;` from the `ChapterContent` type.
2. Remove the `nextTitle: …,` and `nextLabel: …,` lines from **all seven** entries (including chapter 07's `nextTitle: undefined` / `nextLabel: undefined`).

- [ ] **Step 3: Wire handoff state and the transition slot in UniverseBuilderApp**

In `src/components/universe-builder/UniverseBuilderApp.tsx`:

1. Add imports:

```tsx
import { ChapterTransition } from '../hifi/transition/ChapterTransition';
import { HandoffOverlay } from '../hifi/transition/HandoffOverlay';
```

2. Add handoff state after the `cosmicTime` state:

```tsx
  const [handoff, setHandoff] = useState<{ from: number; to: number } | null>(null);
```

3. In the keydown handler, extend the focus-modal guard so arrows are inert during a handoff (the overlay's own keydown skip still runs):

```tsx
      if (document.querySelector('.focus-modal, .handoff')) return;
```

4. In `ChapterView`'s usage inside the `AnimatePresence` block, replace the `onNext={…}` prop with a descend starter:

```tsx
                <ChapterView
                  index={view.index}
                  cosmicTime={cosmicTime}
                  onDescend={() => setHandoff({ from: view.index, to: Math.min(6, view.index + 1) })}
                  onPrev={handlePrev}
                />
```

5. Render the overlay just before `</main>`'s closing sibling — after the `<main>` element, inside the root `.hifi` div:

```tsx
        {handoff && (
          <HandoffOverlay
            fromIndex={handoff.from}
            toIndex={handoff.to}
            onArrive={() => goChapter(handoff.to)}
            onDone={() => setHandoff(null)}
          />
        )}
```

6. Update `ChapterViewProps` and `ChapterView` — replace `onNext?: () => void;` with `onDescend: () => void;`, drop the `onNext`/`nextTitle`/`nextLabel` pass-through, and pass the transition slot:

```tsx
type ChapterViewProps = {
  index: number;
  cosmicTime: number;
  onDescend: () => void;
  onPrev: () => void;
};

function ChapterView({ index, cosmicTime, onDescend, onPrev }: ChapterViewProps) {
  const SectionComponent = SECTION_COMPONENTS[index];
  const content = CHAPTER_CONTENT[index];

  const { markLegacyVisit } = useProgression();
  useEffect(() => {
    markLegacyVisit(index);
  }, [index, markLegacyVisit]);

  return (
    <ChapterFrame
      num={content.num}
      chapterIndex={index}
      era={content.era}
      title={content.title}
      prose={content.prose}
      sliderProps={content.sliderProps}
      ghost={content.ghost}
      onPrev={onPrev}
      visualization={content.visualization}
      transition={<ChapterTransition chapterIndex={index} onDescend={onDescend} />}
    >
      <div className="hifi-section-embed">
        <SectionComponent educatorMode={false} cosmicTime={cosmicTime} />
      </div>
    </ChapterFrame>
  );
}
```

- [ ] **Step 4: Verify types, lint, tests, and build**

Run: `npm test && npm run lint && npm run build`
Expected: all pass. A leftover `nextTitle`/`onNext` reference anywhere will fail the build — that's the enforcement for this task.

- [ ] **Step 5: Commit**

```bash
git add src/components/hifi/ChapterFrame.tsx src/components/hifi/chapterContent.tsx src/components/universe-builder/UniverseBuilderApp.tsx
git commit -m "feat: replace next-chapter footer with earned transition + handoff wiring"
```

---

### Task 5: Transition + handoff CSS

**Files:**
- Modify: `src/app/globals.css` (append at end of file, after the P2 prologue block)

Styles adapted from the approved mockup to the app's existing custom properties (`--void`, `--hair`, `--hair-2`, `--ink`, `--ink-soft`, `--ink-faint`, `--indigo`, `--indigo-glow`, `--goldilocks`, `--warm`, `--f-display`, `--f-mono`). No new variables.

- [ ] **Step 1: Append the CSS block**

Append to `src/app/globals.css`:

```css
/* ============================================================
   Chapter transition (P3) — dormant / earned block + handoff
   ============================================================ */

.transition-block {
  position: relative;
  overflow: hidden;
  max-width: 720px;
  padding: 34px 30px;
  border: 1px solid var(--hair);
  border-radius: 8px;
  background: radial-gradient(ellipse at 50% 120%, var(--void-3) 0%, var(--void) 60%);
}

.transition-eyebrow {
  font-family: var(--f-mono);
  font-size: 9px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--ink-faint);
}

.transition-next {
  margin-top: 10px;
  font-family: var(--f-display);
  font-weight: 300;
  font-size: 34px;
  letter-spacing: -0.02em;
  transition: color 0.9s ease, filter 0.9s ease, text-shadow 0.9s ease;
}

.transition-era {
  margin-top: 6px;
  font-family: var(--f-mono);
  font-size: 11px;
  letter-spacing: 0.2em;
  color: var(--ink-faint);
}

/* --- dormant --- */

.transition-block.is-dormant .transition-next {
  color: var(--ink-faint);
  filter: blur(1.5px);
}

.transition-veil {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(135deg, transparent 0 6px, rgba(3, 3, 8, 0.5) 6px 12px);
  pointer-events: none;
}

.transition-checklist {
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.transition-check {
  font-family: var(--f-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--ink-faint);
  background: none;
  border: 0;
  padding: 0;
}

.transition-check.is-done { color: var(--goldilocks); }
.transition-check.is-done::before { content: '✓ '; }

.transition-check.is-todo {
  cursor: pointer;
  text-decoration: underline dotted;
  text-underline-offset: 3px;
}
.transition-check.is-todo::before { content: '○ '; }
.transition-check.is-todo:hover,
.transition-check.is-todo:focus-visible { color: var(--ink-soft); }

.transition-remain {
  margin-top: 18px;
  font-family: var(--f-mono);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--warm);
}

/* --- earned --- */

.transition-block.is-earned {
  border-color: rgba(122, 123, 255, 0.5);
  box-shadow: 0 0 40px rgba(122, 123, 255, 0.08) inset, 0 0 24px rgba(122, 123, 255, 0.1);
}

.transition-block.is-earned .transition-next {
  color: var(--ink);
  text-shadow: 0 0 24px var(--indigo-glow);
}

.transition-complete-tag {
  position: absolute;
  top: 20px;
  right: 22px;
  font-family: var(--f-mono);
  font-size: 9px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--goldilocks);
}

.transition-roll {
  color: var(--indigo);
  animation: transition-rollpulse 2.4s ease-in-out infinite;
}

@keyframes transition-rollpulse {
  50% { opacity: 0.4; }
}

.transition-descend {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 26px;
  font-family: var(--f-mono);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--void);
  background: var(--ink);
  border: 0;
  padding: 14px 30px;
  border-radius: 4px;
  cursor: pointer;
}

.transition-descend:hover,
.transition-descend:focus-visible {
  box-shadow: 0 0 24px var(--indigo-glow);
}

.transition-descend-arrow {
  animation: transition-descendbob 1.4s ease-in-out infinite;
}

@keyframes transition-descendbob {
  50% { transform: translateY(3px); }
}

/* --- closing block (chapter 07) --- */

.transition-closing {
  max-width: 720px;
  padding: 34px 30px;
  border: 1px solid var(--hair);
  border-radius: 8px;
  background: radial-gradient(ellipse at 50% 120%, var(--void-3) 0%, var(--void) 60%);
}

.transition-closing .transition-next {
  color: var(--ink);
}

.transition-closing-body {
  margin-top: 16px;
  max-width: 420px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--ink-soft);
}

/* --- handoff overlay --- */

.handoff {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--void);
  animation: handoff-fadein 0.3s ease both;
}

@keyframes handoff-fadein {
  from { opacity: 0; }
}

.handoff-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ink);
  box-shadow: 0 0 30px 6px var(--indigo-glow);
}

.handoff-dot--collapse { animation: handoff-shrink 0.8s ease-in both; }

@keyframes handoff-shrink {
  from { transform: scale(9); opacity: 0.25; }
  to { transform: scale(1); opacity: 1; }
}

.handoff-dot--bloom { animation: handoff-bloom 0.8s ease-out both; }

@keyframes handoff-bloom {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(11); opacity: 0.2; }
}

.handoff-roll {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-family: var(--f-mono);
  text-align: center;
}

.handoff-roll-val {
  font-size: 20px;
  letter-spacing: 0.18em;
  color: var(--indigo);
  animation: handoff-flick 0.9s steps(2) infinite;
}

@keyframes handoff-flick {
  50% { opacity: 0.55; }
}

.handoff-roll-sub {
  font-size: 9px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--ink-faint);
}

.handoff-skiphint {
  position: absolute;
  bottom: 14px;
  right: 16px;
  font-family: var(--f-mono);
  font-size: 8px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-faint);
}

@media (prefers-reduced-motion: reduce) {
  .transition-roll,
  .transition-descend-arrow,
  .handoff-roll-val,
  .handoff-dot--collapse,
  .handoff-dot--bloom {
    animation: none;
  }

  .transition-next {
    transition: none;
  }
}

@media (max-width: 640px) {
  .transition-block,
  .transition-closing {
    padding: 26px 20px;
  }

  .transition-next {
    font-size: 27px;
  }

  .transition-complete-tag {
    position: static;
    display: block;
    margin-bottom: 10px;
  }
}
```

- [ ] **Step 2: Visual smoke check**

Run: `npm run dev -- --port 3111` (leave running for Task 6). Open http://localhost:3111, enter Chapter 01, scroll to the bottom. Verify: veiled "Quarks to Atoms" with the diagonal veil, ○ checklist items, warm remain line. Move all six sliders AND open all six lessons (the ⤢/lesson buttons) → block flips to earned with glow + Descend. Click Descend → collapse dot → era roll → bloom → Chapter 02 with HUD 02/07.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: style transition block and handoff overlay"
```

---

### Task 6: End-to-end verification probe

**Files:**
- Create: `/tmp/ftu-p3/verify-transition.js` (throwaway — NOT committed)

Playwright is borrowed from a sibling project (this repo doesn't install it): resolve `@playwright/test` through `/home/jayan/projects/paperclip/package.json` via `createRequire`. The dev server from Task 5 must be running on port 3111 (`npm run dev -- --port 3111`).

- [ ] **Step 1: Write the probe**

Create `/tmp/ftu-p3/verify-transition.js`:

```js
const { createRequire } = require('node:module');
const preq = createRequire('/home/jayan/projects/paperclip/package.json');
const { chromium } = preq('@playwright/test');

const BASE = 'http://localhost:3111';
const KEY = 'ftu-progress-v1';
const CH01_IDS = ['ch01:entropy', 'ch01:expansion', 'ch01:fluctuations', 'ch01:shape', 'ch01:darkEnergy', 'ch01:temperature'];

const results = [];
function check(id, desc, ok, extra = '') {
  results.push({ id, desc, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id} — ${desc}${extra ? ` (${extra})` : ''}`);
}

function seedScript(ids) {
  const components = Object.fromEntries(ids.map((id) => [id, { interacted: true, lessonOpened: true }]));
  return `localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(JSON.stringify({ version: 1, prologueSeen: true, components }))})`;
}

(async () => {
  const browser = await chromium.launch();

  // --- A: dormant state (4/6 experienced) ---
  {
    const page = await browser.newPage();
    await page.addInitScript(seedScript(CH01_IDS.slice(0, 4)));
    await page.goto(BASE);
    await page.getByRole('button', { name: /begin the descent/i }).click();
    const block = page.locator('.transition-block');
    await block.scrollIntoViewIfNeeded();
    check('A1', 'dormant block renders', await block.evaluate((el) => el.classList.contains('is-dormant')));
    check('A2', 'veil present', (await page.locator('.transition-veil').count()) === 1);
    check('A3', 'eyebrow copy', (await block.textContent()).includes('Next phase · locked behind understanding'));
    check('A4', 'checklist 4 done / 2 todo',
      (await page.locator('.transition-check.is-done').count()) === 4 &&
      (await page.locator('.transition-check.is-todo').count()) === 2);
    check('A5', 'remain line', (await block.textContent()).includes('2 components remain'));

    // clicking an open item scrolls to the component card
    const before = await page.evaluate(() => window.scrollY);
    await page.locator('.transition-check.is-todo').first().click();
    await page.waitForTimeout(800);
    const after = await page.evaluate(() => window.scrollY);
    check('A6', 'todo click scrolls to component', after < before, `scrollY ${before} → ${after}`);
    await page.close();
  }

  // --- B: earned state + descend handoff ---
  {
    const page = await browser.newPage();
    await page.addInitScript(seedScript(CH01_IDS));
    await page.goto(BASE);
    await page.getByRole('button', { name: /begin the descent/i }).click();
    const block = page.locator('.transition-block');
    await block.scrollIntoViewIfNeeded();
    check('B1', 'earned block renders', await block.evaluate((el) => el.classList.contains('is-earned')));
    check('B2', 'complete tag', (await block.textContent()).includes('✓ chapter complete'));
    check('B3', 'era roll from → to', (await block.textContent()).includes('13.8 Bya → t + 1μs'));

    await page.getByRole('button', { name: /descend/i }).click();
    check('B4', 'handoff overlay appears', (await page.locator('.handoff').count()) === 1);
    await page.waitForSelector('.handoff', { state: 'detached', timeout: 5000 });
    check('B5', 'lands on chapter 02', (await page.locator('.chapter-hud-counter').textContent()).includes('02 / 07'));
    await page.close();
  }

  // --- C: skip + soft gate ---
  {
    const page = await browser.newPage();
    await page.addInitScript(seedScript(CH01_IDS));
    await page.goto(BASE);
    await page.getByRole('button', { name: /begin the descent/i }).click();
    await page.locator('.transition-block').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: /descend/i }).click();
    await page.waitForSelector('.handoff');
    await page.keyboard.press('Escape'); // any key skips
    await page.waitForSelector('.handoff', { state: 'detached', timeout: 2000 });
    check('C1', 'key skips handoff and still lands on 02',
      (await page.locator('.chapter-hud-counter').textContent()).includes('02 / 07'));

    // soft gate: HUD next works even though chapter 02 is dormant
    await page.locator('.chapter-hud-arrow').nth(1).click();
    await page.waitForTimeout(700);
    check('C2', 'HUD next ungated', (await page.locator('.chapter-hud-counter').textContent()).includes('03 / 07'));
    await page.close();
  }

  // --- D: chapter 07 closing block ---
  {
    const page = await browser.newPage();
    await page.addInitScript(seedScript(CH01_IDS));
    await page.goto(BASE);
    await page.getByRole('button', { name: /begin the descent/i }).click();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(650);
    }
    check('D1', 'on chapter 07', (await page.locator('.chapter-hud-counter').textContent()).includes('07 / 07'));
    const closing = page.locator('.transition-closing');
    await closing.scrollIntoViewIfNeeded();
    check('D2', 'closing block renders', (await closing.count()) === 1);
    check('D3', 'no descend on final chapter', (await page.getByRole('button', { name: /descend/i }).count()) === 0);
    await page.close();
  }

  // --- E: reduced motion ---
  {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.addInitScript(seedScript(CH01_IDS));
    await page.goto(BASE);
    await page.getByRole('button', { name: /begin the descent/i }).click();
    await page.locator('.transition-block').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: /descend/i }).click();
    await page.waitForSelector('.handoff');
    check('E1', 'reduced motion uses fade cut with static from → to', await page.locator('.handoff').evaluate(
      (el) => el.getAttribute('data-beat') === 'cut' && el.textContent.includes('13.8 Bya → t + 1μs')
    ));
    await page.waitForSelector('.handoff', { state: 'detached', timeout: 3000 });
    check('E2', 'reduced-motion handoff lands on 02',
      (await page.locator('.chapter-hud-counter').textContent()).includes('02 / 07'));
    await context.close();
  }

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})();
```

- [ ] **Step 2: Run the probe**

With the dev server from Task 5 still running on port 3111:

Run: `node /tmp/ftu-p3/verify-transition.js`
Expected: `15/15 checks passed`, exit 0. If A6 fails, confirm ParameterCard got the `comp-ch01:<key>` id (Task 2 Step 4). If B5 times out, the overlay's `onDone` never fired — check the timer chain in HandoffOverlay.

- [ ] **Step 3: Full gate**

Run: `npm test && npm run lint && npm run build`
Expected: all green. Do NOT commit the probe file; it lives in /tmp.

- [ ] **Step 4: Commit any straggler fixes**

Only if Steps 2–3 forced code changes:

```bash
git add -u src/
git commit -m "fix: address issues found by transition E2E probe"
```

---

## Issue #29 acceptance criteria → task map

| Criterion | Where |
|---|---|
| Dormant: veil + eyebrow + checklist (✓/○) + scroll-to-component + "N components remain" | Task 2 (component), Task 5 (veil/blur styles), Task 6 A1–A6 |
| Earned: glow, "✓ chapter complete", era roll, Descend, `cue('chapter-complete')` on activation | Tasks 1–2, Task 5, Task 6 B1–B4 |
| Handoff ~2.5s, skippable, collapse → roll → bloom, HUD updates | Task 3, Task 4 (wiring), Task 6 B5/C1 |
| prefers-reduced-motion: fade cut + static from → to | Task 3 (`cut` beat), Task 5 (media query), Task 6 E1–E2 |
| Chapter 07 closing block placeholder | Task 2, Task 6 D1–D3 |
| Rail/HUD/keyboard/index remain ungated | Task 4 (only the footer button is replaced; nothing else touches nav), Task 6 C2 |
