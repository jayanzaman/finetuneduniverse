import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { ExpansionViz } from './ExpansionViz';

afterEach(() => {
  cleanup();
});

describe('ExpansionViz', () => {
  it('renders default simulation in Goldilocks band (H0 = 0.70)', () => {
    render(<ExpansionViz value={0.7} />);

    expect(screen.getByLabelText(/3D Universe Expansion Simulation/i)).toBeTruthy();
    expect(screen.getByText(/STABLE EXPANSION · GOLDILOCKS BAND/i)).toBeTruthy();
    expect(screen.getByText(/Uniform Hubble Flow/i)).toBeTruthy();
    expect(screen.getByText(/0.70 H₀/i)).toBeTruthy();
    expect(screen.getByText(/100% Bound/i)).toBeTruthy();
    expect(screen.getByText(/0.7 H₀ Goldilocks/i)).toBeTruthy();
  });

  it('renders Big Crunch clumping state when moved to the left (H0 = 0.20)', () => {
    render(<ExpansionViz value={0.2} />);

    expect(screen.getByText(/GRAVITATIONAL CLUMPING · SLOW \/ BIG CRUNCH/i)).toBeTruthy();
    expect(screen.getByText(/Matter Clumping \(Gravity Overcomes Expansion\)/i)).toBeTruthy();
    expect(screen.getByText(/0.20 H₀/i)).toBeTruthy();
    expect(screen.getByText(/4 Gravitational Clumps/i)).toBeTruthy();
    expect(screen.getByText(/0.1 H₀ Big Crunch \(Clumping\)/i)).toBeTruthy();
  });

  it('renders Runaway tears apart state when moved to the right (H0 = 1.80)', () => {
    render(<ExpansionViz value={1.8} />);

    expect(screen.getByText(/RUNAWAY EXPANSION · TEARS APART/i)).toBeTruthy();
    expect(screen.getByText(/The Big Rip \(Matter Outpaces Space\)/i)).toBeTruthy();
    expect(screen.getByText(/1.80 H₀/i)).toBeTruthy();
    expect(screen.getByText(/2.0 H₀ Runaway \(Escapes Frame\)/i)).toBeTruthy();
  });

  it('supports toggling play/pause and replay controls', () => {
    render(<ExpansionViz value={0.7} />);

    const pauseBtn = screen.getByRole('button', { name: /pause simulation/i });
    expect(pauseBtn.textContent).toContain('Pause');

    fireEvent.click(pauseBtn);
    const playBtn = screen.getByRole('button', { name: /play simulation/i });
    expect(playBtn.textContent).toContain('Play');

    const replayBtn = screen.getByRole('button', { name: /replay cycle from origin/i });
    fireEvent.click(replayBtn);
  });
});
