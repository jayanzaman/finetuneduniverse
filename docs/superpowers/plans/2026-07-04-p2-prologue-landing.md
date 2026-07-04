# P2: Cinematic Prologue Landing (Variant B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current `Landing` component with a cinematic full-bleed prologue (three timed reveal lines, skippable, shown once via `prologueSeen`) followed by a scroll-revealed chapter index driven by the P1 progression engine (issue #28, spec §4, mockup Variant B).

**Architecture:** A new `src/components/hifi/prologue/` directory holds a pure status helper (`indexStatus.ts`), a `PrologueHero` (reveal state machine: pending → revealing → resting), a `ChapterIndex` (progression-aware row list), and a `PrologueLanding` composition. `UniverseBuilderApp` swaps `Landing` for `PrologueLanding`; the old `Landing.tsx` and `SeedOrb.tsx` are deleted. Styling is appended to `globals.css` using the existing hifi design tokens.

**Tech Stack:** Next.js (App Router, client components), React 19, Vitest 4 + jsdom + @testing-library/react, Playwright (borrowed from paperclip project) for the E2E probe.

---

## Context an engineer needs

- **P1 progression engine is on `main`** at `src/components/hifi/progression/`:
  - `useProgression()` returns `{ state, hydrated, markInteracted, markLessonOpened, markPrologueSeen, markLegacyVisit, componentState(id), chapterProgress(chapterIndex), frontierChapter() }` (see `ProgressionContext.tsx`).
  - `ChapterProgress = { done: number; total: number; complete: boolean }` (from `store.ts`).
  - `hydrated` is `false` until the mount-time localStorage read lands. **Carried review note from P1:** hydration *replaces* state, so any mount-time `mark*` call fired before `hydrated === true` would be lost/cause churn — all mount-time marks in P2 MUST be gated on `hydrated`.
  - `chapterProgress(i)` **throws on out-of-range indices** — always iterate `CHAPTERS` (7 entries, indices 0–6), never arbitrary indices.
- **Chapter metadata** is `CHAPTERS` in `src/components/hifi/chapters.ts` (fields `n`, `t`, `long`, `d`, `era`; 7 entries).
- **Testing constraints:**
  - jest-dom matchers are NOT installed. Use `toBeTruthy()`, `.textContent`, `toContain()` — never `toBeInTheDocument()` / `toHaveTextContent()`.
  - jsdom lacks `IntersectionObserver` — components using it need a `typeof IntersectionObserver === 'undefined'` guard.
  - Don't use fake timers with `waitFor` — inject tiny real delays via props instead (test seam).
- **Existing test style:** see `src/components/hifi/progression/ProgressionContext.test.tsx` — `renderHook` + `wrapper` + `waitFor(() => expect(result.current.hydrated).toBe(true))`.
- **CSS tokens** in `src/app/globals.css`: `--void`, `--hair`, `--hair-2`, `--ink`, `--ink-mid`, `--ink-soft`, `--ink-faint`, `--indigo`, `--goldilocks`, `--f-display`, `--f-body`, `--f-mono`, `--f-italic`. A global reduced-motion kill-switch exists (`animation-duration: 0.01ms !important` etc. around line 84).
- **Known accepted behavior:** the global keyboard nav in `UniverseBuilderApp` means ArrowRight during the prologue reveal both skips the reveal AND navigates to Chapter 01. This is accepted; do not "fix" it.
- **Worktree setup caveat:** `.worktrees/` is NOT in `.gitignore` on `main` (the ignore entry only exists on the `design/navigation-redesign` branch). Before creating the worktree, add `.worktrees/` to `.gitignore` on main and commit it (per using-git-worktrees skill safety rule).
- **Test commands:** `npm test` (vitest run), `npx tsc --noEmit`, `npx eslint <paths>`. Dev server for E2E: `npm run dev -- --port 3111`.

---

### Task 1: Expose `prologueSeen` selector on ProgressionContext

