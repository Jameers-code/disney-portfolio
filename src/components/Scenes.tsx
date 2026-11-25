import { motion, MotionValue, useTransform } from "framer-motion";
import { ReactNode } from "react";
import { portfolio } from "../data/portfolio";
import type { Scene } from "../data/film";

const RAMP = 0.016;

/** Whole-scene envelope: drifts in out of focus, settles, then floats past the camera. */
function useEnvelope(p: MotionValue<number>, a: number, b: number, hold = false, travel = 50) {
  const end = hold ? 99 : b;
  const opacity = useTransform(p, [a, a + RAMP, end - RAMP, end], [0, 1, 1, 0]);
  const blurV = useTransform(p, [a, a + RAMP * 1.3, end - RAMP, end], isPhone ? [0, 0, 0, 0] : [5, 0, 0, 5]);
  const filter = useTransform(blurV, (v) => `blur(${v}px)`);
  const y = useTransform(p, [a, hold ? a + 0.05 : end], [travel, hold ? 0 : -travel]);
  const scale = useTransform(p, [a, a + RAMP * 1.5, end - RAMP, end], [0.97, 1, 1, 1.05]);
  const pointerEvents = useTransform(p, (v) => (v > a + RAMP * 0.6 && v < end - RAMP * 0.6 ? "auto" : "none"));
  return { opacity, filter, y, scale, pointerEvents };
}

/** A line inside a scene that arrives a beat after the one before it. */
function Beat({ p, a, i, children, className, as = "div" }: { p: MotionValue<number>; a: number; i: number; children: ReactNode; className?: string; as?: "div" | "p" | "h2" | "h3" }) {
  const s = a + 0.005 + i * 0.0028;
  const opacity = useTransform(p, [s, s + 0.012], [0, 1]);
  const y = useTransform(p, [s, s + 0.014], [18, 0]);
  const blurV = useTransform(p, [s, s + 0.012], isPhone ? [0, 0] : [2, 0]);
  const filter = useTransform(blurV, (v) => `blur(${v}px)`);
  const M = motion[as];
  return (
    <M className={className} style={{ opacity, y, filter }}>
      {children}
    </M>
  );
}

