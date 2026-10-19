/* P.S. Lab, No. 11: You are not in the burger business. Moved verbatim from experiments.html (Rev 047) in v3.2: the markup is TPL, the code
   is the machine's original block. It mounts through LAB_KIT on the shared canvas kit (canvas.js). */
(function () {
  'use strict';
  var TPL = '<p class="rb-q">Where does McDonald’s make its money today?</p>\n'
    + '      <div class="btnrow">\n'
    + '        <button class="ebtn2 rbQ" data-q="burgers" type="button" aria-pressed="false">Selling burgers</button>\n'
    + '        <button class="ebtn2 rbQ" data-q="fees" type="button" aria-pressed="false">Franchise fees and royalties</button>\n'
    + '        <button class="ebtn2 rbQ" data-q="rent" type="button" aria-pressed="false">Rent</button>\n'
    + '      </div>\n'
    + '      <p class="mh-say rb-ans" id="rbAns"></p>\n'
    + '      <div id="rbMachine" style="display:none">\n'
    + '        <svg class="rb-row" id="rbRow" viewBox="0 0 600 96" aria-hidden="true"></svg>\n'
    + '        <div class="lx-bench lx-flat lx-bleed" data-cv-local><canvas id="rbC" style="height:220px"></canvas></div>\n'
    + '        <input type="range" id="rbYears" min="1" max="20" value="1" aria-label="Years since 1955">\n'
    + '        <div class="readout">\n'
    + '          <span><span class="k">Year</span><span class="v" id="rbYr">1956</span></span>\n'
    + '          <span><span class="k">Fees & royalties</span><span class="v" id="rbFees">$0.4M</span></span>\n'
    + '          <span><span class="k">Sonneborn’s rent</span><span class="v up" id="rbRent">$0.1M</span></span>\n'
    + '        </div>\n'
    + '        <p class="eline" id="rbLine">Sonneborn’s plan: buy or lease the land under each new store, then sublease it to the franchisee at a markup that rises every year. Drag the years and watch the landlord pass the restaurant.</p>\n'
    + '      </div>';
  LAB_KIT.mount('burger-business', null, function (root, ctx) {
    root.innerHTML = TPL;
    /* ---------- burger business ---------- */

      var rbBtns = Array.prototype.slice.call(document.querySelectorAll('.rbQ'));
      var rbAns = document.getElementById('rbAns');
      var rbMachine = document.getElementById('rbMachine');
      var rbYears = document.getElementById('rbYears');
      var rbC = document.getElementById('rbC');
      var rbSaid = false, rbFlared = false, rbFl = 0, rbRowEl = document.getElementById('rbRow');
      /* the row of stores: one a year, each standing on a parcel of land the company holds */
      (function () {
        var h = '';
        for (var k = 0; k < 20; k++) {
          var x = (16 + k * 28.6).toFixed(1);
          h += '<g transform="translate(' + x + ' 0)"><path class="lot" d="M0 76l13-6.5 13 6.5-13 6.5z"/><path class="wl" d="M5 76l8 4v-12l-8-4z"/>' +
            '<path class="wr" d="M13 80l8-4v-12l-8 4z"/><path class="rf" d="M5 64l8-4 8 4-8 4z"/></g>';
        }
        rbRowEl.setAttribute('viewBox', '0 52 600 36');
        rbRowEl.innerHTML = h;
      })();
      function rbFees(y) { return 0.095 + 0.38 * y; }
      function rbCross() { for (var k = 1; k <= 20; k++) { var d0 = rbRent(k - 1) - rbFees(k - 1), d1 = rbRent(k) - rbFees(k); if (d1 > 0) return Math.round(1955 + k - 1 + d0 / (d0 - d1)); } return 1975; }
      function rbRent(y) { var s = 0, r = 0.34; for (var k = 1; k <= y; k++) { s += r; r *= 1.16; } return s; }
      function rbPaint() {
        var y = +rbYears.value;
        document.getElementById('rbYr').textContent = 1955 + y;
        document.getElementById('rbFees').textContent = '$' + rbFees(y).toFixed(1) + 'M';
        document.getElementById('rbRent').textContent = '$' + rbRent(y).toFixed(1) + 'M';
        Array.prototype.forEach.call(rbRowEl.children, function (g, k) { g.classList.toggle('on', k < y); });
        var line;
        if (y < 6) line = 'Early years: the fee line wins and the rent line crawls. Most boards would kill the real estate program right here. Sonneborn’s escalators have not had time to work.';
        else if (rbRent(y) <= rbFees(y)) line = 'Watch closely. The rent line is bending upward while fees stay a straight, tired road. Compounding looks like nothing for months. Then it looks like everything.';
        else line = 'There it is: the landlord passed the restaurant in ' + rbCross() + ' and never looked back. Sonneborn told a room of bankers, in so many words, that McDonald’s is not in the food business at all; it is a real estate company whose tenants happen to sell hamburgers. The company still owns roughly forty billion dollars of land and buildings, and rent remains its most reliable profit line.';
        if (rbSaid) document.getElementById('rbLine').textContent = line;
        var f = fitCanvas(rbC, 220), ctx = f.ctx, Wd = f.W;
        if (!(Wd > 0)) return;
        ctx.clearRect(0, 0, Wd, 220);
        var maxV = Math.max(rbFees(20), rbRent(20)), L = 14, R = Wd - 14, T = 24, B = 192, k;
        function px(k) { return L + k / 20 * (R - L); }
        function py(v) { return B - v / maxV * (B - T); }
        /* the years along the floor */
        ctx.strokeStyle = inkColor(.22); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(L, cvSnap(B)); ctx.lineTo(R, cvSnap(B)); ctx.stroke();
        [5, 10, 15, 20].forEach(function (yk) {
          var x = Math.round(px(yk)) + .5;
          ctx.beginPath(); ctx.moveTo(x, B); ctx.lineTo(x, B + 4); ctx.stroke();
          cvText(ctx, String(1955 + yk), x, B + 17, { align: yk === 20 ? 'right' : 'center', halo: false, ls: '.5px' });
        });
        /* where the landlord passes the restaurant */
        var kc = 0;
        for (k = 1; k <= 20; k++) if (rbRent(k) > rbFees(k)) { kc = k; break; }
        if (kc && y >= kc) {
          var d0 = rbRent(kc - 1) - rbFees(kc - 1), d1 = rbRent(kc) - rbFees(kc), tt = d0 / (d0 - d1), xk = kc - 1 + tt;
          var vk = rbFees(kc - 1) + (rbFees(kc) - rbFees(kc - 1)) * tt;
          ctx.beginPath(); ctx.moveTo(px(xk), py(vk));
          for (k = kc; k <= y; k++) ctx.lineTo(px(k), py(rbRent(k)));
          for (k = y; k >= kc; k--) ctx.lineTo(px(k), py(rbFees(k)));
          ctx.closePath(); ctx.fillStyle = ACCA(.08); ctx.fill();
          ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = inkColor(.3);
          ctx.beginPath(); ctx.moveTo(cvSnap(px(xk)), T - 6); ctx.lineTo(cvSnap(px(xk)), B); ctx.stroke(); ctx.restore();
          cvText(ctx, String(Math.round(1955 + xk)), px(xk) + 6, T + 2, { color: inkColor(.8), ls: '.5px' });
          var ringX = px(xk), ringY = py(vk);
          /* the crossing flares once, the first time you reach it */
          if (rbFl > 0 && rbFl < 1) { ctx.beginPath(); ctx.arc(ringX, ringY, 4 + 24 * rbFl, 0, 7); ctx.strokeStyle = ACCA(.65 * (1 - rbFl)); ctx.lineWidth = 1.5; ctx.stroke(); }
          ctx.beginPath(); ctx.arc(ringX, ringY, 4, 0, 7); ctx.fillStyle = labColor('--card'); ctx.fill();
          ctx.strokeStyle = ACC(); ctx.lineWidth = 1.5; ctx.stroke();
          if (!rbFlared) { rbFlared = true; labTw(820, function (e) { rbFl = e; rbPaint(); }, function () { rbFl = 0; rbPaint(); }); }
        }
        ctx.lineJoin = 'round';
        ctx.strokeStyle = inkColor(.7); ctx.lineWidth = 1.6; ctx.beginPath();
        for (k = 0; k <= y; k++) { if (k) ctx.lineTo(px(k), py(rbFees(k))); else ctx.moveTo(px(k), py(rbFees(k))); }
        ctx.stroke();
        ctx.strokeStyle = ACC(); ctx.lineWidth = 2.2; ctx.beginPath();
        for (k = 0; k <= y; k++) { if (k) ctx.lineTo(px(k), py(rbRent(k))); else ctx.moveTo(px(k), py(rbRent(k))); }
        ctx.stroke();
        /* the names ride the ends of their lines: the upper one above, the lower one below */
        var ex = px(y), fy = py(rbFees(y)), ry = py(rbRent(y)), rentUp = ry <= fy;
        ctx.fillStyle = inkColor(.7); ctx.beginPath(); ctx.arc(ex, fy, 2.6, 0, 7); ctx.fill();
        ctx.fillStyle = ACC(); ctx.beginPath(); ctx.arc(ex, ry, 3.2, 0, 7); ctx.fill();
        var right = ex > Wd * .55, al = right ? 'right' : 'left', lx = right ? ex - 8 : ex + 8;
        var feesY = rentUp ? Math.min(B - 6, fy + 16) : fy - 9, landY = rentUp ? Math.max(12, ry - 9) : Math.min(B - 6, ry + 16);
        /* the two lines start together: stack the names above them, 13px apart */
        if (Math.abs(fy - ry) < 16) {
          var topY = Math.min(fy, ry);
          landY = Math.max(24, topY - 9); feesY = landY - 13;
          if (!rentUp) { feesY = Math.max(24, topY - 9); landY = feesY - 13; }
        }
        cvText(ctx, 'FEES & ROYALTIES', lx, feesY, { align: al, color: inkColor(.75) });
        cvText(ctx, 'THE LANDLORD', lx, landY, { align: al, color: inkColor(.86) });
      }
      rbBtns.forEach(function (b) {
        b.addEventListener('click', function () {
          var q = b.getAttribute('data-q');
          rbBtns.forEach(function (x) {
            var me = x === b;
            x.classList.toggle('is-picked', me);
            x.setAttribute('aria-pressed', me ? 'true' : 'false');
            x.classList.toggle('is-right', x.getAttribute('data-q') === 'rent');
          });
          rbAns.innerHTML = q === 'rent'
            ? 'Correct, and almost nobody gets it on the first try. The burgers are how the tenant pays the <b>rent</b>. Here is the machine that made it true.'
            : (q === 'burgers'
              ? 'That is what the sign says, and it is wrong. McDonald’s corporate makes thin margins on food; the real answer is <b>rent</b>. Here is the machine that made it true.'
              : 'Close, and wrong in an interesting way. The $950 fee nearly bankrupted them; the real answer is <b>rent</b>. Here is the machine that made it true.');
          rbMachine.style.display = 'block';
          rbPaint();
        });
      });
      rbYears.addEventListener('input', function () { rbSaid = true; rbPaint(); });
      labRepaint(function () { if (rbMachine.style.display !== 'none') rbPaint(); }, rbC);
    return {};
  });
})();
