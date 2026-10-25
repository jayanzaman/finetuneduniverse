const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻',
};

export const toSuperscript = (n: number): string =>
  String(Math.trunc(n))
    .split('')
    .map((ch) => SUPERSCRIPTS[ch] ?? '')
    .join('');

export const log10OfPow = (base: number, exp: number): number => exp * Math.log10(base);

export const splitLog10 = (log: number): { mantissa: number; exponent: number } => {
  if (!Number.isFinite(log)) return { mantissa: 1, exponent: 0 };
  const exponent = Math.floor(log);
  const mantissa = Math.pow(10, log - exponent);
  if (mantissa >= 10) return { mantissa: mantissa / 10, exponent: exponent + 1 };
  if (mantissa < 1) return { mantissa: mantissa * 10, exponent: exponent - 1 };
  return { mantissa, exponent };
};

export const formatScientific = (log10Value: number): string => {
  const { mantissa, exponent } = splitLog10(log10Value);
  const rounded = Math.round(mantissa * 10) / 10;
  if (rounded >= 10) return `1.0 × 10${toSuperscript(exponent + 1)}`;
  return `${rounded.toFixed(1)} × 10${toSuperscript(exponent)}`;
};

export const sequenceSpaceLog10 = (length: number): number => log10OfPow(20, length);

export const bigRatioWords = (log10Diff: number): string => {
  if (!Number.isFinite(log10Diff)) return '×10⁰';
  return `×10${toSuperscript(Math.round(Math.abs(log10Diff)))}`;
};

const KNOWN_REFERENCES = [
  { log10: 18.5, label: 'grains of sand on Earth (a rough estimate)' },
  { log10: 62, label: 'Planck times since the Big Bang' },
  { log10: 80, label: 'atoms in the observable universe' },
];

export const compareToKnown = (log10Value: number): string[] =>
  KNOWN_REFERENCES.map(({ log10, label }) => {
    const diff = log10Value - log10;
    if (Math.abs(diff) < 0.5) return `about the same as the ${label}`;
    if (diff > 0) return `more than 10${toSuperscript(Math.round(diff))}× the ${label}`;
    return `fewer than 1 in 10${toSuperscript(Math.round(-diff))} of the ${label}`;
  });
