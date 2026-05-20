# Redesign Brief: "A Darkness at the Heart" Section (Chapter 04)

**File:** `src/components/universe-builder/sections/GalacticHeartSection.tsx`
**Companion visuals:** none — everything is inline. The carousel images live in `/public/`:
- `/1. Proto-Galaxy Formation.png`
- `/2. Starburst Phase.png`
- `/3. Quasar Phase.png`
- `/4. Early Spiral Formation.png`
- `/Milkyway Galaxy Formation - Nature.jpg`
- (Phase 0 has no image — rendered as an empty-space placeholder)

**Wrapped by:** `src/components/hifi/ChapterFrame.tsx` (provides the hero title, intro prose, primary Goldilocks slider for **Central black hole mass · log₁₀ M☉**, ghost panel, prev/next footer — the redesign should focus on the *inner* educational interactive, embedded via `<div className="hifi-section-embed">`)

## Section purpose

"A Darkness at the Heart" is **Chapter 04 of 7** in a cinematic, scroll-driven cosmology explorer. The era it represents is **~1 billion years after the Big Bang**. The frame copy reads: *"Stars cluster. Dark matter coils invisibly around them. At every galactic center, a darkness with the mass of millions of suns sits and pulls. Around it, a hundred billion stars find a long, slow choreography — and you are born inside one of those orbits."*

**This section is structurally different from every other chapter in the site.** It has:
- **No sliders.**
- **No Goldilocks bands.**
- **No randomly-tunable parameters.**
- **No cross-parameter scoring.**

Instead, it is a **6-phase narrative carousel** of Milky Way evolution. The user steps through six discrete cosmic epochs via prev/next arrows or dot indicators. Each phase has a curated image, a name, an age range, a one-sentence description, an expanded `details` paragraph, and a `fineTuning` insight panel (only shown when `educatorMode` is on).

The fine-tuning argument is delivered editorially, one phase at a time, rather than via a knob. The chapter's actual *slider* — central black hole mass — lives at the `ChapterFrame` level, not inside this component. That separation is worth understanding before you redesign.

## Existing UX patterns to honor

- **Single visualization card** spanning the full width — no multi-column grid.
- **Carousel navigation**: prev/next arrows on the image, plus 6 dot indicators centered along the bottom. Active dot stretches into a pill shape.
- **Timeline strip** below (mobile) or overlaid (desktop) showing the user's progress along 13.8 Gya → Today, with four anchor legends: *Big Bang* / *Active Phase* / *Stabilization* / *Modern Era*.
- **Empty-state visual** for the Pre-Galactic Era (phase 0): a centered `∅` glyph inside a dim circle, captioned *"No Galaxy Structure / Primordial gas clouds only"* — preserves the idea that "before galaxies existed" is itself part of the story.
- **Phase info panel** below the image: phase name (large), age range (blue), one-sentence description.
- **Educator mode** reveals a "What's Happening" paragraph plus a yellow-tinted "Fine-Tuning Insight" pull-quote.
- **Randomize event**: the `randomizeUniverse` window event jumps the carousel to a random point in galactic history (`Math.random() * 13.8`).
- **Single state var**: `currentGalacticAge` (default `13.8`, units Gya). Phase index is *derived* from age via `getPhaseIndex()`. Dot/arrow clicks call `getPhaseAge()` to jump to the middle of the chosen phase.

## Visual design system already in place (don't fight it)

- Palette: `--void: #030308`, `--indigo: #7A7BFF`, `--goldilocks: #6FE4B1`, ink ladder, hair lines.
- Fonts: `Unbounded` (display), `Space Grotesk` (body), `Space Mono` (mono/labels), `Newsreader` (serif italic accents).
- Backdrop is already a fixed cosmic gradient + seeded starfield + grain — the carousel image should sit on a translucent/glassy surface so the cosmos shows through.

---

## The six phases — detailed editorial spec

