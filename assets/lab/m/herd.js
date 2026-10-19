/* P.S. Lab, No. 21: The herd. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="lx-bench lx-flat lx-bleed" data-cv-local><canvas id="hdC" style="height:230px"></canvas></div>\n'
    + '      <input type="range" id="hdSlider" min="0" max="100" value="20" aria-label="Herding level">\n'
    + '      <div class="btnrow">\n'
    + '        <button class="ebtn" id="hdRun" type="button">Open the market</button>\n'
    + '        <span style="flex:1"></span>\n'
    + '        <span class="readout readout--inline"><span class="k">Herding</span><span class="v up" id="hdH">20%</span></span>\n'
    + '      </div>\n'
    + '      <p class="eline" id="hdLine">At low herding, the crowd’s errors cancel and the price drifts. Push past 70% and the traders move as one.</p>';
  LAB_KIT.mount('herd', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- sim: the herd ---------- */

      var hdC = document.getElementById('hdC'), hdX = hdC.closest('.exp');
      var hdSlider = document.getElementById('hdSlider');
      var hdTimer = null, hdAgents = [], hdPrice = [], HN = 240, hdPrev = null, hdShow = new Float32Array(HN), hdRaf = 0, hdLast = 0, hdCas = 0, hdCasAt = 0;
      function hdHerdUI() {
        document.getElementById('hdH').textContent = hdSlider.value + '%';
        hdX.classList.toggle('stampede', +hdSlider.value >= 70);
      }
      hdSlider.addEventListener('input', hdHerdUI);
      hdHerdUI();
      /* the resting chart: one sample run of the same market at the default 20% herding, from a fixed seed, in pencil */
      var hdGhost = (function () {
        var sd = 20211, rnd = function () { sd = (sd + 0x6D2B79F5) | 0; var t = Math.imul(sd ^ (sd >>> 15), 1 | sd); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
        var ag = [], pr = [100], i, k;
        for (i = 0; i < HN; i++) ag.push(rnd() < .5 ? 1 : -1);
        for (k = 0; k < 219; k++) {
          var nx = ag.slice();
          for (i = 0; i < HN; i++) {
            if (rnd() < .25) {
              var nb = 0, cnt = 0;
              if (i % 24 !== 0) { nb += ag[i - 1]; cnt++; }
              if (i % 24 !== 23) { nb += ag[i + 1]; cnt++; }
              if (i >= 24) { nb += ag[i - 24]; cnt++; }
              if (i < HN - 24) { nb += ag[i + 24]; cnt++; }
              if (rnd() < .2 && cnt > 0 && nb !== 0) nx[i] = nb > 0 ? 1 : -1;
              else if (rnd() < .5) nx[i] = rnd() < .5 ? 1 : -1;
            }
          }
          ag = nx;
          var net = 0; for (i = 0; i < HN; i++) net += ag[i];
          pr.push(Math.max(5, pr[pr.length - 1] * (1 + net / HN * .02)));
        }
        return pr;
      })();
      function hdPaint() {
        var f = fitCanvas(hdC, 230), ctx = f.ctx, Wd = f.W, H = 230;
        if (!(Wd > 0)) return;
        ctx.clearRect(0, 0, Wd, H);
        var L = 10, R = Wd - 10, PT = 14, PB = 108, i;
        if (hdPrice.length > 1) {
          var lo = Math.min.apply(null, hdPrice), hi = Math.max.apply(null, hdPrice);
          if (hi - lo < 1) hi = lo + 1;
          var px = function (k) { return L + k / 219 * (R - L); };
          var py = function (p) { return PT + (1 - (p - lo) / (hi - lo)) * (PB - PT); };
          /* the price, with the ground it covers tinted beneath it */
          var g = ctx.createLinearGradient(0, PT, 0, PB + 6);
          g.addColorStop(0, ACCA(.14)); g.addColorStop(1, ACCA(0));
          ctx.beginPath(); ctx.moveTo(px(0), PB + 6);
          for (i = 0; i < hdPrice.length; i++) ctx.lineTo(px(i), py(hdPrice[i]));
          ctx.lineTo(px(hdPrice.length - 1), PB + 6); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
          ctx.strokeStyle = ACC(); ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.beginPath();
          for (i = 0; i < hdPrice.length; i++) { if (i) ctx.lineTo(px(i), py(hdPrice[i])); else ctx.moveTo(px(i), py(hdPrice[i])); }
          ctx.stroke();
          var hx = px(hdPrice.length - 1), hy = py(hdPrice[hdPrice.length - 1]);
          ctx.fillStyle = ACCA(.18); ctx.beginPath(); ctx.arc(hx, hy, 7, 0, 7); ctx.fill();
          ctx.fillStyle = ACC(); ctx.beginPath(); ctx.arc(hx, hy, 3, 0, 7); ctx.fill();
          /* the cascade: the moment four in five traders stand on one side, marked once and let go */
          if (hdCas) {
            var cg = LAB_RM ? 0 : Math.min(1, (performance.now() - hdCasAt) / 1600), ci = hdCas - 1, cx0 = px(Math.max(0, ci));
            ctx.save(); ctx.globalAlpha = 1 - .55 * cg; ctx.setLineDash([3, 3]); ctx.strokeStyle = inkColor(.55); ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(cvSnap(cx0), PT - 4); ctx.lineTo(cvSnap(cx0), PB + 6); ctx.stroke(); ctx.restore();
            if (cg < 1) { ctx.strokeStyle = ACCA(.6 * (1 - cg)); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx0, py(hdPrice[Math.max(0, ci)]), 6 + 22 * cg, 0, 7); ctx.stroke(); }
            cvText(ctx, 'Cascade', cx0 + (cx0 > Wd - 90 ? -6 : 6), PT + 6, { align: cx0 > Wd - 90 ? 'right' : 'left', color: inkColor(.75) });
          }
        } else {
          /* before the market opens: a sample run at 20%, drawn at a third of the ink, replaced by your own run on start */
          var glo = Math.min.apply(null, hdGhost), ghi = Math.max.apply(null, hdGhost), gsp = Math.max(1, ghi - glo);
          var gx = function (k) { return L + k / 219 * (R - L); }, gy = function (p) { return PT + 8 + (1 - (p - glo) / gsp) * (PB - PT - 8); };
          ctx.save(); ctx.strokeStyle = inkColor(.3); ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.beginPath();
          for (i = 0; i < hdGhost.length; i++) { if (i) ctx.lineTo(gx(i), gy(hdGhost[i])); else ctx.moveTo(gx(i), gy(hdGhost[i])); }
          ctx.stroke(); ctx.restore();
          cvText(ctx, 'A sample run at 20%', L, PT + 2, { color: inkColor(.6) });
        }
        /* the floor under the chart: the traders themselves */
        ctx.strokeStyle = inkColor(.16); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, 120.5); ctx.lineTo(Wd, 120.5); ctx.stroke();
        var agents = hdAgents.length ? hdShow : (hdPrev || (hdPrev = (function () { var a = []; for (var k = 0; k < HN; k++) a.push(Math.random() < 0.5 ? 1 : -1); return a; })()));
        /* square places on the same 24 by 10 floor the traders copy each other on, centred under the chart */
        var cy0 = 128, AH = 230 - cy0, pitch = Math.min(Wd / 24, AH / 10), ox = (Wd - 24 * pitch) / 2,
          side = Math.max(2, Math.round(pitch * .62));
        /* a trader changing sides shrinks through the middle and comes out the other colour */
        for (var pass = 0; pass < 2; pass++) {
          ctx.fillStyle = pass ? ACC() : inkColor(.42);
          for (var a2 = 0; a2 < HN; a2++) {
            var av = agents[a2];
            if ((av > 0) !== !!pass) continue;
            var cx2 = ox + (a2 % 24) * pitch + pitch / 2, cy2 = cy0 + Math.floor(a2 / 24) * pitch + pitch / 2, sd = Math.max(1, side * (.25 + .75 * Math.abs(av)));
            ctx.fillRect(cx2 - sd / 2, cy2 - sd / 2, sd, sd);
          }
        }
      }
      function hdStep() {
        var herd = +hdSlider.value / 100;
        var cols = 24;
        var next = hdAgents.slice();
        for (var i = 0; i < HN; i++) {
          if (Math.random() < 0.25) {
            var nb = 0, cnt = 0;
            [[i - 1, i % cols !== 0], [i + 1, i % cols !== cols - 1], [i - cols, i >= cols], [i + cols, i < HN - cols]].forEach(function (p) {
              if (p[1]) { nb += hdAgents[p[0]]; cnt++; }
            });
            if (Math.random() < herd && cnt > 0 && nb !== 0) next[i] = nb > 0 ? 1 : -1;
            else if (Math.random() < 0.5) next[i] = Math.random() < 0.5 ? 1 : -1;
          }
        }
        hdAgents = next;
        var net = hdAgents.reduce(function (a, b) { return a + b; }, 0) / HN;
        var last = hdPrice.length ? hdPrice[hdPrice.length - 1] : 100;
        hdPrice.push(Math.max(5, last * (1 + net * 0.02)));
        if (hdPrice.length > 220) { hdPrice.shift(); if (hdCas > 1) hdCas--; }
        if (!hdCas && Math.abs(net) >= .8) { hdCas = hdPrice.length; hdCasAt = performance.now(); }
        if (hdX._vis !== false) hdKick();
        var herdPct = +hdSlider.value;
        var line = herdPct < 40 ? 'Orange buys, dark sells. The crowd argues with itself and the price barely moves.'
          : herdPct < 70 ? 'Watch the patches form. Consensus is spreading, and the price is starting to trend on nothing.'
          : 'The dots move as one animal now. No news arrived; the only thing that changed was how much they watch each other. This is every bubble you have ever read about.';
        document.getElementById('hdLine').textContent = line;
      }
      /* the dots ease toward their side on the frame clock while the market is open */
      function hdKick() {
        if (LAB_RM) { for (var i = 0; i < HN; i++) hdShow[i] = hdAgents[i] || 0; hdPaint(); return; }
        if (hdRaf) return;
        hdRaf = requestAnimationFrame(function fr(ts) {
          hdRaf = 0;
          var dt = Math.min(64, ts - (hdLast || ts)), k = 1 - Math.exp(-dt / 70), moving = false;
          hdLast = ts;
          for (var i = 0; i < HN; i++) { var d = (hdAgents[i] || 0) - hdShow[i]; if (Math.abs(d) > .01) { hdShow[i] += d * k; moving = true; } else hdShow[i] = hdAgents[i] || 0; }
          hdPaint();
          if (moving || (hdCas && ts - hdCasAt < 1700)) hdRaf = requestAnimationFrame(fr); else hdLast = 0;
        });
      }
      document.getElementById('hdRun').addEventListener('click', function () {
        if (hdTimer) { clearInterval(hdTimer); hdTimer = null; this.textContent = 'Reopen the market'; return; }
        hdAgents = []; hdPrice = []; hdCas = 0;
        for (var i = 0; i < HN; i++) { hdAgents.push(Math.random() < 0.5 ? 1 : -1); hdShow[i] = hdAgents[i]; }
        hdTimer = setInterval(hdStep, 120);
        this.textContent = 'Pause';
      });
      labRepaint(hdPaint, hdC);
      setTimeout(hdPaint, 250);
    return {};
  });
})();
