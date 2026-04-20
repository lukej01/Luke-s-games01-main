"use client";

import React, { useState, useEffect, useRef } from "react";
import ParticleHero from "@/components/ui/particle-effect-for-hero";
import { TextScramble } from "@/components/ui/text-scramble";
import { CyberpunkCursor } from "@/components/ui/cyberpunk-cursor";

// ── Game data ──────────────────────────────────────────────────────────────
const GAMES = [
  { id: "super-mario-64",    title: "Super Mario 64",           platform: "N64",  genre: "Platform",  year: "1996", hue: 280 },
  { id: "zelda-oot",         title: "Zelda: Ocarina of Time",   platform: "N64",  genre: "Adventure", year: "1998", hue: 195 },
  { id: "paper-mario",       title: "Paper Mario",              platform: "N64",  genre: "RPG",       year: "2001", hue: 150 },
  { id: "super-mario-world", title: "Super Mario World",        platform: "SNES", genre: "Platform",  year: "1990", hue: 40  },
  { id: "super-mario-3",     title: "Super Mario Bros 3",       platform: "NES",  genre: "Platform",  year: "1988", hue: 25  },
  { id: "punch-out",         title: "Punch-Out!!",              platform: "NES",  genre: "Fighting",  year: "1987", hue: 15  },
  { id: "sonic-2",           title: "Sonic the Hedgehog 2",     platform: "GEN",  genre: "Platform",  year: "1992", hue: 220 },
  { id: "gran-turismo-2",    title: "Gran Turismo 2",           platform: "PS1",  genre: "Racing",    year: "1999", hue: 320 },
  { id: "nba-live-2003",     title: "NBA Live 2003",            platform: "PS1",  genre: "Sports",    year: "2002", hue: 55  },
  { id: "madden-2002",       title: "Madden 2002",              platform: "PS1",  genre: "Sports",    year: "2001", hue: 60  },
  { id: "speed-stars",       title: "Speed Stars",              platform: "GBA",  genre: "Racing",    year: "2003", hue: 170 },
  { id: "lego-batman-1",     title: "LEGO Batman",              platform: "DS",   genre: "Action",    year: "2008", hue: 240 },
  { id: "lego-batman-2",     title: "LEGO Batman 2",            platform: "DS",   genre: "Action",    year: "2012", hue: 245 },
  { id: "lego-star-wars",    title: "LEGO Star Wars",           platform: "DS",   genre: "Action",    year: "2005", hue: 50  },
] as const;

const PLATFORMS = ["ALL", "N64", "SNES", "NES", "GEN", "PS1", "GBA", "DS"] as const;
type Platform = (typeof PLATFORMS)[number];

const BASE = "/Luke-s-games01-main";

