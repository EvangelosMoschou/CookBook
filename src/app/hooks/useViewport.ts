import { useEffect, useState } from 'react';

export interface Viewport {
  width: number;
  height: number;
}

/**
 * Tracks the visual viewport. Reads are rAF-throttled so resize/orientation
 * changes never trigger a render per event.
 */
export function useViewport(): Viewport {
  const [viewport, setViewport] = useState<Viewport>(() => ({
    width: typeof window === 'undefined' ? 1280 : window.innerWidth,
    height: typeof window === 'undefined' ? 800 : window.innerHeight,
  }));

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setViewport({ width: window.innerWidth, height: window.innerHeight });
      });
    };

    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, []);

  return viewport;
}

/** Below this width the app uses its phone layout instead of the desktop shell. */
export const PHONE_BREAKPOINT = 900;
