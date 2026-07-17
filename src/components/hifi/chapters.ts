/**
 * The seven chapters of the descent — shared metadata used by the
 * top nav, chapter rail, landing strip, and the per-section chapter frame.
 */
export const CHAPTERS = [
  {
    n: '01', slug: 'why-did-the-universe-begin-ordered', t: 'Beginning', long: 'The Beginning', d: 'Low entropy start', era: '13.8 Bya',
    question: 'Why did the universe begin in such a low-entropy state?',
    currentAnswer: 'Observations are consistent with an extraordinarily smooth, low-gravitational-entropy early universe.',
    openQuestion: 'Physics does not yet provide a settled explanation for that initial condition.',
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
    currentAnswer: 'Gravity, nuclear binding, and stellar evolution allow fusion and explosive nucleosynthesis to build heavier nuclei.',
    openQuestion: 'The first stars and their exact enrichment history remain active observational targets.',
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
    currentAnswer: 'Orbital energy, atmosphere, mass, chemistry, and stellar history jointly determine whether surface liquid water is plausible.',
    openQuestion: 'Life may tolerate conditions far beyond the simplified surface-water model used here.',
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
