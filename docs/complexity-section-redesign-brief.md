# Redesign brief: ComplexitySection (orphan chapter on emergent complexity)

> Source: `src/components/universe-builder/sections/ComplexitySection.tsx` (305 lines).
> **Mount status: ORPHAN.** This component is *not* listed in
> `UniverseBuilderApp.tsx`'s `SECTION_COMPONENTS` array (which contains exactly the
> seven chapters: Beginning, Matter, Starlight, GalacticHeart, Planets,
> AbiogenesisLab, Life). The component is fully implemented but currently unreachable
> in the shipping flow.

This brief documents what it *is* so that the redesign can either (a) ship it as
Chapter 08 in the hi-fi shell, (b) merge its data into the Life chapter's
evolutionary tail, or (c) retire it cleanly.

---

## 1. What it does today

Four side-by-side cards, each a control on the rate at which complexity emerges
from chemistry. The four knobs together drive a single "complexity level" indicator
that climbs through five stages: **Molecules → Cells → Multicellular → Neural Networks
→ Intelligence**.

It mounts in the `container mx-auto px-4` Tailwind container (lo-fi system), not in
the hi-fi `ChapterFrame`. That is one of the strongest signs it was never wired into
the hi-fi redesign.

### Layout

```
container mx-auto px-4
└─ grid cols-1 / sm:cols-2 / lg:cols-4 · gap 4/6/8 · mb 8/12
   ├─ Card: Selection Pressure
   │   ├─ ComplexityEvolution viz (h-48)
   │   ├─ Slider 0..1 step 0.01
   │   ├─ band overlay 30–80% (green-500/30)
   │   └─ caps row: Too Weak · 30-80% (optimal) · {value} · Too Strong
   ├─ Card: Mutation Rate            — DNA icon · band 20–70% · "20-70% (innovative)"
   ├─ Card: Environmental Stability  — Globe icon · band 40–90% · "40-90% (stable)"
   └─ Card: Time Depth               — hourglass emoji · band 60–100% · "1B-4B+ years (deep time)"
```

Only the first card actually renders the `ComplexityEvolution` visualization. The
other three cards render a static text/icon plate with their current value. The
visualization is computed from *all four* sliders, but is *displayed only in the
Selection Pressure card*.

### Per-slider contract

| State                 | Default | Range  | Step  | Optimal band | Display label                          |
|-----------------------|---------|--------|-------|--------------|----------------------------------------|
| selectionPressure     | 0.5     | 0..1   | 0.01  | 0.30..0.80   | "{(v×100).toFixed(0)}%"                |
| mutationRate          | 0.5     | 0..1   | 0.01  | 0.20..0.70   | "{(v×100).toFixed(1)}%"                |
| environmentalStability| 0.5     | 0..1   | 0.01  | 0.40..0.90   | "{(v×100).toFixed(0)}%"                |
| timeDepth             | 0.5     | 0..1   | 0.01  | 0.60..1.00   | piecewise: 100M/500M/1B/3B/4B+ years    |

`timeDepth` is the only slider whose display is *not* a percentage — it is piecewise:

| timeDepth      | Display                |
|----------------|------------------------|
| < 0.2          | "100M years"           |
| < 0.4          | "500M years"           |
| < 0.6          | "1B years"             |
| < 0.8          | "3B years"             |
| ≥ 0.8          | "4B+ years"            |

### The single derived metric

```ts
const evolutionSpeed = selectionPressure * mutationRate
                     * environmentalStability * timeDepth;
const maxComplexity  = Math.min(1, evolutionSpeed * 1.2);
```

A multiplicative model: each knob acts as a 0–1 *filter*, and the product is gated
at 1.0 then displayed as a thin progress bar with a multi-stop rainbow gradient
(green → blue → yellow → purple → red) inside the Selection Pressure card.

### The five thresholds (verbatim)

```ts
[
  { name: 'Molecules',        threshold: 0.10, color: 'rgba(100, 255, 100, 0.8)' },
  { name: 'Cells',            threshold: 0.30, color: 'rgba(100, 200, 255, 0.8)' },
  { name: 'Multicellular',    threshold: 0.50, color: 'rgba(255, 200, 100, 0.8)' },
  { name: 'Neural Networks',  threshold: 0.70, color: 'rgba(255, 150, 255, 0.8)' },
  { name: 'Intelligence',     threshold: 0.85, color: 'rgba(255, 100, 100, 0.8)' },
]
```

If `maxComplexity` is below 0.10, the displayed level is `"Simple Chemistry"` (the
implicit zeroth tier).

### Educator mode

