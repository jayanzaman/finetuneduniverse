"""Pipeline smoke scene — not shipped content.

Exercises FTUScene, closing_frame, assumption_line, and multi-beat sections so
manim/tests/test_render_smoke.py can validate render.sh end to end without
touching real scene data. All values here are placeholders for the smoke test.
"""

from manim import FadeIn

from ftu.style import FTUScene, apply_aspect_from_env

apply_aspect_from_env()


class SmokeScene(FTUScene):
    def construct(self):
        self.next_section("b1_placeholder")
        self.play(FadeIn(self.assumption_line("smoke test — not real content")))
        self.wait(0.2)

        self.next_section("close")
        frame = self.closing_frame(
            0.0,
            1.0,
            band=(0.4, 0.6),
            walls=[(0.4, "solid", "lo"), (0.6, "dashed", "hi")],
            marker=0.5,
        )
        self.play(FadeIn(frame))
        self.wait(0.2)
