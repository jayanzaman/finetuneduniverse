import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

vi.mock('../../audio/cues', () => ({ cue: vi.fn() }));
vi.mock('../../progression/ProgressionContext', () => ({
  useProgression: () => ({ markInteracted: vi.fn() }),
}));

import { renderEmphasis } from '../emphasis';
import { ScrollySteps } from '../ScrollySteps';
import { SourcesDrawer } from '../SourcesDrawer';
import CodeWithinSection from '../../../universe-builder/sections/CodeWithinSection';

class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', NoopIntersectionObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('renderEmphasis', () => {
  it('turns *…* markers into <em> elements', () => {
    const { container } = render(<p>{renderEmphasis('it’s *really* cool and *very* dense')}</p>);
    const ems = container.querySelectorAll('em');
    expect(ems).toHaveLength(2);
    expect(ems[0].textContent).toBe('really');
    expect(ems[1].textContent).toBe('very');
    expect(container.textContent).toBe('it’s really cool and very dense');
  });

  it('passes marker-free text through untouched', () => {
    expect(renderEmphasis('plain copy')).toBe('plain copy');
  });
});

describe('ScrollySteps', () => {
  it('renders every panel’s content in document order', () => {
    const panels = [
      { id: 'a', content: <p>Panel alpha</p> },
      { id: 'b', content: <p>Panel bravo</p> },
      { id: 'c', content: <p>Panel charlie</p> },
    ];
    const { container } = render(
      <ScrollySteps panels={panels} renderVisual={(i) => <div>visual {i}</div>} />,
    );
    const text = container.textContent ?? '';
    const ia = text.indexOf('Panel alpha');
    const ib = text.indexOf('Panel bravo');
    const ic = text.indexOf('Panel charlie');
    expect(ia).toBeGreaterThanOrEqual(0);
    expect(ib).toBeGreaterThan(ia);
    expect(ic).toBeGreaterThan(ib);
  });

  it('marks the sticky visual pane as decorative', () => {
    const { container } = render(
      <ScrollySteps
        panels={[{ id: 'a', content: <p>Only panel</p> }]}
        renderVisual={() => <div>visual</div>}
      />,
    );
    const pane = container.querySelector('[aria-hidden="true"]');
    expect(pane?.textContent).toContain('visual');
  });
});

describe('SourcesDrawer', () => {
  it('toggles aria-expanded and lists all 12 sources when open', () => {
    render(<SourcesDrawer />);
    const button = screen.getByRole('button', { name: /sources/i });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);

    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/Every number in this chapter/)).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(12);

    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('CodeWithinSection', () => {
  it('smoke-renders the full chapter: titles, honesty note, and the back link', () => {
    render(<CodeWithinSection educatorMode={false} />);

    // Step titles (scenes fall back to static SVGs under jsdom — no WebGL).
    expect(screen.getByRole('heading', { name: /best data center isn’t in a data center/i })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Six feet of instructions/i })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /From here to Pluto/i })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Four letters, sixty-four words/i })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /code that absorbs its own typos/i })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /library bigger than the universe/i })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /odds of you/i })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Twenty building blocks/i })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /open question/i })).toBeTruthy();

    // The 1-in-10¹⁰ to 1-in-10⁷⁷ honesty note must be visible without picking a side.
    expect(screen.getAllByText(/1 in 10¹⁰/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1 in 10⁷⁷/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/we don’t pick a side/i).length).toBeGreaterThan(0);

    // In-copy CTA back to chapter 01.
    const back = screen.getByRole('link', { name: /back to the beginning/i });
    expect(back.getAttribute('href')).toBe('/questions/why-did-the-universe-begin-ordered');

    // Interactives mounted (role="region" self-announcement).
    expect(screen.getByRole('region', { name: 'DNA storage comparator' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Your DNA odometer' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Codon wheel' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Shuffle the code' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Protein sequence space explorer' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Roll a sibling' })).toBeTruthy();
  });
});
