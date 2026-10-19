/* P.S. Lab, No. 10: The ten minute turn. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="readout">\n'
    + '        <span><span class="k">Your turnaround</span><span class="v up" id="ttTurn">45 min</span></span>\n'
    + '        <span><span class="k">Flights a day, 3 planes</span><span class="v" id="ttFl">24</span></span>\n'
    + '        <span><span class="k">Planes’ worth of flying</span><span class="v" id="ttFleet">3.0</span></span>\n'
    + '      </div>\n'
    + '      <div class="lx-board lx-bleed" data-ground="slate" data-cv-local><canvas id="ttC" style="height:220px" aria-hidden="true"></canvas></div>\n'
    + '      <input type="range" id="ttSlider" min="10" max="60" value="45" aria-label="Turnaround minutes">\n'
    + '      <div class="tt-bar" id="ttBar"><div class="tt-fill" id="ttFill" style="--p:.75"></div><span class="tt-lbl">SCHEDULE COVERED · <b id="ttCov">75%</b></span><i class="tt-goal" aria-hidden="true"></i></div>\n'
    + '      <div class="tt-stamp" id="ttStamp" style="display:none">THE TEN MINUTE TURN</div>\n'
    + '      <p class="eline" id="ttLine">At the industry’s 45-minute turn, three planes fly 24 legs a day and the schedule needs 32. Drag the turn down and find the airline.</p>';
  LAB_KIT.mount('ten-minute-turn', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- the ten minute turn ---------- */

      var ttSlider = document.getElementById('ttSlider');
      var NEEDED = 32;
      var ttC = document.getElementById('ttC');
      /* the day, drawn: a map of the Texas triangle with the three planes on it, and their schedules as lanes. A day of 780 minutes
         plays once when the machine comes into view and again when you move the turn, then rests on the evening */
      var ttM = 780, ttStop = null, TTC = [[-96.80, 32.78, 'Dallas'], [-95.37, 29.76, 'Houston'], [-98.49, 29.42, 'San Antonio']];
      function ttDraw() {
        var t = +ttSlider.value, cyc = 45 + t, perPlane = Math.floor(780 / cyc), ok = perPlane * 3 >= NEEDED, m = Math.min(ttM, 780);
        var wide = (ttC.clientWidth || 0) >= 560, H = wide ? 200 : 292;
        var f = fitCanvas(ttC, H), ctx = f.ctx, W = f.W, p, k;
        if (!(W > 0)) return;
        ctx.clearRect(0, 0, W, H);
        var MW = wide ? Math.min(260, W * .36) : W, MH = wide ? H : 176;
        function mx(lon) { return 34 + (lon + 98.49) / 3.12 * (MW - 80); }
        function my(lat) { return 30 + (32.78 - lat) / 3.36 * (MH - 70); }
        var C = TTC.map(function (c) { return [mx(c[0]), my(c[1])]; });
        ctx.save(); ctx.setLineDash([2, 4]); ctx.strokeStyle = inkColor(.3); ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(C[0][0], C[0][1]); ctx.lineTo(C[1][0], C[1][1]); ctx.lineTo(C[2][0], C[2][1]); ctx.closePath(); ctx.stroke(); ctx.restore();
        TTC.forEach(function (c, i) {
          ctx.fillStyle = labColor('--card'); ctx.strokeStyle = inkColor(.85); ctx.lineWidth = 1.25;
          ctx.beginPath(); ctx.arc(C[i][0], C[i][1], 4, 0, 7); ctx.fill(); ctx.stroke();
          cvText(ctx, c[2], C[i][0] + (i === 2 ? -6 : i === 1 && !wide ? 8 : 9), C[i][1] + (i ? 20 : -9), { color: inkColor(.8), align: i === 1 && !wide ? 'right' : 'left' });
        });
        /* the planes: in the air for 45 minutes, then on the ground for your turn, a ring closing around them as it runs */
        for (p = 0; p < 3; p++) {
          k = Math.floor(m / cyc);
          var u = m - k * cyc, a = (p + k) % 3, b = (a + 1) % 3, x, y, ang, q;
          if (u < 45 || m >= 780) {
            q = Math.min(1, u / 45); x = C[a][0] + (C[b][0] - C[a][0]) * q; y = C[a][1] + (C[b][1] - C[a][1]) * q;
            ang = Math.atan2(C[b][1] - C[a][1], C[b][0] - C[a][0]);
          } else {
            var o = [[0, -11], [10, 6], [-10, 6]][p];
            x = C[b][0] + o[0]; y = C[b][1] + o[1]; ang = Math.atan2(C[(b + 1) % 3][1] - C[b][1], C[(b + 1) % 3][0] - C[b][0]);
            ctx.strokeStyle = ok ? ACCA(.7) : inkColor(.5); ctx.lineWidth = 1.25;
            ctx.beginPath(); ctx.arc(x, y, 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - (u - 45) / t)); ctx.stroke();
          }
          ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
          ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, 6); ctx.lineTo(-2, 0); ctx.lineTo(-5, -6); ctx.closePath();
          ctx.fillStyle = ok ? ACC() : inkColor(.8); ctx.fill(); ctx.restore();
        }
        /* the lanes: the legs each plane has flown so far today, and the plane the board sold */
        ctx.save(); ctx.font = LBL(11); if ('letterSpacing' in ctx) ctx.letterSpacing = '1px';
        var LW = Math.ceil(ctx.measureText('PLANE 4, SOLD').width) + 18; ctx.restore();
        var lane = 24, LX = wide ? MW + 24 : 0, LY = wide ? (H - lane * 4) / 2 : MH + 10, L = LX + LW, R = W - 12;
        for (p = 0; p < 4; p++) {
          var cy = LY + p * lane + lane / 2;
          cvText(ctx, p < 3 ? 'Plane ' + (p + 1) : 'Plane 4, sold', LX + 4, cy + 3.5, { halo: false, color: p < 3 ? inkColor(.72) : inkColor(.45) });
          if (p < 3) {
            ctx.strokeStyle = inkColor(.1); ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(L, cvSnap(cy)); ctx.lineTo(R, cvSnap(cy)); ctx.stroke();
            ctx.fillStyle = ok ? ACC() : inkColor(.62);
            for (k = 0; k < perPlane; k++) {
              var m0 = k * cyc; if (m0 >= m) break;
              var x0 = L + m0 / 780 * (R - L), x1 = L + Math.min(m0 + 45, m) / 780 * (R - L);
              cvRound(ctx, Math.round(x0), Math.round(cy - 4), Math.max(1, Math.round(x1 - x0) - 1), 8, 1.5); ctx.fill();
            }
          } else {
            ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = inkColor(.28); ctx.lineWidth = 1;
            ctx.strokeRect(L + .5, Math.round(cy - 4) + .5, R - L - 1, 8); ctx.restore();
          }
        }
        if (m < 780) {
          var xm = cvSnap(L + m / 780 * (R - L));
          ctx.strokeStyle = inkColor(.5); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xm, LY - 4); ctx.lineTo(xm, LY + lane * 4); ctx.stroke();
          var hh = 6 + Math.floor(m / 60), mm = Math.floor(m % 60);
          cvText(ctx, (hh > 12 ? hh - 12 : hh) + ':' + (mm < 10 ? '0' : '') + mm + (hh >= 12 ? ' pm' : ' am'), xm, LY - 8, { align: 'center', color: inkColor(.7) });
        }
      }
      function ttPlay() {
        if (LAB_RM || !(ttC.clientWidth > 0)) { ttM = 780; ttDraw(); return; }
        if (ttStop) return;
        ttM = 0;
        ttStop = labTw(4600, function (e, q) { ttM = 780 * q; ttDraw(); }, function () { ttStop = null; ttM = 780; ttDraw(); }, labLin);
      }
      function ttPaint() {
        var t = +ttSlider.value;
        var perPlane = Math.floor(780 / (45 + t));
        var have = perPlane * 3;
        var cov = Math.round(have / NEEDED * 100);
        document.getElementById('ttTurn').textContent = t + ' min';
        document.getElementById('ttFl').textContent = have;
        document.getElementById('ttFleet').textContent = (have / 8).toFixed(1);
        document.getElementById('ttCov').textContent = cov + '%';
        var fill = document.getElementById('ttFill');
        fill.style.setProperty('--p', (Math.min(100, cov) / 100).toFixed(4));
        fill.classList.toggle('ok', cov >= 100);
        document.getElementById('ttBar').classList.toggle('ok', cov >= 100);
        ttDraw();
        var stamp = document.getElementById('ttStamp');
        stamp.style.display = t <= 10 ? 'inline-block' : 'none';
        var line;
        if (t <= 10) line = 'Ten minutes. Your three planes now fly ' + have + ' legs a day, more than the four-plane schedule ever did. The stopwatch just bought back the fourth plane. Southwest hit this number in 1972 and built forty-seven straight years of profit on it.';
        else if (cov >= 100) line = 'Schedule saved at a ' + t + '-minute turn: ' + have + ' legs against the 32 you promised. Good. Now keep going; the record you are chasing is ten minutes, set by people who unloaded bags in cowboy boots because payroll depended on it.';
        else line = 'At a ' + t + '-minute turn your three planes fly ' + have + ' of the 32 promised legs: ' + cov + ' percent of a schedule. Every minute a plane sits at the gate is a minute it earns nothing. Keep dragging.';
        if (ttSaid) document.getElementById('ttLine').textContent = line;
      }
      var ttSaid = false;
      ttSlider.addEventListener('input', function () { ttSaid = true; ttPaint(); ttPlay(); });
      ttPaint();
      labRepaint(ttDraw, ttC);
      setTimeout(ttDraw, 250);
      labNear(ttC, ttPlay, '0px 0px -25% 0px');
    return {};
  });
})();
