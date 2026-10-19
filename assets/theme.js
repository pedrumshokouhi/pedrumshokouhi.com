/* P.S.: theme.js, v3.2 core. The house's motion system, its chrome, and the light switch's dial.
   The sixteen-light picker, the ten living rooms and the egg effects live in /assets/theme-picker.js: it loads on the
   dial's first touch, focus or key, 2s after load, or at once when the saved light is a living room.
     PS_MOTION / PS_REVEAL / PS_SCROLL        curves and springs, scroll reveals, pinned scenes
     PS.Q, PS.is                              the five media queries (exact strings) and live tests of them
     PS.say / PS.confirm / PS.sheet(el, o)    announcer, label crossfade, sheets (bottom on phones, a panel from 641px)
     PS.land / PS.scrollTo / PS.stage         jumps that land, the Turn
     PS.img / PS.plates / PS.foil / PS.counts pictures (one source, capped at 2x), plates, foil, the site's numbers
     PS.rail(el, o)                           a horizontal rail with a 44px "01 / 10" control row
     PS.dial.place()                          re-seat the dial (call it after adding a [data-dial-dock] at runtime)
   Loaded with defer: inline body scripts reach these APIs from a DOMContentLoaded handler. */
(function () {
  'use strict';
  var root = document.documentElement;
  function mm(q) { return window.matchMedia ? matchMedia(q) : { matches: false }; }
  var rmq = mm('(prefers-reduced-motion: reduce)');
  function onMq(mq, fn) {
    try { if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn); } catch (e) {}
  }
  function each(list, fn) { Array.prototype.forEach.call(list || [], fn); }
  function report(err) { setTimeout(function () { throw err; }, 0); } /* a page callback that throws never stops the loop */
  function idle(fn, t) { if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: t || 2000 }); else setTimeout(fn, 200); }

  /* ================================================================
     PS_MOTION: the JS mirror of the CSS motion tokens.
     ================================================================ */
  function bezier(x1, y1, x2, y2) {
    var ax = 1 - 3 * x2 + 3 * x1, bx = 3 * x2 - 6 * x1, cx = 3 * x1;
    var ay = 1 - 3 * y2 + 3 * y1, by = 3 * y2 - 6 * y1, cy = 3 * y1;
    var linear = x1 === y1 && x2 === y2;
    function sx(t) { return ((ax * t + bx) * t + cx) * t; }
    function sy(t) { return ((ay * t + by) * t + cy) * t; }
    function dx(t) { return (3 * ax * t + 2 * bx) * t + cx; }
    function tFor(x) {
      var t = x, i, d, e;
      for (i = 0; i < 4; i++) { /* Newton-Raphson */
        e = sx(t) - x;
        if (Math.abs(e) < 1e-5) return t;
        d = dx(t);
        if (Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      if (t >= 0 && t <= 1 && Math.abs(sx(t) - x) < 1e-5) return t;
      var lo = 0, hi = 1; /* bisection fallback */
      t = x;
      for (i = 0; i < 40; i++) {
        e = sx(t);
        if (Math.abs(e - x) < 1e-5) return t;
        if (e < x) lo = t; else hi = t;
        t = (lo + hi) / 2;
      }
      return t;
    }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      return linear ? x : sy(tFor(x));
    };
  }
  var durCache = null;
  function parseTime(v) {
    var m = /^(-?[\d.]+)(ms|s|px)?$/.exec(String(v || '').trim());
    if (!m) return 0;
    var n = parseFloat(m[1]);
    return m[2] === 's' ? n * 1000 : n;
  }
  function readDur() {
    durCache = {};
    var cs = null;
    try { cs = getComputedStyle(root); } catch (e) {}
    ['d-1', 'd-2', 'd-3', 'd-4', 'd-5', 'd-page', 'd-rv', 'd-leave', 'd-land', 'd-set', 'stagger', 'rise'].forEach(function (k) {
      durCache[k] = cs ? parseTime(cs.getPropertyValue('--' + k)) : 0;
    });
  }
  addEventListener('resize', function () { durCache = null; }, { passive: true });
  var reducedFns = [];
  onMq(rmq, function () {
    durCache = null;
    reducedFns.slice().forEach(function (fn) { try { fn(rmq.matches); } catch (e) { report(e); } });
  });
  var raf = window.requestAnimationFrame ? function (f) { return requestAnimationFrame(f); } : function (f) { return setTimeout(function () { f(Date.now()); }, 16); };
  var caf = window.cancelAnimationFrame ? function (h) { cancelAnimationFrame(h); } : clearTimeout;

  /* semi-implicit Euler in 1/120s substeps, at most 8 per frame. s = {x, v, target, k, c, eps}. Returns true at rest. */
  function springStep(s, dt) {
    dt = Math.max(0, Math.min(dt || 0, 1 / 30));
    var n = Math.min(8, Math.max(1, Math.ceil(dt * 120 - 1e-9))), h = dt / n, k = s.k || 170, c = s.c == null ? 26 : s.c;
    for (var i = 0; i < n; i++) {
      s.v += (-k * (s.x - s.target) - c * s.v) * h;
      s.x += s.v * h;
    }
    var eps = s.eps || 0.0005;
    if (Math.abs(s.v) < eps && Math.abs(s.x - s.target) < eps) { s.x = s.target; s.v = 0; return true; }
    return false;
  }

  var MO = window.PS_MOTION = {
    ease: { out: bezier(.16, 1, .3, 1), io: bezier(.65, 0, .35, 1), 'in': bezier(.7, 0, .84, 0), curtain: bezier(.76, 0, .24, 1) },
    bezier: bezier,
    /* dur('2'), dur('d-2'), dur('page'), dur('rv'), dur('leave'), dur('stagger') in ms; dur('rise') in px */
    dur: function (name) {
      if (!durCache) readDur();
      var k = String(name).replace(/^--/, '');
      if (/^[1-5]$/.test(k)) k = 'd-' + k;
      else if (k === 'page' || k === 'rv' || k === 'leave' || k === 'land' || k === 'set') k = 'd-' + k;
      return durCache[k] != null ? durCache[k] : 0;
    },
    reduced: function () { return !!rmq.matches; },
    onReduced: function (fn) { if (typeof fn === 'function') reducedFns.push(fn); },
    springStep: springStep,
    /* tween({from, to, dur, ease, delay, update, done}) -> cancel(). Reduced motion jumps to the end. */
    tween: function (o) {
      var from = o.from == null ? 0 : o.from, to = o.to == null ? 1 : o.to, d = o.dur == null ? MO.dur('d-3') : o.dur;
      var ease = typeof o.ease === 'function' ? o.ease : (MO.ease[o.ease] || MO.ease.out), t0 = 0, h = 0, dead = false, wait = 0;
      function end() { if (o.update) o.update(to, 1); if (o.done) o.done(); }
      if (MO.reduced() || d <= 1) { end(); return function () {}; }
      function tick(ts) {
        if (dead) return;
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / d);
        if (o.update) o.update(from + (to - from) * ease(p), p);
        if (p < 1) h = raf(tick); else if (o.done) o.done();
      }
      var go = function () { h = raf(tick); };
      if (o.delay) wait = setTimeout(go, o.delay); else go();
      return function () { dead = true; clearTimeout(wait); caf(h); };
    },
    /* spring({k, c, x, v, target, onUpdate, onRest}) -> {set, impulse, stop}. Sleeps at rest.
       Presets: PS_MOTION.spring.settle {k:170,c:26}, .weight {k:120,c:18}, .camera {k:60,c:14}. */
    spring: null
  };
  MO.spring = function (o) {
    o = o || {};
    var s = { x: o.x || 0, v: o.v || 0, target: o.target == null ? (o.x || 0) : o.target, k: o.k || 170, c: o.c == null ? 26 : o.c, eps: o.eps };
    var h = 0, last = 0;
    function frame(ts) {
      var dt = last ? (ts - last) / 1000 : 1 / 60;
      last = ts;
      var rest = springStep(s, dt);
      if (o.onUpdate) o.onUpdate(s.x, s.v);
      if (rest) { h = 0; last = 0; if (o.onRest) o.onRest(s.x); } else h = raf(frame);
    }
    function wake() { if (!h) { last = 0; h = raf(frame); } }
    var api = {
      set: function (t) {
        s.target = t;
        if (MO.reduced()) { s.x = t; s.v = 0; if (o.onUpdate) o.onUpdate(s.x, 0); if (o.onRest) o.onRest(s.x); return api; }
        wake(); return api;
      },
      impulse: function (v) { if (MO.reduced()) return api; s.v += v; wake(); return api; },
      stop: function () { if (h) caf(h); h = 0; last = 0; return api; },
      value: function () { return s.x; },
      velocity: function () { return s.v; }
    };
    if (s.x !== s.target || s.v) wake();
    return api;
  };
  MO.spring.settle = { k: 170, c: 26 };
  MO.spring.weight = { k: 120, c: 18 };
  MO.spring.camera = { k: 60, c: 14 };

  /* ================================================================
     PS_REVEAL: .rv content is visible by default. Only what starts below the fold is held (.rv-wait) and rises in
     when it nears the viewport. A sweep after every scroll settles anything passed.
     ================================================================ */
  var REV = window.PS_REVEAL = (function () {
    var io = null, waiting = [], sweepT = 0;
    function navType() {
      try { var e = performance.getEntriesByType('navigation')[0]; return e ? e.type : 'navigate'; } catch (x) { return 'navigate'; }
    }
    function skip(el) { var p = el.parentNode; return !!(p && p.classList && p.classList.contains('rl-cell')); }
    function finish(el) { el.classList.remove('rv-wait'); }
    function reveal(el, instant) {
      var i = waiting.indexOf(el);
      if (i > -1) waiting.splice(i, 1);
      if (io) io.unobserve(el);
      el.classList.add('in');
      if (instant || !el.classList.contains('rv-wait') || MO.reduced()) { finish(el); return; }
      setTimeout(function () { finish(el); }, MO.dur('rv') + 6 * MO.dur('stagger') + 80);
    }
    function ensureIO() {
      if (io || !('IntersectionObserver' in window)) return io;
      io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) reveal(e.target); });
      }, { rootMargin: '0px 0px 15% 0px' });
      return io;
    }
    function canHold(initial) {
      if (MO.reduced() || !('IntersectionObserver' in window)) return false;
      if (document.visibilityState === 'hidden') return false;
      if (initial && (location.hash.length > 1 || (window.scrollY || 0) > 2 || navType() !== 'navigate')) return false;
      return true;
    }
    function add(list, initial) {
      if (!list) return;
      if (list.nodeType === 1) list = [list];
      var els = Array.prototype.filter.call(list, function (el) {
        return el && el.classList && !el.classList.contains('in') && !el.classList.contains('rv-wait') && !skip(el);
      });
      if (!els.length) return;
      var hold = canHold(initial), vh = innerHeight || root.clientHeight;
      var rects = hold ? els.map(function (el) { return el.getBoundingClientRect(); }) : null; /* every read, then every write */
      els.forEach(function (el, k) {
        var r = rects && rects[k];
        if (hold && r && (r.width || r.height) && r.top >= vh) {
          el.classList.add('rv-wait');
          waiting.push(el);
          ensureIO().observe(el);
        } else el.classList.add('in');
      });
    }
    function sweep() {
      if (!waiting.length) return;
      var vh = innerHeight || root.clientHeight;
      var list = waiting.slice(), rs = list.map(function (el) { return el.getBoundingClientRect(); });
      list.forEach(function (el, k) {
        if (rs[k].bottom < 0) reveal(el, true);
        else if (rs[k].top < vh) reveal(el);
      });
    }
    function all(instant) { waiting.slice().forEach(function (el) { reveal(el, instant); }); }
    if ('onscrollend' in window) addEventListener('scrollend', sweep, { passive: true });
    else addEventListener('scroll', function () { clearTimeout(sweepT); sweepT = setTimeout(sweep, 120); }, { passive: true });
    addEventListener('beforeprint', function () { all(true); });
    MO.onReduced(function (on) { if (on) all(true); });
    function scan(scope) { add((scope || document).querySelectorAll('.rv')); }
    /* content that was hidden and is now shown (a more-toggle, a tab): replay the rise, staggered by --i */
    function cascade(list) {
      if (!list || MO.reduced()) return;
      if (list.nodeType === 1) list = [list];
      var els = Array.prototype.filter.call(list, function (el) { return el && el.classList && el.getClientRects().length; });
      if (!els.length) return;
      els.forEach(function (el) { el.classList.remove('in'); el.classList.add('rv-wait'); });
      void root.offsetWidth;
      els.forEach(function (el) { reveal(el); });
    }
    function init() { add(document.querySelectorAll('.rv'), true); }
    init();
    document.addEventListener('DOMContentLoaded', init);
    return { add: function (els) { add(els, false); }, scan: scan, cascade: cascade, reveal: function (el) { reveal(el); }, sweep: sweep, all: all };
  })();

  /* ================================================================
     PS_SCROLL: pinned scroll scenes. PS_SCROLL.scene(section, {steps, onProgress(p, info), onStep(i)}).
     p = clamp((scrollY - top) / (height - innerHeight), 0, 1), written to --p. Bands: enter .15, hold, release .85.
     ================================================================ */
  window.PS_SCROLL = (function () {
    var list = [], active = [], ticking = false, io = null, bound = false;
    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function call(fn, a, b) { if (fn) try { fn(a, b); } catch (e) { report(e); } }
    function stepOf(s, p) { var i = 0; for (var k = 0; k < s.steps.length; k++) if (p >= s.steps[k] - 1e-6) i = k; return i; }
    function setStep(s, i) {
      if (i === s.step) return;
      s.step = i;
      s.el.setAttribute('data-step', String(i));
      if (s.live) s.stepEls.forEach(function (e, k) { e.classList.toggle('is-on', k === i); });
      call(s.onStep, i);
    }
    function write(s, p) {
      if (p === s.p) return;
      s.p = p;
      s.el.style.setProperty('--p', p.toFixed(4));
      call(s.onProgress, p, { phase: p < .15 ? 'enter' : p > .85 ? 'release' : 'hold', hold: clamp((p - .15) / .7), live: s.live });
      setStep(s, stepOf(s, p));
    }
    function measure(s) {
      var r = s.el.getBoundingClientRect(), span = r.height - (innerHeight || root.clientHeight);
      return span > 0 ? clamp(-r.top / span) : (r.top < 0 ? 1 : 0);
    }
    function frame() {
      ticking = false;
      var ps = active.map(measure);
      active.forEach(function (s, k) { write(s, ps[k]); });
    }
    function request() { if (!ticking && active.length) { ticking = true; raf(frame); } }
    function bind() {
      if (bound) return;
      bound = true;
      addEventListener('scroll', request, { passive: true });
      addEventListener('resize', request, { passive: true });
    }
    function find(el) { for (var i = 0; i < list.length; i++) if (list[i].el === el) return list[i]; return null; }
    function ensureIO() {
      if (io || !('IntersectionObserver' in window)) return io;
      io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var s = find(e.target);
          if (!s) return;
          var i = active.indexOf(s);
          if (e.isIntersecting && s.live) { if (i < 0) active.push(s); }
          else if (i > -1) { active.splice(i, 1); write(s, measure(s)); }
        });
        request();
      });
      return io;
    }
    function setMode(s) {
      var live = !MO.reduced() && 'IntersectionObserver' in window;
      s.live = live;
      s.el.classList.toggle('is-live', live);
      s.el.classList.toggle('scene--static', !live);
      s.stepEls.forEach(function (e, k) { e.classList.toggle('is-on', live ? k === s.step : true); });
      s.p = -1;
      if (live) write(s, measure(s));
      else { var i = active.indexOf(s); if (i > -1) active.splice(i, 1); write(s, 1); }
    }
    MO.onReduced(function () { list.forEach(setMode); });
    function scene(section, opts) {
      if (!section) return null;
      opts = opts || {};
      var old = find(section);
      if (old) return old.api;
      var stepEls = Array.prototype.slice.call(section.querySelectorAll('.scene-step'));
      var steps = opts.steps && opts.steps.length ? opts.steps.slice() : stepEls.length
        ? stepEls.map(function (e, i) { return i / stepEls.length; }) : [0];
      var s = { el: section, steps: steps, stepEls: stepEls, onProgress: opts.onProgress, onStep: opts.onStep, p: -1, step: -1, live: false };
      list.push(s);
      s.api = {
        el: section,
        progress: function () { return s.p; },
        step: function () { return s.step; },
        refresh: function () { s.p = -1; write(s, s.live ? measure(s) : 1); },
        destroy: function () {
          var i = list.indexOf(s); if (i > -1) list.splice(i, 1);
          i = active.indexOf(s); if (i > -1) active.splice(i, 1);
          if (io) io.unobserve(section);
          section.classList.remove('is-live', 'scene--static');
        }
      };
      bind();
      setMode(s);
      if (ensureIO()) io.observe(section);
      return s.api;
    }
    return { scene: scene, refresh: function () { list.forEach(function (s) { s.api.refresh(); }); } };
  })();

  /* ================================================================
     THE FIVE QUERIES. Every page and every lab module uses these exact strings.
     ================================================================ */
  window.PS = window.PS || {};
  var PS = window.PS;
  var Q = PS.Q = {
    phone: '(max-width: 640px)',
    narrow: '(max-width: 759px)',
    land: '(max-height: 500px) and (pointer: coarse)',
    tablet: '(min-width: 641px) and (max-width: 1023px)',
    coarse: '(pointer: coarse)'
  };
  var mqPhone = mm(Q.phone), mqLand = mm(Q.land), mqCoarse = mm(Q.coarse), mqWide = mm('(min-width: 1024px)');
  function compact() { return mqPhone.matches || mqLand.matches; }
  PS.is = {
    phone: function () { return mqPhone.matches; },
    land: function () { return mqLand.matches; },
    compact: compact, /* the one-row nav with Menu: phones, and phones held sideways */
    coarse: function () { return mqCoarse.matches; },
    reduced: function () { return !!rmq.matches; }
  };
  var hasIO = 'IntersectionObserver' in window;

  /* ================================================================
     CHROME: PS.say (polite announcer), PS.confirm (label crossfade), PS.sheet.
     ================================================================ */
  var liveEl = null;
  function say(text) {
    if (!liveEl) {
      liveEl = document.createElement('p');
      liveEl.className = 'vh'; liveEl.id = 'psLive';
      liveEl.setAttribute('aria-live', 'polite'); liveEl.setAttribute('role', 'status');
      (document.body || root).appendChild(liveEl);
    }
    liveEl.textContent = '';
    setTimeout(function () { liveEl.textContent = String(text || ''); }, 40);
  }
  /* PS.confirm(button, 'Copied'): the label fades to the confirmed text for 1.4s and back. Put the label in
     <span class="cf-l"> to keep an arrow outside the swap; otherwise the whole content swaps. */
  function confirmLabel(el, text, ms) {
    if (!el) return;
    var lab = el.querySelector('.cf-l');
    if (!lab) {
      lab = document.createElement('span');
      lab.className = 'cf-l';
      while (el.firstChild) lab.appendChild(el.firstChild);
      el.appendChild(lab);
    }
    if (el._cfT) clearTimeout(el._cfT); else { el._cfHTML = lab.innerHTML; el._cfMin = el.style.minWidth; }
    el.style.minWidth = el.getBoundingClientRect().width + 'px';
    var swap = function (fn) {
      if (MO.reduced()) { fn(); return; }
      lab.classList.remove('is-in'); lab.classList.add('is-out');
      setTimeout(function () { fn(); lab.classList.remove('is-out'); lab.classList.add('is-in'); }, MO.dur('leave'));
    };
    swap(function () { lab.textContent = text; });
    say(text);
    el._cfT = setTimeout(function () {
      swap(function () { lab.innerHTML = el._cfHTML; el.style.minWidth = el._cfMin || ''; });
      el._cfT = 0;
    }, ms || 1400);
  }

  /* swipe-to-close for anything that slides in from an edge. dir 'down' (a bottom sheet) or 'up' (a top sheet).
     It starts on the grab handle or head, or anywhere once the content is scrolled to that edge; it follows the finger
     1:1 and closes past 80px or on a fast flick. Horizontal drags, rails and range inputs are left alone. */
  function swipe(el, o) {
    var d = null, down = o.dir !== 'up';
    function atEdge() { return down ? el.scrollTop <= 0 : el.scrollTop + el.clientHeight >= el.scrollHeight - 1; }
    el.addEventListener('touchstart', function (e) {
      d = null;
      if (e.touches.length !== 1 || (o.enabled && !o.enabled())) return;
      var t = e.target.closest ? e.target : null;
      if (t && t.closest('input, textarea, select, .ps-rail, [data-no-swipe]')) return;
      var p = e.touches[0];
      d = { x: p.clientX, y: p.clientY, g: !!(t && o.grab && t.closest(o.grab)), edge: atEdge(), live: false, off: 0, v: 0, ly: p.clientY, lt: e.timeStamp };
    }, { passive: true });
    el.addEventListener('touchmove', function (e) {
      if (!d) return;
      var p = e.touches[0], dy = p.clientY - d.y, dx = p.clientX - d.x, s = down ? dy : -dy;
      if (!d.live) {
        if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) { d = null; return; }
        if (s > 8 && (d.g || d.edge)) { d.live = true; d.y = p.clientY; d.ly = p.clientY; el.classList.add('is-dragging'); }
        else { if (Math.abs(dy) > 8) d = null; return; }
      }
      if (e.cancelable) e.preventDefault();
      var dt = Math.max(1, e.timeStamp - d.lt);
      d.v = (down ? p.clientY - d.ly : d.ly - p.clientY) / dt;
      d.ly = p.clientY; d.lt = e.timeStamp;
      d.off = Math.max(0, down ? p.clientY - d.y : d.y - p.clientY);
      el.style.translate = '0 ' + (down ? d.off : -d.off) + 'px';
    }, { passive: false });
    function end() {
      var x = d; d = null;
      if (!x || !x.live) return;
      el.classList.remove('is-dragging');
      el.style.translate = '';
      if (x.off > 80 || (x.v > 0.5 && x.off > 20)) o.onClose();
    }
    el.addEventListener('touchend', end);
    el.addEventListener('touchcancel', end);
  }

  /* PS.sheet(el, {opener, onClose, onOpen, side, scrim, bind}) -> {el, open(from), close(quiet), toggle(from), isOpen()}
     An element with class "sheet" is the house's top sheet (the phone menu, the World's floor plan). Anything else
     becomes a .ps-sheet: a bottom sheet at 640px and below (88svh, a grab handle, swipe down to close), a centred panel
     from 641px, or a right panel with side:'right'. Every kind: a scrim, Escape, focus trapped and then returned to
     the opener, the page locked under it without a shift. */
  var sheetN = 0;
  function makeSheet(sheet, o) {
    if (!sheet) return null;
    o = o || {};
    if (sheet._ps) { if (o.onClose) sheet._ps._oc = o.onClose; if (o.onOpen) sheet._ps._oo = o.onOpen; return sheet._ps; }
    var top = sheet.classList.contains('sheet');
    if (!top) { sheet.classList.add('ps-sheet'); if (o.side === 'right') sheet.classList.add('ps-sheet--right'); }
    var opener = o.opener || null, scrim = o.scrim || null, open = false, back = null;
    if (!scrim) {
      scrim = document.createElement('div');
      scrim.className = 'sheet-scrim';
      scrim.setAttribute('aria-hidden', 'true');
      sheet.parentNode.insertBefore(scrim, sheet);
    }
    var grab = document.createElement('div');
    grab.className = 'ps-sheet-grab';
    grab.setAttribute('aria-hidden', 'true');
    if (top) sheet.appendChild(grab); else sheet.insertBefore(grab, sheet.firstChild);
    if (!sheet.id) sheet.id = 'psSheet' + (++sheetN);
    if (!sheet.hasAttribute('role')) sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    function focusables() {
      return Array.prototype.filter.call(sheet.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
        function (el) { return el.getClientRects().length > 0; });
    }
    function emit(name) { try { sheet.dispatchEvent(new CustomEvent(name, { bubbles: true })); } catch (e) {} }
    function onKey(e) {
      if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); e.stopPropagation(); close(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables();
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1], a = document.activeElement;
      if (e.shiftKey && (a === first || !sheet.contains(a))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (a === last || !sheet.contains(a))) { e.preventDefault(); first.focus(); }
    }
    function onDown(e) {
      if (sheet.contains(e.target) || (opener && opener.contains(e.target))) return;
      close();
    }
    function openIt(from) {
      if (open) return;
      open = true;
      back = from || document.activeElement;
      sheet.classList.add('is-open'); scrim.classList.add('is-open'); root.classList.add('sheet-open');
      if (opener) opener.setAttribute('aria-expanded', 'true');
      document.addEventListener('keydown', onKey, true);
      document.addEventListener('pointerdown', onDown, true);
      var t = sheet.querySelector('[data-autofocus]') || focusables()[0];
      if (t) { try { t.focus({ preventScroll: true }); } catch (x) { t.focus(); } }
      if (api._oo) try { api._oo(); } catch (e) { report(e); }
      emit('sheet:open');
    }
    function close(quiet) {
      if (!open) return;
      open = false;
      sheet.classList.remove('is-open'); scrim.classList.remove('is-open');
      if (!document.querySelector('.sheet.is-open, .ps-sheet.is-open')) root.classList.remove('sheet-open');
      if (opener) opener.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerdown', onDown, true);
      if (!quiet && back && back.focus && document.contains(back)) { try { back.focus({ preventScroll: true }); } catch (x) { back.focus(); } }
      back = null;
      if (api._oc) try { api._oc(); } catch (e) { report(e); }
      emit('sheet:close');
    }
    if (opener) {
      opener.setAttribute('aria-controls', sheet.id);
      opener.setAttribute('aria-expanded', 'false');
      opener.setAttribute('aria-haspopup', 'dialog');
      if (o.bind !== false) opener.addEventListener('click', function (e) { e.preventDefault(); if (open) close(); else openIt(opener); });
    }
    /* following a link inside closes the sheet without pulling focus back, so an anchor can take it */
    sheet.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (a && open) close(true);
    });
    swipe(sheet, {
      dir: top ? 'up' : 'down', grab: '.ps-sheet-grab, .sheet-head, .ps-sheet-head', onClose: function () { close(); },
      enabled: function () { return open && (top ? compact() : mqPhone.matches); }
    });
    var api = sheet._ps = { el: sheet, open: openIt, close: close, toggle: function (from) { if (open) close(); else openIt(from); },
      isOpen: function () { return open; }, _oc: o.onClose || null, _oo: o.onOpen || null };
    return api;
  }
  PS.say = say;
  PS.confirm = confirmLabel;
  PS.sheet = makeSheet;

  /* ================================================================
     v3.1 FOUNDATION
     ================================================================ */
  function els(list, sel) {
    if (!list) list = document;
    if (typeof list === 'string') list = document.querySelectorAll(list);
    if (list.nodeType === 1 || list.nodeType === 9) {
      var out = [];
      if (sel && list.nodeType === 1 && list.matches && list.matches(sel)) out.push(list);
      if (sel) Array.prototype.push.apply(out, Array.prototype.slice.call(list.querySelectorAll(sel)));
      else out.push(list);
      return out;
    }
    return Array.prototype.slice.call(list);
  }

  /* ---------- colour maths: one 1px canvas reads any CSS colour (color-mix, oklch, var() resolved first) ---------- */
  var cvx = null, colCache = {};
  function rgba(str) {
    str = String(str || '').trim();
    if (colCache[str]) return colCache[str];
    var out = [0, 0, 0, 0];
    try {
      if (!cvx) { var c = document.createElement('canvas'); c.width = c.height = 1; cvx = c.getContext('2d', { willReadFrequently: true }); }
      cvx.clearRect(0, 0, 1, 1);
      cvx.fillStyle = '#000'; cvx.fillStyle = str;
      cvx.fillRect(0, 0, 1, 1);
      var d = cvx.getImageData(0, 0, 1, 1).data;
      out = [d[0], d[1], d[2], d[3] / 255];
    } catch (e) {}
    colCache[str] = out;
    return out;
  }
  /* PS.color('--bronze', el) -> 'rgb(...)': a token or any colour string, resolved against an element */
  function resolveColor(v, el) {
    var host = el && el.nodeType === 1 ? el : document.body || root;
    var probe = document.createElement('i');
    probe.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;color:' +
      (/^--/.test(v) ? 'var(' + v + ')' : v);
    host.appendChild(probe);
    var c = getComputedStyle(probe).color;
    host.removeChild(probe);
    return c;
  }
  function lum(c) {
    var a = c.slice(0, 3).map(function (v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function contrast(a, b) {
    var x = lum(typeof a === 'string' ? rgba(a) : a), y = lum(typeof b === 'string' ? rgba(b) : b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }
  /* the ink for a fill: the page's ink or on-dark if either clears 4.5:1, otherwise black or white, whichever is higher */
  function inkFor(bg, el) {
    var b = rgba(/^--|var\(/.test(bg) ? resolveColor(bg, el) : bg);
    var ink = resolveColor('--ink', el), od = resolveColor('--on-dark', el);
    var ci = contrast(ink, b), co = contrast(od, b);
    if (ci >= 4.5 || co >= 4.5) return ci >= co ? ink : od;
    return contrast('#000', b) >= contrast('#fff', b) ? '#000' : '#fff';
  }
  PS.color = resolveColor;
  PS.contrast = contrast;
  PS.inkFor = inkFor;

  /* ---------- numbers: true minus, thousands. PS.fmt(-18.4, {dp:1, unit:'%'}) -> '−18.4 %' ---------- */
  PS.fmt = function (n, o) {
    o = o || {};
    if (typeof n !== 'number' || !isFinite(n)) return String(n);
    var neg = n < 0, s = Math.abs(n).toFixed(o.dp == null ? 0 : o.dp);
    var parts = s.split('.');
    if (o.group !== false) parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    s = parts.join('.');
    return (neg ? '−' : (o.sign && n > 0 ? '+' : '')) + (o.pre || '') + s + (o.unit ? ' ' + o.unit : '');
  };
  PS.minus = '−';

  /* ---------- counts: the one source of truth for every number the site prints about itself ---------- */
  PS.COUNTS = { essays: 12, files: 25, investors: 10, financiers: 9, refusals: 23, numbers: 18, artists: 10, books: 18,
    archives: 5, notes: 27, words: 20, questions: 8, machines: 47, wings: 12, rooms: 13, chapters: 4 };
  var WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var TENS = { 2: 'twenty', 3: 'thirty', 4: 'forty', 5: 'fifty' };
  function countWord(n, cap) {
    var w = n < 20 ? WORDS[n] : n <= 50 ? TENS[Math.floor(n / 10)] + (n % 10 ? '-' + WORDS[n % 10] : '') : String(n);
    if (w == null) w = String(n);
    return cap ? w.charAt(0).toUpperCase() + w.slice(1) : w;
  }
  PS.countWord = countWord;
  /* <span data-count="machines">47</span>, <span data-count-word="machines Cap">Forty-seven</span>.
     data-count-live opts an element out (the Lab counts its own DOM). The static HTML must already be right. */
  PS.counts = function (scope) {
    els(scope || document, '[data-count], [data-count-word]').forEach(function (el) {
      if (el.hasAttribute('data-count-live')) return;
      var w = el.getAttribute('data-count-word'), k = el.getAttribute('data-count'), cap = false;
      if (w != null) w.split(/\s+/).forEach(function (t) { if (/^cap$/i.test(t)) cap = true; else if (t && !k && PS.COUNTS[t] != null) k = t; });
      var n = PS.COUNTS[k];
      if (n == null) return;
      var txt = w == null ? String(n) : countWord(n, cap);
      if (el.textContent !== txt) el.textContent = txt;
    });
  };

  /* ---------- PS.land(el, {focus, pulse, block}): an instant jump, one 600ms foil pulse (none under reduced motion),
     focus on its first h2 or h3 without a second scroll ---------- */
  function target(el) {
    if (typeof el === 'string') { var id = el.replace(/^#/, ''); try { id = decodeURIComponent(id); } catch (e) {} el = id ? document.getElementById(id) : null; }
    return el && el.nodeType === 1 ? el : null;
  }
  function jump(el, block, smooth) {
    try { el.scrollIntoView({ block: block || 'start', inline: 'nearest', behavior: smooth ? 'smooth' : 'instant' }); }
    catch (e) { try { el.scrollIntoView(block !== 'center'); } catch (e2) {} }
  }
  PS.land = function (el, o) {
    el = target(el);
    if (!el) return false;
    o = o || {};
    jump(el, o.block, false);
    if (o.pulse !== false && !MO.reduced()) {
      el.classList.remove('ps-land');
      void el.offsetWidth;
      el.classList.add('ps-land');
      clearTimeout(el._psLandT);
      el._psLandT = setTimeout(function () { el.classList.remove('ps-land'); }, (MO.dur('land') || 600) + 80);
    }
    if (o.focus !== false) {
      var h = /^H[23]$/.test(el.tagName) ? el : el.querySelector('h2, h3');
      var t = h || el;
      if (!t.matches('a[href], button, input, select, textarea, summary, [tabindex]')) t.setAttribute('tabindex', '-1');
      try { t.focus({ preventScroll: true }); } catch (e) { try { t.focus(); } catch (e2) {} }
    }
    try { el.dispatchEvent(new CustomEvent('ps:land', { bubbles: true })); } catch (e) {}
    return true;
  };
  /* PS.scrollTo(el, {block}): glides only when the trip is under 1.5 screens and motion is allowed; otherwise it jumps */
  PS.scrollTo = function (el, o) {
    el = target(el);
    if (!el) return false;
    o = o || {};
    var r = el.getBoundingClientRect(), vh = innerHeight || root.clientHeight;
    jump(el, o.block, !MO.reduced() && Math.abs(r.top) < 1.5 * vh);
    return true;
  };
  PS.landHash = function (o) { return location.hash.length > 1 ? PS.land(location.hash, o) : false; };
  /* <a href="#x" data-land> lands instead of the browser's own jump */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-land][href^="#"]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var t = target(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    try { history.pushState(null, '', a.getAttribute('href')); } catch (x) {}
    PS.land(t);
  });

  /* ---------- PS.stage(sections): the Turn. A line through the viewport's centre writes html[data-stage] (the ground),
     html[data-stage-tone] (dark|light) and --stage-c. Only the chrome re-tints. Returns {disconnect, current}. ---------- */
  var DEEP = { espresso: 1, forest: 1, slate: 1 };
  PS.stage = function (list) {
    var items = els(list);
    if (!items.length || !hasIO) return null;
    var on = [], cur = null;
    function tone(el, g) {
      if (DEEP[g]) return 'dark';
      if (g === 'wall') return el.getAttribute('data-tone') === 'dark' ? 'dark' : 'light';
      return root.getAttribute('data-tone') === 'dark' ? 'dark' : 'light';
    }
    function set(el) {
      cur = el;
      if (!el) {
        root.removeAttribute('data-stage'); root.removeAttribute('data-stage-tone'); root.style.removeProperty('--stage-c');
        return;
      }
      var g = el.getAttribute('data-ground') || 'paper', c = '';
      try { c = getComputedStyle(el).backgroundColor; } catch (e) {}
      root.setAttribute('data-stage', g);
      root.setAttribute('data-stage-tone', tone(el, g));
      if (c && rgba(c)[3] > 0) root.style.setProperty('--stage-c', c); else root.style.removeProperty('--stage-c');
      try { window.dispatchEvent(new CustomEvent('psstage', { detail: { el: el, ground: g } })); } catch (e) {}
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var i = on.indexOf(e.target);
        if (e.isIntersecting) { if (i > -1) on.splice(i, 1); on.push(e.target); }
        else if (i > -1) on.splice(i, 1);
      });
      var next = on.length ? on[on.length - 1] : null;
      if (next !== cur) set(next);
    }, { rootMargin: '-50% 0px -50% 0px' });
    items.forEach(function (el) { io.observe(el); });
    var re = function () { if (cur) set(cur); };
    window.addEventListener('pstheme', re);
    return {
      current: function () { return cur; },
      disconnect: function () { io.disconnect(); window.removeEventListener('pstheme', re); on = []; set(null); }
    };
  };

  /* ---------- PS.img(root): the loader. img[data-src] / img[data-srcset] move into place 600px before they are seen
     (1200px for full-bleed plates and gilt frames on a fine pointer), six requests at a time, first in first out.
     The density cap: a Wikimedia picture gets ONE source, the smallest listed width that covers its rendered box at
     min(devicePixelRatio, 2), corrected for object-fit: cover from its width and height attributes. A picture that is
     not laid out yet (a hidden slide) keeps its srcset. A capped picture steps up, never down, when the viewport
     widens. PS.img(root, {eager:true}) queues everything in root now; PS.img.load(img) queues one. ---------- */
  var IMG = (function () {
    var MAX = 6, active = 0, queue = [], io = null, ioFar = null, capped = [], lastW = innerWidth;
    var WIKI = /^https:\/\/upload\.wikimedia\.org\//;
    function plateOf(img) { return img.closest ? img.closest('.plate') : null; }
    function cands(img) {
      var out = [], ss = img.getAttribute('data-srcset'), src = img.getAttribute('data-src'), ok = true;
      if (ss) ss.split(/,\s+(?=\S)/).forEach(function (part) {
        var m = /^\s*(\S+)\s+(\d+)w\s*$/.exec(part);
        if (m) out.push({ u: m[1], w: +m[2] }); else ok = false;
      });
      if (src) { var m2 = /\/(\d+)px-[^\/]+$/.exec(src); if (m2) out.push({ u: src, w: +m2[1] }); }
      if (!ok || !out.length || out.some(function (c) { return !WIKI.test(c.u); })) return null;
      return out.sort(function (a, b) { return a.w - b.w; });
    }
    function need(img, r) {
      var w = r && r.width, h = r && r.height;
      if (!w || w < 2) return 0;
      var fit = '', iw = +img.getAttribute('width'), ih = +img.getAttribute('height');
      try { fit = getComputedStyle(img).objectFit; } catch (e) {}
      if (fit === 'cover' && iw && ih && h) w = Math.max(w, h * iw / ih);
      return Math.ceil(w * Math.min(window.devicePixelRatio || 1, 2));
    }
    function pick(list, px) { for (var i = 0; i < list.length; i++) if (list[i].w >= px) return list[i]; return list[list.length - 1]; }
    function pump() {
      var batch = [];
      while (active + batch.length < MAX && queue.length) batch.push(queue.shift());
      /* every read first (one layout), then every write */
      batch.forEach(function (img) { if (!img._psR && img.getAttribute('data-srcset') != null) img._psR = img.getBoundingClientRect(); });
      batch.forEach(start);
    }
    function start(img) {
      active++;
      var freed = false, settled = false, t = 0;
      function free() { if (freed) return; freed = true; active--; clearTimeout(t); pump(); }
      function settle(ok) {
        if (settled) return;
        settled = true;
        img.removeEventListener('load', onL); img.removeEventListener('error', onE);
        img.setAttribute('data-ps-img', ok ? 'ok' : 'fail');
        var pl = plateOf(img);
        if (pl) { pl.classList.remove('is-loading', 'is-near'); if (nearIO) nearIO.unobserve(pl); if (!ok) failPlate(pl); }
        free();
      }
      function onL() { settle(true); }
      function onE() { settle(false); }
      img.addEventListener('load', onL);
      img.addEventListener('error', onE);
      t = setTimeout(free, 15000); /* a stalled request gives its slot back; its load or error still lands later */
      try { if (!img.getAttribute('decoding')) img.decoding = 'async'; } catch (e) {}
      var sz = img.getAttribute('data-sizes'), ss = img.getAttribute('data-srcset'), src = img.getAttribute('data-src');
      var list = (ss || src) ? cands(img) : null, px = list ? need(img, img._psR) : 0, c = px ? pick(list, px) : null;
      img._psR = null;
      if (c) {
        img.removeAttribute('data-sizes'); img.removeAttribute('data-srcset'); img.removeAttribute('data-src');
        img._psC = list; img._psW = c.w; capped.push(img);
        img.src = c.u;
      } else {
        var pic = img.parentNode && img.parentNode.tagName === 'PICTURE' ? img.parentNode : null;
        if (pic) each(pic.querySelectorAll('source[data-srcset]'), function (s) {
          s.srcset = s.getAttribute('data-srcset'); s.removeAttribute('data-srcset');
          if (s.getAttribute('data-sizes')) { s.sizes = s.getAttribute('data-sizes'); s.removeAttribute('data-sizes'); }
        });
        if (sz) { img.sizes = sz; img.removeAttribute('data-sizes'); }
        if (ss) { img.srcset = ss; img.removeAttribute('data-srcset'); }
        if (src) { img.src = src; img.removeAttribute('data-src'); }
        if (!ss && !src) { settle(true); return; }
      }
      var pl = plateOf(img);
      if (pl && !img.complete) pl.classList.add('is-loading');
      else if (img.complete && img.naturalWidth) settle(true);
    }
    function enqueue(img, r) {
      if (!img || img._psQ) return;
      img._psQ = 1;
      if (r) img._psR = r;
      if (io) io.unobserve(img);
      if (ioFar) ioFar.unobserve(img);
      queue.push(img);
      pump();
    }
    function mk(m) {
      try { return new IntersectionObserver(onIO, { rootMargin: m + ' ' + m + ' ' + m + ' ' + m, scrollMargin: m }); }
      catch (e) { return new IntersectionObserver(onIO, { rootMargin: m + ' ' + m + ' ' + m + ' ' + m }); }
    }
    function ensureIO() {
      if (io || !hasIO) return io;
      io = mk('600px');
      ioFar = mqCoarse.matches ? io : mk('1200px');
      return io;
    }
    function onIO(es) { es.forEach(function (e) { if (e.isIntersecting) enqueue(e.target, e.boundingClientRect); }); }
    function scan(scope, o) {
      o = o || {};
      var list = els(scope || document, 'img[data-src], img[data-srcset]');
      list.forEach(function (img) {
        if (img._psQ) return;
        if (o.eager || !ensureIO()) { enqueue(img); return; }
        if (img._psO) return;
        img._psO = 1;
        (img.closest && img.closest('.e-fig--bleed, .frame-gilt') ? ioFar : io).observe(img);
      });
      return list.length;
    }
    scan.load = function (img) { els(img, 'img[data-src], img[data-srcset]').forEach(function (i) { enqueue(i); }); };
    scan.stats = function () { return { active: active, queued: queue.length, max: MAX, capped: capped.length }; };
    /* a wider viewport (a phone turned sideways): step a capped picture up to the next listed width it now needs */
    var rzT = 0;
    addEventListener('resize', function () {
      clearTimeout(rzT);
      rzT = setTimeout(function () {
        if (innerWidth <= lastW) { lastW = innerWidth; return; }
        lastW = innerWidth;
        capped = capped.filter(function (img) { return img.isConnected; });
        var rs = capped.map(function (img) { return img.getClientRects().length ? img.getBoundingClientRect() : null; });
        capped.forEach(function (img, k) {
          var px = rs[k] ? need(img, rs[k]) : 0, c = px ? pick(img._psC, px) : null;
          if (c && c.w > img._psW) { img._psW = c.w; img.src = c.u; }
        });
      }, 300);
    }, { passive: true });
    return scan;
  })();
  PS.img = IMG;

  /* ---------- PS.plates(root): develop, reveal and failure for every [data-plate] / .plate. Geometry comes from
     IntersectionObserver entries, never an upfront read. A waiting plate breathes only while it is within one screen
     (.is-near), so a long page never runs dozens of loops. ---------- */
  var coarse = mm('(hover: none), (pointer: coarse)');
  var devIO = null, revIO = null, holdIO = null, nearIO = null;
  function initials(s) {
    s = String(s || '').replace(/\(.*?\)|,.*$/g, '').trim();
    var w = s.split(/\s+/).filter(function (x) { return /^[A-Z]/.test(x); });
    return w.length ? (w[0].charAt(0) + (w.length > 1 ? w[w.length - 1].charAt(0) : '')).toUpperCase() : '';
  }
  function failPlate(pl) {
    if (pl.classList.contains('plate--fail')) return;
    var img = pl.querySelector('img');
    if (!pl.getAttribute('data-fail-text')) pl.setAttribute('data-fail-text', pl.getAttribute('data-mono') || pl.getAttribute('data-no') || initials(img && img.alt) || 'P.S.');
    var w = pl.getBoundingClientRect().width || 200;
    pl.style.setProperty('--fail-fs', Math.round(Math.max(20, Math.min(64, w * 0.28))) + 'px');
    pl.classList.remove('is-loading', 'is-near');
    pl.classList.add('plate--fail');
  }
  function develop(pl) { pl.classList.add('is-dev'); }
  function revealIO() {
    return revIO || (revIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        revIO.unobserve(el);
        el.classList.add('is-in');
        setTimeout(function () { el.classList.remove('mv-wait', 'is-in'); }, (MO.dur('d-4') || 900) + 60);
      });
    }, { rootMargin: mqCoarse.matches ? '0px' : '0px 0px -12% 0px' }));
  }
  function holdObs() {
    /* the reveal, only for plates that start below the fold: decided from the first entry */
    return holdIO || (holdIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var pl = e.target, r = e.boundingClientRect, vh = (e.rootBounds && e.rootBounds.height) || innerHeight;
        holdIO.unobserve(pl);
        if (e.isIntersecting || !(r.width || r.height) || r.top < vh || MO.reduced()) return;
        pl.classList.add('mv-wait');
        revealIO().observe(pl);
      });
    }));
  }
  function nearObs() {
    return nearIO || (nearIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-near', e.isIntersecting); });
    }, { rootMargin: '100% 0px' }));
  }
  PS.plates = function (scope) {
    var list = els(scope || document, '[data-plate], .plate');
    var motion = !MO.reduced() && hasIO;
    list.forEach(function (pl) {
      if (pl._psPlate || pl.classList.contains('plate--mono')) return;
      pl._psPlate = 1;
      var img = pl.querySelector('img');
      if (img) {
        img.addEventListener('error', function () { failPlate(pl); });
        img.addEventListener('load', function () { pl.classList.remove('is-loading'); });
        if (img.getAttribute('src') && img.complete && !img.naturalWidth) failPlate(pl);
        else if (hasIO && (img.hasAttribute('data-src') || img.hasAttribute('data-srcset'))) nearObs().observe(pl);
      }
      if (coarse.matches && hasIO && !pl.classList.contains('is-dev')) { /* touch: develop once, at 60% in view */
        if (!devIO) devIO = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { develop(e.target); devIO.unobserve(e.target); } });
        }, { threshold: 0.6 });
        devIO.observe(pl);
      }
      if (motion && pl.classList.contains('mv-develop')) holdObs().observe(pl);
    });
    return list.length;
  };
  MO.onReduced(function (on) {
    if (!on) return;
    each(document.querySelectorAll('.plate.mv-wait'), function (pl) { pl.classList.remove('mv-wait', 'is-in'); });
  });

  /* ---------- PS.foil(root): one sheen per foil, the first time it is half in view (deep grounds only, in CSS) ---------- */
  var foilIO = null;
  PS.foil = function (scope) {
    var list = els(scope || document, '.foil').filter(function (f) { return !f._psFoil; });
    if (!list.length) return 0;
    if (!hasIO || MO.reduced()) { list.forEach(function (f) { f._psFoil = 1; f.classList.add('is-lit'); }); return list.length; }
    if (!foilIO) foilIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-lit'); foilIO.unobserve(e.target); } });
    }, { threshold: 0.5 });
    list.forEach(function (f) { f._psFoil = 1; foilIO.observe(f); });
    return list.length;
  };

  /* ---------- PS.rail(el, {label}): a horizontal rail (.ps-rail: snap to start, edge fades) with a 44px control row
     above it: "01 / 10" and two arrow keys. The keys scroll the rail itself, never the page. ---------- */
  PS.rail = function (el, o) {
    el = target(el);
    if (!el) return null;
    if (el._psRail) return el._psRail;
    o = o || {};
    el.classList.add('ps-rail');
    var ctl = document.createElement('div');
    ctl.className = 'ps-rail-ctl';
    ctl.setAttribute('role', 'group');
    ctl.setAttribute('aria-label', o.label || 'Slides');
    ctl.innerHTML = '<span class="ps-rail-n"><b>01</b><span aria-hidden="true"> / </span><span class="vh"> of </span><span class="ps-rail-t">01</span></span>' +
      '<span class="ps-rail-keys"><button type="button" class="ps-rail-b" data-d="-1" aria-label="Previous"><span aria-hidden="true">←</span></button>' +
      '<button type="button" class="ps-rail-b" data-d="1" aria-label="Next"><span aria-hidden="true">→</span></button></span>';
    el.parentNode.insertBefore(ctl, el);
    var nEl = ctl.querySelector('b'), tEl = ctl.querySelector('.ps-rail-t'), keys = ctl.querySelectorAll('.ps-rail-b'), cur = 0, tick = false;
    function items() { return Array.prototype.filter.call(el.children, function (c) { return c.getClientRects().length > 0; }); }
    function padL() { var v = parseFloat(getComputedStyle(el).scrollPaddingLeft); return isNaN(v) ? 0 : v; }
    function lefts(list) { var x0 = el.getBoundingClientRect().left - el.scrollLeft; return list.map(function (c) { return c.getBoundingClientRect().left - x0; }); }
    function two(n) { return (n < 10 ? '0' : '') + n; }
    function sync() {
      tick = false;
      var list = items(), ls = lefts(list), x = el.scrollLeft + padL(), max = el.scrollWidth - el.clientWidth, best = 0, bd = Infinity;
      ls.forEach(function (l, i) { var d = Math.abs(l - x); if (d < bd) { bd = d; best = i; } });
      var atS = el.scrollLeft <= 2, atE = el.scrollLeft >= max - 2;
      cur = atE && list.length ? list.length - 1 : best;
      nEl.textContent = two(cur + 1); tEl.textContent = two(list.length);
      el.classList.toggle('is-start', atS); el.classList.toggle('is-end', atE);
      keys[0].setAttribute('aria-disabled', atS ? 'true' : 'false');
      keys[1].setAttribute('aria-disabled', atE ? 'true' : 'false');
    }
    function go(i) {
      var list = items();
      i = Math.max(0, Math.min(list.length - 1, i));
      if (!list[i]) return;
      var left = Math.max(0, lefts([list[i]])[0] - padL());
      try { el.scrollTo({ left: left, behavior: MO.reduced() ? 'auto' : 'smooth' }); } catch (e) { el.scrollLeft = left; }
    }
    ctl.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.ps-rail-b');
      if (!b || b.getAttribute('aria-disabled') === 'true') return;
      go(cur + (+b.getAttribute('data-d')));
    });
    el.addEventListener('keydown', function (e) {
      if (e.target !== el || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
      e.preventDefault();
      go(cur + (e.key === 'ArrowRight' ? 1 : -1));
    });
    el.addEventListener('scroll', function () { if (!tick) { tick = true; raf(sync); } }, { passive: true });
    addEventListener('resize', function () { if (!tick) { tick = true; raf(sync); } }, { passive: true });
    sync();
    return (el._psRail = { el: el, ctl: ctl, go: go, next: function () { go(cur + 1); }, prev: function () { go(cur - 1); }, sync: sync, index: function () { return cur; } });
  };

  function foundation() {
    try { PS.counts(document); } catch (e) { report(e); }
    try { PS.plates(document); } catch (e) { report(e); }
    try { PS.img(document); } catch (e) { report(e); }
    try { PS.foil(document); } catch (e) { report(e); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', foundation);
  else foundation();

  /* ================================================================
     THE LIGHT SWITCH: sixteen lights and one hidden. The core keeps the list, the dial and its press counter;
     theme-picker.js brings the panel, the living rooms and the egg effects.
     ================================================================ */
  var THEMES = [
    { key: 'daylight', name: 'Daylight', sw: ['#F6F4ED', '#121110', '#FF4D00'], original: true },
    { key: 'play', name: 'The Playroom', sw: ['#F2EDE2', '#26221B', '#FF5C39'], live: true },
    { key: 'aurora', name: 'Aurora', sw: ['#0B1024', '#EDEFFC', '#7DF5C6'], live: true, dark: true },
    { key: 'riso', name: 'Two-Ink Riso', sw: ['#F6F1E5', '#20359F', '#FF4438'] },
    { key: 'gallery', name: 'White Cube', sw: ['#FFFFFF', '#0C0C0C', '#E8380D'] },
    { key: 'swarm', name: 'The Swarm', sw: ['#050505', '#EDEDED', '#FF2E63'], live: true, dark: true },
    { key: 'rain', name: 'The Rainy Study', sw: ['#171C23', '#E6EBF2', '#6FB7FF'], live: true, dark: true },
    { key: 'void', name: 'The Void', sw: ['#000000', '#FFFFFF', '#FFFFFF'], live: true, secret: true, dark: true },
    { key: 'sim', name: 'The Simulation', sw: ['#06080F', '#D7E4FF', '#00E5FF'], live: true, dark: true },
    { key: 'abyss', name: 'The Abyss', sw: ['#06222B', '#D8F0F2', '#3EE6C1'], live: true, dark: true },
    { key: 'city', name: 'Night City', sw: ['#0B0E1A', '#EAE6F8', '#FF6EC7'], live: true, dark: true },
    { key: 'warp', name: 'Hyperdrive', sw: ['#030308', '#EDEBFF', '#8A7BFF'], live: true, dark: true },
    { key: 'ember', name: 'Ember', sw: ['#191210', '#F4E8DC', '#FF7A45'], live: true, dark: true },
    { key: 'terminal', name: 'Phosphor', sw: ['#0A0D0A', '#B7FFC9', '#4AFF7F'], dark: true },
    { key: 'blueprint', name: 'Blueprint', sw: ['#0F2C4E', '#E8F1FD', '#FFC94B'], dark: true },
    { key: 'board', name: 'The Blackboard', sw: ['#232A27', '#EDE7D8', '#FF6E4F'], dark: true },
    { key: 'night', name: 'After Hours', sw: ['#141312', '#F1EDE2', '#FF4D00'], dark: true }
  ];
  var KEY = 'psTheme', VKEY = 'psVoidFound', voidFound = false;
  try { voidFound = localStorage.getItem(VKEY) === '1'; } catch (e) {}
  function current() {
    var t = root.getAttribute('data-theme');
    return THEMES.some(function (x) { return x.key === t; }) ? t : 'daylight';
  }
  function themeOf(key) {
    for (var i = 0; i < THEMES.length; i++) if (THEMES[i].key === key) return THEMES[i];
    return THEMES[THEMES.length - 1];
  }
  /* paper and ink split on the diagonal, the accent as a sun in the upper right; the daylight dial leaves the sun out */
  function disc(key, dial) {
    var t = themeOf(key), split = 'linear-gradient(135deg, ' + t.sw[0] + ' 0 50%, ' + t.sw[1] + ' 50% 100%)';
    if (dial && key === 'daylight') return split;
    return 'radial-gradient(circle at 70% 30%, ' + t.sw[2] + ' 0 18%, transparent 19%), ' + split;
  }

  /* ---------- the picker module: loaded once, its calls queued until it arrives ---------- */
  var PICKER_V = '4030bb84'; /* stamp.py writes the first 8 hex of the sha1 of theme-picker.js here */
  var pk = { q: [], loading: false, api: null };
  function loadPicker() {
    if (pk.api || pk.loading) return;
    pk.loading = true;
    var s = document.createElement('script');
    s.src = '/assets/theme-picker.js?v=' + PICKER_V;
    s.async = true;
    s.onerror = function () { pk.loading = false; };
    (document.head || root).appendChild(s);
  }
  function withPicker(fn) {
    if (pk.api) { try { fn(pk.api); } catch (e) { report(e); } return; }
    pk.q.push(fn);
    loadPicker();
  }
  PS._pickerReady = function (api) {
    pk.api = api;
    var q = pk.q; pk.q = [];
    q.forEach(function (fn) { try { fn(api); } catch (e) { report(e); } });
  };

  /* ---------- apply: data-theme, data-tone, storage, the dial's disc, the room, the browser chrome, 'pstheme' ----------
     A preview (hover or focus in the picker) shows another light without writing storage. */
  var committed = null, dialBtn = null;
  function apply(key, preview) {
    if (key === 'daylight') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', key);
    if (themeOf(key).dark) root.setAttribute('data-tone', 'dark'); else root.removeAttribute('data-tone');
    if (!preview) {
      try { localStorage.setItem(KEY, key === 'daylight' ? '' : key); } catch (e) {}
      committed = key;
    }
    if (dialBtn) dialBtn.querySelector('.tb-disc').style.background = disc(key, true);
    if (pk.api) pk.api.room(key); else if (themeOf(key).live) loadPicker();
    themeColorSync();
    try { window.dispatchEvent(new CustomEvent('pstheme', { detail: key })); } catch (e) {}
  }
  function themeColorSync() {
    try {
      var meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }
      /* a gated room (the World's gate) paints the browser chrome in its dark stage */
      var body = document.body, gated = !!(body && body.classList.contains('locked'));
      var cs = getComputedStyle(body || root);
      meta.content = cs.getPropertyValue(gated ? '--dark' : '--paper').trim() || (gated ? '#0E0D0C' : '#F6F4ED');
    } catch (e) {}
  }
  PS.themeColor = themeColorSync;
  addEventListener('labopen', themeColorSync);

  /* ---------- slider fill and hover prefetch ---------- */
  function sliderFill(el) {
    var min = +el.min || 0, max = +el.max || 100, v = +el.value;
    el.style.setProperty('--sfill', ((v - min) / (max - min || 1) * 100).toFixed(1) + '%');
  }
  document.addEventListener('input', function (e) { if (e.target && e.target.type === 'range') sliderFill(e.target); }, true);
  var prefetched = {}, specRules = false;
  try { specRules = !!(HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')); } catch (e) {}
  if (!specRules) document.addEventListener('mouseover', function (e) {
    var link = e.target.closest && e.target.closest('a[href^="/"]');
    if (!link) return;
    var href = link.getAttribute('href').split('#')[0];
    if (!href || prefetched[href]) return;
    prefetched[href] = 1;
    var l = document.createElement('link');
    l.rel = 'prefetch'; l.href = href;
    document.head.appendChild(l);
  }, { passive: true });

  /* ================================================================
     THE DIAL'S HOME. A 44px target everywhere.
       1023px and below, and any phone held sideways: the first rendered [data-dial-dock] on the page (the Lab's
         Register, the World's locnav); without one, the nav (before Menu on phones, after the links on tablets).
         It never floats there.
       1024px and up: the nav's last slot while the nav is on screen; then the dock if the page has one; otherwise it
         floats bottom-left, shown only on the first screen and near the end, never on an upward scroll mid-page.
     ================================================================ */
  var navEl = null, navLi = null, navM = null, navIn = true;
  function dockSlot() {
    var d = document.querySelectorAll('[data-dial-dock]');
    for (var i = 0; i < d.length; i++) if (d[i].getClientRects().length) return d[i];
    return null;
  }
  function dialHome() {
    var dock = dockSlot();
    if (!mqWide.matches || mqLand.matches) return dock || (compact() ? navM : navLi) || null;
    return (navIn && navLi) || dock || null;
  }
  function placeDial() {
    var btn = dialBtn;
    if (!btn) return;
    var home = dialHome(), to = home || document.body;
    if (btn.parentNode !== to) {
      var had = document.activeElement === btn;
      to.appendChild(btn);
      if (had) { try { btn.focus({ preventScroll: true }); } catch (e) {} }
    }
    btn.classList.toggle('is-docked', !!home);
    root.classList.toggle('tb-docked', !!home);
    if (home) root.classList.remove('tb-rest'); else floatRest();
    if (pk.api) pk.api.place();
  }
  PS.dial = { place: placeDial, el: function () { return dialBtn; } };
  /* the floating dial (1024px and up, no dock, nav off screen): the first screen and the last 160px only */
  function floatRest() {
    var btn = dialBtn;
    if (!btn || btn.classList.contains('is-docked')) return;
    var y = window.scrollY || 0, held = btn.classList.contains('open') || (document.activeElement === btn && btn.matches(':focus-visible'));
    var show = held || y < (innerHeight || 800) || y + innerHeight > root.scrollHeight - 160;
    if (root.classList.contains('tb-rest') === show) root.classList.toggle('tb-rest', !show);
  }

  /* ---------- the phone header: one 56px row (48px sideways), built from the page's own nav ---------- */
  function buildMenu() {
    var nav = navEl, ul = null;
    if (!nav || nav.querySelector('.nav-menu')) return;
    for (var i = 0; i < nav.children.length; i++) if (nav.children[i].tagName === 'UL') { ul = nav.children[i]; break; }
    if (!ul) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-menu';
    btn.textContent = 'Menu';
    navM = document.createElement('span');
    navM.className = 'nav-dial-m';
    nav.appendChild(navM);
    nav.appendChild(btn);
    var sheet = document.createElement('div');
    sheet.className = 'sheet sheet--menu';
    sheet.id = 'psMenu';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-label', 'Menu');
    sheet.innerHTML = '<div class="sheet-head"><span class="sheet-mark" aria-hidden="true">P<i>.</i>S<i>.</i></span>' +
      '<button type="button" class="sheet-close">Close</button></div>';
    var list = document.createElement('ul');
    list.className = 'sheet-list';
    each(ul.querySelectorAll('a[href]'), function (a) {
      var c = a.cloneNode(true), li = document.createElement('li');
      c.removeAttribute('class'); c.removeAttribute('id'); c.removeAttribute('style');
      li.appendChild(c);
      list.appendChild(li);
    });
    /* the last row opens the light picker */
    var lli = document.createElement('li'), lr = document.createElement('button');
    lli.className = 'sheet-light';
    lr.type = 'button';
    lr.innerHTML = '<span class="sl-disc" aria-hidden="true"></span><span>The light</span><span class="n"></span>';
    lli.appendChild(lr);
    list.appendChild(lli);
    sheet.appendChild(list);
    document.body.appendChild(sheet);
    nav.classList.add('nav--menu');
    var ctl = makeSheet(sheet, { opener: btn });
    sheet.querySelector('.sheet-close').addEventListener('click', function () { ctl.close(); });
    var paintLight = function () {
      var k = current();
      lr.querySelector('.n').textContent = themeOf(k).name;
      lr.querySelector('.sl-disc').style.background = disc(k, true);
      lr.setAttribute('aria-label', 'The light: ' + themeOf(k).name + '. Pick a theme');
    };
    paintLight();
    window.addEventListener('pstheme', paintLight);
    lr.addEventListener('pointerdown', loadPicker, { passive: true });
    lr.addEventListener('click', function (e) {
      e.stopPropagation();
      ctl.close(true);
      if (!dialBtn) return;
      try { dialBtn.focus({ preventScroll: true }); } catch (x) {}
      dialBtn.click();
    });
    var mq = mm(Q.phone + ', ' + Q.land);
    onMq(mq, function () { if (!mq.matches) ctl.close(true); });
  }

  /* ---------- the nav: on phones (and sideways) it leaves on the way down and returns the moment you scroll up.
     --nav-b on the root is the y of its visible lower edge (0 when it is away or not sticky): a reading hairline or a
     sub-bar sits at top: var(--nav-b). 'psnav' fires on window when it changes, detail {shown, b}. ---------- */
  function watchScroll() {
    var nav = document.querySelector('.nav--glass'), hideQ = mm(Q.phone + ', ' + Q.land);
    var lastY = window.scrollY || 0, ticking = false, stuck = 0, lastB = '';
    function writeB() {
      var v = (nav && !nav.classList.contains('nav-away') ? stuck : 0) + 'px';
      if (v === lastB) return;
      lastB = v;
      root.style.setProperty('--nav-b', v);
      try { window.dispatchEvent(new CustomEvent('psnav', { detail: { shown: v !== '0px', b: parseFloat(v) } })); } catch (e) {}
    }
    function measure() {
      if (!nav) { writeB(); return; }
      var cs = getComputedStyle(nav);
      stuck = cs.position === 'sticky' || cs.position === 'fixed' ? Math.max(0, Math.round(nav.offsetHeight + (parseFloat(cs.top) || 0))) : 0;
      writeB();
    }
    function update() {
      ticking = false;
      var y = window.scrollY || 0, dy = y - lastY;
      if (dialBtn && !dialBtn.classList.contains('is-docked')) floatRest();
      if (Math.abs(dy) < 8) return;
      lastY = y;
      var down = dy > 0;
      if (nav) {
        var away = nav.classList.contains('nav-away');
        if (hideQ.matches && down && y > 120 && !nav.contains(document.activeElement) && !root.classList.contains('sheet-open')) {
          if (!away) { nav.classList.add('nav-away'); writeB(); }
        } else if ((!down || y <= 120 || !hideQ.matches) && away) { nav.classList.remove('nav-away'); writeB(); }
      }
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; raf(update); } }, { passive: true });
    if (nav) nav.addEventListener('focusin', function () { if (nav.classList.contains('nav-away')) { nav.classList.remove('nav-away'); writeB(); } });
    onMq(hideQ, function () { if (!hideQ.matches && nav) nav.classList.remove('nav-away'); measure(); });
    var rzT = 0;
    addEventListener('resize', function () { clearTimeout(rzT); rzT = setTimeout(measure, 150); }, { passive: true });
    measure();
  }

  /* ---------- essays: remember what has been read to the end ---------- */
  function trackRead() {
    var end = document.querySelector('.pxe-essay hr');
    if (!end || !hasIO) return;
    var io = new IntersectionObserver(function (es) {
      if (!es.some(function (x) { return x.isIntersecting; })) return;
      io.disconnect();
      try {
        var slug = location.pathname.replace(/\.html$/, '').split('/').pop();
        if (!slug) return;
        var list = [];
        try { list = JSON.parse(localStorage.getItem('psReadEssays') || '[]'); } catch (e) {}
        if (!Array.isArray(list)) list = [];
        if (list.indexOf(slug) < 0) { list.push(slug); localStorage.setItem('psReadEssays', JSON.stringify(list)); }
      } catch (e) {}
    });
    io.observe(end);
  }

  /* ---------- build: the static overlay, the dial, the menu, the dock, the nav ---------- */
  function build() {
    var fx = document.createElement('div'); /* static overlays (film grain, scanlines) live in CSS on this */
    fx.id = 'themeFx';
    fx.setAttribute('aria-hidden', 'true');
    document.body.appendChild(fx);
    committed = current();

    var btn = dialBtn = document.createElement('button');
    btn.id = 'themeBtn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Change the light: pick a theme');
    btn.setAttribute('aria-controls', 'themePanel');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="tb-disc" aria-hidden="true"></span>';
    btn.querySelector('.tb-disc').style.background = disc(current(), true);
    /* five presses inside 2.2s, by pointer or keyboard, find the hidden room; every press before the picker
       arrives is queued and replayed in order */
    var clicks = [];
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var now = Date.now(), kb = e.detail === 0;
      clicks.push(now);
      clicks = clicks.filter(function (c) { return now - c < 2200; });
      if (clicks.length >= 5 && !voidFound) {
        voidFound = true;
        try { localStorage.setItem(VKEY, '1'); } catch (x) {}
        withPicker(function (P) { P.findVoid(); });
        return;
      }
      withPicker(function (P) { P.toggle(kb); });
    });
    ['pointerdown', 'focus', 'keydown'].forEach(function (t) { btn.addEventListener(t, loadPicker, { passive: true }); });
    btn.addEventListener('blur', function () { setTimeout(floatRest, 0); });

    navEl = document.querySelector('nav.nav');
    var ul = null;
    if (navEl) for (var i = 0; i < navEl.children.length; i++) if (navEl.children[i].tagName === 'UL') { ul = navEl.children[i]; break; }
    if (ul) { navLi = document.createElement('li'); navLi.className = 'nav-dial'; ul.appendChild(navLi); }
    buildMenu();
    document.body.appendChild(btn);
    placeDial();
    if (hasIO && navEl) new IntersectionObserver(function (es) {
      var v = es[es.length - 1].isIntersecting;
      if (v !== navIn) { navIn = v; placeDial(); }
    }).observe(navEl);
    [mqWide, mqLand, mqPhone].forEach(function (q) { onMq(q, placeDial); });
    var pT = 0;
    addEventListener('resize', function () { clearTimeout(pT); pT = setTimeout(placeDial, 200); }, { passive: true });
    addEventListener('load', placeDial);

    themeColorSync();
    /* the World's gate: repaint the browser chrome the moment the room is entered, then stop watching */
    if (document.body.classList.contains('locked') && 'MutationObserver' in window) {
      var gateMo = new MutationObserver(function () {
        if (document.body.classList.contains('locked')) return;
        gateMo.disconnect();
        themeColorSync();
      });
      gateMo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
    each(document.querySelectorAll('input[type=range]'), sliderFill);
    watchScroll();
    trackRead();
    /* a living room needs its canvas now; otherwise the picker arrives when the page is idle */
    if (themeOf(current()).live) loadPicker();
    else addEventListener('load', function () {
      var c = navigator.connection;
      if (c && (c.saveData || /2g/.test(c.effectiveType || ''))) return;
      setTimeout(function () { idle(loadPicker, 3000); }, 2000);
    });
  }

  /* what theme-picker.js reads from the core */
  PS._theme = {
    THEMES: THEMES, themeOf: themeOf, current: current, disc: disc, apply: apply, swipe: swipe, compact: compact,
    committed: function () { return committed; }, voidFound: function () { return voidFound; },
    btn: function () { return dialBtn; }, floatRest: floatRest, place: placeDial
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
