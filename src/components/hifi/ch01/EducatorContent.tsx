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
        caption: 'Density parameter: actual energy density relative to critical density',
      },
      {
        expression: (
          <>
            d<em>s</em><sup>2</sup> <span className="op">=</span> −<em>c</em><sup>2</sup>d<em>t</em><sup>2</sup> <span className="op">+</span> <em>a</em>(<em>t</em>)<sup>2</sup> <span className="op">[</span> d<em>r</em><sup>2</sup>/(1 − <em>k</em> <em>r</em><sup>2</sup>) <span className="op">+</span> <em>r</em><sup>2</sup>dΩ<sup>2</sup> <span className="op">]</span>
          </>
        ),
        caption: 'FLRW metric · Curvature parameter k (+1, 0, −1)',
      },
      {
        expression: (
          <>
            Ω &gt; 1 (<em>k</em>=+1) ➔ <strong>S³</strong> &nbsp;|&nbsp; Ω = 1 (<em>k</em>=0) ➔ <strong>ℝ³</strong> &nbsp;|&nbsp; Ω &lt; 1 (<em>k</em>=−1) ➔ <strong>H³</strong>
          </>
        ),
        caption: 'The three geometries of spacetime',
      },
    ],
    sections: [
      {
        kind: 'lesson',
        label: 'Why a 2D Sphere & Saddle Represent 3D Space',
        body: (
          <>
            We live inside 3D space, so we cannot step &quot;outside&quot; into a 4th dimension to view a 3-sphere
            or hyperbolic 3-space directly. Instead, cosmologists visualize cosmic geometry by taking a <strong>2D cross-section</strong>:
            <br /><br />
            • <strong>Positive Curvature (Ω &gt; 1, k = +1) ➔ 3-Sphere (S³)</strong>: Its 2D slice is the surface of a <strong>sphere (S²)</strong>.
            Space is closed and finite in volume (2π²R³), yet has no edge or center. Parallel lines converge, and triangles bulge outward.
            <br />
            • <strong>Zero Curvature (Ω = 1, k = 0) ➔ Flat Euclidean (ℝ³)</strong>: Its 2D slice is a <strong>flat sheet (ℝ²)</strong>.
            The Pythagorean theorem holds everywhere, and parallel lines stay equidistant forever.
            <br />
            • <strong>Negative Curvature (Ω &lt; 1, k = −1) ➔ Hyperbolic Space (H³)</strong>: Its 2D slice is a <strong>saddle surface (H²)</strong>.
            Space flares outward in opposite directions at every point. Parallel light rays diverge exponentially, and triangles pinch inward.
          </>
        ),
      },
      {
        kind: 'lesson',
        label: 'Curvature Tests: Triangles & Light Rays',
        body: (
          <>
            How can an observer inside the universe determine its shape?
            <br /><br />
            1. <strong>Geodesic Triangles</strong>: Form a giant triangle between Earth and two points on the Cosmic Microwave Background.
            On a 3-sphere (S³), great circles curve outward, so interior angles sum to <em>more than 180°</em>.
            In flat space (ℝ³), angles sum to <em>exactly 180°</em>.
            In hyperbolic space (H³), angles pinch inward, summing to <em>less than 180°</em>.
            <br /><br />
            2. <strong>Parallel Light Beams</strong>: Two parallel laser beams fired across cosmic voids will <em>converge</em> in a closed 3-sphere,
            <em>remain parallel</em> in flat space, and <em>diverge exponentially</em> in hyperbolic space.
          </>
        ),
      },
      {
        kind: 'pullquote',
        label: 'The Flatness Fine-Tuning Problem',
        body: (
          <>
            Satellite measurements (WMAP, Planck) find Ω<sub>total</sub> ≈ <strong>1.0007 ± 0.0019</strong> — within a fraction of a percent of exact flatness.
            In general relativity, any tiny deviation from Ω = 1 amplifies exponentially over cosmic time.
            For Ω to remain flat today after 13.8 billion years, it had to equal <strong>1.0000000000000000... to 60 decimal places</strong> at the Planck epoch.
            Cosmic inflation explains how space stretched flat, but why did inflation begin with the necessary conditions?
          </>
        ),
      },
      {
        kind: 'lesson',
        label: 'Open vs. Closed: The Ultimate Fate',
        body: (
          <>
            Curvature is deeply intertwined with destiny:
            A closed 3-sphere (S³) has finite total volume — if you flew in a straight rocket trajectory forever, you would eventually return to your starting point.
            Without dark energy, a closed universe recollapses in a fiery Big Crunch.
            Flat (ℝ³) and hyperbolic (H³) universes are unbounded, infinite in volume, and expand forever into eternal cosmic freeze.
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
