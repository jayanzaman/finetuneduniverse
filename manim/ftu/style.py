"""FTU Manim pipeline — shared style and base scene.

Palette and fonts mirror the site's design tokens (src/app/globals.css).
Aspect is chosen by the FTU_PORTRAIT env var (ground rule 10); geometry is
always derived from config.frame_width / config.frame_height, never fixed
coordinates.
"""

import os
import re

from manim import (
    DashedLine,
    DecimalNumber,
    DOWN,
    LEFT,
    Line,
    MathTex,
    NumberLine,
    Rectangle,
    Scene,
    Text,
    UP,
    VGroup,
    config,
)

# --- palette (site tokens from globals.css) ---
VOID = "#030308"  # --void: site background; scenes render opaque on this
VOID_2 = "#07071A"  # --void-2
VOID_3 = "#0E0E22"  # --void-3
INK = "#ECECF5"  # --ink: primary text
INK_MID = "#B9B9CC"  # --ink-mid
INK_SOFT = "#7B7B92"  # --ink-soft
INDIGO = "#7A7BFF"  # --indigo: accent
INDIGO_DEEP = "#4F50E8"  # --indigo-2
GOLDILOCKS = "#6FE4B1"  # --goldilocks: allowed band
WARM = "#E78C5A"  # --warm: warning / matter

# --- fonts (installed to ~/.fonts from google/fonts) ---
FONT_DISPLAY = "Unbounded"
FONT_BODY = "Space Grotesk"
FONT_MONO = "Space Mono"
FONT_ITALIC = "Newsreader"

# --- render geometry ---
FRAME_HEIGHT = 8.0
FPS = 30
LANDSCAPE_PIXELS = (1920, 1080)
PORTRAIT_PIXELS = (1080, 1350)

# --- readability floor (epic test 15) ---
# Portrait: 8 units = 1350 px, shown 390 px wide -> 12 CSS px = 33 render px
# = 0.196 scene units. No single-line text may be shorter than MIN_TEXT_HEIGHT.
MIN_TEXT_HEIGHT = 0.196
TARGET_TEXT_HEIGHT = 0.24

# --- ASCII -> symbols mapping (epic test 5; the single place it lives) ---
_SUPERSCRIPTS = str.maketrans("0123456789-+", "⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺")
_WORD_MAP = [("LambdaCDM", "ΛCDM"), ("Lambda", "Λ"), ("eta", "η"), ("sigma", "σ"), ("mu", "μ")]
_SCI_RE = re.compile(r"\b(\d+(?:\.\d+)?)e(-?\d+)\b")


def symbols(text):
    """Typeset plan ASCII wording in Unicode (epic test 5).

    Whole words only, so "maximum" stays "maximum". Applied by
    assumption_line(); nothing else may change.
    """
    for word, symbol in _WORD_MAP:
        text = re.sub(rf"\b{word}\b", symbol, text)
    text = text.replace("+/-", "±")
    text = re.sub(r"\b(\d+)x\b", r"\1×", text)

    def _sci(match):
        mantissa, exponent = match.group(1), match.group(2).translate(_SUPERSCRIPTS)
        if mantissa == "1":
            return f"10{exponent}"
        return f"{mantissa} × 10{exponent}"

    return _SCI_RE.sub(_sci, text)


def _font_size_for_height(height, font):
    probe = Text("Ag", font=font, font_size=48)
    return 48 * height / probe.height


def _text_at_height(line, font, color, height):
    """A single-line Text whose rendered height is exactly `height`
    (font size is linear in rendered height; measure the line itself)."""
    probe = Text(line, font=font, font_size=_font_size_for_height(height, font), color=color)
    probe.scale(height / probe.height)
    return probe


def _wrap_to_width(text, font, color, height, max_width):
    """Greedy word wrap; each rendered line (at `height`) must fit max_width."""
    lines, current = [], ""
    for word in text.split(" "):
        candidate = f"{current} {word}".strip()
        if not current or _text_at_height(candidate, font, color, height).width <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return "\n".join(lines)


