/* P.S. 3D model: lab-cutaway. The Lab as a building cut open: 12 floors, one per wing (Wing I at the top), 47 machine blocks.
   Blocks are 0.5 x 0.3 x 0.5 (the six deep simulations stand 0.6 tall). A block links to /experiments#exp-N.
   Explode doubles the space between floors. def.wings is the directory the page lists under the drawing. */
(function () {
  var P = window.PS3D;
  if (!P) return;
  var FH = .9, DEEP = { 14: 1, 42: 1, 43: 1, 45: 1, 46: 1, 47: 1 };
  var T = ['Your life in weeks', 'The three doors', 'Six in a row', 'Fold to the Moon', 'A billion seconds', 'Powers of ten',
    'A small universe', 'The armor problem', 'The fifty million dollar email', 'The ten minute turn', 'You are not in the burger business',
    'The sip test', 'Make the call', 'Final round', 'The compounding machine', 'The shrinking hundred', 'The honest coin',
    'The patience market', 'Venture odds', 'Follow one dollar', 'The herd', 'The rich get richer', 'The generous coin',
    'The short squeeze', 'The option clock', 'The marshmallow clock', 'The reaction tax', 'The gauntlet', 'Predictions, checked',
    'The trust machine', 'The birthday party', 'The threshold', 'The penalty spot', 'The pulled goalie', 'Fourth down',
    'The vanishing number', 'The delegation dial', 'The punch card', 'The covered ladder', 'Conviction: the margin call', 'The acquirer',
    'The titan’s ledger', 'The batch', 'Four machines that changed what things cost', 'Frontier: the scaling bet', 'Two seventy',
    'The living drug'];
  var R = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  var WINGS = [
    ['The marquee', 8, 'The machines people talk about afterward, from your life in weeks to a bomber full of holes.'],
    ['The boardroom', 6, 'Make the calls Blockbuster, Southwest, McDonald’s and Coca-Cola made, six more from Intel to Netflix, then a strategy-firm final round.'],
    ['Capital', 11, 'Eleven machines about money: how it grows, shrinks, streaks and stampedes, what a fund’s fees do to one dollar, and what a short or an option costs while you wait.'],
    ['The mind', 4, 'Your brain ships with known bugs, and these four machines find yours.'],
    ['Other people', 3, 'Trust, coincidence and contagion: what changes when other people are in the game.'],
    ['The stadium', 3, 'Three calls where the math and the crowd disagree: a penalty, an empty net and a fourth down.'],
    ['Time', 2, 'The budget that never refills: what your memory can hold, and what you hand to a machine.'],
    ['Twenty slots', 1, 'One machine that keeps score for life. Twenty punches. No undo.'],
    ['The pit', 1, 'The roulette table, back after closing with a gentler rule: every bet covers the losses plus $10. Watch it double anyway.'],
    ['The corner office', 2, 'Run the whole firm: a levered fund in the week the trade turns, and a buyer of tired software with a debt facility.'],
    ['The foundry', 4, 'Build the firm before you run it: Rockefeller’s refinery and Carnegie’s mill, a 12-week startup, the four machines that set modern prices, and an AI lab one model behind.'],
    ['The last mile', 2, 'Winning the argument is the start: a campaign that needs votes in the right states, and a cell therapy that must survive the factory, the price and the drive to the hospital.']
  ];
  var dir = [], no = 0;
  WINGS.forEach(function (w, i) {
    var m = [];
    for (var j = 0; j < w[1]; j++) { no++; m.push([no, T[no - 1]]); }
    dir.push({ n: i + 1, roman: R[i], name: w[0], count: w[1], why: w[2], machines: m });
  });
  P.model('lab-cutaway', {
    v: 1, title: '3D cutaway of the Lab: 12 floors, one per wing, holding 47 machines.',
    desc: 'One floor per wing, Wing I at the top. Choose a machine to go straight to it.',
    camera: 'ortho', pins: false, wings: dir, labelMode: { column: 'right' },
    views: { iso: { yaw: 40, pitch: 26, zoom: 1 }, front: { yaw: 0, pitch: 4 }, plan: { yaw: 0, pitch: 90 } },
    mats: { col: { face: 'none', line: 'ink2', lineA: .6 }, slab: { kind: 'plaster', face: 'card', line: 'ink2', lineA: .8 } },
    /* wing names in one column by the right edge, each on a leader from its floor's front right corner */
    labels: dir.map(function (w, i) { return { at: [3, (11 - i) * FH + .06, 1.5], text: 'Wing ' + w.roman }; }),
    build: function (B) {
      var parts = [], top = 12 * FH;
      parts.push(B.part('frame', { pick: false, layer: -1, fit: false }, [B.lines([
        -3, 0, -1.5, -3, top, -1.5, 3, 0, -1.5, 3, top, -1.5, -3, top, -1.5, 3, top, -1.5, -3, top, -1.5, -3, top, 1.5
      ], { mat: 'col' })]));
      dir.forEach(function (w, i) {
        var y = (11 - i) * FH, kids = [], k = w.count, rows = k > 5 ? 2 : 1, per = Math.ceil(k / rows);
        w.machines.forEach(function (m, j) {
          var row = rows > 1 ? (j < per ? 0 : 1) : 0, c = rows > 1 ? (row ? j - per : j) : j, cnt = row ? k - per : per;
          var x = -3 + (c + .5) * 6 / cnt, z = rows > 1 ? (row ? .7 : -.7) : 0, h = DEEP[m[0]] ? .6 : .3, nn = (m[0] < 10 ? '0' : '') + m[0];
          kids.push(B.part('m' + m[0], { name: 'No. ' + nn, fig: m[1], why: w.name, cap: 'No. ' + nn + ' · ' + w.name + ' · ' + m[1],
            href: '/experiments#exp-' + m[0], anchor: [x, y + .06 + h, z] }, [B.box(x, y + .06, z, .5, h, .5)]));
        });
        parts.push(B.part('w' + (i + 1), { n: i + 1, name: 'Wing ' + w.roman + ' · ' + w.name, fig: w.count + (w.count === 1 ? ' machine' : ' machines'),
          why: w.why, anchor: [3, y + .06, 1.5], explode: [0, (11 - i) * FH, 0] },
          [B.box(0, y, 0, 6, .06, 3, { mat: 'slab' }), B.lines([-3, y + .06, -1.5, -3, y + FH, -1.5, 3, y + .06, -1.5, 3, y + FH, -1.5], { line: 'ink2', lineA: .5 })], kids));
      });
      return parts;
    }
  });
})();
