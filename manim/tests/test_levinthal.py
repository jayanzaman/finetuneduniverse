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
    for u_str, expected in C.LEVINTHAL_CHECK_S.items():
        if u_str == "large":
            continue
        actual = float(mfpt_seconds(float(u_str)))
        rel = abs(actual - expected) / expected
        assert rel < ROUNDING_TOLERANCE, f"U={u_str}: MFPT {actual:.4g}s vs plan {expected:.4g}s (rel {rel:.2e})"


def test_mfpt_large_u_limit():
    expected = C.LEVINTHAL_CHECK_S["large"]
    actual = float(mfpt_seconds(10))
    rel = abs(actual - expected) / expected
    assert rel < ROUNDING_TOLERANCE, f"large-U MFPT {actual:.4g}s vs plan {expected:.4g}s"


def test_u0_model_value_kept_distinct_from_levinthal_classic():
    # the model's own U=0 figure (~8e28 yr) must not be forced to agree with
    # Levinthal's classic 1e27 yr at 1e13 trials/s
    u0_years = float(mfpt_seconds(0)) / SECONDS_PER_YEAR
    expected = C.LEVINTHAL["U0_model_years"]
    rel = abs(u0_years - expected) / expected
    assert rel < 0.05, f"model U=0 is {u0_years:.3g} yr, plan says {expected:.3g}"
    assert u0_years > C.LEVINTHAL["blind_years"] * 10  # clearly distinct, not reconciled


def test_one_second_at_u_equals_2():
    assert abs(float(mfpt_seconds(C.LEVINTHAL["U_one_second_kT"])) - 1.0) < 0.05


def test_curve_is_monotone_decreasing_and_covers_close_range():
    pts = curve(0.0, 4.0, samples=21)
    assert pts[0][0] == 0.0 and pts[-1][0] == 4.0
    logs = [p[1] for p in pts]
    assert all(b <= a + 1e-9 for a, b in zip(logs, logs[1:])), "folding time must fall as U rises"