Carried review note from P1: add a top-level `prologueSeen` boolean to the context value for API symmetry (consumers shouldn't need to reach into `state`).

**Files:**
- Modify: `src/components/hifi/progression/ProgressionContext.tsx`
- Test: `src/components/hifi/progression/ProgressionContext.test.tsx`

- [ ] **Step 1: Write the failing test**

Append inside the existing `describe('useProgression', ...)` block in `src/components/hifi/progression/ProgressionContext.test.tsx`:

```tsx
  it('exposes prologueSeen as a top-level selector', async () => {
    const { result } = renderHook(() => useProgression(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.prologueSeen).toBe(false);

    act(() => result.current.markPrologueSeen());
    expect(result.current.prologueSeen).toBe(true);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/hifi/progression/ProgressionContext.test.tsx`
Expected: FAIL — `result.current.prologueSeen` is `undefined` (type error may surface first via vitest; either failure mode is acceptable).

- [ ] **Step 3: Implement**

In `src/components/hifi/progression/ProgressionContext.tsx`:

1. Add to the `Progression` type, after `hydrated: boolean;`:

```ts
  /** Whether the prologue has been seen (mirrors state.prologueSeen). */
  prologueSeen: boolean;
```

2. Add to the `useMemo` value object, after `hydrated,`:

```ts
      prologueSeen: state.prologueSeen,
```

(No dependency-array change needed — `state` is already a dependency.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/components/hifi/progression/ProgressionContext.test.tsx`
Expected: PASS (all tests, including the new one).

- [ ] **Step 5: Commit**

```bash
git add src/components/hifi/progression/ProgressionContext.tsx src/components/hifi/progression/ProgressionContext.test.tsx
git commit -m "feat: expose prologueSeen selector on ProgressionContext"
```

---

### Task 2: Pure `indexStatus` helper

Maps a chapter's `ChapterProgress` + frontier flag to the index-row status label. Precedence (reconciling spec §4 with the mockup): **complete > progress (done > 0) > frontier > unexplored**. Row *visual* emphasis (indigo styling) tracks the frontier flag independently of the label — that's handled in Task 4's CSS class, not here.

**Files:**
- Create: `src/components/hifi/prologue/indexStatus.ts`
- Test: `src/components/hifi/prologue/indexStatus.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/components/hifi/prologue/indexStatus.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { indexStatus } from './indexStatus';

describe('indexStatus', () => {
  it('labels an untouched non-frontier chapter unexplored', () => {
    expect(indexStatus({ done: 0, total: 6, complete: false }, false)).toEqual({
      kind: 'unexplored',
      label: 'unexplored',
    });
  });

  it('labels the untouched frontier chapter "continue here"', () => {
    expect(indexStatus({ done: 0, total: 6, complete: false }, true)).toEqual({
      kind: 'frontier',
      label: 'continue here →',
    });
  });

  it('shows n/total once any component is experienced, even on the frontier', () => {
    expect(indexStatus({ done: 2, total: 6, complete: false }, true)).toEqual({
      kind: 'progress',
      label: '2/6 experienced',
    });
  });

  it('labels a complete chapter with a check', () => {
    expect(indexStatus({ done: 1, total: 1, complete: true }, false)).toEqual({
      kind: 'complete',
      label: '✓ complete',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/hifi/prologue/indexStatus.test.ts`
Expected: FAIL — cannot resolve `./indexStatus`.

- [ ] **Step 3: Implement**

Create `src/components/hifi/prologue/indexStatus.ts`:

```ts
import type { ChapterProgress } from '../progression/store';

export type IndexStatusKind = 'unexplored' | 'progress' | 'frontier' | 'complete';

export type IndexStatus = { kind: IndexStatusKind; label: string };

export function indexStatus(progress: ChapterProgress, isFrontier: boolean): IndexStatus {
  if (progress.complete) return { kind: 'complete', label: '✓ complete' };
  if (progress.done > 0) {
    return { kind: 'progress', label: `${progress.done}/${progress.total} experienced` };
  }
  if (isFrontier) return { kind: 'frontier', label: 'continue here →' };
  return { kind: 'unexplored', label: 'unexplored' };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/hifi/prologue/indexStatus.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/hifi/prologue/indexStatus.ts src/components/hifi/prologue/indexStatus.test.ts
git commit -m "feat: add indexStatus helper for prologue chapter index"
```

---

### Task 3: PrologueHero component

Full-bleed hero with a three-phase reveal state machine:

- `pending` — waiting for hydration; nothing marked, lines hidden.
- `revealing` — first visit with motion allowed: lines fade in at 0 / 2.2s / 4.4s, begin-row + scroll cue at 6.6s; `markPrologueSeen()` fires at the settle point; any pointerdown/keydown/wheel/touchmove skips straight to `resting` (also marking seen). A "skip ↦" button is visible only during this phase.
- `resting` — returning visitor OR reduced-motion OR post-reveal: everything visible instantly (no transition).

Decisions baked in:
- The phase decision runs **only when `hydrated && phase === 'pending'`** — this satisfies the carried P1 review note (never mark before hydration).
- Reduced-motion detection uses a local `prefersReducedMotion()` helper reading `window.matchMedia` directly (not framer-motion's hook) so jsdom tests can stub it.
- Line/settle delays are props with production defaults (`lineDelaysMs = [0, 2200, 4400]`, `settleDelayMs = 6600`) — the test seam. Tests pass tiny real delays; **do not use fake timers**.

**Files:**
- Create: `src/components/hifi/prologue/PrologueHero.tsx`
- Test: `src/components/hifi/prologue/PrologueHero.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/hifi/prologue/PrologueHero.test.tsx`:

```tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { ProgressionProvider } from '../progression/ProgressionContext';
import { STORAGE_KEY } from '../progression/persistence';
import { PrologueHero } from './PrologueHero';

const wrap = (ui: ReactNode) => render(<ProgressionProvider>{ui}</ProgressionProvider>);

const SEEN = JSON.stringify({ version: 1, prologueSeen: true, components: {} });

function stubMatchMedia(reduced: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: reduced,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
  );
}

afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe('PrologueHero', () => {
  it('reveals lines sequentially on first visit and marks prologueSeen at settle', async () => {
    stubMatchMedia(false);
    const { container } = wrap(
      <PrologueHero onBegin={() => {}} lineDelaysMs={[0, 20, 40]} settleDelayMs={60} />
    );
    const hero = () => container.querySelector('.prologue-hero')!;

    await waitFor(() => expect(hero().getAttribute('data-phase')).toBe('revealing'));
    // Line 1 visible before line 3
    await waitFor(() =>
      expect(container.querySelector('.prologue-l1')!.className).toContain('is-visible')
    );
    expect(container.querySelector('.prologue-l3')!.className).not.toContain('is-visible');

    // After settle: all visible, prologueSeen persisted
    await waitFor(() =>
      expect(container.querySelector('.prologue-l3')!.className).toContain('is-visible')
    );
    await waitFor(() => {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!).prologueSeen).toBe(true);
    });
  });

  it('skips to resting on keydown and marks prologueSeen', async () => {
    stubMatchMedia(false);
    const { container } = wrap(
      <PrologueHero onBegin={() => {}} lineDelaysMs={[0, 5000, 10000]} settleDelayMs={15000} />
    );
    const hero = () => container.querySelector('.prologue-hero')!;
    await waitFor(() => expect(hero().getAttribute('data-phase')).toBe('revealing'));

    fireEvent.keyDown(window, { key: 'Enter' });
    await waitFor(() => expect(hero().getAttribute('data-phase')).toBe('resting'));
    await waitFor(() => {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      expect(JSON.parse(raw!).prologueSeen).toBe(true);
    });
    // Skip button gone in resting phase
    expect(container.querySelector('.prologue-skip')).toBeNull();
  });

  it('rests immediately for returning visitors (prologueSeen already true)', async () => {
    stubMatchMedia(false);
    window.localStorage.setItem(STORAGE_KEY, SEEN);
    const { container } = wrap(<PrologueHero onBegin={() => {}} />);
    await waitFor(() =>
      expect(container.querySelector('.prologue-hero')!.getAttribute('data-phase')).toBe('resting')
    );
    expect(container.querySelector('.prologue-skip')).toBeNull();
  });

  it('rests immediately under prefers-reduced-motion and marks prologueSeen', async () => {
    stubMatchMedia(true);
    const { container } = wrap(<PrologueHero onBegin={() => {}} />);
    await waitFor(() =>
      expect(container.querySelector('.prologue-hero')!.getAttribute('data-phase')).toBe('resting')
    );
    await waitFor(() => {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!).prologueSeen).toBe(true);
    });
  });

  it('fires onBegin when the begin button is clicked', async () => {
    stubMatchMedia(false);
    window.localStorage.setItem(STORAGE_KEY, SEEN);
    const onBegin = vi.fn();
    wrap(<PrologueHero onBegin={onBegin} />);
    const btn = await screen.findByRole('button', { name: /begin the descent/i });
    fireEvent.click(btn);
    expect(onBegin).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/hifi/prologue/PrologueHero.test.tsx`
Expected: FAIL — cannot resolve `./PrologueHero`.

- [ ] **Step 3: Implement**

Create `src/components/hifi/prologue/PrologueHero.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useProgression } from '../progression/ProgressionContext';

type Phase = 'pending' | 'revealing' | 'resting';

const LINE_DELAYS_MS = [0, 2200, 4400];
const SETTLE_DELAY_MS = 6600;

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

export type PrologueHeroProps = {
  onBegin: () => void;
  /** Test seam — per-line reveal delays. */
  lineDelaysMs?: number[];
  /** Test seam — delay before begin-row/scroll-cue reveal + prologueSeen mark. */
  settleDelayMs?: number;
};

export function PrologueHero({
  onBegin,
  lineDelaysMs = LINE_DELAYS_MS,
  settleDelayMs = SETTLE_DELAY_MS,
}: PrologueHeroProps) {
  const { hydrated, prologueSeen, markPrologueSeen } = useProgression();
  const [phase, setPhase] = useState<Phase>('pending');
  const [visibleSteps, setVisibleSteps] = useState(0);

  // Decide the phase once hydration lands. Marks are gated on `hydrated`
  // because hydration replaces state — an earlier mark would be lost.
  useEffect(() => {
    if (!hydrated || phase !== 'pending') return;
    if (prologueSeen) {
      setPhase('resting');
    } else if (prefersReducedMotion()) {
      markPrologueSeen();
      setPhase('resting');
    } else {
      setPhase('revealing');
    }
  }, [hydrated, phase, prologueSeen, markPrologueSeen]);

  // Reveal timers + skip listeners while revealing.
  useEffect(() => {
    if (phase !== 'revealing') return;

    const timers = lineDelaysMs.map((delay, i) =>
      window.setTimeout(() => setVisibleSteps((s) => Math.max(s, i + 1)), delay)
    );
    timers.push(
      window.setTimeout(() => {
        setVisibleSteps(4);
        markPrologueSeen();
      }, settleDelayMs)
    );
    timers.push(window.setTimeout(() => setPhase('resting'), settleDelayMs + 1000));

    const skip = () => {
      markPrologueSeen();
      setPhase('resting');
    };
    window.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);
    window.addEventListener('wheel', skip, { passive: true });
    window.addEventListener('touchmove', skip, { passive: true });

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchmove', skip);
    };
  }, [phase, lineDelaysMs, settleDelayMs, markPrologueSeen]);

  const lineClass = (i: number) =>
    `prologue-line prologue-l${i + 1}${
      phase === 'revealing' && visibleSteps > i ? ' is-visible' : ''
    }`;

  // Begin row + scroll cue share one visibility condition. In `pending` nothing
  // is visible; the CSS makes `resting` opaque instantly regardless of the class.
  const settled = phase === 'resting' || (phase === 'revealing' && visibleSteps >= 4);

  return (
    <section className="prologue-hero" data-phase={phase}>
      {phase === 'revealing' && (
        <button
          type="button"
          className="prologue-skip mono"
          onClick={(e) => {
            // window pointerdown listener already handles the skip;
            // the button exists for discoverability + a11y.
            e.stopPropagation();
            markPrologueSeen();
            setPhase('resting');
          }}
        >
          skip ↦
        </button>
      )}

      <div className="prologue-lines">
        <p className={lineClass(0)}>Our universe runs on a handful of numbers.</p>
        <p className={lineClass(1)}>
          Tune any one of them slightly — and there are no stars, no chemistry, no you.
        </p>
        <p className={lineClass(2)}>
          This is the story of the <em>seven thresholds</em> everything had to cross.
        </p>
      </div>

      <div className={`prologue-begin-row${settled ? ' is-visible' : ''}`}>
        <button type="button" className="prologue-begin mono" onClick={onBegin}>
          Begin the descent
        </button>
      </div>

      <div className={`prologue-scrollcue mono${settled ? ' is-visible' : ''}`} aria-hidden="true">
        <span>the seven chapters</span>
        <span className="prologue-chevron">⌄</span>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/hifi/prologue/PrologueHero.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/hifi/prologue/PrologueHero.tsx src/components/hifi/prologue/PrologueHero.test.tsx
git commit -m "feat: add PrologueHero with timed reveal, skip, and prologueSeen gating"
```

---

### Task 4: ChapterIndex component

Scroll-revealed list of the seven chapters with progression-aware status labels. Rows are always clickable (soft gate). The frontier row gets an `is-frontier` class for visual emphasis. Status text renders as empty string until `hydrated` to avoid an "unexplored" flash before localStorage loads.

**Files:**
- Create: `src/components/hifi/prologue/ChapterIndex.tsx`
- Test: `src/components/hifi/prologue/ChapterIndex.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/hifi/prologue/ChapterIndex.test.tsx`:

```tsx
import { render, waitFor, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { ProgressionProvider } from '../progression/ProgressionContext';
import { STORAGE_KEY } from '../progression/persistence';
import { ChapterIndex } from './ChapterIndex';

const wrap = (ui: ReactNode) => render(<ProgressionProvider>{ui}</ProgressionProvider>);

afterEach(() => {
  window.localStorage.clear();
});

describe('ChapterIndex', () => {
  it('renders all seven chapters with frontier status on chapter 01 for a fresh visitor', async () => {
    const { container } = wrap(<ChapterIndex onSelectChapter={() => {}} />);
    const rows = container.querySelectorAll('.prologue-row');
    expect(rows.length).toBe(7);

    await waitFor(() => expect(rows[0].textContent).toContain('continue here'));
    expect(rows[0].className).toContain('is-frontier');
    expect(rows[1].textContent).toContain('unexplored');
    expect(rows[1].className).not.toContain('is-frontier');
    expect(rows[0].textContent).toContain('The Beginning');
    expect(rows[6].textContent).toContain('Geologic Time');
  });

  it('shows partial progress, complete, and moved frontier from persisted state', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        prologueSeen: true,
        components: {
          'ch01:entropy': { interacted: true, lessonOpened: true },
          'ch02:legacy': { interacted: true, lessonOpened: true },
        },
      })
    );
    const { container } = wrap(<ChapterIndex onSelectChapter={() => {}} />);
    const rows = container.querySelectorAll('.prologue-row');

    await waitFor(() => expect(rows[0].textContent).toContain('1/6 experienced'));
    expect(rows[1].textContent).toContain('✓ complete');
    // Frontier = first incomplete = chapter 0 (only 1/6 done)
    expect(rows[0].className).toContain('is-frontier');
  });

  it('all rows are clickable and report their chapter index (soft gate)', async () => {
    const onSelect = vi.fn();
    const { container } = wrap(<ChapterIndex onSelectChapter={onSelect} />);
    const rows = container.querySelectorAll('.prologue-row');
    fireEvent.click(rows[4]);
    expect(onSelect).toHaveBeenCalledWith(4);
    fireEvent.click(rows[0]);
    expect(onSelect).toHaveBeenCalledWith(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/hifi/prologue/ChapterIndex.test.tsx`
Expected: FAIL — cannot resolve `./ChapterIndex`.

- [ ] **Step 3: Implement**

Create `src/components/hifi/prologue/ChapterIndex.tsx`:

```tsx
'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { CHAPTERS } from '../chapters';
import { useProgression } from '../progression/ProgressionContext';
import { indexStatus } from './indexStatus';

export type ChapterIndexProps = {
  onSelectChapter: (index: number) => void;
};

export function ChapterIndex({ onSelectChapter }: ChapterIndexProps) {
  const { hydrated, chapterProgress, frontierChapter } = useProgression();
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // jsdom (and very old browsers) lack IntersectionObserver — reveal immediately.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const frontier = hydrated ? frontierChapter() : null;

  return (
    <div ref={rootRef} className={`prologue-index${inView ? ' is-inview' : ''}`}>
      {CHAPTERS.map((ch, i) => {
        const status = hydrated ? indexStatus(chapterProgress(i), frontier === i) : null;
        return (
          <button
            key={ch.n}
            type="button"
            className={`prologue-row${frontier === i ? ' is-frontier' : ''}${
              status?.kind === 'complete' ? ' is-complete' : ''
            }`}
            style={{ '--row': i } as CSSProperties}
            onClick={() => onSelectChapter(i)}
          >
            <span className="prologue-row-n mono">{ch.n}</span>
            <span className="prologue-row-title">{ch.long}</span>
            <span className="prologue-row-d">{ch.d}</span>
            <span className="prologue-row-era mono">{ch.era}</span>
            <span className={`prologue-row-status mono status-${status?.kind ?? 'pending'}`}>
              {status?.label ?? ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/hifi/prologue/ChapterIndex.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/hifi/prologue/ChapterIndex.tsx src/components/hifi/prologue/ChapterIndex.test.tsx
git commit -m "feat: add progression-aware ChapterIndex for prologue landing"
```

---

### Task 5: PrologueLanding composition, app wiring, old Landing removal, CSS

Compose hero + index, swap it into `UniverseBuilderApp`, delete the old `Landing`/`SeedOrb` (verified: `Landing` is imported only by `UniverseBuilderApp`, `SeedOrb` only by `Landing`), and append the prologue CSS block to `globals.css`.

**Files:**
- Create: `src/components/hifi/prologue/PrologueLanding.tsx`
- Modify: `src/components/universe-builder/UniverseBuilderApp.tsx` (lines 19 and 120)
- Delete: `src/components/hifi/Landing.tsx`, `src/components/hifi/SeedOrb.tsx`
- Modify: `src/app/globals.css` (append at end)
- Test: `src/components/hifi/prologue/PrologueLanding.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/hifi/prologue/PrologueLanding.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { ProgressionProvider } from '../progression/ProgressionContext';
import { PrologueLanding } from './PrologueLanding';

afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe('PrologueLanding', () => {
  it('renders the hero and the seven-chapter index', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    );
    const { container } = render(
      <ProgressionProvider>
        <PrologueLanding onBegin={() => {}} onSelectChapter={() => {}} />
      </ProgressionProvider>
    );
    expect(container.querySelector('.prologue-hero')).toBeTruthy();
    expect(container.querySelectorAll('.prologue-row').length).toBe(7);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/hifi/prologue/PrologueLanding.test.tsx`
Expected: FAIL — cannot resolve `./PrologueLanding`.

- [ ] **Step 3: Implement PrologueLanding**

Create `src/components/hifi/prologue/PrologueLanding.tsx`:

```tsx
'use client';

import { PrologueHero } from './PrologueHero';
import { ChapterIndex } from './ChapterIndex';

export type PrologueLandingProps = {
  onBegin: () => void;
  onSelectChapter: (index: number) => void;
};

export function PrologueLanding({ onBegin, onSelectChapter }: PrologueLandingProps) {
  return (
    <div className="prologue">
      <PrologueHero onBegin={onBegin} />
      <ChapterIndex onSelectChapter={onSelectChapter} />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/hifi/prologue/PrologueLanding.test.tsx`
Expected: PASS.

- [ ] **Step 5: Wire into UniverseBuilderApp and delete old Landing**

In `src/components/universe-builder/UniverseBuilderApp.tsx`:

1. Replace line 19:

```tsx
import { Landing } from '../hifi/Landing';
```

with:

```tsx
import { PrologueLanding } from '../hifi/prologue/PrologueLanding';
```

2. Replace line 120:

```tsx
                <Landing onBegin={() => goChapter(0)} onSelectChapter={goChapter} />
```

with:

```tsx
                <PrologueLanding onBegin={() => goChapter(0)} onSelectChapter={goChapter} />
```

3. Delete the old components:

```bash
git rm src/components/hifi/Landing.tsx src/components/hifi/SeedOrb.tsx
```

- [ ] **Step 6: Append prologue CSS to globals.css**

Append at the end of `src/app/globals.css`:

```css
/* ============ Prologue landing (P2) ============ */

.prologue-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 34px;
  padding: 0 24px;
  text-align: center;
}

.prologue-lines {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 720px;
}

.prologue-line {
  font-family: var(--f-display);
  font-size: clamp(22px, 3.4vw, 30px);
  line-height: 1.45;
  color: var(--ink-mid);
  opacity: 0;
  transform: translateY(10px);
}

.prologue-l3 {
  font-size: clamp(22px, 4vw, 38px);
  color: var(--ink);
}

.prologue-l3 em {
  font-family: var(--f-italic);
  font-style: italic;
  color: var(--indigo);
}

.prologue-line.is-visible {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.9s ease, transform 0.9s ease;
}

/* Returning visitors / reduced motion: everything instantly visible. */
.prologue-hero[data-phase='resting'] .prologue-line,
.prologue-hero[data-phase='resting'] .prologue-begin-row,
.prologue-hero[data-phase='resting'] .prologue-scrollcue {
  opacity: 1;
  transform: none;
  transition: none;
}

.prologue-skip {
  position: fixed;
  top: 84px;
  right: 28px;
  z-index: 20;
  background: none;
  border: 1px solid var(--hair-2);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-soft);
  cursor: pointer;
}

.prologue-skip:hover {
  color: var(--ink);
  border-color: var(--ink-faint);
}

.prologue-begin-row,
.prologue-scrollcue {
  opacity: 0;
  transition: opacity 0.9s ease;
}

.prologue-begin-row.is-visible,
.prologue-scrollcue.is-visible {
  opacity: 1;
}

.prologue-begin {
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  background: var(--ink);
  color: var(--void);
  border: none;
  border-radius: 2px;
  padding: 14px 30px;
  cursor: pointer;
}

.prologue-begin:hover {
  background: var(--indigo);
  color: var(--ink);
}

.prologue-scrollcue {
  position: absolute;
  bottom: 26px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-faint);
}

.prologue-chevron {
  font-size: 16px;
  animation: prologue-bob 2.2s ease-in-out infinite;
}

@keyframes prologue-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

.prologue-index {
  max-width: 1060px;
  margin: 0 auto;
  padding: 60px 24px 120px;
  display: flex;
  flex-direction: column;
}

.prologue-row {
  display: flex;
  align-items: baseline;
  gap: 22px;
  width: 100%;
  padding: 22px 10px;
  background: none;
  border: none;
  border-bottom: 1px solid var(--hair);
  text-align: left;
  cursor: pointer;
  opacity: 0;
  transform: translateY(12px);
}

.prologue-index.is-inview .prologue-row {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.7s ease, transform 0.7s ease;
  transition-delay: calc(var(--row, 0) * 90ms);
}

.prologue-row:first-child {
  border-top: 1px solid var(--hair);
}

.prologue-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.prologue-row-n {
  font-size: 11px;
  color: var(--ink-faint);
  min-width: 26px;
}

.prologue-row-title {
  font-family: var(--f-display);
  font-size: clamp(18px, 2.4vw, 24px);
  color: var(--ink);
}

.prologue-row.is-frontier .prologue-row-title {
  color: var(--indigo);
}

.prologue-row-d {
  font-family: var(--f-body);
  font-size: 13px;
  color: var(--ink-soft);
  flex: 1;
}

.prologue-row-era {
  font-size: 11px;
  color: var(--ink-faint);
}

.prologue-row-status {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--ink-soft);
  min-width: 130px;
  text-align: right;
}

.prologue-row-status.status-frontier {
  color: var(--indigo);
}

.prologue-row-status.status-complete {
  color: var(--goldilocks);
}

@media (max-width: 640px) {
  .prologue-row {
    flex-wrap: wrap;
    gap: 10px 14px;
  }

  .prologue-row-d {
    display: none;
  }

  .prologue-row-status {
    min-width: 0;
    text-align: left;
    width: 100%;
    padding-left: 40px;
  }

  .prologue-skip {
    top: 72px;
    right: 16px;
  }
}
```

- [ ] **Step 7: Run the full gate**

```bash
npm test
npx tsc --noEmit
npx eslint src/components/hifi/prologue src/components/hifi/progression/ProgressionContext.tsx src/components/universe-builder/UniverseBuilderApp.tsx
```

Expected: all tests pass, no type errors, no lint errors. If `tsc` or `eslint` complain about the removed `Landing`/`SeedOrb`, verify no other file imports them (`grep -rn "Landing\|SeedOrb" src/ --include="*.tsx" --include="*.ts"` should show no imports of the deleted files).

- [ ] **Step 8: Commit**

```bash
git add src/components/hifi/prologue/PrologueLanding.tsx src/components/hifi/prologue/PrologueLanding.test.tsx src/components/universe-builder/UniverseBuilderApp.tsx src/app/globals.css
git commit -m "feat: replace Landing with cinematic PrologueLanding (hero + chapter index)"
```

(The `git rm` from Step 5 is already staged and will be included.)

---

### Task 6: E2E verification probe + final gate + push

Verify the real browser behavior with the borrowed Playwright setup, then run the full gate and push the branch.

**Files:**
- Create: `/tmp/ftu-p2/verify-prologue.js` (throwaway probe, NOT committed)

- [ ] **Step 1: Start the dev server**

```bash
cd <worktree-root> && npm run dev -- --port 3111
```

(run in background; wait for "Ready")

- [ ] **Step 2: Write the probe**

Create `/tmp/ftu-p2/verify-prologue.js`:

```js
// Borrowed Playwright from the paperclip project.
const { createRequire } = require('module');
const preq = createRequire('/home/jayan/projects/paperclip/package.json');
const { chromium } = preq('playwright');

const BASE = 'http://localhost:3111';
const KEY = 'ftu-progress-v1';

async function main() {
  const browser = await chromium.launch();
  let failures = 0;
  const check = (name, ok, detail = '') => {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failures++;
  };

  // --- A: fresh visit reveals, keydown skips, prologueSeen persisted ---
  const ctxA = await browser.newContext();
  const a = await ctxA.newPage();
  await a.goto(BASE);
  await a.waitForSelector('.prologue-hero[data-phase="revealing"]', { timeout: 10000 });
  check('A1 fresh visit enters revealing phase', true);
  await a.keyboard.press('Escape');
  await a.waitForSelector('.prologue-hero[data-phase="resting"]', { timeout: 5000 });
  check('A2 keydown skips to resting', true);
  const seenA = await a.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}').prologueSeen, KEY);
  check('A3 prologueSeen persisted after skip', seenA === true, `got ${seenA}`);

  // --- B: index rows + soft gate ---
  const rowCount = await a.locator('.prologue-row').count();
  check('B1 seven index rows', rowCount === 7, `got ${rowCount}`);
  const row0 = await a.locator('.prologue-row').nth(0).textContent();
  check('B2 chapter 01 shows continue here', row0.includes('continue here'), row0.trim().slice(0, 80));
  await a.locator('.prologue-row').nth(2).click(); // ch03 (legacy)
  await a.waitForTimeout(1500);
  const ch3 = await a.evaluate(
    (k) => JSON.parse(localStorage.getItem(k) || '{}').components?.['ch03:legacy'],
    KEY
  );
  check('B3 clicking row 3 marks ch03:legacy experienced', ch3?.interacted === true && ch3?.lessonOpened === true, JSON.stringify(ch3));

  // --- C: reload rests immediately, statuses reflect progress ---
  await a.goto(BASE);
  await a.waitForSelector('.prologue-hero[data-phase="resting"]', { timeout: 5000 });
  check('C1 returning visitor rests immediately', true);
  const l3Opacity = await a.locator('.prologue-l3').evaluate((el) => getComputedStyle(el).opacity);
  check('C2 line 3 fully visible at rest', l3Opacity === '1', `opacity=${l3Opacity}`);
  const row2Text = await a.locator('.prologue-row').nth(2).textContent();
  check('C3 ch03 row shows complete', row2Text.includes('✓ complete'), row2Text.trim().slice(0, 80));
  const row0b = await a.locator('.prologue-row').nth(0).textContent();
  check('C4 ch01 still frontier', row0b.includes('continue here'), row0b.trim().slice(0, 80));

  // --- D: begin button navigates to chapter 01 ---
  await a.locator('.prologue-begin').click();
  await a.waitForSelector('[role="slider"]', { timeout: 10000 });
  check('D1 begin button opens chapter 01 (slider present)', true);
  await ctxA.close();

  // --- E: reduced motion rests immediately + marks seen ---
  const ctxE = await browser.newContext({ reducedMotion: 'reduce' });
  const e = await ctxE.newPage();
  await e.goto(BASE);
  await e.waitForSelector('.prologue-hero[data-phase="resting"]', { timeout: 5000 });
  check('E1 reduced motion rests immediately', true);
  await e.waitForTimeout(500);
  const seenE = await e.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}').prologueSeen, KEY);
  check('E2 reduced motion marks prologueSeen', seenE === true, `got ${seenE}`);
  await ctxE.close();

  // --- F: mobile has no horizontal overflow ---
  const ctxF = await browser.newContext({ viewport: { width: 375, height: 720 } });
  const f = await ctxF.newPage();
  await f.goto(BASE);
  await f.waitForSelector('.prologue-hero', { timeout: 10000 });
  await f.keyboard.press('Escape');
  await f.waitForTimeout(500);
  const overflow = await f.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  check('F1 no horizontal overflow at 375px', overflow <= 1, `overflow=${overflow}px`);
  await ctxF.close();

  await browser.close();
  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 3: Run the probe**

Run: `node /tmp/ftu-p2/verify-prologue.js`
Expected: `ALL CHECKS PASSED` (12 checks A1–F1).

Known accepted quirk: a keydown during the reveal is also consumed by the app's global ArrowRight/ArrowLeft nav — the probe uses `Escape` which only skips. Do not change the global nav.

- [ ] **Step 4: Stop the dev server, run the final gate**

```bash
npm test
npx tsc --noEmit
npx eslint src/components/hifi/prologue src/components/hifi/progression/ProgressionContext.tsx src/components/universe-builder/UniverseBuilderApp.tsx
```

Expected: all pass.

- [ ] **Step 5: Push the branch**

```bash
git push -u origin feat/p2-prologue-landing
```

---

## Self-review notes (issue #28 acceptance criteria → tasks)

| Criterion | Task |
|---|---|
| Three prologue lines, sequential on first visit | Task 3 (reveal timers) |
| Skippable by click / key / scroll | Task 3 (pointerdown/keydown/wheel/touchmove + skip button) |
| Shown once via `prologueSeen` | Tasks 1 + 3 (selector + resting phase for returning visitors) |
| Full-bleed hero, single "Begin the descent", scroll cue | Tasks 3 + 5 (component + CSS) |
| Scroll-revealed index: number, title, era, description | Task 4 (IntersectionObserver + rows) + Task 5 CSS |
| Statuses: unexplored / n/6 experienced / continue here → / ✓ complete | Task 2 (helper) + Task 4 (wiring) |
| Frontier emphasized | Task 4 (`is-frontier` class) + Task 5 CSS |
| Soft gate (all rows clickable) | Task 4 (buttons, no disabling) |
| prefers-reduced-motion static | Task 3 (resting phase) + E2E check E |
| Mobile layout verified | Task 5 media query + E2E check F |
| Carried note: gate mount-time marks on `hydrated` | Task 3 decide-phase effect |
| Carried note: `prologueSeen` selector | Task 1 |
