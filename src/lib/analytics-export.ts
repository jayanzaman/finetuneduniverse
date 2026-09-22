import type { JourneyEvent } from './analytics';

const STORAGE_KEY = 'ftu-analytics-v1';
const MAX_EVENTS = 500;

function read(): JourneyEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as JourneyEvent[]) : [];
  } catch {
    return [];
  }
}

function write(events: JourneyEvent[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    // private mode / quota exceeded — drop silently rather than throw
  }
}

/**
 * Local-only, privacy-safe analytics sink. Persists the already-typed journey
 * events (no formula values, no identifiers) to localStorage, capped to the
 * most recent MAX_EVENTS.
 */
export function createLocalAnalyticsSink() {
  return (event: JourneyEvent) => {
    const events = read();
    events.push(event);
    write(events);
  };
}

export function getBufferedEvents(): JourneyEvent[] {
  return read();
}

/** Simple dashboard aggregation: event name -> count. */
export function summarizeEvents(events: JourneyEvent[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();
  for (const event of events) {
    counts.set(event.name, (counts.get(event.name) ?? 0) + 1);
  }
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
}

export function exportAnalyticsJson(): string {
  return JSON.stringify(getBufferedEvents(), null, 2);
}

export function clearBufferedEvents(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}