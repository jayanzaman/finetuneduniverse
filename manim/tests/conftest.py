import os
import sys
from pathlib import Path

MANIM_ROOT = Path(__file__).resolve().parents[1]

# make ftu importable and put the env's binaries (ffprobe, ffmpeg) on PATH
sys.path.insert(0, str(MANIM_ROOT))
os.environ["PATH"] = str(MANIM_ROOT / ".venv" / "bin") + os.pathsep + os.environ.get("PATH", "")
