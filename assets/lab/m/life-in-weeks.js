/* P.S. Lab, No. 01: Your life in weeks. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="lw-stage lx-bench lx-flat lx-bleed" data-cv-local><canvas id="lwC" style="height:384px" aria-hidden="true"></canvas><span class="lw-now" id="lwNow" aria-hidden="true"></span><span class="lw-hov" id="lwHov" aria-hidden="true"></span><span class="lw-tip" id="lwTip" aria-hidden="true"></span></div>\n'
    + '      <input type="range" id="lwAge" min="1" max="89" value="25" aria-label="Your age">\n'
    + '      <div class="readout">\n'
    + '        <span><span class="k">Age</span><span class="v" id="lwA">25</span></span>\n'
    + '        <span><span class="k">Weeks spent</span><span class="v" id="lwSpent">1,300</span></span>\n'
    + '        <span><span class="k">Weeks left to 90</span><span class="v up" id="lwLeft">3,380</span></span>\n'
    + '      </div>\n'
    + '      <p class="eline" id="lwLine">Every plan you are postponing lives in the empty squares. Count them.</p>';
  LAB_KIT.mount('life-in-weeks', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- your life in weeks: a new age sweeps the fill a year at a time; the week under the finger is named ---------- */

      var lwC = document.getElementById('lwC');
      var lwAge = document.getElementById('lwAge'), lwNow = document.getElementById('lwNow');
      var lwStage = lwC.parentNode, lwTip = document.getElementById('lwTip'), lwHov = document.getElementById('lwHov');
      var lwShown = -1, lwG = null, lwStop = null, lwSaid = false, lwTipT = 0;
      var LW_SEASON = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
      function lwLived() { return Math.round(+lwAge.value * 52.18); }
      function drawWeeks() {
        var age = +lwAge.value, lived = lwLived(), shown = lwShown < 0 ? lived : Math.round(lwShown);
        document.getElementById('lwA').textContent = age;
        document.getElementById('lwSpent').textContent = lived.toLocaleString();
        document.getElementById('lwLeft').textContent = Math.max(0, 4696 - lived).toLocaleString();
        if (lwSaid) document.getElementById('lwLine').textContent = age < 30 ? 'Look at all those empty squares. Now look at how fast the dark rows stacked up anyway.'
          : age < 55 ? 'The grid does not judge. It fills in, one square a week, whether the week was spent or invested.'
          : 'Fewer empty squares now, and each one weighs more. Spend them like the punch card below: deliberately.';
        var Wd = lwC.clientWidth;
        if (!(Wd > 0)) return;
        /* wide: ninety years run left to right, a column each, fifty-two weeks down; narrow: a row a year */
        var wide = Wd >= 520, cols, rows, cell, ox, oy, H;
        if (wide) { cols = 90; rows = 52; cell = Math.max(3, Math.floor((Wd - 24) / 90)); ox = Math.floor((Wd - cols * cell) / 2); oy = 20; H = oy + rows * cell + 6; }
        else { cols = 52; rows = 90; cell = Math.max(3, Math.floor((Wd - 8) / 52)); ox = Wd - cols * cell - 4; oy = 6; H = oy + rows * cell + 6; }
        lwG = { wide: wide, cols: cols, rows: rows, cell: cell, ox: ox, oy: oy };
        var f = fitCanvas(lwC, H), ctx = f.ctx, sq = cell - 2, i, x, y;
        function at(k) {
          var c = wide ? Math.floor(k / 52) : k % 52, r = wide ? k % 52 : Math.floor(k / 52);
          x = ox + c * cell; y = oy + r * cell;
        }
        ctx.clearRect(0, 0, Wd, H);
        ctx.strokeStyle = inkColor(.26); ctx.lineWidth = 1; ctx.beginPath();
        for (var dcd = 1; dcd < 9; dcd++) {
          var e = dcd * 10 * cell;
          if (wide) { ctx.moveTo(ox + e - .5, oy - 4); ctx.lineTo(ox + e - .5, oy + rows * cell); }
          else { ctx.moveTo(ox - 3, oy + e - .5); ctx.lineTo(ox + cols * cell, oy + e - .5); }
        }
        ctx.stroke();
        for (dcd = 0; dcd < 9; dcd++) {
          if (wide) cvText(ctx, String(dcd * 10), ox + dcd * 10 * cell + (dcd ? 2 : 1), oy - 8, { halo: false, ls: '0px' });
          else cvText(ctx, String(dcd * 10), ox - 6, oy + dcd * 10 * cell + cell + 3, { align: 'right', halo: false, ls: '0px' });
        }
        ctx.fillStyle = inkColor(.78);
        for (i = 0; i < shown; i++) { at(i); ctx.fillRect(x + 1, y + 1, sq, sq); }
        ctx.strokeStyle = inkColor(.18); ctx.beginPath();
        for (i = shown + 1; i < cols * rows; i++) { at(i); ctx.rect(x + 1.5, y + 1.5, sq - 1, sq - 1); }
        ctx.stroke();
        at(shown);
        lwNow.style.width = sq + 'px'; lwNow.style.height = sq + 'px';
        lwNow.style.translate = (lwC.offsetLeft + lwC.clientLeft + x + 1) + 'px ' + (lwC.offsetTop + lwC.clientTop + y + 1) + 'px';
      }
      lwAge.addEventListener('input', function () {
        lwSaid = true;
        var to = lwLived(), from = lwShown < 0 ? to : lwShown;
        if (lwStop) lwStop();
        /* six milliseconds a year of life, never more than 600 */
        lwStop = labTw(Math.min(600, Math.abs(to - from) / 52.18 * 6), function (e) { lwShown = from + (to - from) * e; drawWeeks(); }, null, labLin);
      });
      function lwTipAt(px, py) {
        var g = lwG; if (!g) return;
        var c = Math.floor((px - g.ox) / g.cell), r = Math.floor((py - g.oy) / g.cell);
        if (c < 0 || r < 0 || c >= g.cols || r >= g.rows) { lwStage.classList.remove('tip'); return; }
        var k = g.wide ? c * 52 + r : r * 52 + c, d = new Date(Date.now() + (k - lwLived()) * 6048e5);
        lwTip.textContent = 'Week ' + (k + 1).toLocaleString('en-US') + ' · age ' + Math.floor(k / 52.18) + ' · ' + LW_SEASON[d.getMonth()] + ' ' + d.getFullYear();
        var x = lwC.offsetLeft + lwC.clientLeft + g.ox + c * g.cell, y = lwC.offsetTop + lwC.clientTop + g.oy + r * g.cell, tw = lwTip.offsetWidth;
        lwHov.style.width = lwHov.style.height = (g.cell - 2) + 'px'; lwHov.style.translate = (x + 1) + 'px ' + (y + 1) + 'px';
        lwTip.style.translate = Math.max(0, Math.min(lwStage.clientWidth - tw, x + g.cell / 2 - tw / 2)) + 'px ' + (y < 40 ? y + g.cell + 8 : y - 34) + 'px';
        lwStage.classList.add('tip');
      }
      lwC.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') lwTipAt(e.offsetX, e.offsetY); });
      lwC.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') lwStage.classList.remove('tip'); });
      lwC.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse') return;
        lwTipAt(e.offsetX, e.offsetY); clearTimeout(lwTipT);
        lwTipT = setTimeout(function () { lwStage.classList.remove('tip'); }, 2600);
      });
      labRepaint(drawWeeks, lwC);
      setTimeout(drawWeeks, 300);
    return {};
  });
})();
