import { beforeEach, describe, expect, it } from 'vitest';
import { AUDIO_PREF_KEY, loadAudioPref, saveAudioPref } from './preference';

beforeEach(() => {
  localStorage.clear();
});

describe('audio preference', () => {
  it('defaults to false when nothing is stored', () => {
    expect(loadAudioPref()).toBe(false);
  });

  it('round-trips true and false', () => {
    saveAudioPref(true);
    expect(loadAudioPref()).toBe(true);
    saveAudioPref(false);
    expect(loadAudioPref()).toBe(false);
  });

  it('treats garbage as false', () => {
    localStorage.setItem(AUDIO_PREF_KEY, '{not json');
    expect(loadAudioPref()).toBe(false);
    localStorage.setItem(AUDIO_PREF_KEY, JSON.stringify({ version: 99, enabled: true }));
    expect(loadAudioPref()).toBe(false);
  });
});
