# Analytics

Privacy-conscious, provider-agnostic journey analytics.

## Adapter

`src/lib/analytics.ts` exports `trackJourney(event)` and `configureAnalytics(sink)`.
The default sink is a no-op — nothing is collected until a sink is configured.

Typed events (no raw formula values, no identifiers):

- `chapter_view` (chapter, method: guided|skip|direct)
- `primary_experiment` (chapter) — slider interaction
- `deep_lab_toggle` (chapter, open)
- `chapter_complete` (chapter)
- `chapter_exit` (chapter)

## Local export + dashboard

`src/lib/analytics-export.ts` provides a local-only sink plus primitive
summaries:

- `createLocalAnalyticsSink()` — persists events to `localStorage` (capped at 500).
- `summarizeEvents(events)` — event-name → count for a simple dashboard.
- `exportAnalyticsJson()` / `clearBufferedEvents()`.

To enable localStorage capture, call
`configureAnalytics(createLocalAnalyticsSink())` at bootstrap (not currently
wired by default — opt-in).

## Note on "Play vs Insight mode"

The legacy Play/Insight (educator) toggle was removed in the hi-fi redesign
(`feature/finetuned-game`), so that sub-task of the original analytics issue is
obsolete; the equivalent signal (deeper-lab opens) is captured by
`deep_lab_toggle`.

## User-testing protocol

See `docs/testing-protocol.md` for the five-task comprehension protocol and
observation rubric that pairs with these events.