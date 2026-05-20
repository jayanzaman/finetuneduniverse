'use client';

import type { ReactNode } from 'react';
import type { ParamKey } from './params';

export type EducatorSection = {
  kind: 'lesson' | 'pullquote';
  label: string;
  body: ReactNode;
};

export type EducatorPanel = {
  mathBlocks?: Array<{ expression: ReactNode; caption: string }>;
  sections: EducatorSection[];
};

export const EDUCATOR_CONTENT: Record<ParamKey, EducatorPanel> = {
  entropy: {
    mathBlocks: [
      {
        expression: (
          <>
            P<sub>order</sub> <span className="op">=</span> 1 / 10<sup>10<sup>123</sup></sup>
          </>
        ),
        caption: 'Penrose · probability of our low-entropy start',
      },
    ],
    sections: [
      {
        kind: 'pullquote',
        label: "Penrose's number",
        body: (
          <>
            The odds of our universe starting this orderly:{' '}
            <em>
              1 in 10<sup>10<sup>123</sup></sup>
            </em>
            . Writing that number out would take more digits than there are particles in the
            observable universe.
          </>
        ),
      },
      {
        kind: 'lesson',
        label: 'What you see',
        body: (
          <>
            Particles condensed onto a ring represent <em>low entropy</em> — every degree of freedom
            tightly constrained. Scattered randomly across the field they represent high entropy:
            no usable gradient, no time-arrow, no structure.
          </>
        ),
      },
      {
        kind: 'lesson',
        label: 'Why it matters',
        body: (
          <>
            Without an exquisitely low-entropy start, gravity has nothing to work against. Stars,
            galaxies, life — every structure we know — depends on the universe beginning in a
            shockingly improbable, highly ordered configuration.
          </>
        ),
      },
    ],
  },

  expansion: {
    mathBlocks: [
      {
        expression: (
          <>
            <em>v</em> <span className="op">=</span> H<sub>0</sub> <em>· d</em>
          </>
        ),
        caption: "Hubble's law · recession velocity = H₀ × distance",
      },
    ],
    sections: [
      {
        kind: 'lesson',
        label: 'The analogy',
        body: (
          <>
            Imagine a loaf of <em>raisin bread</em> rising in the oven. The dough is space; the
            raisins are galaxies. As the dough expands, every raisin drifts away from every other —
            and the farther apart two start, the faster they separate.
          </>
        ),
      },
      {
        kind: 'pullquote',
        label: 'The open problem · Hubble tension',
        body: (
          <>
            Distance-ladder measurements give H₀ ≈ <strong>73 km/s/Mpc</strong>. The CMB gives{' '}
            <strong>67 km/s/Mpc</strong>. The <em>10% gap</em> is one of cosmology&apos;s deepest
            live mysteries.
          </>
        ),
      },
      {
        kind: 'lesson',
        label: 'How we measure it',
        body: (
          <>
            Galaxies redshift as they recede: z = Δλ / λ₀. Calibrate distance with standard candles
            — Cepheid variables, Type Ia supernovae. Plot recession velocity against distance. The
            slope of that line <em>is</em> H₀.
          </>
        ),
      },
      {
        kind: 'lesson',
        label: '"Constant" is a misnomer',
        body: (
          <>
            H₀ is the <em>current</em> expansion rate. The full Hubble parameter H(t) changes over
            cosmic time — gravity slows it, then dark energy speeds it back up. We live during the
            acceleration era.
          </>
        ),
      },
    ],
  },

  fluctuations: {
    sections: [
      {
        kind: 'lesson',
        label: 'What you see',
        body: (
          <>
            CMB-style hot and cold patches. Quantum ripples — tiny density variations born from
            vacuum fluctuations during inflation — seeded every star, every galaxy, every cluster.
          </>
        ),
      },
      {
        kind: 'pullquote',
        label: 'Goldilocks precision',
        body: (
          <>
            Too small — gravity never overcomes expansion. Too large — overdensities collapse into
            black holes before stars can form. The viable band: roughly{' '}
            <em>
              10<sup>−5</sup> to 10<sup>−4</sup>
            </em>{' '}
            in δρ/ρ.
          </>
        ),
      },
      {
        kind: 'lesson',
        label: 'Why it matters',
        body: (
          <>
            Without these quantum seeds the universe would remain perfectly uniform forever — no
            structure, no chemistry, no observers. Gravity needs something to grab onto.
          </>
        ),
      },
    ],
  },

  shape: {
    mathBlocks: [
      {
        expression: (
          <>
            Ω <span className="op">=</span> ρ / ρ<sub>c</sub>
          </>
        ),
        caption: 'Ratio of actual density to the critical density',
      },
      {
        expression: (
          <>
            ρ<sub>c</sub> <span className="op">=</span> 3<em>H</em>
            <sup>2</sup> <span className="op">/</span> 8π<em>G</em>
          </>
        ),
        caption: 'Friedmann · the critical density',
      },
    ],
    sections: [
      {
        kind: 'lesson',
        label: 'Three possible worlds',
        body: (
          <>
            <strong>Spherical (Ω &gt; 1)</strong>: like a ball&apos;s surface — triangles sum to{' '}
            <em>more</em> than 180°. <strong>Flat (Ω = 1)</strong>: Euclidean — exactly 180°.{' '}
            <strong>Saddle (Ω &lt; 1)</strong>: hyperbolic — less than 180°.
          </>
        ),
      },
      {
        kind: 'pullquote',
        label: 'Astonishingly flat',
        body: (
          <>
            Best measurements: Ω<sub>total</sub> ≈ <strong>1.00009 ± 0.0005</strong>. Within a
            millionth of perfectly flat. Inflation is the candidate answer — but it carries its
            own tuning problem.
          </>
        ),
      },
    ],
  },

  darkEnergy: {
    sections: [
      {
        kind: 'lesson',
        label: 'What it is',
        body: (
          <>
            A small, positive energy density of space itself — Λ in Einstein&apos;s equations.
            Roughly 70% of the universe&apos;s current energy budget. It does not dilute as space
            expands.
          </>
        ),
      },
      {
        kind: 'pullquote',
        label: 'The cosmological constant problem',
        body: (
          <>
            Quantum field theory predicts a vacuum energy <em>10<sup>120</sup></em> times larger
            than the observed value. The largest disagreement between theory and observation in all
            of physics.
          </>
        ),
      },
      {
        kind: 'lesson',
        label: 'Why it matters',
        body: (
          <>
            Too strong and structure can never form — galaxies are torn apart before they
            coalesce. Too weak and expansion never accelerates. Our Λ sits in a narrow band that
            permits both stars and observers.
          </>
        ),
      },
    ],
  },

  temperature: {
    sections: [
      {
        kind: 'lesson',
        label: 'What it is',
        body: (
          <>
            The cosmic microwave background — a uniform <em>2.7250 K</em> glow filling the sky,
            relic light from when the universe became transparent. Uniform to roughly{' '}
            <em>1 part in 100,000</em>.
          </>
        ),
      },
      {
        kind: 'pullquote',
        label: 'The horizon problem',
        body: (
          <>
            Regions of sky that could never have communicated — beyond each other&apos;s causal
            horizons — show identical temperatures. How did they &quot;know&quot; to agree?
          </>
        ),
      },
      {
        kind: 'lesson',
        label: 'Inflation, possibly',
        body: (
          <>
            Cosmic inflation suggests the entire observable universe was once in close causal
            contact, then expanded exponentially. It solves the horizon problem — at the cost of
            requiring its own finely-tuned initial conditions.
          </>
        ),
      },
    ],
  },
};
