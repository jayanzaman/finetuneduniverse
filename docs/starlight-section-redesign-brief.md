# Redesign Brief: "First Light" Section (Chapter 03)

**File:** `src/components/universe-builder/sections/StarlightSection.tsx`
**Companion visuals:** `MetallicitySpectrumVisual.tsx`, `StarFormationRateVisual.tsx` (`StarField` is defined locally inside `StarlightSection.tsx`)
**Wrapped by:** `src/components/hifi/ChapterFrame.tsx` (provides the hero title, intro prose, primary Goldilocks slider, ghost panel, prev/next footer — the redesign should focus on the *inner* educational interactive, embedded via `<div className="hifi-section-embed">`)

## Section purpose

"First Light" is **Chapter 03 of 7** in a cinematic, scroll-driven cosmology explorer. The era it represents is **~200 million years after the Big Bang**. The frame copy reads: *"For two hundred million years, the cosmos drifts dark and cool. Then a cloud of hydrogen, denser than the rest, falls inward under its own weight. Pressure climbs. At fifteen million kelvin, fusion ignites — and for the first time in the history of everything, there is light."*

Inside the chapter frame, the user gets **three** interactive parameter cards. Unlike the previous chapters, one of them is not a slider but a **catalog selector**: the user picks a real, observed star from a curated list, and the visualization adapts. The other two are sliders with Goldilocks bands. There is also a unique **time-lapse mode** that auto-animates the formation-rate parameter through cosmic history.

Like Chapter 02, there is **no cross-parameter scoring or aggregate outcome string** — each parameter stands alone. The unifying theme is *the moment of first light*: what conditions actually delivered it, and what would have prevented it.

## Existing UX patterns to honor

- **Mobile**: one-card-at-a-time stepper, `currentStep` index 0–2, swipe/buttons between them. Dot indicators show position.
- **Desktop**: 3-column grid of parameter cards, each with its own visualization, value, control, and (when educator mode is on) lesson panel.
- **Educator mode** toggle reveals long-form lesson per parameter.
- **Goldilocks band** rendered as a translucent green overlay on the slider track (for the two slider parameters only — metallicity uses a discrete picker).
- **Status text** beneath the StarField visualization changes with stellar mass: "💀 Brown Dwarf — No Fusion" / "Dying Red Dwarf" / "Stable Main Sequence" / "Blue Supergiant" / "💥 Supernova Imminent!" etc.
- **Time-lapse mode**: a toggle that animates `starFormationRate` along a real cosmic-history curve (Dark Ages → First Light → Peak Era → Post-Peak → Modern Era). Preserves a sense of *when* in cosmic history the rate matched the Goldilocks band.
- **Randomize event**: listens for a global `randomizeUniverse` window event and re-rolls every parameter (re-rolls the mass slider, picks a random star, re-rolls the formation rate).

## Visual design system already in place (don't fight it)

- Palette: `--void: #030308`, `--indigo: #7A7BFF`, `--goldilocks: #6FE4B1`, ink ladder, hair lines.
- Fonts: `Unbounded` (display), `Space Grotesk` (body), `Space Mono` (mono/labels), `Newsreader` (serif italic accents).
- Signature control: `GoldilocksSlider` in `src/components/hifi/`. Reuse its visual language (zone band, knob, fail-mode caps left/right) for the inner-section sliders.
- Backdrop is already a fixed cosmic gradient + seeded starfield + grain — keep parameter cards on translucent/glassy surfaces so the cosmos shows through.

---

## The three parameters — detailed specs

### 1. Stellar Mass — *"First Generation Stars"*

- **Question shown:** "Mass of first-generation stars (in solar masses)"
- **State var:** `stellarMass`, default `1`, range `0.1 → 2`, step `0.1`, unit `M☉` (solar masses).
- **Goldilocks band:** `0.8 – 1.4 M☉`.
- **Outside-band fates:**
  - **Below 0.8 M☉:** can't sustain fusion. Becomes a dim red dwarf or brown dwarf. "No energy for complex chemistry."
  - **Above 1.4 M☉:** burns too fast and explodes as a supernova within millions of years. "No time for life to evolve."
- **Current visual (`StarField`, defined inline at the top of the file):** the strongest visualization in the chapter. The star *changes its life trajectory* based on slider value:
  - **Too dim (< 0.8):** star shrinks, dims, flickers; below 0.5 M☉ it sheds *dying embers*. Status text shifts through "💀 Brown Dwarf" → "Dying Red Dwarf" → "⚠️ Insufficient Mass".
  - **Optimal (0.8–1.4):** stable yellow-white pulsing star. A **protoplanetary disk** appears around it. With enough metallicity (next parameter), planetesimals seed, a dashed-green **habitable-zone ring** appears, and 1–3 *proto-planets* coalesce. Heavy-element labels (C, O, Si, Fe) orbit at varying radii. Status text: "Stable Main Sequence".
  - **Too massive (> 1.4):** star inflates, color shifts yellow → blue-white → red. Above 1.7 M☉ a *supernova ring* of 8 expanding particles erupts. Status text: "Massive & Unstable" → "Blue Supergiant" → "💥 Supernova Imminent!".
