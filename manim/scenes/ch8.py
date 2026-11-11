"""Chapter 8 scenes — The Code Within.

Spec: docs/manim-plan.md, scenes 8.1-8.4. Issues #63 (pilot 8.3), #69-#71.
"""

import math

import numpy as np
from manim import (
    Axes,
    DashedLine,
    DecimalNumber,
    Dot,
    FadeIn,
    FadeOut,
    LaggedStart,
    Line,
    MathTex,
    Rectangle,
    Text,
    ValueTracker,
    VGroup,
    Write,
    always_redraw,
    config,
)

from ftu.constants import (
    LEVINTHAL_BLIND_RATE,
    LEVINTHAL_BLIND_YEARS,
    LEVINTHAL_CONFIGS,
    LEVINTHAL_K1,
    LEVINTHAL_N,
    LEVINTHAL_NU,
    LEVINTHAL_ONE_SECOND_AT_U,
    UNIVERSE_AGE_YR,
)
from ftu.levinthal import curve
from ftu.style import (
    FONT_BODY,
    FONT_MONO,
    GOLDILOCKS,
    INDIGO,
    INK,
    INK_MID,
    INK_SOFT,
    WARM,
    FTUScene,
    apply_aspect_from_env,
)

apply_aspect_from_env()

SECONDS_PER_YEAR = 365.25 * 86400  # unit conversion, not a data value

ASSUME_8_3 = (
    "Zwanzig, Szabo and Bagchi's 1992 model: 100 bonds, two wrong states each, "
    "1e9 corrections per second."
)


class S8_1_CodonCombinatorics(FTUScene):
    """Scene 8.1 — Codon combinatorics. Stage 3, issue #69."""

    def construct(self):
        self.not_implemented("8.1 Codon combinatorics")


class S8_2_SequenceSpace(FTUScene):
    """Scene 8.2 — Sequence space. Stage 3, issue #70."""

    def construct(self):
        self.not_implemented("8.2 Sequence space")


def _sci_tex(x):
    """Format a constant as LaTeX scientific notation, e.g. 5.15 \\times 10^{47}."""
    mantissa, exponent = f"{x:.2e}".split("e")
    return rf"{mantissa} \times 10^{{{int(exponent)}}}"


