# P4: AudioDirector Generative Audio Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A generative audio engine (GitHub issue #30, spec §7) with a persisted enable/disable preference, a nav sound toggle, and an `enable()/disable()/setChapter()/setTension()/cue()` API — Tone.js dynamically imported only after the visitor enables sound.

**Architecture:** Three layers. (1) `engine.ts` — the only module that touches Tone.js constructors, written against a narrow structural `ToneLike` interface so tests inject a fake and the real module satisfies it. It builds the audio graph: master gain → lowpass filter → per-palette drone layer (crossfaded on chapter change), plus a cue synth for one-shots. (2) `director.ts` — a factory-built singleton that owns state (disabled/loading/enabled), persists the preference, dynamically imports `tone` on first enable, and forwards `setChapter/setTension/cue` (safe no-ops while disabled; pending chapter/tension applied on late enable). (3) UI — a `SoundToggle` in the top nav subscribing via `useSyncExternalStore`. The existing P3 `cues.ts` stub becomes a forwarder to the director, so `ChapterTransition` needs no changes. Palettes are data (`palette.ts` registry with a default); P5 and the C-issues register real per-chapter palettes.

**Tech Stack:** Tone.js 15.1.22 (new runtime dependency, dynamically imported), React 19 `useSyncExternalStore`, Vitest 4 + jsdom + @testing-library/react.

**Scope boundary (P4 vs P5):** P4 ships the engine, toggle, preference, palette format, and cue forwarding. P4 does NOT call `setChapter`/`setTension` from the app, does not add the prologue drone or Ch01 palette, and does not wire "Begin the descent" — that's P5 (#31). After P4, enabling sound plays the default drone and cues fire audibly when chapters complete; that's the expected intermediate state. A returning visitor with the preference on still sees the toggle "off" until a gesture — P5's "Begin the descent" click calls `enableFromPref()` to close that loop.

---

## Repo facts the engineer needs

- Worktree pattern: create `feat/p4-audiodirector` off `main` in `.worktrees/p4-audiodirector` (`git worktree add .worktrees/p4-audiodirector -b feat/p4-audiodirector main`), then `npm install` there. Baseline: `npm test` → 56 tests / 12 files passing.
- Test infra: Vitest 4 + jsdom, NO `globals: true` → React Testing Library auto-cleanup never registers, so component tests MUST call `cleanup()` in `afterEach`. No jest-dom matchers — use `toBeTruthy()`, `toBe()`, etc.
- Lint reality: `npm run lint` exits 1 from pre-existing repo-wide debt in untouched legacy files. The working bar is **no NEW errors on changed paths**: gate with `npx eslint <changed paths>` and `npx tsc --noEmit`, never `npm run lint`.
- Existing files referenced below:
  - `src/components/hifi/audio/cues.ts` — P3 no-op stub exporting `CueName` and `cue()`; `ChapterTransition.tsx` imports `cue` from it (and its test mocks the module path `'../audio/cues'` — the forwarding change in Task 5 must keep that import surface identical).
  - `src/components/hifi/audio/cues.test.ts` — tests the stub; rewritten in Task 5.
  - `src/components/hifi/TopNav.tsx` — 26-line nav; gains the toggle in Task 6.
  - `src/components/hifi/progression/persistence.ts` — the localStorage pattern to mirror (guard `typeof window`, swallow quota errors).
- CSS: `.hifi-nav-links button` styles (globals.css:155–163) already style any button in the nav, including `.active` state — the toggle needs NO new CSS.

---

### Task 1: Install Tone.js + palette module

**Files:**
- Modify: `package.json` (via `npm install tone`)
- Create: `src/components/hifi/audio/palette.ts`
- Test: `src/components/hifi/audio/palette.test.ts`

The palette is the "chapter palette format" acceptance criterion: base drone + per-component motifs + tension mapping + completion cadence. It is pure data — no Tone imports.

- [ ] **Step 1: Install the dependency**

Run: `npm install tone`
Expected: `tone@15.1.22` (or later 15.x) added to `dependencies` in package.json. Commit will include package.json + package-lock.json.

- [ ] **Step 2: Write the failing test**

Create `src/components/hifi/audio/palette.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { DEFAULT_PALETTE, getPalette, registerPalette, type ChapterPalette } from './palette';

describe('palette registry', () => {
  it('falls back to the default palette for unknown ids', () => {
    expect(getPalette('nope')).toBe(DEFAULT_PALETTE);
  });

  it('returns a registered palette by id', () => {
    const p: ChapterPalette = {
      id: 'test-ch',
      drone: { notes: ['A2', 'E3'], gain: 0.4 },
      motifs: { 'test:comp': ['A4', 'C5'] },
      tension: { brightHz: 1000, darkHz: 200, detuneCents: 25 },
      cadence: ['A3', 'E4', 'A4'],
    };
    registerPalette(p);
    expect(getPalette('test-ch')).toBe(p);
  });

  it('default palette has a drone, tension mapping, and cadence', () => {
    expect(DEFAULT_PALETTE.drone.notes.length).toBeGreaterThan(0);
    expect(DEFAULT_PALETTE.tension.brightHz).toBeGreaterThan(DEFAULT_PALETTE.tension.darkHz);
    expect(DEFAULT_PALETTE.cadence.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/components/hifi/audio/palette.test.ts`
Expected: FAIL — cannot resolve `./palette`.

- [ ] **Step 4: Implement the palette module**

Create `src/components/hifi/audio/palette.ts`:

