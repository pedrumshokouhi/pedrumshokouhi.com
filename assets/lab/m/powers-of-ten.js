/* P.S. Lab, No. 06: Powers of ten. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="zoom-stage lx-bleed" data-ground="espresso" data-cv-local>\n'
    + '        <canvas class="zoom-fr" id="zoomFr" aria-hidden="true"></canvas>\n'
    + '        <div class="zoom-dot" id="zoomDot"></div>\n'
    + '        <span class="zoom-hint" aria-hidden="true">Pinch or Ctrl + scroll</span>\n'
    + '        <span class="zoom-exp" id="zoomExp">10⁰</span>\n'
    + '        <span class="zoom-name" id="zoomName">You</span>\n'
    + '      </div>\n'
    + '      <input type="range" id="zoomSlider" min="0" max="11" value="4" step="1" aria-label="Scale">\n'
    + '      <ol class="zoom-rule" id="zoomRule" aria-hidden="true"></ol>\n'
    + '      <p class="eline" id="zoomLine">You are here. Hello.</p>';
  LAB_KIT.mount('powers-of-ten', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- 06: powers of ten ---------- */

      var SCALES = [
        ['A proton', '10⁻¹⁵ m', 6, 'About 1.7 femtometres across. Nearly all of a hydrogen atom’s mass.'],
        ['An atom', '10⁻¹⁰ m', 12, 'About 0.1 nanometres across, and almost all of it empty space.'],
        ['A virus', '10⁻⁷ m', 20, 'About 100 nanometres. Too small for an ordinary light microscope.'],
        ['An ant', '10⁻² m', 34, 'Carries about fifty times its own weight.'],
        ['You', '10⁰ m', 52, 'About 1.7 m tall. You are here.'],
        ['A city block', '10² m', 74, 'About 100 m: a minute or so on foot.'],
        ['The Earth', '10⁷ m', 100, '12,742 km across. Every case file in this study happened here.'],
        ['The Sun', '10⁹ m', 128, '1.39 million km across, about 109 Earths.'],
        ['The solar system', '10¹³ m', 156, 'The furthest anything human has physically gone.'],
        ['A light-year', '10¹⁶ m', 182, 'A light-year: 9.46 trillion km.'],
        ['The galaxy', '10²¹ m', 208, 'About 100 billion stars, 100,000 light-years across.'],
        ['The observable universe', '10²⁶ m', 236, 'About 93 billion light-years across. The edge of what light has had time to reach.']
      ];
      var zoomDot = document.getElementById('zoomDot');
      var zoomSlider = document.getElementById('zoomSlider');
      var zoomStage = zoomDot.parentNode, zoomRule = document.getElementById('zoomRule'), zoomFr = document.getElementById('zoomFr');
      var ZE = [-15, -10, -7, -2, 0, 2, 7, 9, 13, 16, 21, 26], SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
      var zf = +zoomSlider.value, zStop = null, zSnapT = 0, zStop0 = -1;
      function zSup(n) { return (n < 0 ? '⁻' : '') + String(Math.abs(n)).split('').map(function (c) { return SUP[+c]; }).join(''); }
      SCALES.forEach(function (sc, i) {
        var li = document.createElement('li');
        li.style.left = 'calc(9px + (100% - 18px) * ' + (i / (SCALES.length - 1)).toFixed(4) + ')';
        li.textContent = sc[1].replace(/\s*m$/, '');
        zoomRule.appendChild(li);
      });
      function zLerp(a, i, f) { return a[i] + ((a[Math.min(11, i + 1)]) - a[i]) * f; }
      function zDraw() {
        var i = Math.max(0, Math.min(11, Math.floor(zf))), fr = zf - i, n = Math.round(zf), sc = SCALES[n];
        var rad = function (k) { return SCALES[Math.max(0, Math.min(11, k))][2] / 236; };
        var z = rad(i) + (rad(i + 1) - rad(i)) * fr;
        zoomDot.style.setProperty('--z', z.toFixed(4));
        zoomDot.style.opacity = (n === 4) ? '1' : '.85';
        zoomStage.style.setProperty('--z1', n > 0 ? rad(n - 1).toFixed(4) : '.01');
        zoomStage.style.setProperty('--o1', n > 0 ? '1' : '0');
        zoomStage.style.setProperty('--z2', n < 11 ? rad(n + 1).toFixed(4) : '.01');
        zoomStage.style.setProperty('--o2', n < 11 ? '1' : '0');
        if (n !== zStop0) {
          zStop0 = n;
          document.getElementById('zoomExp').textContent = sc[1];
          document.getElementById('zoomName').textContent = sc[0];
          document.getElementById('zoomLine').textContent = sc[3];
          Array.prototype.forEach.call(zoomRule.children, function (li, k) { li.classList.toggle('on', k === n); });
        }
        /* the frames: one square per power of ten, each ten times the last, the current power at a fixed size */
        var e = zLerp(ZE, i, fr), f = fitCanvas(zoomFr, zoomStage.clientHeight), ctx = f.ctx, W = f.W, H = f.H;
        if (!(W > 0)) return;
        ctx.clearRect(0, 0, W, H);
        var S0 = Math.min(W, H) * .62, cx = W / 2, cy = H / 2;
        for (var p = Math.floor(e) - 2; p <= Math.floor(e) + 2; p++) {
          var side = S0 * Math.pow(10, p - e);
          if (side < 10 || side > Math.max(W, H) * 2.4) continue;
          var a = Math.min(1, (side - 10) / 30) * Math.min(1, (Math.max(W, H) * 2.4 - side) / (Math.max(W, H) * 1.2));
          ctx.strokeStyle = inkColor(.22 * a); ctx.lineWidth = 1;
          ctx.strokeRect(Math.round(cx - side / 2) + .5, Math.round(cy - side / 2) + .5, Math.round(side), Math.round(side));
          if (side > 60 && side < Math.min(W, H) * 1.6) cvText(ctx, '10' + zSup(p) + ' m', Math.round(cx - side / 2) + 5, Math.round(cy - side / 2) + 13, { raw: true, color: inkColor(.5 * a), ls: '.5px' });
        }
      }
      function zTo(to, ms) {
        if (zStop) zStop();
        var from = zf;
        zoomStage.classList.add('zooming');
        zStop = labTw(ms, function (k) { zf = from + (to - from) * k; zDraw(); }, function () { zStop = null; zoomStage.classList.remove('zooming'); }, 'io');
      }
      function drawZoom() { zTo(+zoomSlider.value, Math.min(900, 300 + Math.abs(+zoomSlider.value - zf) * 160)); }
      /* pinch, or ctrl and the wheel (a trackpad pinch arrives that way): a continuous zoom that snaps to the nearest stop */
      function zNudge(d) {
        if (zStop) { zStop(); zStop = null; }
        zf = Math.max(0, Math.min(11, zf + d));
        zoomStage.classList.add('zooming'); zDraw();
        clearTimeout(zSnapT);
        zSnapT = setTimeout(function () { zoomSlider.value = Math.round(zf); zoomSlider.dispatchEvent(new Event('input', { bubbles: true })); }, 220);
      }
      zoomStage.addEventListener('wheel', function (e) { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); zNudge(e.deltaY * .012); }, { passive: false });
      var zPts = {}, zPd = 0;
      zoomStage.addEventListener('pointerdown', function (e) { zPts[e.pointerId] = [e.clientX, e.clientY]; });
      zoomStage.addEventListener('pointermove', function (e) {
        if (!zPts[e.pointerId]) return;
        zPts[e.pointerId] = [e.clientX, e.clientY];
        var k = Object.keys(zPts); if (k.length !== 2) { zPd = 0; return; }
        var a = zPts[k[0]], b = zPts[k[1]], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (zPd) zNudge(-Math.log(d / zPd) * 2.2);
        zPd = d;
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { zoomStage.addEventListener(t, function (e) { delete zPts[e.pointerId]; zPd = 0; }); });
      zoomSlider.addEventListener('input', drawZoom);
      labRepaint(zDraw, zoomFr);
      zDraw(); setTimeout(zDraw, 300);
    return {};
  });
})();
