"""Scene 8.3 must plot the exact Zwanzig-Szabo-Bagchi MFPT, and the values must
match the plan's check values (issue #63). The approximation shown on screen
is never used for the curve.
"""

import ftu.constants as C
from ftu.levinthal import curve, mfpt_seconds

SECONDS_PER_YEAR = 365.25 * 86400


# The plan's check values are quoted to 3 significant figures; the exact MFPT
# agrees with them within that rounding, so the tolerance is 0.5%.
ROUNDING_TOLERANCE = 5e-3


def test_mfpt_matches_plan_check_values():
    for U, expected in C.LEVINTHAL_MFPT_CHECKS.items():
        actual = float(mfpt_seconds(U))
        rel = abs(actual - expected) / expected
        assert rel < ROUNDING_TOLERANCE, f"U={U}: MFPT {actual:.4g}s vs plan {expected:.4g}s (rel {rel:.2e})"


def test_mfpt_large_u_limit():
    actual = float(mfpt_seconds(10))
    rel = abs(actual - C.LEVINTHAL_MFPT_LARGE_U) / C.LEVINTHAL_MFPT_LARGE_U
    assert rel < ROUNDING_TOLERANCE, f"large-U MFPT {actual:.4g}s vs plan {C.LEVINTHAL_MFPT_LARGE_U:.4g}s"


def test_u0_model_value_kept_distinct_from_levinthal_classic():
    # the model's own U=0 figure (~8e28 yr) must not be forced to agree with
    # Levinthal's classic 1e27 yr at 1e13 trials/s
    u0_years = float(mfpt_seconds(0)) / SECONDS_PER_YEAR
    rel = abs(u0_years - C.LEVINTHAL_MFPT_U0_YEARS) / C.LEVINTHAL_MFPT_U0_YEARS
    assert rel < 0.05, f"model U=0 is {u0_years:.3g} yr, plan says {C.LEVINTHAL_MFPT_U0_YEARS:.3g}"
    assert u0_years > C.LEVINTHAL_BLIND_YEARS * 10  # clearly distinct, not reconciled


def test_one_second_at_u_equals_2():
    assert abs(float(mfpt_seconds(C.LEVINTHAL_ONE_SECOND_AT_U)) - 1.0) < 0.05


def test_curve_is_monotone_decreasing_and_covers_close_range():
    pts = curve(0.0, 4.0, samples=21)
    assert pts[0][0] == 0.0 and pts[-1][0] == 4.0
    logs = [p[1] for p in pts]
    assert all(b <= a + 1e-9 for a, b in zip(logs, logs[1:])), "folding time must fall as U rises"
