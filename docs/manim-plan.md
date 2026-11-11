# REVISED MANIM PLAN FOR FINETUNEDUNIVERSE.NET

This replaces the earlier 13-item Manim plan. Work through the stages and stop wherever it says STOP.

## GROUND RULES

1. Manim Community Edition, exact version pinned in manim/requirements.txt (stable
   docs currently show 0.22.1). MathTex needs a separately installed TeX distribution
   (TinyTeX, MacTeX or TeX Live); Manim ships none. Confirm with: manim checkhealth
2. Manim makes fixed video only. Do not rebuild sliders or scrubbing; the site's
   interactives keep those. End each clip on a frame matching the start state of the
   interactive beside it.
3. Beats: one idea each, under 10 seconds, separated by self.next_section("name").
   Render with --save_sections so each beat is its own clip for one scroll step.
   No narration; clips autoplay muted, so on-page text carries the explanation.
4. Closing frame: every scene ends on the same layout: a number line, a shaded
   allowed band, a marker labelled "our universe". Solid wall = firm limit.
   Dashed wall = contested or model-dependent limit.
5. Assumption line: every scene shows one line of small text, given below as ASSUME.
   Keep its wording.
6. Numbers: everything on screen comes from manim/ftu/constants.py, built from the
   NUMBERS section. Do not change or "fix" any number. If one looks wrong, tell me.
7. Text below is ASCII. On screen, typeset Lambda, eta, sigma, mu, +/- and powers
   of ten properly.
8. Equation morphs: TransformMatchingTex with parts isolated by {{ }} or
   substrings_to_isolate. Live numbers: ValueTracker + DecimalNumber. Never
   re-typeset MathTex per frame.
9. Compositing: render opaque on the site's background colour. No alpha video unless
   I ask (-t alone writes .mov, which browsers will not play).
10. Phone: every scene also renders in 4:5 portrait. Lay out relative to
    config.frame_width and config.frame_height, never fixed coordinates. Text must
    stay readable at 390 px wide.
11. Where a beat needs data you do not have, draw it schematic and keep only the
    stated numbers exact. Never invent a data value.

## STAGE 0 - RECON (read only, change nothing)

Report briefly:
a. Framework, where chapter content lives, how mathBlock entries are defined.
b. The six parameters the Goldilocks slider exposes.
c. Whether GalacticHabitableZoneVisual shows the zone around a star or the zone
   within the galaxy.
d. What Chapters 4, 6 and 7 say (a paragraph each) and whether candidate scenes
   4.1, 6.1, 7.1 fit, contradict or repeat them.
e. What Chapter 8 concludes from 20^150.
f. Whether the starfield is a WebGL canvas or a CSS layer; the site's background
   colour and fonts.
g. Whether KaTeX or MathJax is already a dependency.
STOP and show me the report.

## STAGE 1 - TOOLCHAIN AND STYLE MODULE

Create:
- manim/requirements.txt
- manim/ftu/constants.py: every NUMBERS entry, each with its basis as a comment.
- manim/ftu/style.py: palette and fonts from 0f; class FTUScene(Scene) that sets the
  background; assumption_line(text); closing_frame(axis_min, axis_max, band, walls,
  marker, log=False) where walls is a list of (x, "solid" or "dashed", label).
  Reads an environment variable to switch landscape or portrait.
- manim/scenes/ch1.py ... ch8.py and ub.py: one class per scene, e.g. S1_2_Dilution.
- manim/render.sh: renders one scene or all, landscape 1920x1080 and portrait
  1080x1350, 30 fps, with --save_sections, plus a poster PNG of the last frame (-s).
  Copies clips to public/math/<scene_id>/ and writes public/math/manifest.json
  (scene, beats, files, durations).
  Portrait is set in the script because frame size has no CLI flag:
      config.pixel_width, config.pixel_height = 1080, 1350
      config.frame_height = 8.0
      config.frame_width = 8.0 * 1080 / 1350
