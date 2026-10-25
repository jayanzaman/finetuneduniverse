'use client';

import './palette';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { audioDirector } from '../audio/director';
import { CH08_PROSE, STEPS, type StatCopy } from './copy';
import { renderEmphasis } from './emphasis';
import { ScrollySteps, type ScrollyPanel } from './ScrollySteps';
import { SourcesDrawer } from './SourcesDrawer';
import { SceneHost } from './scenes/SceneHost';
import type { SceneId, SceneQuality } from './scenes/sceneUtils';
import { StorageComparator } from './interactives/StorageComparator';
import { DnaOdometer } from './interactives/DnaOdometer';
import { CodonWheel } from './interactives/CodonWheel';
import { ShuffleTheCode } from './interactives/ShuffleTheCode';
import { SequenceSpace } from './interactives/SequenceSpace';
import { SiblingRoller } from './interactives/SiblingRoller';

function StatBlock({ stat }: { stat: StatCopy }) {
  return (
    <div className="mt-8">
      <div className="hair-line" aria-hidden />
      <p className="mono-lg mt-4" style={{ color: 'var(--goldilocks)' }}>
        {stat.value}
      </p>
      <p className="prose-sm mt-2">{stat.label}</p>
      <p
        className="mono mt-2"
        style={{ color: 'var(--ink-faint)', textTransform: 'none', letterSpacing: '0.06em' }}
      >
        {stat.cite}
      </p>
    </div>
  );
}

function HonestyNote({ text }: { text: string }) {
  return (
    <p
      className="mono mt-6"
      style={{
        color: 'var(--ink-soft)',
        textTransform: 'none',
        letterSpacing: '0.04em',
        lineHeight: 1.7,
      }}
    >
      {renderEmphasis(text)}
    </p>
  );
}

type PanelContentProps = {
  kicker?: string;
  title: string;
  heading: 'h2' | 'h3';
  body: string[];
  stat?: StatCopy;
  honestyNote?: string;
  interactive?: ReactNode;
  trailing?: ReactNode;
};

function PanelContent({
  kicker,
  title,
  heading: Heading,
  body,
  stat,
  honestyNote,
  interactive,
  trailing,
}: PanelContentProps) {
  return (
    <div>
      {kicker && <p className="mono" style={{ color: 'var(--indigo)' }}>{kicker}</p>}
      <Heading className="ch08-step-title mt-4">{renderEmphasis(title)}</Heading>
      {body.map((paragraph, i) => (
        <p key={i} className="prose mt-5" style={{ maxWidth: 'none' }}>
          {renderEmphasis(paragraph)}
        </p>
      ))}
      {interactive && <div className="mt-8">{interactive}</div>}
      {stat && <StatBlock stat={stat} />}
      {honestyNote && <HonestyNote text={honestyNote} />}
      {trailing}
    </div>
  );
}

const INTERACTIVES: Record<string, ReactNode> = {
  hook: <StorageComparator />,
  'to-pluto': <DnaOdometer />,
  'sixty-four-words': <CodonWheel />,
  'probability-a': <ShuffleTheCode />,
  'probability-b': <SequenceSpace />,
  'probability-c': <SiblingRoller />,
};

const PANEL_SCENES: Array<SceneId | null> = [
  'server-to-cell',
  'nucleus-zoom',
  'pluto-unspool',
  'helix',
  'helix',
  'helix',
  'helix',
  'folding',
  null,
];

/**
 * Quiet closing visual for the open question — no WebGL. A single hairline
 * neuron, held still, echoing the scene-fallback idiom.
 */
function OpenQuestionVisual() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <svg
        viewBox="0 0 360 220"
        role="img"
        aria-label="A single neuron drawn in hairlines — the open question of whether thought itself runs on the four-letter code."
        style={{ display: 'block', width: '100%', maxWidth: 420, height: 'auto' }}
      >
        <circle cx={180} cy={105} r={26} fill="none" stroke="var(--indigo, #7A7BFF)" strokeWidth={1} opacity={0.8} />
        <circle cx={180} cy={105} r={7} fill="var(--indigo, #7A7BFF)" opacity={0.35} />
        {[40, 95, 150, 210, 265, 320].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 180 + Math.cos(rad) * 30;
          const y1 = 105 + Math.sin(rad) * 30;
          const x2 = 180 + Math.cos(rad) * 78;
          const y2 = 105 + Math.sin(rad) * 62;
          return (
            <line
              key={deg}
              x1={x1.toFixed(1)}
              y1={y1.toFixed(1)}
              x2={x2.toFixed(1)}
              y2={y2.toFixed(1)}
              stroke="var(--ink-faint, #4A4A60)"
              strokeWidth={1}
            />
          );
        })}
        <path
          d="M 206 105 C 250 105, 260 80, 320 82"
          fill="none"
          stroke="var(--ink-soft, #7B7B92)"
          strokeWidth={1}
        />
        <text x={180} y={196} textAnchor="middle" fontSize={11} fill="var(--ink-soft, #7B7B92)">
          an open question, held open
        </text>
      </svg>
    </div>
  );
}

function buildPanels(): ScrollyPanel[] {
  const panels: ScrollyPanel[] = [];
  for (const step of STEPS) {
    if (step.subPanels) {
      step.subPanels.forEach((sub, i) => {
        const panelId = `${step.id}-${sub.id}`;
        panels.push({
          id: panelId,
          content: (
            <PanelContent
              kicker={i === 0 ? step.kicker : undefined}
              title={sub.title}
              heading="h3"
              body={[...(i === 0 ? step.body : []), ...sub.body]}
              stat={sub.stat}
              honestyNote={sub.honestyNote}
              interactive={INTERACTIVES[panelId]}
            />
          ),
        });
      });
      continue;
    }
    panels.push({
      id: step.id,
      content: (
        <PanelContent
          kicker={step.kicker}
          title={step.title}
          heading="h2"
          body={step.body}
          stat={step.stat}
          honestyNote={step.honestyNote}
          interactive={INTERACTIVES[step.id]}
          trailing={
            step.id === 'open-question' ? (
              <div className="mt-10">
                <Link href="/questions/why-did-the-universe-begin-ordered" className="hifi-btn">
                  ↺ Back to the beginning
                </Link>
              </div>
            ) : undefined
          }
        />
      ),
    });
  }
  return panels;
}

export function CodeWithinChapter() {
  const [quality] = useState<SceneQuality>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'low' : 'high',
  );

  useEffect(() => {
    audioDirector.setChapter('ch08');
  }, []);

  const panels = buildPanels();

  return (
    <section aria-label="The Code Within — deeper lab" className="relative">
      <header className="mx-auto max-w-2xl px-5 pt-20 pb-10 md:px-10">
        <p className="mono" style={{ color: 'var(--indigo)' }}>
          Chapter 08 · Deeper lab
        </p>
        <p className="prose mt-6" style={{ maxWidth: 'none' }}>
          {renderEmphasis(CH08_PROSE)}
        </p>
      </header>
      <ScrollySteps
        panels={panels}
        renderVisual={(activeIndex, progress, active) => {
          const scene = PANEL_SCENES[activeIndex];
          if (!scene) return <OpenQuestionVisual />;
          return <SceneHost scene={scene} progress={progress} active={active} quality={quality} />;
        }}
      />
      <SourcesDrawer />
    </section>
  );
}
