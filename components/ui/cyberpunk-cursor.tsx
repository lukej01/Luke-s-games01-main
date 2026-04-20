"use client";

import React, { useEffect, useRef } from "react";

export function CyberpunkCursor() {
  const dotRef      = useRef<HTMLDivElement>(null);
  const ringElRef   = useRef<HTMLDivElement>(null);
  const mousePos    = useRef({ x: -200, y: -200 });
  const followerPos = useRef({ x: -200, y: -200 });
  const rafId       = useRef<number>(0);
  const isHovering  = useRef(false);

  useEffect(() => {
    const dot    = dotRef.current;
    const ringEl = ringElRef.current;
    if (!dot || !ringEl) return;

    const onMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      dot.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 5}px)`;
    };

    const onEnter = () => { isHovering.current = true; };
    const onLeave = () => { isHovering.current = false; };

    const attachHover = () => {
      document.querySelectorAll("a,button,[role='button'],.cursor-pointer,[data-hover]").forEach(el => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };

    const animate = () => {
      const { x, y } = mousePos.current;
      const fx = followerPos.current.x + (x - followerPos.current.x) * 0.1;
      const fy = followerPos.current.y + (y - followerPos.current.y) * 0.1;
      followerPos.current = { x: fx, y: fy };

      const size    = isHovering.current ? 48 : 32;
      const opacity = isHovering.current ? 0.8 : 0.45;

      ringEl.style.transform = `translate(${fx - size / 2}px, ${fy - size / 2}px)`;
      ringEl.style.width     = `${size}px`;
      ringEl.style.height    = `${size}px`;
      ringEl.style.opacity   = String(opacity);

      rafId.current = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMove);
    attachHover();
    rafId.current = requestAnimationFrame(animate);

    const observer = new MutationObserver(attachHover);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId.current);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "var(--neon)",
          pointerEvents: "none",
          zIndex: 99999,
          boxShadow: "0 0 8px var(--neon), 0 0 16px var(--neon-dim)",
          willChange: "transform",
        }}
      />
      <div
        ref={ringElRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "1.5px solid var(--neon)",
          pointerEvents: "none",
          zIndex: 99998,
          willChange: "transform, width, height, opacity",
          transition: "width 0.15s, height 0.15s, opacity 0.15s",
          boxShadow: "0 0 6px var(--neon-dim)",
        }}
      />
    </>
  );
}
