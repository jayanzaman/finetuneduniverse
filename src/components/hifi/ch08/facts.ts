export type Fact = {
  value: string | number;
  display: string;
  cite: string;
  note?: string;
  disputed?: boolean;
};

export const FACTS = {
  dnaStorageDensity: {
    value: 215,
    display: '215 petabytes per gram',
    cite: 'Erlich & Zielinski (2017) Science 355, 950',
  },
  dnaLengthPerCell: {
    value: 2,
    display: '~2 metres of DNA per cell',
    cite: 'Annunziato (2008) Nature Education 1, 26',
  },
  basePairsDiploid: {
    value: 6_200_000_000,
    display: '~6.2 billion base pairs per diploid genome',
    cite: 'Alberts et al., Molecular Biology of the Cell (6th ed.)',
  },
  nucleusDiameterUm: {
    value: 6,
    display: '~6 µm nucleus diameter',
    cite: 'Alberts et al., Molecular Biology of the Cell (6th ed.)',
  },
  packingAnalogy: {
    value: '40 km of thread packed into a tennis ball',
    display: 'like packing 40 km of thread into a tennis ball',
    cite: 'Annunziato (2008) Nature Education 1, 26',
    note: 'Analogy, not a measurement: scaling 2 m of ~2 nm-wide DNA into a ~6 µm nucleus gives roughly these proportions.',
  },
  totalCells: {
    value: 30_000_000_000_000,
    display: '~30 trillion cells in a human body',
    cite: 'Sender, Fuchs & Milo (2016) Annals of Human Biology 43, 101',
    note: 'An earlier widely cited estimate put the count at ~37 trillion (Bianconi et al. 2013).',
  },
  redBloodCellFraction: {
    value: 0.84,
    display: '~84% of cells by count are red blood cells',
    cite: 'Sender, Fuchs & Milo (2016) Annals of Human Biology 43, 101',
    note: 'Red blood cells have no nucleus — they carry no DNA.',
  },
  nucleatedCells: {
    value: 3_000_000_000_000,
    display: '~3 trillion nucleated cells',
    cite: 'Sender, Fuchs & Milo (2016) Annals of Human Biology 43, 101',
    note: 'Derived: ~16% of ~30 trillion cells retain a nucleus.',
  },
  totalDnaKm: {
    value: 6_000_000_000,
    display: '~6 billion km ≈ 3.7 billion miles of DNA',
    cite: 'Sender, Fuchs & Milo (2016) Annals of Human Biology 43, 101',
    note: 'Comparable to the average Earth–Pluto distance (~5.9 billion km); Pluto’s orbit is elliptical, ranging 4.4–7.4 billion km.',
  },
  codonsTotal: {
    value: 64,
    display: '64 codons (4³)',
    cite: 'Alberts et al., Molecular Biology of the Cell (6th ed.)',
  },
  codonsSense: {
    value: 61,
    display: '61 sense codons',
    cite: 'Alberts et al., Molecular Biology of the Cell (6th ed.)',
  },
  aminoAcids: {
    value: 20,
    display: '20 standard amino acids',
    cite: 'Alberts et al., Molecular Biology of the Cell (6th ed.)',
  },
  stopCodons: {
    value: 3,
    display: '3 stop codons',
    cite: 'Alberts et al., Molecular Biology of the Cell (6th ed.)',
  },
  codeErrorMinimization: {
    value: 1e-6,
    display: 'outperforms all but ~1 in 10⁶ random codes',
    cite: 'Freeland & Hurst (1998) J. Mol. Evol. 47, 238',
  },
  proteinLengthExample: {
    value: 150,
    display: '150 aa → 20¹⁵⁰ ≈ 10¹⁹⁵ possible sequences',
    cite: 'Alberts et al., Molecular Biology of the Cell (6th ed.)',
  },
  atomsInUniverse: {
    value: 1e80,
    display: '~10⁸⁰ atoms in the observable universe',
    cite: 'Alberts et al., Molecular Biology of the Cell (6th ed.)',
  },
  functionalFractionRange: {
    value: '1e-77 to 1e-10',
    display: '~1 in 10¹⁰ to ~1 in 10⁷⁷ of random sequences are functional',
    cite: 'Keefe & Szostak (2001) Nature 410, 715',
    note: 'Estimates vary enormously and are actively debated: Keefe & Szostak (2001) Nature 410, 715 found ~1 in 10¹⁰ for ATP-binding proteins from random libraries; Axe (2004) J. Mol. Biol. 341, 1295 extrapolated ~1 in 10⁷⁷ — a contested figure.',
    disputed: true,
  },
  chromosomeCombinationsPerParent: {
    value: 8_388_608,
    display: '2²³ ≈ 8.4 million combinations per parent',
    cite: 'Alberts et al., Molecular Biology of the Cell (6th ed.)',
  },
  possibleChildrenPerCouple: {
    value: 70_000_000_000_000,
    display: '~70 trillion possible children per couple (8.4M², before crossover)',
    cite: 'Alberts et al., Molecular Biology of the Cell (6th ed.)',
  },
  deNovoMutations: {
    value: '60–70',
    display: '~60–70 de novo mutations per person',
    cite: 'Kong et al. (2012) Nature 488, 471',
  },
  siblingSharedDna: {
    value: 0.5,
    display: 'siblings share ~50% of DNA on average, real range ~38–62%',
    cite: 'Visscher et al. (2006) PLoS Genetics 2, e41',
    note: 'Realized IBD sharing varies around the 50% mean.',
  },
  codingFraction: {
    value: 0.015,
    display: 'only ~1–2% of the genome codes for protein',
    cite: 'Lander et al. (2001) Nature 409, 860',
  },
  polygenicNote: {
    value: 'thousands of variants',
    display: 'height involves thousands of genetic variants',
    cite: 'Yengo et al. (2022) Nature 610, 704',
  },
} as const satisfies Record<string, Fact>;

export const SOURCES: string[] = [
  'Erlich, Y. & Zielinski, D. (2017) DNA Fountain enables a robust and efficient storage architecture. Science 355, 950',
  'Annunziato, A. (2008) DNA packaging: nucleosomes and chromatin. Nature Education 1, 26',
  'Alberts, B. et al., Molecular Biology of the Cell (6th ed., 2014) Garland Science',
  'Sender, R., Fuchs, S. & Milo, R. (2016) Revised estimates for the number of human and bacteria cells in the body. Annals of Human Biology 43, 101',
  'Bianconi, E. et al. (2013) An estimation of the number of cells in the human body. Annals of Human Biology 40, 463',
  'Freeland, S. J. & Hurst, L. D. (1998) The genetic code is one in a million. Journal of Molecular Evolution 47, 238',
  'Keefe, A. D. & Szostak, J. W. (2001) Functional proteins from a random-sequence library. Nature 410, 715',
  'Axe, D. D. (2004) Estimating the prevalence of protein sequences adopting functional enzyme folds. Journal of Molecular Biology 341, 1295',
  'Kong, A. et al. (2012) Rate of de novo mutations and the importance of father’s age to disease risk. Nature 488, 471',
  'Visscher, P. M. et al. (2006) Assumption-free estimation of heritability from genome-wide identity-by-descent sharing between full siblings. PLoS Genetics 2, e41',
  'Lander, E. S. et al. (2001) Initial sequencing and analysis of the human genome. Nature 409, 860',
  'Yengo, L. et al. (2022) A saturated map of common genetic variants associated with human height. Nature 610, 704',
];
