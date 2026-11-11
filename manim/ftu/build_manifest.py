"""Rebuild public/math/manifest.json from the clips on disk.

Scans public/math/<scene_id>/ for <beat>.<aspect>.mp4 and poster.<aspect>.png,
probes durations with ffprobe, and writes the manifest the MathClip component
and the e2e tests consume.
"""

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MATH_DIR = ROOT / "public" / "math"
MANIFEST = MATH_DIR / "manifest.json"

ASPECTS = ("landscape", "portrait")


def probe_duration(path: Path) -> float:
    out = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "json",
            str(path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return round(float(json.loads(out.stdout)["format"]["duration"]), 3)


def build():
    scenes = {}
    if MATH_DIR.exists():
        for scene_dir in sorted(p for p in MATH_DIR.iterdir() if p.is_dir()):
            files = {}
            durations = {}
            posters = {}
            beats = set()
            for clip in sorted(scene_dir.glob("*.mp4")):
                beat, aspect = clip.name[: -len(".mp4")].rsplit(".", 1)
                if aspect not in ASPECTS:
                    continue
                beats.add(beat)
                files.setdefault(beat, {})[aspect] = f"/math/{scene_dir.name}/{clip.name}"
                durations.setdefault(beat, {})[aspect] = probe_duration(clip)
            for poster in sorted(scene_dir.glob("poster.*.png")):
                aspect = poster.name[: -len(".png")].rsplit(".", 1)[1]
                posters[aspect] = f"/math/{scene_dir.name}/{poster.name}"
            if beats:
                scenes[scene_dir.name] = {
                    "beats": sorted(beats),
                    "files": files,
                    "durations": durations,
                    "posters": posters,
                }

    manifest = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "scenes": scenes,
    }
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"manifest: {len(scenes)} scene(s) -> {MANIFEST}")


if __name__ == "__main__":
    sys.exit(build())