```ts
/**
 * Chapter audio palettes (spec §7): pure data consumed by the engine.
 * P5 and the Wave-2 chapter issues register real palettes; until then
 * every chapter falls back to DEFAULT_PALETTE.
 */
export type ChapterPalette = {
  id: string;
  /** Sustained chord under the whole chapter. gain is the layer's steady level (0..1). */
  drone: { notes: string[]; gain: number };
  /** Optional short motif per component id (P5 wires playback on component-complete). */
  motifs?: Record<string, string[]>;
  /** Tension 0..1 maps the drone filter from brightHz down to darkHz and detunes up to detuneCents. */
  tension: { brightHz: number; darkHz: number; detuneCents: number };
  /** Notes of the chapter-complete cadence, played as a rising resolve. */
  cadence: string[];
};

export const DEFAULT_PALETTE: ChapterPalette = {
  id: 'default',
  drone: { notes: ['C2', 'G2', 'E3'], gain: 0.5 },
  tension: { brightHz: 1200, darkHz: 220, detuneCents: 30 },
  cadence: ['C4', 'G4', 'C5'],
};

const PALETTES: Record<string, ChapterPalette> = { default: DEFAULT_PALETTE };

export function registerPalette(palette: ChapterPalette): void {
  PALETTES[palette.id] = palette;
}

export function getPalette(id: string): ChapterPalette {
  return PALETTES[id] ?? DEFAULT_PALETTE;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/hifi/audio/palette.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/components/hifi/audio/palette.ts src/components/hifi/audio/palette.test.ts
git commit -m "feat: add tone dependency and chapter audio palette registry"
```

---

### Task 2: Persisted audio preference

**Files:**
- Create: `src/components/hifi/audio/preference.ts`
- Test: `src/components/hifi/audio/preference.test.ts`

Mirrors `src/components/hifi/progression/persistence.ts`: window-guarded, quota errors swallowed. Key `ftu-audio-v1`. Sound is off by default; `prefers-reduced-motion` needs no special handling here because nothing ever auto-enables — enabling always requires an explicit gesture (spec: "sound off until explicitly enabled; prefers-reduced-motion keeps it off by default").

- [ ] **Step 1: Write the failing test**

Create `src/components/hifi/audio/preference.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { AUDIO_PREF_KEY, loadAudioPref, saveAudioPref } from './preference';

beforeEach(() => {
  localStorage.clear();
});

describe('audio preference', () => {
  it('defaults to false when nothing is stored', () => {
    expect(loadAudioPref()).toBe(false);
  });

  it('round-trips true and false', () => {
    saveAudioPref(true);
    expect(loadAudioPref()).toBe(true);
    saveAudioPref(false);
    expect(loadAudioPref()).toBe(false);
  });

  it('treats garbage as false', () => {
    localStorage.setItem(AUDIO_PREF_KEY, '{not json');
    expect(loadAudioPref()).toBe(false);
    localStorage.setItem(AUDIO_PREF_KEY, JSON.stringify({ version: 99, enabled: true }));
    expect(loadAudioPref()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/hifi/audio/preference.test.ts`
Expected: FAIL — cannot resolve `./preference`.

- [ ] **Step 3: Implement**

Create `src/components/hifi/audio/preference.ts`:

```ts
export const AUDIO_PREF_KEY = 'ftu-audio-v1';

export function loadAudioPref(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(AUDIO_PREF_KEY);
    if (!raw) return false;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return false;
    const p = parsed as { version?: unknown; enabled?: unknown };
    return p.version === 1 && p.enabled === true;
  } catch {
    return false;
  }
}

export function saveAudioPref(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(AUDIO_PREF_KEY, JSON.stringify({ version: 1, enabled }));
  } catch {
    // Private mode / quota exceeded — preference degrades to in-memory for this session.
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/hifi/audio/preference.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/hifi/audio/preference.ts src/components/hifi/audio/preference.test.ts
git commit -m "feat: add persisted audio enable preference"
```

---

### Task 3: Audio engine (Tone-facing graph)

**Files:**
- Create: `src/components/hifi/audio/engine.ts`
- Test: `src/components/hifi/audio/engine.test.ts`

The only module that touches Tone constructors. It is written against `ToneLike` — the narrow structural subset of the Tone module we actually use — so tests pass a recording fake and the director casts the real dynamic import to it. Graph: `master Gain(0.8) → destination`; `droneFilter Filter(lowpass) → master`; one drone **layer** per active palette (`Gain(0) → droneFilter` + `PolySynth` holding the chord), crossfaded on palette change; a monophonic `Synth → master` for cues.

- [ ] **Step 1: Write the failing test**

