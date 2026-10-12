import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import LifeSection from './LifeSection';

afterEach(() => {
  cleanup();
});

describe('LifeSection image and timeline rendering', () => {
  it('renders the initial era illustration image for Hadean Earth', () => {
    render(<LifeSection educatorMode={false} />);
    const img = screen.getByRole('img', { name: /Hadean Earth/i });
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('/Hadean%20Earth.png');
  });

  it('updates the illustration image when selecting a different geological era', () => {
    render(<LifeSection educatorMode={false} />);

    // Click Great Oxygenation in the timeline
    const oxygenationEra = screen.getByTitle(/Great Oxygenation/i);
    expect(oxygenationEra).toBeTruthy();
    fireEvent.click(oxygenationEra);

    const img = screen.getByRole('img', { name: /Great Oxygenation/i });
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('/Great%20Oxygenation.png');
  });

  it('renders illustration for Ediacaran-Cambrian and Cenozoic eras', () => {
    render(<LifeSection educatorMode={false} />);

    const cambrianEra = screen.getByTitle(/Ediacaran-Cambrian/i);
    fireEvent.click(cambrianEra);
    const cambrianImg = screen.getByRole('img', { name: /Ediacaran-Cambrian/i });
    expect(cambrianImg.getAttribute('src')).toBe('/Ediacaran-Cambrian.png');

    const cenozoicEra = screen.getByTitle(/Cenozoic Earth/i);
    fireEvent.click(cenozoicEra);
    const cenozoicImg = screen.getByRole('img', { name: /Cenozoic Earth/i });
    expect(cenozoicImg.getAttribute('src')).toBe('/Cenozoic%20Earth.png');
  });
});
