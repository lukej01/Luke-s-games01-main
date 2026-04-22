"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// ── Constants ────────────────────────────────────────────────────────────────
const RADIUS = 310;
const CW = 108;
const CH = 148;
const CXW = 370;
const CXH = 142;
const CXD = 22;
const CXSW = 122;

const gc  = (h: number) => `oklch(0.88 0.22 ${h})`;
const gcd = (h: number) => `oklch(0.60 0.18 ${h})`;

export interface CarouselGame {
  id: string;
  title: string;
  platform: string;
  year: string;
  hue: number;
}

// ── Cart3D ───────────────────────────────────────────────────────────────────
function Cart3D({ game, isActive }: { game: CarouselGame; isActive: boolean }) {
  const c = gc(game.hue);
  return (
    <div style={{ width: CW, height: CH, position: "relative", transformStyle: "preserve-3d" }}>
      {/* Front */}
      <div style={{
        position: "absolute", width: CW, height: CH,
        background: `linear-gradient(145deg, oklch(0.30 0.16 ${game.hue}), oklch(0.18 0.10 ${game.hue}))`,
        border: `1px solid ${c}${isActive ? "99" : "55"}`,
        borderRadius: "4px 4px 2px 2px",
        boxShadow: isActive
          ? `0 0 24px ${c}55, inset 0 1px 0 rgba(255,255,255,0.14)`
          : `inset 0 1px 0 rgba(255,255,255,0.07)`,
        display: "flex", flexDirection: "column", alignItems: "center",
        overflow: "hidden", transform: "translateZ(4px)",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}>
        {/* Label panel */}
        <div style={{
          width: "88%", height: "62%", marginTop: 8,
          background: `linear-gradient(135deg, oklch(0.22 0.12 ${game.hue}), oklch(0.14 0.08 ${game.hue}))`,
          border: `1px solid ${c}44`, borderRadius: 2,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 4,
        }}>
          <span style={{
            fontFamily: "'Press Start 2P'", fontSize: 5.5, color: c,
            textShadow: isActive ? `0 0 8px ${c}` : "none",
            textAlign: "center", lineHeight: 1.9, wordBreak: "break-word",
            transition: "text-shadow 0.3s",
          }}>
            {game.title.slice(0, 16).toUpperCase()}
          </span>
        </div>

        {/* Bottom strip */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: `oklch(0.12 0.06 ${game.hue})`,
          borderTop: `1px solid ${c}33`,
          padding: "4px 0 2px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        }}>
          <span style={{ fontFamily: "Share Tech Mono", fontSize: 6, color: gcd(game.hue), letterSpacing: "0.12em" }}>
            {game.platform}
          </span>
          {/* Connector pins */}
          <div style={{ display: "flex", gap: 3.5 }}>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} style={{
                width: 3, height: 7,
                background: `oklch(0.50 0.12 ${game.hue + 20})`,
                borderRadius: "0 0 1px 1px",
              }} />
            ))}
          </div>
        </div>

        {/* Year badge */}
        <div style={{
          position: "absolute", top: 6, right: 5,
          fontFamily: "Share Tech Mono", fontSize: 5,
          color: gcd(game.hue), letterSpacing: "0.1em",
        }}>
          {game.year}
        </div>
      </div>

      {/* Back face */}
      <div style={{
        position: "absolute", width: CW, height: CH,
        background: `oklch(0.10 0.05 ${game.hue})`,
        border: `1px solid ${c}22`,
        borderRadius: "4px 4px 2px 2px",
        transform: "translateZ(-4px) rotateY(180deg)",
      }} />

      {/* Left side */}
      <div style={{
        position: "absolute", width: 8, height: CH,
        background: `oklch(0.16 0.08 ${game.hue})`,
        transform: `rotateY(-90deg) translateZ(${CW - 4}px) translateX(-4px)`,
        transformOrigin: "right center",
      }} />

      {/* Right side */}
      <div style={{
        position: "absolute", width: 8, height: CH,
        background: `oklch(0.16 0.08 ${game.hue})`,
        transform: "rotateY(90deg) translateZ(4px) translateX(-4px)",
        transformOrigin: "left center",
      }} />
    </div>
  );
}