- One web component, MathClip(sceneId, beat): muted, playsInline, preload="none",
  poster set; plays when scrolled into view and pauses when out; shows only the
  poster under prefers-reduced-motion; picks portrait or landscape by viewport;
  renders the scene's equation as live text beside the clip.

## STAGE 2 - PILOTS

Build 1.2 and 8.3 end to end: scene code, both aspect ratios, clips in public/math,
wired into the page.
STOP. I check both on a phone before anything else is built.

## STAGE 3 - THE REST, one commit per scene, in this order:

1.1, 1.3, 1.4, 1.5, 1.6 / 8.1, 8.2, 8.4 / 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4 /
5.1, U.1 / then 4.1, 6.1, 7.1 only if 0d says they fit.

## SCENES

Each entry: POINT, TEX, beats B1..., CLOSE (closing frame), ASSUME.

### 1.1 Hubble's law and the tension
POINT: the two H0 values are separate measurements whose error bars do not touch.
TEX: v = H_0\,d
TEX: 1 + z = \frac{\lambda_{\mathrm{obs}}}{\lambda_{\mathrm{emit}}} = \frac{1}{a}
B1 Galaxies appear as points on a velocity-distance plot (schematic). A line fits
   and its slope becomes H_0.
B2 A spectral line slides redward while z tracks it. 1 + z = 1/a hands off to the
   scale factor.
B3 The plot collapses to one H0 axis. Two error-bar curves grow on it:
   67.4 +/- 0.5 and 73.50 +/- 0.81 km/s/Mpc.
CLOSE: H0 axis, both curves, the gap labelled "more than 6 sigma". Never draw one
   line splitting into two slopes.
ASSUME: "67.4 is what LambdaCDM predicts for today when fitted to the CMB. 73.50 is
   measured with the local distance ladder."

### 1.2 Dilution laws (PILOT)
POINT: matter thins as space grows, dark energy does not; acceleration onset and
   density crossover are two different moments.
TEX: \rho_r \propto a^{-4} \qquad \rho_m \propto a^{-3} \qquad \rho_\Lambda = \mathrm{const}
TEX: \frac{\ddot a}{a} = -\frac{4\pi G}{3}\left(\rho_m - 2\rho_\Lambda\right)
B1 A cube of space grows: side x2, volume x8, particle count fixed.
B2 Light in the same cube also stretches: one more power of a. The cosmological
   constant does not dilute.
B3 Log-log axes appear. Each exponent leaves its equation and becomes the slope of
   its line: -4, -3 and 0.
B4 Two markers drop onto the a axis: acceleration begins at a = 0.61 (matter equals
   twice dark energy); the two densities cross later, at a = 0.77.
CLOSE: a axis from 0.1 to 1, both markers, accelerating era shaded, today at a = 1.
ASSUME: "Flat LambdaCDM with Planck 2018 values. DESI's three-year data hint that
   dark energy weakens with time."

### 1.3 Friedmann equation
POINT: the three lines from 1.2 are the terms of one equation.
TEX: \frac{H^2}{H_0^2} = \Omega_r a^{-4} + \Omega_m a^{-3} + \Omega_k a^{-2} + \Omega_\Lambda
B1 The lines from 1.2 lift off the plot and settle into the equation as its terms.
   Curvature joins as a^-2.
B2 A stacked band shows each term's share of H^2 as a runs from 1e-4 to 1:
   radiation leads, then matter, then Lambda.
B3 Lambda is raised x10, then x100. Its band takes over earlier each time, leaving
   matter less time to clump.
CLOSE: dark-energy density axis in units of the observed value; our universe at 1;
   dashed wall near 200.
ASSUME: "The 200x limit holds the fluctuation amplitude Q at 1e-5. If Q can also
   vary, the limit loosens to about 1e11."

