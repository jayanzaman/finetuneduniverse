import { describe, expect, it } from 'vitest';
import { DEFAULT_PALETTE, getPalette, registerPalette, type ChapterPalette } from './palette';

describe('palette registry', () => {
  it('falls back to the default palette for unknown ids', () => {
    expect(getPalette('nope')).toBe(DEFAULT_PALETTE);
  });

  it('returns a registered palette by id', () => {
    const p: ChapterPalette = {
      id: 'test-ch',
      drone: { notes: ['A2', 'E3'], gain: 0.4 },
      motifs: { 'test:comp': ['A4', 'C5'] },
      tension: { brightHz: 1000, darkHz: 200, detuneCents: 25 },
      cadence: ['A3', 'E4', 'A4'],
    };
    registerPalette(p);
    expect(getPalette('test-ch')).toBe(p);
  });

  it('default palette has a drone, tension mapping, and cadence', () => {
    expect(DEFAULT_PALETTE.drone.notes.length).toBeGreaterThan(0);
    expect(DEFAULT_PALETTE.tension.brightHz).toBeGreaterThan(DEFAULT_PALETTE.tension.darkHz);
    expect(DEFAULT_PALETTE.cadence.length).toBeGreaterThan(0);
  });
});
