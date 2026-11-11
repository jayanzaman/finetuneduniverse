"""Epic standard test battery — the code-level checks (issue #61).

Covers, for the pilot scenes: test 2 (section names/order), test 3 (poster
matches the final video frame), test 4 (closing spec vs the scene's CLOSE
line, values from the fixture), test 5 (ASSUME = mapped plan wording), test 7
(everything inside the frame at every section end, both aspects), test 13
(typesetting scan), test 14 (morph/live-number scan), test 15 (390 px
readability floor in portrait).
"""

import ast
import json
import math
import re
import subprocess
from pathlib import Path

import numpy as np
import pytest
from manim import Axes, MathTex, Tex, Text, config

import ftu.constants as C
import ftu.style as style
from ftu.levinthal import mfpt_seconds
from ftu.physics import dilution_line, dilution_slopes
from env import bin as _bin
from harness import build_scene, plan_assume_by_scene
from scenes.ch1 import S1_2_Dilution
from scenes.ch8 import S8_3_Levinthal

ROOT = Path(__file__).resolve().parents[2]
MATH = ROOT / "public" / "math"
SCENES_DIR = ROOT / "manim" / "scenes"
FFMPEG = _bin("ffmpeg")

PILOT_CLASSES = {"1.2": S1_2_Dilution, "8.3": S8_3_Levinthal}
EXPECTED_BEATS = {
    "1.2": ["b1_cube", "b2_light", "b3_slopes", "b4_markers", "close"],
    "8.3": ["b1_configurations", "b2_blind_search", "b3_dial", "b4_one_second", "close"],
}

# section snapshots: snapshot i is taken when next_section(name_i) is called,
# so it shows the END state of the previous section
def section_end_states(sections):
    return [(sections[i - 1][0], sections[i][1]) for i in range(1, len(sections))]


# --- test 2: section names, order and count -------------------------------


@pytest.mark.parametrize("scene_id", sorted(PILOT_CLASSES))
def test_section_names_order_and_count(scene_id):
    _, sections = build_scene(PILOT_CLASSES[scene_id])
    names = [name for name, _ in sections[:-1]]  # drop the __END__ marker
    assert names == EXPECTED_BEATS[scene_id]
    manifest = json.loads((MATH / "manifest.json").read_text())
    assert list(manifest["scenes"][scene_id]["beats"]) == EXPECTED_BEATS[scene_id]


# --- test 4: closing spec --------------------------------------------------

# axis extents come from the plan's CLOSE lines ("a axis from 0.1 to 1",
# "U/kT axis from 0 to 4") — layout extents, not data values
EXPECTED_CLOSE = {
    "1.2": {
        "axis_min": 0.1,
        "axis_max": 1.0,
        "band": (C.A_ACCEL, 1.0),
        "walls": [
            (C.A_ACCEL, "solid", "acceleration begins"),
            (C.A_CROSS, "solid", "densities cross"),
        ],
        "marker": 1.0,
        "log": False,
    },
    "8.3": {
        "axis_min": 0.0,
        "axis_max": 4.0,
        "band": (C.LEVINTHAL["U_one_second_kT"], 4.0),
        "walls": [],
        "marker": C.LEVINTHAL["U_one_second_kT"],
        "log": False,
    },
}


@pytest.mark.parametrize("scene_id", sorted(PILOT_CLASSES))
def test_closing_spec_matches_scene_close(scene_id):
    scene, _ = build_scene(PILOT_CLASSES[scene_id])
    assert scene.closing_spec == EXPECTED_CLOSE[scene_id]


# --- test 5: ASSUME wording ------------------------------------------------


@pytest.mark.parametrize("scene_id", sorted(PILOT_CLASSES))
def test_assume_line_is_mapped_plan_wording(scene_id):
    scene, _ = build_scene(PILOT_CLASSES[scene_id])
    expected = style.symbols(plan_assume_by_scene()[scene_id])
    assert scene.assumption_text == expected
    # the mapped wording must be Unicode, not the plan's ASCII
    assert not re.search(r"\b(LambdaCDM|Lambda|eta|sigma|mu)\b|\b\d+(?:\.\d+)?e-?\d+\b", scene.assumption_text)


