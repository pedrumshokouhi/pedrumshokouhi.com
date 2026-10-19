/* Final round: a strategy-firm final round in four cases, a lunch with a partner and an offer committee.
   A machine for the P.S. lab on LAB_KIT v1. Seeded (K.rng), event-driven, no loops, no canvas: every bar is HTML.
   The firm, the clients, the people and the case numbers are fiction; the public facts live in the case file with sources. */
(function () {
  'use strict';
  var K = window.LAB_KIT;
  if (!K || K.v < 1) return;
  var SLUG = 'case', F = K.fmt, E = K.esc;

  /* ---------- small helpers ---------- */
  function tm(k, l) { return K.term(k, l); }
  function r1(v) { return Math.round(v * 10) / 10; }
  function mm(v, d) { return F.M(v, d == null ? 1 : d); }
  function bb(v) { return F.B(v, 1); }
  function usd(v, d) { return F.usd(v, d || 0); }
  function pc(v, d) { return F.n(v, d == null ? 1 : d) + '%'; }
  function nn(v, d) { return F.n(v, d || 0); }
  function xx(v, d) { return F.x(v, d == null ? 2 : d); }
  function sgn(v, d) { return F.signed(v, d == null ? 1 : d); }
  function find(a, id) { for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function has(a, x) { return a.indexOf(x) >= 0; }
  function val(x, a, b, c) { return typeof x === 'function' ? x(a, b, c) : x; }
  function clone(o) { var c = {}; for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) c[k] = o[k]; return c; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  var KEEP = /^(I|Porter’s|BCG’s|Bain’s|McKinsey’s|Stavholm|Saltmarsh|Vellum|Larkspur|Kilnworth|Slipline|Kettle|Bayline|Hollowell’s|Crossroads|MoviePass|ALDI|Lidl)$/;
  function lc(s) { s = String(s); var w = s.split(/[\s,:;]/)[0]; return KEEP.test(w) || /^[A-Z0-9]{2,}/.test(w) ? s : s.charAt(0).toLowerCase() + s.slice(1); }
  function strip(h) { return String(h).replace(/<[^>]+>/g, ''); }
  /* a table with a text first column; rows are arrays, or {v: [...], c: 'class'} */
  function table(head, rows, cls) {
    return '<div class="lk-scroll"><table class="lk-table cs-t ' + (cls || '') + '">' +
      (head ? '<thead><tr>' + head.map(function (h) { return '<th scope="col">' + h + '</th>'; }).join('') + '</tr></thead>' : '') +
      '<tbody>' + rows.map(function (r) {
        var cells = r.v || r;
        return '<tr' + (r.c ? ' class="' + r.c + '"' : '') + '>' + cells.map(function (x) { return '<td>' + x + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>';
  }
  function kv(rows) { return table(null, rows, 'cs-kv'); }
  /* HTML bars with a visually hidden table twin; rows {k, v, lab, cls} */
  function bars(rows, o) {
    o = o || {};
    var mx = o.max || Math.max.apply(null, rows.map(function (r) { return Math.abs(r.v); })) || 1;
    return '<div class="cs-bars' + (o.cls ? ' ' + o.cls : '') + '" aria-hidden="true">' + rows.map(function (r) {
      return '<div class="cs-bar' + (r.cls ? ' ' + r.cls : '') + '"><span class="cs-bar-k">' + r.k + '</span><span class="cs-bar-t"><i style="--w:' +
        clamp(Math.abs(r.v) / mx, 0, 1).toFixed(3) + '"></i></span><span class="cs-bar-v">' + r.lab + '</span></div>';
    }).join('') + '</div><table class="vh"><caption>' + (o.cap || 'Chart data') + '</caption><tbody>' + rows.map(function (r) {
      return '<tr><th scope="row">' + strip(r.k) + '</th><td>' + strip(r.lab) + '</td></tr>';
    }).join('') + '</tbody></table>';
  }

  /* ---------- knowledge: field notes, glossary, takeaways, case file ---------- */
  var S_BAIN = { t: 'Bain & Company: Case interview preparation', u: 'https://www.bain.com/careers/hiring-process/case-interview/' };
  var S_BCGI = { t: 'BCG: Case interview preparation', u: 'https://careers.bcg.com/global/en/case-interview-preparation' };
  var S_HTCI = { t: 'Hacking the Case Interview: Interviewer-led case interview guide', u: 'https://www.hackingthecaseinterview.com/pages/interviewer-led-case-interview' };
  var S_MECE = { t: 'Wikipedia: MECE principle', u: 'https://en.wikipedia.org/wiki/MECE_principle' };
  var S_MINTO = { t: 'Wikipedia: Barbara Minto', u: 'https://en.wikipedia.org/wiki/Barbara_Minto' };
  var S_MSITE = { t: 'Barbara Minto: the pyramid principle', u: 'https://www.barbaraminto.com/' };
  var S_PARETO = { t: 'Wikipedia: Pareto principle', u: 'https://en.wikipedia.org/wiki/Pareto_principle' };
  var S_FERMI = { t: 'Wikipedia: Fermi problem', u: 'https://en.wikipedia.org/wiki/Fermi_problem' };
  var S_PORTER = { t: 'Harvard Business Review: Porter, How Competitive Forces Shape Strategy (March 1979)', u: 'https://hbr.org/1979/03/how-competitive-forces-shape-strategy' };
  var S_BCG70 = { t: 'BCG: Henderson, The Product Portfolio (1970)', u: 'https://www.bcg.com/publications/1970/strategy-the-product-portfolio' };
  var S_GSM = { t: 'Wikipedia: Growth-share matrix', u: 'https://en.wikipedia.org/wiki/Growth%E2%80%93share_matrix' };
  var S_MCK = { t: 'Wikipedia: McKinsey & Company', u: 'https://en.wikipedia.org/wiki/McKinsey_%26_Company' };
  var S_BCGW = { t: 'Wikipedia: Boston Consulting Group', u: 'https://en.wikipedia.org/wiki/Boston_Consulting_Group' };
  var S_BAINW = { t: 'Wikipedia: Bain & Company', u: 'https://en.wikipedia.org/wiki/Bain_%26_Company' };
  var S_BCGPR = { t: 'BCG press release, April 23, 2026', u: 'https://www.bcg.com/press/23april2026-bcg-revenue-22nd-consecutive-year-growth' };
  var S_MAI1 = { t: 'David Maister: The Anatomy of a Consulting Firm', u: 'http://davidmaister.com/articles/4/2/' };
  var S_MAI2 = { t: 'David Maister: Results and Rewards in the Multi-Group Firm', u: 'https://davidmaister.com/articles/results-and-rewards-in-the-multi-group-firm/' };
  var S_AMC = { t: 'AMC Entertainment, Form 10-K for 2024 (SEC)', u: 'https://www.sec.gov/Archives/edgar/data/1411579/000141157925000042/amc-20241231x10k.htm' };
  var S_CNK = { t: 'Cinemark Holdings, Form 10-K for 2024 (SEC)', u: 'https://www.sec.gov/Archives/edgar/data/1385280/000095017025022756/cnk-20241231.htm' };
  var S_MP = { t: 'Wikipedia: MoviePass', u: 'https://en.wikipedia.org/wiki/MoviePass' };
  var S_BLS = { t: 'BLS: Consumer Expenditures in 2024 (December 19, 2025)', u: 'https://www.bls.gov/news.release/cesan.nr0.htm' };
  var S_ALDIP = { t: 'ALDI US: property requirements', u: 'https://corporate.aldi.us/real-estate/property-requirements' };
  var S_ALDIW = { t: 'ALDI: to acquire Winn-Dixie and Harveys Supermarket (August 16, 2023)', u: 'https://dm.cms.aldi.cx/is/content/prod1amer/ALDI_to_Acquire_Winn-Dixie_and_Harveys_Supermarket_to_Continue_Growth_in_the_Southeastpdf' };
  var S_ALDIG = { t: 'ALDI US: Doubles down on growth in 2026 (January 12, 2026)', u: 'https://corporate.aldi.us/newsroom/news/aldi-us-doubles-down-on-growth-in-2026' };
  var S_ALDI1 = { t: 'ALDI US: ALDI 101', u: 'https://corporate.aldi.us/about-us/aldi-101' };
  var S_INQ = { t: 'Philadelphia Inquirer: Lidl scales back its Philadelphia store (June 22, 2018)', u: 'https://www.inquirer.com/philly/business/real_estate/commercial/lidl-german-grocer-port-richmond-philadelphia-20180622.html' };
  var S_ICSC = { t: 'ICSC: Lidl reconsiders U.S. expansion strategy (January 2018)', u: 'https://www.icsc.com/news-and-views/icsc-exchange/lidl-reconsiders-u.s.-expansion-strategy' };
  var S_SN = { t: 'Supermarket News: Lidl U.S. was stripped down and built back up (September 30, 2025)', u: 'https://www.supermarketnews.com/company-news/lidl-u-s-s-journey-included-being-stripped-down-and-built-back-up' };
  var S_VCA = { t: 'VCA Inc. announcement of the Mars agreement, SEC exhibit 99.1 (January 9, 2017)', u: 'https://www.sec.gov/Archives/edgar/data/817366/000119312517005171/d321268dex991.htm' };
  var S_APPA = { t: 'American Pet Products Association: industry trends and stats', u: 'https://americanpetproducts.org/industry-trends-and-stats' };
  var S_FHWA = { t: 'FHWA Highway Statistics 2023, Table VM-1', u: 'https://www.fhwa.dot.gov/policyinformation/statistics/2023/vm1.cfm' };
  var S_EIA = { t: 'EIA: Gasoline and Diesel Fuel Update', u: 'https://www.eia.gov/petroleum/gasdiesel/' };
  var S_AFDC = { t: 'DOE Alternative Fuels Data Center: average annual vehicle miles traveled', u: 'https://afdc.energy.gov/data/10309' };
  var S_EVC = { t: 'Wikipedia: Economic value to the customer', u: 'https://en.wikipedia.org/wiki/Economic_value_to_the_customer' };
  var S_VBP = { t: 'Wikipedia: Value-based pricing', u: 'https://en.wikipedia.org/wiki/Value-based_pricing' };

  var NOTES = [
    { id: 'styles', term: 'Two styles of case', note: 'In an interviewer-led case you are steered exhibit by exhibit; in a candidate-led case you decide what to ask for, and every request costs time. Prep guides commonly describe McKinsey’s case as the first style and BCG’s and Bain’s as the second. Both reward the same habits: structure, clean math, implications, an answer.', src: [S_HTCI], hint: 'you open any case' },
    { id: 'clarify', term: 'Clarify before you solve', note: 'The first minutes decide which problem you solve. Ask what the client is trying to achieve, how success is measured, and whether anything unusual changed. Bain’s own advice is to make sure you understand the question before diving in. Do not ask for data you should be forming a hypothesis about.', src: [S_BAIN], hint: 'you ask your first clarifying question' },
    { id: 'mece', term: 'MECE', note: 'Mutually exclusive, collectively exhaustive: branches that do not overlap and together cover the whole question. Barbara Minto developed the idea at McKinsey in the late 1960s, and says it rhymes with geese. It is a test you apply to a list, not a list you memorize, and its critics note that forcing clean partitions can be needlessly limiting.', src: [S_MECE, S_MINTO], hint: 'you open the Structure phase' },
    { id: 'tree', term: 'Issue tree', note: 'A question broken into sub-questions until each can be answered with data. Profit trees split by arithmetic (revenue minus cost); decision trees split by what must be true. A good tree tells you which exhibit to ask for next.', hint: 'you lay out an issue tree' },
    { id: 'hyp', term: 'Hypothesis-driven', note: 'State your best guess early, then look for the data that could kill it. It beats surveying everything, as long as you drop the guess when the data turns. Holding on to a disproven hypothesis is anchoring, and interviewers watch for it.', hint: 'you pick a hypothesis' },
    { id: 'framework', term: 'When not to use a framework', note: 'Frameworks are scaffolding. Porter’s five forces (Harvard Business Review, 1979) explains why an industry earns what it earns; it will not tell you why one chain lost so much of its profit in a year. BCG’s growth-share matrix (1970) balances a portfolio of businesses; it does not decide one market entry. Pick the structure the question implies, then borrow.', src: [S_PORTER, S_BCG70], hint: 'you lay out a structure or reach for a framework card' },
    { id: 'profitTree', term: 'The profit tree', note: 'Profit equals revenue minus cost; revenue equals volume times price, often best expressed per customer; costs split into variable and fixed. Walk it from the top until the numbers stop moving: the branch that moves is the story.', hint: 'you structure the cinema case' },
    { id: 'contribution', term: 'Contribution', note: 'What one more unit earns after the costs it causes. For a cinema seat: the ticket after film rent, plus concession margin, plus other revenue. Decisions at the margin (one more showtime, one more member) are won or lost on contribution, never on averages.', hint: 'you meet contribution in the cinema or pricing case' },
    { id: 'adverse', term: 'Adverse selection', note: 'A flat price attracts the customers who will use the most. MoviePass cut its price to $9.95 a month for up to a film a day in August 2017, paid for each ticket through a prepaid card, passed three million subscribers by June 2018, and announced its closure in September 2019. Price the heavy user, or the heavy user prices you.', src: [S_MP], hint: 'you meet the monthly pass in the cinema case' },
    { id: 'pareto', term: '80/20', note: 'A few causes usually drive most of the effect. Vilfredo Pareto noticed it in Italian land ownership; Joseph Juran carried it into quality control and called it the vital few. The ratio is a habit of mind, not a law: find the vital few before analyzing the many.', src: [S_PARETO], hint: 'you open a cost bridge or make a third data request' },
    { id: 'soWhat', term: 'So what?', note: 'Every exhibit earns its place with one sentence that says what it means for the decision. In a deck that sentence is the slide’s title. A title that describes the chart is a wasted slide; a title that overreaches is a dangerous one.', hint: 'you choose your first so-what' },
    { id: 'sanity', term: 'Sanity check', note: 'Before using a number, ask whether it could be true: does the total add, are the units right, is the answer the right order of magnitude? A regional grocery market in millions instead of billions, or a truck that burns 1,492 gallons a year, should stop you cold.', hint: 'you flag an exhibit, or a planted error gets past you' },
    { id: 'mentalMath', term: 'Mental math habits', note: 'Round early and say that you are rounding. Track zeros with shorthand: 15 thousand gallons at $6.4 is about 96 thousand dollars. Flip percentages when it helps: 8 percent of 50 is 50 percent of 8. Divide by turning the question around: 22 over 3.2 is a little under 7, because 3.2 times 7 is 22.4.', hint: 'you give your first numeric answer' },
    { id: 'sizing', term: 'Market sizing', note: 'Top-down starts from a known total and narrows (households times spend); bottom-up builds from units (stores times sales per store). Do both when you can; if they disagree by three times, an assumption is wrong. Fermi estimates work better than you would fear because over- and under-estimates partly cancel.', src: [S_FERMI], hint: 'you size a market in the grocer or freight case' },
    { id: 'entry', term: 'Entry modes', note: 'Build, buy or partner. Building is cheaper per store and slower; buying is faster and brings someone else’s sites, people and habits; partnering shares both the upside and the control. The price of the target usually decides, and the value of time is the tiebreaker.', hint: 'you reach build or buy in the grocer case' },
    { id: 'payback', term: 'Payback and breakeven', note: 'Payback is the up-front investment divided by the annual cash it returns; breakeven volume is fixed cost divided by contribution per unit. Crude and fast, and the first question a store operator or a fleet buyer will ask.', hint: 'you open the store economics in the grocer case' },
    { id: 'ebitda', term: 'EBITDA and multiples', note: 'EBITDA is earnings before interest, taxes, depreciation and amortization, a rough proxy for operating cash. Businesses are priced as a multiple of it, so each $1M of overstated EBITDA at 15 times is $15M of overpayment.', hint: 'you open the due diligence case' },
    { id: 'qoe', term: 'Quality of earnings', note: 'Sellers present adjusted EBITDA: reported earnings plus add-backs for costs they call one-time. A cost that happens every year is not one-time. Due diligence exists largely to find the add-backs that recur.', hint: 'you open the EBITDA bridge in the due diligence case' },
    { id: 'moic', term: 'MOIC, IRR and the rule of 72', note: 'MOIC is money out divided by money in; IRR is the annual rate that gets you there. Money doubles in about 72 divided by the rate years, so 2x in five years is about 14 to 15 percent a year, and 2.5x is about 20.', hint: 'you open the returns exhibit in the due diligence case' },
    { id: 'arbitrage', term: 'Multiple arbitrage', note: 'Buy small companies at low multiples, bolt them onto a platform valued at a higher multiple, and value appears on paper. It is real only if the exit multiple holds and the add-ons integrate.', hint: 'you open the seller’s value creation plan' },
    { id: 'evc', term: 'Economic value to the customer', note: 'The most a rational customer would pay: the price of the next best alternative (reference value) plus the extra value you deliver over it (differentiation value). Price below it so the customer also wins. John Forbis and Nitin Mehta set the method out in 1979: start from the next best alternative’s price, add the value of everything that differs, then choose how much of that extra to capture.', src: [S_EVC], hint: 'you meet the next best alternative in the pricing case' },
    { id: 'costPlus', term: 'Cost-plus versus value pricing', note: 'Cost-plus sets price from your costs; value pricing sets it from the customer’s gain. Cost is a floor, never the answer. Pricing far below value makes sense only when scale or network effects reward share.', hint: 'you compare three ways to set a price' },
    { id: 'volatility', term: 'Pricing under volatility', note: 'When a customer’s value swings with an input such as fuel, a fixed price is a bet. Payback guarantees, indexed prices and shared savings move part of that bet to whoever can best carry it.', hint: 'you open the diesel exhibit in the pricing case' },
    { id: 'pyramid', term: 'The pyramid principle', note: 'Lead with the governing thought, support it with a few distinct reasons, support each with data. Barbara Minto’s Situation, Complication, Question tells you what the listener is really asking. Most people present in the order they discovered things; executives want the reverse.', src: [S_MSITE, S_MINTO], hint: 'you reach the Recommend phase' },
    { id: 'firm', term: 'The pyramid firm', note: 'Consulting firms are pyramids: finders who sell, minders who run the work, grinders who do it. In David Maister’s arithmetic, profit per partner is the product of margin, rate, utilization and leverage. More juniors per partner means more profit and slimmer odds of making partner, which is why up-or-out exists and why firms need growth.', src: [S_MAI1, S_MAI2], hint: 'you have lunch with a partner' }
  ];

  var DEFS = {
    opprofit: { t: 'Operating profit', d: 'What the business earns from running itself, before interest and taxes. In this case it is measured theatre by theatre, after rent and before depreciation.', note: 'profitTree' },
    opmargin: { t: 'Operating margin', d: 'Operating profit as a share of revenue. A chain can grow revenue and still lose margin if costs grow faster.', note: 'profitTree' },
    contribution: { t: 'Contribution', d: 'What one more unit (a seat, a visit, a store) earns after the costs it causes. The number that decides anything done at the margin.', note: 'contribution' },
    filmrent: { t: 'Film rent', d: 'The share of ticket revenue a cinema pays the distributor for the right to show a film, often set on a sliding scale by how the film performs.' },
    occupancy: { t: 'Occupancy', d: 'Two meanings in a cinema: the share of seats filled, and the cost of the buildings themselves (rent and property costs). Ask which one someone means.' },
    perpatron: { t: 'Per patron', d: 'Divided by attendance. Revenue per patron says what each visit is worth, which is often clearer than the total.' },
    ownlabel: { t: 'Own label', d: 'Products sold under the retailer’s own brand instead of a national brand: cheaper to buy, and a large part of how discounters keep prices low.' },
    capex: { t: 'Capex', d: 'Capital expenditure: money spent up front on long-lived assets such as a store fit-out or a distribution center.' },
    payback: { t: 'Payback', d: 'Up-front investment divided by the cash it returns each year. Crude, fast, and the first question an operator asks.', note: 'payback' },
    breakeven: { t: 'Breakeven', d: 'The volume, share or price at which what you gain exactly covers what it costs.', note: 'payback' },
    ebitda: { t: 'EBITDA', d: 'Earnings before interest, taxes, depreciation and amortization: a rough proxy for the cash a business generates from operations.', note: 'ebitda' },
    addback: { t: 'Add-back', d: 'A cost the seller adds back to earnings on the grounds that it will not recur. Diligence asks whether it really will not.', note: 'qoe' },
    runrate: { t: 'Run-rate', d: 'What the business earns in a normal year at its current size: genuine one-offs removed, recurring costs left in.', note: 'qoe' },
    qoe: { t: 'Quality of earnings', d: 'A review of whether reported and adjusted earnings reflect what the business will really earn from here.', note: 'qoe' },
    ev: { t: 'Enterprise value', d: 'The price of the whole business, owed to lenders and owners together: equity value plus net debt.' },
    moic: { t: 'MOIC', d: 'Multiple on invested capital: money out divided by money in. 2.5x means every dollar came back as two and a half.', note: 'moic' },
    irr: { t: 'IRR', d: 'Internal rate of return: the annual rate that turns the money in into the money out, given when each flow happens.', note: 'moic' },
    arb: { t: 'Multiple arbitrage', d: 'Buying earnings at a low multiple and owning them inside a business valued at a higher one.', note: 'arbitrage' },
    proforma: { t: 'Pro forma', d: 'As if: figures restated as though an event, such as buying four clinics, had happened at the start of the period.' },
    evc: { t: 'Economic value to the customer', d: 'The most a rational customer would pay: the price of the next best alternative plus the value of what makes you better.', note: 'evc' },
    refval: { t: 'Reference value', d: 'The price of the customer’s next best alternative: the floor of the value argument.', note: 'evc' },
    difval: { t: 'Differentiation value', d: 'The extra value your product delivers over the next best alternative, counted in the customer’s money.', note: 'evc' },
    costplus: { t: 'Cost-plus', d: 'Setting price as cost plus a markup. Simple, and blind to what the product is worth to the buyer.', note: 'costPlus' },
    util: { t: 'Utilization', d: 'The share of available hours billed to clients; also called chargeability.', note: 'firm' },
    leverage: { t: 'Leverage', d: 'Two meanings. In finance, borrowed money that magnifies returns and risk. In a consulting firm, the number of juniors for each partner.', note: 'firm' },
    mece: { t: 'MECE', d: 'Mutually exclusive, collectively exhaustive: no overlaps between branches, no gaps in what they cover.', note: 'mece' }
  };

  var TAKE = [
    'Find out what the client is solving for before you solve anything.',
    'A structure is good when its branches do not overlap, cover the question, and tell you what data to ask for next. Frameworks are scaffolding, not answers.',
    'Start with a hypothesis, then go looking for the number that could kill it.',
    'Spend your time where the money is: the vital few cost lines, the one exhibit that moves.',
    'Every chart needs a so-what, and every total needs a sanity check.',
    'Say the answer first, give three different reasons, name the risk, and stop.',
    'Price from the customer’s value, not your cost; the next best alternative anchors the argument.',
    'In a deal, the price you pay is the biggest decision you make, and one-time costs that happen every year are not one-time.'
  ];

  var AS_OF = 'September 30, 2026';
  var CASEFILE = {
    disclaimer: 'This is an educational simulation, not an official preparation tool of any firm, and nothing in it is investment or pricing advice. The scoring rubric, the interview clock and the committee rules are illustrative.',
    lede: 'What is real, what is a model assumption, and what is invented.',
    asOf: AS_OF,
    facts: [
      { text: 'BCG describes its case interview as a realistic business problem you work through step by step: structure your approach, ask questions, analyze data, perform quick calculations and communicate clearly. Bain describes a structured conversation about a real business problem and advises making sure you understand the question before diving in.', src: [S_BCGI, S_BAIN] },
      { text: 'Prep guides commonly describe McKinsey’s case interviews as interviewer-led and BCG’s and Bain’s as mostly candidate-led; the same guides note exceptions in both directions.', src: [S_HTCI] },
      { text: 'Barbara Minto graduated from Harvard Business School in 1963, was the first female MBA hired by McKinsey (Cleveland, 1963), worked in London from 1966 to 1973, developed MECE in the late 1960s and published The Pyramid Principle in 1985. She teaches a Situation, Complication, Question framework.', src: [S_MINTO, S_MECE, S_MSITE] },
      { text: 'McKinsey was founded in Chicago in 1926 by James O. McKinsey; Marvin Bower joined in 1933 and was managing director from 1950 to 1967. BCG was founded in Boston in 1963 by Bruce Henderson. Bain was founded in 1973 by Bill Bain and colleagues from BCG.', src: [S_MCK, S_BCGW, S_BAINW] },
      { text: 'Bruce Henderson introduced the growth-share matrix in The Product Portfolio (1970). Michael Porter’s How Competitive Forces Shape Strategy appeared in Harvard Business Review in March 1979.', src: [S_BCG70, S_GSM, S_PORTER] },
      { text: 'Pareto’s observation about Italian land ownership became the 80/20 rule; Joseph Juran applied it to quality control and called it the vital few. Fermi estimates tend to beat intuition because over- and under-estimates partly cancel.', src: [S_PARETO, S_FERMI] },
      { text: 'BCG reported 2025 revenue of $14.4 billion, up 7% from $13.5 billion, and 33,500 employees, in a press release dated April 23, 2026.', src: [S_BCGPR] },
      { text: 'David Maister described consulting firms as finders, minders and grinders, and profit per partner as the product of margin, rate, utilization and leverage.', src: [S_MAI1, S_MAI2] },
      { text: 'AMC’s 2024 results: admissions revenue $2,560.5M against film exhibition costs of $1,239.2M (48.4%); food and beverage revenue $1,624.9M against costs of $305.6M (18.8%).', src: [S_AMC] },
      { text: 'Cinemark negotiates most film rental rates on a sliding scale set by a rate matrix agreed with each distributor before a film’s run, and some on firm terms.', src: [S_CNK] },
      { text: 'MoviePass cut its price to $9.95 a month for up to one film a day in August 2017, loaded each ticket’s cost onto a prepaid card, passed three million subscribers by June 2018, and shut down on September 14, 2019.', src: [S_MP] },
      { text: 'US consumer units spent an average of $6,224 on food at home in 2024.', src: [S_BLS] },
      { text: 'ALDI’s published site requirement is about 22,000 square feet with at least 95 parking spaces. In August 2023 it agreed to acquire about 400 Winn-Dixie and Harveys stores in Alabama, Florida, Georgia, Louisiana and Mississippi and to evaluate which to convert to its format. It expects nearly 2,800 US stores by the end of 2026 and targets 3,200 by the end of 2028.', src: [S_ALDIP, S_ALDIW, S_ALDIG] },
      { text: 'Lidl opened its first US stores in June 2017 with plans for about 100 within a year; a year later it had 53, built to a 36,000 square foot template, which the Inquirer in 2018 called about twice the size of a typical ALDI store, and was looking to lease sites of 15,000 to 25,000 square feet. In 2025 it ran about 192 US stores and had cut its core range from 4,500 products to 3,250.', src: [S_ICSC, S_INQ, S_SN] },
      { text: 'In January 2017 Mars agreed to buy VCA, then nearly 800 animal hospitals, for $93 a share, about 41% above its 30-day average price: about $9.1 billion including $1.4 billion of debt.', src: [S_VCA] },
      { text: 'Americans spent $158 billion on pets in 2024, including $41.0 billion on vet care and product sales; 95 million US households own a pet.', src: [S_APPA] },
      { text: 'In 2023 the US had 3,324,112 registered combination trucks, averaging 58,890 miles and 6.7 miles per gallon, and burning about 29.3 billion gallons.', src: [S_FHWA, S_AFDC] },
      { text: 'US on-highway diesel averaged $6.382 a gallon in the week of September 28, 2026, $2.628 above a year earlier.', asOf: AS_OF, src: [S_EIA] },
      { text: 'Value-based pricing sets a price from the value a product has for the customer, not from its cost. Economic value to the customer, a method developed in 1979 by John L. Forbis and Nitin T. Mehta, adds the total additional value a product delivers to the price of the next best alternative; the seller then chooses what portion of that additional value to capture.', src: [S_VBP, S_EVC] }
    ],
    assumptions: [
      'Every number inside the four cases (Vellum’s P&L, Stavholm’s store economics, Larkspur’s EBITDA bridge, Slipline’s fuel savings) is invented to teach the arithmetic. Where a case uses a real input (diesel, truck fuel economy, grocery spend, pet spending), the exhibit says so and cites it.',
      'Each case has two or three root-cause variants and three levels of jitter that move the numbers; a planted exhibit error appears in about seven seeds in ten. Same seed, same case.',
      'The interview clock, its costs in minutes, the four scoring dimensions, the 1 to 4 scale, the note library and the verdict thresholds are this machine’s rules, written to reward the habits prep guides describe. They are not any firm’s rubric.',
      'Two caps are game rules too: without a recommendation the verdict stops at Lean no, and a Strong yes needs the exhibit that decides the case and no holes (no dimension below 2.5, no wrong number said aloud, no missed error). So is the offer committee rule (a mean of 3.0 or better, no dimension below 2.5, no case scored No; 2.6 with no case scored No earns an offer with a development note).',
      'The lunch model (fees per professional, profit per partner, odds of making partner with seven years to partner and 5% of partners leaving each year) is an illustrative version of Maister’s arithmetic, not any firm’s numbers.',
      'Splitting economic value into reference value (the alternative’s price) and differentiation value (the extra the product delivers) is this machine’s vocabulary for the Forbis and Mehta method.',
      'Slipline’s trucks run 100,000 highway miles a year (the national average for combination trucks is 58,890); 35% of trucks are in fleets of 50 or more running mostly highway, and 5% adopt by year five.'
    ],
    fiction: [
      'The firm, which is never named, and every person in it: Elena Marsh, Samir Haddad, Joanna Cho, Rafael Duarte and Iris Aske.',
      'Vellum Cinemas, Vellum Unlimited and Vellum Rewards.',
      'Stavholm, Saltmarsh Grocers, Kettle Lane, Crossroads Supercenters, Bayline Foods and Hollowell’s.',
      'Kilnworth Capital and Larkspur Veterinary Partners.',
      'Slipline Systems and its retrofit kit.'
    ],
    sources: [S_BCGI, S_BAIN, S_HTCI, S_MINTO, S_MECE, S_MSITE, S_MCK, S_BCGW, S_BAINW, S_BCG70, S_GSM, S_PORTER, S_PARETO, S_FERMI, S_BCGPR, S_MAI1, S_MAI2,
      S_AMC, S_CNK, S_MP, S_BLS, S_ALDIP, S_ALDIW, S_ALDIG, S_ALDI1, S_ICSC, S_INQ, S_SN, S_VCA, S_APPA, S_FHWA, S_AFDC, S_EIA, S_VBP, S_EVC]
  };

  /* ---------- the cases: content is data, the engine below is generic ---------- */
  function srcLine(text, src) {
    return '<p class="cs-src">Source: ' + text + (src ? ' ' + src.map(function (s) {
      return '<a href="' + E(s.u) + '" target="_blank" rel="noopener">' + E(s.t) + '<span class="vh"> (opens in a new tab)</span></a>';
    }).join('; ') : '') + '</p>';
  }

  /* CASE 01 · Vellum Cinemas · profitability · candidate-led */
  function cinemaNum(v, k) {
    var n = { v: v, k: k, A0: 25, adm0: 285, fb0: 180, oth0: 40, rev0: 505, rent0: 142.5, fbc0: 34.2, L0: 95, R0: 90, X0: 70, cost0: 431.7, P0: 73.3, share: 0.41 };
    var A1, adm, fb, oth, rent, L, R, X, N = 0.312, mv;
    if (v === 'A') {
      n.m1 = [0.64, 0.68, 0.72][k]; n.share = n.m1; A1 = 25.4; adm = A1 * 11.85; fb = A1 * 7.15; oth = A1 * 1.65;
      n.r1 = 0.40 + 0.25 * n.m1; rent = adm * n.r1; L = 97; R = 91; X = 72; n.rentHit = adm * (n.r1 - 0.5);
    } else if (v === 'B') {
      n.M = [260, 280, 300][k]; n.MV = n.M * 38.4 / 1000; A1 = 25 + 0.4 * n.MV; n.sub = n.M * 21.99 * 12 / 1000;
      var NV = 25 - 0.6 * n.MV;
      adm = NV * 11.40 + n.sub; fb = NV * 7.20 + n.MV * 4.90; oth = A1 * 1.6; rent = 5.70 * A1; L = 95.5; R = 90.5; X = 70;
    } else {
      n.p = [6, 7.5, 9][k]; mv = N * n.p / 2; A1 = 25.375 + mv;
      adm = (25.375 - mv) * 11.4 + N * n.p * 7; fb = (25.375 - mv) * 7.2 + N * n.p * 4; oth = A1 * 1.6; rent = 0.5 * adm;
      L = 97.85 + N * 55; R = 91; X = 71.4 + N * 15; n.perShow = n.p * 8.35 - n.p / 2 * 13.10 - 70; n.addHit = N * n.perShow;
    }
    /* every P&L line is held to one decimal, so the printed table foots */
    adm = r1(adm); fb = r1(fb); oth = r1(oth); rent = r1(rent); L = r1(L); R = r1(R); X = r1(X);
    n.A1 = A1; n.adm1 = adm; n.fb1 = fb; n.oth1 = oth; n.rev1 = r1(adm + fb + oth); n.rent1 = rent; n.fbc1 = r1(0.19 * fb); n.L1 = L; n.R1 = R; n.X1 = X;
    n.cost1 = r1(rent + n.fbc1 + L + R + X); n.costShown = n.cost1; n.P1 = r1(n.rev1 - n.cost1); n.other = 1 - n.share; n.fbpp = fb / A1;
    n.attChg = 100 * (A1 / 25 - 1); n.revChg = 100 * (n.rev1 / 505 - 1); n.profChg = 100 * (1 - n.P1 / 73.3); n.decline = r1(73.3 - n.P1);
    n.memC = 21.99 / 3.2 - 5.70 + 4.90 * 0.81 + 1.60; n.rival = 9 * 0.208 * 0.07 * 13.10;
    /* what the pass cost: every member visit earns memC, and the 60 percent that replaced a regular visit gave up 13.10 */
    if (v === 'B') n.passHit = -(n.MV * n.memC - 0.6 * n.MV * 13.10);
    return n;
  }
  /* where the player stands on the rival exhibit: not answered, answered with a wrong number, or answered */
  function x7st(S) { if (!has(S.seen, 'X7') || !(S.ans.X7a && S.ans.X7a.done)) return 'none'; return qv(S, 'X7a').wrong ? 'bad' : 'ok'; }
  function pctWord(p) { return p < 18 ? 'a sixth' : p < 22.5 ? 'a fifth' : 'a quarter'; }
  var CINEMA = {
    id: 'cinema', n: 1, client: 'Vellum Cinemas', short: 'Vellum', kind: 'Profitability', format: 'cand', budget: 30, diff: 2,
    who: { name: 'Elena Marsh', role: 'engagement manager' }, hook: 'Revenue up, profit down sharply. The CEO has a theory.',
    vars: ['A', 'B', 'C'], order: ['B', 'A', 'C'], vname: { A: 'the blockbuster squeeze', B: 'the pass', C: 'the empty 10:30' },
    compute: cinemaNum,
    prompt: function (n) {
      return 'Your client is Vellum Cinemas: 120 theatres and 1,200 screens across the Midwest. Last year attendance rose ' + nn(n.attChg, 1) + ' percent, revenue rose ' +
        nn(n.revChg, 1) + ' percent, and ' + tm('opprofit', 'operating profit') + ' fell ' + nn(n.profChg, 1) + ' percent to ' + mm(n.P1) + '. The CEO wants to know why profit fell and what she should do about it.';
    },
    restate: [
      { id: 'acc', t: function (n) { return 'So: profit fell about ' + pctWord(n.profChg) + ' while the top line grew, and we need to find why and recommend what to do.'; } },
      { id: 'drift', t: 'So the goal is to grow attendance.', fix: 'Attendance grew. That is part of the puzzle, not the goal.' }
    ],
    clarify: [
      { id: 'c1', type: 'obj', q: 'What is the CEO aiming for: last year’s profit back, or a margin target?', a: 'Operating margin back above 14 percent within two years, without closing theatres.' },
      { id: 'c2', type: 'metric', q: 'What is in operating profit here? Before or after depreciation and head office?', a: 'Theatre-level, before depreciation, after rent. Head office is outside the case.' },
      { id: 'c3', type: 'fact', q: 'Did anything change in how Vellum sells or operates last year?', a: { A: 'Operationally, not much. It was a huge year for franchise releases, if that counts.', B: 'Marketing launched a monthly pass in January. Everyone loved the attendance numbers.', C: 'Operations extended opening hours at the start of the year. More showtimes, more tickets was the idea.' } },
      { id: 'c4', type: 'scope', q: 'Is the decline across all 120 theatres, or concentrated?', a: { A: 'Broad, slightly worse in the big multiplexes.', B: 'Broad, worst in the suburban sites.', C: 'Broad, worst in the theatres that stay open latest.' } },
      { id: 'c5', type: 'fish', q: 'What does the CEO think the answer is?', a: 'She is sure it is the rival’s new recliner theatres. You will hear more about that.' },
      { id: 'c6', type: { A: 'noise', B: 'noise', C: 'scope' }, q: 'How many seats in a typical auditorium?', a: 'About 150. Is that going to matter for your structure?' },
      { id: 'c7', type: 'noise', q: 'What does a large popcorn cost?', a: 'Nine dollars. I would hold that thought until you know concessions are the issue.' }
    ],
    req: ['rev', 'cost', 'ext'], bucket: { rev: 'revenue', cost: 'costs', ext: 'the market and rivals' },
    cards: [
      { id: 't1', nm: 'attendance × price per patron', t: 'Revenue: attendance × admissions per patron', subs: ['attendance by theatre', 'format mix', 'discounts and passes'], cov: 'rev', tail: 1, ok: 'adm' },
      { id: 't2', t: 'Revenue: concessions and other, per patron', subs: ['spend per patron', 'item mix', 'advertising'], cov: 'rev', tail: 1 },
      { id: 't3', t: 'Costs: film rent as a share of admissions', subs: ['slate mix', 'studio terms'], cov: 'cost', tail: 1 },
      { id: 't4', nm: 'labor and operating costs', say: 'labor, occupancy and other operating costs', t: 'Costs: labor, occupancy and other operating', subs: ['wages', 'hours staffed', 'utilities'], cov: 'cost', ok: 'ops' },
      { id: 't5', t: 'External: market attendance and local rivals', subs: ['industry box office', 'new competitors'], cov: 'ext' },
      { id: 't6', t: 'The 4Ps: price, product, place, promotion', trap: 'A marketing mix is not a profit tree: it overlaps revenue and ignores cost.' },
      { id: 't7', t: 'Porter’s five forces', trap: 'Five forces explains why an industry earns what it earns, not why one chain lost so much of its profit in a year.' },
      { id: 't8', t: 'Ticket revenue', cov: 'rev', ok: 'adm' },
      { id: 't9', t: 'Customer satisfaction', irr: 'Worth knowing. Not a branch of a profit problem.' },
      { id: 't10', nm: 'capacity and staffing hours', t: 'Capacity: showtimes, occupancy and staffing hours', subs: ['showtimes per screen', 'seats filled by daypart', 'staff hours'], cov: 'cost', tail: 1, ok: 'ops' }
    ],
    hyps: [
      { id: 'h1', t: 'Costs rose faster than revenue, most likely film rent.' },
      { id: 'h2', t: 'Revenue per customer fell: discounts or a cheaper mix of tickets.' },
      { id: 'h3', t: 'We added cost chasing attendance that did not pay.' },
      { id: 'h4', t: 'The rival took our best customers.' }
    ],
    truthHyp: { A: ['h1'], B: ['h2'], C: ['h3'] },
    dis: [['X7', 'ABC', 'h4'], ['X4', 'BC', 'h1'], ['X5', 'AC', 'h2'], ['X6', 'AB', 'h3']],
    root: { A: 'X4', B: 'X5', C: 'X6' }, eff: { A: ['X1', 'X4'], B: ['X1', 'X5'], C: ['X1', 'X6'] }, canErr: ['X1', 'X2', 'X4'],
    ex: [
      { id: 'X1', req: 'The P&L, this year against last', nm: 'the P&L', title: 'Profit and loss, last year and this year', inn: '*',
        body: function (d, S) {
          var done = S.ans.X1a && S.ans.X1a.done;
          var rows = [['Admissions', d.adm0, d.adm1], ['Concessions', d.fb0, d.fb1], ['Other revenue', d.oth0, d.oth1], ['Total revenue', d.rev0, d.rev1, 1],
            [tm('filmrent', 'Film rent'), d.rent0, d.rent1], ['Concession costs', d.fbc0, d.fbc1], ['Labor', d.L0, d.L1], [tm('occupancy', 'Occupancy'), d.R0, d.R1],
            ['Other operating costs', d.X0, d.X1], ['Total costs', d.cost0, d.costShown, 1], [tm('opprofit', 'Operating profit'), d.P0, d.P1, 1]];
          return table(['$M', 'Last year', 'This year', 'Change'], rows.map(function (r) {
            return { v: [r[0], nn(r[1], 1), nn(r[2], 1), sgn(r1(r[2]) - r1(r[1]))], c: r[3] ? 'is-tot' : '' };
          }).concat([
            { v: [tm('opmargin', 'Operating margin'), pc(100 * d.P0 / d.rev0), done ? pc(100 * d.P1 / d.rev1) : '?', done ? F.pp(100 * (d.P1 / d.rev1 - d.P0 / d.rev0), 1) : ''] },
            { v: ['Attendance, millions', nn(d.A0, 1), nn(d.A1, 1), sgn(d.A1 - d.A0)] }]), 'cs-pl') +
            srcLine('case data. Public benchmark: AMC’s film exhibition costs were about 48% of its admissions revenue, and its food and beverage costs about 19% of food and beverage revenue, in 2024.', [S_AMC]);
        },
        qs: [{ id: 'X1a', type: 'num', p: 'By how many percentage points did operating margin fall?', unit: 'pts', tol: ['abs', 0.3, 0.8],
          ans: function (d) { return 100 * (d.P0 / d.rev0 - d.P1 / d.rev1); }, fmt: function (v) { return F.n(v, 1) + ' points'; },
          hint: 'Margin is profit over revenue: 73.3 over 505 is about 14.5. Do the same for this year and subtract.',
          how: function (n) { return 'Last year 73.3 over 505 is 14.5 percent; this year ' + nn(n.P1, 1) + ' over ' + nn(n.rev1, 1) + ' is ' + pc(100 * n.P1 / n.rev1); } }],
        so: function (v, n) {
          var said = 'Revenue rose ' + nn(n.revChg, 1) + ' percent to ' + mm(n.rev1) + ', costs rose ' + mm(n.cost1 - n.cost0) + ', and operating profit fell ' + nn(n.profChg, 1) + ' percent to ' + mm(n.P1) + '.';
          return {
            A: [['Revenue grew, but film rent grew far faster than everything else: the leak is in what we pay the studios.', 'right'], [said, 'restate'],
              ['Film rent is up ' + mm(n.rent1 - n.rent0) + ', so the studios are squeezing us: renegotiate every contract this quarter.', 'over']],
            B: [['Attendance grew ' + nn(n.attChg, 1) + ' percent but admissions revenue did not move: we are filling seats without being paid for them.', 'right'], [said, 'restate'],
              ['Attendance grew ' + nn(n.attChg, 1) + ' percent, so demand is healthy and the fix is on costs: renegotiate film rent with every studio.', 'over']],
            C: [['Labor and operating costs rose far faster than attendance: we added cost faster than we added customers.', 'right'], [said, 'restate'],
              ['Labor rose ' + mm(n.L1 - n.L0) + ' in one year, so wages are out of control: freeze pay and cut staff hours everywhere.', 'over']]
          }[v];
        },
        err: { apply: function (d) { d.costShown = d.cost1 + 10; return d; }, what: 'total costs were printed $10M too high', fix: function (n) { return 'Total costs should read ' + mm(n.cost1) + '; the analyst fat-fingered the sum.'; } } },
      { id: 'X2', req: 'Revenue per patron, by stream', nm: 'revenue per patron', title: 'Revenue per patron, by stream', inn: ['t1', 't2', 't8'],
        body: function (d) {
          var rows = [['Admissions', 11.40, d.adm1 / d.A1], ['Concessions', 7.20, d.fbpp], ['Other', 1.60, d.oth1 / d.A1]], out = [];
          rows.forEach(function (r) { out.push({ k: r[0] + ', last year', v: r[1], lab: usd(r[1], 2), cls: 'is-prev' }); out.push({ k: r[0] + ', this year', v: r[2], lab: usd(r[2], 2) }); });
          return '<p class="cs-cap">Dollars ' + tm('perpatron', 'per patron') + '. Outlined: last year. Filled: this year.</p>' + bars(out, { cap: 'Revenue per patron by stream' }) +
            '<p class="cs-note">Attendance: 25.0 million last year, ' + nn(d.A1, 2) + ' million this year.</p>' + srcLine('case data.');
        },
        qs: [{ id: 'X2a', type: 'num', p: 'What is total revenue per patron this year?', unit: '$', tol: ['rel', 0.03, 0.08],
          ans: function (d) { return d.adm1 / d.A1 + d.fbpp + d.oth1 / d.A1; }, fmt: function (v) { return usd(v, 2); },
          hint: function (n) { return 'Revenue over attendance: about ' + Math.round(n.rev1) + ' over ' + nn(n.A1, 1) + '. Or add the three bars.'; },
          how: function (n) { return 'Add the three streams, or divide ' + mm(n.rev1) + ' by ' + nn(n.A1, 2) + ' million patrons'; } }],
        so: function (v, n) {
          var drop = Math.round(100 * (1 - (n.rev1 / n.A1) / (505 / 25)));
          var R = { A: 'Each patron is worth a little more than last year: revenue per head is not where the profit went.',
            B: 'Revenue per patron fell about ' + drop + ' percent while list prices held: some patrons are paying far less than list.',
            C: 'Revenue per patron slipped: the extra customers are cheaper customers, not more of the same ones we already had.' }[v];
          return [[R, 'right'], ['Revenue per patron went from $20.20 to ' + usd(n.rev1 / n.A1, 2) + ', with admissions at ' + usd(n.adm1 / n.A1, 2) + ' a head and concessions at ' + usd(n.fbpp, 2) + '.', 'restate'],
            ['Admissions bring in ' + usd(n.adm1 / n.A1, 2) + ' a patron, so our tickets are underpriced: raise every ticket price 10 percent.', 'over']];
        },
        err: { apply: function (d) { d.fbpp = d.fbpp * 10; return d; }, what: 'concessions per patron were printed at ten times their value',
          fix: function (n) { return 'Concessions per patron is ' + usd(n.fbpp, 2) + ', not ten times that. Nobody buys ' + usd(10 * n.fbpp) + ' of popcorn.'; } } },
      { id: 'X3', req: 'Cost bridge: what changed, line by line', nm: 'the cost bridge', title: 'Cost bridge: change in each cost line', inn: ['t3', 't4', 't10'],
        body: function (d) {
          var rows = [['Film rent', d.rent1 - d.rent0], ['Concession costs', d.fbc1 - d.fbc0], ['Labor', d.L1 - d.L0], ['Occupancy', d.R1 - d.R0], ['Other operating costs', d.X1 - d.X0]];
          rows.sort(function (a, b) { return b[1] - a[1]; });
          return bars(rows.map(function (r) { return { k: r[0], v: r[1], lab: (r[1] >= 0 ? '+' : '') + mm(r[1]) }; }), { cap: 'Change in each cost line, $M' }) +
            '<p class="cs-note">Revenue grew ' + mm(d.rev1 - d.rev0) + '; costs grew ' + mm(d.cost1 - d.cost0) + '.</p>' + srcLine('case data.');
        },
        qs: [{ id: 'X3a', type: 'pick', p: 'Which cost line explains most of the increase?', opts: [['rent', 'Film rent'], ['labor', 'Labor'], ['occ', 'Occupancy'], ['other', 'Other operating costs'], ['fbc', 'Concession costs']],
          ans: function (d, v) { return v === 'C' ? 'labor' : 'rent'; }, how: function (n) { return 'It is the longest bar'; } }],
        so: function (v, n) {
          var R = { A: 'Film rent alone is most of the increase: look at the slate and the studio terms.',
            B: 'Film rent rose much faster than admissions revenue: we are paying the studios on tickets we did not sell at full price.',
            C: 'Labor and other operating costs are almost all of it: something changed in how many hours we run, not in what we pay per hour.' }[v];
          var big = [['film rent', n.rent1 - n.rent0], ['concession costs', n.fbc1 - n.fbc0], ['labor', n.L1 - n.L0], ['occupancy', n.R1 - n.R0], ['other operating costs', n.X1 - n.X0]]
            .sort(function (a, b) { return b[1] - a[1]; });
          return [[R, 'right'], ['Costs rose ' + mm(n.cost1 - n.cost0) + ' in total; the biggest change was ' + big[0][0] + ', up ' + mm(big[0][1]) + ', then ' + big[1][0] + ', up ' + mm(big[1][1]) + '.', 'restate'],
            ['Costs grew ' + mm(n.cost1 - n.cost0) + ' while revenue grew ' + mm(n.rev1 - n.rev0) + ', so the cost base is bloated: cut every budget 10 percent.', 'over']];
        } },
      { id: 'X4', req: 'The film slate and studio terms', nm: 'the slate and studio terms', title: 'The film slate and the studio terms', inn: ['t3'],
        body: function (d, S) {
          var done = S.ans.X4a && S.ans.X4a.done;
          return table(['Tier', 'Share of box office, last year', 'This year', 'Film rent rate'], [
            ['Franchise and tentpole releases', '40%', pc(100 * d.share, 0), '65% (effective over the run)'], ['Everything else', '60%', pc(100 * d.other, 0), '40%']]) +
            '<p class="cs-note">Film rent as a share of admissions revenue, from the P&L: 50.0% last year, ' + (done ? pc(100 * d.rent1 / d.adm1) : '?') + ' this year.</p>' +
            srcLine('case data. Exhibitors commonly pay film rent on sliding scales set by how a film performs.', [S_CNK]);
        },
        qs: [{ id: 'X4a', type: 'num', p: 'What blended film rent rate do this year’s terms imply?', unit: '%', tol: ['abs', 0.5, 1.5],
          ans: function (d) { return 65 * d.share + 40 * d.other; }, fmt: function (v) { return pc(v); },
          hint: 'Weight the two rates by the two shares: 65 times the franchise share plus 40 times the rest.',
          how: function (n) { return '65 percent on ' + pc(100 * n.share, 0) + ' of box office plus 40 percent on the other ' + pc(100 * n.other, 0); } }],
        so: function (v, n) {
          var R = { A: 'The slate tilted to franchise films that carry 65 percent rent: a blockbuster ticket keeps us 35 cents on the dollar against 60 for other titles.',
            B: 'The terms did not change, yet rent as a share of admissions jumped to ' + pc(100 * n.rent1 / n.adm1) + ': we are paying rent on revenue we did not collect.',
            C: 'The slate and the studio terms barely moved, and rent held at half of admissions: film rent is not this year’s story.' }[v];
          return [[R, 'right'], ['Franchise and tentpole releases went from 40 to ' + nn(100 * n.share) + ' percent of box office, at 65 percent film rent against 40 for the rest.', 'restate'],
            ['Franchise films carry 65 percent rent against 40 for everything else, so they are a bad deal: stop booking them.', 'over']];
        },
        err: { apply: function (d) { d.other = d.other + 0.08; return d; }, what: 'the shares summed to 108 percent',
          fix: function (n) { return 'The shares should sum to 100; everything else is ' + pc(100 * n.other, 0) + '.'; } } },
      { id: 'X5', req: 'Loyalty and pass programs', nm: 'loyalty and pass programs', title: function (v) { return v === 'B' ? 'Vellum Unlimited, the monthly pass' : 'Loyalty programs'; }, inn: ['t1', 't8'],
        notes: function (v) { return v === 'B' ? ['adverse', 'contribution'] : []; },
        body: function (d, S) {
          if (S.v !== 'B') return kv([['Vellum Rewards (free points program)', '2.1M members'], ['Share of attendance', '31% both years'], ['Reward cost', '1.1% of revenue both years'], ['Paid subscription', 'None']]) + srcLine('case data.');
          return kv([['Launched', 'January'], ['Members', nn(d.M) + ',000'], ['Price', '$21.99 a month'], ['Visits per member', '3.2 a month'],
            ['Concession spend per member visit', '$4.90 (other patrons $7.20)'], ['Studio share paid on every member seat', '$5.70'],
            ['Member survey: visits that would not have happened without the pass', '40%'], [tm('contribution', 'Contribution') + ' per regular visit', '$13.10 (ticket after rent $5.70, concession margin about $5.80, other $1.60)'],
            ['Concession margin', '81%']]) + srcLine('case data.');
        },
        qs: function (v) {
          if (v !== 'B') return [];
          return [{ id: 'X5a', type: 'num', p: 'What does one member visit contribute?', unit: '$', tol: ['rel', 0.05, 0.12], ans: function (d) { return d.memC; }, fmt: function (v) { return usd(v, 2); },
            hint: '22 over 3.2 is about 6.9. Take off the studio’s 5.70, add about 4.00 of concession margin and 1.60 of other.',
            how: function () { return '$21.99 over 3.2 visits is $6.87; less $5.70 of rent, plus $3.97 of concession margin and $1.60 of other'; } },
            { id: 'X5b', type: 'num', p: 'What share of member visits must be new for the pass to break even?', unit: '%', tol: ['abs', 3, 7],
              ans: function (d) { return (13.10 - d.memC) / 13.10 * 100; }, fmt: function (v) { return pc(v); },
              hint: 'Each converted visit loses 13.10 minus 6.74. Each new visit gains 6.74. Set them equal.',
              how: function () { return 'A converted visit gives up $13.10 − $6.74 = $6.36; a new one earns $6.74; breakeven is 6.36 over 13.10'; } }];
        },
        so: function (v, n) {
          if (v !== 'B') return [['Members, their share of attendance and the reward cost are all flat: loyalty did not move profit, so rule it out.', 'right'],
            ['Rewards has 2.1 million members, who make up 31 percent of attendance, and it costs 1.1 percent of revenue, as it did last year.', 'restate'],
            ['Rewards costs 1.1 percent of revenue and changed nothing this year, so it is dead weight: close it and keep the savings.', 'over']];
          return [['A member visit earns about half a regular visit, so the pass only pays if about half of member visits are new; the survey says 40 percent.', 'right'],
            ['The pass has ' + nn(n.M) + ',000 members paying $21.99 a month; they visit 3.2 times a month and spend $4.90 a visit on concessions.', 'restate'],
            ['Members visit 3.2 times a month and pay about $6.87 a visit, far below the $11.40 average ticket: shut the pass down tomorrow.', 'over']];
        } },
      { id: 'X6', req: 'Showtimes and occupancy by daypart', nm: 'showtimes by daypart', title: 'Showtimes, seats filled and staffing', inn: ['t4', 't10'],
        notes: function (v) { return v === 'C' ? ['contribution'] : []; },
        body: function (d, S) {
          /* 1,200 screens × 5 shows × 365 days × 150 seats = 328.5 million seats a year */
          if (S.v !== 'C') return kv([['Showtimes per screen per day', '5.0 both years'], ['Average seats filled', '7.6% last year, ' + pc(100 * d.A1 / 328.5) + ' this year'], ['Staffed hours per theatre per week', '1,150 last year, 1,160 this year']]) + srcLine('case data.');
          return kv([['Added this year', '312,000 weekday showtimes: one extra show per screen each weekday, a 10:30 a.m. or a 10:45 p.m.'], ['Patrons per added show', nn(d.p, 1) + ' of 150 seats'], ['Moved from an evening show', 'about half'],
            [tm('contribution', 'Contribution') + ' per evening patron', '$13.10'], ['Contribution per added-show patron', '$8.35 (a $7.00 matinee ticket, half of it to film rent: $3.50 kept; about $3.25 of margin on $4.00 of concessions; $1.60 other)'],
            ['Cost to run an added show', '$70 (two staff for 90 minutes, cleaning, power)']]) +
            bars([{ k: 'Evening', v: 18, lab: '18%' }, { k: 'Weekday matinee', v: 5, lab: '5%' }, { k: 'Added shows', v: 100 * d.p / 150, lab: pc(100 * d.p / 150), cls: 'is-you' }], { max: 20, cap: 'Seats filled by daypart' }) +
            '<p class="cs-note">Every added show has a ' + tm('breakeven', 'breakeven') + ': the audience at which it covers its own running cost and the evening contribution it borrows.</p>' + srcLine('case data.');
        },
        qs: function (v) {
          if (v !== 'C') return [];
          return [{ id: 'X6a', type: 'num', p: 'What did the added showtimes do to annual operating profit?', unit: '$M', tol: ['rel', 0.08, 0.2], signFree: 1,
            ans: function (d) { return 0.312 * (d.p * 8.35 - d.p / 2 * 13.10 - 70); }, fmt: function (v) { return mm(v); },
            hint: function (n) { return 'Per show: ' + nn(n.p, 1) + ' patrons earn 8.35 each, but half of them would have earned 13.10 in the evening, and the show costs 70. Then multiply by about 0.31 million shows.'; },
            how: function (n) { return 'Each show earns ' + usd(n.p * 8.35, 2) + ', gives up ' + usd(n.p / 2 * 13.1, 2) + ' of evening contribution and costs $70: ' + usd(n.perShow, 2) + ', times 312,000 shows'; } }];
        },
        so: function (v, n) {
          var fill = pc(100 * n.A1 / 328.5);
          if (v !== 'C') return [['Showtimes and staffed hours barely moved while more seats filled: capacity is not where the profit went.', 'right'],
            ['Screens ran 5.0 shows a day in both years, seats filled went from 7.6 to ' + fill + ', and staffed hours rose 10 a week.', 'restate'],
            ['Seats are only ' + fill + ' full on average, so we run far too many shows: cut one show a day from every screen.', 'over']];
          return [['After cannibalization each added show loses about ' + usd(-n.perShow) + ': the extra hours cost more than the customers they bring.', 'right'],
            ['We added 312,000 weekday shows averaging ' + nn(n.p, 1) + ' patrons each, and about half of those patrons moved from an evening show.', 'restate'],
            ['Added shows fill only ' + pc(100 * n.p / 150) + ' of their seats, so mornings never pay: close every theatre before noon, weekends included.', 'over']];
        } },
      { id: 'X7', req: 'Rival openings near our sites', nm: 'rival openings', title: 'The rival’s recliner theatres', inn: ['t5'],
        body: function (d) {
          /* the other 111 sites carry whatever the chain gained once the 9 lost 7 percent of their 208,000 */
          var o = 100 * ((d.A1 - 9 * 0.208 * 0.93) / (111 * 0.208) - 1);
          return kv([['Rival openings last year', 'Six luxury-recliner theatres within five miles of 9 Vellum sites'], ['Attendance at those 9 sites', F.minus + '7%'], ['Attendance at the other 111', (o < 0 ? F.minus : '+') + pc(Math.abs(o))],
            ['Average attendance per Vellum site last year', '208,000'], ['Contribution per patron', '$13.10']]) + srcLine('case data.');
        },
        qs: [{ id: 'X7a', type: 'num', p: 'Roughly how much operating profit did the rival cost Vellum?', unit: '$M', tol: ['rel', 0.1, 0.25],
          ans: function (d) { return d.rival; }, fmt: function (v) { return mm(v); }, hint: 'Nine sites times about 0.2 million patrons, times 7 percent, times about 13 dollars.',
          how: function () { return '9 sites × 208,000 × 7% is about 131,000 patrons, × $13.10'; } }],
        so: function (v, n) {
          return [['The rival cost us about ' + mm(n.rival) + ', a small slice of the ' + mm(n.decline) + ' decline: real, worth watching, but not the story.', 'right'],
            ['Six recliner theatres opened near 9 of our sites, whose attendance fell 7 percent while the other 111 grew.', 'restate'],
            ['The 9 sites near the rival lost 7 percent of their patrons, so recliners are the future: refit all 120 theatres.', 'over']];
        } },
      { id: 'X8', req: 'Concession pricing and mix', nm: 'concession pricing', title: 'Concession pricing and mix', inn: ['t2'], notes: function () { return ['contribution']; },
        body: function (d, S) {
          var rows = [['Menu price index', '100 last year, 103 this year']];
          if (S.v === 'A') rows.push(['Items per patron', '1.62 last year, 1.56 this year'], ['Concessions per patron', '$7.20 last year, $7.15 this year']);
          else if (S.v === 'B') rows.push(['Concessions per regular patron', '$7.20 both years'], ['Per pass-member visit', '$4.90'], ['Blended per patron', usd(d.fb1 / d.A1, 2)]);
          else rows.push(['Concessions per evening patron', '$7.20'], ['Per added-show patron', '$4.00'], ['Blended per patron', usd(d.fb1 / d.A1, 2)]);
          rows.push(['Concession costs', '19% of concession revenue']);
          return kv(rows) + srcLine('case data.');
        },
        qs: [{ id: 'X8a', type: 'num', p: 'What does one extra regular patron add in concession profit?', unit: '$', tol: ['rel', 0.03, 0.08],
          ans: function () { return 7.20 * 0.81; }, fmt: function (v) { return usd(v, 2); }, hint: 'Spend per patron times the share you keep after costs: 7.20 times 81 percent.',
          how: function () { return '$7.20 of spend keeps 81 cents on the dollar'; } }],
        so: function (v, n) {
          var R = { A: 'Concessions held up: a 3 percent price rise offset slightly fewer items, so spend per head barely moved. Rule it out.',
            B: 'Regular patrons spend $7.20 as before; pass members spend $4.90, a third less, and that drags the blend down.',
            C: 'Added-show patrons spend $4.00 against $7.20 in the evening: another sign the new hours bring low-value visits.' }[v];
          return [[R, 'right'], ['Menu prices rose 3 percent, concession costs held at 19 percent of revenue, and blended spend is ' + usd(n.fb1 / n.A1, 2) + ' a patron.', 'restate'],
            ['Concession costs are only 19 percent of revenue, so it is our best margin: raise menu prices another 10 percent.', 'over']];
        } }
    ],
    curves: [
      { id: 'CB0', t: 'The CEO just emailed. She is sure the rival’s recliner theatres are the problem and wants a plan to put recliners in all 120 sites at about $1.2M each.',
        opts: [
          { t: 'Agree; recliners are where the industry is going, and a CEO’s conviction is worth acting on. Start sizing the retrofit.', J: -1, note: 'curvePivot', r: 'That is $144M on a hunch.' },
          { t: 'Take it seriously and test it: compare the 9 sites near the rival with the other 111 and size the gap before recommending $144M of capital.', J: 2, C: 1, note: 'curveGood', r: 'Good. That is how you disagree with a CEO.', fx: function (S) { S.x7in = true; } },
          { t: function (S) { return x7st(S) !== 'none' ? 'Tell her the rival explains about ' + qf(S, 'X7a') + ' of the ' + mm(S.n.decline) + ' decline, and show her where the rest went.' : 'Tell her the data says otherwise, and that recliners will not fix this.'; },
            J: function (S) { return x7st(S) === 'ok' ? 2 : 0; }, C: function (S) { return x7st(S) === 'ok' ? 1 : -1; },
            note: function (S) { var st = x7st(S); return st === 'ok' ? 'curveGood' : st === 'bad' ? 'curveWrong' : 'curveDismiss'; },
            r: function (S) { var st = x7st(S); return st === 'ok' ? 'Good. A number and a direction; she can work with that.' : st === 'bad' ? 'That number is not what the exhibit says. A wrong number to a CEO is worse than none.' : 'You may be right. You told a CEO she was wrong without a number.'; } }
        ] },
      { id: 'CB1', t: 'A studio offers three points off film rent on its next two franchise films if Vellum keeps them in its biggest auditoriums for four weeks instead of two.',
        opts: [
          { t: 'Take it; three points of film rent on two franchise films is real money, and studios rarely offer anything.', J: -0.5, note: 'curvePivot', r: 'Maybe. What would those rooms earn in weeks three and four with something else in them?' },
          { t: 'Model it: three points on those films’ box office against what the big rooms would earn in weeks three and four with other titles.', J: 2, C: 1, note: 'curveGood', r: 'Exactly how the booking team should think about every offer.' },
          { t: 'Park it; a booking offer is the programming team’s call, and it is not the question the CEO asked us.', J: function (S) { return S.v === 'A' ? -1 : 0; }, note: function (S) { return S.v === 'A' ? 'curveDismiss' : null; },
            r: function (S) { return S.v === 'A' ? 'As it turns out, it is exactly your question.' : 'Fair. It is not where this year’s profit went.'; } }
        ] }
    ],
    recAsk: 'The CEO has two minutes. What do you tell her?',
    gov: [
      { id: 'G1', ok: 'A', t: 'Profit fell because this year’s slate leaned on franchise films that carry much higher film rent; rebalance the programming and earn more from each blockbuster patron.' },
      { id: 'G2', ok: 'B', t: 'Profit fell because the Unlimited pass attracted our most frequent customers at a loss per visit; reprice and cap it rather than scrap it.' },
      { id: 'G3', ok: 'C', t: 'Profit fell because the extra showtimes cost more to run than they bring in; cut the added weekday shows except where they clear breakeven.' },
      { id: 'G4', t: 'Profit fell because a rival opened luxury theatres; invest in recliners to win customers back.' },
      { id: 'G5', last: 1, t: 'Let me walk you through what we analyzed, starting with the P&L.' },
      { id: 'G6', hedge: 1, t: 'It is probably a mix of factors; we need more data before recommending anything.' }
    ],
    lead: ['why', 'size'],
    sup: function (v) {
      var rival = { id: 's5', role: 'context', need: ['X7'], q: ['X7a'], num: 1, t: function (S) { return has(S.seen, 'X7') ? 'The rival’s recliners cost us about ' + qf(S, 'X7a') + ': real, but not the story.' : 'The rival’s recliners cost us something, but not the story.'; } };
      if (v === 'A') return [
        { id: 's1', role: 'why', need: ['X4'], num: 1, t: function (S, n) { return 'The franchise films went from 40 to ' + pc(100 * n.m1, 0) + ' of our box office, and they carry 65% film rent against 40% for everything else.'; } },
        { id: 's2', role: 'size', need: ['X4'], q: ['X4a'], num: 1, dup: 'rent', t: function (S, n) { return 'That lifted blended film rent from 50 to ' + qf(S, 'X4a') + ', about ' + mm(n.rentHit) + ' a year: more than the whole profit decline.'; } },
        { id: 's3', role: 'action', t: 'Rebalance the slate: hold strong mid-budget and local titles longer and give franchise films the big rooms only while they fill them.' },
        { id: 's4', role: 'action', t: 'Earn more per franchise patron: premium-format pricing and concession bundles on opening weekends.' },
        rival,
        { id: 's6', role: 'size', dup: 'rent', t: 'Film rent is our largest cost and it went up.' },
        { id: 's7', bad: 1, role: 'why', t: 'The Unlimited pass is losing money on every member.' }];
      if (v === 'B') return [
        { id: 's1', role: 'why', need: ['X5'], num: 1, dup: 'pass', t: 'The pass attracted our most frequent moviegoers: members come 3.2 times a month, pay about $6.87 a visit, and we still owe the studio $5.70 a seat.' },
        { id: 's2', role: 'size', need: ['X5'], q: ['X5a', 'X5b'], num: 1, t: function (S, n) { return 'A member visit earns about ' + qf(S, 'X5a') + ' against $13.10 for a regular visit, so the pass needs about ' + qf(S, 'X5b') + ' of member visits to be new; the survey says 40. That gap costs about ' + mm(n.passHit) + ' a year.'; } },
        { id: 's3', role: 'action', t: 'Reprice and cap it rather than scrap it: a higher price or two films a week, no premium formats on opening weekends, and a concession offer for members.' },
        { id: 's4', role: 'why', need: ['X1'], num: 1, t: function (S, n) { return 'Attendance grew ' + nn(n.attChg, 1) + ' percent while admissions revenue stayed flat: we filled seats we were not paid for.'; } },
        rival,
        { id: 's6', role: 'why', dup: 'pass', t: 'The pass is very popular with customers.' },
        { id: 's7', bad: 1, role: 'why', t: 'The slate tilted toward high-rent franchise films.' }];
      return [
        { id: 's1', role: 'why', need: ['X6'], num: 1, t: function (S, n) { return 'This year we added 312,000 weekday morning and late showtimes that average ' + nn(n.p, 1) + ' patrons each, half of them moved from better evening shows.'; } },
        { id: 's2', role: 'size', need: ['X6'], q: ['X6a'], num: 1, dup: 'hours', t: function (S, n) { return 'After that cannibalization each added show loses about ' + usd(-n.perShow) + ', about ' + qf(S, 'X6a', 1) + ' a year: nearly the whole decline.'; } },
        { id: 's3', role: 'action', t: 'Cut the added shows except in theatres where they clear breakeven, about 39 patrons a show, and move the staff hours to weekends.' },
        { id: 's4', role: 'context', need: ['X2'], t: 'Revenue per patron slipped because the new customers are matinee customers.' },
        rival,
        { id: 's6', role: 'size', dup: 'hours', t: 'Labor costs rose sharply.' },
        { id: 's7', bad: 1, role: 'why', t: 'The pass is losing money.' }];
    },
    risks: { A: [['Studios may resist shorter premium-room runs for their biggest titles.', 1], ['Recliner retrofits take eighteen months.'], ['Popcorn costs may rise.']],
      B: [['Heavy users will cancel when we reprice; some of that attendance was never profitable, but the headline will read badly.', 1], ['Studios may change franchise terms.'], ['Morning shows are expensive.']],
      C: [['A few theatres may need the added shows; cut theatre by theatre, not by decree.', 1], ['The rival may open more sites.'], ['Concession prices may need to rise.']] },
    next: { A: [['Model next year’s slate by tier with the booking team.', 1], ['Test two pass prices in four markets for eight weeks before changing it everywhere.'], ['Pull showtime-level attendance for six months and set a keep-or-cut rule per theatre.']],
      B: [['Test two pass prices in four markets for eight weeks before changing it everywhere.', 1], ['Model next year’s slate by tier with the booking team.'], ['Pull showtime-level attendance for six months and set a keep-or-cut rule per theatre.']],
      C: [['Pull showtime-level attendance for six months and set a keep-or-cut rule per theatre.', 1], ['Model next year’s slate by tier with the booking team.'], ['Test two pass prices in four markets for eight weeks before changing it everywhere.']] },
    truth: function (v, n) {
      return {
        A: 'The slate. Franchise films went from 40 to ' + pc(100 * n.m1, 0) + ' of box office at 65 percent film rent, which cost about ' + mm(n.rentHit) + ', more than the whole ' + mm(n.decline) + ' decline; the rest of the business improved.',
        B: 'The pass. It attracted the people who already went most, so most of its visits replaced full-price tickets, and Vellum still paid list-price film rent on every seat. A member visit earns about $6.74 against $13.10 for a regular one, so the pass needs 48.5 percent of member visits to be new; the survey says 40. At ' + nn(n.M) + ',000 members that costs about ' + mm(n.passHit) + ' a year, nearly all of the ' + mm(n.decline) + ' decline.',
        C: 'The hours. Each added show averaged ' + nn(n.p, 1) + ' patrons, half of them borrowed from an evening show, against $70 to run it: about ' + mm(-n.addHit) + ' a year, nearly all of the ' + mm(n.decline) + ' decline. Average seats filled barely moved, which is why nobody noticed.'
      }[v];
    },
    real: function (v) {
      if (v === 'B') return { t: 'Adverse selection has a famous real ending. MoviePass cut its price to $9.95 a month for up to a film a day in August 2017, paid for every ticket through a prepaid card, passed three million subscribers by June 2018, and announced its closure in September 2019. The usual fix is to price the heavy user.', src: [S_MP] };
      if (v === 'C') return { t: 'Decisions at the margin must be judged at the margin: this show, these patrons, this cost. Averages hide it, because seats filled across the chain barely moved while each added show lost money. Cinemas keep most of every concession dollar (AMC’s food and beverage costs were 18.8 percent of that revenue in 2024), which is why an empty seat is so tempting to fill and so easy to overpay for.', src: [S_AMC] };
      return { t: 'In real theatre economics film rent runs about half of admissions: AMC’s film exhibition costs were 48.4 percent of its admissions revenue in 2024, while its food and beverage costs were 18.8 percent of that revenue. Cinemark sets most film rent on sliding scales agreed with each distributor. A cinema is a concession stand with a very expensive attraction.', src: [S_AMC, S_CNK] };
    },
    one: 'Walk the profit tree until you find the branch that moves, then judge it at the margin, not on averages.',
    structNotes: ['profitTree']
  };

  /* CASE 02 · Stavholm · market entry · interviewer-led */
  function grocerNum(v, k) {
    var n = { v: v, k: k, H: [10.5, 11.5, 12.5][k], Ss: [14, 15, 16][k], EV: (v === 'X' ? [1150, 1250, 1350] : [600, 650, 700])[k] };
    n.Hm = n.H; n.mkt = n.H * 6224 * 0.95 / 1000; n.stores = n.mkt * 20 / n.Ss;
    n.contrib = n.Ss * 0.23 - 2.4; n.pay = 5 / n.contrib; n.big = (n.Ss + 6) * 0.24 - 4.2; n.bigShown = n.big; n.bigPay = 9.5 / n.big;
    n.war = n.Ss * 0.20 - 2.4; n.conv = 168; n.buyNet = n.EV + 168 - 224; n.build = 570; n.premium = n.buyNet - 570;
    n.saved = 1.5 + 84 / 25 - 2; n.perYear = 84 * n.contrib;
    /* the value of time, ramp-adjusted: buying has 84 stores from year 2; building opens 25 a year from month 18 and reaches 84 at t1 */
    var t1 = 1.5 + 84 / 25;
    n.storeYrs = 84 * (t1 - 2) - 12.5 * (Math.pow(t1 - 1.5, 2) - 0.25); n.speed = n.storeYrs * n.contrib;
    return n;
  }
  var GROCER = {
    id: 'grocer', n: 2, client: 'Stavholm', short: 'Stavholm', kind: 'Market entry', format: 'int', budget: 35, diff: 1,
    who: { name: 'Samir Haddad', role: 'associate partner' }, hook: 'A European discounter eyes the American South. Build, buy, or stay home.',
    vars: ['X', 'Y'], order: ['X', 'Y'], vname: { X: 'build it', Y: 'buy it' },
    compute: grocerNum,
    prompt: function () {
      return 'Stavholm is a family-owned discount grocer with 3,400 stores in seven European countries and a short aisle of about 1,800 products, most of them its ' + tm('ownlabel', 'own label') +
        '. Growth at home has slowed. The family wants to know whether to enter the United States, starting in the Southeast, and if so, how.';
    },
    restate: [
      { id: 'acc', t: 'So: should Stavholm enter the US Southeast, and if yes, what is the best way in, judged on profit and payback.' },
      { id: 'drift', t: 'So we need to find the fastest way to open 500 stores.', fix: 'Nobody said fast, and nobody said 500.' }
    ],
    clarify: [
      { id: 'n1', type: 'obj', q: 'What does the family want from the US: growth at any cost, or a return by a certain year?', a: 'A business that earns its cost of capital within ten years, without betting the European business on it.' },
      { id: 'n2', type: 'metric', q: 'How do they judge a country: stores, sales, or profit?', a: 'Store contribution and payback, then store count.' },
      { id: 'n3', type: 'fact', q: 'Is there a budget, or a constraint on how they can enter?', a: 'About $1.5 billion over five years. They have never bought a company, but they have not ruled it out.' },
      { id: 'n4', type: 'scope', q: 'Why the Southeast first?', a: 'Growing population, cheaper real estate, and fewer discount stores per household than the Northeast.' },
      { id: 'n5', type: 'fish', q: 'Should they enter?', a: 'That is the question. What would you need to believe?' },
      { id: 'n6', type: 'noise', q: 'What does the Stavholm logo look like?', a: 'Blue. Moving on.' },
      { id: 'n7', type: 'fact', q: 'Will Southeast shoppers buy a store’s own label?', a: 'In our survey, 62 percent say they would if it were 15 percent cheaper than the brand.' }
    ],
    req: ['market', 'comp', 'econ', 'mode'], bucket: { market: 'the market', comp: 'the competition', econ: 'store economics', mode: 'how to enter' },
    cards: [
      { id: 'u1', nm: 'the market', say: 'market size, growth and shoppers', t: 'Market: size, growth and shoppers', subs: ['households and spend', 'growth', 'who shops at discounters'], cov: 'market', tail: 1, ok: 'market' },
      { id: 'u2', t: 'Competition: who wins on price today, and how they respond', subs: ['price gaps', 'share by format', 'incumbent response'], cov: 'comp', tail: 1 },
      { id: 'u3', nm: 'store economics', t: 'Economics: store P&L, capex and payback', subs: ['sales per store', 'margin and costs', 'payback by format'], cov: 'econ', tail: 1, ok: 'econ' },
      { id: 'u4', t: 'How to enter: build, buy or partner', subs: ['cost of each route', 'time to scale', 'possible targets'], cov: 'mode', tail: 1 },
      { id: 'u5', t: 'Capabilities: own-label supply, distribution, real estate', subs: ['supplier base', 'distribution center', 'site pipeline'], tail: 1 },
      { id: 'u6', t: 'SWOT analysis', trap: 'A SWOT is four lists, not a structure: strengths and opportunities overlap, and nothing in it tells you what to do.' },
      { id: 'u7', t: 'BCG growth-share matrix', trap: 'A tool for balancing a portfolio of many businesses. This is one decision about one market.' },
      { id: 'u8', t: 'Revenue and costs', cov: 'econ', ok: 'econ' },
      { id: 'u9', t: 'Customer needs', cov: 'market', ok: 'market' },
      { id: 'u10', t: 'Regulation and labor law', neu: 1 }
    ],
    hyps: [
      { id: 'k1', t: 'Enter, building small stores ourselves.' }, { id: 'k2', t: 'Enter by buying a regional chain for speed.' },
      { id: 'k3', t: 'Enter with big stores to win on range.' }, { id: 'k4', t: 'Do not enter; the incumbents are too strong.' }
    ],
    truthHyp: { X: ['k1'], Y: ['k2'] },
    dis: [['Y3', 'XY', 'k3'], ['Y2', 'XY', 'k4'], ['Y4', 'Y', 'k1'], ['Y4', 'X', 'k2']],
    root: { X: 'Y4', Y: 'Y4' }, eff: { X: ['Y1', 'Y2', 'Y3', 'Y4'], Y: ['Y1', 'Y2', 'Y3', 'Y4'] }, canErr: ['Y1', 'Y3', 'Y4'],
    seq: ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'], curveAfter: 'Y4', optional: 'Y5', optAsk: 'Want to look at how the incumbents fight back, or go to your recommendation?', optYes: 'Show me how they fight back',
    ex: [
      { id: 'Y1', nm: 'sizing the prize', hand: 'Here is what the team pulled on the size of the prize.', title: 'Sizing the prize', notes: function () { return ['sizing']; },
        body: function (d) {
          return kv([['Households in the six target metros', d.Hm < 1 ? nn(d.Hm * 1e6) : nn(d.Hm, 1) + ' million'], ['Food-at-home spend per household (BLS, 2024)', '$6,224'],
            ['Regional price level (US = 1.00)', '0.95'], ['Discount formats’ share of regional grocery spend today', '9%'], ['Stavholm’s target share by year ten', '2%'], ['Sales per compact store', mm(d.Ss, 0)]]) +
            srcLine('BLS Consumer Expenditures 2024; case data.', [S_BLS]);
        },
        qs: [{ id: 'Y1a', type: 'num', p: 'What do households in the target metros spend on groceries a year?', unit: '$B', tol: ['rel', 0.04, 0.1],
          ans: function (d) { return d.Hm * 6224 * 0.95 / 1000; }, fmt: function (v) { return bb(v); },
          hint: function (n) { return nn(n.H, 1) + ' million times about 6.2 thousand is about ' + Math.round(n.H * 6.2) + ' billion; take 5 percent off.'; },
          how: function (n) { return nn(n.H, 1) + ' million households × $6,224 × 0.95'; } },
          { id: 'Y1b', type: 'num', p: function (n) { return 'If Stavholm wins 2 percent of that by year ten, how many stores at ' + mm(n.Ss, 0) + ' of sales each?'; }, unit: 'stores', tol: ['rel', 0.06, 0.15],
            ans: function (d, v, n) { return n.mkt * 20 / n.Ss; }, fmt: function (v) { return nn(v) + ' stores'; },
            hint: function (n) { return '2 percent of ' + bb(n.mkt) + ' is about ' + mm(n.mkt * 20, 0) + '; divide by ' + mm(n.Ss, 0) + ' a store.'; },
            how: function (n) { return '2% of ' + bb(n.mkt) + ' is ' + mm(n.mkt * 20, 0) + ', over ' + mm(n.Ss, 0) + ' a store'; } }],
        so: function (v, n) {
          return [['The prize is about ' + bb(n.mkt) + ' a year and 2 percent of it supports roughly ' + nn(n.stores) + ' stores: demand is not the constraint, execution is.', 'right'],
            ['Households in the six metros spend $6,224 a year on food at home, and discount formats hold 9 percent of that spend today.', 'restate'],
            ['Discounters hold only 9 percent of regional spend, so the field is wide open: plan for 10 percent of the market, not a timid 2.', 'over']];
        },
        err: { apply: function (d) { d.Hm = d.H / 1000; d.mkt = d.Hm * 6224 * 0.95 / 1000; return d; }, what: 'households were printed in thousands, not millions',
          fix: function (n) { return 'Households are ' + nn(n.H, 1) + ' million, not ' + nn(n.H * 1000) + '. A regional grocery market in the tens of millions of dollars should have stopped us both.'; } } },
      { id: 'Y2', nm: 'who wins on price', hand: 'Here is the price check the team ran on a 40-item basket.', title: 'Who wins on price',
        body: function () {
          return '<p class="cs-cap">Price of the same 40-item basket, Stavholm = 100.</p>' +
            bars([{ k: 'Stavholm (tested)', v: 100, lab: '100', cls: 'is-you' }, { k: 'Kettle Lane (discounter)', v: 101, lab: '101' }, { k: 'Crossroads Supercenters', v: 106, lab: '106' },
              { k: 'Bayline Foods (supermarket)', v: 119, lab: '119' }, { k: 'Hollowell’s (supermarket)', v: 124, lab: '124' }], { max: 130, cap: 'Basket price index' }) +
            table(['Format', 'Share of regional grocery spend'], [['Supermarkets', '58%'], ['Supercenters', '27%'], ['Discounters', '9%'], ['Other', '6%']]) + srcLine('case data.');
        },
        qs: [{ id: 'Y2a', type: 'num', p: 'How much cheaper is Stavholm than Bayline, in percent?', unit: '%', tol: ['abs', 1, 3],
          ans: function () { return 19 / 119 * 100; }, fmt: function (v) { return pc(v); }, hint: 'The gap is 19 points on Bayline’s 119: a bit under a sixth.', how: function () { return '19 over 119'; } }],
        so: function () {
          return [['We barely undercut Kettle Lane but sit about 16 percent below the supermarkets that hold 58 percent of spending: the prize is supermarket shoppers.', 'right'],
            ['On the 40-item basket Stavholm indexes at 100, Kettle Lane at 101, Crossroads at 106, and the two supermarkets at 119 and 124.', 'restate'],
            ['Stavholm is the cheapest basket in the region, cheaper even than Kettle Lane, so price alone will win: open right next to every Kettle Lane store.', 'over']];
        } },
      { id: 'Y3', nm: 'store economics', hand: 'Here is what the team pulled on store economics.', title: 'Store economics by format', notes: function () { return ['payback']; },
        body: function (d, S) {
          var done = S.ans.Y3a && S.ans.Y3a.done;
          return table(['', 'Compact', 'Large'], [['Size', '20,000 sq ft', '36,000 sq ft'], [tm('capex', 'Capex'), '$5.0M', '$9.5M'], ['Sales', mm(d.Ss, 1), mm(d.Ss + 6, 1)],
            ['Gross margin', '23%', '24%'], ['Gross profit', mm(d.Ss * 0.23, 2), mm((d.Ss + 6) * 0.24, 2)], ['Store operating costs', '$2.4M', '$4.2M'],
            { v: [tm('contribution', 'Store contribution'), mm(d.contrib, 2), mm(d.bigShown, 2)], c: 'is-tot' },
            [tm('payback', 'Payback'), done ? yr(d.pay) : '?', done ? yr(d.bigPay) : '?']]) +
            srcLine('case data. For scale: ALDI’s published site requirement is about 22,000 square feet; Lidl’s early US stores were built to about 36,000.', [S_ALDIP, S_INQ]);
        },
        qs: [{ id: 'Y3a', type: 'num', p: 'Payback on a compact store, in years?', unit: 'years', tol: ['rel', 0.05, 0.12],
          ans: function (d) { return 5 / d.contrib; }, fmt: function (v) { return yr(v); },
          hint: function (n) { return 'Contribution is ' + nn(n.Ss) + ' times 23 percent, less 2.4: about ' + nn(n.contrib, 2) + '. Five divided by that.'; },
          how: function (n) { return '$5.0M of capex over ' + mm(n.contrib, 2) + ' a year'; } }],
        so: function (v, n) {
          return [['The compact store pays back in about ' + yr(n.pay) + '; the big box sells more, earns less, and takes about ' + yr(n.bigPay) + ': go small.', 'right'],
            ['A compact store costs $5.0M and sells ' + mm(n.Ss, 0) + ' a year; a large one costs $9.5M, sells ' + mm(n.Ss + 6, 0) + ' a year and earns a slightly better margin.', 'restate'],
            ['A compact store pays back in about ' + yr(n.pay) + ', so every site is a winner: open 200 of them in the first year.', 'over']];
        },
        err: { apply: function (d) { d.bigShown = 1.84; return d; }, what: 'the large store’s contribution did not reconcile',
          fix: function (n) { return 'Large-store contribution is ' + mm(n.big, 2) + ': sales times 24 percent, less 4.2 of costs.'; } } },
      { id: 'Y4', nm: 'build or buy', hand: 'Here is the build path, and the terms on the one chain that is for sale.', title: 'Build or buy', notes: function () { return ['entry']; },
        body: function (d) {
          return '<p class="cs-cap">Build</p>' + kv([['Distribution center', '$150M, 18 months'], ['Then', '25 compact stores a year at $5.0M each']]) +
            '<p class="cs-cap">Buy: Saltmarsh Grocers</p>' + kv([['Asking price (' + tm('ev', 'enterprise value') + ')', mm(d.EV, 0)], ['Stores', '140 supermarkets, revenue $3.2B, ' + tm('ebitda', 'EBITDA') + ' $96M'],
              ['Distribution center', 'included'], ['Fit the compact format', '84 stores, after a $2.0M conversion each: 84 × $2.0M = ' + mm(d.conv, 0)],
              ['Do not fit', '56 stores, sold for about $4.0M each: 56 × $4.0M = $224M'], ['Conversion time', 'two years']]) + srcLine('case data.');
        },
        qs: [{ id: 'Y4a', type: 'num', p: 'Net cost of the buy path after conversions and sales?', unit: '$M', tol: ['rel', 0.03, 0.08],
          ans: function (d) { return d.EV + d.conv - 224; }, fmt: function (v) { return mm(v, 0); }, hint: 'Price, plus 84 conversions at 2, less 56 stores sold at 4.',
          how: function (n) { return mm(n.EV, 0) + ' + $168M − $224M'; },
          after: function (n) { return 'Each year earlier at 84 stores is worth about ' + mm(n.perYear, 0) + ' of store contribution. Building ramps at 25 stores a year, so buying gains about ' + nn(n.storeYrs) + ' store-years, not three full years at 84 stores.'; } },
          { id: 'Y4b', type: 'num', opt: 1, p: 'And the build path to 84 stores, with the distribution center?', unit: '$M', tol: ['rel', 0.03, 0.08],
            ans: function () { return 570; }, fmt: function (v) { return mm(v, 0); }, hint: '84 stores at $5.0M, plus $150M.', how: function () { return '84 × $5.0M + $150M'; } }],
        so: function (v, n) {
          var said = 'Saltmarsh asks ' + mm(n.EV, 0) + ' for 140 supermarkets with $96M of EBITDA; building 84 stores and a distribution center costs $570M.';
          if (v === 'X') return [['Buying costs about ' + mm(n.premium, 0) + ' more than building to the same 84 stores; arriving about three years sooner is worth about ' + mm(n.speed, 0) + ': build.', 'right'],
            [said, 'restate'], ['Saltmarsh costs ' + mm(n.premium, 0) + ' more than building, so acquisitions destroy value for a company like this: rule out every deal, now and later.', 'over']];
          return [['Buying costs about what building costs and gets us to 84 stores about three years sooner, with a distribution center included: buy, then convert.', 'right'],
            [said, 'restate'], ['Saltmarsh comes with 140 stores and $96M of EBITDA, so it pays for itself: buy it and keep all 140 running as supermarkets.', 'over']];
        },
        err: { apply: function (d) { d.conv = 186; return d; }, what: 'the conversion line read 84 × $2.0M = $186M',
          fix: function () { return '84 times 2 is 168, not 186. Transposed digits, the oldest error in finance.'; } } },
      { id: 'Y5', nm: 'how the incumbents fight back', hand: 'Here is how Kettle Lane has answered new entrants before.', title: 'What the incumbents do',
        body: function () {
          return '<p class="cs-note">In three earlier entries into Kettle Lane cities, Kettle Lane cut prices about 5 percent for about two years. Stavholm’s gross margin in those cities would fall to about 20 percent for that period.</p>' +
            kv([['Price cut', 'about 5%'], ['Duration', 'about two years'], ['Stavholm gross margin during the war', '20% (normally 23%)']]) + srcLine('case data.');
        },
        qs: [{ id: 'Y5a', type: 'num', p: 'Compact store contribution during the price war?', unit: '$M', tol: ['rel', 0.05, 0.12],
          ans: function (d) { return d.Ss * 0.2 - 2.4; }, fmt: function (v) { return mm(v, 2); }, hint: function (n) { return nn(n.Ss) + ' times 20 percent, less 2.4.'; },
          how: function (n) { return mm(n.Ss, 0) + ' × 20% − $2.4M'; } }],
        so: function (v, n) {
          return [['A price war cuts store contribution by about ' + nn(100 * (1 - n.war / n.contrib)) + ' percent for two years without sinking the store: fund it, and open away from Kettle Lane first.', 'right'],
            ['Kettle Lane has answered three entrants with a 5 percent price cut lasting about two years, which takes our margin to 20 percent.', 'restate'],
            ['Kettle Lane cuts prices whenever someone enters, so it will defend every city it has: match every cut it makes, for as long as it takes.', 'over']];
        } }
    ],
    curves: [
      { id: 'CB0', t: 'A developer offers thirty sites across Atlanta and Charlotte at once, all 36,000 square feet, ready next year.',
        opts: [
          { t: 'Take them; thirty sites at once saves two years of site hunting, and speed is the scarcest thing we have.', J: -1, note: 'curvePivot', r: function (S) { return 'That is the format that pays back in about ' + yr(S.n.bigPay) + '.'; } },
          { t: 'Only if they can be split to about 20,000 square feet; otherwise speed buys us the wrong store.', J: 2, C: 1, note: 'curveGood', r: 'Right. Speed that buys the wrong store is not speed.' },
          { t: 'No; we should never let a developer set our pace, whatever the sites look like.', J: 0, C: -0.5, note: 'curveDismiss', r: 'Maybe right. Tell me why in one sentence.' }
        ] },
      { id: 'CB1', t: 'The family chair says they are builders, not buyers. Their grandfather never bought a store in his life.',
        opts: [
          { t: 'Then drop the acquisition option; the family owns the company, and its preferences are part of the brief.',
            J: function (S) { return !has(S.seen, 'Y4') ? -0.5 : S.v === 'X' ? 0 : -1; }, note: function (S) { return has(S.seen, 'Y4') && S.v === 'X' ? null : 'curvePivot'; },
            r: function (S) { return !has(S.seen, 'Y4') ? 'Before you drop it, put a number on what it costs them.' : S.v === 'X' ? 'Fine here, since building wins on the numbers anyway. Say that, not the grandfather.' : 'That may cost them the better deal. Put a number on it before you drop it.'; } },
          { t: 'Respect it, and put a number on it: what building costs in years and dollars against buying.', J: 2, C: 1, note: 'curveGood', r: 'Good. Respect the family, and show them the price of their preference.' },
          { t: 'Tell them the numbers say buy; sentiment is not a strategy, and the grandfather never faced this market.', J: function (S) { return !has(S.seen, 'Y4') || S.v === 'X' ? -1 : 0; }, C: -1, note: 'curveDismiss',
            r: function (S) { return !has(S.seen, 'Y4') ? 'You do not have those numbers yet. Never tell a family chair what the numbers say before you have them.' : S.v === 'X' ? 'They do not, as it happens. And never tell a family chair what the numbers say before you have them.' : 'Maybe true. Said like that, it lands as a lecture.'; } }
        ] }
    ],
    recAsk: 'The family is on the line. What do you tell them?',
    gov: [
      { id: 'G1', ok: 'X', t: 'Enter, and build it: compact 20,000 square foot stores from one distribution center, about 25 a year, because the acquisition’s premium is worth more than the time it saves.' },
      { id: 'G2', ok: 'Y', t: 'Enter by buying Saltmarsh: at this price we get sites and a distribution center for about what building costs, and reach scale three years sooner.' },
      { id: 'G3', part: 1, t: 'Enter through a joint venture with a regional supermarket.', r: 'Nothing we looked at says a partner exists or would give up control. Defensible only with data we did not see.' },
      { id: 'G4', t: 'Enter with 36,000 square foot stores to win on range and fresh food.' },
      { id: 'G5', last: 1, t: 'Let me take you through the market first.' },
      { id: 'G6', hedge: 1, t: 'It is probably a mix of factors; we need more data before recommending anything.' }
    ],
    lead: ['why'],
    sup: function (v) {
      return [
        { id: 's1', role: 'why', need: ['Y1'], q: ['Y1a', 'Y1b'], num: 1, t: function (S) { return 'The prize is about ' + qf(S, 'Y1a') + ' a year, and 2 percent of it supports about ' + qf(S, 'Y1b') + '.'; } },
        { id: 's2', role: 'why', need: ['Y2'], q: ['Y2a'], num: 1, t: function (S) { return 'We are about ' + qf(S, 'Y2a') + ' cheaper than the supermarkets that hold 58 percent of spending.'; } },
        { id: 's3', role: 'econ', need: ['Y3'], q: ['Y3a'], num: 1, dup: 'econ', t: function (S, n) { return 'A compact store pays back in about ' + qf(S, 'Y3a') + '; a 36,000 square foot store in about ' + yr(n.bigPay) + '.'; } },
        { id: 's4', role: 'mode', need: ['Y4'], q: ['Y4a'], num: 1, t: function (S, n) {
          var p = qv(S, 'Y4a').v - 570;
          return v === 'X' ? 'Buying Saltmarsh costs about ' + mm(p, 0) + ' more than building, and the three years it saves are worth about ' + mm(n.speed, 0) + '.'
            : 'Buying costs within about ' + mm(Math.abs(p), 0) + ' of what building costs, close to even, and gets us to 84 stores three years sooner with a distribution center included.';
        } },
        { id: 's5', role: 'risk', need: ['Y5'], t: function (S, n) { return 'Plan for a two-year price war that cuts store contribution by about ' + nn(100 * (1 - n.war / n.contrib)) + ' percent.'; } },
        { id: 's6', role: 'econ', dup: 'econ', t: 'Small stores are cheaper to build.' },
        { id: 's7', bad: 1, role: 'mode', t: v === 'X' ? 'Saltmarsh is the fastest route to profit.' : 'Building our own is always cheaper.' }];
    },
    risks: { X: [['Twenty-five good sites a year is ambitious in markets we do not know.', 1], ['Converting supermarket shoppers used to national brands and a long aisle to our short one.'], ['The logo may not translate.']],
      Y: [['Converting supermarket shoppers used to national brands and a long aisle to our short one.', 1], ['Twenty-five good sites a year is ambitious in markets we do not know.'], ['The logo may not translate.']] },
    next: { X: [['Lock the distribution center site and a pipeline of forty compact sites before announcing.', 1], ['Commission a store-by-store review of Saltmarsh’s 140 sites and a quality-of-earnings review before signing.'], ['Run a brand awareness campaign before opening.']],
      Y: [['Commission a store-by-store review of Saltmarsh’s 140 sites and a quality-of-earnings review before signing.', 1], ['Lock the distribution center site and a pipeline of forty compact sites before announcing.'], ['Run a brand awareness campaign before opening.']] },
    truth: function (v, n) {
      return v === 'X' ? 'Build. At an asking price of ' + mm(n.EV, 0) + ', Saltmarsh nets out to about ' + mm(n.buyNet, 0) + ' against $570M to build the same 84 compact stores: a premium of about ' + mm(n.premium, 0) +
        ' for roughly three years of speed worth about ' + mm(n.speed, 0) + '. The compact store pays back in about ' + yr(n.pay) + '; the big box in about ' + yr(n.bigPay) + '.'
        : 'Buy. At ' + mm(n.EV, 0) + ', Saltmarsh nets out to about ' + mm(n.buyNet, 0) + ', within ' + mm(Math.abs(n.premium), 0) + ' of the $570M it costs to build, and it reaches 84 stores about three years sooner with a distribution center included; that time is worth about ' + mm(n.speed, 0) + '.';
    },
    real: function () {
      return { t: 'Both routes are real. Lidl opened its first US stores in June 2017 planning about 100 within a year, built to a 36,000 square foot template, which the Inquirer in 2018 called about twice the size of a typical ALDI store; a year later it had 53 and was looking to lease sites of 15,000 to 25,000 square feet. In 2025 it ran about 192 US stores and had cut its core range from 4,500 products to 3,250. ALDI’s published site requirement is about 22,000 square feet; in August 2023 it agreed to buy about 400 Winn-Dixie and Harveys stores across five Southeastern states, evaluating which to convert to its own format, and it targets 3,200 US stores by the end of 2028. The format decides the economics; the price of the target decides build versus buy.',
        src: [S_ICSC, S_INQ, S_SN, S_ALDIP, S_ALDIW, S_ALDIG] };
    },
    one: 'Size the prize, then let the store format decide the economics and the price of the target decide build versus buy.'
  };
  function yr(v) { return F.n(v, 1) + ' years'; }

  /* CASE 03 · Larkspur Veterinary Partners · due diligence · candidate-led */
  var G5 = Math.pow(1.08, 5);
  /* the run-rate EBITDA the returns exhibit works from: the player's own answer unless it was graded wrong */
  function runRate(S, d) { var a3 = S && S.ans && S.ans.V3b; return a3 && a3.done && a3.grade !== 'wrong' && a3.val != null ? a3.val : d.rr; }
  function maxEVfor(rr) { return (13 * (rr * G5 + 12) - 170) / 2.5 + 165; }
  function vetNum(v, k) {
    var n = { v: v, k: k, adjShown: 30 };
    if (v === 'P') { n.a = [2.5, 3.0, 3.5][k]; n.rep = 25 - n.a; n.acq = n.a; n.rec = 2.5; n.pf = 2.5; n.mult = 15; n.ask = 450; n.rr = n.rep + 2.5;
      n.vis = -0.010; n.ppv = 0.070; n.seats = 0.6; n.turn = 16; n.rev0 = 9; n.rev1 = 21; n.wait = 11; }
    else { n.rep = 27; n.acq = 0.5; n.rec = 0; n.pf = 2.5; n.mult = 12; n.ask = 360; n.rr = 30;
      n.vis = 0.015; n.ppv = 0.045; n.seats = 0.2; n.turn = 9; n.rev0 = 9; n.rev1 = 11; n.wait = 5; }
    n.visShown = n.vis; n.eq0 = n.ask - 165; n.bank5 = 30 * G5 + 12; n.bankEq = 13 * n.bank5 - 170; n.bankMoic = n.bankEq / n.eq0;
    n.rr5 = n.rr * G5 + 12; n.rrEq = 13 * n.rr5 - 170; n.rrMoic = n.rrEq / n.eq0; n.maxEV = n.rrEq / 2.5 + 165; n.moic10 = (10 * n.rr5 - 170) / n.eq0;
    n.growth = ((1 + n.vis) * (1 + n.ppv) - 1) * 100; n.lost = 64 * n.seats * 0.85; n.gap15 = (30 - n.rr) * 15;
    return n;
  }
  var VET = {
    id: 'vet', n: 3, client: 'Larkspur Veterinary Partners', short: 'Larkspur', kind: 'Due diligence', format: 'cand', budget: 35, diff: 3,
    who: { name: 'Joanna Cho', role: 'partner' }, hook: 'A buyout fund, a chain of animal hospitals, and a banker’s very pretty deck.',
    vars: ['P', 'R'], order: ['P', 'R'], vname: { P: 'the pretty deck', R: 'the real thing' },
    compute: vetNum, openNotes: ['ebitda'],
    prompt: function (n) {
      return 'Kilnworth Capital, a private equity fund, has a week of exclusivity to buy Larkspur Veterinary Partners: 64 general-practice animal hospitals in the Mountain West. The banker’s book shows adjusted ' +
        tm('ebitda', 'EBITDA') + ' of $30 million and an asking price of ' + n.mult + ' times, ' + mm(n.ask, 0) + '. Kilnworth needs about 2.5 times its money in five years. Should it buy at this price?';
    },
    restate: [
      { id: 'acc', t: function (n) { return 'So: is Larkspur worth ' + mm(n.ask, 0) + ' to a fund that needs 2.5 times its money in five years, and if not, what is it worth?'; } },
      { id: 'drift', t: 'So we need to decide whether vet clinics are a good industry.', fix: 'Good industries are full of bad prices.' }
    ],
    clarify: [
      { id: 'v1', type: 'obj', q: 'What does Kilnworth need from this deal: a return target, a hold period?', a: '2.5 times its money over five years, roughly 20 percent a year.' },
      { id: 'v2', type: 'metric', q: 'Whose EBITDA is the $30 million: reported, or adjusted by the seller?', a: 'Adjusted by the seller. Reported is lower. The difference is in the data room.' },
      { id: 'v3', type: 'fact', q: 'How has Larkspur grown: new clinics or existing ones?', a: { P: 'Mostly acquisitions, and price increases in the existing clinics.', R: 'About half and half, and the existing clinics are seeing more visits.' } },
      { id: 'v4', type: 'scope', q: 'Are we buying all 64, and is the management team staying?', a: 'All 64. The CEO stays; three of the founding vets want to retire within two years.' },
      { id: 'v5', type: 'fish', q: 'What did the last vet chain sell for?', a: 'Multiples are in the data room. Why does it matter to your structure?' },
      { id: 'v6', type: 'noise', q: 'Do they treat exotic animals?', a: 'A few parrots. Keep going.' },
      { id: 'v7', type: 'fact', q: 'Is anyone else bidding?', a: 'The banker says yes. Bankers always say yes.' }
    ],
    req: ['market', 'target', 'earnings', 'returns'], bucket: { market: 'the market', target: 'the clinics’ own performance', earnings: 'the quality of the earnings', returns: 'price and returns' },
    cards: [
      { id: 'd1', t: 'Market: demand, growth and fragmentation', subs: ['pet ownership', 'spend on vet care', 'who else is buying clinics'], cov: 'market', tail: 1 },
      { id: 'd2', nm: 'the clinics’ own growth', t: 'The target: same-clinic growth, pricing and capacity', subs: ['visits and price', 'vet staffing', 'reviews'], cov: 'target', tail: 1, ok: 'target' },
      { id: 'd3', say: 'whether the $30M is real', t: 'Quality of earnings: is $30M real?', subs: ['reported to adjusted', 'which add-backs recur'], cov: 'earnings', tail: 1 },
      { id: 'd4', t: 'Value creation plan: add-ons, pricing, purchasing', subs: ['add-on multiples', 'price increases', 'procurement'], tail: 1 },
      { id: 'd5', t: 'Price and returns: what must be true for 2.5 times', subs: ['entry and exit multiples', 'debt', 'maximum price'], cov: 'returns', tail: 1 },
      { id: 'd6', t: 'Risks: vet staffing, reputation, regulation', subs: ['turnover', 'reviews', 'licensing'], neu: 1 },
      { id: 'd7', t: 'Porter’s five forces', trap: 'Useful inside the market branch. It will not tell you whether the asking price is right.', pts: -0.5 },
      { id: 'd8', t: 'Revenue minus costs', cov: 'target', ok: 'target' },
      { id: 'd9', t: 'Synergies', irr: 'Kilnworth owns no other clinics. There is nothing to be synergistic with.' },
      { id: 'd10', t: 'Company culture', irr: 'It matters after you own it. It will not price it.' }
    ],
    hyps: [
      { id: 'e1', t: 'Good business, price too high.' }, { id: 'e2', t: 'Good business, fair price.' },
      { id: 'e3', t: 'The earnings are overstated.' }, { id: 'e4', t: 'The market is shrinking.' }
    ],
    truthHyp: { P: ['e1', 'e3'], R: ['e2'] },
    dis: [['V1', 'PR', 'e4'], ['V3', 'R', 'e3'], ['V3', 'P', 'e2'], ['V6', 'P', 'e2'], ['V6', 'R', 'e1'], ['V6', 'R', 'e3']],
    root: { P: 'V3', R: 'V3' }, eff: { P: ['V3', 'V6', 'V2'], R: ['V3', 'V6', 'V4'] }, canErr: ['V2', 'V3', 'V5'],
    ex: [
      { id: 'V1', req: 'The US pet market', nm: 'the pet market', title: 'The US pet market', inn: ['d1', 'd7'],
        body: function () {
          return kv([['US pet industry spending, 2024', '$158B'], ['of which vet care and product sales', '$41.0B'], ['US households that own a pet (2025 survey)', '95 million'],
            ['Pet-owning households in the target region', 'growing about 2.5% a year (case data)']]) + srcLine('American Pet Products Association; case data.', [S_APPA]);
        },
        qs: [{ id: 'V1a', type: 'num', p: 'What share of US pet spending goes to vet care and product sales?', unit: '%', tol: ['abs', 1, 3],
          ans: function () { return 41 / 158 * 100; }, fmt: function (v) { return pc(v); }, hint: '41 over 158: a bit more than a quarter.', how: function () { return '41 over 158'; } }],
        so: function () {
          return [['Vet care is a $41B slice of a $158B market and regional demand grows about 2.5 percent a year: this deal is not won or lost on demand.', 'right'],
            ['Americans spent $158B on pets in 2024, $41.0B of it on vet care and product sales, across 95 million pet-owning households.', 'restate'],
            ['Vet care is a quarter of a $158B market and pet households keep growing, so any clinic chain is a safe buy at almost any price.', 'over']];
        } },
      { id: 'V2', req: 'Same-clinic growth: visits and price', nm: 'same-clinic growth', title: 'Same-clinic growth: visits and revenue per visit', inn: ['d2', 'd8'],
        body: function (d) {
          var v0 = 14300, p0 = 171, true1 = d.vis, shown = d.visShown;
          var vis = [v0, v0 * (1 + true1), v0 * (1 + true1) * (1 + true1)], ppv = [p0, p0 * (1 + d.ppv), p0 * (1 + d.ppv) * (1 + d.ppv)];
          return table(['Per clinic', 'Two years ago', 'Last year', 'This year', 'Change this year'], [
            ['Visits', nn(vis[0]), nn(vis[1]), nn(vis[2]), (shown > 0 ? '+' : F.minus) + nn(Math.abs(shown * 100), 1) + '%'],
            ['Revenue per visit', usd(ppv[0]), usd(ppv[1]), usd(ppv[2]), '+' + nn(d.ppv * 100, 1) + '%']]) +
            '<p class="cs-note">Footnote: visits per clinic ' + (d.vis < 0 ? 'fell ' : 'rose ') + nn(Math.abs(d.vis * 100), 1) + '% this year on the same clinics.</p>' + srcLine('case data.');
        },
        qs: [{ id: 'V2a', type: 'num', p: 'Same-clinic revenue growth this year?', unit: '%', tol: ['abs', 0.3, 1],
          ans: function (d) { return ((1 + d.visShown) * (1 + d.ppv) - 1) * 100; }, fmt: function (v) { return pc(v); },
          hint: 'Revenue is visits times revenue per visit, so multiply the growth factors and subtract one.',
          how: function (n) { return nn(1 + n.vis, 3) + ' × ' + nn(1 + n.ppv, 3) + ' − 1'; } }],
        so: function (v, n) {
          var R = v === 'P' ? 'All of the growth is price; visits are shrinking: that runs out when owners push back.' : 'Growth is balanced between more visits and modest price rises: healthier than most roll-ups.';
          return [[R, 'right'], ['Revenue per visit rose ' + nn(n.ppv * 100, 1) + ' percent and visits per clinic ' + (n.vis < 0 ? 'fell ' : 'rose ') + nn(Math.abs(n.vis * 100), 1) + ' percent, for same-clinic growth of about ' + nn(n.growth, 1) + ' percent.', 'restate'],
            ['Revenue per visit rose ' + nn(n.ppv * 100, 1) + ' percent in a year, so pricing power is strong: plan on 10 percent price rises every year.', 'over']];
        },
        err: { apply: function (d) { d.visShown = -d.vis; return d; }, what: 'the visits change was printed with the wrong sign',
          fix: function () { return 'Visits moved the other way; the footnote has it right.'; } } },
      { id: 'V3', req: 'The EBITDA bridge: reported to adjusted', nm: 'the EBITDA bridge', title: 'The EBITDA bridge: reported to adjusted', inn: ['d3'], notes: function () { return ['qoe']; },
        body: function (d, S) {
          var cols = [['Reported', 0, d.rep, 'is-base'], ['Acquisition and integration costs', d.rep, d.acq]];
          if (d.rec) cols.push(['Recruiting and sign-on bonuses', d.rep + d.acq, d.rec]);
          cols.push(['Pro forma for clinics bought this year', d.rep + d.acq + d.rec, d.pf], ['Adjusted', 0, d.adjShown, 'is-tot']);
          var mx = 32, h = '<div class="cs-wf" aria-hidden="true">' + cols.map(function (c) {
            return '<div class="cs-wf-col ' + (c[3] || '') + '"><div class="cs-wf-plot"><i style="bottom:' + (c[1] / mx * 100).toFixed(2) + '%;height:' + (Math.max(c[2], 0.3) / mx * 100).toFixed(2) + '%"></i><span style="bottom:' +
              ((c[1] + c[2]) / mx * 100).toFixed(2) + '%">' + (c[3] ? '' : '+') + mm(c[2]) + '</span></div><span class="cs-wf-k">' + strip(c[0]) + '</span></div>';
          }).join('') + '</div>';
          var foot = S.v === 'P' ? 'Recruiting and sign-on bonuses, described as one-time: $2.1M, $2.3M and $2.5M in the last three years. Acquisition costs: Larkspur bought 5 to 7 clinics in each of the last four years.'
            : 'Acquisition costs relate to the last deal, six months ago, which added 4 clinics; no deals since. The pro forma adjustment adds those 4 clinics’ results for the months before closing, based on their results since.';
          return '<p class="cs-cap">Reported ' + tm('ebitda', 'EBITDA') + ' to the seller’s adjusted figure, one ' + tm('addback', 'add-back') + ' at a time, including the ' + tm('proforma', 'pro forma') + ' adjustment. $M.</p>' + h +
            '<table class="vh"><caption>EBITDA bridge</caption><tbody>' + cols.map(function (c) { return '<tr><th scope="row">' + strip(c[0]) + '</th><td>' + (c[3] ? '' : '+') + mm(c[2]) + '</td></tr>'; }).join('') + '</tbody></table>' +
            '<p class="cs-note">Footnotes: ' + foot + '</p>' + srcLine('the seller’s banker; case data.');
        },
        qs: function (v) {
          var opts = v === 'P' ? [['acq', 'Acquisition and integration costs'], ['rec', 'Recruiting and sign-on bonuses'], ['pf', 'Pro forma for clinics bought this year'], ['none', 'None of these; they look reasonable']]
            : [['acq', 'Acquisition and integration costs'], ['pf', 'Pro forma for clinics bought this year'], ['none', 'None of these; they look reasonable']];
          return [{ id: 'V3a', type: 'multi', p: 'Which add-backs would you challenge?', opts: opts,
            judge: function (sel) {
              var acq = has(sel, 'acq'), rec = has(sel, 'rec'), pf = has(sel, 'pf'), none = has(sel, 'none');
              if (v === 'P') { if (none) return { J: 0, g: 'wrong' }; var c = (acq ? 1 : 0) + (rec ? 1 : 0); return c === 2 ? { J: pf ? 1 : 2, g: pf ? 'partial' : 'full' } : c === 1 ? { J: pf ? 0.5 : 1, g: 'partial' } : { J: 0, g: 'wrong' }; }
              if (pf) return { J: -0.5, g: 'wrong' };
              if (none) return { J: 2, g: 'full' };
              return acq ? { J: 1, g: 'partial' } : { J: 0, g: 'wrong' };
            },
            say: { P: 'Recruiting happens every year and so do the acquisitions; neither is one-time. The pro forma is fair.', R: 'Small and documented. The last deal was six months ago with none since, so its costs will not recur, and the pro forma rests on real results since closing.' } },
            { id: 'V3b', type: 'num', p: 'Your ' + tm('runrate', 'run-rate') + ' EBITDA?', unit: '$M', tol: ['rel', 0.02, 0.06],
              ans: function (d) { return d.rr + (d.adjShown - 30); }, fmt: function (x) { return mm(x); },
              hint: v === 'P' ? 'Keep the pro forma, drop the two add-backs that happen every year.' : 'Ask of each add-back: does this cost come back next year? Keep every one that does not.',
              how: function (n) { return v === 'P' ? 'Reported ' + mm(n.rep) + ' plus the $2.5M pro forma; the acquisition and recruiting costs recur' : 'Reported $27.0M, plus the $0.5M of acquisition costs, which are one-off, plus the $2.5M pro forma'; } }];
        },
        so: function (v, n) {
          if (v === 'P') return [['Two of the three add-backs happen every year; run-rate EBITDA is about ' + mm(n.rr) + ', and at 15 times that gap alone is about ' + mm(n.gap15, 0) + ' of price.', 'right'],
            ['The seller adds ' + mm(n.acq) + ' of acquisition costs, $2.5M of recruiting and $2.5M of pro forma to reported EBITDA to reach $30.0M.', 'restate'],
            ['Two add-backs are called one-time but recur every year, so the seller is hiding something: walk away from the deal today.', 'over']];
          return [['The add-backs are small, one-off and documented, so run-rate EBITDA is the full $30M: the earnings are real.', 'right'],
            ['Reported EBITDA is $27.0M; adding $0.5M of deal costs and a $2.5M pro forma gives the seller’s $30.0M.', 'restate'],
            ['The bridge adds $3M to reported EBITDA, and add-backs are always suspect: cut every one and price the deal on $27M.', 'over']];
        },
        err: { apply: function (d) { d.adjShown = 31; return d; }, what: 'the adjusted total was printed as $31.0M',
          fix: function () { return 'The bridge sums to $30.0M; someone rounded up in the seller’s favor, which is the direction they always round.'; } } },
      { id: 'V4', req: 'Vet staffing and capacity', nm: 'vet staffing', title: 'Vet staffing and capacity', inn: ['d2', 'd6'],
        body: function (d) {
          return kv([['Vets per clinic', '3.1'], ['Open vet seats per clinic', nn(d.seats, 1)], ['Annual vet turnover', d.turn + '%'], ['Revenue per vet', '$0.85M'], ['Cost to recruit a vet', 'about $40,000']]) + srcLine('case data.');
        },
        qs: [{ id: 'V4a', type: 'num', p: 'Revenue lost to open vet seats across 64 clinics?', unit: '$M', tol: ['rel', 0.05, 0.12],
          ans: function (d) { return 64 * d.seats * 0.85; }, fmt: function (v) { return mm(v); }, hint: function (n) { return '64 clinics times ' + nn(n.seats, 1) + ' open seats, times $0.85M a vet.'; },
          how: function (n) { return '64 × ' + nn(n.seats, 1) + ' × $0.85M'; } }],
        so: function (v, n) {
          var R = v === 'P' ? 'Unfilled vet seats cost about ' + mm(n.lost) + ' of revenue a year: the binding constraint is vets, not pets.' : 'Few open seats and ' + n.turn + ' percent turnover: staffing can carry the growth plan, so capacity is not the risk.';
          return [[R, 'right'], ['Each clinic has 3.1 vets and ' + nn(n.seats, 1) + ' open seats, turnover runs ' + n.turn + ' percent, and a vet brings in $0.85M a year.', 'restate'],
            ['Open seats cost about ' + mm(n.lost) + ' of revenue a year, so vets are underpaid: double vet salaries in all 64 clinics.', 'over']];
        } },
      { id: 'V5', req: 'The seller’s value creation plan', nm: 'the value creation plan', title: 'The seller’s value creation plan', inn: ['d4'], notes: function () { return ['arbitrage']; },
        body: function (d) {
          return kv([['Add-on clinics', '10 over five years at 7x their EBITDA of $1.2M each'], ['Add-on EBITDA', d.addShown ? '10 × $1.2M = $14.0M' : '10 × $1.2M = $12.0M'],
            ['Exit multiple', '13x'], ['Procurement savings', '1.5 points of revenue'], ['Price increases', '5% a year']]) +
            '<p class="cs-note">Most of the plan’s value rests on ' + tm('arb', 'multiple arbitrage') + ': earnings bought at one multiple and sold inside another.</p>' + srcLine('the seller’s banker; case data.');
        },
        qs: [{ id: 'V5a', type: 'num', p: 'Value created per add-on at exit, from the multiple alone?', unit: '$M', tol: ['rel', 0.03, 0.08],
          ans: function () { return 1.2 * (13 - 7); }, fmt: function (v) { return mm(v); }, hint: 'Bought at 7 times $1.2M, worth 13 times $1.2M inside the platform.', how: function () { return '$1.2M × (13 − 7)'; } }],
        so: function () {
          return [['Each add-on creates about $7M on paper, but only if the exit multiple holds; at 10x half of it disappears, and at 8x five-sixths of it.', 'right'],
            ['The plan buys 10 clinics at 7 times $1.2M of EBITDA each and sells the whole platform at 13 times in year five.', 'restate'],
            ['Each add-on bought at 7x is worth 13x inside the platform, so every add-on is free money: buy fifty instead of ten.', 'over']];
        },
        err: { apply: function (d) { d.addShown = 1; return d; }, what: 'the plan said 10 × $1.2M = $14.0M', fix: function () { return 'Ten times 1.2 is 12, not 14. The plan’s own arithmetic is flattering it.'; } } },
      { id: 'V6', req: 'Returns at the asking price', nm: 'returns at the asking price', title: 'Returns at the asking price', inn: ['d5'], notes: function () { return ['moic']; },
        body: function (d, S) {
          /* the run-rate case carries the player's own number forward unless it was wrong, and V6b is graded against what is printed here */
          var a3 = S.ans.V3b, rrOk = !!(a3 && a3.done), mine = rrOk && a3.grade !== 'wrong', rr = rrOk ? runRate(S, d) : null;
          return kv([['Entry', 'price ' + mm(d.ask, 0) + ', debt $165M, equity ' + mm(d.eq0, 0)],
            ['Banker’s case', 'year-5 EBITDA $56.1M (adjusted $30M grown 8% a year, plus $12M from add-ons), exit at 13x, net debt at exit $170M'],
            ['Growth factor', '1.08 to the fifth power is about 1.47'],
            ['Run-rate case', rrOk ? 'year-5 EBITDA ' + mm(rr * G5 + 12) + ' (' + (mine ? 'your ' : 'run-rate ') + mm(rr) + ' grown 8% a year, plus $12M), exit at 13x, net debt $170M' : 'needs your ' + tm('qoe', 'quality-of-earnings') + ' number from the EBITDA bridge']]) +
            '<p class="cs-note">' + tm('moic', 'MOIC') + ' is exit equity over entry equity; ' + tm('irr', 'IRR') + ' is the annual rate that gets you there.</p>' + srcLine('case data.');
        },
        qs: [{ id: 'V6a', type: 'num', p: 'MOIC at the asking price in the banker’s case?', unit: 'x', tol: ['rel', 0.03, 0.08],
          ans: function (d) { return d.bankEq / d.eq0; }, fmt: function (v) { return xx(v); }, hint: 'Exit equity is 13 times 56.1 less 170, about 560. Divide by what you put in.',
          how: function (n) { return '13 × $56.1M − $170M is about $559M, over ' + mm(n.eq0, 0) + ' of equity'; } },
          { id: 'V6b', type: 'num', needs: 'V3b', p: 'On your run-rate case, what is the most Kilnworth can pay and still make 2.5x?', unit: '$M', tol: ['rel', 0.03, 0.08],
            ans: function (d, v, n, S) { return maxEVfor(runRate(S, d)); }, fmt: function (v) { return mm(v); }, hint: 'Work backwards: exit equity over 2.5 is the most equity you can put in; add the $165M of debt.',
            how: function (n, S) { var eq = 13 * (runRate(S, n) * G5 + 12) - 170; return 'Run-rate exit equity ' + mm(eq, 0) + ' over 2.5 is ' + mm(eq / 2.5, 0) + ' of equity, plus $165M of debt'; } }],
        so: function (v, n) {
          var said = 'At ' + mm(n.ask, 0) + ' Kilnworth puts in ' + mm(n.eq0, 0) + ' of equity alongside $165M of debt and plans to exit at 13 times in year five.';
          if (v === 'P') return [['Even the banker’s own case returns under 2x at $450M; on real earnings the most we can pay is about ' + mm(n.maxEV, 0) + '.', 'right'], [said, 'restate'],
            ['The banker’s case falls short of 2.5x at this price, so the gap is financing: add debt until the returns clear.', 'over']];
          return [['At $360M the base case returns about ' + xx(n.rrMoic, 1) + ', above target, with room to about ' + mm(n.maxEV, 0) + ' and no further.', 'right'], [said, 'restate'],
            ['The base case clears 2.5x with room to spare, so the deal is safe: bid well above the ask to be sure we win.', 'over']];
        } },
      { id: 'V7', req: 'What pet owners say online', nm: 'online reviews', title: 'What pet owners say online', inn: ['d6'],
        body: function (d) {
          return kv([['Share of reviews mentioning price', d.rev0 + '% two years ago, ' + d.rev1 + '% now'], ['Median wait for a routine appointment', d.wait + ' days']]) + srcLine('case data.');
        },
        so: function (v, n) {
          return [[v === 'P' ? 'Customers are starting to notice the price increases that drive all of the growth.' : 'Price mentions barely moved and routine waits are short: reputation is stable and no reason to pay less.', 'right'],
            ['Reviews mentioning price went from ' + n.rev0 + ' to ' + n.rev1 + ' percent in two years, and the median routine wait is ' + n.wait + ' days.', 'restate'],
            ['More reviews mention price than two years ago, so owners are angry: freeze every price increase for the whole hold.', 'over']];
        } }
    ],
    curves: [
      { id: 'CB0', t: function (S) { return 'The banker says another fund is at ' + mm(S.n.ask + 20, 0) + ' and wants final bids by Friday.'; },
        opts: [
          { t: 'Beat it; assets like this are scarce, and losing the auction would cost us another year of searching.', J: -2, note: 'curvePivot', r: 'That is how funds win auctions and lose money.' },
          { t: function (S) { return S.v === 'P' ? 'Bid our number from the model and no higher, and ask for the recruiting history before we sign.' : 'Bid our number from the model and no higher, and ask for the new clinics’ monthly results.'; }, J: 2, C: 1, note: 'curveGood', r: 'Good. The model sets the price, not the other bidder.' },
          { t: 'Withdraw now; a seller running an auction this hot will not give us a fair price anyway.', J: function (S) { return S.v === 'P' ? 0 : -1; }, note: 'curveDismiss', r: function (S) { return S.v === 'P' ? 'Maybe right, but a number is more useful than a door.' : 'You just walked away from a good deal without a number.'; } }
        ] },
      { id: 'CB1', t: function (S) { return S.v === 'P' ? 'The seller’s CFO says the recruiting bonuses were a one-time catch-up.' : 'The seller’s CFO says the pro forma for the new clinics is conservative.'; },
        opts: [
          { t: 'Accept it; the CFO knows the business far better than we can in a week, and the story is plausible.', J: -1, note: 'curvePivot', r: 'The CFO also wants the highest price.' },
          { t: function (S) { return S.v === 'P' ? 'Ask for three years of that line and the turnover behind it.' : 'Ask for the new clinics’ monthly results since closing.'; }, J: 2, C: 1, note: 'curveGood',
            r: function (S) { return S.v === 'P' ? 'Here they are: $2.1M, $2.3M and $2.5M. One-time, three years running.' : 'Here they are: the four clinics are running slightly ahead of the pro forma.'; },
            fx: function (S) { S.foot = true; } },
          { t: 'Tell them it is not credible; a seller’s CFO always says that, whatever the numbers show.', J: 0, C: -1, note: 'curveDismiss', r: 'Maybe. Now you have an argument instead of a number.' }
        ] }
    ],
    recAsk: 'The investment committee meets in an hour. What do we tell them?',
    gov: [
      { id: 'G1', ok: 'P', t: function (n) { return 'Do not pay ' + mm(n.ask, 0) + '. Earnings are closer to ' + mm(n.rr) + ' than $30M, and at that level the most we can pay for our return is about ' + mm(n.maxEV, 0) + ': bid there or walk.'; } },
      { id: 'G2', ok: 'R', t: function (n) { return 'Buy at ' + mm(n.ask, 0) + '. The earnings hold up, growth is balanced, and our base case returns about ' + xx(n.rrMoic, 1) + ': bid up to about ' + mm(n.maxEV, 0) + ' and no further.'; } },
      { id: 'G3', t: 'Buy; pet spending is a great market and the add-ons will make the numbers work.' },
      { id: 'G4', t: 'Walk away; vet clinics are a bad business.' },
      { id: 'G5', last: 1, t: 'Let me start with the market.' },
      { id: 'G6', hedge: 1, t: 'It is probably a mix of factors; we need more data before recommending anything.' }
    ],
    lead: ['earnings', 'returns'],
    sup: function (v) {
      var mkt = { id: 's5', role: 'market', need: ['V1'], num: 1, t: 'Demand is strong: vet care is a $41B slice of a $158B pet market.' };
      if (v === 'P') return [
        { id: 's1', role: 'earnings', need: ['V3'], q: ['V3b'], num: 1, t: function (S) { return 'Two of the three add-backs recur every year; run-rate EBITDA is about ' + qf(S, 'V3b') + ', not $30M.'; } },
        { id: 's2', role: 'returns', need: ['V6'], q: ['V6a'], num: 1, dup: 'returns', t: function (S) { return 'Even the banker’s case returns about ' + qf(S, 'V6a') + ' at $450M; we need 2.5x.'; } },
        { id: 's3', role: 'target', need: ['V2'], num: 1, t: 'All the growth is price: visits fall 1 percent a year while revenue per visit rises 7.' },
        { id: 's4', role: 'target', need: ['V4'], q: ['V4a'], num: 1, t: function (S) { return 'Unfilled vet seats cost about ' + qf(S, 'V4a') + ' of revenue a year.'; } },
        mkt,
        { id: 's6', role: 'returns', dup: 'returns', t: 'The price is high.' },
        { id: 's7', bad: 1, role: 'returns', t: 'Add-ons at 7x will close the gap.' }];
      return [
        { id: 's1', role: 'earnings', need: ['V3'], num: 1, t: 'The add-backs are small, one-off and documented; run-rate EBITDA is about $30.0M.' },
        { id: 's2', role: 'returns', need: ['V6'], num: 1, dup: 'returns', t: function (S, n) { return 'At $360M even our run-rate case returns about ' + xx(n.rrMoic, 1) + ', above the 2.5x we need.'; } },
        { id: 's3', role: 'target', need: ['V2'], num: 1, t: 'Growth is balanced: visits up 1.5 percent and price up 4.5.' },
        { id: 's4', role: 'target', need: ['V4'], num: 1, t: 'Vet staffing is healthy: few open seats and 9 percent turnover.' },
        mkt,
        { id: 's6', role: 'returns', dup: 'returns', t: 'The price is fair.' },
        { id: 's7', bad: 1, role: 'market', t: 'The market is shrinking.' }];
    },
    risks: { P: [['If we cannot fill vet seats, price increases are the only growth left.', 1], ['Pet adoption may fall after the pandemic surge.'], ['Interest rates may change.']],
      R: [['If clinic valuations fall from 13x to 10x, returns drop to about 2.0x.', 1], ['Pet adoption may fall after the pandemic surge.'], ['Interest rates may change.']] },
    next: { P: [['Commission a quality-of-earnings review and get three years of recruiting costs before any bid.', 1], ['Lock in key vets with equity and a retention plan before signing.'], ['Visit a clinic with a dog.']],
      R: [['Lock in key vets with equity and a retention plan before signing.', 1], ['Commission a quality-of-earnings review and get three years of recruiting costs before any bid.'], ['Visit a clinic with a dog.']] },
    truth: function (v, n) {
      return v === 'P' ? 'A good business at the wrong price. Two of the three add-backs recur (Larkspur recruits and acquires every year), so run-rate EBITDA is about ' + mm(n.rr) + ', not $30M. At 15 times, that gap alone is about ' +
        mm(n.gap15, 0) + ' of price. Even the banker’s own case returns ' + xx(n.bankMoic) + ' at $450M; on run-rate earnings the most Kilnworth can pay for 2.5x is about ' + mm(n.maxEV, 0) + '. All of the growth is price, and the vets are leaving.'
        : 'A good business at a fair price. The add-backs are small, one-off and documented, so run-rate EBITDA is about $30M, growth is balanced, and staffing is healthy. At $360M the run-rate case returns about ' + xx(n.rrMoic) +
        '; the most Kilnworth can pay for 2.5x is about ' + mm(n.maxEV, 0) + '. The real risk is the exit multiple: at 10x instead of 13x, returns fall to about ' + xx(n.moic10, 1) + '.';
    },
    real: function () {
      return { t: 'Veterinary clinics became a favorite of buyers because demand is steady and the market is fragmented. Americans spent $158B on pets in 2024, $41.0B of it on vet care and product sales. The landmark deal: in January 2017 Mars agreed to buy VCA, then nearly 800 animal hospitals, for $93 a share, about 41 percent above its 30-day average price, or about $9.1B including $1.4B of debt. Diligence exists for the gap between reported and adjusted EBITDA: at 15 times, every $1M of add-back that recurs is $15M of overpayment. And when another bidder appears, the discipline is the model, not the mood; the winner of an auction is often the bidder who overestimated the value.',
        src: [S_APPA, S_VCA] };
    },
    one: 'The price you pay is the decision; test every add-back with one question: does this cost come back next year?'
  };

  /* CASE 04 · Slipline · pricing · interviewer-led */
  var DIESEL = 6.382, DIESEL_AGO = 6.382 - 2.628;
  function freightNum(v, k) {
    var n = { v: v, k: k, s: [0.06, 0.07, 0.08][k], gal: 100000 / 6.7, price: DIESEL, ago: DIESEL_AGO, mid: 3324112 * 0.35 };
    n.galShown = n.gal; n.agoShown = n.ago; n.midShown = n.mid;
    n.fuel = n.gal * DIESEL; n.fuelAgo = n.gal * DIESEL_AGO; n.sav = n.s * n.fuel; n.savAgo = n.s * n.fuelAgo;
    n.diff = (n.s - 0.04) * n.fuel * 3; n.evc = 3000 + n.diff; n.vp = 3000 + 0.4 * n.diff; n.cap18 = 1.5 * n.sav;
    n.monthly = Math.round(n.sav * 0.33 / 12 / 5) * 5; n.payNow = n.vp / n.sav; n.payAgoMo = 12 * n.vp / n.savAgo;
    n.trucks = 3324112 * 0.35 * 0.05; n.rev = n.trucks * n.vp / 1e6; n.recur = n.trucks * n.monthly * 12 / 1e6; n.gap = n.vp - 2700; n.rise = (DIESEL / DIESEL_AGO - 1) * 100; n.vol = Math.round(n.vp * 0.8 / 100) * 100;
    return n;
  }
  var FREIGHT = {
    id: 'freight', n: 4, client: 'Slipline Systems', short: 'Slipline', kind: 'Pricing', format: 'int', budget: 35, diff: 2,
    who: { name: 'Rafael Duarte', role: 'senior partner' }, hook: 'A startup built something that saves truckers real money. It has no idea what to charge.',
    vars: ['F', 'O'], order: ['F', 'O'], vname: { F: 'the fleets', O: 'the owner-operators' },
    compute: freightNum,
    prompt: function (n) {
      return 'Slipline is a 40-person startup that has built a retrofit kit for long-haul trucks: predictive cruise software plus a trailer-gap fairing. In fleet trials it cut fuel use by about ' + Math.round(n.s * 100) +
        ' percent on highway miles. It launches next quarter and has no idea what to charge. What should the price be, and how should they charge it?';
    },
    restate: [
      { id: 'acc', t: 'So: what price, and what way of charging, captures the most value while still getting fleets to adopt.' },
      { id: 'drift', t: 'So we need to price it a little above cost.', fix: 'Cost is where you start being wrong.' }
    ],
    clarify: [
      { id: 'f1', type: 'obj', q: 'What is Slipline optimizing for in year one: revenue, profit, or trucks installed?', a: 'Installed trucks and proof, without training the market to expect a cheap product.' },
      { id: 'f2', type: 'metric', q: 'How is the fuel saving measured, and is it reliable?', a: 'Engine data from the truck, trip by trip. Fleets trust it more than they trust us.' },
      { id: 'f3', type: 'fact', q: 'Who are the first customers?', a: { F: 'Large fleets; their procurement teams want a fixed price and a payback.', O: 'Mostly small fleets and owner-operators; they ask about monthly plans.' } },
      { id: 'f4', type: 'scope', q: 'Just the US, and just long-haul?', a: 'US long-haul first.' },
      { id: 'f5', type: 'fish', q: 'What do competitors charge?', a: 'Nothing does exactly this. What is the customer’s next best option?' },
      { id: 'f6', type: 'noise', q: 'What color is the fairing?', a: 'White. It is a truck.' },
      { id: 'f7', type: 'fact', q: 'What does the kit cost to make?', a: 'About $1,800 installed, plus $150 a year of support.' }
    ],
    req: ['value', 'alt', 'cust', 'model'], bucket: { value: 'value to the customer', alt: 'the next best alternative', cust: 'how customers buy', model: 'how to charge' },
    cards: [
      { id: 'g1', nm: 'value to the customer', t: 'Value to the customer: fuel saved per truck', subs: ['miles and fuel economy', 'diesel price', 'measured savings'], cov: 'value', tail: 1, ok: 'value' },
      { id: 'g2', t: 'The next best alternative and what it costs', subs: ['skirts and tires', 'their savings', 'their life'], cov: 'alt', tail: 1 },
      { id: 'g3', t: 'How customers buy: segments, payback rules, cash', subs: ['large fleets', 'owner-operators', 'budget cycles'], cov: 'cust', tail: 1 },
      { id: 'g4', t: 'How to charge: up front, monthly, or share of savings', subs: ['up front', 'subscription', 'shared savings'], cov: 'model', tail: 1 },
      { id: 'g5', t: 'Our costs and margins', neu: 'A floor, not a structure. Keep it small.' },
      { id: 'g6', t: 'The 4Ps', trap: 'The 4Ps list pricing as one of four boxes; here it is the whole question.' },
      { id: 'g7', t: 'Porter’s five forces', trap: 'An industry’s profitability will not set this product’s price.', pts: -0.5 },
      { id: 'g8', t: 'Market size', neu: 1 },
      { id: 'g9', t: 'Fuel savings', cov: 'value', ok: 'value' },
      { id: 'g10', t: 'Brand', irr: 'Nobody buys a fairing for the logo.' }
    ],
    hyps: [
      { id: 'q1', t: 'Price on value, up front, for fleets.' }, { id: 'q2', t: 'Price monthly, out of savings, for small operators.' },
      { id: 'q3', t: 'Price near cost to win share.' }, { id: 'q4', t: 'Take a share of measured savings.' }
    ],
    truthHyp: { F: ['q1'], O: ['q2'] }, noAnchor: ['q4'],
    dis: [['W3', 'FO', 'q3'], ['W4', 'O', 'q1'], ['W4', 'F', 'q2']],
    root: { F: 'W4', O: 'W4' }, eff: { F: ['W1', 'W2', 'W3', 'W4', 'W5'], O: ['W1', 'W2', 'W3', 'W4', 'W5'] }, canErr: ['W1', 'W5', 'W6'],
    seq: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'], curveAfter: 'W5', optional: 'W6', optAsk: 'Want to size it, or go to your recommendation?', optYes: 'Size it first',
    ex: [
      { id: 'W1', nm: 'what a truck burns', hand: 'Start with what one truck burns in a year.', title: 'What a truck burns', notes: function () { return ['contribution']; },
        body: function (d) {
          return kv([['Highway miles per truck per year (target fleets)', '100,000'], ['Fuel economy, combination trucks (FHWA, 2023)', '6.7 miles per gallon'],
            ['US on-highway diesel, week of September 28, 2026 (EIA)', '$6.382 a gallon'], ['Gallons per truck per year', nn(d.galShown)]]) +
            srcLine('FHWA Highway Statistics 2023, Table VM-1; EIA, as of September 30, 2026; case data.', [S_FHWA, S_EIA]);
        },
        qs: [{ id: 'W1a', type: 'num', p: 'Annual fuel bill per truck at today’s diesel?', unit: '$', tol: ['rel', 0.03, 0.08],
          ans: function (d) { return d.galShown * DIESEL; }, fmt: function (v) { return usd(v); }, hint: '100,000 over 6.7 is about 15,000 gallons; times about 6.4 is about 96,000.',
          how: function () { return '14,925 gallons × $6.382'; } },
          { id: 'W1b', type: 'num', p: function (n) { return 'Annual savings at ' + Math.round(n.s * 100) + ' percent?'; }, unit: '$', tol: ['rel', 0.03, 0.08],
            ans: function (d) { return d.s * d.galShown * DIESEL; }, fmt: function (v) { return usd(v); }, hint: function (n) { return Math.round(n.s * 100) + ' percent of about $95,000.'; },
            how: function (n) { return Math.round(n.s * 100) + '% of ' + usd(n.fuel); } }],
        so: function (v, n) {
          return [['Slipline saves a truck about ' + usd(Math.round(n.sav / 100) * 100) + ' a year at today’s diesel: the value dwarfs an $1,800 kit.', 'right'],
            ['A truck running 100,000 miles at 6.7 miles a gallon burns about 14,900 gallons, about ' + usd(Math.round(n.fuel / 100) * 100) + ' of diesel a year.', 'restate'],
            ['Each truck saves about ' + usd(Math.round(n.sav / 100) * 100) + ' a year, so buyers will pay almost anything: price the kit at $20,000.', 'over']];
        },
        err: { apply: function (d) { d.galShown = 1492; return d; }, what: 'gallons were printed as 1,492 a year',
          fix: function () { return 'It is 14,925 gallons. A truck that burned 1,492 gallons a year would be parked.'; } } },
      { id: 'W2', nm: 'the next best alternative', hand: 'Here is what the customer can buy instead.', title: 'The next best alternative', notes: function () { return ['evc']; },
        body: function (d) {
          return table(['', 'Installed price', 'Fuel saved', 'Life'], [['Side skirts and low-rolling-resistance tires', '$3,000', '4%', 'three years'], ['Slipline', '?', Math.round(d.s * 100) + '%', 'three years']]) +
            '<p class="cs-note">' + tm('evc', 'Economic value to the customer') + ' = ' + tm('refval', 'reference value') + ' (what the alternative costs) + ' + tm('difval', 'differentiation value') + ' (the extra savings over its life).</p>' + srcLine('case data.');
        },
        qs: [{ id: 'W2a', type: 'num', p: 'Economic value to the customer over three years?', unit: '$', tol: ['rel', 0.05, 0.12],
          ans: function (d) { return 3000 + (d.s - 0.04) * d.fuel * 3; }, fmt: function (v) { return usd(v); },
          hint: function (n) { return 'Start at what they would pay anyway, $3,000, then add three years of the extra ' + Math.round((n.s - 0.04) * 100) + ' points of fuel.'; },
          how: function (n) { return '$3,000 + ' + Math.round((n.s - 0.04) * 100) + '% × ' + usd(n.fuel) + ' × 3'; } }],
        so: function (v, n) {
          return [['A rational fleet would pay up to about ' + usd(Math.round(n.evc / 100) * 100) + ' over three years; our $1,800 cost has nothing to do with that ceiling.', 'right'],
            ['Skirts and tires cost $3,000 and save 4 percent; Slipline saves ' + Math.round(n.s * 100) + ' percent, and both last about three years.', 'restate'],
            ['The customer gains about ' + usd(Math.round(n.evc / 100) * 100) + ' over three years, so that is our price: charge the full value and keep every dollar of it.', 'over']];
        } },
      { id: 'W3', nm: 'three ways to set a price', hand: 'Here are three ways the founders have heard to set a price.', title: 'Three ways to set a price', notes: function () { return ['costPlus']; },
        body: function (d, S) {
          var done = S.ans.W3a && S.ans.W3a.done;
          return table(['Method', 'Price per truck'], [[tm('costplus', 'Cost-plus') + ' 50%', '$2,700'], ['Parity with the alternative', '$3,000'], ['Value-based: 40% of the differentiation value on top of $3,000', done ? usd(d.vp) : '?']]) + srcLine('case data.');
        },
        qs: [{ id: 'W3a', type: 'num', p: 'Price at 40 percent capture?', unit: '$', tol: ['rel', 0.03, 0.08],
          ans: function (d) { return 3000 + 0.4 * d.diff; }, fmt: function (v) { return usd(v); }, hint: function (n) { return '$3,000 plus 40 percent of the ' + usd(n.diff) + ' extra.'; },
          how: function (n) { return '$3,000 + 40% × ' + usd(n.diff); } }],
        so: function (v, n) {
          return [['Cost-plus leaves about ' + usd(Math.round(n.gap / 100) * 100) + ' a truck on the table; a value price still leaves the customer 60 percent of the extra savings.', 'right'],
            ['Cost-plus gives $2,700 a truck, parity with the alternative gives $3,000, and 40 percent value capture gives ' + usd(Math.round(n.vp / 100) * 100) + ' a truck.', 'restate'],
            ['The value price beats cost-plus by ' + usd(Math.round(n.gap / 100) * 100) + ', so higher is always better: start at $11,000 and see who bites.', 'over']];
        } },
      { id: 'W4', nm: 'how customers buy', hand: 'Here is who the buyers are and how they buy.', title: 'How customers buy',
        body: function (d, S) {
          if (S.v === 'F') return kv([['Target trucks in fleets of 500 or more', '70%'], ['How they buy', 'capital budget, an 18-month payback rule, a fixed price preferred'], ['Small fleets and owner-operators', '30%']]) + srcLine('case data.');
          return kv([['Target trucks in small fleets and with owner-operators', '60%'], ['How they buy', 'cash-constrained; 78% would rather pay monthly out of savings (survey)'], ['Large fleets', '40%, on an 18-month payback rule']]) + srcLine('case data.');
        },
        qs: [{ id: 'W4a', type: 'num', p: 'Highest up-front price that still meets an 18-month payback at today’s diesel?', unit: '$', tol: ['rel', 0.03, 0.08],
          ans: function (d) { return 1.5 * d.sav; }, fmt: function (v) { return usd(v); }, hint: 'Eighteen months of savings: one and a half years.', how: function (n) { return '1.5 × ' + usd(n.sav); } }],
        so: function (v, n) {
          if (v === 'F') return [['Fleets decide on payback: a price near ' + usd(Math.round(n.vp / 100) * 100) + ' pays back in under a year at today’s diesel, well inside their 18-month rule.', 'right'],
            ['Seventy percent of target trucks sit in fleets of 500 or more, which buy from capital budgets on an 18-month payback rule.', 'restate'],
            ['Big fleets hold 70 percent of target trucks and buy on payback, so small operators do not matter: sell only to big fleets.', 'over']];
          return [['Most target trucks belong to buyers who will not write a ' + usd(Math.round(n.vp / 100) * 100) + ' check but will pay from savings: the price needs a monthly form.', 'right'],
            ['Sixty percent of target trucks are in small fleets or with owner-operators, and 78 percent of those buyers would rather pay monthly.', 'restate'],
            ['Small operators hold 60 percent of target trucks and are short of cash, so large fleets are a distraction: stop selling to them.', 'over']];
        } },
      { id: 'W5', nm: 'the diesel problem', hand: 'Now look at what diesel did.', title: 'The diesel problem', notes: function () { return ['volatility']; },
        body: function (d) {
          return bars([{ k: 'A year ago', v: d.agoShown, lab: usd(d.agoShown, 2) }, { k: 'Week of September 28, 2026', v: DIESEL, lab: usd(DIESEL, 2), cls: 'is-you' }], { cap: 'US on-highway diesel, dollars a gallon' }) +
            kv([['Annual savings per truck a year ago', usd(d.savAgo)], ['Annual savings per truck now', usd(d.sav)]]) + srcLine('EIA weekly on-highway diesel, as of September 30, 2026.', [S_EIA]);
        },
        qs: [{ id: 'W5a', type: 'num', p: 'By how much did a truck’s annual savings rise in a year, in percent?', unit: '%', tol: ['abs', 2, 5],
          ans: function (d) { return (DIESEL / d.agoShown - 1) * 100; }, fmt: function (v) { return pc(v); }, hint: 'Savings move with diesel: 6.38 over 3.75, less one.',
          how: function () { return '$6.382 over $3.754 is 1.70'; } }],
        so: function (v, n) {
          return [['Our value rose 70 percent in a year without us doing anything: a fixed price is a bet on diesel, so guarantee payback or index part of it to fuel.', 'right'],
            ['Diesel went from $3.75 to $6.38 a gallon in a year, so a truck’s annual savings rose from ' + usd(Math.round(n.savAgo / 100) * 100) + ' to ' + usd(Math.round(n.sav / 100) * 100) + '.', 'restate'],
            ['A truck’s savings rose 70 percent in a year because diesel did, so the product is worth 70 percent more: raise the price 70 percent today.', 'over']];
        },
        err: { apply: function (d) { d.agoShown = d.ago * 10; return d; }, what: 'last year’s diesel was labeled $37.54', fix: function () { return 'A year ago diesel was about $3.75. The decimal wandered.'; } } },
      { id: 'W6', nm: 'the market size', hand: 'Here is the funnel the founders drew.', title: 'How big is this', notes: function () { return ['sizing']; },
        body: function (d, S) {
          var done = S.ans.W6a && S.ans.W6a.done;
          return bars([{ k: 'Combination trucks (FHWA 2023)', v: 3.324, lab: '3.32M' }, { k: 'In fleets of 50+, mostly highway (35%)', v: d.midShown / 1e6, lab: nn(d.midShown / 1e6, 2) + 'M' },
            { k: 'On Slipline by year five (5%)', v: done ? d.trucks / 1e6 : 0, lab: done ? nn(Math.round(d.trucks / 100) * 100) : '?', cls: 'is-you' }], { max: Math.max(3.4, d.midShown / 1e6), cap: 'Truck funnel' }) +
            '<p class="cs-note">Side note: the whole fleet burns about 29.3 billion gallons a year (FHWA 2023); at $6.38 that is about $187B of diesel.</p>' + srcLine('FHWA Highway Statistics 2023; case assumptions for the 35% and the 5%.', [S_FHWA]);
        },
        qs: [{ id: 'W6a', type: 'num', p: 'Trucks on Slipline by year five?', unit: 'trucks', tol: ['rel', 0.05, 0.12],
          ans: function (d) { return d.midShown * 0.05; }, fmt: function (v) { return nn(Math.round(v / 100) * 100) + ' trucks'; }, hint: '3.32 million, times 35 percent, times 5 percent.',
          how: function () { return '3.32M × 35% × 5%'; } }],
        so: function (v, n) {
          var R = v === 'O' ? 'About 58,000 trucks at about ' + usd(n.monthly) + ' a month is about ' + mm(n.recur, 0) + ' a year of subscription revenue once they are all on it: real, if the price holds.'
            : 'About 58,000 trucks at roughly ' + usd(Math.round(n.vp / 100) * 100) + ' is about ' + mm(n.rev, 0) + ' of kit sales over five years, roughly ' + mm(n.rev / 5, 0) + ' a year: real, if the price holds.';
          return [[R, 'right'], ['There are 3.32 million combination trucks, 1.16 million of them in large highway fleets, and 5 percent of those is about 58,000.', 'restate'],
            ['The whole fleet burns about $187B of diesel a year, so a ' + Math.round(n.s * 100) + ' percent saving is a ' + bb(187 * n.s) + ' market: plan for every truck in America.', 'over']];
        },
        err: { apply: function (d) { d.midShown = d.mid * 10; return d; }, what: 'the middle bar was ten times too big', fix: function () { return '35 percent of 3.32 million is 1.16 million. The market did not get ten times bigger.'; } } }
    ],
    curves: [
      { id: 'CB0', t: 'A top-ten fleet offers to buy 5,000 kits at $3,500 each tomorrow, if Slipline gives it two years of exclusivity in the Southeast.',
        opts: [
          { t: 'Take it; 5,000 trucks and a top-ten fleet on the customer list validate the product overnight.', J: -1, note: 'curvePivot', r: 'It also tells every future buyer your price is $3,500.' },
          { t: function (S) { return 'Offer a volume discount off the value price, about 20 percent off at ' + usd(S.n.vol) + ', with a published case study and no exclusivity.'; }, J: 2, C: 1, note: 'curveGood', r: 'Good. A discount that buys proof, not one that sets the price.' },
          { t: 'Decline; we never discount, because the first discount becomes everyone’s price.', J: 0, C: -0.5, note: 'curveDismiss', r: 'Principled. Also five thousand trucks of proof walking out the door.' }
        ] },
      { id: 'CB1', t: 'Diesel just fell 12 percent in two weeks. The CEO wants to cut the price 12 percent.',
        opts: [
          { t: 'Agree; our value moves with diesel, so a 12 percent fall in diesel should mean a 12 percent cut.', J: -1, note: 'curvePivot', r: 'Two weeks is weather, not climate.' },
          { t: 'Show payback across a range of diesel prices; that is why part of the price should move with fuel.', J: 2, C: 1, note: 'curveGood', r: 'Yes. Make the volatility somebody’s explicit job.' },
          { t: 'Ignore it; diesel moves every week, and changing the price every time looks unserious.', J: 0, note: 'curveDismiss', r: 'The customer will not ignore it.' }
        ] }
    ],
    recAsk: 'The founders are in the room. What do you tell them?',
    gov: [
      { id: 'G1', ok: 'F', t: function (n) { return 'Price on value: about ' + usd(Math.round(n.vp / 100) * 100) + ' a truck up front for fleets, with a payback guarantee; it pays back in about a year at today’s diesel and inside two years even at last year’s.'; } },
      { id: 'G2', ok: 'O', t: function (n) { return 'Sell it as a subscription: about ' + usd(n.monthly) + ' a truck a month, a third of today’s savings, so small operators pay from savings instead of capital.'; } },
      { id: 'G3', part: 1, t: 'Take 50 percent of measured fuel savings, billed monthly, plus a $1,500 install fee.' },
      { id: 'G4', t: 'Charge cost plus 50 percent, about $2,700, to win share fast.' },
      { id: 'G5', last: 1, t: 'Let me start with how the product works.' },
      { id: 'G6', hedge: 1, t: 'It is probably a mix of factors; we need more data before recommending anything.' }
    ],
    lead: ['value'],
    sup: function (v) {
      var val = { id: 's1', role: 'value', need: ['W2'], q: ['W2a'], num: 1, t: function (S) { return 'Each truck gets about ' + qf(S, 'W2a') + ' of value over three years against a $3,000 alternative.'; } };
      var mkt = { id: 's5', role: 'market', need: ['W6'], num: 1, t: function (S, n) {
        return v === 'O' ? 'About 58,000 trucks by year five: about ' + mm(n.recur, 0) + ' a year of subscription revenue once 58,000 trucks are on it.'
          : 'About 58,000 trucks by year five: about ' + mm(n.rev, 0) + ' of cumulative kit sales at this price.';
      } };
      var dup = { id: 's6', role: 'price', dup: 'price', t: 'Our price is far above our cost.' };
      if (v === 'F') return [val,
        { id: 's2', role: 'price', need: ['W3'], q: ['W3a'], num: 1, dup: 'price', t: function (S) { return 'Capturing 40 percent of the extra savings gives about ' + qf(S, 'W3a') + '; cost-plus would leave about ' + usd(qv(S, 'W3a').v - 2700) + ' a truck on the table.'; } },
        { id: 's3', role: 'customer', need: ['W4'], t: 'Fleets buy on an 18-month payback; this pays back in about a year.' },
        { id: 's4', role: 'risk', need: ['W5'], num: 1, t: 'Diesel moved 70 percent in a year; a payback guarantee protects the buyer if it falls.' },
        mkt, dup, { id: 's7', bad: 1, role: 'customer', t: 'Small fleets want to pay monthly.' }];
      return [val,
        { id: 's2', role: 'customer', need: ['W4'], num: 1, t: 'Sixty percent of target trucks belong to small fleets, and most would rather pay monthly out of savings.' },
        { id: 's3', role: 'price', need: ['W3'], num: 1, dup: 'price', t: function (S, n) { return 'About ' + usd(n.monthly) + ' a month is a third of today’s savings and adds up to roughly our value price over three years.'; } },
        { id: 's4', role: 'risk', need: ['W5'], num: 1, t: 'Diesel moved 70 percent in a year; a monthly price can be reset each year with fuel.' },
        mkt, dup, { id: 's7', bad: 1, role: 'customer', t: 'Fleets prefer to buy up front.' }];
    },
    risks: { F: [['If diesel falls back to last year’s price, payback stretches to about 20 months and the guarantee costs us.', 1], ['Monthly plans bring churn and collections risk; owner-operators cancel in bad months.'], ['A rival may copy the fairing.']],
      O: [['Monthly plans bring churn and collections risk; owner-operators cancel in bad months.', 1], ['If diesel falls back to last year’s price, payback stretches to about 20 months and the guarantee costs us.'], ['A rival may copy the fairing.']] },
    next: { F: [['Pilot the guarantee with three fleets and publish their measured savings.', 1], ['Run a 90-day monthly pilot with 200 owner-operators and measure churn.'], ['Design a new logo for the fairing.']],
      O: [['Run a 90-day monthly pilot with 200 owner-operators and measure churn.', 1], ['Pilot the guarantee with three fleets and publish their measured savings.'], ['Design a new logo for the fairing.']] },
    truth: function (v, n) {
      return v === 'F' ? 'Fleets. Most target trucks sit in large fleets that buy on an 18-month payback and want a fixed price. A value price of about ' + usd(n.vp) + ', 40 percent of the extra savings over the $3,000 alternative, pays back in about ' +
        yr(n.payNow) + ' at today’s diesel and about ' + nn(n.payAgoMo, 1) + ' months at last year’s. Cost-plus at $2,700 would have left about ' + usd(n.gap) + ' a truck on the table.'
        : 'Owner-operators. Sixty percent of target trucks belong to buyers who will not write a ' + usd(Math.round(n.vp / 100) * 100) + ' check but will pay from savings: about ' + usd(n.monthly) +
        ' a month, a third of today’s savings, adds up to roughly the value price over three years. Cost-plus at $2,700 would have left about ' + usd(n.gap) + ' a truck on the table.';
    },
    real: function () {
      return { t: 'Value-based pricing asks what the customer gains, not what the product costs. Economic value to the customer, a method John Forbis and Nitin Mehta developed in 1979, starts from the price of the next best alternative, adds the extra value the product delivers, and leaves the seller to decide how much of that extra to capture. The inputs here are real: combination trucks in the US averaged about 6.7 miles per gallon in 2023, across 3.32 million trucks burning about 29.3 billion gallons, and US diesel was $6.382 a gallon in late September 2026, $2.628 above a year earlier. When the customer’s value can swing 70 percent in a year, the pricing model matters as much as the price.',
        src: [S_EVC, S_FHWA, S_EIA] };
    },
    one: 'Price from the customer’s gain over the next best alternative, then decide who carries the volatility.'
  };

  var CASES = [CINEMA, GROCER, VET, FREIGHT];
  function caseById(id) { return find(CASES, id); }

  /* ---------- the engine: an attempt is a plain object; actions mutate it and log what was said ---------- */
  var HOOK = { line: null, unlock: null };
  var MAX = { S: 14, A: 8, J: 12, C: 10 };
  var DIMS = [['S', 'Structure'], ['A', 'Analytics'], ['J', 'Judgment'], ['C', 'Communication']];
  var LATE = { cinema: 'The CEO just walked in. What is your recommendation?', grocer: 'The family just joined the call. What is your recommendation?',
    vet: 'The investment committee just sat down. What is your recommendation?', freight: 'The founders just walked in. What is your recommendation?' };
  function hsh(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function qsOf(ex, v) { return ex.qs ? val(ex.qs, v) || [] : []; }
  function qtype(q, v) { return typeof q.type === 'object' ? q.type[v] : q.type; }
  function supsOf(S) { return S.c.sup(S.v); }
  function exTitle(ex, v) { return val(ex.title, v); }

  function newAttempt(c, o) {
    o = o || {};
    var seed = (o.seed == null ? K.seed() : o.seed) >>> 0, r = K.rng(seed);
    var k = Math.floor(r() * 3), errOn = r() < 0.7, errIdx = Math.floor(r() * c.canErr.length), curve = r() < 0.5 ? 0 : 1;
    if (o.k != null) k = o.k;
    if (o.errOn != null) errOn = !!o.errOn;
    if (o.errIdx != null) errIdx = o.errIdx;
    if (o.curve != null) curve = o.curve;
    var v = o.v || c.order[0];
    var S = { c: c, cid: c.id, seed: seed, v: v, k: k, errOn: errOn, errIdx: errIdx, errEx: c.canErr[errIdx], curveIdx: curve, n: c.compute(v, k),
      phase: 'brief', sstep: 'ask', clock: 0, budget: c.budget, restate: null, asked: [], took: null, tree: [], lays: 0, treeEval: null,
      hyp: null, hypAt: 0, hypOpen: false, seen: [], cur: null, off: 0, ans: {}, so: {}, flags: {}, curve: null, curveOpen: false, curveFired: false,
      synth: { gov: null, sup: [], risk: null, next: null }, delivered: false, forced: false, over: false, warned: false, log: [], talk: [],
      seqPos: -1, optAsked: false, x7in: false, foot: false, hints: 0, falseFlags: 0, caught: false, result: null, hintShown: {}, cor: {} };
    S.qmap = {};
    c.ex.forEach(function (ex) { qsOf(ex, v).forEach(function (q) { S.qmap[q.id] = { q: q, ex: ex }; }); });
    var r2 = K.rng((seed ^ 0x9E3779B9) >>> 0);
    S.ord = { restate: r2.shuffle([0, 1]), hyps: r2.shuffle(c.hyps.map(function (h) { return h.id; })), gov: r2.shuffle(c.gov.map(function (g) { return g.id; })),
      sup: r2.shuffle(supsOf(S).map(function (s) { return s.id; })), risk: r2.shuffle([0, 1, 2]), next: r2.shuffle([0, 1, 2]) };
    /* drawn after the orders above, so older seeds keep theirs: questions, cards and curveball options never sit best-first */
    S.ord.clarify = r2.shuffle(c.clarify.map(function (q) { return q.id; }));
    S.ord.cards = r2.shuffle(c.cards.map(function (x) { return x.id; }));
    S.ord.curve = r2.shuffle([0, 1, 2]);
    return S;
  }
  function pickVariant(c, plays, seed) {
    if (plays < c.order.length) return c.order[plays];
    return c.vars[Math.floor(K.rng((seed ^ 0x5BD1E995) >>> 0)() * c.vars.length)];
  }

  function line(S, w, t, x) {
    var l = { w: w, t: t, x: x || null };
    S.talk.push(l);
    if (HOOK.line) HOOK.line(S, l);
  }
  function unlock(S, id) { if (HOOK.unlock) HOOK.unlock(S, id); }
  function errActive(S, id) { return S.errOn && S.errEx === id && S.flags[id] !== 'hit'; }
  function dOf(S, ex) { return errActive(S, ex.id) && ex.err ? ex.err.apply(clone(S.n)) : S.n; }
  function trueAns(S, id) { var m = S.qmap[id]; return m.q.type === 'pick' ? m.q.ans(S.n, S.v) : m.q.ans(S.n, S.v, S.n, S); }
  function qv(S, id) {
    var a = S.ans[id];
    if (a && a.done && a.val != null) return { v: a.val, wrong: a.grade === 'wrong' };
    return { v: trueAns(S, id), wrong: false };
  }
  function qf(S, id, abs) { var x = qv(S, id).v, q = S.qmap[id].q; return q.fmt(abs ? Math.abs(x) : x); }
  function exNum(S, id) { return S.seen.indexOf(id) + 1; }
  function qAvail(S, q) { return !q.needs || !!(S.ans[q.needs] && S.ans[q.needs].done); }
  /* an exhibit is done when every question that can be answered is answered and its so-what is chosen */
  function qsDone(S, ex) {
    return qsOf(ex, S.v).every(function (q) { return q.opt || !qAvail(S, q) || !!(S.ans[q.id] && S.ans[q.id].done); });
  }
  function exDone(S, id) { var ex = find(S.c.ex, id); return qsDone(S, ex) && !!S.so[id]; }

  /* ---------- the interview clock, in interview minutes ---------- */
  function tick(S, m) {
    if (!m) return;
    S.clock = r1(S.clock + m);
    if (S.delivered) return;
    if (!S.warned && S.clock >= S.budget - 5 && S.clock < S.budget) { S.warned = true; line(S, 'int', 'We have about five minutes.'); }
    if (!S.forced && S.clock >= S.budget) { S.forced = true; S.warned = true; line(S, 'int', LATE[S.cid]); }
    if (!S.over && S.clock >= S.budget + 8 && S.phase !== 'score') { S.over = true; line(S, 'int', 'We are out of time. Thank you.'); }
  }
  var COST = { cand: { open: 3, out: 5, first: 2, follow: 1.5, retry: 1.5 }, int: { open: 2, out: 2, first: 1.5, follow: 1, retry: 1 } };

  /* ---------- answers ---------- */
  function parseAns(str, unit, expect) {
    var s = String(str == null ? '' : str).trim().replace(/[−–‒]/g, '-').replace(/^\((.*)\)$/, '-$1').replace(/[\s,$]/g, '').replace(/[x×]$/i, '').replace(/%$/, '');
    var mult = 1, m = s.match(/(bn|mm|k|m|b)$/i);
    if (m) { mult = { k: 1e3, m: 1e6, mm: 1e6, b: 1e9, bn: 1e9 }[m[1].toLowerCase()]; s = s.slice(0, -m[1].length); }
    if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
    var v = parseFloat(s);
    if (unit === '$M') v = m ? v * mult / 1e6 : (Math.abs(v) > 1e5 ? v / 1e6 : v);
    else if (unit === '$B') v = m ? v * mult / 1e9 : (Math.abs(v) > 1e6 ? v / 1e9 : v);
    else v = v * mult;
    if ((unit === '%' || unit === 'pts') && Math.abs(v) <= 1.5 && Math.abs(expect) > 1.5) v *= 100;
    return v;
  }
  function gradeNum(v, a, q) {
    if (q.signFree) { v = Math.abs(v); a = Math.abs(a); }
    var d = Math.abs(v - a), lim = q.tol[0] === 'rel' ? Math.abs(a) : 1;
    return d <= q.tol[1] * lim + 1e-9 ? 'full' : d <= q.tol[2] * lim + 1e-9 ? 'partial' : 'wrong';
  }
  function firstOnEx(S, ex, qid) {
    return !qsOf(ex, S.v).some(function (q) { return q.id !== qid && S.ans[q.id] && S.ans[q.id].tries > 0; });
  }
  function logMath(S, ok, id) { S.log.push({ t: S.clock, k: 'math', ok: ok, id: id }); }
  function answer(S, qid, raw) {
    var m = S.qmap[qid];
    if (!m || S.phase !== 'analyze' || S.over) return false;
    var q = m.q, ex = m.ex, a = S.ans[qid] || (S.ans[qid] = { tries: 0, done: false });
    if (a.done || !qAvail(S, q)) return false;
    var truth = trueAns(S, qid), errA = q.ans(dOf(S, ex), S.v, S.n, S), v = parseAns(raw, q.unit, truth);
    if (isNaN(v)) { line(S, 'int', 'Give me a number, even a rough one.'); return false; }
    var C = COST[S.c.format], cost = a.free ? 0 : a.tries > 0 ? C.retry : firstOnEx(S, ex, qid) ? C.first : C.follow;
    a.free = false;
    line(S, 'you', q.fmt(v) + '.');
    var g = gradeNum(v, truth, q);
    if (q.accept && q.accept(v, S.n)) g = 'full';
    if (g !== 'full' && errActive(S, ex.id) && !a.em && gradeNum(errA, truth, q) !== 'full' && gradeNum(v, errA, q) === 'full') {
      a.em = true; a.free = true; a.val = v; tick(S, cost);
      line(S, 'int', 'Your math is right for the table as printed. Look at the table again.');
      return true;
    }
    a.tries++; a.val = v; tick(S, cost);
    if (g === 'full') { a.done = true; a.grade = 'full'; line(S, 'int', 'Right, ' + q.fmt(truth) + '.'); }
    else if (g === 'partial') { a.done = true; a.grade = 'partial'; line(S, 'int', 'Close enough to steer by. It is ' + q.fmt(truth) + '.'); }
    else if (a.tries < 2) { line(S, 'int', 'Walk me through that. Something is off.'); logMath(S, false, qid); unlock(S, 'mentalMath'); return true; }
    else { a.done = true; a.grade = 'wrong'; line(S, 'int', 'It is ' + q.fmt(truth) + '. ' + q.how(S.n, S) + '. Let us keep moving.'); }
    logMath(S, a.grade !== 'wrong', qid);
    if (q.after) line(S, 'int', q.after(S.n));
    unlock(S, 'mentalMath');
    return true;
  }
  function pick(S, qid, opt) {
    var m = S.qmap[qid];
    if (!m || S.phase !== 'analyze' || S.over) return false;
    var q = m.q, a = S.ans[qid] || (S.ans[qid] = { tries: 0, done: false });
    if (a.done) return false;
    var C = COST[S.c.format], right = q.ans(S.n, S.v), lab = function (id) { var o = q.opts.filter(function (x) { return x[0] === id; })[0]; return o ? o[1] : id; };
    tick(S, firstOnEx(S, m.ex, qid) ? C.first : C.follow);
    a.tries = 1; a.done = true; a.pick = opt; a.grade = opt === right ? 'full' : 'wrong';
    line(S, 'you', lab(opt) + '.');
    line(S, 'int', a.grade === 'full' ? 'Right. ' + lab(right) + '.' : 'It is ' + lab(right).toLowerCase() + '. ' + q.how(S.n) + '.');
    logMath(S, a.grade === 'full', qid);
    return true;
  }
  function multi(S, qid, sel) {
    var m = S.qmap[qid];
    if (!m || S.phase !== 'analyze' || S.over || !sel.length) return false;
    var q = m.q, a = S.ans[qid] || (S.ans[qid] = { tries: 0, done: false });
    if (a.done) return false;
    tick(S, firstOnEx(S, m.ex, qid) ? COST[S.c.format].first : COST[S.c.format].follow);
    var res = q.judge(sel);
    a.tries = 1; a.done = true; a.sel = sel.slice(); a.grade = res.g; a.J = res.J;
    line(S, 'you', has(sel, 'none') ? 'None of them; they look reasonable.' : 'I would challenge: ' + q.opts.filter(function (o) { return has(sel, o[0]); }).map(function (o) { return o[1].toLowerCase(); }).join(', ') + '.');
    line(S, 'int', (res.g === 'full' ? 'Agreed. ' : res.g === 'partial' ? 'Partly. ' : 'I would not. ') + q.say[S.v]);
    S.log.push({ t: S.clock, k: 'math', ok: res.g !== 'wrong', id: qid });
    return true;
  }
  function hint(S, qid) {
    var a = S.ans[qid] || (S.ans[qid] = { tries: 0, done: false });
    if (a.done || a.hint || S.over) return false;
    a.hint = true; S.hints++; tick(S, 0.5);
    return true;
  }
  var SO_R = { right: ['That is the headline. Write it at the top of the page.', 'Yes. That sentence survives a CEO.', 'Good. Now we know where to dig.'],
    restate: ['That is what the chart says. What does it mean?', 'True, and not yet useful. So what?'],
    over: ['Careful. The data supports the first half of that sentence.', 'That is a recommendation. The exhibit only supports a finding.'] };
  function soOpts(S, ex) {
    var o = ex.so(S.v, S.n), ord = K.rng((S.seed ^ hsh(ex.id)) >>> 0).shuffle([0, 1, 2]);
    return ord.map(function (i) { return { i: i, t: o[i][0], k: o[i][1] }; });
  }
  function soWhat(S, exId, i) {
    var ex = find(S.c.ex, exId);
    if (!ex || S.so[exId] || S.over || !qsDone(S, ex)) return false;
    var o = ex.so(S.v, S.n)[i];
    tick(S, 0.5);
    S.so[exId] = o[1]; S.soT = S.soT || {}; S.soT[exId] = o[0];
    var cnt = Object.keys(S.so).length, rs = SO_R[o[1]];
    line(S, 'you', o[0]);
    line(S, 'int', rs[cnt % rs.length]);
    S.log.push({ t: S.clock, k: 'so', ok: o[1] === 'right', bad: o[1] === 'over', id: exId });
    unlock(S, 'soWhat');
    return true;
  }
  function flag(S, exId) {
    var ex = find(S.c.ex, exId);
    if (!ex || S.flags[exId] || S.over) return false;
    tick(S, 0.5);
    line(S, 'you', 'Something in this exhibit looks off to me.');
    if (errActive(S, exId)) {
      /* a flag after the interviewer pointed at the table is a find, not a catch */
      var prompted = Object.keys(S.ans).some(function (id) { return S.qmap[id] && S.qmap[id].ex.id === exId && S.ans[id].em; });
      S.flags[exId] = 'hit'; S.caught = true; S.prompted = prompted;
      line(S, 'int', prompted ? 'Yes, once I pointed at it. ' + ex.err.fix(S.n) : 'Good catch. ' + ex.err.fix(S.n) + ' That would have followed us into the client’s office.');
    } else { S.flags[exId] = 'false'; S.falseFlags++; line(S, 'int', 'Looks fine to me. What made you nervous?'); }
    S.log.push({ t: S.clock, k: 'flag', ok: S.flags[exId] === 'hit', bad: S.flags[exId] === 'false', id: exId });
    unlock(S, 'sanity');
    return true;
  }

  /* ---------- the phases ---------- */
  function restate(S, id) {
    if (S.phase !== 'brief') return;
    S.restate = id;
    var c = S.c, o = find(c.restate, id);
    if (o) { tick(S, 0.5); line(S, 'you', val(o.t, S.n)); line(S, 'int', o.fix || 'Good. That is the question.'); }
    else line(S, 'you', 'Let me jump straight in.');
    S.phase = 'clarify';
    line(S, 'int', 'What would you like to know before you start?');
  }
  function ask(S, id) {
    if (S.phase !== 'clarify' || S.asked.length >= 3 || has(S.asked, id)) return;
    var q = find(S.c.clarify, id);
    S.asked.push(id); tick(S, 1.5);
    line(S, 'you', q.q);
    line(S, 'int', typeof q.a === 'object' ? q.a[S.v] : q.a);
    unlock(S, 'clarify');
  }
  function toStructure(S) {
    if (S.phase !== 'clarify') return;
    S.phase = 'structure'; S.sstep = 'ask';
    line(S, 'int', 'Take me through how you would structure this.');
    unlock(S, 'mece');
    (S.c.structNotes || []).forEach(function (id) { unlock(S, id); });
  }
  function minute(S, yes) {
    if (S.phase !== 'structure' || S.sstep !== 'ask') return;
    S.took = !!yes;
    if (yes) { tick(S, 2); line(S, 'you', 'May I take a minute to structure my thoughts?'); line(S, 'int', 'Take your time.'); }
    else { line(S, 'you', 'Let me dive straight in.'); line(S, 'int', 'All right. Go.'); }
    S.sstep = 'build';
  }
  function evalTree(c, sel) {
    var cards = sel.map(function (id) { return find(c.cards, id); }), cov = {}, over = [], traps = [], irr = [], tail = 0, pts = 0, i, j;
    cards.forEach(function (cd) {
      if (cd.cov) cov[cd.cov] = 1;
      if (cd.tail) tail++;
      if (cd.trap) { traps.push(cd); pts += cd.pts || -1; }
      if (cd.irr) { irr.push(cd); pts += cd.pts || -1; }
    });
    for (i = 0; i < cards.length; i++) for (j = i + 1; j < cards.length; j++) if (cards[i].ok && cards[i].ok === cards[j].ok) over.push([cards[i], cards[j]]);
    var gaps = c.req.filter(function (b) { return !cov[b]; });
    pts += (c.req.length - gaps.length) * 6 / c.req.length + Math.min(2, tail) - 1.5 * over.length;
    return { pts: Math.max(0, pts), over: over, traps: traps, irr: irr, gaps: gaps, clean: !over.length && !traps.length && !gaps.length && !irr.length };
  }
  function short(cd) { return cd.nm || cd.t.split(':')[0]; }
  function uc(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function layout(S) {
    if (S.phase !== 'structure' || S.sstep !== 'build' || S.tree.length < 3 || S.tree.length > 5 || S.lays >= 2) return;
    S.lays++;
    var te = S.treeEval = evalTree(S.c, S.tree), say;
    line(S, 'you', 'I would look at this in ' + S.tree.length + ' parts: ' + S.tree.map(function (id) { var cd = find(S.c.cards, id), i = cd.t.indexOf(': '); return lc(cd.say || (i > 0 ? cd.t.slice(i + 2) : cd.t)); }).join('; ') + '.');
    if (te.over.length) say = uc(short(te.over[0][0])) + ' and ' + lc(short(te.over[0][1])) + ' overlap. You would count the same dollars twice.';
    else if (te.traps.length) say = te.traps[0].trap;
    else if (te.gaps.length) say = 'Where would ' + S.c.bucket[te.gaps[0]] + ' show up in this?';
    else if (te.irr.length) say = te.irr[0].irr;
    else say = 'Clean. I can see where you are going.';
    if (te.clean) {
      var nu = S.tree.map(function (id) { return find(S.c.cards, id); }).filter(function (cd) { return typeof cd.neu === 'string'; })[0];
      if (nu) say += ' ' + nu.neu;
    }
    line(S, 'int', say);
    unlock(S, 'tree'); unlock(S, 'framework');
    S.sstep = S.lays >= 2 ? 'hyp' : 'laid';
    if (S.sstep === 'hyp') line(S, 'int', 'Where is your money right now?');
  }
  function keepTree(S) { if (S.sstep !== 'laid') return; S.sstep = 'hyp'; line(S, 'int', 'Where is your money right now?'); }
  function editTree(S) { if (S.sstep !== 'laid' || S.lays >= 2) return; tick(S, 1); S.sstep = 'build'; }
  function setHyp(S, id) {
    var h = find(S.c.hyps, id);
    if (!h || S.hyp === id) return;
    var upd = !!S.hyp;
    S.hyp = id; S.hypAt = S.seen.length;
    if (upd) { tick(S, 0.5); line(S, 'you', 'I am updating my hypothesis: ' + lc(h.t)); line(S, 'int', 'Noted. What changed your mind?'); return; }
    line(S, 'you', 'My hypothesis: ' + lc(h.t));
    unlock(S, 'hyp');
    toAnalyze(S);
  }
  function toAnalyze(S) {
    S.phase = 'analyze';
    if (S.c.format === 'cand') line(S, 'int', 'What would you like to look at first?');
    else { line(S, 'int', 'Let us look at some data.'); handNext(S); }
  }
  function inStructure(S, ex) {
    return ex.inn === '*' || (S.c.format === 'int') || S.tree.some(function (id) { return has(ex.inn, id); }) || (ex.id === 'X7' && S.x7in) || (ex.id === 'V3' && has(S.asked, 'v2'));
  }
  function branchOf(S, ex) {
    if (ex.inn === '*') return 'Always';
    for (var i = 0; i < S.tree.length; i++) if (has(ex.inn, S.tree[i])) return short(find(S.c.cards, S.tree[i]));
    if (ex.id === 'X7' && S.x7in) return 'The CEO’s theory';
    if (ex.id === 'V3' && has(S.asked, 'v2')) return 'Your question on EBITDA';
    return null;
  }
  var HERE = ['Here it is.', 'Pulled it for you.', 'The team has this.', 'Here you go.'];
  function openEx(S, id, cost, hand) {
    var ex = find(S.c.ex, id);
    tick(S, cost);
    S.seen.push(id); S.cur = id;
    S.log.push({ t: S.clock, k: 'ex', id: id, root: S.c.root[S.v] === id });
    if (hand) line(S, 'int', hand);
    (ex.notes ? ex.notes(S.v) : []).forEach(function (nid) { unlock(S, nid); });
    if (id === 'X3') unlock(S, 'pareto');
    if (S.c.format === 'cand' && S.seen.length === 3) unlock(S, 'pareto');
  }
  function request(S, id) {
    if (S.phase !== 'analyze' || S.curveOpen || S.over) return false;
    var ex = find(S.c.ex, id);
    if (!ex) return false;
    if (has(S.seen, id)) { S.cur = id; return true; }
    if (S.forced || S.c.format !== 'cand') return false;
    var inS = inStructure(S, ex);
    line(S, 'you', 'Could I see ' + lc(ex.req) + '?');
    if (!inS) S.off++;
    openEx(S, id, inS ? COST.cand.open : COST.cand.out, inS ? HERE[S.seen.length % HERE.length] : 'Here it is. Where does that sit in your structure?');
    return true;
  }
  function handNext(S) {
    var c = S.c;
    if (S.phase !== 'analyze' || c.format !== 'int' || S.curveOpen || S.over) return false;
    var nxt = c.seq[S.seqPos + 1];
    if (!nxt || S.forced) return false;
    if (nxt === c.optional && !S.optAsked) { S.optAsked = true; line(S, 'int', c.optAsk); return 'ask'; }
    S.seqPos++;
    openEx(S, nxt, COST.int.open, find(c.ex, nxt).hand);
    return true;
  }
  function cont(S) {
    var c = S.c;
    if (S.cur && !exDone(S, S.cur)) return false;
    if (c.format === 'int' && !S.curveFired && S.cur === c.curveAfter) { fireCurve(S); return true; }
    return handNext(S);
  }
  function maybeCurve(S) {
    if (S.curveFired || S.phase !== 'analyze' || S.c.format !== 'cand' || S.over || S.forced || (S.cur && !exDone(S, S.cur))) return false;
    var done = S.seen.filter(function (id) { return exDone(S, id); }).length;
    if (done >= 2 || S.clock >= 0.45 * S.budget) { fireCurve(S); return true; }
    return false;
  }
  function fireCurve(S) {
    var cb = S.c.curves[S.curveIdx];
    S.curveFired = true; S.curveOpen = true;
    line(S, 'int', val(cb.t, S));
  }
  function curveAns(S, j) {
    if (!S.curveOpen) return false;
    var cb = S.c.curves[S.curveIdx], o = cb.opts[j];
    if (!o) return false;
    tick(S, 2);
    S.curve = j; S.curveOpen = false;
    line(S, 'you', val(o.t, S));
    line(S, 'int', val(o.r, S));
    if (o.fx) o.fx(S);
    S.log.push({ t: S.clock, k: 'curve', ok: (val(o.J, S) || 0) > 0, bad: (val(o.J, S) || 0) < 0 });
    if (S.recNext) { S.recNext = false; toRecommend(S); }
    return true;
  }
  function toRecommend(S) {
    if (S.phase !== 'analyze' || S.curveOpen) return false;
    if (!S.recSaid) { S.recSaid = true; line(S, 'you', 'I am ready to give a recommendation.'); }
    if (!S.curveFired && !S.forced && !S.over) { line(S, 'int', 'One thing before you do.'); S.recNext = true; fireCurve(S); return true; }
    S.phase = 'recommend';
    line(S, 'int', S.c.recAsk);
    unlock(S, 'pyramid');
    return true;
  }
  /* a governing thought quotes the numbers of the world it belongs to, so a wrong one is wrong for the right reasons */
  function govText(S, g) {
    if (!g.ok || g.ok === S.v) return val(g.t, S.n);
    var w = clone(S.c.compute(g.ok, S.k));
    if (S.n.ask != null) { w.ask = S.n.ask; w.mult = S.n.mult; }
    return val(g.t, w);
  }
  function govKind(S, g) { return g.last ? 'last' : g.hedge ? 'hedge' : g.ok === S.v ? 'right' : g.part ? 'partial' : 'wrong'; }
  function supById(S, id) { return find(supsOf(S), id); }
  function supText(S, s) { return val(s.t, S, S.n); }
  function supSeen(S, s) { return !s.need || s.need.every(function (x) { return has(S.seen, x); }); }
  function supWrongNum(S, s) { return (s.q || []).some(function (id) { return S.qmap[id] && qv(S, id).wrong; }); }
  function script(S) {
    var g = find(S.c.gov, S.synth.gov), sp = S.synth.sup.map(function (id) { return lc(supText(S, supById(S, id))); });
    var rk = S.c.risks[S.v][S.synth.risk], nx = S.c.next[S.v][S.synth.next];
    return govText(S, g) + ' Three reasons. First, ' + sp[0] + ' Second, ' + sp[1] + ' Third, ' + sp[2] + ' The main risk: ' + lc(rk[0]) + ' Next, ' + lc(nx[0]);
  }
  function deliver(S) {
    if (S.phase !== 'recommend' || S.delivered || !S.synth.gov || S.synth.sup.length !== 3 || S.synth.risk == null || S.synth.next == null) return false;
    S.delivered = true;
    tick(S, 3);
    S.log.push({ t: S.clock, k: 'rec' });
    S.said = script(S);
    line(S, 'you', S.said);
    finish(S);
    var R = S.result, g = find(S.c.gov, S.synth.gov), k = govKind(S, g);
    line(S, 'int', k === 'right' ? (R.P.C >= 8 ? 'That is a recommendation. I could send that to the client tonight.' : 'Right answer. Next time, make it easier to hear.')
      : k === 'partial' ? (g.r || 'Defensible. Not the strongest answer the data supports.') : k === 'last' ? 'I am still waiting for the answer.'
        : k === 'hedge' ? 'If you need more data, tell me which and what it would change.' : 'The data we saw points elsewhere. We will talk about it.');
    return true;
  }
  function finish(S) {
    S.phase = 'score';
    S.result = score(S);
    if (S.errOn && has(S.seen, S.errEx) && !S.caught) unlock(S, 'sanity');
    if (S.v === 'B' && S.cid === 'cinema') unlock(S, 'adverse');
  }

  /* ---------- scoring: points per dimension, then 1 to 4 in halves ---------- */
  var NOTE = {
    askedObj: 'Asked what the client was solving for before solving it.', noObj: 'Never asked what success looks like; you solved a problem, maybe not theirs.',
    mece: 'Your tree was clean: no overlaps, no gaps, and each branch pointed at data.', overlap: 'Two branches overlapped ({a} and {b}); you double-counted before you started.',
    trap: 'Reached for {name}. {why}', gap: 'Your tree had no branch for {bucket}, so you never looked there.',
    offStruct: 'Asked for data outside your own structure {n}.', dove: 'Started without a structure; the first ten minutes wandered.', hyp: 'Worked from a hypothesis, which made every request purposeful.',
    clean: 'Math was clean, with sensible rounding.', hints: 'Needed hints on {n}.', wrongNum: 'A wrong number made it into your recommendation. Numbers you say to a CEO get repeated.',
    missedErr: 'Missed the error in Exhibit {n}: {what}.', caughtErr: 'Caught the error in Exhibit {n} before it caught you.', promptedErr: 'Found the error in Exhibit {n} only after I pointed at it.',
    soWhat: 'Turned exhibits into implications, not descriptions.', restate: 'Described charts instead of interpreting them ({n}).', over: 'Jumped from a finding to a sweeping action {n}.',
    anchored: 'Held on to your first hypothesis after the data turned against it.', curveGood: 'Took the new information seriously and tested it with a number.', curvePivot: 'Pivoted on a hunch.',
    curveDismiss: 'Dismissed new information without a number.', curveWrong: 'Answered the CEO with a number the exhibit does not support.', unsupported: 'Claimed something you had not seen data for.', eighty20: 'Went straight where the money was.',
    falseFlag: 'Flagged a problem that was not there. Checking is good; crying wolf costs a little.',
    answerFirst: 'Led with the answer. That alone puts you ahead of most candidates.', answerLast: 'Made me wait for the answer; a CEO would have interrupted.',
    hedge: 'Hedged. “It depends” is a question, not a recommendation.', threeReasons: 'Three reasons, three different reasons.', dup: 'Two of your three reasons were the same reason.',
    late: 'Ran {n} over.', noRec: 'Ran out of time before giving an answer: the most common way to fail a case.', restateGood: 'Played the question back accurately before starting.',
    restateDrift: 'Your restatement changed the question.', noRoot: 'Recommended without seeing the exhibit that decides this case.',
    guess: 'The right answer, without the evidence that proves it: a guess the client cannot use.'
  };
  /* which dimension each note belongs to, for advice drawn from saved scorecards */
  var NOTE_DIM = { askedObj: 'S', noObj: 'S', mece: 'S', overlap: 'S', trap: 'S', gap: 'S', offStruct: 'S', dove: 'S', hyp: 'S',
    clean: 'A', hints: 'A', wrongNum: 'A', missedErr: 'A', caughtErr: 'A', promptedErr: 'A',
    soWhat: 'J', restate: 'J', over: 'J', falseFlag: 'J', curveGood: 'J', curvePivot: 'J', curveDismiss: 'J', curveWrong: 'J', anchored: 'J', eighty20: 'J', unsupported: 'J', noRoot: 'J',
    restateGood: 'C', restateDrift: 'C', answerFirst: 'C', answerLast: 'C', hedge: 'C', threeReasons: 'C', dup: 'C', late: 'C', noRec: 'C', guess: 'C' };
  var POS = { askedObj: 1, mece: 1, hyp: 1, clean: 1, caughtErr: 1, soWhat: 1, curveGood: 1, eighty20: 1, answerFirst: 1, threeReasons: 1, restateGood: 1 };
  function times(n) { return n === 1 ? 'once' : n === 2 ? 'twice' : n + ' times'; }
  function noteText(nt) { return NOTE[nt.k].replace(/\{(\w+)\}/g, function (m, p) { return nt.p[p] != null ? nt.p[p] : ''; }); }
  function word(s) { return s < 1.75 ? 'Concern' : s < 2.5 ? 'Mixed' : s < 3.25 ? 'Solid' : 'Distinctive'; }
  var VERDICT = { 'Strong yes': 'I would put you in front of this client on Monday.', 'Yes': 'Hire. Coachable gaps, no holes.',
    'Lean no': 'Something real is there. Not yet.', 'No': 'Not this time. Every item on this card is a learnable habit, which is the good news.' };
  function verdictOf(o) { return o >= 3.25 ? 'Strong yes' : o >= 2.75 ? 'Yes' : o >= 2.25 ? 'Lean no' : 'No'; }
  function anchored(S) {
    var h = S.hyp, c = S.c;
    if (!h || has(c.truthHyp[S.v], h) || has(c.noAnchor || [], h)) return false;
    var since = S.seen.slice(S.hypAt);
    return c.dis.some(function (d) { return d[2] === h && d[1].indexOf(S.v) >= 0 && has(since, d[0]); });
  }
  function score(S) {
    var c = S.c, v = S.v, P = { S: 0, A: 0, J: 0, C: 0 }, N = { S: [], A: [], J: [], C: [] }, rec = S.delivered;
    function nt(d, k, p) { N[d].push({ k: k, p: p || {} }); }
    var hasObj = false, askedObj = false;
    c.clarify.forEach(function (q) { if (qtype(q, v) === 'obj') hasObj = true; });
    S.asked.forEach(function (id) {
      var t = qtype(find(c.clarify, id), v);
      if (t === 'obj') { P.S += 2; askedObj = true; } else if (t === 'metric') P.S += 2; else if (t === 'fact') { P.S += 1; P.J += 1; } else if (t === 'scope') P.S += 1; else if (t === 'noise') P.C -= 1;
    });
    if (askedObj) nt('S', 'askedObj'); else if (hasObj) { P.S -= 1; nt('S', 'noObj'); }
    var te = S.treeEval;
    if (te) {
      P.S += te.pts;
      if (te.clean) nt('S', 'mece');
      if (te.over.length) nt('S', 'overlap', { a: lc(short(te.over[0][0])), b: lc(short(te.over[0][1])) });
      if (te.traps.length) nt('S', 'trap', { name: lc(te.traps[0].t), why: te.traps[0].trap });
      if (te.gaps.length) nt('S', 'gap', { bucket: c.bucket[te.gaps[0]] });
    }
    if (S.hyp) { P.S += 1; nt('S', 'hyp'); }
    if (S.took === false) { P.S -= 1; nt('S', 'dove'); }
    if (S.off) { P.S -= Math.min(2, 0.5 * S.off); nt('S', 'offStruct', { n: times(S.off) }); }

    var ap = 0, cnt = 0, allFull = true;
    Object.keys(S.ans).forEach(function (id) {
      var a = S.ans[id], q = S.qmap[id].q;
      if (!a.done || q.type === 'multi') return;
      cnt++;
      if (a.grade === 'full') ap += 2; else { allFull = false; if (a.grade === 'partial') ap += 1; }
    });
    /* accuracy, not volume: full marks need clean answers, and at least two of them */
    P.A += cnt ? 8 * (ap / (2 * cnt)) * Math.min(1, cnt / 2) : 0;
    if (S.hints) { P.A -= Math.min(2, 0.5 * S.hints); nt('A', 'hints', { n: S.hints === 1 ? 'one calculation' : S.hints + ' calculations' }); }
    if (cnt >= 2 && allFull && !S.hints) nt('A', 'clean');
    var errOpened = S.errOn && has(S.seen, S.errEx);
    if (errOpened) {
      if (S.caught && !S.prompted) nt('A', 'caughtErr', { n: exNum(S, S.errEx) });
      else if (S.caught) nt('A', 'promptedErr', { n: exNum(S, S.errEx) });
      else nt('A', 'missedErr', { n: exNum(S, S.errEx), what: find(c.ex, S.errEx).err.what });
    }

    var rights = 0, rests = 0, overs = 0;
    Object.keys(S.so).forEach(function (k) { var x = S.so[k]; if (x === 'right') rights++; else if (x === 'restate') rests++; else overs++; });
    P.J += Math.min(6, 2 * rights) - overs;
    if (rights >= 2) nt('J', 'soWhat');
    if (rests) nt('J', 'restate', { n: times(rests) });
    if (overs) nt('J', 'over', { n: times(overs) });
    P.J += errOpened ? Math.max(0, (S.caught ? (S.prompted ? 0.5 : 2) : 0) - 0.5 * S.falseFlags) : Math.max(0, 2 - 0.5 * S.falseFlags);
    if (S.falseFlags) nt('J', 'falseFlag');
    if (S.curve != null) {
      var o = c.curves[S.curveIdx].opts[S.curve];
      P.J += val(o.J, S) || 0; P.C += val(o.C, S) || 0;
      var nk = val(o.note, S);
      if (nk) nt('J', nk);
    }
    Object.keys(S.ans).forEach(function (id) { var a = S.ans[id]; if (a.done && S.qmap[id].q.type === 'multi') P.J += a.J || 0; });
    if (S.hyp && has(c.truthHyp[v], S.hyp)) P.J += 1; else if (anchored(S)) { P.J -= 1; nt('J', 'anchored'); }
    if (c.format === 'cand' && has(S.seen.slice(0, 3), c.root[v])) { P.J += 1; nt('J', 'eighty20'); }

    if (S.restate === 'acc') { P.C += 1; nt('C', 'restateGood'); } else if (S.restate === 'drift') { P.C -= 1; nt('C', 'restateDrift'); }
    if (S.took) P.C += 1;
    if (rec) {
      var sy = S.synth, sups = sy.sup.map(function (id) { return supById(S, id); }), g = find(c.gov, sy.gov), gk = govKind(S, g);
      if (c.risks[v][sy.risk][1]) P.J += 1;
      if (c.next[v][sy.next][1]) P.J += 1;
      var uns = 0, wn = 0;
      sups.forEach(function (s) {
        if (!supSeen(S, s)) { P.J -= 1; uns++; }
        if (s.bad) P.J -= 1;
        if (supWrongNum(S, s)) { P.A -= 0.5; wn++; }
      });
      if (uns) nt('J', 'unsupported');
      if (wn) nt('A', 'wrongNum');
      var rootSeen = has(S.seen, c.root[v]);
      if (!rootSeen) { P.J -= 2; nt('J', 'noRoot'); }
      if (gk === 'right' && !rootSeen) { P.C += 1; nt('C', 'guess'); } else if (gk === 'right') { P.C += 3; nt('C', 'answerFirst'); } else if (gk === 'partial') { P.C += 1; nt('C', 'answerFirst'); }
      else if (gk === 'last') { P.C -= 1; nt('C', 'answerLast'); } else if (gk === 'hedge') { P.C -= 1; nt('C', 'hedge'); }
      var clash = 0, roles = {}, i, j;
      for (i = 0; i < 3; i++) { roles[sups[i].role] = 1; for (j = i + 1; j < 3; j++) if (sups[i].dup && sups[i].dup === sups[j].dup) clash++; }
      var distinct = Object.keys(roles).length === 3;
      if (!clash) { P.C += distinct ? 2 : 1; if (distinct) nt('C', 'threeReasons'); }
      else { P.C += clash === 1 ? 0 : -1; nt('C', 'dup'); }
      if (has(c.lead, sups[0].role)) P.C += 1;
      if (sups.filter(function (s) { return s.num; }).length >= 2) P.C += 1;
      var over = S.clock - S.budget;
      if (over <= 0) P.C += 1; else if (over > 5) P.C -= 1;
      if (over > 0) nt('C', 'late', { n: nn(over, over % 1 ? 1 : 0) + (over === 1 ? ' minute' : ' minutes') });
    } else nt('C', 'noRec');

    var sc = {}, sum = 0;
    DIMS.forEach(function (d) { sc[d[0]] = Math.round((1 + 3 * clamp(P[d[0]] / MAX[d[0]], 0, 1)) * 2) / 2; sum += sc[d[0]]; });
    var overall = r1(sum / 4), verdict = verdictOf(overall);
    if (!rec && (verdict === 'Strong yes' || verdict === 'Yes')) verdict = 'Lean no';
    if (rec && verdict === 'Strong yes' && !has(S.seen, c.root[v])) verdict = 'Yes';
    /* a Strong yes has no holes: no weak dimension, no wrong number said aloud, no missed error, no unsupported claim */
    var flaw = DIMS.some(function (d) { return sc[d[0]] < 2.5; }) || ['wrongNum', 'missedErr', 'promptedErr', 'unsupported'].some(function (k) {
      return DIMS.some(function (d) { return N[d[0]].some(function (x) { return x.k === k; }); });
    });
    if (verdict === 'Strong yes' && flaw) verdict = 'Yes';
    var notes = {};
    DIMS.forEach(function (d) {
      var all = N[d[0]], pos = all.filter(function (x) { return POS[x.k]; }), neg = all.filter(function (x) { return !POS[x.k]; });
      notes[d[0]] = (sc[d[0]] >= 3 ? pos.slice(0, neg.length ? 2 : 3).concat(neg.slice(0, 1)) : neg.concat(pos)).slice(0, 3);
    });
    return { P: P, N: N, sc: sc, notes: notes, overall: overall, verdict: verdict, rec: rec, end: S.clock };
  }

  /* the efficient path in minutes: every clarifying question, a minute to structure, the root path answered cleanly, a curveball, the delivery */
  function effMinutes(c, v) {
    var C = COST[c.format], m = 0.5 + 4.5 + 2 + 2 + 3;
    c.eff[v].forEach(function (id) {
      var ex = find(c.ex, id), qs = qsOf(ex, v).filter(function (q) { return !q.opt; });
      m += C.open + 0.5;
      qs.forEach(function (q, i) { m += i ? C.follow : C.first; });
    });
    return m;
  }

  var ENG = { CASES: CASES, newAttempt: newAttempt, pickVariant: pickVariant, score: score, parseAns: parseAns, gradeNum: gradeNum, evalTree: evalTree, effMinutes: effMinutes,
    act: { restate: restate, ask: ask, toStructure: toStructure, minute: minute, layout: layout, keepTree: keepTree, setHyp: setHyp, request: request, answer: answer, pick: pick,
      multi: multi, hint: hint, soWhat: soWhat, flag: flag, cont: cont, handNext: handNext, maybeCurve: maybeCurve, curveAns: curveAns, toRecommend: toRecommend, deliver: deliver, finish: finish },
    trueAns: trueAns, soOpts: soOpts, supsOf: supsOf, exDone: exDone, qsDone: qsDone, dOf: dOf };
  if (K.debug) K.hook(SLUG, { engine: ENG });

  /* ---------- the machine: lobby, case room, lunch, committee ---------- */
  var UNIT = { pts: 'points', '%': 'percent', '$': 'dollars', '$M': '$ millions', '$B': '$ billions', x: 'times (x)', years: 'years', stores: 'stores', trucks: 'trucks' };
  var PHASES = [['brief', 'Brief'], ['clarify', 'Clarify'], ['structure', 'Structure'], ['analyze', 'Analyze'], ['recommend', 'Recommend'], ['score', 'Scorecard']];
  var COACH = {
    brief: 'Restate the question in one sentence, including what success looks like. Interviewers listen for whether you heard the objective.',
    clarify: 'Ask about the objective, how it is measured, and whether anything changed. Do not ask for data you should be hypothesizing about.',
    structure: 'Three to five branches. No overlaps, no gaps, and each branch should point at data you could ask for.',
    hyp: 'Pick the guess you would bet lunch on. You are allowed to be wrong; you are not allowed to stay wrong.',
    cand: 'Start with the exhibit that tells you where the problem lives, then go straight at the biggest branch. Every request costs time.',
    int: 'The interviewer is steering. Your job is fast, clean math and one-sentence implications.',
    exhibit: 'Before computing, glance at totals and units. Then round, compute, and say the so-what out loud.',
    curve: 'Take the new information seriously, say how it would change your answer, and test it with one number.',
    rec: 'Answer first. Three reasons that do not overlap. One risk, one next step. Then stop talking.'
  };
  var QSHORT = { cinema: 'Why did Vellum’s profit fall, and what should it do?', grocer: 'Should Stavholm enter the US Southeast, and how?',
    vet: 'Should Kilnworth buy Larkspur at the asking price?', freight: 'What should Slipline charge, and how should it charge it?' };
  var PRINC = { cinema: ['clarify', 'mece', 'profitTree', 'hyp', 'pareto', 'contribution', 'soWhat', 'sanity', 'pyramid'], grocer: ['clarify', 'mece', 'sizing', 'payback', 'entry', 'soWhat', 'sanity', 'pyramid'],
    vet: ['clarify', 'mece', 'ebitda', 'qoe', 'moic', 'arbitrage', 'pareto', 'sanity', 'pyramid'], freight: ['clarify', 'mece', 'contribution', 'evc', 'costPlus', 'volatility', 'soWhat', 'pyramid'] };
  var INTRO = 'Four client problems wait below, and each one is a test of how you think. Each runs the real sequence: play the question back, ask what matters, build a structure, read the exhibits, do the math in your head and say the answer first. An interviewer scores structure, analytics, judgment and communication, and gives a reason for every score.';
  var HOW = '<p>Each case runs in interview minutes, not real ones: every request, calculation and so-what costs a few, and the budget is 30 or 35. Take as long as you like to think; the clock only moves when you act.</p>' +
    '<p>Two styles of case. In an interviewer-led case you are steered exhibit by exhibit and judged on speed, math and implications. In a candidate-led case you decide what to ask for, and every request costs time. Prep guides commonly describe McKinsey’s case as interviewer-led and BCG’s and Bain’s as candidate-led; BCG’s and Bain’s own pages describe what they look for: a structured approach, good questions, quick and careful math, and clear communication.</p>' +
    '<p>The scorecard rates structure, analytics, judgment and communication from 1 to 4, and every note on it is tied to something you did. Some exhibits carry a planted error; “Something looks off” is how you say so. Same seed, same case: retake one to test another path. The rubric and the committee’s rules are this machine’s, not any firm’s.</p>';
  var PLAIN = { overlap: 'Two branches of an issue tree overlapped; you double-counted before you started.', trap: 'Reached for a framework that describes an industry or a portfolio, not the client’s problem.',
    gap: 'An issue tree had a gap, so part of the question never got looked at.', offStruct: 'Asked for data outside your own structure.', hints: 'Needed hints on calculations.',
    missedErr: 'Let a planted error in an exhibit get past you.', caughtErr: 'Caught a planted error before it caught you.', promptedErr: 'Found a planted error only after the interviewer pointed at it.', restate: 'Described charts instead of interpreting them.',
    over: 'Jumped from a finding to a sweeping action.', late: 'Ran over time.', noRoot: 'Recommended without seeing the exhibit that decides the case.' };
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function phaseIdx(p) { for (var i = 0; i < PHASES.length; i++) if (PHASES[i][0] === p) return i; return 0; }
  function mins(v) { return F.n(v, v % 1 ? 1 : 0); }
  function normStore(o) {
    o = o && typeof o === 'object' ? o : {};
    var d = { v: 1, coach: o.coach !== false, plays: {}, last: {}, lunch: !!o.lunch };
    CASES.forEach(function (c) {
      var p = o.plays && +o.plays[c.id];
      if (p > 0) d.plays[c.id] = Math.floor(p);
      var l = o.last && o.last[c.id];
      if (l && typeof l === 'object' && isFinite(l.overall) && isFinite(l.S) && isFinite(l.A) && isFinite(l.J) && isFinite(l.C) && VERDICT[l.verdict]) d.last[c.id] = l;
    });
    return d;
  }

  /* ---------- the drawing: each case as a paper model on a kraft board, lit on the espresso stage, that you can turn and
     take apart. The engine (/assets/3d) loads the first time a case room nears the screen. The drawing only reads the
     attempt: a part appears when you finish the exhibit that shows it, and the scorecard reveals the rest. Materials come
     from the engine: foil is the one live part, an outline stays an outline, and the board is plaster. ---------- */
  var D3 = null, MAT3 = {
    dim: { face: 'none', line: 'ink2', lineA: .9, w: .9 },
    ghost: { face: 'none', line: 'muted', lineA: 1, dash: 4 },
    fs: { kind: 'foil', face: 'accent', line: 'accent', w: 1.2 },
    fw: { face: 'none', line: 'accent', w: .85 },
    qs: { face: 'card', line: 'ink2', lineA: .45, w: .75 },
    fd: { face: 'none', line: 'accent', w: 1.25, dash: 4 },
    board: { kind: 'plaster', face: 'card', line: 'ink2', lineA: .3 }
  };
  function need3d() {
    if (D3) return D3;
    D3 = new Promise(function (ok, no) {
      function go() {
        try {
          var P = window.PS3D;
          P.load([P.support() === '2d' ? 'c2d' : 'gl', 'explorer']).then(function () { reg3d(P); ok(P); }, no);
        } catch (e) { no(e); }
      }
      if (window.PS3D) { go(); return; }
      var s = document.createElement('script');
      s.src = '/assets/3d/core.js?v=3'; s.async = true; s.onload = go;
      s.onerror = function () { no(new Error('the 3D engine did not load')); };
      document.head.appendChild(s);
    });
    D3.then(null, function () { D3 = null; });
    return D3;
  }
  function reg3d(P) {
    if (P.getModel('case-tree')) return;
    Object.keys(M3).forEach(function (k) {
      var m = M3[k];
      P.model(m.id, { v: 1, title: m.t, desc: m.d, camera: 'ortho', views: { iso: m.cam }, mats: MAT3, build: function (B, p) {
        var r = m.build(B, p), b = m.base(p);
        r.unshift(B.part('board', { pick: false, layer: -1, fit: false, mat: 'board' }, [B.box((b[0] + b[2]) / 2, -.125, (b[1] + b[3]) / 2, b[2] - b[0], .08, b[3] - b[1])]));
        return r;
      } });
    });
  }
  /* shapes: a unit box (scaled into place by sync), a group that carries the explode, an invisible frame, a dimension line */
  function ub(B, mat) { return B.box(.5, 0, .5, 1, 1, 1, { mat: mat }); }
  function blk(B, id, o, mats, pos, scl) {
    return B.part(id, o, [], mats.map(function (m, i) {
      return B.part(id + '-' + 'bfg'.charAt(i), { pos: pos.slice(), scl: scl.slice(), visible: !i }, [ub(B, m)]);
    }));
  }
  function frm(B, a, b) { return B.part('frame', { pick: false, alpha: 0 }, [B.lines(a.concat(b), { mat: 'dim' })]); }
  function dl(L, a, b, o) {
    function p(u, k) { return [u[0] + o[0] * k, u[1] + o[1] * k, u[2] + o[2] * k]; }
    var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]) || 1,
      ol = Math.sqrt(o[0] * o[0] + o[1] * o[1] + o[2] * o[2]) || 1, t = [0, 1, 2].map(function (i) { return (d[i] / l + o[i] / ol) * .045; });
    [[p(a, .25), p(a, 1.3)], [p(b, .25), p(b, 1.3)], [p(a, 1), p(b, 1)]].forEach(function (s) { L.push(s[0][0], s[0][1], s[0][2], s[1][0], s[1][1], s[1][2]); });
    [p(a, 1), p(b, 1)].forEach(function (c) { L.push(c[0] - t[0], c[1] - t[1], c[2] - t[2], c[0] + t[0], c[1] + t[1], c[2] + t[2]); });
    return L;
  }
  /* sync helpers: a weighted spring per node axis, visibility, foil twins, part strings for the card and the ledger */
  function sp3(ex, n, k, i, to, snap) {
    if (!n) return;
    var key = '_cs' + k + i, s = n[key];
    if (!s) s = n[key] = window.PS3D.spring({ k: 120, c: 18, eps: 1e-4, x: n[k][i], onUpdate: function (x) { n[k][i] = x; ex.vw.invalidate(); } });
    if (snap) s.snap(to); else if (s.target !== to) s.set(to);
  }
  function sp3s(ex, P, id, k, i, to, snap) { 'bfg'.split('').forEach(function (c) { sp3(ex, P[id + '-' + c], k, i, to, snap); }); }
  function vis(n, on) { if (n) n.visible = !!on; }
  function twin(P, id, k) { 'bfg'.split('').forEach(function (c) { vis(P[id + '-' + c], c === k); }); }
  function pm(ex, o, id, name, fig, why) {
    var n = ex.parts[id];
    if (!n) return;
    n.name = name; n.fig = fig; n.why = why;
    o.parts.push([id, n.n, name, fig]);
  }

  /* Vellum: width is visits, depth is revenue per visit, height is contribution margin, so the volume is contribution */
  function cinD(n) {
    return { w0: 2.5, d0: 2.02, h0: 3 * 328.3 / 505, f0: 3 * 255 / 505, w1: n.A1 / 10, d1: n.rev1 / n.A1 / 10,
      h1: 3 * (n.rev1 - n.rent1 - n.fbc1) / n.rev1, f1: 3 * (n.L1 + n.R1 + n.X1) / n.rev1,
      rt: n.v === 'A' ? 3 * n.rentHit / n.rev1 : 0, ad: n.v === 'C' ? 3 * 21.84 / n.rev1 : 0 };
  }
  function audit(B, n, D) {
    var m = Math.round(150 * n.MV / n.A1), so = [], ho = [], st = [], G = [], x0 = .15, x1 = D.w1 - .15, z1 = D.d1 - .12, aw = x1 - x0,
      rp = (D.d1 - .54) / 10, sp = aw / 15, i, r, c, y, z;
    for (r = 0; r < 10; r++) {
      y = .03 + r * .035; z = z1 - .3 - (r + .5) * rp;
      st.push(B.box(x0 + aw / 2, 0, z, aw, y, rp, { mat: 'qs' }));
      for (c = 0; c < 15; c++) {
        i = r * 15 + c;
        (Math.floor((i + 1) * m / 150) > Math.floor(i * m / 150) ? ho : so).push(B.box(x0 + (c + .5) * sp, y, z, sp * .62, .08, rp * .55, { mat: 'qs' }));
      }
    }
    ho.forEach(function (s) { s.mat = 'fw'; });
    [[x0, .12], [x1, .12], [x1, z1], [x0, z1]].forEach(function (q) { G.push(q[0], -.45, q[1], q[0], 0, q[1]); });
    return B.part('cul', { n: 5, visible: false, explode: [0, .6, 0], anchor: [x1, D.h1 + .75, z1 / 2] }, [], [B.part('cul-b', { pos: [0, D.h1 + .45, 0], scl: [1, .001, 1] }, [
      B.path([[x0 + .25, .1, z1 - .06], [x1 - .25, .1, z1 - .06], [x1 - .25, .55, z1 - .06], [x0 + .25, .55, z1 - .06]], { closed: true, mat: 'dim' }), B.lines(G, { mat: 'ghost' })], [
      B.part('cul-st', {}, st), B.part('cul-so', {}, so), B.part('cul-ho', {}, ho)])]);
  }
  var M3 = {
    cinema: { id: 'case-exhibit', t: 'Vellum’s profit as a block', cam: { yaw: 38, pitch: 30 },
      base: function (p) { var D = cinD(p.n); return [-.7, -.45, Math.max(D.w0, D.w1) + .6, Math.max(D.d0, D.d1) + .6]; },
      d: 'Width is visits, depth is revenue per visit and height is contribution margin, so the volume is contribution. The slab above the cost line is operating profit.',
      build: function (B, p) {
        var n = p.n, D = cinD(n), W = Math.max(D.w0, D.w1), Z = Math.max(D.d0, D.d1), L = [], H = [];
        dl(L, [0, 0, D.d1], [D.w1, 0, D.d1], [0, 0, .32]); dl(L, [D.w1, 0, 0], [D.w1, 0, D.d1], [.32, 0, 0]);
        dl(H, [0, 0, D.d1], [0, D.h1, D.d1], [-.32, 0, 0]);
        return [
          frm(B, [-.7, -.4, -.2], [W + .7, Math.max(D.h0, D.h1 + D.rt) + (n.v === 'B' ? 1.75 : .9), Z + .7]),
          B.part('ly', { n: 1, anchor: [0, D.h0, 0] }, [B.box(D.w0 / 2, 0, D.d0 / 2, D.w0, D.h0, D.d0, { mat: 'ghost' }),
            B.path([[0, D.f0, 0], [D.w0, D.f0, 0], [D.w0, D.f0, D.d0], [0, D.f0, D.d0]], { closed: true, mat: 'ghost' })]),
          B.part('fp', { n: 2, explode: [0, -.4, 0], anchor: [D.w1 / 2, 0, D.d1] }, [B.box(D.w1 / 2, -.04, D.d1 / 2, D.w1, .04, D.d1, { mat: 'quiet' })]),
          blk(B, 'fx', { n: 3, visible: false }, ['paper'], [0, 0, 0], [D.w1, .001, D.d1]),
          blk(B, 'op', { n: 4, visible: false, explode: [0, .5, 0] }, ['paper', 'fs'], [0, 0, 0], [D.w1, .001, D.d1]),
          B.part('dims', { pick: false }, [B.lines(L, { mat: 'dim' })]),
          B.part('dimh', { pick: false, visible: false }, [B.lines(H, { mat: 'dim' })]),
          n.v === 'B' ? audit(B, n, D) : n.v === 'A' ? blk(B, 'cul', { n: 5, visible: false, explode: [0, 1, 0] }, ['fd'], [0, D.h1, 0], [D.w1, .001, D.d1])
            : blk(B, 'cul', { n: 5, visible: false, explode: [0, 0, 1] }, ['fs'], [0, D.f1 - D.ad, 0], [D.w1, .001, D.d1])
        ];
      },
      sync: function (ex, S, all, snap) {
        var n = S.n, v = S.v, D = cinD(n), P = ex.parts, pl = all || exDone(S, 'X1'), cu = all || exDone(S, S.c.root[v]);
        var o = { parts: [], labels: [], s: 'Last year stands in outline. The brief gives only this year’s floor, which is revenue. Finish the P&L and the walls go up.' };
        var fxa = cu && v === 'C' ? D.f1 - D.ad : D.f1, m = Math.round(150 * n.MV / n.A1);
        pm(ex, o, 'ly', 'Last year', '$328.3M contribution', '25.0M visits × $20.20 a visit × 65.0% margin, with $255.0M of fixed costs and $73.3M of operating profit.');
        pm(ex, o, 'fp', 'Revenue, this year', mm(n.rev1), nn(n.A1, 1) + 'M visits × ' + usd(n.rev1 / n.A1, 2) + ' a visit: the floor of the block.');
        vis(P.fx, pl); vis(P.op, pl); vis(P.dimh, pl); vis(P.cul, cu);
        sp3(ex, P['fx-b'], 'scl', 1, pl ? fxa : .001, snap);
        sp3s(ex, P, 'op', 'pos', 1, pl ? D.f1 : 0, snap); sp3s(ex, P, 'op', 'scl', 1, pl ? D.h1 - D.f1 : .001, snap);
        twin(P, 'op', cu ? 'b' : 'f');
        P.fx.anchor = [D.w1, fxa / 2, D.d1]; P.op.anchor = [D.w1, (D.f1 + D.h1) / 2, D.d1];
        o.labels.push([[D.w1 / 2, 0, D.d1 + .32], nn(n.A1, 1) + 'M visits', 'b'], [[D.w1 + .32, 0, D.d1 / 2], usd(n.rev1 / n.A1, 2) + ' a visit', 'r']);
        if (pl) {
          pm(ex, o, 'fx', 'Fixed costs', mm(n.L1 + n.R1 + n.X1 - (fxa < D.f1 ? 21.84 : 0)), 'Labor, occupancy and other costs: ' + pc(100 * fxa / 3) + ' of revenue against 50.5% last year' + (fxa < D.f1 ? ', with the added shows split out.' : '.'));
          pm(ex, o, 'op', 'Operating profit', mm(n.P1), pc(100 * n.P1 / n.rev1) + ' of revenue against 14.5% last year: the slab above the cost line.');
          o.labels.push([[-.32, D.h1 / 2, D.d1], pc(100 * D.h1 / 3) + ' margin', 'l']);
          o.s = 'The P&L raised the block to a ' + pc(100 * D.h1 / 3) + ' margin, against 65.0% last year. The cost line sits at ' + pc(100 * D.f1 / 3) + ' of revenue.';
        }
        if (cu && v === 'A') {
          sp3(ex, P['cul-b'], 'scl', 1, D.rt, snap); P.cul.anchor = [D.w1, D.h1 + D.rt, D.d1 / 2];
          pm(ex, o, 'cul', 'Film rent squeeze', mm(n.rentHit) + ' a year', 'Franchise films rose to ' + pc(100 * n.m1, 0) + ' of box office at 65% rent, so blended rent rose from 50% to ' + pc(100 * n.r1) + ' of admissions.');
          o.s = 'The dashed lid is the margin the studios took, ' + mm(n.rentHit) + ' a year of film rent.';
        } else if (cu && v === 'B') {
          sp3(ex, P['cul-b'], 'scl', 1, 1, snap);
          pm(ex, o, 'cul', 'One auditorium', m + ' of 150 seats hollow', 'The hollow seats are pass members, worth ' + usd(n.memC, 2) + ' a visit against $13.10, so the pass needs ' + pc(100 * (13.10 - n.memC) / 13.10) + ' of member visits to be new; the survey says 40%.');
          o.s = 'Wider and shallower. In the auditorium lifted out above it, the ' + m + ' hollow seats are pass members, each worth ' + usd(n.memC, 2) + ' instead of $13.10.';
        } else if (cu) {
          sp3(ex, P['cul-b'], 'scl', 1, D.ad, snap); P.cul.anchor = [D.w1, D.f1 - D.ad / 2, D.d1];
          pm(ex, o, 'cul', 'Added shows', mm(21.84) + ' a year to run', '312,000 extra weekday shows at $70 each averaged ' + nn(n.p, 1) + ' patrons and, net of the evening patrons they borrowed, cost ' + mm(-n.addHit) + ' a year.');
          o.s = 'The added shows pushed the cost line up by ' + mm(21.84) + ' a year. That band is the drawer that slides out.';
        }
        var X = Math.max(D.w0, D.w1) + .45, Y = Math.max(D.h0, cu && v === 'A' ? D.h1 + D.rt : cu && v === 'B' ? D.h1 + .95 : 0) + .1, Z = Math.max(D.d0, D.d1) + .45;
        o.fr = [[-.5, -.08, -.1], [X, Y, Z], [-.5, -.5, -.1], [X, Y + (pl ? .6 : 0) + (cu && v === 'A' ? .5 : 0), Z + (cu && v === 'C' ? 1 : 0)]];
        return o;
      } },

    /* Stavholm: the prize as a slab, the 2% target as catchments (one hex per store), then the stores' economics and the way in */
    grocer: { id: 'case-catchment', t: 'Stavholm’s prize, one store at a time', cam: { yaw: 40, pitch: 34 },
      base: function (p) { var D = groD(p.n); return [-.55, -.55, Math.max(D.W + 1.95, D.lx + .45), D.z0 + D.rows * .15 + .3]; },
      d: 'The slab is a year of grocery spend in the six metros. Each hexagon is one compact store’s catchment, and its height is what the store earns.',
      build: function (B, p) {
        var n = p.n, D = groD(n), hx = [], i, L = [];
        for (i = 0; i < D.N; i++) hx.push(hex(B, D.hc(i), D.r * .92));
        dl(L, [0, 0, 0], [D.W, 0, 0], [0, 0, -.32]); dl(L, [0, 0, 0], [0, 0, D.Z], [-.32, 0, 0]);
        var r = [
          frm(B, [-.5, -.3, -.5], [D.W + 1.8, Math.max(D.g * D.k, .6) + .35, D.z0 + D.rows * .15 + .15]),
          B.part('mq', { pick: false }, [B.box(D.W / 2, 0, D.Z / 2, D.W, .16, D.Z, { mat: 'ghost' })]),
          blk(B, 'mk', { n: 1, visible: false, explode: [0, -.35, 0] }, ['paper'], [0, 0, 0], [D.W, .001, D.Z]),
          blk(B, 'sh', { n: 6, visible: false, explode: [0, .5, 0], anchor: [D.W * .02, .22, D.Z] }, ['paper', 'fs'], [0, .16, 0], [Math.max(.05, D.W * .02), .06, D.Z]),
          B.part('st', { n: 7, visible: false, explode: [0, 0, .5], anchor: [D.cols * D.hx / 2, .2, D.z0 + D.rows * .15] }, [], [B.part('st-b', { scl: [1, .001, 1] }, hx.map(function (h) { h.mat = 'quiet'; return h; }))]),
          B.part('lg', { n: 8, visible: false, anchor: [D.lx, .3, D.lz] }, [], [B.part('lg-b', { scl: [1, .001, 1] }, [hex(B, [D.lx, D.lz], D.r * 1.342, 'paper')])]),
          blk(B, 'bu', { n: 9, visible: false, anchor: [D.W + 1, .5, .85] }, ['paper', 'fs'], [D.W + .45, 0, .3], [.55, .001, .55]),
          blk(B, 'by', { n: 10, visible: false, anchor: [D.W + 1.7, .8, .85] }, ['paper', 'fs', 'ghost'], [D.W + 1.15, 0, .3], [.55, .001, .55]),
          B.part('dims', { pick: false, visible: false }, [B.lines(L, { mat: 'dim' })])
        ];
        D.sh.forEach(function (s, j) { r.push(blk(B, 'm' + j, { n: j + 2, visible: false, explode: [0, -.35, 0] }, ['paper'], [D.xs[j], 0, 0], [D.W * s, .001, D.Z])); });
        return r;
      },
      sync: function (ex, S, all, snap) {
        var n = S.n, D = groD(n), P = ex.parts, d = function (id) { return all || exDone(S, id); }, d1 = d('Y1'), d2 = d('Y2'), d3 = d('Y3'), d4 = d('Y4');
        var o = { parts: [], labels: [], s: 'The Southeast, not yet sized. Finish the first exhibit to fill it in.' }, NM = ['Supermarkets', 'Supercenters', 'Discounters', 'Other formats'];
        var WHY = ['Bayline and Hollowell’s price the 40-item basket at 119 and 124 against Stavholm’s 100.', 'Crossroads prices the basket at 106.', 'Kettle Lane prices it at 101, a point above Stavholm.', 'The rest of regional grocery spend.'];
        vis(P.mq, !d1); vis(P.mk, d1 && !d2); vis(P.dims, d1); vis(P.sh, d1); vis(P.st, d1); vis(P.lg, d3); vis(P.bu, d4); vis(P.by, d4);
        sp3(ex, P['mk-b'], 'scl', 1, d1 ? .16 : .001, snap);
        D.sh.forEach(function (s, j) {
          vis(P['m' + j], d2);
          sp3(ex, P['m' + j + '-b'], 'scl', 1, d2 ? .16 : .001, snap); sp3(ex, P['m' + j + '-b'], 'pos', 0, D.xs[j] + (d2 ? j * .16 : 0), snap);
        });
        twin(P, 'sh', d4 ? 'b' : 'f');
        sp3(ex, P['st-b'], 'scl', 1, d3 ? n.contrib * .3 : d1 ? .03 : .001, snap);
        sp3(ex, P['lg-b'], 'scl', 1, d3 ? n.big * .3 : .001, snap);
        sp3s(ex, P, 'bu', 'scl', 1, d4 ? 570 * D.k : .001, snap); sp3s(ex, P, 'by', 'scl', 1, d4 ? n.buyNet * D.k : .001, snap);
        sp3(ex, P['by-g'], 'scl', 1, d4 ? D.g * D.k : .001, snap);
        twin(P, 'bu', n.v === 'X' ? 'f' : 'b'); twin(P, 'by', n.v === 'Y' ? 'f' : 'b'); vis(P['by-g'], d4);
        if (!d4) { twin(P, 'bu', 'b'); twin(P, 'by', 'b'); }
        if (d1) {
          if (!d2) pm(ex, o, 'mk', 'The prize', bb(n.mkt) + ' a year', nn(n.H, 1) + 'M households × $6,224 of food at home × 0.95 for regional prices.');
          else D.sh.forEach(function (s, j) { pm(ex, o, 'm' + j, NM[j], pc(100 * s, 0) + ' of spend', WHY[j]); });
          pm(ex, o, 'sh', 'Stavholm’s target', '2% by year ten', 'About ' + mm(n.mkt * 20, 0) + ' of sales a year, lifted out of the prize.');
          pm(ex, o, 'st', 'Compact stores', nn(D.N) + ' stores', d3 ? 'Each sells ' + mm(n.Ss, 0) + ' and contributes ' + mm(n.contrib, 2) + ' a year, so it pays back in about ' + yr(n.pay) + '.' : 'One hexagon per store’s catchment, at ' + mm(n.Ss, 0) + ' of sales each.');
          o.labels.push([[D.W / 2, 0, -.32], nn(n.H, 1) + 'M households', 't'], [[-.32, 0, D.Z / 2], '$5,913 a household', 'l'], [[D.W * .01, .24, D.Z / 2], '2%', 't']);
          o.s = 'The prize is ' + bb(n.mkt) + ' a year. Stavholm’s 2% lifts out as ' + nn(D.N) + ' compact stores, one hexagon each.';
        }
        if (d2) o.s = 'Split by format: supermarkets hold 58% of spend, and Stavholm’s basket costs about 16% less than theirs. The prize is supermarket shoppers.';
        if (d3) {
          pm(ex, o, 'lg', 'A large store', mm(n.big, 2) + ' a year', 'It sells ' + mm(n.Ss + 6, 0) + ' but costs $9.5M and earns less, so payback takes about ' + yr(n.bigPay) + '.');
          o.s = 'Each hexagon now stands as tall as its yearly contribution, ' + mm(n.contrib, 2) + '. The wide one is a large store, with more sales and less profit.';
        }
        if (d4) {
          pm(ex, o, 'bu', 'Build', '$570M', 'A $150M distribution center, then 84 compact stores at $5.0M each, 25 a year.');
          pm(ex, o, 'by', 'Buy Saltmarsh', mm(n.buyNet, 0) + ' net', mm(n.EV, 0) + ' for 140 stores, plus $168M to convert 84, less $224M for the 56 sold; the outline is the cost before the sale.');
          o.labels.push([[D.W + .72, 570 * D.k + .08, .58], 'Build', 't'], [[D.W + 1.42, D.g * D.k + .08, .58], 'Buy', 't']);
          o.s = 'Two ways to 84 stores: build for $570M, or buy Saltmarsh for ' + mm(n.buyNet, 0) + ' net, about three years sooner. The highlighted column is the answer.';
        }
        var X = d4 ? D.W + 1.9 : Math.max(D.W, d1 ? D.cols * D.hx : 0, d3 ? D.lx + .2 : 0) + .3, Y = d4 ? D.g * D.k + .25 : d3 ? n.contrib * .3 + .15 : .3, Z = d1 ? D.z0 + D.rows * .15 + .1 : D.Z + .2;
        o.fr = [[-.5, -.1, -.45], [X, Y, Z], [-.5, -.45, -.45], [X, Y + .5, Z + .5]];
        return o;
      } },

    /* Larkspur: a waterfall from reported to adjusted EBITDA; depth is the multiple, so each block's volume is price */
    vet: { id: 'case-bridge', t: 'Larkspur’s EBITDA bridge, priced', cam: { yaw: 30, pitch: 24 },
      base: function (p) { var n = p.n, x = (vetCols(n).length - 1) * .95; return [-.6, -.35, x + 1.05, Math.max(n.mult * .1, n.maxEV / n.rr * .1) + .5]; },
      d: 'Height is EBITDA and depth is the multiple, so each block’s volume is what it adds to the price. Take it apart to set the add-backs side by side.',
      build: function (B, p) {
        var n = p.n, C = vetCols(n), Z = n.mult * .1, L = [], r = [], x = (C.length - 1) * .95, mz = n.maxEV / n.rr * .1;
        C.forEach(function (c, i) {
          var o = { n: i + 1, visible: c[0] === 'adj', anchor: [i * .95 + .35, (c[1] + c[2]) * .1, Z / 2] };
          if (c[1] && c[0] !== 'adj') o.explode = [0, -c[1] * .1, .25];
          r.push(blk(B, c[0], o, ['paper', 'fs', 'ghost'], [i * .95, c[1] * .1, 0], [.7, .001, Z]));
        });
        r.push(B.part('mx', { n: C.length + 1, visible: false, anchor: [x + .35, n.rr * .1, mz] }, [B.box(x + .35, 0, mz / 2, .84, n.rr * .1 + .06, mz, { mat: 'ghost' })]));
        dl(L, [0, 0, 0], [0, 0, Z], [-.3, 0, 0]);
        r.push(B.part('dims', { pick: false }, [B.lines(L, { mat: 'dim' })]), frm(B, [-.6, -.2, -.3], [x + 1.1, 3.3, Math.max(Z, mz) + .4]));
        return r;
      },
      sync: function (ex, S, all, snap) {
        var n = S.n, P = ex.parts, C = vetCols(n), v3 = all || exDone(S, 'V3'), v6 = all || exDone(S, 'V6'), Z = n.mult * .1, rec = n.v === 'P';
        var o = { parts: [], labels: [], s: 'The banker claims $30.0M of EBITDA at ' + n.mult + '×, so the block’s volume is the ' + mm(n.ask, 0) + ' asking price. Finish the EBITDA bridge to open it up.' };
        var WHY = { rep: ['Reported EBITDA', 'What the accounts show before any add-back.'],
          acq: ['Acquisition costs', rec ? 'Larkspur bought 5 to 7 clinics in each of the last four years, so this cost comes back.' : 'One deal six months ago and none since, so it does not recur.'],
          rec: ['Recruiting bonuses', 'Called one-time, yet it came to $2.1M, $2.3M and $2.5M in the last three years.'],
          pf: ['Pro forma', 'A fair adjustment for the new clinics’ results in the months before closing.'],
          adj: ['Adjusted EBITDA', 'The banker’s number, which at ' + n.mult + '× supports the ' + mm(n.ask, 0) + ' asking price.'],
          rr: ['Run-rate EBITDA', rec ? 'At 15×, the gap to $30M is about ' + mm(n.gap15, 0) + ' of price.' : 'Every add-back holds, so $30M is real.'] };
        C.forEach(function (c, i) {
          var on = c[0] === 'adj' || v3, k = c[0] === 'rr' || (c[0] === 'adj' && !v3) ? 'f' : rec && v3 && (c[0] === 'acq' || c[0] === 'rec') ? 'g' : 'b';
          vis(P[c[0]], on); twin(P, c[0], k);
          if (snap || !on || PS3D_R()) sp3s(ex, P, c[0], 'scl', 1, on ? c[2] * .1 : .001, snap);
          else setTimeout(function () { if (!ex._csDead) sp3s(ex, P, c[0], 'scl', 1, c[2] * .1, false); }, i * 70);
          if (on) pm(ex, o, c[0], WHY[c[0]][0], (i && c[1] ? '+' : '') + mm(c[2]), WHY[c[0]][1]);
        });
        vis(P.mx, v6);
        o.labels.push([[-.3, 0, Z / 2], n.mult + '× multiple', 'l']);
        if (v3) o.s = rec ? 'Two add-backs come back every year, so they turn hollow. Run-rate EBITDA is about ' + mm(n.rr) + ', and at 15× the gap is about ' + mm(n.gap15, 0) + ' of price.' : 'Every add-back holds. Run-rate EBITDA is the full $30.0M, and the price rests on real earnings.';
        var x0 = v3 ? -.6 : (C.length - 2) * .95 - .6, x1 = (C.length - (v3 ? 1 : 2)) * .95 + 1.1, Y = (v3 ? Math.max(30, n.rep) : 30) * .1 + .1, Z2 = Math.max(Z, v6 ? n.maxEV / n.rr * .1 : 0) + .15;
        o.fr = [[x0, -.1, -.15], [x1, Y, Z2], [x0, -.1, -.15], [x1, Y, Z2 + .3]];
        if (v6) {
          pm(ex, o, 'mx', 'The most Kilnworth can pay', mm(n.maxEV, 0), 'The price that still returns 2.5× in five years is ' + xx(n.maxEV / n.rr, 1) + ' run-rate EBITDA, drawn as the outline’s depth.');
          o.s = 'The outline is the most Kilnworth can pay for 2.5×: about ' + mm(n.maxEV, 0) + ', or ' + xx(n.maxEV / n.rr, 1) + ' run-rate EBITDA against ' + n.mult + '× asked.';
        }
        return o;
      } },

    /* Slipline: the value to one truck over three years, split by the price you set */
    freight: { id: 'case-pool', t: 'Slipline’s value pool, split by your price', cam: { yaw: 34, pitch: 22 },
      base: function () { return [-1.75, -.45, 2.85, 1.5]; },
      d: 'The left column is what the kit is worth to one truck over three years. The right column is your price: Slipline’s share, with the customer’s share above it.',
      build: function (B, p) {
        var n = p.n, D = poolD(n), h = n.monthly * D.k, m = [B.box(1.9, 0, .5, 1, 36 * h, 1, { mat: 'fs' })], L = [], i;
        for (i = 1; i < 36; i++) L.push(1.4, i * h, 1, 2.4, i * h, 1, 2.4, i * h, 1, 2.4, i * h, 0);
        m.push(B.lines(L, { mat: 'dim' }));
        return [
          frm(B, [-1.8, -.3, -.3], [3, Math.max(3 * D.sav, D.evc * 1.45) + .4, 1.5]),
          B.part('q', { pick: false }, [B.box(.5, 0, .5, 1, 1, 1, { mat: 'ghost' })]),
          blk(B, 'ref', { n: 1, visible: false, anchor: [1, D.ref / 2, 1] }, ['quiet'], [0, 0, 0], [1, .001, 1]),
          B.part('yr', { n: 2, visible: false, explode: [0, .5, 0] }, [], [0, 1, 2].map(function (j) { return B.part('y' + j, { scl: [1, .001, 1] }, [ub(B, 'paper')]); })),
          B.part('pr', { n: 3, visible: false, explode: [.6, 0, 0] }, [], [B.part('pr-b', { pos: [1.4, 0, 0], scl: [1, .001, 1] }, [ub(B, 'fs')]), B.part('pr-m', { scl: [1, .001, 1], visible: false }, m)]),
          blk(B, 'kp', { n: 4, visible: false, explode: [.6, .5, 0] }, ['ghost'], [1.4, 0, 0], [1, .001, 1]),
          B.part('cs', { n: 5, visible: false, anchor: [2.5, D.cost, 1.1] }, [B.path([[1.25, D.cost, -.15], [2.55, D.cost, -.15], [2.55, D.cost, 1.15], [1.25, D.cost, 1.15]], { closed: true, mat: 'ghost' })]),
          blk(B, 'dz', { n: 6, visible: false, explode: [-.5, 0, 0], anchor: [-.4, D.ago / 2, 1] }, ['ghost'], [-1.4, 0, 0], [1, .001, 1])
        ];
      },
      sync: function (ex, S, all, snap) {
        var n = S.n, D = poolD(n), P = ex.parts, d = function (id) { return all || exDone(S, id); }, w1 = d('W1'), w2 = d('W2'), w3 = d('W3'), w4 = d('W4'), w5 = d('W5');
        var a = S.ans.W3a, sub = n.v === 'O' && w4, pr = sub ? n.monthly * 36 : a && a.done && a.val != null ? clamp(a.val, 0, n.evc * 1.4) : n.vp, top = (w2 ? D.evc : 3 * D.sav);
        var o = { parts: [], labels: [], s: 'The value pool, not yet measured. Finish the first exhibit to fill it in.' };
        vis(P.q, !w1); vis(P.ref, w2); vis(P.yr, w1); vis(P.pr, w3); vis(P.kp, w3 && pr < n.evc); vis(P.cs, w3); vis(P.dz, w5);
        vis(P['pr-b'], !sub); vis(P['pr-m'], sub);
        sp3(ex, P['ref-b'], 'scl', 1, w2 ? D.ref : .001, snap);
        [0, 1, 2].forEach(function (j) {
          sp3(ex, P['y' + j], 'pos', 1, !w1 ? 0 : w2 ? D.ref + j * D.dy : j * D.sav, snap);
          sp3(ex, P['y' + j], 'scl', 1, !w1 ? .001 : (w2 ? D.dy : D.sav) - .03, snap);
        });
        sp3(ex, P['pr-b'], 'scl', 1, w3 ? pr * D.k : .001, snap); sp3(ex, P['pr-m'], 'scl', 1, sub ? 1 : .001, snap);
        sp3(ex, P['kp-b'], 'pos', 1, pr * D.k, snap); sp3(ex, P['kp-b'], 'scl', 1, w3 ? Math.max(.001, (n.evc - pr) * D.k) : .001, snap);
        sp3(ex, P['dz-b'], 'scl', 1, w5 ? D.ago : .001, snap);
        P.yr.anchor = [1, top * .75, 1]; P.pr.anchor = [2.4, pr * D.k / 2, 1]; P.kp.anchor = [2.4, (pr * D.k + D.evc) / 2, 1];
        if (w2) pm(ex, o, 'ref', 'Reference value', '$3,000', 'What skirts and low-rolling-resistance tires cost: the customer’s next best option.');
        if (w1) {
          pm(ex, o, 'yr', w2 ? 'Differentiation value' : 'Fuel saved', w2 ? usd(n.diff) + ' over three years' : usd(n.sav) + ' a year',
            w2 ? 'The savings beyond the 4% the alternative already delivers, one block per year.' : Math.round(n.s * 100) + '% of a ' + usd(n.fuel) + ' diesel bill, one block per year.');
          o.labels.push([[.5, top + .12, .5], w2 ? 'Worth ' + usd(n.evc) : usd(n.sav) + ' a year', 't']);
          o.s = w2 ? 'The kit is worth ' + usd(n.evc) + ' to the customer: $3,000 of reference value plus ' + usd(n.diff) + ' of extra savings.' : 'One truck saves ' + usd(n.sav) + ' a year at today’s diesel. Three years stand here, one block each.';
        }
        if (w3) {
          pm(ex, o, 'pr', sub ? 'Your monthly price' : 'Your price', sub ? usd(n.monthly) + ' a month' : usd(pr), sub ? '36 payments of ' + usd(n.monthly) + ', paid out of savings: ' + usd(pr) + ' over three years.' : 'Slipline’s share of the pool' + (w4 ? ', paid once, up front.' : '.'));
          if (pr < n.evc) pm(ex, o, 'kp', 'The customer keeps', usd(n.evc - pr), 'The rest of the value stays with the customer, which is why they buy.');
          pm(ex, o, 'cs', 'Cost to make and install', '$1,800', 'The floor under any price, plus $150 a year of support.');
          o.labels.push([[1.9, pr * D.k + .12, .5], sub ? usd(n.monthly) + ' a month' : 'Your price ' + usd(pr), 't']);
          o.s = pr < n.evc ? 'Your price of ' + usd(pr) + ' gives Slipline ' + pc(100 * pr / n.evc, 0) + ' of the pool and leaves the customer the rest.' : 'Your price, ' + usd(pr) + ', is more than the kit is worth. No rational fleet pays it.';
        }
        if (w4) o.s = sub ? 'Owner-operators pay ' + usd(n.monthly) + ' a month, 36 thin slabs paid out of savings.' : 'Fleets pay once, up front, and it pays back well inside their 18-month rule.';
        if (w5) {
          pm(ex, o, 'dz', 'The same pool a year ago', usd(3000 + (n.s - .04) * n.fuelAgo * 3), 'Diesel was ' + usd(n.ago, 2) + ' a gallon, and the value moves with fuel.');
          o.labels.push([[-.9, D.ago + .12, .5], 'A year ago', 't']);
          o.s = 'The outline on the left is the same pool a year ago, at ' + usd(n.ago, 2) + ' diesel. A fixed price is a bet on fuel.';
        }
        var Y = (!w1 ? 1 : w2 ? Math.max(D.evc, w3 ? pr * D.k : 0) : 3 * D.sav) + .3, x0 = w5 ? -1.6 : -.35, x1 = w3 ? 2.65 : 1.35;
        o.fr = [[x0, -.1, -.3], [x1, Y, 1.3], [x0 - .5, -.1, -.3], [x1 + .6, Y + .5, 1.3]];
        return o;
      } },

    /* your issue tree: the question on top, a slab per branch, sub-questions behind it */
    tree: { id: 'case-tree', t: 'Your issue tree', cam: { yaw: 18, pitch: 50 },
      base: function (p) { var k = p.cards.length, hx = Math.max((k - 1) / 2 * 1.3 + .55, Math.min(k * 1.3, 4.6) / 2); return [-hx - .35, -1.85, hx + .35, 2.1]; },
      d: 'Your tree as you laid it out. Each exhibit you finish tests the branches it belongs to: a confirmed branch lights up, a checked one fades to a hairline.',
      build: function (B, p) {
        var k = p.cards.length, pt = 1.3, r = [], L = [0, 0, -.85, 0, 0, -.45, -(k - 1) / 2 * pt, 0, -.45, (k - 1) / 2 * pt, 0, -.45];
        r.push(B.part('q', { name: 'The question', explode: [0, .7, 0], anchor: [0, .16, -1.2] }, [B.box(0, 0, -1.2, Math.min(k * pt, 4.6), .16, .7)]));
        p.cards.forEach(function (c, i) {
          var x = (i - (k - 1) / 2) * pt, kids = [B.part('t' + i + '-b', {}, [B.box(x, 0, .3, 1.1, .12, .55, { mat: c.trap ? 'ghost' : 'paper' })]),
            B.part('t' + i + '-f', { visible: false }, [B.box(x, 0, .3, 1.1, .12, .55, { mat: 'fs' })])];
          if (c.subs.length) {
            kids.push(B.part('t' + i + '-s', {}, c.subs.map(function (s, j) { return B.box(x, 0, 1 + j * .32, .9, .05, .24, { mat: 'quiet' }); })));
            L.push(x, 0, .575, x, 0, .88 + (c.subs.length - 1) * .32);
          }
          L.push(x, 0, -.45, x, 0, .025);
          r.push(B.part('t' + i, { n: i + 1, anchor: [x, .12, .3] }, [], kids));
        });
        r.push(B.part('wires', { pick: false }, [B.lines(L, { mat: 'dim' })]));
        return r;
      },
      sync: function (ex, S, all, snap) {
        var c = S.c, P = ex.parts, o = { parts: [], labels: [], s: '' }, hit = null, out = 0;
        pm(ex, o, 'q', 'The question', QSHORT[c.id], 'Three to five branches, with no overlaps and no gaps.');
        o.labels.push([[0, .16, -1.2], QSHORT[c.id], 'c q']);
        S.tree.forEach(function (cid, i) {
          var cd = find(c.cards, cid), r = brState(S, cd, all), id = 't' + i;
          twin(P, id, r[0] === 'ok' ? 'f' : 'b');
          sp3(ex, P[id + '-b'], 'pos', 1, r[0] === 'ok' ? .14 : 0, snap); sp3(ex, P[id + '-f'], 'pos', 1, r[0] === 'ok' ? .14 : 0, snap);
          [P[id + '-b'], P[id + '-s']].forEach(function (x) { if (x) x.alpha = r[0] === 'out' ? .3 : 1; });
          if (r[0] === 'ok') hit = [cd, r[2]]; else if (r[0] === 'out') out++;
          pm(ex, o, id, cd.t, r[1], cd.trap || cd.irr || (cd.subs ? uc(cd.subs.join(', ')) + '.' : 'No sub-questions.'));
          o.labels.push([[(i - (S.tree.length - 1) / 2) * 1.3, r[0] === 'ok' ? .26 : .12, .3], (i + 1) + '|' + uc(short(cd)), 'c']);
        });
        o.s = hit ? 'Confirmed: ' + lc(short(hit[0])) + ', by ' + hit[1] + '.' + (out ? ' ' + out + ' more ' + F.plural(out, 'branch', 'branches') + ' checked and set aside.' : '')
          : out ? out + ' of ' + S.tree.length + ' branches checked and set aside. The answer is in another one.' : 'Finish an exhibit to test the branches it belongs to.';
        return o;
      } }
  };
  function groD(n) {
    var D = { N: Math.round(n.stores), W: n.H * .26, Z: 1.2, cols: 14, r: .1, k: .0015, sh: [.58, .27, .09, .06], g: n.EV + 168 };
    D.hx = D.r * Math.sqrt(3); D.z0 = D.Z + .5; D.rows = Math.ceil(D.N / D.cols); D.lx = D.cols * D.hx + .4; D.lz = D.z0 + D.rows * .075;
    D.xs = [0, .58, .85, .94].map(function (x) { return x * D.W; });
    D.hc = function (i) { var r = Math.floor(i / D.cols); return [(i % D.cols) * D.hx + (r % 2) * D.hx / 2 + D.r, D.z0 + r * D.r * 1.5]; };
    return D;
  }
  function hex(B, c, r, mat) {
    var pts = [];
    for (var j = 0; j < 6; j++) { var a = (60 * j + 30) * Math.PI / 180; pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); }
    return B.prism(pts, 0, 1, { mat: mat || 'paper' });
  }
  function vetCols(n) {
    var c = [['rep', 0, n.rep], ['acq', n.rep, n.acq]], b = n.rep + n.acq;
    if (n.rec) { c.push(['rec', b, n.rec]); b += n.rec; }
    c.push(['pf', b, n.pf], ['adj', 0, 30], ['rr', 0, n.rr]);
    return c;
  }
  function poolD(n) {
    var k = .00018;
    return { k: k, sav: n.sav * k, ref: 3000 * k, dy: n.diff / 3 * k, evc: n.evc * k, ago: (3000 + (n.s - .04) * n.fuelAgo * 3) * k, cost: 1800 * k };
  }
  function PS3D_R() { return !!(window.PS3D && window.PS3D.reduced()); }
  /* which branch an exhibit tests: candidate-led cases list it on the exhibit, interviewer-led ones by the bucket it fills */
  var IMAP = { grocer: { Y1: 'market', Y2: 'comp', Y3: 'econ', Y4: 'mode', Y5: 'comp' }, freight: { W1: 'value', W2: 'alt', W3: 'model', W4: 'cust', W5: 'model' } };
  function brState(S, cd, all) {
    if (cd.trap || cd.irr) return ['trap', 'Not a branch of this problem'];
    var c = S.c, root = c.root[S.v], m = IMAP[c.id], seen = [], hit = null;
    c.ex.forEach(function (ex) {
      var rel = m ? !!cd.cov && m[ex.id] === cd.cov : ex.inn !== '*' && has(ex.inn || [], cd.id);
      if (!rel || !(all || exDone(S, ex.id))) return;
      if (ex.id === root) hit = ex; else seen.push(ex);
    });
    if (hit) return ['ok', 'Confirmed by ' + hit.nm, hit.nm];
    if (seen.length) return ['out', 'Checked by ' + seen[0].nm];
    return ['open', 'Not tested yet'];
  }

  /* the lobby's four drawings, printed by the engine at rest (PS3D.debug.poster, a paper model on its board) and kept here so
     the cover's first frame is already drawn. Faces print in the poster tone classes; the live part prints in cs-f* (foil). */
  var POSTER = {
    cinema: [720, 480, '<defs><clipPath id="p135c0"><path d="m277.5 162.4l381.2 149-216.2 138.3-381.2-148.9z"/></clipPath><clipPath id="p135c1"><path d="m308.9 202.9l264 103.2-124.5 79.7-264.1-103.2z"/></clipPath><clipPath id="p135c2"><path d="m308.9 56.2l264 103.1-124.5 79.8-264.1-103.2z"/></clipPath><clipPath id="p135k"><path d="m277.5 162.4l381.2 148.9-216.2 138.4-381.2-149z"/></clipPath><filter id="p135b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"></feGaussianBlur></filter><filter id="p135b4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"></feGaussianBlur></filter><filter id="p135b5" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"></feGaussianBlur></filter><filter id="p135b7" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"></feGaussianBlur></filter><filter id="p135b23" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="23"></feGaussianBlur></filter></defs><g data-part="board" style="--i:0"><path class="p-plaster" d="m61.3 300.8l381.2 149 216.2-138.4-381.2-148.9z"/><path class="p-right" d="m61.3 308.8l381.2 148.9 0-7.9-381.2-149zm381.2 148.9l216.2-138.4 0-7.9-216.2 138.4z"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.24" d="m442.5 457.7l216.2-138.4m-216.2 138.4l-381.2-148.9"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.21" d="m658.7 319.3l0-7.9m-597.4-2.6l0-8"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.10" d="m658.7 311.4l-216.2 138.4m-381.2-149l381.2 149"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.11" d="m442.5 449.8l0 7.9"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.17" d="m61.3 300.8l216.2-138.3"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.18" d="m658.7 311.4l-381.2-148.9"/></g><g><path class="p-shadow" opacity="0.394" filter="url(#p135b7)" d="m279.3 168.7l385.4 150.5-219.4 140.4-385.4-150.5z"/></g><g clip-path="url(#p135k)"><g opacity="0.229" filter="url(#p135b2)"><path class="p-shadow" d="m186.9 287.3l264.1 103.2 124.5-79.8-264-103.1zm-2.3-.1l264.1 103.1 2.3 .2-264.1-103.2zm264.1 103.1l124.5-79.7 2.3 .1-124.5 79.8zm-176.4-97.9l264.1 103.1 124.5-79.7-264-103.2zm-85.4-5.1l264.1 103.2 85.4 5-264.1-103.1zm264.1 103.2l124.5-79.8 85.4 5.1-124.5 79.7zm-158.7-96.9l264.1 103.1 124.6-79.7-264.1-103.2zm-20-1.2l264.1 103.1 20 1.2-264.1-103.1zm264.1 103.1l124.5-79.7 20.1 1.2-124.6 79.7z"/></g></g><g data-part="fp" style="--i:1"><g clip-path="url(#p135c0)"><path class="p-shadow" opacity="0.394" filter="url(#p135b4)" d="m310 206.3l266.5 104.2-126.5 80.9-266.6-104.1z"/></g><g clip-path="url(#p135c1)"><path class="p-shadow" opacity="0.394" filter="url(#p135b23)" d="m349.4 199.2l278.1 108.6-135.5 86.7-278.1-108.6z"/></g><g clip-path="url(#p135c2)"><path class="p-shadow" opacity="0.394" filter="url(#p135b5)" d="m318.4 55.3l267.3 104.4-127.1 81.4-267.4-104.4z"/></g><path class="p-top" d="m184.3 282.7l264.1 103.1 124.5-79.7-264-103.1z"/><path class="p-left" d="m184.3 286.6l264.1 103.2 0-4-264.1-103.1z"/><path class="p-right" d="m448.4 389.8l124.5-79.7 0-4-124.5 79.7z"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.46" d="m448.4 389.8l124.5-79.7"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.42" d="m572.9 310.1l0-4"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.20" d="m572.9 306.1l-124.5 79.7"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.21" d="m448.4 385.8l0 4"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.40" d="m184.3 286.6l0-3.9"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.36" d="m184.3 282.7l124.6-79.7"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.19" d="m184.3 282.7l264.1 103.1"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.37" d="m572.9 306.1l-264-103.1"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.45" d="m448.4 389.8l-264.1-103.2"/></g><g data-part="fx" style="--i:2"><path class="p-top" d="m184.3 135.9l264.1 103.2 124.5-79.7-264-103.2z"/><path class="p-left" d="m184.3 282.7l264.1 103.1 0-146.7-264.1-103.2z"/><path class="p-right" d="m448.4 385.8l124.5-79.7 0-146.7-124.5 79.7z"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.77" d="m448.4 385.8l124.5-79.7"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.75" d="m572.9 306.1l0-146.7m-124.5 226.4l-264.1-103.1"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.35" d="m572.9 159.4l-124.5 79.7m-264.1-103.2l264.1 103.2"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.36" d="m448.4 239.1l0 146.7"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.71" d="m184.3 282.7l0-146.8"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.68" d="m184.3 135.9l124.6-79.7"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.70" d="m572.9 159.4l-264-103.2"/></g><g data-part="op" style="--i:3"><path class="cs-ft" d="m184.3 101.5l264.1 103.2 124.5-79.7-264-103.2z"/><path class="cs-fl" d="m184.3 135.9l264.1 103.2 0-34.4-264.1-103.2z"/><path class="cs-fr" d="m448.4 239.1l124.5-79.7 0-34.4-124.5 79.7z"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.84" d="m448.4 239.1l124.5-79.7"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.79" d="m572.9 159.4l0-34.4"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.36" d="m572.9 125l-124.5 79.7"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.37" d="m448.4 204.7l0 34.4"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.76" d="m184.3 135.9l0-34.4"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.70" d="m184.3 101.5l124.6-79.7"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.35" d="m184.3 101.5l264.1 103.2"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.72" d="m572.9 125l-264-103.2"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.83" d="m448.4 239.1l-264.1-103.2"/></g>'],
    grocer: [720, 480, '<defs><clipPath id="p24chc0"><path d="m327.2 82l164.3 77.1-95.4 63.6-164.3-77.1z"/></clipPath><clipPath id="p24chc1"><path d="m318.8 49.5l368.5 172.9-286.1 190.6-368.5-172.9z"/></clipPath><clipPath id="p24chc2"><path d="m318.8 49.5l368.5 172.9-286.1 190.6-368.5-172.9z"/></clipPath><clipPath id="p24chc3"><path d="m318.8 49.5l368.5 172.9-286.1 190.6-368.5-172.9z"/></clipPath><clipPath id="p24chc4"><path d="m318.8 49.5l368.5 172.9-286.1 190.6-368.5-172.9z"/></clipPath><clipPath id="p24chc5"><path d="m318.8 49.5l368.5 172.9-286.1 190.6-368.5-172.9z"/></clipPath><clipPath id="p24chk"><path d="m318.8 49.4l368.5 172.9-286.1 190.7-368.5-172.9z"/></clipPath><filter id="p24chb1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1"></feGaussianBlur></filter><filter id="p24chb2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"></feGaussianBlur></filter><filter id="p24chb4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"></feGaussianBlur></filter><filter id="p24chb5" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"></feGaussianBlur></filter><filter id="p24chb6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"></feGaussianBlur></filter><filter id="p24chb8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"></feGaussianBlur></filter></defs><g data-part="board" style="--i:0"><path class="p-plaster" d="m32.7 240.2l368.5 172.9 286.1-190.7-368.5-172.9z"/><path class="p-right" d="m401.2 421.3l286.1-190.7 0-8.2-286.1 190.7zm-368.5-172.9l368.5 172.9 0-8.2-368.5-172.9z"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.24" d="m401.2 421.3l286.1-190.7"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.21" d="m687.3 230.6l0-8.2m-654.6 26l0-8.2"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.10" d="m687.3 222.4l-286.1 190.7m-368.5-172.9l368.5 172.9"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.11" d="m401.2 413.1l0 8.2"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.18" d="m32.7 240.2l286.1-190.7"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.17" d="m687.3 222.4l-368.5-172.9"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.25" d="m401.2 421.3l-368.5-172.9"/></g><g><path class="p-shadow" opacity="0.394" filter="url(#p24chb8)" d="m320.8 55.4l373.6 175.3-290.4 193.5-373.6-175.3z"/></g><g clip-path="url(#p24chk)"><g opacity="0.229" filter="url(#p24chb2)"><path class="p-shadow" d="m121.7 244.5l113-77.5 105.4-62.1 3.7 .6 5.7 2.6 319.2 151-95.3 63.6-183.5 27.7-11.2-1.1-19.7-2.8-135-49.8-32.8-15.4-16.4-7.7-49.2-23.1zm282.7 100.8l26.5-4.9 16.3 1.6 5.7 8.8-10.7 7.1-16.3-1.6-15.8-2.3z"/></g></g><g data-part="sh" style="--i:1"><g clip-path="url(#p24chc0)"><path class="p-shadow" opacity="0.394" filter="url(#p24chb1)" d="m329 82l6.2 2.9-95.8 63.9-6.3-2.9z"/></g><path class="cs-fr" d="m237.5 148.3l95.4-63.6 0-6.1-95.4 63.5z"/><path class="cs-ft" d="m231.8 139.5l5.7 2.6 95.4-63.5-5.7-2.7z"/><path class="cs-fl" d="m231.8 145.6l5.7 2.7 0-6.2-5.7-2.6z"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.59" d="m237.5 148.3l95.4-63.6m-101.1 54.8l95.4-63.6"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.56" d="m332.9 84.7l0-6.1m0 0l-5.7-2.7"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.25" d="m332.9 78.6l-95.4 63.5"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.27" d="m237.5 142.1l0 6.2m-5.7-8.8l5.7 2.6"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.63" d="m231.8 145.6l0-6.1m5.7 8.8l-5.7-2.7"/></g><g data-part="m0" style="--i:2"><g clip-path="url(#p24chc1)"><path class="p-shadow" opacity="0.377" filter="url(#p24chb4)" d="m334 102.8l166.7 78.2-97.5 64.9-166.7-78.2z"/></g><path class="p-top" d="m231.8 145.6l164.3 77.1 95.4-63.6-164.3-77z"/><path class="p-left" d="m231.8 162l164.3 77.1 0-16.4-164.3-77.1z"/><path class="p-right" d="m396.1 239.1l95.4-63.6 0-16.4-95.4 63.6z"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.68" d="m396.1 239.1l95.4-63.6"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.64" d="m491.5 175.5l0-16.4"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.29" d="m491.5 159.1l-95.4 63.6m-164.3-77.1l164.3 77.1"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.31" d="m396.1 222.7l0 16.4"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.63" d="m231.8 162l0-16.4"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.59" d="m231.8 145.6l95.4-63.5"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.60" d="m491.5 159.1l-164.3-77"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.67" d="m396.1 239.1l-164.3-77.1"/></g><g data-part="m1" style="--i:3"><g clip-path="url(#p24chc2)"><path class="p-shadow" opacity="0.359" filter="url(#p24chb4)" d="m513.4 187l78.8 37-97.3 64.9-78.9-37z"/></g><path class="p-top" d="m411.3 229.8l76.4 35.9 95.4-63.6-76.5-35.8z"/><path class="p-right" d="m487.7 282.1l95.4-63.6 0-16.4-95.4 63.6z"/><path class="p-left" d="m411.3 246.2l76.4 35.9 0-16.4-76.4-35.9z"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.74" d="m487.7 282.1l95.4-63.6m-171.8 27.7l0-16.4"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.70" d="m583.1 218.5l0-16.4m-171.8 27.7l95.3-63.5"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.32" d="m583.1 202.1l-95.4 63.6m-76.4-35.9l76.4 35.9"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.33" d="m487.7 265.7l0 16.4"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.68" d="m583.1 202.1l-76.5-35.8"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.76" d="m487.7 282.1l-76.4-35.9"/></g><g data-part="m2" style="--i:4"><g clip-path="url(#p24chc3)"><path class="p-shadow" opacity="0.339" filter="url(#p24chb4)" d="m605 230l27.8 13.1-97.3 64.8-27.9-13z"/></g><path class="p-top" d="m502.9 272.8l25.5 12 95.3-63.6-25.5-12z"/><path class="p-right" d="m528.4 301.2l95.3-63.6 0-16.4-95.3 63.6z"/><path class="p-left" d="m502.9 289.2l25.5 12 0-16.4-25.5-12z"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.76" d="m528.4 301.2l95.3-63.6m-120.8 35.2l95.3-63.6"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.73" d="m623.7 237.6l0-16.4"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.33" d="m623.7 221.2l-95.3 63.6"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.34" d="m528.4 284.8l0 16.4m-25.5-28.4l25.5 12"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.79" d="m502.9 289.2l0-16.4m25.5 28.4l-25.5-12"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.72" d="m623.7 221.2l-25.5-12"/></g><g data-part="st" style="--i:5"><g clip-path="url(#p24chc4)"><path class="p-shadow" opacity="0.379" filter="url(#p24chb6)" d="m212.6 188.8l240.5 112.8-89.4 59.6-240.5-112.8z"/></g><path class="p-top cs-edge" d="m194.3 197.8l-3.9-5.9 0-32.3 3.9 5.9zm11.2-31.2l-11.2-1.1-3.9-5.9 7.3-4.9 11.2 1.1 3.9 6zm5.2 38.9l-3.9-6 0-32.2 3.9 5.9zm-20.1 4.1l-3.9-6 0-32.2 3.9 5.9zm31.3-35.3l-11.2-1.1-3.9-5.9 7.3-4.9 11.2 1.1 3.9 6zm5.2 38.9l-3.9-6 0-32.2 3.9 5.9zm-56.7 .5l-3.9-6 0-32.2 3.9 5.9zm31.4-35.3l-11.2-1.1-3.9-5.9 7.3-4.9 11.2 1.1 3.9 6zm5.2 38.9l-3.9-6 0-32.2 3.9 5.9zm31.3-35.3l-11.2-1.1-3.9-5.9 7.3-4.9 11.2 1.1 3.9 6zm-56.7 .5l-11.2-1.1-3.9-5.9 7.3-4.9 11.3 1.1 3.8 6zm61.9 38.4l-3.9-6 0-32.2 3.9 5.9zm-56.7 .5l-3.9-6 0-32.2 3.9 5.9zm31.4-35.3l-11.2-1.1-3.9-5.9 7.3-4.9 11.2 1.1 3.9 6zm5.2 38.9l-3.9-6 0-32.2 3.9 5.9zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm88-35.8l-11.2-1.1-3.9-5.9 7.3-4.9 11.2 1.1 3.9 6zm-56.7 .5l-11.2-1.1-3.9-5.9 7.4-4.9 11.2 1.1 3.8 6zm61.9 38.4l-3.9-6 0-32.2 3.9 5.9zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm88-35.8l-11.2-1.1-3.9-5.9 7.3-4.9 11.2 1.1 3.9 6zm-56.7 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 6zm61.9 38.4l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm88-35.8l-11.2-1.1-3.9-5.9 7.3-4.9 11.2 1.1 3.9 6zm-56.7 .5l-11.2-1.1-3.9-6 7.4-4.8 11.2 1.1 3.9 6zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 6zm118.5 37.9l-3.9-6 0-32.2 3.9 5.9zm-56.7 .5l-3.8-6 0-32.3 3.8 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm88-35.8l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 6zm-56.7 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 6zm61.9 38.4l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm144.6-36.3l-11.2-1.1-3.9-5.9 7.3-4.9 11.2 1.1 3.9 6zm-56.7 .5l-11.2-1.1-3.8-6 7.3-4.8 11.2 1.1 3.9 6zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm118.5 37.9l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.8-6 0-32.3 3.8 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.8-6 0-32.3 3.8 6zm144.7-36.3l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 6zm-56.7 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm118.5 37.9l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm144.6-36.3l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 6zm-56.7 .5l-11.2-1.1-3.8-6 7.3-4.8 11.2 1.1 3.9 6zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.7 .5l-11.2-1.1-3.8-6 7.3-4.8 11.2 1.1 3.9 5.9zm175.2 37.4l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.8-6 0-32.3 3.8 6zm144.7-36.3l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 6zm-56.7 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm118.5 37.9l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm144.6-36.3l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 6zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.7 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.6 .5l-11.3-1.1-3.8-6 7.3-4.8 11.2 1.1 3.9 5.9zm175.1 37.4l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm144.6-36.3l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 6zm-56.7 .5l-11.2-1.1-3.9-6 7.4-4.8 11.2 1.1 3.8 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm118.5 37.9l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm144.6-36.3l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 6zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.7 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm175.1 37.4l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm144.6-36.3l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.7 .5l-11.2-1.1-3.9-6 7.4-4.8 11.2 1.1 3.8 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm118.5 37.9l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm144.6-36.3l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 6zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.7 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm175.1 37.4l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm144.6-36.3l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.7 .5l-11.2-1.1-3.9-6 7.4-4.8 11.2 1.1 3.9 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm118.5 37.9l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.8-6 0-32.3 3.8 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm144.6-36.3l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.7 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.9 11.2 1.2 3.9 5.9zm175.1 37.4l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm144.6-36.3l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.7 .5l-11.2-1.1-3.8-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.9 11.2 1.2 3.9 5.9zm118.5 37.9l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.8-6 0-32.3 3.8 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm144.6-36.3l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.7 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.9 11.2 1.2 3.9 5.9zm175.1 37.4l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm144.6-36.3l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.6 .5l-11.3-1.1-3.8-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.7 .5l-11.2-1.1-3.9-6 7.3-4.9 11.2 1.2 3.9 5.9zm118.5 37.9l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm144.6-36.3l-11.2-1.1-3.9-6 7.4-4.8 11.2 1.1 3.8 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.7 .5l-11.2-1.1-3.9-6 7.3-4.9 11.2 1.2 3.9 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.9 11.2 1.1 3.9 6zm175.1 37.4l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm88-35.8l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.7 .5l-11.2-1.1-3.9-6 7.3-4.9 11.2 1.1 3.9 6zm118.5 37.9l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm144.6-36.3l-11.2-1.1-3.9-6 7.4-4.8 11.2 1.1 3.8 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.7 .5l-11.2-1.1-3.9-6 7.4-4.9 11.2 1.2 3.8 5.9zm61.9 38.4l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm88-35.8l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.9 11.2 1.2 3.9 5.9zm-56.7 .5l-11.2-1.1-3.9-6 7.3-4.9 11.2 1.1 3.9 6zm118.5 37.9l-3.9-6 0-32.3 3.9 6zm-56.6 .5l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm88-35.8l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.7 .5l-11.2-1.1-3.9-6 7.4-4.9 11.2 1.1 3.8 6zm61.9 38.4l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm88-35.8l-11.2-1.1-3.9-6 7.3-4.8 11.2 1.1 3.9 5.9zm-56.6 .5l-11.2-1.1-3.9-6 7.3-4.9 11.2 1.2 3.9 5.9zm-56.7 .5l-11.2-1.1-3.9-6 7.3-4.9 11.2 1.1 3.9 6zm61.9 38.4l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm88-35.8l-11.2-1.1-3.9-6 7.3-4.9 11.2 1.2 3.9 5.9zm-56.7 .5l-11.2-1.1-3.9-6 7.4-4.9 11.2 1.1 3.9 6zm5.2 38.9l-3.8-6 0-32.3 3.8 6zm31.4-35.3l-11.2-1.1-3.9-6 7.3-4.9 11.2 1.1 3.9 6zm-56.7 .5l-11.2-1.1-3.9-6 7.3-4.9 11.2 1.1 3.9 6zm61.9 38.4l-3.9-6 0-32.3 3.9 6zm-56.7 .5l-3.9-6 0-32.3 3.9 6zm31.3-35.3l-11.2-1.1-3.8-6 7.3-4.9 11.2 1.1 3.9 6zm5.2 38.9l-3.8-6 0-32.3 3.8 6zm31.4-35.3l-11.2-1.1-3.9-6 7.3-4.9 11.2 1.1 3.9 6zm-56.7 .5l-11.2-1.1-3.9-6 7.3-4.9 11.2 1.1 3.9 6zm5.2 38.9l-3.9-6 0-32.3 3.9 6zm31.4-35.3l-11.3-1.1-3.8-6 7.3-4.9 11.2 1.1 3.9 6zm-20.2 4.1l-11.2-1.1-3.9-6 7.3-4.9 11.2 1.1 3.9 6zm5.2 38.9l-3.9-6 0-32.3 3.9 6zm11.2-31.2l-11.2-1.1-3.9-6 7.4-4.9 11.2 1.1 3.8 6z"/><path class="p-right cs-edge" d="m212.8 194.1l-7.3 4.8 0-32.3 7.3-4.8zm-7.3 4.8l-11.2-1.1 0-32.3 11.2 1.1zm23.7 2.9l-7.3 4.8 0-32.3 7.3-4.8zm-7.3 4.8l-11.2-1.1 0-32.3 11.2 1.1zm-12.8-.7l-7.3 4.8 0-32.3 7.3-4.8zm-7.3 4.8l-11.2-1.1 0-32.3 11.2 1.1zm43.8-1.2l-7.3 4.8 0-32.3 7.3-4.8zm-56.7 .4l-7.3 4.9 0-32.3 7.3-4.8zm49.4 4.4l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm43.9-1.2l-7.3 4.8 0-32.3 7.3-4.8zm-7.3 4.8l-11.2-1.1 0-32.3 11.2 1.1zm43.8-1.2l-7.3 4.8 0-32.3 7.3-4.8zm-56.7 .4l-7.3 4.9 0-32.3 7.3-4.8zm49.4 4.4l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm43.9-1.3l-7.3 4.9 0-32.3 7.3-4.8zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.8zm49.4 4.4l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm100.5-1.7l-7.3 4.8 0-32.3 7.3-4.8zm-56.6 .4l-7.4 4.9 0-32.3 7.4-4.8zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.8zm106 3.9l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm100.5-1.8l-7.3 4.9 0-32.3 7.3-4.8zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.8zm49.4 4.4l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm100.5-1.8l-7.3 4.9 0-32.3 7.3-4.8zm-56.6 .5l-7.4 4.9 0-32.3 7.4-4.8zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm106 3.9l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm100.5-1.8l-7.3 4.9 0-32.3 7.3-4.8zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm106 3.9l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm157.1-2.3l-7.3 4.9 0-32.3 7.3-4.8zm-56.6 .5l-7.4 4.9 0-32.3 7.4-4.8zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.4 4.9 0-32.3 7.4-4.9zm162.6 3.4l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm157.2-2.3l-7.3 4.9 0-32.3 7.3-4.8zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm106 3.9l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm157.1-2.3l-7.3 4.9 0-32.3 7.3-4.8zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm162.6 3.4l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.3-1.1 0-32.3 11.3 1.1zm157.1-2.3l-7.3 4.9 0-32.3 7.3-4.8zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm106 3.9l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm157.1-2.3l-7.3 4.9 0-32.3 7.3-4.8zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm162.6 3.4l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm157.1-2.3l-7.3 4.9 0-32.3 7.3-4.9zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm106 3.9l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm157.1-2.3l-7.3 4.9 0-32.3 7.3-4.8zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm162.6 3.4l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm157.1-2.3l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.4 4.9 0-32.3 7.4-4.9zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm106 3.9l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm157.1-2.3l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm162.6 3.4l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm157.1-2.3l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.4 4.9 0-32.3 7.4-4.9zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm106 3.9l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm157.1-2.3l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm162.6 3.4l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm157.1-2.3l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm106 3.9l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.3-1.1 0-32.3 11.3 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm157.1-2.3l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm162.6 3.4l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm157.1-2.3l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm106 3.9l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm157.1-2.3l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm106 3.9l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm100.5-1.8l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm106 3.9l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm100.5-1.8l-7.3 4.9 0-32.3 7.3-4.9zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm49.4 4.4l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm100.5-1.8l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.3 4.9 0-32.3 7.3-4.9zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm106 3.9l-11.2-1.1 0-32.3 11.2 1.1zm-56.6 .5l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm100.5-1.8l-7.3 4.9 0-32.3 7.3-4.9zm-56.6 .5l-7.4 4.9 0-32.3 7.4-4.9zm49.3 4.4l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm43.9-1.3l-7.3 4.9 0-32.3 7.3-4.9zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm49.4 4.4l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm43.9-1.3l-7.4 4.9 0-32.3 7.4-4.9zm-7.4 4.9l-11.2-1.1 0-32.3 11.2 1.1zm43.9-1.3l-7.3 4.9 0-32.3 7.3-4.9zm-56.7 .5l-7.3 4.9 0-32.3 7.3-4.9zm49.4 4.4l-11.2-1.1 0-32.3 11.2 1.1zm-56.7 .5l-11.2-1.1 0-32.3 11.2 1.1zm43.9-1.3l-7.3 4.9 0-32.3 7.3-4.9zm-7.3 4.9l-11.3-1.1 0-32.3 11.3 1.1zm-12.9-.8l-7.3 4.9 0-32.3 7.3-4.9zm-7.3 4.9l-11.2-1.1 0-32.3 11.2 1.1zm23.7 2.8l-7.3 4.9 0-32.3 7.3-4.9zm-7.3 4.9l-11.2-1.1 0-32.3 11.2 1.1z"/></g><g data-part="m3" style="--i:6"><path class="p-top" d="m543.5 291.9l17 7.9 95.4-63.5-17-8z"/><path class="p-right" d="m560.5 316.2l95.4-63.5 0-16.4-95.4 63.5z"/><path class="p-left" d="m543.5 308.3l17 7.9 0-16.4-17-7.9z"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.78" d="m560.5 316.2l95.4-63.5m-112.4 39.2l95.4-63.6"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.75" d="m655.9 252.7l0-16.4"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.33" d="m655.9 236.3l-95.4 63.5"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.35" d="m560.5 299.8l0 16.4m-17-24.3l17 7.9"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.81" d="m543.5 308.3l0-16.4m17 24.3l-17-7.9"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.74" d="m655.9 236.3l-17-8"/></g><g data-part="lg" style="--i:7"><g clip-path="url(#p24chc5)"><path class="p-shadow" opacity="0.371" filter="url(#p24chb5)" d="m427 333.9l25.3 11.8-24.1 16.1-25.2-11.9z"/></g><path class="p-top" d="m407.3 349l-5.7-8.8 0-25.8 5.7 8.7zm16.3-24.3l-16.3-1.6-5.7-8.7 10.7-7.1 16.3 1.6 5.7 8.7z"/><path class="p-right" d="m434.3 343.5l-10.7 7.1 0-25.9 10.7-7.1zm-10.7 7.1l-16.3-1.6 0-25.9 16.3 1.6z"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.36" d="m423.6 324.7l-16.3-1.6m0 0l-5.7-8.7m32.7 3.2l-10.7 7.1m-16.3 24.3l0-25.9m16.3 1.6l0 25.9"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.85" d="m401.6 314.4l10.7-7.1m0 0l16.3 1.6m0 0l5.7 8.7m-10.7 33l-16.3-1.6m0 0l-5.7-8.8m32.7 3.3l-10.7 7.1m-22-10.4l0-25.8m32.7 29.1l0-25.9"/></g>'],
    vet: [720, 480, '<defs><clipPath id="p376gc0"><path d="m170.7 256.6l489.9 115-111.3 78.5-489.9-115.1z"/></clipPath><clipPath id="p376gc1"><path d="m170.7 256.6l489.9 115-111.3 78.5-489.9-115.1z"/></clipPath><clipPath id="p376gc2"><path d="m170.7 256.6l489.9 115-111.3 78.5-489.9-115.1z"/></clipPath><clipPath id="p376gk"><path d="m170.7 256.5l489.9 115.1-111.3 78.4-489.9-115z"/></clipPath><filter id="p376gb2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"></feGaussianBlur></filter><filter id="p376gb4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"></feGaussianBlur></filter><filter id="p376gb24" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24"></feGaussianBlur></filter></defs><g data-part="board" style="--i:0"><path class="p-plaster" d="m59.4 335.1l489.9 115 111.3-78.4-489.9-115.1z"/><path class="p-right" d="m59.4 342.7l489.9 115 0-7.6-489.9-115zm489.9 115l111.3-78.4 0-7.6-111.3 78.4z"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.23" d="m549.3 457.7l111.3-78.4"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.21" d="m660.6 379.3l0-7.6"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.10" d="m660.6 371.7l-111.3 78.4"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.11" d="m549.3 450.1l0 7.6"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.19" d="m59.4 342.7l0-7.6"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.17" d="m59.4 335.1l111.3-78.5"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.09" d="m59.4 335.1l489.9 115"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.18" d="m660.6 371.7l-489.9-115.1"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.22" d="m549.3 457.7l-489.9-115"/></g><g><path class="p-shadow" opacity="0.394" filter="url(#p376gb4)" d="m172.2 263.2l492.8 115.7-113 79.6-492.8-115.7z"/></g><g clip-path="url(#p376gk)"><g opacity="0.229" filter="url(#p376gb2)"><path class="p-shadow" d="m209.5 340.7l62.3-43.9 141.1-5.1-62.3 43.9zm-62.9-14.8l62.9 14.8 141.1-5.1-62.9-14.8zm141.1-5.1l62.9 14.8 62.3-43.9-62.9-14.8zm88 19.9l62.9 14.8 62.3-43.9-62.9-14.7zm60.3 14.9l62.3-43.9 2.6-.1-62.3 43.9zm-62.9-14.8l62.9 14.8 2.6-.1-62.9-14.8zm92.6 60l62.3-43.8 156.8-5.7-62.3 43.9zm-62.9-14.7l62.9 14.7 156.8-5.6-62.9-14.8zm156.8-5.7l62.9 14.8 62.3-43.9-63-14.8zm-85.4-20.1l62.9 14.8 62.3-43.9-62.9-14.7zm49.8 15.3l62.3-43.9 13.1-.5-62.3 43.9zm-62.9-14.8l62.9 14.8 13.1-.5-62.9-14.8zm90 60.1l62.2-43.9 156.9-5.7-62.3 43.9zm-63-14.8l63 14.8 156.8-5.7-62.9-14.8zm156.9-5.7l62.9 14.8 62.3-43.9-63-14.7z"/></g></g><g data-part="rep" style="--i:1"><g clip-path="url(#p376gc0)"><path class="p-shadow" opacity="0.394" filter="url(#p376gb24)" d="m272.6 271.1l89.1 20.9-77.4 54.5-89.1-20.9z"/></g><path class="p-right" d="m207.1 336.5l62.3-43.9 0-256-62.3 43.9z"/><path class="p-left" d="m144.2 321.7l62.9 14.8 0-256-62.9-14.8z"/><path class="p-top" d="m144.2 65.7l62.9 14.8 62.3-43.9-62.9-14.8z"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.61" d="m207.1 336.5l62.3-43.9m0 0l0-256"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.30" d="m269.4 36.6l-62.3 43.9"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.29" d="m207.1 80.5l0 256"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.67" d="m144.2 321.7l0-256"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.68" d="m144.2 65.7l62.3-43.9"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.31" d="m144.2 65.7l62.9 14.8"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.65" d="m269.4 36.6l-62.9-14.8"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.63" d="m207.1 336.5l-62.9-14.8"/></g><g data-part="acq" style="--i:2"><path class="p-top" d="m229.6 81l62.9 14.8 62.3-43.9-62.9-14.8z"/><path class="p-right" d="m292.5 100.5l62.3-43.9 0-4.7-62.3 43.9z"/><path class="p-left" d="m229.6 85.7l62.9 14.8 0-4.7-62.9-14.8z"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.74" d="m292.5 100.5l62.3-43.9"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.70" d="m354.8 56.6l0-4.7"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.32" d="m354.8 51.9l-62.3 43.9"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.33" d="m292.5 95.8l0 4.7m-62.9-19.5l62.9 14.8"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.76" d="m229.6 85.7l0-4.7"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.72" d="m229.6 81l62.3-43.9"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.69" d="m354.8 51.9l-62.9-14.8"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.77" d="m292.5 100.5l-62.9-14.8"/></g><g data-part="adj" style="--i:3"><g clip-path="url(#p376gc1)"><path class="p-shadow" opacity="0.394" filter="url(#p376gb24)" d="m535.9 330l92 21.6-79 55.7-92-21.6z"/></g><path class="p-right" d="m463.3 396.6l62.3-43.8 0-284.5-62.3 43.9z"/><path class="p-left" d="m400.4 381.9l62.9 14.7 0-284.4-62.9-14.8z"/><path class="p-top" d="m400.4 97.4l62.9 14.8 62.3-43.9-62.9-14.8z"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.72" d="m463.3 396.6l62.3-43.8"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.74" d="m525.6 352.8l0-284.5"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.35" d="m525.6 68.3l-62.3 43.9"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.34" d="m463.3 112.2l0 284.4"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.79" d="m400.4 381.9l0-284.5"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.80" d="m400.4 97.4l62.3-43.9"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.36" d="m400.4 97.4l62.9 14.8"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.78" d="m525.6 68.3l-62.9-14.8"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.75" d="m463.3 396.6l-62.9-14.7"/></g><g data-part="pf" style="--i:4"><path class="p-top" d="m315 77.4l62.9 14.7 62.3-43.8-62.9-14.8z"/><path class="p-right" d="m377.9 115.8l62.3-43.8 0-23.7-62.3 43.8z"/><path class="p-left" d="m315 101.1l62.9 14.7 0-23.7-62.9-14.7z"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.78" d="m377.9 115.8l62.3-43.8"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.75" d="m440.2 72l0-23.7"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.33" d="m440.2 48.3l-62.3 43.8"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.35" d="m377.9 92.1l0 23.7"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.80" d="m315 101.1l0-23.7"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.77" d="m315 77.4l62.3-43.9"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.34" d="m315 77.4l62.9 14.7"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.74" d="m440.2 48.3l-62.9-14.8"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.81" d="m377.9 115.8l-62.9-14.7"/></g><g data-part="rr" style="--i:5"><g clip-path="url(#p376gc2)"><path class="p-shadow" opacity="0.394" filter="url(#p376gb24)" d="m621.3 350.1l92 21.6-79 55.7-92-21.6z"/></g><path class="cs-fr" d="m548.7 416.7l62.3-43.9 0-284.4-62.3 43.8z"/><path class="cs-fl" d="m485.8 401.9l62.9 14.8 0-284.5-62.9-14.7z"/><path class="cs-ft" d="m485.8 117.5l62.9 14.7 62.3-43.8-62.9-14.8z"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.76" d="m548.7 416.7l62.3-43.9"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.77" d="m611 372.8l0-284.4"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.36" d="m611 88.4l-62.3 43.8m0 0l0 284.5"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.82" d="m485.8 401.9l0-284.4"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.83" d="m485.8 117.5l62.3-43.9"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.37" d="m485.8 117.5l62.9 14.7"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.81" d="m611 88.4l-62.9-14.8"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.79" d="m548.7 416.7l-62.9-14.8"/></g>'],
    freight: [720, 480, '<defs><clipPath id="p4u8c0"><path d="m237.8 260.7l398.5 100.7-154.1 85.6-398.5-100.7z"/></clipPath><clipPath id="p4u8c1"><path d="m266.7 220.1l117.2 29.6-79 43.9-117.2-29.6z"/></clipPath><clipPath id="p4u8c2"><path d="m266.7 156.6l117.2 29.6-79 43.9-117.2-29.6z"/></clipPath><clipPath id="p4u8c3"><path d="m266.7 89.2l117.2 29.6-79 43.9-117.2-29.6z"/></clipPath><clipPath id="p4u8c4"><path d="m237.8 260.7l398.5 100.7-154.1 85.6-398.5-100.7z"/></clipPath><clipPath id="p4u8k"><path d="m237.8 260.7l398.5 100.6-154.1 85.7-398.5-100.7z"/></clipPath><filter id="p4u8b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"></feGaussianBlur></filter><filter id="p4u8b5" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"></feGaussianBlur></filter><filter id="p4u8b9" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"></feGaussianBlur></filter><filter id="p4u8b10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"></feGaussianBlur></filter><filter id="p4u8b12" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"></feGaussianBlur></filter><filter id="p4u8b23" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="23"></feGaussianBlur></filter></defs><g data-part="board" style="--i:0"><path class="p-plaster" d="m83.7 346.4l398.5 100.6 154.1-85.6-398.5-100.6z"/><path class="p-right" d="m83.7 356.9l398.5 100.6 0-10.5-398.5-100.6zm398.5 100.6l154.1-85.6 0-10.5-154.1 85.6z"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.24" d="m482.2 457.5l154.1-85.6"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.21" d="m636.3 371.9l0-10.5"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.10" d="m636.3 361.4l-154.1 85.6m-398.5-100.6l398.5 100.6"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.11" d="m482.2 447l0 10.5"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.20" d="m83.7 356.9l0-10.5"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.17" d="m83.7 346.4l154.1-85.6"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.18" d="m636.3 361.4l-398.5-100.6"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.23" d="m482.2 457.5l-398.5-100.6"/></g><g><path class="p-shadow" opacity="0.394" filter="url(#p4u8b5)" d="m240.1 270l401.9 101.5-156.5 86.9-401.9-101.6z"/></g><g clip-path="url(#p4u8k)"><g opacity="0.229" filter="url(#p4u8b2)"><path class="p-shadow" d="m229.4 338.2l117.2 29.6 79.1-43.9-117.2-29.6zm78.7 31.9l79-43.9 38.6-2.3-79.1 43.9zm-117.2-29.6l117.2 29.6 38.5-2.3-117.2-29.6zm73.1-4.3l117.2 29.6 79-43.9-117.2-29.6zm82.6 31.6l79.1-43.9 34.5-2-79 43.9zm-117.2-29.6l117.2 29.6 34.6-2-117.2-29.6zm71.3-4.2l117.2 29.6 79-43.9-117.2-29.6zm82.6 31.7l79.1-43.9 34.5-2.1-79 43.9zm-117.2-29.6l117.2 29.6 34.6-2.1-117.2-29.6zm71.3-4.3l117.2 29.6 79-43.9-117.2-29.6zm82.6 31.7l79.1-43.9 34.5-2.1-79 43.9zm-117.2-29.6l117.2 29.6 34.6-2.1-117.2-29.6zm134.7 43.2l117.2 29.6 79.1-43.9-117.2-29.6zm34.7 34.5l79-43.9 82.6-4.9-79.1 43.9zm-117.2-29.6l117.2 29.6 82.5-4.9-117.2-29.6z"/></g></g><g data-part="ref" style="--i:1"><g clip-path="url(#p4u8c0)"><path class="p-shadow" opacity="0.389" filter="url(#p4u8b12)" d="m286.9 293.1l124.7 31.5-84.1 46.8-124.8-31.5z"/></g><g clip-path="url(#p4u8c1)"><path class="p-shadow" opacity="0.394" filter="url(#p4u8b9)" d="m282.7 217.2l123.1 31.1-83 46.2-123.2-31.2z"/></g><g clip-path="url(#p4u8c2)"><path class="p-shadow" opacity="0.391" filter="url(#p4u8b10)" d="m284.2 153.4l123.8 31.3-83.5 46.4-123.8-31.3z"/></g><g clip-path="url(#p4u8c3)"><path class="p-shadow" opacity="0.391" filter="url(#p4u8b10)" d="m284.2 86l123.8 31.3-83.5 46.4-123.8-31.3z"/></g><path class="p-top" d="m187.7 264l117.2 29.6 79-43.9-117.2-29.6zm0 70.8l117.2 29.6 0-70.8-117.2-29.6z"/><path class="p-right" d="m304.9 364.4l79-43.9 0-70.8-79 43.9z"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.41" d="m304.9 364.4l79-43.9"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.38" d="m383.9 320.5l0-70.8m-196.2 14.3l79-43.9"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.18" d="m383.9 249.7l-79 43.9m-117.2-29.6l117.2 29.6"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.19" d="m304.9 293.6l0 70.8"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.40" d="m187.7 334.8l0-70.8"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.37" d="m383.9 249.7l-117.2-29.6"/><path class="p-line2" stroke-width="1.50" stroke-opacity="0.42" d="m304.9 364.4l-117.2-29.6"/></g><g data-part="yr" style="--i:2"><path class="p-top" d="m187.7 200.5l117.2 29.7 79-43.9-117.2-29.7zm0 63.5l117.2 29.6 0-63.4-117.2-29.7z"/><path class="p-right" d="m304.9 293.6l79-43.9 0-63.4-79 43.9z"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.70" d="m304.9 293.6l79-43.9m-196.2 14.3l0-63.5"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.66" d="m383.9 249.7l0-63.4m-196.2 14.2l79-43.9"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.31" d="m383.9 186.3l-79 43.9m-117.2-29.7l117.2 29.7"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.32" d="m304.9 230.2l0 63.4"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.64" d="m383.9 186.3l-117.2-29.7"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.72" d="m304.9 293.6l-117.2-29.6"/><path class="p-top" d="m187.7 133.1l117.2 29.6 79-43.9-117.2-29.6zm0 63.5l117.2 29.6 0-63.5-117.2-29.6z"/><path class="p-right" d="m304.9 226.2l79-43.9 0-63.5-79 43.9z"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.73" d="m304.9 226.2l79-43.9"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.69" d="m383.9 182.3l0-63.5"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.32" d="m383.9 118.8l-79 43.9"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.33" d="m304.9 162.7l0 63.5m-117.2-93.1l117.2 29.6"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.72" d="m187.7 196.6l0-63.5"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.68" d="m187.7 133.1l79-43.9"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.67" d="m383.9 118.8l-117.2-29.6"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.75" d="m304.9 226.2l-117.2-29.6"/><path class="p-top" d="m187.7 65.7l117.2 29.6 79-43.9-117.2-29.6zm0 63.5l117.2 29.6 0-63.5-117.2-29.6z"/><path class="p-right" d="m304.9 158.8l79-43.9 0-63.5-79 43.9z"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.76" d="m304.9 158.8l79-43.9"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.72" d="m383.9 114.9l0-63.5"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.33" d="m383.9 51.4l-79 43.9"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.34" d="m304.9 95.3l0 63.5m-117.2-93.1l117.2 29.6"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.75" d="m187.7 129.2l0-63.5"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.71" d="m187.7 65.7l79-43.9"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.69" d="m383.9 51.4l-117.2-29.6"/><path class="p-sil" stroke-width="1.50" stroke-opacity="0.77" d="m304.9 158.8l-117.2-29.6"/></g><g data-part="pr" style="--i:3"><g clip-path="url(#p4u8c4)"><path class="p-shadow" opacity="0.393" filter="url(#p4u8b23)" d="m471.2 330.9l132.4 33.5-89.3 49.5-132.4-33.4z"/></g><path class="cs-ft" d="m351.8 224.6l117.1 29.6 79.1-43.9-117.2-29.6zm0 151.7l117.1 29.6 0-151.7-117.1-29.6z"/><path class="cs-fr" d="m468.9 405.9l79.1-43.9 0-151.7-79.1 43.9z"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.77" d="m468.9 405.9l79.1-43.9"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.75" d="m548 362l0-151.7m0 0l-117.2-29.6"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.35" d="m548 210.3l-79.1 43.9m-117.1-29.6l117.1 29.6"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.36" d="m468.9 254.2l0 151.7"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.78" d="m351.8 376.3l0-151.7"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.76" d="m351.8 224.6l79-43.9"/><path class="p-fl" stroke-width="1.50" stroke-opacity="0.79" d="m468.9 405.9l-117.1-29.6"/></g><g data-part="kp" style="--i:4"><path class="p-line2" stroke-width="0.86" stroke-opacity="0.92" stroke-dasharray="4 4" d="m468.9 254.2l79.1-43.9m-196.2 14.3l0-121.4"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.89" stroke-dasharray="4 4" d="m548 210.3l0-121.3m-196.2 14.2l79-43.9"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.95" stroke-dasharray="4 4" d="m548 89l-79.1 43.9"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.97" stroke-dasharray="4 4" d="m468.9 132.9l0 121.3"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.85" stroke-dasharray="4 4" d="m430.8 180.7l-79 43.9"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.82" stroke-dasharray="4 4" d="m430.8 59.3l0 121.4"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.96" stroke-dasharray="4 4" d="m351.8 103.2l117.1 29.7"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.88" stroke-dasharray="4 4" d="m548 89l-117.2-29.7"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.83" stroke-dasharray="4 4" d="m430.8 180.7l117.2 29.6"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.93" stroke-dasharray="4 4" d="m468.9 254.2l-117.1-29.6"/></g>']
  };
  function posterHTML(c, on) {
    var p = POSTER[c.id];
    if (!p) return '';
    return '<svg class="ps3d-poster cs-pst' + (on ? ' is-on"' : '" data-aa-skip=""') + ' data-c="' + c.id + '" viewBox="0 0 ' + p[0] + ' ' + p[1] + '" preserveAspectRatio="xMidYMid meet" focusable="false">' + p[2] + '</svg>';
  }

  function init(root, ctx) {
    var store = ctx.store, data = normStore(store.get()), view = 'lobby', cur = null, susp = {}, uid = ++UID, lunch = null;
    root.innerHTML = '<div class="cs" data-view="lobby"><div class="cs-view"></div><div class="cs-foot"></div></div>';
    var box = root.querySelector('.cs'), viewEl = box.querySelector('.cs-view');
    var shelf = K.shelf(box.querySelector('.cs-foot'), { slug: SLUG, notes: NOTES, caseFile: CASEFILE, take: { items: TAKE, personal: personal } });
    K.glossary(root, DEFS);
    function save() { store.set(data); }

    function personal() {
      var cs = CASES.filter(function (c) { return data.last[c.id]; });
      if (!cs.length) return null;
      var avg = {};
      DIMS.forEach(function (d) { avg[d[0]] = cs.reduce(function (s, c) { return s + data.last[c.id][d[0]]; }, 0) / cs.length; });
      var ds = DIMS.slice().sort(function (a, b) { return avg[b[0]] - avg[a[0]]; }), best = ds[0], negs = { S: 0, A: 0, J: 0, C: 0 };
      /* practice what the notes keep flagging; fall back to the weakest average only when it is actually weak */
      cs.forEach(function (c) { (data.last[c.id].neg || []).forEach(function (k) { if (NOTE_DIM[k]) negs[NOTE_DIM[k]]++; }); });
      var rest = DIMS.filter(function (d) { return d !== best; }), pr = rest.slice().sort(function (a, b) { return negs[b[0]] - negs[a[0]] || avg[a[0]] - avg[b[0]]; })[0];
      if (!negs[pr[0]]) pr = ds[3] !== best && avg[ds[3][0]] < 3.5 ? ds[3] : null;
      return 'My last scorecards: ' + cs.map(function (c) { var l = data.last[c.id]; return c.client + ' S ' + F.n(l.S, 1) + ' A ' + F.n(l.A, 1) + ' J ' + F.n(l.J, 1) + ' C ' + F.n(l.C, 1); }).join('; ') +
        '. Strongest: ' + best[1].toLowerCase() + '. ' + (pr ? 'Practice next: ' + pr[1].toLowerCase() + '.' : 'Keep doing what you are doing.');
    }

    /* the engine speaks through these two hooks; only the case on screen draws */
    HOOK.line = function (S, l) { if (S === cur && view === 'case') appendLine(l); };
    HOOK.unlock = function (S, id) {
      var inCase = view === 'case' && S === cur, ph = PHASES[phaseIdx(S.phase)][1];
      var ok = shelf.notes.unlock(id, { where: S.c.client + ', ' + ph, announce: !inCase });
      if (ok && inCase) line(S, 'note', id);
    };

    /* ---------- the drawing: one figure above the transcript that survives every re-render of the work panel ---------- */
    var scn = null;
    function sceneKill() {
      if (!scn) return;
      scn.dead = true;
      if (scn.io) scn.io.disconnect();
      if (scn.ex) { scn.ex._csDead = true; try { scn.ex.destroy(); } catch (e) {} }
      scn = null;
    }
    function sceneMount(S) {
      sceneKill();
      var host = viewEl.querySelector('.cs-model'), m = M3[S.cid], id = 'csSc' + uid;
      if (!host || !m) return;
      host.innerHTML = '<figure class="iso lk-scene cs-scene"><div class="cs-scene-h"><div><p class="lk-kicker">The drawing</p><p class="cs-scene-t" id="' + id + 't">' + E(m.t) + '</p></div>' +
        '<div class="lk-seg cs-scene-seg" aria-label="What the drawing shows"><button data-v="num" aria-checked="true">The numbers</button><button data-v="tree" aria-checked="false" disabled>Your tree</button></div></div>' +
        '<div class="iso-stage cs-paper" tabindex="0" role="group" aria-roledescription="3D model" aria-labelledby="' + id + 't" aria-describedby="' + id + 'd"><p class="cs-scene-wait">Drawing the model.</p></div>' +
        '<figcaption><p class="cs-scene-s" aria-live="polite"></p><p class="cs-scene-d" id="' + id + 'd">' + E(m.d) + '</p><ol class="iso-parts cs-parts"></ol>' +
        '<div class="iso-ctl"><button type="button" class="ps-cap" data-act="explode" aria-pressed="false">Take it apart</button><button type="button" class="ps-cap" data-act="reset">Reset view</button></div>' +
        '<p class="iso-live vh" aria-live="polite"></p></figcaption></figure>';
      var s = scn = { S: S, fig: host.firstChild, mode: 'num', ex: null };
      K.seg(s.fig.querySelector('.cs-scene-seg'), function (v) { s.mode = v; if (!s.auto) s.picked = true; sceneBuild(); });
      function go() {
        if (s.dead || s.req) return;
        s.req = true;
        need3d().then(function () { if (!s.dead) sceneBuild(); }, function () { if (!s.dead) sceneFail(); });
      }
      s.go = go;
      if ('IntersectionObserver' in window) {
        s.io = new IntersectionObserver(function (es) { if (es[es.length - 1].isIntersecting) { s.io.disconnect(); s.io = null; go(); } }, { rootMargin: '600px 0px' });
        s.io.observe(s.fig);
      } else go();
      sceneSync(true);
    }
    function sceneFail() {
      if (!scn) return;
      scn.fig.classList.add('is-off');
      scn.fig.querySelector('.cs-scene-wait').textContent = 'The drawing did not load. The case works without it.';
    }
    function sceneBuild() {
      var s = scn, P = window.PS3D;
      if (!s || s.dead || !P || !P.explorer) return;
      if (s.ex) { s.ex._csDead = true; try { s.ex.destroy(); } catch (e) {} s.ex = null; }
      var S = s.S, tr = s.mode === 'tree' && !!S.treeEval, m = tr ? M3.tree : M3[S.cid], f = s.fig;
      f.querySelector('.cs-scene-t').textContent = m.t; f.querySelector('.cs-scene-d').textContent = m.d;
      f.querySelector('.cs-parts').innerHTML = ''; f.classList.toggle('is-tree', tr);
      s.key = s.lk = s.lk2 = s.labs = null; s.labEls = [];
      var prm = tr ? { cards: S.tree.map(function (id) { var cd = find(S.c.cards, id); return { trap: !!(cd.trap || cd.irr), subs: cd.subs || [] }; }) } : { n: S.n, v: S.v };
      s.base = m.base(prm);
      try {
        s.ex = P.explorer(f, m.id, { params: prm, pins: !!m.pins, margin: 1.1 });
      } catch (e) { sceneFail(); return; }
      s.tr = tr; s.tk = S.tree.join();
      s.ex.vw.on('frame', function () { if (!s.drawn) { s.drawn = true; f.classList.add('is-drawn'); } });
      /* taken apart, the board steps away so nothing sinks into it, and the camera fits the parts alone */
      s.ex.on('explode', function (t) { var r = s.fr, x = t > .5; vis(s.ex.parts.board, !x); if (r) refit(s, r[x ? 2 : 0], r[x ? 3 : 1], false, x); });
      s.fk = null;
      sceneSync(false);
    }
    /* fit the camera to what is on the table now and to the board it stands on, easing there over 900ms (reduced motion: at
       once). The explorer's own resize refit uses the same points and margin. */
    function refit(s, a, b, snap, xp) {
      var ex = s.ex, v = ex.vw, c = v.camera, pts = [], i, q = s.base, mg = v.w && v.w < 480 ? 1.06 : 1.1;
      if (!v.frameCalc) return;
      if (q && !xp) { a = [Math.min(a[0], q[0]), Math.min(a[1], -.13), Math.min(a[2], q[1])]; b = [Math.max(b[0], q[2]), b[1], Math.max(b[2], q[3])]; }
      for (i = 0; i < 8; i++) pts.push([i & 1 ? b[0] : a[0], i & 2 ? b[1] : a[1], i & 4 ? b[2] : a[2]]);
      var o = v.frameCalc(pts, mg, ex.home.yaw, ex.home.pitch);
      if (!o) return;
      ex._fp = pts; ex.o.margin = mg;
      if (s.ftw) s.ftw();
      function put(x) { c.target = x.slice(0, 3); c.span = x[3]; c.radius = x[4]; v.invalidate(); }
      if (snap) put(o.target.concat([o.span, o.radius]));
      else s.ftw = window.PS3D.tween({ from: c.target.concat([c.span, c.radius]), to: o.target.concat([o.span, o.radius]), dur: 900, ease: 'io', update: put });
    }
    /* labels ride the drawing through the engine's one label layer: each sits beside, above, below or on its point by its own
       CSS (cs-lab--l, r, t, b, c), and the layer keeps them apart, inside the stage and on a leader when it moves one */
    function dimsSet(s, labels) {
      var ex = s.ex;
      (s.labEls || []).forEach(function (it) { ex.labs.remove(it); if (it.el.parentNode) it.el.parentNode.removeChild(it.el); });
      s.labEls = labels.map(function (l) {
        var t = String(l[1]).split('|'), el = document.createElement('span');
        el.className = 'iso-label cs-lab cs-lab--' + l[2].split(' ').join(' cs-lab--');
        el.innerHTML = t[1] ? '<b>' + E(t[0]) + '</b><i> ' + E(t[1]) + '</i>' : E(t[0]);
        ex.pinsEl.appendChild(el);
        return ex.labs.add({ el: el, at: l[0] });
      });
    }
    /* read the attempt, move the model to match, and rewrite the ledger and the status line when they change */
    function sceneSync(snap) {
      var s = scn;
      if (!s || s.dead) return;
      var S = s.S, ok = !!S.treeEval && S.sstep !== 'build', f = s.fig, tb = f.querySelector('.cs-scene-seg [data-v="tree"]'), nb = tb.previousSibling;
      tb.disabled = !ok;
      function flip(b) { s.auto = true; s.wn = b === nb; b.click(); s.auto = false; }
      if (s.mode === 'tree' && !ok) { flip(nb); return; }
      if (s.ex && !s.picked) {
        if (ok && !s.t1 && S.phase === 'structure') { s.t1 = 1; flip(tb); return; }
        if (s.mode === 'tree' && s.t1 === 1 && S.seen.some(function (id) { return exDone(S, id); })) { s.t1 = 2; flip(nb); return; }
      }
      if (s.ex && s.tr && S.tree.join() !== s.tk) { sceneBuild(); return; }
      if (!s.ex) return;
      var m = s.tr ? M3.tree : M3[S.cid], o = m.sync(s.ex, S, S.phase === 'score', snap), key = JSON.stringify(o.parts), ex = s.ex;
      if (S.phase === 'score' && !s.tr) o.s = 'The full drawing now shows everything the exhibits held, including any you did not pull.';
      ex.list.length = 0;
      o.parts.forEach(function (r, i) { var n = ex.parts[r[0]]; if (!s.tr) n.n = r[1] = i + 1; ex.list.push(n); });
      if (key !== s.lk) {
        s.lk = key;
        f.querySelector('.cs-parts').innerHTML = o.parts.map(function (r) {
          return '<li><button type="button" data-part="' + r[0] + '" aria-pressed="' + (ex.sel === r[0]) + '"' + (ex.sel === r[0] ? ' class="is-on"' : '') + '><span class="n">' + (r[1] == null ? '' : r[1]) + '</span><span class="cs-pn">' + E(r[2]) + '</span><span class="v">' + E(r[3]) + '</span></button></li>';
        }).join('');
        if (ex.sel) { var sel = ex.sel; ex.select(null, false); ex.select(sel, false); }
      }
      /* the tree carries no frame of its own: it fits its board */
      if (!o.fr && s.base) { var q = s.base; o.fr = [[q[0], -.13, q[1]], [q[2], .3, q[3]], [q[0], -.13, q[1]], [q[2], 1, q[3]]]; }
      if (o.fr) {
        var fk = JSON.stringify(o.fr), a = o.fr[0], b = o.fr[1];
        s.fr = o.fr; ex.vw.shadow = { a: .2, c: [(a[0] + b[0]) / 2, 0, (a[2] + b[2]) / 2], r: Math.max(b[0] - a[0], b[2] - a[2]) * .42 };
        if (fk !== s.fk) { var x = ex.ex > .5; refit(s, o.fr[x ? 2 : 0], o.fr[x ? 3 : 1], snap || s.fk == null, x); s.fk = fk; }
      }
      var lk = JSON.stringify(o.labels);
      if (lk !== s.lk2) { s.lk2 = lk; s.labs = o.labels; dimsSet(s, o.labels); }
      var st = f.querySelector('.cs-scene-s');
      if (st.textContent !== o.s) st.textContent = o.s;
      if (!snap && (s.wn || (s.key != null && key !== s.key)) && S.phase === 'analyze' && !s.tr) s.note = { ex: S.cur, t: o.s };
      s.wn = false;
      s.key = key;
      ex.vw.invalidate();
    }
    function sceneShow() {
      if (!scn) return;
      if (scn.go) scn.go();
      var r = scn.fig.getBoundingClientRect();
      try { window.scrollTo({ top: window.pageYOffset + r.top - 88, behavior: K.reducedMotion() ? 'instant' : 'smooth' }); } catch (e) { window.scrollTo(0, window.pageYOffset + r.top - 88); }
      K.focus(scn.fig.querySelector('.iso-stage'));
    }
    function sceneNote(w, S) {
      if (!scn) return;
      var b = '<button type="button" class="cs-link" data-act="drawing" data-k="drawing">See the drawing</button>', at;
      if (S.phase === 'score') at = w.querySelector('.cs-said');
      else if (scn.note && scn.note.ex === S.cur && S.phase === 'analyze') at = w.querySelector('.cs-ex-act');
      if (at) at.insertAdjacentHTML(S.phase === 'score' ? 'beforebegin' : 'afterend', '<p class="cs-scene-note"><span>' + E(S.phase === 'score' ? 'The drawing above now shows the whole case, including any exhibit you did not pull.' : scn.note.t) + '</span>' + b + '</p>');
    }

    /* ---------- lobby ---------- */
    /* the case in hand: a suspended one first, then the first not yet taken, then the first */
    function featured() {
      var i;
      for (i = 0; i < CASES.length; i++) if (susp[CASES[i].id] && susp[CASES[i].id].phase !== 'score') return CASES[i];
      for (i = 0; i < CASES.length; i++) if (!data.last[CASES[i].id]) return CASES[i];
      return CASES[0];
    }
    function heroShow(cid) {
      var hero = viewEl.querySelector('.cs-hero'), c = caseById(cid);
      if (!hero || !c || hero.getAttribute('data-c') === cid) return;
      hero.setAttribute('data-c', cid);
      /* the drawings not in hand are faded out of sight, so the contrast sweep skips them */
      Array.prototype.forEach.call(hero.querySelectorAll('.cs-pst'), function (p) { var on = p.getAttribute('data-c') === cid; p.classList.toggle('is-on', on); p.classList.toggle('is-swap', on); if (on) p.removeAttribute('data-aa-skip'); else p.setAttribute('data-aa-skip', ''); });
      Array.prototype.forEach.call(viewEl.querySelectorAll('.cs-folder'), function (f) { f.classList.toggle('is-hot', f.getAttribute('data-c') === cid); });
      hero.querySelector('.cs-hero-n').textContent = pad(c.n);
      hero.querySelector('.cs-hero-t').textContent = M3[cid].t;
    }
    /* on a phone the folders sit in a rail; the one in the middle of it brings its drawing up */
    var railIO = null;
    function railWatch() {
      if (railIO) { railIO.disconnect(); railIO = null; }
      var ul = viewEl.querySelector('.cs-folders'), ft = ul && ul.querySelector('.cs-folder.is-feat');
      if (!ul) return;
      /* the rail opens on the case in hand */
      if (ft && ul.scrollWidth > ul.clientWidth + 2) ul.scrollLeft = ft.offsetLeft - ul.firstElementChild.offsetLeft;
      if (!('IntersectionObserver' in window)) return;
      railIO = new IntersectionObserver(function (es) {
        if (ul.scrollWidth <= ul.clientWidth + 2) return;
        es.forEach(function (e) { if (e.isIntersecting && e.intersectionRatio >= .6) heroShow(e.target.getAttribute('data-c')); });
      }, { root: ul, threshold: [.6] });
      Array.prototype.forEach.call(ul.children, function (li) { railIO.observe(li); });
    }
    function renderLobby(focus) {
      sceneKill();
      view = 'lobby'; cur = null; lunch = null;
      box.setAttribute('data-view', 'lobby');
      shelf.setMeta('');
      var done = CASES.filter(function (c) { return data.last[c.id]; }).length, h = '', ft = featured();
      /* the cover: the title, the drawing of the case in hand on its board, and four folders on the desk. Pointing at a folder
         brings its drawing up; the featured folder carries the one orange action */
      h += '<div class="cs-lobby cs-stage" data-ground="espresso"><div class="cs-cover"><div class="lk-head cs-cover-t"><p class="lk-kicker">The final round</p><h4 class="lk-title cs-lobby-h" tabindex="-1"><span>Four cases.</span> <span>One committee.</span></h4><p class="lk-lede">' + INTRO + '</p></div>' +
        '<figure class="cs-hero" data-c="' + ft.id + '" aria-hidden="true"><div class="cs-hero-p cs-paper">' + CASES.map(function (c) { return posterHTML(c, c === ft); }).join('') + '</div>' +
        '<figcaption class="cs-hero-c"><span class="cs-hero-n">' + pad(ft.n) + '</span><span class="cs-hero-t">' + E(M3[ft.id].t) + '</span></figcaption></figure></div><ul class="cs-folders">';
      CASES.forEach(function (c) {
        var l = data.last[c.id], sp = susp[c.id] && susp[c.id].phase !== 'score', f = c === ft;
        h += '<li class="cs-folder' + (f ? ' is-feat is-hot' : '') + '" data-c="' + c.id + '" data-ground="wall" data-tone="light"><span class="cs-tab">Case ' + pad(c.n) + '</span><h5 class="cs-fname">' + E(c.client) + '</h5>' +
          '<p class="cs-fkind">' + E(c.kind) + ' · ' + (c.format === 'cand' ? 'Candidate-led' : 'Interviewer-led') + '</p><p class="cs-fhook">' + E(c.hook) + '</p>' +
          '<p class="cs-fmeta"><span class="cs-diff" role="img" aria-label="Difficulty ' + c.diff + ' of 3">' + [1, 2, 3].map(function (i) { return '<i class="' + (i <= c.diff ? 'is-on' : '') + '"></i>'; }).join('') + '</span>' +
          '<span class="cs-last">' + (l ? 'Last: ' + F.n(l.overall, 1) + ' · ' + E(l.verdict) : 'Not attempted') + '</span></p><div class="cs-fbtns">' +
          (sp ? '<button type="button" class="' + (f ? 'ebtn cs-go' : 'ebtn') + '" data-act="open" data-v="' + c.id + '" data-m="resume" data-k="op-' + c.id + '">Resume the case</button><button type="button" class="ebtn2 cs-redo" data-act="open" data-v="' + c.id + '" data-m="new" data-k="nw-' + c.id + '">Start over</button>'
            : '<button type="button" class="' + (f ? 'ebtn cs-go' : 'ebtn') + '" data-act="open" data-v="' + c.id + '" data-m="new" data-k="op-' + c.id + '">' + (l ? 'Take a new case' : 'Open the case') + '</button>') + '</div></li>';
      });
      h += '</ul><div class="cs-lobby-bar"><div class="cs-coachset"><span class="lk-k" id="csCo' + uid + '">Coach notes</span><div class="lk-seg" aria-labelledby="csCo' + uid + '"><button data-v="on" aria-checked="' + data.coach + '">On</button><button data-v="off" aria-checked="' + !data.coach + '">Off</button></div></div>' +
        '<button type="button" class="ebtn2" data-act="lunch" data-k="lunch">Lunch: how the firm makes money</button>' +
        (done >= 3 ? '<button type="button" class="ebtn" data-act="committee" data-k="comm">The committee is ready</button>' : '<p class="cs-cstat">' + (done ? 'Cases completed: <span class="lk-num">' + done + '</span> of 3. ' : '') + 'The committee meets when three interviewers have seen you.</p>') +
        '</div><details class="cs-how"><summary>How the final round works</summary><div class="cs-how-b">' + HOW + '</div></details></div>';
      viewEl.innerHTML = h;
      K.seg(viewEl.querySelector('.lk-seg'), function (v) { data.coach = v === 'on'; save(); });
      railWatch();
      if (focus) K.focus(viewEl.querySelector('.cs-lobby-h'), { scroll: true });
    }

    /* ---------- the case room ---------- */
    function startCase(c, o) {
      o = o || {};
      var a;
      if (o.retake) { var p = o.retake; a = { seed: p.seed, v: p.v, k: p.k, errOn: p.errOn, errIdx: p.errIdx, curve: p.curveIdx }; }
      else if (o.dbg) a = o.dbg;
      else { a = { seed: K.seed() }; a.v = pickVariant(c, data.plays[c.id] || 0, a.seed); }
      var S = newAttempt(c, a);
      cur = susp[c.id] = S; view = 'case';
      line(S, 'int', c.who.name + ', ' + c.who.role + '. ' + (c.format === 'cand' ? 'You drive. Ask me for what you need.' : 'I will hand you exhibits as we go.'));
      line(S, 'int', c.prompt(S.n), 'html');
      renderCase(true);
      unlock(S, 'styles');
      (c.openNotes || []).forEach(function (id) { unlock(S, id); });
    }
    function lineHTML(S, l) {
      if (l.w === 'note') {
        var nt = find(NOTES, l.t);
        return '<p class="lk-line cs-line cs-line--note"><span class="lk-chip">Field note</span>' + E(nt.term) + (/[.?!]$/.test(nt.term) ? ' ' : '. ') + '<button type="button" class="cs-link" data-act="note" data-v="' + l.t + '">Read it</button></p>';
      }
      var you = l.w === 'you';
      return '<p class="lk-line cs-line cs-line--' + l.w + '"><span class="lk-chip' + (you ? ' lk-chip--foil' : '') + '">' + (you ? 'You' : E(S.c.who.name.split(' ')[0])) + '</span>' + (l.x === 'html' ? l.t : E(l.t)) + '</p>';
    }
    function appendLine(l) {
      var log = viewEl.querySelector('.cs-log');
      if (!log) return;
      log.insertAdjacentHTML('beforeend', lineHTML(cur, l));
      log.scrollTop = log.scrollHeight;
    }
    function renderCase(moved) {
      var S = cur, c = S.c;
      box.setAttribute('data-view', 'case');
      viewEl.innerHTML = '<div class="cs-case"><div class="cs-stage" data-ground="espresso"><div class="cs-top"><button type="button" class="cs-link cs-back" data-act="lobby" data-k="lobby">← Back to the lobby</button>' +
        '<p class="lk-kicker cs-case-n">Case ' + pad(c.n) + ' of 04 · ' + E(c.kind) + ' · ' + (c.format === 'cand' ? 'Candidate-led' : 'Interviewer-led') + '</p><h4 class="cs-case-k" tabindex="-1">' + E(c.client) + '</h4></div>' +
        '<div class="cs-head"></div><section class="cs-model" aria-label="The drawing"></section></div><section class="cs-talk" aria-label="The interview so far"><div class="cs-log lk-feed" aria-live="polite" aria-relevant="additions">' +
        S.talk.map(function (l) { return lineHTML(S, l); }).join('') + '</div><button type="button" class="cs-link cs-more" data-act="more" data-k="more" aria-expanded="false">Show the whole conversation</button></section>' +
        '<section class="cs-work" aria-labelledby="csPh' + uid + '"></section></div>';
      var log = viewEl.querySelector('.cs-log');
      log.scrollTop = log.scrollHeight;
      shelf.setMeta('Case #' + c.n + '-' + (S.seed % 100000) + ' · Same seed, same case');
      renderHead();
      sceneMount(S);
      renderWork(null, false, true);
      if (moved) K.focus(viewEl.querySelector('.cs-case-k'), { scroll: true });
    }
    function cell(k, v, cls) { return '<div class="lk-cell' + (cls ? ' ' + cls : '') + '"><span class="lk-k">' + k + '</span><span class="lk-v">' + v + '</span></div>'; }
    function renderHead() {
      var S = cur, h = viewEl.querySelector('.cs-head');
      if (!h || !S) return;
      var pi = phaseIdx(S.phase), tot = S.budget + 8, b = S.budget / tot, now = Math.min(S.clock, tot) / tot, ticks = '';
      for (var m = 5; m < tot; m += 5) ticks += '<i class="cs-clock-tick" style="left:' + (100 * m / tot).toFixed(2) + '%"></i>';
      h.innerHTML = '<ol class="cs-steps" aria-label="Where you are in the case">' + PHASES.map(function (p, i) {
          return '<li class="' + (i < pi ? 'is-past' : i === pi ? 'is-now' : '') + '"' + (i === pi ? ' aria-current="step"' : '') + '><span>' + p[1] + '</span></li>';
        }).join('') + '</ol><p class="cs-steps-s" aria-hidden="true">Step ' + (pi + 1) + ' of 6 · ' + PHASES[pi][1] + '</p>' +
        '<div class="cs-clock' + (S.clock > S.budget ? ' is-over' : S.clock >= S.budget - 5 ? ' is-warn' : '') + '"><p class="cs-clock-f"><span class="vh">Minute </span><span class="cs-clock-n">' + mins(S.clock) + '</span><span class="cs-clock-u">of ' + S.budget + ' interview minutes' + (S.clock > S.budget ? '<span class="cs-over">' + mins(r1(S.clock - S.budget)) + ' over</span>' : '') + '</span></p><div class="cs-clock-bar" aria-hidden="true">' + ticks + '<i class="cs-clock-hatch" style="left:' + (100 * (S.budget - 5) / tot).toFixed(2) + '%;width:' + (500 / tot).toFixed(2) + '%"></i>' +
        '<i class="cs-clock-used" style="--w:' + Math.min(now, b).toFixed(4) + '"></i>' + (now > b ? '<i class="cs-clock-over" style="left:' + (100 * b).toFixed(2) + '%;width:' + (100 * (now - b)).toFixed(2) + '%"></i>' : '') +
        '<i class="cs-clock-budget" style="left:' + (100 * b).toFixed(2) + '%"></i><i class="cs-clock-now lk-foil-mark" style="left:' + (100 * now).toFixed(2) + '%"></i></div></div>';
    }
    function ph(S, t) { return '<h4 class="cs-ph" id="csPh' + uid + '" tabindex="-1">' + t + '</h4>'; }
    function coach(k) { return data.coach ? '<p class="lk-coach">' + COACH[k] + '</p>' : ''; }
    function opt(act, v, label, sub, k) {
      return '<button type="button" class="lk-opt" data-act="' + act + '" data-v="' + v + '" data-k="' + k + '"><span class="lk-opt-l">' + label + '</span>' + (sub ? '<span class="lk-opt-s">' + sub + '</span>' : '') + '</button>';
    }
    function ptxt(S, q) { return val(q.p, S.n); }
    function optLabel(q, id) { var o = q.opts.filter(function (x) { return x[0] === id; })[0]; return o ? o[1] : id; }

    function wBrief(S) {
      var c = S.c, h = ph(S, 'Play the question back') + coach('brief') + '<p class="cs-sub">In one sentence: what is the client asking, and what does success look like?</p><div class="cs-opts">';
      S.ord.restate.forEach(function (i) { var o = c.restate[i]; h += opt('restate', o.id, E(val(o.t, S.n)), null, 'rs-' + o.id); });
      return h + opt('restate', 'skip', 'Jump straight in', 'Skip the restatement and start working.', 'rs-skip') + '</div>';
    }
    function wClarify(S) {
      var n = S.asked.length, full = n >= 3, h = ph(S, 'Ask up to three questions') + coach('clarify') +
        '<p class="cs-sub"><span class="lk-num">' + n + '</span> of 3 asked. Each costs 1.5 interview minutes.</p><div class="cs-chips">';
      S.ord.clarify.forEach(function (qid) {
        var q = find(S.c.clarify, qid), a = has(S.asked, q.id);
        h += '<button type="button" class="cs-chipq" data-act="ask" data-v="' + q.id + '" data-k="q-' + q.id + '" aria-pressed="' + a + '"' + (a || full ? ' disabled' : '') + '>' + E(q.q) + '</button>';
      });
      return h + '</div><div class="btnrow"><button type="button" class="ebtn" data-act="toStruct" data-k="toStruct">' + (full ? 'Structure it' : 'That is enough, let me structure') + '</button></div>';
    }
    function treeView(S) {
      var c = S.c, te = S.treeEval, ov = {}, notes = [];
      te.over.forEach(function (p) { ov[p[0].id] = ov[p[1].id] = 1; });
      var h = '<figure class="cs-tree"><div class="cs-tree-q">' + E(QSHORT[c.id]) + '</div><ul class="cs-tree-b">' + S.tree.map(function (id) {
        var cd = find(c.cards, id), why = cd.trap || cd.irr;
        return '<li class="' + (ov[id] ? 'is-over' : '') + (why ? ' is-trap' : '') + '"><span class="cs-tree-t">' + E(cd.t) + '</span>' +
          (cd.subs ? '<span class="cs-tree-s">' + cd.subs.map(E).join(' · ') + '</span>' : '') + (why ? '<span class="cs-tree-why"><span class="cs-mark">Not quite</span> ' + E(why) + '</span>' : '') + '</li>';
      }).join('') + '</ul>';
      te.over.forEach(function (p) { notes.push('<span class="cs-mark">Overlap</span> ' + E(uc(short(p[0]))) + ' and ' + E(lc(short(p[1]))) + ' count the same dollars.'); });
      te.gaps.forEach(function (g) { notes.push('<span class="cs-mark">Gap</span> Nothing here covers ' + E(c.bucket[g]) + '.'); });
      if (te.clean) notes.push('<span class="cs-mark cs-mark--ok">Clean</span> No overlaps, no gaps, and every branch points at data.');
      return h + (notes.length ? '<figcaption class="cs-tree-cap">' + notes.join('<br>') + '</figcaption>' : '') + '</figure>';
    }
    function wStruct(S) {
      var c = S.c, h;
      if (S.sstep === 'ask') return ph(S, 'Structure') + coach('structure') + '<div class="cs-opts">' +
        opt('minute', '1', 'May I take a minute to structure my thoughts?', 'Two interview minutes. Interviewers expect it.', 'mn-1') + opt('minute', '0', 'Dive in', 'No time spent, and no plan either.', 'mn-0') + '</div>';
      if (S.sstep === 'build') {
        var n = S.tree.length;
        h = ph(S, S.lays ? 'Revise your issue tree' : 'Build the issue tree') + coach('structure') + '<p class="cs-sub">Choose three to five branches that are ' + tm('mece', 'MECE') + ': <span class="lk-num">' + n + '</span> chosen.' + (S.lays ? ' This second layout is the one that counts.' : '') + '</p><div class="cs-cards">';
        S.ord.cards.forEach(function (cid) {
          var cd = find(c.cards, cid), on = has(S.tree, cd.id);
          h += '<button type="button" class="cs-card" data-act="card" data-v="' + cd.id + '" data-k="cd-' + cd.id + '" aria-pressed="' + on + '"' + (!on && n >= 5 ? ' disabled' : '') + '><span class="cs-card-t">' + E(cd.t) + '</span>' +
            (on && cd.subs ? '<span class="cs-card-s">' + cd.subs.map(function (s) { return '<span>' + E(s) + '</span>'; }).join('') + '</span>' : '') + '</button>';
        });
        return h + '</div><div class="btnrow"><button type="button" class="ebtn" data-act="layout" data-k="layout"' + (n < 3 ? ' disabled' : '') + '>Lay it out</button>' + (n >= 5 ? '<span class="cs-sub">Five is the most a listener can hold.</span>' : '') + '</div>';
      }
      if (S.sstep === 'laid') return ph(S, 'Your structure') + treeView(S) + '<div class="btnrow"><button type="button" class="ebtn" data-act="keepTree" data-k="keep">Keep this structure</button>' +
        '<button type="button" class="ebtn2" data-act="editTree" data-k="edit">Revise it</button></div><p class="cs-sub">One revision allowed, for one interview minute. If you revise, only the second layout counts.</p>';
      h = ph(S, 'Your hypothesis') + treeView(S) + coach('hyp') + '<p class="cs-sub">Where is your money right now?</p><div class="cs-opts">';
      S.ord.hyps.forEach(function (id) { h += opt('hyp', id, E(find(c.hyps, id).t), null, 'hy-' + id); });
      return h + '</div>';
    }
    function hypBar(S) {
      var h = '<div class="cs-hyp"><span class="lk-k">Your hypothesis</span><span class="cs-hyp-t">' + E(find(S.c.hyps, S.hyp).t) + '</span>' +
        '<button type="button" class="cs-link" data-act="hypOpen" data-k="hypOpen" aria-expanded="' + S.hypOpen + '">' + (S.hypOpen ? 'Keep it' : 'Change it') + '</button></div>';
      if (S.hypOpen) h += '<div class="cs-opts cs-opts--hyp">' + S.ord.hyps.filter(function (id) { return id !== S.hyp; }).map(function (id) { return opt('setHyp', id, E(find(S.c.hyps, id).t), 'Half an interview minute.', 'sh-' + id); }).join('') + '</div>';
      return h;
    }
    function numQ(S, q, a) {
      var id = 'csi' + uid + q.id;
      var fb = a && a.em && a.free ? '<p class="cs-q-fb" role="status"><span class="cs-mark">Check</span> Your math matches the table as printed. Look at the table again.</p>'
        : a && a.tries > 0 ? '<p class="cs-q-fb" role="status"><span class="cs-mark">Not quite</span> You said ' + E(q.fmt(a.val)) + '. One more try.</p>' : '';
      return '<form class="cs-q" data-act="answer" data-v="' + q.id + '" novalidate><p class="cs-q-p" id="' + id + 'p">' + ptxt(S, q) + '</p>' +
        '<div class="cs-q-row"><input type="text" id="' + id + '" inputmode="decimal" autocomplete="off" spellcheck="false" data-k="in-' + q.id + '" aria-labelledby="' + id + 'p" aria-describedby="' + id + 'u"><span class="cs-unit" id="' + id + 'u">' + UNIT[q.unit] + '</span>' +
        '<button type="submit" class="ebtn" data-k="go-' + q.id + '">Answer</button></div>' + fb +
        (a && a.hint ? '<p class="cs-q-hint"><span class="lk-k">The consultant’s rounding</span> ' + E(val(q.hint, S.n)) + '</p>' : '<button type="button" class="cs-link" data-act="hint" data-v="' + q.id + '" data-k="hint-' + q.id + '">Show the consultant’s rounding</button>') +
        '<details class="cs-pad" data-k="pad-' + q.id + '"><summary>Scratch pad</summary><textarea rows="3" data-k="padt-' + q.id + '" aria-label="Scratch pad, not graded"></textarea></details></form>';
    }
    function doneQ(S, q, a) {
      var g = a.grade, you, tru = '';
      if (q.type === 'multi') you = has(a.sel, 'none') ? 'none of them' : a.sel.map(function (x) { return optLabel(q, x).toLowerCase(); }).join(', ');
      else if (q.type === 'pick') { you = optLabel(q, a.pick); tru = optLabel(q, q.ans(S.n, S.v)); }
      else { you = q.fmt(a.val); tru = q.fmt(trueAns(S, q.id)); }
      return '<div class="cs-q cs-q--done is-' + g + '"><p class="cs-q-p">' + ptxt(S, q) + '</p><p class="cs-q-res"><span class="cs-mark' + (g === 'full' ? ' cs-mark--ok' : '') + '">' + (g === 'full' ? 'Right' : g === 'partial' ? 'Close' : 'Not quite') + '</span> ' +
        (q.type === 'multi' ? 'You challenged ' : 'You: ') + '<span class="lk-num">' + E(you) + '</span>' + (g !== 'full' && tru ? '. The answer: <span class="lk-num">' + E(tru) + '</span>' : '') + '</p>' +
        (q.type === 'multi' ? '<p class="cs-q-how">' + E(q.say[S.v]) + '</p>' : g !== 'full' && q.how ? '<p class="cs-q-how">' + E(q.how(S.n, S)) + '.</p>' : '') + '</div>';
    }
    function qsHTML(S, ex) {
      var h = '', stop = false;
      qsOf(ex, S.v).forEach(function (q) {
        if (stop) return;
        var a = S.ans[q.id];
        if (a && a.done) { h += doneQ(S, q, a); return; }
        stop = true;
        if (!qAvail(S, q)) { h += '<div class="cs-q cs-q--wait"><p class="cs-q-p">' + ptxt(S, q) + '</p><p class="cs-sub">Needs your number from ' + E(S.qmap[q.needs].ex.nm) + ' first.</p></div>'; return; }
        if (q.type === 'num') h += numQ(S, q, a);
        else if (q.type === 'pick') h += '<div class="cs-q"><p class="cs-q-p" id="csp' + uid + q.id + '">' + ptxt(S, q) + '</p><div class="cs-pick" role="group" aria-labelledby="csp' + uid + q.id + '">' +
          q.opts.map(function (o) { return '<button type="button" class="ebtn2" data-act="pick" data-v="' + q.id + '" data-o="' + o[0] + '" data-k="pk-' + o[0] + '">' + E(o[1]) + '</button>'; }).join('') + '</div></div>';
        else h += '<fieldset class="cs-q"><legend class="cs-q-p">' + ptxt(S, q) + '</legend><div class="cs-multi">' + q.opts.map(function (o) {
          return '<label class="cs-check"><input type="checkbox" value="' + o[0] + '" data-k="mc-' + o[0] + '"><span>' + E(o[1]) + '</span></label>';
        }).join('') + '</div><div class="btnrow"><button type="button" class="ebtn" data-act="multi" data-v="' + q.id + '" data-k="go-' + q.id + '">Challenge these</button></div></fieldset>';
      });
      return h;
    }
    function exHTML(S, ex) {
      var id = 'csx' + uid + ex.id, so = S.so[ex.id], f = S.flags[ex.id];
      var h = '<article class="cs-ex" aria-labelledby="' + id + '"><p class="lk-kicker">Exhibit ' + exNum(S, ex.id) + '</p><h5 class="cs-ex-title" id="' + id + '" tabindex="-1" data-k="ex-' + ex.id + '">' + E(exTitle(ex, S.v)) + '</h5>' +
        '<p class="cs-ex-act' + (so ? ' is-set' + (so !== 'right' ? ' is-weak' : '') : '') + '">' + (so ? E(S.soT[ex.id]) : '<span>So what? Choose below.</span>') + '</p>';
      if (so && so !== 'right') h += '<p class="cs-ex-cor"><span class="cs-mark">Not quite</span> ' + (so === 'restate' ? 'That describes the chart. A headline says what it means.' : 'That goes further than the data. Keep the finding, drop the leap.') + '</p>';
      h += '<div class="cs-ex-body">' + ex.body(dOf(S, ex), S) + '</div>' + qsHTML(S, ex);
      if (qsDone(S, ex) && !so) h += '<div class="cs-so" role="group" aria-labelledby="csso' + id + '"><p class="lk-k" id="csso' + id + '">So what? Pick the sentence for the top of the page</p>' +
        soOpts(S, ex).map(function (o, j) { return opt('so', ex.id + ':' + o.i, E(o.t), null, 'so-' + ex.id + '-' + j); }).join('') + '</div>';
      h += f ? '<p class="cs-flag-r" tabindex="-1" data-k="fl-' + ex.id + '"><span class="cs-mark' + (f === 'hit' ? ' cs-mark--ok' : '') + '">' + (f === 'hit' ? (S.prompted ? 'Found' : 'Caught') : 'Flagged') + '</span> ' + (f === 'hit' ? E(ex.err.fix(S.n)) : 'You flagged this exhibit; it was fine.') + '</p>'
        : '<div class="cs-ex-foot"><button type="button" class="cs-flag" data-act="flag" data-v="' + ex.id + '" data-k="fl-' + ex.id + '">Something looks off</button><span class="cs-sub">Half a minute. Flag only what you can name.</span></div>';
      return h + '</article>';
    }
    function reqList(S) {
      var h = '<div class="cs-reqs"><p class="lk-kicker">Ask for data</p><ul class="cs-reql">';
      S.c.ex.forEach(function (ex) {
        var seen = has(S.seen, ex.id), inS = inStructure(S, ex), br = branchOf(S, ex), isCur = S.cur === ex.id, dis = !seen && S.forced;
        h += '<li><button type="button" class="cs-req' + (seen ? ' is-seen' : '') + (isCur ? ' is-cur' : '') + '" data-act="req" data-v="' + ex.id + '" data-k="rq-' + ex.id + '"' + (dis ? ' disabled' : '') + (isCur ? ' aria-current="true"' : '') + '>' +
          '<span class="cs-req-t">' + E(ex.req) + '</span><span class="cs-req-m">' + (seen ? 'Exhibit ' + exNum(S, ex.id) + (exDone(S, ex.id) ? ', done' : ', open') : br ? 'Under: ' + E(br) : 'Outside your structure') + '</span>' +
          '<span class="cs-req-c lk-num">' + (seen ? (isCur ? 'On the table' : 'Reopen, free') : dis ? 'Time is up' : inS ? '3 min' : '5 min') + '</span></button></li>';
      });
      return h + '</ul></div>';
    }
    function contHTML(S) {
      var c = S.c;
      if (!S.cur || !exDone(S, S.cur) || S.forced) return '';
      var nxt = c.seq[S.seqPos + 1];
      if (!S.curveFired && S.cur === c.curveAfter) return '<div class="btnrow"><button type="button" class="ebtn" data-act="cont" data-k="cont">Continue</button></div>';
      if (!nxt) return '<p class="cs-sub">That is every exhibit. Time to recommend.</p>';
      if (nxt === c.optional && S.optAsked) return '<div class="btnrow"><button type="button" class="ebtn2" data-act="optYes" data-k="optYes">' + E(c.optYes) + '</button></div>';
      return '<div class="btnrow"><button type="button" class="ebtn" data-act="cont" data-k="cont">' + (nxt === c.optional ? 'Continue' : 'Next exhibit') + '</button></div>';
    }
    function wAnalyze(S) {
      var c = S.c, h = ph(S, 'Analyze') + hypBar(S);
      if (S.curveOpen) {
        var cb = c.curves[S.curveIdx];
        return h + coach('curve') + '<div class="cs-cb lk-card lk-card--event"><p class="lk-kicker lk-kicker--foil">The interviewer interrupts</p><p class="cs-cb-t">' + E(val(cb.t, S)) + '</p><div class="cs-opts">' +
          S.ord.curve.map(function (j, i) { return opt('curve', j, E(val(cb.opts[j].t, S)), null, 'cb-' + i); }).join('') + '</div><p class="cs-sub">Two interview minutes.</p></div>';
      }
      h += coach(S.cur && !exDone(S, S.cur) ? 'exhibit' : c.format);
      if (S.forced) h += '<p class="cs-alert"><span class="cs-mark">Time</span> No new data from here. Finish what is on the table, then recommend.</p>';
      if (S.cur) h += exHTML(S, find(c.ex, S.cur));
      h += c.format === 'cand' ? reqList(S) : contHTML(S);
      var ready = S.forced || (c.format === 'int' && S.cur && exDone(S, S.cur) && (!c.seq[S.seqPos + 1] || (c.seq[S.seqPos + 1] === c.optional && S.optAsked)));
      return h + '<div class="btnrow cs-recrow"><button type="button" class="' + (ready ? 'ebtn' : 'ebtn2') + '" data-act="toRec" data-k="toRec">' + (ready ? 'Go to my recommendation' : 'I am ready to recommend') + '</button></div>';
    }
    function choice(type, f, v, label, on) {
      return '<label class="cs-choice"><input type="' + type + '" name="cs' + uid + f + '" value="' + v + '" data-act="rec" data-f="' + f + '" data-k="r-' + f + '-' + v + '"' + (on ? ' checked' : '') + '><span>' + label + '</span></label>';
    }
    function fs(legend, inner, cls) { return '<fieldset class="cs-rec' + (cls ? ' ' + cls : '') + '"><legend class="lk-k">' + legend + '</legend>' + inner + '</fieldset>'; }
    function wRec(S) {
      var c = S.c, sy = S.synth, sups = supsOf(S);
      return ph(S, 'Recommend') + coach('rec') + '<div class="cs-pyr-w"></div>' +
        fs('Lead with', S.ord.gov.map(function (id) { return choice('radio', 'gov', id, E(govText(S, find(c.gov, id))), sy.gov === id); }).join('')) +
        fs('Because: choose exactly three', S.ord.sup.map(function (id) {
          var s = find(sups, id);
          return choice('checkbox', 'sup', id, E(supText(S, s)) + (supSeen(S, s) ? '' : ' <span class="cs-tag">You have not seen this data</span>'), has(sy.sup, id));
        }).join(''), 'cs-rec--sup') +
        fs('The main risk', S.ord.risk.map(function (i) { return choice('radio', 'risk', i, E(c.risks[S.v][i][0]), sy.risk === i); }).join('')) +
        fs('Next step', S.ord.next.map(function (i) { return choice('radio', 'next', i, E(c.next[S.v][i][0]), sy.next === i); }).join('')) +
        '<div class="btnrow"><button type="button" class="ebtn" data-act="deliver" data-k="deliver">Deliver it</button><span class="cs-sub cs-dl-s" aria-live="polite"></span></div>';
    }
    function pyrHTML(S) {
      var sy = S.synth, g = sy.gov && find(S.c.gov, sy.gov), rk = sy.risk != null ? S.c.risks[S.v][sy.risk][0] : null, nx = sy.next != null ? S.c.next[S.v][sy.next][0] : null, h = '';
      for (var i = 0; i < 3; i++) {
        var id = sy.sup[i], s = id && supById(S, id);
        h += '<li class="cs-pyr-box' + (s ? '' : ' is-empty') + '">' + (s ? '<span class="cs-pyr-n lk-num">' + (i + 1) + '</span>' + E(supText(S, s)) +
          '<span class="cs-pyr-mv">' + (i > 0 ? '<button type="button" class="cs-link" data-act="mv" data-v="' + id + '" data-d="-1" data-k="mu-' + id + '" aria-label="Move reason ' + (i + 1) + ' earlier">Earlier</button>' : '') +
          (i < sy.sup.length - 1 ? '<button type="button" class="cs-link" data-act="mv" data-v="' + id + '" data-d="1" data-k="md-' + id + '" aria-label="Move reason ' + (i + 1) + ' later">Later</button>' : '') + '</span>'
          : '<span class="cs-dim">Reason ' + (i + 1) + '</span>') + '</li>';
      }
      return '<figure class="cs-pyr"><figcaption class="lk-k">Your answer, as the listener hears it</figcaption><div class="cs-pyr-top' + (g ? '' : ' is-empty') + '">' + (g ? E(govText(S, g)) : '<span class="cs-dim">Lead with your answer.</span>') + '</div>' +
        '<ol class="cs-pyr-row">' + h + '</ol><div class="cs-pyr-foot"><p><span class="lk-k">Risk</span> ' + (rk ? E(rk) : '<span class="cs-dim">Not chosen</span>') + '</p><p><span class="lk-k">Next</span> ' + (nx ? E(nx) : '<span class="cs-dim">Not chosen</span>') + '</p></div></figure>';
    }
    function updatePyr(fk) {
      var S = cur, w = viewEl.querySelector('.cs-pyr-w');
      if (!w || S.phase !== 'recommend') return;
      w.innerHTML = pyrHTML(S);
      var full = S.synth.sup.length >= 3, ok = S.synth.gov && S.synth.sup.length === 3 && S.synth.risk != null && S.synth.next != null;
      Array.prototype.forEach.call(viewEl.querySelectorAll('input[data-f="sup"]'), function (x) { x.disabled = full && !x.checked; });
      var b = viewEl.querySelector('[data-act="deliver"]'), s = viewEl.querySelector('.cs-dl-s');
      if (b) b.disabled = !ok;
      if (s) s.textContent = ok ? 'Three interview minutes.' : 'Choose a lead, three reasons, a risk and a next step.';
      if (fk) {
        var el = w.querySelector('[data-k="' + fk + '"]') || w.querySelector('[data-k="' + (fk.charAt(1) === 'u' ? 'md-' : 'mu-') + fk.slice(3) + '"]');
        if (el) K.focus(el);
      }
    }
    function pathTicks(S) {
      var tot = Math.max(S.budget + 8, S.clock), lane = { ex: 0, math: 1, so: 2, flag: 2, curve: 2 };
      var h = '<div class="cs-path" aria-hidden="true"><i class="cs-path-b" style="left:' + (100 * S.budget / tot).toFixed(2) + '%"></i>' + S.log.filter(function (e) { return e.k !== 'rec'; }).map(function (e) {
        return '<i class="cs-pt cs-pt--' + e.k + (e.ok === false || e.bad ? ' is-bad' : '') + (e.root ? ' is-root lk-foil-mark' : '') + '" style="left:' + (100 * e.t / tot).toFixed(2) + '%;--lane:' + lane[e.k] + '"></i>';
      }).join('') + '</div><p class="cs-path-l" aria-hidden="true"><span>Minute 0</span><span>Budget, minute ' + S.budget + '</span></p>' +
        '<p class="cs-path-key" aria-hidden="true"><span><i class="cs-key cs-key--ex"></i>Exhibit</span><span><i class="cs-key cs-key--math"></i>Math</span><span><i class="cs-key cs-key--so"></i>So-what, flag or curveball</span><span><i class="cs-key cs-key--bad"></i>Wrong or overreach</span><span><i class="cs-key cs-key--root"></i>The exhibit that decided it</span></p>';
      var desc = S.log.map(function (e) {
        var ex = e.id && find(S.c.ex, e.id);
        var t = e.k === 'ex' ? 'opened ' + ex.nm + (e.root ? ', the exhibit that decided it' : '') : e.k === 'math' ? (e.ok ? 'answered a calculation correctly' : 'missed a calculation') :
          e.k === 'so' ? (e.ok ? 'gave a sharp so-what' : 'gave a weak so-what') : e.k === 'flag' ? (e.ok ? (S.prompted ? 'found the planted error once it was pointed out' : 'caught a planted error') : 'flagged an exhibit that was fine') : e.k === 'curve' ? 'answered the curveball' : 'delivered the recommendation';
        return '<li>Minute ' + mins(e.t) + ': ' + t + '</li>';
      }).join('');
      return h + '<ol class="vh">' + desc + '</ol>';
    }
    function debriefSpec(S) {
      var c = S.c, R = S.result, v = S.v, n = S.n, g = S.synth.gov && find(c.gov, S.synth.gov), gk = g ? govKind(S, g) : null, hy = S.hyp && find(c.hyps, S.hyp);
      var rows = DIMS.map(function (d) {
        var s = R.sc[d[0]], ns = R.notes[d[0]];
        return '<li class="cs-sc-row"><span class="cs-sc-d">' + d[1] + '</span>' + K.meter(s, d[1] + ': ' + s + ' of 4') + '<span class="cs-sc-v lk-num">' + F.n(s, 1) + '</span><span class="cs-sc-w">' + word(s) + '</span>' +
          (ns.length ? '<ul class="cs-sc-n">' + ns.map(function (x) { return '<li class="' + (POS[x.k] ? 'is-pos' : 'is-neg') + '">' + E(noteText(x)) + '</li>'; }).join('') + '</ul>' : '') + '</li>';
      }).join('');
      var root = find(c.ex, c.root[v]), eff = c.eff[v].map(function (id) { return find(c.ex, id).nm; }), em = effMinutes(c, v);
      var you = S.seen.length ? 'You looked at ' + S.seen.length + ' ' + F.plural(S.seen.length, 'exhibit') + ' (' + S.seen.map(function (id) { return find(c.ex, id).nm; }).join(', ') + ')' + (R.rec ? ' and delivered at minute ' + mins(R.end) + ' of ' + S.budget + '.' : ' and ran out of time.') : 'You did not look at any data.';
      var effT = c.format === 'cand' ? 'The efficient path: ' + eff.join(', then ') + ', about ' + mins(em) + ' interview minutes with every question answered cleanly. The exhibit that decides this variant: ' + root.nm + '.'
        : 'In an interviewer-led case the path is set for you; the efficiency is in clean math and one-sentence implications. Clean answers on every exhibit, with the curveball, take about ' + mins(em) + ' minutes.';
      var why = c.format === 'cand' ? (has(S.seen.slice(0, 3), c.root[v]) ? 'You reached ' + root.nm + ' within your first three requests: the vital few, found early.' : 'Your first three requests did not include ' + root.nm + '. In a candidate-led case every detour is paid for in minutes.')
        : (S.curve != null ? 'You kept up with the interviewer; the minutes you spent went into the math and the so-whats.' : 'The interview moved on before you finished.');
      var cb = c.curves[S.curveIdx], co = S.curve != null ? cb.opts[S.curve] : null, real = c.real(v);
      var principles = PRINC[c.id].concat(c.id === 'cinema' && v === 'B' ? ['adverse'] : []);
      var nxt = CASES[(CASES.indexOf(c) + 1) % CASES.length], acts = [
        { label: 'Retake this case', primary: true, onClick: function () { startCase(c, { retake: S }); } },
        { label: 'New case', onClick: function () { startCase(c); } },
        { label: 'Next: ' + nxt.client, onClick: function () { startCase(nxt); } },
        { label: 'Back to the lobby', onClick: function () { renderLobby(true); } }];
      if (CASES.filter(function (x) { return data.last[x.id]; }).length >= 3) acts.splice(1, 0, { label: 'See the committee', onClick: function () { renderCommittee(); } });
      return {
        kicker: 'Scorecard · Case ' + pad(c.n) + ' · ' + c.client, title: R.verdict, sub: VERDICT[R.verdict],
        lede: R.rec ? 'Overall ' + F.n(R.overall, 1) + ' of 4. The notes under each dimension are tied to what you did, and the lessons below say what was true.' : 'Time ran out before a recommendation, so the verdict is capped at Lean no. The lessons below still say what was true.',
        stats: [{ k: 'Overall', v: F.n(R.overall, 1) }].concat(DIMS.map(function (d) { return { k: d[1], v: F.n(R.sc[d[0]], 1) }; })).concat([{ k: 'Clock', v: mins(R.end) + ' of ' + S.budget, tone: R.end > S.budget ? 'loss' : null }]),
        sections: [
          { label: 'The scorecard', html: '<ul class="cs-sc">' + rows + '</ul>' },
          { label: 'What was really going on', html: K.lesson({ title: 'This variant: ' + c.vname[v], you: g ? 'You led with: “' + govText(S, g) + '”' + (gk === 'right' ? ' That is the answer.' : gk === 'partial' ? ' Defensible, not the strongest.' : '') : 'You did not give a recommendation.',
            principle: c.truth(v, n), history: hy ? 'Your first bet: “' + find(c.hyps, S.hypFirst || S.hyp).t + '”' + (S.hypFirst && S.hypFirst !== S.hyp ? ' You finished on: “' + hy.t + '”' : '') + (has(c.truthHyp[v], S.hyp) ? ' It held.' : ' The data pointed elsewhere.') : 'You never stated a hypothesis.',
            labels: { you: 'What you said', principle: 'What was true', history: 'Your hypothesis' } }) },
          { label: 'The efficient path', html: K.lesson({ you: you, principle: effT, history: why, labels: { you: 'Your path', principle: 'The efficient path', history: 'Why it matters' } }) + pathTicks(S) },
          { label: 'In the real world', html: K.lesson({ you: co ? 'The interviewer said: “' + val(cb.t, S) + '” You chose: “' + val(co.t, S) + '”' : 'The curveball never came up.', principle: c.one, history: real.t, src: real.src,
            labels: { you: 'What you did', principle: 'The principle', history: 'What really happened' } }) }
        ],
        principles: principles, actions: acts
      };
    }
    function wScore(S) {
      return '<div class="cs-said"><p class="lk-kicker">What you said</p><blockquote class="cs-script">' + (S.said ? E(S.said) : 'Time ran out before you gave a recommendation.') + '</blockquote></div><div class="cs-db"></div>';
    }
    function workHTML(S) {
      return S.phase === 'brief' ? wBrief(S) : S.phase === 'clarify' ? wClarify(S) : S.phase === 'structure' ? wStruct(S) : S.phase === 'analyze' ? wAnalyze(S) : S.phase === 'recommend' ? wRec(S) : wScore(S);
    }
    function renderWork(fk, moved, nofocus) {
      var S = cur, w = viewEl.querySelector('.cs-work');
      if (!w || !S) return;
      var ae = document.activeElement, key = fk || (ae && w.contains(ae) ? ae.getAttribute('data-k') : null), keep = {};
      Array.prototype.forEach.call(w.querySelectorAll('[data-k]'), function (el) {
        var k = el.getAttribute('data-k');
        if (el.tagName === 'DETAILS') keep[k] = el.open; else if (el.type === 'checkbox') keep[k] = el.checked; else if (el.tagName === 'TEXTAREA' || el.type === 'text') keep[k] = el.value;
      });
      w.innerHTML = workHTML(S);
      sceneNote(w, S);
      Array.prototype.forEach.call(w.querySelectorAll('[data-k]'), function (el) {
        var k = el.getAttribute('data-k');
        if (!(k in keep)) return;
        if (el.tagName === 'DETAILS') el.open = keep[k]; else if (el.type === 'checkbox') el.checked = keep[k]; else if (el.tagName === 'TEXTAREA' || el.type === 'text') el.value = keep[k];
      });
      K.sfill(w);
      if (S.phase === 'recommend') updatePyr();
      if (S.phase === 'score') { K.debrief(w.querySelector('.cs-db'), debriefSpec(S)); K.sfill(w); return; }
      if (nofocus) return;
      var el = !moved && key ? w.querySelector('[data-k="' + key + '"]') : null;
      if (!el || el.disabled) el = w.querySelector('.cs-ph');
      if (el) K.focus(el, { scroll: true });
    }
    /* the logical next control after an action: an open question, a so-what, the next request */
    function nextKey(S) {
      if (S.curveOpen) return 'cb-0';
      if (S.phase !== 'analyze') return null;
      var ex = S.cur && find(S.c.ex, S.cur);
      if (ex) {
        var qs = qsOf(ex, S.v);
        for (var i = 0; i < qs.length; i++) {
          var a = S.ans[qs[i].id];
          if (a && a.done) continue;
          if (!qAvail(S, qs[i])) break;
          return qs[i].type === 'num' ? 'in-' + qs[i].id : qs[i].type === 'pick' ? 'pk-' + qs[i].opts[0][0] : 'mc-' + qs[i].opts[0][0];
        }
        if (qsDone(S, ex) && !S.so[ex.id]) return 'so-' + ex.id + '-0';
      }
      if (S.forced) return 'toRec';
      if (S.c.format === 'int') return S.optAsked && S.c.seq[S.seqPos + 1] === S.c.optional ? 'optYes' : 'cont';
      var un = S.c.ex.filter(function (x) { return !has(S.seen, x.id); })[0];
      return un ? 'rq-' + un.id : 'toRec';
    }
    function persist(S) {
      if (S.persisted) return;
      S.persisted = true;
      var R = S.result, c = S.c;
      data.plays[c.id] = (data.plays[c.id] || 0) + 1;
      var neg = [], pos = [];
      DIMS.forEach(function (d) { R.N[d[0]].forEach(function (x) { (POS[x.k] ? pos : neg).push(x.k); }); });
      data.last[c.id] = { seed: S.seed, v: S.v, k: S.k, S: R.sc.S, A: R.sc.A, J: R.sc.J, C: R.sc.C, overall: R.overall, verdict: R.verdict, ts: Date.now(), neg: neg, pos: pos };
      save();
      delete susp[c.id];
      shelf.refresh();
    }
    function after(moved, fk) {
      var S = cur;
      if (!S) return;
      if (S.over && S.phase !== 'score') finish(S);
      if (S.phase === 'score') persist(S);
      renderHead();
      sceneSync(false);
      renderWork(fk, moved);
    }

    /* ---------- lunch with a partner ---------- */
    var LV = [['lev', 'Leverage: juniors per partner', 2, 12, 1, 6], ['util', 'Utilization: share of hours billed', 50, 90, 1, 70], ['rate', 'Blended billing rate, dollars an hour', 250, 900, 10, 450],
      ['margin', 'Margin', 20, 45, 1, 33], ['growth', 'Firm growth a year', 0, 15, 1, 7]];
    function lunchOut() {
      var L = lunch.v, fees = L.rate * L.util / 100 * 2000, ppp = L.margin / 100 * fees * (L.lev + 1), odds = 7 * (0.05 + L.growth / 100) / L.lev;
      var say = L.lev >= 10 ? 'Very profitable, very crowded. At this shape most people you start with will leave, and the model counts on it.'
        : L.growth === 0 ? 'No growth, no promotions. Up-or-out without growth is mostly out.' : L.util >= 85 ? 'Nobody is thinking. Everybody is billing.'
          : L.util <= 55 ? 'Lovely training program. Terrible business.' : 'Profit per partner is margin times productivity times leverage. Every lever has a human on the other end of it.';
      return { fees: fees, ppp: ppp, odds: odds, say: say };
    }
    /* high odds read as a percentage; long odds as one in N, so 0.7 never prints as 1 in 1 */
    function oddsTxt(p) { p = Math.min(1, p); return p >= 0.4 ? 'about ' + F.prob(p) : 'about ' + F.oneIn(p); }
    function fmtL(k, v) { return k === 'lev' ? String(v) : k === 'rate' ? usd(v) : v + '%'; }
    function lunchModel() {
      var o = lunchOut();
      return '<div class="cs-lm"><p class="lk-kicker">The model on the napkin</p><div class="lk-strip cs-lm-out" style="--lk-cols:3">' + cell('Fees per professional', usd(o.fees)) + cell('Profit per partner', F.M(o.ppp / 1e6, 2)) +
        cell('Odds an analyst makes partner', oddsTxt(o.odds)) + '</div><p class="cs-partner" aria-live="polite"><span class="lk-chip">Iris</span>' + E(o.say) + '</p>' +
        LV.map(function (r) {
          var id = 'csl' + uid + r[0];
          return '<div class="lk-field"><label for="' + id + '">' + r[1] + '</label><output class="lk-range-out" for="' + id + '" data-o="' + r[0] + '">' + fmtL(r[0], lunch.v[r[0]]) + '</output>' +
            '<input type="range" id="' + id + '" min="' + r[2] + '" max="' + r[3] + '" step="' + r[4] + '" value="' + lunch.v[r[0]] + '" data-l="' + r[0] + '"></div>';
        }).join('') + '<p class="cs-note">Illustrative model, not any firm’s numbers. The two levers with a human on the other end are ' + tm('util', 'utilization') + ' and ' + tm('leverage', 'leverage') + '. Fees per professional are rate × utilization × 2,000 hours; profit per partner is margin × fees × (juniors + 1); the odds assume seven years to partner and 5 percent of partners leaving each year.</p>' +
        srcLine('David Maister’s professional-service-firm arithmetic.', [S_MAI1, S_MAI2]) + '</div>';
    }
    function renderLunch() {
      sceneKill();
      view = 'lunch'; cur = null;
      box.setAttribute('data-view', 'lunch');
      shelf.setMeta('');
      lunch = lunch || { step: 0, v: { lev: 6, util: 70, rate: 450, margin: 33, growth: 7 }, a: null };
      var L = lunch, h = '<div class="cs-lunch"><div class="cs-top"><button type="button" class="cs-link cs-back" data-act="lobby" data-k="lobby">← Back to the lobby</button></div>' +
        '<div class="lk-head"><p class="lk-kicker lk-kicker--foil">Between cases</p><h4 class="lk-title cs-lunch-h" tabindex="-1">Lunch with a partner</h4><p class="lk-lede">Between cases, a partner takes you to lunch. It is not scored, which is exactly what they want you to think.</p></div>' +
        '<p class="lk-line cs-line cs-line--int"><span class="lk-chip">Iris</span>Iris Aske, partner. BCG reported $14.4 billion of revenue for 2025 and 33,500 employees. Revenue per employee?</p>';
      if (L.a == null) h += '<form class="cs-q" data-act="lunchAns" novalidate><label class="cs-q-p" for="csla' + uid + '">Revenue per employee, in dollars</label><div class="cs-q-row"><input type="text" id="csla' + uid + '" inputmode="decimal" autocomplete="off" data-k="lunchIn"><span class="cs-unit">dollars</span><button type="submit" class="ebtn">Answer</button></div></form>';
      else {
        var ok = gradeNum(L.a, 14.4e9 / 33500, { tol: ['rel', 0.05, 0.12] }) !== 'wrong';
        h += '<p class="lk-line cs-line cs-line--you"><span class="lk-chip lk-chip--foil">You</span>' + E(usd(L.a)) + '.</p><p class="lk-line cs-line cs-line--int"><span class="lk-chip">Iris</span>' +
          (ok ? '' : 'It is $14.4 billion over 33,500 people. ') + 'About $430,000 a head. Now ask what a first-year consultant is paid, and you have discovered leverage.</p>' +
          srcLine('BCG’s own figures.', [S_BCGPR]) + lunchModel() +
          '<p class="lk-line cs-line cs-line--int cs-close"><span class="lk-chip">Iris</span>We hire for the analysis you will do in your first two years and the judgment you will need by year five. A case is the cheapest sample of both we have found. Eat something; you have another one at two.</p>' +
          '<div class="btnrow"><button type="button" class="ebtn" data-act="lobby" data-k="lobby2">Back to the lobby</button></div>';
      }
      viewEl.innerHTML = h + '</div>';
      K.sfill(viewEl);
      if (!data.lunch) { data.lunch = true; save(); }
      shelf.notes.unlock('firm', { where: 'Lunch with a partner' });
    }
    function lunchInput(el) {
      var k = el.getAttribute('data-l');
      lunch.v[k] = +el.value;
      var o = viewEl.querySelector('output[data-o="' + k + '"]');
      if (o) o.textContent = fmtL(k, lunch.v[k]);
      var r = lunchOut(), cells = viewEl.querySelectorAll('.cs-lm-out .lk-v'), p = viewEl.querySelector('.cs-partner');
      if (cells.length === 3) { cells[0].textContent = usd(r.fees); cells[1].textContent = F.M(r.ppp / 1e6, 2); cells[2].textContent = oddsTxt(r.odds); }
      if (p && p.lastChild && p.lastChild.nodeType === 3 && p.lastChild.nodeValue !== r.say) p.lastChild.nodeValue = r.say;
      K.sfill(viewEl);
    }

    /* ---------- the committee ---------- */
    function renderCommittee() {
      sceneKill();
      view = 'committee'; cur = null;
      box.setAttribute('data-view', 'committee');
      shelf.setMeta('');
      var cs = CASES.filter(function (c) { return data.last[c.id]; }), avg = {}, mean = 0, anyNo = false, cnt = {}, pc2 = {};
      DIMS.forEach(function (d) { avg[d[0]] = cs.reduce(function (s, c) { return s + data.last[c.id][d[0]]; }, 0) / cs.length; });
      cs.forEach(function (c) {
        var l = data.last[c.id];
        mean += l.overall / cs.length;
        if (l.verdict === 'No') anyNo = true;
        (l.neg || []).forEach(function (k) { if (NOTE[k]) cnt[k] = (cnt[k] || 0) + 1; });
        (l.pos || []).forEach(function (k) { if (NOTE[k]) pc2[k] = (pc2[k] || 0) + 1; });
      });
      mean = r1(mean);
      var weak = DIMS.slice().sort(function (a, b) { return avg[a[0]] - avg[b[0]]; })[0][1].toLowerCase(), minDim = Math.min(avg.S, avg.A, avg.J, avg.C), title, lede;
      if (mean >= 3 && minDim >= 2.5 && !anyNo) { title = 'Offer extended'; lede = 'The committee met for eleven minutes, which is a good sign. Offer extended.'; }
      else if (mean >= 2.6 && !anyNo) { title = 'Offer, with a development note'; lede = 'Offer, with a development note on ' + weak + '. Every offer letter has an invisible one.'; }
      else if (mean >= 2.2) { title = 'Waitlisted'; lede = 'The committee liked you and could not agree. Waitlisted, which is a real outcome and a survivable one.'; }
      else { title = 'No offer this cycle'; lede = 'No offer this cycle. The notes below say exactly what to practice, which is more than most rejection letters do.'; }
      function top(o, n) { return Object.keys(o).sort(function (a, b) { return o[b] - o[a]; }).slice(0, n); }
      function plainNote(k) { return PLAIN[k] || NOTE[k]; }
      var negs = top(cnt, 3), poss = top(pc2, 1);
      var tbl = table(['Case', 'Structure', 'Analytics', 'Judgment', 'Communication', 'Overall', 'Verdict'], cs.map(function (c) {
        var l = data.last[c.id];
        return [E(c.client), F.n(l.S, 1), F.n(l.A, 1), F.n(l.J, 1), F.n(l.C, 1), F.n(l.overall, 1), E(l.verdict)];
      }).concat([{ v: ['Average', F.n(avg.S, 1), F.n(avg.A, 1), F.n(avg.J, 1), F.n(avg.C, 1), F.n(mean, 1), ''], c: 'is-tot' }]), 'cs-comm-t');
      viewEl.innerHTML = '<div class="cs-comm"><div class="cs-top"><button type="button" class="cs-link cs-back" data-act="lobby" data-k="lobby">← Back to the lobby</button></div><div class="cs-db"></div></div>';
      K.debrief(viewEl.querySelector('.cs-db'), {
        kicker: 'The offer committee', title: title, lede: lede,
        stats: [{ k: 'Mean overall', v: F.n(mean, 1) }].concat(DIMS.map(function (d) { return { k: d[1], v: F.n(avg[d[0]], 1), tone: avg[d[0]] < 2.5 ? 'loss' : null }; })),
        sections: [
          { label: 'The file, latest attempt of each case', html: tbl },
          { label: 'Pooled notes', html: '<ul class="cs-pool">' + negs.map(function (k) { return '<li class="is-neg">' + E(plainNote(k)) + ' <span class="cs-dim">(' + times(cnt[k]) + ')</span></li>'; }).join('') +
            poss.map(function (k) { return '<li class="is-pos">' + E(plainNote(k)) + ' <span class="cs-dim">(' + times(pc2[k]) + ')</span></li>'; }).join('') + '</ul>' +
            '<p class="cs-note">A game rule, labeled as one: an offer needs a mean of 3.0 or better, no dimension below 2.5 and no case scored No; a mean of 2.6 with no case scored No earns an offer with a development note; 2.2 the waitlist.</p>' }
        ],
        principles: ['clarify', 'mece', 'hyp', 'pareto', 'soWhat', 'sanity', 'pyramid', 'firm'], take: true,
        actions: [{ label: 'Back to the lobby', primary: true, onClick: function () { renderLobby(true); } }]
      });
    }

    /* ---------- events: one delegated listener per kind, all guarded by the kit ---------- */
    function act(name, el) {
      var S = cur, v = el.getAttribute('data-v');
      if (name === 'drawing') { sceneShow(); return; }
      if (name === 'open') {
        var c = caseById(v);
        if (el.getAttribute('data-m') === 'resume' && susp[v]) { cur = susp[v]; view = 'case'; renderCase(true); }
        else startCase(c);
        return;
      }
      if (name === 'lobby') { renderLobby(true); return; }
      if (name === 'lunch') { renderLunch(); K.focus(viewEl.querySelector('.cs-lunch-h'), { scroll: true }); return; }
      if (name === 'committee') { renderCommittee(); return; }
      if (name === 'note') { shelf.notes.open(v); return; }
      if (name === 'lunchAns') {
        var x = parseAns(el.querySelector('input').value, '$', 1);
        if (isNaN(x)) return;
        lunch.a = x; renderLunch();
        var r = viewEl.querySelector('.cs-lm input[type=range]');
        if (r) K.focus(r, { scroll: true });
        return;
      }
      if (!S) return;
      if (name === 'more') {
        var t = viewEl.querySelector('.cs-talk'), open = !t.classList.contains('is-open');
        t.classList.toggle('is-open', open); el.setAttribute('aria-expanded', open ? 'true' : 'false');
        el.textContent = open ? 'Show less of the conversation' : 'Show the whole conversation';
        return;
      }
      switch (name) {
        case 'restate': restate(S, v); after(true); break;
        case 'ask':
          ask(S, v);
          var cl = S.ord.clarify, ci = cl.indexOf(v), nq = null;
          for (var z = 1; z < cl.length && !nq; z++) if (!has(S.asked, cl[(ci + z) % cl.length])) nq = cl[(ci + z) % cl.length];
          after(false, S.asked.length >= 3 || !nq ? 'toStruct' : 'q-' + nq); break;
        case 'toStruct': toStructure(S); after(true); break;
        case 'minute': minute(S, v === '1'); after(true); break;
        case 'card':
          if (has(S.tree, v)) S.tree.splice(S.tree.indexOf(v), 1); else if (S.tree.length < 5) { S.tree.push(v); if (find(S.c.cards, v).trap) unlock(S, 'framework'); }
          after(false, 'cd-' + v); break;
        case 'layout': layout(S); after(true); break;
        case 'keepTree': keepTree(S); after(true); break;
        case 'editTree': editTree(S); after(true); break;
        case 'hyp': S.hypFirst = v; setHyp(S, v); after(true); break;
        case 'hypOpen': S.hypOpen = !S.hypOpen; after(false, S.hypOpen ? 'sh-' + S.ord.hyps.filter(function (id) { return id !== S.hyp; })[0] : 'hypOpen'); break;
        case 'setHyp': setHyp(S, v); S.hypOpen = false; after(false, 'hypOpen'); break;
        case 'req': if (request(S, v)) { maybeCurve(S); after(false, S.curveOpen ? 'cb-0' : 'ex-' + v); } break;
        case 'answer': answer(S, v, el.querySelector('input').value); maybeCurve(S); after(false, nextKey(S)); break;
        case 'hint': hint(S, v); after(false, 'in-' + v); break;
        case 'pick': pick(S, v, el.getAttribute('data-o')); maybeCurve(S); after(false, nextKey(S)); break;
        case 'multi':
          var sel = Array.prototype.map.call(el.closest('fieldset').querySelectorAll('input:checked'), function (i) { return i.value; });
          if (!sel.length) { line(S, 'int', 'Pick at least one, or tell me none of them.'); return; }
          multi(S, v, sel); maybeCurve(S); after(false, nextKey(S)); break;
        case 'so': var p = v.split(':'); soWhat(S, p[0], +p[1]); maybeCurve(S); after(false, nextKey(S)); break;
        case 'flag': flag(S, v); after(false, 'fl-' + v); break;
        case 'cont': cont(S); after(false, S.curveOpen ? 'cb-0' : S.cur && !exDone(S, S.cur) ? 'ex-' + S.cur : nextKey(S)); break;
        case 'optYes': handNext(S); after(false, 'ex-' + S.cur); break;
        case 'curve': curveAns(S, +v); if (S.phase === 'recommend') after(true); else after(false, nextKey(S) || 'toRec'); break;
        case 'toRec': toRecommend(S); if (S.curveOpen) after(false, 'cb-0'); else after(true); break;
        case 'mv':
          var i = S.synth.sup.indexOf(v), j = i + (+el.getAttribute('data-d'));
          if (i < 0 || j < 0 || j > 2) return;
          S.synth.sup[i] = S.synth.sup[j]; S.synth.sup[j] = v;
          updatePyr((+el.getAttribute('data-d') < 0 ? 'mu-' : 'md-') + v); break;
        case 'deliver': deliver(S); after(false); break;
      }
    }
    K.on(root, 'click', '[data-act]', function (ev, el) { if (el.tagName === 'FORM' || el.tagName === 'INPUT') return; act(el.getAttribute('data-act'), el); });
    K.on(root, 'submit', 'form[data-act]', function (ev, f) { ev.preventDefault(); act(f.getAttribute('data-act'), f); });
    K.on(root, 'change', 'input[data-act="rec"]', function (ev, el) {
      var S = cur;
      if (!S || S.phase !== 'recommend') return;
      var f = el.getAttribute('data-f'), v = el.value;
      if (f === 'gov') S.synth.gov = v;
      else if (f === 'risk') S.synth.risk = +v;
      else if (f === 'next') S.synth.next = +v;
      else if (el.checked) { if (S.synth.sup.length < 3 && !has(S.synth.sup, v)) S.synth.sup.push(v); else if (S.synth.sup.length >= 3) el.checked = false; }
      else S.synth.sup = S.synth.sup.filter(function (x) { return x !== v; });
      updatePyr();
    });
    K.on(root, 'input', 'input[type=range][data-l]', function (ev, el) { if (lunch) lunchInput(el); });
    /* the lobby: a folder you point at or tab to brings its drawing up and warms the engine for the case room; leaving the
       desk puts the case in hand back */
    function hot(ev, el) { if (view !== 'lobby') return; heroShow(el.getAttribute('data-c')); need3d().then(null, function () {}); }
    K.on(root, 'pointerover', '.cs-folder', hot);
    K.on(root, 'focusin', '.cs-folder', hot);
    K.on(root, 'mouseleave', '.cs-folders', function (ev, el) {
      if (view !== 'lobby' || ev.target !== el || el.scrollWidth > el.clientWidth + 2) return;
      heroShow(featured().id);
    });

    renderLobby(false);
    K.hook(SLUG, {
      engine: ENG, scene: function () { return scn; },
      open: function (cid, v, k, errOn) { var c = caseById(cid); if (!c) return null; startCase(c, { dbg: { seed: 12345, v: v || c.order[0], k: k == null ? 1 : k, errOn: errOn == null ? false : !!errOn } }); return cur.n; },
      state: function () { return cur ? { cid: cur.cid, v: cur.v, k: cur.k, seed: cur.seed, errOn: cur.errOn, errEx: cur.errEx, curve: cur.curveIdx, phase: cur.phase, clock: cur.clock, seen: cur.seen.slice(), result: cur.result && { sc: cur.result.sc, P: cur.result.P, overall: cur.result.overall, verdict: cur.result.verdict } } : { view: view }; },
      sim: function (cid, v, k) {
        var c = caseById(cid), S = newAttempt(c, { seed: 1, v: v, k: k, errOn: false }), out = {};
        Object.keys(S.qmap).forEach(function (id) { var q = S.qmap[id].q; if (q.type !== 'multi') { var a = trueAns(S, id); out[id] = typeof a === 'number' ? Math.round(a * 100) / 100 : a; } });
        return out;
      }
    });
    return {};
  }
  var UID = 0;
  K.mount(SLUG, null, init);
})();
