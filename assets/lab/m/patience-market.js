/* P.S. Lab, No. 18: The patience market. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="lx-board lx-term lx-bleed" data-ground="slate" data-cv-local><canvas id="expMkt"></canvas></div>\n'
    + '      <div class="btnrow">\n'
    + '        <button class="ebtn" id="mktStart" type="button">Buy in</button>\n'
    + '        <button class="ebtn2" id="mktSell" type="button" disabled>Sell everything</button>\n'
    + '        <span style="flex:1"></span>\n'
    + '        <span class="readout readout--inline"><span class="k">Return</span><span class="v up" id="mktRet">–</span></span>\n'
    + '      </div>\n'
    + '      <p class="eline" id="mktLine">This machine measures temperament in seconds.</p>';
  LAB_KIT.mount('patience-market', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- 17: the patience market ---------- */

      var mktC = document.getElementById('expMkt');
      var mktStart = document.getElementById('mktStart');
      var mktSell = document.getElementById('mktSell');
      var mktRet = document.getElementById('mktRet');
      var mktLine = document.getElementById('mktLine');
      var mkt = null, mktTimer = null;
      function randn() {
        var u = 1 - Math.random(), v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      }
      var mktX = mktC.closest('.exp');
      function mktDraw() {
        var f = fitCanvas(mktC, 190), ctx = f.ctx, Wd = f.W, H = 190;
        if (!(Wd > 0)) return;
        ctx.clearRect(0, 0, Wd, H);
        var L = 12, R = Wd - 12, T = 22, B = H - 14, i;
        if (!mkt) {
          /* before you buy: the price you would pay, and nothing else */
          var ym = cvSnap(H / 2);
          ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = inkColor(.24); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(L, ym); ctx.lineTo(R, ym); ctx.stroke(); ctx.restore();
          cvText(ctx, '1.00', L, ym - 7);
          return;
        }
        var p = mkt.prices, n = p.length;
        var lo = Math.min.apply(null, p), hi = Math.max.apply(null, p);
        if (hi - lo < 1e-9) hi = lo + 1;
        function xx(k) { return L + k / (n - 1 || 1) * (R - L); }
        function yy(v) { return B - (v - lo) / (hi - lo) * (B - T); }
        var y1 = yy(1);
        if (y1 >= T - 1 && y1 <= B + 1) {
          ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = inkColor(.2); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(L, cvSnap(y1)); ctx.lineTo(R, cvSnap(y1)); ctx.stroke(); ctx.restore();
          cvText(ctx, '1.00', L, y1 - 7);
        }
        var split = mkt.soldAt === null ? n : mkt.soldAt;
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.lineWidth = 2; ctx.strokeStyle = ACC(); ctx.beginPath();
        for (i = 0; i < split; i++) { if (i) ctx.lineTo(xx(i), yy(p[i])); else ctx.moveTo(xx(i), yy(p[i])); }
        ctx.stroke();
        if (mkt.soldAt !== null) {
          var sx = xx(split - 1), sy = yy(p[split - 1]), ex = xx(n - 1);
          if (n > split) {
            /* the market you left, as a ghost; above your exit the gap is what leaving cost (foil), below it what leaving saved */
            var gp = new Path2D(); gp.moveTo(sx, sy);
            for (i = split; i < n; i++) gp.lineTo(xx(i), yy(p[i]));
            gp.lineTo(ex, sy); gp.closePath();
            ctx.save(); ctx.beginPath(); ctx.rect(0, 0, Wd, sy); ctx.clip(); ctx.fillStyle = ACCA(.2); ctx.fill(gp); ctx.restore();
            ctx.save(); ctx.beginPath(); ctx.rect(0, sy, Wd, H - sy); ctx.clip(); ctx.fillStyle = inkColor(.07); ctx.fill(gp); ctx.restore();
            ctx.save(); ctx.setLineDash([2, 3]); ctx.strokeStyle = inkColor(.5); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(sx, sy);
            for (i = split; i < n; i++) ctx.lineTo(xx(i), yy(p[i]));
            ctx.stroke(); ctx.restore();
          }
          ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = inkColor(.5); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(sx, cvSnap(sy)); ctx.lineTo(Math.max(sx, ex), cvSnap(sy)); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cvSnap(sx), T - 8); ctx.lineTo(cvSnap(sx), B); ctx.stroke(); ctx.restore();
          ctx.fillStyle = inkColor(.9); ctx.beginPath(); ctx.arc(sx, sy, 3.5, 0, 7); ctx.fill();
          var right = sx < R - 60;
          cvText(ctx, 'Sold', right ? sx + 7 : sx - 7, T - 6, { align: right ? 'left' : 'right', color: inkColor(.85) });
        } else {
          /* the head of the market, breathing while you hold */
          var hx = xx(n - 1), hy = yy(p[n - 1]);
          ctx.fillStyle = ACCA(.18); ctx.beginPath(); ctx.arc(hx, hy, 8, 0, 7); ctx.fill();
          ctx.fillStyle = ACC(); ctx.beginPath(); ctx.arc(hx, hy, 3.5, 0, 7); ctx.fill();
        }
      }
      function mktTick() {
        var p = mkt.prices;
        var last = p[p.length - 1];
        var shock = Math.random() < 0.012 ? 0.9 : 1;
        p.push(last * shock * Math.exp(0.0011 + 0.013 * randn()));
        if (p.length > 900) p.shift();
        if (mktX._vis !== false) mktDraw();
        var cur = p[p.length - 1];
        if (mkt.soldAt === null) {
          var r = (cur - 1) * 100;
          mktRet.textContent = (r >= 0 ? '+' : '') + r.toFixed(1) + '%';
          mktRet.className = 'v ' + (r >= 0 ? 'up' : 'dn');
        } else {
          var missed = (cur / mkt.sellPrice - 1) * 100;
          mktLine.textContent = 'You held ' + mkt.heldSec.toFixed(0) + ' seconds and sold at ' +
            (mkt.sellRet >= 0 ? '+' : '') + mkt.sellRet.toFixed(1) + '%. Since you left: ' +
            (missed >= 0 ? '+' : '') + missed.toFixed(1) + '%. The market did not notice.';
        }
        if (mkt.soldAt === null) mkt.heldSec += 0.12;
      }
      mktStart.addEventListener('click', function () {
        clearInterval(mktTimer);
        mkt = { prices: [1], soldAt: null, sellPrice: null, sellRet: 0, heldSec: 0 };
        mktTimer = setInterval(mktTick, 120);
        mktStart.textContent = 'Buy back in';
        mktSell.disabled = false;
        mktLine.textContent = 'You are in. The only control you have left is when you leave.';
      });
      mktSell.addEventListener('click', function () {
        if (!mkt || mkt.soldAt !== null) return;
        mkt.soldAt = mkt.prices.length;
        mkt.sellPrice = mkt.prices[mkt.prices.length - 1];
        mkt.sellRet = (mkt.sellPrice - 1) * 100;
        mktSell.disabled = true;
        mktDraw();
      });
      labRepaint(mktDraw, mktC);
      setTimeout(mktDraw, 250);
    return {};
  });
})();
