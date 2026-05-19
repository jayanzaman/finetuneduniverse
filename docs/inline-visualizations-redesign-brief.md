# Redesign brief: inline section visualizations (the "second-tier" viz layer)

> Sources:
> - `src/components/universe-builder/sections/UniverseGeometry3D.tsx`        (158 lines)
> - `src/components/universe-builder/sections/QuarkBindingVisual.tsx`        (241 lines)
> - `src/components/universe-builder/sections/SimpleMatterVisuals.tsx`       (275 lines)
> - `src/components/universe-builder/sections/EnhancedStrongForceSlider.tsx` (206 lines)
> - `src/components/universe-builder/sections/StarFormationRateVisual.tsx`   (167 lines)
> - `src/components/universe-builder/sections/MetallicitySpectrumVisual.tsx` (276 lines)
> - `src/components/universe-builder/sections/TimelineProbabilityVisual.tsx` (154 lines)
> - `src/components/universe-builder/sections/ImprobabilityCascadeVisuals.tsx` (413 lines)
> - `src/components/universe-builder/sections/SimpleImprobabilityVisuals.tsx`  (437 lines)

These nine files are the *second-tier* visualization layer: not the cinematic
chapter visuals in `ChapterVisuals.tsx` (the seeded starfield, PrimordialBubble,
GalaxyViz, etc.), but the in-section diagrammatic widgets that the legacy lo-fi
chapter components render inside their bodies. They power Chapters 01–04 (Beginning,
Matter, Starlight, GalacticHeart) and the sub-cards inside each.

The redesign question is not "how do we restyle each one" — it is "**which of these
nine survive the hi-fi rewrite, and which are absorbed by the cinematic visualization
slot in `ChapterFrame`?**"

---

## 1. Survey: what each file is, in one paragraph

### UniverseGeometry3D.tsx — Three.js `Canvas` (closed/flat/open)
A `react-three-fiber` canvas with `OrbitControls`. Renders one of three meshes
based on a `density` (Ω) prop: a flat plane (Ω≈1), a spherical dome (`Ω>1`,
`z = sqrt(R² - x² - y²)`), or a hyperbolic saddle (`Ω<1`, `z = k·x·y · 0.5`). All
meshes are wireframe `meshStandardMaterial`. Flatness threshold is `|density-1| <
0.005`. Has an overlay (top-left) showing FLAT/CLOSED/OPEN + Ω value, and a
bottom-right "Drag to rotate · Scroll to zoom" hint. Uses palette `#74b9ff` (flat
blue), `#ff9f43` (closed orange), `#ff6b9d` (open pink). **No animation loop —
geometry rebuilds when `density` changes.**

### QuarkBindingVisual.tsx — framer-motion proton with three regimes
A 320 px tall canvas with three quarks (`#ff4444 / #4444ff / #44ff44`) at radial
positions, gluon "flux tubes" drawn as SVG lines, and *regime-specific overlay
animations*: scattered blue particles for `αs < 0.98`, a pulsing yellow→red fusion
explosion with shock waves for `αs > 1.02`, and a stable rotating purple atom with
orbiting yellow electrons for the optimal band. A *cosmic scale* zoom out for "too
weak", zoom in for "too strong". Bottom caption auto-rotates between three
verbatim lines: "Too weak → quarks can't bind → no atoms, no stars, no life", "Too
strong → runaway fusion → no hydrogen → no shining stars", "Stable binding →
hydrogen exists → stars shine". **Most cinematic of the nine. Closest in spirit
to a hi-fi chapter visual.**

### SimpleMatterVisuals.tsx — four 2D canvas widgets
Four exports drawing into HTML5 canvases (~280×180 each):

- `SimpleStrongForceVisual({ strongForce })` — three colored quarks + a central
  proton blob; bond strength `Math.min(255, αs × 128)`, stability `exp(-|αs-1|×2)`,
  particleSize `clamp(15, 40, 20 + αs × 10)`.
- `SimpleHierarchyVisual({ massScale })` — bar chart of four forces (Gravity 1,
  Weak `massScale × 10`, EM `× 100`, Strong `× 120`).
- `SimpleMatterAntimatterVisual({ asymmetry })` — 20 particles split into matter
  (`#blue`) and antimatter (`#red`), `matterCount = round(20 × (0.5 + asymmetry/2))`.
