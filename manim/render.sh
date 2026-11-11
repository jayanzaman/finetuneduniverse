#!/usr/bin/env bash
# Render one scene or all, both aspect ratios, 30 fps, with per-beat section
# clips and poster PNGs, then copy into public/math/<scene_id>/ and rebuild
# public/math/manifest.json. Spec: docs/manim-plan.md, STAGE 1.
#
#   manim/render.sh S1_2_Dilution     # one scene
#   manim/render.sh all               # every implemented scene
#
# Portrait has no CLI flag (ground rule 10); ftu.style.apply_aspect_from_env
# reads FTU_PORTRAIT and sets frame/pixel geometry.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$PWD"

PYBIN="$ROOT/manim/.venv/bin"
export PATH="$PYBIN:$HOME/.TinyTeX/bin/x86_64-linux:$HOME/.local/bin:$PATH"
export PYTHONPATH="$ROOT/manim"

# Local dev renders through manim/.venv; CI provides manim/python on PATH via conda
if [ -x "$PYBIN/manim" ]; then
  MANIM="$PYBIN/manim"
  PYTHON="$PYBIN/python"
else
  MANIM="manim"
  PYTHON="python"
fi

TARGET="${1:-}"

scene_file_for() {
  case "$1" in
    S1_*) echo ch1 ;; S2_*) echo ch2 ;; S3_*) echo ch3 ;; S4_*) echo ch4 ;;
    S5_*) echo ch5 ;; S6_*) echo ch6 ;; S7_*) echo ch7 ;; S8_*) echo ch8 ;;
    SU_*) echo ub ;; SmokeScene) echo _smoke ;;
    *) echo ""; return 1 ;;
  esac
}

scene_id_for() {
  # S1_2_Dilution -> 1.2 ; SU_1_DrakeDistributions -> U.1 ; SmokeScene -> _smoke
  case "$1" in
    SmokeScene) echo "_smoke" ;;
    SU_*) echo "$1" | sed -E 's/^SU_([0-9]+)_.*/U.\1/' ;;
    S*_*) echo "$1" | sed -E 's/^S([0-9]+)_([0-9]+)_.*/\1.\2/' ;;
  esac
}

render_scene() {
  local scene="$1" file id
  file=$(scene_file_for "$scene")
  id=$(scene_id_for "$scene")
  echo "=== $scene (scene_id=$id, file=$file.py) ==="

  for aspect in landscape portrait; do
    local portrait_flag=0
    [ "$aspect" = portrait ] && portrait_flag=1
    local media="$ROOT/manim/media/$aspect"

    FTU_PORTRAIT=$portrait_flag "$MANIM" render \
      --save_sections --media_dir "$media" \
      "$ROOT/manim/scenes/$file.py" "$scene"

    # poster: last frame of the closing section
    FTU_PORTRAIT=$portrait_flag "$MANIM" render -s \
      --media_dir "$media" \
      "$ROOT/manim/scenes/$file.py" "$scene"

    # collect section clips + poster into public/math/<id>/
    local out="$ROOT/public/math/$id"
    mkdir -p "$out"
    find "$media" -path '*sections*' -name "${scene}_*.mp4" | while read -r clip; do
      base=$(basename "$clip" .mp4)
      # strip leading "<Scene>_" / index prefixes, keep the section name
      beat=$(echo "$base" | sed -E "s/^${scene}_?[0-9]*_?//; s/[^A-Za-z0-9_-]/_/g")
      [ -n "$beat" ] || beat=$(basename "$clip" .mp4)
      cp "$clip" "$out/$beat.$aspect.mp4"
    done
    poster=$(find "$media/images" -name "${scene}_*.png" 2>/dev/null | head -1 || true)
    [ -n "${poster:-}" ] && cp "$poster" "$out/poster.$aspect.png"
  done
}

if [ "$TARGET" = "all" ]; then
  mapfile -t SCENES < <(grep -hoE '^class (S[0-9U][0-9A-Za-z_]*)\(FTUScene\)' manim/scenes/*.py \
    | sed -E 's/^class ([A-Za-z0-9_]+).*/\1/' | sort -u)
elif [ -n "$TARGET" ]; then
  SCENES=("$TARGET")
else
  echo "usage: $0 <SceneClass|all>" >&2
  exit 2
fi

for s in "${SCENES[@]}"; do
  render_scene "$s"
done

"$PYTHON" "$ROOT/manim/ftu/build_manifest.py"
echo "=== render complete ==="
