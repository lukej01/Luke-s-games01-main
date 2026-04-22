"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { HeroBackground } from "@/components/ui/hero-background";
import { TextScramble } from "@/components/ui/text-scramble";
import { CyberpunkCursor } from "@/components/ui/cyberpunk-cursor";
import { MagneticText } from "@/components/ui/magnetic-text";
import { CartridgeCarousel } from "@/components/ui/cartridge-carousel";

// ── Game data ──────────────────────────────────────────────────────────────
const GAMES = [
  {
    id: "super-mario-64",
    title: "Super Mario 64",
    platform: "N64",
    genre: "Platform",
    year: "1996",
    hue: 280,
    desc: "The 3D platformer that redefined gaming. Guide Mario through 15 worlds inside Bowser's castle, collecting Power Stars in groundbreaking 64-bit freedom.",
  },
  {
    id: "zelda-oot",
    title: "Zelda: Ocarina of Time",
    platform: "N64",
    genre: "Adventure",
    year: "1998",
    hue: 195,
    desc: "An epic time-travelling quest through Hyrule. Wield the Master Sword across past and future to defeat Ganondorf's creeping darkness.",
  },
  {
    id: "paper-mario",
    title: "Paper Mario",
    platform: "N64",
    genre: "RPG",
    year: "2001",
    hue: 150,
    desc: "A flat-folded adventure through the Mushroom Kingdom. Build a party of unique companions and battle with badges in this beloved RPG.",
  },
  {
    id: "super-mario-world",
    title: "Super Mario World",
    platform: "SNES",
    genre: "Platform",
    year: "1990",
    hue: 40,
    desc: "The SNES launch masterpiece. Explore Dinosaur Land with Yoshi, uncover hidden exits, and conquer Bowser's seven worlds.",
  },
  {
    id: "super-mario-3",
    title: "Super Mario Bros 3",
    platform: "NES",
    genre: "Platform",
    year: "1988",
    hue: 25,
    desc: "The peak of NES platforming. Eight diverse worlds, transforming suits, and Bowser's Koopalings await in this timeless classic.",
  },
  {
    id: "punch-out",
    title: "Punch-Out!!",
    platform: "NES",
    genre: "Fighting",
    year: "1987",
    hue: 15,
    desc: "Rise through the ranks as Little Mac. Study opponent patterns and time your punches to dethrone the legendary Mike Tyson.",
  },
  {
    id: "sonic-2",
    title: "Sonic the Hedgehog 2",
    platform: "GEN",
    genre: "Platform",
    year: "1992",
    hue: 220,
    desc: "Blazing speed across Chemical Plant and beyond. Team up with Tails to blast through Robotnik's forces at supersonic velocity.",
  },
  {
    id: "gran-turismo-2",
    title: "Gran Turismo 2",
    platform: "PS1",
    genre: "Racing",
    year: "1999",
    hue: 320,
    desc: "The Real Driving Simulator. Over 650 cars across arcade and simulation modes across dozens of meticulously recreated circuits.",
  },
  {
    id: "nba-live-2003",
    title: "NBA Live 2003",
    platform: "PS1",
    genre: "Sports",
    year: "2002",
    hue: 55,
    desc: "Hit the hardwood with the full 2002-03 NBA rosters. Freestyle dribbling, dynamic dunks, and franchise mode define this era.",
  },
  {
    id: "madden-2002",
    title: "Madden 2002",
    platform: "PS1",
    genre: "Sports",
    year: "2001",
    hue: 60,
    desc: "The greatest football sim of its era. Full NFL rosters, franchise mode, and the playcalling depth that made Madden legendary.",
  },
  {
    id: "lego-batman-1",
    title: "LEGO Batman",
    platform: "DS",
    genre: "Action",
    year: "2008",
    hue: 240,
    desc: "Gotham City in LEGO form. Play as Batman, Robin, or the villains across 30 story levels in this co-op action adventure.",
  },
  {
    id: "lego-batman-2",
    title: "LEGO Batman 2",
    platform: "DS",
    genre: "Action",
    year: "2012",
    hue: 245,
    desc: "The Dark Knight meets the Justice League. Superman joins the fight as Lex Luthor and the Joker threaten Gotham.",
  },
  {
    id: "lego-star-wars",
    title: "LEGO Star Wars",
    platform: "DS",
    genre: "Action",
    year: "2005",
    hue: 50,
    desc: "Relive the prequel trilogy in brick form. Over 50 playable characters, force powers, and lightsaber battles in miniature.",
  },
] as const;

