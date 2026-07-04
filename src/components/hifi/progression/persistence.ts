import { INITIAL_STATE, type ProgressState } from './store';

export const STORAGE_KEY = 'ftu-progress-v1';

export function loadState(): ProgressState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return INITIAL_STATE;
    const p = parsed as Partial<ProgressState>;
    if (p.version !== 1) return INITIAL_STATE;
    return {
      version: 1,
      prologueSeen: p.prologueSeen === true,
      components:
        typeof p.components === 'object' && p.components !== null ? p.components : {},
    };
  } catch {
    return INITIAL_STATE;
  }
}

export function saveState(state: ProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode / quota exceeded — progression degrades to in-memory for this session.
  }
}
