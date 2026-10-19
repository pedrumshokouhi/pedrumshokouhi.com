/* P.S. Lab, No. 03: Six in a row. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<details class="brief"><summary>Brief</summary><p>The table is rebuilt: a European wheel with one green zero. The system waits for six of one color, bets the other, and doubles after every loss so the first win puts you ahead. Find out who ends up with the money.</p></details>\n'
    + '      <div class="rl-mode" role="group" aria-label="What counts as a streak">\n'
    + '        <button type="button" class="rl-seg on" id="rlModeC" aria-pressed="true">Red / Black</button>\n'
    + '        <button type="button" class="rl-seg" id="rlModeP" aria-pressed="false">Odd / Even</button>\n'
    + '      </div>\n'
    + '      <div class="rl-top lx-bleed lx-felt" data-ground="forest" data-cv-local>\n'
    + '        <div class="rl-wheelwrap"><canvas id="rlWheel" style="height:320px"></canvas><span class="rl-flick" aria-hidden="true">Flick the wheel to spin</span></div>\n'
    + '        <div class="rl-side">\n'
    + '          <span class="rl-cap">Last spins · oldest to newest</span>\n'
    + '          <div class="rl-hist" id="rlHist"></div>\n'
    + '          <div class="rl-streak"><span class="k">Current streak</span><span class="v" id="rlStreakV">–</span></div>\n'
    + '          <p class="rl-say" id="rlSay">“Table’s open. The system needs six in a row before a single chip moves.”</p>\n'
    + '        </div>\n'
    + '      </div>\n'
    + '      <div class="btnrow" style="margin-top:14px">\n'
    + '        <button class="ebtn" id="rlGo" type="button">Open the table</button>\n'
    + '        <button class="ebtn2" id="rlAutoB" type="button" aria-pressed="false">Let it play itself</button>\n'
    + '        <button class="ebtn2" id="rlResetB" type="button">Fresh table</button>\n'
    + '      </div>\n'
    + '      <div class="readout">\n'
    + '        <span><span class="k">Bankroll</span><span class="v" id="rlBank">$1,000</span></span>\n'
    + '        <span><span class="k">Next stake</span><span class="v up" id="rlStake">$10</span></span>\n'
    + '        <span><span class="k">Ladder</span><span class="v" id="rlStepV">–</span></span>\n'
    + '        <span><span class="k">Spins</span><span class="v" id="rlSpinsV">0</span></span>\n'
    + '        <span><span class="k">You, lifetime</span><span class="v" id="rlNetV">$0</span></span>\n'
    + '      </div>\n'
    + '      <div class="rl-ladwrap">\n'
    + '        <span class="rl-cap">The doubling ladder · what chasing the first $10 costs</span>\n'
    + '        <div class="rl-ladder" id="rlLad"></div>\n'
    + '        <p class="rl-note">Seven losses deep you have pushed $1,270 across the felt and the system asks for $1,280 more, all to win the ten dollars you wanted at the start. A $1,000 bankroll dies on rung seven. And the green zero belongs to nobody: not red, not black, not odd, not even. When it lands, every bet on the table loses at once.</p>\n'
    + '      </div>\n'
    + '      <div class="btnrow" style="justify-content:center;margin-top:18px">\n'
    + '        <button class="ebtn2" id="rlSim" type="button">Let the machine grind 1,000,000 spins</button>\n'
    + '      </div>\n'
    + '      <div class="rl-simwrap" id="rlSimWrap" style="display:none">\n'
    + '        <div class="lx-bench lx-flat lx-bleed" data-cv-local><canvas id="rlEq" style="height:170px"></canvas></div>\n'
    + '        <div class="readout">\n'
    + '          <span><span class="k">$10 ladders won</span><span class="v" id="rlWonV">–</span></span>\n'
    + '          <span><span class="k">Bankrolls lost</span><span class="v" id="rlBustV">–</span></span>\n'
    + '          <span><span class="k">Longest streak</span><span class="v" id="rlRunV">–</span></span>\n'
    + '          <span><span class="k">Total wagered</span><span class="v" id="rlWagV">–</span></span>\n'
    + '          <span><span class="k">Player net</span><span class="v up" id="rlSimNetV">–</span></span>\n'
    + '        </div>\n'
    + '        <p class="rl-verdict" id="rlVerdict"></p>\n'
    + '      </div>\n'
    + '      <p class="eline" id="rlLine">After six blacks, or 26, red is still 18 in 37. Doubling only chooses how you lose: often and small, or once and completely.</p>';
  LAB_KIT.mount('six-in-a-row', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* shared with No. 39 through m/roulette.js: the wheel order, its reds and the croupier words */
    var RL = window.LAB_RL, RL_ORDER = RL.RL_ORDER, RL_RED = RL.RL_RED, rlColorOf = RL.rlColorOf, rlOpp = RL.rlOpp, rlWord = RL.rlWord, rlFmt = RL.rlFmt;

    /* ---------- 03: six in a row (the casino) ---------- */

      var RL_STAKES = [10, 20, 40, 80, 160, 320, 640, 1280];
      var RL_CUM = [10, 30, 70, 150, 310, 630, 1270, 2550];
      var rlC = document.getElementById('rlWheel');
      var rlSayEl = document.getElementById('rlSay');
      var rlGoB = document.getElementById('rlGo');
      var rlAutoB = document.getElementById('rlAutoB');
      var rlHistEl = document.getElementById('rlHist');
      var rl = { mode: 'color', phase: 'idle', bank: 1000, step: 0, betSide: null, spins: 0,
        hist: [], sKey: null, sLen: 0, net: 0, wonL: 0, busts: 0, zeros: 0, auto: false,
        watchT: null, wheelA: -Math.PI / 2, landed: null };
      function rlKeyOf(n) { if (n === 0) return 'g'; return rl.mode === 'color' ? rlColorOf(n) : (n % 2 ? 'o' : 'e'); }
      function rlStakeAt(step) { return step <= 8 ? RL_STAKES[step - 1] : 1280 * Math.pow(2, step - 8); }
      function rlSay(s) { rlSayEl.textContent = '\u201C' + s + '\u201D'; }

      /* the wheel as an object: the bowl, its shadow and the ball track never move, so they are drawn once and reused */
      var rlBg = null, rlBgK = '';
      function rlStatic(W, H, cx, cy, R) {
        var d = window.devicePixelRatio || 1, k = W + 'x' + H + '@' + d;
        if (rlBg && rlBgK === k) return rlBg;
        var c = document.createElement('canvas'); c.width = Math.round(W * d); c.height = Math.round(H * d);
        var x = c.getContext('2d'); x.scale(d, d);
        /* the shadow it casts on the felt */
        x.save(); x.shadowColor = 'rgba(0,0,0,.34)'; x.shadowBlur = 22; x.shadowOffsetY = 8;
        x.beginPath(); x.arc(cx, cy, R + 15, 0, Math.PI * 2); x.fillStyle = '#1D1712'; x.fill(); x.restore();
        /* the wooden bowl, lit from the upper left */
        var g = x.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
        g.addColorStop(0, '#5A4632'); g.addColorStop(.5, '#34281D'); g.addColorStop(1, '#17120D');
        x.beginPath(); x.arc(cx, cy, R + 15, 0, Math.PI * 2); x.fillStyle = g; x.fill();
        x.lineWidth = 1; x.strokeStyle = 'rgba(214,180,106,.55)'; x.stroke();
        /* the ball track: a polished ring the ball circles before it drops */
        var t = x.createRadialGradient(cx, cy, R, cx, cy, R + 9);
        t.addColorStop(0, '#2A221A'); t.addColorStop(.55, '#4A3B2C'); t.addColorStop(1, '#261E16');
        x.beginPath(); x.arc(cx, cy, R + 9, 0, Math.PI * 2); x.arc(cx, cy, R + 1, 0, Math.PI * 2, true); x.fillStyle = t; x.fill();
        x.beginPath(); x.arc(cx, cy, R + 9, 0, Math.PI * 2); x.strokeStyle = 'rgba(214,180,106,.35)'; x.lineWidth = .8; x.stroke();
        rlBg = c; rlBgK = k;
        return c;
      }
      function rlDraw(ball) {
        rl.ballLast = ball;
        var f = fitCanvas(rlC, 320), ctx = f.ctx, W = f.W, H = 320;
        if (!(W > 0)) return;
        ctx.clearRect(0, 0, W, H);
        var cx = W / 2, cy = 154, R = Math.min(W / 2 - 22, 128);
        if (R < 40) return;
        var TAU = Math.PI * 2, step = TAU / 37;
        ctx.drawImage(rlStatic(W, H, cx, cy, R), 0, 0, W, H);
        for (var i = 0; i < 37; i++) {
          var a0 = rl.wheelA + i * step - step / 2;
          var n = RL_ORDER[i], col = rlColorOf(n);
          ctx.beginPath(); ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, R, a0, a0 + step); ctx.closePath();
          ctx.fillStyle = col === 'g' ? '#1E7A46' : col === 'r' ? '#C0392B' : '#17171A';
          ctx.fill();
          ctx.strokeStyle = 'rgba(214,180,106,.42)'; ctx.lineWidth = .6; ctx.stroke();
          var am = rl.wheelA + i * step;
          ctx.save();
          ctx.translate(cx + Math.cos(am) * R * .87, cy + Math.sin(am) * R * .87);
          ctx.rotate(am + Math.PI / 2);
          ctx.fillStyle = '#F6F4ED'; ctx.font = LBL(9.5);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(n), 0, 0);
          ctx.restore();
        }
        /* the pocket ring's inner edge, and the cone */
        ctx.beginPath(); ctx.arc(cx, cy, R * .74, 0, TAU); ctx.strokeStyle = 'rgba(214,180,106,.4)'; ctx.lineWidth = .8; ctx.stroke();
        var cone = ctx.createRadialGradient(cx - R * .12, cy - R * .14, R * .05, cx, cy, R * .6);
        cone.addColorStop(0, '#4A3B2C'); cone.addColorStop(1, '#1B1510');
        ctx.beginPath(); ctx.arc(cx, cy, R * .6, 0, TAU); ctx.fillStyle = cone; ctx.fill();
        ctx.lineWidth = 1.4; ctx.strokeStyle = '#B08D3E'; ctx.stroke();
        if (rl.landed !== null) {
          var lc = rlColorOf(rl.landed);
          ctx.fillStyle = lc === 'g' ? '#41C98A' : lc === 'r' ? '#FF7A6B' : '#F6F4ED';
          ctx.font = '400 44px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(rl.landed), cx, cy - 7);
          var sub = rl.landed === 0 ? 'ZERO · GREEN' : (lc === 'r' ? 'RED' : 'BLACK') + (rl.landed % 2 ? ' · ODD' : ' · EVEN');
          ctx.save(); ctx.font = LBL(10); ctx.fillStyle = 'rgba(246,244,237,.78)'; ctx.textBaseline = 'middle';
          if ('letterSpacing' in ctx) ctx.letterSpacing = '1.5px';
          ctx.fillText(sub, cx, cy + 22); ctx.restore();
        } else {
          /* idle: the brass turret, four arms and a boss, turning with the wheel */
          var bg = ctx.createLinearGradient(cx - 20, cy - 20, cx + 20, cy + 20);
          bg.addColorStop(0, '#E6C77E'); bg.addColorStop(.55, '#B08D3E'); bg.addColorStop(1, '#7A5E26');
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(rl.wheelA);
          ctx.strokeStyle = bg; ctx.lineCap = 'round'; ctx.lineWidth = 3.2;
          var arm = R * .34;
          ctx.beginPath(); ctx.moveTo(-arm, 0); ctx.lineTo(arm, 0); ctx.moveTo(0, -arm); ctx.lineTo(0, arm); ctx.stroke();
          ctx.fillStyle = bg;
          [[arm, 0], [-arm, 0], [0, arm], [0, -arm]].forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], 3.6, 0, TAU); ctx.fill(); });
          ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.arc(-2, -2, 2.4, 0, TAU); ctx.fillStyle = 'rgba(255,248,226,.55)'; ctx.fill();
          ctx.restore();
        }
        /* the pointer */
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy - R - 13); ctx.lineTo(cx + 7, cy - R - 13); ctx.lineTo(cx, cy - R + 3);
        ctx.closePath(); ctx.fillStyle = '#C9A24E'; ctx.fill();
        if (ball) {
          var bx = cx + Math.cos(ball.a) * ball.r * R, by = cy + Math.sin(ball.a) * ball.r * R;
          var bgr = ctx.createRadialGradient(bx - 1.6, by - 1.8, .5, bx, by, 5.5);
          bgr.addColorStop(0, '#FFFFFF'); bgr.addColorStop(1, '#CFCAB9');
          ctx.beginPath(); ctx.arc(bx, by, 5, 0, TAU); ctx.fillStyle = bgr; ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.stroke();
        }
      }

      var rlAnim = null;
      function rlSpinTo(n, dur, done) {
        var idx = RL_ORDER.indexOf(n);
        var TAU = Math.PI * 2, step = TAU / 37;
        var finalA = -Math.PI / 2 - idx * step;
        var startA = rl.wheelA;
        /* a flick sets the turns and the direction; the pocket was already drawn */
        var w = rl.flick || 0, dir = w < 0 ? -1 : 1, turns = 3 + Math.min(4, Math.abs(w) * 220);
        rl.flick = 0;
        var delta = (((finalA - startA) * dir) % TAU + TAU) % TAU;
        var travel = dir * (TAU * Math.round(turns) + delta);
        var rect = rlC.getBoundingClientRect();
        var reduce = false;
        try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
        if (!(rect.width > 0) || reduce || dur <= 0) {
          rl.wheelA = finalA; rl.landed = n; rlDraw({ a: -Math.PI / 2, r: .74 }); done(); return;
        }
        var t0 = performance.now();
        var ballTravel = TAU * 4.5;
        function frame(ts) {
          var t = Math.min(1, (ts - t0) / dur);
          var e = 1 - Math.pow(1 - t, 3);
          var e2 = 1 - Math.pow(1 - t, 4);
          rl.wheelA = startA + travel * e;
          var ba = -Math.PI / 2 - dir * ballTravel * (1 - e2);
          /* the ball spirals down off the track and rattles once across the frets before it settles */
          var sp = Math.min(1, Math.max(0, (t - .3) / .62)), br = .97 - .23 * sp * sp * (3 - 2 * sp) + (t > .78 ? .028 * Math.abs(Math.sin((t - .78) * 34)) * (1 - t) / .22 : 0);
          rlDraw({ a: ba, r: br });
          if (t < 1) { rlAnim = requestAnimationFrame(frame); }
          else { rl.wheelA = finalA; rl.landed = n; rlDraw({ a: -Math.PI / 2, r: .74 }); done(); }
        }
        rl.landed = null;
        rlAnim = requestAnimationFrame(frame);
      }

      /* the history keeps twenty-two places; a new spin takes the last one and the oldest slides off the left */
      function rlGhosts() {
        var h = '';
        for (var i = 0; i < 22; i++) h += '<span class="rl-chip ghost"></span>';
        rlHistEl.innerHTML = h;
      }
      function rlPushHist(n) {
        rl.hist.push(n);
        if (rl.hist.length > 22) rl.hist.shift();
        var hot = rlHistEl.querySelector('.hot');
        if (hot) hot.classList.remove('hot');
        while (rlHistEl.children.length >= 22) rlHistEl.removeChild(rlHistEl.firstElementChild);
        var chip = document.createElement('span');
        chip.className = 'rl-chip ' + rlColorOf(n) + ' hot';
        chip.textContent = n;
        rlHistEl.appendChild(chip);
      }
      rlGhosts();
      function rlTrackStreak(n) {
        var k = rlKeyOf(n);
        if (k === 'g') { rl.sKey = null; rl.sLen = 0; rl.zeros++; }
        else if (k === rl.sKey) { rl.sLen++; }
        else { rl.sKey = k; rl.sLen = 1; }
        document.getElementById('rlStreakV').textContent = rl.sLen ? rl.sLen + ' \u00D7 ' + rlWord(rl.sKey) : '0';
      }
      function rlPaint() {
        document.getElementById('rlBank').textContent = rlFmt(rl.bank);
        document.getElementById('rlStake').textContent = rlFmt(rl.step > 0 ? rlStakeAt(rl.step) : 10);
        document.getElementById('rlStepV').textContent = rl.step > 0 ? 'RUNG ' + rl.step : '\u2013';
        document.getElementById('rlSpinsV').textContent = rl.spins.toLocaleString('en-US');
        var nv = document.getElementById('rlNetV');
        nv.textContent = rlFmt(rl.net);
        nv.classList.toggle('loss', rl.net < 0);
        var cells = document.getElementById('rlLad').querySelectorAll('.rl-cell');
        for (var i = 0; i < cells.length; i++) {
          cells[i].classList.toggle('on', rl.step === i + 1);
          cells[i].classList.toggle('dead', RL_STAKES[i] > rl.bank);
        }
        /* the chip climbs to the rung it is riding on */
        var pk = document.getElementById('rlPuck'), on = rl.step > 0 && rl.step <= cells.length;
        if (pk) {
          pk.classList.toggle('on', on);
          if (on) { var cl = cells[rl.step - 1]; pk.style.translate = (cl.offsetLeft + cl.offsetWidth / 2) + 'px ' + (cl.offsetTop + .5) + 'px'; }
        }
      }
      (function () {
        var h = '';
        for (var i = 0; i < 8; i++) {
          h += '<div class="rl-cell"><i class="rl-bar" style="--h:' + ((i + 1) / 8) + '"></i><span class="rs">RUNG ' + (i + 1) + '</span><span class="rv">' + rlFmt(RL_STAKES[i]) + '</span><span class="rc">in for ' + rlFmt(RL_CUM[i]) + '</span></div>';
        }
        document.getElementById('rlLad').innerHTML = h + '<i class="rl-puck" id="rlPuck" aria-hidden="true"></i>';
      })();
      rlPaint();

      function rlStartWatch() {
        rl.phase = 'watch';
        rlGoB.disabled = true;
        rlGoB.textContent = 'Watching the wheel\u2026';
        rl.watchT = setInterval(function () {
          var n = Math.floor(Math.random() * 37);
          rl.spins++; rl.wheelA += 0.4; rl.landed = n;
          rlPushHist(n); rlTrackStreak(n); rlDraw(null); rlPaint();
          if (rl.sLen >= 6) {
            clearInterval(rl.watchT); rl.watchT = null;
            rl.betSide = rlOpp(rl.sKey);
            rl.step = 1;
            rl.phase = 'offer';
            rlSay('Six ' + rlWord(rl.sKey).toLowerCase() + 's in a row. The table is leaning in; surely ' + rlWord(rl.betSide).toLowerCase() + ' is due now. The system says start the ladder.');
            rlGoB.disabled = false;
            rlGoB.textContent = 'Bet $10 on ' + rlWord(rl.betSide);
            rlPaint();
            if (rl.auto) setTimeout(rlAdvance, 800);
          }
        }, 60);
      }

      function rlBust(need) {
        rl.phase = 'bust';
        rl.busts++;
        rl.auto = false;
        rlAutoPaint();
        rlSay('The ladder wants ' + rlFmt(need) + ' and you have ' + rlFmt(rl.bank) + '. This is how doubling dies: not slowly, all at once. The streak you were fighting never knew you were there.');
        rlGoB.disabled = false;
        rlGoB.textContent = 'Rack up another $1,000';
        rlPaint();
      }

      function rlBet() {
        var stake = rlStakeAt(rl.step);
        if (stake > rl.bank) { rlBust(stake); return; }
        rl.phase = 'spin';
        rlGoB.disabled = true;
        rlGoB.textContent = 'The ball is rolling\u2026';
        var n = Math.floor(Math.random() * 37);
        rlSpinTo(n, rl.auto ? 900 : 1600, function () {
          rl.spins++;
          rlPushHist(n); rlTrackStreak(n);
          var k = rlKeyOf(n);
          if (k === rl.betSide) {
            rl.bank += stake; rl.net += stake; rl.wonL++;
            var depth = rl.step;
            rlSay(rlWord(rl.betSide).toLowerCase() + ' at last. The whole ladder, rung ' + depth + ' deep, just paid you ten dollars. ' + (depth > 2 ? 'You had ' + rlFmt(10 * (Math.pow(2, depth) - 1) - stake) + ' in the hole to make it.' : 'Easy money. This time.'));
            rl.step = 0; rl.betSide = null;
            rlPaint();
            setTimeout(rlStartWatch, rl.auto ? 700 : 1400);
          } else {
            rl.bank -= stake; rl.net -= stake;
            rl.step++;
            rlPaint();
            var hole = 10 * (Math.pow(2, rl.step - 1) - 1);
            var msg = (n === 0)
              ? 'Zero. Green. Not red, not black, not odd, not even. The house\u2019s own number just ate your ' + rlFmt(stake) + '.'
              : rlWord(k).toLowerCase() + ' again. The streak grows, and your read on the wheel is now ' + rlFmt(hole) + ' poorer.';
            var ns = rlStakeAt(rl.step);
            if (ns > rl.bank) {
              rlBust(ns);
              rlSay(msg + ' The next rung is ' + rlFmt(ns) + ' and the bankroll cannot climb it. Down ' + rlFmt(hole) + ', chasing ten dollars.');
            } else {
              rl.phase = 'offer';
              rlSay(msg + ' The system shrugs and says double: ' + rlFmt(ns) + ' on ' + rlWord(rl.betSide) + '.');
              rlGoB.disabled = false;
              rlGoB.textContent = 'Double: ' + rlFmt(ns) + ' on ' + rlWord(rl.betSide);
              if (rl.auto) setTimeout(rlAdvance, 850);
            }
          }
        });
      }

      function rlAdvance() {
        if (rl.phase === 'idle') { rlStartWatch(); return; }
        if (rl.phase === 'offer') { rlBet(); return; }
        if (rl.phase === 'bust') {
          rl.bank = 1000; rl.step = 0; rl.betSide = null; rl.sKey = null; rl.sLen = 0;
          rlPaint();
          rlStartWatch();
        }
      }
      rlGoB.addEventListener('click', rlAdvance);
      /* the wheel under the hand: drag turns it, a flick bets (or opens the table) */
      var rlDrag = null;
      function rlAng(e) { var r = rlC.getBoundingClientRect(); return Math.atan2(e.clientY - r.top - 154, e.clientX - r.left - r.width / 2); }
      rlC.addEventListener('pointerdown', function (e) {
        if (e.button > 0 || rl.phase === 'spin' || rl.phase === 'watch') return;
        rlDrag = { a: rlAng(e), t: performance.now(), w: 0 };
        try { rlC.setPointerCapture(e.pointerId); } catch (er) {}
      });
      rlC.addEventListener('pointermove', function (e) {
        if (!rlDrag) return;
        var a = rlAng(e), d = a - rlDrag.a, now = performance.now();
        d = ((d + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        rlDrag.w = .6 * rlDrag.w + .4 * d / Math.max(1, now - rlDrag.t); rlDrag.a = a; rlDrag.t = now;
        rl.wheelA += d; rlDraw(null);
      });
      rlC.addEventListener('pointerup', function () {
        var dg = rlDrag; rlDrag = null;
        if (!dg || performance.now() - dg.t > 120 || Math.abs(dg.w) < .004) return;
        if (rl.phase === 'offer' || rl.phase === 'idle' || rl.phase === 'bust') { rl.flick = dg.w; rlAdvance(); }
      });
      rlC.addEventListener('pointercancel', function () { rlDrag = null; });

      function rlAutoPaint() {
        rlAutoB.textContent = rl.auto ? 'Stop auto-play' : 'Let it play itself';
        rlAutoB.setAttribute('aria-pressed', rl.auto ? 'true' : 'false');
      }
      rlAutoB.addEventListener('click', function () {
        rl.auto = !rl.auto;
        rlAutoPaint();
        if (rl.auto && (rl.phase === 'idle' || rl.phase === 'offer' || rl.phase === 'bust')) setTimeout(rlAdvance, 400);
      });

      document.getElementById('rlResetB').addEventListener('click', function () {
        if (rl.watchT) { clearInterval(rl.watchT); rl.watchT = null; }
        if (rlAnim) cancelAnimationFrame(rlAnim);
        rl.phase = 'idle'; rl.bank = 1000; rl.step = 0; rl.betSide = null; rl.spins = 0;
        rl.hist = []; rl.sKey = null; rl.sLen = 0; rl.net = 0; rl.wonL = 0; rl.busts = 0;
        rl.zeros = 0; rl.auto = false; rl.landed = null;
        rlGhosts();
        document.getElementById('rlStreakV').textContent = '\u2013';
        rlAutoPaint(); rlPaint();
        rlGoB.disabled = false;
        rlGoB.textContent = 'Open the table';
        rlSay('Fresh table, fresh $1,000. The wheel remembers none of it.');
        rlDraw(null);
      });

      function rlSetMode(m) {
        if (rl.step > 0) { rlSay('Finish the ladder first. The system does not let you change religions mid-prayer.'); return; }
        rl.mode = m; rl.sKey = null; rl.sLen = 0;
        document.getElementById('rlModeC').classList.toggle('on', m === 'color');
        document.getElementById('rlModeP').classList.toggle('on', m === 'parity');
        document.getElementById('rlModeC').setAttribute('aria-pressed', m === 'color' ? 'true' : 'false');
        document.getElementById('rlModeP').setAttribute('aria-pressed', m === 'parity' ? 'true' : 'false');
        document.getElementById('rlStreakV').textContent = '\u2013';
        rlSay(m === 'color' ? 'Now watching for six reds or six blacks in a row.' : 'Now watching for six odds or six evens in a row. Same wheel, same trap.');
      }
      document.getElementById('rlModeC').addEventListener('click', function () { rlSetMode('color'); });
      document.getElementById('rlModeP').addEventListener('click', function () { rlSetMode('parity'); });

      var rlSimData = null;
      function rlDrawEq() {
        if (!rlSimData) return;
        var c = document.getElementById('rlEq');
        var f = fitCanvas(c, 170), ctx = f.ctx, W = f.W, H = 170;
        if (!(W > 0)) return;
        ctx.clearRect(0, 0, W, H);
        var d = rlSimData.curve, lo = 0, hi = 0, L = 10, R = W - 10;
        for (var i = 0; i < d.length; i++) { if (d[i] < lo) lo = d[i]; if (d[i] > hi) hi = d[i]; }
        if (hi === lo) hi = lo + 1;
        function Y(v) { return 14 + (H - 28) * (1 - (v - lo) / (hi - lo)); }
        function X(k) { return L + (R - L) * k / (d.length - 1); }
        var y0 = Y(0);
        /* below zero is the casino's: the area it took is tinted in the loss colour */
        ctx.save(); ctx.beginPath(); ctx.rect(0, y0, W, H - y0); ctx.clip();
        ctx.beginPath(); ctx.moveTo(X(0), y0);
        for (i = 0; i < d.length; i++) ctx.lineTo(X(i), Y(d[i]));
        ctx.lineTo(X(d.length - 1), y0); ctx.closePath();
        ctx.fillStyle = labColorA('--loss', .1); ctx.fill(); ctx.restore();
        ctx.save(); ctx.strokeStyle = inkColor(.24); ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(L, cvSnap(y0)); ctx.lineTo(R, cvSnap(y0)); ctx.stroke(); ctx.restore();
        ctx.strokeStyle = ACC(); ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.beginPath();
        for (i = 0; i < d.length; i++) { if (i) ctx.lineTo(X(i), Y(d[i])); else ctx.moveTo(X(i), Y(d[i])); }
        ctx.stroke();
        cvText(ctx, '$0', L, y0 - 6);
        var ey = Y(d[d.length - 1]);
        ctx.fillStyle = ACC(); ctx.beginPath(); ctx.arc(X(d.length - 1), ey, 3, 0, 7); ctx.fill();
        cvText(ctx, rlFmt(rlSimData.net), R - 8, ey - 9 < 12 ? ey + 17 : ey - 9,
          { align: 'right', font: '600 12px ' + CV_SANS, color: labColor(rlSimData.net < 0 ? '--loss' : '--gain') });
      }
      document.getElementById('rlSim').addEventListener('click', function () {
        var N = 1000000, bank = 1000, net = 0, wag = 0, won = 0, busts = 0;
        var sKey = null, sLen = 0, runKey = null, runLen = 0, maxRun = 0;
        var betting = false, stake = 0, side = null, curve = [];
        var color = rl.mode === 'color';
        for (var i = 0; i < N; i++) {
          var n = (Math.random() * 37) | 0;
          var k = n === 0 ? 'g' : color ? (RL_RED[n] ? 'r' : 'b') : (n % 2 ? 'o' : 'e');
          if (k === 'g') { runKey = null; runLen = 0; }
          else if (k === runKey) { runLen++; if (runLen > maxRun) maxRun = runLen; }
          else { runKey = k; runLen = 1; }
          if (!betting) {
            if (k === 'g') { sKey = null; sLen = 0; }
            else if (k === sKey) { sLen++; }
            else { sKey = k; sLen = 1; }
            if (sLen >= 6) { side = rlOpp(sKey); stake = 10; betting = true; sKey = null; sLen = 0; }
          } else {
            wag += stake;
            if (k === side) { bank += stake; net += stake; won++; betting = false; }
            else {
              bank -= stake; net -= stake; stake *= 2;
              if (stake > bank) { busts++; bank = 1000; betting = false; }
            }
          }
          if ((i & 511) === 0) curve.push(net);
        }
        curve.push(net);
        rlSimData = { curve: curve, net: net };
        document.getElementById('rlSimWrap').style.display = '';
        document.getElementById('rlWonV').textContent = won.toLocaleString('en-US');
        document.getElementById('rlBustV').textContent = busts.toLocaleString('en-US');
        document.getElementById('rlRunV').textContent = maxRun + ' in a row';
        document.getElementById('rlWagV').textContent = rlFmt(wag);
        var sn = document.getElementById('rlSimNetV');
        sn.textContent = rlFmt(net);
        sn.className = 'v ' + (net < 0 ? 'loss' : 'gain');
        var expEdge = Math.round(wag / 37);
        var v;
        if (net < 0) {
          v = 'One million spins of perfect discipline. The system cashed ' + won.toLocaleString('en-US') + ' tidy ten-dollar wins and still handed the casino ' + rlFmt(-net) + ', because ' + busts.toLocaleString('en-US') + ' times the streak refused to end and the ladder snapped. The edge predicted a loss near ' + rlFmt(expEdge) + ' on this much betting, and the wheel collected. Waiting for six in a row changed when you bet. It never changed what the bet was worth.';
        } else {
          v = 'This particular million finished ahead: ' + rlFmt(net) + '. Runs like this are exactly why the system has survived a century of ruined believers. The house still charged 2.7 cents on every dollar of the ' + rlFmt(wag) + ' wagered; press the button again and watch the average come looking for you.';
        }
        document.getElementById('rlVerdict').textContent = v;
        document.getElementById('rlLine').textContent = 'The longest streak in this million was ' + maxRun + ' in a row. Monte Carlo, 1913, reached 26, and the casino kept every franc that bet on the law of averages. After six blacks the chance of red is 18 in 37. After twenty-six, still 18 in 37.';
        rlDrawEq();
      });
      labRepaint(function () { rlDraw(rl.ballLast || null); rlDrawEq(); rlPaint(); }, rlC);
      setTimeout(function () { rlDraw(null); }, 250);
      setTimeout(function () { rlDraw(null); }, 1800);
    return {};
  });
})();
