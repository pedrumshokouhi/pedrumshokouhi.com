/* P.S. 3D model: fold. The Lab, machine 04, "Fold to the Moon". Units are metres, everything at true size.
   Folds 1 to 7 are real folds: the flap turns 180 degrees on its crease while the stack recentres, halving the longer side of an
   A4 sheet each time. Past fold 7 the stack is a column 0.1 mm x 2^n tall, and the camera backs away on a log scale past a person,
   the Eiffel Tower, Everest, the ISS and the Moon. The ground gives way to the Earth's curve near 500 km.
   def.mount(stage, {marks: [[fold, height, name, fig] x5], pick(i)}) -> {go(n, label), sel(i)}. The page owns the slider. */
(function () {
  'use strict';
  var P = window.PS3D;
  if (!P) return;
  var M = Math, RE = 6.371e6, D = [];
  /* where each landmark's label sits */
  var AT = [[-1.2, 2, .4], [-210, 356, 80], [-6800, 9500, 1100], [-2.04e5, 4.45e5, 0], [3.08e7, 3.81e8, 0]];
  (function () { var w = .297, d = .21; for (var k = 0; k <= 7; k++) { D.push([w, d]); if (w >= d) w /= 2; else d /= 2; } })();
  function sm(a, b, x) { x = M.max(0, M.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
  function qa(z, deg) { var h = deg * M.PI / 360, s = M.sin(h); return [z ? 0 : s, 0, z ? s : 0, M.cos(h)]; }
  function orbit(a, h) { h = RE + (h || 4.2e5); return [M.sin(a) * h, M.cos(a) * h - RE, 0]; }

  function build(B) {
    var p = [], i, a, E = [[62, 0], [35, 57], [20, 115], [7, 276], [0, 330]], tw = [], arc = [], fc = [];
    var pk = [600, 8849, -400], bc = [[-5200, 0, -3600], [5000, 0, -3900], [4600, 0, 3800], [-4800, 0, 3400]], mo = [];
    /* a shoulder to the south, so the massif reads as a mountain and not a pyramid */
    var p2 = [3600, 6400, 2900], b2 = [[600, 0, 300], [7600, 0, 600], [7000, 0, 6400], [800, 0, 6000]];
    p.push(B.part('ground', { pick: false, layer: -1, mat: 'quiet' }, [B.box(0, -1, 0, 1, 1, 1)]));
    p.push(B.part('earth', { pick: false, layer: -1, fit: false }, [B.sphere([0, -RE, 0], RE, { face: 'card', line: 'ink2' })]));
    /* the stack: a half that stays, and a flap on a hinge at the crease */
    p.push(B.part('a', { pick: false }, [B.box(0, 0, 0, 1, 1, 1)]));
    p.push(B.part('hinge', { pick: false }, [], [B.part('flap', { pick: false }, [B.box(0, 0, 0, 1, 1, 1)])]));
    p.push(B.part('pin', { pick: false, fit: false }, [B.sphere([0, 0, 0], -7, { face: 'accent', line: 'accent' })]));
    /* the landmarks are quiet: the paper is the subject */
    p.push(B.part('l0', { name: 'A person', pos: [-1.2, 0, .4], mat: 'quiet' }, [B.box(0, 0, 0, .46, 1.5, .26), B.sphere([0, 1.66, 0], .14)]));
    /* the Eiffel Tower: four legs through its three floors, 330 m */
    [[1, 1], [1, -1], [-1, -1], [-1, 1]].forEach(function (q) { tw.push(B.path(E.map(function (e) { return [e[0] * q[0], e[1], e[0] * q[1]]; }))); });
    [[37, 57], [21, 115], [8, 276]].forEach(function (q) { var h = q[0]; tw.push(B.path([[-h, q[1], -h], [h, q[1], -h], [h, q[1], h], [-h, q[1], h]], { closed: true })); });
    p.push(B.part('l1', { name: 'The Eiffel Tower', pos: [-210, 0, 80], mat: 'quiet' }, tw));
    for (i = 0; i < 4; i++) { fc.push(B.poly([pk, bc[i], bc[(i + 1) % 4]])); fc.push(B.poly([p2, b2[i], b2[(i + 1) % 4]])); }
    p.push(B.part('l2', { name: 'Everest', pos: [-7400, 0, 1500], mat: 'quiet' }, fc));
    for (a = -.13; a <= .1301; a += .026) arc.push(orbit(a));
    p.push(B.part('l3', { name: 'The ISS', mat: 'quiet' }, [B.path(arc, { line: 'ink2', dash: 4 }), B.sphere(orbit(-.03), -8, { face: 'card' })]));
    /* the Moon on its orbit: 384,400 km from the Earth's centre */
    for (a = -.34; a <= .3401; a += .02) mo.push(orbit(a, 3.778e8));
    p.push(B.part('l4', { name: 'The Moon', mat: 'quiet' }, [B.path(mo, { line: 'ink2', dash: 4 }), B.sphere(orbit(.08, 3.778e8), 1.737e6, { face: 'card', line: 'ink' })]));
    return p;
  }

  function mount(stage, o) {
    var marks = o.marks, st = { fp: 0, sel: -1, yaw: 0 }, cv = document.createElement('canvas'), tg = document.createElement('div');
    cv.className = 'f3-cv'; tg.className = 'f3-tags';
    stage.appendChild(cv); stage.appendChild(tg);
    var v = P.create(cv, { renderer: 'auto', camera: 'ortho', surface: 'paper', dprMax: 2 }), r = P.build(P.getModel('fold'));
    v.add(r);
    function tag(cls) { var t = document.createElement('span'); t.className = 'd3-tag' + (cls ? ' ' + cls : ''); tg.appendChild(t); return t; }
    var tags = marks.map(function () { return tag(); }), top = tag('live');

    function pose() {
      var Q = r.parts, fp = st.fp, k = M.min(7, M.floor(fp)), s = fp - k, t = 1e-4 * M.pow(2, fp), F, i, cs = sm(6.5, 9.5, fp);
      var A = Q.a, H = Q.hinge, L = Q.flap;
      if (fp < 7) {
        var w = D[k][0], d = D[k][1], tk = 1e-4 * M.pow(2, k), e = sm(0, 1, s), th = 180 * s;
        H.visible = true;
        if (w >= d) {
          A.pos = [-w / 4 + w / 4 * e, 0, 0]; A.scl = [w / 2, tk, d];
          H.pos = [w / 4 * e, tk, 0]; H.rot = qa(1, th); L.pos = [w / 4, -tk, 0]; L.scl = [w / 2, tk, d];
        } else {
          A.pos = [0, 0, -d / 4 + d / 4 * e]; A.scl = [w, tk, d / 2];
          H.pos = [0, tk, d / 4 * e]; H.rot = qa(0, -th); L.pos = [0, -tk, d / 4]; L.scl = [w, tk, d / 2];
        }
        var m0 = M.max(w, d), m1 = M.max(D[k + 1][0], D[k + 1][1]);
        F = 1.4 * M.exp(M.log(m0) + (M.log(m1) - M.log(m0)) * e);
        /* 0.1 mm is too thin to clear the ground's contact shadow: draw the sheet at least 0.5% of the frame thick */
        var vt = M.max(tk, F * .005);
        A.scl[1] = vt; L.scl[1] = vt; H.pos[1] = vt; L.pos[1] = -vt;
      } else {
        /* the column is 0.1 mm x 2^n: drawn true to its height, and never thinner than 0.4% of the frame, so it stays visible */
        H.visible = false; A.pos = [0, 0, 0];
        F = M.max(1.4 * D[7][0], 1.35 * t);
        A.scl = [M.max(D[7][0], F * .004), t, M.max(D[7][1], F * .004)];
      }
      Q.pin.visible = fp >= 6.5; Q.pin.pos = [0, fp < 7 ? 2e-4 * M.pow(2, k) : t, 0];
      Q.ground.scl = [(1.15 + .55 * cs) * F, .012 * F, (.8 + .3 * cs) * F]; Q.ground.pos = [-.24 * F * cs, 0, 0]; Q.ground.alpha = 1 - sm(1.2e5, 6e5, F); Q.ground.visible = Q.ground.alpha > .01;
      Q.earth.alpha = sm(1.5e5, 7e5, F); Q.earth.visible = Q.earth.alpha > .01;
      /* a landmark shows while it is between 1% and five times the frame */
      for (i = 0; i < 5; i++) {
        var n = Q['l' + i], q = marks[i][1] / F;
        n.alpha = sm(.01, .04, q) * (1 - sm(2, 5, q)); n.visible = n.alpha > .01; n.hl = i === st.sel ? 1 : 0;
      }
      var c = v.camera;
      /* as the Earth comes in, the camera levels out, so the column stands on the horizon and not on the face of the globe */
      c.yaw = 32 + st.yaw; c.pitch = (32 - 21 * cs) * (1 - .97 * Q.earth.alpha);
      c.radius = F / 2 / 1.12; c.span = F > 2e5 ? M.max(c.radius, 1.4e7) : c.radius;
      c.target = [-.28 * F * cs, F * (.14 + .28 * cs), 0];
      v.shadow = cs < 1 ? { c: [0, 0, 0], r: F * .5, a: .2 * (1 - cs) } : null;
      v.invalidate();
    }
    function put(t, p) {
      if (!t._w) t._w = t.offsetWidth;
      t.style.transform = 'translate(' + M.max(6, M.min(v.w - t._w - 6, p[0] - t._w / 2)).toFixed(1) + 'px,' + M.max(36, p[1] - 22).toFixed(1) + 'px)';
    }
    v.on('frame', function () {
      tags.forEach(function (t, i) {
        var n = r.parts['l' + i], on = n.visible && n.alpha > .4;
        t.classList.toggle('on', on); t.classList.toggle('live', i === st.sel);
        if (on) put(t, v.project(AT[i]));
      });
      var pin = r.parts.pin; top.classList.toggle('on', pin.visible);
      if (pin.visible) put(top, v.project(pin.pos));
    });
    v.on('frame', function first() { v.off('frame', first); stage.classList.add('f3d'); });
    var sp = P.spring({ k: 60, c: 13, x: 0, target: 0, onUpdate: function (x) { st.fp = M.max(0, M.min(42, x)); pose(); } });

    /* drag turns the drawing (horizontal only; vertical scrolls the page on touch), a tap inspects a landmark, a double click squares it.
       Input binds to the stage and reads v.canvas, so it survives a fallback that swaps the canvas */
    var dg = null;
    stage.addEventListener('pointerdown', function (e) { if (e.target !== v.canvas || e.button > 0) return; dg = { x: e.clientX, y: st.yaw, mv: false }; });
    stage.addEventListener('pointermove', function (e) {
      if (!dg) return;
      var dx = e.clientX - dg.x;
      if (!dg.mv && M.abs(dx) > 4) { dg.mv = true; try { v.canvas.setPointerCapture(e.pointerId); } catch (er) {} }
      if (dg.mv) { st.yaw = M.max(-70, M.min(70, dg.y + dx * .35)); pose(); }
    });
    stage.addEventListener('pointerup', function (e) {
      if (dg && !dg.mv) { var b = v.canvas.getBoundingClientRect(), h = v.pick(e.clientX - b.left, e.clientY - b.top); o.pick(h && /^l\d$/.test(h.part) ? +h.part.charAt(1) : -1); }
      dg = null;
    });
    stage.addEventListener('pointercancel', function () { dg = null; });
    stage.addEventListener('dblclick', function (e) { if (e.target !== v.canvas) return; st.yaw = 0; pose(); });

    var api = {
      go: function (n, label) {
        top.textContent = label; top._w = 0;
        if (P.reduced()) { sp.snap(n); return; }
        sp.set(n);
      },
      sel: function (i) {
        st.sel = i;
        tags.forEach(function (t, k) { t.textContent = marks[k][2] + ' · ' + marks[k][3] + (k === i ? ' · fold ' + marks[k][0] + ' passes it' : ''); t._w = 0; });
        pose();
      },
      view: v
    };
    api.sel(-1);
    return api;
  }

  P.model('fold', { v: 1, title: 'Fold to the Moon', desc: 'A sheet of paper folded in half 42 times, beside the things it passes.', camera: 'ortho', build: build, mount: mount });
})();
