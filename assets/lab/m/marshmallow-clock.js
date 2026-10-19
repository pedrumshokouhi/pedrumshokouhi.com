/* P.S. Lab, No. 26: The marshmallow clock. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="mm-stage lx-bench lx-bleed">\n'
    + '        <div class="mm-dial drain" id="mmBar" aria-hidden="true"><svg viewBox="0 0 160 160"><g id="mmTicks"></g><circle class="mm-bed" cx="80" cy="80" r="66"></circle><circle class="mm-arc" id="mmFill" cx="80" cy="80" r="66" pathLength="1000"></circle></svg>\n'
    + '          <span class="mm-mid"><span class="mm-t" id="mmTime">0.0</span><span class="mm-u">seconds held</span></span></div>\n'
    + '        <button class="ebtn" id="mmHold" type="button" aria-pressed="false">Hold me for 30 seconds</button>\n'
    + '      </div>\n'
    + '      <p class="eline" id="mmLine">Mischel’s Stanford children waited up to 15 minutes, and a 2018 replication found the link to later life much weaker than first reported. You only need 30 seconds.</p>';
  LAB_KIT.mount('marshmallow-clock', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- marshmallow clock: a thirty-second ring; the foil runs round it while you hold, and the host types as he talks ---------- */

      var mmHoldB = document.getElementById('mmHold');
      var mmFill = document.getElementById('mmFill');
      var mmBar = document.getElementById('mmBar');
      var mmX = mmHoldB.closest('.exp');
      var mmTimeEl = document.getElementById('mmTime');
      var mmLineEl = document.getElementById('mmLine');
      var mmT0 = null, mmTimer = null, mmDone = false, mmRaf = 0, mmSaid = -1, mmTk = [], mmTn = -1;
      var taunts = [
        [3, 'Good start. Twenty-seven seconds to go.'],
        [8, 'Your email is not going anywhere. Neither are you, apparently.'],
        [13, 'Thirteen seconds. Look anywhere except the button.'],
        [19, 'Think of this as a tiny index fund of willpower. Do not sell.'],
        [25, 'Five seconds. The last stretch is the long one.']
      ];
      /* thirty ticks round the ring, one a second, every fifth a little longer */
      (function () {
        var g = document.getElementById('mmTicks'), h = '';
        for (var i = 0; i < 30; i++) {
          var a = i / 30 * Math.PI * 2, f = i % 5 === 0, r0 = f ? 71 : 72.5, r1 = f ? 79 : 77, c = Math.cos(a), sn = Math.sin(a);
          h += '<line' + (f ? ' class="f"' : '') + ' x1="' + (80 + r0 * c).toFixed(2) + '" y1="' + (80 + r0 * sn).toFixed(2) + '" x2="' + (80 + r1 * c).toFixed(2) + '" y2="' + (80 + r1 * sn).toFixed(2) + '"></line>';
        }
        g.innerHTML = h;
        mmTk = Array.prototype.slice.call(g.querySelectorAll('line'));
      })();
      function mmFillTo(p) {
        p = Math.max(0, Math.min(1, p));
        mmFill.style.strokeDashoffset = (1000 * (1 - p)).toFixed(1);
        mmFill.style.opacity = p > 0 ? 1 : 0;
        var n = p > 0 ? Math.min(30, Math.floor(p * 30) + 1) : 0;
        if (n !== mmTn) { mmTn = n; mmTk.forEach(function (t, i) { t.classList.toggle('on', i < n); }); }
      }
      function mmFrame() {
        if (mmT0 === null) { mmRaf = 0; return; }
        mmFillTo((performance.now() - mmT0) / 30000);
        mmRaf = mmDone ? 0 : requestAnimationFrame(mmFrame);
      }
      function mmHolding(on) {
        if (mmX) mmX.classList.toggle('mm-holding', on);
        mmBar.classList.toggle('drain', !on);
        mmHoldB.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      function mmTick() {
        var s = (performance.now() - mmT0) / 1000;
        mmTimeEl.textContent = Math.min(30, s).toFixed(1);
        for (var i = taunts.length - 1; i >= 0; i--) {
          if (s >= taunts[i][0]) { if (mmSaid !== i) { mmSaid = i; labType(mmLineEl, taunts[i][1]); } break; }
        }
        if (s >= 30 && !mmDone) {
          mmDone = true; clearInterval(mmTimer);
          mmFillTo(1);
          labType(mmLineEl, 'Thirty seconds, held. Mischel’s researchers found the trick was where you point your attention.');
          mmHoldB.textContent = 'Again, but why';
        }
      }
      function mmStart() {
        mmDone = false; mmT0 = performance.now(); mmSaid = -1;
        mmHolding(true);
        clearInterval(mmTimer); mmTimer = setInterval(mmTick, 100);
        if (!mmRaf) mmRaf = requestAnimationFrame(mmFrame);
        labType(mmLineEl, 'Holding. The marshmallow is watching you.');
      }
      mmHoldB.addEventListener('pointerdown', function (e) {
        if (e.button > 0) return;
        e.preventDefault(); mmStart();
      });
      /* keys hold it too: press starts, release stops, repeats are ignored */
      mmHoldB.addEventListener('keydown', function (e) {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat && mmT0 === null) mmStart();
      });
      mmHoldB.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') mmStop(); });
      mmHoldB.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      function mmStop() {
        if (mmT0 !== null) mmHolding(false);
        if (mmT0 === null || mmDone) { mmT0 = null; return; }
        clearInterval(mmTimer);
        var s = (performance.now() - mmT0) / 1000; mmT0 = null;
        mmFillTo(0);
        labType(mmLineEl, 'You let go at ' + s.toFixed(1) + ' seconds. That is your marshmallow number. The original kids at least got a marshmallow.');
      }
      window.addEventListener('pointerup', mmStop);
      window.addEventListener('pointercancel', mmStop);
      mmHoldB.addEventListener('pointerleave', mmStop);
      mmHoldB.addEventListener('blur', mmStop);
    return {};
  });
})();
