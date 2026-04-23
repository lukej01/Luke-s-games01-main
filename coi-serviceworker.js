// Injects COOP/COEP headers so SharedArrayBuffer is available (needed for N64/PSX cores)
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", function(event) {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).then(function(r) {
      if (!r || r.status === 0) return r;
      const h = new Headers(r.headers);
      h.set("Cross-Origin-Opener-Policy", "same-origin");
      h.set("Cross-Origin-Embedder-Policy", "credentialless");
      return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
    })
  );
});
