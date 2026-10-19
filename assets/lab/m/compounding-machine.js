/* P.S. Lab, No. 15: The compounding machine. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="rl-mode cm-scale" role="group" aria-label="Chart scale"><button type="button" class="rl-seg on" data-l="0" aria-pressed="true">Linear</button><button type="button" class="rl-seg" data-l="1" aria-pressed="false">Log</button></div>\n'
    + '      <div class="lx-bench lx-flat lx-bleed" data-cv-local><canvas id="expComp"></canvas></div>\n'
    + '      <input type="range" id="compDays" min="7" max="365" value="120" aria-label="Days">\n'
    + '      <div class="readout">\n'
    + '        <span><span class="k">Days</span><span class="v" id="compD">120</span></span>\n'
    + '        <span><span class="k">1% better</span><span class="v up" id="compUp">×3.3</span></span>\n'
    + '        <span><span class="k">1% worse</span><span class="v dn" id="compDn">×0.30</span></span>\n'
    + '      </div>\n'
    + '      <p class="eline">For weeks the two curves look the same. That flat early stretch is where most people quit.</p>';
  LAB_KIT.mount('compounding-machine', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* 14: compounding: two people from one start, the gap between them tinted, each end tagged with its multiple.
       The first six weeks are shaded: the better of the two is still under 1.5x. The scale turns from linear to log on the frame clock */
    var compC = document.getElementById('expComp');
    var compSlider = document.getElementById('compDays');
    var compLog = 0, compStop = null;
    function drawComp() {
      var days = +compSlider.value;
      var up = Math.pow(1.01, days), dn = Math.pow(0.99, days);
      var upS = '×' + (up >= 10 ? up.toFixed(0) : up.toFixed(1)), dnS = '×' + dn.toFixed(2);
      document.getElementById('compD').textContent = days;
      document.getElementById('compUp').textContent = upS;
      document.getElementById('compDn').textContent = dnS;
      var f = fitCanvas(compC, 190), ctx = f.ctx, W = f.W, H = 190;
      if (!(W > 0)) return;
      ctx.clearRect(0, 0, W, H);
      var L = 16, R = W - 16, T = 28, B = H - 18, PH = B - T, k = compLog, lu = Math.log(up), ld = Math.log(dn);
      var N = Math.max(60, Math.round((R - L) / 3)), i, t;
      function X(t) { return L + t * (R - L); }
      /* one shared scale: both curves leave the same 1x point; on log the two become straight lines */
      function Yv(v) { return (1 - k) * (B - v / up * PH) + k * (B - (Math.log(v) - ld) / (lu - ld) * PH); }
      function Yd(t) { return Yv(Math.pow(0.99, days * t)); }
      function Yu(t) { return Yv(Math.pow(1.01, days * t)); }
      /* where most people quit: the stretch before the better curve reaches 1.5x (day 41) */
      var xq = X(Math.min(1, 40.7 / days));
      if (k < 1) {
        ctx.fillStyle = inkColor(.045 * (1 - k)); ctx.fillRect(L, 6, xq - L, B - 6);
        var wide = xq - L > 170;
        cvText(ctx, 'Where most people quit', wide ? (L + xq) / 2 : L + 6, 18, { align: wide ? 'center' : 'left', color: inkColor(.62 * (1 - k)) });
      }
      ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = inkColor(.2); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(L, cvSnap(Yv(1))); ctx.lineTo(R, cvSnap(Yv(1))); ctx.stroke(); ctx.restore();
      ctx.beginPath();
      for (i = 0; i <= N; i++) { t = i / N; if (i) ctx.lineTo(X(t), Yu(t)); else ctx.moveTo(X(t), Yu(t)); }
      for (i = N; i >= 0; i--) { t = i / N; ctx.lineTo(X(t), Yd(t)); }
      ctx.closePath(); ctx.fillStyle = ACCA(.06); ctx.fill();
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.strokeStyle = inkColor(.42); ctx.lineWidth = 1.6; ctx.beginPath();
      for (i = 0; i <= N; i++) { t = i / N; if (i) ctx.lineTo(X(t), Yd(t)); else ctx.moveTo(X(t), Yd(t)); }
      ctx.stroke();
      ctx.strokeStyle = ACC(); ctx.lineWidth = 2.2; ctx.beginPath();
      for (i = 0; i <= N; i++) { t = i / N; if (i) ctx.lineTo(X(t), Yu(t)); else ctx.moveTo(X(t), Yu(t)); }
      ctx.stroke();
      var yu = Yu(1), yd = Yd(1);
      ctx.fillStyle = ACC(); ctx.beginPath(); ctx.arc(R, yu, 3.5, 0, 7); ctx.fill();
      ctx.fillStyle = inkColor(.55); ctx.beginPath(); ctx.arc(R, yd, 3, 0, 7); ctx.fill();
      var NUM = '600 12px ' + CV_SANS;
      cvText(ctx, upS, R - 9, yu - 8 < 12 ? yu + 18 : yu - 8, { align: 'right', font: NUM, color: inkColor(.86) });
      cvText(ctx, dnS, R - 9, yd + 18 > B - 2 ? yd - 9 : yd + 18, { align: 'right', font: NUM, color: inkColor(.72) });
    }
    compSlider.addEventListener('input', drawComp);
    Array.prototype.forEach.call(document.querySelectorAll('.cm-scale .rl-seg'), function (b, i, all) {
      b.addEventListener('click', function () {
        var to = +b.getAttribute('data-l'), from = compLog;
        Array.prototype.forEach.call(all, function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        if (compStop) compStop();
        compStop = labTw(560, function (e) { compLog = from + (to - from) * e; drawComp(); }, null, 'io');
      });
    });
    labRepaint(drawComp, compC);
    setTimeout(drawComp, 200); setTimeout(drawComp, 1800);
    return {};
  });
})();
