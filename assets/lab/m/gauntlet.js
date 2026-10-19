/* P.S. Lab, No. 28: The gauntlet. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="q-shell lx-bench lx-table lx-bleed">\n'
    + '        <div class="q-top">\n'
    + '          <span id="gaDots" class="q-rail" aria-hidden="true"></span>\n'
    + '          <span class="readout readout--inline"><span class="k">Score</span><span class="v up" id="gaScore">0</span></span>\n'
    + '        </div>\n'
    + '        <div class="ga-flip" id="gaFlip">\n'
    + '          <div class="ga-face ga-front" id="gaFront">\n'
    + '            <div id="gaTag" class="q-tag"></div>\n'
    + '            <div id="gaTitle" class="q-title"></div>\n'
    + '            <p id="gaText" class="q-text"></p>\n'
    + '            <div id="gaChoices" class="q-choices"></div>\n'
    + '          </div>\n'
    + '          <div class="ga-face ga-back" id="gaBack" aria-hidden="true">\n'
    + '            <div id="gaVerdict" class="q-title"></div>\n'
    + '            <div id="gaTook" class="ga-took"></div>\n'
    + '            <p id="gaReveal" class="q-reveal"></p>\n'
    + '            <div class="btnrow"><button class="ebtn" id="gaNext" type="button">Next room</button></div>\n'
    + '          </div>\n'
    + '        </div>\n'
    + '      </div>\n'
    + '      <p class="eline" id="gaLine">Room 1 is a pitch meeting. Go in.</p>';
  LAB_KIT.mount('gauntlet', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- the gauntlet ---------- */

      var gaLevel = 0, gaScoreN = 0, gaState = {};
      var gaDots = document.getElementById('gaDots');
      var gaChoicesEl = document.getElementById('gaChoices');
      var gaRevealEl = document.getElementById('gaReveal');
      var gaNextBtn = document.getElementById('gaNext');
      var gaRes = [];
      var gaFlip = document.getElementById('gaFlip'), gaFront = document.getElementById('gaFront'), gaBack = document.getElementById('gaBack');
      var gaTook = document.getElementById('gaTook');
      /* the room is a card: the scenario on the front; answer, and it turns over to the verdict */
      function gaTurn(over) {
        gaFlip.classList.toggle('over', over);
        gaFront.setAttribute('aria-hidden', over ? 'true' : 'false');
        gaBack.setAttribute('aria-hidden', over ? 'false' : 'true');
        if ('inert' in gaFront) { gaFront.inert = over; gaBack.inert = !over; }
        gaFit();
      }
      /* the card is as tall as the face that is up; the height eases while the card is edge-on */
      function gaFit() { var f = gaFlip.classList.contains('over') ? gaBack : gaFront; if (f.offsetHeight) gaFlip.style.height = f.offsetHeight + 'px'; }
      if ('ResizeObserver' in window) { var gaRO = new ResizeObserver(gaFit); gaRO.observe(gaFront); gaRO.observe(gaBack); }
      gaTurn(false);
      /* a choice is a paper row; the right one carries a flag so the room can show it after you answer */
      function gaBtn(label, fn, right) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'q-opt';
        if (right) b.setAttribute('data-right', '1');
        b.textContent = label;
        b.addEventListener('click', function () { if (b.disabled) return; gaState.mine = b; fn(); });
        gaChoicesEl.appendChild(b);
        gaFit();
        return b;
      }
      function gaIn(el) { if (LAB_RM || !el) return; el.classList.remove('lab-in'); void el.offsetWidth; el.classList.add('lab-in'); }
      function gaShow(tag, title, text) {
        document.getElementById('gaTag').textContent = tag;
        document.getElementById('gaTitle').textContent = title;
        document.getElementById('gaText').textContent = text;
        gaChoicesEl.innerHTML = '';
        var was = gaFlip.classList.contains('over');
        gaTurn(false);
        if (!was) { gaIn(document.getElementById('gaTitle')); gaIn(document.getElementById('gaText')); gaIn(gaChoicesEl); }
      }
      function gaDone(reveal, gotIt) {
        if (gotIt) { gaScoreN++; document.getElementById('gaScore').textContent = gaScoreN; }
        gaRes[gaLevel] = !!gotIt;
        /* the choices stay on the table: yours in ink, the right one in foil, the rest set down */
        var hadFocus = gaChoicesEl.contains(document.activeElement);
        Array.prototype.forEach.call(gaChoicesEl.children, function (b) {
          b.disabled = true;
          if (b === gaState.mine) b.classList.add('q-opt--mine');
          if (b.getAttribute('data-right')) b.classList.add('q-opt--right');
        });
        document.getElementById('gaVerdict').textContent = gotIt ? 'Point to you' : 'The trap got you';
        gaTook.innerHTML = '';
        function took(k, t, ok) {
          var p = document.createElement('p'), a = document.createElement('span'), b = document.createElement('span');
          a.className = 'k'; a.textContent = k; b.textContent = t; if (ok) b.className = 'ok';
          p.appendChild(a); p.appendChild(b); gaTook.appendChild(p);
        }
        var right = gaChoicesEl.querySelector('[data-right]');
        if (gaState.mine) took('Your call', gaState.mine.textContent, gotIt);
        if (!gotIt && right && right !== gaState.mine) took('The way out', right.textContent, true);
        gaRevealEl.textContent = reveal;
        gaNextBtn.textContent = gaLevel >= 4 ? 'See the verdict' : 'Next room';
        gaTurn(true);
        if (hadFocus) { try { gaNextBtn.focus({ preventScroll: true }); } catch (er) {} }
        drawDotsGa();
      }
      /* five rooms as five rules: foil for a room you beat, graphite for one that beat you, ink for the room you are in */
      function drawDotsGa() {
        if (!gaDots.children.length) { for (var k = 0; k < 5; k++) gaDots.appendChild(document.createElement('i')); }
        Array.prototype.forEach.call(gaDots.children, function (d, i) {
          d.className = gaRes[i] === true ? 'done' : gaRes[i] === false ? 'miss' : i === gaLevel ? 'cur' : '';
        });
      }
      var gaLevels = [
        function () {
          gaShow('Room 1 of 5 · the pitch meeting', 'The five-year streak',
            'A fund manager sits across from you. She has beaten the market five years in a row, and she has the charts to prove it. There are about eight hundred funds in her category. She is raising. What is your move?');
          gaBtn('Back her. Five straight years cannot be luck.', function () {
            gaDone('Eight hundred funds flipping fair coins produce about twenty-five five-year streaks by chance alone. You did not find her; her streak found you. Selection did your due diligence for free, and it was worth what you paid.', false);
          });
          gaBtn('Ask how many funds were playing, then judge the streak against that.', function () {
            gaDone('800 divided by two, five times, is 25 lucky streaks with zero skill anywhere in the building. Her track record only means something measured against the graveyard of funds you never got pitched by.', true);
          }, true);
          gaBtn('Pass. Nobody beats the market, ever.', function () {
            gaDone('The right move was to ask about the pool of players before judging the streak. Some streaks are skill. You find out by counting the coin-flippers first.', false);
          });
        },
        function () {
          gaShow('Room 2 of 5 · the alarm', 'The 99% detector',
            'Serious fraud exists in about one company per thousand. Your screening tool catches real fraud 99% of the time and false-alarms on clean companies just 1% of the time. It has flagged a company this morning. How likely is it that the company is dirty?');
          gaBtn('About 99%. The tool is 99% accurate.', function () {
            gaDone('Walk a thousand companies through it: one real fraud gets caught, and about ten innocent ones get flagged by the 1% error. Eleven alarms, one crook: roughly 9%. Accuracy is loud and base rates are quiet. The quiet number wins.', false);
          });
          gaBtn('About half. Coin flip.', function () {
            gaDone('Closer in spirit, still triple the truth. Per thousand screens: one true catch, about ten false alarms. One guilty in eleven flags is roughly 9%. Whenever the thing you hunt is rare, most of your alarms are noise. This is also why dragnets drown.', false);
          });
          gaBtn('Under 10%, weirdly.', function () {
            gaDone('Exactly the weirdness. One real fraud caught, ten clean firms falsely flagged: eleven alarms, one guilty, roughly 9%. Rare targets turn excellent tools into noise machines. Remember this the next time a screener flags anything rare.', true);
          }, true);
        },
        function () {
          gaShow('Room 3 of 5 · the three doors', 'The switch',
            'Three doors. Behind one is a startup that returns a hundredfold; the other two hide nothing. Pick a door.');
          gaState.doors = null;
          ['Door A', 'Door B', 'Door C'].forEach(function (name, idx) {
            gaBtn(name, function () {
              var win = Math.floor(Math.random() * 3);
              gaState.doors = { pick: idx, win: win };
              var openable = [0, 1, 2].filter(function (d) { return d !== idx && d !== win; });
              var opened = openable[Math.floor(Math.random() * openable.length)];
              gaShow('Room 3 of 5 · the three doors', 'The switch',
                'You chose ' + name + '. I know where the winner is, and I have just opened ' +
                ['Door A', 'Door B', 'Door C'][opened] + ': empty. One door left besides yours. Keep your door, or switch?');
              gaBtn('Keep my door. The odds are 50-50 now anyway.', function () {
                var wonK = gaState.doors.pick === gaState.doors.win;
                gaDone('It was never 50-50. Your first pick had a one-in-three chance and nothing that happened after changed that; the remaining door carries the other two-thirds. ' +
                  (wonK ? 'You happened to win this time, which is exactly how bad strategies recruit.' : 'And this time the two-thirds door had the goods.') +
                  ' Switching wins twice as often. When someone with more information removes options, re-run the math.', false);
              });
              gaBtn('Switch to the last door.', function () {
                var switched = [0, 1, 2].filter(function (d) { return d !== gaState.doors.pick && d !== opened; })[0];
                var wonS = switched === gaState.doors.win;
                gaDone('Your first pick was right one time in three; the other two-thirds got squeezed into the door you just took. Switching wins twice as often. ' +
                  (wonS ? 'It paid this very round.' : 'It lost this round, and it was still the right move; play it a hundred times and watch.') +
                  ' When an informed party removes options, the ones left are not equal.', true);
              }, true);
            });
          });
        },
        function () {
          gaShow('Room 4 of 5 · the war room', 'The serial numbers',
            'Wartime. Your side has captured three enemy machines, serial numbers 17, 42 and 68. Intelligence swears the enemy is producing thousands. Your commander wants a number. What do you tell her?');
          gaBtn('About 90. Do arithmetic on the serials.', function () {
            gaDone('Take the highest serial, add the average gap: 68 + 68/3 - 1 lands near 90. In the real war, statisticians doing exactly this estimated 246 tanks a month while the spies said 1,400. Captured records after the war: 245. Three greasy numbers beat an intelligence agency.', true);
          }, true);
          gaBtn('A few hundred. Split the difference with intelligence.', function () {
            gaDone('Splitting the difference feels wise and means nothing; it just launders someone else’s guess. The serial numbers themselves speak: highest serial plus the average gap, 68 + 68/3 - 1, roughly 90. The real WWII statisticians said 246 a month; the spies said 1,400; the captured records said 245. Do the arithmetic on the evidence you hold.', false);
          });
          gaBtn('Thousands. Trust the intelligence service.', function () {
            gaDone('The spies said 1,400 a month in the real version of this story. The statisticians, using nothing but captured serial numbers and the formula max + max/k - 1, said 246. After the war the records showed 245. Three numbers stamped on metal outweighed all that confidence.', false);
          });
        },
        function () {
          gaShow('Room 5 of 5 · the ticket', 'The lost hundred, part one',
            'You paid $100 for tonight’s concert. At the gate you discover the ticket is gone. Vanished. The window still sells tickets for $100. Do you buy another?');
          gaBtn('No. I am not paying $200 for one concert.', function () { gaPart2(false); });
          gaBtn('Yes. The night is still worth $100 to me.', function () { gaPart2(true); });
          function gaPart2(a1) {
            gaShow('Room 5 of 5 · the ticket', 'The lost hundred, part two',
              'Rewind the evening. You never bought a ticket, but on the walk over, a $100 bill fell out of your pocket. Gone. You arrive at the window; tickets cost $100. Do you buy one?');
            gaBtn('No.', function () { gaFinish(a1, false); }, a1 === false);
            gaBtn('Yes.', function () { gaFinish(a1, true); }, a1 === true);
          }
          function gaFinish(a1, a2) {
            var consistent = a1 === a2;
            gaDone('Both worlds are identical: you are down $100, ticketless, deciding if tonight is worth another hundred. Yet in the classic study most people refuse in the first world and buy in the second, because the mind files the lost ticket under “concert: now $200” and the lost bill under “bad luck, unrelated.” ' +
              (consistent ? 'Your answers matched, which makes you the rare consistent accountant in the building.' : 'Your answers flipped, so you have now met your inner accountant. He means well. He cannot add.') +
              ' Money is money; the folders are fiction.', consistent);
          }
        }
      ];
      gaNextBtn.addEventListener('click', function () {
        var hf = document.activeElement === gaNextBtn;
        gaLevel++;
        if (gaLevel < 5) {
          gaLevels[gaLevel]();
          drawDotsGa();
          var c0 = hf ? gaChoicesEl.querySelector('button') : null;
          if (c0) { try { c0.focus({ preventScroll: true }); } catch (er) {} }
        } else {
          gaShow('The verdict', gaScoreN + ' of 5 rooms survived', '');
          var v = gaScoreN === 5 ? 'A clean run: five traps named and avoided.'
            : gaScoreN >= 3 ? 'Reread the ones you missed. A trap you can name is easier to avoid.'
            : gaScoreN >= 1 ? 'The gauntlet ate you a few times. Good news: every one of these traps is beatable by the same move, asking “what am I not seeing?” before deciding. The bombers upstairs taught the same thing.'
            : 'A perfect score, inverted. Do not feel bad; these five traps have humbled generals, doctors and fund managers. Now they have names for you, and named traps rarely bite twice.';
          document.getElementById('gaText').textContent = v;
          document.getElementById('gaLine').textContent = 'Refresh the page to run the gauntlet again. The rooms will be waiting.';
          drawDotsGa();
        }
      });
      gaLevels[0]();
      drawDotsGa();
    return {};
  });
})();
