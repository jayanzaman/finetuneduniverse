# Navigation Redesign — Design Spec

**Date:** 2026-07-03
**Branch:** `design/navigation-redesign`
**Status:** Approved section-by-section during brainstorming; this document is the consolidated spec.
**Mockups:** `docs/superpowers/mockups/navigation-redesign/01-prologue.html` (Variant B chosen), `docs/superpowers/mockups/navigation-redesign/02-transition.html` (approved).

## 1. Goal

Redesign the navigation of finetuneduniverse.net so that:

- A first-time visitor immediately understands what the site is about.
- The seven chapters read as one narrative descent whose order is self-evident.
- Each chapter teaches the science of why that phase matters, and every component within a chapter is mind-bending, awe-inspiring, and clear in purpose.
- The transition to the next chapter is **earned**: it activates only after the visitor has gone through all of a chapter's components.
- Generative music/sound reflects the information being shared.

## 2. Locked decisions

| Decision | Choice | Rationale |
|---|---|---|
| Progression model | **Soft gate** | Nothing is locked; visitors can jump anywhere via the index or rail. But the in-flow transition at a chapter's bottom stays dormant until all components are experienced. Rewards depth without punishing browsers. |
| Component completion | **Interact + lesson opened** | A component counts as experienced when the visitor has both moved its slider and opened its focused view (lesson). Prevents click-through completion. |
| Audio | **Generative (Tone.js)** | Synthesized in-browser, no audio assets. Music maps to the actual state of the science being shown (tension = distance from the Goldilocks band). |
| Landing | **Cinematic prologue, Variant B** | Skippable 3-line prologue, full-bleed hero, scroll-revealed list index with live per-chapter status. |
| Scope | **Everything at once** | All seven chapters covered by the issue set. |
| Build order | **B: platform first, then content wave** | Progression + prologue + transitions + audio ship as a platform wave; chapters 2–7 rebuild follows as a parallelizable content wave. |

## 3. Architecture overview

Three new platform systems layered onto the existing hi-fi shell (`UniverseBuilderApp`, `TopNav`, `ChapterRail`, `ChapterHUD`, `ChapterFrame`):

1. **Progression engine** — knows which components exist per chapter and which the visitor has experienced. Single source of truth for the index statuses, dormant/earned transitions, and completion cues.
2. **Prologue landing** — replaces the current landing with a cinematic entry that states the premise before showing the index.
3. **AudioDirector** — a generative audio engine that scores the experience from progression + interaction state.

Chapter content (the six-component Instrument pattern proven in Ch01) is rebuilt chapter-by-chapter in a second wave against a fixed template (§7).

## 4. Prologue landing (Variant B)

Reference: mockup `01-prologue.html`, Variant B.

- **Prologue**: three lines revealed sequentially on first visit, skippable by click/key/scroll:
  1. "Our universe runs on a handful of numbers."
  2. "Tune any one of them slightly — and there are no stars, no chemistry, no you."
  3. "This is the story of the seven thresholds everything had to cross."
  - Shown once per visitor (flag in the same localStorage record as progression); returning visitors land directly on the hero with the lines already resting in place.
- **Hero**: full-bleed cosmos field, site mark, a single primary action — **"Begin the descent"** (this click doubles as the audio-enable gesture), and a scroll cue.
- **Index**: scroll reveals the seven chapters as full-width list rows (number, title, era, one-line description) with live status from the progression engine:
  - `unexplored` — untouched
  - `n/6 experienced` — in progress
  - `continue here →` — the frontier chapter (first incomplete), visually emphasized
  - `✓ complete`
- Soft gate: every row is clickable regardless of status.
- Reduced motion: prologue renders as static text, no reveal animation.

## 5. Progression engine

- **Registry**: extends `src/components/hifi/chapters.ts` with a per-chapter component list — `{ chapterIndex, components: [{ id, name }] }`. Ch01's six components (Initial Entropy, Expansion Rate, Quantum Fluctuations, Dark Energy, Inflation Field, Curvature) register first.
- **State**: React context provider at the app root; persisted to localStorage key **`ftu-progress-v1`** as `{ version, prologueSeen, components: { [componentId]: { interacted, lessonOpened } } }`.
- **Completion rule**: a component is *experienced* when `interacted && lessonOpened`. A chapter is *complete* when all registered components are experienced.
- **API** (context): `markInteracted(id)`, `markLessonOpened(id)`, selectors `componentState(id)`, `chapterProgress(index)` → `{ done, total, complete }`, `frontierChapter()`.
- **Legacy shim**: chapters not yet rebuilt (Wave 2 pending) register a single synthetic component that is marked experienced on visit — so the full 7-chapter arc, index statuses, and transitions work end-to-end from the day the platform ships.
- Storage failures (private mode, quota) degrade silently to in-memory state.

## 6. Earned chapter transitions

Reference: mockup `02-transition.html` (approved).

Every chapter ends with a transition block in two states:

- **Dormant** (components remain): next chapter's title veiled (blur + diagonal veil), eyebrow "Next phase · locked behind understanding", a checklist of the chapter's components (✓ done / ○ open) where **clicking an open item scrolls to that component** — the checklist doubles as navigation — and a "N components remain" line.
- **Earned** (all experienced): veil lifts with a glow, "✓ chapter complete" tag, era counter rolls from the current era to the next chapter's cosmic time, and a **"Descend ↓"** button appears. `AudioDirector.cue('chapter-complete')` fires on the moment of activation.

**Handoff sequence** (on Descend, ~2.5s, skippable by any click/key):

