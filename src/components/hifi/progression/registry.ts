import { CHAPTERS } from '../chapters';
import { PARAMS } from '../ch01/params';

export type ComponentDef = {
  /** Globally unique, stable id — persisted in localStorage. Format: `ch<NN>:<key>`. */
  id: string;
  name: string;
};

export type ChapterComponents = {
  chapterIndex: number;
  /** Legacy chapters (not yet rebuilt to the Instrument standard) complete on visit. */
  legacy: boolean;
  components: ComponentDef[];
};

/**
 * Only valid for legacy chapters (chapterIndex 1..6 today). When a chapter is
 * rebuilt, its `:legacy` id is retired and prior visit-completion is
 * intentionally not migrated — selectors ignore orphaned ids in saved state.
 */
export function legacyComponentId(chapterIndex: number): string {
  return `ch${CHAPTERS[chapterIndex].n}:legacy`;
}

const CH08_COMPONENTS: ComponentDef[] = [
  { id: 'ch08:storage', name: 'Genome Storage' },
  { id: 'ch08:odometer', name: 'Mutation Odometer' },
  { id: 'ch08:codon', name: 'Codon Table' },
  { id: 'ch08:shuffle', name: 'Gene Shuffle' },
  { id: 'ch08:sequence', name: 'Protein Sequencer' },
  { id: 'ch08:sibling', name: 'Sibling Genomes' },
];

export const CHAPTER_COMPONENTS: ChapterComponents[] = CHAPTERS.map((chapter, i) => {
  if (i === 0) {
    return {
      chapterIndex: 0,
      legacy: false,
      components: PARAMS.map((p) => ({ id: `ch01:${p.key}`, name: p.name })),
    };
  }
  if (i === 7) {
    return { chapterIndex: 7, legacy: false, components: CH08_COMPONENTS };
  }
  return {
    chapterIndex: i,
    legacy: true,
    components: [{ id: legacyComponentId(i), name: chapter.long }],
  };
});
