/* P.S. Lab, No. 32: The threshold. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="th-wrap lx-forest lx-bleed" data-ground="forest" data-cv-local><canvas id="thC" class="th-canvas" style="height:230px" role="button" tabindex="0" aria-label="Forest. Tap or click a tree to strike the match"></canvas><canvas id="thG" class="th-glow" aria-hidden="true"></canvas></div>\n'
    + '      <input type="range" id="thSlider" min="30" max="85" value="55" aria-label="Forest density">\n'
    + '      <div class="btnrow">\n'
    + '        <button class="ebtn" id="thPlant" type="button">Plant the forest</button>\n'
    + '        <span style="flex:1"></span>\n'
    + '        <span class="readout readout--inline"><span class="k">Density</span><span class="v" id="thD">55%</span></span>\n'
    + '        <span class="readout readout--inline"><span class="k">Burned</span><span class="v up" id="thB">–</span></span>\n'
    + '      </div>\n'
    + '      <p class="eline" id="thLine">Physicists call the line near 59% the percolation threshold. Epidemiologists watch the same tipping point at R₀ = 1.</p>';
  LAB_KIT.mount('threshold', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- sim: the threshold: a centred forest, trees in eight shades of ink, the fire stepped on the frame clock ---------- */

      var thC = document.getElementById('thC');
      var thSlider = document.getElementById('thSlider');
      var thGrid = null, thShade = null, thCols = 0, thRows = 0, thTrees = 0, thOX = 0, thOY = 0, thBusy = false, thRaf = 0;
      var TH_CELL = 7, TH_H = 230, thG = document.getElementById('thG'), thGrow = false, thSpr = null, thSprK = '';
      thSlider.addEventListener('input', function () {
        document.getElementById('thD').textContent = this.value + '%';
      });
      /* a replant when you let go of the slider, unless a fire is running */
      thSlider.addEventListener('change', function () { if (!thBusy) thPlant(); });
      var thPal = null, thPalK = '';
      function thColors() {
        var k = labKey() + (labCur ? '|stage' : '');
        if (thPal && thPalK === k) return thPal;
        var ink = labRGB(inkColor(1)), a = ACCRGB(), tree = [];
        /* on its forest stage the trees are eight greens, lit from above; on paper they stay eight shades of ink */
        var TH_LEAF = ['#4E7A4A', '#57844F', '#5F8E55', '#68975B', '#73A062', '#7DAA69', '#88B372', '#94BC7C'];
        for (var q = 0; q < 8; q++) tree.push(labCur ? TH_LEAF[q] : inkColor((.36 + .22 * q / 7).toFixed(3)));
        /* ash: a small foil scar, so the burned ground reads as its own texture beside the living trees */
        thPal = { tree: tree, fire: ACC(), halo: ACCA(.28), ash: ACCA(.34), ember: ACCA(.62) };
        thPalK = k;
        return thPal;
      }
      function thCell(ctx, i, pal) {
        var x = thOX + (i % thCols) * TH_CELL, y = thOY + Math.floor(i / thCols) * TH_CELL, st = thGrid[i];
        ctx.clearRect(x, y, TH_CELL, TH_CELL);
        if (st === 0) return;
        if (st === 1) { ctx.fillStyle = pal.tree[thShade[i]]; ctx.fillRect(x + 1, y + 1, TH_CELL - 2, TH_CELL - 2); }
        else if (st === 2) {
          /* burning: the core in foil, its glow kept inside its own cell so a step only repaints what changed */
          ctx.fillStyle = pal.halo; ctx.fillRect(x, y, TH_CELL, TH_CELL);
          ctx.fillStyle = pal.fire; ctx.fillRect(x + 1, y + 1, TH_CELL - 2, TH_CELL - 2);
        } else if (st === 4) { ctx.fillStyle = pal.ember; ctx.fillRect(x + 1, y + 1, TH_CELL - 2, TH_CELL - 2); }
        else { ctx.fillStyle = pal.ash; ctx.fillRect(x + 2, y + 2, TH_CELL - 4, TH_CELL - 4); }
      }
      /* the glow: a soft foil light round each burning tree, on its own layer, cleared every step */
      function thGlow(list) {
        if (!thG) return;
        var f = fitCanvas(thG, TH_H), ctx = f.ctx;
        ctx.clearRect(0, 0, f.W, TH_H);
        if (!list.length) return;
        var k = labKey(), S = TH_CELL * 5;
        if (!thSpr || thSprK !== k) {
          thSpr = document.createElement('canvas'); thSpr.width = thSpr.height = S * 2;
          var x = thSpr.getContext('2d'), g = x.createRadialGradient(S, S, 0, S, S, S);
          g.addColorStop(0, ACCA(.2)); g.addColorStop(1, ACCA(0));
          x.fillStyle = g; x.fillRect(0, 0, S * 2, S * 2); thSprK = k;
        }
        for (var i = 0; i < list.length; i++) {
          var c = list[i];
          ctx.drawImage(thSpr, thOX + (c % thCols) * TH_CELL + TH_CELL / 2 - S / 2, thOY + Math.floor(c / thCols) * TH_CELL + TH_CELL / 2 - S / 2, S, S);
        }
      }
      /* t below 1: a replanted forest growing in, each tree on its own beat */
      function thDraw(t) {
        var f = fitCanvas(thC, TH_H), ctx = f.ctx;
        if (!(f.W > 0)) return;
        ctx.clearRect(0, 0, f.W, TH_H);
        if (!thGrid) return;
        thOX = Math.max(0, Math.floor((f.W - thCols * TH_CELL) / 2));
        thOY = Math.max(0, Math.floor((TH_H - thRows * TH_CELL) / 2));
        var pal = thColors(), i;
        if (t != null && t < 1) {
          for (i = 0; i < thGrid.length; i++) if (thGrid[i] === 1) {
            var g = Math.max(0, Math.min(1, (t - thShade[i] * .045 - (i % thCols) / thCols * .14) / .42)), z = (TH_CELL - 2) * (1 - Math.pow(1 - g, 3));
            if (z < .3) continue;
            ctx.fillStyle = pal.tree[thShade[i]];
            ctx.fillRect(thOX + (i % thCols) * TH_CELL + TH_CELL / 2 - z / 2, thOY + Math.floor(i / thCols) * TH_CELL + TH_CELL - 1 - z, z, z);
          }
          return;
        }
        for (i = 0; i < thGrid.length; i++) if (thGrid[i]) thCell(ctx, i, pal);
      }
      function thPaint(list) {
        labScope(thC);
        var ctx = thC.getContext('2d'), pal = thColors();
        for (var i = 0; i < list.length; i++) thCell(ctx, list[i], pal);
      }
      function thPlant() {
        if (thRaf) cancelAnimationFrame(thRaf);
        thRaf = 0; thBusy = false; thGrow = false;
        var f = fitCanvas(thC, TH_H);
        thCols = Math.floor(f.W / TH_CELL); thRows = Math.floor(TH_H / TH_CELL);
        thGrid = new Uint8Array(thCols * thRows);
        thShade = new Uint8Array(thCols * thRows);
        var d = +thSlider.value / 100;
        thTrees = 0;
        for (var i = 0; i < thGrid.length; i++) {
          if (Math.random() < d) { thGrid[i] = 1; thTrees++; }
          var h = Math.imul(i + 1, 2654435761) >>> 0; h = (h ^ (h >>> 15)) >>> 0;
          thShade[i] = h % 8;
        }
        document.getElementById('thB').textContent = '–';
        document.getElementById('thLine').textContent = 'Forest planted. Click anywhere in it to strike the match.';
        thGlow([]);
        var tx = thC.closest('.exp');
        if (LAB_RM || !(f.W > 0) || (tx && tx._vis === false)) { thDraw(); return; }
        var t0 = 0; thGrow = true;
        thRaf = requestAnimationFrame(function fr(ts) {
          if (!thGrow) return;
          if (!t0) t0 = ts;
          var t = Math.min(1, (ts - t0) / 640);
          thDraw(t);
          if (t < 1) thRaf = requestAnimationFrame(fr); else { thGrow = false; thRaf = 0; thDraw(); }
        });
      }
      document.getElementById('thPlant').addEventListener('click', thPlant);
      function thFinish(burned) {
        thBusy = false; thRaf = 0;
        var pct = thTrees ? Math.round(burned / thTrees * 100) : 0;
        document.getElementById('thB').textContent = pct + '%';
        document.getElementById('thLine').textContent = pct < 35
          ? 'The fire starved at ' + pct + '% of the forest. Below the threshold, a spark stays a spark. Plant at 65% and strike the same match.'
          : pct < 80
          ? pct + '% burned. You are near the threshold, where a few points of density change everything. That is a phase transition.'
          : pct + '% gone, from one match. Above the threshold there is no such thing as a small fire. Epidemics and bank runs follow the same arithmetic.';
      }
      /* one step of the fire: everything burning becomes an ember, then ash, and lights its four neighbours */
      function thTick(paint) {
        var burningNow = [], cooled = [], burned = 0, lit = [];
        for (var i = 0; i < thGrid.length; i++) {
          var st = thGrid[i];
          if (st === 2) burningNow.push(i);
          else if (st === 4) { thGrid[i] = 3; cooled.push(i); burned++; }
          else if (st === 3) burned++;
        }
        if (!burningNow.length) { if (paint) { thPaint(cooled); thGlow([]); } thFinish(burned); return true; }
        var changed = paint ? cooled : null;
        burningNow.forEach(function (i2) {
          thGrid[i2] = paint ? 4 : 3;
          if (changed) changed.push(i2);
          var xx = i2 % thCols, yy = Math.floor(i2 / thCols);
          [[xx - 1, yy], [xx + 1, yy], [xx, yy - 1], [xx, yy + 1]].forEach(function (p) {
            if (p[0] >= 0 && p[0] < thCols && p[1] >= 0 && p[1] < thRows) {
              var k = p[1] * thCols + p[0];
              if (thGrid[k] === 1) { thGrid[k] = 2; lit.push(k); if (changed) changed.push(k); }
            }
          });
        });
        if (changed) { thPaint(changed); thGlow(lit); }
        return false;
      }
      function thRun() {
        if (LAB_RM) { while (!thTick(false)) {} thDraw(); return; }
        var last = performance.now();
        thBusy = true;
        function fr(ts) {
          if (!thBusy) return;
          if (ts - last >= 70) { last = ts; if (thTick(true)) return; }
          thRaf = requestAnimationFrame(fr);
        }
        thRaf = requestAnimationFrame(fr);
      }
      thC.addEventListener('pointerdown', function (e) {
        if (!thGrid) return;
        var r = thC.getBoundingClientRect();
        thStrike(Math.floor((e.clientX - r.left - thC.clientLeft - thOX) / TH_CELL), Math.floor((e.clientY - r.top - thC.clientTop - thOY) / TH_CELL));
      });
      /* the keyboard strikes the match at the heart of the forest */
      thC.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        if (e.repeat || !thGrid) return;
        thStrike(Math.floor(thCols / 2), Math.floor(thRows / 2));
        try { thC.dispatchEvent(new Event('input', { bubbles: true })); } catch (er) {}
      });
      function thStrike(x, y) {
        if (!thGrid) return;
        x = Math.max(0, Math.min(thCols - 1, x)); y = Math.max(0, Math.min(thRows - 1, y));
        var idx = y * thCols + x;
        if (idx < 0 || idx >= thGrid.length) return;
        if (thGrid[idx] !== 1) {
          for (var s = 1; s < 6 && thGrid[idx] !== 1; s++) {
            for (var dy = -s; dy <= s && thGrid[idx] !== 1; dy++)
              for (var dx = -s; dx <= s; dx++) {
                var j = (y + dy) * thCols + (x + dx);
                if (j >= 0 && j < thGrid.length && thGrid[j] === 1) { idx = j; break; }
              }
          }
        }
        if (thGrid[idx] !== 1) return;
        if (thGrow) { thGrow = false; cancelAnimationFrame(thRaf); thRaf = 0; thDraw(); }
        thGrid[idx] = 2;
        if (thBusy) { thPaint([idx]); return; }
        thPaint([idx]);
        thRun();
      }
      labRepaint(function () { thDraw(); }, thC);
      setTimeout(thPlant, 400);
    return {};
  });
})();
