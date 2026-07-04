import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { ChapterTransition } from './ChapterTransition';
import { ProgressionProvider, useProgression } from '../progression/ProgressionContext';

vi.mock('../audio/cues', () => ({ cue: vi.fn() }));
import { cue } from '../audio/cues';

const KEY = 'ftu-progress-v1';
const CH01_IDS = [
  'ch01:entropy',
  'ch01:expansion',
  'ch01:fluctuations',
  'ch01:shape',
  'ch01:darkEnergy',
  'ch01:temperature',
];

function seed(experiencedIds: string[]) {
  const components = Object.fromEntries(
    experiencedIds.map((id) => [id, { interacted: true, lessonOpened: true }])
  );
  localStorage.setItem(KEY, JSON.stringify({ version: 1, prologueSeen: true, components }));
}

/** Exposes a button that marks one component fully experienced, to flip earned live. */
function CompleteButton({ id }: { id: string }) {
  const { markInteracted, markLessonOpened } = useProgression();
  return (
    <button
      type="button"
      onClick={() => {
        markInteracted(id);
        markLessonOpened(id);
      }}
    >
      finish-{id}
    </button>
  );
}

function renderTransition(chapterIndex: number, extra?: React.ReactNode) {
  const onDescend = vi.fn();
  render(
    <ProgressionProvider>
      {extra}
      <ChapterTransition chapterIndex={chapterIndex} onDescend={onDescend} />
    </ProgressionProvider>
  );
  return { onDescend };
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.mocked(cue).mockClear();
});

describe('ChapterTransition — dormant', () => {
  it('shows veiled next chapter, checklist marks, and remain count', async () => {
    seed(CH01_IDS.slice(0, 4)); // 4 of 6 experienced
    renderTransition(0);

    await waitFor(() => {
      expect(screen.getByText('2 components remain — tap one above to jump to it')).toBeTruthy();
    });
    const block = document.querySelector('.transition-block')!;
    expect(block.className).toContain('is-dormant');
    expect(block.querySelector('.transition-veil')).toBeTruthy();
    expect(screen.getByText('Next phase · locked behind understanding')).toBeTruthy();
    expect(screen.getByText('Quarks to Atoms')).toBeTruthy();
    expect(document.querySelectorAll('.transition-check.is-done').length).toBe(4);
    expect(document.querySelectorAll('.transition-check.is-todo').length).toBe(2);
    // no descend button while dormant
    expect(screen.queryByRole('button', { name: /descend/i })).toBeNull();
  });

  it('clicking an open checklist item scrolls to its component anchor', async () => {
    seed(CH01_IDS.slice(0, 5)); // Only ch01:temperature (CMB Uniformity) remains
    const scrollSpy = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollSpy;
    const anchor = document.createElement('div');
    anchor.id = 'comp-ch01:temperature';
    document.body.appendChild(anchor);

    renderTransition(0);
    const item = await screen.findByRole('button', { name: /CMB Uniformity/ });
    act(() => item.click());
    expect(scrollSpy).toHaveBeenCalledTimes(1);

    anchor.remove();
  });
});

describe('ChapterTransition — earned', () => {
  it('shows complete tag, era roll from → to, and Descend calls onDescend', async () => {
    seed(CH01_IDS);
    const { onDescend } = renderTransition(0);

    const descend = await screen.findByRole('button', { name: /descend/i });
    const block = document.querySelector('.transition-block')!;
    expect(block.className).toContain('is-earned');
    expect(screen.getByText('✓ chapter complete')).toBeTruthy();
    expect(screen.getByText('13.8 Bya → t + 1μs')).toBeTruthy();
    act(() => descend.click());
    expect(onDescend).toHaveBeenCalledTimes(1);
  });

  it('fires cue(chapter-complete) when completion happens live', async () => {
    seed(CH01_IDS.slice(0, 5));
    renderTransition(0, <CompleteButton id="ch01:temperature" />);

    await screen.findByText('1 component remains — tap one above to jump to it');
    expect(cue).not.toHaveBeenCalled();
    act(() => screen.getByText('finish-ch01:temperature').click());
    await screen.findByRole('button', { name: /descend/i });
    expect(cue).toHaveBeenCalledTimes(1);
    expect(cue).toHaveBeenCalledWith('chapter-complete');
  });

  it('does NOT fire cue when mounted already complete (returning visitor)', async () => {
    seed(CH01_IDS);
    renderTransition(0);
    await screen.findByRole('button', { name: /descend/i });
    expect(cue).not.toHaveBeenCalled();
  });
});

describe('ChapterTransition — final chapter', () => {
  it('renders the closing block instead of a transition', async () => {
    renderTransition(6);
    await waitFor(() => {
      expect(document.querySelector('.transition-closing')).toBeTruthy();
    });
    expect(screen.getByText('End of the descent')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /descend/i })).toBeNull();
    expect(document.querySelector('.transition-check')).toBeNull();
  });
});
