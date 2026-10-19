/* P.S. Lab, No. 27: The reaction tax. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div id="rxBox" class="rx-box lx-bleed" data-ground="espresso" role="button" tabindex="0" aria-live="assertive" data-state="idle">Click to begin</div>\n'
    + '      <div class="rx-hist" id="rxHist" aria-hidden="true"><span class="rx-lens"><b>Exchanges</b><span>microseconds</span></span></div>\n'
    + '      <div class="rx-scale" id="rxScale" aria-hidden="true"><span class="rx-band"></span></div>\n'
    + '      <div class="rx-axis" aria-hidden="true"><span>0</span><span>100</span><span>200</span><span>300</span><span>400</span><span>500 ms</span></div>\n'
    + '      <div class="readout">\n'
    + '        <span><span class="k">Your reaction</span><span class="v up" id="rxMs">–</span></span>\n'
    + '        <span><span class="k">Best</span><span class="v" id="rxBest">–</span></span>\n'
    + '      </div>\n'
    + '      <p class="eline" id="rxLine">A fast human needs about a quarter of a second. Exchanges match orders in microseconds.</p>';
  LAB_KIT.mount('reaction-tax', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- reaction tax: the box states live in data-state; every attempt lands on the scale below ---------- */

      var rxBox = document.getElementById('rxBox');
      var rxScale = document.getElementById('rxScale');
      var rxMs = document.getElementById('rxMs');
      var rxBestEl = document.getElementById('rxBest');
      var rxLine = document.getElementById('rxLine');
      var rxState = 'idle', rxTimer = null, rxGo = 0, rxBest = null, rxTouched = false;
      /* the histogram: twenty bins of 25ms under the scale; each attempt drops into its own, the newest in foil */
      var rxHist = document.getElementById('rxHist'), rxBins = [];
      if (rxHist) for (var rxb = 0; rxb < 20; rxb++) { var rxs = document.createElement('span'); rxs.className = 'rx-bin'; rxHist.appendChild(rxs); rxBins.push(rxs); }
      function rxDrop(dt) {
        if (!rxBins.length) return;
        var o = rxHist.querySelector('i.new'); if (o) o.classList.remove('new');
        var c = document.createElement('i'); c.className = 'new';
        rxBins[Math.min(19, Math.floor(dt / 25))].appendChild(c);
      }
      function rxIdle(msg) {
        rxState = 'idle';
        rxBox.dataset.state = 'idle';
        rxBox.textContent = msg || 'Click to begin';
      }
      function rxMark(dt) {
        if (!rxScale) return;
        var ts = rxScale.querySelectorAll('i');
        Array.prototype.forEach.call(ts, function (t) { t.classList.add('old'); });
        if (ts.length >= 12) rxScale.removeChild(ts[0]);
        var t = document.createElement('i');
        t.style.setProperty('--p', Math.min(1, dt / 500).toFixed(4));
        rxScale.appendChild(t);
      }
      function rxHit() {
        /* the box is not a <button>, so it tells the lab it was touched the way a control would */
        if (!rxTouched) { rxTouched = true; try { rxBox.dispatchEvent(new Event('input', { bubbles: true })); } catch (er) {} }
        if (rxState === 'idle') {
          rxState = 'armed';
          rxBox.dataset.state = 'armed';
          rxBox.textContent = 'Wait for it…';
          rxTimer = setTimeout(function () {
            rxState = 'go';
            rxGo = performance.now();
            rxBox.dataset.state = 'go';
            rxBox.textContent = 'NOW';
          }, 1200 + Math.random() * 2200);
        } else if (rxState === 'armed') {
          clearTimeout(rxTimer);
          rxIdle('Too soon. Wait for the change. Again?');
        } else if (rxState === 'go') {
          var dt = Math.round(performance.now() - rxGo);
          rxMs.textContent = dt + 'ms';
          if (rxBest === null || dt < rxBest) { rxBest = dt; rxBestEl.textContent = dt + 'ms'; }
          rxMark(dt); rxDrop(dt);
          var line;
          if (dt < 200) line = 'Fast for a human. Exchanges still match orders in microseconds.';
          else if (dt < 280) line = 'Solidly human. In your ' + dt + ' milliseconds, an exchange matched orders by the thousand. Choose games scored in years.';
          else line = dt + ' milliseconds. The machines finished trading before your finger moved. Your edge is patience.';
          rxLine.textContent = line;
          rxIdle('Again?');
        }
      }
      rxBox.addEventListener('click', rxHit);
      rxBox.addEventListener('keydown', function (e) {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        e.preventDefault();
        if (!e.repeat) rxHit();
      });
    return {};
  });
})();
