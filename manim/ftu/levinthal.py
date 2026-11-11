"""Exact mean first-passage time for Levinthal's paradox (scene 8.3).

Model: Zwanzig, Szabo & Bagchi 1992 — N bonds, nu wrong states each,
k1 corrections per second, K = nu * exp(-U/kT), start with all bonds wrong.

    tau(U) = (1/k1) * sum_{n=1..N} [ sum_{m=n..N} C(N,m) K^m ] / [ n * C(N,n) * K^n ]

High-precision arithmetic (mpmath) is required: binomial coefficients and K^m
span hundreds of orders of magnitude. Check values live in
ftu.constants.LEVINTHAL_MFPT_CHECKS and are asserted by test_levinthal.py.
"""

from mpmath import binomial, exp, mp, mpf

from ftu.constants import LEVINTHAL_K1, LEVINTHAL_N, LEVINTHAL_NU

mp.dps = 50


def mfpt_seconds(U, N=LEVINTHAL_N, nu=LEVINTHAL_NU, k1=LEVINTHAL_K1):
    """Exact mean first-passage time in seconds at energy bias U (units of kT)."""
    N = int(N)
    K = mpf(nu) * exp(-mpf(U))
    total = mpf(0)
    for n in range(1, N + 1):
        inner = sum(binomial(N, m) * K**m for m in range(n, N + 1))
        total += inner / (n * binomial(N, n) * K**n)
    return total / mpf(k1)


def curve(U_min=0.0, U_max=4.0, samples=41):
    """(U, tau_seconds) pairs for plotting; returns floats (log10 of seconds)."""
    import math

    step = (U_max - U_min) / (samples - 1)
    return [
        (U_min + i * step, math.log10(float(mfpt_seconds(U_min + i * step))))
        for i in range(samples)
    ]
