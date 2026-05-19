/**
 * The seven chapters of the descent — shared metadata used by the
 * top nav, chapter rail, landing strip, and the per-section chapter frame.
 */
export const CHAPTERS = [
  { n: '01', t: 'Beginning', long: 'The Beginning',          d: 'Low entropy start',    era: '13.8 Bya' },
  { n: '02', t: 'Matter',    long: 'Quarks to Atoms',        d: 'Formation of matter',  era: 't + 1μs' },
  { n: '03', t: 'Stars',     long: 'First Stars',            d: 'Ignition',             era: '200 Mya' },
  { n: '04', t: 'Galaxy',    long: 'Blackhole at the Heart', d: 'Galaxy assembly',      era: '1 Gya' },
  { n: '05', t: 'Planets',   long: 'Goldilocks Zone',        d: 'A habitable orbit',    era: '9.2 Gya' },
  { n: '06', t: 'Life',      long: 'Chemistry to Codes',     d: 'Abiogenesis',          era: '3.8 Gya' },
  { n: '07', t: 'Geology',   long: 'Geologic Time',          d: 'A planet remade',      era: 'now' },
] as const;

export type ChapterMeta = (typeof CHAPTERS)[number];
