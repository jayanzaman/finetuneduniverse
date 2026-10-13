import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import GalacticHeartSection from './GalacticHeartSection';

afterEach(() => {
  cleanup();
});

describe('GalacticHeartSection', () => {
  it('starts at the Pre-Galactic Era and shows a live phase summary', () => {
    render(<GalacticHeartSection educatorMode={false} />);
    expect(screen.getByRole('heading', { name: /milky way evolution/i })).toBeTruthy();
    expect(screen.getByText('Current phase')).toBeTruthy();
    expect(screen.getByText('Pre-Galactic Era')).toBeTruthy();
  });

  it('advances and rewinds through phases with the arrow controls', () => {
    render(<GalacticHeartSection educatorMode={false} />);
    expect(screen.getByText('Pre-Galactic Era')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /next galaxy phase/i }));
    expect(screen.getByText('Proto-Galaxy Formation')).toBeTruthy();
    expect(screen.queryByText('Pre-Galactic Era')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /previous galaxy phase/i }));
    expect(screen.getByText('Pre-Galactic Era')).toBeTruthy();
  });

  it('jumps to a phase via its indicator and updates the summary', () => {
    render(<GalacticHeartSection educatorMode={false} />);
    fireEvent.click(screen.getByRole('button', { name: /go to phase: modern milky way/i }));
    expect(screen.getByText('Modern Milky Way')).toBeTruthy();
  });

  it('allows switching between instruments and toggling 3-column triptych view', () => {
    render(<GalacticHeartSection educatorMode={true} />);

    // Initially on Instrument A
    expect(screen.getByText(/instrument a · milky way morphogenesis/i)).toBeTruthy();

    // Switch to Instrument B: Sgr A* Black Hole Feedback
    const bBtn = screen.getByRole('button', { name: /black hole feedback/i });
    fireEvent.click(bBtn);
    expect(screen.getByText(/instrument b · sagittarius a\* agn feedback/i)).toBeTruthy();

    // Switch to Instrument C: Galactic Habitable Zone
    const cBtn = screen.getByRole('button', { name: /galactic habitable zone/i });
    fireEvent.click(cBtn);
    expect(screen.getByText(/instrument c · galactic habitable zone/i)).toBeTruthy();

    // Toggle 3-Column Triptych View
    const triptychBtn = screen.getByRole('button', { name: /3-column triptych/i });
    fireEvent.click(triptychBtn);

    // In triptych mode, all three instruments are displayed
    expect(screen.getByText(/instrument a · milky way morphogenesis/i)).toBeTruthy();
    expect(screen.getByText(/instrument b · sagittarius a\* agn feedback/i)).toBeTruthy();
    expect(screen.getByText(/instrument c · galactic habitable zone/i)).toBeTruthy();
  });

  it('responds to global randomizeUniverse event', () => {
    render(<GalacticHeartSection educatorMode={false} />);
    window.dispatchEvent(new CustomEvent('randomizeUniverse'));
    expect(screen.getByRole('heading', { name: /milky way evolution/i })).toBeTruthy();
  });
});