### 1.4 Flatness (new)
POINT: any early offset from flat grows, so the starting value sat extremely close to 1.
TEX: \Omega - 1 = \frac{k}{a^2 H^2}
B1 Divide the Friedmann equation by H^2. The curvature term becomes Omega - 1.
B2 a^2 H^2 shrinks as the universe expands. The offset grows as a^2 under radiation
   and as a under matter.
B3 Run the film backwards from today to the Planck time. The offset shrinks by
   sixty powers of ten.
CLOSE: Omega axis centred on 1 with a zoom counter; the allowed band stays invisible
   until the zoom reaches 1e-60.
ASSUME: "Standard expansion with no inflation. Inflation is the usual explanation
   for this starting value."

### 1.5 The cosmological constant problem
POINT: the size of the mismatch depends on where the sum stops.
TEX: \rho_{\mathrm{vac}} = \int^{k_{\max}} \frac{d^3k}{(2\pi)^3}\,\frac{\hbar\,\omega_k}{2} \;\propto\; k_{\max}^4
B1 Zero-point energies add up mode by mode. The total grows as the fourth power of
   the cutoff.
B2 Known physics is added in order of energy while a counter tracks the overshoot:
   about 1e45 from QCD, 1e55 from electroweak physics, 1e123 with a Planck cutoff.
B3 Two 123-digit numbers (illustrative digits), one above the other, subtract.
   Digits cancel from the left until one is left.
CLOSE: the 1.3 frame zooms out to a 123-decade axis in Planck units: ours at 1e-123,
   the structure wall two decades above it, the Planck-scale value at 1.
ASSUME: "A sharp cutoff at the scale shown. The size of the mismatch depends on the
   cutoff."

### 1.6 Penrose's number
POINT: the exponent 1e123 is an entropy, and the scene derives it.
TEX: S = k_B \ln W \qquad S_{\mathrm{BH}} = \frac{4\pi G M^2 k_B}{\hbar c}
B1 Boltzmann: entropy counts microstates on a log scale.
B2 Bekenstein-Hawking: the mass of 1e80 baryons gives S of about 1e123 k.
B3 The largest region of phase space has a volume near 10^(10^123). The early
   universe occupied one part in that number.
B4 Try to write the number out: it needs 1e123 zeros, and the observable universe
   holds 1e80 baryons to write them on.
B5 Bridge to 1.5: this 1e123 and that 1e-123 are the same quantity, the cosmic
   horizon measured in Planck units.
CLOSE: entropy axis in powers of ten; black-hole maximum at 1e123; the early
   universe far to its left.
ASSUME: "Penrose's estimate: the maximum is one black hole holding the observable
   universe's 1e80 baryons."
Never stack 1e80, 1e123 and 10^(10^123) as three sizes. 1e123 is the exponent.

### 2.1 The matter excess (new)
POINT: everything visible is the remainder after annihilation: one baryon per
   1.6 billion photons.
TEX: \eta = \frac{n_b}{n_\gamma} \approx 6 \times 10^{-10}
B1 Matter and antimatter counters start nearly equal and fall together as pairs
   annihilate into photons.
B2 The antimatter counter reaches zero. The matter counter stops at a small remainder.
B3 The photon count and the remainder sit side by side: 1.6 billion to one.
CLOSE: eta axis (log), ours at 6e-10, a wide band up to a dashed wall near 1e-6.
ASSUME: "eta is measured, not explained. One review finds universes viable up to
   about 1e-6."

### 2.2 Neutron-proton ratio to helium (new)
POINT: one mass difference sets how many neutrons survive, and the neutrons set the helium.
TEX: \frac{n}{p} = e^{-\Delta m / kT} \qquad Y_p \approx \frac{2\,(n/p)}{1 + n/p}
B1 Above 1 MeV neutrons and protons interconvert. Their ratio follows the Boltzmann
   factor with Delta m = 1.293 MeV.
B2 Near 0.7 MeV the weak interactions fall behind the expansion. The ratio freezes
   near 0.15.