class S8_3_Levinthal(FTUScene):
    """Scene 8.3 — Levinthal's paradox. PILOT, Stage 2, issue #63.

    POINT: a small energy bias on each bond turns an impossible search into a
    one-second one. The curve is the exact mean first-passage time
    (ftu.levinthal), never the on-screen approximation.
    """

    def construct(self):
        assume = self.assumption_line(ASSUME_8_3)
        self.add(assume)

        # ---- B1: 100 bonds, one right and two wrong states each
        self.next_section("b1_configurations")
        shown = 12
        cell = config.frame_width * 0.045
        bonds = VGroup(
            *[Rectangle(width=cell, height=cell, color=INK_MID, stroke_width=2) for _ in range(shown)]
        ).arrange(direction=np.array([1, 0, 0]), buff=cell * 0.15)
        bonds.move_to([0, config.frame_height * 0.15, 0])
        # one right (green), two wrong (warm) states marked on the bonds
        for i, sq in enumerate(bonds):
            if i % 3 == 0:
                sq.set_fill(GOLDILOCKS, opacity=0.35)
            else:
                sq.set_fill(WARM, opacity=0.2)
        ellipsis = Text("· · ·  ×100 bonds", font=FONT_BODY, color=INK_SOFT)
        ellipsis.scale_to_fit_width(config.frame_width * 0.18)
        ellipsis.next_to(bonds, np.array([1, 0, 0]), buff=0.25)

        count_eq = MathTex(
            rf"3^{{{LEVINTHAL_N}}} = {_sci_tex(LEVINTHAL_CONFIGS)}\ \text{{configurations}}",
            color=INK,
        )
        count_eq.scale_to_fit_width(config.frame_width * 0.55)
        count_eq.move_to([0, -config.frame_height * 0.12, 0])
        self.play(LaggedStart(*[FadeIn(b) for b in bonds], lag_ratio=0.08), run_time=2)
        self.play(FadeIn(ellipsis), Write(count_eq), run_time=1.5)
        self.wait(0.5)

        # ---- B2: blind search vs the age of the universe
        self.next_section("b2_blind_search")
        blind = MathTex(
            rf"\text{{blind search at }} 10^{{{int(math.log10(LEVINTHAL_BLIND_RATE))}}}\ /\mathrm{{s}}"
            rf" \approx 10^{{{int(math.log10(LEVINTHAL_BLIND_YEARS))}}}\ \text{{years}}",
            color=WARM,
        )
        universe = MathTex(
            rf"\text{{age of the universe}} \approx 10^{{{int(math.log10(UNIVERSE_AGE_YR))}}}\ \text{{years}}",
            color=INK_MID,
        )
        for eq in (blind, universe):
            eq.scale_to_fit_width(config.frame_width * 0.6)
        rows = VGroup(blind, universe).arrange(direction=np.array([0, -1, 0]), buff=0.6)
        self.play(FadeOut(bonds), FadeOut(ellipsis), FadeOut(count_eq), run_time=0.8)
        self.play(LaggedStart(Write(blind), Write(universe), lag_ratio=0.5), run_time=2.5)
        self.wait(0.5)

        # ---- B3: energy-bias dial collapses the folding time (exact MFPT)
        self.next_section("b3_dial")
        self.play(FadeOut(blind), FadeOut(universe), run_time=0.6)

        axes = Axes(
            x_range=[0, 4, 1],
            y_range=[-10, 40, 10],
            x_length=config.frame_width * 0.55,
            y_length=config.frame_height * 0.5,
            tips=False,
        )
        axes.move_to([-config.frame_width * 0.1, -config.frame_height * 0.02, 0])
        x_lbl = Text("U / kT", font=FONT_BODY, color=INK_MID)
        y_lbl = Text("folding time (log₁₀ s)", font=FONT_BODY, color=INK_MID)
        x_lbl.scale_to_fit_width(config.frame_width * 0.08)
        y_lbl.scale_to_fit_width(config.frame_width * 0.2)
        x_lbl.next_to(axes, np.array([1, -1, 0]), buff=0.15)
        y_lbl.next_to(axes, np.array([0, 1, 0]), buff=0.1)
        y_lbl.align_to(axes, np.array([-1, 0, 0]))

        pts = curve(0.0, 4.0, samples=41)  # exact MFPT; see ftu/levinthal.py
        graph = axes.plot_line_graph(
            x_values=[p[0] for p in pts],
            y_values=[p[1] for p in pts],
            line_color=INDIGO,
            add_vertex_dots=False,
        )

        # references: Levinthal's classic 1e27 yr; universe age; one second
        def hline(years_or_seconds_log, color, label_text):
            y = years_or_seconds_log
            line = DashedLine(
                axes.c2p(0, y), axes.c2p(4, y), color=color, dash_length=0.08
            )
            lbl = Text(label_text, font=FONT_BODY, color=color)
            lbl.scale_to_fit_width(config.frame_width * 0.22)
            lbl.next_to(line, np.array([0, 1, 0]), buff=0.08)
            lbl.align_to(axes, np.array([1, 0, 0]))
            return VGroup(line, lbl)

        ref_levinthal = hline(
            math.log10(LEVINTHAL_BLIND_YEARS * SECONDS_PER_YEAR),
            WARM,
            "Levinthal's classic 10²⁷ yr (10¹³ trials/s)",
        )
        ref_universe = hline(
            math.log10(UNIVERSE_AGE_YR * SECONDS_PER_YEAR),
            INK_SOFT,
            "age of the universe",
        )
        ref_second = hline(0.0, GOLDILOCKS, "one second")

        self.play(Write(axes), Write(x_lbl), Write(y_lbl), run_time=1)
        self.play(FadeIn(ref_levinthal), FadeIn(ref_universe), FadeIn(ref_second), run_time=1.2)
        self.play(Write(graph), run_time=2)

        u_tracker = ValueTracker(0.0)
        u_caption = Text("U / kT =", font=FONT_MONO, color=INK_MID)
        u_caption.scale_to_fit_width(config.frame_width * 0.08)
        u_caption.move_to([config.frame_width * 0.3, config.frame_height * 0.38, 0])
        u_readout = always_redraw(
            lambda: DecimalNumber(u_tracker.get_value(), num_decimal_places=2, color=INK, font_size=28)
            .next_to(u_caption, np.array([1, 0, 0]), buff=0.1)
        )
        tracer = always_redraw(
            lambda: Dot(
                axes.c2p(u_tracker.get_value(), float(np.interp(u_tracker.get_value(), [p[0] for p in pts], [p[1] for p in pts]))),
                color=INDIGO,
                radius=0.07,
            )
        )
        self.add(u_caption, u_readout, tracer)
        self.play(u_tracker.animate.set_value(4.0), run_time=4)
        self.wait(0.3)

        # ---- B4: at U = 2 kT the time reaches about one second
        self.next_section("b4_one_second")
        marker_u = LEVINTHAL_ONE_SECOND_AT_U
        p2 = axes.c2p(marker_u, float(np.interp(marker_u, [p[0] for p in pts], [p[1] for p in pts])))
        vline = Line(p2, axes.c2p(marker_u, 0), color=GOLDILOCKS, stroke_width=4)
        u2_lbl = Text("U = 2 kT → about one second", font=FONT_BODY, color=GOLDILOCKS)
        u2_lbl.scale_to_fit_width(config.frame_width * 0.3)
        u2_lbl.next_to(vline, np.array([1, 0, 0]), buff=0.2)
        self.play(Write(vline), Write(u2_lbl), run_time=1.5)
        self.wait(0.5)

        # ---- CLOSE: U/kT axis 0→4, sub-second band from U = 2
        self.next_section("close")
        self.play(
            *[FadeOut(m) for m in list(self.mobjects) if m is not assume],
            run_time=0.8,
        )
        frame = self.closing_frame(
            0.0,
            4.0,
            band=(LEVINTHAL_ONE_SECOND_AT_U, 4.0),
            walls=[],
            marker=LEVINTHAL_ONE_SECOND_AT_U,
            tick_step=1.0,
            include_numbers=True,
        )
        self.play(FadeIn(frame), run_time=1.2)
        self.wait(0.6)


class S8_4_ShannonDNA(FTUScene):
    """Scene 8.4 — Shannon information and DNA density. Stage 3, issue #71."""

    def construct(self):
        self.not_implemented("8.4 Shannon information and DNA density")