- `SimpleProtonStabilityVisual({ lifetime })` — central proton circle, decay
  particle ring when `lifetime < 30`.

All four are static (one effect per state change), no animation. They are the
"fallback" / simpler counterparts to the more elaborate ImprobabilityCascade and
QuarkBinding viz.

### EnhancedStrongForceSlider.tsx — bespoke draggable αs slider
A *replacement* for shadcn `Slider` specifically for the strong force parameter.
Range `0.8 .. 1.2`, step `0.001`. Custom pointer-event drag handling with global
listeners attached on drag start. Renders:

- A 32 px tall full-width gradient track (`#4A90E2 → #FFFFFF → #E94B3C`, hard stops
  at 0%/20% / 45%/55% / 80%/100%).
- A vertical yellow "Our Universe" marker at the position of value 1.000 with
  labels above ("Our Universe") and below ("1.000").
- A circular thumb tinted by current regime (blue / white / red), inner glow,
  scale-up to 1.2 on drag, box-shadow halo proportional to drag state.
- A green-tinted "Life Zone" band overlay from 0.98 to 1.02 with a "Life Zone"
  caption above.
- Scale markers: `0.8 · Weak · Balanced · Strong · 1.2`.
- A regime pill underneath: "Too Weak - No Binding" / "Optimal - Stable Matter" /
  "Too Strong - Runaway Fusion".
- Precision summary: "Deviation from optimal: X.XXX · Tolerance: ±0.02 (NN% of
  maximum allowed)".

This is **the proof-of-concept that the GoldilocksSlider could become draggable**.
It's also the only file in the repo that demonstrates a working pointer-event
slider with a labelled "Our Universe" marker. The hi-fi `GoldilocksSlider` should
inherit its drag affordance and the "Our Universe" yellow line concept (in `--indigo`
or `--goldilocks` rather than yellow).

### StarFormationRateVisual.tsx — four-era card grid + timeline bar
A two-row composition for Chapter 03 (Starlight):

1. **Factory Status Header** — pulsing dot, "Universe Factory Settings", current
   `starFormationRate` + efficiency (`min(100, rate × 50)%`).
2. **Cosmic Star Formation History** — a horizontal `from-purple-900 via-blue-600
   to-orange-500` gradient bar with markers (13.8 Gya · Peak · Today) and a moving
   white indicator at `((rate - 0.1) / 1.9) × 100%`. Subtext: `"{(13.8 - rate ×
   5).toFixed(1)} Gya — Peak / Post-Peak Era"`.
3. **Era Cards Grid** — four lucide-iconed cards (MoonStar / Sparkles / Sun /
   Globe), each labelled with name, rate (0.1x / 0.5x / 1.5x / 1x), and
   single-word status (Dormant / Startup / Peak / Standard). Active card
   highlighted by white/10 bg + `scale-105`.

Two functions: `eras[]` (Dark Ages 0–0.3, First Light 0.3–0.7, Modern 0.7–1.3, Peak
>1.3) and `getFactoryStatus()` (Shutdown ≤0.2, Maintenance ≤0.6, Standard ≤1.1,
High Demand ≤1.6, Emergency >1.6).

Note an off-by-one inconsistency: `currentEra` is set to 3 for "Modern" (0.7–1.3)
and 2 for "Peak" (>1.3) — i.e. Peak is shown as index 2 (third card) but the cards
are laid out left-to-right Dark Ages → First Light → Peak → Modern, which puts
Peak in the third slot. So the layout works, but the labelling logic is fragile.

### MetallicitySpectrumVisual.tsx — stellar spectrum with absorption lines
A controlled-component star selector for the "select target star" UX in the
Matter / Starlight section. Three pieces:

1. **Star visualization** (h-48) — gradient-tinted disc, 30 background stars,
   "Rocky Planets" indicator (`metallicity > 0.01`) or "No Planets" (×) badge in
   top-right.
2. **Star selector grid** — list of `starOptions` buttons, each a row showing
   label, description, `[Fe/H]` percentage. Active row highlighted blue-600/30.
3. **Spectrum analysis bar** (h-12) — gradient spectrum with five wavelength
   labels (400–800nm) and animated absorption lines (`H` always, `Fe` >0.0003,
   `Ca` >0.0005, `Mg` >0.001, `Si`+`C` >0.005). Element pills below with the same
   color coding.

