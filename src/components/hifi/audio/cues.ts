/** One-shot audio cue names (spec §7). */
export type CueName = 'lesson-open' | 'component-complete' | 'chapter-complete' | 'broken';

/** No-op until the AudioDirector lands (P4/P5); P3 calls it at the moment a chapter is earned. */
export function cue(_name: CueName): void {}
