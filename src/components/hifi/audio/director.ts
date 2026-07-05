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
