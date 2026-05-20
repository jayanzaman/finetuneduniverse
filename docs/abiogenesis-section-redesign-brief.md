# Redesign Brief: "From Chemistry, A Code" Section (Chapter 06)

**File:** `src/components/universe-builder/sections/AbiogenesisLabSection.tsx`
**Companion visuals:** none — `AbiogenesisCarousel` and `StageInfo` are defined inline at the top of the file. The 6 stage images live in `/public/`:
- `/Stage 0 - Prebiotic Soup.png`
- `/Stage 1 - Amino Acids.png`
- `/Stage 2 - Peptides.png`
- `/Stage 3 - Protocells.png`
- `/Stage 4 - RNA World.png`
- `/Stage 5 - First Life.png`

**Wrapped by:** `src/components/hifi/ChapterFrame.tsx` (provides the hero title, intro prose, primary Goldilocks slider for **Atmospheric UV flux · W/m²**, ghost panel, prev/next footer — the redesign should focus on the *inner* educational interactive, embedded via `<div className="hifi-section-embed">`)

## Section purpose

"From Chemistry, A Code" is **Chapter 06 of 7** in a cinematic, scroll-driven cosmology explorer. The era it represents is **~3.8 Bya · Hadean Earth**. The frame copy reads: *"On a young, lightning-lashed Earth, simple molecules collide and combine. Amino acids stitch into peptides. Membranes find themselves containing themselves. The planet runs this lottery for a hundred million years — and somewhere along the way, one ticket reads: life."*

**This is by far the most complex chapter in the site.** It is an interactive **abiogenesis simulator** with:
- **6 stages** of chemical-to-biological transition the user navigates through (Prebiotic Soup → Amino Acids → Peptides → Protocells → RNA World → First Life).
- **8 environmental controls** the user tunes (4 energy inputs + chemistry richness + water activity + pH + temperature + a mineral-catalysis toggle).
- **Dynamic Goldilocks bands that shift per stage** — what counts as "optimal UV" for amino acid formation is *different* from what counts as optimal for RNA World. The green safe-zones on each slider literally move as the user advances through stages.
- **Live computed metrics** for each stage (amino acid yield, peptide count, mean peptide length, vesicle count, encapsulation rate, template strands, per-base accuracy, strand fidelity, Eigen-threshold pass/fail, life potential).
- **Stage-by-stage scientific honesty**: each stage has confidence ratings, difficulty ratings, key mechanisms, major challenges, key experiments, and a "Scientific Reality" caveat explicitly naming what's still unsolved.
- **The Eigen threshold**: a real mathematical bound (`p_crit = 1 − ln(s)/L` with `s = 2.0`) computed live and surfaced as a pass/fail badge.

This chapter is **not a slider-set with one outcome string** like Chapters 01/02. It is a small piece of educational software running a multi-stage biochemistry simulation. Every redesign decision needs to grapple with that complexity.

## Existing UX patterns to honor

