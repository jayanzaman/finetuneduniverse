# Redesign brief: QuranicReflections (verse modal + reflection data)

> Source: `src/components/universe-builder/QuranicReflections.tsx` (192 lines).
> **Mount status: data-only at present.** The `QuranicReflectionModal` component is
> exported but not currently rendered by `UniverseBuilderApp.tsx` or any hi-fi
> shell file. The `quranicReflections` data record is referenced by the legacy
> section files; the hi-fi rewrite has not yet wired up the modal.

This file is a self-contained companion-layer: a modal that surfaces a Quranic
verse and a curated reflection on a "perfect" universe configuration. It is
clearly intended to fire at completion moments (per the `trigger: 'perfect' | 'good'
| 'special'` field on each entry).

---

## 1. What it is

Two exports:

1. `QuranicReflectionModal` — a `framer-motion` portal-style modal (`fixed inset-0
   z-[100]`), backdrop-blur, click-outside-to-close, with a fixed amber/orange
   palette.
2. `quranicReflections` — a record keyed by section identifier. Ten entries today:
   `beginning · matter · starlight · galacticHeart · planets · abiogenesis · life ·
   complexity · reflective`. (Two of those — `complexity` and `reflective` —
   correspond to the orphan sections; the other eight align with the seven hi-fi
   chapters with `beginning` covering Chapter 01 and a missing entry for any
   "Anthropocene" / Chapter 07 extension.)

### Reflection entry shape

```ts
interface QuranicReflection {
  arabic: string;          // RTL Arabic, rendered in Amiri serif
  translation: string;     // English meaning
  transliteration: string; // Latin-script pronunciation
  reference: string;       // e.g. "51:47"
  context: string;         // 1–2 sentence reflection tying the verse to the section
  trigger: 'perfect' | 'good' | 'special';
}
```

All ten current entries are tagged `trigger: 'perfect' as const`. The `'good'` and
`'special'` branches exist in the type but have no data.

### Modal layout

```
fixed inset-0 z-[100]
└─ bg-black/80 backdrop-blur-sm  (click closes)
   └─ max-w-2xl w-full · gradient amber-50 → orange-50  (dark: amber/orange-900/20)
      ├─ Header: 40×40 amber/orange-gradient circle [BookOpen icon] + h3 "Divine Reflection" + p "Quran {reference}" + close [X]
      ├─ Content (p-6 space-y-6)
      │  ├─ Arabic (Amiri serif, RTL, text-2xl, amber-900)
      │  ├─ Transliteration (italic, amber-700)
      │  ├─ Translation card (white/50 bg, amber border): "{translation}" + — Quran {reference}
      │  └─ Reflection on Creation card (amber-100 → orange-100 gradient): h4 + context
      └─ Footer: "May this reflection deepen your contemplation of Allah's creation"
```

Visual signature:

- Two-stop amber→orange gradient for *everything* (header avatar, container bg,
  context card bg).
- BookOpen icon from `lucide-react` (5×5 white inside the avatar).
- Arabic via inline `style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }}` —
  font is *not* imported anywhere in the layout; the system falls back to system
  serif if Amiri isn't installed.
- Light-mode and dark-mode variants are both present (`dark:` prefixes
  everywhere) even though the rest of the hi-fi shell does not toggle dark mode.

---

## 2. The ten reflections (verbatim)

(All trigger = `'perfect'`.)

| Key            | Reference | Arabic + transliteration                                                                                 | Translation                                                                                                                                                                                  |
|----------------|-----------|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| beginning      | 51:47     | `وَإِنَّا لَمُوسِعُونَ` · *Wa inna la-musi'un*                                                            | "And it is We who are steadily expanding it"                                                                                                                                                  |
| matter         | 21:30     | `وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ` · *Wa ja'alna min al-ma'i kulla shay'in hayy*                | "And We made from water every living thing"                                                                                                                                                   |
| starlight      | 78:13     | `وَجَعَلْنَا السِّرَاجَ وَهَّاجًا` · *Wa ja'alna as-siraja wahhajan*                                       | "And We made [therein] a burning lamp"                                                                                                                                                        |
| galacticHeart  | 13:8      | `وَكُلُّ شَيْءٍ عِندَهُ بِمِقْدَارٍ` · *Wa kullu shay'in 'indahu bi-miqdaar*                              | "And everything with Him is in due proportion"                                                                                                                                                |
| planets        | 15:19     | `وَالْأَرْضَ مَدَدْنَاهَا...` · *Wal-arda madadnaha wa alqayna fiha rawasiya wa anbatnaa fiha min kulli shay'in mawzun* | "And the earth — We have spread it and cast therein firmly set mountains and made to grow therein all kinds of things in good proportion"                                          |
| abiogenesis    | 21:30     | `وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ أَفَلَا يُؤْمِنُونَ` · *Wa ja'alna min al-ma'i ... afala yu'minun* | "And We made from water every living thing; then will they not believe?"                                                                                                                  |
| life           | 24:45     | `وَاللَّهُ خَلَقَ كُلَّ دَابَّةٍ مِن مَّاءٍ` · *Wallahu khalaqa kulla dabbatin min ma'*                    | "And Allah has created every living creature from water"                                                                                                                                      |
| complexity     | 41:53     | `سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ ...` · *Sanurihim ayatina fi'l-afaqi wa fi anfusihim hatta yatabayyana lahum annahu'l-haqq* | "We will show them Our signs in the horizons and within themselves until it becomes clear to them that it is the truth"                                                            |
| reflective     | 3:190     | `إِنَّ فِي خَلْقِ السَّمَاوَاتِ ...` · *Inna fi khalqi's-samawati wal-ardi wakhtilafi'l-layli wan-nahari la-ayatin li-uli'l-albab* | "Indeed, in the creation of the heavens and the earth and the alternation of the night and the day are signs for those of understanding"                                       |

