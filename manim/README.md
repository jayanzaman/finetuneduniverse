# Manim pipeline for finetuneduniverse.net

Spec: `../docs/manim-plan.md`. Tracker: GitHub issues #61 (epic), #62 (this
toolchain), #63 (pilots), #64–#83 (scenes).

## Layout

- `ftu/constants.py` — every on-screen number; mirrors
  `tests/fixtures/numbers.json` (owner-reviewed) exactly.
- `ftu/tex.py` — every TEX line from the plan, verbatim, keyed by scene.
- `ftu/physics.py` — the maths as plain functions; scenes draw what they return.
- `ftu/levinthal.py` — exact mean first-passage time for scene 8.3 (mpmath).
- `ftu/style.py` — palette/fonts from the site, `FTUScene`, `assumption_line`,
  `closing_frame`, the ASCII→symbols mapping, the 390 px readability floor.
- `scenes/ch1.py … ch8.py, ub.py` — one class per scene (`S1_2_Dilution`, …).
- `render.sh` — renders one scene class or `all`: landscape 1920x1080 and
  portrait 1080x1350 at 30 fps with `--save_sections`, poster PNGs, copies to
  `public/math/<scene_id>/`, rebuilds `public/math/manifest.json`.
- `tests/` — pytest battery (see below).

## Rebuilding the environment

The env is user-space only (no sudo). pycairo has no Linux wheel, so Python
comes from conda-forge via micromamba; TeX comes from TinyTeX.

```sh
# 1. micromamba (https://mamba.readthedocs.io) — install the binary, then:
micromamba create -p manim/.venv -c conda-forge \
  python=3.12 pycairo=1.29.2 cairo=1.18.6 ffmpeg=9.0.2 \
  manim=0.22.1 mpmath numpy pytest
# (conda-forge pulls in the remaining python deps: numpy 2.5.4, mpmath 1.4.1,
#  pillow 12.2.0, scipy 1.18.1, pytest 9.0.3, ManimPango 0.7.1, …)

# 2. TinyTeX (https://yihui.org/tinytex/) — MathTex needs latex + dvisvgm:
#    install TinyTeX to ~/.TinyTeX, then:
tlmgr install babel-english standalone preview dvisvgm amsmath mathtools \
  amsfonts ec cm-super dsfont setspace relsize ragged2e everysel mathastext

# 3. Site fonts (Manim's Text uses Pango, which reads fontconfig):
#    place Unbounded.ttf, SpaceGrotesk.ttf, SpaceMono-*.ttf, Newsreader*.ttf
#    in ~/.fonts and run: fc-cache -f
```

Verify:

```sh
manim/render.sh SmokeScene          # end-to-end smoke render
cd manim && .venv/bin/python -m pytest tests/ -q
```

`manim checkhealth` should pass for latex and dvisvgm. render.sh prepends
`manim/.venv/bin` and `~/.TinyTeX/bin/x86_64-linux` to PATH itself.

## Conventions for new scenes

- Numbers only from `ftu/constants.py`; equations only from `ftu/tex.py`;
  maths only from `ftu/physics.py`. Tests enforce all three.
- Beats: `self.next_section("b1_<slug>")` … then `"close"`; each beat < 10 s.
- `self.assumption_line(ASSUME)` with the plan's exact ASCII wording — the
  symbols mapping is applied for you; the result must clear 0.196 units tall.
- `self.closing_frame(...)` records `self.closing_spec` for the battery.
- Text: use `style.readable_text()` (wraps instead of shrinking). MathTex may
  `scale_to_fit_width` only if you then restore the height floor.
- Layout from `config.frame_width` / `config.frame_height` only, both aspects.
