/* P.S. Lab, No. 22: The rich get richer. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="lx-board lx-sky lx-bleed" data-ground="espresso" data-cv-local><canvas id="rrC" style="height:230px"></canvas></div>\n'
    + '      <div class="btnrow">\n'
    + '        <button class="ebtn" id="rrRich" type="button" aria-pressed="false">Run the real world</button>\n'
    + '        <button class="ebtn2" id="rrFair" type="button" aria-pressed="false">Run the fair world</button>\n'
    + '        <span style="flex:1"></span>\n'
    + '        <span class="readout readout--inline"><span class="k">Top node owns</span><span class="v up" id="rrTop">–</span></span>\n'
    + '      </div>\n'
    + '      <p class="eline" id="rrLine">This rule, preferential attachment, shapes citation counts, follower graphs and platform markets. Nobody planned any of them.</p>';
  LAB_KIT.mount('rich-get-richer', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- sim: rich get richer ---------- */

      var rrC = document.getElementById('rrC'), rrX = rrC.closest('.exp');
      var rrTimer = null, rrNodes = null, rrRaf = 0, rrUntil = 0, rrSel = null;
      /* at rest: the four founders the run starts from, waiting to be linked */
      var RR_SEED = [[-.16, -26], [-.05, 30], [.07, -12], [.17, 22]];
      function rrRest() {
        var f = fitCanvas(rrC, 230), ctx = f.ctx, W = f.W;
        if (!(W > 0)) return;
        ctx.clearRect(0, 0, W, 230);
        var cx = W / 2, sp = Math.min(W, 640), pts = RR_SEED.map(function (p) { return [cx + p[0] * sp, 104 + p[1]]; });
        ctx.save(); ctx.setLineDash([2, 4]); ctx.strokeStyle = inkColor(.22); ctx.lineWidth = .75; ctx.beginPath();
        pts.forEach(function (p, i) { if (i) { ctx.moveTo(pts[i - 1][0], pts[i - 1][1]); ctx.lineTo(p[0], p[1]); } });
        ctx.stroke(); ctx.restore();
        ctx.lineWidth = 1.5; ctx.strokeStyle = labColor('--card'); ctx.fillStyle = inkColor(.5);
        pts.forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], 3.5, 0, 7); ctx.stroke(); ctx.fill(); });
        cvText(ctx, 'Run to grow the network', cx, 196, { align: 'center', color: inkColor(.6) });
      }
      function rrPaint() {
        if (!rrNodes) { rrRest(); return; }
        var f = fitCanvas(rrC, 230), ctx = f.ctx, W = f.W;
        if (!(W > 0)) return;
        ctx.clearRect(0, 0, W, 230);
        ctx.strokeStyle = inkColor(.16); ctx.lineWidth = .75; ctx.beginPath();
        rrNodes.forEach(function (n) { if (n.px) { ctx.moveTo(n.x, n.y); ctx.lineTo(n.px.x, n.px.y); } });
        ctx.stroke();
        var maxDeg = 0, hubs = [], card = labColor('--card');
        rrNodes.forEach(function (n) { if (n.deg > maxDeg) maxDeg = n.deg; });
        /* every node is cut out of the web by a thin card-coloured rim; the hub is foil, with a ring */
        ctx.lineWidth = 1.5; ctx.strokeStyle = card; ctx.fillStyle = inkColor(.5);
        rrNodes.forEach(function (n) {
          if (n.deg === maxDeg && maxDeg > 3) { hubs.push(n); return; }
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r || 2, 0, 7); ctx.stroke(); ctx.fill();
        });
        hubs.forEach(function (n) {
          var r = n.r || 2;
          ctx.beginPath(); ctx.arc(n.x, n.y, r + 5, 0, 7); ctx.strokeStyle = ACCA(.35); ctx.lineWidth = 1; ctx.stroke();
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, 7); ctx.strokeStyle = card; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.fillStyle = ACC(); ctx.fill();
        });
        /* the node you tapped: its links, and its share of all of them */
        if (rrSel) {
          var sum = 0; rrNodes.forEach(function (n) { sum += n.deg; });
          ctx.beginPath(); ctx.arc(rrSel.x, rrSel.y, (rrSel.r || 2) + 3.5, 0, 7); ctx.strokeStyle = inkColor(.85); ctx.lineWidth = 1.25; ctx.stroke();
          var rt = rrSel.x > W - 150;
          cvText(ctx, rrSel.deg + (rrSel.deg === 1 ? ' link' : ' links') + ' \u00B7 ' + Math.round(rrSel.deg / sum * 100) + '% of all', rrSel.x + (rt ? -1 : 1) * ((rrSel.r || 2) + 9), rrSel.y - 6, { align: rt ? 'right' : 'left', color: inkColor(.85) });
        }
      }
      /* as a node grows it eases its neighbours out of the way: overlaps push apart, nothing else moves */
      function rrStep() {
        var N = rrNodes, W = rrC.clientWidth, i, j, a, b, dx, dy, d, f, m;
        for (i = 0; i < N.length; i++) { a = N[i]; a.fx = a.fy = 0; a.r = (a.r || 2) + ((2 + Math.sqrt(a.deg) * 2.4) - (a.r || 2)) * .2; }
        for (i = 0; i < N.length; i++) for (j = i + 1; j < N.length; j++) {
          a = N[i]; b = N[j]; dx = a.x - b.x; dy = a.y - b.y; m = a.r + b.r + 5;
          if (Math.abs(dx) > m || Math.abs(dy) > m) continue;
          d = Math.sqrt(dx * dx + dy * dy) || .1; if (d >= m) continue;
          f = (m - d) / d * .2; a.fx += dx * f; a.fy += dy * f; b.fx -= dx * f; b.fy -= dy * f;
        }
        for (i = 0; i < N.length; i++) { a = N[i]; a.x = Math.max(8, Math.min(W - 8, a.x + Math.max(-2, Math.min(2, a.fx)))); a.y = Math.max(8, Math.min(222, a.y + Math.max(-2, Math.min(2, a.fy)))); }
      }
      function rrKick() {
        rrUntil = performance.now() + 1600;
        if (LAB_RM) { rrNodes.forEach(function (n) { n.r = 2 + Math.sqrt(n.deg) * 2.4; }); rrPaint(); return; }
        if (rrRaf) return;
        rrRaf = requestAnimationFrame(function fr(ts) {
          rrRaf = 0;
          if (!rrNodes || rrX._vis === false) return;
          rrStep(); rrPaint();
          if (ts < rrUntil) rrRaf = requestAnimationFrame(fr);
        });
      }
      rrC.addEventListener('pointerdown', function (e) {
        if (!rrNodes) return;
        var best = null, bd = 1e9;
        rrNodes.forEach(function (n) { var d = Math.hypot(n.x - e.offsetX, n.y - e.offsetY); if (d < (n.r || 2) + 10 && d < bd) { bd = d; best = n; } });
        rrSel = best; rrPaint();
      });
      function rrRun(mode) {
        clearInterval(rrTimer);
        document.getElementById('rrRich').setAttribute('aria-pressed', mode === 'rich' ? 'true' : 'false');
        document.getElementById('rrFair').setAttribute('aria-pressed', mode === 'fair' ? 'true' : 'false');
        var f = fitCanvas(rrC, 230), Wd = f.W;
        var nodes = []; rrSel = null;
        for (var i = 0; i < 4; i++) {
          nodes.push({ x: Wd * (0.2 + 0.6 * Math.random()), y: 40 + 150 * Math.random(), deg: 1, px: null });
        }
        rrNodes = nodes;
        rrTimer = setInterval(function () {
          if (nodes.length >= 130) { clearInterval(rrTimer); rrTimer = null; return; }
          var parent;
          if (mode === 'fair') parent = nodes[Math.floor(Math.random() * nodes.length)];
          else {
            var totalDeg = nodes.reduce(function (a, n) { return a + n.deg; }, 0);
            var pickN = Math.random() * totalDeg, acc = 0;
            for (var j = 0; j < nodes.length; j++) { acc += nodes[j].deg; if (acc >= pickN) { parent = nodes[j]; break; } }
          }
          parent.deg++;
          var ang = Math.random() * Math.PI * 2;
          var dist = 24 + Math.random() * 42;
          var nx = Math.max(8, Math.min(f.W - 8, parent.x + Math.cos(ang) * dist));
          var ny = Math.max(8, Math.min(222, parent.y + Math.sin(ang) * dist));
          nodes.push({ x: nx, y: ny, deg: 1, px: parent, r: 1 });
          if (rrX._vis !== false) rrKick();
          var maxDeg = 0, sumDeg = 0;
          nodes.forEach(function (n) { if (n.deg > maxDeg) maxDeg = n.deg; sumDeg += n.deg; });
          document.getElementById('rrTop').textContent = Math.round(maxDeg / sumDeg * 100) + '%';
          if (nodes.length >= 130) {
            document.getElementById('rrLine').textContent = mode === 'fair'
              ? 'A fair world: everyone ends up roughly the same size, and nobody you have heard of exists. Now run the real one.'
              : 'One orange giant, built from early luck. It was first, and then the rule did the rest. Platforms, citations, follower counts, cities: same map.';
          }
        }, 60);
      }
      document.getElementById('rrRich').addEventListener('click', function () { rrRun('rich'); });
      document.getElementById('rrFair').addEventListener('click', function () { rrRun('fair'); });
      labRepaint(rrPaint, rrC);
      setTimeout(rrPaint, 250);
    return {};
  });
})();
