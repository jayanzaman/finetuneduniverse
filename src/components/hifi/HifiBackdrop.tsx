'use client';

import { Starfield } from './Starfield';

type HifiBackdropProps = {
  seed?: number;
  density?: number;
  starColor?: string;
  starBrightness?: number;
};

/**
 * Fixed cosmic backdrop: indigo radial bloom on near-black, layered
 * star field, subtle grain. Sits behind every chapter.
 */
export function HifiBackdrop({ seed = 1, density = 1, starColor, starBrightness }: HifiBackdropProps) {
  return (
    <>
      <div className="hifi-backdrop" aria-hidden />
      <Starfield seed={seed} density={density} color={starColor} brightness={starBrightness} />
      <div className="hifi-grain" aria-hidden />
    </>
  );
}
