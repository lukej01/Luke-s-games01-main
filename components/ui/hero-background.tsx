"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  hue: number;
  phase: number;
}

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const particles = useRef<Particle[]>([]);
  const raf = useRef<number>(0);
  const t = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.scale(dpr, dpr);
      init();
    };

    const init = () => {
      const count = Math.floor((W * H) / 7000);
      particles.current = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.5 + 0.15,
        hue: Math.random() > 0.75 ? 280 : 195,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMouseLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };

    const draw = () => {
      t.current += 0.008;
      ctx.clearRect(0, 0, W, H);

      const mx = mouse.current.x;
      const my = mouse.current.y;

      // Cursor spotlight glow
      if (mx > -999) {
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 280);
        grd.addColorStop(0, "rgba(0,255,230,0.055)");
        grd.addColorStop(0.5, "rgba(0,180,255,0.02)");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      }

      // Ambient slow pulse glow (center)
      const cx = W * 0.5;
      const cy = H * 0.4;
      const pulse = 0.025 + 0.01 * Math.sin(t.current * 0.8);
      const ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.6);
      ag.addColorStop(0, `rgba(0,255,220,${pulse})`);
      ag.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ag;
      ctx.fillRect(0, 0, W, H);

      // Particles
      const parts = particles.current;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];

        // Gentle pull toward cursor
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (mx > -999 && dist < 220 && dist > 1) {
          p.vx += (dx / dist) * 0.012;
          p.vy += (dy / dist) * 0.012;
        }

        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        // Brightness near cursor
        const nearCursor = mx > -999 && dist < 150 ? (1 - dist / 150) * 0.35 : 0;
        const pulsedAlpha = p.alpha + nearCursor + 0.08 * Math.sin(t.current + p.phase);

        if (p.hue === 195) {
          ctx.fillStyle = `rgba(0,240,255,${Math.min(pulsedAlpha, 0.9)})`;
        } else {
          ctx.fillStyle = `rgba(180,0,255,${Math.min(pulsedAlpha, 0.9)})`;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf.current = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    resize();
    raf.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
