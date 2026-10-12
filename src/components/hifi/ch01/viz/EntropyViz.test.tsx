import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { EntropyViz } from './EntropyViz';

afterEach(() => {
  cleanup();
});

describe('EntropyViz (3D Cosmic Hourglass & Thermodynamic Battery)', () => {
  it('renders default Goldilocks state with 100% charged battery and 3 tiers (value = 1.0)', () => {
    render(<EntropyViz value={1.0} />);

    expect(screen.getByLabelText(/3D Cosmic Hourglass & Thermodynamic Battery/i)).toBeTruthy();
    expect(screen.getByText(/THERMODYNAMIC BATTERY · 100% CHARGED/i)).toBeTruthy();
    expect(screen.getByText(/Cosmic Arrow of Time \(ΔS > 0\)/i)).toBeTruthy();
    expect(screen.getByText(/1.00 S\/k/i)).toBeTruthy();
    expect(screen.getAllByText(/100% Charged/i).length).toBeGreaterThanOrEqual(1);

    // Check complexity tiers
    expect(screen.getByText(/Tier 1: Gravitational Reservoir/i)).toBeTruthy();
    expect(screen.getByText(/Tier 2: Stellar Fusion Engine/i)).toBeTruthy();
    expect(screen.getByText(/Tier 3: Biosphere & Chemistry/i)).toBeTruthy();
    expect(screen.getByText(/Sink: Black Hole Graveyard/i)).toBeTruthy();
  });

  it('renders Thermal Death state when initial entropy is high (value = 7.0)', () => {
    render(<EntropyViz value={7.0} />);

    expect(screen.getByText(/THERMAL DEATH · NO USABLE GRADIENTS/i)).toBeTruthy();
    expect(screen.getByText(/Depleted Battery \(Born at Maximum Entropy\)/i)).toBeTruthy();
    expect(screen.getByText(/7.00 S\/k/i)).toBeTruthy();
    expect(screen.getByText(/0 Years \(Thermal Equilibrium\)/i)).toBeTruthy();
  });

  it('renders Frozen Order state when entropy is over-constrained (value = 0.2)', () => {
    render(<EntropyViz value={0.2} />);

    expect(screen.getByText(/FROZEN ORDER · ZERO PERTURBATIONS/i)).toBeTruthy();
    expect(screen.getByText(/Over-Constrained Grid \(No Free Energy Flow\)/i)).toBeTruthy();
    expect(screen.getByText(/0.20 S\/k/i)).toBeTruthy();
    expect(screen.getByText(/Static \/ Inert/i)).toBeTruthy();
  });

  it('supports toggling play/pause and recharging the battery', () => {
    render(<EntropyViz value={1.0} />);

    const pauseBtn = screen.getByRole('button', { name: /pause simulation/i });
    expect(pauseBtn.textContent).toContain('Pause');

    fireEvent.click(pauseBtn);
    const playBtn = screen.getByRole('button', { name: /play simulation/i });
    expect(playBtn.textContent).toContain('Play');

    const rechargeBtn = screen.getByRole('button', { name: /recharge battery/i });
    fireEvent.click(rechargeBtn);
  });

  it('switches to The Impossible Odds tab and displays scale rungs and Penrose number', () => {
    render(<EntropyViz value={1.0} />);

    // Click the Option C tab switcher
    const oddsTabBtn = screen.getByRole('button', { name: /The Impossible Odds/i });
    expect(oddsTabBtn).toBeTruthy();
    fireEvent.click(oddsTabBtn);

    // Verify Penrose's Number default rung (Rung 5)
    expect(screen.getByText(/Penrose's Number: The Initial Pinpoint/i)).toBeTruthy();
    expect(screen.getByText(/1 in 10¹⁰¹²³/i)).toBeTruthy();
    expect(screen.getByText(/MATTER BUDGET DEFICIT/i)).toBeTruthy();
    expect(screen.getByText(/Zeros required:/i)).toBeTruthy();

    // Verify all 6 rungs are selectable in the bottom ladder
    const lotteryRungBtn = screen.getByRole('button', { name: /Human Luck: National Lottery/i });
    expect(lotteryRungBtn).toBeTruthy();
    fireEvent.click(lotteryRungBtn);

    // Verify lottery rung content
    expect(screen.getByText(/Human Luck: National Lottery/i)).toBeTruthy();
    expect(screen.getByText(/1 in 10,000,000/i)).toBeTruthy();
    expect(screen.getByText(/HUMAN SCALE/i)).toBeTruthy();

    // Click Cosmic Time rung (Rung 1)
    const timeRungBtn = screen.getByRole('button', { name: /Cosmic Time: A Single Second/i });
    fireEvent.click(timeRungBtn);
    expect(screen.getByText(/CHRONOLOGICAL SCALE/i)).toBeTruthy();
    expect(screen.getByText(/1 in 4.35 × 10¹⁷/i)).toBeTruthy();

    // Click Observable Cosmos rung (Rung 3)
    const protonRungBtn = screen.getByRole('button', { name: /The Observable Cosmos: Single Proton/i });
    fireEvent.click(protonRungBtn);
    expect(screen.getByText(/ALL MATTER IN UNIVERSE/i)).toBeTruthy();
    expect(screen.getByText(/1 in 10⁸⁰/i)).toBeTruthy();

    // Verify auto-tour toggle button
    const tourBtn = screen.getByRole('button', { name: /Start scale ladder auto-tour/i });
    expect(tourBtn).toBeTruthy();
    fireEvent.click(tourBtn);
    expect(screen.getByRole('button', { name: /Stop ladder tour/i })).toBeTruthy();

    // Switch back to Cosmic Battery tab
    const batteryTabBtn = screen.getByRole('button', { name: /Cosmic Battery/i });
    fireEvent.click(batteryTabBtn);
    expect(screen.getByText(/THERMODYNAMIC BATTERY · 100% CHARGED/i)).toBeTruthy();
  });
});
