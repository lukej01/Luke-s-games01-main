"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

const GLITCH = "!<>-_\\/[]{}=+*^?#~@|01░▒▓ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function TextScramble({
  text,
  className = "",
  style,
  autoRun = false,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  autoRun?: boolean;
}) {
  const [display, setDisplay] = useState(text);
  const rafRef  = useRef(0);
  const t0      = useRef(0);
  const live    = useRef(false);

  const tick = useCallback(
    (ts: number) => {
      const p = Math.min(1, (ts - t0.current) / (text.replace(/ /g, "").length * 75));
      const reveal = Math.floor(p * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") { out += " "; continue; }
        out += i < reveal ? text[i] : GLITCH[Math.floor(Math.random() * GLITCH.length)];
      }
      setDisplay(out);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
        live.current = false;
      }
    },
    [text]
  );

  const run = useCallback(() => {
    if (live.current) return;
    live.current = true;
    t0.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  useEffect(() => {
    if (!autoRun) return;
    const t = setTimeout(run, 150);
    return () => clearTimeout(t);
  }, [autoRun, run]);

  return (
    <span
      className={className}
      style={{ ...style, fontVariantNumeric: "tabular-nums" }}
      onMouseEnter={run}
      onMouseMove={run}
    >
      {display}
    </span>
  );
}
