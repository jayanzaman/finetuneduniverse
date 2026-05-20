import { EntropyViz } from './EntropyViz';
import { ExpansionViz } from './ExpansionViz';
import { FluctuationsViz } from './FluctuationsViz';
import { ShapeViz } from './ShapeViz';
import { DarkEnergyViz } from './DarkEnergyViz';
import { TemperatureViz } from './TemperatureViz';
import type { ParamKey } from '../params';

export { EntropyViz, ExpansionViz, FluctuationsViz, ShapeViz, DarkEnergyViz, TemperatureViz };

export const VIZ_BY_KEY: Record<ParamKey, (props: { value?: number }) => React.ReactElement> = {
  entropy: EntropyViz,
  expansion: ExpansionViz,
  fluctuations: FluctuationsViz,
  shape: ShapeViz,
  darkEnergy: DarkEnergyViz,
  temperature: TemperatureViz,
};
