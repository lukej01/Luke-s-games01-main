"use client";

import React, { useRef, useEffect } from "react";

// Module-level shared mouse — one listener for all instances
const _mouse = { x: -9999, y: -9999 };
let _attached = false;
function _attach() {
  if (_attached || typeof window === "undefined") return;
  _attached = true;
  window.addEventListener("mousemove", (e) => { _mouse.x = e.clientX; _mouse.y = e.clientY; }, { passive: true });
  document.addEventListener("mouseleave", () => { _mouse.x = -9999; _mouse.y = -9999; });
}

interface MagneticTextProps {
  children: React.ReactNode;
  strength?: number;
  radius?: number;
  className?: string;
  style?: React.CSSProperties;
  tag?: keyof React.JSX.IntrinsicElements;
}

export function MagneticText({ children, strength = 7, radius = 220, className, style, tag = "span" }: MagneticTextProps) {
  const ref = useRef<HTMLElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  useEffect(() => {
    _attach();
    const el = ref.current;
    if (!el) return;

    const tick = () => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = _mouse.x - cx;
      const dy = _mouse.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let tx = 0, ty = 0;
      if (dist < radius && dist > 0) {
        const t = (radius - dist) / radius;
        const force = t * t * strength;
        // Anti-gravity: push away from cursor
        tx = -(dx / dist) * force;
        ty = -(dy / dist) * force;
      }

      pos.current.x += (tx - pos.current.x) * 0.07;
      pos.current.y += (ty - pos.current.y) * 0.07;

      if (Math.abs(pos.current.x) > 0.05 || Math.abs(pos.current.y) > 0.05 || tx !== 0 || ty !== 0) {
        el.style.transform = `translate(${pos.current.x.toFixed(2)}px, ${pos.current.y.toFixed(2)}px)`;
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [strength, radius]);

  const Tag = tag as React.ElementType;
  return (
    <Tag
      ref={ref as React.RefObject<HTMLElement>}
      className={className}
      style={{ display: "inline-block", willChange: "transform", ...style }}
    >
      {children}
    </Tag>
  );
}
