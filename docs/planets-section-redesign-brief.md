# Redesign Brief: "The Goldilocks Zone" Section (Chapter 05)

**File:** `src/components/universe-builder/sections/PlanetsSection.tsx`
**Companion visuals:** none — all three visualization components (`WaterStateVisual`, `MagneticFieldVisual`, `PlanetarySystem`) are defined inline at the top of the file.
**Wrapped by:** `src/components/hifi/ChapterFrame.tsx` (provides the hero title, intro prose, primary Goldilocks slider for **Orbital distance · AU**, ghost panel, prev/next footer — the redesign should focus on the *inner* educational interactive, embedded via `<div className="hifi-section-embed">`)

## Section purpose

"The Goldilocks Zone" is **Chapter 05 of 7** in a cinematic, scroll-driven cosmology explorer. The era it represents is **~9.2 billion years after the Big Bang · 4.6 Bya**. The frame copy reads: *"A young star, a settling disc, a rocky world finds one band of orbit where water can be water. Move it inward by a tenth — the oceans boil. Move it outward by a tenth — they freeze forever. The band is narrower than the orbit itself."*

Inside the chapter frame, the user gets **four tunable parameters** that together determine whether a rocky planet is habitable. Unlike most chapters, **all four parameters feed into the same three visualizations simultaneously** — this is the first chapter where *cross-parameter coupling* is the explicit point. Drag any slider and the planetary system, the water-state diorama, and the magnetic-field shield all update at once.

Like Chapters 02–04, there is no aggregate outcome string. Instead, each visualization has its own state ladder (vapor → liquid → ice → atmosphere-lost → crushing-pressure, etc.) and the user reads "habitability" from the gestalt of all three.

## The defining feature of this chapter

**Mass–atmosphere coupling.** A planet with mass below 0.3 Earth-masses cannot hold a thick atmosphere — its effective pressure collapses to 20% of whatever the user sets:

```ts
useEffect(() => {
  const canRetainAtmosphere = planetMass >= 0.3;
  const effectivePressure = canRetainAtmosphere ? basePressure : basePressure * 0.2;
  setAtmosphericPressure(effectivePressure);
}, [planetMass, basePressure]);
```

This is the one place in the entire site where two parameters are *physically coupled* — so adjusting one slider silently changes the effective value of another. The redesign should preserve this and probably *surface it more visibly*: when a low-mass planet is selected, the atmospheric-pressure slider should visually communicate "you set X but the planet retains 0.2X."

## Existing UX patterns to honor

- **Mobile**: a 3-step carousel where the **visualization** rotates between Planetary System / Water State / Magnetic Field, but **all four sliders are always visible** below the visualization (a compact stack with embedded green Goldilocks bands).
- **Desktop**: 4-column layout (`md:grid-cols-2 xl:grid-cols-4`): one card holds all four sliders ("Habitability Controls"), and three further cards each host one of the visualizations.
- **Educator mode** toggle reveals long-form lesson tied to the currently-active step on mobile (or per-card on desktop).
- **Goldilocks bands** rendered as translucent green overlays on each slider track.
- **Live mini-readouts** beneath each slider showing current value with unit: `1.0 AU`, `1.0 M⊕`, `1.00 atm`, `50 μT` (note: magnetic field is displayed as `magneticField × 50` μT).
- **Status text** inside each visualization changes color and copy based on the current state (e.g. magnetic field: "No Protection" → "Weak Field" → "Developing" → "Protected" → "Strong Field" → "Radiation Hazard").
- **Randomize event**: the global `randomizeUniverse` event re-rolls all four parameters across their full ranges.

## Visual design system already in place (don't fight it)

