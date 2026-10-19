/* P.S. 3D model: capital-stack. Illustrative company. When it sells, money fills the building from the bottom up.
   set({price: 0..500}) in $M; calc(price) pays debt first (senior, then venture), then decides preferred conversion by iteration
   (1x non-participating; B is senior to A; a class converts when its as-converted share beats its preference, given the others).
   PS3D.getModel('capital-stack').calc(500) -> {senior: 40, venture: 10, b: 112.5, a: 90, common: 247.5, convB: true, convA: true} */
(function () {
  var P = window.PS3D;
  if (!P) return;
  var CLS = [{ k: 'b', pref: 60, pct: 25 }, { k: 'a', pref: 20, pct: 20 }], COMMON = 55;
  function calc(p) {
    var price = Math.max(0, typeof p === 'number' ? p : (p && p.price != null ? +p.price : 100));
    var senior = Math.min(price, 40), r = price - senior, venture = Math.min(r, 10);
    r -= venture;
    function pay(cv) {
      var rem = r, o = { b: 0, a: 0, common: 0 }, sh = COMMON;
      CLS.forEach(function (c) { if (!cv[c.k]) { var x = Math.min(rem, c.pref); o[c.k] = x; rem -= x; } else sh += c.pct; });
      o.common = rem * COMMON / sh;
      CLS.forEach(function (c) { if (cv[c.k]) o[c.k] = rem * c.pct / sh; });
      return o;
    }
    var cv = { b: false, a: false };
    for (var pass = 0; pass < 4; pass++) {
      var nx = {};
      CLS.forEach(function (c) {
        var y = { b: cv.b, a: cv.a }, n = { b: cv.b, a: cv.a };
        y[c.k] = true; n[c.k] = false;
        nx[c.k] = pay(y)[c.k] > pay(n)[c.k] + 1e-9;
      });
      if (nx.b === cv.b && nx.a === cv.a) break;
      cv = nx;
    }
    var o = pay(cv);
    return { price: price, senior: senior, venture: venture, b: o.b, a: o.a, common: o.common, convB: cv.b, convA: cv.a };
  }
  function money(x) { return '$' + (Math.round(x * 10) / 10).toString() + 'M'; }
  var FLOORS = [
    { id: 'senior', n: 1, name: 'Senior debt', claim: 40, h: .6, fig: '$40M claim', why: 'Paid before anyone else when the company is sold.' },
    { id: 'venture', n: 2, name: 'Venture debt', claim: 10, h: .6, fig: '$10M claim', why: 'A specialist lender, paid after the bank and before any shareholder.' },
    { id: 'b', n: 3, name: 'Series B preferred', claim: 60, h: .6, fig: '$60M, 25%', why: 'Takes its $60M back first, or converts to its 25% of the company when that is worth more.' },
    { id: 'a', n: 4, name: 'Series A preferred', claim: 20, h: .6, fig: '$20M, 20%', why: 'Takes its $20M back after Series B, or converts to its 20% when that is worth more.' },
    { id: 'common', n: 5, name: 'Common stock', claim: 247.5, h: 1, fig: '55%', why: 'Founders hold 40% and employees 15%; common is paid last, from whatever is left.' }
  ];
  P.model('capital-stack', {
    v: 1, title: 'Who gets paid first', desc: 'Illustrative company. 1x non-participating preferences; preferred converts when common is worth more.',
    units: 'model', camera: 'ortho', views: { iso: { yaw: 40, pitch: 26, zoom: 1.05 }, front: { yaw: 0, pitch: 0 }, plan: { yaw: 0, pitch: 90 } },
    params: { price: 100 }, calc: calc,
    mats: { floor: { face: 'paper', faceA: 0, line: 'ink' }, water: { kind: 'liquid', face: 'accent', faceA: .55, line: 'ink', lineA: 1, w: 1 }, ring: { face: 'none', line: 'accent', w: 1.5 } },
    /* each floor names itself at its left-hand corner, clear of the conversion overflow on the right, and travels with it
       when the stack comes apart */
    labels: [['senior', .6, 'Senior debt'], ['venture', .6, 'Venture debt'], ['b', .6, 'Series B'], ['a', .6, 'Series A'], ['common', 1, 'Common']]
      .map(function (l) { return { part: l[0], at: [-1, l[1] / 2, 1], text: l[2], align: 'end' }; }),
    build: function (B) {
      var y = 0, parts = [];
      FLOORS.forEach(function (f, i) {
        var top = f.id === 'common', kids = [
          B.part('water-' + f.id, { pick: false, pos: [0, 0, 0], scl: [1, .001, 1] }, [B.box(0, 0, 0, 1.94, f.h, 1.94, { mat: 'water' })])
        ];
        if (f.id === 'b' || f.id === 'a') {
          kids.push(B.part('ext-' + f.id, { pick: false, pos: [1.33, 0, 0], scl: [1, .001, 1], visible: false }, [B.box(0, 0, 0, .56, 1, 1.2, { mat: 'water' })]));
          kids.push(B.part('ring-' + f.id, { pick: false, visible: false }, [B.path([[-1.06, f.h + .005, -1.06], [1.06, f.h + .005, -1.06], [1.06, f.h + .005, 1.06], [-1.06, f.h + .005, 1.06]], { closed: true, mat: 'ring' })]));
        }
        parts.push(B.part(f.id, { n: f.n, name: f.name, fig: f.fig, why: f.why, pos: [0, y, 0], anchor: [1, f.h * .5, 1], explode: [0, i * .45, 0] },
          [B.box(0, 0, 0, 2, f.h, 2, top ? { mat: 'floor', open: '+y', openDash: 4 } : { mat: 'floor' })], kids));
        y += f.h;
      });
      return parts;
    },
    update: function (root, p) {
      var c = calc(p.price), n = root.parts, pay = { senior: c.senior, venture: c.venture, b: c.b, a: c.a, common: c.common }, figs = {};
      FLOORS.forEach(function (f) {
        var v = pay[f.id], conv = (f.id === 'b' && c.convB) || (f.id === 'a' && c.convA);
        /* a dry floor shows no water at all, so the waterline is the top of the last grey floor */
        n['water-' + f.id].scl = [1, Math.max(.001, Math.min(1, v / f.claim)), 1]; n['water-' + f.id].visible = v / f.claim > .002;
        if (n['ext-' + f.id]) {
          var ex = conv ? Math.min(1.2, .6 * Math.max(0, v - f.claim) / f.claim) : 0;
          n['ext-' + f.id].visible = ex > .002; n['ext-' + f.id].scl = [1, Math.max(.001, ex), 1];
          n['ring-' + f.id].visible = conv;
        }
        figs[f.id] = money(v) + (conv ? ', converted' : '');
      });
      return { figs: figs };
    }
  });
})();
