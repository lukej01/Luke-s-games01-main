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

  // Force collapsed elements back open with inline importants, which outrank
  // injected stylesheets. Walks canvas-to-body and only touches zero-size
  // elements, so EJS chrome and healthy layout are never affected.
  function selfHeal(node) {
    var FULL = {
      display: "block", visibility: "visible", opacity: "1",
      position: "absolute", top: "0", left: "0", right: "0", bottom: "0",
      width: "100%", height: "100%", transform: "none",
      zoom: "1", contain: "none", "content-visibility": "visible",
    };
    var el = node;
    for (var hops = 0; el && el !== document.body && hops < 6; hops++) {
      var r = el.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) {
        for (var k in FULL) el.style.setProperty(k, FULL[k], "important");
      }
      el = el.parentElement;
    }
  }

  // Black screen with working audio means the core is running but the video
  // blit is producing nothing — a GPU problem, not a loading problem. Report
  // whether this device can create a WebGL context at all, and which renderer
  // backs it, so "graphics disabled on this machine" is named on screen
  // instead of looking identical to every other black frame.
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
      return false;
    }
    var renderer = "";
    try {
      var info = gl.getExtension("WEBGL_debug_renderer_info");
      renderer = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    } catch (e) {}
    log("graphics: " + kind + (renderer ? " (" + renderer + ")" : ""));
    if (/swiftshader|software/i.test(renderer)) {
      log("software rendering — hardware acceleration is off; games may be black or very slow", true);
    }
    return true;
  }

  // Sample the mounted canvas a few times; if every pixel we see stays black
  // while the emulator is running, say so. getContext returns the existing
  // context when the type matches, so try each type the emulator could have
  // used. readPixels without preserveDrawingBuffer is a heuristic (the buffer
  // may already be cleared), so require repeated all-black reads before
  // reporting, and never report if any read shows color.
  function watchBlackFrames(c) {
    var sawColor = false, blackReads = 0, checks = 0;
    function sample() {
      var data = null;
      try {
        var gl = c.getContext("webgl2") || c.getContext("webgl");
        if (gl) {
          var px = new Uint8Array(4 * 16);
          for (var i = 0; i < 16; i++) {
            gl.readPixels(((i % 4) + 0.5) * gl.drawingBufferWidth / 4 | 0, ((i / 4 | 0) + 0.5) * gl.drawingBufferHeight / 4 | 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px.subarray(i * 4, i * 4 + 4));
          }
          data = px;
        } else {
          var ctx = c.getContext("2d");
          if (ctx) data = ctx.getImageData(0, 0, Math.min(64, c.width || 1), Math.min(64, c.height || 1)).data;
        }
      } catch (e) { return; }
      if (!data) return;
      for (var j = 0; j < data.length; j += 4) {
        if (data[j] > 8 || data[j + 1] > 8 || data[j + 2] > 8) { sawColor = true; return; }
      }
      blackReads++;
    }
    c.addEventListener("webglcontextlost", function () {
      log("WebGL context lost — the graphics driver gave up. Refresh the page; if it repeats, this device's GPU cannot handle the emulator.", true);
      if (box) box.style.display = "";
    });
    var iv = setInterval(function () {
      checks++;
      if (sawColor) { clearInterval(iv); return; }
      requestAnimationFrame(sample);
      if (checks >= 8) {
        clearInterval(iv);
        if (!sawColor && blackReads >= 4) {
          log("canvas is mounted and sized but every sampled frame is black — video output is not reaching the screen. Audio working + black video usually means graphics acceleration is broken or blocked on this device.", true);
          if (box) box.style.display = "";
          reportWebGL();
        }
      }
    }, 2000);
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
        // A correctly sized canvas can still be black; keep watching pixels.
        watchBlackFrames(c);
        // Leave the report readable for a few seconds, then get out of the way.
        // A zero-size canvas is a failure and stays on screen.
        if (good && box) setTimeout(function () { box.style.display = "none"; }, 5000);
        if (!good) {
          // Walk up from the canvas so the report names the collapsed ancestor.
          log("size chain: " + sizeChain(c), true);
          selfHeal(c);
          setTimeout(function () {
            var rh = c.getBoundingClientRect();
            var healed = rh.width > 10 && rh.height > 10;
            log("self-heal -> " + Math.round(rh.width) + "x" + Math.round(rh.height), !healed);
            if (healed && box) setTimeout(function () { box.style.display = "none"; }, 5000);
          }, 400);
          var tries = 0;
          var re = setInterval(function () {
            tries++;
            var r2 = c.getBoundingClientRect();
            if (r2.width > 10 && r2.height > 10) {
              clearInterval(re);
              if (box && box.style.display === "none") return;
              log("canvas recovered: " + Math.round(r2.width) + "x" + Math.round(r2.height));
              if (box) setTimeout(function () { box.style.display = "none"; }, 4000);
            } else {
              selfHeal(c);
              if (tries >= 10) {
                clearInterval(re);
                log("still zero after 30s; chain: " + sizeChain(c), true);
              }
            }
          }, 3000);
        }
      }, 600);
    } else if (waited === 60) {
      log("no emulator canvas after 60s — emulator never mounted", true);
    }
  }, 1000);
  setTimeout(function () {
    clearInterval(poll);
  }, 180000);

  // Version marker so a cached old page is instantly distinguishable from this one.
  log("diag v5");
})();
