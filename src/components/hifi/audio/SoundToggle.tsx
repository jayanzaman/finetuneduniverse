'use client';

import { useSyncExternalStore } from 'react';
import { audioDirector } from './director';

export function SoundToggle() {
  const state = useSyncExternalStore(
    audioDirector.subscribe,
    audioDirector.getState,
    audioDirector.getState
  );

  return (
    <button
      type="button"
      className={state.enabled ? 'active' : ''}
      aria-pressed={state.enabled}
      disabled={state.loading}
      onClick={() => {
        if (state.enabled) audioDirector.disable();
        else void audioDirector.enable();
      }}
    >
      Sound · {state.loading ? '…' : state.enabled ? 'on' : 'off'}
    </button>
  );
}
