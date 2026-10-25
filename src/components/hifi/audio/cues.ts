import { audioDirector } from './director';

/** One-shot audio cue names (spec §7). */
export type CueName = 'lesson-open' | 'component-complete' | 'chapter-complete' | 'broken' | 'codon';

/**
 * The ch08 codon-keypad blip: a soft, short sine tone (~880 Hz, ~0.09 s, low
 * gain) — consistent with the engine's existing one-note cues. The engine's
 * `cue()` dispatch owns playback; this spec is the source of truth for it.
 */
export const CODON_CUE = { note: 'A5', durationSeconds: 0.09, gain: 0.15 } as const;

/** Forwarded to the AudioDirector — a safe no-op until the visitor enables sound. */
export function cue(name: CueName): void {
  audioDirector.cue(name);
}
