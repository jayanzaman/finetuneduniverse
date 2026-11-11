"""Chapter 1 scenes — The Beginning.

Spec: docs/manim-plan.md, scenes 1.1-1.6. Issues #63 (pilots), #64-#68.
Numbers come from ftu.constants only; ASSUME wording is verbatim from the plan.
"""

import numpy as np
from manim import (
    Axes,
    Dot,
    FadeIn,
    FadeOut,
    FunctionGraph,
    LaggedStart,
    MathTex,
    NumberLine,
    Square,
    Text,
    TransformMatchingTex,
    VGroup,
    Write,
    config,
)

from ftu.constants import A_ACCEL, A_CROSS
from ftu.physics import dilution_line, dilution_slopes
from ftu.tex import TEX
from ftu.style import (
    FONT_BODY,
    FONT_MONO,
    GOLDILOCKS,
    INK,
    INK_MID,
    INK_SOFT,
    MIN_TEXT_HEIGHT,
    WARM,
    FTUScene,
    apply_aspect_from_env,
    readable_text,
)

apply_aspect_from_env()

LAMBDA_PURPLE = "#C084FC"  # matches the site's dark-energy mathBlock colour

ASSUME_1_2 = (
    "Flat LambdaCDM with Planck 2018 values. "
    "DESI's three-year data hint that dark energy weakens with time."
)


class S1_1_HubbleTension(FTUScene):
    """Scene 1.1 — Hubble's law and the tension. Stage 3, issue #64."""

    def construct(self):
        self.not_implemented("1.1 Hubble's law and the tension")


