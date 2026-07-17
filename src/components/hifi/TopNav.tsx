'use client';

import { SoundToggle } from './audio/SoundToggle';

type TopNavProps = {
  onIndex?: () => void;
  onChapters?: () => void;
  chaptersOpen?: boolean;
  activeLabel?: 'Index' | 'Chapter' | null;
};

export function TopNav({ onIndex, onChapters, chaptersOpen = false, activeLabel = 'Index' }: TopNavProps) {
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
        <button
          type="button"
          onClick={onChapters}
          className={chaptersOpen ? 'active' : ''}
          aria-expanded={chaptersOpen}
          aria-controls="chapter-skip-menu"
        >
          Skip to chapter
        </button>
        <SoundToggle />
      </div>
    </nav>
  );
}
