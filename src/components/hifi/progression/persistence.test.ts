import { afterEach, describe, expect, it, vi } from 'vitest';
import { INITIAL_STATE, markExperienced } from './store';
import { STORAGE_KEY, loadState, saveState } from './persistence';

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('persistence round-trip', () => {
  it('uses the versioned key ftu-progress-v1', () => {
    expect(STORAGE_KEY).toBe('ftu-progress-v1');
  });

  it('loads what it saves', () => {
    const s = markExperienced(INITIAL_STATE, 'ch01:entropy');
    saveState(s);
    expect(loadState()).toEqual(s);
  });

  it('returns INITIAL_STATE when nothing is stored', () => {
    expect(loadState()).toEqual(INITIAL_STATE);
  });
});

describe('corrupt or foreign data', () => {
  it('returns INITIAL_STATE for unparseable JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadState()).toEqual(INITIAL_STATE);
  });

  it('returns INITIAL_STATE for a wrong version', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, components: {} }));
    expect(loadState()).toEqual(INITIAL_STATE);
  });

  it('returns INITIAL_STATE for non-object payloads', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify('hello'));
    expect(loadState()).toEqual(INITIAL_STATE);
  });
});

describe('storage failures degrade silently', () => {
  it('saveState swallows quota/security errors', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => saveState(INITIAL_STATE)).not.toThrow();
  });

  it('loadState swallows read errors', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(loadState()).toEqual(INITIAL_STATE);
  });
});
