import type { Metadata } from "next";
import "./globals.css";
import { SmoothScroll } from "@/components/ui/smooth-scroll";

export const metadata: Metadata = {
  title: "GameStash — Classic Vault",
  description: "Classic titles, rediscovered. The definitive retro game collection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script src="/Luke-s-games01-main/coi-serviceworker.js" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Share+Tech+Mono&family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col crt-fx">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
