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
});