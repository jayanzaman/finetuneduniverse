export type ChapterModel = {
  min: number;
  max: number;
  initial: number;
  precision: number;
  unit: string;
  formula: string;
  format?: (value: number) => string;
  outcome: (value: number) => string;
  visualState?: (position: number) => { intensity: number; instability: number; scale: number };
  /** Source entries for the model's consequential quantitative claim. */
  sources: string[];
  /** Temperate/optimal band in real units — drives both the outcome and the slider zone. */
  band: [number, number];
};

const bandOutcome = (
  low: number,
  high: number,
  left: string,
  inside: string,
  right: string,
) => (value: number) => (value < low ? left : value > high ? right : inside);

/**
 * The primary story experiment for each chapter. These models deliberately
 * expose one causal relationship at a time; the deeper legacy labs remain
 * available through progressive disclosure.
 */
export const CHAPTER_MODELS: ChapterModel[] = [
  {
    min: 0.1,
    max: 10,
    initial: 1,
    precision: 2,
    unit: 'S/k (normalized)',
    sources: ['Carroll, From Eternity to Here (2010)', 'Penrose, The Road to Reality (2004)', 'Planck Collaboration (2020) A&A 641, A6'],
    band: [0.5, 1.5],
    formula: 'Habitability score falls with |S/k − 1|',
    outcome: bandOutcome(
      0.5,
      1.5,
      'Too ordered: no useful gradients develop.',
      'Structure can emerge: gradients persist without immediate thermal death.',
      'Too disordered: usable energy gradients disappear.',
    ),
  },
  {
    min: 0.8,
    max: 1.2,
    initial: 1,
    precision: 3,
    unit: 'gₛ / gₛ₀',
    sources: ['Rees, Just Six Numbers (2000)', 'Sakharov (1967)', 'Planck 2018 baryon asymmetry'],
    band: [0.98, 1.02],
    formula: 'Binding energy scales with the strong-coupling ratio gₛ/gₛ₀',
    outcome: bandOutcome(
      0.98,
      1.02,
      'Binding is too weak: bound nuclei and light elements become unlikely in this model.',
      'Stable nuclei and light elements remain possible.',
      'Binding is too strong: the balance of light nuclei is disrupted.',
    ),
  },
  {
    min: 0.08,
    max: 40,
    initial: 1,
    precision: 2,
    unit: 'M☉',
    sources: ['Burbidge, Burbidge, Fowler & Hoyle (1957) Rev. Mod. Phys. 29, 547', 'Kippenhahn & Weigert (1990)'],
    band: [0.5, 8],
    formula: 'Main-sequence lifetime ≈ 10¹⁰ yr × (M/M☉)⁻²·⁵',
    outcome: (value) => {
      const lifetime = 10 * Math.pow(value, -2.5);
      if (value < 0.5) return `Long-lived (~${lifetime.toFixed(1)} billion yr), but heavy-element production is limited.`;
      if (value > 8) return `Short-lived (~${Math.max(0.001, lifetime).toFixed(3)} billion yr): rapid enrichment and violent death.`;
      return `A stable fusion lifetime of roughly ${lifetime.toFixed(1)} billion years.`;
    },
  },
  {
    min: 5,
    max: 9,
    initial: 6.61,
    precision: 2,
    unit: 'log₁₀ M☉',
    sources: ['Ghez et al. (2008) ApJ 689, 1044', 'Kormendy & Ho (2013) ARA&A 51, 511'],
    band: [6, 7.3],
    formula: 'M = 10ˣ M☉',
    outcome: (value) => {
      const mass = Math.pow(10, value);
      if (value < 6) return `About ${mass.toExponential(1)} M☉: weak central regulation in this simplified model.`;
      if (value > 7.3) return `About ${mass.toExponential(1)} M☉: central activity can strongly disturb the host galaxy.`;
      return `About ${mass.toExponential(1)} M☉: compatible with a settled Milky-Way-like centre.`;
    },
  },
  {
    min: 0.5,
    max: 2,
    initial: 1,
    precision: 3,
    unit: 'AU',
    sources: ['Kasting, Whitmire & Reynolds (1993) Icarus 101, 108', 'Kopparapu et al. (2014) ApJ 787, L29'],
    band: [0.95, 1.37],
    formula: 'Equilibrium temperature ≈ 278 K / √(distance in AU)',
    outcome: (value) => {
      const celsius = 278 / Math.sqrt(value) - 273.15;
      if (value < 0.95) return `Equilibrium temperature ≈ ${celsius.toFixed(0)}°C: increased runaway-greenhouse risk.`;
      if (value > 1.37) return `Equilibrium temperature ≈ ${celsius.toFixed(0)}°C: surface water tends to freeze without strong warming.`;
      return `Equilibrium temperature ≈ ${celsius.toFixed(0)}°C: inside this model's temperate orbital band.`;
    },
  },
  {
    min: 0,
    max: 50,
    initial: 13.5,
    precision: 1,
    unit: 'W/m²',
    sources: ['Miller (1953) Science 117, 528', 'Patel et al. (2015) Nat. Chem. 7, 301'],
    band: [8, 28],
    formula: 'Productive chemistry requires energy without overwhelming molecular damage',
    outcome: bandOutcome(
      8,
      28,
      'Too little UV: fewer energetic reactions reach useful products.',
      'A productive window: chemistry receives energy while fragile products can persist.',
      'Too much UV: molecular damage outpaces assembly.',
    ),
  },
  {
    min: 0,
    max: 4.6,
    initial: 2.4,
    precision: 2,
    unit: 'billion yr after formation',
    sources: ['Holland (2006) Phil. Trans. R. Soc. B 361, 903', 'Lyons, Reinhard & Planavsky (2014) Nature 506, 307'],
    band: [1.8, 3],
    formula: 'Timing controls how long anaerobic and oxygen-using ecosystems can develop',
    outcome: bandOutcome(
      1.8,
      3,
      'Earlier oxygenation: strong stress on established anaerobic ecosystems.',
      'A long microbial prelude followed by an oxygen window for greater complexity.',
      'Later oxygenation: less time remains for oxygen-dependent complexity.',
    ),
  },
];

export function modelPosition(model: ChapterModel, value: number): number {
  return Math.max(0, Math.min(1, (value - model.min) / (model.max - model.min)));
}

export function modelValue(model: ChapterModel, position: number): number {
  return model.min + Math.max(0, Math.min(1, position)) * (model.max - model.min);
}

export function modelReadout(model: ChapterModel, value: number): string {
  return model.format?.(value) ?? value.toFixed(model.precision);
}

export function modelVisualState(model: ChapterModel, value: number) {
  const position = modelPosition(model, value);
  if (model.visualState) return model.visualState(position);
  const distance = Math.min(1, Math.abs(position - 0.5) * 2);
  return { intensity: 1 - distance * 0.45, instability: distance, scale: 1 + distance * 0.025 };
}
