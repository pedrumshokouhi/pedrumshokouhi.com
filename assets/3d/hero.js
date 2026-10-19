/* P.S. 3D hero.js v2: the Stack. One printed sheet per essay, twisted into a tower on the paper; the top sheet (the latest)
   prints in full colour on a foil edge, the others in warm monochrome until the stack fans open.
   PS3D.hero(host, {leaves, latest, missing, missingText, caption, renderer, light, entrance, track, lineA, cam, fill, onFan, fanBox})
     -> Hero {fan(bool), toggle(), impulse(deg), pulse(), set(opts), rest(bool), destroy(), view, leafAt(x, y), hover(i)}
   leaves: [{no, title, href, min, credit, img: {src, w, h, focal}}] in index order, latest first (leaves[0] is the top sheet).
   img.src is the very URL the page's poster prints (same file, same CORS mode), so each plate is fetched once per load. latest: the index in leaves of the latest (0). missing: a model index taken out of the stack (the 404); missingText
   prints on its strip. light: 'pointer' turns the key light with the pointer or the phone. entrance: 'poster' waits for the
   page's 'hero:entered' event on the host (its SVG poster plays the drop) and then swaps in at rest, with no fade.
   fanBox(w, h) -> {x0, y0, x1, y1}: the part of the canvas (CSS px) the open fan may use. The page keeps the fan off its own
   type and inside the screen; the fit moves the picture with the camera's projection shift, so picking stays exact.
   The canvas never takes pointer events: clicks are picked from the document and preventDefault is called only on a hit. */
