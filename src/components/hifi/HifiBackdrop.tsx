'use client';

import { Starfield } from './Starfield';

type HifiBackdropProps = {
  seed?: number;
  density?: number;
};

/**
 * Fixed cosmic backdrop: indigo radial bloom on near-black, layered
 * star field, subtle grain. Sits behind every chapter.
 */
export function HifiBackdrop({ seed = 1, density = 1 }: HifiBackdropProps) {
  return (
    <>
      <div className="hifi-backdrop" aria-hidden />
      <Starfield seed={seed} density={density} />
      <div className="hifi-grain" aria-hidden />
    </>
  );
}
