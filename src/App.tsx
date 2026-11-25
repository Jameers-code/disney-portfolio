import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { useLenis } from "./components/useLenis";
import { SceneView } from "./components/Scenes";
import { FRAMES, scenes } from "./data/film";

// ---- Dwell: the film slows down while content is fully on screen, so there's time to read ----
const DWELL = 3.2; // how much longer the camera lingers on each scene
const RAMP = 0.016;
const windows = scenes
  .filter((s) => s.kind !== "opening" && s.kind !== "contact")
  .map((s) => [s.at[0] + RAMP, s.at[1] - RAMP] as [number, number]);
const cuts = Array.from(new Set([0, 1, ...windows.flat().map((v) => Math.min(1, Math.max(0, v)))])).sort((a, b) => a - b);
const segs = cuts.slice(0, -1).map((a, i) => {
  const b = cuts[i + 1];
  const mid = (a + b) / 2;
  const w = windows.some(([x, y]) => mid > x && mid < y) ? DWELL : 1;
  return { a, b, w, len: (b - a) * w };
});
const TOTAL = segs.reduce((t, g) => t + g.len, 0);
/** scroll position (0→1) → film position (0→1) */
function toFilm(u: number) {
  let t = Math.min(1, Math.max(0, u)) * TOTAL;
  for (const g of segs) {
    if (t <= g.len) return g.a + t / g.w;
    t -= g.len;
  }
  return 1;
}

