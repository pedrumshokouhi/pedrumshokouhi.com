/* P.S. 3D model: world-plan, v2 (v3.1). The World as a building on one plaster plinth: a prologue step, four chapter volumes and a
   coda pavilion. The thirteen rooms are paper tiles on their roofs, in walking order from the front-left corner (the front row runs
   left to right, the back row comes back right to left), each tile as tall as its room's page budget (.06 to .5). Hover or focus
   lifts a tile and turns it foil; a volume lifts as a whole and captions its chapter ("II · The Money · 3 rooms"). Click goes to
   <base><id>. WebGL by default; a page may still ask for Canvas2D with renderer: '2d'.
   PS3D.mount(fig, 'world-plan', {params: {base: '/world#', names: true}, list: false, controls: false, pins: false, card: false, caption: capEl})
   params.names: false drops the six chapter names from the floor (narrow stages under about 520px). world.html carries the same
   definition inline (it registers it only when no v2 model is loaded). */
(function () {
  var P = window.PS3D;
  if (!P) return;
  var ROOMS = [
    ['hello', '00', 'Hi, Friend', '', 'p', 900],
    ['founders', '01', 'Case Files', '25 files', 'I', 1800], ['no', '02', 'Museum of No', '23 refusals', 'I', 1400],
    ['lineage', '03', 'Lineage of Capital', '9 financiers', 'II', 2700], ['allocators', '04', 'Allocators', '10 investors', 'II', 900],
    ['numbers', '05', 'Numbers', '18 numbers', 'II', 900],
    ['gallery', '06', 'The Gallery', '10 artists', 'III', 900], ['cabinet', '07', 'Cabinet of Taste', '8 places', 'III', 900],
    ['canon', '08', 'The Canon', '18 books', 'III', 800],
    ['desk', '09', 'The Desk', '', 'IV', 1000],
    ['experiments', '10', 'Experiments', '47 machines', 'c', 950], ['board', '11', 'The Blackboard', '', 'c', 810],
    ['colophon', '12', 'Colophon', '', 'c', 650]
  ];
  /* [key, the id it opens, numeral, name, body height, row: 0 front, 1 back] */
  var CHAP = [
    ['p', 'hello', 'Prologue', 'Prologue', .12, 0], ['I', 'ch-builders', 'I', 'The Builders', .24, 0], ['II', 'ch-money', 'II', 'The Money', .3, 0],
    ['III', 'ch-taste', 'III', 'Taste', .42, 1], ['IV', 'ch-desk', 'IV', 'The Desk', .52, 1], ['c', 'experiments', 'Coda', 'Coda', .36, 1]
  ];
  var T = 1.02, PAD = .16, GAP = .34, DEP = 1.26, ROWZ = [.9, -.9];
  function th(b) { return .06 + (b - 650) / (2700 - 650) * .44; }
  P.model('world-plan', {
    v: 2, title: 'The World, floor plan: 13 rooms in four chapters.',
    desc: 'A prologue, four chapters and a coda. Pick a tile to walk straight into that room.',
    camera: 'ortho', pins: false, fill: .9,
    views: { iso: { yaw: 30, pitch: 36, zoom: 1 }, plan: { yaw: 0, pitch: 90 } },
    params: { rooms: ROOMS, chapters: CHAP, base: '/world#', names: true },
    build: function (B, p) {
      var rooms = p.rooms, parts = [], labels = [], rows = [[], []], spans = {}, minX = 1e9, maxX = -1e9;
      p.chapters.forEach(function (c) { rows[c[5]].push(c); });
      rows[1].reverse();
      rows.forEach(function (row, r) {
        var widths = row.map(function (c) { return rooms.filter(function (m) { return m[4] === c[0]; }).length * T + PAD * 2 - (T - .9); });
        var x = -(widths.reduce(function (a, b) { return a + b; }, 0) + GAP * (row.length - 1)) / 2;
        row.forEach(function (c, k) { spans[c[0]] = [x, x + widths[k], ROWZ[r]]; minX = Math.min(minX, x); maxX = Math.max(maxX, x + widths[k]); x += widths[k] + GAP; });
      });
      var zf = ROWZ[0] + DEP / 2 + .62, zb = ROWZ[1] - DEP / 2 - 1.3;
      parts.push(B.part('plinth', { pick: false, layer: -1, mat: 'plaster' }, [B.box((minX + maxX) / 2, -.1, (zf + zb) / 2, maxX - minX + 1, .1, zf - zb)]));
      p.chapters.forEach(function (c) {
        var s = spans[c[0]], cx = (s[0] + s[1]) / 2, h = c[4], z = s[2], back = c[5] === 1;
        var mine = rooms.filter(function (m) { return m[4] === c[0]; });
        if (back) mine = mine.slice().reverse();
        var kids = mine.map(function (m, j) {
          var x = s[0] + PAD + .45 + j * T, ht = th(m[5]);
          labels.push({ part: m[0], at: [x, h + ht + .01, z], text: m[1] });
          return B.part(m[0], { name: m[2], n: +m[1], fig: m[1], why: m[3], cap: [m[1], m[2], m[3]].filter(Boolean).join(' · '),
            href: p.base + m[0], lift: .12, anchor: [x, h + ht, z] }, [B.box(x, h, z, .9, ht, .9)]);
        });
        var nm = c[2] === c[3] ? c[3] : c[2] + ' · ' + c[3], cnt = mine.length + (mine.length === 1 ? ' room' : ' rooms');
        if (p.names) labels.push({ at: [cx, 0, back ? z - DEP / 2 - 1 : z + DEP / 2 + .26], text: nm, align: 'ch' });
        parts.push(B.part('v-' + c[0], { name: nm, fig: c[2], why: cnt, cap: nm + ' · ' + cnt, href: p.base + c[1], lift: .07,
          anchor: [cx, h, z] }, [B.box(cx, 0, z, s[1] - s[0], h, DEP)], kids));
      });
      this.labels = labels;
      return parts;
    }
  });
})();
