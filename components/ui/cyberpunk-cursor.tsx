"use client";

import React, { useEffect, useRef } from "react";

const TRAIL = 10;

export function CyberpunkCursor() {
  const dotRef    = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const auraRef   = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouse     = useRef({ x: -200, y: -200 });
  const ringPos   = useRef({ x: -200, y: -200 });
  const auraPos   = useRef({ x: -200, y: -200 });
  const trail     = useRef<Array<{ x: number; y: number }>>(
    Array.from({ length: TRAIL }, () => ({ x: -200, y: -200 }))
  );
  const raf       = useRef<number>(0);
  const hover     = useRef(false);
  const click     = useRef(false);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    const aura = auraRef.current;
    if (!dot || !ring || !aura) return;

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      dot.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
    };
    const onDown = () => { click.current = true; };
    const onUp   = () => { click.current = false; };
    const onEnter = () => { hover.current = true; };
    const onLeave = () => { hover.current = false; };

    const attach = () => {
      document.querySelectorAll("a,button,[role='button'],.cursor-pointer,[data-hover]").forEach(el => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };

    const tick = () => {
      const { x, y } = mouse.current;

      // Trail cascade — each step follows the one before at 55% lerp
      trail.current[0] = {
        x: trail.current[0].x + (x - trail.current[0].x) * 0.38,
        y: trail.current[0].y + (y - trail.current[0].y) * 0.38,
      };
      for (let i = 1; i < TRAIL; i++) {
        const prev = trail.current[i - 1];
        trail.current[i] = {
          x: trail.current[i].x + (prev.x - trail.current[i].x) * 0.52,
          y: trail.current[i].y + (prev.y - trail.current[i].y) * 0.52,
        };
      }
      for (let i = 0; i < TRAIL; i++) {
        const el = trailRefs.current[i];
        if (!el) continue;
        const t = 1 - i / TRAIL;
        const sz = 2 + t * 4;
        el.style.transform = `translate(${trail.current[i].x - sz * 0.5}px, ${trail.current[i].y - sz * 0.5}px)`;
        el.style.width  = `${sz}px`;
        el.style.height = `${sz}px`;
        el.style.opacity = String(t * (click.current ? 0.75 : 0.45));
      }

      // Ring
      const rx = ringPos.current.x + (x - ringPos.current.x) * 0.13;
      const ry = ringPos.current.y + (y - ringPos.current.y) * 0.13;
      ringPos.current = { x: rx, y: ry };
      const rs = click.current ? 14 : hover.current ? 38 : 22;
      ring.style.transform = `translate(${rx - rs * 0.5}px, ${ry - rs * 0.5}px)`;
      ring.style.width     = `${rs}px`;
      ring.style.height    = `${rs}px`;
      ring.style.opacity   = String(click.current ? 0.9 : hover.current ? 0.85 : 0.55);

      // Aura
      const ax = auraPos.current.x + (x - auraPos.current.x) * 0.055;
      const ay = auraPos.current.y + (y - auraPos.current.y) * 0.055;
      auraPos.current = { x: ax, y: ay };
      const as_ = click.current ? 30 : hover.current ? 52 : 38;
      aura.style.transform = `translate(${ax - as_ * 0.5}px, ${ay - as_ * 0.5}px)`;
      aura.style.width     = `${as_}px`;
      aura.style.height    = `${as_}px`;
      aura.style.opacity   = String(click.current ? 0.18 : hover.current ? 0.12 : 0.07);

      // Dot color
      if (click.current) {
        dot.style.background = "oklch(0.96 0.22 320)";
        dot.style.boxShadow  = "0 0 8px oklch(0.96 0.22 320), 0 0 18px oklch(0.78 0.22 320)";
      } else if (hover.current) {
        dot.style.background = "oklch(0.95 0.22 195)";
        dot.style.boxShadow  = "0 0 10px oklch(0.88 0.22 195), 0 0 22px oklch(0.65 0.18 195)";
      } else {
        dot.style.background = "oklch(0.88 0.22 195)";
        dot.style.boxShadow  = "0 0 6px oklch(0.88 0.22 195), 0 0 12px oklch(0.65 0.18 195)";
      }

      raf.current = requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    attach();
    raf.current = requestAnimationFrame(tick);

    const obs = new MutationObserver(attach);
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf.current);
      obs.disconnect();
    };
  }, []);

  const base: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    pointerEvents: "none",
    borderRadius: "50%",
    willChange: "transform",
  };

  return (
    <>
      {/* Trail particles */}
      {Array.from({ length: TRAIL }, (_, i) => (
        <div
          key={i}
          ref={el => { trailRefs.current[i] = el; }}
          aria-hidden="true"
          style={{
            ...base,
            width: 6,
            height: 6,
            background: `oklch(0.88 0.22 ${195 + i * 9})`,
            boxShadow: `0 0 5px oklch(0.88 0.22 ${195 + i * 9} / 0.7)`,
            zIndex: 99990 + (TRAIL - i),
          }}
        />
      ))}

      {/* Aura blob */}
      <div
        ref={auraRef}
        aria-hidden="true"
        style={{
          ...base,
          width: 38,
          height: 38,
          background: "radial-gradient(circle, oklch(0.88 0.22 195 / 0.2) 0%, transparent 70%)",
          transition: "width 0.28s ease, height 0.28s ease",
          zIndex: 99994,
        }}
      />

      {/* Lagging ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          ...base,
          width: 22,
          height: 22,
          border: "1px solid oklch(0.88 0.22 195 / 0.9)",
          boxShadow: "0 0 5px oklch(0.88 0.22 195 / 0.4)",
          transition: "width 0.16s cubic-bezier(0.16,1,0.3,1), height 0.16s cubic-bezier(0.16,1,0.3,1), opacity 0.15s ease",
          zIndex: 99997,
        }}
      />

      {/* Crisp dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          ...base,
          width: 8,
          height: 8,
          background: "oklch(0.88 0.22 195)",
          boxShadow: "0 0 6px oklch(0.88 0.22 195), 0 0 14px oklch(0.65 0.18 195)",
          transition: "background 0.12s, box-shadow 0.12s",
          zIndex: 99998,
        }}
      />
    </>
  );
}
