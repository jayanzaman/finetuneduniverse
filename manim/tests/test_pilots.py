"""Stage 2 pilot battery (issue #63): verifies the shipped clips for scenes
1.2 and 8.3 in public/math/ — beats, durations, geometry, posters, manifest,
ASSUME wording, and that data numbers come from ftu.constants (ground rules
3-6). Renders via render.sh only if the clips are missing.
"""

import json
import re
import subprocess
from pathlib import Path

import pytest

from env import bin as _bin

ROOT = Path(__file__).resolve().parents[2]
MATH = ROOT / "public" / "math"
MANIFEST = MATH / "manifest.json"

FFPROBE = _bin("ffprobe")
FFMPEG = _bin("ffmpeg")

PILOTS = {
    "1.2": {"b1_cube", "b2_light", "b3_slopes", "b4_markers", "close"},
    "8.3": {"b1_configurations", "b2_blind_search", "b3_dial", "b4_one_second", "close"},
}

ASSUME_BY_SCENE = {
    "1.2": (
        "Flat LambdaCDM with Planck 2018 values. "
        "DESI's three-year data hint that dark energy weakens with time."
    ),
    "8.3": (
        "Zwanzig, Szabo and Bagchi's 1992 model: 100 bonds, two wrong states each, "
        "1e9 corrections per second."
    ),
}

SCENE_SRC = {"1.2": "ch1.py", "8.3": "ch8.py"}

# data literals that must come from ftu.constants, not appear raw in scene code
FORBIDDEN_LITERALS = {"1.2": ["0.61", "0.77"], "8.3": ["1e27", "1e13", "5.15e47", "3^{100}"]}


def probe(path, entry):
    out = subprocess.run(
        [str(FFPROBE), "-v", "error", "-show_entries", entry, "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    )
    return json.loads(out.stdout)


@pytest.fixture(scope="module", autouse=True)
def ensure_rendered():
    missing = [
        sid for sid, beats in PILOTS.items()
        if not all((MATH / sid / f"{b}.landscape.mp4").exists() for b in beats)
    ]
    if missing:
        names = {"1.2": "S1_2_Dilution", "8.3": "S8_3_Levinthal"}
        for sid in missing:
            subprocess.run(["bash", "manim/render.sh", names[sid]], cwd=ROOT, check=True, timeout=1800)


@pytest.mark.parametrize("scene_id", sorted(PILOTS))
def test_beats_present_both_aspects(scene_id):
    for beat in PILOTS[scene_id]:
        for aspect, dims in (("landscape", (1920, 1080)), ("portrait", (1080, 1350))):
            clip = MATH / scene_id / f"{beat}.{aspect}.mp4"
            assert clip.exists(), f"missing {clip.name}"
            probed = probe(clip, "stream=index,codec_type,codec_name,width,height,avg_frame_rate,pix_fmt")
            streams = probed["streams"]
            assert len(streams) == 1, f"{clip.name} has {len(streams)} streams (audio not allowed)"
            stream = streams[0]
            assert (stream["width"], stream["height"]) == dims
            assert stream["avg_frame_rate"] == "30/1"
            assert stream["codec_name"] == "h264", f"{clip.name}: {stream['codec_name']}"
            assert stream["pix_fmt"] == "yuv420p", f"{clip.name}: {stream['pix_fmt']} (alpha not allowed)"


@pytest.mark.parametrize("scene_id", sorted(PILOTS))
def test_beats_under_ten_seconds(scene_id):
    for clip in (MATH / scene_id).glob("*.mp4"):
        duration = float(probe(clip, "format=duration")["format"]["duration"])
        assert duration < 10.0, f"{clip.name} is {duration}s"


@pytest.mark.parametrize("scene_id", sorted(PILOTS))
def test_posters_opaque_site_background(scene_id):
    for aspect in ("landscape", "portrait"):
        poster = MATH / scene_id / f"poster.{aspect}.png"
        assert poster.exists()
        raw = subprocess.run(
            [str(FFMPEG), "-v", "error", "-i", str(poster), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
            capture_output=True, check=True,
        ).stdout
        assert tuple(raw[:3]) == (0x03, 0x03, 0x08)


def test_manifest_has_both_pilots():
    manifest = json.loads(MANIFEST.read_text())
    for scene_id, beats in PILOTS.items():
        scene = manifest["scenes"][scene_id]
        assert set(scene["beats"]) == beats
        for beat in beats:
            for aspect in ("landscape", "portrait"):
                assert scene["durations"][beat][aspect] > 0
                rel = scene["files"][beat][aspect]
                assert (ROOT / "public" / rel.lstrip("/")).exists()


@pytest.mark.parametrize("scene_id", sorted(PILOTS))
def test_assume_wording_verbatim(scene_id):
    src = (ROOT / "manim" / "scenes" / SCENE_SRC[scene_id]).read_text()
    expected = ASSUME_BY_SCENE[scene_id]
    # the scene source may wrap the string across lines; normalise quotes/concat
    for fragment in expected.split(". "):
        assert fragment.strip() in src.replace('"\n    "', "").replace("\n", " "), \
            f"ASSUME fragment missing from {SCENE_SRC[scene_id]}: {fragment!r}"


@pytest.mark.parametrize("scene_id", sorted(PILOTS))
def test_no_raw_data_literals_in_scene(scene_id):
    src = (ROOT / "manim" / "scenes" / SCENE_SRC[scene_id]).read_text()
    code_only = "\n".join(line.split("#", 1)[0] for line in src.splitlines())
    for literal in FORBIDDEN_LITERALS[scene_id]:
        assert literal not in code_only, f"{SCENE_SRC[scene_id]} hardcodes {literal} — use ftu.constants"


def test_scene_1_2_marker_values_come_from_constants():
    src = (ROOT / "manim" / "scenes" / "ch1.py").read_text()
    assert "A_ACCEL" in src and "A_CROSS" in src


def test_scene_8_3_curve_uses_exact_mfpt():
    src = (ROOT / "manim" / "scenes" / "ch8.py").read_text()
    assert "from ftu.levinthal import curve" in src
    assert re.search(r"LEVINTHAL_BLIND_YEARS", src)
