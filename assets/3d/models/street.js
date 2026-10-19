/* P.S. 3D model: street. The Lab, machine 38, "The acquirer". The portfolio as a street of buildings, one per company you own.
   Height is revenue, one floor line for every $25M, so a price rise lifts the roofline. Debt is glass water, shared out by revenue,
   so every building floods to the same share of its height: debt over revenue. The dashed ring on each building is the covenant at
   1.3 times revenue; when the water reaches it, the lender sells. Companies on the shared platform stand on its slab.
   def.mount(host, {}) -> {set({items: [{id, nm, rev, plat}], debt, rev}), pause(), resume(), view}. The page owns the game. */
(function () {
  'use strict';
  var P = window.PS3D;
  if (!P) return;
  var M = Math, N = 12, GAP = 1.5, K = .018, YAW = 34, PITCH = 26;
  var WATER = { face: 'ink', faceA: .1, line: 'ink2', lineA: .75 }, EDGE = { face: 'card', line: 'ink2' };
  /* the empty street's rest state: the first company drawn in pencil, a pale volume on dashed edges */
  var GHOST = { face: 'card', faceA: .55, line: 'ink2', lineA: .6, dash: 4 }, GH = .62;

  function money(v) { return '$' + M.round(v).toLocaleString('en-US') + 'M'; }

  function mount(host, o) {
    o = o || {};
    var cv = document.createElement('canvas'), yaw = 0, cur = [], free = [], sel = -1, hov = -1, kill = null, cam = null, cov = 0, debt = 0, tot = 0;
    host.appendChild(cv);
    var v = P.create(cv, { renderer: 'auto', camera: 'ortho', surface: 'paper', dprMax: 2 });
    var r = P.build({ id: 'street', build: function (B) {
      var p = [B.part('base', { pick: false, layer: -1, mat: EDGE }, [B.box(0, -.08, 0, 1, .08, 2.2)]),
        /* the empty street: a dashed lot where the first company will stand */
        B.part('lot', { pick: false, fit: false }, [B.path([[-.4, .002, -.4], [.4, .002, -.4], [.4, .002, .4], [-.4, .002, .4]], { closed: true, line: 'ink2', dash: 4 })]),
        B.part('ghost', { pick: false, fit: false }, [B.box(0, .002, 0, .8, GH, .8, { mat: GHOST })])], k;
      for (k = 0; k < N; k++) {
        free.push(k);
        p.push(B.part('p' + k, { pick: false, layer: -1, mat: EDGE, visible: false }, [B.box(0, -.04, 0, GAP, .04, 1.4)]));
        p.push(B.part('b' + k, { visible: false }, [B.box(0, 0, 0, .8, 1, .8)]));
        p.push(B.part('f' + k, { pick: false, visible: false }));
        p.push(B.part('w' + k, { pick: false, visible: false, mat: WATER }, [B.box(0, 0, 0, 1, 1, 1, { open: '-y' })]));
        p.push(B.part('c' + k, { pick: false, visible: false, fit: false }, [B.path([[-.56, 1, -.56], [.56, 1, -.56], [.56, 1, .56], [-.56, 1, .56]], { closed: true, line: 'ink2', dash: 4, lineA: .8 })]));
      }
      return p;
    } });
    v.add(r);
    var Q = r.parts;
    function tag(cls) { var t = document.createElement('span'); t.className = 'd3-tag' + (cls ? ' ' + cls : ''); host.appendChild(t); return t; }
    var tSel = tag(), tWat = tag(), tNone = tag();
    tNone.textContent = 'Buy a company and it is built here';

    /* every building as it stands this frame: h is its height, x its place on the street */
    function pose() {
      var k, e, n, ht;
      for (k = 0; k < N; k++) ['p', 'b', 'f', 'w', 'c'].forEach(function (t) { Q[t + k].visible = false; });
      cur.forEach(function (e2) {
        k = e2.slot; e = e2;
        var on = e.h > .002;
        ['b', 'f', 'w', 'c'].forEach(function (t) { n = Q[t + k]; n.visible = on; n.pos = [e.x, 0, 0]; });
        Q['p' + k].visible = on && e.plat; Q['p' + k].pos = [e.x, 0, 0];
        Q['b' + k].scl = [1, e.h, 1]; Q['f' + k].scl = [1, e.h, 1];
        ht = M.max(.001, M.min(1.6, cov) * e.h);
        Q['w' + k].scl = [1, ht, 1]; Q['w' + k].visible = on && cov > .001;
        Q['c' + k].scl = [1, 1.3 * e.h, 1];
        var dimd = sel >= 0 && sel !== k ? .38 : 1;
        Q['b' + k].hl = sel === k || (sel < 0 && hov === k) ? 1 : 0;
        Q['b' + k].dim = dimd; Q['f' + k].dim = dimd; Q['w' + k].dim = dimd;
      });
      var w = M.max(1, cur.length) * GAP + .6, alive = 0;
      cur.forEach(function (c) { if (!c.dead) alive++; });
      Q.base.scl = [w, 1, 1]; Q.lot.visible = !alive; Q.ghost.visible = !alive;
      v.invalidate();
    }
    /* the frame the street will have when it settles: every target height, and the covenant above the tallest */
    function frameFor(list) {
      var n = M.max(1, list.length), hx = n * GAP / 2 + .3, top = list.length ? .6 : GH + .3, i;
      for (i = 0; i < list.length; i++) top = M.max(top, list[i].th * M.max(1.3, M.min(1.6, cov) + .05));
      var pts = [];
      [-hx, hx].forEach(function (x) { [-.1, top].forEach(function (y) { [-1.1, 1.1].forEach(function (z) { pts.push([x, y, z]); }); }); });
      v.camera.yaw = YAW + yaw; v.camera.pitch = PITCH;
      return v.frameCalc(pts, 1.12);
    }
    function floors(rev) {
      var L = [], j, y, n = M.floor(rev / 25), s = .4;
      for (j = 1; j <= n && j < 40; j++) {
        y = j * 25 / rev;
        if (y > .985) break;
        L.push(-s, y, s, s, y, s, s, y, s, s, y, -s, s, y, -s, -s, y, -s, -s, y, -s, -s, y, s);
      }
      return P.geom([{ lines: L }], null, { face: 'none', line: 'ink2', lineA: .4 });
    }

    function set(d) {
      var items = d.items || [], n = items.length, from = [], to = [], keep = [], gone = [];
      debt = d.debt || 0; tot = d.rev || 0;
      var cov0 = cov, cov1 = tot > 0 ? debt / tot : 0;
      items.forEach(function (it, i) {
        var x = (i - (n - 1) / 2) * GAP, e = null;
        cur.forEach(function (c) { if (c.id === it.id && !c.dead) e = c; });
        if (!e) { e = { id: it.id, slot: free.shift(), h: 0, x: x }; if (e.slot == null) return; cur.push(e); }
        e.nm = it.nm; e.rev = it.rev; e.plat = !!it.plat; e.th = it.rev * K; e.tx = x;
        if (e.rv !== M.round(it.rev)) { e.rv = M.round(it.rev); Q['f' + e.slot].setGeom(floors(it.rev)); }
        keep.push(e);
      });
      cur.forEach(function (c) { if (keep.indexOf(c) < 0) { c.dead = true; c.th = 0; c.tx = c.x; gone.push(c); } });
      cur.forEach(function (c) { from.push(c.h, c.x); to.push(c.th, c.tx); });
      from.push(cov0); to.push(cov1);
      var f0 = cam || frameFor(cur), f1 = frameFor(keep);
      if (kill) kill();
      kill = P.tween({ from: from.concat(f0.target, [f0.radius]), to: to.concat(f1.target, [f1.radius]), dur: 900, ease: 'out',
        update: function (a) {
          var i = 0;
          cur.forEach(function (c) { c.h = a[i++]; c.x = a[i++]; });
          cov = a[i++];
          cam = { target: [a[i], a[i + 1], a[i + 2]], radius: a[i + 3] };
          v.camera.target = cam.target; v.camera.radius = cam.radius; v.camera.span = M.max(cam.radius, 4);
          pose();
        },
        done: function () {
          kill = null;
          cur = cur.filter(function (c) { if (c.dead) { free.push(c.slot); if (sel === c.slot) sel = -1; return false; } return true; });
          pose();
        } });
    }

    /* labels: the inspected building's name, revenue and share of the debt; the waterline's level */
    v.on('frame', function () {
      var s = null, last = null, first = null;
      cur.forEach(function (c) { if (!c.dead) { if (c.slot === (sel >= 0 ? sel : hov)) s = c; if (!first) first = c; last = c; } });
      tNone.classList.toggle('on', !last);
      /* the prompt hangs over the pencilled building, clear of the plinth's edges */
      if (!last) {
        var gw = tNone.offsetWidth, gx = v.project([0, GH, 0])[0], gy = 1e9;
        [[-.4, -.4], [.4, -.4], [.4, .4], [-.4, .4]].forEach(function (c) { gy = M.min(gy, v.project([c[0], GH, c[1]])[1]); });
        tNone.style.transform = 'translate(' + M.max(8, M.min(v.w - gw - 8, gx - gw / 2)).toFixed(1) + 'px,' + M.max(8, gy - tNone.offsetHeight - 12).toFixed(1) + 'px)';
      }
      tSel.classList.toggle('on', !!s);
      if (s) {
        tSel.innerHTML = '<b>' + s.nm + '</b> · ' + money(s.rev) + ' revenue · ' + money(tot > 0 ? debt * s.rev / tot : 0) + ' of debt';
        var p = v.project([s.x, s.h + .1, 0]), w = tSel.offsetWidth;
        tSel.style.transform = 'translate(' + M.max(8, M.min(v.w - w - 8, p[0] - w / 2)).toFixed(1) + 'px,' + M.max(8, p[1] - 26).toFixed(1) + 'px)';
      }
      tWat.classList.toggle('on', !!last && cov > .001);
      if (last && cov > .001) {
        tWat.textContent = 'Debt ' + cov.toFixed(2) + 'x revenue';
        /* the waterline is read off the first building, from its left: the glass corner nearest the viewer's left */
        var q = v.project([first.x - .55, M.min(1.6, cov) * first.h, .55]);
        var lx = q[0] - 10 - tWat.offsetWidth, room = lx >= 8;
        tWat.style.transform = 'translate(' + (room ? lx : 14).toFixed(1) + 'px,' + (room ? q[1] - 5 : 14).toFixed(1) + 'px)';
      }
    });

    /* drag turns the street; a tap or a hover inspects a building; vertical drags scroll the page on touch.
       Ctrl or Cmd and the wheel zooms, and so does a pinch; a double click puts it all back */
    /* input binds to the host and reads v.canvas, so it survives a fallback that swaps the canvas */
    var dg = null, hq = 0, pts = {}, pin = 0;
    function own(e) { return e.target === v.canvas; }
    function zoom(f) { v.camera.zoom = M.max(.6, M.min(2.6, (v.camera.zoom || 1) * f)); v.invalidate(); }
    function span() { var k = Object.keys(pts); return k.length < 2 ? 0 : M.hypot(pts[k[0]][0] - pts[k[1]][0], pts[k[0]][1] - pts[k[1]][1]); }
    host.addEventListener('wheel', function (e) { if (!own(e) || (!e.ctrlKey && !e.metaKey)) return; e.preventDefault(); zoom(M.exp(-e.deltaY * .002)); }, { passive: false });
    host.addEventListener('pointerdown', function (e) { if (!own(e)) return; pts[e.pointerId] = [e.clientX, e.clientY]; if (Object.keys(pts).length === 2) { pin = span(); dg = null; } });
    host.addEventListener('pointermove', function (e) { if (!pts[e.pointerId]) return; pts[e.pointerId] = [e.clientX, e.clientY]; if (pin) { var d = span(); if (d) { zoom(d / pin); pin = d; } } });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { host.addEventListener(t, function (e) { delete pts[e.pointerId]; if (Object.keys(pts).length < 2) pin = 0; }); });
    function at(e) { var b = v.canvas.getBoundingClientRect(), h = v.pick(e.clientX - b.left, e.clientY - b.top); return h && h.part && h.part.charAt(0) === 'b' ? +h.part.slice(1) : -1; }
    host.addEventListener('pointerdown', function (e) { if (!own(e) || e.button > 0 || pin) return; dg = { x: e.clientX, y: yaw, mv: false }; });
    host.addEventListener('pointermove', function (e) {
      if (pin) return;
      if (dg) {
        var dx = e.clientX - dg.x;
        if (!dg.mv && M.abs(dx) > 6) { dg.mv = true; try { v.canvas.setPointerCapture(e.pointerId); } catch (er) {} }
        if (dg.mv) { yaw = M.max(-70, M.min(70, dg.y + dx * .35)); v.camera.yaw = YAW + yaw; v.invalidate(); }
        return;
      }
      if (e.pointerType !== 'mouse' || hq || !own(e)) return;
      hq = requestAnimationFrame(function () { hq = 0; var k = at(e); if (k !== hov) { hov = k; pose(); } });
    });
    host.addEventListener('pointerup', function (e) {
      var d = dg; dg = null;
      if (d && !d.mv) { var k = at(e); sel = k === sel ? -1 : k; pose(); }
    });
    host.addEventListener('pointercancel', function () { dg = null; });
    host.addEventListener('pointerleave', function () { if (hov >= 0) { hov = -1; pose(); } });
    host.addEventListener('dblclick', function (e) { if (!own(e)) return; yaw = 0; sel = -1; v.camera.yaw = YAW; v.camera.zoom = 1; pose(); });

    var f = frameFor([]);
    v.camera.target = f.target; v.camera.radius = f.radius; v.camera.span = 4; cam = f;
    pose();
    return { set: set, pause: function () { v.pause(); }, resume: function () { v.resume(); }, view: v };
  }

  P.model('street', { v: 1, title: 'The acquirer, as a street', desc: 'One building per company: height is revenue, glass is debt.', camera: 'ortho', mount: mount });
})();
