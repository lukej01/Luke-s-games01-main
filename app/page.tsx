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

// ── CartInsertOverlay — console insert animation before game launches ─────
function CartInsertOverlay({ game, onDone }: { game: Game | null; onDone: (g: Game) => void }) {
  const [phase, setPhase] = useState(0);
  const [screenText, setScreenText] = useState("INSERT GAME");
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!game) { setPhase(0); setScreenText("INSERT GAME"); return; }
    setPhase(1);
    setScreenText("INSERT GAME");
    const t1 = setTimeout(() => setPhase(2), 80);
    const t2 = setTimeout(() => setPhase(3), 650);
    const t3 = setTimeout(() => { setPhase(4); setScreenText(game.title.toUpperCase()); }, 870);
    const t4 = setTimeout(() => setPhase(5), 1150);
    const t5 = setTimeout(() => doneRef.current(game), 1450);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [game]);

  if (!game || phase === 0) return null;

  const neon    = `oklch(0.85 0.22 ${game.hue})`;
  const neonDim = `oklch(0.55 0.18 ${game.hue})`;
  const isOn    = phase >= 4;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9100,
        background: `oklch(0.02 0.01 ${game.hue} / 0.97)`,
        backdropFilter: "blur(14px)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        opacity: phase >= 1 ? 1 : 0,
        transition: "opacity 0.18s ease",
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: "absolute", width: 560, height: 560, borderRadius: "50%",
        background: `radial-gradient(circle, ${neon}10 0%, transparent 70%)`,
        filter: "blur(50px)",
        opacity: isOn ? 1 : 0, transition: "opacity 0.6s",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", width: 280 }}>
        {/* Cartridge — slides in from above */}
        <div style={{
          display: "flex", justifyContent: "center",
          height: phase >= 3 ? 18 : 128,
          overflow: "hidden",
          transition: "height 0.48s cubic-bezier(0.5,0,0.5,1)",
          marginBottom: -2,
        }}>
          <div style={{
            width: 108, height: 128, flexShrink: 0,
            background: `linear-gradient(160deg, oklch(0.30 0.16 ${game.hue}), oklch(0.20 0.12 ${game.hue}))`,
            border: `1px solid ${neon}88`,
            borderRadius: "5px 5px 2px 2px",
            boxShadow: `0 0 32px ${neon}66, inset 0 1px 0 rgba(255,255,255,0.18)`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: 10,
            transform: phase >= 2 ? "translateY(0)" : "translateY(-160px)",
            transition: "transform 0.52s cubic-bezier(0.5,0,0.5,1) 0.04s",
          }}>
            <div style={{
              width: "100%", flex: 1,
              background: `linear-gradient(135deg, oklch(0.22 0.10 ${game.hue}), oklch(0.14 0.07 ${game.hue}))`,
              border: `1px solid ${neon}55`, borderRadius: 2,
              display: "flex", alignItems: "center", justifyContent: "center", padding: 4,
            }}>
              <span style={{
                fontFamily: "'Press Start 2P'", fontSize: 5, color: neon, textAlign: "center",
                textShadow: `0 0 8px ${neon}`, lineHeight: 1.7,
              }}>
                {game.title.slice(0, 14).toUpperCase()}
              </span>
            </div>
            <span style={{ fontFamily: "Share Tech Mono", fontSize: 7, color: neonDim, letterSpacing: "0.14em" }}>
              {game.platform}
            </span>
            <div style={{ display: "flex", gap: 3.5 }}>
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} style={{ width: 3, height: 7, background: `oklch(0.45 0.08 ${game.hue + 20})`, borderRadius: "0 0 1px 1px" }} />
              ))}
            </div>
          </div>
        </div>

        {/* Console body */}
        <div style={{
          background: `linear-gradient(160deg, oklch(0.16 0.07 ${game.hue}), oklch(0.10 0.04 ${game.hue}))`,
          border: `1px solid ${isOn ? `${neon}44` : "rgba(255,255,255,0.06)"}`,
          borderRadius: 10,
          padding: "18px 22px 22px",
          boxShadow: isOn
            ? `0 0 70px ${neon}22, 0 0 140px ${neon}0d, 0 28px 90px rgba(0,0,0,0.88), inset 0 1px 0 rgba(255,255,255,0.06)`
            : `0 28px 90px rgba(0,0,0,0.88), inset 0 1px 0 rgba(255,255,255,0.04)`,
          transform: phase >= 1 ? "translateY(0) scale(1)" : "translateY(40px) scale(0.9)",
          opacity: phase >= 1 ? 1 : 0,
          transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.3s, border-color 0.4s, box-shadow 0.5s",
        }}>
          {/* Cart slot ridge */}
          <div style={{
            height: 8, width: "55%", margin: "0 auto 16px",
            background: "oklch(0.02 0.005 195)",
            border: `1px solid ${isOn ? `${neon}66` : "rgba(255,255,255,0.07)"}`,
            borderRadius: 2,
            boxShadow: isOn ? `inset 0 0 8px ${neon}33` : "inset 0 2px 5px rgba(0,0,0,0.8)",
            transition: "all 0.35s",
          }} />

          {/* Screen */}
          <div style={{
            height: 78,
            background: isOn ? `oklch(0.04 0.025 ${game.hue})` : "oklch(0.02 0.005 195)",
            border: `1px solid ${isOn ? `${neon}88` : "rgba(255,255,255,0.06)"}`,
            borderRadius: 4, marginBottom: 16,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
            transition: "all 0.35s",
            boxShadow: isOn ? `0 0 16px ${neon}22, inset 0 0 14px ${neon}14` : "inset 0 3px 7px rgba(0,0,0,0.65)",
            overflow: "hidden", position: "relative",
          }}>
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)",
            }} />
            <span style={{
              fontFamily: "'Press Start 2P'", fontSize: isOn ? 7 : 6,
              color: isOn ? neon : "oklch(0.16 0.04 195)",
              textShadow: isOn ? `0 0 10px ${neon}, 0 0 28px ${neonDim}` : "none",
              textAlign: "center", padding: "0 10px",
              transition: "all 0.35s", position: "relative",
            }}>
              {screenText}
            </span>
            {isOn && (
              <span style={{
                fontFamily: "Share Tech Mono", fontSize: 8, color: neonDim, letterSpacing: "0.22em",
                opacity: phase >= 5 ? 1 : 0, transition: "opacity 0.3s", position: "relative",
              }}>
                {game.platform} · {game.year}
              </span>
            )}
          </div>

          {/* Status row */}
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 9, height: 9, borderRadius: "50%", flexShrink: 0,
              background: isOn ? neon : "oklch(0.06 0.02 195)",
              boxShadow: isOn ? `0 0 10px ${neon}, 0 0 26px ${neon}88, 0 0 52px ${neon}44` : "none",
              transition: "all 0.35s",
              animation: isOn ? "neon-pulse 1.2s ease-in-out infinite" : "none",
            }} />
            <span style={{
              fontFamily: "Share Tech Mono", fontSize: 8, flex: 1,
              color: isOn ? neon : "oklch(0.22 0.04 195)",
              letterSpacing: "0.18em", transition: "color 0.35s",
            }}>
              {phase >= 5 ? "LAUNCHING..." : isOn ? "BOOTING..." : "READY"}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {[neon, neonDim].map((c, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: isOn ? c : "oklch(0.05 0.015 195)",
                  boxShadow: isOn ? `0 0 7px ${c}99` : "none",
                  transition: `all 0.3s ${i * 0.07}s`,
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 26, fontFamily: "Share Tech Mono", fontSize: 8,
        color: `oklch(0.25 0.04 ${game.hue})`, letterSpacing: "0.32em",
        opacity: isOn ? 1 : 0, transition: "opacity 0.4s 0.25s",
      }}>
        LOADING GAME DATA...
      </div>
    </div>
  );
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
const PLATFORMS = [
  { id: "NES",  label: "Nintendo",       games: 2, hue: 15  },
  { id: "SNES", label: "Super Nintendo", games: 1, hue: 40  },
  { id: "N64",  label: "Nintendo 64",    games: 3, hue: 280 },
  { id: "GEN",  label: "Sega Genesis",   games: 1, hue: 220 },
  { id: "PS1",  label: "PlayStation",    games: 3, hue: 320 },
  { id: "DS",   label: "Nintendo DS",    games: 3, hue: 195 },
  { id: "PC",   label: "Browser",        games: 1, hue: 55  },
];

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [insertingGame, setInsertingGame] = useState<Game | null>(null);
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
    setInsertingGame(game);
  }, []);

  // Hero content fades as library slides over it
  const heroOpacity = Math.max(0, 1 - scrollY / 360);
  const heroParallax = scrollY * 0.28;

  return (
    <>
      <CyberpunkCursor />
      <HeroBackground />
      <CartInsertOverlay game={insertingGame} onDone={(g) => { setInsertingGame(null); setPlayingGame(g); }} />
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
                  {(["GAMES", "LEADERBOARD"] as const).map((link) => (
                    <a
                      key={link}
                      href={link === "GAMES" ? "#library" : "#"}
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

                <h1
                  className="text-[clamp(4rem,11vw,10rem)] font-bold leading-none tracking-tighter mb-6"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", transform: `translateY(${heroParallax}px)`, willChange: "transform" }}
                >
                  <MagneticText strength={10} tag="span" className="glitch-wrap block" style={{ color: "var(--foreground)" }}>GAME</MagneticText>
                  <MagneticText strength={10} tag="span" className="glitch-wrap block" style={{ WebkitTextStroke: "2px var(--neon)", color: "transparent", filter: "drop-shadow(0 0 20px var(--neon))" }}>STASH</MagneticText>
                </h1>

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

                  <button
                    data-hover
                    className="px-10 py-3.5 font-mono-cyber text-[11px] tracking-[0.35em] uppercase border transition-all duration-300"
                    style={{ borderColor: "var(--border-glow)", color: "var(--text-dim)", cursor: "none" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--neon-2)";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--neon-2)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 28px oklch(0.78 0.22 280 / 0.45)";
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)";
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

          {/* ══ PLATFORM SHOWCASE ═════════════════════════════════════════ */}
          <section
            className="relative py-24 px-8 md:px-12 lg:px-20 overflow-hidden"
            style={{ borderTop: "1px solid var(--border)", background: "var(--background)" }}
          >
            {/* Ambient glows */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(ellipse 60% 50% at 20% 50%, oklch(0.88 0.22 195 / 0.04) 0%, transparent 70%)",
            }} />
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(ellipse 50% 50% at 80% 50%, oklch(0.78 0.22 280 / 0.04) 0%, transparent 70%)",
            }} />

            <div
              ref={platformReveal.ref}
              className="max-w-screen-xl mx-auto"
            >
              {/* Section header */}
              <div
                className="mb-14 text-center"
                style={{
                  opacity: platformReveal.visible ? 1 : 0,
                  transform: platformReveal.visible ? "translateY(0)" : "translateY(40px)",
                  transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, var(--neon))", boxShadow: "0 0 6px var(--neon)" }} />
                  <TextScramble text="// Platform Archive" className="font-mono-cyber text-[10px] tracking-[0.4em] uppercase" style={{ color: "var(--neon)" }} />
                  <div className="h-px w-10" style={{ background: "linear-gradient(90deg, var(--neon), transparent)", boxShadow: "0 0 6px var(--neon)" }} />
                </div>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <SplitReveal text="7 Platforms." />
                  <br />
                  <SplitReveal text="One Vault." style={{ WebkitTextStroke: "1.5px var(--neon)" as string, color: "transparent" }} />
                </h2>
              </div>

              {/* Platform grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-16">
                {PLATFORMS.map((plat, i) => {
                  const neon = `oklch(0.88 0.22 ${plat.hue})`;
                  const neonDim = `oklch(0.55 0.18 ${plat.hue})`;
                  return (
                    <div
                      key={plat.id}
                      className="group relative flex flex-col items-center justify-center gap-2 border p-5 cursor-none"
                      style={{
                        borderColor: `oklch(0.22 0.06 ${plat.hue})`,
                        background: `oklch(0.06 0.02 ${plat.hue})`,
                        borderRadius: 4,
                        opacity: platformReveal.visible ? 1 : 0,
                        transform: platformReveal.visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.94)",
                        transition: `opacity 0.55s ${i * 0.06}s ease, transform 0.55s ${i * 0.06}s cubic-bezier(0.16,1,0.3,1)`,
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = `${neon}88`;
                        (e.currentTarget as HTMLElement).style.background = `oklch(0.10 0.04 ${plat.hue})`;
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${neon}22, inset 0 0 16px ${neon}08`;
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px) scale(1.03)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = `oklch(0.22 0.06 ${plat.hue})`;
                        (e.currentTarget as HTMLElement).style.background = `oklch(0.06 0.02 ${plat.hue})`;
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)";
                      }}
                    >
                      <span style={{
                        fontFamily: "'Press Start 2P'", fontSize: 10,
                        color: neon, textShadow: `0 0 12px ${neon}88`,
                        letterSpacing: "0.06em",
                      }}>{plat.id}</span>
                      <span style={{
                        fontFamily: "Share Tech Mono", fontSize: 7,
                        color: neonDim, letterSpacing: "0.12em", textAlign: "center",
                      }}>{plat.label.toUpperCase()}</span>
                      <span style={{
                        fontFamily: "Share Tech Mono", fontSize: 6,
                        color: `${neon}66`, letterSpacing: "0.08em",
                      }}>{plat.games} {plat.games === 1 ? "GAME" : "GAMES"}</span>
                    </div>
                  );
                })}
              </div>

              {/* Stats row */}
              <div
                className="grid grid-cols-2 md:grid-cols-4 gap-px border"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--border)",
                  opacity: platformReveal.visible ? 1 : 0,
                  transform: platformReveal.visible ? "translateY(0)" : "translateY(28px)",
                  transition: "opacity 0.7s 0.3s ease, transform 0.7s 0.3s ease",
                }}
              >
                {[
                  { num: "13", label: "Classic Games", hue: 195 },
                  { num: "7+", label: "Platforms", hue: 280 },
                  { num: "100%", label: "Browser-Based", hue: 320 },
                  { num: "0ms", label: "Download Time", hue: 55 },
                ].map(({ num, label, hue }) => (
                  <div key={label} className="flex flex-col items-center justify-center py-8 gap-1" style={{ background: "var(--background)" }}>
                    <span className="text-3xl md:text-4xl font-bold" style={{ color: `oklch(0.88 0.22 ${hue})`, textShadow: `0 0 20px oklch(0.65 0.18 ${hue})`, fontFamily: "'Space Grotesk'" }}>{num}</span>
                    <span className="font-mono-cyber text-[8px] tracking-[0.3em] uppercase" style={{ color: "var(--text-muted)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ FOOTER ════════════════════════════════════════════════════ */}
          <footer className="px-8 md:px-12 py-10" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex flex-col gap-1">
                <span className="font-pixel text-sm neon-text" style={{ animation: "neon-pulse 4s ease-in-out infinite" }}>
                  GAMESTASH
                </span>
                <span className="font-mono-cyber text-[9px] tracking-[0.35em] uppercase" style={{ color: "var(--text-muted)" }}>
                  © 2026 — Classic titles, rediscovered.
                </span>
              </div>
              <div className="flex gap-6 flex-wrap">
                {(["PRIVACY", "TERMS", "GITHUB"] as const).map((label) => (
                  <TextScramble
                    key={label}
                    text={label}
                    className="font-mono-cyber text-[10px] tracking-[0.25em] uppercase"
                    style={{ color: "var(--text-muted)" } as React.CSSProperties}
                  />
                ))}
                <a
                  href="/Luke-s-games01-main/admin.html"
                  className="font-mono-cyber text-[10px] tracking-[0.25em] uppercase border px-2.5 py-1 transition-all duration-200"
                  style={{ color: "var(--neon-2)", borderColor: "var(--neon-2)", background: "oklch(0.78 0.22 280 / 0.06)", cursor: "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "oklch(0.78 0.22 280 / 0.16)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 14px oklch(0.78 0.22 280 / 0.4)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "oklch(0.78 0.22 280 / 0.06)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                >
                  ⚙ ADMIN
                </a>
              </div>
              <div className="flex items-center gap-2 font-mono-cyber text-[9px] tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--neon)", boxShadow: "0 0 6px var(--neon)", animation: "neon-pulse 2s ease-in-out infinite" }} />
                All Systems Online
              </div>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
