import type { ReactNode } from 'react';

/**
 * Renders ch08 copy's `*…*` emphasis markers as <em> spans.
 * Splitting on '*' puts emphasized fragments at odd indices.
 */
export function renderEmphasis(text: string): ReactNode {
  const parts = text.split('*');
  if (parts.length === 1) return text;
  return parts.map((part, i) => (i % 2 === 1 ? <em key={i}>{part}</em> : part));
}
