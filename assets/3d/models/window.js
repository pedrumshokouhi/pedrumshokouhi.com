/* P.S. 3D model: window. The Lab's entrance, "The Window": six featured machines drawn in ink in one shared WebGL view.
   The canvas moves into whichever slide is showing. Each drawing plays its story once on arrival, on the page's VSTORY clock,
   then rests; a tap on it runs one transformation. The page keeps the slides, the clock, the story curves and the 2D painters
   (the fallback); this file keeps the drawings, the view, the labels and the tilt. It loads only when the Window comes near.
   def.mount(W3, {vit, vSlides, VS, vRM, VSTORY, VNAV, vE, vEo, vSeg, VT34, VSN, vStopAuto}) -> {show(i), snap(slide), act(), tilt(nx, ny)}.
   It fills the page's W3 record (on, g, v, ...), so the page can keep asking W3.on.
   v2: lit solids on the espresso stage, the pointer light, a faint floor reflection (desktop), tags through the engine's label
   layer (kept off the drawing and off each other), and a first frame at rest.
   v2.1: registered with the slide's poster. The posters were drawn at their viewBox aspect (700 x 666) and are fitted into the
   stage with "meet", so the live view frames each drawing at that same size and centre on any stage; the slide that is
   showing when the view mounts stays at the rest pose its poster prints (no rewind), and the stage only turns to the live
   view once a visible frame exists. Later slides play their story on arrival as before. */
