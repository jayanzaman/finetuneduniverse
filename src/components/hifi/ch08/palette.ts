import { registerPalette, type ChapterPalette } from '../audio/palette';

/**
 * Chapter 08 — The Code Within. Cellular and warm: a low indigo drone (D2)
 * with a warm fifth (A2) and a gentle rising cadence. Registered on import;
 * `registerPalette` simply overwrites by id, so a dev double-import is a
 * harmless no-op.
 */
export const CH08_PALETTE: ChapterPalette = {
  id: 'ch08',
  drone: { notes: ['D2', 'A2', 'E3'], gain: 0.45 },
  tension: { brightHz: 1000, darkHz: 180, detuneCents: 20 },
  cadence: ['D4', 'A4', 'D5'],
};

registerPalette(CH08_PALETTE);
