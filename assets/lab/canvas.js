/* P.S. Lab v3.2: the lab's shared canvas kit, moved verbatim from experiments.html (Rev 047). Classic script, no wrapper:
   its names stay globals (inkColor, fitCanvas, labRepaint, labTw, LAB_RM, lab3d, labNear...) so the machines in
   assets/lab/m run their original code unchanged. One change: fitCanvas caps the backing ratio at 2. */
/* ---------- the lab's shared canvas kit: colours read once per light, labels in the house voice ---------- */
var labRoot = document.documentElement;
function labKey() { return (labRoot.getAttribute('data-theme') || '') + '|' + (labRoot.getAttribute('data-tone') || ''); }
/* any computed colour to [r, g, b]; color-mix() serialises as color(srgb 0-1 0-1 0-1) */
function labRGB(str) {
  var m = String(str || '').match(/-?\d*\.?\d+(e-?\d+)?/g) || [];
  if (/^\s*color\(srgb/.test(str)) return [Math.round(+m[0] * 255), Math.round(+m[1] * 255), Math.round(+m[2] * 255)];
  return m.length >= 3 ? [Math.round(+m[0]), Math.round(+m[1]), Math.round(+m[2])] : [18, 17, 16];
}
var inkC = null, inkK = null;
/* a canvas set on a material stage ([data-cv-local]: felt, slate, a night sky) reads its inks from that stage, not from
   the page. fitCanvas opens the scope for the paint that follows; it closes on the next microtask, so nothing leaks */
var labCur = null, labCurQ = false;
function labScope(c) {
  var st = null;
  try { st = c && c.closest ? c.closest('[data-cv-local]') : null; } catch (e) {}
  labCur = st ? c : null;
  if (labCur) labCur._lcSt = st;
  if (labCur && !labCurQ) { labCurQ = true; Promise.resolve().then(function () { labCur = null; labCurQ = false; }); }
}
function inkColor(alpha) {
  var k = labKey();
  if (labCur) {
    if (labCur._inkK !== k) { labCur._inkC = labRGB(getComputedStyle(labCur).color); labCur._inkK = k; }
    var lc = labCur._inkC;
    return 'rgba(' + lc[0] + ',' + lc[1] + ',' + lc[2] + ',' + alpha + ')';
  }
  if (!inkC || inkK !== k) { inkC = labRGB(getComputedStyle(document.body).color); inkK = k; }
  return 'rgba(' + inkC[0] + ',' + inkC[1] + ',' + inkC[2] + ',' + alpha + ')';
}
var accC = null, accK = null;
function ACCRGB() {
  var k = labKey();
  if (accC && accK === k) return accC.slice();
  var v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(), out;
  if (v && v[0] === '#') {
    if (v.length === 4) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    out = [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)];
  } else {
    var m = (v || '').match(/\d+/g);
    out = m && m.length >= 3 ? [+m[0], +m[1], +m[2]] : [255, 77, 0];
  }
  accC = out; accK = k;
  return out.slice();
}
function ACC() { var c = ACCRGB(); return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; }
function ACCA(a) { var c = ACCRGB(); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
var CV_SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif';
function LBL(px) { return '600 ' + px + 'px ' + CV_SANS; }
/* a token as a canvas colour: one hidden probe inside the lab, so machine tokens (--gain, --loss) resolve too */
var labProbe = null, labCC = {};
function labColor(name) {
  var k = labKey() + name;
  if (labCur && labCur._lcSt) {
    var st = labCur._lcSt, sc = st._lcc || (st._lcc = {});
    if (sc[k]) return sc[k];
    try {
      var sp = st._lcp;
      if (!sp) {
        sp = st._lcp = document.createElement('i');
        sp.setAttribute('aria-hidden', 'true');
        sp.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none';
        st.appendChild(sp);
      }
      sp.style.color = 'var(' + name + ')';
      var scc = labRGB(getComputedStyle(sp).color);
      return (sc[k] = 'rgb(' + scc[0] + ',' + scc[1] + ',' + scc[2] + ')');
    } catch (e) {}
  }
  if (labCC[k]) return labCC[k];
  try {
    if (!labProbe) {
      labProbe = document.createElement('i');
      labProbe.setAttribute('aria-hidden', 'true');
      labProbe.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none';
      (document.querySelector('#experiments .exp') || document.getElementById('experiments') || document.body).appendChild(labProbe);
    }
    labProbe.style.color = 'var(' + name + ')';
    var c = labRGB(getComputedStyle(labProbe).color);
    return (labCC[k] = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')');
  } catch (e) { return inkColor(.8); }
}
function labColorA(name, a) { var c = labRGB(labColor(name)); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
/* 1px lines land on the pixel grid */
function cvSnap(v) { return Math.round(v) + .5; }
/* a canvas label: 600 sans, tracked, set in capitals like every label in the house; a card-coloured halo keeps it off the lines */
function cvText(ctx, str, x, y, o) {
  o = o || {};
  ctx.save();
  ctx.font = o.font || LBL(o.px || 11);
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.base || 'alphabetic';
  if ('letterSpacing' in ctx) ctx.letterSpacing = o.ls != null ? o.ls : (o.font ? '0px' : '1px');
  var t = o.raw ? String(str) : String(str).toUpperCase();
  if (o.halo !== false) { ctx.lineJoin = 'round'; ctx.lineWidth = o.hw || 6; ctx.strokeStyle = labColor('--card'); ctx.strokeText(t, x, y); }
  ctx.fillStyle = o.color || inkColor(.72);
  ctx.fillText(t, x, y);
  ctx.restore();
}
function cvRound(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
}
var LAB_RM = false;
try { LAB_RM = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
/* every machine that draws registers a painter; theme changes and resizes repaint from each machine's own cache */
window.LABREPAINT = window.LABREPAINT || [];
function labRepaint(fn, el) {
  window.LABREPAINT.push(fn);
  var x = el && el.closest ? el.closest('.exp') : null;
  if (x) (x._paints = x._paints || []).push(fn);
}
/* which machines are on screen: tick machines keep their state but skip painting while away */
(function () {
  var xs = Array.prototype.slice.call(document.querySelectorAll('.exp'));
  if (!('IntersectionObserver' in window)) { xs.forEach(function (x) { x._vis = true; x.classList.add('on-screen'); }); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var x = e.target, was = x._vis;
      x._vis = e.isIntersecting;
      x.classList.toggle('on-screen', e.isIntersecting);
      if (e.isIntersecting && was === false) (x._paints || []).forEach(function (fn) { try { fn(); } catch (er) {} });
    });
  }, { rootMargin: '160px 0px' });
  function watch() { xs.forEach(function (x) { io.observe(x); }); }
  watch();
  window.addEventListener('pagehide', function () { io.disconnect(); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) watch(); });
})();
/* the drawing box is the canvas's content box: the height a machine asks for is the height it gets, borders sit outside it,
   and the bitmap matches the box pixel for pixel, so hairlines stay hairlines */
