'use client';

import { PrologueHero } from './PrologueHero';
import { ChapterIndex } from './ChapterIndex';

export type PrologueLandingProps = {
  onBegin: () => void;
  onSelectChapter: (index: number) => void;
};

export function PrologueLanding({ onBegin, onSelectChapter }: PrologueLandingProps) {
  return (
    <div className="prologue">
      <PrologueHero onBegin={onBegin} />
      <ChapterIndex onSelectChapter={onSelectChapter} />
    </div>
  );
}
