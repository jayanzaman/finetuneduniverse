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
