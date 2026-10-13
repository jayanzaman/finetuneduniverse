import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import MatterSection from './MatterSection';

afterEach(() => {
  cleanup();
});

describe('MatterSection', () => {
  it('renders four parameter sliders and a live outcome summary', () => {
    render(<MatterSection educatorMode={false} />);
    expect(screen.getByText('Outcome')).toBeTruthy();
    expect(screen.getAllByRole('slider').length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText('✅ Quark binding (αs)')).toBeTruthy();
  });

  it('updates the strong-force readout when the slider moves', () => {
    render(<MatterSection educatorMode={false} />);
    const strongForceSlider = screen.getAllByRole('slider')[0];

    // Initial value is 1.000 → stable.
    expect(screen.getByText('1.000')).toBeTruthy();
    expect(screen.getByText('✅ Stable Matter')).toBeTruthy();

    // End jumps to the max (1.2) → out of band.
    fireEvent.keyDown(strongForceSlider, { key: 'End' });
    expect(screen.getByText('1.200')).toBeTruthy();
    expect(screen.getByText('❌ Unstable')).toBeTruthy();

    // Home jumps to the min (0.8) → out of band on the low side.
    fireEvent.keyDown(strongForceSlider, { key: 'Home' });
    expect(screen.getByText('0.800')).toBeTruthy();
    expect(screen.getByText('❌ Unstable')).toBeTruthy();
  });

  it('allows switching active parameter and toggling to 2x2 grid view', () => {
    render(<MatterSection educatorMode={true} />);

    // Switch to Mass Hierarchy
    const hierarchyTab = screen.getByText('2. Mass Hierarchy');
    fireEvent.click(hierarchyTab);
    expect(screen.getByText('The Hierarchy Problem')).toBeTruthy();

    // Switch to Matter vs Antimatter
    const matterTab = screen.getByText('3. Matter Asymmetry');
    fireEvent.click(matterTab);
    expect(screen.getByText('Baryogenesis')).toBeTruthy();

    // Switch to Proton Stability
    const protonTab = screen.getByText('4. Proton Stability');
    fireEvent.click(protonTab);
    expect(screen.getByText('Mass Gap & Threshold')).toBeTruthy();

    // Toggle to 2x2 Quad Deck view
    const gridToggle = screen.getByText('2×2 Quad Deck');
    fireEvent.click(gridToggle);
    expect(screen.getAllByRole('slider').length).toBe(4);
  });

  it('responds to global randomizeUniverse event', () => {
    render(<MatterSection educatorMode={false} />);
    fireEvent(window, new Event('randomizeUniverse'));
    expect(screen.getByText('Outcome')).toBeTruthy();
  });
});