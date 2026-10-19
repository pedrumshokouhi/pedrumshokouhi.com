/* P.S. Lab, No. 08: The armor problem. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<figure class="ap-plate lx-bench lx-bleed">\n'
    + '        <svg id="apSvg" viewBox="0 0 480 330" role="img" aria-label="Plan view of a four-engine bomber. Holes from the planes that came home gather on the wings, the fuselage and the tail. The engines stay clean."><defs><g id="apShape"><path d="M225 116 40 142c-10 2-14 10-10 18l6 6 189 8zM255 116l185 26c10 2 14 10 10 18l-6 6-189 8z"/><path d="M226 266l-58 14c-7 2-7 12 0 14l58 4zM254 266l58 14c7 2 7 12 0 14l-58 4z"/><path d="M240 16c11 0 15 16 15 36l-1 198c-1 28-8 50-14 62-6-12-13-34-14-62l-1-198c0-20 4-36 15-36z"/><rect x="100" y="94" width="16" height="56" rx="7"/><rect x="160" y="88" width="16" height="56" rx="7"/><rect x="304" y="88" width="16" height="56" rx="7"/><rect x="364" y="94" width="16" height="56" rx="7"/><path class="ap-d" d="M96 93h24M156 87h24M300 87h24M360 93h24M232 46q8-6 16 0M62 158l163 10M418 158l-163 10M240 270v40"/></g></defs><use href="#apShape" class="ap-gh" transform="translate(16 -10)"/><g id="apGhost" class="ap-ghh"></g><use href="#apShape" class="ap-main"/><use href="#apShape" class="ap-land" id="apLand"/><g id="apHoles"></g><text class="ap-gt" x="452" y="40" text-anchor="end">Never came home</text></svg>\n'
    + '        <figcaption class="ap-count" id="apCount">Planes back: 0 of 8</figcaption>\n'
    + '      </figure>\n'
    + '      <div class="btnrow">\n'
    + '        <button class="ebtn2 apBtn" data-a="wings" type="button" aria-pressed="false">Armor the wings</button>\n'
    + '        <button class="ebtn2 apBtn" data-a="fuselage" type="button" aria-pressed="false">The fuselage</button>\n'
    + '        <button class="ebtn2 apBtn" data-a="tail" type="button" aria-pressed="false">The tail</button>\n'
    + '        <button class="ebtn2 apBtn" data-a="engines" type="button" aria-pressed="false">The engines</button>\n'
    + '      </div>\n'
    + '      <p class="eline" id="apLine">Count where the holes are. Then ask which planes never came back to be counted.</p>';
  LAB_KIT.mount('armor-problem', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- armor problem: the planes that came home land one by one and leave their holes on the plan;
       after your choice, a ghost of the ones that never came home appears, hit in the engines ---------- */

      var apDone = false, apSvg = document.getElementById('apSvg'), apHolesG = document.getElementById('apHoles'), apGhost = document.getElementById('apGhost');
      var apLand = document.getElementById('apLand'), apCount = document.getElementById('apCount'), apT = [], apN = 0, AP_NS = 'http://www.w3.org/2000/svg';
      var apSeed = 1943; function apR() { apSeed = (apSeed * 16807) % 2147483647; return (apSeed - 1) / 2147483646; }
      /* a hole somewhere a plane can be hit and still fly home: wings clear of the engines, the middle of the fuselage, the tailplanes */
      function apPt() {
        var u = apR(), x, y, dx, lo, hi;
        if (u < .46) {
          do { x = 46 + apR() * 176; } while (Math.abs(x - 108) < 14 || Math.abs(x - 168) < 14);
          lo = 116 + (225 - x) / 185 * 26 + 4; hi = 166 + (x - 36) / 189 * 8 - 4;
          y = lo + apR() * (hi - lo); if (apR() < .5) x = 480 - x;
        } else if (u < .8) { x = 232 + apR() * 16; y = 152 + apR() * 106; }
        else { dx = 4 + apR() * 50; lo = 266 + dx / 58 * 14 + 3; hi = 298 - dx / 58 * 4 - 3; y = lo + apR() * (hi - lo); x = apR() < .5 ? 226 - dx : 254 + dx; }
        return [x, y];
      }
      function apDot(g, p, k) { var c = document.createElementNS(AP_NS, 'circle'); c.setAttribute('cx', p[0].toFixed(1)); c.setAttribute('cy', p[1].toFixed(1)); c.setAttribute('r', k == null ? 3.4 : 2.6 + apR()); if (k != null) c.setAttribute('data-k', k); g.appendChild(c); return c; }
      for (var apk = 0; apk < 8; apk++) for (var apj = 0; apj < 9; apj++) apDot(apHolesG, apPt(), apk);
      /* what the ghost carries: the engines, and the cockpit */
      apGhost.setAttribute('transform', 'translate(16 -10)');
      [108, 168, 312, 372].forEach(function (ex) { for (var q = 0; q < 4; q++) apDot(apGhost, [ex - 4 + apR() * 8, (ex === 108 || ex === 372 ? 100 : 94) + apR() * 44]); });
      for (var apc = 0; apc < 3; apc++) apDot(apGhost, [235 + apR() * 10, 30 + apR() * 34]);
      function apPlane(k) {
        Array.prototype.forEach.call(apHolesG.querySelectorAll('[data-k="' + k + '"]'), function (c, j) {
          if (LAB_RM) c.classList.add('on'); else apT.push(setTimeout(function () { c.classList.add('on'); }, 150 + j * 26));
        });
        apCount.textContent = 'Planes back: ' + (k + 1) + ' of 8';
        if (!LAB_RM) { apLand.classList.remove('go'); apLand.getBoundingClientRect(); apLand.classList.add('go'); }
      }
      function apRun() {
        if (apN) return;
        for (var k = 0; k < 8; k++) (function (k) { if (LAB_RM) { apN = k + 1; apPlane(k); } else apT.push(setTimeout(function () { apN = k + 1; apPlane(k); }, k * 440)); })(k);
      }
      function apFinish() {
        apT.forEach(clearTimeout); apT = [];
        for (var k = apN; k < 8; k++) apPlane(k);
        apN = 8;
        Array.prototype.forEach.call(apHolesG.children, function (c) { c.classList.add('on'); });
      }
      labNear(apSvg, apRun, '0px 0px -30% 0px');
      document.querySelectorAll('.apBtn').forEach(function (b) {
        b.addEventListener('click', function () {
          if (apDone) return;
          apDone = true;
          apFinish();
          apSvg.classList.add('ghost');
          apCount.textContent = 'Planes back: 8. Planes lost: not on this page.';
          var pick = b.getAttribute('data-a');
          var line;
          if (pick === 'engines') {
            line = 'Correct. You are in the company of one statistician, Abraham Wald. Everyone else armored where the holes were. Wald saw that these were the planes that made it home; the ones hit in the engines never came back to be counted. Armor where the holes are not. Then apply that to every success story you have studied.';
          } else {
            line = 'That is where the holes are, which is the trap. Every hole on this plan came from a plane that made it home, so holes there are survivable. The planes hit in the engines never came back to be drawn. Abraham Wald, a statistician, armored the clean spots instead. Survivorship bias: you are always studying the ones that made it back.';
          }
          document.getElementById('apLine').textContent = line;
          document.querySelectorAll('.apBtn').forEach(function (x) {
            var a = x.getAttribute('data-a');
            if (a === 'engines') x.classList.add('is-answer');
            if (x === b) { x.setAttribute('aria-pressed', 'true'); if (a !== 'engines') x.classList.add('is-wrong'); }
          });
        });
      });
    return {};
  });
})();
