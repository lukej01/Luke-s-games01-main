// Loads EmulatorJS with CDN failover. Set the EJS_* globals first, then call
// bootEmulator(onAllFailed).
//
// This repo has alternated between cdn.emulatorjs.org and jsDelivr four times
// (100a23e, f3cebd3, aa9663f, 092974e/04d949e), each switch labeled as the fix
// — because the two hosts are reachable on different networks. Filtered
// networks (schools in particular) commonly allow jsDelivr while blocking
// cdn.emulatorjs.org, in which case ROM parts download fine and the emulator
// then silently never arrives. So: try each in order instead of picking one.
//
// The site as originally uploaded (33d854d) ran genizy/emu@master — an older
// EmulatorJS build — and worked on hardware where the current stable build
// renders black with working audio. That build is kept as a reachable target:
// last in line normally, first when the "ejs-legacy" flag is set (diag.js
// sets it after confirming black video output, then reloads once).
window.bootEmulator = function (onAllFailed) {
  // The original pages shipped with vsync disabled, and vsync is a known
  // black-screen trigger in EmulatorJS on some GPUs. Default it off
  // everywhere; pages that set their own options keep them.
  var opts = window.EJS_defaultOptions || {};
  if (!("vsync" in opts)) opts.vsync = "disabled";
  window.EJS_defaultOptions = opts;

  var LEGACY = "https://cdn.jsdelivr.net/gh/genizy/emu@master/";
  var cdns = [
    "https://cdn.emulatorjs.org/stable/data/",
    "https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/",
    LEGACY,
  ];
  var legacy = false;
  try { legacy = localStorage.getItem("ejs-legacy") === "1"; } catch (e) {}
  if (legacy) {
    cdns = [LEGACY, cdns[0], cdns[1]];
    if (window.__diag) window.__diag("using original (legacy) emulator build");
  }
  (function tryNext(i) {
    if (i >= cdns.length) {
      if (window.__diag) window.__diag("all emulator CDNs failed", true);
      if (onAllFailed) onAllFailed();
      return;
    }
    // loader.js resolves cores and wasm relative to EJS_pathtodata, so the two
    // must always point at the same host.
    window.EJS_pathtodata = cdns[i];
    var s = document.createElement("script");
    s.src = cdns[i] + "loader.js";
    s.onerror = function () {
      if (window.__diag) window.__diag("emulator CDN unreachable: " + cdns[i], true);
      tryNext(i + 1);
    };
    document.body.appendChild(s);
  })(0);
};
