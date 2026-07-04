import { render, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { ProgressionProvider } from '../progression/ProgressionContext';
import { STORAGE_KEY } from '../progression/persistence';
import { ChapterIndex } from './ChapterIndex';

const wrap = (ui: ReactNode) => render(<ProgressionProvider>{ui}</ProgressionProvider>);

afterEach(() => {
  cleanup(); // vitest config has no globals:true, so RTL auto-cleanup never registers
  window.localStorage.clear();
});

describe('ChapterIndex', () => {
  it('renders all seven chapters with frontier status on chapter 01 for a fresh visitor', async () => {
    const { container } = wrap(<ChapterIndex onSelectChapter={() => {}} />);
    const rows = container.querySelectorAll('.prologue-row');
    expect(rows.length).toBe(7);

    await waitFor(() => expect(rows[0].textContent).toContain('continue here'));
    expect(rows[0].className).toContain('is-frontier');
    expect(rows[1].textContent).toContain('unexplored');
    expect(rows[1].className).not.toContain('is-frontier');
    expect(rows[0].textContent).toContain('The Beginning');
    expect(rows[6].textContent).toContain('Geologic Time');
  });

  it('shows partial progress, complete, and moved frontier from persisted state', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        prologueSeen: true,
        components: {
          'ch01:entropy': { interacted: true, lessonOpened: true },
          'ch02:legacy': { interacted: true, lessonOpened: true },
        },
      })
    );
    const { container } = wrap(<ChapterIndex onSelectChapter={() => {}} />);
    const rows = container.querySelectorAll('.prologue-row');

    await waitFor(() => expect(rows[0].textContent).toContain('1/6 experienced'));
    expect(rows[1].textContent).toContain('✓ complete');
    // Frontier = first incomplete = chapter 0 (only 1/6 done)
    expect(rows[0].className).toContain('is-frontier');
  });

  it('all rows are clickable and report their chapter index (soft gate)', async () => {
    const onSelect = vi.fn();
    const { container } = wrap(<ChapterIndex onSelectChapter={onSelect} />);
    const rows = container.querySelectorAll('.prologue-row');
    fireEvent.click(rows[4]);
    expect(onSelect).toHaveBeenCalledWith(4);
    fireEvent.click(rows[0]);
    expect(onSelect).toHaveBeenCalledWith(0);
  });
});
