/* P.S. Lab, No. 24: The short squeeze. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="sq-stage lx-bench lx-flat lx-bleed" data-cv-local><canvas id="sqC" style="height:200px"></canvas><div class="sq-call" id="sqCall" hidden><span class="k">Margin call</span><b id="sqCallT">Bought in at $200</b></div></div>\n'
    + '      <div class="sq-eq" aria-hidden="true"><span class="k">Equity</span><span class="sq-tr"><i id="sqBar"></i><b></b></span></div>\n'
    + '      <div class="btnrow">\n'
    + '        <button class="ebtn" id="sqStart" type="button">Open the short</button>\n'
    + '        <button class="ebtn2" id="sqCover" type="button" disabled>Cover everything</button>\n'
    + '        <span style="flex:1"></span>\n'
    + '        <span class="readout readout--inline"><span class="k">Price</span><span class="v" id="sqP">$100</span></span>\n'
    + '        <span class="readout readout--inline"><span class="k">Equity</span><span class="v gain" id="sqE">$10,000</span></span>\n'
    + '      </div>\n'
    + '      <p class="eline" id="sqLine">A long position can lose what you paid. A short can lose more than you have.</p>';
  LAB_KIT.mount('short-squeeze', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- the short squeeze ---------- */

      var sqC = document.getElementById('sqC'), sqX = sqC.closest('.exp');
      var sqTimer = null, sqP = [], sqMomentum = 0, sqDone = false, sqCalled = false;
      function sqEquity(p) { return 10000 + (100 - p) * 100; }
      var sqBar = document.getElementById('sqBar'), sqCall = document.getElementById('sqCall');
      function sqEq(eq) { sqBar.style.setProperty('--e', Math.max(0, Math.min(1, eq / 20000)).toFixed(4)); sqBar.parentNode.classList.toggle('low', eq < 3000); }
      /* the resting chart: one short from a fixed seed, run on the same rules, drawn at a third of the ink until yours starts */
      var sqGhost = (function () {
        var sd = 1987, rnd = function () { sd = (sd + 0x6D2B79F5) | 0; var t = Math.imul(sd ^ (sd >>> 15), 1 | sd); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
        var pr = [100], mo = 0, k;
        for (k = 0; k < 150; k++) {
          if (k === 96) mo = 11; else if (rnd() < .006) mo = 6 + Math.floor(rnd() * 8);
          var dr = -.0012, vo = .014;
          if (mo > 0) { dr = .028; vo = .03; mo--; }
          pr.push(Math.max(4, pr[pr.length - 1] * Math.exp(dr + vo * (rnd() * 2 - 1))));
        }
        return pr;
      })();
      function sqDraw() {
        var f = fitCanvas(sqC, 200), ctx = f.ctx, Wd = f.W, H = 200;
        if (!(Wd > 0)) return;
        ctx.clearRect(0, 0, Wd, H);
        var L = 12, R = Wd - 12, T = 16, B = H - 12;
        var pts = sqP.length ? sqP : [100], ghost = !sqP.length;
        var lo = Math.min.apply(null, pts), hi = Math.max.apply(null, pts);
        if (ghost) { lo = Math.min(80, Math.min.apply(null, sqGhost) - 4); hi = Math.max(120, Math.max.apply(null, sqGhost) + 6); }
        /* as the price climbs toward the broker, the scale opens to show the wall */
        if (hi >= 150) hi = Math.max(hi, 208);
        if (hi - lo < 1) hi = lo + 1;
        function yy(v) { return B - (v - lo) / (hi - lo) * (B - T); }
        function xx(i) { return L + i / Math.max(1, pts.length - 1) * (R - L); }
        var y100 = yy(100), i;
        if (sqP.length > 1) {
          /* above your entry the short is losing, below it it is winning */
          var area = new Path2D(); area.moveTo(xx(0), y100);
          for (i = 0; i < pts.length; i++) area.lineTo(xx(i), yy(pts[i]));
          area.lineTo(xx(pts.length - 1), y100); area.closePath();
          ctx.save(); ctx.beginPath(); ctx.rect(0, 0, Wd, y100); ctx.clip(); ctx.fillStyle = labColorA('--loss', .1); ctx.fill(area); ctx.restore();
          ctx.save(); ctx.beginPath(); ctx.rect(0, y100, Wd, H - y100); ctx.clip(); ctx.fillStyle = labColorA('--gain', .1); ctx.fill(area); ctx.restore();
        }
        ctx.strokeStyle = inkColor(.32); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(L, cvSnap(y100)); ctx.lineTo(R, cvSnap(y100)); ctx.stroke();
        cvText(ctx, 'Entry $100', L, y100 - 7);
        /* the broker's wall: at $200 the account is worth nothing */
        var yW = yy(200);
        if (yW >= T - 2) {
          ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = ACC(); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(L, cvSnap(yW)); ctx.lineTo(R, cvSnap(yW)); ctx.stroke(); ctx.restore();
          cvText(ctx, 'Margin call $200', sqCalled ? R - 18 : R, yW - 7, { align: 'right', color: inkColor(.8) });
        } else {
          ctx.fillStyle = ACC(); ctx.beginPath();
          ctx.moveTo(R - 4, T - 10); ctx.lineTo(R, T - 4); ctx.lineTo(R - 8, T - 4); ctx.closePath(); ctx.fill();
          cvText(ctx, 'Margin call $200', R - 14, T - 4, { align: 'right', color: inkColor(.8) });
        }
        if (ghost) {
          var gx = function (k) { return L + k / (sqGhost.length - 1) * (R - L); };
          ctx.save(); ctx.strokeStyle = inkColor(.3); ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.beginPath();
          for (i = 0; i < sqGhost.length; i++) { if (i) ctx.lineTo(gx(i), yy(sqGhost[i])); else ctx.moveTo(gx(i), yy(sqGhost[i])); }
          ctx.stroke(); ctx.restore();
          cvText(ctx, 'A sample short', R, B - 4, { align: 'right', color: inkColor(.6) });
        }
        if (sqP.length < 2) return;
        ctx.strokeStyle = ACC(); ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.beginPath();
        for (i = 0; i < pts.length; i++) { if (i) ctx.lineTo(xx(i), yy(pts[i])); else ctx.moveTo(xx(i), yy(pts[i])); }
        ctx.stroke();
        var hx = xx(pts.length - 1), hy = yy(pts[pts.length - 1]);
        if (sqCalled) {
          /* the forced buy-in, marked where it happened */
          ctx.strokeStyle = labColor('--loss'); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
          ctx.moveTo(hx - 5, hy - 5); ctx.lineTo(hx + 5, hy + 5); ctx.moveTo(hx + 5, hy - 5); ctx.lineTo(hx - 5, hy + 5); ctx.stroke();
        } else {
          if (!sqDone) { ctx.fillStyle = ACCA(.18); ctx.beginPath(); ctx.arc(hx, hy, 7, 0, 7); ctx.fill(); }
          ctx.fillStyle = sqDone ? inkColor(.85) : ACC(); ctx.beginPath(); ctx.arc(hx, hy, 3.2, 0, 7); ctx.fill();
        }
      }
      function sqEnd(msg) {
        clearInterval(sqTimer); sqTimer = null; sqDone = true;
        sqDraw();
        document.getElementById('sqCover').disabled = true;
        document.getElementById('sqStart').textContent = 'Short it again';
        document.getElementById('sqLine').textContent = msg;
      }
      function sqTick() {
        var last = sqP[sqP.length - 1];
        if (Math.random() < 0.012) sqMomentum = 6 + Math.floor(Math.random() * 8);
        var drift = -0.0012, vol = 0.014;
        if (sqMomentum > 0) { drift = 0.028; vol = 0.03; sqMomentum--; }
        var p = Math.max(4, last * Math.exp(drift + vol * (Math.random() * 2 - 1)));
        sqP.push(p);
        if (sqP.length > 400) sqP.shift();
        if (sqX._vis !== false) sqDraw();
        var eq = sqEquity(p);
        document.getElementById('sqP').textContent = '$' + p.toFixed(0);
        sqEq(eq);
        var eqEl = document.getElementById('sqE');
        eqEl.textContent = (eq < 0 ? '-$' : '$') + Math.abs(Math.round(eq)).toLocaleString();
        eqEl.className = 'v ' + (eq >= 10000 ? 'gain' : 'loss');
        if (sqMomentum > 3) document.getElementById('sqLine').textContent = 'It is running. Message boards found your stock. Cover, or hold your breath?';
        else if (eq < 3000 && eq > 0) document.getElementById('sqLine').textContent = 'Margin desk on line one. They sound calm. They are not calm.';
        if (eq <= 0) {
          sqCalled = true; sqX.classList.add('called');
          document.getElementById('sqCallT').textContent = 'Bought in at $' + p.toFixed(0);
          sqCall.hidden = false; sqCall.classList.remove('go'); void sqCall.offsetWidth; sqCall.classList.add('go');
        }
        if (eq <= 0) sqEnd('Bought in by force at $' + p.toFixed(0) + '. The account is gone and the stock does not know you existed. The market stayed irrational longer than you stayed solvent, exactly as the old warning promised.');
      }
      document.getElementById('sqStart').addEventListener('click', function () {
        clearInterval(sqTimer); sqDone = false; sqCalled = false;
        sqX.classList.remove('called'); sqCall.hidden = true; sqEq(10000);
        sqP = [100]; sqMomentum = 0;
        document.getElementById('sqCover').disabled = false;
        document.getElementById('sqLine').textContent = 'Short open at $100. Every dollar it falls is yours. Every dollar it rises is also yours.';
        sqTimer = setInterval(sqTick, 130);
      });
      document.getElementById('sqCover').addEventListener('click', function () {
        if (sqDone || !sqP.length) return;
        var p = sqP[sqP.length - 1];
        var pl = Math.round((100 - p) * 100);
        sqEnd(pl >= 0
          ? 'Covered at $' + p.toFixed(0) + ' for a $' + pl.toLocaleString() + ' profit. Note the ceiling: a perfect short makes 100%. The downside had no floor, and you were standing on it the whole time.'
          : 'Covered at $' + p.toFixed(0) + ', down $' + Math.abs(pl).toLocaleString() + '. Expensive, and cheaper than the alternative: shorts that refuse to be wrong become shorts that are removed.');
      });
      labRepaint(sqDraw, sqC);
      setTimeout(sqDraw, 250);
    return {};
  });
})();
