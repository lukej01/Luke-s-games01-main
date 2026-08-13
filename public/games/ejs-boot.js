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
// appear (engine is remembered in localStorage and used first next time),
// or __ejsVideoDead() when the canvas never appears or stays black (the
// engine is skipped via sessionStorage and the page reloads onto the next).
window.bootEmulator = function (onAllFailed) {
  // The original pages shipped with vsync disabled — a known black-screen
  // trigger in EmulatorJS on some GPUs. Pages with their own options keep them.
  var opts = window.EJS_defaultOptions || {};
  if (!("vsync" in opts)) opts.vsync = "disabled";
  window.EJS_defaultOptions = opts;

  var cdns = [
    "https://cdn.emulatorjs.org/stable/data/",
    "https://cdn.jsdelivr.net/gh/genizy/emu@master/",
    "https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/",
  ];
  // An engine that produced real frames on this device goes first.
  var good = null;
  try { good = localStorage.getItem("ejs-good"); } catch (e) {}
  if (good && cdns.indexOf(good) > 0) cdns.splice(cdns.indexOf(good), 1), cdns.unshift(good);
  // Engines already proven video-dead this session are skipped.
  var skip = 0;
  try { skip = parseInt(sessionStorage.getItem("ejs-skip") || "0", 10) || 0; } catch (e) {}
  if (skip > 0 && window.__diag) window.__diag("skipping " + skip + " engine(s) that showed no video");

  var current = -1;
  var canvasTimer = null;

  function fail(msg) {
    if (window.__diag) window.__diag(msg, true);
    if (onAllFailed) onAllFailed();
  }

  // Called by diag.js once the canvas shows real (non-black) frames.
  window.__ejsVideoOk = function () {
    if (canvasTimer) { clearInterval(canvasTimer); canvasTimer = null; }
    try { localStorage.setItem("ejs-good", cdns[current]); } catch (e) {}
    try { sessionStorage.removeItem("ejs-skip"); } catch (e) {}
  };

  // Called by diag.js on confirmed black frames, and below when no canvas
  // ever appears: mark this engine dead for the session and reload onto the
  // next one. Loading succeeded but video didn't, so a reload is the only
  // clean way to hand the page to a different engine.
  window.__ejsVideoDead = function (reason) {
    if (canvasTimer) { clearInterval(canvasTimer); canvasTimer = null; }
    var next = skip + 1;
    if (next >= cdns.length) {
      fail("every emulator engine failed to produce video on this device (" + reason + ") — graphics are likely disabled or blocked here");
      return false;
    }
    try { sessionStorage.setItem("ejs-skip", String(next)); } catch (e) {}
    try { if (cdns[current] === good) localStorage.removeItem("ejs-good"); } catch (e) {}
    if (window.__diag) window.__diag(reason + " — switching emulator engine (" + (next + 1) + "/" + cdns.length + ") and reloading…", true);
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
  })(skip);

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
