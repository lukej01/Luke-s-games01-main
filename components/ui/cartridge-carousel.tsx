"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

// ── Card dimensions ──────────────────────────────────────────────────────────
const CW   = 152;   // card width
const CH   = 224;   // card height
const GAP  = 22;    // gap between cards
const UNIT = CW + GAP;

// ── Console dimensions ───────────────────────────────────────────────────────
const CXW  = 480;
const CXH  = 156;
const CXD  = 24;
const CXSW = 140;

const gc  = (h: number) => `oklch(0.88 0.22 ${h})`;
const gcd = (h: number) => `oklch(0.55 0.18 ${h})`;

export interface CarouselGame {
  id: string;
  title: string;
  platform: string;
  year: string;
  hue: number;
  coverImage?: string;
}

// ── Card3D — dark OLED card matching site palette ───────────────────────────
function Card3D({ game, isActive }: { game: CarouselGame; isActive: boolean }) {
  const c  = gc(game.hue);
  const cd = gcd(game.hue);

  return (
    <div style={{
      width: CW, height: CH,
      background: "oklch(0.065 0.014 195)",
      border: `1px solid ${isActive ? c + "55" : "oklch(0.16 0.05 195)"}`,
      borderRadius: 6,
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      boxShadow: isActive
        ? `0 0 0 1px ${c}33, 0 24px 60px rgba(0,0,0,0.9), 0 0 50px ${c}22`
        : "0 8px 24px rgba(0,0,0,0.7)",
      transition: "border-color 0.3s, box-shadow 0.3s",
      position: "relative",
    }}>
      {/* Cover art area */}
      <div style={{
        flex: 1,
        background: game.coverImage
          ? `url(${game.coverImage}) center/cover no-repeat`
          : `linear-gradient(145deg, oklch(0.11 0.05 ${game.hue}), oklch(0.07 0.025 ${game.hue}))`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `linear-gradient(${c}06 1px, transparent 1px), linear-gradient(90deg, ${c}06 1px, transparent 1px)`,
          backgroundSize: "14px 14px",
        }} />
        {/* CRT lines */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.10) 3px, rgba(0,0,0,0.10) 4px)",
        }} />
        {/* Vignette */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.65) 100%)",
        }} />
        {/* Platform watermark */}
        {!game.coverImage && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Press Start 2P'", fontSize: 11,
            color: `${c}14`, letterSpacing: "0.08em", userSelect: "none",
          }}>
            {game.platform}
          </div>
        )}
        {/* Top badges */}
        <div style={{
          position: "absolute", top: 6, left: 6,
          fontFamily: "Share Tech Mono", fontSize: 7,
          color: c, letterSpacing: "0.14em",
          background: `${c}14`, border: `1px solid ${c}33`,
          padding: "2px 6px", borderRadius: 2,
        }}>
          {game.platform}
        </div>
        <div style={{
          position: "absolute", top: 6, right: 6,
          fontFamily: "Share Tech Mono", fontSize: 7, color: cd,
          letterSpacing: "0.1em",
        }}>
          {game.year}
        </div>
        {/* Active: neon corner accents */}
        {isActive && <>
          <div style={{ position: "absolute", top: 4, left: 4, width: 8, height: 8, border: `1.5px solid ${c}88`, borderRight: "none", borderBottom: "none" }} />
          <div style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, border: `1.5px solid ${c}88`, borderLeft: "none", borderBottom: "none" }} />
          <div style={{ position: "absolute", bottom: 4, left: 4, width: 8, height: 8, border: `1.5px solid ${c}88`, borderRight: "none", borderTop: "none" }} />
          <div style={{ position: "absolute", bottom: 4, right: 4, width: 8, height: 8, border: `1.5px solid ${c}88`, borderLeft: "none", borderTop: "none" }} />
        </>}
      </div>

      {/* Info strip */}
      <div style={{
        padding: "7px 10px 8px",
        borderTop: `1px solid ${isActive ? c + "22" : "oklch(0.13 0.04 195)"}`,
        background: "oklch(0.055 0.012 195)",
        transition: "border-color 0.3s",
      }}>
        <div style={{
          fontFamily: "'Press Start 2P'", fontSize: 5,
          color: isActive ? c : cd,
          textShadow: isActive ? `0 0 10px ${c}` : "none",
          lineHeight: 1.9, letterSpacing: "0.04em",
          textAlign: "center",
          transition: "color 0.3s, text-shadow 0.3s",
          wordBreak: "break-word",
          overflow: "hidden",
          maxHeight: "2.5em",
        }}>
          {game.title.toUpperCase()}
        </div>
        {/* Connector pins */}
        <div style={{ display: "flex", gap: 3, justifyContent: "center", marginTop: 6 }}>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{
              width: 3, height: 6,
              background: `oklch(0.36 0.09 ${game.hue + 20})`,
              borderRadius: "0 0 1px 1px",
            }} />
          ))}
        </div>
      </div>

      {/* Active: subtle scan sweep */}
      {isActive && (
        <div style={{
          position: "absolute", left: 0, right: 0, height: 2, pointerEvents: "none",
          background: `linear-gradient(90deg, transparent, ${c}88, transparent)`,
          animation: "scanline-drop 2s linear infinite", opacity: 0.6,
        }} />
      )}
    </div>
  );
}

