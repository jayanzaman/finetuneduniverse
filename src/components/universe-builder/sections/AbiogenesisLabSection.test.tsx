import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import AbiogenesisLabSection from './AbiogenesisLabSection';

afterEach(() => {
  cleanup();
});

describe('AbiogenesisLabSection', () => {
  it('starts at the first stage and advances via the next control', () => {
    render(<AbiogenesisLabSection educatorMode={false} />);
    expect(screen.getByText('Stage 1 of 6')).toBeTruthy();
    expect(screen.getAllByText('Simple Molecules').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Stage 2 of 6')).toBeTruthy();
    expect(screen.getAllByText('Amino Acids').length).toBeGreaterThan(0);
  });

  it('jumps to a stage via the dot navigation', () => {
    render(<AbiogenesisLabSection educatorMode={false} />);
    const dots = screen
      .getAllByRole('button')
      .filter((b) => (b.getAttribute('aria-label') || '').startsWith('Go to stage:'));
    expect(dots.length).toBe(6);

    fireEvent.click(dots[dots.length - 1]);
    expect(screen.getByText('Stage 6 of 6')).toBeTruthy();
    expect(screen.getAllByText('First Life').length).toBeGreaterThan(0);
  });
});