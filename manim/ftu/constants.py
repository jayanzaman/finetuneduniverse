# FTU Manim pipeline — single source of truth for on-screen numbers.
# Every value below comes from the NUMBERS section of docs/manim-plan.md.
# Ground rule 6: do not change or "fix" a number here; flag it to the owner instead.
# Display rounding rules from the plan are stored as *_DISPLAY strings.

# --- 1.1 Hubble tension ---
H0_CMB = 67.4  # Planck 2018, LambdaCDM fit to the CMB
H0_CMB_ERR = 0.5  # Planck 2018
H0_LOCAL = 73.50  # Local Distance Network, 2026 (distance ladder)
H0_LOCAL_ERR = 0.81  # Local Distance Network, 2026
H0_GAP_PCT = 9  # percent gap between the two measurements
H0_GAP_LABEL = "more than 6 sigma"  # 7.1 sigma vs the combined CMB fit

# --- 1.2 / 1.3 dilution + Friedmann ---
OMEGA_M = 0.315  # Planck 2018, flat
OMEGA_LAMBDA = 0.685  # Planck 2018, flat
OMEGA_R = 9e-5  # approximate standard value; only places the radiation line
A_ACCEL = 0.61  # computed: acceleration begins (z = 0.63), rho_m = 2 * rho_Lambda
A_CROSS = 0.77  # computed: matter/Lambda density crossover (z = 0.30)
LAMBDA_LIMIT = 200  # x observed, holding fluctuation amplitude Q at 1e-5
LAMBDA_LIMIT_Q_VARIES = 1e11  # x observed if Q is allowed to reach 1e-2

# --- 1.4 flatness ---
FLATNESS_AT_PLANCK_TIME = 1e-60  # required |Omega - 1| at the Planck time

# --- 1.5 cosmological constant problem ---
VACUUM_OVERSHOOT_QCD = 1e45  # overshoot with a QCD-scale cutoff
VACUUM_OVERSHOOT_EW = 1e55  # overshoot with an electroweak-scale cutoff
VACUUM_OVERSHOOT_PLANCK = 1e123  # overshoot with a Planck-scale cutoff
RHO_LAMBDA_PLANCK_UNITS = 1.1e-123  # computed: observed vacuum density in Planck units

# --- 1.6 Penrose's number ---
BARYONS = 1e80  # baryons in the observable universe
PENROSE_ENTROPY = 7e122  # Penrose's black-hole maximum, in units of k
PENROSE_ENTROPY_DISPLAY = "1e123"  # plan: shown as 1e123

# --- 2.1 matter excess ---
ETA = 6e-10  # measured baryon-to-photon ratio n_b / n_gamma
PHOTONS_PER_BARYON = 1.6e9  # photons per surviving baryon
ETA_UPPER = 1e-6  # one review: universes viable up to about this eta

# --- 2.2 neutron-proton ratio / helium ---
DELTA_M = 1.293  # MeV, neutron-proton mass difference
M_E = 0.511  # MeV, electron mass
NP_FREEZE = 0.15  # n/p ratio at weak freeze-out
NP_FREEZE_KT = 0.7  # MeV, freeze-out temperature
NP_BBN = 1 / 7  # n/p ratio when nucleosynthesis begins
Y_P_SIMPLE = 0.25  # helium mass fraction, simple estimate
Y_P_FULL = 0.24  # helium mass fraction, full calculation

# --- 2.3 deuterium bottleneck ---
B_D = 2.2246  # MeV, deuterium binding energy
B_D_DISPLAY = "2.22"  # plan: show 2.22
DEUTERIUM_ONSET = 0.07  # MeV, temperature where nucleosynthesis begins

# --- 3.1 pp gate ---
Q_PP = 0.420  # MeV, energy released by p + p -> d + e+ + nu_e
DM_LOW = 0.511  # MeV, below this hydrogen atoms decay
DM_HIGH = 1.714  # MeV, above this the pp step costs energy
STRONG_FORCE_UNBIND_PCT = (4, 8)  # percent weaker strong force at which deuterium unbinds

# --- 3.2 fusion mass balance ---
FUSION_H_IN_U = 4.0313  # u, 4 x 1.007825 (atomic hydrogen masses)
FUSION_HE_OUT_U = 4.002602  # u, helium-4 atomic mass
FUSION_DEFICIT_U = 0.0287  # u, missing mass per helium formed
FUSION_DEFICIT_PCT = 0.712  # percent of mass converted
FUSION_ENERGY_MEV = 26.73  # MeV released per helium nucleus
REES_EPSILON_LIMITS = (0.006, 0.008)  # Martin Rees's disputed limits on the fraction

# --- 3.3 Hoyle resonance ---
HOYLE_LEVEL = 7.654  # MeV, carbon-12 resonance level
DELTA_H = 379.5  # keV above the three-helium threshold
DELTA_H_DISPLAY = "380"  # plan: show 380
HOYLE_WINDOW_INNER_KEV = (-100, 100)  # carbon and oxygen together
HOYLE_WINDOW_OUTER_KEV = (-300, 500)  # carbon alone
BE8_UNBOUND_KEV = 92  # beryllium-8 is unbound by this much
BE8_LIFETIME_S = 1e-16  # approximate beryllium-8 lifetime
TRIPLE_ALPHA_SHIFT_KEV = 100  # level shift that changes the rate...
TRIPLE_ALPHA_RATE_FACTOR = 1.1e5  # ...by this much at 1e8 K
KT_AT_1E8_K_KEV = 8.617  # kT at 1e8 K