// ── Console ──────────────────────────────────────────────────────────────────
function Console({ insertedGame, onEject }: { insertedGame: CarouselGame | null; onEject: () => void }) {
  const [screenTxt, setScreenTxt] = useState("INSERT GAME");
  const c   = insertedGame ? gc(insertedGame.hue) : "oklch(0.88 0.22 195)";
  const isOn = !!insertedGame;

  useEffect(() => {
    if (!insertedGame) { setScreenTxt("INSERT GAME"); return; }
    setScreenTxt("BOOTING...");
    const t1 = setTimeout(() => setScreenTxt("LOADING..."), 400);
    const t2 = setTimeout(() => setScreenTxt(insertedGame.title.slice(0, 14).toUpperCase()), 850);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [insertedGame]);

  return (
    <div style={{ position: "relative", width: CXW, height: CXH, perspective: 900 }}>
      {/* Slot top */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: CXW, height: 34,
        background: "linear-gradient(to bottom, oklch(0.10 0.035 195), oklch(0.065 0.02 195))",
        border: "1px solid rgba(255,255,255,0.08)", borderBottom: "none",
        borderRadius: "10px 10px 0 0",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3,
      }}>
        <div style={{
          width: CXSW, height: 13,
          background: "oklch(0.018 0.008 195)",
          border: `1px solid ${isOn ? c + "66" : "rgba(255,255,255,0.10)"}`,
          borderRadius: 2,
          boxShadow: isOn ? `inset 0 0 8px ${c}22, 0 0 6px ${c}22` : "inset 0 2px 5px rgba(0,0,0,0.9)",
          transition: "all 0.4s", position: "relative",
        }}>
          {insertedGame && (
            <div style={{
              position: "absolute", bottom: 9, left: "50%", transform: "translateX(-50%)",
              width: 90, height: 26,
              background: `linear-gradient(160deg, oklch(0.22 0.10 ${insertedGame.hue}), oklch(0.14 0.06 ${insertedGame.hue}))`,
              border: `1px solid ${c}88`,
              borderRadius: "2px 2px 0 0",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 14px ${c}55`,
            }}>
              <span style={{ fontFamily: "'Press Start 2P'", fontSize: 4, color: c }}>
                {insertedGame.title.slice(0, 12).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        {insertedGame && (
          <button onClick={onEject} style={{
            position: "absolute", top: "50%", transform: "translateY(-50%)",
            right: `calc(50% - ${CXSW / 2 + 26}px)`,
            width: 26, height: 26, borderRadius: 4,
            background: `${c}14`, border: `1px solid ${c}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${c}28`; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${c}55`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${c}14`; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
            <svg width="11" height="11" viewBox="0 0 10 10" fill={c}>
              <path d="M5 8L2 4.5H4V1H6V4.5H8L5 8Z" transform="scale(1,-1) translate(0,-9)" />
              <rect x="1.5" y="8" width="7" height="1.5" rx="0.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: CXW, height: CXH,
        background: "linear-gradient(175deg, oklch(0.13 0.045 195), oklch(0.075 0.025 195))",
        borderRadius: "0 0 12px 12px",
        border: "1px solid rgba(255,255,255,0.08)", borderTop: "none",
        boxShadow: [
          "0 10px 0 oklch(0.03 0.005 195)", "0 20px 50px rgba(0,0,0,0.92)",
          `0 0 80px ${isOn ? c + "30" : "oklch(0.88 0.22 195 / 0.06)"}`,
          "inset 0 1px 0 rgba(255,255,255,0.05)", "inset 0 -1px 0 rgba(0,0,0,0.4)",
        ].join(","),
        display: "flex", alignItems: "center", transition: "box-shadow 0.6s", zIndex: 2,
      }}>
        <div style={{ position: "absolute", top: 0, left: 60, right: 60, height: 1, background: `linear-gradient(90deg, transparent, ${c}66, transparent)`, opacity: isOn ? 0.7 : 0.25, transition: "opacity 0.6s" }} />
        <span style={{ marginLeft: 26, fontFamily: "'Press Start 2P'", fontSize: 7.5, color: `oklch(0.88 0.22 195 / ${isOn ? "0.28" : "0.14"})`, letterSpacing: "0.16em", transition: "color 0.6s", textShadow: isOn ? `0 0 12px oklch(0.88 0.22 195 / 0.3)` : "none" }}>GAMESTASH</span>

        {/* Screen */}
        <div style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          width: 160, height: 52,
          background: isOn ? `oklch(0.045 0.028 ${insertedGame?.hue ?? 195})` : "oklch(0.018 0.005 195)",
          border: `1px solid ${isOn ? c + "99" : "rgba(255,255,255,0.07)"}`,
          borderRadius: 5, overflow: "hidden",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
          boxShadow: isOn ? `0 0 20px ${c}33, inset 0 0 16px ${c}18` : "inset 0 3px 8px rgba(0,0,0,0.7)",
          transition: "all 0.45s",
        }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.10) 3px, rgba(0,0,0,0.10) 4px)" }} />
          <div style={{ fontFamily: "Share Tech Mono", fontSize: 7.5, color: isOn ? c : "oklch(0.28 0.04 195)", letterSpacing: "0.14em", textAlign: "center", padding: "0 8px", position: "relative", textShadow: isOn ? `0 0 10px ${c}` : "none", transition: "all 0.4s" }}>
            {isOn ? screenTxt : <span style={{ opacity: 0.35 }}>NO GAME</span>}
          </div>
          {isOn && <div style={{ width: 5, height: 5, borderRadius: "50%", background: c, boxShadow: `0 0 8px ${c}`, animation: "neon-pulse 1.4s ease-in-out infinite", position: "relative" }} />}
        </div>

        {/* Speakers */}
        <div style={{ position: "absolute", right: 170, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 4 }}>
          {[0,1,2,3,4].map(i => <div key={i} style={{ width: 2, height: 32, background: "rgba(255,255,255,0.05)", borderRadius: 1 }} />)}
        </div>
        {/* Ports */}
        <div style={{ position: "absolute", right: 80, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 14 }}>
          {[0,1].map(i => <div key={i} style={{ width: 24, height: 30, borderRadius: "50% 50% 4px 4px", background: "oklch(0.022 0.008 195)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "inset 0 2px 5px rgba(0,0,0,0.85)" }} />)}
        </div>
        {/* LED */}
        <div style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: isOn ? c : "oklch(0.07 0.02 195)", boxShadow: isOn ? `0 0 12px ${c}, 0 0 28px ${c}88` : "none", transition: "all 0.6s", animation: isOn ? "neon-pulse 1.5s ease-in-out infinite" : "none" }} />
          <span style={{ fontFamily: "Share Tech Mono", fontSize: 6, letterSpacing: "0.1em", color: isOn ? c : "oklch(0.30 0.04 195)", transition: "color 0.6s" }}>{isOn ? "ON" : "OFF"}</span>
        </div>
        {/* 3D sides */}
        {([{ side: "left", ry: -90, origin: "right center", br: "12px 0 0 12px" }, { side: "right", ry: 90, origin: "left center", br: "0 12px 12px 0" }] as const).map(({ side, ry, origin, br }) => (
          <div key={side} style={{ position: "absolute", top: 0, [side]: 0, width: CXD, height: CXH, background: "linear-gradient(to bottom, oklch(0.09 0.03 195), oklch(0.05 0.015 195))", transform: `rotateY(${ry}deg) translateZ(${CXD / 2}px)`, transformOrigin: origin, backfaceVisibility: "hidden", borderRadius: br }} />
        ))}
      </div>
    </div>
  );
}

// ── CartridgeCarousel ─────────────────────────────────────────────────────────
export function CartridgeCarousel({
  games,
  onPlay,
}: {
  games: CarouselGame[];
  onPlay: (game: CarouselGame) => void;
}) {
  const TOTAL    = games.length;
  const maxScroll = Math.max(0, (TOTAL - 1) * UNIT);

  // Scroll state
  const scrollX    = useRef(0);
  const targetX    = useRef(0);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const isHover    = useRef(false);
  const frameRef   = useRef(0);
  const [activeIdx, setActiveIdx] = useState(0);

  // Game / fly state
  const [insertedGame, setInsertedGame] = useState<CarouselGame | null>(null);
  const [inFlight, setInFlight]         = useState<string | null>(null);
  const playTimer                        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [flyCart, setFlyCart]           = useState<{ game: CarouselGame; sx: number; sy: number; dx: number; dy: number } | null>(null);
  const [ejectCart, setEjectCart]       = useState<{ game: CarouselGame; sx: number; sy: number; ex: number; ey: number } | null>(null);

  const cartEls     = useRef<(HTMLDivElement | null)[]>([]);
  const cardFlyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const consoleEl   = useRef<HTMLDivElement>(null);
  const outerRef    = useRef<HTMLDivElement>(null);
  const gsapDone    = useRef(false);

  // Admin image overrides from localStorage
  const [adminImages, setAdminImages] = useState<Record<string, string>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem("pv_edits");
      if (!raw) return;
      const edits: Record<string, { cover?: string }> = JSON.parse(raw);
      const map: Record<string, string> = {};
      Object.entries(edits).forEach(([id, ed]) => { if (ed.cover) map[id] = ed.cover; });
      setAdminImages(map);
    } catch { /* noop */ }
  }, []);

  // ── RAF scroll loop ────────────────────────────────────────────────────
  useEffect(() => {
    const animate = () => {
      const dx = targetX.current - scrollX.current;
      scrollX.current += Math.abs(dx) > 0.08 ? dx * 0.1 : dx;
      const wrapW = wrapRef.current?.offsetWidth ?? 800;
      const offset = wrapW / 2 - CW / 2 - scrollX.current;
      if (trackRef.current) trackRef.current.style.transform = `translateX(${offset.toFixed(2)}px)`;
      const ai = Math.max(0, Math.min(TOTAL - 1, Math.round(scrollX.current / UNIT)));
      setActiveIdx(ai);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [TOTAL]);

  // ── Wheel (hover-only) ────────────────────────────────────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!isHover.current) return;
      e.preventDefault();
      e.stopPropagation();
      const d = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 140) * 0.55;
      targetX.current = Math.max(0, Math.min(maxScroll, targetX.current + d));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("mouseenter", () => { isHover.current = true; });
    el.addEventListener("mouseleave", () => { isHover.current = false; });
    return () => el.removeEventListener("wheel", onWheel);
  }, [maxScroll]);

  // ── Touch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let sx = 0;
    const ts = (e: TouchEvent) => { sx = e.touches[0].clientX; };
    const tm = (e: TouchEvent) => {
      const dx = sx - e.touches[0].clientX;
      sx = e.touches[0].clientX;
      targetX.current = Math.max(0, Math.min(maxScroll, targetX.current + dx * 1.2));
    };
    window.addEventListener("touchstart", ts, { passive: true });
    window.addEventListener("touchmove", tm, { passive: true });
    return () => { window.removeEventListener("touchstart", ts); window.removeEventListener("touchmove", tm); };
  }, [maxScroll]);

  // ── GSAP fly-in on viewport entry ─────────────────────────────────────
  useEffect(() => {
    const refs = cardFlyRefs.current.filter(Boolean) as HTMLDivElement[];
    if (refs.length > 0) gsap.set(refs, { opacity: 0, y: 90, scale: 0.75 });
  }, []);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !gsapDone.current) {
        gsapDone.current = true;
        const refs = cardFlyRefs.current.filter(Boolean) as HTMLDivElement[];
        if (refs.length === 0) return;
        gsap.to(refs, {
          opacity: 1, y: 0, scale: 1,
          duration: 0.78,
          stagger: { each: 0.05, from: "center" },
          ease: "back.out(1.5)",
          clearProps: "all",
        });
      }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Insert game into console ───────────────────────────────────────────
  const triggerInsert = useCallback((idx: number) => {
    const game = games[idx];
    if (!game || inFlight || insertedGame?.id === game.id) return;
    const cartEl = cartEls.current[idx];
    const conE   = consoleEl.current;
    const wrap   = outerRef.current;
    if (!cartEl || !conE || !wrap) return;
    const wr = wrap.getBoundingClientRect();
    const cr = cartEl.getBoundingClientRect();
    const sr = conE.getBoundingClientRect();
    setInFlight(game.id);
    setFlyCart({
      game,
      sx: cr.left - wr.left + cr.width  / 2 - CW / 2,
      sy: cr.top  - wr.top  + cr.height / 2 - CH / 2,
      dx: (sr.left - wr.left + sr.width / 2 - CW / 2) - (cr.left - wr.left + cr.width / 2 - CW / 2),
      dy: (sr.top  - wr.top  + sr.height / 2 - CH / 2 - 34) - (cr.top - wr.top + cr.height / 2 - CH / 2),
    });
    setTimeout(() => {
      setInsertedGame(game);
      setInFlight(null);
      setFlyCart(null);
      playTimer.current = setTimeout(() => onPlay(game), 1100);
    }, 920);
  }, [games, inFlight, insertedGame, onPlay]);

  const handleEject = useCallback(() => {
    if (!insertedGame) return;
    if (playTimer.current) { clearTimeout(playTimer.current); playTimer.current = null; }
    const conE = consoleEl.current;
    const wrap = outerRef.current;
    const ei   = games.findIndex(g => g.id === insertedGame.id);
    const tEl  = cartEls.current[ei];
    if (!conE || !wrap) return;
    const wr = wrap.getBoundingClientRect();
    const sr = conE.getBoundingClientRect();
    const tr = tEl?.getBoundingClientRect() ?? sr;
    setEjectCart({
      game: insertedGame,
      sx: sr.left - wr.left + sr.width / 2 - CW / 2,
      sy: sr.top  - wr.top  - 90,
      ex: (tr.left - wr.left + tr.width / 2 - CW / 2) - (sr.left - wr.left + sr.width / 2 - CW / 2),
      ey: (tr.top  - wr.top  + tr.height / 2 - CH / 2) - (sr.top - wr.top - 90),
    });
    setInsertedGame(null);
    setTimeout(() => setEjectCart(null), 750);
  }, [insertedGame, games]);

  const handleCardClick = useCallback((idx: number) => {
    if (inFlight) return;
    if (idx !== activeIdx) {
      targetX.current = Math.max(0, Math.min(maxScroll, idx * UNIT));
      return;
    }
    if (insertedGame?.id === games[idx]?.id) return;
    triggerInsert(idx);
  }, [activeIdx, inFlight, insertedGame, games, triggerInsert, maxScroll]);

  return (
    <div ref={outerRef} style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* ── Flat horizontal scroll track ── */}
      <div
        ref={wrapRef}
        style={{
          width: "100%",
          height: CH + 64,          // extra: active card lifts 28px + shadow
          position: "relative",
          overflow: "hidden",
          cursor: "none",
        }}
      >
        {/* Fade edges */}
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 80, background: "linear-gradient(to right, var(--background), transparent)", zIndex: 10, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 80, background: "linear-gradient(to left, var(--background), transparent)", zIndex: 10, pointerEvents: "none" }} />

        {/* Track */}
        <div
          ref={trackRef}
          style={{
            display: "flex",
            gap: GAP,
            position: "absolute",
            top: 28,                 // room for active card to lift
            left: 0,
            willChange: "transform",
          }}
        >
          {games.map((game, idx) => {
            const isActive   = idx === activeIdx && game.id !== inFlight && game.id !== insertedGame?.id;
            const distFromActive = Math.abs(idx - activeIdx);
            const baseOpacity = game.id === inFlight || game.id === insertedGame?.id
              ? 0
              : Math.max(0.35, 1 - distFromActive * 0.12);

            return (
              <div
                key={game.id}
                ref={el => { cardFlyRefs.current[idx] = el; }}
              >
                <div
                  ref={el => { cartEls.current[idx] = el; }}
                  style={{
                    width: CW, height: CH,
                    cursor: "pointer",
                    transform: isActive
                      ? "translateY(-26px) scale(1.10)"
                      : `translateY(${Math.min(distFromActive * 3, 10)}px) scale(${Math.max(0.90, 1 - distFromActive * 0.035)})`,
                    opacity: baseOpacity,
                    transition: "transform 0.45s cubic-bezier(0.34,1.5,0.64,1), opacity 0.3s",
                    transformOrigin: "center bottom",
                  }}
                  onClick={() => handleCardClick(idx)}
                >
                  <Card3D
                    game={{ ...game, coverImage: adminImages[game.id] ?? game.coverImage }}
                    isActive={isActive}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Status / hint ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 2 }}>
        <div style={{ fontFamily: "Share Tech Mono", fontSize: 10, color: "oklch(0.50 0.10 195)", letterSpacing: "0.2em" }}>
          {String(activeIdx + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
        </div>
      </div>
      <div style={{ fontFamily: "Share Tech Mono", fontSize: 8, color: "rgba(0,229,204,0.20)", letterSpacing: "0.22em", marginTop: 5, textAlign: "center" }}>
        HOVER + SCROLL TO BROWSE  ·  CLICK TO PLAY
      </div>

      {/* ── Console ── */}
      <div style={{ marginTop: 24, zIndex: 5, width: "100%", display: "flex", justifyContent: "center" }}>
        <div ref={consoleEl} style={{ width: CXW, flexShrink: 0 }}>
          <Console insertedGame={insertedGame} onEject={handleEject} />
        </div>
      </div>

      {/* ── Fly-in overlay ── */}
      {flyCart && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 100, overflow: "hidden" }}>
          <style>{`@keyframes cFly{0%{transform:translate(0,0) scale(1);opacity:1}22%{transform:translate(0,-80px) scale(1.08);opacity:1}66%{transform:translate(var(--dx),var(--dy)) scale(.9);opacity:1}88%{transform:translate(var(--dx),calc(var(--dy)+26px)) scale(.84);opacity:.7}100%{transform:translate(var(--dx),calc(var(--dy)+44px)) scale(.82);opacity:.1}}`}</style>
          <div style={{ position: "absolute", left: flyCart.sx, top: flyCart.sy, ["--dx" as string]: `${flyCart.dx}px`, ["--dy" as string]: `${flyCart.dy}px`, animation: "cFly 0.92s cubic-bezier(0.25,0.1,0.3,1) forwards" }}>
            <Card3D game={flyCart.game} isActive={false} />
          </div>
        </div>
      )}
      {ejectCart && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 100, overflow: "hidden" }}>
          <style>{`@keyframes cEject{0%{transform:translate(0,0) scale(.82);opacity:.1}28%{transform:translate(0,-90px) scale(1.06);opacity:1}70%{transform:translate(var(--ex),var(--ey)) scale(1);opacity:1}100%{transform:translate(var(--ex),var(--ey)) scale(1);opacity:0}}`}</style>
          <div style={{ position: "absolute", left: ejectCart.sx, top: ejectCart.sy, ["--ex" as string]: `${ejectCart.ex}px`, ["--ey" as string]: `${ejectCart.ey}px`, animation: "cEject 0.72s cubic-bezier(0.25,0.1,0.3,1) forwards" }}>
            <Card3D game={ejectCart.game} isActive={false} />
          </div>
        </div>
      )}
    </div>
  );
}
