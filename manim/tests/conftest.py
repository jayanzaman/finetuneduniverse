import os
import sys
from pathlib import Path

MANIM_ROOT = Path(__file__).resolve().parents[1]

# make ftu importable and put the env's binaries (ffprobe, ffmpeg) plus the
# TinyTeX tools (latex, dvisvgm — needed to build MathTex without rendering)
# on PATH
sys.path.insert(0, str(MANIM_ROOT))
os.environ["PATH"] = (
    str(MANIM_ROOT / ".venv" / "bin")
    + os.pathsep
    + str(Path.home() / ".TinyTeX" / "bin" / "x86_64-linux")
    + os.pathsep
    + os.environ.get("PATH", "")
)
