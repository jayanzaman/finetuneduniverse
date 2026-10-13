// CH 01 · Parameter configuration — single source of truth.
// Real-world values + normalized 0..1 zones for the slider band.

export type ParamKey =
  | 'entropy'
  | 'expansion'
  | 'fluctuations'
  | 'shape'
  | 'darkEnergy'
  | 'temperature';

export type ParamDef = {
  n: string;
  key: ParamKey;
  name: string;
  question: string;
  unit: string;
  /** Real-world value range [min, max]. */
  range: [number, number];
  /** Real-world band where the universe is hospitable. */
  band: [number, number];
  /** Default real-world value. */
  defaultValue: number;
  /** Decimal places when formatting the value. */
  precision: number;
  leftCap: string;
  rightCap: string;
  /** Failure copy if outside the band on the left/right. */
  failLeft?: string;
  failRight?: string;
  /** Whether this param contributes to the total score. */
  scored: boolean;
};

export const PARAMS: ParamDef[] = [
  {
    n: '01',
    key: 'entropy',
    name: 'Initial Entropy',
    question: 'How organized was the universe at the beginning?',
    unit: 'S/k',
    range: [0.1, 10],
    band: [0.5, 1.5],
    defaultValue: 1,
    precision: 2,
    leftCap: 'order',
    rightCap: 'chaos',
    failLeft: 'no gradients',
    failRight: 'thermal death',
    scored: true,
  },
  {
    n: '02',
    key: 'expansion',
    name: 'Expansion Rate',
    question: 'How fast does space stretch — Hubble constant H₀?',
    unit: 'H₀',
    range: [0.1, 2],
    band: [0.5, 0.9],
    defaultValue: 0.7,
    precision: 2,
    leftCap: 'slow',
    rightCap: 'runaway',
    failLeft: 'big crunch',
    failRight: 'tears apart',
    scored: true,
  },
  {
    n: '03',
    key: 'fluctuations',
    name: 'Density Fluctuations',
    question: 'Quantum ripples — the seeds of every later structure.',
    unit: 'δρ/ρ ×10⁻⁵',
    range: [0, 1],
    band: [0.1, 0.3],
    defaultValue: 0.2,
    precision: 2,
    leftCap: 'smooth',
    rightCap: 'turbulent',
    failLeft: 'no structure',
    failRight: 'black-hole soup',
    scored: true,
  },
  {
    n: '04',
    key: 'shape',
    name: 'Universe Shape',
    question: 'How matter density determines the geometry of space.',
    unit: 'Ω',
    range: [0.5, 1.5],
    band: [0.98, 1.02],
    defaultValue: 1,
    precision: 3,
    leftCap: 'saddle (H³ open)',
    rightCap: 'sphere (S³ closed)',
    failLeft: 'hyperbolic space (H³)',
    failRight: 'closed 3-sphere (S³)',
    scored: false,
  },
  {
    n: '05',
    key: 'darkEnergy',
    name: 'Dark Energy Λ',
    question: 'How does the non-diluting energy of empty space come to dominate 70% of the universe?',
    unit: 'Λ',
    range: [0, 2],
    band: [0.8, 1.2],
    defaultValue: 1,
    precision: 2,
    leftCap: 'collapses',
    rightCap: 'tears apart',
    scored: false,
  },
  {
    n: '06',
    key: 'temperature',
    name: 'CMB Uniformity',
    question: 'How uniform is the background temperature?',
    unit: 'K · ΔT ±18μK',
    range: [0.9, 1],
    band: [0.99998, 1],
    defaultValue: 0.99999,
    precision: 5,
    leftCap: 'mottled',
    rightCap: 'uniform',
    scored: false,
  },
];

/** Map a real-world value to a normalized 0..1 slider position. */
export function toNormalized(value: number, range: [number, number]): number {
  const [min, max] = range;
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/** Map a normalized 0..1 slider position to a real-world value. */
export function toRealValue(position: number, range: [number, number]): number {
  const [min, max] = range;
  return min + position * (max - min);
}

/** Normalized band [low, high] (0..1) for a parameter. */
export function normalizedBand(p: ParamDef): [number, number] {
  return [toNormalized(p.band[0], p.range), toNormalized(p.band[1], p.range)];
}

/** True when the real-world value sits inside the band. */
export function isInBand(p: ParamDef, value: number): boolean {
  return value >= p.band[0] && value <= p.band[1];
}

/** Format a real-world value for the readout. */
export function formatValue(p: ParamDef, value: number): string {
  return value.toFixed(p.precision);
}

/** URL slug for a parameter key. */
export function paramSlug(key: ParamKey): string {
  switch (key) {
    case 'darkEnergy':
      return 'dark-energy';
    case 'temperature':
      return 'cmb-uniformity';
    default:
      return key;
  }
}

/** Find parameter by key, slug, number, or normalized name. */
export function findParam(keyOrSlug: string): ParamDef | undefined {
  const norm = keyOrSlug.toLowerCase().replace(/[-_]/g, '');
  return PARAMS.find((p) => {
    const pKeyNorm = p.key.toLowerCase().replace(/[-_]/g, '');
    const pNameNorm = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return (
      p.key === keyOrSlug ||
      p.n === keyOrSlug ||
      p.n === keyOrSlug.padStart(2, '0') ||
      pKeyNorm === norm ||
      pNameNorm === norm ||
      (p.key === 'darkEnergy' && (norm === 'darkenergy' || norm === '05')) ||
      (p.key === 'temperature' && (norm === 'cmbuniformity' || norm === 'temperature' || norm === '06'))
    );
  });
}
