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

## Remaining work

1. Add an explicit outcome-summary block (formula + live result + band status) to
   the labs that only imply it: Matter (02), Galaxy (04), Geology (07).
2. Add interaction tests for the six labs that lack one, using the existing
   Vitest + RTL pattern (`cleanup()` in `afterEach`, no jest-dom).
3. Add a unit/normalized label convention everywhere and call out assumptions
   ("normalized teaching value" vs a real physical unit).

This is intentionally incremental — each lab can be completed as its own
sub-task without cross-lab refactors.