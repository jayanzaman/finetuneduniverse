import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { TemperatureViz } from './TemperatureViz';

afterEach(() => {
  cleanup();
});

describe('TemperatureViz (The Planck All-Sky Mollweide & Thermalizer)', () => {
  it('renders default Planck sky state in Goldilocks band (value = 0.99999)', () => {
    render(<TemperatureViz value={0.99999} />);

    expect(
      screen.getByLabelText(/Cosmic Microwave Background All-Sky Temperature Simulation/i)
    ).toBeTruthy();
    expect(screen.getByText(/PLANCK SKY · ΔT = ±18 μK/i)).toBeTruthy();

    // Check mode buttons
    expect(screen.getByRole('button', { name: /Mollweide 2D/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /3D Globe/i })).toBeTruthy();

    // Check contrast lens buttons
    expect(screen.getByRole('button', { name: /Raw 2.7K/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Dipole \(3.36 mK\)/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Acoustic \(±18 μK\)/i })).toBeTruthy();

    // Check color scale legend
    expect(screen.getByText(/Cold \(−100 μK\)/i)).toBeTruthy();
    expect(screen.getByText(/Hot \(\+100 μK\)/i)).toBeTruthy();
  });

  it('switches between Mollweide 2D and 3D Globe modes', () => {
    render(<TemperatureViz value={0.99999} />);

    const globeBtn = screen.getByRole('button', { name: /3D Globe/i });
    fireEvent.click(globeBtn);

    // Orbit control should appear in 3D mode
    expect(screen.getByRole('button', { name: /Orbit:/i })).toBeTruthy();

    // Switch back to Mollweide
    const mollweideBtn = screen.getByRole('button', { name: /Mollweide 2D/i });
    fireEvent.click(mollweideBtn);
    expect(screen.getByText(/360° All-Sky/i)).toBeTruthy();
  });

  it('switches between contrast lenses (Raw, Dipole, Acoustic)', () => {
    render(<TemperatureViz value={0.99999} />);

    const dipoleBtn = screen.getByRole('button', { name: /Dipole \(3.36 mK\)/i });
    fireEvent.click(dipoleBtn);

    const rawBtn = screen.getByRole('button', { name: /Raw 2.7K/i });
    fireEvent.click(rawBtn);

    const acousticBtn = screen.getByRole('button', { name: /Acoustic \(±18 μK\)/i });
    fireEvent.click(acousticBtn);
  });

  it('reflects Mottled state when uniformity is below band (< 0.99998)', () => {
    render(<TemperatureViz value={0.92} />);

    expect(screen.getByText(/MOTTLED \(NO INFLATION\) · ΔT ~ ±1 K/i)).toBeTruthy();
  });

  it('reflects Total Isotropy when uniformity reaches 1.0', () => {
    render(<TemperatureViz value={1.0} />);

    expect(screen.getByText(/TOTAL ISOTROPY \(NO DENSITY SEEDS\)/i)).toBeTruthy();
  });
});
