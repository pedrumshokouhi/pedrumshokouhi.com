/* P.S. 3D explorer.js v2: the isometric explorer (PS3D.explorer), plus PS3D.orbit, PS3D.timeline, PS3D.stage and the prism and
   cylinder shapes. Progressive enhancement over figure.iso: without JS the figure is its caption, its parts list and its poster.
   Drag to turn, pinch or Ctrl+scroll to zoom, hover or tap a part to inspect it, E or "Take it apart" to explode, double-tap resets.
   Keyboard on the focused stage: arrows turn (Shift x3), +/- zoom, E explode, 0/Home reset, 1-9 select, N/P next/prev, Esc clear.

   PS3D.explorer(fig, modelId, opts) -> Explorer   (the model must be registered: PS3D.mount loads it for you)
     opts: {renderer, surface, hidden, params, step, list:false, controls:false, steps:false, pins:false, card:false, frame:false,
            caption: el|selector (writes the part's cap, or "fig · name"), captionIdle, explodeLabel, lineA, margin, fill (.78), tilt,
            pitchRange:[8,88], zoomRange:[.6,2.6], flows:false, flowFor:9000, light: 'static', idle: true, labels: {column, avoid}}
     model fields read here: labels [{part, at, text, align}], labelMode {column: 'right', avoid}, shadow:false, fill, margin
     figure attributes: data-iso-h (stage px), data-iso-renderer="2d", data-iso-surface="dark", data-iso-hidden
   Explorer { select(id|null, announce), explode(0..1|bool|undefined = toggle), view(name) (no name: returns the View), step(i),
     set(params) (model update; part figures refresh in [data-part=id] .v), calc(params), reset(), showFlows(ids|null), say(bits),
     destroy(), rest(bool) (the poster pose), on('select'|'explode'|'step'|'set', fn), vw: View, root, parts:{id:Node}, list:[Node], orbit, stage, sel, si }
   PS3D.orbit(view, el, {pitch, zoom, yaw, k:[.35,.25], inertia, tilt, onTap, onHover, onDouble, onStart, onEnd, onLeave, onChange})
     -> {go({yaw, pitch, zoom}, 'snap'|'spring'|'tween', ms), reset(ms), rotate(dYaw, dPitch), zoomBy(f), deactivate(),
         requestTilt() (call from a tap on a "Tilt" control: iOS asks permission there), needsTiltPermission, destroy(), home}
   PS3D.timeline({update(p)}) -> {to(obj, props, {dur, ease, at}), play(), reverse(), seek(ms), on('done', fn), kill(), duration()} */
