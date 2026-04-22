"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  baseAlpha: number;
  hue: number;
  phase: number;
  trail: Array<{ x: number; y: number }>;
}

const CONNECT_DIST = 140;
const REPEL_DIST   = 240;
const ATTRACT_DIST = 420;
const TRAIL_LEN    = 8;

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse     = useRef({ x: -9999, y: -9999, vx: 0, vy: 0, px: -9999, py: -9999 });
  const particles = useRef<Particle[]>([]);
  const raf       = useRef<number>(0);
  const time      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.scale(dpr, dpr);
      init();
    };

    const init = () => {
      const count = Math.min(Math.floor((W * H) / 6500), 130);
      particles.current = Array.from({ length: count }, () => ({
        x:         Math.random() * W,
        y:         Math.random() * H,
        vx:        (Math.random() - 0.5) * 0.45,
        vy:        (Math.random() - 0.5) * 0.45,
        size:      Math.random() * 2.4 + 0.6,
        baseAlpha: Math.random() * 0.5 + 0.2,
        hue:       Math.random() > 0.72 ? 280 : 195,
        phase:     Math.random() * Math.PI * 2,
        trail:     [],
      }));
    };

    const onMouseMove = (e: MouseEvent) => {
      const nx = e.clientX;
      const ny = e.clientY;
      mouse.current.vx = nx - mouse.current.px;
      mouse.current.vy = ny - mouse.current.py;
      mouse.current.px = mouse.current.x;
      mouse.current.py = mouse.current.y;
      mouse.current.x  = nx;
      mouse.current.y  = ny;
    };
    const onMouseLeave = () => {
      mouse.current = { x: -9999, y: -9999, vx: 0, vy: 0, px: -9999, py: -9999 };
    };

    const draw = () => {
      time.current += 0.007;
      ctx.clearRect(0, 0, W, H);

      const mx     = mouse.current.x;
      const my     = mouse.current.y;
      const mvx    = mouse.current.vx;
      const mvy    = mouse.current.vy;
      const mSpeed = Math.sqrt(mvx * mvx + mvy * mvy);
      const hasMouse = mx > -100;

      // Cursor spotlight — follows cursor site-wide
      if (hasMouse) {
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 360);
        grd.addColorStop(0,   "rgba(0,255,220,0.13)");
        grd.addColorStop(0.3, "rgba(0,180,255,0.05)");
        grd.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);

        const inner = ctx.createRadialGradient(mx, my, 0, mx, my, 70);
        inner.addColorStop(0, "rgba(0,255,220,0.07)");
        inner.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = inner;
        ctx.fillRect(0, 0, W, H);
      }

      // Ambient breathing glow (subtle — canvas is overlaid on content)
      const pulse = 0.012 + 0.005 * Math.sin(time.current * 0.6);
      const ag = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, W * 0.55);
      ag.addColorStop(0,    `rgba(0,255,220,${pulse})`);
      ag.addColorStop(0.55, `rgba(120,0,255,${pulse * 0.35})`);
      ag.addColorStop(1,    "rgba(0,0,0,0)");
      ctx.fillStyle = ag;
      ctx.fillRect(0, 0, W, H);

      const parts = particles.current;

      // Physics
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > TRAIL_LEN) p.trail.shift();

        if (hasMouse) {
          const dx   = p.x - mx;
          const dy   = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < REPEL_DIST && dist > 0.01) {
            const t     = (REPEL_DIST - dist) / REPEL_DIST;
            const force = Math.pow(t, 1.8) * 0.08 + mSpeed * 0.003;
            p.vx += (dx / dist) * force * REPEL_DIST * 0.9;
            p.vy += (dy / dist) * force * REPEL_DIST * 0.9;
            p.vx += (-dy / dist) * force * 8;
            p.vy += ( dx / dist) * force * 8;
          } else if (dist < ATTRACT_DIST) {
            const force = ((ATTRACT_DIST - dist) / ATTRACT_DIST) * 0.0012;
            p.vx += (-dx / dist) * force * 22 + ( dy / dist) * force * 9;
            p.vy += (-dy / dist) * force * 22 + (-dx / dist) * force * 9;
          }
        }

        const spd    = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const maxSpd = hasMouse ? 6 : 2.6;
        if (spd > maxSpd) { p.vx = (p.vx / spd) * maxSpd; p.vy = (p.vy / spd) * maxSpd; }

        p.vx *= 0.965; p.vy *= 0.965;
        p.x  += p.vx;  p.y  += p.vy;

        if (p.x < -15) p.x = W + 15; else if (p.x > W + 15) p.x = -15;
        if (p.y < -15) p.y = H + 15; else if (p.y > H + 15) p.y = -15;
      }

      // Particle trails near cursor
      if (hasMouse) {
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          if (p.trail.length < 2) continue;
          const dxM  = p.x - mx;
          const dyM  = p.y - my;
          const dist = Math.sqrt(dxM * dxM + dyM * dyM);
          if (dist > REPEL_DIST * 1.3) continue;
          const ta = Math.min(0.55, (REPEL_DIST * 1.2 - dist) / REPEL_DIST * 0.65);
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) ctx.lineTo(p.trail[t].x, p.trail[t].y);
          ctx.strokeStyle = p.hue === 195
            ? `rgba(0,245,255,${ta})`
            : `rgba(170,0,255,${ta * 0.8})`;
          ctx.lineWidth = p.size * 0.55;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      }

      // Connection lines
      ctx.lineWidth = 0.5;
      for (let i = 0; i < parts.length; i++) {
        const a = parts[i];
        for (let j = i + 1; j < parts.length; j++) {
          const b  = parts[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < CONNECT_DIST * CONNECT_DIST) {
            const dist  = Math.sqrt(d2);
            const alpha = (1 - dist / CONNECT_DIST) * 0.3;
            ctx.strokeStyle = a.hue !== b.hue
              ? `rgba(100,100,255,${alpha * 0.65})`
              : a.hue === 195
              ? `rgba(0,240,255,${alpha})`
              : `rgba(170,0,255,${alpha * 0.55})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Cursor rings + crosshair (site-wide)
      if (hasMouse) {
        const r1 = 60 + 10 * Math.sin(time.current * 2.8);
        ctx.beginPath();
        ctx.arc(mx, my, r1, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,255,220,${0.08 + 0.05 * Math.sin(time.current * 2.8)})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();

        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(time.current * 1.2);
        ctx.beginPath();
        ctx.arc(0, 0, 36, 0, Math.PI * 1.5);
        ctx.strokeStyle = "rgba(0,255,220,0.18)";
        ctx.lineWidth   = 0.8;
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(-time.current * 2.1);
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI);
        ctx.strokeStyle = "rgba(0,255,220,0.25)";
        ctx.lineWidth   = 0.7;
        ctx.stroke();
        ctx.restore();

        const cL = 18, gap = 6;
        ctx.strokeStyle = "rgba(0,255,220,0.32)";
        ctx.lineWidth   = 0.6;
        ctx.beginPath();
        ctx.moveTo(mx - cL - gap, my); ctx.lineTo(mx - gap, my);
        ctx.moveTo(mx + gap, my);      ctx.lineTo(mx + cL + gap, my);
        ctx.moveTo(mx, my - cL - gap); ctx.lineTo(mx, my - gap);
        ctx.moveTo(mx, my + gap);      ctx.lineTo(mx, my + cL + gap);
        ctx.stroke();

        if (mSpeed > 1.5) {
          const streak = Math.min(mSpeed * 5, 80);
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(mx - mvx * streak / mSpeed, my - mvy * streak / mSpeed);
          ctx.strokeStyle = `rgba(0,255,220,${Math.min(mSpeed * 0.04, 0.3)})`;
          ctx.lineWidth   = mSpeed * 0.15;
          ctx.lineCap     = "round";
          ctx.stroke();
        }
      }

      // Draw particles
      for (let i = 0; i < parts.length; i++) {
        const p       = parts[i];
        const dxM     = mx - p.x;
        const dyM     = my - p.y;
        const dCursor = Math.sqrt(dxM * dxM + dyM * dyM);
        const nearBoost  = hasMouse && dCursor < 220 ? (1 - dCursor / 220) * 0.65 : 0;
        const spd        = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const speedBoost = Math.min(spd * 0.1, 0.4);
        const alpha      = Math.min(
          p.baseAlpha + nearBoost + speedBoost + 0.08 * Math.sin(time.current + p.phase),
          0.98
        );

        const isCyan = p.hue === 195;
        ctx.fillStyle = isCyan ? `rgba(0,245,255,${alpha})` : `rgba(170,0,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.size > 1.1 || nearBoost > 0.1) {
          const glowR = p.size * (3.5 + nearBoost * 4);
          const glow  = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          glow.addColorStop(0, isCyan
            ? `rgba(0,245,255,${alpha * (0.3 + nearBoost * 0.5)})`
            : `rgba(170,0,255,${alpha * (0.3 + nearBoost * 0.5)})`);
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf.current = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    resize();
    raf.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 50 }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
