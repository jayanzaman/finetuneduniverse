/**
 * The seven chapters of the descent — shared metadata used by the
 * top nav, chapter rail, landing strip, and the per-section chapter frame.
 */
export const CHAPTERS = [
  {
    n: '01', slug: 'why-did-the-universe-begin-ordered', t: 'Beginning', long: 'The Beginning', d: 'Low entropy start', era: '13.8 Bya',
    question: 'Why did the universe begin in such a low-entropy state?',
    currentAnswer: 'Cosmic microwave background maps show the early universe was almost perfectly smooth, with temperature differences of about one part in 100,000, corresponding to extraordinarily low gravitational entropy. Gravity then amplified those tiny differences into galaxies and the large-scale structure we observe today.',
    openQuestion: 'Why the universe began in that low-entropy state rather than the vastly more probable high-entropy one remains unsettled. Proposed explanations include cosmic inflation and the idea that the low-entropy boundary records a deeper statistical or quantum constraint.',
    evidence: 'open-question',
  },
  {
    n: '02', slug: 'why-did-any-matter-survive', t: 'Matter', long: 'Quarks to Atoms', d: 'Formation of matter', era: 't + 1μs',
    question: 'Why did any matter survive annihilation?',
    currentAnswer: 'A small matter–antimatter asymmetry left the material that later formed galaxies, stars, and planets.',
    openQuestion: 'The origin and full mechanism of baryogenesis remain unresolved.',
    evidence: 'model-inference',
  },
  {
    n: '03', slug: 'why-can-stars-make-complex-elements', t: 'Stars', long: 'First Stars', d: 'Ignition', era: '200 Mya',
    question: 'Why can stars manufacture complex elements?',
    currentAnswer: 'Stellar cores fuse hydrogen into helium. More massive stars build carbon, oxygen, and heavier nuclei, and the heaviest elements are forged and dispersed by supernovae and neutron-star mergers. Main-sequence lifetime scales roughly as mass to the power minus 2.5, so a Sun-like star shines for about 10 billion years.',
    openQuestion: 'The first, metal-free Population III stars have never been directly observed, and reconstructing exactly how their explosions enriched the cosmos into the element mix we see today remains active work.',
    evidence: 'observed-model',
  },
  {
    n: '04', slug: 'how-do-galaxies-become-stable', t: 'Galaxy', long: 'Black Hole at the Heart', d: 'Galaxy assembly', era: '1 Gya',
    question: 'How do galaxies become stable enough for long-lived planetary systems?',
    currentAnswer: 'Dark matter, angular momentum, gas feedback, mergers, and central black holes jointly shape galactic evolution.',
    openQuestion: 'The relative causal role of central black holes in different galaxies is still being refined.',
    evidence: 'model-inference',
  },
  {
    n: '05', slug: 'how-narrow-is-planetary-habitability', t: 'Planets', long: 'Goldilocks Zone', d: 'A habitable orbit', era: '9.2 Gya',
    question: 'How narrow is planetary habitability?',
    currentAnswer: 'For a Sun-like star, equilibrium temperature scales as the inverse square root of orbital distance, about 278 kelvin divided by the square root of the distance in AU. Greenhouse effect, reflectivity, and atmosphere then decide whether surface liquid water can persist; conservative models place the habitable zone near 0.95 to 1.4 AU.',
    openQuestion: 'Real habitability likely extends beyond this surface-water model. Subsurface oceans, water-rich worlds, and organisms far more tolerant than any we know could widen the zone substantially.',
    evidence: 'simplified-model',
  },
  {
    n: '06', slug: 'can-chemistry-begin-copying-itself', t: 'Life', long: 'Chemistry to Codes', d: 'Abiogenesis', era: '3.8 Gya',
    question: 'Can chemistry begin copying itself?',
    currentAnswer: 'Laboratory chemistry demonstrates several plausible steps, including building blocks, membranes, and template-directed reactions.',
    openQuestion: 'No complete, historically verified pathway from geochemistry to the first evolving cells is known.',
    evidence: 'open-question',
  },
  {
    n: '07', slug: 'why-did-complex-life-take-so-long', t: 'Geology', long: 'Geologic Time', d: 'A planet remade', era: 'now',
    question: 'Why did complex life take so long?',
    currentAnswer: 'Environmental change, oxygenation, ecological feedback, and evolutionary innovation unfolded across billions of years.',
    openQuestion: 'How repeatable that trajectory would be on another habitable planet remains unknown.',
    evidence: 'observed-model',
  },
] as const;

export type EvidenceStatus = (typeof CHAPTERS)[number]['evidence'];

export const EVIDENCE_LABELS: Record<EvidenceStatus, string> = {
  'observed-model': 'Observation + model',
  'model-inference': 'Model-dependent inference',
  'simplified-model': 'Simplified teaching model',
  'open-question': 'Open scientific question',
};

export type ChapterMeta = (typeof CHAPTERS)[number];
