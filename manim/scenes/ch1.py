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
from ftu.style import (
    FONT_BODY,
    FONT_MONO,
    GOLDILOCKS,
    INK,
    INK_MID,
    INK_SOFT,
    WARM,
    FTUScene,
    apply_aspect_from_env,
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
                    cube.point_from_proportion(0.5)
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
        side = config.frame_height * 0.22
        group, dots = self.build_cube(side)
        group.shift([-config.frame_width * 0.22, 0.1, 0])
        self.play(FadeIn(group), run_time=1)

        label_kwargs = {"font": FONT_BODY, "color": INK}
        side_lbl = Text("side ×2", **label_kwargs)
        vol_lbl = Text("volume ×8", **label_kwargs)
        count_lbl = Text(f"particles: {self.N_PARTICLES} → {self.N_PARTICLES}", font=FONT_MONO, color=INK_MID)
        labels = VGroup(side_lbl, vol_lbl, count_lbl).arrange(direction=np.array([0, -1, 0]), aligned_edge=np.array([-1, 0, 0]), buff=0.4)
        for lbl in (side_lbl, vol_lbl, count_lbl):
            lbl.scale_to_fit_width(config.frame_width * 0.28)
        labels.arrange(direction=np.array([0, -1, 0]), aligned_edge=np.array([-1, 0, 0]), buff=0.35)
        labels.move_to([config.frame_width * 0.18, 0.1, 0])

        self.play(Write(side_lbl), group.animate.scale(2), run_time=2)
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

        eq_matter = MathTex(r"\rho_m \propto a^{-3}", color=WARM)
        eq_rad = MathTex(r"\rho_r \propto a^{-4}", color=GOLDILOCKS)
        eq_lambda = MathTex(r"\rho_\Lambda = \mathrm{const}", color=LAMBDA_PURPLE)
        note_matter = Text("matter thins with volume", font=FONT_BODY, color=INK_SOFT)
        note_rad = Text("light redshifts — one more power of a", font=FONT_BODY, color=INK_SOFT)
        note_lambda = Text("the vacuum does not dilute", font=FONT_BODY, color=INK_SOFT)
        rows = VGroup(
            VGroup(eq_matter, note_matter),
            VGroup(eq_rad, note_rad),
            VGroup(eq_lambda, note_lambda),
        )
        for row in rows:
            row[1].scale_to_fit_width(config.frame_width * 0.22)
            row.arrange(direction=np.array([1, 0, 0]), buff=0.3)
        rows.arrange(direction=np.array([0, -1, 0]), aligned_edge=np.array([-1, 0, 0]), buff=0.45)
        rows.move_to([0, config.frame_height * 0.08, 0])
        self.play(FadeOut(group), FadeOut(wave), FadeOut(labels), run_time=0.8)
        self.play(LaggedStart(*[FadeIn(row) for row in rows], lag_ratio=0.4), run_time=2.5)
        self.wait(0.5)

        # ---- B3: exponents become slopes on log-log axes
        self.next_section("b3_slopes")
        eq = MathTex(
            r"\rho_r \propto a^{-4} \qquad \rho_m \propto a^{-3} \qquad \rho_\Lambda = \mathrm{const}",
            substrings_to_isolate=["^{-4}", "^{-3}", r"\mathrm{const}"],
        )
        eq.scale_to_fit_width(config.frame_width * 0.7)
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
        x_lbl = Text("log a", font=FONT_BODY, color=INK_MID)
        x_lbl.scale_to_fit_width(config.frame_width * 0.08)
        x_lbl.next_to(axes, np.array([1, -1, 0]), buff=0.15)
        y_lbl = Text("log ρ", font=FONT_BODY, color=INK_MID)
        y_lbl.scale_to_fit_width(config.frame_width * 0.08)
        y_lbl.next_to(axes, np.array([-1, 1, 0]), buff=0.15)

        # slopes: in log-log space, density ~ a^n becomes a line of slope n
        x0, x1 = -1.0, 0.0
        line_rad = axes.plot(lambda x: 4.0 + 4.0 * (x - x0) / 1.0 * -1, x_range=[x0, x1], color=GOLDILOCKS)
        line_matter = axes.plot(lambda x: 3.0 + 3.0 * (x - x0) / 1.0 * -1, x_range=[x0, x1], color=WARM)
        line_lambda = axes.plot(lambda x: 1.0, x_range=[x0, x1], color=LAMBDA_PURPLE)
        self.play(Write(axes), Write(x_lbl), Write(y_lbl), run_time=1.2)
        self.play(LaggedStart(Write(line_rad), Write(line_matter), Write(line_lambda), lag_ratio=0.35), run_time=2.5)

        slopes = VGroup(
            MathTex(r"\text{slope } {-4}", color=GOLDILOCKS),
            MathTex(r"\text{slope } {-3}", color=WARM),
            MathTex(r"\text{slope } {0}", color=LAMBDA_PURPLE),
        )
        slopes[0].next_to(line_rad, np.array([-1, 0, 0]), buff=0.2)
        slopes[1].next_to(line_matter, np.array([-1, 0, 0]), buff=0.2)
        slopes[2].next_to(line_lambda, np.array([1, 0, 0]), buff=0.2)
        for s in slopes:
            s.scale_to_fit_width(config.frame_width * 0.12)
        self.play(TransformMatchingTex(eq, slopes), run_time=1.5)
        self.wait(0.5)

        # ---- B4: acceleration onset and density crossover are two moments
        self.next_section("b4_markers")
        a_axis = NumberLine(
            x_range=[0.1, 1.0, 0.1],
            length=config.frame_width * 0.7,
            color=INK_MID,
            include_ticks=True,
        )
        a_axis.move_to([0, -config.frame_height * 0.05, 0])
        accel_lbl = Text(f"acceleration begins · a = {A_ACCEL}", font=FONT_BODY, color=GOLDILOCKS)
        cross_lbl = Text(f"densities cross · a = {A_CROSS}", font=FONT_BODY, color=WARM)
        accel_lbl.scale_to_fit_width(config.frame_width * 0.3)
        cross_lbl.scale_to_fit_width(config.frame_width * 0.3)
        p_accel = a_axis.number_to_point(A_ACCEL)
        p_cross = a_axis.number_to_point(A_CROSS)
        m_accel = Dot(p_accel, color=GOLDILOCKS, radius=0.08)
        m_cross = Dot(p_cross, color=WARM, radius=0.08)
        accel_lbl.next_to(m_accel, np.array([0, -1, 0]), buff=0.25)
        cross_lbl.next_to(m_cross, np.array([0, 1, 0]), buff=0.25)

        self.play(FadeOut(axes), FadeOut(x_lbl), FadeOut(y_lbl), FadeOut(line_rad), FadeOut(line_matter), FadeOut(line_lambda), FadeOut(slopes), run_time=0.8)
        self.play(Write(a_axis), run_time=1)
        self.play(FadeIn(m_accel), Write(accel_lbl), run_time=1.2)
        self.play(FadeIn(m_cross), Write(cross_lbl), run_time=1.2)
        self.wait(0.5)

        # ---- CLOSE: standard frame — accelerating era shaded, today at a = 1
        self.next_section("close")
        self.play(
            FadeOut(a_axis), FadeOut(m_accel), FadeOut(m_cross),
            FadeOut(accel_lbl), FadeOut(cross_lbl),
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
