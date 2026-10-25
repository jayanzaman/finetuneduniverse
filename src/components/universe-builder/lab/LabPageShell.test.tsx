import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { LabPageShell } from './LabPageShell';
import { CHAPTERS } from '../../hifi/chapters';
import { generateMetadata, generateStaticParams } from '../../../app/questions/[slug]/lab/page';

afterEach(() => {
  cleanup();
});

vi.mock('../sections/BeginningSection', () => ({
  default: ({ educatorMode }: { educatorMode?: boolean }) => (
    <div data-testid="mock-beginning-lab">Beginning Lab Content (Educator: {String(educatorMode)})</div>
  ),
}));

vi.mock('../sections/LifeSection', () => ({
  default: ({ educatorMode }: { educatorMode?: boolean }) => (
    <div data-testid="mock-life-lab">Life Lab Content (Educator: {String(educatorMode)})</div>
  ),
}));

vi.mock('../sections/CodeWithinSection', () => ({
  default: ({ educatorMode }: { educatorMode?: boolean }) => (
    <div data-testid="mock-code-lab">Code Lab Content (Educator: {String(educatorMode)})</div>
  ),
}));

describe('LabPageShell', () => {
  it('renders header, metadata, and controls for Chapter 01', async () => {
    render(<LabPageShell chapterIndex={0} />);

    // Breadcrumb and headings
    expect(screen.getByRole('link', { name: /back to chapter 01/i })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('The Beginning');
    expect(screen.getByText(CHAPTERS[0].question)).toBeTruthy();

    // Action buttons
    const restoreBtn = screen.getByRole('button', { name: /restore reference values/i });
    expect(restoreBtn).toBeTruthy();

    const educatorBtn = screen.getByRole('button', { name: /educator notes: off/i });
    expect(educatorBtn).toBeTruthy();

    // Toggle educator mode
    fireEvent.click(educatorBtn);
    expect(screen.getByRole('button', { name: /educator notes: on/i })).toBeTruthy();

    // Footer link to next lab
    const nextLabLink = screen.getByRole('link', { name: /next lab: ch 02/i });
    expect(nextLabLink.getAttribute('href')).toBe(`/questions/${CHAPTERS[1].slug}/lab`);
  });

  it('renders navigation links for the last chapter', () => {
    const lastIndex = CHAPTERS.length - 1;
    render(<LabPageShell chapterIndex={lastIndex} />);

    expect(screen.getByRole('link', { name: /back to chapter 08/i })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('The Code Within');

    // Has previous lab link, no next lab link
    const prevLabLink = screen.getByRole('link', { name: /previous lab: ch 07/i });
    expect(prevLabLink.getAttribute('href')).toBe(`/questions/${CHAPTERS[lastIndex - 1].slug}/lab`);
    expect(screen.queryByRole('link', { name: /next lab/i })).toBeNull();
  });
});

describe('/questions/[slug]/lab route functions', () => {
  it('generateStaticParams returns all chapter slugs', () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(CHAPTERS.length);
    expect(params[0].slug).toBe('why-did-the-universe-begin-ordered');
    expect(params[CHAPTERS.length - 1].slug).toBe('how-do-four-letters-write-a-person');
  });

  it('generateMetadata returns canonical title and description', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'why-did-complex-life-take-so-long' }),
    });

    expect(meta.title).toContain('Geology Laboratory');
    expect(meta.alternates?.canonical).toBe('/questions/why-did-complex-life-take-so-long/lab');
  });
});
