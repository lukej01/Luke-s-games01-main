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
  trail: Array<{ x: number; y: number }>;
}

const CONNECT_DIST = 150;
const REPEL_DIST = 260;
const ATTRACT_DIST = 420;
const TRAIL_LEN = 5;

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
      const count = Math.min(Math.floor((W * H) / 7500), 110);
      particles.current = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.2 + 0.5,
        baseAlpha: Math.random() * 0.5 + 0.2,
        hue: Math.random() > 0.7 ? 280 : 195,
        phase: Math.random() * Math.PI * 2,
        trail: [],
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
      const hasMouse = mx > -100;

      // Cursor spotlight
      if (hasMouse) {
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 300);
        grd.addColorStop(0, "rgba(0,255,220,0.12)");
        grd.addColorStop(0.35, "rgba(0,180,255,0.05)");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);

        const inner = ctx.createRadialGradient(mx, my, 0, mx, my, 80);
        inner.addColorStop(0, "rgba(0,255,220,0.07)");
        inner.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = inner;
        ctx.fillRect(0, 0, W, H);
      }

      // Ambient breathing glow
      const pulse = 0.03 + 0.012 * Math.sin(time.current * 0.65);
      const ag = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, W * 0.6);
      ag.addColorStop(0, `rgba(0,255,220,${pulse})`);
      ag.addColorStop(0.6, `rgba(120,0,255,${pulse * 0.4})`);
      ag.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ag;
      ctx.fillRect(0, 0, W, H);

      const parts = particles.current;

      // Physics update
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];

        // Record trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > TRAIL_LEN) p.trail.shift();

        if (hasMouse) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < REPEL_DIST && dist > 0.01) {
            // Strong repulsion — particles scatter from cursor
            const force = Math.pow((REPEL_DIST - dist) / REPEL_DIST, 1.5) * 0.048;
            p.vx += (dx / dist) * force * REPEL_DIST;
            p.vy += (dy / dist) * force * REPEL_DIST;
          } else if (dist < ATTRACT_DIST) {
            // Swirling attraction in outer zone
            const force = ((ATTRACT_DIST - dist) / ATTRACT_DIST) * 0.001;
            p.vx += (-dx / dist) * force * 18 + (dy / dist) * force * 7;
            p.vy += (-dy / dist) * force * 18 + (-dx / dist) * force * 7;
          }
        }

        // Speed cap
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const maxSpd = hasMouse ? 4.8 : 2.5;
        if (spd > maxSpd) {
          p.vx = (p.vx / spd) * maxSpd;
          p.vy = (p.vy / spd) * maxSpd;
        }

        p.vx *= 0.968;
        p.vy *= 0.968;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -15) p.x = W + 15;
        else if (p.x > W + 15) p.x = -15;
        if (p.y < -15) p.y = H + 15;
        else if (p.y > H + 15) p.y = -15;
      }

      // Draw particle trails (near cursor only)
      if (hasMouse) {
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          if (p.trail.length < 2) continue;
          const dxM = p.x - mx;
          const dyM = p.y - my;
          const distM = Math.sqrt(dxM * dxM + dyM * dyM);
          if (distM > REPEL_DIST * 1.1) continue;
          const trailAlpha = Math.min(0.4, (REPEL_DIST - distM) / REPEL_DIST * 0.55);
          const isCyan = p.hue === 195;
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) ctx.lineTo(p.trail[t].x, p.trail[t].y);
          ctx.strokeStyle = isCyan
            ? `rgba(0,245,255,${trailAlpha})`
            : `rgba(160,0,255,${trailAlpha * 0.75})`;
          ctx.lineWidth = p.size * 0.5;
          ctx.lineCap = "round";
          ctx.stroke();
        }
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
            const alpha = (1 - dist / CONNECT_DIST) * 0.32;
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

      // Draw cursor indicator rings
      if (hasMouse) {
        const ringR = 52 + 7 * Math.sin(time.current * 3.2);
        ctx.beginPath();
        ctx.arc(mx, my, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,255,220,${0.1 + 0.06 * Math.sin(time.current * 3.2)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(mx, my, 16, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,255,220,0.2)";
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Crosshair
        const cL = 14;
        ctx.strokeStyle = "rgba(0,255,220,0.3)";
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(mx - cL - 5, my); ctx.lineTo(mx - 5, my);
        ctx.moveTo(mx + 5, my); ctx.lineTo(mx + cL + 5, my);
        ctx.moveTo(mx, my - cL - 5); ctx.lineTo(mx, my - 5);
        ctx.moveTo(mx, my + 5); ctx.lineTo(mx, my + cL + 5);
        ctx.stroke();
      }

      // Draw particles
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];

        const dxM = mx - p.x;
        const dyM = my - p.y;
        const distToCursor = Math.sqrt(dxM * dxM + dyM * dyM);
        const nearBoost = hasMouse && distToCursor < 200 ? (1 - distToCursor / 200) * 0.55 : 0;
        const alpha = Math.min(
          p.baseAlpha + nearBoost + 0.08 * Math.sin(time.current + p.phase),
          0.95
        );

        const isCyan = p.hue === 195;
        ctx.fillStyle = isCyan ? `rgba(0,245,255,${alpha})` : `rgba(160,0,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.size > 1.2) {
          const r = p.size * 3.5;
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
          glow.addColorStop(0, isCyan ? `rgba(0,245,255,${alpha * 0.3})` : `rgba(160,0,255,${alpha * 0.3})`);
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
