/* Two seventy: a nonpartisan campaign on the real electoral college, for the P.S. lab.
   Two invented parties, real apportionment, real count rules, a seeded engine: the same map and the same choices
   replay the same campaign. Registers with LAB_KIT.mount; the kit loads it, pauses it off screen and keeps its errors in.
   Every margin inside the engine is Lantern minus Compass, in points; the screen converts to "you" and "them". */
(function () {
  'use strict';
  var K = window.LAB_KIT;
  if (!K || K.v < 1) return;
  var SLUG = 'electoral', F = K.fmt, MINUS = '−';

  /* ---------- the real data ----------
     id, name, electors (2024 and 2028), apportionment population in thousands (2020 Census; DC resident population),
     voting-eligible population in thousands (2024, UF Election Lab), VEP turnout % (2024), urban % (2020 Census),
     bachelor's or higher % of adults 25+ (ACS 2021 1-year), Census division, hour (ET, 24h clock) when the last polls close,
     count profile, tile column, tile row */
  var EV_STATES = [
    ['AL', 'Alabama', 9, 5030, 3867, 58.7, 57.7, 27.4, 6, 20, 'E', 7, 6],
    ['AK', 'Alaska', 3, 736, 537, 63.6, 64.9, 32.8, 9, 25, 'S', 0, 0],
    ['AZ', 'Arizona', 11, 7159, 5367, 63.9, 89.3, 32.4, 8, 21, 'S', 2, 5],
    ['AR', 'Arkansas', 6, 3014, 2202, 54.1, 55.5, 25.3, 7, 20.5, 'F', 5, 5],
    ['CA', 'California', 54, 39577, 25923, 62.3, 94.2, 36.2, 9, 23, 'S', 1, 4],
    ['CO', 'Colorado', 10, 5782, 4416, 73.4, 86.0, 44.4, 8, 21, 'F', 3, 4],
    ['CT', 'Connecticut', 7, 3608, 2670, 67.0, 86.3, 42.1, 1, 20, 'F', 10, 3],
    ['DE', 'Delaware', 3, 991, 776, 66.8, 82.6, 35.6, 5, 20, 'F', 10, 4],
    ['DC', 'District of Columbia', 3, 690, 506, 64.9, 100.0, 63.0, 5, 20, 'F', 9, 5],
    ['FL', 'Florida', 30, 21571, 16328, 67.4, 91.5, 33.2, 5, 20, 'F', 9, 7],
    ['GA', 'Georgia', 16, 10725, 7794, 68.0, 74.1, 34.6, 5, 19, 'F', 8, 6],
    ['HI', 'Hawaii', 4, 1460, 1039, 50.3, 86.1, 35.3, 9, 24, 'S', 0, 7],
    ['ID', 'Idaho', 4, 1841, 1430, 64.2, 69.2, 30.7, 8, 23, 'F', 2, 2],
    ['IL', 'Illinois', 19, 12823, 8983, 63.5, 86.9, 37.1, 3, 20, 'F', 6, 2],
    ['IN', 'Indiana', 11, 6790, 5041, 59.1, 71.2, 28.9, 3, 19, 'F', 6, 3],
    ['IA', 'Iowa', 6, 3192, 2359, 71.0, 63.2, 30.5, 4, 21, 'F', 5, 3],
    ['KS', 'Kansas', 6, 2941, 2123, 63.3, 72.3, 35.4, 4, 21, 'F', 4, 5],
    ['KY', 'Kentucky', 8, 4509, 3327, 62.9, 58.7, 27.0, 6, 19, 'E', 6, 4],
    ['LA', 'Louisiana', 8, 4661, 3305, 61.2, 71.5, 26.4, 7, 21, 'F', 5, 6],
    ['ME', 'Maine', 4, 1364, 1130, 74.6, 38.6, 36.0, 1, 20, 'F', 11, 0],
    ['MD', 'Maryland', 10, 6185, 4411, 69.4, 85.6, 42.5, 5, 20, 'F', 9, 4],
    ['MA', 'Massachusetts', 11, 7033, 5133, 68.4, 91.3, 46.6, 1, 20, 'F', 10, 2],
    ['MI', 'Michigan', 15, 10084, 7624, 74.9, 73.5, 31.7, 3, 21, 'F', 7, 2],
    ['MN', 'Minnesota', 10, 5710, 4277, 76.5, 71.9, 38.9, 4, 21, 'F', 5, 2],
    ['MS', 'Mississippi', 6, 2964, 2164, 57.8, 46.3, 24.8, 6, 20, 'E', 6, 6],
    ['MO', 'Missouri', 10, 6160, 4642, 64.6, 69.5, 31.7, 4, 20, 'F', 5, 4],
    ['MT', 'Montana', 4, 1085, 896, 68.4, 53.4, 34.8, 8, 22, 'F', 3, 2],
    ['NE', 'Nebraska', 5, 1963, 1407, 68.6, 73.0, 34.4, 4, 21, 'F', 4, 4],
    ['NV', 'Nevada', 6, 3108, 2249, 66.2, 94.1, 27.6, 8, 22, 'S', 2, 3],
    ['NH', 'New Hampshire', 4, 1379, 1127, 73.7, 58.3, 40.2, 1, 20, 'F', 11, 1],
    ['NJ', 'New Jersey', 14, 9294, 6402, 67.5, 93.8, 43.1, 2, 20, 'F', 9, 3],
    ['NM', 'New Mexico', 5, 2120, 1555, 59.7, 74.5, 30.1, 8, 21, 'F', 3, 5],
    ['NY', 'New York', 28, 20216, 13853, 60.5, 87.4, 39.9, 2, 21, 'F', 9, 2],
    ['NC', 'North Carolina', 16, 10454, 8102, 70.7, 66.7, 34.9, 5, 19.5, 'F', 7, 5],
    ['ND', 'North Dakota', 3, 780, 582, 63.9, 61.0, 31.7, 4, 21, 'F', 4, 2],
    ['OH', 'Ohio', 17, 11809, 8948, 65.4, 76.3, 30.7, 3, 19.5, 'F', 7, 3],
    ['OK', 'Oklahoma', 7, 3964, 2946, 53.5, 64.6, 27.9, 7, 20, 'F', 4, 6],
    ['OR', 'Oregon', 8, 4242, 3212, 71.9, 80.5, 36.3, 9, 23, 'S', 1, 3],
    ['PA', 'Pennsylvania', 19, 13012, 9904, 71.4, 76.5, 34.5, 2, 20, 'E', 8, 3],
    ['RI', 'Rhode Island', 4, 1098, 827, 63.3, 91.1, 36.5, 1, 20, 'F', 11, 3],
    ['SC', 'South Carolina', 9, 5125, 4122, 62.3, 67.9, 31.5, 5, 19, 'F', 8, 5],
    ['SD', 'South Dakota', 3, 888, 677, 64.5, 57.2, 31.7, 4, 21, 'F', 4, 3],
    ['TN', 'Tennessee', 11, 6917, 5318, 57.9, 66.2, 30.5, 6, 20, 'F', 6, 5],
    ['TX', 'Texas', 40, 29183, 20059, 56.8, 83.7, 33.1, 7, 21, 'F', 4, 7],
    ['UT', 'Utah', 6, 3275, 2358, 64.7, 89.8, 36.8, 8, 22, 'S', 2, 4],
    ['VT', 'Vermont', 3, 644, 527, 70.8, 35.1, 44.4, 1, 19, 'F', 10, 1],
    ['VA', 'Virginia', 13, 8655, 6350, 71.5, 75.6, 41.8, 5, 19, 'F', 8, 4],
    ['WA', 'Washington', 12, 7716, 5641, 70.2, 83.4, 39.0, 9, 23, 'S', 1, 2],
    ['WV', 'West Virginia', 4, 1795, 1387, 55.6, 44.6, 24.1, 5, 19.5, 'F', 7, 4],
    ['WI', 'Wisconsin', 10, 5897, 4484, 76.7, 67.1, 32.5, 3, 21, 'E', 6, 1],
    ['WY', 'Wyoming', 3, 578, 443, 61.2, 62.0, 29.2, 8, 21, 'F', 3, 3]
  ];
  /* Maine and Nebraska districts: an equal split of the state's VEP; the district urban and degree shares are stylized
     (a model assumption, labeled in the case file). id, name, parent, VEP thousands, turnout %, urban %, bachelor % */
  var EV_DISTRICTS = [
    ['ME1', 'Maine 1st District', 'ME', 565, 74.6, 55, 42],
    ['ME2', 'Maine 2nd District', 'ME', 565, 74.6, 22, 29],
    ['NE1', 'Nebraska 1st District', 'NE', 469, 68.6, 70, 33],
    ['NE2', 'Nebraska 2nd District', 'NE', 469, 68.6, 95, 40],
    ['NE3', 'Nebraska 3rd District', 'NE', 469, 68.6, 50, 25]
  ];
  /* House seats gained or lost in the 2020 apportionment */
  var EV_SEATCHG = { TX: 2, CO: 1, FL: 1, MT: 1, NC: 1, OR: 1, CA: -1, IL: -1, MI: -1, NY: -1, OH: -1, PA: -1, WV: -1 };
  var EV_DIV = ['', 'New England', 'Middle Atlantic', 'East North Central', 'West North Central', 'South Atlantic',
    'East South Central', 'West South Central', 'Mountain', 'Pacific'];
  /* recount rules: real where verified (NASS, October 2024; Ballotpedia for Georgia and Wisconsin), a labeled default elsewhere.
     p = margin as a percent of the two-party vote, mv = margin in votes, wv = winner's votes, tv = total votes.
     With only two candidates modeled, "total votes for the office" (NASS's basis for SC and NY) and "votes for both candidates"
     (Oregon's) are the same number. A fourth entry, where present, says when the state pays for a requested recount. */
  var EV_RECOUNT = {
    AL: ['auto', 'at 0.5 points or less', function (p) { return p <= 0.5; }],
    AZ: ['auto', 'at 0.5 points or less', function (p) { return p <= 0.5; }],
    CO: ['auto', 'within 0.5% of the winner’s vote', function (p, mv, wv) { return mv <= 0.005 * wv; }],
    CT: ['auto', 'under 0.5 points and 2,000 votes, or 20 votes', function (p, mv) { return (p < 0.5 && mv <= 2000) || mv <= 20; }],
    DC: ['auto', 'under 1 point', function (p) { return p < 1; }],
    FL: ['auto', 'at 0.5 points or less', function (p) { return p <= 0.5; }],
    HI: ['auto', 'within 100 votes or 0.25% of the vote', function (p, mv, wv, tv) { return mv <= Math.max(100, 0.0025 * tv); }],
    KY: ['auto', 'at 0.5 points or less', function (p) { return p <= 0.5; }],
    MI: ['auto', 'within 2,000 votes', function (p, mv) { return mv <= 2000; }],
    NE: ['auto', 'within 1% of the winner’s vote', function (p, mv, wv) { return mv <= 0.01 * wv; }],
    NM: ['auto', 'under 0.25 points', function (p) { return p < 0.25; }],
    ND: ['auto', 'within 0.5% of the winner’s vote', function (p, mv, wv) { return mv <= 0.005 * wv; }],
    OH: ['auto', 'under 0.25 points', function (p) { return p < 0.25; }],
    PA: ['auto', 'at 0.5 points or less', function (p) { return p <= 0.5; }],
    WA: ['auto', 'under 2,000 votes and 0.5 points', function (p, mv) { return mv < 2000 && p < 0.5; }],
    NY: ['auto', 'within 20 votes, at 0.5 points or less, or under 5,000 votes when a million or more are cast', function (p, mv, wv, tv) { return mv <= 20 || p <= 0.5 || (tv >= 1e6 && mv < 5000); }],
    OR: ['auto', 'at 0.2 points or less', function (p) { return p <= 0.2; }],
    SC: ['auto', 'under 1 point', function (p) { return p < 1; }],
    WY: ['auto', 'within 1% of the winner’s vote', function (p, mv, wv) { return mv < 0.01 * wv; }],
    GA: ['request', 'on request at 0.5 points or less; the state pays', function (p) { return p <= 0.5; }, function () { return true; }],
    MT: ['request', 'on request at 0.5 points or less; the state pays at 0.25 or less, otherwise the requester pays', function (p) { return p <= 0.5; }, function (p) { return p <= 0.25; }],
    WI: ['request', 'on request under 1 point; free at 0.25 or less, otherwise the requester pays', function (p) { return p < 1; }, function (p) { return p <= 0.25; }]
  };
  var EV_RECOUNT_DEF = ['request', 'on request at 0.5 points or less; the requester pays', function (p) { return p <= 0.5; }];
  /* 2020 apportionment: House seats = electors - 2 (checked in the harness against Census Table 1) */
  /* how each kind of state counts: shares of [mail and early, election day, late-arriving] ballots */
  var PROF = {
    F: { sh: [0.50, 0.47, 0.03], nm: 'Mail processed early', d: 'Pre-processed mail reports first, then in-person votes, then a small late tail.' },
    E: { sh: [0.30, 0.67, 0.03], nm: 'Mail counted on the day', d: 'Mail-ballot envelopes may not be processed before Election Day, so in-person votes report first and mail counts through the night.' },
    S: { sh: [0.45, 0.20, 0.35], nm: 'The long count', d: 'Early mail reports first, then in-person votes, then a large tail of late and dropped-off mail over days (a stylized model profile).' }
  };
  var TYPE_NM = ['Mail', 'In person', 'Late'], TYPE_LC = ['mail', 'in-person', 'late-arriving'];
  var POLLSTERS = [
    { nm: 'Harrow Research', n: 800, mode: 'live phone and text', h: 1.2 },
    { nm: 'Seawall Survey', n: 1000, mode: 'mixed mode', h: 1.2 },
    { nm: 'Northfield Polling', n: 600, mode: 'live phone', h: 1.2 },
    { nm: 'Calder & Pike', n: 1200, mode: 'online panel', h: 1.2 },
    { nm: 'Quarry Insights', n: 500, mode: 'online opt-in', h: 2.0, x: 1.5 },
    { nm: 'Sextant Data', n: 900, mode: 'text-to-web', h: 1.2 }
  ];
  var ERAS = {
    DD: { nm: 'Density and diploma', au: 5, ab: 7, sdDiv: 3, sdE: 4.5 },
    RG: { nm: 'The old regions', au: 1.5, ab: 1.5, sdDiv: 9, sdE: 4.5 },
    CL: { nm: 'Class lines', au: 6, ab: -6, sdDiv: 3.5, sdE: 4.5 },
    SC: { nm: 'Scrambled', au: 0, ab: 0, sdDiv: 5, sdE: 5 }
  };
  var SCEN = {
    E: { nm: 'Knife’s edge', s: 'the race starts close where it counts', T0: 0 },
    U: { nm: 'Uphill', s: 'the race starts a little behind where it counts', T0: -1 },
    R: { nm: 'Front-runner', s: 'the race starts a little ahead, with everything to lose', T0: 1 }
  };
  var PARTY = {
    L: { nm: 'the Lantern Party', sh: 'Lantern', cand: 'Gov. Helen Varga', cs: 'Varga', vp: 'Rep. Tomas Rhee', vs: 'Rhee' },
    C: { nm: 'the Compass Party', sh: 'Compass', cand: 'Sen. Owen Castellan', cs: 'Castellan', vp: 'Mayor Lena Whitcombe', vs: 'Whitcombe' }
  };
  var MSG = {
    P: { nm: 'Persuade the middle', a: 1.25, f: 0.9, s: 'Ads work 25% harder; the field program runs at 90%.' },
    B: { nm: 'Fire up the base', a: 0.85, f: 1.3, s: 'Ads land softer; doors and turnout run 30% hotter; your side gets keener to vote.' },
    X: { nm: 'Draw the contrast', a: 1.0, f: 1.0, s: 'Both sides get keener to vote, which helps only where you already have more supporters.' }
  };
  var POSTURE = {
    S: { nm: 'Steady', mu: 0.1, sd: 0.3, s: 'Few risks, few highlights.' },
    H: { nm: 'Sharp', mu: 0.2, sd: 0.6, s: 'Go after the record. Better on average, less predictable.' },
    W: { nm: 'Swing big', mu: 0.15, sd: 1.0, s: 'Anything can happen, and both sides’ voters get keener to turn out.' }
  };
  var STYLE = { A: 'Air war', B: 'Balanced', G: 'Ground war' };
  var KAD = 0.45, GF = 0.03;

  /* ---------- contests: 49 statewide, 5 districts, and the two at-large seats Maine and Nebraska award statewide ---------- */
  var U = [], NU = 0, NC = 56, EV56 = [], BASE56 = [], TILES = [], IDX = {}, KIDS = { ME: [], NE: [] }, CONT = { ME: 54, NE: 55 }, CI = [], DIVU = [];
  (function () {
    var st = {};
    EV_STATES.forEach(function (r) { st[r[0]] = r; });
    function mk(id, nm, ev, par, r, vep, to, ur, ba) {
      return { id: id, nm: nm, ev: ev, par: par, ap: r[3], div: r[8], cl: r[9], pf: r[10], gx: r[11], gy: r[12],
        vep: vep, to: to, ur: ur, ba: ba, u: (ur - 72) / 15, b: (ba - 34) / 6, vepM: vep / 1000, base: vep * 1000 * to / 100,
        st: par || id, stNm: par ? st[par][1] : nm, stEv: r[2] };
    }
    EV_STATES.forEach(function (r) { if (r[0] !== 'ME' && r[0] !== 'NE') U.push(mk(r[0], r[1], r[2], null, r, r[4], r[5], r[6], r[7])); });
    EV_DISTRICTS.forEach(function (d) { U.push(mk(d[0], d[1], 1, d[2], st[d[2]], d[3], d[4], d[5], d[6])); });
    NU = U.length;
    for (var d = 0; d < 10; d++) DIVU.push([]);
    U.forEach(function (u, i) { IDX[u.id] = i; EV56[i] = u.ev; BASE56[i] = u.base; if (u.par) KIDS[u.par].push(i); DIVU[u.div].push(i); CI.push(u); });
    ['ME', 'NE'].forEach(function (p) {
      var c = CONT[p], r = st[p];
      EV56[c] = 2; BASE56[c] = KIDS[p].reduce(function (s, i) { return s + U[i].base; }, 0); IDX[p] = c;
      CI[c] = { id: p, nm: r[1] + ' statewide', stNm: r[1], ev: 2, par: null, cont: true, div: r[8], cl: r[9], pf: r[10], st: p, stEv: r[2], ap: r[3], vep: r[4], to: r[5], ur: r[6], ba: r[7] };
    });
    EV_STATES.forEach(function (r) { TILES.push({ id: r[0], nm: r[1], ev: r[2], gx: r[11], gy: r[12], c: IDX[r[0]], kids: KIDS[r[0]] || null }); });
  })();
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function cl01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function adCost(i, w) { return 0.9 * U[i].vepM * (1 + 0.06 * (w - 1)); }
  function natCost(w) { return 0.55 * 243.8 * (1 + 0.06 * (w - 1)); }
  function openCost(i) { return 1.0 + 0.25 * U[i].vepM; }
  function runCost(i, l) { return 0.3 * U[i].vepM * l; }
  function adMax(i, w) { return Math.min(150, Math.max(20, Math.round(6 * adCost(i, w)))); }
  var CASH0 = 300;
  function inflow(p) { return 26 * (1 + 0.3 * (p - 0.5)); }

  var TMP = [0, 0], TMP2 = [0, 0];
  function unitVotes(G, i, m, gL, gC, o) {
    var u = U[i], p = 0.5 + m / 200;
    if (p < 0.02) p = 0.02; else if (p > 0.98) p = 0.98;
    o[0] = u.base * p * (1 + G.eta[i]) * (1 + gL);
    o[1] = u.base * (1 - p) * (1 - G.eta[i]) * (1 + gC);
    return o;
  }
  function vmar(o) { return (o[0] - o[1]) / (o[0] + o[1]) * 100; }
  /* contest margins (56) from unit votes; returns the national margin */
  function contestsFrom(VL, VC, out) {
    var tl = 0, tc = 0, i;
    for (i = 0; i < NU; i++) { out[i] = (VL[i] - VC[i]) / (VL[i] + VC[i]) * 100; tl += VL[i]; tc += VC[i]; }
    ['ME', 'NE'].forEach(function (p) {
      var l = 0, c = 0;
      KIDS[p].forEach(function (k) { l += VL[k]; c += VC[k]; });
      out[CONT[p]] = (l - c) / (l + c) * 100;
    });
    return (tl - tc) / (tl + tc) * 100;
  }
  var ORD = [];
  for (var oi = 0; oi < 56; oi++) ORD.push(oi);
  /* the contest whose electors carry one side past 270, sorting from that side's safest; sgn +1 is Lantern's view */
  function tipOf(m, sgn) {
    ORD.sort(function (a, b) { return sgn * (m[b] - m[a]) || a - b; });
    var acc = 0;
    for (var j = 0; j < 56; j++) { acc += EV56[ORD[j]]; if (acc >= 270) return ORD[j]; }
    return ORD[55];
  }
  function evFor(m, sgn) { var s = 0; for (var k = 0; k < 56; k++) if (sgn * m[k] > 0) s += EV56[k]; return s; }

  /* ---------- world generation ---------- */
  function newSide(cash) {
    return { cash: cash, A: new Float64Array(NU), AN: 0, V: new Float64Array(NU), W: new Float64Array(NU), lvl: new Int8Array(NU), e: 0,
      R: new Float64Array(NU), prep: 0, lastRally: [], opened: new Int8Array(NU), openedW: new Int8Array(NU),
      spent: { ads: new Float64Array(NU), nat: 0, field: 0, fieldU: new Float64Array(NU), evt: 0, recount: 0 } };
  }
  function genWorld(o) {
    var G = { v: 1, seed: o.seed >>> 0, eraSel: o.era, scen: o.scen, side: o.side, riv: o.side === 'L' ? 'C' : 'L', mir: o.mir === -1 ? -1 : 1 };
    G.sy = G.side === 'L' ? 1 : -1;
    var mir = G.mir, r = K.rng(G.seed), i, d;
    var s = (r() < 0.5 ? 1 : -1) * mir;
    var pool = [];
    for (i = 0; i < 49; i++) if (U[i].ev >= 6 && U[i].id !== 'DC') pool.push(i);
    var hA = pool[r.int(pool.length)], hB = hA;
    while (hB === hA) hB = pool[r.int(pool.length)];
    G.homeL = mir > 0 ? hA : hB; G.homeC = mir > 0 ? hB : hA;
    var ek = o.era === 'X' ? ['DD', 'RG', 'CL', 'SC'][r.int(4)] : o.era;
    G.era = ek; G.coal = s;
    /* the scenario is a prior, not the truth: the starting tipping margin is drawn around it (sd 1 point, in your terms, from its
       own stream so the geography of a seed is unchanged), and only the debrief reveals where it really was */
    var E = ERAS[ek], T0 = SCEN[o.scen].T0 + G.sy * mir * K.rng((G.seed + 606) >>> 0).normal();
    G.T0 = T0;
    var raw = new Float64Array(NU), mLast = new Float64Array(NU), eta = new Float64Array(NU), pi = new Float64Array(NU), drift = new Float64Array(NU);
    var home = new Float64Array(NU), m0 = new Float64Array(NU), VL = new Float64Array(NU), VC = new Float64Array(NU), cm = new Float64Array(56);
    G.eta = eta;
    home[G.homeL] += 2; home[G.homeC] -= 2;
    function tipYou(c) {
      for (var j = 0; j < NU; j++) { unitVotes(G, j, mLast[j] + drift[j] + home[j] + c, 0, 0, TMP); VL[j] = TMP[0]; VC[j] = TMP[1]; }
      var nat = contestsFrom(VL, VC, cm), t = tipOf(cm, G.sy);
      return { tip: G.sy * cm[t], nat: G.sy * nat };
    }
    var c = 0, au = E.au, ab = E.ab;
    for (var tries = 0; tries < 6; tries++) {
      au = E.au; ab = E.ab;
      if (ek === 'SC') { au = 4 * r.normal(); ab = 5 * r.normal(); }
      var rdiv = [0];
      for (d = 1; d <= 9; d++) rdiv.push(E.sdDiv * r.normal());
      var mean = 0, sd = 0;
      for (i = 0; i < NU; i++) { raw[i] = s * (au * U[i].u + ab * U[i].b) + mir * (rdiv[U[i].div] + E.sdE * r.normal()); mean += raw[i]; }
      mean /= NU;
      for (i = 0; i < NU; i++) sd += (raw[i] - mean) * (raw[i] - mean);
      sd = Math.sqrt(sd / NU) || 1;
      var T = 16 + 3 * r();
      for (i = 0; i < NU; i++) {
        mLast[i] = clamp((raw[i] - mean) * T / sd, -45, 45);
        eta[i] = mir * clamp(0.02 * r.normal(), -0.05, 0.05);
        pi[i] = 0.75 + 0.5 * r();
        drift[i] = mir * 1.5 * r.normal();
      }
      var lo = -40, hi = 40;
      for (var k = 0; k < 36; k++) { c = (lo + hi) / 2; if ((tipYou(c).tip - T0) * G.sy > 0) hi = c; else lo = c; }
      c = (lo + hi) / 2;
      var chk = tipYou(c);
      if (Math.abs(chk.tip - chk.nat) <= 4) break;
    }
    G.au = au; G.ab = ab;
    for (i = 0; i < NU; i++) m0[i] = mLast[i] + drift[i] + home[i] + c;
    G.m0 = m0; G.pi = pi; G.mLast = mLast; G.c0 = c; G.drift = drift; G.home = home;
    G.cLast = c + mir * 2 * r.normal();
    G.lastU = new Float64Array(56);
    for (i = 0; i < NU; i++) { unitVotes(G, i, mLast[i] + G.cLast, 0, 0, TMP); VL[i] = TMP[0]; VC[i] = TMP[1]; }
    G.lastNat = contestsFrom(VL, VC, G.lastU);
    var incA = r() < 0.5 ? 'L' : 'C';
    G.inc = mir > 0 ? incA : (incA === 'L' ? 'C' : 'L');
    G.sm = (r() < 0.5 ? 1 : -1) * mir; G.md = 10 + 15 * r();
    G.style = ['A', 'B', 'G'][r.int(3)];
    var rivCash = CASH0 * (0.9 + 0.2 * r());
    G.rivPost = ['S', 'H', 'W'][r.int(3)];
    /* the hidden, correlated polling error: positive means the polls overstate the Lantern Party */
    var re = K.rng(G.seed + 101);
    var eNat = mir * 2.4 * re.normal(), lamU = mir * re.normal(), lamB = mir * 1.6 * re.normal(), eDiv = [0];
    for (d = 1; d <= 9; d++) eDiv.push(mir * re.normal());
    G.E = new Float64Array(NU);
    for (i = 0; i < NU; i++) G.E[i] = eNat + lamU * U[i].u + lamB * U[i].b + eDiv[U[i].div] + mir * 1.6 * re.normal();
    G.lam = { nat: eNat, u: lamU, b: lamB };
    G.rPoll = K.rng(G.seed + 202);
    G.h = POLLSTERS.map(function (p) { return mir * p.h * G.rPoll.normal(); });
    G.rEvt = K.rng(G.seed + 303); G.rAI = K.rng(G.seed + 404); G.rNight = K.rng(G.seed + 505);
    G.hd = { L: new Float64Array(NU), C: new Float64Array(NU) };
    for (i = 0; i < NU; i++) {
      G.hd.L[i] = clamp((0.80 - U[i].to / 100 * (1 + eta[i])) / 0.15, 0.3, 1.4);
      G.hd.C[i] = clamp((0.80 - U[i].to / 100 * (1 - eta[i])) / 0.15, 0.3, 1.4);
    }
    G.S = {};
    G.S[G.side] = newSide(CASH0); G.S[G.riv] = newSide(rivCash);
    G.n = 0; G.fx = []; G.X = new Float64Array(NU); G.XD = new Float64Array(10); G.XN = 0; G.DB = 0;
    G.week = 1; G.phase = 'plan'; G.polls = []; G.hEst = [0, 0, 0, 0, 0, 0]; G.fcHist = []; G.hist = []; G.log = []; G.feed = []; G.slow = {};
    G.pend = {}; G.debates = []; G.events = []; G.tracker = { ads: new Float64Array(NU), offices: 0, wEst: new Float64Array(NU), lvl: new Int8Array(NU) };
    var keys = ['JOBS', 'STORM', 'HOTMIC', 'ENDORSE', 'LEAK', 'THIRD', 'OUTLIER', 'CRISIS', 'LAWSUIT', 'REGDRIVE', 'TOWNHALL', 'VPWEEK'];
    G.rEvt.shuffle(keys);
    G.deck = [null, null].concat(keys.slice(0, 6), ['OCT', 'EARLY']);
    G.avg = []; G.fmean = new Float64Array(NU); G.fc = null;
    return G;
  }

  /* ---------- the race as it stands ---------- */
  function recomputeFx(G) {
    var i;
    for (i = 0; i < NU; i++) G.X[i] = 0;
    for (i = 0; i < 10; i++) G.XD[i] = 0;
    G.XN = 0;
    G.fx.forEach(function (f) { if (f.s === 'N') G.XN += f.v; else if (f.s === 'D') G.XD[f.k] += f.v; else G.X[f.k] += f.v; });
  }
  /* an event effect in the player's terms: +v helps you */
  function addFx(G, s, k, v, dec, tag) { G.fx.push({ s: s, k: k, v: v * G.sy, d: dec, tag: tag || '' }); recomputeFx(G); }
  function prefMargin(G, i) {
    var L = G.S.L, C = G.S.C;
    return G.m0[i] + G.n + (L.A[i] - C.A[i]) + G.pi[i] * (L.AN - C.AN) + (L.V[i] - C.V[i]) + G.X[i] + G.XD[U[i].div] + G.XN + G.DB;
  }
  function fieldG(G, sk, i) { var W = G.S[sk].W[i]; return W > 0 ? GF * G.hd[sk][i] * (1 - Math.exp(-W / 6)) : 0; }
  var VLb = new Float64Array(64), VCb = new Float64Array(64);
  /* mode 'poll': what a likely-voter poll can see; 'sun': the race as it really stands on the final Sunday */
  function viewMargins(G, mode, out) {
    var L = G.S.L, C = G.S.C;
    for (var i = 0; i < NU; i++) {
      var m = prefMargin(G, i), gL, gC;
      if (mode === 'poll') { gL = 0.5 * fieldG(G, 'L', i) + L.e; gC = 0.5 * fieldG(G, 'C', i) + C.e; }
      else { gL = fieldG(G, 'L', i) + L.e; gC = fieldG(G, 'C', i) + C.e; m += L.R[i] - C.R[i]; }
      unitVotes(G, i, m, gL, gC, TMP); VLb[i] = TMP[0]; VCb[i] = TMP[1];
    }
    return contestsFrom(VLb, VCb, out);
  }

  /* ---------- polls, the average, house effects ---------- */
  function mkPoll(G, w, k, unit, trueM, err) {
    var P = POLLSTERS[k], r = G.rPoll;
    var day = r.int(7);
    var y = trueM + err + G.h[k] + G.mir * (100 / Math.sqrt(P.n) * r.normal() + 1.0 * r.normal() + (P.x ? P.x * r.normal() : 0));
    var und = Math.max(2.6, 8 - 0.6 * (w - 1)), sL = Math.round(50 - und / 2 + y / 2), sC = Math.round(50 - und / 2 - y / 2);
    return { w: w, day: day, k: k, unit: unit, n: P.n, sL: sL, sC: sC, y: sL - sC, moe: Math.round(1.96 * Math.sqrt(0.25 / P.n) * 1000) / 10 };
  }
  function natE(G) { var s = 0, b = 0; for (var i = 0; i < NU; i++) { s += U[i].base * G.E[i]; b += U[i].base; } return s / b; }
  function tipUnitOf(c) { if (c < NU) return c; var ks = KIDS[CI[c].id], best = ks[0]; ks.forEach(function (k) { if (U[k].base > U[best].base) best = k; }); return best; }
  function makePolls(G, w, mode) {
    var r = G.rPoll, pv = new Float64Array(56), nat = viewMargins(G, 'poll', pv), out = [], i, j;
    var ne = natE(G);
    if (mode !== 'state') for (j = 0; j < 2; j++) { var kn = r.int(6); out.push(mkPoll(G, w, kn, -1, nat, ne)); }
    if (mode !== 'nat') {
      var tipA = 0, wt = [], tot = 0, picked = {}, list = [], must = -1;
      if (G.fc) { tipA = G.fc.tipAvg; must = tipUnitOf(G.fc.tipC); }
      else {
        var cm0 = new Float64Array(56);
        for (i = 0; i < NU; i++) { VLb[i] = U[i].base * (0.5 + G.fmean[i] / 200); VCb[i] = U[i].base * (0.5 - G.fmean[i] / 200); }
        contestsFrom(VLb, VCb, cm0);
        var t0 = tipOf(cm0, G.sy); tipA = G.sy * cm0[t0]; must = tipUnitOf(t0);
      }
      for (i = 0; i < NU; i++) {
        var a = G.sy * G.fmean[i];
        wt[i] = Math.exp(-Math.abs(a - tipA) / 5) * Math.sqrt(U[i].ev) * (U[i].par ? 0.3 : 1);
      }
      var nS = 10 + r.int(4);
      if (must >= 0) { picked[must] = 1; list.push(must); }
      while (list.length < nS) {
        tot = 0;
        for (i = 0; i < NU; i++) if (!picked[i]) tot += wt[i];
        var x = r() * tot, pick = -1;
        for (i = 0; i < NU; i++) { if (picked[i]) continue; x -= wt[i]; if (x <= 0) { pick = i; break; } }
        if (pick < 0) for (i = NU - 1; i >= 0; i--) if (!picked[i]) { pick = i; break; }
        picked[pick] = 1; list.push(pick);
      }
      list.forEach(function (u) { var k = r.int(6); out.push(mkPoll(G, w, k, u, pv[u], G.E[u])); });
    }
    out.forEach(function (p) { G.polls.push(p); });
    return out;
  }
  function avgOf(ps, prior, wNow, h) {
    var P = 1 / 12.25, S = prior / 12.25;
    for (var j = 0; j < ps.length; j++) {
      var p = ps[j], v = 10000 / p.n + 2.25, wt = Math.pow(0.5, (wNow - p.w) / 1.5) / v;
      P += wt; S += wt * (p.y - h[p.k]);
    }
    return { mean: S / P, sd: 1 / Math.sqrt(P), P: P, S: S, np: ps.length };
  }
  function updateAverages(G, wNow) {
    var by = { '-1': [] }, i;
    for (i = 0; i < NU; i++) by[i] = [];
    G.polls.forEach(function (p) { if (p.w <= wNow) by[p.unit].push(p); });
    for (var it = 0; it < 2; it++) {
      var na = avgOf(by['-1'], G.lastNat, wNow, G.hEst), sHat = na.mean - G.lastNat;
      G.natAvgP = na; G.sHat = sHat;
      for (i = 0; i < NU; i++) G.avg[i] = avgOf(by[i], G.lastU[i] + sHat, wNow, G.hEst);
      if (it === 0) {
        var sm = [0, 0, 0, 0, 0, 0], ct = [0, 0, 0, 0, 0, 0];
        G.polls.forEach(function (p) {
          if (p.w > wNow) return;
          var A = p.unit < 0 ? na : G.avg[p.unit], wt = Math.pow(0.5, (wNow - p.w) / 1.5) / (10000 / p.n + 2.25), adj = p.y - G.hEst[p.k];
          var loo = (A.S - wt * adj) / (A.P - wt);
          sm[p.k] += p.y - loo; ct[p.k] += 1;
        });
        for (var k = 0; k < 6; k++) G.hEst[k] = sm[k] / (ct[k] + 4);
      }
    }
  }
  function gEffect(G, i, m, gL, gC) { return vmar(unitVotes(G, i, m, gL, gC, TMP)) - vmar(unitVotes(G, i, m, 0, 0, TMP2)); }
  /* the desk's mean: the average plus what polls cannot see (half of each side's field program, your registrations) */
  function deskMeans(G) {
    var Y = G.side, Rv = G.riv;
    for (var i = 0; i < NU; i++) {
      var a = G.avg[i].mean, gy = fieldG(G, Y, i), wE = G.tracker.wEst[i], gr = wE > 0 ? GF * G.hd[Rv][i] * (1 - Math.exp(-wE / 6)) : 0;
      var ey = gy > 0 ? gEffect(G, i, a, Y === 'L' ? gy : 0, Y === 'C' ? gy : 0) : 0;
      var er = gr > 0 ? gEffect(G, i, a, Rv === 'L' ? gr : 0, Rv === 'C' ? gr : 0) : 0;
      G.fmean[i] = a + 0.5 * ey + 0.5 * er + G.sy * G.S[Y].R[i];
    }
  }

  /* Labor Day: two national polls set the environment, then a first round of state polls where the prior says it is close */
  function openingPolls(G) {
    makePolls(G, 0, 'nat'); updateAverages(G, 0); deskMeans(G);
    makePolls(G, 0, 'state'); updateAverages(G, 0);
    G.fcAtStart = true;
  }

  /* ---------- the forecast: 4,000 simulated elections with correlated errors, and the same with independent ones ---------- */
  function fcBegin(G) {
    var w = G.week, wl = G.fcAtStart ? 9 : Math.max(0, 9 - w), sdU = new Float64Array(NU), sdI = new Float64Array(NU), i;
    for (i = 0; i < NU; i++) {
      var s2 = G.avg[i].sd * G.avg[i].sd, u = U[i];
      sdU[i] = Math.sqrt(1.6 * 1.6 + 0.25 * wl + s2 + 0.64);
      sdI[i] = Math.sqrt(2.4 * 2.4 + u.u * u.u + 2.56 * u.b * u.b + 1 + 2.56 + 0.25 * wl + s2 + 0.64);
    }
    var fm = Float64Array.from(G.fmean), cm = new Float64Array(56), VL = new Float64Array(NU), VC = new Float64Array(NU);
    for (i = 0; i < NU; i++) { VL[i] = U[i].base * (0.5 + fm[i] / 200); VC[i] = U[i].base * (0.5 - fm[i] / 200); }
    var natA = contestsFrom(VL, VC, cm);
    var tipC = tipOf(cm, G.sy);
    return { fm: fm, sdU: sdU, sdI: sdI, sdN: Math.sqrt(0.81 * wl + 0.49), r: K.rng((G.seed ^ ((G.fcAtStart ? 0 : w) * 7919 + 17)) >>> 0),
      n: 0, nI: 0, win: 0, tie: 0, invW: 0, invL: 0, winI: 0, evs: new Int16Array(4000), tip: new Float64Array(56), hist: new Int32Array(54),
      tipAvg: G.sy * cm[tipC], natAvg: G.sy * natA, tipAvgC: tipC, avgC: cm };
  }
  var MCm = new Float64Array(56), MCed = new Float64Array(10);
  function fcChunk(G, A, nSim, corr) {
    var r = A.r, mir = G.mir, sy = G.sy, i, s, bt = 0;
    for (i = 0; i < NU; i++) bt += U[i].base;
    for (s = 0; s < nSim; s++) {
      var eN = 0, lu = 0, lb = 0;
      if (corr) { eN = 2.4 * r.normal(); lu = r.normal(); lb = 1.6 * r.normal(); for (var d = 1; d <= 9; d++) MCed[d] = r.normal(); }
      var dn = A.sdN * r.normal(), nat = 0;
      for (i = 0; i < NU; i++) {
        var u = U[i], e = corr ? eN + lu * u.u + lb * u.b + MCed[u.div] : 0;
        MCm[i] = A.fm[i] + mir * (dn - e + (corr ? A.sdU[i] : A.sdI[i]) * r.normal());
        nat += u.base * MCm[i];
      }
      nat /= bt;
      for (var p = 0; p < 2; p++) {
        var ks = KIDS[p ? 'NE' : 'ME'], l = 0, b = 0;
        for (var q = 0; q < ks.length; q++) { l += U[ks[q]].base * MCm[ks[q]]; b += U[ks[q]].base; }
        MCm[54 + p] = l / b;
      }
      var ev = evFor(MCm, sy), natY = sy * nat;
      if (!corr) { if (ev >= 270) A.winI++; A.nI++; continue; }
      A.evs[A.n] = ev; A.n++;
      A.hist[Math.min(53, Math.floor(ev / 10))]++;
      if (ev >= 270) { A.win++; if (natY < 0) A.invW++; }
      else if (ev === 269) A.tie++;
      else if (natY > 0) A.invL++;
      if (ev !== 269) A.tip[tipOf(MCm, ev >= 270 ? sy : -sy)]++;
    }
  }
  function fcFinish(G, A) {
    var n = A.n || 1, fc = { pWin: A.win / n, pTie: A.tie / n, pInvW: A.invW / n, pInvL: A.invL / n, pInd: A.winI / (A.nI || 1),
      hist: A.hist, tip: new Float64Array(56), power: new Float64Array(56), tipAvg: A.tipAvg, tipAvgC: A.tipAvgC, natAvg: A.natAvg, bias: A.tipAvg - A.natAvg, avgC: A.avgC };
    var ev = Array.prototype.slice.call(A.evs, 0, A.n).sort(function (a, b) { return a - b; });
    fc.evMed = ev[Math.floor(n / 2)]; fc.ev10 = ev[Math.floor(n * 0.1)]; fc.ev90 = ev[Math.min(n - 1, Math.floor(n * 0.9))];
    var st = 0, sv = 0, k, best = 0;
    for (k = 0; k < 56; k++) { fc.tip[k] = A.tip[k] / n; st += fc.tip[k]; if (fc.tip[k] > fc.tip[best]) best = k; }
    for (k = 0; k < NU; k++) sv += U[k].base;
    var ratio = st > 0 ? st / sv : 1;
    for (k = 0; k < 56; k++) fc.power[k] = (fc.tip[k] / BASE56[k]) / ratio;
    fc.tipC = best;
    fc.tipU = new Float64Array(NU);
    for (k = 0; k < NU; k++) fc.tipU[k] = fc.tip[k] + (U[k].par ? fc.tip[CONT[U[k].par]] * U[k].base / BASE56[CONT[U[k].par]] : 0);
    G.fc = fc;
    G.fcHist.push({ w: G.fcAtStart ? 0 : G.week, pWin: fc.pWin, pInd: fc.pInd, evMed: fc.evMed, tipC: fc.tipC, tipAvg: fc.tipAvg, bias: fc.bias, natAvg: fc.natAvg });
    return fc;
  }
  function forecastSync(G) {
    deskMeans(G);
    var A = fcBegin(G);
    fcChunk(G, A, 4000, true); fcChunk(G, A, 4000, false);
    return fcFinish(G, A);
  }
  /* the same forecast in four chunks per pass, so the page never waits on it */
  function forecastAsync(G, done, onErr) {
    deskMeans(G);
    var A = fcBegin(G), step = 0;
    function go() {
      try {
        if (step < 4) fcChunk(G, A, 1000, true); else fcChunk(G, A, 1000, false);
        step++;
        if (step < 8) setTimeout(go, 0); else done(fcFinish(G, A));
      } catch (e) { if (onErr) onErr(e); }
    }
    setTimeout(go, 0);
  }
  /* analytic correlation of the systematic error between two units (the error twins) */
  function rho(i, j) {
    var a = U[i], b = U[j];
    function cov(x, y) { return 5.76 + x.u * y.u + 2.56 * x.b * y.b + (x.div === y.div ? 1 : 0); }
    if (i === j) return 1;
    return cov(a, b) / Math.sqrt((cov(a, a) + 2.56) * (cov(b, b) + 2.56));
  }
  function twins(i) {
    var out = [];
    for (var j = 0; j < 49; j++) if (j !== i) out.push({ j: j, r: rho(i, j) });
    out.sort(function (a, b) { return b.r - a.r; });
    return out;
  }
  function tipsOrder(G) {
    var o = [];
    for (var i = 0; i < NU; i++) o.push(i);
    o.sort(function (a, b) { return G.fc.tipU[b] - G.fc.tipU[a] || Math.abs(G.fmean[a] * G.sy - G.fc.tipAvg) - Math.abs(G.fmean[b] * G.sy - G.fc.tipAvg); });
    return o;
  }
  function compList(G, n, excl) {
    var o = [];
    for (var i = 0; i < 49; i++) if (U[i].ev >= 4 && U[i].id !== 'DC' && (!excl || excl.indexOf(i) < 0)) o.push(i);
    o.sort(function (a, b) { return Math.abs(G.sy * G.fmean[a] - G.fc.tipAvg) - Math.abs(G.sy * G.fmean[b] - G.fc.tipAvg); });
    return o.slice(0, n);
  }

  /* ---------- plans: the player's and the rival's share one shape ---------- */
  /* man: the contests whose ad line the player has set by hand; those keep the player's number from week to week */
  function emptyPlan() { return { msg: 'P', ads: new Float64Array(NU), nat: 0, lvl: new Int8Array(NU), c: ['f', 'f', 'f'], r: ['f', 'f', 'f'], ev: null, post: 'S', rows: [], man: {} }; }
  function clonePlan(p) {
    var man = {};
    Object.keys(p.man || {}).forEach(function (k) { man[k] = 1; });
    return { msg: p.msg, ads: Float64Array.from(p.ads), nat: p.nat, lvl: Int8Array.from(p.lvl), c: p.c.slice(), r: p.r.slice(), ev: p.ev, post: p.post, rows: p.rows.slice(), sug: p.sug, man: man };
  }
  function prepWeek(w) { return w === 2 || w === 3 || w === 6 || w === 7; }
  function debateWeek(w) { return w === 3 || w === 5 || w === 7; }
  function suggestSlots(G, plan) {
    var o = tipsOrder(G), w = G.week, st = o.filter(function (i) { return !U[i].par || G.fc.tipU[i] > 0.02; });
    var c1 = 'r' + st[0], c2 = 'r' + st[1];
    plan.c = w === 3 || w === 7 ? [c1, 'p', 'p'] : prepWeek(w) ? [c1, c2, 'p'] : [c1, c2, 'f'];
    plan.r = ['r' + st[2], 'r' + st[3], 'r' + st[4]];
    applyLocks(G, plan);
  }
  function applyLocks(G, plan) {
    var L = G.locks || {};
    Object.keys(L).forEach(function (k) { var s = k.charAt(0), j = +k.charAt(1); plan[s][j] = L[k]; });
  }
  /* greedy by tipping odds: what a tipping-point purist would buy with a steady share of the war chest */
  function suggestAds(G, plan, S, forRival, wob) {
    var w = G.week, pace = w <= 3 ? 0.8 : w <= 6 ? 1.0 : 1.25, i;
    var field = 0;
    for (i = 0; i < NU; i++) { var l = plan.lvl[i]; if (l > 0) field += runCost(i, l) + (S.lvl[i] === 0 ? openCost(i) : 0); }
    var budget = Math.max(0, Math.min(S.cash - (forRival ? 10 : 0), S.cash / (10 - w) * pace) - field - plan.nat);
    var tipU = G.fc.tipU, val = new Float64Array(NU), cc = new Float64Array(NU);
    for (i = 0; i < NU; i++) {
      plan.ads[i] = 0; cc[i] = adCost(i, w);
      val[i] = (tipU[i] + 0.002 * Math.exp(-Math.abs(G.sy * G.fmean[i] - G.fc.tipAvg) / 5)) * G.pi[i] * (wob ? wob[i] : 1);
    }
    for (var m = 0; m < Math.floor(budget); m++) {
      var best = -1, bv = 0;
      for (i = 0; i < NU; i++) {
        if (plan.ads[i] + 1 > adMax(i, w)) continue;
        var g = val[i] * (Math.log(1 + (plan.ads[i] + 1) / cc[i]) - Math.log(1 + plan.ads[i] / cc[i]));
        if (g > bv) { bv = g; best = i; }
      }
      if (best < 0) break;
      plan.ads[best] += 1;
    }
    return plan;
  }
  function rivalPlan(G) {
    var R = G.S[G.riv], w = G.week, r = G.rAI, fc = G.fc, i;
    var plan = emptyPlan();
    plan.lvl = Int8Array.from(R.lvl);
    plan.msg = w === 9 ? 'B' : fc.pWin > 0.6 ? 'X' : 'P';
    var pace = w <= 3 ? 0.8 : w <= 6 ? 1.0 : 1.25, budget = Math.max(0, Math.min(R.cash - 10, R.cash / (10 - w) * pace));
    var cap = { A: 0.15, B: 0.35, G: 0.5 }[G.style] * budget, hd = G.hd[G.riv], tipU = fc.tipU;
    var nOpen = 0, lv = 0, top3 = false;
    if (G.style === 'A' && w === 2) { nOpen = 2; lv = 1; }
    if (G.style === 'B' && w <= 2) { nOpen = 2; lv = 2; }
    if (G.style === 'G' && w <= 2) { nOpen = 3; lv = 2; top3 = w === 1; }
    var run = 0;
    for (i = 0; i < NU; i++) run += runCost(i, plan.lvl[i]);
    if (nOpen) {
      var cand = [];
      for (i = 0; i < NU; i++) if (plan.lvl[i] === 0) cand.push(i);
      cand.sort(function (a, b) { return tipU[b] * hd[b] / Math.max(U[b].vepM, 0.3) - tipU[a] * hd[a] / Math.max(U[a].vepM, 0.3) || a - b; });
      var opened = 0, spent = run;
      for (var j = 0; j < cand.length && opened < nOpen; j++) {
        var u = cand[j], l = top3 && opened < 2 ? 3 : lv, cost = openCost(u) + runCost(u, l);
        if (spent + cost > cap) continue;
        plan.lvl[u] = l; spent += cost; opened++;
      }
    }
    var wob = new Float64Array(NU);
    for (i = 0; i < NU; i++) wob[i] = Math.exp(0.25 * r.normal());
    suggestAds(G, plan, R, true, wob);
    var o = tipsOrder(G), last = R.lastRally || [], picks = o.filter(function (x) { return last.indexOf(x) < 0; });
    if (w === 3 || w === 7) plan.c = ['p', 'p', 'r' + picks[0]];
    else plan.c = ['r' + picks[0], 'r' + picks[1], w % 2 === 0 ? 'f' : 'r' + picks[2]];
    plan.r = ['r' + o[2], 'r' + o[3], 'r' + o[4]];
    plan.post = G.rivPost;
    return plan;
  }
  /* the plan as it will actually run, after the week's event reshapes it */
  function effPlan(G, plan, S, rival) {
    var ads = Float64Array.from(plan.ads), ev = G.evt, ch = plan.ev, c = plan.c.slice(), rr = plan.r.slice(), evCost = 0, field = 0, i, w = G.week;
    if (ev && ch && !rival) {
      var u = ev.u;
      if (ev.t === 'STORM' && ch === 'P') { ads[u] = 0; c[0] = 'x'; }
      if (ev.t === 'STORM' && ch === 'M' && ads[u] > 0) {
        var mv = ads[u], same = DIVU[U[u].div].filter(function (k) { return k !== u; }), tot = 0;
        ads[u] = 0;
        same.forEach(function (k) { tot += ads[k]; });
        if (tot > 0) same.forEach(function (k) { ads[k] += mv * ads[k] / tot; });
        else { var sw = same.filter(function (k) { return !U[k].par; }); if (sw.length) sw.forEach(function (k) { ads[k] += mv / sw.length; }); }
      }
      if (ev.t === 'OUTLIER' && ch === 'C') ads[u] += 15;
      if (ev.t === 'TOWNHALL' && ch === 'Y') c[2] = 'x';
      if (ev.t === 'VPWEEK' && ev.side === 'you' && ch === 'B') rr = ['x', 'x', 'x'];
      evCost = evCostOf(G, ev, ch, S);
    }
    var lk = rival ? {} : G.locks || {};
    Object.keys(lk).forEach(function (k) { if (k.charAt(0) === 'c') c[+k.charAt(1)] = lk[k]; else rr[+k.charAt(1)] = lk[k]; });
    for (i = 0; i < NU; i++) { var l = plan.lvl[i]; if (l > 0) field += runCost(i, l) + (S.lvl[i] === 0 ? openCost(i) : 0); }
    var adT = 0;
    for (i = 0; i < NU; i++) adT += ads[i];
    return { ads: ads, nat: plan.nat, c: c, r: rr, lvl: plan.lvl, msg: plan.msg, post: plan.post, field: field, evCost: evCost, adT: adT,
      total: adT + plan.nat + field + evCost };
  }
  function slotCount(sl, k) { return sl.filter(function (x) { return x === k; }).length; }
  function fundsOf(ep) { return 7 * slotCount(ep.c, 'f') + 3 * slotCount(ep.r, 'f'); }

  /* apply a side's week: decay, then add (the model's order of operations) */
  function runSide(G, sk, ep) {
    var S = G.S[sk], w = G.week, M = MSG[ep.msg], i;
    S.cash -= ep.total;
    for (i = 0; i < NU; i++) {
      var x = ep.ads[i];
      S.spent.ads[i] += x;
      S.A[i] = 0.5 * S.A[i] + (x > 0 ? KAD * M.a * G.pi[i] * Math.log(1 + x / adCost(i, w)) : 0);
      S.V[i] *= 0.5;
    }
    S.AN = 0.5 * S.AN + (ep.nat > 0 ? KAD * M.a * Math.log(1 + ep.nat / natCost(w)) : 0);
    S.spent.nat += ep.nat; S.spent.field += ep.field; S.spent.evt += ep.evCost;
    for (i = 0; i < NU; i++) {
      var l = ep.lvl[i];
      if (l > 0) { S.spent.fieldU[i] += runCost(i, l) + (S.lvl[i] === 0 ? openCost(i) : 0); if (S.lvl[i] === 0) { S.opened[i] = 1; if (!S.openedW[i]) S.openedW[i] = w; } }
      S.lvl[i] = l;
      if (l === 0 && S.W[i] > 0) S.W[i] *= 0.8; /* without an office to follow up, contacts go stale: a fifth fades each week */
      S.W[i] += l * M.f;
    }
    var ral = {};
    function visit(u, big) {
      ral[u] = (ral[u] || 0) + 1;
      S.V[u] += (big ? 0.30 : 0.15) * Math.pow(0.6, ral[u] - 1);
      DIVU[U[u].div].forEach(function (k) { if (k !== u) S.V[k] += big ? 0.05 : 0.02; });
    }
    var rallied = [];
    ep.c.forEach(function (s) { if (s.charAt(0) === 'r') { visit(+s.slice(1), true); rallied.push(+s.slice(1)); } });
    ep.r.forEach(function (s) { if (s.charAt(0) === 'r') visit(+s.slice(1), false); });
    S.lastRally = rallied;
    if (prepWeek(w)) S.prep += slotCount(ep.c, 'p');
    var de = ep.msg === 'B' ? 0.003 : ep.msg === 'X' ? 0.004 : 0;
    S.e = 0.7 * S.e + de;
    return { rallied: rallied, fund: fundsOf(ep) };
  }

  /* ---------- the news: six events from a deck of twelve, then October and the final weekend ---------- */
  var COAST = ['FL', 'NC', 'SC', 'GA', 'LA', 'TX', 'VA', 'MS', 'AL'];
  function pvOf(G, u) { var pv = new Float64Array(56); viewMargins(G, 'poll', pv); return pv[u]; }
  function prepEvent(G) {
    var w = G.week, t = G.deck[w], r = G.rEvt;
    G.locks = {};
    if (G.pend.endorse && G.pend.endorse.w === w) { G.locks.c0 = 'r' + G.pend.endorse.u; G.locks.c1 = 'r' + G.pend.endorse.u; }
    if (!t) { G.evt = null; return null; }
    var ev = { t: t, w: w }, cl = compList(G, 8);
    function pickC(excl) { var l = cl.filter(function (x) { return !excl || excl.indexOf(x) < 0; }); return l.length ? l[r.int(l.length)] : cl[0]; }
    if (t === 'JOBS') ev.strong = r() < 0.5;
    if (t === 'STORM') {
      var cs = COAST.map(function (id) { return IDX[id]; }), tw = 0;
      cs.forEach(function (i) { tw += G.fc.tipU[i] + 0.01; });
      var x = r() * tw;
      ev.u = cs[cs.length - 1];
      for (var j = 0; j < cs.length; j++) { x -= G.fc.tipU[cs[j]] + 0.01; if (x <= 0) { ev.u = cs[j]; break; } }
    }
    if (t === 'HOTMIC' || t === 'THIRD' || t === 'VPWEEK' || t === 'OCT') ev.side = r() < 0.5 ? 'you' : 'them';
    if (t === 'HOTMIC' || t === 'THIRD' || t === 'ENDORSE' || t === 'LEAK' || t === 'REGDRIVE' || t === 'TOWNHALL' || t === 'EARLY') ev.u = pickC();
    if (t === 'ENDORSE' || t === 'REGDRIVE') ev.u2 = pickC([ev.u]);
    if (t === 'HOTMIC' || t === 'THIRD') ev.dv = U[ev.u].div;
    if (t === 'LEAK') { ev.val = G.sy * pvOf(G, ev.u) + 5 * r.normal(); ev.ahead = ev.val > 0; ev.k = Math.max(1, Math.round(Math.abs(ev.val))); }
    if (t === 'OUTLIER') {
      ev.u = pickC(); ev.k = r.int(6); ev.sg = r() < 0.5 ? 1 : -1;
      var y = G.sy * (pvOf(G, ev.u) + G.E[ev.u] + G.h[ev.k]) + 9 * ev.sg, pr = null;
      G.polls.forEach(function (p) { if (p.unit === ev.u && p.k === ev.k) pr = p; });
      var und = Math.max(2.6, 8 - 0.6 * (w - 1)), yl = G.sy * y;
      var p = { w: w, day: 3, k: ev.k, unit: ev.u, n: POLLSTERS[ev.k].n, sL: Math.round(50 - und / 2 + yl / 2), sC: Math.round(50 - und / 2 - yl / 2), outlier: true };
      p.y = p.sL - p.sC; p.moe = Math.round(1.96 * Math.sqrt(0.25 / p.n) * 1000) / 10;
      ev.poll = p; ev.lead = Math.abs(p.y);
      ev.swing = pr ? Math.abs(p.y - pr.y) : Math.abs(p.y - Math.round(G.avg[ev.u].mean));
      ev.fromPrev = !!pr;
      G.polls.push(p);
    }
    if (t === 'LAWSUIT') {
      var es = cl.filter(function (i) { return U[i].pf !== 'F'; });
      if (!es.length) { es = []; for (var q = 0; q < 49; q++) if (U[q].pf !== 'F') es.push(q); es.sort(function (a, b) { return G.fc.tipU[b] - G.fc.tipU[a]; }); es = es.slice(0, 1); }
      ev.u = es[r.int(es.length)];
    }
    if (t === 'EARLY') { ev.party = r() < 0.5 ? 'L' : 'C'; ev.up = r() < 0.5; }
    G.evt = ev;
    return ev;
  }
  function evCostOf(G, ev, ch, S) {
    if (!ev || !ch) return 0;
    if (ev.t === 'HOTMIC' && ev.side === 'them' && ch === 'R') return 8;
    if (ev.t === 'THIRD' && ev.side === 'you' && ch === 'T') return 6;
    if (ev.t === 'LAWSUIT' && ch === 'F') return 3;
    if (ev.t === 'REGDRIVE' && ch === 'Y') return 5;
    if (ev.t === 'OCT' && ev.side === 'you') return ch === 'R' ? 15 : ch === 'C' ? 8 : 0;
    if (ev.t === 'OCT' && ev.side === 'them' && ch === 'A') return 10;
    if (ev.t === 'EARLY' && ch === 'R') { var n = 0; for (var i = 0; i < NU; i++) if (S.lvl[i] > 0) n++; return 0.4 * n; }
    return 0;
  }
  /* the week's news lands: the player's choice, and the rival's fixed reply where the event is theirs too */
  function applyEvent(G, ev, ch, say) {
    var r = G.rEvt, Y = G.S[G.side], R = G.S[G.riv], t = ev.t, u = ev.u, v;
    var incYou = G.inc === G.side;
    if (t === 'JOBS') {
      v = ev.strong === incYou ? 0.6 : -0.6;
      var mult = 1;
      if (ch === 'M') { if (v > 0) mult = 1.6; else { mult = r() < 0.5 ? 0.5 : 1.4; say('YOU', mult < 1 ? 'You made the jobs report the message and blunted it: the damage came in at half.' : 'You made the jobs report the message and it backfired: the damage came in larger.'); } }
      addFx(G, 'N', 0, v * mult, 0.85, 'Jobs report');
    }
    if (t === 'STORM') {
      if (ch === 'P') { addFx(G, 'U', u, 0.6, 0.7, 'Storm response'); say('WIRE', 'Coverage from ' + U[u].nm + ' shows the candidate handing out water. It plays well.'); }
      if (ch === 'K') { if (r() < 0.35) { addFx(G, 'U', u, -0.5, 0.7, 'Storm ads'); say('WIRE', 'Local anchors notice a campaign ad running between storm updates in ' + U[u].nm + '. It does not play well.'); } else say('WIRE', 'Nobody in ' + U[u].nm + ' seemed to mind the ads. This time.'); }
    }
    if (t === 'HOTMIC') {
      if (ev.side === 'you') {
        if (ch === 'A') { addFx(G, 'N', 0, -0.2, 0.7, 'Hot mic'); addFx(G, 'D', ev.dv, -0.6, 0.7, 'Hot mic'); }
        if (ch === 'D') { addFx(G, 'N', 0, -0.4, 0.7, 'Hot mic'); addFx(G, 'D', ev.dv, -1.2, 0.7, 'Hot mic'); Y.e += 0.004; }
        if (ch === 'I') { addFx(G, 'N', 0, -0.3, 0.7, 'Hot mic'); addFx(G, 'D', ev.dv, -0.9, 0.7, 'Hot mic'); }
      } else {
        addFx(G, 'N', 0, 0.2, 0.7, 'Hot mic'); addFx(G, 'D', ev.dv, 0.6, 0.7, 'Hot mic');
        if (ch === 'R') addFx(G, 'D', ev.dv, 0.6, 0.7, 'Hot mic ads');
        if (ch === 'P') addFx(G, 'D', ev.dv, 0.2, 0.7, 'Hot mic');
        if (ch === 'S') addFx(G, 'N', 0, 0.1, 0.7, 'Hot mic');
      }
    }
    if (t === 'ENDORSE') {
      if (ch === 'Y') G.pend.endorse = { u: u, w: G.week + 1 };
      G.pend.rivEndorse = { u: ev.u2, w: G.week + 1 };
      say('TRACKER', 'The other campaign has a governor’s endorsement lined up in ' + U[ev.u2].nm + ' for next week.');
    }
    if (t === 'LEAK') {
      if (ch === 'F') { Y.cash += ev.ahead ? 8 : 12; Y.e -= ev.ahead ? 0.003 : 0.002; }
      R.cash += 10; R.e -= 0.002;
      say('TRACKER', 'The other campaign sent a fundraising email off its own internal numbers this week.');
    }
    if (t === 'THIRD') {
      if (ev.side === 'you') addFx(G, 'D', ev.dv, ch === 'T' ? -0.5 : -1.0, 0.95, 'The independent');
      else addFx(G, 'D', ev.dv, 0.5, 0.95, 'The independent');
    }
    if (t === 'CRISIS') {
      addFx(G, 'N', 0, incYou ? 0.8 : -0.8, 0.6, 'Overseas crisis');
      if (incYou && ch === 'C') addFx(G, 'N', 0, 0.2, 0.6, 'Close ranks');
      if (!incYou) {
        addFx(G, 'N', 0, -0.2, 0.6, 'Close ranks');
        if (ch === 'Q') { Y.e += 0.003; R.e += 0.003; }
        if (ch === 'W') addFx(G, 'N', 0, 0.1, 0.6, 'Stand with the country');
      } else addFx(G, 'N', 0, -0.1, 0.6, 'Stand with the country');
    }
    if (t === 'LAWSUIT' && ch === 'S') G.slow[u] = 24;
    if (t === 'REGDRIVE') {
      if (ch === 'Y') Y.R[u] += 0.25;
      R.R[ev.u2] += 0.25;
      say('TRACKER', 'The other campaign is paying for a registration drive in ' + U[ev.u2].nm + '.');
    }
    if (t === 'TOWNHALL') {
      if (ch === 'Y') { v = 0.1 + 0.4 * r.normal(); addFx(G, 'N', 0, v, 0.7, 'Town hall'); say('WIRE', v >= 0.1 ? 'The town hall went well: clean answers, one good laugh, no clip anyone will replay.' : v >= 0 ? 'The town hall was fine, which on live television is a win.' : 'The town hall produced one answer the other side will be replaying all week.'); }
      v = 0.1 + 0.4 * r.normal(); addFx(G, 'N', 0, -v, 0.7, 'Their town hall');
      say('TRACKER', 'The other candidate did a town hall of their own this week.');
    }
    if (t === 'VPWEEK') {
      if (ev.side === 'you') {
        if (ch === 'B') addFx(G, 'N', 0, -0.1, 0.7, 'Benched');
        else { addFx(G, 'N', 0, -0.3, 0.7, 'Rough week'); G.pend.vpRec = { s: 1, w: G.week + 1 }; }
      } else { addFx(G, 'N', 0, 0.3, 0.7, 'Their rough week'); G.pend.vpRec = { s: -1, w: G.week + 1 }; }
    }
    if (t === 'OCT') {
      if (ev.side === 'you') {
        addFx(G, 'N', 0, ch === 'R' ? -0.6 : -1.2, 0.8, 'The October story');
        if (ch === 'C') {
          Y.e += 0.003; R.e += 0.003;
          if (r() < 0.5) { addFx(G, 'N', 0, 0.6, 0.8, 'Counterpunch'); say('WIRE', 'The counterpunch landed: the story about the other ticket is leading the evening news.'); }
          else { addFx(G, 'N', 0, -0.3, 0.8, 'Counterpunch'); say('WIRE', 'The counterpunch read as a distraction and extended the story another day.'); }
        }
      } else {
        addFx(G, 'N', 0, 0.6, 0.8, 'The October story');
        if (ch === 'A') addFx(G, 'N', 0, 0.3, 0.8, 'Amplified');
      }
    }
    if (t === 'EARLY' && ch === 'R') for (var i = 0; i < NU; i++) if (Y.lvl[i] > 0) Y.W[i] += 1;
    G.events.push({ w: G.week, t: t, side: ev.side || null, u: u, ch: ch });
  }
  function doDebate(G, ep, rp, say) {
    var w = G.week, r = G.rEvt, pres = w !== 5, Y = G.S[G.side], R = G.S[G.riv];
    var py = POSTURE[ep.post || 'S'], pr = POSTURE[G.rivPost];
    var prepY = pres ? Math.min(3, Y.prep) : 0, prepR = pres ? Math.min(3, R.prep) : 0;
    var Py = py.mu + 0.12 * prepY + py.sd * r.normal(), Pr = pr.mu + 0.12 * prepR + pr.sd * r.normal();
    var D = clamp(0.35 * (Py - Pr), -0.9, 0.9) * (pres ? 1 : 0.5);
    G.DB += D * G.sy;
    if (ep.post === 'W' || G.rivPost === 'W') { Y.e += 0.003; R.e += 0.003; }
    var inst = clamp(50 + 12 * (Py - Pr) + 4 * r.normal(), 5, 95);
    if (pres) { Y.prep = 0; R.prep = 0; }
    G.debates.push({ w: w, pres: pres, D: D, inst: inst, post: ep.post || 'S', rpost: G.rivPost, prep: prepY });
    return { D: D, inst: inst, pres: pres };
  }

  /* ---------- one week, start to finish (the forecast half runs after, in chunks) ---------- */
  function commitA(G, plan, say) {
    var w = G.week, Y = G.S[G.side], R = G.S[G.riv], ev = G.evt;
    var ep = effPlan(G, plan, Y);
    var rp = rivalPlan(G), rep = effPlan(G, rp, R, true);
    rep.evCost = 0; rep.total = rep.adT + rep.nat + rep.field;
    if (ev && ev.t === 'STORM') { /* the rival pauses its ads in the storm state too */ rep.total -= rep.ads[ev.u]; rep.adT -= rep.ads[ev.u]; rep.ads[ev.u] = 0; }
    if (ev && ev.t === 'VPWEEK' && ev.side === 'them') rep.r = ['r' + tipsOrder(G)[2], 'r' + tipsOrder(G)[3], 'r' + tipsOrder(G)[4]];
    if (ev && ev.t === 'THIRD' && ev.side === 'them') { R.cash -= 6; R.spent.evt += 6; }
    if (ev && ev.t === 'OCT' && ev.side === 'them') { R.cash -= 15; R.spent.evt += 15; }
    var logEntry = { w: w, plan: clonePlan(plan), ads: Float64Array.from(ep.ads), msg: ep.msg, nat: ep.nat, rivAds: Float64Array.from(rep.ads), rivMsg: rep.msg, rivNat: 0 };
    var ry = runSide(G, G.side, ep), rr = runSide(G, G.riv, rep);
    if (ep.msg === 'X') R.e += 0.004;
    if (rep.msg === 'X') Y.e += 0.004;
    for (var j = G.fx.length - 1; j >= 0; j--) { G.fx[j].v *= G.fx[j].d; if (Math.abs(G.fx[j].v) < 0.01) G.fx.splice(j, 1); }
    G.DB *= 0.7;
    recomputeFx(G);
    G.n += G.mir * 0.35 * G.rEvt.normal();
    var deb = null;
    if (debateWeek(w)) deb = doDebate(G, ep, rep, say);
    if (G.pend.endorse && G.pend.endorse.w === w) { addFx(G, 'U', G.pend.endorse.u, 1.0, 0.85, 'Endorsement'); G.pend.endorse = null; }
    if (G.pend.rivEndorse && G.pend.rivEndorse.w === w) { addFx(G, 'U', G.pend.rivEndorse.u, -1.0, 0.85, 'Their endorsement'); G.pend.rivEndorse = null; }
    if (G.pend.vpRec && G.pend.vpRec.w === w) { if (G.rEvt() < 0.5) addFx(G, 'N', 0, 0.2 * G.pend.vpRec.s, 0.7, 'Running mate recovers'); G.pend.vpRec = null; }
    if (ev && plan.ev) applyEvent(G, ev, plan.ev, say);
    var pY = G.fc.pWin;
    Y.cash += inflow(pY) + ry.fund; R.cash += inflow(1 - pY) + rr.fund;
    logEntry.inflow = inflow(pY) + ry.fund; logEntry.spend = ep.total; logEntry.rivSpend = rep.total; logEntry.field = ep.field;
    logEntry.rally = ry.rallied; logEntry.deb = deb;
    G.log.push(logEntry);
    var np = makePolls(G, w, 'all');
    updateAverages(G, w);
    G.lastRiv = rep;
    return { ep: ep, rep: rep, deb: deb, polls: np };
  }
  function commitB(G) {
    var R = G.S[G.riv], r = G.rAI, n = 0;
    for (var i = 0; i < NU; i++) { G.tracker.ads[i] = G.lastRiv.ads[i]; G.tracker.wEst[i] = R.W[i] > 0 ? R.W[i] * Math.max(0, 1 + 0.3 * r.normal()) : 0; G.tracker.lvl[i] = R.lvl[i]; if (R.lvl[i] > 0) n++; }
    G.tracker.offices = n;
    var pv = new Float64Array(56); viewMargins(G, 'sun', pv);
    G.hist.push({ w: G.week, pWin: G.fc.pWin, tipAvg: G.fc.tipAvg, trueTip: G.sy * pv[G.fc.tipC] });
    G.week++;
    if (G.week <= 9) prepEvent(G);
  }

  /* ---------- Election Day, the count, the desk ---------- */
  var END_T = 187, TICKS = [];
  (function () { for (var t = 19; t <= 28.001; t += 0.25) TICKS.push(Math.round(t * 100) / 100); TICKS.push(36, 60, 84, 108, 132, 156, END_T); })();
  function frac(pf, t, h, slow) {
    if (t === 0 && slow) h -= slow;
    if (h < 0) return 0;
    if (pf === 'F') {
      if (t === 0) return h >= 20 ? 1 : Math.min(0.97, 1 - Math.exp(-h / 0.5));
      if (t === 1) return h >= 20 ? 1 : Math.min(0.99, Math.pow(cl01((h - 0.4) / 3.2), 0.85));
      return cl01((h - 20) / 100);
    }
    if (pf === 'E') {
      if (t === 1) return Math.pow(cl01((h - 0.25) / 2.8), 0.85);
      if (t === 0) return cl01((h - 1) / 10);
      return cl01((h - 20) / 70);
    }
    if (t === 0) return h >= 20 ? 1 : Math.min(0.98, 1 - Math.exp(-h / 0.4));
    if (t === 1) return cl01((h - 0.8) / 4.5);
    return cl01((h - 15) / 140);
  }
  function typeOffsets(G, pf) {
    var sh = PROF[pf].sh, s = G.sm * G.md;
    return [s * sh[1], -s * (sh[0] + 0.8 * sh[2]), 0.8 * s * sh[1]];
  }
  function electionDay(G) {
    var r = G.rNight, mir = G.mir, L = G.S.L, C = G.S.C, i, t;
    recomputeFx(G);
    var nNat = mir * 0.7 * r.normal(), mSun = new Float64Array(NU), gL = new Float64Array(NU), gC = new Float64Array(NU), noise = new Float64Array(NU);
    for (i = 0; i < NU; i++) {
      mSun[i] = prefMargin(G, i) + L.R[i] - C.R[i];
      gL[i] = fieldG(G, 'L', i) + L.e; gC[i] = fieldG(G, 'C', i) + C.e;
      noise[i] = nNat + mir * 0.8 * r.normal();
    }
    var nc = [], VL = new Float64Array(NU), VC = new Float64Array(NU), i2;
    for (i = 0; i < NU; i++) {
      unitVotes(G, i, mSun[i] + noise[i], gL[i], gC[i], TMP);
      var tot = TMP[0] + TMP[1], m = (TMP[0] - TMP[1]) / tot * 100, sh = PROF[U[i].pf].sh, off = typeOffsets(G, U[i].pf);
      var Lt = [], Ct = [];
      for (t = 0; t < 3; t++) { var mt = clamp(m + off[t], -95, 95), vt = tot * sh[t]; Lt.push(vt * (0.5 + mt / 200)); Ct.push(vt * (0.5 - mt / 200)); }
      nc.push({ c: i, L: Lt, C: Ct, pf: U[i].pf, cl: U[i].cl, slow: G.slow[i] || 0 });
      VL[i] = Lt[0] + Lt[1] + Lt[2]; VC[i] = Ct[0] + Ct[1] + Ct[2];
    }
    ['ME', 'NE'].forEach(function (p) {
      var ks = KIDS[p], Lt = [0, 0, 0], Ct = [0, 0, 0];
      ks.forEach(function (k) { for (var q = 0; q < 3; q++) { Lt[q] += nc[k].L[q]; Ct[q] += nc[k].C[q]; } });
      nc.push({ c: CONT[p], L: Lt, C: Ct, pf: CI[CONT[p]].pf, cl: CI[CONT[p]].cl, slow: 0 });
    });
    var pre = new Float64Array(56), VLp = new Float64Array(NU), VCp = new Float64Array(NU);
    for (i = 0; i < NU; i++) { VLp[i] = U[i].base * (0.5 + G.fmean[i] / 200); VCp[i] = U[i].base * (0.5 - G.fmean[i] / 200); }
    contestsFrom(VLp, VCp, pre);
    nc.forEach(function (d) {
      d.tot = d.L[0] + d.L[1] + d.L[2] + d.C[0] + d.C[1] + d.C[2];
      d.fin = (d.L[0] + d.L[1] + d.L[2] - d.C[0] - d.C[1] - d.C[2]) / d.tot * 100;
      d.pre = pre[d.c];
      d.off = typeOffsets(G, d.pf);
      d.tErr = 0.03 * r.normal();
      d.oz = [0.25 * r.normal(), 0.25 * r.normal(), 0.25 * r.normal()];
      d.called = 0; d.callT = null; d.series = []; d.first = 0; d.flip = null; d.lead = 0;
    });
    var fin = new Float64Array(56);
    nc.forEach(function (d) { fin[d.c] = d.fin; });
    var natFin = 0, tl = 0, tc = 0;
    for (i = 0; i < NU; i++) { tl += VL[i]; tc += VC[i]; }
    natFin = (tl - tc) / (tl + tc) * 100;
    /* the race as it really stood on the final Sunday: Election Day noise only, 2,000 times */
    var pTrueWin = 0, cm = new Float64Array(56), sunC = new Float64Array(56);
    for (i2 = 0; i2 < NU; i2++) { unitVotes(G, i2, mSun[i2], gL[i2], gC[i2], TMP); VLb[i2] = TMP[0]; VCb[i2] = TMP[1]; }
    var sunNat = contestsFrom(VLb, VCb, sunC);
    for (var s = 0; s < 2000; s++) {
      var nn = mir * 0.7 * r.normal();
      for (i2 = 0; i2 < NU; i2++) { unitVotes(G, i2, mSun[i2] + nn + mir * 0.8 * r.normal(), gL[i2], gC[i2], TMP); VLb[i2] = TMP[0]; VCb[i2] = TMP[1]; }
      contestsFrom(VLb, VCb, cm);
      if (evFor(cm, G.sy) >= 270) pTrueWin++;
    }
    G.night = { T: 19, ti: 0, c: nc, fin: fin, natFin: natFin, VL: VL, VC: VC, mSun: mSun, noise: noise, gL: gL, gC: gC, sunC: sunC, sunNat: sunNat,
      pTrue: pTrueWin / 2000, pFc: G.fc.pWin, calls: [], proj: null, projT: null, speech: null, speechAsked: false, speechEV: null,
      concede: null, done: false, flips: [], tlVotes: tl, tcVotes: tc };
    G.phase = 'night';
    deskTick(G);
    return G.night;
  }
  function counted(d, T) {
    var h = T - d.cl, o = { L: 0, C: 0, f: [0, 0, 0], cL: [0, 0, 0], cC: [0, 0, 0] };
    for (var t = 0; t < 3; t++) {
      var f = T >= END_T ? 1 : frac(d.pf, t, h, d.slow);
      o.f[t] = f; o.cL[t] = f * d.L[t]; o.cC[t] = f * d.C[t]; o.L += o.cL[t]; o.C += o.cC[t];
    }
    return o;
  }
  function deskTick(G) {
    var N = G.night, T = N.T, sy = G.sy, newCalls = [];
    N.c.forEach(function (d) {
      var h = T - d.cl;
      if (h < 0) return;
      var o = counted(d, T), cnt = o.L + o.C;
      if (cnt <= 0) return;
      var lead = o.L > o.C ? 1 : o.L < o.C ? -1 : 0;
      d.series.push([cnt / d.tot, (o.L - o.C) / cnt * 100]);
      if (!d.first) { d.first = lead; d.lead = lead; }
      else if (lead && lead !== d.lead) {
        /* credit the vote type whose newly counted ballots moved the margin toward the new leader most, not the one that counted fastest */
        var best = -1, bc = 0;
        for (var q = 0; q < 3; q++) {
          var cq = lead * ((o.cL[q] - (d.pcL ? d.pcL[q] : 0)) - (o.cC[q] - (d.pcC ? d.pcC[q] : 0)));
          if (cq > bc) { bc = cq; best = q; }
        }
        d.flip = { T: T, type: best, to: lead };
        N.flips.push({ c: d.c, T: T, type: best, to: lead });
        d.lead = lead;
      }
      d.pf0 = o.f.slice(); d.pcL = o.cL.slice(); d.pcC = o.cC.slice();
      if (d.called) return;
      var sgnF = d.fin > 0 ? 1 : -1;
      if (Math.abs(d.fin) < 0.5 && T < END_T) return;
      var call = false;
      if (T >= END_T) call = Math.abs(d.fin) >= 0.5;
      else {
        var Test = d.tot * (1 + d.tErr), sh = PROF[d.pf].sh;
        if (h >= 0.25 && Math.abs(d.pre) >= 10 && lead === (d.pre > 0 ? 1 : -1) && (d.pre > 0 ? 1 : -1) === sgnF) call = true;
        else {
          var proj = o.L - o.C, v = 0;
          for (var t = 0; t < 3; t++) {
            var exp = Test * sh[t], ct = o.cL[t] + o.cC[t], Rt = Math.max(0, exp - ct), mt, sg;
            if (ct >= 0.1 * exp && ct > 0) { mt = (o.cL[t] - o.cC[t]) / ct; sg = 0.08; }
            else { mt = (d.pre + d.off[t] * (1 + d.oz[t])) / 100; sg = 0.15; }
            proj += Rt * mt; v += (Rt * sg) * (Rt * sg);
          }
          if (Math.abs(proj) > 3 * Math.sqrt(v) && cnt >= 0.25 * Test && (proj > 0 ? 1 : -1) === sgnF) call = true;
        }
      }
      if (call) { d.called = sgnF; d.callT = T; N.calls.push({ c: d.c, T: T, s: sgnF }); newCalls.push(d.c); }
    });
    var ev = calledEV(G);
    if (!N.proj && (ev.you >= 270 || ev.them >= 270)) { N.proj = ev.you >= 270 ? 'you' : 'them'; N.projT = T; }
    return newCalls;
  }
  function calledEV(G) {
    var N = G.night, o = { you: 0, them: 0, open: 0 };
    N.c.forEach(function (d) { if (d.called === G.sy) o.you += EV56[d.c]; else if (d.called) o.them += EV56[d.c]; else o.open += EV56[d.c]; });
    return o;
  }
  function nightTotals(G) {
    var N = G.night, T = N.T, L = 0, C = 0, tot = 0;
    for (var i = 0; i < NU; i++) { var o = counted(N.c[i], T); L += o.L; C += o.C; tot += N.c[i].tot; }
    return { L: L, C: C, pct: (L + C) / tot, mY: L + C > 0 ? G.sy * (L - C) / (L + C) * 100 : 0 };
  }
  function nightStep(G) {
    var N = G.night;
    if (N.ti >= TICKS.length - 1) return false;
    N.ti++; N.T = TICKS[N.ti];
    deskTick(G);
    if (N.T >= END_T) N.done = true;
    return true;
  }
  /* paths to 270 over the uncalled contests; up to sixteen are enumerated exactly */
  function paths(G) {
    var N = G.night, open = [], ev = calledEV(G);
    N.c.forEach(function (d) { if (!d.called) open.push(d.c); });
    if (!open.length) return { n: 0, open: 0 };
    if (open.length > 16) return { open: open.length, early: true };
    var n = open.length, M = 1 << n, sum = new Int16Array(M), needY = 270 - ev.you, needT = 270 - ev.them, tot = 0, i;
    for (i = 0; i < n; i++) tot += EV56[open[i]];
    var pw = 0, pt = 0, must = M - 1, mustT = M - 1;
    for (var m = 0; m < M; m++) {
      if (m) { var lb = m & -m, bi = 31 - Math.clz32(lb); sum[m] = sum[m ^ lb] + EV56[open[bi]]; }
      if (sum[m] >= needY) { pw++; must &= m; }
      if (tot - sum[m] >= needT) { pt++; mustT &= (M - 1) ^ m; }
    }
    var mw = [], mt = [];
    for (i = 0; i < n; i++) { if (pw && (must >> i) & 1) mw.push(open[i]); if (pt && (mustT >> i) & 1) mt.push(open[i]); }
    return { open: n, you: pw, them: pt, mustYou: mw, mustThem: mt, needY: needY, needT: needT };
  }

  /* ---------- after the count: canvass, recounts, December, and the House if it is 269 to 269 ---------- */
  function ruleOf(c) { var st = CI[c].st; return EV_RECOUNT[st] || EV_RECOUNT_DEF; }
  function tallyFinal(G) {
    var N = G.night, ev = 0;
    N.c.forEach(function (d) { if (G.sy * d.fin > 0) ev += EV56[d.c]; });
    return ev;
  }
  function recountCost(d) { return 2 + 1.5 * d.tot / 1e6; }
  function canvass(G) {
    var N = G.night, list = [], evY = tallyFinal(G);
    N.c.forEach(function (d) {
      var p = Math.abs(d.fin), L = d.L[0] + d.L[1] + d.L[2], C = d.tot - L, mv = Math.abs(L - C), wv = Math.max(L, C), rule = ruleOf(d.c);
      if (!rule[2](p, mv, wv, d.tot)) return;
      var flipEv = evY + (G.sy * d.fin > 0 ? -EV56[d.c] : EV56[d.c]);
      var outNow = evY >= 270 ? 1 : evY === 269 ? 0 : -1, outFlip = flipEv >= 270 ? 1 : flipEv === 269 ? 0 : -1;
      var statePays = rule[0] === 'auto' || (rule[3] ? !!rule[3](p, mv, wv, d.tot) : false);
      list.push({ c: d.c, auto: rule[0] === 'auto', txt: rule[1], real: !!EV_RECOUNT[CI[d.c].st], decisive: outNow !== outFlip, loser: G.sy * d.fin > 0 ? 'them' : 'you', cost: statePays ? 0 : recountCost(d), statePays: statePays, p: p, mv: mv });
    });
    N.canvass = list;
    return list;
  }
  function doRecount(G, it, who) {
    var N = G.night, d = N.c[it.c], r = G.rNight, s = G.mir * 0.015 * r.normal();
    var before = d.fin, dv = s / 100 * d.tot;
    for (var t = 0; t < 3; t++) { var share = (d.L[t] + d.C[t]) / d.tot; d.L[t] += dv / 2 * share; d.C[t] -= dv / 2 * share; }
    d.fin = (d.L[0] + d.L[1] + d.L[2] - d.C[0] - d.C[1] - d.C[2]) / d.tot * 100;
    N.fin[d.c] = d.fin;
    if (d.c < NU) { N.VL[d.c] = d.L[0] + d.L[1] + d.L[2]; N.VC[d.c] = d.C[0] + d.C[1] + d.C[2]; }
    var shift = Math.round(Math.abs(dv)), toward = (dv > 0 ? 1 : -1) === G.sy ? 'you' : 'them';
    if (d.c < NU && U[d.c].par) {
      var pc = N.c[CONT[U[d.c].par]], ks = KIDS[U[d.c].par];
      for (var q = 0; q < 3; q++) { pc.L[q] = 0; pc.C[q] = 0; ks.forEach(function (k) { pc.L[q] += N.c[k].L[q]; pc.C[q] += N.c[k].C[q]; }); }
      pc.fin = (pc.L[0] + pc.L[1] + pc.L[2] - pc.C[0] - pc.C[1] - pc.C[2]) / pc.tot * 100; N.fin[pc.c] = pc.fin;
    }
    var rec = { c: d.c, before: before, after: d.fin, shift: shift, toward: toward, flipped: (before > 0) !== (d.fin > 0), who: who, auto: it.auto };
    (N.recounts = N.recounts || []).push(rec);
    return rec;
  }
  function finalResult(G) {
    var N = G.night, evY = tallyFinal(G), tl = 0, tc = 0, i;
    for (i = 0; i < NU; i++) { tl += N.VL[i]; tc += N.VC[i]; }
    var nat = G.sy * (tl - tc) / (tl + tc) * 100, winY = evY >= 270, tie = evY === 269, win = winY ? 'you' : tie ? 'tie' : 'them';
    var tipC = tie ? -1 : tipOf(N.fin, winY ? G.sy : -G.sy);
    var tipM = tipC >= 0 ? G.sy * N.fin[tipC] : 0;
    var natAbs = Math.abs(tl - tc);
    return { evY: evY, evT: 538 - evY, nat: nat, win: win, tipC: tipC, tipM: tipM, votesY: G.sy > 0 ? tl : tc, votesT: G.sy > 0 ? tc : tl, natAbs: natAbs };
  }
  /* the contingent election: one vote per state delegation, 26 to win */
  function houseSetup(G) {
    var r = G.rNight, N = G.night, dl = [];
    EV_STATES.forEach(function (row) {
      if (row[0] === 'DC') return;
      var seats = row[2] - 2, c = IDX[row[0]], mY = G.sy * N.fin[c], carried = mY > 0 ? 'you' : 'them', y = 0;
      if (seats === 1) y = r() < 0.85 ? (carried === 'you' ? 1 : 0) : (carried === 'you' ? 0 : 1);
      else { var sh = 12 * r.normal(); for (var s = 0; s < seats; s++) if (r.normal() < (mY + sh) / 12) y++; }
      var t = seats - y;
      dl.push({ id: row[0], nm: row[1], seats: seats, y: y, t: t, hold: y > t ? 'you' : t > y ? 'them' : 'div', carried: carried, vote: null, lob: false });
    });
    var sen = 50 + Math.round(3 * r.normal());
    if (sen === 50) sen = r() < 0.5 ? 51 : 49;
    N.house = { dl: dl, senY: sen, lob: 0, done: false };
    return N.house;
  }
  function houseVote(G) {
    var r = G.rNight, H = G.night.house, divs = H.dl.filter(function (d) { return d.hold === 'div' && !d.lob; }), rl = 0;
    H.dl.forEach(function (d) {
      if (d.hold === 'div') {
        if (d.lob) d.vote = r() < 0.35 ? 'you' : null;
        else d.vote = null;
      } else {
        d.vote = d.hold;
        if (d.carried !== d.hold && r() < 0.10) d.vote = d.carried;
      }
    });
    /* the other campaign lobbies up to two divided delegations too */
    divs.forEach(function (d) { if (rl < 2) { rl++; if (r() < 0.35) d.vote = 'them'; } });
    var y = 0, t = 0;
    H.dl.forEach(function (d) { if (d.vote === 'you') y++; else if (d.vote === 'them') t++; });
    H.y = y; H.t = t; H.pres = y >= 26 ? 'you' : t >= 26 ? 'them' : null; H.vp = H.senY >= 51 ? 'you' : 'them'; H.done = true;
    return H;
  }

  /* ---------- the news, in words: what the wire says, and what you can do about it ---------- */
  function pn(G, sk) { return PARTY[sk].nm; }
  function hitK(G, ev) { return ev.side === 'you' ? G.side : G.riv; }
  var EVK = { JOBS: 'The jobs report', STORM: 'Storm on the coast', HOTMIC: 'Hot mic', ENDORSE: 'The governor’s price', LEAK: 'The internal poll', THIRD: 'The independent',
    OUTLIER: 'The poll everybody talks about', CRISIS: 'Overseas crisis', LAWSUIT: 'How fast to count', REGDRIVE: 'Registration deadline', TOWNHALL: 'The town hall',
    VPWEEK: 'The running mate’s week', OCT: 'The October story', EARLY: 'The early vote' };
  /* "an 8-point", "an 11-point", "an 18-point", "an 80-point"; "a" otherwise */
  function aAn(n) { var t = String(n); return /^(8|11|18)$/.test(t) || /^8/.test(t) ? 'an' : 'a'; }
  function evText(G, ev) {
    var u = ev.u != null ? U[ev.u] : null, t = ev.t, inc = G.inc;
    if (t === 'JOBS') return { tag: 'WIRE', kick: 'The jobs report', txt: 'The monthly jobs report came in ' + (ev.strong ? 'strong' : 'weak') + '. The party that holds the White House, ' + pn(G, inc) + ', gets the credit or the blame, as it always does, whether or not it deserves either.' };
    if (t === 'STORM') return { tag: 'WIRE', kick: 'Storm on the coast', txt: 'A hurricane is forecast to make landfall on the ' + u.nm + ' coast late this week.' };
    if (t === 'HOTMIC') return { tag: 'WIRE', kick: 'Hot mic', txt: PARTY[hitK(G, ev)].cand + ' was recorded telling donors the campaign had written off ' + u.nm + ' and its neighbors.' };
    if (t === 'ENDORSE') return { tag: 'MANAGER', kick: 'The governor’s price', txt: u.nm + '’s governor, popular in both parties, will endorse us if the candidate spends two days there next week. The governor also wants to be seen with us, which is the actual price.' };
    if (t === 'LEAK') return { tag: 'WIRE', kick: 'The internal poll', txt: 'An internal poll from our campaign leaked. It has us ' + (ev.ahead ? 'up ' : 'down ') + ev.k + ' in ' + u.nm + '. Nadia says it is a real poll with a real sample of 400, which is to say, a wide one.' };
    if (t === 'THIRD') return { tag: 'WIRE', kick: 'The independent', txt: 'An independent candidate has qualified across the ' + EV_DIV[ev.dv] + ' states and is polling near 5 percent there. Most of that support is coming from voters who were leaning ' + PARTY[hitK(G, ev)].sh + '.' };
    if (t === 'OUTLIER') {
      var p = ev.poll, leadK = p.y > 0 ? 'L' : 'C';
      return { tag: 'POLL', kick: 'The poll everybody talks about', txt: POLLSTERS[ev.k].nm + ' has ' + PARTY[leadK].sh + ' up ' + Math.abs(p.y) + ' in ' + u.nm + ', ' + aAn(ev.swing) + ' ' + ev.swing + '-point ' + (ev.fromPrev ? 'swing from its last survey' : 'gap from the average') + '. Cable has the graphic up already.' };
    }
    if (t === 'CRISIS') return { tag: 'WIRE', kick: 'Overseas crisis', txt: 'An overseas crisis dominates the week. Voters rally, briefly, around whoever is holding the phone, and that is ' + pn(G, inc) + '.' };
    if (t === 'LAWSUIT') return { tag: 'WIRE', kick: 'How fast to count', txt: 'A lawsuit in ' + u.nm + ' challenges when officials may begin processing mail ballots. The outcome decides how fast the state can count, not who wins it.' };
    if (t === 'REGDRIVE') return { tag: 'FIELD', kick: 'Registration deadline', txt: 'Registration closes soon in ' + u.nm + '. Teo can register new supporters there for $5M. The polls will not see a single one of them; likely-voter screens discount people who have never voted.' };
    if (t === 'TOWNHALL') return { tag: 'WIRE', kick: 'The town hall', txt: 'A network offers the candidate a prime-time town hall from ' + u.nm + '. It takes a day of the schedule and it is live.' };
    if (t === 'VPWEEK') return { tag: 'WIRE', kick: 'The running mate’s week', txt: PARTY[hitK(G, ev)].vp + ' had a rough week: a garbled answer on the Sunday shows, replayed on a loop.' };
    if (t === 'OCT') return { tag: 'WIRE', kick: 'The October story', txt: 'A long investigative story questions ' + PARTY[hitK(G, ev)].cand + '’s business dealings before politics. The facts are contested; the headline is not.' };
    if (t === 'EARLY') return { tag: 'DATA', kick: 'The early vote', txt: 'Early-vote returns from ' + u.nm + ': ballots from registered ' + PARTY[ev.party].sh + ' voters are running ' + (ev.up ? 'ahead of' : 'behind') + ' last time. Nadia’s note: early-vote data tell you how people vote, not whom they vote for.' };
    return { tag: 'WIRE', kick: '', txt: '' };
  }
  function evOpts(G, ev) {
    var t = ev.t, u = ev.u != null ? U[ev.u] : null, you = ev.side === 'you', incYou = G.inc === G.side, n = 0;
    if (t === 'JOBS') {
      var good = ev.strong === incYou;
      return [{ k: 'M', l: 'Make it the message', s: good ? 'It helps you, so say it every day: the effect grows by about 60%.' : 'It hurts you. Reframing it might halve the damage, or make it 40% worse.' },
        { k: 'S', l: 'Stay on your message', s: 'Let the report do what it does and keep your week.' }];
    }
    if (t === 'STORM') return [
      { k: 'P', l: 'Pause ads there and send the candidate to help', s: 'Your ' + u.id + ' ads this week are refunded and one candidate day goes to the storm. Voters notice who showed up.' },
      { k: 'K', l: 'Keep the ads running', s: 'The money keeps working, with a real chance the ads read as tone-deaf.' },
      { k: 'M', l: 'Move that money to neighboring states', s: 'This week’s ' + u.id + ' ads go to the rest of the ' + EV_DIV[u.div] + ' division, in proportion to your plan.' }];
    if (t === 'HOTMIC') return you ? [
      { k: 'A', l: 'Apologize today', s: 'Takes the smallest hit: about −0.6 in the region and −0.2 nationally.' },
      { k: 'D', l: 'Double down', s: 'Your base loves it. The region does not: about −1.2 there and −0.4 nationally.' },
      { k: 'I', l: 'Ignore it', s: 'Hope the cycle moves on: about −0.9 in the region and −0.3 nationally.' }] : [
      { k: 'R', l: 'Run ads on it there', s: '$8M to make sure every voter in the region hears it. About +0.6 more for you there.', cost: 8 },
      { k: 'P', l: 'Let the press carry it', s: 'Free, and the press will. About +0.2 more there.' },
      { k: 'S', l: 'Stay above it', s: 'Look like the grown-up in the room. About +0.1 nationally.' }];
    if (t === 'ENDORSE') return [
      { k: 'Y', l: 'Accept', s: 'Two candidate days next week go to ' + u.nm + '. The endorsement is worth about a point there and fades slowly.' },
      { k: 'N', l: 'Decline', s: 'Keep next week’s schedule your own.' }];
    if (t === 'LEAK') return ev.ahead ? [
      { k: 'F', l: 'Fundraise off it', s: '+$8M from donors who like a winner. Volunteers who think it is won stay home a little more.' },
      { k: 'B', l: 'Say we are running behind', s: 'No money, no complacency. Nobody believes it, which is fine.' }] : [
      { k: 'F', l: 'Fundraise off it', s: '+$12M from donors who respond to fear. Volunteers respond to hope, and lose a little of it.' },
      { k: 'D', l: 'Dispute it', s: 'Call it an outlier and move on. Nothing gained, nothing lost.' }];
    if (t === 'THIRD') return you ? [
      { k: 'T', l: 'Take on the independent', s: '$6M in the region to win some of them back. Halves the damage.', cost: 6 },
      { k: 'I', l: 'Ignore it', s: 'Save the money and take the full hit there: about −1.0, fading slowly.' }] : [
      { k: 'S', l: 'Stay out of it', s: 'It is their problem. The safe play is to leave it alone, so it is the only one offered.' }];
    if (t === 'OUTLIER') return [
      { k: 'C', l: 'Chase it: move $15M there this week', s: 'On top of your plan for ' + u.nm + '. The poll is one of many; the money is real.', cost: 15 },
      { k: 'T', l: 'Trust the average', s: 'The poll goes into the average like any other and gets the weight it deserves.' }];
    if (t === 'CRISIS') return incYou ? [
      { k: 'C', l: 'Close ranks', s: 'Stand behind the administration you belong to. A little more of the rally comes to you.' },
      { k: 'S', l: 'Stay on your message', s: 'Let the rally run its course.' }] : [
      { k: 'Q', l: 'Question the response', s: 'Makes the week a fight. Both sides’ voters get keener to turn out.' },
      { k: 'W', l: 'Stand with the country', s: 'Say the right things and wait. A small credit nationally.' }];
    if (t === 'LAWSUIT') return [
      { k: 'F', l: 'Fund the defense of the current timeline', s: '$3M in legal fees. The count in ' + u.nm + ' runs on schedule.', cost: 3 },
      { k: 'S', l: 'Stay out', s: 'Free. If the challenge wins, the mail count there starts a day late on election night.' }];
    if (t === 'REGDRIVE') return [
      { k: 'Y', l: 'Fund the drive', s: '$5M for about a quarter of a point in ' + u.nm + ' on Election Day. No poll will ever show it.', cost: 5 },
      { k: 'N', l: 'Save the money', s: 'Spend it where the polls can see it.' }];
    if (t === 'TOWNHALL') return [
      { k: 'Y', l: 'Take the town hall', s: 'One candidate day. Live television: usually a small help, sometimes a clip you will regret.' },
      { k: 'N', l: 'Decline', s: 'Keep the day and the risk off the table.' }];
    if (t === 'VPWEEK') return you ? [
      { k: 'B', l: 'Bench them for a week', s: 'No running-mate events this week. About −0.1 nationally.' },
      { k: 'K', l: 'Keep them out there', s: 'About −0.3 nationally now; a coin flip says they win some back next week.' }] : [
      { k: 'N', l: 'Let it play out', s: 'Their week, not yours. Nothing to do but watch.' }];
    if (t === 'OCT') return you ? [
      { k: 'R', l: 'Rapid response', s: '$15M in documents, surrogates and ads. Halves the damage.', cost: 15 },
      { k: 'C', l: 'Counterpunch with your own research', s: '$8M. A coin flip: it lands on them, or it extends your story. Both sides get keener to vote.', cost: 8 },
      { k: 'O', l: 'Ride it out', s: 'Free, and the full hit: about −1.2 nationally, fading slowly.' }] : [
      { k: 'A', l: 'Amplify it', s: '$10M to keep it on the air. About +0.3 more for you.', cost: 10 },
      { k: 'S', l: 'Stay on message', s: 'Let their answer be the story.' }];
    if (t === 'EARLY') {
      for (var i = 0; i < NU; i++) if (G.S[G.side].lvl[i] > 0) n++;
      return [{ k: 'R', l: 'Redirect the field program to chase ballots', s: 'Every open office gets a week’s worth of extra contacts. Overtime and vans: ' + F.M(0.4 * n) + '.' },
        { k: 'H', l: 'Hold the plan', s: 'The plan was built for this weekend. Trust it.' }];
    }
    return [];
  }
  var BRIEF = [
    '',
    'Labor Day. Nine weeks, {cash} in the bank, {k} contests within four points of the one that decides it, and money for maybe half of them. Nadia has a forecast. Teo wants field offices this week, not next. Everyone wants the candidate.',
    'The first post-Labor Day polls are in, and so are the first overreactions. One poll is a data point. Five polls are a rumor. An average is a tool.',
    'Debate week. It will draw tens of millions of viewers and move very few of them. Prep anyway: the thing a debate reliably moves is the next week of coverage.',
    'Mid-September money is the cheapest we will spend and the fastest to disappear. Field offices opened now will still be paying out on Election Day.',
    'The running mates debate this week. This is the week everyone remembers the running mates exist.',
    'Early voting is underway in much of the country. Every vote banked is one the weather cannot touch.',
    'Last debate. After this the campaign is ads, doors, and whatever the news decides to be.',
    'October. Something always breaks in October. The only question is whose.',
    'Final week. Last chance to move money. Anything we do not spend becomes the recount fund, which is the fund we hope to waste.'
  ];
  var WEEK_T = ['', 'Labor Day', 'The first polls', 'The first debate', 'Mid-September', 'The running mates', 'Early voting', 'The last debate', 'October', 'The final week'];

  /* ---------- what the machine teaches: field notes, glossary, case file, takeaways ---------- */
  var SRC = {
    nara: { t: 'National Archives: 2024 to 2028 electoral vote allocation', u: 'https://www.archives.gov/electoral-college/allocation' },
    naraAbout: { t: 'National Archives: About the Electoral College', u: 'https://www.archives.gov/electoral-college/about' },
    amend: { t: 'National Archives: Constitutional Amendments 11 to 27', u: 'https://www.archives.gov/founding-docs/amendments-11-27' },
    app1: { t: 'U.S. Census Bureau: 2020 Census Apportionment, Table 1', u: 'https://www2.census.gov/programs-surveys/decennial/2020/data/apportionment/apportionment-2020-table01.pdf' },
    app2: { t: 'U.S. Census Bureau: 2020 Census Apportionment Results', u: 'https://www.census.gov/data/tables/2020/dec/2020-apportionment-data.html' },
    urban: { t: 'U.S. Census Bureau: State urban and rural population, 2020 and 2010', u: 'https://www2.census.gov/geo/docs/reference/ua/State_Urban_Rural_Pop_2020_2010.xlsx' },
    edu: { t: 'U.S. Census Bureau: ACS 2021 1-year, Table S1501 (percent bachelor’s degree or higher, age 25+), via FRED series GCT1502', u: 'https://data.census.gov/table/ACSST1Y2021.S1501' },
    ufl: { t: 'University of Florida Election Lab: 2024 General Election Turnout', u: 'https://election.lab.ufl.edu/2024-general-election-turnout/' },
    divs: { t: 'U.S. Census Bureau: Census regions and divisions', u: 'https://www.census.gov/programs-surveys/economic-census/guidance-geographies/levels.html' },
    close: { t: 'PBS NewsHour: Here’s when polls are closing in your state', u: 'https://www.pbs.org/newshour/politics/heres-when-polls-are-closing-in-your-state' },
    y1800: { t: 'National Archives: 1800 Electoral College results', u: 'https://www.archives.gov/electoral-college/1800' },
    y1824: { t: 'National Archives: 1824 Electoral College results', u: 'https://www.archives.gov/electoral-college/1824' },
    y1876: { t: 'National Archives: 1876 Electoral College results', u: 'https://www.archives.gov/electoral-college/1876' },
    y1888: { t: 'National Archives: 1888 Electoral College results', u: 'https://www.archives.gov/electoral-college/1888' },
    y2000: { t: 'National Archives: 2000 Electoral College results', u: 'https://www.archives.gov/electoral-college/2000' },
    y1988: { t: 'National Archives: 1988 Electoral College results', u: 'https://www.archives.gov/electoral-college/1988' },
    y2016: { t: 'National Archives: 2016 Electoral College results', u: 'https://www.archives.gov/electoral-college/2016' },
    nara24: { t: 'National Archives: 2024 Electoral College results', u: 'https://www.archives.gov/electoral-college/2024' },
    fec16: { t: 'FEC: Federal Elections 2016', u: 'https://www.fec.gov/resources/cms-content/documents/federalelections2016.pdf' },
    fec20: { t: 'FEC: Official 2020 Presidential General Election Results', u: 'https://www.fec.gov/resources/cms-content/documents/2020presgeresults.pdf' },
    house: { t: 'History, Art and Archives, U.S. House: Electoral College', u: 'https://history.house.gov/Institution/Electoral-College/Electoral-College/' },
    ecra: { t: 'Protect Democracy: Understanding the Electoral Count Reform Act of 2022', u: 'https://protectdemocracy.org/work/understanding-the-electoral-count-reform-act-of-2022/' },
    chiafalo: { t: 'Supreme Court of the United States: Chiafalo v. Washington, opinion of the Court (July 6, 2020)', u: 'https://www.supremecourt.gov/opinions/19pdf/19-465_i425.pdf' },
    aapor16: { t: 'AAPOR: An Evaluation of 2016 Election Polls in the United States', u: 'https://aapor.org/wp-content/uploads/2022/11/AAPOR-2016-Election-Polling-Report.pdf' },
    aapor20: { t: 'AAPOR: Task Force on 2020 Pre-Election Polling', u: 'https://aapor.org/wp-content/uploads/2022/11/AAPOR-Task-Force-on-2020-Pre-Election-Polling_Report-FNL.pdf' },
    aapor24: { t: 'AAPOR: Task Force on 2024 Pre-Election Polling, executive summary', u: 'https://aapor.org/wp-content/uploads/2025/10/Task-Force-on-2024-Pre-Election-Polling-Report-Executive-Summary.pdf' },
    pew: { t: 'Pew Research Center: Understanding the margin of error in election polls', u: 'https://www.pewresearch.org/short-reads/2016/09/08/understanding-the-margin-of-error-in-election-polls/' },
    geruso: { t: 'Geruso, Spears and Talesara: Inversions in US Presidential Elections, 1836 to 2016', u: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10782436/' },
    kalla: { t: 'Kalla and Broockman: The Minimal Persuasive Effects of Campaign Contact in General Elections (APSR, 2018)', u: 'https://www.cambridge.org/core/journals/american-political-science-review/article/abs/minimal-persuasive-effects-of-campaign-contact-in-general-elections-evidence-from-49-field-experiments/753665A313C4AB433DBF7110299B7433' },
    coppock: { t: 'Coppock, Hill and Vavreck: The small effects of political advertising are small regardless of context (Science Advances, 2020)', u: 'https://isps.yale.edu/research/publications/isps20-018' },
    gerber: { t: 'Gerber, Gimpel, Green and Shaw: How large and long-lasting are the persuasive effects of televised campaign ads? (APSR, 2011)', u: 'https://www.cambridge.org/core/journals/american-political-science-review/article/abs/how-large-and-longlasting-are-the-persuasive-effects-of-televised-campaign-ads-results-from-a-randomized-field-experiment/DA29FE8A5581C772006A1DEBB21CFC4C' },
    gotv: { t: 'Chronicle of Philanthropy: Cost of door-to-door canvassing is $19 per vote, research finds', u: 'https://www.philanthropy.com/news/cost-of-door-to-door-canvassing-is-19-per-vote-research-finds/' },
    pons: { t: 'Le Pennec and Pons: How Do Campaigns Shape Vote Choice? (NBER Working Paper 26572)', u: 'https://www.nber.org/papers/w26572' },
    npv20: { t: 'National Popular Vote (advocacy group): In 2020, 96% of the presidential campaign was in 12 states', u: 'https://www.nationalpopularvote.com/2020-96-presidential-campaign-visits-and-advertising-was-just-12-states' },
    npv24: { t: 'National Popular Vote (advocacy group): Almost all (94%) of the 2024 campaign was concentrated on 7 states', u: 'https://www.nationalpopularvote.com/almost-all-94-2024-presidential-campaign-was-concentrated-7-states' },
    opb: { t: 'OPB: Virginia joins a national effort to ensure only popular vote winners become president', u: 'https://www.opb.org/article/2026/04/14/virginia-ups-the-national-popular-vote-compact-to-222-votes/' },
    ceir: { t: 'Center for Election Innovation & Research: Pre-Processing Timelines, Fall 2026 update', u: 'https://electioninnovation.org/research/pre-processing-timelines/' },
    watson: { t: 'SCOTUSblog: Justices uphold state law allowing for late-arriving mail-in ballots', u: 'https://www.scotusblog.com/2026/06/justices-uphold-state-law-allowing-for-late-arriving-mail-in-ballots/' },
    nass: { t: 'NASS: State election canvassing timeframes and recount thresholds (October 2024)', u: 'https://www.nass.org/sites/default/files/reports/summary-canvass-certification-laws-oct2024.pdf' },
    bpWI: { t: 'Ballotpedia: Recount laws in Wisconsin', u: 'https://ballotpedia.org/Recount_laws_in_Wisconsin' },
    bpGA: { t: 'Ballotpedia: Recount laws in Georgia', u: 'https://ballotpedia.org/Recount_laws_in_Georgia' },
    fairvote: { t: 'FairVote: An analysis of statewide election recounts, 2000 to 2023', u: 'https://fairvote.org/report/election-recounts-2024/' },
    split: { t: '270toWin: Split electoral votes in Maine and Nebraska', u: 'https://www.270towin.com/content/split-electoral-votes-maine-and-nebraska/' },
    lb3: { t: 'Nebraska Legislature, Unicameral Update: Electoral winner-take-all proposal stalls on first round', u: 'https://update.legislature.ne.gov/?p=38396' },
    neInit: { t: 'Ballotpedia: Nebraska Presidential Electoral Winner-Take-All System Initiative (2026)', u: 'https://ballotpedia.org/Nebraska_Presidential_Electoral_Winner-Take-All_System_Initiative_(2026)' },
    neEnd: { t: 'Nebraska Examiner: Advocates end Nebraska property tax, winner-take-all, hand-count ballots petition effort (June 10, 2026)', u: 'https://nebraskaexaminer.com/2026/06/10/advocates-end-nebraska-property-tax-winner-take-all-hand-count-ballots-petition-effort/' },
    rcv: { t: 'Ballotpedia: Maine Ranked-Choice Voting for Presidential Elections Referendum (2020)', u: 'https://ballotpedia.org/Maine_Ranked-Choice_Voting_for_Presidential_Elections_Referendum_(2020)' },
    fte: { t: 'Wikipedia: FiveThirtyEight (the 2016 forecast)', u: 'https://en.wikipedia.org/wiki/FiveThirtyEight' }
  };
  var NOTES = [
    { id: 'electors', term: 'Electors', note: 'The college is 538 people chosen for one job. Each state gets one elector per House seat plus two for its senators; DC gets three under the 23rd Amendment, no more than the least populous state. On a presidential ballot you are choosing a slate of electors.', src: [SRC.nara, SRC.amend], hint: 'you open the machine' },
    { id: 'm270', term: '270', note: 'A majority of 538 is 270. If nobody reaches it, the House chooses the President from the top three, one vote per state delegation, 26 to win; the Senate chooses the Vice President from the top two.', src: [SRC.amend, SRC.house], hint: 'you open the machine' },
    { id: 'apport', term: 'Apportionment', note: 'After each census the 435 House seats are redistributed by the method of equal proportions. After 2020, seven seats moved among 13 states: Texas gained two; Colorado, Florida, Montana, North Carolina and Oregon one each; California, Illinois, Michigan, New York, Ohio, Pennsylvania and West Virginia lost one each.', src: [SRC.app2, SRC.app1], hint: 'week 2 begins, or you select a state whose House seats changed in 2020' },
    { id: 'small', term: 'Small-state arithmetic', note: 'Two senator electors per state give small states more electors per resident: about 5.2 per million in Wyoming against 1.4 in California on the 2020 apportionment counts. The larger distortion is strategic: winner-take-all makes a vote in a safe state nearly worthless to a campaign.', src: [SRC.app1], hint: 'you select one of the smallest states or DC, or open the Voter power lens' },
    { id: 'district', term: 'The district method', note: 'Maine (since 1972) and Nebraska (since 1992) give two electors to the statewide winner and one to the winner of each congressional district. Nebraska split in 2008, 2020 and 2024; Maine in 2016, 2020 and 2024. A 2025 Nebraska bill to return to winner-take-all fell to a filibuster, and the campaign for a 2026 ballot initiative stopped collecting signatures in June 2026. Maine counts presidential ballots by ranked choice; with two candidates it changes nothing.', src: [SRC.split, SRC.nara24, SRC.lb3, SRC.neInit, SRC.neEnd, SRC.rcv], hint: 'you select Maine, Nebraska or one of their districts' },
    { id: 'tip', term: 'The tipping-point state', note: 'Line up the winner’s states from safest to closest and add electors until the total reaches 270. The state that crosses the line is the tipping point, and its margin is the one that decided the election. In 2020 it was Wisconsin, decided by 0.63 points while the national margin was 4.45.', src: [SRC.fec20], hint: 'the first forecast runs' },
    { id: 'inversion', term: 'Inversions', note: 'The popular-vote winner has lost the college four times: 1876, 1888, 2000 and 2016. In 1824 the House chose the runner-up. Geruso, Spears and Talesara estimate that about 40 percent of elections decided by under one point nationally would be inversions, and that which party benefits has changed across eras.', src: [SRC.y1876, SRC.y1888, SRC.y2000, SRC.y2016, SRC.geruso], hint: 'the forecast puts inversion odds at 5 percent or more, or a run ends in one' },
    { id: 'moe', term: 'Margin of error', note: 'A poll of 800 carries a margin of error near 3.5 points on each candidate’s share and roughly double that on the lead, because a voter who leaves one column joins the other. It covers sampling luck only: not who declines to answer, not how the pollster guesses who will turn out.', src: [SRC.pew], hint: 'you open the Polls tab, or the second week begins' },
    { id: 'house', term: 'House effects', note: 'Pollsters differ in how they reach people, weight them and guess who will vote, and some sit consistently to one side of the average. A good average estimates each firm’s lean and adjusts for it before it counts the poll.', src: [SRC.aapor24], hint: 'week 3 begins, or you open a pollster’s record' },
    { id: 'corr', term: 'Correlated error', note: 'Polling misses arrive together in similar states. AAPOR found that 2016 state polls missed across the Upper Midwest, partly because many did not weight by education. In 2020 state presidential polls missed by 5.1 points on average in the final two weeks. In 2024 they missed by 3.0, their best since 1944, yet erred in the same direction for a third straight cycle. Historically each party has been underestimated about equally often.', src: [SRC.aapor16, SRC.aapor20, SRC.aapor24], hint: 'you open the Error twins lens or compare independent errors' },
    { id: 'forecast', term: 'Reading a forecast', note: 'A 71 percent favorite loses about three times in ten. FiveThirtyEight’s final 2016 forecast gave the candidate who went on to lose a 71 percent chance. A forecast is judged by whether its 70s come true about 70 percent of the time, not by one night.', src: [SRC.fte], hint: 'your win chance first passes 70 percent or falls below 30, or week 4 begins' },
    { id: 'persuade', term: 'Persuasion is expensive', note: 'Kalla and Broockman’s review of 49 field experiments found an average persuasive effect of zero for campaign contact in general elections. Coppock, Hill and Vavreck tested 49 ads in 59 experiments on 34,000 people: small effects, about the same for attack and positive ads, and not much larger in battleground states.', src: [SRC.kalla, SRC.coppock], hint: 'you buy your first ads' },
    { id: 'fade', term: 'Ads fade in days', note: 'In a randomized experiment during the 2006 Texas governor’s race, television ads moved preferences sharply, and the effect was no longer detectable a week later. September money has mostly evaporated by November.', src: [SRC.gerber], hint: 'week 2 begins' },
    { id: 'turnout', term: 'Turnout arithmetic', note: 'Changing a mind nets two votes of margin; turning out a supporter nets one. Supporters are far easier to find. Green and Gerber’s review of field experiments found about one extra vote for every 14 people reached at the door, roughly $19 a vote at the $16-an-hour canvassing wage the authors assumed in 2004.', src: [SRC.gotv], hint: 'you open your first field office or fund a registration drive' },
    { id: 'debates', term: 'Debates', note: 'Debates draw the biggest audiences of a campaign and are among its weakest levers. Le Pennec and Pons, covering 62 elections and 56 televised debates in ten countries, found no meaningful effect of debates on vote choice.', src: [SRC.pons], hint: 'the first debate is over' },
    { id: 'where', term: 'Where campaigns go', note: 'By one count, 96 percent of 2020 general-election campaign events (204 of 212) were in 12 states, and 94 percent in 2024 (246 of 262) were in seven. The counts come from National Popular Vote, an advocacy group for the interstate compact, working with FairVote.', src: [SRC.npv20, SRC.npv24], hint: 'the candidate holds a first rally' },
    { id: 'count', term: 'Count order', note: 'Five states, including Pennsylvania and Wisconsin, do not allow mail-ballot envelopes to be processed before Election Day, so in-person votes tend to report first there. Which side an early lead favors depends on who voted by which method. In June 2026 the Supreme Court held 5 to 4 in Watson v. RNC that federal law does not bar counting mail ballots postmarked by Election Day that arrive after it.', src: [SRC.ceir, SRC.watson], hint: 'election night begins' },
    { id: 'calls', term: 'Race calls', note: 'A race call is a news organization’s projection that the uncounted vote cannot change the leader. It is not a result. States certify results in the canvass, weeks later.', src: [SRC.naraAbout], hint: 'the desk makes its first call' },
    { id: 'recount', term: 'Recounts', note: 'FairVote found 36 statewide recounts among 6,929 statewide general elections from 2000 to 2023: an average shift of 551 votes and three reversals, all from margins of 0.06 percent or less. Arizona, Florida and Pennsylvania recount automatically at 0.5 points, Michigan within 2,000 votes, Ohio under 0.25 points; Georgia and Wisconsin only on request.', src: [SRC.fairvote, SRC.nass, SRC.bpGA, SRC.bpWI], hint: 'a contest finishes within a point' },
    { id: 'contingent', term: 'The contingent election', note: 'In 1800 Jefferson and Burr tied at 73 and the House needed 36 ballots; the 12th Amendment (1804) separated the votes for President and Vice President. In 1824 no one had a majority and the House chose John Quincy Adams: 13 states to Jackson’s 7 and Crawford’s 4.', src: [SRC.y1800, SRC.y1824, SRC.house], hint: 'the forecast gives a tie half a percent or more, or a count ends 269 to 269' },
    { id: 'congress', term: 'The count in Congress', note: 'Electors meet on the first Tuesday after the second Wednesday in December, and Congress counts on January 6. The Electoral Count Reform Act of 2022 requires a fifth of each chamber to sign an objection, limits the grounds, has governors certify electors six days before they meet, and makes the Vice President’s role ministerial.', src: [SRC.ecra, SRC.naraAbout], hint: 'the electors meet in December' },
    { id: 'faithless', term: 'Faithless electors', note: 'In 2016 seven electors voted for President against their state’s result. In Chiafalo v. Washington (2020) the Supreme Court held unanimously that states may enforce an elector’s pledge.', src: [SRC.y2016, SRC.chiafalo], hint: 'the electors meet in December' },
    { id: 'npv', term: 'The interstate compact', note: 'Eighteen states and DC, holding 222 electors after Virginia joined in April 2026, have agreed to award their electors to the national popular-vote winner once states with 270 electors join. It is not in force. Whether it would be an improvement is a live political argument, and this machine takes no side in it.', src: [SRC.opb], hint: 'you reach the debrief' }
  ];
  var DEFS = {
    elector: { t: 'Elector', d: 'One of the 538 people chosen, state by state, to cast the votes that elect the President. Your ballot picks a party’s slate of them.', note: 'electors' },
    apport: { t: 'Apportionment', d: 'The once-a-decade redistribution of the 435 House seats by population, which also sets each state’s electors.', note: 'apport' },
    tip: { t: 'Tipping point', d: 'The contest that carries the winner past 270 when states are lined up from safest to closest. Its margin is the one that decides the election.', note: 'tip' },
    power: { t: 'Voter power', d: 'How often a voter here decides the election compared with the average voter: tipping-point odds per vote, scaled so the national average is ×1.', note: 'small' },
    bias: { t: 'Map bias', d: 'The tipping-point margin minus the national margin. You can lose the popular vote by this much and still win, or must win it by this much to win.', note: 'tip' },
    moe: { t: 'Margin of error', d: 'The range sampling luck alone can move a candidate’s share, 95 times in 100. On the lead it is about twice as large.', note: 'moe' },
    housefx: { t: 'House effect', d: 'A pollster’s consistent lean relative to the average, from how it samples, weights and screens. The desk estimates and removes it.', note: 'house' },
    lv: { t: 'Likely-voter screen', d: 'A pollster’s guess about who will turn out to vote. It discounts people who have not voted before, so new registrants and door-knocked voters barely show.', note: 'turnout' },
    corr: { t: 'Correlated error', d: 'Polls in similar states miss in the same direction at once, because they share methods and blind spots. It is why a sweep is more likely than coin flips suggest.', note: 'corr' },
    snake: { t: 'The snake', d: 'Every contest in one line, sized by electors, from your safest to theirs. Where it crosses 270 is the tipping point.', note: 'tip' },
    persuasion: { t: 'Persuasion', d: 'Changing someone’s choice. Worth two votes of margin, rare, expensive, and quick to fade.', note: 'persuade' },
    mobil: { t: 'Mobilization', d: 'Getting your own supporters to vote. Worth one vote of margin each, slower to build, and still there on Election Day.', note: 'turnout' },
    ground: { t: 'Ground game', d: 'Field offices, staff and volunteers knocking doors and making calls. The work builds up week by week.', note: 'turnout' },
    headroom: { t: 'Headroom', d: 'How far your supporters’ turnout sits below the ceiling this model allows. More headroom, more a field office can do.', note: 'turnout' },
    preproc: { t: 'Pre-processing', d: 'Verifying and opening mail-ballot envelopes before Election Day so the ballots can be counted as soon as polls close.', note: 'count' },
    call: { t: 'Race call', d: 'A news desk’s projection that the uncounted vote cannot change the leader. A projection, not a result.', note: 'calls' },
    canvass: { t: 'Canvass', d: 'The official post-election count and audit, county by county, that turns election-night returns into certified results.', note: 'calls' },
    recount: { t: 'Recount', d: 'A second count, automatic in some states below a margin and on request in others. It usually moves hundreds of votes.', note: 'recount' },
    cert: { t: 'Certificate of ascertainment', d: 'The governor’s signed record of a state’s results and its electors, due at least six days before the electors meet.', note: 'congress' },
    contingent: { t: 'Contingent election', d: 'What happens at 269 to 269 or with no majority: the House picks the President by state delegation, the Senate the Vice President.', note: 'contingent' },
    faithless: { t: 'Faithless elector', d: 'An elector who votes against the candidate they pledged to. States may enforce the pledge.', note: 'faithless' },
    inversion: { t: 'Inversion', d: 'An election in which the popular-vote winner loses the electoral college.', note: 'inversion' }
  };
  var CASE = {
    disclaimer: 'This machine takes no side. It depicts no real election, predicts nothing, and gives either party the same rules, the same costs and the same luck: which party owns which coalition, which way the polls miss, and which way the mail vote leans are all coin flips on every map.',
    lede: 'What is real, what is a model assumption, and what is invented.',
    asOf: 'September 30, 2026',
    facts: [
      { html: '<i>The college.</i> 538 electors, 270 to win. Each state has one elector per House seat plus two; DC has three under the 23rd Amendment. The allocation shown is the one for 2024 and 2028.', src: [SRC.nara, SRC.amend] },
      { html: '<i>The college.</i> Electors come from the 2020 apportionment: 435 seats by the method of equal proportions. Seven seats moved among 13 states, and every state here has its House seats plus two electors.', src: [SRC.app1, SRC.app2] },
      { html: '<i>The college.</i> Maine (since 1972) and Nebraska (since 1992) award two electors statewide and one per congressional district. Nebraska’s 2025 winner-take-all bill failed to break a filibuster, 31 to 18 with 33 needed; the 2026 initiative campaign stopped collecting signatures on June 10, 2026.', src: [SRC.split, SRC.nara24, SRC.lb3, SRC.neInit, SRC.neEnd], asOf: 'September 30, 2026' },
      { html: '<i>The college.</i> Eighteen states and DC, holding 222 electors after Virginia joined on April 14, 2026, belong to the National Popular Vote Interstate Compact. It takes effect only if states with 270 join.', src: [SRC.opb], asOf: 'September 30, 2026' },
      { html: '<i>The map’s data.</i> Voting-eligible population and 2024 turnout by state are the University of Florida Election Lab’s estimates (data file v0.4); urban shares are the 2020 Census; degree shares are ACS 2021 one-year estimates; poll-closing times are when the last polls close, in Eastern Time.', src: [SRC.ufl, SRC.urban, SRC.edu, SRC.close, SRC.divs] },
      { html: '<i>History.</i> 1800: Jefferson and Burr tied at 73; the House took 36 ballots, and the 12th Amendment followed in 1804. 1824: Jackson 99, Adams 84, Crawford 41, Clay 37; the House chose Adams with 13 states to 7 and 4.', src: [SRC.y1800, SRC.y1824, SRC.house] },
      { html: '<i>History.</i> Inversions: 1876 (185 to 184, after an Electoral Commission settled disputed returns from four states), 1888 (233 to 168), 2000 (271 to 266, with a certified Florida margin of 537 votes) and 2016 (304 to 227, with seven faithless votes for President).', src: [SRC.y1876, SRC.y1888, SRC.y2000, SRC.y2016, SRC.fec16] },
      { html: '<i>History.</i> 2020: a national margin of 4.45 points and a tipping-point margin of 0.63 in Wisconsin. About 21,500 voters switching sides in Georgia, Arizona and Wisconsin would have produced 269 to 269.', src: [SRC.fec20] },
      { html: '<i>Polls and forecasts.</i> AAPOR’s 2024 task force: an average absolute error of 3.3 points across 611 polls in the final two weeks; state presidential polls missed by 3.0, their best since 1944; the misses ran the same direction for a third straight cycle; historically each party has been underestimated about equally often.', src: [SRC.aapor24, SRC.aapor20, SRC.aapor16] },
      { html: '<i>Polls and forecasts.</i> The margin of error covers sampling only and roughly doubles on the lead.', src: [SRC.pew] },
      { html: '<i>Campaign research.</i> Persuasion: zero average effect across 49 field experiments in general elections (Kalla and Broockman); small ad effects across 59 experiments (Coppock, Hill and Vavreck); strong TV effects that vanish within a week (Gerber, Gimpel, Green and Shaw).', src: [SRC.kalla, SRC.coppock, SRC.gerber] },
      { html: '<i>Campaign research.</i> Mobilization: about one extra vote per 14 people reached at the door (Green and Gerber). Debates: no meaningful effect on vote choice across 62 elections in ten countries (Le Pennec and Pons).', src: [SRC.gotv, SRC.pons] },
      { html: '<i>Campaign research.</i> Campaign events concentrated in 12 states in 2020 and seven in 2024, by the count of an advocacy group for the interstate compact.', src: [SRC.npv20, SRC.npv24] },
      { html: '<i>Counting.</i> Five states (Alabama, Kentucky, Mississippi, Pennsylvania and Wisconsin) do not permit mail-ballot envelopes to be processed before Election Day.', src: [SRC.ceir], asOf: 'September 30, 2026' },
      { html: '<i>Counting.</i> Watson v. RNC, June 29, 2026, 5 to 4, opinion by Justice Barrett: the federal Election Day statutes do not bar counting ballots postmarked by Election Day and received afterward.', src: [SRC.watson] },
      { html: '<i>Recounts.</i> The automatic recount rules used for Alabama, Arizona, Colorado, Connecticut, DC, Florida, Hawaii, Kentucky, Michigan, Nebraska, New Mexico, New York, North Dakota, Ohio, Oregon, Pennsylvania, South Carolina, Washington and Wyoming, and the requested rules for Georgia, Montana and Wisconsin, including when the state pays, are those states’ laws. FairVote counted 36 statewide recounts among 6,929 statewide general elections from 2000 to 2023, with an average shift of 551 votes.', src: [SRC.nass, SRC.bpGA, SRC.bpWI, SRC.fairvote] },
      { html: '<i>After the count.</i> Electors meet on the first Tuesday after the second Wednesday in December; Congress counts on January 6. The Electoral Count Reform Act of 2022 sets a one-fifth threshold for objections and makes the Vice President’s role ministerial. States may enforce electors’ pledges (Chiafalo v. Washington, 2020).', src: [SRC.naraAbout, SRC.ecra, SRC.chiafalo] }
    ],
    assumptions: [
      'The political map of every run is generated, not measured: margins built from each state’s real urban and degree shares, a random lean for each Census division, and noise, scaled to a spread of 16 to 19 points and then shifted so the race starts where you chose.',
      'Maine’s and Nebraska’s districts split the state’s eligible voters equally, with stylized urban and degree shares for each district.',
      'Ads: an effect of 0.45 × message × persuadability × ln(1 + spend ÷ cost) points, half gone each week. Airtime costs about $0.9M per million eligible voters and rises 6% a week. National ads cost as if every state were bought.',
      'Field: a turnout boost of up to 3% × headroom for your side’s supporters, building as 1 − e^(−contacts ÷ 6). Contacts keep while an office stays open and lose a fifth a week once it closes. Offices cost $1M plus $0.25M per million voters to open and $0.3M per million per level each week. Polls see half of it.',
      'Rallies: +0.30 points (running mate +0.15), 60% for each repeat in the same state that week, a little spillover to neighbors, half gone each week. A fundraiser brings $7M ($3M for the running mate).',
      'Debates: a performance draw by posture plus 0.12 per prep day; the net shift is 0.35 × the difference, capped at 0.9 points, halved for the running mates, and fading 30% a week.',
      'Polling error: a national miss (sd 2.4), a miss that scales with how urban a state is (sd 1.0) and with its degree share (sd 1.6), a regional miss (sd 1.0) and a state miss (sd 1.6). Its direction is random. House effects have sd 1.2 (2.0 for the opt-in panel).',
      'The race drifts about 0.35 points a week nationally; Election Day adds noise of 0.7 nationally and 0.8 per state. The forecast adds its own uncertainty for the weeks left.',
      'Count profiles: the five real Election Day-processing states count mail late; the eight “long count” states are stylized. Which party the mail vote favors, and by 10 to 25 points, is random per map.',
      'The desk calls a contest when the projected lead exceeds three standard deviations with a quarter of the vote in, never against the final result, and never within half a point.',
      'Recount rules outside the listed states are a labeled default: on request at 0.5 points or less, paid by the requester. A requested recount costs $2M plus $1.5M per million votes unless the state’s law says the state pays. A recount shifts the margin by a random amount with a standard deviation of 0.015 points (an average shift near 0.012 points), which is hundreds of votes in most states. That is deliberately smaller than FairVote’s average of 0.03 points: the model is matched to FairVote’s average in votes (551) instead, because 551 votes at 0.03 points implies races of about 1.8 million votes, and most presidential battlegrounds cast two to four times that.',
      'House seats in a contingent election are drawn from the presidential result; a single-seat state follows it 85% of the time; delegations defect 10% of the time toward the state’s winner; lobbying a divided delegation works 35% of the time. The Senate is 50 plus a random draw.',
      'Money: you start with $300M and the other campaign with $270M to $330M; both raise about $26M a week, more when the forecast likes them, plus whatever the candidates’ fundraisers bring in. Only two parties are modeled; third parties and write-ins are left out.',
      'The other effect sizes are chosen to be consistent with the research directions cited above, not estimated from it.'
    ],
    fiction: [
      'The Lantern Party and the Compass Party, their tickets (Gov. Helen Varga and Rep. Tomas Rhee; Sen. Owen Castellan and Mayor Lena Whitcombe) and your staff (Ruth Amsel, Nadia Sorel, Teo Lindqvist).',
      'The pollsters (Harrow Research, Seawall Survey, Northfield Polling, Calder & Pike, Quarry Insights, Sextant Data), the Spotline ad tracker and the Tally Desk.',
      'Every event: the jobs report, the storm, the hot mic, the governor, the leak, the independent, the outlier, the crisis, the lawsuit, the registration drive, the town hall, the running mate’s week, the October story, the early vote.',
      'The political geography of every run. Which party holds which coalition is a coin flip, so neither party stands in for a real one.'
    ]
  };
  CASE.sources = (function () {
    var seen = {}, out = [];
    CASE.facts.concat(NOTES).forEach(function (f) { (f.src || []).forEach(function (s) { if (!seen[s.u]) { seen[s.u] = 1; out.push(s); } }); });
    return out;
  })();
  var TAKE = [
    'The college counts states: 538 electors, 270 to win, winner-take-all in 48 states and DC, by district in Maine and Nebraska.',
    'Only the tipping-point state’s margin decides it; the gap between that margin and the national one is the map’s bias, and its size and direction depend on where each coalition lives.',
    'A poll’s margin of error covers sampling luck only and roughly doubles on the lead; the error every poll shares is the one that hurts.',
    'Polling errors are correlated: similar states miss together, so a forecast that treats states as independent is overconfident.',
    'A 70 percent favorite loses three times in ten; judge forecasts by calibration, not by one night.',
    'Persuasion is scarce and fades within days; mobilization is slow to build and lasts to Election Day. Timing is strategy.',
    'Election-night leads reflect the order of counting, calls are projections, and recounts move hundreds of votes, not thousands.',
    'If no one reaches 270, the House decides by state delegation, one vote each, 26 to win.'
  ];

  /* ---------- the raised map: the same tiles in WebGL (/assets/3d, fetched on first use), each as tall as its electors ----------
     Lantern solid and Compass hatched, in the flat map's strengths; foil marks only 270, contests within 2 points, the selection and you. */
  var E3 = 0.06, LT = [0, .09, .18, .3, .45], CT = [0, .02, .05, .09, .15], CH = [0, .3, .5, .7, .9], RT = [0, .07, .16, .28, .42, .58];
  var FT = { S: [.84, .84], M: [.38, .62], N: [.25, .62] }, MAP3 = [], GEO = {}, ENG3 = null, Z3 = [0, 0, 0], PS = null;
  (function () {
    TILES.forEach(function (t) { MAP3[t.c] = { x: t.gx - 5.5, y: 0, z: t.gy - 3.5, f: 'S' }; });
    ['ME', 'NE'].forEach(function (p) {
      var b = MAP3[CONT[p]], ks = KIDS[p], n = ks.length, f = n === 2 ? 'M' : 'N', w = FT[f][0] + .04;
      ks.forEach(function (k, j) { MAP3[k] = { x: b.x + (j - (n - 1) / 2) * w, y: E3 * 2, z: b.z, f: f }; });
    });
  })();
  /* a unit-height column on fw x fd, its top tilted by s (the slosh). o: fc fa faces, ec ea ew ed (edges), tc tw (top edges), hatch, wire */
  function colGeom(fw, fd, o) {
    var g = { F: [], L: [], S: [], T: [], TF: [], bb: [1e30, 1e30, 1e30, -1e30, -1e30, -1e30] }, s = o.s || 0, l = Math.sqrt(s * s / (fw * fw) + 1);
    var x0 = -fw / 2, x1 = fw / 2, z0 = -fd / 2, z1 = fd / 2, ya = 1 - s / 2, yb = 1 + s / 2;
    var A = [x0, 0, z0], B = [x1, 0, z0], C = [x1, 0, z1], D = [x0, 0, z1], a = [x0, ya, z0], b = [x1, yb, z0], c = [x1, yb, z1], d = [x0, ya, z1];
    var px = [1, 0, 0], nx = [-1, 0, 0], ny = [0, -1, 0], pz = [0, 0, 1], nz = [0, 0, -1], up = [-s / fw / l, 1 / l, 0];
    function F(p, n) { g.F.push({ p: p[0].concat(p[1], p[2], p[3]), n: n, c: o.fc == null ? 4 : o.fc, a: o.fa == null ? 1 : o.fa, ds: false, t: null }); }
    function E(p, q, n1, n2, top) {
      var t = top && o.tc != null;
      if (o.wire) n1 = n2 = Z3;
      g.L.push(p[0], p[1], p[2], q[0], q[1], q[2], n1[0], n1[1], n1[2], n2[0], n2[1], n2[2], t ? o.tw : o.ew || 1, t ? o.tc : o.ec || 0, t ? 0 : o.ed || 0, 0, t ? 1 : o.ea == null ? 1 : o.ea);
    }
    if (o.faces !== false) { F([C, B, b, c], px); F([A, D, d, a], nx); F([d, c, b, a], up); F([A, B, C, D], ny); F([D, C, c, d], pz); F([B, A, a, b], nz); }
    E(d, c, up, pz, 1); E(c, b, up, px, 1); E(b, a, up, nz, 1); E(a, d, up, nx, 1);
    E(A, a, nx, nz); E(B, b, px, nz); E(C, c, px, pz); E(D, d, nx, pz);
    if (!o.wire) { E(D, C, ny, pz); E(C, B, ny, px); E(B, A, ny, nz); E(A, D, ny, nx); }
    if (o.hatch) for (var k = x0 + z0 + .055; k < x1 + z1; k += .11) {
      var xa = Math.max(x0, k - z1), xb = Math.min(x1, k - z0);
      if (xb - xa > .004) g.L.push(xa, 1 + s * xa / fw, k - xa, xb, 1 + s * xb / fw, k - xb, 0, 0, 0, 0, 0, 0, .75, 0, 0, 0, o.hatch);
    }
    return PS._finish(g);
  }
  /* looks: L1-4 solid, C1-4 hatched, R0-5 a lens ramp, B0 unprinted; t within 2 points, p the foil ring */
  function fillG(f, k, tos, tip, s) {
    var id = f + k + (tos ? 't' : '') + (tip ? 'p' : ''), ty = k.charAt(0);
    if (s == null && GEO[id]) return GEO[id];
    var g = colGeom(FT[f][0], FT[f][1], { fc: ty === 'B' ? 5 : 4, ec: tos ? 3 : ty === 'B' ? 1 : 0, ed: tos ? 3 : 0, ea: ty === 'B' ? .7 : tos ? .95 : .8,
      hatch: ty === 'C' ? CH[+k.charAt(1)] : 0, tc: tip ? 3 : null, tw: 1.75, s: s || 0 });
    if (s == null) GEO[id] = g;
    return g;
  }
  /* night outlines: polls open, counting, too close; near-invisible faces keep them tappable */
  function outG(kd, f) {
    var id = 'o' + kd + f;
    return GEO[id] || (GEO[id] = colGeom(FT[f][0], FT[f][1], kd === 'held' ? { fa: .001, wire: 1, ec: 3, ed: 4, ew: 1.25 } : { fa: .001, wire: 1, ec: 1, ea: kd === 'wait' ? .7 : .55, ed: kd === 'wait' ? 2 : 0 }));
  }
  function tintOf(k) { var t = k.charAt(0), b = +k.charAt(1); return t === 'L' ? LT[b] : t === 'C' ? CT[b] : t === 'R' ? RT[b] : 0; }
  function lookOf(cls) { var m = /ev-([LCAI])(\d)/.exec(cls); return m ? (m[1] === 'L' || m[1] === 'C' ? m[1] : 'R') + m[2] : 'B0'; }
  function reg3d(P) {
    if (P.getModel('ev-tiles')) return;
    function bar(id, w, d, o, pos, scl) { return { id: id, pick: false, geom: colGeom(w, d, o), pos: pos, scl: scl, visible: id === 'g0' }; }
    P.model('ev-tiles', { v: 1, title: 'The electoral map', camera: 'ortho', cam: { yaw: 12, pitch: 50 }, views: { iso: { yaw: 12, pitch: 50, zoom: 1 } },
      pitchRange: [18, 89], zoomRange: [.8, 3], margin: 1.05,
      build: function () {
        var out = [{ id: 'plinth', pick: false, layer: -1, mat: 'quiet', shapes: [{ box: [0, -.08, .5, 12.6, .08, 9.7] }] }];
        for (var c = 0; c < 56; c++) {
          var m = MAP3[c], h = E3 * EV56[c];
          out.push({ id: 'c' + c, name: CI[c].nm, pos: [m.x, m.y, m.z], children: [
            { id: 'o' + c, geom: outG('wait', m.f), scl: [1, h, 1], visible: false }, { id: 'f' + c, geom: fillG(m.f, 'B0'), scl: [1, h, 1] }] });
        }
        out.push(bar('g0', 1, .3, { faces: false, wire: 1, ec: 1, ea: .45 }, [0, 0, 4.75], [12, .1, 1]),
          bar('gy', 1, .24, { fc: 3, ec: 3 }, [-6, 0, 4.75], [.001, .12, 1]), bar('gt', 1, .24, { ea: .7 }, [6, 0, 4.75], [.001, .12, 1]),
          bar('g270', .03, .36, { fc: 0 }, [-6 + 12 * 270 / 538, 0, 4.75], [1, .42, 1]));
        return out;
      } });
  }
  function engine3() {
    if (window.PS3D && window.PS3D.v >= 1) return Promise.resolve(PS = window.PS3D);
    return ENG3 || (ENG3 = new Promise(function (res, rej) {
      var s = document.createElement('script'), t = setTimeout(function () { ENG3 = null; rej(new Error('the 3D engine timed out')); }, 15000);
      s.src = '/assets/3d/core.js?v=3'; s.async = true;
      s.onload = function () { clearTimeout(t); if ((PS = window.PS3D)) res(PS); else { ENG3 = null; rej(new Error('the 3D engine is missing')); } };
      s.onerror = function () { clearTimeout(t); ENG3 = null; rej(new Error('the 3D engine did not load')); };
      document.head.appendChild(s);
    }));
  }

  /* ---------- the machine ---------- */
  function init(root, ctx) {
    var store = ctx.store, saved = store.get() || {};
    var G = null, ui = { phase: 'setup', side: saved.lastSide === 'C' ? 'C' : 'L', scen: SCEN[saved.lastScen] ? saved.lastScen : 'E', era: saved.lastEra && (ERAS[saved.lastEra] || saved.lastEra === 'X') ? saved.lastEra : 'X',
      seed: newSeed(), mir: 1, lens: 'fc', sel: -1, tab: 0, plan: null, busy: false, auto: false, timer: 0, feedN: 0, polAll: false, pk: -1, indShown: false, restart: 0, visible: true, prompt: null, nsel: -1, post: null, v3: saved.v3 === 1, W: null };
    var esc = K.esc;
    var V3 = { fig: null, ex: null, boot: null, io: null, failed: false, R: [], mode: 'map', slot: [], sel: -1, hov: -1, cur: -1, tip: -1, proj: -1, lead: [],
      labs: [], xl: null, g: { y: 0, t: 0, on: false }, ph: '', g0: null, oq: 0, ta: false, seg: null };
    root.innerHTML = '<div class="ev-body"></div><div class="ev-foot"></div>';
    var body = root.querySelector('.ev-body');
    var shelf = K.shelf(root.querySelector('.ev-foot'), { slug: SLUG, notes: NOTES, caseFile: CASE, take: { items: TAKE, personal: personal } });
    K.glossary(root, DEFS);
    shelf.notes.unlock('electors', { where: 'Setup', announce: false });
    shelf.notes.unlock('m270', { where: 'Setup', announce: false });
    function newSeed() { return 1 + (K.seed() % 99999); }
    function RM() { return K.reducedMotion(); }

    /* ---------- words and numbers ---------- */
    /* a margin in your terms; under a twentieth of a point it keeps enough decimals to name the leader, and only a true zero is Even */
    function mTxt(v) {
      var a = Math.abs(v);
      if (!(a > 0)) return 'Even';
      return (v > 0 ? 'You +' : 'Them +') + (a >= 0.05 ? a.toFixed(1) : a >= 0.005 ? a.toFixed(2) : a >= 0.0005 ? a.toFixed(3) : '0.000');
    }
    function mS(v) { var a = Math.abs(v); if (!(a >= 0.05)) return '0.0'; return (v > 0 ? '+' : MINUS) + a.toFixed(1); }
    function money(v, d) { return Math.abs(v) < 0.005 ? '$0' : F.M(v, d); }
    function whenTxt(T) {
      if (T >= END_T) return 'only a week later, when the count was complete';
      if (T >= 36) return 'on ' + ({ 36: 'Wednesday at noon', 60: 'Thursday', 84: 'Friday', 108: 'Saturday', 132: 'Sunday', 156: 'Monday' })[T];
      return 'at ' + hr(T) + (T >= 24 ? ' on Wednesday' : '');
    }
    function lc1(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
    function PY() { return PARTY[G.side]; }
    function PT() { return PARTY[G.riv]; }
    function nm(c) { return CI[c].nm; }
    /* a contest's name as it reads mid-sentence: the District of Columbia takes its article */
    function sNm(c) { return CI[c].id === 'DC' ? 'the District of Columbia' : CI[c].nm; }
    /* the wire says a standing fact once, not every week */
    function once(key) { G.said = G.said || {}; if (G.said[key]) return false; G.said[key] = 1; return true; }
    function tipT(c) { return c >= NU ? G.fc.tip[c] + KIDS[CI[c].id].reduce(function (s, k) { return s + G.fc.tip[k]; }, 0) : G.fc.tip[c]; }
    function powT(c) {
      if (c < NU) return G.fc.power[c] + (U[c].par ? G.fc.power[CONT[U[c].par]] : 0);
      var ks = KIDS[CI[c].id], t = tipT(c), b = BASE56[c], st = 0, sv = 0, i;
      for (i = 0; i < 56; i++) st += G.fc.tip[i];
      for (i = 0; i < NU; i++) sv += U[i].base;
      return st > 0 ? (t / b) / (st / sv) : 0;
    }
    function powTxt(p) { return p < 0.05 ? '×0' : p < 10 ? '×' + p.toFixed(1) : '×' + Math.round(p); }
    function avgC(c) { if (c < NU) return G.avg[c].mean; var l = 0, b = 0; KIDS[CI[c].id].forEach(function (k) { l += U[k].base * G.avg[k].mean; b += U[k].base; }); return l / b; }
    function fmC(c) { if (c < NU) return G.fmean[c]; var l = 0, b = 0; KIDS[CI[c].id].forEach(function (k) { l += U[k].base * G.fmean[k]; b += U[k].base; }); return l / b; }
    function hr(T) {
      var h = Math.floor(T + 1e-6), m = Math.round((T - h) * 60), hh = h % 24, ap = hh >= 12 ? 'p.m.' : 'a.m.', h12 = hh % 12 || 12;
      return h12 + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
    }
    function clockTxt(T) {
      if (T >= END_T) return 'One week later';
      var days = { 36: 'Wednesday, noon', 60: 'Thursday', 84: 'Friday', 108: 'Saturday', 132: 'Sunday', 156: 'Monday' };
      if (days[T]) return days[T];
      return hr(T) + ' ET · ' + (T >= 24 ? 'Wednesday' : 'Tuesday');
    }
    function closeTxt(cl) { return hr(cl) + ' ET' + (cl >= 24 ? ' (after midnight)' : ''); }
    function chip(tag) {
      var cls = tag === 'YOU' ? ' lk-chip--foil' : tag === 'WIRE' || tag === 'DESK' ? ' lk-chip--safety' : '';
      return '<span class="lk-chip' + cls + '">' + esc(tag) + '</span>';
    }
    function say(tag, txt, extra) { if (G) G.feed.push({ tag: tag, txt: txt, x: extra || '' }); }
    function unlock(id, where) {
      var fresh = shelf.notes.unlock(id, { where: where, announce: false });
      if (!fresh) return false;
      var n = NOTES.filter(function (x) { return x.id === id; })[0];
      var rd = '<button type="button" class="ev-read" data-act="read" data-note="' + id + '">Read</button>';
      if (G && ui.phase === 'plan') { say('NOTE', 'New field note: ' + n.term + '.', rd); if (!ui.busy) renderFeed(); }
      else if (G && ui.phase === 'night' && G.nfeed) G.nfeed.push({ tag: 'NOTE', txt: 'New field note: ' + n.term + '.', x: rd });
      else K.say('New field note: ' + n.term + '.');
      return true;
    }
    function persist() {
      var s = store.get() || {};
      s.v = 1; s.lastSide = ui.side; s.lastScen = ui.scen; s.lastEra = ui.era; s.lastSeed = ui.seed;
      store.set(s);
    }
    function personal() {
      if (!G || !G.res) return null;
      var r = G.res;
      return 'My run: ' + PY().nm + ', starting ' + SCEN[G.scen].nm.toLowerCase() + ' on map #' + G.seed + ' (' + ERAS[G.era].nm.toLowerCase() + '): ' + r.evY + ' electors to ' + r.evT +
        (r.tipC >= 0 ? ', decided in ' + CI[r.tipC].nm + ' by ' + Math.abs(r.tipM).toFixed(2) + ' points' : '') + '. ' + G.ending.nm + '.';
    }

    /* ---------- tiles: one map, three looks (setup, campaign, the night desk) ---------- */
    function bin(a) { return a >= 10 ? 4 : a >= 5 ? 3 : a >= 2 ? 2 : 1; }
    function partyCls(mL) { var a = Math.abs(mL); return (mL >= 0 ? 'ev-L' : 'ev-C') + bin(a) + (a < 2 ? ' is-toss' : ''); }
    function rampCls(v, max, ink) { var k = v <= 0 ? 0 : Math.min(5, 1 + Math.floor(4.999 * Math.min(1, v / max))); return (ink ? 'ev-I' : 'ev-A') + k; }
    function tileHTML(t, cls, val, lab, extra) {
      return '<button type="button" class="ev-tile ' + cls + '" data-c="' + t.c + '" style="grid-column:' + (t.gx + 1) + ';grid-row:' + (t.gy + 1) + ';--d:' + (t.gx + t.gy) + '" tabindex="-1" aria-label="' + esc(lab) + '">' +
        '<span class="ev-chip"><span class="ev-id">' + t.id + '</span><span class="ev-ev"> ' + t.ev + '</span></span>' + (val != null ? '<span class="ev-lv lk-num">' + esc(val) + '</span>' : '') + (extra || '') + '</button>';
    }
    function distStrip(t, fn) {
      if (!t.kids) return '';
      return '<span class="ev-ds" aria-hidden="true">' + t.kids.map(function (k) { return '<i class="' + fn(k) + '"></i>'; }).join('') + '</span>';
    }
    function mapShell(inner, label, night) {
      return '<div class="ev-map' + (night ? ' ev-map--night' : '') + (v3On() && V3.ex ? ' ev-map--under' : '') + '" role="group" aria-label="' + esc(label) + '">' + inner + '</div>';
    }
    function lastMapHTML(W) {
      return TILES.map(function (t) {
        var m = W.lastU[t.c];
        return tileHTML(t, partyCls(m), null, t.nm + ', ' + t.ev + ' electors, last time ' + PARTY[m >= 0 ? 'L' : 'C'].sh + ' by ' + Math.abs(m).toFixed(1), distStrip(t, function (k) { return partyCls(W.lastU[k]); }));
      }).join('');
    }
    function legendHTML(tipNote) {
      return '<div class="ev-legend" aria-hidden="true"><span><i class="ev-L4"></i>Lantern</span><span><i class="ev-C4"></i>Compass</span><span class="ev-lg-s">A stronger fill means safer; a dashed edge means within 2 points.' +
        (tipNote ? ' The foil outline is the contest that crosses 270 on the average map.' : '') + '</span></div>';
    }
    /* the unprinted map: each tile toned by its electors, so the board already shows where the weight sits */
    function weightCls(n) { return n >= 20 ? 'ev-E4' : n >= 11 ? 'ev-E3' : n >= 6 ? 'ev-E2' : 'ev-E1'; }
    function blankLegendHTML() {
      return '<div class="ev-legend" aria-hidden="true"><span><i class="ev-E1"></i><i class="ev-E4 ev-lgx"></i>Unprinted</span><span class="ev-lg-s">A deeper tone means more electors. The parties print when the campaign starts.</span></div>';
    }

    /* ---------- the stage: an espresso desk under one light pool, with the map lying on it as a printed sheet ---------- */
    function sheetHTML(title, inner, seed, cls) {
      return '<div class="ev-sheet' + (cls ? ' ' + cls : '') + '"><p class="ev-sheet-h" aria-hidden="true"><span>' + esc(title) + '</span>' + (seed ? '<span class="lk-num">Map #' + seed + '</span>' : '') + '</p>' + inner +
        '<p class="ev-cart" aria-hidden="true"><span>The electoral college</span><span>538 electors, apportioned by the 2020 census</span></p></div>';
    }
    /* the split: Lantern fills from the left in blue, Compass from the right in red, and a post stands at 270 */
    function splitHTML(l, c, cap, you, big) {
      var on = l != null;
      function fig(k, n) {
        return '<p class="ev-sp-f ev-sp-f--' + k + '"><span class="ev-sp-n stat lk-num">' + (on ? n : '') + '</span><span class="ev-sp-k">' + PARTY[k].sh + (you === k ? '<span class="ev-sp-you"> · you</span>' : '') + '</span></p>';
      }
      return '<div class="ev-split' + (on ? '' : ' is-blank') + (big ? ' ev-split--big' : '') + '">' + fig('L', l) + fig('C', c) +
        (big ? '<p class="ev-sp-t"><span class="stat foil ev-270">270</span><span class="ev-270a">To win</span></p>' : '') +
        '<div class="ev-sp-bar" aria-hidden="true"><i class="ev-sp-L" style="--w:' + (on ? (l / 538).toFixed(4) : 0) + '"></i><i class="ev-sp-C" style="--w:' + (on ? (c / 538).toFixed(4) : 0) + '"></i><b class="ev-sp-post"><span>270</span></b></div>' +
        (cap ? '<p class="ev-sp-cap">' + esc(cap) + '</p>' : '') + '</div>';
    }
    /* the same split, moved in place, so its bars can travel when the count changes */
    function splitSet(el, l, c) {
      if (!el) return;
      var nL = el.querySelector('.ev-sp-f--L .ev-sp-n'), nC = el.querySelector('.ev-sp-f--C .ev-sp-n');
      if (nL) nL.textContent = String(l);
      if (nC) nC.textContent = String(c);
      el.querySelector('.ev-sp-L').style.setProperty('--w', (l / 538).toFixed(4));
      el.querySelector('.ev-sp-C').style.setProperty('--w', (c / 538).toFixed(4));
      el.classList.remove('is-blank');
    }
    /* electors by party from you-and-them counts */
    function ledRow(k, v, sub) { return '<li><span class="ledger-k">' + k + (sub ? '<small>' + sub + '</small>' : '') + '</span><span class="ledger-n">' + v + '</span></li>'; }
    var LENS_NM = { fc: 'Forecast', tip: 'Tipping odds', pow: 'Voter power', plan: 'Your plan', twin: 'Error twins' };
    function byParty(you, them) { return G.side === 'L' ? { L: you, C: them } : { L: them, C: you }; }
    function foil() { try { if (window.PS && typeof window.PS.foil === 'function') window.PS.foil(root); } catch (e) {} }
    /* roving focus over the grid: arrows move to the nearest tile that way */
    function mapKeys(ev, btn) {
      var k = ev.key, dx = k === 'ArrowRight' ? 1 : k === 'ArrowLeft' ? -1 : 0, dy = k === 'ArrowDown' ? 1 : k === 'ArrowUp' ? -1 : 0;
      if (!dx && !dy) return;
      ev.preventDefault();
      var map = btn.closest('.ev-map'), me = TILES.filter(function (t) { return t.c === +btn.getAttribute('data-c'); })[0], best = null, bs = 1e9;
      TILES.forEach(function (t) {
        var ddx = t.gx - me.gx, ddy = t.gy - me.gy, p = dx ? ddx * dx : ddy * dy, s = dx ? Math.abs(ddy) : Math.abs(ddx);
        if (p <= 0) return;
        var sc = p + 2.2 * s;
        if (sc < bs) { bs = sc; best = t; }
      });
      if (!best) return;
      var nb = map.querySelector('.ev-tile[data-c="' + best.c + '"]');
      if (nb) { btn.setAttribute('tabindex', '-1'); nb.setAttribute('tabindex', '0'); nb.focus(); }
    }
    function roving(map, c) {
      var tiles = map.querySelectorAll('.ev-tile'), on = null;
      Array.prototype.forEach.call(tiles, function (b) { if (+b.getAttribute('data-c') === c) on = b; });
      on = on || tiles[0];
      if (on) on.setAttribute('tabindex', '0');
    }

    /* ---------- the raised map; the grid stays the default and the keyboard's way in ---------- */
    function v3On() { return ui.v3 && !V3.failed; }
    function v3Seg() {
      var on = v3On();
      return '<div class="lk-seg ev-v3seg" aria-label="Map view"><button data-v="2d"' + (on ? '' : ' aria-checked="true"') + '>Flat</button><button data-v="3d"' +
        (on ? ' aria-checked="true"' : '') + (V3.failed ? ' disabled' : '') + '>3D</button></div>';
    }
    function v3Wire() {
      var s = body.querySelector('.ev-v3seg');
      if (s) K.seg(s, function (v) { ui.v3 = v === '3d'; var sv = store.get() || {}; sv.v3 = ui.v3 ? 1 : 0; store.set(sv); v3Place(true); });
      v3Place(false);
    }
    function v3Under(on) { var m = body.querySelector('.ev-map'); if (m) m.classList.toggle('ev-map--under', !!on); }
    function v3Dirty() { if (V3.ex) V3.ex.vw.invalidate(); }
    function v3Place(user) {
      var slot = body.querySelector('.ev-3dslot'), f = V3.fig;
      if (!v3On() || !slot) { if (f && f.parentNode) f.parentNode.removeChild(f); v3Under(false); return; }
      f = v3Fig();
      if (f.parentNode !== slot) { slot.appendChild(f); if (V3.ex) { V3.ex.vw._th = V3.ex.vw._pal = null; V3.ex.vw.resize(); v3Frame(false); } }
      if (!V3.ex) v3Poster(f.querySelector('.iso-stage'));
      v3Bar();
      if (!V3.ex) { v3Under(false); v3Boot(user); return; }
      v3Under(true);
      v3Paint(user ? 'rise' : '');
    }
    function v3Fig() {
      if (V3.fig) return V3.fig;
      var f = document.createElement('figure'), id = 'evD3-' + ctx.num;
      f.className = 'iso ev-3d lk-scene';
      f.innerHTML = '<div class="iso-stage" tabindex="0" role="group" aria-roledescription="3D model" aria-label="The electoral map, each state as tall as its electors" aria-describedby="' + id + '">' +
        '<p class="ev-3dwait vh">Raising the map.</p><div class="ev-3dlab" aria-hidden="true"></div></div>' +
        '<figcaption><p class="ev-3dcap" id="' + id + '"></p><div class="ev-3dbar"><div class="lk-seg ev-v3mode" aria-label="Arrange the tiles"><button data-v="map" aria-checked="true">Map</button><button data-v="snake">Snake</button></div>' +
        '<button type="button" class="ps-cap ev-v3reset">Reset view</button><span class="ev-3dhint">Drag to turn. Select a state to read it.</span></div><p class="iso-live vh"></p></figcaption>';
      V3.seg = K.seg(f.querySelector('.ev-v3mode'), function (v) { V3.mode = v; v3Bar(); v3Arr(true); v3Paint(''); });
      K.on(f, 'click', '.ev-v3reset', function () { if (V3.ex) V3.ex.orbit.reset(); });
      return (V3.fig = f);
    }
    /* the plinth and every tile's footprint, flat, seen from the camera the GL view opens on (yaw 12, pitch 50) and framed to
       the same points, so the map lies printed on its plinth until the columns rise out of it */
    function v3Poster(st) {
      if (!st || st.querySelector('.ps3d-poster')) return;
      var w = st.clientWidth || 640, h = st.clientHeight || 420, asp = w / h, ya = 12 * Math.PI / 180, pa = 50 * Math.PI / 180;
      var cy = Math.cos(ya), sy = Math.sin(ya), cp = Math.cos(pa), sp = Math.sin(pa), x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, pts = [], c, svg;
      function X(q) { return q[0] * cy - q[2] * sy; }
      function Y(q) { return -sp * sy * q[0] + cp * q[1] - sp * cy * q[2]; }
      function pt(q) { return X(q).toFixed(3) + ',' + (-Y(q)).toFixed(3); }
      function poly(qs, cls) { return '<polygon class="' + cls + '" points="' + qs.map(pt).join(' ') + '"/>'; }
      [-6.3, 6.3].forEach(function (x) { [-4.35, 5.35].forEach(function (z) { pts.push([x, -.08, z], [x, .2, z]); }); });
      for (c = 0; c < 56; c++) pts.push([MAP3[c].x, MAP3[c].y + E3 * EV56[c], MAP3[c].z]);
      pts.forEach(function (q) { var a = X(q), b = Y(q); if (a < x0) x0 = a; if (a > x1) x1 = a; if (b < y0) y0 = b; if (b > y1) y1 = b; });
      var hh = Math.max((y1 - y0) / 2, (x1 - x0) / 2 / asp) * 1.05, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      svg = poly([[-6.3, -.08, 5.35], [6.3, -.08, 5.35], [6.3, 0, 5.35], [-6.3, 0, 5.35]], 'p-right') + poly([[6.3, -.08, 5.35], [6.3, -.08, -4.35], [6.3, 0, -4.35], [6.3, 0, 5.35]], 'p-left') +
        poly([[-6.3, 0, -4.35], [6.3, 0, -4.35], [6.3, 0, 5.35], [-6.3, 0, 5.35]], 'p-plaster');
      for (c = 0; c < 56; c++) {
        var m = MAP3[c], ft = FT[m.f], hw = ft[0] / 2, hd = ft[1] / 2;
        svg += poly([[m.x - hw, m.y, m.z - hd], [m.x + hw, m.y, m.z - hd], [m.x + hw, m.y, m.z + hd], [m.x - hw, m.y, m.z + hd]], 'p-top ev-pfoot');
      }
      st.insertAdjacentHTML('afterbegin', '<svg class="ps3d-poster ev-3dposter" data-reg="0" viewBox="' + [mx - hh * asp, -(my + hh), 2 * hh * asp, 2 * hh].map(function (v) { return v.toFixed(3); }).join(' ') +
        '" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' + svg + '</svg>');
    }
    function v3Bar() {
      var f = V3.fig, ph = ui.phase, blank = ph === 'setup' && (ui.era === 'X' || !ui.W), can = ph === 'plan' || (ph === 'setup' && !blank);
      if (!can && V3.mode !== 'map') { V3.mode = 'map'; if (V3.seg) V3.seg.set('map'); v3Arr(false); }
      f.querySelector('.ev-v3mode').hidden = !can;
      f.querySelector('.ev-3dcap').textContent = blank ? 'Each state stands as tall as its electors: 54 for California, 3 for Wyoming. The parties print when the campaign starts.' :
        ph === 'setup' ? (V3.mode === 'snake' ? 'Last time’s results in a line, from your party’s safest contest to its weakest, each as tall as its electors.' : 'Last time on this map, each state as tall as its electors: solid for Lantern, hatched for Compass. The bar in front adds up each side.') :
        ph === 'night' ? 'Tiles fill as each state counts, solid for Lantern and hatched for Compass. When mail and same-day votes disagree, the lead flips and the fill sloshes. The bar in front counts called electors; foil is you.' :
        V3.mode === 'snake' ? 'Every contest in a line, from your safest to theirs, each as tall as its electors. The foil tile is where the line crosses 270.' :
        'Each state stands as tall as its electors, and the fill follows the lens. Foil marks the contest that crosses 270; the bar in front counts electors on the average map.';
    }
    function v3Boot(user) {
      if (V3.boot) return;
      var f = V3.fig;
      function go() {
        if (V3.io) { V3.io.disconnect(); V3.io = null; }
        if (V3.boot) return;
        V3.boot = engine3().then(function (P) {
          reg3d(P);
          return P.mount(f, 'ev-tiles', { list: false, controls: false, steps: false, pins: false, flows: false });
        }).then(function (ex) {
          if (!ex || !ex.vw || !ex.orbit || !ex.parts || !ex.parts.f0) throw new Error('the 3D map did not mount');
          v3Ready(ex);
        }).then(null, function (e) {
          V3.failed = true;
          try { console.warn('[lab:electoral]', e); } catch (x) {}
          if (f.parentNode) f.parentNode.removeChild(f);
          v3Under(false);
          var sg = body.querySelector('.ev-v3seg');
          if (sg) { sg.outerHTML = v3Seg(); v3Wire(); }
          K.say('The 3D map did not load, so the flat map stays.');
        });
      }
      if (user || !('IntersectionObserver' in window)) { go(); return; }
      if (V3.io) return;
      V3.io = new IntersectionObserver(function (es) { if (es[es.length - 1].isIntersecting) go(); }, { rootMargin: '600px 0px' });
      V3.io.observe(f);
    }
    function v3Rec(c, ex) {
      var n = ex.parts['c' + c], h = E3 * EV56[c];
      var r = { c: c, node: n, fill: ex.parts['f' + c], out: ex.parts['o' + c], H: h, f: h, fT: h, t: 1, from: n.pos.slice(), to: n.pos.slice(), hop: 0, k: 'B0', ok: '', lk: 'B0', tint: 0, tT: 0, sH: 0, hH: 0, fl: 0 };
      n.anchor = [0, h, 0];
      r.sp = PS.spring({ k: 120, c: 18, x: h, eps: .0004, onUpdate: function (x) { r.f = Math.max(0, x); ap(r); v3Dirty(); } });
      r.ts = PS.spring({ k: 140, c: 22, x: 1, eps: .0005, onUpdate: function (x) { r.t = x; ap(r); v3Dirty(); } });
      return r;
    }
    function v3Lab(host, txt, cls, c) {
      var s = document.createElement('span');
      s.className = 'ev-3dl' + cls; s.textContent = txt; s.style.display = 'none'; host.appendChild(s);
      return { el: s, c: c, on: false, q: null, kid: c >= 0 && c < NU && !!U[c].par };
    }
    function v3Ready(ex) {
      var vw = ex.vw, lab = V3.fig.querySelector('.ev-3dlab'), c, first = true;
      V3.ex = ex;
      for (c = 0; c < 56; c++) V3.R[c] = v3Rec(c, ex);
      ex.parts.gt.tint = .45;
      /* taps and keys select through the machine, and nothing dims: a map is read whole */
      ex.select = function (id) { v3Pick(id == null ? -1 : v3C(id), 1); return ex; };
      ex._tap = function (x, y) { var k = v3Hit(x, y); if (k >= 0) v3Pick(k); };
      ex._hover = function (x, y) { var k = v3Hit(x, y); ex.stage.style.cursor = k >= 0 ? 'pointer' : ''; v3Hov(k); };
      ex.stage.addEventListener('pointerleave', function () { v3Hov(-1); });
      v3Frame(false);
      V3.labs = [];
      for (c = 0; c < 56; c++) V3.labs.push(v3Lab(lab, CI[c].id, '', c));
      V3.xl = { tip: v3Lab(lab, '', ' ev-3dl--k ev-3dl--tip', -1), y: v3Lab(lab, '', ' ev-3dl--k ev-3dl--l', -1), t: v3Lab(lab, '', ' ev-3dl--k ev-3dl--r', -1), m: v3Lab(lab, '270', ' ev-3dl--k', -1),
        s0: v3Lab(lab, 'Your safest', ' ev-3dl--k', -1), s1: v3Lab(lab, 'Theirs', ' ev-3dl--k', -1) };
      vw.on('frame', function () {
        if (first) { first = false; var w = V3.fig.querySelector('.ev-3dwait'); if (w) w.parentNode.removeChild(w); }
        v3Labels();
      });
      v3Under(v3On() && V3.fig.isConnected);
      v3Paint('rise');
    }
    function v3C(id) { var m = /^[cfo](\d+)$/.exec(String(id == null ? '' : id)); return m ? +m[1] : -1; }
    function v3Hit(x, y) { var h = V3.ex.vw.pick(x, y); return h ? v3C(h.part) : -1; }
    function v3Top(r) { return Math.max(r.f, r.out.visible ? r.H : 0); }
    function ap(r) {
      var t = r.t, a = r.from, b = r.to, n = r.node, h = r.hop && t > 0 && t < 1 ? Math.sin(Math.PI * t) * r.hop : 0;
      n.pos[0] = a[0] + (b[0] - a[0]) * t; n.pos[1] = Math.max(0, a[1] + (b[1] - a[1]) * t) + h; n.pos[2] = a[2] + (b[2] - a[2]) * t;
      r.fill.scl[1] = Math.max(r.f, 1e-4); r.fill.visible = r.f > .002;
      r.fill.hl = Math.max(r.sH, r.hH, r.fl); r.fill.tint = r.tint;
      n.anchor[1] = v3Top(r);
    }
    /* the map, or the snake in rows of eight from your safest contest to theirs */
    function v3Ord() {
      if (ui.phase === 'plan') return snakeOrder();
      var o = [], sy = ui.side === 'L' ? 1 : -1, W = ui.W;
      for (var c = 0; c < 56; c++) o.push(c);
      return o.sort(function (a, b) { return sy * W.lastU[b] - sy * W.lastU[a] || a - b; });
    }
    function v3Arr(anim) {
      if (!V3.ex) return;
      var sn = V3.mode === 'snake', moved = false, c;
      if (sn) (V3.ord = v3Ord()).forEach(function (k, j) { var row = Math.floor(j / 8), col = row % 2 ? 7 - j % 8 : j % 8; V3.slot[k] = [(col - 3.5) * 1.42, 0, (row - 3) * 1.18, j]; });
      for (c = 0; c < 56; c++) {
        var r = V3.R[c], m = MAP3[c], to = sn ? V3.slot[c] : [m.x, m.y, m.z];
        if (to[0] === r.to[0] && to[1] === r.to[1] && to[2] === r.to[2]) continue;
        r.from = r.node.pos.slice(); r.to = to; r.hop = .8; moved = true;
        if (!anim || PS.reduced()) { r.ts.snap(1); continue; }
        r.ts.snap(0);
        v3Later(8 * (V3.slot[c] ? V3.slot[c][3] : 0), r.ts, 1);
      }
      if (moved) v3Frame(anim);
    }
    function v3Frame(anim) {
      var ex = V3.ex, vw = ex.vw, cam = vw.camera, pts = [], o, c;
      [-6.3, 6.3].forEach(function (x) { [-4.35, 5.35].forEach(function (z) { pts.push([x, -.08, z], [x, .2, z]); }); });
      for (c = 0; c < 56; c++) pts.push([V3.R[c].to[0], V3.R[c].to[1] + V3.R[c].H, V3.R[c].to[2]]);
      ex._fp = pts;
      o = vw.frameCalc(pts, ex.def.margin, ex.home.yaw, ex.home.pitch);
      if (!o) return;
      if (!anim || PS.reduced()) { ex._frame(); return; }
      PS.tween({ from: cam.target.concat(cam.radius, cam.span), to: o.target.concat(o.radius, o.span), dur: 900, ease: 'io',
        update: function (a) { cam.target = a.slice(0, 3); cam.radius = a[3]; cam.span = a[4]; vw.invalidate(); } });
    }
    function v3Later(ms, sp, to) { PS.tween({ dur: 0, delay: ms, done: function () { sp.set(typeof to === 'function' ? to() : to); } }); }
    function v3H(r, to, delay) {
      if (to === r.fT && !delay) return;
      r.fT = to;
      if (delay > 0) v3Later(delay, r.sp, function () { return r.fT; }); else r.sp.set(to);
    }
    function v3Tint() {
      if (PS.reduced()) { V3.R.forEach(function (r) { r.tint = r.tT; ap(r); }); v3Dirty(); return; }
      if (V3.ta) return;
      V3.ta = true;
      PS._anim({ step: function (dt) {
        var k = 1 - Math.exp(-dt / .1), more = false;
        V3.R.forEach(function (r) { var dd = r.tT - r.tint; if (Math.abs(dd) > .002) { r.tint += dd * k; more = true; } else r.tint = r.tT; ap(r); });
        v3Dirty();
        if (!more) V3.ta = false;
        return more;
      } });
    }
    /* the bar in front: yours in foil from the left, theirs from the right, a post at 270 */
    function v3G(k, v) {
      var g = V3.g;
      if (!g['s' + k]) g['s' + k] = PS.spring({ k: 120, c: 20, x: 0, eps: .02, onUpdate: function (x) { g[k] = x; gAp(); v3Dirty(); } });
      g['s' + k].set(v);
      gAp();
    }
    function gAp() {
      var p = V3.ex.parts, g = V3.g, wy = 12 * g.y / 538, wt = 12 * g.t / 538;
      p.gy.pos[0] = -6 + wy / 2; p.gy.scl[0] = Math.max(wy, .001); p.gy.visible = g.on && wy > .01;
      p.gt.pos[0] = 6 - wt / 2; p.gt.scl[0] = Math.max(wt, .001); p.gt.visible = g.on && wt > .01;
      p.g0.visible = p.g270.visible = g.on;
    }
    function v3Flash(r, delay) {
      if (PS.reduced()) return;
      if (r.fx) r.fx();
      r.fx = PS.tween({ from: 0, to: 1, dur: 900, delay: delay || 0, ease: function (k) { return k; },
        update: function (k) { r.fl = k < .3 ? 2.2 * k / .3 : 2.2 * (1 - (k - .3) / .7); ap(r); v3Dirty(); }, done: function () { r.fl = 0; r.fx = null; ap(r); v3Dirty(); } });
    }
    /* the mirage: a count whose lead flips sloshes once, a damped tilt of its top */
    function v3Slosh(r, dir) {
      if (PS.reduced()) return;
      r.slo = { t: 0, d: dir };
      if (r.sla) return;
      r.sla = true;
      PS._anim({ step: function (dt) {
        var s = r.slo, end = !s || s.t > 1.2, f = MAP3[r.c].f;
        if (end) { r.slo = null; r.sla = false; r.pv = null; r.fill.setGeom(fillG(f, r.lk, r.tos, r.tp)); v3Dirty(); return false; }
        s.t += dt;
        var g = r.pv, g2 = fillG(f, r.lk, r.tos, r.tp, .6 * s.d * Math.exp(-s.t / .35) * Math.sin(2 * Math.PI * s.t / .6));
        if (g && r.fill.geom === g && g.L.length === g2.L.length && g.T.length === g2.T.length) { g.F = g2.F; g.T = g2.T; g.TF = g2.TF; g.L = g2.L; g.bb = g2.bb; r.fill.touch(); }
        else { r.pv = g2; r.fill.setGeom(g2); }
        v3Dirty();
        return true;
      } });
    }
    function v3Proj() {
      var N = G.night, s, acc = 0, k = -1;
      if (!N.proj) return -1;
      if (V3.proj >= 0) return V3.proj;
      s = N.proj === 'you' ? G.sy : -G.sy;
      N.calls.forEach(function (cl) { if (k < 0 && cl.s === s) { acc += EV56[cl.c]; if (acc >= 270) k = cl.c; } });
      return (V3.proj = k);
    }
    function v3Paint(how) {
      var ex = V3.ex;
      if (!ex || !V3.fig.isConnected) return;
      var ph = ui.phase, W = ui.W, rise = how === 'rise' && !PS.reduced(), blank = ph === 'setup' && (ui.era === 'X' || !W);
      var N = ph === 'night' ? G.night : null, sy = ph === 'setup' ? (ui.side === 'L' ? 1 : -1) : G.sy, you = 0, them = 0, tip = -1, cur = -1, ev, c;
      if (V3.ph !== ph || V3.g0 !== G) { V3.ph = ph; V3.g0 = G; V3.lead = []; V3.proj = -1; v3Hov(-1); }
      if (ph === 'plan') { tip = ui.lens === 'tip' ? G.fc.tipC : G.fc.tipAvgC; cur = ui.sel; }
      else if (N) { cur = ui.nsel < 0 ? G.fc.tipC : ui.nsel; tip = v3Proj(); ev = calledEV(G); you = ev.you; them = ev.them; }
      else cur = V3.sel;
      V3.cur = cur;
      if (V3.mode === 'snake') v3Arr(!rise);
      for (c = 0; c < 56; c++) {
        var r = V3.R[c], kid = c < NU && !!U[c].par, cls = 'ev-blank', f = 1, out = '', m;
        if (ph === 'setup') { if (!blank) { m = W.lastU[c]; cls = partyCls(m); if (sy * m > 0) you += EV56[c]; else them += EV56[c]; } }
        else if (ph === 'plan') {
          cls = !kid ? tileCls(c) : ui.lens === 'fc' ? partyCls(G.fmean[c]) : ui.lens === 'tip' ? rampCls(G.fc.tipU[c], 0.2) : ui.lens === 'plan' ? rampCls(planSpend(c), 40) : 'ev-I0';
          if (sy * fmC(c) > 0) you += EV56[c]; else them += EV56[c];
        } else {
          var d = N.c[c], o = counted(d, N.T), n2 = o.L + o.C, sg = o.L > o.C ? 1 : o.L < o.C ? -1 : 0;
          if (N.T < d.cl) { out = 'wait'; f = 0; cls = 'ev-I0'; }
          else if (d.called) cls = partyCls(d.fin);
          else {
            cls = n2 > 0 ? partyCls((o.L - o.C) / n2 * 100) : 'ev-I0'; f = n2 / d.tot; out = N.done ? 'held' : 'count';
            if (!rise && sg && V3.lead[c] && sg !== V3.lead[c]) v3Slosh(r, sg);
          }
          V3.lead[c] = d.called ? 0 : sg;
          cls = cls.replace(' is-toss', '');
        }
        var lk = lookOf(cls), tos = / is-toss/.test(cls), tp = c === tip || / is-anchor/.test(cls), key = lk + (tos ? 't' : '') + (tp ? 'p' : '');
        r.lk = lk; r.tos = tos; r.tp = tp; r.tT = tintOf(lk); r.sH = c === cur ? 1 : 0;
        if (key !== r.k) { r.k = key; if (!r.slo) r.fill.setGeom(fillG(MAP3[c].f, lk, tos, tp)); }
        if (out !== r.ok) { r.ok = out; r.out.visible = !!out; if (out) r.out.setGeom(outG(out, MAP3[c].f)); }
        if (rise) { r.sp.snap(0); v3H(r, f * r.H, 60 + 24 * (MAP3[c].x + MAP3[c].z + 9)); } else v3H(r, f * r.H, 0);
        ap(r);
      }
      V3.g.on = !blank;
      v3G('y', you); v3G('t', them);
      V3.xl.y.el.textContent = 'You ' + you; V3.xl.t.el.textContent = 'Them ' + them;
      V3.xl.tip.el.textContent = ph === 'night' ? 'Crossed 270' : ui.lens === 'tip' ? 'Tips most often' : 'Crosses 270';
      if (tip !== V3.tip || rise) { V3.tip = tip; if (tip >= 0) v3Flash(V3.R[tip], rise ? 900 : 0); }
      V3.labs.forEach(function (L) { L.el.classList.toggle('is-sel', L.c === cur); });
      v3Tint(); v3Card(); v3Dirty();
    }
    /* state codes ride the tiles; one behind a taller tile fades once the view rests */
    function v3Labels() {
      var vw = V3.ex.vw, sm = vw.w < 520, sn = V3.mode === 'snake', xl = V3.xl, tr;
      function put(L, p, on) {
        if (!on) { if (L.on) { L.el.style.display = 'none'; L.on = false; } return; }
        var q = vw.project(p);
        if (!L.on) { L.el.style.display = ''; L.on = true; }
        L.el.style.transform = 'translate(' + q[0].toFixed(1) + 'px,' + q[1].toFixed(1) + 'px)';
        L.q = q;
      }
      V3.labs.forEach(function (L) {
        var r = V3.R[L.c], n = r.node;
        put(L, [n.pos[0], n.pos[1] + v3Top(r), n.pos[2]], (!L.kid || sn) && (!sm || EV56[L.c] >= 10 || L.c === V3.cur));
      });
      tr = V3.tip >= 0 ? V3.R[V3.tip] : null;
      put(xl.tip, tr ? [tr.node.pos[0], tr.node.pos[1] + v3Top(tr) + .34, tr.node.pos[2]] : null, !!tr && !sm);
      [xl.s0, xl.s1].forEach(function (L, i) { var e = sn && V3.ord ? V3.R[V3.ord[i ? 55 : 0]] : null; put(L, e ? [e.node.pos[0], e.node.pos[1] + v3Top(e) + .36, e.node.pos[2]] : null, !!e); });
      put(xl.y, [-6, .2, 4.75], V3.g.on); put(xl.t, [6, .2, 4.75], V3.g.on); put(xl.m, [-6 + 12 * 270 / 538, .5, 4.75], V3.g.on);
      clearTimeout(V3.oq);
      V3.oq = setTimeout(v3Occ, 180);
    }
    function v3Occ() {
      if (!V3.ex || !V3.fig.isConnected) return;
      V3.labs.forEach(function (L) {
        if (!L.on || !L.q) return;
        var h = V3.ex.vw.pick(L.q[0], L.q[1] + 2), k = h ? v3C(h.part) : -1;
        L.el.classList.toggle('is-occ', !!(h && k !== L.c && h.t < (L.q[2] + 1) / 2 - 1e-4));
      });
    }
    function v3Txt(c) {
      var n = EV56[c], evs = n + (n === 1 ? ' elector' : ' electors'), ph = ui.phase, W = ui.W, fig, why, m, L;
      if (ph === 'setup') {
        if (ui.era === 'X' || !W) { fig = evs; why = 'The parties print when the campaign starts.'; }
        else { m = W.lastU[c]; fig = PARTY[m >= 0 ? 'L' : 'C'].sh + ' +' + Math.abs(m).toFixed(1); why = evs + '. The result last time on this map.'; }
      } else if (ph === 'plan') {
        L = ui.lens;
        var a = twinBase(), k = c >= NU ? tipUnitOf(c) : c;
        fig = L === 'tip' ? Math.round(tipT(c) * 100) + '% tipping odds' : L === 'pow' ? powTxt(powT(c)) + ' voter power' : L === 'plan' ? (planSpend(c) > 0 ? money(planSpend(c)) + ' this week' : 'Nothing planned') :
          L === 'twin' ? (k === a ? 'The state compared' : rho(a, k).toFixed(2) + ' with ' + U[a].nm) : mTxt(G.sy * fmC(c));
        why = evs + (L === 'fc' ? '' : ' · average ' + mTxt(G.sy * fmC(c))) + (L === 'tip' ? '' : ' · tipping ' + Math.round(tipT(c) * 100) + '%');
      } else {
        var N = G.night, d = N.c[c], o = counted(d, N.T), n2 = o.L + o.C;
        fig = N.T < d.cl ? 'Polls close ' + hr(d.cl) : d.called ? 'Called for ' + (d.called === G.sy ? 'you' : 'them') : N.done ? 'Too close to call' : Math.round(n2 / d.tot * 100) + '% counted';
        why = evs + (n2 > 0 ? ' · ' + mTxt(G.sy * (o.L - o.C) / n2 * 100) + ' so far' : '');
      }
      return { name: CI[c].nm, fig: fig, why: why };
    }
    function v3Card() {
      var ex = V3.ex, c = V3.hov, n = c >= 0 ? V3.R[c].node : null, t;
      ex.sel = V3.cur >= 0 ? 'c' + V3.cur : null;
      if (!n || ex.vw.w < 600) { ex._card(null); return; }
      t = v3Txt(c); n.name = t.name; n.fig = t.fig; n.why = t.why;
      ex._card(n);
    }
    function v3Hov(c) {
      if (!V3.ex || c === V3.hov) return;
      if (V3.hov >= 0) { V3.R[V3.hov].hH = 0; ap(V3.R[V3.hov]); }
      V3.hov = c;
      if (c >= 0) { V3.R[c].hH = .55; ap(V3.R[c]); }
      v3Card(); v3Dirty();
    }
    function v3Pick(c, key) {
      var ph = ui.phase, t;
      if (ph === 'plan') {
        if (c >= 0) { select(c); renderFeed(); return; }
        if (!key || ui.sel < 0) return;
        ui.sel = -1; renderMap(); renderSel(); paintSnake();
        if (ui.tab === 3 || ui.tab === 1) renderPanel(ui.tab);
      } else if (ph === 'night') {
        if (c < 0) return;
        ui.nsel = c; renderNightParts();
        t = v3Txt(c); K.say(t.name + '. ' + t.fig + '. ' + t.why + '.');
      } else if (ph === 'setup') {
        V3.sel = c < 0 || V3.sel === c ? -1 : c;
        v3Paint('');
        if (V3.sel >= 0) { t = v3Txt(c); K.say(t.name + '. ' + t.fig + '. ' + t.why); }
      }
    }

    /* ---------- setup ---------- */
    function preview() { try { return genWorld({ seed: ui.seed, era: ui.era === 'X' ? 'DD' : ui.era, scen: ui.scen, side: ui.side, mir: ui.mir }); } catch (e) { return null; } }
    function eraCopy(W) {
      var own = W.coal > 0 ? 'L' : 'C', oth = own === 'L' ? 'C' : 'L';
      if (W.era === 'DD') return 'In this America the parties sort by where people live and how long they stayed in school. ' + cap(PARTY[own].nm) + ' holds the dense, degree-heavy places; ' + PARTY[oth].nm + ' holds the rest.';
      if (W.era === 'RG') return 'In this America the map is regional. Neighbors vote alike, and a state’s party is mostly a matter of which part of the country it sits in.';
      if (W.era === 'CL') return 'In this America density and diplomas point in opposite directions. ' + cap(PARTY[own].nm) + ' runs strong in dense places with fewer degrees; ' + PARTY[oth].nm + ' in less dense places with more.';
      return 'In this America the coalitions do not line up with anything tidy. Every state is its own argument.';
    }
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    function renderSetup() {
      ui.phase = 'setup'; stopAuto();
      var W = preview(), hs = W ? { L: U[W.homeL].nm, C: U[W.homeC].nm } : { L: '', C: '' };
      ui.W = W;
      function ticket(k) {
        var P = PARTY[k];
        return '<button type="button" class="lk-opt ev-ticket" data-act="side" data-k="' + k + '" aria-pressed="' + (ui.side === k) + '">' +
          '<span class="ev-sw ev-sw--' + k + '" aria-hidden="true"></span><span class="lk-opt-l">' + cap(P.nm) + '</span>' +
          '<span class="lk-opt-s">' + P.cand + ', with ' + P.vp + ' · Home state: ' + esc(hs[k]) + '</span></button>';
      }
      var segS = Object.keys(SCEN).map(function (k) { return '<button data-v="' + k + '"' + (ui.scen === k ? ' aria-checked="true"' : '') + '>' + SCEN[k].nm + '</button>'; }).join('');
      var eras = [['X', 'Surprise me']].concat(Object.keys(ERAS).map(function (k) { return [k, ERAS[k].nm]; }));
      var segE = eras.map(function (e) { return '<button data-v="' + e[0] + '"' + (ui.era === e[0] ? ' aria-checked="true"' : '') + '>' + e[1] + '</button>'; }).join('');
      var blank = ui.era === 'X' || !W, eL = blank ? null : evFor(W.lastU, 1), eC = blank ? null : evFor(W.lastU, -1);
      root.setAttribute('data-ev-side', ui.side);
      var mapIn = blank ? mapShell(TILES.map(function (t) { return tileHTML(t, 'ev-blank ' + weightCls(t.ev), null, t.nm + ', ' + t.ev + ' electors'); }).join(''), 'The map, not yet printed. Arrow keys move between states.') + blankLegendHTML() :
        mapShell(lastMapHTML(W), 'Last time on this map. Arrow keys move between states.') + legendHTML();
      /* a new map or a new politics prints in; a change of ticket or scenario does not reprint the sheet */
      var mapKey = ui.era + ':' + ui.seed + ':' + ui.mir, reprint = ui.mapKey != null && ui.mapKey !== mapKey;
      ui.mapKey = mapKey;
      var eraP = blank ? 'The map is a surprise. It prints when the campaign starts, from real census numbers, with either party as likely as the other to own either coalition.' : eraCopy(W);
      body.innerHTML = '<div class="ev-setup lk-in">' +
        '<section class="ev-stage ev-stage--set" data-ground="espresso">' +
        '<p class="lk-kicker ev-sa-k">Nine weeks to November</p>' +
        '<div class="lk-head ev-sa-head"><h4 class="lk-title ev-focus" tabindex="-1">Choose a side. Neither is anyone you know.</h4>' +
        '<p class="lk-lede">Two parties invented for this machine, two tickets and one real ' + K.term('elector', 'electoral college') + '. The map’s politics are generated fresh from real census numbers on every run, so either party can hold any coalition. Pick a ticket and a starting position, and the map shows where the race will be decided.</p></div>' +
        '<div class="ev-sa-map"><div class="ev-mapbar ev-mapbar--set"><h5 class="lk-kicker ev-mapk" id="evErL">The map</h5>' + v3Seg() + '<div class="lk-seg ev-eras" aria-labelledby="evErL">' + segE + '</div></div>' +
        '<div class="ev-prevmap"><div class="ev-3dslot"></div>' + sheetHTML(blank ? 'The map, not yet printed' : 'Last time on this map', mapIn, ui.seed + (ui.mir < 0 ? ' (mirrored)' : ''), reprint ? 'ev-print' : '') + '</div>' +
        splitHTML(eL, eC, blank ? '538 electors. A majority is 270.' : 'Electors last time on this map. A majority is 270.', ui.side, true) +
        '<p class="ev-era">' + esc(eraP) + '</p></div>' +
        '<div class="ev-sa-ctl"><div class="ev-tickets" role="group" aria-label="Your ticket">' + ticket('L') + ticket('C') + '</div>' +
        '<p class="ev-note">Traits are flavor; the mechanics are identical.</p>' +
        '<h5 class="lk-kicker ev-h5" id="evScL">How the race starts</h5><div class="lk-seg ev-scen" aria-labelledby="evScL">' + segS + '</div><p class="ev-segnote">' + esc(cap(SCEN[ui.scen].s)) + '. The polls will tell you how close, and they may be wrong.</p>' +
        '<div class="btnrow ev-go"><button type="button" class="ebtn" data-act="start">Start the campaign</button><button type="button" class="ebtn2" data-act="newmap">New map</button></div></div>' +
        '</section>' +
        '<div class="lk-grid ev-primers">' +
        '<div class="lk-card"><p class="lk-kicker">538 and 270</p><p>Every state gets an ' + K.term('elector', 'elector') + ' for each House seat plus two, set by ' + K.term('apport', 'apportionment') + ' after the 2020 census. A majority is 270. Nobody gets points for the popular vote.</p></div>' +
        '<div class="lk-card"><p class="lk-kicker">Winner take all, mostly</p><p>Win a state by one vote and you take all of its electors. Maine and Nebraska give two statewide and one per district, which is why their tiles carry little strips.</p></div>' +
        '<div class="lk-card"><p class="lk-kicker">Polls miss together</p><p>Every poll is a little wrong, and similar states miss in the same direction at once. The forecast accounts for this. You find out which way on election night.</p></div>' +
        '</div>' +
        '<p class="ev-seed lk-num">Map #' + ui.seed + (ui.mir < 0 ? ' (mirrored)' : '') + ' · Same map and same choices replay the same campaign.</p>' +
        '</div>';
      K.seg(body.querySelector('.ev-scen'), function (v) { ui.scen = v; renderSetup(); focusSel('.ev-scen button[aria-checked="true"]'); });
      K.seg(body.querySelector('.ev-eras'), function (v) { ui.era = v; renderSetup(); focusSel('.ev-eras button[aria-checked="true"]'); });
      var m = body.querySelector('.ev-map');
      if (m) roving(m, -1);
      v3Wire();
      foil();
    }
    function focusSel(q) { var b = body.querySelector(q); if (b) { try { b.focus({ preventScroll: true }); } catch (e) {} } }

    /* ---------- the campaign ---------- */
    function startCampaign() {
      persist();
      G = genWorld({ seed: ui.seed, era: ui.era, scen: ui.scen, side: ui.side, mir: ui.mir });
      var sv = store.get() || {};
      sv.runs = (sv.runs || 0) + 1; store.set(sv);
      openingPolls(G);
      ui.phase = 'plan'; ui.busy = true; ui.sel = -1; ui.lens = 'fc'; ui.tab = 0; ui.feedN = 0; ui.indShown = false; ui.pk = -1; ui.polAll = false;
      root.setAttribute('data-ev-side', G.side);
      body.innerHTML = '<div class="ev-busy lk-in"><section class="ev-stage ev-stage--busy" data-ground="espresso"><div class="lk-head ev-sa-head"><p class="lk-kicker">Nine weeks to November</p><h4 class="lk-title ev-focus" tabindex="-1">Printing the map</h4><p class="lk-lede ev-run">Running 4,000 elections on it.</p></div>' +
        '<div class="ev-sa-map">' + sheetHTML('Last time on this map', '<div class="ev-map" role="group" aria-label="Last time on this map">' + lastMapHTML(G) + '</div>' + legendHTML(), G.seed + (G.mir < 0 ? ' (mirrored)' : ''), 'ev-print') + '</div></section></div>';
      K.focus(body.querySelector('.ev-focus'));
      var g0 = G;
      forecastAsync(G, function () {
        if (g0 !== G) return;
        G.fcAtStart = false;
        prepEvent(G);
        say('MANAGER', 'Welcome to the campaign. ' + eraCopy(G));
        say('DATA', 'Nadia’s first forecast is built on the Labor Day polls and last time’s map. It will move; the first weeks of polling always do.');
        weekNotes();
        ui.busy = false;
        ui.plan = defaultPlan();
        renderCampaign(true);
      }, snag);
    }
    function snag(e) {
      try { console.warn('[lab:electoral]', e); } catch (x) {}
      body.innerHTML = '<p class="lk-snag">Something in this machine tripped. Reload to run it again.</p>';
    }
    function rowOrder(p) {
      var Y = G.S[G.side], set = {}, o = tipsOrder(G);
      p.rows.forEach(function (i) { set[i] = 1; });
      for (var i = 0; i < NU; i++) if (p.ads[i] > 0 || Y.lvl[i] > 0 || p.lvl[i] > 0) set[i] = 1;
      o.slice(0, 4).forEach(function (i) { set[i] = 1; });
      p.rows = o.filter(function (i) { return set[i]; });
    }
    /* the suggestion leaves room for the dearest answer to this week's news, so choosing it never strands the plan over budget */
    function evReserve() {
      var m = 0, Y = G.S[G.side];
      if (G.evt) evOpts(G, G.evt).forEach(function (o) { m = Math.max(m, o.cost || 0, evCostOf(G, G.evt, o.k, Y)); });
      return m;
    }
    function suggestReserved(p, Y) { var rsv = evReserve(); p.nat += rsv; suggestAds(G, p, Y); p.nat -= rsv; return p; }
    function defaultPlan() {
      var Y = G.S[G.side], p = emptyPlan(), last = G.log.length ? G.log[G.log.length - 1].plan : null, i;
      p.lvl = Int8Array.from(Y.lvl);
      if (last) {
        p.msg = last.msg; p.nat = last.nat; p.rows = last.rows.slice(); p.post = last.post;
        /* the desk re-paces every line you have not touched to this week's war chest; the lines you set keep your number */
        suggestReserved(p, Y);
        Object.keys(last.man || {}).forEach(function (k) { var j = +k; p.man[j] = 1; p.ads[j] = Math.min(last.ads[j], adMax(j, G.week)); });
        var ep = effPlan(G, p, Y);
        if (ep.total > Y.cash) { var sc = Math.max(0, (Y.cash - ep.field - p.nat) / Math.max(1, ep.adT)); for (i = 0; i < NU; i++) p.ads[i] = Math.floor(p.ads[i] * Math.min(1, sc)); }
      } else { suggestReserved(p, Y); p.sug = true; }
      rowOrder(p);
      suggestSlots(G, p);
      p.ev = null;
      ui.base = clonePlan(p);
      return p;
    }
    function weekNotes() {
      var w = G.week;
      unlock('tip', 'Week ' + w + ', the first forecast');
      if (w >= 2) { unlock('apport', 'Week 2'); unlock('fade', 'Week 2'); }
      if (w >= 3) unlock('house', 'Week 3');
      if (w >= 4) unlock('forecast', 'Week 4');
      if (G.fc.pWin > 0.7 || G.fc.pWin < 0.3) unlock('forecast', 'Week ' + w + ', a win chance of ' + F.prob(G.fc.pWin));
      if (G.fc.pInvW + G.fc.pInvL >= 0.05) unlock('inversion', 'Week ' + w + ', the forecast');
      if (G.fc.pTie >= 0.005) unlock('contingent', 'Week ' + w + ', tie odds of ' + F.oneIn(G.fc.pTie));
    }
    function renderCampaign(focus) {
      ui.phase = 'plan';
      var w = G.week, days = 64 - 7 * (w - 1);
      var lens = [['fc', 'Forecast'], ['tip', 'Tipping odds'], ['pow', 'Voter power'], ['plan', 'Your plan'], ['twin', 'Error twins']];
      root.setAttribute('data-ev-side', G.side);
      body.innerHTML = '<div class="ev-shell">' +
        '<section class="ev-stage ev-stage--plan" data-ground="espresso">' +
        '<div class="lk-head ev-head ev-sa-head"><p class="lk-kicker"><i class="ev-live" aria-hidden="true"></i>Week ' + w + ' of 9 · ' + days + ' days to Election Day · ' + esc(PY().cand) + ' for ' + esc(PY().sh) + '</p>' +
        '<h4 class="lk-title ev-focus" tabindex="-1">' + esc(WEEK_T[w]) + '</h4><p class="lk-lede ev-brief">' + esc(briefText()) + '</p>' +
        '<div class="lk-pips" aria-hidden="true">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (k) { return '<i class="lk-pip' + (k < w ? ' is-past' : k === w ? ' is-now' : '') + '"></i>'; }).join('') + '</div></div>' +
        '<div class="ev-strip ev-sa-num"></div>' +
        '<div class="ev-sa-map"><div class="ev-mapbar"><div class="ev-lens" role="group" aria-label="What the map shows">' + lens.map(function (l) { return '<button type="button" class="ev-lensb" data-act="lens" data-k="' + l[0] + '" aria-pressed="' + (ui.lens === l[0]) + '">' + l[1] + '</button>'; }).join('') + '</div>' + v3Seg() + '</div>' +
        '<div class="ev-3dslot"></div>' +
        sheetHTML('Week ' + w + ' · ' + LENS_NM[ui.lens], '<div class="ev-mapwrap"></div>' +
          '<div class="ev-snakew"><p class="ev-snakel"><span class="lk-k">' + K.term('snake', 'The snake') + '</span><span class="ev-snakes lk-num"></span></p><canvas class="lk-bare ev-snake" aria-hidden="true"></canvas><p class="vh ev-snakevh"></p></div>', G.seed + (G.mir < 0 ? ' (mirrored)' : '')) +
        '<div class="ev-splitw"></div></div>' +
        '<div class="ev-sel ev-sa-sel" aria-live="polite"></div>' +
        '</section>' +
        '<h5 class="lk-kicker ev-h5">The wire</h5><div class="lk-feed ev-feed" aria-live="polite" aria-relevant="additions"></div>' +
        '<div class="lk-tabs ev-tabs" aria-label="The desk">' + ['Plan', 'Polls', 'Forecast', 'State'].map(function (t, i) {
          return '<button type="button" class="lk-tab" role="tab" id="evT' + i + '-' + ctx.num + '" aria-controls="evP' + i + '-' + ctx.num + '"' + (i === ui.tab ? ' aria-selected="true"' : '') + '>' + t + '</button>'; }).join('') + '</div>' +
        [0, 1, 2, 3].map(function (i) { return '<div class="lk-panel ev-panel" role="tabpanel" id="evP' + i + '-' + ctx.num + '" aria-labelledby="evT' + i + '-' + ctx.num + '"' + (i === ui.tab ? '' : ' hidden') + '></div>'; }).join('') +
        '<div class="ev-actions"></div>' +
        '</div>';
      K.tabs(body.querySelector('.ev-tabs'), function (i) { ui.tab = i; renderPanel(i); if (i === 1) unlock('moe', 'The Polls tab'); });
      ui.feedN = 0;
      renderStrip(); renderFeed(); renderMap(); renderSel(); renderPanel(ui.tab); renderActions(); paintAll();
      v3Wire();
      foil();
      if (focus) K.focus(body.querySelector('.ev-focus'), { scroll: true });
    }
    function briefText() {
      var w = G.week, b = BRIEF[w];
      if (w === 1) {
        var k = 0;
        for (var c = 0; c < 56; c++) if (Math.abs(G.sy * fmC(c) - G.fc.tipAvg) <= 4) k++;
        b = b.replace('{cash}', money(G.S[G.side].cash)).replace('{k}', String(k));
      }
      return b;
    }
    function renderStrip() {
      var fc = G.fc, Y = G.S[G.side], tc = fc.tipAvgC, st = body.querySelector('.ev-strip');
      if (!st) return;
      var bias = fc.bias, bt = Math.abs(bias) < 0.05 ? 'None' : Math.abs(bias).toFixed(1) + (bias > 0 ? ' toward you' : ' against you');
      st.innerHTML = '<div class="ev-hero"><p class="lk-k">Win chance</p><p class="stat foil ev-hero-n">' + F.prob(fc.pWin) + '</p>' +
        '<p class="ev-hero-s">' + (ui.indShown ? 'Independent errors: ' + F.prob(fc.pInd) : 'In 4,000 simulated elections') + '</p>' +
        '<span class="ev-meter" aria-hidden="true"><i style="--w:' + Math.max(0, Math.min(1, fc.pWin)).toFixed(3) + '"></i></span></div>' +
        '<ol class="ledger ledger--data ev-ledger">' + ledRow('Week', G.week + ' of 9') + ledRow('Days to go', String(64 - 7 * (G.week - 1))) + ledRow('War chest', money(Y.cash)) +
        ledRow('Median electors', String(fc.evMed), fc.ev10 + ' to ' + fc.ev90) +
        ledRow(K.term('tip', 'Tipping point') + ' (average map)', esc(CI[tc].id) + ' · ' + mTxt(fc.tipAvg)) +
        ledRow('Popular vote', mTxt(fc.natAvg)) + ledRow(K.term('bias', 'Map bias'), bt) + '</ol>';
      var sp = body.querySelector('.ev-splitw');
      if (sp) {
        var you = 0, them = 0, b;
        for (var c = 0; c < 56; c++) { if (G.sy * fmC(c) > 0) you += EV56[c]; else them += EV56[c]; }
        b = byParty(you, them);
        sp.innerHTML = splitHTML(b.L, b.C, 'Electors on the average map', G.side);
      }
      foil();
    }
    function renderFeed() {
      var f = body.querySelector('.ev-feed');
      if (!f || !G) return;
      var add = '';
      for (var i = ui.feedN; i < G.feed.length; i++) {
        var l = G.feed[i];
        if (l.tag === 'WEEK') add += '<p class="lk-line ev-wk">' + esc(l.txt) + '</p>';
        else add += '<p class="lk-line">' + chip(l.tag) + esc(l.txt) + (l.x ? ' ' + l.x : '') + '</p>';
      }
      if (ui.feedN === 0) f.innerHTML = add; else if (add) f.insertAdjacentHTML('beforeend', add);
      ui.feedN = G.feed.length;
      while (f.children.length > 80) f.removeChild(f.firstChild);
      f.scrollTop = f.scrollHeight;
    }
    function lensVal(c) {
      var L = ui.lens;
      if (L === 'fc') return mS(G.sy * fmC(c));
      if (L === 'tip') return Math.round(tipT(c) * 100) + '%';
      if (L === 'pow') return powTxt(powT(c));
      if (L === 'plan') { var s = planSpend(c); return s > 0 ? money(s) : ''; }
      if (L === 'twin') { var a = twinBase(), k = c >= NU ? tipUnitOf(c) : c; return k === a ? 'here' : rho(a, k).toFixed(2); }
      return '';
    }
    function twinBase() { var s = ui.sel >= 0 ? ui.sel : G.fc.tipC; return s >= NU ? tipUnitOf(s) : s; }
    function planSpend(c) {
      var p = ui.plan, Y = G.S[G.side];
      function one(i) { return p.ads[i] + (p.lvl[i] > 0 ? runCost(i, p.lvl[i]) + (Y.lvl[i] === 0 ? openCost(i) : 0) : 0); }
      if (c < NU) return one(c);
      return KIDS[CI[c].id].reduce(function (s, k) { return s + one(k); }, 0);
    }
    function tileCls(c) {
      var L = ui.lens;
      if (L === 'fc') return partyCls(fmC(c));
      if (L === 'tip') return rampCls(tipT(c), 0.2);
      if (L === 'pow') return rampCls(powT(c), 4);
      if (L === 'plan') return rampCls(planSpend(c), 40);
      if (L === 'twin') { var a = twinBase(), k = c >= NU ? tipUnitOf(c) : c; if (k === a) return 'ev-I5 is-anchor'; return rampCls(Math.max(0, (rho(a, k) - 0.3) / 0.45), 1, true); }
      return '';
    }
    function tileLabel(t) {
      var c = t.c;
      return t.nm + ', ' + t.ev + ' electors, average ' + mTxt(G.sy * fmC(c)).replace('+', 'plus ') + ', tipping odds ' + Math.round(tipT(c) * 100) + ' percent' + (ui.lens === 'plan' && planSpend(c) > 0 ? ', your plan ' + money(planSpend(c)) : '');
    }
    function renderMap() {
      var wrap = body.querySelector('.ev-mapwrap');
      if (!wrap) return;
      /* two different tipping points: the Tipping odds lens outlines the contest that tips most often in the 4,000 simulations;
         every other lens outlines the one that crosses 270 on the average map */
      var tipMark = ui.lens === 'tip' ? G.fc.tipC : G.fc.tipAvgC;
      var html = TILES.map(function (t) {
        var extra = distStrip(t, function (k) { return ui.lens === 'fc' ? partyCls(G.fmean[k]) : ui.lens === 'tip' ? rampCls(G.fc.tipU[k], 0.2) : ui.lens === 'plan' ? rampCls(planSpend(k), 40) : 'ev-I0'; });
        var sel = ui.sel === t.c || (t.kids && t.kids.indexOf(ui.sel) >= 0);
        return tileHTML(t, tileCls(t.c) + (sel ? ' is-sel' : '') + (t.c === tipMark || (t.kids && t.kids.indexOf(tipMark) >= 0) ? ' is-tip' : ''), lensVal(t.c), tileLabel(t), extra);
      }).join('');
      var lg = ui.lens === 'fc' ? legendHTML(true) : '<div class="ev-legend" aria-hidden="true"><span class="ev-lg-s">' + ({ tip: 'How often each contest decides the election, in 4,000 simulations. The foil outline is the most likely tipping point.',
        pow: 'How much a single voter here matters to the outcome, against the national average of ×1.', plan: 'Where this week’s planned money goes: ads plus field.',
        twin: 'How closely each state’s polling error moves with ' + U[twinBase()].nm + '’s. Select another state to compare.' })[ui.lens] + '</span></div>';
      wrap.innerHTML = mapShell(html, 'Electoral map. Arrow keys move between states; Enter selects one.') + lg;
      var shT = body.querySelector('.ev-stage--plan .ev-sheet-h > span');
      if (shT) shT.textContent = 'Week ' + G.week + ' · ' + LENS_NM[ui.lens];
      roving(wrap.querySelector('.ev-map'), ui.sel >= 0 ? (ui.sel < NU && U[ui.sel].par ? CONT[U[ui.sel].par] : ui.sel) : G.fc.tipC >= NU ? G.fc.tipC : (U[G.fc.tipC].par ? CONT[U[G.fc.tipC].par] : G.fc.tipC));
      v3Paint('');
    }
    function renderSel() {
      var el = body.querySelector('.ev-sel');
      if (!el) return;
      var c = ui.sel;
      if (c < 0) { el.innerHTML = '<p class="ev-hint">Select a state to see its numbers here. On the map, arrow keys move and Enter selects; the snake works too.</p>'; return; }
      var inPlan = c < NU && ui.plan.rows.indexOf(c) >= 0, e = CI[c];
      var dist = c >= NU ? '<div class="ev-dbtns">' + KIDS[e.id].map(function (k) { return '<button type="button" class="ev-dbtn" data-act="sel" data-c="' + k + '" aria-pressed="' + (ui.sel === k) + '">' + U[k].id + ' · ' + mTxt(G.sy * G.fmean[k]) + '</button>'; }).join('') + '</div>' : '';
      el.innerHTML = '<div class="ev-selc lk-card"><p class="ev-seln"><span class="ev-selt">' + esc(e.nm) + '</span> <span class="lk-num ev-selm">' + e.ev + ' ' + (e.ev === 1 ? 'elector' : 'electors') + ' · ' + mTxt(G.sy * fmC(c)) + ' · tipping ' + Math.round(tipT(c) * 100) + '% · ' + powTxt(powT(c)) + '</span></p>' + dist +
        '<div class="btnrow"><button type="button" class="ebtn2" data-act="dossier">Open the dossier</button>' + (c < NU ? '<button type="button" class="ebtn2" data-act="addsel"' + (inPlan ? ' disabled' : '') + '>' + (inPlan ? 'In this week’s plan' : 'Add to this week’s plan') + '</button>' : '') + '</div></div>';
    }
    function select(c, from) {
      ui.sel = c;
      var e = CI[c];
      if (c >= NU || U[c].par) unlock('district', 'Selecting ' + e.stNm);
      if (/^(DC|WY|VT|AK|ND|SD)$/.test(e.id)) unlock('small', 'Selecting ' + e.nm);
      if (EV_SEATCHG[e.st]) unlock('apport', 'Selecting ' + e.stNm);
      renderMap(); renderSel(); paintSnake();
      if (ui.tab === 3 || ui.tab === 1) renderPanel(ui.tab);
      if (from === 'map') { var b = body.querySelector('.ev-map .ev-tile[data-c="' + (c < NU && U[c].par ? CONT[U[c].par] : c) + '"]'); if (b) b.focus(); }
    }

    /* ---------- the snake: every contest in one line, your safest to theirs ---------- */
    function snakeOrder() {
      var o = [];
      for (var c = 0; c < 56; c++) o.push(c);
      o.sort(function (a, b) { return G.sy * fmC(b) - G.sy * fmC(a) || a - b; });
      return o;
    }
    function paintSnake() {
      var cv = body.querySelector('.ev-snake');
      if (!cv || !G || !G.fc) return;
      var f = K.fitCanvas(cv, 64), x = f.ctx, Wd = f.W;
      if (!(Wd > 0)) return;
      x.clearRect(0, 0, Wd, 64);
      var o = snakeOrder(), L = 2, R = Wd - 2, s = (R - L) / 538, top = 18, h = 26, xx = L, acc = 0, tipX = 0, youX = L, ac = K.ACC(), ink = K.inkColor(1), youL = G.side === 'L';
      var sh = cv.closest('.ev-sheet') || cv.parentNode, cL = K.labColor('--ev-ln', sh), cC = K.labColor('--ev-cn', sh), halo = K.labColor('--paper', sh);
      cv._segs = [];
      o.forEach(function (c) {
        var w = EV56[c] * s, m = G.sy * fmC(c), mine = m > 0, lantern = mine === youL, a = Math.min(1, 0.25 + Math.abs(m) / 16);
        x.globalAlpha = a;
        if (lantern) { x.fillStyle = cL; x.fillRect(xx, top, Math.max(0.5, w - 0.6), h); }
        else {
          x.globalAlpha = a * 0.42; x.fillStyle = cC; x.fillRect(xx, top, Math.max(0.5, w - 0.6), h); x.globalAlpha = a;
          x.save(); x.beginPath(); x.rect(xx, top, Math.max(0.5, w - 0.6), h); x.clip(); x.strokeStyle = cC; x.lineWidth = 1.4; x.beginPath();
          for (var hx = xx - h; hx < xx + w; hx += 4) { x.moveTo(hx, top + h); x.lineTo(hx + h, top); }
          x.stroke(); x.restore();
        }
        x.globalAlpha = 1;
        if (acc < 270 && acc + EV56[c] >= 270) tipX = xx;
        if (mine) youX = xx + w;
        cv._segs.push([xx, xx + w, c]);
        if (w >= 18) K.cvText(x, CI[c].id, xx + w / 2, top + h + 13, { px: 11, align: 'center', color: K.inkColor(0.72), halo: halo });
        if (c === ui.sel || (c < NU && U[c].par && CONT[U[c].par] === ui.sel)) { x.strokeStyle = ink; x.lineWidth = 1.5; x.strokeRect(xx + 0.75, top - 2.25, Math.max(1, w - 2), h + 4.5); }
        if (c === G.fc.tipAvgC) { x.strokeStyle = ac; x.lineWidth = 2; x.strokeRect(xx + 1, top - 3, Math.max(1.5, w - 2.2), h + 6); }
        acc += EV56[c]; xx += w;
      });
      /* foil marks only you: a rule under the contests you lead, never a party's fill */
      if (youX > L) { x.fillStyle = ac; x.fillRect(L, top + h + 1, youX - L - 0.6, 2); }
      var mx = Math.round(L + 270 * s) + 0.5;
      x.strokeStyle = ink; x.lineWidth = 1; x.setLineDash([3, 3]); x.beginPath(); x.moveTo(mx, 2); x.lineTo(mx, top + h + 3); x.stroke(); x.setLineDash([]);
      K.cvText(x, '270', mx + 4, 12, { px: 11, color: ink, halo: halo });
      K.cvText(x, 'Your safest', L, 12, { px: 11, halo: halo });
      K.cvText(x, 'Theirs', R, 12, { px: 11, align: 'right', halo: halo });
      var tc = G.fc.tipAvgC, sl = body.querySelector('.ev-snakes');
      if (sl) sl.textContent = 'crosses 270 in ' + CI[tc].id + ' at ' + mTxt(G.fc.tipAvg);
      var vh = body.querySelector('.ev-snakevh');
      if (vh) vh.textContent = 'Contests from your safest to theirs: ' + o.map(function (c) { return CI[c].id + ' ' + mS(G.sy * fmC(c)); }).join(', ') + '. The line crosses 270 in ' + nm(tc) + '.';
    }
    function snakeHit(ev) {
      var cv = ev.target, r = cv.getBoundingClientRect(), px = ev.clientX - r.left;
      (cv._segs || []).forEach(function (s) { if (px >= s[0] && px < s[1]) select(s[2]); });
    }

    /* ---------- the desk: plan, polls, forecast, state ---------- */
    function panelEl(i) { return body.querySelector('#evP' + i + '-' + ctx.num); }
    function renderPanel(i) {
      var p = panelEl(i);
      if (!p || !G) return;
      p.innerHTML = i === 0 ? planHTML() : i === 1 ? pollsHTML() : i === 2 ? fcHTML() : dossierHTML();
      if (i === 0) wirePlan(p);
      if (i === 1 && p.querySelector('.ev-polseg')) K.seg(p.querySelector('.ev-polseg'), function (v) { ui.polAll = v === 'all'; renderPanel(1); focusSel('.ev-polseg button[aria-checked="true"]'); });
      K.sfill(p);
      if (i === 0) updateBudget();
      if (i === 2) paintHist();
    }
    function hdTxt(h) { return h >= 1.1 ? 'high' : h >= 0.7 ? 'medium' : 'low'; }
    function piTxt(p) { return p < 0.92 ? 'low' : p < 1.08 ? 'medium' : 'high'; }
    function adPrev(i, x) {
      var w = G.week, M = MSG[ui.plan.msg], dA = x > 0 ? KAD * M.a * G.pi[i] * Math.log(1 + x / adCost(i, w)) : 0, st = G.S[G.side].A[i];
      if (x <= 0) return st > 0.05 ? 'No new ads. What you bought before is worth about +' + (st * 0.5).toFixed(2) + ' after this week’s fade.' : 'No ads here this week.';
      return money(x) + ' buys about +' + dA.toFixed(2) + ' now, +' + (dA / 2).toFixed(2) + ' next week, then mostly gone. Cost per point this week: ' + money(x / dA) + '.';
    }
    function adVT(i, x) { var M = MSG[ui.plan.msg], dA = x > 0 ? KAD * M.a * G.pi[i] * Math.log(1 + x / adCost(i, G.week)) : 0; return x + ' million dollars, about ' + dA.toFixed(2) + ' points this week'; }
    function natPrev(x) {
      var w = G.week, M = MSG[ui.plan.msg], dA = x > 0 ? KAD * M.a * Math.log(1 + x / natCost(w)) : 0, far = 0, all = 0;
      for (var i = 0; i < NU; i++) { all += U[i].vep; if (Math.abs(G.sy * G.fmean[i] - G.fc.tipAvg) > 8) far += U[i].vep; }
      if (x <= 0) return 'National ads reach every state at once, which is their appeal and their problem.';
      return '+' + dA.toFixed(2) + ' everywhere, before each state’s persuadability. About ' + Math.round(far / all * 100) + '% of it lands in states more than 8 points from the tipping point.';
    }
    function fieldPrev(i) {
      var p = ui.plan, Y = G.S[G.side], l = p.lvl[i], W = Y.W[i], got = Math.round((1 - Math.exp(-W / 6)) * 100), hd = K.term('headroom', 'headroom') + ': ' + hdTxt(G.hd[G.side][i]);
      if (!l) return W > 0 ? 'Closed. Contacts already made (' + got + '% of what an office here can do) fade each week without follow-up: about a fifth a week. ' + hd + '.' : 'No office. ' + hd + '.';
      return 'Level ' + l + ' · ' + money(runCost(i, l)) + ' a week' + (Y.lvl[i] === 0 ? ' plus ' + money(openCost(i)) + ' to open' : '') + ' · contacts so far: ' + got + '% of what this office can do · ' + hd;
    }
    function rowHTML(i) {
      var p = ui.plan, Y = G.S[G.side], u = U[i], w = G.week, mx = adMax(i, w), x = Math.min(p.ads[i], mx), late = w > 7 && Y.lvl[i] === 0;
      p.ads[i] = x;
      var seg = [0, 1, 2, 3].map(function (l) { return '<button data-v="' + l + '"' + (p.lvl[i] === l ? ' aria-checked="true"' : '') + (late && l > 0 ? ' disabled' : '') + (l ? ' aria-label="Level ' + l + '"' : '') + '>' + (l ? l : 'None') + '</button>'; }).join('');
      return '<div class="ev-row" data-u="' + i + '"><div class="ev-row-h"><span class="ev-row-n">' + esc(u.nm) + '</span><span class="ev-row-m lk-num">' + u.ev + ' ' + (u.ev === 1 ? 'elector' : 'electors') + ' · tipping ' + Math.round(G.fc.tipU[i] * 100) + '% · ' + mTxt(G.sy * G.fmean[i]) + '</span>' +
        (Y.lvl[i] === 0 && p.lvl[i] === 0 ? '<button type="button" class="ev-x" data-act="rmrow" data-u="' + i + '" aria-label="Remove ' + esc(u.nm) + ' from the plan">Remove</button>' : '') + '</div>' +
        '<div class="lk-field"><label for="evA' + i + '-' + ctx.num + '">Ads this week</label><output class="lk-range-out" id="evAo' + i + '-' + ctx.num + '">' + money(x) + '</output>' +
        '<input type="range" id="evA' + i + '-' + ctx.num + '" data-ad="' + i + '" min="0" max="' + mx + '" step="1" value="' + x + '" aria-valuetext="' + esc(adVT(i, x)) + '"></div>' +
        '<p class="ev-prev" data-prev="' + i + '">' + esc(adPrev(i, x)) + '</p>' +
        '<div class="ev-fld"><span class="lk-k" id="evFl' + i + '-' + ctx.num + '">Field office</span><div class="lk-seg ev-lvl" data-u="' + i + '" aria-labelledby="evFl' + i + '-' + ctx.num + '">' + seg + '</div>' +
        '<p class="ev-fprev" data-fprev="' + i + '">' + fieldPrev(i) + '</p>' + (late ? '<p class="ev-note">Too late to hire and train a new office here.</p>' : '') + '</div></div>';
    }
    function eventLock(who, j) {
      var ev = G.evt, ch = ui.plan.ev, lk = G.locks || {};
      if (lk[who + j]) return 'Rally in ' + U[+lk[who + j].slice(1)].nm + ' (the governor’s price)';
      if (!ev || !ch) return null;
      if (ev.t === 'STORM' && ch === 'P' && who === 'c' && j === 0) return 'Storm visit, ' + U[ev.u].nm;
      if (ev.t === 'TOWNHALL' && ch === 'Y' && who === 'c' && j === 2) return 'Town hall, ' + U[ev.u].nm;
      if (ev.t === 'VPWEEK' && ev.side === 'you' && ch === 'B' && who === 'r') return 'Benched this week';
      return null;
    }
    function slotHTML(who, j) {
      var v = ui.plan[who][j], lock = eventLock(who, j), id = 'evS' + who + j + '-' + ctx.num, lab = (who === 'c' ? 'Candidate' : 'Running mate') + ', day ' + (j + 1);
      if (lock) return '<label class="ev-slot" for="' + id + '"><span class="vh">' + lab + '</span><select class="ev-select" id="' + id + '" disabled><option>' + esc(lock) + '</option></select></label>';
      var o = tipsOrder(G), opts = '<option value="f"' + (v === 'f' ? ' selected' : '') + '>Fundraise (+' + (who === 'c' ? '$7M' : '$3M') + ')</option>';
      if (who === 'c' && prepWeek(G.week)) opts += '<option value="p"' + (v === 'p' ? ' selected' : '') + '>Debate prep</option>';
      opts += '<optgroup label="Rally in">' + o.map(function (i) { return '<option value="r' + i + '"' + (v === 'r' + i ? ' selected' : '') + '>' + esc(U[i].nm) + ' · ' + Math.round(G.fc.tipU[i] * 100) + '%</option>'; }).join('') + '</optgroup>';
      return '<label class="ev-slot" for="' + id + '"><span class="vh">' + lab + '</span><select class="ev-select" id="' + id + '" data-slot="' + who + j + '">' + opts + '</select></label>';
    }
    function eventHTML(ev) {
      var tx = evText(G, ev), ch = ui.plan.ev;
      return '<section class="ev-sec"><h5 class="lk-kicker ev-h5">This week’s news</h5><div class="lk-card lk-card--event ev-evt"><p class="ev-evk">' + chip(tx.tag) + '<span>' + esc(tx.kick) + '</span></p><p>' + esc(tx.txt) + '</p>' +
        evOpts(G, ev).map(function (o) { return '<button type="button" class="lk-opt" data-act="evopt" data-k="' + o.k + '" aria-pressed="' + (ch === o.k) + '"><span class="lk-opt-l">' + esc(o.l) + '</span><span class="lk-opt-s">' + esc(o.s) + '</span></button>'; }).join('') +
        '</div></section>';
    }
    function planHTML() {
      var p = ui.plan, w = G.week, Y = G.S[G.side], h = '';
      /* pace: what you have spent so far against a steady ninth a week of everything you will have (start, money in, money still to come) */
      var spentSoFar = 0, gotSoFar = 0;
      G.log.forEach(function (l) { spentSoFar += l.spend; gotSoFar += l.inflow; });
      var steady = (CASH0 + gotSoFar + inflow(G.fc.pWin) * (10 - w)) * (w - 1) / 9;
      h += '<div class="lk-strip lk-block ev-budget" style="--lk-cols:5"><div class="lk-cell"><span class="lk-k">War chest</span><span class="lk-v">' + money(Y.cash) + '</span></div>' +
        '<div class="lk-cell"><span class="lk-k">Planned this week</span><span class="lk-v ev-planned">$0</span></div>' +
        '<div class="lk-cell"><span class="lk-k">Coming in</span><span class="lk-v ev-inflow">$0</span></div>' +
        '<div class="lk-cell"><span class="lk-k">Left after this week</span><span class="lk-v ev-left">$0</span></div>' +
        '<div class="lk-cell"><span class="lk-k">Spent so far</span><span class="lk-v">' + money(spentSoFar) + '</span><span class="ev-sub">' + (w === 1 ? 'A steady pace spends about a ninth a week.' : 'A steady pace: ' + money(steady)) + '</span></div></div>';
      if (w >= 8) h += '<p class="ev-note">Anything left on Election Day is the recount fund.</p>';
      if (p.sug && w === 1) h += '<p class="lk-coach">This first plan is the desk’s suggestion: money where the tipping odds are, and nothing else. It has not opened a single field office, and field offices opened now are the ones still paying out in November. Change anything.</p>';
      if (G.evt) h += eventHTML(G.evt);
      h += '<section class="ev-sec"><h5 class="lk-kicker ev-h5">The message this week</h5><div class="ev-msgs">' + ['P', 'B', 'X'].map(function (k) {
        return '<button type="button" class="lk-opt" data-act="msg" data-k="' + k + '" aria-pressed="' + (p.msg === k) + '"><span class="lk-opt-l">' + MSG[k].nm + '</span><span class="lk-opt-s">' + esc(MSG[k].s) + '</span></button>'; }).join('') + '</div>' +
        '<p class="ev-note">The research says ' + K.term('persuasion', 'persuasion') + ' is rare and brief, and ' + K.term('mobil', 'mobilization') + ' is slow and durable. The message decides which one your money buys more of.</p></section>';
      if (debateWeek(w)) {
        var pres = w !== 5, prep = pres ? Math.min(3, Y.prep + slotCount(p.c, 'p')) : 0;
        h += '<section class="ev-sec"><h5 class="lk-kicker ev-h5">' + (pres ? (w === 3 ? 'The first debate' : 'The last debate') : 'The running mates’ debate') + '</h5><div class="lk-card ev-deb">' +
          '<p>' + (pres ? esc(PY().cand) + ' has ' + prep + ' ' + (prep === 1 ? 'day' : 'days') + ' of prep counted (up to three help). Each is worth a little on the night.' : esc(PY().vp) + ' debates ' + esc(PT().vp) + '. Nobody preps for these; the effect is half a presidential debate’s, at most.') + '</p>' +
          '<div class="lk-seg ev-post" aria-label="Debate posture">' + ['S', 'H', 'W'].map(function (k) { return '<button data-v="' + k + '"' + (p.post === k ? ' aria-checked="true"' : '') + '>' + POSTURE[k].nm + '</button>'; }).join('') + '</div>' +
          '<p class="ev-note ev-postnote">' + esc(POSTURE[p.post].s) + '</p></div></section>';
      } else if (w === 2 || w === 6) h += '<p class="ev-note">Debate prep days in this week’s schedule count toward next week’s debate.</p>';
      var o = tipsOrder(G), addOpts = o.filter(function (i) { return p.rows.indexOf(i) < 0; }).map(function (i) { return '<option value="' + i + '">' + esc(U[i].nm) + ' · ' + Math.round(G.fc.tipU[i] * 100) + '% · ' + mTxt(G.sy * G.fmean[i]) + '</option>'; }).join('');
      h += '<section class="ev-sec"><h5 class="lk-kicker ev-h5">Ads and ' + K.term('ground', 'field offices') + ', contest by contest</h5>' +
        '<div class="btnrow ev-tools"><button type="button" class="ebtn2" data-act="suggest">Suggest a plan</button><button type="button" class="ebtn2" data-act="clearads">Clear the ads</button>' +
        '<label class="ev-add"><span class="vh">Add a contest to the plan</span><select class="ev-select" data-act="addrow"><option value="">Add a contest…</option>' + addOpts + '</select></label></div>' +
        '<p class="ev-note">The suggestion treats tipping odds as gospel; it does not know about the storm or the rival’s field program.' + (w > 1 ? ' Each week it re-paces every line you have not touched to the war chest; a line you set by hand keeps your number until you press Suggest a plan.' : '') + '</p>' +
        '<div class="ev-rows">' + p.rows.map(rowHTML).join('') + '</div></section>';
      h += '<section class="ev-sec"><h5 class="lk-kicker ev-h5">National ads</h5><div class="lk-field"><label for="evN-' + ctx.num + '">This week, everywhere at once</label><output class="lk-range-out ev-natout">' + money(p.nat) + '</output>' +
        '<input type="range" id="evN-' + ctx.num + '" data-nat="1" min="0" max="100" step="1" value="' + p.nat + '" aria-valuetext="' + p.nat + ' million dollars"></div><p class="ev-prev ev-natprev">' + esc(natPrev(p.nat)) + '</p></section>';
      h += '<section class="ev-sec"><h5 class="lk-kicker ev-h5">The candidates’ week</h5><div class="ev-sched">' +
        '<div class="ev-schcol"><p class="ev-schn">' + esc(PY().cand) + '</p>' + [0, 1, 2].map(function (j) { return slotHTML('c', j); }).join('') + '</div>' +
        '<div class="ev-schcol"><p class="ev-schn">' + esc(PY().vp) + ', running mate</p>' + [0, 1, 2].map(function (j) { return slotHTML('r', j); }).join('') + '</div></div>' +
        '<p class="ev-note">A candidate rally is worth about 0.3 points in that state, a little next door, and half of it is gone a week later. Suggested days follow the tipping odds.</p></section>';
      return h;
    }
    function wirePlan(p) {
      Array.prototype.forEach.call(p.querySelectorAll('.ev-lvl'), function (sg) {
        K.seg(sg, function (v) {
          var i = +sg.getAttribute('data-u');
          ui.plan.lvl[i] = +v;
          var fp = p.querySelector('[data-fprev="' + i + '"]');
          if (fp) fp.innerHTML = fieldPrev(i);
          updateBudget(); renderMapIfPlan();
        });
      });
      var ps = p.querySelector('.ev-post');
      if (ps) K.seg(ps, function (v) { ui.plan.post = v; var n = p.querySelector('.ev-postnote'); if (n) n.textContent = POSTURE[v].s; });
    }
    function renderMapIfPlan() { if (ui.lens === 'plan') renderMap(); }
    function updateBudget() {
      if (!G || ui.phase !== 'plan') return;
      var Y = G.S[G.side], ep = effPlan(G, ui.plan, Y), inf = inflow(G.fc.pWin) + fundsOf(ep), left = Y.cash - ep.total, p = panelEl(0);
      if (p) {
        var a = p.querySelector('.ev-planned'), b = p.querySelector('.ev-left'), c = p.querySelector('.ev-inflow');
        if (a) a.textContent = money(ep.total);
        if (c) c.textContent = '~' + money(inf);
        if (b) { b.textContent = left < 0 ? MINUS + money(-left) : money(left); b.parentNode.classList.toggle('is-bad', left < 0); }
      }
      renderActions(ep);
    }
    function renderActions(ep) {
      var el = body.querySelector('.ev-actions');
      if (!el || !G) return;
      var Y = G.S[G.side];
      ep = ep || effPlan(G, ui.plan, Y);
      var why = '', dis = ui.busy;
      if (ui.busy) why = 'Running 4,000 elections.';
      else if (G.evt && !ui.plan.ev) { why = 'Choose a response to this week’s news first.'; dis = true; }
      else if (ep.total > Y.cash + 1e-6) { why = 'Over budget by ' + money(ep.total - Y.cash) + '.'; dis = true; }
      else why = 'Planned ' + money(ep.total) + ' of ' + money(Y.cash) + '.';
      var cl = G.week === 9 ? 'Commit the final week' : 'Commit week ' + G.week;
      var rs = ui.restart;
      el.innerHTML = '<div class="btnrow ev-act"><button type="button" class="ebtn" data-act="commit"' + (dis ? ' disabled' : '') + '>' + cl + '</button>' +
        '<button type="button" class="ebtn2" data-act="undo">Undo changes</button><span class="ev-why" role="status">' + esc(why) + '</span></div>' +
        '<div class="btnrow ev-act2"><button type="button" class="ebtn2" data-act="replay">' + (rs === 'replay' ? 'Restart this map? Press again' : 'Replay this map') + '</button>' +
        '<button type="button" class="ebtn2" data-act="newmap">' + (rs === 'newmap' ? 'Leave this campaign? Press again' : 'New map') + '</button>' +
        '<span class="ev-seedl lk-num">Map #' + G.seed + (G.mir < 0 ? ' (mirrored)' : '') + '</span></div>';
    }

    function pollsHTML() {
      var last = 0, sel = ui.sel, list, kids = sel >= NU ? KIDS[CI[sel].id] : null, days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      G.polls.forEach(function (p) { if (p.w > last && p.w < G.week) last = p.w; });
      var all = ui.polAll && sel >= 0;
      list = G.polls.filter(function (p) {
        if (!(p.w < G.week || (p.outlier && p.w === G.week))) return false;
        return all ? (p.unit === sel || (kids && kids.indexOf(p.unit) >= 0)) : (p.w === last || p.w === G.week);
      });
      list.sort(function (a, b) { return (a.unit < 0 ? -1 : 0) - (b.unit < 0 ? -1 : 0) || (all ? b.w - a.w : 0) || (a.unit >= 0 && b.unit >= 0 ? U[a.unit].nm.localeCompare(U[b.unit].nm) : 0) || a.day - b.day; });
      var h = '<p class="lk-block ev-polhead">' + (last === 0 ? 'The Labor Day polls. ' : '') + 'Samples of 500 to 1,200 carry a ' + K.term('moe', 'margin of error') + ' of roughly ±3 to ±4.5 points on each share. The margin of error on the lead is about twice this. Each firm has a ' + K.term('housefx', 'house effect') + ', which the desk estimates and removes, and no poll sees the voters a field office turns out, because of the ' + K.term('lv', 'likely-voter screen') + '.</p>';
      h += '<div class="lk-seg ev-polseg" aria-label="Which polls"><button data-v="wk"' + (all ? '' : ' aria-checked="true"') + '>Latest week</button><button data-v="all"' + (all ? ' aria-checked="true"' : '') + (sel < 0 ? ' disabled' : '') + '>' + (sel >= 0 ? esc(CI[sel].nm) + ', every week' : 'Select a state first') + '</button></div>';
      if (!list.length) h += '<p class="ev-note">No polls ' + (all ? 'of ' + esc(CI[sel].nm) + ' yet. Pollsters go where the race is close.' : 'yet.') + '</p>';
      else {
        h += '<div class="lk-scroll"><table class="lk-table lk-table--stack ev-ptab"><thead><tr><th scope="col">Contest</th><th scope="col">Pollster</th><th scope="col">When</th><th scope="col">Sample</th><th scope="col">MOE</th><th scope="col">Result</th><th scope="col">Adjusted</th></tr></thead><tbody>' +
          list.map(function (p) {
            var yY = G.sy * p.y, adj = G.sy * (p.y - G.hEst[p.k]);
            return '<tr' + (p.outlier ? ' class="is-sel"' : '') + '><td>' + (p.unit < 0 ? 'National' : esc(U[p.unit].nm)) + '</td><td data-l="Pollster"><button type="button" class="ev-pl" data-act="pk" data-k="' + p.k + '" aria-pressed="' + (ui.pk === p.k) + '">' + esc(POLLSTERS[p.k].nm) + '</button></td>' +
              '<td data-l="When">W' + (p.w || 0) + ' · ' + days[p.day] + '</td><td data-l="Sample">' + F.n(p.n) + '</td><td data-l="MOE">±' + p.moe.toFixed(1) + '</td>' +
              '<td data-l="Result">Lantern ' + p.sL + ', Compass ' + p.sC + ' <span class="ev-dim">(' + mTxt(yY) + ')</span></td><td data-l="Adjusted">' + mTxt(adj) + '</td></tr>';
          }).join('') + '</tbody></table></div>';
      }
      if (ui.pk >= 0) {
        var P = POLLSTERS[ui.pk], he = G.hEst[ui.pk], n = G.polls.filter(function (p) { return p.k === ui.pk && p.w < G.week; }).length;
        h += '<div class="lk-card ev-pk"><p class="lk-kicker">' + esc(P.nm) + '</p><p>' + esc(cap(P.mode)) + ', samples of ' + F.n(P.n) + (P.x ? ', and an opt-in panel adds noise of its own' : '') + '. After ' + n + ' ' + (n === 1 ? 'poll' : 'polls') + ', the desk estimates its lean at ' +
          (Math.abs(he) < 0.05 ? 'nothing measurable' : Math.abs(he).toFixed(1) + ' points toward ' + (he > 0 ? 'Lantern' : 'Compass')) + ' and subtracts it. The estimate starts at zero and moves only as evidence piles up, because four polls of prior skepticism are built in.</p></div>';
      }
      return h;
    }
    function fcHTML() {
      var fc = G.fc, tie = fc.pTie > 0 ? F.oneIn(fc.pTie) : 'under 1 in 4,000', o = [], k;
      for (k = 0; k < 56; k++) o.push(k);
      o.sort(function (a, b) { return fc.tip[b] - fc.tip[a]; });
      var bias = fc.bias;
      var h = '<div class="ev-fcbig"><span class="ev-pw lk-num">' + F.prob(fc.pWin) + '</span><span class="ev-pwl">chance you reach 270, in 4,000 simulated elections that each draw a fresh ' + K.term('corr', 'correlated polling error') + ', weeks of drift and Election Day noise</span></div>' +
        '<div class="btnrow"><button type="button" class="ebtn2" data-act="indep" aria-expanded="' + ui.indShown + '">What if state errors were independent?</button></div>' +
        (ui.indShown ? '<p class="ev-ind">If each state’s polling error were its own coin, the same polls would give you ' + F.prob(fc.pInd) + '. They are not: similar states miss together, so the honest number is ' + F.prob(fc.pWin) + '. ' +
          (Math.abs(fc.pInd - fc.pWin) < 0.03 ? 'This week the two happen to agree.' : fc.pInd > fc.pWin === fc.pWin > 0.5 ? 'Treating states as independent would make the leader look safer than it is.' : 'Treating states as independent would make the trailer look more hopeless than it is.') + '</p>' : '') +
        '<canvas class="lk-chart ev-hist" aria-hidden="true"></canvas><p class="vh ev-histvh"></p>' +
        '<div class="lk-stats"><div class="lk-stat"><span class="lk-k">Median electors</span><span class="lk-v">' + fc.evMed + '</span></div>' +
        '<div class="lk-stat"><span class="lk-k">Eight in ten land</span><span class="lk-v">' + fc.ev10 + ' to ' + fc.ev90 + '</span></div>' +
        '<div class="lk-stat"><span class="lk-k">A 269 to 269 tie</span><span class="lk-v">' + tie + '</span></div>' +
        '<div class="lk-stat"><span class="lk-k">You win the college, lose the vote</span><span class="lk-v">' + F.prob(fc.pInvW) + '</span></div>' +
        '<div class="lk-stat"><span class="lk-k">You win the vote, lose the college</span><span class="lk-v">' + F.prob(fc.pInvL) + '</span></div></div>' +
        '<p class="ev-note lk-block">The last two are ' + K.term('inversion', 'inversions') + ': the popular vote and the college disagree. The college only ever counts the second.</p>' +
        '<h5 class="lk-kicker ev-h5">Most likely ' + K.term('tip', 'tipping points') + '</h5><ul class="ev-bars">' + o.slice(0, 5).map(function (c) {
          return '<li><span class="ev-bl">' + esc(CI[c].nm) + ' <span class="lk-num ev-dim">' + mTxt(G.sy * fmC(c)) + '</span></span><span class="lk-bar lk-bar--foil"><i style="--w:' + Math.min(1, fc.tip[c] / Math.max(0.01, fc.tip[o[0]])).toFixed(3) + '"></i></span><span class="lk-num ev-bv">' + Math.round(fc.tip[c] * 100) + '%</span></li>'; }).join('') + '</ul>' +
        '<p class="lk-block">' + K.term('bias', 'Map bias') + ': the tipping point sits at ' + mTxt(fc.tipAvg) + ' while the popular vote sits at ' + mTxt(fc.natAvg) + '. ' +
        (Math.abs(bias) < 0.3 ? 'This map barely favors anyone.' : bias > 0 ? 'You could lose the popular vote by up to ' + bias.toFixed(1) + ' points and still win.' : 'You need to win the popular vote by about ' + (-bias).toFixed(1) + ' points just to break even in the college.') + '</p>' +
        '<p class="ev-note">Week by week: ' + G.fcHist.map(function (f) { return (f.w ? 'W' + f.w : 'Start') + ' ' + F.prob(f.pWin); }).join(' · ') + '.</p>';
      return h;
    }
    function paintHist() {
      var cv = body.querySelector('.ev-hist');
      if (!cv || !G || !G.fc) return;
      var f = K.fitCanvas(cv, 150), x = f.ctx, Wd = f.W, H = 150;
      if (!(Wd > 0)) return;
      x.clearRect(0, 0, Wd, H);
      var hs = G.fc.hist, mx = 1, i, L = 10, R = Wd - 10, T = 22, B = H - 24;
      for (i = 0; i < 54; i++) mx = Math.max(mx, hs[i]);
      var bw = (R - L) / 54;
      for (i = 0; i < 54; i++) {
        if (!hs[i]) continue;
        var h = (B - T) * hs[i] / mx, win = i * 10 >= 270 || (i === 26 && false);
        x.fillStyle = win ? K.inkColor(0.8) : K.inkColor(0.22);
        x.fillRect(L + i * bw + 0.5, B - h, Math.max(1, bw - 1), h);
      }
      var m270 = L + 27 * bw;
      x.strokeStyle = K.inkColor(0.85); x.setLineDash([3, 3]); x.lineWidth = 1; x.beginPath(); x.moveTo(Math.round(m270) + 0.5, T - 8); x.lineTo(Math.round(m270) + 0.5, B); x.stroke(); x.setLineDash([]);
      K.cvText(x, '270', m270 + 4, T - 8, { px: 11, color: K.inkColor(0.85) });
      x.strokeStyle = K.inkColor(0.3); x.beginPath(); x.moveTo(L, B + 0.5); x.lineTo(R, B + 0.5); x.stroke();
      [0, 100, 200, 300, 400, 538].forEach(function (v) { K.cvText(x, String(v), L + (v / 10) * bw, H - 8, { px: 11, align: v === 0 ? 'left' : v === 538 ? 'right' : 'center' }); });
      K.cvText(x, 'Your electors, 4,000 elections', L, 12, { px: 11 });
      var vh = body.querySelector('.ev-histvh');
      if (vh) vh.textContent = 'Histogram of your electoral votes across 4,000 simulations: median ' + G.fc.evMed + ', eight in ten between ' + G.fc.ev10 + ' and ' + G.fc.ev90 + ', ' + F.prob(G.fc.pWin) + ' at 270 or more.';
    }
    function dossierHTML() {
      var c = ui.sel >= 0 ? ui.sel : G.fc.tipC, e = CI[c], isU = c < NU, Y = G.S[G.side], R = G.S[G.riv];
      var rule = ruleOf(c), real = !!EV_RECOUNT[e.st], sc = EV_SEATCHG[e.st];
      function row(k, v) { return '<dt>' + k + '</dt><dd>' + v + '</dd>'; }
      var h = '<div class="ev-dos"><p class="lk-kicker">' + (ui.sel < 0 ? 'The most likely tipping point' : 'The dossier') + '</p><h5 class="ev-dosh">' + esc(e.nm) + ' · ' + e.ev + ' ' + (e.ev === 1 ? 'elector' : 'electors') + ' · polls close ' + closeTxt(e.cl) + '</h5><dl class="ev-dl lk-block">';
      h += row('Poll average', isU ? mTxt(G.sy * G.avg[c].mean) + ' <span class="ev-dim">± ' + G.avg[c].sd.toFixed(1) + ', ' + G.avg[c].np + ' ' + (G.avg[c].np === 1 ? 'poll' : 'polls') + '</span>' : mTxt(G.sy * avgC(c)));
      h += row('Desk’s estimate', mTxt(G.sy * fmC(c)) + ' <span class="ev-dim">(adds what polls cannot see)</span>');
      h += row(K.term('tip', 'Tipping odds'), Math.round(tipT(c) * 100) + '%');
      h += row(K.term('power', 'Voter power'), powTxt(powT(c)));
      h += row('Last time', mTxt(G.sy * G.lastU[c]));
      h += row('Real 2024 turnout', e.to.toFixed(1) + '% of ' + F.n(e.vep * 1000) + ' eligible voters' + (isU && U[c].par ? ' <span class="ev-dim">(the state’s rate; the district split is modeled)</span>' : ''));
      h += row('Urban share', e.ur.toFixed(1) + '%' + (isU && U[c].par ? ' <span class="ev-dim">(stylized)</span>' : ''));
      h += row('Adults with a degree', e.ba.toFixed(1) + '%' + (isU && U[c].par ? ' <span class="ev-dim">(stylized)</span>' : ''));
      if (isU) {
        h += row('Persuadable', piTxt(G.pi[c]));
        h += row(K.term('headroom', 'Headroom'), hdTxt(G.hd[G.side][c]));
        h += row('Ad stock', 'You +' + Y.A[c].toFixed(2) + ' · them +' + R.A[c].toFixed(2) + ' <span class="ev-dim">(theirs is Spotline’s estimate)</span>');
        h += row('Field offices', 'You ' + (Y.lvl[c] ? 'level ' + Y.lvl[c] : 'none') + ' · them ' + (G.tracker.lvl[c] ? 'level ' + G.tracker.lvl[c] : 'none seen'));
        h += row('Visits this cycle', 'You +' + Y.V[c].toFixed(2) + ' still in the air');
        var tw = twins(U[c].par ? c : c).filter(function (t) { return t.j !== c; });
        h += row(K.term('corr', 'Moves with'), tw.slice(0, 3).map(function (t) { return esc(U[t.j].nm) + ' ' + t.r.toFixed(2); }).join(', '));
        h += row('Least like it', esc(U[tw[tw.length - 1].j].nm) + ' ' + tw[tw.length - 1].r.toFixed(2));
      }
      h += row('The count', esc(PROF[e.pf].nm) + '. ' + esc(PROF[e.pf].d) + (G.slow[c] ? ' A lawsuit left the mail count here starting a day late.' : ''));
      h += row('Recount rule', esc(cap(rule[0] === 'auto' ? 'automatic ' + rule[1] : rule[1])) + ' <span class="ev-dim">(' + (real ? 'state law' : 'a model default, not this state’s law') + ')</span>');
      if (!(isU && U[c].par)) h += row('Electors per million residents', (e.stEv / (e.ap / 1000)).toFixed(1) + (sc ? ' <span class="ev-dim">(' + (sc > 0 ? 'gained ' + sc : 'lost ' + (-sc)) + ' House ' + (Math.abs(sc) === 1 ? 'seat' : 'seats') + ' in the 2020 apportionment)</span>' : ''));
      h += '</dl>';
      if (c >= NU || (isU && U[c].par)) {
        var st = isU ? U[c].par : e.id;
        h += '<p class="ev-note">' + esc(CI[CONT[st]].stNm) + ' splits its electors: two to the statewide winner, one per district.</p><div class="ev-dbtns">' + [CONT[st]].concat(KIDS[st]).map(function (k) { return '<button type="button" class="ev-dbtn" data-act="sel" data-c="' + k + '" aria-pressed="' + (c === k) + '">' + esc(k >= NU ? 'Statewide' : U[k].nm) + '</button>'; }).join('') + '</div>';
      }
      if (isU) h += '<div class="btnrow"><button type="button" class="ebtn2" data-act="addsel"' + (ui.plan.rows.indexOf(c) >= 0 ? ' disabled>In this week’s plan' : '>Add to this week’s plan') + '</button></div>';
      return h + '</div>';
    }

    /* ---------- a week goes by ---------- */
    function commit() {
      if (ui.busy || !G || ui.phase !== 'plan') return;
      var Y = G.S[G.side], ep = effPlan(G, ui.plan, Y);
      if (G.evt && !ui.plan.ev) return;
      if (ep.total > Y.cash + 1e-6) return;
      var w = G.week, hadOffices = 0, i, newOff = false, cashBefore = Y.cash;
      for (i = 0; i < NU; i++) { if (Y.lvl[i] > 0) hadOffices++; if (ui.plan.lvl[i] > 0 && Y.lvl[i] === 0) newOff = true; }
      ui.busy = true; ui.restart = 0;
      renderActions(ep);
      var aBefore = Float64Array.from(Y.A), stBefore = G.fc.tipAvg;
      var res;
      try { res = commitA(G, ui.plan, say); } catch (e) { snag(e); return; }
      if (ep.adT > 0) unlock('persuade', 'Week ' + w + ', your first ad buy');
      if (newOff || (G.evt && G.evt.t === 'REGDRIVE' && ui.plan.ev === 'Y')) unlock('turnout', 'Week ' + w + ', ' + (newOff ? 'your first field office' : 'the registration drive'));
      if (ep.c.concat(ep.r).some(function (s) { return s.charAt(0) === 'r'; })) unlock('where', 'Week ' + w + ', the first rally');
      var g0 = G;
      forecastAsync(G, function () {
        if (g0 !== G) return;
        try { afterWeek(w, res, ep, aBefore); } catch (e) { snag(e); }
      }, snag);
    }
    function afterWeek(w, res, ep, aBefore) {
      var Y = G.S[G.side], fc = G.fc, i;
      commitB(G);
      ui.busy = false;
      say('WEEK', 'Week ' + w + ' is in the books.');
      var nAd = 0; for (i = 0; i < NU; i++) if (ep.ads[i] > 0) nAd++;
      var offices = 0; for (i = 0; i < NU; i++) if (Y.lvl[i] > 0) offices++;
      say('YOU', money(ep.adT + ep.nat) + ' on ads' + (nAd ? ' in ' + nAd + ' ' + (nAd === 1 ? 'contest' : 'contests') : '') + (ep.nat ? ', ' + money(ep.nat) + ' of it national' : '') + ', ' + offices + ' field ' + (offices === 1 ? 'office' : 'offices') + ', message: ' + MSG[ep.msg].nm.toLowerCase() + '.');
      if (res.deb) {
        var d = res.deb, who = d.inst >= 50 ? (d.pres ? PY().cs : PY().vs) : (d.pres ? PT().cs : PT().vs), pct = Math.round(d.inst >= 50 ? d.inst : 100 - d.inst);
        say('WIRE', 'Instant poll: ' + pct + ' percent say ' + who + ' won the ' + (d.pres ? 'debate' : 'running mates’ debate') + '. Instant polls measure the debate, not the vote.');
        say('DATA', 'Nadia’s estimate: the debate moved the race about ' + Math.abs(d.D).toFixed(2) + ' points ' + (d.D * 1 >= 0 ? 'your way' : 'their way') + ', and a third of that will be gone in a week.');
        if (d.pres) unlock('debates', 'The ' + (w === 3 ? 'first' : 'last') + ' debate');
      }
      var trk = [];
      for (i = 0; i < NU; i++) if (G.tracker.ads[i] > 0) trk.push(i);
      trk.sort(function (a, b) { return G.tracker.ads[b] - G.tracker.ads[a]; });
      if (trk.length) say('TRACKER', 'Spotline: the other campaign spent ' + money(G.tracker.ads[trk[0]]) + ' in ' + sNm(trk[0]) + (trk[1] != null ? ' and ' + money(G.tracker.ads[trk[1]]) + ' in ' + sNm(trk[1]) : '') + ' last week. They have ' + G.tracker.offices + ' field ' + (G.tracker.offices === 1 ? 'office' : 'offices') + ', by our count.');
      var feint = trk.filter(function (u) { return G.sy * G.fmean[u] > 6 && G.tracker.ads[u] >= 5; })[0];
      if (feint != null && once('feint:' + feint)) say('RIVAL', PT().cs + ' campaign: “We are expanding the map.” Spotline has them at ' + money(G.tracker.ads[feint]) + ' in ' + sNm(feint) + ', which is either confidence or a feint.');
      var tc = fc.tipC, tcu = tipUnitOf(tc), safe = -1, lo = 1e9;
      for (i = 0; i < 49; i++) if (G.sy * G.fmean[i] > 12 && G.fc.power[i] < lo) { lo = G.fc.power[i]; safe = i; }
      var ratio = safe >= 0 ? powT(tc) / Math.max(0.05, G.fc.power[safe]) : 0, rTxt = ratio > 50 ? 'more than fifty' : String(Math.round(ratio));
      say('DATA', 'The likeliest tipping point in our 4,000 simulations is ' + sNm(tc) + ' (' + Math.round(fc.tip[tc] * 100) + ' percent of them), where our average is ' + mTxt(G.sy * fmC(tc)) + '.' + (safe >= 0 && ratio > 3 && once('ratio:' + tc + ':' + safe + ':' + rTxt) ? ' On our numbers a vote there is worth ' + rTxt + ' times a vote in ' + sNm(safe) + '.' : ''));
      var big = -1, bx = 0;
      for (i = 0; i < NU; i++) if (ep.ads[i] > bx) { bx = ep.ads[i]; big = i; }
      if (big >= 0 && w % 2 === 1) say('DATA', 'Last week’s ' + U[big].nm + ' buy added about ' + (Y.A[big] - 0.5 * aBefore[big]).toFixed(2) + ' points. Half of that will be gone by next Tuesday, and every ad buy fades the same way.');
      var leads = compList(G, 12).filter(function (u) { return G.sy * G.fmean[u] > 0 && G.sy * G.fmean[u] < 5; });
      if (w % 2 === 0 && leads.length >= 3 && rho(leads[0], leads[1]) > 0.62 && rho(leads[0], leads[2]) > 0.62) {
        say('DATA', 'We lead in ' + U[leads[0]].nm + ', ' + U[leads[1]].nm + ' and ' + U[leads[2]].nm + '. Do not count them as three coin flips. They are the same kind of state; if the polls are wrong about one, they are probably wrong about all three.');
        unlock('corr', 'The wire, week ' + w);
      }
      if (Math.abs(fc.pInd - fc.pWin) > 0.1 && (w === 3 || w === 6)) say('DATA', 'If state errors were independent we would be at ' + F.prob(fc.pInd) + '. They are not, so we are at ' + F.prob(fc.pWin) + '.');
      var fo = -1, fl = 0;
      for (i = 0; i < NU; i++) if (Y.lvl[i] * U[i].vepM > fl) { fl = Y.lvl[i] * U[i].vepM; fo = i; }
      var doors = fo >= 0 ? Math.round(Y.lvl[fo] * U[fo].vepM * 11) : 0;
      if (fo >= 0 && G.week <= 9 && once('field:' + fo + ':' + doors)) say('FIELD', F.n(doors) + ' thousand doors a week in ' + sNm(fo) + ' now. None of them show up in public polls, which only measure who they think will vote.');
      if (G.week === 8) say('FIELD', 'Too late to open new offices. What we have is what we have.');
      if (w === 1) unlock('moe', 'Week 2');
      if (G.week > 9) { enterNight(); return; }
      weekNotes();
      ui.plan = defaultPlan();
      renderCampaign(true);
    }

    /* ---------- election night: the dark desk ---------- */
    function nsay(tag, txt, x) { G.nfeed.push({ tag: tag, txt: txt, x: x || '' }); }
    function partyWord(s) { return PARTY[s > 0 ? 'L' : 'C'].sh; }
    function listNames(a) { return a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
    function enterNight() {
      electionDay(G);
      G.nfeed = [];
      ui.phase = 'night'; ui.auto = false; ui.prompt = null; ui.nsel = G.fc.tipC; ui.nfeedN = 0;
      unlock('count', 'Election night');
      var first = G.night.c.filter(function (d) { return d.cl === 19 && (d.c < NU ? !U[d.c].par : false); }).map(function (d) { return CI[d.c].nm; });
      nsay('DESK', 'Good evening from the Tally Desk. By 7:00 p.m. ET every poll has closed in ' + listNames(first) + (first.indexOf('Indiana') >= 0 || first.indexOf('Kentucky') >= 0 ? ' (most of Indiana and Kentucky closed an hour earlier)' : '') + '. Every call tonight is a projection; the states certify results weeks from now.');
      nightLines(19, []);
      renderNight(true);
    }
    function nightLines(prevT, newCalls) {
      var N = G.night, T = N.T;
      var closing = [];
      N.c.forEach(function (d) { if (d.cl > prevT && d.cl <= T && !(d.c < NU && U[d.c].par) && prevT >= 19) closing.push(d.c < NU ? sNm(d.c) : CI[d.c].stNm); });
      if (closing.length) nsay('DESK', 'Polls have closed in ' + listNames(closing) + '.');
      var safeL = [], safeC = [], other = [];
      newCalls.forEach(function (c) {
        var d = N.c[c];
        if (d.callT - d.cl <= 0.26 && Math.abs(d.pre) >= 10) (d.called > 0 ? safeL : safeC).push(sNm(c));
        else other.push(c);
      });
      if (safeL.length) nsay('DESK', 'We can project Lantern wins ' + listNames(safeL) + ' on the strength of pre-election data and early returns.');
      if (safeC.length) nsay('DESK', 'We can project Compass wins ' + listNames(safeC) + ' on the strength of pre-election data and early returns.');
      var oL = other.filter(function (c) { return N.c[c].called > 0; }).map(sNm), oC = other.filter(function (c) { return N.c[c].called < 0; }).map(sNm);
      if (oL.length) nsay('DESK', 'We project Lantern wins ' + listNames(oL) + '.');
      if (oC.length) nsay('DESK', 'We project Compass wins ' + listNames(oC) + '.');
      if (newCalls.length) unlock('calls', 'Election night, ' + clockTxt(T));
      if (T < 36 && Math.abs(T - Math.round(T)) < 0.01 && T >= 21) {
        var best = null, bw = -1;
        N.c.forEach(function (d) {
          if (d.called || T < d.cl) return;
          var o = counted(d, T), p = (o.L + o.C) / d.tot;
          if (p <= 0.05 || p >= 0.97) return;
          var wt = tipT(d.c) + 0.001 * EV56[d.c];
          if (wt > bw) { bw = wt; best = { d: d, o: o, p: p }; }
        });
        if (best) {
          var d = best.d, o = best.o, rem = [0, 1, 2].map(function (t) { return d.L[t] + d.C[t] - o.cL[t] - o.cC[t]; }), mt = 0;
          for (var t = 1; t < 3; t++) if (rem[t] > rem[mt]) mt = t;
          var seen = o.cL[mt] + o.cC[mt] > 0.1 * (d.L[mt] + d.C[mt]);
          var tm = d.L[mt] + d.C[mt] > 0 ? (seen ? (o.cL[mt] - o.cC[mt]) : (d.off[mt] + d.pre)) : 0;
          var ld = Math.abs((o.L - o.C) / (o.L + o.C) * 100);
          var early = cap(sNm(d.c)) + ' is too early to call. ' + partyWord(o.L - o.C) + ' leads by ' + (ld >= 0.05 ? ld.toFixed(1) : ld >= 0.005 ? ld.toFixed(2) : 'a hair') + ' with ' + Math.round(best.p * 100) + ' percent of the expected vote counted; most of what is left is ' + TYPE_LC[mt] + ' ballots, ' + (seen ? 'which have favored ' : 'which the desk expects to favor ') + partyWord(tm) + '.';
          if (early !== N.lastEarly) { N.lastEarly = early; nsay('DESK', early); }
        }
      }
      if (N.proj && !N.projSaid) {
        N.projSaid = true;
        nsay('DESK', partyWord(N.proj === 'you' ? G.sy : -G.sy) + ' has won the presidency, on our projection. States certify results later; this is a projection, not a result.');
        if (N.proj === 'them' && !N.concede) { ui.prompt = 'concede'; nsay('MANAGER', 'Ruth: the networks have projected the other ticket. The candidate has to say something tonight.', promptBtns('concede')); }
        else if (N.proj === 'you') nsay('RIVAL', PT().cs + ' calls ' + PY().cs + ' to concede. The call is short and gracious, which is the whole job of the call.');
      }
      if (T >= 23 && !N.speechAsked && ui.prompt !== 'concede' && !N.concede) {
        N.speechAsked = true;
        var ev = calledEV(G), open = N.c.filter(function (dd) { return !dd.called; });
        ui.prompt = 'speech';
        nsay('MANAGER', 'The networks want the candidate on camera. ' + open.length + ' ' + (open.length === 1 ? 'contest is' : 'contests are') + ' uncalled and ' + (open.length === 1 ? 'it holds ' : 'they hold ') + ev.open + ' electors. What does the candidate say?', promptBtns('speech'));
      }
      if (N.done && !N.heldSaid) {
        N.heldSaid = true;
        N.c.forEach(function (dd) { if (!dd.called) nsay('DESK', CI[dd.c].nm + ' is too close to call. It goes to the canvass and probably a recount.'); });
      }
    }
    function promptBtns(k) {
      var o = k === 'speech' ? [['count', 'Every ballot gets counted, and we like where we stand.'], ['claim', 'We have won this election.'], ['home', 'Nothing tonight. The candidate goes home.']]
        : [['now', 'Concede tonight'], ['later', 'Concede after the canvass']];
      return '<span class="ev-prompt">' + o.map(function (x) { return '<button type="button" class="lk-opt ev-pbtn" data-act="prompt" data-p="' + k + '" data-k="' + x[0] + '"><span class="lk-opt-l">' + esc(x[1]) + '</span></button>'; }).join('') + '</span>';
    }
    function answer(p, k) {
      var N = G.night;
      if (p === 'speech') {
        N.speech = k; N.speechEV = calledEV(G).you;
        nsay('YOU', k === 'count' ? PY().cs + ': “Every ballot gets counted, and we like where we stand.”' : k === 'claim' ? PY().cs + ': “We have won this election.”' : 'The candidate goes home without speaking. The networks run the empty podium for a while.');
        if (k === 'claim' && N.speechEV < 270) nsay('DESK', 'For the record: neither ticket has 270 on our projections. A claim of victory does not change a single count.');
      } else {
        N.concede = k;
        nsay('YOU', k === 'now' ? PY().cs + ' calls ' + PT().cs + ' to concede, then speaks to supporters.' : PY().cs + ' will wait for the canvass and says so plainly: the count will finish, and the candidate will accept it.');
      }
      ui.prompt = null;
      if (p === 'speech' && N.proj === 'them' && !N.concede) { ui.prompt = 'concede'; nsay('MANAGER', 'Ruth: the networks have projected the other ticket. The candidate has to say something tonight.', promptBtns('concede')); }
      renderNightParts();
      var b = body.querySelector('.ev-nfeed .ev-pbtn:not([disabled])');
      if (b && ui.prompt) K.focus(b); else { var pl = body.querySelector('.ev-nctl .ebtn, .ev-nctl .ebtn2'); if (pl) K.focus(pl); }
      if (ui.auto) schedule();
    }
    function step() {
      var N = G.night;
      if (N.done || ui.prompt) return false;
      var prev = N.T;
      if (!nightStep(G)) return false;
      nightLines(prev, N.calls.filter(function (c) { return c.T === N.T; }).map(function (c) { return c.c; }));
      return true;
    }
    function advance(cond) {
      var guard = 0;
      while (guard++ < 80 && !G.night.done && !ui.prompt && cond()) { if (!step()) break; }
      renderNightParts();
      if (ui.prompt) { var b = body.querySelector('.ev-nfeed .ev-pbtn'); if (b) K.focus(b); }
    }
    function stopAuto() { ui.auto = false; clearTimeout(ui.timer); ui.timer = 0; }
    function schedule() {
      clearTimeout(ui.timer); ui.timer = 0;
      if (!ui.auto || !G || ui.phase !== 'night' || !ui.visible || document.hidden || ui.prompt || G.night.done || RM()) return;
      ui.timer = setTimeout(K.guard(function () { ui.timer = 0; if (step()) renderNightParts(); schedule(); }, SLUG), 1100);
    }
    function renderNight(focus) {
      root.setAttribute('data-ev-side', G.side);
      body.innerHTML = '<div class="lk-desk ev-night ev-stage ev-stage--night" data-ground="espresso">' +
        '<div class="lk-head ev-sa-head"><p class="lk-kicker"><i class="ev-live" aria-hidden="true"></i>Election night · ' + esc(PY().cand) + ' for ' + esc(PY().sh) + '</p><h4 class="lk-title ev-focus" tabindex="-1">The count</h4>' +
        '<p class="lk-lede">Results arrive state by state, in the order polls close and in the order each state counts: mail first here, in-person first there, a late tail over days in others. The early lead mostly tells you who counted first. ' + K.term('preproc', 'Pre-processing') + ' rules decide a lot of it.</p></div>' +
        '<div class="ev-sa-num">' + splitHTML(0, 0, 'Called electors', G.side) + '<p class="vh ev-evvh"></p><ol class="ledger ledger--data ev-ledger ev-nstrip"></ol></div>' +
        '<div class="btnrow ev-nctl ev-sa-ctl"></div>' +
        '<div class="ev-sa-map"><div class="ev-mapbar ev-mapbar--n">' + v3Seg() + '</div><div class="ev-3dslot"></div><div class="ev-nmapw"></div></div>' +
        '<div class="ev-sa-feed"><h5 class="lk-kicker ev-h5">The desk</h5><div class="lk-feed ev-feed ev-nfeed" aria-live="polite" aria-relevant="additions"></div></div>' +
        '<div class="ev-nsel ev-sa-sel"></div>' +
        '<div class="ev-ncols ev-sa-low"><div><h5 class="lk-kicker ev-h5">' + K.term('call', 'Calls') + '</h5><ol class="ev-calll"></ol></div><div><h5 class="lk-kicker ev-h5">Paths to 270</h5><div class="ev-pathb"></div></div></div>' +
        '</div>';
      ui.nfeedN = 0;
      renderNightParts();
      v3Wire();
      if (focus) K.focus(body.querySelector('.ev-focus'), { scroll: true });
    }
    function nightTile(t) {
      var N = G.night, T = N.T, d = N.c[t.c], h = T - d.cl, cls = '', val = '', lab = t.nm + ', ' + t.ev + ' electors, ';
      if (h < 0) { cls = 'is-wait'; lab += 'polls close at ' + hr(d.cl); }
      else if (d.called) { cls = partyCls(d.fin) + ' is-called'; val = '✓'; lab += 'called for ' + (d.called === G.sy ? 'you' : 'them'); }
      else {
        var o = counted(d, T), p = (o.L + o.C) / d.tot, m = o.L + o.C > 0 ? (o.L - o.C) / (o.L + o.C) * 100 : 0;
        if (N.done) { cls = 'is-held'; lab += 'too close to call'; }
        else if (o.L + o.C > 0) { cls = 'is-count ' + (m >= 0 ? 'lead-L' : 'lead-C'); lab += Math.round(p * 100) + ' percent counted, ' + mTxt(G.sy * m).replace('+', 'plus '); }
        else { cls = 'is-count'; lab += 'polls closed, nothing counted yet'; }
        val = o.L + o.C > 0 ? mS(G.sy * m) : '';
        return tileHTMLn(t, cls, val, lab, p);
      }
      return tileHTMLn(t, cls, val, lab, h < 0 ? 0 : 1);
    }
    function tileHTMLn(t, cls, val, lab, p) {
      var N = G.night, sel = ui.nsel === t.c || (t.kids && t.kids.indexOf(ui.nsel) >= 0);
      var ds = t.kids ? '<span class="ev-ds" aria-hidden="true">' + t.kids.map(function (k) { var d = N.c[k]; return '<i class="' + (d.called ? partyCls(d.fin) : N.T >= d.cl ? 'ev-I1' : 'ev-I0') + '"></i>'; }).join('') + '</span>' : '';
      return tileHTML(t, cls + (sel ? ' is-sel' : ''), val, lab, ds + '<span class="ev-prog" style="--p:' + p.toFixed(3) + '"></span>');
    }
    function renderNightParts() {
      if (!G || !G.night) return;
      var N = G.night, T = N.T, ev = calledEV(G), tot = nightTotals(G);
      var st = body.querySelector('.ev-nstrip');
      if (!st) return;
      st.innerHTML = ledRow('Clock', esc(clockTxt(T))) + ledRow('Called electors', 'You ' + ev.you + ' · them ' + ev.them) +
        ledRow('Popular vote so far', mTxt(tot.mY)) + ledRow('Expected vote counted', Math.round(tot.pct * 100) + '%');
      var bp = byParty(ev.you, ev.them);
      splitSet(body.querySelector('.ev-night .ev-split'), bp.L, bp.C);
      var vv = body.querySelector('.ev-evvh');
      if (vv) vv.textContent = 'Called: you ' + ev.you + ', them ' + ev.them + ', ' + ev.open + ' uncalled. 270 to win.';
      var mw = body.querySelector('.ev-nmapw');
      mw.innerHTML = mapShell(TILES.map(nightTile).join(''), 'Election night map. Arrow keys move; Enter shows a state’s count.', true) +
        '<div class="ev-legend" aria-hidden="true"><span><i class="ev-L4"></i>Lantern called</span><span><i class="ev-C4"></i>Compass called</span><span class="ev-lg-s">An outline is still counting, its bar the share counted; a dotted edge means polls are still open.</span></div>';
      roving(mw.querySelector('.ev-map'), ui.nsel >= NU || (ui.nsel >= 0 && !U[ui.nsel].par) ? ui.nsel : CONT[U[ui.nsel].par]);
      var cl = body.querySelector('.ev-calll');
      cl.innerHTML = N.calls.length ? N.calls.slice().reverse().slice(0, 14).map(function (c) { return '<li><span class="lk-num">' + esc(c.T >= 36 ? clockTxt(c.T) : hr(c.T)) + '</span> ' + esc(CI[c.c].nm) + ' <span class="ev-dim">' + (c.s === G.sy ? 'you' : 'them') + ', ' + EV56[c.c] + '</span></li>'; }).join('') + (N.calls.length > 14 ? '<li class="ev-dim">and ' + (N.calls.length - 14) + ' earlier</li>' : '') : '<li class="ev-dim">No calls yet.</li>';
      var pb = body.querySelector('.ev-pathb'), P = paths(G);
      pb.innerHTML = P.early ? '<p>Too early: ' + P.open + ' contests uncalled.</p>' : !P.open ? '<p>Every contest is called.</p>' :
        '<p class="lk-num">You: ' + F.n(P.you) + ' ' + (P.you === 1 ? 'path' : 'paths') + (P.mustYou.length && P.you ? '. Must-win: ' + esc(P.mustYou.map(function (c) { return CI[c].nm; }).join(', ')) : '') + '.</p>' +
        '<p class="lk-num">Them: ' + F.n(P.them) + ' ' + (P.them === 1 ? 'path' : 'paths') + (P.mustThem.length && P.them ? '. Must-win: ' + esc(P.mustThem.map(function (c) { return CI[c].nm; }).join(', ')) : '') + '.</p>' +
        '<p class="ev-dim">Out of ' + F.n(Math.pow(2, P.open)) + ' ways the ' + P.open + ' uncalled contests could fall.</p>';
      renderNsel();
      var f = body.querySelector('.ev-nfeed'), add = '';
      for (var i = ui.nfeedN; i < G.nfeed.length; i++) { var l = G.nfeed[i]; add += '<p class="lk-line">' + chip(l.tag) + esc(l.txt) + (l.x ? ' ' + l.x : '') + '</p>'; }
      if (add) f.insertAdjacentHTML('beforeend', add);
      ui.nfeedN = G.nfeed.length;
      Array.prototype.forEach.call(f.querySelectorAll('.ev-pbtn'), function (b) { var live = ui.prompt && b.getAttribute('data-p') === ui.prompt && !b.closest('.lk-line').nextElementSibling; b.disabled = !live; });
      f.scrollTop = f.scrollHeight;
      var ctl = body.querySelector('.ev-nctl'), rm = RM(), pend = !!ui.prompt, dn = N.done;
      ctl.innerHTML = dn ? '<button type="button" class="ebtn" data-act="post">The count is complete. Go to the canvass</button>' :
        '<button type="button" class="ebtn" data-act="play" aria-pressed="' + ui.auto + '"' + (rm || pend ? ' disabled' : '') + '>' + (ui.auto ? 'Pause' : 'Play') + '</button>' +
        '<button type="button" class="ebtn2" data-act="nstep"' + (pend ? ' disabled' : '') + '>' + (T < 28 ? 'Step 15 minutes' : 'Next update') + '</button>' +
        '<button type="button" class="ebtn2" data-act="nclose"' + (pend || T >= 25 ? ' disabled' : '') + '>Next poll closing</button>' +
        '<button type="button" class="ebtn2" data-act="nmorn"' + (pend || T >= 28 ? ' disabled' : '') + '>Skip to morning</button>' +
        '<button type="button" class="ebtn2" data-act="nend"' + (pend ? ' disabled' : '') + '>Skip to the end of the count</button>' +
        (rm ? '<span class="ev-why">Autoplay is off because your system asks for reduced motion. Step through the night instead.</span>' : pend ? '<span class="ev-why">Answer Ruth first.</span>' : '');
      paintLead();
      v3Paint('');
    }
    function renderNsel() {
      var el = body.querySelector('.ev-nsel'), N = G.night;
      if (!el) return;
      var c = ui.nsel < 0 ? G.fc.tipC : ui.nsel, d = N.c[c], T = N.T, o = counted(d, T), p = (o.L + o.C) / d.tot, h = T - d.cl;
      var status = h < 0 ? 'Polls close at ' + hr(d.cl) + ' ET' : d.called ? 'Called for ' + (d.called === G.sy ? 'you' : 'them') + ' at ' + (d.callT >= 36 ? clockTxt(d.callT) : hr(d.callT)) : N.done ? 'Too close to call' : 'Not yet called';
      var types = [0, 1, 2].map(function (t) {
        var tt = d.L[t] + d.C[t], ct = o.cL[t] + o.cC[t];
        return TYPE_NM[t] + ' ' + Math.round(tt > 0 ? ct / tt * 100 : 0) + '% counted' + (ct > 0 ? ', ' + mTxt(G.sy * (o.cL[t] - o.cC[t]) / ct * 100) : '');
      }).join(' · ');
      var dist = (c >= NU || U[c].par) ? '<div class="ev-dbtns">' + (function () { var st = c >= NU ? CI[c].id : U[c].par; return [CONT[st]].concat(KIDS[st]).map(function (k) { return '<button type="button" class="ev-dbtn" data-act="nsel" data-c="' + k + '" aria-pressed="' + (c === k) + '">' + esc(k >= NU ? 'Statewide' : U[k].id) + '</button>'; }).join(''); })() + '</div>' : '';
      el.innerHTML = '<div class="lk-card ev-nselc"><p class="ev-seln"><span class="ev-selt">' + esc(CI[c].nm) + '</span> <span class="lk-num ev-selm">' + EV56[c] + ' · ' + esc(status) + ' · ' + Math.round(p * 100) + '% counted' + (o.L + o.C > 0 ? ' · ' + mTxt(G.sy * (o.L - o.C) / (o.L + o.C) * 100) : '') + '</span></p>' + dist +
        '<canvas class="lk-bare ev-lead" aria-hidden="true"></canvas><p class="vh ev-leadvh"></p><p class="ev-types lk-num">' + esc(types) + '</p>' +
        '<p class="ev-note">' + esc(PROF[d.pf].nm) + ': ' + esc(PROF[d.pf].d) + (d.slow ? ' The lawsuit you stayed out of pushed the mail count here back a day.' : '') + '</p></div>';
    }
    function paintLead() {
      var cv = body.querySelector('.ev-lead');
      if (!cv || !G || !G.night) return;
      var desk = cv.closest('.lk-desk'), f = K.fitCanvas(cv, 110), x = f.ctx, Wd = f.W, H = 110;
      if (!(Wd > 0)) return;
      x.clearRect(0, 0, Wd, H);
      var c = ui.nsel < 0 ? G.fc.tipC : ui.nsel, d = G.night.c[c], s = d.series, L = 12, R = Wd - 12, T = 18, B = H - 22, mx = 5, i;
      for (i = 0; i < s.length; i++) mx = Math.max(mx, Math.abs(s[i][1]));
      mx = Math.min(60, Math.ceil(mx / 5) * 5);
      function X(p) { return L + (R - L) * p; }
      function Y(m) { return (T + B) / 2 - (G.sy * m) / mx * (B - T) / 2; }
      var on = K.labColor('--on-dark', desk), acc = K.labColor('--lk-acc', desk);
      x.strokeStyle = K.labColorA('--on-dark', 0.25, desk); x.lineWidth = 1; x.beginPath(); x.moveTo(L, Math.round(Y(0)) + 0.5); x.lineTo(R, Math.round(Y(0)) + 0.5); x.stroke();
      K.cvText(x, 'You +' + mx, L, T - 6, { px: 11, desk: true });
      K.cvText(x, 'Them +' + mx, L, B + 14, { px: 11, desk: true });
      K.cvText(x, Wd < 440 ? 'Share counted' : 'Share of the expected vote counted', R, B + 14, { px: 11, desk: true, align: 'right' });
      if (s.length) {
        x.strokeStyle = acc; x.lineWidth = 2; x.lineJoin = 'round'; x.beginPath();
        s.forEach(function (pt, k) { var px = X(Math.min(1, pt[0])), py = Y(pt[1]); if (k) x.lineTo(px, py); else x.moveTo(px, py); });
        x.stroke();
        var lp = s[s.length - 1];
        x.fillStyle = on; x.beginPath(); x.arc(X(Math.min(1, lp[0])), Y(lp[1]), 3, 0, 6.2832); x.fill();
      } else K.cvText(x, 'No votes counted yet', (L + R) / 2, (T + B) / 2 + 4, { px: 11, desk: true, align: 'center' });
      var vh = body.querySelector('.ev-leadvh');
      if (vh) vh.textContent = s.length ? CI[c].nm + ': margin as the count went, ' + s.map(function (pt) { return Math.round(pt[0] * 100) + '% counted ' + mS(G.sy * pt[1]); }).join(', ') + '.' : '';
    }

    /* ---------- after the count ---------- */
    function enterPost() {
      stopAuto();
      ui.phase = 'post';
      var N = G.night, list = canvass(G), R = G.S[G.riv];
      N.c.forEach(function (d) { if (Math.abs(d.fin) < 1) unlock('recount', 'The canvass in ' + CI[d.c].nm); });
      list.forEach(function (it) {
        if (it.auto) doRecount(G, it, 'auto');
        else if (it.decisive && it.loser === 'them') { if (R.cash >= it.cost) { R.cash -= it.cost; R.spent.recount += it.cost; doRecount(G, it, 'them'); } else it.unaff = 'them'; }
      });
      ui.post = { req: list.filter(function (it) { return !it.auto && it.decisive && it.loser === 'you'; })[0] || null, stage: 0 };
      if (!ui.post.req) finishCanvass();
      renderPost(true);
    }
    function finishCanvass() {
      G.res = finalResult(G);
      if (G.res.win === 'tie') { houseSetup(G); unlock('contingent', 'A 269 to 269 count'); }
      ui.post.done = true;
    }
    function recRow(it) {
      var N = G.night, rc = (N.recounts || []).filter(function (r) { return r.c === it.c; })[0], d = N.c[it.c];
      var mY0 = G.sy * (rc ? rc.before : d.fin), mvR = Math.round(it.mv);
      var h = '<li><p><span class="ev-selt">' + esc(CI[it.c].nm) + '</span> <span class="lk-num">' + mTxt(mY0) + ', ' + (mvR === 0 ? 'a tie in votes' : (mY0 > 0 ? 'yours' : 'theirs') + ' by ' + F.n(mvR) + ' ' + (mvR === 1 ? 'vote' : 'votes')) + '</span></p>' +
        '<p class="ev-note">Rule: ' + esc(it.auto ? 'automatic ' + it.txt : it.txt) + ' (' + (it.real ? 'state law' : 'a model default, not this state’s law') + '). ' + (it.decisive ? 'Decisive: flipping it changes who reaches 270.' : 'Not decisive.') + '</p>';
      if (rc) h += '<p>The ' + esc(CI[it.c].nm) + ' recount is done. The margin moved ' + F.n(rc.shift) + ' ' + (rc.shift === 1 ? 'vote' : 'votes') + ' toward ' + rc.toward + (rc.flipped ? ', and that was enough to flip it.' : '.') + ' FairVote’s review of 36 statewide recounts from 2000 to 2023 found an average shift of 551 votes.</p>';
      else if (it.unaff === 'them') h += '<p>The other campaign could not afford the ' + money(it.cost) + ' a recount costs here, so the result stands.</p>';
      else if (!it.auto && !it.decisive) h += '<p>Nobody pays for a recount that cannot change the outcome.</p>';
      return h + '</li>';
    }
    function renderPost(focus) {
      var N = G.night, list = N.canvass || [], Y = G.S[G.side], P = ui.post, h = '';
      var evNow = tallyFinal(G);
      var bpN = byParty(evNow, 538 - evNow);
      h += '<div class="ev-post lk-in"><section class="ev-stage ev-stage--post" data-ground="espresso"><div class="lk-head ev-sa-head"><p class="lk-kicker">After the count</p><h4 class="lk-title ev-focus" tabindex="-1">The ' + K.term('canvass', 'canvass') + '</h4>' +
        '<p class="lk-lede">Every county re-adds its numbers, the late ballots are in, and the states turn projections into certified results. On the final count you have ' + evNow + ' electors to ' + (538 - evNow) + '.</p></div>' +
        '<div class="ev-sa-num">' + splitHTML(bpN.L, bpN.C, 'The final count', G.side) + '</div></section>';
      h += '<section class="ev-sec"><h5 class="lk-kicker ev-h5">Contests close enough for a ' + K.term('recount', 'recount') + '</h5>' + (list.length ? '<ul class="ev-rec">' + list.map(recRow).join('') + '</ul>' : '<p>No contest finished close enough to trigger a recount anywhere. The canvass confirms the night.</p>') + '</section>';
      if (P.req && !P.done) {
        var it = P.req, can = Y.cash >= it.cost;
        h += '<section class="ev-sec"><div class="lk-card lk-card--event"><p class="ev-evk">' + chip('MANAGER') + '<span>The recount fund</span></p><p>' + esc(CI[it.c].nm) + ' decides it, and it is inside the margin where ' + esc(CI[it.c].stNm) + ' allows a recount on request. You have ' + money(Y.cash) + ' left.</p>' +
          '<button type="button" class="lk-opt" data-act="req" data-k="y"' + (can ? '' : ' disabled') + '><span class="lk-opt-l">Request a recount in ' + esc(CI[it.c].nm) + (it.statePays ? '; at this margin the state pays for it' : ': ' + money(it.cost) + ' from the reserve') + '</span>' + (can ? '' : '<span class="lk-opt-why">The reserve is short by ' + money(it.cost - Y.cash) + '</span>') + '</button>' +
          '<button type="button" class="lk-opt" data-act="req" data-k="n"><span class="lk-opt-l">Let the result stand</span></button></div></section>';
      }
      if (P.done) {
        var r = G.res;
        h += '<section class="ev-sec"><h5 class="lk-kicker ev-h5">December and January</h5><p>Governors sign each state’s ' + K.term('cert', 'certificate of ascertainment') + ' at least six days before the electors meet. The electors meet on the first Tuesday after the second Wednesday in December; Congress counts on January 6. Under the 2022 reform, an objection needs a fifth of each chamber. Nobody objects in this simulation, which is itself a modeling choice. Every elector votes as pledged here, though a ' + K.term('faithless', 'faithless elector') + ' is not unheard of.</p>' +
          (r.win !== 'tie' ? '<p>The electors cast ' + r.evY + ' votes for ' + esc(PY().cs) + ' and ' + r.evT + ' for ' + esc(PT().cs) + '. On January 6, ' + (r.win === 'you' ? 'your ticket' : 'the other ticket') + ' is declared elected.</p>' : '<p>The electors cast 269 votes each. On January 6 Congress confirms that no one has a majority, and the choice goes to the House, as it did for the elections of 1800 and 1824.</p>') + '</section>';
        if (r.win === 'tie') h += houseHTML();
        if (r.win !== 'tie' || N.house.done) h += '<div class="btnrow"><button type="button" class="ebtn" data-act="debrief">Read the debrief</button></div>';
      }
      h += '</div>';
      body.innerHTML = h;
      if (P.done) { unlock('congress', 'December'); unlock('faithless', 'December'); }
      root.setAttribute('data-ev-side', G.side);
      if (focus) K.focus(body.querySelector('.ev-focus'), { scroll: true });
    }
    function houseHTML() {
      var H = G.night.house, lob = H.dl.filter(function (d) { return d.lob; }).length, h = '';
      h += '<section class="ev-sec"><h5 class="lk-kicker ev-h5">The ' + K.term('contingent', 'contingent election') + '</h5><p>269 to 269. The House chooses, as it did for the elections of 1800 and 1824. Each state delegation casts one vote; 26 wins. The District of Columbia, which cast three electoral votes, has no vote here. The Senate chooses the Vice President from the top two, a majority of the whole Senate.</p>';
      var cnt = { you: 0, them: 0, div: 0 };
      H.dl.forEach(function (d) { cnt[d.hold]++; });
      h += '<p class="lk-num">Delegations: yours ' + cnt.you + ', theirs ' + cnt.them + ', divided ' + cnt.div + '.' + (H.done ? '' : ' You may lobby up to two divided delegations; each breaks your way about a third of the time. The other campaign will lobby too.') + '</p>';
      h += '<ul class="ev-dels">' + H.dl.map(function (d) {
        var st = H.done ? (d.vote === 'you' ? 'you' : d.vote === 'them' ? 'them' : 'none') : d.hold;
        var b = !H.done && d.hold === 'div' ? '<button type="button" class="ev-lob" data-act="lobby" data-k="' + d.id + '" aria-pressed="' + d.lob + '"' + (!d.lob && lob >= 2 ? ' disabled' : '') + '>' + (d.lob ? 'Lobbying' : 'Lobby') + '</button>' : '';
        return '<li class="ev-del ev-del--' + st + '"><span class="lk-num">' + esc(d.id) + ' <span class="ev-dim">' + d.y + ' to ' + d.t + '</span></span>' + (H.done ? '<span class="ev-dv">' + (st === 'none' ? 'no vote' : st) + '</span>' : '') + b + '</li>';
      }).join('') + '</ul>';
      if (!H.done) h += '<div class="btnrow"><button type="button" class="ebtn" data-act="housevote">Hold the vote</button></div>';
      else {
        h += '<p class="ev-hres">The House: you ' + H.y + ' states, them ' + H.t + '. ' + (H.pres ? (H.pres === 'you' ? esc(PY().cs) + ' is elected President.' : esc(PT().cs) + ' is elected President.') :
          'No ticket has 26. The House can keep balloting, as it did 36 times in 1801; if it has not chosen by January 20, the Vice President chosen by the Senate acts as President under the 20th Amendment.') + '</p>' +
          '<p>The Senate, with ' + H.senY + ' seats for your party, chooses ' + (H.vp === 'you' ? esc(PY().vp) : esc(PT().vp)) + ' as Vice President.' + (H.pres && H.pres !== H.vp ? ' The House chose one ticket’s President and the Senate the other ticket’s Vice President. The Constitution permits it.' : '') + '</p>';
      }
      return h + '</section>';
    }

    /* ---------- the debrief: what you believed, what was true, what happened, and why ---------- */
    var ENDINGS = {
      house: ['The House decides', 'The voters produced a tie and handed the choice to fifty delegations. Nobody designed this outcome; the Constitution planned for it.'],
      photo: ['The photo finish', 'It came down to a margin smaller than a stadium crowd in one state. Everything you did mattered, and so did everything you could not control.'],
      inv: ['The inversion', 'You won the presidency with fewer votes than the other side, as the winners did in 1876, 1888, 2000 and 2016. You played the rules as written. The argument about the rules starts tomorrow and will not be settled by you.'],
      pop: ['The popular loss', 'More people voted for you. The college counted states. Every campaign knows this in September, and some still spend like it is a national election.'],
      land: ['The landslide', 'The map broke your way and kept breaking. In this machine, landslides mostly come from a polling error that happened to agree with you, stacked on a plan that was already winning.'],
      clean: ['The clean win', 'You won the states that decided it and the count that did not.'],
      lost: ['The clean defeat', 'You lost the argument in the places where it was held. No law requires a concession. It is a custom, and it lets the loser’s voters accept the result.']
    };
    function firstOffice() { var Y = G.S[G.side], f = 0; for (var i = 0; i < NU; i++) if (Y.openedW[i] && (!f || Y.openedW[i] < f)) f = Y.openedW[i]; return f; }
    function computeEnding() {
      var r = G.res, N = G.night, H = N.house, k;
      var won = r.win === 'you' || (r.win === 'tie' && !!H && (H.pres === 'you' || (!H.pres && H.vp === 'you')));
      if (r.win === 'tie') k = 'house';
      else if (Math.abs(r.tipM) < 0.5) k = 'photo';
      else if (r.win === 'you' && r.nat < 0) k = 'inv';
      else if (r.win === 'them' && r.nat > 0) k = 'pop';
      else if (r.evY >= 350) k = 'land';
      else k = r.win === 'you' ? 'clean' : 'lost';
      var txt = ENDINGS[k][1];
      if (k === 'clean') { var fo = firstOffice(); txt += fo && fo <= 3 ? ' Nobody will study this campaign; they should study the September field offices.' : ' Nobody will study this campaign, which is the highest compliment a campaign can get.'; }
      var mods = [];
      if (N.speech === 'claim' && (N.speechEV < 270 || !won)) mods.push('the premature claim');
      if (!N.projT || N.projT >= 36) mods.push('the long count');
      if ((N.recounts || []).some(function (x) { return (N.canvass || []).some(function (it) { return it.c === x.c && it.decisive; }); })) mods.push('the recount');
      G.ending = { k: k, nm: ENDINGS[k][0], txt: txt, won: won, mods: mods };
      if (k === 'inv' || k === 'pop') unlock('inversion', 'The ending: ' + ENDINGS[k][0].toLowerCase());
      return G.ending;
    }
    function waterfall(c) {
      var N = G.night, Y = G.S[G.side], R = G.S[G.riv], ks = c >= NU ? KIDS[CI[c].id] : [c], sy = G.sy, rows = [];
      var steps = ['Start of the race', 'National environment', 'Your ads', 'Their ads', 'Your visits', 'Their visits', 'News and debates', 'Your turnout work', 'Their turnout work', 'Registration drives', 'Election Day noise'];
      var prev = null;
      for (var s = 0; s <= steps.length - 1; s++) {
        var vL = 0, vC = 0;
        ks.forEach(function (i) {
          var u = U[i], m = G.m0[i];
          if (s >= 1) m += G.n;
          if (s >= 2) m += sy * (Y.A[i] + G.pi[i] * Y.AN);
          if (s >= 3) m -= sy * (R.A[i] + G.pi[i] * R.AN);
          if (s >= 4) m += sy * Y.V[i];
          if (s >= 5) m -= sy * R.V[i];
          if (s >= 6) m += G.X[i] + G.XD[u.div] + G.XN + G.DB;
          var gy = s >= 7 ? fieldG(G, G.side, i) + Y.e : 0, gr = s >= 8 ? fieldG(G, G.riv, i) + R.e : 0;
          if (s >= 9) m += G.S.L.R[i] - G.S.C.R[i];
          if (s >= 10) m += N.noise[i];
          unitVotes(G, i, m, G.side === 'L' ? gy : gr, G.side === 'L' ? gr : gy, TMP);
          vL += TMP[0]; vC += TMP[1];
        });
        var mv = sy * (vL - vC) / (vL + vC) * 100;
        rows.push({ nm: steps[s], a: prev == null ? 0 : prev, b: mv, d: prev == null ? mv : mv - prev, first: prev == null });
        prev = mv;
      }
      return rows;
    }
    function wfHTML(rows, final) {
      var lo = 0, hi = 0;
      rows.forEach(function (r) { lo = Math.min(lo, r.a, r.b); hi = Math.max(hi, r.a, r.b); });
      lo = Math.min(lo, final); hi = Math.max(hi, final);
      var span = Math.max(1, hi - lo);
      function pos(v) { return ((v - lo) / span).toFixed(4); }
      var all = rows.concat([{ nm: 'Result, after the count', a: 0, b: final, d: final, first: true, res: true }]);
      return '<div class="lk-scroll"><table class="lk-table ev-wf"><thead><tr><th scope="col">Step</th><th scope="col"><span class="vh">Bar</span></th><th scope="col">Points</th></tr></thead><tbody>' + all.map(function (r) {
        var a = r.first ? Math.min(0, r.b) : Math.min(r.a, r.b), b = r.first ? Math.max(0, r.b) : Math.max(r.a, r.b), cls = r.res ? 'is-res' : r.d >= 0 ? 'is-up' : 'is-dn';
        return '<tr class="' + cls + '"><td>' + esc(r.nm) + '</td><td data-l="Bar"><span class="ev-wbar"><b style="left:' + (pos(0) * 100).toFixed(2) + '%"></b><i style="left:' + (pos(a) * 100).toFixed(2) + '%;width:' + Math.max(0.4, (b - a) / span * 100).toFixed(2) + '%"></i></span></td><td data-l="Points">' + (r.first ? mTxt(r.b) : F.signed(r.d, 2)) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    }
    function spendU(i) { var Y = G.S[G.side]; return Y.spent.ads[i] + Y.spent.fieldU[i]; }
    function tryNext(r) {
      var out = [], Y = G.S[G.side], N = G.night, tot = 0, far = 0, i, sy = G.sy;
      for (i = 0; i < NU; i++) { var s = spendU(i); tot += s; if (Math.abs(sy * N.fin[i] - r.tipM) > 5) far += s; }
      tot += Y.spent.nat;
      var fo = firstOffice();
      if (!fo) out.push('You never opened a field office. Mobilization is the lever the polls cannot see and the one that lasts to Election Day; try three offices in the top tipping states in week 1.');
      else if (fo > 4) out.push('Your first field office opened in week ' + fo + '. An office opened in September has twice the contacts of one opened in October; open earlier.');
      if (tot > 0 && far / tot >= 0.25) out.push(Math.round(far / tot * 100) + '% of your money went to contests that finished more than 5 points from the tipping margin. Follow the tipping odds, not the electors.');
      if (tot > 0 && Y.spent.nat / tot > 0.10) out.push('National ads took ' + Math.round(Y.spent.nat / tot * 100) + '% of your spending. Most of that airtime lands in states that were never in doubt.');
      var o = [];
      for (i = 0; i < 56; i++) o.push(i);
      o.sort(function (a, b) { return G.fc.tip[b] - G.fc.tip[a]; });
      var t3 = o.slice(0, 3).map(tipUnitOf);
      if (!G.ending.won && rho(t3[0], t3[1]) > 0.62 && rho(t3[0], t3[2]) > 0.62) {
        var alt = twins(t3[0]).slice().reverse().filter(function (t) { return Math.abs(sy * G.fmean[t.j] - G.fc.tipAvg) < 5; })[0];
        if (alt) out.push('Your three likeliest tipping points share a blind spot. Hedge across states that do not: ' + U[t3[0]].nm + ' and ' + U[alt.j].nm + ' are only ' + alt.r.toFixed(2) + ' alike.');
      }
      if ((N.canvass || []).some(function (it) { return it.decisive && it.loser === 'you' && !it.auto && G.S[G.side].cash + (it.paid || 0) < it.cost && !it.paid; })) out.push('A decisive recount was within reach and you could not afford it. Keep something back for the canvass.');
      var contr = G.log.filter(function (l) { return l.msg === 'X'; }).length;
      if (contr >= 3 && G.hist.some(function (h) { return h.tipAvg < 0; })) out.push('You drew the contrast in ' + contr + ' weeks while trailing where it counted. Contrast fires up both sides, which only helps where you already have more supporters.');
      var avgP = G.fcHist.reduce(function (s, h) { return s + h.pWin; }, 0) / Math.max(1, G.fcHist.length);
      if (!G.ending.won && avgP < 0.35) out.push('You trailed most of the way. An underdog wants correlation, not hedges: money in a group of similar states means one favorable polling miss can carry all of them at once.');
      var fieldT = 0; for (i = 0; i < NU; i++) fieldT += Y.spent.fieldU[i];
      if (fo && tot > 0 && fieldT / tot < 0.1) out.push('Field took only ' + Math.round(fieldT / tot * 100) + '% of your money. Doors knocked in September still count in November; ads bought in September do not.');
      var msgs = {}; G.log.forEach(function (l) { msgs[l.msg] = (msgs[l.msg] || 0) + 1; });
      if (Object.keys(msgs).length === 1 && G.log.length === 9) out.push('You ran “' + MSG[G.log[0].msg].nm.toLowerCase() + '” all nine weeks. The message decides whether your money buys persuasion or turnout, and the right mix changes as Election Day gets closer.');
      var prep = G.debates.filter(function (d) { return d.pres; }).reduce(function (s, d) { return s + d.prep; }, 0);
      if (prep < 2) out.push('You prepped ' + prep + ' ' + (prep === 1 ? 'day' : 'days') + ' for two presidential debates. Debates are weak levers, but prep is cheap and the downside of a bad night is not.');
      if (N.speech === 'claim' && N.speechEV < 270) out.push('You claimed victory at 11 p.m. with ' + N.speechEV + ' called electors. Nothing in the count changed because of it, and nothing ever does.');
      var res = out.slice(0, 3);
      res.push('Replay this map with the parties swapped: same race, same luck, mirrored labels. It is the neutrality check: the rules do not care which party you are. To run the other campaign in this race instead, take the other seat.');
      return res;
    }
    function counterfactual() {
      var r = G.res, N = G.night, sy = G.sy, i, tc = r.tipC >= 0 ? r.tipC : G.fc.tipC, tu = tipUnitOf(tc);
      var tw = twins(tu).filter(function (t) { return Math.abs(sy * N.fin[t.j] - r.tipM) < 5; })[0];
      var tw2 = tw ? tw.j : tipUnitOf(tipsOrder(G).filter(function (k) { return k !== tu; })[0]);
      var never = new Int8Array(NU), A = new Float64Array(NU), A2 = new Float64Array(NU), moved = 0;
      for (i = 0; i < NU; i++) never[i] = Math.abs(sy * N.fin[i] - r.tipM) > 8 && i !== tu && i !== tw2 ? 1 : 0;
      G.log.forEach(function (L) {
        var mv = 0, M = MSG[L.msg];
        for (i = 0; i < NU; i++) if (never[i]) mv += L.ads[i];
        moved += mv;
        for (i = 0; i < NU; i++) {
          var x = L.ads[i], x2 = never[i] ? 0 : x + (i === tu || i === tw2 ? mv / 2 : 0), c = adCost(i, L.w);
          A[i] = 0.5 * A[i] + (x > 0 ? KAD * M.a * G.pi[i] * Math.log(1 + x / c) : 0);
          A2[i] = 0.5 * A2[i] + (x2 > 0 ? KAD * M.a * G.pi[i] * Math.log(1 + x2 / c) : 0);
        }
      });
      var cm = new Float64Array(56), cm0 = new Float64Array(56);
      for (i = 0; i < NU; i++) { unitVotes(G, i, N.mSun[i] + N.noise[i], N.gL[i], N.gC[i], TMP); VLb[i] = TMP[0]; VCb[i] = TMP[1]; }
      contestsFrom(VLb, VCb, cm0);
      for (i = 0; i < NU; i++) { unitVotes(G, i, N.mSun[i] + N.noise[i] + sy * (A2[i] - A[i]), N.gL[i], N.gC[i], TMP); VLb[i] = TMP[0]; VCb[i] = TMP[1]; }
      contestsFrom(VLb, VCb, cm);
      var e0 = evFor(cm0, sy), e1 = evFor(cm, sy);
      if (moved < 1) return 'You put nothing into contests that finished more than 8 points from the tipping margin, so there is nothing to move. That is the plan working.';
      return 'Holding the rival’s moves fixed, which a real rival would not do: moving the ' + money(moved) + ' you spent in contests that were never close into ' + CI[tc].nm + ' and ' + U[tw2].nm + ', week by week, gives you ' + e1 + ' electors instead of ' + e0 + '. ' +
        (e0 < 270 && e1 >= 270 ? 'That is the presidency.' : e0 >= 270 && e1 < 270 ? 'Oddly, it costs you the presidency, because some of that money was holding a state after all.' : e1 === e0 ? 'It changes nothing: the money was not what decided this one.' : 'It moves the margin, not the outcome.');
    }
    function renderDebrief() {
      ui.phase = 'debrief';
      var r = G.res, N = G.night, e = computeEnding(), Y = G.S[G.side], sy = G.sy, i;
      unlock('npv', 'The debrief');
      unlock('corr', 'The debrief');
      var sv = store.get() || {};
      sv.done = (sv.done || 0) + 1; if (e.won) sv.wins = (sv.wins || 0) + 1; store.set(sv);
      var tc = r.tipC >= 0 ? r.tipC : G.fc.tipC, spend = 0, tot = 0;
      for (i = 0; i < NU; i++) tot += spendU(i);
      tot += Y.spent.nat + Y.spent.evt;
      spend = tot + Y.spent.recount;
      var pTrue = N.pTrue, pFc = N.pFc, won = e.won;
      var bt;
      var bad = []; for (i = 0; i < 49; i++) if (Math.abs(sy * N.fin[i] - r.tipM) < 6) bad.push(i);
      bad.sort(function (a, b) { return sy * G.E[b] - sy * G.E[a]; });
      if (pTrue >= 0.5 && won) bt = 'You built a real lead and it held.';
      else if (pTrue < 0.5 && won) bt = 'On Sunday you were behind in fact. Tuesday’s noise broke your way. Do not learn too much from it.';
      else if (pTrue >= 0.5) bt = 'On Sunday you were ahead in fact and lost to Election Day noise, which happens ' + F.prob(1 - pTrue) + ' of the time. It is not a verdict on the plan.';
      else bt = 'The polls told you ' + F.prob(pFc) + '. The race was ' + F.prob(pTrue) + '. The gap is the polling error, and it ran through states like ' + listNames(bad.slice(0, 3).map(function (k) { return U[k].nm; })) + '.';
      var wf = waterfall(tc), last = wf[wf.length - 1], tu = tipUnitOf(tc), pollSaid = sy * (tc < NU ? G.avg[tc].mean : avgC(tc)), eHid = sy * (tc < NU ? G.E[tc] : G.E[tu]);
      var yfield = wf[7].d;
      var mTop = [];
      for (i = 0; i < NU; i++) if (spendU(i) > 0) mTop.push(i);
      mTop.sort(function (a, b) { return spendU(b) - spendU(a); });
      var farS = 0, allS = 0;
      for (i = 0; i < NU; i++) { allS += spendU(i); if (Math.abs(sy * N.fin[i] - r.tipM) > 8) farS += spendU(i); }
      var maxS = mTop.length ? spendU(mTop[0]) : 1;
      var moneyHTML = mTop.length ? '<ul class="ev-bars">' + mTop.slice(0, 10).map(function (k) {
        return '<li><span class="ev-bl">' + esc(U[k].nm) + ' <span class="lk-num ev-dim">finished ' + mTxt(sy * N.fin[k]) + '</span></span><span class="lk-bar"><i style="--w:' + (spendU(k) / maxS).toFixed(3) + '"></i></span><span class="lk-num ev-bv">' + money(spendU(k)) + '</span></li>'; }).join('') + '</ul>' : '<p>You spent nothing in any single contest.</p>';
      var deb = G.debates, dsum = deb.reduce(function (s, d) { return s + d.D; }, 0);
      var flips = N.flips.filter(function (f) { var d = N.c[f.c]; return d.first !== (d.fin > 0 ? 1 : -1) && (f.c >= NU || !U[f.c].par); });
      var seenF = {}, fl = [];
      flips.forEach(function (f) { if (!seenF[f.c] && (N.c[f.c].fin > 0 ? 1 : -1) === f.to) { seenF[f.c] = 1; fl.push(f); } });
      var early = fl.slice(0, 5).map(function (f) { return '<li>' + esc(CI[f.c].nm) + ': ' + (f.to === sy ? 'they' : 'you') + ' led until ' + esc(f.T >= 36 ? clockTxt(f.T) : hr(f.T) + (f.T >= 24 ? ' Wednesday' : '')) + (f.type < 0 ? '; the rest of the count moved it.' : '; the ' + TYPE_LC[f.type] + ' count flipped it.') + '</li>'; }).join('');
      var speech = N.speech === 'claim' ? '“We have won this election.”' + (N.speechEV < 270 ? ' At that moment you had ' + N.speechEV + ' called electors.' : '') : N.speech === 'count' ? '“Every ballot gets counted, and we like where we stand.”' : N.speech === 'home' ? 'nothing; the candidate went home.' : 'nothing; the night ended before 11 p.m. came up.';
      var recs = (N.recounts || []).map(function (x) { return CI[x.c].nm + ' moved ' + F.n(x.shift) + ' votes toward ' + x.toward + (x.flipped ? ' and flipped' : ''); });
      var nightHTML = '<p>' + (fl.length ? 'Early leaders who lost:</p><ul class="ev-list">' + early + '</ul>' : 'No statewide contest changed leaders after its first returns.</p>') +
        '<p>The presidency was projected ' + esc(N.projT ? whenTxt(N.projT) : 'only when the count was complete') + '. At 11 p.m. your candidate said ' + esc(speech) + '</p>' +
        (recs.length ? '<p>Recounts: ' + esc(recs.join('; ')) + '. FairVote’s average across 36 statewide recounts was 551 votes.</p>' : '');
      var H = N.house, afterHTML = r.win === 'tie' && H ? '<p>The House voted ' + H.y + ' to ' + H.t + ' by state delegation' + (H.pres ? ' and elected ' + (H.pres === 'you' ? 'your' : 'their') + ' ticket’s President.' : ', short of 26 for anyone; the Senate’s Vice President acts as President from January 20.') + ' The Senate chose ' + (H.vp === 'you' ? 'your' : 'their') + ' running mate.</p>' :
        '<p>The electors met in December and voted as pledged: ' + r.evY + ' for ' + esc(PY().cs) + ', ' + r.evT + ' for ' + esc(PT().cs) + '. Congress counted them on January 6 without objection, a modeling choice, not a prediction.</p>';
      var hist = {
        inv: ['An inversion', 'In 1876 Hayes won 185 to 184 after an Electoral Commission settled disputed returns from four states; in 1888 Harrison won 233 to 168 while trailing in the popular vote; 2000 turned on a certified Florida margin of 537 votes; in 2016 the popular-vote runner-up won 304 to 227.', [SRC.y1876, SRC.y1888, SRC.y2000, SRC.y2016]],
        pop: ['An inversion, from the other side', 'The popular-vote winner lost the college in 1876, 1888, 2000 and 2016. Geruso, Spears and Talesara estimate about 40 percent of elections within a point nationally would go this way, and which party it favors has changed across eras.', [SRC.geruso, SRC.y2016]],
        house: ['The contingent election', 'The House has chosen the President twice: in 1801, after Jefferson and Burr tied at 73 and 36 ballots were needed, and in 1825, when it chose John Quincy Adams over Andrew Jackson, 13 states to 7 and 4.', [SRC.y1800, SRC.y1824, SRC.house]],
        photo: ['A photo finish', '2000 came down to 537 certified votes in Florida. In 2020, about 21,500 voters switching sides in Georgia, Arizona and Wisconsin would have produced 269 to 269 despite a national margin above seven million.', [SRC.y2000, SRC.fec20]],
        land: ['A landslide', 'Landslides have gone quiet: no winner has passed 400 electors since 1988 (426), and in 2020 the national margin was 4.45 points while the tipping point, Wisconsin, was decided by 0.63, so the map sits well inside the popular vote.', [SRC.y1988, SRC.fec20]],
        clean: ['A clean win', 'In 2020 the national margin was 4.45 points and the tipping-point margin 0.63. A clean win on the map can still be a close election where it counted.', [SRC.fec20]],
        lost: ['A defeat', 'Every presidential election produces one, and the concession is how it ends. In 2020 a 4.45-point national margin still came down to a 0.63-point tipping point.', [SRC.fec20]]
      }[e.k];
      var fo = firstOffice(), lateAds = 0, allAds = 0;
      G.log.forEach(function (L) { var s = 0; for (var q = 0; q < NU; q++) s += L.ads[q]; allAds += s; if (L.w >= 7) lateAds += s; });
      var t3 = [];
      for (i = 0; i < 56; i++) t3.push(i);
      t3.sort(function (a, b) { return G.fc.tip[b] - G.fc.tip[a]; });
      var topS = 0; t3.slice(0, 3).forEach(function (c) { (c >= NU ? KIDS[CI[c].id] : [c]).forEach(function (k) { topS += spendU(k); }); });
      var polMiss = 0, pn = 0;
      for (i = 0; i < 49; i++) if (Math.abs(sy * N.fin[i] - r.tipM) < 8) { polMiss += sy * (G.avg[i].mean - N.fin[i]); pn++; }
      polMiss = pn ? polMiss / pn : 0;
      var lessons = K.lesson({ title: 'Where the money went', you: 'You spent ' + money(allS + Y.spent.nat) + ' on ads and field. ' + Math.round(allS > 0 ? farS / (allS + Y.spent.nat) * 100 : 0) + '% of it went to contests that finished more than 8 points from the tipping margin, and ' + Math.round(allS > 0 ? topS / (allS + Y.spent.nat) * 100 : 0) + '% to the three contests the final forecast thought likeliest to tip.',
        principle: 'Only the tipping-point state’s margin decides the election, so a dollar is worth what that state’s chance of deciding it is worth. Under winner-take-all, voter power is wildly unequal.',
        history: 'By one advocacy group’s count, 204 of 212 general-election events in 2020 were in 12 states, and 246 of 262 in 2024 were in seven. The 2020 tipping point, Wisconsin, was decided by 0.63 points.', src: [SRC.npv20, SRC.npv24, SRC.fec20] }) +
        K.lesson({ title: 'Persuasion, turnout and timing', you: (fo ? 'Your first field office opened in week ' + fo + '. ' : 'You never opened a field office. ') + Math.round(allAds > 0 ? lateAds / allAds * 100 : 0) + '% of your ad money went out in the last three weeks. In ' + CI[tc].nm + ' your turnout work was worth ' + F.signed(yfield, 2) + ' points at the end; your ads there were worth ' + F.signed(tc < NU ? Y.A[tc] : Y.A[tu], 2) + ' after costing ' + money(tc < NU ? Y.spent.ads[tc] : Y.spent.ads[tu]) + '.',
        principle: 'Ads fade within days; field contacts accumulate while the office stays open and are still there on Election Day. Persuasion changes two votes of margin and is rare; mobilization changes one and is dependable. Early field, late ads.',
        history: 'In a randomized test during the 2006 Texas governor’s race, TV ad effects were gone within a week. Green and Gerber found about one extra vote per 14 people reached at the door.', src: [SRC.gerber, SRC.gotv, SRC.kalla] }) +
        K.lesson({ title: 'The polls', you: 'Your final forecast said ' + F.prob(pFc) + '. In the states near the tipping point, the final averages missed by ' + Math.abs(polMiss).toFixed(1) + ' points on average, ' + (polMiss > 0 ? 'overstating you' : 'understating you') + '.',
        principle: 'The margin of error covers sampling luck only. The error that decides elections is the one every poll shares, and it runs through similar states together, which is why the forecast simulates it as one draw.',
        history: 'AAPOR found 2016 state polls missed across the Upper Midwest, partly for not weighting by education; state polls missed by 5.1 points in 2020 and 3.0 in 2024, in the same direction for a third straight cycle.', src: [SRC.aapor16, SRC.aapor20, SRC.aapor24] }) +
        K.lesson({ title: 'Election night', you: 'At 11 p.m. the candidate said ' + speech + ' ' + (fl.length ? fl.length + ' statewide ' + (fl.length === 1 ? 'contest' : 'contests') + ' changed leaders during the count.' : 'No statewide contest changed leaders after its first returns.'),
        principle: 'Count order, not voter intent, drives the early lead. Calls are projections, results come from the canvass, and a claim of victory changes no count.',
        history: 'Five states, including Pennsylvania and Wisconsin, may not process mail-ballot envelopes before Election Day. In June 2026, Watson v. RNC held that federal law does not bar counting mail ballots postmarked by Election Day that arrive later.', src: [SRC.ceir, SRC.watson] }) +
        K.lesson({ title: 'History’s version: ' + hist[0].toLowerCase(), you: 'You finished with ' + r.evY + ' electors to ' + r.evT + ' and ' + mTxt(r.nat) + ' in the popular vote, decided in ' + (r.tipC >= 0 ? CI[r.tipC].nm + ' at ' + mTxt(r.tipM) : 'a tie') + '.', principle: 'The college counts states, one at a time, and stops at 270. When nobody gets there, the House counts states too.', history: hist[1], src: hist[2] });
      var tries = tryNext(r);
      var host = body;
      body.innerHTML = '';
      K.debrief(host, {
        kicker: (won ? 'You won' : 'You lost') + ' · map #' + G.seed,
        title: e.nm, sub: e.mods.length ? 'with ' + listNames(e.mods) : '',
        lede: e.txt,
        stats: [{ k: 'Electors', v: r.evY + ' to ' + r.evT, tone: r.evY >= 270 ? 'gain' : r.evY === 269 ? null : 'loss' }, { k: 'Popular vote', v: mTxt(r.nat), tone: r.nat >= 0 ? 'gain' : 'loss' },
          { k: 'Tipping point', v: r.tipC >= 0 ? CI[r.tipC].id + ' ' + mS(r.tipM) : 'none' }, { k: 'Map bias', v: r.tipC >= 0 ? F.signed(r.tipM - r.nat, 1) : '–' },
          { k: 'Spent', v: money(spend) }, { k: 'Per elector won', v: r.evY ? money(spend / r.evY, 2) : '–' }, { k: 'Final forecast', v: F.prob(pFc) }],
        sections: [
          { label: 'Belief, truth, outcome', html: '<div class="lk-stats ev-bto"><div class="lk-stat"><span class="lk-k">What you believed</span><span class="lk-v">' + F.prob(pFc) + '</span><span class="ev-sub">the final forecast</span></div><div class="lk-stat"><span class="lk-k">What was true</span><span class="lk-v">' + F.prob(pTrue) + '</span><span class="ev-sub">the race on the final Sunday, run through 2,000 Election Days</span></div><div class="lk-stat"><span class="lk-k">What happened</span><span class="lk-v">' + (won ? 'Won' : 'Lost') + '</span><span class="ev-sub">' + r.evY + ' electors</span></div></div><p>' + esc(bt) + '</p>' },
          { label: 'Where it was decided: ' + CI[tc].nm, html: '<p>Every force on the ' + K.term('tip', 'tipping-point') + ' contest, in your terms, from the start of the race to the count.</p>' + wfHTML(wf, r.tipC >= 0 ? r.tipM : sy * N.fin[tc]) + '<p>The final poll average there said ' + mTxt(pollSaid) + '. Between that and the result: a hidden polling error that ' + (eHid > 0 ? 'overstated' : 'understated') + ' you by ' + Math.abs(eHid).toFixed(1) + ', turnout work the polls could only half see (about ' + F.signed(0.5 * (wf[7].d + wf[8].d), 1) + '), registration drives (' + F.signed(wf[9].d, 2) + ') and Election Day noise (' + F.signed(wf[10].d, 2) + '). The rest is ordinary sampling noise.</p>' },
          { label: 'The polls', html: '<canvas class="lk-chart ev-scat" aria-hidden="true"></canvas><p class="vh ev-scatvh"></p><p>' + esc(scatterCopy(polMiss)) + '</p>' },
          { label: 'The money', html: moneyHTML + '<p>Spent in contests that finished more than 8 points from the tipping margin: ' + money(farS) + ' (' + Math.round(allS ? farS / allS * 100 : 0) + '%).</p>' },
          { label: 'The calendar', html: '<canvas class="lk-chart ev-cal" aria-hidden="true"></canvas><p class="vh ev-calvh"></p><p>Your ' + (deb.length === 3 ? 'three debates' : 'debates') + ' moved the race a combined ' + F.signed(dsum, 2) + ' points. ' + (G.events.length ? 'The news you answered: ' + G.events.map(function (x) { return 'week ' + x.w + ', ' + lc1(EVK[x.t]); }).join('; ') + '.' : '') + '</p>' },
          { label: 'Election night', html: nightHTML },
          { label: 'After the count', html: afterHTML },
          { label: 'Your decisions, the principle behind each, and the record', html: lessons },
          { label: 'Try this next', html: '<ul class="ev-list">' + tries.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul><div class="btnrow"><button type="button" class="ebtn2" data-act="cf">Move the money from contests that were never close</button></div><p class="ev-cf" aria-live="polite"></p>' }
        ],
        principles: ['tip', 'corr', 'forecast', 'persuade', 'fade', 'turnout', 'count', 'calls', 'recount', 'inversion', 'contingent', 'npv'],
        take: true,
        actions: [{ label: 'Replay this map', primary: true, onClick: function () { ui.mir = G.mir; ui.seed = G.seed; ui.side = G.side; ui.scen = G.scen; ui.era = G.eraSel; startCampaign(); } },
          { label: 'Replay with the parties swapped', onClick: function () { ui.seed = G.seed; ui.side = G.riv; ui.mir = -G.mir; ui.scen = G.scen; ui.era = G.eraSel; startCampaign(); } },
          /* the other seat in the same race: same map and same hidden polling error in party terms, the scenario mirrored and recalibrated for that side */
          { label: 'Take the other seat', onClick: function () { ui.seed = G.seed; ui.side = G.riv; ui.mir = G.mir; ui.scen = ({ E: 'E', U: 'R', R: 'U' })[G.scen]; ui.era = G.eraSel; startCampaign(); } },
          { label: 'New map', onClick: function () { ui.seed = newSeed(); ui.mir = 1; G = null; renderSetup(); K.focus(body.querySelector('.ev-focus'), { scroll: true }); } }]
      });
      var dbEl = body.querySelector('.lk-debrief'), at = dbEl && (dbEl.querySelector(':scope > .lk-lede') || dbEl.querySelector(':scope > .lk-title'));
      if (at) at.insertAdjacentHTML('afterend', endStageHTML());
      var em = body.querySelector('.ev-stage--end .ev-map');
      if (em) roving(em, -1);
      foil();
      shelf.refresh();
      paintAll();
    }
    function endStageHTML() {
      var N = G.night, r = G.res, b = byParty(r.evY, r.evT);
      var tiles = TILES.map(function (t) {
        var m = N.c[t.c].fin;
        return tileHTML(t, partyCls(m), null, t.nm + ', ' + t.ev + ' electors, ' + PARTY[m >= 0 ? 'L' : 'C'].sh + ' by ' + Math.abs(m).toFixed(1), distStrip(t, function (k) { return partyCls(N.c[k].fin); }));
      }).join('');
      return '<section class="ev-stage ev-stage--end" data-ground="espresso"><div class="ev-sa-num">' + splitHTML(b.L, b.C, 'The final count', G.side) + '</div>' +
        '<div class="ev-sa-map">' + sheetHTML('The final count', '<div class="ev-map" role="group" aria-label="The final count. Arrow keys move between states.">' + tiles + '</div>' + legendHTML(), G.seed + (G.mir < 0 ? ' (mirrored)' : '')) + '</div></section>';
    }
    function scatterCopy(miss) {
      var lu = Math.abs(G.lam.u), lb = Math.abs(G.lam.b) * 1.0, useB = lb >= lu, lam = useB ? G.lam.b : G.lam.u, ov = lam > 0 ? 'L' : 'C';
      return 'Average miss near the tipping point: ' + Math.abs(miss).toFixed(1) + ' toward ' + (miss > 0 ? 'you' : 'them') + '. The miss was not random. It tracked ' + (useB ? 'degree share' : 'how urban a state is') + ': every step up that scale (' + (useB ? 'six points more adults with a degree' : 'fifteen points more urban') + ') was overstated for ' + PARTY[ov].sh + ' by about ' + Math.abs(lam).toFixed(1) + ' points. That is what correlated error looks like from the inside. AAPOR found state polls in 2016 missed across the Upper Midwest, in part because many did not weight by education.';
    }
    function paintScatter() {
      var cv = body.querySelector('.ev-scat');
      if (!cv || !G || !G.night) return;
      var f = K.fitCanvas(cv, 240), x = f.ctx, Wd = f.W, H = 240;
      if (!(Wd > 0)) return;
      x.clearRect(0, 0, Wd, H);
      var N = G.night, sy = G.sy, L = 34, R = Wd - 12, T = 16, B = H - 30, lim = 20, useB = Math.abs(G.lam.b) >= Math.abs(G.lam.u), ac = K.ACC();
      function X(v) { return L + (R - L) * (clamp(v, -lim, lim) + lim) / (2 * lim); }
      function Y(v) { return B - (B - T) * (clamp(v, -lim, lim) + lim) / (2 * lim); }
      x.strokeStyle = K.inkColor(0.14); x.lineWidth = 1;
      [-20, -10, 0, 10, 20].forEach(function (v) { x.beginPath(); x.moveTo(X(v), T); x.lineTo(X(v), B); x.stroke(); x.beginPath(); x.moveTo(L, Y(v)); x.lineTo(R, Y(v)); x.stroke(); });
      x.strokeStyle = K.inkColor(0.5); x.setLineDash([4, 4]); x.beginPath(); x.moveTo(X(-lim), Y(-lim)); x.lineTo(X(lim), Y(lim)); x.stroke(); x.setLineDash([]);
      var pts = [];
      for (var i = 0; i < 49; i++) {
        var fv = useB ? U[i].b : U[i].u, a = clamp(0.25 + 0.2 * (fv + 1.5), 0.2, 0.95);
        pts.push({ x: sy * G.avg[i].mean, y: sy * N.fin[i], r: 2 + Math.sqrt(U[i].ev), a: a, id: U[i].id, tip: i === tipUnitOf(G.res.tipC >= 0 ? G.res.tipC : 0) });
      }
      pts.forEach(function (p) { x.globalAlpha = p.a; x.fillStyle = K.inkColor(1); x.beginPath(); x.arc(X(p.x), Y(p.y), p.r, 0, 6.2832); x.fill(); });
      x.globalAlpha = 1;
      pts.forEach(function (p) { if (p.tip) { x.strokeStyle = ac; x.lineWidth = 2; x.beginPath(); x.arc(X(p.x), Y(p.y), p.r + 3, 0, 6.2832); x.stroke(); K.cvText(x, p.id, X(p.x) + p.r + 6, Y(p.y) + 4, { px: 11, color: K.inkColor(0.85) }); } });
      K.cvText(x, 'Result, your margin', L, 11, { px: 11 });
      K.cvText(x, 'Final poll average, your margin', R, H - 8, { px: 11, align: 'right' });
      K.cvText(x, 'Stronger dots: more ' + (useB ? 'degrees' : 'urban'), L + 4, B - 6, { px: 11 });
      ['−20', '0', '+20'].forEach(function (t, k) { K.cvText(x, t, X(-20 + 20 * k), H - 18, { px: 11, align: 'center' }); });
      var vh = body.querySelector('.ev-scatvh');
      if (vh) vh.textContent = 'Final poll average against result for each state, your margin: ' + pts.filter(function (p) { return Math.abs(p.x) < 15; }).map(function (p) { return p.id + ' polls ' + mS(p.x) + ', result ' + mS(p.y); }).join('; ') + '. Points above the dashed line did better than the polls.';
    }
    function paintCal() {
      var cv = body.querySelector('.ev-cal');
      if (!cv || !G) return;
      var f = K.fitCanvas(cv, 170), x = f.ctx, Wd = f.W, H = 170;
      if (!(Wd > 0)) return;
      x.clearRect(0, 0, Wd, H);
      var L = 34, R = Wd - 14, T = 16, B = H - 30, hs = G.fcHist, ac = K.ACC();
      function X(w) { return L + (R - L) * w / 9; }
      function Y(p) { return B - (B - T) * p; }
      x.strokeStyle = K.inkColor(0.14); x.lineWidth = 1;
      [0, 0.5, 1].forEach(function (p) { x.beginPath(); x.moveTo(L, Math.round(Y(p)) + 0.5); x.lineTo(R, Math.round(Y(p)) + 0.5); x.stroke(); K.cvText(x, Math.round(p * 100) + '%', L - 4, Y(p) + 4, { px: 11, align: 'right' }); });
      [3, 5, 7].forEach(function (w) { x.strokeStyle = K.inkColor(0.3); x.setLineDash([2, 3]); x.beginPath(); x.moveTo(X(w), T); x.lineTo(X(w), B); x.stroke(); x.setLineDash([]); K.cvText(x, 'Debate', X(w), T + 8, { px: 11, align: 'center' }); });
      G.events.forEach(function (e) { x.fillStyle = K.inkColor(0.6); x.fillRect(X(e.w) - 1, B - 6, 2, 6); });
      x.strokeStyle = ac; x.lineWidth = 2.2; x.lineJoin = 'round'; x.beginPath();
      hs.forEach(function (h, k) { if (k) x.lineTo(X(h.w), Y(h.pWin)); else x.moveTo(X(h.w), Y(h.pWin)); });
      x.stroke();
      x.fillStyle = ac;
      hs.forEach(function (h) { x.beginPath(); x.arc(X(h.w), Y(h.pWin), 2.5, 0, 6.2832); x.fill(); });
      for (var w = 0; w <= 9; w++) K.cvText(x, w ? 'W' + w : 'Start', X(w), H - 10, { px: 11, align: 'center' });
      var vh = body.querySelector('.ev-calvh');
      if (vh) vh.textContent = 'Win chance by week: ' + hs.map(function (h) { return (h.w ? 'week ' + h.w : 'start') + ' ' + F.prob(h.pWin); }).join(', ') + '.';
    }
    function paintAll() {
      if (!G) return;
      if (ui.phase === 'plan') { paintSnake(); paintHist(); }
      else if (ui.phase === 'night') paintLead();
      else if (ui.phase === 'debrief') { paintScatter(); paintCal(); }
    }

    /* ---------- wiring: every control is delegated from the root ---------- */
    function reselect(q) { var b = body.querySelector(q); if (b) { try { b.focus({ preventScroll: true }); } catch (e) {} } }
    function addRow(i) {
      if (ui.plan.rows.indexOf(i) < 0) ui.plan.rows.push(i);
      rowOrder(ui.plan);
      ui.tab = 0;
      Array.prototype.forEach.call(body.querySelectorAll('.ev-tabs [role="tab"]'), function (b, k) { b.setAttribute('aria-selected', k === 0 ? 'true' : 'false'); b.setAttribute('tabindex', k === 0 ? '0' : '-1'); });
      Array.prototype.forEach.call(body.querySelectorAll('.ev-panel'), function (p, k) { p.hidden = k !== 0; });
      renderPanel(0); renderSel(); renderMapIfPlan();
      var inp = body.querySelector('input[data-ad="' + i + '"]');
      if (inp) K.focus(inp, { scroll: true });
    }
    K.on(root, 'click', '[data-act]', function (ev, b) {
      var a = b.getAttribute('data-act'), k = b.getAttribute('data-k');
      if (b.tagName === 'SELECT') return;
      if (a !== 'replay' && a !== 'newmap' && ui.restart) { ui.restart = 0; if (ui.phase === 'plan') renderActions(); }
      if (a === 'side') { ui.side = k; renderSetup(); reselect('.ev-ticket[data-k="' + k + '"]'); return; }
      if (a === 'start') { startCampaign(); return; }
      if (a === 'newmap') {
        if (ui.phase === 'plan' && ui.restart !== 'newmap') { ui.restart = 'newmap'; renderActions(); reselect('[data-act="newmap"]'); return; }
        ui.restart = 0; ui.seed = newSeed(); ui.mir = 1; G = null; renderSetup(); K.focus(body.querySelector('.ev-focus'), { scroll: true }); return;
      }
      if (a === 'replay') {
        if (ui.restart !== 'replay') { ui.restart = 'replay'; renderActions(); reselect('[data-act="replay"]'); return; }
        ui.restart = 0; ui.seed = G.seed; ui.mir = G.mir; startCampaign(); return;
      }
      if (!G) return;
      if (a === 'lens') {
        ui.lens = k;
        if (k === 'twin') unlock('corr', 'The Error twins lens');
        if (k === 'pow') unlock('small', 'The Voter power lens');
        Array.prototype.forEach.call(body.querySelectorAll('.ev-lensb'), function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-k') === k ? 'true' : 'false'); });
        renderMap(); renderFeed(); return;
      }
      if (a === 'sel') { if (ui.phase === 'plan') select(+b.getAttribute('data-c')); reselect('.ev-dbtn[data-c="' + b.getAttribute('data-c') + '"]'); renderFeed(); return; }
      if (a === 'nsel') { ui.nsel = +b.getAttribute('data-c'); renderNightParts(); reselect('.ev-dbtn[data-c="' + ui.nsel + '"]'); return; }
      if (a === 'dossier') {
        ui.tab = 3;
        Array.prototype.forEach.call(body.querySelectorAll('.ev-tabs [role="tab"]'), function (t, j) { t.setAttribute('aria-selected', j === 3 ? 'true' : 'false'); t.setAttribute('tabindex', j === 3 ? '0' : '-1'); });
        Array.prototype.forEach.call(body.querySelectorAll('.ev-panel'), function (p, j) { p.hidden = j !== 3; });
        renderPanel(3); K.focus(panelEl(3).querySelector('.ev-dosh'), { scroll: true }); return;
      }
      if (a === 'addsel') { if (ui.sel >= 0 && ui.sel < NU) addRow(ui.sel); return; }
      if (a === 'msg') { ui.plan.msg = k; renderPanel(0); reselect('.lk-opt[data-act="msg"][data-k="' + k + '"]'); return; }
      if (a === 'evopt') { ui.plan.ev = k; renderPanel(0); reselect('.lk-opt[data-act="evopt"][data-k="' + k + '"]'); return; }
      if (a === 'suggest') { var Y = G.S[G.side]; ui.plan.nat = 0; ui.plan.man = {}; suggestReserved(ui.plan, Y); ui.plan.sug = false; rowOrder(ui.plan); renderPanel(0); renderMapIfPlan(); reselect('[data-act="suggest"]'); K.say('Filled the ads by tipping odds.'); return; }
      if (a === 'clearads') { for (var q = 0; q < NU; q++) { ui.plan.ads[q] = 0; ui.plan.man[q] = 1; } ui.plan.nat = 0; renderPanel(0); renderMapIfPlan(); reselect('[data-act="clearads"]'); return; }
      if (a === 'rmrow') { var u = +b.getAttribute('data-u'); ui.plan.ads[u] = 0; ui.plan.man[u] = 1; ui.plan.rows = ui.plan.rows.filter(function (x) { return x !== u; }); renderPanel(0); renderMapIfPlan(); reselect('[data-act="suggest"]'); return; }
      if (a === 'undo') { ui.plan = clonePlan(ui.base); renderPanel(0); renderMapIfPlan(); reselect('[data-act="undo"]'); K.say('Back to the start of the week’s plan.'); return; }
      if (a === 'commit') { commit(); return; }
      if (a === 'indep') { ui.indShown = !ui.indShown; unlock('corr', 'The independence comparison'); renderPanel(2); renderStrip(); renderFeed(); reselect('[data-act="indep"]'); return; }
      if (a === 'pk') { ui.pk = ui.pk === +k ? -1 : +k; unlock('house', 'The record of ' + POLLSTERS[+k].nm); renderPanel(1); renderFeed(); reselect('.ev-pl[data-k="' + k + '"]'); return; }
      if (a === 'read') { shelf.notes.open(b.getAttribute('data-note')); return; }
      if (a === 'play') { if (RM()) return; ui.auto = !ui.auto; renderNightParts(); reselect('[data-act="play"]'); if (ui.auto) schedule(); else stopAuto(); return; }
      if (a === 'nstep') { stopAuto(); advance((function () { var n = 0; return function () { return n++ < 1; }; })()); reselect('[data-act="nstep"]'); return; }
      if (a === 'nclose') {
        stopAuto();
        var T0 = G.night.T, nxt = 99;
        G.night.c.forEach(function (d) { if (d.cl > T0 && d.cl < nxt) nxt = d.cl; });
        advance(function () { return G.night.T < nxt; }); reselect(G.night.T >= 25 ? '[data-act="nstep"]' : '[data-act="nclose"]'); return;
      }
      if (a === 'nmorn') { stopAuto(); advance(function () { return G.night.T < 28; }); reselect('[data-act="nstep"]'); return; }
      if (a === 'nend') { stopAuto(); advance(function () { return !G.night.done; }); reselect('[data-act="post"], [data-act="nstep"]'); return; }
      if (a === 'prompt') { answer(b.getAttribute('data-p'), k); return; }
      if (a === 'post') { enterPost(); return; }
      if (a === 'req') {
        var it = ui.post.req, Yv = G.S[G.side];
        if (k === 'y' && Yv.cash >= it.cost) { Yv.cash -= it.cost; Yv.spent.recount += it.cost; it.paid = it.cost; doRecount(G, it, 'you'); }
        else if (k === 'y') { it.unaffYou = true; }
        finishCanvass(); renderPost(false); reselect('.ev-rec li'); K.focus(body.querySelector('.ev-rec') || body.querySelector('.ev-focus')); return;
      }
      if (a === 'lobby') {
        var H = G.night.house, d = H.dl.filter(function (x) { return x.id === k; })[0], n = H.dl.filter(function (x) { return x.lob; }).length;
        if (d && (d.lob || n < 2)) d.lob = !d.lob;
        renderPost(false); reselect('.ev-lob[data-k="' + k + '"]'); return;
      }
      if (a === 'housevote') { houseVote(G); renderPost(false); K.focus(body.querySelector('.ev-hres'), { scroll: true }); return; }
      if (a === 'debrief') { renderDebrief(); return; }
      if (a === 'cf') { var out = body.querySelector('.ev-cf'); if (out) out.textContent = counterfactual(); return; }
    });
    K.on(root, 'click', '.ev-tile', function (ev, b) {
      var c = +b.getAttribute('data-c');
      if (ui.phase === 'plan') select(c, 'map');
      else if (ui.phase === 'night') { ui.nsel = c; renderNightParts(); reselect('.ev-map .ev-tile[data-c="' + c + '"]'); }
      else if (ui.phase === 'setup') K.say(b.getAttribute('aria-label'));
    });
    K.on(root, 'keydown', '.ev-tile', function (ev, b) { mapKeys(ev, b); });
    K.on(root, 'focusin', '.ev-map--under .ev-tile', function (ev, b) { if (!V3.ex) return; V3.fig.classList.add('is-kbd'); v3Hov(+b.getAttribute('data-c')); });
    K.on(root, 'focusout', '.ev-map--under .ev-tile', function () { if (!V3.fig) return; V3.fig.classList.remove('is-kbd'); v3Hov(-1); });
    K.on(root, 'click', '.ev-snake', function (ev) { if (ui.phase === 'plan') snakeHit(ev); });
    K.on(root, 'input', 'input[type="range"]', function (ev, inp) {
      if (!G || ui.phase !== 'plan') return;
      var v = Math.round(+inp.value) || 0;
      if (inp.hasAttribute('data-ad')) {
        var i = +inp.getAttribute('data-ad'), row = inp.closest('.ev-row');
        ui.plan.ads[i] = v; ui.plan.man[i] = 1;
        row.querySelector('.lk-range-out').textContent = money(v);
        row.querySelector('[data-prev="' + i + '"]').textContent = adPrev(i, v);
        inp.setAttribute('aria-valuetext', adVT(i, v));
      } else if (inp.hasAttribute('data-nat')) {
        ui.plan.nat = v;
        var pn = panelEl(0);
        pn.querySelector('.ev-natout').textContent = money(v);
        pn.querySelector('.ev-natprev').textContent = natPrev(v);
        inp.setAttribute('aria-valuetext', v + ' million dollars');
      }
      K.sfill(inp.parentNode);
      updateBudget();
      if (ui.lens === 'plan') renderMap();
    });
    K.on(root, 'change', 'select', function (ev, s) {
      if (!G || ui.phase !== 'plan') return;
      if (s.getAttribute('data-act') === 'addrow') { var v = s.value; if (v !== '') addRow(+v); return; }
      var sl = s.getAttribute('data-slot');
      if (sl) { ui.plan[sl.charAt(0)][+sl.charAt(1)] = s.value; if (debateWeek(G.week) && sl.charAt(0) === 'c') { var p0 = panelEl(0), keep = sl; renderPanel(0); reselect('select[data-slot="' + keep + '"]'); } else updateBudget(); }
    });

    /* ---------- debug hooks (?labdebug=1 only) ---------- */
    function simWeeks(n) {
      if (ui.busy || (G && !G.fc)) return;
      if (!G) { G = genWorld({ seed: ui.seed, era: ui.era, scen: ui.scen, side: ui.side, mir: ui.mir }); openingPolls(G); forecastSync(G); G.fcAtStart = false; prepEvent(G); ui.plan = defaultPlan(); ui.phase = 'plan'; }
      for (var k = 0; k < n && G.week <= 9; k++) {
        var p = ui.plan || defaultPlan(), w = G.week;
        if (G.evt && !p.ev) p.ev = evOpts(G, G.evt)[0].k;
        var ep = effPlan(G, p, G.S[G.side]), aB = Float64Array.from(G.S[G.side].A), res = commitA(G, p, say);
        forecastSync(G); afterWeek(w, res, ep, aB);
      }
      if (G.week <= 9) renderCampaign(false);
    }
    K.hook(SLUG, {
      open: function (ph) {
        if (ph === 'tie') {
          simWeeks(9); advance(function () { return !G.night.done; }); while (ui.prompt) answer(ui.prompt, ui.prompt === 'speech' ? 'count' : 'later'); advance(function () { return !G.night.done; });
          var ord = [], reach = { 0: [] }, k, j;
          for (k = 0; k < 56; k++) ord.push(k);
          ord.sort(function (a, b) { return EV56[b] - EV56[a]; });
          ord.forEach(function (c) { var ks = Object.keys(reach); for (j = ks.length - 1; j >= 0; j--) { var s = +ks[j] + EV56[c]; if (s <= 269 && !reach[s]) reach[s] = reach[ks[j]].concat([c]); } });
          var mine = {}; (reach[269] || []).forEach(function (c) { mine[c] = 1; });
          G.night.c.forEach(function (d) { d.fin = (mine[d.c] ? 1 : -1) * G.sy * (2 + Math.abs(d.fin)); G.night.fin[d.c] = d.fin; });
          enterPost(); return;
        }
        if (ph === 'night' || ph === 'debrief') { simWeeks(9); if (ph === 'debrief') { advance(function () { return !G.night.done; }); while (ui.prompt) answer(ui.prompt, ui.prompt === 'speech' ? 'count' : 'later'); advance(function () { return !G.night.done; }); enterPost(); if (!ui.post.done) { finishCanvass(); } if (G.res.win === 'tie' && !G.night.house.done) houseVote(G); renderDebrief(); } } else simWeeks(+ph || 1); },
      v3: function () { return V3; },
      state: function () { return G ? { seed: G.seed, week: G.week, phase: ui.phase, side: G.side, cash: G.S[G.side].cash, pWin: G.fc && G.fc.pWin, res: G.res || null, era: G.era } : { phase: ui.phase }; },
      sim: simWeeks
    });

    renderSetup();
    K.repaint(paintAll, root);
    return {
      pause: function () {
        ui.visible = false;
        if (ui.auto && ui.phase === 'night') { stopAuto(); nsay('DESK', 'Paused while you were away.'); renderNightParts(); }
        clearTimeout(ui.timer); ui.timer = 0;
      },
      resume: function () { ui.visible = true; paintAll(); if (ui.auto) schedule(); }
    };
  }

  var ENGINE = { U: U, CI: CI, EV56: EV56, TILES: TILES, KIDS: KIDS, CONT: CONT, EV_STATES: EV_STATES, EV_DISTRICTS: EV_DISTRICTS, NU: NU,
    genWorld: genWorld, makePolls: makePolls, openingPolls: openingPolls, updateAverages: updateAverages, forecastSync: forecastSync, prepEvent: prepEvent, evOpts: evOpts,
    evText: evText, emptyPlan: emptyPlan, clonePlan: clonePlan, suggestAds: suggestAds, suggestSlots: suggestSlots, commitA: commitA, commitB: commitB,
    electionDay: electionDay, nightStep: nightStep, calledEV: calledEV, paths: paths, canvass: canvass, doRecount: doRecount, finalResult: finalResult,
    houseSetup: houseSetup, houseVote: houseVote, effPlan: effPlan, tipsOrder: tipsOrder, viewMargins: viewMargins, rho: rho, twins: twins };
  if (typeof module === 'object' && module && module.exports) module.exports = ENGINE;
  if (typeof init === 'function') K.mount(SLUG, null, init);
})();
