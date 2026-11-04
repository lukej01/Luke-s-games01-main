// Loads EmulatorJS. Set the EJS_* globals first, then call
// bootEmulator(onAllFailed).
//
// History, so the next fix doesn't repeat it: an earlier version judged each
// engine by reading canvas pixels, saved any engine whose frames read black as
// "dead" in localStorage, and reloaded onto the next one. That check was wrong.
// The emulator's WebGL canvas does not keep its drawing buffer, so pixels read
// from outside its own render loop come back cleared (black) even while the
// game is on screen. Working engines got blacklisted and every game
// reload-looped into "every emulator engine failed". Its 60s no-canvas timer
// was wrong too: EmulatorJS mounts the canvas only after the core, ROM and
// BIOS have all downloaded, and on a slow connection that takes longer.
//
// So the engine is switched only when it fails to load, a signal that cannot
// fire on a working game. There are no pixel checks, no timers and no reloads.

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

// Layout guard. On the owner's managed Chromebook something hides the
// emulator's container while the page runs: diagnostics there showed div#game
// at 0x0 inside a full-size parent, which no CSS on these pages produces, and
// forcing it open with inline !important styles fixed it every time. diag.js
// used to do that only after the game canvas mounted, so the player first sat
// through the whole download on a black screen. Now the player is pinned open
// before the emulator starts, and a ResizeObserver re-pins anything in its
// chain the moment it collapses. Its callback runs after layout and before
// paint, so a collapse is never drawn.
function guardLayout(player) {
  var FULL = {
    display: "block", visibility: "visible", opacity: "1",
    position: "absolute", top: "0", left: "0", right: "0", bottom: "0",
    width: "100%", height: "100%", transform: "none",
    zoom: "1", contain: "none", "content-visibility": "visible",
  };
  // Something that re-hides on every change would otherwise fight this
  // forever; after this many repairs, stop and say so.
  var MAX_REPAIRS = 30;
  var repairs = 0;
  var reported = [];

  function pin(el) {
    for (var k in FULL) el.style.setProperty(k, FULL[k], "important");
  }

  function name(el) {
    var n = el.tagName.toLowerCase();
    if (el.id) return n + "#" + el.id;
    return typeof el.className === "string" && el.className ? n + "." + el.className.split(" ")[0] : n;
  }

  // Outermost first: a hidden ancestor makes everything inside it measure 0,
  // so it must be reopened before its children are judged.
  function chain() {
    var list = [];
    for (var up = player.parentElement; up && up !== document.body; up = up.parentElement) list.unshift(up);
    list.push(player);
    var inner = player.querySelector(":scope > .ejs_game, :scope > .ejs_canvas_parent");
    if (inner) list.push(inner);
    var canvas = player.querySelector("canvas.ejs_canvas");
    if (canvas) list.push(canvas);
    return list;
  }

  var ro = new ResizeObserver(repair);

  function repair() {
    chain().forEach(function (el) {
      ro.observe(el);
      var r = el.getBoundingClientRect();
      if (r.width >= 10 && r.height >= 10) return;
      if (repairs >= MAX_REPAIRS) return;
      repairs++;
      var cs = getComputedStyle(el);
      var label = name(el);
      if (reported.indexOf(label) === -1 && window.__diag) {
        reported.push(label);
        window.__diag("layout restored: " + label + " was " + Math.round(r.width) + "x" + Math.round(r.height) +
          " (display:" + cs.display + " visibility:" + cs.visibility + ")");
      }
      pin(el);
      if (repairs === MAX_REPAIRS && window.__diag) {
        window.__diag("something on this device keeps hiding the game area; stopped re-opening it", true);
      }
    });
  }

  pin(player);
  // EmulatorJS replaces the player's whole style attribute when it applies
  // its theme color, which drops the pin; put it back straight away. It also
  // swaps its inner container and adds the canvas only when the game starts,
  // so pick up new elements as they appear. Mutation callbacks run before
  // the next layout, so neither change is ever drawn.
  new MutationObserver(function () {
    if (player.style.getPropertyPriority("display") !== "important") pin(player);
    repair();
  }).observe(player, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
  repair();
}

window.bootEmulator = function (onAllFailed) {
  var player = document.querySelector(window.EJS_player);
  if (player) guardLayout(player);

  // The original pages shipped with vsync disabled, a known black-screen
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

  // Verdicts stored by the old pixel check. Nothing reads them any more;
  // clear them so they cannot mislead whoever debugs this next.
  try { localStorage.removeItem("ejs-dead"); localStorage.removeItem("ejs-good"); } catch (e) {}

  var VERSION = "4.2.3";
  var NPM = "https://cdn.jsdelivr.net/npm/@emulatorjs/";
  var ENGINES = [
    { data: "https://cdn.emulatorjs.org/stable/data/" },
    // The same release from npm through jsDelivr, the host that already serves
    // the ROMs, for networks that block the EmulatorJS CDN. npm ships each
    // core as its own package, so core files are mapped to it below.
    { data: NPM + "emulatorjs@" + VERSION + "/data/", npmCores: true },
  ];

  // EmulatorJS picks one core per system, and players can switch to another
  // in its settings, so map every core of the page's system.
  var CORE_GROUPS = [
    ["nes", "fceumm", "nestopia"],
    ["snes", "snes9x"],
    ["segaMD", "genesis_plus_gx", "picodrive"],
    ["n64", "mupen64plus_next", "parallel_n64"],
    ["psx", "pcsx_rearmed", "mednafen_psx_hw"],
    ["nds", "melonds", "desmume", "desmume2015"],
  ];

  // EJS_paths overrides a download by file name. Missing files fall through to
  // EmulatorJS's own fetch, so an unmapped core still has its usual path.
  function npmCorePaths(system) {
    var paths = {};
    CORE_GROUPS.forEach(function (group) {
      if (group.indexOf(system) === -1) return;
      group.slice(1).forEach(function (core) {
        var pkg = NPM + "core-" + core + "@" + VERSION + "/";
        ["", "-thread"].forEach(function (thread) {
          ["", "-legacy"].forEach(function (legacy) {
            var file = core + thread + legacy + "-wasm.data";
            paths[file] = pkg + file;
          });
        });
        paths[core + ".json"] = pkg + "reports/" + core + ".json";
      });
    });
    return paths;
  }

  (function tryNext(i) {
    if (i >= ENGINES.length) {
      if (window.__diag) window.__diag("no emulator engine could be loaded on this network", true);
      if (onAllFailed) onAllFailed();
      return;
    }
    var engine = ENGINES[i];
    function skip(why) {
      if (window.__diag) window.__diag(why + ": " + engine.data, true);
      tryNext(i + 1);
    }
    // loader.js resolves cores and wasm relative to EJS_pathtodata, so the
    // two must always point at the same host.
    window.EJS_pathtodata = engine.data;
    if (engine.npmCores) window.EJS_paths = Object.assign(npmCorePaths(window.EJS_core), window.EJS_paths);
    var s = document.createElement("script");
    s.src = engine.data + "loader.js";
    s.onload = function () {
      // A content filter can answer with its own block page: status 200 but
      // not JavaScript, so the script "loads" yet never runs. A real loader.js
      // adds its first emulator script from the same host before it yields,
      // so if that script is missing, this host served something else.
      var started = document.querySelector('script[src^="' + engine.data + '"]:not([src$="loader.js"])');
      if (!started) skip("engine blocked (got a non-script response)");
    };
    s.onerror = function () { skip("engine unreachable"); };
    document.body.appendChild(s);
  })(0);
};
