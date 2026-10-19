/* P.S. Lab, No. 07: A small universe. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<canvas id="expLife" data-ground="slate" data-cv-local></canvas>\n'
    + '      <div class="life-3d" id="life3d" hidden></div>\n'
    + '      <div class="life-st" role="group" aria-label="Stamps"><span class="ctl-k">Stamps</span><button class="ebtn2 life-sb" type="button" data-s="g">Glider</button><button class="ebtn2 life-sb" type="button" data-s="b">Blinker</button><button class="ebtn2 life-sb" type="button" data-s="gun">Gosper gun</button><span class="life-sh" id="lifeSh">Drag one onto the board.</span></div>\n'
    + '      <div class="btnrow">\n'
    + '        <button class="ebtn" id="lifePlay" type="button" aria-pressed="false">Run</button>\n'
    + '        <button class="ebtn2" id="lifeStep" type="button">Step</button>\n'
    + '        <button class="ebtn2" id="lifeSeed" type="button">Scatter seeds</button>\n'
    + '        <button class="ebtn2" id="lifeClear" type="button">Void</button>\n'
    + '        <button class="ebtn2" id="lifeStack" type="button" aria-pressed="false" hidden>Stack time</button>\n'
    + '        <span style="flex:1"></span>\n'
    + '        <span class="readout readout--inline"><span class="k">Generation</span><span class="v up" id="lifeGen">0</span></span>\n'
    + '      </div>\n'
    + '      <p class="eline">Draw on it. The rules ignore what you meant.</p>';
  LAB_KIT.mount('small-universe', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- 07: a small universe. Rules unchanged. Born cells grow in, the dead fade over three generations,
       stamps drag onto the board, and Stack time piles the last 120 generations into a tower (PS3D) ---------- */

      var lifeC = document.getElementById('expLife'), lifeX = lifeC.closest('.exp');
      var CELL = 8, cols = 0, rows = 0, gridA = null, prevA = null, lifeTr = null, playing = false, gen = 0, lifeTimer = null, lox = 0, loy = 0;
      var lifeAt = 0, lifeRaf = 0, lifeHist = [], lifeGhost = null, lifeArm = null, lifeArmB = null;
      var LIFE_ST = { g: [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]], b: [[0, 0], [1, 0], [2, 0]],
        gun: '24,0 22,1 24,1 12,2 13,2 20,2 21,2 34,2 35,2 11,3 15,3 20,3 21,3 34,3 35,3 0,4 1,4 10,4 16,4 20,4 21,4 0,5 1,5 10,5 14,5 16,5 17,5 22,5 24,5 10,6 16,6 24,6 11,7 15,7 12,8 13,8'
          .split(' ').map(function (p) { return p.split(',').map(Number); }) };
      function lifeFit() {
        var f = fitCanvas(lifeC, 190);
        if (!(f.W > 0)) return f;
        cols = Math.max(10, Math.floor(f.W / CELL));
        rows = Math.floor(190 / CELL);
        lox = Math.floor((f.W - cols * CELL) / 2); loy = Math.floor((190 - rows * CELL) / 2);
        if (!gridA || gridA.length !== cols * rows) {
          gridA = new Uint8Array(cols * rows);
          seed();
        }
        return f;
      }
      function seed() {
        for (var i = 0; i < gridA.length; i++) gridA[i] = Math.random() < 0.12 ? 1 : 0;
        gen = 0; prevA = null; lifeTr = new Uint8Array(gridA.length); lifeHist = [gridA];
      }
      function lifeDraw() {
        document.getElementById('lifeGen').textContent = gen;
        var f = lifeFit(), ctx = f.ctx;
        if (!(f.W > 0)) return 1;
        ctx.clearRect(0, 0, f.W, 190);
        var t = LAB_RM ? 1 : Math.min(1, (performance.now() - lifeAt) / 110), g = 1 - Math.pow(1 - Math.min(1, t * 1.6), 3), a, k, x, y, s2;
        /* the dead fade over three generations */
        for (a = 1; a <= 3; a++) {
          ctx.fillStyle = ACCA(Math.max(0, (a - t) / 3) * .3);
          for (k = 0; k < gridA.length; k++) if (lifeTr[k] === a && !gridA[k]) ctx.fillRect(lox + (k % cols) * CELL + 1, loy + ((k / cols) | 0) * CELL + 1, CELL - 2, CELL - 2);
        }
        /* survivors hold, newborns grow in and burn brightest */
        for (a = 0; a < 2; a++) {
          ctx.fillStyle = a ? ACC() : ACCA(.82);
          for (k = 0; k < gridA.length; k++) {
            if (!gridA[k] || (a ? (prevA && prevA[k]) : !(prevA && prevA[k]))) continue;
            x = lox + (k % cols) * CELL; y = loy + ((k / cols) | 0) * CELL; s2 = (CELL - 2) * (a ? .3 + .7 * g : 1);
            ctx.fillRect(x + CELL / 2 - s2 / 2, y + CELL / 2 - s2 / 2, s2, s2);
          }
        }
        if (lifeGhost) {
          ctx.strokeStyle = inkColor(.55); ctx.lineWidth = 1; ctx.beginPath();
          var gw = 0, gh = 0; lifeGhost.p.forEach(function (p) { gw = Math.max(gw, p[0] + 1); gh = Math.max(gh, p[1] + 1); });
          lifeGhost.p.forEach(function (p) {
            var gx = ((lifeGhost.x - (gw >> 1) + p[0]) % cols + cols) % cols, gy = ((lifeGhost.y - (gh >> 1) + p[1]) % rows + rows) % rows;
            ctx.rect(lox + gx * CELL + 1.5, loy + gy * CELL + 1.5, CELL - 3, CELL - 3);
          });
          ctx.stroke();
        }
        return t;
      }
      function lifeKick() {
        if (lifeRaf) return;
        lifeRaf = requestAnimationFrame(function fr() { lifeRaf = 0; if (lifeDraw() < 1) lifeRaf = requestAnimationFrame(fr); });
      }
      function lifeStepFn() {
        var next = new Uint8Array(cols * rows);
        for (var y = 0; y < rows; y++) {
          for (var x = 0; x < cols; x++) {
            var n = 0;
            for (var dy = -1; dy <= 1; dy++)
              for (var dx = -1; dx <= 1; dx++) {
                if (!dx && !dy) continue;
                var xx = (x + dx + cols) % cols, yy2 = (y + dy + rows) % rows;
                n += gridA[yy2 * cols + xx];
              }
            var alive = gridA[y * cols + x];
            next[y * cols + x] = (alive && (n === 2 || n === 3)) || (!alive && n === 3) ? 1 : 0;
          }
        }
        for (var k = 0; k < next.length; k++) lifeTr[k] = next[k] ? 0 : gridA[k] ? 3 : lifeTr[k] ? lifeTr[k] - 1 : 0;
        prevA = gridA; gridA = next; gen++; lifeAt = performance.now();
        lifeHist.push(gridA); if (lifeHist.length > 120) lifeHist.shift();
        if (lifeX._vis !== false && !L3.on) lifeKick(); else document.getElementById('lifeGen').textContent = gen;
        if (L3.on) l3Queue();
      }
      var lifePlayBtn = document.getElementById('lifePlay');
      lifePlayBtn.addEventListener('click', function () {
        playing = !playing;
        lifePlayBtn.textContent = playing ? 'Pause' : 'Run';
        lifePlayBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
        lifeX.classList.toggle('running', playing);
        clearInterval(lifeTimer);
        if (playing) lifeTimer = setInterval(lifeStepFn, 110);
      });
      document.getElementById('lifeStep').addEventListener('click', lifeStepFn);
      document.getElementById('lifeSeed').addEventListener('click', function () { seed(); lifeDraw(); if (L3.on) l3Queue(); });
      document.getElementById('lifeClear').addEventListener('click', function () {
        gridA = new Uint8Array(cols * rows); prevA = null; gen = 0; lifeTr = new Uint8Array(gridA.length); lifeHist = [gridA]; lifeDraw(); if (L3.on) l3Queue();
      });
      function lifeCellAt(e) {
        var r = lifeC.getBoundingClientRect();
        return [Math.floor((e.clientX - r.left - lifeC.clientLeft - lox) / CELL), Math.floor((e.clientY - r.top - lifeC.clientTop - loy) / CELL)];
      }
      function lifeIn(c) { return c[0] >= 0 && c[0] < cols && c[1] >= 0 && c[1] < rows; }
      function lifeStamp(pat, cx, cy) {
        var w = 0, h = 0; pat.forEach(function (p) { w = Math.max(w, p[0] + 1); h = Math.max(h, p[1] + 1); });
        pat.forEach(function (p) {
          var k = (((cy - (h >> 1) + p[1]) % rows + rows) % rows) * cols + (((cx - (w >> 1) + p[0]) % cols + cols) % cols);
          if (prevA) prevA[k] = 0; gridA[k] = 1; lifeTr[k] = 0;
        });
        lifeAt = performance.now(); lifeKick();
        if (L3.on) l3Queue();
      }
      var lifeSh = document.getElementById('lifeSh');
      function lifeArmSet(p, b) {
        lifeArm = p; if (lifeArmB) lifeArmB.classList.remove('armed');
        lifeArmB = p ? b : null; if (b && p) b.classList.add('armed');
        lifeX.classList.toggle('arming', !!p);
        lifeSh.textContent = p ? 'Now tap the board.' : 'Drag one onto the board.';
        if (!p && lifeGhost) { lifeGhost = null; lifeDraw(); }
      }
      Array.prototype.forEach.call(lifeX.querySelectorAll('.life-sb'), function (b) {
        var pat = LIFE_ST[b.getAttribute('data-s')], dg = null;
        b.addEventListener('click', function (e) {
          if (b._mv) { b._mv = false; return; }
          if (!e.detail) { lifeFit(); lifeStamp(pat, cols >> 1, rows >> 1); return; } /* keys and assistive tech: the centre of the board */
          lifeArmSet(lifeArm === pat ? null : pat, b);
        });
        b.addEventListener('pointerdown', function (e) { if (e.button > 0) return; dg = { x: e.clientX, y: e.clientY, mv: false }; try { b.setPointerCapture(e.pointerId); } catch (er) {} });
        b.addEventListener('pointermove', function (e) {
          if (!dg) return;
          if (!dg.mv && Math.hypot(e.clientX - dg.x, e.clientY - dg.y) > 6) dg.mv = true;
          if (!dg.mv) return;
          var c = lifeCellAt(e); lifeGhost = lifeIn(c) ? { p: pat, x: c[0], y: c[1] } : null; lifeDraw();
        });
        b.addEventListener('pointerup', function () {
          if (dg && dg.mv) { b._mv = true; if (lifeGhost) { lifeStamp(pat, lifeGhost.x, lifeGhost.y); lifeArmSet(null); } lifeGhost = null; lifeDraw(); }
          dg = null;
        });
        b.addEventListener('pointercancel', function () { dg = null; lifeGhost = null; lifeDraw(); });
      });
      var lifePainting = false;
      function paint(e) {
        var c = lifeCellAt(e), x = c[0], y = c[1];
        if (lifeIn(c)) {
          if (prevA) prevA[y * cols + x] = 0;
          gridA[y * cols + x] = 1; lifeTr[y * cols + x] = 0; lifeDraw();
        }
      }
      /* a finger on the board waits to learn what it is: a vertical move scrolls the page, a tap paints one cell,
         a 250ms hold or a sideways stroke starts painting */
      var lifeT = null;
      function lifeTouchGo(e) {
        if (!lifeT) return;
        var t = lifeT; clearTimeout(t.tm); lifeT = null;
        try { lifeC.setPointerCapture(t.id); } catch (er) {}
        lifePainting = true; paint(t.p0); if (e) paint(e);
      }
      function lifeTouchEnd() { if (lifeT) { clearTimeout(lifeT.tm); lifeT = null; } }
      lifeC.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') {
          lifeTouchEnd();
          lifeT = { id: e.pointerId, x: e.clientX, y: e.clientY, p0: { clientX: e.clientX, clientY: e.clientY }, arm: !!lifeArm, tm: 0 };
          if (!lifeArm) lifeT.tm = setTimeout(function () { lifeTouchGo(null); }, 250);
          return;
        }
        e.preventDefault();
        if (lifeArm) { var c = lifeCellAt(e); if (lifeIn(c)) lifeStamp(lifeArm, c[0], c[1]); lifeArmSet(null); return; }
        lifePainting = true; paint(e);
      });
      lifeC.addEventListener('pointerup', function (e) {
        if (!lifeT || e.pointerId !== lifeT.id) return;
        var t = lifeT; lifeTouchEnd();
        if (Math.abs(e.clientX - t.x) > 8 || Math.abs(e.clientY - t.y) > 8) return;
        if (t.arm && lifeArm) { var c = lifeCellAt(e); if (lifeIn(c)) lifeStamp(lifeArm, c[0], c[1]); lifeArmSet(null); }
        else paint(e);
      });
      lifeC.addEventListener('pointercancel', function () { lifeTouchEnd(); lifePainting = false; });
      lifeC.addEventListener('touchmove', function (e) { if (lifePainting && e.cancelable) e.preventDefault(); }, { passive: false });
      lifeC.addEventListener('pointermove', function (e) {
        if (lifeT && e.pointerId === lifeT.id) {
          var dx = Math.abs(e.clientX - lifeT.x), dy = Math.abs(e.clientY - lifeT.y);
          if (!lifeT.arm && dx > 8 && dx > dy) lifeTouchGo(e);
          else if (dy > 8 && dy >= dx) lifeTouchEnd();
          return;
        }
        if (lifePainting) paint(e);
        else if (lifeArm) { var c = lifeCellAt(e); lifeGhost = lifeIn(c) ? { p: lifeArm, x: c[0], y: c[1] } : null; lifeDraw(); }
      });
      lifeC.addEventListener('pointerleave', function () { if (lifeArm && lifeGhost) { lifeGhost = null; lifeDraw(); } });
      window.addEventListener('pointerup', function () { lifePainting = false; });
      setTimeout(lifeDraw, 250);
      labRepaint(lifeDraw, lifeC);

      /* Stack time: assets/3d/models/life.js piles the last 120 generations into a tower, now in foil on top */
      var L3 = { on: false, m: null, q: 0 }, life3d = document.getElementById('life3d'), lifeStackB = document.getElementById('lifeStack');
      function l3Queue() { if (!L3.q) L3.q = setTimeout(function () { L3.q = 0; if (L3.m && L3.on) L3.m.build(); }, playing ? 330 : 0); }
      lifeStackB.hidden = LAB_SAVE;
      lifeStackB.addEventListener('click', function () {
        L3.on = !L3.on;
        lifeStackB.setAttribute('aria-pressed', L3.on ? 'true' : 'false');
        lifeX.classList.toggle('stack', L3.on); life3d.hidden = !L3.on;
        if (!L3.on) { if (L3.m) L3.m.pause(); lifeDraw(); return; }
        if (L3.m) { L3.m.resume(); L3.m.build(); return; }
        lab3d(function (P) {
          P.need('life').then(function (d) {
            if (L3.m) return;
            L3.m = d.mount(life3d, { hist: function () { return lifeHist; }, cols: function () { return cols; }, rows: function () { return rows; }, gen: function () { return gen; } });
            if (!L3.on) L3.m.pause();
          }, function () {});
        });
      });
    return {};
  });
})();
