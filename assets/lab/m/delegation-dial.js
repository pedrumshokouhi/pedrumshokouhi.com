/* P.S. Lab, No. 37: The delegation dial. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="dial-bench lx-bench lx-bleed"><div class="dial-knob" id="dialKnob" aria-hidden="true"><i class="dk-ptr"></i></div>\n'
    + '      <input type="range" id="dialRange" min="0" max="7" value="0" step="1" aria-label="Delegation level"></div>\n'
    + '      <div class="dial-list" id="dialList"></div>\n'
    + '      <p class="eline" id="dialLine">All yours. Heavy, isn’t it.</p>';
  LAB_KIT.mount('delegation-dial', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* 34: the delegation dial: a knob that turns with the range, and turns the range when you drag it */
    var choices = ['What you eat tonight', 'What you read next', 'What you watch', 'What you buy',
      'Where you go', 'Who you meet', 'What you believe'];
    var dialLines = [
      'All yours. Heavy, isn’t it.',
      'Dinner outsourced. Perfectly reasonable.',
      'It reads faster than you anyway.',
      'The queue is excellent. You have not chosen a film in weeks.',
      'It knows your size, your brand, your weak moments. Convenient.',
      'The itinerary is optimal. You would not have picked this place.',
      'Your calendar is full of people it selected. Lovely people.',
      'The dial turned easily, didn’t it. Essay № 011, The Intention Economy, is about who holds it.'
    ];
    var dialList = document.getElementById('dialList');
    var dialRange = document.getElementById('dialRange');
    var dialKnob = document.getElementById('dialKnob');
    choices.forEach(function (c) {
      var row = document.createElement('div');
      row.className = 'dchoice';
      row.innerHTML = '<span>' + c + '</span><span class="owner">you</span>';
      dialList.appendChild(row);
    });
    if (dialKnob) {
      for (var dkI = 0; dkI <= 7; dkI++) {
        var dkTick = document.createElement('b');
        dkTick.style.setProperty('--a', (-135 + dkI * 270 / 7).toFixed(3) + 'deg');
        dialKnob.appendChild(dkTick);
      }
    }
    function drawDial() {
      var v = +dialRange.value;
      Array.prototype.forEach.call(dialList.children, function (row, i) {
        var gone = i < v, was = row.classList.contains('gone');
        row.classList.toggle('gone', gone);
        var ow = row.querySelector('.owner');
        ow.textContent = gone ? 'delegated' : 'you';
        if (was !== gone && !LAB_RM) { ow.classList.remove('flip'); void ow.offsetWidth; ow.classList.add('flip'); }
      });
      if (dialKnob) {
        dialKnob.style.setProperty('--v', v);
        Array.prototype.forEach.call(dialKnob.querySelectorAll('b'), function (t, k) {
          t.classList.toggle('on', k <= v);
          if (k === v && dialKnob._v != null && dialKnob._v !== v && !LAB_RM) { t.classList.remove('hit'); void t.offsetWidth; t.classList.add('hit'); }
        });
        dialKnob._v = v;
      }
      document.getElementById('dialLine').textContent = dialLines[v];
    }
    dialRange.addEventListener('input', drawDial);
    /* the knob turns the range: the angle picks the notch, and the range reports it as if you had dragged it */
    if (dialKnob) {
      var dialDrag = false;
      var dialAt = function (e) {
        var r = dialKnob.getBoundingClientRect();
        var a = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI;
        a = Math.max(-135, Math.min(135, a));
        var vf = (a + 135) / (270 / 7), v = Math.round(vf);
        if (v !== +dialRange.value) { dialRange.value = v; dialRange.dispatchEvent(new Event('input', { bubbles: true })); }
        dialKnob.style.setProperty('--v', vf.toFixed(3));
      };
      dialKnob.addEventListener('pointerdown', function (e) {
        if (e.button > 0) return;
        dialDrag = true; dialKnob.classList.add('drag');
        try { dialKnob.setPointerCapture(e.pointerId); } catch (er) {}
        dialAt(e);
      });
      dialKnob.addEventListener('pointermove', function (e) { if (dialDrag) dialAt(e); });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { dialKnob.addEventListener(ev, function () {
        if (!dialDrag) return;
        dialDrag = false; dialKnob.classList.remove('drag');
        dialKnob.style.setProperty('--v', +dialRange.value);
      }); });
    }
    drawDial();
    return {};
  });
})();
