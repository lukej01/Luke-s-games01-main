// Loads EmulatorJS with engine rotation. Set the EJS_* globals first, then
// call bootEmulator(onAllFailed).
//
// History, so the next fix doesn't repeat it: the site originally ran
// genizy/emu@master and worked; that host then broke (64cc9cb switched away
// from it calling it broken) and its loader now loads but boots nothing —
// no error event, no canvas, just black. Current-stable EmulatorJS loads
// everywhere but renders black-with-audio on some GPUs. So no single engine
// choice works for every device, and this repo flip-flopped hosts four times
// (100a23e, f3cebd3, aa9663f, 092974e/04d949e) trying to find one.
//
// Instead: try engines in order and judge them by what matters — pixels.
// diag.js watches the canvas and calls __ejsVideoOk() when real frames
// appear, or __ejsVideoDead() when the canvas never appears or stays black.
// Verdicts persist in localStorage: a proven engine boots first on every
// later visit, and proven-dead engines are never retried — discovery costs
// one slow first game, then the working engine is simply the default.
// Game pages are now visited top-level (the landing page navigates here
// instead of iframing — content filters on managed devices black out the
// embedded route). Give the player a way back that isn't the browser chrome.
// Skipped when embedded: the overlay has its own header.
(function () {
  if (window.parent !== window) return;
  function mount() {
    var a = document.createElement("a");
    a.textContent = "← GAMESTASH";
    a.href = "/Luke-s-games01-main/";
    a.setAttribute(
      "style",
      "position:fixed;top:10px;left:10px;z-index:9000;" +
        "font:600 11px/1 ui-monospace,monospace;letter-spacing:.25em;" +
        "color:#7fe9e0;text-decoration:none;padding:8px 12px;" +
        "background:rgba(0,0,0,.55);border:1px solid rgba(127,233,224,.35);" +
        "border-radius:4px;opacity:.75"
    );
    a.onmouseenter = function () { a.style.opacity = "1"; };
    a.onmouseleave = function () { a.style.opacity = ".75"; };
    document.body.appendChild(a);
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();

window.bootEmulator = function (onAllFailed) {
  // The original pages shipped with vsync disabled — a known black-screen
  // trigger in EmulatorJS on some GPUs. Pages with their own options keep them.
  var opts = window.EJS_defaultOptions || {};
  if (!("vsync" in opts)) opts.vsync = "disabled";
  window.EJS_defaultOptions = opts;

  var ALL = [
    "https://cdn.emulatorjs.org/stable/data/",
    "https://cdn.jsdelivr.net/gh/genizy/emu@master/",
    "https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/",
  ];

  function getLS(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function setLS(k, v) { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }

  // Engines proven video-dead on this device — persisted, so no visit ever
  // sits through a known failure again. If the list somehow swallows every
  // engine without one being proven good, ignore it and rediscover.
  var dead = [];
  try { dead = JSON.parse(getLS("ejs-dead") || "[]"); } catch (e) {}
  if (!Array.isArray(dead)) dead = [];
  var good = getLS("ejs-good");
  var cdns = ALL.filter(function (u) { return u === good || dead.indexOf(u) === -1; });
  if (cdns.length === 0) { dead = []; setLS("ejs-dead", null); cdns = ALL.slice(); }
  if (good && cdns.indexOf(good) > 0) { cdns.splice(cdns.indexOf(good), 1); cdns.unshift(good); }
  if (dead.length && window.__diag) window.__diag("skipping " + dead.length + " engine(s) previously proven video-dead here");

  var current = -1;
  var canvasTimer = null;

  function fail(msg) {
    if (window.__diag) window.__diag(msg, true);
    if (onAllFailed) onAllFailed();
  }

  // Called by diag.js once the canvas shows real (non-black) frames.
  window.__ejsVideoOk = function () {
    if (canvasTimer) { clearInterval(canvasTimer); canvasTimer = null; }
    setLS("ejs-good", cdns[current]);
  };

  // Called by diag.js on confirmed black frames, and below when no canvas
  // ever appears: remember this engine as dead here and reload onto the next.
  // Loading succeeded but video didn't, so a reload is the only clean way to
  // hand the page to a different engine.
  window.__ejsVideoDead = function (reason) {
    if (canvasTimer) { clearInterval(canvasTimer); canvasTimer = null; }
    var engine = cdns[current];
    if (engine && dead.indexOf(engine) === -1) { dead.push(engine); setLS("ejs-dead", JSON.stringify(dead)); }
    if (engine === good) setLS("ejs-good", null);
    if (current + 1 >= cdns.length) {
      // Clear the list so a later visit (new day, fixed drivers) rediscovers
      // from scratch instead of being locked out forever.
      setLS("ejs-dead", null);
      fail("every emulator engine failed to produce video on this device (" + reason + ") — graphics are likely disabled or blocked here");
      return false;
    }
    if (window.__diag) window.__diag(reason + " — switching emulator engine and reloading…", true);
    setTimeout(function () { location.reload(); }, 2000);
    return true;
  };

  (function tryNext(i) {
    if (i >= cdns.length) {
      fail("all emulator engines unreachable");
      return;
    }
    current = i;
    // loader.js resolves cores and wasm relative to EJS_pathtodata, so the
    // two must always point at the same host.
    window.EJS_pathtodata = cdns[i];
    var s = document.createElement("script");
    s.src = cdns[i] + "loader.js";
    s.onerror = function () {
      if (window.__diag) window.__diag("engine unreachable: " + cdns[i], true);
      tryNext(i + 1);
    };
    document.body.appendChild(s);
  })(0);

  // A loader that fetches fine but boots nothing fires no error event — the
  // genizy failure mode. bootEmulator runs after the ROM is already
  // downloaded, so a healthy engine mounts its canvas well within a minute.
  var waited = 0;
  canvasTimer = setInterval(function () {
    waited += 2;
    if (document.querySelector("canvas")) { clearInterval(canvasTimer); canvasTimer = null; return; }
    if (waited >= 60) window.__ejsVideoDead("engine loaded but never started (no canvas after 60s)");
  }, 2000);
};
