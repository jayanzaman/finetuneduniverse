'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type MathClipProps = {
  /** Scene id as rendered by manim/render.sh, e.g. "1.2" or "U.1". */
  sceneId: string;
  /** Beat name (section) within the scene, e.g. "b3_slopes" or "close". */
  beat: string;
  /** The scene's equation, hand-set JSX in the mathBlock style — live text, never an image. */
  equation?: ReactNode;
  className?: string;
};

const clipSrc = (sceneId: string, beat: string, aspect: 'landscape' | 'portrait') =>
  `/math/${sceneId}/${beat}.${aspect}.mp4`;
const posterSrc = (sceneId: string, aspect: 'landscape' | 'portrait') =>
  `/math/${sceneId}/poster.${aspect}.png`;

/**
 * Embeds one Manim beat. Muted, inline, lazy; plays only while scrolled into
 * view; under prefers-reduced-motion it renders the poster frame only.
 * Portrait asset is chosen when the viewport is taller than wide.
 */
export function MathClip({ sceneId, beat, equation, className }: MathClipProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [aspect, setAspect] = useState<'landscape' | 'portrait'>('landscape');

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const aspectQuery = window.matchMedia('(max-aspect-ratio: 1/1)');
    const sync = () => {
      setReducedMotion(motionQuery.matches);
      setAspect(aspectQuery.matches ? 'portrait' : 'landscape');
    };
    sync();
    motionQuery.addEventListener('change', sync);
    aspectQuery.addEventListener('change', sync);
    return () => {
      motionQuery.removeEventListener('change', sync);
      aspectQuery.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            void video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reducedMotion, aspect]);

  return (
    <figure className={className} data-math-clip={sceneId} data-beat={beat}>
      {reducedMotion ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterSrc(sceneId, aspect)}
          alt={`Static frame of the math clip for scene ${sceneId}`}
        />
      ) : (
        <video
          ref={videoRef}
          muted
          playsInline
          loop
          preload="none"
          poster={posterSrc(sceneId, aspect)}
          src={clipSrc(sceneId, beat, aspect)}
        />
      )}
      {equation ? <figcaption data-equation>{equation}</figcaption> : null}
    </figure>
  );
}