The `matter` and `abiogenesis` entries both quote **21:30** ("water"). The
`abiogenesis` version is the longer rhetorical form with the closing question; if
both ship, that overlap should be addressed.

The contexts (the per-section reflective paragraphs) are full sentences in the
authorial voice of the site:

- *beginning* — "...mirror the divine wisdom in setting the initial parameters..."
- *matter* — "...reflects the divine precision in creating the building blocks of life."
- *starlight* — "...divine creation of celestial furnaces that forge the elements..."
- *galacticHeart* — "...the divine principle of measured proportion..."
- *planets* — "...perfect balance — not too hot, not too cold..."
- *abiogenesis* — "...chemical pathways from simple molecules to self-replicating systems..."
- *life* — "...the divine miracle of bringing forth consciousness from simple elements..."
- *complexity* — "...the ultimate sign — beings capable of contemplating their own existence..."
- *reflective* — "...Every parameter you've adjusted reveals the infinite wisdom behind existence."

These should be treated as reviewed editorial copy and preserved unless the
editorial intent of the redesign explicitly changes.

---

## 3. UX patterns to preserve

1. **Reflection is opt-in, never forced.** The data is keyed by section identifier
   and tagged with a `trigger`; the modal only opens on user action or on a
   completion event, not as a layover that interrupts the chapter flow.
2. **Three-line presentation: Arabic / transliteration / translation.** The order
   is canonical: RTL script first, sound second, meaning third. Don't collapse the
   transliteration row even though it's the most easily skipped — non-Arabic-readers
   often *just* read it.
3. **Verse reference is shown twice on purpose.** Once next to the BookOpen avatar
   ("Quran 51:47") and once underneath the translation ("— Quran 51:47"). It is
   the only piece of metadata that is more important than the visual.
4. **One verse per section, not a carousel.** Each section gets exactly one entry.
   The richness comes from the per-verse `context` paragraph, not from quantity.
5. **The footer line.** "May this reflection deepen your contemplation of Allah's
   creation" is editorial; keep it whatever the redesign does.

## 4. UX patterns to reimagine

- **The amber/orange palette.** The modal currently looks like a Notion daily-quote
  card. The hi-fi shell uses `--indigo`, `--ink`, `--goldilocks`, and hair lines.
  A redesign should bring the modal into that token system — the verse can still be
  the *warmest* surface in the app, but it should look like it belongs.
- **The avatar circle + lucide icon.** The hi-fi shell does not use lucide-react.
  Replace with a small ink ladder mark (e.g. a horizontal hair underline + the
  number "Quran 51:47" in `.mono`), no avatar icon needed.
- **Dark mode classes.** Strip; the shell does not have a dark/light toggle.
- **`max-w-2xl` modal.** The shell prefers `max-w-prose` (≈ 720px) and column-based
  layouts. Consider an inline reveal in the right margin of the chapter (next to
  the ghost card) rather than a full-screen modal.
- **Click-outside-to-close only.** Add explicit `Esc` to close and trap focus
  inside the modal (current implementation does neither — accessibility gap).
- **Fixed Amiri serif via inline style.** Either ship Amiri via `next/font` or
  let the Arabic settle on a system-wide RTL fallback (Noto Naskh Arabic is a
  reasonable default).

## 5. Wire-up that doesn't exist yet (but probably should)

1. The hi-fi `ChapterFrame` has no slot for a "reveal a verse" action. A minimal
   wire-up would add a hair-line button in the chapter footer next to the
   `scroll-cue`, labelled "Reflection" or "ʾāya". Clicking it opens the modal
   filtered by chapter index.
2. The mapping from chapter index → reflection key needs to be explicit:

   | Chapter index | reflection key  |
   |---------------|-----------------|
   | 0 (Beginning) | beginning       |
   | 1 (Matter)    | matter          |
   | 2 (Starlight) | starlight       |
   | 3 (Galactic)  | galacticHeart   |
   | 4 (Planets)   | planets         |
   | 5 (Abiogenesis)| abiogenesis    |
   | 6 (Life)      | life            |
   | — (orphan)    | complexity      |
   | — (orphan)    | reflective      |

3. The `trigger` enum is currently dead state. If kept, the only meaningful
   trigger is `'perfect'` (i.e. "the user is on the band"). The redesign should
   either populate `'good'` and `'special'` with alternate verses for *near-miss*
   states, or remove the union and let each entry be unconditional.
4. The Arabic font (`Amiri`) needs to be loaded by `next/font` — currently
   referenced only by inline `fontFamily`.

## 6. Tone notes

This file is *the* most editorially sensitive surface in the codebase. The
redesign brief should explicitly say:

- The Arabic text, references, and translations are not copy to be edited by a
  designer — flag any changes to a reviewer who reads Arabic.
- The `context` paragraphs are authored to harmonize with the site's reverent
  rather than apologetic register. Keep that voice; the redesign should not
  hedge them into "some people see this as evidence of..." framings.
- The footer line is the only piece of explicit theistic address ("Allah's
  creation"). The redesign decides whether the modal is meant to address a
  Muslim reader directly (keep it) or a curious general reader (consider a
  more neutral footer like "May this reflection deepen your contemplation
  of creation").
