# FTU Manim pipeline — single source of truth for on-screen numbers.
# Keys and values mirror manim/tests/fixtures/numbers.json exactly (owner-reviewed;
# the builder must not edit the fixture). Ground rule 6: do not change or "fix" a
# number here; flag it to the owner instead. Lists from the fixture are tuples here;
# the test normalizes before comparing.

# --- 1.1 Hubble tension ---
H0_CMB = (67.4, 0.5)  # Planck 2018, LambdaCDM fit to the CMB: value ± uncertainty, km/s/Mpc
H0_LOCAL = (73.50, 0.81)  # Local Distance Network, 2026 (distance ladder): value ± uncertainty
H0_GAP_PERCENT = 9  # percent gap between the two measurements
H0_GAP_LABEL = "more than 6 sigma"  # on-screen label for the gap
H0_GAP_SIGMA_COMBINED_FIT = 7.1  # sigma vs the combined CMB fit

# --- 1.2 / 1.3 dilution + Friedmann ---
OMEGA_M = 0.315  # Planck 2018, flat
OMEGA_LAMBDA = 0.685  # Planck 2018, flat
OMEGA_R = 9e-5  # approximate standard value; only places the radiation line
A_ACCEL = 0.61  # computed: acceleration begins, rho_m = 2 * rho_Lambda
Z_ACCEL = 0.63  # redshift of acceleration onset
A_CROSS = 0.77  # computed: matter/Lambda density crossover
Z_CROSS = 0.30  # redshift of crossover
LAMBDA_LIMIT = 200  # x observed, holding fluctuation amplitude Q at LAMBDA_LIMIT_Q
LAMBDA_LIMIT_Q = 1e-5  # fluctuation amplitude held fixed for the 200x limit
LAMBDA_LIMIT_Q_FREE = 1e11  # x observed if Q is allowed to reach LAMBDA_LIMIT_Q_FREE_Q
LAMBDA_LIMIT_Q_FREE_Q = 1e-2  # loosened fluctuation amplitude

# --- 1.4 flatness ---
FLATNESS_AT_PLANCK_TIME = 1e-60  # required |Omega - 1| at the Planck time

# --- 1.5 cosmological constant problem ---
VACUUM_OVERSHOOT = {"QCD": 1e45, "electroweak": 1e55, "Planck": 1e123}  # overshoot by cutoff scale
RHO_LAMBDA_PLANCK_UNITS = 1.1e-123  # computed: observed vacuum density in Planck units

# --- 1.6 Penrose's number ---
BARYONS = 1e80  # baryons in the observable universe
PENROSE_ENTROPY = 7e122  # Penrose's black-hole maximum, in units of k
PENROSE_ENTROPY_SHOWN = 1e123  # plan: shown as 1e123

# --- 2.1 matter excess ---
ETA = 6e-10  # measured baryon-to-photon ratio n_b / n_gamma
PHOTONS_PER_BARYON = 1.6e9  # photons per surviving baryon
ETA_UPPER = 1e-6  # one review: universes viable up to about this eta

# --- 2.2 neutron-proton ratio / helium ---
DELTA_M_MEV = 1.293  # neutron-proton mass difference
M_E_MEV = 0.511  # electron mass
NP_FREEZE = 0.15  # n/p ratio at weak freeze-out
NP_FREEZE_KT_MEV = 0.7  # freeze-out temperature
NP_BBN = (1, 7)  # n/p ratio 1/7 when nucleosynthesis begins
Y_P_SIMPLE = 0.25  # helium mass fraction, simple estimate
Y_P_FULL = 0.24  # helium mass fraction, full calculation

# --- 2.3 deuterium bottleneck ---
B_D_MEV = 2.2246  # deuterium binding energy
B_D_SHOWN = 2.22  # plan: show 2.22
DEUTERIUM_ONSET_MEV = 0.07  # temperature where nucleosynthesis begins

# --- 3.1 pp gate ---
Q_PP_MEV = 0.420  # energy released by p + p -> d + e+ + nu_e
DM_LOW_MEV = 0.511  # below this hydrogen atoms decay
DM_HIGH_MEV = 1.714  # above this the pp step costs energy
STRONG_FORCE_UNBIND_PERCENT = (4, 8)  # percent weaker strong force at which deuterium unbinds

# --- 3.2 fusion mass balance ---
FUSION = {  # four hydrogen atoms to one helium atom, atomic masses
    "m_H_u": 1.007825,  # atomic hydrogen mass
    "mass_in_u": 4.0313,  # 4 x m_H_u
    "mass_out_u": 4.002602,  # helium-4 atomic mass
    "deficit_u": 0.0287,  # missing mass per helium formed
    "deficit_percent": 0.712,  # percent of mass converted
    "energy_MeV": 26.73,  # released per helium nucleus
}
REES_EPSILON_LIMITS = (0.006, 0.008)  # Martin Rees's disputed limits on the fraction

