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
