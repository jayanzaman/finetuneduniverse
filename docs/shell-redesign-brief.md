# Shell — App Chrome Redesign Brief

This brief covers the **site shell** — every piece of UI that wraps the seven chapters but is not itself a chapter. Hand this whole document to Claude Code and ask it to redesign the shell without losing any of the behavior, navigation, or visual identity it currently carries.

The shell is composed of nine files. Three of them are the global ambient layer (`HifiBackdrop`, `Starfield`, the grain pass), three of them are persistent chrome (`TopNav`, `ChapterRail`, the chapter footer baked into `ChapterFrame`), one is the per-chapter shell (`ChapterFrame`), one is the orchestrator (`UniverseBuilderApp`), and two are the chapter content + visualization registry (`chapterContent.tsx`, `ChapterVisuals.tsx`).

---

## 1. `UniverseBuilderApp.tsx` — the orchestrator

The single client-side root. It owns:

- **View state**: `{ kind: 'landing' } | { kind: 'chapter'; index: number }` — there are only two screens.
- **Chapter registry**: `SECTION_COMPONENTS = [Beginning, Matter, Starlight, GalacticHeart, Planets, Abiogenesis, Life]` (7 entries, in chapter order). `index` is clamped to `[0, 6]`.
- **`cosmicTime`**: a global counter incremented by `+0.1` every 100 ms via `setInterval`. Passed to every section as a prop so inline visualizations can animate against a shared phase clock. **Always running** — even on the landing screen.
- **Navigation**:
  - `goLanding()` → `{ kind: 'landing' }`
  - `goChapter(i)` → clamped chapter
  - `handleNext()` → landing → ch 0, ch i → ch i+1 (stops at 6)
  - `handlePrev()` → ch 0 → landing, ch i → ch i-1
- **Input methods** (all listening at the app root):
  - Keyboard: `ArrowRight` = next, `ArrowLeft` = prev (`keydown` window listener).
  - Touch: `react-swipeable` with `swipedLeft = next`, `swipedRight = prev`, `delta: 50`, `swipeDuration: 500`, `trackMouse: false`, `preventScrollOnSwipe: true`.
  - Mouse: clicking `TopNav.Index` returns to landing; clicking a `ChapterRail` dot jumps.
- **Scroll reset**: every view change calls `window.scrollTo({ top: 0, behavior: 'smooth' })`.
- **Backdrop seed**: `HifiBackdrop seed={view.kind === 'chapter' ? (view.index + 1) * 13 : 3}` — every chapter has a different deterministic star pattern (seeds: 13, 26, 39, 52, 65, 78, 91; landing: 3).
- **Page transitions**: `framer-motion` `AnimatePresence mode="wait"`. Landing animates `y: 16 → 0 → -16`, chapter pages `y: 24 → 0 → -24`, duration `0.5s`, on each view change.
- **`ChapterView`** (inner component) renders the chosen section *inside* the matching `ChapterFrame`. The section is passed `educatorMode={false}` and `cosmicTime`. Section markup is wrapped in `<div className="hifi-section-embed">`.

**Preserve:** the dual-screen state model, the keyboard + swipe + rail navigation, the `cosmicTime` tick (sections depend on it), the per-chapter backdrop seed, the framer transition timings, the `hifi-section-embed` wrapper class. The `educatorMode` is hard-coded to `false` today — keep it a prop because half the sections still branch on it for richer copy and a future toggle may resurrect that mode.

**Reimagine:**
- Add a real URL surface (`/`, `/01-beginning`, etc.) — currently this is a SPA with no deep links, so chapters can't be shared.
- Consider replacing the `setInterval` clock with `requestAnimationFrame` so it pauses with the tab; today it keeps ticking when hidden.
- Add a global `Escape` keybinding that returns to the landing screen.
- Add `prefers-reduced-motion` handling on the framer transitions and on the always-on `cosmicTime` interval.
- Consider making chapter prefetch explicit so the section bundle for chapter N+1 is warmed when the user is on chapter N.

