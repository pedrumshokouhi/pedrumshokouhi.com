/* P.S. 3D model: money-flow. Follow $100 from limited partners through a ten-year fund into 49 companies and back.
   Six steps (Commit, Fees, Invest, The J-curve, The power law, Distributions); set({stage: 1..6, m: 0.5..5}).
   calc(m) for a gross multiple m on invested capital, committed $100, fees 2% a year for ten years, 20% carry above all capital, no hurdle:
   PS3D.getModel('money-flow').calc(2) -> {fees: 20, invested: 80, proceeds: 160, carry: 12, lpNet: 148, lpMultiple: 1.48, gpTotal: 32} */
(function () {
  var P = window.PS3D;
  if (!P) return;
  var EVANS = 'https://www.ben-evans.com/benedictevans/2016/4/28/winning-and-losing';
  function calc(p) {
    var m = typeof p === 'number' ? p : (p && p.m != null ? +p.m : 2);
    m = Math.max(.5, Math.min(5, m));
    var fees = 20, invested = 80, proceeds = invested * m, carry = .2 * Math.max(0, proceeds - 100), lpNet = proceeds - carry;
    return { m: m, fees: fees, invested: invested, proceeds: proceeds, carry: carry, lpNet: lpNet, lpMultiple: lpNet / 100, gpTotal: fees + carry };
  }
  function money(x) { return '$' + (Math.round(x * 10) / 10).toString(); }
  var LP = [['Pension fund', 1.2], ['Endowment', .9], ['Sovereign fund', 1.4], ['Family office', .5], ['Fund of funds', .7]];
  /* 49 heights in the Horsley Bridge shape: 24 under 1x (outline only), 22 between 1x and 10x, 3 at 10x and above */
  function towers() {
    var r = P.B.rng(1985), t = [], i;
    for (i = 0; i < 24; i++) t.push({ h: .05 + r() * .07, k: 0 });
    for (i = 0; i < 22; i++) t.push({ h: .2 + r() * .6, k: 1 });
    for (i = 0; i < 3; i++) t.push({ h: 2 + r() * 1.2, k: 2 });
    for (i = t.length - 1; i > 0; i--) { var j = (r() * (i + 1)) | 0, s = t[i]; t[i] = t[j]; t[j] = s; }
    return t;
  }
  var T = towers(), WIN = [];
  T.forEach(function (t, i) { t.x = .24 + (i % 7) * .42; t.z = -1.26 + ((i / 7) | 0) * .42; if (t.k === 2) WIN.push(i); });
  WIN.sort(function (a, b) { return T[b].h - T[a].h; });
  function top(i) { return [T[i].x, T[i].h + .05, T[i].z]; }
  P.model('money-flow', {
    v: 1, title: 'Follow one dollar', desc: 'Illustrative. Fees of 2% a year on committed capital for ten years, 20% carry above the return of all capital, no hurdle.',
    units: 'model', camera: 'ortho', views: { iso: { yaw: 38, pitch: 30, zoom: 1 }, plan: { yaw: 0, pitch: 90 }, front: { yaw: 0, pitch: 4 } },
    params: { stage: 6, m: 2 },
    mats: { lossy: { face: 'card', line: 'ink2' }, low: { face: 'none', line: 'ink2', lineA: .8 } },
    calc: calc,
    build: function (B) {
      var lp = [], yr = [], pf = [], i;
      LP.forEach(function (l, k) { lp.push(B.part('lp-' + k, { pos: [-5, 0, -2 + k] }, [B.box(0, 0, 0, .8, l[1], .8)])); });
      for (i = 0; i < 10; i++) yr.push(B.part('y' + (i + 1), { pos: [0, i * .11, 0] }, [B.box(0, 0, 0, 1.6, .09, 1.6)]));
      T.forEach(function (t, k) {
        if (k === WIN[0]) return;
        var w = WIN.indexOf(k) > 0;
        pf.push(B.part(w ? 'win-' + (WIN.indexOf(k) + 1) : null, { pos: [t.x, 0, t.z] }, [B.box(0, 0, 0, .3, t.h, .3, t.k ? null : { mat: 'low' })]));
      });
      var w0 = T[WIN[0]];
      pf.push(B.part('win-1', { n: 5, name: 'The breakout', fig: '10x or more', src: EVANS, pos: [w0.x, 0, w0.z], anchor: [0, w0.h, 0],
        why: 'About 6% of venture investments return 10x or more, and those produce about 60% of all returns.' }, [B.box(0, 0, 0, .3, w0.h, .3, { mat: 'foil' })]));
      return [
        B.part('plinth', { pick: false, layer: -1, mat: 'quiet' }, [B.box(0, -.1, 0, 12, .1, 6)]),
        B.part('lps', { n: 1, name: 'Limited partners', fig: '$100', anchor: [-5, 1.4, 0], explode: [-.8, 0, 0],
          why: 'Pensions, endowments, sovereign funds, family offices and funds of funds commit the money and wait ten years for it.' }, [], lp),
        B.part('fund', { n: 2, name: 'The fund', fig: '10 years', pos: [-2, 0, 0], anchor: [0, 1.08, 0], explode: [-.3, 0, 0],
          why: 'One partnership with a fixed life; each slab is a year, the first at the bottom.' }, [], yr),
        B.part('gp', { n: 3, name: 'The manager', fig: '$20 in fees', pos: [-2, 1.12, 0], anchor: [0, .3, 0], explode: [0, .9, 0],
          why: 'A typical fee is 2% a year on committed capital, about $20 of every $100 over ten years.' }, [B.box(0, 0, 0, .6, .3, .6)]),
        B.part('portfolio', { n: 4, name: 'The portfolio', fig: '49 companies', src: EVANS, anchor: [1.5, .8, 0],
          why: 'About half of venture investments return less than cost; those are the low towers drawn in outline.' }, [], pf),
        B.part('exit', { n: 6, name: 'The exit', fig: 'IPO or sale', pos: [4.2, 0, 0], anchor: [0, 1.35, 0], explode: [.8, 0, 0],
          why: 'A company returns cash only when it is sold or goes public.' }, [
          B.box(0, 0, -.6, .2, 1.2, .2), B.box(0, 0, .6, .2, 1.2, .2), B.box(0, 1.2, 0, .2, .15, 1.4)]),
        B.part('dist', { n: 7, name: 'Distributions', fig: '$148 at 2.0x', anchor: [-.4, .02, 2.6], explode: [0, 0, .5],
          why: 'Cash goes back to the limited partners after the manager takes 20% of the profit.' }, [
          B.path([[4.2, .02, .75], [4.2, .02, 2.6], [-5, .02, 2.6], [-5, .02, 2.45]], { w: 1, line: 'ink' }),
          B.path([[4.45, .02, .75], [4.45, .02, 2.85], [-5.25, .02, 2.85], [-5.25, .02, 2.45]], { w: .75, line: 'ink2' })])
      ];
    },
    labels: [{ at: [4.2, 1.5, 0], text: 'IPO / M&A' }], labelMode: { avoid: true },
    flows: [
      { id: 'commit', points: 30, speed: .22, color: 'ink', paths: LP.map(function (l, k) { return [[-4.55, .35, -2 + k], [-3.4, .5, (-2 + k) * .6], [-2.85, .45, (-2 + k) * .3]]; }) },
      { id: 'fees', points: 12, speed: .3, color: 'ink', path: [[-1.15, .45, .55], [-1.15, 1.05, .55], [-1.65, 1.3, .3]] },
      { id: 'invest', points: 32, speed: .2, color: 'ink', paths: [8, 17, 24, 31, 40, 45].map(function (i) { return [[-1.15, .3, 0], [0, .3, 0], [T[i].x, .3, T[i].z], top(i)]; }) },
      { id: 'exit', points: 18, speed: .25, color: 'ink', paths: WIN.map(function (i) { return [top(i), [T[i].x + .4, T[i].h * .6, T[i].z * .5], [4.2, .8, 0]]; }) },
      { id: 'distribute', points: 30, speed: .2, color: 'ink', path: [[4.32, .12, .75], [4.32, .12, 2.72], [-5.12, .12, 2.72], [-5.12, .12, 2.4]] }
    ],
    steps: [
      { title: 'Commit', flows: ['commit'], select: 'lps', params: { stage: 1 },
        text: 'Pensions, endowments, sovereign funds, family offices and funds of funds promise money to a fund that lasts ten years. Follow $100 of it.' },
      { title: 'Fees', flows: ['fees'], select: 'gp', params: { stage: 2 },
        text: 'The manager charges a fee on the money promised, typically 2% a year. Over ten years that is about $20 of every $100, paid whether or not the fund makes money.' },
      { title: 'Invest', flows: ['invest'], select: 'portfolio', params: { stage: 3 },
        text: 'The other $80 goes to work. This fund backs 49 companies in its first years.' },
      { title: 'The J-curve', flows: [], select: 'fund', params: { stage: 4 },
        text: 'For the first years the fund shows a loss. Fees go out before any company is sold, so the value dips before it climbs.' },
      { title: 'The power law', flows: [], select: 'win-1', params: { stage: 5 },
        text: 'A few companies pay for everything. In Horsley Bridge data on just over 7,000 investments from 1985 to 2014, about half returned less than cost. The 6% that returned 10x or more produced 60% of all returns.' },
      { title: 'Distributions', flows: ['exit', 'distribute'], select: 'dist', params: { stage: 6 },
        text: 'When a company is sold or goes public, cash comes back. The manager keeps 20% of the profit above the $100 investors put in. The rest goes home.' }
    ],
    update: function (root, p, ctx) {
      var n = root.parts, st = +p.stage || 6, c = calc(p.m), up = st >= 5;
      for (var i = 1; i <= 10; i++) n['y' + i].tint = st === 4 && i <= 4 ? .12 : 0;
      WIN.forEach(function (w, k) {
        var node = n['win-' + (k + 1)], to = up ? 1 : .5 / T[w].h, from = node.scl[1];
        if (node._wt) node._wt();
        if (ctx.init || ctx.reduced || Math.abs(to - from) < 1e-3) node.scl = [1, to, 1];
        else node._wt = P.tween({ from: from, to: to, dur: 900, ease: 'out', update: function (y) { node.scl = [1, y, 1]; if (ctx.view) ctx.view.invalidate(); } });
      });
      return { figs: { gp: money(c.fees) + ' + ' + money(c.carry) + ' carry', dist: money(c.lpNet) + ' at ' + c.m.toFixed(1) + 'x' } };
    }
  });
})();
