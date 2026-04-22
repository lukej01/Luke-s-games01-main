"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// ── Constants ────────────────────────────────────────────────────────────────
const RADIUS = 300;
const CW = 112;    // cartridge width
const CH = 160;    // cartridge height (taller for cover + name)
const CXW = 480;   // console width
const CXH = 156;   // console height
const CXD = 24;
const CXSW = 140;  // slot width

const gc  = (h: number) => `oklch(0.88 0.22 ${h})`;
const gcd = (h: number) => `oklch(0.60 0.18 ${h})`;

export interface CarouselGame {
  id: string;
  title: string;
  platform: string;
  year: string;
  hue: number;
  coverImage?: string; // optional cover image URL
}

// ── Cart3D ───────────────────────────────────────────────────────────────────
function Cart3D({ game, isActive }: { game: CarouselGame; isActive: boolean }) {
  const c = gc(game.hue);
  const cd = gcd(game.hue);
  const coverH = Math.floor(CH * 0.50); // 50% for cover art area

  return (
    <div style={{ width: CW, height: CH, position: "relative", transformStyle: "preserve-3d" }}>
      {/* Front face */}
      <div style={{
        position: "absolute", width: CW, height: CH,
        background: `linear-gradient(155deg, oklch(0.28 0.14 ${game.hue}), oklch(0.16 0.08 ${game.hue}))`,
        border: `1px solid ${c}${isActive ? "aa" : "44"}`,
        borderRadius: "5px 5px 2px 2px",
        boxShadow: isActive
          ? `0 0 28px ${c}55, inset 0 1px 0 rgba(255,255,255,0.16)`
          : `inset 0 1px 0 rgba(255,255,255,0.06)`,
        display: "flex", flexDirection: "column", alignItems: "center",
        overflow: "hidden", transform: "translateZ(5px)",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}>

        {/* ── Cover art area ── */}
        <div style={{
          width: "90%", height: coverH, marginTop: 7, flexShrink: 0,
          background: game.coverImage
            ? `url(${game.coverImage}) center/cover no-repeat`
            : `linear-gradient(145deg, oklch(0.14 0.08 ${game.hue}), oklch(0.08 0.04 ${game.hue}))`,
          border: `1px solid ${c}${isActive ? "66" : "33"}`,
          borderRadius: 2,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Grid overlay — always visible, shows through on placeholder */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: `linear-gradient(${c}08 1px, transparent 1px), linear-gradient(90deg, ${c}08 1px, transparent 1px)`,
            backgroundSize: "10px 10px",
          }} />
          {/* CRT scanlines */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)",
          }} />
          {/* Platform watermark on placeholder */}
          {!game.coverImage && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Press Start 2P'", fontSize: 10,
              color: `${c}18`, letterSpacing: "0.1em",
              userSelect: "none",
            }}>
              {game.platform}
            </div>
          )}
          {/* Corner accent */}
          <div style={{
            position: "absolute", top: 3, left: 3,
            width: 5, height: 5, border: `1px solid ${c}44`,
            borderRight: "none", borderBottom: "none",
          }} />
          <div style={{
            position: "absolute", top: 3, right: 3,
            width: 5, height: 5, border: `1px solid ${c}44`,
            borderLeft: "none", borderBottom: "none",
          }} />
        </div>

        {/* ── Game name ── */}
        <div style={{
          width: "90%", flex: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "3px 2px",
        }}>
          <span style={{
            fontFamily: "'Press Start 2P'", fontSize: 4.8, color: isActive ? c : cd,
            textShadow: isActive ? `0 0 8px ${c}` : "none",
            textAlign: "center", lineHeight: 1.8, wordBreak: "break-word",
            transition: "color 0.3s, text-shadow 0.3s",
          }}>
            {game.title.toUpperCase()}
          </span>
        </div>

        {/* ── Bottom strip: platform + connector pins ── */}
        <div style={{
          width: "100%", flexShrink: 0,
          background: `oklch(0.10 0.05 ${game.hue})`,
          borderTop: `1px solid ${c}28`,
          padding: "3px 0 2px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        }}>
          <span style={{
            fontFamily: "Share Tech Mono", fontSize: 5.5,
            color: cd, letterSpacing: "0.14em",
          }}>
            {game.platform}  ·  {game.year}
          </span>
          <div style={{ display: "flex", gap: 3 }}>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} style={{
                width: 3, height: 6,
                background: `oklch(0.48 0.10 ${game.hue + 20})`,
                borderRadius: "0 0 1px 1px",
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Back face */}
      <div style={{
        position: "absolute", width: CW, height: CH,
        background: `oklch(0.10 0.04 ${game.hue})`,
        border: `1px solid ${c}18`,
        borderRadius: "5px 5px 2px 2px",
        transform: "translateZ(-5px) rotateY(180deg)",
      }} />

      {/* Side faces */}
      <div style={{
        position: "absolute", width: 10, height: CH,
        background: `oklch(0.14 0.07 ${game.hue})`,
        transform: `rotateY(-90deg) translateZ(${CW - 5}px) translateX(-5px)`,
        transformOrigin: "right center",
      }} />
      <div style={{
        position: "absolute", width: 10, height: CH,
        background: `oklch(0.14 0.07 ${game.hue})`,
        transform: "rotateY(90deg) translateZ(5px) translateX(-5px)",
        transformOrigin: "left center",
      }} />
    </div>
  );
}

