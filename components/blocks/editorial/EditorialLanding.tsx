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
        <button className="ed-cta ed-cta--sm" onClick={() => scrollTo("contact")}>
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
                solutions firm delivering expert web development, professional
                video production, strategic digital marketing, and comprehensive
                automation for small and large businesses alike.
              </p>

              <div className="ed-hero__cta-row reveal delay-3">
                <button onClick={() => scrollTo("contact")} className="ed-cta">
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
          <div className="ed-hero__visual reveal delay-2" ref={heroVisualRef}>
            <div className="ed-frame ed-frame--back" aria-hidden />
            <div className="ed-frame ed-frame--main">
              <div className="ed-frame__chrome">
                <span /><span /><span />
                <span className="url">peakpulse.agency / dashboard</span>
              </div>
              <div className="ed-frame__body">
                <span className="ed-frame__pill">Live · Q2 Cohort</span>
                <h3 className="ed-frame__h">
                  Pipeline up <em>+218%</em><br />since launch.
                </h3>
                <div className="ed-frame__bars" aria-hidden>
                  <span /><span /><span /><span /><span /><span /><span />
                </div>
                <div className="ed-frame__row">
                  <span>30-DAY MRR · <b>$1.42M</b></span>
                  <span>CAC · <b>&minus;41%</b></span>
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
                  <li>Halcyon&nbsp;<i>&amp; Co.</i></li>
                  <li>Northvale</li>
                  <li>Marée<i>°</i></li>
                  <li>Atelier 88</li>
                  <li>Mira&nbsp;Studios</li>
                  <li>Bricklane</li>
                  <li>Sundara<i>°</i></li>
                  <li>Voltaire</li>
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
              <div className="ed-metric__value"><Counter to={312} suffix="%" /></div>
              <div className="ed-metric__label">Avg. conversion lift</div>
            </div>
            <div className="ed-metric reveal delay-1">
              <div className="ed-metric__value"><Counter to={142} /></div>
              <div className="ed-metric__label">Projects shipped</div>
            </div>
            <div className="ed-metric reveal delay-2">
              <div className="ed-metric__value">$<Counter to={14} />M</div>
              <div className="ed-metric__label">Pipeline generated</div>
            </div>
            <div className="ed-metric reveal delay-3">
              <div className="ed-metric__value"><Counter to={4} />h</div>
              <div className="ed-metric__label">Response promise</div>
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
              Web, video, marketing &amp; <em>automation</em><br />
              under one roof.
            </h2>
            <p className="ed-bento__lede reveal delay-2">
              We deliver expert digital solutions designed to amplify your
              growth, from world-class websites and compelling video content
              to intelligent marketing automation.
            </p>
          </div>

          <div className="ed-bento__grid">
            <article className="ed-tile ed-tile--A reveal">
              <div>
                <div className="ed-tile__index">
                  <span>01 / Web Development</span>
                  <span className="tag">In production</span>
                </div>
                <h3 className="ed-tile__h">
                  Websites that <em>convert</em><br />while they sleep.
                </h3>
                <p className="ed-tile__p">
                  Custom-built, performance-tuned sites engineered for speed,
                  search and revenue. Headless Next.js, conversion-tuned UX,
                  Lighthouse 100 as a floor.
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
                <span>02 / Digital Marketing</span>
                <span className="tag">Strategic</span>
              </div>
              <h3 className="ed-tile__h">
                Strategy that <em>compounds</em> into pipeline.
              </h3>
              <p className="ed-tile__p">
                SEO, content, paid media, and lifecycle. Measured on revenue,
                not vanity metrics. Built around your buyer, not the algorithm.
              </p>
              <div className="ed-tile__chips">
                <span>SEO</span>
                <span>Content</span>
                <span>Paid Media</span>
                <span>Lifecycle</span>
              </div>
            </article>

            <article className="ed-tile ed-tile--C reveal delay-2">
              <div className="ed-tile__index">
                <span>03 / Video Production</span>
                <span className="tag">Cinematic</span>
              </div>
              <div>
                <h3 className="ed-tile__h">Compelling content, end-to-end.</h3>
                <p className="ed-tile__p">
                  Brand films, product cinematics, and short-form social.
                  Directed, scored, and colour-graded in-house.
                </p>
              </div>
              <div className="big">↑ <em>2.4×</em><sup>watch-through</sup></div>
            </article>

            <article className="ed-tile ed-tile--D reveal delay-3">
              <div className="ed-tile__index">
                <span>04 / Marketing Automation</span>
                <span className="tag">Operations</span>
              </div>
              <h3 className="ed-tile__h">
                Workflows that <em>quietly run</em> the business.
              </h3>
              <ul className="ed-tile__list">
                <li>Lifecycle email &amp; SMS sequencing</li>
                <li>CRM hygiene + lead routing</li>
                <li>Multi-channel attribution dashboards</li>
                <li>Custom integrations &amp; AI agents</li>
              </ul>
            </article>

            <article className="ed-tile ed-tile--E reveal delay-2">
              <div className="ed-tile__index">
                <span>05 / Social Media</span>
                <span className="tag">On-brand</span>
              </div>
              <h3 className="ed-tile__h">Brand voice, <em>everywhere.</em></h3>
              <p className="ed-tile__p">
                Managed social presence across Instagram, TikTok, LinkedIn and
                more. Strategy, calendar, creative, and community.
              </p>
            </article>

            <article className="ed-tile ed-tile--F reveal delay-3">
              <div className="ed-tile__index">
                <span>06 / Custom Solutions</span>
                <span className="tag">Bespoke</span>
              </div>
              <h3 className="ed-tile__h">
                Tailored builds for <em>singular businesses.</em>
              </h3>
              <p className="ed-tile__p">
                Booking systems, e-commerce, internal tooling, SaaS dashboards.
                Engineered around your workflow, not a template.
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
            <div className="ed-pf-video ed-pf-enter" key="video">
              <div className="ed-pf-video__main">
                <div className="ed-pf-video__chrome">
                  <span className="rec" />
                  <span className="lbl">REEL · 02:14</span>
                  <span className="hd">4K · 60FPS</span>
                </div>
                <div className="ed-pf-video__stage">
                  <div className="ed-pf-video__waveform" aria-hidden>
                    {Array.from({ length: 40 }).map((_, j) => (
                      <span key={j} style={{ animationDelay: `${j * 60}ms` }} />
                    ))}
                  </div>
                  <div className="ed-pf-video__caption">
                    <span className="ticker">
                      <i>•</i> Now playing
                    </span>
                    <h3>BMC AI Services · The Launch</h3>
                    <p>Brand film · Direction, score, and colour grade in-house</p>
                  </div>
                  <button className="ed-pf-video__play" aria-label="Play reel">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </button>
                </div>
                <div className="ed-pf-video__meta">
                  <span><b>312%</b> conversion lift</span>
                  <span><b>2.4×</b> watch-through</span>
                  <span><b>9</b> awards</span>
                </div>
              </div>
              <ul className="ed-pf-video__list">
                {[
                  { t: "02:14", n: "BMC AI Services · Launch Reel",       c: "Brand film",   u: "https://bmcaiservices.britishmediacompany.com/" },
                  { t: "01:48", n: "Berkeley Travel · The Concierge Cut", c: "Brand film",   u: "https://berkeleytravel.co.uk/" },
                ].map((v) => (
                  <li key={v.n} onClick={() => window.open(v.u, "_blank")}>
                    <span className="t">{v.t}</span>
                    <div>
                      <b>{v.n}</b>
                      <small>{v.c}</small>
                    </div>
                    <span className="more" aria-hidden>↗</span>
                  </li>
                ))}
              </ul>
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
                  { kicker: "Capital", title: "S.W. Mitchell Capital · refreshed identity",   read: "5 min", url: "https://www.swmitchellcapital.com/" },
                  { kicker: "AI",      title: "BMC AI Services · building an AI suite site", read: "8 min", url: "https://bmcaiservices.britishmediacompany.com/" },
                ].map((m) => (
                  <article
                    className="ed-pf-mag__story"
                    key={m.title}
                    onClick={() => window.open(m.url, "_blank")}
                    role="link"
                    tabIndex={0}
                  >
                    <span className="ed-pf-mag__kicker">{m.kicker}</span>
                    <h4>{m.title}</h4>
                    <span className="ed-pf-mag__read">{m.read}</span>
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
                client: "Marée",
                claim: "Direct bookings overtook OTAs in 4 months.",
                desc: "We rebuilt the brand site as a booking funnel, then layered SEO + paid media around peak season demand.",
                metrics: [
                  { n: 312, suf: "%", label: "Conversion lift" },
                  { n: 41, suf: "%", label: "OTA fee reduction" },
                  { n: 4, suf: ".0×", label: "Direct bookings" },
                ],
                before: "$220k",
                after: "$1.42M",
                metric: "30-day direct revenue",
              },
              {
                tag: "B2B SaaS",
                client: "Halcyon & Co.",
                claim: "MQL pipeline grew 4.6× without raising spend.",
                desc: "Rebuilt the funnel: positioning → site → SEO + lifecycle. Replaced four tools with one CRM workflow that sales actually uses.",
                metrics: [
                  { n: 460, suf: "%", label: "Pipeline growth" },
                  { n: 38, suf: "%", label: "Demo show-rate" },
                  { n: 22, suf: "d", label: "Avg. sales cycle" },
                ],
                before: "0.9%",
                after: "4.1%",
                metric: "Site → demo conversion",
              },
              {
                tag: "E-commerce",
                client: "Atelier 88",
                claim: "Replatformed and grew AOV 38% in one quarter.",
                desc: "Custom storefront, content engine for product storytelling, paid social pruned to the segments that actually paid back.",
                metrics: [
                  { n: 38, suf: "%", label: "AOV growth" },
                  { n: 2, suf: ".7×", label: "Repeat rate" },
                  { n: 27, suf: "%", label: "Paid CAC drop" },
                ],
                before: "1.8%",
                after: "3.6%",
                metric: "Add-to-cart rate",
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
                    <button className="ed-link">Read the case study →</button>
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
            <button className="ed-cta reveal delay-3" onClick={() => scrollTo("contact")}>
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
              { k: "01", t: "Expert team, end-to-end", d: "Web engineers, videographers, marketers, and automation specialists working as one team. No agency-of-agencies overhead." },
              { k: "02", t: "Performance-driven", d: "Every engagement starts with the metric we will move. Receipts on the wall, dashboards you can see, results you can measure." },
              { k: "03", t: "Built for any size", d: "From small businesses launching their first site to large brands consolidating ten vendors, engagements scale with you." },
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
            <span className="eyebrow reveal">Engage with PeakPulse</span>
            <h2 className="ed-pricing__title reveal delay-1">
              Three ways to <em>start scaling.</em>
            </h2>
            <p className="ed-pricing__lede reveal delay-2">
              Pick the engagement model that fits your stage. Upgrade, downsize,
              or switch any time. No long lock-ins, no hidden fees.
            </p>
          </div>

          <div className="ed-pricing__grid">
            {[
              {
                name: "Sprint",
                price: "$4,800",
                unit: "from, one-time",
                desc: "A focused 30-day production sprint. Perfect for launching a new site or shipping a single high-leverage campaign.",
                features: [
                  "Site or campaign build",
                  "Conversion-tuned design",
                  "Analytics + tracking",
                  "30-day launch warranty",
                  "1 director, 1 sprint",
                ],
                cta: "Start a sprint",
              },
              {
                name: "Retainer",
                price: "$8,400",
                unit: "per month",
                desc: "An always-on growth team. Site, content, paid, automations. Measured weekly against a single number.",
                features: [
                  "Everything in Sprint",
                  "Ongoing CRO program",
                  "Content + SEO engine",
                  "Paid media management",
                  "Weekly performance review",
                  "Slack channel access",
                ],
                cta: "Book a retainer",
                featured: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                unit: "scoped",
                desc: "Multi-track engagements for brands consolidating vendors. Bespoke scopes, dedicated team, executive sponsor.",
                features: [
                  "Custom team blend",
                  "Dedicated production lead",
                  "Custom integrations",
                  "Quarterly business reviews",
                  "SLA + priority support",
                ],
                cta: "Talk to founders",
              },
            ].map((p, i) => (
              <div
                className={`ed-price ${p.featured ? "ed-price--featured" : ""} reveal`}
                style={{ transitionDelay: `${i * 80}ms` }}
                key={p.name}
              >
                {p.featured && <span className="ed-price__badge">Most popular</span>}
                <div className="ed-price__name">{p.name}</div>
                <div className="ed-price__price">
                  <b>{p.price}</b>
                  <small>{p.unit}</small>
                </div>
                <p className="ed-price__desc">{p.desc}</p>
                <ul className="ed-price__features">
                  {p.features.map((f) => (
                    <li key={f}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={p.featured ? "ed-cta ed-price__cta" : "ed-price__cta ed-price__cta--ghost"}
                  onClick={() => scrollTo("contact")}
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
            All engagements include a free growth audit, kickoff workshop, and
            full transparency on hours &amp; deliverables. <b>30-day exit clause</b> on every retainer.
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          9 · TESTIMONIALS
          ════════════════════════════════════════ */}
      <section className="ed-quotes">
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
                q: "The site they shipped is the single best-performing channel we have. Period. We replaced two agencies with PeakPulse and our pipeline is up 4.6×.",
                n: "Marisol Velasco",
                r: "Founder, Marée",
                photo: "https://i.pravatar.cc/160?img=47",
                stat: "+ 460% pipeline",
              },
              {
                q: "Strategic, decisive, and fast. PeakPulse built us a content engine that finally rates revenue, not traffic, and pruned the channels that never paid back.",
                n: "Daniel Reyes",
                r: "CMO, Halcyon & Co.",
                photo: "https://i.pravatar.cc/160?img=68",
                stat: "− 41% CAC",
              },
              {
                q: "The team treats our P&L like their own. We get receipts every Monday and have grown for nine straight quarters. They feel like operators, not vendors.",
                n: "Anna Whitfield",
                r: "CEO, Atelier 88",
                photo: "https://i.pravatar.cc/160?img=45",
                stat: "9 quarters of growth",
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
            <button onClick={() => scrollTo("contact")} className="ed-cta">
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
