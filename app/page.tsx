"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { HeroBackground } from "@/components/ui/hero-background";
import { TextScramble } from "@/components/ui/text-scramble";
import { CyberpunkCursor } from "@/components/ui/cyberpunk-cursor";
import { MagneticText } from "@/components/ui/magnetic-text";
import { CartridgeCarousel } from "@/components/ui/cartridge-carousel";

// ── Module-level mouse tracker + hero scroll fraction ──────────────────────
const _hm = { x: -9999, y: -9999 };
let _hmReady = false;
function _hmAttach() {
  if (_hmReady || typeof window === "undefined") return;
  _hmReady = true;
  window.addEventListener("mousemove", e => { _hm.x = e.clientX; _hm.y = e.clientY; }, { passive: true });
}
const _heroScroll = { v: 0 }; // 0 = hero visible, 1 = hero gone (letters scattered)

// ── Scatter directions per letter (G A M E S T A S H) ─────────────────────
const SCATTER_DIRS = [
  { sx: -200, sy: -140, r: -25 }, // G
  { sx:  -90, sy: -195, r:  14 }, // A
  { sx:  -10, sy: -225, r:  -7 }, // M
  { sx:   95, sy: -162, r:  22 }, // E
  { sx:  172, sy: -102, r: -17 }, // S
  { sx:  225, sy: -132, r:  24 }, // T
  { sx:  132, sy:   58, r: -12 }, // A
  { sx:   58, sy:  115, r:  20 }, // S
  { sx:  178, sy:   88, r: -24 }, // H
];

