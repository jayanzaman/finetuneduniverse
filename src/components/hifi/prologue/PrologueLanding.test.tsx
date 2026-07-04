import { render, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { ProgressionProvider } from '../progression/ProgressionContext';
import { PrologueLanding } from './PrologueLanding';

afterEach(() => {
  cleanup(); // vitest config has no globals:true, so RTL auto-cleanup never registers
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe('PrologueLanding', () => {
  it('renders the hero and the seven-chapter index', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    );
    const { container } = render(
      <ProgressionProvider>
        <PrologueLanding onBegin={() => {}} onSelectChapter={() => {}} />
      </ProgressionProvider>
    );
    expect(container.querySelector('.prologue-hero')).toBeTruthy();
    expect(container.querySelectorAll('.prologue-row').length).toBe(7);
  });
});
