import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import LabsDirectoryPage, { metadata } from './page';
import { CHAPTERS } from '../../components/hifi/chapters';

afterEach(() => {
  cleanup();
});

describe('LabsDirectoryPage', () => {
  it('renders all laboratory cards with links to dedicated lab pages', () => {
    render(<LabsDirectoryPage />);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/The Eight Laboratories/i);

    const openLabLinks = screen.getAllByRole('link', { name: /open laboratory →/i });
    expect(openLabLinks).toHaveLength(CHAPTERS.length);

    openLabLinks.forEach((link, idx) => {
      expect(link.getAttribute('href')).toBe(`/questions/${CHAPTERS[idx].slug}/lab`);
    });
  });

  it('exports valid metadata', () => {
    expect(String(metadata.title)).toContain('Interactive Laboratories');
  });
});