# --- 3.4 binding curve ---
BINDING_PEAK = ("Ni-62", "Fe-58", "Fe-56")  # measured atomic masses, highest first

# --- 4.1 Sgr A* / S2 ---
SGR_A_MASS = 4.3e6  # solar masses within 120 AU
S2_PERIOD_YR = 16.05  # GRAVITY fit 16.0455 yr (Abuter et al. 2018/2020)
S2_PERIOD_YR_DISPLAY = "16"  # plan NUMBERS: S2 period 16 years
S2_SEMIMAJOR_AU = 1031  # 125.06 mas at 8.3 kpc (GRAVITY)
S2_PERICENTER_AU = 120  # closest approach, ~17 light-hours (GRAVITY)

# --- 5.1 habitable zone ---
EARTH_T_EQ = 255  # K, equilibrium temperature (albedo 0.30, 1361 W/m^2)
EARTH_ALBEDO = 0.30  # Bond albedo used for T_eq
SOLAR_CONSTANT = 1361  # W/m^2 at 1 AU
EARTH_T_MEASURED = 288  # K, measured mean surface temperature
GREENHOUSE_DELTA = 33  # K, measured minus equilibrium
HZ_SUN = (0.99, 1.70)  # AU, 1D climate model (water loss / max greenhouse)
HZ_SUN_3D_INNER = 0.95  # AU, inner edge from 3D models
VENUS_AU = 0.72  # orbital distance
EARTH_AU = 1.00  # orbital distance
MARS_AU = 1.52  # orbital distance

# --- 6.1 error threshold ---
ERROR_THRESHOLD_PCT = 1  # percent error per letter for the unaided-copying case
ERROR_THRESHOLD_LETTERS = 100  # approximate length limit at that error rate
RNA_VIRUS_GENOME = 1e4  # letters, marker for real RNA viruses

# --- 8.1 codons ---
CODONS_TOTAL = 64  # 4^3 three-letter words
CODONS_SENSE = 61  # codons coding for amino acids
CODONS_STOP = 3  # stop codons
CODON_GROUPS = 21  # 20 amino acids + stop
CODE_RANK = 1e-6  # real code beats all but about 1 in 1e6 random codes (Freeland & Hurst)

# --- 8.2 sequence space ---
SEQ_ALPHABET = 20  # amino acid choices per slot
SEQ_LENGTH = 150  # residues in the example protein
SEQUENCES_DECADES = 195.15  # log10(20^150)
SEQUENCES_DISPLAY = "1e195"  # plan: 20^150 = 1e195
TRIALS = 1e97  # every atom acting once a second for the age of the universe
WORKING_FRACTION_HIGH = 1e-11  # ATP binding in 80-residue chains (Keefe & Szostak 2001)
WORKING_FRACTION_LOW = 1e-77  # Axe's estimate for a specific enzyme function (~150 residues)
WORKING_FRACTION_DECADES = 66  # decades between the two estimates

# --- 8.3 Levinthal ---
LEVINTHAL_N = 100  # bonds (Zwanzig, Szabo & Bagchi 1992)
LEVINTHAL_NU = 2  # wrong states per bond
LEVINTHAL_K1 = 1e9  # corrections per second
LEVINTHAL_CONFIGS = 5.15e47  # 3^100 configurations
LEVINTHAL_BLIND_YEARS = 1e27  # classic estimate at 1e13 trials per second
LEVINTHAL_BLIND_RATE = 1e13  # trials per second behind the classic 1e27-year figure
LEVINTHAL_ONE_SECOND_AT_U = 2  # folding takes ~1 s at U = 2 kT
UNIVERSE_AGE_YR = 1e10  # years
# Exact MFPT check values (seconds), plan-mandated, for test_levinthal.py:
LEVINTHAL_MFPT_CHECKS = {0: 2.59e36, 1: 1.23e13, 2: 0.973, 3: 1.51e-6, 4: 1.77e-8}  # plan 8.3
LEVINTHAL_MFPT_LARGE_U = 5.19e-9  # seconds, large-U limit
LEVINTHAL_MFPT_U0_YEARS = 8e28  # the model's own U=0 figure, kept distinct from 1e27

# --- 8.4 Shannon / DNA density ---
SHANNON_MAX_BITS = 2  # bits per base, four letters at equal odds
SHANNON_GC41_BITS = 1.98  # bits per base at 41% G+C (share approximate)
DNA_CEILING_BITS_PER_G = 3.65e21  # 2 bits x N_A / 330 g/mol
DNA_CEILING_EB_PER_G = 455  # exabytes per gram, same ceiling
DNA_RECORD_PB_PER_G = 215  # petabytes per gram, lab record (Erlich & Zielinski 2017)
NUCLEOTIDE_MOLAR_MASS = 330  # g/mol per nucleotide, single-stranded DNA

# --- U.1 Drake ---
DRAKE_P_N_LT_1 = 0.52  # paper's printed value: P(N < 1) before the silent-sky update
DRAKE_ALONE_AFTER = (0.53, 0.996)  # chance we are alone after the silent-sky update
DRAKE_RANGES = {  # log-uniform sampling ranges (Sandberg, Drexler & Ord 2018)
    "R_star": (1, 100),  # per year
    "f_p": (0.1, 1),
    "n_e": (0.1, 1),
    "f_i": (1e-3, 1),
    "f_c": (0.01, 1),
    "L": (1e2, 1e10),  # years
}
DRAKE_FL_MEDIAN = 1.0  # abiogenesis rate per planet, log-normal median
DRAKE_FL_SPREAD_DEX = 50  # spread of the log-normal rate, orders of magnitude
