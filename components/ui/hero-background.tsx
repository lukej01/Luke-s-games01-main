"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Particle {
  x: number; y: number;
  ox: number; oy: number; // home position for spring-back
  vx: number; vy: number;
  size: number;
  baseAlpha: number;
  hue: number;
  phase: number;
}

const CONNECT_DIST = 120;
const REPEL_DIST   = 160;
const ATTRACT_DIST = 280;
const SPRING       = 0.0035; // spring strength toward home (controls bounce-back speed)
const DAMP         = 0.970;  // damping — higher = less oscillation

export function HeroBackground() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, {
      position: "fixed",
      top: "0",
      left: "0",
      pointerEvents: "none",
      zIndex: "50",
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0;
    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, px: -9999, py: -9999 };
    let particles: Particle[] = [];
    let raf = 0;
    let time = 0;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + "px";
      canvas.style.height = H + "px";
      ctx.scale(dpr, dpr);
      const count = Math.min(Math.floor((W * H) / 7000), 110);
      particles = Array.from({ length: count }, () => {
        const x = Math.random() * W;
        const y = Math.random() * H;
        return {
          x, y, ox: x, oy: y,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          size: Math.random() * 2.2 + 0.5,
          baseAlpha: Math.random() * 0.5 + 0.2,
          hue: Math.random() > 0.72 ? 0 : 195,
          phase: Math.random() * Math.PI * 2,
        };
      });
    };

    const onMouseMove = (e: MouseEvent) => {
      const nx = e.clientX, ny = e.clientY;
      mouse.vx = nx - mouse.px; mouse.vy = ny - mouse.py;
      mouse.px = mouse.x; mouse.py = mouse.y;
      mouse.x = nx; mouse.y = ny;
    };
    const onMouseLeave = () => {
      mouse.x = -9999; mouse.y = -9999; mouse.vx = 0; mouse.vy = 0;
    };

    const draw = () => {
      time += 0.007;
      ctx.clearRect(0, 0, W, H);

      const { x: mx, y: my } = mouse;
      const mSpeed  = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
      const hasMouse = mx > -100;

      // Subtle cursor glow (no crosshair)
      if (hasMouse) {
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 260);
        grd.addColorStop(0,   "rgba(0,255,220,0.08)");
        grd.addColorStop(0.4, "rgba(0,180,255,0.03)");
        grd.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
      }

      // Ambient pulse
      const pulse = 0.010 + 0.004 * Math.sin(time * 0.6);
      const ag = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, W * 0.52);
      ag.addColorStop(0,    `rgba(0,255,220,${pulse})`);
      ag.addColorStop(0.55, `rgba(200,200,220,${pulse * 0.22})`);
      ag.addColorStop(1,    "rgba(0,0,0,0)");
      ctx.fillStyle = ag; ctx.fillRect(0, 0, W, H);

      // Physics
      for (const p of particles) {
        // Spring force toward home — moderate speed, gentle bounce
        p.vx += (p.ox - p.x) * SPRING;
        p.vy += (p.oy - p.y) * SPRING;

        if (hasMouse) {
          const dx = p.x - mx, dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REPEL_DIST && dist > 0.01) {
            const t = (REPEL_DIST - dist) / REPEL_DIST;
            // Reduced force — less dramatic push
            const f = Math.pow(t, 2.5) * 0.022 + mSpeed * 0.0006;
            p.vx += (dx / dist) * f * REPEL_DIST * 0.65;
            p.vy += (dy / dist) * f * REPEL_DIST * 0.65;
          } else if (dist < ATTRACT_DIST) {
            const f = ((ATTRACT_DIST - dist) / ATTRACT_DIST) * 0.0007;
            p.vx += (-dx / dist) * f * 16;
            p.vy += (-dy / dist) * f * 16;
          }
        }

        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const cap = hasMouse ? 3.2 : 1.6;
        if (spd > cap) { p.vx = p.vx / spd * cap; p.vy = p.vy / spd * cap; }
        p.vx *= DAMP; p.vy *= DAMP;
        p.x += p.vx; p.y += p.vy;

        // Soft boundary — nudge back in bounds
        const margin = 8;
        if (p.x < margin) p.vx += 0.05;
        else if (p.x > W - margin) p.vx -= 0.05;
        if (p.y < margin) p.vy += 0.05;
        else if (p.y > H - margin) p.vy -= 0.05;
        p.x = Math.max(-4, Math.min(W + 4, p.x));
        p.y = Math.max(-4, Math.min(H + 4, p.y));
      }

      // Connection lines
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const d2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
          if (d2 < CONNECT_DIST * CONNECT_DIST) {
            const dist  = Math.sqrt(d2);
            const alpha = (1 - dist / CONNECT_DIST) * 0.22;
            ctx.strokeStyle = a.hue !== b.hue
              ? `rgba(100,100,255,${alpha * 0.6})`
              : a.hue === 195
              ? `rgba(0,240,255,${alpha})`
              : `rgba(240,240,255,${alpha * 0.42})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        const dCursor   = Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2);
        const nearBoost = hasMouse && dCursor < 180 ? (1 - dCursor / 180) * 0.45 : 0;
        const spd       = Math.sqrt(p.vx ** 2 + p.vy ** 2);
        const alpha     = Math.min(p.baseAlpha + nearBoost + Math.min(spd * 0.08, 0.28) + 0.07 * Math.sin(time + p.phase), 0.95);
        const isCyan    = p.hue === 195;

        ctx.fillStyle = isCyan ? `rgba(0,245,255,${alpha})` : `rgba(255,255,255,${alpha})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();

        if (p.size > 1.0 || nearBoost > 0.08) {
          const gr = p.size * (2.8 + nearBoost * 3);
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr);
          glow.addColorStop(0, isCyan
            ? `rgba(0,245,255,${alpha * (0.22 + nearBoost * 0.38)})`
            : `rgba(255,255,255,${alpha * (0.18 + nearBoost * 0.32)})`);
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(p.x, p.y, gr, 0, Math.PI * 2); ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    resize();
    raf = requestAnimationFrame(draw);

    const st = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "+=1200",
      scrub: true,
      animation: gsap.to(canvas, { y: 500, opacity: 0, ease: "none" }),
    });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(raf);
      st.kill();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  return null;
}
