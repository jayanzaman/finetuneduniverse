"""Each physics.py function must reproduce the owner-reviewed fixture value it
backs, at the precision the plan prints it. Values are read from the fixture,
never restated here.
"""

import json
import math
from pathlib import Path

from ftu import physics

FIXTURE = Path(__file__).parent / "fixtures" / "numbers.json"
F = json.loads(FIXTURE.read_text())


def test_a_accel_and_a_cross():
    assert round(physics.a_accel(), 2) == F["A_ACCEL"]  # exact 0.6125
    assert round(physics.a_cross(), 2) == F["A_CROSS"]  # exact 0.7720


def test_redshifts():
    assert round(physics.redshift(physics.a_accel()), 2) == F["Z_ACCEL"]
    assert round(physics.redshift(physics.a_cross()), 2) == F["Z_CROSS"]


def test_dilution_slopes():
    assert physics.dilution_slopes() == (-4, -3, 0)


def test_lambda_takeover_at_scale_one_is_the_crossover():
    assert math.isclose(physics.lambda_takeover_a(1), physics.a_cross())


def test_pp_q_value():
    # 2.2246 - 1.293 - 0.511 = 0.4206; the plan prints 0.420
    assert abs(physics.pp_q_mev() - F["Q_PP_MEV"]) < 1e-3


def test_fusion_mass_balance():
    fx = F["FUSION"]
    assert round(physics.fusion_deficit_percent(fx["mass_in_u"], fx["mass_out_u"]), 3) == fx["deficit_percent"]
    assert round(physics.fusion_energy_mev(fx["deficit_u"]), 2) == fx["energy_MeV"]


def test_triple_alpha_rate_factor():
    ta = F["TRIPLE_ALPHA"]
    actual = physics.triple_alpha_rate_factor(ta["shift_keV"], ta["kT_keV"])
    assert abs(actual - ta["factor"]) / ta["factor"] < 0.01  # plan prints 2 sig figs


def test_helium_mass_fraction_simple():
    num, den = F["NP_BBN"]
    assert round(physics.y_p_simple(num / den), 2) == F["Y_P_SIMPLE"]


def test_photons_per_baryon():
    actual = physics.photons_per_baryon(F["ETA"])
    expected = F["PHOTONS_PER_BARYON"]
    assert abs(actual - expected) / expected < 0.05  # plan prints 2 sig figs


def test_earth_equilibrium_temperature():
    e = F["EARTH"]
    assert round(physics.t_eq(e["solar_constant_W_m2"], e["albedo"])) == e["T_eq_K"]


def test_error_threshold_letters():
    # ln(sigma) = 1, i.e. sigma = e, at the fixture's 1% error per letter
    et = F["ERROR_THRESHOLD"]
    assert round(physics.error_threshold_letters(math.e, et["error_per_letter"])) == et["letters"]


def test_sequence_decades():
    s = F["SEQUENCES"]
    assert round(physics.sequence_decades(s["base"], s["length"]), 2) == s["decades"]


def test_shannon_bits():
    sh = F["SHANNON"]
    assert round(physics.shannon_bits([0.25] * 4), 6) == sh["max_bits"]
    gc = sh["gc_fraction"] / 2
    at = (1 - sh["gc_fraction"]) / 2
    assert round(physics.shannon_bits([gc, gc, at, at]), 2) == sh["bits_at_gc"]


def test_dna_ceiling():
    d = F["DNA_DENSITY"]
    bits = physics.dna_ceiling_bits_per_g(F["SHANNON"]["max_bits"], d["g_per_mol_nt"])
    assert abs(bits - d["ceiling_bits_per_g"]) / d["ceiling_bits_per_g"] < 0.01
    eb = bits / 8 / 1e18
    assert abs(eb - d["ceiling_EB_per_g"]) / d["ceiling_EB_per_g"] < 0.01


def test_penrose_entropy():
    actual = physics.penrose_entropy_k(F["BARYONS"])
    expected = F["PENROSE_ENTROPY"]
    assert abs(actual - expected) / expected < 0.1  # Penrose's estimate is approximate
