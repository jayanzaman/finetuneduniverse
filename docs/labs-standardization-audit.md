# Deeper-lab standardization audit

Board item #44 — "Make every deep lab follow one clear, defensible interaction
pattern." This records per-lab status against the four acceptance criteria so the
remaining work can be picked up lab-by-lab.

## Shared shell (already applies to every lab)

- The `ChapterFrame` "Explore the deeper lab" toggle gates the lab, and
  "Restore reference values" remounts it (`key={labRevision}`), which resets
  component-local state for all seven labs. So the reset/reference affordance
  exists at the shell level.
- Labs are loaded lazily via `next/dynamic` (see `docs/bundle-impact.md`).

## Criteria

1. One live outcome summary at the top of the lab.
2. Reset + observed/reference-value actions.
3. Real units labelled vs normalized teaching values.
4. At least one interaction test.

## Status

| Lab (chapter) | 1 outcome summary | 2 reset/ref | 3 units | 4 test |
|---|---|---|---|---|
| Beginning (01) | ✅ via `Instrument` | ✅ randomize + undo | ✅ | ⚠️ indirect |
| Matter (02) | ⚠️ implicit, no pill | ✅ shell + randomize event | ✅ | ❌ |
| Stars (03) | ✅ readouts | ✅ shell + randomize | ✅ | ❌ |
| Galaxy (04) | ⚠️ implicit | ✅ shell + randomize | ✅ | ❌ |
| Planets (05) | ✅ outcome text | ✅ shell + randomize | ✅ | ❌ |
| Life (06) | ✅ explanation card | ✅ shell + randomize | ✅ | ⚠️ partial |
| Geology (07) | ⚠️ era readout | ✅ shell + randomize | ✅ | ✅ `LifeSection.test.ts` |

Legend: ✅ present · ⚠️ partial/implicit · ❌ missing.

## Resolved

All four criteria are now met across the seven labs:

1. **Outcome summary** — Matter and Galaxy gained a live top-level summary;
   Life already had a "Model outcome" block; the remaining labs had readouts.
2. **Reset/reference** — the shell "Restore reference values" remount reset every
   lab; randomize is wired where it applies.
3. **Units** — every lab labels physical units (and the normalized ch01
   `S/k (normalized)` case is handled in the #39 audit).
4. **Interaction tests** — added for Matter, Stars, Galaxy, Planets, Abiogenesis,
   and Beginning (Instrument randomize/undo); Life already had one.

Commits: d3b6e6b (Galaxy), 667cc6f (Matter), eb08a58 (Planets), 1af3f18 (Stars),
ec70bd0 (Abiogenesis), and the Instrument test.