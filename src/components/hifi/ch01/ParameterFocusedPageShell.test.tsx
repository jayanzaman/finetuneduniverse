import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { ParameterFocusedPageShell } from './ParameterFocusedPageShell';
import { PARAMS } from './params';
import { generateMetadata, generateStaticParams } from '../../../app/questions/[slug]/lab/[param]/page';

afterEach(() => {
  cleanup();
});

describe('ParameterFocusedPageShell', () => {
  it('renders Parameter 01 · Focused view Initial Entropy with math, viz, and lessons', () => {
    const param01 = PARAMS[0]; // entropy
    render(<ParameterFocusedPageShell param={param01} />);

    expect(screen.getByText('Parameter 01 · Focused view')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Initial Entropy');
    expect(screen.getByText(/How organized was the universe at the beginning/i)).toBeTruthy();

    // Penrose math block
    expect(screen.getByText(/Penrose · probability of our low-entropy start/i)).toBeTruthy();

    // Educational cards
    expect(screen.getByText(/Penrose's number/i)).toBeTruthy();
    expect(screen.getByText(/What you see/i)).toBeTruthy();
    expect(screen.getByText(/Why it matters/i)).toBeTruthy();

    // Breadcrumb and footer link
    expect(screen.getAllByRole('link', { name: /beginning lab/i }).length).toBeGreaterThanOrEqual(1);
    const nextLink = screen.getByRole('link', { name: /parameter 02: expansion rate →/i });
    expect(nextLink.getAttribute('href')).toBe('/questions/why-did-the-universe-begin-ordered/lab/expansion');
  });

  it('renders Parameter 02 · Focused view Expansion Rate with 3D simulation and lessons', () => {
    const param02 = PARAMS[1]; // expansion
    render(<ParameterFocusedPageShell param={param02} />);

    expect(screen.getByText('Parameter 02 · Focused view')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Expansion Rate');
    expect(screen.getByText(/How fast does space stretch — Hubble constant H₀/i)).toBeTruthy();

    // Hubble law math block
    expect(screen.getByText(/Hubble's law · recession velocity = H₀ × distance/i)).toBeTruthy();

    // Navigation links
    const prevLink = screen.getByRole('link', { name: /← parameter 01: initial entropy/i });
    expect(prevLink.getAttribute('href')).toBe('/questions/why-did-the-universe-begin-ordered/lab/entropy');

    const nextLink = screen.getByRole('link', { name: /parameter 03: density fluctuations →/i });
    expect(nextLink.getAttribute('href')).toBe('/questions/why-did-the-universe-begin-ordered/lab/fluctuations');
  });

  it('renders Parameter 05 · Focused view Dark Energy Λ with lessons, math blocks, and navigation', () => {
    const param05 = PARAMS[4]; // darkEnergy
    render(<ParameterFocusedPageShell param={param05} />);

    expect(screen.getByText('Parameter 05 · Focused view')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Dark Energy Λ');
    expect(
      screen.getByText(/How does the non-diluting energy of empty space come to dominate 70% of the universe/i)
    ).toBeTruthy();

    // Math blocks
    expect(screen.getByText(/The Non-Dilution Law · matter thins as 1\/Volume/i)).toBeTruthy();
    expect(screen.getByText(/Today's cosmic energy budget/i)).toBeTruthy();

    // Educational cards
    expect(screen.getByText(/What You See in the 3D Cosmic Cube/i)).toBeTruthy();
    expect(screen.getByText(/The Dilution Curves Tab · ρ\(a\) & The Crossover Point/i)).toBeTruthy();
    expect(screen.getByText(/The 70% Energy Budget Gauge/i)).toBeTruthy();
    expect(screen.getByText(/How the Slider Alters Cosmic Fate/i)).toBeTruthy();
    expect(screen.getByText(/The Cosmological Constant Problem/i)).toBeTruthy();

    // Previous parameter link to Parameter 04
    const prevLink = screen.getByRole('link', { name: /← parameter 04: universe shape/i });
    expect(prevLink.getAttribute('href')).toBe('/questions/why-did-the-universe-begin-ordered/lab/shape');

    // Next parameter link to Parameter 06
    const nextLink = screen.getByRole('link', { name: /parameter 06: cmb uniformity →/i });
    expect(nextLink.getAttribute('href')).toBe('/questions/why-did-the-universe-begin-ordered/lab/cmb-uniformity');
  });
});

describe('/questions/[slug]/lab/[param] route helpers', () => {
  it('generateStaticParams includes entropy, dark-energy, 01, and 05', () => {
    const params = generateStaticParams();
    const slugs = params.map((p) => p.param);

    expect(slugs).toContain('entropy');
    expect(slugs).toContain('dark-energy');
    expect(slugs).toContain('01');
    expect(slugs).toContain('05');
  });

  it('generateMetadata returns canonical title for Initial Entropy and Dark Energy', async () => {
    const meta01 = await generateMetadata({
      params: Promise.resolve({
        slug: 'why-did-the-universe-begin-ordered',
        param: 'entropy',
      }),
    });
    expect(meta01.title).toBe('Parameter 01 · Focused view: Initial Entropy | Finetuned Universe');

    const meta05 = await generateMetadata({
      params: Promise.resolve({
        slug: 'why-did-the-universe-begin-ordered',
        param: 'dark-energy',
      }),
    });
    expect(meta05.title).toBe('Parameter 05 · Focused view: Dark Energy Λ | Finetuned Universe');
  });
});
