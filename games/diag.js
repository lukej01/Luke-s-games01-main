// Failure reporting for the emulator pages.
//
// A dead ROM host, a blocked core download and a mis-sized container all look
// identical from the outside: a black frame. This surfaces which one it is on
// the page itself, so diagnosing does not require opening devtools.
//
// Strictly additive — it never gates the emulator, and it hides itself once a
// canvas appears.
(function () {
  var lines = [];
  var box = null;

  function ensureBox() {
    if (box) return box;
    box = document.createElement("div");
    box.id = "ejs-diag";
    box.setAttribute(
      "style",
      "position:fixed;left:0;right:0;bottom:0;z-index:2147483647;" +
        "font:12px/1.6 ui-monospace,monospace;background:rgba(0,0,0,.9);" +
        "color:#7fe9e0;padding:10px 14px;max-height:45vh;overflow:auto;" +
        "white-space:pre-wrap;word-break:break-all;border-top:1px solid rgba(0,255,255,.25)"
    );
    (document.body || document.documentElement).appendChild(box);
    return box;
  }

  function render() {
    ensureBox().textContent = lines.join("\n");
  }

  function log(msg, bad) {
    lines.push((bad ? "FAIL  " : "ok    ") + msg);
    render();
  }

  window.__diag = log;

  window.addEventListener("error", function (e) {
    log("script error: " + (e.message || e.type) + (e.filename ? "  " + e.filename : ""), true);
  });

  window.addEventListener("unhandledrejection", function (e) {
    var r = e.reason;
    log("unhandled rejection: " + ((r && (r.message || r)) || "unknown"), true);
  });

  // HEAD keeps this a simple CORS request and downloads no payload, so probing
  // a multi-gigabyte ROM part costs nothing.
  window.__diagProbe = function (label, url) {
    return fetch(url, { method: "HEAD", cache: "no-store" })
      .then(function (r) {
        log(label + " -> HTTP " + r.status + (r.ok ? "" : "  " + url), !r.ok);
        return r.ok;
      })
      .catch(function (err) {
        log(label + " -> " + (err && err.message ? err.message : "network error") + "  " + url, true);
        return false;
      });
  };

  var waited = 0;
  var poll = setInterval(function () {
    waited += 1;
    var c = document.querySelector("canvas");
    if (c) {
      clearInterval(poll);
      // Let layout settle, then report the real mounted size. A canvas that
      // exists but has no pixels is exactly the failure that must stay visible.
      setTimeout(function () {
        var r = c.getBoundingClientRect();
        var good = r.width > 10 && r.height > 10;
        log("emulator canvas mounted: " + Math.round(r.width) + "x" + Math.round(r.height), !good);
        if (good && box) box.style.display = "none";
      }, 600);
    } else if (waited === 60) {
      log("no emulator canvas after 60s — emulator never mounted", true);
    }
  }, 1000);
  setTimeout(function () {
    clearInterval(poll);
  }, 180000);

  // Version marker so a cached old page is instantly distinguishable from this one.
  log("diag v2");
})();
