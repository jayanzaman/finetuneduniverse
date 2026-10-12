import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { FluctuationsViz } from './FluctuationsViz';

afterEach(() => {
  cleanup();
});

describe('FluctuationsViz (3D Cosmic Web & Spacetime Gravity Wells)', () => {
  it('renders default Goldilocks state (value = 0.2) with Cosmic Web filaments and epochs', () => {
    render(<FluctuationsViz value={0.2} />);

    expect(screen.getByLabelText(/3D Cosmic Web: Luminous Filaments & Star Nurseries/i)).toBeTruthy();
    expect(screen.getByText(/GOLDILOCKS RIPPLES · COSMIC WEB/i)).toBeTruthy();
    expect(screen.getByText(/Luminous Filaments & Star Nurseries/i)).toBeTruthy();
    expect(screen.getAllByText(/0.20 δρ\/ρ/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/10⁵ M☉ \(Optimal Stellar Clusters\)/i)).toBeTruthy();
    expect(screen.getByText(/100% \(Balanced Galaxies & Life\)/i)).toBeTruthy();

    // Check cosmic epoch bar
    expect(screen.getByText(/Modern Cosmic Web \(Today, z = 0\)/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Select epoch: Big Bang CMB/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Select epoch: Cosmic Dark Ages/i })).toBeTruthy();
  });

  it('renders Too Smooth state when fluctuations are negligible (value = 0.03)', () => {
    render(<FluctuationsViz value={0.03} />);

    expect(screen.getByText(/TOO SMOOTH · ZERO STRUCTURE/i)).toBeTruthy();
    expect(screen.getByText(/Inert Cold Gas \(Gravity Defeated\)/i)).toBeTruthy();
    expect(screen.getByText(/0.03 δρ\/ρ/i)).toBeTruthy();
    expect(screen.getByText(/Infinite \(No Collapse Possible\)/i)).toBeTruthy();
    expect(screen.getByText(/0% \(Eternal Darkness\)/i)).toBeTruthy();
  });

  it('renders Too Turbulent Black Hole Soup state when fluctuations are excessive (value = 0.75)', () => {
    render(<FluctuationsViz value={0.75} />);

    expect(screen.getByText(/TOO TURBULENT · BLACK HOLE SOUP/i)).toBeTruthy();
    expect(screen.getByText(/Runaway Collapse \(Direct Singularity\)/i)).toBeTruthy();
    expect(screen.getByText(/0.75 δρ\/ρ/i)).toBeTruthy();
    expect(screen.getByText(/Sub-Solar \(Hyper-Collapse\)/i)).toBeTruthy();
    expect(screen.getByText(/Sterilized by Quasars & Singularities/i)).toBeTruthy();
  });

  it('switches between Cosmic Web and Gravity Wells tabs', () => {
    render(<FluctuationsViz value={0.2} />);

    // Switch to Gravity Wells tab (Option C)
    const wellsTabBtn = screen.getByRole('button', { name: /Switch to Spacetime Gravity Wells view/i });
    expect(wellsTabBtn).toBeTruthy();
    fireEvent.click(wellsTabBtn);

    expect(screen.getByText(/SPACETIME TOPOGRAPHY: KEPLERIAN VALLEYS/i)).toBeTruthy();
    expect(screen.getByText(/Stable parabolic potential wells trap gas/i)).toBeTruthy();

    // Switch back to Cosmic Web tab (Option A)
    const webTabBtn = screen.getByRole('button', { name: /Switch to Cosmic Web matter view/i });
    expect(webTabBtn).toBeTruthy();
    fireEvent.click(webTabBtn);

    expect(screen.getByText(/GOLDILOCKS RIPPLES · COSMIC WEB/i)).toBeTruthy();
  });

  it('supports playback pause/play, epoch navigation, and reset', () => {
    render(<FluctuationsViz value={0.2} />);

    const pauseBtn = screen.getByRole('button', { name: /pause simulation/i });
    expect(pauseBtn.textContent).toContain('Pause');

    fireEvent.click(pauseBtn);
    const playBtn = screen.getByRole('button', { name: /play simulation/i });
    expect(playBtn.textContent).toContain('Play');

    // Test epoch navigation
    const prevEpochBtn = screen.getByRole('button', { name: /Previous cosmic epoch/i });
    fireEvent.click(prevEpochBtn);
    expect(screen.getByText(/Cosmic Dawn & Reionization/i)).toBeTruthy();

    const nextEpochBtn = screen.getByRole('button', { name: /Next cosmic epoch/i });
    fireEvent.click(nextEpochBtn);
    expect(screen.getByText(/Modern Cosmic Web/i)).toBeTruthy();

    // Test reset
    const resetBtn = screen.getByRole('button', { name: /Reset simulation/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText(/Big Bang CMB/i)).toBeTruthy();
  });
});
