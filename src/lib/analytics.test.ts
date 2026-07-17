import { describe, expect, it, vi } from 'vitest';
import { configureAnalytics, trackJourney } from './analytics';

describe('journey analytics', () => {
  it('is a no-op until a provider is configured', () => {
    configureAnalytics(null);
    expect(() => trackJourney({ name: 'chapter_view', chapter: 0, method: 'direct' })).not.toThrow();
  });

  it('forwards typed, privacy-conscious events', () => {
    const sink = vi.fn();
    configureAnalytics(sink);
    trackJourney({ name: 'primary_experiment', chapter: 2 });
    expect(sink).toHaveBeenCalledWith({ name: 'primary_experiment', chapter: 2 });
    configureAnalytics(null);
  });
});