- **Lesson highlights to surface:**
  - **Critical mass range:** 0.8–1.4 solar masses for **stable hydrogen fusion lasting billions of years**.
  - Too small = stellar death (brown dwarf / red dwarf, no fusion).
  - Too massive = stellar explosion within millions of years, no time for life.
  - The narrow window is what makes *planetary systems and life* possible.
- **Redesign cues:** This is the single best visualization in the whole site. The "dying → stable + planetary system → exploding" transition is a cinematic three-act story compressed into one slider. **Make this the chapter's hero piece.** Consider a focused-view modal where the StarField fills the canvas, the protoplanetary disk renders at proper scale, and the supernova at the high end is genuinely explosive. The status text could be elevated from a small caption into a real diegetic label — "Sol-type, 5 billion years of fusion left" / "supernova in ~7 million years" — to give the user a felt sense of time.

### 2. Metallicity — *"Heavy Element Content"*

- **Question shown:** "Fraction of heavy elements in stellar composition"
- **NOT a slider — a catalog selector.** State var: `selectedStar` (string key). The metallicity is read from a `stellarDatabase` keyed by the selection.
- **The six stars in the catalog (all real, observed objects):**

  | Key | Name | Nickname | Z (metals) | Distance | Age | Type |
  |---|---|---|---|---|---|---|
  | `popiii` | Population III | First Stars (Theoretical) | 0.00001 | ∞ ly | 13.7 Gyr | Population III Primordial |
  | `hd140283` | HD 140283 | "Methuselah Star" | 0.0004 | 190 ly | 14.5 Gyr | Population II Halo |
  | `tauceti` | Tau Ceti | Metal-Poor Neighbor | 0.008 | 11.9 ly | 5.8 Gyr | Population II Disk |
  | `sun` | Sun (Sol) | Solar Standard | 0.02 | 0 ly | 4.6 Gyr | Population I Disk |
  | `muleo` | μ Leonis | Metal-Rich Giant | 0.04 | 133 ly | 2.5 Gyr | Population I Enriched |
  | `galcenter` | Sgr A* Region | Galactic Core Stars | 0.08 | 26,000 ly | 1.0 Gyr | Super Metal-Rich |

- **Optimal:** `Sun (Z = 0.02) — Solar Standard`.
- **Current visual (`MetallicitySpectrumVisual`):** lives in its own file. Shows an absorption-line spectrum for the chosen star, plus star name, nickname, and type. The selector itself is rendered *inside* the visual component (the visual receives `selectedStar`, `onStarChange`, and the full `starOptions` array as props).
- **Lesson highlights to surface:**
  - Stars need **~2% heavy elements** to form **rocky planets**. First stars (Population III) had zero metals — only hydrogen and helium.
  - **Stellar nucleosynthesis:** stars forge heavy elements in their cores and scatter them on death. Each generation enriches the galaxy.
  - **Planet formation threshold:** below 1% metallicity, rocky planets can't form. Above 4%, gas giants migrate inward and destroy terrestrial worlds.
  - HD 140283 ("Methuselah") is *older than the universe itself* by some measurements — a teachable mystery.
  - Population III is theoretical — never directly observed.
- **Redesign cues:** This is the most *editorially rich* parameter card in the site — six real observed stars, each with its own backstory. The card deserves a **museum-exhibit** treatment: a row of six small star-portraits along the bottom of the card, each clickable, with the selected one expanding to fill the main area with its spectrum, name in display type, biographical caption ("Born when the Milky Way was 0.3 Gyr old. Still burning."). Consider a real spectrum rendering (absorption lines positioned at correct wavelengths) rather than the current rainbow gradient. The "rocky planet possible / impossible" verdict for the current selection deserves a strong visual cue. The fact that this parameter is *not a continuous slider* should be celebrated, not hidden — it's the moment where the user steps from "imaginary knobs" into "look at the actual catalog of stars in our sky."

### 3. Star Formation Rate — *"Stellar Birth Rate"*

- **Question shown:** "Rate of stellar birth in early galaxies"
- **State var:** `starFormationRate`, default `1`, range `0.1 → 2`, step `0.1`, unit `M☉/yr`.
- **Goldilocks band:** `0.8 – 1.5 M☉/yr`.
- **Outside-band fates:**
  - **Too low:** not enough heavy elements get cycled back; rocky planets undersupplied.
  - **Too high:** destructive stellar winds and supernovae disrupt planet formation.
- **Current visual (`StarFormationRateVisual`):** lives in its own file. Visualizes stellar density and interactions as the rate changes.
- **Special feature — Time-lapse mode:**
  - Toggle `isTimeLapseActive` plus a `currentCosmicAge` clock starting at 13.8 Gyr (Big Bang) and counting down toward today.
  - Auto-updates `starFormationRate` along a real cosmic-history curve:
    - `> 13.0 Gyr ago` → 0.1 M☉/yr (Dark Ages)
    - `13.0 → 11.0` → 0.5 (First Light)
    - `11.0 → 8.0` → 1.5 (Peak Era)
    - `8.0 → 4.6` → 1.2 (Post-Peak)
    - `4.6 → 0` → 1.0 (Modern Era)
  - Updates every 500ms, decrementing the age by 0.2 Gyr per tick.
  - Loops back to 13.8 Gyr when it reaches 0.
