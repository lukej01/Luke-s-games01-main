// Self-unregistering no-op.
//
// This file used to inject COOP/COEP headers so SharedArrayBuffer would be
// available to the threaded emulator cores. It caused a navigation reload loop
// that stopped games from booting, so it is no longer registered by any page.
//
// The body below exists only to clean up browsers that installed an earlier
// version: they re-fetch this script on navigation, install this worker, and it
// immediately unregisters itself and refreshes its clients once.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.registration
      .unregister()
      .then(() => self.clients.matchAll())
      .then((clients) => clients.forEach((client) => client.navigate(client.url)))
      .catch(() => {})
  );
});
