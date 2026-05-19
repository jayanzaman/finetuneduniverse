'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';

import BeginningSection from './sections/BeginningSection';
import MatterSection from './sections/MatterSection';
import StarlightSection from './sections/StarlightSection';
import GalacticHeartSection from './sections/GalacticHeartSection';
import PlanetsSection from './sections/PlanetsSection';
import AbiogenesisLabSection from './sections/AbiogenesisLabSection';
import LifeSection from './sections/LifeSection';

import { HifiBackdrop } from '../hifi/HifiBackdrop';
import { TopNav } from '../hifi/TopNav';
import { ChapterRail } from '../hifi/ChapterRail';
import { Landing } from '../hifi/Landing';
import { ChapterFrame } from '../hifi/ChapterFrame';
import { CHAPTER_CONTENT } from '../hifi/chapterContent';

type View = { kind: 'landing' } | { kind: 'chapter'; index: number };

const SECTION_COMPONENTS = [
  BeginningSection,
  MatterSection,
  StarlightSection,
  GalacticHeartSection,
  PlanetsSection,
  AbiogenesisLabSection,
  LifeSection,
] as const;

export default function UniverseBuilderApp() {
  const [view, setView] = useState<View>({ kind: 'landing' });
  const [cosmicTime, setCosmicTime] = useState(0);

  const goLanding = useCallback(() => setView({ kind: 'landing' }), []);
  const goChapter = useCallback(
    (index: number) => setView({ kind: 'chapter', index: Math.max(0, Math.min(6, index)) }),
    []
  );

  const handleNext = useCallback(() => {
    setView((v) => {
      if (v.kind === 'landing') return { kind: 'chapter', index: 0 };
      return v.index < SECTION_COMPONENTS.length - 1
        ? { kind: 'chapter', index: v.index + 1 }
        : v;
    });
  }, []);

  const handlePrev = useCallback(() => {
    setView((v) => {
      if (v.kind === 'landing') return v;
      if (v.index === 0) return { kind: 'landing' };
      return { kind: 'chapter', index: v.index - 1 };
    });
  }, []);

  // Cosmic time loop for the inner section visualizations
  useEffect(() => {
    const id = setInterval(() => setCosmicTime((p) => p + 0.1), 100);
    return () => clearInterval(id);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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
    <div className="hifi" style={{ position: 'relative', minHeight: '100vh' }}>
      <HifiBackdrop seed={view.kind === 'chapter' ? (view.index + 1) * 13 : 3} />

      <TopNav onIndex={goLanding} activeLabel={view.kind === 'landing' ? 'Index' : null} />
      <ChapterRail active={activeChapter} onSelect={goChapter} />

      <main {...swipeHandlers} style={{ position: 'relative', zIndex: 3 }}>
        <AnimatePresence mode="wait">
          {view.kind === 'landing' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}
            >
              <Landing onBegin={() => goChapter(0)} onSelectChapter={goChapter} />
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
                onNext={view.index < SECTION_COMPONENTS.length - 1 ? handleNext : undefined}
                onPrev={handlePrev}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

type ChapterViewProps = {
  index: number;
  cosmicTime: number;
  onNext?: () => void;
  onPrev: () => void;
};

function ChapterView({ index, cosmicTime, onNext, onPrev }: ChapterViewProps) {
  const SectionComponent = SECTION_COMPONENTS[index];
  const content = CHAPTER_CONTENT[index];

  return (
    <ChapterFrame
      num={content.num}
      chapterIndex={index}
      era={content.era}
      title={content.title}
      prose={content.prose}
      sliderProps={content.sliderProps}
      ghost={content.ghost}
      nextTitle={content.nextTitle}
      nextLabel={content.nextLabel}
      onNext={onNext}
      onPrev={onPrev}
      visualization={content.visualization}
    >
      <div className="hifi-section-embed">
        <SectionComponent educatorMode={false} cosmicTime={cosmicTime} />
      </div>
    </ChapterFrame>
  );
}