export default function App() {
  useLenis(true);
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;
  const pixelRatio = () => Math.min(window.devicePixelRatio || 1, isMobile ? 1.35 : 2);
  const canvas = useRef<HTMLCanvasElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const pos = useRef(0);
  const drawRaf = useRef(0);
  const { scrollYProgress: scrollRaw } = useScroll();
  // Keep animation progress tied directly to the real scroll position. A spring
  // here makes the canvas trail behind fast wheel and touch input.
  const scrollYProgress = useTransform(scrollRaw, toFilm);

  const dim = useTransform(scrollYProgress, (v): number => {
    // softly dim the film behind whichever card is on screen, so content reads clearly
    const on = scenes.some((s) => s.kind !== "opening" && s.kind !== "hero" && s.kind !== "starring" && v > s.at[0] + 0.004 && v < (s.kind === "contact" ? 99 : s.at[1]) - 0.004);
    return on ? 1 : 0;
  });
  const endShade = useTransform(scrollYProgress, [0.92, 0.97], [0, 1]);
  const hint = useTransform(scrollYProgress, [0, 0.02], [1, 0]);

  const blobs = useRef<(Blob | undefined)[]>([]);
  const bmps = useRef(new Map<number, ImageBitmap>());
  const decoding = useRef(new Set<number>());
  const requestFrames = useRef<() => void>(() => {});
  const dir = useRef(1);
  const WIN = isMobile ? 12 : 22;
  const here = () => Math.round(pos.current * (FRAMES - 1));

  const draw = () => {
    const c = canvas.current;
    const ctx = context.current;
    if (!c || !ctx) return;
    const k = here();
    let img = bmps.current.get(k);
    if (!img) {
      for (let d = 1; d <= WIN && !img; d++) img = bmps.current.get(k + d * dir.current) || bmps.current.get(k - d * dir.current);
    }
    if (!img) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = isMobile ? "medium" : "high";
    const s = Math.max(c.width / img.width, c.height / img.height);
    const w = img.width * s;
    const h = img.height * s;
    ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
  };

  const ensureBitmaps = () => {
    const h0 = here();
    for (const [k, b] of bmps.current)
      if (Math.abs(k - h0) > WIN + 8) {
        b.close();
        bmps.current.delete(k);
      }
    for (let d = 0; d <= WIN && decoding.current.size < 4; d++) {
      for (const k of d === 0 ? [h0] : [h0 + d * dir.current, h0 - d * dir.current]) {
        if (k < 0 || k >= FRAMES || bmps.current.has(k) || decoding.current.has(k) || !blobs.current[k]) continue;
        decoding.current.add(k);
        createImageBitmap(blobs.current[k]!)
          .then((b) => {
            decoding.current.delete(k);
            if (Math.abs(k - here()) > WIN + 8) b.close();
            else {
              bmps.current.set(k, b);
              if (Math.abs(k - here()) <= 1) requestAnimationFrame(draw);
            }
            ensureBitmaps();
          })
          .catch(() => decoding.current.delete(k));
        if (decoding.current.size >= 4) break;
      }
    }
    requestFrames.current();
  };

  useEffect(() => {
    const dpr = pixelRatio();
    const set = window.innerWidth * dpr > 1400 ? "hd" : "sd";
    const cacheRadius = isMobile ? 20 : 34;
    const maxConcurrent = 4;
    const requested = new Set<number>();
    const inFlight = new Map<number, AbortController>();
    let alive = true;
    const purgeDistantFrames = () => {
      const current = here();
      for (const k of requested) {
        if (Math.abs(k - current) <= cacheRadius + 8) continue;
        requested.delete(k);
        inFlight.get(k)?.abort();
        inFlight.delete(k);
        blobs.current[k] = undefined;
        const bitmap = bmps.current.get(k);
        bitmap?.close();
        bmps.current.delete(k);
      }
    };
    const nextFrame = () => {
      const current = here();
      for (let distance = 0; distance <= cacheRadius; distance++) {
        const candidates = distance === 0
          ? [current]
          : [current + distance * dir.current, current - distance * dir.current];
        for (const k of candidates) {
          if (k >= 0 && k < FRAMES && !requested.has(k)) return k;
        }
      }
      return -1;
    };
    const pump = () => {
      if (!alive) return;
      purgeDistantFrames();
      while (alive && inFlight.size < maxConcurrent) {
        const k = nextFrame();
        if (k < 0) break;
        requested.add(k);
        const controller = new AbortController();
        inFlight.set(k, controller);
        fetch(`/film/${set}/f${String(k + 1).padStart(4, "0")}.webp?v=20261126-mobile-smooth1`, { signal: controller.signal })
          .then((response) => {
            if (!response.ok) throw new Error(`Frame ${k + 1} failed to load`);
            return response.blob();
          })
          .then((blob) => {
            if (!alive || Math.abs(k - here()) > cacheRadius + 8) return;
            blobs.current[k] = blob;
            if (Math.abs(k - here()) <= WIN) ensureBitmaps();
          })
          .catch(() => {
            if (controller.signal.aborted) requested.delete(k);
          })
          .finally(() => {
            inFlight.delete(k);
            pump();
          });
      }
    };
    requestFrames.current = pump;
    pump();
    return () => {
      alive = false;
      requestFrames.current = () => {};
      inFlight.forEach((controller) => controller.abort());
      inFlight.clear();
      bmps.current.forEach((b) => b.close());
      bmps.current.clear();
      blobs.current = [];
    };
  }, []);

  useEffect(() => {
    const resize = () => {
      const c = canvas.current;
      if (!c) return;
      const dpr = pixelRatio();
      const width = Math.round(window.innerWidth * dpr);
      const height = Math.round(window.innerHeight * dpr);
      if (c.width !== width || c.height !== height) {
        c.width = width;
        c.height = height;
        context.current = c.getContext("2d", { alpha: false });
      }
      draw();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const nv = Math.min(1, Math.max(0, v));
    if (nv !== pos.current) dir.current = nv > pos.current ? 1 : -1;
    pos.current = nv;
    ensureBitmaps();
    if (!drawRaf.current) {
      drawRaf.current = requestAnimationFrame(() => {
        drawRaf.current = 0;
        draw();
      });
    }
  });

  return (
    <>
      <div className="film" aria-hidden>
        <canvas ref={canvas} className="film-canvas" />
        <div className="film-vignette" />
        <motion.div className="film-dim" style={{ opacity: dim }} />
        <motion.div className="film-end" style={{ opacity: endShade }} />
      </div>

      <div className="stage">
        {scenes.map((s, i) => (
          <SceneView key={i} s={s} p={scrollYProgress} />
        ))}
      </div>

      <motion.div className="film-hint" style={{ opacity: hint }} aria-hidden>
        <i />
      </motion.div>
      <div className="film-progress" aria-hidden>
        <motion.i style={{ scaleX: scrollRaw }} />
      </div>

      <main className="film-track" aria-label="Pathan Jabeen — pharmacy portfolio" />
    </>
  );
}
