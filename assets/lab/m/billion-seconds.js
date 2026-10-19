/* P.S. Lab, No. 05: A billion seconds. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="bs-seg" role="group">\n'
    + '        <button class="bsBtn" data-n="1000000" type="button" aria-pressed="false">A million</button>\n'
    + '        <button class="bsBtn" data-n="1000000000" type="button" aria-pressed="false">A billion</button>\n'
    + '        <button class="bsBtn" data-n="1000000000000" type="button" aria-pressed="false">A trillion</button>\n'
    + '      </div>\n'
    + '      <div class="bs-scale lx-bench lx-bleed" id="bsScale" aria-hidden="true"></div>\n'
    + '      <div class="readout">\n'
    + '        <span><span class="k">Counting time</span><span class="v up" id="bsTime">–</span></span>\n'
    + '        <span><span class="k">You finish in</span><span class="v" id="bsDate">–</span></span>\n'
    + '        <span><span class="k">Counted so far</span><span class="v" id="bsLive">–</span></span>\n'
    + '      </div>\n'
    + '      <p class="eline" id="bsLine">A million seconds is 11.6 days; a billion is 31.7 years. That is the distance between a millionaire and a billionaire.</p>';
  LAB_KIT.mount('billion-seconds', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- a billion seconds: the three counts on a log axis at rest; a choice zooms the axis to it, and a counter starts ---------- */

      var bsBtns = Array.prototype.slice.call(document.querySelectorAll('.bsBtn')), bsScale = document.getElementById('bsScale');
      var bsLive = document.getElementById('bsLive'), bsX = bsScale.closest('.exp'), bsT0 = 0, bsTimer = 0;
      bsBtns.forEach(function (b) {
        var n = +b.getAttribute('data-n'), row = document.createElement('div');
        row.className = 'bs-row'; row.setAttribute('data-n', n);
        row.innerHTML = '<span class="bs-n">' + n.toLocaleString('en-US') + '</span><span class="bs-tr"><i style="--s:' + (Math.log(n) / Math.log(1e12)).toFixed(4) + '"></i></span><span class="bs-x"></span>';
        bsScale.appendChild(row);
      });
      var bsAx = document.createElement('p'); bsAx.className = 'bs-ax'; bsAx.textContent = 'Log scale: each step is a thousand times the last';
      bsScale.appendChild(bsAx);
      function bsTick() {
        if (bsX._vis === false) return;
        bsLive.textContent = Math.floor((Date.now() - bsT0) / 1000).toLocaleString('en-US');
      }
      bsBtns.forEach(function (b) {
        b.addEventListener('click', function () {
          var n = +b.getAttribute('data-n');
          bsBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          /* to scale: the chosen count fills the bar; the bigger ones run off the edge, the smaller ones shrink to a sliver */
          Array.prototype.forEach.call(bsScale.querySelectorAll('.bs-row'), function (r) {
            var m = +r.getAttribute('data-n'), q = m / n;
            r.classList.toggle('on', m === n); r.classList.toggle('over', q > 1);
            r.querySelector('i').style.setProperty('--s', Math.min(1, q).toFixed(6));
            r.querySelector('.bs-x').textContent = q > 1 ? '×' + q.toLocaleString('en-US') : q < 1 ? '1/' + (1 / q).toLocaleString('en-US') : '';
          });
          bsAx.textContent = 'To scale: ' + b.textContent.toLowerCase() + ' fills the line';
          var secs = n;
          var yrs = secs / 31557600;
          var timeLabel = yrs < 0.1 ? (secs / 86400).toFixed(1) + ' days'
            : yrs < 1000 ? yrs.toFixed(1) + ' years'
            : Math.round(yrs).toLocaleString() + ' years';
          document.getElementById('bsTime').textContent = timeLabel;
          var finish = new Date(Date.now() + secs * 1000);
          var yr = finish.getFullYear();
          document.getElementById('bsDate').textContent = yr > 3000 ? 'the year ' + yr.toLocaleString() : finish.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          /* one number a second, from the moment you chose */
          bsT0 = Date.now(); clearInterval(bsTimer); bsLive.textContent = '0';
          bsTimer = setInterval(bsTick, 1000);
          var line;
          if (n === 1000000) line = 'Eleven and a half days of counting. A million is a household number; you could count your way there on one vacation.';
          else if (n === 1000000000) line = 'Thirty-one years, day and night, no sleep. A billion is a thousand millions.';
          else line = 'Thirty-one thousand years. Lascaux’s paintings are about 17,000 years old; you would still be counting. Every time a headline says trillion, this is what it means.';
          document.getElementById('bsLine').textContent = line;
        });
      });
    return {};
  });
})();
