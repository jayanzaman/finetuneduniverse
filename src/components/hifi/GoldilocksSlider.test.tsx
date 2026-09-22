import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { GoldilocksSlider } from './GoldilocksSlider';

afterEach(() => {
  cleanup();
});

describe('GoldilocksSlider', () => {
  it('renders label, value, and unit', () => {
    render(<GoldilocksSlider label="Initial entropy" value="1.00" unit="S/k" position={0.5} />);
    expect(screen.getByText('Initial entropy')).toBeTruthy();
    expect(screen.getByText('1.00')).toBeTruthy();
    expect(screen.getByText('S/k')).toBeTruthy();
  });

  it('is non-interactive by default', () => {
    render(<GoldilocksSlider label="X" value="0" />);
    expect(screen.queryByRole('slider')).toBeNull();
  });

  it('exposes slider semantics and key-driven steps when interactive', () => {
    const onChange = vi.fn();
    render(
      <GoldilocksSlider
        label="Stellar mass"
        value="1.0"
        unit="M☉"
        position={0.42}
        interactive
        ariaLabel="Stellar mass control"
        onPositionChange={onChange}
      />,
    );

    const slider = screen.getByRole('slider', { name: /stellar mass control/i });
    expect(slider.getAttribute('aria-valuenow')).toBe('0.42');
    expect(slider.getAttribute('aria-valuemin')).toBe('0');
    expect(slider.getAttribute('aria-valuemax')).toBe('1');

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeCloseTo(0.43, 5);

    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(onChange.mock.calls[1][0]).toBeCloseTo(0.41, 5);

    fireEvent.keyDown(slider, { key: 'Home' });
    expect(onChange.mock.calls[2][0]).toBe(0);

    fireEvent.keyDown(slider, { key: 'End' });
    expect(onChange.mock.calls[3][0]).toBe(1);

    // Shift accelerates the step.
    fireEvent.keyDown(slider, { key: 'ArrowRight', shiftKey: true });
    expect(onChange.mock.calls[4][0]).toBeCloseTo(0.47, 5);
  });
});