Create `src/components/hifi/audio/engine.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createEngine, type ToneLike } from './engine';
import { DEFAULT_PALETTE, type ChapterPalette } from './palette';

type Call = { target: string; method: string; args: unknown[] };

function makeFakeTone() {
  const calls: Call[] = [];
  let nodeSeq = 0;

  function makeParam(owner: string, name: string) {
    return {
      value: 0,
      rampTo(value: number, seconds: number) {
        calls.push({ target: owner, method: `${name}.rampTo`, args: [value, seconds] });
      },
    };
  }

  function makeNode(kind: string) {
    const id = `${kind}#${nodeSeq++}`;
    return {
      id,
      connect(dest: unknown) {
        calls.push({ target: id, method: 'connect', args: [dest] });
        return dest;
      },
      dispose() {
        calls.push({ target: id, method: 'dispose', args: [] });
      },
    };
  }

  class Gain {
    id: string;
    gain: ReturnType<typeof makeParam>;
    connect: (d: unknown) => unknown;
    dispose: () => void;
    constructor(gain = 1) {
      const node = makeNode('Gain');
      this.id = node.id;
      this.connect = node.connect;
      this.dispose = node.dispose;
      this.gain = makeParam(node.id, 'gain');
      this.gain.value = gain;
    }
    toDestination() {
      calls.push({ target: this.id, method: 'toDestination', args: [] });
      return this;
    }
  }

  class Filter {
    id: string;
    frequency: ReturnType<typeof makeParam>;
    connect: (d: unknown) => unknown;
    dispose: () => void;
    constructor(frequency = 350, type = 'lowpass') {
      const node = makeNode('Filter');
      this.id = node.id;
      this.connect = node.connect;
      this.dispose = node.dispose;
      this.frequency = makeParam(node.id, 'frequency');
      this.frequency.value = frequency;
      calls.push({ target: this.id, method: 'ctor', args: [frequency, type] });
    }
  }

  class PolySynth {
    id: string;
    connect: (d: unknown) => unknown;
    dispose: () => void;
    constructor() {
      const node = makeNode('PolySynth');
      this.id = node.id;
      this.connect = node.connect;
      this.dispose = node.dispose;
    }
    set(options: Record<string, unknown>) {
      calls.push({ target: this.id, method: 'set', args: [options] });
    }
    triggerAttack(notes: string[]) {
      calls.push({ target: this.id, method: 'triggerAttack', args: [notes] });
    }
    releaseAll() {
      calls.push({ target: this.id, method: 'releaseAll', args: [] });
    }
  }

  class Synth {
    id: string;
    connect: (d: unknown) => unknown;
    dispose: () => void;
    constructor(options?: Record<string, unknown>) {
      const node = makeNode('Synth');
      this.id = node.id;
      this.connect = node.connect;
      this.dispose = node.dispose;
      calls.push({ target: this.id, method: 'ctor', args: [options] });
    }
    triggerAttackRelease(note: string, duration: string, time?: number) {
      calls.push({ target: this.id, method: 'triggerAttackRelease', args: [note, duration, time] });
    }
  }

  const tone = { now: () => 100, Gain, Filter, PolySynth, Synth } as unknown as ToneLike;
  return { tone, calls };
}

const OTHER: ChapterPalette = {
  id: 'other',
  drone: { notes: ['D2', 'A2'], gain: 0.4 },
  tension: { brightHz: 900, darkHz: 300, detuneCents: 20 },
  cadence: ['D4', 'A4', 'D5'],
};