type Game = (typeof GAMES)[number];

const BASE = "/Luke-s-games01-main";

// ── Intersection observer hook ─────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── GamePlayer — full-screen iframe overlay ────────────────────────────────
function GamePlayer({ game, onClose }: { game: Game | null; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (game) {
      document.body.style.overflow = "hidden";
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    } else {
      setMounted(false);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [game]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!game) return null;

  const neon = `oklch(0.85 0.22 ${game.hue})`;
  const neonDim = `oklch(0.55 0.18 ${game.hue})`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Playing: ${game.title}`}
      className="fixed inset-0 flex flex-col"
      style={{
        zIndex: 9300,
        background: "#000",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.25s ease",
      }}
    >
      {/* Header bar */}
      <div
        className="relative flex items-center justify-between px-5 shrink-0"
        style={{
          height: "48px",
          background: "oklch(0.05 0.015 195)",
          borderBottom: `1px solid ${neon}44`,
        }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-2.5 font-mono-cyber text-[10px] tracking-[0.3em] uppercase transition-colors duration-200"
          style={{ color: "var(--text-dim)", cursor: "none" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = neon; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-dim)"; }}
        >
          <span>←</span>
          <span className="font-pixel text-[7px] tracking-widest" style={{ color: "var(--neon)" }}>GAMESTASH</span>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
          <span
            className="font-pixel text-[8px] tracking-widest"
            style={{ color: neon, textShadow: `0 0 10px ${neon}` }}
          >
            {game.title.toUpperCase()}
          </span>
          <div className="flex items-center gap-2">
            <span
              className="font-mono-cyber text-[7px] tracking-[0.3em] px-1.5 py-0.5 border"
              style={{ color: neonDim, borderColor: `${neonDim}44`, background: `${neonDim}10` }}
            >
              {game.platform}
            </span>
            <span className="font-mono-cyber text-[7px] tracking-widest" style={{ color: neonDim }}>
              {game.genre.toUpperCase()} · {game.year}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="font-mono-cyber text-[10px] tracking-widest transition-colors duration-200"
          style={{ color: "var(--text-dim)", cursor: "none" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = neon; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-dim)"; }}
        >
          [ ESC ]
        </button>

        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${neon}66, transparent)` }}
        />
      </div>

      {/* Game iframe */}
      <iframe
        key={game.id}
        src={`${BASE}/games/${game.id}.html`}
        className="flex-1 w-full"
        style={{ border: "none", display: "block" }}
        allow="gamepad *; autoplay *; fullscreen *"
        title={game.title}
      />
    </div>
  );
}

