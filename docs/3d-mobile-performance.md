# 3D / canvas mobile performance

Board item #2 — "Optimize 3D visualizations for mobile."

## Current state

- The only three.js surface in the *hi-fi* guided story is the universe-geometry
  lab (`UniverseGeometry3D`). Its `<Canvas>` now caps the pixel ratio at
  `dpr={[1, 2]}`, the single largest win on high-DPI phones (a DPR-3 phone
  renders ≈2× fewer fragments than before).
- The legacy `/experience` canvas (`ExperienceCanvas`) already caps `dpr={[1, 2]}`
  and requests a high-performance GPU.
- All heavy labs are code-split and load only on demand (see
  `docs/bundle-impact.md`), so the Three.js bundle is not in the first paint.

## Remaining to verify on real devices

- Profile on iOS Safari and Android Chrome (issue criteria). The DPR cap and
  deferred loading are the main levers already applied; further reduction
  (lower-poly LOD, `frameloop="demand"`) should be driven by that profiling.
- The 2D canvas visuals (CMB maps, matter fields, metallicity spectrum) redraw
  per frame in `useEffect`/`requestAnimationFrame`; they are cheap at their
  current grid sizes but are the next candidates if low-end profiling shows
  frames dropping.