---

## 2. `ChapterFrame.tsx` — the per-chapter shell

The shared shell every chapter renders inside. Props:

```
num            two-digit chapter number string ("01"–"07")
chapterIndex   0-based index (currently unused inside the frame)
era            ReactNode — small mono label, e.g. "13.8 Bya · t = 10⁻³² s"
title          ReactNode — hero h1 (may contain <br /> and <em>)
prose          ReactNode — narration paragraph
sliderProps    full GoldilocksSliderProps for the chapter's primary slider
ghost?         { body: ReactNode } — the "If you leave the band →" failure-mode card
nextTitle?     ReactNode — title shown inside the "Next chapter" footer button
nextLabel?     ReactNode — small caption beneath the button (era of the next chapter)
onNext?, onPrev?  navigation callbacks (no onNext disables the button)
visualization? ReactNode — the cinematic per-chapter visual (renders absolutely, behind the content, z:2, pointer-events:none, overflow:hidden)
children?      ReactNode — the embedded section's interactive widget (renders between prose and slider)
```

Layout, top to bottom inside `padding: 120px 64px 64px`:
1. **Chapter mark line** — `<span class="mono-lg">Chapter {num}</span>` in `--indigo`, a 1×14 hairline divider in `--hair-2`, then the era in `.mono`.
2. **Hero title** — `<h1 class="h-hero" maxWidth: 720>{title}</h1>` with an `id` of `ch-${num}-title` (used by `aria-labelledby` on the section).
3. **Narration** — `<p class="prose" marginTop:48 maxWidth:460>{prose}</p>`.
4. **Embedded section content** — only if `children` is provided. Wrapped in `marginTop: 56; padding: 24px 0;` block.
5. **Primary slider + ghost** — a 2-column CSS grid `gridTemplateColumns: 'minmax(0, 1fr) auto'`, `gap: 48`, `alignItems: 'end'`, `maxWidth: 1280`. Left: `<GoldilocksSlider {...sliderProps} />`. Right: a 280-wide `<div class="ghost">` with a `.ghost-label` ("If you leave the band →") and the failure body.
6. **Continue footer** — flex row, `justify-content: space-between`, `align-items: flex-end`. Left: a `.scroll-cue` with a hair line + "Scroll · time advances". Right: optional `← Previous` button, and either the `Next chapter` primary button (with a two-line label: mono caps "Next chapter" + display-font `{nextTitle} ↓`) or the closing line `End of the descent · t = now` when there is no next chapter.
7. **Next-chapter timestamp** — if `nextLabel` is provided, render it right-aligned in `--ink-soft` mono below the buttons.

**Preserve:** the absolute positioning of the visualization layer (z:2, behind z:3 content), the chapter-mark line composition, the slider-and-ghost two-column grid, the closing `End of the descent · t = now` text for chapter 07, the `aria-labelledby` link between section and h1, the `.scroll-cue` element. Every section depends on this exact composition.

**Reimagine:**
- The hard-coded `120px 64px 64px` padding does not respond to viewport. Add a responsive container and tokenize the values.
- The ghost card is fixed at 280px wide and collapses awkwardly under ~900px viewport. Stack vertically under a breakpoint.
- The "Next chapter" button is an inline anonymous `<button>` with inline CSS for the two-line label. Promote to a real `NextChapterButton` component with a single explicit prop API.
- Add a visible chapter progress affordance (the rail does this on the right edge today, but the frame itself has no progress indicator inside the reading column).
- The frame currently does not surface `chapterIndex` anywhere — drop the prop or use it.

---

## 3. `ChapterRail.tsx` — right-edge chapter index

A vertical column of one button per chapter, sourced from `CHAPTERS`. Each button:

