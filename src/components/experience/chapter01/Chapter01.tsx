'use client';

import { ExperienceCanvas } from '../ExperienceCanvas';
import { Cosmos } from './Cosmos';

// Chapter 01 · The Beginning.
// Step A: a static, breathing field of matter and light. No interaction yet —
// this only establishes the visual language the dial will later play.
export function Chapter01() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background:
          'radial-gradient(120% 90% at 50% 38%, var(--void-3) 0%, var(--void-2) 38%, var(--void) 78%)',
      }}
    >
      <ExperienceCanvas>
        <Cosmos />
      </ExperienceCanvas>

      {/* Vignette for depth — pulls the eye to the luminous core. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(115% 85% at 50% 45%, transparent 55%, rgba(3,3,8,0.55) 100%)',
        }}
      />

      {/* Faint chapter frame — sets the tone without UI chrome. */}
      <div
        style={{
          position: 'absolute',
          left: 32,
          bottom: 28,
          pointerEvents: 'none',
          fontFamily: 'var(--f-mono)',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          fontSize: 11,
          color: 'var(--ink-soft)',
        }}
      >
        <div style={{ color: 'var(--ink-faint)' }}>Chapter 01</div>
        <div style={{ marginTop: 6, color: 'var(--ink-mid)', letterSpacing: '0.16em' }}>
          The Beginning
        </div>
      </div>
    </div>
  );
}
