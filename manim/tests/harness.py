"""Build an FTUScene without rendering: play/wait are stubbed to apply each
animation's end state, so tests can inspect what is on screen at every section
boundary (epic tests 4, 7 and 15).
"""

import os
import re
from pathlib import Path

from manim import Animation, FadeOut, Scene, Transform
from manim.mobject.mobject import _AnimationBuilder

import ftu.style as style

PLAN = Path(__file__).resolve().parents[2] / "docs" / "manim-plan.md"


def plan_assume_by_scene():
    """scene id -> ASSUME wording, parsed from docs/manim-plan.md (never
    restated in tests)."""
    result = {}
    scene = None
    collecting = False
    for raw in PLAN.read_text().splitlines():
        header = re.match(r"^### (\d\.\d|U\.\d)\s", raw)
        if header:
            scene = header.group(1)
            collecting = False
            continue
        if raw.startswith("ASSUME: ") and scene:
            result[scene] = raw[len("ASSUME: "):].strip().strip('"')
            collecting = True
            continue
        if collecting and raw.startswith("   ") and raw.strip():
            result[scene] += " " + raw.strip().strip('"')
        else:
            collecting = False
    return {k: re.sub(r"\s+", " ", v) for k, v in result.items()}


def build_scene(scene_cls, portrait=False):
    """Run scene_cls.construct() with stubbed play/wait.

    Returns (scene, sections) where sections is a list of (name, mobjects)
    snapshots taken at each next_section() call and at the end of construct.
    """
    if portrait:
        os.environ["FTU_PORTRAIT"] = "1"
    else:
        os.environ.pop("FTU_PORTRAIT", None)
    style.apply_aspect_from_env()

    scene = scene_cls()
    sections = []

    def record_boundary(name="unnamed", *args, **kwargs):
        sections.append((name, list(scene.mobjects)))

    def stub_play(*anims, **_kwargs):
        for anim in anims:
            if isinstance(anim, _AnimationBuilder):
                anim = anim.build()
            if not isinstance(anim, Animation):
                continue
            anim.begin()
            anim.interpolate(1.0)
            anim.finish()
            if isinstance(anim, FadeOut):
                scene.remove(anim.mobject)
                continue
            target = getattr(anim, "target_mobject", None)
            if isinstance(anim, Transform) and target is not None:
                if anim.mobject in scene.mobjects:
                    scene.remove(anim.mobject)
                if target not in scene.mobjects:
                    scene.add(target)
            elif anim.mobject is not scene and anim.mobject not in scene.mobjects:
                scene.add(anim.mobject)

    scene.next_section = record_boundary
    scene.play = stub_play
    scene.wait = lambda *a, **k: None
    scene.construct()
    sections.append(("__END__", list(scene.mobjects)))
    return scene, sections