B3 Free neutrons decay while nucleosynthesis waits (scene 2.3). The ratio slips to
   about 1/7.
B4 Nearly every surviving neutron ends in helium-4. With two neutrons in every 16
   nucleons, four of the 16 end up as helium: a quarter of the mass.
CLOSE: helium mass-fraction axis 0 to 1, ours at 0.25 inside a wide band.
ASSUME: "Simple estimate; the full calculation gives 0.24. One review finds hydrogen
   survives across most of parameter space."

### 2.3 The deuterium bottleneck (Big Bang nucleosynthesis, not stars)
POINT: nucleosynthesis waits until 0.07 MeV, thirty times below deuterium's binding
   energy, because photons outnumber baryons a billion to one.
TEX: X_D \sim \eta \left(\frac{kT}{m_p c^2}\right)^{3/2} e^{B_D / kT}
B1 At kT = 2.2 MeV deuterium can bind, but the tiny prefactor eta keeps its
   abundance negligible.
B2 The temperature falls. The exponential grows until it overcomes eta near 0.07 MeV.
   (Curve is schematic up to a constant; pin the onset at 0.07.)
B3 Deuterium survives, and within minutes nearly all neutrons are locked into helium.
CLOSE: temperature axis from 3 MeV down to 0.01 MeV; markers at 2.2 (binding) and
   0.07 (onset); the wait between them shaded.
ASSUME: "Standard Big Bang nucleosynthesis with eta = 6e-10."

### 3.1 The pp gate
POINT: the first step of stellar fusion releases only 0.42 MeV, and three numbers set it.
TEX: p + p \to d + e^+ + \nu_e \qquad Q = B_D - \Delta m - m_e = 0.42\ \mathrm{MeV}
B1 Two protons meet. One becomes a neutron and the pair binds as a deuteron.
B2 Energy ledger: binding 2.22 in, mass difference 1.29 out, electron mass 0.51 out.
   Balance: 0.42 MeV.
B3 A dial weakens the strong force. Binding falls, Q crosses zero, and at 4 to 8%
   weaker the deuteron unbinds.
B4 A second dial moves Delta m. Below 0.51 MeV hydrogen atoms decay. Above 1.71 MeV
   the pp step costs energy.
CLOSE: Delta m axis 0 to 3 MeV; band 0.511 to 1.714; SOLID wall at 0.511 with
   "no hydrogen" to its left; DASHED wall at 1.714 with "pp fusion costs energy" to
   its right; our universe at 1.293.
ASSUME: "The unbinding threshold depends on the nuclear model. Whether stars work
   without stable deuterium is disputed."

### 3.2 Fusion mass balance
POINT: four hydrogen atoms outweigh one helium atom by 0.71%, and that is the star's energy.
TEX: 4\,p \to {}^{4}\mathrm{He} + 2e^+ + 2\nu_e \qquad E = \Delta m\,c^2 = 26.7\ \mathrm{MeV}
B1 Four protons enter on the left of a balance. Helium-4, two positrons and two
   neutrinos leave on the right.
B2 Charge is counted on both sides: four in, four out.
B3 The masses are weighed: 4.0313 u of hydrogen in, 4.0026 u of helium out. The
   missing 0.0287 u lifts off the scale.
B4 The missing mass morphs into the energy term: 26.7 MeV per helium nucleus.
CLOSE: mass-fraction axis 0 to 1%; ours at 0.71%; dashed walls at 0.6% and 0.8%.
ASSUME: "Atomic masses, including the energy from positron annihilation. The 0.6%
   and 0.8% limits are Martin Rees's; other physicists dispute both."

### 3.3 The Hoyle resonance (new)
POINT: carbon forms through a level of carbon-12 that sits 380 keV above three
   helium nuclei, and the rate depends exponentially on that gap.
