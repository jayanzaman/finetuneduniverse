import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ProgressionProvider } from '../progression/ProgressionContext';
import { Instrument } from './Instrument';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('Instrument (Beginning lab)', () => {
  it('starts in every band and randomizes then undoes', () => {
    render(
      <ProgressionProvider>
        <Instrument />
      </ProgressionProvider>,
    );

    expect(screen.getAllByText('In all bands · 6 / 6').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /undo/i })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /randomize universe/i }));
    expect(screen.getByRole('button', { name: /undo/i })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /undo/i }));
    expect(screen.queryByRole('button', { name: /undo/i })).toBeNull();
    expect(screen.getAllByText('In all bands · 6 / 6').length).toBeGreaterThan(0);
  });
});