- Carries one of three classes: `active` (current chapter), `passed` (any chapter index below the active one), or empty.
- Renders three children: `<span class="label">{chapter.t}</span>` (hover-revealed title), `<span>{chapter.n}</span>` (the two-digit number), `<span class="chapter-rail-dot" />` (the visible bullet).
- Has `aria-label="Chapter ${n} ${title}"` and sets `aria-current="page"` when active.
- Calls `onSelect(index)` on click. `active` may be `null` (landing screen) — when null no item gets `active`/`passed`.

**Preserve:** the `passed` styling (turns the dot indigo or whatever the CSS designates for "you've been here"), the hover-revealed label, the `aria-current="page"` semantic, the `null` state for landing.

**Reimagine:** today the rail has no scroll-progress reading — when you're partway through chapter 03's long page, the rail's active dot doesn't move. Consider tying it to `IntersectionObserver`-driven progress so the dot fills as you scroll. Also consider a collapsed-by-default mode that expands on hover/focus, so the rail is less visually heavy on small screens.

---

## 4. `TopNav.tsx` — top-left mark and right-side links

Three pieces:

- **Mark** — `<div class="hifi-mark">` with a `hifi-mark-dot` and `hifi-mark-label "Finetuned · Universe"`.
- **Links** — three children right-aligned: a real `<button onClick={onIndex}>Index</button>` (the only interactive one), then static `<span>Glossary</span>` and `<span>About</span>` (no behavior).
- `activeLabel` prop toggles the `Index` button's `active` class (currently `'Index' | 'Chapter' | null`).

**Preserve:** the wordmark text, the explicit Index button that returns to landing.

**Reimagine:** Glossary and About are dead `<span>`s — either build them or remove them so the nav doesn't promise affordances it can't deliver. If they will eventually exist, scaffold them as routed pages now. Add a real focus ring story and visible keyboard focus, since the nav is currently styled-only.

---

## 5. `HifiBackdrop.tsx` + `Starfield.tsx` — global ambient layer

`HifiBackdrop` is a 3-layer stack:
1. `<div class="hifi-backdrop" aria-hidden />` — fixed indigo-radial gradient on near-black (defined in global CSS).
2. `<Starfield seed density />` — SVG starfield (see below).
3. `<div class="hifi-grain" aria-hidden />` — fixed-position film-grain overlay.

`Starfield` generates an SVG viewBox `0 0 100 100` with `preserveAspectRatio="none"` and renders four star layers using a deterministic seeded LCG (`s = (s * 9301 + 49297) % 233280`):

| Layer | Count (× density) | Radius | Opacity baseline |
|-------|-------------------|--------|------------------|
| 0     | 80                | 0.45   | 0.45             |
| 1     | 50                | 0.75   | 0.70             |
| 2     | 16                | 1.20   | 0.92             |
| 3     |  4                | 1.80   | 1.00             |

Each star's final opacity is `layer.opacity × (0.6 + rand() × 0.4)`. Star radius is multiplied by `0.06` on render. Seed per layer is offset by `seed + li * 137`.

**Preserve:** the seeded determinism (different chapters get visually different but reproducible skies), the four-layer parallax-ready hierarchy, the `aria-hidden` on every layer.

**Reimagine:**
- The starfield is a 100×100 SVG stretched with `preserveAspectRatio="none"` — that visibly distorts stars on tall portrait viewports. Either render in absolute pixel space or use `meet` and tile.
- Stars do not twinkle, drift, or react to chapter changes — consider a subtle parallax to mouse position, throttled at ~30 Hz, and per-layer drift tied to `cosmicTime`.
- The grain overlay is currently a fixed CSS background — keep it but verify it's not still being requested on mobile (it can be expensive); fall back to a smaller pattern on touch viewports.

---

## 6. `SeedOrb.tsx` — the landing "seed of the universe" device

A circular composite used by the landing page (not by any chapter). Layers, all absolutely positioned inside a `size × size` (default 460px) container:

