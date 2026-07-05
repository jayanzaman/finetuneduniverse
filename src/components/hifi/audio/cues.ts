import { audioDirector } from './director';

/** One-shot audio cue names (spec §7). */
export type CueName = 'lesson-open' | 'component-complete' | 'chapter-complete' | 'broken';

/** Forwarded to the AudioDirector — a safe no-op until the visitor enables sound. */
export function cue(name: CueName): void {
  audioDirector.cue(name);
}
