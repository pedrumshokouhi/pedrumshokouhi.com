/* P.S. Lab, No. 17: The honest coin. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="lx-bench lx-flat lx-bleed" data-cv-local><canvas id="expCoin"></canvas></div>\n'
    + '      <div class="readout">\n'
    + '        <div class="hc-go"><button class="ebtn" id="flipBtn" type="button">Flip 100</button><div class="gc-coin hc-coin" aria-hidden="true"><div class="gc-spin" id="hcSpin"><i class="h">H</i><i class="t">T</i></div></div></div>\n'
    + '        <span><span class="k">Heads</span><span class="v" id="coinH">–</span></span>\n'
    + '        <span><span class="k">Longest streak</span><span class="v up" id="coinS">–</span></span>\n'
    + '      </div>\n'
    + '      <p class="eline" id="coinLine">Press the button. The coin has no memory, and you will still see patterns in its streaks.</p>';
  LAB_KIT.mount('honest-coin', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* 16: the honest coin: a hundred bars dealt left to right, the longest run bracketed and named */
    var coinC = document.getElementById('expCoin');
    var coinLines = [
      'A fair coin just ran that streak. Now reread any market commentary you like.',
      'If this were a stock chart, someone would call it momentum and charge you 2 and 20.',
      'The coin has no memory. The commentary industry depends on you forgetting that.',
      'Somewhere in this run, a narrative was born. It is already wrong.',
      'Flip enough times and every streak appears. Signal requires more than a streak.'
    ];
    var coinRuns = 0, coinData = null, coinAnim = 0, coinT = 0, hcAng = 0, hcFace = true, hcSpin = document.getElementById('hcSpin');
    function paintCoin(prog) {
      var f = fitCanvas(coinC, 190), ctx = f.ctx, W = f.W, H = 190;
      if (!(W > 0)) return;
      ctx.clearRect(0, 0, W, H);
      var mid = Math.round(H / 2), n = 100, L = 8, w = (W - 16) / n;
      ctx.strokeStyle = inkColor(.18); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(L, mid + .5); ctx.lineTo(W - 8, mid + .5); ctx.stroke();
      if (!coinData) {
        /* before the first flip: a hundred empty places, waiting */
        ctx.fillStyle = inkColor(.12);
        for (var g = 0; g < n; g++) ctx.fillRect(Math.round(L + g * w + w / 2), mid - 5, 1, 11);
        return;
      }
      var d = coinData, shown = prog == null ? n : Math.max(0, Math.min(n, Math.ceil(prog * n - 1e-9)));
      var k = Math.min(7, (mid - 32 - 16) / Math.max(1, d.best));
      for (var i = 0; i < shown; i++) {
        var hf = d.flips[i], inBest = shown === n && i >= d.bestStart && i < d.bestStart + d.best, bh = 16 + d.streaks[i] * k;
        ctx.fillStyle = inBest ? ACC() : (hf ? ACCA(.55) : inkColor(.35));
        ctx.fillRect(L + i * w + 1, hf ? mid - bh : mid + 1, Math.max(1.5, w - 2), bh);
      }
      /* every run of five or more, bracketed lightly as it completes */
      ctx.strokeStyle = inkColor(.32); ctx.lineWidth = 1; ctx.beginPath();
      d.runs.forEach(function (r) {
        if (r[0] + r[1] > shown || (shown === n && r[0] === d.bestStart)) return;
        var a = Math.round(L + r[0] * w + 1) + .5, b = Math.round(L + (r[0] + r[1]) * w - 1) - .5, rch = 16 + r[1] * k + 6, yb = d.flips[r[0]] ? Math.round(mid - rch) + .5 : Math.round(mid + rch) + .5, tk = d.flips[r[0]] ? 4 : -4;
        ctx.moveTo(a, yb + tk); ctx.lineTo(a, yb); ctx.lineTo(b, yb); ctx.lineTo(b, yb + tk);
      });
      ctx.stroke();
      if (shown < n) return;
      /* the longest run: an ink bracket over it, the length named */
      var x0 = Math.round(L + d.bestStart * w + 1) + .5, x1 = Math.round(L + (d.bestStart + d.best) * w - 1) - .5;
      var up = d.flips[d.bestStart], reach = 16 + d.best * k;
      var by = up ? Math.round(mid - reach - 9) + .5 : Math.round(mid + reach + 9) + .5, tick = up ? 6 : -6;
      ctx.strokeStyle = inkColor(.8); ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(x0, by + tick); ctx.lineTo(x0, by); ctx.lineTo(x1, by); ctx.lineTo(x1, by + tick); ctx.stroke();
      var cx = Math.max(60, Math.min(W - 60, (x0 + x1) / 2));
      cvText(ctx, 'Longest run \u00B7 ' + d.best, cx, up ? by - 6 : by + 14, { align: 'center', color: inkColor(.8) });
    }
    document.getElementById('flipBtn').addEventListener('click', function () {
      var flips = [], streaks = [], heads = 0, streak = 0, best = 0, prev = null, bestStart = 0;
      for (var i = 0; i < 100; i++) {
        var hFlip = Math.random() < 0.5;
        if (hFlip) heads++;
        streak = (prev === hFlip) ? streak + 1 : 1;
        if (streak > best) { best = streak; bestStart = i - streak + 1; }
        prev = hFlip;
        flips.push(hFlip); streaks.push(streak);
      }
      var runs = [];
      for (var q = 0; q < 100; q++) if (streaks[q] === 1) { var ln = 1; while (q + ln < 100 && flips[q + ln] === flips[q]) ln++; if (ln >= 5) runs.push([q, ln]); }
      coinData = { flips: flips, streaks: streaks, best: best, bestStart: bestStart, runs: runs };
      document.getElementById('coinH').textContent = heads + '/100';
      document.getElementById('coinS').textContent = best;
      document.getElementById('coinLine').textContent = coinLines[coinRuns % coinLines.length];
      coinRuns++;
      cancelAnimationFrame(coinAnim); clearTimeout(coinT);
      if (LAB_RM || !(coinC.clientWidth > 0)) { paintCoin(); return; }
      /* the coin turns for the first five, each bar dealt as it lands; then the other ninety-five run out fast */
      var c5 = 0;
      paintCoin(0);
      (function one() {
        if (c5 < 5) {
          hcAng += 720 + (hcFace !== flips[c5] ? 180 : 0); hcFace = flips[c5];
          if (hcSpin) hcSpin.style.transform = 'rotateY(' + hcAng + 'deg)';
          coinT = setTimeout(function () { c5++; paintCoin(c5 / 100); one(); }, 380);
          return;
        }
        var t0 = performance.now();
        coinAnim = requestAnimationFrame(function fr(ts) {
          var p = Math.min(1, (ts - t0) / 760);
          paintCoin(.05 + .95 * p);
          if (p < 1) coinAnim = requestAnimationFrame(fr);
        });
      })();
    });
    labRepaint(function () { paintCoin(); }, coinC);
    setTimeout(function () { paintCoin(); }, 250);
    return {};
  });
})();
