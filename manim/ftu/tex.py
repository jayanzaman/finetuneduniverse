"""Every TEX line from docs/manim-plan.md, once, keyed by scene.

test_tex.py parses the plan and asserts these strings equal it character for
character. Scenes use these entries, never inline equation strings (epic test
6b). Parts to morph are isolated in the scene with {{ }} or
substrings_to_isolate, not by editing these strings.
"""

TEX = {
    "1.1": [
        r"v = H_0\,d",
        r"1 + z = \frac{\lambda_{\mathrm{obs}}}{\lambda_{\mathrm{emit}}} = \frac{1}{a}",
    ],
    "1.2": [
        r"\rho_r \propto a^{-4} \qquad \rho_m \propto a^{-3} \qquad \rho_\Lambda = \mathrm{const}",
        r"\frac{\ddot a}{a} = -\frac{4\pi G}{3}\left(\rho_m - 2\rho_\Lambda\right)",
    ],
    "1.3": [
        r"\frac{H^2}{H_0^2} = \Omega_r a^{-4} + \Omega_m a^{-3} + \Omega_k a^{-2} + \Omega_\Lambda",
    ],
    "1.4": [
        r"\Omega - 1 = \frac{k}{a^2 H^2}",
    ],
    "1.5": [
        r"\rho_{\mathrm{vac}} = \int^{k_{\max}} \frac{d^3k}{(2\pi)^3}\,\frac{\hbar\,\omega_k}{2} \;\propto\; k_{\max}^4",
    ],
    "1.6": [
        r"S = k_B \ln W \qquad S_{\mathrm{BH}} = \frac{4\pi G M^2 k_B}{\hbar c}",
    ],
    "2.1": [
        r"\eta = \frac{n_b}{n_\gamma} \approx 6 \times 10^{-10}",
    ],
    "2.2": [
        r"\frac{n}{p} = e^{-\Delta m / kT} \qquad Y_p \approx \frac{2\,(n/p)}{1 + n/p}",
    ],
    "2.3": [
        r"X_D \sim \eta \left(\frac{kT}{m_p c^2}\right)^{3/2} e^{B_D / kT}",
    ],
    "3.1": [
        r"p + p \to d + e^+ + \nu_e \qquad Q = B_D - \Delta m - m_e = 0.42\ \mathrm{MeV}",
    ],
    "3.2": [
        r"4\,p \to {}^{4}\mathrm{He} + 2e^+ + 2\nu_e \qquad E = \Delta m\,c^2 = 26.7\ \mathrm{MeV}",
    ],
    "3.3": [
        r"3\,{}^{4}\mathrm{He} \to {}^{12}\mathrm{C}^{*} \to {}^{12}\mathrm{C} + \gamma",
        r"r_{3\alpha} \propto T^{-3} \exp\!\left(-\frac{\Delta_h}{kT}\right)",
    ],
    "3.4": [
        r"\frac{B}{A} = \frac{\left[Z m_p + (A - Z)\,m_n - M(A,Z)\right] c^2}{A}",
    ],
    "4.1": [
        r"M = \frac{4\pi^2 a^3}{G\,T^2} \qquad \frac{M}{M_\odot} = \frac{(a/\mathrm{AU})^3}{(T/\mathrm{yr})^2}",
    ],
    "5.1": [
        r"F = \frac{L}{4\pi d^2} \qquad T_{\mathrm{eq}} = \left[\frac{L\,(1 - A)}{16\pi\sigma d^2}\right]^{1/4}",
        r"d_{\mathrm{HZ}} = \sqrt{\frac{L/L_\odot}{S_{\mathrm{eff}}}}\ \mathrm{AU}",
    ],
    "6.1": [
        r"L_{\max} \approx \frac{\ln \sigma}{\mu}",
    ],
    "7.1": [
        r"N(t) = N_0\,e^{-\lambda t} \qquad t = \frac{1}{\lambda}\,\ln\!\left(1 + \frac{D}{P}\right)",
    ],
    "8.1": [
        r"4^1 = 4 \qquad 4^2 = 16 < 20 \qquad 4^3 = 64 \geq 20",
    ],
    "8.2": [
        r"20^{150} \approx 10^{195} \qquad N_{\mathrm{hits}} = N_{\mathrm{trials}} \times f",
    ],
    "8.3": [
        r"\tau \approx \frac{(1 + K)^N}{N k_0} \qquad K = \nu\,e^{-U/kT}",
    ],
    "8.4": [
        r"H = -\sum_i p_i \log_2 p_i",
        r"\frac{2\ \mathrm{bits} \times N_A}{330\ \mathrm{g/mol}} \approx 3.6 \times 10^{21}\ \mathrm{bits/g}",
    ],
    "U.1": [
        r"N = R_*\,f_p\,n_e\,f_l\,f_i\,f_c\,L \qquad \log N = \sum \log(\mathrm{factor})",
    ],
}
