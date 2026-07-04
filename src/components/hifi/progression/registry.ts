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

export function legacyComponentId(chapterIndex: number): string {
  return `ch${CHAPTERS[chapterIndex].n}:legacy`;
}

export const CHAPTER_COMPONENTS: ChapterComponents[] = CHAPTERS.map((chapter, i) =>
  i === 0
    ? {
        chapterIndex: 0,
        legacy: false,
        components: PARAMS.map((p) => ({ id: `ch01:${p.key}`, name: p.name })),
      }
    : {
        chapterIndex: i,
        legacy: true,
        components: [{ id: legacyComponentId(i), name: chapter.long }],
      }
);
