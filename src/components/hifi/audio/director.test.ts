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

  it('disable during a pending enable wins', async () => {
    const f = makeFakes();
    let release!: () => void;
    const gate = new Promise<void>((r) => { release = r; });
    const loadTone = vi.fn(async () => {
      await gate;
      return { start: f.start } as unknown as ToneLike & { start(): Promise<void> };
    });
    const d = createAudioDirector({ loadTone, buildEngine: f.buildEngine });
    const p = d.enable();
    d.disable();
    release();
    await p;
    expect(d.getState()).toEqual({ enabled: false, loading: false });
    expect(JSON.parse(localStorage.getItem(AUDIO_PREF_KEY)!)).toEqual({ version: 1, enabled: false });
    expect(f.buildEngine).not.toHaveBeenCalled();
  });

  it('enableFromPref works when detached from the director', async () => {
    const f = makeFakes();
    const d = createAudioDirector({ loadTone: f.loadTone, buildEngine: f.buildEngine });
    const { enableFromPref } = d;
    localStorage.setItem(AUDIO_PREF_KEY, JSON.stringify({ version: 1, enabled: true }));
    await enableFromPref();
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
