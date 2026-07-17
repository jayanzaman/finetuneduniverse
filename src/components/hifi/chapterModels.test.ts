import { describe, expect, it } from 'vitest';
import { CHAPTER_MODELS, modelPosition, modelReadout, modelValue } from './chapterModels';

describe('chapter story models', () => {
  it('provides one model for every chapter', () => {
    expect(CHAPTER_MODELS).toHaveLength(7);
  });

  it('round-trips normalized positions and real values', () => {
    for (const model of CHAPTER_MODELS) {
      const position = modelPosition(model, model.initial);
      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThanOrEqual(1);
      expect(modelValue(model, position)).toBeCloseTo(model.initial, 8);
    }
  });

  it('returns formula feedback and formatted readouts', () => {
    for (const model of CHAPTER_MODELS) {
      expect(model.formula.length).toBeGreaterThanOrEqual(10);
      expect(model.outcome(model.initial).length).toBeGreaterThan(10);
      expect(modelReadout(model, model.initial)).not.toBe('');
    }
  });
});
