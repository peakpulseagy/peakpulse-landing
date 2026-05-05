"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import "./editorial.css";

/* ──────────────────────────────────────────────
   Reveal-on-scroll
   ────────────────────────────────────────────── */
function useRevealOnScroll() {
  useEffect(() => {
    const selector = ".reveal, .ed-hero, .ed-bento, .ed-process, .ed-cases, .ed-trans, .ed-portfolio, .ed-pricing";

    // Immediately mark anything currently in the viewport — covers jumps + slow IO ticks
    const markVisible = () => {
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
          el.classList.add("in-view");
        }
      });
    };
    markVisible();
    const onScroll = () => markVisible();
    window.addEventListener("scroll", onScroll, { passive: true });

    // IO handles the rest as elements enter
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -5% 0px" }
    );
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => io.observe(el));

    // Re-scan on next frame to catch late-mounting children (mode switches, etc.)
    requestAnimationFrame(markVisible);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
}

/* ──────────────────────────────────────────────
   Animated counter
   ────────────────────────────────────────────── */
function Counter({
  to,
  suffix = "",
  prefix = "",
  duration = 1800,
  decimals = 0,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3);
              setN(eased * to);
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [to, duration]);

  const display = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix && <sup>{suffix}</sup>}
    </span>
  );
}

/* ──────────────────────────────────────────────
   Scroll progress bar (top of page)
   ────────────────────────────────────────────── */
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setPct(total > 0 ? (h.scrollTop / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="ed-scroll-progress" style={{ transform: `scaleX(${pct / 100})` }} aria-hidden />;
}

/* ──────────────────────────────────────────────
   Sand-wave dust reveal for the hero dashboard.
   Renders a canvas overlay carrying ~6,500 fine sand-grain
   particles. The animation runs on a continuous loop with
   four phases:
     1. DANCE     — particles drift in a multi-octave wave
                    field, fluid like wind blowing over sand
     2. CONVERGE  — particles ease from their wave position
                    onto target pixels sampled from the
                    dashboard outline + chart bars
     3. HOLD      — dashboard fully formed; particles settle
                    to a low-alpha shimmer dusting the frame
     4. DISPERSE  — particles peel away from their targets
                    back into the wave field
   The dashboard frames + callouts fade in/out in sync with
   the cycle through CSS variables driven from the loop.
   ────────────────────────────────────────────── */
function DustReveal({
  targetRef,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const target = targetRef.current;
    if (!canvas || !target) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // No animation: reveal the dashboard at rest
      target.style.setProperty("--reveal", "1");
      target.style.setProperty("--reveal-blur", "0px");
      target.style.setProperty("--reveal-scale", "1");
      return;
    }

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let running = false;
    let visible = true;

    const LOOP = 18000; // 18s full cycle — calm, deliberate

    // Pre-computed flowing gradient palette: 512 lookup entries cycling
    // white → teal → soft blue → coral → white. Each particle samples
    // this palette using (its diagonal position + time offset), so the
    // gradient appears to flow across the entire dust field.
    const PALETTE_SIZE = 512;
    const palette = new Uint8Array(PALETTE_SIZE * 3);
    {
      const stops: { t: number; r: number; g: number; b: number }[] = [
        { t: 0.00, r: 255, g: 255, b: 255 }, // white
        { t: 0.18, r: 0,   g: 212, b: 170 }, // brand teal
        { t: 0.40, r: 130, g: 180, b: 240 }, // soft glacial blue
        { t: 0.62, r: 255, g: 92,  b: 92  }, // brand coral
        { t: 0.82, r: 255, g: 200, b: 120 }, // warm sand gold
        { t: 1.00, r: 255, g: 255, b: 255 }, // wrap to white
      ];
      for (let i = 0; i < PALETTE_SIZE; i++) {
        const t = i / (PALETTE_SIZE - 1);
        let a = stops[0];
        let b = stops[stops.length - 1];
        for (let j = 0; j < stops.length - 1; j++) {
          if (t >= stops[j].t && t <= stops[j + 1].t) {
            a = stops[j];
            b = stops[j + 1];
            break;
          }
        }
        const local = (t - a.t) / (b.t - a.t || 1);
        palette[i * 3 + 0] = Math.round(a.r + (b.r - a.r) * local);
        palette[i * 3 + 1] = Math.round(a.g + (b.g - a.g) * local);
        palette[i * 3 + 2] = Math.round(a.b + (b.b - a.b) * local);
      }
    }

    type Particle = {
      tx: number;     // target X on the dashboard
      ty: number;     // target Y
      hx: number;     // home X for the dance phase
      hy: number;     // home Y
      hAmp: number;   // dance amplitude (px)
      seed: number;   // 0..1 unique offset
      gradPos: number;// 0..1 baseline position in the palette
      stagger: number;// 0..1 stagger for converge/disperse
    };

    let particles: Particle[] = [];
    let imageData: ImageData | null = null;
    let buf: Uint8ClampedArray | null = null;
    let bufW = 0;
    let bufH = 0;
    const PAD = 100;
    let cw = 0;
    let ch = 0;
    let startedAt = 0;
    let pausedAt = 0;
    let pauseTotal = 0;

    const sizeCanvas = () => {
      const r = target.getBoundingClientRect();
      cw = r.width + PAD * 2;
      ch = r.height + PAD * 2;
      bufW = Math.round(cw * dpr);
      bufH = Math.round(ch * dpr);
      canvas.width = bufW;
      canvas.height = bufH;
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      canvas.style.left = `${-PAD}px`;
      canvas.style.top = `${-PAD}px`;
      // Reset transform — we draw directly into pixel coordinates
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      imageData = ctx.createImageData(bufW, bufH);
      buf = imageData.data;
      return { width: cw, height: ch, innerW: r.width, innerH: r.height };
    };

    const seedParticles = ({
      width,
      height,
      innerW,
      innerH,
    }: {
      width: number;
      height: number;
      innerW: number;
      innerH: number;
    }) => {
      // Massive density — fine sand grains, tens of thousands of them.
      // We render via a manually-blended ImageData buffer so this many
      // particles still hits 60fps. Adaptive: lighter on small screens.
      const area = innerW * innerH;
      const isMobile = innerW < 600;
      const COUNT = isMobile
        ? Math.min(22000, Math.round(area / 8))
        : Math.min(60000, Math.round(area / 4));

      const list: Particle[] = [];
      const cxc = width / 2;
      const cyc = height / 2;

      // Bar heights — sampled from the actual dashboard bars
      const barHeights = [0.32, 0.56, 0.44, 0.78, 0.64, 0.92, 1.0];

      for (let i = 0; i < COUNT; i++) {
        // Decide where this particle's TARGET should land on the dashboard.
        // Heavier on the silhouette + chart bars; very light interior fill
        // so the formation reads as a clean dashboard, not a noisy cloud.
        const cat = Math.random();
        let tx = 0;
        let ty = 0;

        if (cat < 0.18) {
          // Top chrome band (window dots + URL)
          tx = PAD + Math.random() * innerW;
          ty = PAD + Math.random() * Math.min(innerH * 0.09, 50);
        } else if (cat < 0.55) {
          // Bar chart — the strongest read of "dashboard"
          const barIdx = Math.floor(Math.random() * 7);
          const chartLeft = PAD + innerW * 0.10;
          const chartRight = PAD + innerW * 0.92;
          const chartW = chartRight - chartLeft;
          const slot = chartW / 7;
          const bh = barHeights[barIdx];
          const chartTop = PAD + innerH * 0.55;
          const chartBot = PAD + innerH * 0.84;
          tx = chartLeft + (barIdx + 0.5) * slot + (Math.random() - 0.5) * slot * 0.5;
          const v = Math.pow(Math.random(), 0.6);
          ty = chartBot - v * (chartBot - chartTop) * bh;
        } else if (cat < 0.92) {
          // Frame outline — crisp silhouette
          const side = Math.floor(Math.random() * 4);
          const t = Math.random();
          if (side === 0) {
            tx = PAD + t * innerW;
            ty = PAD + Math.random() * 3;
          } else if (side === 1) {
            tx = PAD + t * innerW;
            ty = PAD + innerH - Math.random() * 3;
          } else if (side === 2) {
            tx = PAD + Math.random() * 3;
            ty = PAD + t * innerH;
          } else {
            tx = PAD + innerW - Math.random() * 3;
            ty = PAD + t * innerH;
          }
        } else {
          // Headline band only — no random interior fill (kept the inside clean)
          tx = PAD + innerW * (0.10 + Math.random() * 0.65);
          ty = PAD + innerH * (0.30 + Math.random() * 0.16);
        }

        // Home (dance) position: scattered around canvas center
        const ang = Math.random() * Math.PI * 2;
        const rr = Math.min(width, height) * (0.20 + Math.random() * 0.50);
        const hx = cxc + Math.cos(ang) * rr;
        const hy = cyc + Math.sin(ang) * rr * 0.85;

        // Each grain carries a baseline position in the gradient palette
        // computed from a diagonal so neighbouring grains sample similar
        // colours. Time offset moves the gradient through the field.
        const diag = (tx + ty * 0.55) / (innerW + innerH * 0.55);

        list.push({
          tx,
          ty,
          hx,
          hy,
          hAmp: 12 + Math.random() * 30,
          seed: Math.random(),
          gradPos: diag + (Math.random() - 0.5) * 0.04,
          stagger: Math.random() * 0.20,
        });
      }
      return list;
    };

    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    // Multi-octave wave field — produces a fluid, sand-being-blown look.
    // Each particle's home position + seed phase-shifts the curves so
    // neighbours move similarly (read as a wave) but never identically.
    const waveX = (p: Particle, time: number) => {
      const t = time * 0.00045;
      const a = p.seed * Math.PI * 2;
      return (
        p.hAmp *
        (Math.sin(t * 1.10 + a) * 0.55 +
          Math.cos(t * 0.72 + p.hy * 0.0125) * 0.30 +
          Math.sin(t * 1.45 + p.hx * 0.0091 + a * 2.1) * 0.22)
      );
    };
    const waveY = (p: Particle, time: number) => {
      const t = time * 0.00045;
      const a = p.seed * Math.PI * 2;
      return (
        p.hAmp *
        (Math.cos(t * 1.00 + a + 1.27) * 0.55 +
          Math.sin(t * 0.84 + p.hx * 0.0114) * 0.30 +
          Math.cos(t * 1.32 + p.hy * 0.0098 + a * 2.1) * 0.22)
      );
    };

    const setReveal = (reveal: number) => {
      target.style.setProperty("--reveal", String(reveal));
      target.style.setProperty("--reveal-blur", `${(1 - reveal) * 24}px`);
      target.style.setProperty("--reveal-scale", String(1 + (1 - reveal) * 0.05));
    };

    const draw = (now: number) => {
      const elapsed = now - startedAt - pauseTotal;
      const cycle = (elapsed % LOOP) / LOOP; // 0..1

      // Phase boundaries inside one loop
      // 0.00 – 0.30   DANCE     (4.8s)
      // 0.30 – 0.50   CONVERGE  (3.2s)
      // 0.50 – 0.72   HOLD      (3.5s)
      // 0.72 – 1.00   DISPERSE  (4.5s)
      let phase: "dance" | "converge" | "hold" | "disperse";
      let phaseT: number;
      let dashboardReveal: number;
      let alphaMul: number;

      // Phase boundaries — DANCE → CONVERGE → HOLD → DISPERSE
      // During HOLD the particles are fully invisible so the dashboard
      // reads completely clean, no shimmer noise sitting on top.
      if (cycle < 0.28) {
        phase = "dance";
        phaseT = cycle / 0.28;
        dashboardReveal = 0;
        alphaMul = 0.78;
      } else if (cycle < 0.48) {
        phase = "converge";
        phaseT = (cycle - 0.28) / 0.20;
        dashboardReveal = easeInOut(phaseT);
        alphaMul = 0.78 * (1 - easeInOut(phaseT)); // → 0 as dashboard takes over
      } else if (cycle < 0.74) {
        phase = "hold";
        phaseT = (cycle - 0.48) / 0.26;
        dashboardReveal = 1;
        alphaMul = 0;
      } else {
        phase = "disperse";
        phaseT = (cycle - 0.74) / 0.26;
        dashboardReveal = 1 - easeInOut(phaseT);
        alphaMul = 0.78 * easeInOut(phaseT); // 0 → 0.78
      }

      setReveal(dashboardReveal);

      // Clear the buffer
      if (!buf || !imageData) {
        raf = requestAnimationFrame(draw);
        return;
      }
      buf.fill(0);

      // HOLD — skip work entirely. The dashboard sits 100% clean.
      if (alphaMul <= 0.001) {
        ctx.putImageData(imageData, 0, 0);
        raf = requestAnimationFrame(draw);
        return;
      }

      const time = elapsed;
      // Gradient flow speed — full sweep every ~6s
      const gradOffset = (time * 0.000165) % 1;
      const W = bufW;
      const H = bufH;

      // Cache for hot loop
      const pal = palette;
      const data = buf;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Compute position for this phase
        const wx = p.hx + waveX(p, time);
        const wy = p.hy + waveY(p, time);

        let px: number;
        let py: number;

        if (phase === "dance") {
          px = wx;
          py = wy;
        } else if (phase === "converge") {
          const s = (phaseT - p.stagger) / (1 - p.stagger);
          const e = s <= 0 ? 0 : s >= 1 ? 1 : easeInOut(s);
          px = wx + (p.tx - wx) * e;
          py = wy + (p.ty - wy) * e;
        } else {
          const s = (phaseT - p.stagger) / (1 - p.stagger);
          const e = s <= 0 ? 0 : s >= 1 ? 1 : easeInOut(s);
          px = p.tx + (wx - p.tx) * e;
          py = p.ty + (wy - p.ty) * e;
        }

        // Sample the moving gradient
        let gp = (p.gradPos + gradOffset) % 1;
        if (gp < 0) gp += 1;
        const palIdx = ((gp * PALETTE_SIZE) | 0) * 3;
        const r = pal[palIdx];
        const g = pal[palIdx + 1];
        const b = pal[palIdx + 2];

        // To pixel coords (DPR-aware)
        const x = (px * dpr) | 0;
        const y = (py * dpr) | 0;
        if (x < 0 || x >= W || y < 0 || y >= H) continue;

        // Manual additive blend so dense overlaps glow softly.
        // Multiply colour by alphaMul and clamp.
        const off = (y * W + x) << 2;
        const ar = (r * alphaMul) | 0;
        const ag = (g * alphaMul) | 0;
        const ab = (b * alphaMul) | 0;
        const aa = (255 * alphaMul) | 0;

        const v0 = data[off] + ar;
        const v1 = data[off + 1] + ag;
        const v2 = data[off + 2] + ab;
        const v3 = data[off + 3] + aa;
        data[off] = v0 > 255 ? 255 : v0;
        data[off + 1] = v1 > 255 ? 255 : v1;
        data[off + 2] = v2 > 255 ? 255 : v2;
        data[off + 3] = v3 > 255 ? 255 : v3;
      }

      ctx.putImageData(imageData, 0, 0);

      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      const dims = sizeCanvas();
      particles = seedParticles(dims);
      if (startedAt === 0) {
        startedAt = performance.now();
      } else {
        // Resume — preserve cycle position
        pauseTotal += performance.now() - pausedAt;
      }
      raf = requestAnimationFrame(draw);
    };

    const pause = () => {
      if (!running) return;
      running = false;
      pausedAt = performance.now();
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          visible = e.isIntersecting;
          if (visible && !running) start();
          else if (!visible && running) pause();
        });
      },
      { threshold: 0.05 }
    );
    io.observe(target);

    const onResize = () => {
      const dims = sizeCanvas();
      particles = seedParticles(dims);
    };
    window.addEventListener("resize", onResize);

    const onVisChange = () => {
      if (document.hidden) pause();
      else if (visible) start();
    };
    document.addEventListener("visibilitychange", onVisChange);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisChange);
    };
  }, [targetRef]);

  return <canvas ref={canvasRef} className="ed-hero__dust" aria-hidden />;
}

