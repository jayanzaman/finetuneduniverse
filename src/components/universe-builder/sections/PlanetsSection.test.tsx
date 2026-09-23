import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import PlanetsSection from './PlanetsSection';

afterEach(() => {
  cleanup();
});

describe('PlanetsSection', () => {
  it('renders habitability controls with live readouts', () => {
    render(<PlanetsSection educatorMode={false} />);
    expect(screen.getAllByText('Habitability Controls').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('slider').length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByText('1.0 AU').length).toBeGreaterThan(0);
  });

  it('moves the planet out of the temperate band via the orbital slider', () => {
    render(<PlanetsSection educatorMode={false} />);

    const orbit = screen
      .getAllByRole('slider')
      .find((s) => s.getAttribute('aria-valuemax') === '5' && s.getAttribute('aria-valuemin') === '0.1');
    expect(orbit).toBeTruthy();

    fireEvent.keyDown(orbit as HTMLElement, { key: 'End' });
    expect(screen.getAllByText('5.0 AU').length).toBeGreaterThan(0);

    fireEvent.keyDown(orbit as HTMLElement, { key: 'Home' });
    expect(screen.getAllByText('0.1 AU').length).toBeGreaterThan(0);
  });
});