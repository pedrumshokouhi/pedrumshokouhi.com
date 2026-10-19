/* P.S. Lab, No. 36: The vanishing number. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div id="vnStage" class="vn-stage lx-bleed" data-ground="espresso">\n'
    + '        <div class="vn-digits" id="vnDigits"></div>\n'
    + '        <input id="vnInput" class="vn-input" inputmode="numeric" autocomplete="off" style="display:none" placeholder="Type it back" aria-label="Type the number back">\n'
    + '        <i class="vn-drain" aria-hidden="true"></i>\n'
    + '      </div>\n'
    + '      <div class="btnrow">\n'
    + '        <button class="ebtn" id="vnStart" type="button">Show me a number</button>\n'
    + '        <button class="ebtn2" id="vnCheck" type="button" style="display:none">Check</button>\n'
    + '        <span style="flex:1"></span>\n'
    + '        <span class="readout readout--inline"><span class="k">Digits</span><span class="v up" id="vnLevel">5</span></span>\n'
    + '      </div>\n'
    + '      <p class="eline" id="vnLine">George Miller put the span of working memory at about seven items, plus or minus two, in 1956.</p>';
  LAB_KIT.mount('vanishing-number', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- vanishing number: empty places at rest, the digits arrive one by one, a foil fuse burns for 2.5s ---------- */

      var vnLevel = 5, vnTarget = '';
      var vnStage = document.getElementById('vnStage');
      var vnDigits = document.getElementById('vnDigits');
      var vnInput = document.getElementById('vnInput');
      var vnCheck = document.getElementById('vnCheck');
      var vnStart = document.getElementById('vnStart');
      document.getElementById('vnLevel').textContent = vnLevel;
      function vnSlots(n) {
        var h = '';
        for (var i = 0; i < n; i++) h += '<span class="vn-slot"></span>';
        vnDigits.innerHTML = h;
        vnStage.classList.toggle('vn-long', n > 9);
      }
      function vnShow(str) {
        var h = '';
        for (var i = 0; i < str.length; i++) h += '<span class="vn-d" style="--i:' + i + '">' + str.charAt(i) + '</span>';
        vnDigits.innerHTML = h;
        vnStage.classList.toggle('vn-long', str.length > 9);
      }
      vnSlots(vnLevel);
      vnStart.addEventListener('click', function () {
        vnTarget = '';
        for (var i = 0; i < vnLevel; i++) vnTarget += Math.floor(Math.random() * 10);
        vnStage.classList.remove('ok', 'no', 'draining');
        vnDigits.style.display = '';
        vnShow(vnTarget);
        void vnStage.offsetWidth;
        vnStage.classList.add('draining');
        vnStart.style.display = 'none';
        if (!LAB_RM) setTimeout(function () { vnStage.classList.add('gone'); }, 2150);
        setTimeout(function () {
          vnStage.classList.remove('draining', 'gone');
          vnDigits.style.display = 'none';
          vnInput.style.display = 'block'; vnCheck.style.display = '';
          vnInput.value = ''; vnInput.focus();
        }, LAB_RM ? 2500 : 2560);
      });
      function vnJudge() {
        vnInput.style.display = 'none'; vnCheck.style.display = 'none';
        vnStart.style.display = '';
        var ok = vnInput.value.trim() === vnTarget;
        /* the number comes back so you can see it: framed in foil when you had it, shaken when you did not */
        vnDigits.style.display = '';
        vnShow(vnTarget);
        vnStage.classList.remove('ok', 'no');
        void vnStage.offsetWidth;
        vnStage.classList.add(ok ? 'ok' : 'no');
        if (ok) {
          vnLevel++;
          document.getElementById('vnLevel').textContent = vnLevel;
          var t = vnLevel <= 7 ? 'Correct. Next round: ' + vnLevel + ' digits. The wall is coming.'
            : vnLevel <= 9 ? vnLevel + ' digits now. You are past the typical span of seven.'
            : vnLevel + ' digits. Memory athletes get this far by chunking. Are you chunking?';
          document.getElementById('vnLine').textContent = t;
          vnStart.textContent = 'Next: ' + vnLevel + ' digits';
        } else {
          document.getElementById('vnLine').textContent = 'It was ' + vnTarget + '. Your span: ' + (vnLevel - 1) + ' digits. The classic finding says seven, plus or minus two. You are exactly as human as advertised.';
          vnLevel = 5; document.getElementById('vnLevel').textContent = vnLevel;
          vnStart.textContent = 'Start over at 5';
        }
      }
      vnCheck.addEventListener('click', vnJudge);
      vnInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') vnJudge(); });
    return {};
  });
})();
