/* P.S. 3D v2, window.PS3D: a hand-written WebGL engine for lit paper models in true isometric. ES5, no dependencies, no build.
   core.js holds math, motion, theme, light, materials, geometry, the scene graph, cameras, views, labels and the loader.
   gl.js and c2d.js draw (c2d.js also writes posters); explorer.js, hero.js and models/<id>.js arrive through PS3D.load.
   Everything v1 still works. v2 adds:
     light      a hemisphere ambient + key + fill, solved per theme so a paper box prints --m-top / --m-left / --m-right exactly
                (gl.js and c2d.js run the same sums); ground AO on the bottom 18% of every part
     materials  a mat may carry kind: 'paper' | 'plaster' | 'metal' | 'glass' | 'foil' | 'liquid' | 'ink' (P.MATS has a preset
                of each name; 'foil' is now an accent face). A part on a ground layer (layer < 0) with no kind is plaster.
                def.mat sets a model's default mat (machines: 'metal')
     shadows    on by default: a soft contact shadow under every opaque part, on whatever it stands on, and a cast shadow along
                the key light. View option shadow: false (or v.shadow = null) turns them off; v.shadow = {a} scales them
     textures   a face option tex: {key, src, focal, mono, aspect, draw(ctx, w, h, img, tex), svg(w, h, developed)} on a box's
                top face or a poly with uv; node.dev (0..1) develops a mono plate to colour
     P.frame(view, {fill: .78})              the default framing for the explorer, the stage and the hero
     P.light(view, {mode: 'pointer', idle})  the pointer light (Stack and Window only) and the idle breath
     P.labels(view, host, {column, avoid, pill}) one label layer: kept apart, off the drawing, on leaders when moved
     View options reflect: true (the Window's floor reflection), shadow: false; v.xray shows hidden lines (explode)
     PS3D.debug.poster(target, {w, h, surface, rest, plates, label}) -> a registered SVG poster (needs c2d.js)
   Edges print by class: silhouettes 1.75px at .9 (on dark 1.6px at .85, on-dark), creases over 30 degrees .9px at .38, drawn
   details as authored at .55, all scaled by clamp(min(w, h) / 560, .8, 1.3). */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.PS3D && W.PS3D.v >= 2) return;
  var P = W.PS3D = { v: 2, _R: {} };
  var M = Math, RAD = M.PI / 180, INF = 1e30;
  var QS = location.search, FORCE2D = /[?&]ps3d=2d\b/.test(QS), GL1 = /[?&]ps3d=gl1\b/.test(QS), DEBUG = /[?&]ps3d=debug\b/.test(QS);
  var TOUCH = !!(W.matchMedia && matchMedia('(pointer: coarse)').matches);
  function now() { return W.performance && performance.now ? performance.now() : Date.now(); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function each(a, f) { for (var i = 0; a && i < a.length; i++) f(a[i], i); }
  function ext(a, b) { if (b) for (var k in b) if (Object.prototype.hasOwnProperty.call(b, k)) a[k] = b[k]; return a; }
  var warned = {};
  function warn(tag, e) { if (warned[tag]) return; warned[tag] = 1; try { console.warn('[ps3d] ' + tag, e || ''); } catch (x) {} }
  P._warn = warn; P._ext = ext; P._clamp = clamp; P._now = now; P._touch = TOUCH;

  /* ---------------- math ---------------- */
  var v3 = P.v3 = {
    add: function (a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; },
    sub: function (a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; },
    scale: function (a, s) { return [a[0] * s, a[1] * s, a[2] * s]; },
    dot: function (a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; },
    cross: function (a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; },
    len: function (a) { return M.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); },
    norm: function (a) { var l = v3.len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
    lerp: function (a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  };
  function m4() { var m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; }
  var TMP = new Float32Array(16);
  var m4x = P.m4 = {
    create: m4,
    mul: function (a, b, o) {
      o = o || new Float32Array(16);
      for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) {
        TMP[j * 4 + i] = a[i] * b[j * 4] + a[4 + i] * b[j * 4 + 1] + a[8 + i] * b[j * 4 + 2] + a[12 + i] * b[j * 4 + 3];
      }
      o.set(TMP); return o;
    },
    persp: function (fovy, asp, n, f, o) {
      o = o || new Float32Array(16); o.fill(0);
      var t = 1 / M.tan(fovy / 2), nf = 1 / (n - f);
      o[0] = t / asp; o[5] = t; o[10] = (f + n) * nf; o[11] = -1; o[14] = 2 * f * n * nf; return o;
    },
    ortho: function (l, r, b, t, n, f, o) {
      o = o || new Float32Array(16); o.fill(0);
      var lr = 1 / (l - r), bt = 1 / (b - t), nf = 1 / (n - f);
      o[0] = -2 * lr; o[5] = -2 * bt; o[10] = 2 * nf; o[12] = (l + r) * lr; o[13] = (t + b) * bt; o[14] = (f + n) * nf; o[15] = 1;
      return o;
    },
    inv: function (a, o) {
      o = o || new Float32Array(16);
      var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],
        b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32,
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
      if (!det) return null;
      det = 1 / det;
      o[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det; o[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
      o[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det; o[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
      o[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det; o[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
      o[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det; o[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
      o[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det; o[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
      o[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det; o[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
      o[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det; o[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
      o[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det; o[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
      return o;
    },
    compose: function (p, q, s, o) {
      o = o || new Float32Array(16);
      var x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z,
        xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
      o[0] = (1 - (yy + zz)) * s[0]; o[1] = (xy + wz) * s[0]; o[2] = (xz - wy) * s[0]; o[3] = 0;
      o[4] = (xy - wz) * s[1]; o[5] = (1 - (xx + zz)) * s[1]; o[6] = (yz + wx) * s[1]; o[7] = 0;
      o[8] = (xz + wy) * s[2]; o[9] = (yz - wx) * s[2]; o[10] = (1 - (xx + yy)) * s[2]; o[11] = 0;
      o[12] = p[0]; o[13] = p[1]; o[14] = p[2]; o[15] = 1;
      return o;
    },
    tp: function (m, v) {
      var x = v[0], y = v[1], z = v[2], w = m[3] * x + m[7] * y + m[11] * z + m[15] || 1;
      return [(m[0] * x + m[4] * y + m[8] * z + m[12]) / w, (m[1] * x + m[5] * y + m[9] * z + m[13]) / w, (m[2] * x + m[6] * y + m[10] * z + m[14]) / w];
    },
    tv: function (m, v) {
      var x = v[0], y = v[1], z = v[2];
      return [m[0] * x + m[4] * y + m[8] * z, m[1] * x + m[5] * y + m[9] * z, m[2] * x + m[6] * y + m[10] * z];
    },
    /* the normal matrix of an R*S world matrix, as 9 numbers: M3 * diag(1/s^2) */
    nrm: function (m, o) {
      o = o || new Float32Array(9);
      for (var c = 0; c < 3; c++) {
        var a = m[c * 4], b = m[c * 4 + 1], d = m[c * 4 + 2], s2 = a * a + b * b + d * d || 1;
        o[c * 3] = a / s2; o[c * 3 + 1] = b / s2; o[c * 3 + 2] = d / s2;
      }
      return o;
    }
  };
  var q = P.q = {
    axis: function (ax, deg) { var h = deg * RAD / 2, s = M.sin(h); return [ax[0] * s, ax[1] * s, ax[2] * s, M.cos(h)]; },
    mul: function (a, b) {
      return [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
        a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
    },
    euler: function (x, y, z) { return q.mul(q.mul(q.axis([0, 1, 0], y || 0), q.axis([1, 0, 0], x || 0)), q.axis([0, 0, 1], z || 0)); },
    y: function (deg) { return q.axis([0, 1, 0], deg); },
    slerp: function (a, b, t) {
      var c = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3], s = 1, k0, k1;
      if (c < 0) { c = -c; s = -1; }
      if (c > .9995) { k0 = 1 - t; k1 = t * s; } else { var o = M.acos(c), so = M.sin(o); k0 = M.sin((1 - t) * o) / so; k1 = M.sin(t * o) / so * s; }
      var r = [a[0] * k0 + b[0] * k1, a[1] * k0 + b[1] * k1, a[2] * k0 + b[2] * k1, a[3] * k0 + b[3] * k1], l = M.sqrt(r[0] * r[0] + r[1] * r[1] + r[2] * r[2] + r[3] * r[3]) || 1;
      return [r[0] / l, r[1] / l, r[2] / l, r[3] / l];
    }
  };

  /* ---------------- motion: easing, tweens, springs, timeline, one heart ---------------- */
  function bezier(x1, y1, x2, y2) {
    function cx(t) { return ((1 - 3 * x2 + 3 * x1) * t + (3 * x2 - 6 * x1)) * t * t + 3 * x1 * t; }
    function cy(t) { return ((1 - 3 * y2 + 3 * y1) * t + (3 * y2 - 6 * y1)) * t * t + 3 * y1 * t; }
    function dx(t) { return 3 * (1 - 3 * x2 + 3 * x1) * t * t + 2 * (3 * x2 - 6 * x1) * t + 3 * x1; }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x, i, e, d;
      for (i = 0; i < 4; i++) { e = cx(t) - x; if (M.abs(e) < 1e-5) return cy(t); d = dx(t); if (M.abs(d) < 1e-6) break; t -= e / d; }
      if (t < 0 || t > 1 || M.abs(cx(t) - x) >= 1e-5) {
        var lo = 0, hi = 1; t = x;
        for (i = 0; i < 40; i++) { e = cx(t); if (M.abs(e - x) < 1e-5) break; if (e < x) lo = t; else hi = t; t = (lo + hi) / 2; }
      }
      return cy(t);
    };
  }
  P.bezier = bezier;
  var EASE = { out: bezier(.16, 1, .3, 1), io: bezier(.65, 0, .35, 1), 'in': bezier(.7, 0, .84, 0), curtain: bezier(.76, 0, .24, 1), linear: function (t) { return t; } };
  P.EASE_CSS = { out: 'cubic-bezier(.16,1,.3,1)', io: 'cubic-bezier(.65,0,.35,1)', 'in': 'cubic-bezier(.7,0,.84,0)' };
  function easeOf(e) {
    if (typeof e === 'function') return e;
    if (e && e.length === 4) return bezier(e[0], e[1], e[2], e[3]);
    var pm = W.PS_MOTION && W.PS_MOTION.ease, n = e || 'out';
    if (pm && typeof pm[n] === 'function') return pm[n];
    return EASE[n] || EASE.out;
  }
  P._easeOf = easeOf;
  Object.defineProperty(P, 'ease', { get: function () {
    var pm = W.PS_MOTION && W.PS_MOTION.ease;
    return pm && typeof pm.out === 'function' ? pm : EASE;
  } });

  var mq = W.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null, RFORCE = null, MSUB = [];
  P.reduced = function (force) {
    if (arguments.length) { RFORCE = force == null ? null : !!force; each(MSUB, function (f) { f(P.reduced()); }); }
    return RFORCE != null ? RFORCE : !!(mq && mq.matches);
  };
  function sub(list, fn) { list.push(fn); return function () { var i = list.indexOf(fn); if (i >= 0) list.splice(i, 1); }; }
  P.onMotion = function (fn) { return sub(MSUB, fn); };
  if (mq) { var mqf = function () { each(MSUB, function (f) { f(P.reduced()); }); }; if (mq.addEventListener) mq.addEventListener('change', mqf); else if (mq.addListener) mq.addListener(mqf); }

  var ANIMS = [], RAF = 0, LAST = 0, ON = !D.hidden, FR = [], VIEWS = [];
  var raf = W.requestAnimationFrame ? function (f) { return W.requestAnimationFrame(f); } : function (f) { return setTimeout(function () { f(now()); }, 16); };
  var caf = W.cancelAnimationFrame || clearTimeout;
  function kick() { if (!RAF && ON) RAF = raf(frame); }
  P._kick = kick;
  function addAnim(a) { ANIMS.push(a); kick(); return a; }
  P._anim = addAnim;
  function stepAnims(dt, ts) {
    for (var i = 0; i < ANIMS.length; i++) {
      var a = ANIMS[i], alive = false;
      try { alive = a.step(dt, ts); } catch (e) { warn('anim', e); }
      if (!alive) { ANIMS.splice(i, 1); i--; }
    }
  }
  function frame(ts) {
    RAF = 0; ts = ts || now();
    var dt = LAST ? clamp((ts - LAST) / 1000, 0, 1 / 30) : 1 / 60;
    LAST = ts;
    stepAnims(dt, ts);
    var more = ANIMS.length > 0, drew = 0;
    for (var i = 0; i < VIEWS.length; i++) {
      var v = VIEWS[i];
      if (v.paused || !v.vis || !v.R || !v.live) continue;
      if (v.ticks.length) {
        more = true; v.dirty = true;
        for (var j = 0; j < v.ticks.length; j++) { try { v.ticks[j](dt, ts); } catch (e) { warn('tick', e); } }
      }
      if (v.dirty) { var t0 = now(); v.render(); v._qual(now() - t0, ts); drew++; }
    }
    if (drew) { FR.push(ts); if (FR.length > 240) FR.splice(0, FR.length - 240); }
    if (more) kick(); else LAST = 0;
  }
  function pageOff() { ON = false; if (RAF) { caf(RAF); RAF = 0; } LAST = 0; }
  /* back from a hidden tab: every live view on screen draws again, so a page opened in the background never shows a stage
     whose poster has gone and whose drawing has not */
  function pageOn() { ON = true; each(VIEWS, function (v) { if (v.vis && v.live) v.dirty = true; }); kick(); }
  D.addEventListener('visibilitychange', function () { if (D.hidden) pageOff(); else pageOn(); });
  W.addEventListener('pagehide', pageOff);
  W.addEventListener('pageswap', pageOff);
  W.addEventListener('pageshow', function (e) { if (e.persisted || !D.hidden) pageOn(); });

  P.tween = function (o) {
    var from = o.from == null ? 0 : o.from, to = o.to == null ? 1 : o.to, arr = typeof from === 'object';
    var dur = o.dur == null ? 320 : o.dur, delay = o.delay || 0, e = easeOf(o.ease), t = 0, dead = false;
    function val(k) {
      if (!arr) return from + (to - from) * k;
      var r = []; for (var i = 0; i < from.length; i++) r[i] = from[i] + (to[i] - from[i]) * k; return r;
    }
    function fin() { dead = true; if (o.update) o.update(val(1), 1); if (o.done) o.done(); }
    if (P.reduced() || (dur <= 0 && delay <= 0)) { fin(); return function () {}; }
    addAnim({ step: function (dt) {
      if (dead) return false;
      t += dt * 1000;
      if (t < delay) return true;
      var k = dur > 0 ? clamp((t - delay) / dur, 0, 1) : 1;
      if (k >= 1) { fin(); return false; }
      if (o.update) o.update(val(e(k)), k);
      return true;
    } });
    return function () { dead = true; };
  };

  function Spring(o) {
    this.k = o.k || 170; this.c = o.c == null ? 26 : o.c; this.m = o.m || 1;
    this.x = o.x || 0; this.v = o.v || 0; this.target = o.target == null ? this.x : o.target;
    this.eps = o.eps || 5e-4; this.onUpdate = o.onUpdate; this.onRest = o.onRest; this.on = false; this._t = 0;
    if (this.x !== this.target || this.v) { if (P.reduced()) this.snap(this.target); else this._wake(); }
  }
  Spring.prototype = {
    set: function (t) { this.target = t; if (P.reduced()) return this.snap(t); this._wake(); return this; },
    snap: function (x) { this.x = this.target = x; this.v = 0; this.on = false; this._t++; if (this.onUpdate) this.onUpdate(x, 0); return this; },
    impulse: function (v) { if (P.reduced()) return this; this.v += v; this._wake(); return this; },
    stop: function () { this.on = false; this._t++; this.v = 0; return this; },
    _wake: function () {
      if (this.on) return;
      var s = this, tok = ++s._t; s.on = true;
      addAnim({ step: function (dt) { return s._t === tok && s._step(dt); } });
    },
    _step: function (dt) {
      if (!this.on) return false;
      var n = M.min(8, M.max(1, M.ceil(dt * 120 - 1e-6))), h = dt / n;
      for (var i = 0; i < n; i++) { var a = (-this.k * (this.x - this.target) - this.c * this.v) / this.m; this.v += a * h; this.x += this.v * h; }
      var rest = M.abs(this.x - this.target) < this.eps && M.abs(this.v) < this.eps;
      if (rest) { this.x = this.target; this.v = 0; this.on = false; }
      if (this.onUpdate) this.onUpdate(this.x, this.v);
      if (rest && this.onRest) this.onRest(this.x);
      return !rest;
    }
  };
  P.spring = function (o) { return new Spring(o || {}); };

  /* ---------------- theme ---------------- */
  var NAMES = { paper: 'paper', card: 'card', ink: 'ink', ink2: 'ink-2', muted: 'muted', accent: 'accent', dark: 'dark', dark2: 'dark-2', onDark: 'on-dark', onDark2: 'on-dark-2' };
  /* the material tokens a page may set (site.css tokens B); absent ones are derived in lit() */
  var MNAMES = { mTop: 'm-top', mLeft: 'm-left', mRight: 'm-right', mPlaster: 'm-plaster', mShadow: 'm-shadow', mSil: 'm-sil', mFoil: 'm-foil', mMetalHi: 'm-metal-hi', mMetalLo: 'm-metal-lo' };
  var FALL = { paper: '#F6F4ED', card: '#FCFBF6', ink: '#121110', ink2: '#55524B', muted: '#8B877C', accent: '#FF4D00', dark: '#0E0D0C', dark2: '#171614', onDark: '#F4F1E8', onDark2: '#CBC7BA' };
  /* rgba of a computed colour: [r, g, b] in 0..255 plus a in 0..1 at [3] */
  function rgbaOf(str) {
    str = String(str || '').trim();
    if (str[0] === '#') {
      var h = str.slice(1); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
    }
    var m = str.match(/-?\d*\.?\d+(e-?\d+)?/g) || [];
    if (/^color\(srgb/.test(str)) return [M.round(+m[0] * 255), M.round(+m[1] * 255), M.round(+m[2] * 255), m.length > 3 ? +m[3] : 1];
    return m.length >= 3 ? [M.round(+m[0]), M.round(+m[1]), M.round(+m[2]), m.length > 3 ? +m[3] : 1] : null;
  }
  function rgbOf(str) { var c = rgbaOf(str); return c ? [c[0], c[1], c[2]] : null; }
  P._rgbOf = rgbOf; P._rgbaOf = rgbaOf;
  var THEME = null, THEME255 = null, TSUB = [];
  /* tokens resolve where the view lives: inside a .band--dark the ink tokens are re-pointed, so a probe reads them in place */
  function readTheme(ctx) {
    var o = {}, o2 = {}, k, host = ctx && ctx.isConnected ? ctx : D.body;
    o.m = {};
    if (host && W.getComputedStyle) {
      var pr = D.createElement('i');
      pr.setAttribute('aria-hidden', 'true');
      pr.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none';
      host.appendChild(pr);
      for (k in NAMES) { pr.style.color = 'var(--' + NAMES[k] + ')'; var c = rgbOf(getComputedStyle(pr).color); o2[k] = c || rgbOf(FALL[k]); }
      for (k in MNAMES) {
        pr.style.color = 'var(--' + MNAMES[k] + ', rgb(1, 2, 3))';
        var cm = rgbaOf(getComputedStyle(pr).color);
        o.m[k] = cm && !(cm[0] === 1 && cm[1] === 2 && cm[2] === 3) ? [cm[0] / 255, cm[1] / 255, cm[2] / 255, cm[3]] : null;
      }
      host.removeChild(pr);
    } else for (k in NAMES) o2[k] = rgbOf(FALL[k]);
    for (k in o2) o[k] = [o2[k][0] / 255, o2[k][1] / 255, o2[k][2] / 255];
    if (!ctx || host === D.body) THEME255 = o2;
    return o;
  }
  P.theme = function () { return THEME || (THEME = readTheme()); };
  P.onTheme = function (fn) { return sub(TSUB, fn); };
  function lum(c) { var f = function (x) { return x <= .03928 ? x / 12.92 : M.pow((x + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (M.max(x, y) + .05) / (M.min(x, y) + .05); }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  P._mix = mix; P._lum = lum; P._contrast = contrast;

  /* ---------------- light ----------------
     A studio rig that travels with the camera: a key at [-.45, .8, .4] and a fill at [.6, .2, .5] in camera space, over a
     hemisphere ambient. Shading (gl.js, c2d.js and the posters run the same sums):
       light(n) = mix(gnd, sky, .5 + .5 n.y) * K.x + key * max(n.L, 0) * K.y + fill * max(n.F, 0) * K.z
       ao       = mix(K.w, 1, smoothstep(gy, gy + aoh, y))        gy and aoh: the bottom 18% of each part's bounds
     The sky, ground and key colours are solved per theme so that a paper box in the canonical isometric view prints its top,
     lit side and shade side at the page's --m-top, --m-left and --m-right (or the derived values below) exactly. */
  var UK = [.62, .42, .18, .78], KEY0 = v3.norm([-.45, .8, .4]), FILL0 = v3.norm([.6, .2, .5]), FILLW = .12;
  var WHITE = [1, 1, 1], UMBER = [116 / 255, 101 / 255, 74 / 255];
  P.LIGHT = { K: UK, key: KEY0, fill: FILL0 };
  function camBasis(yaw, pitch) {
    var y = yaw * RAD, p = pitch * RAD, cp = M.cos(p), sp = M.sin(p), sy = M.sin(y), cy = M.cos(y);
    var d = [cp * sy, sp, cp * cy], r = [cy, 0, -sy];
    return { d: d, r: r, u: v3.cross(d, r) };
  }
  function toWorld(b, c) { return v3.norm([b.r[0] * c[0] + b.u[0] * c[1] + b.d[0] * c[2], b.r[1] * c[0] + b.u[1] * c[1] + b.d[1] * c[2], b.r[2] * c[0] + b.u[2] * c[1] + b.d[2] * c[2]]); }
  /* camera-space light, turned about the camera's up axis by yaw degrees (the pointer light) */
  function rotY(c, deg) { if (!deg) return c; var a = deg * RAD, ca = M.cos(a), sa = M.sin(a); return [c[0] * ca + c[2] * sa, c[1], -c[0] * sa + c[2] * ca]; }
  P._rotY = rotY;
  var CAN = (function () {
    var b = camBasis(45, 35.264), L = toWorld(b, KEY0), F = toWorld(b, FILL0), dt = function (n, l) { return M.max(0, v3.dot(n, l)); };
    var nT = [0, 1, 0], nL = [0, 0, 1], nR = [1, 0, 0];
    return { kt: dt(nT, L), kl: dt(nL, L), kr: dt(nR, L), ft: dt(nT, F), fl: dt(nL, F), fr: dt(nR, F) };
  })();
  function solve(base, top, left, right) {
    var sky = [], gnd = [], key = [], fill = [], c = CAN;
    for (var i = 0; i < 3; i++) {
      var b = M.max(base[i], .02), Rt = top[i] / b, Rl = left[i] / b, Rr = right[i] / b, F = FILLW;
      var K = M.max(0, (Rl - Rr - UK[2] * F * (c.fl - c.fr)) / (UK[1] * M.max(1e-3, c.kl - c.kr)));
      var S = M.max(.02, (Rt - UK[1] * K * c.kt - UK[2] * F * c.ft) / UK[0]);
      var G = M.max(0, 2 * (Rl - UK[1] * K * c.kl - UK[2] * F * c.fl) / UK[0] - S);
      sky.push(S); gnd.push(G); key.push(K); fill.push(F);
    }
    return { sky: sky, gnd: gnd, key: key, fill: fill };
  }
  /* material kinds. uMat: [spec, shininess, rim, mode]; mode 1 metal, 2 glass, 3 liquid, 4 foil */
  var KIND = P.KIND = { paper: 0, plaster: 1, metal: 2, glass: 3, foil: 4, liquid: 5, ink: 6, flat: 7 };
  var KMAT = [[0, 1, 0, 0], [0, 1, 0, 0], [.45, 28, .2, 1], [.5, 60, 0, 2], [.6, 40, .1, 4], [.25, 30, 0, 3], [.3, 24, .25, 0], [0, 1, 0, 0]];
  P._kmat = KMAT;
  /* everything a view shades with, cached on the view until the theme changes */
  function lit(v) {
    if (v._lit) return v._lit;
    var t = v._th || (v._th = readTheme(v.canvas && v.canvas.parentNode)), dk = v.surface === 'dark';
    var bg = dk ? t.dark : t.paper, hi = dk ? t.onDark : t.ink, dark = lum(bg) < .2, m = t.m || {};
    function tok(k, def, tone) {
      var c = m[k];
      if (!c) return def;
      if (tone && (lum(c) < .2) !== dark) return def;   /* a token from the other tone (a light card inside a dark stage) is not ours */
      return [c[0], c[1], c[2]];
    }
    var top, left, right, plaster, base, o = { dark: dark, bg: bg, hi: hi };
    /* on a dark ground the ladder is .20 / .13 / .08 of the way to the light: a top face holds 1.4:1 or more against the stage's own pool */
    if (dark) { top = mix(bg, hi, .2); left = mix(bg, hi, .13); right = mix(bg, hi, .08); plaster = mix(bg, hi, .05); }
    else { top = mix(bg, WHITE, .45); left = mix(bg, UMBER, .115); right = mix(bg, UMBER, .30); plaster = mix(bg, hi, .06); }
    top = tok('mTop', top, 1); left = tok('mLeft', left, 1); right = tok('mRight', right, 1); plaster = tok('mPlaster', plaster, 1);
    base = dark ? top : (dk ? t.dark2 : t.card);
    o.top = top; o.left = left; o.right = right; o.base = base;
    var s = solve(base, top, left, right);
    o.sky = s.sky; o.gnd = s.gnd; o.key = s.key; o.fill = s.fill;
    o.plaster = [plaster[0] * base[0] / M.max(top[0], .02), plaster[1] * base[1] / M.max(top[1], .02), plaster[2] * base[2] / M.max(top[2], .02)];
    o.plasterLit = plaster;
    o.metalHi = tok('mMetalHi', dark ? mix(bg, hi, .30) : mix(bg, t.muted, .45), 1);
    o.metalLo = tok('mMetalLo', dark ? mix(bg, hi, .07) : mix(hi, t.muted, .7));
    o.ink = dark ? mix(bg, hi, .07) : hi;
    var acc = mix(t.accent, hi, .12);
    for (var i = 0; i < 8 && M.min(contrast(acc, bg), contrast(acc, base)) < 3; i++) acc = mix(acc, hi, .18);
    o.accent = acc;
    o.foil = tok('mFoil', t.accent);
    o.glass = dark ? hi : mix(bg, t.ink2, .3);
    o.liquid = t.accent;
    var sh = m.mShadow, sl = m.mSil;
    o.shadow = sh && (lum(sh) < .2) ? [sh[0], sh[1], sh[2]] : (dark ? [0, 0, 0] : hi);
    o.contactA = dark ? .55 : .24; o.castA = dark ? .36 : .16;
    o.sil = sl && ((lum(sl) > .4) === dark) ? [sl[0], sl[1], sl[2]] : hi;
    o.silA = dark ? .85 : .9; o.silW = dark ? 1.6 : 1.75;
    o.spec = dark ? mix(t.onDark, t.accent, .08) : [.92, .9, .86];
    o.rim = dark ? v3.scale(hi, .4) : [.18, .18, .17];
    o.pal = dark && !dk ? [t.ink, t.ink2, t.muted, acc, base, t.paper, t.ink, t.dark]
      : dk ? [t.onDark, t.onDark2, mix(t.onDark, t.dark, .42), acc, base, t.dark, t.onDark, t.dark]
      : [t.ink, t.ink2, t.muted, acc, base, t.paper, t.ink, t.dark];
    /* per kind: base colour (or null: the face's own palette colour) */
    o.kc = [null, o.plaster, o.metalHi, o.glass, o.foil, o.liquid, o.ink, null];
    return (v._lit = o);
  }
  P._lit = lit;
  /* the eight palette slots a view draws with: ink ink2 muted accent card paper hidden dark.
     The accent slot is foil darkened only where it would fall under 3:1 on the ground or on a part's own face. On a dark ground the
     card slot is the lit top tone (mix(dark, on-dark, .13)), never dark-2, so faces never sink into the stage */
  P._palette = function (v) { return lit(v).pal; };
  P._bgLum = function (v) { return lum(lit(v).bg); };
  /* one face's colour, the same sums as the GL vertex and fragment shaders (c2d, posters, tests).
     n and V are world unit vectors facing each other; L and F are the world key and fill. Returns [r, g, b, alphaFactor] */
  P._shade = function (o, kind, col, n, V, L, F, y, gy, aoh) {
    var mt = KMAT[kind] || KMAT[0], md = mt[3], nv = M.abs(v3.dot(n, V)), base = (o.kc[kind] || col).slice(), a = 1, i;
    var ndl = M.max(v3.dot(n, L), 0), hemi = .5 + .5 * n[1], fl = M.max(v3.dot(n, F), 0), lt = [];
    for (i = 0; i < 3; i++) lt[i] = (o.gnd[i] + (o.sky[i] - o.gnd[i]) * hemi) * UK[0] + o.key[i] * ndl * UK[1] + o.fill[i] * fl * UK[2];
    if (md === 1 || md === 4) {
      var dn = 2 * v3.dot(V, n), Ry = dn * n[1] - V[1], e = sstep(-.45, .65, Ry);
      if (md === 1) { var ramp = .85 + .23 * M.pow(1 - nv, 1.5), ee = .5 + .5 * e; for (i = 0; i < 3; i++) { base[i] = (o.metalLo[i] + (base[i] - o.metalLo[i]) * ee) * ramp; lt[i] = 1 + (lt[i] - 1) * .45; } }
      else for (i = 0; i < 3; i++) base[i] *= .86 + .24 * e;
    }
    if (md === 3 && n[1] > .9) base = mix(base, WHITE, .15);
    var c = [base[0] * lt[0], base[1] * lt[1], base[2] * lt[2]];
    if (mt[0] > 0) {
      var H = v3.norm(v3.add(L, V)), sp = mt[0] * M.pow(M.max(v3.dot(n, H), 0), mt[1]);
      for (i = 0; i < 3; i++) c[i] += o.spec[i] * sp;
    }
    if (mt[2] > 0) { var rr = mt[2] * M.pow(1 - nv, 2.5); for (i = 0; i < 3; i++) c[i] += o.rim[i] * rr; }
    if (md === 2) a = .05 + .27 * M.pow(1 - nv, 2);
    else if (md === 3) a = .55;
    if (aoh > 0 && y != null) { var k = UK[3] + (1 - UK[3]) * sstep(gy, gy + aoh, y); c = [c[0] * k, c[1] * k, c[2] * k]; }
    return [clamp(c[0], 0, 1), clamp(c[1], 0, 1), clamp(c[2], 0, 1), a];
  };
  function sstep(a, b, x) { var t = clamp((x - a) / (b - a || 1), 0, 1); return t * t * (3 - 2 * t); }
  P._sstep = sstep;
  W.addEventListener('pstheme', function () {
    THEME = null; var t = P.theme();
    each(VIEWS, function (v) { v._pal = v._th = v._lit = null; v.dirty = true; if (v.vis && v.live && !v.paused) v.render(); });
    each(TSUB, function (f) { try { f(t); } catch (e) { warn('theme', e); } });
  });

  /* ---------------- geometry ---------------- */
  var CI = { ink: 0, ink2: 1, muted: 2, accent: 3, foil: 3, card: 4, paper: 5, hidden: 6, dark: 7, none: -1 };
  P.CI = CI;
  /* materials: face and line colours as before, plus an optional kind (KIND) for the light. A part on a ground layer (layer < 0)
     with no kind of its own is plaster. 'foil' is an accent face that catches a highlight: keep it to the one live thing */
  var MATS = P.MATS = {
    paper: { face: 'card', line: 'ink' },
    quiet: { face: 'card', line: 'ink2', lineA: .6 },
    foil: { kind: 'foil', face: 'accent', line: 'accent', w: 1.5 },
    glass: { kind: 'glass', face: 'paper', faceA: .08, line: 'ink2' },
    wire: { face: 'none', line: 'ink' },
    ghost: { face: 'none', line: 'ink2', dash: 4, lineA: .7 },
    plaster: { kind: 'plaster', face: 'card', line: 'ink2', lineA: .7 },
    metal: { kind: 'metal', face: 'card', line: 'ink' },
    liquid: { kind: 'liquid', face: 'accent', faceA: .55, line: 'accent', lineA: .7 },
    ink: { kind: 'ink', face: 'ink', line: 'ink' }
  };
  function ci(n) { return typeof n === 'number' ? n : (CI[n] != null ? CI[n] : 0); }
  function pick(a, b, c) { return a != null ? a : b != null ? b : c; }
  function kindOf(k) { return typeof k === 'number' ? k : (k && KIND[k] != null ? KIND[k] : -1); }
  var Z3 = [0, 0, 0], SM = 0;
  /* edge classes, at line[15]: 0 a hard edge of a solid (silhouette or crease, decided per frame), 1 a soft edge (silhouette only),
     2 a wire edge (always, as authored), 3 a drawn detail line, 4 an anti-alias hairline under a face drawn without edges */
  var EG = P.EDGE = { hard: 0, soft: 1, wire: 2, detail: 3, aa: 4 };
  P._shapes = {}; P._sm = function () { return ++SM; };
  function seg(g, a, b, n1, n2, o, w, dash, fl, lc, la) {
    g.L.push(a[0], a[1], a[2], b[0], b[1], b[2], n1[0], n1[1], n1[2], n2[0], n2[1], n2[2], w, lc == null ? o.lc : lc, dash, fl, la == null ? o.la : la);
  }
  function key(p) { return M.round(p[0] * 1e4) + ',' + M.round(p[1] * 1e4) + ',' + M.round(p[2] * 1e4); }
  function newell(p) {
    var n = [0, 0, 0], c = p.length / 3;
    for (var i = 0; i < c; i++) {
      var j = (i + 1) % c;
      n[0] += (p[i * 3 + 1] - p[j * 3 + 1]) * (p[i * 3 + 2] + p[j * 3 + 2]);
      n[1] += (p[i * 3 + 2] - p[j * 3 + 2]) * (p[i * 3] + p[j * 3]);
      n[2] += (p[i * 3] - p[j * 3]) * (p[i * 3 + 1] + p[j * 3 + 1]);
    }
    return v3.norm(n);
  }
  /* polys -> faces + auto edges (shared edges between two faces carry both normals; one smoothing group = soft silhouette edge) */
  function emit(g, ps, o) {
    if (o.faces) each(ps, function (pl) { g.F.push({ p: pl.p, n: pl.n, c: o.fc, a: o.fa, ds: !!pl.ds, t: pl.t || null, k: o.k, uv: pl.uv || null, tex: pl.uv ? o.tex : null }); });
    if (!o.edges) {
      /* a face drawn without edges gets a faint hairline of its own colour where the canvas has no multisampling (polys only) */
      if (o.faces && o.aa) each(ps, function (pl) {
        var p = pl.p, c = p.length / 3;
        for (var i = 0; i < c; i++) { var j = (i + 1) % c; seg(g, [p[i * 3], p[i * 3 + 1], p[i * 3 + 2]], [p[j * 3], p[j * 3 + 1], p[j * 3 + 2]], pl.n, pl.n, o, .6, 0, EG.aa, o.fc, .6 * o.fa); }
      });
      return;
    }
    var map = {}, keys = [];
    each(ps, function (pl) {
      var p = pl.p, c = p.length / 3;
      for (var i = 0; i < c; i++) {
        var j = (i + 1) % c, a = [p[i * 3], p[i * 3 + 1], p[i * 3 + 2]], b = [p[j * 3], p[j * 3 + 1], p[j * 3 + 2]];
        var ka = key(a), kb = key(b), k = ka < kb ? ka + '|' + kb : kb + '|' + ka, e = map[k];
        if (!e) { map[k] = { a: a, b: b, n1: pl.n, n2: null, s1: pl.sm || 0, s2: 0, ds: pl.ds }; keys.push(k); } else { e.n2 = pl.n; e.s2 = pl.sm || 0; }
      }
    });
    var wire = !o.faces || o.fa < .5;
    each(keys, function (k) {
      var e = map[k], n1 = e.n1, n2 = e.n2, soft = 0, dash = o.dash, fl = EG.hard;
      if (n2 && e.s1 && e.s1 === e.s2) { soft = 1; fl = EG.soft; }
      else if (n2 && v3.dot(n1, n2) > .9999) return;
      if (!n2) { n2 = e.ds ? v3.scale(n1, -1) : n1; if (o.openDash) dash = o.openDash; }
      if (wire && !soft) { n1 = n2 = Z3; fl = EG.wire; }
      seg(g, e.a, e.b, n1, n2, o, o.w || 1, dash, fl);
    });
  }
  /* texture coordinates for a box's top face: u runs along +x, v from the back edge (-z) to the front (+z), so an image reads
     upright to a camera in front of the box */
  var BOXUV = { '+y': [0, 1, 1, 1, 1, 0, 0, 0] };
  function shapeBox(b, s) {
    var x = b[0], y = b[1], z = b[2], w = b[3] / 2, h = b[4], d = b[5] / 2, x0 = x - w, x1 = x + w, y0 = y, y1 = y + h, z0 = z - d, z1 = z + d;
    var F = {
      '+x': [[x1, y0, z1, x1, y0, z0, x1, y1, z0, x1, y1, z1], [1, 0, 0]], '-x': [[x0, y0, z0, x0, y0, z1, x0, y1, z1, x0, y1, z0], [-1, 0, 0]],
      '+y': [[x0, y1, z1, x1, y1, z1, x1, y1, z0, x0, y1, z0], [0, 1, 0]], '-y': [[x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1], [0, -1, 0]],
      '+z': [[x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1], [0, 0, 1]], '-z': [[x1, y0, z0, x0, y0, z0, x0, y1, z0, x1, y1, z0], [0, 0, -1]]
    }, ps = [], open = s.open || '', k, tf = s.tex ? (s.tex.face || '+y') : null;
    for (k in F) if (open.indexOf(k) < 0) ps.push({ p: F[k][0], n: F[k][1], ds: !!open, uv: k === tf ? BOXUV['+y'] : null });
    return ps;
  }
  function geom(shapes, mats, pm, ground) {
    var g = { F: [], L: [], S: [], T: [], TF: [], bb: [INF, INF, INF, -INF, -INF, -INF] };
    each(shapes || [], function (s) {
      if (!s) return;
      var m = (s.mat && typeof s.mat === 'object') ? s.mat : (mats && mats[s.mat || pm]) || MATS[s.mat || pm] || (pm && typeof pm === 'object' ? pm : MATS.paper);
      var face = pick(s.face, m.face, 'card'), kd = kindOf(pick(s.kind, m.kind, null));
      if (kd < 0) kd = ground ? KIND.plaster : KIND.paper;
      var o = { fc: ci(face), fa: pick(s.faceA, m.faceA, 1), lc: ci(pick(s.line, m.line, 'ink')), la: pick(s.lineA, m.lineA, 1),
        w: pick(s.w, m.w, 0), dash: pick(s.dash, m.dash, 0), openDash: s.openDash || 0, edges: s.edges !== false, faces: s.faces !== false && face !== 'none',
        k: kd, tex: s.tex || null, aa: false };
      var i, p;
      if (s.box) emit(g, shapeBox(s.box, s), o);
      else if (s.prism || s.cyl) { var sk = s.prism ? 'prism' : 'cyl', sf = P._shapes[sk]; if (sf) emit(g, sf(s[sk], s), o); else warn(sk + ' shapes arrive with explorer.js'); }
      else if (s.poly) {
        p = []; var uv = null;
        each(s.poly.pts || s.poly, function (q3) { p.push(q3[0], q3[1], q3[2]); });
        if (s.uv && s.tex) { uv = []; each(s.uv, function (t2) { uv.push(t2[0], t2[1]); }); }
        o.aa = true;
        emit(g, [{ p: p, n: s.n || newell(p), ds: s.ds !== false, uv: uv }], o);
      }
      else if (s.sphere) g.S.push(s.sphere.c[0], s.sphere.c[1], s.sphere.c[2], s.sphere.r, o.faces ? o.fc : -1, s.edges === false ? -1 : o.lc, o.la);
      else if (s.lines) { var L = s.lines, n = s.n || Z3; for (i = 0; i + 5 < L.length; i += 6) seg(g, [L[i], L[i + 1], L[i + 2]], [L[i + 3], L[i + 4], L[i + 5]], n, n, o, o.w || .75, o.dash, EG.detail); }
      else if (s.path) {
        var pts = s.path.pts || s.path, cl = s.path.closed || s.closed, n2 = s.n || Z3, cnt = cl ? pts.length : pts.length - 1;
        for (i = 0; i < cnt; i++) seg(g, pts[i], pts[(i + 1) % pts.length], n2, n2, o, o.w || .75, o.dash, EG.detail);
      }
    });
    finish(g);
    return g;
  }
  function finish(g) {
    var bb = g.bb, i, k;
    function ex(x, y, z) { if (x < bb[0]) bb[0] = x; if (y < bb[1]) bb[1] = y; if (z < bb[2]) bb[2] = z; if (x > bb[3]) bb[3] = x; if (y > bb[4]) bb[4] = y; if (z > bb[5]) bb[5] = z; }
    g.T = []; g.TF = []; g.TI = [];
    each(g.F, function (f, fi) {
      var p = f.p, c = p.length / 3, t = f.t;
      if (f.k == null) f.k = 0;
      for (i = 0; i < c; i++) ex(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]);
      if (!t) { t = []; for (i = 1; i < c - 1; i++) t.push(0, i, i + 1); }
      for (i = 0; i < t.length; i++) { k = t[i] * 3; g.T.push(p[k], p[k + 1], p[k + 2]); g.TI.push(t[i]); if (i % 3 === 0) g.TF.push(fi); }
    });
    for (i = 0; i < g.L.length; i += 17) { ex(g.L[i], g.L[i + 1], g.L[i + 2]); ex(g.L[i + 3], g.L[i + 4], g.L[i + 5]); }
    for (i = 0; i < g.S.length; i += 7) { var r = M.max(0, g.S[i + 3]); ex(g.S[i] - r, g.S[i + 1] - r, g.S[i + 2] - r); ex(g.S[i] + r, g.S[i + 1] + r, g.S[i + 2] + r); }
    if (bb[0] > bb[3]) g.bb = [0, 0, 0, 0, 0, 0];
    /* an opaque solid casts shadows and receives them */
    g.solid = false;
    each(g.F, function (f) { if (f.a >= .99 && f.k !== KIND.glass && f.k !== KIND.liquid) g.solid = true; });
    return g;
  }
  P.geom = geom; P._finish = finish;

  /* ---------------- textures ----------------
     A face option tex: {key, src, focal: [fx, fy] or "50% 30%", mono, aspect, draw(ctx, w, h, img, tex)}. The engine loads src with
     CORS; until it lands (or if it cannot), draw() gets img = null and should set type in its place. Each renderer keeps an atlas
     of 16 tiles; a tex's own counter (v) tells it when to upload again. */
  var IMGQ = [];
  function texImg(T) {
    if (!T.src || T._img || T.fail) return T._img || null;
    var im = new Image();
    im.crossOrigin = 'anonymous'; im.decoding = 'async';
    im.onload = function () { T.v = (T.v || 0) + 1; T.ok = true; each(VIEWS, function (v) { v.invalidate(); }); if (T.onload) T.onload(T); };
    im.onerror = function () { T.fail = true; T._img = null; T.v = (T.v || 0) + 1; each(VIEWS, function (v) { v.invalidate(); }); if (T.onerror) T.onerror(T); };
    if (T.srcset) im.srcset = T.srcset;
    im.src = T.src;
    T._img = im; IMGQ.push(im);
    return im;
  }
  function focalOf(f) {
    if (!f) return [.5, .5];
    if (typeof f === 'string') { var m = f.match(/-?[\d.]+/g) || []; return [(+m[0] || 50) / 100, (m[1] != null ? +m[1] : 50) / 100]; }
    return f;
  }
  /* draw img to cover (x, y, w, h) around its focal point */
  P.cover = function (cx, img, x, y, w, h, focal) {
    var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    var f = focalOf(focal), s = M.max(w / iw, h / ih), sw = w / s, sh = h / s, sx = clamp(f[0] * iw - sw / 2, 0, iw - sw), sy = clamp(f[1] * ih - sh / 2, 0, ih - sh);
    cx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  };
  P._tile = function (T, px) {
    if (T._cv && T._cvpx === px && T._cvv === (T.v || 0)) return T._cv;
    var c = T._cv || D.createElement('canvas'), A = T.aspect || 1, img = texImg(T), ok = img && img.complete && img.naturalWidth && !T.fail;
    c.width = c.height = px;
    var x = c.getContext('2d');
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, px, px);
    x.setTransform(1, 0, 0, A, 0, 0);
    try {
      if (T.draw) T.draw(x, px, px / A, ok ? img : null, T);
      else { x.fillStyle = '#F6F4ED'; x.fillRect(0, 0, px, px / A); if (ok) P.cover(x, img, 0, 0, px, px / A, T.focal); }
    } catch (e) { warn('tile', e); }
    T._cv = c; T._cvpx = px; T._cvv = T.v || 0;
    return c;
  };

  /* ---------------- scene graph ---------------- */
  var NID = 0;
  function Node(o) {
    o = o || {};
    this.uid = ++NID; this.id = o.id || ''; this.part = o.part || null; this.name = o.name || '';
    this.parent = null; this.children = [];
    this.pos = o.pos ? o.pos.slice() : [0, 0, 0];
    this.rot = o.rot ? (o.rot.length === 4 ? o.rot.slice() : q.euler(o.rot[0], o.rot[1], o.rot[2])) : [0, 0, 0, 1];
    this.scl = o.scl ? (typeof o.scl === 'number' ? [o.scl, o.scl, o.scl] : o.scl.slice()) : [1, 1, 1];
    this.alpha = o.alpha == null ? 1 : o.alpha; this.dim = 1; this.hl = 0; this.tint = 0; this.visible = o.visible !== false;
    this.dev = o.dev || 0;
    this.geom = o.geom || null; this.layer = o.layer || 0;
    this.wm = m4(); this._lm = m4(); this._k = []; this._wv = 0; this._sv = 0; this._gv = 0; this._str = 0;
  }
  function bump(n) { while (n.parent) n = n.parent; n._str++; }
  Node.prototype = {
    add: function (n) { if (n.parent) n.parent.remove(n); n.parent = this; this.children.push(n); bump(this); return n; },
    remove: function (n) { var i = this.children.indexOf(n); if (i >= 0) { this.children.splice(i, 1); n.parent = null; bump(this); } return n; },
    find: function (id) { if (this.id === id) return this; for (var i = 0; i < this.children.length; i++) { var r = this.children[i].find(id); if (r) return r; } return null; },
    walk: function (fn) { fn(this); for (var i = 0; i < this.children.length; i++) this.children[i].walk(fn); },
    setGeom: function (g) { this.geom = g; bump(this); return this; },
    touch: function () { this._gv++; return this; },
    has: function (n) { while (n) { if (n === this) return true; n = n.parent; } return false; }
  };
  P.Node = Node;
  function upd(n, pc, pw, pa, ph, pv, pt) {
    var k = n._k, p = n.pos, r = n.rot, s = n.scl, ch = pc;
    if (k[0] !== p[0] || k[1] !== p[1] || k[2] !== p[2] || k[3] !== r[0] || k[4] !== r[1] || k[5] !== r[2] || k[6] !== r[3] || k[7] !== s[0] || k[8] !== s[1] || k[9] !== s[2]) {
      ch = true; k[0] = p[0]; k[1] = p[1]; k[2] = p[2]; k[3] = r[0]; k[4] = r[1]; k[5] = r[2]; k[6] = r[3]; k[7] = s[0]; k[8] = s[1]; k[9] = s[2];
    }
    if (ch) { m4x.compose(p, r, s, n._lm); if (pw) m4x.mul(pw, n._lm, n.wm); else n.wm.set(n._lm); n._wv++; n._iv = null; }
    var ea = pa * n.alpha * n.dim, eh = ph > n.hl ? ph : n.hl, ev = pv && n.visible, et = pt > n.tint ? pt : n.tint;
    if (ea !== n._ea || eh !== n._eh || ev !== n._ev || et !== n._et || n.dev !== n._edev) { n._ea = ea; n._eh = eh; n._ev = ev; n._et = et; n._edev = n.dev; n._sv++; }
    for (var i = 0; i < n.children.length; i++) upd(n.children[i], ch, n.wm, ea, eh, ev, et);
  }
  P._upd = function (root) { upd(root, false, null, 1, 0, true, 0); };

  /* ---------------- models ---------------- */
  var MODELS = {};
  var FILE = { stack: 'hero', container: 'models/machines', euv: 'models/machines', 'ai-rack': 'models/machines', 'model-t-line': 'models/machines',
    'win-margin': 'models/window', 'win-doors': 'models/window', 'win-scaling': 'models/window', 'win-email': 'models/window', 'win-acquirer': 'models/window', 'win-270': 'models/window' };
  P.modelFile = FILE;
  P.model = function (id, def) { def.id = id; MODELS[id] = def; return def; };
  P.getModel = function (id) { return MODELS[id] || null; };
  /* copy decks: PS3D.strings('money-flow', {gp: {name, fig, why}}) replaces part strings without touching geometry */
  P.strings = function (id, map) { var d = MODELS[id]; if (d) d.strings = ext(d.strings || {}, map); return d || null; };
  P.need = function (id) {
    if (MODELS[id]) return Promise.resolve(MODELS[id]);
    return P.load(FILE[id] || 'models/' + id).then(function () {
      if (!MODELS[id]) throw new Error('PS3D: no model ' + id);
      return MODELS[id];
    });
  };
  var B = P.B = {
    box: function (x, y, z, w, h, d, o) { return ext({ box: [x, y, z, w, h, d] }, o); },
    prism: function (pts, y0, y1, o) { return ext({ prism: { pts: pts, y0: y0, y1: y1 } }, o); },
    cyl: function (c, r, h, o) { return ext({ cyl: { c: c, r: r, h: h } }, o); },
    sphere: function (c, r, o) { return ext({ sphere: { c: c, r: r } }, o); },
    lines: function (a, o) { return ext({ lines: a }, o); },
    path: function (pts, o) { return ext({ path: { pts: pts } }, o); },
    poly: function (pts, o) { return ext({ poly: { pts: pts } }, o); },
    part: function (id, o, shapes, children) { var p = ext({ id: id, shapes: shapes || [] }, o); if (children) p.children = children; return p; },
    rng: function (seed) {
      var a = seed >>> 0 || 1;
      return function () { a = (a + 0x6D2B79F5) | 0; var t = M.imul(a ^ (a >>> 15), 1 | a); t = (t + M.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    },
    q: q, v3: v3
  };
  var META = ['n', 'name', 'fig', 'why', 'src', 'anchor', 'explode', 'href', 'cap', 'lift', 'data'];
  function mkPart(p, parent, root, def) {
    var n = new Node(p), ground = (p.layer != null ? p.layer : parent._lay || 0) < 0;
    n.part = p.pick === false ? null : (p.id || parent.part || null);
    each(META, function (k) { if (p[k] != null) n[k] = p[k]; });
    if (p.id && def.strings && def.strings[p.id]) ext(n, def.strings[p.id]);
    if (p.fit === false || parent.nofit) n.nofit = true;
    n._lay = p.layer != null ? p.layer : parent._lay || 0;
    if (p.shapes && p.shapes.length) n.geom = geom(p.shapes, def.mats, p.mat || parent._mat, ground);
    n._mat = p.mat || parent._mat;
    parent.add(n);
    if (p.id) { root.parts[p.id] = n; if (p.pick !== false && (p.name || p.n != null)) root.list.push(n); }
    each(p.children, function (c) { mkPart(c, n, root, def); });
    return n;
  }
  P.build = function (id, params) {
    var def = typeof id === 'string' ? MODELS[id] : id;
    if (!def) throw new Error('PS3D: unknown model ' + id);
    var prm = ext(ext({}, def.params), params), parts = (def.parts || []).slice();
    if (def.build) { var r = def.build(B, prm, def); if (r) parts = parts.concat(r.parts || r); }
    var root = new Node({ id: def.id || 'model' });
    root.def = def; root.params = prm; root.parts = {}; root.list = []; root._mat = def.mat || null;
    each(parts, function (p) { mkPart(p, root, root, def); });
    root.list.sort(function (a, b) { return (a.n == null ? 1e9 : a.n) - (b.n == null ? 1e9 : b.n); });
    return root;
  };

  /* ---------------- camera ---------------- */
  function Cam(kind) {
    this.kind = kind === 'persp' ? 'persp' : 'ortho';
    this.yaw = 45; this.pitch = 35.264; this.zoom = 1; this.fov = 22; this.dist = 0; this.target = [0, 0, 0]; this.radius = 1;
    this.shift = [0, 0]; this.oy = 0; this.op = 0; this.span = 0; this.ly = 0;
    this.V = m4(); this.Pm = m4(); this.VP = m4(); this.iVP = m4(); this.eye = [0, 0, 1]; this.dir = [0, 0, 1]; this.right = [1, 0, 0]; this.up = [0, 1, 0];
    this.near = .1; this.far = 10; this.dc = 1; this.py = 1; this.light = [0, 1, 0]; this.fill = [0, 1, 0];
  }
  Cam.prototype.set = function (o) {
    if (!o) return this;
    var self = this;
    each(['yaw', 'pitch', 'zoom', 'fov', 'dist', 'radius'], function (k) { if (o[k] != null) self[k] = o[k]; });
    if (o.target) this.target = o.target.slice();
    if (o.shift) this.shift = o.shift.slice();
    return this;
  };
  Cam.prototype.update = function (asp) {
    var y = (this.yaw + this.oy) * RAD, p = clamp(this.pitch + this.op, -89.9, 90) * RAD, cp = M.cos(p), sp = M.sin(p), sy = M.sin(y), cy = M.cos(y);
    var d = [cp * sy, sp, cp * cy], r = [cy, 0, -sy], u = v3.cross(d, r), R = this.radius || 1, S = M.max(R, this.span || 0), t = this.target, dist, V = this.V;
    if (this.kind === 'persp') dist = (this.dist || R * 1.08 / M.sin(M.atan(M.tan(this.fov * RAD / 2) * M.min(1, asp)))) / (this.zoom || 1);
    else dist = S * 4 + 1;
    var e = [t[0] + d[0] * dist, t[1] + d[1] * dist, t[2] + d[2] * dist];
    V[0] = r[0]; V[4] = r[1]; V[8] = r[2]; V[12] = -v3.dot(r, e);
    V[1] = u[0]; V[5] = u[1]; V[9] = u[2]; V[13] = -v3.dot(u, e);
    V[2] = d[0]; V[6] = d[1]; V[10] = d[2]; V[14] = -v3.dot(d, e);
    V[3] = V[7] = V[11] = 0; V[15] = 1;
    this.near = M.max(dist - S * 2.2, dist * .02); this.far = dist + S * 2.2; this.fr = S;
    if (this.kind === 'persp') m4x.persp(this.fov * RAD, asp, this.near, this.far, this.Pm);
    else {
      var hh = R * 1.12 / (this.zoom || 1) * M.max(1, 1 / asp), hw = hh * asp;
      m4x.ortho(-hw, hw, -hh, hh, this.near, this.far, this.Pm);
    }
    var Pm = this.Pm, sx = this.shift[0], s2 = this.shift[1];
    if (sx || s2) for (var c = 0; c < 4; c++) { Pm[c * 4] += sx * Pm[c * 4 + 3]; Pm[c * 4 + 1] += s2 * Pm[c * 4 + 3]; }
    m4x.mul(Pm, V, this.VP); m4x.inv(this.VP, this.iVP);
    this.eye = e; this.dir = d; this.right = r; this.up = u; this.dc = dist; this.py = Pm[5]; this.asp = asp;
    var b = { r: r, u: u, d: d };
    this.light = toWorld(b, rotY(KEY0, this.ly)); this.fill = toWorld(b, rotY(FILL0, this.ly * .5));
    return this;
  };
  P.Camera = Cam;

  /* ---------------- views ---------------- */
  var VID = 0, IO = null, IONEAR = null, RO = null;
  function cap() { return TOUCH ? 3 : 4; }
  function liveGL() { var n = 0; each(VIEWS, function (v) { if (v.kind === 'gl' && v.R && !v.R.lost) n++; }); return n; }
  function room(except) {
    if (liveGL() < cap()) return true;
    var c = null;
    each(VIEWS, function (w) { if (w !== except && w.kind === 'gl' && w.R && !w.R.lost && w._seen && !w.vis && (!c || !w.near)) c = w; });
    if (c) { c._park(); return true; }
    return false;
  }
  function byCanvas(el) { for (var i = 0; i < VIEWS.length; i++) if (VIEWS[i].canvas === el) return VIEWS[i]; return null; }
  function observe(v) {
    if (W.IntersectionObserver) {
      if (!IO) {
        IO = new IntersectionObserver(function (es) { each(es, function (e) { var v2 = byCanvas(e.target); if (v2) { v2._seen = true; v2.vis = e.isIntersecting; if (v2.vis) { v2._unpark(); v2.invalidate(); } } }); }, { rootMargin: '100px' });
        IONEAR = new IntersectionObserver(function (es) { each(es, function (e) { var v2 = byCanvas(e.target); if (v2) { v2.near = e.isIntersecting; if (v2.near) v2._unpark(); else if (!v2.vis) v2._park(); } }); }, { rootMargin: '200% 0px' });
      }
      IO.observe(v.canvas); IONEAR.observe(v.canvas);
    } else v.vis = true;
    if (W.ResizeObserver) {
      if (!RO) RO = new ResizeObserver(function (es) { each(es, function (e) { var v2 = byCanvas(e.target); if (v2) { v2._cw = e.contentRect.width; v2._ch = e.contentRect.height; v2.invalidate(); } }); });
      RO.observe(v.canvas);
    }
  }
  function unobserve(c) { if (IO) { IO.unobserve(c); IONEAR.unobserve(c); } if (RO) RO.unobserve(c); }
  function dprFor(v) {
    var d = M.min(W.devicePixelRatio || 1, v.dprMax || 2, 2), n = W.navigator || {};
    if ((n.deviceMemory && n.deviceMemory <= 4) || (n.hardwareConcurrency && n.hardwareConcurrency <= 4)) d = M.min(d, 1.5);
    if (v.q >= 1) d = M.min(d, 1.5);
    if (v.q >= 2) d = 1;
    return d;
  }

  /* View options: {renderer, camera, surface: 'paper'|'dark', hidden, dprMax, lineScale, lineA, shadow: false, reflect: true}.
     v.shadow: null turns contact and cast shadows off; an object turns them on ({a} scales them, against the old .14 default).
     v.reflect: a faint floor reflection (the Lab Window only; desktop; dropped at quality 1). v.xray: hidden lines (explode). */
  function View(canvas, o) {
    o = o || {};
    var v = this;
    v.id = ++VID; v.canvas = canvas; v.o = o; v.scene = new Node({ id: 'scene' }); v.camera = new Cam(o.camera);
    v.surface = o.surface || 'paper'; v.hidden = !!o.hidden; v.lineScale = o.lineScale || 1; v.lineA = o.lineA == null ? 1 : o.lineA;
    v.shadow = o.shadow === false ? null : {}; v.reflect = !!o.reflect && !TOUCH; v.xray = false;
    v.dirty = true; v.vis = !W.IntersectionObserver; v.near = true; v.frames = 0; v.calls = 0; v.q = 0; v._slow = 0;
    v._ev = {}; v.ticks = []; v.R = null; v.kind = 'none'; v.live = false; v._loss = []; v.dprMax = o.dprMax || 2; v.w = 0; v.h = 0; v.dpr = 1;
    canvas.setAttribute('aria-hidden', 'true');
    VIEWS.push(v); observe(v);
    v._choose(o.renderer || 'auto');
  }
  View.prototype = {
    _choose: function (want) {
      var v = this;
      if (FORCE2D || want === '2d' || P.support() === '2d' || !P._R.gl || !room(v)) return v._use2d();
      var r = null;
      try { r = P._R.gl(v); } catch (e) { warn('gl', e); r = null; }
      if (!r) return v._use2d(v._hadGL);
      v.R = r; v.kind = 'gl'; v.live = true; v.invalidate();
    },
    /* a context that was ever WebGL cannot become 2D, so the fallback gets a fresh canvas. Listeners stay on the old one:
       bind input to the canvas's parent and read v.canvas inside handlers, or listen for 'swap'. */
    _swap: function () {
      var v = this, c = v.canvas, n = c.cloneNode(false);
      unobserve(c);
      if (c.parentNode) c.parentNode.replaceChild(n, c);
      v.canvas = n; v._hadGL = false; observe(v); v.vis = v.vis || !W.IntersectionObserver;
      v.emit('swap', { old: c, canvas: n });
    },
    _use2d: function (swap) {
      var v = this;
      if (swap) v._swap();
      if (!P._R.c2d) { P.load('c2d').then(function () { if (!v.dead && !v.R) v._use2d(); }, function (e) { warn('c2d', e); }); return; }
      v.R = P._R.c2d(v); v.kind = '2d'; v.live = !!v.R; v.invalidate();
    },
    _fallback: function () {
      var v = this;
      if (v.kind !== 'gl' || v.dead) return;
      clearTimeout(v._lt);
      try { v.R.destroy(); } catch (e) {}
      v.R = null; v.kind = 'none'; v.live = false;
      v._use2d(true);
      v.emit('fallback');
    },
    _lost: function () {
      var v = this, t = now();
      v.live = false;
      if (v._parked) { v.emit('lost'); return; }
      var l = []; each(v._loss, function (x) { if (t - x < 30000) l.push(x); }); l.push(t); v._loss = l;
      v.emit('lost');
      if (l.length >= 2) return v._fallback();
      clearTimeout(v._lt);
      v._lt = setTimeout(function () { if (v.R && v.R.lost) v._fallback(); }, 3000);
    },
    _restored: function () { clearTimeout(this._lt); this._parked = false; this.live = true; this.dirty = true; this.render(); this.emit('restored'); },
    _park: function () { if (this.kind === 'gl' && this.R && !this.R.lost && this.R.lose) { this._parked = true; this.R.lose(); } },
    _unpark: function () {
      var v = this;
      if (v.kind !== 'gl' || !v._parked || !v.R || !v.R.lost) return;
      if (room(v)) v.R.restore();
      else if (v.vis) { try { v.R.destroy(); } catch (e) {} v.R = null; v.kind = 'none'; v._parked = false; v._use2d(true); }
    },
    /* adaptive quality from the work a render costs, not the gap between frames: a phone that paces rAF at 30 Hz is not slow.
       A frame is slow when its work passes 12 ms, or when it costs 8 ms or more and lands 1.5x past the usual interval.
       Twenty slow frames in a row step quality down. q1: one shadow copy, no reflection, DPR 1.5; q2: no cast shadow, DPR 1;
       only heavy work itself reaches q3 (no hidden lines). Contact shadows stay at every step. */
    _qual: function (work, ts) {
      var v = this, d = ts - (v._lt0 || 0);
      if (v._lt0 && d < 100 && !D.hidden) {
        v._base = v._base ? v._base * .95 + M.min(d, 50) * .05 : d;
        v._slow = work > 12 || (work >= 8 && d > v._base * 1.5) ? v._slow + 1 : 0;
      } else v._slow = 0;
      v._lt0 = ts;
      if (v._slow >= 20) { if (v.q < (work > 12 ? 3 : 2)) v.q++; v._slow = 0; }
    },
    _size: function () {
      var v = this, c = v.canvas, cw = v._cw, ch = v._ch;
      if (v._force) { cw = v._force[0]; ch = v._force[1]; }
      if (!cw || !ch) { cw = c.clientWidth; ch = c.clientHeight; }
      if ((!cw || !ch) && c.parentNode) { cw = c.parentNode.clientWidth; ch = c.parentNode.clientHeight; }
      var d = dprFor(v);
      if (cw !== v.w || ch !== v.h || d !== v.dpr || (!v._force && c.width !== M.round(cw * d))) {
        var sz = cw !== v.w || ch !== v.h;
        v.w = cw; v.h = ch; v.dpr = d;
        if (!v._force) { c.width = M.max(1, M.round(cw * d)); c.height = M.max(1, M.round(ch * d)); if (v.R && v.R.resize) v.R.resize(v); }
        if (sz && cw && ch) v.emit('resize');
      }
    },
    add: function (n) { this.scene.add(n); this.invalidate(); return n; },
    remove: function (n) { this.scene.remove(n); this.invalidate(); return n; },
    invalidate: function () { this.dirty = true; if (this.vis && !this.paused) kick(); return this; },
    update: function () { this._size(); upd(this.scene, false, null, 1, 0, true, 0); this.camera.update(this.h ? this.w / this.h : 1); return this; },
    render: function () {
      var v = this;
      if (!v.R || v.dead || (v.R.lost)) return v;
      v.update();
      if (!v.w || !v.h) return v;
      try { v.R.render(v); } catch (e) { warn('render', e); if (v.kind === 'gl') return v._fallback(); }
      v.dirty = false; v.frames++;
      v.emit('frame');
      return v;
    },
    resize: function () { this._cw = this._ch = 0; this.invalidate(); return this; },
    pause: function () { this.paused = true; return this; },
    resume: function () { this.paused = false; return this.invalidate(); },
    tick: function (fn) { var v = this; v.ticks.push(fn); v.invalidate(); kick(); return function () { var i = v.ticks.indexOf(fn); if (i >= 0) v.ticks.splice(i, 1); }; },
    destroy: function () {
      var v = this; v.dead = true; clearTimeout(v._lt);
      var i = VIEWS.indexOf(v); if (i >= 0) VIEWS.splice(i, 1);
      unobserve(v.canvas);
      if (v._rig) v._rig.destroy();
      try { if (v.R && v.R.destroy) v.R.destroy(); } catch (e) {}
      v.R = null; v.live = false; v._ev = {};
    },
    on: function (t, f) { (this._ev[t] = this._ev[t] || []).push(f); return this; },
    off: function (t, f) { var l = this._ev[t], i = l ? l.indexOf(f) : -1; if (i >= 0) l.splice(i, 1); return this; },
    emit: function (t, a) { var l = this._ev[t]; if (l) { l = l.slice(); for (var i = 0; i < l.length; i++) { try { l[i](a, this); } catch (e) { warn(t, e); } } } },
    /* world bbox of everything drawable (current pose) */
    bounds: function (root) {
      var b = [INF, INF, INF, -INF, -INF, -INF];
      upd(this.scene, false, null, 1, 0, true, 0);
      (root || this.scene).walk(function (n) {
        if (!n.geom || !n._ev || n.nofit) return;
        var g = n.geom.bb;
        for (var i = 0; i < 8; i++) {
          var p = m4x.tp(n.wm, [g[i & 1 ? 3 : 0], g[i & 2 ? 4 : 1], g[i & 4 ? 5 : 2]]);
          for (var k = 0; k < 3; k++) { if (p[k] < b[k]) b[k] = p[k]; if (p[k] > b[k + 3]) b[k + 3] = p[k]; }
        }
      });
      return b[0] > b[3] ? [0, 0, 0, 0, 0, 0] : b;
    },
    fit: function (pad, bb) {
      var b = bb || this.bounds(), c = this.camera;
      c.target = [(b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2];
      c.radius = M.max(1e-3, M.sqrt(M.pow(b[3] - b[0], 2) + M.pow(b[4] - b[1], 2) + M.pow(b[5] - b[2], 2)) / 2 * (pad || 1));
      c.span = c.radius;
      return this.invalidate();
    },
    /* world corners of every drawable node's box (current pose): the input for frame() */
    corners: function (root) {
      var out = [];
      upd(this.scene, false, null, 1, 0, true, 0);
      (root || this.scene).walk(function (n) {
        if (!n.geom || !n._ev || n.nofit) return;
        var g = n.geom.bb;
        for (var i = 0; i < 8; i++) out.push(m4x.tp(n.wm, [g[i & 1 ? 3 : 0], g[i & 2 ? 4 : 1], g[i & 4 ? 5 : 2]]));
      });
      return out;
    },
    /* tight framing: centre and size the projected extents of pts for a yaw and pitch (default: the camera's).
       frameCalc returns {target, radius, span, dist}; frame applies it. Ortho sizes radius; persp sets dist. */
    frameCalc: function (pts, margin, yaw, pitch) {
      var v = this, c = v.camera, y = (yaw == null ? c.yaw : yaw) * RAD, p = (pitch == null ? c.pitch : pitch) * RAD;
      var r = [M.cos(y), 0, -M.sin(y)], d = [M.cos(p) * M.sin(y), M.sin(p), M.cos(p) * M.cos(y)], u = v3.cross(d, r);
      var x0 = INF, x1 = -INF, y0 = INF, y1 = -INF, z0 = INF, z1 = -INF, b = [INF, INF, INF, -INF, -INF, -INF];
      pts = pts || v.corners();
      if (!pts.length) return null;
      each(pts, function (q3) {
        var a = v3.dot(q3, r), e = v3.dot(q3, u), f = v3.dot(q3, d);
        if (a < x0) x0 = a; if (a > x1) x1 = a; if (e < y0) y0 = e; if (e > y1) y1 = e; if (f < z0) z0 = f; if (f > z1) z1 = f;
        for (var k = 0; k < 3; k++) { if (q3[k] < b[k]) b[k] = q3[k]; if (q3[k] > b[k + 3]) b[k + 3] = q3[k]; }
      });
      v._size();
      var asp = v.w && v.h ? v.w / v.h : 1.5, hh = M.max((y1 - y0) / 2, (x1 - x0) / 2 / asp) * (margin || 1.1);
      var o = { target: v3.add(v3.add(v3.scale(r, (x0 + x1) / 2), v3.scale(u, (y0 + y1) / 2)), v3.scale(d, (z0 + z1) / 2)),
        span: M.sqrt(M.pow(b[3] - b[0], 2) + M.pow(b[4] - b[1], 2) + M.pow(b[5] - b[2], 2)) / 2 };
      if (c.kind === 'ortho') o.radius = hh / (1.12 * M.max(1, 1 / asp));
      else { o.radius = o.span; o.dist = hh / M.tan(c.fov * RAD / 2) + (z1 - z0) / 2; }
      return o;
    },
    frame: function (pts, margin, yaw, pitch) {
      var o = this.frameCalc(pts, margin, yaw, pitch), c = this.camera;
      if (!o) return this;
      c.target = o.target; c.span = o.span; c.radius = o.radius; if (o.dist) c.dist = o.dist;
      return this.invalidate();
    },
    project: function (p) {
      var c = this.camera, m = c.VP, x = p[0], y = p[1], z = p[2], w = m[3] * x + m[7] * y + m[11] * z + m[15];
      var cx = m[0] * x + m[4] * y + m[8] * z + m[12], cy = m[1] * x + m[5] * y + m[9] * z + m[13], cz = m[2] * x + m[6] * y + m[10] * z + m[14];
      var f = w > 1e-6, iw = 1 / (f ? w : 1e-6);
      return [(cx * iw + 1) / 2 * this.w, (1 - cy * iw) / 2 * this.h, cz * iw, f, w];
    },
    ray: function (x, y) {
      var c = this.camera, nx = 2 * x / (this.w || 1) - 1, ny = 1 - 2 * y / (this.h || 1);
      var a = m4x.tp(c.iVP, [nx, ny, -1]), b = m4x.tp(c.iVP, [nx, ny, 1]);
      return { o: a, d: v3.sub(b, a) };
    },
    pick: function (x, y, o) {
      o = o || {};
      var v = this, ray = v.ray(x, y), best = null, thr = o.thr || (TOUCH ? 16 : 8);
      v.scene.walk(function (n) {
        if (!n.geom || !n._ev || n._ea < .02 || (!n.part && !o.all) || n.nopick) return;
        var g = n.geom, inv = n._iv || (n._iv = m4x.inv(n.wm));
        if (!inv) return;
        var lo = m4x.tp(inv, ray.o), ld = m4x.tv(inv, ray.d), t;
        if (g.T.length) {
          if (slab(lo, ld, g.bb) == null) return;
          var T = g.T;
          for (var i = 0; i < T.length; i += 9) {
            t = tri(lo, ld, T, i);
            if (t != null && (!best || t < best.t)) best = { t: t, node: n };
          }
        } else {
          var L = g.L, wm = n.wm;
          for (var j = 0; j < L.length; j += 17) {
            var a = v.project(m4x.tp(wm, [L[j], L[j + 1], L[j + 2]])), b = v.project(m4x.tp(wm, [L[j + 3], L[j + 4], L[j + 5]]));
            var dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy, s = l2 ? clamp(((x - a[0]) * dx + (y - a[1]) * dy) / l2, 0, 1) : 0;
            var ex = a[0] + dx * s - x, ey = a[1] + dy * s - y;
            if (ex * ex + ey * ey < thr * thr) { t = ((a[2] + (b[2] - a[2]) * s) + 1) / 2; if (!best || t < best.t) best = { t: t, node: n }; }
          }
          var S = g.S;
          for (var k = 0; k < S.length; k += 7) {
            var pc = v.project(m4x.tp(wm, [S[k], S[k + 1], S[k + 2]])), rr = S[k + 3] > 0 ? S[k + 3] * v.camera.py * v.h / 2 / M.max(1e-6, pc[4]) : -S[k + 3] / 2;
            if (M.pow(pc[0] - x, 2) + M.pow(pc[1] - y, 2) < M.pow(rr + 4, 2)) { t = (pc[2] + 1) / 2; if (!best || t < best.t) best = { t: t, node: n }; }
          }
        }
      });
      if (!best) return null;
      var hit = { part: best.node.part, node: best.node, t: best.t, point: v3.add(ray.o, v3.scale(ray.d, best.t)) };
      v.emit('pick', hit);
      return hit;
    },
    toSVG: function (o) { return P.debug.poster(this, o); }
  };
  function slab(o, d, bb) {
    var t0 = -INF, t1 = INF;
    for (var i = 0; i < 3; i++) {
      var lo = bb[i] - 1e-4, hi = bb[i + 3] + 1e-4;
      if (M.abs(d[i]) < 1e-12) { if (o[i] < lo || o[i] > hi) return null; continue; }
      var a = (lo - o[i]) / d[i], b = (hi - o[i]) / d[i];
      if (a > b) { var s = a; a = b; b = s; }
      if (a > t0) t0 = a; if (b < t1) t1 = b;
      if (t0 > t1) return null;
    }
    return t1 < 0 ? null : t0;
  }
  function tri(o, d, T, i) {
    var e1x = T[i + 3] - T[i], e1y = T[i + 4] - T[i + 1], e1z = T[i + 5] - T[i + 2], e2x = T[i + 6] - T[i], e2y = T[i + 7] - T[i + 1], e2z = T[i + 8] - T[i + 2];
    var px = d[1] * e2z - d[2] * e2y, py = d[2] * e2x - d[0] * e2z, pz = d[0] * e2y - d[1] * e2x, det = e1x * px + e1y * py + e1z * pz;
    if (M.abs(det) < 1e-12) return null;
    var inv = 1 / det, tx = o[0] - T[i], ty = o[1] - T[i + 1], tz = o[2] - T[i + 2], u = (tx * px + ty * py + tz * pz) * inv;
    if (u < 0 || u > 1) return null;
    var qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x, w = (d[0] * qx + d[1] * qy + d[2] * qz) * inv;
    if (w < 0 || u + w > 1) return null;
    var t = (e2x * qx + e2y * qy + e2z * qz) * inv;
    return t >= 0 ? t : null;
  }
  P.View = View;
  P.create = function (canvas, o) { return new View(canvas, o); };

  /* ---------------- shadows: who stands on what ----------------
     For every opaque solid (a node with faces), its footprint, and the solid it stands on: the highest one whose top is at or just
     under its own bottom and whose footprint holds its centre. Contact shadows land on that receiver, clipped to it; a part that
     stands on nothing but the scene floor lands on the page. The renderers fill the list after a pose change. */
  P._footprint = function (n, out) {
    var g = n.geom.bb, m = n.wm, lx = (g[0] + g[3]) / 2, lz = (g[2] + g[5]) / 2, ly = g[1];
    var s0 = M.sqrt(m[0] * m[0] + m[2] * m[2]) || 1, s2 = M.sqrt(m[8] * m[8] + m[10] * m[10]) || 1;
    out[0] = m[0] * lx + m[4] * ly + m[8] * lz + m[12]; out[1] = m[2] * lx + m[6] * ly + m[10] * lz + m[14];
    if (M.abs(m[1]) < 1e-4 && M.abs(m[9]) < 1e-4) {
      out[2] = (g[3] - g[0]) / 2 * s0; out[3] = (g[5] - g[2]) / 2 * s2; out[4] = m[0] / s0; out[5] = -m[2] / s0;
    } else { out[2] = -1; out[4] = 1; out[5] = 0; }
    return out;
  };
  /* inside an oriented rect (cx, cz, hx, hz, cos, sin) with margin k (fraction of its size) */
  function inRect(r, x, z, k) {
    var dx = x - r[0], dz = z - r[1], lx = dx * r[4] - dz * r[5], lz = dx * r[5] + dz * r[4];
    return M.abs(lx) <= r[2] * (1 + k) && M.abs(lz) <= r[3] * (1 + k);
  }
  P._inRect = inRect;
  /* items: [{bb: [6], fp: [6], solid, ground, ea}] -> instances in G (16 floats each: cx cz hx hz | cos sin y a | e type off clipAng |
     ccx ccz chx chz). Returns the count. o: {contactA, scale, light: world key, groundY, castA, cast: bool, reflect: bool} */
  P._shadowList = function (items, o, G, RI) {
    var n = items.length, k = 0, i, j, gy = INF, gx0 = INF, gz0 = INF, gx1 = -INF, gz1 = -INF, sy = -INF, best = null, bestA = 0;
    for (i = 0; i < n; i++) {
      var a = items[i]; if (!a.solid) continue;
      if (a.bb[1] < gy) gy = a.bb[1]; if (a.bb[4] > sy) sy = a.bb[4];
      if (a.bb[0] < gx0) gx0 = a.bb[0]; if (a.bb[2] < gz0) gz0 = a.bb[2]; if (a.bb[3] > gx1) gx1 = a.bb[3]; if (a.bb[5] > gz1) gz1 = a.bb[5];
      if (a.ground) { var ar = (a.bb[3] - a.bb[0]) * (a.bb[5] - a.bb[2]); if (ar > bestA) { bestA = ar; best = a; } }
    }
    if (gy === INF) return { n: 0 };
    var SH = M.max(sy - gy, 1e-3), SS = M.max(gx1 - gx0, gz1 - gz0, SH), tol = SS * 2e-3 + 1e-4;
    function put(cx, cz, hx, hz, c, s, y, al, e, type, off, ca, ccx, ccz, chx, chz) {
      if (!G || (k + 1) * 16 > G.length) return;
      var b = k * 16;
      G[b] = cx; G[b + 1] = cz; G[b + 2] = hx; G[b + 3] = hz; G[b + 4] = c; G[b + 5] = s; G[b + 6] = y; G[b + 7] = al;
      G[b + 8] = e; G[b + 9] = type; G[b + 10] = off; G[b + 11] = ca; G[b + 12] = ccx; G[b + 13] = ccz; G[b + 14] = chx; G[b + 15] = chz;
      if (RI) RI[k] = rj;
      k++;
    }
    var rj = -1, sc = o.scale == null ? 1 : o.scale, cA = o.contactA * sc;
    if (cA > .002) for (i = 0; i < n; i++) {
      var c0 = items[i]; if (!c0.solid || c0.ea < .3) continue;
      var bb = c0.bb, fp = c0.fp, y0 = bb[1], h = bb[4] - bb[1];
      var cx = fp[2] >= 0 ? fp[0] : (bb[0] + bb[3]) / 2, cz = fp[2] >= 0 ? fp[1] : (bb[2] + bb[5]) / 2;
      var hx = fp[2] >= 0 ? fp[2] : (bb[3] - bb[0]) / 2, hz = fp[2] >= 0 ? fp[3] : (bb[5] - bb[2]) / 2, cs = fp[2] >= 0 ? fp[4] : 1, sn = fp[2] >= 0 ? fp[5] : 0;
      var small = 2 * M.min(hx, hz), gap = M.max(h * 1.2, small * .3), rcv = null, ry = -INF;
      rj = -1;
      if (small < SS * .004) continue;
      for (j = 0; j < n; j++) {
        if (j === i) continue;
        var r = items[j]; if (!r.solid || r.ea < .3) continue;
        var top = r.bb[4];
        if (top > y0 + tol || top < y0 - gap || top <= ry) continue;
        var rf = r.fp, rr = rf[2] >= 0 ? rf : [(r.bb[0] + r.bb[3]) / 2, (r.bb[2] + r.bb[5]) / 2, (r.bb[3] - r.bb[0]) / 2, (r.bb[5] - r.bb[2]) / 2, 1, 0];
        if (!inRect(rr, cx, cz, .02)) continue;
        if (rr[2] * rr[3] < hx * hz * .2) continue;
        rcv = rr; ry = top; rj = j;
      }
      var y = ry, clip = rcv;
      if (!rcv) { if (y0 > gy + tol) continue; y = gy; clip = null; }
      var g = M.max(0, y0 - y), fade = 1 - sstep(0, gap, g);
      /* o.soft: a node's shadeOn (0..1) scales the shadow it lays on another part (the Stack's sheets on each other); its
         shadow on the floor keeps full strength */
      var nd = c0.n || c0.node;
      if (o.soft && rcv && nd && nd.shadeOn != null) fade *= nd.shadeOn;
      if (fade < .02) continue;
      var e = M.max(.35 * h, .05 * small) + .6 * g, off = .25 * h + .4 * g;
      put(cx, cz, hx, hz, cs, sn, y + 1e-4 * SS, cA * fade * c0.ea, e, 0, off, clip ? M.atan2(clip[5], clip[4]) : 0,
        clip ? clip[0] : 0, clip ? clip[1] : 0, clip ? clip[2] : -1, clip ? clip[3] : -1);
    }
    var out = { n: 0, gy: gy, cy: gy, sh: SH, crecv: -1 };
    rj = -1;
    if (o.cast && o.castA > .002) {
      if (best && (best.bb[3] - best.bb[0]) * (best.bb[5] - best.bb[2]) > .25 * (gx1 - gx0) * (gz1 - gz0)) {
        var bf = best.fp[2] >= 0 ? best.fp : [(best.bb[0] + best.bb[3]) / 2, (best.bb[2] + best.bb[5]) / 2, (best.bb[3] - best.bb[0]) / 2, (best.bb[5] - best.bb[2]) / 2, 1, 0];
        out.cy = best.bb[4]; rj = items.indexOf(best); out.crecv = rj;
        put(bf[0], bf[1], bf[2], bf[3], bf[4], bf[5], out.cy + 2e-4 * SS, o.castA * sc, 0, 1, 0, 0, 0, 0, -1, -1);
      } else {
        var ex = SH * 1.6 + SS * .1;
        put((gx0 + gx1) / 2, (gz0 + gz1) / 2, (gx1 - gx0) / 2 + ex, (gz1 - gz0) / 2 + ex, 1, 0, gy + 2e-4 * SS, o.castA * sc, 0, 1, 0, 0, 0, 0, -1, -1);
      }
    }
    rj = -1;
    if (o.reflect) {
      var rx = (gx1 - gx0) * .9 + SH * .5, rz = (gz1 - gz0) * .9 + SH * .5;
      put((gx0 + gx1) / 2, (gz0 + gz1) / 2, rx, rz, 1, 0, gy - 1e-4 * SS, 1, 0, 2, 0, 0, 0, 0, -1, -1);
    }
    out.n = k;
    return out;
  };

  /* ---------------- support + loader ---------------- */
  var SUP = null;
  P.GLATTR = { alpha: true, premultipliedAlpha: true, antialias: false, depth: true, stencil: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: true };
  /* multisampling where it is cheap: WebGL2, a fine pointer and more than 4 GB (a browser that does not say is taken as a desktop) */
  P._msaa = function () { var n = W.navigator || {}; return !TOUCH && (n.deviceMemory == null ? 8 : n.deviceMemory) > 4; };
  function soft(g) {
    var e = g.getExtension('WEBGL_debug_renderer_info'), r = '';
    try { r = e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER); } catch (x) {}
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(r || '');
  }
  P.support = function () {
    if (SUP) return SUP;
    if (FORCE2D) return (SUP = '2d');
    var g = null;
    try {
      g = GL1 ? null : D.createElement('canvas').getContext('webgl2', P.GLATTR);
      if (g && !soft(g)) SUP = 'webgl2';
      else {
        if (g) { var l0 = g.getExtension('WEBGL_lose_context'); if (l0) l0.loseContext(); }
        g = D.createElement('canvas').getContext('webgl', P.GLATTR);
        if (g && g.getExtension('ANGLE_instanced_arrays') && !soft(g)) SUP = 'webgl';
      }
      var l = g && g.getExtension('WEBGL_lose_context'); if (l) l.loseContext();
    } catch (e) {}
    return (SUP = SUP || '2d');
  };
  var BASE = (function () {
    var s = D.currentScript && D.currentScript.src;
    return s ? s.replace(/core\.js(\?.*)?$/, '') : '/assets/3d/';
  })(), VER = '3', LOADED = {};
  P.base = BASE;
  function load1(n) {
    if (LOADED[n]) return LOADED[n];
    if ((n === 'gl' && P._R.gl) || (n === 'c2d' && P._R.c2d) || (n === 'explorer' && P.explorer) || (n === 'hero' && P.hero) || n === 'core') return (LOADED[n] = Promise.resolve());
    var pr = new Promise(function (res, rej) {
      var s = D.createElement('script'), t = setTimeout(function () { delete LOADED[n]; rej(new Error('PS3D.load timeout: ' + n)); }, 15000);
      s.src = BASE + n + '.js?v=' + VER; s.async = true;
      s.onload = function () { clearTimeout(t); res(); };
      s.onerror = function () { clearTimeout(t); delete LOADED[n]; rej(new Error('PS3D.load failed: ' + n)); };
      (D.head || D.documentElement).appendChild(s);
      if (n === 'explorer' && !D.querySelector('link[data-ps3d]')) {
        var l = D.createElement('link'); l.rel = 'stylesheet'; l.href = BASE + 'explorer.css?v=' + VER; l.setAttribute('data-ps3d', '');
        (D.head || D.documentElement).appendChild(l);
      }
    });
    LOADED[n] = pr;
    return pr;
  }
  P.load = function (names) {
    if (!names) return Promise.resolve();
    if (typeof names === 'string') names = [names];
    var ps = []; each(names, function (n) { ps.push(load1(n)); });
    return Promise.all(ps);
  };
  function renderers(r) { return r === '2d' || FORCE2D || P.support() === '2d' ? ['c2d'] : ['gl']; }
  P.mount = function (fig, id, o) {
    o = o || {};
    var r = o.renderer || fig.getAttribute('data-iso-renderer') || 'auto';
    return P.load(renderers(r).concat(['explorer'])).then(function () { return P.need(id); }).then(function () { return P.explorer(fig, id, o); });
  };
  P.auto = function (root, o) {
    var figs = (root || D).querySelectorAll('figure.iso[data-iso]'), io = null;
    function go(fig) {
      if (fig._ps3d) return;
      fig._ps3d = P.mount(fig, fig.getAttribute('data-iso'), o).then(function (ex) {
        try { fig.dispatchEvent(new CustomEvent('ps3d:ready', { detail: ex })); } catch (e) {}
        return ex;
      }, function (e) { warn('mount ' + fig.getAttribute('data-iso'), e); });
    }
    if (W.IntersectionObserver) io = new IntersectionObserver(function (es) { each(es, function (e) { if (e.isIntersecting) { io.unobserve(e.target); go(e.target); } }); }, { rootMargin: '800px 0px' });
    each(figs, function (f) { if (io) io.observe(f); else go(f); });
    return figs.length;
  };

  /* ---------------- framing ----------------
     P.frame(view, {fill: .78, pts, root, yaw, pitch}): fit the projected box of the drawing's corners so it fills that share of
     the frame's tighter side. The explorer, the stage and the hero frame this way by default. */
  P.frame = function (v, o) {
    o = o || {};
    return v.frame(o.pts || v.corners(o.root), 1 / clamp(o.fill || .78, .2, 1), o.yaw, o.pitch);
  };

  /* ---------------- poster handoff + stage ---------------- */
  P._canvas = function (host, cls) {
    var c = D.createElement('canvas');
    c.className = cls || 'ps3d-canvas';
    c.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;opacity:0';
    if (W.getComputedStyle && getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.appendChild(c);
    return c;
  };
  /* the poster gives way under the first frame. A registered poster (data-reg="1", drawn by debug.poster from the same camera)
     swaps with the canvas in the same frame, with no fade, so nothing doubles; any other poster, and every Canvas2D view, fades
     over 120ms. o.gate: a promise the swap waits for (the hero waits for the page's entrance). A poster with role="img" stays in
     the tree, since it carries the description and the canvas is aria-hidden. If the view falls back, the poster shows again. */
  P._handoff = function (v, host, o) {
    o = o || {};
    var done = false, poster = host.querySelector('.ps3d-poster'), open = !o.gate, drew = false;
    function swap() {
      if (done || !open || !drew) return; done = true;
      var cv = v.canvas, reg = poster && poster.getAttribute('data-reg') === '1' && v.kind === 'gl', ms = reg || P.reduced() ? 0 : 120;
      cv.style.transition = ms ? 'opacity ' + ms + 'ms ' + P.EASE_CSS.out : 'none'; cv.style.opacity = '1';
      if (poster) {
        poster.style.transition = ms ? 'opacity ' + ms + 'ms ' + P.EASE_CSS.out : 'none'; poster.style.opacity = '0'; poster.style.pointerEvents = 'none';
        /* a described drawing stays readable; a loading line ("Drawing the works") leaves the tree */
        if (poster.getAttribute('role') !== 'img') setTimeout(function () { if (done) poster.style.visibility = 'hidden'; }, ms + 40);
      }
      v.emit('shown');
    }
    /* a frame drawn while the tab is hidden never takes the poster down: it waits for a visible frame (PS3D.debug.renderAll,
       the QA hook, still hands over, so a hidden test pane can inspect the live drawing) */
    function show() { if (D.hidden && !P._forced) return; v.off('frame', show); drew = true; swap(); }
    v.on('frame', show);
    if (o.gate) o.gate.then(function () { open = true; swap(); if (!drew) v.invalidate(); }, function () { open = true; swap(); });
    v.on('fallback', function () { done = false; drew = false; v.canvas.style.opacity = '0'; if (poster) { poster.style.opacity = ''; poster.style.visibility = ''; } v.on('frame', show); });
  };
  P.stage = function (host, id, o) { return P.load('explorer').then(function () { return P.stage(host, id, o); }); };

  /* ---------------- the pointer light ----------------
     P.light(view, {mode: 'pointer'|'static', idle, host}) -> rig {destroy()}. 'pointer' (the Stack and the Lab Window only): the
     key turns with the pointer within 12 degrees on a spring (k 40, c 12), with the phone's tilt once it is allowed, otherwise a
     slow 9 s drift of 6 degrees. idle: the drawing breathes, 2.5 degrees of yaw over 7 s. Nothing moves under reduced motion,
     and nothing runs while the view is off screen. */
  P.light = function (v, o) {
    o = o || {};
    if (v._rig) v._rig.destroy();
    var rig = { mode: o.mode || 'static', dead: false, t: 0, tilt: false, last: 0, drift: true }, cam = v.camera;
    var sp = P.spring({ k: 40, c: 12, eps: .01, onUpdate: function (x) { cam.ly = x; v.invalidate(); } });
    function onMove(e) {
      if (rig.dead || P.reduced() || !v.vis || e.pointerType === 'touch') return;
      var w = W.innerWidth || 1, nx = clamp(e.clientX / w * 2 - 1, -1, 1);
      if (!sp.on) sp.x = cam.ly;
      rig.last = now(); sp.set(nx * 12);
    }
    function onOri(e) {
      if (rig.dead || P.reduced() || !v.vis || e.gamma == null) return;
      if (!sp.on) sp.x = cam.ly;
      rig.tilt = true; rig.last = now(); sp.set(clamp(e.gamma, -30, 30) / 30 * 12);
    }
    if (rig.mode === 'pointer') {
      W.addEventListener('pointermove', onMove, { passive: true });
      var DOE = W.DeviceOrientationEvent;
      if (TOUCH && DOE && typeof DOE.requestPermission !== 'function') W.addEventListener('deviceorientation', onOri);
    }
    /* iOS: call from a pointerdown on the drawing; it asks once */
    rig.requestTilt = function () {
      var DOE = W.DeviceOrientationEvent;
      if (rig.asked || !TOUCH || !DOE || typeof DOE.requestPermission !== 'function') return;
      rig.asked = true;
      try { DOE.requestPermission().then(function (s) { if (s === 'granted') W.addEventListener('deviceorientation', onOri); }, function () {}); } catch (e) {}
    };
    /* the drift and the breath tick only while motion is allowed; under reduced motion the drawing sits still at rest */
    var untick = null;
    function step(dt) {
      rig.t += dt;
      if (o.idle) cam.oy = 2.5 * M.sin(rig.t * M.PI * 2 / 7);
      if (rig.mode === 'pointer' && !rig.tilt && now() - rig.last > 2500) cam.ly = 6 * M.sin(rig.t * M.PI * 2 / 9);
    }
    function arm() {
      var want = !rig.dead && !P.reduced() && (rig.mode === 'pointer' || o.idle);
      if (want && !untick) untick = v.tick(step);
      else if (!want && untick) { untick(); untick = null; sp.snap(0); cam.ly = 0; cam.oy = 0; v.invalidate(); }
    }
    var unmo = P.onMotion(arm);
    arm();
    rig.destroy = function () {
      rig.dead = true; if (untick) untick(); untick = null; unmo(); sp.stop();
      W.removeEventListener('pointermove', onMove); W.removeEventListener('deviceorientation', onOri);
      cam.ly = 0; if (v._rig === rig) v._rig = null;
    };
    v._rig = rig;
    return rig;
  };

  /* ---------------- labels: one layer for pins, tags and floor names ----------------
     P.labels(view, host, {column: 'right', avoid: fn -> [nodes] | true, pill, gap}) -> layer {add(item), remove(item), clear(),
     layout(), measure(item)}. item: {el, at: [x, y, z] | fn(), n: node (at is then in its frame), show: bool | fn, leader: bool,
     side}. Each label keeps the place its own CSS gives it (measured once); the layout only nudges: it sorts by screen y, lifts a
     label clear of the ones above and of the drawing's parts (avoid) by its height plus 6px, flips it below when it leaves the
     frame, and draws a leader from the anchor when a label has moved. column: 'right' sets the labels in one column by the right
     edge, each on a leader. */
  var LCSS = false;
  function labelCSS() {
    if (LCSS) return; LCSS = true;
    var s = D.createElement('style');
    s.setAttribute('data-ps3d', 'labels');
    s.textContent = '.ps3d-leaders{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none}' +
      '.ps3d-leaders line{stroke:currentColor;stroke-width:1;opacity:.5;vector-effect:non-scaling-stroke}' +
      '.ps3d-pill{padding:4px 8px 4px;border-radius:999px;background:color-mix(in srgb,var(--dark) 92%,var(--on-dark));' +
      'box-shadow:0 0 0 1px var(--hair-on-dark);text-shadow:none!important;font-size:11px;letter-spacing:.08em;line-height:1}';
    (D.head || D.documentElement).appendChild(s);
  }
  P.labels = function (v, host, o) {
    o = o || {};
    labelCSS();
    var L = { items: [], o: o, host: host }, svg = D.createElementNS('http://www.w3.org/2000/svg', 'svg'), lines = [], rects = [], obs = [];
    svg.setAttribute('class', 'ps3d-leaders'); svg.setAttribute('aria-hidden', 'true');
    host.insertBefore(svg, host.firstChild);
    L.svg = svg;
    L.add = function (it) {
      it.w = it.h = it.dx = it.dy = 0; it.m = false; it.vis = false;
      if (o.pill) it.el.classList.add('ps3d-pill');
      it.el.style.willChange = 'transform';
      L.items.push(it); return it;
    };
    L.remove = function (it) { var i = L.items.indexOf(it); if (i >= 0) L.items.splice(i, 1); };
    L.clear = function () { L.items = []; each(lines, function (l) { l.style.display = 'none'; }); };
    L.measure = function (it) {
      var el = it.el, hr = host.getBoundingClientRect();
      el.style.transform = 'translate(0px,0px)';
      var r = el.getBoundingClientRect();
      it.dx = r.left - hr.left; it.dy = r.top - hr.top; it.w = r.width; it.h = r.height; it.m = r.width > 0;
    };
    L.invalidate = function () { each(L.items, function (it) { it.m = false; }); };
    function hit(x, y, w, h, list, n, pad) {
      for (var i = 0; i < n; i++) { var r = list[i]; if (x < r[0] + r[2] + pad && x + w + pad > r[0] && y < r[1] + r[3] + pad && y + h + pad > r[1]) return true; }
      return false;
    }
    function obstacles() {
      var n = 0, av = o.avoid, list = null, ex = L.extra ? L.extra() : null;
      /* fixed marks (an explorer's pins) count as obstacles too: [[x, y, w, h], ...] */
      for (var e2 = 0; ex && e2 < ex.length; e2++) { var r0 = obs[n] || (obs[n] = [0, 0, 0, 0]); r0[0] = ex[e2][0]; r0[1] = ex[e2][1]; r0[2] = ex[e2][2]; r0[3] = ex[e2][3]; n++; }
      if (!av) return n;
      if (typeof av === 'function') list = av();
      else { list = []; v.scene.walk(function (m) { if (m.geom && m.geom.solid && m._ev && (m.layer || 0) >= 0) list.push(m); }); }
      for (var i = 0; list && i < list.length; i++) {
        var m = list[i]; if (!m || !m.geom || !m._ev) continue;
        var g = m.geom.bb, x0 = INF, y0 = INF, x1 = -INF, y1 = -INF;
        for (var c = 0; c < 8; c++) {
          var p = v.project(m4x.tp(m.wm, [g[c & 1 ? 3 : 0], g[c & 2 ? 4 : 1], g[c & 4 ? 5 : 2]]));
          if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1];
        }
        var r = obs[n] || (obs[n] = [0, 0, 0, 0]); r[0] = x0; r[1] = y0; r[2] = x1 - x0; r[3] = y1 - y0; n++;
      }
      return n;
    }
    L.layout = function () {
      var Wd = v.w, Hd = v.h, gap = o.gap == null ? 6 : o.gap, pad = 4, vis = [], i, it, nl = 0;
      if (!Wd || !Hd) return;
      for (i = 0; i < L.items.length; i++) {
        it = L.items[i];
        var on = typeof it.show === 'function' ? !!it.show() : it.show !== false;
        if (it.n && !it.n._ev) on = false;
        var at = typeof it.at === 'function' ? it.at() : it.at;
        if (on && at) {
          var p = v.project(it.n ? m4x.tp(it.n.wm, at) : at);
          if (!p[3]) on = false; else { it.ax = p[0]; it.ay = p[1]; }
        }
        if (it.el.style.display === 'none' && on) it.el.style.display = '';
        if (!on) { it.vis = false; continue; }
        if (!it.m) L.measure(it);
        if (!it.m) continue;
        it.vis = true;
        if (o.column === 'right') { it.x0 = Wd - (o.colPad || 12) - it.w; it.y0 = it.ay - it.h / 2; }
        else { it.x0 = it.ax + it.dx; it.y0 = it.ay + it.dy; }
        vis.push(it);
      }
      /* the column stands just right of the anchors (the drawing's right edge), not at the far edge of a wide stage */
      if (o.column === 'right' && vis.length) {
        var cxm = -INF, cw = 0;
        for (i = 0; i < vis.length; i++) { if (vis[i].ax > cxm) cxm = vis[i].ax; if (vis[i].w > cw) cw = vis[i].w; }
        v.scene.walk(function (m) {
          if (!m.geom || !m._ev || m.nofit || m._ea < .05) return;
          var g = m.geom.bb;
          for (var c = 0; c < 8; c++) { var p = v.project(m4x.tp(m.wm, [g[c & 1 ? 3 : 0], g[c & 2 ? 4 : 1], g[c & 4 ? 5 : 2]])); if (p[0] > cxm) cxm = p[0]; }
        });
        var colX = M.min(Wd - (o.colPad || 12) - cw, cxm + (o.colGap || 24));
        for (i = 0; i < vis.length; i++) vis[i].x0 = colX;
      }
      vis.sort(function (a, b) { return a.y0 - b.y0; });
      var no = obstacles(), placed = 0, last = -INF;
      for (i = 0; i < vis.length; i++) {
        it = vis[i];
        var x = clamp(it.x0, pad, M.max(pad, Wd - pad - it.w)), y = it.y0, ok = false, k;
        /* an anchor outside the frame keeps its own place (the stage clips it), and takes no room from the others */
        if (it.ax < -2 || it.ax > Wd + 2 || it.ay < -2 || it.ay > Hd + 2) { it.x = it.x0; it.y = it.y0; it.out = true; continue; }
        it.out = false;
        /* a label set to one side of its anchor flips to the other side when its own side runs out of frame */
        var side = it.x0 + it.w <= it.ax + 1 || it.x0 >= it.ax - 1, xm = 2 * it.ax - it.x0 - it.w;
        if (side && o.column !== 'right' && ((it.x0 < pad && xm + it.w <= Wd - pad) || (it.x0 + it.w > Wd - pad && xm >= pad))) x = xm;
        if (o.column === 'right') {
          y = M.max(y, last + gap); last = y + it.h;
        } else {
          /* a label set below its anchor looks for room further down first; one set above, further up */
          var down = it.dy > -it.h * .5 ? 1 : -1;
          for (k = 0; k < 7 && !ok; k++) {
            var dy = k === 0 ? 0 : (k <= 3 ? down * k : -down * (k - 3)) * (it.h + gap), yy = y + dy;
            if (yy < pad || yy + it.h > Hd - pad) continue;
            if (!hit(x, yy, it.w, it.h, rects, placed, gap / 2) && !hit(x, yy, it.w, it.h, obs, no, 2)) { y = yy; ok = true; }
          }
          if (!ok) y = clamp(y, pad, M.max(pad, Hd - pad - it.h));
        }
        var r = rects[placed] || (rects[placed] = [0, 0, 0, 0]); r[0] = x; r[1] = y; r[2] = it.w; r[3] = it.h; placed++;
        it.x = x; it.y = y;
      }
      if (o.column === 'right' && vis.length) {
        var over = vis[vis.length - 1].y + vis[vis.length - 1].h - (Hd - pad);
        if (over > 0) for (i = 0; i < vis.length; i++) vis[i].y = M.max(pad, vis[i].y - over);
      }
      for (i = 0; i < vis.length; i++) {
        it = vis[i];
        it.el.style.transform = 'translate(' + (it.x - it.dx).toFixed(1) + 'px,' + (it.y - it.dy).toFixed(1) + 'px)';
        var moved = !it.out && (M.abs(it.x - it.x0) + M.abs(it.y - it.y0) > 3 || o.column === 'right');
        if (moved && it.leader !== false) {
          var ln = lines[nl] || (lines[nl] = svg.appendChild(D.createElementNS('http://www.w3.org/2000/svg', 'line')));
          var tx = clamp(it.ax, it.x, it.x + it.w), ty = clamp(it.ay, it.y, it.y + it.h);
          if (o.column === 'right') { tx = it.x - 4; ty = it.y + it.h / 2; }
          ln.setAttribute('x1', it.ax.toFixed(1)); ln.setAttribute('y1', it.ay.toFixed(1)); ln.setAttribute('x2', tx.toFixed(1)); ln.setAttribute('y2', ty.toFixed(1));
          ln.style.display = ''; nl++;
        }
      }
      for (i = nl; i < lines.length; i++) lines[i].style.display = 'none';
    };
    v.on('resize', function () { L.invalidate(); });
    return L;
  };

  /* ---------------- debug + QA hooks ---------------- */
  function hex(c) { return '#' + c.map(function (x) { return (x < 16 ? '0' : '') + x.toString(16); }).join('').toUpperCase(); }
  P.debug = {
    renderAll: function () {
      var n = 0; P._forced = true;
      try { each(VIEWS, function (v) { if (v.R && !v.dead) { v.dirty = true; v.render(); n++; } }); } finally { P._forced = false; }
      return n;
    },
    tick: function (ms) { var n = M.ceil((ms == null ? 16 : ms) / (1000 / 60)); for (var i = 0; i < n; i++) { stepAnims(1 / 60, now()); each(VIEWS, function (v) { each(v.ticks, function (f) { f(1 / 60, now()); }); }); } return P.debug.renderAll(); },
    views: function () {
      var r = []; each(VIEWS, function (v) { r.push({ id: v.id, renderer: v.kind, live: v.kind === 'gl' && !!v.R && !v.R.lost, frames: v.frames, vis: v.vis, dpr: v.dpr, calls: v.calls, q: v.q, w: v.w, h: v.h, cw: v.canvas.width, ch: v.canvas.height }); });
      return r;
    },
    lose: function (i) { var v = VIEWS[i || 0]; if (v && v.kind === 'gl' && v.R) { v._parked = false; v.R.lose(); return true; } return false; },
    restore: function (i) { var v = VIEWS[i || 0]; if (v && v.kind === 'gl' && v.R) { v.R.restore(); return true; } return false; },
    fps: function () { var t = now(); while (FR.length && t - FR[0] > 1000) FR.shift(); return FR.length; },
    palette: function () { P.theme(); var o = {}; for (var k in THEME255) o[k] = hex(THEME255[k]); return o; },
    anims: function () { return ANIMS.length; },
    /* PS3D.debug.poster(target, {w, h, surface, rest: true, plates, fill}) -> an SVG string of the drawing at rest, from the same
       camera framing at that aspect (target: a View, an Explorer, a Hero, a stage, or a loaded model id). Needs c2d.js:
       PS3D.load('c2d').then(...). Paste it as the host's .ps3d-poster; it carries data-reg="1" for the no-fade handoff. */
    poster: function (target, o) { if (!P._poster) { warn('poster', 'load c2d first: PS3D.load("c2d")'); return ''; } return P._poster(target, o || {}); },
    views_: VIEWS
  };
  if (DEBUG) {
    var ov = null;
    setInterval(function () {
      if (!D.body) return;
      if (!ov) { ov = D.createElement('pre'); ov.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:9999;margin:0;padding:8px 10px;font:11px/1.4 ui-monospace,Menlo,monospace;background:rgba(0,0,0,.78);color:#fff;pointer-events:none;border-radius:6px'; D.body.appendChild(ov); }
      var s = 'fps ' + P.debug.fps() + '  live gl ' + liveGL() + '/' + cap() + '\n';
      each(VIEWS, function (v) { s += '#' + v.id + ' ' + v.kind + ' dpr ' + v.dpr + ' calls ' + v.calls + ' q' + v.q + (v.vis ? ' vis' : '') + (v._parked ? ' parked' : '') + '\n'; });
      ov.textContent = s;
    }, 500);
  }
})();
