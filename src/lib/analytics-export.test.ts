import { afterEach, describe, expect, it } from 'vitest';
import {
  clearBufferedEvents,
  createLocalAnalyticsSink,
  exportAnalyticsJson,
  getBufferedEvents,
  summarizeEvents,
} from './analytics-export';

afterEach(() => {
  window.localStorage.clear();
});

describe('local analytics export', () => {
  it('buffers typed events and exports them as JSON', () => {
    const sink = createLocalAnalyticsSink();
    sink({ name: 'chapter_view', chapter: 0, method: 'direct' });
    sink({ name: 'primary_experiment', chapter: 0 });

    expect(getBufferedEvents()).toHaveLength(2);
    const parsed = JSON.parse(exportAnalyticsJson());
    expect(parsed).toHaveLength(2);
    expect(parsed[0].name).toBe('chapter_view');
    expect(parsed[1]).toEqual({ name: 'primary_experiment', chapter: 0 });
  });

  it('summarizes event counts for a simple dashboard', () => {
    const sink = createLocalAnalyticsSink();
    sink({ name: 'chapter_view', chapter: 0, method: 'guided' });
    sink({ name: 'chapter_view', chapter: 1, method: 'skip' });
    sink({ name: 'chapter_complete', chapter: 0 });

    const summary = summarizeEvents(getBufferedEvents());
    expect(summary).toContainEqual({ name: 'chapter_view', count: 2 });
    expect(summary).toContainEqual({ name: 'chapter_complete', count: 1 });
  });

  it('clears buffered events', () => {
    const sink = createLocalAnalyticsSink();
    sink({ name: 'chapter_exit', chapter: 0 });
    expect(getBufferedEvents()).toHaveLength(1);
    clearBufferedEvents();
    expect(getBufferedEvents()).toHaveLength(0);
  });
});