/* P.S. Lab, No. 09: The fifty million dollar email. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<div class="br-caps">\n'
    + '        <div class="mh-cell"><span class="k">Blockbuster, market value</span><span class="v" id="bbBB">$5.0B</span><i class="br-meter" aria-hidden="true"><b id="bbMtrBB"></b></i><small id="bbYear">year 2000</small></div>\n'
    + '        <div class="mh-cell sw"><span class="k">Netflix</span><span class="v" id="bbNF">$0.3B</span><i class="br-meter" aria-hidden="true"><b id="bbMtrNF"></b></i><small>the visitor</small></div>\n'
    + '      </div>\n'
    + '      <div class="br-card lx-bench lx-bleed">\n'
    + '        <svg class="br-tree" id="bbTl" aria-hidden="true"></svg>\n'
    + '        <p class="br-scene" id="bbScene"></p>\n'
    + '        <p class="br-whisper" id="bbWhisper"></p>\n'
    + '        <div class="btnrow" id="bbBtns">\n'
    + '          <button class="br-choice" id="bbA" type="button" data-k="A"></button>\n'
    + '          <button class="br-choice" id="bbB" type="button" data-k="B"></button>\n'
    + '          <button class="ebtn" id="bbNext" type="button" style="display:none">Next board meeting</button>\n'
    + '          <button class="ebtn2" id="bbAgain" type="button" style="display:none">Rewind to 2000</button>\n'
    + '        </div>\n'
    + '      </div>\n'
    + '      <p class="eline" id="bbLine">Every scene here happened. Marc Randolph, who was in the room, wrote that Blockbuster’s team fought not to laugh.</p>';
  LAB_KIT.mount('fifty-million-dollar-email', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- the fifty million dollar email ---------- */

      var bbScene = document.getElementById('bbScene');
      var bbWhisper = document.getElementById('bbWhisper');
      var bbA = document.getElementById('bbA'), bbB = document.getElementById('bbB');
      var bbNext = document.getElementById('bbNext'), bbAgain = document.getElementById('bbAgain');
      var bbCapBB = document.getElementById('bbBB'), bbCapNF = document.getElementById('bbNF');
      var bbYearEl = document.getElementById('bbYear'), bbLineEl = document.getElementById('bbLine');
      var ROUNDS = [
        { y: 2000,
          scene: 'Reed Hastings and Marc Randolph sit across your conference table. Netflix loses money mailing DVDs to a niche of early adopters. They offer you the whole company for <b>$50 million</b>, and in exchange they will run your online arm.',
          whisper: 'Your team’s read after they leave the room: a niche business. Accounts differ on whether the laughter was literal, but nobody argued for the deal.',
          h: 'a',
          a: { t: 'Pass. We have nine thousand stores.', good: false,
               out: 'You pass, politely. History agrees with the room for four more years: Blockbuster keeps printing money, and late fees alone bring in hundreds of millions a year. The visitor drives back to the airport with the company you could have owned for pocket change.',
               bb: 5.0, nf: 1.5 },
          b: { t: 'Buy Netflix for $50 million.', good: true, buyout: true } },
        { y: 2004, h: 'a',
          scene: 'Netflix subscribers doubled, then doubled again. Your own people built <b>Blockbuster Online</b> in secret in an office far from headquarters. To win, analysts say you must also kill late fees: <b>$200 million</b> of pure profit, gone, plus $200 million more to fund the online push. Wall Street will scream.',
          whisper: 'Late fees are almost a fifth of your operating profit, and the single thing your customers hate most about you.',
          a: { t: 'Kill late fees. Burn the boats.', good: true,
               out: 'You do it: no more late fees, and Total Access lets people return online rentals in stores, which Netflix cannot match. It works better than anyone expects; by 2006 you are adding subscribers faster than Netflix, and inside Netflix they are scared. It is also hemorrhaging money, and your board notices.',
               bb: 3.2, nf: 1.9 },
          b: { t: 'Protect the profit. Stores first.', good: false,
               out: 'You keep the late fees and the fat margins. The quarter looks great. Every month, a few hundred thousand more people discover that the red envelope never charges them $40 for forgetting a tape, and they do not come back to the store.',
               bb: 3.6, nf: 2.4 } },
        { y: 2007, h: 'b',
          scene: 'The online arm is winning subscribers but losing money, and <b>Carl Icahn</b> now sits on your board, furious about the spending and your CEO’s pay. A faction wants to install Jim Keyes, a convenience-store veteran who believes the future is <b>better stores</b>, not the internet.',
          whisper: 'Netflix privately offered to buy Blockbuster Online from you. They consider your Total Access program the biggest threat in their history.',
          a: { t: 'Back the online arm. Fight the board.', good: true,
               out: 'In this timeline you keep the strategy and eat the losses, and the race stays a race. In the real one, the fight ends over a pay dispute: the CEO walks, Keyes takes over, and within months the online push is gutted to save the stores. Netflix executives later admit it was the moment they stopped being afraid.',
               bb: 2.2, nf: 3.0 },
          b: { t: 'Install Keyes. Focus on stores.', good: false,
               out: 'Keyes arrives from 7-Eleven, cuts the online marketing budget, raises online prices, and pivots to candy racks and kiosks. The stores do look nicer. Netflix stops looking over its shoulder; its executives later admit Total Access was the last thing that ever scared them.',
               bb: 1.4, nf: 3.4 } },
        { y: 2008, h: 'b',
          scene: 'Netflix just did something strange: it bolted a <b>streaming service</b> onto every mail plan, free, before the technology was even good. Your advisers say streaming is years from mattering. Licensing a real library would cost a year of profit and cannibalize whatever is left of the stores.',
          whisper: 'Hastings named the company Netflix in 1997, when nobody had the bandwidth to stream a postage stamp. He was planning for streaming from the start.',
          a: { t: 'Build streaming now, whatever it costs.', good: true,
               out: 'You spend money you barely have to be early to the only future that exists. No one can say if it saves you; by now you carry a billion dollars of debt from the leveraged split with Viacom. But it is the only move on the board that is not managing decline.',
               bb: 0.6, nf: 4.5 },
          b: { t: 'Wait. Streaming is not ready.', good: false,
               out: 'You wait, like almost everyone did. Streaming gets good on a curve, and “not ready” becomes “everywhere” faster than any board deck predicted. The last mover in a technology shift does not get a turn.',
               bb: 0.4, nf: 5.0 } }
      ];
      var bbState = { i: 0, score: 0, over: false, path: [] };
      var bbTl = document.getElementById('bbTl'), BBY = [2000, 2004, 2007, 2008, 2010];
      /* the fork tree: history dashed on the lower lane; your path in foil, drawn as you choose, leaving the lane when you choose differently */
      function bbTree(fresh) {
        var W = bbTl.clientWidth || 600, n = BBY.length, p = bbState.path, cur = bbState.over ? -1 : bbState.i, h = '', i, Y = [44, 16], y0 = Y[0];
        function X(k) { return 10 + k * (W - 20) / (n - 1); }
        bbTl.setAttribute('viewBox', '0 0 ' + W + ' 74');
        h += '<path class="h" d="M' + X(0) + ' ' + Y[0] + 'H' + X(n - 1) + '"/>';
        for (i = 0; i < p.length; i++) {
          var y1 = Y[p[i] ? 1 : 0], xa = X(i), xb = p[i] === 2 ? X(n - 1) : X(i + 1), m = (xb - xa) / 2;
          h += '<path class="y' + (fresh && i === p.length - 1 ? ' new' : '') + '" pathLength="1" d="M' + xa + ' ' + y0 + 'C' + (xa + m) + ' ' + y0 + ' ' + (xb - m) + ' ' + y1 + ' ' + xb + ' ' + y1 + '"/>';
          y0 = y1;
        }
        for (i = 0; i < n; i++) {
          h += '<circle r="4.5" cx="' + X(i) + '" cy="' + Y[0] + '" class="' + (i === cur ? 'on' : i < p.length ? 'done' : '') + '"/>';
          h += '<text x="' + X(i) + '" y="70" text-anchor="' + (i ? i === n - 1 ? 'end' : 'middle' : 'start') + '" class="' + (i === cur ? 'on' : '') + '">' + BBY[i] + '</text>';
        }
        if (bbState.over) {
          var off = p.indexOf(2) >= 0;
          h += '<text class="k" x="' + X(n - 1) + '" y="' + (Y[0] - 10) + '" text-anchor="end">Bankrupt</text>';
          if (off || p[p.length - 1]) h += '<circle r="4.5" class="on" cx="' + X(n - 1) + '" cy="' + Y[1] + '"/><text class="on" x="' + (X(n - 1) - 10) + '" y="' + (Y[1] + 4) + '" text-anchor="end">' + (off ? 'You own Netflix' : 'Your timeline') + '</text>';
        }
        bbTl.innerHTML = h;
      }
      function bbMeters(bbV, nfV) {
        var mx = Math.max(bbV, nfV, .1);
        document.getElementById('bbMtrBB').style.setProperty('--m', (bbV / mx).toFixed(4));
        document.getElementById('bbMtrNF').style.setProperty('--m', (nfV / mx).toFixed(4));
      }
      /* the market values count to their new figures, tabular, while the meters slide */
      var bbCur = [5.0, 0.3], bbCnt = null;
      function bbCaps(bbV, nfV) {
        bbCapBB.classList.remove('gone'); bbCapNF.classList.remove('gone');
        bbMeters(bbV, nfV);
        var a = bbCur.slice();
        if (bbCnt) bbCnt();
        bbCnt = labTw(900, function (e) {
          bbCur = [a[0] + (bbV - a[0]) * e, a[1] + (nfV - a[1]) * e];
          bbCapBB.textContent = '$' + bbCur[0].toFixed(1) + 'B'; bbCapNF.textContent = '$' + bbCur[1].toFixed(1) + 'B';
        });
      }
      function bbShow() {
        var r = ROUNDS[bbState.i];
        bbYearEl.textContent = 'year ' + r.y;
        bbScene.innerHTML = r.scene;
        bbWhisper.textContent = r.whisper;
        bbA.textContent = r.a.t; bbB.textContent = r.b.t;
        bbA.style.display = ''; bbB.style.display = '';
        bbTree();
        bbNext.style.display = 'none'; bbAgain.style.display = 'none';
      }
      function bbEnd(bought) {
        bbState.over = true;
        bbA.style.display = 'none'; bbB.style.display = 'none'; bbNext.style.display = 'none';
        bbAgain.style.display = '';
        if (bought) {
          bbCaps(280.0, 0);
          bbCapNF.classList.add('gone');
          bbTree(true);
          bbYearEl.textContent = 'year 2026';
          bbScene.innerHTML = 'There is no game left to play. You paid fifty million dollars for the company that becomes worth <b>hundreds of billions</b>. In the real meeting, Blockbuster passed, and Marc Randolph wrote that its team fought not to laugh. You did the one thing nine thousand stores made almost impossible: you took a small thing seriously.';
          bbWhisper.textContent = 'The machine ends here when you say yes in round one.';
          bbLineEl.textContent = 'Final score: you beat the timeline in one move. The real Blockbuster needed four chances and missed them all.';
          return;
        }
        bbCapBB.classList.add('gone');
        bbTree(true);
        bbScene.innerHTML = 'September 2010: Blockbuster files for bankruptcy. Today <b>one store remains</b>, in Bend, Oregon; it sells nostalgia and rents itself out for sleepovers. Netflix is worth hundreds of billions. The fifty million dollar email was answered with a laugh.';
        bbWhisper.textContent = 'None of the people in this story were stupid. That is what makes it a machine worth playing twice.';
        bbLineEl.textContent = 'You made ' + bbState.score + ' of 4 calls better than the timeline did. Rewind and try the other doors; they all really existed.';
      }
      function bbChoose(which) {
        if (bbState.over) return;
        var r = ROUNDS[bbState.i], c = which === 'a' ? r.a : r.b;
        if (c.buyout) { bbState.score = 4; bbState.path.push(2); bbEnd(true); return; }
        if (c.good) bbState.score++;
        bbState.path.push(which === r.h ? 0 : 1);
        bbScene.innerHTML = c.out;
        bbWhisper.textContent = '';
        bbCaps(c.bb, c.nf);
        bbA.style.display = 'none'; bbB.style.display = 'none';
        bbTree(true);
        if (bbState.i === ROUNDS.length - 1) { bbEnd(false); return; }
        bbNext.style.display = '';
      }
      bbA.addEventListener('click', function () { bbChoose('a'); });
      bbB.addEventListener('click', function () { bbChoose('b'); });
      bbNext.addEventListener('click', function () { bbState.i++; bbShow(); });
      bbAgain.addEventListener('click', function () {
        bbState.i = 0; bbState.score = 0; bbState.over = false; bbState.path = [];
        bbCaps(5.0, 0.3); bbLineEl.textContent = 'Every scene here happened. Marc Randolph, who was in the room, wrote that Blockbuster’s team fought not to laugh.';
        bbShow();
      });
      bbMeters(5.0, 0.3);
      bbShow();
      labRepaint(function () { bbTree(); }, bbTl);
    return {};
  });
})();
