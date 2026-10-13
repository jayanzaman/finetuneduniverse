import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import StarlightSection from './StarlightSection';

afterEach(() => {
  cleanup();
});

describe('StarlightSection', () => {
  it('renders the stellar-mass control with a live readout', () => {
    render(<StarlightSection educatorMode={false} />);
    expect(screen.getAllByText('Stellar Mass').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('slider').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('1.0 M☉').length).toBeGreaterThan(0);
  });

  it('moves the stellar mass to the range edges via the slider', () => {
    render(<StarlightSection educatorMode={false} />);

    const mass = screen
      .getAllByRole('slider')
      .find((s) => s.getAttribute('aria-valuemax') === '2' && s.getAttribute('aria-valuemin') === '0.1');
    expect(mass).toBeTruthy();

    fireEvent.keyDown(mass as HTMLElement, { key: 'End' });
    expect(screen.getAllByText('2.0 M☉').length).toBeGreaterThan(0);

    fireEvent.keyDown(mass as HTMLElement, { key: 'Home' });
    expect(screen.getAllByText('0.1 M☉').length).toBeGreaterThan(0);
  });

  it('allows switching active parameter and toggling to 3-column triptych view', () => {
    render(<StarlightSection educatorMode={true} />);

    // Switch to Metallicity
    const metallicityTab = screen.getByText('2. Metallicity Spectrograph');
    fireEvent.click(metallicityTab);
    expect(screen.getAllByText('Metallicity').length).toBeGreaterThan(0);

    // Switch to Star Formation Rate
    const formationTab = screen.getByText('3. Cosmic Star Formation');
    fireEvent.click(formationTab);
    expect(screen.getAllByText('Star Formation Rate').length).toBeGreaterThan(0);

    // Toggle to 3-Column Triptych view
    const triptychToggle = screen.getByText('3-Column Triptych');
    fireEvent.click(triptychToggle);
    expect(screen.getAllByRole('slider').length).toBeGreaterThanOrEqual(2);
  });

  it('responds to global randomizeUniverse event', () => {
    render(<StarlightSection educatorMode={false} />);
    fireEvent(window, new Event('randomizeUniverse'));
    expect(screen.getAllByText('Stellar Mass').length).toBeGreaterThan(0);
  });
});