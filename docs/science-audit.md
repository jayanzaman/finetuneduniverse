# Science and mathematics audit

Board item #39 — "Audit scientific claims, uncertainty, and citations." This
documents the guided story's major claims, verifies the quantitative model,
classifies each chapter's confidence status, and lists the consequential
numbers with sources. Claim metadata (evidence labels + sources) is covered by
automated tests and rendered in the completion block.

## Method

Every chapter's primary model was checked by (a) deriving the formula from
physical relations and (b) comparing its constants and band edges to published
values. Wording absolutes ("optimal", "required", "had to") were inventoried and
flagged where they present a model as settled measurement.

Confidence taxonomy used throughout the UI:

- **Observation + model** — measured and reproduced.
- **Model-dependent inference** — consistent with data but not directly observed.
- **Simplified teaching model** — normalized or deliberately compressed.
- **Open scientific question** — no settled explanation.

---

## Chapter-by-chapter

### 01 · The Beginning — *low-entropy start* — **Open question**

- **Question:** why did the universe begin low-entropy? *(open)*
- **Model:** normalized "entropy per baryon" score, `|S/k − 1|`, band 0.5–1.5.
- **Math check:** the score is a *normalized* teaching variable. The real
  photon-era entropy per baryon is `s/k_B ≈ 10⁹` (Kolb & Turner; covered in
  Carroll 2010). The slider range 0.1–10 therefore represents ≈10⁸–10¹⁰, with
  "1" ≈ 10⁹. **Flag:** the unit label `S/k` reads as a literal value; it should
  say it is normalized.
- **Evidence label:** correct (open question). CMB smoothness ΔT/T ≈ 10⁻⁵ is
  measured, but *why* it started that way is unsettled.

### 02 · Matter — *why did any matter survive?* — **Model-dependent inference**

- **Question:** baryogenesis / matter–antimatter asymmetry *(model inference)*.
- **Narrative number:** "one part in a billion" — matches the measured baryon
  asymmetry η ≈ 6 × 10⁻¹⁰ (Planck 2018). ✓
- **Model:** strong-coupling ratio `gₛ/gₛ₀`, band 0.98–1.02.
- **Math check:** a ratio (normalized), fine-tuned by ±2%. This is the standard
  "light-element fine-tuning" illustration (Rees, *Just Six Numbers*), not a
  measured bound. **Flag:** outcome text "stable protons become unlikely" — the
  bound is really about deuterium/nuclear-binding and stellar nucleosynthesis,
  not proton decay. Re-word to "bound nuclei / light elements".
- **Evidence label:** correct.

### 03 · Stars — *why can stars make elements?* — **Observation + model**

- **Model:** main-sequence lifetime `τ ≈ 10¹⁰ yr × (M/M☉)⁻²·⁵`.
- **Math check:** ✓ correct. Mass–luminosity `L ∝ M^3.5` (main sequence) with
  `τ ∝ M/L` gives `τ ∝ M^{-2.5}`; anchored to the Sun's ≈10¹⁰ yr.
- **Narrative numbers:** fusion ignition ≈ 1.5 × 10⁷ K ✓; first stars ≈
  100–250 Myr after the Big Bang ✓ ("~200 million years" is mid-range).
- **Evidence label:** correct (nucleosynthesis pathways are observed+m modeled).

### 04 · Galaxy — *a darkness at the heart* — **Model-dependent inference**

- **Model:** central black-hole mass `M = 10ˣ M☉`, band log₁₀ 6–7.3.
- **Math check:** ✓. Default `6.61` ≈ 4.1 × 10⁶ M☉, matching Sgr A* (4.15 × 10⁶
  M☉, Ghez et al. 2008). The M–σ relation is observed; that a particular SMBH
  mass is *required* for a settled disc is model inference.
- **Evidence label:** correct (the causal role is the model-dependent part).

### 05 · Planets — *how narrow is habitability?* — **Simplified model**

- **Model:** equilibrium temperature `T ≈ 278 K / √(d/AU)`, band 0.95–1.37 AU.
- **Math check:** ✓ correct for a no-albedo blackbody: flux ∝ d⁻², T ∝ flux^¼, so
  T ∝ d⁻½; 278 K at 1 AU reproduces the standard 255–278 K range once albedo is
  included. The 0.95–1.37 band is a defensible conservative-ish habitable zone
  (Kopparapu et al. 2014).
- **Flag (internal inconsistency):** the prose says "move inward by a tenth →
  boil, outward by a tenth → freeze", but ±10% is 0.9–1.1 AU — 1.1 AU is still
  *inside* the model's own temperate band (0.95–1.37). The rhetorical "narrower
  than the orbit itself" overstates the width. Align prose with the 0.95/1.37 edges.
- **Evidence label:** correct (habitable-zone width is a simplified model).

### 06 · Life — *can chemistry copy itself?* — **Open question**

- **Model:** UV flux "productive window" 8–28 W/m².
- **Math check:** not a closed-form law — a qualitative teaching control. The
  numeric window is illustrative, not a measured biological threshold.
- **Evidence label:** correct (no historically verified abiogenesis pathway).

### 07 · Geology — *why did complex life take so long?* — **Observation + model**

- **Model:** oxygenation timing, band 1.8–3 Gyr after formation.
- **Math check:** ✓. Great Oxidation Event ≈ 2.4 Ga (≈2.1 Gyr after a 4.54 Ga
  formation) sits inside the band; initial 2.4 Gyr is consistent.
- **Evidence label:** correct (timeline is observed; the "had to arrive" causal
  framing is interpretive).

---

## Flags and resolutions

| # | Issue | Severity | Action |
|---|-------|----------|--------|
| 1 | ch01 `S/k` unit unlabelled as normalized | accuracy | label unit `S/k (normalized)` |
| 2 | ch02 "stable protons become unlikely" | accuracy | reword to nuclei/light elements |
| 3 | ch05 prose "±10% → freeze" contradicts 1.37 AU band | internal consistency | align prose/ghost with 0.95/1.37 |
| 4 | No source metadata on quantitative claims | completeness | add per-model `sources` |
| 5 | Rhetorical absolutes ("optimal", "had to arrive", "narrower than the orbit") | tone | hedge in copy as model/illustrative |
| 6 | Slider `zone` (visual "in band") misaligned with the model's actual band in most chapters | accuracy | derive `zone` from `model.band` |

Flags 1–4 and 6 are resolved in code (per-model `sources` + `band`, normalized
S/k label, ch02 wording, ch05 prose, zone derived from the band). Flag 5 is
editorial and left open for a copy pass.

## Source list (recommended, used as per-model metadata)

- **01** Carroll (2010) *From Eternity to Here*; Penrose (2004) *The Road to
  Reality*; Planck Collaboration (2020) A&A 641, A6.
- **02** Rees (2000) *Just Six Numbers*; Sakharov (1967); Planck 2018 baryon
  asymmetry.
- **03** Burbidge, Burbidge, Fowler & Hoyle (1957) Rev. Mod. Phys. 29, 547;
  Kippenhahn & Weigert (1990).
- **04** Ghez et al. (2008) ApJ 689, 1044; Kormendy & Ho (2013) ARA&A 51, 511.
- **05** Kasting, Whitmire & Reynolds (1993) Icarus 101, 108; Kopparapu et al.
  (2014) ApJ 787, L29.
- **06** Miller (1953) Science 117, 528; Patel et al. (2015) Nat. Chem. 7, 301.
- **07** Holland (2006) Phil. Trans. R. Soc. B 361, 903; Lyons, Reinhard &
  Planavsky (2014) Nature 506, 307.