function fitCanvas(c, cssH) {
  labScope(c);
  var d = Math.min(window.devicePixelRatio || 1, 2);
  var W = c.clientWidth;
  if (W > 0) {
    var bh = c.offsetHeight - c.clientHeight;
    if (Math.abs(c.offsetHeight - (cssH + bh)) > .5) c.style.height = (cssH + bh) + 'px';
    var pw = Math.round(W * d), ph = Math.round(cssH * d);
    if (c.width !== pw || c.height !== ph) { c.width = pw; c.height = ph; }
  }
  var x = c.getContext('2d');
  x.setTransform(d, 0, 0, d, 0, 0);
  return { ctx: x, W: W, H: cssH };
}
/* the page's canvas kit, shared with the lazy machines in /assets/lab (kit.js reads it, never writes it) */
try { window.LAB_PAGE = { ACC: ACC, ACCA: ACCA, ACCRGB: ACCRGB, inkColor: inkColor, labColor: labColor, labColorA: labColorA,
  fitCanvas: fitCanvas, cvText: cvText, LBL: LBL, snap: cvSnap, repaint: labRepaint }; } catch (e) {}
/* motion on the frame clock: the house curves once theme.js is up, a cubic until then; reduced motion lands at once */
function labEase(n) {
  if (typeof n === 'function') return n;
  var m = window.PS_MOTION && window.PS_MOTION.ease;
  if (m && typeof m[n] === 'function') return m[n];
  return n === 'io' ? function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; } : function (t) { return 1 - Math.pow(1 - t, 3); };
}
function labLin(t) { return t; }
function labTw(dur, fn, done, ease) {
  var e = labEase(ease || 'out'), id = 0, t0 = 0, dead = false;
  if (LAB_RM || !(dur > 0)) { fn(1, 1); if (done) done(); return function () {}; }
  id = requestAnimationFrame(function f(ts) {
    if (dead) return;
    if (!t0) t0 = ts;
    var p = Math.min(1, (ts - t0) / dur);
    fn(e(p), p);
    if (p < 1) id = requestAnimationFrame(f); else if (done) done();
  });
  return function () { dead = true; cancelAnimationFrame(id); };
}
/* the 3D engine, only when a machine asks: core.js once and the WebGL renderer with it; c2d loads itself as the fallback */
var lab3dQ = null, LAB_SAVE = false;
try { LAB_SAVE = !!(navigator.connection && navigator.connection.saveData); } catch (e) {}
function lab3d(cb) {
  if (LAB_SAVE) return;
  var go = function () { var P = window.PS3D; if (P) P.load(['gl']).then(function () { cb(P); }, function () { cb(P); }); };
  if (window.PS3D) { go(); return; }
  if (!lab3dQ) {
    lab3dQ = [];
    var sc = document.createElement('script'); sc.src = '/assets/3d/core.js?v=3'; sc.async = true;
    sc.onload = function () { var q = lab3dQ; lab3dQ = []; q.forEach(function (f) { f(); }); };
    (document.head || document.documentElement).appendChild(sc);
  }
  lab3dQ.push(go);
}
/* a line typed in, 20ms a character; the verdict tick stands aside while it types */
function labType(el, t) {
  if (el._ty) clearInterval(el._ty);
  el._ty = 0;
  if (LAB_RM || !t) { el.textContent = t; return; }
  var k = 0;
  el._t = performance.now() + t.length * 20 + 600;
  el.textContent = '';
  el._ty = setInterval(function () { k += 2; el.textContent = t.slice(0, k); if (k >= t.length) { clearInterval(el._ty); el._ty = 0; el._s = t; } }, 40);
}
/* a machine wakes once, when it comes within reach of the viewport */
function labNear(el, fn, m) {
  if (!('IntersectionObserver' in window)) return fn();
  var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { rootMargin: m || '600px 0px' });
  io.observe(el);
}
