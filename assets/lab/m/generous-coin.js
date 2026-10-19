/* P.S. Lab, No. 23: The generous coin. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="gc-row lx-bench lx-spot lx-bleed">\n'
    + '        <div class="gc-coin" id="gcCoin" aria-hidden="true"><div class="gc-spin" id="gcSpin"><i class="h">$150</i><i class="t">$100</i></div></div>\n'
    + '        <div class="btnrow">\n'
    + '          <button class="ebtn" id="gcTake" type="button">Take the flip</button>\n'
    + '          <button class="ebtn2" id="gcPass" type="button">Refuse it</button>\n'
    + '          <button class="ebtn2" id="gcSim" type="button" style="display:none">Now watch 100 people take the coin thirty times each</button>\n'
    + '        </div>\n'
    + '      </div>\n'
    + '      <canvas id="gcC" style="display:none"></canvas>\n'
    + '      <div class="readout" id="gcStats" style="display:none">\n'
    + '        <span><span class="k">Ended ahead</span><span class="v up" id="gcUp">–</span></span>\n'
    + '        <span><span class="k">Average result</span><span class="v" id="gcAvg">–</span></span>\n'
    + '      </div>\n'
    + '      <p class="eline" id="gcLine">On average this coin pays you $25 a flip. Kahneman and Tversky found that losses weigh about twice as much as gains.</p>';
  LAB_KIT.mount('generous-coin', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- generous coin ---------- */

      var gcC = document.getElementById('gcC'), gcCoin = document.getElementById('gcCoin'), gcSpin = document.getElementById('gcSpin');
      var gcData = null;
      function gcSay(line) { document.getElementById('gcLine').textContent = line; }
      function gcReveal(took) {
        document.getElementById('gcTake').style.display = 'none';
        document.getElementById('gcPass').style.display = 'none';
        document.getElementById('gcSim').style.display = '';
        var line;
        if (took) {
          var heads = Math.random() < 0.5;
          line = heads ? 'Heads. You are $150 richer, and, more importantly, you took a bet that pays $25 a flip forever. '
                       : 'Tails. That stings, and the bet was still right: it pays $25 a flip on average. One outcome never grades a decision. ';
          line += 'Most people refuse this coin. A loss weighs about twice as much as a gain of the same size.';
          /* the coin is tossed, turns five times, and lands with a little weight on the face the flip already chose */
          gcSpin.style.transform = 'rotateY(' + (heads ? 1800 : 1980) + 'deg)';
          if (!LAB_RM) gcCoin.classList.add('toss');
          if (LAB_RM) gcSay(line); else setTimeout(function () { gcSay(line); }, 1100);
        } else {
          gcCoin.classList.add('refused');
          gcSay('So does almost everyone, and that is the famous finding: a loss feels about twice as heavy as the same-sized gain. You just refused free money because it might briefly hurt. The fix is below.');
        }
      }
      function gcFmt(v) { return (v >= 0 ? '+$' : '-$') + Math.abs(Math.round(v)).toLocaleString('en-US'); }
      var gcPaths = null, gcAnim = 0;
      /* the fan: a hundred people, thirty flips each, every path drawn from $0; q is how many flips have been drawn */
      function gcPaint(q) {
        if (!gcData || !gcPaths) return;
        q = q == null ? 30 : q;
        var f = fitCanvas(gcC, 210), ctx = f.ctx, Wd = f.W, H = 210;
        if (!(Wd > 0)) return;
        ctx.clearRect(0, 0, Wd, H);
        var mn = Math.min(0, gcData[0]), mx = Math.max(750, gcData[99]);
        var L = 16, R = Wd - 104, T = 18, B = H - 18, n = Math.floor(q), fr = q - n, i, k;
        function X(k) { return L + k / 30 * (R - L); }
        function Y(r) { return B - (r - mn) / (mx - mn) * (B - T); }
        var zeroY = Y(0);
        ctx.strokeStyle = inkColor(.35); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(L, cvSnap(zeroY)); ctx.lineTo(Wd - 12, cvSnap(zeroY)); ctx.stroke();
        cvText(ctx, '$0', Wd - 12, zeroY - 7, { align: 'right' });
        ctx.lineJoin = 'round'; ctx.lineWidth = 1;
        for (i = 0; i < 100; i++) {
          var p = gcPaths[i], up = p[30] > 0;
          ctx.strokeStyle = up ? ACCA(.3) : inkColor(.2); ctx.beginPath(); ctx.moveTo(X(0), Y(0));
          for (k = 1; k <= n; k++) ctx.lineTo(X(k), Y(p[k]));
          if (n < 30 && fr > 0) ctx.lineTo(X(n + fr), Y(p[n] + (p[n + 1] - p[n]) * fr));
          ctx.stroke();
        }
        /* what the coin pays on average: $25 a flip, dashed */
        ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = inkColor(.6); ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(Math.min(30, q)), Y(25 * Math.min(30, q))); ctx.stroke(); ctx.restore();
        if (q < 30) return;
        var NUM = '600 11px ' + CV_SANS;
        cvText(ctx, 'Average +$750', R + 6, Y(750) + 4, { font: NUM, color: inkColor(.75), raw: true });
        cvText(ctx, gcFmt(gcData[99]), R + 6, Math.max(12, Y(gcData[99]) + 4), { font: NUM, color: inkColor(.86) });
        cvText(ctx, gcFmt(gcData[0]), R + 6, Math.min(H - 4, Y(gcData[0]) + 4), { font: NUM, color: inkColor(.75) });
      }
      document.getElementById('gcTake').addEventListener('click', function () { gcReveal(true); });
      document.getElementById('gcPass').addEventListener('click', function () { gcReveal(false); });
      document.getElementById('gcSim').addEventListener('click', function () {
        gcC.style.display = 'block';
        document.getElementById('gcStats').style.display = '';
        var results = [], paths = [];
        for (var p = 0; p < 100; p++) {
          var total = 0, path = [0];
          for (var i = 0; i < 30; i++) { total += Math.random() < 0.5 ? 150 : -100; path.push(total); }
          results.push(total); paths.push(path);
        }
        results.sort(function (a, b) { return a - b; });
        gcPaths = paths;
        var up = results.filter(function (r) { return r > 0; }).length;
        var avg = results.reduce(function (a, b) { return a + b; }, 0) / 100;
        gcData = results;
        cancelAnimationFrame(gcAnim);
        if (LAB_RM) gcPaint();
        else { var g0 = 0; gcAnim = requestAnimationFrame(function fr(ts) { if (!g0) g0 = ts; var q = Math.min(30, (ts - g0) / 1300 * 30); gcPaint(q); if (q < 30) gcAnim = requestAnimationFrame(fr); }); }
        document.getElementById('gcUp').textContent = up + '/100';
        document.getElementById('gcAvg').textContent = (avg >= 0 ? '+$' : '-$') + Math.abs(Math.round(avg));
        gcSay(up + ' of 100 people ended ahead by taking the scary coin thirty times instead of once. One flip is a gamble. Thirty flips is a business. Aggregate your risks and the fear does the losing.');
      });
      labRepaint(function () { gcPaint(); }, gcC);
    return {};
  });
})();
