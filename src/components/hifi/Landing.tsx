'use client';

import { useEffect, useState } from 'react';

import { SeedOrb } from './SeedOrb';
import { CHAPTERS } from './chapters';

type LandingProps = {
  onBegin: () => void;
  onSelectChapter?: (index: number) => void;
};

/**
 * The single cinematic hero. Pulls from Direction E's "almost didn't"
 * framing — destruction as the hook — with a SeedOrb stage-right and
 * the 7-chapter index across the bottom.
 */
export function Landing({ onBegin, onSelectChapter }: LandingProps) {
  const [orbSize, setOrbSize] = useState(620);
  useEffect(() => {
    const update = () =>
      setOrbSize(Math.min(760, Math.max(420, window.innerWidth * 0.5)));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <section
      className="hifi"
      style={{
        position: 'relative',
        minHeight: '100vh',
        padding: '160px 64px 96px',
        overflow: 'hidden',
      }}
      aria-labelledby="ftu-landing-title"
    >
      {/* The seed — center-right */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: '-12vw',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <SeedOrb size={orbSize} />
      </div>

      {/* Alt-universe ghost — upper-left */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 60,
          top: 220,
          zIndex: 2,
          opacity: 0.5,
        }}
      >
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 35% 35%, rgba(231,140,90,0.45) 0%, rgba(231,140,90,0.15) 40%, transparent 65%)',
            border: '1px dashed rgba(231,140,90,0.4)',
          }}
        />
      </div>

      {/* HERO TEXT */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          maxWidth: 820,
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
          <span className="mono" style={{ color: 'var(--indigo)' }}>An interactive cosmology</span>
          <span style={{ width: 32, height: 1, background: 'var(--hair-2)' }} />
          <span className="mono">Seven chapters · 13.8 billion years</span>
        </div>

        <h1 id="ftu-landing-title" className="h-mega">
          How the<br />
          universe<br />
          <em>almost</em><br />
          didn&apos;t happen.
        </h1>

        <p className="prose" style={{ marginTop: 36, maxWidth: 460, fontSize: 18 }}>
          Seven cosmic numbers had to land within a hair&apos;s breadth of where they did. Pull any
          one of them out of its narrow band, and the cosmos collapses, freezes, or stays
          forever still.
          <br />
          <br />
          Below: a scrollable descent through every one of them.
        </p>

        <div style={{ display: 'flex', gap: 16, marginTop: 44, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="hifi-btn primary" onClick={onBegin}>
            Begin chapter 01 <span style={{ fontFamily: 'serif' }}>↓</span>
          </button>
          <span className="hifi-btn" aria-hidden>
            23 min · interactive
          </span>
        </div>
      </div>

      {/* BOTTOM CHAPTER INDEX */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          marginTop: 96,
          paddingTop: 18,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 14,
          }}
        >
          <span className="mono" style={{ color: 'var(--ink-mid)' }}>The descent</span>
          <span className="mono" style={{ color: 'var(--ink-faint)' }}>13.8 BYR → now</span>
        </div>
        <div className="hair-line" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: 0,
            marginTop: 18,
          }}
        >
          {CHAPTERS.map((c, i) => (
            <button
              key={c.n}
              type="button"
              onClick={() => onSelectChapter?.(i)}
              style={{
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                paddingRight: 18,
                borderLeft: i === 0 ? 'none' : '1px solid var(--hair)',
                paddingLeft: i === 0 ? 0 : 18,
                cursor: 'pointer',
                color: 'inherit',
              }}
            >
              <div
                className="mono"
                style={{
                  color: i === 0 ? 'var(--indigo)' : 'var(--ink-faint)',
                  marginBottom: 8,
                }}
              >
                {c.n}
              </div>
              <div
                className="h-3"
                style={{
                  fontSize: 18,
                  color: i === 0 ? 'var(--ink)' : 'var(--ink-mid)',
                }}
              >
                {c.long}
              </div>
              <div
                className="mono"
                style={{
                  color: 'var(--ink-faint)',
                  marginTop: 6,
                  fontSize: 9.5,
                }}
              >
                {c.era}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Corner marks */}
      <span
        className="mono"
        style={{ position: 'absolute', right: 64, bottom: 24, color: 'var(--ink-faint)' }}
      >
        ↓ scroll to descend
      </span>
    </section>
  );
}
