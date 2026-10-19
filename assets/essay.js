/* P.S. essays, the reading chrome (v1). Classic script, deferred after theme.js.
   1. THE SECTION BAR. A 32px strip under the nav naming the part you are in and the minutes left
      ("II · The slow seduction · 6 min left"). On phones, and phones held sideways, it rides in with the nav when you
      scroll up and leaves with it. Wider, it shows on a scroll up and leaves on the way down. It shows only inside the
      essay, never over its opener or its end cards, and it hangs from the nav's lower edge.
   2. THE CONTENTS. A tap on the bar opens PS.sheet: every part as a 48px row with its length, then the notes, the Lab
      and the next essay. A row jumps there and moves focus to that heading.
   3. THE NOTES FOLD. At 759px and below, the notes and pictures fold behind one 48px key. hidden="until-found" keeps
      them reachable by find-in-page. Without script, and from 760px, everything shows as before.
   Nothing measures layout until the bar is about to show, and reading down costs one comparison a frame. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var essay = d.querySelector('.pxe-essay');
  if (!essay || essay._esReady) return;
  essay._esReady = true;
  var PS = window.PS || {};
  var Q = PS.Q || { phone: '(max-width: 640px)', narrow: '(max-width: 759px)', land: '(max-height: 500px) and (pointer: coarse)' };
  function mm(q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; }
  function onMq(m, fn) { if (m.addEventListener) m.addEventListener('change', fn); else if (m.addListener) m.addListener(fn); }
  var rmq = mm('(prefers-reduced-motion: reduce)');
  var hideQ = mm(Q.phone + ', ' + Q.land);
  var narrowQ = mm(Q.narrow);
  var NO = '№ ';
  var raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function (f) { return setTimeout(f, 16); };
  var idle = window.requestIdleCallback ? function (f) { window.requestIdleCallback(f, { timeout: 2000 }); } : function (f) { setTimeout(f, 600); };

  function make(tag, cls, text) {
    var e = d.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function clean(node) { return node ? String(node.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  function wordsIn(node) { var t = clean(node); return t ? t.split(' ').length : 0; }
  function roman(n) {
    var r = '', v = [10, 9, 5, 4, 1], s = ['X', 'IX', 'V', 'IV', 'I'];
    for (var i = 0; i < v.length; i++) while (n >= v[i]) { r += s[i]; n -= v[i]; }
    return r;
  }
  function focusOn(el) {
    if (!el) return;
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    try { el.focus({ preventScroll: true }); } catch (x) { el.focus(); }
  }

  var nav = d.querySelector('.nav--glass');
  var opener = essay.querySelector('.e-open');
  var h1 = essay.querySelector('h1');
  var hr = null, end = essay.querySelector('.e-end'), lab = essay.querySelector('.e-lab');
  for (var c = essay.firstElementChild; c; c = c.nextElementSibling) if (c.tagName === 'HR') { hr = c; break; }
  var enav = d.querySelector('.enav');
  var title = h1 ? clean(h1) : d.title;
  var folio = essay.querySelector('.e-folio');
  var num = '', MINS = 0;
  if (folio) {
    var fs = folio.querySelectorAll('span');
    for (var f = 0; f < fs.length; f++) {
      var ft = clean(fs[f]), m = /^(\d+) min read$/.exec(ft);
      if (m) MINS = parseInt(m[1], 10);
      if (fs[f].classList.contains('no')) num = ft.replace(/\D/g, '');
    }
  }

  /* ================================================================
     3. THE NOTES FOLD. Runs at once: it is cheap, and it sits far below the first screen.
     ================================================================ */
  var fold = null;
  if (end) {
    var nNotes = end.querySelectorAll('.e-notes > li').length, nPics = end.querySelectorAll('.e-pics > li').length;
    var heads = end.querySelectorAll('.e-end-h'), hl = [];
    for (var h = 0; h < heads.length; h++) hl.push(clean(heads[h]).toLowerCase());
    var label = hl.length ? hl.join(' and ').replace(/^./, function (x) { return x.toUpperCase(); }) : 'Notes and pictures';
    var counts = [];
    if (nNotes) counts.push(nNotes + (nNotes === 1 ? ' note' : ' notes'));
    if (nPics) counts.push(nPics + (nPics === 1 ? ' picture' : ' pictures'));
    if (!end.id) end.id = 'eEnd';
    var key = make('button', 'e-end-key');
    key.type = 'button';
    key.setAttribute('aria-controls', end.id);
    key.appendChild(make('span', 'e-end-key-l', label));
    key.appendChild(make('span', 'e-end-key-n', counts.join(' · ')));
    var g = make('span', 'e-end-key-g'); g.setAttribute('aria-hidden', 'true'); key.appendChild(g);
    end.parentNode.insertBefore(key, end);
    var findable = 'onbeforematch' in d.body;
    var open = false;
    var applyFold = function () {
      if (narrowQ.matches && !open) end.setAttribute('hidden', findable ? 'until-found' : '');
      else end.removeAttribute('hidden');
      key.setAttribute('aria-expanded', open || !narrowQ.matches ? 'true' : 'false');
      key.classList.toggle('is-open', open);
    };
    var setFold = function (v, arrive) {
      open = !!v;
      applyFold();
      if (open && arrive && !rmq.matches) {
        end.classList.remove('is-arriving'); void end.offsetWidth; end.classList.add('is-arriving');
      }
    };
    key.addEventListener('click', function () { setFold(!open, true); });
    end.addEventListener('beforematch', function () { open = true; applyFold(); });
    end.addEventListener('animationend', function () { end.classList.remove('is-arriving'); });
    onMq(narrowQ, applyFold);
    applyFold();
    fold = { key: key, open: function () { if (!open) setFold(true, false); }, label: label, counts: counts };
  }

  /* ================================================================
     1 and 2. THE BAR AND THE CONTENTS. Built on idle, or on the first scroll up.
     ================================================================ */
  if (!PS.sheet || !nav) return;
  var secs = [], blocks = [], W = 0, built = false;
  function excerpt(p) {
    var t = clean(p);
    if (t.length <= 150) return t;
    t = t.slice(0, 150);
    return t.slice(0, t.lastIndexOf(' '));
  }
  function build() {
    if (built) return;
    built = true;
    var cur = { kind: 'open', el: opener || h1, focus: h1, n: '', t: 'Opening', words: 0, ex: '' }, parts = 0;
    secs.push(cur);
    for (var k = essay.firstElementChild; k && k !== hr; k = k.nextElementSibling) {
      var tag = k.tagName;
      if (tag === 'H2') {
        parts++;
        cur = { kind: 'h2', el: k, focus: k, n: roman(parts), t: clean(k), words: 0, ex: '' };
        secs.push(cur);
      } else if (k.classList.contains('e-break')) {
        var r = k.querySelector('.e-roman'), rn = r ? clean(r) : roman(secs.length);
        cur = { kind: 'part', el: k, focus: k, n: rn, t: 'Part ' + rn, words: 0, ex: '' };
        secs.push(cur);
      }
      if (tag === 'P' || tag === 'H2' || tag === 'BLOCKQUOTE' || tag === 'UL' || tag === 'OL') {
        var w = wordsIn(k);
        if (!w) continue;
        blocks.push({ el: k, w: w, t: 0, h: 1 });
        cur.words += w; W += w;
        if (!cur.ex && tag === 'P' && cur.kind !== 'h2') cur.ex = excerpt(k);
      }
    }
    /* the numbered-break essays (Planes, Sip) open straight on Part I */
    secs = secs.filter(function (s) { return s.words > 0 || s.kind !== 'open'; });
    if (secs.length === 1 && secs[0].kind === 'open') secs[0].t = 'From the top';
    secs.forEach(function (s) { s.mins = W && MINS ? Math.max(1, Math.round(MINS * s.words / W)) : 0; });
  }

  /* geometry: read only when needed, kept until the essay changes size */
  var dirty = true, G = { open: 0, stop: Infinity, hr: Infinity };
  function measure() {
    if (!dirty) return;
    dirty = false;
    var sy = window.pageYOffset || 0, i, r;
    for (i = 0; i < blocks.length; i++) { r = blocks[i].el.getBoundingClientRect(); blocks[i].t = r.top + sy; blocks[i].h = Math.max(1, r.height); }
    for (i = 0; i < secs.length; i++) secs[i].y = secs[i].el.getBoundingClientRect().top + sy;
    G.open = opener ? opener.getBoundingClientRect().bottom + sy : 0;
    G.hr = hr ? hr.getBoundingClientRect().top + sy : Infinity;
    G.stop = enav ? enav.getBoundingClientRect().top + sy : root.scrollHeight;
  }
  if ('ResizeObserver' in window) { try { new ResizeObserver(function () { dirty = true; }).observe(essay); } catch (x) {} }
  addEventListener('resize', function () { dirty = true; barY = -1; }, { passive: true });

  var barY = -1, navOn = !nav.classList.contains('nav-away');
  function navStuck() {
    var cs = getComputedStyle(nav);
    return cs.position === 'sticky' || cs.position === 'fixed' ? Math.max(0, Math.round(nav.offsetHeight + (parseFloat(cs.top) || 0))) : 0;
  }
  function readLine() { return (window.pageYOffset || 0) + (navOn ? Math.max(0, barY) + 32 : 0) + 24; }
  function where() {
    measure();
    var line = readLine(), s = secs[0], i;
    for (i = 0; i < secs.length; i++) if (secs[i].y <= line) s = secs[i];
    var left = 0;
    for (i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      if (b.t + b.h <= line) continue;
      left += b.t >= line ? b.w : b.w * (b.t + b.h - line) / b.h;
    }
    var after = line > G.hr;
    var mins = after || !W || !MINS || left < 1 ? 0 : Math.max(1, Math.round(MINS * left / W));
    return { s: s, after: after, mins: mins, done: after ? 1 : (W ? 1 - left / W : 0) };
  }
  function inBody() {
    measure();
    var y = window.pageYOffset || 0;
    return y + Math.max(0, barY) > G.open - 8 && y + (window.innerHeight || 0) * 0.55 < G.stop;
  }

  /* ---------- the bar ---------- */
  var bar = null, btn, bN, bT, bM, on = false, hold = false, sheet = null, api = null, lastKey = '';
  function makeBar() {
    if (bar) return;
    build();
    bar = make('div', 'e-bar');
    btn = make('button', 'e-bar-b');
    btn.type = 'button';
    bN = make('span', 'e-bar-n'); bT = make('span', 'e-bar-t'); bM = make('span', 'e-bar-m');
    bN.setAttribute('aria-hidden', 'true'); bT.setAttribute('aria-hidden', 'true'); bM.setAttribute('aria-hidden', 'true');
    var gl = d.createElementNS('http://www.w3.org/2000/svg', 'svg');
    gl.setAttribute('class', 'e-bar-g'); gl.setAttribute('viewBox', '0 0 16 16'); gl.setAttribute('aria-hidden', 'true'); gl.setAttribute('focusable', 'false');
    var pth = d.createElementNS('http://www.w3.org/2000/svg', 'path');
    pth.setAttribute('d', 'M2 4.5h12M2 8h12M2 11.5h7');
    gl.appendChild(pth);
    btn.appendChild(bN); btn.appendChild(bT); btn.appendChild(bM); btn.appendChild(gl);
    bar.appendChild(btn);
    nav.parentNode.insertBefore(bar, nav.nextSibling);
    btn.addEventListener('click', function () {
      makeSheet();
      if (api.isOpen()) { api.close(); return; }
      fillSheet();
      api.open(btn);
    });
    bar.addEventListener('focusin', function () { if (!on) { hold = false; set(true); } });
    paint(true);
  }
  function paint(force) {
    if (!bar || (!on && !force)) return;
    var w = where(), s = w.s, n, t, spoken;
    if (w.after) { n = ''; t = fold ? fold.label : 'Notes'; spoken = t; }
    else if (s.kind === 'open') { n = num ? NO + num : ''; t = title; spoken = 'the opening'; }
    else if (s.kind === 'part') { n = ''; t = s.t; spoken = s.t; }
    else { n = s.n; t = s.t; spoken = 'part ' + s.n + ', ' + s.t; }
    var mtxt = w.mins ? w.mins + ' min left' : '';
    var k = n + '|' + t + '|' + mtxt;
    if (k === lastKey) return;
    lastKey = k;
    bN.textContent = n; bT.textContent = t; bM.textContent = mtxt;
    bN.hidden = !n; bM.hidden = !mtxt;
    btn.setAttribute('aria-label', 'Contents. Now reading ' + spoken + '.' + (w.mins ? ' ' + w.mins + (w.mins === 1 ? ' minute' : ' minutes') + ' left.' : ''));
  }
  function set(v) {
    if (!bar) { if (!v) return; makeBar(); }
    if (v) {
      if (barY < 0) barY = navStuck();
      bar.style.setProperty('--e-bar-y', barY + 'px');
    }
    if (v === on) return;
    on = v;
    if (v) paint(true);
    bar.classList.toggle('is-on', v);
    root.classList.toggle('e-bar-on', v);
  }

  /* when it shows */
  var lastY = window.pageYOffset || 0, ticking = false;
  function sheetOpen() { return root.classList.contains('sheet-open'); }
  function tick() {
    ticking = false;
    var y = window.pageYOffset || 0, dy = y - lastY;
    if (sheetOpen()) { lastY = y; return; }
    if (hideQ.matches) {
      lastY = y;
      if (!navOn || hold) { if (on) set(false); return; }
      /* on the way down it never arrives (it leaves with the nav); on the way up it rides in */
      if (dy > 0) { if (on && !inBody()) set(false); return; }
      set(inBody());
      return;
    }
    if (Math.abs(dy) < 6) return;
    lastY = y;
    if (dy > 0) { if (on && !bar.contains(d.activeElement)) set(false); return; }
    if (hold) return;
    set(inBody());
  }
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; raf(function () { tick(); if (on) paint(); }); }
  }, { passive: true });
  addEventListener('psnav', function (e) {
    var det = (e && e.detail) || {};
    navOn = !!det.shown;
    if (det.shown && det.b) barY = det.b;
    if (!hideQ.matches || sheetOpen()) return;
    if (!navOn) { if (on) set(false); }
    else if (!hold) raf(function () { set(inBody()); });
  });
  /* a jump from the contents holds the bar back until the reader moves again */
  function release() { hold = false; }
  ['wheel', 'touchstart', 'keydown'].forEach(function (t) { addEventListener(t, release, { passive: true, capture: true }); });
  onMq(hideQ, function () { barY = -1; dirty = true; if (on) set(false); });
  idle(build);

  /* ---------- the contents ---------- */
  function row(cls, i, t, ex, n) {
    var li = make('li'), b = make('button', 'ps-row ' + cls);
    b.type = 'button';
    var ni = make('span', 'e-toc-i', i || '');
    ni.setAttribute('aria-hidden', 'true');
    b.appendChild(ni);
    var tx = make('span', 'e-toc-x');
    tx.appendChild(make('span', 'e-toc-t', t));
    if (ex) { var e = make('span', 'e-toc-e', ex); e.setAttribute('aria-hidden', 'true'); tx.appendChild(e); }
    b.appendChild(tx);
    if (n) b.appendChild(make('span', 'n', n));
    li.appendChild(b);
    return { li: li, b: b };
  }
  var tocRows = [], sumLeft, sumBar;
  function makeSheet() {
    if (sheet) return;
    build();
    sheet = make('div', 'e-toc');
    sheet.setAttribute('aria-labelledby', 'eTocT');
    var head = make('div', 'ps-sheet-head');
    var ht = make('h2', 'ps-sheet-title', 'Contents'); ht.id = 'eTocT';
    var cl = make('button', 'ps-sheet-close', 'Close'); cl.type = 'button';
    head.appendChild(ht); head.appendChild(cl);
    sheet.appendChild(head);

    var sum = make('div', 'e-toc-sum');
    var kk = make('p', 'e-toc-k');
    if (num) kk.appendChild(make('span', 'e-toc-no', NO + num));
    if (MINS) kk.appendChild(make('span', '', MINS + ' min read'));
    sum.appendChild(kk);
    sum.appendChild(make('p', 'e-toc-tt', title));
    sumBar = make('span', 'e-toc-pr'); sumBar.setAttribute('aria-hidden', 'true');
    sumBar.appendChild(make('i'));
    sum.appendChild(sumBar);
    sumLeft = make('p', 'e-toc-left');
    sum.appendChild(sumLeft);
    sheet.appendChild(sum);

    var ul = make('ul', 'ps-sheet-list e-toc-list');
    secs.forEach(function (s) {
      var r = row('e-toc-row', s.kind === 'open' ? '' : s.n, s.t, s.kind === 'h2' ? '' : s.ex, s.mins ? s.mins + ' min' : '');
      r.b.addEventListener('click', function () { jump(s.kind === 'open' ? null : s.el, s.focus); });
      tocRows.push({ b: r.b, s: s });
      ul.appendChild(r.li);
    });
    if (end && fold) {
      var re = row('e-toc-row e-toc-row--end', '', fold.label, '', fold.counts.join(' · '));
      re.b.addEventListener('click', function () {
        fold.open();
        jump(narrowQ.matches ? fold.key : end, narrowQ.matches ? fold.key : end.querySelector('.e-end-h'));
      });
      tocRows.push({ b: re.b, end: true });
      ul.appendChild(re.li);
    }
    if (lab) {
      var lt = lab.querySelector('.e-lab-t'), lk = lab.querySelector('.e-lab-k');
      var rl = row('e-toc-row e-toc-row--lab', '', (lk ? clean(lk) : 'From the Lab') + ': ' + clean(lt), '', '');
      rl.b.addEventListener('click', function () { jump(lab, lab.querySelector('a')); });
      ul.appendChild(rl.li);
    }
    sheet.appendChild(ul);

    if (enav) {
      var links = [enav.querySelector('a.next'), enav.querySelector('a.prev')].filter(Boolean);
      if (links.length) {
        sheet.appendChild(make('p', 'e-toc-g', 'More essays'));
        var ul2 = make('ul', 'ps-sheet-list e-toc-list e-toc-list--more');
        links.forEach(function (a) {
          var li = make('li'), x = make('a', 'ps-row e-toc-row e-toc-row--go');
          x.href = a.getAttribute('href');
          var t = a.querySelector('.t'), no = a.querySelector('.enav-no');
          x.appendChild(make('span', 'e-toc-i e-toc-i--k', a.classList.contains('next') ? 'Next' : 'Previous'));
          var tx = make('span', 'e-toc-x'); tx.appendChild(make('span', 'e-toc-t', t ? clean(t) : clean(a)));
          x.appendChild(tx);
          if (no) x.appendChild(make('span', 'n', clean(no)));
          li.appendChild(x); ul2.appendChild(li);
        });
        sheet.appendChild(ul2);
      }
    }
    d.body.appendChild(sheet);
    api = PS.sheet(sheet, { opener: btn, bind: false });
    cl.addEventListener('click', function () { api.close(); });
  }
  function fillSheet() {
    var w = where();
    tocRows.forEach(function (r) {
      var cur = r.end ? w.after : (!w.after && r.s === w.s);
      if (cur) { r.b.setAttribute('aria-current', 'location'); r.b.setAttribute('data-autofocus', ''); }
      else { r.b.removeAttribute('aria-current'); r.b.removeAttribute('data-autofocus'); }
    });
    sumLeft.textContent = w.after ? 'Read to the end' : (w.mins ? w.mins + ' min left' : '');
    sumBar.firstChild.style.transform = 'scaleX(' + Math.max(0, Math.min(1, w.done)).toFixed(3) + ')';
  }
  function jump(target, focusEl) {
    hold = true;
    if (api) api.close(true);
    set(false);
    if (target) target.scrollIntoView({ block: 'start', behavior: 'auto' });
    else window.scrollTo(0, 0);
    lastY = window.pageYOffset || 0;
    focusOn(focusEl || target);
  }
})();
