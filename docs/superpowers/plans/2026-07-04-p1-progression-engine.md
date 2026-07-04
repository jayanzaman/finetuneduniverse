# P1: Progression Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the progression engine (GitHub issue #27, spec §5): a component registry + localStorage-persisted React context that tracks which chapter components a visitor has experienced (interacted + lesson opened), wired into the Ch01 Instrument and legacy chapters.

**Architecture:** Three small modules under `src/components/hifi/progression/` — a pure data registry deriving from `chapters.ts` and Ch01's `params.ts`, a pure functional store (immutable state transitions + selectors, fully unit-testable), and a thin client-side context provider that hydrates from localStorage after mount (avoids SSR hydration mismatch) and persists on every change. UI wiring is two touch points: `UniverseBuilderApp` (provider + legacy-visit marking) and Ch01 `Instrument` (interaction + lesson events).

**Tech Stack:** Next.js 15 / React 19 / TypeScript. Adds Vitest + jsdom + @testing-library/react as the repo's first test infrastructure (no test runner exists today).

**Branch:** create `feat/p1-progression-engine` off `main` before starting. Do NOT stage the pre-existing local `.gitignore` modification or `.claude/` — always `git add` specific files.

**Naming note:** the registry uses the *code's* canonical component names from `src/components/hifi/ch01/params.ts` (Initial Entropy, Expansion Rate, Density Fluctuations, Universe Shape, Dark Energy Λ, CMB Uniformity). The spec/mockups used draft names for the last three (Quantum Fluctuations / Inflation Field / Curvature) — code is the source of truth.

**localStorage schema (`ftu-progress-v1`):**

```json
{
  "version": 1,
  "prologueSeen": false,
  "components": {
    "ch01:entropy": { "interacted": true, "lessonOpened": false }
  }
}
```

`prologueSeen` is written into the schema now but only consumed by P2.

---

## File structure

| File | Responsibility |
|---|---|
| `vitest.config.ts` (create) | Test runner config (jsdom, React plugin) |
| `src/test/infra.test.ts` (create) | Environment smoke test (jsdom + localStorage available) |
| `src/components/hifi/progression/registry.ts` (create) | Per-chapter component lists; legacy shims for ch 02–07 |
| `src/components/hifi/progression/store.ts` (create) | Pure state: types, transitions, selectors |
| `src/components/hifi/progression/persistence.ts` (create) | load/save with versioning + silent failure |
| `src/components/hifi/progression/ProgressionContext.tsx` (create) | `ProgressionProvider` + `useProgression()` |
| `src/components/universe-builder/UniverseBuilderApp.tsx` (modify) | Wrap in provider; mark legacy visits in `ChapterView` |
| `src/components/hifi/ch01/Instrument.tsx` (modify) | Fire `markInteracted` / `markLessonOpened` |
| Test files colocated: `registry.test.ts`, `store.test.ts`, `persistence.test.ts`, `ProgressionContext.test.tsx` | |

---

### Task 1: Test infrastructure (Vitest)

**Files:**
- Modify: `package.json` (devDependencies + scripts)
- Create: `vitest.config.ts`
- Create: `src/test/infra.test.ts`

- [ ] **Step 1: Install dev dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom
```

Expected: installs succeed; `package.json` devDependencies gains all five packages.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

- [ ] **Step 3: Add test scripts to `package.json`**

In the `"scripts"` block, after `"lint": "eslint"`:

```json
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 4: Create the environment smoke test**

`src/test/infra.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

describe('test environment', () => {
  it('provides a jsdom window with working localStorage', () => {
    window.localStorage.setItem('probe', '1');
    expect(window.localStorage.getItem('probe')).toBe('1');
    window.localStorage.removeItem('probe');
  });
});
```

- [ ] **Step 5: Run the test suite**

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test/infra.test.ts
git commit -m "test: add Vitest infrastructure (jsdom + testing-library)"
```

---

### Task 2: Component registry

**Files:**
- Create: `src/components/hifi/progression/registry.ts`
- Test: `src/components/hifi/progression/registry.test.ts`

Context: `src/components/hifi/chapters.ts` exports `CHAPTERS` — 7 entries `{ n: '01'..'07', t, long, d, era }`. `src/components/hifi/ch01/params.ts` exports `PARAMS` — 6 entries with `key` (`'entropy' | 'expansion' | 'fluctuations' | 'shape' | 'darkEnergy' | 'temperature'`) and `name`. Both are plain data modules (no `'use client'`), safe to import anywhere.

- [ ] **Step 1: Write the failing test**

`src/components/hifi/progression/registry.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- registry`
Expected: FAIL — `Cannot find module './registry'` (or equivalent resolution error).

- [ ] **Step 3: Write the implementation**

`src/components/hifi/progression/registry.ts`:

```ts
import { CHAPTERS } from '../chapters';
import { PARAMS } from '../ch01/params';

