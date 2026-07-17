import { describe, expect, it } from 'vitest';
import { calculateLifeOutcome } from './LifeSection';

describe('geological life outcome model', () => {
  const hadeanOptimum = {
    selectedEra: 0,
    co2Level: 4750,
    oxygenLevel: 0.001,
    temperature: 85,
    volcanicActivity: 12,
    asteroidActivity: 40,
  };

  it('recognizes the selected era optimum', () => {
    expect(calculateLifeOutcome(hadeanOptimum)).toContain('Perfect conditions');
  });

  it('reports thermal failure when temperature is extreme', () => {
    expect(calculateLifeOutcome({ ...hadeanOptimum, co2Level: 0, temperature: 350 }))
      .toContain('Too hot');
  });

  it('reports oxygen toxicity for early anaerobic eras', () => {
    expect(calculateLifeOutcome({
      ...hadeanOptimum,
      co2Level: 0,
      oxygenLevel: 90,
      temperature: 100,
      volcanicActivity: 0,
      asteroidActivity: 0,
    })).toContain('Oxygen toxicity');
  });
});