1. **Outer halo** — radial gradient indigo → transparent, inset by `-30%`, blurred 2px.
2. **Mid bloom** — radial gradient off-center (40% / 35%): white → light indigo → mid indigo → near-black → black. With both a 120px-blur outer box-shadow in indigo (`rgba(79,80,232,0.4)`) and an 80px-blur inset shadow.
3. **Inner glint** — small white radial highlight at the center, blurred 8px, opacity 0.6.
4. **Concentric orbit rings** — three rings at 1.4× / 1.8× / 2.2× the orb size, 1px indigo borders, descending opacity (0.60 / 0.45 / 0.30).

**Preserve:** the layered radial-bloom recipe, the concentric ring family, the soft off-center glint (this is the "the cosmos as a single dimmed pearl" device).

**Reimagine:** the orb is presentational only (no `cosmicTime` link). Consider a slow rotational drift on the orbit rings synced to `cosmicTime`, and a hover state that tightens the bloom when the user moves toward "Begin".

---

## 7. `chapters.ts` — chapter metadata registry

A frozen array `CHAPTERS` of seven entries, each `{ n, t, long, d, era }`. Used by `TopNav`/`ChapterRail`/the landing strip. The exported type `ChapterMeta` is the union of the seven entries.

Exact contents:

| n  | t       | long                     | d                       | era      |
|----|---------|--------------------------|-------------------------|----------|
| 01 | Beginning | The Beginning          | Low entropy start       | 13.8 Bya |
| 02 | Matter    | Quarks to Atoms        | Formation of matter     | t + 1μs  |
| 03 | Stars     | First Stars            | Ignition                | 200 Mya  |
| 04 | Galaxy    | Blackhole at the Heart | Galaxy assembly         | 1 Gya    |
| 05 | Planets   | Goldilocks Zone        | A habitable orbit       | 9.2 Gya  |
| 06 | Life      | Chemistry to Codes     | Abiogenesis             | 3.8 Gya  |
| 07 | Geology   | Geologic Time          | A planet remade         | now      |

**Note inconsistencies vs. `chapterContent.tsx` titles:** `chapters.ts` says `"Quarks to Atoms"` while `chapterContent` says `"Quarks to atoms"`; `"Blackhole at the Heart"` (no space) here vs. `"A darkness at the heart"` (different phrasing) there; chapter 03's era `"200 Mya"` here vs. `"~ 200 Million years after the Big Bang"` there; chapter 05's `"9.2 Gya"` here vs. `"~ 9.2 Billion years after the Big Bang · 4.6 Bya"` there. **A redesign should consolidate to a single source of truth and derive the rail/nav labels from the same data the chapter frame uses.**

---

## 8. `chapterContent.tsx` — chapter narrative + slider + ghost + viz registry

A `CHAPTER_CONTENT` array of seven entries, each conforming to `ChapterContent`:

```
num, era, title, prose, sliderProps, ghost, nextTitle?, nextLabel?, visualization
```

Each entry is **one screen** of the descent — header text, the chapter's signature slider configuration, the ghost copy, and the cinematic visualization component. Every per-section brief in `docs/` already references the slider zone and value used here.

The full registry, with the exact text and slider params (preserve verbatim):

**Ch 01 — The Beginning** · `13.8 Bya · t = 10⁻³² s` · slider *Initial entropy · S/k* value `1.00 / optimal`, position `0.5`, zone `[0.42, 0.58]`, caps `perfect order / maximum chaos`, fails `never moves / black holes only`. Ghost: *"An eternally still universe — frozen perfection. No stars ignite. No time, in any meaningful sense, passes."* Next: `Quarks to Atoms · t + 1 microsecond`. Viz: `<PrimordialBubble />`.

**Ch 02 — Quarks to atoms** · `t + 1 microsecond · Tᵢ ≈ 10¹² K` · slider *Quark binding force · gₛ* value `1.000 / optimal`, position `0.5`, zone `[0.46, 0.54]`, caps `too weak / too strong`, fails `no protons form / no light elements`. Ghost: *"Loosen the bond by 2% — quarks never bind. The universe is a fog of free particles, dark, structureless, forever."* Next: `First Stars · ~ 200 million years later`. Viz: `<ProtonViz />`.

