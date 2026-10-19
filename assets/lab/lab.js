/* P.S. Lab v3.2: the page chrome of /experiments, moved verbatim from experiments.html (Rev 047): the Window stills
   (LAB_POSTER), covers, open, scroll progress, the registry (LAB), the Window, numerals and the touched tracker, the
   directory and its bar, the plinths, theme repaint, finishing counts, slider fill, deep links, the tab title, the
   Index, the dial under 1024px and the verdict tick. Runs deferred, after theme.js and canvas.js. */
(function () {
    /* a still of a Window drawing, for a tile or a cover: the poster, cloned with its ids made unique so its clips resolve */
    window.LAB_POSTER = function (vp, sfx) {
      var src = document.querySelector('#vitrine .ps3d-poster[data-vp="' + vp + '"]'); if (!src) return null;
      var t = document.createElement('div');
      t.innerHTML = src.outerHTML.replace(/(\sid="|url\(#|href="#)([A-Za-z][\w-]*)/g, function (m, a, id) { return a + id + sfx; });
      var c = t.firstElementChild; if (!c) return null;
      c.removeAttribute('data-vp'); c.removeAttribute('data-reg'); c.setAttribute('class', 'ps3d-poster x-poster');
      return c;
    };
    try { Array.prototype.forEach.call(document.querySelectorAll('#waysIn .way-still'), function (a) {
      var c = window.LAB_POSTER(a.getAttribute('data-still'), 'w'); if (c) a.insertBefore(c, a.firstChild);
    }); } catch (e) {}
  })();
(function () {
  /* ---------- covers: a large machine with a Window drawing shows it on its cover (the same poster, its ids made unique) ---------- */
  try {
    if (window.LAB_POSTER) Array.prototype.forEach.call(document.querySelectorAll('.x-obj[data-still]'), function (o) {
      var c = window.LAB_POSTER(o.getAttribute('data-still'), 'c'); if (c) o.appendChild(c);
    });
  } catch (ecv) {}


  /* ---------- open: no boot screen. labopen fires exactly once, when the document is ready ---------- */
  try {
    var labOpened = false;
    var labOpen = function () { if (labOpened) return; labOpened = true; try { window.dispatchEvent(new Event('labopen')); } catch (e) {} };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', labOpen);
    else setTimeout(labOpen, 0);
  } catch (eb1) {}

  /* ---------- scroll progress (only where the compositor cannot drive it) ---------- */
  try {
    if (!(window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()'))) {
      var prg = document.getElementById('progress'), prgQ = 0;
      window.addEventListener('scroll', function () {
        if (prgQ) return;
        prgQ = requestAnimationFrame(function () {
          prgQ = 0;
          var hh = document.documentElement.scrollHeight - innerHeight;
          prg.style.transform = 'scaleX(' + (hh > 0 ? Math.min(1, scrollY / hh) : 0) + ')';
        });
      }, { passive: true });
    }
  } catch (eb2) {}

  /* ---------- lab registry: wings, ids, one navigator ---------- */
  var LAB = { exps: [], wings: [], wingOf: [], RM: false, apply: null, onSpy: null, openIndex: null, closeIndex: null,
              cancelDeal: null, ixCols: null, stuck: false, spyWing: -1, filter: -1, paint: null, countText: '47 of 47 machines' };
  /* the wing names in sentence case, keyed by their uppercase form so either spelling of .wt resolves */
  var LAB_WMAP = { 'THE MARQUEE': 'The marquee', 'THE BOARDROOM': 'The boardroom', 'CAPITAL': 'Capital', 'THE MIND': 'The mind', 'OTHER PEOPLE': 'Other people', 'THE STADIUM': 'The stadium', 'TIME': 'Time', 'TWENTY SLOTS': 'Twenty slots', 'THE PIT': 'The pit', 'THE CORNER OFFICE': 'The corner office', 'THE FOUNDRY': 'The foundry', 'THE LAST MILE': 'The last mile' };
  var LAB_RN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'];
  try {
    /* the page width without a classic scrollbar, so full-bleed bands can share the nav's frame */
    var labPW = function () { document.documentElement.style.setProperty('--pw', document.documentElement.clientWidth + 'px'); };
    labPW(); window.addEventListener('resize', labPW);
  } catch (epw) {}
  try {
    try { LAB.RM = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var labW = -1;
    Array.prototype.forEach.call(document.querySelectorAll('.wing-div, .exp'), function (el) {
      if (el.classList.contains('wing-div')) {
        labW++;
        var raw = (el.querySelector('.wt') || {}).textContent || ''; raw = raw.replace(/[“”]/g, '').trim();
        var m = ((el.querySelector('.wno') || {}).textContent || '').match(/^\s*WING\s+([IVX]+)/i);
        var nm = LAB_WMAP[raw.toUpperCase()] || raw, rn = m ? m[1].toUpperCase() : LAB_RN[labW];
        if (!el.getAttribute('data-wing')) el.setAttribute('data-wing', String(labW + 1));
        if (!el.id) el.id = 'wing-' + (labW + 1);
        LAB.wings.push({ el: el, i: labW, n: 0, name: nm, roman: rn, label: 'Wing ' + rn + ' · ' + nm });
      } else {
        LAB.exps.push(el); LAB.wingOf.push(labW);
        if (labW >= 0) { LAB.wings[labW].n++; if (!el.getAttribute('data-wing')) el.setAttribute('data-wing', String(labW + 1)); }
      }
    });
    LAB.exps.forEach(function (x, i) { x.id = x.id || 'exp-' + (i + 1); });
    /* layout top, ignoring the reveal transform, so a jump lands where the card will settle */
    LAB.top = function (el) { var y = 0, n = el; while (n) { y += n.offsetTop; n = n.offsetParent; } return y; };
    /* Land: an instant jump under the directory, a foil pulse, focus on the first h2 or h3 (PS.land in theme.js) */
    LAB.land = function (el, o) {
      if (!el) return;
      if (el.classList.contains('exp') || el.classList.contains('wing-div')) el.classList.add('in');
      Array.prototype.forEach.call(el.querySelectorAll('.rv'), function (r) { r.classList.add('in'); r.classList.remove('rv-wait'); });
      if (window.PS && PS.land) { PS.land(el, o); return; }
      try { el.scrollIntoView({ block: 'start', behavior: 'instant' }); } catch (e) { el.scrollIntoView(true); }
      var h = el.querySelector('h2, h3');
      if (h && (!o || o.focus !== false)) { if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); try { h.focus({ preventScroll: true }); } catch (e) {} }
    };
    /* a short glide (the filter keeps your place): smooth under 1.5 screens, otherwise the same instant jump */
    LAB.scrollTo = function (el) {
      if (el.classList.contains('exp') || el.classList.contains('wing-div')) el.classList.add('in');
      if (window.PS && PS.scrollTo) { PS.scrollTo(el); return; }
      window.scrollTo(0, Math.max(0, LAB.top(el) - (innerWidth <= 720 ? 76 : 84)));
    };
    /* every machine answers to its number (#exp-45) and to a permanent alias from its card's data-m (#m-frontier), so a later
       reorder breaks no link. LAB.find('exp-45'), LAB.find('#m-frontier') and LAB.find(44) all give 44. */
    LAB.find = function (s) {
      if (typeof s === 'number') return s;
      s = String(s || '').replace(/^#/, '');
      var m = /^m-([a-z0-9-]+)$/.exec(s);
      if (m) { var x = document.querySelector('.exp[data-m="' + m[1] + '"]'); return x ? LAB.exps.indexOf(x) : -1; }
      var n = parseInt(s.replace(/^\D+/, ''), 10);
      return isNaN(n) ? -1 : n - 1;
    };
    LAB.go = function (i, o) {
      if (typeof i === 'string') i = LAB.find(i); /* LAB.go('exp-45'), LAB.go('m-frontier') and LAB.go(44) land on the same machine */
      var el = LAB.exps[i]; if (!el) return;
      var w = LAB.wingOf[i];
      if (el.style.display === 'none' || (w >= 0 && LAB.wings[w].el.style.display === 'none')) { if (LAB.apply) LAB.apply(-1); }
      if (LAB.closeIndex) LAB.closeIndex(false);
      /* the lazy machines listen for this, so a jump never lands on an empty frame */
      try { window.dispatchEvent(new CustomEvent('labgo', { detail: { i: i, el: el } })); } catch (e) {}
      LAB.land(el);
      el.classList.add('exp-flash'); clearTimeout(el._fl);
      el._fl = setTimeout(function () { el.classList.remove('exp-flash'); }, 2200);
      try { history.replaceState(null, '', '#' + (o && o.alias && el.getAttribute('data-m') ? 'm-' + el.getAttribute('data-m') : el.id)); } catch (e) {}
    };
    /* any in-page link to a machine goes through the one navigator */
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#exp-"], a[href^="#m-"]') : null;
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.closest('#bench, #vitrine')) return;
      var hr = a.getAttribute('href'), i = LAB.find(hr);
      if (i < 0 || !LAB.exps[i]) return;
      e.preventDefault(); LAB.go(i, { alias: hr.indexOf('#m-') === 0 });
    });
  } catch (elab) {}

  /* ---------- the window: six machines, one at a time ---------- */
  try {
    var vit = document.getElementById('vitrine');
    var vSlides = [].slice.call(vit.querySelectorAll('.vit-slide')), VN = vSlides.length;
    var vRM = LAB.RM, vFINE = false;
    try { vFINE = matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (e) {}
    var vRail = document.getElementById('vitRail'), vPlay = document.getElementById('vitPlay');
    var vLive = document.getElementById('vitLive'), vNum = document.getElementById('vitN');
    var vNow = vit.querySelector('.vit-now'), vSpot = vit.querySelector('.vit-spot');
    var VS = { cur: 0, started: false, active: false, introDone: false, story: false, wait: !vRM, playing: !vRM, hover: false, focus: false,
      onScreen: false, ratio: 0, visible: document.visibilityState === 'visible', busy: false, queued: null, queuedSrc: null,
      elapsed: 0, dwell: 12000, t0: 0, outSlide: null, outT0: 0, run: false, raf: 0, last: 0, swipeAt: -1e9,
      sx: 0, sy: 0, tx: 0, ty: 0, cx: 0, cy: 0, wx: -1e9, wy: -1e9, lastPtr: -1e9, P: null, pd: null,
      holdAt: 0, fz: false, lastP: -1, W: 0, H: 0 };

    /* colors: read once per theme, never per frame */
    var VC = { on: [244, 241, 232], dk: [14, 13, 12], ac: [255, 77, 0], lab: [255, 77, 0] };
    function vHex(v, fb) {
      v = (v || '').trim();
      if (v.charAt(0) === '#') {
        if (v.length === 4) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
        var r = parseInt(v.slice(1, 3), 16), g = parseInt(v.slice(3, 5), 16), b = parseInt(v.slice(5, 7), 16);
        return isNaN(r + g + b) ? fb : [r, g, b];
      }
      var m = v.match(/\d+(\.\d+)?/g);
      return m && m.length >= 3 ? [+m[0], +m[1], +m[2]] : fb;
    }
    function vReadColors() {
      var cs = getComputedStyle(document.documentElement);
      VC.on = vHex(cs.getPropertyValue('--on-dark'), VC.on);
      VC.dk = vHex(cs.getPropertyValue('--dark'), VC.dk);
      try { VC.ac = ACCRGB(); } catch (e) {}
      /* accent nudged toward the light ink, for small canvas text on the dark stage */
      VC.lab = [0, 1, 2].map(function (i) { return Math.round(VC.ac[i] * .82 + VC.on[i] * .18); });
    }
    function vRgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
    function vOn(a) { return vRgba(VC.on, a); }
    function vDk(a) { return vRgba(VC.dk, a); }
    function vAc(a) { return vRgba(VC.ac, a); }
    function vAcT(a) { return vRgba(VC.lab, a); }
    function vE(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function vEo(x) { return 1 - Math.pow(1 - x, 3); }
    function vSeg(tt, a, b) { return Math.max(0, Math.min(1, (tt - a) / (b - a))); }
    function vLbl(x, s, px, py, al, col, size) {
      x.font = '600 ' + Math.max(10, size || 10) + 'px "Helvetica Neue", Helvetica, Arial, sans-serif'; x.textAlign = al || 'left'; x.textBaseline = 'alphabetic';
      x.fillStyle = col;
      var ls = 'letterSpacing' in x;
      if (ls) x.letterSpacing = '1.5px';
      x.fillText(s, px, py);
      if (ls) x.letterSpacing = '0px';
    }

    /* conviction: a levered fund's NAV walks into the margin line */
    var VNAV = (function () {
      var K = [[0, 100], [6, 104], [12, 101], [18, 92], [24, 80], [30, 66], [34, 57], [38, 62], [43, 69], [48, 73]], p = [];
      for (var i = 0; i <= 48; i++) {
        var j = 0; while (j < K.length - 2 && K[j + 1][0] < i) j++;
        var a = K[j], b = K[j + 1], v = a[1] + (b[1] - a[1]) * (i - a[0]) / (b[0] - a[0]);
        if (i % 8 !== 0 && i !== 34) v += 1.1 * Math.sin(i * 2.3);
        if (i === 34) v = 57;
        p.push(v);
      }
      return p;
    })();
    var VT34 = (function () { var lo = 0, hi = 5000; for (var n = 0; n < 40; n++) { var m = (lo + hi) / 2; if (vE(m / 5000) < 34 / 48) lo = m; else hi = m; } return lo; })();
    function vNav(x, W, H, tt) {
      var L = 16, R = W - 16, T = 30, B = H - 30;
      function X(i) { return L + (R - L) * i / 48; }
      function Y(v) { return B - (v - 40) / 70 * (B - T); }
      x.lineWidth = 1; x.strokeStyle = vOn(.06);
      for (var g = 1; g <= 3; g++) { var gy = Math.round(T + (B - T) * g / 4) + .5; x.beginPath(); x.moveTo(L, gy); x.lineTo(R, gy); x.stroke(); }
      for (var d = 0; d < 6; d++) vLbl(x, 'D' + (d + 1), X(4 + 8 * d), H - 12, 'center', vOn(.35));
      vLbl(x, 'NAV, SIX TRADING DAYS', L, 20, 'left', vOn(.45));
      var my = Math.round(Y(58)) + .5;
      x.strokeStyle = vAc(.9); x.lineWidth = 1; x.setLineDash([5, 5]);
      x.beginPath(); x.moveTo(L, my); x.lineTo(R, my); x.stroke(); x.setLineDash([]);
      vLbl(x, 'THE MARGIN LINE', L, my - 7, 'left', vAcT(1));
      var k = vRM ? 1 : vE(vSeg(tt, 0, 5000)), f = k * 48, n = Math.min(48, Math.floor(f)), fr = f - n;
      x.strokeStyle = vOn(.88); x.lineWidth = 1.6; x.lineJoin = 'round'; x.lineCap = 'round';
      x.beginPath(); x.moveTo(X(0), Y(VNAV[0]));
      for (var i = 1; i <= n; i++) x.lineTo(X(i), Y(VNAV[i]));
      var hx = X(n), hy = Y(VNAV[n]);
      if (n < 48 && fr > 0) { hx = X(n + fr); hy = Y(VNAV[n] + (VNAV[n + 1] - VNAV[n]) * fr); x.lineTo(hx, hy); }
      x.stroke();
      x.fillStyle = vOn(.9); x.beginPath(); x.arc(hx, hy, 3, 0, 6.2832); x.fill();
      var cx = X(34), cy = Y(57), ga = x.globalAlpha;
      function ring(r, a) { x.globalAlpha = ga * a; x.strokeStyle = vAc(1); x.lineWidth = 1.5; x.beginPath(); x.arc(cx, cy, r, 0, 6.2832); x.stroke(); x.globalAlpha = ga; }
      function mcall(a) { x.globalAlpha = ga * a; vLbl(x, 'MARGIN CALL', cx + 12, cy + 22, 'left', vAcT(1)); x.globalAlpha = ga; }
      if (vRM) { ring(18, .6); mcall(1); }
      else if (tt >= VT34) { var s = vSeg(tt, VT34, VT34 + 900); if (s < 1) ring(18 * vEo(s), 1 - s); mcall(vSeg(tt, VT34, VT34 + 200)); }
      var P = VS.P;
      if (P && P.in && !vRM && vSlides[VS.cur].getAttribute('data-v') === 'nav') {
        var px = Math.max(L, Math.min(R, P.x)), j = Math.max(0, Math.min(n, Math.round((px - L) / (R - L) * 48)));
        x.strokeStyle = vOn(.25); x.lineWidth = 1;
        x.beginPath(); x.moveTo(Math.round(px) + .5, T - 4); x.lineTo(Math.round(px) + .5, B); x.stroke();
        x.strokeStyle = vAc(1); x.lineWidth = 1.5; x.beginPath(); x.arc(X(j), Y(VNAV[j]), 4, 0, 6.2832); x.stroke();
        vLbl(x, 'DAY ' + (1 + Math.min(5, Math.floor(j / 8))) + ' · NAV ' + Math.round(VNAV[j]) + '%', R, 20, 'right', vOn(.8));
      }
    }

    /* the three doors: pick one, the host opens a goat, the other door wins */
    function vDoors(x, W, H, tt) {
      var dh = H * .58, dw = dh * .5, pitch = dw * 1.55, cy = H * .48;
      var sc = Math.min(1, W * .9 / (pitch * 2 + dw)); dh *= sc; dw *= sc; pitch *= sc;
      var top = cy - dh / 2, bot = cy + dh / 2, ga = x.globalAlpha;
      function cxOf(d) { return W / 2 + (d - 1) * pitch; }
      x.strokeStyle = vOn(.15); x.lineWidth = 1;
      x.beginPath(); x.moveTo(cxOf(0) - dw * .9, Math.round(bot) + .5); x.lineTo(cxOf(2) + dw * .9, Math.round(bot) + .5); x.stroke();
      var op = [0, vE(vSeg(tt, 3800, 4800)), vE(vSeg(tt, 1600, 2600))];
      for (var d = 0; d < 3; d++) {
        var cx = cxOf(d), l = cx - dw / 2, e = op[d];
        x.fillStyle = vDk(1); x.fillRect(l, top, dw, dh);
        x.strokeStyle = vOn(.2); x.lineWidth = 1; x.strokeRect(l + .5, top + .5, dw - 1, dh - 1);
        if (d === 1 && e > 0) {
          x.save(); x.beginPath(); x.rect(l, top, dw, dh); x.clip();
          var gr = x.createRadialGradient(cx, cy, 0, cx, cy, dw * .7);
          gr.addColorStop(0, vAc(.35)); gr.addColorStop(1, vAc(0));
          x.fillStyle = gr; x.fillRect(l, top, dw, dh);
          x.fillStyle = vAc(1); x.beginPath(); x.arc(cx, cy, dw * .22, 0, 6.2832); x.fill();
          x.restore();
        }
        var lw = dw * (1 - .86 * e), sh = dh * .04 * e;
        x.beginPath(); x.moveTo(l, top); x.lineTo(l + lw, top + sh); x.lineTo(l + lw, bot - sh); x.lineTo(l, bot); x.closePath();
        x.fillStyle = vDk(1); x.fill(); x.fillStyle = vOn(.06); x.fill();
        x.strokeStyle = vOn(.7); x.lineWidth = 1.5; x.lineJoin = 'miter'; x.stroke();
        if (e < 1) {
          x.save(); x.translate(l, 0); x.scale(Math.max(.001, lw / dw), 1);
          x.globalAlpha = ga * (1 - e);
          x.fillStyle = vOn(.5); x.font = '400 ' + Math.round(dh * .14) + 'px Georgia, serif';
          x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(d + 1), dw / 2, top + dh * .22);
          x.fillStyle = vOn(.7); x.beginPath(); x.arc(dw * .78, top + dh * .55, 2, 0, 6.2832); x.fill();
          x.restore();
        }
      }
      var u = vEo(vSeg(tt, 600, 1400));
      if (u > 0) {
        var ux = cxOf(0) + (cxOf(1) - cxOf(0)) * vE(vSeg(tt, 4000, 4600)), uy = Math.round(bot) + 12, hw = dw * .5 * u;
        x.fillStyle = vAc(1); x.fillRect(ux - hw, uy, hw * 2, 2);
        x.globalAlpha = ga * u; vLbl(x, 'YOUR PICK', ux, uy + 20, 'center', vAcT(1)); x.globalAlpha = ga;
      }
      var sw = vSeg(tt, 2800, 3600);
      if (sw > 0) {
        x.globalAlpha = ga * sw; x.fillStyle = vOn(.85); x.font = 'italic 400 16px Georgia, serif';
        x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillText('Switch?', (cxOf(0) + cxOf(1)) / 2, top - 18);
        x.globalAlpha = ga;
      }
    }

    /* the email: pass on Netflix, then watch the fork */
    function vEmail(x, W, H, tt) {
      var ga = x.globalAlpha, w = Math.min(W * .62, 300), h = w * .46, ccx = W * .42, ccy = H * .4, rot = -2 * Math.PI / 180;
      var pad = Math.max(12, w * .055), ph = 22, pwB = 48, pwP = 56;
      var buyX = w / 2 - pad - pwB / 2, passX = buyX - pwB / 2 - 8 - pwP / 2, pY = h / 2 - pad - ph / 2;
      var cs = Math.cos(rot), sn = Math.sin(rot);
      function pill(cxp, wd, s, filled) {
        x.beginPath();
        if (x.roundRect) x.roundRect(cxp - wd / 2, pY - ph / 2, wd, ph, 11); else x.rect(cxp - wd / 2, pY - ph / 2, wd, ph);
        if (filled) { x.fillStyle = vOn(.85); x.fill(); } else { x.strokeStyle = vOn(.5); x.lineWidth = 1; x.stroke(); }
        vLbl(x, s, cxp + .8, pY + 3.2, 'center', filled ? vDk(.95) : vOn(.8));
      }
      if (tt < 3000) {
        var a = vSeg(tt, 0, 600), out = vSeg(tt, 2400, 3000), dx = -40 * vE(out), rise = (1 - vEo(a)) * 10;
        x.save(); x.globalAlpha = ga * vEo(a) * (1 - out);
        x.translate(ccx + dx, ccy + rise); x.rotate(rot);
        x.fillStyle = vDk(1); x.fillRect(-w / 2, -h / 2, w, h);
        x.fillStyle = vOn(.05); x.fillRect(-w / 2, -h / 2, w, h);
        x.strokeStyle = vOn(.6); x.lineWidth = 1; x.strokeRect(-w / 2 + .5, -h / 2 + .5, w - 1, h - 1);
        var fs = Math.round(h * .17), sy = -h / 2 + pad + fs * .8;
        x.fillStyle = vOn(.92); x.font = '700 ' + fs + 'px Georgia, serif'; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
        x.fillText('Re: $50,000,000', -w / 2 + pad, sy);
        var hl = Math.round(sy + fs * .45) + .5;
        x.strokeStyle = vOn(.18); x.beginPath(); x.moveTo(-w / 2 + pad, hl); x.lineTo(w / 2 - pad, hl); x.stroke();
        x.fillStyle = vOn(.12); x.fillRect(-w / 2 + pad, hl + 10, (w - pad * 2) * .72, 3); x.fillRect(-w / 2 + pad, hl + 19, (w - pad * 2) * .46, 3);
        pill(passX, pwP, 'PASS', tt >= 2000 + 100);
        pill(buyX, pwB, 'BUY', false);
        x.restore();
        var cu = vSeg(tt, 800, 2000);
        if (cu > 0) {
          var tx = ccx + passX * cs - pY * sn, ty = ccy + passX * sn + pY * cs;
          var sx0 = W * .1, sy0 = H * .9, e = vE(cu), kx = sx0 + (tx - sx0) * e, ky = sy0 + (ty - sy0) * e;
          if (tt >= 2000) { var cl = vSeg(tt, 2000, 2350); x.globalAlpha = ga * (1 - cl) * .8; x.strokeStyle = vOn(.7); x.lineWidth = 1; x.beginPath(); x.arc(kx, ky, 6 + 12 * vEo(cl), 0, 6.2832); x.stroke(); }
          x.globalAlpha = ga * (1 - out);
          x.save(); x.translate(kx, ky);
          x.beginPath(); x.moveTo(0, 0); x.lineTo(0, 15); x.lineTo(3.8, 11.4); x.lineTo(6.6, 17.4); x.lineTo(9.2, 16.2); x.lineTo(6.4, 10.4); x.lineTo(11.2, 10.4); x.closePath();
          x.fillStyle = vOn(.92); x.fill(); x.strokeStyle = vDk(.9); x.lineWidth = 1; x.stroke();
          x.restore(); x.globalAlpha = ga;
        }
        return;
      }
      var Fx = W * .38, Fy = H * .5, Sx = W * .12, s0 = vEo(vSeg(tt, 3000, 3500)), s1 = vE(vSeg(tt, 3400, 5800)), lb = vSeg(tt, 5500, 6000);
      x.font = '400 13px Georgia, serif'; x.fillStyle = vOn(.8); x.textAlign = 'left'; x.textBaseline = 'alphabetic';
      var cap = 'Re: $50,000,000'; x.fillText(cap, 16, 20);
      vLbl(x, ' · PASSED', 16 + x.measureText(cap).width + 4, 20, 'left', vOn(.5));
      x.strokeStyle = vOn(.45); x.lineWidth = 1.4; x.lineCap = 'round';
      x.beginPath(); x.moveTo(Sx, Fy); x.lineTo(Sx + (Fx - Sx) * s0, Fy); x.stroke();
      x.globalAlpha = ga * s0; vLbl(x, '2000', Sx, Fy + 20, 'left', vOn(.45)); x.globalAlpha = ga;
      function branch(Ex, Ey, col, lw) {
        var n = Math.round(60 * s1); if (n < 1) return null;
        var c1x = Fx + (Ex - Fx) * .45, c2x = Fx + (Ex - Fx) * .55, px = Fx, py = Fy;
        x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.moveTo(Fx, Fy);
        for (var i = 1; i <= n; i++) {
          var u = i / 60, iu = 1 - u;
          px = iu * iu * iu * Fx + 3 * iu * iu * u * c1x + 3 * iu * u * u * c2x + u * u * u * Ex;
          py = iu * iu * iu * Fy + 3 * iu * iu * u * Fy + 3 * iu * u * u * Ey + u * u * u * Ey;
          x.lineTo(px, py);
        }
        x.stroke();
        return [px, py];
      }
      if (s1 > 0) {
        var dn = branch(W * .9, H * .84, vOn(.75), 1.6), up = branch(W * .92, H * .12, vAc(1), 1.8);
        if (up) { x.fillStyle = vAc(1); x.beginPath(); x.arc(up[0], up[1], 2.6, 0, 6.2832); x.fill(); }
        if (lb > 0) {
          x.globalAlpha = ga * lb;
          vLbl(x, 'NETFLIX', W * .92, H * .12 + 22, 'right', vAcT(1));
          vLbl(x, 'BLOCKBUSTER', W * .9 - 14, H * .84 + 20, 'right', vOn(.6));
          x.fillStyle = vOn(.75); x.font = '400 20px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
          x.fillText('×', W * .9 + 9, H * .84 + 1);
          x.globalAlpha = ga;
        }
      }
      x.fillStyle = vOn(.8); x.beginPath(); x.arc(Fx, Fy, 2.6 * s0, 0, 6.2832); x.fill();
    }

    /* the acquirer: eight years of stacked deals, and the debt that pays for them */
    function vStack(x, W, H, tt) {
      var bw = Math.min(46, (W - 48) / 8), x0 = (W - bw * 8) / 2, base = H - 30, iw = bw * .62, SEG = [.8, .5, .28, .18];
      var gs = [], newest = -1, y;
      for (y = 0; y < 8; y++) { gs[y] = vRM ? 1 : vEo(vSeg(tt, 450 * y, 450 * y + 450)); if (gs[y] > 0) newest = y; }
      x.strokeStyle = vOn(.15); x.lineWidth = 1; x.beginPath(); x.moveTo(x0, Math.round(base) + .5); x.lineTo(x0 + bw * 8, Math.round(base) + .5); x.stroke();
      for (y = 0; y < 8; y++) {
        var cxm = x0 + y * bw + bw / 2;
        vLbl(x, 'Y' + (y + 1), cxm, H - 12, 'center', vOn(.4), 8.5);
        var g = gs[y]; if (g <= 0) continue;
        var nseg = Math.min(3, y) + 1, tot = H * (.10 + .075 * y) * g, hh = tot / nseg, yb = base;
        for (var c = 0; c < nseg; c++) {
          x.fillStyle = (y === newest && c === nseg - 1) ? vAc(1) : vOn(SEG[c]);
          x.fillRect(cxm - iw / 2, yb - hh, iw, Math.max(1, hh - 2));
          yb -= hh;
        }
      }
      if (newest >= 0) {
        var pts = [];
        for (y = 0; y <= newest; y++) pts.push([x0 + y * bw + bw / 2, base - H * (.08 + .06 * y)]);
        if (newest > 0 && gs[newest] < 1) { var p0 = pts[newest - 1], p1 = pts[newest], q = gs[newest]; pts[newest] = [p0[0] + (p1[0] - p0[0]) * q, p0[1] + (p1[1] - p0[1]) * q]; }
        var path = function () { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); };
        x.lineJoin = 'round'; x.lineCap = 'round';
        path(); x.strokeStyle = vDk(.85); x.lineWidth = 4; x.stroke();
        path(); x.strokeStyle = vOn(.45); x.lineWidth = 1.3; x.setLineDash([4, 4]); x.stroke(); x.setLineDash([]);
        var e = pts[pts.length - 1];
        x.fillStyle = vOn(.6); x.beginPath(); x.arc(e[0], e[1], 2.2, 0, 6.2832); x.fill();
        if (e[0] + iw / 2 + 44 < W) vLbl(x, 'DEBT', e[0] + iw / 2 + 8, e[1] + 3, 'left', vOn(.55)); else vLbl(x, 'DEBT', e[0] - iw / 2 - 8, e[1] - 8, 'right', vOn(.55));
      }
      vLbl(x, 'EIGHT YEARS, ONE PLAYBOOK', 16, 20, 'left', vOn(.45));
    }

    /* frontier: three rivals climb in steps, your lab catches up one launch at a time; the dashed lines are the risk levels */
    var VFR = { you: [55.4, 55.4, 59.6, 59.6, 66.8, 66.8, 78.5, 78.5, 88.0],
      riv: [[58.0, 61.3, 69.6, 72.9, 76.2, 79.5, 82.8, 86.1, 89.4], [56.0, 59.1, 62.2, 70.3, 73.4, 76.5, 79.6, 82.7, 85.8],
        [50.0, 53.8, 57.6, 67.6, 71.4, 75.2, 79.0, 82.8, 86.6]] };
    function vFront(x, W, H, tt) {
      var L = 16, R = W - 16, T = 30, B = H - 30, ga = x.globalAlpha, i;
      function X(k) { return L + (R - L) * k / 8; }
      function Y(v) { return B - (v - 45) / 50 * (B - T); }
      [[60, 'LEVEL 2'], [72, 'LEVEL 3'], [84, 'LEVEL 4']].forEach(function (lv) {
        var y = Math.round(Y(lv[0])) + .5;
        x.strokeStyle = vOn(.16); x.lineWidth = 1; x.setLineDash([3, 5]);
        x.beginPath(); x.moveTo(L, y); x.lineTo(R, y); x.stroke(); x.setLineDash([]);
        vLbl(x, lv[1], L, y - 6, 'left', vOn(.4));
      });
      for (i = 0; i < 4; i++) vLbl(x, 'Y' + (i + 1), (X(2 * i) + X(2 * i + 2)) / 2, H - 12, 'center', vOn(.35));
      vLbl(x, 'THE FRONTIER', L, 20, 'left', vOn(.45));
      var f = (vRM ? 1 : vE(vSeg(tt, 200, 4200))) * 8;
      function step(a, col, lw) {
        x.strokeStyle = col; x.lineWidth = lw; x.lineJoin = 'round'; x.lineCap = 'round';
        x.beginPath(); x.moveTo(X(0), Y(a[0]));
        for (var k = 1; k <= 8 && f > k - 1; k++) {
          var e = Math.min(1, f - (k - 1));
          x.lineTo(X(k - 1) + (X(k) - X(k - 1)) * e, Y(a[k - 1]));
          if (e >= 1) x.lineTo(X(k), Y(a[k]));
        }
        x.stroke();
      }
      step(VFR.riv[2], vOn(.34), 1.2); step(VFR.riv[1], vOn(.46), 1.2); step(VFR.riv[0], vOn(.62), 1.4);
      step(VFR.you, vAc(1), 2.2);
      x.fillStyle = vAc(1);
      for (i = 2; i <= 8; i += 2) if (f >= i) { x.beginPath(); x.arc(X(i), Y(VFR.you[i]), 3, 0, 6.2832); x.fill(); }
      var la = vRM ? 1 : vSeg(tt, 4300, 4800);
      if (la > 0) { x.globalAlpha = ga * la; vLbl(x, 'YOU 88.0 · TOP 89.4', R, 20, 'right', vAcT(1)); x.globalAlpha = ga; }
    }

    /* two seventy: every contest in one line, from one side's safest to the other's; the one that crosses 270 is foil */
    var VSN = { a: [22, 18, 12, 19, 11, 9, 15, 7, 13, 10, 16, 6, 14, 20, 5, 11, 10, 17, 15, 24, 8],
      b: [4, 15, 11, 17, 6, 21, 9, 8, 19, 12, 11, 8, 19, 6, 7, 3, 10, 6, 13, 10, 11, 15, 15], tip: 19 };
    function vSnake(x, W, H, tt) {
      var L = 16, R = W - 16, s = (R - L) / 538, h = Math.round(Math.max(18, Math.min(34, H * .12)));
      var top = Math.round(H * .5 - h / 2), ga = x.globalAlpha, na = VSN.a.length, n = na + VSN.b.length;
      var k = vRM ? n : vE(vSeg(tt, 200, 3400)) * n, xx = L, tipX = L, i;
      vLbl(x, '538 ELECTORS, 270 TO WIN', L, 20, 'left', vOn(.45));
      for (i = 0; i < n; i++) {
        var v = i < na ? VSN.a[i] : VSN.b[i - na], w = v * s, g = Math.max(0, Math.min(1, k - i));
        if (i === VSN.tip) tipX = xx + w / 2;
        if (g > 0) {
          var bw = Math.max(1, w * vEo(g) - 1);
          x.globalAlpha = ga * g;
          x.fillStyle = i === VSN.tip ? vAc(1) : i < na ? vOn(.8 - .017 * i) : vOn(.1);
          x.fillRect(xx + .5, top, bw, h);
          if (i >= na) {
            x.save(); x.beginPath(); x.rect(xx + .5, top, bw, h); x.clip();
            x.strokeStyle = vOn(.32); x.lineWidth = 1; x.beginPath();
            for (var hx = xx - h; hx < xx + w; hx += 5) { x.moveTo(hx, top + h); x.lineTo(hx + h, top); }
            x.stroke(); x.restore();
          }
          x.globalAlpha = ga;
        }
        xx += w;
      }
      var mx = Math.round(L + 270 * s) + .5, reached = k >= VSN.tip + 1;
      x.strokeStyle = reached ? vAc(1) : vOn(.6); x.lineWidth = 1; x.setLineDash([3, 3]);
      x.beginPath(); x.moveTo(mx, top - 18); x.lineTo(mx, top + h + 8); x.stroke(); x.setLineDash([]);
      x.font = '400 15px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      x.fillStyle = reached ? vAcT(1) : vOn(.85); x.fillText('270', mx, top - 24);
      vLbl(x, 'SAFE', L, top + h + 22, 'left', vOn(.4));
      vLbl(x, 'SAFE', R, top + h + 22, 'right', vOn(.4));
      var ta = vRM ? 1 : Math.max(0, Math.min(1, (k - VSN.tip - 1) / 2));
      if (ta > 0) { x.globalAlpha = ga * ta; vLbl(x, 'TIPPING POINT', tipX, top + h + 22, 'center', vAcT(1)); x.globalAlpha = ga; }
    }

    var VPER = { nav: 7000, doors: 8000, email: 9000, stack: 7000, frontier: 7500, snake: 8000 };
    var VSTORY = { nav: 6200, doors: 5600, email: 7000, stack: 5000, frontier: 4900, snake: 4600 };
    /* stretches of each period where the picture does not change: draw once, then skip */
    var VHOLD = { nav: [5000, 6500], doors: [4800, 7500], email: [6000, 8400], stack: [3600, 6500], frontier: [4900, 7000], snake: [4600, 7500] };
    var VFN = { nav: vNav, doors: vDoors, email: vEmail, stack: vStack, frontier: vFront, snake: vSnake };
    function vFit(c) {
      var d = Math.min(2, window.devicePixelRatio || 1), w = c.clientWidth, h = c.clientHeight;
      if (!w || !h) return null;
      var bw = Math.round(w * d), bh = Math.round(h * d);
      if (c.width !== bw || c.height !== bh) { c.width = bw; c.height = bh; c._hold = -1; }
      c._x = c.getContext('2d'); c._d = d; c._W = w; c._H = h;
      return c._x;
    }
    function vFree(sl) { var c = sl._c; if (c) { c.width = 0; c.height = 0; c._x = null; } }
    function vDraw(sl, t, lazy) {
      var c = sl._c; if (!c || sl._poster) return;
      var x = (c._x && c.width) ? c._x : vFit(c); if (!x) return;
      var k = sl._v, P = VPER[k], rest = vRM || VS.wait; t = Math.max(0, t);
      var tt = rest ? VSTORY[k] : t % P;
      var h = lazy && !rest && VHOLD[k], cyc = Math.floor(t / P);
      if (h && tt >= h[0] && tt < h[1] && !(k === 'nav' && VS.P)) { if (c._hold === cyc) return; c._hold = cyc; } else c._hold = -1;
      x.setTransform(c._d, 0, 0, c._d, 0, 0);
      x.clearRect(0, 0, c._W, c._H);
      x.globalAlpha = rest ? 1 : Math.min(1, tt / 300) * Math.min(1, (P - tt) / 500);
      try { VFN[k](x, c._W, c._H, tt, rest ? VSTORY[k] : t); }
      finally { x.globalAlpha = 1; x.setLineDash([]); }
    }
    function vFitDraw(sl, t) { vFit(sl._c); vDraw(sl, t); }

    function vSetActive(sl, on) {
      if (on) { sl.inert = false; sl.removeAttribute('inert'); sl.removeAttribute('aria-hidden'); sl.removeAttribute('tabindex'); }
      else { sl.inert = true; sl.setAttribute('inert', ''); sl.setAttribute('aria-hidden', 'true'); sl.setAttribute('tabindex', '-1'); }
    }
    function vRailSet() {
      var bs = vRail.children;
      for (var k = 0; k < bs.length; k++) {
        var on = k === VS.cur;
        if (on) bs[k].setAttribute('aria-current', 'true'); else bs[k].removeAttribute('aria-current');
        bs[k].classList.toggle('past', k < VS.cur);
        var fi = bs[k].querySelector('.vr-bar i');
        if (fi) fi.style.transform = on ? (vRM ? 'scaleX(1)' : 'scaleX(0)') : '';
      }
      VS.lastP = -1;
    }
    function vCenter() {
      if (!vFINE || vRM) return;
      VS.W = vit.clientWidth; VS.H = vit.clientHeight;
      var o = vSlides[VS.cur].querySelector('.vit-obj'), vr = vit.getBoundingClientRect(), r = o.getBoundingClientRect();
      if (!vr.width || !r.width) return;
      VS.cx = r.left - vr.left + r.width / 2; VS.cy = r.top - vr.top + r.height / 2;
      vSpot.style.left = VS.cx + 'px'; vSpot.style.top = VS.cy + 'px';
      if (VS.wx < -1e8) { VS.sx = VS.tx = VS.cx; VS.sy = VS.ty = VS.cy; }
      VS.wx = -1e9;
    }
    function vSpotStep(dt, now) {
      var W = VS.W || vit.clientWidth, H = VS.H || vit.clientHeight, tx = VS.tx, ty = VS.ty;
      if (now - VS.lastPtr > 3000) { tx = VS.cx; ty = VS.cy; }
      var k = 1 - Math.pow(.9, dt / 16.7);
      VS.sx += (tx - VS.sx) * k; VS.sy += (ty - VS.sy) * k;
      VS.still = Math.abs(tx - VS.sx) < .5 && Math.abs(ty - VS.sy) < .5;
      if (Math.abs(VS.sx - VS.wx) > .3 || Math.abs(VS.sy - VS.wy) > .3) {
        VS.wx = VS.sx; VS.wy = VS.sy;
        vSpot.style.transform = 'translate3d(' + (VS.sx - VS.cx).toFixed(1) + 'px,' + (VS.sy - VS.cy).toFixed(1) + 'px,0)';
      }
    }
    function vStopAuto() {
      VS.playing = false; vPlay.classList.add('paused');
      vPlay.setAttribute('aria-label', 'Play the window'); vit.setAttribute('data-playing', 'false');
    }
    function vLines(sl) {
      return [].map.call(sl.querySelectorAll('.vit-name .ln'), function (l) { return l.textContent; }).join(' ').replace(/\s+/g, ' ').trim();
    }
    function vActivate(k) {
      var sl = vSlides[k];
      VS.cur = k; vSetActive(sl, true);
      VS.t0 = performance.now(); VS.holdAt = VSTORY[sl._v]; VS.fz = false;
      if (W3.on) w3Show(k); else vFitDraw(sl, 0);
      sl.classList.add('on'); VS.active = true;
      vRailSet(); vCenter(); vSetRun();
    }
    function vGo(i, src) {
      i = (i + VN) % VN;
      if (src === 'user') vStopAuto();
      vWake();
      vit.classList.remove('vit-first'); vStoryOn();
      if (!VS.active) return;
      if (VS.busy) { VS.queued = (i === VS.cur) ? null : i; VS.queuedSrc = src; return; }
      if (i === VS.cur) return;
      var out = vSlides[VS.cur], inn = vSlides[i], hadFocus = out.contains(document.activeElement);
      var oldT0 = VS.t0;
      VS.cur = i; VS.elapsed = 0; VS.t0 = performance.now(); VS.holdAt = VSTORY[inn._v]; VS.fz = false;
      clearTimeout(inn._outT); inn.classList.remove('is-out');
      vSetActive(inn, true);
      if (W3.on) { if (!vRM) w3Snap(out); w3Show(i); vPosterSkip(); } else vFitDraw(inn, 0);
      out.classList.remove('on'); vSetActive(out, false);
      if (vRM) { vFree(out); }
      else {
        out.classList.add('is-out'); VS.outSlide = out; VS.outT0 = oldT0;
        out._outT = setTimeout(function () {
          out.classList.remove('is-out');
          if (VS.outSlide === out) VS.outSlide = null;
          if (vSlides[VS.cur] !== out) vFree(out);
        }, 840);
        VS.busy = true;
        setTimeout(function () {
          VS.busy = false;
          if (VS.queued !== null) { var q = VS.queued, qs = VS.queuedSrc; VS.queued = null; vGo(q, qs); }
        }, 900);
      }
      inn.classList.add('on');
      if (hadFocus) { try { inn.focus({ preventScroll: true }); } catch (e) {} }
      vRailSet(); vNum.textContent = '0' + (i + 1);
      vNow.textContent = inn.getAttribute('data-rail'); vit.setAttribute('data-cur', i);
      if (src === 'user' && !hadFocus) vLive.textContent = 'Window ' + (i + 1) + ' of 6. ' + vLines(inn) + '.';
      if (vRM && !W3.on) vFitDraw(inn, 0);
    }
    function vSetRun() {
      var want = !vRM && VS.active && VS.onScreen && VS.visible && !VS.sleep;
      if (want && !VS.run) { VS.run = true; VS.last = 0; VS.raf = requestAnimationFrame(vFrame); }
      else if (!want && VS.run) { VS.run = false; cancelAnimationFrame(VS.raf); }
      vit.setAttribute('data-loop', VS.run ? 'on' : 'off');
    }
    function vFrame(now) {
      if (!VS.run) return;
      var dt = VS.last ? Math.min(50, now - VS.last) : 16.7; VS.last = now;
      if (VS.introDone && VS.playing && !VS.hover && !VS.focus && VS.ratio >= .4 && !VS.busy) VS.elapsed += dt;
      var p = Math.min(1, VS.elapsed / VS.dwell);
      /* paused and settled: the miniature holds its story frame and nothing on the stage moves */
      var hold = VS.wait || (!VS.playing && !VS.busy && !VS.outSlide && now - VS.t0 >= VS.holdAt);
      if (VS.active) {
        var rb = vRail.children[VS.cur], pk = VS.cur + ':' + p.toFixed(4);
        if (rb && VS.lastP !== pk) { VS.lastP = pk; rb.querySelector('.vr-bar i').style.transform = 'scaleX(' + p.toFixed(4) + ')'; }
        if (hold) {
          if (!VS.fz) { var cs = vSlides[VS.cur]; if (!W3.on) vDraw(cs, VSTORY[cs._v]); VS.fz = true; }
        } else if (!W3.on) {
          VS.fz = false;
          vDraw(vSlides[VS.cur], now - VS.t0, true);
          if (VS.outSlide) vDraw(VS.outSlide, now - VS.outT0, true);
        } else VS.fz = false;
      }
      VS.still = true;
      if (vFINE && VS.active) vSpotStep(dt, now);
      if (p >= 1) { VS.dwell = 8000; vGo(VS.cur + 1, 'auto'); }
      /* paused and settled, the spot at rest: the stage sleeps until a hand or a control wakes it */
      if (hold && VS.fz && VS.still && !VS.P) { VS.sleep = true; VS.run = false; vit.setAttribute('data-loop', 'off'); return; }
      if (VS.run) VS.raf = requestAnimationFrame(vFrame);
    }
    function vWake() { if (VS.sleep) { VS.sleep = false; vSetRun(); } }
    /* the stage is served composed, so starting only shows the chrome that waited while the stage was off screen */
    function vStart() {
      if (VS.started || VS.ratio < .25) return;
      VS.started = true;
      vit.classList.remove('pre');
    }
    /* the story waits at rest until the stage is 60% in view, then eases out of rest (the drawing rewinds in 300ms) and plays */
    function vStoryOn() {
      if (VS.story) return;
      VS.story = true; VS.wait = false; VS.fz = false;
      if (!vRM) { VS.t0 = performance.now(); VS.elapsed = 0; setTimeout(function () { VS.introDone = true; }, 900); }
      if (W3.d && !W3.on) w3Mount(); else if (W3.on && !vRM) { w3Show(VS.cur); vPosterSkip(); }
      vWake();
    }

    /* ---------- the Window in 3D: six machines drawn in ink, in one shared WebGL view (PS3D, assets/3d).
       assets/3d/models/window.js holds the drawings, the view and the labels; it loads only when the Window comes near,
       and fills W3 in. The 2D painters above are the fallback. ---------- */
    var W3 = { on: false, tried: false, g: null, api: null, d: null };
    function w3Show(i) { if (W3.api) W3.api.show(i); }
    function w3Snap(sl) { if (W3.api) W3.api.snap(sl); }
    function w3Act() { if (W3.api) W3.api.act(); }
    function w3Tilt(nx, ny) { if (W3.api) W3.api.tilt(nx, ny); }
    function w3Init() {
      var P = window.PS3D;
      if (!P || P.support() === '2d') return;
      P.load(['gl']).then(function () { return P.need('window'); }).then(function (d) {
        if (W3.on || !d || typeof d.mount !== 'function') return;
        W3.d = d;
        /* the GL view mounts when the story starts (its first frame is the rest pose, so the poster hands over cleanly) */
        if (VS.story || vRM) w3Mount();
      }, function () {});
    }
    function w3Mount() {
      if (W3.on || !W3.d) return;
      W3.api = W3.d.mount(W3, { vit: vit, vSlides: vSlides, VS: VS, vRM: vRM, VSTORY: VSTORY, VNAV: VNAV,
        vE: vE, vEo: vEo, vSeg: vSeg, VT34: VT34, VSN: VSN, vStopAuto: vStopAuto });
      vPosterSkip();
    }
    /* a poster the live drawing has covered is not on screen: it leaves the contrast sweep until it shows again */
    function vPosterSkip() {
      vSlides.forEach(function (sl) {
        if (!sl._poster) return;
        if (W3.on && sl.querySelector('.vit-g')) sl._poster.setAttribute('data-aa-skip', ''); else sl._poster.removeAttribute('data-aa-skip');
      });
    }
    function w3Boot() {
      if (W3.tried) return;
      W3.tried = true;
      try { var cn = navigator.connection; if (cn && cn.saveData) return; } catch (e) {}
      if (window.PS3D) { w3Init(); return; }
      var go = function () {
        var sc = document.createElement('script'); sc.src = '/assets/3d/core.js?v=3'; sc.async = true;
        sc.onload = w3Init; (document.head || document.documentElement).appendChild(sc);
      };
      if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 500 }); else setTimeout(go, 120);
    }

    /* setup */
    vReadColors();
    vSlides.forEach(function (sl, k) {
      sl._v = sl.getAttribute('data-v'); sl._c = sl.querySelector('.vit-obj > canvas'); sl._poster = sl.querySelector('.ps3d-poster');
      sl._i = parseInt(sl.getAttribute('href').slice(5), 10) - 1;
      var wg = sl.querySelector('.vit-wing'), wi = LAB.wingOf[sl._i];
      if (wg && wi >= 0 && LAB.wings[wi]) wg.textContent = LAB.wings[wi].label;
      vSetActive(sl, false);
      var b = document.createElement('button'), bar = document.createElement('i'), no = document.createElement('span'), nm = document.createElement('span');
      b.type = 'button'; b.setAttribute('aria-label', '0' + (k + 1) + ' ' + sl.getAttribute('data-rail'));
      bar.className = 'vr-bar'; bar.appendChild(document.createElement('i'));
      no.className = 'vr-no'; no.textContent = '0' + (k + 1);
      nm.className = 'vr-nm'; nm.textContent = sl.getAttribute('data-rail');
      b.appendChild(bar); b.appendChild(no); b.appendChild(nm);
      b.addEventListener('click', function () { vGo(k, 'user'); });
      vRail.appendChild(b);
      sl.addEventListener('click', function (e) {
        if (performance.now() - VS.swipeAt < 350) { e.preventDefault(); return; }
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
        if (W3.on && sl === vSlides[VS.cur] && e.target.closest && e.target.closest('.vit-g')) { e.preventDefault(); w3Act(); return; }
        e.preventDefault(); LAB.go(sl._i);
      });
      sl.addEventListener('dragstart', function (e) { e.preventDefault(); });
    });
    /* slide 1 is served at rest (.on): it is active from the first frame, and nothing waits to animate it in */
    VS.cur = 0; VS.active = true; VS.t0 = performance.now();
    vSetActive(vSlides[0], true); vSlides[0].classList.add('on'); vit.classList.add('vit-first');
    vRailSet(); vNum.textContent = '01'; if (vNow) vNow.textContent = vSlides[0].getAttribute('data-rail');
    if (!vSlides[0]._poster) vFitDraw(vSlides[0], 0);
    (function () {
      var r = vit.getBoundingClientRect();
      if (!vRM && (r.bottom <= 0 || r.top >= (innerHeight || 800))) vit.classList.add('pre');
    })();
    /* phones: the slides clear the head by its measured height */
    var vHead = vit.querySelector('.vit-head');
    var vHeadH = function () {
      if (vHead) vit.style.setProperty('--head-h', vHead.offsetHeight + 'px');
      /* short phones size the stage from its tallest copy block, so the drawing keeps a real share of the screen */
      var th = 0; vSlides.forEach(function (sl) { var t = sl.querySelector('.vit-txt'); if (t) th = Math.max(th, t.offsetHeight); });
      if (th) vit.style.setProperty('--txt-h', th + 'px');
    };
    vHeadH();
    if ('ResizeObserver' in window && vHead) new ResizeObserver(vHeadH).observe(vHead); else window.addEventListener('resize', vHeadH);
    vPlay.addEventListener('click', function () {
      if (VS.playing) { vStopAuto(); VS.holdAt = 0; return; }
      if (VS.fz) VS.t0 = performance.now() - VSTORY[vSlides[VS.cur]._v];
      VS.fz = false; VS.playing = true; VS.elapsed = 0; VS.dwell = 8000; vWake();
      vPlay.classList.remove('paused'); vPlay.setAttribute('aria-label', 'Pause the window'); vit.setAttribute('data-playing', 'true');
    });
    document.getElementById('vitPrev').addEventListener('click', function () { vGo(VS.cur - 1, 'user'); });
    document.getElementById('vitNext').addEventListener('click', function () { vGo(VS.cur + 1, 'user'); });

    if (vRM) {
      vit.classList.add('vit-instant'); vit.classList.remove('pre');
      VS.started = true; VS.introDone = true; VS.playing = false; VS.wait = false;
      vPlay.hidden = true; vit.setAttribute('data-playing', 'false');
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          VS.onScreen = e.isIntersecting; VS.ratio = e.isIntersecting ? e.intersectionRatio : 0;
          document.documentElement.classList.toggle('vit-inview', VS.ratio >= .4);
          if (e.isIntersecting) w3Boot();
          if (VS.ratio >= .6) vStoryOn();
          vStart(); vSetRun();
        });
      }, { threshold: [0, .25, .4, .6] }).observe(vit);
    } else { VS.onScreen = true; VS.ratio = 1; w3Boot(); vStoryOn(); vStart(); vSetRun(); }
    document.addEventListener('visibilitychange', function () { VS.visible = document.visibilityState === 'visible'; vSetRun(); });

    vit.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { VS.hover = true; vWake(); } });
    vit.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { VS.hover = false; w3Tilt(0, 0); } });
    vit.addEventListener('focusin', function (e) {
      var fv = true; try { fv = e.target.matches(':focus-visible'); } catch (er) {}
      VS.focus = fv && e.target !== vPlay;
    });
    vit.addEventListener('focusout', function (e) { if (!vit.contains(e.relatedTarget)) VS.focus = false; });
    vit.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var k = e.key;
      if (k === 'ArrowRight') { e.preventDefault(); vGo(VS.cur + 1, 'user'); }
      else if (k === 'ArrowLeft') { e.preventDefault(); vGo(VS.cur - 1, 'user'); }
      else if (k === 'Home') { e.preventDefault(); vGo(0, 'user'); }
      else if (k === 'End') { e.preventDefault(); vGo(VN - 1, 'user'); }
    });
    vit.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      VS.pd = { x: e.clientX, y: e.clientY };
      /* iOS keeps the gyroscope behind a prompt: the first touch on the drawing asks for it, once, with no word on the stage */
      var tb = document.getElementById('vitTilt');
      if (tb && !tb.hidden && !VS.tiltAsked && e.target.closest && e.target.closest('.vit-obj')) { VS.tiltAsked = true; try { tb.click(); } catch (er) {} }
    });
    vit.addEventListener('pointerup', function (e) {
      var d = VS.pd; VS.pd = null;
      if (!d || e.pointerType === 'mouse') return;
      var dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (Math.abs(dx) > 48 && Math.abs(dx) > 1.4 * Math.abs(dy)) { VS.swipeAt = performance.now(); vGo(VS.cur + (dx < 0 ? 1 : -1), 'user'); }
    });
    vit.addEventListener('pointercancel', function () { VS.pd = null; });
    if (vFINE && !vRM) {
      vit.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = vit.getBoundingClientRect();
        VS.tx = e.clientX - r.left; VS.ty = e.clientY - r.top; VS.lastPtr = performance.now(); vWake();
        /* the drawing leans toward the hand, up to 12 degrees */
        if (W3.on && W3.g) { var gr = W3.g.getBoundingClientRect(); if (gr.width) w3Tilt((e.clientX - gr.left - gr.width / 2) / (gr.width * .75), (e.clientY - gr.top - gr.height / 2) / (gr.height * .75)); }
      });
      var vNavC = vit.querySelector('.vit-slide[data-v="nav"] canvas');
      if (vNavC) {
        vNavC.addEventListener('pointermove', function (e) {
          if (e.pointerType !== 'mouse') return;
          var r = vNavC.getBoundingClientRect();
          VS.P = { x: (e.clientX - r.left) * (vNavC.clientWidth / (r.width || 1)), y: (e.clientY - r.top) * (vNavC.clientHeight / (r.height || 1)), in: true };
          VS.fz = false; vWake();
        });
        vNavC.addEventListener('pointerleave', function () { VS.P = null; VS.fz = false; });
      }
    }
    var vRzQ = 0;
    window.addEventListener('resize', function () {
      if (vRzQ) return;
      vRzQ = requestAnimationFrame(function () {
        vRzQ = 0;
        if (!VS.active) return;
        var cs = vSlides[VS.cur], fz = VS.fz;
        vCenter(); vWake();
        if (W3.on) return;
        vFit(cs._c); if (VS.outSlide) vFit(VS.outSlide._c);
        VS.fz = false;
        if (!VS.run) { vDraw(cs, fz ? VSTORY[cs._v] : performance.now() - VS.t0); VS.fz = fz; }
      });
    });
    window.addEventListener('pstheme', function () {
      setTimeout(function () {
        vReadColors();
        if (!VS.active || W3.on) return;
        var cs = vSlides[VS.cur];
        vDraw(cs, VS.fz ? VSTORY[cs._v] : performance.now() - VS.t0);
        if (VS.outSlide) vDraw(VS.outSlide, performance.now() - VS.outT0);
      }, 60);
    });
  } catch (ewin) {}

  /* ---------- numerals, bench map, touched tracker, and progress as a collection ---------- */
  try {
    var exps = Array.prototype.slice.call(document.querySelectorAll('.exp'));
    var bench = document.getElementById('bench');
    var touched = [];
    /* touched machines are stored by position. The lab grew from 37 to 43, then to 47 when four World rooms moved in (v3.1),
       so the older lists are carried over by title, once. psLabTouched3 and psLabTouched2 are read, never written again,
       so a rollback still finds them intact. The run dates (psLabRunAt) were keyed by title from the start. */
    var OLD37 = ['Your life in weeks', 'The three doors', 'Six in a row', 'Fold to the Moon', 'A billion seconds', 'Powers of ten',
      'A small universe', 'The armor problem', 'The compounding machine', 'The shrinking hundred', 'The honest coin',
      'The patience market', 'Venture odds', 'The herd', 'The rich get richer', 'The generous coin', 'The short squeeze',
      'The option clock', 'The fifty million dollar email', 'The ten minute turn', 'You are not in the burger business',
      'The sip test', 'The marshmallow clock', 'The reaction tax', 'The gauntlet', 'The trust machine', 'The birthday party',
      'The threshold', 'The penalty spot', 'The pulled goalie', 'Fourth down', 'The vanishing number', 'The delegation dial',
      'The punch card', 'The covered ladder', 'Conviction: the margin call', 'The acquirer'];
    var OLD43 = ['Your life in weeks', 'The three doors', 'Six in a row', 'Fold to the Moon', 'A billion seconds', 'Powers of ten',
      'A small universe', 'The armor problem', 'The fifty million dollar email', 'The ten minute turn',
      'You are not in the burger business', 'The sip test', 'Final round', 'The compounding machine', 'The shrinking hundred',
      'The honest coin', 'The patience market', 'Venture odds', 'The herd', 'The rich get richer', 'The generous coin',
      'The short squeeze', 'The option clock', 'The marshmallow clock', 'The reaction tax', 'The gauntlet',
      'The trust machine', 'The birthday party', 'The threshold', 'The penalty spot', 'The pulled goalie', 'Fourth down',
      'The vanishing number', 'The delegation dial', 'The punch card', 'The covered ladder', 'Conviction: the margin call',
      'The acquirer', 'The titan’s ledger', 'The batch', 'Frontier: the scaling bet', 'Two seventy', 'The living drug'];
    var t4 = null, byT = {};
    try { t4 = JSON.parse(localStorage.getItem('psLabTouched4') || 'null'); } catch (e) {}
    exps.forEach(function (x, i) { var h = x.querySelector('h3'); if (h) byT[h.textContent.replace(/\s+/g, ' ').trim()] = i; });
    var carry = function (list, old) {
      (Array.isArray(list) ? list : []).forEach(function (o) { var n = typeof o === 'number' ? byT[old[o]] : null; if (n != null && touched.indexOf(n) < 0) touched.push(n); });
    };
    if (Array.isArray(t4)) {
      touched = t4.filter(function (i) { return typeof i === 'number' && i >= 0 && i < exps.length; });
    } else {
      var t3 = null, t2 = null;
      try { t3 = JSON.parse(localStorage.getItem('psLabTouched3') || 'null'); } catch (e) {}
      if (Array.isArray(t3)) carry(t3, OLD43);
      else { try { t2 = JSON.parse(localStorage.getItem('psLabTouched2') || 'null'); } catch (e) {} carry(t2, OLD37); }
      try { localStorage.setItem('psLabTouched4', JSON.stringify(touched)); } catch (e) {}
    }
    /* the day each machine first ran, keyed by its title so a renumbering never moves a seal: {"The herd": "2026-10-12"} */
    var RUN = {};
    try { RUN = JSON.parse(localStorage.getItem('psLabRunAt') || '{}') || {}; } catch (e) { RUN = {}; }
    function titleOf(x) { var h = x.querySelector('h3'); return h ? h.textContent.replace(/\s+/g, ' ').trim() : x.id; }
    function runLabel(t) {
      var s = RUN[t]; if (!s) return 'Run';
      var d = new Date(s + 'T12:00:00');
      if (isNaN(d.getTime())) return 'Run';
      try { return 'Run ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); } catch (e) { return 'Run'; }
    }
    var pill = document.getElementById('touchPill');
    /* the finale's ledger: one tick per machine, a little air before each wing */
    var ledger = document.getElementById('endLedger'), LEDGER_WS = [];
    LAB.wingOf.forEach(function (w, i) { if (i === 0 || LAB.wingOf[i - 1] !== w) LEDGER_WS.push(i); });
    var SVGNS = 'http://www.w3.org/2000/svg';
    function arcD(r, a0, a1) {
      var x0 = Math.cos(a0) * r, y0 = Math.sin(a0) * r, x1 = Math.cos(a1) * r, y1 = Math.sin(a1) * r;
      return 'M' + x0.toFixed(2) + ' ' + y0.toFixed(2) + 'A' + r + ' ' + r + ' 0 ' + (a1 - a0 > Math.PI ? 1 : 0) + ' 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2);
    }
    function mkPath(cls, d, w) { var p = document.createElementNS(SVGNS, 'path'); p.setAttribute('class', cls); p.setAttribute('d', d); if (w) p.setAttribute('data-w', w); return p; }
    /* the pill's ring: twelve arcs, one per wing, each filled by the share of that wing you have run */
    var pRing = pill ? pill.querySelector('.tp-ring') : null, pArcs = [];
    if (pRing) {
      pRing.setAttribute('viewBox', '-16 -16 32 32');
      var NW = LAB.wings.length || 12, gap = .16, seg = Math.PI * 2 / NW;
      LAB.wings.forEach(function (w, k) {
        var a0 = -Math.PI / 2 + k * seg + gap / 2, a1 = a0 + seg - gap, d = arcD(13, a0, a1);
        pRing.appendChild(mkPath('tp-b', d));
        var f = mkPath('tp-f', d, String(k + 1)); f.setAttribute('pathLength', '100'); f.style.strokeDasharray = '100 100'; f.style.strokeDashoffset = '100';
        pRing.appendChild(f); pArcs.push(f);
      });
    }
    /* each plinth's medallion: a ring of segments, one per machine, and a closed ring for a finished wing */
    function buildRing(w) {
      var svg = w.el.querySelector('.pl-ring'); if (!svg) return;
      svg.setAttribute('viewBox', '-100 -100 200 200');
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var n = Math.max(1, w.n), gap = n > 1 ? Math.min(.16, Math.PI / n / 2.2) : 0, seg = Math.PI * 2 / n, r = 96;
      w.segs = [];
      for (var k = 0; k < n; k++) {
        var a0 = -Math.PI / 2 + k * seg + gap / 2, a1 = a0 + seg - gap;
        if (n === 1) { a0 = -Math.PI / 2; a1 = a0 + Math.PI * 2 - .0001; }
        var p = mkPath('r0', arcD(r, a0, a1)); svg.appendChild(p); w.segs.push(p);
      }
      var z = document.createElementNS(SVGNS, 'circle'); z.setAttribute('class', 'rz'); z.setAttribute('r', String(r)); z.setAttribute('fill', 'none');
      svg.appendChild(z);
    }
    LAB.wings.forEach(buildRing);
    /* the seal a machine earns: its wing's numeral, pressed, and the day you ran it */
    function sealOn(x, i, stamp) {
      var s = x.querySelector(':scope > .x-run');
      if (!s) {
        var w = LAB.wings[LAB.wingOf[i]];
        s = document.createElement('span'); s.className = 'x-run'; s.setAttribute('aria-hidden', 'true');
        var sl = document.createElement('span'); sl.className = 'seal'; sl.textContent = w ? w.roman : '';
        var dt = document.createElement('span'); dt.className = 'x-d';
        s.appendChild(dt); s.appendChild(sl);
        x.appendChild(s);
      }
      s.querySelector('.x-d').textContent = runLabel(titleOf(x));
      if (stamp && !LAB.RM) { s.classList.remove('stamp'); void s.offsetWidth; s.classList.add('stamp'); }
    }
    function paintPill() {
      var nT = touched.length, nX = exps.length;
      var ixT = document.getElementById('ixTouched'); if (ixT) ixT.textContent = nT;
      var tN = document.getElementById('touchN'); if (tN) tN.textContent = nT;
      var tT = document.getElementById('touchT'); if (tT) tT.textContent = nX;
      if (pill) {
        pill.classList.toggle('has', nT > 0);
        pill.title = 'Open the index';
      }
      var eT = document.getElementById('endTitle');
      if (eT) {
        if (eT._h0 == null) eT._h0 = eT.innerHTML;
        if (nT >= nX) eT.textContent = 'That’s every machine.';
        else if (nT) eT.textContent = 'That is the whole lab.';
        else eT.innerHTML = eT._h0;
      }
      if (nT >= nX) {
        if (pill) pill.classList.add('done');
        var ec = document.getElementById('endCount');
        if (ec) ec.textContent = 'You have run all ' + nX + ' machines.';
      } else {
        var ec2 = document.getElementById('endCount');
        if (ec2) ec2.textContent = nT ? 'You have run ' + nT + ' of ' + nX + ' machines.' + (nX - nT === 1 ? ' The last one is waiting.' : ' The other ' + (nX - nT) + ' are waiting.')
          : 'You have not run a machine yet. All ' + nX + ' are waiting.';
      }
      /* each wing: its ring, its count, its chips, its tick and its line in the Index */
      LAB.wings.forEach(function (w, wi) {
        var n = 0, h = 0, hits = [];
        LAB.wingOf.forEach(function (ow, i) { if (ow === wi) { var on = touched.indexOf(i) >= 0; hits.push(on); n++; if (on) h++; } });
        var p = n ? h / n : 0;
        w.h = h; w.p = p;
        w.el.style.setProperty('--wp', p.toFixed(4));
        w.el.classList.toggle('w-done', n > 0 && h === n);
        var wt = w.el.querySelector('.wn-t'); if (wt) wt.textContent = h ? (h === n ? 'All ' + n + ' run' : h + ' of ' + n + ' run') : '';
        if (w.segs) w.segs.forEach(function (sg, k) { sg.setAttribute('class', hits[k] ? 'r1' : 'r0'); });
        if (pArcs[wi]) pArcs[wi].style.strokeDashoffset = String(100 - p * 100);
      });
      exps.forEach(function (x, i) {
        var on = touched.indexOf(i) >= 0;
        x.classList.toggle('touched', on);
        if (on) sealOn(x, i, false);
      });
      Array.prototype.forEach.call(bench.children, function (a, i) {
        a.classList.toggle('hit', touched.indexOf(i) >= 0);
      });
      Array.prototype.forEach.call(document.querySelectorAll('.pl-chips a[data-i], .way-m a[data-i]'), function (a) {
        a.classList.toggle('hit', touched.indexOf(+a.getAttribute('data-i')) >= 0);
      });
      if (LAB.paint) LAB.paint();
      if (ledger) {
        if (!ledger.children.length) {
          var lh = '';
          for (var k = 0; k < exps.length; k++) {
            var lw = LEDGER_WS.indexOf(k) >= 0, lwr = lw && LAB.wings[LAB.wingOf[k]] ? LAB.wings[LAB.wingOf[k]].roman : '';
            lh += '<i style="--i:' + k + '" data-w="' + (LAB.wingOf[k] + 1) + '"' + (lw ? ' class="ws" data-rn="' + lwr + '"' : '') + '></i>';
          }
          ledger.innerHTML = lh;
          /* the ticks rise once, when the finale comes into view (never held if it is already on screen) */
          if (!LAB.RM && 'IntersectionObserver' in window && ledger.getBoundingClientRect().top > innerHeight) {
            ledger.classList.add('le-wait');
            var leIO = new IntersectionObserver(function (es) {
              if (!es[0].isIntersecting) return;
              leIO.disconnect(); ledger.classList.add('le-go');
              setTimeout(function () { ledger.classList.remove('le-wait', 'le-go'); }, 1600);
            }, { rootMargin: '0px 0px -10% 0px' });
            leIO.observe(ledger);
          }
        }
        Array.prototype.forEach.call(ledger.children, function (t, k) { t.classList.toggle('on', touched.indexOf(k) >= 0); });
      }
    }
    LAB.touched = touched;
    var feat = {};
    Array.prototype.forEach.call(document.querySelectorAll('#vitrine .vit-slide'), function (s, k) {
      feat[parseInt(s.getAttribute('href').slice(5), 10) - 1] = '0' + (k + 1);
    });
    /* the type glyph for a machine, from its own tag: game, simulation, a choice, a case, an explorer */
    function typeOf(x) {
      var t = ((x.querySelector('.etag') || {}).textContent || '').toLowerCase();
      if (/explorer/.test(t)) return 'eye';
      if (/case/.test(t)) return 'case';
      if (/choose|quiz/.test(t)) return 'fork';
      if (/game/.test(t)) return 'game';
      if (/simulation/.test(t)) return 'sim';
      return 'mach';
    }
    function glyph(k) {
      var s = document.createElementNS(SVGNS, 'svg'), u = document.createElementNS(SVGNS, 'use');
      s.setAttribute('class', 'lg'); s.setAttribute('viewBox', '0 0 16 16'); s.setAttribute('aria-hidden', 'true');
      u.setAttribute('href', '#lg-' + k); s.appendChild(u);
      return s;
    }
    exps.forEach(function (x, i) {
      x.id = x.id || 'exp-' + (i + 1);
      var nn = (i + 1 < 10 ? '0' : '') + (i + 1), wi = LAB.wingOf[i], w = LAB.wings[wi];
      x.setAttribute('data-n', nn);
      var name = titleOf(x), ty = typeOf(x);
      var a = document.createElement('a');
      a.href = '#' + x.id;
      if (w) a.setAttribute('data-w', w.el.getAttribute('data-wing'));
      if (x.hasAttribute('data-deep')) a.classList.add('deep');
      var bn = document.createElement('i'); bn.className = 'bn'; bn.textContent = nn; a.appendChild(bn);
      var nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = name; a.appendChild(nm);
      var mk = document.createElement('span'); mk.className = 'mk'; a.appendChild(mk);
      if (feat[i]) { var ft = document.createElement('sup'); ft.className = 'ft'; ft.setAttribute('aria-hidden', 'true'); ft.textContent = '◆'; mk.appendChild(ft); }
      var tc = document.createElement('span'); tc.className = 'tch'; tc.innerHTML = '<span class="vh"> (run)</span>'; mk.appendChild(tc);
      bench.appendChild(a);
      /* the wing's chips: one per machine, built from the cards, so a new card brings its own chip */
      var ul = w && w.el.querySelector('.pl-chips');
      if (ul) {
        var li = document.createElement('li'), c = document.createElement('a');
        c.href = '#' + x.id; c.setAttribute('data-i', String(i));
        c.appendChild(glyph(ty));
        var cs = document.createElement('span'); cs.textContent = name; c.appendChild(cs);
        li.appendChild(c); ul.appendChild(li);
      }
      function markTouch() {
        if (touched.indexOf(i) < 0) {
          touched.push(i);
          try { localStorage.setItem('psLabTouched4', JSON.stringify(touched)); } catch (e) {}
          if (!RUN[name]) {
            var d = new Date(), ds = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
            RUN[name] = ds;
            try { localStorage.setItem('psLabRunAt', JSON.stringify(RUN)); } catch (e) {}
          }
          var first = pill && !pill.classList.contains('has');
          paintPill();
          sealOn(x, i, true);
          var deH = document.documentElement.classList;
          if (first && !deH.contains('vit-inview') && !deH.contains('ix-open')) { pill.classList.add('arrive'); setTimeout(function () { pill.classList.remove('arrive'); }, 700); }
          var tN = document.getElementById('touchN');
          if (tN && !LAB.RM) { tN.classList.remove('tick'); void tN.offsetWidth; tN.classList.add('tick'); }
          var wd = LAB.wings[wi];
          if (wd && wd.h === wd.n) { try { if (window.PS && PS.say) PS.say('Wing ' + wd.roman + ' complete.'); } catch (e) {} }
        }
      }
      x.addEventListener('click', function (ev) { if (ev.target.closest('button, input, canvas, a')) markTouch(); });
      x.addEventListener('input', markTouch);
      x.addEventListener('pointerdown', function (ev) { if (ev.target.tagName === 'CANVAS') markTouch(); });
    });
    var spyLab = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          Array.prototype.forEach.call(bench.children, function (a) { a.classList.remove('on'); a.removeAttribute('aria-current'); });
          var idx = exps.indexOf(e.target);
          if (bench.children[idx]) { bench.children[idx].classList.add('on'); bench.children[idx].setAttribute('aria-current', 'true'); }
          if (LAB.onSpy) LAB.onSpy(idx);
        }
      });
    }, { rootMargin: '-30% 0px -55% 0px' });
    exps.forEach(function (x) { spyLab.observe(x); });
    LAB.repaint = paintPill;
    paintPill();
  } catch (eb3) {}

  /* ---------- the directory: the current wing, twelve ticks, the filter (pressing the wing shows it alone) ---------- */
  try {
    var flt = document.getElementById('labFilter'), ldW = document.getElementById('ldW'), ldMap = document.getElementById('ldMap');
    var fEls = Array.prototype.slice.call(document.querySelectorAll('.wing-div, .exp'));
    var fWings = [], fMap = [], wcur = -1;
    fEls.forEach(function (el) {
      if (el.classList.contains('wing-div')) {
        wcur++;
        var wraw = el.querySelector('.wt').textContent.replace(/[“”]/g, '').trim();
        fWings.push({ el: el, name: LAB_WMAP[wraw.toUpperCase()] || wraw, n: 0 });
      } else { fMap.push({ el: el, w: wcur }); if (wcur >= 0) fWings[wcur].n++; }
    });
    var benchEl = document.getElementById('bench');
    var ticks = [];
    function fApply(k) {
      var shown = 0;
      fMap.forEach(function (m, i) {
        var on = k < 0 || m.w === k;
        m.el.style.display = on ? '' : 'none';
        if (on) shown++;
        if (benchEl.children[i]) benchEl.children[i].classList.toggle('dim', !on);
      });
      fWings.forEach(function (w, wi) { w.el.style.display = (k < 0 || wi === k) ? '' : 'none'; });
      LAB.filter = k;
      ticks.forEach(function (t, ti) { t.classList.toggle('flt', ti === k); });
      if (ldMap) ldMap.classList.toggle('filtered', k >= 0);
      var sec = document.getElementById('experiments');
      if (sec) sec.style.display = (k < 0 || sec.contains(fWings[k].el)) ? '' : 'none';
      LAB.countText = shown + ' of ' + fMap.length + ' machines' + (k >= 0 ? ', ' + fWings[k].name : '');
      var cn = document.getElementById('lfCount');
      if (cn) cn.textContent = LAB.countText;
      if (LAB.offsets) LAB.offsets();
      ldLabel();
    }
    LAB.apply = fApply;
    /* the twelve ticks */
    if (ldMap) {
      LAB.wings.forEach(function (w, wi) {
        var b = document.createElement('button');
        b.type = 'button'; b.setAttribute('data-w', w.el.getAttribute('data-wing'));
        b.setAttribute('data-name', w.roman + ' · ' + w.name);
        b.setAttribute('aria-label', 'Wing ' + w.roman + ', ' + w.name);
        b.addEventListener('click', function () {
          if (LAB.cancelDeal) LAB.cancelDeal();
          if (LAB.closeIndex) LAB.closeIndex(false);
          if (LAB.filter >= 0 && LAB.filter !== wi) fApply(wi);
          LAB.land(w.el);
        });
        ldMap.appendChild(b); ticks.push(b);
      });
    }
    function ldLabel() {
      if (!ldW) return;
      var k = LAB.filter >= 0 ? LAB.filter : LAB.spyWing, w = LAB.wings[k];
      var sw = ldW.querySelector('.ld-sw'), rn = ldW.querySelector('.ld-rn'), nm = ldW.querySelector('.ld-nm'), ct = ldW.querySelector('.ld-ct');
      var tot = (LAB.touched || []).length;
      if (w) {
        ldW.setAttribute('data-w', w.el.getAttribute('data-wing'));
        rn.textContent = w.roman; nm.textContent = w.name; ct.textContent = (w.h || 0) + '/' + w.n;
        ldW.setAttribute('aria-label', 'Wing ' + w.roman + ', ' + w.name + ', ' + (w.h || 0) + ' of ' + w.n + ' run. ' + (LAB.filter >= 0 ? 'Showing this wing only. Press to show every wing.' : 'Press to show this wing only.'));
        ldW.title = LAB.filter >= 0 ? 'Show every wing' : 'Show only Wing ' + w.roman;
      } else {
        ldW.removeAttribute('data-w');
        rn.textContent = String(LAB.wings.length); nm.textContent = 'wings'; ct.textContent = tot + '/' + LAB.exps.length;
        ldW.setAttribute('aria-label', LAB.wings.length + ' wings, ' + tot + ' of ' + LAB.exps.length + ' machines run. Press to go to the first wing.');
        ldW.title = 'Go to Wing I';
      }
      ldW.setAttribute('aria-pressed', LAB.filter >= 0 ? 'true' : 'false');
      if (sw) sw.style.opacity = w ? '1' : '.5';
      ticks.forEach(function (t, ti) {
        var ww = LAB.wings[ti];
        t.style.setProperty('--wp', ww ? (ww.p || 0).toFixed(3) : '0');
        if (ti === k) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
      });
    }
    LAB.paint = ldLabel;
    if (ldW) ldW.addEventListener('click', function () {
      if (LAB.cancelDeal) LAB.cancelDeal();
      if (LAB.closeIndex) LAB.closeIndex(false);
      if (LAB.filter >= 0) { var k0 = LAB.filter; fApply(-1); LAB.land(fWings[k0].el, { pulse: false }); return; }
      if (LAB.spyWing < 0) { if (fWings[0]) LAB.land(fWings[0].el); return; }
      var k = LAB.spyWing; fApply(k); LAB.land(fWings[k].el, { pulse: false });
    });
    /* the current wing comes from cached plinth offsets, so a programmatic jump updates it at once */
    var offs = [];
    LAB.offsets = function () { offs = LAB.wings.map(function (w) { return w.el.style.display === 'none' ? Infinity : LAB.top(w.el); }); ldSpy(); };
    function ldSpy() {
      var y = (window.scrollY || window.pageYOffset) + innerHeight * .42, k = -1;
      for (var i = 0; i < offs.length; i++) if (offs[i] <= y) k = i;
      if (LAB.filter >= 0) k = LAB.filter;
      if (k !== LAB.spyWing) { LAB.spyWing = k; ldLabel(); }
    }
    LAB.offsets();
    var ldQ = 0;
    window.addEventListener('scroll', function () { if (ldQ) return; ldQ = requestAnimationFrame(function () { ldQ = 0; ldSpy(); }); }, { passive: true });
    if ('ResizeObserver' in window) {
      var roQ = 0;
      new ResizeObserver(function () { if (roQ) return; roQ = requestAnimationFrame(function () { roQ = 0; LAB.offsets(); }); }).observe(document.getElementById('experiments') || document.body);
    } else window.addEventListener('resize', function () { LAB.offsets(); });
    window.addEventListener('load', function () { LAB.offsets(); });
    fMap.forEach(function (m, i) {
      if ((i === 0 || fMap[i - 1].w !== m.w) && benchEl.children[i] && LAB.wings[m.w]) benchEl.children[i].setAttribute('data-wl', LAB.wings[m.w].label);
    });
    /* the index: start each column on a wing, never mid-wing (weights: a heading counts as two rows) */
    function ixCols() {
      var n = Math.max(1, Math.min(4, Math.floor((benchEl.clientWidth + 32) / 252))), starts = [], sizes = [];
      fMap.forEach(function (m, i) { if (i === 0 || fMap[i - 1].w !== m.w) { starts.push(i); sizes.push(2); } sizes[sizes.length - 1]++; });
      var tot = sizes.reduce(function (a, b) { return a + b; }, 0), acc = 0, col = 0, brk = {};
      sizes.forEach(function (sz, k) { if (k > 0 && col < n - 1 && acc + sz / 2 > tot * (col + 1) / n) { brk[starts[k]] = 1; col++; } acc += sz; });
      Array.prototype.forEach.call(benchEl.children, function (a, i) { a.classList.toggle('ixc', !!brk[i]); });
    }
    LAB.ixCols = ixCols; window.addEventListener('resize', ixCols);
    /* the Index lines: each wing's heading carries its share, and says so when it is complete */
    var ixPaint = function () {
      fMap.forEach(function (m, i) {
        var a = benchEl.children[i], w = LAB.wings[m.w];
        if (!a || !w || !a.hasAttribute('data-wl')) return;
        a.setAttribute('data-wl', w.n && w.h === w.n ? 'Wing ' + w.roman + ' complete · ' + w.name : w.label + (w.h ? ' · ' + w.h + '/' + w.n : ''));
        a.style.setProperty('--wp', (w.p || 0).toFixed(3));
      });
    };
    var ldPaint0 = LAB.paint;
    LAB.paint = function () { ldPaint0(); ixPaint(); };
    LAB.paint();
  } catch (efl) {}

  /* ---------- directory bar: sticky, the dark glass over the stage, index, deal ---------- */
  try {
    var ldir = document.getElementById('labDir'), ixBtn = document.getElementById('labIndexBtn'), ixPanel = document.getElementById('ixPanel');
    var ixBench = document.getElementById('bench'), ldSent = document.querySelector('.lab-dir-sentinel'), ldIn = ldir.querySelector('.ld-in');
    var dealBtn = document.getElementById('fyDeal'), tpill = document.getElementById('touchPill'), vitEl = document.getElementById('vitrine');
    var ixHideT = 0, lastDealt = -1, dealT = 0, dealGoT = 0;
    if ('IntersectionObserver' in window && ldSent) {
      /* the root reaches far below the fold, so only crossing the top edge counts: an instant jump
         from above the bar to deep in the lab still flips it to stuck */
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          LAB.stuck = !e.isIntersecting && e.boundingClientRect.top < 0;
          ldir.classList.toggle('stuck', LAB.stuck);
        });
      }, { rootMargin: '0px 0px 100000px 0px' }).observe(ldSent);
    }
    /* dark glass while the stage is behind the pill, paper glass once it has gone; the sweep reads the stage as its ground */
    function ldTone() {
      if (!vitEl) return;
      var vr = vitEl.getBoundingClientRect(), pr = ldIn.getBoundingClientRect(), on = vr.bottom > pr.bottom - 2 && vr.top < pr.top;
      if (on !== ldir.classList.contains('on-dark')) ldir.classList.toggle('on-dark', on);
      if (on) { var bg = ''; try { bg = getComputedStyle(vitEl).backgroundColor; } catch (e) {} if (bg) ldIn.setAttribute('data-aa-bg', bg); }
      else ldIn.removeAttribute('data-aa-bg');
    }
    ldTone();
    var ltQ = 0;
    window.addEventListener('scroll', function () { if (ltQ) return; ltQ = requestAnimationFrame(function () { ltQ = 0; ldTone(); }); }, { passive: true });
    window.addEventListener('resize', ldTone);
    window.addEventListener('pstheme', function () { setTimeout(ldTone, 0); });
    ldTone();
    function ixIsOpen() { return ixBtn.getAttribute('aria-expanded') === 'true'; }
    /* the building, cut open: drawn once from the page itself, twelve floors with a block per machine */
    var ixCutDone = false, cutBlocks = [];
    function ixCut() {
      if (ixCutDone) return; ixCutDone = true;
      var fig = document.getElementById('ixCut'); if (!fig) return;
      var NS = 'http://www.w3.org/2000/svg', U = 22, FH = 1.22, nW = LAB.wings.length;
      /* a dimetric view: the floors run nearly level, so twelve of them stack into a building and not a needle */
      function P(x, y, z) { return [(x - z * .52) * U, (x * .2 + z * .42 - y) * U]; }
      function pts(a) { return a.map(function (p) { var q = P(p[0], p[1], p[2]); return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '); }
      function poly(cls, a) { var e = document.createElementNS(NS, 'polygon'); e.setAttribute('class', cls); e.setAttribute('points', pts(a)); return e; }
      var svg = document.createElementNS(NS, 'svg'), W2 = 3.4, D2 = .78, top = nW * FH;
      var minX = P(-W2, 0, D2)[0] - 4, maxX = P(W2, 0, -D2)[0] + 30, minY = P(-W2, top + .4, -D2)[1] - 6, maxY = P(W2, 0, D2)[1] + 8;
      svg.setAttribute('viewBox', minX.toFixed(1) + ' ' + minY.toFixed(1) + ' ' + (maxX - minX).toFixed(1) + ' ' + (maxY - minY).toFixed(1));
      svg.setAttribute('role', 'presentation');
      /* the lowest floor first, so each floor above is drawn over the one below */
      for (var wi = nW - 1; wi >= 0; wi--) {
        var y = (nW - 1 - wi) * FH, g = document.createElementNS(NS, 'g'), w = LAB.wings[wi];
        g.setAttribute('data-w', w.el.getAttribute('data-wing'));
        g.appendChild(poly('cs', [[-W2, y, -D2], [W2, y, -D2], [W2, y, D2], [-W2, y, D2]]));
        g.appendChild(poly('cw', [[-W2, y, D2], [W2, y, D2]]));
        var ids = []; LAB.wingOf.forEach(function (ow, i) { if (ow === wi) ids.push(i); });
        var k = ids.length, list = [], s = Math.min(.3, 2.3 / Math.max(1, k));
        ids.forEach(function (i, j) { list.push({ i: i, x: -W2 + (j + .5) * (2 * W2) / k, z: 0 }); });
        list.sort(function (a, b) { return (a.x * .2 + a.z * .42) - (b.x * .2 + b.z * .42); });
        list.forEach(function (b) {
          var i = b.i, deep = LAB.exps[i].hasAttribute('data-deep'), h = deep ? .95 : .5, x = b.x, z = b.z;
          var bg = document.createElementNS(NS, 'g'); bg.setAttribute('class', 'cb'); bg.setAttribute('data-i', String(i)); bg.setAttribute('data-w', w.el.getAttribute('data-wing'));
          var y0 = y + .02, y1 = y0 + h;
          bg.appendChild(poly('cl', [[x - s, y0, z + s], [x + s, y0, z + s], [x + s, y1, z + s], [x - s, y1, z + s]]));
          bg.appendChild(poly('cr', [[x + s, y0, z - s], [x + s, y0, z + s], [x + s, y1, z + s], [x + s, y1, z - s]]));
          bg.appendChild(poly('ct', [[x - s, y1, z - s], [x + s, y1, z - s], [x + s, y1, z + s], [x - s, y1, z + s]]));
          bg.appendChild(poly('ce', [[x - s, y1, z - s], [x + s, y1, z - s], [x + s, y1, z + s], [x + s, y0, z + s], [x - s, y0, z + s], [x - s, y1, z + s]]));
          bg.addEventListener('click', function () { ixClose(false); LAB.go(i); });
          g.appendChild(bg); cutBlocks[i] = bg;
        });
        var q = P(W2, y + .1, D2), t = document.createElementNS(NS, 'text');
        t.setAttribute('class', 'cn'); t.setAttribute('x', (q[0] + 8).toFixed(1)); t.setAttribute('y', (q[1] + 4).toFixed(1));
        t.textContent = w.roman; g.appendChild(t);
        svg.appendChild(g);
      }
      fig.appendChild(svg);
      var cap = document.createElement('figcaption'); cap.textContent = 'The Lab, cut open: Wing I at the top';
      fig.appendChild(cap);
      cutPaint();
    }
    function cutPaint() {
      var tt = LAB.touched || [];
      cutBlocks.forEach(function (b, i) { if (b) b.classList.toggle('hit', tt.indexOf(i) >= 0); });
    }
    function cutHot(i) { cutBlocks.forEach(function (b, k) { if (b) b.classList.toggle('hot', k === i); }); }
    ixBench.addEventListener('pointerover', function (e) { var a = e.target.closest ? e.target.closest('#bench > a') : null; cutHot(a ? Array.prototype.indexOf.call(ixBench.children, a) : -1); });
    ixBench.addEventListener('pointerleave', function () { cutHot(-1); });
    ixBench.addEventListener('focusin', function (e) { var a = e.target.closest ? e.target.closest('#bench > a') : null; if (a) cutHot(Array.prototype.indexOf.call(ixBench.children, a)); });
    function ixOpen() {
      clearTimeout(ixHideT);
      var r = ldir.getBoundingClientRect();
      if (r.top > 13) window.scrollTo({ top: scrollY + r.top - 12, behavior: 'instant' });
      ixPanel.hidden = false;
      ixCut(); cutPaint();
      if (LAB.ixCols) LAB.ixCols();
      ixBtn.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('ix-open');
      void ixPanel.offsetWidth;
      ixPanel.classList.add('in');
      var tg = ixBench.querySelector('a.on') || ixBench.firstElementChild;
      /* keep the column headings in view; scroll only when the current machine sits below the fold */
      if (tg) {
        ixPanel.scrollTop = (tg.offsetTop + tg.offsetHeight > ixPanel.clientHeight - 24) ? Math.max(0, tg.offsetTop - 140) : 0;
        try { tg.focus({ preventScroll: true }); } catch (e) {}
      }
    }
    function ixClose(refocus) {
      if (ixIsOpen()) {
        ixBtn.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('ix-open');
        ixPanel.classList.remove('in');
        cutHot(-1);
        clearTimeout(ixHideT);
        if (LAB.RM) ixPanel.hidden = true;
        else ixHideT = setTimeout(function () { ixPanel.hidden = true; }, 260);
      }
      if (refocus) { try { ixBtn.focus({ preventScroll: true }); } catch (e) {} }
    }
    LAB.openIndex = ixOpen; LAB.closeIndex = ixClose;
    var lpaint0 = LAB.paint;
    LAB.paint = function () { if (lpaint0) lpaint0(); cutPaint(); };
    ixBtn.addEventListener('click', function () { if (ixIsOpen()) ixClose(true); else ixOpen(); });
    document.getElementById('ixClose').addEventListener('click', function () { ixClose(true); });
    var ixLed = document.getElementById('ixLedger');
    if (ixLed) ixLed.addEventListener('click', function (e) {
      var end = document.getElementById('labEnd'); if (!end) return;
      e.preventDefault(); ixClose(false);
      if (LAB.filter >= 0 && LAB.apply) LAB.apply(-1);
      LAB.land(end);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ixIsOpen()) { e.preventDefault(); ixClose(true); } });
    document.addEventListener('pointerdown', function (e) {
      if (!ixIsOpen()) return;
      if (ldir.contains(e.target) || (tpill && tpill.contains(e.target))) return;
      ixClose(false);
    }, true);
    ldir.addEventListener('focusout', function (e) {
      if (ixIsOpen() && e.relatedTarget && !ldir.contains(e.relatedTarget)) ixClose(false);
    });
    ixPanel.addEventListener('keydown', function (e) {
      if (e.target && e.target.tagName === 'INPUT' && e.key !== 'ArrowDown') return;
      var as = Array.prototype.filter.call(ixBench.children, function (a) { return !a.hidden; }), i = as.indexOf(document.activeElement), n = -1;
      if (e.key === 'ArrowDown') n = i < 0 ? 0 : Math.min(as.length - 1, i + 1);
      else if (e.key === 'ArrowUp') n = i < 0 ? 0 : Math.max(0, i - 1);
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = as.length - 1;
      if (n >= 0 && as[n]) { e.preventDefault(); as[n].focus(); }
    });
    ixBench.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a || a.parentNode !== ixBench) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      e.preventDefault();
      var i = Array.prototype.indexOf.call(ixBench.children, a);
      ixClose(false); LAB.go(i);
    });
    dealBtn.addEventListener('click', function () {
      var n = LAB.exps.length, pool = [], i, tch = (typeof touched !== 'undefined' && touched) ? touched : [];
      function vis(k) { return LAB.exps[k].style.display !== 'none'; }
      for (i = 0; i < n; i++) if (vis(i) && tch.indexOf(i) < 0 && i !== lastDealt) pool.push(i);
      var seenAll = !pool.length;
      if (!pool.length) for (i = 0; i < n; i++) if (vis(i) && i !== lastDealt) pool.push(i);
      if (!pool.length) for (i = 0; i < n; i++) if (vis(i)) pool.push(i);
      if (!pool.length) for (i = 0; i < n; i++) pool.push(i);
      var pick = pool[Math.floor(Math.random() * pool.length)]; lastDealt = pick;
      var nn = (pick + 1 < 10 ? '0' : '') + (pick + 1);
      var h3 = LAB.exps[pick].querySelector('h3'), nm = h3 ? h3.textContent.replace(/\s+/g, ' ').trim() : 'Machine ' + nn;
      var small = false; try { small = matchMedia('(max-width: 720px)').matches; } catch (e) {}
      if (!dealBtn.classList.contains('dealt')) dealBtn._w0 = dealBtn.getBoundingClientRect().width;
      dealBtn.querySelector('.dl-t').textContent = seenAll ? 'You have seen every machine.' : small ? 'No. ' + nn : 'No. ' + nn + ' · ' + nm;
      if (seenAll) try { if (window.PS && PS.say) PS.say('You have seen every machine.'); } catch (e) {}
      dealBtn.classList.remove('dealt'); void dealBtn.offsetWidth; dealBtn.classList.add('dealt');
      /* size the pill to the whole dealt label (never narrower than idle, never more than ~45% of the bar) */
      dealBtn.style.width = '';
      var dlW = Math.ceil(dealBtn.getBoundingClientRect().width) + 1, dlBar = dealBtn.parentNode ? dealBtn.parentNode.clientWidth : 0;
      if (dlBar) dlW = Math.min(dlW, Math.round(dlBar * 0.45));
      dealBtn.style.width = Math.max(dealBtn._w0 || 0, dlW) + 'px';
      clearTimeout(dealGoT);
      if (LAB.RM) LAB.go(pick); else dealGoT = setTimeout(function () { LAB.go(pick); }, 450);
      clearTimeout(dealT);
      dealT = setTimeout(dealReset, 2600);
    });
    function dealReset() { dealBtn.classList.remove('dealt'); dealBtn.style.width = ''; }
    LAB.cancelDeal = function () { clearTimeout(dealGoT); clearTimeout(dealT); dealReset(); };
    if (tpill) tpill.addEventListener('click', function () { LAB.openIndex(); });
  } catch (eld) {}

  /* ---------- the plinths in 3D: Wing I's sheet folding in half, Wing III's building filling with money. Each serves a
     registered poster at rest; the live view takes over near the viewport and answers the hand. ---------- */
  try {
    var PL_FOLD = 2.55, PL_PRICE = 310;
    var PL_MARKS = [[15, 1.8, 'A person', '1.8 m'], [22, 330, 'The Eiffel Tower', '330 m'], [27, 8849, 'Everest', '8,849 m'], [32, 4.2e5, 'The ISS', 'about 420 km'], [42, 3.78e8, 'The Moon', '384,400 km']];
    var plFine = false; try { plFine = matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (e) {}
    var plLive = function (host) {
      var id = host.getAttribute('data-pl3d');
      if (typeof lab3d !== 'function') return;
      lab3d(function (P) {
        if (!P || P.support() === '2d') return;
        if (id === 'capital-stack') {
          P.stage(host, 'capital-stack', { surface: 'dark', params: { price: PL_PRICE }, idle: true }).then(function (st) {
            st.view.on('shown', function () { var pp = host.querySelector('.ps3d-poster'); if (pp) pp.setAttribute('data-aa-skip', ''); });
            var cur = PL_PRICE, tgt = PL_PRICE, raf = 0;
            function step() {
              raf = 0; cur += (tgt - cur) * .14;
              if (Math.abs(tgt - cur) < .5) cur = tgt;
              st.set({ price: Math.round(cur * 10) / 10 });
              if (cur !== tgt) raf = requestAnimationFrame(step);
            }
            function to(p) { tgt = Math.max(0, Math.min(500, p)); if (LAB.RM) { cur = tgt; st.set({ price: cur }); return; } if (!raf) raf = requestAnimationFrame(step); }
            if (plFine) {
              host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); to(20 + 470 * Math.max(0, Math.min(1, (e.clientX - r.left) / (r.width || 1)))); });
              host.addEventListener('pointerleave', function () { to(PL_PRICE); });
            } else host.addEventListener('click', function () { to(tgt > PL_PRICE ? 90 : tgt < PL_PRICE ? PL_PRICE : 480); });
          }, function () {});
        } else if (id === 'fold') {
          P.need('fold').then(function (d) {
            var api = d.mount(host, { marks: PL_MARKS, pick: function () {} });
            /* the sheet floats in the plinth's light, so the drawing keeps no table under it */
            (api.view.scene.children || []).forEach(function (n) {
              if (n.parts && n.parts.ground) Object.defineProperty(n.parts.ground, 'visible', { get: function () { return false; }, set: function () {} });
            });
            P.reduced(true); api.go(PL_FOLD, ''); P.reduced(null);
            api.view.invalidate();
            api.view.on('frame', function first() { api.view.off('frame', first); var pp = host.querySelector('.ps3d-poster'); if (pp) pp.setAttribute('data-aa-skip', ''); });
            if (plFine) {
              host.addEventListener('pointerenter', function () { api.go(PL_FOLD + 1, ''); });
              host.addEventListener('pointerleave', function () { api.go(PL_FOLD, ''); });
            } else host.addEventListener('click', function () { host._f = !host._f; api.go(host._f ? PL_FOLD + 1 : PL_FOLD, ''); });
          }, function () {});
        }
      });
    };
    Array.prototype.forEach.call(document.querySelectorAll('.pl-stage[data-pl3d]'), function (host) {
      if (!('IntersectionObserver' in window)) { plLive(host); return; }
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); plLive(host); } }, { rootMargin: '400px 0px' });
      io.observe(host);
    });
  } catch (epl) {}

  /* ---------- theme repaint: every registered machine redraws from its own cache, once per frame at most ---------- */
  try {
    var labRepaintAll = function () {
      (window.LABREPAINT || []).forEach(function (fn) { try { fn(); } catch (e) {} });
    };
    window.addEventListener('pstheme', labRepaintAll);
    var labRsQ = 0;
    window.addEventListener('resize', function () {
      if (labRsQ) return;
      labRsQ = requestAnimationFrame(function () { labRsQ = 0; labRepaintAll(); });
    });
  } catch (eth) {}

  /* ---------- finishing: every count on the page comes from the DOM (data-count-live opts out of the site's table) ---------- */
  try {
    var LAB_WD = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
      'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], LAB_TENS = { 2: 'twenty', 3: 'thirty', 4: 'forty', 5: 'fifty' };
    var labWord = function (n, cap) {
      var w = n < 20 ? LAB_WD[n] : n < 60 ? LAB_TENS[Math.floor(n / 10)] + (n % 10 ? '-' + LAB_WD[n % 10] : '') : String(n);
      return cap ? w.charAt(0).toUpperCase() + w.slice(1) : w;
    };
    LAB.wings.forEach(function (w) {
      var c = w.el.querySelector('.wn-c'); if (c && w.n) c.textContent = ' · ' + w.n + (w.n === 1 ? ' machine' : ' machines');
    });
    var labN = LAB.exps.length, ixP = document.getElementById('ixPanel'), lfC = document.getElementById('lfCount');
    if (ixP) ixP.setAttribute('aria-label', 'Index of all ' + labN + ' machines');
    if (LAB.filter < 0) { LAB.countText = labN + ' of ' + labN + ' machines'; if (lfC) lfC.textContent = LAB.countText; }
    Array.prototype.forEach.call(document.querySelectorAll('[data-count]'), function (el) {
      var k = el.getAttribute('data-count'), n = k === 'machines' ? LAB.exps.length : k === 'wings' ? LAB.wings.length : null;
      if (n == null) return;
      var wd = el.getAttribute('data-count-word');
      el.textContent = wd == null ? String(n) : labWord(n, /cap/i.test(wd));
    });
  } catch (efin) {}

  /* ---------- slider fill: every lab range carries its value as --sfill for the foil track ---------- */
  try {
    var sfPaint = function (r) {
      var lo = parseFloat(r.min) || 0, hi = parseFloat(r.max), v = parseFloat(r.value);
      if (isNaN(hi)) hi = 100;
      var p = hi > lo ? Math.max(0, Math.min(100, (v - lo) / (hi - lo) * 100)) : 0;
      r.style.setProperty('--sfill', p.toFixed(2) + '%');
    };
    Array.prototype.forEach.call(document.querySelectorAll('.exp input[type=range]'), sfPaint);
    window.addEventListener('input', function (e) {
      var t = e.target;
      if (t && t.type === 'range' && t.closest && t.closest('.exp')) sfPaint(t);
    }, true);
    window.addEventListener('pstheme', function () {
      Array.prototype.forEach.call(document.querySelectorAll('.exp input[type=range]'), sfPaint);
    });
  } catch (esf) {}

  /* ---------- deep links: /experiments#exp-19 lands on machine 19, once the lab is open ---------- */
  try {
    /* the browser scrolls to the fragment at its first frame and clears focus when the target is a plain block, so the
       landing (and its focus on the h3) runs just after that frame */
    var dlAfter = function (fn) {
      var done = false, run = function () { if (done) return; done = true; fn(); };
      window.addEventListener('labopen', function () { requestAnimationFrame(function () { setTimeout(run, 0); }); setTimeout(run, 400); }, { once: true });
    };
    if (/^#exp-\d+$/.test(location.hash)) {
      dlAfter(function () { var i = parseInt(location.hash.slice(5), 10) - 1; if (LAB.go) LAB.go(i); });
    } else if (/^#m-[a-z0-9-]+$/.test(location.hash)) {
      dlAfter(function () { if (LAB.go) LAB.go(location.hash.slice(1), { alias: true }); });
    } else if (/^#wing-\d+$/.test(location.hash)) {
      dlAfter(function () { var w = document.getElementById(location.hash.slice(1)); if (w && LAB.land) LAB.land(w); });
    }
    window.addEventListener('hashchange', function () {
      var h = location.hash;
      if (/^#(exp-\d+|m-[a-z0-9-]+)$/.test(h) && LAB.go) LAB.go(h.slice(1), { alias: h.indexOf('#m-') === 0 });
      else if (/^#wing-\d+$/.test(h)) { var w = document.getElementById(h.slice(1)); if (w && LAB.land) LAB.land(w); }
    });
  } catch (edl) {}

  /* ---------- tab title ---------- */
  try {
    var labTitle = document.title;
    document.addEventListener('visibilitychange', function () {
      document.title = document.hidden ? 'P.S. The wheel is still spinning.' : labTitle;
    });
  } catch (eb4) {}


  /* ---------- the Index: a search over titles and what each machine does, five ways to narrow it, a hook under each title ---------- */
  try {
    var ixQ = document.getElementById('ixQ'), ixPills = document.getElementById('ixPills'), ixNone = document.getElementById('ixNone'),
      benchX = document.getElementById('bench');
    if (ixQ && ixPills && benchX && LAB.exps.length === benchX.children.length) {
      var IXF = 'all';
      var ixNorm = function (t) {
        t = String(t || '').toLowerCase(); try { t = t.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) {}
        return t.replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();
      };
      var ixData = LAB.exps.map(function (x, i) {
        var t = ((x.querySelector('h3') || {}).textContent || '').replace(/\s+/g, ' ').trim();
        var d = ((x.querySelector('.edesc') || {}).textContent || '').replace(/\s+/g, ' ').trim();
        /* the hook: the standfirst's first sentence, or its first two when the first is only a dateline */
        var parts = d.match(/[^.!?]+[.!?]+(\s|$)/g) || [d], hk = (parts[0] || '').trim();
        if (hk.length < 40 && parts[1]) hk += ' ' + parts[1].trim();
        var u = x.querySelector('.etag use'), ty = u ? (u.getAttribute('href') || '').replace('#lg-', '') : '';
        var a = benchX.children[i];
        if (a && !a.querySelector('.hk')) { var sp = document.createElement('span'); sp.className = 'hk'; sp.textContent = hk; a.appendChild(sp); }
        return { t: ixNorm(t), d: ixNorm(d), ty: ty, min: +x.getAttribute('data-min') || 0 };
      });
      var ixPass = function (i) {
        var f = ixData[i];
        if (IXF === 'quick' && f.min > 2) return false;
        if (IXF === 'game' && f.ty !== 'game') return false;
        if (IXF === 'sim' && f.ty !== 'sim') return false;
        if (IXF === 'deep' && f.min < 10) return false;
        var q = ixNorm(ixQ.value); if (!q) return true;
        return q.split(' ').every(function (w) { return f.t.indexOf(w) >= 0 || f.d.indexOf(w) >= 0; });
      };
      var ixFilter = function () {
        var on = IXF !== 'all' || !!ixNorm(ixQ.value), shown = 0;
        var cuts = document.querySelectorAll('#ixCut .cb[data-i]');
        Array.prototype.forEach.call(benchX.children, function (a, i) { var ok = ixPass(i); a.hidden = !ok; if (ok) shown++; });
        /* the building answers too: the floors keep only the blocks that match */
        Array.prototype.forEach.call(cuts, function (c) { c.classList.toggle('ix-off', on && benchX.children[+c.getAttribute('data-i')].hidden); });
        benchX.classList.toggle('ix-filtering', on);
        if (ixNone) ixNone.hidden = shown > 0;
        if (!on && LAB.ixCols) LAB.ixCols();
        var lf = document.getElementById('lfCount');
        if (lf) lf.textContent = on ? shown + (shown === 1 ? ' machine matches' : ' machines match') : LAB.countText;
      };
      ixQ.addEventListener('input', ixFilter);
      ixQ.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        var a = Array.prototype.filter.call(benchX.children, function (x) { return !x.hidden; })[0];
        if (a) { e.preventDefault(); a.click(); }
      });
      ixPills.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('button[data-f]') : null; if (!b) return;
        IXF = b.getAttribute('data-f');
        Array.prototype.forEach.call(ixPills.querySelectorAll('button[data-f]'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        ixFilter();
      });
    }
  } catch (eix) {}

  /* ---------- the dial under 1024px: it lives in the directory, and the floating one only shows while its picker is open ---------- */
  try {
    var ldDial = document.getElementById('ldDial'), tbBtn = null, dialKbT = 0;
    if (ldDial) {
      var dialSync = function () {
        tbBtn = tbBtn || document.getElementById('themeBtn');
        if (!tbBtn) return false;
        ldDial.hidden = false;
        var dd = tbBtn.querySelector('.tb-disc'); if (dd && dd.style.background) ldDial.style.setProperty('--ld-disc', dd.style.background);
        ldDial.setAttribute('aria-expanded', tbBtn.getAttribute('aria-expanded') === 'true' ? 'true' : 'false');
        return true;
      };
      var dialWire = function () {
        if (ldDial._wired || !dialSync()) return;
        ldDial._wired = true;
        if ('MutationObserver' in window) new MutationObserver(function () {
          var was = ldDial.getAttribute('aria-expanded') === 'true';
          dialSync();
          /* the picker closes by handing focus to the floating dial; hand it back to the one you pressed */
          if (was && tbBtn.getAttribute('aria-expanded') !== 'true' && ldDial._from) {
            ldDial._from = false;
            setTimeout(function () { var ae = document.activeElement; if (ae === tbBtn || ae === document.body) { try { ldDial.focus({ preventScroll: true }); } catch (e) {} } }, 0);
          }
        }).observe(tbBtn, { attributes: true, attributeFilter: ['aria-expanded', 'style'], subtree: true });
      };
      ldDial.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!dialSync()) return;
        if (LAB.closeIndex) LAB.closeIndex(false);
        ldDial._from = true;
        tbBtn.click();
        dialSync();
        /* opened from the keyboard: land on the chosen light once the presses stop (five quick ones still find the hidden room) */
        clearTimeout(dialKbT);
        if (e.detail === 0) dialKbT = setTimeout(function () {
          if (document.activeElement !== ldDial || tbBtn.getAttribute('aria-expanded') !== 'true') return;
          var tl = document.querySelector('#themePanel .th-tile[aria-selected="true"]'); if (tl) try { tl.focus(); } catch (er) {}
        }, 650);
      });
      var dialTry = function () { dialWire(); if (!ldDial._wired) setTimeout(dialWire, 400); };
      if (document.readyState === 'complete') dialTry();
      else { document.addEventListener('DOMContentLoaded', function () { setTimeout(dialTry, 0); }); window.addEventListener('load', dialWire); }
    }
  } catch (edial) {}

  /* ---------- verdict tick: each time a machine speaks, its line settles in (text changes only, 600ms apart) ---------- */
  try {
    if (!LAB.RM && 'MutationObserver' in window) {
      var elMO = new MutationObserver(function (ms) {
        var seen = [];
        ms.forEach(function (m) {
          var n = m.target.nodeType === 1 ? m.target : m.target.parentNode;
          var el = n && n.closest ? n.closest('.eline') : null;
          if (el && seen.indexOf(el) < 0) seen.push(el);
        });
        seen.forEach(function (el) {
          var tx = el.textContent, now = performance.now();
          if (tx === el._s) return;
          el._s = tx;
          if (el._t && now - el._t < 600) return;
          el._t = now;
          el.classList.remove('tick');
          requestAnimationFrame(function () { el.classList.add('tick'); });
        });
      });
      Array.prototype.forEach.call(document.querySelectorAll('.exp .eline'), function (el) {
        el._s = el.textContent;
        elMO.observe(el, { childList: true, characterData: true, subtree: true });
      });
    }
  } catch (emo) {}

  try {
    console.log('%cP.S. LAB', 'font: bold 40px Georgia, serif; color: #FF4D00;');
    console.log('%cThe punch card uses localStorage. Nothing leaves your browser.', 'font: 12px Helvetica, sans-serif; color: #8B877C;');
  } catch (e) {}

  /* ---------- v3.2: the machines mount on demand (assets/lab/m), so the boot-time passes above run again for each card as it
     mounts: the kit dispatches labmount on the card with {slug, root} ---------- */
  try {
    window.LAB = LAB;
    var lmTheme = function (r) {
      /* theme.js fills every range once at its boot, after the inline machines had run; a mounted range gets the same last word */
      var min = +r.min || 0, max = +r.max || 100, v = +r.value;
      r.style.setProperty('--sfill', ((v - min) / (max - min || 1) * 100).toFixed(1) + '%');
    };
    document.addEventListener('labmount', function (e) {
      var x = e.target, root = e.detail && e.detail.root;
      if (!root || !x || !x.classList || !x.classList.contains('exp')) return;
      if (typeof sfPaint === 'function') Array.prototype.forEach.call(root.querySelectorAll('input[type=range]'), function (r) { sfPaint(r); lmTheme(r); });
      if (typeof elMO !== 'undefined' && elMO) Array.prototype.forEach.call(root.querySelectorAll('.eline'), function (el) {
        el._s = el.textContent;
        elMO.observe(el, { childList: true, characterData: true, subtree: true });
      });
      if (typeof labWord === 'function') Array.prototype.forEach.call(root.querySelectorAll('[data-count]'), function (el) {
        var k = el.getAttribute('data-count'), n = k === 'machines' ? LAB.exps.length : k === 'wings' ? LAB.wings.length : null;
        if (n == null) return;
        var wd = el.getAttribute('data-count-word');
        el.textContent = wd == null ? String(n) : labWord(n, /cap/i.test(wd));
      });
    });
  } catch (elm) {}
})();
