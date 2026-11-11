"""constants.py must carry every NUMBERS entry from docs/manim-plan.md exactly,
each with a basis comment (ground rule 6). Values are asserted, never "fixed".
"""

import re
from pathlib import Path

import ftu.constants as C

CONSTANTS_SRC = Path(C.__file__)


# Spot-critical values called out in issue #62, plus display-rounding rules.
EXPECTED = {
    "H0_CMB": 67.4,
    "H0_CMB_ERR": 0.5,
    "H0_LOCAL": 73.50,
    "H0_LOCAL_ERR": 0.81,
    "OMEGA_M": 0.315,
    "OMEGA_LAMBDA": 0.685,
    "OMEGA_R": 9e-5,
    "A_ACCEL": 0.61,
    "A_CROSS": 0.77,
    "LAMBDA_LIMIT": 200,
    "FLATNESS_AT_PLANCK_TIME": 1e-60,
    "VACUUM_OVERSHOOT_PLANCK": 1e123,
    "RHO_LAMBDA_PLANCK_UNITS": 1.1e-123,
    "BARYONS": 1e80,
    "PENROSE_ENTROPY": 7e122,
    "ETA": 6e-10,
    "PHOTONS_PER_BARYON": 1.6e9,
    "ETA_UPPER": 1e-6,
    "DELTA_M": 1.293,
    "M_E": 0.511,
    "B_D": 2.2246,
    "B_D_DISPLAY": "2.22",
    "NP_FREEZE": 0.15,
    "NP_BBN": 1 / 7,
    "Y_P_SIMPLE": 0.25,
    "DEUTERIUM_ONSET": 0.07,
    "Q_PP": 0.420,
    "DM_LOW": 0.511,
    "DM_HIGH": 1.714,
    "FUSION_H_IN_U": 4.0313,
    "FUSION_HE_OUT_U": 4.002602,
    "FUSION_DEFICIT_U": 0.0287,
    "FUSION_DEFICIT_PCT": 0.712,
    "FUSION_ENERGY_MEV": 26.73,
    "HOYLE_LEVEL": 7.654,
    "DELTA_H": 379.5,
    "DELTA_H_DISPLAY": "380",
    "BE8_UNBOUND_KEV": 92,
    "BE8_LIFETIME_S": 1e-16,
    "TRIPLE_ALPHA_RATE_FACTOR": 1.1e5,
    "KT_AT_1E8_K_KEV": 8.617,
    "SGR_A_MASS": 4.3e6,
    "S2_PERIOD_YR": 16.05,
    "S2_SEMIMAJOR_AU": 1031,
    "S2_PERICENTER_AU": 120,
    "EARTH_T_EQ": 255,
    "EARTH_T_MEASURED": 288,
    "GREENHOUSE_DELTA": 33,
    "HZ_SUN": (0.99, 1.70),
    "HZ_SUN_3D_INNER": 0.95,
    "VENUS_AU": 0.72,
    "MARS_AU": 1.52,
    "ERROR_THRESHOLD_LETTERS": 100,
    "RNA_VIRUS_GENOME": 1e4,
    "CODONS_TOTAL": 64,
    "CODONS_SENSE": 61,
    "CODONS_STOP": 3,
    "CODE_RANK": 1e-6,
    "SEQUENCES_DECADES": 195.15,
    "TRIALS": 1e97,
    "WORKING_FRACTION_HIGH": 1e-11,
    "WORKING_FRACTION_LOW": 1e-77,
    "WORKING_FRACTION_DECADES": 66,
    "LEVINTHAL_N": 100,
    "LEVINTHAL_NU": 2,
    "LEVINTHAL_K1": 1e9,
    "LEVINTHAL_CONFIGS": 5.15e47,
    "LEVINTHAL_BLIND_YEARS": 1e27,
    "UNIVERSE_AGE_YR": 1e10,
    "SHANNON_MAX_BITS": 2,
    "SHANNON_GC41_BITS": 1.98,
    "DNA_CEILING_BITS_PER_G": 3.65e21,
    "DNA_CEILING_EB_PER_G": 455,
    "DNA_RECORD_PB_PER_G": 215,
    "DRAKE_P_N_LT_1": 0.52,
}


def test_spot_critical_values():
    for name, expected in EXPECTED.items():
        actual = getattr(C, name)
        assert actual == expected, f"{name}: plan says {expected!r}, constants.py has {actual!r}"


def test_display_rounding_pairs():
    # plan-mandated display rounding: full precision stored, display string kept
    assert C.PENROSE_ENTROPY_DISPLAY == "1e123"
    assert C.S2_PERIOD_YR_DISPLAY == "16"
    assert C.SEQUENCES_DISPLAY == "1e195"


def test_levinthal_mfpt_check_values():
    assert C.LEVINTHAL_MFPT_CHECKS == {0: 2.59e36, 1: 1.23e13, 2: 0.973, 3: 1.51e-6, 4: 1.77e-8}
    assert C.LEVINTHAL_MFPT_LARGE_U == 5.19e-9


def test_drake_ranges_and_share():
    assert C.DRAKE_RANGES == {
        "R_star": (1, 100),
        "f_p": (0.1, 1),
        "n_e": (0.1, 1),
        "f_i": (1e-3, 1),
        "f_c": (0.01, 1),
        "L": (1e2, 1e10),
    }
    assert C.DRAKE_ALONE_AFTER == (0.53, 0.996)


def test_s2_orbit_consistency():
    # the scene's own formula must reproduce Sgr A*'s mass within 5%
    m = C.S2_SEMIMAJOR_AU**3 / C.S2_PERIOD_YR**2
    assert abs(m - C.SGR_A_MASS) / C.SGR_A_MASS < 0.05


def test_every_constant_has_basis_comment():
    pattern = re.compile(r"^[A-Z][A-Z0-9_]*\s*=\s*")
    missing = []
    for line in CONSTANTS_SRC.read_text().splitlines():
        if pattern.match(line) and "#" not in line:
            missing.append(line.strip())
    assert not missing, f"constants missing basis comments: {missing}"