Star temperature mapping by metallicity:

| metallicity      | temperature  | spectrum gradient       |
|------------------|--------------|-------------------------|
| <0.001           | 50,000K+     | blue-400 → white        |
| <0.005           | 15,000K      | blue-300 → yellow-200   |
| <0.015           | 7,000K       | yellow-300 → orange-200 |
| <0.03            | 5,800K       | yellow-200 → orange-300 |
| ≥0.03            | 4,500K       | orange-300 → red-400    |

Composition labels: Primordial gas clouds only / Ancient, metal-poor / Moderate
heavy elements / Solar-like composition / Super metal-rich.

### TimelineProbabilityVisual.tsx — proton-lifetime threshold bars
A six-bar threshold visualizer for the *proton stability* parameter (Chapter 02 /
Matter). Bars at `10²⁰`, `10²⁵`, `10³⁰`, `10³⁴` (threshold), `10³⁵`, `10⁴⁰`. The
key editorial line: **"Threshold parameter — longer is equally good"**. This is
the only place in the site where a parameter is explicitly framed as a *minimum*
rather than a Goldilocks band.

Two exports — desktop variant (`flex items-end`, h-32) and mobile variant
(`grid grid-cols-6`). Both compute `currentRange` as the closest range to the
current `lifetime`. `isLifeViable = lifetime >= 34`.

Consequence labels (desktop): Immediate collapse · No complex atoms · Stars die
early · Threshold reached · Equally good · Equally good.

### ImprobabilityCascadeVisuals.tsx — tabbed four-card "improbability tour"
The most verbose file in this set. A tabbed exploration card with four panels
(Order vs Chaos / Dark Energy / Universe Shape / Temperature), each with its own
canvas visualization plus a "What's the problem?" explanatory paragraph above.

- **Penrose entropy** — entropy points scattered on a 1-in-10¹⁰⁰⁰⁰⁰⁰⁰⁰⁰⁰⁰⁰⁰⁰ grid;
  one highlighted "our universe" dot.
- **Cosmological constant** — Λ on a log scale, with markers at observed (≈10⁻¹²²)
  and theoretical (≈1).
- **Flatness** — three 3D-rendered surfaces (flat plane / sphere / saddle)
  proportional to `density` slider; same surface set as `UniverseGeometry3D`, but
  drawn in 2D canvas with hand-rolled isometric projection.
- **Horizon/CMB** — two distant patches with a temperature differential, showing
  the horizon problem.

This file duplicates `UniverseGeometry3D` content in 2D canvas form.

### SimpleImprobabilityVisuals.tsx — simpler counterparts
The "Simple" prefix here mirrors `SimpleMatterVisuals` — these are the lo-fi /
mobile / fallback alternates to `ImprobabilityCascadeVisuals`. Four canvas viz:

- `SimplePenroseVisual` — one grid of dots with one bright "our universe" pixel.
- `SimpleDarkEnergyVisual` — Λ ladder with marker.
- `SimpleFlatnessVisual` — elaborate hand-rolled isometric helpers for flat/
  spherical/saddle surface drawing in pure 2D canvas (the most complex section of
  this file).
- `SimpleHorizonVisual` — two CMB-style patches with a thermal gradient.

Same data as `ImprobabilityCascadeVisuals`, but flatter / faster / no tab UI.

---

## 2. The redesign decision matrix

For each of the nine files, the redesign must pick one of three fates:

