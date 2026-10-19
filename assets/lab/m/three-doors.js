/* P.S. Lab, No. 02: The three doors. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="mh-wall lx-bleed" data-ground="espresso">\n'
    + '      <div class="mh-host">\n'
    + '        <span class="mh-hn">YOUR HOST · MONTY</span>\n'
    + '        <span class="mh-round" id="mhRound">ROUND 1</span>\n'
    + '      </div>\n'
    + '      <div class="mh-doors" id="mhDoors">\n'
    + '        <button type="button" class="mh-door" data-d="0" aria-label="Door 1"><span class="mh-face"><span class="mh-num">1</span></span><span class="mh-behind"></span></button>\n'
    + '        <button type="button" class="mh-door" data-d="1" aria-label="Door 2"><span class="mh-face"><span class="mh-num">2</span></span><span class="mh-behind"></span></button>\n'
    + '        <button type="button" class="mh-door" data-d="2" aria-label="Door 3"><span class="mh-face"><span class="mh-num">3</span></span><span class="mh-behind"></span></button>\n'
    + '      </div>\n'
    + '      <p class="mh-say" id="mhSay">“Three doors. Behind one, a 100× return. Behind two, nothing. Pick, and I’ll show you a little secret about one of the others.”</p>\n'
    + '      </div>\n'
    + '      <div class="mh-actions" id="mhActions">\n'
    + '        <button class="ebtn2" id="mhStay" type="button" style="display:none">Keep my door</button>\n'
    + '        <button class="ebtn" id="mhSwitch" type="button" style="display:none">Switch doors</button>\n'
    + '        <button class="ebtn" id="mhAgain" type="button" style="display:none">Another round</button>\n'
    + '      </div>\n'
    + '      <div class="mh-score">\n'
    + '        <div class="mh-cell"><span class="k">You, staying</span><span class="v" id="mhStayV">–</span><small id="mhStayN">no rounds yet</small></div>\n'
    + '        <div class="mh-cell sw"><span class="k">You, switching</span><span class="v" id="mhSwV">–</span><small id="mhSwN">no rounds yet</small></div>\n'
    + '      </div>\n'
    + '      <div class="btnrow" style="justify-content:center;margin-top:16px">\n'
    + '        <button class="ebtn2" id="mhSim" type="button">Let the machine play 1,000 rounds</button>\n'
    + '      </div>\n'
    + '      <div class="mh-bars" id="mhBars" style="display:none">\n'
    + '        <div class="mh-bar"><div class="mh-fill stay" id="mhBarStay"></div><span class="mh-bl" id="mhBlStay">STAY</span></div>\n'
    + '        <div class="mh-bar"><div class="mh-fill sw" id="mhBarSw"></div><span class="mh-bl" id="mhBlSw">SWITCH</span></div>\n'
    + '      </div>\n'
    + '      <div class="mh-why" id="mhWhy">\n'
    + '        <h4>Why switching wins, explained so a five-year-old nods</h4>\n'
    + '        <div class="mh-steps">\n'
    + '          <div class="mh-step">\n'
    + '            <span class="msn">STEP 1</span>\n'
    + '            <div class="ms-row">\n'
    + '              <div class="ms-col"><span class="msd you">1</span><span class="mspill">1⁄3</span></div>\n'
    + '              <div class="ms-col"><div class="ms-pair"><span class="msd">2</span><span class="msd">3</span></div><span class="mspill hot">2⁄3 together</span></div>\n'
    + '            </div>\n'
    + '            <p>You pick door 1. Your door holds <b>1 chance in 3</b>. The dashed box, doors 2 and 3 together, holds the other <b>2 chances in 3</b>. Nobody argues with this part.</p>\n'
    + '          </div>\n'
    + '          <div class="mh-step">\n'
    + '            <span class="msn">STEP 2</span>\n'
    + '            <div class="ms-row">\n'
    + '              <div class="ms-col"><span class="msd you">1</span><span class="mspill">still 1⁄3</span></div>\n'
    + '              <div class="ms-col"><div class="ms-pair"><span class="msd">2</span><span class="msd x">×</span></div><span class="mspill hot">still 2⁄3</span></div>\n'
    + '            </div>\n'
    + '            <p>Monty opens door 3. Empty, and <b>he knew it</b>; he was never allowed to open yours or the prize. The box does not lose its 2⁄3 just because he showed you which half of it was junk. All of it now sits on door 2.</p>\n'
    + '          </div>\n'
    + '          <div class="mh-step">\n'
    + '            <span class="msn">STEP 3</span>\n'
    + '            <div class="ms-row">\n'
    + '              <div class="ms-col"><span class="msd you">1</span><span class="mspill">1⁄3</span></div>\n'
    + '              <div class="ms-col"><span class="msd win">2</span><span class="mspill hot">2⁄3</span></div>\n'
    + '            </div>\n'
    + '            <p>The real choice: <b>keep 1 door, or take both of the others.</b> Switching means taking both doors, and Monty has already opened the empty one for you.</p>\n'
    + '          </div>\n'
    + '        </div>\n'
    + '        <div class="mh-kid">\n'
    + '          <span class="mh-kid-tag">THE FIVE-YEAR-OLD VERSION</span>\n'
    + '          Three cups, one candy. You grab a cup. Now: keep your one cup, or have <b>both</b> of the other cups? Both. Obviously. That is the whole trick; the host flipping over one empty cup was just him handing you both of his.\n'
    + '        </div>\n'
    + '        <div class="mh-case"><span class="mc p y">1</span><span class="mc x">2</span><span class="mc">3</span><span>Prize behind your door (1 in 3). Switching loses.</span></div>\n'
    + '        <div class="mh-case"><span class="mc y">1</span><span class="mc p">2</span><span class="mc x">3</span><span>Prize behind door two (1 in 3). Monty must open three. <b>Switching wins.</b></span></div>\n'
    + '        <div class="mh-case"><span class="mc y">1</span><span class="mc x">2</span><span class="mc p">3</span><span>Prize behind door three (1 in 3). Monty must open two. <b>Switching wins.</b></span></div>\n'
    + '        <p class="verdict">Two rounds out of three, your first pick was wrong, and on exactly those rounds the door Monty leaves shut is the prize. When Marilyn vos Savant printed this in Parade in 1990, about 10,000 readers wrote in, nearly 1,000 with doctorates, and most said she was wrong. Many readers changed their minds after running the game themselves. The tally above does the same job.</p>\n'
    + '      </div>\n'
    + '      <div class="mh-hundred">\n'
    + '        <h4>Still arguing? Play it with a hundred doors.</h4>\n'
    + '        <p class="mh-hsub">Same rules, bigger room. One prize, ninety-nine empties. Pick any door.</p>\n'
    + '        <div class="mh-wall mh-wall--100 lx-bleed" data-ground="espresso">\n'
    + '        <div class="mh100-grid" id="mh100Grid" aria-label="One hundred doors"></div>\n'
    + '        <p class="mh-say" id="mh100Say">“Go on. Any of the hundred.”</p>\n'
    + '        </div>\n'
    + '        <div class="mh-actions">\n'
    + '          <button class="ebtn" id="mh100Clear" type="button" style="display:none">Let Monty open 98 doors</button>\n'
    + '          <button class="ebtn2" id="mh100Stay" type="button" style="display:none">Keep mine</button>\n'
    + '          <button class="ebtn" id="mh100Switch" type="button" style="display:none">Switch to his door</button>\n'
    + '          <button class="ebtn" id="mh100Again" type="button" style="display:none">Reset the room</button>\n'
    + '        </div>\n'
    + '      </div>\n'
    + '      <p class="eline" id="mhLine">Watch Monty open 98 of 100 doors and the switch stops feeling like a coin flip. Three doors is the same game, smaller.</p>';
  LAB_KIT.mount('three-doors', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- the three doors ---------- */

      var mhDoors = Array.prototype.slice.call(document.querySelectorAll('#mhDoors .mh-door'));
      var mhSay = document.getElementById('mhSay');
      var mhStayB = document.getElementById('mhStay');
      var mhSwB = document.getElementById('mhSwitch');
      var mhAgainB = document.getElementById('mhAgain');
      var mh = { phase: 'pick', prize: 0, pick: -1, opened: -1, other: -1,
                 stayW: 0, stayN: 0, swW: 0, swN: 0, round: 1, stayLossRun: 0, swWinRun: 0 };
      var pickLines = [
        '“Door {p}. Bold. I know exactly where the prize sits, so watch what I do next.”',
        '“Door {p}? I have hosted this game a long time, friend. Let me show you something about one of the others.”',
        '“Door {p}. Locked in. Remember: I never open your door, and I never, ever open the good one.”'
      ];
      var offerLines = [
        '“Door {o}: empty, exactly as I knew it would be. So. Keep door {p}, or take door {q}? I do not make this offer to be kind.”',
        '“And there is door {o}, hiding nothing. Two doors left, and only one of us knows the answer. Keep {p} or switch to {q}?”',
        '“Door {o} was a dud, which is no surprise to me. Your door {p}, or my leftover, door {q}? Choose carefully.”'
      ];
      function fmt(s) {
        return s.replace('{p}', mh.pick + 1).replace('{o}', mh.opened + 1).replace('{q}', mh.other + 1).replace('{p}', mh.pick + 1);
      }
      var mhHost = document.querySelector('#mhDoors').parentNode.querySelector('.mh-host');
      /* the win: fourteen foil points thrown out from the knob */
      function confetti(door) {
        if (LAB_RM) return;
        for (var c = 0; c < 14; c++) {
          var s = document.createElement('span'), a = c / 14 * Math.PI * 2 + Math.random() * .3, r = 42 + Math.random() * 30;
          s.className = 'mh-conf';
          s.style.setProperty('--dx', (Math.cos(a) * r).toFixed(1) + 'px');
          s.style.setProperty('--dy', (Math.sin(a) * r).toFixed(1) + 'px');
          s.style.animationDelay = (c % 3) * 30 + 'ms';
          door.appendChild(s);
          (function (el) { setTimeout(function () { el.remove(); }, 1200); })(s);
        }
      }
      function mhSetBehind(i, win) {
        var b = mhDoors[i].querySelector('.mh-behind');
        b.className = 'mh-behind ' + (win ? 'win' : 'lose');
        b.innerHTML = win ? '<b>100×</b><span>the prize</span>' : '<b>0×</b><span>nothing</span>';
      }
      function mhScoreboard() {
        document.getElementById('mhStayV').textContent = mh.stayN ? Math.round(mh.stayW / mh.stayN * 100) + '%' : '–';
        document.getElementById('mhStayN').textContent = mh.stayN ? mh.stayW + ' won of ' + mh.stayN : 'no rounds yet';
        document.getElementById('mhSwV').textContent = mh.swN ? Math.round(mh.swW / mh.swN * 100) + '%' : '–';
        document.getElementById('mhSwN').textContent = mh.swN ? mh.swW + ' won of ' + mh.swN : 'no rounds yet';
      }
      function mhReset() {
        mh.phase = 'pick'; mh.pick = -1;
        mh.prize = Math.floor(Math.random() * 3);
        mhDoors.forEach(function (d) {
          d.className = 'mh-door'; d.disabled = false;
          d.querySelector('.mh-behind').innerHTML = '';
        });
        mhStayB.style.display = 'none'; mhSwB.style.display = 'none'; mhAgainB.style.display = 'none';
        if (mhHost) mhHost.classList.remove('live');
        document.getElementById('mhRound').textContent = 'ROUND ' + mh.round;
        mhSay.textContent = mh.round === 1
          ? '“Three doors. Behind one, a 100× return. Behind two, nothing. Pick, and I’ll show you a little secret about one of the others.”'
          : '“Round ' + mh.round + '. Same doors, same rules, same host who knows too much. Pick.”';
      }
      mhDoors.forEach(function (d, i) {
        d.addEventListener('click', function () {
          if (mh.phase !== 'pick') return;
          mh.phase = 'offer'; mh.pick = i;
          d.classList.add('picked');
          if (mhHost) mhHost.classList.add('live');
          var opts = [0, 1, 2].filter(function (x) { return x !== i && x !== mh.prize; });
          mh.opened = opts[Math.floor(Math.random() * opts.length)];
          mh.other = [0, 1, 2].filter(function (x) { return x !== i && x !== mh.opened; })[0];
          mhSay.textContent = fmt(pickLines[mh.round % pickLines.length]);
          setTimeout(function () {
            mhSetBehind(mh.opened, false);
            mhDoors[mh.opened].classList.add('open', 'dim');
            mhDoors[mh.opened].disabled = true;
            mhSay.textContent = fmt(offerLines[mh.round % offerLines.length]);
            mhStayB.style.display = '';
            mhSwB.style.display = '';
          }, 650);
        });
      });
      function mhResolve(stayed) {
        if (mh.phase !== 'offer') return;
        mh.phase = 'done';
        var finalPick = stayed ? mh.pick : mh.other;
        var win = finalPick === mh.prize;
        if (stayed) { mh.stayN++; if (win) mh.stayW++; mh.stayLossRun = win ? 0 : mh.stayLossRun + 1; mh.swWinRun = 0; }
        else { mh.swN++; if (win) { mh.swW++; mh.swWinRun++; } else mh.swWinRun = 0; mh.stayLossRun = 0; }
        [0, 1, 2].forEach(function (i) {
          mhSetBehind(i, i === mh.prize);
          mhDoors[i].classList.add('open');
          if (i !== finalPick && i !== mh.prize) mhDoors[i].classList.add('dim');
          mhDoors[i].disabled = true;
        });
        mhDoors.forEach(function (d) { d.classList.remove('picked'); });
        mhDoors[finalPick].classList.add('picked');
        if (win) confetti(mhDoors[finalPick]);
        var line;
        if (stayed && win) line = '“The prize was behind your first pick. Enjoy it; staying only manages that one round in three, and I get the other two.”';
        else if (stayed && !win) line = '“Door ' + (mh.prize + 1) + ', all along. You had one chance in three and you spent it on loyalty.' + (mh.stayLossRun >= 2 ? ' That is ' + mh.stayLossRun + ' losses in a row from staying. The math sends its regards.”' : '”');
        else if (!stayed && win) line = '“Switched straight into the prize. That is the two-in-three door doing its job.' + (mh.swWinRun >= 2 ? ' ' + mh.swWinRun + ' switch wins running. You are becoming a problem for me.”' : ' The tally is keeping receipts.”');
        else line = '“Ah, this was the one round in three where your first guess was right, and you walked away from it. Switching was still the better bet; ask the tally after ten more rounds.”';
        mhSay.textContent = line;
        mhStayB.style.display = 'none'; mhSwB.style.display = 'none';
        mhAgainB.style.display = '';
        if (mhHost) mhHost.classList.remove('live');
        mh.round++;
        mhScoreboard();
        document.getElementById('mhWhy').classList.add('show');
      }
      mhStayB.addEventListener('click', function () { mhResolve(true); });
      mhSwB.addEventListener('click', function () { mhResolve(false); });
      mhAgainB.addEventListener('click', mhReset);
      document.getElementById('mhSim').addEventListener('click', function () {
        var stayW = 0, swW = 0, N = 1000;
        for (var t = 0; t < N; t++) {
          var prize = Math.floor(Math.random() * 3);
          var pick = Math.floor(Math.random() * 3);
          if (pick === prize) stayW++;
          var openable = [0, 1, 2].filter(function (x) { return x !== pick && x !== prize; });
          var opened = openable[Math.floor(Math.random() * openable.length)];
          var other = [0, 1, 2].filter(function (x) { return x !== pick && x !== opened; })[0];
          if (other === prize) swW++;
        }
        var bars = document.getElementById('mhBars');
        bars.style.display = 'block';
        var sp = Math.round(stayW / N * 100), wp = Math.round(swW / N * 100);
        /* the two bars race; the counters run with them, tabular, to the totals already drawn */
        setTimeout(function () {
          document.getElementById('mhBarStay').style.transform = 'scaleX(' + (sp / 100) + ')';
          document.getElementById('mhBarSw').style.transform = 'scaleX(' + (wp / 100) + ')';
          bars.classList.add('go');
          labTw(1100, function (e) {
            document.getElementById('mhBlStay').textContent = 'STAY · ' + Math.round(stayW * e) + '/1000 · ' + Math.round(sp * e) + '%';
            document.getElementById('mhBlSw').textContent = 'SWITCH · ' + Math.round(swW * e) + '/1000 · ' + Math.round(wp * e) + '%';
          });
        }, 60);
        document.getElementById('mhWhy').classList.add('show');
        document.getElementById('mhLine').textContent =
          'One thousand rounds each way, in a blink. The argument behind about 10,000 letters in 1990 settles itself in two bars.';
      });
      mhReset();


    /* ---------- one hundred doors ---------- */

      var g100 = document.getElementById('mh100Grid');
      var say100 = document.getElementById('mh100Say');
      var clearB = document.getElementById('mh100Clear');
      var stay100 = document.getElementById('mh100Stay');
      var sw100 = document.getElementById('mh100Switch');
      var again100 = document.getElementById('mh100Again');
      var st = { phase: 'pick', prize: 0, pick: -1, survivor: -1 };
      var cells = [];
      for (var i100 = 0; i100 < 100; i100++) {
        var b100 = document.createElement('button');
        b100.type = 'button';
        b100.setAttribute('aria-label', 'Door ' + (i100 + 1));
        g100.appendChild(b100);
        cells.push(b100);
      }
      function reset100() {
        st.phase = 'pick'; st.pick = -1; st.survivor = -1;
        st.prize = Math.floor(Math.random() * 100);
        cells.forEach(function (c) { c.className = ''; c.disabled = false; c.style.transitionDelay = ''; });
        clearB.style.display = 'none'; stay100.style.display = 'none';
        sw100.style.display = 'none'; again100.style.display = 'none';
        say100.textContent = '“Go on. Any of the hundred.”';
      }
      cells.forEach(function (c, i) {
        c.addEventListener('click', function () {
          if (st.phase !== 'pick') return;
          st.phase = 'clear'; st.pick = i;
          c.classList.add('pk');
          say100.textContent = '“Door ' + (i + 1) + '. A one percent shot, but I admire the confidence. Now watch me work.”';
          clearB.style.display = '';
        });
      });
      clearB.addEventListener('click', function () {
        if (st.phase !== 'clear') return;
        st.phase = 'opening';
        clearB.style.display = 'none';
        st.survivor = st.pick === st.prize
          ? (function () { var r; do { r = Math.floor(Math.random() * 100); } while (r === st.pick); return r; })()
          : st.prize;
        var toOpen = [];
        for (var k = 0; k < 100; k++) if (k !== st.pick && k !== st.survivor) toOpen.push(k);
        /* the 98 open in a spiral wave out from your pick, 8ms apart; which ones open was settled above */
        var gc = getComputedStyle(g100).gridTemplateColumns.split(' ').length || 20, pr = Math.floor(st.pick / gc), pc = st.pick % gc;
        function ring(k) { var r = Math.floor(k / gc) - pr, c = k % gc - pc; return Math.max(Math.abs(r), Math.abs(c)) + (Math.atan2(r, c) + Math.PI) / (Math.PI * 2.0001); }
        toOpen.sort(function (a, b) { return ring(a) - ring(b); });
        toOpen.forEach(function (k, i) { cells[k].style.transitionDelay = LAB_RM ? '' : (i * 8) + 'ms'; cells[k].classList.add('o'); cells[k].disabled = true; });
        setTimeout(function () {
          if (st.phase !== 'opening') return;
          cells.forEach(function (c) { c.style.transitionDelay = ''; });
          cells[st.survivor].classList.add('hold');
          st.phase = 'offer';
          say100.textContent = '“Ninety-eight doors, all empty, all opened without a moment’s hesitation. And then there is door ' + (st.survivor + 1) + ', which I stepped around very, very carefully. Keep door ' + (st.pick + 1) + ', or take it?”';
          stay100.style.display = '';
          sw100.style.display = '';
        }, LAB_RM ? 0 : toOpen.length * 8 + 420);
      });
      function resolve100(stayed) {
        if (st.phase !== 'offer') return;
        st.phase = 'done';
        var fin = stayed ? st.pick : st.survivor;
        var win = fin === st.prize;
        cells[st.prize].classList.remove('hold');
        cells[st.prize].classList.add('pz');
        say100.textContent = win
          ? (stayed
            ? '“Unbelievable. Your one-in-a-hundred first click was right. Frame this; you will not see it again.”'
            : '“Of course it was door ' + (st.prize + 1) + '. It is the door I refused to touch. Switching wins this room ninety-nine times out of a hundred.”')
          : (stayed
            ? '“It was door ' + (st.prize + 1) + ', the one I tiptoed around while you watched. Your first click carried a one percent chance and you married it anyway.”'
            : '“A one-in-a-hundred heartbreak: your first click was right. Do not let it teach you the wrong lesson; the switch was a 99 percent bet.”');
        stay100.style.display = 'none'; sw100.style.display = 'none';
        again100.style.display = '';
      }
      stay100.addEventListener('click', function () { resolve100(true); });
      sw100.addEventListener('click', function () { resolve100(false); });
      again100.addEventListener('click', reset100);
      reset100();
    return {};
  });
})();
