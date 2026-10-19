/* P.S. Lab, No. 34: The pulled goalie. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="lx-bench lx-flat lx-bleed" data-cv-local><canvas id="pgC" style="height:170px" aria-hidden="true"></canvas></div>\n'
    + '      <input type="range" id="pgSlider" min="30" max="300" value="60" step="15" aria-label="Seconds remaining when you pull">\n'
    + '      <div class="readout">\n'
    + '        <span><span class="k">You pull at</span><span class="v up" id="pgT">1:00</span></span>\n'
    + '        <span><span class="k">You salvage</span><span class="v up" id="pgYou">–</span></span>\n'
    + '        <span><span class="k">Tradition (1:00)</span><span class="v" id="pgTrad">–</span></span>\n'
    + '      </div>\n'
    + '      <div class="pg-clock lx-score lx-bleed" data-ground="espresso" id="pgClock" aria-hidden="true">\n'
    + '        <span class="pg-time" id="pgClk">1:00</span>\n'
    + '        <span class="pg-bar"><i class="pg-tie" id="pgTie"></i><i class="pg-en" id="pgEn"></i></span>\n'
    + '        <span class="pg-lg"><span><i class="pg-sw t"></i>You tie</span><span><i class="pg-sw e"></i>Empty-net goal</span><span id="pgOdds"></span></span>\n'
    + '      </div>\n'
    + '      <div class="btnrow"><button class="ebtn" id="pgRun" type="button">Play 500 games</button></div>\n'
    + '      <p class="eline" id="pgLine">Losing by one and losing by two pay the same: nothing. Once you accept that, the goalie comes out earlier.</p>';
  LAB_KIT.mount('pulled-goalie', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- the pulled goalie: common random numbers, and the curve the simulation should land on ---------- */

      var pgSlider = document.getElementById('pgSlider');
      var pgC = document.getElementById('pgC');
      var pgA = .0022, pgB = .9978 * .0043, pgRes = null;
      function pgFmt(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
      /* the chance a pull at T seconds ties the game: score first in the time left, before they score */
      function pgP(T) { return pgA / (pgA + pgB) * (1 - Math.pow(1 - pgA - pgB, T)); }
      function pgRng(seed) { var t = seed >>> 0; return function () { t += 0x6D2B79F5; var r = Math.imul(t ^ t >>> 15, 1 | t); r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r; return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }
      /* the curve spans the slider's own travel: the foil line stands right above the thumb */
      function pgDraw() {
        if (!pgC) return;
        var f = fitCanvas(pgC, 170), ctx = f.ctx, W = f.W, H = 170;
        if (!(W > 0)) return;
        ctx.clearRect(0, 0, W, H);
        var v = +pgSlider.value, L = 9, R = W - 9, T = 22, B = H - 14, TOP = .36, k;
        function X(s) { return L + (s - 30) / 270 * (R - L); }
        function Y(p) { return B - Math.min(p, TOP) / TOP * (B - T); }
        ctx.lineWidth = 1; ctx.strokeStyle = inkColor(.2);
        ctx.beginPath(); ctx.moveTo(L, cvSnap(B)); ctx.lineTo(R, cvSnap(B)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(X(30), B);
        for (k = 30; k <= v; k += 3) ctx.lineTo(X(k), Y(pgP(k)));
        ctx.lineTo(X(v), Y(pgP(v))); ctx.lineTo(X(v), B); ctx.closePath(); ctx.fillStyle = ACCA(.08); ctx.fill();
        ctx.strokeStyle = inkColor(.5); ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.beginPath();
        for (k = 30; k <= 300; k += 3) { if (k === 30) ctx.moveTo(X(k), Y(pgP(k))); else ctx.lineTo(X(k), Y(pgP(k))); }
        ctx.stroke();
        /* tradition: a dashed line at one minute */
        var tx = cvSnap(X(60));
        ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = inkColor(.4);
        ctx.beginPath(); ctx.moveTo(tx, T - 8); ctx.lineTo(tx, B); ctx.stroke(); ctx.restore();
        cvText(ctx, 'Tradition', tx + 7, T - 1, { color: inkColor(.66) });
        /* you: a foil line from the floor to the curve */
        var yx = X(v), yy = Y(pgP(v));
        ctx.strokeStyle = ACC(); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cvSnap(yx), B); ctx.lineTo(cvSnap(yx), yy); ctx.stroke();
        ctx.beginPath(); ctx.arc(yx, yy, 5.5, 0, 7); ctx.fillStyle = labColor('--card'); ctx.fill();
        ctx.beginPath(); ctx.arc(yx, yy, 3.5, 0, 7); ctx.fillStyle = ACC(); ctx.fill();
        /* the five hundred games, as hollow rings: they land near the curve, never on it exactly */
        if (pgRes) {
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = inkColor(.62); ctx.beginPath(); ctx.arc(X(60), Y(pgRes.trad), 6, 0, 7); ctx.stroke();
          ctx.strokeStyle = ACC(); ctx.beginPath(); ctx.arc(X(pgRes.at), Y(pgRes.you), 7.5, 0, 7); ctx.stroke();
        }
      }
      var pgClock = document.getElementById('pgClock'), pgClk = document.getElementById('pgClk'), pgTie = document.getElementById('pgTie'), pgEn = document.getElementById('pgEn'), pgOdds = document.getElementById('pgOdds'), pgAnim = 0;
      /* the empty net, second by second: after e seconds pulled, the chance you have tied and the chance they have scored */
      function pgBar(T, e) {
        var g = 1 - Math.pow(1 - pgA - pgB, e), tie = pgA / (pgA + pgB) * g, en = pgB / (pgA + pgB) * g;
        pgClk.textContent = pgFmt(Math.max(0, Math.round(T - e)));
        pgTie.style.transform = 'scaleX(' + tie.toFixed(4) + ')';
        pgEn.style.setProperty('--t', tie.toFixed(4)); pgEn.style.setProperty('--e', en.toFixed(4));
        pgOdds.textContent = Math.round(tie * 100) + '% tie · ' + Math.round(en * 100) + '% empty net';
      }
      function pgRest() { cancelAnimationFrame(pgAnim); pgAnim = 0; if (pgClock) { pgClock.classList.remove('run'); pgBar(+pgSlider.value, +pgSlider.value); pgClk.textContent = pgFmt(+pgSlider.value); } }
      pgSlider.addEventListener('input', function () {
        document.getElementById('pgT').textContent = pgFmt(+pgSlider.value);
        pgDraw(); pgRest();
      });
      if (pgClock) pgRest();
      function pgSim(pullAt, games, r) {
        var salv = 0;
        for (var g = 0; g < games; g++) {
          var down = 1;
          for (var t = pullAt; t > 0; t--) {
            if (down === 1) {
              if (r() < 0.0022) { down = 0; break; }
              if (r() < 0.0043) { down = 2; break; }
            }
          }
          if (down === 0) salv++;
        }
        return salv / games;
      }
      document.getElementById('pgRun').addEventListener('click', function () {
        /* one seed per click, both runs: the same five hundred games, only the pull moves */
        var seed = (Math.random() * 4294967296) >>> 0;
        var yours = pgSim(+pgSlider.value, 500, pgRng(seed));
        var trad = pgSim(60, 500, pgRng(seed));
        pgRes = { at: +pgSlider.value, you: yours, trad: trad };
        var better = yours > trad, T = +pgSlider.value;
        function done() {
          pgDraw();
          document.getElementById('pgYou').textContent = (yours * 100).toFixed(1) + '%';
          document.getElementById('pgTrad').textContent = (trad * 100).toFixed(1) + '%';
          document.getElementById('pgLine').textContent = said;
        }
        var said = better
          ? 'Your timing salvaged ' + (yours * 100).toFixed(1) + '% of lost games against tradition’s ' + (trad * 100).toFixed(1) + '%. Yes, you eat uglier final scores; scoreboards do not pay style points. A famous hedge fund manager co-wrote the paper on this, because pulling the goalie late and sizing bets small are the same mistake: fearing how a loss looks more than what it costs.'
          : 'At that timing you salvaged ' + (yours * 100).toFixed(1) + '% against tradition’s ' + (trad * 100).toFixed(1) + '%. Drag the slider toward three or four minutes and run it again; the asymmetry only pays if you use it.';
        /* the clock runs down from your pull in about a second, the bar filling as the empty net is exposed; then the results land */
        cancelAnimationFrame(pgAnim);
        if (LAB_RM || !pgClock || !(pgClock.offsetWidth > 0)) { pgRest(); done(); return; }
        pgClock.classList.add('run');
        var t0 = 0;
        pgAnim = requestAnimationFrame(function fr(ts) {
          if (!t0) t0 = ts;
          var k = Math.min(1, (ts - t0) / 1100);
          pgBar(T, T * k);
          if (k < 1) pgAnim = requestAnimationFrame(fr); else { pgAnim = 0; pgClock.classList.remove('run'); done(); }
        });
      });
      labRepaint(pgDraw, pgC);
      setTimeout(pgDraw, 200); setTimeout(pgDraw, 1800);
    return {};
  });
})();
