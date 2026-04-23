"use client";

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextScramble } from "@/components/ui/text-scramble";
gsap.registerPlugin(ScrollTrigger);

// ── Card dimensions ──────────────────────────────────────────────────────────
const CW   = 152;
const CH   = 224;
const GAP  = 22;
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

// ── Card3D ───────────────────────────────────────────────────────────────────
function Card3D({ game, isActive }: { game: CarouselGame; isActive: boolean }) {
  const c  = gc(game.hue);
  const cd = gcd(game.hue);

  return (
    <div style={{
      width: CW, height: CH,
      background: "oklch(0.072 0.018 195)",
      border: `1px solid ${isActive ? c + "66" : "oklch(0.22 0.07 195)"}`,
      borderRadius: 6,
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      boxShadow: isActive
        ? `0 0 0 1.5px ${c}55, 0 0 0 4px ${c}18, 0 28px 80px rgba(0,0,0,0.95), 0 0 90px ${c}35`
        : "0 8px 32px rgba(0,0,0,0.75), 0 0 0 1px oklch(0.16 0.05 195)",
      transition: "border-color 0.3s, box-shadow 0.3s",
      position: "relative",
    }}>
      {/* Cover art */}
      <div style={{
        flex: 1,
        background: game.coverImage
          ? `url(${game.coverImage}) center/cover no-repeat`
          : `linear-gradient(145deg, oklch(0.13 0.06 ${game.hue}), oklch(0.08 0.03 ${game.hue}))`,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `linear-gradient(${c}07 1px, transparent 1px), linear-gradient(90deg, ${c}07 1px, transparent 1px)`,
          backgroundSize: "14px 14px" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.10) 3px, rgba(0,0,0,0.10) 4px)" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.65) 100%)" }} />
        {!game.coverImage && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Press Start 2P'", fontSize: 11,
            color: `${c}18`, letterSpacing: "0.08em", userSelect: "none",
          }}>{game.platform}</div>
        )}
        <div style={{ position: "absolute", top: 6, left: 6, fontFamily: "Share Tech Mono", fontSize: 7,
          color: c, letterSpacing: "0.14em", background: `${c}18`, border: `1px solid ${c}44`,
          padding: "2px 6px", borderRadius: 2 }}>{game.platform}</div>
        <div style={{ position: "absolute", top: 6, right: 6, fontFamily: "Share Tech Mono",
          fontSize: 7, color: cd, letterSpacing: "0.1em" }}>{game.year}</div>
        {isActive && <>
          <div style={{ position: "absolute", top: 4, left: 4, width: 8, height: 8, border: `1.5px solid ${c}99`, borderRight: "none", borderBottom: "none" }} />
          <div style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, border: `1.5px solid ${c}99`, borderLeft: "none", borderBottom: "none" }} />
          <div style={{ position: "absolute", bottom: 4, left: 4, width: 8, height: 8, border: `1.5px solid ${c}99`, borderRight: "none", borderTop: "none" }} />
          <div style={{ position: "absolute", bottom: 4, right: 4, width: 8, height: 8, border: `1.5px solid ${c}99`, borderLeft: "none", borderTop: "none" }} />
        </>}
      </div>

      {/* Info strip */}
      <div style={{
        padding: "7px 10px 8px",
        borderTop: `1px solid ${isActive ? c + "33" : "oklch(0.16 0.05 195)"}`,
        background: "oklch(0.058 0.014 195)",
        transition: "border-color 0.3s",
      }}>
        <div style={{
          fontFamily: "'Press Start 2P'", fontSize: 5,
          color: isActive ? c : "oklch(0.55 0.12 195)",
          textShadow: isActive ? `0 0 10px ${c}` : "none",
          lineHeight: 1.9, letterSpacing: "0.04em",
          textAlign: "center",
          transition: "color 0.3s, text-shadow 0.3s",
          wordBreak: "break-word",
          overflow: "hidden",
          maxHeight: "2.5em",
        }}>{game.title.toUpperCase()}</div>
        <div style={{ display: "flex", gap: 3, justifyContent: "center", marginTop: 6 }}>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{
              width: 3, height: 6,
              background: `oklch(${isActive ? "0.42" : "0.28"} 0.09 ${game.hue + 20})`,
              borderRadius: "0 0 1px 1px",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
      </div>

      {isActive && (
        <div style={{
          position: "absolute", left: 0, right: 0, height: 2, pointerEvents: "none",
          background: `linear-gradient(90deg, transparent, ${c}99, transparent)`,
          animation: "scanline-drop 2s linear infinite", opacity: 0.7,
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
        background: "linear-gradient(to bottom, oklch(0.12 0.04 195), oklch(0.075 0.025 195))",
        border: "1px solid rgba(255,255,255,0.10)", borderBottom: "none",
        borderRadius: "10px 10px 0 0",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3,
      }}>
        <div style={{
          width: CXSW, height: 13,
          background: "oklch(0.018 0.008 195)",
          border: `1px solid ${isOn ? c + "77" : "rgba(255,255,255,0.12)"}`,
          borderRadius: 2,
          boxShadow: isOn ? `inset 0 0 8px ${c}22, 0 0 8px ${c}33` : "inset 0 2px 5px rgba(0,0,0,0.9)",
          transition: "all 0.4s", position: "relative",
        }}>
          {insertedGame && (
            <div style={{
              position: "absolute", bottom: 9, left: "50%", transform: "translateX(-50%)",
              width: 90, height: 26,
              background: `linear-gradient(160deg, oklch(0.22 0.10 ${insertedGame.hue}), oklch(0.14 0.06 ${insertedGame.hue}))`,
              border: `1px solid ${c}99`,
              borderRadius: "2px 2px 0 0",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 18px ${c}66`,
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
            background: `${c}18`, border: `1px solid ${c}66`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${c}30`; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 14px ${c}66`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${c}18`; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
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
        background: "linear-gradient(175deg, oklch(0.14 0.05 195), oklch(0.08 0.028 195))",
        borderRadius: "0 0 12px 12px",
        border: "1px solid rgba(255,255,255,0.10)", borderTop: "none",
        boxShadow: [
          "0 10px 0 oklch(0.03 0.005 195)",
          "0 20px 60px rgba(0,0,0,0.95)",
          `0 0 100px ${isOn ? c + "38" : "oklch(0.88 0.22 195 / 0.08)"}`,
          "inset 0 1px 0 rgba(255,255,255,0.06)",
        ].join(","),
        display: "flex", alignItems: "center", transition: "box-shadow 0.6s", zIndex: 2,
      }}>
        <div style={{ position: "absolute", top: 0, left: 60, right: 60, height: 1, background: `linear-gradient(90deg, transparent, ${c}77, transparent)`, opacity: isOn ? 0.8 : 0.28, transition: "opacity 0.6s" }} />
        <span style={{ marginLeft: 26, fontFamily: "'Press Start 2P'", fontSize: 7.5, color: `oklch(0.88 0.22 195 / ${isOn ? "0.32" : "0.16"})`, letterSpacing: "0.16em", transition: "color 0.6s", textShadow: isOn ? `0 0 14px oklch(0.88 0.22 195 / 0.35)` : "none" }}>GAMESTASH</span>

        {/* Screen */}
        <div style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          width: 160, height: 52,
          background: isOn ? `oklch(0.048 0.030 ${insertedGame?.hue ?? 195})` : "oklch(0.018 0.005 195)",
          border: `1px solid ${isOn ? c + "aa" : "rgba(255,255,255,0.08)"}`,
          borderRadius: 5, overflow: "hidden",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
          boxShadow: isOn ? `0 0 24px ${c}44, inset 0 0 18px ${c}22` : "inset 0 3px 8px rgba(0,0,0,0.7)",
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
          {[0,1,2,3,4].map(i => <div key={i} style={{ width: 2, height: 32, background: "rgba(255,255,255,0.06)", borderRadius: 1 }} />)}
        </div>
        {/* Ports */}
        <div style={{ position: "absolute", right: 80, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 14 }}>
          {[0,1].map(i => <div key={i} style={{ width: 24, height: 30, borderRadius: "50% 50% 4px 4px", background: "oklch(0.022 0.008 195)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "inset 0 2px 5px rgba(0,0,0,0.85)" }} />)}
        </div>
        {/* LED */}
        <div style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: isOn ? c : "oklch(0.07 0.02 195)", boxShadow: isOn ? `0 0 14px ${c}, 0 0 32px ${c}99` : "none", transition: "all 0.6s", animation: isOn ? "neon-pulse 1.5s ease-in-out infinite" : "none" }} />
          <span style={{ fontFamily: "Share Tech Mono", fontSize: 6, letterSpacing: "0.1em", color: isOn ? c : "oklch(0.30 0.04 195)", transition: "color 0.6s" }}>{isOn ? "ON" : "OFF"}</span>
        </div>
        {/* 3D sides */}
        {([{ side: "left", ry: -90, origin: "right center", br: "12px 0 0 12px" }, { side: "right", ry: 90, origin: "left center", br: "0 12px 12px 0" }] as const).map(({ side, ry, origin, br }) => (
          <div key={side} style={{ position: "absolute", top: 0, [side]: 0, width: CXD, height: CXH, background: "linear-gradient(to bottom, oklch(0.10 0.035 195), oklch(0.055 0.018 195))", transform: `rotateY(${ry}deg) translateZ(${CXD / 2}px)`, transformOrigin: origin, backfaceVisibility: "hidden", borderRadius: br }} />
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
  const TOTAL      = games.length;
  const LOOP_W     = TOTAL * UNIT;          // width of one full copy
  // Render 3 copies for seamless infinite loop
  const triGames   = [...games, ...games, ...games];

  // Scroll state — start at middle copy so we can go both directions
  const scrollX    = useRef(LOOP_W);
  const targetX    = useRef(LOOP_W);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const isHover    = useRef(false);
  const engaged    = useRef(false);
  const engageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef   = useRef(0);
  const [activeIdx, setActiveIdx] = useState(0);

  const [insertedGame, setInsertedGame] = useState<CarouselGame | null>(null);
  const [inFlight, setInFlight]         = useState<string | null>(null);
  const playTimer                       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [flyCart, setFlyCart]           = useState<{ game: CarouselGame; sx: number; sy: number; dx: number; dy: number } | null>(null);
  const [ejectCart, setEjectCart]       = useState<{ game: CarouselGame; sx: number; sy: number; ex: number; ey: number } | null>(null);

  // cartEls: indexed 0..TOTAL-1 (middle copy only, for fly animations)
  const cartEls     = useRef<(HTMLDivElement | null)[]>([]);
  // cardFlyRefs: same, for GSAP entrance animation
  const cardFlyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const consoleEl   = useRef<HTMLDivElement>(null);
  const outerRef    = useRef<HTMLDivElement>(null);


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

  // ── Infinite-loop RAF scroll ──────────────────────────────────────────
  useEffect(() => {
    const animate = () => {
      const dx = targetX.current - scrollX.current;
      scrollX.current += Math.abs(dx) > 0.08 ? dx * 0.1 : dx;

      // Wrap to keep within the middle copy zone [0.3 .. 1.7] * LOOP_W
      if (scrollX.current < LOOP_W * 0.35) {
        scrollX.current += LOOP_W;
        targetX.current  += LOOP_W;
      } else if (scrollX.current > LOOP_W * 1.65) {
        scrollX.current -= LOOP_W;
        targetX.current  -= LOOP_W;
      }

      const wrapW  = wrapRef.current?.offsetWidth ?? 800;
      const offset = wrapW / 2 - CW / 2 - scrollX.current;
      if (trackRef.current) trackRef.current.style.transform = `translateX(${offset.toFixed(2)}px)`;

      const ai = Math.round(scrollX.current / UNIT) % TOTAL;
      setActiveIdx((ai + TOTAL) % TOTAL);

      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [TOTAL, LOOP_W]);

  // ── Wheel — engagement-gated so vertical scroll isn't blocked ─────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!isHover.current) return;

      const absY = Math.abs(e.deltaY);
      const absX = Math.abs(e.deltaX);
      const isVertical = absX < 2 && e.deltaY !== 0;

      // Pure vertical scroll upward while not engaged → let page scroll
      if (isVertical && e.deltaY < 0 && !engaged.current) return;

      e.preventDefault();
      e.stopPropagation();

      const delta = absX > absY ? e.deltaX : e.deltaY;
      const d = Math.sign(delta) * Math.min(Math.abs(delta), 140) * 0.55;
      targetX.current += d;

      // Engage for 900ms so brief vertical scrolls are captured too
      engaged.current = true;
      if (engageTimer.current) clearTimeout(engageTimer.current);
      engageTimer.current = setTimeout(() => { engaged.current = false; }, 900);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("mouseenter", () => { isHover.current = true; });
    el.addEventListener("mouseleave", () => { isHover.current = false; engaged.current = false; });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ── Touch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let sx = 0;
    const ts = (e: TouchEvent) => { sx = e.touches[0].clientX; };
    const tm = (e: TouchEvent) => {
      const dx = sx - e.touches[0].clientX;
      sx = e.touches[0].clientX;
      targetX.current += dx * 1.2;
    };
    window.addEventListener("touchstart", ts, { passive: true });
    window.addEventListener("touchmove",  tm, { passive: true });
    return () => { window.removeEventListener("touchstart", ts); window.removeEventListener("touchmove", tm); };
  }, []);

  // ── GSAP ScrollTrigger fly-in — hide first, animate in on scroll ─────
  // useLayoutEffect ensures hidden state is set before first paint
  useLayoutEffect(() => {
    const refs = cardFlyRefs.current.filter(Boolean) as HTMLDivElement[];
    if (refs.length > 0) gsap.set(refs, { opacity: 0, y: 220, scale: 0.45 });
  }, []);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const getCards = () => cardFlyRefs.current.filter(Boolean) as HTMLDivElement[];

    const animIn = () => {
      const cards = getCards();
      if (!cards.length) return;
      gsap.killTweensOf(cards);
      gsap.to(cards, {
        opacity: 1, y: 0, scale: 1,
        duration: 1.15,
        stagger: { each: 0.078, from: "center" },
        ease: "expo.out",
      });
    };

    const animOut = (dirY: number, dirScale: number, fromEdge: "start" | "end") => {
      const cards = getCards();
      if (!cards.length) return;
      gsap.killTweensOf(cards);
      gsap.to(cards, {
        opacity: 0, y: dirY, scale: dirScale,
        duration: 0.5,
        stagger: { each: 0.04, from: fromEdge },
        ease: "power2.in",
      });
    };

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      end: "bottom 20%",
      onEnter:      () => animIn(),
      onLeave:      () => animOut(-80, 0.88, "start"),
      onEnterBack:  () => animIn(),
      onLeaveBack:  () => animOut(220, 0.45, "end"),
    });

    ScrollTrigger.refresh();
    return () => trigger.kill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Insert into console ───────────────────────────────────────────────
  const triggerInsert = useCallback((gameIdx: number) => {
    const game = games[gameIdx];
    if (!game || inFlight || insertedGame?.id === game.id) return;
    const cartEl = cartEls.current[gameIdx];
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
      dx: (sr.left - wr.left + sr.width  / 2 - CW / 2) - (cr.left - wr.left + cr.width  / 2 - CW / 2),
      dy: (sr.top  - wr.top  + sr.height / 2 - CH / 2 - 34) - (cr.top - wr.top + cr.height / 2 - CH / 2),
    });
    setTimeout(() => {
      setInsertedGame(game);
      setInFlight(null);
      setFlyCart(null);
      playTimer.current = setTimeout(() => onPlay(game), 300);
    }, 920);
  }, [games, inFlight, insertedGame, onPlay]);

  const handleEject = useCallback(() => {
    if (!insertedGame) return;
    if (playTimer.current) { clearTimeout(playTimer.current); playTimer.current = null; }
    const conE  = consoleEl.current;
    const wrap  = outerRef.current;
    const ei    = games.findIndex(g => g.id === insertedGame.id);
    const tEl   = cartEls.current[ei];
    if (!conE || !wrap) return;
    const wr = wrap.getBoundingClientRect();
    const sr = conE.getBoundingClientRect();
    const tr = tEl?.getBoundingClientRect() ?? sr;
    setEjectCart({
      game: insertedGame,
      sx: sr.left - wr.left + sr.width  / 2 - CW / 2,
      sy: sr.top  - wr.top  - 90,
      ex: (tr.left - wr.left + tr.width  / 2 - CW / 2) - (sr.left - wr.left + sr.width  / 2 - CW / 2),
      ey: (tr.top  - wr.top  + tr.height / 2 - CH / 2) - (sr.top  - wr.top  - 90),
    });
    setInsertedGame(null);
    setTimeout(() => setEjectCart(null), 750);
  }, [insertedGame, games]);

  const handleCardClick = useCallback((triIdx: number) => {
    if (inFlight) return;
    const gameIdx = triIdx % TOTAL;
    if (gameIdx !== activeIdx) {
      // Snap to nearest copy of the clicked game
      const c0 = gameIdx * UNIT;
      const c1 = LOOP_W + gameIdx * UNIT;
      const c2 = 2 * LOOP_W + gameIdx * UNIT;
      const best = [c0, c1, c2].reduce((p, c) =>
        Math.abs(c - scrollX.current) < Math.abs(p - scrollX.current) ? c : p
      );
      targetX.current = best;
      return;
    }
    if (insertedGame?.id === games[gameIdx]?.id) return;
    triggerInsert(gameIdx);
  }, [activeIdx, inFlight, insertedGame, games, triggerInsert, TOTAL, LOOP_W]);

  return (
    <div ref={outerRef} style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* ── Flat scroll track ── */}
      <div
        ref={wrapRef}
        style={{
          width: "100%",
          height: CH + 100,
          position: "relative",
          overflow: "hidden",
          cursor: "none",
        }}
      >
        {/* Fade edges */}
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 130, background: "linear-gradient(to right, var(--background) 0%, transparent 100%)", zIndex: 10, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 130, background: "linear-gradient(to left, var(--background) 0%, transparent 100%)", zIndex: 10, pointerEvents: "none" }} />

        <div
          ref={trackRef}
          style={{
            display: "flex",
            gap: GAP,
            position: "absolute",
            top: 40,
            left: 0,
            willChange: "transform",
          }}
        >
          {triGames.map((game, triIdx) => {
            const gameIdx    = triIdx % TOTAL;
            const isMid      = Math.floor(triIdx / TOTAL) === 1;
            const isActive   = gameIdx === activeIdx && game.id !== inFlight && game.id !== insertedGame?.id;
            const dist       = Math.abs(gameIdx - activeIdx);
            const wrapDist   = Math.min(dist, TOTAL - dist);
            const baseOpacity = game.id === inFlight || game.id === insertedGame?.id
              ? 0
              : Math.max(0.48, 1 - wrapDist * 0.10);

            return (
              <div
                key={`${triIdx}`}
                ref={el => { if (isMid) cardFlyRefs.current[gameIdx] = el; }}
              >
                <div
                  ref={el => { if (isMid) cartEls.current[gameIdx] = el; }}
                  style={{
                    width: CW, height: CH,
                    cursor: "pointer",
                    transform: isActive
                      ? "translateY(-26px) scale(1.10)"
                      : `translateY(${Math.min(wrapDist * 3, 10)}px) scale(${Math.max(0.90, 1 - wrapDist * 0.035)})`,
                    opacity: baseOpacity,
                    transition: "transform 0.45s cubic-bezier(0.34,1.5,0.64,1), opacity 0.3s",
                    transformOrigin: "center bottom",
                  }}
                  onClick={() => handleCardClick(triIdx)}
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

      {/* ── Counter + hint ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 2, zIndex: 1 }}>
        <div style={{ fontFamily: "Share Tech Mono", fontSize: 10, color: "oklch(0.55 0.12 195)", letterSpacing: "0.2em" }}>
          {String(activeIdx + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
        </div>
      </div>
      <div style={{ marginTop: 5, textAlign: "center", zIndex: 1 }}>
        <TextScramble text="HOVER + SCROLL TO BROWSE  ·  CLICK TO PLAY" style={{ fontFamily: "Share Tech Mono", fontSize: 8, color: "oklch(0.88 0.22 195 / 0.30)", letterSpacing: "0.22em" }} />
      </div>

      {/* ── Console ── */}
      <div style={{ marginTop: 18, zIndex: 5, width: "100%", display: "flex", justifyContent: "center" }}>
        <div ref={consoleEl} style={{ width: CXW, flexShrink: 0 }}>
          <Console insertedGame={insertedGame} onEject={handleEject} />
        </div>
      </div>

      {/* ── Fly overlays ── */}
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
