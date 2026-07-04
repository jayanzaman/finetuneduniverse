import { describe, expect, it } from 'vitest';
import { indexStatus } from './indexStatus';

describe('indexStatus', () => {
  it('labels an untouched non-frontier chapter unexplored', () => {
    expect(indexStatus({ done: 0, total: 6, complete: false }, false)).toEqual({
      kind: 'unexplored',
      label: 'unexplored',
    });
  });

  it('labels the untouched frontier chapter "continue here"', () => {
    expect(indexStatus({ done: 0, total: 6, complete: false }, true)).toEqual({
      kind: 'frontier',
      label: 'continue here →',
    });
  });

  it('shows n/total once any component is experienced, even on the frontier', () => {
    expect(indexStatus({ done: 2, total: 6, complete: false }, true)).toEqual({
      kind: 'progress',
      label: '2/6 experienced',
    });
  });

  it('labels a complete chapter with a check', () => {
    expect(indexStatus({ done: 1, total: 1, complete: true }, false)).toEqual({
      kind: 'complete',
      label: '✓ complete',
    });
  });
});
