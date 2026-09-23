import { describe, expect, it } from 'vitest';
import { planetState } from './ChapterVisuals';

describe('planetState (ch05 visual state)', () => {
  it('is habitable inside the 0.95–1.37 AU band', () => {
    expect(planetState(1)).toBe('habitable');
    expect(planetState(0.95)).toBe('habitable');
    expect(planetState(1.37)).toBe('habitable');
  });

  it('is hot inside the inner edge', () => {
    expect(planetState(0.94)).toBe('hot');
    expect(planetState(0.5)).toBe('hot');
  });

  it('is frozen outside the outer edge', () => {
    expect(planetState(1.38)).toBe('frozen');
    expect(planetState(2)).toBe('frozen');
  });
});