- **Lesson highlights to surface:**
  - **Goldilocks formation:** 0.8–1.5 M☉/yr in local regions.
  - **Cosmic history:** star formation **peaked ~10 billion years ago**, then declined. We live in the optimal era for complex chemistry and stable systems.
  - **Stellar feedback:** high formation rates create disruptive stellar winds and SNe; low rates starve the galaxy of metals.
- **Redesign cues:** the **time-lapse mode is a real gem** — preserve and elevate it. Consider rendering the cosmic-history curve as a small inline chart with a moving playhead, so the user *sees the value tracing the universe's actual history* as it animates. The five eras (Dark Ages → First Light → Peak → Post-Peak → Modern) could be labeled along the chart. A cinematic mode that lets the user "play" the universe's star-formation history end to end, ~6.5 seconds runtime, is a magic-moment opportunity. The card itself could double as a **mini timeline** independent of the chapter rail.

---

## Special feature: Time-Lapse Cosmic Animation

This chapter is the only one with a built-in **playable timeline animation**:

```
const cosmicEras = [
  { age: ">13.0 Gyr", rate: 0.1, label: "Dark Ages" },
  { age: "13.0–11.0",  rate: 0.5, label: "First Light" },
  { age: "11.0–8.0",   rate: 1.5, label: "Peak Era" },
  { age: "8.0–4.6",    rate: 1.2, label: "Post-Peak" },
  { age: "4.6–0",      rate: 1.0, label: "Modern Era" },
];
```

- Driven by `setInterval` every 500ms while `isTimeLapseActive` is true.
- `currentCosmicAge` decreases by 0.2 Gyr per tick (universe ages forward in time, but the readout counts how long ago).
- Resets to 13.8 Gyr (Big Bang) and stops animation when it reaches 0.
- This is a strong UX element worth preserving and dramatizing in the redesign — possibly as a chapter-level "play the era" button rather than something buried inside one card.

---

## What the redesign should preserve vs. reimagine

**Preserve (logic / API):**
- All 3 parameters with their exact ranges, defaults, units, and Goldilocks bands.
- The full `stellarDatabase` of six real observed stars (Population III through Sgr A* Region) with their metallicity, distance, age, type, and nickname strings.
- The status-text ladder under `StarField` (Brown Dwarf / Red Dwarf / Main Sequence / Blue Supergiant / Supernova).
- The protoplanetary-disk + habitable-zone + proto-planet sub-system that appears only when *both* stellar mass is optimal AND metallicity is high enough — this cross-parameter visual coupling is the chapter's quiet payoff.
- The **time-lapse cosmic-history animation** and its five-era curve.
- The `randomizeUniverse` window event listener.
- `educatorMode` prop (boolean) controlling lesson visibility.
- Embedded-inside-ChapterFrame layout (don't add another hero / title / outer chrome — the frame provides it).
- Mobile stepper / desktop 3-up grid (or a cleaner equivalent).
- The conceptual distinction between Metallicity (discrete catalog) and the other two (continuous sliders).

**Reimagine (visual / interaction):**
- Card chrome — current shadcn Cards feel generic; this section deserves the hi-fi treatment.
- `MetallicitySpectrumVisual` could become genuinely scientific: real absorption-line positions, a small spectrum-by-star comparator. The selector itself deserves a museum-row treatment with portraits/glyphs for each star.
- `StarFormationRateVisual` is the weakest of the three visualizations and the time-lapse mode is buried — consider promoting the cosmic-history curve to the centerpiece.
- The current `StarField` planetary-system overlay (orbiting C/O/Si/Fe labels, dashed green HZ ring, proto-planet dots) is a clever idea but visually busy. It deserves a typographic and compositional pass: fewer, larger elements, with the heavy-element labels rendered in a labelled-orbit style rather than as scattered chips.
- Status indicators ("💀 Brown Dwarf — No Fusion", "💥 Supernova Imminent!") use emoji + caps; the hi-fi voice would prefer something quieter and more reverent (a small mono caption: *"insufficient mass · no fusion"*).
- Educator content currently uses small blue text in flat panels — treat it as editorial sidebars with proper hierarchy.
- Consider promoting the time-lapse animation to a chapter-level feature: play the universe's star-formation history end-to-end, with eras named, while the StarField transitions through dim → bright → stable.

**Tone to aim for:** Brian Cox's *Wonders of the Universe* meets *The New York Times* interactive features — meditative, precise, slightly reverent. Not gamey, not playful-cartoon, not utilitarian-dashboard. The emotional beat of this chapter is *the first photon* — "for the first time in the history of everything, there is light." Each parameter card should feel like a quiet act of homage to the conditions that delivered that photon.
