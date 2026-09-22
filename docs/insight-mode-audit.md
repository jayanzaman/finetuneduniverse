# Insight Mode content audit

Board item #1 — "Expand Insight Mode content across all sections."

## Where the insight content lives

After the hi-fi redesign, the per-chapter explanation lives in the **knowledge
summary** (`currentAnswer` + `what remains open`) plus the **sources** block
added in the #39 science audit. The `chapters.ts` metadata drives each chapter;
`ChapterFrame` renders it in the chapter completion block.

## Per-chapter assessment

| Chapter | Topic | Before | After |
|---|---|---|---|
| 01 | Big Bang / low entropy | brief | **expanded** — CMB smoothness (ΔT/T ≈ 10⁻⁵), gravitational entropy, gravity amplification |
| 02 | Matter survival | adequate | unchanged (asymmetry ≈ 10⁻⁹ already stated) |
| 03 | Stellar nucleosynthesis | brief | **expanded** — fusion ladder, supernovae/neutron-star mergers, M⁻²·⁵ lifetime, Population III |
| 04 | Galactic stability | adequate | unchanged |
| 05 | Habitability | brief | **expanded** — 278 K/√d scaling, greenhouse/albedo, 0.95–1.4 AU conservative zone, subsurface-ocean caveats |
| 06 | Abiogenesis | adequate | unchanged |
| 07 | Complex-life timing | adequate | unchanged |

## Changes made

The three topics named in the issue — **Big Bang, stellar nucleosynthesis, and
habitability** — had their `currentAnswer`/`openQuestion` strings deepened with
specific, source-consistent detail. Each now states a concrete quantity or
mechanism (10⁻⁵ temperature contrast, M⁻²·⁵ lifetime + Population III, 278/√d
scaling + 0.95–1.4 AU) that matches the per-model sources committed in the #39
audit.

## References

All sources for these expansions are already wired into the completion block via
`chapterModels.ts` (`sources`), added in the science audit — see
`docs/science-audit.md`. No new citations were required.

## Not done (deliberately)

The remaining chapters (02, 04, 06, 07) were left unchanged: their explanations
are already accurate and adequately scoped, and padding them would add risk
without improving comprehension.