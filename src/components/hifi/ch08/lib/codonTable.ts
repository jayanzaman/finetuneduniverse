export const AMINO_ACIDS: Record<string, { name: string; abbr3: string }> = {
  A: { name: 'Alanine', abbr3: 'Ala' },
  R: { name: 'Arginine', abbr3: 'Arg' },
  N: { name: 'Asparagine', abbr3: 'Asn' },
  D: { name: 'Aspartate', abbr3: 'Asp' },
  C: { name: 'Cysteine', abbr3: 'Cys' },
  Q: { name: 'Glutamine', abbr3: 'Gln' },
  E: { name: 'Glutamate', abbr3: 'Glu' },
  G: { name: 'Glycine', abbr3: 'Gly' },
  H: { name: 'Histidine', abbr3: 'His' },
  I: { name: 'Isoleucine', abbr3: 'Ile' },
  L: { name: 'Leucine', abbr3: 'Leu' },
  K: { name: 'Lysine', abbr3: 'Lys' },
  M: { name: 'Methionine', abbr3: 'Met' },
  F: { name: 'Phenylalanine', abbr3: 'Phe' },
  P: { name: 'Proline', abbr3: 'Pro' },
  S: { name: 'Serine', abbr3: 'Ser' },
  T: { name: 'Threonine', abbr3: 'Thr' },
  W: { name: 'Tryptophan', abbr3: 'Trp' },
  Y: { name: 'Tyrosine', abbr3: 'Tyr' },
  V: { name: 'Valine', abbr3: 'Val' },
};

export const CODON_TABLE: Record<string, string> = {
  TTT: 'F', TTC: 'F', TTA: 'L', TTG: 'L',
  TCT: 'S', TCC: 'S', TCA: 'S', TCG: 'S',
  TAT: 'Y', TAC: 'Y', TAA: '*', TAG: '*',
  TGT: 'C', TGC: 'C', TGA: '*', TGG: 'W',
  CTT: 'L', CTC: 'L', CTA: 'L', CTG: 'L',
  CCT: 'P', CCC: 'P', CCA: 'P', CCG: 'P',
  CAT: 'H', CAC: 'H', CAA: 'Q', CAG: 'Q',
  CGT: 'R', CGC: 'R', CGA: 'R', CGG: 'R',
  ATT: 'I', ATC: 'I', ATA: 'I', ATG: 'M',
  ACT: 'T', ACC: 'T', ACA: 'T', ACG: 'T',
  AAT: 'N', AAC: 'N', AAA: 'K', AAG: 'K',
  AGT: 'S', AGC: 'S', AGA: 'R', AGG: 'R',
  GTT: 'V', GTC: 'V', GTA: 'V', GTG: 'V',
  GCT: 'A', GCC: 'A', GCA: 'A', GCG: 'A',
  GAT: 'D', GAC: 'D', GAA: 'E', GAG: 'E',
  GGT: 'G', GGC: 'G', GGA: 'G', GGG: 'G',
};

export const NAME_TO_CODONS: Record<string, string[]> = Object.entries(CODON_TABLE).reduce(
  (acc, [codon, letter]) => {
    (acc[letter] ??= []).push(codon);
    return acc;
  },
  {} as Record<string, string[]>,
);

export const lookupCodon = (codon: string): { letter: string; name: string } | null => {
  const normalized = codon.toUpperCase().replace(/U/g, 'T');
  if (!/^[ATGC]{3}$/.test(normalized)) return null;
  const letter = CODON_TABLE[normalized];
  const name = letter === '*' ? 'Stop' : AMINO_ACIDS[letter].name;
  return { letter, name };
};

export type NameToProteinResult = {
  letter: string;
  codons: string[];
  skipped: string[];
  note?: string;
};

const NON_STANDARD_LETTERS = new Set(['B', 'J', 'O', 'U', 'X', 'Z']);

export const nameToProtein = (name: string): NameToProteinResult => {
  const letters: string[] = [];
  const skipped: string[] = [];
  for (const ch of name.toUpperCase()) {
    if (!/[A-Z]/.test(ch)) continue;
    if (NON_STANDARD_LETTERS.has(ch) || !AMINO_ACIDS[ch]) skipped.push(ch);
    else letters.push(ch);
  }
  const result: NameToProteinResult = {
    letter: letters.join(''),
    codons: letters.map((letter) => NAME_TO_CODONS[letter][0]),
    skipped,
  };
  if (skipped.includes('O') || skipped.includes('U')) {
    result.note =
      'O (pyrrolysine) and U (selenocysteine) exist as rare 21st/22nd amino acids, but they are not part of the standard 20.';
  }
  return result;
};

export const mulberry32 = (seed: number): (() => number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const shuffleCodonTable = (rng: () => number): Record<string, string> => {
  const keys = Object.keys(CODON_TABLE).sort();
  const outcomes = keys.map((key) => CODON_TABLE[key]);
  for (let i = outcomes.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [outcomes[i], outcomes[j]] = [outcomes[j], outcomes[i]];
  }
  return Object.fromEntries(keys.map((key, i) => [key, outcomes[i]]));
};

export type MutationEffect = 'silent' | 'similar' | 'radical' | 'stop-gain' | 'stop-loss';

const CHEMICAL_GROUPS: string[] = ['AVLIMFWPG', 'STCYNQ', 'KRH', 'DE'];

const groupOf = (letter: string): number => CHEMICAL_GROUPS.findIndex((g) => g.includes(letter));

export const mutationEffect = (
  codon: string,
  mutatedCodon: string,
  table: Record<string, string>,
): MutationEffect => {
  const from = table[codon];
  const to = table[mutatedCodon];
  if (from === to) return 'silent';
  if (from === '*') return 'stop-loss';
  if (to === '*') return 'stop-gain';
  return groupOf(from) === groupOf(to) ? 'similar' : 'radical';
};

export type MutationCounts = Record<MutationEffect, number>;

const BASES = ['A', 'T', 'G', 'C'];

export const simulateMutations = (
  table: Record<string, string>,
  trials: number,
  rng: () => number,
): { real: MutationCounts; alternative: MutationCounts } => {
  const zero = (): MutationCounts => ({ silent: 0, similar: 0, radical: 0, 'stop-gain': 0, 'stop-loss': 0 });
  const real = zero();
  const alternative = zero();
  const senseCodons = Object.keys(table).filter((codon) => table[codon] !== '*');
  for (let i = 0; i < trials; i++) {
    const codon = senseCodons[Math.floor(rng() * senseCodons.length)];
    const position = Math.floor(rng() * 3);
    const replacements = BASES.filter((b) => b !== codon[position]);
    const mutated =
      codon.slice(0, position) +
      replacements[Math.floor(rng() * replacements.length)] +
      codon.slice(position + 1);
    real[mutationEffect(codon, mutated, CODON_TABLE)]++;
    alternative[mutationEffect(codon, mutated, table)]++;
  }
  return { real, alternative };
};
