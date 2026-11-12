import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GameStash",
  description: "Classic games, playable in the browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Tears down the COI service worker if a previous build installed it.
            It caused a navigation reload loop that stopped games from booting.
            No reload here on purpose — unregister only, so it cannot loop. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'if("serviceWorker" in navigator)navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister()})}).catch(function(){});',
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