// ── Console ──────────────────────────────────────────────────────────────────
function Console({
  insertedGame, onEject,
}: {
  insertedGame: CarouselGame | null;
  onEject: () => void;
}) {
  const [screenTxt, setScreenTxt] = useState("INSERT GAME");
  const c = insertedGame ? gc(insertedGame.hue) : "oklch(0.88 0.22 195)";

  useEffect(() => {
    if (!insertedGame) { setScreenTxt("INSERT GAME"); return; }
    setScreenTxt("BOOTING...");
    const t1 = setTimeout(() => setScreenTxt("LOADING..."), 400);
    const t2 = setTimeout(() => setScreenTxt(insertedGame.title.slice(0, 14).toUpperCase()), 850);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [insertedGame]);

  return (
    <div style={{ position: "relative", width: CXW, perspective: 800, perspectiveOrigin: "50% 50%", transformStyle: "preserve-3d" }}>

      {/* Cart slot top */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: CXW, height: 30,
        background: "linear-gradient(to bottom, oklch(0.07 0.03 195), oklch(0.05 0.02 195))",
        border: "1px solid rgba(255,255,255,0.07)", borderBottom: "none",
        borderRadius: "8px 8px 0 0",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 3,
      }}>
        {/* Slot opening */}
        <div style={{
          width: CXSW, height: 11,
          background: "oklch(0.025 0.01 195)",
          border: `1px solid ${insertedGame ? c + "55" : "rgba(255,255,255,0.09)"}`,
          borderRadius: 2,
          boxShadow: insertedGame ? `inset 0 0 6px ${c}22` : "inset 0 2px 4px rgba(0,0,0,0.8)",
          transition: "all 0.4s",
          position: "relative",
        }}>
          {/* Cart sticking up from slot */}
          {insertedGame && (
            <div style={{
              position: "absolute", bottom: 7, left: "50%", transform: "translateX(-50%)",
              width: 82, height: 24,
              background: `linear-gradient(160deg, oklch(0.30 0.15 ${insertedGame.hue}), oklch(0.20 0.10 ${insertedGame.hue}))`,
              border: `1px solid ${c}77`,
              borderRadius: "2px 2px 0 0",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 12px ${c}44`,
            }}>
              <span style={{ fontFamily: "'Press Start 2P'", fontSize: 4, color: c, letterSpacing: "0.08em" }}>
                {insertedGame.title.slice(0, 10).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Eject button */}
        {insertedGame && (
          <button
            onClick={onEject}
            style={{
              position: "absolute", top: "50%", transform: "translateY(-50%)",
              right: `calc(50% - ${CXSW / 2 + 20}px)`,
              width: 22, height: 22, borderRadius: 3,
              background: "rgba(255,255,255,0.06)", border: `1px solid ${c}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = `${c}22`;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 10px ${c}44`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill={c}>
              <path d="M5 8L2 4.5H4V1H6V4.5H8L5 8Z" transform="scale(1,-1) translate(0,-9)" />
              <rect x="1.5" y="8" width="7" height="1.5" rx="0.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Console body */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: CXW, height: CXH,
        background: "linear-gradient(to bottom, oklch(0.12 0.04 195), oklch(0.07 0.02 195))",
        borderRadius: "0 0 10px 10px",
        border: "1px solid rgba(255,255,255,0.07)", borderTop: "none",
        boxShadow: [
          "0 9px 0 oklch(0.03 0.005 195)",
          "0 18px 40px rgba(0,0,0,0.9)",
          `0 0 60px ${insertedGame ? c + "2a" : "oklch(0.88 0.22 195 / 0.05)"}`,
          "inset 0 -1px 0 rgba(255,255,255,0.05)",
        ].join(","),
        display: "flex", alignItems: "center",
        transition: "box-shadow 0.6s",
        zIndex: 2,
      }}>
        {/* Top accent */}
        <div style={{
          position: "absolute", top: 0, left: 50, right: 50, height: 1,
          background: `linear-gradient(90deg, transparent, ${c}, transparent)`,
          opacity: 0.4, transition: "opacity 0.6s",
        }} />

        <span style={{
          marginLeft: 22, fontFamily: "'Press Start 2P'", fontSize: 7,
          color: "oklch(0.88 0.22 195 / 0.18)", letterSpacing: "0.14em",
        }}>GAMESTASH</span>

        {/* Screen */}
        <div style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          width: 132, height: 42,
          background: insertedGame ? `oklch(0.04 0.025 ${insertedGame.hue})` : "oklch(0.02 0.005 195)",
          border: `1px solid ${insertedGame ? c + "88" : "rgba(255,255,255,0.06)"}`,
          borderRadius: 4,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
          boxShadow: insertedGame ? `0 0 14px ${c}22, inset 0 0 10px ${c}14` : "inset 0 3px 7px rgba(0,0,0,0.65)",
          overflow: "hidden",
          transition: "all 0.4s",
        }}>
          {/* Scanlines */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.11) 3px, rgba(0,0,0,0.11) 4px)",
          }} />
          <div style={{
            fontFamily: "Share Tech Mono", fontSize: 6.5,
            color: insertedGame ? c : "oklch(0.35 0.04 195)",
            letterSpacing: "0.12em", transition: "color 0.4s",
            textAlign: "center", padding: "0 6px", position: "relative",
          }}>
            {insertedGame ? screenTxt : <span style={{ opacity: 0.4 }}>NO GAME</span>}
          </div>
          {insertedGame && (
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: c, boxShadow: `0 0 6px ${c}`,
              animation: "neon-pulse 1.5s ease-in-out infinite",
              position: "relative",
            }} />
          )}
        </div>

        {/* Speaker slots */}
        <div style={{ position: "absolute", right: 145, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 3.5 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ width: 2, height: 28, background: "rgba(255,255,255,0.04)", borderRadius: 1 }} />
          ))}
        </div>

        {/* Controller ports */}
        <div style={{ position: "absolute", right: 72, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 12 }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              width: 22, height: 28, borderRadius: "50% 50% 4px 4px",
              background: "oklch(0.025 0.01 195)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8)",
            }} />
          ))}
        </div>

        {/* LED */}
        <div style={{ position: "absolute", right: 22, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: insertedGame ? c : "oklch(0.07 0.02 195)",
            boxShadow: insertedGame ? `0 0 10px ${c}, 0 0 26px ${c}88, 0 0 50px ${c}44` : "none",
            transition: "all 0.6s ease",
          }} />
          <span style={{
            fontFamily: "Share Tech Mono", fontSize: 6, letterSpacing: "0.1em",
            color: insertedGame ? c : "oklch(0.35 0.04 195)", transition: "color 0.6s",
          }}>
            {insertedGame ? "ON" : "OFF"}
          </span>
        </div>

        {/* 3D side faces */}
        {([
          { side: "left",  ry: -90, origin: "right center",  br: "10px 0 0 10px" },
          { side: "right", ry:  90, origin: "left center",   br: "0 10px 10px 0" },
        ] as const).map(({ side, ry, origin, br }) => (
          <div key={side} style={{
            position: "absolute", top: 0, [side]: 0, width: CXD, height: CXH,
            background: "linear-gradient(to bottom, oklch(0.09 0.03 195), oklch(0.055 0.015 195))",
            transform: `rotateY(${ry}deg) translateZ(${CXD / 2}px)`,
            transformOrigin: origin, backfaceVisibility: "hidden", borderRadius: br,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── CartridgeCarousel ────────────────────────────────────────────────────────
export function CartridgeCarousel({
  games,
  onPlay,
}: {
  games: CarouselGame[];
  onPlay: (game: CarouselGame) => void;
}) {
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
  const tIdxRef   = useRef(0);
  const wLock     = useRef(false);

  useEffect(() => { tIdxRef.current = targetIdx; }, [targetIdx]);

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

  // Wheel scroll (scoped to carousel element)
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

  // Arrow keys + touch
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  setTargetIdx(i => (i - 1 + TOTAL) % TOTAL);
      if (e.key === "ArrowRight") setTargetIdx(i => (i + 1) % TOTAL);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [TOTAL]);

  useEffect(() => {
    let sx = 0;
    const ts = (e: TouchEvent) => { sx = e.touches[0].clientX; };
    const te = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 44) setTargetIdx(i => ((i - Math.sign(dx) + TOTAL) % TOTAL));
    };
    window.addEventListener("touchstart", ts, { passive: true });
    window.addEventListener("touchend",   te, { passive: true });
    return () => {
      window.removeEventListener("touchstart", ts);
      window.removeEventListener("touchend", te);
    };
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
      dy: (sr.top  - wr.top  + sr.height / 2 - CH / 2 - 30) - (cr.top - wr.top + cr.height / 2 - CH / 2),
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
    const conE   = consoleEl.current;
    const wrap   = wrapEl.current;
    const ei     = games.findIndex(g => g.id === insertedGame.id);
    const tEl    = cartEls.current[ei];
    if (!conE || !wrap) return;
    const wr = wrap.getBoundingClientRect();
    const sr = conE.getBoundingClientRect();
    const tr = tEl?.getBoundingClientRect() ?? sr;

    setEjectCart({
      game: insertedGame,
      sx: sr.left - wr.left + sr.width / 2 - CW / 2,
      sy: sr.top  - wr.top  - 80,
      ex: (tr.left - wr.left + tr.width / 2 - CW / 2) - (sr.left - wr.left + sr.width / 2 - CW / 2),
      ey: (tr.top  - wr.top  + tr.height / 2 - CH / 2) - (sr.top - wr.top - 80),
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

      {/* 3-D carousel ring */}
      <div style={{ perspective: "1100px", perspectiveOrigin: "50% 50%", width: "100%", height: 320, position: "relative" }}>
        <div style={{
          position: "absolute", left: "50%", top: "50%",
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
                  transform: isActive ? "translateY(-26px) scale(1.12)" : "translateY(0) scale(1)",
                  transformOrigin: `${CW / 2}px ${CH / 2}px`,
                  transition: "transform 0.48s cubic-bezier(0.34,1.5,0.64,1)",
                  transformStyle: "preserve-3d",
                  filter: isActive
                    ? `drop-shadow(0 0 32px ${c}dd) drop-shadow(0 16px 28px rgba(0,0,0,0.85))`
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
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
        {[{ d: -1, l: "◀" }, null, { d: 1, l: "▶" }].map((b, i) =>
          b ? (
            <button key={i} onClick={() => setTargetIdx(x => ((x + b.d) % TOTAL + TOTAL) % TOTAL)} style={{
              width: 34, height: 34, background: "rgba(0,229,204,0.06)",
              border: "1px solid rgba(0,229,204,0.22)", borderRadius: "50%",
              color: "rgba(0,229,204,0.7)", fontSize: 12, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace",
            }}>{b.l}</button>
          ) : (
            <div key={i} style={{
              fontFamily: "Share Tech Mono", fontSize: 10,
              color: "oklch(0.55 0.08 195)", letterSpacing: "0.2em", minWidth: 60, textAlign: "center",
            }}>
              {String(targetIdx + 1).padStart(2, "0")}/{String(TOTAL).padStart(2, "0")}
            </div>
          )
        )}
      </div>

      <div style={{
        fontFamily: "Share Tech Mono", fontSize: 8,
        color: "rgba(0,229,204,0.18)", letterSpacing: "0.22em", marginTop: 6, textAlign: "center",
      }}>
        CLICK FRONT CART TO INSERT · SCROLL / ← → TO SPIN
      </div>

      {/* Console */}
      <div style={{ marginTop: 18, position: "relative", zIndex: 5 }}>
        <div ref={consoleEl}>
          <Console insertedGame={insertedGame} onEject={handleEject} />
        </div>

        {/* Play button — appears when game is loaded */}
        {insertedGame && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
            <button
              onClick={() => onPlay(insertedGame)}
              style={{
                fontFamily: "'Press Start 2P'", fontSize: 8, letterSpacing: "0.18em",
                color: "oklch(0.04 0.005 195)",
                background: gc(insertedGame.hue),
                border: "none", padding: "10px 28px",
                cursor: "pointer",
                boxShadow: `0 0 24px ${gc(insertedGame.hue)}88, 0 0 60px ${gc(insertedGame.hue)}33`,
                borderRadius: 2, transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  `0 0 40px ${gc(insertedGame.hue)}cc, 0 0 90px ${gc(insertedGame.hue)}44`;
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.04)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  `0 0 24px ${gc(insertedGame.hue)}88, 0 0 60px ${gc(insertedGame.hue)}33`;
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
            28%{transform:translate(0,-80px) scale(1.06);opacity:1}
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
