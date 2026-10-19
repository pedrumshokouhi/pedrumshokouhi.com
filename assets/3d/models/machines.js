/* P.S. 3D models: machines. The World's #machines, four machines that changed what things cost:
   container (a 40-foot box on a chassis under a crane spreader), euv (a schematic light path, not to scale),
   ai-rack (NVIDIA GB200 NVL72), model-t-line (set({t: 0..1}) runs six chassis down eight stations; each part arrives at its station).
   Strings are the approved deck (W3). Nothing here is in Pedrum's voice. */
(function () {
  var P = window.PS3D;
  if (!P) return;
  var B = P.B, M = Math;
  function pt(id, n, name, fig, why, o, shapes, kids) { return B.part(id, P._ext({ n: n, name: name, fig: fig, why: why }, o), shapes, kids); }
  function rect(L, x, y, z, w, d) { var a = x - w / 2, b = x + w / 2, c = z - d / 2, e = z + d / 2; L.push(a, y, c, b, y, c, b, y, c, b, y, e, b, y, e, a, y, e, a, y, e, a, y, c); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  var VIEWS = { front: { yaw: 0, pitch: 4 }, plan: { yaw: 0, pitch: 90 } };
  var ASML = 'https://www.asml.com/en/products/euv-lithography-systems', NV = 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', THF = 'https://www.thehenryford.org';
  function views(iso, more) { return P._ext(P._ext({ iso: iso }, VIEWS), more); }

  /* ---------------- the shipping container ---------------- */
  var CL = 12.19, CW = 2.44, CH = 2.59, Y0 = 1.25, HX = CL / 2, HZ = CW / 2, YT = Y0 + CH, SY = YT + .28;
  P.model('container', {
    v: 1, title: 'The shipping container, 1956', desc: '3D model of a 40-foot shipping container on a truck chassis, under a crane spreader.',
    camera: 'ortho', views: views({ yaw: 36, pitch: 22, zoom: 1.04 }), mat: 'metal',
    build: function () {
      var cor = [], cast = [], tw = [], ch = [], i, x;
      for (i = 1; i < 40; i++) { x = -HX + i * .3; cor.push(x, Y0 + .14, HZ + .004, x, YT - .14, HZ + .004, x, Y0 + .14, -HZ - .004, x, YT - .14, -HZ - .004); }
      var doors = [B.box(HX + .012, Y0 + .05, -HZ / 2, .024, CH - .1, HZ - .04), B.box(HX + .012, Y0 + .05, HZ / 2, .024, CH - .1, HZ - .04)], hl = [];
      [-.95, -.38, .38, .95].forEach(function (z) { doors.push(B.cyl([HX + .05, Y0 + .1, z], .022, CH - .2, { seg: 8 })); hl.push(HX + .05, Y0 + 1.1, z, HX + .14, Y0 + 1.1, z + (z < 0 ? .16 : -.16)); });
      doors.push(B.lines(hl, { line: 'ink' }));
      [-1, 1].forEach(function (sx) { [0, 1].forEach(function (up) { [-1, 1].forEach(function (sz) {
        cast.push(B.part(null, { explode: [sx * .3, up ? .3 : -.3, sz * .3] }, [B.box(sx * (HX - .09), up ? YT - .17 : Y0 - .01, sz * (HZ - .09), .2, .18, .2)]));
        if (up) tw.push(B.cyl([sx * (HX - .09), YT - .12, sz * (HZ - .09)], .045, SY - YT + .12, { seg: 8 }), B.box(sx * (HX - .09), YT - .15, sz * (HZ - .09), .16, .05, .07));
      }); }); });
      var spr = [B.box(0, SY, -HZ + .12, CL - .3, .22, .2), B.box(0, SY, HZ - .12, CL - .3, .22, .2), B.box(-HX + .15, SY, 0, .24, .22, CW - .05),
        B.box(HX - .15, SY, 0, .24, .22, CW - .05), B.box(0, SY + .04, 0, CL - .6, .14, .3), B.box(0, SY + .22, 0, 1.7, .38, 1.5), B.box(0, SY + 3.1, 0, 1, .3, .6),
        B.lines([-.6, SY + .6, -.55, -.32, SY + 3.1, -.2, .6, SY + .6, -.55, .32, SY + 3.1, -.2, -.6, SY + .6, .55, -.32, SY + 3.1, .2, .6, SY + .6, .55, .32, SY + 3.1, .2], { line: 'ink2' })];
      ch.push(B.box(0, .98, -.5, CL - .5, .27, .14), B.box(0, .98, .5, CL - .5, .27, .14));
      for (i = 0; i < 7; i++) ch.push(B.box(-HX + .6 + i * 1.8, 1.03, 0, .12, .16, 1.12));
      [-HX + 1.25, -HX + 2.55].forEach(function (ax) {
        ch.push(B.cyl([ax, .5, -1.18], .07, 2.36, { axis: 'z', seg: 8 }), B.box(ax, .6, -.5, .9, .1, .1), B.box(ax, .6, .5, .9, .1, .1));
        [-1.18, -.9, .64, .92].forEach(function (z) { ch.push(B.cyl([ax, .5, z], .5, .26, { axis: 'z', seg: 18 })); });
      });
      ch.push(B.box(HX - 3.2, .08, -.5, .12, .9, .12), B.box(HX - 3.2, .08, .5, .12, .9, .12), B.box(HX - 3.2, 0, -.5, .3, .08, .3), B.box(HX - 3.2, 0, .5, .3, .08, .3));
      return [
        B.part('ground', { pick: false, layer: -1, mat: 'quiet', fit: false }, [B.box(0, -.04, 0, CL + 1.6, .04, CW + 2.2)]),
        pt('box', 1, 'Steel box', '12.19 × 2.44 × 2.59 m', 'The same outside size on every ship, train and truck.', { anchor: [-HX * .45, YT, 0], explode: [0, 1, 0] }, [B.box(0, Y0, 0, CL, CH, CW)], [
          pt('walls', 2, 'Corrugated walls', 'Corrugated steel', 'Corrugation stiffens thin steel, so the walls stay light and rigid.', { anchor: [-HX * .2, Y0 + CH * .6, HZ] }, [B.lines(cor, { line: 'ink2', lineA: .7 })]),
          pt('doors', 3, 'Doors and locking bars', '4 bars', 'The bars cam into the frame, so a sealed box crosses an ocean unopened.', { anchor: [HX + .05, Y0 + CH * .7, 0], explode: [.6, 0, 0] }, doors),
          pt('castings', 4, 'Corner castings', '8', 'Every lift, lash and stack goes through these eight steel blocks.', { anchor: [HX - .09, YT, HZ - .09] }, [], cast)
        ]),
        pt('spreader', 6, 'Crane spreader', '1 lift', 'The frame drops onto the box, turns four twistlocks and lifts.', { anchor: [0, SY + .6, 0], explode: [0, 2, 0] }, spr, [
          pt('twistlock', 5, 'Twistlocks', '4 pins', 'One standard fitting, so any crane can lift any box.', { mat: 'foil', anchor: [HX - .09, YT + .1, HZ - .09] }, tw)
        ]),
        pt('chassis', 7, 'Truck chassis', '2 axles', 'McLean ran a trucking company, so the box leaves the port on wheels.', { anchor: [-HX + 1.9, 1.1, HZ], explode: [0, -1, 0] }, ch)
      ];
    },
    steps: [
      { title: 'The box', text: 'One size, everywhere.', view: 'iso', explode: 0, select: null },
      { title: 'The fitting', text: 'Four twistlocks, one standard.', view: 'iso', explode: .35, select: 'twistlock' },
      { title: 'The lift', text: 'Crane to ship to truck, unopened.', view: 'iso', explode: 1, select: 'spreader' },
      { title: 'The cost', text: '$5.83 a ton by hand. Under 16 cents by box.', view: 'iso', explode: 0, select: null }
    ]
  });

  /* ---------------- the EUV scanner: a schematic light path ---------------- */
  var PL = [-2.6, 1.2], IF = [-1, 1.2], OPT = [[0, 1.2], [-.35, 2.15], [.35, 2.85], [-.05, 3.55], [1.15, 4.18], [2.25, 3.45], [1.45, 2.95], [2.45, 2.4], [1.55, 1.85], [2.5, 1.3], [1.75, .75]], WF = [2.2, -.02];
  function n2(x, y) { var l = M.sqrt(x * x + y * y) || 1; return [x / l, y / l]; }
  function plate(c, a, b, s) {
    var i0 = n2(c[0] - a[0], c[1] - a[1]), o = n2(b[0] - c[0], b[1] - c[1]), n = n2(o[0] - i0[0], o[1] - i0[1]), u = [-n[1], n[0]], d = .3;
    return B.poly([[c[0] - u[0] * s, c[1] - u[1] * s, -d], [c[0] + u[0] * s, c[1] + u[1] * s, -d], [c[0] + u[0] * s, c[1] + u[1] * s, d], [c[0] - u[0] * s, c[1] - u[1] * s, d]]);
  }
  P.model('euv', {
    v: 1, title: 'The EUV scanner', desc: '3D schematic of the light path inside an EUV lithography machine, from tin droplet to wafer.',
    camera: 'ortho', views: views({ yaw: 24, pitch: 16, zoom: 1.02 }), mat: 'metal',
    mats: { beam: { face: 'none', line: 'ink2', lineA: .55 }, vac: { face: 'none', line: 'ink2', lineA: .42, dash: 3 }, ring: { face: 'none', line: 'ink' } },
    build: function () {
      var ill = [], prj = [], col = [], cone = [], drops = [], vac = [], wl = [], i, k;
      var path = [IF].concat(OPT).concat([WF]);
      for (i = 1; i < path.length - 1; i++) (i <= 4 ? ill : i === 5 ? [] : prj).push(plate(path[i], path[i - 1], path[i + 1], i <= 4 ? .26 : .3));
      for (k = 0; k < 6; k++) {
        var r = .22 + k * .135, x0 = -3.35 + .38 * (r / .9) * (r / .9), ring = [];
        for (i = 0; i < 28; i++) { var a = i / 28 * M.PI * 2; ring.push([x0, 1.2 + r * M.cos(a), r * M.sin(a)]); }
        col.push(B.path(ring, { closed: true, mat: 'ring', w: k ? .75 : 1 }));
      }
      var xr = -3.35 + .38 * M.pow(.895 / .9, 2);
      [[.895, 0], [-.895, 0], [0, .895], [0, -.895]].forEach(function (e) { cone.push(PL[0], PL[1], 0, xr, 1.2 + e[0], e[1], xr, 1.2 + e[0], e[1], IF[0], IF[1], 0); });
      for (i = 0; i < 14; i++) { var yy = 2.32 - i * .15; if (M.abs(yy - 1.2) > .08) drops.push(B.sphere([-2.6, yy, 0], .03)); }
      var X = [-5.6, 3.3], Y = [-.55, 4.55], Z = [-1.15, 1.15];
      for (i = 0; i < 4; i++) {
        var a1 = i & 1, a2 = i >> 1;
        vac.push(X[0], Y[a1], Z[a2], X[1], Y[a1], Z[a2], X[a1], Y[0], Z[a2], X[a1], Y[1], Z[a2], X[a1], Y[a2], Z[0], X[a1], Y[a2], Z[1]);
      }
      for (i = -2; i <= 2; i++) { var c = i * .2, h = M.sqrt(.36 - c * c); wl.push(WF[0] + c, WF[1] + .002, -h, WF[0] + c, WF[1] + .002, h, WF[0] - h, WF[1] + .002, c, WF[0] + h, WF[1] + .002, c); }
      var flat = []; path.forEach(function (p) { flat.push([p[0], p[1], 0]); });
      return [
        B.part('beam', { pick: false, mat: 'beam', fit: false }, [B.path(flat, { w: 1 }), B.lines(cone)]),
        pt('droplets', 1, 'Droplet generator', '50,000 a second', 'Fires molten tin droplets, each about 25 to 30µm across, into the vacuum.', { src: ASML, anchor: [-2.6, 3.1, 0], explode: [0, .5, 0] },
          [B.cyl([-2.6, 2.52, 0], .13, .56, { seg: 14 }), B.cyl([-2.6, 2.4, 0], .04, .12, { seg: 8 }), B.box(-2.6, .02, 0, .32, .2, .32)].concat(drops)),
        pt('laser', 2, 'CO₂ laser', '2 pulses', 'The first pulse flattens each droplet; the second turns it into plasma.', { src: ASML, anchor: [-4.95, 1.2, 0], explode: [-.7, 0, 0] },
          [B.box(-4.95, .95, 0, .9, .5, .56), B.lines([-4.5, 1.2, 0, PL[0], PL[1], 0], { line: 'ink', w: 1 }), B.lines([-4.5, 1.12, .06, PL[0], PL[1], .02], { line: 'ink2', w: .75 })]),
        pt('plasma', 3, 'Plasma point', '13.5nm', 'The plasma gives off the extreme ultraviolet light that prints the chip.', { src: ASML, mat: 'foil', anchor: [PL[0], PL[1], 0] }, [B.sphere([PL[0], PL[1], 0], .085)]),
        pt('collector', 4, 'Collector mirror', 'Mirror, not lens', 'Glass absorbs EUV light, so every optic in the machine is a mirror.', { anchor: [xr, 2.1, 0], explode: [-.5, 0, 0] }, col),
        pt('focus', 5, 'Intermediate focus', '1 point', 'Where the light source hands its beam to the scanner.', { anchor: [IF[0], 1.5, 0] },
          [B.path([[IF[0], .9, -.3], [IF[0], 1.5, -.3], [IF[0], 1.5, .3], [IF[0], .9, .3]], { closed: true, line: 'ink' }), B.sphere([IF[0], IF[1], 0], .04)]),
        pt('illuminator', 6, 'Illuminator', 'Mirrors', 'Spreads the light evenly across the mask.', { anchor: [-.35, 2.15, .3], explode: [-.3, 0, .5] }, ill),
        pt('reticle', 7, 'Reticle stage', 'The mask', 'Holds the chip design; the light reflects off it carrying the pattern.', { anchor: [1.15, 4.42, 0], explode: [0, .6, 0] },
          [B.box(1.15, 4.24, 0, 1.5, .22, 1.1), B.box(1.15, 4.19, 0, .8, .05, .6)]),
        pt('projection', 8, 'Projection optics', '4x reduction', 'Shrinks the reflected pattern onto the wafer.', { anchor: [2.85, 2.4, 0], explode: [.6, 0, 0] },
          prj.concat([B.box(2, .45, 0, 1.7, 3.3, 1.05, { mat: 'ghost' })])),
        pt('wafer', 9, 'Wafer stage', '300mm wafer', 'Moves the silicon under the light, one field after another.', { anchor: [2.2, 0, .6], explode: [0, -.5, 0] },
          [B.box(2.2, -.34, 0, 1.9, .26, 1.6), B.cyl([2.2, -.08, 0], .6, .06, { seg: 36 }), B.lines(wl, { line: 'ink2', lineA: .7 })]),
        pt('vacuum', 10, 'Vacuum chamber', 'Vacuum throughout', 'Air absorbs EUV light, so the whole path runs in a vacuum.', { mat: 'vac', anchor: [-5.6, 4.55, 1.15], explode: [0, 1.2, 0] }, [B.lines(vac)])
      ];
    },
    flows: [{ id: 'light', points: 44, speed: .12, color: 'accent', path: [[PL[0], PL[1], 0], [-3.35 + .38 * M.pow(.895 / .9, 2), 2.095, 0], [IF[0], IF[1], 0]].concat(OPT.map(function (p) { return [p[0], p[1], 0]; })).concat([[WF[0], WF[1], 0]]) }],
    steps: [
      { title: 'Make the light', view: 'iso', explode: 0, select: null, flows: ['light'] },
      { title: 'Gather it', view: 'iso', explode: 0, select: 'collector', flows: ['light'] },
      { title: 'Shape it', view: 'iso', explode: 0, select: 'illuminator', flows: ['light'] },
      { title: 'Print the pattern', view: 'iso', explode: 0, select: 'wafer', flows: ['light'] }
    ]
  });

  /* ---------------- NVIDIA GB200 NVL72 ---------------- */
  var RACK = 'pppccccccccsssssssssccccccccccppp', FEAT = 25;
  P.model('ai-rack', {
    v: 1, title: 'NVIDIA GB200 NVL72, 2024', desc: '3D model of an NVIDIA GB200 NVL72 rack: 18 compute trays, 9 switch trays and a coolant manifold.',
    camera: 'ortho', views: views({ yaw: 34, pitch: 16, zoom: 1.04 }, { back: { yaw: 214, pitch: 14 } }), mat: 'metal',
    mats: { sw: { kind: 'metal', face: 'card', line: 'accent', w: 1.25 } },
    build: function () {
      var trays = [], sw = [], pw = [], cool = [], stub = [], i;
      function top(L, y, x0) { rect(L, x0, y, .42, .12, .12); rect(L, x0, y, .26, .12, .12); rect(L, x0, y, .12, .09, .09); }
      for (i = 0; i < RACK.length; i++) {
        var k = RACK[i], y = .08 + i * .064, h = .052;
        if (k === 'p') { pw.push(B.box(0, y, -.02, .56, h, 1.12)); continue; }
        if (k === 's') { sw.push(B.box(0, y, 0, .56, h, 1.1)); continue; }
        var L = [], fe = i === FEAT, sh = [B.box(0, y, 0, .56, h, 1.1), B.lines([-.24, y + .015, .552, -.16, y + .015, .552, .12, y + .02, .552, .24, y + .02, .552], { line: 'ink2' })];
        if (!fe) { top(L, y + h + .002, -.135); top(L, y + h + .002, .135); sh.push(B.lines(L, { line: 'ink2', lineA: .8 })); }
        var kids = null;
        if (fe) {
          var G = [], C = [], yt = y + h + .002;
          [-.135, .135].forEach(function (x0) { rect(G, x0, yt, .42, .12, .12); rect(G, x0, yt, .26, .12, .12); rect(C, x0, yt, .12, .09, .09); });
          kids = [pt('gpus', 3, 'Blackwell GPUs', '72', 'Together they hold 13.4 TB of HBM3E memory.', { src: NV, anchor: [.135, yt, .42] }, [B.lines(G, { line: 'ink', w: 1 })]),
            pt('cpus', 4, 'Grace CPUs', '36', 'One CPU for every two GPUs, feeding them data.', { anchor: [-.135, yt, .12] }, [B.lines(C, { line: 'ink', w: 1 })])];
        }
        trays.push(B.part(null, { pos: [0, 0, fe ? .5 : 0], explode: [0, 0, .6] }, sh, kids));
        stub.push(-.12, y + .026, -.69, -.12, y + .026, -.55, .12, y + .026, -.69, .12, y + .026, -.55);
      }
      cool.push(B.cyl([-.12, .1, -.69], .028, 2.06, { seg: 8 }), B.cyl([.12, .1, -.69], .028, 2.06, { seg: 8 }), B.cyl([-.12, 2.16, -.69], .028, .24, { axis: 'x', seg: 8 }), B.lines(stub, { line: 'ink' }));
      var cab = [B.box(0, 2.2, 0, .64, .04, 1.24), B.box(0, 0, 0, .64, .06, 1.24)];
      [[-.3, -.6], [.3, -.6], [-.3, .6], [.3, .6]].forEach(function (c) { cab.push(B.box(c[0], .06, c[1], .035, 2.14, .035)); });
      return [
        pt('cabinet', 1, 'Rack', '1 machine', 'NVIDIA designed the whole rack as one computer.', { anchor: [0, 2.24, -.3] }, cab),
        pt('trays', 2, 'Compute trays', '18', 'Each tray holds 2 boards, each with 1 Grace CPU and 2 Blackwell GPUs.', { anchor: [.28, 1.5, .55] }, [], trays),
        pt('switches', 5, 'NVLink switch trays', '9', 'Connect every GPU to every other: 130 TB/s in total, about 1.8 TB/s per GPU.', { src: NV, mat: 'sw', anchor: [.28, 1, .55] }, sw),
        pt('power', 6, 'Power shelves', 'About 120 kW', 'Many data centers cannot feed that to one rack, so NVIDIA also sells a two-rack version.', { src: NV, anchor: [.28, 2.1, .56], explode: [0, 0, .25] }, pw),
        pt('coolant', 7, 'Coolant manifold', 'Liquid-cooled', 'At this density air cannot carry the heat away, so coolant runs to every tray.', { anchor: [.12, 1.6, -.69], explode: [0, 0, -.4] }, cool)
      ];
    },
    flows: [{ id: 'coolant', points: 30, speed: .2, color: 'accent', paths: [[[-.12, .12, -.72], [-.12, 2.18, -.72], [.12, 2.18, -.72], [.12, .12, -.72]]] }],
    steps: [
      { title: 'The rack', view: 'iso', explode: 0, select: null, flows: [] },
      { title: 'One tray', view: 'iso', explode: 0, select: 'gpus', flows: [] },
      { title: 'The switch fabric', view: 'iso', explode: 0, select: 'switches', flows: [] },
      { title: 'The heat', view: 'back', explode: 0, select: 'coolant', flows: ['coolant'] }
    ]
  });

  /* ---------------- Ford's moving assembly line ---------------- */
  var XS = [], NC = 6, SN = ['Frame', 'Axles', 'Engine', 'Radiator', 'Body drop', 'Wheels', 'Fuel', 'Test'];
  for (var s = 0; s < 8; s++) XS.push(-13.125 + s * 3.75);
  /* where each part comes from, and the station it is fitted at: axles, engine, radiator, body, wheels, fuel */
  var DROP = [[0, 0, -1.6], [0, 1.5, 0], [0, 1, 0], [0, 1.8, 0], [0, .6, 0], [0, 0, 1.3]], SUB = 'aerbwf';
  function car(k) {
    var w = [];
    [-1, 1].forEach(function (x) { w.push(B.cyl([x, .36, .66], .36, .08, { axis: 'z', seg: 16 }), B.cyl([x, .36, -.74], .36, .08, { axis: 'z', seg: 16 })); });
    return B.part('car' + k, { mat: 'paper' }, [B.box(0, .44, -.3, 2.7, .07, .06), B.box(0, .44, .3, 2.7, .07, .06), B.box(1.3, .44, 0, .07, .07, .66), B.box(-1.3, .44, 0, .07, .07, .66), B.box(.15, .44, 0, .07, .07, .66)], [
      B.part('car' + k + 'a', {}, [B.cyl([1, .36, -.74], .03, 1.48, { axis: 'z', seg: 6 }), B.cyl([-1, .36, -.74], .03, 1.48, { axis: 'z', seg: 6 })]),
      B.part('car' + k + 'e', {}, [B.box(.82, .51, 0, .5, .4, .42)]),
      B.part('car' + k + 'r', {}, [B.box(1.2, .51, 0, .08, .58, .5)]),
      B.part('car' + k + 'b', {}, [B.box(-.38, .51, 0, 1.4, .44, .98), B.box(.45, .51, 0, .26, .52, .94), B.lines([.4, 1.03, -.42, .4, 1.46, -.42, .4, 1.46, -.42, .4, 1.46, .42, .4, 1.46, .42, .4, 1.03, .42], { line: 'ink' })]),
      B.part('car' + k + 'w', {}, w),
      B.part('car' + k + 'f', {}, [B.cyl([-.95, .62, .52], .1, .5, { axis: 'x', seg: 10 })])
    ]);
  }
  function station(i) {
    var x = XS[i], sh = [B.box(x, 0, -1.55, .08, 1.9, .08), B.box(x, 1.72, -1.55, .7, .3, .03)];
    if (i === 0) for (var j = 0; j < 3; j++) sh.push(B.box(x, j * .09, -.98, 2.2, .06, .62));
    if (i === 1) sh.push(B.cyl([x - .35, .12, -1.38], .05, .9, { axis: 'z', seg: 8 }), B.cyl([x + .35, .12, -1.38], .05, .9, { axis: 'z', seg: 8 }), B.box(x, 0, -.95, 1.2, .07, .7));
    if (i === 2) sh.push(B.box(x + .5, 0, 1.75, .1, 2.6, .1), B.box(x + .5, 0, -1.75, .1, 2.6, .1), B.box(x + .5, 2.6, 0, .12, .12, 3.6), B.box(x, 2.56, 0, 1.1, .08, .08), B.lines([x, 2.56, 0, x, 2.06, 0], { line: 'ink' }), B.box(x, 1.98, 0, .14, .07, .14));
    if (i === 3) sh.push(B.box(x - .3, 0, -1.05, .5, .62, .08), B.box(x + .3, 0, -1.05, .5, .62, .08));
    if (i === 4) sh.push(B.box(x, 2.32, -.25, 2.3, .08, 2.1), B.box(x - 1.1, 0, -1.25, .1, 2.32, .1), B.box(x + 1.1, 0, -1.25, .1, 2.32, .1), B.box(x - 1.1, 0, .75, .1, 2.32, .1), B.box(x + 1.1, 0, .75, .1, 2.32, .1));
    if (i === 5) for (var q = 0; q < 4; q++) sh.push(B.cyl([x, q * .09, -1.1], .33, .08, { seg: 16 }));
    if (i === 6) sh.push(B.cyl([x - .4, .62, -1.1], .25, .8, { axis: 'x', seg: 14 }), B.box(x - .3, 0, -1.1, .08, .62, .08), B.box(x + .3, 0, -1.1, .08, .62, .08));
    if (i === 7) sh.push(B.cyl([x - .6, -.04, -.7], .13, 1.4, { axis: 'z', seg: 12 }), B.cyl([x + .6, -.04, -.7], .13, 1.4, { axis: 'z', seg: 12 }));
    return sh;
  }
  var STW = ['The bare frame enters the line.', 'Front and rear axles go on while the frame keeps moving.', 'The engine drops in from above.', 'Cooling goes in ahead of the body.',
    'The body is lowered onto the chassis.', 'Four wheels, the same four every time.', 'Fuel goes in, so the car can drive off the line.', 'The finished car is started and driven off.'];
  P.model('model-t-line', {
    v: 1, title: 'Ford’s moving assembly line, 1913', desc: '3D model of a moving assembly line with eight stations and six chassis.',
    camera: 'ortho', views: views({ yaw: 26, pitch: 28, zoom: .9 }), params: { t: .37 },
    labels: XS.map(function (x, i) { return { at: [x, 0, 2.15], text: '0' + (i + 1) + ' ' + SN[i] }; }),
    build: function () {
      var ticks = [], i;
      for (i = 0; i < 59; i++) { var x = -15 + i * .5; ticks.push(x, .02, -.42, x, .02, .42); }
      var parts = [B.part('floor', { pick: false, layer: -1, mat: 'quiet', fit: false }, [B.box(0, -.05, 0, 31.5, .05, 4.6)])];
      for (i = 0; i < 8; i++) parts.push(pt('s' + (i + 1), i + 1, SN[i], 'Station ' + (i + 1), STW[i], { anchor: [XS[i], 2.02, -1.55], explode: [0, 0, -1.1] }, station(i)));
      var cars = [B.part('chain', { mat: 'quiet' }, [B.lines(ticks, { line: 'ink2', lineA: .7 })])];
      for (i = 0; i < NC; i++) cars.push(car(i));
      parts.push(pt('line', 9, 'Moving line', '93 minutes', 'The work moves to the worker, so each worker repeats one task.', { src: THF, mat: 'foil', anchor: [0, .02, .42] },
        [B.lines([-15, .02, -.42, 15, .02, -.42, -15, .02, .42, 15, .02, .42], { w: 1.25 })], cars));
      return parts;
    },
    update: function (root, p) {
      var n = root.parts, t = ((+p.t || 0) % 1 + 1) % 1, k, j;
      if (n.chain) n.chain.pos = [(t * 30) % .5, 0, 0];
      for (k = 0; k < NC; k++) {
        var c = n['car' + k], x = -15 + ((t + k / NC) % 1) * 30;
        if (!c) continue;
        c.pos = [x, 0, 0];
        c.alpha = clamp(M.min((x + 15) / 1.4, (15 - x) / 1.4), 0, 1);
        for (j = 0; j < 6; j++) {
          var m = n['car' + k + SUB[j]], u = clamp((x - XS[j + 1] + 1.4) / 1.4, 0, 1), d = DROP[j], e = 1 - (1 - u) * (1 - u) * (1 - u);
          m.visible = u > 0; m.alpha = u;
          m.pos = [d[0] * (1 - e), d[1] * (1 - e), d[2] * (1 - e)];
        }
      }
    },
    steps: [
      { title: 'Before', text: '12.5 hours', view: 'iso', explode: 0, select: null },
      { title: 'The line moves', view: 'iso', explode: 0, select: 'line' },
      { title: 'After', text: '93 minutes', view: 'iso', explode: 0, select: 'line' },
      { title: 'The price', text: '$850 to $260', view: 'iso', explode: 0, select: 's8' }
    ]
  });
})();
