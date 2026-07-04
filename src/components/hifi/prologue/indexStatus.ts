import type { ChapterProgress } from '../progression/store';

export type IndexStatusKind = 'unexplored' | 'progress' | 'frontier' | 'complete';

export type IndexStatus = { kind: IndexStatusKind; label: string };

export function indexStatus(progress: ChapterProgress, isFrontier: boolean): IndexStatus {
  if (progress.complete) return { kind: 'complete', label: '✓ complete' };
  if (progress.done > 0) {
    return { kind: 'progress', label: `${progress.done}/${progress.total} experienced` };
  }
  if (isFrontier) return { kind: 'frontier', label: 'continue here →' };
  return { kind: 'unexplored', label: 'unexplored' };
}