| File                              | Fate options                                                                 | Recommendation |
|-----------------------------------|------------------------------------------------------------------------------|----------------|
| UniverseGeometry3D.tsx            | (a) Keep as a chapter visualization for a future "Universe shape" chapter, (b) absorb into `ChapterVisuals` as a lighter 2D version, (c) retire | **(b)** — the cinematic slot prefers seeded 2D canvas; Three.js is overweight for a single overlay. Keep the math; drop the Canvas. |
| QuarkBindingVisual.tsx            | (a) Promote to Chapter 02's primary visualization (replacing/augmenting `ProtonViz`), (b) keep as in-section "deep dive" widget, (c) retire | **(a)** — closest in tone to a hi-fi chapter visual. The three-regime narration is the single best per-chapter teaching beat. |
| SimpleMatterVisuals.tsx (×4)      | (a) Keep one or two as supporting widgets after the chapter visualization, (b) retire all | **(b)** — duplicates QuarkBinding + ImprobabilityCascade. Salvage the bar-chart concept for "force hierarchy" as a static SVG. |
| EnhancedStrongForceSlider.tsx     | (a) Generalize as `<DraggableGoldilocksSlider />` and use everywhere, (b) keep specific to Chapter 02 | **(a)** — single biggest UX upgrade available. Lift the pointer code + "Our Universe" marker into the hi-fi `GoldilocksSlider`. |
| StarFormationRateVisual.tsx       | (a) Keep as Chapter 03 supplementary block, (b) absorb into `FirstStarViz`, (c) retire | **(b)** — fold the four-era timeline into the FirstStarViz reveal as a single horizontal timeline. The four cards repeat data already in the prose. |
| MetallicitySpectrumVisual.tsx     | (a) Keep as Chapter 03's interactive selector, (b) retire | **(a)** — this is one of the only places in the site with a *real* taxonomy (Population III/II/I, [Fe/H], Bedin I/Methuselah/Sun). Worth preserving as a Chapter 03 deep-dive panel even if the cinematic visualization stays minimal. |
| TimelineProbabilityVisual.tsx     | (a) Keep as Chapter 02 supplementary block, (b) retire | **(a)** — the "threshold parameter, longer is equally good" line is editorially valuable. The `GoldilocksSlider` is wrong for *thresholds*; this widget fills the gap. |
| ImprobabilityCascadeVisuals.tsx   | (a) Promote as a standalone "improbability tour" page, (b) split contents across Chapters 01/04, (c) retire | **(b)** — the four panels each belong to a different chapter (Penrose ↔ Ch.1, Λ ↔ Ch.1, Flatness ↔ a future Ch.0, Horizon ↔ Ch.1). The tabbed container is the wrong shell. |
| SimpleImprobabilityVisuals.tsx    | (a) Mobile variants of the above, (b) retire | **(b)** — once ImprobabilityCascade is broken up, the "Simple" pair is moot. Keep `SimpleFlatnessVisual` if no Three.js shape viz survives. |

---

## 3. Design tokens to honor when these are kept

All of these widgets were authored before the `hifi.css` token system existed.
Their palettes lean Tailwind (`bg-black/30`, `border-white/10`, `text-gray-300`).
A redesign that keeps any of them should re-skin:

- `bg-black/30` → `--surface-panel`
- `border-white/10` → `--hair`
- `text-white` head → `--ink`
- `text-gray-300/400` → `--ink-soft` / `--ink-faint`
- The `from-X-500 to-Y-600` gradient backdrops → either replace with a single
  `--indigo` washed tone or remove
- shadcn `<Slider>` → `<GoldilocksSlider>` (controlled variant once draggable)

Typography: replace the implicit `font-sans` for headings and `font-mono` for
numeric readouts with the hi-fi ladder (`Unbounded` for chapter marks, `Space
Grotesk` for body, `Space Mono` for readouts, `Newsreader` for ghost prose). Match
the existing brief-level tokens.

---

## 4. UX patterns common across all nine that should survive

1. **Three-regime framing.** Almost every widget categorises the current state as
   one of three labelled bands (too weak / optimal / too strong; collapse /
   threshold / sufficient; weak / balanced / strong). This is the rhetorical
   chassis of the whole site — keep it.
2. **"Our Universe" markers.** `EnhancedStrongForceSlider` is the only widget that
   actually labels the canonical position; every chapter would benefit from a
   small "● Our Universe" tick alongside the slider knob.
3. **Active-element scale + ring.** The "active" card gets `scale-105` plus a
   white-tinted border in `StarFormationRateVisual`, `MetallicitySpectrumVisual`,
   and `TimelineProbabilityVisual`. Keep this affordance, retoken the colors.
4. **Animated dots / pulses to indicate liveness.** All widgets that have a "current
   status" use a `motion.div animate={{ scale: [1, 1.2, 1] }} repeat: Infinity` dot.
   In the hi-fi rewrite the equivalent is the slow `consciousness-pulse` /
   starfield twinkle. Re-skin, but keep the affordance.
