"""The maths behind the scenes as plain functions (no Manim imports).

Scenes draw what these return; test_physics.py checks each function against
the owner-reviewed fixture value it backs. Physical constants below are
defining/unit-level constants, not plan data values; plan numbers come from
ftu.constants.
"""

import math

from ftu.constants import (
    A_ACCEL,
    A_CROSS,
    B_D_MEV,
    DELTA_M_MEV,
    ETA,
    M_E_MEV,
    OMEGA_LAMBDA,
    OMEGA_M,
)

from ftu.levinthal import mfpt_seconds as levinthal_mfpt  # noqa: F401  (re-export)

__all__ = [
    "a_accel",
    "a_cross",
    "dilution_slopes",
    "dna_ceiling_bits_per_g",
    "error_threshold_letters",
    "fusion_deficit_percent",
    "fusion_energy_mev",
    "lambda_takeover_a",
    "levinthal_mfpt",
    "n_over_p",
    "penrose_entropy_k",
    "photons_per_baryon",
    "pp_q_mev",
    "redshift",
    "sequence_decades",
    "shannon_bits",
    "t_eq",
    "triple_alpha_rate_factor",
    "y_p_simple",
]

# Defining physical constants (CODATA exact where applicable).
SIGMA_SB = 5.670374419e-8  # W m^-2 K^-4, Stefan-Boltzmann
N_A = 6.02214076e23  # mol^-1, Avogadro (exact)
U_TO_MEV = 931.494  # MeV per atomic mass unit
G_SI = 6.6743e-11  # m^3 kg^-1 s^-2
HBAR_SI = 1.054571817e-34  # J s
C_SI = 299792458.0  # m/s (exact)
M_PROTON_KG = 1.67262192e-27  # kg


def a_accel(om=OMEGA_M, ol=OMEGA_LAMBDA):
    """Scale factor where acceleration begins: rho_m = 2 * rho_Lambda."""
    return (om / (2 * ol)) ** (1 / 3)


def a_cross(om=OMEGA_M, ol=OMEGA_LAMBDA):
    """Scale factor where matter and dark-energy densities cross."""
    return (om / ol) ** (1 / 3)


def redshift(a):
    """z = 1/a - 1."""
    return 1 / a - 1


def dilution_slopes():
    """Log-log slopes of the radiation, matter and Lambda density lines."""
    return (-4, -3, 0)


def dilution_line(slope, intercept):
    """log10(density) as a function of log10(a): a straight line whose slope is
    the dilution exponent."""
    return lambda log_a: intercept + slope * log_a


def lambda_takeover_a(scale, om=OMEGA_M, ol=OMEGA_LAMBDA):
    """Scale factor where scale * Lambda's density overtakes matter's."""
    return (om / (scale * ol)) ** (1 / 3)


def pp_q_mev(b_d=B_D_MEV, dm=DELTA_M_MEV, m_e=M_E_MEV):
    """Energy released by p + p -> d + e+ + nu_e."""
    return b_d - dm - m_e


def fusion_deficit_percent(mass_in_u, mass_out_u):
    """Percent of the ingoing mass converted to energy."""
    return 100 * (mass_in_u - mass_out_u) / mass_in_u


def fusion_energy_mev(deficit_u):
    """Energy of a mass deficit in atomic mass units."""
    return deficit_u * U_TO_MEV


def triple_alpha_rate_factor(delta_kev, kt_kev):
    """Rate multiplier from shifting the Hoyle level by delta_kev."""
    return math.exp(delta_kev / kt_kev)


def n_over_p(dm_mev=DELTA_M_MEV, kt_mev=0.7):
    """Boltzmann factor for the neutron-proton ratio."""
    return math.exp(-dm_mev / kt_mev)


def y_p_simple(np_ratio):
    """Helium mass fraction from the neutron-proton ratio."""
    return 2 * np_ratio / (1 + np_ratio)


def photons_per_baryon(eta=ETA):
    """Photons per surviving baryon."""
    return 1 / eta


def t_eq(solar_constant, albedo):
    """Equilibrium temperature: absorbed on the disc, radiated from the sphere."""
    return (solar_constant * (1 - albedo) / (4 * SIGMA_SB)) ** 0.25


def error_threshold_letters(sigma, mu):
    """Eigen's length limit: L_max = ln(sigma) / mu."""
    return math.log(sigma) / mu


def sequence_decades(base, length):
    """log10 of the number of sequences."""
    return length * math.log10(base)


def shannon_bits(probabilities):
    """Shannon entropy in bits of a letter distribution."""
    return -sum(p * math.log2(p) for p in probabilities)


def dna_ceiling_bits_per_g(bits_per_base, g_per_mol_nt):
    """DNA storage ceiling in bits per gram."""
    return bits_per_base * N_A / g_per_mol_nt


def penrose_entropy_k(baryons):
    """Bekenstein-Hawking entropy (units of k) of one black hole holding the
    observable universe's baryons."""
    mass = baryons * M_PROTON_KG
    return 4 * math.pi * G_SI * mass**2 / (HBAR_SI * C_SI)