// ── FloatLetter — floating + cursor anti-gravity + scroll scatter ──────────
function FloatLetter({ char, phase, amp, si }: { char: string; phase: number; amp: number; si: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const s   = useRef({ px: 0, py: 0, t: phase });

  useEffect(() => {
    _hmAttach();
    const el = ref.current;
    if (!el) return;
    let raf: number;
    const sc = SCATTER_DIRS[si] ?? { sx: 0, sy: 0, r: 0 };
    const tick = () => {
      s.current.t += 0.006;
      const fy = Math.sin(s.current.t) * amp;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width  * 0.5;
      const cy = rect.top  + rect.height * 0.5;
      const dx = _hm.x - cx;
      const dy = _hm.y - cy;
      const d  = Math.sqrt(dx * dx + dy * dy);
      let tx = 0, ty = 0;
      if (d < 160 && d > 1) {
        const f = Math.pow((160 - d) / 160, 2) * 14;
        tx = -(dx / d) * f;
        ty = -(dy / d) * f;
      }
      s.current.px += (tx - s.current.px) * 0.07;
      s.current.py += (ty - s.current.py) * 0.07;
      // Scroll scatter — smooth-step easing
      const sv = _heroScroll.v;
      const ease = sv * sv * (3 - 2 * sv);
      const scx = sc.sx * ease;
      const scy = sc.sy * ease;
      const rot = sc.r * ease;
      el.style.transform = `translate(${(s.current.px + scx).toFixed(2)}px,${(s.current.py + fy + scy).toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, amp, si]);

  return (
    <span ref={ref} aria-hidden style={{ display: "inline-block", willChange: "transform" }}>
      {char}
    </span>
  );
}

// ── FloatTitle — GAMESTASH with per-letter anti-gravity + scroll scatter ───
function FloatTitle() {
  return (
    <h1
      className="text-[clamp(4rem,11vw,10rem)] font-bold leading-none tracking-tighter mb-6"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      aria-label="GAMESTASH"
    >
      <span className="glitch-wrap block" style={{ color: "var(--foreground)" }}>
        {"GAME".split("").map((ch, i) => (
          <FloatLetter key={i} char={ch} phase={i * 0.9} amp={3 + i * 0.4} si={i} />
        ))}
      </span>
      <span className="glitch-wrap block" style={{
        WebkitTextStroke: "2px var(--neon)",
        color: "transparent",
        filter: "drop-shadow(0 0 24px var(--neon))",
      }}>
        {"STASH".split("").map((ch, i) => (
          <FloatLetter key={i} char={ch} phase={3.6 + i * 0.85} amp={2.5 + i * 0.5} si={i + 4} />
        ))}
      </span>
    </h1>
  );
}

// ── Game data ──────────────────────────────────────────────────────────────
const GAMES = [
  {
    id: "super-mario-64",
    title: "Super Mario 64",
    platform: "N64",
    genre: "Platform",
    year: "1996",
    hue: 280,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e9/Super_Mario_64.png/250px-Super_Mario_64.png",
    desc: "The 3D platformer that redefined gaming. Guide Mario through 15 worlds inside Bowser's castle, collecting Power Stars in groundbreaking 64-bit freedom.",
  },
  {
    id: "zelda-oot",
    title: "Zelda: Ocarina of Time",
    platform: "N64",
    genre: "Adventure",
    year: "1998",
    hue: 195,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/5/57/The_Legend_of_Zelda_Ocarina_of_Time.jpg",
    desc: "An epic time-travelling quest through Hyrule. Wield the Master Sword across past and future to defeat Ganondorf's creeping darkness.",
  },
  {
    id: "paper-mario",
    title: "Paper Mario",
    platform: "N64",
    genre: "RPG",
    year: "2001",
    hue: 150,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/6/61/Papermario.jpg/250px-Papermario.jpg",
    desc: "A flat-folded adventure through the Mushroom Kingdom. Build a party of unique companions and battle with badges in this beloved RPG.",
  },
  {
    id: "super-mario-world",
    title: "Super Mario World",
    platform: "SNES",
    genre: "Platform",
    year: "1990",
    hue: 40,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/3/32/Super_Mario_World_Coverart.png",
    desc: "The SNES launch masterpiece. Explore Dinosaur Land with Yoshi, uncover hidden exits, and conquer Bowser's seven worlds.",
  },
  {
    id: "super-mario-3",
    title: "Super Mario Bros 3",
    platform: "NES",
    genre: "Platform",
    year: "1988",
    hue: 25,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/a/a5/Super_Mario_Bros._3_coverart.png",
    desc: "The peak of NES platforming. Eight diverse worlds, transforming suits, and Bowser's Koopalings await in this timeless classic.",
  },
  {
    id: "punch-out",
    title: "Punch-Out!!",
    platform: "NES",
    genre: "Fighting",
    year: "1987",
    hue: 15,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c8/Mike_Tyson%27s_Punch-Out%21%21_NES_Box.jpg/250px-Mike_Tyson%27s_Punch-Out%21%21_NES_Box.jpg",
    desc: "Rise through the ranks as Little Mac. Study opponent patterns and time your punches to dethrone the legendary Mike Tyson.",
  },
  {
    id: "sonic-2",
    title: "Sonic the Hedgehog 2",
    platform: "GEN",
    genre: "Platform",
    year: "1992",
    hue: 220,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Sonic_2_US_Cover.jpg/250px-Sonic_2_US_Cover.jpg",
    desc: "Blazing speed across Chemical Plant and beyond. Team up with Tails to blast through Robotnik's forces at supersonic velocity.",
  },
  {
    id: "gran-turismo-2",
    title: "Gran Turismo 2",
    platform: "PS1",
    genre: "Racing",
    year: "1999",
    hue: 320,
    coverImage: "https://m.media-amazon.com/images/I/51egYoaJo-L._SX342_SY445_QL70_FMwebp_.jpg",
    desc: "The Real Driving Simulator. Over 650 cars across arcade and simulation modes across dozens of meticulously recreated circuits.",
  },
  {
    id: "nba-live-2003",
    title: "NBA Live 2003",
    platform: "PS1",
    genre: "Sports",
    year: "2002",
    hue: 55,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/b/bc/NBA_Live_2003_cover.jpg/250px-NBA_Live_2003_cover.jpg",
    desc: "Hit the hardwood with the full 2002-03 NBA rosters. Freestyle dribbling, dynamic dunks, and franchise mode define this era.",
  },
  {
    id: "madden-2002",
    title: "Madden 2002",
    platform: "PS1",
    genre: "Sports",
    year: "2001",
    hue: 60,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a0/Madden_NFL_2002_Coverart.png/250px-Madden_NFL_2002_Coverart.png",
    desc: "The greatest football sim of its era. Full NFL rosters, franchise mode, and the playcalling depth that made Madden legendary.",
  },
  {
    id: "lego-batman-1",
    title: "LEGO Batman",
    platform: "DS",
    genre: "Action",
    year: "2008",
    hue: 240,
    coverImage: "https://m.media-amazon.com/images/I/517zan+v3eL._SY445_SX342_QL70_FMwebp_.jpg",
    desc: "Gotham City in LEGO form. Play as Batman, Robin, or the villains across 30 story levels in this co-op action adventure.",
  },
  {
    id: "lego-batman-2",
    title: "LEGO Batman 2",
    platform: "DS",
    genre: "Action",
    year: "2012",
    hue: 245,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Legobatman2.jpg/250px-Legobatman2.jpg",
    desc: "The Dark Knight meets the Justice League. Superman joins the fight as Lex Luthor and the Joker threaten Gotham.",
  },
  {
    id: "lego-star-wars",
    title: "LEGO Star Wars",
    platform: "DS",
    genre: "Action",
    year: "2005",
    hue: 50,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Lego_Star_Wars-The_Complete_Saga.jpg/250px-Lego_Star_Wars-The_Complete_Saga.jpg",
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
      // Drive letter scatter: starts at 3% of hero height, done at 48%
      const heroH = heroRef.current?.offsetHeight ?? window.innerHeight;
      _heroScroll.v = Math.min(1, Math.max(0, (sy - heroH * 0.03) / (heroH * 0.44)));
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
              <nav className="relative flex items-center justify-between px-8 md:px-12 pt-11 pointer-events-none">
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
                      <TextScramble text={label} className="group-hover:text-[var(--neon)] transition-colors duration-200" />
                      <span
                        className="absolute -bottom-0.5 left-0 h-px bg-[var(--neon)] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
                        style={{ boxShadow: "0 0 6px var(--neon)" }}
                      />
                    </a>
                  ))}
                </div>

                {/* Centered logo */}
                <div className="absolute left-1/2 -translate-x-1/2 mt-3 pointer-events-auto flex flex-col items-center gap-0.5">
                  <MagneticText strength={9} radius={160} tag="span" className="font-pixel text-[11px] neon-text tracking-widest" style={{ display: "inline-block" }}>
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
                      <TextScramble text={link} className="group-hover:text-[var(--neon)] transition-colors duration-200" />
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

                <FloatTitle />

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
          <section id="library" className="pt-20 pb-32" style={{ background: "var(--background)" }}>
            {/* Header — constrained */}
            <div className="px-6 md:px-10 lg:px-16 max-w-screen-xl mx-auto mb-12">
              <div
                ref={libraryReveal.ref}
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
                  Hover &amp; scroll to browse · Click the active card to play instantly.
                </p>
              </div>
            </div>

            {/* Carousel — full width */}
            <CartridgeCarousel
              games={GAMES.map(g => ({ id: g.id, title: g.title, platform: g.platform, year: g.year, hue: g.hue, coverImage: g.coverImage }))}
              onPlay={(game) => { const g = GAMES.find(x => x.id === game.id); if (g) handlePlay(g); }}
            />
          </section>

          {/* ══ FOOTER ═══════════════════════════════════════════════════ */}
          <footer style={{ background: "var(--background)" }}>

            {/* ── Neon section divider ── */}
            <div aria-hidden style={{ height: 1, background: "linear-gradient(90deg, transparent 0%, var(--neon) 30%, var(--neon-2) 55%, var(--neon-3) 75%, transparent 100%)", opacity: 0.35 }} />

            {/* ── Stats — oversized editorial numbers ── */}
            <div
              ref={platformReveal.ref}
              style={{
                opacity: platformReveal.visible ? 1 : 0,
                transform: platformReveal.visible ? "translateY(0)" : "translateY(40px)",
                transition: "opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4">
                {([
                  { num: "13",   label: "Classic Games",  hue: 195 },
                  { num: "7",    label: "Platforms",       hue: 280 },
                  { num: "100%", label: "Browser Based",   hue: 320 },
                  { num: "0ms",  label: "No Downloads",    hue: 55  },
                ] as const).map(({ num, label, hue }, i) => (
                  <div
                    key={label}
                    className="group relative flex flex-col items-center justify-center py-20 gap-4 overflow-hidden"
                    style={{
                      borderRight: i < 3 ? "1px solid var(--border)" : undefined,
                      borderBottom: i < 2 ? "1px solid var(--border)" : undefined,
                    }}
                  >
                    {/* Hover bg glow */}
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `radial-gradient(ellipse at 50% 80%, oklch(0.65 0.22 ${hue} / 0.08) 0%, transparent 70%)` }} />
                    {/* Number */}
                    <span
                      className="relative font-bold leading-none group-hover:scale-105 transition-transform duration-300"
                      style={{
                        fontFamily: "'Space Grotesk'",
                        fontSize: "clamp(3rem,6.5vw,5rem)",
                        background: `linear-gradient(135deg, oklch(0.93 0.24 ${hue}), oklch(0.68 0.20 ${hue}))`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        filter: `drop-shadow(0 0 32px oklch(0.65 0.18 ${hue} / 0.5))`,
                      }}
                    >
                      {num}
                    </span>
                    {/* Label */}
                    <TextScramble text={label} className="font-mono-cyber text-[8px] tracking-[0.4em] uppercase" style={{ color: "var(--text-muted)" }} />
                    {/* Bottom accent on hover */}
                    <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                      style={{ background: `linear-gradient(90deg, transparent, oklch(0.65 0.22 ${hue}), transparent)`, boxShadow: `0 0 8px oklch(0.65 0.22 ${hue})` }} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Neon divider ── */}
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent 0%, var(--neon) 25%, var(--neon-2) 50%, var(--neon-3) 75%, transparent 100%)", opacity: 0.28 }} />

            {/* ── Main footer body ── */}
            <div className="px-8 md:px-14 py-14">
              <div className="max-w-7xl mx-auto">
                {/* Three-column grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

                  {/* Brand */}
                  <div className="flex flex-col gap-4">
                    <span className="font-pixel text-[13px] neon-text" style={{ animation: "neon-pulse 4s ease-in-out infinite", lineHeight: 2 }}>GAMESTASH</span>
                    <p className="font-mono-cyber text-[9px] tracking-[0.22em] uppercase leading-relaxed" style={{ color: "var(--text-muted)", maxWidth: 200 }}>
                      The definitive retro gaming vault. 13 classics, zero installs.
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--neon)", boxShadow: "0 0 6px var(--neon)", animation: "neon-pulse 2s ease-in-out infinite" }} />
                      <span className="font-mono-cyber text-[8px] tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>All Systems Online</span>
                    </div>
                  </div>

                  {/* Nav links */}
                  <div className="flex flex-col gap-3">
                    <span className="font-mono-cyber text-[8px] tracking-[0.4em] uppercase mb-2" style={{ color: "var(--text-muted)" }}>Navigation</span>
                    {[
                      { label: "Browse Library", href: "#library" },
                      { label: "Privacy Policy", href: "#" },
                      { label: "Terms of Use",   href: "#" },
                      { label: "GitHub",         href: "#" },
                    ].map(({ label, href }) => (
                      <a
                        key={label}
                        href={href}
                        className="relative w-fit font-mono-cyber text-[10px] tracking-[0.18em] uppercase group"
                        style={{ color: "var(--text-dim)", cursor: "none" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--neon)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-dim)"; }}
                      >
                        <span className="group-hover:translate-x-1.5 inline-block transition-transform duration-200">{label}</span>
                        <span className="absolute -bottom-0.5 left-0 h-px bg-[var(--neon)] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" style={{ boxShadow: "0 0 4px var(--neon)" }} />
                      </a>
                    ))}
                  </div>

                  {/* Admin CTA */}
                  <div className="flex flex-col gap-4 md:items-end">
                    <span className="font-mono-cyber text-[8px] tracking-[0.4em] uppercase mb-2" style={{ color: "var(--text-muted)" }}>Admin</span>
                    <a
                      href="/Luke-s-games01-main/admin.html"
                      className="relative overflow-hidden flex items-center gap-2.5 px-6 py-3 font-mono-cyber text-[10px] tracking-[0.28em] uppercase border group w-fit"
                      style={{
                        borderColor: "var(--neon-2)",
                        color: "var(--neon-2)",
                        background: "oklch(0.78 0.22 280 / 0.06)",
                        cursor: "none",
                        transition: "transform 0.2s, box-shadow 0.25s",
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = "oklch(0.78 0.22 280 / 0.14)";
                        el.style.boxShadow  = "0 0 28px oklch(0.78 0.22 280 / 0.45), 0 0 60px oklch(0.78 0.22 280 / 0.12)";
                        el.style.transform  = "translateY(-3px)";
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = "oklch(0.78 0.22 280 / 0.06)";
                        el.style.boxShadow  = "none";
                        el.style.transform  = "translateY(0)";
                      }}
                    >
                      <span className="text-sm">⚙</span>
                      <span>Admin Panel</span>
                      {/* Sweep on hover */}
                      <span className="absolute inset-0 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300" style={{ background: "oklch(0.78 0.22 280 / 0.10)" }} />
                    </a>
                    <p className="font-mono-cyber text-[8px] tracking-[0.18em] uppercase leading-relaxed md:text-right" style={{ color: "var(--text-muted)", maxWidth: 180 }}>
                      Manage games, update covers, sync to GitHub.
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "var(--border)", marginBottom: "1.5rem" }} />

                {/* Copyright row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="font-mono-cyber text-[8px] tracking-[0.28em] uppercase" style={{ color: "var(--text-muted)" }}>
                    © 2026 GameStash — All original games belong to their respective owners.
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-px h-3" style={{ background: "var(--border)" }} />
                    <span className="font-mono-cyber text-[8px] tracking-[0.2em] uppercase" style={{ color: "var(--text-muted)" }}>Built with ♥ for retro gamers</span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
