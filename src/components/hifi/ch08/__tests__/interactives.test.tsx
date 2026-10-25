import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

vi.mock('../../audio/cues', () => ({ cue: vi.fn() }));
vi.mock('../../progression/ProgressionContext', () => ({
  useProgression: () => ({ markInteracted: vi.fn() }),
}));

import { cue } from '../../audio/cues';
import { StorageComparator, dnaGrams, formatMass } from '../interactives/StorageComparator';
import { DnaOdometer, nearestComparison, organDnaKm } from '../interactives/DnaOdometer';
import { CodonWheel } from '../interactives/CodonWheel';
import { ShuffleTheCode } from '../interactives/ShuffleTheCode';
import { SequenceSpace } from '../interactives/SequenceSpace';
import { SiblingRoller, rollSiblingShare } from '../interactives/SiblingRoller';
import { mulberry32 } from '../lib/codonTable';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('ch08 interactives render with accessible names', () => {
  it.each([
    ['DNA storage comparator', <StorageComparator key="a" />],
    ['Your DNA odometer', <DnaOdometer key="b" />],
    ['Codon wheel', <CodonWheel key="c" />],
    ['Shuffle the code', <ShuffleTheCode key="d" />],
    ['Protein sequence space explorer', <SequenceSpace key="e" />],
    ['Roll a sibling', <SiblingRoller key="f" />],
  ])('%s', (name, element) => {
    render(element);
    expect(screen.getByRole('region', { name })).toBeTruthy();
  });
});

describe('StorageComparator', () => {
  it('computes DNA masses at the right orders of magnitude', () => {
    // 256 GB phone ≈ 1.2 µg; 1 EB data center ≈ 4.7 g; 130 TB of books ≈ 0.6 mg.
    expect(formatMass(dnaGrams(256e9))).toBe('1.2 µg');
    expect(formatMass(dnaGrams(1e18))).toBe('4.7 g');
    expect(formatMass(dnaGrams(130e12))).toBe('0.6 mg');
  });

  it('announces the selected option mass in the live region', () => {
    render(<StorageComparator />);
    fireEvent.click(screen.getByRole('button', { name: 'A modern smartphone' }));
    expect(screen.getByRole('status').textContent).toContain('1.2 µg of DNA');
    expect(screen.getByRole('button', { name: 'A modern smartphone' }).getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'A large data center' }));
    expect(screen.getByRole('status').textContent).toContain('4.7 g of DNA');
  });
});

describe('DnaOdometer', () => {
  it('whole body reaches Pluto; an organ falls short', () => {
    render(<DnaOdometer />);
    fireEvent.click(screen.getByRole('button', { name: 'Whole body' }));
    const status = screen.getByRole('status').textContent ?? '';
    expect(status).toContain('6 billion km');
    expect(status).toContain('3.7 billion miles');
    expect(status).toContain('100% — the whole way to Pluto');

    fireEvent.click(screen.getByRole('button', { name: 'Heart' }));
    const heart = screen.getByRole('status').textContent ?? '';
    expect(heart).toContain('6 million km');
    expect(heart).toContain('0.10% of the way to Pluto');
    expect(heart).toContain('the Moon');
  });

  it('pure helpers stay sane', () => {
    expect(organDnaKm(3e12)).toBe(6e9);
    expect(nearestComparison(6e9)).toContain('Pluto');
    expect(nearestComparison(6e6)).toContain('Moon');
  });
});

describe('CodonWheel', () => {
  it('completes ATG and announces Methionine, cueing each letter', () => {
    render(<CodonWheel />);
    for (const b of ['A', 'T', 'G']) {
      fireEvent.click(screen.getByRole('button', { name: `Add ${b}` }));
    }
    const status = screen.getByRole('status').textContent ?? '';
    expect(status).toContain('ATG');
    expect(status).toContain('Methionine');
    expect(status).toContain('its only codon');
    expect(vi.mocked(cue).mock.calls.filter((c) => c[0] === 'codon')).toHaveLength(3);
  });

  it('announces redundancy for a six-codon amino acid', () => {
    render(<CodonWheel />);
    for (const b of ['T', 'T', 'A']) {
      fireEvent.click(screen.getByRole('button', { name: `Add ${b}` }));
    }
    expect(screen.getByRole('status').textContent).toContain('Leucine — one of 6 codons');
  });

  it('name toy spells letters and skips B/J/O/X/Z', () => {
    render(<CodonWheel />);
    fireEvent.change(screen.getByLabelText(/type your name/i), { target: { value: 'MAX' } });
    expect(screen.getByText(/M – Methionine/)).toBeTruthy();
    expect(screen.getByText(/A – Alanine/)).toBeTruthy();
    expect(screen.getByText(/Skipped: X/)).toBeTruthy();
  });

  it('shows the O/U note when those letters appear', () => {
    render(<CodonWheel />);
    fireEvent.change(screen.getByLabelText(/type your name/i), { target: { value: 'UO' } });
    expect(screen.getByText(/selenocysteine/)).toBeTruthy();
  });
});

describe('ShuffleTheCode', () => {
  it('updates the live result and tally on each shuffle', () => {
    render(<ShuffleTheCode />);
    const button = screen.getByRole('button', { name: 'Shuffle the code' });
    fireEvent.click(button);
    const status = screen.getByRole('status').textContent ?? '';
    expect(status).toMatch(/shuffle #1 · seed \d+/);
    expect(status).toMatch(/Real code/);
    expect(status).toMatch(/Shuffled/);
    expect(status).toMatch(/\d+\.\d%/);
    expect(screen.getByText(/of 1 shuffled code was worse|of 1 shuffled codes?/)).toBeTruthy();

    fireEvent.click(button);
    expect(screen.getByRole('status').textContent).toMatch(/shuffle #2/);
  });
});

describe('SequenceSpace', () => {
  it('ArrowRight grows the exponent readout and never shows Infinity', () => {
    render(<SequenceSpace />);
    const status = screen.getByRole('status');
    const before = status.textContent ?? '';
    expect(before).toContain('possible sequences');
    expect(before).toContain('10¹⁹⁵'); // 150 aa default
    expect(before).not.toContain('Infinity');

    const slider = screen.getByRole('slider', { name: 'Protein length' });
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    const after = screen.getByRole('status').textContent ?? '';
    expect(after).not.toBe(before);
    expect(after).toContain('10²⁰⁸'); // 160 aa
    expect(after).not.toContain('Infinity');
  });

  it('shows the disputed honesty range without picking a side', () => {
    render(<SequenceSpace />);
    expect(screen.getByText(/actively debated/)).toBeTruthy();
    expect(screen.getByText(/1 in 10¹⁰/)).toBeTruthy();
    expect(screen.getByText(/range disputed/i)).toBeTruthy();
  });
});

describe('SiblingRoller', () => {
  it('rollSiblingShare stays within [0, 100] and averages near 50', () => {
    const values: number[] = [];
    for (let seed = 1; seed <= 200; seed++) {
      const v = rollSiblingShare(mulberry32(seed));
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
      values.push(v);
    }
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    expect(mean).toBeGreaterThan(44);
    expect(mean).toBeLessThan(56);
  });

  it('announces the roll result', () => {
    render(<SiblingRoller />);
    fireEvent.click(screen.getByRole('button', { name: 'Roll a sibling' }));
    expect(screen.getByRole('status').textContent).toMatch(/You share \d+(\.\d)?% of your DNA/);
  });
});
