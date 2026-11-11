"""Every TEX line in docs/manim-plan.md must appear verbatim in ftu/tex.py,
keyed by scene, and tex.py must hold nothing the plan does not say (epic test
6b). The plan is parsed; no string is restated here.
"""

import re
from pathlib import Path

from ftu.tex import TEX

PLAN = Path(__file__).parents[2] / "docs" / "manim-plan.md"

SCENE_HEADER = re.compile(r"^### (\d\.\d|U\.\d)\s")
TEX_LINE = re.compile(r"^TEX: (.*)$")


def _plan_tex():
    """scene id -> list of TEX lines, in plan order."""
    result = {}
    current = None
    for line in PLAN.read_text().splitlines():
        header = SCENE_HEADER.match(line)
        if header:
            current = header.group(1)
            continue
        tex = TEX_LINE.match(line)
        if tex and current:
            result.setdefault(current, []).append(tex.group(1))
    return result


def test_tex_matches_plan_character_for_character():
    expected = _plan_tex()
    assert set(TEX) == set(expected), (
        f"scene keys differ: only in tex.py {sorted(set(TEX) - set(expected))}, "
        f"only in plan {sorted(set(expected) - set(TEX))}"
    )
    for scene, lines in expected.items():
        assert TEX[scene] == lines, f"scene {scene}: tex.py differs from the plan"
