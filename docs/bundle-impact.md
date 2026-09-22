# Lab bundle strategy

The seven "deeper lab" modules are the heaviest client code paths (Three.js/R3F
scenes, canvas visualizations). They are deliberately kept out of the initial
chapter route payload.

## Approach

- `src/components/universe-builder/UniverseBuilderApp.tsx` imports every lab via
  `next/dynamic(() => import('./sections/...'), { loading: labLoading })`.
- `UniverseBuilderApp` renders the active lab only after the visitor opens
  "Explore the deeper lab" (`ChapterFrame` gates `children` behind the
  `showDeepDive` toggle). On initial server render `showDeepDive` is `false`, so
  the lab component is neither server-rendered nor part of the initial JS bundle.
- `labLoading` renders a stable, fixed-height placeholder
  (`.deep-lab-loading`, `min-height: 220px`) so opening a lab does not shift the
  page layout while its chunk loads.

## Verified

Headless-Chrome check on `/questions/why-did-the-universe-begin-ordered`:

- `0` deeper-lab DOM before opening (not SSR'd, not mounted).
- `0` lab module requests on initial load.
- Exploring the lab mounts it and the interaction becomes available.

## Measuring impact

Run a production build and inspect the emitted chunks:

```bash
npm run build
ls -lh .next/static/chunks/ | sort -k5 -h | tail -20
```

Each heavier lab (e.g. `StarlightSection`, `GalacticHeartSection`) resolves to
its own on-demand chunk rather than inflating the shared first-load bundle.