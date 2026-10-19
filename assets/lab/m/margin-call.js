/* P.S. Lab, No. 40: Conviction: the margin call. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<details class="brief"><summary>Brief</summary><p>You founded an AI-focused hedge fund: long the companies that build intelligence, short the software it replaces. The thesis returned triple digits, and you levered it. On Monday before the open, three things are on your desk: an overnight market briefing, a memo from your risk officer and a margin notice. To win you have to stay solvent, liquid and in control long enough for being right to matter. Inspired by a real fund’s reported July 2026 drawdown. Everything playable below is a labeled simulation, not a trading record.</p></details>\n'
    + '      <div class="cv-shell lx-bleed" data-ground="espresso" id="cvShell">\n'
    + '        <div class="cv-strip cv-mono" id="cvStrip"></div>\n'
    + '        <div class="cv-week" id="cvWeek" aria-hidden="true"></div>\n'
    + '        <div class="cv-gauge" id="cvGauge" aria-hidden="true"></div>\n'
    + '        <div class="cv-feed" id="cvFeed" aria-live="polite"></div>\n'
    + '        <table class="cv-table cv-mono" id="cvTable"></table>\n'
    + '        <div class="cv-prev" id="cvPrev">Select a position, set a size, and the desk will price the order before you commit.</div>\n'
    + '        <div class="cv-size">\n'
    + '          <span class="cv-k" aria-hidden="true">Order size</span>\n'
    + '          <input type="range" class="cv-slider" id="cvSize" min="5" max="100" step="5" value="25" aria-label="Order size, percent of position">\n'
    + '          <output class="cv-out" id="cvSizeO" for="cvSize">25%</output>\n'
    + '        </div>\n'
    + '        <div class="cv-actions">\n'
    + '          <button class="cv-btn" id="cvTrade" type="button">Sell 25%</button>\n'
    + '          <button class="cv-btn" id="cvXfer" type="button">Move central cash</button>\n'
    + '          <button class="cv-btn" id="cvPuts" type="button">Buy $250M AI puts</button>\n'
    + '          <button class="cv-btn" id="cvCall" type="button">Call the broker</button>\n'
    + '        </div>\n'
    + '        <div class="cv-actions">\n'
    + '          <button class="cv-btn primary" id="cvNext" type="button">Advance<span class="arr" aria-hidden="true">→</span></button>\n'
    + '          <button class="cv-btn" id="cvDay" type="button">Run the day</button>\n'
    + '          <span class="cv-sp"></span>\n'
    + '          <button class="cv-btn" id="cvReplay" type="button">Replay this week</button>\n'
    + '          <button class="cv-btn" id="cvNew" type="button">New week</button>\n'
    + '        </div>\n'
    + '        <div class="cv-rescue" id="cvRescue" style="display:none"></div>\n'
    + '        <div class="cv-aar" id="cvAar" style="display:none"></div>\n'
    + '        <details>\n'
    + '          <summary>Case file · the real story and where the fiction begins</summary>\n'
    + '          <p><b>Reported facts:</b> Reuters reported that Situational Awareness, the AI-focused fund founded by Leopold Aschenbrenner, lost about 67% in July 2026 during an AI stock rout while remaining up roughly 80% for the year, sold substantial public equities with Citadel among the buyers, and removed its leverage (<a href="https://www.reuters.com/business/finance/situational-awareness-portfolio-sinks-67-july-ai-stock-rout-letter-shows-2026-07-31/" target="_blank" rel="noopener">Reuters, July 31, 2026</a>; <a href="https://www.reuters.com/legal/legalindustry/with-situational-awareness-ai-deal-citadels-griffin-rides-rescue-again-2026-07-31/" target="_blank" rel="noopener">Reuters on the Citadel purchase</a>).</p>\n'
    + '          <p><b>Everything else here is fiction:</b> the tickers, prices, brokers, characters, dialogue, financing terms, deadlines, and every number the game generates. The starting book, margin rules, and market paths are labeled model assumptions, not a reconstruction. Your playthrough is a counterfactual; the game does not force the reported 67% on you, and no outcome here says anything about what the real fund should have done.</p>\n'
    + '        </details>\n'
    + '        <details>\n'
    + '          <summary>Model assumptions</summary>\n'
    + '          <p>Synthetic book: $2,800M long across six AI-infrastructure names, $600M short software, $100M private, $100M central cash, $600M short proceeds held at brokers, $2,000M financing debt, NAV $1,000M. Gross public exposure 3.4x NAV, net 2.2x, debt 2.0x; these are three different numbers. Positions, proceeds, and debt split across two fictional prime brokers. Illustrative maintenance: 20% on longs, 30% on shorts, add-ons disclosed when applied. Sale proceeds count as collateral at the executing broker immediately but transfer elsewhere next day. Prices follow a seeded two-factor model (market and AI sentiment) with regime shifts; your orders pay spread and impact that grow with size, scarcity, and stress, and large positions cannot exit in one tick. Same seed plus same actions reproduces the same week.</p>\n'
    + '        </details>\n'
    + '        <p class="cv-note" id="cvSeedNote"></p>\n'
    + '      </div>\n'
    + '      <p class="eline">The trade only needs to be right eventually. The fund needs to be alive on Thursday at 3 p.m.</p>';
  LAB_KIT.mount('margin-call', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- 37: conviction, the margin call ---------- */

      var CV_SECS = [
        { id: 'MEM', tk: 'SIM_MEMORY', nm: 'Hyperion Memory', side: 1, v0: 750, vol: .045, bm: 1.1, ba: 1.8, adv: 400, sp: .0012, why: 'HBM supplier, sold out through next year' },
        { id: 'GPU', tk: 'SIM_GPUCLOUD', nm: 'Vantage Compute', side: 1, v0: 650, vol: .05, bm: 1.2, ba: 2.0, adv: 350, sp: .0014, why: 'GPU cloud, contracted capacity, hot money crowd' },
        { id: 'PWR', tk: 'SIM_POWER', nm: 'Gridline Energy', side: 1, v0: 450, vol: .03, bm: .8, ba: 1.0, adv: 220, sp: .001, why: 'power for data centers, slow but real' },
        { id: 'DCR', tk: 'SIM_DATACENTER', nm: 'Coldyard REIT', side: 1, v0: 400, vol: .032, bm: .9, ba: 1.2, adv: 150, sp: .0018, why: 'data-center landlord, leases signed, thin float' },
        { id: 'NET', tk: 'SIM_NETWORK', nm: 'Lattice Networks', side: 1, v0: 300, vol: .038, bm: 1.0, ba: 1.4, adv: 180, sp: .0015, why: 'optical interconnect, the picks and shovels' },
        { id: 'CHP', tk: 'SIM_CHIPEQ', nm: 'Ashline Tools', side: 1, v0: 250, vol: .042, bm: 1.1, ba: 1.6, adv: 120, sp: .002, why: 'chip equipment, smallest and least liquid' },
        { id: 'SFT', tk: 'SIM_SOFTWARE', nm: 'Parchment Soft', side: -1, v0: 350, vol: .035, bm: 1.0, ba: -0.8, adv: 300, sp: .0012, why: 'SHORT: seat-based software AI should eat' },
        { id: 'LGC', tk: 'SIM_LEGACYIT', nm: 'Meridian Legacy', side: -1, v0: 250, vol: .025, bm: .9, ba: -0.5, adv: 260, sp: .0011, why: 'SHORT: legacy IT services in decline' }
      ];
      function cvRng(seed) { var t = seed >>> 0; return function () { t += 0x6D2B79F5; var r = Math.imul(t ^ t >>> 15, 1 | t); r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r; return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }
      function cvNorm(r) { var u = Math.max(r(), 1e-9), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2831853 * v); }
      function cvF(n) { var s = Math.abs(n) >= 100 ? Math.round(Math.abs(n)).toLocaleString('en-US') : Math.abs(n).toFixed(Math.abs(n) >= 10 ? 0 : 1); return (n < 0 ? '-$' : '$') + s + 'M'; }
      function cvP(n) { return (n >= 0 ? '+' : '') + (100 * n).toFixed(1) + '%'; }

      var cv = null;
      function cvInit(seed) {
        var rM = cvRng(seed), rI = cvRng(seed + 77), rN = cvRng(seed + 991);
        cv = {
          seed: seed, rM: rM, rI: rI, rN: rN, t: 0, over: false,
          pos: CV_SECS.map(function (x) { return { sh: x.v0 / 100, px: 100, px0: 100 }; }),
          central: 100, priv: 100,
          bk: [{ nm: 'Kestrel Prime', cash: 300, debt: 1000, reqL: .20, call: null, ext: false, forced: 0 },
               { nm: 'Halbrook Securities', cash: 300, debt: 1000, reqL: .20, call: null, ext: false, addon: 0, forced: 0 }],
          puts: { n: 0, val: 0, spent: 0 },
          pend: [], sel: 0, mode: 'sell',
          nav0: 1000, peak: 1000, navHist: [1000], holdHist: [1000],
          costs: 0, soldTot: 0, journal: [], rescue: null, rescueDone: false, lost: false, ending: null,
          aRaised: false, bAddon: false
        };
        cvLog('brief', 'Monday, 6:40 a.m. Overnight: Asia sold AI hardware hard; futures point to a heavy open. Your book: $2,800M long the thesis, $600M short against it, $2,000M borrowed. NAV $1,000M.');
        cvLog('risk', 'Risk memo, Dana Okafor: gross is 3.4x NAV and both brokers hold you at thin cushion. The investment can still work. That does not mean this position size works.');
        cvLog('pb', 'Kestrel Prime, 6:55 a.m.: effective tomorrow at the open, long maintenance on your account rises from 20% to 25%. We need a collateral instruction and a completion time.');
        cvLog('brief', 'Objective: assess the funding gap and choose a response before the Kestrel deadline (Day 2 open). Advance when ready.');
        cvPaintAll();
      }
      function cvLog(who, txt) {
        cv.journal.push('D' + (Math.floor(cv.t / 4) + 1) + '.' + (cv.t % 4 + 1) + ' ' + txt);
        var f = document.getElementById('cvFeed');
        var lbl = who === 'risk' ? 'RISK' : who === 'pb' ? 'BROKER' : who === 'trd' ? 'TRADER' : who === 'inv' ? 'INVESTOR' : who === 'res' ? 'BUYER' : who === 'you' ? 'YOU' : 'BRIEF';
        var cls = who === 'risk' ? ' risk' : (who === 'pb' ? ' pb' : (who === 'res' ? ' res' : ''));
        /* the newest line arrives; the ones before it keep their place. A broker's notice is a paper slip on the desk */
        var pm = who === 'pb' ? txt.match(/^(Kestrel Prime|Halbrook Securities)(, [^:]*:\d\d [ap]\.m\.)?: /) : null;
        if (pm) { lbl = 'Notice · ' + pm[1] + (pm[2] || ''); txt = txt.charAt(pm[0].length).toUpperCase() + txt.slice(pm[0].length + 1); }
        f.insertAdjacentHTML('beforeend', '<p class="' + (pm ? 'slip' + (LAB_RM ? '' : ' slip-in') : 'lab-in') + '"><span class="who' + cls + '">' + lbl + '</span>' + txt + '</p>');
        f.scrollTop = f.scrollHeight;
        f.classList.toggle('up', f.scrollTop > 2);
        if (!f._up) { f._up = true; f.addEventListener('scroll', function () { f.classList.toggle('up', f.scrollTop > 2); }, { passive: true }); }
      }
      function cvLongs() { var v = 0; cv.pos.forEach(function (p, i) { if (CV_SECS[i].side > 0) v += p.sh * p.px; }); return v; }
      function cvShorts() { var v = 0; cv.pos.forEach(function (p, i) { if (CV_SECS[i].side < 0) v += p.sh * p.px; }); return v; }
      function cvNAV() { var pend = 0; cv.pend.forEach(function (x) { pend += x.amt; }); return cvLongs() - cvShorts() + cv.central + pend + cv.priv + cv.puts.val + cv.bk[0].cash + cv.bk[1].cash - cv.bk[0].debt - cv.bk[1].debt; }
      function cvReq(b) {
        var L = cvLongs() / 2, S = cvShorts() / 2;
        var r = cv.bk[b].reqL * L + .30 * S;
        if (b === 1 && cv.bAddon) { var big = 0; cv.pos.forEach(function (p, i) { if (CV_SECS[i].side > 0) big = Math.max(big, p.sh * p.px / 2); }); r += .05 * big; }
        return r;
      }
      function cvEq(b) { return cv.bk[b].cash + cvLongs() / 2 - cvShorts() / 2 - cv.bk[b].debt; }
      function cvExcess(b) { return cvEq(b) - cvReq(b); }
      function cvGross() { return cvLongs() + cvShorts(); }
      function cvNet() { return cvLongs() - cvShorts(); }
      function cvRegime(day) {
        if (day === 0) return { fm: -.004, fa: -.012, vm: 1.0, lm: 1.0, tag: 'heavy selling in AI infrastructure' };
        if (day === 1) return { fm: -.006, fa: -.02, vm: 1.6, lm: .55, tag: 'broad deleveraging, liquidity thinning' };
        if (day === 2) return cv.branchC ? { fm: -.002, fa: -.008, vm: 1.4, lm: .6, tag: 'stress continuing' } : { fm: 0, fa: -.003, vm: 1.2, lm: .75, tag: 'tentative stabilization' };
        if (day === 3) return { fm: .001, fa: -.007, vm: 1.2, lm: .7, tag: 'rotation: software bid, hardware offered' };
        if (day === 4) return cv.branchE ? { fm: .003, fa: .012, vm: 1.1, lm: .85, tag: 'sharp partial recovery' } : { fm: -.001, fa: -.004, vm: 1.1, lm: .8, tag: 'grinding lower on light volume' };
        return { fm: .001, fa: .003, vm: 1.0, lm: .9, tag: 'markets settling into the weekend' };
      }
      function cvTickPx() {
        var day = Math.floor(cv.t / 4), rg = cvRegime(day);
        var fm = rg.fm + .006 * rg.vm * cvNorm(cv.rM);
        var fa = rg.fa + .011 * rg.vm * cvNorm(cv.rM);
        cv.lastRg = rg;
        cv.pos.forEach(function (p, i) {
          var x = CV_SECS[i];
          var ret = x.bm * fm + x.ba * fa + .5 * x.vol * rg.vm * cvNorm(cv.rI);
          p.px = Math.max(5, p.px * (1 + ret));
        });
        if (cv.puts.n > 0) {
          cv.puts.val = Math.max(0, cv.puts.val - .55 * cv.puts.n * fa - .0007 * cv.puts.n);
        }
        cv.lastFa = fa;
      }
      function cvHold() {
        var v = 0;
        cv.pos.forEach(function (p, i) { v += CV_SECS[i].side * (CV_SECS[i].v0 / 100) * p.px; });
        return v + 100 + 100 + 600 - 2000;
      }
      function cvTickAdv(i) { var rg = cv.lastRg || cvRegime(0); return CV_SECS[i].adv * rg.lm; }
      function cvQuote(i, frac, forced) {
        var p = cv.pos[i], x = CV_SECS[i];
        var want = p.sh * p.px * frac;
        var cap = .3 * cvTickAdv(i);
        var fill = Math.min(want, cap);
        var rg = cv.lastRg || cvRegime(0);
        var imp = .9 * x.vol * rg.vm * Math.pow(fill / Math.max(1, cvTickAdv(i)), 1.1) * (forced ? 2 : 1) + (forced ? .03 : 0);
        var pxE = p.px * (1 - (x.sp + imp) * (x.side > 0 ? 1 : -1));
        return { want: want, fill: fill, imp: imp, pxE: pxE, cost: fill * (x.sp + imp) };
      }
      function cvExec(i, frac, forced) {
        var q = cvQuote(i, frac, forced), p = cv.pos[i], x = CV_SECS[i];
        if (q.fill < 1) return 0;
        var sh = q.fill / p.px;
        p.sh -= sh;
        if (x.side > 0) {
          var proceeds = sh * q.pxE;
          cv.bk[0].cash += proceeds / 2; cv.bk[1].cash += proceeds / 2;
          cv.soldTot += q.fill;
        } else {
          var costC = sh * q.pxE;
          cv.bk[0].cash -= costC / 2; cv.bk[1].cash -= costC / 2;
        }
        cv.costs += q.cost;
        return q.fill;
      }
      function cvStrip() {
        var nav = cvNAV(); cv.peak = Math.max(cv.peak, nav);
        var dd = nav / cv.peak - 1;
        var day = Math.floor(cv.t / 4) + 1, tk = cv.t % 4;
        var tl = ['open', 'midday', 'late', 'close'][tk];
        var eA = cvExcess(0), eB = cvExcess(1);
        function cls(v) { return v > 25 ? 'good' : v >= 0 ? 'warn' : 'bad'; }
        var dl = '';
        if (cv.bk[0].call) dl = 'Kestrel cure: ' + (cv.bk[0].call - cv.t) + ' ticks';
        else if (cv.bk[1].call) dl = 'Halbrook cure: ' + (cv.bk[1].call - cv.t) + ' ticks';
        else if (!cv.aRaised) dl = 'Kestrel 25% at D2 open';
        else dl = 'none binding';
        var h = '';
        function cell(k, v, c) { h += '<span><span class="ck">' + k + '</span><span class="cvv' + (c ? ' ' + c : '') + '">' + v + '</span></span>'; }
        cell('Day', 'D' + day + ' ' + tl, '');
        cell('NAV', cvF(nav), nav >= cv.nav0 ? 'good' : (dd < -.3 ? 'bad' : ''));
        cell('Drawdown', cvP(dd), dd < -.25 ? 'bad' : dd < -.1 ? 'warn' : '');
        cell('Gross', (cvGross() / Math.max(1, nav)).toFixed(1) + 'x', '');
        cell('Net', (cvNet() / Math.max(1, nav)).toFixed(1) + 'x', '');
        cell('Central cash', cvF(cv.central), '');
        cell('Kestrel excess', cvF(eA), cls(eA));
        cell('Halbrook excess', cvF(eB), cls(eB));
        cell('Deadline', dl, dl.indexOf('cure') >= 0 ? 'bad' : '');
        document.getElementById('cvStrip').innerHTML = h;
        cvPaintWeek(); cvPaintGauge();
      }
      /* the cushion: each broker's equity over what it requires; the bar runs to 2.5x, the call sits at 1.0x */
      var cvGaugeEl = document.getElementById('cvGauge');
      function cvPaintGauge() {
        if (!cvGaugeEl) return;
        if (!cvGaugeEl.children.length) cvGaugeEl.innerHTML = [0, 1].map(function (b) { return '<div class="cg-row"><span class="ck">' + (b ? 'Halbrook' : 'Kestrel') + ' cushion</span><span class="cg-tr"><i class="cg-f"></i><b class="cg-call"></b></span><span class="cvv"></span></div>'; }).join('');
        [0, 1].forEach(function (b) {
          var row = cvGaugeEl.children[b], req = cvReq(b), c = req > 0 ? cvEq(b) / req : 9;
          row.style.setProperty('--c', Math.max(0, Math.min(1, c / 2.5)).toFixed(4));
          row.className = 'cg-row' + (c < 1 ? ' bad' : c < 1.25 ? ' warn' : '');
          row.lastChild.textContent = c >= 9 ? '–' : c.toFixed(2) + 'x';
        });
      }
      /* the week: twenty-four ticks; past ones graphite, now in foil, a broker's deadline ringed */
      var cvWeekEl = document.getElementById('cvWeek');
      if (cvWeekEl && !cvWeekEl.children.length) {
        var cwh = '';
        for (var cwi = 0; cwi < 24; cwi++) cwh += '<i' + (cwi % 4 === 0 ? ' data-d="D' + (cwi / 4 + 1) + '"' : '') + '></i>';
        cvWeekEl.innerHTML = cwh;
      }
      function cvPaintWeek() {
        if (!cvWeekEl) return;
        var calls = [cv.bk[0].call, cv.bk[1].call];
        Array.prototype.forEach.call(cvWeekEl.children, function (t, k) {
          t.classList.toggle('past', k < cv.t);
          t.classList.toggle('now', k === cv.t && !cv.over);
          t.classList.toggle('call', calls.indexOf(k) >= 0 && !cv.over);
        });
      }
      function cvPaintTable() {
        /* a row is selectable by pointer or by key; keep the focus on the same position across repaints */
        var ae = document.activeElement, atr = ae && ae.closest && ae.closest('#cvTable tr[data-i]'), fi = atr ? atr.getAttribute('data-i') : null;
        var h = '<tr><th>Position</th><th>Side</th><th>Mark</th><th>Day</th><th>Value</th><th>Exit/tick</th></tr>';
        cv.pos.forEach(function (p, i) {
          var x = CV_SECS[i], val = p.sh * p.px;
          if (val < 1) return;
          var d = p.px / p.pxD - 1;
          h += '<tr data-i="' + i + '"' + (cv.sel === i ? ' class="sel"' : '') + '><td><button type="button" class="cv-pick" aria-pressed="' + (cv.sel === i ? 'true' : 'false') + '">' + x.tk + '</button><small>' + x.nm + ' · ' + x.why + '</small></td><td>' + (x.side > 0 ? 'LONG' : 'SHORT') + '</td><td>' + p.px.toFixed(1) + '</td><td class="' + (d * x.side >= 0 ? 'cv-up' : 'cv-dn') + '">' + cvP(d) + '</td><td>' + cvF(val) + '</td><td>' + cvF(.3 * cvTickAdv(i)) + '</td></tr>';
        });
        var tb = document.getElementById('cvTable');
        tb.innerHTML = h;
        if (fi !== null) { var fr = tb.querySelector('tr[data-i="' + fi + '"] .cv-pick'); if (fr) { try { fr.focus({ preventScroll: true }); } catch (er) {} } }
      }
      function cvPaintPrev() {
        var i = cv.sel, x = CV_SECS[i], p = cv.pos[i];
        if (p.sh * p.px < 1) { document.getElementById('cvPrev').textContent = 'Position closed.'; return; }
        var frac = +document.getElementById('cvSize').value / 100;
        var q = cvQuote(i, frac);
        var act = x.side > 0 ? 'Sell' : 'Cover';
        document.getElementById('cvTrade').textContent = act + ' ' + Math.round(frac * 100) + '%';
        var dReq = (x.side > 0 ? (cv.bk[0].reqL + cv.bk[1].reqL) / 2 : .30) * q.fill;
        var dEx = x.side > 0 ? (q.fill - q.cost) - q.fill + dReq : dReq - 0;
        var note = q.fill < q.want ? ' The tape only takes ' + cvF(q.fill) + ' of your ' + cvF(q.want) + ' this tick; the rest must wait.' : '';
        document.getElementById('cvPrev').innerHTML = '<b>' + act + ' ' + x.tk + ':</b> est. fill ' + cvF(q.fill) + ' at ' + q.pxE.toFixed(1) + ' (impact ' + (100 * q.imp).toFixed(2) + '%, cost ' + cvF(q.cost) + '). Margin relief ≈ ' + cvF(dReq) + ' across brokers; proceeds count as collateral here immediately, transferable tomorrow.' + note;
      }
      function cvPaintAll() { cv.pos.forEach(function (p) { if (!p.pxD) p.pxD = p.px; }); cvStrip(); cvPaintTable(); cvPaintPrev(); document.getElementById('cvSeedNote').textContent = 'Seeded week #' + cv.seed + '. Same seed and same actions reproduce the same week; replay it to run a counterfactual.'; }
      function cvMarginCheck() {
        [0, 1].forEach(function (b) {
          var ex = cvExcess(b), B = cv.bk[b];
          if (ex < 0 && !B.call) {
            B.call = cv.t + 4;
            cvLog('pb', B.nm + ': your account shows a collateral deficit of ' + cvF(-ex) + '. We need it cured within four market ticks. A collateral instruction and a completion time, please.');
          } else if (ex >= 0 && B.call) {
            B.call = null;
            cvLog('pb', B.nm + ': deficit cured. Thank you for the instruction. Terms remain under review.');
          } else if (B.call && cv.t >= B.call) {
            cvForce(b);
          }
        });
      }
      function cvForce(b) {
        var B = cv.bk[b];
        cvLog('pb', B.nm + ': the deadline has passed. Under the financing agreement we are reducing your positions for our account. This concludes the courtesy portion of the relationship.');
        cv.lost = true;
        var guard = 0;
        while (cvExcess(b) < 20 && guard < 40) {
          guard++;
          var best = -1, bestLiq = 0;
          cv.pos.forEach(function (p, i) { if (CV_SECS[i].side > 0 && p.sh * p.px > 5) { var lq = cvTickAdv(i); if (lq > bestLiq) { bestLiq = lq; best = i; } } });
          if (best < 0) break;
          var sold = cvExec(best, .5, true);
          B.forced += sold;
          if (sold < 1) break;
        }
        B.call = null;
        cvLog('risk', 'Dana: they sold ' + cvF(B.forced) + ' of the book at forced prices. We still exist. Barely. This is what losing control looks like with positive NAV.');
      }
      function cvEvents() {
        var day = Math.floor(cv.t / 4), tk = cv.t % 4;
        if (cv.t === 4 && !cv.aRaised) {
          cv.aRaised = true; cv.bk[0].reqL = .25;
          cvLog('pb', 'Kestrel Prime: the 25% long maintenance is now effective. Your excess reflects it.');
        }
        if (day === 2 && tk === 0 && !cv.bAddon) {
          var conc = 0; cv.pos.forEach(function (p, i) { if (CV_SECS[i].side > 0) conc = Math.max(conc, p.sh * p.px / Math.max(1, cvLongs())); });
          if (conc > .28 && cv.navHist[cv.navHist.length - 1] < 850) {
            cv.bAddon = true;
            cvLog('pb', 'Halbrook Securities: given realized volatility and your concentration, a 5% add-on now applies to your largest long. This is disclosed, contractual, and not personal.');
          }
        }
        if (tk === 0 && day > 0) cvLog('brief', 'Day ' + (day + 1) + ' open: ' + cvRegime(day).tag + '.');
        if (day === 1 && tk === 2) cvLog('inv', 'Anchor investor: we have seen the tape. How much of the NAV you report to us is available to meet obligations this week? A number, please, not a thesis.');
        var dd = cvNAV() / cv.peak - 1;
        if (!cv.rescue && !cv.rescueDone && (dd < -.30 || (cv.bk[0].call && cv.t - (cv.bk[0].call - 4) >= 2))) {
          cvRescueOffer();
        }
        if (cv.rescue && cv.t >= cv.rescue.exp) { cv.rescue = null; document.getElementById('cvRescue').style.display = 'none'; cvLog('res', 'Beacon Point: our window has closed. Good luck this week.'); }
      }
      function cvRescueOffer() {
        var ids = [0, 1, 2, 3];
        var val = 0; ids.forEach(function (i) { val += cv.pos[i].sh * cv.pos[i].px; });
        if (val < 200) return;
        cv.rescue = { ids: ids, disc: .12, exp: cv.t + 4, neg: false };
        cvLog('res', 'Beacon Point Capital: we will take MEMORY, GPUCLOUD, POWER, and the DATACENTER block, all of it, at a 12% discount to current marks. Conditions: the financing gets repaid first and the short book gets closed at completion. Cash, certain, now. The offer stands for four ticks. We are selective, and we know why you are answering the phone.');
        cvPaintRescue();
      }
      function cvPaintRescue() {
        var R = cv.rescue, el = document.getElementById('cvRescue');
        if (!R) { el.style.display = 'none'; return; }
        var val = 0; R.ids.forEach(function (i) { val += cv.pos[i].sh * cv.pos[i].px; });
        var proceeds = val * (1 - R.disc), debt = cv.bk[0].debt + cv.bk[1].debt;
        var repay = Math.min(debt, proceeds), residual = proceeds - repay;
        el.style.display = '';
        el.innerHTML = '<h5>Block offer · Beacon Point Capital · expires in ' + (R.exp - cv.t) + ' ticks</h5>' +
          '<div class="cv-mono cv-terms">Blocks: MEM + GPU + PWR + DCR = ' + cvF(val) + ' at marks<br>Price: ' + (100 * (1 - R.disc)).toFixed(0) + ' cents on the dollar = ' + cvF(proceeds) + ' certain, settles now<br>Repays financing: ' + cvF(repay) + ' of ' + cvF(debt) + ' debt<br>Then covers the short book from account cash<br>Free cash after repayment: ' + cvF(residual) + '</div>' +
          '<div class="cv-actions"><button class="cv-btn primary" id="cvAcc" type="button">Accept</button>' + (R.neg ? '' : '<button class="cv-btn" id="cvNeg" type="button">Negotiate</button>') + '<button class="cv-btn" id="cvDec" type="button">Decline</button></div>';
        document.getElementById('cvAcc').onclick = cvAccept;
        if (!R.neg) document.getElementById('cvNeg').onclick = cvNegotiate;
        document.getElementById('cvDec').onclick = function () { cv.rescue = null; el.style.display = 'none'; cvLog('you', 'You decline the block offer. The book stays yours, and so does the deadline.'); };
      }
      function cvNegotiate() {
        var R = cv.rescue;
        if (!R) return;
        R.neg = true;
        if (cv.rN() < .5) { R.disc = .09; cvLog('res', 'Beacon Point: fine. Nine percent, because we want the power block. Final.'); }
        else { R.disc = .13; R.exp = Math.min(R.exp, cv.t + 2); cvLog('res', 'Beacon Point: you are negotiating with the only bid in the room. Thirteen percent now, and the window just got shorter.'); }
        cvPaintRescue();
      }
      function cvAccept() {
        var R = cv.rescue;
        if (!R) return;
        var proceeds = 0;
        R.ids.forEach(function (i) { var p = cv.pos[i]; proceeds += p.sh * p.px * (1 - R.disc); cv.costs += p.sh * p.px * R.disc; cv.soldTot += p.sh * p.px; p.sh = 0; });
        var debt = cv.bk[0].debt + cv.bk[1].debt, repay = Math.min(debt, proceeds);
        var half = repay / 2;
        cv.bk[0].debt = Math.max(0, cv.bk[0].debt - half); cv.bk[1].debt = Math.max(0, cv.bk[1].debt - half);
        var rest = proceeds - repay;
        cv.bk[0].cash += rest / 2; cv.bk[1].cash += rest / 2;
        cv.pos.forEach(function (p, i) {
          if (CV_SECS[i].side < 0 && p.sh > 0) {
            var cost = p.sh * p.px * 1.01;
            cv.bk[0].cash -= cost / 2; cv.bk[1].cash -= cost / 2;
            cv.costs += p.sh * p.px * .01;
            p.sh = 0;
          }
        });
        cv.rescueDone = true; cv.rescue = null;
        document.getElementById('cvRescue').style.display = 'none';
        cvLog('you', 'You sign. The core of the thesis leaves the building in one print. The debt is repaid, the phones go quiet, and what remains of the fund is yours to steer.');
        cvMarginCheck(); cvPaintAll();
      }
      function cvAdvance() {
        if (cv.over) return;
        cv.pend = cv.pend.filter(function (x) { if (cv.t >= x.t) { cv.bk[x.b].cash += x.amt; cvLog('brief', 'Transfer settled: ' + cvF(x.amt) + ' now eligible at ' + cv.bk[x.b].nm + '.'); return false; } return true; });
        cv.pos.forEach(function (p) { p.pxD = (cv.t % 4 === 0) ? p.px : p.pxD; });
        cvTickPx();
        cv.t++;
        if (cv.t % 4 === 0) { var fc = .0006 * (cv.bk[0].debt + cv.bk[1].debt); cv.bk[0].cash -= fc / 2; cv.bk[1].cash -= fc / 2; cv.costs += fc; }
        cvEvents();
        cvMarginCheck();
        var nav = cvNAV();
        cv.navHist.push(nav); cv.holdHist.push(cvHold());
        if (nav <= 0) { cvEnd('insolvency'); return; }
        if (cv.t >= 24) { cvEnd(null); return; }
        var exA = cvExcess(0), exB = cvExcess(1);
        if ((exA < 0 || exB < 0) && cv.rN() < .5) cvLog('risk', 'Dana: deficit is ' + cvF(Math.min(exA, exB)) + ' at the worst account. Selling the liquid names buys the most relief per dollar of regret.');
        cvPaintAll();
      }
      function cvEnd(kind) {
        cv.over = true;
        var nav = cvNAV(), hold = cvHold();
        var e;
        if (kind === 'insolvency') e = ['The insolvency', 'Losses exceeded capital. The fund enters resolution; the thesis becomes somebody else’s trade.'];
        else if (cv.lost) e = ['The financing failure', 'You missed a contractual obligation and the brokers took the book. NAV was still positive: the fund ran out of liquidity before it ran out of money.'];
        else if (cv.rescueDone) e = ['The negotiated exit', 'You sold the core at a discount, repaid the leverage, and kept control of what remained. It hurt, and it was a decision, which is more than the market was offering.'];
        else if (nav >= 700) e = ['The survivor', 'You preserved operating capacity and a viable book through the week. The trade lives, and so does the fund.'];
        else if (cv.soldTot > .8 * 2800 && hold > nav + 150) e = ['The costly overreaction', 'You sold nearly everything, and the book you abandoned finished worth ' + cvF(hold) + ' against your ' + cvF(nav) + '. Survival was not in doubt after Wednesday. Every sale after that was fear.'];
        else e = ['The disciplined retrenchment', 'You accepted losses, cut risk, and kept the fund alive at a smaller scale. Nobody hangs a banner for it. Every investor you still have should.'];
        cv.ending = e[0];
        var A = document.getElementById('cvAar');
        A.style.display = '';
        var dd = 0, pk = cv.nav0; cv.navHist.forEach(function (v) { pk = Math.max(pk, v); dd = Math.min(dd, v / pk - 1); });
        A.innerHTML = '<span class="cv-kick">Ending</span><h5>' + e[0] + '</h5><p class="cv-sub">' + e[1] + '</p>' +
          '<canvas id="cvChart" style="height:170px;width:100%"></canvas>' +
          '<div class="cv-stats cv-mono">' +
          '<div><span class="ck">Final NAV</span><span class="cvv">' + cvF(nav) + '</span></div>' +
          '<div><span class="ck">Untouched book</span><span class="cvv">' + cvF(hold) + '</span></div>' +
          '<div><span class="ck">Max drawdown</span><span class="cvv">' + cvP(dd) + '</span></div>' +
          '<div><span class="ck">Trading + financing costs</span><span class="cvv">' + cvF(cv.costs) + '</span></div>' +
          '<div><span class="ck">Sold</span><span class="cvv">' + cvF(cv.soldTot) + '</span></div>' +
          '<div><span class="ck">Forced sales</span><span class="cvv">' + cvF(cv.bk[0].forced + cv.bk[1].forced) + '</span></div>' +
          '</div>' +
          '<p class="cv-sub">Gray line: the untouched book on the same seeded prices, no costs. If it ends above you, your trading cost money this week; if it ends below you, or below zero at any margin deadline, your trading is why there is still a fund. Judge the decisions with what was knowable at the time, not with this chart.</p>' +
          '<div class="cv-journal cv-mono" id="cvJournal"></div>';
        document.getElementById('cvJournal').innerHTML = cv.journal.map(function (j) { return '<div>' + j + '</div>'; }).join('');
        cvLog('brief', 'The week ends. Ending: ' + e[0] + '. Full review below; replay the same week to test another policy.');
        cvChart();
        cvPaintAll();
        if (!LAB_RM) { A.classList.remove('lab-in'); void A.offsetWidth; A.classList.add('lab-in'); }
      }
      /* a label on the dark desk: the house label face, haloed in the panel's own colour */
      function cvLbl(ctx, str, x, y, col, al, halo) {
        ctx.save(); ctx.font = LBL(11); ctx.textAlign = al || 'left'; ctx.textBaseline = 'alphabetic';
        if ('letterSpacing' in ctx) ctx.letterSpacing = '1px';
        ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = halo; ctx.strokeText(str, x, y);
        ctx.fillStyle = col; ctx.fillText(str, x, y); ctx.restore();
      }
      function cvChart() {
        var c = document.getElementById('cvChart');
        if (!c || !cv) return;
        var f = fitCanvas(c, 170), ctx = f.ctx, W = f.W, H = 170;
        if (!(W > 0)) return;
        ctx.clearRect(0, 0, W, H);
        var on = labRGB(labColor('--on-dark')), dk = labRGB(labColor('--dark')), ac = ACCRGB();
        function mix(a, b, t) { return 'rgb(' + Math.round(a[0] * t + b[0] * (1 - t)) + ',' + Math.round(a[1] * t + b[1] * (1 - t)) + ',' + Math.round(a[2] * t + b[2] * (1 - t)) + ')'; }
        var panel = mix(on, dk, .04), onA = function (a) { return 'rgba(' + on[0] + ',' + on[1] + ',' + on[2] + ',' + a + ')'; };
        var all = cv.navHist.concat(cv.holdHist), lo = Math.min.apply(null, all.concat([0])), hi = Math.max.apply(null, all);
        var L = 10, R = W - 10;
        function X(i) { return L + (R - L) * i / Math.max(1, cv.navHist.length - 1); }
        function Y(v) { return 12 + (H - 38) * (1 - (v - lo) / Math.max(1, hi - lo)); }
        /* the day boundaries, faint */
        ctx.strokeStyle = onA(.07); ctx.lineWidth = 1;
        for (var dd = 4; dd < 24; dd += 4) { var dx = cvSnap(L + (R - L) * dd / 24); ctx.beginPath(); ctx.moveTo(dx, 10); ctx.lineTo(dx, H - 26); ctx.stroke(); }
        /* zero: where the fund stops existing */
        ctx.save(); ctx.strokeStyle = 'rgba(255,138,122,.55)'; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(L, cvSnap(Y(0))); ctx.lineTo(R, cvSnap(Y(0))); ctx.stroke(); ctx.restore();
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.strokeStyle = onA(.38); ctx.lineWidth = 1.4; ctx.beginPath();
        cv.holdHist.forEach(function (v, i) { if (i === 0) ctx.moveTo(X(i), Y(v)); else ctx.lineTo(X(i), Y(v)); }); ctx.stroke();
        ctx.strokeStyle = ACC(); ctx.lineWidth = 2.2; ctx.beginPath();
        cv.navHist.forEach(function (v, i) { if (i === 0) ctx.moveTo(X(i), Y(v)); else ctx.lineTo(X(i), Y(v)); }); ctx.stroke();
        var ln = cv.navHist.length - 1;
        ctx.fillStyle = ACC(); ctx.beginPath(); ctx.arc(X(ln), Y(cv.navHist[ln]), 3.5, 0, 7); ctx.fill();
        ctx.fillStyle = onA(.6); ctx.beginPath(); ctx.arc(X(cv.holdHist.length - 1), Y(cv.holdHist[cv.holdHist.length - 1]), 3, 0, 7); ctx.fill();
        cvLbl(ctx, 'YOU ' + cvF(cv.navHist[ln]), L, H - 8, mix(ac, on, .82), 'left', panel);
        cvLbl(ctx, 'UNTOUCHED ' + cvF(cv.holdHist[cv.holdHist.length - 1]), R, H - 8, onA(.66), 'right', panel);
      }
      /* wires */
      document.getElementById('cvTable').addEventListener('click', function (e) {
        var tr = e.target.closest('tr[data-i]'); if (!tr) return;
        cv.sel = +tr.getAttribute('data-i'); cvPaintTable(); cvPaintPrev();
      });
      document.getElementById('cvSize').addEventListener('input', function () {
        var o = document.getElementById('cvSizeO'); if (o) o.textContent = this.value + '%';
        cvPaintPrev();
      });
      document.getElementById('cvTrade').addEventListener('click', function () {
        if (cv.over) return;
        var i = cv.sel, frac = +document.getElementById('cvSize').value / 100;
        var q = cvQuote(i, frac);
        if (q.fill < 1) { cvLog('trd', 'Marcus, head trader: there is no bid worth hitting for that. Pick a real size or a real name.'); return; }
        var got = cvExec(i, frac);
        var x = CV_SECS[i];
        cvLog('trd', 'Marcus: ' + (x.side > 0 ? 'sold ' : 'covered ') + cvF(got) + ' of ' + x.tk + ' at ' + q.pxE.toFixed(1) + '. Impact ' + (100 * q.imp).toFixed(2) + '%.' + (q.fill < q.want ? ' The rest waits for the next tick; I can show you a price, or I can move the whole position. Those are different requests.' : ''));
        cvMarginCheck(); cvPaintAll(); if (cv.rescue) cvPaintRescue();
      });
      document.getElementById('cvXfer').addEventListener('click', function () {
        if (cv.over || cv.central < 1) { if (cv.central < 1) cvLog('brief', 'Central cash is empty.'); return; }
        var b = cvExcess(0) < cvExcess(1) ? 0 : 1;
        var amt = cv.central; cv.central = 0;
        cv.pend.push({ t: cv.t + 1, b: b, amt: amt });
        cvLog('you', 'You wire ' + cvF(amt) + ' of central cash to ' + cv.bk[b].nm + '. It becomes eligible collateral next tick; the same dollars cannot stand behind two brokers.');
        cvPaintAll();
      });
      document.getElementById('cvPuts').addEventListener('click', function () {
        if (cv.over) return;
        var N = 250, prem = N * .022 * ((cv.lastRg || cvRegime(0)).vm);
        var pool = cv.central >= prem ? 'central' : (cv.bk[0].cash >= prem ? 0 : null);
        if (pool === null) { cvLog('trd', 'Marcus: the puts cost ' + cvF(prem) + ' and there is no free cash to pay for them. Protection is paid for up front.'); return; }
        if (pool === 'central') cv.central -= prem; else cv.bk[0].cash -= prem;
        cv.puts.n += N; cv.puts.val += prem * .95; cv.puts.spent += prem; cv.costs += prem * .05;
        cvLog('trd', 'Marcus: bought ' + cvF(N) + ' notional of AI-index puts for ' + cvF(prem) + ' premium. They pay if the factor keeps falling; they melt if it does not. Nothing here is free.');
        cvPaintAll();
      });
      document.getElementById('cvCall').addEventListener('click', function () {
        if (cv.over) return;
        var b = cv.bk[0].call ? 0 : (cv.bk[1].call ? 1 : (cvExcess(0) < cvExcess(1) ? 0 : 1));
        var B = cv.bk[b];
        if (B.ext) { cvLog('pb', B.nm + ': we have already extended once. The answer to a second ask is the agreement you signed.'); return; }
        B.ext = true;
        var early = !B.call || (B.call - cv.t) >= 3;
        var prog = cv.soldTot > 100 || cv.pend.length > 0;
        if (early && (prog || cv.rN() < .5)) {
          if (B.call) B.call += 3;
          cvLog('pb', B.nm + ': because you called before the deadline and you are visibly reducing, we can extend the cure window by three ticks. Financing spread goes up. Do not make us regret the phone call.');
        } else {
          cvLog('pb', B.nm + ': an extension needs either time or progress and you are offering neither. The deadline stands. I need a collateral instruction and a completion time.');
        }
        cvPaintAll();
      });
      document.getElementById('cvNext').addEventListener('click', cvAdvance);
      document.getElementById('cvDay').addEventListener('click', function () { var target = Math.min(24, (Math.floor(cv.t / 4) + 1) * 4); var guard = 0; while (!cv.over && cv.t < target && guard < 8) { cvAdvance(); guard++; } });
      function cvReset(seed) { document.getElementById('cvFeed').innerHTML = ''; var _a = document.getElementById('cvAar'); _a.style.display = 'none'; _a.innerHTML = ''; var _r = document.getElementById('cvRescue'); _r.style.display = 'none'; _r.innerHTML = ''; cvInit(seed); var s2 = cvRng(seed + 5); cv.branchC = s2() < .55; cv.branchE = s2() < .45; }
      document.getElementById('cvReplay').addEventListener('click', function () { cvReset(cv.seed); });
      document.getElementById('cvNew').addEventListener('click', function () { cvReset(1 + Math.floor(Math.random() * 999999)); });
      labRepaint(cvChart, document.getElementById('cvShell'));
      cvReset(20260726);
    return {};
  });
})();
