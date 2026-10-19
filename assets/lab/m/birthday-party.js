/* P.S. Lab, No. 31: The birthday party. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="lx-bench lx-flat lx-bleed" data-cv-local><canvas id="bdC" style="height:170px" aria-hidden="true"></canvas></div>\n'
    + '      <input type="range" id="bdN" min="2" max="70" value="23" aria-label="People at the party">\n'
    + '      <div class="readout">\n'
    + '        <span><span class="k">Guests</span><span class="v" id="bdG">23</span></span>\n'
    + '        <span><span class="k">Chance of a shared birthday</span><span class="v up" id="bdP">50.7%</span></span>\n'
    + '      </div>\n'
    + '      <div class="btnrow"><button class="ebtn" id="bdRun" type="button">Throw the party</button></div>\n'
    + '      <div class="lx-bench lx-flat lx-year lx-bleed" data-cv-local><canvas id="bdRing" class="bd-ring" aria-hidden="true"></canvas></div>\n'
    + '      <p class="eline" id="bdLine">Twenty-three guests give better than even odds: 50.7%. Trust the arithmetic over the instinct.</p>';
  LAB_KIT.mount('birthday-party', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- birthday party: the curve under the slider, and a year with the guests written in ---------- */

      var bdNames = ['Maya', 'Noah', 'Leila', 'Omid', 'Sara', 'Dara', 'Kian', 'Ava', 'Rex', 'Nina',
        'Theo', 'Yasmin', 'Milo', 'Roya', 'Sam', 'Layla', 'Arman', 'Ella', 'Nima', 'June'];
      var bdMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      var bdSlider = document.getElementById('bdN');
      var bdC = document.getElementById('bdC');
      var bdRing = document.getElementById('bdRing'), bdR = null, bdQ = 0, bdAnim = 0;
      var BD_M0 = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
      function bdProb(n) { var p = 1; for (var i = 0; i < n; i++) p *= (365 - i) / 365; return 1 - p; }
      function bdCalc() {
        var n = +bdSlider.value, p = bdProb(n) * 100;
        document.getElementById('bdG').textContent = n;
        document.getElementById('bdP').textContent = p.toFixed(1) + '%';
      }
      /* the curve spans the slider's own travel, so the foil dot sits right above the thumb */
      function bdDraw() {
        if (!bdC) return;
        var f = fitCanvas(bdC, 170), ctx = f.ctx, W = f.W, H = 170;
        if (!(W > 0)) return;
        ctx.clearRect(0, 0, W, H);
        var n = +bdSlider.value, L = 9, R = W - 9, T = 16, B = H - 16, k;
        function X(m) { return L + (m - 2) / 68 * (R - L); }
        function Y(p) { return B - p * (B - T); }
        ctx.lineWidth = 1; ctx.strokeStyle = inkColor(.2);
        ctx.beginPath(); ctx.moveTo(L, cvSnap(B)); ctx.lineTo(R, cvSnap(B)); ctx.stroke();
        ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = inkColor(.3);
        ctx.beginPath(); ctx.moveTo(L, cvSnap(Y(.5))); ctx.lineTo(R, cvSnap(Y(.5))); ctx.stroke(); ctx.restore();
        cvText(ctx, '50%', L + 2, Y(.5) - 5, { color: inkColor(.6) });
        ctx.beginPath(); ctx.moveTo(X(2), B);
        for (k = 2; k <= n; k++) ctx.lineTo(X(k), Y(bdProb(k)));
        ctx.lineTo(X(n), B); ctx.closePath(); ctx.fillStyle = ACCA(.1); ctx.fill();
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.strokeStyle = inkColor(.42); ctx.lineWidth = 1.5; ctx.beginPath();
        for (k = 2; k <= 70; k++) { if (k === 2) ctx.moveTo(X(k), Y(bdProb(k))); else ctx.lineTo(X(k), Y(bdProb(k))); }
        ctx.stroke();
        ctx.strokeStyle = ACC(); ctx.lineWidth = 2.2; ctx.beginPath();
        for (k = 2; k <= n; k++) { if (k === 2) ctx.moveTo(X(k), Y(bdProb(k))); else ctx.lineTo(X(k), Y(bdProb(k))); }
        ctx.stroke();
        var px = X(n), py = Y(bdProb(n));
        ctx.save(); ctx.setLineDash([2, 3]); ctx.strokeStyle = labColorA('--accent', .55); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cvSnap(px), py + 6); ctx.lineTo(cvSnap(px), B); ctx.stroke(); ctx.restore();
        ctx.beginPath(); ctx.arc(px, py, 6.5, 0, 7); ctx.fillStyle = labColor('--card'); ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, 4.5, 0, 7); ctx.fillStyle = ACC(); ctx.fill();
      }
      bdSlider.addEventListener('input', function () { bdCalc(); bdDraw(); if (bdR) { cancelAnimationFrame(bdAnim); bdR = null; } bdRingDraw(0); });
      bdCalc();
      labRepaint(bdDraw, bdC);
      /* the year as a ring. Each guest lands on their birthday and is joined to the guest before, so the party threads a string
         round the year; the guest who completes a match draws the last chord in foil, and the shared day flares once */
      function bdRingDraw(q, fl) {
        if (!bdRing) return;
        var H = innerWidth <= 600 ? 270 : 300, f = fitCanvas(bdRing, H), ctx = f.ctx, W = f.W, TAU = Math.PI * 2;
        if (!(W > 0)) return;
        ctx.clearRect(0, 0, W, H);
        var cx = W / 2, cy = H / 2, R = Math.min(W / 2 - 34, H / 2 - 30), k, m, a;
        function P(d, r) { var t = -Math.PI / 2 + (d + .5) / 365 * TAU; return [cx + Math.cos(t) * r, cy + Math.sin(t) * r]; }
        ctx.lineWidth = 1; ctx.strokeStyle = inkColor(.24);
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
        for (m = 0; m < 12; m++) {
          a = -Math.PI / 2 + BD_M0[m] / 365 * TAU;
          ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (R - 5), cy + Math.sin(a) * (R - 5)); ctx.lineTo(cx + Math.cos(a) * (R + 5), cy + Math.sin(a) * (R + 5)); ctx.stroke();
          a = -Math.PI / 2 + (BD_M0[m] + 15) / 365 * TAU;
          cvText(ctx, bdMonths[m].slice(0, 3), cx + Math.cos(a) * (R + 17), cy + Math.sin(a) * (R + 17) + 3.5, { align: 'center', color: inkColor(.66), halo: false });
        }
        var NUM = '600 11px ' + CV_SANS, n = +bdSlider.value;
        function mid(t, px, y) {
          ctx.font = '400 ' + px + 'px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
          ctx.lineWidth = 8; ctx.strokeStyle = labColor('--card'); ctx.strokeText(t, cx, y); ctx.fillStyle = inkColor(.9); ctx.fillText(t, cx, y);
        }
        if (!bdR) {
          mid((n * (n - 1) / 2).toLocaleString('en-US'), 30, cy + 4);
          cvText(ctx, n + ' guests make this many pairs', cx, cy + 24, { align: 'center', color: inkColor(.66), halo: false });
          return;
        }
        var g = bdR.days, last = Math.min(g.length - 1, Math.floor(q)), fr = q - Math.floor(q), hk = bdR.hitK;
        ctx.lineJoin = 'round'; ctx.strokeStyle = inkColor(.3); ctx.lineWidth = 1; ctx.beginPath();
        for (k = 1; k <= last; k++) { if (k === hk) continue; var p0 = P(g[k - 1], R - 3), p1 = P(g[k], R - 3); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); }
        ctx.stroke();
        var drawing = last + 1 < g.length && fr > 0 ? last + 1 : -1;
        if (drawing > 0) {
          var a0 = P(g[drawing - 1], R - 3), a1 = P(g[drawing], R - 3);
          ctx.strokeStyle = drawing === hk ? ACC() : inkColor(.3); ctx.lineWidth = drawing === hk ? 2 : 1;
          ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a0[0] + (a1[0] - a0[0]) * fr, a0[1] + (a1[1] - a0[1]) * fr); ctx.stroke();
        }
        if (hk != null && last >= hk) {
          var h0 = P(g[hk - 1], R - 3), h1 = P(g[hk], R - 3);
          ctx.strokeStyle = ACC(); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(h0[0], h0[1]); ctx.lineTo(h1[0], h1[1]); ctx.stroke();
        }
        ctx.fillStyle = inkColor(.78);
        for (k = 0; k <= last; k++) { var d = P(g[k], R); ctx.beginPath(); ctx.arc(d[0], d[1], 2.6, 0, TAU); ctx.fill(); }
        if (hk != null && last >= hk) {
          var hp = P(g[hk], R), e = fl == null ? 1 : fl;
          if (e < 1) { ctx.strokeStyle = ACCA((1 - e) * .9); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(hp[0], hp[1], 6 + 16 * e, 0, TAU); ctx.stroke(); }
          ctx.beginPath(); ctx.arc(hp[0], hp[1], 6.5, 0, TAU); ctx.fillStyle = labColor('--card'); ctx.fill();
          ctx.beginPath(); ctx.arc(hp[0], hp[1], 4.5, 0, TAU); ctx.fillStyle = ACC(); ctx.fill();
          mid(bdR.who, 19, cy + 2);
          cvText(ctx, bdR.when, cx, cy + 22, { align: 'center', font: NUM, color: inkColor(.86), ls: '1px' });
        } else if (last >= g.length - 1) {
          mid('No twins', 19, cy + 2);
          cvText(ctx, g.length + ' guests, ' + g.length + ' different days', cx, cy + 22, { align: 'center', color: inkColor(.66) });
        }
      }
      labRepaint(function () { bdRingDraw(bdR ? bdR.days.length : 0); }, bdRing);
      setTimeout(function () { bdRingDraw(0); }, 200);
      setTimeout(bdDraw, 200); setTimeout(bdDraw, 1800);
      document.getElementById('bdRun').addEventListener('click', function () {
        var n = +bdSlider.value, seen = {}, hit = null, days = [];
        for (var i = 0; i < n; i++) {
          var day = Math.floor(Math.random() * 365);
          days.push(day);
          if (seen[day] !== undefined) { hit = day; break; }
          seen[day] = i;
        }
        bdR = { days: days, hitK: hit !== null ? days.length - 1 : null, who: '', when: '' };
        if (hit !== null) {
          var d = new Date(2026, 0, 1 + hit);
          var a = bdNames[Math.floor(Math.random() * bdNames.length)];
          var b = bdNames[Math.floor(Math.random() * bdNames.length)];
          while (b === a) b = bdNames[Math.floor(Math.random() * bdNames.length)];
          bdR.who = a + ' and ' + b; bdR.when = bdMonths[d.getMonth()] + ' ' + d.getDate();
          document.getElementById('bdLine').textContent = a + ' and ' + b + ' both blow out candles on ' +
            bdMonths[d.getMonth()] + ' ' + d.getDate() + '. Your gut said impossible; the math shrugged.';
        } else {
          document.getElementById('bdLine').textContent = 'No twins at this party. Rare, at this size. Throw another one.';
        }
        /* the guests arrive in under a second, then the shared day flares once */
        cancelAnimationFrame(bdAnim);
        var N = days.length, per = Math.min(60, 900 / N), t0 = 0, fly = N * per;
        if (LAB_RM || !(bdRing && bdRing.clientWidth > 0)) { bdRingDraw(N); return; }
        bdAnim = requestAnimationFrame(function fr(ts) {
          if (!t0) t0 = ts;
          var el = ts - t0, q = Math.min(N, el / per), fl = bdR.hitK != null && el > fly ? Math.min(1, (el - fly) / 520) : null;
          bdRingDraw(q, fl == null ? 0 : fl);
          if (el < fly + (bdR.hitK != null ? 520 : 0)) bdAnim = requestAnimationFrame(fr); else bdRingDraw(N);
        });
      });
    return {};
  });
})();
