import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { DarkEnergyViz } from './DarkEnergyViz';

afterEach(() => {
  cleanup();
});

describe('DarkEnergyViz (The Non-Dilution Cosmic Cube & Energy Budget)', () => {
  it('renders default Goldilocks state with 70% Dark Energy budget (value = 1.0)', () => {
    render(<DarkEnergyViz value={1.0} />);

    expect(screen.getByLabelText(/Dark Energy Non-Dilution Simulation/i)).toBeTruthy();
    expect(screen.getByText(/70% DARK ENERGY · GOLDILOCKS VACUUM BUDGET/i)).toBeTruthy();
    expect(screen.getByText(/The Non-Diluting Vacuum/i)).toBeTruthy();
    expect(screen.getByText(/1.00 Λ/i)).toBeTruthy();

    // Check density gauges
    expect(screen.getByText(/MATTER DENSITY \(ρ_m ∝ a⁻³\)/i)).toBeTruthy();
    expect(screen.getByText(/DARK ENERGY DENSITY \(ρ_Λ\)/i)).toBeTruthy();
    expect(screen.getByText(/Does NOT dilute/i)).toBeTruthy();

    // Check epoch presets
    expect(screen.getByRole('button', { name: /Early \(a=0.4\)/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Crossover \(a=0.77\)/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Today \(a=1.0\)/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Future \(a=1.8\)/i })).toBeTruthy();
  });

  it('switches between 3D Cosmic Cube and Dilution Curves tabs', () => {
    render(<DarkEnergyViz value={1.0} />);

    const curvesTabBtn = screen.getByRole('button', { name: /Dilution Curves/i });
    expect(curvesTabBtn).toBeTruthy();
    fireEvent.click(curvesTabBtn);

    // Legend should be present in Curves mode
    expect(screen.getByText(/Dark Energy \(Constant\)/i)).toBeTruthy();
    expect(screen.getByText(/Matter \(Dilutes a⁻³\)/i)).toBeTruthy();
    expect(screen.getByText(/Radiation \(a⁻⁴\)/i)).toBeTruthy();

    // Switch back to Cube mode
    const cubeTabBtn = screen.getByRole('button', { name: /Cosmic Volume/i });
    fireEvent.click(cubeTabBtn);
    expect(screen.getByText(/MATTER DENSITY \(ρ_m ∝ a⁻³\)/i)).toBeTruthy();
  });

  it('supports toggling play/pause and jumping to different epochs', () => {
    render(<DarkEnergyViz value={1.0} />);

    const pauseBtn = screen.getByRole('button', { name: /pause cosmic expansion/i });
    expect(pauseBtn.textContent).toContain('Pause');

    fireEvent.click(pauseBtn);
    const playBtn = screen.getByRole('button', { name: /play cosmic expansion/i });
    expect(playBtn.textContent).toContain('Play');

    // Click Crossover epoch preset
    const crossoverBtn = screen.getByRole('button', { name: /Crossover \(a=0.77\)/i });
    fireEvent.click(crossoverBtn);
    expect(screen.getAllByText(/0.77/i).length).toBeGreaterThanOrEqual(1);

    // Reset to Today
    const todayBtn = screen.getByRole('button', { name: /^Today$/i });
    fireEvent.click(todayBtn);
    expect(screen.getAllByText(/1.00/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders sub-critical badge when Lambda is low (value = 0.4)', () => {
    render(<DarkEnergyViz value={0.4} />);
    expect(screen.getByText(/SUB-CRITICAL Λ · MATTER REMAINS DOMINANT/i)).toBeTruthy();
    expect(screen.getByText(/Insufficient Vacuum Energy/i)).toBeTruthy();
  });

  it('renders super-critical badge when Lambda is high (value = 1.8)', () => {
    render(<DarkEnergyViz value={1.8} />);
    expect(screen.getByText(/SUPER-CRITICAL Λ · RUNAWAY VACUUM DOMINANCE/i)).toBeTruthy();
    expect(screen.getByText(/Premature Dark Energy Domination/i)).toBeTruthy();
  });

  it('renders only canvas without HUD or buttons when minimal is true', () => {
    const { container } = render(<DarkEnergyViz value={1.0} minimal />);

    expect(container.querySelector('canvas')).toBeTruthy();
    expect(screen.queryByText(/70% DARK ENERGY/i)).toBeNull();
    expect(screen.queryByText(/MATTER DENSITY/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /Cosmic Volume/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /pause cosmic expansion/i })).toBeNull();
  });
});