- **Two-column layout (lg+)**: left column is the simulation canvas (stage carousel) + StageInfo detail card below; right column is the Environmental Controls panel.
- **Stage navigation**: user clicks one of the 6 stages in the carousel; the selected stage drives the simulation calculation, the stage image, and the StageInfo content below.
- **Live optimal-range shifts**: each slider's green band moves as `simulationState.stage` advances (e.g. UV slider: `30-60` for stages 0-3 → `25-45` for stage 4 → `20-35` for stage 5).
- **Diagnostic readouts under each slider**: real-world analogies (UV: "Safe for humans" → "Sunburn in hours" → "DNA damage, cancer risk" → "Lethal to most life"; Temperature: "Frozen, slow chemistry" → "Human body temperature" → "Hot bath to boiling" → "Pressure cooker" → "Deep hydrothermal vents").
- **Stage-gated warnings**: e.g. when stage ≥ 4, a red pill appears next to "Energy Inputs": *"⚠️ RNA/DNA require precise tuning"*. The whole UI shifts tone as the user approaches the RNA World threshold.
- **Eigen pass/fail badge** with green ✓ Pass or red ✗ Fail.
- **Educator-mode reveals** are baked into the StageInfo card (currently always shown — not toggled by `educatorMode` prop, which is passed in but unused for content gating).
- **No `randomizeUniverse` listener in this section** (verified — this is the only section that doesn't bind to the global randomize event).

## Visual design system already in place (don't fight it)

- Palette: `--void: #030308`, `--indigo: #7A7BFF`, `--goldilocks: #6FE4B1`, ink ladder, hair lines.
- Fonts: `Unbounded` (display), `Space Grotesk` (body), `Space Mono` (mono/labels), `Newsreader` (serif italic accents).
- Signature control: `GoldilocksSlider` in `src/components/hifi/`. The eight sliders here have an unusual property — their Goldilocks band *moves* depending on stage. The redesigned slider component will need to animate the band when stage advances.
- Backdrop is already a fixed cosmic gradient + seeded starfield + grain — keep the lab panels on translucent/glassy surfaces so the cosmos shows through.

---

## The six stages — content spec

Each stage has the same content shape: `title`, `description`, `confidence`, `difficulty`, `requirements`, `details`, `mechanisms[]`, `challenges[]`, `experiments[]`, `caveat`. The full text from the source is verbatim — preserve in redesign.

### Stage 0 — Prebiotic Soup
- **Description:** "Simple gases and energy sources create a reactive chemical environment rich in organic precursors"
- **Confidence:** Empirically supported · **Difficulty:** Moderate
- **Requirements:** reducing atmosphere (CH₄, NH₃, H₂O, H₂), energy sources (UV, lightning, heat), absence of free oxygen
- **Key mechanisms:** Miller-Urey synthesis · Formose reaction · HCN polymerization · Fischer-Tropsch synthesis
- **Major challenges:** atmosphere composition uncertain · dilution problem · destructive processes · chirality (racemic mixtures)
- **Key experiments:** Miller & Urey (1953) · Oró (1961) · Butlerow (1861)
- **Caveat:** Organic synthesis is well-demonstrated, but exact early-Earth conditions debated; atmosphere may have been less reducing than Miller-Urey assumed.

### Stage 1 — Amino Acids
- **Description:** "Energy-driven synthesis of the 20 proteinogenic amino acids essential for life"
- **Confidence:** Empirically demonstrated · **Difficulty:** Easy
- **Requirements:** UV 30-60, lightning 50-80, reducing conditions, carbon/nitrogen sources
- **Mechanisms:** Strecker synthesis · reductive amination · spark discharge · hydrothermal vent synthesis
- **Challenges:** racemic mixtures · selective synthesis · stability · concentration
- **Experiments:** Miller-Urey produced 11/20 amino acids · Wächtershäuser's iron-sulfur world · Huber & Wächtershäuser (1998)
- **Caveat:** Amino acid synthesis is robust, **but the chirality problem remains unsolved** — no known prebiotic process selectively produces only L-amino acids.

### Stage 2 — Peptides
- **Description:** "Amino acids polymerize into short protein chains with emerging catalytic properties"
- **Confidence:** Lab-demonstrated · **Difficulty:** Moderate
- **Requirements:** dry-wet cycling 60-90, hydrothermal 40-80, concentrated amino acid solutions
- **Mechanisms:** thermal condensation · clay (montmorillonite) catalysis · dry-wet cycling · carbonyl sulfide activation
- **Challenges:** hydrolysis competition · sequence specificity · length limitations (10-20 aa) · mixed chirality
- **Experiments:** Fox (1965) thermal proteins · Ferris et al. (1996) montmorillonite up to 55 residues · Leman et al. (2004) COS-mediated
- **Caveat:** Peptide formation is achievable but produces mostly random sequences; functional catalytic peptides are extremely rare in random sequences.

### Stage 3 — Protocells
- **Description:** "Self-assembling lipid vesicles create the first cellular compartments and concentrate biochemistry"
- **Confidence:** Lab-demonstrated · **Difficulty:** Moderate
- **Requirements:** water activity 60-95, hydrothermal 60-80, amphiphilic molecules
- **Mechanisms:** spontaneous self-assembly · vesicle growth · division by shear · selective permeability
- **Challenges:** membrane stability · growth-division coupling · selective permeability · competition with bulk phase
- **Experiments:** Deamer & Barchfeld (1982) · Szostak lab (2003) growing/dividing vesicles · Mansy & Szostak (2008) template-directed RNA in vesicles
- **Caveat:** Protocell formation is well-demonstrated, but coordinated growth/division/heredity remains challenging.

### Stage 4 — RNA World
- **Description:** "Hypothetical stage where RNA molecules serve as both genes and enzymes, bridging chemistry and biology"
- **Confidence:** Theoretical · **Difficulty:** Very Difficult
- **Requirements:** UV 25-45, lightning 30-55, chemistry richness ≥85%, temperature 298±5K, **Eigen threshold passage**
- **Mechanisms:** template-directed synthesis · ribozyme catalysis · RNA evolution · compartmentalization
- **Challenges:** **Eigen's paradox** (accurate replication needs long RNAs, but long RNAs replicate inaccurately) · prebiotic RNA synthesis unsolved · homochirality · RNA instability
- **Experiments:** Ferris & Ertem (1992) clays up to 50 nucleotides · Joyce lab (2009) self-replicating RNA enzymes (pure components) · Szostak lab (2016) RNA polymerase ribozyme
- **Caveat:** **The RNA World remains hypothetical.** No experiment has demonstrated spontaneous emergence of self-replicating RNA from prebiotic conditions. Many scientists now favor metabolism-first or lipid-first scenarios.

### Stage 5 — First Life
- **Description:** "The first true living cells with integrated DNA-protein-RNA machinery, genetic code, and cellular reproduction"
- **Confidence:** Evolutionary transition · **Difficulty:** Extremely Difficult
- **Requirements:** UV 20-35, cycling ≥80%, chemistry richness ≥85%, water activity 75-90, temperature 298±3K
- **Mechanisms:** central dogma (DNA → RNA → Proteins) · DNA replication with error-correction · basic metabolism · cellular reproduction
- **Challenges:** **irreducible complexity** (DNA, RNA, proteins are interdependent — none works without the others) · genetic code origin · ribosome assembly (80+ proteins/RNAs) · metabolic coordination
- **Experiments:** No prebiotic experiments — modern life requires existing biological machinery; minimal genomes need ~250+ genes; LUCA already had full DNA-protein machinery
- **Caveat:** Transition from RNA World to integrated DNA-protein-RNA involves multiple **chicken-and-egg problems** that remain unsolved.

---

## The eight environmental controls — detailed specs

State lives in `controls: EnvironmentalControls`. Defaults are *center of stage-0 optimal range*.

### Energy Inputs (4 sliders)

| Control | Default | Range | Stage 0-3 optimal | Stage 4 optimal | Stage 5 optimal | Diagnostic copy |
|---|---|---|---|---|---|---|
| **UV Radiation** | 45 | 0-100 | 30-60 (energy for chemistry) | 25-45 (template formation) | 20-35 (DNA precision) | < 10 "Safe for humans" → < 30 "Sunburn in hours" → < 60 "DNA damage, cancer risk" → 60+ "Lethal to most life" |
| **Lightning** | 65 | 0-100 | 50-80 (early stages) | 40-60 | 30-55 | (real-world: `value × 0.02` strikes/km²/yr displayed) |
| **Hydrothermal** | 60 | 0-100 | 40-80 | (similar shift) | (similar shift) | — |
| **Dry-Wet Cycling** | 75 | 0-100 | 60-90 | (similar shift) | ≥80 required for stage 5 | — |

- All four sliders display the **moving green band** that animates between three positions as `simulationState.stage` advances.
- At stage ≥ 4, a red pill appears next to the "Energy Inputs" header: *"⚠️ RNA/DNA require precise tuning"* — visual signal that the band tightens.

### Chemistry Richness
- **Default:** 70 · **Range:** 0-100 · **Unit:** `value × 0.01` M total (so 70 displays as `0.70 M total`)
- **Optimal bands:** 50-90 (early) → 70-90 (mid) → ≥85% (late stages)
- **Diagnostic copy:** < 25 "Pure water" → < 50 "River water" → < 75 "Seawater" → 75+ (presumed: rich primordial soup)

### Water Activity
- **Default:** 78 · **Range:** 0-100 · **Unit:** `value × 0.01` aw (so 78 displays as `0.78 aw`)
- **Optimal bands:** 60-95 (early) → 75-90 (stage 5)
- **Diagnostic copy:** < 25 "Dry salt" → < 50 "Honey consistency" → < 75 "Seawater" → 75+ (open water)

### pH
- **Default:** 7 · **Range:** 0-14 (implied — not directly seen in the slider markup but in the type)
- Currently *not* obviously stage-coupled in the simulation logic — may be vestigial. Verify before removing.

### Temperature
- **Default:** 298 K (25°C) · **Range:** 253-673 K (i.e. -20°C to 400°C) · **Display:** `{K} K ({°C}°C)`
- **Optimal bands:** 288-308 K (early, ±10K of 298) → 293-303 K (stage 4, ±5K) → 295-301 K (stage 5, ±3K)
- **Diagnostic copy:** < 273 "Frozen, slow chemistry" → < 310 "Human body temperature" → < 373 "Hot bath to boiling" → < 473 "Pressure cooker" → < 573 "Deep hydrothermal vents" → 573+ (extreme)
- **Special status badges:** at stage ≥ 4 and `|T − 298| ≤ 5`, a green "stage 4 lock" badge appears. At stage ≥ 5 and `|T − 298| ≤ 3`, an even tighter green badge. If user violates either at the relevant stage, a red error appears.

### Mineral Catalysis (boolean)
- **Default:** true. Acts as a `1.5×` multiplier (`mineralFactor`) on yields when enabled vs. `1.0×` when disabled.
- Featured in the per-base-accuracy calculation: adds `+0.18` to base accuracy when on.

---

## The live simulation engine — detailed math

The single `useEffect` at lines 765-904 recomputes `simulationState` whenever `selectedPhase` or `controls` change. Preserve this faithfully.

```ts
// Aggregate factors
energyFactor   = min(1, (uv × 0.5 + lightning + hydrothermal + dryWetCycling) / 400)
mineralFactor  = mineralCatalysis ? 1.5 : 1.0
richnessFactor = clamp(chemistryRichness / 100, 0, 1)

// Stage 0: always available
aminoAcidYield = energyFactor × richnessFactor × 10

// Stage 1 gate: dryWetCycling ≥ 60 AND hydrothermal ≥ 40
peptideCount      = (dryWetCycling / 100) × mineralFactor × 100
meanPeptideLength = 20

// Stage 2 gate: waterActivity ≥ 60 AND hydrothermal ≥ 60
vesicleCount      = (waterActivity / 100) × 50
encapsulationRate = waterActivity / 100

// Stage 3 gate: chemistryRichness ≥ 70 AND hydrothermal ≥ 70 AND dryWetCycling ≥ 70 AND |T-298| ≤ 10
templateStrands   = mineralFactor × richnessFactor × 20
meanStrandLength  = 30

// Per-base accuracy (always computed at stage ≥ 3)
tempBoost = exp(−0.5 × ((T − 298) / 8)²)
p = 0.70
  + (mineralCatalysis ? 0.18 : 0.0)
  + 0.12 × tempBoost
  − 0.20 × (uv / 100)
p = clamp(p, 0.5, 0.995)

// Eigen threshold (Eigen 1971)
L     = max(1, round(meanStrandLength))
s     = 2.0                            // selective advantage
pCrit = 1 − ln(s) / L
passesEigen    = (p ≥ pCrit)
strandFidelity = p^L

// Stage 4 (RNA World) gate:
//   25 ≤ uv ≤ 45 AND 30 ≤ lightning ≤ 55 AND
//   chemistryRichness ≥ 85 AND waterActivity ≥ 75 AND |T-298| ≤ 5
//   AND passesEigen
templateStrands  = mineralFactor × richnessFactor × 30
meanStrandLength = 50      // longer functional RNAs
rnaStrands       = mineralFactor × richnessFactor × 50
rnaLength        = 100

// Stage 5 (First Life) gate:
//   20 ≤ uv ≤ 35 AND dryWetCycling ≥ 80 AND
//   chemistryRichness ≥ 85 AND 75 ≤ waterActivity ≤ 90 AND |T-298| ≤ 3
//   AND p > 0.85
dnaStrands       = mineralFactor × richnessFactor × 20
dnaLength        = 200
rnaStrands       = max(rnaStrands, 100)
templateStrands  = max(templateStrands, 50)

// Life potential (capped per stage tier)
infoFactor        = min(1, L / 20)
baseHeredityScore = 0.6 × p + 0.4 × infoFactor × p
maxPotential      = 40          // stages 0-3
stageMultiplier   = 1.0
if (stage ≥ 4 && rnaStrands ≥ 5) { maxPotential = 80;  stageMultiplier = 1.2 }
if (stage ≥ 5 && dnaStrands ≥ 3) { maxPotential = 100; stageMultiplier = 1.5 }

rawPotential = (
    (meanPeptideLength / 20) × 0.3 +
    encapsulationRate       × 0.3 +
    baseHeredityScore       × 0.4
  ) × 100 × stageMultiplier
lifePotential = clamp(rawPotential, 0, maxPotential)
```

**The Eigen threshold is the chapter's intellectual centerpiece.** Eigen's paradox (1971): to encode useful information you need a long strand; but the longer the strand, the more replication errors accumulate. `p_crit = 1 − ln(s)/L` is the minimum per-base accuracy required for replication to be sustainable. The teaching point: **no prebiotic chemistry experiment has ever produced RNA/DNA replication meeting this threshold.** The Eigen Pass/Fail badge is the moment where the user's hands-on tuning runs into a real, named mathematical wall.

---

## What the redesign should preserve vs. reimagine

**Preserve (logic / content):**
- All 6 stages with their **exact** verbatim title/description/confidence/difficulty/requirements/mechanisms/challenges/experiments/caveat strings. This is the most editorially substantive content in the entire site.
- All 8 environmental controls (4 energy + chemistry + water activity + pH + temperature + mineralCatalysis boolean) with their exact ranges, defaults, and units.
- The **moving Goldilocks band** behavior — each slider's safe-zone shifts based on `simulationState.stage`. This is the chapter's signature interaction.
- The complete simulation math (gating, per-base accuracy formula, Eigen threshold, life-potential calculation with stage tiers).
- The Eigen pass/fail badge — preserve as a first-class element.
- The stage-gated warning pills ("⚠️ RNA/DNA require precise tuning" etc.).
- The diagnostic copy under each slider (UV: "Safe for humans" / "Sunburn in hours" etc.; Temperature: "Frozen" / "Human body" / "Pressure cooker" etc.).
- Embedded-inside-ChapterFrame layout (don't add another hero / title / outer chrome — the frame provides it).
- The two-column lg+ layout pattern (simulation on the left, controls on the right) or a cleaner equivalent.

**Reimagine (visual / interaction):**
- The chapter has **too many UI elements competing**: 8 sliders, a 6-stage carousel, a giant stage-info card with 7 nested colored panels (blue Details / yellow Requirements / green Mechanisms / orange Challenges / purple Experiments / red Caveat), plus live metrics. The redesign needs an editorial pass to triage which content needs to be on-screen at once vs. behind progressive disclosure.
- The StageInfo card currently uses a **rainbow of background-colored panels** (`bg-blue-900/20`, `bg-yellow-900/20`, `bg-green-900/20`, `bg-orange-900/20`, `bg-purple-900/20`, `bg-red-900/20`). This is the most visually noisy element in the entire site. Replace with typographic hierarchy: serif headings for section titles, mono for confidence/difficulty pills, body for content, and a single accent color (`--goldilocks`) for the caveat pull-quote.
- The Goldilocks band's stage-shifting behavior is currently invisible — the band just snaps to a new `left`/`width` style. **Make the shift animated and surfaced**: when the user advances to stage 4, the bands should visibly contract with a 600ms ease, and a small caption should say *"safe band tightened — RNA needs precision."*
- The Eigen badge is currently a small `✓ Pass` / `✗ Fail` line. **Promote it to a hero element**: a live equation rendering of `p_crit = 1 − ln(s)/L` with the user's current `p` and `p_crit` values plotted on a horizontal accuracy axis, the safe region in `--goldilocks` past the threshold.
- The stage carousel images currently sit in a single rectangular panel. Consider a **horizontal "ladder" of 6 still life vignettes** (each in its own small frame), with the active one expanded — like reading frames of a graphic novel left-to-right.
- The Life Potential metric (capped 40 / 80 / 100 by stage tier) is currently buried in the metrics panel. **Surface it as the chapter's primary scoreboard** — a single 0-100 indicator that locks at 40 until stage 4 unlocks 80, and stage 5 unlocks 100. The user can *feel* the gating barriers.
- Currently the `educatorMode` prop is passed in but **doesn't gate any content** — the StageInfo card always shows the full educator-mode treatment. Decide: either gate the verbose content behind educator mode (cleaner default view), or remove the prop dependency and own the verbosity as the chapter's character.
- The "No `randomizeUniverse` listener" gap should probably be filled — re-roll all 8 controls with a button, since dropping random conditions on the lottery is *exactly* what abiogenesis is.
- Visual treatment: the chapter's existing colors are `from-green-400 to-blue-400` gradients, lime accents, lab-equipment energy. This *almost* fits the hi-fi palette but is too gamey — pull back to the chapter's actual emotional beat: a hundred million years of *failure*, with one ticket landing right.

**Tone to aim for:** Brian Cox's *Wonders of the Universe* meets *The New York Times* interactive features — meditative, precise, slightly reverent. Not gamey, not playful-cartoon, not utilitarian-dashboard. The emotional beat of this chapter is *the lottery* — the chapter frame already says it: *"The planet runs this lottery for a hundred million years."* The simulator's tone should communicate **the staggering improbability of every step**, not "tweak the sliders to win." The user should leave understanding *why* abiogenesis is hard and *which specific walls* (Eigen's threshold, chirality, irreducible complexity) we have not yet climbed. The 6 stages' explicit "Scientific Reality" caveats are this chapter's editorial soul — give them magazine-essay treatment, not warning-box treatment.
