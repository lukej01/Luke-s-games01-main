"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  hue: number;
  phase: number;
}

const CONNECT_DIST = 140;
const REPEL_DIST = 180;

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const particles = useRef<Particle[]>([]);
  const raf = useRef<number>(0);
  const time = useRef(0);

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
      const count = Math.min(Math.floor((W * H) / 8500), 95);
      particles.current = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 1.8 + 0.4,
        baseAlpha: Math.random() * 0.45 + 0.18,
        hue: Math.random() > 0.72 ? 280 : 195,
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
      time.current += 0.007;
      ctx.clearRect(0, 0, W, H);

      const mx = mouse.current.x;
      const my = mouse.current.y;

      // Cursor glow spotlight
      if (mx > -100) {
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 240);
        grd.addColorStop(0, "rgba(0,255,220,0.08)");
        grd.addColorStop(0.4, "rgba(0,180,255,0.03)");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      }

      // Ambient slow breathing glow
      const pulse = 0.028 + 0.01 * Math.sin(time.current * 0.65);
      const ag = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, W * 0.58);
      ag.addColorStop(0, `rgba(0,255,220,${pulse})`);
      ag.addColorStop(0.6, `rgba(120,0,255,${pulse * 0.4})`);
      ag.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ag;
      ctx.fillRect(0, 0, W, H);

      const parts = particles.current;

      // Update physics
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];

        // Mouse repulsion — particles flee from cursor
        if (mx > -100) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < REPEL_DIST * REPEL_DIST && dist2 > 0.01) {
            const dist = Math.sqrt(dist2);
            const force = ((REPEL_DIST - dist) / REPEL_DIST) * 0.018;
            p.vx += (dx / dist) * force * REPEL_DIST;
            p.vy += (dy / dist) * force * REPEL_DIST;
          }
        }

        // Speed cap
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 2.2) {
          p.vx = (p.vx / spd) * 2.2;
          p.vy = (p.vy / spd) * 2.2;
        }

        p.vx *= 0.975;
        p.vy *= 0.975;
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < -12) p.x = W + 12;
        else if (p.x > W + 12) p.x = -12;
        if (p.y < -12) p.y = H + 12;
        else if (p.y > H + 12) p.y = -12;
      }

      // Draw connection lines
      ctx.lineWidth = 0.5;
      for (let i = 0; i < parts.length; i++) {
        const a = parts[i];
        for (let j = i + 1; j < parts.length; j++) {
          const b = parts[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < CONNECT_DIST * CONNECT_DIST) {
            const dist = Math.sqrt(dist2);
            const alpha = (1 - dist / CONNECT_DIST) * 0.28;
            // Mix cyan/purple based on particle hues
            const isMixed = a.hue !== b.hue;
            ctx.strokeStyle = isMixed
              ? `rgba(100,100,255,${alpha * 0.7})`
              : a.hue === 195
              ? `rgba(0,240,255,${alpha})`
              : `rgba(160,0,255,${alpha * 0.6})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];

        const dx = mx - p.x;
        const dy = my - p.y;
        const distToCursor = Math.sqrt(dx * dx + dy * dy);
        const nearCursor = mx > -100 && distToCursor < 160 ? (1 - distToCursor / 160) * 0.45 : 0;
        const alpha = Math.min(
          p.baseAlpha + nearCursor + 0.07 * Math.sin(time.current + p.phase),
          0.95
        );

        const isCyan = p.hue === 195;
        ctx.fillStyle = isCyan
          ? `rgba(0,245,255,${alpha})`
          : `rgba(160,0,255,${alpha})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Soft glow for larger dots
        if (p.size > 1.3) {
          const r = p.size * 3;
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
          glow.addColorStop(
            0,
            isCyan
              ? `rgba(0,245,255,${alpha * 0.25})`
              : `rgba(160,0,255,${alpha * 0.25})`
          );
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
        }
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
