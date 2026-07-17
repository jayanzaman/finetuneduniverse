export type JourneyEvent =
  | { name: 'chapter_view'; chapter: number; method: 'guided' | 'skip' | 'direct' }
  | { name: 'primary_experiment'; chapter: number }
  | { name: 'deep_lab_toggle'; chapter: number; open: boolean }
  | { name: 'chapter_complete'; chapter: number };

export type AnalyticsSink = (event: JourneyEvent) => void;

let sink: AnalyticsSink | null = null;

export function configureAnalytics(next: AnalyticsSink | null) {
  sink = next;
}

/** Provider-independent and privacy-conscious: no raw formula values or identifiers. */
export function trackJourney(event: JourneyEvent) {
  sink?.(event);
}
