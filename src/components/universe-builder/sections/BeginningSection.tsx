'use client';

import { Instrument } from '../../hifi/ch01/Instrument';

export default function BeginningSection({
  cosmicTime = 0,
}: {
  educatorMode?: boolean;
  cosmicTime?: number;
}) {
  void cosmicTime;
  return <Instrument />;
}