(function () {
  'use strict';
  var P = window.PS3D;
  if (!P || P.hero) return;
  var W = window, D = document, M = Math, RAD = M.PI / 180, clamp = P._clamp, TOUCH = P._touch;
  var FINE = !!(W.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
  var WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  var TH = .009, SP = .1;  /* a sheet's thickness (about 2px at hero size) and the rest spacing */
  /* the sheet's face, in a 1000 x 1000 tile: a paper margin, the plate, then the numero and the title on a strip at the foot */
  var PL = { x: 60, y: 60, w: 880, h: 610 }, ST = { y: 760 };
  function cssv(name, fb) { try { var v = getComputedStyle(D.documentElement).getPropertyValue(name).trim(); return v || fb; } catch (e) { return fb; } }
  /* the sheet's own inks, resolved where the Stack lives: --leaf, --leaf-ink and --leaf-ink2 (site.css keeps the sheets paper on
     a dark light, so the Stack stays the lit thing on the screen), falling back to the page's card and inks */
  function leafInks(host) {
    var o = { paper: cssv('--card', '#FCFBF6'), ink: cssv('--ink', '#121110'), ink2: cssv('--ink-2', '#55524B') };
    if (!host || !host.isConnected) return o;
    try {
      var pr = D.createElement('i');
      pr.setAttribute('aria-hidden', 'true');
      pr.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none';
      host.appendChild(pr);
      pr.style.color = 'var(--leaf, var(--card))'; o.paper = getComputedStyle(pr).color || o.paper;
      pr.style.color = 'var(--leaf-ink, var(--ink))'; o.ink = getComputedStyle(pr).color || o.ink;
      pr.style.color = 'var(--leaf-ink2, var(--ink-2))'; o.ink2 = getComputedStyle(pr).color || o.ink2;
      host.removeChild(pr);
    } catch (e) {}
    return o;
  }
  /* the same truncation for the poster's type, measured on a scratch canvas */
  var MC = null;
  function fitm(font, s, w) { try { MC = MC || D.createElement('canvas').getContext('2d'); MC.font = font; return fit(MC, s, w); } catch (e) { return s; } }
  function fit(cx, s, w) {
    if (cx.measureText(s).width <= w) return s;
    while (s.length > 4 && cx.measureText(s + '…').width > w) s = s.slice(0, -1);
    return s.replace(/[\s,.:;]+$/, '') + '…';
  }

  P.model('stack', {
    v: 2, title: 'The Stack', desc: 'A tower of printed sheets, one for each essay. The top sheet, on a foil edge, is the latest.',
    camera: 'persp', cam: { fov: 22, yaw: 32, pitch: 30 }, params: { n: 12, tex: null },
    /* the latest sheet: a foil edge around a printed face. The face prints as paper (no metal sheen over the plate), so the plate
       keeps its full colour and contrast, as the poster prints it */
    mats: { latest: { face: 'accent', line: 'accent', w: 1.5 } },
    build: function (B, p) {
      var parts = [];
      for (var i = 0; i < p.n; i++) {
        var top = i === p.n - 1, tx = p.tex ? p.tex[i] : null;
        parts.push(B.part('leaf-' + i, { mat: top ? 'latest' : 'paper', pos: [0, i * SP, 0], rot: [0, i * 7.5, 0] }, [
          B.box(0, 0, 0, 1, TH, 1, { w: top ? 1.25 : 1, tex: tx })
        ]));
      }
      return parts;
    }
  });

  function Hero(host, o) {
    var H = this, N = o.n || (o.leaves && o.leaves.length) || 12;
    H.host = host; H.o = o; H.N = N; H.leaves = o.leaves || []; H.missing = o.missing != null ? o.missing : -1;
    H.latest = o.latest || 0;
    H.fanned = false; H.sp = SP; H.ya = 0; H.dy = 0; H.inView = true; H.hov = -1; H.dead = false;
    var cv = P._canvas(host, 'hero3d-canvas');
    cv.style.pointerEvents = 'none';
    var v = H.view = P.create(cv, { camera: 'persp', renderer: o.renderer, dprMax: o.dprMax });
    if (o.lineA != null) v.lineA = o.lineA;
    H.tex = [];
    for (var i = 0; i < N; i++) H.tex.push(H._tex(i));
    H.root = P.build('stack', { n: N, tex: H.tex });
    v.add(H.root);
    H.L = []; H.st = [];
    /* a sheet lays a light shadow on the sheet under it (.3 of a contact shadow, about what the poster prints), so every
       title stays readable; the bottom sheet's shadow on the paper keeps full strength */
    for (i = 0; i < N; i++) { H.L.push(H.root.parts['leaf-' + i]); H.st.push({ f: 0, sw: 0, lift: 0, m: 0 }); H.L[i].shadeOn = .3; }
    /* the latest prints in colour from the start */
    var top = H.L[N - 1 - H.latest] || H.L[N - 1]; if (top) top.dev = 1;
    for (i = 0; i < N; i++) H.pose(i);
    v.camera.set({ fov: 22, yaw: 32, pitch: 30 });
    if (o.cam) v.camera.set(o.cam);
    H.base = { yaw: v.camera.yaw, pitch: v.camera.pitch };
    H.reframe();
    H.small = H._smallNow();
    v.on('resize', function () {
      if (!H.fanned) H.reframe();
      else { var oc = H._openCam(), c0 = v.camera; c0.pitch = oc.pitch; c0.target = oc.target; c0.dist = oc.dist; c0.shift = oc.shift; v.invalidate(); }
      /* a sheet under about 140px across drops its foot line (numero, credit, title): at that size it prints at 4 to 8px */
      var sm = H._smallNow();
      if (sm !== H.small) { H.small = sm; each(H.tex, function (t) { if (t) t.v = (t.v || 0) + 1; }); v.invalidate(); }
    });
    H.sw = []; H.fs = []; H.dv = [];
    for (i = 0; i < N; i++) (function (i) {
      var k = 120 - 74 * (N > 1 ? i / (N - 1) : 0);
      H.sw.push(P.spring({ k: k, c: 2 * M.sqrt(k) * .82, eps: .005, onUpdate: function (x) { H.st[i].sw = x; H.pose(i); } }));
      H.fs.push(P.spring({ k: 120, c: 20, eps: .0005, onUpdate: function (x) { H.st[i].f = x; H.pose(i); } }));
    })(i);
    H.cp = P.spring({ k: 60, c: 14, eps: .01, onUpdate: function (x) { v.camera.op = x; v.invalidate(); } });
    if (H.missing >= 0 && H.missing < N) H.ms = P.spring({ k: 120, c: 20, eps: .0005, onUpdate: function (x) { H.st[H.missing].m = x; H.pose(H.missing); } });
    if (o.light) H.rig = P.light(v, { mode: o.light, idle: false });
    /* the entrance: the page's poster plays the drop and says when it has landed; GL takes over at rest */
    var gate = null, reg = host.querySelector('.ps3d-poster[data-reg="1"]');
    H.poster = o.entrance === 'poster';
    if (H.poster && !P.reduced()) gate = new Promise(function (res) {
      var done = function () { host.removeEventListener('hero:entered', done); W.removeEventListener('hero:entered', done); res(); };
      host.addEventListener('hero:entered', done); W.addEventListener('hero:entered', done);
      setTimeout(done, 4000);
    });
    /* a registered poster already prints the plates: the canvas waits for its own (landed or failed, 2.5s at most) so the swap
       never shows a typeset plate where the poster had a picture */
    if (reg) {
      var texes = H.tex.filter(function (t) { return t && t.src; });
      var plates = new Promise(function (res) {
        var left = texes.length, t0 = setTimeout(res, 2500);
        if (!left) { clearTimeout(t0); res(); return; }
        each(texes, function (t) { t.onload = t.onerror = function () { if (--left <= 0) { clearTimeout(t0); res(); } }; });
      });
      gate = gate ? Promise.all([gate, plates]) : plates;
    }
    P._handoff(v, host, { gate: gate });
    H._a11y();
    H._events();
    H._unth = P.onTheme(function () { each(H.tex, function (t) { if (t) t.v = (t.v || 0) + 1; }); v.invalidate(); });
    var first = function () {
      v.off('frame', first);
      if (P.reduced() || H.poster) return;
      for (var j = 0; j < N; j++) (function (j) { setTimeout(function () { H.kick(j, 4); }, j * 30); })(j);
      var turned = false;
      try { turned = sessionStorage.getItem('psHeroTurned') === '1'; } catch (e) {}
      if (TOUCH && !turned && H.missing < 0) {
        try { sessionStorage.setItem('psHeroTurned', '1'); } catch (e) {}
        var io = P._easeOf('io');
        P.tween({ dur: 2400, ease: 'linear', update: function (k) { H.ya2 = 35 * (k < .5 ? io(k * 2) : io((1 - k) * 2)); H.poseAll(); } });
      }
    };
    v.on('frame', first);
    v.invalidate();
  }
  Hero.prototype = {
    /* the face of model sheet i: its plate, its numero and its title */
    _tex: function (i) {
      var H = this, lf = H.leaf(i), no = lf ? lf.no : ('00' + (i + 1)).slice(-3), img = lf && lf.img;
      var src = img ? img.src || img.src330 || null : null, miss = i === H.missing;
      var T = { key: 'leaf-' + i + '-' + no + (src ? '-i' : ''), src: src, focal: img && img.focal, mono: true, aspect: 1, v: 0, iw: img && img.w, ih: img && img.h };
      T.draw = function (cx, w, h, im) {
        var k = w / 1000, li = leafInks(H.host), paper = li.paper, ink = li.ink, ink2 = li.ink2;
        cx.save(); cx.scale(k, k);
        cx.fillStyle = paper; cx.fillRect(0, 0, 1000, 1000);
        if (im) { P.cover(cx, im, PL.x, PL.y, PL.w, PL.h, T.focal); }
        else {
          /* a typeset plate: the numero large, the title under it, on a tint of the paper */
          cx.fillStyle = 'rgba(0,0,0,.045)'; cx.fillRect(PL.x, PL.y, PL.w, PL.h);
          cx.fillStyle = ink; cx.textAlign = 'center'; cx.textBaseline = 'alphabetic';
          cx.font = '400 300px Georgia, "Times New Roman", serif'; cx.fillText(miss ? '404' : no, 500, PL.y + 395);
          if (lf && lf.title && !miss) { cx.font = 'italic 400 46px Georgia, "Times New Roman", serif'; cx.fillStyle = ink2; cx.fillText(fit(cx, lf.title, 760), 500, PL.y + 520); }
        }
        cx.strokeStyle = 'rgba(0,0,0,.12)'; cx.lineWidth = 2; cx.strokeRect(PL.x + 1, PL.y + 1, PL.w - 2, PL.h - 2);
        if (H.small && !miss) { cx.restore(); return; }
        cx.textAlign = 'left'; cx.textBaseline = 'alphabetic';
        cx.fillStyle = ink2; cx.font = '500 34px "Helvetica Neue", Helvetica, Arial, sans-serif';
        var k2 = 'NO. ' + no; if (cx.letterSpacing != null) cx.letterSpacing = '4px';
        cx.fillText(k2, PL.x, ST.y);
        if (lf && lf.credit) { cx.textAlign = 'right'; cx.font = '400 26px "Helvetica Neue", Helvetica, Arial, sans-serif'; cx.fillText(fit(cx, lf.credit, 520), PL.x + PL.w, ST.y); cx.textAlign = 'left'; }
        if (cx.letterSpacing != null) cx.letterSpacing = '0px';
        cx.fillStyle = ink; cx.font = '400 62px Georgia, "Times New Roman", serif';
        var t = miss ? String(H.o.missingText || '').slice(0, 28) : (lf ? lf.title : '');
        if (t) cx.fillText(fit(cx, t, PL.w), PL.x, ST.y + 100);
        cx.restore();
      };
      /* the same face for the poster, in tile units (w x h): the plate as an <image>, the type as <text> */
      T.svg = function (w, h, dev) {
        var k = w / 1000, s = '<g transform="scale(' + k + ')"><rect class="p-top" x="0" y="0" width="1000" height="1000"/>';
        if (src && T.iw && T.ih && !T.fail) {
          var f = (function (fc) { if (!fc) return [.5, .5]; if (typeof fc === 'string') { var m = fc.match(/-?[\d.]+/g) || []; return [(+m[0] || 50) / 100, (m[1] != null ? +m[1] : 50) / 100]; } return fc; })(T.focal);
          var sc = M.max(PL.w / T.iw, PL.h / T.ih), dw = T.iw * sc, dh = T.ih * sc, dx = PL.x - clamp(f[0] * dw - PL.w / 2, 0, dw - PL.w), dy = PL.y - clamp(f[1] * dh - PL.h / 2, 0, dh - PL.h);
          s += '<svg x="' + PL.x + '" y="' + PL.y + '" width="' + PL.w + '" height="' + PL.h + '" viewBox="' + PL.x + ' ' + PL.y + ' ' + PL.w + ' ' + PL.h + '"><image crossorigin="anonymous" href="' + esc(src) + '" x="' + dx.toFixed(1) + '" y="' + dy.toFixed(1) + '" width="' + dw.toFixed(1) + '" height="' + dh.toFixed(1) + '" class="p-plate' + (dev ? ' is-dev' : '') + '" preserveAspectRatio="none"/></svg>';
        } else {
          s += '<rect x="' + PL.x + '" y="' + PL.y + '" width="' + PL.w + '" height="' + PL.h + '" class="p-txt" fill-opacity=".045"/>';
          s += '<text class="p-txt" x="500" y="' + (PL.y + 395) + '" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="300">' + (miss ? '404' : no) + '</text>';
          if (lf && lf.title && !miss) s += '<text class="p-txt2" x="500" y="' + (PL.y + 520) + '" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-style="italic" font-size="46">' + esc(fitm('italic 400 46px Georgia, "Times New Roman", serif', lf.title, 760)) + '</text>';
        }
        /* the plate's frame is a crease (.p-line), not a silhouette: it prints at .12 of the line colour */
        s += '<rect x="' + (PL.x + 1) + '" y="' + (PL.y + 1) + '" width="' + (PL.w - 2) + '" height="' + (PL.h - 2) + '" fill="none" class="p-line" stroke-opacity=".12" stroke-width="2" style="vector-effect:none;stroke-width:1.75px;stroke-opacity:.12"/>';
        if (H.small && !miss) return s + '</g>';
        s += '<text class="p-txt2" x="' + PL.x + '" y="' + ST.y + '" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="500" font-size="34" letter-spacing="4">NO. ' + esc(no) + '</text>';
        if (lf && lf.credit) s += '<text class="p-txt2" x="' + (PL.x + PL.w) + '" y="' + ST.y + '" text-anchor="end" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="26">' + esc(fitm('400 26px "Helvetica Neue", Helvetica, Arial, sans-serif', lf.credit, 520)) + '</text>';
        var t = miss ? String(H.o.missingText || '').slice(0, 28) : (lf ? lf.title : '');
        /* the fallen sheet's strip is a <text class="p-miss"> even when empty, so the 404 page can print the path into it before paint */
        if (t || miss) s += '<text class="p-txt' + (miss ? ' p-miss' : '') + '" x="' + PL.x + '" y="' + (ST.y + 100) + '" font-family="Georgia, Times New Roman, serif" font-size="62">' + esc(t ? fitm('400 62px Georgia, "Times New Roman", serif', t, PL.w) : '') + '</text>';
        return s + '</g>';
      };
      return T;
    },
    /* the projected length of a sheet's front edge at rest, in CSS px: under 140 the foot line is too small to read */
    _smallNow: function () {
      try { var v = this.view; if (!v.w || !v.h) return false; var a = v.project([-.5, 0, .5]), b = v.project([.5, 0, .5]); return M.hypot(b[0] - a[0], b[1] - a[1]) < 140; } catch (e) { return false; }
    },
    /* one sheet's transform from its state: a twist about the centre opens into a fan about the spine corner (-.5, y, -.5) */
    pose: function (i) {
      var H = this, L = H.L[i], s = H.st[i], f = s.f, N = H.N;
      var sp = H.sp * (1 - f) + .034 * f, th = N > 1 ? i * 300 / (N - 1) : 0, a = (i * 7.5 * (1 - f) + th * f) * RAD;
      var px = -.5 * f, pz = -.5 * f, ca = M.cos(a), sa = M.sin(a);
      var cx = px - (px * ca + pz * sa), cz = pz - (-px * sa + pz * ca);
      var sw = (s.sw + H.ya + (H.ya2 || 0) + H.dy) * RAD, cs = M.cos(sw), ss = M.sin(sw);
      var x = cx * cs + cz * ss, z = -cx * ss + cz * cs, y = i * sp + s.lift, rotY = a + sw, rotZ = 0;
      if (i === H.missing) {
        var m = s.m, lx = 1.05, ly = -.003, lz = .45, la = 18 * RAD;
        x = lx + (x - lx) * m; y = ly + (y - ly) * m; z = lz + (z - lz) * m; rotY = la + (rotY - la) * m; rotZ = -1.2 * (1 - m);
        if (m < .5) y = M.max(y, 0);
      }
      L.pos = [x, y, z];
      L.rot = rotZ ? P.q.mul(P.q.y(rotY / RAD), P.q.axis([0, 0, 1], rotZ)) : P.q.y(rotY / RAD);
      H.view.invalidate();
    },
    poseAll: function () { for (var i = 0; i < this.N; i++) this.pose(i); },
    /* framing at rest (f = 0) or open (f = 1): the camera fits the drawing's projected extents, and at rest the cast shadow's reach
       on the paper too, so the shadow stays inside the frame */
    framing: function (open) {
      var H = this, v = H.view, keep = [], i;
      for (i = 0; i < H.N; i++) { keep.push(H.st[i].f); H.st[i].f = open ? 1 : 0; H.pose(i); }
      var pts = v.corners();
      if (!open && v.shadow) {
        var b = v.bounds(), y0 = b[1], cam = v.camera, pitch = H.base.pitch, yaw = H.base.yaw, bs = { y: yaw, p: pitch };
        var yr = bs.y * RAD, pr = bs.p * RAD, d = [M.cos(pr) * M.sin(yr), M.sin(pr), M.cos(pr) * M.cos(yr)], r = [M.cos(yr), 0, -M.sin(yr)], u = P.v3.cross(d, r);
        var Lc = P.LIGHT.key, L = P.v3.norm([r[0] * Lc[0] + u[0] * Lc[1] + d[0] * Lc[2], r[1] * Lc[0] + u[1] * Lc[1] + d[1] * Lc[2], r[2] * Lc[0] + u[2] * Lc[1] + d[2] * Lc[2]]), Ly = M.max(L[1], .12);
        var n0 = pts.length;
        for (i = 0; i < n0; i++) { var q = pts[i], h = M.max(q[1] - y0, 0) * .8; pts.push([q[0] - L[0] * h / Ly, y0, q[2] - L[2] * h / Ly]); }
      }
      for (i = 0; i < H.N; i++) { H.st[i].f = keep[i]; H.pose(i); }
      return v.frameCalc(pts, 1 / clamp(H.o.fill || .78, .3, 1), H.base.yaw, open ? 56 : H.base.pitch);
    },
    reframe: function () { var f = this.framing(false), c = this.view.camera; if (f) { c.target = f.target; c.dist = f.dist; c.span = f.span; c.radius = f.radius; this.view.invalidate(); } },
    /* the open fan's camera: {pitch, target, dist, shift}. With a fanBox the fan is sized to the box (a 1.08 margin) and centred
       in it; without one it is framed in the whole canvas, as before */
    _openCam: function () {
      var H = this, v = H.view, cam = v.camera, fr = H.framing(true), out = { pitch: 56, target: fr.target, dist: fr.dist, shift: [0, 0] };
      var b = H.o.fanBox && v.w && v.h ? H.o.fanBox(v.w, v.h) : null;
      if (!b || !(b.x1 - b.x0 > 60) || !(b.y1 - b.y0 > 60)) return out;
      var keep = [], i, pts;
      for (i = 0; i < H.N; i++) { keep.push(H.st[i].f); H.st[i].f = 1; H.pose(i); }
      pts = v.corners();
      for (i = 0; i < H.N; i++) { H.st[i].f = keep[i]; H.pose(i); }
      if (!pts || !pts.length) return out;
      var y = H.base.yaw * RAD, p = 56 * RAD, r = [M.cos(y), 0, -M.sin(y)], d = [M.cos(p) * M.sin(y), M.sin(p), M.cos(p) * M.cos(y)], u = P.v3.cross(d, r);
      var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9;
      each(pts, function (q) {
        var a = P.v3.dot(q, r), e = P.v3.dot(q, u), f = P.v3.dot(q, d);
        if (a < x0) x0 = a; if (a > x1) x1 = a; if (e < y0) y0 = e; if (e > y1) y1 = e; if (f < z0) z0 = f; if (f > z1) z1 = f;
      });
      var w = v.w, h = v.h, fw = (b.x1 - b.x0) / w, fh = (b.y1 - b.y0) / h, m = 1.08;
      var hh = M.max((y1 - y0) * m / (2 * fh), (x1 - x0) * m / (2 * (w / h) * fw));
      out.target = P.v3.add(P.v3.add(P.v3.scale(r, (x0 + x1) / 2), P.v3.scale(u, (y0 + y1) / 2)), P.v3.scale(d, (z0 + z1) / 2));
      out.dist = hh / M.tan((cam.fov || 22) * RAD / 2) + (z1 - z0) / 2;
      out.shift = [((b.x0 + b.x1) / 2 - w / 2) / (w / 2), (h / 2 - (b.y0 + b.y1) / 2) / (h / 2)];
      return out;
    },
    kick: function (i, deg) { var s = this.sw[i]; if (s) s.impulse(deg * M.sqrt(s.k) * 2.39); },
    impulse: function (deg, stagger) {
      var H = this;
      for (var i = 0; i < H.N; i++) (function (i) { if (stagger) setTimeout(function () { H.kick(i, deg); }, i * stagger); else H.kick(i, deg); })(i);
      return H;
    },
    pulse: function () {
      var top = this.L[this.N - 1], v = this.view;
      if (!top || P.reduced() || !this.inView) return this;
      P.tween({ dur: 320, ease: 'linear', update: function (k) { top.hl = 1.667 * M.sin(M.PI * k); v.invalidate(); }, done: function () { top.hl = 0; v.invalidate(); } });
      return this;
    },
    sway: function (t) { for (var i = 0; i < this.N; i++) this.sw[i].set(t); },
    /* a sheet develops from monochrome to colour: 900ms, 40ms apart, as the fan opens; back as it closes */
    develop: function (on) {
      var H = this, lt = H.N - 1 - H.latest;
      for (var i = 0; i < H.N; i++) (function (i) {
        var n = H.L[i]; if (!n || i === lt) return;
        if (H.dv[i]) H.dv[i]();
        var to = on ? 1 : 0;
        if (P.reduced()) { n.dev = to; H.view.invalidate(); return; }
        H.dv[i] = P.tween({ from: n.dev || 0, to: to, dur: on ? 900 : 400, delay: on ? i * 40 : 0, ease: 'out', update: function (x) { n.dev = x; H.view.invalidate(); } });
      })(i);
    },
    fan: function (on) {
      var H = this, v = H.view, cam = v.camera, red = P.reduced();
      on = !!on;
      if (H.missing >= 0 || on === H.fanned) return H;
      H.fanned = on;
      if (H.btn) H.btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (H.links) each(H.links.querySelectorAll('a'), function (a) { a.tabIndex = on ? 0 : -1; });
      if (H.links) H.links.setAttribute('aria-hidden', on ? 'false' : 'true');
      for (var i = 0; i < H.N; i++) (function (i) {
        var d = (on ? i : H.N - 1 - i) * 35;
        if (red) H.fs[i].snap(on ? 1 : 0);
        else setTimeout(function () { if (H.fanned === on) H.fs[i].set(on ? 1 : 0); }, d);
      })(i);
      H.develop(on);
      if (!on) H.hover(-1);
      /* frame the open fan (or the rest pose) and ease the camera there; the open fan fits the page's box */
      var fr = on ? H._openCam() : H.framing(false), sh0 = cam.shift || [0, 0], sh1 = on ? fr.shift : [0, 0];
      if (H._ct) H._ct();
      var from = [cam.pitch, cam.target[0], cam.target[1], cam.target[2], cam.dist, sh0[0], sh0[1]];
      var to = [on ? 56 : H.base.pitch, fr.target[0], fr.target[1], fr.target[2], fr.dist, sh1[0], sh1[1]];
      H._ct = P.tween({ from: from, to: to, dur: red ? 0 : 900, ease: 'io', update: function (a) { cam.pitch = a[0]; cam.target = [a[1], a[2], a[3]]; cam.dist = a[4]; cam.shift = [a[5], a[6]]; v.invalidate(); } });
      H.cap();
      if (H.o.onFan) H.o.onFan(on);
      return H;
    },
    toggle: function () { return this.fan(!this.fanned); },
    /* the poster pose: closed, still, the latest in colour, nothing lit; rest(false) lets go */
    rest: function (on) {
      var H = this, c = H.view.camera, i;
      if (on) {
        H._rs = { ya: H.ya, ya2: H.ya2, dy: H.dy, sp: H.sp, oy: c.oy, op: c.op, ly: c.ly, pitch: c.pitch, t: c.target.slice(), dist: c.dist, sh: (c.shift || [0, 0]).slice() };
        H.ya = 0; H.ya2 = 0; H.dy = 0; H.sp = SP; c.oy = c.op = c.ly = 0; c.pitch = H.base.pitch; c.shift = [0, 0];
        for (i = 0; i < H.N; i++) { H.st[i].sw = 0; H.st[i].lift = 0; if (!H.fanned) H.st[i].f = 0; if (i === H.missing && H.ms) H.st[i].m = 0; H.L[i].hl = 0; }
        H.poseAll(); H.reframe();
      } else if (H._rs) {
        var r = H._rs; H._rs = null;
        H.ya = r.ya; H.ya2 = r.ya2; H.dy = r.dy; H.sp = r.sp; c.oy = r.oy; c.op = r.op; c.ly = r.ly; c.pitch = r.pitch; c.target = r.t; c.dist = r.dist; c.shift = r.sh;
        if (H.ms) H.st[H.missing].m = H.ms.x;
        for (i = 0; i < H.N; i++) { H.st[i].sw = H.sw[i].x; H.st[i].f = H.fs[i].x; }
        H.poseAll();
      }
      H.view.invalidate();
      return H;
    },
    leafAt: function (x, y) {
      var hit = this.view.pick(x, y);
      if (!hit || !hit.node) return { hit: !!hit, i: -1 };
      var m = /^leaf-(\d+)$/.exec(hit.node.part || '');
      return { hit: true, i: m ? +m[1] : -1 };
    },
    leaf: function (i) { return this.leaves[this.N - 1 - i] || null; },
    hover: function (i) {
      var H = this;
      if (i === H.hov) return;
      var prev = H.hov; H.hov = i;
      each([prev, i], function (j, k) {
        if (j < 0 || !H.L[j]) return;
        var on = k === 1, s = H.st[j], from = s.lift, L = H.L[j];
        P.tween({ from: [from, L.hl], to: [on ? .05 : 0, on ? 1 : 0], dur: 200, update: function (a) { s.lift = a[0]; L.hl = a[1]; H.pose(j); } });
      });
      H.foil(i < 0 || i === H.N - 1);
      H.cap();
    },
    /* one foil per view: while another sheet is lit, the latest's foil edge rests (its lines print in ink like the rest) */
    foil: function (on) {
      var H = this, top = H.L[H.N - 1], g = top && top.geom;
      if (!g || H._foil === on) return H;
      var L = g.L, i, k;
      if (!H._lc) { H._lc = []; for (i = 0; i < L.length; i += 17) H._lc.push(L[i + 13], L[i + 12]); }
      H._foil = on;
      for (i = 0, k = 0; i < L.length; i += 17, k += 2) { L[i + 13] = on ? H._lc[k] : 0; L[i + 12] = on ? H._lc[k + 1] : 1; }
      top.touch(); H.view.invalidate();
      return H;
    },
    cap: function () {
      var H = this, el = H.o.caption;
      if (!el) return;
      if (H._capHTML == null) H._capHTML = el.innerHTML;
      var lf = H.fanned && H.hov >= 0 ? H.leaf(H.hov) : null;
      if (lf) el.textContent = ['No. ' + lf.no, lf.title, lf.min ? lf.min + (/min/.test(lf.min) ? '' : ' min') : ''].filter(Boolean).join(' · ');
      else el.innerHTML = H._capHTML;
    },
    _a11y: function () {
      var H = this, host = H.host;
      if (H.missing >= 0) return;
      H.btn = host.querySelector('.hero3d-btn');  /* the page's own button keeps its label ("Fan the stack") */
      if (!H.btn) {
        H.btn = D.createElement('button'); H.btn.type = 'button'; H.btn.className = 'hero3d-btn vh';
        H.btn.textContent = 'Fan out the ' + (WORDS[H.N] || H.N) + ' essays';
        host.appendChild(H.btn);
      }
      H.btn.setAttribute('aria-pressed', 'false');
      if (H.leaves.length) {
        H.links = D.createElement('ol'); H.links.className = 'hero3d-links vh'; H.links.setAttribute('aria-hidden', 'true');
        each(H.leaves, function (lf, k) {
          var li = D.createElement('li'), a = D.createElement('a');
          a.href = lf.href; a.tabIndex = -1; a.textContent = 'No. ' + lf.no + ', ' + lf.title + (lf.min ? ', ' + lf.min + (/min/.test(lf.min) ? '' : ' min') : '');
          a.addEventListener('focus', function () { H.hover(H.N - 1 - k); });
          a.addEventListener('blur', function () { H.hover(-1); });
          li.appendChild(a); H.links.appendChild(li);
        });
        host.appendChild(H.links);
      }
      H.btn.addEventListener('click', function () { H.toggle(); });
      H.btn.addEventListener('focus', function () { host.classList.add('is-focus'); });
      H.btn.addEventListener('blur', function () { host.classList.remove('is-focus'); });
    },
    _events: function () {
      var H = this, host = H.host, v = H.view, cv = function () { return v.canvas.getBoundingClientRect(); }, q = null, lastE = null;
      var track = H.o.track || (host.closest && host.closest('header')) || host.parentNode;
      H._click = function (e) {
        if (H.dead || e.defaultPrevented || e.button) return;
        var t = e.target;
        if (t.closest && t.closest('.hero3d-btn, .hero3d-links')) return;
        var r = cv(), x = e.clientX - r.left, y = e.clientY - r.top, own = t.closest && t.closest('a, button, input, label, summary, select, textarea');
        if (x < 0 || y < 0 || x > r.width || y > r.height || own) { if (H.fanned && !own) H.fan(false); return; }
        var l = H.leafAt(x, y);
        if (!l.hit) { if (H.fanned) H.fan(false); return; }
        e.preventDefault();
        if (H.missing >= 0) {
          var inSlot = H.ms && H.ms.target > .5;
          if (H.ms && (inSlot || l.i === H.missing)) { if (P.reduced()) H.ms.snap(inSlot ? 0 : 1); else H.ms.set(inSlot ? 0 : 1); }
          return;
        }
        if (!H.fanned) return H.fan(true);
        var lf = l.i >= 0 ? H.leaf(l.i) : null;
        if (lf && lf.href) location.href = lf.href; else H.fan(false);
      };
      H._key = function (e) { if (e.key === 'Escape' && H.fanned) { H.fan(false); if (H.btn) H.btn.focus(); } };
      H._move = function (e) {
        if (H.dead || !H.inView || e.pointerType === 'touch') return;
        lastE = e;
        if (!P.reduced() && !H.fanned) { H.sway(clamp(e.clientX / W.innerWidth * 2 - 1, -1, 1) * 16); H.cp.set(-clamp(e.clientY / W.innerHeight * 2 - 1, -1, 1) * 9); }
        if (H.fanned && FINE && !q) q = W.requestAnimationFrame(function () {
          q = null; if (!lastE) return;
          var r = cv(), l = H.leafAt(lastE.clientX - r.left, lastE.clientY - r.top);
          H.hover(l.i);
        });
      };
      H._scroll = function () {
        if (H.dead || !H.inView || P.reduced() || !track) return;
        var r = track.getBoundingClientRect(), p = clamp(-r.top / M.max(1, r.height), 0, 1);
        H.ya = 24 * p; H.sp = SP + .025 * p; H.poseAll();
      };
      D.addEventListener('click', H._click);
      D.addEventListener('keydown', H._key);
      W.addEventListener('pointermove', H._move, { passive: true });
      H._sq = 0;
      H._onScroll = function () { if (!H._sq) H._sq = W.requestAnimationFrame(function () { H._sq = 0; H._scroll(); }); };
      W.addEventListener('scroll', H._onScroll, { passive: true });
      if (W.IntersectionObserver) {
        H._io = new IntersectionObserver(function (es) { H.inView = es[es.length - 1].isIntersecting; if (!H.inView) { H.sway(0); H.cp.set(0); } }, { rootMargin: '0px' });
        H._io.observe(host);
      }
      /* phones: horizontal drag with inertia, back to base after 2.5s idle; tilt turns the camera once the phone allows it.
         iOS asks for the tilt on the first touch of the Stack, never through a control of its own */
      if (TOUCH) {
        host.style.touchAction = 'pan-y';
        var st = null, back = 0;
        H._pd = function (e) {
          H._askTilt();
          if (e.pointerType !== 'touch') return;
          var r = cv(), l = H.leafAt(e.clientX - r.left, e.clientY - r.top);
          if (!l.hit) return;
          st = { x: e.clientX, y: e.clientY, dy: H.dy, lock: 0, v: 0, t: P._now(), lx: e.clientX };
          clearTimeout(back);
        };
        H._pm = function (e) {
          if (!st) return;
          var dx = e.clientX - st.x, dyy = e.clientY - st.y;
          if (!st.lock) { if (M.abs(dx) < 8 && M.abs(dyy) < 8) return; st.lock = M.abs(dx) > M.abs(dyy) ? 'h' : 'v'; }
          if (st.lock !== 'h') return;
          var t = P._now(), dt = M.max(1, t - st.t) / 1000;
          st.v = st.v * .5 + (e.clientX - st.lx) * .5 / dt; st.t = t; st.lx = e.clientX;
          H.dy = st.dy + dx * .35; H.poseAll();
        };
        H._pu = function () {
          if (!st) return;
          var s = st; st = null;
          if (s.lock === 'h' && !P.reduced()) {
            var vel = s.v * .35;
            P._anim({ step: function (dt) { H.dy += vel * dt; vel *= M.pow(.92, dt * 60); H.poseAll(); return M.abs(vel) > .5; } });
          }
          back = setTimeout(function () { var from = H.dy; P.tween({ from: from, to: 0, dur: 900, ease: 'io', update: function (x) { H.dy = x; H.poseAll(); } }); }, 2500);
        };
        host.addEventListener('pointerdown', H._pd);
        host.addEventListener('pointermove', H._pm);
        host.addEventListener('pointerup', H._pu);
        host.addEventListener('pointercancel', H._pu);
        var DOE = W.DeviceOrientationEvent;
        /* Android fires this at sensor rate even on a still table: only a real change wakes the camera, and it rests once it lands */
        H._ori = function (e) {
          if (e.gamma == null || P.reduced() || !H.inView || D.hidden || H.dead || H.fanned) return;
          var ty = clamp(e.gamma, -45, 45) / 45 * 12, tp = clamp((e.beta || 45) - 45, -45, 45) / 45 * 7;
          if (H._ot && M.abs(ty - H._ot[0]) < .3 && M.abs(tp - H._ot[1]) < .3) return;
          H._ot = [ty, tp];
          if (H._oa) return;
          H._oa = true;
          P._anim({ step: function () {
            var c = v.camera, dy = H._ot[0] - c.oy, dp = H._ot[1] - c.op;
            c.oy += dy * .08; c.op += dp * .08; v.invalidate();
            if ((M.abs(dy) < .01 && M.abs(dp) < .01) || H.dead) { H._oa = false; return false; }
            return true;
          } });
        };
        var IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        H._askTilt = function () {
          if (H._asked) return; H._asked = true;
          if (!(DOE && typeof DOE.requestPermission === 'function' && IOS)) return;
          try { DOE.requestPermission().then(function (s) { if (s === 'granted') W.addEventListener('deviceorientation', H._ori); }, function () {}); } catch (er) {}
          if (H.rig && H.rig.requestTilt) H.rig.requestTilt();
        };
        if (DOE && typeof DOE.requestPermission !== 'function') W.addEventListener('deviceorientation', H._ori);
      } else H._askTilt = function () {};
      H._unm = P.onMotion(function (r) { if (r && !H.dead) { H.sway(0); H.cp.snap(0); H.ya = 0; H.sp = SP; H.poseAll(); } });
    },
    set: function (o) {
      var H = this;
      if (!o) return H;
      if (o.lineA != null) H.view.lineA = o.lineA;
      if (o.cam) { H.view.camera.set(o.cam); H.base = { yaw: H.view.camera.yaw, pitch: H.view.camera.pitch }; }
      if (o.leaves) H.leaves = o.leaves;
      if (o.caption) { H.o.caption = o.caption; H._capHTML = null; }
      if (o.missingText != null) { H.o.missingText = o.missingText; each(H.tex, function (t) { t.v = (t.v || 0) + 1; }); }
      H.view.invalidate();
      return H;
    },
    destroy: function () {
      var H = this, host = H.host;
      H.dead = true;
      D.removeEventListener('click', H._click); D.removeEventListener('keydown', H._key);
      W.removeEventListener('pointermove', H._move); W.removeEventListener('scroll', H._onScroll);
      if (H._sq) W.cancelAnimationFrame(H._sq);
      if (H._ori) W.removeEventListener('deviceorientation', H._ori);
      if (H._pd) { host.removeEventListener('pointerdown', H._pd); host.removeEventListener('pointermove', H._pm); host.removeEventListener('pointerup', H._pu); host.removeEventListener('pointercancel', H._pu); }
      if (H._io) H._io.disconnect();
      if (H._unm) H._unm();
      if (H._unth) H._unth();
      H.view.destroy();
      each([H.view.canvas, H.links], function (e) { if (e && e.parentNode) e.parentNode.removeChild(e); });
      var p = host.querySelector('.ps3d-poster'); if (p) { p.style.opacity = ''; p.style.visibility = ''; p.style.pointerEvents = ''; }
    }
  };
  function each(a, f) { for (var i = 0; a && i < a.length; i++) f(a[i], i); }
  /* markup escapes for the poster writer, built from the ampersand so no entity sits in a JS string */
  var AMP = String.fromCharCode(38), ESC = { '&': AMP + 'amp;', '<': AMP + 'lt;', '>': AMP + 'gt;', '"': AMP + 'quot;' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ESC[c]; }); }
  P.Hero = Hero;
  P.hero = function (host, o) { return new Hero(host, o || {}); };
})();
