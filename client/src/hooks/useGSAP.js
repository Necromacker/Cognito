import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function useGSAP(animationCallback, dependencies = []) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      if (typeof animationCallback === 'function') {
        animationCallback();
      }
    }, containerRef);

    return () => ctx.revert();
  }, dependencies);

  return containerRef;
}

