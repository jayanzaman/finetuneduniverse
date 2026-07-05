'use client';

import { SoundToggle } from './audio/SoundToggle';

type TopNavProps = {
  onIndex?: () => void;
  activeLabel?: 'Index' | 'Chapter' | null;
};

export function TopNav({ onIndex, activeLabel = 'Index' }: TopNavProps) {
  return (
    <nav className="hifi-nav" aria-label="Primary">
      <div className="hifi-mark">
        <div className="hifi-mark-dot" />
        <span className="hifi-mark-label">Finetuned · Universe</span>
      </div>
      <div className="hifi-nav-links">
        <button
          type="button"
          onClick={onIndex}
          className={activeLabel === 'Index' ? 'active' : ''}
        >
          Index
        </button>
        <SoundToggle />
      </div>
    </nav>
  );
}