/** Big chapter title, letters rising out of the light one by one. */
function Letters({ text, p, a, span = 0.016, className }: { text: string; p: MotionValue<number>; a: number; span?: number; className?: string }) {
  const chars = text.split("");
  return (
    <span className={className} aria-label={text}>
      {chars.map((c, i) => (
        <Letter key={i} c={c} p={p} s={a + (i / chars.length) * span} />
      ))}
    </span>
  );
}
function Letter({ c, p, s }: { c: string; p: MotionValue<number>; s: number }) {
  const opacity = useTransform(p, [s, s + 0.01], [0, 1]);
  const y = useTransform(p, [s, s + 0.014], ["0.5em", "0em"]);
  const blurV = useTransform(p, [s, s + 0.012], isPhone ? [0, 0] : [3, 0]);
  const filter = useTransform(blurV, (v) => `blur(${v}px)`);
  return (
    <motion.span aria-hidden className="ltr" style={{ opacity, y, filter }}>
      {c === " " ? " " : c}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* Skill constellations: words drift through the sky at different depths */
type Word = { t: string; x: number; y: number; size: number; depth: number; label?: boolean };
const S = portfolio.skills;
const clusters: Word[][] = [
  // left side of the frame — Languages & Frontend
  [
    { t: "Pharmaceutical Analysis", x: 6, y: 16, size: 1, depth: 0.6, label: true },
    { t: "UV-Visible", x: 8, y: 26, size: 1.5, depth: 1 },
    { t: "Spectrophotometry", x: 21, y: 24, size: 1.15, depth: 0.7 },
    { t: "Ibuprofen", x: 13, y: 34, size: 1.35, depth: 1.2 },
    { t: "Quantification", x: 25, y: 33, size: 1, depth: 0.8 },
    { t: "Acid-Base Titration", x: 6, y: 41, size: 0.95, depth: 0.5 },
    { t: "Formulation", x: 7, y: 56, size: 1, depth: 0.6, label: true },
    { t: "Mouthwash", x: 9, y: 66, size: 1.55, depth: 1.1 },
    { t: "Oral Hygiene", x: 22, y: 61, size: 1.05, depth: 0.7 },
    { t: "Antiseptic Ingredients", x: 18, y: 75, size: 1.1, depth: 0.9 },
    { t: "Soothing Agents", x: 6, y: 80, size: 0.9, depth: 0.5 },
    { t: "Team Projects", x: 30, y: 71, size: 0.9, depth: 0.6 },
  ],
  // right side — Backend & Databases
  [
    { t: "Laboratory Practice", x: 70, y: 15, size: 1, depth: 0.6, label: true },
    { t: "GMP Knowledge", x: 72, y: 25, size: 1.5, depth: 1.1 },
    { t: "Tablet Compression", x: 84, y: 21, size: 1.05, depth: 0.7 },
    { t: "Green Solvents", x: 78, y: 33, size: 1.2, depth: 0.9 },
    { t: "Green Tea", x: 68, y: 38, size: 0.95, depth: 0.5 },
    { t: "Digital Tools", x: 72, y: 56, size: 1, depth: 0.6, label: true },
    { t: "App Development", x: 70, y: 66, size: 1.4, depth: 1.1 },
    { t: "Lovable", x: 82, y: 62, size: 1.2, depth: 0.8 },
    { t: "Generative AI", x: 86, y: 73, size: 0.95, depth: 0.5 },
    { t: "AI Applications", x: 70, y: 77, size: 0.95, depth: 0.7 },
  ],
  // lower band — Tools & Core concepts
  [
    { t: "Languages", x: 8, y: 62, size: 1, depth: 0.6, label: true },
    { t: "Telugu", x: 9, y: 71, size: 1.35, depth: 1.1 },
    { t: "English", x: 22, y: 69, size: 1.1, depth: 0.8 },
    { t: "Hindi", x: 16, y: 80, size: 1.05, depth: 0.7 },
    { t: "Communication", x: 30, y: 78, size: 0.9, depth: 0.5 },
    { t: "Teamwork", x: 28, y: 87, size: 0.9, depth: 0.6 },
    { t: "Curiosity", x: 7, y: 89, size: 0.95, depth: 0.7 },
    { t: "Interests", x: 66, y: 62, size: 1, depth: 0.6, label: true },
    { t: "Music", x: 66, y: 71, size: 1.35, depth: 1.1 },
    { t: "Dance", x: 85, y: 69, size: 1.2, depth: 0.9 },
    { t: "Pharmacy", x: 70, y: 80, size: 1.05, depth: 0.8 },
    { t: "Healthcare", x: 90, y: 79, size: 1.3, depth: 1.2 },
    { t: "Learning", x: 64, y: 88, size: 0.9, depth: 0.5 },
    { t: "Innovation", x: 81, y: 88, size: 0.9, depth: 0.6 },
  ],
];
void S;

const isPhone = typeof window !== "undefined" && window.innerWidth < 760;

function SkillWord({ w: w0, p, a, b, i, n }: { w: Word; p: MotionValue<number>; a: number; b: number; i: number; n: number }) {
  // On phones the sky is narrow: lay the words out as an airy zig-zag instead
  const w = isPhone ? { ...w0, x: w0.label ? 6 : i % 2 ? 58 : 10, y: 12 + (i * 74) / Math.max(1, n - 1), size: w0.label ? w0.size : Math.min(w0.size, 1.2) } : w0;
  const s = a + 0.004 + (i % 7) * 0.003;
  const opacity = useTransform(p, [s, s + 0.012, b - 0.012, b], [0, w.label ? 1 : 0.95, w.label ? 1 : 0.95, 0]);
  const y = useTransform(p, [a, b], [60 * w.depth, -90 * w.depth]);
  const blurV = useTransform(p, [s, s + 0.012, b - 0.012, b], isPhone ? [0, 0, 0, 0] : [2, 0, 0, 2]);
  const filter = useTransform(blurV, (v) => `blur(${v}px)`);
  return (
    <motion.span
      className={`sk ${w.label ? "sk-label" : ""}`}
      style={{ left: `${w.x}%`, top: `${w.y}%`, translate: `-${w.x}% 0`, opacity, y, filter, fontSize: `calc(${w.size} * var(--sk))` }}
    >
      {w.label ? (
        <>
          <i /> {w.t}
        </>
      ) : (
        w.t
      )}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
export function SceneView({ s, p }: { s: Scene; p: MotionValue<number> }) {
  const [a, b] = s.at;
  const hold = s.kind === "contact";
  const env = useEnvelope(p, a, b, hold, s.kind === "heading" ? 30 : 50);
  const P = portfolio;

  switch (s.kind) {
    case "opening":
      return (
        <motion.div className="sc sc-center halo" style={env}>
          <p className="t-eyebrow">A {P.name} story</p>
          <p className="t-meta">Scroll to begin</p>
        </motion.div>
      );

    case "hero":
      return (
        <motion.div className="sc sc-lower halo" style={env}>
          <Beat p={p} a={a - 0.006} i={0} as="p" className="t-eyebrow">The Kingdom of</Beat>
          <h1 className="h-hero">
            <Letters text={P.shortName} p={p} a={a} span={0.018} />
          </h1>
        </motion.div>
      );

    case "heading":
      return (
        <motion.div className={`sc sc-${s.pos} halo-soft`} style={env}>
          <Beat p={p} a={a - 0.006} i={0} as="p" className="h-eyebrow">✦ {s.eyebrow} ✦</Beat>
          <h2 className="h-chapter">
            <Letters text={s.text} p={p} a={a} />
          </h2>
          <Beat p={p} a={a} i={3} className="h-line"><i /></Beat>
        </motion.div>
      );

    case "about":
      return (
        <motion.div className="sc sc-lm halo comp" style={env}>
          <Beat p={p} a={a - 0.006} i={0} as="p" className="h-eyebrow">✦ Chapter I ✦</Beat>
          <h2 className="h-section">
            <Letters text="About Me" p={p} a={a} span={0.012} />
          </h2>
          <Beat p={p} a={a} i={3} as="p" className="comp-lead">{P.summary}</Beat>
          <Beat p={p} a={a} i={5} className="comp-stats">
            {P.stats.map((stat, index) => (
              <div key={stat.label}>
                {index > 0 && <i aria-hidden />}
                <b>{stat.value.toFixed(stat.decimals)}{stat.suffix}</b><span>{stat.label}</span>
              </div>
            ))}
          </Beat>
        </motion.div>
      );

    case "starring":
      return (
        <motion.div className="sc sc-tl halo" style={env}>
          <p className="t-eyebrow">Starring</p>
          <p className="t-title">{P.name}</p>
        </motion.div>
      );

    case "education":
      return (
        <motion.div className="sc sc-rm halo comp right" style={env}>
          <Beat p={p} a={a - 0.006} i={0} as="p" className="h-eyebrow">✦ Academic Journey ✦</Beat>
          <h2 className="h-section">
            <Letters text="Education" p={p} a={a} span={0.012} />
          </h2>
          {P.timeline.slice(0, 3).map((entry, index) => (
            <Beat key={entry.title} p={p} a={a} i={3 + index * 2} className="edu-line">
              <span className="edu-year">{entry.period}</span>
              <p className="edu-title">{entry.title}</p>
              <p className="edu-place">{entry.place}</p>
              <span className="pill-glass">{entry.badge}</span>
            </Beat>
          ))}
        </motion.div>
      );

    case "skills":
      return (
        <div className="sc-field">
          {clusters[s.cluster].map((w, i) => (
            <SkillWord key={w.t} w={w} p={p} a={a} b={b} i={i} n={clusters[s.cluster].length} />
          ))}
        </div>
      );

    case "project": {
      const pr = P.projects[s.index];
      return (
        <motion.div className={`sc sc-${s.pos}`} style={env}>
          <Glass p={p} a={a} b={b} wide={s.pos !== "rm"}>
            <Beat p={p} a={a} i={0} as="p" className="g-num">{pr.numeral}</Beat>
            <div className="g-main">
              <Beat p={p} a={a} i={1} as="p" className="g-kicker">{pr.kicker}</Beat>
              <Beat p={p} a={a} i={2} as="h3" className="g-title">{pr.title}</Beat>
              <Beat p={p} a={a} i={3} as="p" className="g-body">{pr.summary}</Beat>
              <Beat p={p} a={a} i={4} className="g-tech">
                {pr.tech.slice(0, 8).join("  ·  ")}
              </Beat>
            </div>
          </Glass>
        </motion.div>
      );
    }

    case "achievements":
      return (
        <motion.div className="sc sc-tl-wide halo comp" style={env}>
          <Beat p={p} a={a - 0.006} i={0} as="p" className="h-eyebrow">✦ Chapter IV ✦</Beat>
          <h2 className="h-section">
            <Letters text="Achievements" p={p} a={a} span={0.014} />
          </h2>
          {P.achievements.map((achievement, index) => (
            <Beat key={achievement.title} p={p} a={a} i={3 + index * 2} as="p" className="ach-line">
              <span>{achievement.title}</span> {achievement.detail}
            </Beat>
          ))}
        </motion.div>
      );

    case "experience":
      return (
        <motion.div className="sc sc-rm halo comp right" style={env}>
          <Beat p={p} a={a - 0.006} i={0} as="p" className="h-eyebrow">✦ Chapter V ✦</Beat>
          <h2 className="h-section">
            <Letters text="Experience" p={p} a={a} span={0.012} />
          </h2>
          {P.timeline.slice(0, 1).map((entry) => (
            <Beat key={entry.title} p={p} a={a} i={3} className="edu-line">
              <span className="edu-year">{entry.period}</span>
              <p className="edu-title">{entry.title}</p>
              <p className="edu-place">{entry.place}</p>
              <p className="edu-place">{entry.detail}</p>
            </Beat>
          ))}
          <Beat p={p} a={a} i={6} as="p" className="cert-head">Training &amp; Certifications</Beat>
          <Beat p={p} a={a} i={7} as="p" className="cert-roll">
            {P.certifications.map((c) => c.name).join("  ✦  ")}
          </Beat>
        </motion.div>
      );

    case "contact":
      return (
        <motion.div className="sc sc-center halo-strong" style={env}>
          <Beat p={p} a={a - 0.006} i={0} as="p" className="h-eyebrow">✦ Epilogue ✦</Beat>
          <h2 className="h-chapter">
            <Letters text="Contact Me" p={p} a={a} />
          </h2>
          <Beat p={p} a={a} i={4} as="p" className="ct-lead">{P.role} · {P.location} · Get in touch to connect.</Beat>
          <Beat p={p} a={a} i={6}>
            <a className="ct-mail" href={`mailto:${P.contact.email}`}>{P.contact.email}</a>
          </Beat>
          <Beat p={p} a={a} i={8} className="ct-links">
            <a className="pill-glass link" href={`tel:${P.contact.phone}`}>Call {P.contact.phone}</a>
            <a className="pill-glass link" href={P.resume} target="_blank" rel="noreferrer">Résumé</a>
          </Beat>
          <Beat p={p} a={a} i={10} as="p" className="ct-credit">© 2026 {P.name} · Visuals created with AI (Google Gemini)</Beat>
        </motion.div>
      );
  }
}

/** Premium frosted glass: almost invisible edges, a specular sheen that slides as the camera moves. */
function Glass({ p, a, b, wide, children }: { p: MotionValue<number>; a: number; b: number; wide?: boolean; children: ReactNode }) {
  const sheen = useTransform(p, [a, b], ["-60%", "160%"]);
  const tilt = useTransform(p, [a, b], isPhone ? [0, 0] : [4, -4]);
  return (
    <motion.div className={`glass ${wide ? "wide" : ""}`} style={{ rotateY: tilt }}>
      <motion.span className="glass-sheen" style={{ x: sheen }} />
      <span className="glass-edge" />
      {children}
    </motion.div>
  );
}