1. **Collapse** — the current chapter's visualization contracts to a single point of light; current palette fades.
2. **Time roll** — the era counter races through cosmic time between the two chapters.
3. **Bloom** — the next chapter blooms from the same point; HUD updates.

Audio crossfades underneath via `AudioDirector.setChapter(nextId)`. Reduced motion: skip straight to a fade cut; the era roll renders as a static "from → to" line. The final chapter (07) replaces the transition with a closing block (end-of-descent summary; content defined in issue C7).

Soft-gate escape hatches unchanged: ChapterRail, HUD arrows, keyboard arrows, and the index always allow free movement; the dormant block gates only the in-flow "Descend" affordance.

## 7. AudioDirector (generative audio)

- **Engine**: Tone.js, **dynamically imported** only after the visitor enables sound — zero bundle/audio cost otherwise. Audio context starts on the "Begin the descent" click or the nav sound toggle (satisfies autoplay policy).
- **API**:
  - `enable() / disable()` — toggle, persisted preference
  - `setChapter(id)` — crossfade to that chapter's palette
  - `setTension(t: 0..1)` — continuous mapping from science state to dissonance
  - `cue(name)` — one-shot events: `lesson-open`, `component-complete`, `chapter-complete`, `broken`
- **Music reflects the information**: each chapter defines a palette (base drone + per-component motif). `setTension` is driven by slider position — inside the Goldilocks band resolves toward consonance; leaving the band detunes/darkens; a collapsed universe (`broken`) is a distinct falling gesture. Completion cadences mark progress.
- **Defaults**: sound off until explicitly enabled; `prefers-reduced-motion` keeps it off by default; toggle lives in the top nav (as mocked).
- Wave 1 ships the engine plus the prologue drone, transition crossfade, and Ch01's palette as the reference implementation. Each Wave 2 chapter ships its own palette definition.

## 8. Content wave — per-chapter template

Every chapter (02–07) is rebuilt to the Ch01 Instrument standard. Each chapter issue must ship:

1. **4–6 components**, each with:
   - Interactive Goldilocks slider with real physical ranges and failure modes at both ends
   - A dedicated visualization responding to the slider in real time
   - A focused view (lesson) with the mind-bending framing: one awe hook, one piece of real math, one "what breaks if you tune this" consequence
   - Registration in the progression registry (replacing that chapter's legacy shim)
2. **Chapter audio palette** — Tone.js scene for AudioDirector (drone, motifs, tension mapping, cadence)
3. **Era metadata** — cosmic timestamp for the transition's time roll (already in `chapters.ts`)
4. **Broken-universe states** — what the viz shows outside the band

Chapter order and draft component lists (each issue begins with a research/outline step; drafts are starting points, not commitments):

| Ch | Title (canonical, from `chapters.ts`) | Draft components |
|----|---|---|
| 02 | Quarks to Atoms | Strong force αs, mass hierarchy, matter/antimatter asymmetry, proton stability — **folds in existing plan `docs/superpowers/plans/2026-05-20-ch02-quarks-to-atoms.md` and issue #20** |
| 03 | First Stars | Fusion ignition threshold, stellar lifetimes, gravity's strength, triple-alpha resonance |
| 04 | Blackhole at the Heart | Black hole feedback, galactic structure, star formation rate |
| 05 | Goldilocks Zone | Metallicity, habitable zone, orbital stability |
| 06 | Chemistry to Codes | Chemistry thresholds, water's anomalies, chirality |
| 07 | Geologic Time | Evolutionary time budget, solar stability, the geologic thermostat |

**Dependency rule**: chapter issues depend only on Wave 1, never on each other — fully parallelizable. We *ship* in narrative order so the deployed story never has a mid-arc gap; unbuilt chapters keep their legacy sections behind the new transition via the shim.

## 9. GitHub issue breakdown

13 issues, all labeled `navigation-redesign`, linked from the epic. Each issue carries a user story ("As a visitor…"), acceptance criteria, and dependency links.

**Epic**
- **E0** — Navigation redesign: cinematic prologue, earned progression, generative audio. Holds this spec's summary, links all issues, tracks both waves.

**Wave 1 — Platform**
- **P1** — Progression engine (§5). *No dependencies; build first.*
- **P2** — Cinematic prologue landing, Variant B (§4). *Depends on P1.*
- **P3** — Earned chapter transitions (§6). *Depends on P1.*
- **P4** — AudioDirector engine (§7). *No dependencies; parallel to P2/P3.*
- **P5** — Wire audio into navigation: prologue drone, transition crossfade + cadences, Ch01 palette/tension as reference. *Depends on P2–P4.*

**Wave 2 — Content** (each depends only on Wave 1)
- **C2** Quarks to Atoms · **C3** First Stars · **C4** Blackhole at the Heart · **C5** Goldilocks Zone · **C6** Chemistry to Codes · **C7** Geologic Time — each carries the §8 template as acceptance criteria with its draft component list. C7 additionally defines the closing block that replaces the final transition.

**Final**
- **P6** — Polish pass: full-arc playthrough, mobile audit, audio mix balance, performance (lazy-load per chapter). *Depends on everything.*

## 10. Out of scope

- Educator mode (removed from the UI in 46c675d; dormant plumbing untouched).
- Accounts / cross-device progress sync — progression is per-browser localStorage.
- Recorded/licensed music — audio is generative only.
- Rewriting Ch01 content — it is the standard the template codifies; it only gains registry registration, audio palette, and the transition block.
