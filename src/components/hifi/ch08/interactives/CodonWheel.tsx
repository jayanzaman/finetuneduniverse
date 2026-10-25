'use client';

import { useState } from 'react';
import { cue } from '../../audio/cues';
import { AMINO_ACIDS, NAME_TO_CODONS, lookupCodon, nameToProtein } from '../lib/codonTable';
import { citeLine, liveResult, useMarkInteracted, widgetCard } from './shared';

const BASES = ['A', 'T', 'G', 'C'] as const;

type CodonResult = { codon: string; letter: string; name: string };

function redundancyText(letter: string, name: string): string {
  const count = NAME_TO_CODONS[letter]?.length ?? 0;
  if (letter === '*') return `STOP — one of ${count} stop codons. End of the protein sentence.`;
  if (count === 1) return `${name} — its only codon.`;
  return `${name} — one of ${count} codons.`;
}

export function CodonWheel() {
  const markOnce = useMarkInteracted('ch08:codon');
  const [letters, setLetters] = useState<string[]>([]);
  const [result, setResult] = useState<CodonResult | null>(null);
  const [name, setName] = useState('');

  const tap = (base: string) => {
    markOnce();
    cue('codon');
    const next = [...letters, base];
    if (next.length === 3) {
      const codon = next.join('');
      const looked = lookupCodon(codon);
      if (looked) setResult({ codon, ...looked });
      setLetters([]);
    } else {
      setLetters(next);
    }
  };

  const mapped = nameToProtein(name);

  return (
    <section aria-label="Codon wheel" style={widgetCard}>
      <p className="mono" style={{ margin: 0 }}>
        Four letters, sixty-four words
      </p>
      <h3 style={{ margin: 0 }}>Spin the codon wheel</h3>

      <div
        role="group"
        aria-label={`Codon slots, ${letters.length} of 3 filled`}
        style={{ display: 'flex', gap: 8 }}
        aria-hidden={false}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              width: 52,
              height: 60,
              display: 'grid',
              placeItems: 'center',
              border: '1px solid var(--hair-2)',
              borderRadius: 8,
              fontFamily: 'var(--f-mono)',
              fontSize: 26,
              color: letters[i] ? 'var(--goldilocks)' : 'var(--ink-faint)',
              background: letters[i] ? 'rgba(111,228,177,0.08)' : 'transparent',
            }}
          >
            {letters[i] ?? '·'}
          </div>
        ))}
      </div>

      <div role="group" aria-label="Base keypad" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {BASES.map((b) => (
          <button
            key={b}
            type="button"
            className="hifi-btn"
            aria-label={`Add ${b}`}
            style={{ minWidth: 48, minHeight: 44 }}
            onClick={() => tap(b)}
          >
            {b}
          </button>
        ))}
        <button
          type="button"
          className="hifi-btn"
          aria-label="Remove last letter"
          disabled={letters.length === 0}
          onClick={() => setLetters((prev) => prev.slice(0, -1))}
        >
          ⌫
        </button>
      </div>

      <div role="status" aria-live="polite" style={liveResult}>
        {result ? (
          <p className="prose-sm" style={{ margin: 0 }}>
            <strong style={{ color: 'var(--goldilocks)' }}>{result.codon}</strong>
            {' → '}
            {result.letter === '*' ? (
              <strong>STOP</strong>
            ) : (
              <strong>
                {result.name} ({AMINO_ACIDS[result.letter].abbr3} · {result.letter})
              </strong>
            )}
            {' — '}
            {redundancyText(result.letter, result.name)}
          </p>
        ) : (
          <p className="prose-sm" style={{ margin: 0, color: 'var(--ink-soft)' }}>
            Tap three bases to read a codon.
          </p>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--hair)', paddingTop: 14, display: 'grid', gap: 10 }}>
        <label htmlFor="ch08-name-input" className="mono" style={{ display: 'block' }}>
          Type your name — watch it become a protein fragment
        </label>
        <input
          id="ch08-name-input"
          type="text"
          value={name}
          maxLength={24}
          onChange={(e) => {
            markOnce();
            setName(e.target.value);
          }}
          style={{
            background: 'transparent',
            border: '1px solid var(--hair-2)',
            borderRadius: 8,
            padding: '10px 12px',
            color: 'var(--ink)',
            fontFamily: 'var(--f-mono)',
            fontSize: 14,
            letterSpacing: '0.08em',
            maxWidth: 320,
          }}
        />
        {name && (
          <div aria-live="polite" className="prose-sm" style={{ display: 'grid', gap: 6 }}>
            {mapped.letter ? (
              <p style={{ margin: 0 }}>
                {mapped.letter
                  .split('')
                  .map((ch) => `${ch} – ${AMINO_ACIDS[ch].name}`)
                  .join(' · ')}
              </p>
            ) : (
              <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
                No standard amino acids in that yet.
              </p>
            )}
            {mapped.skipped.length > 0 && (
              <p className="mono" style={{ margin: 0, color: 'var(--warm)' }}>
                Skipped: {mapped.skipped.join(', ')} — no standard amino acid uses those letters
              </p>
            )}
            {mapped.note && (
              <p className="prose-sm" style={{ margin: 0, color: 'var(--ink-soft)' }}>
                {mapped.note}
              </p>
            )}
          </div>
        )}
      </div>

      <p style={citeLine}>64 codons · 61 sense · 20 amino acids · 3 stops — Alberts et al., Molecular Biology of the Cell (6th ed.)</p>
    </section>
  );
}
