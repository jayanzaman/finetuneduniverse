"""End-to-end smoke test of render.sh using the placeholder SmokeScene.

Validates the Stage 1 pipeline: both aspects, per-beat section clips, poster
PNGs, public/math layout, manifest schema, opaque site background. Cleans up
the _smoke output afterwards so public/ stays shippable.
"""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

from env import bin as _bin

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "math" / "_smoke"
MANIFEST = ROOT / "public" / "math" / "manifest.json"

FFPROBE = _bin("ffprobe")
FFMPEG = _bin("ffmpeg")


def probe(path, entry):
    out = subprocess.run(
        [str(FFPROBE), "-v", "error", "-show_entries", entry, "-of", "json", str(path)],
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(out.stdout)


def corner_pixel_rgb(png_path):
    raw = subprocess.run(
        [str(FFMPEG), "-v", "error", "-i", str(png_path), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        capture_output=True,
        check=True,
    ).stdout
    return tuple(raw[:3])


@pytest.fixture(scope="module")
def rendered():
    shutil.rmtree(OUT, ignore_errors=True)
    subprocess.run(["bash", "manim/render.sh", "SmokeScene"], cwd=ROOT, check=True, timeout=600)
    yield
    shutil.rmtree(OUT, ignore_errors=True)
    subprocess.run(
        [_bin("python"), "manim/ftu/build_manifest.py"],
        cwd=ROOT,
        check=True,
    )


def test_both_aspects_rendered(rendered):
    for beat in ("b1_placeholder", "close"):
        landscape = OUT / f"{beat}.landscape.mp4"
        portrait = OUT / f"{beat}.portrait.mp4"
        assert landscape.exists() and portrait.exists(), f"missing clips for beat {beat}"
        stream = probe(landscape, "stream=width,height,avg_frame_rate")["streams"][0]
        assert (stream["width"], stream["height"]) == (1920, 1080)
        assert stream["avg_frame_rate"] == "30/1"
        stream = probe(portrait, "stream=width,height,avg_frame_rate")["streams"][0]
        assert (stream["width"], stream["height"]) == (1080, 1350)


def test_beats_under_ten_seconds(rendered):
    for clip in OUT.glob("*.mp4"):
        duration = float(probe(clip, "format=duration")["format"]["duration"])
        assert duration < 10.0, f"{clip.name} beat is {duration}s"


def test_posters_and_opaque_background(rendered):
    for aspect in ("landscape", "portrait"):
        poster = OUT / f"poster.{aspect}.png"
        assert poster.exists()
        r, g, b = corner_pixel_rgb(poster)
        assert (r, g, b) == (0x03, 0x03, 0x08), f"poster corner is {(r, g, b)}, not #030308"


def test_manifest_schema(rendered):
    import jsonschema

    manifest = json.loads(MANIFEST.read_text())
    schema = {
        "type": "object",
        "required": ["generated_at", "scenes"],
        "properties": {
            "generated_at": {"type": "string"},
            "scenes": {
                "type": "object",
                "additionalProperties": {
                    "type": "object",
                    "required": ["beats", "files", "durations", "posters"],
                },
            },
        },
    }
    jsonschema.validate(manifest, schema)
    smoke = manifest["scenes"]["_smoke"]
    assert set(smoke["beats"]) == {"b1_placeholder", "close"}
    for beat in smoke["beats"]:
        for aspect in ("landscape", "portrait"):
            assert (ROOT / "public" / smoke["files"][beat][aspect].lstrip("/")).exists()
            assert smoke["durations"][beat][aspect] > 0
