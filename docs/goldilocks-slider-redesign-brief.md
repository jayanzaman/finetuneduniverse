# Redesign brief: GoldilocksSlider (the signature control)

This brief covers the single most-repeated interactive element of the hi-fi system:
the static "survival band" slider that appears on every chapter (`Chapter 01`–`Chapter 07`)
and visually anchors the fine-tuning argument of the whole site.

> Source: `src/components/hifi/GoldilocksSlider.tsx` (80 lines).
> Used by: `ChapterFrame` → `chapterContent.tsx` (7 instances, one per chapter).
> Style hooks: `hifi.css` (classes `.gs`, `.gs-head`, `.gs-track`, `.gs-rail`, `.gs-zone`,
> `.gs-knob`, `.gs-caps`, `.gs-cap-warn`, `.gs-band-note`, `.fail`).

---

## 1. What it is (today)

A horizontal-band visualization of a physical parameter, where the **survival window**
is a green band against a hair line, the **current value** is a small bead, and the
**failure modes at either end** are spelled out in words.

It is a *static visual* by default — the `position` prop is a number between 0 and 1,
not driven by any user input. Drag handlers do not exist in this file. Every chapter
hardcodes the position to mark where "our universe" sits inside the band.

### Anatomy (top to bottom)

| Layer            | Element                                            | Notes                                                                                   |
|------------------|----------------------------------------------------|------------------------------------------------------------------------------------------|
| Head row         | `.gs-label` (left) + `.gs-value` (right)           | Label uses `--ink`; value uses `--ink` with optional `unit` in `--ink-soft` (8px gap)    |
| Track            | `.gs-rail` (full hair line) + `.gs-zone` (band) + `.gs-knob` (bead)  | Zone is between `--gs-zone-l` and `--gs-zone-r`; knob is at `--gs-fill`              |
| Caps row         | `leftCap` ← · `● in band` (centered, goldilocks) · `rightCap` →     | `gs-cap-warn` class applied if `failLeft`/`failRight` provided                       |
| Band note (opt.) | `.fail` left · `.fail` right                       | Hidden unless `failLeft` or `failRight` is set                                          |

### Props contract

```ts
type GoldilocksSliderProps = {
  label: ReactNode;            // e.g. "Initial entropy · S/k"
  value: ReactNode;            // e.g. "1.00"
  unit?: ReactNode;            // e.g. "optimal", "0.95 – 1.37 (habitable)"
  position?: number;           // 0..1, default 0.5
  zone?: [number, number];     // default [0.42, 0.58]
  leftCap?: ReactNode;         // default "←"
  rightCap?: ReactNode;        // default "→"
  failLeft?: ReactNode;        // e.g. "never moves"
  failRight?: ReactNode;       // e.g. "black holes only"
  style?: CSSProperties;
  className?: string;
};
```

The component writes three CSS custom properties on the root:

- `--gs-fill: <position*100>%`
- `--gs-zone-l: <zone[0]*100>%`
- `--gs-zone-r: <zone[1]*100>%`

The rest of the layout (track height, knob diameter, zone tint, hair colors) lives
in `hifi.css` and reads from those vars + the design tokens.

---

## 2. Verbatim instances across the seven chapters

(Cross-referenced from `src/components/hifi/chapterContent.tsx`.)

| # | label                                          | value     | unit                             | position | zone           | leftCap         | rightCap          | failLeft                | failRight              |
|---|------------------------------------------------|-----------|----------------------------------|----------|----------------|-----------------|-------------------|--------------------------|-------------------------|
| 1 | Initial entropy · S/k                          | 1.00      | optimal                          | 0.50     | [0.42, 0.58]   | perfect order   | maximum chaos     | never moves              | black holes only        |
| 2 | Quark binding force · gₛ                       | 1.000     | optimal                          | 0.50     | [0.46, 0.54]   | too weak        | too strong        | no protons form          | no light elements       |
| 3 | Stellar mass · M☉ (solar masses)               | 1.0       | main sequence                    | 0.42     | [0.32, 0.58]   | red dwarf       | supergiant        | no fusion                | burns out in 10⁶ yr     |
| 4 | Central black hole mass · log₁₀ M☉             | 6.61      | 4.1 × 10⁶ M☉                     | 0.48     | [0.40, 0.58]   | too small       | too massive       | no disc forms            | matter is consumed      |
| 5 | Orbital distance · AU                          | 1.000     | 0.95 – 1.37 (habitable)          | 0.50     | [0.42, 0.62]   | too close       | too far           | oceans evaporate         | snowball, forever       |
| 6 | Atmospheric UV flux · W/m²                     | 13.5      | window: 8 – 28                   | 0.46     | [0.30, 0.65]   | inert           | sterilizing       | no amino acids           | DNA shredded            |
| 7 | Atmospheric oxygen · Great Oxygenation timing  | 2.4 Gya   | optimal arrival                  | 0.52     | [0.40, 0.65]   | too early       | too late          | cyanobacteria poisoned   | no complex life         |

A handful of observations the redesign should keep in mind:

- Chapter 2 has the **narrowest band** (0.46–0.54, width 0.08) — the message is "the
  knife edge of the strong force".