TEX: 3\,{}^{4}\mathrm{He} \to {}^{12}\mathrm{C}^{*} \to {}^{12}\mathrm{C} + \gamma
TEX: r_{3\alpha} \propto T^{-3} \exp\!\left(-\frac{\Delta_h}{kT}\right)
B1 Two helium nuclei fuse to beryllium-8, which is unbound by 92 keV and falls apart
   in about 1e-16 seconds.
B2 A third helium nucleus arrives in time only because carbon-12 has a level at
   7.654 MeV, 380 keV above the three-helium threshold.
B3 The level slides up and down. The rate responds exponentially: at 1e8 K a
   100 keV shift changes it about 100,000-fold.
CLOSE: level-shift axis in keV, ours at 0; inner band +/-100 (carbon and oxygen
   together); outer band -300 to +500 (carbon alone); all walls dashed.
ASSUME: "Windows from stellar models, which differ. Stars adjust their temperature,
   and stable beryllium-8 would bypass the resonance."

### 3.4 Burning ladder and binding curve
POINT: each burning stage climbs the binding-energy curve, and the ladder ends where
   fusion stops paying.
TEX: \frac{B}{A} = \frac{\left[Z m_p + (A - Z)\,m_n - M(A,Z)\right] c^2}{A}
B1 Equation rows stack up: hydrogen to helium, helium to carbon and oxygen, then
   carbon, neon, oxygen and silicon burning.
B2 Each row's product drops onto the binding-energy curve. It climbs steeply, then
   flattens.
B3 The curve peaks in the iron group: nickel-62 highest, iron-58 and iron-56 just
   below. Past the peak, fusion absorbs energy.
CLOSE: mass-number axis with the curve, iron-group peak marked, energy-releasing
   side shaded.
ASSUME: "Binding energies from measured atomic masses."
Draw the curve from a published atomic-mass table, not freehand. Ask me if none is
at hand.

### 4.1 Weighing the black hole (candidate)
POINT: one star's orbit gives the central mass: about 4.3 million Suns.
TEX: M = \frac{4\pi^2 a^3}{G\,T^2} \qquad \frac{M}{M_\odot} = \frac{(a/\mathrm{AU})^3}{(T/\mathrm{yr})^2}
B1 The star S2 traces its ellipse around an empty point, one lap in 16 years.
B2 Kepler's third law appears. The orbit's size and period slot into it.
B3 Result: 4.3 million solar masses within 120 AU, four times Neptune's distance
   from the Sun.
CLOSE: mass axis (log) with the black hole at 4.3e6 solar masses; no band unless the
   chapter states a limit.
ASSUME: "Newtonian orbit. The full relativistic fit gives the same mass to better
   than 1%."
Needs S2's semi-major axis and period from the GRAVITY orbit table. Ask me; do not guess.

### 5.1 Inverse-square law to habitable zone (zone around a star, NOT the galactic zone)
POINT: flux falls as the square of distance, and an energy balance turns flux into
   temperature.
TEX: F = \frac{L}{4\pi d^2} \qquad T_{\mathrm{eq}} = \left[\frac{L\,(1 - A)}{16\pi\sigma d^2}\right]^{1/4}
TEX: d_{\mathrm{HZ}} = \sqrt{\frac{L/L_\odot}{S_{\mathrm{eff}}}}\ \mathrm{AU}
B1 A shell of light expands from a star. Its area grows as d^2, so the flux through
   each square metre falls as 1/d^2.
B2 A planet absorbs on its disc and radiates from its whole surface. Setting the two
   equal gives the equilibrium temperature.
B3 Earth's numbers go in: 255 K. The measured average is 288 K, and the 33 K
   difference is the greenhouse effect.
B4 The band where liquid water lasts appears, then slides and stretches as the star
   changes from M dwarf to K to G. (Schematic: scale both edges by sqrt(L/Lsun).)
CLOSE: distance axis in AU for the Sun: band 0.99 to 1.70 with dashed walls; Earth
   at 1.00 just inside the inner edge; Venus outside at 0.72; Mars inside at 1.52.
