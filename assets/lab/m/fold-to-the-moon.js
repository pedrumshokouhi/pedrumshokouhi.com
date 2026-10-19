/* P.S. Lab, No. 04: Fold to the Moon. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="fold-stage lx-fold" id="foldStage"><ol class="fold-rule" id="foldRule" aria-hidden="true"></ol><div class="fold-stack" id="foldBar"></div><span class="fold-cap" aria-hidden="true"><span id="foldMark"></span></span><span class="fold-moon" aria-hidden="true"><i></i>Moon</span></div>\n'
    + '      <input type="range" id="foldN" min="0" max="42" value="0" aria-label="Folds">\n'
    + '      <div class="readout">\n'
    + '        <span><span class="k">Folds</span><span class="v" id="foldC">0</span></span>\n'
    + '        <span><span class="k">Thickness</span><span class="v up" id="foldT">0.1mm</span></span>\n'
    + '      </div>\n'
    + '      <div class="fold-lm" id="foldLm" role="group" aria-label="Jump to the fold that passes each landmark"></div>\n'
    + '      <p class="eline" id="foldLine">Each fold doubles the stack. Fold 27 passes Everest, and fold 42 passes the Moon.</p>';
  LAB_KIT.mount('fold-to-the-moon', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- fold to the moon ---------- */

      var foldSlider = document.getElementById('foldN');
      var foldMarks = [
        [0, 'a sheet of paper'], [3, 'a fingernail'], [7, 'a notebook'], [10, 'a hand'],
        [14, 'taller than you'], [17, 'a building'], [20, 'the Eiffel Tower, roughly'],
        [23, 'most of a mountain'], [27, 'past Everest'], [30, 'the edge of space'],
        [34, 'low orbit is far behind you'], [38, 'a tenth of the way to the Moon'],
        [41, 'more than halfway there'], [42, 'past the Moon. Forty-two folds.']
      ];
      var foldStage = document.getElementById('foldStage'), foldRule = document.getElementById('foldRule'), foldMarkEl = document.getElementById('foldMark');
      /* the rule carries the landmarks the machine already knows; forty-one stays a tick so it never crowds forty-two */
      foldMarks.forEach(function (m) {
        if (!m[0]) return;
        var li = document.createElement('li');
        li.style.setProperty('--n', m[0]);
        li.textContent = m[0];
        li.setAttribute('data-n', m[0]);
        if (m[0] === 41) li.className = 'q';
        foldRule.appendChild(li);
      });
      var foldLastT = null;
      function drawFold() {
        var n = +foldSlider.value;
        var t = 0.0001 * Math.pow(2, n);
        var label = t < 0.001 ? (t * 1000).toFixed(1) + 'mm'
          : t < 1 ? (t * 100).toFixed(1) + 'cm'
          : t < 1000 ? t.toFixed(1) + 'm'
          : Math.round(t / 1000).toLocaleString() + 'km';
        document.getElementById('foldC').textContent = n;
        document.getElementById('foldT').textContent = label;
        var pct = Math.max(2, (n / 42) * 100);
        foldStage.style.setProperty('--p', (pct / 100).toFixed(4));
        var mark = foldMarks[0][1];
        for (var i = 0; i < foldMarks.length; i++) if (n >= foldMarks[i][0]) mark = foldMarks[i][1];
        foldMarkEl.textContent = mark;
        foldStage.classList.toggle('full', n >= 42);
        Array.prototype.forEach.call(foldRule.children, function (li) { li.classList.toggle('on', n >= +li.getAttribute('data-n')); });
        var tEl = document.getElementById('foldT');
        if (foldLastT !== null && foldLastT !== label && !LAB_RM) { tEl.classList.remove('bump'); void tEl.offsetWidth; tEl.classList.add('bump'); }
        foldLastT = label;
        document.getElementById('foldLine').textContent = 'Fold ' + n + ': ' + label + '. That is ' + mark.replace(/\.$/, '') + '. Nobody has folded real paper past 12 times; the arithmetic keeps going.';
        if (n === 0) document.getElementById('foldLine').textContent = 'Each fold doubles the stack. Fold 27 passes Everest, and fold 42 passes the Moon.';
        Array.prototype.forEach.call(foldLm.children, function (b, i) { b.classList.toggle('past', n >= F3L[i][0]); });
        if (F3) F3.go(n, 'Fold ' + n + ' · ' + label);
      }
      /* the landmarks the spec of this machine names, each a chip that sets the slider to the fold that passes it */
      var F3L = [[15, 1.8, 'A person', '1.8 m'], [22, 330, 'The Eiffel Tower', '330 m'], [27, 8849, 'Everest', '8,849 m'], [32, 4.2e5, 'The ISS', 'about 420 km'], [42, 3.78e8, 'The Moon', '384,400 km']];
      var foldLm = document.getElementById('foldLm');
      F3L.forEach(function (L, i) {
        var b = document.createElement('button'); b.type = 'button';
        b.appendChild(document.createTextNode(L[2])); var bb = document.createElement('b'); bb.textContent = L[3]; b.appendChild(bb);
        b.setAttribute('aria-label', L[2] + ', ' + L[3] + '. Fold ' + L[0] + ' passes it.');
        b.addEventListener('click', function () { foldSlider.value = L[0]; foldSlider.dispatchEvent(new Event('input', { bubbles: true })); f3Sel(i); });
        foldLm.appendChild(b);
      });

      /* in 3D: assets/3d/models/fold.js folds the sheet and raises the column; this page keeps the slider, the readouts and the chips */
      var F3 = null;
      function f3Sel(i) {
        Array.prototype.forEach.call(foldLm.children, function (b, k) { b.classList.toggle('on', k === i); });
        if (F3) F3.sel(i);
      }
      foldSlider.addEventListener('input', drawFold);
      drawFold();
      labNear(foldStage, function () {
        lab3d(function (P) { P.need('fold').then(function (d) { if (!F3) { F3 = d.mount(foldStage, { marks: F3L, pick: f3Sel }); drawFold(); } }, function () {}); });
      });
    return {};
  });
})();