(function () {
  var P = window.PS3D;
  if (!P) return;
  function mount(W3, X) {
    var vit = X.vit, vSlides = X.vSlides, VS = X.VS, vRM = X.vRM, VSTORY = X.VSTORY, VNAV = X.VNAV,
      vE = X.vE, vEo = X.vEo, vSeg = X.vSeg, VT34 = X.VT34, VSN = X.VSN, vStopAuto = X.vStopAuto;
    W3.v = null; W3.g = null; W3.tags = null; W3.tryEl = null; W3.roots = {}; W3.m = null; W3.root = null; W3.st = {}; W3.t = 0;
    W3.stop = null; W3.tws = []; W3.lab = []; W3.sy = null; W3.sp = null; W3.orient = false;
    function w3C(x, a, b) { return x < a ? a : x > b ? b : x; }
    function w3Q(deg) { var h = deg * Math.PI / 360; return [0, Math.sin(h), 0, Math.cos(h)]; }
    function w3Z(deg) { var h = deg * Math.PI / 360; return [0, 0, Math.sin(h), Math.cos(h)]; }
    function w3Ring(n) { var p = []; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; p.push([Math.cos(a), 0, Math.sin(a)]); } return p; }
    var W3MATS = { pane: { kind: 'glass', face: 'ink', faceA: .07, line: 'ink2', lineA: .7, dash: 4 }, band: { kind: 'foil', face: 'accent', line: 'accent', lineA: .8 },
      bside: { face: 'card', line: 'ink2', lineA: .8 } };

    /* conviction: six trading days, the fund's NAV as a ribbon over them, the margin line as a pane of glass */
    var W3X = function (i) { return -2.95 + 5.9 * i / 48; }, W3Y = function (v) { return .3 + (v - 40) / 60 * 1.5; }, W3YM = W3Y(58), W3VY = [];
    /* the painter's 48 points, eased a little for the ribbon: the day-5 low (57) and both ends are kept exactly */
    var W3NAV = VNAV.map(function (v, i, a) { return i === 0 || i === 48 || i === 34 ? v : (a[i - 1] + 2 * v + a[i + 1]) / 4; });
    var W3M = {
      nav: { yaw: 42, pitch: 24, frame: { L: 0 }, hint: function (s) { return s.up ? 'Replay the week' : 'Post more collateral'; },
        build: function (B) {
          var p = [B.part('base', { layer: -1, pick: false, mat: 'quiet' }, [B.box(0, -.06, 0, 6.5, .06, 1.6)])], i, d, w = .2;
          for (d = 0; d < 6; d++) p.push(B.part('d' + d, { pick: false }, [B.box(-2.5 + d, 0, 0, .9, .04, .6)]));
          p.push(B.part('pane', { pick: false, mat: 'pane' }, [B.poly([[-3.1, W3YM, -.62], [3.1, W3YM, -.62], [3.1, W3YM, .62], [-3.1, W3YM, .62]])]));
          for (i = 0; i < 48; i++) p.push(B.part('r' + i, { pick: false, mat: 'band', pos: [W3X(i), W3Y(W3NAV[i]), 0] },
            [B.poly([[0, 0, -w], [1, 0, -w], [1, 0, w], [0, 0, w]], { edges: false }), B.lines([0, 0, -w, 1, 0, -w, 0, 0, w, 1, 0, w], { w: 1.25 })]));
          p.push(B.part('head', { pick: false }, [B.sphere([0, 0, 0], .05, { face: 'ink', line: 'ink' })]));
          p.push(B.part('ring', { pick: false, mat: 'foil', pos: [W3X(34), W3YM + .003, 0], fit: false }, [B.path(w3Ring(40), { closed: true, w: 1.5 })]));
          return p;
        },
        pose: function (r, t, s) {
          var P = r.parts, f = (s.rp != null ? s.rp : vE(vSeg(t, 0, 5000))) * 48, L = s.L || 0, i;
          for (i = 0; i <= 48; i++) W3VY[i] = W3Y(W3NAV[i] + L * Math.max(0, 64 - W3NAV[i]) * .85);
          for (i = 0; i < 48; i++) {
            var n = P['r' + i], a = w3C(f - i, 0, 1);
            n.visible = a > 0;
            if (!a) continue;
            var dx = W3X(i + 1) - W3X(i), dy = W3VY[i + 1] - W3VY[i];
            n.pos[1] = W3VY[i]; n.rot = w3Z(Math.atan2(dy, dx) * 180 / Math.PI); n.scl[0] = Math.sqrt(dx * dx + dy * dy) * a;
          }
          var j = Math.min(47, Math.floor(f)), fr = f >= 48 ? 1 : f - j;
          P.head.visible = f > 0;
          P.head.pos[0] = W3X(j) + (W3X(j + 1) - W3X(j)) * fr; P.head.pos[1] = W3VY[j] + (W3VY[j + 1] - W3VY[j]) * fr;
          var g = s.rs != null ? s.rs : (s.rp != null ? 0 : vSeg(t, VT34, VT34 + 900)), e = vEo(g);
          P.ring.visible = g > 0 && L < .99;
          P.ring.scl = [.04 + .52 * e, 1, .04 + .52 * e]; P.ring.alpha = (1 - .5 * g) * (1 - L);
        },
        act: function (s, tw) {
          s.up = !s.up; s.rs = 0;
          tw('rp', 0, 1, 900, 'io');
          if (s.up) tw('L', s.L || 0, 1, 600, 'out', 500);
          else { tw('L', s.L || 0, 0, 300, 'io'); tw('rs', 0, 1, 540, 'out', 560); }
        },
        tags: [
          { at: [-3.1, W3YM, .62], text: 'The margin line', show: function (t) { return t > 900; }, ax: '0%', ay: '-130%' },
          { at: [W3X(34), W3YM, .62], text: 'Margin call', cls: 'live', ay: '90%',
            show: function (t, s) { return (s.L || 0) < .4 && (s.rs != null ? s.rs > .1 : t > VT34 + 150); } }
        ] },

      /* the three doors: you hold door 1, the host opens door 3 on an empty floor, your pick slides to door 2 */
      doors: { yaw: 24, pitch: 14, frame: { o: 1 }, hint: function (s) { return s.o > .5 ? 'Close door 2' : 'Open door 2'; },
        build: function (B) {
          var p = [B.part('base', { layer: -1, pick: false, mat: 'quiet' }, [B.box(0, -.05, .02, 2.75, .05, 1.2)])], d;
          for (d = 0; d < 3; d++) {
            var cx = (d - 1) * .85;
            p.push(B.part('f' + d, { pick: false }, [B.box(cx - .28, 0, 0, .04, 1.06, .1), B.box(cx + .28, 0, 0, .04, 1.06, .1), B.box(cx, 1.06, 0, .6, .045, .1)]));
            p.push(B.part('l' + d, { pick: false, pos: [cx - .25, .006, .03] }, [
              B.box(.25, 0, 0, .5, 1, .035),
              B.lines([.08, .1, .019, .42, .1, .019, .42, .1, .019, .42, .46, .019, .42, .46, .019, .08, .46, .019, .08, .46, .019, .08, .1, .019,
                .08, .54, .019, .42, .54, .019, .42, .54, .019, .42, .9, .019, .42, .9, .019, .08, .9, .019, .08, .9, .019, .08, .54, .019], { line: 'ink2', lineA: .75, w: .75, n: [0, 0, 1] }),
              B.sphere([.43, .5, .032], .016, { face: 'ink', line: 'ink' })
            ]));
          }
          p.push(B.part('prize', { pick: false, pos: [0, .19, -.34] }, [B.sphere([0, 0, 0], .17, { face: 'accent', line: 'accent' })]));
          p.push(B.part('pick', { pick: false, pos: [-.85, .004, .24] }, [B.lines([-.24, 0, 0, .24, 0, 0], { line: 'accent', w: 2 })]));
          return p;
        },
        pose: function (r, t, s) {
          var P = r.parts, u = vEo(vSeg(t, 600, 1400)), o = s.o || 0;
          P.pick.visible = u > 0; P.pick.scl[0] = Math.max(.001, u); P.pick.pos[0] = -.85 + .85 * vE(vSeg(t, 4000, 4600));
          P.l2.rot = w3Q(-100 * vE(vSeg(t, 1600, 2600)));
          P.l1.rot = w3Q(-100 * o);
          P.prize.visible = o > .04; P.prize.alpha = w3C(o * 2.5, 0, 1);
        },
        act: function (s, tw) { if ((s.o || 0) > .5) tw('o', s.o, 0, 640, 'io'); else tw('o', s.o || 0, 1, 900, 'out'); },
        tags: [
          { at: [-.85, 1.24, 0], text: '1', cls: 'num', show: function (t) { return t > 200; } },
          { at: [0, 1.24, 0], text: '2', cls: 'num', show: function (t) { return t > 200; } },
          { at: [.85, 1.24, 0], text: '3', cls: 'num', show: function (t) { return t > 200; } },
          { at: function (r) { return [r.parts.pick.pos[0], 0, .5]; }, text: 'Your pick', cls: 'live', ay: '40%', show: function (t) { return t > 900; } },
          { at: [-.425, 1.5, 0], text: 'Switch?', cls: 'serif', show: function (t, s) { return t > 2800 && (s.o || 0) < .5; } }
        ] },

      /* frontier: four equal steps up; each needs ten times the compute of the last */
      frontier: { yaw: 36, pitch: 20, frame: { c: 1 }, hint: function (s) { return s.c > .5 ? 'Take the last model back' : 'Add the next model'; },
        build: function (B) {
          var p = [], S = W3S.s, i;
          p.push(B.part('base', { layer: -1, pick: false, mat: 'quiet' }, [B.box(0, -.12, 0, W3S.len + 1.2, .12, W3S.dep[3] + 1.2)]));
          for (i = 0; i < 4; i++) {
            p.push(B.part('s' + i, { pick: false, mat: 'quiet' }, [B.box(W3S.cx[i], 0, 0, W3S.L[i], W3S.top[i], W3S.dep[i])]));
            p.push(B.part('c' + i, { pick: false, pos: [W3S.cx[i], W3S.top[i], 0] }, [B.box(0, 0, 0, S[i], S[i], S[i])]));
          }
          p.push(B.part('ghost', { pick: false, mat: 'ghost', pos: [W3S.cx[3], W3S.top[3], 0] }, [B.box(0, 0, 0, S[3], S[3], S[3])]));
          return p;
        },
        pose: function (r, t, s) {
          var P = r.parts, S = W3S.s, newest = -1, i, c4 = s.c || 0;
          for (i = 0; i < 4; i++) {
            var e = i < 3 ? vEo(vSeg(t, 300 + 1100 * i, 1200 + 1100 * i)) : c4, n = P['c' + i];
            n.visible = e > 0; n.alpha = e; n.pos[1] = W3S.top[i] + (1 - e) * S[i] * .7;
            if (e > .5) newest = i;
          }
          for (i = 0; i < 4; i++) P['c' + i].hl = i === newest ? 1 : 0;
          P.ghost.alpha = 1 - c4; P.ghost.visible = c4 < .99;
        },
        act: function (s, tw) { if ((s.c || 0) > .5) tw('c', s.c, 0, 640, 'io'); else tw('c', s.c || 0, 1, 900, 'out'); },
        tags: [
          { at: function () { return [W3S.cx[0], W3S.top[0] + W3S.s[0] + .3, 0]; }, text: '1x', cls: 'num', show: function (t) { return t > 900; } },
          { at: function () { return [W3S.cx[1], W3S.top[1] + W3S.s[1] + .3, 0]; }, text: '10x', cls: 'num', show: function (t) { return t > 2000; } },
          { at: function () { return [W3S.cx[2], W3S.top[2] + W3S.s[2] + .3, 0]; }, text: '100x', cls: 'num', show: function (t) { return t > 3100; } },
          { at: function () { return [W3S.cx[3], W3S.top[3] + W3S.s[3] + .4, 0]; }, text: '1,000x', cls: 'num', show: function (t, s) { return (s.c || 0) > .6; } },
          { at: function () { return [W3S.x0[1], -.12, W3S.dep[3] / 2 + .6]; }, text: '10x compute, same step', ay: '70%',
            show: function (t) { return t > 3700; } }
        ] },

      /* the email: two towers through the decade; at the crossing, Blockbuster is only an outline */
      email: { yaw: 32, pitch: 24, frame: {}, hint: function () { return 'Rewind the decade'; },
        build: function (B) {
          var p = [B.part('base', { layer: -1, pick: false, mat: 'quiet' }, [B.box(0, -.05, 0, 3.4, .05, 2.2)])], R = [-1.3, .004, .9, 1.3, .004, .9], i;
          for (i = 0; i <= 10; i++) { var x = -1.3 + .26 * i; R.push(x, .004, .9, x, .004, i % 5 ? .96 : 1); }
          p.push(B.part('ruler', { pick: false }, [B.lines(R, { line: 'ink2', w: .75 })]));
          p.push(B.part('mk', { pick: false, pos: [-1.3, .03, .9] }, [B.sphere([0, 0, 0], .035, { face: 'ink', line: 'ink' })]));
          p.push(B.part('letter', { pick: false, pos: [-1.0, 0, .32], rot: [0, -8, 0] }, [B.box(0, 0, 0, .84, .018, .52),
            B.lines([-.42, .019, -.26, 0, .019, .02, 0, .019, .02, .42, .019, -.26], { line: 'ink2', w: .75, n: [0, 1, 0] })]));
          p.push(B.part('bb', { pick: false, pos: [-.25, 0, -.3] }, [], [
            B.part('bbF', { pick: false }, [B.box(0, 0, 0, .6, 1, .6, { edges: false })]),
            B.part('bbL', { pick: false }, [B.box(0, 0, 0, .6, 1, .6, { faces: false })]),
            B.part('bbD', { pick: false, mat: 'ghost', visible: false }, [B.box(0, 0, 0, .6, 1, .6)])]));
          p.push(B.part('nf', { pick: false, pos: [.68, 0, -.3], mat: 'foil' }, [B.box(0, 0, 0, .6, 1, .6)]));
          return p;
        },
        pose: function (r, t, s) {
          var P = r.parts, y = s.rw != null ? s.rw : vE(vSeg(t, 3000, 6000)), g = w3C((y - W3E.yc) / .05, 0, 1);
          P.bb.scl[1] = W3E.bb(y); P.nf.scl[1] = W3E.nf(y);
          P.bbF.alpha = 1 - g; P.bbL.alpha = 1 - g; P.bbL.visible = g < 1; P.bbD.visible = g > 0; P.bbD.alpha = g;
          P.mk.pos[0] = -1.3 + 2.6 * y;
          P.letter.alpha = 1 - .45 * vSeg(t, 2600, 3200);
          s.y = y;
        },
        act: function (s, tw) { var y = s.y || 1; tw('rw', y, 0, 360, 'in'); tw('rw', 0, 1, 740, 'io', 360); },
        tags: [
          { at: [-1.0, .03, .32], text: function (t) { return t > 2100 ? 'Re: $50,000,000 · Passed' : 'Re: $50,000,000'; }, cls: 'num', ay: '-150%', show: function (t) { return t > 150; } },
          { at: function (r) { return [r.parts.mk.pos[0], 0, 1.05]; }, text: function (t, s) { return String(2000 + Math.round(10 * (s.y || 0))); }, cls: 'num', ay: '30%',
            show: function (t, s) { return t > 2900 || s.rw != null; } },
          { at: function (r) { return [.68, r.parts.nf.scl[1] + .12, -.3]; }, text: 'Netflix', cls: 'live', show: function (t, s) { return (s.y || 0) > .95; } },
          { at: function (r) { return [-.25, r.parts.bb.scl[1] + .12, -.3]; }, text: 'Blockbuster', show: function (t, s) { return (s.y || 0) > .95; } }
        ] },

      /* the acquirer: eight years of deals stacked on a slab of debt that thickens every year */
      stack: { yaw: 30, pitch: 26, frame: { e: 1 }, hint: function (s) { return s.e > .5 ? 'Put it back together' : 'Take it apart'; },
        build: function (B) {
          var p = [B.part('base', { layer: -1, pick: false, mat: 'quiet' }, [B.box(0, -.05, 0, 4.4, .05, 1.6)])], y, c;
          for (y = 0; y < 8; y++) {
            var x = -1.68 + y * .48, nseg = Math.min(3, y) + 1, h = W3A.h(y) / nseg;
            p.push(B.part('s' + y, { pick: false, mat: 'quiet', pos: [x, 0, 0] }, [B.box(0, 0, 0, .46, 1, 1.0)]));
            for (c = 0; c < nseg; c++) p.push(B.part('b' + y + '_' + c, { pick: false, pos: [x, 0, 0] }, [B.box(0, 0, 0, .3, h - .022, .34)]));
          }
          return p;
        },
        pose: function (r, t, s) {
          var P = r.parts, newest = -1, y, c, ex = s.e || 0;
          for (y = 0; y < 8; y++) {
            var g = vEo(vSeg(t, 450 * y, 450 * y + 450)), th = W3A.t(y) * g, nseg = Math.min(3, y) + 1, h = W3A.h(y) / nseg;
            var e = vEo(w3C(ex * 1.42 - y * .06, 0, 1));
            P['s' + y].visible = g > 0; P['s' + y].scl[1] = Math.max(.001, th);
            if (g > 0) newest = y;
            for (c = 0; c < nseg; c++) {
              var n = P['b' + y + '_' + c];
              n.visible = g > 0; n.alpha = g; n.pos[1] = th + c * h + (1 - g) * .35 + e * (.14 + .13 * c);
            }
          }
          for (y = 0; y < 8; y++) for (c = 0; c < Math.min(3, y) + 1; c++) P['b' + y + '_' + c].hl = (y === newest && c === Math.min(3, y)) ? 1 : 0;
        },
        act: function (s, tw) { if ((s.e || 0) > .5) tw('e', s.e, 0, 640, 'io'); else tw('e', s.e || 0, 1, 900, 'out'); },
        tags: [
          { at: function () { return [1.68 + .3, W3A.t(7) / 2, .5]; }, text: 'Debt', ax: '0%', ay: '-50%', show: function (t) { return t > 3700; } },
          { at: [-1.68, 0, .62], text: 'Year 1', ay: '30%', show: function (t) { return t > 300; } },
          { at: [1.68, 0, .62], text: 'Year 8', ay: '30%', show: function (t) { return t > 3500; } }
        ] },

      /* two seventy: every contest as a tile, height for its electors, filled in order; the 270th elector's tile turns foil */
      snake: { yaw: 28, pitch: 40, frame: {}, hint: function () { return 'Count it again'; },
        build: function (B) {
          var p = [B.part('base', { layer: -1, pick: false, mat: 'quiet' }, [B.box(0, -.05, 0, 5.0, .05, 2.5)])], na = VSN.a.length, i;
          for (i = 0; i < na + VSN.b.length; i++) {
            var row = Math.floor(i / 11), col = row % 2 ? 10 - i % 11 : i % 11, x = (col - 5) * .42, z = (row - 1.5) * .52, sh = [B.box(0, 0, 0, .34, 1, .34)];
            if (i >= na) sh.push(B.lines([-.17, 1.001, .05, -.05, 1.001, .17, -.17, 1.001, -.07, .07, 1.001, .17, -.07, 1.001, -.17, .17, 1.001, .07], { line: 'ink2', lineA: .7, w: .75, n: [0, 1, 0] }));
            p.push(B.part('t' + i, { pick: false, mat: i < na ? 'paper' : 'bside', pos: [x, 0, z] }, sh));
          }
          return p;
        },
        pose: function (r, t, s) {
          var P = r.parts, n = VSN.a.length + VSN.b.length, k = (s.k != null ? s.k : vE(vSeg(t, 200, 3400))) * n, i;
          for (i = 0; i < n; i++) {
            var g = w3C(k - i, 0, 1), e = vEo(g), v = i < VSN.a.length ? VSN.a[i] : VSN.b[i - VSN.a.length], nd = P['t' + i];
            nd.visible = g > 0; nd.scl[1] = Math.max(.001, v * .045 * e); nd.alpha = .4 + .6 * e;
          }
          var tip = P['t' + VSN.tip];
          tip.hl = k >= VSN.tip + 1 ? 1 + 1.5 * w3C(1 - (k - VSN.tip - 1) / 5, 0, 1) : 0;
          s.kk = k;
        },
        act: function (s, tw) { tw('k', 0, 1, 1000, 'io'); },
        tags: [
          { at: [2.5, -.05, 1.25], text: '538 electors, 270 to win', ax: '-100%', ay: '90%', show: function (t) { return t > 300; } },
          { at: function (r) { var n = r.parts['t' + VSN.tip]; return [n.pos[0], n.scl[1] + .15, n.pos[2]]; }, text: '270', cls: 'num live',
            show: function (t, s) { return (s.kk || 0) >= VSN.tip + 1; } },
          { at: function (r) { var n = r.parts['t' + VSN.tip]; return [n.pos[0], n.scl[1] + .15, n.pos[2]]; }, text: 'Tipping point', cls: 'live', ay: '-260%',
            show: function (t, s) { return (s.kk || 0) >= VSN.tip + 3; } }
        ] }
    };
    /* the staircase: cubes of side 1, 2.15, 4.64 and 10, each ten times the volume of the last, on four equal rises */
    var W3S = (function () {
      var o = { s: [1, 2.154, 4.642, 10], L: [], cx: [], x0: [], top: [], dep: [] }, x = 0, i;
      for (i = 0; i < 4; i++) { o.L[i] = o.s[i] + .7; o.x0[i] = x; o.cx[i] = x + o.L[i] / 2; o.top[i] = 1.2 * (i + 1); o.dep[i] = o.s[i] + .7; x += o.L[i]; }
      o.len = x; for (i = 0; i < 4; i++) { o.cx[i] -= x / 2; o.x0[i] -= x / 2; }
      return o;
    })();
    /* the email's two towers: shapes only, no figures; Blockbuster falls as Netflix rises */
    var W3E = { bb: function (y) { return 2.2 - 1.9 * vE(y); }, nf: function (y) { return .22 + 2.4 * Math.pow(y, 1.6); }, yc: .5 };
    (function () { var lo = 0, hi = 1; for (var n = 0; n < 30; n++) { var m = (lo + hi) / 2; if (W3E.nf(m) < W3E.bb(m)) lo = m; else hi = m; } W3E.yc = lo; })();
    /* the acquirer's slab follows the painter's debt line; the deals follow its bars */
    var W3A = { t: function (y) { return (.08 + .06 * y) * .9; }, h: function (y) { return (.10 + .075 * y) * 1.7; } };

    function w3Tw(key, from, to, dur, ease, delay) {
      var s = W3.st;
      if (!delay) s[key] = from;
      W3.tws.push(window.PS3D.tween({ from: from, to: to, dur: dur, ease: ease, delay: delay || 0,
        update: function (v) { s[key] = v; w3Pose(); }, done: w3Hint }));
    }
    function w3Halt() { W3.tws.forEach(function (c) { try { c(); } catch (e) {} }); W3.tws = []; }
    function w3Pose() { if (!W3.m) return; W3.m.pose(W3.root, W3.t, W3.st); W3.v.invalidate(); }
    function w3Hint() { if (W3.m && W3.tryEl) W3.tryEl.textContent = W3.m.hint(W3.st); }
    function w3Story(k) { return VSTORY[k] || 5000; }
    /* the poster's box in the stage: its viewBox fitted with "meet" into the poster element, which fills the stage */
    function w3PosterBox(sl) {
      var pe = sl && sl.querySelector('.vit-obj > .ps3d-poster'), vb = pe && pe.viewBox && pe.viewBox.baseVal;
      if (!vb || !vb.width || !vb.height) return null;
      return { w: vb.width, h: vb.height };
    }
    /* the projected width and height of points for a yaw and pitch, the same sums frameCalc runs */
    function w3Ext(pts, yaw, pitch) {
      var R = Math.PI / 180, y = yaw * R, p = pitch * R, r = [Math.cos(y), 0, -Math.sin(y)],
        d = [Math.cos(p) * Math.sin(y), Math.sin(p), Math.cos(p) * Math.cos(y)], u = P.v3.cross(d, r),
        x0 = 1e30, x1 = -1e30, y0 = 1e30, y1 = -1e30;
      pts.forEach(function (q) {
        var a = q[0] * r[0] + q[1] * r[1] + q[2] * r[2], e = q[0] * u[0] + q[1] * u[1] + q[2] * u[2];
        if (a < x0) x0 = a; if (a > x1) x1 = a; if (e < y0) y0 = e; if (e > y1) y1 = e;
      });
      return [x1 - x0, y1 - y0];
    }
    function w3Fit() {
      var m = W3.m, v = W3.v, sl = vSlides[VS.cur], k = sl._v, s0 = W3.st, f = {}, n;
      for (n in s0) f[n] = s0[n];
      for (n in m.frame) f[n] = m.frame[n];
      m.pose(W3.root, w3Story(k) + 2000, f);
      v.camera.yaw = m.yaw; v.camera.pitch = m.pitch; v.camera.zoom = 1;
      var pts = v.corners();
      v.frame(pts, 1.1);
      /* registered: size the drawing as the poster prints it inside the stage, so the hand-over never jumps */
      var pb = w3PosterBox(sl), W = v.w, H = v.h;
      if (pb && W && H) {
        var ex = w3Ext(pts, m.yaw, m.pitch), ap = pb.w / pb.h, as = W / H;
        var hp = Math.max(ex[1] / 2, ex[0] / 2 / ap) * 1.1, kk = Math.min(W / pb.w, H / pb.h), hg = hp * H / (pb.h * kk);
        v.camera.radius = hg / (1.12 * Math.max(1, 1 / as));
      }
      var b = v.bounds();
      v.shadow = { c: [(b[0] + b[3]) / 2, b[1], (b[2] + b[5]) / 2], r: Math.max(b[3] - b[0], b[5] - b[2]) * .6 };
      m.pose(W3.root, W3.t, W3.st);
      v.invalidate();
    }
    function w3Tags() {
      var v = W3.v, r = W3.root, m = W3.m; if (!v || !r || !m) return;
      for (var i = 0; i < W3.lab.length; i++) {
        var L = W3.lab[i], d = L.d, on = !!d.show(W3.t, W3.st);
        if (on !== L.on) { L.on = on; L.el.classList.toggle('on', on); }
        if (typeof d.text === 'function') { var tx = d.text(W3.t, W3.st); if (tx !== L.tx) { L.tx = tx; L.el.textContent = tx; if (L.it) L.it.m = false; } }
      }
      if (W3.lay) W3.lay.layout();
      var pl = W3.g.parentNode && W3.g.parentNode.querySelector('.vit-plinth');
      if (pl && v.shadow) {
        var c = v.project(v.shadow.c), ph = pl.offsetHeight || 1;
        pl.style.top = (c[1] - ph * .5).toFixed(1) + 'px'; pl.style.bottom = 'auto';
      }
    }
    function w3Snap(sl) {
      var v = W3.v, c = sl && sl._c; if (!v || !c || !v.R) return;
      try {
        v.render();
        var src = v.canvas;
        c.width = src.width; c.height = src.height; c._x = null;
        var x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height); x.drawImage(src, 0, 0);
        c.classList.add('snap'); clearTimeout(c._snapT);
        c._snapT = setTimeout(function () { c.classList.remove('snap'); }, 950);
      } catch (e) {}
    }
    function w3Show(i) {
      var P = window.PS3D, sl = vSlides[i], k = sl._v, m = W3M[k]; if (!m || !W3.v) return;
      var obj = sl.querySelector('.vit-obj');
      obj.insertBefore(W3.g, obj.querySelector('.vit-seam'));
      void W3.g.offsetWidth;
      if (W3.stop) { W3.stop(); W3.stop = null; }
      w3Halt();
      if (W3.root) W3.v.remove(W3.root);
      if (!m.def) m.def = { id: 'win-' + k, title: sl.getAttribute('data-rail'), camera: 'ortho', surface: 'dark', mats: W3MATS, build: m.build };
      W3.root = W3.roots[k] || (W3.roots[k] = P.build(m.def));
      W3.m = m; W3.st = {}; W3.t = vRM ? w3Story(k) : Math.max(0, performance.now() - VS.t0);
      W3.v.add(W3.root);
      W3.lay.clear(); W3.lab.forEach(function (L) { if (L.el.parentNode) L.el.parentNode.removeChild(L.el); }); W3.lab = [];
      m.tags.forEach(function (d) {
        var el = document.createElement('span'); el.className = 'vit-tag' + (d.cls ? ' ' + d.cls : '');
        if (typeof d.text === 'string') el.textContent = d.text;
        /* the tag's own offset from its anchor, as before; the layer measures it once and only nudges from there */
        el.style.translate = (d.ax || '-50%') + ' ' + (d.ay || '-100%');
        W3.tags.appendChild(el);
        var L = { el: el, d: d, on: false, tx: null };
        L.it = W3.lay.add({ el: el, at: function () { return typeof d.at === 'function' ? d.at(W3.root, W3.st) : d.at; }, show: function () { return L.on; } });
        W3.lab.push(L);
      });
      W3.g.classList.remove('can'); w3Hint();
      w3Fit();
      var story = w3Story(k);
      /* the slide on screen when the view mounts keeps the rest pose its poster prints; the loop moves on from there */
      var first = !W3.v.frames && !W3.shown;
      W3.shown = true;
      if (vRM || W3.t >= story || (first && w3PosterBox(sl))) { W3.t = story; w3Pose(); W3.g.classList.add('can'); return; }
      /* the first frame of the view is the rest pose; the story then rewinds from it in 300ms and plays on the page's clock */
      var rw = W3.v.frames ? 0 : 300, t0 = performance.now(), off = 0, eo = window.PS3D._easeOf('out');
      if (rw) { W3.t = story; w3Pose(); off = Math.max(0, t0 - VS.t0) + rw; }
      W3.stop = W3.v.tick(function () {
        var nw = performance.now(), e = nw - t0;
        if (e < rw) W3.t = story * (1 - eo(e / rw));
        else W3.t = Math.min(story, nw - VS.t0 - off);
        W3.m.pose(W3.root, W3.t, W3.st);
        if (W3.t >= story && W3.stop) { var st = W3.stop; W3.stop = null; st(); W3.g.classList.add('can'); }
      });
    }
    function w3Act() {
      if (!W3.m || !W3.m.act) return;
      vStopAuto(); VS.elapsed = 0; w3Halt();
      W3.g.classList.add('can');
      W3.m.act(W3.st, w3Tw);
      w3Hint();
    }
    function w3Tilt(nx, ny) {
      if (!W3.sy || vRM) return;
      W3.sy.set(w3C(nx, -1, 1) * 12); W3.sp.set(-w3C(ny, -1, 1) * 6);
    }
    function w3Orient(e) {
      if (!VS.onScreen || e.gamma == null || e.beta == null) return;
      var gx = w3C(e.gamma / 30, -1, 1), gy = w3C((e.beta - 45) / 30, -1, 1);
      if (Math.abs(gx * 12 - (W3.gx || 0)) < .4 && Math.abs(gy * 7 - (W3.gy || 0)) < .4) return;
      W3.gx = gx * 12; W3.gy = gy * 7;
      W3.sy.set(W3.gx); W3.sp.set(-W3.gy);
    }
    function w3OrientOn(on) {
      if (on === W3.orient) return;
      W3.orient = on;
      if (on) window.addEventListener('deviceorientation', w3Orient);
      else { window.removeEventListener('deviceorientation', w3Orient); if (W3.sy) { W3.sy.set(0); W3.sp.set(0); } }
    }
    function w3Start() {
      var g = document.createElement('div'), cv = document.createElement('canvas');
      g.className = 'vit-g'; g.setAttribute('aria-hidden', 'true'); g.appendChild(cv);
      W3.tags = document.createElement('div'); W3.tags.className = 'vit-tags'; g.appendChild(W3.tags);
      W3.tryEl = document.createElement('span'); W3.tryEl.className = 'vit-try'; g.appendChild(W3.tryEl);
      W3.g = g;
      var o0 = vSlides[VS.cur].querySelector('.vit-obj'); o0.insertBefore(g, o0.querySelector('.vit-seam'));
      W3.v = P.create(cv, { renderer: 'gl', camera: 'ortho', surface: 'dark', dprMax: 2, reflect: true });
      /* one label layer for the tags: kept off each other and off the drawing's solids, on pills */
      W3.lay = P.labels(W3.v, W3.tags, { pill: true, avoid: function () {
        var out = []; if (W3.root) W3.root.walk(function (n) { if (n.geom && n.geom.solid && n.part !== 'base' && n.id !== 'base') out.push(n); }); return out;
      } });
      W3.rig = P.light(W3.v, { mode: 'pointer' });
      W3.v.on('frame', w3Tags);
      W3.v.on('resize', function () { if (W3.m) w3Fit(); });
      var cam = W3.v.camera;
      W3.sy = P.spring({ k: 60, c: 14, x: 0, target: 0, onUpdate: function (x) { cam.oy = x; W3.v.invalidate(); } });
      W3.sp = P.spring({ k: 60, c: 14, x: 0, target: 0, onUpdate: function (x) { cam.op = x; W3.v.invalidate(); } });
      W3.on = true;
      void g.offsetWidth; /* commit the hidden state, so the drawing fades in over the painter */
      /* the stage turns to the live view only once a frame has been drawn where it can be seen: never an empty stage */
      var lit = function () { if (document.hidden && !P._forced) return; W3.v.off('frame', lit); vit.classList.add('vit-3d'); };
      W3.v.on('frame', lit);
      if (VS.active) w3Show(VS.cur);
      /* phones: tilt turns the drawing. Android needs no prompt; iOS asks only from a tap on Tilt */
      var coarse = false; try { coarse = matchMedia('(pointer: coarse)').matches; } catch (e) {}
      if (coarse && !vRM && 'DeviceOrientationEvent' in window) {
        var tb = document.getElementById('vitTilt');
        var ios = /iP(hone|ad|od)/.test(navigator.platform || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        if (ios && typeof DeviceOrientationEvent.requestPermission === 'function') {
          if (tb) {
            tb.hidden = false;
            tb.addEventListener('click', function () {
              if (W3.orient) { w3OrientOn(false); tb.setAttribute('aria-pressed', 'false'); return; }
              DeviceOrientationEvent.requestPermission().then(function (r) {
                if (r === 'granted') { w3OrientOn(true); tb.setAttribute('aria-pressed', 'true'); }
              }, function () {});
            });
          }
        } else w3OrientOn(true);
      }
    }
    w3Start();
    return { show: w3Show, snap: w3Snap, act: w3Act, tilt: w3Tilt };
  }
  P.model('window', { v: 1, title: 'The Window', desc: 'Six machines from the Lab, drawn in ink, one at a time.', camera: 'ortho', mount: mount });
})();
