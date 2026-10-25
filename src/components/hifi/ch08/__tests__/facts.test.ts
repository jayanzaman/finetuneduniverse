import { describe, expect, it } from 'vitest';
import { FACTS, SOURCES } from '../facts';

describe('FACTS', () => {
  it('gives every fact a non-empty citation', () => {
    for (const [key, fact] of Object.entries(FACTS)) {
      expect(fact.cite.length, key).toBeGreaterThan(0);
    }
  });

  it('spot-checks key values', () => {
    expect(FACTS.dnaStorageDensity.value).toBe(215);
    expect(FACTS.codonsTotal.value).toBe(64);
    expect(FACTS.codonsSense.value).toBe(61);
    expect(FACTS.aminoAcids.value).toBe(20);
    expect(FACTS.stopCodons.value).toBe(3);
    expect(FACTS.chromosomeCombinationsPerParent.value).toBe(2 ** 23);
  });

  it('flags the packing analogy and the disputed functional-fraction estimate', () => {
    expect(FACTS.packingAnalogy.note).toContain('Analogy');
    expect(FACTS.functionalFractionRange.disputed).toBe(true);
    expect(FACTS.functionalFractionRange.note).toContain('debated');
  });

  it('keeps derived quantities consistent', () => {
    expect(FACTS.nucleatedCells.value).toBe(3_000_000_000_000);
    expect(FACTS.totalDnaKm.value).toBe(6_000_000_000);
    expect(FACTS.totalDnaKm.note).toContain('elliptical');
  });
});

describe('SOURCES', () => {
  it('is non-empty and unique', () => {
    expect(SOURCES.length).toBeGreaterThan(0);
    expect(new Set(SOURCES).size).toBe(SOURCES.length);
  });
});
