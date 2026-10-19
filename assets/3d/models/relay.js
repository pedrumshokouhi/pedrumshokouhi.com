/* P.S. 3D model: relay. The World's #lineage: nine financiers in six hundred years, and one open plinth.
   Ten plinths in date order along x (1.1 apart); each carries a small token of the tool it handed down; the tenth is drawn
   dashed and empty. A foil baton travels arcs 0.5 high from plinth to plinth as set({p: 0..1}) moves.
   Strings come from the page's own cards: params.nodes = [{name, fig, why, year}], so the model asserts nothing new.
   set({claimed: true}) draws the open plinth solid. */
(function () {
  var P = window.PS3D;
  if (!P) return;
  var N = 10, G = 1.1, TOP = .12, ARC = .5;
  function px(i) { return (i - (N - 1) / 2) * G; }
  /* the tokens: what each runner set on the plinth for the next one */
  function token(B, i, x) {
    var y = TOP, s = [], L = [];
    if (i === 0) { s.push(B.box(x, y, 0, .34, .07, .26)); L.push(x - .13, y + .07, -.1, x - .13, y + .07, .1); }
    else if (i === 1) { s.push(B.box(x, y, 0, .32, .02, .22)); L.push(x - .16, y + .02, -.11, x, y + .02, .02, x, y + .02, .02, x + .16, y + .02, -.11); }
    else if (i === 2) {
      for (var k = 0; k < 5; k++) {
        var a = k / 5 * Math.PI * 2, cx = x + Math.cos(a) * .2, cz = Math.sin(a) * .2, b = (k + 2) / 5 * Math.PI * 2;
        s.push(B.box(cx, y, cz, .06, .06, .06));
        L.push(cx, y + .03, cz, x + Math.cos(b) * .2, y + .03, Math.sin(b) * .2);
      }
    }
    else if (i === 3) { s.push(B.box(x, y, 0, .26, .24, .22)); L.push(x - .08, y + .05, .111, x - .08, y + .19, .111, x - .08, y + .19, .111, x + .08, y + .19, .111, x + .08, y + .19, .111, x + .08, y + .05, .111, x + .08, y + .05, .111, x - .08, y + .05, .111); }
    else if (i === 4) {
      s.push(B.poly([[x - .02, y, -.13], [x - .2, y + .05, -.13], [x - .2, y + .05, .13], [x - .02, y, .13]]));
      s.push(B.poly([[x + .02, y, -.13], [x + .2, y + .05, -.13], [x + .2, y + .05, .13], [x + .02, y, .13]]));
    }
    else if (i === 5) { s.push(B.box(x, y, 0, .28, .3, .24, { mat: 'ghost' })); }
    else if (i === 6) { for (var e = 0; e < 8; e++) s.push(B.box(x - .245 + e * .07, y, (e % 2 ? .05 : -.05), .03, .16, .03)); }
    else if (i === 7) { s.push(B.box(x - .1, y, 0, .07, .08, .07), B.box(x, y, 0, .07, .15, .07), B.box(x + .1, y, 0, .07, .26, .07)); }
    else if (i === 8) { s.push(B.box(x, y, 0, .24, .01, .32)); for (var r = 0; r < 4; r++) L.push(x - .08, y + .011, -.1 + r * .06, x + .08, y + .011, -.1 + r * .06); }
    if (L.length) s.push(B.lines(L, { line: 'ink2' }));
    return s;
  }
  P.model('relay', {
    v: 1, title: 'A relay of nine financiers across six hundred years, ending at an open plinth.',
    desc: 'Nine financiers in six hundred years, and one open place.',
    camera: 'ortho', pins: false, units: 'model',
    views: { iso: { yaw: 34, pitch: 24, zoom: .9 }, front: { yaw: 0, pitch: 6 }, plan: { yaw: 0, pitch: 90 } },
    params: { nodes: [], p: 0, claimed: false },
    mats: { arc: { face: 'none', line: 'ink2', lineA: .55, dash: 3 }, open: { face: 'none', line: 'ink2', dash: 4, lineA: .8 } },
    build: function (B, p, def) {
      /* the year under each plinth, read from the card it stands for */
      def.labels = [];
      for (var j = 0; j < N; j++) {
        var m = String((p.nodes[j] || {}).year || (p.nodes[j] || {}).fig || '').match(/\d{4}/);
        def.labels.push({ at: [px(j), 0, .62], text: m ? m[0] : (j === N - 1 ? 'Now' : '') });
      }
      var parts = [B.part('ground', { pick: false, layer: -1, mat: 'quiet', fit: false }, [B.lines([px(0) - .8, 0, .62, px(N - 1) + .8, 0, .62], { line: 'ink2', lineA: .5 })])];
      var arcs = [];
      for (var i = 0; i < N; i++) {
        var nd = p.nodes[i] || {}, x = px(i), last = i === N - 1;
        var kids = last ? [B.part('solid', { pick: false, visible: !!p.claimed }, [B.box(x, 0, 0, .7, TOP, .7, { mat: 'paper' })])] : null;
        parts.push(B.part('r' + i, { n: i + 1, name: nd.name || '', fig: nd.fig || '', why: nd.why || '', anchor: [x, TOP, 0] },
          last ? [B.box(x, 0, 0, .7, TOP, .7, { mat: 'open' })] : [B.box(x, 0, 0, .7, TOP, .7)].concat(token(B, i, x)), kids));
        if (!last) for (var k = 0; k < 10; k++) {
          var t0 = k / 10, t1 = (k + 1) / 10;
          arcs.push(x + G * t0, TOP + ARC * 4 * t0 * (1 - t0) + .06, 0, x + G * t1, TOP + ARC * 4 * t1 * (1 - t1) + .06, 0);
        }
      }
      parts.push(B.part('arcs', { pick: false, fit: false }, [B.lines(arcs, { mat: 'arc' })]));
      parts.push(B.part('baton', { pick: false, mat: 'foil', fit: false }, [B.sphere([0, 0, 0], .06, { line: 'accent', face: 'accent' })]));
      return parts;
    },
    update: function (root, p) {
      var q = Math.max(0, Math.min(1, +p.p || 0)) * (N - 1), i = Math.min(N - 2, Math.floor(q)), f = q - i;
      root.parts.baton.pos = [px(i) + G * f, TOP + ARC * 4 * f * (1 - f) + .06, 0];
      var s = root.parts.solid; if (s) s.visible = !!p.claimed;
    },
    /* x of a stop, so the page can follow the baton with the camera */
    at: function (q) { return px(Math.max(0, Math.min(1, q)) * (N - 1)); }
  });
})();
