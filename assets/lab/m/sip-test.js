/* P.S. Lab, No. 12: The sip test. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="nc-row lx-bench lx-bleed">\n'
    + '        <div class="nc-cup" id="ncCupA"><span class="k">CUP A · OLD COKE</span><div class="nc-glass" aria-hidden="true"><div class="nc-liq"><div class="nc-fill a" id="ncA"><svg class="nc-wave" viewBox="0 0 64 10" preserveAspectRatio="none"><path d="M0 10V4H64V10Z"/></svg></div></div></div><span class="nc-pct" id="ncAP"></span></div>\n'
    + '        <div class="nc-cup" id="ncCupB"><span class="k">CUP B · NEW FORMULA</span><div class="nc-glass" aria-hidden="true"><div class="nc-liq"><div class="nc-fill b" id="ncB"><svg class="nc-wave" viewBox="0 0 64 10" preserveAspectRatio="none"><path d="M0 10V4H64V10Z"/></svg></div></div></div><span class="nc-pct" id="ncBP"></span></div>\n'
    + '      </div>\n'
    + '      <div class="btnrow">\n'
    + '        <button class="ebtn" id="ncSip" type="button">Run 200,000 sip tests</button>\n'
    + '        <button class="ebtn2" id="ncCan" type="button" style="display:none">Listen to the warning</button>\n'
    + '        <button class="br-choice" id="ncGo" type="button" data-k="A" style="display:none">Replace the formula</button>\n'
    + '        <button class="br-choice" id="ncKeep" type="button" data-k="B" style="display:none">Leave it alone</button>\n'
    + '      </div>\n'
    + '      <p class="mh-say" id="ncSay" style="text-align:left;max-width:none;min-height:0;margin:8px 0 0">The counters are waiting. Your researchers have the cups poured.</p>\n'
    + '      <ul class="nc-tl" id="ncTl"></ul>\n'
    + '      <div class="btnrow"><button class="ebtn2" id="ncAgain" type="button" style="display:none">Back to the lab</button></div>\n'
    + '      <p class="eline" id="ncLine">Every metric is a proxy. The tests removed the brand to stay objective, and the brand was the product.</p>';
  LAB_KIT.mount('sip-test', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- the sip test ---------- */

      var ncSip = document.getElementById('ncSip'), ncCan = document.getElementById('ncCan');
      var ncGo = document.getElementById('ncGo'), ncKeep = document.getElementById('ncKeep');
      var ncAgain = document.getElementById('ncAgain'), ncSay = document.getElementById('ncSay');
      var ncTl = document.getElementById('ncTl');
      var ncCnt = null;
      /* the surface settles: a damped sine across the top of each glass, 600ms */
      function ncWave(el) {
        var pa = el.querySelector('path'); if (!pa || LAB_RM) return;
        setTimeout(function () {
          labTw(600, function (e, q) {
            var A = 3.4 * (1 - q) * (1 - q), d = 'M0 10V';
            for (var i = 0; i <= 8; i++) d += (i ? 'L' + i * 8 + ' ' : '') + (5 + A * Math.sin(i / 8 * Math.PI * 2.5 + q * 16)).toFixed(2);
            pa.setAttribute('d', d + 'V10Z');
          }, null, labLin);
        }, 420);
      }
      function ncBars(a, b) {
        var A = document.getElementById('ncA'), Bf = document.getElementById('ncB');
        if (!a && !b) {
          if (ncCnt) ncCnt();
          A.style.removeProperty('transform'); Bf.style.removeProperty('transform');
          document.getElementById('ncCupA').classList.remove('win'); document.getElementById('ncCupB').classList.remove('win');
          document.getElementById('ncAP').textContent = ''; document.getElementById('ncBP').textContent = '';
          return;
        }
        A.style.transform = 'translateY(' + (a ? 100 - a : 101) + '%)';
        Bf.style.transform = 'translateY(' + (b ? 100 - b : 101) + '%)';
        document.getElementById('ncCupA').classList.toggle('win', a > b);
        document.getElementById('ncCupB').classList.toggle('win', b > a);
        if (ncCnt) ncCnt();
        if (!a && !b) { document.getElementById('ncAP').textContent = '0%'; document.getElementById('ncBP').textContent = '0%'; return; }
        ncWave(A); ncWave(Bf);
        ncCnt = labTw(900, function (e) {
          document.getElementById('ncAP').textContent = Math.round(a * e) + '%';
          document.getElementById('ncBP').textContent = Math.round(b * e) + '%';
        });
      }
      function ncTimeline(items, keys) {
        ncTl.innerHTML = '';
        items.forEach(function (t, i) {
          var li = document.createElement('li');
          if (keys && keys.indexOf(i) >= 0) li.className = 'key';
          li.innerHTML = t;
          ncTl.appendChild(li);
          setTimeout(function () { li.classList.add('in'); }, 250 + i * 550);
        });
      }
      ncSip.addEventListener('click', function () {
        ncBars(39, 61);
        ncSip.style.display = 'none';
        labTw(900, function (e) { ncSay.textContent = 'Sips counted: ' + Math.round(2e5 * e).toLocaleString('en-US'); }, function () {
          ncCan.style.display = '';
          ncSay.textContent = 'Two hundred thousand blind sips, and the new formula wins 61 to 39. It beats Pepsi too. The data mountain says the century-old recipe loses. One of your researchers is waving a hand at the back of the room.';
        });
      });
      ncCan.addEventListener('click', function () {
        ncCan.style.display = 'none';
        ncGo.style.display = '';
        ncKeep.style.display = '';
        ncSay.textContent = 'The warning: a sip is not a can. Sweeter always wins a single cold sip; over a whole can it can turn cloying. And no cup in this building was labeled Coke, so not one of the two hundred thousand tests measured what happens when you tell America you are replacing the thing its grandparents drank. The board is waiting.';
      });
      ncGo.addEventListener('click', function () {
        ncGo.style.display = 'none'; ncKeep.style.display = 'none'; ncAgain.style.display = '';
        ncSay.textContent = 'You made the same call the real company made. Here is your year:';
        ncTimeline([
          '<b>April 23, 1985.</b> New Coke launches at Lincoln Center. The formula the sips chose replaces the original outright.',
          '<b>May.</b> The phones melt: the hotline takes up to eight thousand angry calls a day, and headquarters drowns in furious letters.',
          '<b>June.</b> People hoard cases of old Coke and resell them like contraband. A Seattle retiree founds a protest group and sues.',
          '<b>July 11, 1985. Day 79.</b> The company surrenders and brings back Coca-Cola Classic. Television anchors interrupt programming to announce it.',
          '<b>The twist.</b> The stock closes up on the retreat, and Classic sales roar back stronger than before. Some executives are accused of planning the whole thing. The president’s answer: we are not that dumb, and we are not that smart.'
        ], [0, 3]);
        document.getElementById('ncLine').textContent = 'The tests were correct about taste. They never measured what people felt they owned.';
      });
      ncKeep.addEventListener('click', function () {
        ncGo.style.display = 'none'; ncKeep.style.display = 'none'; ncAgain.style.display = '';
        ncSay.textContent = 'You out-decided the real Coca-Cola Company, and you only knew because 1985 already happened. With a 61 percent preference across two hundred thousand tests on their desk, they made the rigorous call, and the rigorous call was wrong. That should bother you a little.';
        ncTimeline([
          '<b>What you dodged:</b> eight thousand calls a day, hoarded cases, a lawsuit from Seattle, and a surrender broadcast on national television after 79 days.'
        ]);
        document.getElementById('ncLine').textContent = 'Every metric is a proxy. The tests removed the brand to stay objective, and the brand was the product.';
      });
      ncAgain.addEventListener('click', function () {
        ncAgain.style.display = 'none'; ncSip.style.display = '';
        ncTl.innerHTML = ''; ncBars(0, 0);
        ncSay.textContent = 'The counters are waiting. Your researchers have the cups poured.';
        document.getElementById('ncLine').textContent = 'Every metric is a proxy. The tests removed the brand to stay objective, and the brand was the product.';
      });
    return {};
  });
})();
