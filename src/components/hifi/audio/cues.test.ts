import { describe, expect, it } from 'vitest';
import { cue, type CueName } from './cues';

describe('cue (P3 stub — real engine lands in P4/P5)', () => {
  it('accepts every cue name without throwing', () => {
    const names: CueName[] = ['lesson-open', 'component-complete', 'chapter-complete', 'broken'];
    for (const name of names) {
      expect(() => cue(name)).not.toThrow();
    }
  });
});
