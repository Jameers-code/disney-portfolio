import { useEffect, useRef } from "react";
import Lenis from "lenis";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const prefersNativeTouchScroll = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

/** Smooth, cinematic scrolling (skipped for people who prefer reduced motion). */
export function useLenis(enabled: boolean) {
  const ref = useRef<Lenis | null>(null);
  useEffect(() => {
    if (!enabled || prefersReducedMotion() || prefersNativeTouchScroll()) return;
    // Keep Lenis for precise wheel/trackpad input; touch devices use native
    // momentum scrolling so the page remains directly connected to the finger.
    const lenis = new Lenis({ duration: 0.82, smoothWheel: true, wheelMultiplier: 1, syncTouch: false });
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