(function () {
  'use strict';
  var P = window.PS3D;
  if (!P || P.explorer) return;
  var W = window, D = document, M = Math, ext = P._ext, clamp = P._clamp, now = P._now, TOUCH = P._touch, warn = P._warn, easeOf = P._easeOf;
  var raf = W.requestAnimationFrame ? function (f) { return W.requestAnimationFrame(f); } : function (f) { return setTimeout(f, 16); };
  function each(a, f) { for (var i = 0; a && i < a.length; i++) f(a[i], i); }

  /* ---------------- orbit: drag, pinch, wheel, double tap, tilt ---------------- */
  P.orbit = function (view, el, o) {
    o = o || {};
    var cam = view.camera, home = { yaw: cam.yaw, pitch: cam.pitch, zoom: cam.zoom };
    var pr = o.pitch || [8, 88], zr = o.zoom || [.6, 2.6], yr = o.yaw || null, K = o.k || [.35, .25];
    var pts = {}, np = 0, st = null, pin = null, inert = null, lastTap = 0, lastXY = [0, 0], tw = null, idle = 0, dead = false, hovQ = null;
    function lim() {
      cam.pitch = clamp(cam.pitch, pr[0], pr[1]); cam.zoom = clamp(cam.zoom, zr[0], zr[1]);
      if (yr) cam.yaw = clamp(cam.yaw, yr[0], yr[1]);
    }
    /* a soft stop: past a limit the drag gives a third as much and the camera springs back on release */
    function soft(x, a, b) { return x < a ? a - M.min(12, (a - x) * .35) : x > b ? b + M.min(12, (x - b) * .35) : x; }
    function softLim() {
      cam.pitch = soft(cam.pitch, pr[0], pr[1]); cam.zoom = clamp(cam.zoom, zr[0], zr[1]);
      if (yr) cam.yaw = soft(cam.yaw, yr[0], yr[1]);
    }
    function settle() {
      var tp = clamp(cam.pitch, pr[0], pr[1]), ty = yr ? clamp(cam.yaw, yr[0], yr[1]) : cam.yaw;
      if (tp !== cam.pitch || ty !== cam.yaw) go({ pitch: tp, yaw: ty }, 'spring');
    }
    function apply() { lim(); view.invalidate(); if (o.onChange) o.onChange(); }
    function sp(x, eps, f) { return P.spring({ k: 60, c: 14, eps: eps, x: x, onUpdate: f }); }
    var S = {
      yaw: sp(cam.yaw, .01, function (x) { cam.yaw = x; apply(); }),
      pitch: sp(cam.pitch, .01, function (x) { cam.pitch = x; apply(); }),
      zoom: sp(cam.zoom, .001, function (x) { cam.zoom = x; apply(); })
    };
    function stopAll() { if (tw) { tw(); tw = null; } inert = null; S.yaw.stop(); S.pitch.stop(); S.zoom.stop(); S.yaw.x = cam.yaw; S.pitch.x = cam.pitch; S.zoom.x = cam.zoom; }
    function go(t, mode, dur) {
      t = ext({ yaw: cam.yaw, pitch: cam.pitch, zoom: cam.zoom }, t);
      t.pitch = clamp(t.pitch, pr[0], pr[1]); t.zoom = clamp(t.zoom, zr[0], zr[1]);
      if (mode === 'tween') {
        stopAll();
        var dy = ((t.yaw - cam.yaw) % 360 + 540) % 360 - 180;
        tw = P.tween({ from: [cam.yaw, cam.pitch, cam.zoom], to: [cam.yaw + dy, t.pitch, t.zoom], dur: dur || 900, ease: 'io',
          update: function (a) { cam.yaw = a[0]; cam.pitch = a[1]; cam.zoom = a[2]; apply(); }, done: function () { tw = null; S.yaw.x = cam.yaw; S.pitch.x = cam.pitch; S.zoom.x = cam.zoom; } });
      } else if (mode === 'spring') {
        if (tw) { tw(); tw = null; }
        inert = null; S.yaw.x = cam.yaw; S.pitch.x = cam.pitch; S.zoom.x = cam.zoom;
        S.yaw.set(t.yaw); S.pitch.set(t.pitch); S.zoom.set(t.zoom);
      } else { stopAll(); cam.yaw = t.yaw; cam.pitch = t.pitch; cam.zoom = t.zoom; apply(); }
    }
    function xy(e) { var r = el.getBoundingClientRect(), cr = view.canvas.getBoundingClientRect(); return [e.clientX - cr.left, e.clientY - cr.top]; }
    function active(on) {
      clearTimeout(idle);
      if (on) el.classList.add('is-active'); else el.classList.remove('is-active');
    }
    function down(e) {
      if (dead || (e.button != null && e.button > 0)) return;
      pts[e.pointerId] = [e.clientX, e.clientY]; np = Object.keys(pts).length;
      if (np === 1) {
        stopAll();
        st = { x: e.clientX, y: e.clientY, t: now(), yaw: cam.yaw, pitch: cam.pitch, lock: e.pointerType === 'touch' ? 0 : 'm', moved: false, id: e.pointerId, touch: e.pointerType === 'touch', vy: 0, vp: 0, lt: now(), ly: cam.yaw, lp: cam.pitch };
        if (!st.touch) { try { el.setPointerCapture(e.pointerId); } catch (x) {} }
        active(true);
        if (o.onStart) o.onStart(e);
      } else if (np === 2) {
        var k = Object.keys(pts), a = pts[k[0]], b = pts[k[1]];
        pin = { d: M.max(10, M.hypot(a[0] - b[0], a[1] - b[1])), my: (a[1] + b[1]) / 2, z: cam.zoom, p: cam.pitch };
        if (st) st.moved = true;
      }
    }
    function move(e) {
      if (dead) return;
      if (!pts[e.pointerId]) {
        if (e.pointerType !== 'touch' && o.onHover && !e.buttons) {
          lastXY = xy(e);
          if (!hovQ) hovQ = raf(function () { hovQ = null; if (!dead) o.onHover(lastXY[0], lastXY[1], e); });
        }
        return;
      }
      pts[e.pointerId] = [e.clientX, e.clientY];
      if (np >= 2 && pin) {
        var k = Object.keys(pts), a = pts[k[0]], b = pts[k[1]], d = M.hypot(a[0] - b[0], a[1] - b[1]);
        cam.zoom = pin.z * d / pin.d; cam.pitch = pin.p - ((a[1] + b[1]) / 2 - pin.my) * K[1];
        S.zoom.x = cam.zoom; S.pitch.x = cam.pitch; apply(); return;
      }
      if (!st || e.pointerId !== st.id) return;
      var dx = e.clientX - st.x, dy = e.clientY - st.y;
      if (!st.lock) {
        if (M.abs(dx) < 8 && M.abs(dy) < 8) return;
        st.lock = M.abs(dx) >= M.abs(dy) ? 'h' : 'v';
        if (st.lock === 'h') { try { el.setPointerCapture(e.pointerId); } catch (x) {} }
      }
      if (st.lock === 'v') return;
      if (!st.moved && M.abs(dx) + M.abs(dy) > 3) st.moved = true;
      if (!st.moved) return;
      if (e.cancelable && st.touch) e.preventDefault();
      cam.yaw = st.yaw + dx * K[0];
      if (st.lock === 'm') cam.pitch = st.pitch - dy * K[1];
      cam.zoom = clamp(cam.zoom, zr[0], zr[1]);
      softLim();
      var t = now(), dt = M.max(1, t - st.lt) / 1000;
      st.vy = st.vy * .6 + (cam.yaw - st.ly) / dt * .4; st.vp = st.vp * .6 + (cam.pitch - st.lp) / dt * .4; st.lt = t; st.ly = cam.yaw; st.lp = cam.pitch;
      S.yaw.x = cam.yaw; S.pitch.x = cam.pitch;
      view.invalidate(); if (o.onChange) o.onChange();
      if (o.onDrag) o.onDrag();
    }
    function up(e) {
      if (!pts[e.pointerId]) return;
      delete pts[e.pointerId]; np = Object.keys(pts).length;
      if (np < 2) pin = null;
      if (np > 0 || !st) return;
      var s = st; st = null;
      var cancelled = e.type === 'pointercancel';
      if (!s.moved && !cancelled && now() - s.t < 400) {
        var p = xy(e), t = now();
        if (t - lastTap < 320 && M.hypot(p[0] - lastXY[0], p[1] - lastXY[1]) < 24 && o.dbl !== false) { lastTap = 0; if (o.onDouble) o.onDouble(); else go(home, 'tween', 900); }
        else { lastTap = t; lastXY = p; if (o.onTap) o.onTap(p[0], p[1], e); }
      } else if (s.moved && !P.reduced() && o.inertia !== false && now() - s.lt < 80 && (M.abs(s.vy) > 20 || M.abs(s.vp) > 20)) {
        /* inertia: the turn carries on and loses 8% a frame; a limit stops it softly */
        var iv = { y: s.vy, p: s.lock === 'm' ? s.vp : 0 }; inert = iv;
        P._anim({ step: function (dt) {
          if (inert !== iv || dead) return false;
          cam.yaw += iv.y * dt; cam.pitch += iv.p * dt; var k = M.pow(.92, dt * 60); iv.y *= k; iv.p *= k;
          if (cam.pitch < pr[0] || cam.pitch > pr[1]) iv.p *= .5;
          if (yr && (cam.yaw < yr[0] || cam.yaw > yr[1])) iv.y *= .5;
          softLim(); S.yaw.x = cam.yaw; S.pitch.x = cam.pitch; view.invalidate(); if (o.onChange) o.onChange();
          var go2 = M.abs(iv.y) + M.abs(iv.p) > .5;
          if (!go2) settle();
          return go2;
        } });
      } else if (s.moved) settle();
      if (o.onEnd) o.onEnd(s);
    }
    function wheel(e) {
      if (!(e.ctrlKey || e.metaKey || el.classList.contains('is-active'))) return;
      e.preventDefault();
      stopAll(); cam.zoom *= M.exp(-e.deltaY * (e.deltaMode ? .05 : .0015)); S.zoom.x = cam.zoom; apply();
    }
    function leave() { clearTimeout(idle); idle = setTimeout(function () { active(false); }, 1500); if (o.onLeave) o.onLeave(); }
    function tmove(e) { if (e.touches && e.touches.length > 1 && e.cancelable) e.preventDefault(); }
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('wheel', wheel, { passive: false });
    el.addEventListener('touchmove', tmove, { passive: false });
    /* tilt: Android without a prompt, iOS only from a tap on the caller's "Tilt" control (requestTilt) */
    var tilt = { y: 0, p: 0, on: false, run: false };
    function ori(e) {
      if (e.gamma == null || P.reduced()) return;
      tilt.y = clamp(e.gamma, -45, 45) / 45 * 12; tilt.p = clamp((e.beta || 45) - 45, -45, 45) / 45 * 7;
      if (tilt.run) return;
      tilt.run = true;
      P._anim({ step: function () {
        if (dead) return (tilt.run = false);
        var ay = (tilt.y - cam.oy) * .08, ap = (tilt.p - cam.op) * .08;
        cam.oy += ay; cam.op += ap; view.invalidate();
        if (M.abs(ay) + M.abs(ap) < .002) { tilt.run = false; return false; }
        return true;
      } });
    }
    function tiltOn() { if (!tilt.on) { tilt.on = true; W.addEventListener('deviceorientation', ori); } }
    var DOE = W.DeviceOrientationEvent;
    if (o.tilt && TOUCH && DOE && typeof DOE.requestPermission !== 'function') tiltOn();
    var api = {
      go: go, home: home,
      reset: function (dur) { go(home, 'tween', dur || 900); },
      rotate: function (dy, dp) { go({ yaw: (S.yaw.on ? S.yaw.target : cam.yaw) + (dy || 0), pitch: (S.pitch.on ? S.pitch.target : cam.pitch) + (dp || 0) }, 'spring'); },
      zoomBy: function (f) { go({ zoom: (S.zoom.on ? S.zoom.target : cam.zoom) * f }, 'spring'); },
      deactivate: function () { active(false); },
      needsTiltPermission: !!(o.tilt && DOE && typeof DOE.requestPermission === 'function'),
      requestTilt: function () {
        if (!DOE || typeof DOE.requestPermission !== 'function') { tiltOn(); return Promise.resolve(true); }
        return DOE.requestPermission().then(function (s) { if (s === 'granted') tiltOn(); return s === 'granted'; }, function () { return false; });
      },
      destroy: function () {
        dead = true; stopAll();
        el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up); el.removeEventListener('pointerleave', leave); el.removeEventListener('wheel', wheel);
        el.removeEventListener('touchmove', tmove); W.removeEventListener('deviceorientation', ori);
      }
    };
    return api;
  };



  P.timeline = function (opts) {
    opts = opts || {};
    var tr = [], T = 0, t = 0, dir = 1, ev = {}, tok = 0;
    function cur(obj, k) { var x = obj[k]; return typeof x === 'object' ? Array.prototype.slice.call(x) : x; }
    function lerp(a, b, k) {
      if (typeof a !== 'object') return a + (b - a) * k;
      var r = []; for (var i = 0; i < a.length; i++) r[i] = a[i] + (b[i] - a[i]) * k; return r;
    }
    function apply() {
      for (var i = 0; i < tr.length; i++) {
        var r = tr[i], k = r.dur ? clamp((t - r.at) / r.dur, 0, 1) : (t >= r.at ? 1 : 0);
        if (t < r.at && !r.first) continue;
        for (var p in r.to) r.obj[p] = lerp(r.from[p], r.to[p], r.e(k));
      }
      if (opts.update) opts.update(T ? t / T : 1);
    }
    function fire(n) { each(ev[n], function (f) { try { f(); } catch (e) { warn('timeline', e); } }); }
    function run() {
      var me = ++tok;
      if (P.reduced()) { t = dir > 0 ? T : 0; apply(); fire('done'); return; }
      P._anim({ step: function (dt) {
        if (me !== tok) return false;
        t = clamp(t + dt * 1000 * dir, 0, T); apply();
        if ((dir > 0 && t >= T) || (dir < 0 && t <= 0)) { fire('done'); return false; }
        return true;
      } });
    }
    var tl = {
      to: function (obj, props, o) {
        o = o || {};
        var at = o.at == null ? T : o.at, from = {}, first = true;
        for (var k = tr.length - 1; k >= 0; k--) if (tr[k].obj === obj) first = false;
        for (var p in props) {
          var prev = null;
          for (var j = tr.length - 1; j >= 0 && prev == null; j--) if (tr[j].obj === obj && p in tr[j].to) prev = tr[j].to[p];
          from[p] = prev != null ? prev : cur(obj, p);
        }
        tr.push({ obj: obj, to: props, from: from, at: at, dur: o.dur == null ? 560 : o.dur, e: easeOf(o.ease), first: first });
        T = M.max(T, at + (o.dur == null ? 560 : o.dur));
        return tl;
      },
      play: function () { dir = 1; run(); return tl; },
      reverse: function () { dir = -1; run(); return tl; },
      seek: function (ms) { tok++; t = clamp(ms, 0, T); apply(); return tl; },
      on: function (n, f) { (ev[n] = ev[n] || []).push(f); return tl; },
      kill: function () { tok++; return tl; },
      duration: function () { return T; }
    };
    return tl;
  };



  /* ---------------- prism and cylinder shapes (core dispatches to these) ---------------- */
  /* ear clipping for prism caps (x,z pairs), returns index triples */
  function earcut(pts) {
    var n = pts.length, idx = [], out = [], area = 0, i;
    for (i = 0; i < n; i++) { idx.push(i); var j = (i + 1) % n; area += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1]; }
    var s = area > 0 ? 1 : -1, guard = 0;
    function cr(a, b, c) { return ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) * s; }
    function inside(p, a, b, c) { return cr(a, b, p) >= 0 && cr(b, c, p) >= 0 && cr(c, a, p) >= 0; }
    while (idx.length > 3 && guard++ < 4 * n) {
      for (i = 0; i < idx.length; i++) {
        var i0 = idx[(i + idx.length - 1) % idx.length], i1 = idx[i], i2 = idx[(i + 1) % idx.length], a = pts[i0], b = pts[i1], c = pts[i2];
        if (cr(a, b, c) <= 0) continue;
        var ok = true;
        for (var k = 0; k < idx.length && ok; k++) { var t = idx[k]; if (t !== i0 && t !== i1 && t !== i2 && inside(pts[t], a, b, c)) ok = false; }
        if (ok) { out.push(i0, i1, i2); idx.splice(i, 1); break; }
      }
    }
    if (idx.length === 3) out.push(idx[0], idx[1], idx[2]);
    return { t: out, s: s };
  }
  function shapePrism(pr, s) {
    var pts = pr.pts, y0 = pr.y0 || 0, y1 = pr.y1 == null ? 1 : pr.y1, n = pts.length, ec = earcut(pts), ps = [], top = [], bot = [], sm = s.smooth ? P._sm() : 0;
    for (var i = 0; i < n; i++) { top.push(pts[i][0], y1, pts[i][1]); bot.push(pts[i][0], y0, pts[i][1]); }
    if (s.caps !== false) { ps.push({ p: top, n: [0, 1, 0], t: ec.t }); ps.push({ p: bot, n: [0, -1, 0], t: ec.t }); }
    for (i = 0; i < n; i++) {
      var a = pts[i], b = pts[(i + 1) % n], dx = b[0] - a[0], dz = b[1] - a[1], nn = P.v3.norm([dz * ec.s, 0, -dx * ec.s]);
      ps.push({ p: [a[0], y0, a[1], b[0], y0, b[1], b[0], y1, b[1], a[0], y1, a[1]], n: nn, sm: sm });
    }
    return ps;
  }
  function shapeCyl(c, s) {
    var seg = c.seg || s.seg || 24, r = c.r, h = c.h, ax = c.axis || s.axis || 'y', o = c.c || [0, 0, 0], sm = P._sm(), ps = [], top = [], bot = [];
    function P3(u, a, v) { return ax === 'x' ? [o[0] + a, o[1] + u, o[2] + v] : ax === 'z' ? [o[0] + u, o[1] + v, o[2] + a] : [o[0] + u, o[1] + a, o[2] + v]; }
    function N3(u, a, v) { return ax === 'x' ? [a, u, v] : ax === 'z' ? [u, v, a] : [u, a, v]; }
    var ring = [];
    for (var i = 0; i < seg; i++) { var t = i / seg * M.PI * 2; ring.push([M.cos(t), M.sin(t)]); }
    for (i = 0; i < seg; i++) {
      var A = ring[i], B = ring[(i + 1) % seg], mid = M.PI * 2 * (i + .5) / seg;
      ps.push({ p: [].concat(P3(A[0] * r, 0, A[1] * r), P3(B[0] * r, 0, B[1] * r), P3(B[0] * r, h, B[1] * r), P3(A[0] * r, h, A[1] * r)), n: N3(M.cos(mid), 0, M.sin(mid)), sm: sm });
      top = top.concat(P3(A[0] * r, h, A[1] * r)); bot = bot.concat(P3(ring[seg - 1 - i][0] * r, 0, ring[seg - 1 - i][1] * r));
    }
    if (s.caps !== false) { ps.push({ p: top, n: N3(0, 1, 0) }); ps.push({ p: bot, n: N3(0, -1, 0) }); }
    return ps;
  }
  P._shapes.prism = shapePrism; P._shapes.cyl = shapeCyl;

  /* ---------------- stage: a non-interactive model view with poster handoff (door, Window) ---------------- */
  P.stage = function (host, id, o) {
    o = o || {};
    return P.load(o.renderer === '2d' || P.support() === '2d' ? ['c2d'] : ['gl']).then(function () { return P.need(id); }).then(function (def) {
      var cv = P._canvas(host), v = P.create(cv, { renderer: o.renderer || def.renderer, camera: def.camera, surface: o.surface || def.surface, dprMax: o.dprMax,
        shadow: def.shadow === false || o.shadow === false ? false : null, reflect: !!(o.reflect || def.reflect) });
      var root = P.build(def, o.params);
      v.add(root);
      if (def.update) def.update(root, root.params, { view: v, reduced: true, init: true });
      v.fit(o.pad || 1);
      if (def.cam) v.camera.set(def.cam);
      if (o.cam) v.camera.set(o.cam);
      var mg = o.margin || def.margin || 1 / (o.fill || def.fill || .78);
      if (o.frame !== false) { v.frame(v.corners(), mg); v.on('resize', function () { v.frame(v.corners(), mg); }); }
      if (o.light || o.idle || def.idle) P.light(v, { mode: o.light || 'static', idle: o.idle != null ? o.idle : def.idle });
      P._handoff(v, host);
      var st = {
        view: v, root: root, nodes: root.parts, params: root.params,
        set: function (p) { ext(root.params, p); if (def.update) def.update(root, root.params, { view: v, reduced: P.reduced() }); v.invalidate(); return st; },
        rest: function () {},
        destroy: function () { v.destroy(); if (v.canvas.parentNode) v.canvas.parentNode.removeChild(v.canvas); }
      };
      v.invalidate();
      return st;
    });
  };


  /* ---------------- the isometric explorer ---------------- */
  function mk(tag, cls, parent, text) {
    var e = D.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  var SVGNS = 'http://www.w3.org/2000/svg';
  var FINE = !!(W.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);

  function Explorer(fig, id, o) {
    var def = P.getModel(id);
    if (!def) throw new Error('PS3D.explorer: model ' + id + ' is not loaded');
    o = ext(ext({}, def.explorer), o || {});
    var X = this, red = P.reduced;
    X.fig = fig; X.def = def; X.id = id; X.o = o; X._ev = {}; X.sel = null; X.hov = null; X.ex = 0; X.si = -1; X._live = [];
    var stage = fig.querySelector('.iso-stage');
    if (!stage) {
      stage = mk('div', 'iso-stage'); stage.tabIndex = 0;
      stage.setAttribute('role', 'group'); stage.setAttribute('aria-roledescription', '3D model'); stage.setAttribute('aria-label', def.title || id);
      fig.insertBefore(stage, fig.firstChild);
    }
    X.stage = stage;
    var h = +(fig.getAttribute('data-iso-h') || o.height || 0);
    if (h) stage.style.setProperty('--iso-h', h + 'px');
    fig.classList.add('is-3d');
    var cv = P._canvas(stage, 'iso-canvas');
    var view = X.vw = P.create(cv, {
      renderer: o.renderer || fig.getAttribute('data-iso-renderer') || def.renderer || 'auto', camera: def.camera || 'ortho',
      surface: o.surface || fig.getAttribute('data-iso-surface') || def.surface || 'paper',
      hidden: o.hidden != null ? o.hidden : (fig.hasAttribute('data-iso-hidden') || !!def.hidden), dprMax: o.dprMax,
      shadow: def.shadow === false || o.shadow === false ? false : null, reflect: !!(o.reflect || def.reflect)
    });
    if (o.lineA != null) view.lineA = o.lineA;
    X.leaders = D.createElementNS(SVGNS, 'svg'); X.leaders.setAttribute('class', 'iso-leaders'); X.leaders.setAttribute('aria-hidden', 'true'); stage.appendChild(X.leaders);
    X.lead = D.createElementNS(SVGNS, 'line'); X.leaders.appendChild(X.lead);
    X.pinsEl = mk('div', 'iso-pins', stage); X.pinsEl.setAttribute('aria-hidden', 'true');
    var lm = ext(ext({}, def.labelMode), o.labels);
    X.labs = P.labels(view, X.pinsEl, { column: lm.column, avoid: lm.avoid === true ? true : lm.avoid ? function () { return lm.avoid.map(function (id) { return X.parts[id]; }); } : null, colPad: lm.colPad });
    /* the pins stay on their anchors; the labels keep clear of them */
    X.labs.extra = function () {
      var out = X._pinRects || (X._pinRects = []), k = 0;
      each(X._pinEls || [], function (p) { if (p.el.style.display === 'none' || p.x == null) return; var r = out[k] || (out[k] = [0, 0, 0, 0]); r[0] = p.x - 9; r[1] = p.y - 9; r[2] = 18; r[3] = 18; k++; });
      out.length = k; return out;
    };
    X.card = mk('div', 'iso-card', stage); X.card.setAttribute('aria-hidden', 'true');
    X.cardT = mk('span', 'tag plain', X.card); X.cardF = mk('b', 'iso-fig', X.card); X.cardW = mk('p', 'iso-why', X.card);
    X._build(o.params);
    /* camera: model view, fitted to the union of the rest and exploded poses so taking it apart never leaves the frame */
    var b0 = view.bounds(), b1 = b0, p0 = view.corners(), p1 = [];
    if (X._xn.length) { each(X._xn, function (n) { n._e = 1; X._pose(n); }); b1 = view.bounds(); p1 = view.corners(); each(X._xn, function (n) { n._e = 0; X._pose(n); }); }
    var bb = [M.min(b0[0], b1[0]), M.min(b0[1], b1[1]), M.min(b0[2], b1[2]), M.max(b0[3], b1[3]), M.max(b0[4], b1[4]), M.max(b0[5], b1[5])];
    view.fit(o.pad || def.pad || 1, bb);
    X.home = ext(ext(view.camera.kind === 'ortho' ? { yaw: 45, pitch: 35.264, zoom: 1 } : {}, def.cam), (def.views && def.views.iso) || null);
    view.camera.set(X.home);
    X._fp = p0.concat(p1);
    X._frame();
    if (o.target || def.target) view.camera.target = (o.target || def.target).slice();
    view.on('resize', function () { X._frame(); each(X._labEls || [], function (l) { l.w = 0; }); });
    if (def.shadow !== false && o.shadow !== false) view.shadow = { c: [(b0[0] + b0[3]) / 2, b0[1], (b0[2] + b0[5]) / 2], r: M.max(b0[3] - b0[0], b0[5] - b0[2]) * .62 };
    if (o.light || o.idle || def.idle) P.light(view, { mode: o.light || 'static', idle: o.idle != null ? o.idle : def.idle });
    X.orbit = P.orbit(view, stage, {
      pitch: o.pitchRange || def.pitchRange, zoom: o.zoomRange || def.zoomRange, tilt: o.tilt,
      onTap: function (x, y) { X._tap(x, y); },
      onHover: function (x, y) { X._hover(x, y); },
      onLeave: function () { if (X.hov != null) { X.hov = null; X._apply(); } stage.style.cursor = ''; },
      onDouble: function () { X.orbit.reset(); }
    });
    X.orbit.home = X.home;
    /* caption side: parts list, controls, steps, live region */
    X._gen = [];
    var cap = fig.querySelector('figcaption');
    if (!cap) { cap = mk('figcaption', '', fig); X._gen.push(cap); }
    X.cap = cap;
    X.live = fig.querySelector('.iso-live');
    if (!X.live) { X.live = mk('p', 'iso-live vh', cap); X.live.setAttribute('aria-live', 'polite'); X._gen.push(X.live); }
    if (!fig.querySelector('.iso-parts') && o.list !== false && X.list.length) {
      var ol = mk('ol', 'iso-parts');
      each(X.list, function (n) {
        var li = mk('li', '', ol), b = mk('button', '', li);
        b.type = 'button'; b.setAttribute('data-part', n.id); b.setAttribute('aria-pressed', 'false');
        mk('span', 'n', b, n.n != null ? String(n.n) : ''); b.appendChild(D.createTextNode(' ' + (n.name || n.id) + ' ')); mk('span', 'v', b, n.fig || '');
      });
      cap.insertBefore(ol, X.live); X._gen.push(ol);
    }
    if (!fig.querySelector('.iso-ctl') && o.controls !== false) {
      var ctl = mk('div', 'iso-ctl');
      if (X._xn.length) { var eb = mk('button', 'ps-cap', ctl, o.explodeLabel || 'Take it apart'); eb.type = 'button'; eb.setAttribute('data-act', 'explode'); eb.setAttribute('aria-pressed', 'false'); }
      var rb = mk('button', 'ps-cap', ctl, 'Reset view'); rb.type = 'button'; rb.setAttribute('data-act', 'reset');
      cap.insertBefore(ctl, X.live); X._gen.push(ctl);
    }
    if (def.steps && def.steps.length && o.steps !== false) {
      var sw = fig.querySelector('.iso-steps');
      if (!sw) {
        sw = mk('div', 'iso-steps');
        mk('p', 'iso-step-k', sw); mk('p', 'iso-step-t', sw); mk('p', 'iso-step-x', sw);
        var nav = mk('div', 'iso-step-nav', sw), pb = mk('button', 'ps-cap', nav, 'Previous'), nb = mk('button', 'ps-cap', nav, 'Next');
        pb.type = nb.type = 'button'; pb.setAttribute('data-act', 'prev'); nb.setAttribute('data-act', 'next');
        cap.insertBefore(sw, X.live); X._gen.push(sw);
      }
      X.stepsEl = sw;
    }
    if (!stage.querySelector('.iso-keys')) X._gen.push(mk('p', 'iso-keys', stage, 'Drag to turn. Pinch or Ctrl+scroll to zoom.' + (X._xn.length ? ' E to take it apart.' : '')));
    X.capEl = typeof o.caption === 'string' ? D.querySelector(o.caption) : o.caption || null;
    X._vc = null;
    X._bind();
    view.on('frame', function () { X._overlay(); });
    P._handoff(view, stage);
    if (def.steps && def.steps.length && o.steps !== false) X.step(o.step || 0, true);
    view.invalidate();
  }
  Explorer.prototype = {
    on: function (t, f) { (this._ev[t] = this._ev[t] || []).push(f); return this; },
    emit: function (t, a) { var l = this._ev[t]; if (l) for (var i = 0; i < l.length; i++) { try { l[i](a, this); } catch (e) { warn('explorer ' + t, e); } } },
    view: function (name) {
      if (name == null) return this.vw;
      var v = (this.def.views && this.def.views[name]) || (name === 'iso' ? this.home : null);
      if (v) this.orbit.go(v, 'tween', 900);
      return this.vw;
    },
    _frame: function () {
      var X = this, c = X.vw.camera;
      if (!X._fp || X.o.frame === false || X.def.frame === false) return;
      X.vw.frame(X._fp, X.o.margin || X.def.margin || 1 / (X.o.fill || X.def.fill || .78), X.home.yaw, X.home.pitch);
    },
    _ctx: function (init) { return { view: this.vw, explorer: this, reduced: P.reduced(), init: !!init, tween: P.tween, spring: P.spring }; },
    _build: function (params) {
      var X = this, def = X.def, view = X.vw;
      if (X.root) { view.remove(X.root); each(X.flows || [], function (f) { if (f.stop) f.stop(); }); }
      X.root = P.build(def, params);
      view.add(X.root);
      X.parts = X.root.parts; X.list = X.root.list; X._xn = []; X._vc = null;
      X.root.walk(function (n) { n._base = n.pos.slice(); n._e = 0; n._l = 0; if (n.explode) X._xn.push(n); });
      X._xn.sort(function (a, b) { var i = X.list.indexOf(a), j = X.list.indexOf(b); return (i < 0 ? 999 : i) - (j < 0 ? 999 : j); });
      X._flows();
      if (def.update) X._figs(def.update(X.root, X.root.params, X._ctx(true)));
      X._pins();
      X._labels();
      X._applied = undefined;
      if (X.sel && !X.parts[X.sel]) X.sel = null;
      X._apply(true);
    },
    _pose: function (n) {
      var b = n._base, e = n._e || 0, x = n.explode || [0, 0, 0], l = (n._l || 0) * (n.lift || 0);
      n.pos = [b[0] + x[0] * e, b[1] + x[1] * e + l, b[2] + x[2] * e];
      this.vw.invalidate();
    },
    /* ---- explode / reassemble ---- */
    explode: function (val) {
      var X = this, t = val == null ? (X.ex > .5 ? 0 : 1) : val === true ? 1 : val === false ? 0 : clamp(+val, 0, 1), up = t > X.ex;
      X.ex = t;
      each(X._xn, function (n, i) {
        if (n._xc) n._xc();
        if (n._xs) n._xs.stop();
        if (P.reduced()) { n._e = t; X._pose(n); return; }
        var d = (up ? i : X._xn.length - 1 - i) * 40;
        if (up) n._xc = P.tween({ dur: 0, delay: d, done: function () { n._xs = P.spring({ k: 140, c: 22, x: n._e, target: t, eps: .0005, onUpdate: function (x) { n._e = x; X._pose(n); } }); } });
        else n._xc = P.tween({ from: n._e, to: t, dur: 640, ease: 'io', delay: d, update: function (x) { n._e = x; X._pose(n); } });
      });
      each(X.fig.querySelectorAll('[data-act="explode"]'), function (b) { b.setAttribute('aria-pressed', t > .5 ? 'true' : 'false'); });
      /* hidden lines show only while the drawing is apart */
      X.vw.xray = t > .02; X.vw.invalidate();
      X.emit('explode', t);
      return X;
    },
    /* ---- selection: hover previews, click pins ---- */
    _resolve: function (id) {
      var n = id != null ? this.parts[id] : null;
      while (n && this.list.indexOf(n) < 0 && !n.href) n = n.parent && n.parent !== this.root ? n.parent : null;
      return n;
    },
    select: function (id, announce) {
      var X = this, n = id != null ? X._resolve(id) : null;
      X.sel = n ? n.id : null; X.hov = null;
      X._apply();
      if (n && announce !== false) X.say([n.name, n.fig, n.why]);
      X.emit('select', X.sel);
      return X;
    },
    say: function (bits) {
      var s = []; each(bits, function (b) { if (b) s.push(String(b).replace(/[.\s]+$/, '')); });
      var L = this.live; if (!L) return;
      L.textContent = ''; setTimeout(function () { L.textContent = s.join('. ') + (s.length ? '.' : ''); }, 30);
    },
    _apply: function (force) {
      var X = this, id = X.hov != null ? X.hov : X.sel, n = id != null ? X.parts[id] : null, red = P.reduced();
      if (id === X._applied && !force) return;
      var prev = X._applied != null ? X.parts[X._applied] : null;
      X._applied = id;
      var ch = [];
      (function rec(m, inh) {
        var t = 1;
        if (!inh && n && m !== n && !m.has(n)) t = .32;
        if (m.dim !== t) ch.push([m, m.dim, t, 'dim']);
        var stop = inh || t < 1 || m === n;
        for (var i = 0; i < m.children.length; i++) rec(m.children[i], stop);
      })(X.root, false);
      if (prev && prev !== n) { ch.push([prev, prev.hl, 0, 'hl']); if (prev.lift) ch.push([prev, prev._l, 0, '_l']); }
      if (n) { ch.push([n, n.hl, 1, 'hl']); if (n.lift) ch.push([n, n._l || 0, 1, '_l']); }
      if (X._dt) X._dt();
      var lifted = [];
      each(ch, function (c) { if (c[3] === '_l') lifted.push(c[0]); });
      X._dt = P.tween({ dur: red ? 0 : 200, ease: 'out', update: function (k) {
        each(ch, function (c) { c[0][c[3]] = k >= 1 ? c[2] : c[1] + (c[2] - c[1]) * k; });
        each(lifted, function (m) { X._pose(m); });
        X.vw.invalidate();
      } });
      each(X.fig.querySelectorAll('[data-part]'), function (b) {
        var on = b.getAttribute('data-part') === id;
        b.classList.toggle('is-on', on);
        if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on && id === X.sel ? 'true' : 'false');
      });
      each(X._pinEls || [], function (p) { p.el.classList.toggle('is-on', p.n === n); });
      if (X.capEl) X.capEl.textContent = n ? (n.cap || [n.fig, n.name].filter(Boolean).join(' · ')) : (X.o.captionIdle || '');
      X._card(n);
    },
    _card: function (n) {
      var X = this, c = X.card;
      if (!n || X.o.card === false || (!n.why && !n.fig)) { c.classList.remove('on'); X.lead.style.opacity = 0; X._cn = null; return; }
      X._cn = n;
      X.cardT.textContent = n.name || n.id; X.cardF.textContent = n.fig || ''; X.cardW.textContent = n.why || '';
      X.cardF.style.display = n.fig ? '' : 'none';
      c.classList.add('on');
      X._overlay();
    },
    _anchor: function (n) {
      if (n.anchor) return P.m4.tp(n.wm, n.anchor);
      if (!n._la) {
        var b = this.vw.bounds(n), inv = P.m4.inv(n.wm);
        n._la = inv ? P.m4.tp(inv, [(b[0] + b[3]) / 2, b[4], (b[2] + b[5]) / 2]) : [0, 0, 0];
      }
      return P.m4.tp(n.wm, n._la);
    },
    _overlay: function () {
      var X = this, v = X.vw, W2 = v.w, H2 = v.h, n = X._cn;
      if (n) {
        var a = v.project(X._anchor(n)), c = X.card, sheet = W2 < 600;
        c.classList.toggle('is-sheet', sheet);
        c.classList.toggle('is-top', sheet && a[1] > H2 * .5);
        if (sheet) { c.style.left = c.style.top = ''; X.lead.style.opacity = 0; }
        else {
          var cw = c.offsetWidth || 240, chh = c.offsetHeight || 100, left = a[0] < W2 / 2;
          if (left && a[0] < cw + 40) left = false; else if (!left && a[0] > W2 - cw - 40) left = true;
          var x = left ? 16 : W2 - cw - 16, y = clamp(a[1] - chh / 2, 12, M.max(12, H2 - chh - 12));
          c.style.left = x + 'px'; c.style.top = y + 'px';
          var ex = left ? x + cw : x, ey = clamp(a[1], y + 10, y + chh - 10);
          X.lead.setAttribute('x1', a[0].toFixed(1)); X.lead.setAttribute('y1', a[1].toFixed(1)); X.lead.setAttribute('x2', ex); X.lead.setAttribute('y2', ey.toFixed(1));
          X.lead.setAttribute('class', X.sel === n.id ? 'is-sel' : '');
          X.lead.style.opacity = 1;
        }
      }
      var pins = X._pinEls || [], t = P._now(), occ = t - (X._ot || 0) > 180;
      if (occ) X._ot = t;
      for (var i = 0; i < pins.length; i++) {
        var p = pins[i], q = v.project(X._anchor(p.n)), off = !p.n._ev || q[0] < 0 || q[1] < 0 || q[0] > W2 || q[1] > H2;
        p.el.style.transform = 'translate(' + q[0].toFixed(1) + 'px,' + q[1].toFixed(1) + 'px)'; p.x = q[0]; p.y = q[1];
        p.el.style.display = off ? 'none' : '';
        if (occ && !off) { var hit = v.pick(q[0], q[1]); p.el.classList.toggle('is-occ', !!(hit && !p.n.has(hit.node) && hit.t < (q[2] + 1) / 2 - 1e-4)); }
      }
      /* labels ride their anchors through the shared layer: kept apart, kept in frame, and on a leader when moved */
      var labs = X._labEls || [];
      for (var j = 0; j < labs.length; j++) { var lb = labs[j]; if (lb.w === 0 && lb.it) { lb.it.m = false; lb.w = -1; } if (lb.n) lb.el.style.display = lb.n._ev ? '' : 'none'; }
      X.labs.layout();
      if (v._lit) X.stage.classList.toggle('is-dark', !!v._lit.dark);
    },
    _pins: function () {
      var X = this;
      X.pinsEl.textContent = ''; X._pinEls = [];
      /* emptying the layer takes the label layer's leader sheet with it: put it back first */
      if (X.labs && X.labs.svg) X.pinsEl.insertBefore(X.labs.svg, X.pinsEl.firstChild);
      if (X.o.pins === false || X.def.pins === false) return;
      each(X.list, function (n) {
        if (n.n == null) return;
        var e = mk('span', 'iso-pin', X.pinsEl, String(n.n));
        e.addEventListener('click', function () { X.select(n.id); });
        X._pinEls.push({ el: e, n: n });
      });
    },
    _labels: function () {
      var X = this;
      each(X._labEls || [], function (l) { if (l.el.parentNode) l.el.parentNode.removeChild(l.el); });
      X._labEls = []; X.labs.clear();
      each(X.def.labels || [], function (l) {
        /* the record keeps the v1 shape ({el, at, al, w, n}): pages move l.at and toggle l.el classes */
        var rec = { el: mk('span', 'iso-label' + (l.align ? ' is-' + l.align : ''), X.pinsEl, l.text), at: l.at, al: l.align || '', w: 0, n: l.part ? X.parts[l.part] || null : null };
        rec.it = X.labs.add({ el: rec.el, at: function () { return rec.at; }, n: rec.n });
        X._labEls.push(rec);
      });
    },
    _figs: function (r) {
      var X = this;
      if (!r || !r.figs) return;
      var ch = false, vc = X._vc || (X._vc = {});
      for (var id in r.figs) {
        var n = X.parts[id], f = r.figs[id];
        if (n && n.fig === f) continue;
        if (n) n.fig = f;
        ch = true;
        each(vc[id] || (vc[id] = X.fig.querySelectorAll('[data-part="' + id + '"] .v')), function (e) { e.textContent = f; });
      }
      if (ch && X._cn) X._card(X._cn);
    },
    set: function (p) {
      var X = this, def = X.def;
      ext(X.root.params, p);
      if (def.update) X._figs(def.update(X.root, X.root.params, X._ctx()));
      else if (def.build) X._build(X.root.params);
      X.vw.invalidate();
      X.emit('set', X.root.params);
      return X;
    },
    calc: function (p) { return this.def.calc ? this.def.calc(ext(ext({}, this.root.params), p)) : null; },
    reset: function () { this.orbit.reset(); this.explode(false); this.select(null, false); return this; },
    /* the poster pose: assembled, nothing selected, the home camera; rest(false) puts back what was there */
    rest: function (on) {
      var X = this, c = X.vw.camera;
      if (on) {
        X._rs = { ex: X.ex, sel: X.sel, yaw: c.yaw, pitch: c.pitch, zoom: c.zoom, oy: c.oy, op: c.op, ly: c.ly };
        each(X._xn, function (n) { if (n._xs) n._xs.stop(); if (n._xc) n._xc(); n._e = 0; X._pose(n); });
        X.sel = null; X.hov = null; X._apply(true);
        c.yaw = X.home.yaw; c.pitch = X.home.pitch; c.zoom = X.home.zoom || 1; c.oy = c.op = c.ly = 0;
        X.root.walk(function (n) { n.hl = 0; n.dim = 1; });
      } else if (X._rs) {
        var r = X._rs; X._rs = null;
        c.yaw = r.yaw; c.pitch = r.pitch; c.zoom = r.zoom; c.oy = r.oy; c.op = r.op; c.ly = r.ly;
        each(X._xn, function (n) { n._e = r.ex; X._pose(n); });
        X.sel = r.sel; X._apply(true);
      }
      X.vw.invalidate();
      return X;
    },
    step: function (i, quiet) {
      var X = this, S = X.def.steps;
      if (!S || !S.length) return X;
      i = clamp(i | 0, 0, S.length - 1);
      var s = S[i]; X.si = i;
      if (s.view) X.view(s.view);
      if (s.explode != null) X.explode(s.explode);
      if (s.params) X.set(s.params);
      if (s.flows !== undefined) X.showFlows(s.flows);
      if (s.select !== undefined) X.select(s.select, false);
      var e = X.stepsEl;
      if (e) {
        var k = e.querySelector('.iso-step-k'), t = e.querySelector('.iso-step-t'), x = e.querySelector('.iso-step-x');
        if (k) k.textContent = 'Step ' + (i + 1) + ' of ' + S.length;
        if (t) t.textContent = s.title || '';
        if (x) x.textContent = s.text || '';
        if (!P.reduced()) { e.classList.remove('is-in'); void e.offsetWidth; e.classList.add('is-in'); }
        each(e.querySelectorAll('[data-act="prev"]'), function (b) { b.disabled = i === 0; });
        each(e.querySelectorAll('[data-act="next"]'), function (b) { b.disabled = i === S.length - 1; });
      }
      if (!quiet) X.say(['Step ' + (i + 1) + ' of ' + S.length, s.title, s.text]);
      X.emit('step', i);
      return X;
    },
    /* ---- flows: points that travel along polylines while the view is visible ---- */
    _flows: function () {
      var X = this, view = X.vw;
      X.flows = [];
      each(X.def.flows || [], function (f) {
        var paths = f.paths || [f.path], N = f.points || 40, lens = [];
        each(paths, function (pt) { var L = [0]; for (var i = 1; i < pt.length; i++) L.push(L[i - 1] + P.v3.len(P.v3.sub(pt[i], pt[i - 1]))); lens.push(L); });
        var g = P.geom([]), S = g.S, ci = P.CI[f.color || 'accent'];
        for (var i = 0; i < N; i++) S.push(0, 0, 0, -(f.size || 4), ci == null ? 3 : ci, -1, f.alpha || 1);
        var node = new P.Node({ id: 'flow-' + f.id }); node.geom = g; node.nopick = true; node.flowId = f.id;
        X.root.add(node);
        var fl = { f: f, node: node, ph: 0, N: N, paths: paths, lens: lens };
        X._flowAt(fl);
        X.flows.push(fl);
      });
      X._flowTick();
    },
    _flowAt: function (fl) {
      var S = fl.node.geom.S, np = fl.paths.length;
      for (var i = 0; i < fl.N; i++) {
        var pi = i % np, pt = fl.paths[pi], L = fl.lens[pi], tot = L[L.length - 1] || 1, u = ((M.floor(i / np) / M.ceil(fl.N / np)) + fl.ph) % 1, d = u * tot, k = 1;
        while (k < L.length - 1 && L[k] < d) k++;
        var a = pt[k - 1], b = pt[k] || a, seg = (L[k] - L[k - 1]) || 1, t = clamp((d - L[k - 1]) / seg, 0, 1);
        S[i * 7] = a[0] + (b[0] - a[0]) * t; S[i * 7 + 1] = a[1] + (b[1] - a[1]) * t; S[i * 7 + 2] = a[2] + (b[2] - a[2]) * t;
      }
      fl.node.touch();
    },
    _flowTick: function () {
      var X = this, on = false;
      each(X.flows, function (fl) { if (fl.node.visible) on = true; });
      if (X._ft) { X._ft(); X._ft = null; }
      if (!on || P.reduced() || X.o.flows === false) return;
      /* flows run for a while after a step or a touch, then rest where they are: no idle loop */
      var left = X.o.flowFor || X.def.flowFor || 9000;
      X._ft = X.vw.tick(function (dt) {
        each(X.flows, function (fl) { if (!fl.node.visible) return; fl.ph = (fl.ph + dt * (fl.f.speed || .25)) % 1; X._flowAt(fl); });
        left -= dt * 1000;
        if (left <= 0 && X._ft) { X._ft(); X._ft = null; }
      });
    },
    showFlows: function (ids) {
      var X = this;
      each(X.flows, function (fl) { fl.node.visible = ids == null || ids === true || (ids && ids.indexOf(fl.f.id) >= 0); });
      X._flowTick(); X.vw.invalidate();
      return X;
    },
    /* ---- input ---- */
    _tap: function (x, y) {
      var X = this, hit = X.vw.pick(x, y), n = hit ? X._resolve(hit.part) : null;
      if (n && n.href) { location.href = n.href; return; }
      if (!n) { if (X.sel != null || X.hov != null) X.select(null, false); return; }
      X.select(X.sel === n.id ? null : n.id);
    },
    _hover: function (x, y) {
      var X = this, hit = X.vw.pick(x, y), n = hit ? X._resolve(hit.part) : null;
      X.stage.style.cursor = n ? 'pointer' : '';
      var id = n ? n.id : null;
      if (id !== X.hov) { X.hov = id; X._apply(); }
    },
    _bind: function () {
      var X = this, fig = X.fig, st = X.stage, H = X._h = {};
      H.click = function (e) {
        var a = e.target.closest && e.target.closest('[data-act],[data-view],[data-part]');
        if (!a || !fig.contains(a) || a.classList.contains('iso-pin')) return;
        if (a.hasAttribute('data-view')) { X.view(a.getAttribute('data-view')); return; }
        var act = a.getAttribute('data-act');
        if (act === 'explode') X.explode();
        else if (act === 'reset') X.reset();
        else if (act === 'next') X.step(X.si + 1);
        else if (act === 'prev') X.step(X.si - 1);
        else if (a.hasAttribute('data-part') && a.tagName !== 'A') { var id = a.getAttribute('data-part'); X.select(X.sel === id ? null : id); }
      };
      H.over = function (e) {
        if (!FINE) return;
        var a = e.target.closest && e.target.closest('[data-part]');
        if (a && fig.contains(a) && !a.classList.contains('iso-pin')) { X.hov = a.getAttribute('data-part'); X._apply(); }
      };
      H.out = function (e) {
        var a = e.target.closest && e.target.closest('[data-part]');
        if (a && X.hov != null && !(e.relatedTarget && a.contains(e.relatedTarget))) { X.hov = null; X._apply(); }
      };
      H.fin = function (e) { var a = e.target.closest && e.target.closest('[data-part]'); if (a && fig.contains(a)) { X.hov = a.getAttribute('data-part'); X._apply(); } };
      H.fout = function (e) { var a = e.target.closest && e.target.closest('[data-part]'); if (a && X.hov != null) { X.hov = null; X._apply(); } };
      H.key = function (e) {
        if (e.altKey || e.metaKey || e.ctrlKey || e.target !== st) return;
        var k = e.key, s = e.shiftKey, o = X.orbit, hit = true, i;
        if (k === 'ArrowLeft') o.rotate(s ? -45 : -15, 0);
        else if (k === 'ArrowRight') o.rotate(s ? 45 : 15, 0);
        else if (k === 'ArrowUp') o.rotate(0, 10);
        else if (k === 'ArrowDown') o.rotate(0, -10);
        else if (k === '+' || k === '=') o.zoomBy(1.2);
        else if (k === '-' || k === '_') o.zoomBy(1 / 1.2);
        else if ((k === 'e' || k === 'E') && X._xn.length) X.explode();
        else if (k === '0' || k === 'Home') X.reset();
        else if (/^[1-9]$/.test(k)) {
          var tn = null; each(X.list, function (n) { if (String(n.n) === k) tn = n; });
          tn = tn || X.list[+k - 1];
          if (tn) X.select(tn.id); else hit = false;
        } else if (k === 'n' || k === 'N' || k === 'p' || k === 'P') {
          if (!X.list.length) return;
          i = X.list.indexOf(X.parts[X.sel]);
          i = k.toLowerCase() === 'n' ? (i + 1) % X.list.length : (i <= 0 ? X.list.length - 1 : i - 1);
          X.select(X.list[i].id);
        } else if (k === 'Escape') { if (X.sel == null) hit = false; X.select(null, false); o.deactivate(); }
        else hit = false;
        if (hit) e.preventDefault();
      };
      H.wake = function () { if (X.flows && X.flows.length && !X._ft) X._flowTick(); };
      st.addEventListener('pointerdown', H.wake);
      fig.addEventListener('click', H.click);
      fig.addEventListener('mouseover', H.over);
      fig.addEventListener('mouseout', H.out);
      fig.addEventListener('focusin', H.fin);
      fig.addEventListener('focusout', H.fout);
      st.addEventListener('keydown', H.key);
      H.motion = function (r) { if (r) X.explode(X.ex); X._flowTick(); };
      H.unMotion = P.onMotion(H.motion);
    },
    destroy: function () {
      var X = this, fig = X.fig, H = X._h;
      fig.removeEventListener('click', H.click); fig.removeEventListener('mouseover', H.over); fig.removeEventListener('mouseout', H.out);
      fig.removeEventListener('focusin', H.fin); fig.removeEventListener('focusout', H.fout); X.stage.removeEventListener('keydown', H.key);
      X.stage.removeEventListener('pointerdown', H.wake);
      if (H.unMotion) H.unMotion();
      if (X._ft) X._ft();
      X.orbit.destroy(); X.vw.destroy();
      each([X.vw.canvas, X.leaders, X.pinsEl, X.card, X.labs && X.labs.svg].concat(X._gen || []), function (e) { if (e && e.parentNode) e.parentNode.removeChild(e); });
      fig.classList.remove('is-3d');
      var p = fig.querySelector('.ps3d-poster'); if (p) { p.style.opacity = ''; p.style.visibility = ''; p.style.pointerEvents = ''; }
      X._ev = {};
    }
  };
  P.Explorer = Explorer;
  P.explorer = function (fig, id, o) { return new Explorer(fig, id, o); };
})();