/* ──────────────────────────────────────────────
   Tilt-on-hover hero visual
   ────────────────────────────────────────────── */
function useTilt(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;   // -1..1
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      el.style.setProperty("--tx", `${x}`);
      el.style.setProperty("--ty", `${y}`);
    };
    const onLeave = () => {
      el.style.setProperty("--tx", "0");
      el.style.setProperty("--ty", "0");
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [ref]);
}

/* ──────────────────────────────────────────────
   Mirror the header's smart-hide onto the fixed hero logo
   ────────────────────────────────────────────── */
function useLogoSmartHide() {
  useEffect(() => {
    const logo = document.querySelector<HTMLElement>(".ed-hero__logo");
    if (!logo) return;
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 6) return;
      const goingDown = y > lastY;
      if (goingDown && y > 200) logo.classList.add("is-hidden");
      else logo.classList.remove("is-hidden");
      lastY = y <= 0 ? 0 : y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

/* ──────────────────────────────────────────────
   Cursor-tracked spotlight in hero
   ────────────────────────────────────────────── */
function useHeroSpotlight() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const hero = document.querySelector<HTMLElement>(".ed-hero");
    if (!hero) return;
    const onMove = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      hero.style.setProperty("--spot-x", `${x}%`);
      hero.style.setProperty("--spot-y", `${y}%`);
    };
    hero.addEventListener("mousemove", onMove);
    return () => hero.removeEventListener("mousemove", onMove);
  }, []);
}

/* ──────────────────────────────────────────────
   Magnetic hover for primary CTAs
   ────────────────────────────────────────────── */
function useMagneticCTAs() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>(".ed-cta"));
    const handlers: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = [];

    els.forEach((el) => {
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.setProperty("--mx", `${x * 0.18}px`);
        el.style.setProperty("--my", `${y * 0.18}px`);
      };
      const leave = () => {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
      };
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      handlers.push({ el, move, leave });
    });

    return () => {
      handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, []);
}

/* ──────────────────────────────────────────────
   Sticky CTA bar
   ────────────────────────────────────────────── */
function StickyCTA() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className={`ed-stickybar ${visible ? "show" : ""}`} aria-hidden={!visible}>
      <div className="ed-stickybar__inner">
        <div className="ed-stickybar__copy">
          <span className="dot" />
          <strong>Now booking growth audits</strong>
          <small>· 4-hour reply</small>
        </div>
        <button className="ed-cta ed-cta--sm" onClick={openBooking}>
          Get a Free Audit
          <span className="ed-cta__arrow" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const BOOKING_URL = "https://calendly.com/fdr-peakpulse/30min";
const openBooking = () => {
  window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
};

/**
 * Build a reliable Instagram embed URL from any IG permalink.
 * Instagram's /embed endpoint accepts /p/<shortcode> for both posts and reels,
 * so normalising every URL to that format avoids 404s for /reels/ (plural)
 * which is a feed-listing path that doesn't expose embed HTML.
 */