ASSUME: "Edges from a one-dimensional climate model: water loss and maximum
   greenhouse. Three-dimensional models move the inner edge to about 0.95 AU."

### 6.1 The error threshold (candidate)
POINT: a replicator can keep only as much information as its copying accuracy allows.
TEX: L_{\max} \approx \frac{\ln \sigma}{\mu}
B1 A short sequence copies itself. Each letter miscopies with probability mu, and
   errors pile up down the generations.
B2 The fittest sequence out-reproduces the rest by a factor sigma. Selection restores
   what mutation erodes, up to a length limit.
B3 A length slider moves right. Past ln(sigma)/mu the master sequence dissolves
   into noise.
B4 The catch: at about 1% error per letter the limit is near 100 letters, too short
   to encode the enzymes that would lower the error rate.
CLOSE: genome-length axis (log); dashed wall near 100 letters for unaided copying;
   marker for RNA viruses near 1e4.
ASSUME: "Eigen's single-peak model. Work on real ribozymes argues for a more relaxed
   threshold."

### 7.1 Reading rock clocks (candidate)
POINT: every date on the site's timeline rests on one decay law.
TEX: N(t) = N_0\,e^{-\lambda t} \qquad t = \frac{1}{\lambda}\,\ln\!\left(1 + \frac{D}{P}\right)
B1 A crystal starts with parent atoms only. They decay into daughter atoms at a
   fixed rate lambda.
B2 The parent curve falls and the daughter curve rises. Their ratio D/P is a clock.
B3 Invert the law: the ratio measured today gives the age.
B4 The chapter's own dates drop onto a time axis, each tagged with the ratio that
   fixed it.
CLOSE: time axis from Earth's formation to today with the chapter's events as markers.
ASSUME: "Closed system with no daughter atoms at the start. Uranium-lead dating
   checks this with two independent decay chains."

### 8.1 Codon combinatorics
POINT: three letters is the shortest word that covers twenty amino acids, and the
   real code is unusually error-tolerant.
TEX: 4^1 = 4 \qquad 4^2 = 16 < 20 \qquad 4^3 = 64 \geq 20
B1 One-letter words give 4 codons and two-letter words give 16. Twenty amino acids
   do not fit until three letters give 64.
B2 The 64 codons arrange into the table and cluster into 21 groups: 61 codons for
   the 20 amino acids and 3 for stop.
B3 A point mutation flips one letter. In the real table, most single flips land on
   the same or a similar amino acid.
B4 A histogram builds from a million random codes scored for error cost (schematic
   bell shape). The real code sits in the far tail.
CLOSE: error-cost axis with the random-code distribution and the real code's marker:
   better than all but about one in a million.
ASSUME: "Freeland and Hurst's measure, weighted by observed mistranslation biases.
   The authors read the result as evidence of selection."

### 8.2 Sequence space
POINT: the count of possible proteins is exact; whether it matters depends on two
   inputs the scene must show.
TEX: 20^{150} \approx 10^{195} \qquad N_{\mathrm{hits}} = N_{\mathrm{trials}} \times f
B1 Slots fill with 20 choices each. The count grows past the screen: 20^150.
B2 The count moves to log space: 195 decades, against 97 decades for every atom
   acting once a second for the age of the universe.
B3 The first missing input appears: f, the fraction of sequences that work.
   Published estimates run from 1 in 1e11 to 1 in 1e77.
B4 The second appears: the search rule. Blind sampling starts fresh every trial,
   while selection keeps partial gains. Hand off to 8.3.
CLOSE: log axis of f with both estimates marked and 66 decades between them.
ASSUME: "Counts assume blind, uniform sampling. 1e-11 is for ATP binding in
   80-residue chains. 1e-77 is Axe's estimate for a specific enzyme function, from
   a domain of about 150 residues."
