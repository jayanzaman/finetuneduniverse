'use client';

import { Instrument } from '../../hifi/ch01/Instrument';

export default function BeginningSection({
  educatorMode,
  cosmicTime = 0,
}: {
  educatorMode: boolean;
  cosmicTime?: number;
}) {
  void cosmicTime;
  return <Instrument educatorMode={educatorMode} />;
}
