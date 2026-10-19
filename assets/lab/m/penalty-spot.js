/* P.S. Lab, No. 33: The penalty spot. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="lx-pitch lx-bleed" data-ground="forest" data-cv-local><canvas id="pnC" style="height:180px" aria-hidden="true"></canvas></div>\n'
    + '      <div class="pn-tally" id="pnTally" aria-hidden="true"></div>\n'
    + '      <div class="btnrow pn-row">\n'
    + '        <button class="ebtn2 pnBtn" data-s="0" type="button">Dive left</button>\n'
    + '        <button class="ebtn2 pnBtn" data-s="1" type="button">Hold the middle</button>\n'
    + '        <button class="ebtn2 pnBtn" data-s="2" type="button">Dive right</button>\n'
    + '      </div>\n'
    + '      <div class="readout">\n'
    + '        <span><span class="k">Penalty</span><span class="v" id="pnRound">1/10</span></span>\n'
    + '        <span><span class="k">Saves</span><span class="v up" id="pnSaves">0</span></span>\n'
    + '        <span><span class="k">You dove</span><span class="v" id="pnDives">0×</span></span>\n'
    + '      </div>\n'
    + '      <p class="eline" id="pnLine">Bar-Eli called it action bias: a goal conceded after a dive feels better than one conceded standing still.</p>';
  LAB_KIT.mount('penalty-spot', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- the penalty spot: a goal with its net, a keeper who dives, a ball that curls; ten shots on a tally ---------- */

      var pnC2 = document.getElementById('pnC');
      var pnTally = document.getElementById('pnTally');
      var pnRound = 1, pnSaves = 0, pnDives = 0, pnBusy = false, pnAnim = 0;
      var pnLast = { shot: null, keeper: null, saved: false };
      if (pnTally) { var pnh = ''; for (var pni = 0; pni < 10; pni++) pnh += '<i' + (pni === 0 ? ' class="cur"' : '') + '></i>'; pnTally.innerHTML = pnh; }
      function pnDraw(shot, keeper, saved, t) {
        if (t == null) t = 1;
        pnLast = { shot: shot, keeper: keeper, saved: saved };
        var f = fitCanvas(pnC2, 180), ctx = f.ctx, Wd = f.W, H = 180;
        if (!(Wd > 0)) return;
        ctx.clearRect(0, 0, Wd, H);
        var gx = Math.round(Wd * 0.14), gw = Math.round(Wd * 0.72), gy = 22, gh = 112, ground = gy + gh, cx = Wd / 2;
        var lanes = [gx + gw * 0.17, gx + gw * 0.5, gx + gw * 0.83];
        var e = t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
        /* the pitch: one ground line, the spot */
        ctx.lineWidth = 1; ctx.strokeStyle = inkColor(.2);
        ctx.beginPath(); ctx.moveTo(8, cvSnap(ground)); ctx.lineTo(Wd - 8, cvSnap(ground)); ctx.stroke();
        ctx.fillStyle = inkColor(.45); ctx.beginPath(); ctx.ellipse(cx, 166, 3.5, 1.8, 0, 0, 7); ctx.fill();
        /* the net, in depth: the back frame stands smaller and lower behind the mouth; the mesh runs over the back, the roof
           and both sides, so the goal reads as a cage you can put a ball into */
        var bkL = gx + gw * .075, bkR = gx + gw * .925, bkT = gy + 13, bkB = ground - 9, nq, nk2;
        ctx.save(); ctx.strokeStyle = inkColor(.11); ctx.lineWidth = 1; ctx.beginPath();
        for (nq = 0; nq <= 24; nq++) { var nbx = bkL + (bkR - bkL) * nq / 24; ctx.moveTo(nbx, bkT); ctx.lineTo(nbx, bkB); ctx.moveTo(gx + gw * nq / 24, gy); ctx.lineTo(nbx, bkT); }
        for (nq = 0; nq <= 9; nq++) {
          var nby = bkT + (bkB - bkT) * nq / 9, nfy = gy + gh * nq / 9;
          ctx.moveTo(bkL, nby); ctx.lineTo(bkR, nby); ctx.moveTo(gx, nfy); ctx.lineTo(bkL, nby); ctx.moveTo(gx + gw, nfy); ctx.lineTo(bkR, nby);
        }
        for (nq = 1; nq < 3; nq++) {
          nk2 = nq / 3;
          var nlx = gx + (bkL - gx) * nk2, nrx = gx + gw + (bkR - gx - gw) * nk2, nty = gy + (bkT - gy) * nk2;
          ctx.moveTo(nlx, nty); ctx.lineTo(nrx, nty); ctx.moveTo(nlx, nty); ctx.lineTo(nlx, ground + (bkB - ground) * nk2); ctx.moveTo(nrx, nty); ctx.lineTo(nrx, ground + (bkB - ground) * nk2);
        }
        ctx.stroke();
        ctx.strokeStyle = inkColor(.32); ctx.lineWidth = 1.25; ctx.beginPath();
        ctx.moveTo(bkL, bkB); ctx.lineTo(bkL, bkT); ctx.lineTo(bkR, bkT); ctx.lineTo(bkR, bkB);
        ctx.moveTo(gx, ground); ctx.lineTo(bkL, bkB); ctx.moveTo(gx + gw, ground); ctx.lineTo(bkR, bkB); ctx.stroke();
        ctx.restore();
        /* the frame */
        ctx.strokeStyle = inkColor(.8); ctx.lineWidth = 3; ctx.lineCap = 'square'; ctx.lineJoin = 'miter';
        ctx.beginPath(); ctx.moveTo(gx, ground); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.lineTo(gx + gw, ground); ctx.stroke();
        ctx.lineCap = 'round';
        /* the keeper: standing in the middle, then diving the way you called it */
        var kTo = keeper === null ? 1 : keeper, dir = kTo - 1;
        var kx = lanes[1] + (lanes[kTo] - lanes[1]) * e, lift = dir === 0 ? Math.sin(Math.PI * Math.min(1, t)) * 7 : 22 * e;
        ctx.save(); ctx.translate(kx, ground - lift); ctx.rotate(dir * 1.08 * e);
        ctx.strokeStyle = inkColor(.78); ctx.fillStyle = inkColor(.78);
        ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, -30); ctx.stroke();
        var arm = dir === 0 && keeper !== null ? -8 * e : 0, reach = dir !== 0 ? 6 * e : 0;
        ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-15 - reach, -34 + arm - reach); ctx.lineTo(0, -28); ctx.lineTo(15 + reach, -34 + arm - reach); ctx.stroke();
        ctx.beginPath(); ctx.arc(-15 - reach, -34 + arm - reach, 3.4, 0, 7); ctx.arc(15 + reach, -34 + arm - reach, 3.4, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(0, -42, 7, 0, 7); ctx.fill();
        ctx.restore();
        /* the ball: on the spot at rest, then curling into its corner */
        var bx0 = cx, by0 = 160, bx1, by1, br;
        if (shot === null) { bx1 = bx0; by1 = by0; }
        else { bx1 = lanes[shot]; by1 = gy + 34; }
        var curl = shot === null ? 0 : shot === 1 ? 16 : (1 - shot) * 32;
        var qx = (bx0 + bx1) / 2 + curl, qy = by1 + 36;
        var u = shot === null ? 0 : e;
        var bx = (1 - u) * (1 - u) * bx0 + 2 * (1 - u) * u * qx + u * u * bx1;
        var by = (1 - u) * (1 - u) * by0 + 2 * (1 - u) * u * qy + u * u * by1;
        br = 8 - 1.5 * u;
        if (shot !== null) {
          /* the flight: a dashed trail behind the ball, and its shadow running along the turf */
          ctx.save(); ctx.setLineDash([2, 4]); ctx.strokeStyle = inkColor(.3); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx0, by0);
          for (var tq = 1; tq <= 16; tq++) { var w = u * tq / 16; ctx.lineTo((1 - w) * (1 - w) * bx0 + 2 * (1 - w) * w * qx + w * w * bx1, (1 - w) * (1 - w) * by0 + 2 * (1 - w) * w * qy + w * w * by1); }
          ctx.stroke(); ctx.restore();
          ctx.fillStyle = inkColor(.14); ctx.beginPath(); ctx.ellipse(bx, by0 + (ground + 3 - by0) * u, 6 - 2 * u, 1.6, 0, 0, 7); ctx.fill();
        }
        if (shot !== null && !saved && t > .7) {
          /* the net gives: two rings behind the ball, the mesh pulled taut round it */
          var nk = Math.min(1, (t - .7) / .3);
          ctx.strokeStyle = inkColor(.16 * (1.2 - nk * .4)); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(bx, by, 10 + 8 * nk, 0, 7); ctx.stroke();
          ctx.beginPath(); ctx.arc(bx, by, 18 + 10 * nk, 0, 7); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(bx, by, br + 2, 0, 7); ctx.fillStyle = labColor('--card'); ctx.fill();
        ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.fillStyle = ACC(); ctx.fill();
        if (shot !== null && saved) {
          /* a save: a foil ring where the gloves met it */
          var rr = 12 + 5 * Math.max(0, (t - .6) / .4);
          ctx.strokeStyle = ACCA(t >= 1 ? 1 : .4 + .6 * t); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(bx, by, rr, 0, 7); ctx.stroke();
        }
      }
      pnDraw(null, null, false);
      labRepaint(function () { pnDraw(pnLast.shot, pnLast.keeper, pnLast.saved, 1); }, pnC2);
      function pnPlay(shot, k, saved) {
        if (pnAnim) cancelAnimationFrame(pnAnim);
        pnAnim = 0;
        if (LAB_RM || !(pnC2.clientWidth > 0)) { pnDraw(shot, k, saved, 1); return false; }
        var t0 = performance.now();
        function fr(ts) {
          var t = Math.min(1, Math.max(0, (ts - t0) / 640));
          pnDraw(shot, k, saved, t);
          pnAnim = t < 1 ? requestAnimationFrame(fr) : 0;
        }
        pnDraw(shot, k, saved, 0);
        pnAnim = requestAnimationFrame(fr);
        return true;
      }
      function pnFinish() {
        var diveRate = Math.round(pnDives / 10 * 100);
        document.getElementById('pnLine').textContent =
          'Final: ' + pnSaves + ' saves, and you dove on ' + diveRate + '% of shots. Real keepers dive about 94% of the time while about three in ten penalties go down the middle, so standing still saves more. They dive anyway, because conceding while motionless looks lazy and conceding mid-heroic-leap looks unlucky. It is called action bias, and it runs boardrooms too: doing something is how decision-makers hide.';
        document.querySelectorAll('.pnBtn').forEach(function (b2) { b2.disabled = true; });
      }
      document.querySelectorAll('.pnBtn').forEach(function (b) {
        b.addEventListener('click', function () {
          if (pnBusy || pnRound > 10) return;
          pnBusy = true;
          var k = +b.getAttribute('data-s');
          if (k !== 1) pnDives++;
          var r = Math.random();
          var shot = r < 0.37 ? 0 : r < 0.67 ? 2 : 1;
          var saved = false;
          if (k === shot) saved = Math.random() < (shot === 1 ? 0.8 : 0.5);
          if (saved) pnSaves++;
          var animated = pnPlay(shot, k, saved);
          if (pnTally && pnTally.children[pnRound - 1]) {
            pnTally.children[pnRound - 1].className = saved ? 'save' : 'goal';
            if (pnTally.children[pnRound]) pnTally.children[pnRound].className = 'cur';
          }
          var where = ['to your left', 'down the middle', 'to your right'][shot];
          document.getElementById('pnLine').textContent = 'Shot ' + where + '. ' +
            (saved ? 'SAVED. The crowd forgives everything when it works.' :
             (k === 1 && shot !== 1 ? 'Goal. You stood tall and it went wide of you; the pundits will call you frozen.' : 'Goal. You guessed, like every keeper does.'));
          document.getElementById('pnSaves').textContent = pnSaves;
          document.getElementById('pnDives').textContent = pnDives + '×';
          pnRound++;
          document.getElementById('pnRound').textContent = Math.min(pnRound, 10) + '/10';
          if (pnRound > 10) { setTimeout(pnFinish, 900); }
          setTimeout(function () { pnBusy = false; }, animated ? 680 : 350);
        });
      });
    return {};
  });
})();
