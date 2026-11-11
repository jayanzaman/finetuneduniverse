"""Resolve tool binaries: manim/.venv locally, PATH in CI (conda env)."""

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def bin(name):
    local = ROOT / "manim" / ".venv" / "bin" / name
    if local.exists():
        return str(local)
    found = shutil.which(name)
    return found or str(local)
