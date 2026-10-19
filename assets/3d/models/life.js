/* P.S. 3D model: life. The Lab, machine 07, "A small universe": Stack time. Every generation of the board is one layer of cubes,
   the oldest at the bottom and the current one in foil on top, so a glider leaves a diagonal trail through time. Past 6,000 live
   cells (1,500 on Canvas2D) the cubes become points. The page owns the board and its rules; this only draws what it is handed.
   def.mount(host, {hist() -> [Uint8Array], cols(), rows(), gen()}) -> {build(), pause(), resume()}. */
(function () {
  'use strict';
  var P = window.PS3D;
  if (!P) return;
  var M = Math, H = .7;

  function mount(host, o) {
    var cv = document.createElement('canvas'), yaw = 0, top = 0, n = 0;
    host.appendChild(cv);
    var v = P.create(cv, { renderer: 'auto', camera: 'ortho', surface: 'paper', dprMax: 2 });
    var r = P.build({ id: 'life', build: function (B) {
      return [B.part('plate', { pick: false, layer: -1, mat: 'quiet' }, [B.box(0, -1, 0, 1, 1, 1)]), B.part('old', { pick: false }), B.part('now', { pick: false })];
    } });
    v.add(r);
    function tag(cls, txt) { var t = document.createElement('span'); t.className = 'd3-tag on' + (cls ? ' ' + cls : ''); if (txt) t.textContent = txt; host.appendChild(t); return t; }
    var now = tag('live'), cap = tag('', 'Time runs up · drag to turn');
    cap.style.transform = 'translate(16px,14px)';
    v.on('frame', function () {
      if (!n) return;
      now.textContent = 'Now · generation ' + o.gen();
      var p = v.project([o.cols() / 2, top, -o.rows() / 2]), w = now.offsetWidth;
      now.style.transform = 'translate(' + M.max(8, M.min(v.w - w - 8, p[0] - w / 2)).toFixed(1) + 'px,' + M.max(34, p[1] - 22).toFixed(1) + 'px)';
    });

    function build() {
      var B = P.B, hist = o.hist().slice(-120), cols = o.cols(), rows = o.rows(), cnt = 0, old = [], cur = [], g, k, cube;
      hist.forEach(function (a) { for (var i = 0; i < a.length; i++) cnt += a[i]; });
      cube = cnt <= (v.kind === 'gl' ? 6000 : 1500);
      for (g = 0; g < hist.length; g++) {
        var a = hist[g], dst = g === hist.length - 1 ? cur : old;
        for (k = 0; k < a.length; k++) if (a[k]) {
          var x = k % cols - cols / 2 + .5, z = ((k / cols) | 0) - rows / 2 + .5;
          dst.push(cube ? B.box(x, g * H, z, .84, .56, .84, { edges: false, open: '-y' }) : B.sphere([x, g * H + .28, z], -3, { edges: false }));
        }
      }
      r.parts.old.setGeom(P.geom(old, null, { face: 'ink2', line: 'ink' }));
      r.parts.now.setGeom(P.geom(cur, null, { face: 'accent', line: 'accent' }));
      r.parts.plate.scl = [cols + 2, .25, rows + 2];
      v.camera.yaw = 38 + yaw; v.camera.pitch = 26;
      v.frame(v.corners(), 1.12);
      top = (hist.length - 1) * H + .6; n = hist.length;
      v.invalidate();
    }

    /* drag turns the tower; vertical drags scroll the page on touch. Input binds to the host and reads v.canvas, so it survives
       a fallback that swaps the canvas */
    var dg = null;
    host.addEventListener('pointerdown', function (e) { if (e.target !== v.canvas || e.button > 0) return; dg = { x: e.clientX, y: yaw, mv: false }; });
    host.addEventListener('pointermove', function (e) {
      if (!dg) return;
      var dx = e.clientX - dg.x;
      if (!dg.mv && M.abs(dx) > 4) { dg.mv = true; try { v.canvas.setPointerCapture(e.pointerId); } catch (er) {} }
      if (dg.mv) { yaw = M.max(-80, M.min(80, dg.y + dx * .35)); v.camera.yaw = 38 + yaw; v.invalidate(); }
    });
    host.addEventListener('pointerup', function () { dg = null; });
    host.addEventListener('pointercancel', function () { dg = null; });
    host.addEventListener('dblclick', function (e) { if (e.target !== v.canvas) return; yaw = 0; v.camera.yaw = 38; v.invalidate(); });

    build();
    return { build: build, pause: function () { v.pause(); }, resume: function () { v.resume(); }, view: v };
  }

  P.model('life', { v: 1, title: 'A small universe, stacked', desc: 'The last 120 generations of the board, one layer each.', camera: 'ortho', mount: mount });
})();