// ── ScatterTitle — GAMESTASH letters scatter apart on scroll ──────────────
function ScatterTitle({ scrollY }: { scrollY: number }) {
  const scatter = useRef<{ x: number; y: number; r: number; s: number }[]>([]);
  if (scatter.current.length === 0) {
    // Pre-compute stable scatter vectors per letter: index 0-3 = GAME, 4-8 = STASH
    const spread = [
      { x: -340, y: -180, r: -52, s: 0.15 },
      { x: -120, y: -290, r:  38, s: 0.20 },
      { x:  80,  y: -260, r: -28, s: 0.18 },
      { x:  260, y: -140, r:  62, s: 0.22 },
      { x: -280, y:  200, r:  44, s: 0.12 },
      { x: -80,  y:  310, r: -56, s: 0.20 },
      { x:  120, y:  280, r:  34, s: 0.15 },
      { x:  300, y:  160, r: -48, s: 0.18 },
      { x:  420, y: -60,  r:  70, s: 0.16 },
    ];
    scatter.current = spread;
  }

  // scrollY 0→320: scatter begins; eased progress 0→1
  const raw = Math.min(1, scrollY / 320);
  const t   = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;

  const words = [
    { text: "GAME",  style: { color: "var(--foreground)" } },
    { text: "STASH", style: { WebkitTextStroke: "2px var(--neon)", color: "transparent", filter: "drop-shadow(0 0 20px var(--neon))" } },
  ] as const;

  return (
    <h1
      className="text-[clamp(4rem,11vw,10rem)] font-bold leading-none tracking-tighter mb-6"
      style={{ fontFamily: "'Space Grotesk', sans-serif", willChange: "transform" }}
      aria-label="GAMESTASH"
    >
      {words.map((w, wi) => (
        <span key={w.text} className="glitch-wrap block" style={w.style as React.CSSProperties}>
          {w.text.split("").map((ch, ci) => {
            const idx = wi * 4 + ci;
            const sv  = scatter.current[idx] ?? { x: 0, y: 0, r: 0, s: 0 };
            return (
              <span
                key={ci}
                aria-hidden
                style={{
                  display: "inline-block",
                  transform: `translate(${sv.x * t}px, ${sv.y * t}px) rotate(${sv.r * t}deg) scale(${1 - (1 - sv.s) * t})`,
                  opacity: Math.max(0, 1 - t * 1.4),
                  willChange: "transform, opacity",
                }}
              >
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

// ── SplitReveal — letter-by-letter entrance animation ─────────────────────
function SplitReveal({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <span ref={ref} className={className} style={{ ...style, display: "inline-block" }} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span key={i} aria-hidden style={{
          display: "inline-block",
          transform: visible ? "translateY(0)" : "translateY(110%)",
          opacity: visible ? 1 : 0,
          transition: `transform 0.58s ${i * 0.022}s cubic-bezier(0.16,1,0.3,1), opacity 0.45s ${i * 0.022}s ease`,
        }}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

// ── GameCard — retro box art cover ─────────────────────────────────────────
function GameCard({
  game,
  index,
  onClick,
}: {
  game: Game;
  index: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const { ref, visible } = useReveal(0.04);

  const neon    = `oklch(0.85 0.22 ${game.hue})`;
  const neonDim = `oklch(0.55 0.18 ${game.hue})`;
  const bg      = `oklch(0.10 0.06 ${game.hue})`;

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    setTilt({ x: nx * 8, y: -ny * 8 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  // stagger delay: wave pattern across grid
  const delay = (index % 5) * 0.055 + Math.floor(index / 5) * 0.04;

  return (
    <div ref={ref}>
    <div
      role="button"
      tabIndex={0}
      aria-label={`Play ${game.title}`}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={onMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered
            ? `translateY(-10px) scale(1.04) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`
            : "translateY(0) scale(1) rotateX(0deg)"
          : "translateY(64px) scale(0.86) rotateX(14deg)",
        transition: visible
          ? `opacity 0.6s ${delay}s ease, transform 0.42s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s`
          : `opacity 0.6s ${delay}s ease, transform 0.7s ${delay}s cubic-bezier(0.16,1,0.3,1)`,
        boxShadow: hovered
          ? `0 28px 70px ${neon}44, 0 0 0 1px ${neon}88, 0 0 40px ${neon}18`
          : `0 0 0 1px oklch(0.18 0.05 195)`,
        cursor: "none",
        overflow: "hidden",
        background: "oklch(0.065 0.02 195)",
        borderRadius: "2px",
      }}
    >
      {/* Cover art — landscape 4:3 */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "4/3",
          background: `linear-gradient(145deg, ${bg} 0%, oklch(0.06 0.04 ${game.hue}) 55%, oklch(0.04 0.015 ${game.hue}) 100%)`,
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${neon}0a 1px, transparent 1px), linear-gradient(90deg, ${neon}0a 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* CRT scanlines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.13) 3px, rgba(0,0,0,0.13) 4px)",
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.72) 100%)" }}
        />

        {/* Platform watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center font-pixel select-none pointer-events-none"
          style={{ fontSize: "clamp(24px, 7vw, 44px)", color: `${neon}0d`, letterSpacing: "0.3em" }}
        >
          {game.platform}
        </div>

        {/* Game title */}
        <div className="absolute inset-0 flex items-center justify-center p-3">
          <p
            className="font-pixel text-center leading-loose"
            style={{
              fontSize: "clamp(0.38rem, 1.1vw, 0.60rem)",
              color: neon,
              textShadow: `0 0 10px ${neon}cc, 0 0 28px ${neonDim}88`,
              letterSpacing: "0.06em",
              wordBreak: "break-word",
            }}
          >
            {game.title.toUpperCase()}
          </p>
        </div>

        {/* Platform badge */}
        <div
          className="absolute top-1.5 left-1.5 font-mono-cyber text-[7px] tracking-widest px-1.5 py-0.5 border"
          style={{ color: neon, borderColor: `${neon}55`, background: `${neon}14` }}
        >
          {game.platform}
        </div>

        {/* Year */}
        <div className="absolute top-1.5 right-1.5 font-mono-cyber text-[7px] tracking-widest" style={{ color: neonDim }}>
          {game.year}
        </div>

        {/* Genre */}
        <div className="absolute bottom-1.5 left-1.5 font-mono-cyber text-[7px] tracking-[0.2em]" style={{ color: neonDim, opacity: 0.75 }}>
          {game.genre.toUpperCase()}
        </div>

        {/* Hover play overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: hovered ? "rgba(0,0,0,0.5)" : "transparent",
            backdropFilter: hovered ? "blur(2px)" : "none",
            opacity: hovered ? 1 : 0,
            transition: "all 0.3s ease",
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center border-2"
            style={{
              borderColor: neon,
              background: `${neon}22`,
              boxShadow: `0 0 28px ${neon}66, 0 0 70px ${neonDim}33`,
              transform: hovered ? "scale(1)" : "scale(0.4)",
              transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <span className="text-xl ml-0.5" style={{ color: neon }}>▶</span>
          </div>
        </div>

        {/* Scan sweep */}
        {hovered && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "2px",
              background: `linear-gradient(90deg, transparent, ${neon}, transparent)`,
              animation: "scanline-drop 1.5s linear infinite",
              opacity: 0.8,
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div
        className="px-2.5 py-2 flex items-center justify-between"
        style={{ borderTop: `1px solid ${neon}22` }}
      >
        <span
          className="font-pixel truncate pr-2"
          style={{
            fontSize: "5.5px",
            letterSpacing: "0.05em",
            color: hovered ? neon : "oklch(0.60 0.04 195)",
            textShadow: hovered ? `0 0 8px ${neon}` : "none",
            transition: "color 0.3s, text-shadow 0.3s",
            maxWidth: "80%",
          }}
        >
          {game.title.toUpperCase()}
        </span>
        <span
          className="font-mono-cyber text-[8px] shrink-0"
          style={{
            color: neon,
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateX(0)" : "translateX(6px)",
            transition: "opacity 0.25s, transform 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          ▶
        </span>
      </div>
    </div>
    </div>
  );
}

// ── Typewriter ──────────────────────────────────────────────────────────────
function Typewriter({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started || displayed.length >= text.length) return;
    const t = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), 38);
    return () => clearTimeout(t);
  }, [started, displayed, text]);

  return (
    <span>
      {displayed}
      <span
        className="inline-block w-0.5 h-[1em] align-middle ml-0.5"
        style={{
          background: "var(--neon)",
          animation: displayed.length < text.length ? "none" : "blink-cursor 0.8s step-end infinite",
        }}
      />
    </span>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [playingGame, setPlayingGame] = useState<Game | null>(null);
  const libraryReveal = useReveal(0.03);
  const platformReveal = useReveal(0.12);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const sy = window.scrollY;
      setScrollY(sy);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) setScrollProgress((sy / maxScroll) * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closePlayer = useCallback(() => setPlayingGame(null), []);
  const handlePlay = useCallback((game: Game) => {
    setPlayingGame(game);
  }, []);

  // Hero content fades as library slides over it
  const heroOpacity = Math.max(0, 1 - scrollY / 360);
  const heroParallax = scrollY * 0.28;

  return (
    <>
      <CyberpunkCursor />
      <HeroBackground />
      <GamePlayer game={playingGame} onClose={closePlayer} />
      {/* Scroll progress bar */}
      <div aria-hidden="true" style={{
        position: "fixed", top: 0, left: 0, height: 2, zIndex: 9999, pointerEvents: "none",
        width: `${scrollProgress}%`,
        background: "linear-gradient(90deg, var(--neon), oklch(0.78 0.22 280))",
        boxShadow: "0 0 10px var(--neon), 0 0 24px var(--neon-dim)",
        transition: "width 0.12s linear",
      }} />

      <main className="text-white overflow-x-hidden" style={{ background: "var(--background)" }}>

        <section ref={heroRef} className="relative h-screen overflow-hidden circuit-bg" style={{ zIndex: 1 }}>

            {/* Content fades on scroll */}
            <div
              className="absolute inset-0 z-20 flex flex-col"
              style={{ opacity: heroOpacity, willChange: "opacity" }}
            >
              {/* Nav */}
              <nav className="relative flex items-center justify-between px-8 md:px-12 pt-8 pointer-events-none">
                <div className="hidden md:flex items-center gap-7 pointer-events-auto">
                  {[
                    { label: "GAMES", href: "#library" },
                    { label: "ADMIN", href: "/Luke-s-games01-main/admin.html" },
                  ].map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      className="relative font-mono-cyber text-[11px] tracking-[0.25em] uppercase group"
                      style={{ color: "var(--text-dim)", cursor: "none" }}
                    >
                      <span className="group-hover:text-[var(--neon)] transition-colors duration-200">{label}</span>
                      <span
                        className="absolute -bottom-0.5 left-0 h-px bg-[var(--neon)] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
                        style={{ boxShadow: "0 0 6px var(--neon)" }}
                      />
                    </a>
                  ))}
                </div>

                {/* Centered logo */}
                <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-0.5">
                  <MagneticText strength={9} radius={160} tag="span" className="font-pixel text-[11px] neon-text tracking-widest" style={{ animation: "neon-flicker 9s ease-in-out infinite", display: "inline-block" }}>
                    GAMESTASH
                  </MagneticText>
                  <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, var(--neon), transparent)", boxShadow: "0 0 6px var(--neon)" }} />
                </div>

                <div className="hidden md:flex items-center gap-6 pointer-events-auto">
                  {(["ABOUT", "CONTACT"] as const).map((link) => (
                    <a
                      key={link}
                      href="#"
                      className="relative font-mono-cyber text-[11px] tracking-[0.25em] uppercase group"
                      style={{ color: "var(--text-dim)", cursor: "none" }}
                    >
                      <span className="group-hover:text-[var(--neon)] transition-colors duration-200">{link}</span>
                      <span
                        className="absolute -bottom-0.5 left-0 h-px bg-[var(--neon)] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
                        style={{ boxShadow: "0 0 6px var(--neon)" }}
                      />
                    </a>
                  ))}
                  <div
                    className="flex items-center gap-1.5 border px-3 py-1.5 font-mono-cyber text-[9px] tracking-widest uppercase"
                    style={{
                      borderColor: "var(--border-glow)",
                      color: "var(--neon)",
                      background: "oklch(0.88 0.22 195 / 0.06)",
                      boxShadow: "0 0 10px oklch(0.88 0.22 195 / 0.15)",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)]" style={{ animation: "neon-pulse 1.5s ease-in-out infinite" }} />
                    Online
                  </div>
                </div>
              </nav>

              {/* Main hero content */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 md:px-12 lg:px-20">
                <div className="mb-7 flex items-center gap-3">
                  <div className="h-px w-12" style={{ background: "linear-gradient(90deg, transparent, var(--neon))", boxShadow: "0 0 6px var(--neon)" }} />
                  <TextScramble text="// Classic Vault v2.0" className="font-mono-cyber text-[10px] tracking-[0.45em] uppercase" style={{ color: "var(--neon)" }} />
                  <div className="h-px w-12" style={{ background: "linear-gradient(90deg, var(--neon), transparent)", boxShadow: "0 0 6px var(--neon)" }} />
                </div>

                <ScatterTitle scrollY={scrollY} />

                <MagneticText strength={4} radius={300} tag="p" className="font-mono-cyber text-sm md:text-base mb-12 max-w-lg" style={{ color: "var(--text-dim)" }}>
                  <Typewriter text="13 classic titles. Zero latency. Pure nostalgia." delay={900} />
                </MagneticText>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <a
                    href="#library"
                    data-hover
                    className="relative group px-10 py-3.5 font-mono-cyber text-[11px] tracking-[0.35em] uppercase overflow-hidden border transition-all duration-300"
                    style={{
                      borderColor: "var(--neon)",
                      color: "var(--background)",
                      background: "var(--neon)",
                      boxShadow: "0 0 24px oklch(0.88 0.22 195 / 0.5), 0 0 70px oklch(0.88 0.22 195 / 0.12)",
                      cursor: "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 50px oklch(0.88 0.22 195 / 0.85), 0 0 130px oklch(0.88 0.22 195 / 0.28)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px oklch(0.88 0.22 195 / 0.5), 0 0 70px oklch(0.88 0.22 195 / 0.12)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    <span className="relative z-10">Browse Library</span>
                    <span className="absolute inset-0 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300" style={{ background: "oklch(0.75 0.28 195)" }} />
                  </a>

                  <a
                    href="/Luke-s-games01-main/admin.html"
                    data-hover
                    className="px-10 py-3.5 font-mono-cyber text-[11px] tracking-[0.35em] uppercase border transition-all duration-300 flex items-center gap-2"
                    style={{ borderColor: "var(--border-glow)", color: "var(--text-dim)", cursor: "none" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--neon-2)";
                      (e.currentTarget as HTMLElement).style.color = "var(--neon-2)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px oklch(0.78 0.22 280 / 0.45)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border-glow)";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-dim)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    <span>⚙</span>
                    <span>Admin Panel</span>
                  </a>
                </div>
              </div>

              {/* Stat bar */}
              <div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-10"
                style={{ opacity: scrollY > 60 ? 0 : 1, transition: "opacity 0.5s" }}
              >
                {[
                  { label: "GAMES", val: "13" },
                  { label: "PLATFORMS", val: "07" },
                  { label: "PLAYERS", val: "∞" },
                ].map(({ label, val }, i) => (
                  <React.Fragment key={label}>
                    <div className="flex flex-col items-center gap-0.5">
                      <MagneticText strength={8} tag="span" className="font-bold text-xl leading-none" style={{ color: "var(--neon)", textShadow: "0 0 12px var(--neon)" }}>{val}</MagneticText>
                      <MagneticText strength={3} tag="span" className="font-mono-cyber text-[8px] tracking-[0.35em] uppercase" style={{ color: "var(--text-muted)" }}>{label}</MagneticText>
                    </div>
                    {i < 2 && <div className="w-px h-6" style={{ background: "var(--border-glow)" }} />}
                  </React.Fragment>
                ))}
              </div>

              {/* Scroll hint */}
              <div
                className="absolute bottom-10 right-8 flex flex-col items-center gap-2"
                style={{ opacity: scrollY > 50 ? 0 : 1, transition: "opacity 0.5s" }}
              >
                <span className="font-mono-cyber text-[9px] tracking-[0.4em] uppercase rotate-90 mb-1" style={{ color: "var(--text-muted)" }}>
                  Scroll
                </span>
                <div className="w-px h-10" style={{ background: "linear-gradient(to bottom, var(--neon), transparent)", boxShadow: "0 0 4px var(--neon)" }} />
              </div>
            </div>

            {/* Vignette */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 85% 65% at 50% 45%, transparent 35%, oklch(0.04 0.005 195 / 0.75) 100%)" }}
            />
          </section>

        {/* ── Library + vault + footer ───────────────────────────────────── */}
        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Fade bridge from hero into library */}
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none"
            style={{ height: "180px", background: "linear-gradient(to bottom, var(--background) 0%, oklch(0.04 0.005 195 / 0.7) 60%, transparent 100%)", zIndex: 10 }}
          />
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none"
            style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--neon-dim), transparent)", boxShadow: "0 0 12px var(--neon-dim)", zIndex: 11, opacity: 0.35 }}
          />

          {/* ══ LIBRARY ═══════════════════════════════════════════════════ */}
          <section id="library" className="pt-20 pb-24 px-6 md:px-10 lg:px-16" style={{ background: "var(--background)" }}>
            <div className="max-w-screen-xl mx-auto">
              {/* Section header */}
              <div
                ref={libraryReveal.ref}
                className="mb-10"
                style={{
                  opacity: libraryReveal.visible ? 1 : 0,
                  transform: libraryReveal.visible ? "translateY(0)" : "translateY(32px)",
                  clipPath: libraryReveal.visible ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
                  transition: "opacity 0.65s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1), clip-path 0.65s cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px w-6" style={{ background: "var(--neon)", boxShadow: "0 0 6px var(--neon)" }} />
                  <TextScramble text="// Game Library" className="font-mono-cyber text-[10px] tracking-[0.4em] uppercase" style={{ color: "var(--neon)" }} />
                </div>

                <h2
                  className="text-4xl md:text-6xl font-bold tracking-tighter leading-none mb-4 overflow-hidden"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <SplitReveal text="Every Legend," />
                  <br />
                  <SplitReveal text="One Place." style={{ WebkitTextStroke: "1.5px var(--text-muted)" as string, color: "transparent" }} />
                </h2>

                <p className="font-mono-cyber text-sm max-w-md" style={{ color: "var(--text-dim)" }}>
                  Spin to select a cartridge, click it to insert, then hit Play.
                </p>
              </div>

              {/* Cartridge carousel */}
              <CartridgeCarousel
                games={GAMES.map(g => ({ id: g.id, title: g.title, platform: g.platform, year: g.year, hue: g.hue }))}
                onPlay={(game) => { const g = GAMES.find(x => x.id === game.id); if (g) handlePlay(g); }}
              />
            </div>
          </section>

          {/* ══ STATS + FOOTER ═══════════════════════════════════════════ */}
          <footer style={{ borderTop: "1px solid var(--border)", background: "var(--background)" }}>
            {/* Stats strip */}
            <div
              ref={platformReveal.ref}
              className="grid grid-cols-2 md:grid-cols-4 gap-px"
              style={{
                background: "var(--border)",
                opacity: platformReveal.visible ? 1 : 0,
                transform: platformReveal.visible ? "translateY(0)" : "translateY(24px)",
                transition: "opacity 0.65s ease, transform 0.65s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              {([
                { num: "13", label: "Classic Games", hue: 195 },
                { num: "7",  label: "Platforms",     hue: 280 },
                { num: "100%", label: "Browser-Based", hue: 320 },
                { num: "0ms",  label: "No Downloads",  hue: 55  },
              ] as const).map(({ num, label, hue }) => (
                <div key={label} className="flex flex-col items-center justify-center py-10 gap-1.5" style={{ background: "var(--background)" }}>
                  <span
                    className="font-bold leading-none"
                    style={{
                      fontFamily: "'Space Grotesk'", fontSize: "clamp(2rem,5vw,3.25rem)",
                      color: `oklch(0.88 0.22 ${hue})`,
                      textShadow: `0 0 28px oklch(0.65 0.18 ${hue} / 0.7)`,
                    }}
                  >{num}</span>
                  <span className="font-mono-cyber text-[8px] tracking-[0.35em] uppercase" style={{ color: "var(--text-muted)" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="px-8 md:px-12 py-7" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="font-pixel text-[11px] neon-text" style={{ animation: "neon-pulse 4s ease-in-out infinite" }}>GAMESTASH</span>
                  <span className="font-mono-cyber text-[9px] tracking-[0.28em] uppercase" style={{ color: "var(--text-muted)" }}>© 2026</span>
                </div>

                <div className="flex items-center gap-5 flex-wrap justify-center">
                  {(["PRIVACY", "TERMS", "GITHUB"] as const).map((label) => (
                    <a key={label} href="#" className="font-mono-cyber text-[9px] tracking-[0.22em] uppercase transition-colors duration-200"
                      style={{ color: "var(--text-muted)", cursor: "none" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--neon)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
                    >{label}</a>
                  ))}
                  <a
                    href="/Luke-s-games01-main/admin.html"
                    className="font-mono-cyber text-[9px] tracking-[0.22em] uppercase border px-2 py-0.5 transition-all duration-200"
                    style={{ color: "var(--neon-2)", borderColor: "var(--neon-2)", background: "oklch(0.78 0.22 280 / 0.06)", cursor: "none" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "oklch(0.78 0.22 280 / 0.16)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 12px oklch(0.78 0.22 280 / 0.4)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "oklch(0.78 0.22 280 / 0.06)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                  >⚙ ADMIN</a>
                </div>

                <div className="flex items-center gap-2 font-mono-cyber text-[9px] tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--neon)", boxShadow: "0 0 6px var(--neon)", animation: "neon-pulse 2s ease-in-out infinite" }} />
                  All Systems Online
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
