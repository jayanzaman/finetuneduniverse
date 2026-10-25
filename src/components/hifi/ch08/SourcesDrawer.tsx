'use client';

import { useState } from 'react';
import { SOURCES } from './facts';

/**
 * Collapsible sources list for the chapter end. Mirrors the `.chapter-sources`
 * block used by ChapterFrame; disclosure follows the deep-dive toggle idiom
 * (button + aria-expanded).
 */
export function SourcesDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <div className="chapter-sources mx-auto mt-8 max-w-2xl px-5 pb-24 md:px-10">
      <button
        type="button"
        className="hifi-btn"
        aria-expanded={open}
        aria-controls="ch08-sources-list"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Hide sources' : 'Sources'}
      </button>
      {open && (
        <div id="ch08-sources-list" className="mt-6">
          <p className="prose-sm">Every number in this chapter comes from the sources below.</p>
          <ul>{SOURCES.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
