/* P.S.: theme-picker.js, v3.2. The light picker (sixteen lights and the hidden seventeenth), the ten living rooms
   and their click effects. theme.js loads it on the dial's first touch, focus or key, 2s after load, or at once when
   the saved light is a living room, and replays every dial press made before it arrived.
   On phones (and phones held sideways) the picker is a bottom sheet: a grab handle, swipe down or Done to close, the
   page above it changing as you choose. From 641px it opens beside the dial. */
(function () {
  'use strict';
  var PS = window.PS, T = PS && PS._theme, MO = window.PS_MOTION;
  if (!T || !MO || PS._pickerLoaded) return;
  PS._pickerLoaded = true;
  var root = document.documentElement;
  var THEMES = T.THEMES, themeOf = T.themeOf, current = T.current, disc = T.disc;
  var DESC = {
    daylight: 'The lab as built. Cream paper, black ink, one orange. Where it all started.',
    play: 'A toy box with physics. Shove the balls, click to scatter them, click again to add more.',
    aurora: 'Lights over a dark field, and one of them follows you around the page.',
    riso: 'A zine run: blue ink, fluorescent red, misregistered on purpose.',
    gallery: 'Museum walls. Everything hung with more air.',
    swarm: 'Nine hundred particles with somewhere to be. Click to detonate a shockwave.',
    rain: 'A storm on the window. Click anywhere to call the lightning yourself.',
    'void': 'You found the last room. It is just you in here. Tell no one.',
    sim: 'A constellation that knows where your cursor is. You are one of its nodes.',
    abyss: 'Four hundred meters down. Jellyfish, light rays, and bubbles wherever you click.',
    city: 'Three skylines deep. Move your cursor and the city moves with you.',
    warp: 'Stars streak past as you travel. Scroll faster and the ship obeys.',
    ember: 'A fire burned down to its patient stage. The sparks lean toward your cursor.',
    terminal: 'A 1979 terminal that renders serifs. Scanlines included.',
    blueprint: 'Working drawings. Draftsman yellow on engineer blue.',
    board: 'Slate and chalk, for the Twombly in you.',
    night: 'The studio at one in the morning. Same ink, lights off.'
  };

  var M = { x: -9999, y: -9999 };
  addEventListener('pointermove', function (e) { M.x = e.clientX; M.y = e.clientY; }, { passive: true });
  addEventListener('pointerleave', function () { M.x = -9999; M.y = -9999; });

  var scrollBoost = 0, lastScroll = window.scrollY || 0;
  addEventListener('scroll', function () {
    var y = window.scrollY || 0;
    scrollBoost = Math.min(30, scrollBoost + Math.abs(y - lastScroll) * 0.12);
    lastScroll = y;
  }, { passive: true });

  /* ================= shared canvas ================= */
  var bgC = null, bgRaf = 0, bgKey = '', W = 0, H = 0, DPR = 1;
  function bgCtx() {
    if (!bgC) return null;
    var w = innerWidth || document.documentElement.clientWidth;
    var h = innerHeight || document.documentElement.clientHeight;
    if (!w || !h) return null;
    if (w !== W || h !== H) {
      W = w; H = h; DPR = Math.min(window.devicePixelRatio || 1, 1.5);
      bgC.width = W * DPR; bgC.height = H * DPR;
    }
    var x = bgC.getContext('2d');
    x.setTransform(DPR, 0, 0, DPR, 0, 0);
    return x;
  }
  /* film grain is a static CSS overlay on #themeFx (see site.css): one 128px tile, made once */
  var GRAINY = { abyss: 1, city: 1, aurora: 1, ember: 1 }, grainDone = false;
  function ensureGrain(key) {
    if (grainDone || !GRAINY[key]) return;
    var fx = document.getElementById('themeFx');
    if (!fx) return;
    try {
      var tile = document.createElement('canvas');
      tile.width = tile.height = 128;
      var g = tile.getContext('2d'), img = g.createImageData(128, 128);
      for (var i = 0; i < img.data.length; i += 4) {
        var v = Math.floor(Math.random() * 255);
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 26;
      }
      g.putImageData(img, 0, 0);
      fx.style.setProperty('--grain', 'url(' + tile.toDataURL() + ')');
      grainDone = true;
    } catch (e) {}
  }

  /* ================= THE SIMULATION ================= */
  var stars = null;
  function drawSim(t) {
    var x = bgCtx(); if (!x) return;
    if (!stars || stars.W !== W) {
      stars = { W: W, p: [], shoot: null };
      for (var i = 0; i < 150; i++) {
        stars.p.push({ x: Math.random() * W, y: Math.random() * H,
          s: 0.12 + Math.random() * 0.5, r: 0.5 + Math.random() * 1.4, ox: 0, oy: 0 });
      }
    }
    x.clearRect(0, 0, W, H);
    var p = stars.p, i2, j;
    for (i2 = 0; i2 < p.length; i2++) {
      var s = p[i2];
      s.y += s.s * 0.4; s.x += s.s * 0.12;
      if (s.y > H + 4) { s.y = -4; s.x = Math.random() * W; }
      if (s.x > W + 4) s.x = -4;
      var dx = s.x - M.x, dy = s.y - M.y, d2 = dx * dx + dy * dy;
      if (d2 < 19600 && d2 > 1) {
        var d = Math.sqrt(d2), f = (140 - d) / 140 * 2.2;
        s.ox += dx / d * f; s.oy += dy / d * f;
      }
      s.ox *= 0.9; s.oy *= 0.9;
    }
    x.strokeStyle = 'rgba(0,229,255,.06)'; x.lineWidth = 1;
    for (i2 = 0; i2 < p.length; i2++) {
      for (j = i2 + 1; j < p.length; j++) {
        var ax = p[i2].x + p[i2].ox, ay = p[i2].y + p[i2].oy;
        var bx = p[j].x + p[j].ox, by = p[j].y + p[j].oy;
        var ddx = ax - bx, ddy = ay - by;
        if (ddx * ddx + ddy * ddy < 8100) {
          x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke();
        }
      }
    }
    x.strokeStyle = 'rgba(0,229,255,.16)';
    for (i2 = 0; i2 < p.length; i2++) {
      var sx = p[i2].x + p[i2].ox, sy = p[i2].y + p[i2].oy;
      var mdx = sx - M.x, mdy = sy - M.y;
      if (mdx * mdx + mdy * mdy < 25600) {
        x.beginPath(); x.moveTo(sx, sy); x.lineTo(M.x, M.y); x.stroke();
      }
    }
    for (i2 = 0; i2 < p.length; i2++) {
      var st = p[i2];
      x.fillStyle = 'rgba(215,228,255,' + (0.25 + st.s * 0.8) + ')';
      x.beginPath(); x.arc(st.x + st.ox, st.y + st.oy, st.r, 0, 7); x.fill();
    }
    if (!stars.shoot && Math.random() < 0.004) {
      stars.shoot = { x: Math.random() * W * 0.8, y: Math.random() * H * 0.35, life: 1 };
    }
    if (stars.shoot) {
      var sh = stars.shoot;
      x.strokeStyle = 'rgba(0,229,255,' + (sh.life * 0.7) + ')'; x.lineWidth = 1.6;
      x.beginPath(); x.moveTo(sh.x, sh.y); x.lineTo(sh.x - 70 * (1 - sh.life), sh.y - 26 * (1 - sh.life)); x.stroke();
      x.lineWidth = 1;
      sh.x += 13; sh.y += 4.6; sh.life -= 0.03;
      if (sh.life <= 0) stars.shoot = null;
    }
  }

  /* ================= THE ABYSS ================= */
  var sea = null;
  function drawAbyss(t) {
    var x = bgCtx(); if (!x) return;
    if (!sea || sea.W !== W) {
      sea = { W: W, bub: [], jelly: [] };
      for (var i = 0; i < 55; i++) {
        sea.bub.push({ x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 3.2,
          sp: 0.3 + Math.random() * 0.9, ph: Math.random() * 6.3 });
      }
      for (var j = 0; j < 4; j++) {
        sea.jelly.push({ x: (0.15 + 0.22 * j) * W, y: H * (0.25 + Math.random() * 0.5),
          vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.12,
          r: 16 + Math.random() * 18, ph: Math.random() * 6.3 });
      }
    }
    x.clearRect(0, 0, W, H);
    for (var r2 = 0; r2 < 3; r2++) {
      var bx = W * (0.18 + 0.3 * r2), sw2 = W * 0.16, sway = Math.sin(t * 0.00012 + r2 * 2) * W * 0.05;
      var gr = x.createLinearGradient(bx + sway, 0, bx + sway + sw2 * 0.4, H * 0.8);
      gr.addColorStop(0, 'rgba(120,220,215,.05)');
      gr.addColorStop(1, 'rgba(120,220,215,0)');
      x.fillStyle = gr;
      x.beginPath();
      x.moveTo(bx + sway, 0); x.lineTo(bx + sway + sw2, 0);
      x.lineTo(bx + sway + sw2 * 1.9, H * 0.85); x.lineTo(bx + sway + sw2 * 0.6, H * 0.85);
      x.closePath(); x.fill();
    }
    for (var i3 = 0; i3 < sea.bub.length; i3++) {
      var b = sea.bub[i3];
      b.y -= b.sp; b.x += Math.sin(t * 0.001 + b.ph) * 0.3;
      if (b.y < -6) { b.y = H + 6; b.x = Math.random() * W; }
      x.strokeStyle = 'rgba(180,235,235,.22)'; x.lineWidth = 1;
      x.beginPath(); x.arc(b.x, b.y, b.r, 0, 7); x.stroke();
    }
    for (var j2 = 0; j2 < sea.jelly.length; j2++) {
      var jf = sea.jelly[j2];
      var pulse = 1 + Math.sin(t * 0.0016 + jf.ph) * 0.12;
      jf.x += jf.vx + Math.sin(t * 0.0004 + jf.ph) * 0.1;
      jf.y += jf.vy + Math.sin(t * 0.0016 + jf.ph) * 0.22;
      if (jf.x < -60) jf.x = W + 60; if (jf.x > W + 60) jf.x = -60;
      if (jf.y < H * 0.08) jf.vy = Math.abs(jf.vy); if (jf.y > H * 0.9) jf.vy = -Math.abs(jf.vy);
      var rr = jf.r * pulse;
      var glow = x.createRadialGradient(jf.x, jf.y, 0, jf.x, jf.y, rr * 3);
      glow.addColorStop(0, 'rgba(62,230,193,.14)');
      glow.addColorStop(1, 'rgba(62,230,193,0)');
      x.fillStyle = glow;
      x.beginPath(); x.arc(jf.x, jf.y, rr * 3, 0, 7); x.fill();
      x.fillStyle = 'rgba(140,240,220,.30)';
      x.beginPath(); x.arc(jf.x, jf.y, rr, Math.PI, 0); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(140,240,220,.22)'; x.lineWidth = 1;
      for (var tn = 0; tn < 4; tn++) {
        var tx = jf.x - rr * 0.7 + tn * rr * 0.47;
        x.beginPath(); x.moveTo(tx, jf.y);
        x.quadraticCurveTo(tx + Math.sin(t * 0.003 + tn + jf.ph) * 6, jf.y + rr * 1.6,
          tx + Math.sin(t * 0.002 + tn) * 10, jf.y + rr * 2.6);
        x.stroke();
      }
    }
  }

  /* ================= NIGHT CITY ================= */
  var city = null;
  function buildSkyline(n, minH, maxH) {
    var b = [], cx = -40;
    while (cx < 3000) {
      var w = 26 + Math.random() * 70, h = minH + Math.random() * (maxH - minH);
      var win = [];
      for (var wy = 14; wy < h - 8; wy += 13) {
        for (var wx = 5; wx < w - 6; wx += 11) {
          if (Math.random() < 0.24) win.push([wx, wy, Math.random() < 0.5]);
        }
      }
      b.push({ x: cx, w: w, h: h, win: win });
      cx += w + 2 + Math.random() * 26;
    }
    return b;
  }
  function drawCity(t) {
    var x = bgCtx(); if (!x) return;
    if (!city || city.W !== W) {
      city = { W: W,
        layers: [buildSkyline(0, H * 0.18, H * 0.42), buildSkyline(1, H * 0.14, H * 0.3), buildSkyline(2, H * 0.08, H * 0.2)],
        cols: ['#141936', '#0E1228', '#090C1B'], par: [0.045, 0.028, 0.012],
        winCols: ['rgba(255,217,142,.75)', 'rgba(255,110,199,.6)'],
        stars: [], plane: null };
      for (var s = 0; s < 60; s++) city.stars.push([Math.random() * W, Math.random() * H * 0.5, Math.random()]);
    }
    x.clearRect(0, 0, W, H);
    for (var s2 = 0; s2 < city.stars.length; s2++) {
      var st = city.stars[s2];
      x.fillStyle = 'rgba(234,230,248,' + (0.1 + 0.25 * Math.abs(Math.sin(t * 0.001 + st[2] * 9))) + ')';
      x.fillRect(st[0], st[1], 1.2, 1.2);
    }
    if (!city.plane && Math.random() < 0.003) city.plane = { x: -30, y: H * (0.06 + Math.random() * 0.25) };
    if (city.plane) {
      var blink = Math.sin(t * 0.02) > 0;
      x.fillStyle = blink ? 'rgba(255,110,199,.9)' : 'rgba(234,230,248,.6)';
      x.fillRect(city.plane.x, city.plane.y, 3, 1.6);
      city.plane.x += 1.7;
      if (city.plane.x > W + 40) city.plane = null;
    }
    var mx = (M.x > -999 ? M.x : W / 2) - W / 2;
    for (var L = 2; L >= 0; L--) {
      var off = -mx * city.par[L] - 200;
      x.fillStyle = city.cols[L];
      var layer = city.layers[L];
      for (var bI = 0; bI < layer.length; bI++) {
        var bld = layer[bI], bx2 = bld.x + off;
        if (bx2 > W + 60 || bx2 + bld.w < -60) continue;
        x.fillRect(bx2, H - bld.h, bld.w, bld.h);
        for (var wI = 0; wI < bld.win.length; wI++) {
          var wn = bld.win[wI];
          if (Math.random() < 0.0012) wn[2] = !wn[2];
          if (wn[2]) {
            x.fillStyle = city.winCols[(bI + wI) % 2 === 0 ? 0 : 1];
            x.fillRect(bx2 + wn[0], H - bld.h + wn[1], 3.4, 4.4);
            x.fillStyle = city.cols[L];
          }
        }
      }
    }
  }

  /* ================= THE SWARM ================= */
  var swarm = null;
  function drawSwarm(t) {
    var x = bgCtx(); if (!x) return;
    if (!swarm || swarm.W !== W) {
      swarm = { W: W, p: [], waves: [] };
      for (var i = 0; i < 900; i++) {
        swarm.p.push({ x: Math.random() * W, y: Math.random() * H, hot: Math.random() < 0.07 });
      }
      x.fillStyle = 'rgb(5,5,5)'; x.fillRect(0, 0, W, H);
    }
    x.fillStyle = 'rgba(5,5,5,.08)'; x.fillRect(0, 0, W, H);
    for (var wv = swarm.waves.length - 1; wv >= 0; wv--) {
      var wave = swarm.waves[wv];
      wave.r += 9;
      x.strokeStyle = 'rgba(255,46,99,' + Math.max(0, 0.5 - wave.r / 700) + ')'; x.lineWidth = 2;
      x.beginPath(); x.arc(wave.x, wave.y, wave.r, 0, 7); x.stroke();
      if (wave.r > 900) swarm.waves.splice(wv, 1);
    }
    x.lineWidth = 1;
    for (var i2 = 0; i2 < swarm.p.length; i2++) {
      var p = swarm.p[i2];
      var a = Math.sin(p.x * 0.0021 + t * 0.00023) + Math.cos(p.y * 0.0017 - t * 0.00019) + Math.sin((p.x + p.y) * 0.0009);
      var ang = a * 2.1, sp = 1.4;
      var vx = Math.cos(ang) * sp, vy = Math.sin(ang) * sp;
      var dx = p.x - M.x, dy = p.y - M.y, d2 = dx * dx + dy * dy;
      if (d2 < 16900 && d2 > 1) {
        var d = Math.sqrt(d2), f = (130 - d) / 130 * 3.4;
        vx += dx / d * f; vy += dy / d * f;
      }
      for (var wv2 = 0; wv2 < swarm.waves.length; wv2++) {
        var wgo = swarm.waves[wv2];
        var wdx = p.x - wgo.x, wdy = p.y - wgo.y, wd = Math.sqrt(wdx * wdx + wdy * wdy) || 1;
        if (Math.abs(wd - wgo.r) < 46) { vx += wdx / wd * 5.2; vy += wdy / wd * 5.2; }
      }
      p.x += vx; p.y += vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      x.fillStyle = p.hot ? 'rgba(255,46,99,.6)' : 'rgba(237,237,237,.34)';
      x.fillRect(p.x, p.y, 1.4, 1.4);
    }
  }

  /* ================= HYPERDRIVE ================= */
  var warp = null;
  function drawWarp(t) {
    var x = bgCtx(); if (!x) return;
    if (!warp || warp.W !== W) {
      warp = { W: W, p: [], cx: W / 2, cy: H / 2 };
      for (var i = 0; i < 230; i++) {
        warp.p.push({ a: Math.random() * 6.3, d: 8 + Math.random() * Math.max(W, H) * 0.5, z: 0.4 + Math.random() * 1.4 });
      }
    }
    x.fillStyle = 'rgba(3,3,8,.34)'; x.fillRect(0, 0, W, H);
    if (M.x > -999) { warp.cx += (W / 2 + (M.x - W / 2) * 0.16 - warp.cx) * 0.04; warp.cy += (H / 2 + (M.y - H / 2) * 0.16 - warp.cy) * 0.04; }
    scrollBoost *= 0.94;
    var speed = 1 + scrollBoost;
    for (var i2 = 0; i2 < warp.p.length; i2++) {
      var p = warp.p[i2];
      var px = warp.cx + Math.cos(p.a) * p.d, py = warp.cy + Math.sin(p.a) * p.d;
      p.d *= 1 + 0.011 * p.z * speed;
      var nx = warp.cx + Math.cos(p.a) * p.d, ny = warp.cy + Math.sin(p.a) * p.d;
      var al = Math.min(0.8, 0.12 + p.d / Math.max(W, H) * 1.1);
      x.strokeStyle = (i2 % 11 === 0) ? 'rgba(138,123,255,' + al + ')' : 'rgba(237,235,255,' + al * 0.8 + ')';
      x.lineWidth = Math.min(2.4, 0.4 + p.d / Math.max(W, H) * 2.4);
      x.beginPath(); x.moveTo(px, py); x.lineTo(nx, ny); x.stroke();
      if (nx < -80 || nx > W + 80 || ny < -80 || ny > H + 80) {
        p.a = Math.random() * 6.3; p.d = 6 + Math.random() * 40; p.z = 0.4 + Math.random() * 1.4;
      }
    }
  }

  /* ================= THE PLAYROOM ================= */
  var balls = null;
  var BALLC = ['255,92,57', '47,107,255', '255,197,61', '47,191,113', '176,140,255', '38,34,27'];
  function newBall(px, py) {
    return { x: px, y: py, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
      r: 18 + Math.random() * 42, c: BALLC[Math.floor(Math.random() * BALLC.length)] };
  }
  function drawPlay(t) {
    var x = bgCtx(); if (!x) return;
    if (!balls || balls.W !== W) {
      balls = { W: W, p: [], lm: { x: M.x, y: M.y } };
      for (var i = 0; i < 14; i++) balls.p.push(newBall(Math.random() * W, Math.random() * H));
    }
    x.clearRect(0, 0, W, H);
    var p = balls.p, mvx = M.x - balls.lm.x, mvy = M.y - balls.lm.y;
    balls.lm.x = M.x; balls.lm.y = M.y;
    for (var i2 = 0; i2 < p.length; i2++) {
      var b = p[i2];
      var dx = b.x - M.x, dy = b.y - M.y, d2 = dx * dx + dy * dy, rr = b.r + 60;
      if (d2 < rr * rr && d2 > 1) {
        var d = Math.sqrt(d2), f = (rr - d) / rr;
        b.vx += (dx / d) * f * 1.6 + mvx * 0.06 * f;
        b.vy += (dy / d) * f * 1.6 + mvy * 0.06 * f;
      }
      for (var j2 = i2 + 1; j2 < p.length; j2++) {
        var o = p[j2], ox = o.x - b.x, oy = o.y - b.y, od2 = ox * ox + oy * oy, mind = o.r + b.r;
        if (od2 < mind * mind && od2 > 1) {
          var od = Math.sqrt(od2), push = (mind - od) / mind * 0.6;
          var nx2 = ox / od, ny2 = oy / od;
          b.vx -= nx2 * push; b.vy -= ny2 * push;
          o.vx += nx2 * push; o.vy += ny2 * push;
        }
      }
      b.vx += (Math.random() - 0.5) * 0.03; b.vy += (Math.random() - 0.5) * 0.03;
      b.vx *= 0.985; b.vy *= 0.985;
      b.x += b.vx; b.y += b.vy;
      if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.85; }
      if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx) * 0.85; }
      if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy) * 0.85; }
      if (b.y > H - b.r) { b.y = H - b.r; b.vy = -Math.abs(b.vy) * 0.85; }
    }
    for (var i4 = 0; i4 < p.length; i4++) {
      var bb = p[i4];
      x.fillStyle = 'rgba(38,34,27,.06)';
      x.beginPath(); x.arc(bb.x + 4, bb.y + 7, bb.r, 0, 7); x.fill();
      x.fillStyle = 'rgba(' + bb.c + ',.55)';
      x.beginPath(); x.arc(bb.x, bb.y, bb.r, 0, 7); x.fill();
    }
  }

  /* ================= AURORA ================= */
  var AUR = [
    { c: '125,245,198', sp: 0.00011, ph: 0.0, rx: 0.34 },
    { c: '108,92,255', sp: 0.00008, ph: 2.1, rx: 0.42 },
    { c: '255,126,210', sp: 0.00013, ph: 4.2, rx: 0.30 },
    { c: '51,201,255', sp: 0.00007, ph: 1.1, rx: 0.38 }
  ];
  var lamp = { x: -400, y: -400 };
  function drawAurora(t) {
    var x = bgCtx(); if (!x) return;
    x.clearRect(0, 0, W, H);
    x.globalCompositeOperation = 'lighter';
    for (var i = 0; i < AUR.length; i++) {
      var b = AUR[i];
      var cx = W * (0.5 + 0.36 * Math.sin(t * b.sp + b.ph));
      var cy = H * (0.42 + 0.3 * Math.cos(t * b.sp * 1.3 + b.ph * 1.7));
      var r = Math.max(W, H) * b.rx;
      var g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(' + b.c + ',0.16)');
      g.addColorStop(1, 'rgba(' + b.c + ',0)');
      x.fillStyle = g;
      x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
    }
    if (M.x > -999) { lamp.x += (M.x - lamp.x) * 0.06; lamp.y += (M.y - lamp.y) * 0.06; }
    var lr = Math.max(W, H) * 0.22;
    var lg = x.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, lr);
    lg.addColorStop(0, 'rgba(125,245,198,0.13)');
    lg.addColorStop(1, 'rgba(125,245,198,0)');
    x.fillStyle = lg;
    x.beginPath(); x.arc(lamp.x, lamp.y, lr, 0, 7); x.fill();
    x.globalCompositeOperation = 'source-over';
  }

  /* ================= THE RAINY STUDY ================= */
  var drops = null;
  function makeBolt(bx) {
    var seg = [[bx, 0]], by = 0;
    for (var k = 0; k < 7; k++) { bx += (Math.random() - 0.5) * 70; by += H * 0.07 * (0.6 + Math.random()); seg.push([bx, by]); }
    return seg;
  }
  function drawRain(t) {
    var x = bgCtx(); if (!x) return;
    if (!drops || drops.W !== W) {
      drops = { W: W, p: [], flash: 0, next: t + 4000 + Math.random() * 8000, bolt: null };
      for (var i = 0; i < 130; i++) {
        drops.p.push({ x: Math.random() * W, y: Math.random() * H,
          l: 8 + Math.random() * 16, sp: 3.5 + Math.random() * 5.5, a: 0.10 + Math.random() * 0.2 });
      }
    }
    x.clearRect(0, 0, W, H);
    if (t > drops.next) {
      drops.flash = 1;
      drops.next = t + 6000 + Math.random() * 12000;
      drops.bolt = makeBolt(W * (0.15 + Math.random() * 0.7));
    }
    if (drops.flash > 0.02) {
      x.fillStyle = 'rgba(190,210,240,' + (drops.flash * 0.10) + ')';
      x.fillRect(0, 0, W, H);
      if (drops.flash > 0.5 && drops.bolt) {
        x.strokeStyle = 'rgba(220,235,255,' + (drops.flash * 0.8) + ')'; x.lineWidth = 1.8;
        x.beginPath();
        drops.bolt.forEach(function (pt, i3) { i3 ? x.lineTo(pt[0], pt[1]) : x.moveTo(pt[0], pt[1]); });
        x.stroke(); x.lineWidth = 1;
      }
      drops.flash *= 0.86;
    }
    x.lineWidth = 1.1; x.lineCap = 'round';
    for (var i2 = 0; i2 < drops.p.length; i2++) {
      var d = drops.p[i2];
      x.strokeStyle = 'rgba(150,185,230,' + d.a + ')';
      x.beginPath(); x.moveTo(d.x, d.y); x.lineTo(d.x - d.l * 0.13, d.y + d.l); x.stroke();
      d.y += d.sp; d.x -= d.sp * 0.13;
      if (d.y > H + 20) { d.y = -20; d.x = Math.random() * (W + 60); }
      if (d.x < -30) d.x = W + 20;
    }
  }

  /* ================= EMBER ================= */
  var fire = null;
  function drawEmber(t) {
    var x = bgCtx(); if (!x) return;
    if (!fire || fire.W !== W) {
      fire = { W: W, p: [], glow: 0.9 };
      for (var i = 0; i < 65; i++) {
        fire.p.push({ x: Math.random() * W, y: H + Math.random() * H,
          sp: 0.35 + Math.random() * 1.1, sw: Math.random() * 6.3,
          r: 0.8 + Math.random() * 2.1, hue: Math.random() });
      }
    }
    x.clearRect(0, 0, W, H);
    fire.glow += ((0.75 + Math.random() * 0.35) - fire.glow) * 0.05;
    var gg = x.createRadialGradient(W / 2, H + 60, 0, W / 2, H + 60, H * 0.6);
    gg.addColorStop(0, 'rgba(255,122,69,' + (0.13 * fire.glow) + ')');
    gg.addColorStop(1, 'rgba(255,122,69,0)');
    x.fillStyle = gg;
    x.fillRect(0, 0, W, H);
    for (var i2 = 0; i2 < fire.p.length; i2++) {
      var p = fire.p[i2];
      p.y -= p.sp;
      p.x += Math.sin(t * 0.0012 + p.sw) * 0.5;
      if (M.x > -999) {
        var dx = M.x - p.x, dy = M.y - p.y, d2 = dx * dx + dy * dy;
        if (d2 < 32400 && d2 > 4) { var d = Math.sqrt(d2); p.x += dx / d * 0.5; p.y += dy / d * 0.35; }
      }
      var lifeA = Math.max(0, Math.min(1, p.y / H));
      var col = p.hue < 0.5 ? '255,122,69' : (p.hue < 0.85 ? '255,77,0' : '255,197,61');
      x.fillStyle = 'rgba(' + col + ',' + (0.16 + (1 - lifeA) * 0.5) + ')';
      x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill();
      if (p.y < -8) { p.y = H + 10; p.x = Math.random() * W; }
    }
  }

  /* ================= THE VOID ================= */
  var voidS = null;
  function drawVoid(t) {
    var x = bgCtx(); if (!x) return;
    if (!voidS || voidS.W !== W) voidS = { W: W, trail: [] };
    x.fillStyle = 'rgba(0,0,0,.14)'; x.fillRect(0, 0, W, H);
    if (M.x > -999) voidS.trail.push({ x: M.x, y: M.y });
    if (voidS.trail.length > 46) voidS.trail.shift();
    for (var i = 0; i < voidS.trail.length; i++) {
      var p = voidS.trail[i], a = (i / voidS.trail.length);
      x.fillStyle = 'rgba(255,255,255,' + (a * 0.55) + ')';
      var r = 0.6 + a * 2.4;
      x.beginPath(); x.arc(p.x, p.y, r, 0, 7); x.fill();
    }
    var breathe = 3 + Math.sin(t * 0.0009) * 1.6;
    x.fillStyle = 'rgba(255,255,255,.75)';
    x.beginPath(); x.arc(W / 2, H / 2, breathe, 0, 7); x.fill();
  }

  var BG = { sim: drawSim, abyss: drawAbyss, city: drawCity, swarm: drawSwarm, warp: drawWarp,
    play: drawPlay, aurora: drawAurora, rain: drawRain, ember: drawEmber, 'void': drawVoid };
  function stopBg() {
    if (bgRaf) { cancelAnimationFrame(bgRaf); bgRaf = 0; }
    if (bgC) { var x = bgC.getContext('2d'); x && x.clearRect(0, 0, bgC.width, bgC.height); bgC.style.display = 'none'; bgC.classList.remove('on'); }
    bgKey = ''; stars = null; drops = null; balls = null; swarm = null; sea = null; city = null; warp = null; fire = null; voidS = null;
  }
  function startBg(key) {
    var fn = BG[key];
    if (!fn) { stopBg(); return; }
    if (!bgC) return;
    bgKey = key;
    bgC.style.display = 'block';
    ensureGrain(key);
    /* the room fades up once its first frame is painted (the class is the only switch, so reduced motion gets it too) */
    requestAnimationFrame(function () { if (bgKey === key && bgC) bgC.classList.add('on'); });
    fn(performance.now());
    if (MO.reduced()) return;
    var step = function (ts) {
      if (bgKey !== key) return;
      fn(ts);
      bgRaf = requestAnimationFrame(step);
    };
    if (bgRaf) cancelAnimationFrame(bgRaf);
    bgRaf = requestAnimationFrame(step);
  }

  /* ---------------- click easter eggs ---------------- */
  addEventListener('click', function (e) {
    if (e.defaultPrevented) return; /* a 3D stage claimed this click (it only calls preventDefault on a hit) */
    if (e.target.closest('button, a, input, select, textarea, label, canvas, #themePanel, .exp')) return;
    try { if (String(getSelection()).length > 0) return; } catch (e2) {}
    if (e.target.closest('p, h1, h2, h3, li, figure, blockquote, .pxe-essay, .chart-card, .qcard, .wall, #board, .exp')) return;
    var cx = e.clientX, cy = e.clientY;
    if (bgKey === 'play' && balls) {
      for (var i = 0; i < balls.p.length; i++) {
        var b = balls.p[i], dx = b.x - cx, dy = b.y - cy, d = Math.sqrt(dx * dx + dy * dy) || 1;
        var f = Math.max(0, 1 - d / 420) * 11;
        b.vx += dx / d * f; b.vy += dy / d * f;
      }
      if (balls.p.length < 26) balls.p.push(newBall(cx, cy));
    } else if (bgKey === 'swarm' && swarm) {
      swarm.waves.push({ x: cx, y: cy, r: 4 });
    } else if (bgKey === 'rain' && drops) {
      drops.flash = 1;
      drops.bolt = makeBolt(cx);
    } else if (bgKey === 'abyss' && sea) {
      for (var j = 0; j < 12; j++) {
        sea.bub.push({ x: cx + (Math.random() - 0.5) * 40, y: cy + (Math.random() - 0.5) * 24,
          r: 1 + Math.random() * 3.4, sp: 0.7 + Math.random() * 1.6, ph: Math.random() * 6.3 });
      }
      if (sea.bub.length > 220) sea.bub.splice(0, sea.bub.length - 220);
    }
  });

  /* ---------------- switching: an iris from the dial, or from the swatch you touched when the picker is a sheet.
     700ms on a desk, 320ms on a phone. ---------------- */
  var panel = null, grid = null, cap = null, tbDisc = null, btn = T.btn();
  function mark(key) {
    if (!grid) return;
    Array.prototype.forEach.call(grid.querySelectorAll('.th-tile'), function (r) {
      var on = r.getAttribute('data-key') === key;
      r.setAttribute('aria-selected', on ? 'true' : 'false');
      r.tabIndex = on ? 0 : -1;
    });
  }
  var lastVt = null;
  function switchTo(key, x, y) {
    /* the light is already showing (a preview): choosing it only saves it */
    if (key === current()) {
      if (key !== T.committed()) T.apply(key);
      mark(key);
      return;
    }
    if (document.startViewTransition && !MO.reduced()) {
      root.classList.add('vt-theme');
      var vt = document.startViewTransition(function () { T.apply(key); mark(key); });
      lastVt = vt;
      var vtDone = function () { if (lastVt === vt) { root.classList.remove('vt-theme'); lastVt = null; } };
      vt.finished.then(vtDone, vtDone);
      vt.ready.then(function () {
        var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: T.compact() ? 320 : 700, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(function () {});
    } else { T.apply(key); mark(key); }
  }
  /* a preview crossfades in 200ms where view transitions exist; otherwise it is an instant swap */
  var pvVt = null;
  function showPreview(key) {
    if (key === current()) return;
    if (document.startViewTransition && !MO.reduced() && !lastVt) {
      root.classList.add('vt-preview');
      var vt = document.startViewTransition(function () { T.apply(key, true); });
      pvVt = vt;
      var done = function () { if (pvVt === vt) { root.classList.remove('vt-preview'); pvVt = null; } };
      vt.finished.then(done, done);
      vt.ready.catch(function () {});
    } else T.apply(key, true);
  }

  /* ---------------- the panel ---------------- */
  /* the grid: the light papers, the still darks, then the living rooms. Void, once found, is the seventeenth. */
  var ORDER = ['daylight', 'gallery', 'riso', 'play', 'night', 'board', 'blueprint', 'terminal',
    'aurora', 'rain', 'ember', 'abyss', 'city', 'sim', 'swarm', 'warp', 'void'];
  /* the panel's one paragraph: counts match what the list shows */
  function ledeText() {
    return T.voidFound()
      ? 'The house opens in daylight. Ten of the lights below are alive. They move on their own and answer your cursor or a click. You found the hidden one.'
      : 'The house opens in daylight. Nine of the lights below are alive. They move on their own and answer your cursor or a click. A tenth is hidden near this sentence.';
  }
  function tiles() { return Array.prototype.filter.call(grid.querySelectorAll('.th-tile'), function (r) { return !r.hidden; }); }
  function capDefault() { cap.textContent = ledeText(); }
  function capFor(key) { cap.innerHTML = '<b>' + themeOf(key).name + '.</b> ' + (DESC[key] || ''); }
  function isOpen() { return !!panel && panel.classList.contains('open'); }

  /* placing: a bottom sheet on phones; from 641px under the docked dial (or over it when the dial sits low on the
     screen), or above the floating one */
  function placePanel() {
    var sheet = T.compact(), ps = panel.style;
    panel.classList.toggle('is-sheet', sheet);
    if (sheet) {
      ps.top = ps.bottom = ps.left = ps.right = ps.maxHeight = '';
      panel.classList.remove('is-down');
      return;
    }
    var r = btn.getBoundingClientRect(), vw = innerWidth || root.clientWidth, vh = innerHeight || root.clientHeight;
    if (btn.classList.contains('is-docked')) {
      var below = vh - r.bottom - 28, above = r.top - 28;
      ps.right = Math.max(16, Math.round(vw - r.right - 8)) + 'px'; ps.left = 'auto';
      if (below >= Math.min(420, above)) {
        panel.classList.add('is-down');
        ps.top = Math.round(r.bottom + 12) + 'px'; ps.bottom = 'auto';
        ps.maxHeight = Math.max(260, Math.round(below)) + 'px';
        ps.setProperty('--tp-origin', '100% 0');
      } else {
        panel.classList.remove('is-down');
        ps.bottom = Math.round(vh - r.top + 12) + 'px'; ps.top = 'auto';
        ps.maxHeight = Math.max(260, Math.round(above)) + 'px';
        ps.setProperty('--tp-origin', '100% 100%');
      }
    } else {
      panel.classList.remove('is-down');
      ps.bottom = Math.max(16, Math.round(vh - r.top + 12)) + 'px'; ps.top = 'auto';
      ps.left = Math.max(16, Math.round(r.left)) + 'px'; ps.right = 'auto';
      ps.maxHeight = Math.max(260, Math.round(r.top - 28)) + 'px';
      ps.setProperty('--tp-origin', '0 100%');
    }
  }

  /* previews: hover dwells 240ms, keyboard focus 160ms; leaving the grid puts the saved light back */
  var pvT = 0, kbFocusT = 0;
  function markPreview(key) {
    tiles().forEach(function (r) { r.classList.toggle('is-preview', r.getAttribute('data-key') === key && key !== T.committed()); });
  }
  function preview(key, wait) {
    clearTimeout(pvT);
    capFor(key);
    if (tbDisc) tbDisc.style.background = disc(key, true);
    pvT = setTimeout(function () {
      if (!isOpen()) return;
      showPreview(key);
      markPreview(key);
    }, wait);
  }
  function unpreview(now) {
    clearTimeout(pvT);
    var back = function () {
      var c = T.committed();
      markPreview(null);
      capDefault();
      if (tbDisc) tbDisc.style.background = disc(c, true);
      if (current() !== c) { if (now) T.apply(c, true); else showPreview(c); }
    };
    if (now) back(); else pvT = setTimeout(back, 220);
  }
  function openPanel() {
    placePanel();
    panel.classList.add('open'); btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    root.classList.remove('tb-rest');
  }
  function close(refocus) {
    if (!isOpen()) return;
    var had = panel.contains(document.activeElement);
    clearTimeout(kbFocusT);
    unpreview(true);
    panel.classList.remove('open'); btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
    if (had || refocus) { try { btn.focus({ preventScroll: true }); } catch (e) { btn.focus(); } }
    setTimeout(T.floatRest, 0);
  }
  /* a press of the dial: open, or close. Opened from the keyboard, focus lands on the chosen light once the presses
     stop (five must fit in 2200ms, so the wait restarts on every press and the hidden room stays findable by keys). */
  function toggle(kb) {
    if (isOpen()) { close(false); return; }
    openPanel();
    clearTimeout(kbFocusT);
    if (kb) kbFocusT = setTimeout(function () {
      if (!isOpen() || document.activeElement !== btn) return;
      var on = grid.querySelector('.th-tile[aria-selected="true"]') || tiles()[0];
      if (on) on.focus();
    }, 600);
  }
  function findVoid() {
    clearTimeout(kbFocusT);
    var vr = grid.querySelector('.th-tile[data-key="void"]');
    if (vr) vr.hidden = false;
    capDefault();
    openPanel();
    var r0 = btn.getBoundingClientRect();
    switchTo('void', r0.left + r0.width / 2, r0.top + r0.height / 2);
  }

  function build() {
    bgC = document.createElement('canvas');
    bgC.id = 'themeBg';
    bgC.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bgC);
    tbDisc = btn.querySelector('.tb-disc');

    panel = document.createElement('div');
    panel.id = 'themePanel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-label', 'Pick a light');
    var cur = current(), found = T.voidFound();
    var tile = function (key, i) {
      var t = themeOf(key), isOn = key === cur;
      var chip = t.secret ? '<em>Secret</em>' : t.live ? '<em>Live</em>' : '';
      return '<button type="button" role="option" class="th-tile' + (t.secret ? ' th-void' : '') + '" data-key="' + key + '"' +
        ' aria-selected="' + (isOn ? 'true' : 'false') + '" tabindex="' + (isOn ? '0' : '-1') + '" style="--i:' + i + '"' +
        (t.secret && !found ? ' hidden' : '') + '>' +
        '<span class="th-mini" aria-hidden="true" style="--tp:' + t.sw[0] + ';--ti:' + t.sw[1] + ';--ta:' + t.sw[2] + '">' +
          '<b>P<i>.</i>S<i>.</i></b><span class="tl"></span><span class="tl"></span><span class="tl"></span>' + chip + '</span>' +
        '<span class="th-name">' + t.name + (t.original ? '<i>the original</i>' : '') + '</span>' +
        '<span class="vh">' + (t.live ? ', live' : '') + '. ' + (DESC[key] || '') + '</span>' +
        '</button>';
    };
    panel.innerHTML =
      '<div class="ps-sheet-grab" aria-hidden="true"></div>' +
      '<div class="th-head"><span class="th-tag" id="thTag">Pick a light</span>' +
        '<button type="button" class="th-done">Done</button></div>' +
      '<div class="th-grid" role="listbox" aria-labelledby="thTag">' + ORDER.map(tile).join('') + '</div>' +
      '<p class="th-cap"></p>';
    document.body.appendChild(panel);
    grid = panel.querySelector('.th-grid');
    cap = panel.querySelector('.th-cap');
    capDefault();

    /* arrows walk the grid in two dimensions (columns read from the layout); Home and End jump; Enter or Space chooses */
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); e.stopPropagation(); close(true); return; }
      var list = tiles(), i = list.indexOf(document.activeElement), to = -1, n = list.length;
      if (i < 0) return;
      var voidOn = list[n - 1].classList.contains('th-void'), reg = voidOn ? n - 1 : n, cols = 1;
      while (cols < reg && list[cols].offsetTop === list[0].offsetTop) cols++;
      if (e.key === 'ArrowRight') to = Math.min(n - 1, i + 1);
      else if (e.key === 'ArrowLeft') to = Math.max(0, i - 1);
      else if (e.key === 'ArrowDown') to = i >= reg ? i : (i + cols < reg ? i + cols : (voidOn ? n - 1 : i));
      else if (e.key === 'ArrowUp') to = i >= reg ? Math.floor((reg - 1) / cols) * cols : (i >= cols ? i - cols : i);
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = n - 1;
      if (to < 0) return;
      e.preventDefault(); e.stopPropagation();
      list.forEach(function (r, k) { r.tabIndex = k === to ? 0 : -1; });
      list[to].focus();
    });
    grid.addEventListener('pointerover', function (e) {
      if (e.pointerType === 'touch') return;
      var r = e.target.closest && e.target.closest('.th-tile');
      if (r) preview(r.getAttribute('data-key'), 240);
    });
    grid.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch' && !grid.contains(document.activeElement)) unpreview(false); });
    grid.addEventListener('focusin', function (e) {
      var r = e.target.closest && e.target.closest('.th-tile');
      if (r && r.matches(':focus-visible')) preview(r.getAttribute('data-key'), 160);
    });
    grid.addEventListener('focusout', function (e) { if (!e.relatedTarget || !grid.contains(e.relatedTarget)) unpreview(false); });
    /* leaving by Tab closes it */
    panel.addEventListener('focusout', function (e) {
      var to = e.relatedTarget;
      if (to && !panel.contains(to) && to !== btn && isOpen()) close(false);
    });
    panel.addEventListener('click', function (e) {
      e.stopPropagation();
      if (e.target.closest('.th-done')) { close(true); return; }
      var row = e.target.closest('.th-tile');
      if (!row) return;
      var key = row.getAttribute('data-key');
      clearTimeout(pvT);
      markPreview(null);
      var rect = (panel.classList.contains('is-sheet') ? row.querySelector('.th-mini') || row : btn).getBoundingClientRect();
      switchTo(key, rect.left + rect.width / 2, rect.top + rect.height / 2);
      capFor(key);
      /* the picker stays open: choose, compare, choose again */
    });
    T.swipe(panel, { dir: 'down', grab: '.ps-sheet-grab, .th-head', onClose: function () { close(false); },
      enabled: function () { return isOpen() && panel.classList.contains('is-sheet'); } });
    document.addEventListener('click', function () { if (isOpen()) close(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) close(true); });
    addEventListener('resize', function () { if (isOpen()) placePanel(); }, { passive: true });
    window.addEventListener('resize', function () { if (bgKey && MO.reduced() && BG[bgKey]) BG[bgKey](0); });
    /* reduced motion is live: a living room stops (one still frame) or starts again the moment it changes */
    MO.onReduced(function () { var k = current(); stopBg(); startBg(k); });
    startBg(current());
  }

  build();
  PS._pickerReady({
    toggle: toggle, open: openPanel, close: close, isOpen: isOpen, findVoid: findVoid, switchTo: switchTo,
    room: function (key) { stopBg(); startBg(key); },
    place: function () { if (isOpen()) placePanel(); }
  });
})();
