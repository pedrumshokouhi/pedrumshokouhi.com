/* P.S. 3D c2d.js v2: the Canvas2D renderer (the fallback, ?ps3d=2d) and the poster writer (PS3D.debug.poster).
   Same camera, same light sums, same palette as gl.js. Parts are sorted far to near (layer first); inside a part, front faces are
   filled and lit, then the edges a viewer could see are stroked by class: silhouettes, creases over 30 degrees, details.
   Contact shadows are soft rounded rects under each solid, clipped to the part it stands on; the cast shadow is the solids
   flattened along the key light into a scratch canvas and laid down once at its own opacity. */
(function () {
  'use strict';
  var P = window.PS3D;
  if (!P || P._R.c2d) return;
  var M = Math, m4 = P.m4, KIND = P.KIND, EG = P.EDGE, D = document;

  function sstep(a, b, x) { var t = M.max(0, M.min(1, (x - a) / (b - a || 1))); return t * t * (3 - 2 * t); }
  function css(c, a) { return 'rgba(' + M.round(M.min(1, M.max(0, c[0])) * 255) + ',' + M.round(M.min(1, M.max(0, c[1])) * 255) + ',' + M.round(M.min(1, M.max(0, c[2])) * 255) + ',' + (a == null ? 1 : +M.max(0, M.min(1, a)).toFixed(3)) + ')'; }
  function mixc(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function nrm(a) { var l = M.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }

  /* project a scene into an ordered draw list: [{f:[faces], l:[segs], s:[spheres], node, bb, fp, solid, ground}] per node */
  function prep(v, o) {
    o = o || {};
    var c = v.camera, VP = c.VP, Vw = c.V, W = v.w, H = v.h, out = [], nm = new Float32Array(9), R = c.fr || c.radius || 1, n0 = c.dc - R, n1 = c.dc + R;
    var ortho = c.kind === 'ortho', dir = c.dir, eye = c.eye, L = c.light, F = c.fill, lit = P._lit(v), pal = lit.pal;
    function scr(p) {
      var x = p[0], y = p[1], z = p[2], w = VP[3] * x + VP[7] * y + VP[11] * z + VP[15];
      w = w > 1e-6 ? w : 1e-6;
      return [((VP[0] * x + VP[4] * y + VP[8] * z + VP[12]) / w + 1) / 2 * W, (1 - (VP[1] * x + VP[5] * y + VP[9] * z + VP[13]) / w) / 2 * H,
        -(Vw[2] * x + Vw[6] * y + Vw[10] * z + Vw[14]), w];
    }
    function vdir(p) { return ortho ? dir : nrm([eye[0] - p[0], eye[1] - p[1], eye[2] - p[2]]); }
    function tn(n) { return nrm([nm[0] * n[0] + nm[3] * n[1] + nm[6] * n[2], nm[1] * n[0] + nm[4] * n[1] + nm[7] * n[2], nm[2] * n[0] + nm[5] * n[1] + nm[8] * n[2]]); }
    v.scene.walk(function (n) {
      if (!n.geom || !n._ev || n._ea < .004) return;
      var g = n.geom, m = n.wm, b = g.bb, ea = n._ea, it = { f: [], l: [], s: [], hl: n._eh, et: n._et, layer: n.layer || 0, node: n };
      m4.nrm(m, nm);
      it.d = scr(m4.tp(m, [(b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2]))[2];
      /* world bounds, footprint and ground flag, for the shadows */
      var bb = [1e30, 1e30, 1e30, -1e30, -1e30, -1e30], i, k;
      for (i = 0; i < 8; i++) { var cp = m4.tp(m, [b[i & 1 ? 3 : 0], b[i & 2 ? 4 : 1], b[i & 4 ? 5 : 2]]); for (k = 0; k < 3; k++) { if (cp[k] < bb[k]) bb[k] = cp[k]; if (cp[k] > bb[k + 3]) bb[k + 3] = cp[k]; } }
      it.bb = bb; it.ground = (n._lay || n.layer || 0) < 0; it.ea = ea; it.solid = !!g.solid && g.F.length > 0 && ea > .3;
      it.fp = P._footprint(n, [0, 0, 0, 0, 0, 0]);
      var gy = bb[1], aoh = (bb[4] - bb[1]) * .18;
      for (i = 0; i < g.F.length; i++) {
        var Fc = g.F[i], pts = [], wp = [], dz = 0, cnt = Fc.p.length / 3, gk = Fc.k === KIND.glass || Fc.k === KIND.liquid, fa = (gk ? 1 : Fc.a) * ea;
        if (fa < .004) continue;
        for (k = 0; k < cnt; k++) { var w3 = m4.tp(m, [Fc.p[k * 3], Fc.p[k * 3 + 1], Fc.p[k * 3 + 2]]); wp.push(w3); var s = scr(w3); pts.push(s[0], s[1]); dz += s[2]; }
        var ctr = [0, 0, 0]; for (k = 0; k < cnt; k++) { ctr[0] += wp[k][0] / cnt; ctr[1] += wp[k][1] / cnt; ctr[2] += wp[k][2] / cnt; }
        var nw = tn(Fc.n), V = vdir(ctr), fv = nw[0] * V[0] + nw[1] * V[1] + nw[2] * V[2];
        if (fv <= 0 && !Fc.ds) continue;
        if (fv < 0) nw = [-nw[0], -nw[1], -nw[2]];
        var sh = P._shade(lit, Fc.k || 0, pal[Fc.c] || pal[4], nw, V, L, F, ctr[1], gy, aoh);
        var col = [sh[0], sh[1], sh[2]];
        if (it.et) col = mixc(col, pal[0], it.et);
        if (it.hl) col = mixc(col, lit.foil, .3 * M.min(it.hl, 1));
        it.f.push({ p: pts, w: wp, d: dz / cnt, c: Fc.c, k: Fc.k || 0, a: fa * sh[3], col: col, n: nw, uv: Fc.uv, tex: Fc.tex, dev: n.dev || 0,
          lt: P._shade(lit, KIND.paper, [1, 1, 1], nw, V, L, F) });
      }
      it.f.sort(function (a, b2) { return b2.d - a.d; });
      var Ls = g.L;
      for (i = 0; i < Ls.length; i += 17) {
        var a = m4.tp(m, [Ls[i], Ls[i + 1], Ls[i + 2]]), bp = m4.tp(m, [Ls[i + 3], Ls[i + 4], Ls[i + 5]]), fl = Ls[i + 15];
        var N1 = tn([Ls[i + 6], Ls[i + 7], Ls[i + 8]]), N2 = tn([Ls[i + 9], Ls[i + 10], Ls[i + 11]]), z1 = !(Ls[i + 6] || Ls[i + 7] || Ls[i + 8]);
        var mid = [(a[0] + bp[0]) / 2, (a[1] + bp[1]) / 2, (a[2] + bp[2]) / 2], Vm = vdir(mid);
        var s1 = N1[0] * Vm[0] + N1[1] * Vm[1] + N1[2] * Vm[2], s2 = N2[0] * Vm[0] + N2[1] * Vm[1] + N2[2] * Vm[2], cls = 'detail', hid = false;
        var w = Ls[i + 12], al = Ls[i + 16] * ea;
        if (fl === EG.hard && !z1) {
          var c12 = N1[0] * N2[0] + N1[1] * N2[1] + N1[2] * N2[2];
          if (M.abs(c12) > .999 || s1 * s2 <= 0) { cls = 'sil'; w = lit.silW * (w > 1.2 ? 1.15 : 1); al *= lit.silA; }
          else if (s1 < 0 && s2 < 0) { hid = true; cls = 'hid'; }
          else if (c12 > .866) continue;
          else { cls = 'crease'; w = .9; al *= .38; }
        } else if (fl === EG.soft) { if (s1 * s2 > 0) continue; cls = 'sil'; w = lit.silW; al *= lit.silA; }
        else if (fl === EG.wire || (fl === EG.hard && z1)) cls = 'wire';
        else if (fl === EG.aa) continue;
        else al *= .55;
        if (hid && !(o.hidden && v.xray)) continue;
        var A = scr(a), Bp = scr(bp), dd = (A[2] + Bp[2]) / 2, fade = 1 - .45 * sstep(n0, n1, dd);
        it.l.push({ x0: A[0], y0: A[1], x1: Bp[0], y1: Bp[1], c: Ls[i + 13], w: w, dash: hid ? 4 : Ls[i + 14], a: hid ? .16 * ea : al * fade, cls: cls, wa: a, wb: bp });
      }
      var S = g.S, sc = M.max(M.sqrt(m[0] * m[0] + m[1] * m[1] + m[2] * m[2]), 1e-6);
      for (i = 0; i < S.length; i += 7) {
        var pc = scr(m4.tp(m, [S[i], S[i + 1], S[i + 2]]));
        it.s.push({ x: pc[0], y: pc[1], r: S[i + 3] > 0 ? S[i + 3] * sc * c.py * H / 2 / pc[3] : -S[i + 3] / 2, world: S[i + 3] > 0, f: S[i + 4], l: S[i + 5], a: S[i + 6] * ea, d: pc[2] });
      }
      out.push(it);
    });
    out.sort(function (a, b) { return a.layer - b.layer || b.d - a.d; });
    return out;
  }

  /* the shadow instances for a prepared list (the same rules gl.js uses) */
  function shadows(v, list, lit, castOK) {
    var sh = v.shadow, scale = sh && sh.a != null ? M.max(0, M.min(2, sh.a / .14)) : 1, n = list.length, G = new Float32Array((n + 3) * 16), RI = [];
    var r = sh ? P._shadowList(list, { contactA: lit.contactA, castA: lit.castA, scale: scale, cast: castOK && v.q < 2, reflect: false }, G, RI) : { n: 0 };
    r.G = G; r.RI = RI;
    return r;
  }
  /* screen polygon of an oriented floor rect at height y */
  function rectPoly(v, cx, cz, hx, hz, c, s, y) {
    var out = [], cs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (var i = 0; i < 4; i++) {
      var lx = cs[i][0] * hx, lz = cs[i][1] * hz, p = v.project([cx + lx * c + lz * s, y, cz - lx * s + lz * c]);
      out.push(p[0], p[1]);
    }
    return out;
  }
  function poly(cx, p) { cx.beginPath(); cx.moveTo(p[0], p[1]); for (var k = 2; k < p.length; k += 2) cx.lineTo(p[k], p[k + 1]); cx.closePath(); }
  /* the 2D affine taking texture (u, v) in [0, 1] to screen, from three vertices */
  function affine(f) {
    var uv = f.uv, p = f.p;
    if (!uv || uv.length < 6) return null;
    var u0 = uv[0], v0 = uv[1], u1 = uv[2], v1 = uv[3], u2 = uv[4], v2 = uv[5], x0 = p[0], y0 = p[1], x1 = p[2], y1 = p[3], x2 = p[4], y2 = p[5];
    var det = (u1 - u0) * (v2 - v0) - (u2 - u0) * (v1 - v0);
    if (M.abs(det) < 1e-9) return null;
    var a = ((x1 - x0) * (v2 - v0) - (x2 - x0) * (v1 - v0)) / det, cc = ((x2 - x0) * (u1 - u0) - (x1 - x0) * (u2 - u0)) / det;
    var b = ((y1 - y0) * (v2 - v0) - (y2 - y0) * (v1 - v0)) / det, d = ((y2 - y0) * (u1 - u0) - (y1 - y0) * (u2 - u0)) / det;
    return [a, b, cc, d, x0 - a * u0 - cc * v0, y0 - b * u0 - d * v0];
  }
  var FILTER = (function () { try { var x = D.createElement('canvas').getContext('2d'); return x && 'filter' in x; } catch (e) { return false; } })();
  var MONO = 'grayscale(1) sepia(.22) contrast(1.08) brightness(1.02)';

  function C2(v) {
    this.v = v; this.kind = '2d'; this.cx = v.canvas.getContext('2d');
  }
  C2.prototype = {
    resize: function () {},
    render: function (v) {
      var cx = this.cx, lit = P._lit(v), pal = lit.pal, d = v.dpr, la = v.lineA == null ? 1 : v.lineA, ls = (v.lineScale || 1) * M.max(.8, M.min(1.3, M.min(v.w, v.h) / 560));
      if (!cx) return;
      cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, v.canvas.width, v.canvas.height);
      cx.setTransform(d, 0, 0, d, 0, 0);
      var list = prep(v, { hidden: v.hidden }), i, j, k, sh = shadows(v, list, lit, true), byR = {}, page = [], castAt = -2;
      for (k = 0; k < sh.n; k++) {
        var ty = sh.G[k * 16 + 9];
        if (ty === 1) { castAt = sh.RI[k] != null ? sh.RI[k] : -1; this.castI = k; continue; }
        if (ty !== 0) continue;
        var ri = sh.RI[k];
        if (ri == null || ri < 0) page.push(k); else (byR[ri] = byR[ri] || []).push(k);
      }
      var self = this;
      each(page, function (k2) { self.contact(v, lit, sh, k2, list); });
      if (castAt === -1) this.cast(v, lit, list, sh);
      cx.lineCap = 'round'; cx.lineJoin = 'round';
      for (i = 0; i < list.length; i++) {
        var it = list[i], hl = M.min(it.hl, 1);
        for (j = 0; j < it.f.length; j++) {
          var f = it.f[j];
          if (f.tex && f.uv) { this.texFace(v, f); continue; }
          cx.fillStyle = css(f.col, f.a);
          poly(cx, f.p); cx.fill();
        }
        if (byR[i]) for (k = 0; k < byR[i].length; k++) this.contact(v, lit, sh, byR[i][k], list);
        if (castAt === i) this.cast(v, lit, list, sh);
        var buckets = {};
        for (j = 0; j < it.l.length; j++) {
          var s = it.l[j], col = s.cls === 'sil' && s.c === 0 ? lit.sil : pal[s.c];
          var key = s.c + '|' + s.cls + '|' + s.w + '|' + s.dash + '|' + M.round(s.a * 20);
          var b = buckets[key] || (buckets[key] = { col: col, w: s.w, dash: s.dash, a: M.round(s.a * 20) / 20, s: [] });
          b.s.push(s.x0, s.y0, s.x1, s.y1);
        }
        for (var bk in buckets) {
          var bt = buckets[bk], ss = bt.s;
          cx.strokeStyle = css(mixc(bt.col, pal[3], hl), bt.a * la);
          cx.lineWidth = M.max(bt.w * ls, 1.5 * it.hl);
          cx.setLineDash(bt.dash ? [bt.dash, bt.dash] : []);
          cx.beginPath();
          for (k = 0; k < ss.length; k += 4) { cx.moveTo(ss[k], ss[k + 1]); cx.lineTo(ss[k + 2], ss[k + 3]); }
          cx.stroke();
        }
        cx.setLineDash([]);
        for (j = 0; j < it.s.length; j++) {
          var sp = it.s[j], fc = sp.f >= 0 ? pal[sp.f] : null;
          cx.beginPath(); cx.arc(sp.x, sp.y, M.max(.5, sp.r), 0, M.PI * 2);
          if (fc) {
            if (sp.world && sp.r > 2) {
              var gr = cx.createRadialGradient(sp.x - sp.r * .35, sp.y - sp.r * .4, sp.r * .1, sp.x, sp.y, sp.r);
              gr.addColorStop(0, css(mixc(fc, [1, 1, 1], .35), sp.a)); gr.addColorStop(.7, css(fc, sp.a)); gr.addColorStop(1, css(mixc(fc, [0, 0, 0], .25), sp.a));
              cx.fillStyle = gr;
            } else cx.fillStyle = css(fc, sp.a);
            cx.fill();
          }
          if (sp.l >= 0) { cx.strokeStyle = css(mixc(pal[sp.l], pal[3], hl), sp.a); cx.lineWidth = 1; cx.stroke(); }
        }
      }
      v.calls = list.length;
    },
    contact: function (v, lit, sh, k, list) {
      var cx = this.cx, G = sh.G, b = k * 16, L = v.camera.light, ll = M.sqrt(L[0] * L[0] + L[2] * L[2]) || 1;
      var off = G[b + 10], cX = G[b] - L[0] / ll * off, cZ = G[b + 1] - L[2] / ll * off, y = G[b + 6], e = G[b + 8], a = G[b + 7];
      var p = rectPoly(v, cX, cZ, G[b + 2] + e * .15, G[b + 3] + e * .15, G[b + 4], G[b + 5], y);
      var q2 = v.project([cX + e, y, cZ]), q0 = v.project([cX, y, cZ]), blur = M.max(1, M.hypot(q2[0] - q0[0], q2[1] - q0[1])), dpr = v.dpr, BIG = 4000;
      cx.save();
      if (G[b + 14] > 0) {
        var ca = G[b + 11], cp = rectPoly(v, G[b + 12], G[b + 13], G[b + 14], G[b + 15], M.cos(ca), M.sin(ca), y);
        poly(cx, cp); cx.clip();
      }
      cx.shadowColor = css(lit.shadow, M.min(1, a * 1.15));
      cx.shadowBlur = blur * dpr * .9; cx.shadowOffsetX = BIG * dpr; cx.shadowOffsetY = 0;
      cx.fillStyle = '#000';
      for (var i = 0; i < p.length; i += 2) p[i] -= BIG;
      poly(cx, p); cx.fill();
      cx.restore();
    },
    cast: function (v, lit, list, sh) {
      var cx = this.cx, k = this.castI, G = sh.G, b = k * 16, a = G[b + 7], L = v.camera.light, y = sh.cy;
      if (!(a > .002)) return;
      var sc = this.sc || (this.sc = D.createElement('canvas')), W = v.canvas.width, H = v.canvas.height;
      if (sc.width !== W || sc.height !== H) { sc.width = W; sc.height = H; }
      var x = sc.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); x.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
      x.fillStyle = '#000';
      var Ly = M.max(L[1], .12);
      for (var i = 0; i < list.length; i++) {
        var it = list[i]; if (!it.solid || it.ground) continue;
        for (var j = 0; j < it.f.length; j++) {
          var f = it.f[j]; if (f.a < .99) continue;
          x.beginPath();
          for (var q = 0; q < f.w.length; q++) {
            var w = f.w[q], h = M.max(w[1] - y, 0), p = v.project([w[0] - L[0] * h / Ly, y, w[2] - L[2] * h / Ly]);
            if (q) x.lineTo(p[0], p[1]); else x.moveTo(p[0], p[1]);
          }
          x.closePath(); x.fill();
        }
      }
      cx.save();
      var cp = rectPoly(v, G[b], G[b + 1], G[b + 2], G[b + 3], G[b + 4], G[b + 5], G[b + 6]);
      poly(cx, cp); cx.clip();
      cx.setTransform(1, 0, 0, 1, 0, 0);
      cx.globalAlpha = a;
      if (FILTER) cx.filter = 'blur(' + (3 * v.dpr).toFixed(1) + 'px)';
      cx.drawImage(sc, 0, 0);
      cx.restore();
    },
    texFace: function (v, f) {
      var cx = this.cx, T = f.tex, A = affine(f);
      if (!A) return;
      var px = 256, tile = P._tile(T, px);
      cx.save();
      poly(cx, f.p); cx.clip();
      var d = v.dpr;
      cx.setTransform(A[0] * d / px, A[1] * d / px, A[2] * d / px, A[3] * d / px, A[4] * d, A[5] * d);
      if (T.mono && f.dev < 1 && FILTER) {
        cx.filter = MONO; cx.drawImage(tile, 0, 0);
        cx.filter = 'none';
        if (f.dev > 0) { cx.globalAlpha = f.dev; cx.drawImage(tile, 0, 0); cx.globalAlpha = 1; }
      } else cx.drawImage(tile, 0, 0);
      cx.restore();
      /* the light on the plate: a veil for the share of light it does not get */
      var l = (f.lt[0] + f.lt[1] + f.lt[2]) / 3;
      if (l < .98) { cx.fillStyle = 'rgba(0,0,0,' + (1 - l).toFixed(3) + ')'; poly(cx, f.p); cx.fill(); }
    },
    destroy: function () { this.cx = null; }
  };
  function each(a, f) { for (var i = 0; a && i < a.length; i++) f(a[i], i); }
  P._R.c2d = function (v) { var r = new C2(v); return r.cx ? r : null; };
  P._prep = prep;

  /* ---------------- posters ----------------
     P._poster(target, {w, h, surface, rest: true, plates: true, label}) -> '<svg class="ps3d-poster" data-reg="1" data-v="2" ...>'.
     The drawing is projected from the same framing the live view uses at that aspect, so the GL frame lands on it pixel for pixel.
     Faces print in tone classes (p-top, p-left, p-right, p-plaster, p-foil, p-metal), silhouettes as .p-sil, creases and details
     as .p-line, contact shadows as blurred .p-shadow shapes; each top-level part is a <g data-part style="--i:k">. A textured face
     prints its tex.svg(w, h) (or its image) under the face's affine and a clip. The <style> inside keys the classes to the page's
     tokens, so the poster follows every theme. */
  var PID = 0;
  function f1(x) { return (M.round(x * 10) / 10).toString(); }
  function pathOf(p) { var s = 'M' + f1(p[0]) + ' ' + f1(p[1]); for (var k = 2; k < p.length; k += 2) s += 'L' + f1(p[k]) + ' ' + f1(p[k + 1]); return s + 'Z'; }
  /* markup escapes for the poster writer, built from the ampersand so no entity sits in a JS string */
  var AMP = String.fromCharCode(38), ESC = { '&': AMP + 'amp;', '<': AMP + 'lt;', '>': AMP + 'gt;', '"': AMP + 'quot;' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ESC[c]; }); }
  var STYLE = function (id) {
    var S = '.ps3d-poster[data-v="2"]', DK = ':is(:root[data-tone="dark"],.tone-dark,.band--dark,[data-ground="espresso"],[data-ground="forest"],[data-ground="slate"]) ';
    var DS = S + '[data-tone="dark"]';
    return '<style>' +
      S + ' .p-top{fill:var(--m-top,color-mix(in srgb,var(--paper) 55%,#fff))}' +
      S + ' .p-left{fill:var(--m-left,color-mix(in srgb,var(--paper) 88.5%,#74654A))}' +
      S + ' .p-right{fill:var(--m-right,color-mix(in srgb,var(--paper) 70%,#74654A))}' +
      S + ' .p-plaster{fill:var(--m-plaster,color-mix(in srgb,var(--paper) 94%,var(--ink)))}' +
      S + ' .p-foil{fill:var(--m-foil,var(--accent))}' +
      S + ' .p-metal{fill:var(--m-metal-hi,color-mix(in srgb,var(--muted) 45%,var(--paper)))}' +
      S + ' .p-metal.p-lo{fill:var(--m-metal-lo,color-mix(in srgb,var(--muted) 70%,var(--ink)))}' +
      S + ' .p-inkf{fill:var(--ink)}' + S + ' .p-inkc{fill:var(--ink)}' + S + ' .p-glass{fill:var(--ink-2)}' +
      S + ' .p-shadow{fill:var(--m-shadow,var(--ink));stroke:none}' +
      S + ' :is(.p-sil,.p-line,.p-line2,.p-fl){fill:none;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}' +
      S + ' .p-sil{stroke:var(--m-sil,var(--ink))}' + S + ' .p-line{stroke:var(--ink)}' + S + ' .p-line2{stroke:var(--ink-2)}' + S + ' .p-fl{stroke:var(--foil-line)}' +
      S + ' .p-plate{filter:grayscale(1) sepia(.22) contrast(1.08) brightness(1.02)}' + S + ' .p-plate.is-dev{filter:none}' +
      S + ' .p-txt{fill:var(--ink)}' + S + ' .p-txt2{fill:var(--ink-2)}' +
      DK + S + ' .p-top,' + DS + ' .p-top{fill:var(--m-top,color-mix(in srgb,var(--dark) 80%,var(--on-dark)))}' +
      DK + S + ' .p-left,' + DS + ' .p-left{fill:var(--m-left,color-mix(in srgb,var(--dark) 87%,var(--on-dark)))}' +
      DK + S + ' .p-right,' + DS + ' .p-right{fill:var(--m-right,color-mix(in srgb,var(--dark) 92%,var(--on-dark)))}' +
      DK + S + ' .p-plaster,' + DS + ' .p-plaster{fill:var(--m-plaster,color-mix(in srgb,var(--dark) 95%,var(--on-dark)))}' +
      DS + ' .p-sil{stroke:var(--m-sil,var(--on-dark))}' + DS + ' .p-line{stroke:var(--on-dark)}' + DS + ' .p-line2{stroke:var(--on-dark-2)}' + DS + ' .p-shadow{fill:#000}' +
      DS + ' .p-inkf{fill:color-mix(in srgb,var(--dark) 93%,var(--on-dark))}' + DS + ' .p-inkc{fill:var(--on-dark)}' + DS + ' .p-glass{fill:var(--on-dark)}' +
      '</style>';
  };
  function resolve(target) {
    if (!target) return null;
    if (typeof target === 'string') {
      var def = P.getModel(target); if (!def) return null;
      var cv = D.createElement('canvas'), v = P.create(cv, { renderer: '2d', camera: def.camera, surface: def.surface });
      var root = P.build(def); v.add(root);
      if (def.update) def.update(root, root.params, { view: v, reduced: true, init: true });
      v.camera.set(def.cam || (def.views && def.views.iso) || null);
      v._tmp = true; v._tmpRoot = root;
      v.on('resize', function () { P.frame(v, { fill: def.fill || .78 }); });
      return { v: v, host: null };
    }
    if (target.camera && target.scene) return { v: target };
    if (target.vw) return { v: target.vw, x: target };
    if (target.view && target.view.camera) return { v: target.view, x: target };
    return null;
  }
  P._poster = function (target, o) {
    var r = resolve(target);
    if (!r) { P._warn('poster', 'no view for that target'); return ''; }
    var v = r.v, x = r.x, W = o.w || v.w || 600, H = o.h || v.h || 400, keepS = v.surface, keepQ = v.q, id = 'p' + (++PID).toString(36) + M.floor(M.random() * 1e4).toString(36);
    if (o.surface) { v.surface = o.surface; v._lit = v._th = null; }
    v.q = 0;
    if (o.rest !== false && x && x.rest) x.rest(true);
    v._force = [W, H]; v._size(); v.emit('resize'); v.update();
    var lit = P._lit(v), list = prep(v, {}), sh = shadows(v, list, lit, true), parts = [], byPart = {}, i, j, k;
    var dark = lit.dark, sz = M.max(.8, M.min(1.3, M.min(W, H) / 560)), defs = '', body = '';
    /* group by top-level part */
    function top(n) { var t = n; while (t.parent && t.parent.parent && t.parent.parent !== v.scene) t = t.parent; if (t.parent && t.parent !== v.scene && t.parent.parent === v.scene) return t; return t; }
    for (i = 0; i < list.length; i++) {
      var tn = top(list[i].node), key = tn.uid;
      if (!byPart[key]) { byPart[key] = { node: tn, items: [], sh: [] }; parts.push(byPart[key]); }
      byPart[key].items.push(i);
    }
    /* shadow shapes: contact under each caster, clipped to its receiver; buckets of blur */
    var L = v.camera.light, ll = M.sqrt(L[0] * L[0] + L[2] * L[2]) || 1, clipN = 0, pageSh = '', castSh = '', blurs = {};
    function blurId(px) { var b = M.max(1, M.min(24, M.round(px))); blurs[b] = 1; return id + 'b' + b; }
    var itemPart = [];
    for (i = 0; i < list.length; i++) itemPart[i] = byPart[top(list[i].node).uid];
    for (k = 0; k < sh.n; k++) {
      var G = sh.G, b = k * 16, ty = G[b + 9];
      if (ty !== 0) continue;
      var off = G[b + 10], cX = G[b] - L[0] / ll * off, cZ = G[b + 1] - L[2] / ll * off, y = G[b + 6], e = G[b + 8], a = G[b + 7];
      var p = rectPoly(v, cX, cZ, G[b + 2] + e * .15, G[b + 3] + e * .15, G[b + 4], G[b + 5], y);
      var q2 = v.project([cX + e, y, cZ]), q0 = v.project([cX, y, cZ]), bl = M.max(1, M.hypot(q2[0] - q0[0], q2[1] - q0[1])) * .45;
      var clip = '';
      if (G[b + 14] > 0) {
        var ca = G[b + 11], cp = rectPoly(v, G[b + 12], G[b + 13], G[b + 14], G[b + 15], M.cos(ca), M.sin(ca), y);
        defs += '<clipPath id="' + id + 'c' + clipN + '"><path d="' + pathOf(cp) + '"/></clipPath>';
        clip = ' clip-path="url(#' + id + 'c' + clipN + ')"'; clipN++;
      }
      var shape = '<g' + clip + '><path class="p-shadow" opacity="' + M.min(1, a * 1.15).toFixed(3) + '" filter="url(#' + blurId(bl) + ')" d="' + pathOf(p) + '"/></g>';
      /* the caster: find its item by its footprint centre */
      var owner = -1;
      for (i = 0; i < list.length && owner < 0; i++) { var it0 = list[i]; if (it0.solid && M.abs((it0.fp[2] >= 0 ? it0.fp[0] : (it0.bb[0] + it0.bb[3]) / 2) - G[b]) < 1e-6 && M.abs((it0.fp[2] >= 0 ? it0.fp[1] : (it0.bb[2] + it0.bb[5]) / 2) - G[b + 1]) < 1e-6) owner = i; }
      if (owner >= 0 && sh.RI[k] >= 0) itemPart[owner].sh.push(shape); else pageSh += shape;
    }
    /* the cast shadow: the solids flattened along the light, one group at its own opacity */
    for (k = 0; k < sh.n; k++) {
      if (sh.G[k * 16 + 9] !== 1) continue;
      var cb = k * 16, cy = sh.cy, Ly = M.max(L[1], .12), dd = '';
      for (i = 0; i < list.length; i++) {
        var it1 = list[i]; if (!it1.solid || it1.ground) continue;
        for (j = 0; j < it1.f.length; j++) {
          var f = it1.f[j]; if (f.a < .99) continue;
          var pp = [];
          for (var qq = 0; qq < f.w.length; qq++) { var w = f.w[qq], h = M.max(w[1] - cy, 0), pr = v.project([w[0] - L[0] * h / Ly, cy, w[2] - L[2] * h / Ly]); pp.push(pr[0], pr[1]); }
          dd += pathOf(pp);
        }
      }
      if (dd) {
        var crp = rectPoly(v, sh.G[cb], sh.G[cb + 1], sh.G[cb + 2], sh.G[cb + 3], sh.G[cb + 4], sh.G[cb + 5], sh.G[cb + 6]);
        defs += '<clipPath id="' + id + 'k"><path d="' + pathOf(crp) + '"/></clipPath>';
        castSh = '<g clip-path="url(#' + id + 'k)"><g opacity="' + sh.G[cb + 7].toFixed(3) + '" filter="url(#' + blurId(1.6) + ')"><path class="p-shadow" d="' + dd + '"/></g></g>';
      }
    }
    /* faces and lines per part */
    var TOP = lum3(lit.top), LEFT = lum3(lit.left), RIGHT = lum3(lit.right), gi = 0, groundHTML = '', partsHTML = '';
    function lum3(c) { return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
    function faceCls(f) {
      var kd = f.k;
      if (kd === KIND.foil || kd === KIND.liquid) return 'p-foil';
      if (kd === KIND.metal) return f.n[1] > .5 ? 'p-metal' : 'p-metal p-lo';
      if (kd === KIND.ink) return 'p-inkf';
      if (kd === KIND.glass) return 'p-glass';
      if (f.c === 3) return 'p-foil';
      if (f.c === 0 || f.c === 6) return 'p-inkc';
      if (f.c === 1 || f.c === 2) return 'p-glass';
      if (kd === KIND.plaster && f.n[1] > .7) return 'p-plaster';
      var l = lum3(f.col), dt = M.abs(l - TOP), dl = M.abs(l - LEFT), dr = M.abs(l - RIGHT);
      return dt <= dl && dt <= dr ? 'p-top' : dl <= dr ? 'p-left' : 'p-right';
    }
    var texN = 0;
    for (var pi = 0; pi < parts.length; pi++) {
      var pg = parts[pi], g = '', lines = { sil: '', crease: '', det: '', fl: '', fl2: '' };
      g += pg.sh.join('');
      for (var ii = 0; ii < pg.items.length; ii++) {
        var it = list[pg.items[ii]], fills = {};
        for (j = 0; j < it.f.length; j++) {
          var fc = it.f[j];
          if (fc.tex && fc.uv && o.plates !== false) {
            var A = affine(fc), T = fc.tex, inner = '';
            if (A && T) {
              var TW = 1000, THh = TW / (T.aspect || 1);
              if (typeof T.svg === 'function') inner = T.svg(TW, THh, fc.dev >= 1);
              else if (T.src) inner = '<image crossorigin="anonymous" href="' + esc(T.src) + '" width="' + TW + '" height="' + THh + '" preserveAspectRatio="xMidYMid slice" class="p-plate' + (fc.dev >= 1 ? ' is-dev' : '') + '"/>';
              defs += '<clipPath id="' + id + 't' + texN + '"><path d="' + pathOf(fc.p) + '"/></clipPath>';
              g += '<g clip-path="url(#' + id + 't' + texN + ')"><path class="p-top" d="' + pathOf(fc.p) + '"/><g transform="matrix(' + [A[0] / TW, A[1] / TW, A[2] / THh, A[3] / THh, A[4], A[5]].map(function (z) { return +z.toFixed(5); }).join(' ') + ')">' + inner + '</g></g>';
              texN++;
              continue;
            }
          }
          var cl = faceCls(fc), op = fc.a < .985 ? fc.a.toFixed(2) : '';
          var fk = cl + '|' + op;
          fills[fk] = (fills[fk] || '') + pathOf(fc.p);
        }
        /* faces of one item keep their far-to-near order inside a class; classes overlap rarely within one part */
        var ord = [];
        for (j = 0; j < it.f.length; j++) { var fcj = it.f[j]; if (fcj.tex && fcj.uv && o.plates !== false) continue; var kk = faceCls(fcj) + '|' + (fcj.a < .985 ? fcj.a.toFixed(2) : ''); if (ord.indexOf(kk) < 0) ord.push(kk); }
        each(ord, function (kk2) { var bits = kk2.split('|'); g += '<path class="' + bits[0] + '"' + (bits[1] ? ' fill-opacity="' + bits[1] + '"' : '') + ' d="' + fills[kk2] + '"/>'; });
        var seg = {};
        for (j = 0; j < it.l.length; j++) {
          var s = it.l[j], cls = s.cls === 'sil' ? (s.c === 3 ? 'p-fl' : s.c === 1 || s.c === 2 ? 'p-line2' : 'p-sil') : s.c === 3 ? 'p-fl' : s.c === 1 || s.c === 2 ? 'p-line2' : 'p-line';
          var wpx = (s.cls === 'sil' ? s.w : s.w) * sz, k2 = cls + '|' + wpx.toFixed(2) + '|' + s.a.toFixed(2) + '|' + (s.dash || 0);
          seg[k2] = (seg[k2] || '') + 'M' + f1(s.x0) + ' ' + f1(s.y0) + 'L' + f1(s.x1) + ' ' + f1(s.y1);
        }
        for (var sk in seg) {
          var sb = sk.split('|');
          g += '<path class="' + sb[0] + '" stroke-width="' + sb[1] + '"' + (+sb[2] < .99 ? ' stroke-opacity="' + sb[2] + '"' : '') + (+sb[3] ? ' stroke-dasharray="' + sb[3] + ' ' + sb[3] + '"' : '') + ' d="' + seg[sk] + '"/>';
        }
        for (j = 0; j < it.s.length; j++) {
          var sp = it.s[j];
          if (sp.f >= 0) g += '<circle cx="' + f1(sp.x) + '" cy="' + f1(sp.y) + '" r="' + f1(M.max(.5, sp.r)) + '" class="' + (sp.f === 3 ? 'p-foil' : sp.f === 0 ? 'p-inkf' : 'p-top') + '"' + (sp.a < .99 ? ' fill-opacity="' + sp.a.toFixed(2) + '"' : '') + '/>';
          if (sp.l >= 0) g += '<circle cx="' + f1(sp.x) + '" cy="' + f1(sp.y) + '" r="' + f1(M.max(.5, sp.r)) + '" fill="none" class="' + (sp.l === 3 ? 'p-fl' : 'p-sil') + '" stroke-width="1"/>';
        }
      }
      var nm = pg.node.part || pg.node.id || ('part-' + pi), isG = (pg.node.layer || 0) < 0;
      var html = '<g data-part="' + esc(nm) + '" style="--i:' + gi + '">' + g + '</g>';
      gi++;
      if (isG) groundHTML += html; else partsHTML += html;
    }
    for (var bz in blurs) defs += '<filter id="' + id + 'b' + bz + '" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="' + bz + '"/></filter>';
    body = groundHTML + pageSh + castSh + partsHTML;
    var label = o.label || (v._tmpRoot && v._tmpRoot.def && (v._tmpRoot.def.title || '')) || '';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" class="ps3d-poster" data-reg="1" data-v="2"' + (dark ? ' data-tone="dark"' : '') +
      ' viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet"' + (label ? ' role="img" aria-label="' + esc(label) + '"' : ' aria-hidden="true"') + '>' +
      STYLE(id) + (defs ? '<defs>' + defs + '</defs>' : '') + body + '</svg>';
    /* put everything back */
    delete v._force; v.surface = keepS; v._lit = v._th = null; v.q = keepQ;
    if (v._tmp) v.destroy();
    else { v._size(); v.emit('resize'); if (o.rest !== false && x && x.rest) x.rest(false); v.invalidate(); }
    return svg;
  };
})();
