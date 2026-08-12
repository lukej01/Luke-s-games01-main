// Loads EmulatorJS with CDN failover. Set the EJS_* globals first, then call
// bootEmulator(onAllFailed).
//
// This repo has alternated between cdn.emulatorjs.org and jsDelivr four times
// (100a23e, f3cebd3, aa9663f, 092974e/04d949e), each switch labeled as the fix
// — because the two hosts are reachable on different networks. Filtered
// networks (schools in particular) commonly allow jsDelivr while blocking
// cdn.emulatorjs.org, in which case ROM parts download fine and the emulator
// then silently never arrives. So: try each in order instead of picking one.
window.bootEmulator = function (onAllFailed) {
  var cdns = [
    "https://cdn.emulatorjs.org/stable/data/",
    "https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/",
  ];
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
