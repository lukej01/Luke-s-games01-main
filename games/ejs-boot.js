// Loads EmulatorJS with CDN failover. Set the EJS_* globals first, then call
// bootEmulator(onAllFailed).
//
// The site as originally uploaded (33d854d) ran genizy/emu@master — the build
// every game was tuned against, and the one the owner confirms worked. Later
// "CDN fix" commits swapped in current-stable EmulatorJS, which on some
// hardware plays audio but renders black. Owner decision (Aug 2026): the
// original build IS the main engine again; current-stable hosts are kept only
// as reachability fallbacks, because filtered networks (schools especially)
// differ in which hosts they allow, and this repo has flip-flopped CDNs four
// times (100a23e, f3cebd3, aa9663f, 092974e/04d949e) chasing that.
//
// If the original build itself renders black, diag.js sets the "ejs-modern"
// flag and reloads once so the modern build gets a shot on that device.
window.bootEmulator = function (onAllFailed) {
  // The original pages shipped with vsync disabled — a known black-screen
  // trigger in EmulatorJS on some GPUs. Pages that set their own options
  // keep them.
  var opts = window.EJS_defaultOptions || {};
  if (!("vsync" in opts)) opts.vsync = "disabled";
  window.EJS_defaultOptions = opts;

  var ORIGINAL = "https://cdn.jsdelivr.net/gh/genizy/emu@master/";
  var cdns = [
    ORIGINAL,
    "https://cdn.emulatorjs.org/stable/data/",
    "https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/",
  ];
  var modern = false;
  try { modern = localStorage.getItem("ejs-modern") === "1"; } catch (e) {}
  if (modern) {
    cdns = [cdns[1], cdns[2], ORIGINAL];
    if (window.__diag) window.__diag("using current emulator build (original was black on this device)");
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