# --- test 7: everything inside the frame, both aspects --------------------

FRAME_EPS = 0.06  # units; antialiasing margin for strokes


@pytest.mark.parametrize("scene_id", sorted(PILOT_CLASSES))
@pytest.mark.parametrize("portrait", [False, True], ids=["landscape", "portrait"])
def test_all_mobjects_inside_frame_at_section_ends(scene_id, portrait):
    _, sections = build_scene(PILOT_CLASSES[scene_id], portrait=portrait)
    half_w, half_h = config.frame_width / 2, config.frame_height / 2
    for name, mobjects in section_end_states(sections):
        for mob in mobjects:
            if len(mob.get_all_points()) == 0 or type(mob).__name__ == "ValueTracker":
                continue  # invisible helpers (ValueTracker, empty Groups)
            assert mob.get_left()[0] >= -half_w - FRAME_EPS, f"{name}: {mob} past left edge"
            assert mob.get_right()[0] <= half_w + FRAME_EPS, f"{name}: {mob} past right edge"
            assert mob.get_bottom()[1] >= -half_h - FRAME_EPS, f"{name}: {mob} past bottom edge"
            assert mob.get_top()[1] <= half_h + FRAME_EPS, f"{name}: {mob} past top edge"


# --- test 15: 390 px readability floor ------------------------------------


@pytest.mark.parametrize("scene_id", sorted(PILOT_CLASSES))
def test_text_height_floor_in_portrait(scene_id):
    from manim import DecimalNumber

    _, sections = build_scene(PILOT_CLASSES[scene_id], portrait=True)
    for name, mobjects in section_end_states(sections):
        skip = set()  # glyph parts of a DecimalNumber: the whole number is measured
        for mob in mobjects:
            for sub in mob.get_family():
                if id(sub) in skip:
                    continue
                if isinstance(sub, DecimalNumber):
                    skip.update(id(g) for g in sub.get_family())
                    target = sub
                elif type(sub) in (Text, Tex, MathTex):
                    target = sub
                else:
                    continue
                assert target.height >= style.MIN_TEXT_HEIGHT * 0.99, (
                    f"{scene_id} {name}: {getattr(target, 'text', target)!r} is "
                    f"{target.height:.3f} units, below {style.MIN_TEXT_HEIGHT}"
                )


# --- test 3: poster matches the final video frame --------------------------