def readable_text(text, font=FONT_BODY, color=INK, max_width=None, height=TARGET_TEXT_HEIGHT):
    """Text at a readable size: never shorter than MIN_TEXT_HEIGHT per line;
    wraps to fit max_width instead of shrinking (epic test 15). Returns a
    single Text for one line, else a VGroup with one Text per line so each
    line's height stays measurable."""
    if max_width is not None:
        text = "\n".join(
            _wrap_to_width(part, font, color, height, max_width) for part in text.split("\n")
        )
    parts = [_text_at_height(line, font, color, height) for line in text.split("\n")]
    for part in parts:
        assert part.height >= MIN_TEXT_HEIGHT * 0.99, (
            f"text {part.text!r} is {part.height:.3f} units tall, below the {MIN_TEXT_HEIGHT} floor"
        )
    if len(parts) == 1:
        return parts[0]
    return VGroup(*parts).arrange(DOWN, buff=height * 0.4, aligned_edge=LEFT)


def apply_aspect_from_env():
    """Read FTU_PORTRAIT and set frame/pixel geometry accordingly.

    Called at import time from scene modules, before Scene construction.
    Portrait has no CLI flag in Manim (ground rule 10), so it lives here.
    """
    if os.environ.get("FTU_PORTRAIT") == "1":
        config.pixel_width, config.pixel_height = PORTRAIT_PIXELS
        config.frame_height = FRAME_HEIGHT
        config.frame_width = FRAME_HEIGHT * PORTRAIT_PIXELS[0] / PORTRAIT_PIXELS[1]
    else:
        config.pixel_width, config.pixel_height = LANDSCAPE_PIXELS
        config.frame_height = FRAME_HEIGHT
        config.frame_width = FRAME_HEIGHT * LANDSCAPE_PIXELS[0] / LANDSCAPE_PIXELS[1]
    config.frame_rate = FPS
    config.background_color = VOID


