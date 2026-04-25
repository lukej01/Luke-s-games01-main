"use client";

import React, { useEffect, useRef } from "react";

const TRAIL = 16;

export function CyberpunkCursor() {
  const dotRef    = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouse     = useRef({ x: -200, y: -200 });
  const rawMouse  = useRef({ x: -200, y: -200 });
  const hoverEl   = useRef<HTMLElement | null>(null);
  const trail     = useRef<Array<{ x: number; y: number }>>(
    Array.from({ length: TRAIL }, () => ({ x: -200, y: -200 }))
  );
  const raf   = useRef<number>(0);
  const click = useRef(false);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    const onMove = (e: MouseEvent) => {
      rawMouse.current = { x: e.clientX, y: e.clientY };
      if (!hoverEl.current) {
        mouse.current = { x: e.clientX, y: e.clientY };
      }
    };
    const onDown = () => { click.current = true; };
    const onUp   = () => { click.current = false; };

    const onEnter = (e: MouseEvent) => { hoverEl.current = e.currentTarget as HTMLElement; };
    const onLeave = () => { hoverEl.current = null; };

    const attach = () => {
      document.querySelectorAll("a,button,[role='button'],.cursor-pointer,[data-hover]").forEach(el => {
        el.removeEventListener("mouseenter", onEnter as EventListener);
        el.removeEventListener("mouseleave", onLeave);
        el.addEventListener("mouseenter", onEnter as EventListener);
        el.addEventListener("mouseleave", onLeave);
      });
    };

    const tick = () => {
      if (hoverEl.current) {
        const rect = hoverEl.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        // Magnetic pull
        const dx = rawMouse.current.x - cx;
        const dy = rawMouse.current.y - cy;
        // Spring towards center, but still slightly follow mouse
        mouse.current.x += ((cx + dx * 0.15) - mouse.current.x) * 0.25;
        mouse.current.y += ((cy + dy * 0.15) - mouse.current.y) * 0.25;
      } else {
        mouse.current.x += (rawMouse.current.x - mouse.current.x) * 0.35;
        mouse.current.y += (rawMouse.current.y - mouse.current.y) * 0.35;
      }

      const { x, y } = mouse.current;
      dot.style.transform = `translate(${x - 3}px, ${y - 3}px)`;

      trail.current[0] = {
        x: trail.current[0].x + (x - trail.current[0].x) * 0.35,
        y: trail.current[0].y + (y - trail.current[0].y) * 0.35,
      };
      for (let i = 1; i < TRAIL; i++) {
        const prev = trail.current[i - 1];
        trail.current[i] = {
          x: trail.current[i].x + (prev.x - trail.current[i].x) * 0.45,
          y: trail.current[i].y + (prev.y - trail.current[i].y) * 0.45,
        };
      }

      for (let i = 0; i < TRAIL; i++) {
        const el = trailRefs.current[i];
        if (!el) continue;
        const t = 1 - i / TRAIL;
        const sz = 1.2 + t * 4.2;
        el.style.transform = `translate(${trail.current[i].x - sz * 0.5}px, ${trail.current[i].y - sz * 0.5}px)`;
        el.style.width  = `${sz}px`;
        el.style.height = `${sz}px`;
        el.style.opacity = String(t * t * (click.current ? 0.80 : 0.55));
      }

      if (click.current) {
        dot.style.background = "oklch(0.98 0.01 0)";
        dot.style.boxShadow  = "0 0 8px oklch(0.97 0.01 0), 0 0 20px oklch(0.85 0.00 0)";
      } else if (hoverEl.current) {
        dot.style.background = "oklch(0.95 0.22 195)";
        dot.style.boxShadow  = "0 0 10px oklch(0.88 0.22 195), 0 0 22px oklch(0.65 0.18 195)";
        dot.style.width = "7px";
        dot.style.height = "7px";
        dot.style.marginLeft = "-1px";
        dot.style.marginTop = "-1px";
      } else {
        dot.style.background = "oklch(0.88 0.22 195)";
        dot.style.boxShadow  = "0 0 6px oklch(0.88 0.22 195), 0 0 12px oklch(0.65 0.18 195)";
        dot.style.width = "5px";
        dot.style.height = "5px";
        dot.style.marginLeft = "0px";
        dot.style.marginTop = "0px";
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
      {Array.from({ length: TRAIL }, (_, i) => (
        <div
          key={i}
          ref={el => { trailRefs.current[i] = el; }}
          aria-hidden="true"
          style={{
            ...base,
            width: 6,
            height: 6,
            background: `oklch(${0.88 + i * 0.006} ${Math.max(0, 0.22 - i * 0.016).toFixed(3)} 195)`,
            boxShadow: `0 0 4px oklch(${0.88 + i * 0.006} ${Math.max(0, 0.22 - i * 0.016).toFixed(3)} 195 / 0.6)`,
            zIndex: 99990 + (TRAIL - i),
          }}
        />
      ))}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          ...base,
          width: 5,
          height: 5,
          background: "oklch(0.88 0.22 195)",
          boxShadow: "0 0 6px oklch(0.88 0.22 195), 0 0 12px oklch(0.65 0.18 195)",
          transition: "background 0.12s, box-shadow 0.12s, width 0.12s, height 0.12s",
          zIndex: 99999,
        }}
      />
    </>
  );
}