**Ch 03 — First light** · `~ 200 Million years after the Big Bang` · slider *Stellar mass · M☉ (solar masses)* value `1.0 / main sequence`, position `0.42`, zone `[0.32, 0.58]`, caps `red dwarf / supergiant`, fails `no fusion / burns out in 10⁶ yr`. Ghost: *"Stars only half this mass — they fuse hydrogen, but never the heavy elements. No carbon. No water. No us, ever."* Next: `Blackhole at the Heart · ~ 1 billion years later`. Viz: `<FirstStarViz />`.

**Ch 04 — A darkness at the heart** · `~ 1 Billion years after the Big Bang` · slider *Central black hole mass · log₁₀ M☉* value `6.61 / 4.1 × 10⁶ M☉`, position `0.48`, zone `[0.4, 0.58]`, caps `too small / too massive`, fails `no disc forms / matter is consumed`. Ghost: *"A black hole twice this large — and the galaxy never settles into a disc. Stars are pulled apart faster than they form. No planetary orbits, ever."* Next: `The Goldilocks Zone · ~ 9.2 billion years later`. Viz: `<GalaxyViz />`.

**Ch 05 — A narrow band of warm** · `~ 9.2 Billion years after the Big Bang · 4.6 Bya` · slider *Orbital distance · AU* value `1.000 / 0.95 – 1.37 (habitable)`, position `0.5`, zone `[0.42, 0.62]`, caps `too close / too far`, fails `oceans evaporate / snowball, forever`. Ghost: *"Push the orbit out by 10% — Earth ices over for good. Snowball planet, locked in white forever. No reset switch."* Next: `Chemistry to Codes · ~ 3.8 billion years ago`. Viz: `<GoldilocksViz />`.

**Ch 06 — From chemistry, a code** · `~ 3.8 Billion years ago · Hadean Earth` · slider *Atmospheric UV flux · W/m²* value `13.5 / window: 8 – 28`, position `0.46`, zone `[0.3, 0.65]`, caps `inert / sterilizing`, fails `no amino acids / DNA shredded`. Ghost: *"Halve the UV and the building blocks never assemble. Double it and every fragile molecule shreds before it can replicate."* Next: `Geologic Time · 4.6 billion years — and a long becoming`. Viz: `<PrimordialEarthViz />`.

**Ch 07 — A planet, remaking itself** · `4.6 Billion years ago → today` · slider *Atmospheric oxygen · Great Oxygenation timing* value `2.4 Gya / optimal arrival`, position `0.52`, zone `[0.4, 0.65]`, caps `too early / too late`, fails `cyanobacteria poisoned / no complex life`. Ghost: *"Oxygen arrived neither too fast nor too slow. A billion years off and complex life never gets its window — Earth stays a microbial planet forever."* No next (`nextTitle: undefined`). Viz: `<EarthLimbViz />`.

**Preserve:** every string, every numeric position/zone, every ghost paragraph. These are the chapter "covers" — the section pages below them carry the deeper interactive content.

**Reimagine:**
- The chapter 03 ghost ("only half this mass… never the heavy elements") describes the **low** end correctly but the failure cap on that side is `no fusion` while the ghost is about a low-mass star that does fuse — re-check that the cap text and the ghost text agree.
- Resolve the title casing inconsistencies between `chapters.ts` and this file (see §7).
- Today the ghost is rendered with a static label "If you leave the band →" — consider making the label dynamic to match whichever side of the band the slider would fail toward.
- The chapter 07 closing has `nextTitle: undefined` which makes the frame print `End of the descent · t = now`. Consider promoting that to an explicit "ending" panel with a real epilogue rather than a button-shaped absence.

---

## 9. `ChapterVisuals.tsx` — the cinematic visualization stack

Seven pure-presentational React components, one per chapter. All sit absolute-positioned inside the `ChapterFrame` visualization layer (`z:2`, `pointer-events:none`, behind the chapter prose at `z:3`).

