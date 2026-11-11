"""style.py must match the site's design tokens and the plan's layout rules."""

import importlib
import os

import ftu.style as style
from manim import DashedLine, Line, NumberLine, Rectangle, Text, VGroup, config


def test_palette_matches_site_tokens():
    assert style.VOID == "#030308"
    assert style.VOID_2 == "#07071A"
    assert style.VOID_3 == "#0E0E22"
    assert style.INK == "#ECECF5"
    assert style.INDIGO == "#7A7BFF"
    assert style.GOLDILOCKS == "#6FE4B1"
    assert style.WARM == "#E78C5A"


def test_fonts_match_site():
    assert style.FONT_DISPLAY == "Unbounded"
    assert style.FONT_BODY == "Space Grotesk"
    assert style.FONT_MONO == "Space Mono"
    assert style.FONT_ITALIC == "Newsreader"


def test_landscape_geometry(monkeypatch):
    monkeypatch.delenv("FTU_PORTRAIT", raising=False)
    style.apply_aspect_from_env()
    assert (config.pixel_width, config.pixel_height) == (1920, 1080)
    assert config.frame_rate == 30
    assert abs(config.frame_width / config.frame_height - 16 / 9) < 1e-9


def test_portrait_geometry(monkeypatch):
    monkeypatch.setenv("FTU_PORTRAIT", "1")
    style.apply_aspect_from_env()
    assert (config.pixel_width, config.pixel_height) == (1080, 1350)
    assert config.frame_height == 8.0
    assert abs(config.frame_width - 8.0 * 1080 / 1350) < 1e-9
    monkeypatch.delenv("FTU_PORTRAIT")
    style.apply_aspect_from_env()


def _scene():
    style.apply_aspect_from_env()
    return style.FTUScene()


def test_background_is_site_void():
    scene = _scene()
    from manim.utils.color import ManimColor

    assert ManimColor(scene.camera.background_color) == ManimColor("#030308")


def test_closing_frame_structure():
    scene = _scene()
    frame = scene.closing_frame(
        0.0,
        3.0,
        band=(0.5, 1.7),
        walls=[(0.5, "solid", "lo"), (1.7, "dashed", "hi")],
        marker=1.293,
    )
    assert isinstance(frame, VGroup)
    assert any(isinstance(m, NumberLine) for m in frame)
    assert any(isinstance(m, Rectangle) for m in frame)  # the shaded band
    walls = [m for m in frame if isinstance(m, (Line, DashedLine))]
    assert any(type(m) is Line for m in walls)  # solid wall
    assert any(isinstance(m, DashedLine) for m in walls)  # dashed wall
    labels = [m.text.replace(" ", "") for m in frame if isinstance(m, Text)]
    assert "ouruniverse" in labels
    assert "lo" in labels and "hi" in labels


def test_closing_frame_log_positions_monotonic():
    scene = _scene()
    frame = scene.closing_frame(1e-3, 1.0, band=None, walls=[], marker=1e-2, log=True)
    axis = next(m for m in frame if isinstance(m, NumberLine))
    xs = [axis.number_to_point(v)[0] for v in (-3.0, -2.0, -1.0, 0.0)]
    assert xs == sorted(xs)


def test_assumption_line_fits_frame():
    scene = _scene()
    line = scene.assumption_line("x " * 200)
    assert line.width <= config.frame_width * 0.95
