/* P.S. Lab kit v1: window.LAB_KIT, the loader and the shared parts for the machines in /assets/lab.
   ES5, no build step. A module registers with LAB_KIT.mount(slug, null, init); the kit loads it when its frame nears
   the viewport (or when the Index, Deal, the Window or a deep link targets it), hands it a root and a context,
   pauses it off screen, and keeps any error inside the machine. The handbook lives with the integration notes. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.LAB_KIT && W.LAB_KIT.v >= 1) return;
  var BASE = '/assets/lab/', SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif', MINUS = '−';
  var K = { v: 1 };
  K.debug = /(^|[?&])labdebug=1(&|$)/.test(location.search);
  function each(list, fn) { Array.prototype.forEach.call(list || [], fn); }
  function now() { return W.performance && performance.now ? performance.now() : Date.now(); }
  function rm(arr, x) { var i = arr ? arr.indexOf(x) : -1; if (i >= 0) arr.splice(i, 1); }

  /* ---------- safety: nothing a module does may throw into the page ---------- */
  var warned = {};
  function warn(tag, e) {
    var k = (tag || 'kit') + '|' + ((e && e.message) || String(e));
    if (warned[k]) return;
    warned[k] = 1;
    try { console.warn('[lab:' + (tag || 'kit') + ']', e); } catch (x) {}
  }
  K.guard = function (fn, tag) {
    if (typeof fn !== 'function') return function () {};
    return function () { try { return fn.apply(this, arguments); } catch (e) { warn(tag, e); } };
  };
  function slugOf(el) {
    var r = el && el.closest ? el.closest('[data-lab-root]') : null;
    return r ? r.getAttribute('data-lab-root') : 'kit';
  }
  K.on = function (root, type, selector, fn) {
    if (!root || !root.addEventListener) return function () {};
    if (typeof selector === 'function') { fn = selector; selector = null; }
    var g = K.guard(fn, slugOf(root)), cap = /^(focus|blur|mouseenter|mouseleave|load|error|scroll|toggle)$/.test(type);
    function h(ev) {
      if (!selector) { g.call(root, ev, root); return; }
      var t = ev.target;
      if (t && t.nodeType !== 1) t = t.parentElement;
      var m = t && t.closest ? t.closest(selector) : null;
      if (m && root.contains(m)) g.call(m, ev, m);
    }
    root.addEventListener(type, h, cap);
    return function () { root.removeEventListener(type, h, cap); };
  };
  K.hook = function (slug, obj) { if (K.debug) { W.__lab = W.__lab || {}; W.__lab[slug] = obj; } };

  /* ---------- page helpers: the page's own when it exports them (one colour cache), identical fallbacks elsewhere ---------- */
  var DE = D.documentElement;
  function PG() { return W.LAB_PAGE || null; }
  function tkey() { return (DE.getAttribute('data-theme') || '') + '|' + (DE.getAttribute('data-tone') || ''); }
  function rgbOf(str) {
    var m = String(str || '').match(/-?\d*\.?\d+(e-?\d+)?/g) || [];
    if (/^\s*color\(srgb/.test(str)) return [Math.round(+m[0] * 255), Math.round(+m[1] * 255), Math.round(+m[2] * 255)];
    return m.length >= 3 ? [Math.round(+m[0]), Math.round(+m[1]), Math.round(+m[2])] : [18, 17, 16];
  }
  var fb = { ink: null, inkK: null, acc: null, accK: null, probe: null, cc: {} };
  function fbInk(a) {
    var k = tkey();
    if (!fb.ink || fb.inkK !== k) { fb.ink = rgbOf(getComputedStyle(D.body).color); fb.inkK = k; }
    return 'rgba(' + fb.ink[0] + ',' + fb.ink[1] + ',' + fb.ink[2] + ',' + a + ')';
  }
  function fbAccRGB() {
    var k = tkey();
    if (fb.acc && fb.accK === k) return fb.acc.slice();
    var v = getComputedStyle(DE).getPropertyValue('--accent').trim(), out;
    if (v && v[0] === '#') {
      if (v.length === 4) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
      out = [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)];
    } else { var m = (v || '').match(/\d+/g); out = m && m.length >= 3 ? [+m[0], +m[1], +m[2]] : [255, 77, 0]; }
    fb.acc = out; fb.accK = k;
    return out.slice();
  }
  function fbLabColor(name) {
    var k = tkey() + name;
    if (fb.cc[k]) return fb.cc[k];
    try {
      if (!fb.probe) {
        fb.probe = D.createElement('i');
        fb.probe.setAttribute('aria-hidden', 'true');
        fb.probe.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none';
        (D.querySelector('.exp') || D.body).appendChild(fb.probe);
      }
      fb.probe.style.color = 'var(' + name + ')';
      var c = rgbOf(getComputedStyle(fb.probe).color);
      return (fb.cc[k] = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')');
    } catch (e) { return fbInk(0.8); }
  }
  K.ACCRGB = function () { var p = PG(); return p ? p.ACCRGB() : fbAccRGB(); };
  K.ACC = function () { var p = PG(); if (p) return p.ACC(); var c = fbAccRGB(); return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; };
  K.ACCA = function (a) { var p = PG(); if (p) return p.ACCA(a); var c = fbAccRGB(); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; };
  K.inkColor = function (a) { var p = PG(); return p ? p.inkColor(a) : fbInk(a); };
  /* a token as a canvas colour; pass scope (for example a .lk-desk) to resolve the token where it is redefined */
  function scopedColor(name, el) {
    var k = tkey() + name, cc = el._lkCC && el._lkCC.k === tkey() ? el._lkCC : (el._lkCC = { k: tkey() });
    if (cc[k]) return cc[k];
    var i = D.createElement('i');
    i.setAttribute('aria-hidden', 'true');
    i.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none;color:var(' + name + ')';
    el.appendChild(i);
    var c = rgbOf(getComputedStyle(i).color);
    el.removeChild(i);
    return (cc[k] = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')');
  }
  K.labColor = function (name, scope) {
    if (scope && scope.appendChild) { try { return scopedColor(name, scope); } catch (e) { return K.inkColor(0.8); } }
    var p = PG(); return p ? p.labColor(name) : fbLabColor(name);
  };
  K.labColorA = function (name, a, scope) { var c = rgbOf(K.labColor(name, scope)); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; };
  K.LBL = function (px) { px = Math.max(10, px || 10); var p = PG(); return p ? p.LBL(px) : '600 ' + px + 'px ' + SANS; };
  K.snap = function (v) { return Math.round(v) + 0.5; };
  K.fitCanvas = function (c, cssH) {
    var p = PG();
    if (p) return p.fitCanvas(c, cssH);
    var d = W.devicePixelRatio || 1, w = c.clientWidth;
    if (w > 0) {
      var bh = c.offsetHeight - c.clientHeight;
      if (Math.abs(c.offsetHeight - (cssH + bh)) > 0.5) c.style.height = (cssH + bh) + 'px';
      var pw = Math.round(w * d), ph = Math.round(cssH * d);
      if (c.width !== pw || c.height !== ph) { c.width = pw; c.height = ph; }
    }
    var x = c.getContext('2d');
    x.setTransform(d, 0, 0, d, 0, 0);
    return { ctx: x, W: w, H: cssH };
  };
  /* the house canvas label (the page's cvText, same defaults); o.desk sets on-dark ink and a dark halo, o.halo may be a colour */
  K.cvText = function (ctx, str, x, y, o) {
    o = o || {};
    ctx.save();
    ctx.font = o.font || K.LBL(o.px || 10);
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = o.base || 'alphabetic';
    if ('letterSpacing' in ctx) ctx.letterSpacing = o.ls != null ? o.ls : (o.font ? '0px' : '1px');
    var t = o.raw ? String(str) : String(str).toUpperCase();
    if (o.halo !== false) {
      ctx.lineJoin = 'round'; ctx.lineWidth = o.hw || 6;
      ctx.strokeStyle = typeof o.halo === 'string' ? o.halo : o.desk ? K.labColor('--dark') : K.labColor('--card');
      ctx.strokeText(t, x, y);
    }
    ctx.fillStyle = o.color || (o.desk ? K.labColorA('--on-dark', 0.72) : K.inkColor(0.72));
    ctx.fillText(t, x, y);
    ctx.restore();
  };
  /* a painter: theme changes and resizes call it, it skips while its machine is off screen, and the page calls it once on return */
  K.repaint = function (fn, el) {
    var exp = el && el.closest ? el.closest('.exp') : null, g = K.guard(fn, slugOf(el));
    var w = function () { if (exp && exp._vis === false) return; g(); };
    (W.LABREPAINT = W.LABREPAINT || []).push(w);
    if (exp) (exp._paints = exp._paints || []).push(w);
    return function () { rm(W.LABREPAINT, w); if (exp) rm(exp._paints, w); };
  };
  K.onTheme = function (cb) {
    var g = K.guard(cb, 'theme'), q = 0;
    function h() { if (q) return; q = requestAnimationFrame(function () { q = 0; g(); }); }
    W.addEventListener('pstheme', h);
    return function () { W.removeEventListener('pstheme', h); if (q) cancelAnimationFrame(q); q = 0; };
  };

  /* ---------- visibility, motion, focus, voice ---------- */
  K.inView = function (el, cb) {
    if (!el) return function () {};
    var g = K.guard(cb, slugOf(el)), st = { io: true, prev: true }, io = null;
    function ev() { var v = st.io && !D.hidden; if (v !== st.prev) { st.prev = v; g(v); } }
    if ('IntersectionObserver' in W) {
      io = new IntersectionObserver(function (es) { st.io = es[es.length - 1].isIntersecting; ev(); }, { rootMargin: '100% 0px' });
      io.observe(el);
    }
    D.addEventListener('visibilitychange', ev);
    return function () { if (io) io.disconnect(); D.removeEventListener('visibilitychange', ev); };
  };
  K.visible = function (el) {
    if (!el || D.hidden) return false;
    if (el.classList && el.classList.contains('exp') && typeof el._vis === 'boolean') return el._vis;
    var r = el.getBoundingClientRect();
    if (!r.width && !r.height) return false;
    return r.bottom > -160 && r.top < (W.innerHeight || DE.clientHeight) + 160;
  };
  /* a 3D scene goes through the site engine (/assets/3d): it starts near the viewport, rests off screen and in hidden tabs,
     caps DPR at 2, recovers a lost context and falls back to 2D. Modules load core.js first, then call this. */
  K.scene = function (host, id, opts) {
    var P = W.PS3D;
    if (!P || typeof P.mount !== 'function') return Promise.reject(new Error('the 3D engine is not loaded'));
    if (!host) return Promise.reject(new Error('no host for the 3D scene ' + id));
    return P.mount(host, id, opts || {});
  };
  var rmq = null;
  try { rmq = W.matchMedia('(prefers-reduced-motion: reduce)'); } catch (e) {}
  K.reducedMotion = function () { return !!(rmq && rmq.matches); };
  K.ease = function (t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); };
  K.tween = function (ms, step, done) {
    var gs = K.guard(step, 'tween'), gd = K.guard(done, 'tween'), raf = 0, over = false, t0 = 0;
    function end() { over = true; gs(1, 1); gd(); }
    if (K.reducedMotion() || D.hidden || !(ms > 0)) { end(); return function () {}; }
    function f(t) {
      if (over) return;
      if (!t0) t0 = t;
      var r = Math.min(1, (t - t0) / ms);
      if (r >= 1) { end(); return; }
      gs(K.ease(r), r);
      raf = requestAnimationFrame(f);
    }
    raf = requestAnimationFrame(f);
    return function (finish) { if (over) return; over = true; if (raf) cancelAnimationFrame(raf); if (finish) { gs(1, 1); gd(); } };
  };
  function scrollToY(y, smooth) {
    y = Math.max(0, Math.round(y));
    try { W.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'instant' }); } catch (e) { W.scrollTo(0, y); }
  }
  function layoutTop(el) { var y = 0, n = el; while (n) { y += n.offsetTop; n = n.offsetParent; } return y; }
  /* the page's own landing line (html scroll-padding-top), so a re-anchor after a mount lands where PS.land put it */
  function padTop() { var v = 0; try { v = parseFloat(getComputedStyle(DE).scrollPaddingTop); } catch (e) {} return v > 0 ? v : 84; }
  K.focus = function (el, o) {
    if (!el || !el.focus) return;
    if (!el.matches('a[href], button, input, select, textarea, summary, [tabindex]')) el.setAttribute('tabindex', '-1');
    try { el.focus({ preventScroll: true }); } catch (e) { try { el.focus(); } catch (x) {} }
    if (o && o.scroll) {
      var r = el.getBoundingClientRect(), vh = W.innerHeight || DE.clientHeight, top = 96;
      if (r.top < top - 16 || r.bottom > vh) {
        var dy = (r.top < top - 16 || r.height > vh - top - 24) ? r.top - top : r.bottom - vh + 24;
        scrollToY(W.pageYOffset + dy, !K.reducedMotion());
      }
    }
  };
  var live = null, sayQ = [], sayT = 0;
  K.say = function (text) {
    try {
      if (!live) {
        live = D.createElement('p');
        live.className = 'vh';
        live.setAttribute('aria-live', 'polite');
        D.body.appendChild(live);
      }
      sayQ.push(String(text == null ? '' : text));
      if (sayT) return;
      live.textContent = '';
      sayT = setTimeout(function () { live.textContent = sayQ.join(' '); sayQ = []; sayT = 0; }, 80);
    } catch (e) {}
  };
  K.copy = function (text) {
    text = String(text == null ? '' : text);
    function legacy() {
      var ae = D.activeElement, ok = false;
      try {
        var ta = D.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none';
        D.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
        ok = !!(D.execCommand && D.execCommand('copy'));
        D.body.removeChild(ta);
      } catch (e) { ok = false; }
      try { if (ae && ae.focus) ae.focus({ preventScroll: true }); } catch (e) {}
      return ok;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText && W.isSecureContext !== false) {
        return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacy(); });
      }
    } catch (e) {}
    return Promise.resolve(legacy());
  };
  /* a 1200 x 630 card on paper with the P.S. mark, saved to the visitor's own disk; nothing is uploaded.
     Moved here from the World's rooms in v3.1 (Make the call and Predictions, checked use it). */
  K.savePNG = function (name, label, title, sub, dots) {
    var c = D.createElement('canvas'), x;
    c.width = 1200; c.height = 630; x = c.getContext('2d');
    var ink = '#121110', ink2 = '#55524B', foil = '#FF4D00', serif = 'Georgia, "Times New Roman", serif', sans = SANS;
    x.fillStyle = '#F6F4ED'; x.fillRect(0, 0, 1200, 630);
    x.textBaseline = 'alphabetic';
    x.font = '400 150px ' + serif;
    var px = 80;
    [['P', ink], ['.', foil], ['S', ink], ['.', foil]].forEach(function (g) {
      px -= g[0] === '.' ? 9 : g[0] === 'S' ? 3 : 0;
      x.fillStyle = g[1]; x.fillText(g[0], px, 178); px += x.measureText(g[0]).width;
    });
    function tracked(t, X, Y, sp) { for (var i = 0; i < t.length; i++) { x.fillText(t[i], X, Y); X += x.measureText(t[i]).width + sp; } }
    x.fillStyle = ink2; x.font = '500 22px ' + sans; tracked(String(label).toUpperCase(), 80, 398, 2.2);
    x.fillStyle = ink; x.font = '400 64px ' + serif; x.fillText(title, 80, 484);
    x.fillStyle = ink2; x.font = '400 22px ' + sans; x.fillText(sub, 80, 550);
    (dots || []).forEach(function (on, k) {
      var cx = 1120 - (dots.length - 1 - k) * 34;
      x.beginPath(); x.arc(cx, 128, 11, 0, Math.PI * 2);
      if (on) { x.fillStyle = ink; x.fill(); } else { x.strokeStyle = ink2; x.lineWidth = 1.5; x.stroke(); }
    });
    var a = D.createElement('a');
    a.download = name; a.href = c.toDataURL('image/png');
    D.body.appendChild(a); a.click(); a.remove();
  };
  /* built from the ampersand's char code, so no entity ever sits in this file's source */
  var AMP = String.fromCharCode(38), ESC = { '&': AMP + 'amp;', '<': AMP + 'lt;', '>': AMP + 'gt;', '"': AMP + 'quot;', "'": AMP + '#39;' };
  K.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); };
  K.raw = function (html) { return { html: String(html == null ? '' : html) }; };
  function T(v) { if (v == null) return ''; if (typeof v === 'object' && v.html != null) return String(v.html); return K.esc(v); }
  function plain(v) {
    if (v == null) return '';
    if (typeof v === 'object' && v.html != null) { var d = D.createElement('div'); d.innerHTML = String(v.html); return d.textContent.replace(/\s+/g, ' ').trim(); }
    return String(v);
  }
  K.store = function (slug) {
    var k = 'psLab.' + slug;
    return {
      key: k,
      get: function () { try { var s = localStorage.getItem(k); return s ? JSON.parse(s) : null; } catch (e) { return null; } },
      set: function (o) { try { localStorage.setItem(k, JSON.stringify(o)); return true; } catch (e) { return false; } },
      clear: function () { try { localStorage.removeItem(k); } catch (e) {} }
    };
  };
  /* every range in a root carries its value as --sfill for the foil track; wide tables learn whether they overflow */
  function sfOne(r) {
    var lo = parseFloat(r.min) || 0, hi = parseFloat(r.max), v = parseFloat(r.value);
    if (isNaN(hi)) hi = 100;
    var p = hi > lo ? Math.max(0, Math.min(100, (v - lo) / (hi - lo) * 100)) : 0;
    r.style.setProperty('--sfill', p.toFixed(2) + '%');
  }
  function scOne(s) {
    var o = s.scrollWidth > s.clientWidth + 2;
    s.classList.toggle('is-ovf', o);
    s.classList.toggle('at-end', !o || s.scrollLeft + s.clientWidth >= s.scrollWidth - 4);
    if (!s._lkSc) { s._lkSc = 1; s.addEventListener('scroll', function () { scOne(s); }, { passive: true }); }
  }
  K.sfill = function (root) {
    if (!root || !root.querySelectorAll) return;
    try { each(root.querySelectorAll('input[type=range]'), sfOne); each(root.querySelectorAll('.lk-scroll'), scOne); } catch (e) { warn('kit', e); }
  };

  /* ---------- randomness: mulberry32, identical to the page's cvRng; draw counts are part of the contract ---------- */
  K.seed = function () { return (Date.now() ^ Math.floor(Math.random() * 4294967296)) >>> 0; };
  K.rng = function (seed) {
    var t = seed >>> 0;
    function r() {
      t += 0x6D2B79F5;
      var x = Math.imul(t ^ t >>> 15, 1 | t);
      x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
      return ((x ^ x >>> 14) >>> 0) / 4294967296;
    }
    r.normal = function () { var u = Math.max(r(), 1e-9), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    r.int = function (n) { return Math.floor(r() * n); };
    r.pick = function (a) { return a[Math.floor(r() * a.length)]; };
    r.shuffle = function (a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
    r.range = function (lo, hi) { return lo + (hi - lo) * r(); };
    r.chance = function (p) { return r() < p; };
    r.state = function () { return t >>> 0; };
    return r;
  };

  /* ---------- numbers: grouped, U+2212 for negatives, never locale-dependent ---------- */
  function grp(s) { return s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function fx(v, d) { var p = Math.abs(v).toFixed(d).split('.'); return grp(p[0]) + (p[1] ? '.' + p[1] : ''); }
  function isNeg(v, d) { return v < 0 && +Math.abs(v).toFixed(d) !== 0; }
  function sgn(v, d, plus) { return isNeg(v, d) ? MINUS : (plus && v > 0 && +Math.abs(v).toFixed(d) !== 0 ? '+' : ''); }
  function bad(v) { return typeof v !== 'number' || !isFinite(v); }
  var NA = '–', SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  var F = K.fmt = { minus: MINUS };
  F.n = function (v, d) { d = d == null ? 0 : d; return bad(v) ? NA : sgn(v, d) + fx(v, d); };
  F.usd = function (v, d) { d = d == null ? 0 : d; return bad(v) ? NA : sgn(v, d) + '$' + fx(v, d); };
  F.M = function (v, d) { if (bad(v)) return NA; var a = Math.abs(v); d = d == null ? (a < 1 ? 2 : a < 10 ? 1 : 0) : d; return sgn(v, d) + '$' + fx(v, d) + 'M'; };
  F.B = function (v, d) { d = d == null ? 1 : d; return bad(v) ? NA : sgn(v, d) + '$' + fx(v, d) + 'B'; };
  F.pct = function (f, d, plus) { d = d == null ? 0 : d; if (bad(f)) return NA; var v = f * 100; return sgn(v, d, plus) + fx(v, d) + '%'; };
  F.pp = function (p, d, plus) { d = d == null ? 1 : d; return bad(p) ? NA : sgn(p, d, plus) + fx(p, d) + ' pts'; };
  F.x = function (v, d, prefix) { d = d == null ? 2 : d; if (bad(v)) return NA; var s = sgn(v, d) + fx(v, d); return prefix ? '×' + s : s + '×'; };
  F.signed = function (v, d) { d = d == null ? 1 : d; return bad(v) ? NA : sgn(v, d, true) + fx(v, d); };
  F.prob = function (p) {
    if (bad(p)) return NA;
    if (p <= 0) return '0%';
    if (p >= 1) return '100%';
    if (p < 0.005) return '<1%';
    if (p > 0.995) return '>99%';
    return Math.round(p * 100) + '%';
  };
  F.oneIn = function (p) { if (bad(p)) return NA; if (p <= 0) return '1 in ∞'; return '1 in ' + grp(String(Math.max(1, Math.round(1 / p)))); };
  F.sci = function (v, d) {
    d = d == null ? 1 : d;
    if (bad(v)) return NA;
    if (v === 0) return '0';
    var a = Math.abs(v), e = Math.floor(Math.log(a) / Math.LN10), m = +(a / Math.pow(10, e)).toFixed(d);
    if (m >= 10) { m = +(m / 10).toFixed(d); e++; }
    var es = String(Math.abs(e)).split('').map(function (c) { return SUP[+c]; }).join('');
    return (v < 0 ? MINUS : '') + m.toFixed(d) + ' × 10' + (e < 0 ? '⁻' : '') + es;
  };
  F.plural = function (n, one, many) { return n === 1 ? one : (many != null ? many : one + 's'); };
  F.num = function (s) {
    if (typeof s === 'number') return s;
    s = String(s == null ? '' : s).trim();
    if (!s) return NaN;
    var neg = false, mult = 1, m;
    if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
    s = s.replace(/[−‒–]/g, '-').replace(/[\s,$£€%×]/g, '').replace(/x$/i, '');
    if ((m = s.match(/(bn|mm|[kmbt])$/i))) {
      mult = { k: 1e3, m: 1e6, mm: 1e6, b: 1e9, bn: 1e9, t: 1e12 }[m[1].toLowerCase()];
      s = s.slice(0, -m[1].length);
    }
    if (s[0] === '-') { neg = !neg; s = s.slice(1); } else if (s[0] === '+') s = s.slice(1);
    if (!/^(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return NaN;
    var v = parseFloat(s) * mult;
    return neg ? -v : v;
  };

  /* ---------- small controls: a radio pill group, WAI-ARIA tabs, a four-dot meter ---------- */
  K.seg = function (el, onPick) {
    if (!el) return null;
    var g = K.guard(onPick, slugOf(el));
    function bs() { return Array.prototype.filter.call(el.children, function (b) { return b.tagName === 'BUTTON'; }); }
    function set(b, fire, foc) {
      bs().forEach(function (x) { var on = x === b; x.setAttribute('aria-checked', on ? 'true' : 'false'); x.setAttribute('tabindex', on ? '0' : '-1'); });
      if (foc) b.focus();
      if (fire) g(b.getAttribute('data-v'), b);
    }
    el.setAttribute('role', 'radiogroup');
    bs().forEach(function (b) { b.type = 'button'; b.setAttribute('role', 'radio'); });
    var cur = bs().filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0] || bs()[0];
    if (cur) set(cur, false);
    var o1 = K.on(el, 'click', 'button', function (ev, b) { if (b.parentNode === el && !b.disabled && b.getAttribute('aria-checked') !== 'true') set(b, true); });
    var o2 = K.on(el, 'keydown', 'button', function (ev, b) {
      var list = bs().filter(function (x) { return !x.disabled; }), i = list.indexOf(b), n = -1, k = ev.key;
      if (k === 'ArrowRight' || k === 'ArrowDown') n = (i + 1) % list.length;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') n = (i - 1 + list.length) % list.length;
      else if (k === 'Home') n = 0;
      else if (k === 'End') n = list.length - 1;
      if (n >= 0 && list[n]) { ev.preventDefault(); set(list[n], true, true); }
    });
    return {
      set: function (v) { var b = bs().filter(function (x) { return x.getAttribute('data-v') === String(v); })[0]; if (b) set(b, false); },
      value: function () { var b = bs().filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0]; return b ? b.getAttribute('data-v') : null; },
      off: function () { o1(); o2(); }
    };
  };
  K.tabs = function (el, onSelect) {
    if (!el) return null;
    var g = K.guard(onSelect, slugOf(el));
    function ts() { return Array.prototype.slice.call(el.querySelectorAll('[role="tab"]')); }
    function sel(t, fire, foc) {
      ts().forEach(function (x) {
        var on = x === t, p = D.getElementById(x.getAttribute('aria-controls'));
        x.setAttribute('aria-selected', on ? 'true' : 'false'); x.setAttribute('tabindex', on ? '0' : '-1');
        if (p) p.hidden = !on;
      });
      if (foc) t.focus();
      if (fire) g(ts().indexOf(t), t);
    }
    el.setAttribute('role', 'tablist');
    var cur = ts().filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || ts()[0];
    if (cur) sel(cur, false);
    var o1 = K.on(el, 'click', '[role="tab"]', function (ev, t) { sel(t, true); });
    var o2 = K.on(el, 'keydown', '[role="tab"]', function (ev, t) {
      var l = ts(), i = l.indexOf(t), n = -1, k = ev.key;
      if (k === 'ArrowRight') n = (i + 1) % l.length; else if (k === 'ArrowLeft') n = (i - 1 + l.length) % l.length;
      else if (k === 'Home') n = 0; else if (k === 'End') n = l.length - 1;
      if (n >= 0) { ev.preventDefault(); sel(l[n], true, true); }
    });
    return { select: function (i) { var t = typeof i === 'number' ? ts()[i] : D.getElementById(i); if (t) sel(t, false); }, off: function () { o1(); o2(); } };
  };
  K.meter = function (v, label) {
    v = Math.max(0, Math.min(4, +v || 0));
    var h = '<span class="lk-meter" role="img" aria-label="' + K.esc(label || (v + ' of 4')) + '">';
    for (var i = 0; i < 4; i++) h += '<i class="' + (v >= i + 1 ? 'is-on' : v >= i + 0.5 ? 'is-half' : '') + '"></i>';
    return h + '</span>';
  };

  /* ---------- knowledge: sources, the shelf, glossary, case file, takeaways, debrief, lessons ---------- */
  var SHELVES = {}, TERMS = {}, uid = 0;
  function nid(p) { uid += 1; return 'lk' + uid + '-' + p; }
  function link(s) {
    if (!s) return '';
    var t = T(s.t || s.u || 'Source'), u = String(s.u || '');
    if (!/^https?:\/\//i.test(u)) return t;
    return '<a href="' + K.esc(u) + '" target="_blank" rel="noopener">' + t + '<span class="vh"> (opens in a new tab)</span></a>';
  }
  function srcHTML(src) {
    if (!src) return '';
    var a = Array.isArray(src) ? src : [src];
    if (!a.length) return '';
    return (a.length > 1 ? 'Sources: ' : 'Source: ') + a.map(link).join('; ');
  }
  function noDot(s) { return String(s).replace(/[.\s]+$/, ''); }
  function expOf(el) { return el && el.closest ? el.closest('.exp') : null; }
  function expUrl(exp) { return 'pedrumshokouhi.com/experiments' + (exp && exp.id ? '#' + exp.id : ''); }
  function expName(exp) { var h = exp && exp.querySelector('h3'); return h ? h.textContent.replace(/\s+/g, ' ').trim() : 'The lab'; }

  K.caseFile = function (host, spec) {
    spec = spec || {};
    var hl = spec.level || 5, el = D.createElement('div'), h = '';
    el.className = 'lk-case';
    function sec(kind, label, items) {
      if (!items || !items.length) return '';
      return '<section class="lk-case-sec"><h' + hl + ' class="lk-case-h"><span class="lk-tag lk-tag--' + kind + '">' + label + '</span></h' + hl + '>' +
        '<ul class="lk-case-list">' + items.map(function (it) {
          var o = typeof it === 'object' && it ? it : { text: it }, body = o.html != null ? o.html : K.esc(o.text);
          return '<li>' + body + (o.asOf ? ' <span class="lk-asof">(as of ' + K.esc(o.asOf) + ')</span>' : '') +
            (o.src ? '<span class="lk-src">' + srcHTML(o.src) + '</span>' : '') + '</li>';
        }).join('') + '</ul></section>';
    }
    if (spec.disclaimer) h += '<p class="lk-case-disc"><span class="lk-tag lk-tag--warn">Read this first</span> ' + T(spec.disclaimer) + '</p>';
    h += '<p class="lk-lede">' + T(spec.lede != null ? spec.lede : 'What is real, what is a model assumption, and what is invented.') +
      (spec.asOf ? ' <span class="lk-asof">As of ' + K.esc(spec.asOf) + '.</span>' : '') + '</p>';
    h += sec('fact', 'Reported fact', spec.facts) + sec('assume', 'Model assumption', spec.assumptions) + sec('fiction', 'Fiction', spec.fiction);
    if (spec.sources && spec.sources.length) {
      h += '<details class="lk-bib"><summary>All sources (' + spec.sources.length + ')</summary><ol>' + spec.sources.map(function (s) {
        return '<li>' + link(s) + (s.note ? ' ' + T(s.note) : '') + '</li>';
      }).join('') + '</ol></details>';
    }
    el.innerHTML = h;
    if (host) host.appendChild(el);
    return el;
  };

  K.takeaways = function (host, spec) {
    spec = spec || {};
    var exp = expOf(host), items = spec.items || [], el = D.createElement('div'), tmr = 0;
    var pers = function () { return typeof spec.personal === 'function' ? K.guard(spec.personal, slugOf(host))() : spec.personal; };
    var p0 = pers();
    el.className = 'lk-take' + (spec.card === false ? '' : ' lk-card');
    el.innerHTML = (spec.title === false ? '' : '<h5 class="lk-take-title">' + T(spec.title || 'Take it with you') + '</h5>') +
      '<ol class="lk-take-list">' + items.map(function (it) { return '<li>' + T(it) + '</li>'; }).join('') + '</ol>' +
      (p0 ? '<p class="lk-take-me">' + T(p0) + '</p>' : '') +
      '<div class="lk-take-foot"><button type="button" class="ebtn2 lk-copy">Copy the list</button><span class="lk-take-url">' + K.esc(expUrl(exp)) + '</span></div>' +
      '<p class="lk-take-fail" hidden>Select the text and copy it.</p>' +
      '<textarea class="lk-take-plain" readonly hidden aria-label="The list as plain text"></textarea>';
    function text() {
      var p = pers(), out = [expName(exp) + ': what I took with me'];
      items.forEach(function (it, i) { out.push((i + 1) + '. ' + plain(it)); });
      if (p) out.push(plain(p));
      out.push(expUrl(exp));
      return out.join('\n');
    }
    var btn = el.querySelector('.lk-copy');
    K.on(btn, 'click', function () {
      var s = text();
      K.copy(s).then(function (ok) {
        if (ok) {
          btn.textContent = 'Copied'; K.say('Copied the list.');
          clearTimeout(tmr); tmr = setTimeout(function () { btn.textContent = 'Copy the list'; }, 2000);
        } else {
          var ta = el.querySelector('.lk-take-plain');
          ta.value = s; ta.hidden = false; el.querySelector('.lk-take-fail').hidden = false;
          try { ta.focus({ preventScroll: true }); ta.select(); } catch (e) {}
        }
      });
    });
    el._lkText = text;
    if (host) host.appendChild(el);
    return el;
  };

  K.shelf = function (host, cfg) {
    cfg = cfg || {};
    var slug = cfg.slug || slugOf(host), notes = (cfg.notes || []).slice(), byId = {}, NK = 'psLabNotes.' + slug;
    notes.forEach(function (n) { byId[n.id] = n; });
    var saved = { u: [], f: [], w: {} };
    try {
      var o = JSON.parse(localStorage.getItem(NK) || 'null');
      if (o && Array.isArray(o.u)) {
        saved.u = o.u.filter(function (i) { return byId[i]; });
        saved.f = (Array.isArray(o.f) ? o.f : []).filter(function (i) { return saved.u.indexOf(i) >= 0; });
        saved.w = o.w && typeof o.w === 'object' ? o.w : {};
      }
    } catch (e) {}
    function save() { try { localStorage.setItem(NK, JSON.stringify(saved)); } catch (e) {} }
    var scope = null, subs = [], badges = [], cur = null, meta = cfg.meta || '';
    var has = { notes: notes.length > 0, 'case': !!cfg.caseFile, take: !!(cfg.take && cfg.take.items && cfg.take.items.length) };
    var LBL = { notes: 'Field notes', 'case': 'Case file', take: 'Take it with you' }, ids = {};
    var el = D.createElement('div');
    el.className = 'lk-shelf';
    var h = '<div class="lk-shelf-bar" role="group" aria-label="What this machine teaches">';
    ['notes', 'case', 'take'].forEach(function (k) {
      ids[k] = nid(k);
      if (!has[k]) return;
      h += '<button type="button" class="ps-cap lk-shelf-btn" data-shelf="' + k + '" aria-expanded="false" aria-controls="' + ids[k] + '">' + LBL[k] +
        (k === 'notes' ? ' <span aria-hidden="true">·</span> <span class="lk-count">0</span> of <span class="lk-total">0</span>' : '') + '</button>';
    });
    h += '<span class="lk-shelf-meta"></span></div>';
    ['notes', 'case', 'take'].forEach(function (k) {
      if (!has[k]) return;
      h += '<div class="lk-drawer" id="' + ids[k] + '" data-shelf="' + k + '" role="region" aria-labelledby="' + ids[k] + '-h" hidden>' +
        '<div class="lk-drawer-head"><h4 class="lk-drawer-title" id="' + ids[k] + '-h" tabindex="-1">' + LBL[k] + '</h4>' +
        '<button type="button" class="lk-drawer-x" data-shelf-close="' + k + '">Close</button></div><div class="lk-drawer-body"></div></div>';
    });
    el.innerHTML = h;
    host.appendChild(el);
    function drawer(k) { return el.querySelector('.lk-drawer[data-shelf="' + k + '"]'); }
    function button(k) { return el.querySelector('.lk-shelf-btn[data-shelf="' + k + '"]'); }
    function inScope(id) { return !scope || scope.indexOf(id) >= 0; }
    function shown() { return notes.filter(function (n) { return inScope(n.id); }); }
    function cid(id) { return ids.notes + '-' + String(id).replace(/[^\w-]/g, '_'); }
    function card(n) {
      var un = saved.u.indexOf(n.id) >= 0, fresh = un && saved.f.indexOf(n.id) >= 0;
      var c = '<h5 class="lk-note-term" id="' + cid(n.id) + '-t" tabindex="-1">' + (un ? (fresh ? '<span class="vh">New field note: </span>' : '') : '<span class="vh">Locked: </span>') + T(n.term) + '</h5>';
      if (un) {
        c += '<p class="lk-note-body">' + (n.html != null ? n.html : K.esc(n.note)) + '</p>';
        if (saved.w[n.id]) c += '<p class="lk-note-where">Met in: ' + K.esc(saved.w[n.id]) + '</p>';
        if (n.src && (!Array.isArray(n.src) || n.src.length)) c += '<p class="lk-note-src">' + srcHTML(n.src) + '</p>';
      } else c += '<p class="lk-note-hint">Opens when ' + K.esc(noDot(n.hint || 'you meet it in the machine')) + '.</p>';
      return { cls: 'lk-note' + (un ? '' : ' is-locked') + (fresh ? ' is-new' : ''), html: c };
    }
    function renderNotes() {
      var d = drawer('notes');
      if (!d) return;
      var b = d.querySelector('.lk-drawer-body');
      b.innerHTML = '<p class="lk-lede">The ideas this machine runs on, in plain words. They open as you meet them and stay open in this browser.</p>' +
        '<ol class="lk-notes">' + shown().map(function (n) { var c = card(n); return '<li class="' + c.cls + '" data-note="' + K.esc(n.id) + '">' + c.html + '</li>'; }).join('') + '</ol>';
    }
    function renderCard(id) {
      var d = drawer('notes'), li = d && d.querySelector('li[data-note="' + String(id).replace(/"/g, '') + '"]');
      if (!li) return;
      var c = card(byId[id]); li.className = c.cls; li.innerHTML = c.html;
    }
    function count() { return shown().filter(function (n) { return saved.u.indexOf(n.id) >= 0; }).length; }
    function total() { return shown().length; }
    function paintCount(tick) {
      var n = count(), t = total(), b = button('notes');
      if (b) {
        var c = b.querySelector('.lk-count');
        c.textContent = n; b.querySelector('.lk-total').textContent = t;
        if (tick && !K.reducedMotion()) { c.classList.remove('is-tick'); void c.offsetWidth; c.classList.add('is-tick'); }
      }
      badges.forEach(function (x) { x.querySelector('.lk-count').textContent = n; x.querySelector('.lk-total').textContent = t; });
    }
    function clearFresh() {
      var before = saved.f.length;
      saved.f = saved.f.filter(function (id) { return !inScope(id); });
      if (saved.f.length !== before) save();
    }
    function close(refocus) {
      if (!cur) return;
      var k = cur, d = drawer(k), b = button(k);
      cur = null;
      d.hidden = true; d.classList.remove('is-opening');
      if (b) b.setAttribute('aria-expanded', 'false');
      if (k === 'notes') { clearFresh(); renderNotes(); }
      if (refocus && b) K.focus(b);
    }
    function open(k) {
      if (!has[k]) return;
      if (cur === k) return;
      close(false);
      var d = drawer(k), b = button(k), body = d.querySelector('.lk-drawer-body');
      if (k === 'notes') renderNotes();
      else if (k === 'case' && !body.firstChild) K.caseFile(body, cfg.caseFile);
      else if (k === 'take') { body.innerHTML = ''; K.takeaways(body, { items: cfg.take.items, personal: cfg.take.personal, title: false, card: false }); }
      cur = k; d.hidden = false;
      if (!K.reducedMotion()) { d.classList.remove('is-opening'); void d.offsetWidth; d.classList.add('is-opening'); }
      if (b) b.setAttribute('aria-expanded', 'true');
      K.sfill(d);
      K.focus(d.querySelector('.lk-drawer-title'), { scroll: true });
    }
    K.on(el, 'click', '.lk-shelf-btn', function (ev, b) { var k = b.getAttribute('data-shelf'); if (cur === k) close(true); else open(k); });
    K.on(el, 'click', '[data-shelf-close]', function () { close(true); });
    K.on(el, 'keydown', '.lk-drawer', function (ev) {
      if (ev.key !== 'Escape' || ev.defaultPrevented || !cur) return;
      ev.preventDefault(); close(true);
    });
    var api = {
      el: el,
      open: open,
      close: function () { close(false); },
      refresh: function () { renderNotes(); paintCount(false); if (cur === 'take') { var k = cur; cur = null; open(k); } },
      setMeta: function (t) { meta = t || ''; el.querySelector('.lk-shelf-meta').textContent = meta; },
      notes: {
        unlock: function (id, o) {
          o = o || {};
          var n = byId[id];
          if (!n) { if (K.debug) warn(slug, new Error('unknown field note: ' + id)); return false; }
          if (saved.u.indexOf(id) >= 0) return false;
          saved.u.push(id); saved.f.push(id);
          if (o.where) saved.w[id] = String(o.where);
          save();
          if (cur === 'notes') renderCard(id);
          paintCount(inScope(id));
          if (o.announce !== false && inScope(id)) K.say('New field note: ' + plain(n.term) + '.');
          subs.slice().forEach(function (cb) { K.guard(cb, slug)(id, n); });
          return true;
        },
        has: function (id) { return saved.u.indexOf(id) >= 0; },
        count: count,
        total: total,
        list: function () { return shown().filter(function (n) { return saved.u.indexOf(n.id) >= 0; }).map(function (n) { return n.id; }); },
        setScope: function (a) { scope = Array.isArray(a) ? a.filter(function (i) { return byId[i]; }) : null; renderNotes(); paintCount(false); },
        open: function (id) {
          if (cur !== 'notes') open('notes');
          var t = el.querySelector('#' + cid(id) + '-t');
          if (t) K.focus(t, { scroll: true });
        },
        onUnlock: function (cb) { subs.push(cb); return function () { rm(subs, cb); }; },
        badge: function () {
          var b = D.createElement('button');
          b.type = 'button'; b.className = 'ps-cap lk-mini';
          b.innerHTML = 'Notes <span aria-hidden="true">·</span> <span class="lk-count">0</span> of <span class="lk-total">0</span>';
          K.on(b, 'click', function () { open('notes'); });
          badges.push(b); paintCount(false);
          return b;
        }
      },
      _take: cfg.take || null,
      _notes: notes
    };
    if (cfg.scope) scope = cfg.scope.filter(function (i) { return byId[i]; });
    api.setMeta(meta);
    renderNotes();
    paintCount(false);
    SHELVES[slug] = api;
    return api;
  };

  K.term = function (key, label) {
    var auto = !label && !TERMS[key];
    return '<button type="button" class="lk-term" data-term="' + K.esc(key) + '" aria-expanded="false"' + (auto ? ' data-lk-auto="1"' : '') + '>' +
      K.esc(label || TERMS[key] || key) + '</button>';
  };
  K.glossary = function (root, defs) {
    if (!root) return function () {};
    var map = root._lkDefs = root._lkDefs || {};
    Object.keys(defs || {}).forEach(function (k) { map[k] = defs[k]; if (!TERMS[k]) TERMS[k] = defs[k].t || k; });
    /* terms rendered before their glossary was registered get their proper label now */
    each(root.querySelectorAll('.lk-term[data-lk-auto]'), function (b) {
      var d = map[b.getAttribute('data-term')];
      if (d && d.t) { b.textContent = d.t; b.removeAttribute('data-lk-auto'); }
    });
    if (root._lkGlOff) return root._lkGlOff;
    var open = null;
    function close(refocus) {
      if (!open) return;
      var o = open;
      open = null;
      if (o.def.parentNode) o.def.parentNode.removeChild(o.def);
      o.btn.setAttribute('aria-expanded', 'false'); o.btn.removeAttribute('aria-controls');
      if (refocus && D.body.contains(o.btn)) { try { o.btn.focus({ preventScroll: true }); } catch (e) {} }
    }
    function show(btn) {
      var key = btn.getAttribute('data-term'), d = map[key];
      if (!d) { warn(slugOf(root), new Error('no glossary entry: ' + key)); return; }
      var def = D.createElement('span'), sh = SHELVES[slugOf(root)];
      def.className = 'lk-def'; def.setAttribute('role', 'note'); def.id = nid('def');
      def.innerHTML = '<span class="lk-def-t">' + K.esc(d.t || key) + '</span>' + (d.html != null ? d.html : K.esc(d.d)) +
        (d.note && sh && sh.notes.has(d.note) ? ' <button type="button" class="lk-def-note" data-lk-note="' + K.esc(d.note) + '">Field note</button>' : '');
      var a = btn.closest('p, li, dd, figcaption, .lk-block, td, th');
      if (a && !root.contains(a)) a = null;
      if (a && /^(LI|DD|TD|TH)$/.test(a.tagName)) a.appendChild(def);
      else if (a) a.parentNode.insertBefore(def, a.nextSibling);
      else btn.parentNode.insertBefore(def, btn.nextSibling);
      btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-controls', def.id);
      open = { btn: btn, def: def };
    }
    var o1 = K.on(root, 'click', '.lk-term', function (ev, btn) {
      var same = open && open.btn === btn;
      close(false);
      if (!same) show(btn);
    });
    var o2 = K.on(root, 'click', '.lk-def-note', function (ev, b) { var sh = SHELVES[slugOf(root)]; if (sh) sh.notes.open(b.getAttribute('data-lk-note')); });
    function esc(ev) { if (ev.key === 'Escape' && open && !ev.defaultPrevented) { ev.preventDefault(); close(true); } }
    root.addEventListener('keydown', esc, true);
    root._lkGlOff = function () { o1(); o2(); root.removeEventListener('keydown', esc, true); close(false); root._lkGlOff = null; };
    return root._lkGlOff;
  };

  K.lesson = function (s) {
    s = s || {};
    var L = s.labels || {}, h = '<div class="lk-lesson">' + (s.title ? '<p class="lk-lesson-title">' + T(s.title) + '</p>' : '') + '<dl>';
    if (s.you != null) h += '<dt class="lk-lesson-you">' + K.esc(L.you || 'What you did') + '</dt><dd>' + T(s.you) + '</dd>';
    if (s.principle != null) h += '<dt>' + K.esc(L.principle || 'The principle') + '</dt><dd>' + T(s.principle) + '</dd>';
    if (s.history != null) h += '<dt>' + K.esc(L.history || 'What really happened') + '</dt><dd>' + T(s.history) + '</dd>';
    return h + '</dl>' + (s.src ? '<p class="lk-src">' + srcHTML(s.src) + '</p>' : '') + '</div>';
  };

  K.debrief = function (host, spec) {
    spec = spec || {};
    var slug = slugOf(host), sh = spec.shelf || SHELVES[slug], el = D.createElement('section'), tid = nid('db'), h = '';
    el.className = 'lk-debrief lk-in';
    el.setAttribute('aria-labelledby', tid);
    if (spec.kicker) h += '<p class="lk-kicker lk-kicker--foil">' + T(spec.kicker) + '</p>';
    h += '<h4 class="lk-title" id="' + tid + '" tabindex="-1">' + T(spec.title || 'The debrief') + (spec.sub ? ' <span class="lk-sub">' + T(spec.sub) + '</span>' : '') + '</h4>';
    if (spec.lede) h += '<p class="lk-lede">' + T(spec.lede) + '</p>';
    if (spec.stats && spec.stats.length) {
      h += '<div class="lk-stats">' + spec.stats.map(function (s) {
        return '<div class="lk-stat"><span class="lk-k">' + T(s.k) + '</span><span class="lk-v' + (s.tone === 'gain' || s.tone === 'loss' ? ' lk-' + s.tone : '') + '">' + T(s.v) + '</span></div>';
      }).join('') + '</div>';
    }
    (spec.sections || []).forEach(function (s) {
      h += '<section class="lk-debrief-sec">' + (s.label ? '<h5 class="lk-kicker">' + T(s.label) + '</h5>' : '') + (s.html || '') + '</section>';
    });
    if (spec.principles && spec.principles.length && sh) {
      var nb = {};
      (sh._notes || []).forEach(function (n) { nb[n.id] = n; });
      h += '<div class="lk-chips"><span class="lk-kicker">The principles in play</span>' + spec.principles.map(function (id) {
        var n = nb[id]; if (!n) return '';
        return sh.notes.has(id) ? '<button type="button" class="lk-chip-btn" data-lk-note="' + K.esc(id) + '">' + T(n.term) + '</button>'
          : '<button type="button" class="lk-chip-btn" disabled>' + T(n.term) + '<small>Opens when ' + K.esc(noDot(n.hint || 'you meet it in the machine')) + '</small></button>';
      }).join('') + '</div>';
    }
    if (spec.take) h += '<div class="lk-debrief-take"></div>';
    if (spec.actions && spec.actions.length) {
      h += '<div class="btnrow">' + spec.actions.map(function (a, i) {
        return '<button type="button" class="' + (a.primary ? 'ebtn' : 'ebtn2') + '" data-lk-act="' + i + '">' + T(a.label) + '</button>';
      }).join('') + '</div>';
    }
    el.innerHTML = h;
    host.appendChild(el);
    if (spec.take) {
      var tk = spec.take === true ? (sh && sh._take) : spec.take;
      if (tk && tk.items) K.takeaways(el.querySelector('.lk-debrief-take'), { items: tk.items, personal: tk.personal });
    }
    K.on(el, 'click', '.lk-chip-btn[data-lk-note]', function (ev, b) { if (sh) sh.notes.open(b.getAttribute('data-lk-note')); });
    K.on(el, 'click', '[data-lk-act]', function (ev, b) { var a = spec.actions[+b.getAttribute('data-lk-act')]; if (a && a.onClick) K.guard(a.onClick, slug)(ev); });
    K.sfill(el);
    K.focus(el.querySelector('.lk-title'), { scroll: true });
    return el;
  };

  /* ---------- the loader and the mount lifecycle ---------- */
  var S = {}, recs = {}, pend = null;
  /* v3.2: the machines that moved out of the page live in /assets/lab/m (data-dir="m") and stand on the page's canvas kit
     (canvas.js, loaded once before the first of them); a frame may name a shared part it needs first (data-needs="roulette").
     vitrine.js adds its surface to every context through K.ctxHooks. */
  K.ctxHooks = K.ctxHooks || [];
  var NET = { lean: false }, COARSE = false;
  try { var cn = navigator.connection; NET.lean = !!(cn && (cn.saveData || /(^|-)2g$/.test(cn.effectiveType || ''))); } catch (e) {}
  try { COARSE = W.matchMedia('(pointer: coarse)').matches; } catch (e) {}
  function mountEl(slug) { return D.querySelector('.lab-mount[data-lab="' + String(slug).replace(/"/g, '') + '"]'); }
  function dirOf(el) { return el && el.getAttribute('data-dir') === 'm' ? 'm/' : ''; }
  function needsOf(el) { return dirOf(el) ? (el.getAttribute('data-needs') || '').split(/\s+/).filter(Boolean) : []; }
  var once = {};
  function script(key, src) {
    if (once[key]) return once[key];
    return (once[key] = new Promise(function (res, rej) {
      var s = D.createElement('script');
      s.src = src; s.async = true;
      s.onload = function () { res(true); };
      s.onerror = function () { rej(new Error('could not load ' + src)); };
      D.head.appendChild(s);
    }));
  }
  function sheet(key, href) {
    if (once[key]) return once[key];
    return (once[key] = new Promise(function (res) {
      var l = D.createElement('link'), t = setTimeout(function () { res(false); }, 1500);
      l.rel = 'stylesheet'; l.href = href;
      l.onload = function () { clearTimeout(t); res(true); };
      l.onerror = function () { clearTimeout(t); res(false); };
      D.head.appendChild(l);
    }));
  }
  /* the shared canvas kit: on /experiments it is already in the head (deferred, before this file); elsewhere it loads once */
  function canvasKit() {
    if (W.LAB_PAGE) return Promise.resolve(true);
    var tag = D.querySelector('script[src*="/assets/lab/canvas.js"]');
    return script('canvas', tag ? tag.getAttribute('src') : BASE + 'canvas.js');
  }
  function fail(slug, e) {
    var st = S[slug] || (S[slug] = {});
    if (st.mounted || st.failed) return;
    st.failed = true; clearTimeout(st.timer);
    var el = mountEl(slug);
    if (el) {
      var h0 = el.offsetHeight, above = el.getBoundingClientRect().bottom < 0;
      el.setAttribute('data-lab-state', 'error'); el.setAttribute('aria-busy', 'false');
      var p = el.querySelector('.lk-wait');
      if (!p) { p = D.createElement('p'); el.appendChild(p); }
      p.className = 'lk-snag'; p.textContent = 'This machine did not load. Reload the page to try again.';
      settle(el, h0, above);
    }
    warn(slug, e);
  }
  function load(slug) {
    if (!slug) return;
    var st = S[slug] || (S[slug] = {}), el = mountEl(slug);
    if (st.req || !el || el._lk) return;
    st.req = true;
    var v = encodeURIComponent(el.getAttribute('data-v') || '1'), dir = dirOf(el), needs = needsOf(el);
    el.setAttribute('data-lab-state', 'loading'); el.setAttribute('aria-busy', 'true');
    var css = needs.map(function (n) { return sheet('css:' + dir + n, BASE + dir + n + '.css?v=' + v); });
    if (el.getAttribute('data-css') !== '0') css.push(sheet('css:' + dir + slug, BASE + dir + slug + '.css?v=' + v));
    st.css = Promise.all(css);
    st.css.then(function () { st.cssDone = true; });
    st.timer = setTimeout(function () { if (!st.mounted) fail(slug, new Error('the module never mounted')); }, 15000);
    var pre = dir ? canvasKit() : Promise.resolve(true);
    needs.forEach(function (n) { pre = pre.then(function () { return script('js:' + dir + n, BASE + dir + n + '.js?v=' + v); }); });
    pre.then(function () {
      var s = D.createElement('script');
      s.src = BASE + dir + slug + '.js?v=' + v; s.async = true;
      s.onerror = function () { fail(slug, new Error('could not load ' + BASE + dir + slug + '.js')); };
      D.head.appendChild(s);
    }, function (e) { fail(slug, e); });
  }
  K.load = load;
  /* a machine's files into the HTTP cache without running them: the next two after a mount, and an Index row under the hand */
  var pf = {};
  function prefetch(el) {
    if (!el || NET.lean || el._lk) return;
    var slug = el.getAttribute('data-lab');
    if (!slug || pf[slug] || (S[slug] && S[slug].req)) return;
    pf[slug] = 1;
    var v = encodeURIComponent(el.getAttribute('data-v') || '1'), dir = dirOf(el), urls = [BASE + dir + slug + '.js?v=' + v];
    if (el.getAttribute('data-css') !== '0') urls.push(BASE + dir + slug + '.css?v=' + v);
    needsOf(el).forEach(function (n) {
      if (!once['js:' + dir + n]) urls.push(BASE + dir + n + '.js?v=' + v);
      if (!once['css:' + dir + n]) urls.push(BASE + dir + n + '.css?v=' + v);
    });
    urls.forEach(function (u) { var l = D.createElement('link'); l.rel = 'prefetch'; l.href = u; D.head.appendChild(l); });
  }
  function idleNext(rec) {
    if (NET.lean) return;
    var go = function () {
      var all = Array.prototype.slice.call(D.querySelectorAll('.lab-mount[data-lab]')), k = all.indexOf(rec.el), n = 0;
      for (var j = k + 1; j < all.length && n < 2; j++) {
        var s2 = all[j].getAttribute('data-lab');
        if (all[j]._lk || (S[s2] && S[s2].req) || pf[s2]) continue;
        prefetch(all[j]); n++;
      }
    };
    if (W.requestIdleCallback) W.requestIdleCallback(go, { timeout: 3000 }); else setTimeout(go, 1200);
  }
  function settle(el, h0, above) {
    var dh = el.offsetHeight - h0;
    if (!dh) return;
    var p = pend;
    if (p && now() - p.t < 2500 && D.body.contains(p.target) && (el.compareDocumentPosition(p.target) & 4)) {
      scrollToY(layoutTop(p.target) - padTop(), p.smooth && !K.reducedMotion());
      return;
    }
    var anchors = false;
    try { anchors = CSS.supports('overflow-anchor', 'auto'); } catch (e) {}
    if (above && !anchors) scrollToY(W.pageYOffset + dh, false);
  }
  function doMount(rec, init) {
    var el = rec.el, slug = rec.slug, exp = rec.exp, h0 = el.offsetHeight, above = el.getBoundingClientRect().bottom < 0;
    var root = D.createElement('div');
    /* a moved machine keeps the page's own type and spacing: its root is a plain block (lm-root), not the kit's container */
    root.className = dirOf(el) ? 'lm-root' : 'lk-root'; root.setAttribute('data-lab-root', slug);
    el.innerHTML = '';
    el.appendChild(root);
    rec.root = root;
    var ctx = { slug: slug, el: el, root: root, exp: exp, num: rec.num, id: exp ? exp.id : '', url: expUrl(exp),
      store: K.store(slug), debug: K.debug, visible: function () { return K.visible(exp || el); } };
    (K.ctxHooks || []).forEach(function (f) { try { f(ctx, rec); } catch (e) {} });
    var handle;
    try { handle = init(root, ctx) || {}; } catch (e) {
      root.innerHTML = '<p class="lk-snag">This machine hit a snag. Reload the page to try again.</p>';
      el.setAttribute('data-lab-state', 'error'); el.setAttribute('aria-busy', 'false');
      rec.error = e; warn(slug, e); settle(el, h0, above);
      return;
    }
    rec.handle = handle;
    el.setAttribute('data-lab-state', 'ready'); el.setAttribute('aria-busy', 'false');
    K.sfill(root);
    if (handle.pause || handle.resume) {
      var pa = K.guard(handle.pause, slug), re = K.guard(handle.resume, slug);
      rec.offView = K.inView(exp || el, function (v) { if (v) re(); else pa(); });
    }
    if (handle.theme) rec.offTheme = K.onTheme(K.guard(handle.theme, slug));
    settle(el, h0, above);
    /* the page's chrome reruns its boot-time passes (slider fill, the verdict tick, counts) for this card only */
    try { if (exp) exp.dispatchEvent(new CustomEvent('labmount', { bubbles: true, detail: { slug: slug, root: root } })); } catch (e) { warn(slug, e); }
    idleNext(rec);
  }
  K.mount = function (slug, el, init) {
    try {
      el = el || mountEl(slug);
      if (!el || el._lk || typeof init !== 'function') return null;
      el._lk = true;
      var st = S[slug] || (S[slug] = {});
      st.mounted = true; clearTimeout(st.timer);
      var exp = expOf(el), m = exp ? /^exp-(\d+)$/.exec(exp.id || '') : null;
      var rec = recs[slug] = { slug: slug, el: el, root: null, exp: exp, num: m ? +m[1] : 0, handle: null, error: null };
      function go() { try { doMount(rec, init); } catch (e) { warn(slug, e); } return rec; }
      if (st.css && !st.cssDone) rec.ready = st.css.then(go, go);
      else { go(); rec.ready = Promise.resolve(rec); }
      return rec;
    } catch (e) { warn(slug, e); return null; }
  };
  K.record = function (slug) { return recs[slug] || null; };

  /* #exp-N, or a machine's permanent alias #m-<slug> (its card's data-m), so a later reorder breaks no link; #wing-N loads the
     first machine of that wing */
  function cardOf(h) {
    var m = /^#exp-(\d+)$/.exec(h), s = /^#m-([a-z0-9-]+)$/.exec(h);
    return m ? D.getElementById('exp-' + m[1]) : s ? D.querySelector('.exp[data-m="' + s[1] + '"]') : null;
  }
  function byHash() {
    var h = location.hash || '', w = /^#wing-(\d+)$/.exec(h);
    var x = w ? D.querySelector('.exp[data-wing="' + w[1] + '"]') : cardOf(h);
    if (!x) return null;
    var mt = x.querySelector('.lab-mount[data-lab]');
    if (mt) load(mt.getAttribute('data-lab'));
    return w ? (D.getElementById('wing-' + w[1]) || x) : x;
  }
  var rsQ = 0;
  function boot() {
    var ms = Array.prototype.slice.call(D.querySelectorAll('.lab-mount[data-lab]'));
    ms.forEach(function (m) { if (!m.getAttribute('data-lab-state')) m.setAttribute('data-lab-state', 'idle'); });
    if ('IntersectionObserver' in W) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); load(e.target.getAttribute('data-lab')); } });
      }, { rootMargin: NET.lean ? '300px 0px' : COARSE ? '900px 0px' : '1400px 0px' });
      ms.forEach(function (m) { io.observe(m); });
    } else ms.forEach(function (m) { load(m.getAttribute('data-lab')); });
    var t = byHash();
    if (t) pend = { target: t, t: 0, smooth: false };
    W.addEventListener('labgo', function (e) {
      var x = e && e.detail && e.detail.el;
      if (!x) return;
      /* the page lands instantly (PS.land), so the re-anchor after this machine mounts is instant too */
      pend = { target: x, t: now(), smooth: false };
      var mt = x.querySelector('.lab-mount[data-lab]');
      if (mt) load(mt.getAttribute('data-lab'));
    });
    W.addEventListener('hashchange', byHash);
    /* an Index row under the hand or the focus: fetch its machine ahead of the click */
    var ixPre = function (e) {
      var a = e.target && e.target.closest ? e.target.closest('#ixPanel a[href^="#exp-"], #ixPanel a[href^="#m-"]') : null;
      var x = a ? cardOf(a.getAttribute('href')) : null, mt = x && x.querySelector('.lab-mount[data-lab]');
      if (mt) prefetch(mt);
    };
    D.addEventListener('focusin', ixPre);
    D.addEventListener('mouseover', ixPre, { passive: true });
    W.addEventListener('resize', function () {
      if (rsQ) return;
      rsQ = requestAnimationFrame(function () { rsQ = 0; Object.keys(recs).forEach(function (k) { if (recs[k].root) each(recs[k].root.querySelectorAll('.lk-scroll'), scOne); }); });
    });
    if (K.debug) { W.__lab = W.__lab || {}; W.__lab.kit = { state: S, records: recs }; }
  }

  W.LAB_KIT = K;
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})();
