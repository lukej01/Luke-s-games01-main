"use client";

import React, { useEffect, useRef } from "react";

export function CyberpunkCursor() {
  const dotRef    = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const trailRef  = useRef<HTMLDivElement>(null);
  const mousePos  = useRef({ x: -200, y: -200 });
  const ringPos   = useRef({ x: -200, y: -200 });
  const trailPos  = useRef({ x: -200, y: -200 });
  const rafId     = useRef<number>(0);
  const isHover   = useRef(false);
  const isClick   = useRef(false);

  useEffect(() => {
    const dot   = dotRef.current;
    const ring  = ringRef.current;
    const trail = trailRef.current;
    if (!dot || !ring || !trail) return;

    const onMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      dot.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
    };

    const onDown = () => { isClick.current = true; };
    const onUp   = () => { isClick.current = false; };

    const attachHover = () => {
      document.querySelectorAll("a,button,[role='button'],.cursor-pointer,[data-hover]").forEach(el => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };

    const onEnter = () => { isHover.current = true; };
    const onLeave = () => { isHover.current = false; };

    const animate = () => {
      const { x, y } = mousePos.current;

      // Ring follows at ~12% lerp
      const rx = ringPos.current.x + (x - ringPos.current.x) * 0.12;
      const ry = ringPos.current.y + (y - ringPos.current.y) * 0.12;
      ringPos.current = { x: rx, y: ry };

      // Trail follows at ~6% lerp (slower)
      const tx = trailPos.current.x + (x - trailPos.current.x) * 0.06;
      const ty = trailPos.current.y + (y - trailPos.current.y) * 0.06;
      trailPos.current = { x: tx, y: ty };

      const ringSize   = isClick.current ? 20 : isHover.current ? 54 : 34;
      const trailSize  = isClick.current ? 48 : isHover.current ? 70 : 50;
      const ringOpacity  = isClick.current ? 0.9 : isHover.current ? 0.85 : 0.5;
      const trailOpacity = isClick.current ? 0.2 : isHover.current ? 0.12 : 0.07;

      ring.style.transform  = `translate(${rx - ringSize / 2}px, ${ry - ringSize / 2}px)`;
      ring.style.width      = `${ringSize}px`;
      ring.style.height     = `${ringSize}px`;
      ring.style.opacity    = String(ringOpacity);

      trail.style.transform = `translate(${tx - trailSize / 2}px, ${ty - trailSize / 2}px)`;
      trail.style.width     = `${trailSize}px`;
      trail.style.height    = `${trailSize}px`;
      trail.style.opacity   = String(trailOpacity);

      // Dot color — flick cyan on click
      if (isClick.current) {
        dot.style.background = "oklch(0.96 0.22 320)";
        dot.style.boxShadow  = "0 0 12px oklch(0.96 0.22 320), 0 0 28px oklch(0.78 0.22 320)";
      } else if (isHover.current) {
        dot.style.background = "oklch(0.88 0.22 195)";
        dot.style.boxShadow  = "0 0 14px oklch(0.88 0.22 195), 0 0 32px oklch(0.65 0.18 195), 0 0 60px oklch(0.55 0.15 195)";
      } else {
        dot.style.background = "oklch(0.88 0.22 195)";
        dot.style.boxShadow  = "0 0 8px oklch(0.88 0.22 195), 0 0 18px oklch(0.65 0.18 195)";
      }

      rafId.current = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    attachHover();
    rafId.current = requestAnimationFrame(animate);

    const obs = new MutationObserver(attachHover);
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(rafId.current);
      obs.disconnect();
    };
  }, []);

  const base: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    pointerEvents: "none",
    zIndex: 99999,
    willChange: "transform, width, height, opacity",
    borderRadius: "50%",
  };

  return (
    <>
      {/* Slow trailing aura */}
      <div
        ref={trailRef}
        aria-hidden="true"
        style={{
          ...base,
          width: 50,
          height: 50,
          background: "radial-gradient(circle, oklch(0.88 0.22 195 / 0.18) 0%, transparent 70%)",
          transition: "width 0.3s ease, height 0.3s ease",
          zIndex: 99996,
        }}
      />

      {/* Lagging ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          ...base,
          width: 34,
          height: 34,
          border: "1.5px solid oklch(0.88 0.22 195)",
          boxShadow: "0 0 8px oklch(0.88 0.22 195 / 0.5), inset 0 0 8px oklch(0.88 0.22 195 / 0.08)",
          transition: "width 0.18s cubic-bezier(0.16,1,0.3,1), height 0.18s cubic-bezier(0.16,1,0.3,1), opacity 0.18s ease",
          zIndex: 99997,
        }}
      />

      {/* Crisp dot — snaps to cursor */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          ...base,
          width: 12,
          height: 12,
          background: "oklch(0.88 0.22 195)",
          boxShadow: "0 0 8px oklch(0.88 0.22 195), 0 0 18px oklch(0.65 0.18 195)",
          transition: "background 0.15s, box-shadow 0.15s",
          zIndex: 99998,
        }}
      />
    </>
  );
}
