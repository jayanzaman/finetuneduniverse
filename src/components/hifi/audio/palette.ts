/**
 * Chapter audio palettes (spec §7): pure data consumed by the engine.
 * P5 and the Wave-2 chapter issues register real palettes; until then
 * every chapter falls back to DEFAULT_PALETTE.
 */
export type ChapterPalette = {
  id: string;
  /** Sustained chord under the whole chapter. gain is the layer's steady level (0..1). */
  drone: { notes: string[]; gain: number };
  /** Optional short motif per component id (P5 wires playback on component-complete). */
  motifs?: Record<string, string[]>;
  /** Tension 0..1 maps the drone filter from brightHz down to darkHz and detunes up to detuneCents. */
  tension: { brightHz: number; darkHz: number; detuneCents: number };
  /** Notes of the chapter-complete cadence, played as a rising resolve. */
  cadence: string[];
};

export const DEFAULT_PALETTE: ChapterPalette = {
  id: 'default',
  drone: { notes: ['C2', 'G2', 'E3'], gain: 0.5 },
  tension: { brightHz: 1200, darkHz: 220, detuneCents: 30 },
  cadence: ['C4', 'G4', 'C5'],
};

const PALETTES: Record<string, ChapterPalette> = { default: DEFAULT_PALETTE };

export function registerPalette(palette: ChapterPalette): void {
  PALETTES[palette.id] = palette;
}

export function getPalette(id: string): ChapterPalette {
  return PALETTES[id] ?? DEFAULT_PALETTE;
}
