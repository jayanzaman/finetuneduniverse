export const AUDIO_PREF_KEY = 'ftu-audio-v1';

export function loadAudioPref(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(AUDIO_PREF_KEY);
    if (!raw) return false;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return false;
    const p = parsed as { version?: unknown; enabled?: unknown };
    return p.version === 1 && p.enabled === true;
  } catch {
    return false;
  }
}

export function saveAudioPref(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(AUDIO_PREF_KEY, JSON.stringify({ version: 1, enabled }));
  } catch {
    // Private mode / quota exceeded — preference degrades to in-memory for this session.
  }
}