| Chapter | Component | Position | Signature |
|---|---|---|---|
| 01 | `PrimordialBubble` | `right:-260, top:50%` | 980×980 nested radial blooms + 5 concentric hair rings + 40 hand-placed accent dots in SVG |
| 02 | `ProtonViz` | `right:-60, top:50%` | 760×760 bloom + dashed boundary + 3 quark spheres (u/u/d, indigo/indigo/orange-red) connected by three quadratic gluon paths with white dashed overlay; "P R O T O N" mono caption |
| 03 | `FirstStarViz` | `right:-60, top:50%` | 820×820 warm bloom + 14 radial gluon-like arc-paths + 260px central star with white→cream→amber→burnt radial gradient and two outer box-shadows |
| 04 | `GalaxyViz` | `right:-160, top:50%` | 1000×1000 bloom + 320 procedural dust points generated via `seededRandom(404)` + four hand-drawn spiral arms via polyline + 240px conic-gradient blurred bulge + 110px central black hole with rim glow |
| 05 | `GoldilocksViz` | `right:-160, top:50%` | 1100×1100 with two concentric `dashed` habitable-zone rings + an `--goldilocks`-flavored annulus + 220px central star + a 90px Earth at `left: calc(50% + 280px)` |
| 06 | `PrimordialEarthViz` | full-bleed | full-viewport gradient sky (dark → magenta → amber → terminator black) + bottom horizon glow + an SVG lightning bolt with white core + outer indigo halo + 8 floating molecule labels (CH₄, NH₃, H₂O, CO₂, HCN, Gly, Ala, H₂) with `f-mono` and indigo text-shadow |
| 07 | `EarthLimbViz` | right column, top:-200 / bottom:-200 | full Earth-limb sphere with realistic radial gradient + clipped continent/cloud splats; deliberately bleeds off the top/bottom for the "horizon" feeling |

All seven are static — no animation logic, no `cosmicTime` dependency. The seeded random functions are evaluated once at module load.

**Preserve:** these visuals are the only consistent visual identity the chapters share across viewports. The signature compositions (quark trinity, spiral with central black hole, dashed goldilocks rings, lightning over primordial earth) should survive any redesign — they are illustrative load-bearing.

**Reimagine:**
- Every viz is hardcoded to "right:-X, top: 50%" — that breaks on portrait viewports and on small desktops where the chapter content wraps into them. Add responsive positioning or a viewBox-based fluid version.
- None of the visuals respond to `cosmicTime`. Adding even subtle motion (slow drift on dust, twinkle on stars, lightning recurrence, terminator drift on the Earth limb) would tie them into the rest of the system.
- Hex/rgba color literals are scattered everywhere instead of using the token ladder. Migrate to `var(--indigo)`, `var(--ink)`, `var(--goldilocks)`, etc.
- `GalaxyViz` regenerates dust at module load with seed `404` — that means every refresh sees the same galaxy. Either expose `seed` per chapter or vary by `cosmicTime` epoch.
- Ch 06 lightning is a single static polyline. Consider re-striking on `cosmicTime` boundaries.

---

## Cross-cutting recommendations

- **Single source of truth.** Today chapter metadata is split between `chapters.ts` (rail labels) and `chapterContent.tsx` (frame content) and the section components themselves. A redesign should unify this so renaming a chapter happens in one place.
- **Responsive shell.** The frame uses fixed pixel padding, the visualizations use absolute pixel offsets, the ghost is a fixed-width card. Add a responsive layer.
- **A real route.** All seven chapters live at `/`. A redesigned shell should mount them at `/chapter/01-beginning` etc. so they're shareable and prefetchable.
- **Reduced motion.** The `cosmicTime` interval, the framer page transitions, the shimmer effects, the star pulses — all should respect `prefers-reduced-motion`.
- **Focus + keyboard.** The arrow-key navigation works, but visible focus rings on the rail dots and the next-chapter buttons are minimal. Tighten the focus story so the site is keyboard-navigable in practice.