Each card has an opt-in `educatorMode` panel with four short paragraphs (`<strong>`
key + one sentence each). The recurring shape is:

1. **What you're seeing** — what the viz/percentage represents
2. **{Slider-specific principle}** — e.g. "Selection balance", "Innovation engine",
   "Stability paradox", "Deep time requirement"
3. **{Concrete biology fact}** — "Error threshold", "Mass extinctions", "Earth's
   timeline"
4. **{Failure mode}** — what happens outside the band

These should be treated as authoritative copy and preserved verbatim if the section
ships.

### randomizeUniverse hook

All four sliders re-randomize on the global `window.randomizeUniverse` event —
consistent with how every other section in `universe-builder/sections/` behaves.

---

## 2. What is *missing* compared to the hi-fi chapters

- No `ChapterFrame` wrapper, no chapter number, no era label, no prose column, no
  ghost copy, no Continue/Previous footer.
- No `GoldilocksSlider`. Uses the shadcn `Slider` with a hand-rolled positioned `div`
  overlay for the band.
- No cinematic visualization equivalent to `PrimordialBubble` / `GalaxyViz`.
- No entry in `chapters.ts` / `chapterContent.tsx`.

If shipped, the redesign needs to either lift it into the hi-fi shell (the natural
slot is **Chapter 08: "Complexity"**, between Life and Reflective) or fold its
strongest narrative beat — the *deep time* requirement — into Chapter 07's tail.

---

## 3. UX patterns to preserve

1. **Four-control multiplicative composition.** The story it tells — that complexity
   needs *all four* of selection × mutation × stability × time to be in band
   simultaneously — is unusually expressive. Don't reduce it to a single knob.
2. **Five named complexity tiers.** Molecules → Cells → Multicellular → Neural
   Networks → Intelligence is a tidy, narratable ladder. Even if the math changes,
   the rungs should remain.
3. **Deep-time as a non-percentage axis.** The Myr/Gyr scale on `timeDepth` is the
   only one of the four that has a real-world unit attached. Keep that asymmetry.
4. **Educator mode as a teachable layer**, not as the default. The four-paragraph
   `<strong>X:</strong> sentence` shape is consistent across the codebase.

## 4. UX patterns to reimagine

- **One viz that's hidden inside a card.** The `ComplexityEvolution` viz is only
  rendered inside the Selection Pressure card even though it depends on all four
  sliders. This is the biggest UX bug. The viz should be the page's hero, with the
  four sliders feeding into it from below or beside.
- **shadcn Slider + green overlay div.** Use a `GoldilocksSlider` per knob (or one
  large slider with four parameter rows underneath). The current overlay is a
  reimplementation of the same band concept.
- **Card grid as the primary layout.** The hi-fi shell wants a single prose column +
  visualization composition, not four equal cards.
- **No "ghost" / failure-mode panel.** Every other chapter has a ghost card that
  describes the universe where this dial is off. The complexity section has no
  equivalent. Adding one — e.g. "without 1B+ years, life plateaus at simple
  multicellular forever" — would lock it into the editorial voice of the rest of
  the site.

## 5. Recommended target shape (hi-fi)

If this becomes Chapter 08:

```
ChapterFrame
  num="08"
  era="~ 540 Mya · Cambrian → present"
  title="A code learns / to think."
  prose: "{200-300 words on emergent complexity}"
  sliderProps: { label: "Mutation rate · per genome per generation",
                 value: "10⁻⁹", unit: "optimal", position: 0.45, zone: [0.20, 0.70],
                 leftCap: "stable", rightCap: "error catastrophe",
                 failLeft: "no innovation", failRight: "information lost" }
  ghost: "Selection × mutation × stability × time. Drop any one to zero and the
          universe plateaus where it is — molecules, or cells, or fish."
  visualization: <ComplexityLadder ... />   // five-rung climb visualization
  nextTitle: "We are the universe / remembering itself."
```

The four-slider control panel can either be (a) collapsed into the single signature
slider plus three small "sub-knobs" beneath the ghost card, or (b) shown as a tabbed
deep-dive accessible from the chapter.

## 6. If this section is retired instead

Salvage:

- The five-rung complexity ladder copy (use as the visualization in Chapter 07's
  Cenozoic→Anthropocene tail).
- The educator-mode "Earth's timeline: life 3.8Ga, multicellular 1Ga, animals 600Ma,
  intelligence 200ka" line — it's the strongest factual beat in the file and would
  enrich the Geological Timeline brief.
- The `evolutionSpeed = a × b × c × d` framing as an aside in the Life chapter's
  prose.