function callsFor(calls: Call[], method: string) {
  return calls.filter((c) => c.method === method);
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createEngine', () => {
  it('starting a palette holds the drone chord and ramps its layer up', () => {
    const { tone, calls } = makeFakeTone();
    const engine = createEngine(tone);
    engine.setPalette(DEFAULT_PALETTE);
    const attack = callsFor(calls, 'triggerAttack');
    expect(attack.length).toBe(1);
    expect(attack[0].args[0]).toEqual(DEFAULT_PALETTE.drone.notes);
    const ramps = callsFor(calls, 'gain.rampTo');
    expect(ramps.some((c) => c.args[0] === DEFAULT_PALETTE.drone.gain)).toBe(true);
  });

  it('setting the same palette id again is a no-op', () => {
    const { tone, calls } = makeFakeTone();
    const engine = createEngine(tone);
    engine.setPalette(DEFAULT_PALETTE);
    const before = calls.length;
    engine.setPalette(DEFAULT_PALETTE);
    expect(calls.length).toBe(before);
  });

  it('switching palettes crossfades: old layer ramps to 0 and is disposed after the fade', () => {
    const { tone, calls } = makeFakeTone();
    const engine = createEngine(tone);
    engine.setPalette(DEFAULT_PALETTE);
    calls.length = 0;
    engine.setPalette(OTHER);
    expect(callsFor(calls, 'gain.rampTo').some((c) => c.args[0] === 0)).toBe(true);
    expect(callsFor(calls, 'triggerAttack')[0].args[0]).toEqual(OTHER.drone.notes);
    expect(callsFor(calls, 'dispose').length).toBe(0);
    vi.advanceTimersByTime(3000);
    expect(callsFor(calls, 'releaseAll').length).toBe(1);
    expect(callsFor(calls, 'dispose').length).toBe(2); // old synth + old gain
  });

  it('setTension clamps to 0..1 and ramps the filter between brightHz and darkHz', () => {
    const { tone, calls } = makeFakeTone();
    const engine = createEngine(tone);
    engine.setPalette(DEFAULT_PALETTE);
    calls.length = 0;
    engine.setTension(2); // clamped to 1 → darkHz
    const ramp = callsFor(calls, 'frequency.rampTo').at(-1)!;
    expect(ramp.args[0]).toBe(DEFAULT_PALETTE.tension.darkHz);
    engine.setTension(0); // → brightHz
    const ramp2 = callsFor(calls, 'frequency.rampTo').at(-1)!;
    expect(ramp2.args[0]).toBe(DEFAULT_PALETTE.tension.brightHz);
  });

  it('setTension detunes the drone proportionally', () => {
    const { tone, calls } = makeFakeTone();
    const engine = createEngine(tone);
    engine.setPalette(DEFAULT_PALETTE);
    calls.length = 0;
    engine.setTension(0.5);
    const sets = callsFor(calls, 'set');
    expect(
      sets.some((c) => (c.args[0] as Record<string, unknown>).detune === DEFAULT_PALETTE.tension.detuneCents * 0.5)
    ).toBe(true);
  });

  it('chapter-complete cue plays the current palette cadence in order', () => {
    const { tone, calls } = makeFakeTone();
    const engine = createEngine(tone);
    engine.setPalette(OTHER);
    calls.length = 0;
    engine.cue('chapter-complete');
    const notes = callsFor(calls, 'triggerAttackRelease').map((c) => c.args[0]);
    expect(notes).toEqual(OTHER.cadence);
  });

  it('each cue name triggers at least one note', () => {
    const { tone, calls } = makeFakeTone();
    const engine = createEngine(tone);
    for (const name of ['lesson-open', 'component-complete', 'chapter-complete', 'broken'] as const) {
      calls.length = 0;
      engine.cue(name);
      expect(callsFor(calls, 'triggerAttackRelease').length).toBeGreaterThan(0);
    }
  });

  it('dispose releases the drone and disposes every node', () => {
    const { tone, calls } = makeFakeTone();
    const engine = createEngine(tone);
    engine.setPalette(DEFAULT_PALETTE);
    calls.length = 0;
    engine.dispose();
    expect(callsFor(calls, 'releaseAll').length).toBe(1);
    // layer synth + layer gain + cue synth + filter + master
    expect(callsFor(calls, 'dispose').length).toBe(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/hifi/audio/engine.test.ts`
Expected: FAIL — cannot resolve `./engine`.

- [ ] **Step 3: Implement the engine**

Create `src/components/hifi/audio/engine.ts`:

```ts
import { DEFAULT_PALETTE, type ChapterPalette } from './palette';
import type { CueName } from './cues';

/**
 * Narrow structural subset of the Tone.js module this engine uses.
 * Tests inject a recording fake; the director casts the real dynamic
 * import to it (`as unknown as ToneLike`) — the cast is required because
 * Tone's own constructor overloads don't assign to these loose shapes.
 */
type ParamLike = { value: number; rampTo(value: number, seconds: number): void };
type NodeLike = { connect(destination: unknown): unknown; dispose(): void };
export type GainLike = NodeLike & { gain: ParamLike; toDestination(): unknown };
export type FilterLike = NodeLike & { frequency: ParamLike };
export type DroneLike = NodeLike & {
  set(options: Record<string, unknown>): void;
  triggerAttack(notes: string[]): void;
  releaseAll(): void;
};
export type CueSynthLike = NodeLike & {
  triggerAttackRelease(note: string, duration: string, time?: number): void;
};
export type ToneLike = {
  now(): number;
  Gain: new (gain?: number) => GainLike;
  Filter: new (frequency?: number, type?: string) => FilterLike;
  PolySynth: new () => DroneLike;
  Synth: new (options?: Record<string, unknown>) => CueSynthLike;
};

export type AudioEngine = {
  setPalette(palette: ChapterPalette, opts?: { immediate?: boolean }): void;
  setTension(t: number): void;
  cue(name: CueName): void;
  dispose(): void;
};

const CROSSFADE_S = 2;
const TENSION_RAMP_S = 0.4;

type Layer = { gain: GainLike; synth: DroneLike };

export function createEngine(tone: ToneLike): AudioEngine {
  const master = new tone.Gain(0.8);
  master.toDestination();
  const droneFilter = new tone.Filter(DEFAULT_PALETTE.tension.brightHz, 'lowpass');
  droneFilter.connect(master);
  const cueSynth = new tone.Synth({ volume: -10 });
  cueSynth.connect(master);

  let layer: Layer | null = null;
  let palette: ChapterPalette = DEFAULT_PALETTE;
  let tension = 0;

  function startLayer(p: ChapterPalette, fadeS: number): Layer {
    const gain = new tone.Gain(0);
    gain.connect(droneFilter);
    const synth = new tone.PolySynth();
    synth.set({ oscillator: { type: 'sine' }, envelope: { attack: 2, release: 4 } });
    synth.connect(gain);
    synth.triggerAttack(p.drone.notes);
    gain.gain.rampTo(p.drone.gain, fadeS);
    return { gain, synth };
  }

  function stopLayer(old: Layer, fadeS: number): void {
    old.gain.gain.rampTo(0, fadeS);
    setTimeout(() => {
      old.synth.releaseAll();
      old.synth.dispose();
      old.gain.dispose();
    }, (fadeS + 0.5) * 1000);
  }

  function applyTension(): void {
    const { brightHz, darkHz, detuneCents } = palette.tension;
    droneFilter.frequency.rampTo(brightHz + (darkHz - brightHz) * tension, TENSION_RAMP_S);
    layer?.synth.set({ detune: detuneCents * tension });
  }

  return {
    setPalette(p, opts = {}) {
      if (p.id === palette.id && layer) return;
      const fadeS = opts.immediate ? 0.05 : CROSSFADE_S;
      if (layer) stopLayer(layer, fadeS);
      palette = p;
      layer = startLayer(p, fadeS);
      applyTension();
    },

    setTension(t) {
      tension = Math.min(1, Math.max(0, t));
      applyTension();
    },

    cue(name) {
      const t0 = tone.now();
      if (name === 'lesson-open') {
        cueSynth.triggerAttackRelease('E5', '16n', t0);
      } else if (name === 'component-complete') {
        cueSynth.triggerAttackRelease('C5', '16n', t0);
        cueSynth.triggerAttackRelease('G5', '8n', t0 + 0.12);
      } else if (name === 'chapter-complete') {
        palette.cadence.forEach((note, i) => {
          cueSynth.triggerAttackRelease(note, '8n', t0 + i * 0.18);
        });
      } else {
        // broken — a falling gesture
        cueSynth.triggerAttackRelease('E3', '8n', t0);
        cueSynth.triggerAttackRelease('C2', '2n', t0 + 0.15);
      }
    },

    dispose() {
      if (layer) {
        layer.synth.releaseAll();
        layer.synth.dispose();
        layer.gain.dispose();
        layer = null;
      }
      cueSynth.dispose();
      droneFilter.dispose();
      master.dispose();
    },
  };
}
```

Note: the `import type { CueName } from './cues'` is type-only; when Task 5 makes `cues.ts` import the director (which imports this engine), the runtime dependency stays one-directional — no circular import at runtime.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/hifi/audio/engine.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/hifi/audio/engine.ts src/components/hifi/audio/engine.test.ts
git commit -m "feat: add Tone-facing audio engine with drone crossfade, tension, and cues"
```

---

### Task 4: AudioDirector (state, dynamic import, persistence)

**Files:**
- Create: `src/components/hifi/audio/director.ts`
- Test: `src/components/hifi/audio/director.test.ts`

Factory (`createAudioDirector(deps)`) + module singleton (`audioDirector`). Deps are injectable for tests: `loadTone` (production: `await import('tone')` + `tone.start()` — the dynamic import IS the zero-bundle-cost acceptance criterion) and `buildEngine`. While disabled, `setChapter`/`setTension`/`cue` are safe no-ops that still record pending chapter/tension so a late enable resumes in the right place.

- [ ] **Step 1: Write the failing test**

Create `src/components/hifi/audio/director.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAudioDirector } from './director';
import { AUDIO_PREF_KEY } from './preference';
import { getPalette } from './palette';
import type { AudioEngine, ToneLike } from './engine';

function makeFakes(opts: { failLoad?: boolean } = {}) {
  const engine: AudioEngine = {
    setPalette: vi.fn(),
    setTension: vi.fn(),
    cue: vi.fn(),
    dispose: vi.fn(),
  };
  const start = vi.fn(async () => {});
  const loadTone = vi.fn(async () => {
    if (opts.failLoad) throw new Error('offline');
    return { start } as unknown as ToneLike & { start(): Promise<void> };
  });
  const buildEngine = vi.fn(() => engine);
  return { engine, start, loadTone, buildEngine };
}

beforeEach(() => {
  localStorage.clear();
});

describe('audioDirector', () => {
  it('starts disabled and does not load tone', () => {
    const f = makeFakes();
    const d = createAudioDirector({ loadTone: f.loadTone, buildEngine: f.buildEngine });
    expect(d.getState().enabled).toBe(false);
    d.setChapter('ch03');
    d.setTension(0.7);
    d.cue('broken');
    expect(f.loadTone).not.toHaveBeenCalled();
    expect(f.buildEngine).not.toHaveBeenCalled();
  });

  it('enable loads tone once, starts the context, builds the engine, and persists the pref', async () => {
    const f = makeFakes();
    const d = createAudioDirector({ loadTone: f.loadTone, buildEngine: f.buildEngine });
    await d.enable();
    expect(f.loadTone).toHaveBeenCalledTimes(1);
    expect(f.start).toHaveBeenCalledTimes(1);
    expect(f.buildEngine).toHaveBeenCalledTimes(1);
    expect(d.getState().enabled).toBe(true);
    expect(JSON.parse(localStorage.getItem(AUDIO_PREF_KEY)!)).toEqual({ version: 1, enabled: true });
    await d.enable(); // idempotent
    expect(f.loadTone).toHaveBeenCalledTimes(1);
  });

  it('applies pending chapter and tension on enable', async () => {
    const f = makeFakes();
    const d = createAudioDirector({ loadTone: f.loadTone, buildEngine: f.buildEngine });
    d.setChapter('ch03');
    d.setTension(0.7);
    await d.enable();
    expect(f.engine.setPalette).toHaveBeenCalledWith(getPalette('ch03'), { immediate: true });
    expect(f.engine.setTension).toHaveBeenCalledWith(0.7);
  });

  it('forwards setChapter/setTension/cue to the engine while enabled', async () => {
    const f = makeFakes();
    const d = createAudioDirector({ loadTone: f.loadTone, buildEngine: f.buildEngine });
    await d.enable();
    d.setChapter('ch02');
    expect(f.engine.setPalette).toHaveBeenLastCalledWith(getPalette('ch02'));
    d.setTension(0.3);
    expect(f.engine.setTension).toHaveBeenLastCalledWith(0.3);
    d.cue('chapter-complete');
    expect(f.engine.cue).toHaveBeenCalledWith('chapter-complete');
  });

  it('disable disposes the engine and persists false', async () => {
    const f = makeFakes();
    const d = createAudioDirector({ loadTone: f.loadTone, buildEngine: f.buildEngine });
    await d.enable();
    d.disable();
    expect(f.engine.dispose).toHaveBeenCalledTimes(1);
    expect(d.getState().enabled).toBe(false);
    expect(JSON.parse(localStorage.getItem(AUDIO_PREF_KEY)!)).toEqual({ version: 1, enabled: false });
  });

  it('a failed tone load returns to disabled without persisting true', async () => {
    const f = makeFakes({ failLoad: true });
    const d = createAudioDirector({ loadTone: f.loadTone, buildEngine: f.buildEngine });
    await d.enable();
    expect(d.getState()).toEqual({ enabled: false, loading: false });
    expect(localStorage.getItem(AUDIO_PREF_KEY)).toBeNull();
  });

  it('enableFromPref only enables when the stored preference is on', async () => {
    const f = makeFakes();
    const d = createAudioDirector({ loadTone: f.loadTone, buildEngine: f.buildEngine });
    await d.enableFromPref();
    expect(f.loadTone).not.toHaveBeenCalled();
    localStorage.setItem(AUDIO_PREF_KEY, JSON.stringify({ version: 1, enabled: true }));
    await d.enableFromPref();
    expect(f.loadTone).toHaveBeenCalledTimes(1);
    expect(d.getState().enabled).toBe(true);
  });

  it('notifies subscribers on state changes and supports unsubscribe', async () => {
    const f = makeFakes();
    const d = createAudioDirector({ loadTone: f.loadTone, buildEngine: f.buildEngine });
    const seen: boolean[] = [];
    const unsub = d.subscribe(() => seen.push(d.getState().enabled));
    await d.enable();
    expect(seen.at(-1)).toBe(true);
    unsub();
    const n = seen.length;
    d.disable();
    expect(seen.length).toBe(n);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/hifi/audio/director.test.ts`
Expected: FAIL — cannot resolve `./director`.

- [ ] **Step 3: Implement the director**

Create `src/components/hifi/audio/director.ts`:

```ts
import { createEngine, type AudioEngine, type ToneLike } from './engine';
import { getPalette } from './palette';
import { loadAudioPref, saveAudioPref } from './preference';
import type { CueName } from './cues';

export type AudioDirectorState = { enabled: boolean; loading: boolean };

type ToneModule = ToneLike & { start(): Promise<void> };

type Deps = {
  loadTone: () => Promise<ToneModule>;
  buildEngine: (tone: ToneLike) => AudioEngine;
};

const defaultDeps: Deps = {
  // Dynamic import — Tone.js is code-split out of the initial bundle and only
  // fetched after the visitor enables sound (spec §7).
  loadTone: async () => (await import('tone')) as unknown as ToneModule,
  buildEngine: createEngine,
};

export function createAudioDirector(deps: Deps = defaultDeps) {
  let engine: AudioEngine | null = null;
  let state: AudioDirectorState = { enabled: false, loading: false };
  let chapterId = 'prologue';
  let tension = 0;
  const listeners = new Set<() => void>();

  function setState(next: AudioDirectorState): void {
    state = next;
    listeners.forEach((l) => l());
  }

  return {
    getState: (): AudioDirectorState => state,

    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    /**
     * Enable sound. Must be called from a user-gesture handler (click/key) —
     * the browser autoplay policy requires it for AudioContext.start().
     */
    async enable(): Promise<void> {
      if (state.enabled || state.loading) return;
      setState({ enabled: false, loading: true });
      try {
        const tone = await deps.loadTone();
        await tone.start();
        engine = deps.buildEngine(tone);
        engine.setPalette(getPalette(chapterId), { immediate: true });
        engine.setTension(tension);
        saveAudioPref(true);
        setState({ enabled: true, loading: false });
      } catch {
        // Load/start failed (offline, blocked context) — stay silent.
        setState({ enabled: false, loading: false });
      }
    },

    /** Re-enable from the persisted preference — also gesture-context only (P5 wires this). */
    async enableFromPref(): Promise<void> {
      if (loadAudioPref()) await this.enable();
    },

    disable(): void {
      saveAudioPref(false);
      engine?.dispose();
      engine = null;
      setState({ enabled: false, loading: false });
    },

    setChapter(id: string): void {
      chapterId = id;
      engine?.setPalette(getPalette(id));
    },

    setTension(t: number): void {
      tension = t;
      engine?.setTension(t);
    },

    cue(name: CueName): void {
      engine?.cue(name);
    },
  };
}

export type AudioDirector = ReturnType<typeof createAudioDirector>;

/** App-wide singleton. */
export const audioDirector = createAudioDirector();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/hifi/audio/director.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/hifi/audio/director.ts src/components/hifi/audio/director.test.ts
git commit -m "feat: add AudioDirector with dynamic tone import and persisted preference"
```

---

### Task 5: Forward the P3 cue stub to the director

**Files:**
- Modify: `src/components/hifi/audio/cues.ts`
- Rewrite: `src/components/hifi/audio/cues.test.ts`

`ChapterTransition.tsx` already calls `cue('chapter-complete')` at the moment a chapter is earned (and its test mocks `'../audio/cues'`) — keep that import surface identical so nothing else changes.

- [ ] **Step 1: Rewrite the test**

Replace the contents of `src/components/hifi/audio/cues.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';

vi.mock('./director', () => ({ audioDirector: { cue: vi.fn() } }));
import { audioDirector } from './director';
import { cue, type CueName } from './cues';

describe('cue', () => {
  it('forwards every cue name to the audio director', () => {
    const names: CueName[] = ['lesson-open', 'component-complete', 'chapter-complete', 'broken'];
    for (const name of names) cue(name);
    expect(vi.mocked(audioDirector.cue).mock.calls.map((c) => c[0])).toEqual(names);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/hifi/audio/cues.test.ts`
Expected: FAIL — the stub does not call the director.

- [ ] **Step 3: Implement the forwarder**

Replace the contents of `src/components/hifi/audio/cues.ts`:

```ts
import { audioDirector } from './director';

/** One-shot audio cue names (spec §7). */
export type CueName = 'lesson-open' | 'component-complete' | 'chapter-complete' | 'broken';

/** Forwarded to the AudioDirector — a safe no-op until the visitor enables sound. */
export function cue(name: CueName): void {
  audioDirector.cue(name);
}
```

(The director imports `CueName` from this file type-only, so there is no runtime import cycle: at runtime only `cues.ts → director.ts → engine.ts` executes.)

- [ ] **Step 4: Run the whole suite**

Run: `npm test`
Expected: all pass — including the untouched `ChapterTransition.test.tsx`, whose `vi.mock('../audio/cues', …)` still intercepts the same module path.

- [ ] **Step 5: Commit**

```bash
git add src/components/hifi/audio/cues.ts src/components/hifi/audio/cues.test.ts
git commit -m "feat: forward audio cues to the AudioDirector"
```

---

### Task 6: SoundToggle in the top nav

**Files:**
- Create: `src/components/hifi/audio/SoundToggle.tsx`
- Modify: `src/components/hifi/TopNav.tsx`
- Test: `src/components/hifi/audio/SoundToggle.test.tsx`

The toggle is the explicit enable gesture (autoplay-policy-satisfying click). It reuses the existing `.hifi-nav-links button` styling — no new CSS.

- [ ] **Step 1: Write the failing test**

Create `src/components/hifi/audio/SoundToggle.test.tsx`:

```tsx
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { act } from 'react';

// vi.mock is hoisted above module-scope const initializers, so the fake must
// be created inside vi.hoisted() — a plain `const fake = …` would throw
// "Cannot access 'fake' before initialization" when the factory runs.
const fake = vi.hoisted(() => {
  type State = { enabled: boolean; loading: boolean };
  const listeners = new Set<() => void>();
  const f = {
    state: { enabled: false, loading: false } as State,
    listeners,
    getState: () => f.state,
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    setState(next: State) {
      f.state = next;
      listeners.forEach((l) => l());
    },
    enable: vi.fn(async () => {}),
    disable: vi.fn(),
  };
  return f;
});

vi.mock('./director', () => ({ audioDirector: fake }));
import { SoundToggle } from './SoundToggle';

beforeEach(() => {
  fake.state = { enabled: false, loading: false };
  fake.listeners.clear();
  vi.mocked(fake.enable).mockClear();
  vi.mocked(fake.disable).mockClear();
});

afterEach(() => {
  cleanup();
});

describe('SoundToggle', () => {
  it('renders off by default and enables on click', () => {
    render(<SoundToggle />);
    const btn = screen.getByRole('button', { name: /sound · off/i });
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    act(() => btn.click());
    expect(fake.enable).toHaveBeenCalledTimes(1);
  });

  it('reflects the enabled state and disables on click', () => {
    render(<SoundToggle />);
    act(() => fake.setState({ enabled: true, loading: false }));
    const btn = screen.getByRole('button', { name: /sound · on/i });
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    act(() => btn.click());
    expect(fake.disable).toHaveBeenCalledTimes(1);
  });

  it('is disabled while loading', () => {
    render(<SoundToggle />);
    act(() => fake.setState({ enabled: false, loading: true }));
    const btn = screen.getByRole('button', { name: /sound/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/hifi/audio/SoundToggle.test.tsx`
Expected: FAIL — cannot resolve `./SoundToggle`.

- [ ] **Step 3: Implement the toggle**

Create `src/components/hifi/audio/SoundToggle.tsx`:

```tsx
'use client';

import { useSyncExternalStore } from 'react';
import { audioDirector } from './director';

export function SoundToggle() {
  const state = useSyncExternalStore(
    audioDirector.subscribe,
    audioDirector.getState,
    audioDirector.getState
  );

  return (
    <button
      type="button"
      className={state.enabled ? 'active' : ''}
      aria-pressed={state.enabled}
      disabled={state.loading}
      onClick={() => {
        if (state.enabled) audioDirector.disable();
        else void audioDirector.enable();
      }}
    >
      Sound · {state.loading ? '…' : state.enabled ? 'on' : 'off'}
    </button>
  );
}
```

(`getState` returns the same object reference until a state change, so it is safe as both client and server snapshot for `useSyncExternalStore`.)

- [ ] **Step 4: Add the toggle to TopNav**

Replace the contents of `src/components/hifi/TopNav.tsx`:

```tsx
'use client';

import { SoundToggle } from './audio/SoundToggle';

type TopNavProps = {
  onIndex?: () => void;
  activeLabel?: 'Index' | 'Chapter' | null;
};

export function TopNav({ onIndex, activeLabel = 'Index' }: TopNavProps) {
  return (
    <nav className="hifi-nav" aria-label="Primary">
      <div className="hifi-mark">
        <div className="hifi-mark-dot" />
        <span className="hifi-mark-label">Finetuned · Universe</span>
      </div>
      <div className="hifi-nav-links">
        <button
          type="button"
          onClick={onIndex}
          className={activeLabel === 'Index' ? 'active' : ''}
        >
          Index
        </button>
        <SoundToggle />
      </div>
    </nav>
  );
}
```

- [ ] **Step 5: Run tests, types, lint**

Run: `npx vitest run src/components/hifi/audio/SoundToggle.test.tsx` → PASS (3 tests).
Run: `npm test` → all pass.
Run: `npx tsc --noEmit` → clean.
Run: `npx eslint src/components/hifi/audio/ src/components/hifi/TopNav.tsx` → no errors (repo-wide `npm run lint` debt is out of scope).

- [ ] **Step 6: Commit**

```bash
git add src/components/hifi/audio/SoundToggle.tsx src/components/hifi/audio/SoundToggle.test.tsx src/components/hifi/TopNav.tsx
git commit -m "feat: add nav sound toggle wired to the AudioDirector"
```

---

### Task 7: End-to-end verification probe

**Files:**
- Create: `/tmp/ftu-p4/verify-audio.js` (throwaway — NOT committed)

Playwright is borrowed from a sibling project (this repo doesn't install it) via `createRequire('/home/jayan/projects/paperclip/package.json')`. Needs the dev server: `nohup npm run dev -- --port 3111 > /tmp/ftu-p4-dev.log 2>&1 &` from the worktree (if a stale server from another worktree holds the port, kill it first; note `npm run build` corrupts a running dev server's `.next` — restart the server after any build).

The probe verifies the two things unit tests can't: Tone.js is NOT fetched until the toggle is clicked (zero-bundle-cost criterion), and the enable path works in a real browser (context start from a gesture, preference persisted).

- [ ] **Step 1: Write the probe**

Create `/tmp/ftu-p4/verify-audio.js` (`mkdir -p /tmp/ftu-p4` first):

```js
const { createRequire } = require('node:module');
const preq = createRequire('/home/jayan/projects/paperclip/package.json');
const { chromium } = preq('@playwright/test');

const BASE = 'http://localhost:3111';

const results = [];
function check(id, desc, ok, extra = '') {
  results.push({ id, desc, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id} — ${desc}${extra ? ` (${extra})` : ''}`);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const jsRequests = [];
  page.on('request', (r) => {
    if (r.resourceType() === 'script' || r.url().endsWith('.js')) jsRequests.push(r.url());
  });
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });

  await page.goto(BASE);
  await page.getByRole('button', { name: /begin the descent/i }).click();

  const toggle = page.getByRole('button', { name: /sound/i });
  check('T1', 'nav shows Sound · off', (await toggle.textContent()).includes('off'));

  const before = jsRequests.length;
  check('T2', 'no tone chunk before enabling', !jsRequests.some((u) => /tone/i.test(u)));

  await toggle.click();
  await page.waitForFunction(
    () => document.querySelector('.hifi-nav-links')?.textContent?.includes('Sound · on'),
    null,
    { timeout: 10000 }
  );
  check('T3', 'toggle flips to Sound · on', true);
  check('T4', 'enabling fetched new JS (the tone chunk)', jsRequests.length > before,
    `${before} → ${jsRequests.length}`);

  const pref = await page.evaluate(() => localStorage.getItem('ftu-audio-v1'));
  check('T5', 'preference persisted enabled', JSON.parse(pref || 'null')?.enabled === true);

  check('T6', 'no console errors after enable', errors.length === 0, errors.join(' | ').slice(0, 200));

  await toggle.click();
  await page.waitForFunction(
    () => document.querySelector('.hifi-nav-links')?.textContent?.includes('Sound · off'),
    null,
    { timeout: 5000 }
  );
  const pref2 = await page.evaluate(() => localStorage.getItem('ftu-audio-v1'));
  check('T7', 'disable flips toggle off and persists false', JSON.parse(pref2 || 'null')?.enabled === false);

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})();
```

- [ ] **Step 2: Run the probe**

Run: `node /tmp/ftu-p4/verify-audio.js`
Expected: `7/7 checks passed`, exit 0.

Debug hints:
- T3 timeout with the toggle stuck on "…" → `tone.start()` hung; headless Chromium sometimes needs the autoplay flag: relaunch with `chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] })` and note it as a probe adjustment (real browsers get the genuine click gesture).
- T4 fail with no new JS → the dynamic import got bundled eagerly; check that nothing imports `tone` statically (only `director.ts` may reference it, inside `loadTone`).
- If a check fails from a real product bug, fix the source minimally, re-run tests, and note it.

- [ ] **Step 3: Full gate**

Run in the worktree: `npm test` (expect 12 files → 17 files, all passing), `npx tsc --noEmit` (clean), `npm run build` (succeeds), `npx eslint src/components/hifi/audio/ src/components/hifi/TopNav.tsx` (no errors). Do NOT gate on `npm run lint` (pre-existing repo-wide debt).

Also confirm code-splitting at build level: `grep -rl "standardized-audio-context" .next/static/chunks/ | head -3` — the tone chunk must exist as a separate chunk file, and `npm run build`'s route summary for `/experience` should be within a few kB of main's (233 kB); if the route size jumps by >100 kB, tone got into the initial bundle.

- [ ] **Step 4: Commit any straggler fixes**

Only if Steps 2–3 forced source changes:

```bash
git add -u src/
git commit -m "fix: address issues found by audio E2E probe"
```

Do NOT commit the probe file.

---

## Issue #30 acceptance criteria → task map

| Criterion | Where |
|---|---|
| Tone.js dynamically imported only after enable (zero bundle/audio cost) | Task 4 (`loadTone` dynamic import), Task 7 T2/T4 + build-size check |
| Audio context started only from a user gesture | Task 4 (`enable()` gesture contract, `enableFromPref` for P5's Begin click), Task 6 (toggle click), Task 7 T3 |
| API: `enable()/disable()` persisted, `setChapter(id)`, `setTension(0..1)`, `cue(...)` | Tasks 2, 3, 4; Task 5 routes the P3 call sites |
| Chapter palette format: drone + per-component motif + tension mapping + cadence | Task 1 (`ChapterPalette`), Task 3 (engine consumes every field except motifs, which P5 plays) |
| Sound off by default; reduced-motion stays off; toggle in top nav | Task 2 (default false; nothing auto-enables), Task 6, Task 7 T1/T7 |
