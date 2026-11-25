import { useEffect, useRef } from "react";
import Lenis from "lenis";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Smooth, cinematic scrolling (skipped for people who prefer reduced motion). */
export function useLenis(enabled: boolean) {
  const ref = useRef<Lenis | null>(null);
  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return;
    // Keep a light touch so scroll input feels connected to the user's hand.
    const lenis = new Lenis({ duration: 0.72, smoothWheel: true, wheelMultiplier: 1, syncTouch: true, touchMultiplier: 1.1 });
    ref.current = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      ref.current = null;
    };
  }, [enabled]);
  return ref;
}