5. **Numeric readouts in mono.** All widgets show one or two `font-mono`
   numeric readouts (rate, [Fe/H], deviation). The hi-fi ladder reserves
   `Space Mono` for the same role.

## 5. UX patterns common across all nine that should NOT survive

- **Emoji status labels** (🤖, 🏝️, ❌, ⚠️, ⏳, ✅). The hi-fi shell does not use
  emoji anywhere. Replace with hair-line glyphs or `.mono` short labels.
- **lucide-react icons.** Same — the hi-fi shell does not import lucide. Replace
  with text labels or SVG hair glyphs.
- **Gradient backplates** (`from-X-900 to-X-700`). Replace with a single
  `--surface-panel` tone.
- **"Educator mode" panels with four `<strong>X:</strong>` paragraphs.** This is a
  consistent pattern across the legacy lo-fi files but the hi-fi `ChapterFrame`
  has no slot for it. Either drop, or surface as a single-line "learn more →" that
  expands.
- **Inline `<style jsx>` keyframes.** Move the named animations into `hifi.css`
  with `prefers-reduced-motion` overrides.

## 6. Specific math/edge-case notes worth preserving

- `UniverseGeometry3D`: flat threshold `|density - 1| < 0.005`; curvature multiplier
  `min((density - 1) * 3, 1.5)` (closed) or `min((1 - density) * 3, 1.5)` (open).
- `QuarkBindingVisual`: optimal `0.98 ≤ αs ≤ 1.02`; `bindingEnergy = αs² × 8.5
  MeV/nucleon`; `protonStability = exp(-|αs-1|×10)`.
- `EnhancedStrongForceSlider`: track gradient stops `0%/20% (blue) → 45%/55% (white)
  → 80%/100% (red)`; "Our Universe" line at `((1.0 - 0.8) / 0.4) × 100% = 50%`;
  Life Zone span `((1.02 - 0.98) / 0.4) × 100% = 10%`.
- `StarFormationRateVisual`: era bins `[≤0.3 dark, ≤0.7 first-light, ≤1.3 modern,
  >1.3 peak]`; factory status bins `[≤0.2 shutdown, ≤0.6 maint, ≤1.1 standard,
  ≤1.6 high-demand, >1.6 emergency]`.
- `MetallicitySpectrumVisual`: rocky-planet threshold `metallicity > 0.01`;
  absorption-line gates `H always, Fe >0.0003, Ca >0.0005, Mg >0.001, Si/C
  >0.005`.
- `TimelineProbabilityVisual`: threshold `lifetime ≥ 34` (i.e. proton lifetime
  ≥ 10³⁴ years); bins at exponents 20/25/30/34/35/40.

These constants encode the actual physics framing of the site. The redesign
should not change them without consulting the source-of-truth (the original
section files / the editorial reviewer).

---

## 7. Quick recommended dispositions, in priority order

1. **Lift `EnhancedStrongForceSlider`'s drag + "Our Universe" marker into
   `GoldilocksSlider`.** This is the single highest-leverage change in the nine
   files. Then deprecate the bespoke component.
2. **Break up `ImprobabilityCascadeVisuals`.** Move Penrose + Λ + Horizon into
   Chapter 01's prose; move Flatness into a future chapter or a Landing aside;
   retire the tab UI.
3. **Promote `QuarkBindingVisual` to Chapter 02's cinematic visualization** —
   replacing the more diagrammatic `ProtonViz`. The three-regime overlay is the
   right level of cinematic.
4. **Fold `StarFormationRateVisual` into `FirstStarViz`** as a horizontal era
   timeline beneath the cinematic star ignition.
5. **Keep `MetallicitySpectrumVisual` and `TimelineProbabilityVisual` as
   per-chapter "deep dive" cards** opened from a small hair-line button in the
   chapter footer (next to the `scroll-cue`).
6. **Retire `SimpleMatterVisuals` + `SimpleImprobabilityVisuals` + the
   `UniverseGeometry3D` Three.js canvas.** Keep the data/math; drop the canvas
   implementations.

Once those six steps land, the section/ folder's "second-tier viz" concern
collapses from nine files to one (`MetallicitySpectrumVisual`) plus one widget
(`TimelineProbabilityVisual`), with the rest absorbed into the hi-fi chapter
visualizations or the upgraded `GoldilocksSlider`.
