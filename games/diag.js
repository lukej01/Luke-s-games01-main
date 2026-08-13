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
          (cs.visibility !== "visible" ? " vis:" + cs.visibility : "") + "]";
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
  log("diag v3");
})();
