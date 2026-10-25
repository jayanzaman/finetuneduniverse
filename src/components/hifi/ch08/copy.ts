export type StatCopy = { value: string; label: string; cite: string };

export type SubPanel = {
  id: string;
  title: string;
  body: string[];
  stat?: StatCopy;
  honestyNote?: string;
};

export type StepCopy = {
  id: string;
  kicker: string;
  title: string;
  body: string[];
  stat?: StatCopy;
  honestyNote?: string;
  subPanels?: SubPanel[];
};

export const CH08_PROSE =
  'Every chapter so far asked how the universe got its numbers. This one asks where *yours* came from. Inside almost every cell you own sits a four-letter script, copied three billion letters deep, that has been under continuous revision for four billion years.';

export const GHOST_COPY =
  'There is no wrong setting here. Whatever length you choose, the library it writes is already astronomical — this dial only changes how many zeros we need to say so. Take your time; the numbers will wait.';

export const STEPS: StepCopy[] = [
  {
    id: 'hook',
    kicker: 'Chapter 08 · The Code Within',
    title: 'The best data center isn’t in a data center',
    body: [
      'Somewhere in Oregon, a server farm the size of a football field hums day and night just to store a slice of the world’s photos. It drinks a small river for cooling and a small town’s worth of electricity.',
      'Now consider the nucleus of a single one of your cells — a speck too small to see — running a storage density of *215 petabytes per gram*. Cram all of humanity’s data into DNA and it would fit in a shoebox, with room left over for shoes.',
      'If you think that’s cool, you’re wrong — it’s *really* cool. Slide the comparator and watch the server farm shrink.',
    ],
    stat: {
      value: '215 PB/g',
      label: 'storage density of DNA — every byte humanity has ever made would fit in a shoebox',
      cite: 'Erlich & Zielinski (2017) Science 355, 950',
    },
  },
  {
    id: 'six-feet',
    kicker: 'Packing problem',
    title: 'Six feet of instructions in every nucleus',
    body: [
      'Unspool the DNA from one cell and it stretches about *two metres* — roughly your own height — written in *6.2 billion* base pairs.',
      'That thread lives folded inside a nucleus about *6 micrometres* across. Scale it up and it’s like packing *40 km of thread into a tennis ball* — and your cells can find any sentence in it, on demand, without tangling.',
      'And the packing is the point: the fold decides which genes are even reachable.',
    ],
    stat: {
      value: '~2 m',
      label: 'of DNA packed into a ~6 µm nucleus in each cell',
      cite: 'Annunziato (2008) Nature Education 1, 26',
    },
    honestyNote: 'The tennis-ball line is an analogy, not a measurement — the real proportions scale out to roughly 40 km of thread.',
  },
  {
    id: 'to-pluto',
    kicker: 'Adding you up',
    title: 'From here to Pluto, made of you',
    body: [
      'Your body runs on about *30 trillion cells*. But most of them sit this story out: roughly *84%* are red blood cells, which threw away their nucleus — and their DNA — to make more room for oxygen.',
      'That leaves about *3 trillion* nucleated cells, each holding its own two-metre thread. Lay all of it end to end and you get *6 billion kilometres* — about *3.7 billion miles*.',
      'That is the average distance from Earth to *Pluto*. The cosmic scale from the earlier chapters never left you; it’s coiled inside you. Feed the odometer and watch your own genome leave the solar system.',
    ],
    stat: {
      value: '~6 billion km',
      label: 'of DNA in your body — about the average Earth–Pluto distance',
      cite: 'Sender, Fuchs & Milo (2016) Annals of Human Biology 43, 101',
    },
    honestyNote: 'Pluto’s orbit is elliptical (4.4–7.4 billion km from the Sun), so “the distance to Pluto” is an average, not a fixed number.',
  },
  {
    id: 'sixty-four-words',
    kicker: 'The dictionary',
    title: 'Four letters, sixty-four words',
    body: [
      'The whole script is written in four letters: *A, T, G, C*. Read three at a time and you get 4³ = *64* possible words — codons.',
      '*61* of them spell the *20* amino acids that build every protein you own. The other *3* are full stops: end of sentence, protein complete.',
      'The dictionary is redundant on purpose — most amino acids get several spellings, so a typo often changes nothing. Spin the codon wheel, then type your name and watch it turn into a protein fragment.',
    ],
    stat: {
      value: '64 / 61 / 20 / 3',
      label: 'codons / sense codons / amino acids / stops',
      cite: 'Alberts et al., Molecular Biology of the Cell (6th ed.)',
    },
  },
  {
    id: 'probability',
    kicker: 'Running the odds',
    title: 'Three improbabilities, one genome',
    body: [
      'Here is where the numbers start to feel rigged. Three panels, three very different kinds of odds — and one honest caveat in the middle.',
    ],
    subPanels: [
      {
        id: 'a',
        title: 'A code that absorbs its own typos',
        body: [
          'Mutations happen. But the genetic code is arranged so that the most common copying errors tend to swap in a chemically *similar* amino acid — or nothing at all.',
          'Freeland and Hurst shuffled the code a million ways and found the standard one damps mutation damage better than all but about *1 in a million* random alternatives. Shuffle it yourself and see how much worse most versions do.',
        ],
        stat: {
          value: '~1 in 10⁶',
          label: 'random codes outperform the standard code at minimizing mutation damage',
          cite: 'Freeland & Hurst (1998) J. Mol. Evol. 47, 238',
        },
      },
      {
        id: 'b',
        title: 'A library bigger than the universe',
        body: [
          'Take a modest protein, *150 amino acids* long. The number of possible sequences is 20¹⁵⁰ — about *10¹⁹⁵*.',
          'There are only about *10⁸⁰ atoms* in the observable universe. The library of possible proteins dwarfs the library of possible matter by a factor with triple-digit zeros.',
        ],
        stat: {
          value: '20¹⁵⁰ ≈ 10¹⁹⁵',
          label: 'possible 150-aa sequences vs ~10⁸⁰ atoms in the observable universe',
          cite: 'Alberts et al., Molecular Biology of the Cell (6th ed.)',
        },
        honestyNote:
          'Honesty note: estimates of what fraction of random sequences do anything useful range from ~1 in 10¹⁰ (Keefe & Szostak 2001, ATP-binding proteins) to ~1 in 10⁷⁷ (Axe 2004, a contested extrapolation). The range spans 67 orders of magnitude and is actively debated — we present it, we don’t pick a side.',
      },
      {
        id: 'c',
        title: 'The odds of you',
        body: [
          'Each parent shuffles 23 chromosome pairs into *2²³ ≈ 8.4 million* possible decks. One couple can therefore make about *70 trillion* genetically distinct children — before crossover shuffles the cards *within* each chromosome and makes the number astronomical.',
          'Then life adds a signature: roughly *60–70 brand-new mutations* appear in you that exist in neither parent.',
          'Even full siblings don’t split the deck evenly: they share *~50%* of their DNA on average, but the real draw lands anywhere from about *38% to 62%*. Roll the sibling dice.',
        ],
        stat: {
          value: '~70 trillion',
          label: 'possible children per couple, before crossover even enters the game',
          cite: 'Alberts et al., Molecular Biology of the Cell (6th ed.)',
        },
      },
    ],
  },
  {
    id: 'twenty-blocks',
    kicker: 'What the words build',
    title: 'Twenty building blocks, one you',
    body: [
      'From those 20 amino acids your cells fold *collagen* for your skin, *hemoglobin* to haul oxygen, *opsins* that catch photons so you can read this sentence, *keratin* for hair, and *ion channels* firing the thought about it.',
      'Two guardrails before the awe runs away with us. First: only *~1–2%* of the genome codes for protein at all. The rest is regulatory switches, RNA genes, and structural DNA deciding *when, where, and how much* — the recipe matters less than the timing.',
      'Second: traits like height, eye colour, and skin colour are *polygenic* — shaped by hundreds to thousands of variants (height alone involves thousands) and by environment. They are never single-gene outcomes, and no one letter spells a person.',
    ],
    stat: {
      value: '~1–2%',
      label: 'of the genome codes for protein; the rest conducts the orchestra',
      cite: 'Lander et al. (2001) Nature 409, 860',
    },
  },
  {
    id: 'open-question',
    kicker: 'Following the chain back',
    title: 'The open question',
    body: [
      'Follow the chain back far enough — cell to code, code to chemistry, chemistry to constants — and a strange thought surfaces: the sentience inside your skull may run on this same four-letter script.',
      'We won’t claim more than that. It is an open question, and it deserves to stay open a while longer.',
      'But here is the loop the whole site has been tracing: the universe tuned its constants to make chemistry possible — and chemistry tuned a code to make *you*.',
    ],
  },
];
