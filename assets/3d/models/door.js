/* P.S. 3D model: door. The World gate. Two leaves on outer hinges; set({open: 0..1}) swings them to open * 78 degrees on ease-io.
   PS3D.stage(el, 'door', {surface: 'dark'}).then(function (s) { s.set({open: p}); });  Release early: spring p back to 0 (k90 c12). */
(function () {
  var P = window.PS3D;
  if (!P) return;
  var io = P._easeOf('io');
  P.model('door', {
    v: 1, title: 'The door', desc: 'A double door that opens as far as you hold the button.', units: 'm',
    camera: 'persp', cam: { fov: 20, yaw: 0, pitch: 8 }, surface: 'dark', params: { open: 0 }, mat: 'ink',
    mats: { wash: { kind: 'paper', face: 'accent', line: 'none', faceA: 1 } },
    build: function (B) {
      var leaf = function (side) {
        var s = side < 0 ? 1 : -1;
        return B.part(side < 0 ? 'left' : 'right', { name: side < 0 ? 'Left leaf' : 'Right leaf', pos: [side * .6, .02, 0], pick: false }, [
          B.box(s * .3, 0, 0, .6, 2.04, .04),
          B.lines([s * .3 - .2, 1.2, .021, s * .3 + .2, 1.2, .021, s * .3 - .2, .3, .021, s * .3 + .2, .3, .021], { n: [0, 0, 1], line: 'ink2' })
        ], side > 0 ? [B.part('latch', { pick: false, mat: 'foil' }, [B.box(-.57, .98, 0, .04, .12, .06)])] : null);
      };
      return [
        B.part('frame', { pick: false, layer: -1 }, [
          B.box(-.62, 0, 0, .08, 2.1, .12), B.box(.62, 0, 0, .08, 2.1, .12), B.box(0, 2.1, 0, 1.32, .08, .12), B.box(0, 0, 0, 1.24, .02, .14)
        ]),
        B.part('wash', { pick: false, layer: -2, alpha: 0, fit: false }, [B.poly([[-.6, .021, .07], [.6, .021, .07], [1.2, .021, 2.07], [-1.2, .021, 2.07]], { mat: 'wash', edges: false })]),
        leaf(-1), leaf(1)
      ];
    },
    update: function (root, p) {
      var k = io(Math.max(0, Math.min(1, +p.open || 0))), a = k * 78, n = root.parts;
      n.left.rot = P.q.y(a); n.right.rot = P.q.y(-a);
      n.wash.alpha = .06 * k;
    }
  });
})();