- Palette: `--void: #030308`, `--indigo: #7A7BFF`, `--goldilocks: #6FE4B1`, ink ladder, hair lines.
- Fonts: `Unbounded` (display), `Space Grotesk` (body), `Space Mono` (mono/labels), `Newsreader` (serif italic accents).
- Signature control: `GoldilocksSlider` in `src/components/hifi/`. Reuse its visual language (zone band, knob, fail-mode caps left/right) for the four sliders here.
- Backdrop is already a fixed cosmic gradient + seeded starfield + grain — keep parameter cards on translucent/glassy surfaces so the cosmos shows through.

---

## The four parameters — detailed specs

### 1. Orbital Distance — *"Goldilocks Zone"*

- **Question shown:** "Distance from star affects temperature"
- **State var:** `orbitalDistance`, default `1`, range `0.1 → 5`, step `0.05`, unit `AU`.
- **Goldilocks band:** `0.9 – 1.1 AU` (very narrow — "narrower than the orbit itself").
- **Slider caps:** `Hot` (left) / `Cold` (right).
- **Temperature formula:** `T_K = 278 / √(d_AU)` → `T_°C = T_K − 273`. So Earth at 1 AU gives ≈ 5°C base (the educator copy claims "~15°C average" which assumes greenhouse warming on top of the bare blackbody temp).
- **Failure regimes:**
  - **< 0.9 AU:** runaway greenhouse, water boils to vapor (temp > 100°C).
  - **> 1.1 AU:** snowball, water freezes (temp < −10°C). The chapter frame says: *"Push the orbit out by 10% — Earth ices over for good. Snowball planet, locked in white forever. No reset switch."*
- **Visualizations it drives:** Planetary System (planet position relative to habitable-zone ring), Water State (temperature determines vapor / liquid / ice branch).
- **Lesson highlights to surface:**
  - The Goldilocks zone is "where liquid water can exist — not too hot, not too cold."
  - Inverse-square law: planets closer to the star receive more energy.
  - Earth at 1 AU = ~15°C average (with greenhouse).
- **Redesign cues:** This is the chapter's *named* parameter — the entire chapter title is its name. The visualization should make the **band's narrowness viscerally felt**: a habitable-zone ring rendered at proper proportions around the host star, the planet sliding inward and outward, the ring's thickness visibly thin compared to the orbital radius. Consider a temperature gauge alongside that crosses 100°C and −10°C thresholds with audible/visual snaps as the water phase changes.

### 2. Planet Mass — *"Atmospheric Retention"*