// ── Console ──────────────────────────────────────────────────────────────────
function Console({ insertedGame, onEject }: { insertedGame: CarouselGame | null; onEject: () => void }) {
  const [screenTxt, setScreenTxt] = useState("INSERT GAME");
  const c = insertedGame ? gc(insertedGame.hue) : "oklch(0.88 0.22 195)";
  const isOn = !!insertedGame;

  useEffect(() => {
    if (!insertedGame) { setScreenTxt("INSERT GAME"); return; }
    setScreenTxt("BOOTING...");
    const t1 = setTimeout(() => setScreenTxt("LOADING..."), 400);
    const t2 = setTimeout(() => setScreenTxt(insertedGame.title.slice(0, 14).toUpperCase()), 850);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [insertedGame]);

  return (
    <div style={{ position: "relative", width: CXW, perspective: 900 }}>
      {/* Cart slot top */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: CXW, height: 34,
        background: "linear-gradient(to bottom, oklch(0.10 0.035 195), oklch(0.065 0.02 195))",
        border: "1px solid rgba(255,255,255,0.08)", borderBottom: "none",
        borderRadius: "10px 10px 0 0",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 3,
      }}>
        {/* Slot opening */}
        <div style={{
          width: CXSW, height: 13,
          background: "oklch(0.018 0.008 195)",
          border: `1px solid ${isOn ? c + "66" : "rgba(255,255,255,0.10)"}`,
          borderRadius: 2,
          boxShadow: isOn ? `inset 0 0 8px ${c}22, 0 0 6px ${c}22` : "inset 0 2px 5px rgba(0,0,0,0.9)",
          transition: "all 0.4s",
          position: "relative",
        }}>
          {/* Cart peeking from slot */}
          {insertedGame && (
            <div style={{
              position: "absolute", bottom: 9, left: "50%", transform: "translateX(-50%)",
              width: 90, height: 26,
              background: `linear-gradient(160deg, oklch(0.28 0.14 ${insertedGame.hue}), oklch(0.18 0.10 ${insertedGame.hue}))`,
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
        {/* Eject button */}
        {insertedGame && (
          <button onClick={onEject} style={{
            position: "absolute", top: "50%", transform: "translateY(-50%)",
            right: `calc(50% - ${CXSW / 2 + 26}px)`,
            width: 26, height: 26, borderRadius: 4,
            background: `${c}14`, border: `1px solid ${c}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = `${c}28`;
            (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${c}55`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = `${c}14`;
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}>
            <svg width="11" height="11" viewBox="0 0 10 10" fill={c}>
              <path d="M5 8L2 4.5H4V1H6V4.5H8L5 8Z" transform="scale(1,-1) translate(0,-9)" />
              <rect x="1.5" y="8" width="7" height="1.5" rx="0.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Console body */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: CXW, height: CXH,
        background: "linear-gradient(175deg, oklch(0.13 0.045 195), oklch(0.075 0.025 195))",
        borderRadius: "0 0 12px 12px",
        border: "1px solid rgba(255,255,255,0.08)", borderTop: "none",
        boxShadow: [
          "0 10px 0 oklch(0.03 0.005 195)",
          "0 20px 50px rgba(0,0,0,0.92)",
          `0 0 80px ${isOn ? c + "30" : "oklch(0.88 0.22 195 / 0.06)"}`,
          "inset 0 1px 0 rgba(255,255,255,0.05)",
          "inset 0 -1px 0 rgba(0,0,0,0.4)",
        ].join(","),
        display: "flex", alignItems: "center",
        transition: "box-shadow 0.6s",
        zIndex: 2,
      }}>
        {/* Top accent line */}
        <div style={{
          position: "absolute", top: 0, left: 60, right: 60, height: 1,
          background: `linear-gradient(90deg, transparent, ${c}66, transparent)`,
          opacity: isOn ? 0.7 : 0.25, transition: "opacity 0.6s",
        }} />

        {/* Brand label */}
        <span style={{
          marginLeft: 26, fontFamily: "'Press Start 2P'", fontSize: 7.5,
          color: `oklch(0.88 0.22 195 / ${isOn ? "0.28" : "0.14"})`,
          letterSpacing: "0.16em", transition: "color 0.6s",
          textShadow: isOn ? `0 0 12px oklch(0.88 0.22 195 / 0.3)` : "none",
        }}>GAMESTASH</span>

        {/* Screen — bigger and more prominent */}
        <div style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          width: 160, height: 52,
          background: isOn ? `oklch(0.045 0.028 ${insertedGame?.hue ?? 195})` : "oklch(0.018 0.005 195)",
          border: `1px solid ${isOn ? c + "99" : "rgba(255,255,255,0.07)"}`,
          borderRadius: 5,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
          boxShadow: isOn
            ? `0 0 20px ${c}33, inset 0 0 16px ${c}18, 0 0 40px ${c}18`
            : "inset 0 3px 8px rgba(0,0,0,0.7)",
          overflow: "hidden",
          transition: "all 0.45s",
        }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.10) 3px, rgba(0,0,0,0.10) 4px)",
          }} />
          <div style={{
            fontFamily: "Share Tech Mono", fontSize: 7.5,
            color: isOn ? c : "oklch(0.28 0.04 195)",
            letterSpacing: "0.14em", textAlign: "center",
            padding: "0 8px", position: "relative",
            textShadow: isOn ? `0 0 10px ${c}, 0 0 20px ${c}55` : "none",
            transition: "all 0.4s",
          }}>
            {isOn ? screenTxt : <span style={{ opacity: 0.35 }}>NO GAME</span>}
          </div>
          {isOn && (
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: c, boxShadow: `0 0 8px ${c}, 0 0 16px ${c}66`,
              animation: "neon-pulse 1.4s ease-in-out infinite",
              position: "relative",
            }} />
          )}
        </div>

        {/* Speaker slots */}
        <div style={{ position: "absolute", right: 170, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 4 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{ width: 2, height: 32, background: "rgba(255,255,255,0.05)", borderRadius: 1 }} />
          ))}
        </div>

        {/* Controller ports */}
        <div style={{ position: "absolute", right: 80, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 14 }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              width: 24, height: 30, borderRadius: "50% 50% 4px 4px",
              background: "oklch(0.022 0.008 195)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "inset 0 2px 5px rgba(0,0,0,0.85)",
            }} />
          ))}
        </div>

        {/* LED + label */}
        <div style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: 11, height: 11, borderRadius: "50%",
            background: isOn ? c : "oklch(0.07 0.02 195)",
            boxShadow: isOn ? `0 0 12px ${c}, 0 0 28px ${c}88, 0 0 55px ${c}44` : "none",
            transition: "all 0.6s ease",
            animation: isOn ? "neon-pulse 1.5s ease-in-out infinite" : "none",
          }} />
          <span style={{
            fontFamily: "Share Tech Mono", fontSize: 6, letterSpacing: "0.1em",
            color: isOn ? c : "oklch(0.30 0.04 195)", transition: "color 0.6s",
          }}>
            {isOn ? "ON" : "OFF"}
          </span>
        </div>

        {/* 3D side faces */}
        {([
          { side: "left",  ry: -90, origin: "right center",  br: "12px 0 0 12px" },
          { side: "right", ry:  90, origin: "left center",   br: "0 12px 12px 0" },
        ] as const).map(({ side, ry, origin, br }) => (
          <div key={side} style={{
            position: "absolute", top: 0, [side]: 0, width: CXD, height: CXH,
            background: "linear-gradient(to bottom, oklch(0.09 0.03 195), oklch(0.05 0.015 195))",
            transform: `rotateY(${ry}deg) translateZ(${CXD / 2}px)`,
            transformOrigin: origin, backfaceVisibility: "hidden", borderRadius: br,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── CartridgeCarousel ────────────────────────────────────────────────────────
export function CartridgeCarousel({ games, onPlay }: { games: CarouselGame[]; onPlay: (game: CarouselGame) => void }) {
  const TOTAL = games.length;
  const STEP  = 360 / TOTAL;

  const [targetIdx, setTargetIdx]       = useState(0);
  const [angle, setAngle]               = useState(0);
  const angleRef                        = useRef(0);
  const [insertedGame, setInsertedGame] = useState<CarouselGame | null>(null);
  const [inFlight, setInFlight]         = useState<string | null>(null);
  const [flyCart, setFlyCart]           = useState<{ game: CarouselGame; sx: number; sy: number; dx: number; dy: number } | null>(null);
  const [ejectCart, setEjectCart]       = useState<{ game: CarouselGame; sx: number; sy: number; ex: number; ey: number } | null>(null);
  const cartEls   = useRef<(HTMLDivElement | null)[]>([]);
  const consoleEl = useRef<HTMLDivElement>(null);
  const wrapEl    = useRef<HTMLDivElement>(null);
  const wLock     = useRef(false);

  // Smooth rotation lerp
  useEffect(() => {
    let live = true;
    const tick = () => {
      if (!live) return;
      const target = -targetIdx * STEP;
      let d = target - angleRef.current;
      while (d > 180) d -= 360;
      while (d < -180) d += 360;
      angleRef.current = Math.abs(d) < 0.04 ? target : angleRef.current + d * 0.096;
      setAngle(angleRef.current);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { live = false; };
  }, [targetIdx, STEP]);

  // Wheel scroll
  useEffect(() => {
    const el = wrapEl.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wLock.current) return;
      wLock.current = true;
      setTargetIdx(i => ((i + (Math.sign(e.deltaX + e.deltaY) || 1)) % TOTAL + TOTAL) % TOTAL);
      setTimeout(() => { wLock.current = false; }, 360);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [TOTAL]);

  // Arrow keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  setTargetIdx(i => (i - 1 + TOTAL) % TOTAL);
      if (e.key === "ArrowRight") setTargetIdx(i => (i + 1) % TOTAL);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [TOTAL]);

  // Touch
  useEffect(() => {
    let sx = 0;
    const ts = (e: TouchEvent) => { sx = e.touches[0].clientX; };
    const te = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 44) setTargetIdx(i => ((i - Math.sign(dx) + TOTAL) % TOTAL));
    };
    window.addEventListener("touchstart", ts, { passive: true });
    window.addEventListener("touchend",   te, { passive: true });
    return () => { window.removeEventListener("touchstart", ts); window.removeEventListener("touchend", te); };
  }, [TOTAL]);

  const triggerInsert = useCallback((idx: number) => {
    const game = games[idx];
    if (!game || inFlight || insertedGame?.id === game.id) return;
    const cartEl = cartEls.current[idx];
    const conE   = consoleEl.current;
    const wrap   = wrapEl.current;
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
      setTargetIdx(i => (i + 1) % TOTAL);
    }, 920);
  }, [games, inFlight, insertedGame, TOTAL]);

  const handleEject = useCallback(() => {
    if (!insertedGame) return;
    const conE = consoleEl.current;
    const wrap = wrapEl.current;
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

  const handleCartClick = useCallback((idx: number) => {
    if (inFlight) return;
    if (idx !== targetIdx) { setTargetIdx(idx); return; }
    if (insertedGame?.id === games[idx]?.id) return;
    triggerInsert(idx);
  }, [targetIdx, inFlight, insertedGame, games, triggerInsert]);

  const getOpacity = (idx: number) => {
    const wa  = ((angle + idx * STEP) % 360 + 360) % 360;
    const a   = wa > 180 ? wa - 360 : wa;
    const abs = Math.abs(a);
    if (games[idx]?.id === inFlight || games[idx]?.id === insertedGame?.id) return 0;
    if (abs > 115) return 0;
    if (abs > 90)  return (115 - abs) / 25 * 0.3;
    return 1;
  };

  return (
    <div ref={wrapEl} style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* 3-D carousel ring — taller container so front cart has breathing room */}
      <div style={{ perspective: "1100px", perspectiveOrigin: "50% 50%", width: "100%", height: 380, position: "relative" }}>
        <div style={{
          position: "absolute", left: "50%", top: "52%",
          width: 0, height: 0,
          transformStyle: "preserve-3d",
          transform: `rotateY(${angle}deg)`,
        }}>
          {games.map((game, idx) => {
            const op       = getOpacity(idx);
            const isActive = idx === targetIdx && game.id !== inFlight && game.id !== insertedGame?.id;
            const c        = gc(game.hue);
            return (
              <div
                key={game.id}
                ref={el => { cartEls.current[idx] = el; }}
                style={{
                  position: "absolute", transformStyle: "preserve-3d", cursor: "pointer",
                  transform: `rotateY(${idx * STEP}deg) translateZ(${RADIUS}px) translateX(-${CW / 2}px) translateY(-${CH / 2}px)`,
                  opacity: op, pointerEvents: op < 0.05 ? "none" : "auto", transition: "opacity 0.3s",
                }}
                onClick={() => handleCartClick(idx)}
              >
                <div style={{
                  transform: isActive ? "translateY(-28px) scale(1.12)" : "translateY(0) scale(1)",
                  transformOrigin: `${CW / 2}px ${CH / 2}px`,
                  transition: "transform 0.48s cubic-bezier(0.34,1.5,0.64,1)",
                  transformStyle: "preserve-3d",
                  filter: isActive
                    ? `drop-shadow(0 0 34px ${c}dd) drop-shadow(0 18px 30px rgba(0,0,0,0.85))`
                    : "drop-shadow(0 5px 14px rgba(0,0,0,0.65))",
                }}>
                  <Cart3D game={game} isActive={isActive} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nav controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 4 }}>
        {[{ d: -1, l: "◀" }, null, { d: 1, l: "▶" }].map((b, i) =>
          b ? (
            <button key={i} onClick={() => setTargetIdx(x => ((x + b.d) % TOTAL + TOTAL) % TOTAL)} style={{
              width: 36, height: 36, background: "rgba(0,229,204,0.07)",
              border: "1px solid rgba(0,229,204,0.24)", borderRadius: "50%",
              color: "rgba(0,229,204,0.75)", fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,229,204,0.18)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 12px rgba(0,229,204,0.4)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,229,204,0.07)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >{b.l}</button>
          ) : (
            <div key={i} style={{
              fontFamily: "Share Tech Mono", fontSize: 11,
              color: "oklch(0.58 0.10 195)", letterSpacing: "0.2em", minWidth: 64, textAlign: "center",
            }}>
              {String(targetIdx + 1).padStart(2, "0")}/{String(TOTAL).padStart(2, "0")}
            </div>
          )
        )}
      </div>

      <div style={{
        fontFamily: "Share Tech Mono", fontSize: 8,
        color: "rgba(0,229,204,0.22)", letterSpacing: "0.22em", marginTop: 6, textAlign: "center",
      }}>
        CLICK FRONT CART TO INSERT · SCROLL / ← → TO SPIN
      </div>

      {/* Console */}
      <div style={{ marginTop: 22, position: "relative", zIndex: 5 }}>
        <div ref={consoleEl}>
          <Console insertedGame={insertedGame} onEject={handleEject} />
        </div>

        {/* Play button */}
        {insertedGame && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
            <button
              onClick={() => onPlay(insertedGame)}
              style={{
                fontFamily: "'Press Start 2P'", fontSize: 8, letterSpacing: "0.18em",
                color: "oklch(0.04 0.005 195)",
                background: gc(insertedGame.hue),
                border: "none", padding: "12px 32px",
                cursor: "pointer",
                boxShadow: `0 0 28px ${gc(insertedGame.hue)}99, 0 0 70px ${gc(insertedGame.hue)}33`,
                borderRadius: 2, transition: "all 0.22s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 48px ${gc(insertedGame.hue)}cc, 0 0 100px ${gc(insertedGame.hue)}44`;
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.05)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 28px ${gc(insertedGame.hue)}99, 0 0 70px ${gc(insertedGame.hue)}33`;
                (e.currentTarget as HTMLElement).style.transform = "none";
              }}
            >
              ▶ PLAY {insertedGame.title.slice(0, 12).toUpperCase()}
            </button>
          </div>
        )}
      </div>

      {/* Fly-in animation */}
      {flyCart && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 100, overflow: "hidden" }}>
          <style>{`@keyframes cFly{
            0%{transform:translate(0,0) scale(1);opacity:1}
            22%{transform:translate(0,-80px) scale(1.08);opacity:1}
            66%{transform:translate(var(--dx),var(--dy)) scale(.9);opacity:1}
            88%{transform:translate(var(--dx),calc(var(--dy)+26px)) scale(.84);opacity:.7}
            100%{transform:translate(var(--dx),calc(var(--dy)+44px)) scale(.82);opacity:.1}
          }`}</style>
          <div style={{
            position: "absolute", left: flyCart.sx, top: flyCart.sy,
            transformStyle: "preserve-3d",
            ["--dx" as string]: `${flyCart.dx}px`,
            ["--dy" as string]: `${flyCart.dy}px`,
            animation: "cFly 0.92s cubic-bezier(0.25,0.1,0.3,1) forwards",
          }}>
            <Cart3D game={flyCart.game} isActive={false} />
          </div>
        </div>
      )}

      {/* Eject animation */}
      {ejectCart && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 100, overflow: "hidden" }}>
          <style>{`@keyframes cEject{
            0%{transform:translate(0,0) scale(.82);opacity:.1}
            28%{transform:translate(0,-90px) scale(1.06);opacity:1}
            70%{transform:translate(var(--ex),var(--ey)) scale(1);opacity:1}
            100%{transform:translate(var(--ex),var(--ey)) scale(1);opacity:0}
          }`}</style>
          <div style={{
            position: "absolute", left: ejectCart.sx, top: ejectCart.sy,
            transformStyle: "preserve-3d",
            ["--ex" as string]: `${ejectCart.ex}px`,
            ["--ey" as string]: `${ejectCart.ey}px`,
            animation: "cEject 0.72s cubic-bezier(0.25,0.1,0.3,1) forwards",
          }}>
            <Cart3D game={ejectCart.game} isActive={false} />
          </div>
        </div>
      )}
    </div>
  );
}
