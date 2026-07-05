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