class S1_2_Dilution(FTUScene):
    """Scene 1.2 — Dilution laws. PILOT, Stage 2, issue #63.

    POINT: matter thins as space grows, dark energy does not; acceleration
    onset and density crossover are two different moments.
    """

    N_PARTICLES = 27  # fixed particle count for the cube beat

    def build_cube(self, side):
        cube = Square(side_length=side, color=INK_MID)
        rng = np.random.default_rng(7)
        dots = VGroup(
            *[
                Dot(
                    cube.get_center()
                    + np.array(
                        [
                            rng.uniform(-0.4, 0.4) * side,
                            rng.uniform(-0.4, 0.4) * side,
                            0,
                        ]
                    ),
                    radius=side * 0.02,
                    color=WARM,
                )
                for _ in range(self.N_PARTICLES)
            ]
        )
        return VGroup(cube, dots), dots

    def construct(self):
        assume = self.assumption_line(ASSUME_1_2)
        self.add(assume)

        # ---- B1: a cube of space grows; side x2, volume x8, particles fixed
        self.next_section("b1_cube")
        side = min(config.frame_height, config.frame_width) * 0.22
        group, dots = self.build_cube(side)
        group.shift([-config.frame_width * 0.22, 0.1, 0])
        self.play(FadeIn(group), run_time=1)

        label_kwargs = {"font": FONT_BODY, "color": INK}
        side_lbl = readable_text("side ×2", **label_kwargs)
        vol_lbl = readable_text("volume ×8", **label_kwargs)
        count_lbl = readable_text(
            f"particles: {self.N_PARTICLES} → {self.N_PARTICLES} (schematic)",
            font=FONT_MONO,
            color=INK_MID,
            max_width=config.frame_width * 0.3,
        )
        labels = VGroup(side_lbl, vol_lbl, count_lbl)
        labels.arrange(direction=np.array([0, -1, 0]), aligned_edge=np.array([-1, 0, 0]), buff=0.35)
        labels.move_to([config.frame_width * 0.18, 0.1, 0])

        self.play(Write(side_lbl), group.animate.scale(2, about_point=group.get_center()), run_time=2)
        self.play(Write(vol_lbl), run_time=1)
        self.play(Write(count_lbl), run_time=1)
        self.wait(0.5)

        # ---- B2: light also stretches; the vacuum does not dilute
        self.next_section("b2_light")
        wave_span = group.width * 0.8
        wave = FunctionGraph(
            lambda x: np.sin(6 * np.pi * x / wave_span),
            x_range=[-wave_span / 2, wave_span / 2],
            color=GOLDILOCKS,
        ).move_to(group)
        self.play(FadeIn(wave), run_time=1)
        self.play(wave.animate.stretch(1.35, dim=0, about_point=group.get_center()), run_time=1.5)

        # B2's rows are the three terms of the TEX entry, split on \qquad
        tex_rad, tex_matter, tex_lambda = TEX["1.2"][0].split(r"\qquad")
        eq_matter = MathTex(tex_matter, color=WARM)
        eq_rad = MathTex(tex_rad, color=GOLDILOCKS)
        eq_lambda = MathTex(tex_lambda, color=LAMBDA_PURPLE)
        note_matter = readable_text("matter thins with volume", font=FONT_BODY, color=INK_SOFT)
        note_rad = readable_text("light redshifts — one more power of a", font=FONT_BODY, color=INK_SOFT)
        note_lambda = readable_text("the vacuum does not dilute", font=FONT_BODY, color=INK_SOFT)
        rows = VGroup(
            VGroup(eq_matter, note_matter),
            VGroup(eq_rad, note_rad),
            VGroup(eq_lambda, note_lambda),
        )
        for row in rows:
            row.arrange(direction=np.array([1, 0, 0]), buff=0.3)
        rows.arrange(direction=np.array([0, -1, 0]), aligned_edge=np.array([-1, 0, 0]), buff=0.45)
        rows.move_to([0, config.frame_height * 0.08, 0])
        self.play(FadeOut(group), FadeOut(wave), FadeOut(labels), run_time=0.8)
        self.play(LaggedStart(*[FadeIn(row) for row in rows], lag_ratio=0.4), run_time=2.5)
        self.wait(0.5)

        # ---- B3: exponents become slopes on log-log axes
        self.next_section("b3_slopes")
        eq = MathTex(
            TEX["1.2"][0],
            substrings_to_isolate=["^{-4}", "^{-3}", r"\mathrm{const}"],
        )
        eq.scale_to_fit_width(config.frame_width * 0.7)
        if eq.height < MIN_TEXT_HEIGHT:  # readability floor (epic test 15)
            eq.scale_to_fit_height(MIN_TEXT_HEIGHT)
        eq.to_edge(np.array([0, 1, 0]), buff=0.6)
        self.play(TransformMatchingTex(rows[0][0].copy(), eq), FadeOut(rows), run_time=1.2)

        axes = Axes(
            x_range=[-1, 0, 0.5],
            y_range=[0, 4, 1],
            x_length=config.frame_width * 0.55,
            y_length=config.frame_height * 0.45,
            tips=False,
        )
        axes.move_to([0, -config.frame_height * 0.08, 0])
        x_lbl = readable_text("log a", font=FONT_BODY, color=INK_MID)
        x_lbl.next_to(axes, np.array([1, -1, 0]), buff=0.15)
        y_lbl = readable_text("log ρ", font=FONT_BODY, color=INK_MID)
        y_lbl.next_to(axes, np.array([-1, 1, 0]), buff=0.15)

        # slopes: in log-log space, density ~ a^n becomes a line of slope n
        s_rad, s_mat, s_lam = dilution_slopes()
        x0, x1 = -1.0, 0.0
        line_rad = axes.plot(dilution_line(s_rad, 0.0), x_range=[x0, x1], color=GOLDILOCKS)
        line_matter = axes.plot(dilution_line(s_mat, 0.0), x_range=[x0, x1], color=WARM)
        line_lambda = axes.plot(dilution_line(s_lam, 1.0), x_range=[x0, x1], color=LAMBDA_PURPLE)
        self.play(Write(axes), Write(x_lbl), Write(y_lbl), run_time=1.2)
        self.play(LaggedStart(Write(line_rad), Write(line_matter), Write(line_lambda), lag_ratio=0.35), run_time=2.5)

        slopes = VGroup(
            MathTex(rf"\text{{slope }} {{{s_rad}}}", color=GOLDILOCKS),
            MathTex(rf"\text{{slope }} {{{s_mat}}}", color=WARM),
            MathTex(rf"\text{{slope }} {{{s_lam}}}", color=LAMBDA_PURPLE),
        )
        slopes[0].next_to(line_rad, np.array([-1, 0, 0]), buff=0.2)
        slopes[1].next_to(line_matter, np.array([-1, 0, 0]), buff=0.2)
        slopes[2].next_to(line_lambda, np.array([1, 0, 0]), buff=0.2)
        self.play(TransformMatchingTex(eq, slopes), run_time=1.5)
        self.wait(0.5)

        # ---- B4: acceleration onset and density crossover are two moments
        self.next_section("b4_markers")
        accel_eq = MathTex(TEX["1.2"][1], color=INK)
        accel_eq.scale_to_fit_width(config.frame_width * 0.6)
        if accel_eq.height < MIN_TEXT_HEIGHT:
            accel_eq.scale_to_fit_height(MIN_TEXT_HEIGHT)
        accel_eq.to_edge(np.array([0, 1, 0]), buff=0.8)
        a_axis = NumberLine(
            x_range=[0.1, 1.0, 0.1],
            length=config.frame_width * 0.7,
            color=INK_MID,
            include_ticks=True,
        )
        a_axis.move_to([0, -config.frame_height * 0.05, 0])
        accel_lbl = readable_text(
            f"acceleration begins · a = {A_ACCEL}", font=FONT_BODY, color=GOLDILOCKS,
            max_width=config.frame_width * 0.34,
        )
        cross_lbl = readable_text(
            f"densities cross · a = {A_CROSS}", font=FONT_BODY, color=WARM,
            max_width=config.frame_width * 0.34,
        )
        p_accel = a_axis.number_to_point(A_ACCEL)
        p_cross = a_axis.number_to_point(A_CROSS)
        m_accel = Dot(p_accel, color=GOLDILOCKS, radius=0.08)
        m_cross = Dot(p_cross, color=WARM, radius=0.08)
        accel_lbl.next_to(m_accel, np.array([0, -1, 0]), buff=0.25)
        cross_lbl.next_to(m_cross, np.array([0, 1, 0]), buff=0.25)

        self.play(FadeOut(axes), FadeOut(x_lbl), FadeOut(y_lbl), FadeOut(line_rad), FadeOut(line_matter), FadeOut(line_lambda), FadeOut(slopes), run_time=0.8)
        self.play(Write(accel_eq), run_time=1.2)
        self.play(Write(a_axis), run_time=1)
        self.play(FadeIn(m_accel), Write(accel_lbl), run_time=1.2)
        self.play(FadeIn(m_cross), Write(cross_lbl), run_time=1.2)
        self.wait(0.5)

        # ---- CLOSE: standard frame — accelerating era shaded, today at a = 1
        self.next_section("close")
        self.play(
            FadeOut(a_axis), FadeOut(m_accel), FadeOut(m_cross),
            FadeOut(accel_lbl), FadeOut(cross_lbl), FadeOut(accel_eq),
            run_time=0.6,
        )
        frame = self.closing_frame(
            0.1,
            1.0,
            band=(A_ACCEL, 1.0),
            walls=[
                (A_ACCEL, "solid", "acceleration begins"),
                (A_CROSS, "solid", "densities cross"),
            ],
            marker=1.0,
            tick_step=0.3,
            include_numbers=True,
        )
        self.play(FadeIn(frame), run_time=1.2)
        self.wait(0.6)


class S1_3_Friedmann(FTUScene):
    """Scene 1.3 — Friedmann equation. Stage 3, issue #65."""

    def construct(self):
        self.not_implemented("1.3 Friedmann equation")


class S1_4_Flatness(FTUScene):
    """Scene 1.4 — Flatness. Stage 3, issue #66."""

    def construct(self):
        self.not_implemented("1.4 Flatness")


class S1_5_CosmologicalConstant(FTUScene):
    """Scene 1.5 — The cosmological constant problem. Stage 3, issue #67."""

    def construct(self):
        self.not_implemented("1.5 The cosmological constant problem")


class S1_6_PenroseNumber(FTUScene):
    """Scene 1.6 — Penrose's number. Stage 3, issue #68."""

    def construct(self):
        self.not_implemented("1.6 Penrose's number")
