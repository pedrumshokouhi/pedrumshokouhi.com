/* P.S. Lab, No. 38: The punch card. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="lx-desk lx-bench lx-bleed"><div class="punch" id="punchGrid" aria-label="Twenty slots"></div></div>\n'
    + '      <div class="readout">\n'
    + '        <span><span class="k">Slots left</span><span class="v up" id="punchLeft">20</span></span>\n'
    + '      </div>\n'
    + '      <p class="eline" id="punchLine">No undo.</p>\n'
    + '      <button class="newcard" id="newCard" type="button">Start a new card (the old one is spent)</button>';
  LAB_KIT.mount('punch-card', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* 35: the punch card: a slot is punched by holding it (keys and assistive tech punch at once); the chad falls away */
    var grid = document.getElementById('punchGrid');
    var leftEl = document.getElementById('punchLeft');
    var lineEl = document.getElementById('punchLine');
    var newBtn = document.getElementById('newCard');
    var punched = [];
    try { punched = JSON.parse(localStorage.getItem('psPunchCard') || '[]'); } catch (e) {}
    var PUNCH_ARM = LAB_RM ? 350 : 600, punchSlots = [];
    function punchDisarm(s) {
      if (s._arm) { clearTimeout(s._arm); s._arm = 0; }
      s.classList.remove('arming');
      var a = s.querySelector('.arm'); if (a) a.parentNode.removeChild(a);
    }
    function punchChad(s) {
      if (LAB_RM || !(s.offsetWidth > 0)) return;
      var d = s.offsetWidth * .62, c = document.createElement('i');
      c.className = 'punch-chad'; c.setAttribute('aria-hidden', 'true');
      c.style.cssText = 'left:' + (s.offsetLeft + (s.offsetWidth - d) / 2) + 'px;top:' + (s.offsetTop + (s.offsetHeight - d) / 2) + 'px;width:' + d + 'px;height:' + d + 'px;' +
        '--cx:' + Math.round(Math.random() * 36 - 18) + 'px;--cr:' + Math.round(Math.random() * 300 - 150) + 'deg';
      grid.appendChild(c);
      setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 760);
    }
    function punchSlot(i) {
      if (punched.indexOf(i) >= 0) return;
      punched.push(i);
      try { localStorage.setItem('psPunchCard', JSON.stringify(punched)); } catch (e) {}
      renderCard(i);
    }
    function renderCard(justI) {
      punchSlots.forEach(function (s, i) {
        var x = punched.indexOf(i) >= 0;
        s.classList.toggle('x', x);
        if (x) s.setAttribute('aria-disabled', 'true'); else s.removeAttribute('aria-disabled');
      });
      if (justI != null && punchSlots[justI]) {
        var js = punchSlots[justI];
        punchChad(js);
        js.classList.add('just');
        setTimeout(function () { js.classList.remove('just'); }, 620);
      }
      var left = 20 - punched.length;
      leftEl.textContent = left;
      if (left === 20) lineEl.textContent = 'No undo.';
      else if (left > 10) lineEl.textContent = 'Punched. This page will remember, even tomorrow.';
      else if (left > 0) lineEl.textContent = left + ' left. Careful now; whole decades fit in ' + left + ' decisions.';
      else lineEl.textContent = 'That’s the card. Twenty decisions, all spent.';
      newBtn.classList.toggle('show', left === 0);
    }
    (function () {
      grid.innerHTML = '';
      for (var i = 0; i < 20; i++) {
        (function (i) {
          var s = document.createElement('button');
          s.type = 'button'; s.className = 'slot';
          s.innerHTML = '<span aria-hidden="true">\u00D7</span>'; s.setAttribute('aria-label', 'Slot ' + (i + 1));
          /* a key press or an assistive click punches at once; a pointer has to hold */
          s.addEventListener('click', function (e) { if (e.detail === 0) punchSlot(i); });
          s.addEventListener('pointerdown', function (e) {
            if (e.button > 0 || punched.indexOf(i) >= 0) return;
            punchDisarm(s);
            s.classList.add('arming');
            s.insertAdjacentHTML('beforeend', '<svg class="arm" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="17" pathLength="100" style="animation-duration:' + PUNCH_ARM + 'ms"></circle></svg>');
            s._arm = setTimeout(function () { s._arm = 0; punchDisarm(s); punchSlot(i); }, PUNCH_ARM);
          });
          ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { s.addEventListener(ev, function () { punchDisarm(s); }); });
          s.addEventListener('contextmenu', function (e) { e.preventDefault(); });
          punchSlots.push(s);
          grid.appendChild(s);
        })(i);
      }
    })();
    newBtn.addEventListener('click', function () {
      punched = [];
      try { localStorage.setItem('psPunchCard', '[]'); } catch (e) {}
      renderCard();
    });
    renderCard();
    return {};
  });
})();
