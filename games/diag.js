// Failure reporting for the emulator pages.
//
// A dead ROM host, a blocked core download and a mis-sized container all look
// identical from the outside: a black frame. This surfaces which one it is on
// the page itself, so diagnosing does not require opening devtools.
//
// Strictly additive: it never gates the emulator. The panel stays out of
// sight unless something fails, and hides again once the game is on screen.
(function () {
  var lines = [];
  var box = null;
  var failed = false;

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

  // Healthy lines are kept as context but shown only once something fails.
  function render() {
    var b = ensureBox();
    b.textContent = lines.join("\n");
    if (!failed) b.style.display = "none";
  }

  function log(msg, bad) {
    lines.push((bad ? "FAIL  " : "ok    ") + msg);
    if (bad) { failed = true; ensureBox().style.display = ""; }
    render();
  }

  window.__diag = log;

  // Tell the parent app this frame actually rendered. The player shows a
  // launch-in-new-tab fallback when nothing arrives — content filters on
  // managed devices can treat embedded frames differently from top-level
  // pages, and a silently blocked iframe is indistinguishable from black.
  try {
    if (window.parent !== window) {
      window.parent.postMessage({ type: "gamestash:page-alive" }, "*");
    }
  } catch (e) {}

  window.addEventListener("error", function (e) {
    // Benign: the layout guard in ejs-boot.js resizes elements from inside a
    // ResizeObserver callback, and the browser reports the follow-up frame.
    if (/ResizeObserver loop/.test(e.message || "")) return;
    log("script error: " + (e.message || e.type) + (e.filename ? "  " + e.filename : ""), true);
  });

  window.addEventListener("unhandledrejection", function (e) {
    var r = e.reason;
    // EmulatorJS asks to keep the screen awake. Browsers refuse when the tab
    // is in the background ("...on 'WakeLock': The requesting page is not
    // visible") and managed devices may refuse outright ("Wake Lock
    // permission request denied"). The game runs either way, so this is not
    // a failure.
    if (r && /wake ?lock/i.test(String(r.message || r))) return;
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

  function sizeChain(node) {
    var parts = [];
    var el = node;
    for (var hops = 0; el && hops < 8; hops++) {
      var r = el.getBoundingClientRect();
      var name = el.tagName.toLowerCase();
      if (el.id) name += "#" + el.id;
      else if (typeof el.className === "string" && el.className) name += "." + el.className.split(" ")[0];
      var entry = name + " " + Math.round(r.width) + "x" + Math.round(r.height);
      // A zero element with a full-size parent means something nullified it at
      // runtime; print the computed values so the culprit property is named.
      if (r.width < 10 || r.height < 10) {
        var cs = getComputedStyle(el);
        entry += " [disp:" + cs.display + " pos:" + cs.position + " w:" + cs.width + " h:" + cs.height +
          (cs.transform !== "none" ? " tf:" + cs.transform : "") +
          (cs.visibility !== "visible" ? " vis:" + cs.visibility : "") +
          (cs.zoom && cs.zoom !== "1" ? " zoom:" + cs.zoom : "") +
          (cs.contain && cs.contain !== "none" ? " contain:" + cs.contain : "") +
          (cs.contentVisibility && cs.contentVisibility !== "visible" ? " cv:" + cs.contentVisibility : "") + "]";
      }
      parts.push(entry);
      if (el === document.body) break;
      el = el.parentElement;
    }
    return parts.join("  <  ");
  }

  // Black screen with working audio means the core is running but the video
  // blit is producing nothing: a GPU problem, not a loading problem. Report
  // whether this device can create a WebGL context at all, and which renderer
  // backs it, so "graphics disabled on this machine" is named on screen
  // instead of looking identical to every other black frame.
  //
  // Do not try to detect black frames by reading the emulator canvas. It
  // does not preserve its drawing buffer, so reads from outside its render
  // loop return cleared pixels while the game is visibly running. A check
  // like that once blacklisted working engines and reload-looped every game.
  function reportWebGL() {
    var probe = document.createElement("canvas");
    var gl = null, kind = "";
    try {
      gl = probe.getContext("webgl2");
      kind = gl ? "webgl2" : "";
      if (!gl) { gl = probe.getContext("webgl") || probe.getContext("experimental-webgl"); kind = gl ? "webgl1" : ""; }
    } catch (e) {}
    if (!gl) {
      log("WebGL unavailable — graphics are disabled on this device. The game runs (audio works) but cannot draw. Enable hardware acceleration in the browser settings, or it may be blocked by device management.", true);
      return;
    }
    var renderer = "";
    try {
      var info = gl.getExtension("WEBGL_debug_renderer_info");
      renderer = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    } catch (e) {}
    // Free the probe context now; browsers cap how many can be live at once.
    try { var lose = gl.getExtension("WEBGL_lose_context"); if (lose) lose.loseContext(); } catch (e) {}
    log("graphics: " + kind + (renderer ? " (" + renderer + ")" : ""));
    if (/swiftshader|software/i.test(renderer)) {
      log("note: software rendering, hardware acceleration is off; games may be slow");
    }
  }

  function watchContextLoss(c) {
    c.addEventListener("webglcontextlost", function () {
      log("WebGL context lost — the graphics driver gave up. Refresh the page; if it repeats, this device's GPU cannot handle the emulator.", true);
    });
  }

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
        watchContextLoss(c);
        // Leave the report readable for a few seconds, then get out of the way.
        // A zero-size canvas is a failure and stays on screen.
        if (good && box) setTimeout(function () { box.style.display = "none"; }, 5000);
        // The layout guard in ejs-boot.js should make this impossible; if it
        // happens anyway, walk up from the canvas so the report names the
        // collapsed ancestor.
        if (!good) log("size chain: " + sizeChain(c), true);
      }, 600);
    } else if (waited === 60) {
      // Not a failure: big multi-part games are routinely still downloading
      // here. Kept as context in case something else does fail.
      log("note: no emulator canvas after 60s; the game appears once the core and ROM have fully downloaded");
    }
  }, 1000);
  // No time limit on this watch. A large game can take minutes to download,
  // and the panel can only hide itself once it sees the game start.

  // Version marker so a cached old page is instantly distinguishable from this one.
  log("diag v11");
  reportWebGL();
})();