- Chapter 6 has the **widest band** (0.30–0.65, width 0.35) — abiogenesis is portrayed
  as a *wide* lottery in time, not a precise knob.
- Chapter 7 is the only entry where `value` is a **date** ("2.4 Gya") instead of a unitless
  number — the slider is being repurposed for a *temporal* parameter.
- Caps oscillate between **bias words** ("too close / too far") and **named species**
  ("red dwarf / supergiant", "inert / sterilizing"). Both modes must remain legible.
- Failure-mode copy is always written as a **terminal outcome**, never as a tendency:
  "DNA shredded", "snowball, forever", "burns out in 10⁶ yr".

---

## 3. Design system tokens it reads

- `--ink`, `--ink-soft` — head label/value, unit
- `--goldilocks` — survival band tint, the `● in band` dot
- `--hair`, `--hair-soft` — track rail
- `--gs-fill`, `--gs-zone-l`, `--gs-zone-r` — written by the component, read by CSS

Type ladder (assumed by the surrounding `ChapterFrame`):

- Label: `.mono` (Space Mono), uppercase tracking from CSS
- Value: same family as label, slightly heavier
- Caps row: smaller `.mono`, all-lowercase short words
- Band note: italicized `.fail` red-shifted ink

---

## 4. UX patterns to preserve

1. **One control, one parameter.** Each chapter is allowed exactly one Goldilocks
   slider — it is the rhetorical center of the page. Do not turn it into a multi-knob
   panel.
2. **Survival, not preference.** The band is read as "the survivable zone of physical
   law", not "the recommended setting". Color it as a tinted zone, never as a fill bar.
3. **Failure framed as consequence.** Caps + band notes describe *what the universe
   looks like* when this dial is off, not "this is bad" — keep the editorial voice
   plain and terminal.
4. **No drag affordance.** This element is read top-to-bottom; the knob is a marker,
   not a handle. Reimagining it as draggable is a *deliberate* shift, not a default.
5. **The 0–1 abstraction.** Whatever the real-world parameter, the slider always
   normalizes to 0..1. Display the real value/unit textually in the head row, never
   on the axis itself.
6. **Caps as miniature haiku.** `leftCap` / `rightCap` are 1–2 words. `failLeft` /
   `failRight` are 2–4 words. Respect that economy.

---

## 5. What can be reimagined

- **The track style.** The rail/zone/knob composition is hair-thin and Swiss; another
  art direction could deepen the band into a 3-stop gradient (life → survival → death)
  or fold in a star-density overlay, as long as the position/zone math is preserved.
- **Knob form.** The radial-gradient indigo bead is one possible form. Other valid
  reads: a vertical pin against the rail, a soft halo glow without a hard bead, or
  a tiny pictogram for the chapter's "our universe" exemplar (Sol for Chapter 3,
  Earth for Chapter 5).
- **Cap typography.** The current row is left/center/right with the `● in band` label
  in the middle. The center label is often redundant given the head row already
  surfaces a "value · unit". A redesign may drop it and let the band speak.
- **Band note.** The two-column note row underneath is the lowest-priority element on
  the slider. It can be merged into the caps row, or surfaced on hover/focus.
- **Vertical variant.** For chapters where the parameter is *temporal* (Chapter 7,
  arguably Chapter 1) a vertical orientation reads as a timeline rather than a knob.
  Consider promoting it for those instances.

---

## 6. What must not be reimagined

- The `position`/`zone[0]`/`zone[1]` math, or the way the component writes them as
  CSS variables. The whole hi-fi animation system (and any future drag affordance)
  hooks on those three vars.
- The 7 verbatim instance contents. The narrative voice is calibrated; copy edits
  should be requested, not improvised.
- The relationship to `ChapterFrame`: the slider always lives in the left column of
  the slider+ghost grid (`minmax(0, 1fr)` / `auto`, gap 48, max-width 1280). It is
  not a free-floating element.

---

## 7. If we *do* want the slider to become interactive

A future redesign that makes the slider draggable should:

1. Accept an `onPositionChange?: (p: number) => void` and switch to a controlled
   pattern when present (uncontrolled `position` default stays for the static hi-fi
   case).
2. Add keyboard support (`role="slider"`, `aria-valuemin/max/now`, ArrowLeft/Right
   to step, Home/End to snap to caps, PageUp/PageDown to snap to the band edges).
3. Keep the band immovable — the user moves the knob *into and out of* the band,
   not the band itself.
4. Trigger the per-chapter visualization to react to the position (e.g. Chapter 5's
   Earth slides closer/further from the Sun). This is the upgrade that the existing
   `Goldilocks` / `Goldilocks Zone` chapter visualizations are already drawn to
   support.

---

## 8. Quick reference: signature line

The whole hi-fi system can be summarised by the line below — a redesign should be
able to substitute one band for another and still produce a chapter that fits in.

```tsx
<GoldilocksSlider
  label="Stellar mass · M☉ (solar masses)"
  value="1.0"
  unit="main sequence"
  position={0.42}
  zone={[0.32, 0.58]}
  leftCap="red dwarf"
  rightCap="supergiant"
  failLeft="no fusion"
  failRight="burns out in 10⁶ yr"
/>
```
