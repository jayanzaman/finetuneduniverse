'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import dynamic from 'next/dynamic';

const labLoading = () => <div className="deep-lab-loading" role="status">Preparing the deeper lab…</div>;
const BeginningSection = dynamic(() => import('./sections/BeginningSection'), { loading: labLoading });
const MatterSection = dynamic(() => import('./sections/MatterSection'), { loading: labLoading });
const StarlightSection = dynamic(() => import('./sections/StarlightSection'), { loading: labLoading });
const GalacticHeartSection = dynamic(() => import('./sections/GalacticHeartSection'), { loading: labLoading });
const PlanetsSection = dynamic(() => import('./sections/PlanetsSection'), { loading: labLoading });
const AbiogenesisLabSection = dynamic(() => import('./sections/AbiogenesisLabSection'), { loading: labLoading });
const LifeSection = dynamic(() => import('./sections/LifeSection'), { loading: labLoading });

import { HifiBackdrop } from '../hifi/HifiBackdrop';
import { TopNav } from '../hifi/TopNav';
import { ChapterRail } from '../hifi/ChapterRail';
import { ChapterHUD } from '../hifi/ChapterHUD';
import { PrologueLanding } from '../hifi/prologue/PrologueLanding';
import { ChapterFrame } from '../hifi/ChapterFrame';
import { CHAPTER_CONTENT } from '../hifi/chapterContent';
import { ProgressionProvider, useProgression } from '../hifi/progression/ProgressionContext';
import { ChapterTransition } from '../hifi/transition/ChapterTransition';
import { HandoffOverlay } from '../hifi/transition/HandoffOverlay';
import {
  CHAPTER_MODELS,
  modelPosition,
  modelReadout,
  modelValue,
  modelVisualState,
} from '../hifi/chapterModels';
import { CHAPTERS, EVIDENCE_LABELS } from '../hifi/chapters';
import { trackJourney } from '../../lib/analytics';

type View = { kind: 'landing' } | { kind: 'chapter'; index: number };