// ── Hook: intersection observer for scroll reveals ─────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── GameCard ────────────────────────────────────────────────────────────────
function GameCard({ game, index }: { game: (typeof GAMES)[number]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const { ref, visible } = useReveal(0.1);

  const neon     = `oklch(0.85 0.22 ${game.hue})`;
  const neonDim  = `oklch(0.55 0.18 ${game.hue})`;
  const surface  = `oklch(0.08 0.02 ${game.hue})`;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.5s ${index * 0.05}s ease, transform 0.5s ${index * 0.05}s ease, background 0.3s, border-color 0.3s, box-shadow 0.3s`,
        background: hovered ? surface : "transparent",
        borderColor: hovered ? neon : "oklch(0.20 0.06 195)",
        boxShadow: hovered
          ? `0 0 20px ${neon}33, 0 0 60px ${neonDim}1a, inset 0 0 20px ${neon}0a`
          : "none",
      }}
      className="relative border p-6 cursor-pointer group overflow-hidden"
    >
      {/* Scan line sweep on hover */}
      {hovered && (
        <div
          className="scan-line"
          style={{ background: `linear-gradient(90deg, transparent, ${neon}, transparent)` }}
        />
      )}

      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l" style={{ borderColor: neon, opacity: hovered ? 1 : 0.3, transition: "opacity 0.3s" }} />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r" style={{ borderColor: neon, opacity: hovered ? 1 : 0.3, transition: "opacity 0.3s" }} />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l" style={{ borderColor: neon, opacity: hovered ? 1 : 0.3, transition: "opacity 0.3s" }} />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r" style={{ borderColor: neon, opacity: hovered ? 1 : 0.3, transition: "opacity 0.3s" }} />

      {/* Platform badge */}
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
      <a
        href={`${BASE}/games/${game.id}.html`}
        className="mt-5 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase"
        style={{
          color: neon,
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(-8px)",
          transition: "opacity 0.25s, transform 0.25s",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="font-mono-cyber text-[11px]">▶</span>
        <span>Play Now</span>
      </a>
    </div>
  );
}

// ── Typewriter ──────────────────────────────────────────────────────────────
function Typewriter({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted]     = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) return;
    const t = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), 40);
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
  const [filter, setFilter]       = useState<Platform>("ALL");
  const [scrollY, setScrollY]     = useState(0);
  const libraryReveal             = useReveal(0.05);
  const vaultReveal               = useReveal(0.2);
  const heroRef                   = useRef<HTMLElement>(null);

  const filtered = filter === "ALL" ? GAMES : GAMES.filter(g => g.platform === filter);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroOpacity = Math.max(0, 1 - scrollY / 500);
  const heroY       = scrollY * 0.35;

  return (
    <>
      <CyberpunkCursor />

      <main
        className="text-white min-h-screen overflow-x-hidden"
        style={{ background: "var(--background)" }}
      >

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative w-full h-screen overflow-hidden circuit-bg"
        >
          {/* Particle canvas */}
          <ParticleHero />

          {/* Parallax content layer */}
          <div
            className="absolute inset-0 z-20 flex flex-col"
            style={{ transform: `translateY(${heroY}px)`, opacity: heroOpacity }}
          >
            {/* ── Nav ── */}
            <nav className="flex justify-between items-center px-8 md:px-12 pt-8 pb-0 pointer-events-none">
              {/* Logo */}
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

              {/* Links */}
              <div className="hidden md:flex items-center gap-8 pointer-events-auto">
                {(["GAMES", "LEADERBOARD", "ABOUT", "CONTACT"] as const).map(link => (
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
                      className="absolute -bottom-0.5 left-0 h-px bg-[var(--neon)] transition-all duration-300"
                      style={{ width: "0%", boxShadow: "0 0 6px var(--neon)" }}
                    />
                  </a>
                ))}
              </div>

              {/* Status pill */}
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

            {/* ── Hero content ── */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-12 lg:px-20">

              {/* Label */}
              <div className="mb-6 flex items-center gap-3">
                <div className="h-px w-8 bg-[var(--neon)]" style={{ boxShadow: "0 0 6px var(--neon)" }} />
                <span className="font-mono-cyber text-[10px] tracking-[0.4em] uppercase text-[var(--neon)]">
                  // Classic Vault v2.0
                </span>
              </div>

              {/* Glitch headline */}
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

              {/* Typewriter subtitle */}
              <p
                className="font-mono-cyber text-sm md:text-base mb-10 max-w-lg"
                style={{ color: "var(--text-dim)" }}
              >
                <Typewriter text="14 classic titles. Zero latency. Pure nostalgia." delay={800} />
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#library"
                  data-hover
                  className="relative group px-8 py-3 font-mono-cyber text-[11px] tracking-[0.3em] uppercase overflow-hidden border transition-all duration-300"
                  style={{
                    borderColor: "var(--neon)",
                    color: "var(--background)",
                    background: "var(--neon)",
                    boxShadow: "0 0 20px oklch(0.88 0.22 195 / 0.4), 0 0 60px oklch(0.88 0.22 195 / 0.1)",
                  }}
                >
                  <span className="relative z-10">Browse Library</span>
                  <span
                    className="absolute inset-0 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300"
                    style={{ background: "oklch(0.75 0.28 195)" }}
                  />
                </a>

                <button
                  data-hover
                  className="group px-8 py-3 font-mono-cyber text-[11px] tracking-[0.3em] uppercase border transition-all duration-300"
                  style={{
                    borderColor: "var(--border-glow)",
                    color: "var(--text-dim)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--neon-2)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--neon-2)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 16px oklch(0.78 0.22 280 / 0.3)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-glow)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                  }}
                >
                  Leaderboard
                </button>
              </div>
            </div>

            {/* ── Scroll hint ── */}
            <div
              className="absolute bottom-10 right-8 flex flex-col items-center gap-2"
              style={{ opacity: scrollY > 50 ? 0 : 1, transition: "opacity 0.3s" }}
            >
              <span className="font-mono-cyber text-[9px] tracking-[0.4em] uppercase rotate-90 mb-1" style={{ color: "var(--text-muted)" }}>
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

            {/* ── Stat bar (bottom left) ── */}
            <div className="absolute bottom-8 left-8 flex items-center gap-6">
              {[
                { label: "GAMES",     val: "14" },
                { label: "PLATFORMS", val: "07" },
                { label: "PLAYERS",   val: "∞"  },
              ].map(({ label, val }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span
                    className="font-bold text-lg leading-none"
                    style={{ color: "var(--neon)", textShadow: "0 0 10px var(--neon)" }}
                  >
                    {val}
                  </span>
                  <span className="font-mono-cyber text-[8px] tracking-[0.35em] uppercase" style={{ color: "var(--text-muted)" }}>
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
              background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, oklch(0.04 0.005 195 / 0.7) 100%)",
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
                <div className="h-px w-6" style={{ background: "var(--neon)", boxShadow: "0 0 6px var(--neon)" }} />
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

              <p className="font-mono-cyber text-sm max-w-md" style={{ color: "var(--text-dim)" }}>
                Select a platform or browse the full collection. Click any title to launch instantly.
              </p>
            </div>

            {/* Platform filter bar */}
            <div
              className="flex flex-wrap gap-2 mb-10"
              style={{
                opacity: libraryReveal.visible ? 1 : 0,
                transition: "opacity 0.6s 0.2s ease",
              }}
            >
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  data-hover
                  onClick={() => setFilter(p)}
                  className="px-4 py-1.5 font-mono-cyber text-[10px] tracking-[0.3em] uppercase border transition-all duration-200"
                  style={{
                    borderColor: filter === p ? "var(--neon)" : "var(--border)",
                    color:        filter === p ? "var(--background)" : "var(--text-dim)",
                    background:   filter === p ? "var(--neon)" : "transparent",
                    boxShadow:    filter === p ? "0 0 16px oklch(0.88 0.22 195 / 0.35)" : "none",
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
                <GameCard key={game.id} game={game} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ══ VAULT BANNER ══════════════════════════════════════════════════ */}
        <section
          className="relative py-32 px-8 md:px-12 lg:px-20 overflow-hidden circuit-bg"
          style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
        >
          {/* Background glow blobs */}
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
            {/* Oversized faded background text */}
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
                  <div className="h-px w-6" style={{ background: "var(--neon-2)", boxShadow: "0 0 6px var(--neon-2)" }} />
                  <span className="font-mono-cyber text-[10px] tracking-[0.4em] uppercase" style={{ color: "var(--neon-2)" }}>
                    // The Vault
                  </span>
                </div>

                <h2
                  className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tighter"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <span className="block" style={{ color: "var(--foreground)" }}>No downloads.</span>
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
                  { num: "14",     label: "Classic Games" },
                  { num: "6+",     label: "Platforms" },
                  { num: "100%",   label: "Browser-Based" },
                  { num: "0ms",    label: "Download Time" },
                ].map(({ num, label }, i) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}
                  >
                    <span className="font-mono-cyber text-[10px] tracking-widest uppercase" style={{ color: "var(--text-dim)" }}>
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
        <footer
          className="px-8 md:px-12 py-12"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

            {/* Brand */}
            <div className="flex flex-col gap-1">
              <span
                className="font-pixel text-sm neon-text"
                style={{ animation: "neon-pulse 4s ease-in-out infinite" }}
              >
                GAMESTASH
              </span>
              <span className="font-mono-cyber text-[9px] tracking-[0.35em] uppercase" style={{ color: "var(--text-muted)" }}>
                © 2026 — Classic titles, rediscovered.
              </span>
            </div>

            {/* Links */}
            <div className="flex gap-8">
              {(["PRIVACY", "TERMS", "GITHUB"] as const).map(label => (
                <TextScramble
                  key={label}
                  text={label}
                  className="font-mono-cyber text-[10px] tracking-[0.25em] uppercase"
                  style={{ color: "var(--text-muted)" } as React.CSSProperties}
                />
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 font-mono-cyber text-[9px] tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--neon)", boxShadow: "0 0 6px var(--neon)", animation: "neon-pulse 2s ease-in-out infinite" }}
              />
              All Systems Online
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
