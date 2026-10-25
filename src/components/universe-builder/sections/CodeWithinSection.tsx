'use client';

import { CodeWithinChapter } from '../../hifi/ch08/CodeWithinChapter';

/**
 * Chapter 08 (The Code Within) deeper lab. The full interactive module lives
 * under src/components/hifi/ch08. ChapterFrame already wraps section children
 * in `.hifi-section-embed`; educator mode follows the same accept-and-ignore
 * idiom as the other deeper-lab sections.
 */
export default function CodeWithinSection({
  educatorMode = false,
  cosmicTime = 0,
}: {
  educatorMode?: boolean;
  cosmicTime?: number;
}) {
  void educatorMode;
  void cosmicTime;
  return <CodeWithinChapter />;
}
