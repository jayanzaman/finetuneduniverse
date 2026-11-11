import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MathClip } from './math-clip';

type MediaQueryHandler = () => void;

function mockMatchMedia(opts: { reduced?: boolean; portrait?: boolean }) {
  const listeners = new Map<string, Set<MediaQueryHandler>>();
  window.matchMedia = vi.fn().mockImplementation((query: string) => {
    const matches =
      query === '(prefers-reduced-motion: reduce)'
        ? !!opts.reduced
        : query === '(max-aspect-ratio: 1/1)'
          ? !!opts.portrait
          : false;
    return {
      matches,
      media: query,
      addEventListener: (_: string, h: MediaQueryHandler) =>
        listeners.set(query, (listeners.get(query) ?? new Set()).add(h)),
      removeEventListener: (_: string, h: MediaQueryHandler) => listeners.get(query)?.delete(h),
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList;
  });
}

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  observed: Element[] = [];
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
    MockIntersectionObserver.instances.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve() {}
  disconnect() {}
  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting, target: this.observed[0] } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: vi.fn().mockResolvedValue(undefined),
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: vi.fn(),
  });
});

describe('MathClip', () => {
  it('renders a muted, inline, lazy video with a poster', () => {
    mockMatchMedia({});
    const { container } = render(<MathClip sceneId="1.2" beat="b3_slopes" />);
    const video = container.querySelector('video')!;
    expect(video.muted).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(video.getAttribute('preload')).toBe('none');
    expect(video.getAttribute('poster')).toBe('/math/1.2/poster.landscape.png');
    expect(video.getAttribute('src')).toBe('/math/1.2/b3_slopes.landscape.mp4');
  });

  it('picks the portrait asset when the viewport is taller than wide', () => {
    mockMatchMedia({ portrait: true });
    const { container } = render(<MathClip sceneId="8.3" beat="close" />);
    const video = container.querySelector('video')!;
    expect(video.getAttribute('src')).toBe('/math/8.3/close.portrait.mp4');
    expect(video.getAttribute('poster')).toBe('/math/8.3/poster.portrait.png');
  });

  it('shows only the poster under prefers-reduced-motion', () => {
    mockMatchMedia({ reduced: true });
    const { container } = render(<MathClip sceneId="1.2" beat="b1_cube" />);
    expect(container.querySelector('video')).toBeNull();
    const img = container.querySelector('img')!;
    expect(img.getAttribute('src')).toBe('/math/1.2/poster.landscape.png');
  });

  it('plays in view and pauses out of view', () => {
    mockMatchMedia({});
    const { container } = render(<MathClip sceneId="1.2" beat="b1_cube" />);
    const video = container.querySelector('video')!;
    const observer = MockIntersectionObserver.instances[0];
    observer.trigger(true);
    expect(video.play).toHaveBeenCalled();
    observer.trigger(false);
    expect(video.pause).toHaveBeenCalled();
  });

  it('renders the equation as live text beside the clip', () => {
    mockMatchMedia({});
    render(
      <MathClip
        sceneId="1.2"
        beat="close"
        equation={
          <span>
            ρ<sub>m</sub> ∝ a<sup>−3</sup>
          </span>
        }
      />,
    );
    const caption = screen.getByText(/ρ/).closest('[data-equation]');
    expect(caption).not.toBeNull();
    expect(caption!.querySelector('img')).toBeNull();
  });
});
