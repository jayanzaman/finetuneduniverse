import { describe, expect, it } from 'vitest';
import {
  AMINO_ACIDS,
  CODON_TABLE,
  NAME_TO_CODONS,
  lookupCodon,
  mulberry32,
  mutationEffect,
  nameToProtein,
  shuffleCodonTable,
  simulateMutations,
} from '../lib/codonTable';

describe('CODON_TABLE', () => {
  it('has all 64 codons', () => {
    expect(Object.keys(CODON_TABLE)).toHaveLength(64);
  });

  it('marks TAA, TAG, TGA as stops', () => {
    expect(CODON_TABLE.TAA).toBe('*');
    expect(CODON_TABLE.TAG).toBe('*');
    expect(CODON_TABLE.TGA).toBe('*');
  });

  it('has 61 sense codons and 3 stops', () => {
    const letters = Object.values(CODON_TABLE);
    expect(letters.filter((l) => l === '*')).toHaveLength(3);
    expect(letters.filter((l) => l !== '*')).toHaveLength(61);
  });

  it('covers exactly 20 amino-acid letters', () => {
    const letters = new Set(Object.values(CODON_TABLE).filter((l) => l !== '*'));
    expect(letters.size).toBe(20);
    for (const letter of letters) expect(AMINO_ACIDS[letter]).toBeDefined();
  });

  it('maps known codons correctly', () => {
    expect(CODON_TABLE.ATG).toBe('M');
    expect(CODON_TABLE.GGT).toBe('G');
    expect(CODON_TABLE.TTT).toBe('F');
  });
});

describe('NAME_TO_CODONS', () => {
  it('inverts the table without losing codons', () => {
    const total = Object.values(NAME_TO_CODONS).reduce((n, codons) => n + codons.length, 0);
    expect(total).toBe(64);
    expect(NAME_TO_CODONS['*']).toEqual(['TAA', 'TAG', 'TGA']);
    expect(NAME_TO_CODONS.M).toEqual(['ATG']);
    expect(NAME_TO_CODONS.L).toHaveLength(6);
  });
});

describe('lookupCodon', () => {
  it('normalizes lowercase and U to T', () => {
    expect(lookupCodon('atg')).toEqual({ letter: 'M', name: 'Methionine' });
    expect(lookupCodon('AUG')).toEqual({ letter: 'M', name: 'Methionine' });
    expect(lookupCodon('uaa')).toEqual({ letter: '*', name: 'Stop' });
  });

  it('returns null for invalid input', () => {
    expect(lookupCodon('AT')).toBeNull();
    expect(lookupCodon('XYZ')).toBeNull();
    expect(lookupCodon('')).toBeNull();
  });
});

describe('nameToProtein', () => {
  it('maps name letters to amino-acid codes and representative codons', () => {
    const result = nameToProtein('Ada');
    expect(result.letter).toBe('ADA');
    expect(result.codons).toEqual([NAME_TO_CODONS.A[0], NAME_TO_CODONS.D[0], NAME_TO_CODONS.A[0]]);
    expect(result.skipped).toEqual([]);
  });

  it('skips B, J, O, X, Z', () => {
    const result = nameToProtein('JBOXZ');
    expect(result.letter).toBe('');
    expect(result.skipped).toEqual(['J', 'B', 'O', 'X', 'Z']);
  });

  it('adds a note when O or U is skipped', () => {
    expect(nameToProtein('Zoe').note).toContain('pyrrolysine');
    expect(nameToProtein('Uma').note).toContain('selenocysteine');
    expect(nameToProtein('Max').note).toBeUndefined();
  });
});

describe('shuffleCodonTable', () => {
  it('preserves the 64-outcome multiset and stop count', () => {
    const shuffled = shuffleCodonTable(mulberry32(42));
    const realOutcomes = Object.values(CODON_TABLE).sort();
    const shuffledOutcomes = Object.values(shuffled).sort();
    expect(shuffledOutcomes).toEqual(realOutcomes);
    expect(Object.values(shuffled).filter((l) => l === '*')).toHaveLength(3);
    expect(Object.keys(shuffled).sort()).toEqual(Object.keys(CODON_TABLE).sort());
  });

  it('is deterministic for a fixed seed', () => {
    expect(shuffleCodonTable(mulberry32(7))).toEqual(shuffleCodonTable(mulberry32(7)));
  });
});

describe('mutationEffect', () => {
  it('classifies silent, similar, radical, stop-gain and stop-loss', () => {
    expect(mutationEffect('TTT', 'TTC', CODON_TABLE)).toBe('silent');
    expect(mutationEffect('GAA', 'GAT', CODON_TABLE)).toBe('similar');
    expect(mutationEffect('GAA', 'AAA', CODON_TABLE)).toBe('radical');
    expect(mutationEffect('GAA', 'TAA', CODON_TABLE)).toBe('stop-gain');
    expect(mutationEffect('TAA', 'TAT', CODON_TABLE)).toBe('stop-loss');
  });
});

describe('simulateMutations', () => {
  const damage = (counts: { radical: number; 'stop-gain': number }) => counts.radical + counts['stop-gain'];

  it('returns counts summing to the number of trials for both tables', () => {
    const shuffled = shuffleCodonTable(mulberry32(1));
    const { real, alternative } = simulateMutations(shuffled, 2000, mulberry32(2));
    const sum = (c: Record<string, number>) => Object.values(c).reduce((a, b) => a + b, 0);
    expect(sum(real)).toBe(2000);
    expect(sum(alternative)).toBe(2000);
  });

  it('the real code takes less damage than at least one shuffled code (fixed seeds)', () => {
    const seeds = [3, 5, 8];
    const realDamage = damage(simulateMutations(CODON_TABLE, 5000, mulberry32(99)).real);
    const shuffledDamages = seeds.map((seed) => {
      const table = shuffleCodonTable(mulberry32(seed));
      return damage(simulateMutations(table, 5000, mulberry32(99)).alternative);
    });
    expect(Math.min(...shuffledDamages)).toBeGreaterThan(realDamage);
  });
});
