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

  // The owner's keyboard mapping, recovered from the original gaming hub
  // (042455c index.html) — WASD drives d-pad + left stick, arrows the right
  // stick. loader.js reads EJS_defaultControls into config.defaultControllers.
  // Defaults only: remaps made in the emulator's own controls UI are stored
  // by EmulatorJS in this origin's browser storage and win over these.
  if (!window.EJS_defaultControls) {
    window.EJS_defaultControls = {
      0: {
        0: { value: "space", value2: "BUTTON_2" },
        1: { value: "v", value2: "BUTTON_4" },
        2: { value: "enter", value2: "SELECT" },
        3: { value: "enter", value2: "START" },
        4: { value: "w", value2: "DPAD_UP" },
        5: { value: "s", value2: "DPAD_DOWN" },
        6: { value: "a", value2: "DPAD_LEFT" },
        7: { value: "d", value2: "DPAD_RIGHT" },
        8: { value: "b", value2: "BUTTON_1" },
        9: { value: "n", value2: "BUTTON_3" },
        10: { value: "x", value2: "LEFT_TOP_SHOULDER" },
        11: { value: "m", value2: "RIGHT_TOP_SHOULDER" },
        12: { value: "c", value2: "LEFT_BOTTOM_SHOULDER" },
        13: { value: "comma", value2: "RIGHT_BOTTOM_SHOULDER" },
        14: { value: "", value2: "LEFT_STICK" },
        15: { value: "", value2: "RIGHT_STICK" },
        16: { value: "d", value2: "LEFT_STICK_X:+1" },
        17: { value: "a", value2: "LEFT_STICK_X:-1" },
        18: { value: "s", value2: "LEFT_STICK_Y:+1" },
        19: { value: "w", value2: "LEFT_STICK_Y:-1" },
        20: { value: "right arrow", value2: "RIGHT_STICK_X:+1" },
        21: { value: "left arrow", value2: "RIGHT_STICK_X:-1" },
        22: { value: "down arrow", value2: "RIGHT_STICK_Y:+1" },
        23: { value: "up arrow", value2: "RIGHT_STICK_Y:-1" },
        24: { value: "1" },
        25: { value: "2" },
        26: { value: "3" },
        27: {}, 28: {}, 29: {},
      },
      1: {}, 2: {}, 3: {},
    };
  }

  // ── Controls keeper ──────────────────────────────────────────────────────
  // EmulatorJS saves remaps per game (localStorage "ejs-1-<console>-<name>-
  // settings", verified against @emulatorjs/emulatorjs 4.2.3 saveSettings/
  // getLocalStorageKey), so a mapping set in one game never reaches the
  // others, and the legacy engine used a different format. The keeper makes
  // one mapping rule them all: it mirrors the live mapping to its own key
  // whenever the player remaps, and on every boot re-applies the mirror as
  // the defaults AND into the emulator's own store for this game, so even a
  // stale stock per-game save can't shadow it.
  var MIRROR = "gamestash-controls";
  function lsGetJSON(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var userControls = lsGetJSON(MIRROR);
  if (userControls && typeof userControls === "object") {
    window.EJS_defaultControls = userControls;
    // Console family the storage key is built from: getCore(true) folds a
    // specific core into its console key; for every core this site uses,
    // only these two differ from the core name itself.
    var FAMILY = { parallel_n64: "n64", snes9x: "snes" };
    var core = window.EJS_core || "";
    var name = typeof window.EJS_gameName === "string" ? window.EJS_gameName : "";
    if (core) {
      var key = "ejs-1-" + (FAMILY[core] || core) + (name ? "-" + name : "") + "-settings";
      var per = lsGetJSON(key) || {};
      // loadSettings rejects the record unless settings is an object and
      // cheats an array, so seed valid siblings alongside the controls.
      per.controlSettings = userControls;
      if (!(per.settings instanceof Object)) per.settings = {};
      if (!Array.isArray(per.cheats)) per.cheats = [];
      lsSet(key, JSON.stringify(per));
    }
    // Legacy engine kept controlSettings inside the global "ejs-settings".
    var legacy = lsGetJSON("ejs-settings");
    if (legacy && typeof legacy === "object" && legacy.controlSettings) {
      legacy.controlSettings = userControls;
      lsSet("ejs-settings", JSON.stringify(legacy));
    }
  }

  // Mirror live remaps. EJS_emulator.controls is the active mapping in both
  // engine generations; poll it and persist on change.
  var lastMirrored = userControls ? JSON.stringify(userControls) : null;
  setInterval(function () {
    var em = window.EJS_emulator;
    if (!em || !em.controls) return;
    try {
      var now = JSON.stringify(em.controls);
      if (now && now !== lastMirrored) { lastMirrored = now; lsSet(MIRROR, now); }
    } catch (e) {}
  }, 3000);

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
