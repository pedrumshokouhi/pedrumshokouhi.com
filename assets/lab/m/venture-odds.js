/* P.S. Lab, No. 19: Venture odds. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="lx-walnut lx-bleed" data-ground="wall" data-tone="dark" style="--wall:#3F281A" data-cv-local><canvas id="expBets"></canvas></div>\n'
    + '      <input type="range" id="betSlider" min="1" max="20" value="1" aria-label="Number of bets">\n'
    + '      <div class="readout">\n'
    + '        <span><span class="k">Bets</span><span class="v" id="betN">1</span></span>\n'
    + '        <span><span class="k">Median fund</span><span class="v up" id="betMed">–</span></span>\n'
    + '        <span><span class="k">Wipeouts</span><span class="v dn" id="betZero">–</span></span>\n'
    + '      </div>\n'
    + '      <div class="btnrow"><button class="ebtn" id="betRun" type="button">Run 1,000 futures</button></div>\n'
    + '      <p class="eline" id="betLine">One bet is a lottery ticket. Twenty bets carry the same odds with a far narrower spread of outcomes.</p>';
  LAB_KIT.mount('venture-odds', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- 18: venture odds ---------- */

      var betsC = document.getElementById('expBets');
      var betSlider = document.getElementById('betSlider');
      function ventureDraw() {
        var draws = Math.random();
        if (draws < 0.60) return 0;
        if (draws < 0.85) return 0.5;
        if (draws < 0.96) return 2;
        if (draws < 0.995) return 10;
        return 50;
      }
      var betRunB = document.getElementById('betRun');
      var betData = null, betAnim = 0, BETH = 250, BET_FALL = 560, BET_REL = 900;
      var BET_LABELS = ['wiped out', '< 1×', '1–2×', '2–5×', '5–10×', '10×+'];
      function betBin(m) { return m < 0.1 ? 0 : m < 1 ? 1 : m < 2 ? 2 : m < 5 ? 3 : m < 10 ? 4 : 5; }
      /* tau: milliseconds into the fall (null: the board at rest, every future landed) */
      function paintBets(tau) {
        var f = fitCanvas(betsC, BETH), ctx = f.ctx, Wd = f.W, H = BETH;
        if (!(Wd > 0)) return;
        ctx.clearRect(0, 0, Wd, H);
        var L = 16, R = Wd - 16, base = H - 30, top = 112, bw = (R - L) / 6, gap = Math.min(24, bw * .24), cx = (L + R) / 2, i, r, c;
        /* the pegs */
        var sp = Math.min(26, (R - L) / 14);
        /* the pins: brass heads, lit from the upper left */
        for (r = 0; r < 6; r++) for (c = 0; c <= r + 2; c++) {
          var px = Math.round(cx + (c - (r + 2) / 2) * sp), py = 17 + r * 14, pg = ctx.createRadialGradient(px - .8, py - .9, .2, px, py, 2.6);
          pg.addColorStop(0, '#FFF0C2'); pg.addColorStop(.5, '#C9A24E'); pg.addColorStop(1, '#6E5320');
          ctx.beginPath(); ctx.arc(px, py, 2.4, 0, 7); ctx.fillStyle = pg; ctx.fill();
        }
        var land = [0, 0, 0, 0, 0, 0];
        if (betData) {
          if (tau == null) land = betData.buckets;
          else {
            for (i = 0; i < betData.parts.length; i++) {
              var pt = betData.parts[i], u = (tau - pt.t) / BET_FALL;
              if (u < 0) continue;
              if (u >= 1) { land[pt.b]++; continue; }
              /* through the pegs it rattles side to side; below them it drifts out to its bin */
              var bx = L + pt.b * bw + bw / 2 + pt.o * (bw - gap) * .4, sp2 = Math.pow(u, 1.7);
              var x = cx + (bx - cx) * sp2 + Math.sin(u * 40 + pt.o * 9) * 5 * Math.max(0, 1 - u * 1.6), y = 8 + (base - 12) * Math.pow(u, 1.25);
              ctx.fillStyle = pt.b === 0 ? inkColor(.5) : pt.b < 3 ? ACCA(.6) : ACC();
              ctx.fillRect(x - 1, y - 1, 2.2, 2.2);
            }
          }
        }
        for (i = 0; i < 6; i++) {
          var x0 = Math.round(L + i * bw + gap / 2), w = Math.round(bw - gap), mx = L + i * bw + bw / 2;
          if (!betData) {
            ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = inkColor(.2); ctx.lineWidth = 1;
            ctx.strokeRect(x0 + .5, top + 40.5, w - 1, base - top - 41); ctx.restore();
          } else {
            var cnt = land[i], bh = cnt / betData.max * (base - top);
            if (bh > .5) {
              var y0 = base - bh, rr = Math.min(2, bh);
              ctx.beginPath(); ctx.moveTo(x0, base); ctx.lineTo(x0, y0 + rr); ctx.quadraticCurveTo(x0, y0, x0 + rr, y0);
              ctx.lineTo(x0 + w - rr, y0); ctx.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + rr); ctx.lineTo(x0 + w, base); ctx.closePath();
              ctx.fillStyle = i === 0 ? inkColor(.45) : (i < 3 ? ACCA(.45) : ACC());
              ctx.fill();
              if (i === 0) {
                ctx.save(); ctx.clip(); ctx.strokeStyle = labColor('--card'); ctx.globalAlpha = .4; ctx.lineWidth = 1; ctx.beginPath();
                for (var hx = x0 - bh; hx < x0 + w; hx += 6) { ctx.moveTo(hx, base); ctx.lineTo(hx + bh, y0); }
                ctx.stroke(); ctx.restore();
              }
            }
            if (tau == null || (cnt && cnt === betData.buckets[i])) cvText(ctx, String(cnt), mx, base - bh - 7, { align: 'center', font: '600 11px ' + CV_SANS, color: inkColor(.8) });
          }
          cvText(ctx, BET_LABELS[i], mx, H - 11, { align: 'center', halo: false });
        }
        ctx.strokeStyle = inkColor(.3); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(L, cvSnap(base)); ctx.lineTo(R, cvSnap(base)); ctx.stroke();
      }
      function runBets() {
        var N = +betSlider.value;
        document.getElementById('betN').textContent = N;
        var results = [], zeros = 0;
        for (var run = 0; run < 1000; run++) {
          var sum = 0;
          for (var b = 0; b < N; b++) sum += ventureDraw();
          var mult = sum / N;
          results.push(mult);
          if (mult < 0.1) zeros++;
        }
        results.sort(function (a, b2) { return a - b2; });
        var med = results[500];
        document.getElementById('betMed').textContent = '\u00D7' + med.toFixed(1);
        document.getElementById('betZero').textContent = (zeros / 10).toFixed(1) + '%';
        var buckets = [0, 0, 0, 0, 0, 0], parts = [];
        results.forEach(function (m) { var b = betBin(m); buckets[b]++; parts.push({ b: b, o: Math.random() * 2 - 1, t: 0 }); });
        /* the order they fall in is shuffled for the eye; which bin each lands in was settled above */
        for (var pi = parts.length - 1; pi > 0; pi--) { var pj = Math.floor(Math.random() * (pi + 1)), tmp = parts[pi]; parts[pi] = parts[pj]; parts[pj] = tmp; }
        parts.forEach(function (p, k) { p.t = k / parts.length * BET_REL; });
        betData = { buckets: buckets, max: Math.max.apply(null, buckets), parts: parts };
        betsC.classList.remove('stale'); betRunB.classList.remove('ready');
        var lines = [
          'Concentration is a story about the winner you would have picked. The histogram disagrees.',
          'The median fund and the best fund are different funds. Decide which one you are promising.',
          'More bets: fewer heartbreaks, fewer miracles. That trade has a name: a portfolio.',
          'Every wiped-out bar was somebody\u2019s certain thing.'
        ];
        document.getElementById('betLine').innerHTML = lines[Math.floor(Math.random() * lines.length)];
        cancelAnimationFrame(betAnim);
        if (LAB_RM || !(betsC.clientWidth > 0)) { paintBets(); return; }
        var t0 = 0;
        betAnim = requestAnimationFrame(function fr(ts) {
          if (!t0) t0 = ts;
          var tau = ts - t0;
          if (tau >= BET_REL + BET_FALL) { paintBets(); return; }
          paintBets(tau);
          betAnim = requestAnimationFrame(fr);
        });
      }
      betRunB.addEventListener('click', runBets);
      betSlider.addEventListener('input', function () {
        document.getElementById('betN').textContent = betSlider.value;
        if (betData) betsC.classList.add('stale');
        betRunB.classList.add('ready');
      });
      labRepaint(function () { paintBets(); }, betsC);
      setTimeout(function () { paintBets(); }, 250);
    return {};
  });
})();