export type ComponentDef = {
  /** Globally unique, stable id — persisted in localStorage. Format: `ch<NN>:<key>`. */
  id: string;
  name: string;
};

export type ChapterComponents = {
  chapterIndex: number;
  /** Legacy chapters (not yet rebuilt to the Instrument standard) complete on visit. */
  legacy: boolean;
  components: ComponentDef[];
};

export function legacyComponentId(chapterIndex: number): string {
  return `ch${CHAPTERS[chapterIndex].n}:legacy`;
}

export const CHAPTER_COMPONENTS: ChapterComponents[] = CHAPTERS.map((chapter, i) =>
  i === 0
    ? {
        chapterIndex: 0,
        legacy: false,
        components: PARAMS.map((p) => ({ id: `ch01:${p.key}`, name: p.name })),
      }
    : {
        chapterIndex: i,
        legacy: true,
        components: [{ id: legacyComponentId(i), name: chapter.long }],
      }
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- registry`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/components/hifi/progression/registry.ts src/components/hifi/progression/registry.test.ts
git commit -m "feat: add progression component registry with legacy shims"
```

---

### Task 3: Pure progression store

**Files:**
- Create: `src/components/hifi/progression/store.ts`
- Test: `src/components/hifi/progression/store.test.ts`

Design: immutable transition functions that return the **same reference** when nothing changes (cheap re-render skipping later), plus selectors that combine state with the registry.

- [ ] **Step 1: Write the failing test**

`src/components/hifi/progression/store.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- store`
Expected: FAIL — `Cannot find module './store'`.

- [ ] **Step 3: Write the implementation**

`src/components/hifi/progression/store.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- store`
Expected: 12 passed.

- [ ] **Step 5: Commit**

```bash
git add src/components/hifi/progression/store.ts src/components/hifi/progression/store.test.ts
git commit -m "feat: add pure progression store (transitions + selectors)"
```

---

### Task 4: localStorage persistence

**Files:**
- Create: `src/components/hifi/progression/persistence.ts`
- Test: `src/components/hifi/progression/persistence.test.ts`

- [ ] **Step 1: Write the failing test**

`src/components/hifi/progression/persistence.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { INITIAL_STATE, markExperienced } from './store';
import { STORAGE_KEY, loadState, saveState } from './persistence';

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('persistence round-trip', () => {
  it('uses the versioned key ftu-progress-v1', () => {
    expect(STORAGE_KEY).toBe('ftu-progress-v1');
  });

  it('loads what it saves', () => {
    const s = markExperienced(INITIAL_STATE, 'ch01:entropy');
    saveState(s);
    expect(loadState()).toEqual(s);
  });

  it('returns INITIAL_STATE when nothing is stored', () => {
    expect(loadState()).toEqual(INITIAL_STATE);
  });
});

describe('corrupt or foreign data', () => {
  it('returns INITIAL_STATE for unparseable JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadState()).toEqual(INITIAL_STATE);
  });

  it('returns INITIAL_STATE for a wrong version', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, components: {} }));
    expect(loadState()).toEqual(INITIAL_STATE);
  });

  it('returns INITIAL_STATE for non-object payloads', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify('hello'));
    expect(loadState()).toEqual(INITIAL_STATE);
  });
});

describe('storage failures degrade silently', () => {
  it('saveState swallows quota/security errors', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => saveState(INITIAL_STATE)).not.toThrow();
  });

  it('loadState swallows read errors', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(loadState()).toEqual(INITIAL_STATE);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- persistence`
Expected: FAIL — `Cannot find module './persistence'`.

- [ ] **Step 3: Write the implementation**

`src/components/hifi/progression/persistence.ts`:

```ts
import { INITIAL_STATE, type ProgressState } from './store';

export const STORAGE_KEY = 'ftu-progress-v1';

export function loadState(): ProgressState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return INITIAL_STATE;
    const p = parsed as Partial<ProgressState>;
    if (p.version !== 1) return INITIAL_STATE;
    return {
      version: 1,
      prologueSeen: p.prologueSeen === true,
      components:
        typeof p.components === 'object' && p.components !== null ? p.components : {},
    };
  } catch {
    return INITIAL_STATE;
  }
}

export function saveState(state: ProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode / quota exceeded — progression degrades to in-memory for this session.
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- persistence`
Expected: 8 passed.

- [ ] **Step 5: Commit**

```bash
git add src/components/hifi/progression/persistence.ts src/components/hifi/progression/persistence.test.ts
git commit -m "feat: add versioned localStorage persistence with silent degradation"
```

---

### Task 5: ProgressionProvider + useProgression hook

**Files:**
- Create: `src/components/hifi/progression/ProgressionContext.tsx`
- Test: `src/components/hifi/progression/ProgressionContext.test.tsx`

Design notes:
- Provider initializes with `INITIAL_STATE` and hydrates from localStorage in a mount effect — SSR renders the empty state, so no hydration mismatch. `hydrated` is exposed so P2/P3 UI can avoid flashing "unexplored" before the load.
- Every state change is persisted from an effect (skipped until hydrated so the initial empty state never overwrites saved progress).
- `markLegacyVisit(chapterIndex)` no-ops for non-legacy chapters, so callers don't need to know which chapters have been rebuilt.

- [ ] **Step 1: Write the failing test**

`src/components/hifi/progression/ProgressionContext.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ProgressionContext`
Expected: FAIL — `Cannot find module './ProgressionContext'`.

- [ ] **Step 3: Write the implementation**

`src/components/hifi/progression/ProgressionContext.tsx`:

```tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ProgressionContext`
Expected: 5 passed. (The "throws outside provider" test prints a React error boundary warning to the console — that's expected noise, not a failure.)

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: all files pass (infra, registry, store, persistence, ProgressionContext).

- [ ] **Step 6: Commit**

```bash
git add src/components/hifi/progression/ProgressionContext.tsx src/components/hifi/progression/ProgressionContext.test.tsx
git commit -m "feat: add ProgressionProvider with localStorage hydration"
```

---

### Task 6: Wire provider into the app + legacy visit marking

**Files:**
- Modify: `src/components/universe-builder/UniverseBuilderApp.tsx`

- [ ] **Step 1: Add imports**

At the top of `UniverseBuilderApp.tsx`, after the existing hifi imports (`import { CHAPTER_CONTENT } from '../hifi/chapterContent';`):

```tsx
import { ProgressionProvider, useProgression } from '../hifi/progression/ProgressionContext';
```

Also add `useEffect` — it is already imported (`import { useCallback, useEffect, useState } from 'react';`), so no change needed there.

- [ ] **Step 2: Wrap the app in the provider**

The provider must sit above `ChapterView` (which consumes the context). Change the top-level `return` of `UniverseBuilderApp` from:

```tsx
  return (
    <div className="hifi" style={{ position: 'relative', minHeight: '100vh' }}>
```

to:

```tsx
  return (
    <ProgressionProvider>
      <div className="hifi" style={{ position: 'relative', minHeight: '100vh' }}>
```

and close it — the component's final lines change from:

```tsx
      </main>
    </div>
  );
}
```

to:

```tsx
        </main>
      </div>
    </ProgressionProvider>
  );
}
```

(Re-indent the JSX between them one level; content is unchanged.)

- [ ] **Step 3: Mark legacy visits in `ChapterView`**

In the `ChapterView` function (bottom of the same file), add at the top of the function body:

```tsx
function ChapterView({ index, cosmicTime, onNext, onPrev }: ChapterViewProps) {
  const SectionComponent = SECTION_COMPONENTS[index];
  const content = CHAPTER_CONTENT[index];

  const { markLegacyVisit } = useProgression();
  useEffect(() => {
    markLegacyVisit(index);
  }, [index, markLegacyVisit]);
```

(`markLegacyVisit` is a no-op for chapter 0, so no guard is needed here.)

- [ ] **Step 4: Type-check and test**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors; all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/universe-builder/UniverseBuilderApp.tsx
git commit -m "feat: mount ProgressionProvider and mark legacy chapter visits"
```

---

### Task 7: Wire Ch01 Instrument events

**Files:**
- Modify: `src/components/hifi/ch01/Instrument.tsx`

Rules being implemented: `markInteracted` fires on a direct slider change (the `setValue` path — used by both `ParameterCard`, `MobileStepper`, and `FocusedView` sliders). The "Randomize universe" button does **not** count as interaction. `markLessonOpened` fires whenever a component's focused view opens (both the lesson button and the maximize button open the same `FocusedView`).

- [ ] **Step 1: Add the import and hook**

In `Instrument.tsx`, after `import { PARAMS, isInBand, type ParamKey } from './params';`:

```tsx
import { useProgression } from '../progression/ProgressionContext';
```

At the top of the `Instrument` function body, after the two `useState` lines:

```tsx
  const { markInteracted, markLessonOpened } = useProgression();
```

- [ ] **Step 2: Fire markInteracted from setValue**

Replace:

```tsx
  const setValue = useCallback((key: ParamKey, next: number) => {
    setValues((prev) => ({ ...prev, [key]: next }));
  }, []);
```

with:

```tsx
  const setValue = useCallback(
    (key: ParamKey, next: number) => {
      setValues((prev) => ({ ...prev, [key]: next }));
      markInteracted(`ch01:${key}`);
    },
    [markInteracted]
  );
```

- [ ] **Step 3: Fire markLessonOpened when the focused view opens**

Add below `setValue`:

```tsx
  const openFocused = useCallback(
    (key: ParamKey) => {
      setFocusedKey(key);
      markLessonOpened(`ch01:${key}`);
    },
    [markLessonOpened]
  );
```

Then route all three open paths through it. In the `ParameterCard` render:

```tsx
            onMaximize={() => openFocused(p.key)}
            onReadLesson={() => openFocused(p.key)}
```

And in the `MobileStepper` render:

```tsx
        onMaximize={openFocused}
```

(`MobileStepper`'s `onMaximize` prop receives a `ParamKey`, same signature as `openFocused` — no other change needed.)

- [ ] **Step 4: Type-check and test**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors; all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/hifi/ch01/Instrument.tsx
git commit -m "feat: track Ch01 interactions and lesson opens in progression"
```

---

### Task 8: End-to-end verification and push

**Files:**
- Create (temporary, not committed): `/tmp/ftu-p1/verify-progression.js`

- [ ] **Step 1: Start the dev server**

```bash
npm run dev -- --port 3111
```

Run in the background; wait for "Ready".

- [ ] **Step 2: Write the Playwright probe**

`/tmp/ftu-p1/verify-progression.js` (uses the borrowed Playwright install from the paperclip project — this repo has none):

```js
const { createRequire } = require('module');
const preq = createRequire('/home/jayan/projects/paperclip/package.json');
const { chromium } = preq('@playwright/test');

const KEY = 'ftu-progress-v1';
const read = (page) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), KEY);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const fail = (msg) => { console.error('FAIL:', msg); process.exitCode = 1; };

  await page.goto('http://localhost:3111');
  await page.getByRole('button', { name: /begin/i }).first().click();
  await page.waitForTimeout(800);

  // 1. Slider interaction marks interacted (Radix slider responds to arrow keys)
  const thumb = page.locator('[role="slider"]').first();
  await thumb.focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  let s = await read(page);
  if (!s || !s.components['ch01:entropy']?.interacted) fail('slider did not mark interacted');
  if (s.components['ch01:entropy']?.lessonOpened) fail('lessonOpened set too early');

  // 2. Opening the lesson completes the component
  await page.locator('.param-lesson-btn').first().click();
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  s = await read(page);
  if (!s.components['ch01:entropy']?.lessonOpened) fail('lesson open not marked');

  // 3. Randomize does NOT count as interaction on untouched components
  await page.getByRole('button', { name: /randomize/i }).click();
  await page.waitForTimeout(300);
  s = await read(page);
  if (s.components['ch01:expansion']?.interacted) fail('randomize wrongly marked interacted');

  // 4. Visiting a legacy chapter completes its shim
  await page.keyboard.press('ArrowRight'); // chapter 02
  await page.waitForTimeout(1200);
  s = await read(page);
  if (!s.components['ch02:legacy']?.interacted || !s.components['ch02:legacy']?.lessonOpened)
    fail('legacy visit not marked');

  // 5. State survives reload
  await page.reload();
  await page.waitForTimeout(800);
  s = await read(page);
  if (!s.components['ch01:entropy']?.lessonOpened) fail('state lost on reload');

  console.log(process.exitCode ? 'PROBE FAILED' : 'ALL CHECKS PASSED');
  console.log(JSON.stringify(s, null, 2));
  await browser.close();
})();
```

- [ ] **Step 3: Run the probe**

Run: `mkdir -p /tmp/ftu-p1 && node /tmp/ftu-p1/verify-progression.js`
Expected: `ALL CHECKS PASSED` and a state dump showing `ch01:entropy` fully experienced and `ch02:legacy` experienced.

If check 3 fires because the randomize keyboard press also focused a slider, adjust the probe (click the randomize button via mouse only) — the *app* behavior to preserve is: randomize alone must not set `interacted`.

- [ ] **Step 4: Full gate**

Run: `npm test && npx tsc --noEmit && npx eslint src/components/hifi/progression src/components/hifi/ch01/Instrument.tsx src/components/universe-builder/UniverseBuilderApp.tsx`
Expected: all pass. (Repo-wide lint has ~9900 pre-existing problems — only lint the touched files.)

- [ ] **Step 5: Stop the dev server, push the branch**

```bash
git push -u origin feat/p1-progression-engine
```

Then report completion on issue #27 is handled by the human/orchestrator (PR creation is a separate decision).

---

## Out of scope for P1

- Consuming progression in the landing index, transitions, or audio (P2/P3/P5).
- `prologueSeen` UI (P2) — only the state field ships now.
- Any UI that *displays* progress; this issue is engine + event wiring only. The only observable behavior change is localStorage writes.
