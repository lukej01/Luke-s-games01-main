"use client";

import React, { useLayoutEffect, useRef } from "react";
import { CartridgeCarousel, type CarouselGame } from "@/components/ui/cartridge-carousel";

const BASE = "/Luke-s-games01-main";

const GAMES: CarouselGame[] = [
  {
    id: "super-mario-64",
    title: "Super Mario 64",
    platform: "N64",
    year: "1996",
    hue: 280,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e9/Super_Mario_64.png/250px-Super_Mario_64.png",
  },
  {
    id: "zelda-oot",
    title: "Zelda: Ocarina of Time",
    platform: "N64",
    year: "1998",
    hue: 195,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/5/57/The_Legend_of_Zelda_Ocarina_of_Time.jpg",
  },
  {
    id: "paper-mario",
    title: "Paper Mario",
    platform: "N64",
    year: "2001",
    hue: 150,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/6/61/Papermario.jpg/250px-Papermario.jpg",
  },
  {
    id: "super-mario-world",
    title: "Super Mario World",
    platform: "SNES",
    year: "1990",
    hue: 40,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/3/32/Super_Mario_World_Coverart.png",
  },
  {
    id: "super-mario-3",
    title: "Super Mario Bros 3",
    platform: "NES",
    year: "1988",
    hue: 25,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/a/a5/Super_Mario_Bros._3_coverart.png",
  },
  {
    id: "punch-out",
    title: "Punch-Out!!",
    platform: "NES",
    year: "1987",
    hue: 15,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c8/Mike_Tyson%27s_Punch-Out%21%21_NES_Box.jpg/250px-Mike_Tyson%27s_Punch-Out%21%21_NES_Box.jpg",
  },
  {
    id: "sonic-2",
    title: "Sonic the Hedgehog 2",
    platform: "GEN",
    year: "1992",
    hue: 220,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Sonic_2_US_Cover.jpg/250px-Sonic_2_US_Cover.jpg",
  },
  {
    id: "gran-turismo-2",
    title: "Gran Turismo 2",
    platform: "PS1",
    year: "1999",
    hue: 320,
    coverImage: "https://m.media-amazon.com/images/I/51egYoaJo-L._SX342_SY445_QL70_FMwebp_.jpg",
  },
  {
    id: "nba-live-2003",
    title: "NBA Live 2003",
    platform: "PS1",
    year: "2002",
    hue: 55,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/b/bc/NBA_Live_2003_cover.jpg/250px-NBA_Live_2003_cover.jpg",
  },
  {
    id: "madden-2002",
    title: "Madden 2002",
    platform: "PS1",
    year: "2001",
    hue: 60,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a0/Madden_NFL_2002_Coverart.png/250px-Madden_NFL_2002_Coverart.png",
  },
  {
    id: "lego-batman-1",
    title: "LEGO Batman",
    platform: "DS",
    year: "2008",
    hue: 240,
    coverImage: "https://m.media-amazon.com/images/I/517zan+v3eL._SY445_SX342_QL70_FMwebp_.jpg",
  },
  {
    id: "lego-batman-2",
    title: "LEGO Batman 2",
    platform: "DS",
    year: "2012",
    hue: 245,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Legobatman2.jpg/250px-Legobatman2.jpg",
  },
  {
    id: "lego-star-wars",
    title: "LEGO Star Wars",
    platform: "DS",
    year: "2005",
    hue: 50,
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Lego_Star_Wars-The_Complete_Saga.jpg/250px-Lego_Star_Wars-The_Complete_Saga.jpg",
  },
];

// Games open as their own page: content filters on managed devices black out
// embedded frames but allow the same page loaded directly.
function play(game: CarouselGame) {
  window.location.assign(`${BASE}/games/${game.id}.html`);
}

// The roller's console is 480px wide; below this width it has to shrink.
const MIN_STAGE_W = 520;

// One screen, no scrolling: shrink the roller to fit short or narrow windows.
// The stage is widened by the same factor it is shrunk by, so the card track
// still spans the whole window.
function FitStage({ children }: { children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const b = box.current;
    const s = stage.current;
    if (!b || !s) return;
    const fit = () => {
      const k = Math.min(1, b.clientHeight / s.offsetHeight, b.clientWidth / MIN_STAGE_W);
      s.style.width = `${b.clientWidth / k}px`;
      s.style.transform = k < 1 ? `scale(${k})` : "";
    };
    const ro = new ResizeObserver(fit);
    ro.observe(b);
    fit();
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className="relative flex-1 min-h-0 flex items-center overflow-hidden">
      <div ref={stage} className="w-full shrink-0 origin-left">
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="h-dvh flex flex-col overflow-hidden text-foreground">
      <header className="shrink-0 flex items-center justify-between px-[clamp(1rem,4vw,3rem)] py-[clamp(0.75rem,2vh,1.25rem)]">
        <h1 className="font-pixel neon-text text-[clamp(0.7rem,1.1vw,0.85rem)] tracking-widest">GAMESTASH</h1>
        <a
          href={`${BASE}/admin.html`}
          className="font-mono-cyber text-[11px] tracking-[0.25em] uppercase text-text-dim hover:text-neon focus-visible:text-neon transition-colors duration-200"
        >
          Admin
        </a>
      </header>

      <section aria-label="Game library" className="flex-1 min-h-0 flex flex-col">
        <FitStage>
          <CartridgeCarousel games={GAMES} onPlay={play} />
        </FitStage>
      </section>
    </main>
  );
}
