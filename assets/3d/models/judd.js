/* P.S. 3D model: judd. Donald Judd, 100 untitled works in mill aluminum (1982 to 1986), Marfa.
   Every box is 41 x 51 x 72 in outside (1.04 H x 1.30 W x 1.83 D m; chinati.org/collection/donald-judd/).
   Two former artillery sheds, 30 x 4 x 7 m, with vaulted roofs and windows down the long walls. The interiors come from
   12 illustrative types drawn with a seeded generator; the split between the sheds is approximate (Chinati publishes none).
   Each box is opaque with its own open sides, so you look into it the way you do in the shed. Explode lifts the roofs. */
(function () {
  var P = window.PS3D;
  if (!P) return;
  var SRC = 'https://chinati.org/collection/donald-judd/';
  var W = 1.30, H = 1.04, D = 1.83, SL = 30, SH = 4, SW = 7, GAP = 3.4;
  var KINDS = ['open', 'diagonal plane', 'horizontal shelf', 'vertical divider', 'two dividers', 'open side', 'recessed top', 'open end',
    'split level', 'angled side', 'inset plane', 'closed'];
  var OPEN = ['+z-z', '+y', '+z', '+y', '+y', '+x', '+y', '-z', '+z', '+x', '+y', ''];
  /* interior planes for a box centred at (x, z), as polys in the box's own frame */
  function inner(B, k, x, z) {
    var w = W / 2 - .03, d = D / 2 - .03, h = H - .03, o = [], q = function (a) { o.push(B.poly(a.map(function (v) { return [x + v[0], v[1], z + v[2]]; }))); };
    if (k === 1) q([[-w, .03, d], [w, .03, d], [w, h, -d], [-w, h, -d]]);
    else if (k === 2) q([[-w, H / 2, -d], [w, H / 2, -d], [w, H / 2, d], [-w, H / 2, d]]);
    else if (k === 3) q([[-w, .03, 0], [w, .03, 0], [w, h, 0], [-w, h, 0]]);
    else if (k === 4) { q([[-w, .03, -d / 3], [w, .03, -d / 3], [w, h, -d / 3], [-w, h, -d / 3]]); q([[-w, .03, d / 3], [w, .03, d / 3], [w, h, d / 3], [-w, h, d / 3]]); }
    else if (k === 6) q([[-w, H - .2, -d], [w, H - .2, -d], [w, H - .2, d], [-w, H - .2, d]]);
    else if (k === 8) { q([[-w, H / 2, 0], [w, H / 2, 0], [w, H / 2, d], [-w, H / 2, d]]); q([[-w, .03, 0], [w, .03, 0], [w, H / 2, 0], [-w, H / 2, 0]]); }
    else if (k === 9) q([[w, .03, -d], [w, .03, d], [-w + .1, h, d], [-w + .1, h, -d]]);
    else if (k === 10) q([[-w + .14, .03, -d], [-w + .14, .03, d], [-w + .14, h - .14, d], [-w + .14, h - .14, -d]]);
    return o;
  }
  /* a shed: a plaster floor slab the boxes stand on, wire walls, windows down the long sides, and a vault of 8 arc segments at each bay */
  function shed(B, i, cz) {
    var x0 = -SL / 2, x1 = SL / 2, z0 = cz - SW / 2, z1 = cz + SW / 2, wl = [], rf = [], k, b;
    wl.push(x0, 0, z0, x1, 0, z0, x0, 0, z1, x1, 0, z1, x0, SH, z0, x1, SH, z0, x0, SH, z1, x1, SH, z1);
    for (b = 0; b <= 6; b++) { var xb = x0 + b * SL / 6; wl.push(xb, 0, z0, xb, SH, z0, xb, 0, z1, xb, SH, z1); }
    wl.push(x0, 0, z0, x0, 0, z1, x1, 0, z0, x1, 0, z1);
    for (b = 0; b < 12; b++) {
      var wx = x0 + 1 + b * (SL - 2) / 12 + .2, ww = (SL - 2) / 12 - .4;
      [z0, z1].forEach(function (zz) { wl.push(wx, 1.2, zz, wx + ww, 1.2, zz, wx + ww, 1.2, zz, wx + ww, 3.2, zz, wx + ww, 3.2, zz, wx, 3.2, zz, wx, 3.2, zz, wx, 1.2, zz); });
    }
    for (b = 0; b <= 6; b++) {
      var xr = x0 + b * SL / 6;
      for (k = 0; k < 8; k++) {
        var a0 = Math.PI * k / 8, a1 = Math.PI * (k + 1) / 8;
        rf.push(xr, SH + Math.sin(a0) * 1.4, cz - Math.cos(a0) * SW / 2, xr, SH + Math.sin(a1) * 1.4, cz - Math.cos(a1) * SW / 2);
      }
    }
    for (k = 1; k < 8; k++) { var a = Math.PI * k / 8; rf.push(x0, SH + Math.sin(a) * 1.4, cz - Math.cos(a) * SW / 2, x1, SH + Math.sin(a) * 1.4, cz - Math.cos(a) * SW / 2); }
    return B.part('shed-' + i, { n: i, name: 'Artillery shed', fig: i + ' of 2', why: 'A former army artillery shed in Marfa, converted by Judd to hold the work.',
      anchor: [x1, SH, z1] }, [B.box(0, -.12, cz, SL + .6, .12, SW + .6, { mat: 'plaster' }), B.lines(wl, { line: 'ink2', lineA: .75 })],
      [B.part('roof-' + i, { pick: false, explode: [0, 3, 0], fit: false }, [B.lines(rf, { line: 'ink2', lineA: .55 })])]);
  }
  P.model('judd', {
    v: 2, title: '3D model of Donald Judd’s 100 untitled works in mill aluminum, in two former artillery sheds in Marfa.',
    desc: 'Identical outside. No two interiors alike.', camera: 'ortho', pins: false,
    views: { iso: { yaw: 36, pitch: 30, zoom: 1 }, plan: { yaw: 0, pitch: 90 }, front: { yaw: 0, pitch: 4 } },
    mats: { alu: { kind: 'metal', face: 'card', line: 'ink' } },
    build: function (B) {
      var r = B.rng(1986), sheds = [shed(B, 1, -(SW + GAP) / 2), shed(B, 2, (SW + GAP) / 2)], no = 0;
      sheds.forEach(function (s, si) {
        var cz = (si ? 1 : -1) * (SW + GAP) / 2, kids = s.children;
        for (var c = 0; c < 17; c++) for (var row = 0; row < 3; row++) {
          if (c === 16 && row === 2) continue;
          var k = (r() * KINDS.length) | 0, x = -SL / 2 + 1.25 + c * 1.72, z = cz + (row - 1) * 2.2;
          no++;
          kids.push(B.part('b' + no, { name: 'No. ' + no + ' of 100', fig: '41 × 51 × 72 in', why: 'Mill aluminum. Interior: ' + KINDS[k] + '.', src: SRC,
            cap: 'No. ' + no + ' of 100 · mill aluminum · 41 × 51 × 72 in · interior: ' + KINDS[k], anchor: [x, H, z] },
            [B.box(x, 0, z, W, H, D, { mat: 'alu', open: OPEN[k] })].concat(inner(B, k, x, z))));
        }
      });
      return [B.part('ground', { pick: false, layer: -1, mat: 'quiet', fit: false }, [B.lines([-SL / 2 - 1, 0, -SW - GAP / 2 - 1, SL / 2 + 1, 0, -SW - GAP / 2 - 1, SL / 2 + 1, 0, -SW - GAP / 2 - 1, SL / 2 + 1, 0, SW + GAP / 2 + 1], { line: 'ink2', lineA: .4 })])].concat(sheds);
    }
  });
})();
