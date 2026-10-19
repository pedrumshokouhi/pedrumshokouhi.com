/* P.S. Lab, No. 35: Fourth down. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="q-shell lx-bench lx-table lx-bleed">\n'
    + '        <div id="fdTag" class="q-tag">Call 1 of 3</div>\n'
    + '        <div class="fd-chain" id="fdChain" aria-hidden="true"><i></i></div>\n'
    + '        <div class="fd-field" id="fdField" aria-hidden="true"><i class="fd-togo"></i><i class="fd-gain"></i><i class="fd-ball"></i><svg class="fd-call" id="fdCall" viewBox="0 0 1200 34" preserveAspectRatio="none"><path pathLength="100"></path></svg></div>\n'
    + '        <div class="fd-yards" aria-hidden="true"><span style="--x:20">10</span><span style="--x:30">20</span><span style="--x:40">30</span><span style="--x:50">40</span><span style="--x:60">50</span><span style="--x:70">40</span><span style="--x:80">30</span><span style="--x:90">20</span><span style="--x:100">10</span></div>\n'
    + '        <p id="fdText" class="fd-text"></p>\n'
    + '        <div id="fdChoices" class="q-choices"></div>\n'
    + '        <p id="fdReveal" class="q-reveal" style="display:none"></p>\n'
    + '        <div class="btnrow"><button class="ebtn" id="fdNext" type="button" style="display:none">Next call</button></div>\n'
    + '      </div>\n'
    + '      <p class="eline" id="fdLine">Your headset is on, and 60,000 fans will boo the correct call.</p>';
  LAB_KIT.mount('fourth-down', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- fourth down: the situation on a yard strip; the call you made and the right one stay on the table ---------- */

      var fdLevels = [
        { t: 'Fourth and one, your own 45-yard line, tied game in the second quarter.',
          c: ['Punt it away. Field position matters.', 'Go for it.'],
          good: 1, y: 45, g: 46,
          r: 'Teams make fourth-and-one about seven times in ten, and the expected points clearly favor going. Coaches punted it for decades anyway, with the math in plain sight.' },
        { t: 'Fourth and goal from the two-yard line. You are down four points, six minutes left. A field goal leaves you still losing.',
          c: ['Kick the field goal. Take the points.', 'Go for the touchdown.'],
          good: 1, y: 98, g: 100,
          r: 'Down four, three points still leaves you needing a touchdown later, from farther away. The field goal here postpones the problem. Analytics departments now flag this one in bright red.' },
        { t: 'Fourth and seven at the opponent’s 35. Too far for a comfortable field goal, too close to waste a punt. The dreaded no-man’s land.',
          c: ['Punt and pin them deep.', 'Attempt the 52-yard field goal.', 'Go for it.'],
          good: 2, y: 65, g: 72,
          r: 'The punt gains you thirty yards of field position at the cost of the ball, and long field goals miss enough to hand over great position anyway. In no-man’s land the analytics usually say: you have the ball, keep the ball. Possession is the asset.' }
      ];
      var fdI = 0, fdScore = 0;
      var fdChoicesEl = document.getElementById('fdChoices');
      var fdRevealEl = document.getElementById('fdReveal');
      var fdNextBtn = document.getElementById('fdNext');
      var fdField = document.getElementById('fdField');
      function fdIn(el) { if (LAB_RM || !el) return; el.classList.remove('lab-in'); void el.offsetWidth; el.classList.add('lab-in'); }
      var fdQ = fdField ? fdField.parentNode : null, fdCall = document.getElementById('fdCall'), fdT = [];
      if (fdQ) fdQ.classList.add('fd-q');
      function fdAt(y) { if (fdQ) fdQ.style.setProperty('--b', ((10 + y) / 120).toFixed(4)); }
      /* the drive: the chains are set ten yards short of the line to gain, then the ball moves up in three plays and stops short */
      function fdPlace(L) {
        if (!fdQ) return;
        fdT.forEach(clearTimeout); fdT = [];
        fdQ.style.setProperty('--g', ((10 + L.g) / 120).toFixed(4));
        if (fdCall) { fdCall.classList.remove('on'); fdCall.firstChild.setAttribute('d', ''); }
        if (LAB_RM) { fdAt(L.y); return; }
        var y0 = Math.max(4, L.g - 10 - 6);
        fdQ.classList.add('hop');
        fdAt(y0);
        [.42, .78, 1].forEach(function (k, j) { fdT.push(setTimeout(function () { fdAt(y0 + (L.y - y0) * k); }, 160 + j * 260)); });
        fdT.push(setTimeout(function () { fdQ.classList.remove('hop'); }, 160 + 3 * 260));
      }
      /* the call, drawn on the strip: a punt's arc, a kick at the posts, or a run at the line */
      function fdDraw(L, label) {
        if (!fdCall) return;
        var bx = (10 + L.y) * 10, gx = (10 + L.g) * 10, d;
        if (/punt/i.test(label)) d = 'M' + bx + ' 24 Q' + (bx + 230) + ' -16 ' + Math.min(1080, bx + 450) + ' 24';
        else if (/field goal/i.test(label)) d = 'M' + bx + ' 24 Q' + ((bx + 1195) / 2) + ' -20 1195 10';
        else { gx = Math.max(gx + 14, bx + 50); d = 'M' + bx + ' 17 L' + gx + ' 17 M' + (gx - 10) + ' 11 L' + gx + ' 17 L' + (gx - 10) + ' 23'; }
        fdCall.firstChild.setAttribute('d', d);
        fdCall.classList.remove('on'); void fdCall.getBoundingClientRect(); fdCall.classList.add('on');
      }
      function fdShow() {
        var L = fdLevels[fdI];
        document.getElementById('fdTag').textContent = 'Call ' + (fdI + 1) + ' of 3';
        document.getElementById('fdText').innerHTML = L.t;
        fdPlace(L);
        fdChoicesEl.innerHTML = '';
        fdRevealEl.style.display = 'none';
        fdNextBtn.style.display = 'none';
        L.c.forEach(function (label, idx) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'q-opt';
          b.textContent = label;
          b.addEventListener('click', function () {
            if (b.disabled) return;
            var got = idx === L.good;
            if (got) fdScore++;
            fdDraw(L, label);
            var hadFocus = fdChoicesEl.contains(document.activeElement);
            Array.prototype.forEach.call(fdChoicesEl.children, function (x, j) {
              x.disabled = true;
              if (x === b) x.classList.add('q-opt--mine');
              if (j === L.good) x.classList.add('q-opt--right');
            });
            fdRevealEl.innerHTML = (got ? 'The analytics agree with you. ' : 'The stadium agrees with you; the math does not. ') + L.r;
            fdRevealEl.style.display = 'block';
            fdIn(fdRevealEl);
            fdNextBtn.style.display = '';
            fdNextBtn.textContent = fdI >= 2 ? 'Final whistle' : 'Next call';
            if (hadFocus) { try { fdNextBtn.focus({ preventScroll: true }); } catch (er) {} }
          });
          fdChoicesEl.appendChild(b);
        });
        fdIn(document.getElementById('fdText')); fdIn(fdChoicesEl);
      }
      fdNextBtn.addEventListener('click', function () {
        fdI++;
        if (fdI < 3) fdShow();
        else {
          document.getElementById('fdTag').textContent = 'Full time';
          document.getElementById('fdText').textContent = fdScore + ' of 3 calls with the math.';
          fdChoicesEl.innerHTML = '';
          fdRevealEl.innerHTML = 'The pattern across all three: the aggressive call is usually right and always blamable. A punt that fails is fate; a fourth down that fails is the coach’s face on every screen. David Romer’s 2006 paper put a number on it: teams kicked far more often than the expected points supported.';
          fdRevealEl.style.display = 'block';
          fdIn(fdRevealEl);
          fdNextBtn.style.display = 'none';
          document.getElementById('fdLine').textContent = 'Refresh the page to coach another Sunday.';
        }
      });
      fdShow();
    return {};
  });
})();
