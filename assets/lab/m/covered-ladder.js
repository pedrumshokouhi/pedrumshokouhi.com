/* P.S. Lab, No. 39: The covered ladder. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<details class="brief"><summary>Brief</summary><p>Lose $10 and the rule asks for $20. Lose that and you are down $30, so it asks for $40. Then $80, $160, $320, $640. Each bet roughly equals the whole hole, so the hole doubles and the bet doubles with it. Nobody chose to double. Coverage chose it. The martingale is the cheapest ladder that keeps the promise, and this table proves it to the dollar. A bigger bankroll never beats the wheel. It only chooses which rung ruins you, how rarely, and how much you post as collateral to chase $10.</p></details>\n'
    + '      <div class="rl-mode" role="group" aria-label="What counts as a streak">\n'
    + '        <button type="button" class="rl-seg on" id="glModeC" aria-pressed="true">Red / Black</button>\n'
    + '        <button type="button" class="rl-seg" id="glModeP" aria-pressed="false">Odd / Even</button>\n'
    + '      </div>\n'
    + '      <div class="rl-top lx-bleed lx-felt lx-after" data-ground="forest" data-cv-local>\n'
    + '        <div class="rl-wheelwrap"><canvas id="glWheel" style="height:320px"></canvas><span class="rl-flick" aria-hidden="true">Flick the wheel to spin</span></div>\n'
    + '        <div class="rl-side">\n'
    + '          <span class="rl-cap">Last spins · oldest to newest</span>\n'
    + '          <div class="rl-hist" id="glRail"></div>\n'
    + '          <div class="rl-streak"><span class="k">Current streak</span><span class="v" id="glStreakV">–</span></div>\n'
    + '          <p class="rl-say" id="glSay">“After hours. Same wheel, same six-in-a-row rule, one iron demand: every bet covers everything lost, plus ten.”</p>\n'
    + '        </div>\n'
    + '      </div>\n'
    + '      <div class="btnrow" style="margin-top:14px">\n'
    + '        <button class="ebtn" id="glGo" type="button">Open the table</button>\n'
    + '        <button class="ebtn2" id="glAutoB" type="button" aria-pressed="false">Let it play itself</button>\n'
    + '        <button class="ebtn2" id="glResetB" type="button">Fresh table</button>\n'
    + '      </div>\n'
    + '      <div class="readout">\n'
    + '        <span><span class="k">Bankroll</span><span class="v" id="glBank">$1,000</span></span>\n'
    + '        <span><span class="k">Next stake</span><span class="v up" id="glStake">$10</span></span>\n'
    + '        <span><span class="k">Ladder</span><span class="v" id="glStepV">–</span></span>\n'
    + '        <span><span class="k">Spins</span><span class="v" id="glSpinsV">0</span></span>\n'
    + '        <span><span class="k">You, lifetime</span><span class="v" id="glNetV">$0</span></span>\n'
    + '      </div>\n'
    + '      <div class="rl-ladwrap">\n'
    + '        <span class="rl-cap">Your bankroll · it decides which rung kills you, and nothing else</span>\n'
    + '        <div class="rl-bmenu" id="glBMenu"></div>\n'
    + '        <p class="rl-note" id="glTruth"></p>\n'
    + '      </div>\n'
    + '      <div class="rl-ladwrap">\n'
    + '        <span class="rl-cap">The covered ladder · cover the hole plus $10, and watch the rule double itself</span>\n'
    + '        <div class="rl-ladder" id="glLad"></div>\n'
    + '        <p class="rl-note">Every rung keeps the promise: win anywhere and the whole ladder ends exactly $10 ahead. And read the stakes out loud: 10, 20, 40, 80, 160, 320, 640. They are the doubling ladder from Experiment 03, digit for digit, because covering the hole plus ten <i>is</i> doubling, whether you meant it or not. Doubling the bankroll buys one more rung: the busts get rarer, the craters get deeper, and the average gets slightly worse, because deeper ladders push more money across the felt and the wheel taxes every dollar of it. Staying power multiplies the sign of your edge, and on this felt the sign is negative. The green zero still belongs to nobody.</p>\n'
    + '      </div>\n'
    + '      <div class="btnrow" style="justify-content:center;margin-top:18px">\n'
    + '        <button class="ebtn2" id="glSim" type="button">Grind 1,000,000 spins</button>\n'
    + '      </div>\n'
    + '      <div class="rl-simwrap" id="glSimWrap" style="display:none">\n'
    + '        <span class="rl-cap">Two players, identical spins. One doubles blindly; one covers the hole plus $10. Find the second line.</span>\n'
    + '        <div class="lx-bench lx-flat lx-bleed" data-cv-local><canvas id="glEq" style="height:190px"></canvas></div>\n'
    + '        <div class="readout">\n'
    + '          <span><span class="k">Covered: ladders won</span><span class="v" id="glWonV">–</span></span>\n'
    + '          <span><span class="k">Biggest bet the rule demanded</span><span class="v" id="glPyrV">–</span></span>\n'
    + '          <span><span class="k">Covered: bankrolls lost</span><span class="v" id="glBustV">–</span></span>\n'
    + '          <span><span class="k">Doubling: bankrolls lost</span><span class="v" id="glMBustV">–</span></span>\n'
    + '          <span><span class="k">Covered wagered</span><span class="v" id="glWagV">–</span></span>\n'
    + '          <span><span class="k">Covered net</span><span class="v up" id="glSimNetV">–</span></span>\n'
    + '          <span><span class="k">Doubling net, same spins</span><span class="v" id="glMNetV">–</span></span>\n'
    + '          <span><span class="k">Longest streak</span><span class="v" id="glRunV">–</span></span>\n'
    + '          <span><span class="k">Avg per ladder</span><span class="v" id="glAvgV">–</span></span>\n'
    + '        </div>\n'
    + '        <span class="rl-cap gl-histcap">Where the covered ladders ended, $10 kept each time. The red bar is what the promise costs when the streak refuses to break.</span>\n'
    + '        <div class="lx-bench lx-flat lx-bleed" data-cv-local><canvas id="glHistC" style="height:150px"></canvas></div>\n'
    + '        <p class="rl-verdict" id="glVerdict"></p>\n'
    + '      </div>\n'
    + '      <p class="eline" id="glLine">No ladder of any shape changes 18 in 37. The wheel keeps 2.7 cents of every dollar.</p>';
  LAB_KIT.mount('covered-ladder', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* shared with No. 39 through m/roulette.js: the wheel order, its reds and the croupier words */
    var RL = window.LAB_RL, RL_ORDER = RL.RL_ORDER, RL_RED = RL.RL_RED, rlColorOf = RL.rlColorOf, rlOpp = RL.rlOpp, rlWord = RL.rlWord, rlFmt = RL.rlFmt;

    /* ---------- 36: the covered ladder (after hours) ---------- */

      var glC = document.getElementById('glWheel');
      var glSayEl = document.getElementById('glSay');
      var glGoB = document.getElementById('glGo');
      var glAutoB = document.getElementById('glAutoB');
      var glRailEl = document.getElementById('glRail');
      var gl = { mode: 'color', phase: 'idle', bankroll: 1000, bank: 1000, step: 0, betSide: null, spins: 0,
        hist: [], sKey: null, sLen: 0, net: 0, auto: false, watchT: null,
        wheelA: -Math.PI / 2, landed: null };
      function glStakeAt(k) { return 10 * Math.pow(2, k - 1); }
      function glCumAt(n) { return 10 * (Math.pow(2, n) - 1); }
      function glKeyOf(n) { if (n === 0) return 'g'; return gl.mode === 'color' ? rlColorOf(n) : (n % 2 ? 'o' : 'e'); }
      function glSay(s) { glSayEl.textContent = '\u201C' + s + '\u201D'; }

      /* the wheel as an object: the bowl, its one shadow and the ball track never move, so they are drawn once;
         the face (pockets, frets, numerals) is painted once too and turned as an image each frame */
      var glBg = null, glBgK = '', glFace = null, glFaceK = '', glFaceS = 0;
      var glX = glC.closest('.exp');
      function glStatic(W, H, cx, cy, R) {
        var d = window.devicePixelRatio || 1, k = W + 'x' + H + '@' + d;
        if (glBg && glBgK === k) return glBg;
        var c = document.createElement('canvas'); c.width = Math.round(W * d); c.height = Math.round(H * d);
        var x = c.getContext('2d'); x.scale(d, d);
        x.save(); x.shadowColor = 'rgba(0,0,0,.34)'; x.shadowBlur = 22; x.shadowOffsetY = 8;
        x.beginPath(); x.arc(cx, cy, R + 15, 0, Math.PI * 2); x.fillStyle = '#1D1712'; x.fill(); x.restore();
        var g = x.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
        g.addColorStop(0, '#5A4632'); g.addColorStop(.5, '#34281D'); g.addColorStop(1, '#17120D');
        x.beginPath(); x.arc(cx, cy, R + 15, 0, Math.PI * 2); x.fillStyle = g; x.fill();
        x.lineWidth = 1; x.strokeStyle = 'rgba(214,180,106,.55)'; x.stroke();
        var t = x.createRadialGradient(cx, cy, R, cx, cy, R + 9);
        t.addColorStop(0, '#2A221A'); t.addColorStop(.55, '#4A3B2C'); t.addColorStop(1, '#261E16');
        x.beginPath(); x.arc(cx, cy, R + 9, 0, Math.PI * 2); x.arc(cx, cy, R + 1, 0, Math.PI * 2, true); x.fillStyle = t; x.fill();
        x.beginPath(); x.arc(cx, cy, R + 9, 0, Math.PI * 2); x.strokeStyle = 'rgba(214,180,106,.35)'; x.lineWidth = .8; x.stroke();
        glBg = c; glBgK = k;
        return c;
      }
      function glFaceImg(R) {
        var d = window.devicePixelRatio || 1, k = R + '@' + d;
        if (glFace && glFaceK === k) return glFace;
        var S = Math.ceil(2 * R + 4), c = document.createElement('canvas');
        c.width = c.height = Math.round(S * d);
        var x = c.getContext('2d'); x.scale(d, d); x.translate(S / 2, S / 2);
        var TAU = Math.PI * 2, step = TAU / 37;
        for (var i = 0; i < 37; i++) {
          var a0 = i * step - step / 2, n = RL_ORDER[i], col = rlColorOf(n);
          x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, R, a0, a0 + step); x.closePath();
          x.fillStyle = col === 'g' ? '#1E7A46' : col === 'r' ? '#C0392B' : '#17171A'; x.fill();
          x.strokeStyle = 'rgba(214,180,106,.42)'; x.lineWidth = .6; x.stroke();
          var am = i * step;
          x.save(); x.translate(Math.cos(am) * R * .87, Math.sin(am) * R * .87); x.rotate(am + Math.PI / 2);
          x.fillStyle = '#F6F4ED'; x.font = LBL(9.5); x.textAlign = 'center'; x.textBaseline = 'middle';
          x.fillText(String(n), 0, 0); x.restore();
        }
        x.beginPath(); x.arc(0, 0, R * .74, 0, TAU); x.strokeStyle = 'rgba(214,180,106,.4)'; x.lineWidth = .8; x.stroke();
        glFace = c; glFaceK = k; glFaceS = S;
        return c;
      }
      function glDraw(ball) {
        gl.ballLast = ball;
        var f = fitCanvas(glC, 320), ctx = f.ctx, W = f.W, H = 320;
        if (!(W > 0)) return;
        ctx.clearRect(0, 0, W, H);
        var cx = W / 2, cy = 154, R = Math.min(W / 2 - 22, 128);
        if (R < 40) return;
        var TAU = Math.PI * 2;
        ctx.drawImage(glStatic(W, H, cx, cy, R), 0, 0, W, H);
        var face = glFaceImg(R);
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(gl.wheelA); ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(face, -glFaceS / 2, -glFaceS / 2, glFaceS, glFaceS); ctx.restore();
        /* the cone stays lit from the upper left while the wheel turns under it */
        var cone = ctx.createRadialGradient(cx - R * .12, cy - R * .14, R * .05, cx, cy, R * .6);
        cone.addColorStop(0, '#4A3B2C'); cone.addColorStop(1, '#1B1510');
        ctx.beginPath(); ctx.arc(cx, cy, R * .6, 0, TAU); ctx.fillStyle = cone; ctx.fill();
        ctx.lineWidth = 1.4; ctx.strokeStyle = '#B08D3E'; ctx.stroke();
        if (gl.landed !== null) {
          var lc = rlColorOf(gl.landed);
          ctx.fillStyle = lc === 'g' ? '#41C98A' : lc === 'r' ? '#FF7A6B' : '#F6F4ED';
          ctx.font = '400 44px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(gl.landed), cx, cy - 7);
          var sub = gl.landed === 0 ? 'ZERO · GREEN' : (lc === 'r' ? 'RED' : 'BLACK') + (gl.landed % 2 ? ' · ODD' : ' · EVEN');
          ctx.save(); ctx.font = LBL(10); ctx.fillStyle = 'rgba(246,244,237,.78)'; ctx.textBaseline = 'middle';
          if ('letterSpacing' in ctx) ctx.letterSpacing = '1.5px';
          ctx.fillText(sub, cx, cy + 22); ctx.restore();
        } else {
          /* idle: the gilded turret, four arms and a boss, turning with the wheel */
          var bg = ctx.createLinearGradient(cx - 20, cy - 20, cx + 20, cy + 20);
          bg.addColorStop(0, '#E6C77E'); bg.addColorStop(.55, '#B08D3E'); bg.addColorStop(1, '#7A5E26');
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(gl.wheelA);
          ctx.strokeStyle = bg; ctx.lineCap = 'round'; ctx.lineWidth = 3.2;
          var arm = R * .34;
          ctx.beginPath(); ctx.moveTo(-arm, 0); ctx.lineTo(arm, 0); ctx.moveTo(0, -arm); ctx.lineTo(0, arm); ctx.stroke();
          ctx.fillStyle = bg;
          [[arm, 0], [-arm, 0], [0, arm], [0, -arm]].forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], 3.6, 0, TAU); ctx.fill(); });
          ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.arc(-2, -2, 2.4, 0, TAU); ctx.fillStyle = 'rgba(255,248,226,.55)'; ctx.fill();
          ctx.restore();
        }
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

      var glAnim = null;
      function glSpinTo(n, dur, done) {
        var idx = RL_ORDER.indexOf(n);
        var TAU = Math.PI * 2, step = TAU / 37;
        var finalA = -Math.PI / 2 - idx * step;
        var startA = gl.wheelA;
        /* a flick sets the turns and the direction; the pocket was already drawn */
        var w = gl.flick || 0, dir = w < 0 ? -1 : 1, turns = 3 + Math.min(4, Math.abs(w) * 220);
        gl.flick = 0;
        var delta = (((finalA - startA) * dir) % TAU + TAU) % TAU;
        var travel = dir * (TAU * Math.round(turns) + delta);
        var rect = glC.getBoundingClientRect();
        var reduce = false;
        try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
        if (!(rect.width > 0) || reduce || dur <= 0) {
          gl.wheelA = finalA; gl.landed = n; glDraw({ a: -Math.PI / 2, r: .74 }); done(); return;
        }
        var t0 = performance.now();
        var ballTravel = TAU * 4.5;
        function frame(ts) {
          var t = Math.min(1, (ts - t0) / dur);
          var e = 1 - Math.pow(1 - t, 3);
          var e2 = 1 - Math.pow(1 - t, 4);
          gl.wheelA = startA + travel * e;
          var ba = -Math.PI / 2 - dir * ballTravel * (1 - e2);
          /* the ball spirals down off the track and rattles once across the frets before it settles */
          var sp = Math.min(1, Math.max(0, (t - .3) / .62)), br = .97 - .23 * sp * sp * (3 - 2 * sp) + (t > .78 ? .028 * Math.abs(Math.sin((t - .78) * 34)) * (1 - t) / .22 : 0);
          glDraw({ a: ba, r: br });
          if (t < 1) { glAnim = requestAnimationFrame(frame); }
          else { gl.wheelA = finalA; gl.landed = n; glDraw({ a: -Math.PI / 2, r: .74 }); done(); }
        }
        gl.landed = null;
        glAnim = requestAnimationFrame(frame);
      }

      function glGhosts() {
        var h = '';
        for (var i = 0; i < 22; i++) h += '<span class="rl-chip ghost"></span>';
        glRailEl.innerHTML = h;
      }
      function glPushRail(n) {
        gl.hist.push(n);
        if (gl.hist.length > 22) gl.hist.shift();
        var hot = glRailEl.querySelector('.hot');
        if (hot) hot.classList.remove('hot');
        while (glRailEl.children.length >= 22) glRailEl.removeChild(glRailEl.firstElementChild);
        var chip = document.createElement('span');
        chip.className = 'rl-chip ' + rlColorOf(n) + ' hot';
        chip.textContent = n;
        glRailEl.appendChild(chip);
      }
      glGhosts();
      function glTrackStreak(n) {
        var k = glKeyOf(n);
        if (k === 'g') { gl.sKey = null; gl.sLen = 0; }
        else if (k === gl.sKey) { gl.sLen++; }
        else { gl.sKey = k; gl.sLen = 1; }
        document.getElementById('glStreakV').textContent = gl.sLen ? gl.sLen + ' \u00D7 ' + rlWord(gl.sKey) : '0';
      }
      function glPaint() {
        document.getElementById('glBank').textContent = rlFmt(gl.bank);
        document.getElementById('glStake').textContent = rlFmt(gl.step > 0 ? glStakeAt(gl.step) : 10);
        document.getElementById('glStepV').textContent = gl.step > 0 ? 'RUNG ' + gl.step : '\u2013';
        document.getElementById('glSpinsV').textContent = gl.spins.toLocaleString('en-US');
        var nv = document.getElementById('glNetV');
        nv.textContent = rlFmt(gl.net);
        nv.classList.toggle('loss', gl.net < 0);
        var cells = document.getElementById('glLad').children;
        for (var i = 0; i < cells.length; i++) {
          cells[i].classList.toggle('on', gl.step === i + 1);
          cells[i].classList.toggle('dead', glStakeAt(i + 1) > gl.bank);
        }
      }
      (function () {
        var h = '';
        for (var i = 1; i <= 8; i++) {
          var pays = glStakeAt(i) - glCumAt(i - 1);
          h += '<div class="rl-cell"><i class="rl-bar" style="--h:' + (i / 8) + '"></i><span class="rs">RUNG ' + i + '</span><span class="rv">' + rlFmt(glStakeAt(i)) + '</span><span class="rw' + (pays < 0 ? ' neg' : '') + '">win pays ' + (pays >= 0 ? '+' : '') + rlFmt(pays) + '</span><span class="rc">in for ' + rlFmt(glCumAt(i)) + '</span></div>';
        }
        document.getElementById('glLad').innerHTML = h;
      })();

      function glStartWatch() {
        gl.phase = 'watch';
        glGoB.disabled = true;
        glGoB.textContent = 'Watching the wheel\u2026';
        gl.watchT = setInterval(function () {
          var n = Math.floor(Math.random() * 37);
          gl.spins++; gl.wheelA += 0.4; gl.landed = n;
          glPushRail(n); glTrackStreak(n); if (!glX || glX._vis !== false) glDraw(null); else gl.ballLast = null; glPaint();
          if (gl.sLen >= 6) {
            clearInterval(gl.watchT); gl.watchT = null;
            gl.betSide = rlOpp(gl.sKey);
            gl.step = 1;
            gl.phase = 'offer';
            glSay('Six ' + rlWord(gl.sKey).toLowerCase() + 's in a row. The rule arms itself: $10 on ' + rlWord(gl.betSide).toLowerCase() + ', and from here every bet must cover the whole hole plus ten. Nobody said the word double. Watch it appear anyway.');
            glGoB.disabled = false;
            glGoB.textContent = 'Bet $10 on ' + rlWord(gl.betSide);
            glPaint();
            if (gl.auto) setTimeout(glAdvance, 800);
          }
        }, 60);
      }

      function glBust(need) {
        gl.phase = 'bust';
        gl.auto = false;
        glAutoPaint();
        glSay('The rule demands ' + rlFmt(need) + ' and you have ' + rlFmt(gl.bank) + '. You demanded coverage, coverage demanded doubling, and doubling outgrew the money. Down ' + rlFmt(glCumAt(gl.step - 1)) + ', chasing ten dollars. The bankroll only chose the size of the funeral.');
        glGoB.disabled = false;
        glGoB.textContent = 'Rack up another ' + rlFmt(gl.bankroll);
        glPaint();
      }

      function glBet() {
        var stake = glStakeAt(gl.step);
        if (stake > gl.bank) { glBust(stake); return; }
        gl.phase = 'spin';
        glGoB.disabled = true;
        glGoB.textContent = 'The ball is rolling\u2026';
        var n = Math.floor(Math.random() * 37);
        glSpinTo(n, gl.auto ? 900 : 2000, function () {
          gl.spins++;
          glPushRail(n); glTrackStreak(n);
          var k = glKeyOf(n);
          if (k === gl.betSide) {
            gl.bank += stake; gl.net += stake;
            var pays = stake - glCumAt(gl.step - 1);
            glSay(rlWord(gl.betSide).charAt(0) + rlWord(gl.betSide).slice(1).toLowerCase() + ' on rung ' + gl.step + '. The promise holds: hole erased, exactly ' + rlFmt(pays) + ' ahead. ' + (gl.step >= 4 ? 'It took ' + rlFmt(stake) + ' on the felt to win ten dollars. That is the exchange rate of a guarantee.' : 'Cheap this time. The rule remembers how to get expensive.'));
            gl.step = 0; gl.betSide = null;
            glPaint();
            setTimeout(glStartWatch, gl.auto ? 700 : 1600);
          } else {
            gl.bank -= stake; gl.net -= stake;
            gl.step++;
            glPaint();
            var hole = glCumAt(gl.step - 1);
            var msg = (n === 0)
              ? 'Zero. Green. Nobody\u2019s number, everybody\u2019s loss. It just ate your ' + rlFmt(stake) + '.'
              : rlWord(k).charAt(0) + rlWord(k).slice(1).toLowerCase() + ' again. Down ' + rlFmt(hole) + ' on this ladder.';
            var ns = glStakeAt(gl.step);
            if (ns > gl.bank) {
              glBust(ns);
            } else {
              gl.phase = 'offer';
              glSay(msg + ' To cover that plus ten, the rule demands ' + rlFmt(ns) + '. Notice it just doubled. It always will; that is what covering costs.');
              glGoB.disabled = false;
              glGoB.textContent = 'Cover: ' + rlFmt(ns) + ' on ' + rlWord(gl.betSide);
              if (gl.auto) setTimeout(glAdvance, 850);
            }
          }
        });
      }

      function glAdvance() {
        if (gl.phase === 'idle') { glStartWatch(); return; }
        if (gl.phase === 'offer') { glBet(); return; }
        if (gl.phase === 'bust') {
          gl.bank = gl.bankroll; gl.step = 0; gl.betSide = null; gl.sKey = null; gl.sLen = 0;
          glPaint();
          glStartWatch();
        }
      }
      glGoB.addEventListener('click', glAdvance);

      function glAutoPaint() {
        glAutoB.textContent = gl.auto ? 'Stop auto-play' : 'Let it play itself';
        glAutoB.setAttribute('aria-pressed', gl.auto ? 'true' : 'false');
      }
      /* the wheel under the hand: drag turns it, a flick bets (or opens the table) */
      var glDrag = null;
      function glAng(e) { var r = glC.getBoundingClientRect(); return Math.atan2(e.clientY - r.top - 154, e.clientX - r.left - r.width / 2); }
      glC.addEventListener('pointerdown', function (e) {
        if (e.button > 0 || gl.phase === 'spin' || gl.phase === 'watch') return;
        glDrag = { a: glAng(e), t: performance.now(), w: 0 };
        try { glC.setPointerCapture(e.pointerId); } catch (er) {}
      });
      glC.addEventListener('pointermove', function (e) {
        if (!glDrag) return;
        var a = glAng(e), d = a - glDrag.a, now = performance.now();
        d = ((d + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        glDrag.w = .6 * glDrag.w + .4 * d / Math.max(1, now - glDrag.t); glDrag.a = a; glDrag.t = now;
        gl.wheelA += d; glDraw(null);
      });
      glC.addEventListener('pointerup', function () {
        var dg = glDrag; glDrag = null;
        if (!dg || performance.now() - dg.t > 120 || Math.abs(dg.w) < .004) return;
        if (gl.phase === 'offer' || gl.phase === 'idle' || gl.phase === 'bust') { gl.flick = dg.w; glAdvance(); }
      });
      glC.addEventListener('pointercancel', function () { glDrag = null; });

      glAutoB.addEventListener('click', function () {
        gl.auto = !gl.auto;
        glAutoPaint();
        if (gl.auto && (gl.phase === 'idle' || gl.phase === 'offer' || gl.phase === 'bust')) setTimeout(glAdvance, 400);
      });

      function glFreshTable(msg) {
        if (gl.watchT) { clearInterval(gl.watchT); gl.watchT = null; }
        if (glAnim) cancelAnimationFrame(glAnim);
        gl.phase = 'idle'; gl.bank = gl.bankroll; gl.step = 0; gl.betSide = null; gl.spins = 0;
        gl.hist = []; gl.sKey = null; gl.sLen = 0; gl.net = 0; gl.auto = false; gl.landed = null;
        glGhosts();
        document.getElementById('glStreakV').textContent = '\u2013';
        glAutoPaint(); glPaint();
        glGoB.disabled = false;
        glGoB.textContent = 'Open the table';
        glSay(msg);
        glDraw(null);
      }
      document.getElementById('glResetB').addEventListener('click', function () {
        glFreshTable('Fresh table, fresh ' + rlFmt(gl.bankroll) + ', same amnesiac wheel.');
      });

      var GL_BROLLS = [500, 1000, 2000, 5000, 10000];
      var GL_Q = 19 / 37;
      function glDeathRung(B) { var k = 1; while (10 * (Math.pow(2, k) - 1) <= B) k++; return k; }
      function glBankStats(B) {
        var k = glDeathRung(B), pl = k - 1;
        var pBust = Math.pow(GL_Q, pl);
        var cost = 10 * (Math.pow(2, pl) - 1);
        var ew = 0;
        for (var j = 1; j <= pl; j++) ew += Math.pow(GL_Q, j - 1) * 10 * Math.pow(2, j - 1);
        return { death: k, oneIn: Math.round(1 / pBust), cost: cost, avg: ew / 37, pBust: pBust };
      }
      function glFmtC(n) { return (n < 0 ? '-$' : '$') + Math.abs(n).toFixed(2); }
      function glPaintBank() {
        var cells = document.getElementById('glBMenu').children;
        for (var i = 0; i < cells.length; i++) {
          cells[i].classList.toggle('on', GL_BROLLS[i] === gl.bankroll);
          cells[i].setAttribute('aria-pressed', GL_BROLLS[i] === gl.bankroll ? 'true' : 'false');
        }
        var st = glBankStats(gl.bankroll);
        var fair = 100 * st.cost / (st.cost + 10);
        var real = 100 * (1 - st.pBust);
        document.getElementById('glTruth').innerHTML = 'With ' + rlFmt(gl.bankroll) + ' behind you, here is the bet you are really making on every ladder: <b>' + (st.oneIn - 1).toLocaleString('en-US') + ' times in ' + st.oneIn.toLocaleString('en-US') + '</b> you collect $10, and the other time you hand over <b>' + rlFmt(st.cost) + '</b>. Risking ' + rlFmt(st.cost) + ' to win $10 on a fair coin succeeds ' + fair.toFixed(2) + '% of the time, and no strategy in existence beats that ratio; this wheel pays ' + real.toFixed(2) + '%. The missing slice is the zero, and it prices every bankroll the same way: about ' + glFmtC(-st.avg) + ' per ladder, forever. To win $10, you put everything in the cage at risk.';
      }
      (function () {
        var menu = document.getElementById('glBMenu'), h = '';
        for (var i = 0; i < GL_BROLLS.length; i++) {
          var st = glBankStats(GL_BROLLS[i]);
          h += '<button type="button" class="rl-cell" data-b="' + GL_BROLLS[i] + '"><span class="rs">BANKROLL</span><span class="rv">' + rlFmt(GL_BROLLS[i]) + '</span><span class="rw neg">dies rung ' + st.death + ' \u00B7 ' + rlFmt(-st.cost) + '</span><span class="rc">1 bust in ' + st.oneIn.toLocaleString('en-US') + ' \u00B7 avg ' + glFmtC(-st.avg) + '</span></button>';
        }
        menu.innerHTML = h;
        menu.addEventListener('click', function (e) {
          var c = e.target.closest('button[data-b]');
          if (!c) return;
          if (gl.step > 0) { glSay('Finish the ladder first; the cage does not refinance a climb in progress.'); return; }
          gl.bankroll = +c.getAttribute('data-b');
          var st2 = glBankStats(gl.bankroll);
          glPaintBank();
          glFreshTable('Racked up ' + rlFmt(gl.bankroll) + '. It buys you rung ' + (st2.death - 1) + ' and dies on rung ' + st2.death + ', one ladder in ' + st2.oneIn.toLocaleString('en-US') + ', for ' + rlFmt(-st2.cost) + '. Everything else this money changes is tempo.');
        });
        glPaintBank();
      })();

      function glSetMode(m) {
        if (gl.step > 0) { glSay('Finish the ladder first. The covering rule does not pause mid-climb.'); return; }
        gl.mode = m; gl.sKey = null; gl.sLen = 0;
        document.getElementById('glModeC').classList.toggle('on', m === 'color');
        document.getElementById('glModeP').classList.toggle('on', m === 'parity');
        document.getElementById('glModeC').setAttribute('aria-pressed', m === 'color' ? 'true' : 'false');
        document.getElementById('glModeP').setAttribute('aria-pressed', m === 'parity' ? 'true' : 'false');
        document.getElementById('glStreakV').textContent = '\u2013';
        glSay(m === 'color' ? 'Now watching for six reds or six blacks in a row.' : 'Now watching for six odds or six evens in a row. Same wheel, same trap, softer voice.');
      }
      document.getElementById('glModeC').addEventListener('click', function () { glSetMode('color'); });
      document.getElementById('glModeP').addEventListener('click', function () { glSetMode('parity'); });

      var glSimData = null;
      function glDrawEq() {
        if (!glSimData) return;
        var c = document.getElementById('glEq');
        var f = fitCanvas(c, 190), ctx = f.ctx, W = f.W, H = 190;
        if (!(W > 0)) return;
        ctx.clearRect(0, 0, W, H);
        var g = glSimData.gCurve, m = glSimData.mCurve, L = 10, R = W - 10;
        var lo = 0, hi = 0, i;
        for (i = 0; i < g.length; i++) { if (g[i] < lo) lo = g[i]; if (g[i] > hi) hi = g[i]; }
        for (i = 0; i < m.length; i++) { if (m[i] < lo) lo = m[i]; if (m[i] > hi) hi = m[i]; }
        if (hi === lo) hi = lo + 1;
        function Y(v) { return 14 + (H - 42) * (1 - (v - lo) / (hi - lo)); }
        function X(k, n) { return L + (R - L) * k / (n - 1); }
        var y0 = Y(0);
        /* below zero is the casino's: the ground it took is tinted in the loss colour */
        ctx.save(); ctx.beginPath(); ctx.rect(0, y0, W, H - y0); ctx.clip();
        ctx.beginPath(); ctx.moveTo(X(0, m.length), y0);
        for (i = 0; i < m.length; i++) ctx.lineTo(X(i, m.length), Y(m[i]));
        ctx.lineTo(X(m.length - 1, m.length), y0); ctx.closePath();
        ctx.fillStyle = labColorA('--loss', .1); ctx.fill(); ctx.restore();
        ctx.save(); ctx.strokeStyle = inkColor(.24); ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(L, cvSnap(y0)); ctx.lineTo(R, cvSnap(y0)); ctx.stroke(); ctx.restore();
        ctx.lineJoin = 'round';
        ctx.strokeStyle = inkColor(.45); ctx.lineWidth = 1.4; ctx.beginPath();
        for (i = 0; i < m.length; i++) { if (i === 0) ctx.moveTo(X(i, m.length), Y(m[i])); else ctx.lineTo(X(i, m.length), Y(m[i])); }
        ctx.stroke();
        ctx.strokeStyle = ACC(); ctx.lineWidth = 2; ctx.setLineDash([7, 6]); ctx.beginPath();
        for (i = 0; i < g.length; i++) { if (i === 0) ctx.moveTo(X(i, g.length), Y(g[i])); else ctx.lineTo(X(i, g.length), Y(g[i])); }
        ctx.stroke(); ctx.setLineDash([]);
        cvText(ctx, '$0', L, y0 - 6);
        cvText(ctx, 'COVERED ' + rlFmt(glSimData.gNet), L, H - 8, { color: inkColor(.86) });
        cvText(ctx, 'DOUBLING ' + rlFmt(glSimData.mNet), W - 6, H - 8, { align: 'right', color: inkColor(.66) });
      }
      function glDrawHist() {
        if (!glSimData) return;
        var c = document.getElementById('glHistC');
        var f = fitCanvas(c, 150), ctx = f.ctx, W = f.W, H = 150;
        if (!(W > 0)) return;
        ctx.clearRect(0, 0, W, H);
        var d = glSimData.rungs, n = d.length, mx = 1, i;
        for (i = 0; i < n; i++) if (d[i] > mx) mx = d[i];
        var bw = Math.min(64, (W - 20) / n);
        var x0 = (W - bw * n) / 2, base = H - 26;
        ctx.strokeStyle = inkColor(.2); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x0, cvSnap(base)); ctx.lineTo(x0 + bw * n, cvSnap(base)); ctx.stroke();
        var NUM = '600 11px ' + CV_SANS;
        for (i = 0; i < n; i++) {
          var bust = i === n - 1;
          var bh = Math.max(d[i] > 0 ? 3 : 0, (H - 58) * d[i] / mx);
          var bx = x0 + i * bw;
          ctx.fillStyle = labColor(bust ? '--loss' : '--gain');
          cvRound(ctx, bx + 3, base - bh, bw - 6, bh, [2, 2, 0, 0]); ctx.fill();
          if (d[i] > 0) cvText(ctx, d[i].toLocaleString('en-US'), bx + bw / 2, base - bh - 5, { align: 'center', font: NUM, color: inkColor(.72) });
          /* the red bar carries its price: what the promise costs each time the streak refuses to break */
          if (bust && d[i] > 0) cvText(ctx, rlFmt(-glSimData.cost), bx + bw / 2, base - bh - 20, { align: 'center', font: NUM, color: inkColor(.86) });
          cvText(ctx, bust ? 'BUST' : (i === n - 2 ? (i + 1) + '+' : String(i + 1)), bx + bw / 2, H - 9, { align: 'center', color: inkColor(bust ? .8 : .6) });
        }
      }
      document.getElementById('glSim').addEventListener('click', function () {
        var N = 1000000, SIMB = gl.bankroll;
        var P = {
          g: { bank: SIMB, net: 0, wag: 0, won: 0, busts: 0, betting: false, stake: 0, step: 0, curve: [] },
          m: { bank: SIMB, net: 0, wag: 0, won: 0, busts: 0, betting: false, stake: 0, step: 0, curve: [] }
        };
        var side = null, sKey = null, sLen = 0, runKey = null, runLen = 0, maxRun = 0;
        var rungs = [0, 0, 0, 0, 0, 0, 0, 0];
        var mxStake = 0;
        var color = gl.mode === 'color';
        for (var i = 0; i < N; i++) {
          var n = (Math.random() * 37) | 0;
          var k = n === 0 ? 'g' : color ? (RL_RED[n] ? 'r' : 'b') : (n % 2 ? 'o' : 'e');
          if (k === 'g') { runKey = null; runLen = 0; }
          else if (k === runKey) { runLen++; if (runLen > maxRun) maxRun = runLen; }
          else { runKey = k; runLen = 1; }
          if (k === 'g') { sKey = null; sLen = 0; }
          else if (k === sKey) { sLen++; }
          else { sKey = k; sLen = 1; }
          if (sLen >= 6) {
            var opp = rlOpp(sKey);
            if (!P.g.betting) { P.g.betting = true; P.g.fresh = true; P.g.step = 1; P.g.stake = 10; P.g.lost = 0; P.g.side = opp; }
            if (!P.m.betting) { P.m.betting = true; P.m.fresh = true; P.m.step = 1; P.m.stake = 10; P.m.side = opp; }
          }
          for (var pi = 0; pi < 2; pi++) {
            var p = pi === 0 ? P.g : P.m;
            if (!p.betting) continue;
            if (p.fresh) { p.fresh = false; continue; }
            p.wag += p.stake;
            if (pi === 0 && p.stake > mxStake) mxStake = p.stake;
            if (k === p.side) {
              p.bank += p.stake; p.net += p.stake; p.won++;
              if (pi === 0) rungs[Math.min(p.step, 8) - 1]++;
              p.betting = false;
            } else {
              p.bank -= p.stake; p.net -= p.stake; p.step++;
              if (pi === 0) { p.lost += p.stake; p.stake = p.lost + 10; }
              else { p.stake = p.stake * 2; }
              if (p.stake > p.bank) { p.busts++; p.bank = SIMB; p.betting = false; }
            }
          }
          if ((i & 511) === 0) { P.g.curve.push(P.g.net); P.m.curve.push(P.m.net); }
        }
        P.g.curve.push(P.g.net); P.m.curve.push(P.m.net);
        glSimData = { gCurve: P.g.curve, mCurve: P.m.curve, gNet: P.g.net, mNet: P.m.net, rungs: rungs.concat([P.g.busts]), cost: glBankStats(SIMB).cost };
        var glSW = document.getElementById('glSimWrap');
        glSW.style.display = '';
        document.getElementById('glWonV').textContent = P.g.won.toLocaleString('en-US');
        var pv = document.getElementById('glPyrV');
        pv.textContent = rlFmt(mxStake);
        document.getElementById('glBustV').textContent = P.g.busts.toLocaleString('en-US');
        document.getElementById('glMBustV').textContent = P.m.busts.toLocaleString('en-US');
        document.getElementById('glWagV').textContent = rlFmt(P.g.wag);
        var sn = document.getElementById('glSimNetV');
        sn.textContent = rlFmt(P.g.net);
        sn.className = 'v ' + (P.g.net < 0 ? 'loss' : 'gain');
        var mn = document.getElementById('glMNetV');
        mn.textContent = rlFmt(P.m.net);
        mn.className = 'v ' + (P.m.net < 0 ? 'loss' : 'gain');
        document.getElementById('glRunV').textContent = maxRun + ' in a row';
        var av = document.getElementById('glAvgV');
        av.textContent = glFmtC(P.g.net / Math.max(1, P.g.won + P.g.busts));
        av.className = 'v ' + (P.g.net < 0 ? 'loss' : 'gain');
        var v = 'Look at the chart again: there is only one line. The orange dashes sit exactly on the gray, spin for spin, dollar for dollar, because \u201Cdouble after every loss\u201D and \u201Ccover everything lost plus ten\u201D are the same sentence written twice. One million identical spins, both players racking up ' + rlFmt(SIMB) + ' after every funeral: the covering rule won ' + P.g.won.toLocaleString('en-US') + ' ladders at $10 each, was forced up to a single bet of ' + rlFmt(mxStake) + ', lost its bankroll ' + P.g.busts.toLocaleString('en-US') + ' times, and finished at ' + rlFmt(P.g.net) + '. The blind doubler: ' + P.m.busts.toLocaleString('en-US') + ' busts, ' + rlFmt(P.m.net) + '. Identical, to the cent, on ' + rlFmt(P.g.wag) + ' wagered. Press the button again; the pair will wobble together, around the same average: 2.7 cents to the house per dollar. Waiting for six in a row decided when you bet, and the bankroll decided only the tempo: rarer funerals and bigger coffins. Staying power multiplies the sign of your edge, and on this felt the sign is negative.';
        document.getElementById('glVerdict').textContent = v;
        document.getElementById('glLine').textContent = 'The longest streak in this million was ' + maxRun + ' in a row, and after every spin of it the other color was still 18 in 37. You never chose to double; coverage chose for you, and the wheel charges 2.7 cents on the dollar either way.';
        glDrawEq(); glDrawHist();
        /* the results arrive the way the lab reveals everything else, and come into view */
        if (!LAB_RM) { glSW.classList.remove('lab-in'); void glSW.offsetWidth; glSW.classList.add('lab-in'); }
        try { glSW.scrollIntoView({ block: 'nearest', behavior: LAB_RM ? 'auto' : 'smooth' }); } catch (er) {}
      });
      labRepaint(function () { glDraw(gl.ballLast || null); glDrawEq(); glDrawHist(); }, glC);
      setTimeout(function () { glDraw(null); }, 250);
      setTimeout(function () { glDraw(null); }, 1800);
    return {};
  });
})();