function viewFromLocation(): View {
  if (typeof window === 'undefined') return { kind: 'landing' };
  const pathMatch = window.location.pathname.match(/^\/questions\/([^/]+)/);
  if (pathMatch) {
    const index = CHAPTERS.findIndex((chapter) => chapter.slug === pathMatch[1]);
    if (index >= 0) return { kind: 'chapter', index };
  }
  const match = window.location.hash.match(/^#\/chapter\/([^/?]+)/);
  if (!match) return { kind: 'landing' };
  const index = ['beginning', 'matter', 'stars', 'galaxy', 'planets', 'abiogenesis', 'geology'].indexOf(match[1]);
  return index >= 0 ? { kind: 'chapter', index } : { kind: 'landing' };
}

const SECTION_COMPONENTS = [
  BeginningSection,
  MatterSection,
  StarlightSection,
  GalacticHeartSection,
  PlanetsSection,
  AbiogenesisLabSection,
  LifeSection,
] as const;

export default function UniverseBuilderApp({ initialChapter }: { initialChapter?: number }) {
  const [view, setView] = useState<View>(
    initialChapter == null ? { kind: 'landing' } : { kind: 'chapter', index: initialChapter },
  );
  const [cosmicTime, setCosmicTime] = useState(0);
  const [handoff, setHandoff] = useState<{ from: number; to: number } | null>(null);
  const [chapterMenuOpen, setChapterMenuOpen] = useState(false);

  const commitView = useCallback((next: View, replace = false) => {
    const path = next.kind === 'landing' ? '/' : `/questions/${CHAPTERS[next.index].slug}`;
    if (replace) window.history.replaceState(null, '', path);
    else if (window.location.pathname !== path) window.history.pushState(null, '', path);
    setView(next);
  }, []);

  const goLanding = useCallback(() => {
    setChapterMenuOpen(false);
    commitView({ kind: 'landing' });
  }, [commitView]);
  const goChapter = useCallback(
    (index: number) => {
      setChapterMenuOpen(false);
      const nextIndex = Math.max(0, Math.min(6, index));
      const priorIndex = view.kind === 'chapter' ? view.index : -1;
      const method = priorIndex >= 0 && Math.abs(priorIndex - nextIndex) === 1 ? 'guided' : 'skip';
      trackJourney({ name: 'chapter_view', chapter: nextIndex, method });
      commitView({ kind: 'chapter', index: nextIndex });
    },
    [commitView, view]
  );

  const handleNext = useCallback(() => {
    if (view.kind === 'landing') goChapter(0);
    else if (view.index < SECTION_COMPONENTS.length - 1) goChapter(view.index + 1);
  }, [goChapter, view]);

  const handlePrev = useCallback(() => {
    if (view.kind === 'landing') return;
    if (view.index === 0) goLanding();
    else goChapter(view.index - 1);
  }, [goChapter, goLanding, view]);

  useEffect(() => {
    const syncLocation = () => {
      setChapterMenuOpen(false);
      setView(viewFromLocation());
    };
    if (window.location.hash.startsWith('#/chapter/')) commitView(viewFromLocation(), true);
    else syncLocation();
    window.addEventListener('popstate', syncLocation);
    return () => window.removeEventListener('popstate', syncLocation);
  }, [commitView]);

  // Cosmic time loop for the inner section visualizations
  useEffect(() => {
    const id = setInterval(() => setCosmicTime((p) => p + 0.1), 100);
    return () => clearInterval(id);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      // Don't steal arrow keys from sliders/inputs or while a focus modal is open
      if (target?.closest('[role="slider"], input, textarea, select, [contenteditable="true"]')) return;
      if (document.querySelector('.focus-modal, .handoff')) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNext, handlePrev]);

  // Reset scroll when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    trackMouse: false,
    preventScrollOnSwipe: true,
    delta: 50,
    swipeDuration: 500,
  });

  const activeChapter = view.kind === 'chapter' ? view.index : null;

  return (
    <ProgressionProvider>
      <div className="hifi" style={{ position: 'relative', minHeight: '100vh' }}>
        <HifiBackdrop seed={view.kind === 'chapter' ? (view.index + 1) * 13 : 3} />

        <TopNav
          onIndex={goLanding}
          onChapters={() => setChapterMenuOpen((open) => !open)}
          chaptersOpen={chapterMenuOpen}
          activeLabel={view.kind === 'landing' ? 'Index' : null}
        />
        {chapterMenuOpen && <ChapterRail active={activeChapter} onSelect={goChapter} />}
        {activeChapter !== null && (
          <ChapterHUD activeIndex={activeChapter} onPrev={handlePrev} onNext={handleNext} />
        )}

        <main id="main-content" {...swipeHandlers} style={{ position: 'relative', zIndex: 3 }}>
          <AnimatePresence mode="wait">
            {view.kind === 'landing' ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5 }}
              >
                <PrologueLanding onBegin={() => goChapter(0)} onSelectChapter={goChapter} />
              </motion.div>
            ) : (
              <motion.div
                key={`ch-${view.index}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5 }}
              >
                <ChapterView
                  index={view.index}
                  cosmicTime={cosmicTime}
                  onDescend={() => setHandoff({ from: view.index, to: Math.min(6, view.index + 1) })}
                  onPrev={handlePrev}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {handoff && (
          <HandoffOverlay
            fromIndex={handoff.from}
            toIndex={handoff.to}
            onArrive={() => goChapter(handoff.to)}
            onDone={() => setHandoff(null)}
          />
        )}
      </div>
    </ProgressionProvider>
  );
}

type ChapterViewProps = {
  index: number;
  cosmicTime: number;
  onDescend: () => void;
  onPrev: () => void;
};

function ChapterView({ index, cosmicTime, onDescend, onPrev }: ChapterViewProps) {
  const SectionComponent = SECTION_COMPONENTS[index];
  const content = CHAPTER_CONTENT[index];
  const model = CHAPTER_MODELS[index];
  const [primaryValue, setPrimaryValue] = useState(model.initial);

  useEffect(() => setPrimaryValue(model.initial), [model]);

  const { markLegacyVisit } = useProgression();
  useEffect(() => {
    markLegacyVisit(index);
  }, [index, markLegacyVisit]);

  return (
    <ChapterFrame
      num={content.num}
      chapterIndex={index}
      era={content.era}
      title={content.title}
      prose={content.prose}
      sliderProps={{
        ...content.sliderProps,
        value: modelReadout(model, primaryValue),
        unit: model.unit,
        position: modelPosition(model, primaryValue),
        interactive: true,
        ariaLabel: `${String(content.sliderProps.label)}. ${model.unit}`,
        onPositionChange: (position) => {
          trackJourney({ name: 'primary_experiment', chapter: index });
          setPrimaryValue(modelValue(model, position));
        },
      }}
      formula={model.formula}
      experimentOutcome={model.outcome(primaryValue)}
      question={CHAPTERS[index].question}
      currentAnswer={CHAPTERS[index].currentAnswer}
      openQuestion={CHAPTERS[index].openQuestion}
      evidenceLabel={EVIDENCE_LABELS[CHAPTERS[index].evidence]}
      visualState={modelVisualState(model, primaryValue)}
      ghost={content.ghost}
      onPrev={onPrev}
      visualization={content.visualization}
      transition={<ChapterTransition chapterIndex={index} onDescend={onDescend} />}
    >
      <SectionComponent educatorMode={false} cosmicTime={cosmicTime} />
    </ChapterFrame>
  );
}