Check this scene's wording against 0e with me before building it.

### 8.3 Levinthal's paradox (PILOT)
POINT: a small energy bias on each bond turns an impossible search into a
   one-second one.
TEX: \tau \approx \frac{(1 + K)^N}{N k_0} \qquad K = \nu\,e^{-U/kT}
B1 A chain of 100 bonds, each with one right state and two wrong ones:
   3^100 = 5e47 configurations.
B2 Blind search at 1e13 configurations a second takes 1e27 years. The universe is
   1e10 years old.
B3 A dial adds an energy cost U to each wrong bond. On a log axis the folding time
   collapses as U rises.
B4 At U = 2kT the time reaches about one second.
CLOSE: U/kT axis from 0 to 4; band where folding takes under a second, starting at 2.
ASSUME: "Zwanzig, Szabo and Bagchi's 1992 model: 100 bonds, two wrong states each,
   1e9 corrections per second."
Curve: the TeX above is the on-screen form but only an approximation. Plot this
exact mean first-passage time (N = 100, nu = 2, k1 = 1e9 per second, K as above,
C = binomial coefficient, start with all bonds wrong):
   tau(U) = (1/k1) * sum_{n=1..N} [ sum_{m=n..N} C(N,m) K^m ] / [ n * C(N,n) * K^n ]
Use high-precision arithmetic. Check values in seconds: U=0: 2.59e36, U=1: 1.23e13,
U=2: 0.973, U=3: 1.51e-6, U=4: 1.77e-8, large U: 5.19e-9.
At U = 0 the model gives 8e28 years; Levinthal's classic 1e27 years assumes 1e13
trials per second. Show the curve's true start and mark 1e27 years as a reference.
Do not force them to agree.

### 8.4 Shannon information and DNA density
POINT: entropy gives DNA's storage ceiling, and the lab record sits about 2,000
   times below it.
TEX: H = -\sum_i p_i \log_2 p_i
TEX: \frac{2\ \mathrm{bits} \times N_A}{330\ \mathrm{g/mol}} \approx 3.6 \times 10^{21}\ \mathrm{bits/g}
B1 Four letters with equal odds: each term of the sum contributes half a bit, and H
   reaches 2 bits per base.
B2 Skew the odds and H falls. A genome with 41% G+C comes out at 1.98 bits.
B3 Multiply by Avogadro's number and divide by the mass of a nucleotide: about
   455 exabytes per gram.
B4 The lab record drops onto the same axis: 215 petabytes per gram, read back
   without error.
CLOSE: density axis (log) with the lab record at 215 PB/g and the ceiling at
   455 EB/g as a solid wall.
ASSUME: "Ceiling assumes single-stranded DNA at about 330 g/mol per nucleotide.
   Shannon entropy measures capacity, not meaning: a random sequence scores highest."

### U.1 Drake as distributions
POINT: multiply seven uncertain factors and the answer is a distribution dozens of
   decades wide.
TEX: N = R_*\,f_p\,n_e\,f_l\,f_i\,f_c\,L \qquad \log N = \sum \log(\mathrm{factor})
B1 The equation builds left to right. Each factor arrives as a range, not a number.
B2 Take logs: the product becomes a sum, and the ranges add.
B3 Samples rain down and a histogram of log N builds across dozens of decades.
B4 A line at N = 1 splits the histogram: 52% of the probability lies below it.
CLOSE: log N axis with the histogram, the N = 1 line and the share on each side.
ASSUME: "Ranges from Sandberg, Drexler and Ord, 2018. After accounting for the
   silent sky, they put the chance we are alone in the galaxy between 53% and 99.6%."
Sampling, log-uniform: R* 1 to 100 per year; f_p 0.1 to 1; n_e 0.1 to 1;
f_i 0.001 to 1; f_c 0.01 to 1; L 100 to 1e10 years. f_l uses a log-normal rate with
median 1 event per planet and a spread of 50 orders of magnitude; as I read the
paper, f_l = 1 - exp(-rate). Print the paper's 52%, not your sample's share.

