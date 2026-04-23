"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const stop  = () => lenis.stop();
    const start = () => lenis.start();
    document.addEventListener("lenis:stop",  stop);
    document.addEventListener("lenis:start", start);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      document.removeEventListener("lenis:stop",  stop);
      document.removeEventListener("lenis:start", start);
      lenis.destroy();
    };
  }, []);

  return null;
}