class FTUScene(Scene):
    """Base scene: site background, assumption line, standard closing frame."""

    def setup(self):
        super().setup()
        self.camera.background_color = VOID

    # --- shared pieces -------------------------------------------------

    def assumption_line(self, text):
        """The scene's ASSUME line: small, muted, pinned to the bottom edge.

        Ground rule 5: wording comes verbatim from docs/manim-plan.md; the
        ASCII-to-symbols mapping (epic test 5) is applied here and the mapped
        text is recorded as self.assumption_text. Lines wrap instead of
        shrinking below the 390 px readability floor (epic test 15).
        """
        mapped = symbols(text)
        self.assumption_text = mapped
        line = readable_text(
            mapped,
            font=FONT_BODY,
            color=INK_SOFT,
            max_width=config.frame_width * 0.92,
        )
        line.to_edge(DOWN, buff=0.25)
        return line

    def closing_frame(
        self, axis_min, axis_max, band, walls, marker, log=False,
        tick_step=None, include_numbers=False,
    ):
        """The standard closing layout (ground rule 4).

        axis_min/axis_max: number-line extent (values, or decades if log=True).
        band: (lo, hi) shaded allowed region.
        walls: list of (x, "solid" | "dashed", label). Labels alternate above
               and below the axis so adjacent walls stay readable.
        marker: x of the "our universe" marker, or None.
        log: if True, positions are placed by log10(value).
        tick_step / include_numbers: override tick spacing; optionally label
        ticks (small, muted).
        All labels are clamped inside the frame. Records the arguments on the
        scene as self.closing_spec (epic test 4).
        Returns a VGroup; the scene animates it in as its own section.
        """
        self.closing_spec = {
            "axis_min": axis_min,
            "axis_max": axis_max,
            "band": band,
            "walls": list(walls or []),
            "marker": marker,
            "log": log,
        }

        def pos(x):
            import math

            return math.log10(x) if log else x

        lo, hi = pos(axis_min), pos(axis_max)
        axis_width = config.frame_width * 0.8
        # tick numbers must also clear the 390 px readability floor
        num_probe = DecimalNumber(0, font_size=48)
        tick_font_size = 48 * TARGET_TEXT_HEIGHT / num_probe.height
        axis = NumberLine(
            x_range=[lo, hi, tick_step or (hi - lo) / 8],
            length=axis_width,
            color=INK_MID,
            include_ticks=True,
            include_numbers=include_numbers,
            font_size=tick_font_size,
        )

        parts = [axis]

        def clamp_inside(mobject, buff=0.15):
            right = config.frame_width / 2 - buff
            left = -right
            if mobject.get_right()[0] > right:
                mobject.shift([right - mobject.get_right()[0], 0, 0])
            if mobject.get_left()[0] < left:
                mobject.shift([left - mobject.get_left()[0], 0, 0])
            return mobject

        if band is not None:
            b_lo, b_hi = pos(band[0]), pos(band[1])
            p_lo = axis.number_to_point(b_lo)
            p_hi = axis.number_to_point(b_hi)
            band_rect = Rectangle(
                width=abs(p_hi[0] - p_lo[0]),
                height=config.frame_height * 0.12,
                color=GOLDILOCKS,
                fill_color=GOLDILOCKS,
                fill_opacity=0.16,
                stroke_opacity=0.6,
            )
            band_rect.move_to([(p_lo[0] + p_hi[0]) / 2, axis.get_center()[1], 0])
            parts.append(band_rect)

        for i, (x, style_name, label) in enumerate(walls or []):
            p = axis.number_to_point(pos(x))
            wall_height = config.frame_height * 0.2
            if style_name == "dashed":
                wall = DashedLine(
                    p + UP * wall_height / 2,
                    p + DOWN * wall_height / 2,
                    color=WARM,
                )
            else:
                wall = Line(
                    p + UP * wall_height / 2,
                    p + DOWN * wall_height / 2,
                    color=WARM,
                    stroke_width=6,
                )
            wall_label = readable_text(
                label, font=FONT_BODY, color=WARM, max_width=config.frame_width * 0.22
            )
            side = UP if i % 2 == 0 else DOWN
            wall_label.next_to(wall, side, buff=0.15)
            clamp_inside(wall_label)
            parts += [wall, wall_label]

        if marker is not None:
            p = axis.number_to_point(pos(marker))
            dot_line = Line(
                p + UP * config.frame_height * 0.1,
                p + DOWN * config.frame_height * 0.1,
                color=INDIGO,
                stroke_width=6,
            )
            marker_label = readable_text("our universe", font=FONT_BODY, color=INDIGO)
            # labels alternate above/below by wall index; put the marker on the
            # opposite side of the nearest wall so the two never collide
            if walls:
                nearest = min(range(len(walls)), key=lambda i: abs(pos(walls[i][0]) - pos(marker)))
                marker_side = DOWN if nearest % 2 == 0 else UP
            else:
                marker_side = DOWN
            marker_label.next_to(dot_line, marker_side, buff=0.15)
            clamp_inside(marker_label)
            parts += [dot_line, marker_label]

        return VGroup(*parts)

    # --- scene plumbing -------------------------------------------------

    def beat(self, name):
        """Start a named beat; ground rule 3: one idea each, under 10 s."""
        self.next_section(name)

    def close_section(self):
        """Start the closing-frame section, emitted as its own clip."""
        self.next_section("close")

    def not_implemented(self, title):
        """Placeholder for scenes scheduled in Stage 3."""
        self.next_section("placeholder")
        t = readable_text(
            f"{title}\n(scene scheduled — see docs/manim-plan.md)",
            font=FONT_BODY,
            color=INK,
            max_width=config.frame_width * 0.8,
        )
        self.add(t)
        self.wait(0.5)


__all__ = [
    "FTUScene",
    "apply_aspect_from_env",
    "symbols",
    "readable_text",
    "MIN_TEXT_HEIGHT",
    "TARGET_TEXT_HEIGHT",
    "VOID",
    "VOID_2",
    "VOID_3",
    "INK",
    "INK_MID",
    "INK_SOFT",
    "INDIGO",
    "INDIGO_DEEP",
    "GOLDILOCKS",
    "WARM",
    "FONT_DISPLAY",
    "FONT_BODY",
    "FONT_MONO",
    "FONT_ITALIC",
    "MathTex",
    "DecimalNumber",
]