# --- 3.3 Hoyle resonance ---
HOYLE_LEVEL_MEV = 7.654  # carbon-12 resonance level
DELTA_H_KEV = 379.5  # keV above the three-helium threshold
DELTA_H_SHOWN_KEV = 380  # plan: show 380
HOYLE_WINDOW_C_AND_O_KEV = (-100, 100)  # carbon and oxygen together
HOYLE_WINDOW_C_ALONE_KEV = (-300, 500)  # carbon alone
BE8_UNBOUND_KEV = 92  # beryllium-8 is unbound by this much
BE8_LIFETIME_S = 1e-16  # approximate beryllium-8 lifetime
TRIPLE_ALPHA = {  # rate sensitivity of the 3-alpha process
    "shift_keV": 100,  # level shift that changes the rate...
    "factor": 1.1e5,  # ...by this much at T_K
    "T_K": 1e8,  # temperature
    "kT_keV": 8.617,  # kT at 1e8 K
}

# --- 3.4 binding curve ---
BINDING_PEAK = ("Ni-62", "Fe-58", "Fe-56")  # measured atomic masses, highest first

# --- 4.1 Sgr A* / S2 ---
SGR_A_MSUN = 4.3e6  # solar masses within 120 AU
S2_PERIOD_YR = 16  # plan NUMBERS: S2 period 16 years
S2_CLOSEST_AU = 120  # closest approach

# --- 5.1 habitable zone ---
EARTH = {  # Earth's energy balance
    "T_eq_K": 255,  # equilibrium temperature
    "albedo": 0.30,  # Bond albedo used for T_eq
    "solar_constant_W_m2": 1361,  # at 1 AU
    "T_mean_K": 288,  # measured mean surface temperature
}
HZ_SUN_AU = (0.99, 1.70)  # 1D climate model (water loss / max greenhouse)
HZ_INNER_3D_AU = 0.95  # inner edge from 3D models
VENUS_AU = 0.72  # orbital distance
MARS_AU = 1.52  # orbital distance

# --- 6.1 error threshold ---
ERROR_THRESHOLD = {  # Eigen's single-peak model
    "letters": 100,  # approximate length limit at this error rate
    "error_per_letter": 0.01,  # unaided-copying error rate
    "rna_virus_letters": 1e4,  # marker for real RNA viruses
}

# --- 8.1 codons ---
CODONS = {"total": 64, "coding": 61, "stop": 3, "groups": 21}  # 4^3 words: sense + stop, 20 amino acids + stop
CODE_RANK = 1e-6  # real code beats all but about 1 in 1e6 random codes (Freeland & Hurst)

# --- 8.2 sequence space ---
SEQUENCES = {"base": 20, "length": 150, "decades": 195.15}  # 20^150 = 1e195; log10(20^150)
TRIALS = 1e97  # every atom acting once a second for the age of the universe
WORKING_FRACTION = (1e-11, 1e-77)  # Keefe & Szostak 2001 ATP binding; Axe's enzyme estimate
WORKING_FRACTION_DECADES = 66  # decades between the two estimates

# --- 8.3 Levinthal ---
LEVINTHAL = {  # Zwanzig, Szabo & Bagchi 1992 model and check figures
    "N": 100,  # bonds
    "nu": 2,  # wrong states per bond
    "k1_per_s": 1e9,  # corrections per second
    "configs": 5.15e47,  # 3^100 configurations
    "blind_years": 1e27,  # classic estimate at blind_rate_per_s
    "blind_rate_per_s": 1e13,  # trials per second behind the classic 1e27-year figure
    "U_one_second_kT": 2,  # folding takes ~1 s at U = 2 kT
    "universe_years": 1e10,  # age of the universe
    "U0_model_years": 8e28,  # the model's own U=0 figure, kept distinct from 1e27
}
LEVINTHAL_CHECK_S = {  # plan-mandated exact-MFPT check values, seconds
    "0": 2.59e36,
    "1": 1.23e13,
    "2": 0.973,
    "3": 1.51e-6,
    "4": 1.77e-8,
    "large": 5.19e-9,
}

# --- 8.4 Shannon / DNA density ---
SHANNON = {  # entropy of the four-letter code
    "max_bits": 2,  # bits per base, four letters at equal odds
    "gc_fraction": 0.41,  # G+C share for the skewed example
    "bits_at_gc": 1.98,  # bits per base at 41% G+C (share approximate)
}
DNA_DENSITY = {  # storage density ceiling vs lab record
    "ceiling_bits_per_g": 3.65e21,  # 2 bits x N_A / 330 g/mol
    "ceiling_EB_per_g": 455,  # exabytes per gram, same ceiling
    "lab_PB_per_g": 215,  # petabytes per gram, lab record (Erlich & Zielinski 2017)
    "g_per_mol_nt": 330,  # per nucleotide, single-stranded DNA
}

# --- U.1 Drake ---
DRAKE = {  # Sandberg, Drexler & Ord 2018
    "p_alone_before": 0.52,  # paper's printed P(N < 1) before the silent-sky update
    "p_alone_after": (0.53, 0.996),  # chance we are alone after the silent-sky update
    "ranges_log_uniform": {  # log-uniform sampling ranges
        "R_star": (1, 100),  # per year
        "f_p": (0.1, 1),
        "n_e": (0.1, 1),
        "f_i": (0.001, 1),
        "f_c": (0.01, 1),
        "L": (100, 1e10),  # years
    },
}
