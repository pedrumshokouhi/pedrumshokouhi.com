/* P.S. Lab, No. 25: The option clock. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="oc-card lx-bench lx-bleed">\n'
    + '        <div class="oc-head"><span>Option value</span><span id="ocDays">30 days left</span></div>\n'
    + '        <div class="oc-meter">\n'
    + '          <div class="oc-track"><div id="ocInt"></div><div id="ocTime"></div></div>\n'
    + '          <i class="oc-paid" style="left:50%" aria-hidden="true"></i><span class="oc-paid-cap" style="left:50%">$320 paid</span>\n'
    + '        </div>\n'
    + '        <div class="oc-pips" id="ocPips" aria-hidden="true"></div>\n'
    + '        <div class="oc-foot"><span class="oc-lg"><span><i class="oc-sw i" aria-hidden="true"></i>ORANGE: REAL VALUE</span> <span class="oc-dot" aria-hidden="true">·</span> <span><i class="oc-sw t" aria-hidden="true"></i>GRAY: TIME, MELTING</span></span><span id="ocStock">STOCK $100.00</span></div>\n'
    + '      </div>\n'
    + '      <div class="btnrow">\n'
    + '        <button class="ebtn" id="ocStart" type="button">Start the clock</button>\n'
    + '        <button class="ebtn2" id="ocSim" type="button">Run 100 option buyers</button>\n'
    + '        <span style="flex:1"></span>\n'
    + '        <span class="readout readout--inline"><span class="k">Worth</span><span class="v up" id="ocV">$320</span></span>\n'
    + '      </div>\n'
    + '      <p class="eline" id="ocLine">The gray bar only shrinks. The seller collects it while the clock runs.</p>';
  LAB_KIT.mount('option-clock', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- the option clock ---------- */

      var ocTimer = null, ocS = 100, ocD = 30;
      function ocValue(S, d) {
        var intrinsic = Math.max(0, S - 105);
        var tv = 3.2 * Math.sqrt(Math.max(0, d) / 30) * Math.exp(-Math.pow(S - 105, 2) / 260);
        return { i: intrinsic, t: tv, v: (intrinsic + tv) * 100 };
      }
      var ocPips = document.getElementById('ocPips');
      (function () { var h = ''; for (var k = 0; k < 30; k++) h += '<i></i>'; ocPips.innerHTML = h; })();
      var ocMeter = document.querySelector('.oc-meter'), ocLastT = 1;
      function ocPaint() {
        var val = ocValue(ocS, ocD);
        /* one track worth $640: real value from the left in foil, time stacked after it in graphite */
        var fi = Math.max(0, Math.min(1, val.i * 100 / 640)), ft = Math.max(0, Math.min(1 - fi, val.t * 100 / 640));
        document.getElementById('ocInt').style.transform = 'scaleX(' + fi.toFixed(4) + ')';
        document.getElementById('ocTime').style.transform = 'translateX(' + (fi * 100).toFixed(3) + '%) scaleX(' + ft.toFixed(4) + ')';
        /* the time it loses drips off the end of the gray */
        if (ft < ocLastT - .001 && !LAB_RM && ocMeter) {
          var dr = document.createElement('i'); dr.className = 'oc-drip'; dr.style.left = ((fi + ft) * 100).toFixed(2) + '%';
          ocMeter.appendChild(dr); setTimeout(function () { if (dr.parentNode) dr.parentNode.removeChild(dr); }, 760);
        }
        ocLastT = ft;
        Array.prototype.forEach.call(ocPips.children, function (p, k) { p.classList.toggle('spent', k >= ocD); });
        document.getElementById('ocDays').textContent = ocD + ' days left';
        document.getElementById('ocStock').textContent = 'STOCK $' + ocS.toFixed(2);
        document.getElementById('ocV').textContent = '$' + Math.round(val.v);
      }
      document.getElementById('ocStart').addEventListener('click', function () {
        clearInterval(ocTimer);
        ocS = 100; ocD = 30; ocLastT = 1; ocPaint();
        document.getElementById('ocLine').textContent = 'Thirty days on the clock. You paid $320, and all of that price is time. Watch the gray.';
        ocTimer = setInterval(function () {
          ocD--;
          ocS = ocS * Math.exp(0.015 * (Math.random() * 2 - 1));
          ocPaint();
          if (ocD <= 0) {
            clearInterval(ocTimer); ocTimer = null;
            var fin = Math.max(0, ocS - 105) * 100;
            document.getElementById('ocLine').textContent = fin > 320
              ? 'Expired worth $' + Math.round(fin) + '. The stock moved enough to outrun the melt. It usually does not; run the hundred buyers below and see.'
              : fin > 0
              ? 'Expired worth $' + Math.round(fin) + ' against the $320 you paid. The stock went up and you still lost, because time was most of what you bought.'
              : 'Expired worthless. All $320 melted. Nothing went wrong; this is what the gray bar does, and the person who sold it to you knew.';
          }
        }, 380);
      });
      document.getElementById('ocSim').addEventListener('click', function () {
        var win = 0;
        for (var b = 0; b < 100; b++) {
          var S = 100;
          for (var d = 0; d < 30; d++) S = S * Math.exp(0.015 * (Math.random() * 2 - 1));
          if (Math.max(0, S - 105) * 100 > 320) win++;
        }
        document.getElementById('ocLine').textContent = win + ' of 100 buyers ended up ahead; ' + (100 - win) +
          ' paid for time and watched it melt. Options are insurance, and the house that sells insurance usually eats better than the house that buys it.';
      });
      ocPaint();
    return {};
  });
})();