def _rgb(path, extra_in=()):
    dims = probe_size = None
    out = subprocess.run(
        [str(FFMPEG), "-v", "error", *extra_in, "-i", str(path), "-frames:v", "1",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        capture_output=True, check=True,
    ).stdout
    probe = subprocess.run(
        [_bin("ffprobe"), "-v", "error",
         "-show_entries", "stream=width,height", "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    )
    stream = json.loads(probe.stdout)["streams"][0]
    w, h = stream["width"], stream["height"]
    return np.frombuffer(out, dtype=np.uint8).reshape(h, w, 3).astype(np.int16)


@pytest.mark.parametrize("scene_id", sorted(PILOT_CLASSES))
@pytest.mark.parametrize("aspect", ["landscape", "portrait"])
def test_poster_matches_final_frame(scene_id, aspect):
    clip = MATH / scene_id / f"close.{aspect}.mp4"
    poster = MATH / scene_id / f"poster.{aspect}.png"
    if not clip.exists() or not poster.exists():
        pytest.skip("clips not rendered")
    final = _rgb(clip, extra_in=("-sseof", "-0.2"))
    still = _rgb(poster)
    assert final.shape == still.shape
    mean_diff = np.abs(final - still).mean(axis=(0, 1))
    assert all(mean_diff <= 4), f"{scene_id} {aspect}: mean abs diff per channel {mean_diff}"


# --- tests 13/14: source scans over manim/scenes/*.py ---------------------

_TEXT_FORBIDDEN = re.compile(r"\b(LambdaCDM|Lambda|eta|sigma|mu)\b|\+/-|\b\d+(?:\.\d+)?e-?\d+\b")
_TEX_FORBIDDEN = re.compile(r"(?<!\\)\b(LambdaCDM|Lambda|eta|sigma|mu)\b")
_SCENE_FILES = sorted(SCENES_DIR.glob("ch*.py")) + [SCENES_DIR / "ub.py"]


def _string_args(call):
    for arg in call.args:
        if isinstance(arg, ast.Constant) and isinstance(arg.value, str):
            yield arg.value


def _func_name(call):
    func = call.func
    if isinstance(func, ast.Name):
        return func.id
    if isinstance(func, ast.Attribute):
        return func.attr
    return ""


@pytest.mark.parametrize("path", _SCENE_FILES, ids=lambda p: p.name)
def test_typesetting_scan(path):
    tree = ast.parse(path.read_text())
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        name = _func_name(node)
        if name == "Text":
            for s in _string_args(node):
                assert not _TEXT_FORBIDDEN.search(s), f"{path.name}: ASCII in Text({s!r})"
        elif name in ("Tex", "MathTex"):
            for s in _string_args(node):
                assert not _TEX_FORBIDDEN.search(s), (
                    f"{path.name}: bare Greek word in {name}({s!r}) — use \\commands"
                )


@pytest.mark.parametrize("path", _SCENE_FILES, ids=lambda p: p.name)
def test_morph_and_live_number_scan(path):
    src = path.read_text()
    tree = ast.parse(src)
    for node in ast.walk(tree):
        # no MathTex/Tex built inside an updater or always_redraw lambda
        if isinstance(node, ast.Lambda):
            for inner in ast.walk(node):
                if isinstance(inner, ast.Call) and _func_name(inner) in ("Tex", "MathTex"):
                    raise AssertionError(f"{path.name}: {_func_name(inner)} built inside a lambda")
        # TransformMatchingTex needs isolated parts somewhere in the file
    if "TransformMatchingTex" in src:
        assert "substrings_to_isolate" in src or "{{" in src, (
            f"{path.name}: TransformMatchingTex without isolated parts"
        )


# --- pilot maths (issue #63 auto items) ------------------------------------


def test_dilution_line_fits_recover_slopes():
    for slope in dilution_slopes():
        f = dilution_line(slope, 0.7)
        xs = np.linspace(-1.0, 0.0, 11)
        ys = [f(x) for x in xs]
        fitted = np.polyfit(xs, ys, 1)[0]
        assert abs(fitted - slope) < 1e-6, f"fitted slope {fitted} != {slope}"


def test_dilution_markers_recomputed_from_omegas():
    from ftu.physics import a_accel, a_cross

    assert round(a_accel(C.OMEGA_M, C.OMEGA_LAMBDA), 2) == C.A_ACCEL
    assert round(a_cross(C.OMEGA_M, C.OMEGA_LAMBDA), 2) == C.A_CROSS


def test_levinthal_curve_true_start_visible():
    _, sections = build_scene(S8_3_Levinthal)
    end_of_b4 = dict(section_end_states(sections))["b4_one_second"]
    axes = next(m for m in end_of_b4 if isinstance(m, Axes))
    curve_start = math.log10(float(mfpt_seconds(0)))  # ~36.4
    assert axes.y_range[1] >= curve_start, "curve's true start is clipped"
    assert axes.y_range[0] <= 0.0, "the one-second line is off-screen"
    spy = 365.25 * 86400
    ref = math.log10(C.LEVINTHAL["blind_years"] * spy)  # 1e27 yr, the classic reference
    assert ref < curve_start, "the 1e27-yr reference must sit clearly below the model's U=0 value"