## NUMBERS (source of truth for constants.py)

H0_CMB = 67.4 +/- 0.5 km/s/Mpc        Planck 2018
H0_LOCAL = 73.50 +/- 0.81 km/s/Mpc    Local Distance Network, 2026
H0_GAP = 9 percent; label "more than 6 sigma" (7.1 sigma vs the combined CMB fit)
OMEGA_M = 0.315, OMEGA_LAMBDA = 0.685 Planck 2018, flat
OMEGA_R = 9e-5                        approximate standard value; only places the radiation line
A_ACCEL = 0.61 (z = 0.63)             computed
A_CROSS = 0.77 (z = 0.30)             computed
LAMBDA_LIMIT = 200 x observed at Q = 1e-5; about 1e11 x if Q reaches 1e-2
FLATNESS_AT_PLANCK_TIME = 1e-60
VACUUM_OVERSHOOT = QCD 1e45, electroweak 1e55, Planck cutoff 1e123
RHO_LAMBDA_PLANCK_UNITS = 1.1e-123    computed
BARYONS = 1e80; PENROSE_ENTROPY = 7e122 k, shown as 1e123
ETA = 6e-10; PHOTONS_PER_BARYON = 1.6e9; ETA_UPPER = 1e-6
DELTA_M = 1.293 MeV; M_E = 0.511 MeV; B_D = 2.2246 MeV (show 2.22)
NP_FREEZE = 0.15 at 0.7 MeV; NP_BBN = 1/7; Y_P = 0.25 simple, 0.24 full
DEUTERIUM_ONSET = 0.07 MeV
Q_PP = 0.420 MeV; DM_LOW = 0.511 MeV; DM_HIGH = 1.714 MeV
STRONG_FORCE_UNBIND = 4 to 8 percent weaker
FUSION = 4 x 1.007825 u = 4.0313 u in; 4.002602 u out; deficit 0.0287 u
         = 0.712 percent = 26.73 MeV
REES_EPSILON_LIMITS = 0.006 and 0.008
HOYLE_LEVEL = 7.654 MeV; DELTA_H = 379.5 keV (show 380)
HOYLE_WINDOWS = +/-100 keV (C and O together); -300 to +500 keV (C alone)
BE8 = unbound by 92 keV; lifetime about 1e-16 s
TRIPLE_ALPHA = 100 keV shift changes the rate 1.1e5-fold at 1e8 K (kT = 8.617 keV)
BINDING_PEAK = Ni-62, then Fe-58, then Fe-56
SGR_A = 4.3e6 solar masses; S2 period 16 years; closest approach 120 AU
EARTH = T_eq 255 K (albedo 0.30, 1361 W/m^2); measured mean 288 K
HZ_SUN = 0.99 to 1.70 AU (1D model); inner edge 0.95 AU (3D models)
VENUS = 0.72 AU; MARS = 1.52 AU
ERROR_THRESHOLD = about 100 letters at 1 percent error; RNA viruses about 1e4
CODONS = 64 = 61 coding + 3 stop; 21 groups
CODE_RANK = better than all but about 1 in 1e6 random codes
SEQUENCES = 20^150 = 1e195 (195.15 decades); TRIALS = 1e97
WORKING_FRACTION = 1e-11 to 1e-77 (66 decades apart)
LEVINTHAL = N 100, nu 2, k1 1e9 per second; 3^100 = 5.15e47; blind 1e27 years at
            1e13 per second; 1 second at U = 2kT; universe 1e10 years
SHANNON = 2 bits per base maximum; 1.98 at 41 percent G+C (share approximate)
DNA_DENSITY = ceiling 3.65e21 bits/g = 455 EB/g; lab record 215 PB/g
DRAKE = P(N < 1) 52 percent before the silent-sky update; 53 to 99.6 percent after
