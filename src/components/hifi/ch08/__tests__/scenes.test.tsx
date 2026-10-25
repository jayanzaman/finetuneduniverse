import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SceneHost, SCENES, webglAvailable } from '../scenes/SceneHost';
import { SceneFallback } from '../scenes/fallbacks';
import type { SceneId } from '../scenes/sceneUtils';

function stubMatchMedia(reduced: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduced && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

const SCENE_IDS: SceneId[] = ['server-to-cell', 'nucleus-zoom', 'helix', 'pluto-unspool', 'folding'];

const EXPECTED_NUMBERS: Record<SceneId, RegExp> = {
  'server-to-cell': /215 petabytes per gram/,
  'nucleus-zoom': /2 metres of DNA.*6 micrometre/i,
  helix: /6\.2 billion base pairs/,
  'pluto-unspool': /6 billion kilometres.*Pluto/,
  folding: /1 to 2 percent of the genome/,
};

beforeEach(() => stubMatchMedia(false));
afterEach(() => cleanup());

describe('scene fallbacks', () => {
  it('registry covers every scene id', () => {
    expect(Object.keys(SCENES).sort()).toEqual([...SCENE_IDS].sort());
  });

  it.each(SCENE_IDS)('%s renders an accessible SVG carrying its key numbers', (scene) => {
    const { container } = render(<SceneFallback scene={scene} />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('aria-label')).toMatch(EXPECTED_NUMBERS[scene]);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.textContent).not.toBe('');
  });

  it('fallbacks expose visible numbers matching the aria-labels', () => {
    const { container: helix } = render(<SceneFallback scene="helix" />);
    expect(helix.textContent).toContain('~2 m of DNA');
    expect(helix.textContent).toContain('6.2 billion base pairs');

    const { container: pluto } = render(<SceneFallback scene="pluto-unspool" />);
    expect(pluto.textContent).toContain('~6 billion km');
  });
});

describe('webglAvailable', () => {
  it('returns false in jsdom (no WebGL context)', () => {
    expect(webglAvailable()).toBe(false);
  });
});

describe('SceneHost', () => {
  it('renders the static fallback when reduced motion is requested', () => {
    stubMatchMedia(true);
    render(<SceneHost scene="helix" progress={0.5} />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('aria-label')).toMatch(/6\.2 billion base pairs/);
    expect(document.querySelector('canvas')).toBeNull();
  });

  it('renders the static fallback when WebGL is unavailable', () => {
    render(<SceneHost scene="folding" progress={0.2} />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('aria-label')).toMatch(/1 to 2 percent of the genome/);
    expect(document.querySelector('canvas')).toBeNull();
  });
});
