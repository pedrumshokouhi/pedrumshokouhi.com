/* P.S. Lab, No. 41: The acquirer. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<details class="brief"><summary>Brief</summary><p>The playbook: move each product onto shared technology, cut costs, including some users will notice, and raise prices on the people who stayed because they love it. The cash funds the next deal. Every lever is a trade-off. Price increases spend loyalty, cuts risk quality, a replatform costs money now to save money later, and each new product makes the shared platform cheaper for the rest. Build the empire before the debt builds a case against you.</p></details>\n'
    + '      <div class="sp-strip" id="spStrip"></div>\n'
    + '      <p class="sp-news" id="spNews"></p>\n'
    + '      <div class="sp-street" id="spStreet" hidden><div class="sp-st3 lx-bench" id="spSt3"></div><p class="sp-stcap" id="spStCap">Height is revenue. Glass is debt, shared out by revenue. The dashed ring is the covenant: debt at 1.3 times revenue. Drag to turn the street; tap a building to read it.</p></div>\n'
    + '      <span class="sp-cap" id="spDealCap">On the block this year</span>\n'
    + '      <div class="sp-grid" id="spDeals"></div>\n'
    + '      <span class="sp-cap">Your portfolio · set the playbook, then close the books</span>\n'
    + '      <div class="sp-grid" id="spPort"></div>\n'
    + '      <div class="btnrow" style="margin-top:14px">\n'
    + '        <button class="ebtn" id="spYear" type="button">Close the books: advance one year</button>\n'
    + '        <button class="ebtn2" id="spReplay" type="button">Replay these eight years</button>\n'
    + '        <button class="ebtn2" id="spNew" type="button">New market</button>\n'
    + '      </div>\n'
    + '      <div id="spAar" style="display:none">\n'
    + '        <span class="sp-cap">The annual report · year eight</span>\n'
    + '        <div class="lx-bench lx-flat lx-bleed" data-cv-local><canvas id="spChart" style="height:180px"></canvas></div>\n'
    + '        <div class="readout" id="spStats"></div>\n'
    + '        <p class="sp-verdict" id="spVerdict"></p>\n'
    + '      </div>\n'
    + '      <details class="sp-case">\n'
    + '        <summary>Case file · the real playbook this is modeled on</summary>\n'
    + '        <p>The real story: Bending Spoons, founded in Milan in 2013 and led by CEO Luca Ferrari, buys mature digital products with loyal audiences that their owners under-invest in, then applies a standard playbook: migrate the product onto its central technology platform, cut operating costs deeply, optimize pricing and paywalls, and run product, marketing, and technology through centralized teams. Acquisitions include Evernote (2023), Meetup, WeTransfer (2024), komoot and Brightcove (2025), Vimeo (agreed 2025, about $1.38B), and AOL (agreed 2025), with deals financed substantially by debt facilities; the company raised funding in 2025 at a valuation around $11B. Everything you can click above is fictional: the companies, numbers, elasticities, events, and outcomes are model assumptions built to teach the shape of the strategy, not a record of any real transaction.</p>\n'
    + '      </details>\n'
    + '      <p class="eline">The Milan playbook bets that an old product, bought right and run hard, can outgrow a new one. It works only while users love the product, and every pull of a lever spends some of that love.</p>';
  LAB_KIT.mount('acquirer', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- 38: the acquirer ---------- */

      var SP_POOL = [
        { id: 'ELE', nm: 'Elephant Notes', cat: 'Note-taking, faded unicorn', arr: 90, g: -6, gm: .85, opex: 95, churn: 14, e: .35, ask: 1.6, story: 'everyone made fun of it, nobody deleted it' },
        { id: 'DRP', nm: 'DropCourier', cat: 'File transfer', arr: 120, g: 2, gm: .80, opex: 88, churn: 11, e: .30, ask: 2.2, story: 'boring, universal, steadily profitable' },
        { id: 'CIR', nm: 'CircleMeet', cat: 'Local events network', arr: 45, g: -3, gm: .75, opex: 48, churn: 16, e: .50, ask: 1.4, story: 'communities that never left, revenue that never grew' },
        { id: 'TRL', nm: 'TrailScout', cat: 'Outdoor route maps', arr: 60, g: 8, gm: .82, opex: 55, churn: 9, e: .45, ask: 3.0, story: 'hikers pay for what they love; rare growth asset' },
        { id: 'STG', nm: 'StageVid', cat: 'Video hosting', arr: 210, g: -4, gm: .70, opex: 190, churn: 13, e: .40, ask: 1.5, story: 'the biggest and heaviest thing on the block' },
        { id: 'INB', nm: 'InboxAncient', cat: 'Legacy web portal', arr: 160, g: -8, gm: .88, opex: 120, churn: 10, e: .20, ask: 1.1, story: 'declining for 20 years, loyal beyond reason' },
        { id: 'SNP', nm: 'SnapRetouch', cat: 'Photo editor', arr: 75, g: 5, gm: .90, opex: 60, churn: 18, e: .70, ask: 2.5, story: 'pretty margins, fickle users, price with care' },
        { id: 'PLS', nm: 'PulseTrack', cat: 'Fitness tracking', arr: 55, g: 4, gm: .85, opex: 50, churn: 15, e: .60, ask: 2.4, story: 'resolutions in January, churn in March' },
        { id: 'CST', nm: 'CastLight', cat: 'Podcast hosting', arr: 40, g: 0, gm: .78, opex: 42, churn: 12, e: .40, ask: 1.8, story: 'small, sticky, nobody else bidding' },
        { id: 'PLN', nm: 'PlannerBee', cat: 'Productivity suite', arr: 65, g: -2, gm: .87, opex: 66, churn: 13, e: .40, ask: 1.7, story: 'a to-do app with a mortgage-sized cost base' }
      ];
      var SP_EVENTS = [
        { tag: 'Rates rise; your facility reprices to 12%.', fx: { rate: 12 } },
        { tag: 'Privacy rules bite: churn up across consumer software.', fx: { churn: 2 } },
        { tag: 'DOWNTURN. Multiples compress; sellers get realistic. The best year to buy is the worst year to sell.', fx: { down: true } },
        { tag: 'Recovery: multiples normalize, users spend again.', fx: { up: true } },
        { tag: 'App stores cut their fee. Four points of margin, industry-wide.', fx: { gm: .04 } },
        { tag: 'A rival roll-up raises a mega-fund; asking prices firm up.', fx: { askUp: .25 } },
        { tag: 'Quiet year. Nothing happens, and the cash keeps arriving.', fx: {} }
      ];
      function spRng(seed) { var t = seed >>> 0; return function () { t += 0x6D2B79F5; var r = Math.imul(t ^ t >>> 15, 1 | t); r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r; return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }
      function spF(n) { var v = Math.round(Math.abs(n)); return (n < 0 ? '-$' : '$') + v.toLocaleString('en-US') + 'M'; }
      var sp = null;
      function spInit(seed) {
        var r = spRng(seed);
        var deck = SP_EVENTS.slice(0, 6).sort(function () { return r() - .5; }).concat([SP_EVENTS[6]]);
        var order = SP_POOL.map(function (x, i) { return i; }).sort(function () { return r() - .5; });
        sp = { seed: seed, r: r, yr: 1, cash: 50, debt: 0, rate: 9, own: [], pool: order, deck: deck,
               macro: { churn: 0, gm: 0, down: false, askMult: 1 }, hist: [], news: 'Year one. $50M of equity, a lender who returns your calls, and a market full of software everyone loves and nobody runs well.', over: false, forced: 0, replats: 0 };
        spPaint();
      }
      function spCo(idx) { return SP_POOL[idx]; }
      function spOffers() { var n = sp.yr === 1 ? 3 : 2; return sp.pool.filter(function (i) { return !sp.ownHas(i); }).slice(0, n); }
      function spSyn() { return Math.min(.16, Math.max(0, .025 * (sp.own.length - 1))); }
      function spEbitda(o) {
        var c = spCo(o.i);
        var rev = o.arr * (1 + o.price);
        var opx = o.opex * (1 - o.cut) * (o.replat ? .75 : 1) * (1 - spSyn());
        return rev * (c.gm + sp.macro.gm) - opx;
      }
      function spExitVal(o) {
        var eb = spEbitda(o);
        var v = Math.max(.9 * o.arr, 8 * eb) * (sp.macro.down ? .6 : 1);
        return Math.max(0, v);
      }
      function spFacility() { var arr = 0; sp.own.forEach(function (o) { arr += o.arr; }); return 60 + 1.2 * arr; }
      function spAsk(i) { var c = spCo(i); return Math.round(c.arr * c.ask * sp.macro.askMult * (sp.macro.down ? .6 : 1)); }
      function spTot() {
        var arr = 0, eb = 0;
        sp.own.forEach(function (o) { arr += o.arr * (1 + o.price); eb += spEbitda(o); });
        return { arr: arr, eb: eb };
      }
      function spPaintStrip() {
        var t = spTot(), arr = t.arr, eb = t.eb;
        var cov = sp.debt / Math.max(1, arr);
        var yr = Math.min(sp.yr, 8), pips = '';
        for (var y = 1; y <= 8; y++) pips += '<i class="' + (y < yr || sp.over ? 'past' : y === yr ? 'now' : '') + '"></i>';
        var h = '<span><span class="ck">Year</span><span class="cvv">' + yr + ' of 8</span><span class="sp-years" aria-hidden="true">' + pips + '</span></span>';
        function cell(k, v, c) { h += '<span><span class="ck">' + k + '</span><span class="cvv' + (c ? ' ' + c : '') + '">' + v + '</span></span>'; }
        cell('Cash', spF(sp.cash), sp.cash < 0 ? 'bad' : '');
        cell('Debt', spF(sp.debt), '');
        cell('Facility left', spF(Math.max(0, spFacility() - sp.debt)), '');
        cell('Revenue', spF(arr), '');
        cell('EBITDA', spF(eb), eb < 0 ? 'bad' : eb > 0 ? 'good' : '');
        cell('Interest', sp.rate + '%', '');
        cell('Debt / revenue', arr > 0 ? cov.toFixed(2) + 'x' : '–', cov > 1.1 ? 'bad' : '');
        var sy = Math.round(100 * spSyn());
        cell('Platform synergy', (sy ? '−' : '') + sy + '% opex', sp.own.length > 1 ? 'good' : '');
        document.getElementById('spStrip').innerHTML = h;
        document.getElementById('spNews').textContent = '“' + sp.news + '”';
        document.getElementById('spYear').disabled = sp.over;
      }
      /* an offer is a tombstone: category, name, the story, the ask set large, then the numbers */
      function spPaintDeals() {
        var d = '', fund = sp.cash + (spFacility() - sp.debt);
        spOffers().forEach(function (i) {
          var c = spCo(i), ask = spAsk(i), out = fund < ask;
          var eb0 = c.arr * c.gm - c.opex;
          d += '<div class="sp-card sp-tomb"><span class="cat">' + c.cat + '</span><h6>' + c.nm + '</h6><i class="sp-story">' + c.story + '</i>' +
            '<div class="sp-ask"><span class="k">Asking</span><b>' + spF(ask) + '</b></div>' +
            '<div class="sp-fin">Revenue <b>' + spF(c.arr) + '</b> · growth ' + (c.g >= 0 ? '+' : '') + c.g + '%<br>EBITDA <b class="' + (eb0 < 0 ? 'neg' : 'pos') + '">' + spF(eb0) + '</b> · churn ' + c.churn + '%<br>Price sensitivity ' + (c.e <= .3 ? 'LOW' : c.e <= .5 ? 'MID' : 'HIGH') + '</div>' +
            '<div class="sp-bstrip"><button class="ebtn2 spBuy" data-i="' + i + '" type="button"' + (out ? ' disabled' : '') + '>Acquire ' + spF(ask) + '</button></div>' +
            (out ? '<p class="sp-why">Out of reach: you can fund ' + spF(Math.max(0, fund)) + '</p>' : '') + '</div>';
        });
        document.getElementById('spDeals').innerHTML = d || '<div class="sp-card"><div class="sp-fin">Nothing worth owning is for sale this year.</div></div>';
      }
      function spChurn(o) { var c = spCo(o.i); return c.churn + 20 * o.price * c.e + (o.cut > .35 ? (o.cut - .35) * 20 : 0) + sp.macro.churn - (o.replat ? 3 : 0); }
      function spFinHTML(o) {
        var c = spCo(o.i), eb2 = spEbitda(o), churnX = spChurn(o);
        return 'Revenue <b>' + spF(o.arr * (1 + o.price)) + '</b> · EBITDA <b class="' + (eb2 < 0 ? 'neg' : 'pos') + '">' + spF(eb2) + '</b><br>Effective churn <b class="' + (churnX > c.churn + 3 ? 'neg' : '') + '">' + churnX.toFixed(1) + '%</b> · exit value ≈ ' + spF(spExitVal(o));
      }
      function spCardHTML(o, k) {
        var c = spCo(o.i), rcost = Math.round(.35 * c.opex * Math.pow(.8, sp.replats));
        var pp = Math.round(100 * o.price), cp = Math.round(100 * o.cut);
        return '<div class="sp-card" data-k="' + k + '"><h6>' + c.nm + '</h6><span class="cat">owned since year ' + o.since + '</span><div class="sp-fin">' + spFinHTML(o) + '</div>' +
          '<div class="sp-lever"><label><span id="spPL' + k + '">Price uplift</span><span class="spPV">+' + pp + '%</span></label><input type="range" class="spPrice" data-k="' + k + '" min="0" max="80" step="5" value="' + pp + '" aria-labelledby="spPL' + k + '" style="--sfill:' + (pp / 80 * 100).toFixed(2) + '%"></div>' +
          '<div class="sp-lever"><label><span id="spCL' + k + '">Cost cuts</span><span class="spCV">' + (cp ? '−' : '') + cp + '%</span></label><input type="range" class="spCut" data-k="' + k + '" min="0" max="60" step="5" value="' + cp + '" aria-labelledby="spCL' + k + '" style="--sfill:' + (cp / 60 * 100).toFixed(2) + '%"></div>' +
          '<div class="sp-bstrip">' + (o.replat ? '<button class="ebtn2" type="button" disabled>On the platform</button>' : '<button class="ebtn2 spRep" data-k="' + k + '" type="button">Replatform ' + spF(rcost) + '</button>') + '<button class="ebtn2 spSell" data-k="' + k + '" type="button">Sell ' + spF(spExitVal(o) * .85) + '</button></div></div>';
      }
      function spPaintPort() {
        var port = document.getElementById('spPort'), ae = document.activeElement, fk = null, fc = null;
        if (ae && port.contains(ae)) {
          fk = ae.getAttribute('data-k');
          fc = ['spPrice', 'spCut', 'spRep', 'spSell'].filter(function (c) { return ae.classList.contains(c); })[0] || null;
        }
        var pth = '';
        sp.own.forEach(function (o, k) { pth += spCardHTML(o, k); });
        port.innerHTML = pth || '<div class="sp-card"><div class="sp-fin">You own nothing yet. The playbook needs a product to run on.</div></div>';
        if (fc && fk !== null) { var n = port.querySelector('.' + fc + '[data-k="' + fk + '"]'); if (n) { try { n.focus({ preventScroll: true }); } catch (er) {} } }
      }
      /* one card, in place: the numbers and labels move, the lever under your finger stays put */
      function spPaintCard(k) {
        var o = sp.own[k], card = document.querySelector('#spPort .sp-card[data-k="' + k + '"]');
        if (!o || !card) return;
        card.querySelector('.sp-fin').innerHTML = spFinHTML(o);
        var pv = card.querySelector('.spPV'), cv2 = card.querySelector('.spCV'), sl = card.querySelector('.spSell');
        if (pv) pv.textContent = '+' + Math.round(100 * o.price) + '%';
        var ct = Math.round(100 * o.cut);
        if (cv2) cv2.textContent = (ct ? '−' : '') + ct + '%';
        if (sl) sl.textContent = 'Sell ' + spF(spExitVal(o) * .85);
      }
      function spPaint() {
        sp.ownHas = function (i) { return sp.own.some(function (o) { return o.i === i; }); };
        spPaintStrip(); spPaintDeals(); spPaintPort(); spStreet();
      }
      /* the street (assets/3d/models/street.js): one building per company, height is revenue, the glass is the debt */
      var spSt = document.getElementById('spStreet'), spS = null;
      function spStreet() {
        if (!spS || !sp) return;
        spS.set({ items: sp.own.map(function (o) { return { id: o.i, nm: spCo(o.i).nm, rev: o.arr * (1 + o.price), plat: o.replat }; }), debt: sp.debt, rev: spTot().arr });
      }
      /* the stage stays hidden until the engine is in hand, so the news line above it is what comes into view */
      if (spSt) labNear(document.getElementById('spNews'), function () {
        lab3d(function (P) {
          P.need('street').then(function (d) {
            if (spS) return;
            spSt.hidden = false;
            spS = d.mount(document.getElementById('spSt3'), {});
            spStreet();
          }, function () {});
        });
      });
      function spAdvance() {
        if (sp.over) return;
        var snap = { yr: sp.yr, byCo: [] };
        sp.own.forEach(function (o) {
          var c = spCo(o.i);
          var eb = spEbitda(o);
          sp.cash += eb;
          var churnX = c.churn + 20 * o.price * c.e + (o.cut > .35 ? (o.cut - .35) * 20 : 0) + sp.macro.churn - (o.replat ? 3 : 0);
          o.arr = Math.max(2, o.arr * (1 + (c.g - churnX + c.churn) / 100));
          o.opex *= 1.02;
          snap.byCo.push({ nm: c.nm, eb: eb });
        });
        sp.cash -= sp.debt * sp.rate / 100;
        if (sp.cash < 0) {
          var need = -sp.cash, room = spFacility() - sp.debt;
          if (room >= need) { sp.debt += need; sp.cash = 0; }
        }
        sp.hist.push(snap);
        var arr = 0; sp.own.forEach(function (o) { arr += o.arr * (1 + o.price); });
        if (sp.debt > 1.3 * Math.max(1, arr) && sp.own.length) {
          var big = 0; sp.own.forEach(function (o, k) { if (o.arr > sp.own[big].arr) big = k; });
          var v = spExitVal(sp.own[big]) * .6;
          sp.news = 'COVENANT BREACH. The lender sells ' + spCo(sp.own[big].i).nm + ' out from under you at ' + spF(v) + ' and keeps the proceeds.';
          sp.cash += Math.max(0, v - 0); sp.debt = Math.max(0, sp.debt - v);
          sp.own.splice(big, 1); sp.forced++;
        } else {
          var ev = sp.deck[Math.min(sp.yr - 1, sp.deck.length - 1)];
          sp.macro.churn = ev.fx.churn || 0;
          sp.macro.gm = ev.fx.gm || 0;
          sp.macro.down = !!ev.fx.down;
          sp.macro.askMult = ev.fx.askUp ? 1 + ev.fx.askUp : (ev.fx.up ? 1 : sp.macro.askMult);
          if (ev.fx.rate) sp.rate = ev.fx.rate;
          sp.news = 'Year ' + (sp.yr + 1) + ': ' + ev.tag;
        }
        sp.yr++;
        if (sp.yr > 8) { spEnd(); return; }
        spPaint();
      }
      function spEnd() {
        sp.over = true;
        var exitSum = 0; sp.own.forEach(function (o) { exitSum += spExitVal(o); });
        var equity = sp.cash + exitSum - sp.debt;
        var moic = equity / 50;
        var irr = Math.pow(Math.max(.01, moic), 1 / 8) - 1;
        var index = 50 * Math.pow(1.07, 8);
        var v;
        if (sp.forced > 0 && moic < 1) v = 'The lender ran your playbook better than you did. Roll-ups die exactly one way: the interest arrives on schedule and the synergies do not.';
        else if (moic >= 6) v = 'An empire. You bought love cheap, taxed it gently, and let the platform do the rest. Milan would take the meeting.';
        else if (moic >= 3) v = 'A real compounder. Not every deal worked, and the platform meant it did not have to.';
        else if (equity > index) v = 'You beat the index with borrowed money. Eight years of interest did not eat the gain.';
        else if (moic >= 1) v = 'You made money and lost to the index. Paying the right price is the hard part of the playbook.';
        else v = 'The products were loved. The prices you paid were not. Most of the return was decided by the price at closing.';
        var spA = document.getElementById('spAar');
        spA.style.display = '';
        if (!LAB_RM) { spA.classList.remove('lab-in'); void spA.offsetWidth; spA.classList.add('lab-in'); }
        sp.moic = moic;
        document.getElementById('spStats').innerHTML =
          '<span><span class="k">Final equity value</span><span class="v up">' + spF(equity) + '</span></span>' +
          '<span><span class="k">MOIC on $50M</span><span class="v">' + moic.toFixed(1) + 'x</span></span>' +
          '<span><span class="k">IRR</span><span class="v">' + (100 * irr).toFixed(0) + '%/yr</span></span>' +
          '<span><span class="k">Index alternative</span><span class="v">' + spF(index) + '</span></span>' +
          '<span><span class="k">Companies held</span><span class="v">' + sp.own.length + '</span></span>' +
          '<span><span class="k">Forced sales</span><span class="v">' + sp.forced + '</span></span>';
        document.getElementById('spVerdict').textContent = v;
        sp.news = 'Year eight closes. The annual report is below; replay the same market to test another strategy.';
        spChartDraw();
        spPaint();
      }
      /* the annual report: the newest deal in foil, the older ones graded in ink, a paper line between each company */
      function spChartDraw() {
        var c = document.getElementById('spChart');
        var f = fitCanvas(c, 180), ctx = f.ctx, W = f.W, H = 180;
        if (!(W > 0) || !sp.hist.length) return;
        ctx.clearRect(0, 0, W, H);
        var maxT = 1, order = [];
        sp.hist.forEach(function (s2) {
          var t = 0;
          s2.byCo.forEach(function (x) { t += Math.max(0, x.eb); if (order.indexOf(x.nm) < 0) order.push(x.nm); });
          maxT = Math.max(maxT, t);
        });
        var ramp = [ACC(), inkColor(.78), inkColor(.62), inkColor(.48), inkColor(.36), inkColor(.26), ACCA(.55), ACCA(.35)];
        function colOf(nm) { return ramp[(order.length - 1 - order.indexOf(nm)) % ramp.length]; }
        var sep = labColor('--card');
        var bw = Math.min(70, (W - 30) / sp.hist.length);
        var x0 = (W - bw * sp.hist.length) / 2, base = H - 26, top = 40;
        ctx.strokeStyle = inkColor(.22); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x0, cvSnap(base)); ctx.lineTo(x0 + bw * sp.hist.length, cvSnap(base)); ctx.stroke();
        var NUM = '600 11px ' + CV_SANS;
        sp.hist.forEach(function (snap, i) {
          var y = base, bx = x0 + i * bw + 5, bwi = bw - 10;
          snap.byCo.forEach(function (x) {
            var hh = Math.max(0, x.eb) / maxT * (base - top);
            if (hh <= 0) return;
            ctx.fillStyle = colOf(x.nm);
            ctx.fillRect(bx, y - hh, bwi, hh);
            ctx.fillStyle = sep; ctx.fillRect(bx, Math.round(y - hh), bwi, 1);
            y -= hh;
          });
          var tot = 0; snap.byCo.forEach(function (x) { tot += x.eb; });
          cvText(ctx, String(Math.round(tot)), bx + bwi / 2, y - 6, { align: 'center', font: NUM, color: inkColor(.72) });
          cvText(ctx, 'Y' + snap.yr, bx + bwi / 2, H - 9, { align: 'center', color: inkColor(.6) });
        });
        cvText(ctx, 'EBITDA BY COMPANY, $M PER YEAR', 8, 16, { color: inkColor(.66) });
        if (sp.moic != null) cvText(ctx, 'MOIC ' + sp.moic.toFixed(1) + 'x', W - 8, 16, { align: 'right', font: '600 12px ' + CV_SANS, color: inkColor(.86), ls: '1px' });
      }
      document.getElementById('spDeals').addEventListener('click', function (e) {
        var b = e.target.closest('.spBuy'); if (!b || sp.over) return;
        var i = +b.getAttribute('data-i'), c = spCo(i), ask = spAsk(i);
        var fromCash = Math.min(sp.cash, ask);
        var fromDebt = ask - fromCash;
        if (fromDebt > spFacility() - sp.debt) return;
        sp.cash -= fromCash; sp.debt += fromDebt;
        sp.own.push({ i: i, arr: c.arr, opex: c.opex, price: 0, cut: 0, replat: false, since: sp.yr });
        sp.news = 'Acquired ' + c.nm + ' for ' + spF(ask) + ' (' + spF(fromCash) + ' cash, ' + spF(fromDebt) + ' debt). Now run the playbook.';
        spPaint();
      });
      /* a lever moves the model and repaints the strip and its own card; the card rebuilds only when you let go */
      document.getElementById('spPort').addEventListener('input', function (e) {
        var t = e.target, k = +t.getAttribute('data-k');
        if (!sp.own[k]) return;
        if (t.classList.contains('spPrice')) sp.own[k].price = +t.value / 100;
        if (t.classList.contains('spCut')) sp.own[k].cut = +t.value / 100;
        spPaintStrip(); spPaintCard(k); spStreet();
      });
      document.getElementById('spPort').addEventListener('change', function (e) {
        if (e.target.classList.contains('spPrice') || e.target.classList.contains('spCut')) spPaintPort();
      });
      document.getElementById('spPort').addEventListener('click', function (e) {
        if (sp.over) return;
        var r = e.target.closest('.spRep');
        if (r) {
          var k = +r.getAttribute('data-k'), o = sp.own[k], c = spCo(o.i);
          var cost = .35 * c.opex * Math.pow(.8, sp.replats);
          var room = spFacility() - sp.debt;
          if (sp.cash + room < cost) { sp.news = 'The replatform costs ' + spF(cost) + ' and you cannot fund it. The platform is a privilege of the solvent.'; spPaint(); return; }
          var fc = Math.min(sp.cash, cost); sp.cash -= fc; sp.debt += cost - fc;
          o.replat = true; sp.replats++;
          sp.news = c.nm + ' migrates onto the central platform for ' + spF(cost) + '. Costs fall a quarter, churn eases, and the next migration gets 20% cheaper. This is the flywheel.';
          spPaint(); return;
        }
        var sl = e.target.closest('.spSell');
        if (sl) {
          var k2 = +sl.getAttribute('data-k'), o2 = sp.own[k2], c2 = spCo(o2.i);
          var v = spExitVal(o2) * .85;
          sp.cash += v;
          sp.own.splice(k2, 1);
          sp.news = 'Sold ' + c2.nm + ' for ' + spF(v) + ' net. Selling is allowed; the playbook just says buy better than you sell.';
          spPaint();
        }
      });
      document.getElementById('spYear').addEventListener('click', spAdvance);
      function spReset(seed) { document.getElementById('spAar').style.display = 'none'; spInit(seed); sp.moic = null; }
      document.getElementById('spReplay').addEventListener('click', function () { spReset(sp.seed); });
      document.getElementById('spNew').addEventListener('click', function () { spReset(1 + Math.floor(Math.random() * 999999)); });
      labRepaint(function () { if (sp && sp.over) spChartDraw(); }, document.getElementById('spChart'));
      spReset(2013);
    return {};
  });
})();
