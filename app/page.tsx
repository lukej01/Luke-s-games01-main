"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { HeroBackground } from "@/components/ui/hero-background";
import { TextScramble } from "@/components/ui/text-scramble";
import { CyberpunkCursor } from "@/components/ui/cyberpunk-cursor";

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
const PLATFORMS = ["ALL", "N64", "SNES", "NES", "GEN", "PS1", "GBA", "DS"] as const;
type Platform = (typeof PLATFORMS)[number];

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

// ── Game Modal ────────────────────────────────────────────────────────────
function GameModal({ game, onClose }: { game: Game | null; onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (game) {
      document.body.style.overflow = "hidden";
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [game]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!game) return null;

  const neon = `oklch(0.85 0.22 ${game.hue})`;
  const neonDim = `oklch(0.55 0.18 ${game.hue})`;
  const surf = `oklch(0.07 0.025 ${game.hue})`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={game.title}
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 md:p-8"
      style={{
        background: visible ? "oklch(0.04 0.005 195 / 0.88)" : "transparent",
        backdropFilter: "blur(14px)",
        transition: "background 0.3s ease",
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg border overflow-hidden"
        style={{
          background: surf,
          borderColor: neon,
          boxShadow: `0 0 50px ${neon}2a, 0 0 120px ${neonDim}14, inset 0 0 30px ${neon}06`,
          transform: visible ? "translateY(0) scale(1)" : "translateY(28px) scale(0.93)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${neon}, transparent)` }} />

        {/* Corner brackets */}
        {(["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"] as const).map((cls, i) => (
          <div key={i} className={`absolute w-5 h-5 ${cls}`} style={{ borderColor: neon }} />
        ))}

        <div className="p-8">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 font-mono-cyber text-[11px] tracking-widest transition-all duration-200"
            style={{ color: neonDim }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = neon; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = neonDim; }}
            aria-label="Close"
          >
            [ ESC ]
          </button>

          {/* Platform + year row */}
          <div className="flex items-center gap-3 mb-6">
            <span
              className="font-mono-cyber text-[9px] tracking-[0.35em] px-2 py-1 border"
              style={{ color: neon, borderColor: `${neon}55`, background: `${neon}10` }}
            >
              {game.platform}
            </span>
            <span className="font-mono-cyber text-[9px] tracking-widest" style={{ color: neonDim }}>
              {game.year}
            </span>
            <span
              className="ml-auto font-mono-cyber text-[9px] tracking-[0.25em]"
              style={{ color: neonDim }}
            >
              // {game.genre.toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <h2
            className="text-3xl md:text-4xl font-bold leading-tight mb-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: neon,
              textShadow: `0 0 20px ${neon}, 0 0 50px ${neonDim}`,
            }}
          >
            {game.title}
          </h2>

          {/* Description */}
          <p className="font-mono-cyber text-[12px] leading-relaxed mb-8" style={{ color: "oklch(0.60 0.06 195)" }}>
            {game.desc}
          </p>

          {/* Divider */}
          <div className="mb-6 h-px" style={{ background: `linear-gradient(90deg, ${neon}40, transparent)` }} />

          {/* Controls hint */}
          <div className="flex flex-wrap gap-4 mb-8">
            {[
              { key: "WASD / Arrow Keys", action: "Move" },
              { key: "Z / Enter", action: "Action" },
              { key: "ESC", action: "Menu" },
            ].map(({ key, action }) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="font-mono-cyber text-[9px] px-1.5 py-0.5 border tracking-wider"
                  style={{ color: neon, borderColor: `${neon}44`, background: `${neon}08` }}
                >
                  {key}
                </span>
                <span className="font-mono-cyber text-[9px] tracking-widest" style={{ color: neonDim }}>
                  {action}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={`${BASE}/games/${game.id}.html`}
            className="group relative flex items-center justify-center gap-3 w-full py-4 font-mono-cyber text-[11px] tracking-[0.35em] uppercase overflow-hidden border transition-all duration-300"
            style={{
              borderColor: neon,
              color: "oklch(0.04 0.005 195)",
              background: neon,
              boxShadow: `0 0 24px ${neon}55, 0 0 60px ${neonDim}22`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${neon}88, 0 0 100px ${neonDim}33`;
              (e.currentTarget as HTMLElement).style.letterSpacing = "0.45em";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${neon}55, 0 0 60px ${neonDim}22`;
              (e.currentTarget as HTMLElement).style.letterSpacing = "0.35em";
            }}
          >
            <span className="font-mono-cyber text-[13px]">▶</span>
            <span>Launch Game</span>
          </a>
        </div>

        {/* Bottom accent */}
        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${neon}55, transparent)` }} />
      </div>
    </div>
  );
}

// ── GameCard ────────────────────────────────────────────────────────────────
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
  const { ref, visible } = useReveal(0.1);

  const neon = `oklch(0.85 0.22 ${game.hue})`;
  const neonDim = `oklch(0.55 0.18 ${game.hue})`;
  const surface = `oklch(0.08 0.02 ${game.hue})`;

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`View ${game.title}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered ? "translateY(-3px) scale(1.01)" : "translateY(0) scale(1)"
          : "translateY(24px)",
        transition: `opacity 0.5s ${index * 0.05}s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1), background 0.3s, border-color 0.3s, box-shadow 0.3s`,
        background: hovered ? surface : "transparent",
        borderColor: hovered ? neon : "oklch(0.20 0.06 195)",
        boxShadow: hovered
          ? `0 0 24px ${neon}33, 0 0 60px ${neonDim}18, inset 0 0 20px ${neon}08`
          : "none",
        cursor: "pointer",
      }}
      className="relative border p-6 group overflow-hidden select-none"
    >
      {/* Scanline sweep on hover */}
      {hovered && (
        <div
          className="scan-line"
          style={{ background: `linear-gradient(90deg, transparent, ${neon}, transparent)` }}
        />
      )}

      {/* Corner brackets */}
      {(["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"] as const).map((cls, i) => (
        <div
          key={i}
          className={`absolute w-4 h-4 ${cls}`}
          style={{ borderColor: neon, opacity: hovered ? 1 : 0.3, transition: "opacity 0.3s" }}
        />
      ))}

      {/* Platform + year */}
      <div className="flex items-center justify-between mb-6">
        <span
          className="font-mono-cyber text-[9px] tracking-[0.3em] px-2 py-1 border"
          style={{ color: neon, borderColor: `${neon}55`, background: `${neon}0d` }}
        >
          {game.platform}
        </span>
        <span className="font-mono-cyber text-[9px] tracking-widest" style={{ color: neonDim }}>
          {game.year}
        </span>
      </div>

      {/* Title */}
      <h3
        className="font-bold text-lg leading-tight mb-3"
        style={{
          color: hovered ? neon : "oklch(0.88 0.02 195)",
          textShadow: hovered ? `0 0 12px ${neon}, 0 0 30px ${neonDim}` : "none",
          transition: "color 0.3s, text-shadow 0.3s",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {game.title}
      </h3>

      {/* Genre */}
      <p className="font-mono-cyber text-[10px] tracking-[0.25em]" style={{ color: neonDim }}>
        // {game.genre.toUpperCase()}
      </p>

      {/* Play CTA */}
      <div
        className="mt-5 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase"
        style={{
          color: neon,
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(-10px)",
          transition: "opacity 0.25s, transform 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <span className="font-mono-cyber text-[11px]">▶</span>
        <span>View Game</span>
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
          animation:
            displayed.length < text.length ? "none" : "blink-cursor 0.8s step-end infinite",
        }}
      />
    </span>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function Home() {
  const [filter, setFilter] = useState<Platform>("ALL");
  const [scrollY, setScrollY] = useState(0);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const libraryReveal = useReveal(0.05);
  const vaultReveal = useReveal(0.2);
  const heroRef = useRef<HTMLElement>(null);

  const filtered = filter === "ALL" ? GAMES : GAMES.filter((g) => g.platform === filter);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeModal = useCallback(() => setSelectedGame(null), []);

  const heroOpacity = Math.max(0, 1 - scrollY / 500);
  const heroY = scrollY * 0.3;

  return (
    <>
      <CyberpunkCursor />
      <GameModal game={selectedGame} onClose={closeModal} />

      <main
        className="text-white min-h-screen overflow-x-hidden"
        style={{ background: "var(--background)" }}
      >
        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative w-full h-screen overflow-hidden circuit-bg"
        >
          {/* Interactive cursor-reactive background */}
          <HeroBackground />

          {/* Parallax content layer */}
          <div
            className="absolute inset-0 z-20 flex flex-col"
            style={{
              transform: `translateY(${heroY}px)`,
              opacity: heroOpacity,
              willChange: "transform, opacity",
            }}
          >
            {/* Nav */}
            <nav className="flex justify-between items-center px-8 md:px-12 pt-8 pb-0 pointer-events-none">
              <div className="pointer-events-auto flex flex-col gap-0.5">
                <span
                  className="font-pixel text-[9px] neon-text tracking-wide"
                  style={{ animation: "neon-pulse 3s ease-in-out infinite" }}
                >
                  GS
                </span>
                <span className="font-mono-cyber text-[8px] text-[var(--text-muted)] tracking-[0.4em] uppercase">
                  GameStash
                </span>
              </div>

              <div className="hidden md:flex items-center gap-8 pointer-events-auto">
                {(["GAMES", "LEADERBOARD", "ABOUT", "CONTACT"] as const).map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="relative font-mono-cyber text-[11px] tracking-[0.25em] uppercase group"
                    style={{ color: "var(--text-dim)" }}
                  >
                    <span className="group-hover:text-[var(--neon)] transition-colors duration-200">
                      {link}
                    </span>
                    <span
                      className="absolute -bottom-0.5 left-0 h-px bg-[var(--neon)] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
                      style={{ boxShadow: "0 0 6px var(--neon)" }}
                    />
                  </a>
                ))}
              </div>

              <div
                className="pointer-events-auto hidden md:flex items-center gap-2 border px-3 py-1.5 font-mono-cyber text-[9px] tracking-widest uppercase"
                style={{
                  borderColor: "var(--border-glow)",
                  color: "var(--neon)",
                  background: "oklch(0.88 0.22 195 / 0.06)",
                  boxShadow: "0 0 10px oklch(0.88 0.22 195 / 0.15)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[var(--neon)]"
                  style={{ animation: "neon-pulse 1.5s ease-in-out infinite" }}
                />
                Online
              </div>
            </nav>

            {/* Hero content */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-12 lg:px-20">
              <div className="mb-6 flex items-center gap-3">
                <div
                  className="h-px w-8 bg-[var(--neon)]"
                  style={{ boxShadow: "0 0 6px var(--neon)" }}
                />
                <span className="font-mono-cyber text-[10px] tracking-[0.4em] uppercase text-[var(--neon)]">
                  // Classic Vault v2.0
                </span>
              </div>

              <h1
                className="text-[clamp(3.5rem,10vw,9rem)] font-bold leading-none tracking-tighter mb-4"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span
                  className="glitch-wrap block"
                  data-text="GAME"
                  style={{ color: "var(--foreground)" }}
                >
                  GAME
                </span>
                <span
                  className="glitch-wrap block"
                  data-text="STASH"
                  style={{
                    WebkitTextStroke: "2px var(--neon)",
                    color: "transparent",
                    textShadow: "none",
                    filter: "drop-shadow(0 0 16px var(--neon))",
                  }}
                >
                  STASH
                </span>
              </h1>

              <p
                className="font-mono-cyber text-sm md:text-base mb-10 max-w-lg"
                style={{ color: "var(--text-dim)" }}
              >
                <Typewriter text="13 classic titles. Zero latency. Pure nostalgia." delay={800} />
              </p>

              <div className="flex flex-wrap items-center gap-4">
                {/* Primary CTA */}
                <a
                  href="#library"
                  data-hover
                  className="relative group px-8 py-3 font-mono-cyber text-[11px] tracking-[0.3em] uppercase overflow-hidden border transition-all duration-300"
                  style={{
                    borderColor: "var(--neon)",
                    color: "var(--background)",
                    background: "var(--neon)",
                    boxShadow:
                      "0 0 20px oklch(0.88 0.22 195 / 0.4), 0 0 60px oklch(0.88 0.22 195 / 0.1)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 0 40px oklch(0.88 0.22 195 / 0.7), 0 0 100px oklch(0.88 0.22 195 / 0.2)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 0 20px oklch(0.88 0.22 195 / 0.4), 0 0 60px oklch(0.88 0.22 195 / 0.1)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  <span className="relative z-10">Browse Library</span>
                  <span
                    className="absolute inset-0 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300"
                    style={{ background: "oklch(0.75 0.28 195)" }}
                  />
                </a>

                {/* Secondary CTA */}
                <button
                  data-hover
                  className="group relative px-8 py-3 font-mono-cyber text-[11px] tracking-[0.3em] uppercase border overflow-hidden transition-all duration-300"
                  style={{
                    borderColor: "var(--border-glow)",
                    color: "var(--text-dim)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--neon-2)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--neon-2)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 0 20px oklch(0.78 0.22 280 / 0.35)";
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-glow)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                  }}
                >
                  Leaderboard
                </button>
              </div>
            </div>

            {/* Scroll hint */}
            <div
              className="absolute bottom-10 right-8 flex flex-col items-center gap-2"
              style={{ opacity: scrollY > 50 ? 0 : 1, transition: "opacity 0.4s" }}
            >
              <span
                className="font-mono-cyber text-[9px] tracking-[0.4em] uppercase rotate-90 mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Scroll
              </span>
              <div
                className="w-px h-12"
                style={{
                  background: "linear-gradient(to bottom, var(--neon), transparent)",
                  boxShadow: "0 0 4px var(--neon)",
                }}
              />
            </div>

            {/* Stat bar */}
            <div className="absolute bottom-8 left-8 flex items-center gap-6">
              {[
                { label: "GAMES", val: "13" },
                { label: "PLATFORMS", val: "07" },
                { label: "PLAYERS", val: "∞" },
              ].map(({ label, val }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span
                    className="font-bold text-lg leading-none"
                    style={{ color: "var(--neon)", textShadow: "0 0 10px var(--neon)" }}
                  >
                    {val}
                  </span>
                  <span
                    className="font-mono-cyber text-[8px] tracking-[0.35em] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vignette */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, oklch(0.04 0.005 195 / 0.7) 100%)",
            }}
          />
        </section>

        {/* ══ LIBRARY SECTION ═══════════════════════════════════════════════ */}
        <section id="library" className="py-24 px-8 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            {/* Section header */}
            <div
              ref={libraryReveal.ref}
              className="mb-14"
              style={{
                opacity: libraryReveal.visible ? 1 : 0,
                transform: libraryReveal.visible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.6s ease, transform 0.6s ease",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-px w-6"
                  style={{ background: "var(--neon)", boxShadow: "0 0 6px var(--neon)" }}
                />
                <span className="font-mono-cyber text-[10px] tracking-[0.4em] uppercase text-[var(--neon)]">
                  // Game Library
                </span>
              </div>

              <h2
                className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-6"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Every Legend,
                <br />
                <span style={{ WebkitTextStroke: "1.5px var(--text-muted)", color: "transparent" }}>
                  One Place.
                </span>
              </h2>

              <p
                className="font-mono-cyber text-sm max-w-md"
                style={{ color: "var(--text-dim)" }}
              >
                Select a platform or browse the full collection. Click any title to view and launch.
              </p>
            </div>

            {/* Platform filter */}
            <div
              className="flex flex-wrap gap-2 mb-10"
              style={{
                opacity: libraryReveal.visible ? 1 : 0,
                transition: "opacity 0.6s 0.2s ease",
              }}
            >
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  data-hover
                  onClick={() => setFilter(p)}
                  className="px-4 py-1.5 font-mono-cyber text-[10px] tracking-[0.3em] uppercase border transition-all duration-200"
                  style={{
                    borderColor: filter === p ? "var(--neon)" : "var(--border)",
                    color: filter === p ? "var(--background)" : "var(--text-dim)",
                    background: filter === p ? "var(--neon)" : "transparent",
                    boxShadow:
                      filter === p ? "0 0 16px oklch(0.88 0.22 195 / 0.35)" : "none",
                    transform: filter === p ? "none" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (filter !== p) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--neon)";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--neon)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filter !== p) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)";
                    }
                  }}
                >
                  {p}
                </button>
              ))}
              <span
                className="ml-auto font-mono-cyber text-[10px] tracking-widest self-center"
                style={{ color: "var(--text-muted)" }}
              >
                {filtered.length} titles
              </span>
            </div>

            {/* Divider */}
            <div
              className="mb-10 h-px w-full"
              style={{ background: "linear-gradient(90deg, var(--border-glow), transparent)" }}
            />

            {/* Game grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map((game, i) => (
                <GameCard
                  key={game.id}
                  game={game}
                  index={i}
                  onClick={() => setSelectedGame(game)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ══ VAULT BANNER ══════════════════════════════════════════════════ */}
        <section
          className="relative py-32 px-8 md:px-12 lg:px-20 overflow-hidden circuit-bg"
          style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none -translate-y-1/2"
            style={{
              background: "radial-gradient(circle, oklch(0.88 0.22 195 / 0.06) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none -translate-y-1/2"
            style={{
              background: "radial-gradient(circle, oklch(0.78 0.22 280 / 0.06) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />

          <div
            ref={vaultReveal.ref}
            className="max-w-7xl mx-auto relative z-10"
            style={{
              opacity: vaultReveal.visible ? 1 : 0,
              transform: vaultReveal.visible ? "translateY(0)" : "translateY(32px)",
              transition: "opacity 0.8s ease, transform 0.8s ease",
            }}
          >
            <div
              className="absolute -top-8 left-0 font-bold pointer-events-none select-none leading-none"
              style={{
                fontSize: "clamp(80px, 18vw, 220px)",
                fontFamily: "'Space Grotesk', sans-serif",
                WebkitTextStroke: "1px oklch(0.88 0.22 195 / 0.06)",
                color: "transparent",
                letterSpacing: "-0.04em",
              }}
            >
              VAULT
            </div>

            <div className="relative flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="h-px w-6"
                    style={{ background: "var(--neon-2)", boxShadow: "0 0 6px var(--neon-2)" }}
                  />
                  <span
                    className="font-mono-cyber text-[10px] tracking-[0.4em] uppercase"
                    style={{ color: "var(--neon-2)" }}
                  >
                    // The Vault
                  </span>
                </div>

                <h2
                  className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tighter"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <span className="block" style={{ color: "var(--foreground)" }}>
                    No downloads.
                  </span>
                  <span
                    className="block"
                    style={{
                      color: "var(--neon-2)",
                      textShadow: "0 0 20px var(--neon-2), 0 0 60px var(--neon-2-dim)",
                    }}
                  >
                    No installs.
                  </span>
                  <span
                    className="block"
                    style={{ WebkitTextStroke: "1.5px var(--text-muted)", color: "transparent" }}
                  >
                    Just play.
                  </span>
                </h2>
              </div>

              {/* Stats panel */}
              <div
                className="flex flex-col gap-0 border p-8 min-w-[260px]"
                style={{
                  borderColor: "var(--border-glow)",
                  background: "var(--surface)",
                  boxShadow: "0 0 30px oklch(0.88 0.22 195 / 0.1)",
                  animation: "neon-border-breathe 4s ease-in-out infinite",
                }}
              >
                {[
                  { num: "13", label: "Classic Games" },
                  { num: "7+", label: "Platforms" },
                  { num: "100%", label: "Browser-Based" },
                  { num: "0ms", label: "Download Time" },
                ].map(({ num, label }, i) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}
                  >
                    <span
                      className="font-mono-cyber text-[10px] tracking-widest uppercase"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: "var(--neon)", textShadow: "0 0 12px var(--neon-dim)" }}
                    >
                      {num}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
        <footer className="px-8 md:px-12 py-12" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex flex-col gap-1">
              <span
                className="font-pixel text-sm neon-text"
                style={{ animation: "neon-pulse 4s ease-in-out infinite" }}
              >
                GAMESTASH
              </span>
              <span
                className="font-mono-cyber text-[9px] tracking-[0.35em] uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                © 2026 — Classic titles, rediscovered.
              </span>
            </div>

            <div className="flex gap-8">
              {(["PRIVACY", "TERMS", "GITHUB"] as const).map((label) => (
                <TextScramble
                  key={label}
                  text={label}
                  className="font-mono-cyber text-[10px] tracking-[0.25em] uppercase"
                  style={{ color: "var(--text-muted)" } as React.CSSProperties}
                />
              ))}
            </div>

            <div
              className="flex items-center gap-2 font-mono-cyber text-[9px] tracking-widest uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "var(--neon)",
                  boxShadow: "0 0 6px var(--neon)",
                  animation: "neon-pulse 2s ease-in-out infinite",
                }}
              />
              All Systems Online
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
