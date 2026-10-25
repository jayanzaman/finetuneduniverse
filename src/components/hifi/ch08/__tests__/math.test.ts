import { describe, expect, it } from 'vitest';
import {
  bigRatioWords,
  compareToKnown,
  formatScientific,
  log10OfPow,
  sequenceSpaceLog10,
  splitLog10,
} from '../lib/math';

describe('log10OfPow', () => {
  it('computes log10 of 20^150', () => {
    expect(log10OfPow(20, 150)).toBeCloseTo(195.15, 1);
    expect(sequenceSpaceLog10(150)).toBeCloseTo(195.15, 1);
  });

  it('computes log10 of 2^23', () => {
    expect(log10OfPow(2, 23)).toBeCloseTo(6.924, 3);
  });
});

describe('splitLog10', () => {
  it('normalizes the mantissa into [1, 10)', () => {
    const { mantissa, exponent } = splitLog10(195.15);
    expect(mantissa).toBeGreaterThanOrEqual(1);
    expect(mantissa).toBeLessThan(10);
    expect(exponent).toBe(195);
  });

  it('handles exact powers of ten', () => {
    const { mantissa, exponent } = splitLog10(80);
    expect(mantissa).toBeCloseTo(1, 10);
    expect(exponent).toBe(80);
  });

  it('handles non-finite input safely', () => {
    expect(splitLog10(Infinity)).toEqual({ mantissa: 1, exponent: 0 });
    expect(splitLog10(NaN)).toEqual({ mantissa: 1, exponent: 0 });
  });
});

describe('formatScientific', () => {
  it('formats 20^150 with superscript exponent', () => {
    const out = formatScientific(sequenceSpaceLog10(150));
    expect(out).toBe('1.4 × 10¹⁹⁵');
  });

  it('formats 10^80', () => {
    expect(formatScientific(80)).toBe('1.0 × 10⁸⁰');
  });

  it('formats negative exponents with a superscript minus', () => {
    expect(formatScientific(-6)).toBe('1.0 × 10⁻⁶');
  });

  it('never emits Infinity or NaN for extreme inputs', () => {
    const huge = formatScientific(sequenceSpaceLog10(100000));
    expect(huge).toBe('1.0 × 10¹³⁰¹⁰³');
    for (const bad of [Infinity, -Infinity, NaN]) {
      const out = formatScientific(bad);
      expect(out).not.toContain('Infinity');
      expect(out).not.toContain('NaN');
    }
  });
});

describe('bigRatioWords', () => {
  it('phrases ratios as ×10^n with superscripts', () => {
    expect(bigRatioWords(115)).toBe('×10¹¹⁵');
    expect(bigRatioWords(-20)).toBe('×10²⁰');
    expect(bigRatioWords(Infinity)).toBe('×10⁰');
  });
});

describe('compareToKnown', () => {
  it('reports "more than" when the value exceeds a reference', () => {
    const lines = compareToKnown(sequenceSpaceLog10(150));
    expect(lines).toHaveLength(3);
    expect(lines.every((line) => line.startsWith('more than 10'))).toBe(true);
    expect(lines[2]).toBe('more than 10¹¹⁵× the atoms in the observable universe');
  });

  it('reports "fewer than" when the value is below a reference', () => {
    const lines = compareToKnown(60);
    expect(lines[0]).toBe('more than 10⁴²× the grains of sand on Earth (a rough estimate)');
    expect(lines[1]).toBe('fewer than 1 in 10² of the Planck times since the Big Bang');
    expect(lines[2]).toBe('fewer than 1 in 10²⁰ of the atoms in the observable universe');
  });

  it('flags near-equality as "about the same"', () => {
    expect(compareToKnown(80)[2]).toBe('about the same as the atoms in the observable universe');
  });
});