The carousel is the entire interactive. There are six phases, each with the same content shape: `id`, `name`, `age`, `image`, `description`, `details`, `fineTuning`. All copy below is verbatim from the source — preserve it (or improve it with the user's review) in the redesign.

### Phase 0 — Pre-Galactic Era
- **Age:** 13.8 – 13.6 billion years ago
- **Image:** *none* (rendered as `∅` placeholder)
- **Description:** "The universe before galaxies existed"
- **Details:** "In the earliest epochs after the Big Bang, the universe was a nearly uniform sea of hydrogen and helium gas. No stars, no galaxies, no structure — just the cosmic microwave background and tiny density fluctuations that would eventually seed galaxy formation."
- **Fine-tuning insight:** "The universe needed to cool to exactly the right temperature and achieve the perfect balance of matter density. Too hot and gas couldn't clump; too cold and nuclear processes couldn't begin when stars finally formed."
- **Phase-to-age mapping:** representative age = **13.7 Gya**.
- **Trigger condition:** `currentAge > 13.6`.

### Phase 1 — Proto-Galaxy Formation
- **Age:** 13.6 billion years ago
- **Image:** `/1. Proto-Galaxy Formation.png`
- **Description:** "Dark matter halo collapse and first gas accretion"
- **Details:** "The Milky Way begins as a chaotic cloud of dark matter and gas. Gravity pulls material together, but there's no organized structure yet. This phase was crucial for gathering the raw materials needed to build our galaxy."
- **Fine-tuning insight:** "If dark matter hadn't clumped at exactly the right rate, galaxies would never have formed. Too fast and everything would collapse into black holes; too slow and matter would remain forever dispersed."
- **Representative age:** **13.0 Gya**.
- **Trigger:** `currentAge > 12.0`.

### Phase 2 — Starburst Phase
- **Age:** 12 – 10 billion years ago
- **Image:** `/2. Starburst Phase.png`
- **Description:** "Intense star formation and heavy element creation"
- **Details:** "Massive bursts of star formation create the first heavy elements through nuclear fusion. These early stars live fast and die young, enriching the galaxy with carbon, oxygen, and iron — elements essential for planets and life."
- **Fine-tuning insight:** "The star formation rate had to be perfectly balanced. Too intense and it would consume all gas too quickly; too weak and insufficient heavy elements would form for rocky planets."
- **Representative age:** **11.0 Gya**.
- **Trigger:** `currentAge > 10.0`.

### Phase 3 — Quasar Phase
- **Age:** 10 – 8 billion years ago
- **Image:** `/3. Quasar Phase.png`
- **Description:** "Active galactic nucleus with powerful jets"
- **Details:** "The central supermassive black hole becomes extremely active, shooting powerful jets of energy across the galaxy. This phase regulates star formation and prevents the galaxy from growing too large."
- **Fine-tuning insight:** "The quasar phase had to end at precisely the right time. Too long and it would sterilize the entire galaxy; too short and the galaxy would become overcrowded with stars, disrupting planetary orbits."
- **Representative age:** **9.0 Gya**.
- **Trigger:** `currentAge > 8.0`.

### Phase 4 — Early Spiral Formation
- **Age:** 8 – 4 billion years ago
- **Image:** `/4. Early Spiral Formation.png`
- **Description:** "Spiral arms begin to form and stabilize"
- **Details:** "The galaxy settles into a rotating disk with emerging spiral arms. Star formation becomes more organized, creating the beautiful spiral pattern we see today. The galactic ecosystem begins to stabilize."
- **Fine-tuning insight:** "Spiral arm formation required precise rotational dynamics. Without the right balance of gravity and rotation, we'd have either a chaotic irregular galaxy or a featureless elliptical — neither ideal for life."
- **Representative age:** **6.0 Gya**.
- **Trigger:** `currentAge > 4.0`.

### Phase 5 — Modern Milky Way
- **Age:** Present day
- **Image:** `/Milkyway Galaxy Formation - Nature.jpg`
- **Description:** "Mature spiral galaxy with stable star formation"
- **Details:** "Today's Milky Way represents the perfect balance — a stable spiral galaxy with the right metallicity gradients, gas reservoirs, and stellar populations to support billions of planetary systems like ours."
- **Fine-tuning insight:** "Our current galaxy provides the ideal environment for life: stable orbits, appropriate heavy element abundance, regulated star formation, and protection from cosmic hazards through our location in the galactic suburbs."
- **Representative age:** **1.0 Gya**.
- **Trigger:** `currentAge <= 4.0` (catch-all).

---

## Why this section's structure breaks the pattern (and what to do about it)

Every other chapter in the site has 2–6 tunable parameters with sliders, Goldilocks bands, and live visualizations responding to user input. This chapter has **none of that** in its inner section. The fine-tuning argument is delivered as an editorial slideshow.

**Two redesign directions to choose between (or combine):**

1. **Keep it as an editorial slideshow, but elevate it cinematically.** Treat the carousel as a museum exhibit. Each phase becomes a full-bleed cinematic still with editorial typography (large display name, age in serif italic, body copy in 60-character measure). Phase transitions are slow, ease-out cross-fades — not instant snaps. The dot row becomes a horizontal timeline scrubbed by a play-head. Add a single "Play 13.8 Gyr" button that auto-advances every ~3 seconds with kenburns-style image motion. The "Fine-Tuning Insight" deserves real magazine-style pull-quote treatment, not a yellow callout box. This is the lowest-risk path and probably the right one — the existing structure is solid, just visually plain.

2. **Add real interactivity.** Introduce 1–3 tunable parameters that this chapter conceptually owns:
   - **Central black hole mass** (currently lives at ChapterFrame level — could be brought inside).
   - **Dark matter halo density** (mentioned in phase 1's fine-tuning).
   - **Quasar phase duration** (mentioned in phase 3's fine-tuning).
   - **Galactic suburb position** (the "Goldilocks zone" within the galaxy itself — mentioned in phase 5).
   - Each could have a Goldilocks band and modify a generative visualization of the galaxy (sprite-based, since the static images aren't tunable). The carousel becomes a *baseline* timeline that the parameters perturb.

If staying with option (1), the section is essentially a **photo essay** — the redesign should embrace that and stop trying to make it look like the other tunable-slider chapters.

If moving to option (2), the static images become reference imagery and the visualization layer needs a from-scratch generative galaxy renderer (canvas/WebGL).

---

## What the redesign should preserve vs. reimagine

**Preserve (logic / content):**
- All 6 phase entries with their exact `id`, `name`, `age`, `image`, `description`, `details`, and `fineTuning` strings.
- The `currentGalacticAge` state pattern and its `getPhaseIndex` / `getPhaseAge` mapping (or replace cleanly).
- The empty-state treatment for Phase 0 (no image — show absence of galaxy structure explicitly).
- The four timeline anchor legends (Big Bang / Active Phase / Stabilization / Modern Era) and their positions.
- The `randomizeUniverse` window event jumping to a random `currentGalacticAge ∈ [0, 13.8]`.
- The `educatorMode` prop gating the "What's Happening" + "Fine-Tuning Insight" panel.
- Embedded-inside-ChapterFrame layout (don't add another hero / title / outer chrome — the frame provides it).
- Responsive split: timeline overlaid on image (desktop) vs. below image (mobile).

**Reimagine (visual / interaction):**
- Card chrome — current shadcn Card feels generic; this section deserves the hi-fi treatment.
- The dot indicators are functional but generic — consider a horizontal timeline with named tick marks (Pre-Galactic / Proto / Starburst / Quasar / Spiral / Modern) rather than abstract dots.
- The prev/next chevron arrows could become smaller and more reverent — or disappear into hover/keyboard-only affordances.
- The "Fine-Tuning Insight" yellow callout is the most editorially important element on the page and currently looks like a stock warning box — redesign it into a real pull-quote with display type and an indigo or `--goldilocks` accent.
- The phase-name + age + description block beneath the image is functional but flat — treat it as a magazine caption with proper typographic hierarchy (large serif name, small mono age, body description).
- The static carousel images vary in style — some look like astronomy renderings, some look like NASA stock photos. Consider giving them a unified treatment (consistent color grading, vignette, or a thin starfield overlay) so the carousel reads as a single visual essay.
- Empty-space Phase 0 currently uses an `∅` glyph — consider something more evocative (a faint hairline grid dissolving into noise, or a single labeled CMB temperature reading hovering in space) since this is the moment *before* galaxies, not "no content."
- Add subtle parallax or kenburns image motion on phase transitions so each still feels alive rather than static.
- Consider an auto-play timeline mode that walks through all six phases over ~20 seconds — the existing carousel structure would support it cleanly.

**Tone to aim for:** Brian Cox's *Wonders of the Universe* meets *The New York Times* interactive features — meditative, precise, slightly reverent. Not gamey, not playful-cartoon, not utilitarian-dashboard. The emotional beat of this chapter is **the central darkness as architect** — the supermassive black hole isn't a destroyer here, it's the choreographer of a hundred billion stars. The redesign should feel hushed, grand, and indebted. The carousel should feel less like a slideshow and more like turning pages in a history of our home.