- **Question shown:** (no explicit subtitle on mobile — it's just listed under Habitability Controls)
- **State var:** `planetMass`, default `1`, range `0.01 → 10`, step `0.05`, unit `M⊕` (Earth masses).
- **Goldilocks band:** `0.8 – 1.3 M⊕`.
- **Slider caps:** `Small` (left) / `Large` (right).
- **Failure regimes:**
  - **< 0.3 M⊕:** **gravity too weak to retain atmosphere.** Effective atmospheric pressure collapses to 20% of `basePressure`. This is the **Mars regime** — even if the user cranks the pressure slider, the planet can't hold it.
  - **> 1.3 M⊕:** super-Earth / mini-Neptune territory. The current code doesn't penalize high mass as harshly as low mass, but the Goldilocks band caps at 1.3.
- **Visualizations it drives:** Planetary System (planet size scales with mass), Water State ("Atmosphere Lost" branch fires when mass too low).
- **Lesson highlights to surface:**
  - Low-mass planets can't retain thick atmospheres — explicit Mars analogy.
  - **Mass-atmosphere coupling**: "Watch how changing planet mass automatically affects atmospheric pressure."
- **Redesign cues:** The coupling with atmospheric pressure is the chapter's most interesting interaction and currently invisible — the user has to read the educator panel to realize the pressure slider isn't doing what they think. **Make this coupling explicit in the UI**: when mass < 0.3, render a ghost handle on the pressure slider at the "effective" value, with a hairline annotation ("retained: 0.2× set value"). Consider rendering the planet's escape velocity vs. atmospheric molecule velocity as a small inline graph.

### 3. Atmospheric Pressure — *"Surface Atmosphere"*

- **Question shown:** (no explicit subtitle)
- **State var:** `basePressure`, default `1`, range `0 → 10`, step `0.02`, unit `atm`. The *effective* value (`atmosphericPressure`) is derived from `basePressure` and `planetMass`.
- **Goldilocks band:** `0.8 – 1.2 atm`.
- **Slider caps:** `Vapor` (left) / `Crush` (right).
- **Failure regimes:**
  - **Very low effective pressure:** water boils at lower temperatures, oceans evaporate. Status: "Water Boiling Away".
  - **Very high pressure:** Venus-like crushing surface. Status: "Crushing Pressure".
- **Visualizations it drives:** Water State (pressure determines whether liquid water is stable at the current temperature).
- **Lesson highlights to surface:**
  - Water phase diagram requires *both* temperature and pressure within a window.
  - Even at the right temperature, low pressure boils water (think Mt. Everest).
  - Even at the right pressure, high temperature evaporates.
- **Redesign cues:** A small inline **water phase diagram** (temperature × pressure with the liquid-water region shaded) with a live marker showing the current state would teach the physics far better than the current branching text labels. The user could even drag the marker directly on the phase diagram.

### 4. Magnetic Field — *"Atmospheric Protection"*

- **Question shown:** "Magnetic shield protects atmosphere from solar wind"
- **State var:** `magneticField`, default `1`, range `0 → 5`, step `0.05`, unit `μT` (displayed as `value × 50`, so the slider value 1.0 reads as "50 μT" — Earth's actual strength).
- **Goldilocks band:** `0.8 – 1.2` (i.e. 40 – 60 μT).
- **Slider caps:** `None` (left) / `Strong` (right).
- **Status ladder (from `getStatus()`):**

  | Value | Status | Subtext | Color |
  |---|---|---|---|
  | < 0.2 | No Protection | Atmosphere lost | red |
  | < 0.5 | Weak Field | Partial stripping | orange |
  | < 0.8 | Developing | Building protection | yellow |
  | 0.8 – 1.2 | Protected | Optimal shield | green |
  | 1.2 – 2.0 | Strong Field | Good protection | blue |
  | > 2.0 | Radiation Hazard | Field too intense | purple |

- **Visualization it drives:** Magnetic Field Visual only — a planet at the center surrounded by concentric ellipses representing field lines. Color, opacity, line count (3–10), and border thickness all scale with strength. Two special render modes: **no-field** mode renders solar-wind particles hitting the planet directly; **excessive-field** mode renders rotated purple radiation streaks.
- **Lesson highlights to surface:**
  - Too weak → Mars (atmosphere stripped by solar wind).
  - Too strong → Jupiter (radiation hazard for life on any moon).
  - Earth's ~50 μT field is "just right."
- **Redesign cues:** The current magnetic field visual is decent but reads as decorative. Consider a proper **dipole field-line rendering** with directional curves, plus an actual stream of solar-wind particles being deflected (or hitting the planet) based on field strength. The "Radiation Hazard" state at high strength is conceptually interesting (Jupiter's moons would be uninhabitable from radiation belts) and deserves its own visual idiom — perhaps showing the auroral region expanding from the poles to engulf the planet.

---

## Visualization architecture

Three coupled visualizations, each consuming all four parameters (`orbitalDistance`, `planetMass`, `atmosphericPressure`, `basePressure`, `magneticField`) — though some only use a subset internally:

### `PlanetarySystem`
- Renders the host star and the planet at its current orbital position.
- Shows the green habitable-zone ring at the optimal orbital distance.
- Planet size scales with `planetMass`.
- This is the *overview* visualization — the one most directly tied to the chapter's name.

### `WaterStateVisual`
- Computes temperature from orbital distance, retrieves effective pressure from the mass-atmosphere coupling, then branches into one of six states:
  - **Water Vapor Escaping** (temp > 100°C) — red, with floating particles
  - **Atmosphere Lost** (mass < 0.3) — red, particles
  - **Water Boiling Away** (pressure too low) — red, particles
  - **Water Frozen** (temp < −10°C) — cyan, snowflake icons
  - **Crushing Pressure** (pressure too high) — blue gradient
  - **Liquid Water** (all conditions met) — blue, droplet animation. The **only habitable state.**
- Status text shows the temp and pressure values diagnostically.
- This is the *verdict* visualization — the one that tells the user whether the configuration is habitable.

### `MagneticFieldVisual`
- Renders a stylized planet at center with concentric field-line ellipses.
- Three render branches: no-field (solar wind hits directly), normal-field (concentric ellipses), excessive-field (radiation streaks).
- Independent of the other three sliders.

---

## What the redesign should preserve vs. reimagine

**Preserve (logic / API):**
- All 4 state vars with their exact ranges, defaults, units, and Goldilocks bands.
- The **mass-atmosphere coupling effect** (the `useEffect` that derives `atmosphericPressure` from `basePressure` and `planetMass`).
- The temperature formula `T_°C = (278 / √d_AU) − 273`.
- The six-state branching of `WaterStateVisual` (vapor / atmosphere-lost / boiling / frozen / crushing / liquid).
- The six-level magnetic field status ladder.
- The `randomizeUniverse` window event listener.
- `educatorMode` prop (boolean) controlling lesson visibility.
- Embedded-inside-ChapterFrame layout (don't add another hero / title / outer chrome — the frame provides it).
- The pattern of "all four sliders always available + visualization rotates on mobile / shows all three on desktop."

**Reimagine (visual / interaction):**
- Card chrome — current shadcn Cards feel generic; this section deserves the hi-fi treatment.
- **Surface the mass-atmosphere coupling visually** — the silent transformation of the pressure slider is the chapter's most interesting interaction and it's invisible. A ghost handle, a hairline annotation, or a coupled-slider style treatment would all work.
- The three visualizations currently feel like three separate panels. Consider **one unified diorama** — a single planetary system rendering where: orbital position relative to a green band shows habitability zone; planet size reflects mass; an atmospheric haze layer scales with effective pressure; magnetic field lines wrap the planet with intensity matching the slider; and the "verdict" (liquid water / frozen / boiled / lost) renders as the surface texture of the planet itself. One picture, four sliders, one truth.
- Status text uses lucide icons and color-coded text (`text-red-300` etc.) — the hi-fi voice would prefer something quieter and more reverent. Consider mono captions: *"surface 87°C · ocean phase: vapor"* rather than a `<Wind>` icon plus "Water Vapor Escaping".
- The current WaterStateVisual uses six totally separate branching layouts — that's a lot of state machinery for what is fundamentally a phase diagram. A real phase-diagram visualization with a live marker would be more elegant and more educational.
- Educator content currently uses small blue text in flat panels — treat it as editorial sidebars with proper hierarchy.
- The Goldilocks ring around the star in `PlanetarySystem` is rendered as a plain dashed circle — give it proper visual weight (subtle `--goldilocks` glow, perhaps annotated with "0.95 – 1.37 AU · habitable" matching the chapter frame's slider unit string).
- The **Atmospheric Pressure** and **Magnetic Field** parameters don't have a distinct subtitle/title pattern matching the first two — clean up the naming so all four feel like equals.

**Tone to aim for:** Brian Cox's *Wonders of the Universe* meets *The New York Times* interactive features — meditative, precise, slightly reverent. Not gamey, not playful-cartoon, not utilitarian-dashboard. The emotional beat of this chapter is *the narrowness of the band* — the chapter frame already states it: *"the band is narrower than the orbit itself."* The redesign should make the user *feel* that narrowness in their hand — every slider should suggest the tiny margin for error, the cold or hot or airless or crushed fates waiting one notch away.
