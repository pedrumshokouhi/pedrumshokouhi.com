/* P.S. Lab, No. 30: The trust machine. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div id="tmHist" class="tm-ledger lx-bench lx-bleed">\n'
    + '        <div class="tm-row"><span class="k">You</span><span class="tm-cells" id="tmRowYou"></span><span class="v up" id="tmYou">0</span></div>\n'
    + '        <div class="tm-row"><span class="k">It</span><span class="tm-cells" id="tmRowIt"></span><span class="v" id="tmIt">0</span></div>\n'
    + '      </div>\n'
    + '      <div class="btnrow">\n'
    + '        <button class="ebtn2" id="tmC" type="button">Cooperate</button>\n'
    + '        <button class="ebtn2" id="tmD" type="button">Betray</button>\n'
    + '      </div>\n'
    + '      <p class="eline" id="tmLine">Round 1 of 10. The machine moves when you do.</p>';
  LAB_KIT.mount('trust-machine', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- trust machine: ten rounds as a two-row ledger, you over it ---------- */

      var tmRound = 0, tmYouS = 0, tmItS = 0, tmMyLast = null, tmDefects = 0, tmOver = false;
      var tmRowY = document.getElementById('tmRowYou'), tmRowI = document.getElementById('tmRowIt');
      (function () {
        var h = '';
        for (var i = 0; i < 10; i++) h += '<i aria-hidden="true"></i>';
        tmRowY.innerHTML = h; tmRowI.innerHTML = h;
      })();
      function tmNext() {
        [tmRowY, tmRowI].forEach(function (r) {
          Array.prototype.forEach.call(r.children, function (c, k) { c.classList.toggle('next', k === tmRound && !tmOver); });
        });
      }
      function tmDot(mine, its) {
        var t = 'You: ' + (mine ? 'cooperated' : 'betrayed') + ' · It: ' + (its ? 'cooperated' : 'betrayed');
        [[tmRowY, mine], [tmRowI, its]].forEach(function (p) {
          var c = p[0].children[tmRound];
          if (!c) return;
          c.className = p[1] ? 'c' : 'b';
          c.removeAttribute('aria-hidden');
          c.setAttribute('role', 'img');
          c.setAttribute('aria-label', t);
          c.title = t;
        });
      }
      function tmPlay(iCoop) {
        if (tmOver) return;
        var itCoop = tmMyLast === null ? true : tmMyLast;
        if (iCoop && itCoop) { tmYouS += 3; tmItS += 3; }
        else if (!iCoop && itCoop) { tmYouS += 5; tmDefects++; }
        else if (iCoop && !itCoop) { tmItS += 5; }
        else { tmYouS += 1; tmItS += 1; tmDefects++; }
        tmDot(iCoop, itCoop);
        tmMyLast = iCoop;
        tmRound++;
        ['tmYou', 'tmIt'].forEach(function (id, k) {
          var el = document.getElementById(id), v = k ? tmItS : tmYouS;
          if (el.textContent === String(v)) return;
          el.textContent = v;
          if (!LAB_RM) { el.classList.remove('flap'); void el.offsetWidth; el.classList.add('flap'); }
        });
        if (tmRound >= 10) {
          tmOver = true;
          var verdict = tmDefects === 0
            ? 'A clean 30-30. You found the best available world: mutual trust, fully banked. '
            : tmDefects <= 3
            ? 'You tested the knife ' + tmDefects + ' time' + (tmDefects > 1 ? 's' : '') + ' and it cut you right back. '
            : 'You betrayed ' + tmDefects + ' times and it matched you nearly move for move. Wars are cheaper unfought. ';
          document.getElementById('tmLine').textContent = verdict +
            'The machine was playing Tit for Tat: start friendly, mirror whatever was done to it, forgive instantly. It won both of Robert Axelrod’s strategy tournaments in 1980, and it is a decent way to live. Refresh the page for a rematch.';
        } else {
          document.getElementById('tmLine').textContent = 'Round ' + (tmRound + 1) + ' of 10. It remembers what you just did.';
        }
        tmNext();
      }
      document.getElementById('tmC').addEventListener('click', function () { tmPlay(true); });
      document.getElementById('tmD').addEventListener('click', function () { tmPlay(false); });
      tmNext();
    return {};
  });
})();
