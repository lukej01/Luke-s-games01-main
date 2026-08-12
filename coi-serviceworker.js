// Serves COOP/COEP headers so SharedArrayBuffer is available, which the threaded
// N64/PSX/NDS cores need. GitHub Pages cannot set response headers, so a service
// worker is the only way to get cross-origin isolation here.
// Based on coi-serviceworker (Guido Zuidhof, MIT). Loading this file as a normal
// <script> registers it; the same file is what runs as the worker.
let coepCredentialless = false;

if (typeof window === "undefined") {
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener("message", (ev) => {
    if (!ev.data) return;
    if (ev.data.type === "deregister") {
      self.registration
        .unregister()
        .then(() => self.clients.matchAll())
        .then((clients) => clients.forEach((client) => client.navigate(client.url)));
    } else if (ev.data.type === "coepCredentialless") {
      coepCredentialless = ev.data.value;
    }
  });

  self.addEventListener("fetch", (event) => {
    const r = event.request;
    if (r.cache === "only-if-cached" && r.mode !== "same-origin") return;

    const request =
      coepCredentialless && r.mode === "no-cors"
        ? new Request(r, { credentials: "omit" })
        : r;

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 0) return response;

          const headers = new Headers(response.headers);
          headers.set(
            "Cross-Origin-Embedder-Policy",
            coepCredentialless ? "credentialless" : "require-corp"
          );
          if (!coepCredentialless) headers.set("Cross-Origin-Resource-Policy", "cross-origin");
          headers.set("Cross-Origin-Opener-Policy", "same-origin");

          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          });
        })
        .catch((e) => console.error(e))
    );
  });
} else {
  (() => {
    const reloadedBySelf = window.sessionStorage.getItem("coiReloadedBySelf");
    window.sessionStorage.removeItem("coiReloadedBySelf");
    const coepDegrading = reloadedBySelf === "coepdegrade";

    const n = navigator;
    const controlling = n.serviceWorker && n.serviceWorker.controller;

    if (controlling && !window.crossOriginIsolated) {
      window.sessionStorage.setItem("coiCoepHasFailed", "true");
    }
    const coepHasFailed = window.sessionStorage.getItem("coiCoepHasFailed");

    if (controlling) {
      // Browsers without `credentialless` (Safari) fail isolation; drop COEP
      // entirely on the second attempt rather than breaking every subresource.
      const reloadToDegrade = !!coepHasFailed && !coepDegrading;
      n.serviceWorker.controller.postMessage({
        type: "coepCredentialless",
        value: !(reloadToDegrade || (coepDegrading && coepHasFailed)),
      });
      if (reloadToDegrade) {
        window.sessionStorage.setItem("coiReloadedBySelf", "coepdegrade");
        window.location.reload();
        return;
      }
    }

    if (window.crossOriginIsolated || reloadedBySelf) return;
    if (!window.isSecureContext || !n.serviceWorker) return;

    n.serviceWorker.register(window.document.currentScript.src).then(
      (registration) => {
        registration.addEventListener("updatefound", () => {
          window.sessionStorage.setItem("coiReloadedBySelf", "updatefound");
          window.location.reload();
        });
        if (registration.active && !n.serviceWorker.controller) {
          window.sessionStorage.setItem("coiReloadedBySelf", "notcontrolling");
          window.location.reload();
        }
      },
      (err) => console.error("COOP/COEP Service Worker failed to register:", err)
    );
  })();
}
