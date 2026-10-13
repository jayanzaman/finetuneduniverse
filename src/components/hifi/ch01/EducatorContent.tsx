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
          <span>
            Ω <span className="op">=</span> ρ <span className="op">/</span> ρ<sub>c</sub>
          </span>
        ),
        caption: 'Density parameter · Actual energy density relative to critical density',
      },
      {
        expression: (
          <span>
            d<em>s</em><sup>2</sup> <span className="op">=</span> −<em>c</em><sup>2</sup>d<em>t</em><sup>2</sup> <span className="op">+</span> <em>a</em>(<em>t</em>)<sup>2</sup> <span className="op">[</span> d<em>r</em><sup>2</sup><span className="op">/</span>(1 − <em>k</em> <em>r</em><sup>2</sup>) <span className="op">+</span> <em>r</em><sup>2</sup>dΩ<sup>2</sup> <span className="op">]</span>
          </span>
        ),
        caption: 'FLRW spacetime metric · Curvature parameter k (+1, 0, −1)',
      },
      {
        expression: (
          <span>
            <span style={{ color: '#38BDF8', fontWeight: 600 }}>Ω &gt; 1</span> (<em>k</em>=+1) ➔ <strong>S³</strong> &nbsp;|&nbsp;{' '}
            <span style={{ color: '#6FE4B1', fontWeight: 600 }}>Ω = 1</span> (<em>k</em>=0) ➔ <strong>ℝ³</strong> &nbsp;|&nbsp;{' '}
            <span style={{ color: '#C084FC', fontWeight: 600 }}>Ω &lt; 1</span> (<em>k</em>=−1) ➔ <strong>H³</strong>
          </span>
        ),
        caption: 'Spatial geometry: Closed 3-Sphere | Flat Euclidean | Hyperbolic Saddle',
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
    mathBlocks: [
      {
        expression: (
          <span>
            <span style={{ color: '#F59E0B', fontWeight: 600 }}>
              ρ<sub>m</sub>(<em>a</em>) ∝ <em>a</em><sup>−3</sup>
            </span>
            &nbsp;vs&nbsp;
            <span style={{ color: '#C084FC', fontWeight: 600 }}>
              ρ<sub>Λ</sub> <span className="op">=</span> const
            </span>
          </span>
        ),
        caption: 'The Non-Dilution Law · matter thins as 1/Volume (a⁻³), vacuum energy density never dilutes',
      },
      {
        expression: (
          <span>
            <span style={{ color: '#C084FC', fontWeight: 600 }}>Ω<sub>Λ</sub> ≈ 68.3%</span>
            <span style={{ color: '#888', margin: '0 6px' }}>+</span>
            <span style={{ color: '#F59E0B', fontWeight: 600 }}>Ω<sub>c</sub> ≈ 26.8%</span>
            <span style={{ color: '#888', margin: '0 6px' }}>+</span>
            <span style={{ color: '#38BDF8', fontWeight: 600 }}>Ω<sub>b</sub> ≈ 4.9%</span>
            <span className="op" style={{ margin: '0 6px' }}>=</span>
            <strong>100%</strong>
          </span>
        ),
        caption: "Today's cosmic energy budget (a = 1.0) · ~70% dark energy, ~27% cold dark matter, ~5% atoms",
      },
    ],
    sections: [
      {
        kind: 'lesson',
        label: 'What You See in the 3D Cosmic Cube',
        body: (
          <>
            Watch the cube as space stretches:
            <br /><br />
            • <strong>Golden Matter Particles (ρ<sub>m</sub> ∝ a<sup>−3</sup>)</strong>:
            Represent galaxies and cold dark matter clusters. Because the total mass remains fixed while the volume of space expands by a factor of <em>a<sup>3</sup></em>, the physical matter density steadily drops. The particles drift farther apart, growing increasingly sparse.
            <br /><br />
            • <strong>Purple Quantum Vacuum Matrix (ρ<sub>Λ</sub> = const)</strong>:
            Represents the intrinsic energy density of empty space (Einstein&apos;s cosmological constant Λ). Unlike matter or radiation, space does not &quot;stretch thin.&quot; As new volume is created by expansion, new vacuum energy is created with it at an invariant rate of ~6 × 10<sup>−10</sup> J/m³. Its density per cubic meter never dilutes.
          </>
        ),
      },
      {
        kind: 'lesson',
        label: 'The Dilution Curves Tab · ρ(a) & The Crossover Point',
        body: (
          <>
            Click the <strong>Dilution Curves</strong> tab at the top-left of the visual to inspect the logarithmic density history:
            <br /><br />
            • <strong>The Plunging Amber Curve</strong>:
            In the early cosmos (<em>a</em> &lt; 0.5), matter dominated the universe by more than 10 to 1. But its curve plunges steeply as 1/<em>a<sup>3</sup></em> over cosmic time.
            <br /><br />
            • <strong>The Flat Purple Line</strong>:
            Remains completely horizontal across all epochs. Because it never drops, it was inevitable that dark energy would eventually catch up.
            <br /><br />
            • <strong>The Crossover Point (a ≈ 0.75, ~9.8 billion years)</strong>:
            Where the two curves intersect. Around 4 billion years ago, vacuum energy surpassed matter density. At that exact pivot, the gravitational deceleration of the cosmos flipped into accelerated cosmic expansion.
          </>
        ),
      },
      {
        kind: 'lesson',
        label: 'The 70% Energy Budget Gauge',
        body: (
          <>
            The segmented bar above the canvas tracks our current epoch (<strong>Today · a = 1.0</strong>):
            <br /><br />
            • <strong>Dark Energy (Ω<sub>Λ</sub> ≈ 68.3% ~ 70%)</strong>: The dominant constituent of the universe today, driving galaxies apart at an ever-accelerating pace.
            <br />
            • <strong>Cold Dark Matter (Ω<sub>c</sub> ≈ 26.8%)</strong>: Invisible gravitational scaffolding that bound early gas into galaxy halos.
            <br />
            • <strong>Baryonic Atoms (Ω<sub>b</sub> ≈ 4.9%)</strong>: All stars, planets, nebulae, and living organisms comprise less than 5% of the cosmos.
            <br /><br />
            In the distant future (<em>a</em> &gt; 1.5), matter will dilute toward 0%, leaving dark energy to occupy &gt;99% of the cosmic budget.
          </>
        ),
      },
      {
        kind: 'lesson',
        label: 'How the Slider Alters Cosmic Fate',
        body: (
          <>
            Move the slider above to test alternate strengths of Λ:
            <br /><br />
            • <strong>Goldilocks Band [0.80 – 1.20 Λ]</strong>:
            Allows gravity to hold matter together long enough for first-generation stars, heavy-element nucleosynthesis, and planetary systems to form before dark energy acceleration takes over.
            <br />
            • <strong>High Λ (&gt; 1.20, &quot;Tears Apart&quot;)</strong>:
            Acceleration triggers prematurely during the first billion years. Spacetime expands faster than gravitational collapse can bind protogalaxies, preventing stars and galaxies from ever condensing.
            <br />
            • <strong>Low / Zero Λ (&lt; 0.80, &quot;Collapses&quot;)</strong>:
            Without enough positive vacuum repulsion, the mutual gravitational attraction of matter eventually arrests expansion and pulls the entire universe back into a scorching Big Crunch.
          </>
        ),
      },
      {
        kind: 'pullquote',
        label: 'The Cosmological Constant Problem',
        body: (
          <>
            When quantum field theorists calculate the zero-point energy of vacuum fields up to the Planck scale, they obtain an answer roughly <strong>10<sup>120</sup> times larger</strong> than the observed density of dark energy.
            <br /><br />
            If Λ had taken its naturally predicted quantum value, space would have blown apart in a fraction of a second, precluding any chemistry or life. Physicists consider this 120-order-of-magnitude discrepancy the most extreme fine-tuning problem in theoretical physics.
          </>
        ),
      },
    ],
  },

  temperature: {
    mathBlocks: [
      {
        expression: (
          <span>
            <span style={{ color: '#38BDF8', fontWeight: 600 }}>ΔT / T ≈ 10<sup>−5</sup></span>
            &nbsp;·&nbsp;
            <span style={{ color: '#F59E0B', fontWeight: 600 }}>T<sub>0</sub> <span className="op">=</span> 2.7255 K</span>
            &nbsp;(±18 μK)
          </span>
        ),
        caption: 'The Uniformity Fine-Tuning · temperatures match to 1 part in 100,000 across the entire sky',
      },
      {
        expression: (
          <span>
            θ<sub>horizon</sub> ≈ 1° &nbsp;➔&nbsp; <span style={{ color: '#C084FC', fontWeight: 600 }}>N<sub>patches</sub> ≈ 90 to 100</span>
          </span>
        ),
        caption: 'The Horizon Paradox · opposite sides of the sky were separated by ~90 disjoint causal horizon volumes',
      },
    ],
    sections: [
      {
        kind: 'lesson',
        label: 'What You See in the All-Sky Projection',
        body: (
          <>
            The visualization renders an interactive <strong>Mollweide projection</strong> of the Cosmic Microwave Background (CMB) — relic afterglow released when the universe cooled to ~3,000 K during recombination (380,000 years after the Big Bang, <em>z</em> ≈ 1100).
            <br /><br />
            • <strong>Mollweide 2D vs. 3D Globe</strong>: Use the top-left toggle to switch between the full elliptical all-sky projection and an interactive rotatable 3D celestial sphere.
            <br /><br />
            • <strong>Interactive Thermal Probe</strong>: Hover or drag anywhere across the celestial map to inspect local Galactic coordinates (<em>ℓ, b</em>), absolute temperature (down to microkelvins), and the 1° causal horizon reticle.
          </>
        ),
      },
      {
        kind: 'lesson',
        label: 'The 3 Contrast Lenses · From 2.7 K to Microkelvins',
        body: (
          <>
            Use the lens selector at the top to peel back observational scales:
            <br /><br />
            • <strong>Raw Glow (2.725 K)</strong>: What human eyes would see if tuned to microwave frequencies — a completely uniform, featureless blackbody bath, smooth to better than 99.9%.
            <br /><br />
            • <strong>Dipole Doppler (3.36 mK)</strong>: Reveals the Doppler shift caused by Earth and the Milky Way racing through the cosmos at 370 km/s toward constellation Leo / the Great Attractor. One half of the sky is blueshifted (warmer), and the opposite half is redshifted (cooler).
            <br /><br />
            • <strong>Microkelvin Fluctuation View (±18 μK)</strong>: Amplifies contrast by 100,000× with the dipole and galactic plane foregrounds subtracted. This exposes the primordial acoustic oscillations (hot compressions and cold rarefactions) mapped by the Planck satellite.
          </>
        ),
      },
      {
        kind: 'lesson',
        label: 'The Horizon Problem · Why Patches Shouldn\'t Agree',
        body: (
          <>
            Look at opposite edges of the Mollweide ellipse (separated by 180°). Today, they are separated by nearly 28 billion light-years.
            <br /><br />
            When the CMB was emitted 380,000 years after the Big Bang, light could only have traveled about <strong>1 degree across the sky</strong> (~900,000 light-years). This means the observable sky was divided into <strong>over 90 completely disconnected causal bubbles</strong> that had never exchanged a single photon or heat ray.
            <br /><br />
            In standard thermodynamics, two systems that cannot communicate cannot equalize their temperature. Why, then, are their temperatures identical to 1 part in 100,000?
          </>
        ),
      },
      {
        kind: 'lesson',
        label: 'How the Slider Alters the Cosmic Tapestry',
        body: (
          <>
            Move the slider above to explore varying degrees of thermal coordination:
            <br /><br />
            • <strong>Low Uniformity (&lt; 0.99998, &quot;Mottled&quot;)</strong>:
            Simulates a universe without Cosmic Inflation. Disjoint horizon patches fail to equilibrate, producing a chaotic patchwork of independent cells with temperature discrepancies of whole Kelvins (±0.5 K to ±1.5 K).
            <br /><br />
            • <strong>Goldilocks Band [0.99998 – 1.00000, &quot;Uniform&quot;]</strong>:
            All-sky thermal equilibrium is achieved, leaving behind only the exquisite ±18 μK quantum acoustic ripples. These subtle density ripples were essential: they acted as the gravitational seeds for galaxies, stars, and planets without causing the universe to collapse into primordial black holes.
            <br /><br />
            • <strong>Total Uniformity (1.00000)</strong>:
            Spacetime is completely isotropic with zero density perturbations. Without microkelvin fluctuations, gravity has no overdensities to collapse, leaving a sterile, homogeneous void forever.
          </>
        ),
      },
      {
        kind: 'pullquote',
        label: 'The Inflationary Fine-Tuning',
        body: (
          <>
            Cosmic inflation resolves the horizon paradox by positing that between 10<sup>−36</sup> s and 10<sup>−32</sup> s, a subatomic patch already in thermal contact was stretched exponentially by at least <em>e<sup>60</sup></em> (~10<sup>26</sup>×) to encompass our entire observable universe.
            <br /><br />
            Yet inflation introduces its own profound fine-tuning: the scalar inflaton potential <em>V(φ)</em> must be extraordinarily flat, requiring precision initial conditions to initiate inflation and terminate it without destroying structure.
          </>
        ),
      },
    ],
  },
};
