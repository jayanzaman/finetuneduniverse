'use client';

import type { ReactNode } from 'react';
import type { GoldilocksSliderProps } from './GoldilocksSlider';
import {
  PrimordialBubble,
  ProtonViz,
  FirstStarViz,
  GalaxyViz,
  GoldilocksViz,
  PrimordialEarthViz,
  EarthLimbViz,
} from './ChapterVisuals';

/**
 * Per-chapter narration, slider params, ghost copy, and the cinematic
 * visualization. Lifted from hifi-chapters-*.jsx.
 */
export type ChapterContent = {
  num: string;
  era: ReactNode;
  title: ReactNode;
  prose: ReactNode;
  sliderProps: GoldilocksSliderProps;
  ghost: { body: ReactNode };
  nextTitle?: ReactNode;
  nextLabel?: ReactNode;
  visualization: ReactNode;
};

export const CHAPTER_CONTENT: ChapterContent[] = [
  {
    num: '01',
    era: '13.8 Bya · t = 10⁻³² s',
    title: (
      <>
        The
        <br />
        Beginning<em>.</em>
      </>
    ),
    prose: (
      <>
        The first instant. The universe is almost — but not <em>quite</em> — perfectly
        smooth. One whisper of order in a hundred thousand parts of chaos. From that
        whisper: stars, galaxies, you. Without it: a featureless, eternal stillness,
        forever.
      </>
    ),
    sliderProps: {
      label: 'Initial entropy · S/k',
      value: '1.00',
      unit: 'optimal',
      position: 0.5,
      zone: [0.42, 0.58],
      leftCap: 'perfect order',
      rightCap: 'maximum chaos',
      failLeft: 'never moves',
      failRight: 'black holes only',
    },
    ghost: {
      body: 'An eternally still universe — frozen perfection. No stars ignite. No time, in any meaningful sense, passes.',
    },
    nextTitle: 'Quarks to Atoms',
    nextLabel: 't + 1 microsecond',
    visualization: <PrimordialBubble />,
  },
  {
    num: '02',
    era: 't + 1 microsecond · Tᵢ ≈ 10¹² K',
    title: (
      <>
        Quarks
        <br />
        to atoms<em>.</em>
      </>
    ),
    prose: (
      <>
        The plasma cools. Quarks find each other in threes and lock — protons and neutrons
        take their first shape. A tiny imbalance, <em>one part in a billion</em>, survives
        the great annihilation. That faint surplus is all the matter that will ever exist.
      </>
    ),
    sliderProps: {
      label: 'Quark binding force · gₛ',
      value: '1.000',
      unit: 'optimal',
      position: 0.5,
      zone: [0.46, 0.54],
      leftCap: 'too weak',
      rightCap: 'too strong',
      failLeft: 'no protons form',
      failRight: 'no light elements',
    },
    ghost: {
      body: 'Loosen the bond by 2% — quarks never bind. The universe is a fog of free particles, dark, structureless, forever.',
    },
    nextTitle: 'First Stars',
    nextLabel: '~ 200 million years later',
    visualization: <ProtonViz />,
  },
  {
    num: '03',
    era: '~ 200 Million years after the Big Bang',
    title: (
      <>
        First
        <br />
        light<em>.</em>
      </>
    ),
    prose: (
      <>
        For two hundred million years, the cosmos drifts dark and cool. Then a cloud of
        hydrogen, denser than the rest, falls inward under its own weight. Pressure
        climbs. At fifteen million kelvin, fusion ignites — and for the first time in the
        history of everything, there is <em>light</em>.
      </>
    ),
    sliderProps: {
      label: 'Stellar mass · M☉ (solar masses)',
      value: '1.0',
      unit: 'main sequence',
      position: 0.42,
      zone: [0.32, 0.58],
      leftCap: 'red dwarf',
      rightCap: 'supergiant',
      failLeft: 'no fusion',
      failRight: 'burns out in 10⁶ yr',
    },
    ghost: {
      body: 'Stars only half this mass — they fuse hydrogen, but never the heavy elements. No carbon. No water. No us, ever.',
    },
    nextTitle: 'Blackhole at the Heart',
    nextLabel: '~ 1 billion years later',
    visualization: <FirstStarViz />,
  },
  {
    num: '04',
    era: '~ 1 Billion years after the Big Bang',
    title: (
      <>
        A darkness
        <br />
        at the heart<em>.</em>
      </>
    ),
    prose: (
      <>
        Stars cluster. Dark matter coils invisibly around them. At every galactic center,
        a darkness <em>with the mass of millions of suns</em> sits and pulls. Around it,
        a hundred billion stars find a long, slow choreography — and you are born inside
        one of those orbits.
      </>
    ),
    sliderProps: {
      label: 'Central black hole mass · log₁₀ M☉',
      value: '6.61',
      unit: '4.1 × 10⁶ M☉',
      position: 0.48,
      zone: [0.4, 0.58],
      leftCap: 'too small',
      rightCap: 'too massive',
      failLeft: 'no disc forms',
      failRight: 'matter is consumed',
    },
    ghost: {
      body: 'A black hole twice this large — and the galaxy never settles into a disc. Stars are pulled apart faster than they form. No planetary orbits, ever.',
    },
    nextTitle: 'The Goldilocks Zone',
    nextLabel: '~ 9.2 billion years later',
    visualization: <GalaxyViz />,
  },
  {
    num: '05',
    era: '~ 9.2 Billion years after the Big Bang · 4.6 Bya',
    title: (
      <>
        A narrow
        <br />
        band of warm<em>.</em>
      </>
    ),
    prose: (
      <>
        A young star, a settling disc, a rocky world finds one band of orbit where water
        can be water. Move it inward by a tenth — the oceans boil. Move it outward by a
        tenth — they freeze forever. The band is <em>narrower than the orbit itself</em>.
      </>
    ),
    sliderProps: {
      label: 'Orbital distance · AU',
      value: '1.000',
      unit: '0.95 – 1.37 (habitable)',
      position: 0.5,
      zone: [0.42, 0.62],
      leftCap: 'too close',
      rightCap: 'too far',
      failLeft: 'oceans evaporate',
      failRight: 'snowball, forever',
    },
    ghost: {
      body: 'Push the orbit out by 10% — Earth ices over for good. Snowball planet, locked in white forever. No reset switch.',
    },
    nextTitle: 'Chemistry to Codes',
    nextLabel: '~ 3.8 billion years ago',
    visualization: <GoldilocksViz />,
  },
  {
    num: '06',
    era: '~ 3.8 Billion years ago · Hadean Earth',
    title: (
      <>
        From chemistry,
        <br />
        a code<em>.</em>
      </>
    ),
    prose: (
      <>
        On a young, lightning-lashed Earth, simple molecules collide and combine. Amino
        acids stitch into peptides. Membranes find themselves{' '}
        <em>containing themselves</em>. The planet runs this lottery for a hundred
        million years — and somewhere along the way, one ticket reads: <em>life</em>.
      </>
    ),
    sliderProps: {
      label: 'Atmospheric UV flux · W/m²',
      value: '13.5',
      unit: 'window: 8 – 28',
      position: 0.46,
      zone: [0.3, 0.65],
      leftCap: 'inert',
      rightCap: 'sterilizing',
      failLeft: 'no amino acids',
      failRight: 'DNA shredded',
    },
    ghost: {
      body: 'Halve the UV and the building blocks never assemble. Double it and every fragile molecule shreds before it can replicate.',
    },
    nextTitle: 'Geologic Time',
    nextLabel: '4.6 billion years — and a long becoming',
    visualization: <PrimordialEarthViz />,
  },
  {
    num: '07',
    era: '4.6 Billion years ago → today',
    title: (
      <>
        A planet,
        <br />
        remaking itself<em>.</em>
      </>
    ),
    prose: (
      <>
        Earth is not a place. It is a process. Hellfire to ice to oxygen to forests. Six
        readouts — temperature, oxygen, methane, CO₂, volcanism, impact rate — drift over
        four-and-a-half billion years. Each one had to <em>arrive</em> at where it is,
        in the right order, with the right timing.
      </>
    ),
    sliderProps: {
      label: 'Atmospheric oxygen · Great Oxygenation timing',
      value: '2.4 Gya',
      unit: 'optimal arrival',
      position: 0.52,
      zone: [0.4, 0.65],
      leftCap: 'too early',
      rightCap: 'too late',
      failLeft: 'cyanobacteria poisoned',
      failRight: 'no complex life',
    },
    ghost: {
      body: 'Oxygen arrived neither too fast nor too slow. A billion years off and complex life never gets its window — Earth stays a microbial planet forever.',
    },
    nextTitle: undefined,
    nextLabel: undefined,
    visualization: <EarthLimbViz />,
  },
];
