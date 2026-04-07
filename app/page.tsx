"use client";

import React from "react";
import Image from "next/image";
import ParticleHero from "@/components/ui/particle-effect-for-hero";
import { TextScramble } from "@/components/ui/text-scramble";
import { DotLoader } from "@/components/ui/dot-loader";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

// DotLoader animation frames
const loaderFrames = [
  [14, 7, 0, 8, 6, 13, 20],
  [14, 7, 13, 20, 16, 27, 21],
  [14, 20, 27, 21, 34, 24, 28],
  [27, 21, 34, 28, 41, 32, 35],
  [34, 28, 41, 35, 48, 40, 42],
  [34, 28, 41, 35, 48, 42, 46],
  [34, 28, 41, 35, 48, 42, 38],
  [34, 28, 41, 35, 48, 30, 21],
  [34, 28, 41, 48, 21, 22, 14],
  [34, 28, 41, 21, 14, 16, 27],
  [34, 28, 21, 14, 10, 20, 27],
  [28, 21, 14, 4, 13, 20, 27],
  [28, 21, 14, 12, 6, 13, 20],
  [28, 21, 14, 6, 13, 20, 11],
  [28, 21, 14, 6, 13, 20, 10],
  [14, 6, 13, 20, 9, 7, 21],
];

const navLinks = ["GAMES", "LEADERBOARD", "ABOUT", "CONTACT"];

export default function Home() {
  return (
    <main className="bg-black text-white min-h-screen overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative w-full h-screen">
        <ParticleHero />

        {/* Nav override — sits on top of the particle canvas nav */}
        <nav className="absolute top-0 left-0 w-full z-30 flex justify-between items-center px-8 py-6 pointer-events-none">
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-white/40">
            GameStash
          </span>
          <div className="flex gap-8 pointer-events-auto">
            {navLinks.map((link) => (
              <TextScramble key={link} text={link} className="text-white/70 hover:text-white" />
            ))}
          </div>
        </nav>

        {/* Now-playing pill */}
        <div className="absolute bottom-10 left-8 z-30 flex items-center gap-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-2.5">
          <DotLoader
            frames={loaderFrames}
            dotClassName="bg-white/20 [&.active]:bg-white size-1"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
            Now Playing
          </span>
        </div>
      </section>

      {/* ── FEATURED SECTION ── */}
      <section className="bg-black py-32 px-8">
        <div className="max-w-6xl mx-auto">

          {/* Section label */}
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/30 mb-6">
            Featured Collection
          </p>

          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-16 leading-none">
            Classic <span className="text-white/20">titles,</span><br />
            rediscovered.
          </h2>

          {/* Game cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px border border-white/5">
            {[
              { title: "SUPER MARIO 64", genre: "Platform", year: "1996" },
              { title: "ZELDA: OOT", genre: "Adventure", year: "1998" },
              { title: "PUNCH-OUT!!", genre: "Fighting", year: "1987" },
            ].map((game) => (
              <div
                key={game.title}
                className="group relative bg-white/[0.02] hover:bg-white/[0.06] transition-colors duration-500 p-8 cursor-pointer border border-white/5"
              >
                {/* Animated loader on hover */}
                <div className="mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <DotLoader
                    frames={loaderFrames}
                    dotClassName="bg-white/10 [&.active]:bg-primary size-1"
                  />
                </div>

                <div className="space-y-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/30">
                    {game.genre} · {game.year}
                  </p>
                  <TextScramble text={game.title} className="text-white" />
                </div>

                {/* Corner accent */}
                <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-primary transition-colors duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCROLL ANIMATION SHOWCASE ── */}
      <section className="bg-black">
        <ContainerScroll
          titleComponent={
            <div className="space-y-4 mb-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/30">
                The Vault
              </p>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white leading-none">
                Every legend,<br />
                <span className="text-white/30">one place.</span>
              </h2>
            </div>
          }
        >
          <Image
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&q=80"
            alt="Retro gaming collection"
            width={1400}
            height={720}
            className="mx-auto rounded-2xl object-cover h-full w-full object-center"
            draggable={false}
          />
        </ContainerScroll>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 px-8 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <DotLoader
              frames={loaderFrames}
              dotClassName="bg-white/10 [&.active]:bg-white/40 size-1"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/20">
              GameStash © 2026
            </span>
          </div>
          <div className="flex gap-8">
            {["PRIVACY", "TERMS", "GITHUB"].map((label) => (
              <TextScramble key={label} text={label} className="text-white/30 hover:text-white/70" />
            ))}
          </div>
        </div>
      </footer>

    </main>
  );
}
