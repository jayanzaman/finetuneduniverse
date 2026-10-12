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

  it('renders direct links to dedicated parameter pages for Parameter 01 and 05', () => {
    render(
      <ProgressionProvider>
        <Instrument />
      </ProgressionProvider>,
    );

    const lessonLinks = screen.getAllByRole('link', { name: /read the lesson · ↗/i });
    expect(lessonLinks.length).toBeGreaterThanOrEqual(6);
    expect(lessonLinks[0].getAttribute('href')).toBe('/questions/why-did-the-universe-begin-ordered/lab/entropy');
    expect(lessonLinks[4].getAttribute('href')).toBe('/questions/why-did-the-universe-begin-ordered/lab/dark-energy');

    const focus01Links = screen.getAllByRole('link', { name: /parameter 01 · focused view/i });
    expect(focus01Links[0].getAttribute('href')).toBe('/questions/why-did-the-universe-begin-ordered/lab/entropy');

    const focus05 = screen.getByRole('link', { name: /parameter 05 · focused view/i });
    expect(focus05.getAttribute('href')).toBe('/questions/why-did-the-universe-begin-ordered/lab/dark-energy');
  });
});