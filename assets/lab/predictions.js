/* Predictions, checked (Lab No. 29, Wing IV): seven famous forecasts, each with a date and a source. Call each one hit or miss
   before you see what happened; the six that can be scored give you a Brier score. Moved from the World in v3.1: the forecasts,
   the sources, the scoring and the saved card are the World room's, unchanged. Registers with LAB_KIT.mount('predictions'). ES5. */
(function () {
  'use strict';
  var K = window.LAB_KIT;
  if (!K || K.v < 1) return;
  var W = window, D = document, SLUG = 'predictions';
  var HTML = [
    '<div class="lab-pred">',
    '<div class="pd" id="pdRoom">',
    '  <div class="pd-rail">',
    '  <div class="pd-line" id="pdLine">',
    '    <div class="pd-axis" aria-hidden="true"><i class="pd-rule"></i></div>',
    '    <ol class="pd-marks" aria-label="Forecasts by date">',
    '      <li><button type="button" class="pd-mark is-on" data-i="0" data-y="1929" aria-controls="pd-1" aria-label="1929, Irving Fisher"><i class="pd-stem" aria-hidden="true"></i><i class="pd-dot" aria-hidden="true"></i><span class="pd-ml" aria-hidden="true"><span class="y">1929</span><span class="w">Fisher</span></span></button></li>',
    '      <li><button type="button" class="pd-mark" data-i="1" data-y="1945" aria-controls="pd-2" aria-label="1945, Arthur C. Clarke"><i class="pd-stem" aria-hidden="true"></i><i class="pd-dot" aria-hidden="true"></i><span class="pd-ml" aria-hidden="true"><span class="y">1945</span><span class="w">Clarke</span></span></button></li>',
    '      <li><button type="button" class="pd-mark" data-i="2" data-y="1965" aria-controls="pd-3" aria-label="1965, Gordon Moore"><i class="pd-stem" aria-hidden="true"></i><i class="pd-dot" aria-hidden="true"></i><span class="pd-ml" aria-hidden="true"><span class="y">1965</span><span class="w">Moore</span></span></button></li>',
    '      <li><button type="button" class="pd-mark" data-i="3" data-y="1977" aria-controls="pd-4" aria-label="1977, Ken Olsen"><i class="pd-stem" aria-hidden="true"></i><i class="pd-dot" aria-hidden="true"></i><span class="pd-ml" aria-hidden="true"><span class="y">1977</span><span class="w">Olsen</span></span></button></li>',
    '      <li><button type="button" class="pd-mark" data-i="4" data-y="1998" aria-controls="pd-5" aria-label="1998, Paul Krugman"><i class="pd-stem" aria-hidden="true"></i><i class="pd-dot" aria-hidden="true"></i><span class="pd-ml" aria-hidden="true"><span class="y">1998</span><span class="w">Krugman</span></span></button></li>',
    '      <li><button type="button" class="pd-mark" data-i="5" data-y="2007" aria-controls="pd-6" aria-label="2007, Steve Ballmer"><i class="pd-stem" aria-hidden="true"></i><i class="pd-dot" aria-hidden="true"></i><span class="pd-ml" aria-hidden="true"><span class="y">2007</span><span class="w">Ballmer</span></span></button></li>',
    '      <li><button type="button" class="pd-mark" data-i="6" data-y="2008" aria-controls="pd-7" aria-label="2008, Jim Keyes"><i class="pd-stem" aria-hidden="true"></i><i class="pd-dot" aria-hidden="true"></i><span class="pd-ml" aria-hidden="true"><span class="y">2008</span><span class="w">Keyes</span></span></button></li>',
    '    </ol>',
    '  </div>',
    '  </div>',
    '  <p class="pd-ins">Press Hit or Miss. Set how sure you are. Then reveal.</p>',
    '  <div class="pd-cards">',
    '    <article class="pd-card is-on" id="pd-1" data-out="0" data-src="https://www.fool.com/investing/general/2013/10/15/theres-no-such-thing-as-a-permanently-high-plateau.aspx" aria-labelledby="pd-1-w">',
    '      <div class="pd-q">',
    '        <p class="pd-when"><span class="pd-n">01 / 07</span>Oct 15, 1929</p>',
    '        <blockquote class="pd-words" id="pd-1-w"><p>“Stock prices have reached what looks like a permanently high plateau.”</p></blockquote>',
    '        <p class="pd-who"><b>Irving Fisher</b> · Yale economist, speaking in New York</p>',
    '        <p class="pd-s"><span>Source</span>The New York Times, Oct 16, 1929</p>',
    '      </div>',
    '      <div class="pd-side">',
    '        <div class="pd-act">',
    '          <div class="pd-hm" role="group" aria-label="Hit or miss"><button type="button" data-h="1" aria-pressed="false">Hit</button><button type="button" data-h="0" aria-pressed="false">Miss</button></div>',
    '          <label class="pd-conf" for="pd-1-c"><span>How sure are you?</span><output for="pd-1-c">70%</output></label><input class="wb-range pd-range" type="range" id="pd-1-c" min="50" max="100" step="5" value="70">',
    '          <button type="button" class="ebtn pd-go" disabled>Reveal</button>',
    '        </div>',
    '        <div class="pd-res">',
    '          <p class="pd-chip" data-out="0">Miss</p>',
    '          <p class="pd-yours"><span>Your call</span><b></b></p>',
    '          <p class="pd-what">Two weeks later the market crashed. The Dow, 381.17 at its Sept 3 peak, bottomed at 41.22 on July 8, 1932, down 89%.</p>',
    '          <p class="pd-ctx">Fisher had bought stocks on margin and lost his fortune.</p>',
    '          <button type="button" class="pd-next"><span class="t">Next forecast</span><span class="arr" aria-hidden="true">→</span></button>',
    '        </div>',
    '      </div>',
    '    </article>',
    '    <article class="pd-card" id="pd-2" data-out="1" data-src="https://www.rfcafe.com/references/wireless-world/extra-terrestrial-relays-arthur-c-clarke-oct-1945-wireless-world.htm https://en.wikipedia.org/wiki/Syncom" aria-labelledby="pd-2-w">',
    '      <div class="pd-q">',
    '        <p class="pd-when"><span class="pd-n">02 / 07</span>Oct 1945</p>',
    '        <blockquote class="pd-words" id="pd-2-w"><p>“Three satellite stations would ensure complete coverage of the globe.”</p></blockquote>',
    '        <p class="pd-who"><b>Arthur C. Clarke</b> · Then a Royal Air Force radar instructor</p>',
    '        <p class="pd-s"><span>Source</span>Wireless World, Oct 1945, “Extra-Terrestrial Relays” (Fig. 3 caption)</p>',
    '      </div>',
    '      <div class="pd-side">',
    '        <div class="pd-act">',
    '          <div class="pd-hm" role="group" aria-label="Hit or miss"><button type="button" data-h="1" aria-pressed="false">Hit</button><button type="button" data-h="0" aria-pressed="false">Miss</button></div>',
    '          <label class="pd-conf" for="pd-2-c"><span>How sure are you?</span><output for="pd-2-c">70%</output></label><input class="wb-range pd-range" type="range" id="pd-2-c" min="50" max="100" step="5" value="70">',
    '          <button type="button" class="ebtn pd-go" disabled>Reveal</button>',
    '        </div>',
    '        <div class="pd-res">',
    '          <p class="pd-chip" data-out="1">Hit</p>',
    '          <p class="pd-yours"><span>Your call</span><b></b></p>',
    '          <p class="pd-what">Syncom 3 reached the 24-hour orbit in August 1964 and carried the Tokyo Olympics live to the United States.</p>',
    '          <p class="pd-ctx">Clarke gave the orbit’s radius, 42,000 km from Earth’s center. It is now called the Clarke orbit.</p>',
    '          <button type="button" class="pd-next"><span class="t">Next forecast</span><span class="arr" aria-hidden="true">→</span></button>',
    '        </div>',
    '      </div>',
    '    </article>',
    '    <article class="pd-card" id="pd-3" data-out="1" data-src="https://www.computerhistory.org/storageengine/moore-s-law-prevails-for-50-years/ https://www.computerhistory.org/collections/catalog/102770822" aria-labelledby="pd-3-w">',
    '      <div class="pd-q">',
    '        <p class="pd-when"><span class="pd-n">03 / 07</span>Apr 19, 1965</p>',
    '        <blockquote class="pd-words" id="pd-3-w"><p>“By 1975, the number of components per integrated circuit for minimum cost will be 65,000.”</p></blockquote>',
    '        <p class="pd-who"><b>Gordon Moore</b> · Director of R&D at Fairchild Semiconductor</p>',
    '        <p class="pd-s"><span>Source</span>Electronics, vol. 38, no. 8, “Cramming more components onto integrated circuits”</p>',
    '      </div>',
    '      <div class="pd-side">',
    '        <div class="pd-act">',
    '          <div class="pd-hm" role="group" aria-label="Hit or miss"><button type="button" data-h="1" aria-pressed="false">Hit</button><button type="button" data-h="0" aria-pressed="false">Miss</button></div>',
    '          <label class="pd-conf" for="pd-3-c"><span>How sure are you?</span><output for="pd-3-c">70%</output></label><input class="wb-range pd-range" type="range" id="pd-3-c" min="50" max="100" step="5" value="70">',
    '          <button type="button" class="ebtn pd-go" disabled>Reveal</button>',
    '        </div>',
    '        <div class="pd-res">',
    '          <p class="pd-chip" data-out="1">Hit, revised</p>',
    '          <p class="pd-yours"><span>Your call</span><b></b></p>',
    '          <p class="pd-what">In 1975 Moore reviewed the data and revised the pace to a doubling every two years. That rate held for decades as Moore’s law.</p>',
    '          <p class="pd-ctx">The 1965 forecast assumed a doubling every year.</p>',
    '          <button type="button" class="pd-next"><span class="t">Next forecast</span><span class="arr" aria-hidden="true">→</span></button>',
    '        </div>',
    '      </div>',
    '    </article>',
    '    <article class="pd-card" id="pd-4" data-out="x" data-src="https://www.snopes.com/fact-check/ken-olsen/ https://listserv.linguistlist.org/pipermail/ads-l/2016-May/142292.html" aria-labelledby="pd-4-w">',
    '      <div class="pd-q">',
    '        <p class="pd-when"><span class="pd-n">04 / 07</span>1977</p>',
    '        <blockquote class="pd-words" id="pd-4-w"><p>“There is no reason for any individual to have a computer in his home.”</p></blockquote>',
    '        <p class="pd-who"><b>Ken Olsen</b> · Founder of Digital Equipment Corporation, at a World Future Society meeting in Boston</p>',
    '        <p class="pd-s"><span>Source</span>Attributed. No contemporary transcript or recording has surfaced.</p>',
    '      </div>',
    '      <div class="pd-side">',
    '        <div class="pd-act">',
    '          <div class="pd-hm" role="group" aria-label="Hit or miss"><button type="button" data-h="1" aria-pressed="false">Hit</button><button type="button" data-h="0" aria-pressed="false">Miss</button></div>',
    '          <label class="pd-conf" for="pd-4-c"><span>How sure are you?</span><output for="pd-4-c">70%</output></label><input class="wb-range pd-range" type="range" id="pd-4-c" min="50" max="100" step="5" value="70">',
    '          <button type="button" class="ebtn pd-go" disabled>Reveal</button>',
    '        </div>',
    '        <div class="pd-res">',
    '          <p class="pd-chip" data-out="x">Contested, not scored</p>',
    '          <p class="pd-yours"><span>Your call</span><b></b></p>',
    '          <p class="pd-what">Olsen said he meant computers that run the house: lights, heat, meals. The famous version drops that context.</p>',
    '          <p class="pd-ctx">Check the original words before you score anyone’s forecast.</p>',
    '          <button type="button" class="pd-next"><span class="t">Next forecast</span><span class="arr" aria-hidden="true">→</span></button>',
    '        </div>',
    '      </div>',
    '    </article>',
    '    <article class="pd-card" id="pd-5" data-out="0" data-src="https://quoteinvestigator.com/2023/10/26/internet-fax/ https://www.sec.gov/Archives/edgar/data/1018724/000119312506018453/dex991.htm" aria-labelledby="pd-5-w">',
    '      <div class="pd-q">',
    '        <p class="pd-when"><span class="pd-n">05 / 07</span>June 10, 1998</p>',
    '        <blockquote class="pd-words" id="pd-5-w"><p>“By 2005 or so, it will become clear that the Internet’s impact on the economy has been no greater than the fax machine’s.”</p></blockquote>',
    '        <p class="pd-who"><b>Paul Krugman</b> · Economist, then at MIT</p>',
    '        <p class="pd-s"><span>Source</span>Red Herring, “Why most economists’ predictions are wrong”</p>',
    '      </div>',
    '      <div class="pd-side">',
    '        <div class="pd-act">',
    '          <div class="pd-hm" role="group" aria-label="Hit or miss"><button type="button" data-h="1" aria-pressed="false">Hit</button><button type="button" data-h="0" aria-pressed="false">Miss</button></div>',
    '          <label class="pd-conf" for="pd-5-c"><span>How sure are you?</span><output for="pd-5-c">70%</output></label><input class="wb-range pd-range" type="range" id="pd-5-c" min="50" max="100" step="5" value="70">',
    '          <button type="button" class="ebtn pd-go" disabled>Reveal</button>',
    '        </div>',
    '        <div class="pd-res">',
    '          <p class="pd-chip" data-out="0">Miss</p>',
    '          <p class="pd-yours"><span>Your call</span><b></b></p>',
    '          <p class="pd-what">Google went public in August 2004. Amazon’s sales in 2005 were $8.49 billion.</p>',
    '          <p class="pd-ctx">Krugman later said the piece was meant to be fun and provocative.</p>',
    '          <button type="button" class="pd-next"><span class="t">Next forecast</span><span class="arr" aria-hidden="true">→</span></button>',
    '        </div>',
    '      </div>',
    '    </article>',
    '    <article class="pd-card" id="pd-6" data-out="0" data-src="https://regex.info/blog/2011-01-11/1693 https://fortune.com/2016/07/27/apple-one-billion-iphones/" aria-labelledby="pd-6-w">',
    '      <div class="pd-q">',
    '        <p class="pd-when"><span class="pd-n">06 / 07</span>Apr 2007</p>',
    '        <blockquote class="pd-words" id="pd-6-w"><p>“There’s no chance that the iPhone is going to get any significant market share. No chance.”</p></blockquote>',
    '        <p class="pd-who"><b>Steve Ballmer</b> · CEO of Microsoft</p>',
    '        <p class="pd-s"><span>Source</span>USA Today, interview with David Lieberman, Apr 29, 2007</p>',
    '      </div>',
    '      <div class="pd-side">',
    '        <div class="pd-act">',
    '          <div class="pd-hm" role="group" aria-label="Hit or miss"><button type="button" data-h="1" aria-pressed="false">Hit</button><button type="button" data-h="0" aria-pressed="false">Miss</button></div>',
    '          <label class="pd-conf" for="pd-6-c"><span>How sure are you?</span><output for="pd-6-c">70%</output></label><input class="wb-range pd-range" type="range" id="pd-6-c" min="50" max="100" step="5" value="70">',
    '          <button type="button" class="ebtn pd-go" disabled>Reveal</button>',
    '        </div>',
    '        <div class="pd-res">',
    '          <p class="pd-chip" data-out="0">Miss on share</p>',
    '          <p class="pd-yours"><span>Your call</span><b></b></p>',
    '          <p class="pd-what">Apple sold its billionth iPhone in July 2016.</p>',
    '          <p class="pd-ctx">He was partly right on price. About two months after launch, Apple cut the 8GB iPhone from $599 to $399.</p>',
    '          <button type="button" class="pd-next"><span class="t">Next forecast</span><span class="arr" aria-hidden="true">→</span></button>',
    '        </div>',
    '      </div>',
    '    </article>',
    '    <article class="pd-card" id="pd-7" data-out="0" data-src="https://www.fool.com/investing/general/2008/12/10/blockbuster-ceo-has-answers.aspx https://www.bloomberg.com/news/2010-09-23/blockbuster-video-rental-chain-files-for-bankruptcy-protection.html" aria-labelledby="pd-7-w">',
    '      <div class="pd-q">',
    '        <p class="pd-when"><span class="pd-n">07 / 07</span>Dec 2008</p>',
    '        <blockquote class="pd-words" id="pd-7-w"><p>“Neither RedBox nor Netflix are even on the radar screen in terms of competition.”</p></blockquote>',
    '        <p class="pd-who"><b>Jim Keyes</b> · CEO of Blockbuster</p>',
    '        <p class="pd-s"><span>Source</span>Rick Munarriz, The Motley Fool, Dec 2008</p>',
    '      </div>',
    '      <div class="pd-side">',
    '        <div class="pd-act">',
    '          <div class="pd-hm" role="group" aria-label="Hit or miss"><button type="button" data-h="1" aria-pressed="false">Hit</button><button type="button" data-h="0" aria-pressed="false">Miss</button></div>',
    '          <label class="pd-conf" for="pd-7-c"><span>How sure are you?</span><output for="pd-7-c">70%</output></label><input class="wb-range pd-range" type="range" id="pd-7-c" min="50" max="100" step="5" value="70">',
    '          <button type="button" class="ebtn pd-go" disabled>Reveal</button>',
    '        </div>',
    '        <div class="pd-res">',
    '          <p class="pd-chip" data-out="0">Miss</p>',
    '          <p class="pd-yours"><span>Your call</span><b></b></p>',
    '          <p class="pd-what">Blockbuster filed for bankruptcy on Sept 23, 2010.</p>',
    '          <p class="pd-ctx">Keyes later blamed Blockbuster’s debt more than Netflix.</p>',
    '          <button type="button" class="pd-next"><span class="t">Next forecast</span><span class="arr" aria-hidden="true">→</span></button>',
    '        </div>',
    '      </div>',
    '    </article>',
    '  </div>',
    '  <div class="pd-score" id="pdScore" data-ground="espresso" hidden>',
    '    <p class="pd-big">You called <b id="pdN">0</b> of 6 scored forecasts.</p>',
    '    <div class="pd-brier">',
    '      <p class="pd-bl"><span class="pd-bk">Brier score</span> <b id="pdB">0.25</b><span class="pd-bd">.</span></p>',
    '      <p>The average of (your probability − what happened)² across the six. Lower is better; always saying 50% scores 0.25.</p>',
    '      <div class="pd-scale" aria-hidden="true"><i class="pd-sc-track"></i><i class="pd-sc-t" style="--at:0"><span>0</span></i><i class="pd-sc-t" style="--at:.25"><span>0.25</span></i><i class="pd-sc-t" style="--at:1"><span>1</span></i><i class="pd-sc-you" id="pdYou"></i></div>',
    '    </div>',
    '    <p class="pd-ol">The seventh, Olsen’s, is contested and not scored.</p>',
    '    <div class="pd-act2"><button type="button" class="ebtn" id="pdSave">Save the result<span class="arr arr--down" aria-hidden="true">↓</span></button></div>',
    '  </div>',
    '  <p class="pd-src">Every quotation is checked against its first publication or the closest surviving source. Olsen’s is marked as attributed.</p>',
    '</div>',
    '</div>'
  ].join('\n');

  function init(root) {
    root.innerHTML = HTML;
    function $(id) { return D.getElementById(id); }
    function each(list, fn) { Array.prototype.forEach.call(list || [], fn); }
    function reduced() { return K.reducedMotion(); }
    function rangeFill(r) { var lo = +r.min, hi = +r.max; r.style.setProperty('--sfill', ((+r.value - lo) / (hi - lo) * 100).toFixed(1) + '%'); }
    function saved(btn) { if (W.PS && PS.confirm) PS.confirm(btn, 'Saved'); }
    function near(el, fn, margin) {
      if (!el) return;
      if (!('IntersectionObserver' in W)) { fn(); return; }
      var io = new IntersectionObserver(function (es) {
        if (!es.some(function (e) { return e.isIntersecting; })) return;
        io.disconnect(); fn();
      }, { rootMargin: margin || '800px 0px' });
      io.observe(el);
    }

    var room = $('pdRoom');
    room.classList.add('js');
    var line = $('pdLine'), axis = line.querySelector('.pd-axis'), marks = [].slice.call(room.querySelectorAll('.pd-mark')), cards = [].slice.call(room.querySelectorAll('.pd-card'));
    var score = $('pdScore'), Y0 = 1924, Y1 = 2015, cur = 0, st = cards.map(function () { return { h: null, c: 70, done: false }; });
    function x(y) { return (y - Y0) / (Y1 - Y0); }
    for (var y = 1930; y <= 2000; y += 10) {
      var d = D.createElement('i'); d.className = 'pd-dec'; d.style.left = (x(y) * 100).toFixed(2) + '%';
      d.innerHTML = '<span>' + y + '</span>'; axis.appendChild(d);
    }
    marks.forEach(function (m, k) { m.style.left = (x(+m.getAttribute('data-y')) * 100).toFixed(2) + '%'; m.style.setProperty('--k', k); });
    /* The labels, laid out by date. Each takes the lowest tier where its text clears every other label on that tier, and no
       leader runs through it; if the right of its pin is taken, it flips to the left; if neither side is free, it rises a tier.
       A leader climbs through every tier below its own label, so a label may sit over another pin only when that pin's label
       is lower. When a greedy choice traps a later label, the pass steps back and tries the next choice, keeping the rule to
       as few tiers as the dates allow. */
    var SEP = 14, CLR = 7, DOT = 15, TIERS = 6, lastW = -1;
    function lay(force) {
      var w = line.clientWidth;
      if (!w || (w === lastW && force !== true)) return;
      lastW = w;
      var lid = W.getComputedStyle(marks[0].querySelector('.pd-ml .w')).display === 'none', GAP = parseFloat(W.getComputedStyle(line).getPropertyValue('--pd-gap')) || 8;
      var its = marks.map(function (m) { return { m: m, x: x(+m.getAttribute('data-y')) * w, tw: m.querySelector('.pd-ml').offsetWidth }; });
      its.sort(function (a, b) { return a.x - b.x; });
      function fits(p, placed, strict) {
        if (p.a < 0 || p.b > w) return false;
        for (var i = 0; i < placed.length; i++) {
          var q = placed[i];
          if (q.l === p.l && p.a < q.b + SEP && p.b > q.a - SEP) return false;
          if (!strict) continue;
          if (q.l >= p.l && q.x > p.a - CLR && q.x < p.b + CLR) return false;
          if (p.l >= q.l && p.x > q.a - CLR && p.x < q.b + CLR) return false;
          /* on a phone the dot rides the top of its leader, so two pins a year apart cannot share a tier */
          if (lid && q.l === p.l && Math.abs(q.x - p.x) < DOT) return false;
        }
        return true;
      }
      function solve(strict) {
        var budget = 20000, got = null;
        function step(k, placed, cap) {
          if (k === its.length) { got = placed.slice(); return true; }
          var it = its[k];
          for (var l = 0; l <= cap; l++) {
            for (var s = 0; s < 2; s++) {
              if (--budget < 0) return false;
              var a = s ? it.x - GAP - it.tw : it.x + GAP, p = { it: it, a: a, b: a + it.tw, l: l, left: !!s, x: it.x };
              if (!fits(p, placed, strict)) continue;
              placed.push(p);
              if (step(k + 1, placed, cap)) return true;
              placed.pop();
            }
          }
          return false;
        }
        for (var cap = 0; cap < TIERS && !got && budget > 0; cap++) step(0, [], cap);
        return got;
      }
      /* a screen too narrow for clean leaders still gets labels that never overlap */
      var plan = solve(true) || solve(false) || its.map(function (it, k) { return { it: it, l: k % TIERS, left: it.x > w / 2 }; });
      var top = 0;
      plan.forEach(function (p) {
        p.it.m.classList.toggle('is-left', p.left); p.it.m.style.setProperty('--l', p.l); top = Math.max(top, p.l);
      });
      line.style.setProperty('--lv', top + 1);
    }
    lay(true);
    if (W.ResizeObserver) new ResizeObserver(function () { lay(); }).observe(line); else W.addEventListener('resize', function () { lay(); });
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { lay(true); });
    near(line, function () { line.classList.add('is-drawn'); }, '0px 0px -12% 0px');
    /* the stack is as tall as the card in front; when that changes, what sits below glides to its new place */
    var stack = room.querySelector('.pd-cards'), hT = 0;
    function settle(fn) {
      var h0 = stack.offsetHeight;
      clearTimeout(hT); stack.classList.remove('is-sizing'); stack.style.height = '';
      fn();
      var h1 = stack.offsetHeight;
      if (reduced() || !h0 || Math.abs(h1 - h0) < 2) return;
      stack.style.height = h0 + 'px'; void stack.offsetHeight;
      stack.classList.add('is-sizing'); stack.style.height = h1 + 'px';
      var ms = (parseFloat(W.getComputedStyle(stack).transitionDuration) || 0.56) * 1000;
      hT = setTimeout(function () { stack.classList.remove('is-sizing'); stack.style.height = ''; }, ms + 40);
    }
    function show(i, focus) {
      function flip() {
        cur = i;
        cards.forEach(function (c, k) { var on = k === i; c.classList.toggle('is-on', on); c.inert = !on; if (!on) c.classList.remove('is-fresh'); });
        marks.forEach(function (m, k) { m.classList.toggle('is-on', k === i); if (k === i) m.setAttribute('aria-current', 'true'); else m.removeAttribute('aria-current'); });
      }
      if (i !== cur) settle(flip); else flip();
      if (focus) { cards[i].tabIndex = -1; try { cards[i].focus({ preventScroll: true }); } catch (e) {} }
    }
    function nextOpen(from) {
      for (var k = 1; k <= cards.length; k++) { var j = (from + k) % cards.length; if (!st[j].done) return j; }
      return -1;
    }
    function result() {
      var n = 0, sum = 0, m = 0, dots = [];
      cards.forEach(function (c, k) {
        var o = c.getAttribute('data-out');
        if (o === 'x') return;
        var s = st[k], p = s.h ? s.c / 100 : 1 - s.c / 100, ok = String(s.h) === o;
        if (ok) n++;
        sum += Math.pow(p - +o, 2); m++; dots.push(ok);
      });
      return { n: n, brier: m ? sum / m : 0, dots: dots };
    }
    function scored() { return cards.every(function (c, k) { return c.getAttribute('data-out') === 'x' || st[k].done; }); }
    function finish() {
      var r = result(), first = score.hidden;
      $('pdN').textContent = r.n; $('pdB').textContent = r.brier.toFixed(2);
      $('pdYou').style.setProperty('--at', Math.min(1, r.brier).toFixed(4));
      score.hidden = false;
      if (first && !reduced()) { score.classList.remove('is-in'); void score.offsetWidth; score.classList.add('is-in'); }
    }
    function reveal(i) {
      var s = st[i], c = cards[i], o = c.getAttribute('data-out');
      if (s.done || s.h == null) return;
      s.done = true;
      c.querySelector('.pd-yours b').textContent = (s.h ? 'Hit' : 'Miss') + ' at ' + s.c + '%';
      settle(function () { c.classList.add('is-done', 'is-fresh'); });
      marks[i].classList.add(o === 'x' ? 'is-x' : String(s.h) === o ? 'is-right' : 'is-wrong');
      var res = c.querySelector('.pd-res'); res.tabIndex = -1;
      try { res.focus({ preventScroll: true }); } catch (e) {}
      if (nextOpen(i) < 0) each(room.querySelectorAll('.pd-next'), function (b) { b.hidden = true; });
      if (scored()) finish();
    }
    cards.forEach(function (c, i) {
      var hm = [].slice.call(c.querySelectorAll('.pd-hm button')), rg = c.querySelector('.pd-range'), out = c.querySelector('.pd-conf output'), go = c.querySelector('.pd-go'), nx = c.querySelector('.pd-next');
      rangeFill(rg);
      hm.forEach(function (b) {
        b.addEventListener('click', function () {
          st[i].h = +b.getAttribute('data-h');
          hm.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
          go.disabled = false;
        });
      });
      rg.addEventListener('input', function () { st[i].c = +rg.value; out.textContent = rg.value + '%'; rangeFill(rg); });
      go.addEventListener('click', function () { reveal(i); });
      nx.addEventListener('click', function () { var j = nextOpen(i); if (j > -1) show(j, true); });
    });
    marks.forEach(function (m, k) {
      m.addEventListener('click', function () { show(k, false); });
      m.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? k + 1 : e.key === 'ArrowLeft' ? k - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? marks.length - 1 : null;
        if (n === null || !marks[n]) return;
        e.preventDefault(); marks[n].focus(); show(n, false);
      });
    });
    $('pdSave').addEventListener('click', function () {
      var r = result();
      K.savePNG('predictions-checked.png', 'Predictions, checked · pedrumshokouhi.com/experiments#exp-29', 'I called ' + r.n + ' of 6. Brier ' + r.brier.toFixed(2) + '.',
        'Fisher 1929 · Clarke 1945 · Moore 1965 · Krugman 1998 · Ballmer 2007 · Keyes 2008', r.dots);
      saved($('pdSave'));
    });
    show(0, false);
    K.hook(SLUG, { result: result, show: show, call: function (i, h, c) { var cd = cards[i]; cd.querySelectorAll('.pd-hm button')[h ? 0 : 1].click(); if (c != null) { var rg = cd.querySelector('.pd-range'); rg.value = c; rg.dispatchEvent(new Event('input', { bubbles: true })); } cd.querySelector('.pd-go').click(); } });
    return { theme: function () { lay(true); } };
  }
  K.mount(SLUG, null, init);
})();