function instagramEmbedUrl(url: string): string {
  const match = url.match(/\/(?:p|reel|reels)\/([^/?#]+)/);
  if (!match) return url;
  return `https://www.instagram.com/p/${match[1]}/embed`;
}

/* Direct Instagram embed iframe — auto-loads the real video thumbnail
   from Instagram. User can play in place via Instagram's own play button.
   No click-to-reveal, no gradient placeholder. */
function InstagramVideoCard({
  url,
  label,
  sub,
  index,
}: {
  url: string;
  label: string;
  sub: string;
  index: number;
}) {
  return (
    <div className="ed-pf-reel__card ed-pf-reel__card--ig">
      <div className="ed-pf-reel__media ed-pf-reel__media--ig">
        <iframe
          src={instagramEmbedUrl(url)}
          allow="autoplay; encrypted-media; fullscreen"
          title={label}
          className="ed-pf-reel__iframe"
          scrolling="no"
          loading="lazy"
        />
      </div>
      <a
        className="ed-pf-reel__caption ed-pf-reel__caption--link"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="ed-pf-reel__num">{String(index + 1).padStart(2, "0")}</span>
        <div>
          <b>{label}</b>
          <small>{sub}</small>
        </div>
        <span className="ed-pf-reel__badge ed-pf-reel__badge--ig">@peakpulseagency</span>
      </a>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Live activity ticker (rotates through booking events)
   ────────────────────────────────────────────── */
function LiveTicker() {
  const events = [
    { city: "Austin",      action: "booked a strategy call",   ago: "2m" },
    { city: "London",      action: "received their audit",     ago: "8m" },
    { city: "Toronto",     action: "kicked off a sprint",      ago: "21m" },
    { city: "Singapore",   action: "booked a strategy call",   ago: "44m" },
    { city: "New York",    action: "renewed their retainer",   ago: "1h" },
    { city: "Manila",      action: "shipped their new site",   ago: "1h" },
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % events.length), 3800);
    return () => clearInterval(id);
  }, [events.length]);
  const e = events[i];
  return (
    <div className="ed-ticker" aria-live="polite">
      <span className="ed-ticker__pulse" />
      <span className="ed-ticker__text" key={i}>
        Someone in <b>{e.city}</b> just {e.action} <small>· {e.ago} ago</small>
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Portfolio mode switcher
   ────────────────────────────────────────────── */
type PortfolioMode = "video" | "carousel" | "magazine";

/* Video reel content — Drive videos play inline, Instagram links open in a new tab */
type ReelVideo =
  | { type: "drive";     id: string; label: string; sub: string }
  | { type: "instagram"; url: string; label: string; sub: string };

const reelVideos: ReelVideo[] = [
  // Google Drive — cinematic in-house edits, play inline
  { type: "drive",     id: "1-sJt5qVJJzFUfPVGqMe_qzqqRuj8BoYw", label: "Cinematic edit",  sub: "Brand film · in-house" },
  { type: "drive",     id: "1zgqIwtwt9iS9W-czdaqhNmU5ZsE75-_Y", label: "Brand cut",       sub: "Product cinematic"   },
  { type: "drive",     id: "1ETswj63OoENx8h-aUJajzq0nB1enzRaL", label: "Campaign cut",    sub: "Story-led narrative" },
  { type: "drive",     id: "1vXGjatdPn55_IpuUTTBhF-OvAp8DJjyj", label: "Founder story",   sub: "Documentary"         },
  { type: "drive",     id: "1dUna087dq8INuIAINoUPFpwwRHNyDFkj", label: "Launch reel",     sub: "Cinematic"           },
  { type: "drive",     id: "1_rFjz7dsH2cAXORTXddWW9NXtslx8Ox2", label: "Anthem film",     sub: "Brand film"          },

  // Instagram — Reels & posts published on @peakpulseagency
  { type: "instagram", url: "https://www.instagram.com/p/DXaReSRjPnJ/",     label: "Spotlight",       sub: "IG Post"  },
  { type: "instagram", url: "https://www.instagram.com/p/DXaRA3nit5s/",     label: "Editorial drop",  sub: "IG Post"  },
  { type: "instagram", url: "https://www.instagram.com/p/DXaQQ9dDuSc/",     label: "Brand frame",     sub: "IG Post"  },
  { type: "instagram", url: "https://www.instagram.com/p/DXY7O_-iR3W/",     label: "Studio cut",      sub: "IG Post"  },
  { type: "instagram", url: "https://www.instagram.com/p/DW3bak8DKi_/",     label: "Field journal",   sub: "IG Post"  },
  { type: "instagram", url: "https://www.instagram.com/reels/C-BX97cixTi/", label: "Reel · client",   sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reels/C9ULz54SmaX/", label: "Reel · launch",   sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reels/C9b61BASC89/", label: "Reel · campaign", sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reels/C8_VS-byODA/", label: "Reel · story",    sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reels/C85jZZVS6oJ/", label: "Reel · product",  sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reels/C8taOdCSlLV/", label: "Reel · brand",    sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reels/DWk19Gmj9uS/", label: "Reel · cut",      sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reel/DTMNv41D-w1/",  label: "Reel · short",    sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reel/DS66BwbgPJK/",  label: "Reel · edit",     sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reels/DSJvyvoCIlH/", label: "Reel · feature",  sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reels/DQL0GOUjdx5/", label: "Reel · drop",     sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reel/DXrSRFvEkeL/",  label: "Reel · spotlight",sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reel/DXMb0cJADAX/",  label: "Reel · feature",  sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reel/DXKPWm2Dny5/",  label: "Reel · journal",  sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reel/DXEsuPegHZy/",  label: "Reel · series",   sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reel/DVbT69OCePE/",  label: "Reel · campaign", sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reel/DUMBy9HEag8/",  label: "Reel · brand",    sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reel/DTgZsKSFSYD/",  label: "Reel · launch",   sub: "IG Reel"  },
  { type: "instagram", url: "https://www.instagram.com/reel/DSlOJszE8zH/",  label: "Reel · cut",      sub: "IG Reel"  },
];

/* Filter categories shown above the website grid */
const portfolioCategories = [
  { id: "all",      label: "All work" },
  { id: "capital",  label: "Capital" },
  { id: "tech",     label: "Tech & AI" },
  { id: "maritime", label: "Maritime" },
  { id: "travel",   label: "Travel" },
  { id: "retail",   label: "Retail" },
  { id: "studio",   label: "Studio" },
  { id: "services", label: "Services" },
] as const;

type PortfolioCategory = typeof portfolioCategories[number]["id"];

/* Real client work — live builds across capital, maritime,
   hospitality, e-commerce, AI, brand and entertainment. */
const portfolioProjects: Array<{
  tag: string;
  title: string;
  note: string;
  url: string;
  grad: string;
  category: Exclude<PortfolioCategory, "all">;
}> = [
  // Capital & Finance
  { tag: "Capital",       title: "MIR Capital",                note: "Investment firm · brand + site",                  url: "https://www.mir-capital.com/",                       grad: "linear-gradient(135deg,#1A2438 0%,#0F1624 100%)", category: "capital" },
  { tag: "Capital",       title: "S.W. Mitchell Capital",      note: "Boutique investment manager",                     url: "https://www.swmitchellcapital.com/",                 grad: "linear-gradient(135deg,#0F1624 0%,#0B0F18 100%)", category: "capital" },
  { tag: "Bridge Funds",  title: "SWMC Bridge Fund Services",  note: "Fund services portal",                            url: "https://www.swmc-bridgefundservices.com/login",      grad: "linear-gradient(135deg,#1A2438 0%,#0B0F18 100%)", category: "capital" },
  { tag: "Capital",       title: "Damus Capital",              note: "Investment platform",                             url: "https://www.damuscapital.com/",                      grad: "linear-gradient(135deg,#0F1624 0%,#1A2438 100%)", category: "capital" },
  { tag: "Partners",      title: "Profin Partners",            note: "Capital advisory firm",                           url: "https://www.profinpartners.com",                     grad: "linear-gradient(135deg,#1A2438 0%,#131B2A 100%)", category: "capital" },
  { tag: "Investors",     title: "Osprey Investors",           note: "Investor relations platform",                     url: "https://www.osprey-investors.com",                   grad: "linear-gradient(135deg,#0B0F18 0%,#1A2438 100%)", category: "capital" },
  { tag: "Investments",   title: "Abrahamic Investments",      note: "Multi-asset investment firm",                     url: "https://www.abrahamicinvestments.com/",              grad: "linear-gradient(135deg,#131B2A 0%,#0F1624 100%)", category: "capital" },
  { tag: "Capital",       title: "Resolve Capital",            note: "Strategic capital partners",                      url: "https://www.resolvecap.com/",                        grad: "linear-gradient(135deg,#0F1624 0%,#1A2438 100%)", category: "capital" },
  { tag: "Capital",       title: "Steinridge",                 note: "Wealth management",                               url: "https://www.steinridge.com/",                        grad: "linear-gradient(135deg,#1A2438 0%,#0B0F18 100%)", category: "capital" },

  // Tech / AI / Crypto
  { tag: "AI Services",   title: "BMC AI Services",            note: "AI workflow & integration suite",                 url: "https://bmcaiservices.britishmediacompany.com/",     grad: "linear-gradient(135deg,#FF5C5C 0%,#00D4AA 100%)", category: "tech" },
  { tag: "Marketing AI",  title: "Viral Scale",                note: "AI growth & content engine",                      url: "https://viral-scale.com/",                           grad: "linear-gradient(135deg,#FF5C5C 0%,#FF8B5C 100%)", category: "tech" },
  { tag: "Web3",          title: "Ledger Rocket",              note: "Crypto launchpad & analytics",                    url: "https://ledgerrocket.com",                           grad: "linear-gradient(135deg,#0BB89A 0%,#00D4AA 100%)", category: "tech" },
  { tag: "Tech",          title: "Singularity Group",          note: "Innovation & technology firm",                    url: "https://www.singularity-group.com",                  grad: "linear-gradient(135deg,#1A2438 0%,#0BB89A 100%)", category: "tech" },

  // Maritime / Industrial
  { tag: "Marine Tech",   title: "Atmosnav",                   note: "Marine navigation systems",                       url: "https://www.atmosnav.com/",                          grad: "linear-gradient(135deg,#0BB89A 0%,#1A2438 100%)", category: "maritime" },
  { tag: "Shipping",      title: "Supersonic Ship",            note: "Maritime logistics platform",                     url: "https://www.supersonicship.com/",                    grad: "linear-gradient(135deg,#0F1624 0%,#0BB89A 100%)", category: "maritime" },
  { tag: "Maritime",      title: "Ocean Sea",                  note: "Ocean shipping operations",                       url: "https://www.ocean-sea.com/",                         grad: "linear-gradient(135deg,#0BB89A 0%,#0F1624 100%)", category: "maritime" },
  { tag: "Maritime",      title: "Sovamar",                    note: "Marine services & charter",                       url: "https://www.sovamar.com/",                           grad: "linear-gradient(135deg,#1A2438 0%,#00D4AA 100%)", category: "maritime" },
  { tag: "Industrial",    title: "Rocket Industries",          note: "Engineering & industrial brand",                  url: "https://rocketindustries.co.uk/",                    grad: "linear-gradient(135deg,#FF5C5C 0%,#1A2438 100%)", category: "maritime" },

  // Travel & Hospitality
  { tag: "Luxury Travel", title: "Berkeley Travel",            note: "Bespoke travel concierge",                        url: "https://berkeleytravel.co.uk/",                      grad: "linear-gradient(135deg,#FF8B5C 0%,#FF5C5C 100%)", category: "travel" },
  { tag: "Travel",        title: "Berkley Travel",             note: "Booking platform · Vercel build",                 url: "https://berkley-travel.vercel.app/",                 grad: "linear-gradient(135deg,#FF5C5C 0%,#FF8B5C 100%)", category: "travel" },
  { tag: "Residences",    title: "M Residences Budapest",      note: "Luxury residences booking site",                  url: "https://www.mresidencesbudapest.com/",               grad: "linear-gradient(135deg,#FF8B5C 0%,#00D4AA 100%)", category: "travel" },
  { tag: "Hospitality",   title: "Mister Nice Mayfair",        note: "Members club · brand site",                       url: "https://misternicemayfair.com",                      grad: "linear-gradient(135deg,#FF5C5C 0%,#1A2438 100%)", category: "travel" },

  // E-commerce & Lifestyle
  { tag: "E-commerce",    title: "Kinzer Coins",               note: "Numismatic store · custom build",                 url: "https://kinzercoins.com/",                           grad: "linear-gradient(135deg,#FF8B5C 0%,#FFB050 100%)", category: "retail" },
  { tag: "Jewelry",       title: "Top Jewels",                 note: "Fine jewelry e-commerce",                         url: "https://www.topjewels.info/",                        grad: "linear-gradient(135deg,#FFB050 0%,#FF5C5C 100%)", category: "retail" },
  { tag: "Spirits",       title: "JD Spirits",                 note: "Premium spirits brand",                           url: "https://www.jdspirits.uk/",                          grad: "linear-gradient(135deg,#FF8B5C 0%,#1A2438 100%)", category: "retail" },
  { tag: "Watches",       title: "Manufacture Vendôme",        note: "Luxury timepieces · Shopify",                     url: "https://manufacture-vendome.myshopify.com/",         grad: "linear-gradient(135deg,#1A2438 0%,#FF8B5C 100%)", category: "retail" },
  { tag: "Lifestyle",     title: "Ruthbergs",                  note: "Lifestyle brand site",                            url: "https://www.ruthbergs.com/",                         grad: "linear-gradient(135deg,#FF5C5C 0%,#0BB89A 100%)", category: "retail" },
  { tag: "Sport",         title: "Goals Not Gigs",             note: "Athlete career platform",                         url: "https://goalsnotgigs.com",                           grad: "linear-gradient(135deg,#00D4AA 0%,#FF5C5C 100%)", category: "retail" },
  { tag: "Fitness",       title: "Fitasy",                     note: "Fitness coaching platform",                       url: "https://fitasy.com/",                                grad: "linear-gradient(135deg,#0BB89A 0%,#FF8B5C 100%)", category: "retail" },

  // Brand · Studio · Entertainment
  { tag: "Brand",         title: "Star Ancients",              note: "Heritage brand storytelling",                     url: "https://startancients.com/",                         grad: "linear-gradient(135deg,#FFB050 0%,#FF5C5C 100%)", category: "studio" },
  { tag: "Design",        title: "Nohan Design",               note: "Architecture & interior portfolio",               url: "https://www.nohandesign.com/",                       grad: "linear-gradient(135deg,#1A2438 0%,#FF8B5C 100%)", category: "studio" },
  { tag: "Studios",       title: "MX Studios",                 note: "Production studio site",                          url: "https://www.mxstudios.com/",                         grad: "linear-gradient(135deg,#FF5C5C 0%,#0F1624 100%)", category: "studio" },
  { tag: "Film",          title: "ES Movie Productions",       note: "Film production company",                         url: "https://www.esmovieproductions.com/",                grad: "linear-gradient(135deg,#0F1624 0%,#FF5C5C 100%)", category: "studio" },
  { tag: "Music Venue",   title: "Bush Hall Music",            note: "Historic London music venue",                     url: "https://bushhallmusic.co.uk/",                       grad: "linear-gradient(135deg,#FF5C5C 0%,#FFB050 100%)", category: "studio" },

  // Professional Services
  { tag: "Services",      title: "CCDF",                       note: "Swiss professional services",                     url: "https://www.ccdf.ch/",                               grad: "linear-gradient(135deg,#0F1624 0%,#0BB89A 100%)", category: "services" },
  { tag: "Law",           title: "Isufi Law",                  note: "Albanian legal practice",                         url: "https://www.isufilaw.al/",                           grad: "linear-gradient(135deg,#1A2438 0%,#0F1624 100%)", category: "services" },
];

/* ──────────────────────────────────────────────
   Brand-gradient SVG def (used by tile + bridge paths)
   ────────────────────────────────────────────── */
function GradientDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        <linearGradient id="peakGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF5C5C" />
          <stop offset="100%" stopColor="#00D4AA" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ──────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────── */
export default function EditorialLanding() {
  useRevealOnScroll();
  useMagneticCTAs();
  useHeroSpotlight();
  useLogoSmartHide();
  const heroVisualRef = useRef<HTMLDivElement>(null);
  useTilt(heroVisualRef);
  const [portfolioMode, setPortfolioMode] = useState<PortfolioMode>("carousel");
  const [pfFilter, setPfFilter] = useState<string>("all");


  return (
    <div className="ed-shell">
      <div className="ed-metal-shine" aria-hidden />
      <GradientDefs />
      <ScrollProgress />
      <StickyCTA />

      {/* ════════════════════════════════════════
          1 · HERO
          ════════════════════════════════════════ */}
      <section className="ed-hero" id="top">
        <div className="ed-hero__rule" />
        <div className="ed-wrap ed-hero__grid">
          <div className="ed-hero__copy">
            <div className="ed-hero__logo" aria-hidden="false">
              {/* Six shards · clipped pieces of the logo flying in from scattered positions */}
              {[
                { clip: "polygon(0% 0%,    50% 0%,   50% 35%,  0% 35%)",   dx: -180, dy: -120, rot: -22, delay: 0.00 },
                { clip: "polygon(50% 0%,   100% 0%,  100% 35%, 50% 35%)",  dx:  180, dy: -120, rot:  22, delay: 0.06 },
                { clip: "polygon(0% 35%,   50% 35%, 50% 65%,  0% 65%)",    dx: -240, dy:    0, rot: -10, delay: 0.12 },
                { clip: "polygon(50% 35%,  100% 35%, 100% 65%, 50% 65%)",  dx:  240, dy:    0, rot:  10, delay: 0.18 },
                { clip: "polygon(0% 65%,   50% 65%, 50% 100%, 0% 100%)",   dx: -180, dy:  120, rot: -28, delay: 0.24 },
                { clip: "polygon(50% 65%,  100% 65%, 100% 100%, 50% 100%)",dx:  180, dy:  120, rot:  28, delay: 0.30 },
              ].map((s, i) => (
                <Image
                  key={i}
                  src="/logo.png"
                  alt=""
                  aria-hidden
                  width={320}
                  height={320}
                  className="ed-hero__logo-shard"
                  priority
                  style={
                    {
                      clipPath: s.clip,
                      WebkitClipPath: s.clip,
                      "--dx": `${s.dx}px`,
                      "--dy": `${s.dy}px`,
                      "--rot": `${s.rot}deg`,
                      "--delay": `${s.delay}s`,
                    } as React.CSSProperties
                  }
                />
              ))}
              {/* Settled logo — fades in once the shards have assembled */}
              <Image
                src="/logo.png"
                alt="PeakPulse Agency"
                width={320}
                height={320}
                className="ed-hero__logo-mark"
                priority
              />
              <span className="ed-hero__logo-glow" />
            </div>

            <div className="ed-hero__meta reveal delay-1">
              <span className="dot" />
              <span>Vol. 04 · 2026 Edition</span>
              <span className="pipe">/</span>
              <span>Puerto Princesa, Philippines · Worldwide</span>
            </div>

            <h1 className="ed-hero__title reveal delay-2">
              Amplify your<br />
              <em>digital growth.</em><br />
              <b>Built for businesses<br />ready to scale.</b>
            </h1>

            <div className="ed-hero__under">
              <p className="ed-hero__lede reveal delay-3">
                <strong>PeakPulse Agency</strong> is a performance-driven digital
                solutions firm delivering web development, social media management,
                content production, and a full growth engine, all in one
                accountable monthly package.
              </p>

              <div className="ed-hero__cta-row reveal delay-3">
                <button onClick={openBooking} className="ed-cta">
                  Get a Free Audit
                  <span className="ed-cta__arrow" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
                    </svg>
                  </span>
                </button>
                <button onClick={() => scrollTo("services")} className="ed-link">
                  ↓ See Services
                </button>
              </div>

              <div className="ed-hero__proof reveal delay-4">
                <div className="ed-hero__proof-stars">★★★★★</div>
                <div>
                  <b>4.96 / 5</b> &nbsp;·&nbsp; trusted by businesses across
                  hospitality, SaaS &amp; e-commerce
                </div>
              </div>

              <div className="ed-hero__live reveal delay-4">
                <LiveTicker />
              </div>
            </div>
          </div>

          {/* Hero visual stack */}
          <div className="ed-hero__visual ed-hero__visual--dust reveal delay-2" ref={heroVisualRef}>
            <DustReveal targetRef={heroVisualRef} />
            <div className="ed-frame ed-frame--back" aria-hidden />
            <div className="ed-frame ed-frame--main">
              <div className="ed-frame__chrome">
                <span /><span /><span />
                <span className="url">peakpulse.agency / dashboard</span>
              </div>
              <div className="ed-frame__body">
                <span className="ed-frame__pill">Live · Client cohort</span>
                <h3 className="ed-frame__h">
                  Engagement up <em>+218%</em><br />month over month.
                </h3>
                <div className="ed-frame__bars" aria-hidden>
                  <span /><span /><span /><span /><span /><span /><span />
                </div>
                <div className="ed-frame__row">
                  <span>30-DAY REACH · <b>1.4M</b></span>
                  <span>CTR · <b>+38%</b></span>
                </div>
              </div>
            </div>

            <div className="ed-callout ed-callout--top">
              <span className="ed-callout__chip">↑</span>
              <div>
                <small>Conversion lift</small>
                <b>+ 312%</b>
              </div>
            </div>
            <div className="ed-callout ed-callout--bottom">
              <span className="ed-callout__chip ed-callout__chip--coral">★</span>
              <div>
                <small>Client review</small>
                <b>4.96 / 5</b>
              </div>
            </div>
          </div>

          <div className="ed-hero__scroll" aria-hidden>
            <span>Scroll</span>
            <span className="line" />
            <span>01 / 09</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          2 · CREDIBILITY STRIP — marquee
          ════════════════════════════════════════ */}
      <section className="ed-trust">
        <div className="ed-wrap ed-trust__inner">
          <div className="ed-trust__label reveal">Trusted by businesses</div>
          <div className="ed-trust__marquee reveal delay-1" aria-hidden>
            <div className="ed-trust__track">
              {[0, 1].map((dup) => (
                <ul key={dup} className="ed-trust__logos">
                  {[
                    // invert: true = the logo is dark/black and gets converted to white for visibility
                    // invert: false = the logo already reads on a dark background, keep original color
                    { src: "/company-logos/british-media-company.png",  alt: "British Media Company", invert: true  },
                    { src: "/company-logos/damus-capital.svg",          alt: "Damus Capital",         invert: true  },
                    { src: "/company-logos/abrahamic-investments.webp", alt: "Abrahamic Investments", invert: false },
                    { src: "/company-logos/profin-partners.svg",        alt: "ProFin Partners",       invert: false },
                    { src: "/company-logos/resolve-capital.svg",        alt: "Resolve Capital",       invert: false },
                    { src: "/company-logos/osprey.svg",                 alt: "Osprey",                invert: false },
                    { src: "/company-logos/marriott-budapest.png",      alt: "Marriott Budapest",     invert: true  },
                    { src: "/company-logos/berkeley-travel.svg",        alt: "Berkeley Travel",       invert: false },
                    { src: "/company-logos/kinzercoins.png",            alt: "Kinzer Coins",          invert: false },
                    { src: "/company-logos/jd-spirits.webp",            alt: "JD Spirits",            invert: false },
                    { src: "/company-logos/star.png",                   alt: "Star Ancients",         invert: false },
                    { src: "/company-logos/southwest-sips.png",         alt: "Southwest Sips",        invert: false },
                    { src: "/company-logos/big5-vape-shop.png",         alt: "Big5 Vape Shop",        invert: true  },
                    { src: "/company-logos/a-home-touch.png",           alt: "A Home Touch",          invert: false },
                    { src: "/company-logos/verde-group-ai.png",         alt: "Verde Group AI",        invert: false },
                    { src: "/company-logos/singularity-group.svg",      alt: "The Singularity Group", invert: false },
                    { src: "/company-logos/ledger-rocket.svg",          alt: "Ledger Rocket",         invert: true  },
                    { src: "/company-logos/supersonicship.svg",         alt: "Supersonic Ship",       invert: false },
                    { src: "/company-logos/bridgemaster.webp",          alt: "Bridge Master",         invert: true  },
                  ].map((logo) => (
                    <li key={`${dup}-${logo.alt}`} className={logo.invert ? "is-dark" : undefined}>
                      <img src={logo.src} alt={logo.alt} loading="lazy" />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
          <div className="ed-trust__rating reveal delay-2">
            <span className="ed-trust__stars">★★★★★</span>
            <span className="ed-trust__rating-text">
              <b>4.96</b> avg · 142 verified projects
            </span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          3 · METRICS
          ════════════════════════════════════════ */}
      <section className="ed-metrics">
        <div className="ed-wrap">
          <div className="ed-metrics__head">
            <h2 className="ed-metrics__title reveal">
              Real results, <em>real growth.</em>
            </h2>
            <p className="ed-metrics__sub reveal delay-1">
              Twelve months of outcomes from clients across hospitality, SaaS,
              e-commerce and professional services.
            </p>
          </div>

          <div className="ed-metrics__grid">
            <div className="ed-metric reveal">
              <div className="ed-metric__value"><Counter to={36} suffix="+" /></div>
              <div className="ed-metric__label">Live client sites</div>
            </div>
            <div className="ed-metric reveal delay-1">
              <div className="ed-metric__value"><Counter to={6} /></div>
              <div className="ed-metric__label">Disciplines, one team</div>
            </div>
            <div className="ed-metric reveal delay-2">
              <div className="ed-metric__value"><Counter to={4} suffix="pkg" /></div>
              <div className="ed-metric__label">Service packages</div>
            </div>
            <div className="ed-metric reveal delay-3">
              <div className="ed-metric__value"><Counter to={4} suffix="h" /></div>
              <div className="ed-metric__label">Reply promise</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          4 · WHAT WE DO — bento services
          ════════════════════════════════════════ */}
      <section className="ed-bento" id="services">
        <div className="ed-wrap">
          <div className="ed-bento__head">
            <span className="eyebrow ed-bento__eyebrow reveal">What we do</span>
            <h2 className="ed-bento__title reveal delay-1">
              Web, social, content &amp; <em>growth</em><br />
              under one roof.
            </h2>
            <p className="ed-bento__lede reveal delay-2">
              Six disciplines, one accountable team. Every package combines
              web development, social media, content production, and a
              full-stack growth engine. Measured on outcomes, not deliverables.
            </p>
          </div>

          <div className="ed-bento__grid">
            <article className="ed-tile ed-tile--A reveal">
              <div>
                <div className="ed-tile__index">
                  <span>01 / Web Development</span>
                  <span className="tag">Engineered</span>
                </div>
                <h3 className="ed-tile__h">
                  Websites that <em>convert</em><br />while they sleep.
                </h3>
                <p className="ed-tile__p">
                  From a single-page CMS to a full custom CRM. Landing pages,
                  dynamic CMS builds, custom front-ends &amp; back-ends, and
                  full migration support. Lighthouse 100 as the floor.
                </p>
              </div>
              <div className="ed-tile__visual">
                <div className="ed-tile__visual-curve">
                  <svg viewBox="0 0 400 160" preserveAspectRatio="none">
                    <path d="M 0,140 C 60,140 90,130 130,110 C 180,82 220,50 280,30 C 320,20 360,12 400,8" />
                    <circle cx="400" cy="8" r="5" />
                  </svg>
                </div>
              </div>
            </article>

            <article className="ed-tile ed-tile--B reveal delay-1">
              <div className="ed-tile__index">
                <span>02 / Social Media Management</span>
                <span className="tag">On-brand</span>
              </div>
              <h3 className="ed-tile__h">
                Brand voice, <em>scaled</em> across every channel.
              </h3>
              <p className="ed-tile__p">
                3 to 7 posts per week per channel, weekend coverage on Growth+
                tiers, content strategy, and reporting across up to 6 connected
                accounts (Instagram, TikTok, LinkedIn, X, Facebook, YouTube).
              </p>
              <div className="ed-tile__chips">
                <span>Strategy</span>
                <span>Calendar</span>
                <span>Creative</span>
                <span>Community</span>
              </div>
            </article>

            <article className="ed-tile ed-tile--C reveal delay-2">
              <div className="ed-tile__index">
                <span>03 / Content Production</span>
                <span className="tag">Cinematic</span>
              </div>
              <div>
                <h3 className="ed-tile__h">Story-led content, end-to-end.</h3>
                <p className="ed-tile__p">
                  4 to 10+ videos, 2 to 5+ carousels, and single-post graphics
                  every month. Reels, brand films, and product cinematics,
                  directed, scored, and colour-graded in-house.
                </p>
              </div>
              <div className="big">↑ <em>10×</em><sup>video / month</sup></div>
            </article>

            <article className="ed-tile ed-tile--D reveal delay-3">
              <div className="ed-tile__index">
                <span>04 / Growth Engine</span>
                <span className="tag">Performance</span>
              </div>
              <h3 className="ed-tile__h">
                The full <em>acquisition</em> stack, in one team.
              </h3>
              <ul className="ed-tile__list">
                <li>Email campaigns (1 / week → 2 / week)</li>
                <li>GEO &amp; SEO programs</li>
                <li>Meta &amp; Google Ads management</li>
                <li>Marketing automation &amp; CRM hygiene</li>
              </ul>
            </article>

            <article className="ed-tile ed-tile--E reveal delay-2">
              <div className="ed-tile__index">
                <span>05 / Branding &amp; Copy</span>
                <span className="tag">Foundational</span>
              </div>
              <h3 className="ed-tile__h">Identity that <em>actually</em> ships.</h3>
              <p className="ed-tile__p">
                Branding and rebranding, messaging frameworks, and copywriting
                across every surface: site, email, ads, social, and decks.
              </p>
            </article>

            <article className="ed-tile ed-tile--F reveal delay-3">
              <div className="ed-tile__index">
                <span>06 / Lead Generation &amp; Custom</span>
                <span className="tag">Bespoke</span>
              </div>
              <h3 className="ed-tile__h">
                Custom builds for <em>singular businesses.</em>
              </h3>
              <p className="ed-tile__p">
                Lead generation programs, booking systems, e-commerce
                storefronts, internal tooling, and SaaS dashboards. Engineered
                around your workflow, not a template.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          4.5 · PORTFOLIO — video / carousel / magazine
          ════════════════════════════════════════ */}
      <section className="ed-portfolio" id="portfolio">
        <div className="ed-wrap">
          <div className="ed-portfolio__head">
            <span className="eyebrow reveal">Selected work</span>
            <h2 className="ed-portfolio__title reveal delay-1">
              Look at the <em>work,</em><br />
              not the agency.
            </h2>
            <p className="ed-portfolio__lede reveal delay-2">
              A selection of recent client engagements. Switch between modes to
              see the work in motion, side-by-side, or laid out editorial style.
            </p>
            <div className="ed-portfolio__tabs reveal delay-3" role="tablist">
              {(["carousel", "magazine", "video"] as PortfolioMode[]).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={portfolioMode === m}
                  className={`ed-portfolio__tab ${portfolioMode === m ? "active" : ""}`}
                  onClick={() => setPortfolioMode(m)}
                >
                  {m === "video" ? "Video reel" : m === "carousel" ? "Website" : "Magazine"}
                </button>
              ))}
              <span className="ed-portfolio__tab-thumb" data-mode={portfolioMode} />
            </div>
          </div>

          {/* === VIDEO REEL === */}
          {portfolioMode === "video" && (
            <div className="ed-pf-reel ed-pf-enter" key="video">
              <div className="ed-pf-reel__intro">
                <span className="ed-pf-reel__label">
                  <span className="rec" />
                  Live reel · {reelVideos.length} pieces
                </span>
                <p>
                  A live selection of cinematic edits and short-form social content produced
                  in-house. Direction, score, colour grade, and edit all under one roof.
                </p>
              </div>
              <div className="ed-pf-reel__grid">
                {reelVideos.map((v, i) =>
                  v.type === "drive" ? (
                    <div className="ed-pf-reel__card" key={`drive-${v.id}`}>
                      <div className="ed-pf-reel__media">
                        <iframe
                          src={`https://drive.google.com/file/d/${v.id}/preview`}
                          allow="autoplay"
                          loading="lazy"
                          title={v.label}
                          className="ed-pf-reel__iframe"
                        />
                      </div>
                      <div className="ed-pf-reel__caption">
                        <span className="ed-pf-reel__num">{String(i + 1).padStart(2, "0")}</span>
                        <div>
                          <b>{v.label}</b>
                          <small>{v.sub}</small>
                        </div>
                        <span className="ed-pf-reel__badge ed-pf-reel__badge--drive">In-house</span>
                      </div>
                    </div>
                  ) : (
                    <InstagramVideoCard
                      key={`ig-${v.url}`}
                      url={v.url}
                      label={v.label}
                      sub={v.sub}
                      index={i}
                    />
                  )
                )}
              </div>
            </div>
          )}

          {/* === CAROUSEL · WEBSITE GRID === */}
          {portfolioMode === "carousel" && (
            <div className="ed-pf-carousel ed-pf-enter" key={`carousel-${pfFilter}`}>
              <div className="ed-pf-filters" role="tablist">
                {portfolioCategories.map((cat) => {
                  const count = cat.id === "all"
                    ? portfolioProjects.length
                    : portfolioProjects.filter((p) => p.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      role="tab"
                      aria-selected={pfFilter === cat.id}
                      className={`ed-pf-filters__chip ${pfFilter === cat.id ? "active" : ""}`}
                      onClick={() => setPfFilter(cat.id)}
                    >
                      {cat.label}
                      <span className="ed-pf-filters__count">{count}</span>
                    </button>
                  );
                })}
              </div>
              <div className="ed-pf-carousel__track">
                {portfolioProjects
                  .filter((p) => pfFilter === "all" || p.category === pfFilter)
                  .map((c, i) => (
                  <a
                    className="ed-pf-card"
                    key={c.title}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="ed-pf-card__visual" style={{ background: c.grad }}>
                      <img
                        className="ed-pf-card__shot"
                        src={`https://api.microlink.io/?url=${encodeURIComponent(c.url)}&screenshot=true&meta=false&embed=screenshot.url`}
                        alt={`${c.title} preview`}
                        loading="lazy"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                      <span className="ed-pf-card__num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="ed-pf-card__shine" />
                      <span className="ed-pf-card__open" aria-hidden>↗</span>
                    </div>
                    <div className="ed-pf-card__body">
                      <span className="ed-pf-card__tag">{c.tag}</span>
                      <h3>{c.title}</h3>
                      <p>{c.note}</p>
                    </div>
                  </a>
                ))}
              </div>
              <div className="ed-pf-carousel__hint">
                <span>← scroll · {portfolioProjects.filter((p) => pfFilter === "all" || p.category === pfFilter).length} live builds →</span>
              </div>
            </div>
          )}

          {/* === MAGAZINE === */}
          {portfolioMode === "magazine" && (
            <div className="ed-pf-mag ed-pf-enter" key="magazine">
              <article
                className="ed-pf-mag__feature"
                onClick={() => window.open("https://www.mresidencesbudapest.com/", "_blank")}
                role="link"
                tabIndex={0}
              >
                <div className="ed-pf-mag__cover">
                  <span className="ed-pf-mag__issue">Issue 04 · Spring 2026</span>
                  <h3>M Residences Budapest</h3>
                  <p className="ed-pf-mag__deck">
                    A heritage residence rewrites its booking funnel and reclaims
                    direct revenue from the OTA giants in just under a quarter.
                  </p>
                  <div className="ed-pf-mag__byline">
                    <span>Cover story · 12 min read</span>
                    <span>mresidencesbudapest.com</span>
                  </div>
                </div>
              </article>
              <div className="ed-pf-mag__side">
                {[
                  { kicker: "Studio · Volume 01",  title: "Editorial deck · Volume 01",   read: "Open in Canva", type: "canva", id: "DAG5CrRWpwU", token: "6U6CnwYl0Aoge-QpGLrgug", url: "https://canva.link/kr7qjl00h7tp3ne" },
                  { kicker: "Studio · Volume 02",  title: "Editorial deck · Volume 02",   read: "Open in Canva", type: "canva", id: "DAG5CJGBKfU", token: "hvvntRKNAZ84sI7DMYP8Ug", url: "https://canva.link/91xbzay0yovn7h9" },
                  { kicker: "Studio · Volume 03",  title: "Editorial deck · Volume 03",   read: "Open in Canva", type: "canva", id: "DAGZqRbWGf0", token: "IVv6bF79BN5BrMVmrC624w", url: "https://canva.link/6pzd3yed1xuz528" },
                  { kicker: "Studio · Volume 04",  title: "Editorial deck · Volume 04",   read: "Open in Canva", type: "canva", id: "DAG5CDbckrw", token: "CsbaCrkXKrtlcavGiiQscQ", url: "https://canva.link/hr2t94jl7d7h2s3" },
                  { kicker: "Studio · Volume 05",  title: "Editorial deck · Volume 05",   read: "Open in Canva", type: "canva", id: "DAGXAVnbmv4", token: "bitSTDdM8SwJGHbvXcK5gA", url: "https://www.canva.com/design/DAGXAVnbmv4/bitSTDdM8SwJGHbvXcK5gA/view" },
                  { kicker: "Studio · Portfolio", title: "Selected works · live site",   read: "Open the site", type: "site",  id: "",            token: "",                       url: "https://portfolio2-seven-mauve.vercel.app/" },
                ].map((m) => (
                  <article className="ed-pf-mag__story" key={m.title}>
                    <div className="ed-pf-mag__embed">
                      <iframe
                        src={
                          m.type === "site"
                            ? m.url
                            : `https://www.canva.com/design/${m.id}/${m.token}/view?embed&autoplay=true&loop=true&hideUI=true`
                        }
                        loading="lazy"
                        allow="autoplay; fullscreen"
                        title={m.title}
                      />
                    </div>
                    <a
                      className="ed-pf-mag__story-meta"
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="ed-pf-mag__kicker">{m.kicker}</span>
                      <h4>{m.title}</h4>
                      <span className="ed-pf-mag__read">{m.read} ↗</span>
                    </a>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════
          5 · TRANSFORMATION
          ════════════════════════════════════════ */}
      <section className="ed-trans">
        <div className="ed-wrap">
          <div className="ed-trans__head">
            <span className="eyebrow reveal">How we help you scale</span>
            <h2 className="ed-trans__title reveal delay-1">
              From scattered presence,<br />
              to a <em>compounding asset.</em>
            </h2>
            <p className="ed-trans__lede reveal delay-2">
              Most businesses don&apos;t need more channels. They need the
              ones they already have, working together. Here&apos;s the shift
              we engineer.
            </p>
          </div>

          <div className="ed-trans__grid">
            <article className="ed-trans__col ed-trans__col--before reveal">
              <header>
                <span className="ed-trans__chip">Before</span>
                <h3>Effort everywhere,<br />outcomes nowhere.</h3>
              </header>
              <ul>
                <li><span>×</span> Site that looks fine, converts at 0.6%</li>
                <li><span>×</span> SEO traffic plateaued, no pipeline tied to it</li>
                <li><span>×</span> Social posting on impulse, no system</li>
                <li><span>×</span> Five tools, no source of truth</li>
                <li><span>×</span> Vendors blame each other for results</li>
                <li><span>×</span> Founder still doing marketing on weekends</li>
              </ul>
            </article>

            <div className="ed-trans__bridge reveal delay-1" aria-hidden>
              <svg viewBox="0 0 100 200" preserveAspectRatio="none">
                <path d="M 10 100 C 40 100, 60 100, 90 100" />
                <path d="M 78 88 L 90 100 L 78 112" />
              </svg>
              <span className="ed-trans__bridge-label">PeakPulse System</span>
            </div>

            <article className="ed-trans__col ed-trans__col--after reveal delay-2">
              <header>
                <span className="ed-trans__chip ed-trans__chip--accent">After</span>
                <h3>One system,<br />measurable growth.</h3>
              </header>
              <ul>
                <li><span>↗</span> Site converting at 4.1% with live A/B program</li>
                <li><span>↗</span> Content engine tied to revenue, not traffic</li>
                <li><span>↗</span> Branded social cadence, scored against pipeline</li>
                <li><span>↗</span> Single dashboard for marketing &amp; sales</li>
                <li><span>↗</span> One team, one number, full accountability</li>
                <li><span>↗</span> Founder back to running the business</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          6 · CASE STUDIES
          ════════════════════════════════════════ */}
      <section className="ed-cases" id="work">
        <div className="ed-wrap">
          <div className="ed-cases__head">
            <span className="eyebrow reveal">Case studies</span>
            <h2 className="ed-cases__title reveal delay-1">
              Real businesses, <em>real outcomes.</em>
            </h2>
          </div>

          <div className="ed-cases__list">
            {[
              {
                tag: "Hospitality",
                client: "M Residences Budapest",
                url: "https://www.mresidencesbudapest.com/",
                claim: "Heritage residence with a booking funnel that pays back.",
                desc: "We rebuilt the brand site as a direct-booking funnel and wired it into a content engine across email, SEO, and social, designed to reduce OTA dependency over the season.",
                metrics: [
                  { n: 7, suf: "ch", label: "Connected channels" },
                  { n: 4, suf: "+", label: "Posts per week" },
                  { n: 12, suf: "mo", label: "Engagement plan" },
                ],
                before: "OTA-led",
                after: "Direct-led",
                metric: "Booking strategy",
              },
              {
                tag: "Capital",
                client: "MIR Capital",
                url: "https://www.mir-capital.com/",
                claim: "Investment firm refresh with editorial-grade design.",
                desc: "Brand identity refresh, custom Next.js build, and an authority-led content cadence sized for a senior, low-volume, high-trust audience.",
                metrics: [
                  { n: 100, suf: "%", label: "Custom build" },
                  { n: 3, suf: "ch", label: "Channels managed" },
                  { n: 6, suf: "/mo", label: "Long-form pieces" },
                ],
                before: "Static",
                after: "Editorial",
                metric: "Brand positioning",
              },
              {
                tag: "AI / Tech",
                client: "BMC AI Services",
                url: "https://bmcaiservices.britishmediacompany.com/",
                claim: "Launch site for an AI services suite, ready for scale.",
                desc: "End-to-end build covering positioning, site engineering, lifecycle automation, and a content studio producing weekly Reels, carousels, and educational explainers.",
                metrics: [
                  { n: 10, suf: "+", label: "Videos / month" },
                  { n: 5, suf: "+", label: "Carousels / month" },
                  { n: 24, suf: "/7", label: "Automation" },
                ],
                before: "Pre-launch",
                after: "Live engine",
                metric: "Production cadence",
              },
            ].map((c, i) => (
              <article className="ed-case reveal" style={{ transitionDelay: `${i * 80}ms` }} key={c.client}>
                <div className="ed-case__meta">
                  <span className="ed-case__tag">{c.tag}</span>
                  <span className="ed-case__num">CASE 0{i + 1}</span>
                </div>
                <div className="ed-case__body">
                  <div className="ed-case__copy">
                    <h3 className="ed-case__client">{c.client}</h3>
                    <p className="ed-case__claim">{c.claim}</p>
                    <p className="ed-case__desc">{c.desc}</p>
                    <a className="ed-link" href={c.url} target="_blank" rel="noopener noreferrer">Visit the live site →</a>
                  </div>
                  <div className="ed-case__viz">
                    <div className="ed-case__beforeafter">
                      <div className="ed-case__ba ed-case__ba--before">
                        <small>Before</small>
                        <b>{c.before}</b>
                      </div>
                      <span className="ed-case__arrow" aria-hidden>→</span>
                      <div className="ed-case__ba ed-case__ba--after">
                        <small>After</small>
                        <b>{c.after}</b>
                      </div>
                    </div>
                    <span className="ed-case__metric-label">{c.metric}</span>

                    <div className="ed-case__metrics">
                      {c.metrics.map((m) => (
                        <div className="ed-case__metric" key={m.label}>
                          <div className="v"><Counter to={m.n} suffix={m.suf} /></div>
                          <div className="l">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          7 · PROCESS
          ════════════════════════════════════════ */}
      <section className="ed-process" id="process">
        <div className="ed-wrap">
          <div className="ed-process__head">
            <span className="eyebrow reveal">The process</span>
            <h2 className="ed-process__title reveal delay-1">
              Five steps. <em>One outcome.</em>
            </h2>
            <p className="ed-process__lede reveal delay-2">
              Designed for clarity, paced for compounding. From kickoff to the
              quarter-after-next, you always know what comes next.
            </p>
          </div>

          <div className="ed-process__rail">
            <div className="ed-process__line" aria-hidden />
            {[
              { n: "01", label: "Discovery", desc: "Audit, interviews, baseline metrics. We map where revenue actually leaks." },
              { n: "02", label: "Strategy", desc: "Positioning, channel mix, the single number we are accountable to move." },
              { n: "03", label: "Execution", desc: "We ship the site, content, campaigns, and automations in focused 30-day production sprints." },
              { n: "04", label: "Optimization", desc: "Live experiments, weekly reviews, ruthless pruning of what doesn't pay back." },
              { n: "05", label: "Scaling", desc: "Compounding the winners. Channel expansion. Retainer or in-house handoff." },
            ].map((s, i) => (
              <div className="ed-step reveal" style={{ transitionDelay: `${i * 90}ms` }} key={s.n}>
                <div className="ed-step__node"><span>{s.n}</span></div>
                <h4>{s.label}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          8 · WHY US
          ════════════════════════════════════════ */}
      <section className="ed-why">
        <div className="ed-wrap ed-why__grid">
          <div className="ed-why__copy">
            <span className="eyebrow reveal">Why PeakPulse</span>
            <h2 className="ed-why__title reveal delay-1">
              World-class digital solutions,<br />
              built for <em>your business.</em>
            </h2>
            <p className="ed-why__p reveal delay-2">
              We believe every business deserves world-class digital solutions.
              Our mission is to amplify your growth through expert web
              development, compelling video content, and intelligent marketing
              automation, delivered by people who treat your P&amp;L like
              their own.
            </p>
            <button className="ed-cta reveal delay-3" onClick={openBooking}>
              Book a Strategy Call
              <span className="ed-cta__arrow" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
                </svg>
              </span>
            </button>
          </div>

          <div className="ed-why__pillars">
            {[
              { k: "01", t: "Six disciplines, one team", d: "Web engineers, social managers, videographers, copywriters, paid-media specialists, and automation engineers working under one roof. No agency-of-agencies overhead." },
              { k: "02", t: "Packaged, not bespoke-priced", d: "Four transparent monthly packages from Starter to Enterprise. Upgrade, downsize, or switch any time. No surprise scopes, no hidden hours." },
              { k: "03", t: "Built for any size", d: "From small businesses launching their first one-page site to multi-brand programs consolidating vendors. The same team, sized to your stage." },
              { k: "04", t: "4-hour response promise", d: "When you need us, you reach a real person fast. Decisions in hours, not weeks. No account-handler theatre." },
            ].map((p, i) => (
              <div className="ed-why__card reveal" style={{ transitionDelay: `${i * 80}ms` }} key={p.k}>
                <span className="ed-why__k">{p.k}</span>
                <h4>{p.t}</h4>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          8.5 · PRICING / PACKAGES
          ════════════════════════════════════════ */}
      <section className="ed-pricing" id="pricing">
        <div className="ed-wrap">
          <div className="ed-pricing__head">
            <span className="eyebrow reveal">Service packages</span>
            <h2 className="ed-pricing__title reveal delay-1">
              Four ways to <em>start scaling.</em>
            </h2>
            <p className="ed-pricing__lede reveal delay-2">
              Choose the package that fits your stage. Upgrade, downsize, or
              switch at any time. No long lock-ins, no hidden fees.
            </p>
          </div>

          <div className="ed-pricing__grid">
            {[
              {
                name: "Starter",
                price: "$1,800",
                unit: "per month",
                desc: "Foundation package for businesses launching their digital presence.",
                cta: "Start with Starter",
                categories: [
                  {
                    title: "Web Development",
                    items: ["Static 1-page CMS site", "1 landing page + branding"],
                  },
                  {
                    title: "Social Media Management",
                    items: ["3 posts per week", "Content strategy", "3 connected accounts", "Analytics & reporting"],
                  },
                  {
                    title: "Content Production",
                    items: ["4 videos", "2 carousels", "2 single-post graphics"],
                  },
                  {
                    title: "Growth Engine",
                    items: [
                      "1 email campaign / week",
                      "Foundational GEO & SEO",
                      "Meta Ads management ¹",
                      "Google Ads management ¹",
                      "Copywriting",
                      "Basic automation",
                      "Branding / rebranding",
                    ],
                  },
                ],
              },
              {
                name: "Growth",
                price: "$2,800",
                unit: "per month",
                desc: "A scaling content engine for businesses ready to compound results.",
                featured: true,
                cta: "Choose Growth",
                categories: [
                  {
                    title: "Web Development",
                    items: ["Static CRM", "CMS with dynamic pages", "Multi-page landing site + 2 brand variants"],
                  },
                  {
                    title: "Social Media Management",
                    items: ["3 posts per week + weekend content", "Content strategy", "4 connected accounts", "Analytics & reporting"],
                  },
                  {
                    title: "Content Production",
                    items: ["6 videos", "3 carousels", "3 single-post graphics"],
                  },
                  {
                    title: "Growth Engine",
                    items: [
                      "3 email campaigns / fortnight",
                      "GEO & SEO",
                      "Meta Ads management ¹",
                      "Google Ads management ¹",
                      "Copywriting",
                      "Intermediate automation",
                      "Branding / rebranding",
                    ],
                  },
                ],
              },
              {
                name: "Professional",
                price: "$3,999",
                unit: "per month",
                desc: "End-to-end production for established brands and serious operators.",
                cta: "Go Professional",
                categories: [
                  {
                    title: "Web Development",
                    items: [
                      "Custom-built CRM",
                      "Custom CMS (front-end + back-end)",
                      "Custom landing pages + branding",
                      "Migration support",
                    ],
                  },
                  {
                    title: "Social Media Management",
                    items: [
                      "Weekly Reels, carousels & single posts",
                      "Content strategy",
                      "Up to 6 connected accounts",
                      "Analytics & reporting",
                    ],
                  },
                  {
                    title: "Content Production",
                    items: ["10 videos", "5 carousels", "5 single-post graphics"],
                  },
                  {
                    title: "Growth Engine",
                    items: [
                      "2 email campaigns / week",
                      "GEO & SEO",
                      "Meta Ads management ¹",
                      "Google Ads management ¹",
                      "Copywriting",
                      "Advanced automation",
                      "Branding / rebranding",
                      "Website management",
                    ],
                  },
                ],
              },
              {
                name: "Enterprise",
                price: "Custom",
                unit: "tailored to scope",
                desc: "Multi-brand, multi-team programs with dedicated leadership and SLA-backed delivery.",
                cta: "Talk to founders",
                categories: [
                  {
                    title: "Web Development",
                    items: [
                      "Full custom CRM build",
                      "Full custom CMS (front-end + back-end)",
                      "Unlimited landing pages",
                      "Custom integrations & migrations",
                    ],
                  },
                  {
                    title: "Social Media Management",
                    items: [
                      "Multi-channel content production",
                      "Brand-led content calendar",
                      "Unlimited connected accounts",
                      "Real-time analytics & reporting",
                    ],
                  },
                  {
                    title: "Content Production",
                    items: ["Unlimited content production", "Cinematic brand films", "Photography & graphic design"],
                  },
                  {
                    title: "Growth Engine",
                    items: [
                      "Always-on email program",
                      "Full GEO & SEO program",
                      "Meta Ads management ¹",
                      "Google Ads management ¹",
                      "Copywriting at scale",
                      "Enterprise automation",
                      "Lead generation program",
                    ],
                  },
                  {
                    title: "Partnership",
                    items: [
                      "Dedicated account director",
                      "Quarterly business reviews",
                      "Priority 4-hour support",
                      "Service-level agreement",
                    ],
                  },
                ],
              },
            ].map((p, i) => (
              <div
                className={`ed-price ${p.featured ? "ed-price--featured" : ""} reveal`}
                style={{ transitionDelay: `${i * 70}ms` }}
                key={p.name}
              >
                {p.featured && <span className="ed-price__badge">Most popular</span>}
                <div className="ed-price__name">{p.name}</div>
                <div className="ed-price__price">
                  <b>{p.price}</b>
                  <small>{p.unit}</small>
                </div>
                <p className="ed-price__desc">{p.desc}</p>
                <div className="ed-price__features">
                  {p.categories.map((cat) => (
                    <div className="ed-price__group" key={cat.title}>
                      <h4 className="ed-price__group-title">{cat.title}</h4>
                      <ul>
                        {cat.items.map((item) => (
                          <li key={item}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <button
                  className={p.featured ? "ed-cta ed-price__cta" : "ed-price__cta ed-price__cta--ghost"}
                  onClick={openBooking}
                >
                  {p.cta}
                  {p.featured && (
                    <span className="ed-cta__arrow" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="ed-pricing__foot reveal delay-3">
            <span className="dot" />
            <span>
              <b>¹</b> Meta &amp; Google Ads management is included; ad spend is billed separately by the platform.
              All packages include a free growth audit, kickoff workshop, and full transparency on hours &amp; deliverables.
              <b> 30-day exit clause</b> on every monthly retainer.
            </span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          9 · TESTIMONIALS
          ════════════════════════════════════════ */}
      <section className="ed-quotes" id="testimonials">
        <div className="ed-wrap">
          <div className="ed-quotes__head">
            <span className="eyebrow reveal">Client stories</span>
            <h2 className="ed-quotes__title reveal delay-1">
              Business owners talk about <em>outcomes,</em><br />
              not deliverables.
            </h2>
          </div>

          <div className="ed-quotes__grid">
            {[
              {
                q: "Strategic, decisive, and fast. PeakPulse runs our site, content, social, and email as one accountable engine. Every Monday we know exactly what shipped and what's next.",
                n: "Founder",
                r: "Hospitality client",
                photo: "https://i.pravatar.cc/160?img=47",
                stat: "Replaced 2 agencies",
              },
              {
                q: "What we used to manage across four vendors now lives with one team. Web, social, content, and ads moving in lockstep instead of pulling against each other.",
                n: "Head of Marketing",
                r: "Capital firm",
                photo: "https://i.pravatar.cc/160?img=68",
                stat: "One team, six channels",
              },
              {
                q: "PeakPulse treats our brand like operators, not vendors. The cadence is consistent, the work is on-brand, and the receipts arrive every week.",
                n: "Director",
                r: "AI services company",
                photo: "https://i.pravatar.cc/160?img=45",
                stat: "Always-on production",
              },
            ].map((t, i) => (
              <figure className="ed-quote reveal" style={{ transitionDelay: `${i * 80}ms` }} key={t.n}>
                <div className="ed-quote__stars">★★★★★</div>
                <blockquote>{t.q}</blockquote>
                <figcaption>
                  <img className="ed-quote__av" src={t.photo} alt={t.n} loading="lazy" />
                  <div>
                    <b>{t.n}</b>
                    <small>{t.r}</small>
                  </div>
                  <span className="ed-quote__stat">{t.stat}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          10 · FINAL CTA
          ════════════════════════════════════════ */}
      <section className="ed-final" id="contact">
        <span className="ed-final__monogram" aria-hidden>peak.</span>
        <div className="ed-wrap ed-final__inner">
          <Image
            src="/logo.png"
            alt="PeakPulse Agency"
            width={64}
            height={64}
            className="ed-final__logo reveal"
          />
          <h2 className="ed-final__h reveal delay-1">
            Ready to Amplify<br />
            <em>Your Growth?</em>
          </h2>
          <p className="ed-final__p reveal delay-2">
            Let&apos;s discuss how we can help you achieve your digital goals.
            Twenty-minute strategy call. We&apos;ll review your funnel,
            identify the leak, and show you exactly what we&apos;d ship in the
            first 30 days.
          </p>
          <div className="ed-final__cta reveal delay-3">
            <button onClick={openBooking} className="ed-cta">
              Book a Strategy Call
              <span className="ed-cta__arrow" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
                </svg>
              </span>
            </button>
            <span className="ed-final__note">4-hour response promise · hello@peakpulse.agency</span>
          </div>
        </div>
      </section>
    </div>
  );
}
