/* P.S. Lab, No. 16: The shrinking hundred. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="lx-bench lx-flat lx-bleed" data-cv-local><canvas id="infC"></canvas></div>\n'
    + '      <div class="readout">\n'
    + '        <span><span class="k">Rate</span><span class="v" id="infR">3%</span></span>\n'
    + '        <span><span class="k">After</span><span class="v" id="infY">20 yrs</span></span>\n'
    + '        <span><span class="k">Your $100 buys</span><span class="v up" id="infV">$55</span></span>\n'
    + '      </div>\n'
    + '      <div class="ctl-row"><span class="ctl-k" aria-hidden="true">Rate</span><div class="inf-rw"><input type="range" id="infRate" min="1" max="12" value="3" aria-label="Inflation rate"><div class="inf-det" id="infDet" aria-hidden="true"><i data-v="2" style="--p:.0909">2%<b> · the Fed’s target</b></i><i data-v="7" style="--p:.5455">7%<b> · US prices, 2021</b></i><span class="inf-key">2%: the Fed’s target · 7%: US prices, 2021</span></div></div></div>\n'
    + '      <div class="ctl-row"><span class="ctl-k" aria-hidden="true">Years</span><input type="range" id="infYears" min="1" max="40" value="20" aria-label="Years"></div>\n'
    + '      <p class="eline" id="infLine">Rule of 72: at 3%, prices double in 24 years. Cash in a drawer does not.</p>';
  LAB_KIT.mount('shrinking-hundred', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- shrinking hundred: the note shrinks and pales with what it buys; two detents, 2% and 7% ---------- */

      var infC = document.getElementById('infC'), infShown = -1, infStop = null, infSaid = false, infR0 = 3;
      var infDet = Array.prototype.slice.call(document.querySelectorAll('#infDet i'));
      function infVal() { return 100 / Math.pow(1 + +document.getElementById('infRate').value / 100, +document.getElementById('infYears').value); }
      function drawInf() {
        var r = +document.getElementById('infRate').value;
        var y = +document.getElementById('infYears').value;
        var v = infVal(), vs = infShown < 0 ? v : infShown;
        document.getElementById('infR').textContent = r + '%';
        document.getElementById('infY').textContent = y + ' yrs';
        document.getElementById('infV').textContent = '$' + v.toFixed(0);
        infDet.forEach(function (d) { d.classList.toggle('on', +d.getAttribute('data-v') === r); });
        if (infSaid) document.getElementById('infLine').textContent =
          'Rule of 72: at ' + r + '%, prices double in ' + Math.round(72 / r) + ' years. The dotted line is what your $100 bought when you put it away.';
        var f = fitCanvas(infC, 190), ctx = f.ctx, Wd = f.W, H = 190;
        if (!(Wd > 0)) return;
        ctx.clearRect(0, 0, Wd, H);
        var noteW = Math.round(Math.min(300, Wd * 0.6)), noteH = Math.round(noteW * 0.44);
        var cx = Math.round(Wd / 2), cy = Math.round(H / 2) + 4;
        ctx.save(); ctx.strokeStyle = inkColor(.3); ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
        cvRound(ctx, cx - noteW / 2 + .5, cy - noteH / 2 + .5, noteW - 1, noteH - 1, 4); ctx.stroke(); ctx.restore();
        /* the note it is now: smaller, and paler, with what it buys */
        var s = Math.max(0.06, vs / 100), w2 = noteW * Math.sqrt(s), h2 = noteH * Math.sqrt(s);
        var nx = cx - w2 / 2, ny = cy - h2 / 2;
        /* a banknote, not a slab: pale green paper that pales further with what it buys, an engraved frame, the shadow it throws */
        ctx.save(); ctx.globalAlpha = .45 + .55 * s;
        ctx.shadowColor = 'rgba(20,30,24,.22)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
        var ng = ctx.createLinearGradient(nx, ny, nx + w2, ny + h2);
        ng.addColorStop(0, '#EEF2E6'); ng.addColorStop(.55, '#DCE6D6'); ng.addColorStop(1, '#C9D8C6');
        cvRound(ctx, nx, ny, w2, h2, 3); ctx.fillStyle = ng; ctx.fill(); ctx.restore();
        var ink = '#163126';
        if (w2 > 70) {
          ctx.save(); ctx.globalAlpha = .45 + .55 * s;
          ctx.strokeStyle = 'rgba(46,92,72,.75)'; ctx.lineWidth = 1.25;
          cvRound(ctx, Math.round(nx + 6) + .5, Math.round(ny + 6) + .5, Math.round(w2 - 13), Math.round(h2 - 13), 2); ctx.stroke();
          ctx.strokeStyle = 'rgba(46,92,72,.4)'; ctx.lineWidth = .75;
          cvRound(ctx, Math.round(nx + 9) + .5, Math.round(ny + 9) + .5, Math.round(w2 - 19), Math.round(h2 - 19), 1.5); ctx.stroke();
          if (w2 > 150) {
            var mr = h2 * .27, mx2 = nx + w2 * .24, my2 = cy;
            ctx.beginPath(); ctx.ellipse(mx2, my2, mr * .8, mr, 0, 0, 7);
            ctx.fillStyle = 'rgba(58,107,85,.14)'; ctx.fill(); ctx.strokeStyle = 'rgba(46,92,72,.6)'; ctx.lineWidth = 1; ctx.stroke();
            ctx.beginPath(); ctx.ellipse(mx2, my2, mr * .8 - 3, mr - 3, 0, 0, 7); ctx.strokeStyle = 'rgba(46,92,72,.3)'; ctx.stroke();
          }
          ctx.restore();
          ctx.save(); ctx.font = LBL(11); ctx.fillStyle = ink; ctx.textBaseline = 'alphabetic';
          if ('letterSpacing' in ctx) ctx.letterSpacing = '.5px';
          ctx.textAlign = 'left'; ctx.fillText('100', nx + 13, ny + 22);
          ctx.textAlign = 'right'; ctx.fillText('100', nx + w2 - 13, ny + h2 - 13);
          ctx.restore();
        }
        var big = s > 0.18;
        ctx.fillStyle = big ? ink : inkColor(.8);
        ctx.font = '400 ' + (big ? Math.round(Math.max(18, Math.min(36, h2 * .34))) : 15) + 'px Georgia, serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('$' + vs.toFixed(0), big && w2 > 150 ? cx + w2 * .1 : cx, big ? cy + 1 : ny - 14);
        ctx.textBaseline = 'alphabetic';
      }
      function infInput() {
        infSaid = true;
        var to = infVal(), from = infShown < 0 ? to : infShown, r = +document.getElementById('infRate').value;
        if (r !== infR0 && (r === 2 || r === 7) && !LAB_RM) { var el = document.getElementById('infR'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
        infR0 = r;
        if (infStop) infStop();
        infStop = labTw(320, function (e) { infShown = from + (to - from) * e; drawInf(); });
      }
      document.getElementById('infRate').addEventListener('input', infInput);
      document.getElementById('infYears').addEventListener('input', infInput);
      labRepaint(drawInf, infC);
      setTimeout(drawInf, 250);
    return {};
  });
})();
