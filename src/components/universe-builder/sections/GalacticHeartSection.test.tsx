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
});