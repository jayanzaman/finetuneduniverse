"""style.py must match the site's design tokens and the plan's layout rules."""

import importlib
import os
import re
from pathlib import Path

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


# --- epic test 5: ASCII -> symbols mapping, the single place is ftu/style.py


def test_symbols_mapping_cases():
    assert style.symbols("flat LambdaCDM model") == "flat ΛCDM model"
    assert style.symbols("the Lambda term") == "the Λ term"
    assert style.symbols("eta = 6e-10") == "η = 6 × 10⁻¹⁰"
    assert style.symbols("sigma and mu") == "σ and μ"
    assert style.symbols("maximum") == "maximum"  # whole words only
    assert style.symbols("67.4 +/- 0.5") == "67.4 ± 0.5"
    assert style.symbols("200x the observed value") == "200× the observed value"
    assert style.symbols("Q at 1e-5") == "Q at 10⁻⁵"
    assert style.symbols("1e80 baryons") == "10⁸⁰ baryons"
    assert style.symbols("about 1.6e9 photons") == "about 1.6 × 10⁹ photons"
    assert style.symbols("2.5e3 K") == "2.5 × 10³ K"


def _plan_assume_lines():
    """ASSUME wording per scene, parsed from the plan (never restated here)."""
    import re

    plan = (Path(__file__).parents[2] / "docs" / "manim-plan.md").read_text()
    lines, current = [], None
    for raw in plan.splitlines():
        if raw.startswith("ASSUME: "):
            current = raw[len("ASSUME: "):].strip().strip('"')
            lines.append(current)
        elif current is not None and raw.startswith("   ") and raw.strip():
            lines[-1] += " " + raw.strip().strip('"')
        elif raw.strip():
            current = None
    assert len(lines) >= 20, "expected an ASSUME line per scene in the plan"
    return [re.sub(r"\s+", " ", line) for line in lines]


def test_every_plan_assume_line_maps_without_ascii_leftovers():
    forbidden = re.compile(r"\b(Lambda|LambdaCDM|eta|sigma|mu)\b|\b\d+(?:\.\d+)?e-?\d+\b|\+/-|\b\d+x\b")
    for raw in _plan_assume_lines():
        mapped = style.symbols(raw)
        assert not forbidden.search(mapped), f"unmapped ASCII left in {mapped!r}"


def test_assumption_line_records_mapped_text():
    scene = _scene()
    raw = "Flat LambdaCDM with Planck 2018 values."
    scene.assumption_line(raw)
    assert scene.assumption_text == style.symbols(raw)


# --- epic test 15: readable at 390 px (portrait: 12 CSS px = 0.196 units)


def test_assumption_line_never_shrinks_below_floor_in_portrait(monkeypatch):
    monkeypatch.setenv("FTU_PORTRAIT", "1")
    style.apply_aspect_from_env()
    try:
        for raw in _plan_assume_lines():
            scene = style.FTUScene()
            line = scene.assumption_line(raw)
            texts = [m for m in line.get_family() if isinstance(m, Text)]
            if isinstance(line, Text):
                texts.append(line)
            assert texts, f"no Text produced for {raw!r}"
            for t in texts:
                assert t.height >= style.MIN_TEXT_HEIGHT * 0.99, (
                    f"line {t.text!r} is {t.height:.3f} units, below {style.MIN_TEXT_HEIGHT}"
                )
            assert line.width <= config.frame_width * 0.95
    finally:
        monkeypatch.delenv("FTU_PORTRAIT")
        style.apply_aspect_from_env()


def test_closing_frame_records_spec():
    scene = _scene()
    walls = [(0.5, "solid", "lo"), (1.7, "dashed", "hi")]
    scene.closing_frame(0.0, 3.0, band=(0.5, 1.7), walls=walls, marker=1.293)
    assert scene.closing_spec == {
        "axis_min": 0.0,
        "axis_max": 3.0,
        "band": (0.5, 1.7),
        "walls": walls,
        "marker": 1.293,
        "log": False,
    }
