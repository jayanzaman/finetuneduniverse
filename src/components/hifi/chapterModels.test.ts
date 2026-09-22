import { describe, expect, it } from 'vitest';
import { CHAPTER_MODELS, modelPosition, modelReadout, modelValue, modelVisualState } from './chapterModels';

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

describe('modelVisualState', () => {
  it('maps every chapter model to a numeric visual state', () => {
    for (const model of CHAPTER_MODELS) {
      const state = modelVisualState(model, model.initial);
      expect(typeof state.intensity).toBe('number');
      expect(typeof state.instability).toBe('number');
      expect(typeof state.scale).toBe('number');
      expect(state.scale).toBeGreaterThan(0);
    }
  });

  it('derives a stable visual state for a given model value', () => {
    for (const model of CHAPTER_MODELS) {
      const value = model.min + (model.max - model.min) * 0.25;
      expect(modelVisualState(model, value)).toEqual(modelVisualState(model, value));
    }
  });

  it('defaults to greater instability at the band edges than at the centre', () => {
    for (const model of CHAPTER_MODELS) {
      // Custom visualState callbacks are free to override the relationship;
      // only assert it for models using the default fallback.
      if (model.visualState) continue;
      const centre = modelVisualState(model, model.min + (model.max - model.min) / 2);
      const edge = modelVisualState(model, model.max);
      expect(edge.instability).toBeGreaterThanOrEqual(centre.instability);
    }
  });
});

describe('claim metadata', () => {
  it('gives every model a band inside its range and at least one source', () => {
    for (const model of CHAPTER_MODELS) {
      expect(model.sources.length).toBeGreaterThan(0);
      expect(model.band[0]).toBeGreaterThanOrEqual(model.min);
      expect(model.band[1]).toBeLessThanOrEqual(model.max);
      expect(model.band[0]).toBeLessThanOrEqual(model.band[1]);
    }
  });
});
