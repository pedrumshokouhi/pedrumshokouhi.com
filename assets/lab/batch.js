/* The batch: a Y Combinator batch, the raise after it and the year after that, on one seeded engine.
   A run is a seed plus a log of choices; every random draw is made up front, so a different choice faces the same luck.
   Class prefix yb-. Everything that must be true is sourced in the case file; every company and person is invented. */
(function () {
  'use strict';
  var K = window.LAB_KIT;
  if (!K || K.v < 1) return;
  var SLUG = 'batch', F = K.fmt, M = Math;

  /* ---------- the ideas (all fictional) ---------- */
  var IDEAS = {
    LEDGER: { name: 'Ledgerline', sent: 'Month-end books for Shopify merchants, closed by software in a day.',
      who: 'Merchants doing $50K to $500K a month who dread the first week of every month.', kind: 'b2b', u: 1, arpa: 300,
      pull: [.55, .85], br: 1.0, ch: [.5, .8], mvp: 4, c0: .015, f: { schlep: 1 }, unit: ['merchant', 'merchants'], ind: 'e-commerce operators',
      person: 'Marisol sells candles on Shopify, about $80K a month. The first four days of every month disappear into spreadsheets.', dom: 'e-commerce operations' },
    PERMIT: { name: 'Permitpath', sent: 'Building permits for small contractors, filed in days instead of weeks.',
      who: 'Two-truck remodelers who lose a week of work every time a permit stalls.', kind: 'b2b', u: 1, arpa: 450,
      pull: [.6, .9], br: .7, ch: [.3, .55], mvp: 5, c0: .010, f: { schlep: 1, conf: 1 }, unit: ['contractor', 'contractors'], ind: 'remodelers',
      person: 'Theo runs a two-truck remodeling crew. One stalled permit cost him eleven working days in March.', dom: 'a city permitting office' },
    HAUL: { name: 'Axleday', sent: 'Invoices turned into cash in a day for five-truck fleets.',
      who: 'Fleet owners floating fuel and payroll for 45 days while brokers take their time.', kind: 'b2b', u: 1, arpa: 250,
      pull: [.5, .85], br: .9, ch: [.3, .6], mvp: 6, c0: .010, f: { schlep: 1, conf: 1 }, unit: ['fleet', 'fleets'], ind: 'trucking',
      person: 'Luz owns five trucks. She floats fuel and payroll for 45 days while brokers take their time.', dom: 'freight brokerage' },
    EVAL: { name: 'Evalkit', sent: 'Test suites for teams shipping AI features, so a prompt change can’t silently break production.',
      who: 'The one engineer at a 30-person startup who got paged because the chatbot invented a refund policy.', kind: 'b2b', u: 1, arpa: 500,
      pull: [.45, .8], br: 1.2, ch: [.6, .9], mvp: 4, c0: .018, f: { ent: 1 }, unit: ['team', 'teams'], ind: 'AI engineering',
      person: 'Anika is the only ML engineer at a 30-person startup. A prompt change broke refunds for a whole weekend.', dom: 'ML infrastructure', adj: 'EVALA' },
    CHAIR: { name: 'Chairside', sent: 'Fewer no-shows for dental practices, by text and by waitlist.',
      who: 'Office managers watching a $300 chair sit empty at 2:30 on a Tuesday.', kind: 'b2b', u: 1, arpa: 350,
      pull: [.4, .7], br: .8, ch: [.35, .6], mvp: 3, c0: .012, f: { conf: 1, ent: 1 }, unit: ['practice', 'practices'], ind: 'dental',
      person: 'Ruth manages a three-chair practice. Tuesday afternoons run 20% empty, and she knows every no-show by name.', dom: 'dental practice management', adj: 'CHAIRA' },
    BOARD: { name: 'Boardready', sent: 'An AI tutor for the nursing board exam that finds your weak spots and drills them.',
      who: 'New nursing graduates with a test date, a failed practice exam, and a job offer that depends on passing.', kind: 'consumer', u: 12, arpa: 39,
      pull: [.5, .8], br: 1.1, ch: [.6, .9], mvp: 3, c0: .030, f: { succ: 1 }, unit: ['student', 'students'], ind: 'nursing education',
      person: 'Jalen missed his first board exam by six questions. His hospital offer expires in ten weeks.', dom: 'nursing education', adj: 'BOARDA' },
    RECAP: { name: 'Recapr', sent: 'AI meeting notes, but better.', who: 'People who have meetings.', kind: 'consumer', u: 14, arpa: 25,
      pull: [.2, .45], br: 1.3, ch: [.5, .8], mvp: 2, c0: .045, f: { deriv: 1 }, unit: ['user', 'users'], ind: 'productivity software',
      person: 'We surveyed 200 people online and 71% said they’d try it.', dom: 'productivity software', adj: 'RECAPA' },
    PACK: { name: 'Packwalk', sent: 'A social network for dog owners in your neighborhood.', who: 'Dog owners, who mostly already have a group text.',
      kind: 'consumer', u: 50, arpa: 6, pull: [.15, .4], br: 1.2, ch: [.5, .8], mvp: 3, c0: .060, f: { sitcom: 1, comm: 1 }, unit: ['member', 'members'],
      ind: 'pet industry', person: 'My neighborhood has hundreds of dog owners, and they’d love to meet each other.', dom: 'dog ownership, and I have opinions', adj: 'PACKA' },
    /* adjacent ideas: only the adjacent-ask event reveals them. It fires when the true pull is under .50, or, for an idea whose
       users leave when they succeed (succ: students who pass), once it has launched */
    CHAIRA: { name: 'Chairside Auth', short: 'insurance pre-authorization', sent: 'Insurance pre-authorization for dental practices, filed before the patient sits down.',
      kind: 'b2b', u: 1, arpa: 400, pull: [.65, .85], br: .8, ch: [.35, .6], mvp: 3, c0: .012, f: {}, unit: ['practice', 'practices'], ind: 'dental', from: 'CHAIR' },
    EVALA: { name: 'Evalkit Assure', short: 'red-team test suites for AI features in regulated industries', sent: 'Red-team test suites for AI features in banks, insurers and hospitals.',
      kind: 'b2b', u: 1, arpa: 900, pull: [.6, .8], br: .7, ch: [.4, .6], mvp: 3, c0: .012, f: { ent: 1 }, unit: ['team', 'teams'], ind: 'AI engineering', from: 'EVAL' },
    RECAPA: { name: 'Recapr Clinical', short: 'session notes for licensed therapists', sent: 'Session notes for licensed therapists, drafted after every appointment.',
      kind: 'b2b', u: 5, arpa: 69, pull: [.6, .8], br: .8, ch: [.5, .7], mvp: 2, c0: .020, f: {}, unit: ['therapist', 'therapists'], ind: 'behavioral health', from: 'RECAP' },
    PACKA: { name: 'Packwalk Pro', short: 'scheduling and payments for independent dog walkers', sent: 'Scheduling and payments for independent dog walkers.',
      kind: 'b2b', u: 6, arpa: 49, pull: [.6, .85], br: .9, ch: [.5, .75], mvp: 3, c0: .025, f: {}, unit: ['walker', 'walkers'], ind: 'pet services', from: 'PACK' },
    BOARDA: { name: 'Boardready for Schools', short: 'a license for their nursing school', sent: 'Board-exam drills licensed to nursing programs, so every student starts in their final semester.',
      ask: 'Your best students cancel the week they pass, which is the goal and also the problem. Four of them, separately, asked whether their nursing school could buy it for next year’s class, and a program director wants a pilot.',
      kind: 'b2b', u: 1, arpa: 400, pull: [.6, .85], br: .7, ch: [.4, .6], mvp: 3, c0: .012, f: {}, unit: ['program', 'programs'], ind: 'nursing education', from: 'BOARD' }
  };
  var IDS = ['LEDGER', 'PERMIT', 'HAUL', 'EVAL', 'CHAIR', 'BOARD', 'RECAP', 'PACK', 'CHAIRA', 'EVALA', 'RECAPA', 'PACKA', 'BOARDA'];
  var LATE = ['BOARDA']; /* drawn after every older draw, so existing seeds keep their streams */

  /* ---------- the teams ---------- */
  var TEAMS = {
    solo: { l: 'Just you.', s: 'You are fast, you never argue, and nobody is there at 3 a.m.', base: 3, bm: .8, fric: null, rate: 0, drift: -2.5, score: .75, burn: 16000, duo: false,
      facts: 'Three blocks a week · builds at 0.8× · burn $16,000 a month' },
    friend: { l: 'Jonah, your college roommate.', s: 'An engineer you’d trust with your car keys. You’ve never disagreed about anything that mattered.', base: 4, bm: 1.0, fric: 10, rate: 1.5,
      drift: -3, score: 1.0, burn: 22000, duo: true, cof: 'Jonah', hidden: true, facts: 'Four blocks a week · builds at 1.0× · friction starts low and stays out of sight' },
    matched: { l: 'Priya, met through a cofounder-matching service six weeks ago.', s: 'A senior engineer who has shipped at scale. You’re still learning how she argues.', base: 4, bm: 1.2,
      fric: 20, rate: 2.0, drift: -3, score: 1.05, burn: 22000, duo: true, cof: 'Priya', facts: 'Four blocks a week · builds at 1.2× · friction starts at 20 and you can see it' }
  };

  /* ---------- the interview ---------- */
  var IVQ = [
    { q: 'What are you making?', a: [function (I) { return I.sent; }, function (I) { return 'An AI-native platform that transforms how ' + I.ind + ' work.'; },
      function () { return 'It’s hard to explain in a sentence. Can I show you the demo?'; }],
      miss: ['', 'Your first sentence was a category, not a product. Lose ‘AI-native’ by Demo Day.', 'If it can’t be said in a sentence, it isn’t understood yet. Fix that first.'] },
    { q: 'Who needs this so badly they’d use a bad first version?', a: [function (I) { return I.person; },
      function (I) { return 'Every ' + I.unit[0] + ' in America. It’s a $40 billion market.'; }, function () { return 'Once people see it, they’ll love it.'; }],
      miss: ['', 'A market size is not a user. Next time bring a name.', '‘They’ll love it once they see it’ is a hypothesis. So is everything else until you talk to users.'] },
    { q: 'Why you?', a: [function (I, T) { return T.duo ? 'I spent four years in ' + I.dom + '; ' + T.cof + ' has shipped this kind of system before.' : 'I spent four years in ' + I.dom + '. I know where the bodies are buried.'; },
      function () { return 'We want this more than anyone, and we’ll outwork everyone.'; }, function () { return 'Nobody else is doing this.'; }],
      miss: ['', 'Everyone we interview wants it. Tell us what you know that they don’t.', 'Somebody is always doing it. ‘Nobody’ usually means nobody has looked.'] }
  ];

  /* ---------- the weekly actions ---------- */
  var ACTS = [
    { id: 'talk', l: 'Talk to users', h: 'Ask about the last time the problem happened. Don’t pitch.' },
    { id: 'build', l: 'Build', h: 'Ship what users said, not what you imagined.' },
    { id: 'launch', l: 'Launch', h: 'Put it in front of strangers. Rough is fine.', max: 1 },
    { id: 'hands', l: 'Onboard by hand', h: 'Recruit and set up users yourself: the Collison installation. Two blocks a week at most.', max: 2 },
    { id: 'sell', l: 'Sell', h: 'Founder-led outreach. Leads become trials over two weeks.' },
    { id: 'raise', l: 'Raise', h: 'Investor coffees. Before Demo Day, mostly a distraction. After, the job.' },
    { id: 'office', l: 'Office hours', h: 'Thirty minutes with Wren. Brings a diagnosis and a number.', max: 1 },
    { id: 'rest', l: 'Rest', h: 'Sleep and exercise. Morale up, friction down.' },
    { id: 'hard', l: 'Hard conversation', h: 'Say the thing you’ve both been not saying. Uses both founders’ blocks.', max: 1, cost: 2 }
  ];
  var ANAME = {}; ACTS.forEach(function (a) { ANAME[a.id] = a.l; });

  /* ---------- the batchmates, the investors (fictional) ---------- */
  var MATES = [['Ironknot', 'robots that tie rebar'], ['Quillwright', 'AI drafts for patent attorneys'], ['Tallyhop', 'inventory counts for bars'],
    ['Gridpaper', 'interconnection paperwork for solar developers'], ['Coldframe', 'climate control for small greenhouses'], ['Dockroster', 'temp staffing for warehouses']];
  var ROLES = { breakout: [5, .12], strong: [3, .07], steady: [4, .06], slow: [2, .03], pivoter: [2, .01], fader: [2, .02] };
  var FUNDS = ['Cobalt Orchard', 'Birch & Pine', 'Kettle Fund', 'Blue Hour Capital', 'Switchgrass Seed', 'Parlor Ventures', 'Low Tide Capital',
    'Paper Kite Fund', 'Tanner Row', 'Grainhouse Partners', 'Flintfield Seed', 'Quiet Hours VC'];
  var ANGELS = ['An angel (former founder)', 'An angel (operator at a public company)', 'An angel (YC alum)'];

  /* ---------- knowledge: field notes, glossary, case file, takeaways ---------- */
  var PG = function (t, f) { return { t: 'Paul Graham: ' + t, u: 'https://paulgraham.com/' + f + '.html' }; };
  var SRC = {
    deal: { t: 'Y Combinator: The YC Deal', u: 'https://www.ycombinator.com/deal' },
    about: { t: 'Y Combinator: About', u: 'https://www.ycombinator.com/about' },
    apply: { t: 'Y Combinator: Apply', u: 'https://www.ycombinator.com/apply' },
    docs: { t: 'Y Combinator: SAFE financing documents', u: 'https://www.ycombinator.com/documents' },
    guide: { t: 'YC Post-Money Safe User Guide (PDF)', u: 'https://bookface-static.ycombinator.com/assets/ycdc/Website%20User%20Guide%20Feb%202023%20-%20final-28acf9a3b938e643cc270b7da514194d5c271359be25b631b025605673fa9f95.pdf' },
    deal18: { t: 'YC blog: New Standard Deal (2018)', u: 'https://www.ycombinator.com/blog/new-standard-deal' },
    growth: PG('Startup = Growth (2012)', 'growth'), aord: PG('Default Alive or Default Dead? (2015)', 'aord'), ds: PG('Do Things That Don’t Scale (2013)', 'ds'),
    mist: PG('The 18 Mistakes That Kill Startups (2006)', 'startupmistakes'), ideas: PG('How to Get Startup Ideas (2012)', 'startupideas'),
    ramen: PG('Ramen Profitable (2009)', 'ramenprofitable'), fr: PG('How to Raise Money (2013)', 'fr'), founders: PG('What We Look for in Founders (2010)', 'founders'),
    equity: PG('The Equity Equation (2007)', 'equity'), good: PG('Be Good (2008)', 'good'), start: PG('How Y Combinator Started (2012)', 'ycstart'),
    ess: { t: 'Geoff Ralston and Michael Seibel: YC’s Essential Startup Advice', u: 'https://www.michaelseibel.com/blog/yc-s-essential-startup-advice' },
    ss1: { t: 'YC blog: Startup School week 1 recap (Kevin Hale, Eric Migicovsky)', u: 'https://www.ycombinator.com/blog/startup-school-week-1-recap-kevin-hale-and-eric-migicovsky/' },
    ss2: { t: 'YC blog: Startup School week 2 recap (Michael Seibel)', u: 'https://www.ycombinator.com/blog/startup-school-week-2-recap-michael-seibel-adora-cheung-and-ilya-volodarsky/' },
    launch: { t: 'YC Library: How to launch (again and again), Kat Mañalac', u: 'https://www.ycombinator.com/library/6i-how-to-launch-again-and-again' },
    shm: { t: 'First Round Review: How Superhuman built an engine to find product/market fit', u: 'https://review.firstround.com/how-superhuman-built-an-engine-to-find-product-market-fit/' },
    dbx: { t: 'First Round Review: Drew Houston’s morph from hacker to hyper-growth CEO', u: 'https://review.firstround.com/drew-houstons-morph-from-hacker-to-hyper-growth-ceo/' },
    abnb: { t: 'Yahoo Finance (CNBC Make It): Airbnb’s CEO on the $40 cereal boxes', u: 'https://finance.yahoo.com/news/airbnb-ceo-says-40-cereal-171653849.html' },
    reddit: { t: 'Vice: How Reddit got huge: tons of fake accounts (2012)', u: 'https://www.vice.com/en/article/how-reddit-got-huge-tons-of-fake-accounts--2/' },
    ftc: { t: 'FTC: Final rule banning fake reviews and testimonials (2024)', u: 'https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials' },
    clerky: { t: 'Clerky: Legal Concepts for Founders, Formation', u: 'https://handbooks.clerky.com/legal-concepts/formation' },
    cfm: { t: 'Y Combinator: Co-Founder Matching', u: 'https://www.ycombinator.com/cofounder-matching' },
    vb: { t: 'Ventureburn: Y Combinator reduces investment size to $125k (2020)', u: 'https://ventureburn.com/2020/06/y-combinator-reduces-investment-size-to-125k-cites-economic-concerns/' },
    tp: { t: 'TechPoint Africa: Y Combinator’s $500k deal (2022)', u: 'https://techpoint.africa/2022/01/13/y-combinator-500k-deal' },
    cos: { t: 'Y Combinator company page: Airbnb (W09)', u: 'https://www.ycombinator.com/companies/airbnb' },
    cosStripe: { t: 'Y Combinator company page: Stripe (S09)', u: 'https://www.ycombinator.com/companies/stripe' },
    cosDropbox: { t: 'Y Combinator company page: Dropbox (S07)', u: 'https://www.ycombinator.com/companies/dropbox' },
    cosReddit: { t: 'Y Combinator company page: Reddit (S05)', u: 'https://www.ycombinator.com/companies/reddit' }
  };
  var NOTES = [
    { id: 'motto', term: 'Make something people want', note: 'YC’s motto. Paul Graham wrote that they came up with the phrase about a month after starting Y Combinator in 2005. Every instrument in this machine checks whether you have done it: growth, retention, and whether anyone would miss you.', src: [SRC.good], hint: 'you open the machine' },
    { id: 'sitcom', term: 'Sitcom ideas and the well', note: 'Paul Graham calls plausible-sounding ideas that nobody urgently wants made-up or sitcom ideas. The better shape is a well: a few people who want something badly beats many who want it a little. The test is who wants it enough to use a rough first version from a two-person startup they have never heard of. Here, sitcom ideas also inflate your early belief about demand until users correct it.', src: [SRC.ideas], hint: 'you see the three ideas' },
    { id: 'schlep', term: 'Schlep blindness', note: 'Founders unconsciously steer away from tedious, unglamorous problems; Paul Graham names the schlep filter and the unsexy filter, which is why those problems stay open. Permits, bookkeeping and freight invoices are schleps. Here they start with a pessimistic belief about demand, which talking to users corrects upward.', src: [SRC.ideas], hint: 'you see the three ideas' },
    { id: 'hale', term: 'Kevin Hale’s problem test', note: 'YC’s Kevin Hale judges a problem by whether it is popular, growing, urgent, expensive, mandatory or frequent; you want at least one. Then name the unfair advantage that makes you the one to solve it: the founder, the market, a product ten times better, a free acquisition channel, or network effects.', src: [SRC.ss1], hint: 'you see the three ideas' },
    { id: 'founders', term: 'What YC looks for', note: 'Paul Graham listed five qualities: determination, flexibility, imagination, naughtiness and friendship. Determination, he wrote, turned out to be the most important; above a certain threshold of intelligence, it is what matters most.', src: [SRC.founders], hint: 'you finish the interview' },
    { id: 'interview', term: 'The interview', note: 'For the Winter 2027 batch, YC says most interviews are held by video in November and December, that it typically decides the same day, and that everyone it interviews gets detailed feedback. Lead with one sentence about what you make that anyone could understand.', src: [SRC.apply], hint: 'you sit the interview' },
    { id: 'vest', term: 'Founder vesting', note: 'The common schedule is four years with a one-year cliff: a quarter of the shares vest at the first anniversary, then 1/48 a month. If a founder stops working for the company, it can buy back the unvested shares, usually at the original price. Investors often require vesting, even from a solo founder. The 83(b) election must be filed within 30 days of the stock being issued.', src: [SRC.clerky], hint: 'you decide about vesting' },
    { id: 'deal', term: 'YC’s standard deal', note: '$500,000 per company: $125,000 on a post-money SAFE for 7%, plus $375,000 on an uncapped SAFE with a most-favored-nation clause. No fees, and a right to keep investing in later rounds. The 7% is fixed; in price terms it values the company at about $1.79M post-money ($125,000 ÷ 7%).', src: [SRC.deal], hint: 'you sign the deal' },
    { id: 'equity', term: 'The equity equation', note: 'Paul Graham’s rule for any trade of equity: giving up n% is worth it only if it multiplies your expected outcome by more than 1 ÷ (1 − n). For YC’s 7% that is 1.075, an improvement of more than 7.5%. The same test applies to every SAFE and every hire’s options.', src: [SRC.equity], hint: 'you sign the deal' },
    { id: 'safe', term: 'Post-money SAFE', note: 'Ownership sold equals the investment divided by the post-money valuation cap: $500K on a $10M cap is 5%. The cap counts all the SAFE money but not the priced round, so SAFEs don’t dilute each other; they dilute the founders, and the priced round later dilutes everyone, SAFE holders included. YC introduced the SAFE in late 2013 and the post-money version in 2018.', src: [SRC.guide, SRC.docs], hint: 'you sign the deal' },
    { id: 'mfn', term: 'The MFN: your cheapest check prices YC too', note: 'YC’s $375K SAFE has no cap of its own. It converts on the terms of the lowest-cap SAFE (or better terms, such as a discount) issued between roughly the start of the batch and the priced round. At a $15M cap it is 2.5%; take a $10M angel check and it becomes 3.75%.', src: [SRC.deal], hint: 'an early check arrives or you set your Demo Day ask' },
    { id: 'talk', term: 'Talking to users', note: 'Eric Migicovsky’s five questions: What is the hardest part of doing this? Tell me about the last time. Why was it hard? What have you done to solve it? What don’t you love about what you tried? Don’t pitch, don’t ask hypotheticals, and let them talk.', src: [SRC.ss1], hint: 'you spend your first block talking to users' },
    { id: 'launch', term: 'Launch now, then again', note: 'Michael Seibel’s advice to Startup School founders: launch something bad quickly, and timebox version one, so a three-week launch gets only three weeks of spec. YC’s Kat Mañalac makes the case for launching again and again rather than once.', src: [SRC.ss2, SRC.launch], hint: 'you launch, or reach week 3 without launching' },
    { id: 'dontscale', term: 'Do things that don’t scale', note: 'Paul Graham: startups take off because founders make them take off, most often by recruiting users by hand. Stripe’s founders set new users up on the spot, the Collison installation. Airbnb’s went door to door in New York. Wufoo sent handwritten thank-you notes.', src: [SRC.ds], hint: 'you onboard your first users by hand' },
    { id: 'growth', term: 'Startup = growth', note: 'A startup is a company designed to grow fast. YC measures growth rate per week, ideally in revenue: 5 to 7% a week is good, 10% is exceptional, and 1% is a sign you haven’t figured it out yet. Over a year, 1% a week compounds to 1.7×, 5% to 12.6× and 10% to 142×.', src: [SRC.growth], hint: 'you log your first week of measurable growth' },
    { id: 'pmf', term: 'The 40% test', note: 'Sean Ellis’s product-market fit survey asks users how they would feel if they could no longer use the product. Companies where fewer than 40% say ‘very disappointed’ tend to struggle to grow. Superhuman measured 22% in 2017, 33% after segmenting its users, and 58% within three quarters.', src: [SRC.shm], hint: 'you survey your users at office hours' },
    { id: 'wom', term: 'Effort adds, fit compounds', note: 'Hand onboarding, founder sales and launches add a roughly fixed number of customers per block, so their growth rate falls as you get bigger. Only word of mouth from real fit (and later a scalable channel) compounds. The strip under the growth chart shows the handoff. This is a model insight, consistent with Do Things That Don’t Scale.', src: [SRC.ds], hint: 'you reach week 8' },
    { id: 'rivals', term: 'Ignore your competitors, mostly', note: 'YC’s pocket advice: early startups are more likely to die of suicide than murder, so ignore the competitor’s press release. The exception is one of Paul Graham’s 18 mistakes, the derivative idea, where the competitor is the reason nobody needs you.', src: [SRC.ess, SRC.mist], hint: 'a competitor raises a big round' },
    { id: 'distract', term: 'Big-company distractions', note: 'Three items from YC’s pocket advice: avoid long negotiated deals with big customers if you can, avoid corporate development queries from big companies, and avoid conferences unless they are the best way to get customers. The word ‘unless’ matters: in some markets the trade show is where the customers are.', src: [SRC.ess], hint: 'a big company comes calling' },
    { id: 'fire', term: 'Fire the customer who is killing you', note: 'A customer can cost more in time and focus than they pay. YC’s pocket advice says that sometimes you need to fire your customers, because they might be killing you. The machine shows the trade in blocks.', src: [SRC.ess], hint: 'a customer starts costing more than they pay' },
    { id: 'cofounders', term: 'Founder relationships', note: 'In 2006 Paul Graham wrote that about 20% of the startups YC had funded had lost a founder, and he listed fights between founders among the mistakes that kill startups. YC’s pocket advice: founder relationships matter more than you think. Here, friction builds with stress and falls with rest and hard conversations.', src: [SRC.mist, SRC.ess], hint: 'cofounder friction reaches 45, or boils over' },
    { id: 'raise', term: 'Be in fundraising mode or not', note: 'Paul Graham: fundraising should be a focused phase, not a background task. Meet investors in parallel, most promising first (breadth-first search weighted by expected value). Treat anything short of a definite offer as a no, close committed money quickly, and remember that what most investors think of you depends on what other investors think of you.', src: [SRC.fr], hint: 'you spend a block raising, or reach Demo Day' },
    { id: 'valuation', term: 'Don’t optimize for valuation', note: 'Paul Graham argues valuation matters less than founders think: get to yes before haggling, and his rule of thumb is not to sell more than 25% in this phase on top of what you sold earlier. YC’s pocket advice adds that valuation is not success, or even the probability of it. A high cap also raises the bar for your next round.', src: [SRC.fr, SRC.ess], hint: 'you set your Demo Day ask' },
    { id: 'prorata', term: 'Pro rata side letter', note: 'An optional side letter lets a SAFE holder buy into the round where the SAFE converts, up to its as-converted ownership. YC’s guide gives the math: pro rata allocation = A ÷ (1 − S) − A, where A is what the new investors buy and S is the ownership of the SAFEs holding pro rata. It dilutes everyone already on the cap table (founders, option holders and the SAFE holders themselves), not the new investors.', src: [SRC.guide], hint: 'an investor asks for a side letter, or you raise a Series A' },
    { id: 'dilution', term: 'Dilution multiplies', note: 'Founders keep (1 − options) × (1 − SAFEs) × (1 − Series A), where the Series A slice includes the new money, the SAFE pro rata and the new option pool. YC’s worked example: 15% in SAFEs, 8% in options, and a 25% Series A with pro rata and a 10% pool dilute the founders by 52.62%, leaving them 47.38%.', src: [SRC.guide], hint: 'you close a round' },
    { id: 'alive', term: 'Default alive or default dead', note: 'Paul Graham’s question: if expenses stay flat and revenue keeps growing at its recent rate, do you reach profitability on the money you have? The fatal pinch is default dead plus slow growth plus not enough time to fix it, and he calls hiring too fast by far the biggest killer of startups that raise money. Trevor Blackwell built a calculator for the question; this machine runs the same projection every turn.', src: [SRC.aord], hint: 'you reach the year after the batch' },
    { id: 'ramen', term: 'Ramen profitable', note: 'Paul Graham: revenue that just covers the founders’ living expenses. He lists four advantages: investors can’t take advantage of you, you look more fundable, morale improves, and, the one he calls possibly the most important, you don’t have to stop working on the company to raise money.', src: [SRC.ramen], hint: 'you skip the raise, or revenue covers the founders’ pay' },
    { id: 'cold', term: 'The cold start', note: 'Reddit’s cofounders filled the early site with posts from accounts they controlled, Steve Huffman said in a 2012 video. In the US today, the FTC’s 2024 rule bans fake reviews and testimonials, including ones attributed to people who don’t exist, and buying or selling fake social media indicators. Seed a community in the open.', src: [SRC.reddit, SRC.ftc], hint: 'the feed is empty (Packwalk only)' }
  ];
  var DEFS = {
    mrr: { t: 'MRR', d: 'Monthly recurring revenue: what customers pay you every month on plans that renew. It is the number the weekly growth rate is measured on.', note: 'growth' },
    wg: { t: 'Weekly growth', d: 'This week’s revenue divided by last week’s, minus one. Paul Graham’s yardstick: 5 to 7% a week is good, 10% is exceptional, 1% means you haven’t found it yet.', note: 'growth' },
    churn: { t: 'Churn', d: 'The share of customers you lose in a period. Growth has to outrun it before it counts. Low churn is the clearest sign of fit.', note: 'pmf' },
    cap: { t: 'Post-money valuation cap', d: 'The highest valuation at which a SAFE converts, measured after all the SAFE money. If the priced round is cheaper, the SAFE converts at the round’s price instead. At the cap, ownership = check ÷ cap: $500K on a $10M cap is 5%.', note: 'safe' },
    safe: { t: 'SAFE', d: 'Simple Agreement for Future Equity: money now for shares later, when the company raises a priced round. No interest and no maturity date. YC introduced it in late 2013.', note: 'safe' },
    mfn: { t: 'MFN', d: 'Most favored nation: the holder gets the best terms a later SAFE gets. YC’s $375K has no cap of its own, so it converts at your lowest cap.', note: 'mfn' },
    prorata: { t: 'Pro rata', d: 'The right to buy into the next round to keep your percentage. With a post-money SAFE it is an optional side letter, and it dilutes the existing holders, not the new investors.', note: 'prorata' },
    pool: { t: 'Option pool', d: 'Shares set aside for future hires. Series A investors usually ask for it to be topped up before they invest, so the top-up dilutes the existing holders, founders and SAFEs included, not the new investors.', note: 'dilution' },
    dil: { t: 'Dilution', d: 'Your percentage shrinking as new shares are issued. It multiplies: keep 85% after the SAFEs and 60% after the A and you keep 51% of the company, not 45%.', note: 'dilution' },
    cmgr: { t: 'CMGR', d: 'Compound monthly growth rate: the steady monthly rate that turns the starting number into the ending one. Three months from $10K to $13.3K is 10% a month. This machine measures it at constant prices, so a price change counts once, as a step, not as growth.', note: 'growth' },
    alive: { t: 'Default alive', d: 'If costs stay flat and revenue keeps growing at its recent rate, the company reaches profitability on the cash it has. If not, it is default dead.', note: 'alive' },
    burn: { t: 'Burn', d: 'Cash going out every month: salaries, servers, rent, ads. The runway question subtracts revenue from it.', note: 'alive' },
    runway: { t: 'Runway', d: 'How many months the cash lasts at the current gap between burn and revenue.', note: 'alive' },
    arr: { t: 'ARR', d: 'Annual recurring revenue: MRR times twelve. Series A conversations are usually held in ARR.' },
    pre: { t: 'Pre-money valuation', d: 'What the company is valued at just before the new money arrives. Pre-money plus the new money is post-money.', note: 'dilution' },
    vest: { t: 'Vesting', d: 'Earning your shares over time. The usual founder schedule: a quarter after one year (the cliff), then monthly for three more years.', note: 'vest' },
    pmf: { t: 'Product-market fit', d: 'A product that a real market pulls from you, instead of you pushing it. The working test here: 40% of users would be very disappointed without it.', note: 'pmf' },
    wom: { t: 'Word of mouth', d: 'Customers bringing customers. In this model it is the only channel that compounds: it grows with how many users you have and how much they love the product.', note: 'wom' }
  };
  var TAKE = [
    'Make something people want, and measure it: ask users how they would feel if you vanished, and aim for 40% saying very disappointed.',
    'Your belief about demand is biased until it meets users. Exciting ideas feel bigger than they are; schleps feel smaller. Ask about the last time the problem happened, not about your idea.',
    'Launch before you are ready, then launch again. The first launch is for learning, not for glory.',
    'Do things that don’t scale to start the fire. Effort adds customers; only fit and word of mouth multiply them.',
    'Weekly growth is the report card: 5 to 7% is good, 10% exceptional, 1% still searching (Paul Graham). Small bases flatter everyone, so what matters is keeping the streak.',
    'Post-money SAFE: ownership = check ÷ post-money cap. SAFEs dilute you, not each other. YC’s $375K MFN takes your lowest cap, so the cheapest check you sign also prices YC.',
    'Dilution multiplies: founders keep (1 − options) × (1 − SAFEs) × (1 − Series A), and pro rata plus the new option pool sit inside the Series A slice.',
    'Every month, ask whether you are default alive. Hire after the product works, vest founder shares, and have the hard conversation before it has you.'
  ];
  var ASOF = 'September 30, 2026';
  var CASE = {
    lede: 'What is real, what is a model assumption, and what is invented. The program facts and the math are Y Combinator’s own; the companies and people are not. Educational only: not legal, tax or investment advice. For a real round, read the documents themselves and talk to a lawyer.',
    facts: [
      { text: 'YC runs four batches a year (winter, spring, summer and fall), and the program lasts three months. Startups are sorted into groups led by partners, and each group is split into sections of 6 to 10 companies. Partners hold group office hours every two weeks and one-on-one office hours as often as founders want. On Demo Day the batch presents to specially selected investors and press.', src: [SRC.about] },
      { text: 'Winter 2027: applications due November 2 at 8pm PT; decisions by December 11 for on-time applicants; the batch runs January to March, in person in San Francisco. Most interviews are by video in November and December, decisions typically come the same day, and everyone interviewed gets detailed feedback.', asOf: ASOF, src: [SRC.apply] },
      { text: 'The standard deal: $500,000, as $125,000 on a post-money SAFE for 7% and $375,000 on an uncapped SAFE with an MFN that converts on the terms of the lowest-cap SAFE (or better terms, such as a discount) issued between around the start of the batch and the priced round. No fees, and a right to invest in later rounds. YC’s example: at a $15M post-money cap, the $375K is 2.5%.', asOf: ASOF, src: [SRC.deal] },
      { text: 'The deal has changed over time. Airbnb’s deal in the Winter 2009 batch was reported as $20,000 for 6%. It was $120,000 for 7% until 2018, then $150,000 for 7% on a post-money SAFE; it was reported as $125,000 for 7% from the Winter 2021 batch, and the $500,000 structure was announced in January 2022.', src: [SRC.abnb, SRC.deal18, SRC.vb, SRC.tp] },
      { text: 'YC introduced the SAFE in late 2013 and the post-money SAFE in 2018. Ownership sold = investment ÷ post-money cap. SAFEs are not diluted by each other but are diluted by the priced round, and pro rata rights moved to an optional side letter. The guide’s worked example (15% SAFEs, 8% options, a 25% Series A with pro rata and a 10% pool) totals 52.62% dilution.', src: [SRC.guide, SRC.docs] },
      { text: 'Airbnb (W09) sold cereal boxes themed on the 2008 presidential candidates at $40 a box, raising about $30,000. Stripe (S09) gave its name to the Collison installation. A Dropbox (S07) demo video took the beta wait list from 5,000 to 75,000 within a day. Reddit (S05) was seeded early with posts from accounts its founders controlled.', src: [SRC.abnb, SRC.ds, SRC.dbx, SRC.reddit, SRC.cos, SRC.cosStripe, SRC.cosDropbox, SRC.cosReddit] },
      { text: 'Y Combinator began on March 11, 2005, founded by Paul Graham, Jessica Livingston, Robert Morris and Trevor Blackwell; the first program funded a batch of startups at once over a summer.', src: [SRC.start] },
      { text: 'Every principle the machine grades is attributed to its author in the field notes: Paul Graham’s essays, Geoff Ralston and Michael Seibel’s pocket advice, Eric Migicovsky and Kevin Hale at Startup School, Sean Ellis’s 40% test as documented by Superhuman, and founder vesting as Clerky explains it.', src: [SRC.growth, SRC.ess, SRC.ss1, SRC.shm, SRC.clerky] }
    ],
    assumptions: [
      'Every number the machine generates comes from labeled formulas: each idea’s hidden demand and channel ranges, conversion, churn, word of mouth, investor interest and cap tolerance, the Series A bar and revenue multiple, and the market’s heat. They are tuned to teach shapes (effort adds, fit compounds; your lowest cap prices the MFN; dilution multiplies), not to predict any real company.',
      'Costs: $22,000 a month of burn for two founders in the batch ($16,000 solo); $20,000 a month per hire, fully loaded (a $190,000 salary plus taxes and benefits); founder pay after the raise of $24,000 a month for two founders if you raised $750K or more, $16,000 if not. All $500,000 of YC money arrives on day one.',
      'Cap table simplifications: YC’s own 7% SAFE is a fixed percentage and does not set the MFN’s cap; a SAFE converts at the Series A pre-money when that is below its cap; YC’s participation right is modeled as pro rata; the Series A tops the pool up to a fixed 10%; a departing vested cofounder keeps a quarter at the one-year cliff and 1/48 a month after that.',
      'The Series A bar (ARR, growth, market, default alive) and its multiple are this machine’s own rule of thumb, not a market statistic. So is the Demo Day pricing curve.',
      'Price and focus in the year after: what customers will pay rises with demand and fit. A price change moves revenue once, and growth is measured at constant prices; a raise loses some customers at once, more when it comes within four months of the last one, and above what they will pay, churn stays higher and referrals slow. Product work pays most while fit has room to grow; growth work amplifies fit above about 40 and lets it slip below that; efficiency trades 10% of the team’s capacity for 15% of the burn.'
    ],
    fiction: [
      'Ledgerline, Permitpath, Axleday, Evalkit, Chairside, Boardready, Recapr and Packwalk, and their adjacent ideas; the batchmates (Ironknot, Quillwright, Tallyhop, Gridpaper, Coldframe, Dockroster); every fund and angel (Cobalt Orchard, Birch & Pine, Paper Kite Fund and the rest); Wren Halloway, Jonah, Priya, Callum Reyes and Mara; every event and every number the engine draws.',
      'No real YC partner, founder or investor is a character. Real people appear only as the authors of their published advice. Y Combinator has no involvement with this page.'
    ],
    sources: [SRC.deal, SRC.about, SRC.apply, SRC.docs, SRC.guide, SRC.deal18, SRC.vb, SRC.tp, SRC.growth, SRC.aord, SRC.ds, SRC.mist, SRC.ideas, SRC.ramen, SRC.fr,
      SRC.founders, SRC.equity, SRC.good, SRC.start, SRC.ess, SRC.ss1, SRC.ss2, SRC.launch, SRC.shm, SRC.dbx, SRC.abnb, SRC.reddit, SRC.ftc, SRC.clerky, SRC.cfm, SRC.cos, SRC.cosStripe, SRC.cosDropbox, SRC.cosReddit]
  };

  /* ---------- engine: pure state, one logged action at a time ---------- */
  var DECK = ['LOGO', 'CORPDEV', 'EXPO', 'RIVAL', 'WHALE', 'ANGEL', 'OUTAGE', 'PRICE', 'HIRE', 'COLD'];
  var EVIDS = DECK.concat(['ADJ', 'KARMA', 'FLASH', 'BURN', 'SPLIT', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'MARA']);
  var PIVL = { Ironknot: 'rebar inspection by drone', Quillwright: 'AI drafts for trademark filings', Tallyhop: 'payroll for bars',
    Gridpaper: 'permits for EV chargers', Coldframe: 'greenhouse crop insurance', Dockroster: 'forklift certification' };
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; }
  function r1(v) { return M.round(v * 10) / 10; }
  function cloneS(S) { var p = S.pd; S.pd = null; var c = JSON.parse(JSON.stringify(S)); S.pd = p; c.pd = p; return c; }
  function Phi(x) {
    var t = 1 / (1 + .3275911 * M.abs(x) / M.SQRT2), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - .284496736) * t + .254829592) * t * M.exp(-x * x / 2);
    return .5 * (1 + (x < 0 ? -y : y));
  }
  function money(v) { return M.abs(v) >= 1e6 ? F.M(v / 1e6, M.abs(v) >= 1e7 ? 1 : 2) : M.abs(v) >= 1e4 ? (v < 0 ? F.minus : '') + '$' + F.n(M.abs(v) / 1000, M.abs(v) >= 1e5 ? 0 : 1) + 'K' : F.usd(v); }
  function capM(v) { return '$' + F.n(v, v % 1 ? 1 : 0) + 'M'; }

  function mkPd(seed) {
    var rI = K.rng(seed), rE = K.rng(seed + 101), rM = K.rng(seed + 202), rV = K.rng(seed + 303), rB = K.rng(seed + 404), pd = {}, i, w;
    pd.deal3 = rI.shuffle([['RECAP', 'PACK'][rI.int(2)], ['LEDGER', 'PERMIT', 'HAUL'][rI.int(3)], ['EVAL', 'CHAIR', 'BOARD'][rI.int(3)]]);
    pd.iq = {};
    IDS.forEach(function (id) { if (LATE.indexOf(id) < 0) pd.iq[id] = [rI(), rI()]; });
    pd.ivo = [rI.shuffle([0, 1, 2]), rI.shuffle([0, 1, 2]), rI.shuffle([0, 1, 2])];
    pd.zW = []; for (w = 0; w <= 16; w++) pd.zW.push(rM.normal());
    pd.zM = []; for (w = 0; w <= 18; w++) pd.zM.push(rM.normal());
    pd.zVD = []; for (i = 0; i < 16; i++) pd.zVD.push(rM.normal());
    var hu = rM();
    pd.heat = hu < .25 ? .8 : hu < .75 ? 1 : 1.25;
    pd.zA = [rM.normal(), rM.normal(), rM.normal()];
    pd.acq = 3 + 3 * rM();
    pd.evOrder = rE.shuffle(DECK.slice());
    pd.uS = []; for (w = 0; w <= 16; w++) pd.uS.push(rE());
    pd.ue = {};
    EVIDS.forEach(function (id) { pd.ue[id] = [rE(), rE(), rE()]; });
    pd.uCold = []; for (w = 0; w <= 16; w++) pd.uCold.push(rE());
    pd.uK = [rE(), rE(), rE()];
    pd.a3o = rE.shuffle(['A3', 'A4', 'A5', 'A6']);
    pd.uA3 = []; for (i = 0; i < 7; i++) pd.uA3.push(rE());
    pd.inv = [];
    var fk = 0, RN = ['II', 'III', 'IV', 'V', 'VI', 'VII'];
    for (i = 0; i < 80; i++) {
      var t = rV(), ty = t < .2 ? 'lead' : t < .55 ? 'seed' : 'angel', cu = rV(), pu = rV();
      var chk = ty === 'lead' ? 500 + 1000 * cu : ty === 'seed' ? 150 + 350 * cu : 25 + 75 * cu;
      var v = { ty: ty, chk: M.round(chk / 25) * 25000, pr: pu < (ty === 'lead' ? .7 : ty === 'seed' ? .4 : .05), zT: rV.normal(), zB: rV.normal(), u1: rV(), u2: rV(), u3: rV(), an: rV.int(3) };
      v.name = ty === 'angel' ? ANGELS[v.an] : FUNDS[fk % FUNDS.length] + (fk >= FUNDS.length ? ' ' + RN[M.floor(fk / FUNDS.length) - 1] : '');
      if (ty !== 'angel') fk++;
      pd.inv.push(v);
    }
    var roles = rB.shuffle(['breakout', 'strong', 'steady', 'slow', 'pivoter', 'fader']);
    pd.mates = MATES.map(function (m, k) {
      var ro = roles[k], R = ROLES[ro], m0 = 1000 + 2000 * rB(), mrr = [0], val = 0;
      for (w = 1; w <= 16; w++) {
        var z = rB.normal(), g = ro === 'pivoter' ? (w >= 8 ? .09 : .01) : ro === 'fader' ? (w >= 8 ? 0 : .02) : R[1];
        if (w === R[0]) val = m0; else if (w > R[0]) val = val * (1 + g) * M.exp(.08 * z);
        mrr.push(val);
      }
      return { name: m[0], line: m[1], role: ro, mrr: mrr };
    });
    /* appended draws: the later ideas, then each idea's true error in your first read of demand */
    LATE.forEach(function (id) { pd.iq[id] = [rI(), rI()]; });
    pd.bz = {}; IDS.forEach(function (id) { pd.bz[id] = rI.normal(); });
    return pd;
  }

  function create(seed) {
    seed = M.floor(+seed) || 10000;
    return { v: 1, seed: seed, pd: mkPd(seed), phase: 'intro', sub: '', week: 0, turn: -1,
      ideaId: null, idea: null, orig: null, passed: [], adjSeen: null, pivots: [],
      mode: null, team: null, vest: null, split: null, iv: { picks: [], score: 0, clarity: .94 },
      ins: 0, Q: 0, fit: 0, dl: 0, dlTo: 0, tp: 0, N: 0, MRR: 0, arpaNew: 0, priceConv: 1, womMul: 1,
      launched: false, launches: 0, fat: 1, firstLaunch: null, lastLaunch: null, signups: 0, pmul: 1,
      cash: 0, burnM: 0, warmth: 0, karma: 0, early: 0, morale: 70, fric: 0, aligned: 0, peakFric: 0, lastFlash: -9, lastBurn: -9, slow: 0,
      locks: [], cb: [], rx: null, hardN: 0, adjId: null, ev: null, evLog: [], deckN: 0, flags: {}, choices: {},
      hires: [], safes: [], dd: null, raise: null, a3: null, A: null, ts: null, sa: [],
      tot: { talk: 0, build: 0, launch: 0, hands: 0, sell: 0, raise: 0, office: 0, rest: 0, hard: 0, talk4: 0, avail4: 0, raisePre: 0 },
      h: { mrr: [0], g: [null], src: [null], fit: [0] }, mon: [null], surveys: [], lastPlan: null,
      journal: [], nq: [], met: [], report: null, ending: null, dead: false, bot: null };
  }

  /* ---------- small readers ---------- */
  function U(S, id, where) {
    if (S.bot) return;
    if (S.met.indexOf(id) < 0) S.met.push(id);
    S.nq.push({ id: id, where: where || whereOf(S) });
  }
  function whereOf(S) {
    if (S.phase === 'week' || (S.phase === 'dd' && S.week > 12)) return S.week <= 12 ? 'Week ' + S.week : 'The raise, week ' + (S.week - 12);
    if (S.phase === 'dd') return 'Demo Day';
    if (S.phase === 'turn' || S.phase === 'end') return S.turn >= 0 ? 'Months ' + (5 + 2 * S.turn) + ' to ' + (6 + 2 * S.turn) : 'The debrief';
    if (S.phase === 'closed') return 'The close';
    return 'The application';
  }
  /* one tag for one moment: weeks W1 to W12, raise weeks R1 to R4, and the two months of a turn, M5–6 to M17–18 */
  function atTag(S) { return S.turn >= 0 ? 'M' + (5 + 2 * S.turn) + '–' + (6 + 2 * S.turn) : S.week > 12 ? 'R' + (S.week - 12) : S.phase === 'dd' ? 'DD' : S.week > 0 ? 'W' + S.week : ''; }
  function J(S, who, txt) {
    if (S.bot) return;
    S.journal.push({ at: atTag(S), who: who, txt: txt });
  }
  function cof(S) { return S.team && S.team.cof ? S.team.cof : 'A friend'; }
  function duo(S) { return !!(S.team && S.team.duo && !S.split); }
  function unitW(S, n) { return M.round(n) === 1 ? S.idea.unit[0] : S.idea.unit[1]; }
  function resolveIdea(S, id) {
    var b = IDEAS[id], q = S.pd.iq[id], o = {};
    for (var k in b) if (Object.prototype.hasOwnProperty.call(b, k)) o[k] = b[k];
    o.id = id;
    o.pull = b.pull[0] + q[0] * (b.pull[1] - b.pull[0]);
    o.ch = b.ch[0] + q[1] * (b.ch[1] - b.ch[0]);
    return o;
  }
  function beliefWord(c) { return c < .30 ? 'a puddle' : c < .55 ? 'some want it' : c < .75 ? 'a real well' : 'urgent'; }
  function belief(S, I, ins) {
    I = I || S.idea; ins = ins == null ? S.ins : ins;
    var f = I.f || {}, bias = f.sitcom || f.deriv ? .15 : f.schlep ? -.10 : 0, k = 1 - ins / 100;
    /* a seeded error on top of the known bias, shrinking as insight grows: the band usually holds the truth, the centre is a guess */
    var z = S.pd.bz && I.id ? clamp(S.pd.bz[I.id] || 0, -2, 2) : 0, noise = .5 * (.06 + .30 * k) * z * k;
    var c = clamp(I.pull + bias * k + noise, .03, .97), half = .06 + .30 * k;
    return { c: c, lo: M.max(0, c - half), hi: M.min(1, c + half), half: half, word: beliefWord(c),
      suf: half > .20 ? ' (mostly a guess)' : half > .12 ? ' (unsure)' : '' };
  }
  function g4(S, w, minPrev) {
    w = w == null ? S.week : w; minPrev = minPrev || 500;
    var gs = [];
    for (var k = w; k >= 1 && gs.length < 4; k--) { var p = S.h.mrr[k - 1]; if (p >= minPrev && S.h.mrr[k] != null) gs.push(S.h.mrr[k] / p); }
    if (!gs.length) return { g: null, n: 0 };
    var pr = 1; gs.forEach(function (x) { pr *= x; });
    return { g: M.pow(pr, 1 / gs.length) - 1, n: gs.length };
  }
  function streak(S, w) { var n = 0; for (var k = w; k >= 1; k--) { if (S.h.g[k] != null && S.h.g[k] >= .05) n++; else break; } return n; }
  function bestStreak(S) { var b = 0, n = 0; for (var k = 1; k < S.h.g.length; k++) { if (S.h.g[k] != null && S.h.g[k] >= .05) { n++; if (n > b) b = n; } else n = 0; } return b; }
  function raisedOut(S) { return sum(S.safes.map(function (s) { return s.amt; })); }
  function payOf(S) { var big = raisedOut(S) >= 750000; return duo(S) ? (big ? 24000 : 16000) : (big ? 12000 : 8000); }
  function hiresN(S) { return S.hires.length; }

  /* ---------- blocks and locks ---------- */
  function locksAt(S, w) { return S.locks.filter(function (l) { return l.from <= w && l.left > 0 && (!l.alt || (w - l.from) % 2 === 0); }); }
  function blocksAt(S, w) {
    var b = (S.split ? 3 : S.team.base) + S.hires.filter(function (h) { return h.rw != null && h.rw <= w; }).length;
    if (S.morale < 30) b--;
    if (duo(S) && S.fric >= 70) b--;
    return M.max(1, b);
  }
  function lockedAt(S, w) { return sum(locksAt(S, w).filter(function (l) { return !l.extra; }).map(function (l) { return l.n; })); }
  function freeAt(S, w) { return M.max(0, blocksAt(S, w) - lockedAt(S, w)); }
  function emptyPlan() { return { talk: 0, build: 0, launch: 0, hands: 0, sell: 0, raise: 0, office: 0, rest: 0, hard: 0 }; }
  function planCost(P) { var c = 0; ACTS.forEach(function (a) { c += (P[a.id] || 0) * (a.cost || 1); }); return c; }
  function why(S, id, P) {
    if (id === 'launch' && S.Q < 60) return 'Needs a rough prototype first (60% built).';
    if (id === 'sell' && S.Q < 60) return 'Needs a rough prototype first.';
    if (id === 'hands' && !S.launched && !(P && P.launch)) return 'Needs a launch first.';
    if (id === 'hard' && !duo(S)) return 'Needs a cofounder.';
    return '';
  }
  function cleanPlan(S, P) {
    var out = emptyPlan(), free = freeAt(S, S.week);
    ACTS.forEach(function (a) {
      var n = M.max(0, M.floor(+P[a.id] || 0));
      if (a.max) n = M.min(n, a.max);
      if (why(S, a.id, out)) n = 0;
      while (n > 0 && planCost(out) + (a.cost || 1) > free) n--;
      out[a.id] = n;
    });
    return out;
  }

  /* ---------- the weekly step (Acts I and II) ---------- */
  function core(S, P, o) {
    o = o || {};
    var I = S.idea, w = S.week, pull = I.pull, ch = I.ch, u = I.u, i, eff, L = locksAt(S, w);
    function pm(a) { return S.rx && S.rx.w === w && S.rx.a === a ? 1.25 : 1; }
    var lb = sum(L.filter(function (l) { return l.as === 'build'; }).map(function (l) { return l.n; }));
    var lb0 = sum(L.filter(function (l) { return l.as === 'build0'; }).map(function (l) { return l.n; }));
    for (i = 0; i < P.talk; i++) {
      eff = (i < 2 ? 1 : .5) * pm('talk');
      S.ins += 11 * eff * (S.launched ? 1.25 : 1) * (1 - S.ins / 100);
      if (S.launched) S.dl += .002 * eff;
    }
    var nb = P.build + lb;
    for (i = 0; i < nb; i++) {
      eff = (i < 2 ? 1 : .7) * (i < P.build ? pm('build') : 1);
      S.Q = M.min(100, S.Q + eff * S.team.bm * 100 / I.mvp);
      S.fit += 8 * eff * S.team.bm * (.15 + .85 * S.ins / 100) * (S.launched ? 1.4 : 1) * (1 - S.fit / 100);
    }
    for (i = 0; i < lb0; i++) S.Q = M.min(100, S.Q + (i < 2 ? 1 : .7) * S.team.bm * 100 / I.mvp);
    var launchedNow = false;
    if (P.launch && S.Q >= 60) {
      var lt = u * 20 * ch * S.fat * (.3 + pull) * (.4 + .6 * M.min(1, S.Q / 100)) * pm('launch');
      S.tp += lt; S.signups += lt;
      if (!S.launched) { S.ins += 10 * (1 - S.ins / 100); S.firstLaunch = w; launchedNow = true; }
      S.launched = true; S.launches++; S.lastLaunch = w; S.fat = M.max(.3, S.fat * .6);
    }
    var sc = S.launched ? M.min(2, P.hands) : 0, hands = 0;
    for (i = 0; i < sc; i++) {
      hands += u * (.2 + 2.6 * pull) * (.3 + .7 * S.fit / 100) * pm('hands') * S.priceConv;
      S.dl += .002; S.ins += 4 * (1 - S.ins / 100);
    }
    S.dl = M.min(S.dl, S.dlTo >= w ? .016 : .012);
    if (S.Q >= 60) for (i = 0; i < P.sell; i++) { eff = (i < 2 ? 1 : .6) * pm('sell'); var st = u * 3 * ch * (.5 + pull) * eff; S.tp += st; S.signups += st; }
    var conv = M.min(.8, .02 + .6 * M.pow(S.fit / 100, 1.2) * M.pow(pull, .8) + .05 * sc) * S.priceConv;
    var cv = S.tp * conv;
    S.tp = (S.tp - cv) * .5;
    var wom = S.launched ? (S.N * .14 * M.pow(pull, 1.5) * M.pow(S.fit / 100, 1.5) * I.br * S.womMul + u * .5 * ch) : 0;
    var k = o.quiet ? 1 : M.exp(.15 * S.pd.zW[w]);
    hands *= k; cv *= k; wom *= k;
    var nw = hands + cv + wom, cB = sum(S.cb.filter(function (c) { return c.from <= w && c.to >= w; }).map(function (c) { return c.v; }));
    var c = M.max(.004, I.c0 + .14 * M.pow(1 - S.fit / 100, 2) * (1.2 - pull) - S.dl + cB);
    var lost = S.N * c, prev = S.MRR;
    S.MRR = S.MRR * (1 - c) + nw * S.arpaNew;
    S.N = S.N * (1 - c) + nw;
    S.dl *= .7; S.fat = M.min(1, S.fat + .1);
    S.cash += (S.MRR - S.burnM) / 4.33;
    return { hands: hands, trials: cv, wom: wom, lost: lost, churn: c, prev: prev, launchedNow: launchedNow, sc: sc };
  }

  function survey(S) {
    var I = S.idea;
    if (!S.launched || S.N < 5 * I.u) return null;
    var z = S.pd.zVD[S.surveys.length % 16], vd = M.round(clamp(100 * I.pull * (.15 + .85 * S.fit / 100) + 3 * z, 1, 95));
    S.surveys.push({ w: S.week, vd: vd });
    U(S, 'pmf');
    return vd;
  }
  function lastVD(S) { return S.surveys.length ? S.surveys[S.surveys.length - 1].vd : null; }

  /* Wren’s office hours: the first matching diagnosis wins */
  function officeHours(S) {
    var w = S.week, I = S.idea, vd = survey(S), g = g4(S, w), out = { vd: vd, rx: null };
    var launchedWeeks = S.firstLaunch ? w - S.firstLaunch + 1 : 0;
    if (!S.launched && w >= 3 && S.Q >= 60) { out.d = 'You’re polishing something nobody has used. Launch this week: launch something bad quickly, as Michael Seibel puts it.'; out.rx = 'launch'; }
    else if (!S.launched && w >= 3) { out.d = 'Nobody has used it because there’s nothing to use yet. Put every spare block into a rough version, and launch the week it works.'; out.rx = 'build'; }
    else if (S.ins < 35) { out.d = 'You can describe your product. You can’t describe your user’s worst Tuesday. Talk to ten of them this week and don’t show them anything.'; out.rx = 'talk'; }
    else if (S.launched && vd != null && vd < 25) { out.d = 'I asked your users the question. ' + vd + '% would be very disappointed if you vanished. The number that matters is 40. Find the ones who said ‘very’, learn what they love, and fix what holds back the users who nearly said it.'; out.rx = 'build'; }
    else if (S.launched && S.tot.hands < 2 && S.N < 15 * I.u) { out.d = 'Nobody is coming to you yet, so go to them. Sit next to them and set it up yourself.'; out.rx = 'hands'; }
    else if (duo(S) && S.fric >= 55) { out.d = 'The metric you’re not tracking is each other. Have the conversation before it has you.'; out.rx = 'hard'; }
    else if (S.tot.raisePre >= 3 && w < 12) { out.d = 'You’re raising before you’ve made anything worth raising on. Investors will be here in week 12. So will your numbers, if you let them.'; }
    else if (launchedWeeks >= 3 && g.g != null && g.g < .03) { out.d = 'Pick the one number: weekly growth. What’s the one thing that would move it this week?'; out.rx = bestMove(S); }
    else { out.d = 'You’re doing the job. Keep the rate, and start writing the Demo Day sentence.'; }
    if (out.rx === 'hard' && !duo(S)) out.rx = null;
    S.rx = out.rx ? { a: out.rx, w: w + 1 } : null;
    out.survey = vd != null ? 'Very disappointed if you vanished: ' + vd + '% (the bar is 40%).' : 'Too few users to survey yet.';
    return out;
  }
  /* D7: dry-run one extra block of each growth action with the noise off and keep the best */
  function bestMove(S) {
    var best = null, bv = -1;
    ['talk', 'build', 'hands', 'sell', 'launch'].forEach(function (a) {
      var C = cloneS(S); C.bot = 'dry'; C.week = S.week + 1; C.rx = null;
      var P = emptyPlan(); P[a] = 1;
      if (why(C, a, P)) return;
      var r = core(C, P, { quiet: true });
      if (C.MRR - r.prev > bv) { bv = C.MRR - r.prev; best = a; }
    });
    return best || 'talk';
  }

  function runWeek(S, P, pivotTo) {
    var w = S.week, I, tot = S.tot, raiseWk = w > 12, prevMRR = S.MRR;
    var blocks = blocksAt(S, w), L = locksAt(S, w), rep = { w: w, plan: P, locks: L.map(function (l) { return { n: l.n, why: l.why, as: l.as }; }) };
    if (pivotTo) rep.pivot = pivot(S, pivotTo);
    I = S.idea;
    var hardLock = sum(L.filter(function (l) { return l.as === 'hard'; }).map(function (l) { return l.n; }));
    var r = core(S, P);
    rep.r = r;
    ACTS.forEach(function (a) { if (a.id !== 'hands') tot[a.id] += P[a.id] || 0; });
    tot.hands += r.sc;
    if (w <= 4) { tot.talk4 += P.talk; tot.avail4 += blocks; }
    if (!raiseWk) {
      S.warmth += P.raise; tot.raisePre += P.raise;
      if (P.raise === 1 && blocks >= 4 && duo(S)) S.fric += 3;
      if (P.raise) U(S, 'raise');
    } else if (S.raise) rep.meet = raiseMeetings(S, P, blocks);
    if (P.office) { S.ins += 3 * (1 - S.ins / 100); rep.oh = officeHours(S); J(S, 'wren', rep.oh.d); } else if (S.rx && S.rx.w <= w) S.rx = null;
    S.morale += 15 * P.rest; if (S.team.duo) S.fric -= 6 * P.rest;
    if (P.hard || hardLock) { S.fric -= 30; S.morale -= 5; S.aligned = 3; U(S, 'cofounders'); }
    if (S.flags.whaleKeep && w <= 12) S.morale -= 2;
    var g = prevMRR >= 500 ? S.MRR / prevMRR - 1 : null;
    S.morale += S.team.drift;
    if (g != null && g >= .07) S.morale += 5;
    if (S.launched && g != null && g < .02) S.morale -= 4;
    if (duo(S)) {
      S.fric += S.team.rate;
      S.slow = S.launched && g != null && g < .02 ? S.slow + 1 : 0;
      if (S.slow >= 2) S.fric += 4;
    }
    if (S.aligned > 0) S.aligned--;
    S.morale = clamp(S.morale, 0, 100); S.fric = clamp(S.fric, 0, 100);
    if (S.fric > S.peakFric) S.peakFric = S.fric;
    if (duo(S) && S.fric >= 45) U(S, 'cofounders');
    /* the invented neighbors: each later week a member may notice */
    if (S.flags.fake && !S.flags.trust && w > S.flags.fake && S.pd.uCold[w] < .35) {
      S.flags.trust = w; S.cb.push({ v: .05, from: w + 1, to: w + 3 }); S.morale = clamp(S.morale - 15, 0, 100); S.womMul *= .6;
      rep.trust = true;
      J(S, 'brief', 'A member noticed that three ‘neighbors’ share a profile photo. The thread is not kind, and it is pinned.');
    }
    L.forEach(function (l) { l.left--; });
    S.locks = S.locks.filter(function (l) { return l.left > 0; });
    S.cb = S.cb.filter(function (c) { return c.to >= w; });
    S.h.mrr[w] = S.MRR; S.h.g[w] = g; S.h.fit[w] = S.fit;
    S.h.src[w] = { hands: r.hands, trials: r.trials, wom: r.wom, lost: r.lost };
    if (w % 4 === 0) recMonth(S, w / 4, { hands: 0, eff: 0, paid: 0 });
    rep.g = g; rep.MRR = S.MRR; rep.prev = prevMRR;
    S.lastPlan = P;
    /* field notes met this week */
    if (P.talk) U(S, 'talk');
    if (r.launchedNow || (w >= 3 && !S.launched)) U(S, 'launch');
    if (r.sc) U(S, 'dontscale');
    if (g != null) U(S, 'growth');
    if (w >= 8) U(S, 'wom');
    if (S.MRR >= payOf(S) && S.launched) U(S, 'ramen');
    /* the journal */
    if (rep.pivot) J(S, 'you', 'Pivoted to ' + S.idea.name + '. A pivot costs momentum; staying too long with an idea nobody urgently wants costs more.');
    if (r.launchedNow) J(S, 'you', 'Launched ' + I.name + '. It was not ready, which is the only way anyone launches.');
    if (w === 1) J(S, 'brief', 'Kickoff is three days of founders who all seem further along than you. They aren’t.');
    if (w === 10) J(S, 'news', S.pd.heat < 1 ? 'Investors are quieter this season. Demo Day will reward numbers over stories.' : S.pd.heat > 1 ? 'It’s a hot market. Caps are climbing, and so are expectations.' : 'The investor calendar for Demo Day is full. Normal weather.');
    if (w === 12) J(S, 'brief', 'That’s the batch. Tomorrow you get one minute to say what you built and how fast it’s growing.');
    if (w <= 12 && w % 2 === 0 && w <= 10) rep.goh = groupOH(S);
    S.report = rep;
    schedule(S);
    if (S.cash < 0) S.dead = true;
  }

  function groupOH(S) {
    var w = S.week, rows = S.pd.mates.map(function (m) {
      return { name: m.name, line: m.role === 'pivoter' && w >= 8 ? PIVL[m.name] : m.line, mrr: m.mrr[w], g: mateG(m.mrr, w), spark: m.mrr.slice(1, w + 1), you: false };
    });
    var yg = g4(S, w).g;
    rows.push({ name: S.idea.name, line: 'you', mrr: S.MRR, g: yg == null ? 0 : yg, spark: S.h.mrr.slice(1, w + 1), you: true });
    rows.sort(function (a, b) { return b.g - a.g || b.mrr - a.mrr; });
    var rank = 1;
    rows.forEach(function (r, i) { if (r.you) rank = i + 1; });
    var talked = S.tot.talk >= 2, last = 'Last place in week ' + w + ' is information, not a verdict. When did you last talk to a user?';
    var line = rank <= 2 ? 'Don’t let the leaderboard become the product.' : rank <= 5 ? 'The companies above you aren’t smarter. They found users sooner.' :
      yg == null && talked ? 'No revenue yet is normal in week ' + w + '. You’ve been talking to users; now put something in front of them.' : last;
    J(S, 'wren', 'Group office hours: ' + line);
    return { rows: rows, rank: rank, line: line };
  }
  function mateG(a, w) {
    var s = 0; while (s <= w && !(a[s] > 0)) s++;
    if (s >= w) return 0;
    var from = M.max(s, w - 4);
    return M.pow(a[w] / a[from], 1 / (w - from)) - 1;
  }

  /* ---------- pivots ---------- */
  function pivot(S, to) {
    var old = S.idea, n = resolveIdea(S, to), adj = !!IDEAS[to].from;
    if (adj) {
      S.Q *= .5; S.ins *= .6; S.fit *= .5; S.N *= .3; S.MRR = S.N * n.arpa; S.launched = S.launched && S.N > 0; S.tp *= .3;
    } else {
      S.Q *= .2; S.ins *= .2; S.fit *= .2; S.N = 0; S.MRR = 0; S.launched = false; S.launches = 0; S.fat = 1; S.tp = 0; S.firstLaunch = null; S.lastLaunch = null;
    }
    S.morale = clamp(S.morale - 10, 0, 100);
    if (!S.aligned && S.team.duo) S.fric += 8;
    S.womMul = 1; S.priceConv = 1; S.arpaNew = n.arpa;
    S.passed = S.passed.filter(function (x) { return x !== to; });
    if (!adj && !IDEAS[old.id].from) S.passed.push(old.id);
    S.pivots.push({ w: S.week, from: old.id, to: to });
    S.idea = n; S.ideaId = to;
    U(S, 'sitcom');
    return { from: old.name, to: n.name, adj: adj };
  }

  /* ---------- events ---------- */
  function lk(S, n, left, as, why, o) { var l = { n: n, left: left, from: S.week + 1, as: as || null, why: why }; if (o) for (var k in o) l[k] = o[k]; S.locks.push(l); }
  function isB2B(S) { return S.idea.kind === 'b2b'; }
  var EV = {
    LOGO: { kick: 'The big logo', note: 'distract', el: function (S, w) { return w >= 3 && w <= 9 && isB2B(S); },
      title: 'The big logo.', text: function () { return 'A procurement lead at a 4,000-person company wants a pilot. They need SSO, a 212-question security review, a custom dashboard, and their contract, not yours. If it closes, it’s $96,000 a year. Procurement says nine months, which means twelve.'; },
      ch: [
        { l: 'Chase it.', s: 'One block a week for four weeks goes to security questionnaires.', go: function (S) { lk(S, 1, 4, null, 'The big-logo pilot'); S.flags.chased = S.week; return 'You start on question 1 of 212. The decision will come after the batch, if it comes.'; } },
        { l: 'Offer the self-serve plan, no custom work.', s: 'Maybe they take it, maybe they don’t.', go: function (S, u) {
          if (u[0] < .30) { S.MRR += 1500; S.N += 1500 / S.arpaNew; return 'They signed up for the self-serve plan: $1,500 a month, no custom work.'; }
          return 'They wanted the custom work. They went quiet.'; } },
        { l: 'Not now. Come back when we’re bigger.', s: 'Keep the blocks.', go: function (S) { S.morale += 2; return 'You say it kindly. It feels expensive for about a day.'; } }
      ] },
    CORPDEV: { kick: 'Corporate development', note: 'distract', el: function (S, w) { return w >= 5 && w <= 10; },
      title: 'Corp dev would like to connect.', text: function (S) { return 'A VP of Corporate Development at a public software company would love to ‘explore partnership opportunities.’ Three calls, then a ‘technical deep dive’' + (duo(S) ? ' with ' + cof(S) + '.' : '.'); },
      ch: [
        { l: 'Take the meetings.', s: 'One block a week for two weeks.', go: function (S, u) { lk(S, 1, 2, null, 'Corp dev calls'); if (u[0] < .25) S.flags.acqOffer = 1; return 'Three calls, a deep dive, and a lot of nodding. They’ll ‘circle back.’'; } },
        { l: 'Thank them and decline.', s: 'Two lines, sent.', go: function () { return 'You send a two-line email and go back to your users.'; } }
      ] },
    EXPO: { kick: 'The trade show', note: 'distract', el: function (S, w) { return w >= 3 && w <= 10; },
      title: 'The trade show.', text: function (S) { return 'The ' + S.idea.ind + ' expo is next week. A booth costs $7,500 and ' + (duo(S) ? 'both founders' : 'you') + ' for two days.'; },
      ch: [
        { l: 'Book the booth.', s: '$7,500 and two blocks next week.', go: function (S) {
          var I = S.idea; S.cash -= 7500; lk(S, 2, 1, null, 'The trade show');
          if (I.f.conf) { S.tp += I.u * 12 * (.5 + I.pull); S.ins += 8 * (1 - S.ins / 100); return 'The booth was where your customers were: a stack of trials and a notebook of complaints.'; }
          S.tp += 2 * I.u; S.ins += 2; return 'You met eleven vendors, four investors and one customer, who was lost.'; } },
        { l: 'Skip it.', s: 'Keep the cash and the blocks.', go: function () { return 'You skip it and spend the two days with users instead.'; } }
      ] },
    RIVAL: { kick: 'The competitor', note: 'rivals', el: function (S, w) { return w >= 4 && w <= 10; },
      title: 'The competitor raises $40 million.', text: function (S) { return duo(S) ? 'A company doing roughly what you do just announced a $40 million round. ' + cof(S) + ' sent you the article at 1:14 a.m. with no comment.' : 'A company doing roughly what you do just announced a $40 million round. You read the article at 1:14 a.m. Twice.'; },
      ch: [
        { l: 'Match their feature list.', s: 'Two blocks next week go to their roadmap.', go: function (S) { lk(S, 2, 1, 'build0', 'Matching their features'); S.morale -= 5; return deriv(S, 0, 'You ship three features from their launch post. Two of them you didn’t need.'); } },
        { l: 'Ignore them and talk to users.', s: 'Close the tab.', go: function (S) { S.ins = M.min(100, S.ins + 3); S.morale += 3; return deriv(S, 1, 'You close the tab and call two customers. Neither has heard of them.'); } },
        { l: 'Find the niche they’ll never bother with.', s: 'One block next week to map it.', go: function (S) {
          lk(S, 1, 1, null, 'Mapping the niche');
          if (S.idea.f.deriv) { S.idea.pull = M.min(.95, S.idea.pull + .08); S.idea.br *= .8; return 'You stop being a smaller version of them. The market got smaller; your share of it got real.'; }
          S.ins += 4 * (1 - S.ins / 100); return 'You map the corner they’ll never bother with. It’s where your best users already are.'; } }
      ] },
    WHALE: { kick: 'The difficult customer', note: 'fire', el: function (S, w) { return w >= 5 && w <= 11 && S.N >= 8 * S.idea.u; },
      title: 'The customer who is killing you.', text: function () { return 'Your largest customer is 18% of revenue and wants a custom report every Monday, a weekly call, and a discount ‘for being early.’'; },
      ch: [
        { l: 'Keep them happy.', s: 'A block every week through week 12, and the Sunday nights.', go: function (S) { lk(S, 1, M.max(1, 12 - S.week), null, 'The Monday report'); S.flags.whaleKeep = 1; return 'The Monday report becomes a ritual. So does the Sunday night before it.'; } },
        { l: 'Fire them, kindly.', s: 'Lose 18% of revenue this week.', go: function (S) { S.MRR *= .82; S.N *= .82; S.morale += 5; return 'You refer them to a consultant and give them a month’s notice. Revenue dips; Mondays come back.'; } },
        { l: 'Charge for the custom work.', s: 'They pay, or they leave.', go: function (S, u) {
          if (u[0] < .5) { S.MRR *= 1.04; lk(S, 1, M.max(1, 12 - S.week), null, 'Paid custom work', { alt: true }); return 'They paid. The custom work is now a line item, and it keeps you clear about its cost.'; }
          S.MRR *= .82; S.N *= .82; S.morale += 5; return 'They left. You found out what the custom work was worth to them.'; } }
      ] },
    ANGEL: { kick: 'An early check', note: 'mfn', el: function (S, w) { var g = S.h.g[w - 1]; return w >= 5 && w <= 9 && (S.warmth >= 1 || (S.h.g[w] != null && S.h.g[w] >= .07) || (g != null && g >= .07)); },
      title: 'An early check.', text: function () { return 'Callum Reyes, a former founder you met at a batch dinner, offers $250,000 on a post-money SAFE at a $10 million cap. Today. ‘I like to be first.’'; },
      pre: function () { return 'Take it and YC’s $375K converts at $10M: 3.75%. At a $20M Demo Day cap it would be 1.88%.'; },
      ch: [
        { l: 'Take it.', s: '$250,000 today at a $10M cap.', go: function (S) { angel(S, 10); return 'Signed before lunch. The MFN noticed too: YC’s $375K now converts at no more than $10M.'; } },
        { l: 'Counter at $18 million.', s: 'He might say yes.', go: function (S, u) {
          var g = g4(S).g || 0;
          if (u[0] < clamp(.15 + 3 * g, .1, .7) * S.iv.clarity) { angel(S, 18); return 'Callum thinks about it overnight and says yes at $18M.'; }
          return 'Callum passes, politely. He’ll see you at Demo Day.'; } },
        { l: 'Decline. Wait for Demo Day.', s: 'Keep the cap open.', go: function () { return 'You thank him. He says the offer won’t be there at Demo Day. He’s probably right.'; } }
      ] },
    OUTAGE: { kick: '2 a.m.', note: 'dontscale', el: function (S, w) { return w >= 4 && w <= 11 && S.launched; },
      title: '2 a.m.', text: function () { return 'Your database fell over at 2 a.m. and stayed down until 6.'; },
      ch: [
        { l: 'Fix it, then email every customer personally.', s: 'One block next week.', go: function (S) { lk(S, 1, 1, null, 'Personal apologies'); S.dl += .008; S.dlTo = S.week + 3; return 'You write to every customer by name. A few reply to say thanks; one says it’s why she’s staying.'; } },
        { l: 'Fix it and post a status note.', s: 'Keep the blocks.', go: function (S) { S.cb.push({ v: .02, from: S.week + 1, to: S.week + 1 }); return 'The status page says ‘resolved.’ A handful of customers start a trial of something else.'; } }
      ] },
    PRICE: { kick: 'Pricing', el: function (S, w) { return w >= 5 && w <= 11 && S.launched && S.N >= 5 * S.idea.u; },
      title: 'They’d pay double.', text: function () { return 'A customer says, unprompted, that she’d have paid twice what you charge.'; },
      pre: function (S) { return S.ins >= 60 ? 'Your read on demand: ' + belief(S).word + '.' : ''; },
      ch: [
        { l: 'Raise prices 50% for new customers.', s: 'More per customer; fewer might convert.', go: function (S) { var e = 1.3 - S.idea.pull; S.arpaNew *= 1.5; S.priceConv *= (1 - .5 * e); S.flags.priced = 1;
          return e < .6 ? 'New customers barely blink. You were leaving money on the table.' : 'Fewer trials convert. The ones who do pay more.'; } },
        { l: 'Keep the price.', s: 'Growth stays easy to read.', go: function () { return 'You keep the price. Revenue per customer stays where it was.'; } }
      ] },
    HIRE: { kick: 'The hire', el: function (S, w) { return w >= 6 && w <= 11; },
      title: 'The hire you can’t afford yet.', text: function () { return 'Mara, a senior engineer you’d love to work with, is leaving her job and wants in. $190,000 a year plus 1.5%.'; },
      ch: [
        { l: 'Hire her now.', s: '$20,000 a month, fully loaded, and 1.5% of the company.', go: function (S) { S.burnM += HIRE; S.hires.push({ who: 'Mara', at: 'W' + S.week, opt: .015, rw: S.week + 2, fit: S.fit }); return 'Mara starts Monday. For two weeks she mostly asks good questions; then she ships.'; } },
        { l: 'Offer a paid two-week project.', s: '$8,000 for two weeks of her work.', go: function (S) { S.cash -= 8000; lk(S, 1, 2, 'build', 'Mara’s paid project', { extra: true }); S.flags.maraLater = 1; return 'She takes it. You get two weeks of her work, and she gets two weeks of yours.'; } },
        { l: 'Not yet.', s: 'Not until the product works.', go: function () { return 'You tell her the truth: not until the product works. She says to call her when it does.'; } }
      ] },
    ADJ: { kick: 'The adjacent ask', note: 'sitcom', el: function (S, w) { return w <= 8 && (S.idea.pull < .5 || (S.idea.f.succ && S.launched)) && S.ins >= 40 && !!S.idea.adj && !S.adjSeen; },
      title: 'The adjacent ask.', text: function (S) { var A = IDEAS[S.idea.adj]; return A.ask || 'Four users, separately, asked whether you could also handle ' + A.short + '. One offered to pay for it today.'; },
      ch: [
        { l: 'Pivot to it.', s: 'Keep some users and some code; start the rest again.', go: function (S) { var r = pivot(S, S.idea.adj); J(S, 'you', 'Pivoted to ' + r.to + '. A pivot costs momentum; staying too long with an idea nobody urgently wants costs more.'); return 'You pivot to ' + r.to + '. The users who asked are your first customers.'; } },
        { l: 'Build it as a feature.', s: 'Two blocks next week.', go: function (S) { var a = resolveIdea(S, S.idea.adj); lk(S, 2, 1, 'build', 'The adjacent feature'); S.fit = M.min(100, S.fit + 5); S.idea.pull += .5 * M.max(0, a.pull - S.idea.pull) * .5; return 'You build it as a feature. The users who asked use it daily; everyone else doesn’t notice.'; } },
        { l: 'Write it down and stay focused.', s: 'Nothing changes.', go: function () { return 'It goes in the notebook. Somebody else may build it.'; } }
      ] },
    COLD: { kick: 'The empty feed', note: 'cold', el: function (S, w) { return w >= 2 && w <= 6 && S.ideaId === 'PACK'; },
      title: 'The empty feed.', text: function (S) { return 'The feed is empty, and empty feeds stay empty. ' + cof(S) + ' has an idea: invent a dozen neighbors and post as them until real ones show up.'; },
      ch: [
        { l: 'Post as ourselves, every day, in the open.', s: 'A block a week for three weeks.', go: function (S) { lk(S, 1, 3, null, 'Posting in the open'); S.womMul *= 1.3; return 'You post as yourselves: walks, lost leashes, a very good dog named Biscuit. Slowly, real neighbors post back.'; } },
        { l: 'Invent the neighbors.', s: 'Free, fast, and a lie.', go: function (S) { S.womMul *= 1.4; S.flags.fake = S.week; return 'A dozen neighbors appear overnight. The feed looks alive.'; } },
        { l: 'Co-host with a real dog-walking group.', s: 'One block next week.', go: function (S) { lk(S, 1, 1, null, 'The group walk'); S.womMul *= 1.2; return 'The Saturday walk gets forty dogs and a group photo. The feed has something real to talk about.'; } }
      ] },
    KARMA: { kick: 'A batchmate', el: function () { return true; },
      title: 'A batchmate is stuck.', text: function (S) { return S.pd.mates[S.week % 6].name + ' is stuck on a payments integration you fought through last month.'; },
      ch: [
        { l: 'Spend a block helping.', s: 'One block next week.', go: function (S) { lk(S, 1, 1, null, 'Helping a batchmate'); S.karma += 1; return 'You lose a block and gain a friend who will vouch for you at Demo Day.'; } },
        { l: 'Send them your notes.', s: 'Ten minutes.', go: function (S) { S.karma += .5; return 'Your notes save them a week. They say they owe you one.'; } },
        { l: 'Too busy.', s: 'Keep the block.', go: function () { return 'They figure it out on Thursday. They remember who helped.'; } }
      ] },
    FLASH: { kick: 'Flashpoint', note: 'cofounders', el: function (S, w) { return duo(S) && S.fric >= 55 && w - S.lastFlash >= 4; },
      title: 'Flashpoint.', text: function (S) { return cof(S) + ' wants two weeks to rebuild the backend ‘so it scales.’ You want to keep shipping and selling. The conversation happens in the kitchen at 11 p.m.'; },
      ch: [
        { l: 'Stop and have the real conversation.', s: 'Next week opens with it: two blocks.', go: function (S) { lk(S, 2, 1, 'hard', 'The real conversation'); S.hardN = (S.hardN || 0) + 1; return 'It takes until 2 a.m. Nobody wins. You both agree on what winning means, which is better.'; } },
        { l: 'Pull rank.', s: 'Keep shipping.', go: function (S) { S.fric += 15; S.morale -= 3; return 'You win the argument. ' + cof(S) + ' goes quiet in a way you haven’t seen before.'; } },
        { l: 'Let them rebuild.', s: 'Two blocks next week.', go: function (S) { lk(S, 2, 1, 'build0', 'The rebuild'); S.fric -= 10; return 'The backend gets rebuilt. It scales beautifully to the users you don’t have yet.'; } }
      ] },
    BURN: { kick: 'Running on fumes', el: function (S, w) { return S.morale <= 25 && w - S.lastBurn >= 3; },
      title: 'Running on fumes.', text: function () { return 'You haven’t slept past five in three weeks. You just reread the same email four times.'; },
      ch: [
        { l: 'Take a real weekend.', s: 'One block next week.', go: function (S) { lk(S, 1, 1, null, 'A real weekend'); S.morale += 25; return 'You sleep eleven hours on Saturday. Monday’s decisions are noticeably less stupid.'; } },
        { l: 'Push through.', s: 'Keep every block.', go: function (S, u) { S.morale -= 5; if (u[0] < .3) { S.cb.push({ v: .02, from: S.week + 1, to: S.week + 1 }); return 'You push through. On Thursday you ship a bug that emails every customer twice.'; } return 'You push through. Nothing breaks this time.'; } }
      ] },
    SPLIT: { kick: 'The split', note: 'vest', el: function (S) { return duo(S) && S.fric >= 100; },
      title: 'The split.', text: function (S) { return cof(S) + ' is leaving. Not angry anymore. Just done.'; },
      ch: [{ l: 'Read the paperwork.', s: '', go: function (S) { return doSplit(S); } }] },
    /* Act III */
    A1: { kick: 'An offer', el: function (S) { return S.turn === 1 && S.flags.acqOffer; },
      title: 'The corp dev VP is back.', text: function (S) { return 'Offer: ' + F.M(S.pd.acq, 1) + ' total, mostly retention packages over four years. Your investors get roughly their money back. The product shuts down in 90 days.'; },
      ch: [
        { l: 'Accept.', s: 'The run ends here.', go: function (S) { S.flags.acq = 1; return 'You sign. The sunset email goes out in the morning.'; } },
        { l: 'Decline.', s: 'Keep building.', go: function () { return 'You decline. The VP says the door stays open. Doors say that.'; } }
      ] },
    A2: { kick: 'The big logo', el: function (S) { return S.turn === 2 && S.flags.chased; },
      title: 'The pilot decision.', text: function (S, u) { return u[0] < aP(S) ? 'The big logo signed. $8,000 a month, and a list of ‘small’ roadmap requests.' : 'Procurement went quiet. Four weeks of blocks bought you a lanyard.'; },
      chf: function (S, u) {
        if (u[0] >= aP(S)) return [{ l: 'Continue.', s: '', go: function () { return 'You file the security questionnaire under ‘lessons.’'; } }];
        return [
          { l: 'Build their roadmap.', s: '$8,000 a month; the product bends toward one customer.', go: function (S) { S.MRR += 8000; S.N += 1; S.fit = M.max(0, S.fit - 3); return 'The roadmap is theirs now. So is a surprising share of your week.'; } },
          { l: 'Sell them the product as it is.', s: 'They might walk.', go: function (S, u2) { if (u2[1] < .6) { S.MRR += 8000; S.N += 1; return 'They take it as it is. The small requests go on a list you read.'; } return 'They walk. The product stays yours.'; } }
        ]; } },
    A3: { kick: 'Churn', el: function () { return true; },
      title: 'A cohort leaves at once.', text: function () { return 'Your biggest cohort churned at once. Nobody wrote to say why.'; },
      now: function (S) { S.N *= .93; S.MRR *= .93; },
      ch: [
        { l: 'Call every one of them.', s: 'Less capacity next turn.', go: function (S) { S.a3.capHit = S.turn + 1; S.ins = M.min(100, S.ins + 10); S.fit = M.min(98, S.fit + 3); return 'Eleven calls. The same reason comes up six times, and it is fixable.'; } },
        { l: 'Send a survey.', s: 'Cheap.', go: function (S) { S.ins = M.min(100, S.ins + 3); return 'Four responses. Two say ‘fine.’'; } }
      ] },
    A4: { kick: 'The weather', el: function () { return true; },
      title: 'The weather changes.', text: function (S, u) { return u[0] < .5 ? 'The market cooled. Series A investors want more.' : 'The market warmed. Your inbox noticed.'; },
      now: function (S, u) { S.a3.heat *= u[0] < .5 ? .85 : 1.15; },
      ch: [{ l: 'Continue.', s: '', go: function () { return 'Nothing to do but keep the numbers moving.'; } }] },
    A5: { kick: 'Price war', el: function () { return true; },
      title: 'A funded competitor cuts its price in half.', text: function () { return 'A funded competitor cut its price in half, and sent your customers the comparison.'; },
      ch: [
        { l: 'Match it.', s: 'Revenue down 10%, new price down 20%.', go: function (S) { S.MRR *= .9; S.pmul *= .9; S.arpaNew *= .8; return 'You match it. Nobody leaves, and nobody thanks you.'; } },
        { l: 'Hold.', s: 'Churn rises for four months unless the product is sticky.', go: function (S) { if (S.fit < 60) S.a3.pc.push({ v: .004, left: 4 }); return S.fit >= 60 ? 'You hold. Your users stay; the product is the reason.' : 'You hold. Some of your customers take the cheaper option.'; } }
      ] },
    A6: { kick: 'Poached', el: function (S) { return hiresN(S) >= 1; },
      title: 'A big company comes for your best engineer.', text: function () { return 'A big company offered your best engineer twice her salary.'; },
      ch: [
        { l: 'Counter.', s: '$5,000 a month more.', go: function (S) { S.a3.extra += 5000; return 'She stays. The raise is fair, and everyone else notices it.'; } },
        { l: 'Wish her well.', s: 'Lose a hire.', go: function (S) { S.hires.pop(); S.fit = M.max(0, S.fit - 2); return 'She goes. Her code stays, and so do her comments in it.'; } }
      ] },
    A7: { kick: 'The split', el: function (S) { return duo(S) && S.fric >= 80; },
      title: 'The split.', text: function (S) { return cof(S) + ' is leaving. Not angry anymore. Just done.'; },
      ch: [{ l: 'Read the paperwork.', s: '', go: function (S) { return doSplit(S); } }] },
    A8: { kick: 'Too many builders', el: function (S) { return hiresN(S) >= 3 && S.fit < 50 && !S.evLog.some(function (x) { return x.id === 'A8'; }); },
      title: 'Features nobody asked for.', text: function () { return 'Your new team is building features nobody asked for, very efficiently.'; },
      ch: [
        { l: 'Let one go.', s: 'Severance this month.', go: function (S) { S.hires.pop(); S.a3.sevNext = HIRE; S.morale -= 10; return 'A hard week. The roadmap gets shorter and better.'; } },
        { l: 'Force a product-only turn.', s: 'Next turn, every hand on fit.', go: function (S) { S.a3.forceProduct = S.turn + 1; return 'Next turn, everyone talks to users before they write a line.'; } }
      ] },
    A9: { kick: 'The bridge', el: function (S) { return !aliveProj(S).alive && S.cash < 6 * burnNow(S) && S.safes.length > 0 && !S.A && !S.flags.bridged; },
      title: 'A bridge.', text: function (S) { var c = bridgeCap(S); return 'Your investors offer a $500K bridge SAFE at ' + capM(c) + (c < maxCap(S) ? ', 60% of your last cap.' : ', your last cap.'); },
      ch: [
        { l: 'Take the bridge.', s: '$500,000 on a SAFE.', go: function (S) { var c = bridgeCap(S); S.flags.bridged = 1; S.safes.push({ who: 'Bridge (existing investors)', amt: 500000, cap: c, pr: false, at: atTag(S), ty: 'bridge' }); S.cash += 500000; return 'The bridge closes in a week. It buys time, not an answer.'; } },
        { l: 'Cut burn instead.', s: 'Let one go and stop paid growth.', go: function (S) { S.flags.bridged = 1; if (S.hires.length) { S.hires.pop(); S.a3.sevNext = HIRE; } S.a3.cut = 1; return 'You cut. The spreadsheet looks better than the office does.'; } }
      ] },
    MARA: { kick: 'Mara again', el: function (S) { return S.turn === 0 && S.flags.maraLater && !S.hires.some(function (h) { return h.who === 'Mara'; }); },
      title: 'Mara finished the project.', text: function () { return 'Mara finished the paid project and would like the job: $190,000 a year plus 1.5%.'; },
      ch: [
        { l: 'Hire her.', s: '$20,000 a month and 1.5%.', go: function (S) { S.hires.push({ who: 'Mara', at: 'M' + (5 + 2 * S.turn), opt: .015, rt: S.turn + 1, fit: S.fit }); return 'Mara starts next month. She already knows where the bodies are buried.'; } },
        { l: 'Not yet.', s: 'Keep the burn down.', go: function () { return 'You say not yet. She takes a job across town and stays in touch.'; } }
      ] }
  };
  function aP(S) { return .20 + .45 * S.fit / 100 + (S.idea.f.ent ? .10 : 0); }
  function deriv(S, c, txt) {
    if (S.idea.f.deriv) { S.womMul *= .75; return txt + ' Users keep comparing you to them, and word of mouth slows.'; }
    return txt;
  }
  function angel(S, cap) {
    S.cash += 250000; S.early += 1;
    S.safes.push({ who: 'Callum Reyes', amt: 250000, cap: cap, pr: false, at: 'W' + S.week, ty: 'angel' });
    U(S, 'safe');
  }
  function doSplit(S) {
    var mo = S.turn >= 0 ? 6 + 2 * S.turn : M.ceil(S.week / 4.33);
    S.split = { at: mo, vested: !!S.vest, when: S.turn >= 0 ? 'month ' + mo : 'week ' + S.week };
    S.burnM = M.max(0, S.burnM - 6000);
    S.morale = clamp(S.morale - 20, 0, 100);
    U(S, 'vest'); U(S, 'cofounders');
    J(S, 'cof', cof(S) + ' left in ' + S.split.when + '.');
    return splitLine(S);
  }
  function splitLine(S) {
    if (!S.split) return '';
    if (S.split.vested) return S.split.at < 12 ? 'Vesting did its quiet job. They leave before the cliff, so the unvested shares come back to the company. The cap table stays clean; the week does not.'
      : 'They keep the shares that vested; the rest come back to the company.';
    return 'Without vesting, they walk out owning half the founder stock. Every investor from now on will ask about it.';
  }
  function eventCard(S, id) {
    var e = EV[id], u = S.pd.ue[id];
    if (e.now) e.now(S, u);
    S.ev = { id: id, done: false, out: null, c: null, title: e.title, kick: e.kick, text: e.text(S, u), pre: e.pre ? e.pre(S) : '' };
    if (id === 'FLASH') S.lastFlash = S.week;
    if (id === 'BURN') S.lastBurn = S.week;
    if (e.note) U(S, e.note);
    if (id === 'ANGEL') U(S, 'safe');
  }
  function choicesOf(S) {
    if (!S.ev) return [];
    var e = EV[S.ev.id];
    return e.chf ? e.chf(S, S.pd.ue[S.ev.id]) : e.ch;
  }
  function resolveEv(S, c) {
    var ch = choicesOf(S)[c];
    if (!S.ev || S.ev.done || !ch) return;
    var out = ch.go(S, S.pd.ue[S.ev.id]);
    S.morale = clamp(S.morale, 0, 100); S.fric = clamp(S.fric, 0, 100);
    S.ev.done = true; S.ev.c = c; S.ev.out = out; S.ev.label = ch.l;
    S.choices[S.ev.id] = c;
    S.evLog.push({ id: S.ev.id, c: c, at: atTag(S), label: ch.l, out: out, title: S.ev.title });
    J(S, 'you', S.ev.title + ' ' + ch.l + ' ' + out);
    if (S.ev.id === 'A1' && c === 0) S.dead = true;
  }
  function schedule(S) {
    var w = S.week, pick = null, e;
    S.ev = null;
    if (w < 2) return;
    ['SPLIT', 'FLASH', 'BURN'].some(function (id) { if (EV[id].el(S, w)) { pick = id; return true; } return false; });
    if (!pick && w <= 11) {
      if (EV.ADJ.el(S, w)) { pick = 'ADJ'; S.adjSeen = w; S.adjId = S.idea.adj; }
      else if ((w === 4 || w === 6 || w === 8) && !S.flags.karma && S.pd.uK[(w - 4) / 2] < .5) { pick = 'KARMA'; S.flags.karma = w; }
      else if (S.deckN < 7 && S.pd.uS[w] < .75) {
        for (var i = 0; i < S.pd.evOrder.length; i++) {
          var id = S.pd.evOrder[i];
          if (S.evLog.some(function (x) { return x.id === id; })) continue;
          if (EV[id].el(S, w)) { pick = id; S.deckN++; break; }
        }
      }
    }
    if (pick) eventCard(S, pick);
  }

  /* ---------- Demo Day and the raise ---------- */
  var SENT = [
    function (S) { return S.idea.sent; },
    function (S) { return 'We’re building the operating system for ' + S.idea.ind + '.'; },
    function (S) { return 'An AI-native platform reimagining ' + S.idea.ind + '.'; }
  ];
  var SMUL = [1.06, 1.00, .90];
  function ddScore(S, sent) {
    var gs = g4(S, 12, 2000), gScore = clamp((gs.g || 0) / .15, 0, 1.2) * (gs.n / 4);
    var st = streak(S, 12), stAdj = .6 + .4 * M.min(1, st / 6);
    var mrrScore = clamp(M.log(M.max(S.MRR, 1) / 1000) / M.log(40), 0, 1.3);
    var team = S.split ? (S.split.vested ? .70 : .35) : S.team.score;
    var Qs = (.35 * gScore * stAdj + .45 * mrrScore + .20 * team) * SMUL[sent || 0] * S.iv.clarity;
    var V = M.round(S.pd.heat * (4 + 26 * M.pow(M.max(0, Qs), 1.5)) * 2) / 2;
    var leads = M.min(80, M.round((10 + 50 * Qs) * S.pd.heat) + M.floor(2 * S.karma) + M.floor(S.warmth / 2) + 3 * S.early);
    return { Qs: Qs, V: V, leads: leads, g4: gs.g, n4: gs.n, streak: st };
  }
  function doDD(S, a) {
    var sc = ddScore(S, a.sent), metric = a.metric;
    if (metric === 'pmf' && lastVD(S) == null) metric = 'true';
    S.dd = { sent: a.sent, metric: metric, amt: a.amt, cap: clamp(M.round(a.cap), 4, 60), Qs: sc.Qs, V: sc.V, leads: sc.leads, g4: sc.g4, streak: sc.streak, mrr: S.MRR, vd: lastVD(S), N: S.N };
    S.raise = { target: a.amt, cap: S.dd.cap, order: 'ev', met: {}, offers: [], signed: 0, n: 0, leadIn: false, h50: false, h100: false, closed: false, lines: [], walked: 0, flaked: 0 };
    U(S, 'valuation'); U(S, 'raise'); U(S, 'mfn');
    J(S, 'brief', 'Demo Day. ' + sc.leads + ' investors asked for a meeting. The room priced you near ' + capM(sc.V) + '.' + (metric === 'vanity' ? ' Your signups number got attention. Diligence starts Monday.' : ''));
    S.phase = 'week'; S.week = 13; S.sub = 'plan';
  }
  var FULL = 2.5;
  function softAmt(R) { return sum(R.offers.map(function (o) { return o.amt; })); }
  function invView(S, i) { var v = S.pd.inv[i], d = S.dd; return { T: d.V * M.exp(.25 * v.zT), b: clamp(.05 + .45 * d.Qs + .10 * v.zB, .03, .85) }; }
  function metricMul(S) { var d = S.dd; if (d.metric === 'vanity') return S.week === 13 ? 1.12 : .85; if (d.metric === 'pmf') return d.vd >= 40 ? 1.06 : .94; return 1; }
  /* diligence reads the retention cohorts: weak fit discounts every yes, from the first meeting */
  function dilig(S) { return .3 + .7 * clamp(S.fit / 55, 0, 1); }
  function meetMode(P, blocks) { return P.raise >= M.ceil(blocks / 2) ? 1.25 : P.raise === 1 && blocks >= 4 ? .6 : 1; }
  function raiseMeetings(S, P, blocks) {
    var R = S.raise, out = { met: 0, yes: 0, counter: 0, no: 0, mode: meetMode(P, blocks), lines: [] };
    if (!P.raise || R.closed || R.full) { out.full = !!R.full; return out; }
    if (out.mode === .6 && duo(S)) S.fric += 3;
    var n = M.round(P.raise * 4 * out.mode), pool = [], i;
    for (i = 0; i < S.dd.leads; i++) if (!R.met[i]) pool.push(i);
    var key = function (j) { var v = S.pd.inv[j], x = invView(S, j); return R.order === 'friendly' ? (v.ty === 'angel' ? 10 + x.b : x.b) : v.chk * x.b; };
    pool.sort(function (a, b) { return key(b) - key(a) || a - b; });
    for (var k = 0; k < n && k < pool.length; k++) {
      i = pool[k];
      var v = S.pd.inv[i], x = invView(S, i);
      R.met[i] = 1; out.met++;
      var herd = 1 + .6 * M.min(1, (R.signed + softAmt(R)) / R.target) + (R.leadIn ? .25 : 0);
      var p = x.b * herd * clamp(1.5 - R.cap / x.T, 0, 1) * metricMul(S) * dilig(S);
      if (v.u1 < p) { R.offers.push({ i: i, kind: v.pr ? 'side' : 'yes', cap: R.cap, amt: v.chk }); out.yes++; if (v.pr) U(S, 'prorata'); }
      else if (v.u1 < p + .15 * dilig(S) && R.cap > x.T) { R.offers.push({ i: i, kind: 'counter', cap: M.max(2, M.round(x.T * 2) / 2), amt: v.chk }); out.counter++; }
      else out.no++;
      herdCheck(S);
    }
    if (pool.length === 0) out.dry = true;
    return out;
  }
  function herdCheck(S) {
    var R = S.raise, f = (R.signed + softAmt(R)) / R.target;
    if (f >= .5 && !R.h50) { R.h50 = true; J(S, 'inv', 'Three more funds ask who else is in.'); }
    if (f >= 1 && !R.h100) { R.h100 = true; J(S, 'inv', 'You’re oversubscribed. The next yes is a decision, not a gift.'); }
  }
  function sign(S, o, pr, cap) {
    var R = S.raise, v = S.pd.inv[o.i];
    S.safes.push({ who: v.name, amt: o.amt, cap: cap || o.cap, pr: !!pr, at: 'R' + (S.week - 12), ty: v.ty });
    S.cash += o.amt; R.signed += o.amt; R.n++;
    if (v.ty === 'lead') R.leadIn = true;
    if (pr) U(S, 'prorata');
    J(S, 'inv', v.name + ' signed: ' + money(o.amt) + ' at a ' + capM(cap || o.cap) + ' cap' + (pr ? ', with a pro rata side letter.' : '.'));
    if (R.signed >= FULL * R.target && !R.full) {
      R.full = true; R.offers = [];
      J(S, 'brief', 'The round is full at ' + FULL + '× your target. More money now would only be more dilution, so you stop taking meetings.');
    }
  }
  function offerAct(S, k, c) {
    var R = S.raise, o = R.offers[k];
    if (!o) return;
    var v = S.pd.inv[o.i], keep = false;
    if (c === 'pass' || c === 'decline') J(S, 'you', 'Passed on ' + v.name + '.');
    else if (o.kind === 'yes' && c === 'sign') sign(S, o, false);
    else if (o.kind === 'side' && c === 'sign') sign(S, o, true);
    else if (o.kind === 'side' && c === 'noside') {
      if (v.u2 < .5) { R.walked++; J(S, 'inv', v.name + ': ‘Then we’ll pass.’'); } else sign(S, o, false);
    } else if (o.kind === 'counter' && c === 'accept') sign(S, o, v.pr, o.cap);
    else keep = true;
    if (!keep) R.offers.splice(k, 1);
  }
  function signAll(S, sideForLeadsOnly) {
    var R = S.raise;
    while (R.offers.length) {
      var o = R.offers[0], v = S.pd.inv[o.i];
      if (R.full) { R.offers = []; break; }
      if (o.kind === 'yes') offerAct(S, 0, 'sign');
      else if (o.kind === 'side') offerAct(S, 0, sideForLeadsOnly && v.ty !== 'lead' ? 'noside' : 'sign');
      else offerAct(S, 0, 'accept');
    }
  }
  function flakes(S) {
    var R = S.raise, keep = [];
    R.offers.forEach(function (o) {
      var v = S.pd.inv[o.i];
      if (v.u3 < .35) { R.flaked++; J(S, 'inv', v.name + ' went quiet. Soft yeses are not yeses.'); U(S, 'raise'); } else keep.push(o);
    });
    R.offers = keep;
  }
  function closeRound(S) {
    var R = S.raise;
    R.closed = true; R.offers = [];
    S.phase = 'closed'; S.sub = '';
    U(S, 'dilution');
    var ct = capTable(S);
    var rs = S.safes.filter(function (s) { return /^R/.test(s.at); });
    R.summary = { raised: R.signed, n: R.n, caps: uniq(rs.map(function (s) { return s.cap; })).length, allCaps: uniq(S.safes.map(function (s) { return s.cap; })).length, min: minCap(S), mfn: ct.mfn, founders: ct.founders };
    J(S, 'brief', R.signed ? 'Round closed: ' + money(R.signed) + ' from ' + R.n + ' investors.' : 'The round closed with no new checks.');
  }
  function pivotTargets(S) {
    var t = S.passed.slice();
    if (S.adjId && S.ideaId !== S.adjId && t.indexOf(S.adjId) < 0) t.push(S.adjId);
    return t;
  }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function minCap(S) { var c = S.safes.map(function (s) { return s.cap; }); return c.length ? M.min.apply(null, c) : null; }
  function maxCap(S) { var c = S.safes.filter(function (s) { return s.ty !== 'bridge'; }).map(function (s) { return s.cap; }); return c.length ? M.max.apply(null, c) : 0; }
  function bridgeCap(S) { var c = maxCap(S) || 8; return cmgr(S, 3) >= .03 ? c : M.max(2, M.round(c * .6 * 2) / 2); }

  /* ---------- the cap table: YC’s post-money formulas ---------- */
  function capTable(S, A, Vpre) {
    var conv = function (cap) { return Vpre != null && Vpre < cap ? Vpre : cap; };
    var mc = minCap(S), yc7 = .07;
    var mfn = mc != null ? .375 / conv(mc) : (Vpre != null ? .375 / Vpre : null);
    var parts = S.safes.map(function (s) { return { who: s.who, pct: s.amt / 1e6 / conv(s.cap), pr: s.pr }; });
    var other = sum(parts.map(function (p) { return p.pct; }));
    var Ssum = yc7 + (mfn || 0) + other, o = sum(S.hires.map(function (h) { return h.opt; }));
    var ct = { yc7: yc7, mfn: mfn, other: other, S: Ssum, o: o, founders: (1 - o) * (1 - Ssum), opts: o * (1 - Ssum) };
    if (A != null) {
      var Spr = yc7 + (mfn || 0) + sum(parts.filter(function (p) { return p.pr; }).map(function (p) { return p.pct; }));
      var SafePR = A / (1 - Spr) - A, P = .10, D = A + SafePR + P;
      ct.A = A; ct.Spr = Spr; ct.SafePR = SafePR; ct.P = P; ct.D = D;
      ct.founders = (1 - o) * (1 - Ssum) * (1 - D);
      ct.opts = o * (1 - Ssum) * (1 - D);
      ct.ycF = (yc7 + (mfn || 0)) * (1 - D) + SafePR * (yc7 + (mfn || 0)) / Spr;
      ct.otherF = other * (1 - D);
    }
    ct.you = ct.founders * yourShare(S);
    return ct;
  }
  function capNow(S) { return S.A ? capTable(S, S.A.A, S.A.Vpre) : capTable(S); }
  function yourShare(S) {
    if (!S.team || !S.team.duo) return 1;
    if (!S.split) return .5;
    if (!S.split.vested) return .5;
    var v = S.split.at < 12 ? 0 : M.min(1, .25 + (S.split.at - 12) / 48);
    return 1 / (1 + v);
  }

  /* ---------- months, growth and the default-alive projection ---------- */
  function recMonth(S, m, src) { S.mon[m] = { m: m, mrr: S.MRR, burn: burnNow(S), cash: S.cash, src: src, N: S.N, pm: S.pmul }; }
  function lastMonth(S) { for (var m = S.mon.length - 1; m >= 1; m--) if (S.mon[m]) return m; return 0; }
  function cmgr(S, n) {
    var m = lastMonth(S);
    if (!m) return 0;
    /* measured at constant prices: a price change moves revenue once and is not growth */
    var b = S.mon[m];
    for (var k = n; k >= 1; k--) { var a = S.mon[m - k]; if (a && a.mrr > 0) return M.pow((b.mrr / (b.pm || 1)) / (a.mrr / (a.pm || 1)), 1 / k) - 1; }
    return 0;
  }
  function burnNow(S) {
    if (S.turn < 0 || !S.a3) return S.burnM || 0;
    var b = payOf(S) + 6000 + HIRE * hiresN(S) + (S.a3.cut ? 0 : S.a3.spend) + S.a3.extra;
    return S.a3.focus === 'efficiency' ? b * TUNE.effB : b;
  }
  function aliveProj(S, rOver) {
    var r = rOver != null ? rOver : clamp(cmgr(S, 3), -.2, .4), E = burnNow(S), C = S.cash, R0 = S.MRR, low = C;
    if (R0 >= E) return { alive: true, t: 0, r: r, cushion: C, now: true };
    for (var t = 1; t <= 60; t++) {
      var R = R0 * M.pow(1 + r, t);
      C += R - E;
      if (C < low) low = C;
      if (C <= 0) return { alive: false, t: t, r: r, cushion: low };
      if (R >= E) return { alive: true, t: t, r: r, cushion: low };
    }
    return { alive: false, t: 60, r: r, cushion: low, never: true };
  }
  /* months of cash at today's gap between burn and revenue; null when revenue covers the burn */
  function runwayMo(S) { var net = burnNow(S) - S.MRR; return net > 0 ? M.max(0, M.floor(S.cash / net)) : null; }
  function runwayW(n) { return n >= 120 ? 'more than ten years' : 'about ' + n + ' ' + F.plural(n, 'month'); }
  function needR(S) {
    if (aliveProj(S, 1).alive === false) return null;
    var lo = 0, hi = 1;
    for (var i = 0; i < 30; i++) { var mid = (lo + hi) / 2; if (aliveProj(S, mid).alive) hi = mid; else lo = mid; }
    return hi;
  }

  /* ---------- price: headroom, walkouts and the step ---------- */
  /* model assumption: what customers will pay, as a multiple of the launch price, rises with demand and with fit */
  function wtp(S) { return 1 + 1.5 * S.idea.pull * (.4 + .6 * S.fit / 100); }
  function priceLv(S) { return S.arpaNew / S.idea.arpa; }
  function overW(S, lv) { return M.max(0, (lv == null ? priceLv(S) : lv) / wtp(S) - 1); }
  function priceShock(S, dir) {
    var I = S.idea, base = .2 * (1.3 - I.pull) * (1 - S.fit / 100) * (1.2 - I.pull), A3 = S.a3, o0 = overW(S);
    if (dir > 0) {
      var rep = !!(A3 && A3.lastUp != null && S.turn - A3.lastUp <= 2), o1 = overW(S, priceLv(S) * 1.2);
      var lost = clamp((rep ? 2 : 1) * base + .7 * (o1 - o0), 0, .5);
      return { dir: 1, lost: lost, gain: 0, step: 1.2 * (1 - lost) - 1, over: o1, repeat: rep };
    }
    if (dir < 0) { var gain = clamp(.5 * base, 0, .1); return { dir: -1, lost: 0, gain: gain, step: .8 * (1 + gain) - 1, over: overW(S, priceLv(S) * .8), repeat: false }; }
    return { dir: 0, lost: 0, gain: 0, step: 0, over: o0, repeat: false };
  }

  /* ---------- Act III: the year after ---------- */
  var HIRE = 20000;
  /* Act III model constants, tuned with the seeded harness so that each focus wins somewhere: product while fit has room,
     growth once fit nears what the market allows, balanced in between, efficiency when cash is the constraint; and so that
     raising prices every turn loses to raising them when customers will pay */
  var TUNE = {
    ovC: .012,            /* extra weekly churn per unit of price above what customers will pay */
    pW: .4, pE: .8,       /* how much growth work amplifies word of mouth, and effort and paid channels */
    p0: .45,              /* the focus share above which work counts as growth work */
    cap: 25, capW: 30,    /* product work fades from fit = 100 × demand − 5 to 100 × demand + 25 */
    neg: 9.4, ex: 2,      /* fit lost to neglect: neg × (growth share − 0.3)^ex × (1 − fit) */
    effC: .9, effB: .85   /* efficiency: 90% of the capacity for 85% of the burn */
  };
  var FOCUS = { product: .3, balanced: .5, growth: .7, efficiency: .45 };
  function startA3(S) {
    S.phase = 'turn'; S.sub = 'plan'; S.turn = 0;
    S.a3 = { heat: S.pd.heat, spend: 0, focus: 'balanced', pc: [], extra: 0, sevNext: 0, capHit: -1, forceProduct: -1, cut: 0, turns: [] };
    S.hires.forEach(function (h) { if (h.rt == null) h.rt = 0; });
    if (!S.mon[4]) recMonth(S, 4, { hands: 0, eff: 0, paid: 0 });
    U(S, 'alive');
    if (S.MRR >= payOf(S)) U(S, 'ramen');
    J(S, 'brief', 'Month 5. The batch is over, the money is in the bank, and nobody schedules your weeks anymore.');
  }
  function monthStep(S, m, p, first) {
    var I = S.idea, A3 = S.a3, t = S.turn;
    var ramped = S.hires.filter(function (h) { return h.rt == null || h.rt <= t; }).length;
    var C = (duo(S) ? 2 : 1.5) + .6 * ramped;
    if (p.sa) C *= .6;
    if (p.offsite) C -= .3;
    if (S.morale < 30) C -= .5;
    if (A3.capHit === t) C -= .5;
    C = M.max(.3, C);
    var focus = A3.forceProduct === t ? 'product' : p.focus, g = FOCUS[focus];
    if (focus === 'efficiency') C *= TUNE.effC;
    var G = C * g, P = C * (1 - g);
    /* growth work amplifies what users already like (referrals, onboarding, a sales motion); below fit 40 there is nothing to amplify */
    var push = M.max(0, g - TUNE.p0) * clamp((S.fit - 40) / 40, 0, 1), ov = overW(S);
    var pc = sum(A3.pc.map(function (x) { return x.v; }));
    var cw = M.max(.004, I.c0 + .14 * M.pow(1 - S.fit / 100, 2) * (1.2 - I.pull) + pc + TUNE.ovC * ov), cm = 1 - M.pow(1 - cw, 4.33);
    var sat = M.max(0, 1 - S.N / (I.u * 1000 * I.br));
    var womw = .14 * M.pow(I.pull, 1.5) * M.pow(S.fit / 100, 1.5) * I.br * S.womMul * (1 + TUNE.pW * push) / (1 + ov);
    var wom = S.N * (M.pow(1 + womw, 4.33) - 1) * sat;
    var eff = G * 4.33 * I.u * (.2 + 2.6 * I.pull) * (.3 + .7 * S.fit / 100) * .35 * sat * S.priceConv * (1 + TUNE.pE * push);
    var spend = A3.cut ? 0 : A3.spend, CAC = S.arpaNew * (6 + 10 * (1 - I.ch)) / (.3 + S.fit / 100 * I.pull) / (1 + TUNE.pE * push);
    var paid = spend / CAC * sat * S.priceConv, k = M.exp(.12 * S.pd.zM[m]);
    wom *= k; eff *= k; paid *= k;
    var nw = wom + eff + paid;
    S.MRR = S.MRR * (1 - cm) + nw * S.arpaNew;
    S.N = S.N * (1 - cm) + nw;
    /* product work has diminishing returns as fit nears what this market allows; neglect costs more when fit is low */
    var gain = 6 * P * (1 - S.fit / 100) * (.15 + .85 * S.ins / 100) * .5 * clamp((100 * I.pull + TUNE.cap - S.fit) / TUNE.capW, 0, 1);
    S.fit = clamp(S.fit + gain - (focus === 'product' ? 0 : TUNE.neg * M.pow(g - .3, TUNE.ex) * (1 - S.fit / 100)), 0, 98);
    var burn = burnNow(S) + (first ? (p.offsite ? 8000 : 0) + A3.sevNext : 0);
    if (first) A3.sevNext = 0;
    S.cash += S.MRR - burn;
    A3.pc.forEach(function (x) { x.left--; });
    A3.pc = A3.pc.filter(function (x) { return x.left > 0; });
    S.mon[m] = { m: m, mrr: S.MRR, burn: burn, cash: S.cash, src: { wom: wom, eff: eff, paid: paid }, N: S.N, churn: cm, pm: S.pmul };
    if (S.MRR >= payOf(S)) U(S, 'ramen');
  }
  function runTurn(S, p) {
    var t = S.turn, A3 = S.a3, I = S.idea, rep = { t: t, p: p, m0: S.MRR, cash0: S.cash };
    var sa = !!(p.sa && saOpen(S));
    p = { hire: clamp(p.hire | 0, -1, 3), spend: [0, 10000, 25000].indexOf(+p.spend) >= 0 ? +p.spend : 0, focus: FOCUS[p.focus] != null ? p.focus : 'balanced',
      price: clamp(p.price | 0, -1, 1), offsite: !!(p.offsite && duo(S)), sa: sa };
    rep.p = p;
    A3.spend = p.spend; A3.focus = p.focus; A3.cut = 0;
    if (p.hire > 0) for (var k = 0; k < p.hire; k++) S.hires.push({ who: 'Hire ' + (S.hires.length + 1), at: 'M' + (5 + 2 * t), opt: .01, rt: t + 1, fit: S.fit });
    if (p.hire < 0 && S.hires.length) { S.hires.pop(); A3.sevNext += HIRE; S.morale -= 10; }
    if (p.price) {
      var e = 1.3 - I.pull, sh = priceShock(S, p.price);
      rep.price = sh; rep.priceN = S.N * (sh.lost || sh.gain);
      if (p.price > 0) { S.N *= 1 - sh.lost; S.MRR *= 1.2 * (1 - sh.lost); S.arpaNew *= 1.2; S.pmul *= 1.2; S.priceConv *= (1 - .2 * e); A3.pc.push({ v: .002 * e, left: 3 }); A3.lastUp = t; }
      else { S.N *= 1 + sh.gain; S.MRR *= .8 * (1 + sh.gain); S.arpaNew *= .8; S.pmul *= .8; S.priceConv *= (1 + .15 * e); A3.pc.push({ v: -.001 * e, left: 3 }); }
    }
    if (p.offsite) { S.fric -= 25; S.morale += 15; }
    for (var j = 0; j < 2; j++) {
      monthStep(S, 5 + 2 * t + j, p, j === 0);
      if (S.cash < 0) { S.dead = true; break; }
    }
    var m3 = cmgr(S, 3), al = aliveProj(S);
    S.morale += -4 + (m3 >= .08 ? 8 : 0) - (al.alive ? 0 : 8);
    if (duo(S)) S.fric += 3 + (al.alive ? 0 : 8);
    S.morale = clamp(S.morale, 0, 100); S.fric = clamp(S.fric, 0, 100);
    if (S.fric > S.peakFric) S.peakFric = S.fric;
    if (duo(S) && S.fric >= 45) U(S, 'cofounders');
    rep.m3 = m3; rep.alive = al; rep.MRR = S.MRR; rep.cash = S.cash;
    if (sa && !S.dead) rep.sa = seriesA(S);
    A3.turns.push({ t: t, hire: p.hire, spend: p.spend, focus: p.focus, price: p.price, sa: sa, fit: S.fit });
    S.report = rep;
    S.ev = null;
    if (!S.dead) scheduleA3(S);
  }
  function scheduleA3(S) {
    var t = S.turn, pick = null;
    ['MARA', 'A1', 'A7', 'A9', 'A2', 'A8'].some(function (id) { if (EV[id].el(S)) { pick = id; return true; } return false; });
    if (!pick && S.pd.uA3[t] < .7) {
      for (var i = 0; i < S.pd.a3o.length; i++) {
        var id = S.pd.a3o[i];
        if (S.evLog.some(function (x) { return x.id === id; })) continue;
        if (EV[id].el(S)) { pick = id; break; }
      }
    }
    if (pick) eventCard(S, pick);
  }
  function saOpen(S) { return !S.A && !S.ts && S.turn >= 2 && 12 * S.MRR >= 500000 && (!S.sa.length || S.turn >= S.sa[S.sa.length - 1].t + 2); }
  function saEval(S) {
    var ARR = 12 * S.MRR, m3 = cmgr(S, 3), heat = S.a3 ? S.a3.heat : S.pd.heat, al = aliveProj(S);
    var parts = [
      ['arr', 2.4 * M.log(M.max(ARR, 1000) / 1e6)], ['growth', 14 * (m3 - .06)], ['heat', 3 * (heat - 1)], ['alive', al.alive ? .6 : 0],
      ['split', S.split && !S.split.vested ? -1.5 : 0], ['solo', S.mode === 'solo' && !S.vest ? -.3 : 0], ['fit', S.fit < 40 ? -.8 : 0], ['shop', S.sa.length ? -.5 : 0]
    ];
    var s0 = sum(parts.map(function (x) { return x[1]; })), mult = clamp((12 + 250 * m3) * heat, 10, 50), Vpre = ARR * mult / 1e6, mc = maxCap(S);
    var step = mc && Vpre < mc ? -1 : mc && Vpre < 1.25 * mc ? -.5 : 0;
    parts.push(['step', step]);
    return { ARR: ARR, m3: m3, mult: mult, Vpre: M.round(Vpre * 2) / 2, s0: s0, step: step, p: Phi((s0 + step) / .5), parts: parts, alive: al.alive };
  }
  var SAWHY = { arr: 'Revenue is still small for a Series A.', growth: 'Growth has slowed below what an A needs.', heat: 'The market is cold.', alive: '',
    split: 'A cofounder who left without vesting owns half the founder stock.', solo: 'No vesting on the founder shares.', fit: 'Churn says the product isn’t sticky yet.',
    shop: 'You shopped the round before, and investors talk.', step: 'Your Demo Day cap is a hard act to follow: this would be a flat or down round.' };
  function seriesA(S) {
    var ev = saEval(S), z = S.pd.zA[M.min(2, S.sa.length)], ok = ev.s0 + ev.step + .5 * z > 0;
    var worst = ev.parts.slice().sort(function (a, b) { return a[1] - b[1]; })[0];
    S.sa.push({ t: S.turn, ok: ok, p: ev.p, Vpre: ev.Vpre });
    var fund = FUNDS[(S.seed + S.sa.length * 5) % FUNDS.length];
    if (ok) { S.ts = { Vpre: ev.Vpre, fund: fund, mult: ev.mult }; J(S, 'inv', fund + ' sent a term sheet: ' + capM(ev.Vpre) + ' pre-money.'); }
    else J(S, 'inv', 'No lead this time. ' + (SAWHY[worst[0]] || 'The numbers are not there yet.'));
    U(S, 'prorata');
    return { ok: ok, p: ev.p, Vpre: ev.Vpre, why: ok ? '' : (SAWHY[worst[0]] || 'The numbers are not there yet.'), fund: fund };
  }
  function signTerm(S, A) {
    A = [.15, .2, .25].indexOf(+A) >= 0 ? +A : .2;
    var ts = S.ts, ct = capTable(S, A, ts.Vpre), post = ts.Vpre * 1e6 / (1 - A);
    var nm = A * post, prm = ct.SafePR * post;
    S.cash += nm + prm;
    S.A = { Vpre: ts.Vpre, A: A, fund: ts.fund, newMoney: nm, prMoney: prm, t: S.turn };
    S.ts = null;
    U(S, 'dilution'); U(S, 'prorata');
    J(S, 'inv', 'Series A closed with ' + S.A.fund + ': ' + money(nm) + ' of new money' + (prm > 1 ? ' and ' + money(prm) + ' of pro rata' : '') + '. Founders own ' + F.pct(ct.founders, 1) + '.');
  }

  /* ---------- endings ---------- */
  var ENDINGS = {
    ACQUIHIRE: 'The acquihire', PINCH: 'The fatal pinch', RUNWAY: 'Out of runway', BREAKOUT: 'The breakout', PRICED: 'The Series A, at a price',
    RAMEN: 'Ramen and the long game', ALIVE: 'Default alive', ZOMBIE: 'The zombie', BRIDGE: 'The bridge question'
  };
  function endingOf(S) {
    if (S.flags.acq) return 'ACQUIHIRE';
    var m3 = cmgr(S, 3), al = aliveProj(S);
    if (S.cash < 0) return m3 < .05 ? 'PINCH' : 'RUNWAY';
    if (S.A) return capNow(S).founders >= .5 ? 'BREAKOUT' : 'PRICED';
    if (al.alive && m3 < .03) return 'ZOMBIE';
    if (!raisedOut(S) && al.alive) return 'RAMEN';
    if (al.alive) return 'ALIVE';
    return 'BRIDGE';
  }
  function finish(S) {
    S.phase = 'end'; S.sub = '';
    S.ending = endingOf(S);
    J(S, 'brief', 'Ending: ' + ENDINGS[S.ending] + '.');
  }

  /* ---------- the dispatcher: every choice is one entry in the log ---------- */
  function apply(S, a) {
    var ph = S.phase;
    function bad() { throw new Error('batch: ' + a.t + ' is not valid in ' + ph + '/' + S.sub); }
    switch (a.t) {
      case 'begin': if (ph !== 'intro') bad(); S.phase = 'idea'; U(S, 'motto'); U(S, 'sitcom'); U(S, 'schlep'); U(S, 'hale'); break;
      case 'idea':
        if (ph !== 'idea' || S.pd.deal3.indexOf(a.id) < 0) bad();
        S.ideaId = a.id; S.idea = resolveIdea(S, a.id); S.orig = a.id; S.arpaNew = S.idea.arpa;
        S.passed = S.pd.deal3.filter(function (x) { return x !== a.id; });
        S.phase = 'team'; break;
      case 'team':
        if (ph !== 'team' || !TEAMS[a.m]) bad();
        S.mode = a.m; S.team = JSON.parse(JSON.stringify(TEAMS[a.m])); S.fric = S.team.fric || 0; S.burnM = S.team.burn;
        S.phase = 'vest'; break;
      case 'vest': if (ph !== 'vest') bad(); S.vest = !!a.v; U(S, 'vest'); S.phase = 'iv'; break;
      case 'iv':
        if (ph !== 'iv') bad();
        S.iv.picks.push(clamp(a.pick | 0, 0, 2));
        if (S.iv.picks.length === 3) {
          S.iv.score = S.iv.picks.filter(function (p) { return p === 0; }).length;
          S.iv.clarity = .94 + .04 * S.iv.score;
          S.phase = 'ivres'; U(S, 'founders'); U(S, 'interview');
        }
        break;
      case 'ok': if (ph !== 'ivres') bad(); S.phase = 'deal'; break;
      case 'deal':
        if (ph !== 'deal') bad();
        S.cash = 500000; S.phase = 'week'; S.sub = 'plan'; S.week = 1;
        U(S, 'deal'); U(S, 'equity'); U(S, 'safe');
        J(S, 'brief', 'Signed. $500,000 in the bank, and twelve weeks to make it mean something.');
        break;
      case 'run':
        if (ph !== 'week' || S.sub !== 'plan') bad();
        if (S.week > 12 && a.round) roundSet(S, a.round);
        runWeek(S, cleanPlan(S, a.plan || {}));
        S.sub = 'report'; break;
      case 'pivot':
        if (ph !== 'week' || S.sub !== 'plan' || S.week > 8 || pivotTargets(S).indexOf(a.to) < 0) bad();
        runWeek(S, emptyPlan(), a.to); S.sub = 'report'; break;
      case 'ev': if (!S.ev || S.ev.done) bad(); resolveEv(S, a.c | 0); break;
      case 'offer': if (ph !== 'week' || S.week < 13) bad(); offerAct(S, a.k | 0, a.c); herdCheck(S); break;
      case 'signall': if (ph !== 'week' || S.week < 13) bad(); signAll(S, !!a.lo); herdCheck(S); break;
      case 'round': if (ph !== 'week' || S.week < 13) bad(); roundSet(S, a); break;
      case 'close': if (ph !== 'week' || S.week < 13 || S.raise.closed) bad(); closeRound(S); break;
      case 'dd': if (ph !== 'dd') bad(); doDD(S, a); break;
      case 'skip':
        if (ph !== 'dd') bad();
        S.dd = { skipped: true, mrr: S.MRR, sent: null, metric: null, Qs: ddScore(S, 0).Qs, V: ddScore(S, 0).V, leads: 0, streak: streak(S, 12), g4: g4(S, 12, 2000).g };
        U(S, 'ramen');
        J(S, 'you', 'You skip the raise. The YC money and your revenue are all you have, which concentrates the mind.');
        var lp = S.lastPlan ? JSON.parse(JSON.stringify(S.lastPlan)) : emptyPlan(), m0 = S.MRR, auto = [];
        lp.build += lp.raise; lp.raise = 0; lp.talk += lp.office; lp.office = 0;
        for (var w = 13; w <= 16; w++) {
          S.week = w; runWeek(S, cleanPlan(S, lp));
          if (S.ev && !S.ev.done) { resolveEv(S, 0); S.evLog[S.evLog.length - 1].auto = true; auto.push(S.ev.title + ' ' + S.ev.label); }
        }
        J(S, 'brief', 'The four raise weeks ran on your last plan: MRR ' + money(m0) + ' to ' + money(S.MRR) + '.' + (auto.length ? ' Decided by default: ' + auto.join(' ') : ''));
        S.skipped = { plan: lp, auto: auto.length };
        startA3(S); break;
      case 'next':
        if (S.ev && !S.ev.done) bad();
        S.ev = null;
        if (S.dead) { finish(S); break; }
        if (ph === 'ivres') { S.phase = 'deal'; break; }
        if (ph === 'closed') { startA3(S); break; }
        if (ph === 'week' && S.sub === 'report') {
          if (S.week < 12) { S.week++; S.sub = 'plan'; }
          else if (S.week === 12) { S.phase = 'dd'; S.sub = ''; U(S, 'mfn'); U(S, 'valuation'); }
          else { flakes(S); if (S.week < 16) { S.week++; S.sub = 'plan'; } else closeRound(S); }
          break;
        }
        if (ph === 'turn' && S.sub === 'report') {
          if (S.ts) bad();
          if (S.turn >= 6) finish(S); else { S.turn++; S.sub = 'plan'; }
          break;
        }
        bad(); break;
      case 'turn': if (ph !== 'turn' || S.sub !== 'plan') bad(); runTurn(S, a); S.sub = 'report'; break;
      case 'term': if (!S.ts) bad(); signTerm(S, a.A); break;
      case 'decline': if (!S.ts) bad(); J(S, 'you', 'You decline the term sheet.'); S.ts = null; break;
      default: bad();
    }
    return S;
  }
  function roundSet(S, a) {
    var R = S.raise;
    if (a.cap != null) R.cap = clamp(M.round(+a.cap), 4, 60);
    if (a.order === 'ev' || a.order === 'friendly') R.order = a.order;
    if ([1e6, 1.5e6, 2e6, 3e6].indexOf(+a.target) >= 0) R.target = +a.target;
  }
  function replay(seed, log) { var S = create(seed); log.forEach(function (a) { apply(S, a); }); return S; }

  /* ---------- three other founders, replayed on your seed, your idea and your team ---------- */
  var BOTN = { playbook: 'The playbook', builder: 'The builder', closer: 'The closer' };
  var BOTD = { playbook: 'Talks, launches early, onboards by hand, raises in a focused month, hires after fit.',
    builder: 'Builds for seven weeks, launches twice, then sells.', closer: 'Never talks to users; sells hard, raises big, hires fast.' };
  var BOTEV = {
    playbook: { LOGO: 2, CORPDEV: 1, EXPO: function (S) { return S.idea.f.conf ? 0 : 1; }, RIVAL: function (S) { return S.idea.f.deriv ? 2 : 1; }, WHALE: 1, ANGEL: 2,
      OUTAGE: 0, PRICE: function (S) { return belief(S).c >= .55 ? 0 : 1; }, HIRE: 2, ADJ: 0, COLD: 0, KARMA: 1, FLASH: 0, BURN: 0,
      A1: 1, A2: 1, A3: 0, A4: 0, A5: 1, A6: 0, A8: 1, A9: 0, MARA: 1 },
    builder: { LOGO: 2, CORPDEV: 1, EXPO: 1, RIVAL: 0, WHALE: 0, ANGEL: 2, OUTAGE: 1, PRICE: 1, HIRE: 0, ADJ: 2, COLD: 0, KARMA: 2, FLASH: 2, BURN: 1 },
    closer: { LOGO: 0, ANGEL: 0, HIRE: 0, RIVAL: 0, KARMA: 2, BURN: 1 }
  };
  function botChoice(S, kind) {
    var id = S.ev.id, t = BOTEV[kind], c = t[id] != null ? t[id] : BOTEV.playbook[id];
    if (typeof c === 'function') c = c(S);
    return clamp(c || 0, 0, choicesOf(S).length - 1);
  }
  function botPlan(S, kind) {
    var P = emptyPlan(), free = freeAt(S, S.week), w = S.week, mx = { launch: 1, office: 1, hard: 1, hands: 2 };
    function add(id, n) {
      var c = id === 'hard' ? 2 : 1;
      while (n > 0 && free >= c && !why(S, id, P) && (!mx[id] || P[id] < mx[id])) { P[id]++; free -= c; n--; }
    }
    if (w > 12) add('raise', 2);
    if (kind === 'playbook') {
      if (duo(S) && S.fric >= 45) add('hard', 1);
      if (S.morale < 40) add('rest', 1);
      if (S.Q < 60) { add('talk', S.ins < 50 ? 2 : 1); add('build', free); }
      else {
        if (!S.launched || w - S.lastLaunch >= 4) add('launch', 1);
        add('build', 1);
        if (S.N < 40 * S.idea.u) add('hands', 2);
        if (S.ins < 85) add('talk', 1);
        if (w % 3 === 0 && w <= 12) add('office', 1);
        add('sell', 1); add('build', free);
      }
    } else if (kind === 'builder') {
      if (w <= 7) add('build', free);
      else { if (w === 8 || w === 11) add('launch', 1); add('hands', 2); add('sell', 2); add('build', free); }
    } else {
      if (S.Q < 60) add('build', free);
      else { if (!S.launched) add('launch', 1); add('hands', 2); add('sell', 2); add('build', free); }
    }
    return P;
  }
  function botTurn(S, kind) {
    var al = aliveProj(S), ev = saOpen(S) ? saEval(S) : null, t = S.turn;
    if (kind === 'closer') return { t: 'turn', hire: t === 0 ? 3 : 1, spend: 25000, focus: 'growth', price: 0, offsite: false, sa: !!ev };
    return { t: 'turn', hire: al.alive && S.fit >= 55 ? 1 : 0, spend: S.fit > 55 ? 10000 : 0, focus: kind === 'builder' && t < 2 ? 'product' : 'balanced', price: 0, offsite: false, sa: !!(ev && ev.p >= .6) };
  }
  function botAct(S, kind) {
    if (S.ev && !S.ev.done) return { t: 'ev', c: botChoice(S, kind) };
    if (S.ts) return { t: 'term', A: .2 };
    if (S.phase === 'week') {
      if (S.sub === 'plan') return S.week > 12 ? { t: 'run', plan: botPlan(S, kind), round: { order: 'ev' } } : { t: 'run', plan: botPlan(S, kind) };
      if (S.week > 12 && !S.raise.closed) {
        var R = S.raise;
        if (R.signed >= 1.3 * R.target) return { t: 'close' };
        if (R.offers.length) {
          var bi = 0;
          R.offers.forEach(function (o, i) { if (o.amt > R.offers[bi].amt) bi = i; });
          var o = R.offers[bi];
          return { t: 'offer', k: bi, c: o.kind === 'counter' ? 'accept' : o.kind === 'side' && S.pd.inv[o.i].ty !== 'lead' ? 'noside' : 'sign' };
        }
      }
      return { t: 'next' };
    }
    if (S.phase === 'dd') {
      var sc = ddScore(S, 0);
      return { t: 'dd', sent: 0, metric: 'true', amt: kind === 'closer' ? 3e6 : 1.5e6, cap: clamp(M.round(sc.V * (kind === 'closer' ? 1.2 : 1)), 4, 60) };
    }
    if (S.phase === 'closed') return { t: 'next' };
    if (S.phase === 'turn') return S.sub === 'plan' ? botTurn(S, kind) : { t: 'next' };
    throw new Error('bot stuck in ' + S.phase);
  }
  function summary(S, name) {
    var ct = capNow(S);
    return { name: name, launch: S.firstLaunch, ddMRR: S.h.mrr[12] || 0, raised: raisedOut(S) + (S.A ? S.A.newMoney : 0), m18: S.MRR,
      ending: S.ending, founders: ct.founders, month: lastMonth(S), fit12: S.h.fit[12] || 0, alive: S.cash >= 0 };
  }
  function runBot(S0, kind) {
    var S = cloneS(S0), n = 0;
    S.bot = kind;
    while (S.phase !== 'end' && n++ < 300) apply(S, botAct(S, kind));
    return { S: S, sum: summary(S, BOTN[kind]) };
  }
  function bots(seed, log) {
    var k = -1;
    log.forEach(function (a, i) { if (a.t === 'deal') k = i; });
    if (k < 0) return [];
    var S0 = replay(seed, log.slice(0, k + 1));
    S0.journal = []; S0.nq = [];
    return ['playbook', 'builder', 'closer'].map(function (b) { return runBot(S0, b).sum; });
  }
  var ENG = { create: create, apply: apply, replay: replay, capTable: capTable, core: core, emptyPlan: emptyPlan, cloneS: cloneS, aliveProj: aliveProj,
    saEval: saEval, ddScore: ddScore, TUNE: TUNE, bots: bots, runBot: runBot, botAct: botAct, endingOf: endingOf, cmgr: cmgr, belief: belief, freeAt: freeAt, IDEAS: IDEAS };

  /* ---------- the interface: thin, it only appends to the log and repaints ---------- */
  var DBG = { ENG: ENG };
  K.hook(SLUG, DBG);
  var E = K.esc;
  function tm(k, l) { return K.term(k, l); }
  function btn(act, label, cls, extra) { return '<button type="button" class="' + (cls || 'ebtn2') + '" data-act="' + act + '"' + (extra || '') + '>' + label + '</button>'; }
  function pctS(v, d) { return F.pct(v, d == null ? 1 : d, true); }
  function gWord(g) { return g == null ? 'too early' : g >= .10 ? 'exceptional' : g >= .05 ? 'good' : g >= .01 ? 'slow' : 'still searching'; }
  function mWord(g) { return g >= .15 ? 'fast' : g >= .08 ? 'healthy' : g >= .03 ? 'slow' : 'flat'; }
  function fitWord(f) { return f < 20 ? 'Users try it and drift away.' : f < 40 ? 'A few use it weekly; most forget it exists.' : f < 60 ? 'A core group uses it every week.' : f < 80 ? 'Users complain when it breaks. That’s a good sign.' : 'Users are recruiting other users.'; }
  function prodWord(q) { return q < 60 ? 'No prototype yet' : q < 100 ? 'Rough prototype' : 'Version one'; }
  function insWord(i) { return i < 25 ? 'guessing' : i < 50 ? 'a few real interviews' : i < 75 ? 'you know their Tuesdays' : 'you could do their job'; }
  function fricWord(f) { return f < 50 ? 'Seems fine' : f < 70 ? 'Tense' : 'Cracking'; }
  function units(S, n) { return F.n(M.round(n)) + ' ' + unitW(S, n); }
  function ord(n) { return n + (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'); }
  function amtM(v) { return '$' + (v / 1e6) + 'M'; }
  function kmo(v) { return '$' + M.round(v / 1000) + 'K/mo'; }
  function newSeed() { return (Date.now() % 90000) + 10000; }

  /* ---------- the drawings: the company as a building, the cap table as a cylinder ----------
     Two scenes on the house 3D engine (/assets/3d), loaded the first time one nears the screen. They only read the run:
     nothing here writes to the engine, the log or the store. Without WebGL they draw in Canvas2D; without the engine they step aside. */
  var WK = 12, TN = 7, FH = .2, TH = .3, Y0 = WK * FH + .18, P3p = null, TMARG = 1.12;
  function floorY(i) { return i < WK ? i * FH : Y0 + (i - WK) * TH; }
  function floorH(i) { return i < WK ? FH - .035 : TH - .045; }
  var SLICES = [['f', 'Founders', 'Founders start with 100%. Every slice above was cut from this one.'],
    ['pool', 'Option pool', 'Shares for hires, granted after the SAFEs and topped up in the priced round.'],
    ['yc', 'Y Combinator', 'YC’s $500K: $125K for 7%, and $375K on an MFN SAFE that converts at your lowest cap.'],
    ['safe', 'Other SAFEs', 'Every other SAFE, each converting at its own cap.'],
    ['a', 'Priced round', 'The Series A investors’ new money, plus the pro rata the SAFE holders bought.']];
  /* the first frame: the empty building (the plan before week 1) as a registered poster, so the cover is composed before the engine loads */
  var POSTER = '<svg xmlns="http://www.w3.org/2000/svg" class="ps3d-poster" data-reg="1" data-v="2" data-tone="dark" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><style>.ps3d-poster[data-v="2"] .p-top{fill:var(--m-top,color-mix(in srgb,var(--paper) 55%,#fff))}.ps3d-poster[data-v="2"] .p-left{fill:var(--m-left,color-mix(in srgb,var(--paper) 88.5%,#74654A))}.ps3d-poster[data-v="2"] .p-right{fill:var(--m-right,color-mix(in srgb,var(--paper) 70%,#74654A))}.ps3d-poster[data-v="2"] .p-plaster{fill:var(--m-plaster,color-mix(in srgb,var(--paper) 94%,var(--ink)))}.ps3d-poster[data-v="2"] .p-foil{fill:var(--m-foil,var(--accent))}.ps3d-poster[data-v="2"] .p-metal{fill:var(--m-metal-hi,color-mix(in srgb,var(--muted) 45%,var(--paper)))}.ps3d-poster[data-v="2"] .p-metal.p-lo{fill:var(--m-metal-lo,color-mix(in srgb,var(--muted) 70%,var(--ink)))}.ps3d-poster[data-v="2"] .p-inkf{fill:var(--ink)}.ps3d-poster[data-v="2"] .p-inkc{fill:var(--ink)}.ps3d-poster[data-v="2"] .p-glass{fill:var(--ink-2)}.ps3d-poster[data-v="2"] .p-shadow{fill:var(--m-shadow,var(--ink));stroke:none}.ps3d-poster[data-v="2"] :is(.p-sil,.p-line,.p-line2,.p-fl){fill:none;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.ps3d-poster[data-v="2"] .p-sil{stroke:var(--m-sil,var(--ink))}.ps3d-poster[data-v="2"] .p-line{stroke:var(--ink)}.ps3d-poster[data-v="2"] .p-line2{stroke:var(--ink-2)}.ps3d-poster[data-v="2"] .p-fl{stroke:var(--foil-line)}.ps3d-poster[data-v="2"] .p-plate{filter:grayscale(1) sepia(.22) contrast(1.08) brightness(1.02)}.ps3d-poster[data-v="2"] .p-plate.is-dev{filter:none}.ps3d-poster[data-v="2"] .p-txt{fill:var(--ink)}.ps3d-poster[data-v="2"] .p-txt2{fill:var(--ink-2)}:is(:root[data-tone="dark"],.tone-dark,.band--dark,[data-ground="espresso"],[data-ground="forest"],[data-ground="slate"]) .ps3d-poster[data-v="2"] .p-top,.ps3d-poster[data-v="2"][data-tone="dark"] .p-top{fill:var(--m-top,color-mix(in srgb,var(--dark) 80%,var(--on-dark)))}:is(:root[data-tone="dark"],.tone-dark,.band--dark,[data-ground="espresso"],[data-ground="forest"],[data-ground="slate"]) .ps3d-poster[data-v="2"] .p-left,.ps3d-poster[data-v="2"][data-tone="dark"] .p-left{fill:var(--m-left,color-mix(in srgb,var(--dark) 87%,var(--on-dark)))}:is(:root[data-tone="dark"],.tone-dark,.band--dark,[data-ground="espresso"],[data-ground="forest"],[data-ground="slate"]) .ps3d-poster[data-v="2"] .p-right,.ps3d-poster[data-v="2"][data-tone="dark"] .p-right{fill:var(--m-right,color-mix(in srgb,var(--dark) 92%,var(--on-dark)))}:is(:root[data-tone="dark"],.tone-dark,.band--dark,[data-ground="espresso"],[data-ground="forest"],[data-ground="slate"]) .ps3d-poster[data-v="2"] .p-plaster,.ps3d-poster[data-v="2"][data-tone="dark"] .p-plaster{fill:var(--m-plaster,color-mix(in srgb,var(--dark) 95%,var(--on-dark)))}.ps3d-poster[data-v="2"][data-tone="dark"] .p-sil{stroke:var(--m-sil,var(--on-dark))}.ps3d-poster[data-v="2"][data-tone="dark"] .p-line{stroke:var(--on-dark)}.ps3d-poster[data-v="2"][data-tone="dark"] .p-line2{stroke:var(--on-dark-2)}.ps3d-poster[data-v="2"][data-tone="dark"] .p-shadow{fill:#000}.ps3d-poster[data-v="2"][data-tone="dark"] .p-inkf{fill:color-mix(in srgb,var(--dark) 93%,var(--on-dark))}.ps3d-poster[data-v="2"][data-tone="dark"] .p-inkc{fill:var(--on-dark)}.ps3d-poster[data-v="2"][data-tone="dark"] .p-glass{fill:var(--on-dark)}</style><defs><filter id="p13u1b5" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter></defs><g data-part="base" style="--i:0"><path class="p-plaster" d="M68.1 496.4L278.8 558.7L431.9 473L221.2 410.7Z"/><path class="p-right" d="M278.8 567.9L431.9 482.2L431.9 473L278.8 558.7ZM68.1 505.6L278.8 567.9L278.8 558.7L68.1 496.4Z"/><path class="p-line2" stroke-width="1.43" stroke-opacity="0.27" d="M278.8 567.9L431.9 482.2"/><path class="p-line2" stroke-width="1.43" stroke-opacity="0.24" d="M431.9 482.2L431.9 473"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.12" d="M431.9 473L278.8 558.7"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.14" d="M278.8 558.7L278.8 567.9"/><path class="p-line2" stroke-width="1.43" stroke-opacity="0.26" d="M68.1 505.6L68.1 496.4"/><path class="p-line2" stroke-width="1.43" stroke-opacity="0.22" d="M68.1 496.4L221.2 410.7"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.13" d="M68.1 496.4L278.8 558.7"/><path class="p-line2" stroke-width="1.43" stroke-opacity="0.21" d="M431.9 473L221.2 410.7"/><path class="p-line2" stroke-width="1.43" stroke-opacity="0.28" d="M278.8 567.9L68.1 505.6"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p13u1b5)" d="M223.3 418.7L437.1 481.9L281.7 568.9L67.9 505.7Z"/></g><g data-part="batch" style="--i:1"><path class="p-glass" fill-opacity="0.11" d="M261.1 513.2L320 480.2L320 263.8L261.1 296.8Z"/><path class="p-glass" fill-opacity="0.07" d="M180 489.2L261.1 513.2L261.1 296.8L180 272.8Z"/><path class="p-glass" fill-opacity="0.15" d="M180 272.8L261.1 296.8L320 263.8L238.9 239.9Z"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.26" d="M261.1 513.2L320 480.2M320 480.2L320 263.8M261.1 513.2L180 489.2"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.29" d="M320 263.8L261.1 296.8M261.1 296.8L261.1 513.2"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.24" d="M238.9 456.3L180 489.2M238.9 239.9L238.9 456.3"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.27" d="M180 489.2L180 272.8M180 272.8L238.9 239.9M320 263.8L238.9 239.9"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.30" d="M180 272.8L261.1 296.8"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.23" d="M238.9 456.3L320 480.2"/><path class="p-line2" stroke-width="0.67" stroke-opacity="0.17" d="M180 472.5L261.1 496.5M261.1 496.5L320 463.5M180 454.2L261.1 478.2M261.1 478.2L320 445.2M261.1 459.9L320 426.9M261.1 441.6L320 408.6"/><path class="p-line2" stroke-width="0.67" stroke-opacity="0.18" d="M180 435.9L261.1 459.9M180 417.6L261.1 441.6M180 399.3L261.1 423.3M261.1 423.3L320 390.3M180 381L261.1 405M261.1 405L320 372M180 362.7L261.1 386.7M261.1 386.7L320 353.7M261.1 368.4L320 335.4M261.1 350.1L320 317.1"/><path class="p-line2" stroke-width="0.67" stroke-opacity="0.19" d="M180 344.4L261.1 368.4M180 326.1L261.1 350.1M180 307.8L261.1 331.8M261.1 331.8L320 298.8M180 289.5L261.1 313.5M261.1 313.5L320 280.5"/></g><g data-part="fuel" style="--i:2"><path class="p-line2" stroke-width="0.67" stroke-opacity="0.21" stroke-dasharray="3 3" d="M156 484.7L156 60.5"/></g><g data-part="dd" style="--i:3"><path class="p-line2" stroke-width="0.89" stroke-opacity="0.49" stroke-dasharray="3 3" d="M269.9 316.3L375.9 257M375.9 249.7L269.9 309"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.45" stroke-dasharray="3 3" d="M375.9 257L375.9 249.7"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.52" stroke-dasharray="3 3" d="M269.9 309L269.9 316.3"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.43" stroke-dasharray="3 3" d="M230.1 213.9L124.1 273.2M124.1 265.9L230.1 206.6"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.47" stroke-dasharray="3 3" d="M124.1 273.2L124.1 265.9"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.39" stroke-dasharray="3 3" d="M230.1 206.6L230.1 213.9"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.50" stroke-dasharray="3 3" d="M124.1 265.9L269.9 309M269.9 316.3L124.1 273.2"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.42" stroke-dasharray="3 3" d="M375.9 249.7L230.1 206.6M230.1 213.9L375.9 257"/></g><g data-part="after" style="--i:4"><path class="p-glass" fill-opacity="0.11" d="M261.1 277.1L320 244.1L320 56.1L261.1 89.1Z"/><path class="p-glass" fill-opacity="0.07" d="M180 253.1L261.1 277.1L261.1 89.1L180 65.1Z"/><path class="p-glass" fill-opacity="0.15" d="M180 65.1L261.1 89.1L320 56.1L238.9 32.1Z"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.30" d="M261.1 277.1L320 244.1M320 244.1L320 56.1M320 56.1L238.9 32.1M261.1 277.1L180 253.1"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.32" d="M320 56.1L261.1 89.1M261.1 89.1L261.1 277.1"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.28" d="M238.9 220.2L180 253.1M238.9 32.1L238.9 220.2"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.31" d="M180 253.1L180 65.1M180 65.1L238.9 32.1"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.33" d="M180 65.1L261.1 89.1"/><path class="p-line2" stroke-width="0.89" stroke-opacity="0.27" d="M238.9 220.2L320 244.1"/><path class="p-line2" stroke-width="0.67" stroke-opacity="0.20" d="M180 227.8L261.1 251.7M180 200.3L261.1 224.3M261.1 224.3L320 191.3M180 172.9L261.1 196.8M261.1 196.8L320 163.8M180 145.4L261.1 169.3M261.1 169.3L320 136.4M261.1 141.9L320 108.9"/><path class="p-line2" stroke-width="0.67" stroke-opacity="0.19" d="M261.1 251.7L320 218.7"/><path class="p-line2" stroke-width="0.67" stroke-opacity="0.21" d="M180 117.9L261.1 141.9M180 90.5L261.1 114.4M261.1 114.4L320 81.5"/></g></svg>';
  function need3D() {
    var W = window;
    if (W.PS3D && W.PS3D.model) return Promise.resolve(models3D(W.PS3D));
    if (!P3p) P3p = new Promise(function (res, rej) {
      var s = document.createElement('script'), t = setTimeout(function () { P3p = null; rej(new Error('3D timed out')); }, 15000);
      s.src = '/assets/3d/core.js?v=3'; s.async = true;
      s.onload = function () { clearTimeout(t); if (W.PS3D) res(models3D(W.PS3D)); else rej(new Error('no 3D engine')); };
      s.onerror = function () { clearTimeout(t); P3p = null; rej(new Error('3D did not load')); };
      document.head.appendChild(s);
    });
    return P3p;
  }
  /* the kit's scene loader when the page has one, the engine's own otherwise; the models are registered first either way */
  function mount3D(fig, id, o) {
    return need3D().then(function (P) { return P.load('explorer'); }).then(function () {
      /* the explorer's stylesheet first, so pins and hints never flash unstyled */
      var l = document.querySelector('link[data-ps3d]');
      return !l || l.sheet ? 0 : new Promise(function (r) { l.addEventListener('load', r); l.addEventListener('error', r); setTimeout(r, 3000); });
    }).then(function () { var P = window.PS3D; return K.scene ? Promise.resolve(K.scene(fig, id, o)) : P.mount(fig, id, o); });
  }
  function models3D(P) {
    if (P.getModel('batch-tower')) return P;
    function place(nd, x, s, y) { nd.children.forEach(function (c) { c.pos = [x, y, 0]; c.scl = [s, 1, s]; }); }
    /* a floor eases to its new width and lean; a floor built this week is set down from above */
    function move(nd, x, s, ctx, born) {
      var c = nd.children[0];
      if (nd._tw) { nd._tw(); nd._tw = null; }
      if (nd._ta) { nd._ta(); nd._ta = null; }
      nd.alpha = 1;
      if (ctx.init || ctx.reduced || !ctx.view) { place(nd, x, s, 0); nd.alpha = 1; return; }
      if (!born && M.abs(c.pos[0] - x) < 1e-4 && M.abs(c.scl[0] - s) < 1e-4) return;
      if (born) nd.alpha = 0;
      nd._tw = P.tween({ from: [c.pos[0], c.scl[0], born ? .6 : c.pos[1]], to: [x, s, 0], dur: 560, ease: 'out', update: function (v, k) {
        place(nd, v[0], v[1], v[2]); if (born) nd.alpha = M.min(1, k * 2.5); ctx.view.invalidate();
      } });
    }
    /* it stands on an espresso stage: a floor that earned something prints as lit paper, a week that earned nothing as an outline,
       the weeks still to come as one glass envelope with a hairline at every floor, Demo Day as a glass slab, the plinth in plaster */
    P.model('batch-tower', {
      v: 2, title: 'Your company as a building', camera: 'ortho', margin: TMARG,
      views: { iso: { yaw: 36, pitch: 24, zoom: 1 }, front: { yaw: 0, pitch: 2 }, plan: { yaw: 0, pitch: 90 } },
      mats: { plan: { face: 'none', line: 'ink2', lineA: .55, dash: 3 }, base: { kind: 'plaster', face: 'card', line: 'ink2', lineA: .4 },
        zero: { face: 'none', line: 'ink2', lineA: .85 }, built: { face: 'ink', line: 'dark', lineA: .32 },
        env: { kind: 'glass', face: 'paper', faceA: .08, line: 'ink2', lineA: .34 }, envl: { face: 'none', line: 'ink2', lineA: .4 },
        live: { face: 'none', line: 'accent', w: 1.5 }, dead: { face: 'none', line: 'ink2', w: 1 }, pipe: { face: 'none', line: 'ink2', lineA: .45, dash: 3 } },
      params: { d: null },
      build: function (B) {
        function floor(i) {
          var h = floorH(i);
          return B.part('f' + i, { name: i < WK ? 'Week ' + (i + 1) : 'Months ' + (5 + 2 * (i - WK)) + '–' + (6 + 2 * (i - WK)), pos: [0, floorY(i), 0] }, [], [
            B.part(null, { visible: false }, [B.box(0, 0, 0, 1, h, 1, { mat: 'plan' })]), B.part(null, { visible: false }, [B.box(0, 0, 0, 1, h, 1, { mat: 'zero' })]),
            B.part(null, { visible: false }, [B.box(0, 0, 0, 1, h, 1, { mat: 'built' })])]);
        }
        var wk = [], tn = [], i;
        for (i = 0; i < WK; i++) wk.push(floor(i));
        for (i = WK; i < WK + TN; i++) tn.push(floor(i));
        return [
          B.part('base', { pick: false, layer: -1 }, [B.box(0, -.1, 0, 2.6, .1, 2.6, { mat: 'base' })]),
          B.part('batch', { n: 1, name: 'The batch', why: 'Twelve weeks, one floor each. A floor drawn in outline earned nothing that week.' }, [], wk.concat([B.part('envB', {}, [])])),
          B.part('dd', { n: 2, name: 'Demo Day', why: 'One minute on stage, then four weeks of raising. The glass floor holds both.', pos: [0, WK * FH, 0], explode: [0, .45, 0] }, [], [
            B.part(null, {}, [B.box(0, 0, 0, 1.8, .08, 1.8, { mat: 'plan' })]), B.part(null, { visible: false }, [B.box(0, 0, 0, 1.8, .08, 1.8, { mat: 'glass' })])]),
          B.part('after', { n: 3, name: 'The year after', why: 'Seven two-month turns. Each floor is the revenue at the end of its turn.', explode: [0, .9, 0] }, [], tn.concat([B.part('envA', {}, [])])),
          B.part('fuel', { n: 4, name: 'Runway line', why: 'It lights up once your runway outlasts the months to profitability. Paul Graham calls that default alive.', explode: [-.5, 0, 0] }, [])
        ];
      },
      update: function (root, p, ctx) {
        var d = p.d, n = root.parts, i, f, nd, k, top = floorY(WK + TN - 1) + floorH(WK + TN - 1), sh = [], x = d && d.fx, z = .55;
        if (!d) return;
        for (i = 0; i < WK + TN; i++) {
          f = d.f[i]; nd = n['f' + i]; k = nd.children;
          k[0].visible = false; k[1].visible = f.st === 1; k[2].visible = f.st === 2;
          move(nd, f.x, f.s, ctx, nd._st === 0 && f.st > 0);
          nd._st = f.st; nd.fig = f.fig; nd.why = f.why; nd.anchor = [f.x + f.s / 2, floorH(i), f.s / 2];
        }
        /* the floors still to come: one glass volume from the next floor to the top of its stretch, a hairline where each floor will sit */
        function env(en, a, b) {
          var u = -1, j, g = [];
          for (j = a; j < b; j++) if (!d.f[j].st) { u = j; break; }
          if (u < 0) { en.visible = false; return; }
          var ex = d.f[u].x, y0 = floorY(u), y1 = floorY(b - 1) + floorH(b - 1), key = ex + '|' + u;
          en.visible = true;
          if (en._key === key) return;
          en._key = key;
          g.push(P.B.box(ex, y0, 0, 1, y1 - y0, 1, { mat: 'env' }));
          for (j = u + 1; j < b; j++) { var yy = floorY(j) - (j < WK ? .0175 : .0225); g.push(P.B.path([[ex - .5, yy, .5], [ex + .5, yy, .5], [ex + .5, yy, -.5]], { mat: 'envl' })); }
          en.setGeom(P.geom(g, root.def.mats));
        }
        env(n.envB, 0, WK); env(n.envA, WK, WK + TN);
        nd = n.dd; k = nd.children;
        k[0].visible = !d.dd; k[1].visible = !!d.dd;
        move(nd, d.dx, 1, ctx, nd._st === 0 && d.dd);
        nd._st = d.dd ? 1 : 0; nd.anchor = [d.dx + .9, .08, .9];
        f = d.f[5]; n.batch.anchor = [f.x + f.s / 2, floorY(5) + floorH(5), f.s / 2];
        f = d.f[WK + 3]; n.after.anchor = [f.x + f.s / 2, floorY(WK + 3) + floorH(WK + 3), f.s / 2];
        /* the runway line: one stretch per built floor, ink while default dead, foil once alive; ticks are months of runway */
        d.fu.forEach(function (s) {
          var m = s[2] === 1 ? 'live' : s[2] ? 'pipe' : 'dead';
          sh.push(P.B.path([[x, s[0], z], [x, s[1], z]], { mat: m }), P.B.path([[x, s[3], z], [x + s[4], s[3], z]], { mat: m }));
        });
        sh.push(P.B.path([[x, d.fy, z], [x, top, z]], { mat: 'pipe' }));
        n.fuel.setGeom(P.geom(sh, root.def.mats));
        n.fuel.anchor = [x, d.fa, z];
        n.base.pos = [d.bx, 0, 0];
        return { figs: { batch: d.g[0], dd: d.g[1], after: d.g[2], fuel: d.g[3] } };
      }
    });
    P.model('batch-captable', {
      v: 2, title: 'The cap table as a cylinder', camera: 'ortho', margin: 1.16, labelMode: { column: 'right' },
      views: { iso: { yaw: 28, pitch: 24, zoom: 1 }, front: { yaw: 0, pitch: 0 }, plan: { yaw: 0, pitch: 90 } },
      mats: { pool: { face: 'card', line: 'ink2', dash: 3 }, part: { face: 'card', line: 'ink' } },
      params: { v: [.93, 0, .07, 0, 0] },
      build: function (B) {
        return SLICES.map(function (s, i) {
          return B.part(s[0], { n: i + 1, name: s[1], why: s[2], explode: [0, .28 * i, 0] }, [],
            [B.part(null, {}, [B.cyl([0, 0, 0], 1, 1, { seg: 48, mat: i ? (i === 1 ? 'pool' : 'part') : 'foil' })])]);
        });
      },
      update: function (root, p, ctx) {
        var y = 0, figs = {}, H = 2.24, TINT = [0, 0, .1, .05, .02];
        SLICES.forEach(function (s, i) {
          var nd = root.parts[s[0]], c = nd.children[0], v = M.max(0, +p.v[i] || 0), h = M.max(.001, v * H), on = v > .0005, y1 = y;
          if (c._tw) { c._tw(); c._tw = null; }
          if (ctx.init || ctx.reduced || !ctx.view || !c.visible) { c.pos = [0, y1, 0]; c.scl = [1, h, 1]; }
          else c._tw = P.tween({ from: [c.pos[1], c.scl[1]], to: [y1, h], dur: 240, ease: 'out', update: function (a) { c.pos = [0, a[0], 0]; c.scl = [1, a[1], 1]; ctx.view.invalidate(); } });
          c.visible = on; nd.tint = TINT[i];
          nd.anchor = [.71, y1 + h / 2, .71];
          figs[s[0]] = F.pct(v, 1);
          if (on) y += h + .04;
        });
        return { figs: figs };
      }
    });
    return P;
  }
  /* the slice names ride the drawing through the engine's shared label layer (a leader column on the right), shown while it is
     taken apart: [{n: node, at: [x,y,z] in its space, t: text}]. Returns a sync() that refreshes the text after the slices change */
  function tags3D(ex, list) {
    var recs = [];
    list().forEach(function (t, i) {
      var e = document.createElement('span');
      e.className = 'iso-label is-start yb-tag'; e.style.display = 'none';
      ex.pinsEl.appendChild(e);
      recs.push({ e: e, i: i, it: ex.labs.add({ el: e, n: t.n, at: t.at, show: function () { return ex.ex > .5; } }) });
    });
    /* the layer places a label and leaves a hidden one where it was: a slice that is together, or empty, carries no name */
    ex.vw.on('frame', function () {
      recs.forEach(function (r) { var on = ex.ex > .5 && !!r.it.n._ev; if ((r.e.style.display !== 'none') !== on) { r.e.style.display = on ? '' : 'none'; r.it.m = false; } });
    });
    function sync() {
      var L = list();
      recs.forEach(function (r) { var t = L[r.i]; if (t && r.e.textContent !== t.t) { r.e.textContent = t.t; r.it.m = false; } });
      ex.vw.invalidate();
    }
    sync();
    return sync;
  }
  function p3List(L) {
    return '<ol class="yb-p3">' + L.map(function (x, i) {
      return '<li><button type="button" data-part="' + x[0] + '" aria-pressed="false"><span class="n">' + (i + 1) + '</span><span class="t">' + x[1] + '</span><span class="v"></span></button></li>';
    }).join('') + '</ol>';
  }
  function fig3D(cls, label, id, wait, cap, list, pre, ground) {
    return '<figure class="iso lk-scene yb-scene ' + cls + '"' + (ground ? ' data-ground="' + ground + '"' : '') + '><div class="iso-stage" tabindex="0" role="group" aria-roledescription="3D model" aria-label="' + label + '" aria-describedby="' + id + '">' +
      (wait.charAt(0) === '<' ? wait : '<p class="ps3d-poster yb-poster">' + wait + '</p>') + '</div><figcaption>' + (pre || '') + '<p class="yb-scap" id="' + id + '">' + cap + '</p>' + p3List(list) +
      '<p class="iso-live vh" aria-live="polite"></p></figcaption></figure>';
  }

  function init(root, ctx) {
    var store = ctx.store, saved = store.get(), S = null, log = [], seed = 0, ui = {}, extra = [], confirmReset = false;
    var runs = saved && saved.runs || 0, best = saved && saved.best || null;
    var X3 = { tw: null, cy: null, d: null, key: '', ck: '', src: null, io: null, off: false, seg: null }, snaps = {};
    K.glossary(root, DEFS);
    root.innerHTML = '<div class="yb">' +
      '<div class="yb-top" hidden><p class="yb-railnow"></p><div class="yb-wk"></div></div>' +
      '<div class="yb-main"><section class="yb-desk" aria-label="The desk"></section><div class="yb-side" hidden>' +
        '<section class="yb-stage" data-ground="espresso" aria-label="Your company"><div class="yb-hero"></div><div class="yb-stfig">' +
        fig3D('yb-tower', 'Your company as a building', 'yb-tw-d', POSTER || 'Drawing the building',
          'Your company as a building. Each week adds a floor. Width is revenue, and the step out is growth. Demo Day is the glass floor. The line up the side lights up once your runway outlasts the months to profitability.',
          [['batch', 'The batch'], ['dd', 'Demo Day'], ['after', 'The year after'], ['fuel', 'Runway line']]) +
        '</div><ol class="ledger ledger--data yb-led"></ol></section>' +
        '<aside class="yb-inst" aria-label="Instruments" hidden></aside></div></div>' +
      '<section class="yb-journal" hidden><div class="yb-jhead"><h5 class="lk-kicker">The journal</h5><button type="button" class="yb-reset" data-act="reset">Start a new batch</button></div><div class="lk-feed yb-feed" aria-live="off"></div></section>' +
      '<div class="yb-end"></div>' +
      '<details class="yb-lab"><summary>The dilution lab <span>YC’s formulas with your own numbers</span></summary><div class="yb-labbody"></div></details>' +
      '<div class="yb-foot"></div></div>';
    var el = {
      top: root.querySelector('.yb-top'), wk: root.querySelector('.yb-wk'), railnow: root.querySelector('.yb-railnow'), led: root.querySelector('.yb-led'),
      hero: root.querySelector('.yb-hero'), stfig: root.querySelector('.yb-stfig'),
      main: root.querySelector('.yb-main'), desk: root.querySelector('.yb-desk'), inst: root.querySelector('.yb-inst'), jour: root.querySelector('.yb-journal'),
      side: root.querySelector('.yb-side'), tw: root.querySelector('.yb-tower'),
      feed: root.querySelector('.yb-feed'), end: root.querySelector('.yb-end'), lab: root.querySelector('.yb-lab'), foot: root.querySelector('.yb-foot')
    };
    var shelf = K.shelf(el.foot, { slug: SLUG, notes: NOTES, caseFile: CASE,
      take: { items: TAKE, personal: function () { return personal(); } } });

    /* ---------- the run: a seed and a log ---------- */
    function save() {
      var b = best;
      if (S && S.phase === 'end') {
        var ct = capNow(S), rec = { ending: S.ending, founders: ct.founders, mrr: S.MRR };
        if (!b || rec.mrr > b.mrr) b = best = rec;
      }
      store.set({ v: 1, seed: seed, log: log, done: !!(S && S.phase === 'end'), runs: runs, best: b });
    }
    function start(sd, lg) {
      seed = sd; log = []; extra = []; ui = { plan: null, dd: null, turn: null, open: {} }; snaps = {};
      S = create(sd);
      homeScene();
      el.end.innerHTML = '';
      (lg || []).forEach(function (a) { apply(S, a); log.push(a); snap(); });
      S.nq = [];
      shelf.setMeta('Batch #' + seed + ' · Same seed, same choices, same run.');
    }
    function act(a, focusSel) {
      try { apply(S, a); } catch (e) { if (K.debug) console.warn('[lab:batch]', e); render(); return; }
      log.push(a);
      snap();
      if (S.phase === 'end' && a.t === 'next') runs++;
      drainNotes();
      save();
      render(focusSel);
      announce(a);
    }
    function drainNotes() {
      var q = S.nq.splice(0), fresh = [];
      q.forEach(function (n) { if (shelf.notes.unlock(n.id, { where: n.where, announce: false })) { fresh.push(n.id); extra.push({ at: S.journal.length, id: n.id }); } });
      if (fresh.length) K.say(fresh.length === 1 ? 'New field note: ' + noteTerm(fresh[0]) + '.' : fresh.length + ' new field notes.');
    }
    function noteTerm(id) { for (var i = 0; i < NOTES.length; i++) if (NOTES[i].id === id) return NOTES[i].term; return id; }
    function announce(a) {
      var r = S.report;
      if (a.t === 'run' && r) K.say((r.w <= 12 ? 'Week ' + r.w : 'Raise week ' + (r.w - 12)) + ': MRR ' + money(S.MRR) + (r.g != null ? ', ' + (r.g >= 0 ? 'up ' : 'down ') + F.pct(M.abs(r.g), 0) : '') + '.' + (S.ev ? ' An event needs your decision.' : ''));
      else if (a.t === 'turn' && r) K.say('Months ' + (5 + 2 * r.t) + ' to ' + (6 + 2 * r.t) + ': MRR ' + money(S.MRR) + ', cash ' + money(S.cash) + '. ' + (aliveProj(S).alive ? 'Default alive.' : 'Default dead.'));
    }
    function personal() {
      if (!S || S.phase !== 'end') return null;
      var ct = capNow(S);
      return 'My batch #' + seed + ': ' + ENDINGS[S.ending].toLowerCase() + ', ' + money(S.MRR) + ' MRR in month ' + lastMonth(S) + ', founders own ' + F.pct(ct.founders, 1) + '.';
    }

    /* ---------- the frame: rail, strip, instruments, journal ---------- */
    function stage() {
      if (S.phase === 'week') return S.week <= 12 ? 'Week ' + S.week + ' of 12' : 'Raise · week ' + (S.week - 12) + ' of 4';
      if (S.phase === 'dd') return 'Demo Day';
      if (S.phase === 'closed') return 'Round closed';
      if (S.phase === 'turn') return 'Months ' + (5 + 2 * S.turn) + ' to ' + (6 + 2 * S.turn);
      if (S.phase === 'end') return 'The end: month ' + lastMonth(S);
      return 'The application';
    }
    /* the board: every week of the batch, the raise and the year after as a row of figures, filled in as you go */
    function cellMoney(v) { var a = M.abs(v); return a >= 1e6 ? '$' + F.n(v / 1e6, 1) + 'M' : a >= 1e4 ? '$' + F.n(v / 1e3, 0) + 'K' : a >= 1e3 ? '$' + F.n(v / 1e3, 1) + 'K' : F.usd(v); }
    function renderRail() {
      var cur = S.phase === 'week' ? (S.week <= 12 ? S.week - 1 : 12 + S.week - 12) : S.phase === 'dd' ? 12 : S.phase === 'closed' ? 16 : S.phase === 'turn' ? 17 + S.turn : S.phase === 'end' ? 24 : -1;
      var H = S.h, nW = H.mrr.length - 1, nT = S.a3 ? S.a3.turns.length : 0, h = '', i;
      function cell(slot, lab, name, built, v, g, mo) {
        var c = slot < cur ? ' is-past' : slot === cur ? ' is-now' : ' is-next', full = mo ? .15 : .10, hot = mo ? .08 : .05;
        if (!built) return '<li class="yb-c is-empty' + c + '"' + (slot === cur ? '' : ' aria-hidden="true"') + '><span class="yb-ck" aria-hidden="true">' + lab + '</span><span class="yb-cv" aria-hidden="true"></span>' +
          (slot === cur ? '<span class="vh">' + name + ': this ' + (mo ? 'turn' : 'week') + '.</span>' : '') + '</li>';
        var gt = g == null ? '–' : F.pct(g, M.abs(g) < .1 ? 1 : 0, true), w = g == null ? 0 : clamp(M.abs(g) / full, 0, 1);
        return '<li class="yb-c' + c + '"><span class="yb-ck" aria-hidden="true">' + lab + '</span><span class="yb-cv" aria-hidden="true">' + cellMoney(v) + '</span>' +
          '<span class="yb-cg" aria-hidden="true">' + gt + '</span><i class="yb-cb' + (g != null && g >= hot ? ' is-hot' : g != null && g < 0 ? ' is-neg' : '') + '" style="--g:' + w.toFixed(3) + '" aria-hidden="true"></i>' +
          '<span class="vh">' + name + ': ' + money(v) + ' MRR' + (g == null ? '.' : ', ' + (g >= 0 ? 'up ' : 'down ') + F.pct(M.abs(g), 1) + (mo ? ' a month.' : '.')) + '</span></li>';
      }
      function row(cls, title, note, cells) { return '<div class="yb-wr ' + cls + '"><p class="yb-wrh"><span>' + title + '</span>' + (note ? '<span class="yb-wrn">' + note + '</span>' : '') + '</p><ol class="yb-wrl" aria-label="' + title + '">' + cells + '</ol></div>'; }
      var b = '';
      for (i = 1; i <= WK; i++) b += cell(i - 1, 'W' + i, 'Week ' + i, i <= nW, H.mrr[i] || 0, H.g[i], false);
      h += row('yb-wr--b', 'The batch', '', b);
      if (cur >= 12) {
        var r = '', dm = S.dd && S.dd.mrr != null ? S.dd.mrr : nW >= WK ? H.mrr[WK] : null;
        for (i = 1; i <= 4; i++) r += cell(12 + i, 'R' + i, 'Raise week ' + i, WK + i <= nW, H.mrr[WK + i] || 0, H.g[WK + i], false);
        h += row('yb-wr--r', 'The raise', dm != null ? 'Demo Day · ' + money(dm) + ' MRR' : 'Demo Day', r);
      }
      if (cur >= 17 || nT) {
        var a = '';
        for (i = 0; i < TN; i++) {
          var built = i < nT, m1 = built ? monAt(i) : null, m0 = built ? (i ? monAt(i - 1).mrr : (S.mon[4] ? S.mon[4].mrr : H.mrr[WK] || 0)) : 0;
          a += cell(17 + i, 'M' + (5 + 2 * i) + '–' + (6 + 2 * i), 'Months ' + (5 + 2 * i) + ' to ' + (6 + 2 * i), built, built ? m1.mrr : 0, built && m0 > 0 ? M.pow(m1.mrr / m0, 1 / m1.n) - 1 : null, true);
        }
        h += row('yb-wr--a', 'The year after', '', a);
      }
      el.wk.innerHTML = h;
      el.railnow.innerHTML = '<span class="yb-railseed">Batch #' + seed + '</span> <span aria-hidden="true">·</span> ' + E(stage());
    }
    /* the stage's readouts: MRR as the hero figure, the rest as a ledger; a state rides on a small seal, never on the type */
    function cell(k, v, cls, sub) {
      return '<li' + (cls ? ' class="' + cls + '"' : '') + '><span class="ledger-k">' + k + (sub ? '<small>' + sub + '</small>' : '') + '</span><span class="ledger-n">' +
        (cls ? '<i class="yb-dot" aria-hidden="true"></i>' : '') + v + '</span></li>';
    }
    function renderStrip() {
      var a3 = S.turn >= 0, nW = S.h.mrr.length - 1, g = a3 ? cmgr(S, 3) : S.h.g[nW], net = burnNow(S) - S.MRR, al = aliveProj(S), h = '', gc, gw;
      if (a3) { gc = g >= .08 ? 'is-good' : g < .03 ? 'is-bad' : ''; gw = g == null ? 'Growth: too early' : pctS(g) + ' a month · ' + mWord(g) + (g > .4 ? '; capped at 40% for the projection' : g < -.2 ? '; floored at −20% for the projection' : ''); }
      else { gc = g == null ? '' : g >= .05 ? 'is-good' : g < .01 ? 'is-bad' : ''; gw = g == null ? 'Growth: too early' : pctS(g) + ' a week · ' + gWord(g); }
      el.hero.innerHTML = '<p class="yb-hk">MRR</p>' +
        '<p class="yb-hv stat foil">' + money(S.MRR) + '</p><p class="yb-hg' + (gc ? ' ' + gc : '') + '">' + (gc ? '<i class="yb-dot" aria-hidden="true"></i>' : '') + E(gw) + '</p>';
      h += cell(S.idea ? E(S.idea.unit[1].charAt(0).toUpperCase() + S.idea.unit[1].slice(1)) : 'Customers', F.n(M.round(S.N)));
      h += cell('Cash', money(S.cash), S.cash < 0 ? 'is-bad' : '');
      h += cell('Runway', net <= 0 ? 'Profitable' : S.cash <= 0 ? 'None' : M.floor(S.cash / net) + ' mo', net <= 0 ? 'is-good' : S.cash / net < 6 ? 'is-bad' : '', net > 0 ? money(net) + ' a month net' : 'revenue covers burn');
      if (a3 || S.phase === 'closed' || S.phase === 'end') h += cell('Default', al.alive ? 'Alive' : 'Dead', al.alive ? 'is-good' : 'is-bad', al.now ? 'profitable now' : al.alive ? 'profitable in ' + al.t + ' mo' : al.never ? 'revenue never passes burn' : 'at today’s growth');
      else { var b = belief(S); h += cell('Demand', E(b.word), '', b.suf ? E(b.suf.replace(/[()]/g, '').trim()) : 'as you believe it'); }
      if (duo(S)) {
        var fv = S.team.hidden && S.fric < 50 ? fricWord(S.fric) : 'Friction ' + F.n(S.fric);
        h += cell('Team', fv, S.fric >= 70 || S.morale < 30 ? 'is-bad' : S.fric >= 50 ? 'is-warn' : '', 'Morale ' + F.n(S.morale) + ' · ' + E(cof(S)) + ' and you');
      } else h += cell('Team', 'Morale ' + F.n(S.morale), S.morale < 30 ? 'is-bad' : '', S.split ? E(cof(S)) + ' left in ' + E(S.split.when) : 'just you');
      el.led.innerHTML = h;
    }
    function renderInst() {
      var a3 = S.turn >= 0 || S.phase === 'closed', h = '<div class="yb-charts">';
      h += '<figure class="yb-fig"><figcaption class="yb-figcap"><span class="lk-k">' + (a3 ? 'MRR by month, and where new customers came from' : 'MRR by week, and where new customers came from') + '</span></figcaption>' +
        '<canvas class="lk-chart yb-cv" data-cv="growth" aria-hidden="true"></canvas><p class="vh yb-cvsum"></p>' +
        '<p class="yb-legend" aria-hidden="true"><span><i class="yb-sw yb-sw--hand"></i>' + (a3 ? 'Effort' : 'By hand') + '</span><span><i class="yb-sw yb-sw--trial"></i>' + (a3 ? 'Paid' : 'Trials') + '</span><span><i class="yb-sw yb-sw--wom"></i>Word of mouth</span>' + (a3 ? '' : '<span><i class="yb-sw yb-sw--dot"></i>Weekly growth</span>') + '</p></figure>';
      if (S.turn >= 0) h += '<figure class="yb-fig"><figcaption class="yb-figcap"><span class="lk-k">Default alive or dead: revenue, burn and cash, projected</span></figcaption><canvas class="lk-chart yb-cv" data-cv="alive" aria-hidden="true"></canvas><p class="vh yb-cvsum2"></p>' + aliveLegend() + '</figure>';
      h += '</div><div class="yb-dets">';
      h += det('know', 'What you know', knowSum(), knowHTML());
      h += det('cap', 'Cap table', 'Founders own ' + F.pct(capNow(S).founders, 1), capHTML(capNow(S), false));
      if (S.week >= 2 && S.turn < 0 && S.phase !== 'closed') h += det('board', 'Your section', 'You’re ' + ord(boardRows().rank) + ' of 7', boardHTML());
      el.inst.innerHTML = h + '</div>';
    }
    function aliveLegend() { return '<p class="yb-legend" aria-hidden="true"><span><i class="yb-ln"></i>Revenue</span><span><i class="yb-ln yb-ln--burn"></i>Burn</span><span><i class="yb-ln yb-ln--cash"></i>Cash, own scale</span><span><i class="yb-ln yb-ln--proj"></i>Projected</span></p>'; }
    function det(k, title, sumTxt, body) {
      if (ui.open[k] == null) ui.open[k] = root.clientWidth >= 600;
      return '<details class="yb-det" data-det="' + k + '"' + (ui.open[k] ? ' open' : '') + '><summary><span class="yb-dt">' + title + '</span><span class="yb-ds">' + E(sumTxt) + '</span></summary><div class="yb-detb">' + body + '</div></details>';
    }
    function knowSum() { return S.turn >= 0 ? fitWord(S.fit) : 'Demand: ' + belief(S).word; }
    function bandHTML(I, ins, surveyVd) {
      var b = belief(S, I, ins);
      return '<div class="yb-band" role="img" aria-label="Your belief about demand: ' + E(b.word + b.suf) + ', between ' + M.round(b.lo * 100) + ' and ' + M.round(b.hi * 100) + ' out of 100.' + (surveyVd != null ? ' Latest survey: ' + surveyVd + '% very disappointed; the bar is 40%.' : '') + '">' +
        '<i class="yb-band-r" style="left:' + (b.lo * 100).toFixed(1) + '%;width:' + ((b.hi - b.lo) * 100).toFixed(1) + '%"></i><i class="yb-band-c" style="left:' + (b.c * 100).toFixed(1) + '%"></i>' +
        (surveyVd != null ? '<i class="yb-band-40"></i><i class="yb-band-s yb-foil-mark" style="left:' + surveyVd + '%"></i>' : '') + '</div>' +
        '<p class="yb-bandw"><span>' + E(b.word) + E(b.suf) + '</span>' + (surveyVd != null ? '<span class="yb-bands">Very disappointed ' + surveyVd + '% · bar 40%</span>' : '') + '</p>';
    }
    function knowHTML() {
      var vd = lastVD(S), sv = S.surveys.length ? S.surveys[S.surveys.length - 1] : null;
      return '<p class="lk-k">Demand, as you believe it</p>' + bandHTML(null, null, vd) +
        '<dl class="yb-dl"><dt>Insight</dt><dd>' + K.meter(M.round(S.ins / 12.5) / 2, 'Insight ' + M.round(S.ins) + ' of 100') + ' <span>' + E(insWord(S.ins)) + '</span></dd>' +
        '<dt>Product</dt><dd>' + E(prodWord(S.Q)) + (S.Q < 100 ? ' · ' + M.round(S.Q) + '% built' : '') + '</dd>' +
        '<dt>Users say</dt><dd>' + (S.launched ? E(fitWord(S.fit)) : 'Nothing yet: nobody has used it.') + '</dd>' +
        '<dt>Survey</dt><dd>' + (sv ? sv.vd + '% would be very disappointed (week ' + sv.w + ')' : 'Not run yet. Office hours runs it once you have users.') + '</dd></dl>';
    }
    function capHTML(ct, big) {
      var seg = [], safes = S.safes;
      function add(k, v, cls, lbl) { if (v > .0005) seg.push({ k: k, v: v, cls: cls, lbl: lbl }); }
      var post = ct.D != null, m = post ? 1 - ct.D : 1;
      add('Founders', ct.founders, 'f', 'Founders');
      add('Options', ct.opts, 'o', 'Options for hires');
      add('YC 7%', ct.yc7 * m, 'y', 'YC (7% SAFE)');
      if (ct.mfn != null) add('YC MFN', ct.mfn * m, 'm', 'YC (MFN SAFE)');
      add('Other SAFEs', ct.other * m, 's', 'Other SAFEs');
      if (post) { add('Series A', ct.A + ct.SafePR, 'a', 'Series A (new money and pro rata)'); add('Pool', ct.P, 'p', 'New option pool'); }
      var bar = '<div class="yb-stack' + (big ? ' yb-stack--big' : '') + '" role="img" aria-label="' + E(seg.map(function (s) { return s.lbl + ' ' + F.pct(s.v, 1); }).join(', ')) + '">' +
        seg.map(function (s) { return '<i class="yb-seg yb-seg--' + s.cls + '" style="flex-grow:' + (s.v * 1000).toFixed(1) + '"></i>'; }).join('') + '</div>';
      var leg = '<ul class="yb-capleg">' + seg.map(function (s) { return '<li><i class="yb-seg yb-seg--' + s.cls + '"></i><span>' + E(s.lbl) + '</span><b class="lk-num">' + F.pct(s.v, 1) + '</b></li>'; }).join('') + '</ul>';
      var note = ct.mfn == null ? '<p class="yb-capnote">YC’s $375K ' + tm('mfn', 'MFN') + ' SAFE has no cap yet: it floats until you sign a capped SAFE or raise a priced round.</p>' :
        '<p class="yb-capnote">YC’s $375K converts at your lowest cap, ' + capM(minCap(S) || 0) + ': ' + F.pct(ct.mfn, 2) + '.</p>';
      if (post) note += '<p class="yb-formula lk-num">(1 − ' + F.pct(ct.o, 1) + ') × (1 − ' + F.pct(ct.S, 1) + ') × (1 − ' + F.pct(ct.D, 1) + ') = ' + F.pct(ct.founders, 1) + ' for the founders. ' + tm('dil', 'Dilution') + ' multiplies.</p>';
      if (safes.length && !big) note += '<p class="yb-capnote">' + safes.length + ' ' + F.plural(safes.length, 'SAFE') + ' signed, ' + money(raisedOut(S)) + ' in all.</p>';
      return bar + leg + note;
    }
    function boardRows() {
      var w = M.min(S.week, 16), rows = S.pd.mates.map(function (m) {
        return { name: m.name, line: m.role === 'pivoter' && w >= 8 ? PIVL[m.name] : m.line, mrr: m.mrr[w] || 0, g: mateG(m.mrr, w), spark: m.mrr.slice(1, w + 1) };
      });
      var yg = g4(S, w).g;
      rows.push({ name: S.idea.name, line: 'your company', mrr: S.MRR, g: yg == null ? 0 : yg, spark: S.h.mrr.slice(1, w + 1), you: true });
      rows.sort(function (a, b) { return b.g - a.g || b.mrr - a.mrr; });
      var rank = 0; rows.forEach(function (r, i) { if (r.you) rank = i + 1; });
      return { rows: rows, rank: rank };
    }
    function spark(a) {
      var mx = M.max.apply(null, a.concat([1])), n = a.length, pts = a.map(function (v, i) { return (n > 1 ? i / (n - 1) * 58 + 1 : 30).toFixed(1) + ',' + (15 - v / mx * 13).toFixed(1); }).join(' ');
      return '<svg class="yb-spark" viewBox="0 0 60 16" width="60" height="16" aria-hidden="true" focusable="false"><polyline points="' + pts + '"/></svg>';
    }
    function boardHTML() {
      var b = boardRows();
      return '<table class="lk-table yb-board"><thead><tr><th>#</th><th>Company</th><th>MRR</th><th>4 wk</th><th class="yb-spcol"><span class="vh">Trend</span></th></tr></thead><tbody>' +
        b.rows.map(function (r, i) {
          return '<tr' + (r.you ? ' class="is-sel"' : '') + '><td>' + (i + 1) + '</td><td class="yb-bn"><span class="yb-bname">' + E(r.name) + (r.you ? ' <small>(you)</small>' : '') + '</span><span class="yb-bline">' + E(r.line) + '</span></td><td>' + money(r.mrr) + '</td><td>' + (r.mrr > 0 ? pctS(r.g, 0) : '–') + '</td><td class="yb-spcol' + (r.you ? ' is-you' : '') + '">' + spark(r.spark) + '</td></tr>';
        }).join('') + '</tbody></table><p class="yb-capnote">Ranked on four-week growth, the way group office hours ranks it. Seven companies, one question: what did you do last week, and did it work?</p>';
    }
    function renderFeed() {
      var h = '', j = S.journal, xi = 0;
      function notes(upto) {
        var g = [];
        while (xi < extra.length && extra[xi].at <= upto) g.push(extra[xi++]);
        if (!g.length) return '';
        return '<p class="lk-line yb-noteline"><span class="lk-chip lk-chip--foil">' + (g.length > 1 ? 'Field notes' : 'Field note') + '</span>' +
          g.map(function (x) { return E(noteTerm(x.id)) + ' <button type="button" class="yb-read" data-note="' + E(x.id) + '" aria-label="Read the field note: ' + E(noteTerm(x.id)) + '">Read</button>'; }).join('<span class="yb-sep" aria-hidden="true"> · </span>') + '</p>';
      }
      for (var i = 0; i < j.length; i++) {
        h += notes(i);
        var e = j[i], chip = e.at + (e.who === 'wren' ? ' · Wren' : e.who === 'inv' ? ' · Investors' : e.who === 'cof' ? ' · ' + E(cof(S)) : e.who === 'news' ? ' · News' : e.who === 'you' ? ' · You' : '');
        h += '<p class="lk-line"><span class="lk-chip">' + chip + '</span>' + E(e.txt) + '</p>';
      }
      h += notes(1e9);
      el.feed.innerHTML = h;
      el.feed.scrollTop = el.feed.scrollHeight;
    }

    /* ---------- the desk: one card per phase ---------- */
    function head(kick, title, lede) {
      return '<div class="lk-head">' + (kick ? '<p class="lk-kicker lk-kicker--foil">' + kick + '</p>' : '') + '<h4 class="lk-title yb-h" tabindex="-1">' + title + '</h4>' + (lede ? '<p class="lk-lede">' + lede + '</p>' : '') + '</div>';
    }
    function renderIntro() {
      var sv = store.get(), res = sv && !sv.done && sv.log && sv.log.length > 1 ? sv : null, h = '';
      h += head('The batch · Batch #' + seed, 'Three months, $500,000, and one question every week.',
        'You are starting a company inside a Y Combinator batch. Each week you decide where the founders’ time goes, and the number that matters is how fast you grew. After Demo Day you raise, hire and find out whether the company is ' + tm('alive', 'default alive') + '.');
      h += '<ol class="yb-acts"><li><b>The application.</b> Pick an idea, a team and the paperwork; survive a short interview.</li><li><b>Twelve weeks.</b> Talk to users or build, launch ugly or late, and answer whatever the week throws at you.</li>' +
        '<li><b>Demo Day and the raise.</b> One minute on stage, then four weeks of SAFEs, caps and the MFN.</li><li><b>The year after.</b> Seven two-month turns: who to hire, what to spend, whether you’re default alive.</li></ol>';
      h += '<p class="yb-goal"><span class="lk-k">The goal</span>Reach month 18 with a company that is growing and alive, and still own a meaningful piece of it.</p>';
      h += '<div class="btnrow">';
      if (res) {
        var R = replaySafe(res.seed, res.log);
        h += R ? btn('resume', 'Resume batch #' + res.seed + ' at ' + E(stageOf(R).toLowerCase()), 'ebtn') + btn('begin', 'Start a new batch') : btn('begin', 'Begin', 'ebtn');
      } else h += btn('begin', 'Begin', 'ebtn');
      h += '</div>';
      if (runs) h += '<p class="yb-small">Batches finished in this browser: ' + runs + (best ? '. Best so far: ' + E(ENDINGS[best.ending].toLowerCase()) + ', ' + money(best.mrr) + ' MRR.' : '.') + '</p>';
      h += '<p class="yb-small">Educational simulation. The program facts and the math are real and sourced in the case file below; the companies and people are invented, and Y Combinator has nothing to do with this page. Not legal, tax or investment advice.</p>';
      return '<div class="yb-card yb-intro"><div class="yb-covfig"></div>' + h + '</div>';
    }
    function stageOf(R) { var s = S; S = R; var t = stage(); S = s; return t; }
    function replaySafe(sd, lg) { try { var R = create(sd); R.bot = 'peek'; lg.forEach(function (a) { apply(R, a); }); return R; } catch (e) { return null; } }
    function renderIdeaPick() {
      var h = head('The application · 1 of 4', 'Pick the idea.', 'Three ideas. You can see what they’d cost to build and what you believe about demand. You can’t see what’s true yet; that’s what users are for.');
      h += '<div class="yb-ideas">' + S.pd.deal3.map(function (id) {
        var I = resolveIdea(S, id), b = belief(S, I, 0);
        return '<article class="lk-card yb-idea"><p class="lk-kicker">' + (I.kind === 'b2b' ? 'Software for businesses' : 'Consumer app') + ' · ' + F.usd(I.arpa) + ' a month per ' + E(I.unit[0]) + '</p>' +
          '<h5 class="yb-iname">' + E(I.name) + '</h5><p class="yb-isent">' + E(I.sent) + '</p>' +
          '<p class="yb-iwho"><span class="lk-k">Who wants it right now</span>' + E(I.who) + '</p>' +
          '<p class="lk-k">Demand, as you believe it</p>' + bandHTML(I, 0, null) +
          '<p class="yb-ifact">Version one: ' + I.mvp + ' blocks of building</p>' +
          '<button type="button" class="ebtn2" data-act="idea" data-id="' + id + '">Start with ' + E(I.name) + '</button></article>';
      }).join('') + '</div>';
      h += '<p class="lk-coach">The bands are wide on purpose. An exciting idea feels bigger than it is and a dull one feels smaller, until users tell you otherwise. The field notes on sitcom ideas and schlep blindness were just added below.</p>';
      return h;
    }
    function renderTeam() {
      var h = head('The application · 2 of 4', 'Pick the team.', 'Who you start with decides how much you can do in a week, and what can go wrong between you.');
      ['solo', 'friend', 'matched'].forEach(function (m) {
        var T = TEAMS[m];
        h += '<button type="button" class="lk-opt" data-act="team" data-m="' + m + '"><span class="lk-opt-l">' + E(T.l) + '</span><span class="lk-opt-s">' + E(T.s) + '</span><span class="lk-opt-why">' + E(T.facts) + '</span></button>';
      });
      return h;
    }
    function renderVest() {
      var solo = S.mode === 'solo';
      var h = head('The application · 3 of 4', 'One piece of paperwork.', 'Founder shares can ' + tm('vest', 'vest') + ' over four years with a one-year cliff, so anyone who leaves early doesn’t leave with half the company. It protects the founders who stay.');
      h += '<p class="lk-lede">Founder shares on a four-year schedule with a one-year cliff?</p>';
      h += '<button type="button" class="lk-opt" data-act="vest" data-v="1"><span class="lk-opt-l">Yes, vest everyone.</span><span class="lk-opt-s">A quarter vests at the first anniversary, then 1/48 a month. Unvested shares come back if someone leaves.</span></button>';
      h += '<button type="button" class="lk-opt" data-act="vest" data-v="0"><span class="lk-opt-l">' + (solo ? 'Skip it; it’s just me.' : 'Skip it; we trust each other.') + '</span><span class="lk-opt-s">No schedule. Every share is earned on day one.</span></button>';
      return h;
    }
    function renderIV() {
      var q = S.iv.picks.length, Q = IVQ[q], ord3 = S.pd.ivo[q];
      var h = head('The interview · Question ' + (q + 1) + ' of 3', '“' + E(Q.q) + '”', 'A short video call with YC partners. They interrupt; it isn’t personal.');
      ord3.forEach(function (i) { h += '<button type="button" class="lk-opt" data-act="iv" data-pick="' + i + '"><span class="lk-opt-l">“' + E(Q.a[i](S.idea, S.team)) + '”</span></button>'; });
      return h;
    }
    function renderIVRes() {
      var lines = ['We’re in.'], miss = -1, p = S.iv.picks;
      for (var i = 0; i < 3; i++) if (p[i] !== 0) { miss = i; break; }
      lines.push(miss < 0 ? 'Clear, specific, and a little unreasonable. The last part is the part that matters.' : IVQ[miss].miss[p[miss]]);
      if (S.orig === 'RECAP' && p[1] === 0) lines.push('Your best answer about users was a survey of intentions. Intentions don’t churn; people do.');
      else if (S.orig === 'PACK' && p[1] === 0) lines.push('Hundreds of dog owners is a neighborhood, not a user.');
      lines.push('What we look for most is determination. You’ll find out if you have it in about six weeks.');
      var h = head('The call back', 'You’re in.', 'The interview scored ' + S.iv.score + ' of 3 on clarity. In this machine everyone gets in; the feedback is what counts, and clarity follows you to Demo Day.');
      h += '<blockquote class="yb-quote"><p class="lk-k">Wren Halloway, group partner</p>' + lines.map(function (l) { return '<p>' + E(l) + '</p>'; }).join('') + '</blockquote>';
      h += '<div class="btnrow">' + btn('ok', 'See the offer', 'ebtn') + '</div>';
      return h;
    }
    function renderDeal() {
      var h = head('The application · 4 of 4', 'The offer.', 'Y Combinator offers $500,000: $125,000 on a post-money ' + tm('safe', 'SAFE') + ' for 7%, and $375,000 on an uncapped SAFE with a most-favored-nation clause (' + tm('mfn', 'MFN') + '). No fees.');
      h += '<p class="yb-eq"><span class="lk-k">The equity equation</span>Paul Graham’s rule: give up n% only if it multiplies your outcome by more than 1 ÷ (1 − n). For 7%, that is 1.075: an improvement of more than 7.5%. The 7% is fixed; in price terms it values the company at $125,000 ÷ 7% = about $1.79M post-money.</p>';
      h += '<div class="lk-card yb-dealcap"><p class="lk-k">The cap table after you sign</p>' + capHTML(capTable(S), true) + '</div>';
      h += '<div class="btnrow">' + btn('deal', 'Sign and start the batch', 'ebtn') + '</div>';
      return h;
    }

    /* the weekly planner */
    function curPlan() {
      if (!ui.plan || ui.plan.w !== S.week) ui.plan = { w: S.week, p: emptyPlan() };
      return ui.plan.p;
    }
    function renderPlan() {
      var w = S.week, raiseWk = w > 12, P = curPlan(), total = blocksAt(S, w), locked = lockedAt(S, w), free = freeAt(S, w), used = planCost(P), L = locksAt(S, w), h = '';
      var kick = raiseWk ? 'The raise · Week ' + (w - 12) + ' of 4' : 'The batch · Week ' + w + ' of 12';
      var lede = w === 1 ? 'Kickoff is three days of founders who all seem further along than you. They aren’t. You have ' + total + ' blocks. Nobody has used your product, because there isn’t one.' :
        raiseWk ? 'Investors have your number. Each block of raising is about four meetings, and more if raising gets at least half your week.' :
        w === 12 ? 'The last week of the batch. Tomorrow you get one minute to say what you built and how fast it’s growing.' : 'Each founder has two big blocks a week; everything else is email.';
      h += head(kick, 'Plan week ' + w + ' <span class="yb-hsub">' + total + ' ' + F.plural(total, 'block') + (locked ? ', ' + locked + ' already spoken for' : '') + '</span>', lede);
      if (raiseWk) h += roundPanel();
      if (S.rx && S.rx.w === w) h += '<p class="yb-rx"><span class="lk-chip lk-chip--foil">Wren’s advice</span>' + E(ANAME[S.rx.a]) + ' this week: +25% on those blocks.</p>';
      h += '<div class="yb-tokens" aria-hidden="true">';
      for (var i = 0; i < M.max(total, locked); i++) h += '<i class="yb-tok' + (i < locked ? ' is-lock' : i < locked + used ? ' is-on' : '') + '"></i>';
      h += '</div><p class="yb-tokl lk-num">' + (free - used) + ' of ' + free + ' free ' + F.plural(free, 'block') + ' left' + (free - used > 0 && used > 0 ? '; unplanned blocks go to email' : '') + '</p>';
      if (L.length) h += '<ul class="yb-locks">' + L.map(function (l) { return '<li><span class="lk-chip">' + (l.extra ? 'Extra' : 'Locked') + '</span>' + E(l.why) + ': ' + l.n + ' ' + F.plural(l.n, 'block') + (l.as === 'build' || l.as === 'build0' ? ' of building' : '') + '</li>'; }).join('') + '</ul>';
      h += '<div class="yb-rows">';
      ACTS.forEach(function (a) {
        if (a.id === 'hard' && !duo(S)) return;
        var wy = why(S, a.id, P), n = P[a.id], cost = a.cost || 1, canAdd = !wy && used + cost <= free && (!a.max || n < a.max);
        h += '<div class="yb-row' + (n ? ' is-on' : '') + (wy ? ' is-off' : '') + '" data-row="' + a.id + '"><div class="yb-rowt"><span class="yb-rowl">' + E(a.l) + (a.id === 'raise' && raiseWk ? ' <span class="yb-mode">' + E(modeWord(P, total)) + '</span>' : '') + '</span><span class="yb-rowh">' + E(wy || a.h) + '</span></div>' +
          '<div class="lk-step"><button type="button" data-step="-1" data-a="' + a.id + '" aria-label="Remove one ' + E(a.l) + ' block"' + (n ? '' : ' disabled') + '>−</button><output aria-label="' + E(a.l) + ' blocks">' + n + '</output><button type="button" data-step="1" data-a="' + a.id + '" aria-label="Add one ' + E(a.l) + ' block"' + (canAdd ? '' : ' disabled') + '>+</button></div></div>';
      });
      h += '</div>';
      h += '<div class="btnrow">' + btn('run', 'Run the week', 'ebtn') + (S.lastPlan ? btn('same', 'Same plan again') : '') + (w <= 8 && pivotTargets(S).length ? btn('pivotopen', ui.pivot ? 'Keep this idea' : 'Pivot', 'ebtn2', ' aria-expanded="' + (ui.pivot ? 'true' : 'false') + '"') : '') + '</div>';
      if (ui.pivot && w <= 8) {
        h += '<div class="yb-pivot lk-card"><p class="lk-kicker">Pivot · uses the whole week</p><p>You keep a fifth of what you learned and built (half, for an idea your users asked for). ' +
          (duo(S) ? 'Morale drops, and so does ' + E(cof(S)) + '’s patience, unless you’re aligned.' : 'Morale drops.') + '</p>' +
          pivotTargets(S).map(function (id) { var I = resolveIdea(S, id); return '<button type="button" class="lk-opt" data-act="pivot" data-to="' + id + '"><span class="lk-opt-l">Pivot to ' + E(I.name) + '</span><span class="lk-opt-s">' + E(I.sent) + '</span></button>'; }).join('') + '</div>';
      }
      return h;
    }
    function modeWord(P, total) { var m = meetMode(P, total); return !P.raise ? '' : m > 1 ? 'Fundraising mode · ×1.25' : m < 1 ? 'Dabbling · ×0.6' : ''; }
    function roundPanel() {
      var R = S.raise, d = S.dd, ct = capTable(S), met = 0, soft = R.offers.length, rr = rnd();
      for (var k in R.met) if (R.met[k]) met++;
      var h = '<div class="lk-card yb-round"><p class="lk-kicker">The round</p>';
      h += '<p class="yb-rline">Target <b class="lk-num">' + amtM(rr.target) + '</b> · Demo Day read <b class="lk-num">' + capM(d.V) + '</b> · ' + d.leads + ' investors asked to meet</p>';
      h += '<div class="yb-f"><span class="lk-k" id="yb-tgt-l">Target</span><div class="lk-seg" data-seg="target" aria-labelledby="yb-tgt-l">' + [1e6, 1.5e6, 2e6, 3e6].map(function (v) { return '<button data-v="' + v + '" aria-checked="' + (rr.target === v) + '">' + amtM(v) + '</button>'; }).join('') + '</div></div>';
      h += '<div class="lk-field"><label for="yb-rcap">Post-money cap for new meetings</label><output class="lk-range-out" id="yb-rcapo">' + capM(rr.cap) + '</output>' +
        '<input type="range" id="yb-rcap" data-range="rcap" min="4" max="60" step="1" value="' + rr.cap + '" aria-valuetext="' + E(capM(rr.cap) + ' post-money cap') + '"></div>';
      h += '<div class="yb-f"><span class="lk-k" id="yb-ord-l">Who you meet first</span><div class="lk-seg" data-seg="order" aria-labelledby="yb-ord-l"><button data-v="ev" aria-checked="' + (rr.order === 'ev') + '">Biggest expected checks</button><button data-v="friendly" aria-checked="' + (rr.order === 'friendly') + '">Friendliest first</button></div></div>';
      h += '<div class="yb-pipe"><span><b class="lk-num">' + (d.leads - met) + '</b> to meet</span><span><b class="lk-num">' + met + '</b> met</span><span><b class="lk-num">' + soft + '</b> soft ' + F.plural(soft, 'yes', 'yeses') + '</span><span><b class="lk-num">' + R.n + '</b> signed, ' + money(R.signed) + '</span></div>';
      h += '<p class="yb-capnote">' + (R.full ? 'The round is full: you raised ' + FULL + '× your target. ' : 'The round fills at ' + FULL + '× your target. ') + 'Diligence reads your retention cohorts: ' + (S.fit >= 55 ? 'they look strong, so nothing is discounted.' : S.fit >= 35 ? 'they look middling, and it costs you some yeses.' : 'they look weak, and it costs you a lot of yeses.') +
        ' Founders own ' + F.pct(ct.founders, 1) + ' after the SAFEs signed so far.</p>';
      h += '<div class="btnrow">' + btn('close', 'Close the round now') + '</div></div>';
      return h;
    }

    function renderReport() {
      var r = S.report, w = r.w, raiseWk = w > 12, I = S.idea, h = '';
      var nh = M.round(r.r.hands), nt = M.round(r.r.trials), nw = M.round(r.r.wom), tot = nh + nt + nw, lost = M.round(r.r.lost);
      var line = tot ? tot + ' new ' + unitW(S, tot) + ': ' + [nh ? nh + ' by hand' : '', nt ? nt + ' from trials' : '', nw ? nw + ' by word of mouth' : ''].filter(Boolean).join(', ') + '.' : 'Nobody new signed up this week.';
      if (lost) line += ' ' + lost + ' churned.';
      if (r.pivot) line = 'You spent the week pivoting from ' + r.pivot.from + ' to ' + r.pivot.to + '. ' + line;
      h += head(raiseWk ? 'The raise · Week ' + (w - 12) + ' of 4' : 'The batch · Week ' + w + ' of 12', raiseWk ? 'Raise week ' + (w - 12) : 'Week ' + w, E(line));
      h += '<div class="yb-deltas">' +
        '<span><span class="lk-k">' + tm('mrr', 'MRR') + '</span><b class="lk-num">' + money(S.MRR) + '</b></span>' +
        '<span><span class="lk-k">' + tm('wg', 'Weekly growth') + '</span><b class="lk-num' + (r.g == null ? '' : r.g >= .05 ? ' lk-gain' : r.g < .01 ? ' lk-loss' : '') + '">' + (r.g == null ? 'too early' : pctS(r.g)) + '</b>' + (r.g == null ? '' : '<span class="yb-dw">' + gWord(r.g) + '</span>') + '</span>' +
        '<span><span class="lk-k">Insight</span><b class="lk-num">' + M.round(S.ins) + '</b></span>' +
        '<span><span class="lk-k">Product</span><b>' + E(prodWord(S.Q)) + '</b></span></div>';
      if (S.launched) h += '<p class="yb-fitw"><span class="lk-k">What users do</span>' + E(fitWord(S.fit)) + ' <span class="yb-churn">' + tm('churn', 'Churn') + ' this week: ' + F.pct(r.r.churn, 1) + '.</span></p>';
      if (r.trust) h += '<p class="yb-warnline">A member noticed the invented neighbors. Trust, word of mouth and morale all took the hit.</p>';
      if (r.oh) h += '<div class="lk-card yb-oh"><p class="lk-kicker">Wren · Office hours</p><p class="yb-ohq">' + E(r.oh.d) + '</p>' +
        (r.oh.rx ? '<p><span class="lk-chip lk-chip--foil">Next week: ' + E(ANAME[r.oh.rx]) + ' · +25%</span></p>' : '') + '<p class="yb-ohs">' + E(r.oh.survey) + '</p></div>';
      if (r.goh) h += '<div class="lk-card yb-goh"><p class="lk-kicker">Group office hours</p><p>Seven companies, ten minutes each, one question: what did you do last week, and did it work? You’re <b>' + ord(r.goh.rank) + ' of 7</b> on four-week growth.</p><p class="yb-ohq">“' + E(r.goh.line) + '”</p></div>';
      if (r.meet) h += meetHTML(r.meet);
      if (raiseWk && S.raise.offers.length) h += offersHTML();
      if (S.ev) h += eventHTML();
      var nx = raiseWk ? (w < 16 ? 'On to raise week ' + (w - 11) : 'Close the round') : w < 12 ? 'Plan week ' + (w + 1) : 'On to Demo Day';
      if (S.dead) nx = 'See how it ends';
      h += '<div class="btnrow">' + btn('next', nx, 'ebtn', S.ev && !S.ev.done ? ' disabled' : '') + (raiseWk && !S.dead && w < 16 ? btn('close', 'Close the round now') : '') + '</div>';
      if (S.ev && !S.ev.done) h += '<p class="yb-small">Decide the card above first.</p>';
      return h;
    }
    function meetHTML(m) {
      if (!m.met) return '<p class="yb-meet">' + (m.full ? 'The round is full, so no more meetings. Close it when you’re ready.' : m.dry ? 'Nobody left to meet: every investor who asked has had the meeting.' : 'No investor meetings this week.') + '</p>';
      return '<p class="yb-meet"><span class="lk-k">Meetings</span>You met ' + m.met + ' ' + F.plural(m.met, 'investor') + (m.mode > 1 ? ' in fundraising mode' : m.mode < 1 ? ', dabbling' : '') + ': ' +
        m.yes + ' ' + F.plural(m.yes, 'yes', 'yeses') + ', ' + m.counter + ' ' + F.plural(m.counter, 'counter') + ', ' + m.no + ' ' + F.plural(m.no, 'pass', 'passes') + '.</p>';
    }
    function offersHTML() {
      var R = S.raise, h = '<div class="yb-offers"><p class="lk-kicker">Soft yeses · anything short of a signed SAFE is a no until it isn’t</p>';
      R.offers.forEach(function (o, k) {
        var v = S.pd.inv[o.i], pct = o.amt / 1e6 / o.cap;
        h += '<div class="lk-card yb-offer"><p class="yb-oname">' + E(v.name) + '</p>';
        if (o.kind === 'yes') h += '<p>In for ' + money(o.amt) + ' at a ' + capM(o.cap) + ' cap: ' + F.pct(pct, 2) + ' of the company.</p><div class="btnrow">' + btn('offer', 'Send the SAFE', 'ebtn', ' data-k="' + k + '" data-c="sign"') + btn('offer', 'Pass', 'ebtn2', ' data-k="' + k + '" data-c="pass"') + '</div>';
        else if (o.kind === 'side') h += '<p>In for ' + money(o.amt) + ' at a ' + capM(o.cap) + ' cap (' + F.pct(pct, 2) + '), and wants a ' + tm('prorata', 'pro rata') + ' side letter.</p><div class="btnrow">' + btn('offer', 'Accept the side letter', 'ebtn', ' data-k="' + k + '" data-c="sign"') + btn('offer', 'Accept, no side letter', 'ebtn2', ' data-k="' + k + '" data-c="noside"') + btn('offer', 'Pass', 'ebtn2', ' data-k="' + k + '" data-c="pass"') + '</div>';
        else h += '<p>“We’re in at ' + capM(o.cap) + '.” ' + money(o.amt) + ', which would be ' + F.pct(pct, 2) + '.</p><div class="btnrow">' + btn('offer', 'Accept at ' + capM(o.cap), 'ebtn', ' data-k="' + k + '" data-c="accept"') + btn('offer', 'Decline', 'ebtn2', ' data-k="' + k + '" data-c="decline"') + '</div>';
        h += '</div>';
      });
      if (R.offers.length > 1) h += '<div class="btnrow">' + btn('signall', 'Sign every one') + '</div>';
      return h + '<p class="yb-capnote">Unsigned yeses can go quiet by next week.</p></div>';
    }
    function eventHTML() {
      var ev = S.ev, h = '<div class="lk-card lk-card--event yb-event"><p class="lk-kicker">' + (S.turn >= 0 ? 'A card for months ' + (5 + 2 * S.turn) + ' to ' + (6 + 2 * S.turn) : 'A card for ' + (S.week > 12 ? 'raise week ' + (S.week - 12) : 'week ' + S.week)) + '</p><h5 class="yb-evt">' + E(ev.title) + '</h5><p>' + E(ev.text) + '</p>' + (ev.pre ? '<p class="yb-pre lk-num">' + E(ev.pre) + '</p>' : '');
      if (ev.done) h += '<p class="yb-out" tabindex="-1"><span class="lk-k">You chose: ' + E(ev.label) + '</span>' + E(ev.out) + '</p>';
      else h += '<div class="yb-choices">' + choicesOf(S).map(function (c, i) { return '<button type="button" class="lk-opt" data-act="ev" data-c="' + i + '"><span class="lk-opt-l">' + E(c.l) + '</span>' + (c.s ? '<span class="lk-opt-s">' + E(c.s) + '</span>' : '') + '</button>'; }).join('') + '</div>';
      return h + '</div>';
    }

    /* Demo Day */
    function ddPicks() { if (!ui.dd) ui.dd = { sent: null, metric: null, amt: 1.5e6, cap: null }; return ui.dd; }
    function renderDD() {
      var d = ddPicks(), vd = lastVD(S), gs = g4(S, 12, 2000), sc = ddScore(S, d.sent == null ? 0 : d.sent), I = S.idea, h = '';
      h += head('Demo Day', 'Your minute.', 'A room of investors YC selected, some press, and one minute. Say what it is, show the number, and ask. Then four weeks to turn the room into signed SAFEs, or skip the raise and keep the company.');
      h += '<fieldset class="yb-fs"><legend class="lk-k">1 · The sentence</legend><div class="yb-picks" role="group" aria-label="The sentence">' + SENT.map(function (f, i) {
        return '<button type="button" class="lk-opt" data-dd="sent" data-v="' + i + '" aria-pressed="' + (d.sent === i) + '"><span class="lk-opt-l">“' + E(f(S)) + '”</span><span class="lk-opt-why">' + ['Specific', 'Vision', 'Buzzwords'][i] + '</span></button>';
      }).join('') + '</div></fieldset>';
      var mets = [];
      if (S.MRR >= 1) mets.push(['true', 'MRR ' + money(S.MRR) + (gs.g != null ? ', growing ' + F.pct(gs.g, 0) + ' a week' : ''), 'The true number']);
      else mets.push(['true', 'We launched' + (S.firstLaunch ? ' in week ' + S.firstLaunch : ' this week') + '; ' + units(S, S.N) + ' so far', 'The true number']);
      mets.push(['vanity', F.n(M.round(S.signups)) + ' people have signed up', 'Vanity: cumulative signups']);
      if (vd != null) mets.push(['pmf', vd + '% of users would be very disappointed without us', 'The survey']);
      h += '<fieldset class="yb-fs"><legend class="lk-k">2 · The number</legend><div class="yb-picks" role="group" aria-label="The number">' + mets.map(function (m) {
        return '<button type="button" class="lk-opt" data-dd="metric" data-v="' + m[0] + '" aria-pressed="' + (d.metric === m[0]) + '"><span class="lk-opt-l">“' + E(m[1]) + '”</span><span class="lk-opt-why">' + E(m[2]) + '</span></button>';
      }).join('') + '</div></fieldset>';
      var ready = d.sent != null && d.metric != null;
      if (ready && d.cap == null) d.cap = M.round(sc.V);
      h += '<fieldset class="yb-fs"><legend class="lk-k">3 · The ask</legend>';
      h += '<div class="lk-seg" data-seg="amt" aria-label="Amount">' + [1e6, 1.5e6, 2e6, 3e6].map(function (v) { return '<button data-v="' + v + '" aria-checked="' + (d.amt === v) + '">' + amtM(v) + '</button>'; }).join('') + '</div>';
      if (ready) {
        h += '<p class="yb-wren"><span class="lk-chip lk-chip--foil">Wren’s read</span>' + E(wrenRead(sc)) + '</p>';
        h += '<div class="lk-field"><label for="yb-ddcap">' + tm('cap', 'Post-money valuation cap') + '</label><output class="lk-range-out" id="yb-ddcapo">' + capM(d.cap) + '</output><input type="range" id="yb-ddcap" data-range="ddcap" min="4" max="60" step="1" value="' + d.cap + '" aria-valuetext="' + E(capM(d.cap) + ' post-money cap') + '"></div>';
        h += '<p class="yb-preview lk-num">' + ddPreview() + '</p>';
      } else h += '<p class="yb-small">Pick the sentence and the number; Wren will tell you how the room is likely to price you.</p>';
      h += '</fieldset>';
      h += '<div class="btnrow">' + btn('dd', 'Walk on stage', 'ebtn', ready ? '' : ' disabled') + btn('skip', 'Skip the raise') + '</div>';
      h += '<p class="yb-small">Skipping keeps every point of equity and gives the four raise weeks to the company, on your last week’s plan. It also means YC’s $375K keeps floating.</p>';
      return h;
    }
    function wrenRead(sc) {
      var dg = dilig(S);
      return 'The room will price you near ' + capM(sc.V) + '. ' + sc.leads + ' investors will ask for a meeting.' +
        (dg < .75 ? ' Diligence will read your cohorts next week. They look weak, so expect fewer yeses at that cap.' : dg < .95 ? ' Your cohorts will get questions in diligence.' : '');
    }
    function ddPreview() {
      var d = ddPicks(), mc = minCap(S), low = mc == null ? d.cap : M.min(mc, d.cap), other = sum(S.safes.map(function (s) { return s.amt / 1e6 / s.cap; }));
      var sold = d.amt / 1e6 / d.cap, mfn = .375 / low, Ssum = .07 + mfn + other + sold;
      return 'Sold if you fill it: ' + F.pct(sold, 1) + '. YC’s $375K at your lowest cap: ' + F.pct(mfn, 2) + '. Founders after these SAFEs: ' + F.pct((1 - sum(S.hires.map(function (x) { return x.opt; }))) * (1 - Ssum), 1) + '.';
    }
    function renderClosed() {
      var R = S.raise, sm = R.summary, h = '';
      var mfnTxt = sm.min != null ? 'Lowest cap ' + capM(sm.min) + ', so YC’s $375K converts at ' + F.pct(sm.mfn, 2) + '.' : 'YC’s $375K still floats to the priced round.';
      h += head('The raise', 'The round is closed.', sm.raised ? 'Round closed: ' + money(sm.raised) + ' from ' + sm.n + ' ' + F.plural(sm.n, 'investor') + ' on ' + sm.caps + ' ' + F.plural(sm.caps, 'cap') + '.' +
        (sm.allCaps > sm.caps ? ' Your SAFEs now sit on ' + sm.allCaps + ' caps.' : '') + ' ' + mfnTxt + ' Founders own ' + F.pct(sm.founders, 1) + ' after the SAFEs.' :
        'No new checks signed. ' + mfnTxt + ' The company runs on the YC money' + (S.safes.length ? ', the early check' : '') + ' and its revenue.');
      if (R.flaked || R.walked) h += '<p class="yb-small">' + (R.flaked ? R.flaked + ' soft ' + F.plural(R.flaked, 'yes', 'yeses') + ' went quiet' : '') + (R.flaked && R.walked ? '; ' : '') + (R.walked ? R.walked + ' ' + F.plural(R.walked, 'investor') + ' walked when you declined the side letter' : '') + '.</p>';
      h += '<div class="lk-card"><p class="lk-k">The cap table now</p>' + capHTML(capTable(S), true) + '</div>';
      h += '<div class="btnrow">' + btn('next', 'Into the year after', 'ebtn') + '</div>';
      return h;
    }

    /* the year after */
    function turnPlan() {
      if (!ui.turn || ui.turn.t !== S.turn) ui.turn = { t: S.turn, p: { hire: 0, spend: S.a3.spend, focus: S.a3.focus, price: 0, offsite: false, sa: false } };
      return ui.turn.p;
    }
    function renderTurn() {
      var p = turnPlan(), t = S.turn, al = aliveProj(S), nr = al.alive ? null : needR(S), h = '', open = saOpen(S), ev = open ? saEval(S) : null;
      h += head('The year after · Turn ' + (t + 1) + ' of 7', 'Months ' + (5 + 2 * t) + ' to ' + (6 + 2 * t) + '.',
        t === 0 ? 'The batch is over, the money is in the bank, and nobody schedules your weeks anymore. Every two months: who to hire, what to spend, what to focus on. Watch the line that says whether you’re ' + tm('alive', 'default alive') + '.' : 'Two months at a time now. The instruments carry on; the decisions get bigger.');
      h += '<p class="yb-verdict ' + (al.alive ? 'is-alive' : 'is-dead') + '">' + verdictHTML(al, nr) + '</p>';
      if (al.r > .2 && t <= 1) h += '<p class="lk-coach">That rate is batch speed: launches and hand-holding from a tiny base. It rarely survives the batch, and the next two months will show what’s real. The calculator is only as good as the growth you feed it.</p>';
      h += '<div class="yb-tp">';
      h += '<div class="yb-f"><span class="lk-k">Hiring</span><div class="yb-hire"><div class="lk-step"><button type="button" data-hire="-1" aria-label="One fewer hire"' + (p.hire <= (S.hires.length ? -1 : 0) ? ' disabled' : '') + '>−</button><output aria-label="Hiring change">' + (p.hire > 0 ? '+' : p.hire < 0 ? F.minus : '') + M.abs(p.hire) + '</output><button type="button" data-hire="1" aria-label="One more hire"' + (p.hire >= 3 ? ' disabled' : '') + '>+</button></div>' +
        '<span class="yb-rowh">' + (p.hire > 0 ? 'Each hire: ' + money(HIRE) + ' a month, productive next turn, 1% in options.' : p.hire < 0 ? 'Let one go: a month of severance, and morale takes it.' : S.hires.length + ' on the team besides the founders.') + '</span></div></div>';
      h += '<div class="yb-f"><span class="lk-k" id="yb-sp-l">Growth spend</span><div class="lk-seg" data-seg="spend" aria-labelledby="yb-sp-l">' + [0, 10000, 25000].map(function (v) { return '<button data-v="' + v + '" aria-checked="' + (p.spend === v) + '">' + (v ? kmo(v) : 'None') + '</button>'; }).join('') + '</div></div>';
      h += '<div class="yb-f"><span class="lk-k" id="yb-fo-l">Focus</span><div class="lk-seg" data-seg="focus" aria-labelledby="yb-fo-l">' + [['product', 'Product'], ['balanced', 'Balanced'], ['growth', 'Growth'], ['efficiency', 'Efficiency']].map(function (f) { return '<button data-v="' + f[0] + '" aria-checked="' + (p.focus === f[0]) + '">' + f[1] + '</button>'; }).join('') + '</div>' +
        '<span class="yb-rowh" data-hint="focus">' + E({ product: 'Most of the team on fit. It pays most while fit has room to grow, and less as it nears what this market allows.', balanced: 'Half on fit, half on getting customers.', growth: 'Most hands on getting customers: referrals, onboarding, a sales motion. It amplifies fit users already feel; below that, it mostly lets fit slip.', efficiency: 'Burn down 15%, with a little less of everything. The lever for when cash, not growth, is the constraint.' }[p.focus]) + '</span></div>';
      h += '<div class="yb-f"><span class="lk-k" id="yb-pr-l">Price, for everyone</span><div class="lk-seg" data-seg="price" aria-labelledby="yb-pr-l"><button data-v="-1" aria-checked="' + (p.price === -1) + '">' + F.minus + '20%</button><button data-v="0" aria-checked="' + (p.price === 0) + '">Hold</button><button data-v="1" aria-checked="' + (p.price === 1) + '">+20%</button></div>' +
        '<span class="yb-rowh" data-hint="price">' + E(priceHint(p.price)) + '</span></div>';
      if (duo(S)) h += '<label class="yb-check"><input type="checkbox" data-chk="offsite"' + (p.offsite ? ' checked' : '') + '> <span>Founders’ offsite: $8,000 and a little capacity; friction down 25, morale up 15.</span></label>';
      if (S.A) h += '<p class="yb-small">Series A closed with ' + E(S.A.fund) + ' at ' + capM(S.A.Vpre) + ' pre-money.</p>';
      else if (open) h += '<label class="yb-check"><input type="checkbox" data-chk="sa"' + (p.sa ? ' checked' : '') + '> <span>Run a Series A process this turn. It takes 40% of the team’s time. Readiness: <b>' + (ev.p >= .8 ? 'strong' : ev.p >= .6 ? 'good' : ev.p >= .4 ? 'even odds' : ev.p >= .2 ? 'long odds' : 'very long odds') + '</b> (' + F.prob(ev.p) + '), at about ' + capM(ev.Vpre) + ' pre-money at today’s numbers; two more months of growth, and any price change, will move it.</span></label>' + saParts(ev);
      else h += '<p class="yb-small">Series A: ' + (t < 2 ? 'opens from months 9 to 10' : S.sa.length && t < S.sa[S.sa.length - 1].t + 2 ? 'you can go back to investors after one more turn' : 'needs ' + tm('arr', 'ARR') + ' of $500K or more; you’re at ' + money(12 * S.MRR)) + '. The bar is this machine’s rule of thumb, not a market statistic.</p>';
      h += '</div><div class="btnrow">' + btn('turn', 'Run two months', 'ebtn') + '</div>';
      return h;
    }
    /* the default-alive sentence, shared by the plan and the debrief: profitable now, profitable later, never, or out of cash */
    function rateTxt(al) {
      var raw = cmgr(S, 3);
      return F.pct(al.r, 1) + ' a month' + (raw > .4 ? ' (your ' + F.pct(raw, 1) + ' is capped at 40% for the projection)' : raw < -.2 ? ' (your ' + F.pct(raw, 1) + ' is floored at −20% for the projection)' : '');
    }
    function verdictHTML(al, nr) {
      if (al.now) return '<b>Default alive.</b> Revenue already covers the burn, with ' + money(S.cash) + ' in the bank.';
      if (al.alive) return '<b>Default alive.</b> At ' + rateTxt(al) + ' you reach profitability in ' + al.t + ' ' + F.plural(al.t, 'month') + ' with ' + money(M.max(0, al.cushion)) + ' to spare.';
      var fix = nr != null ? 'You’d need ' + F.pct(nr, 1) + ' a month, or a smaller burn.' : 'No growth rate rescues this burn; it has to come down.';
      if (al.never) { var rw = runwayMo(S); return '<b>Default dead.</b> At ' + rateTxt(al) + ' revenue never catches the burn' + (rw != null ? ', though the cash lasts ' + runwayW(rw) : '') + '. ' + fix; }
      return '<b>Default dead.</b> At ' + rateTxt(al) + ' the cash runs out in ' + al.t + ' ' + F.plural(al.t, 'month') + '. ' + fix;
    }
    function priceHint(dir) {
      var sh = priceShock(S, dir), I = S.idea, pl = I.unit[1];
      if (dir > 0) return 'New price ' + money(S.arpaNew * 1.2) + ' a month. ' + (sh.lost < .01 ? 'Almost nobody leaves at once' : 'Expect about ' + F.pct(sh.lost, 0) + ' of your ' + pl + ' to leave at once') +
        ', so revenue steps ' + (sh.step >= 0 ? 'up' : 'down') + ' about ' + F.pct(M.abs(sh.step), 0) + '.' + (sh.repeat ? ' A second raise this soon drives out more of them.' : '') +
        (sh.over > .005 ? ' That is more than most of them will pay, so churn stays higher and referrals slow.' : '');
      if (dir < 0) return 'New price ' + money(S.arpaNew * .8) + ' a month. Revenue steps down about ' + F.pct(M.abs(sh.step), 0) + '; a few lapsed ' + pl + ' come back, and new ones convert more easily.';
      return 'Today: ' + money(S.arpaNew) + ' a month per ' + I.unit[0] + '. A price change moves revenue once; growth here is measured at constant prices.' + (sh.over > .005 ? ' You are above what most customers will pay, and churn shows it.' : '');
    }
    function saParts(ev) {
      var L = { arr: 'ARR', growth: 'Growth', heat: 'Market', alive: 'Default alive', split: 'Split', solo: 'Vesting', fit: 'Fit', shop: 'Shopped before', step: 'Step-up from your cap' };
      return '<ul class="yb-parts">' + ev.parts.filter(function (x) { return M.abs(x[1]) > .005; }).map(function (x) { return '<li><span>' + L[x[0]] + '</span><b class="lk-num ' + (x[1] > 0 ? 'lk-gain' : 'lk-loss') + '">' + F.signed(x[1], 2) + '</b></li>'; }).join('') + '</ul>';
    }
    function renderTurnReport() {
      var r = S.report, t = r.t, h = '', m0 = 5 + 2 * t;
      h += head('The year after · Turn ' + (t + 1) + ' of 7', 'Months ' + m0 + ' to ' + (m0 + 1), '');
      h += '<div class="lk-scroll"><table class="lk-table yb-months"><thead><tr><th>Month</th><th>' + tm('mrr', 'MRR') + '</th><th>Growth</th><th>' + tm('burn', 'Burn') + '</th><th>Cash</th></tr></thead><tbody>';
      for (var m = m0; m <= m0 + 1; m++) {
        var mo = S.mon[m]; if (!mo) continue;
        var pv = S.mon[m - 1], g = pv && pv.mrr > 0 ? mo.mrr / pv.mrr - 1 : null;
        h += '<tr><td>Month ' + m + '</td><td>' + money(mo.mrr) + '</td><td>' + (g != null ? pctS(g) : '–') + '</td><td>' + money(mo.burn) + '</td><td>' + money(mo.cash) + '</td></tr>';
      }
      h += '</tbody></table></div>';
      if (r.price && r.price.dir) h += '<p class="yb-small">' + (r.price.dir > 0 ? 'Price up 20% for everyone: ' + units(S, r.priceN) + ' left at once, and revenue stepped ' + (r.price.step >= 0 ? 'up ' : 'down ') + F.pct(M.abs(r.price.step), 0) + '.' :
        'Price down 20% for everyone: ' + units(S, r.priceN) + ' came back, and revenue stepped down ' + F.pct(M.abs(r.price.step), 0) + '.') + ' The ' + tm('cmgr', 'CMGR') + ' below is measured at constant prices, so the step is not counted as growth.</p>';
      if (S.dead && S.cash < 0) h += '<p class="yb-verdict is-dead"><b>Out of cash.</b> The company can’t make payroll.</p>';
      else h += '<p class="yb-verdict ' + (r.alive.alive ? 'is-alive' : 'is-dead') + '"><b>' + (r.alive.alive ? 'Default alive.' : 'Default dead.') + '</b> Three-month ' + tm('cmgr', 'CMGR') + ': ' + pctS(r.m3) + '. ' + E(fitWord(S.fit)) + '</p>';
      if (r.sa) {
        h += '<div class="lk-card lk-card--event yb-event"><p class="lk-kicker">Series A</p>';
        if (r.sa.ok && S.ts) {
          ui.termA = ui.termA || .2;
          h += '<h5 class="yb-evt">' + E(S.ts.fund) + ', term sheet: ' + capM(S.ts.Vpre) + ' pre-money.</h5><p>How much of the company do the new investors get? The ' + tm('pool', 'option pool') + ' is topped up to 10% after the round either way, and every SAFE converts.</p>' +
            '<div class="lk-seg" data-seg="termA" aria-label="New investors’ share">' + [.15, .2, .25].map(function (a) { return '<button data-v="' + a + '" aria-checked="' + (ui.termA === a) + '">' + F.pct(a, 0) + '</button>'; }).join('') + '</div>' +
            '<p class="yb-preview lk-num">' + termPreview() + '</p><div class="btnrow">' + btn('term', 'Sign the term sheet', 'ebtn') + btn('decline', 'Decline') + '</div>';
        } else if (r.sa.ok) h += '<p>' + (S.A ? 'Signed. ' + E(S.A.fund) + ' leads your Series A.' : 'You declined the term sheet.') + '</p>';
        else h += '<h5 class="yb-evt">No lead this time.</h5><p>The feedback: ' + E(r.sa.why) + ' You can go back after one more turn, and the second time investors will know you shopped it.</p>';
        h += '</div>';
      }
      if (S.ev) h += eventHTML();
      var blocked = (S.ev && !S.ev.done) || S.ts;
      h += '<div class="btnrow">' + btn('next', S.dead || t >= 6 ? 'See how it ends' : 'Plan months ' + (m0 + 2) + ' to ' + (m0 + 3), 'ebtn', blocked ? ' disabled' : '') + '</div>';
      if (blocked) h += '<p class="yb-small">' + (S.ts ? 'Sign or decline the term sheet first.' : 'Decide the card above first.') + '</p>';
      return h;
    }
    function termPreview() {
      var A = ui.termA || .2, ct = capTable(S, A, S.ts.Vpre), post = S.ts.Vpre * 1e6 / (1 - A);
      return 'New money ' + money(A * post) + (ct.SafePR > .0001 ? ', plus ' + money(ct.SafePR * post) + ' of pro rata' : '') + '. (1 − ' + F.pct(ct.o, 1) + ') × (1 − ' + F.pct(ct.S, 1) + ') × (1 − ' + F.pct(ct.D, 1) + ') = ' + F.pct(ct.founders, 1) + ' for the founders.';
    }

    /* ---------- the ending and the debrief ---------- */
    function endingText() {
      var ct = capNow(S), m3 = cmgr(S, 3), al = aliveProj(S), nr = needR(S), m = lastMonth(S), t = '';
      var you = duo(S) || (S.team.duo && S.split) ? ' Your own share is ' + F.pct(ct.you, 1) + '.' : '';
      switch (S.ending) {
        case 'ACQUIHIRE': t = 'You took the offer. The team gets jobs and retention packages; the product gets a sunset email. For a company that had stopped growing, a soft landing. For one that hadn’t, an expensive exit.'; break;
        case 'PINCH': var lb = S.mon[m] ? S.mon[m].burn : burnNow(S);
          t = 'Default dead, growing too slowly, and out of time to fix it. The company closes in month ' + m + ' with ' + money(S.MRR) + ' of monthly revenue' + (S.MRR >= lb / 4 ? ' that would have been a fine business at a quarter of the burn.' : ' against ' + money(lb) + ' of burn.'); break;
        case 'RUNWAY': t = 'You were growing, just not fast enough to outrun the payroll. The customers were real; the hiring plan assumed a Series A that never came.'; break;
        case 'BREAKOUT': t = 'Series A closed at ' + capM(S.A.Vpre) + ' pre-money. The founders own ' + F.pct(ct.founders, 1) + ' of a company growing ' + F.pct(m3, 1) + ' a month' + (al.alive ? ', and it is default alive even if the market shuts tomorrow.' : ', and the new money buys the time to get to profitable.') + you + ' The users did most of this; the rest was arithmetic.'; break;
        case 'PRICED': t = 'You raised the A. Between the SAFEs, the pool and the round, the founders own ' + F.pct(ct.founders, 1) + '.' + you + ' Still a real outcome; just a smaller slice of it than the Demo Day version of you assumed.'; break;
        case 'RAMEN': t = (S.dd && S.dd.skipped ? 'You skipped the raise' : 'You raised nothing') + ' and kept the company. It pays the founders’ rent and grows ' + F.pct(m3, 1) + ' a month. Investors call you now. The ones who called back first get the meeting.'; break;
        case 'ALIVE': t = 'No Series A, and no need for one yet. ' + (S.MRR >= burnNow(S) ? 'Revenue already covers the burn.' : 'Revenue covers the burn within ' + al.t + ' ' + F.plural(al.t, 'month') + ' on the cash you have.') + ' The strongest position in startups is not needing the meeting.'; break;
        case 'ZOMBIE': t = 'Alive, not growing: ' + F.pct(m3, 1) + ' a month on ' + money(S.MRR) + '. That is a small business. Find growth or run it as one.'; break;
        default: var rw = runwayMo(S);
          t = (al.never ? 'Default dead: at this rate revenue never passes the burn' + (rw != null ? ', and the cash lasts ' + runwayW(rw) : '') + '.' : 'Default dead, with ' + al.t + ' ' + F.plural(al.t, 'month') + ' to fix it.') +
            ' Cut the burn or find the growth; the calculator says ' + (nr != null ? 'you need ' + F.pct(nr, 1) + ' a month.' : 'no growth rate saves this burn.');
      }
      if (S.split) t = cof(S) + ' left in ' + S.split.when + '. ' + splitLine(S) + ' ' + t;
      return t;
    }
    function audit() {
      var h = '', w1 = S.firstLaunch, tt = S.tot, lessons = [];
      function L(title, you, principle, history, src) { lessons.push(K.lesson({ title: title, you: you, principle: principle, history: history, src: src, labels: { you: 'Your number' } })); }
      L('Launch now', w1 == null ? 'Never. You spent the batch building for users you hadn’t met.' : w1 <= 3 ? 'Week ' + w1 + '. You launched before it was ready, which is the only way anyone launches.' : w1 <= 6 ? 'Week ' + w1 + '. Respectable. Every week before it was a week of guessing.' : 'Week ' + w1 + '. You spent ' + (w1 - 1) + ' weeks building for users you hadn’t met.',
        'Launch something bad quickly, then launch again. The first launch is for learning.', 'Michael Seibel tells Startup School founders to timebox version one: a launch in three weeks gets three weeks of spec. Kat Mañalac argues for launching again and again.', [SRC.ss2, SRC.launch]);
      var r4 = tt.avail4 ? tt.talk4 / tt.avail4 : 0;
      L('Talk to users', tt.talk4 + ' of ' + tt.avail4 + ' blocks in the first four weeks. ' + (r4 >= .3 ? 'The product was built on their words.' : r4 < .15 ? 'You built on your own belief about demand, and some ideas flatter that belief.' : 'Enough to start; not enough to be sure.'),
        'Belief about demand is biased until it meets users: sitcom ideas feel bigger than they are, schleps smaller.', 'Eric Migicovsky’s five questions start with ‘What is the hardest part…’ and never mention your product. Paul Graham’s test for an idea is who wants it so much they’ll use a crappy version one.', [SRC.ss1, SRC.ideas]);
      L('Do things that don’t scale', tt.hands + ' ' + F.plural(tt.hands, 'block') + ' onboarding by hand. ' + (tt.hands >= 6 ? 'The Collison installation, repeated until it was a habit.' : tt.hands <= 2 ? 'Growth waited for a channel that didn’t exist yet.' : 'Some hand-holding; the fire was lit, barely.'),
        'Early growth is recruited, one user at a time, by the founders.', 'Stripe’s founders set new users up on the spot instead of sending a link; Airbnb’s went door to door in New York; Wufoo wrote thank-you notes by hand.', [SRC.ds]);
      var s12 = S.h.src[12] || { hands: 0, trials: 0, wom: 0 }, tot12 = s12.hands + s12.trials + s12.wom, wp = tot12 > 0 ? s12.wom / tot12 : 0;
      L('Effort adds, fit compounds', F.pct(wp, 0) + ' of week 12’s new customers came by word of mouth. ' + (wp >= .35 ? 'The product had started doing your job.' : wp < .15 ? 'Every customer still needed you personally. That’s how it starts; it isn’t how it scales.' : 'The handoff from you to the product had begun.'),
        'Blocks of effort add a fixed number of customers, so their growth rate falls as you grow. Only fit multiplies.', 'Superhuman’s ‘very disappointed’ score went from 22% to 58% in about three quarters: it narrowed to the users who loved it, spent half its roadmap on what they loved, and spent the other half on what held back the users who almost did.', [SRC.shm]);
      L('Be in fundraising mode or not', tt.raisePre + ' ' + F.plural(tt.raisePre, 'block') + ' with investors before Demo Day. ' + (tt.raisePre <= 1 ? 'No distractions from investors before you had numbers.' : tt.raisePre >= 3 ? 'That’s time with investors before you had anything to show them.' : 'A little early coffee; no real harm.'),
        'Raise in a focused burst, meet the most promising investors first, and treat anything short of a signed offer as a no.', 'Paul Graham’s How to Raise Money: fundraising is a mode you are in or not, and doing it in the background wrecks both jobs.', [SRC.fr]);
      var mc = minCap(S), ddc = S.dd && !S.dd.skipped ? S.dd.cap : null, early = S.safes.filter(function (s) { return s.ty === 'angel'; })[0];
      L('The MFN', mc == null ? 'No capped SAFEs, so YC’s $375K still floats to the priced round.' : early && ddc && early.cap < ddc ? 'Your lowest cap was ' + capM(mc) + ', so YC’s $375K converted there: ' + F.pct(.375 / mc, 2) + ' instead of ' + F.pct(.375 / ddc, 2) + ' at your Demo Day cap.' : 'YC’s $375K converted at ' + capM(mc) + ': ' + F.pct(.375 / mc, 2) + '.',
        'YC’s uncapped SAFE takes the terms of your lowest-cap SAFE, so the cheapest check you sign prices YC too.', 'YC’s own example: at a $15M post-money cap, the $375K is 2.5% of the company.', [SRC.deal]);
      var early50 = S.hires.filter(function (x) { return x.fit != null && x.fit < 50; }).length;
      L('Hire after fit', S.hires.length ? (early50 ? early50 + ' of ' + S.hires.length + ' ' + F.plural(S.hires.length, 'hire') + ' came before the product worked.' : 'Every hire came after the product worked.') : 'No hires. The founders did it all, which has its own limits.',
        'Burn buys growth only after the product works; before that it buys runway you no longer have.', 'Paul Graham calls hiring too fast by far the biggest killer of startups that raise money.', [SRC.aord]);
      if (S.team.duo) L('Founders', 'Peak friction ' + M.round(S.peakFric) + '; ' + (tt.hard + (S.hardN || 0)) + ' hard ' + F.plural(tt.hard + (S.hardN || 0), 'conversation') + '; ' + (S.vest ? 'shares vested' : 'no vesting') + '. ' + (S.split ? (S.split.vested ? 'A split, and vesting kept the cap table clean.' : 'No vesting and a split. The cap table will explain it to every investor.') : S.peakFric >= 70 ? 'It cracked, and held.' : 'It held.'),
        'Friction builds with stress and falls with rest and frank conversations. Vesting is what makes a split survivable.', 'In 2006 Paul Graham wrote that about 20% of the startups YC had funded had lost a founder.', [SRC.mist, SRC.clerky]);
      var dist = S.evLog.filter(function (e) { return ['LOGO', 'CORPDEV', 'EXPO', 'RIVAL'].indexOf(e.id) >= 0; });
      L('Distractions', dist.length ? dist.map(function (e) { return e.title.replace(/\.$/, '') + ': “' + e.label + '”'; }).join(' ') : 'None came calling this time.',
        'Long enterprise deals, corp dev and conferences eat startup time, unless the conference is where the customers are.', 'Geoff Ralston and Michael Seibel’s pocket advice lists all three, and adds: ignore your competitors; you are more likely to die of suicide than murder.', [SRC.ess]);
      if (S.evLog.some(function (e) { return e.id === 'COLD'; })) L('The cold start', S.choices.COLD === 1 ? (S.flags.trust ? 'You invented neighbors, and a member noticed in week ' + S.flags.trust + '.' : 'You invented neighbors, and nobody noticed. This time.') : 'You seeded the community in the open.',
        'Seed a community with real people and real founder posts, in the open.', 'Reddit’s founders posted from accounts they controlled in the early days; since 2024 the FTC’s rule bans fake reviews and testimonials, including from people who don’t exist.', [SRC.reddit, SRC.ftc]);
      var ct = capNow(S);
      L('Dilution multiplies', S.A ? '(1 − ' + F.pct(ct.o, 1) + ') × (1 − ' + F.pct(ct.S, 1) + ') × (1 − ' + F.pct(ct.D, 1) + ') = ' + F.pct(ct.founders, 1) + ' for the founders.' : '(1 − ' + F.pct(ct.o, 1) + ') × (1 − ' + F.pct(ct.S, 1) + ') = ' + F.pct(ct.founders, 1) + ' for the founders, before any priced round.',
        'Each round takes a percentage of what is left, so the losses multiply rather than add.', 'YC’s worked example: 15% in SAFEs, 8% in options and a 25% Series A with pro rata and a 10% pool leave the founders 47.38%.', [SRC.guide]);
      return lessons.join('');
    }
    function botsHTML() {
      var list = [];
      try { list = bots(seed, log); } catch (e) { list = []; }
      var me = summary(S, 'You');
      var rows = [me].concat(list);
      return '<div class="lk-scroll"><table class="lk-table lk-table--stack yb-bots"><thead><tr><th>Founder</th><th>Launch</th><th>Demo Day MRR</th><th>Raised</th><th>Final MRR</th><th>Ending</th><th>Founders own</th></tr></thead><tbody>' +
        rows.map(function (r, i) {
          return '<tr' + (i === 0 ? ' class="is-sel"' : '') + '><td>' + E(r.name) + (i ? '<small class="yb-bdesc">' + E(BOTD[['playbook', 'builder', 'closer'][i - 1]]) + '</small>' : '') + '</td><td data-l="Launch">' + (r.launch ? 'Week ' + r.launch : 'Never') + '</td><td data-l="Demo Day MRR">' + money(r.ddMRR) + '</td><td data-l="Raised">' + money(r.raised) + '</td><td data-l="Final MRR"><span>' + money(r.m18) + ' <small>month ' + r.month + '</small></span></td><td data-l="Ending">' + E(ENDINGS[r.ending]) + '</td><td data-l="Founders own">' + F.pct(r.founders, 1) + '</td></tr>';
        }).join('') + '</tbody></table></div><p class="yb-capnote">Same batch, same luck, three other founders: the same idea, team and interview, and every random draw identical. Differences are decisions.</p>';
    }
    function renderEnd() {
      var ct = capNow(S), al = aliveProj(S), m = lastMonth(S), dd = S.dd || {};
      var ids = ['growth', 'talk', 'launch', 'dontscale', 'pmf', 'wom', 'raise', 'mfn', 'dilution', 'alive', 'cofounders', 'distract', 'valuation', 'ramen'];
      var dec = S.evLog.map(function (e) { return '<li><span class="lk-chip">' + E(e.at) + '</span><b>' + E(e.title) + '</b> ' + E(e.label) + (e.auto ? ' <i class="yb-auto">(decided by default)</i>' : '') + ' <span class="yb-dim">' + E(e.out) + '</span></li>'; }).join('');
      K.debrief(el.end, {
        kicker: 'Ending · Batch #' + seed, title: ENDINGS[S.ending], sub: S.idea.name + ', month ' + m, lede: endingText(),
        stats: [
          { k: 'Demo Day MRR', v: money(dd.mrr != null ? dd.mrr : S.h.mrr[12] || 0) }, { k: 'Best growth streak', v: bestStreak(S) + ' ' + F.plural(bestStreak(S), 'week') + ' at 5%+' },
          { k: 'Raised', v: money(raisedOut(S) + (S.A ? S.A.newMoney : 0)) }, { k: 'Founders own', v: F.pct(ct.founders, 1) },
          { k: 'YC owns', v: F.pct(S.A ? ct.ycF : ct.yc7 + (ct.mfn || 0), 1) + (ct.mfn == null ? ' + MFN' : '') }, { k: 'Final MRR', v: money(S.MRR) },
          { k: 'Cash', v: money(S.cash), tone: S.cash < 0 ? 'loss' : null }, { k: 'Default', v: S.cash < 0 ? 'Dead' : al.alive ? 'Alive' : 'Dead', tone: S.cash >= 0 && al.alive ? 'gain' : 'loss' }
        ],
        sections: (X3.off ? [] : [{ label: 'Your company, floor by floor', html: '<div class="yb-twslot" data-ground="espresso"></div>' }]).concat([
          { label: 'Your batch, audited: what you did, the principle, what really happened', html: audit() },
          { label: 'Same batch, same luck, three other founders', html: botsHTML() },
          { label: 'The curves', html: '<canvas class="lk-chart yb-cv" data-cv="growth" data-final="1" aria-hidden="true"></canvas><p class="vh yb-cvsum"></p><canvas class="lk-chart yb-cv" data-cv="alive" data-final="1" aria-hidden="true"></canvas><p class="vh yb-cvsum2"></p>' + aliveLegend() },
          { label: 'The cap table at the end', html: capHTML(ct, true) },
          { label: 'Every card you were dealt', html: dec ? '<ul class="yb-dec">' + dec + '</ul>' : '<p>No event cards this time.</p>' },
          { label: 'The journal', html: '<details class="yb-jdet"><summary>Read the whole batch, week by week</summary><div class="yb-jall">' + S.journal.map(function (e) { return '<p><span class="lk-chip">' + E(e.at) + '</span>' + E(e.txt) + '</p>'; }).join('') + '</div></details>' }
        ]),
        principles: ids.filter(function (id) { return S.met.indexOf(id) >= 0 || shelf.notes.has(id); }),
        take: true,
        actions: [{ label: 'Replay this batch', primary: true, onClick: function () { start(seed); act({ t: 'begin' }); } },
          { label: 'New batch', onClick: function () { start(newSeed()); render(); } }]
      });
      endCover();
      paint();
    }
    /* the debrief opens on an espresso cover: kicker, title, verdict and figures beside the finished building */
    function endCover() {
      var db = el.end.querySelector('.lk-debrief'), t = db && db.querySelector('.lk-title');
      if (!db || !t || db.querySelector('.yb-endcov')) return;
      var cov = document.createElement('div'), txt = document.createElement('div'), n = db.firstChild, nx;
      cov.className = 'yb-endcov'; cov.setAttribute('data-ground', 'espresso'); txt.className = 'yb-endtxt';
      while (n && !(n.classList && n.classList.contains('lk-debrief-sec'))) { nx = n.nextSibling; txt.appendChild(n); n = nx; }
      cov.appendChild(txt);
      var slot = db.querySelector('.yb-twslot'), sec = slot && slot.closest('.lk-debrief-sec');
      if (sec) { sec.classList.add('yb-endfig'); cov.appendChild(sec); }
      db.insertBefore(cov, db.firstChild);
      K.focus(t, { scroll: false });
    }

    /* ---------- charts: canvas, tokens only, repainted on theme and return ---------- */
    function niceMax(v) { if (!(v > 0)) return 1000; var p = M.pow(10, M.floor(M.log(v) / M.LN10)), n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; }
    function shortMoney(v) { return v >= 1e9 ? '$' + (v / 1e9).toFixed(1) + 'B' : v >= 1e6 ? '$' + (v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + 'M' : v >= 1000 ? '$' + M.round(v / 1000) + 'K' : '$' + M.round(v); }
    function paintGrowth(c, monthly) {
      var f = K.fitCanvas(c, 214), x = f.ctx, W = f.W, H = f.H;
      if (!(W > 0)) return;
      x.clearRect(0, 0, W, H);
      var n = monthly ? 18 : 16, data = [], src = [], i, k;
      if (monthly) {
        for (i = 1; i <= 18; i++) {
          var mo = S.mon[i]; data.push(mo ? mo.mrr : null);
          if (i <= 4) { var a = 0, b = 0, cc = 0; for (k = 4 * i - 3; k <= 4 * i; k++) { var s = S.h.src[k]; if (s) { a += s.hands + s.trials; cc += s.wom; } } src.push(mo ? [a, b, cc] : null); }
          else src.push(mo && mo.src ? [mo.src.eff, mo.src.paid, mo.src.wom] : null);
        }
      } else for (i = 1; i <= 16; i++) { data.push(S.h.mrr[i] != null ? S.h.mrr[i] : null); var s2 = S.h.src[i]; src.push(s2 ? [s2.hands, s2.trials, s2.wom] : null); }
      var last = -1; data.forEach(function (v, j) { if (v != null) last = j; });
      var mx = niceMax(M.max.apply(null, data.map(function (v) { return v || 0; }).concat([1000])) * 1.05);
      var Lx = 10, Rx = W - (monthly ? 10 : 46), T = 30, SB = 22, XB = 18, B = H - XB - SB - 8, slot = (Rx - Lx) / n, bw = M.max(2, slot * .62);
      function X(j) { return Lx + slot * j + (slot - bw) / 2; }
      function Y(v) { return B - v / mx * (B - T); }
      x.strokeStyle = K.inkColor(.12); x.lineWidth = 1;
      [.5, 1].forEach(function (q) { var y = K.snap(Y(mx * q)); x.beginPath(); x.moveTo(Lx, y); x.lineTo(Rx, y); x.stroke(); K.cvText(x, shortMoney(mx * q), Lx, y - 4, { px: 11, color: K.inkColor(.6) }); });
      x.strokeStyle = K.inkColor(.35); x.beginPath(); x.moveTo(Lx, K.snap(B)); x.lineTo(Rx, K.snap(B)); x.stroke();
      var dd = monthly ? 3 : 12, dx = K.snap(Lx + slot * dd);
      x.save(); x.setLineDash([3, 4]); x.strokeStyle = K.inkColor(.4); x.beginPath(); x.moveTo(dx, T - 8); x.lineTo(dx, B + SB + 8); x.stroke(); x.restore();
      if (monthly) K.cvText(x, 'Demo Day', dx + 5, 14, { px: 11, color: K.inkColor(.7) });
      else K.cvText(x, 'Demo Day', dx - 5, 14, { px: 11, align: 'right', color: K.inkColor(.7) });
      for (i = 0; i < n; i++) {
        if (data[i] == null) continue;
        var v = data[i], y = Y(v);
        x.fillStyle = i === last ? K.ACC() : K.inkColor(.55);
        x.fillRect(X(i), y, bw, M.max(0, B - y));
        var s3 = src[i];
        if (s3) {
          var tt = s3[0] + s3[1] + s3[2], y0 = B + 6;
          if (tt > 0) {
            var hs = [s3[0] / tt * SB, s3[1] / tt * SB, s3[2] / tt * SB], cols = [K.inkColor(.85), K.inkColor(.45), K.ACCA(.6)];
            for (k = 0; k < 3; k++) { if (hs[k] > 0) { x.fillStyle = cols[k]; x.fillRect(X(i), y0, bw, hs[k]); } y0 += hs[k]; }
          } else { x.fillStyle = K.inkColor(.12); x.fillRect(X(i), y0, bw, 1); }
        }
      }
      var labs = monthly ? [[0, 'M1'], [4, 'M5'], [11, 'M12'], [17, 'M18']] : [[0, 'W1'], [3, 'W4'], [7, 'W8'], [11, 'W12'], [15, 'R4']];
      labs.forEach(function (l) { K.cvText(x, l[1], X(l[0]) + bw / 2, H - 4, { px: 11, align: 'center', color: K.inkColor(.6) }); });
      if (!monthly) {
        var gT = .30, gy = function (g) { return B - clamp(g, 0, gT) / gT * (B - T - 6); }, gx = Rx + 4;
        x.fillStyle = K.ACCA(.12); x.fillRect(Lx, gy(.07), Rx - Lx, gy(.05) - gy(.07));
        x.save(); x.setLineDash([2, 4]); x.strokeStyle = K.inkColor(.4); x.beginPath(); x.moveTo(Lx, K.snap(gy(.01))); x.lineTo(Rx, K.snap(gy(.01))); x.stroke(); x.restore();
        x.strokeStyle = K.ACC(); x.lineWidth = 1; x.beginPath(); x.moveTo(Lx, K.snap(gy(.10))); x.lineTo(Rx, K.snap(gy(.10))); x.stroke();
        K.cvText(x, '10%', gx, gy(.10) + 4, { px: 11, color: K.inkColor(.75) });
        K.cvText(x, '5–7%', gx, gy(.06) + 4, { px: 11, color: K.inkColor(.75), raw: true });
        K.cvText(x, '1%', gx, gy(.01) + 4, { px: 11, color: K.inkColor(.75) });
        K.cvText(x, 'Growth', W - 4, 14, { px: 11, align: 'right', color: K.inkColor(.6) });
        for (i = 0; i < n; i++) {
          var g = S.h.g[i + 1];
          if (g == null || data[i] == null) continue;
          var cx = X(i) + bw / 2, cy = gy(g);
          if (g > gT) {
            x.beginPath(); x.moveTo(cx, cy - 4); x.lineTo(cx + 3.5, cy + 2); x.lineTo(cx - 3.5, cy + 2); x.closePath(); x.fillStyle = K.inkColor(.92); x.fill();
          } else {
            x.beginPath(); x.arc(cx, cy, 3.2, 0, 6.2832); x.fillStyle = K.labColor('--card'); x.fill();
            x.beginPath(); x.arc(cx, cy, 2.6, 0, 6.2832); x.fillStyle = K.inkColor(.92); x.fill();
          }
        }
      }
      K.cvText(x, 'MRR', Lx, 14, { px: 11, color: K.inkColor(.6) });
      var first = -1; data.forEach(function (v, j) { if (first < 0 && v > 0) first = j; });
      var sumEl = c.nextElementSibling;
      if (sumEl) sumEl.textContent = last < 0 || first < 0 ? 'No revenue yet.' : 'MRR went from ' + money(data[first]) + ' in ' + (monthly ? 'month ' : 'week ') + (first + 1) + ' to ' + money(data[last]) + ' in ' + (monthly ? 'month ' : 'week ') + (last + 1) + '.' +
        (monthly ? ' Three-month growth: ' + F.pct(cmgr(S, 3), 1) + ' a month.' : g4(S, M.min(S.week, 16)).g != null ? ' Weekly growth over the last four weeks averaged ' + F.pct(g4(S, M.min(S.week, 16)).g, 1) + '.' : '');
    }
    function paintAlive(c) {
      var f = K.fitCanvas(c, 196), x = f.ctx, W = f.W, H = f.H;
      if (!(W > 0)) return;
      x.clearRect(0, 0, W, H);
      var m0 = lastMonth(S), al = aliveProj(S), r = al.r, E0 = burnNow(S), C = S.cash, R0 = S.MRR, rev = [], burn = [], cash = [], i, dead = S.cash < 0;
      for (i = 1; i <= m0; i++) { var mo = S.mon[i]; rev[i] = mo ? mo.mrr : null; burn[i] = mo ? mo.burn : null; cash[i] = mo ? mo.cash : null; }
      var end = 36, prof = null, out = null, last = m0;
      if (al.now && !dead) prof = m0;
      for (i = m0 + 1; i <= end && !dead; i++) {
        var R = R0 * M.pow(1 + r, i - m0); C += R - E0;
        rev[i] = R; burn[i] = E0; cash[i] = C; last = i;
        if (prof == null && R >= E0 && C > 0) prof = i;
        if (C <= 0) { out = i; break; }
        if (prof != null && i >= prof + 3) break;
      }
      if (dead) out = m0;
      var Lx = 10, Rx = W - 12, T = 26, B = H - 24;
      var act = []; for (i = 1; i <= m0; i++) { if (rev[i] != null) act.push(rev[i]); if (burn[i] != null) act.push(burn[i]); }
      var mxM = niceMax(M.max.apply(null, act.concat([E0, 1000])) * 1.6);
      var mxC = niceMax(M.max.apply(null, cash.filter(function (v) { return v != null; }).concat([1])));
      function X(m) { return Lx + (m - 1) / (end - 1) * (Rx - Lx); }
      function YM(v) { return B - clamp(v, 0, mxM) / mxM * (B - T); }
      function YC(v) { return B - clamp(v, 0, mxC) / mxC * (B - T); }
      x.strokeStyle = K.inkColor(.35); x.lineWidth = 1; x.beginPath(); x.moveTo(Lx, K.snap(B)); x.lineTo(Rx, K.snap(B)); x.stroke();
      var poly = [];
      for (i = 1; i <= last; i++) if (cash[i] != null) poly.push([X(i), YC(cash[i])]);
      if (poly.length) {
        x.beginPath(); x.moveTo(poly[0][0], B); poly.forEach(function (p) { x.lineTo(p[0], p[1]); }); x.lineTo(poly[poly.length - 1][0], B); x.closePath(); x.fillStyle = K.inkColor(.07); x.fill();
      }
      function line(arr, from, to, col, lw, dash) {
        x.save(); x.strokeStyle = col; x.lineWidth = lw; x.setLineDash(dash || []); x.lineJoin = 'round'; x.beginPath();
        var st = false;
        for (var j = from; j <= to; j++) { if (arr[j] == null) continue; var px = X(j), py = arr === cash ? YC(arr[j]) : YM(arr[j]); if (!st) { x.moveTo(px, py); st = true; } else x.lineTo(px, py); }
        x.stroke(); x.restore();
      }
      x.save(); x.beginPath(); x.rect(Lx, T - 2, Rx - Lx, B - T + 3); x.clip();
      line(cash, 1, m0, K.inkColor(.45), 2); line(cash, m0, last, K.inkColor(.4), 1.5, [2, 3]);
      line(burn, 1, m0, K.inkColor(.5), 1.5, [5, 4]); line(burn, m0, last, K.inkColor(.35), 1.2, [5, 4]);
      line(rev, 1, m0, K.inkColor(.9), 2); line(rev, m0, last, K.inkColor(.7), 1.5, [2, 3]);
      x.restore();
      var nx = K.snap(X(m0));
      x.strokeStyle = K.inkColor(.3); x.beginPath(); x.moveTo(nx, T - 6); x.lineTo(nx, B); x.stroke();
      K.cvText(x, 'Now', nx - 4, B - 6, { px: 11, align: 'right', color: K.inkColor(.7) });
      K.cvText(x, 'Top: ' + shortMoney(mxM) + ' a month', Lx, 14, { px: 11, color: K.inkColor(.6) });
      K.cvText(x, 'Cash top: ' + shortMoney(mxC), Rx, 14, { px: 11, align: 'right', color: K.inkColor(.6) });
      [1, 6, 12, 18, 24, 30, 36].forEach(function (m) { K.cvText(x, 'M' + m, X(m), H - 6, { px: 11, align: m === 1 ? 'left' : m === 36 ? 'right' : 'center', color: K.inkColor(.55) }); });
      var mk = out != null ? out : prof, lbl = out != null ? 'Cash out · month ' + out : prof != null ? (al.now && prof === m0 ? 'Profitable now' : 'Profitable · month ' + prof) : null;
      if (mk != null && lbl) {
        var my = out != null ? B : YM(rev[mk] || 0), mxp = X(mk);
        x.beginPath(); x.arc(mxp, my, 4, 0, 6.2832); x.fillStyle = K.ACC(); x.fill();
        x.lineWidth = 1.5; x.strokeStyle = K.labColor('--card'); x.stroke();
        K.cvText(x, lbl, M.min(Rx, M.max(Lx + 60, mxp)), my - 10, { px: 11, align: mxp > W * .7 ? 'right' : mxp < W * .3 ? 'left' : 'center', color: K.inkColor(.85) });
      }
      var sumEl = c.nextElementSibling;
      var rw = runwayMo(S);
      if (sumEl) sumEl.textContent = dead ? 'The cash ran out in month ' + m0 + '.' : al.now ? 'Default alive: revenue already covers the burn.' : al.alive ? 'Default alive: at ' + F.pct(r, 1) + ' a month, revenue passes burn in month ' + (prof || m0 + al.t) + '.' :
        al.never ? 'Default dead: at this rate revenue never passes burn' + (rw != null ? (rw >= 120 ? '; the cash lasts more than ten years' : '; cash lasts to about month ' + (m0 + rw)) : '') + '.' : 'Default dead: at ' + F.pct(r, 1) + ' a month, the cash runs out around month ' + (out || m0 + al.t) + '.';
    }
    function paint() {
      if (!S) return;
      Array.prototype.forEach.call(root.querySelectorAll('canvas[data-cv]'), function (c) {
        if (!c.offsetParent || !c.clientWidth) return;
        var fin = c.getAttribute('data-final') === '1';
        if (c.getAttribute('data-cv') === 'alive') paintAlive(c);
        else paintGrowth(c, fin || S.turn >= 0 || S.phase === 'closed');
      });
    }

    /* ---------- the dilution lab: YC’s worked example with your own sliders ---------- */
    var LAB = { S: 15, o: 8, A: 25, P: 10, Spr: 15, cap: 15 };
    function labHTML() {
      function rg(k, lbl, lo, hi) { return '<div class="lk-field"><label for="yb-l-' + k + '">' + lbl + '</label><output class="lk-range-out" id="yb-l-' + k + 'o">' + LAB[k] + '%</output><input type="range" id="yb-l-' + k + '" data-lab="' + k + '" min="' + lo + '" max="' + hi + '" step="1" value="' + LAB[k] + '"></div>'; }
      return '<p class="lk-lede">The math behind every ownership number in this machine, from YC’s post-money SAFE user guide. Move the sliders, or load YC’s own example.</p>' +
        '<div class="yb-labwrap"><div class="yb-labgrid"><div>' + rg('S', 'Sold in SAFEs', 0, 30) + rg('o', 'Options granted after the SAFEs', 0, 15) + rg('A', 'Series A: new investors’ share', 10, 35) + '</div><div>' + rg('P', 'New option pool after the A', 0, 20) + rg('Spr', 'SAFEs holding pro rata', 0, 30) +
        '<div class="btnrow">' + btn('labyc', 'Load YC’s worked example') + '</div></div></div>' +
        (X3.off ? '' : fig3D('yb-cyl', 'The cap table as a cylinder', 'yb-cy-d', 'Drawing the cap table', 'Ownership as a cylinder, founders at the bottom. Each slice is as thick as its share of the company. Take it apart to read every slice.',
          SLICES.map(function (x) { return [x[0], x[1]]; }), '<div class="lk-seg yb-src" aria-label="Draw the cap table from"><button data-v="batch" aria-checked="' + (cylSrc() === 'batch') + '">This batch</button><button data-v="lab" aria-checked="' + (cylSrc() === 'lab') + '">The sliders</button></div>', 'espresso')) +
        '</div><p class="yb-labout lk-num" aria-live="polite"></p>' +
        '<div class="yb-labyc"><p class="lk-kicker">YC’s deal at your cap</p><div class="lk-field"><label for="yb-l-cap">Your lowest post-money cap</label><output class="lk-range-out" id="yb-l-capo">$15M</output><input type="range" id="yb-l-cap" data-lab="cap" min="5" max="60" step="1" value="15"></div><p class="yb-labout2 lk-num" aria-live="polite"></p></div>';
    }
    function labCalc() {
      var b = el.lab.querySelector('.yb-labbody');
      if (!b.firstChild) {
        b.innerHTML = labHTML(); K.sfill(b);
        var cf = b.querySelector('.yb-cyl');
        if (cf) { X3.seg = K.seg(cf.querySelector('.yb-src'), function (v) { X3.src = v; sync3D(); }); watch3D(cf); }
      }
      if (LAB.Spr > LAB.S) LAB.Spr = LAB.S;
      var Sx = LAB.S / 100, o = LAB.o / 100, A = LAB.A / 100, P = LAB.P / 100, Spr = LAB.Spr / 100;
      var pr = Spr < 1 ? A / (1 - Spr) - A : 0, D = A + pr + P, fo = (1 - o) * (1 - Sx) * (1 - D);
      var spr = b.querySelector('#yb-l-Spr'); if (spr) spr.max = LAB.S;
      ['S', 'o', 'A', 'P', 'Spr', 'cap'].forEach(function (k) { var i = b.querySelector('#yb-l-' + k), op = b.querySelector('#yb-l-' + k + 'o'); if (i && +i.value !== LAB[k]) i.value = LAB[k]; if (op) op.textContent = k === 'cap' ? '$' + LAB.cap + 'M' : LAB[k] + '%'; });
      b.querySelector('.yb-labout').innerHTML = 'SAFE pro rata: ' + F.pct(A, 1) + ' ÷ (1 − ' + F.pct(Spr, 1) + ') − ' + F.pct(A, 1) + ' = <b>' + F.pct(pr, 2) + '</b>. Series A dilution: ' + F.pct(A, 1) + ' + ' + F.pct(pr, 2) + ' + ' + F.pct(P, 1) + ' pool = <b>' + F.pct(D, 2) + '</b>.<br>Founders keep (1 − ' + F.pct(o, 1) + ') × (1 − ' + F.pct(Sx, 1) + ') × (1 − ' + F.pct(D, 2) + ') = <b>' + F.pct(fo, 2) + '</b>. Total dilution ' + F.pct(1 - fo, 2) + '.';
      var mfn = .375 / LAB.cap;
      b.querySelector('.yb-labout2').textContent = 'YC owns 7% + ($375K ÷ $' + LAB.cap + 'M = ' + F.pct(mfn, 2) + ') = ' + F.pct(.07 + mfn, 2) + ' after the SAFEs, before the priced round.';
      K.sfill(b);
      sync3D();
    }

    /* ---------- the drawings: read the run, never write it ---------- */
    /* default alive or dead, as the strip reads it, captured once at the end of each week and each turn */
    function snap() {
      var w = S.h.mrr.length - 1, t = S.a3 ? S.a3.turns.length - 1 : -1;
      function rd() { var a = aliveProj(S); return { al: a.alive, t: a.t, now: !!a.now, run: runwayMo(S), early: !a.now && lastMonth(S) < 2 }; }
      if (w >= 1 && !snaps['W' + w]) snaps['W' + w] = rd();
      if (t >= 0 && !snaps['T' + t]) snaps['T' + t] = rd();
    }
    function monAt(t) { var b = S.mon[6 + 2 * t], n = 2; if (!b) { b = S.mon[5 + 2 * t]; n = 1; } return { mrr: b ? b.mrr : 0, n: n }; }
    function r3(v) { return M.round(v * 1000) / 1000; }
    function towerData() {
      var H = S.h, nW = M.min(WK, H.mrr.length - 1), nT = S.a3 ? S.a3.turns.length : 0, lean = 0, f = [], fu = [], i, live = -1;
      for (i = 0; i < WK + TN; i++) {
        var wk = i < WK, k = wk ? i + 1 : i - WK, built = wk ? k <= nW : k < nT, r = 0, g = null, sn = null, bits = [];
        if (built) {
          if (wk) { r = H.mrr[k] || 0; g = H.g[k]; sn = snaps['W' + (k === WK && snaps.W16 ? 16 : k)]; }
          else { var m1 = monAt(k), m0 = k ? monAt(k - 1).mrr : (S.mon[4] ? S.mon[4].mrr : H.mrr[12] || 0); r = m1.mrr; g = m0 > 0 ? M.pow(r / m0, 1 / m1.n) - 1 : null; sn = snaps['T' + k]; }
          lean += clamp(g || 0, -.2, .25) * .45;
          bits.push(g == null ? 'Too early to measure growth.' : (g >= 0 ? 'Up ' : 'Down ') + F.pct(M.abs(g), 1) + (wk ? ' on the week.' : ' a month.'));
          if (wk && S.firstLaunch === k) bits.push('Launch week.');
          if (wk && S.pivots.some(function (p) { return p.w === k; })) bits.push('You pivoted this week.');
          if (sn) bits.push(sn.now ? 'Revenue covers the burn. Default alive.' : (sn.run != null ? runwayW(sn.run).replace(/^./, function (c) { return c.toUpperCase(); }) + ' of runway. ' : '') +
            (sn.early ? 'Too early to call alive or dead. Growth is measured month to month.' : sn.al ? 'At this growth, profit comes in ' + sn.t + ' ' + F.plural(sn.t, 'month') + '. Default alive.' : 'At this growth, the cash runs out first. Default dead.'));
        }
        var st = !built ? 0 : r > 0 ? 2 : 1, s = st === 2 ? M.min(1.9, .45 + .4 * M.log(1 + r / 1000) / M.LN10) : st === 1 ? .45 : 1;
        f.push({ st: st, s: r3(s), x: r3(lean), fig: built ? money(r) + ' MRR' : 'Not built yet',
          why: built ? bits.join(' ') : wk ? 'Each week adds a floor. Width is revenue; the step out is growth.' : 'After Demo Day, each two-month turn adds a floor.' });
        if (sn) {
          var y0 = floorY(i), y1 = i + 1 < WK + TN ? floorY(i + 1) : y0 + floorH(i), run = sn.now || sn.run == null ? 24 : M.min(24, sn.run);
          fu.push([y0, r3(y1), sn.early ? 2 : sn.al ? 1 : 0, r3(y0 + floorH(i) / 2), r3(.08 + .3 * run / 24)]);
          if (sn.al) { if (live < 0) live = i; } else live = -1;
        }
      }
      var fx = 1e9, bx = -1e9, dd = !!S.dd || S.week > WK || S.turn >= 0, dm = S.dd && S.dd.mrr != null ? S.dd.mrr : H.mrr[WK] || 0, fy = fu.length ? fu[fu.length - 1][1] : 0;
      f.forEach(function (q) { fx = M.min(fx, q.x - q.s / 2); bx = M.max(bx, q.x + q.s / 2); });
      return { f: f, fu: fu, fx: r3(fx - .26), bx: r3((fx + bx) / 2), fy: fy, fa: live >= 0 ? floorY(live) : fy / 2, dd: dd, dx: f[WK - 1].x,
        g: [nW ? nW + ' of 12' : '12 weeks', dd ? money(dm) + ' MRR' : 'After week 12', nT ? nT + ' of 7' : '7 turns',
          live >= 0 ? 'Alive from ' + (live < WK ? 'week ' + (live + 1) : 'month ' + (5 + 2 * (live - WK))) : fu.length ? 'Not alive yet' : 'Not started'] };
    }
    function layout() {
      var pre = PRE.indexOf(S.phase) >= 0, end = S.phase === 'end', intro = S.phase === 'intro';
      el.side.hidden = end || pre;
      el.tw.classList.toggle('is-plan', intro);
      el.main.classList.toggle('is-intro', intro);
      if (intro) el.main.setAttribute('data-ground', 'espresso'); else el.main.removeAttribute('data-ground');
      /* without the engine the intro keeps its drawn poster; later phases drop the drawing */
      el.tw.hidden = X3.off && !intro;
      el.main.classList.toggle('is-two', !end && !pre);
    }
    /* the building opens the cover, lives on the stage beside the desk, and moves into the debrief when the run ends */
    function homeScene() {
      var to = S.phase === 'intro' ? el.desk.querySelector('.yb-covfig') || el.stfig : el.stfig;
      if (el.tw.parentNode !== to) { to.appendChild(el.tw); el.tw.classList.remove('is-wide'); }
    }
    function endScene() { var s = el.end.querySelector('.yb-twslot'); if (s && !X3.off && el.tw.parentNode !== s) { s.appendChild(el.tw); el.tw.classList.add('is-wide'); } }
    function off3D() {
      X3.off = true; if (X3.io) X3.io.disconnect();
      var c = root.querySelector('.yb-cyl'); if (c) c.hidden = true;
      var s = el.end.querySelector('.yb-twslot'); if (s && s.parentNode) s.parentNode.hidden = true;
      layout();
    }
    function watch3D(fig) {
      if (X3.off) return;
      if (X3.io == null) X3.io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { X3.io.unobserve(e.target); boot3D(e.target); } });
      }, { rootMargin: '400px 0px' }) : 0;
      if (X3.io) X3.io.observe(fig); else boot3D(fig);
    }
    function boot3D(fig) {
      var cyl = fig.classList.contains('yb-cyl'), k = cyl ? 'cyp' : 'twp';
      if (X3[k] || X3.off) return X3[k];
      if (!cyl) X3.d = towerData();
      X3[k] = mount3D(fig, cyl ? 'batch-captable' : 'batch-tower', { list: false, params: cyl ? { v: cylData() } : { d: X3.d } }).then(function (ex) {
        if (cyl) {
          X3.cy = ex; X3.ck = cylData().join(',');
          /* taken apart, the cylinder steps left so every slice can carry its label */
          ex.on('explode', function (t) {
            var c = ex.vw.camera, to = t > .5 ? -.42 : 0;
            fig.classList.toggle('is-exp', t > .5);
            if (X3.st) X3.st();
            X3.st = window.PS3D.tween({ from: c.shift[0], to: to, dur: 560, ease: 'io', update: function (v) { c.shift = [v, 0]; ex.vw.invalidate(); } });
          });
          X3.tags = tags3D(ex, function () { return SLICES.map(function (s) { var nd = ex.parts[s[0]]; return { n: nd.children[0], at: [1, .5, 0], t: s[1] + ' ' + (nd.fig || '') }; }); });
        } else { X3.tw = ex; X3.key = JSON.stringify(X3.d); frameTower(true); arrive(ex); ex.on('explode', function () { frameTower(false); }); }
        sync3D();
        return ex;
      }, function (e) { if (K.debug) console.warn('[lab:batch] 3D', e); off3D(); });
      return X3[k];
    }
    /* frame the whole building, the plan floors and the pulled-apart pose included, and glide there as it grows */
    function frameTower(now) {
      var ex = X3.tw, d = X3.d, c = ex && ex.vw.camera, pts = [], i, o;
      if (!ex || !d) return;
      function box(x0, x1, y0, y1, h) { [-1, 1].forEach(function (a) { [-1, 1].forEach(function (b) { pts.push([a < 0 ? x0 : x1, y0, b * h], [a < 0 ? x0 : x1, y1, b * h]); }); }); }
      var xp = ex.ex > .5;
      for (i = 0; i < WK + TN; i++) { var q = d.f[i]; box(q.x - q.s / 2, q.x + q.s / 2, 0, floorY(i) + floorH(i) + (i < WK || !xp ? 0 : .9), q.s / 2); }
      box(d.dx - .9, d.dx + .9, 0, Y0 + (xp ? .45 : .08), .9);
      box(d.bx - 1.3, d.bx + 1.3, -.1, 0, 1.3);
      pts.push([d.fx - (xp ? .5 : 0), 0, .55]);
      ex._fp = pts;
      o = ex.vw.frameCalc(pts, TMARG, ex.home.yaw, ex.home.pitch);
      if (!o) return;
      if (X3.ft) X3.ft();
      if (now) { c.target = o.target; c.radius = o.radius; c.span = o.span; ex.vw.invalidate(); return; }
      X3.ft = window.PS3D.tween({ from: c.target.concat([c.radius, c.span]), to: o.target.concat([o.radius, o.span]), dur: 560, ease: 'io',
        update: function (v) { c.target = v.slice(0, 3); c.radius = v[3]; c.span = v[4]; ex.vw.invalidate(); } });
    }
    /* first sight: the plan floors draw in from the ground up, once */
    function arrive(ex) {
      var P = window.PS3D, L = [];
      if (P.reduced()) return;
      for (var i = 0; i < WK + TN; i++) { L.push(ex.parts['f' + i]); if (i === WK - 1) L.push(ex.parts.dd); }
      L.forEach(function (nd, j) { nd.alpha = 0; nd._ta = P.tween({ dur: 320, delay: 30 * j, ease: 'out', update: function (v) { nd.alpha = v; ex.vw.invalidate(); }, done: function () { nd._ta = null; } }); });
    }
    function cylSrc() { return X3.src || (PRE.indexOf(S.phase) >= 0 ? 'lab' : 'batch'); }
    /* five slices that sum to one: the run's own cap table, or the dilution lab's sliders through the same formulas */
    function cylData() {
      var v;
      if (cylSrc() === 'lab') {
        var Sx = LAB.S / 100, o = LAB.o / 100, A = LAB.A / 100, Pp = LAB.P / 100, Spr = M.min(LAB.Spr, LAB.S) / 100, pr = Spr < 1 ? A / (1 - Spr) - A : 0,
          m = 1 - (A + pr + Pp), yc = M.min(Sx, .07 + .375 / LAB.cap);
        v = [(1 - o) * (1 - Sx) * m, o * (1 - Sx) * m + Pp, yc * m, (Sx - yc) * m, A + pr];
      } else {
        var ct = capNow(S), post = ct.D != null, m2 = post ? 1 - ct.D : 1;
        v = [ct.founders, ct.opts + (post ? ct.P : 0), (ct.yc7 + (ct.mfn || 0)) * m2, ct.other * m2, post ? ct.A + ct.SafePR : 0];
      }
      return v.map(function (x) { return M.round(x * 1e5) / 1e5; });
    }
    function sync3D() {
      if (X3.off) return;
      if (X3.tw) {
        var d = towerData(), k = JSON.stringify(d);
        if (k !== X3.key) { X3.key = k; X3.d = d; X3.tw.set({ d: d }); frameTower(false); }
      }
      if (X3.cy) {
        var v = cylData(), ck = v.join(',');
        if (ck !== X3.ck) { X3.ck = ck; X3.cy.set({ v: v }); if (X3.tags) X3.tags(); }
        if (X3.seg && X3.seg.value() !== cylSrc()) X3.seg.set(cylSrc());
      }
    }

    /* ---------- render ---------- */
    var PRE = ['intro', 'idea', 'team', 'vest', 'iv', 'ivres', 'deal'];
    function render(focusSel) {
      var pre = PRE.indexOf(S.phase) >= 0, end = S.phase === 'end', h = '';
      el.top.hidden = pre; el.inst.hidden = pre || end; el.jour.hidden = !S.journal.length && !extra.length;
      layout();
      el.desk.hidden = end;
      if (!pre) { renderRail(); renderStrip(); } else { el.hero.innerHTML = ''; el.led.innerHTML = ''; }
      switch (S.phase) {
        case 'intro': h = renderIntro(); break;
        case 'idea': h = renderIdeaPick(); break;
        case 'team': h = renderTeam(); break;
        case 'vest': h = renderVest(); break;
        case 'iv': h = renderIV(); break;
        case 'ivres': h = renderIVRes(); break;
        case 'deal': h = renderDeal(); break;
        case 'week': h = S.sub === 'plan' ? renderPlan() : renderReport(); break;
        case 'dd': h = renderDD(); break;
        case 'closed': h = renderClosed(); break;
        case 'turn': h = S.sub === 'plan' ? renderTurn() : renderTurnReport(); break;
        default: h = '';
      }
      var key = S.phase + '|' + S.sub + '|' + S.week + '|' + S.turn + '|' + S.iv.picks.length;
      /* the drawing steps out of the desk before the desk is redrawn, so the live view is never thrown away */
      if (el.desk.contains(el.tw)) el.stfig.appendChild(el.tw);
      el.desk.innerHTML = end ? '' : '<div class="yb-card' + (key !== ui.key ? ' lk-in' : '') + '">' + h + '</div>';
      ui.key = key;
      if (!pre && !end) renderInst();
      if (!end) { homeScene(); el.end.innerHTML = ''; }
      renderFeed();
      el.jour.querySelector('.yb-reset').textContent = confirmReset ? 'Sure? This batch will be lost' : 'Start a new batch';
      el.jour.querySelector('.yb-reset').hidden = end;
      wireSegs();
      K.sfill(root);
      if (end && !el.end.firstChild) renderEnd();
      else paint();
      if (end) endScene();
      sync3D();
      if (!X3.twp) watch3D(el.tw);
      if (focusSel !== false) {
        var t = focusSel ? root.querySelector(focusSel) : null;
        if (t && t.disabled) t = t.parentNode.querySelector('output') || null;
        if (t) K.focus(t, { scroll: false }); else if (!end) K.focus(el.desk.querySelector('.yb-h'), { scroll: true });
      }
    }
    /* the live text a control just changed, said once: re-rendered nodes are new nodes, and new live regions stay silent */
    function sayText(sel) { var n = root.querySelector(sel); if (n && n.textContent) K.say(n.textContent); }
    var sayT = 0;
    function sayLater(sel) { clearTimeout(sayT); sayT = setTimeout(function () { sayText(sel); }, 450); }
    function wireSegs() {
      Array.prototype.forEach.call(root.querySelectorAll('.yb-desk [data-seg]'), function (sg) {
        var k = sg.getAttribute('data-seg');
        K.seg(sg, function (v) {
          if (k === 'amt') { ddPicks().amt = +v; render('[data-seg="amt"] [aria-checked="true"]'); sayText('.yb-desk .yb-preview'); }
          else if (k === 'target') { rnd().target = +v; render('[data-seg="target"] [aria-checked="true"]'); }
          else if (k === 'order') { rnd().order = v; render('[data-seg="order"] [aria-checked="true"]'); }
          else if (k === 'termA') { ui.termA = +v; render('[data-seg="termA"] [aria-checked="true"]'); sayText('.yb-desk .yb-preview'); }
          else { var p = turnPlan(); p[k] = k === 'focus' ? v : +v; render('[data-seg="' + k + '"] [aria-checked="true"]'); if (k === 'focus' || k === 'price') sayText('[data-hint="' + k + '"]'); }
        });
      });
    }
    function rnd() {
      if (!ui.round || ui.round.w !== S.week) ui.round = { w: S.week, target: S.raise.target, cap: S.raise.cap, order: S.raise.order };
      return ui.round;
    }

    /* ---------- events: delegated, guarded, no propagation games ---------- */
    K.on(root, 'click', '[data-act]', function (ev, b) {
      if (b.disabled || b.closest('.yb-scene')) return;
      var a = b.getAttribute('data-act');
      if (a !== 'reset') confirmReset = false;
      switch (a) {
        case 'begin': if (S.phase !== 'intro') start(newSeed()); act({ t: 'begin' }); break;
        case 'resume': var sv = store.get(); if (sv && sv.log) { start(sv.seed, sv.log); render(); } break;
        case 'idea': act({ t: 'idea', id: b.getAttribute('data-id') }); break;
        case 'team': act({ t: 'team', m: b.getAttribute('data-m') }); break;
        case 'vest': act({ t: 'vest', v: b.getAttribute('data-v') === '1' }); break;
        case 'iv': act({ t: 'iv', pick: +b.getAttribute('data-pick') }); break;
        case 'ok': act({ t: 'ok' }); break;
        case 'deal': act({ t: 'deal' }); break;
        case 'run':
          var ra = { t: 'run', plan: curPlan() };
          if (S.week > 12) { var rr = rnd(); ra.round = { target: rr.target, cap: rr.cap, order: rr.order }; }
          ui.pivot = false; act(ra); break;
        case 'same': ui.plan = { w: S.week, p: cleanPlan(S, S.lastPlan) }; render('[data-act="run"]'); break;
        case 'pivotopen': ui.pivot = !ui.pivot; render(ui.pivot ? '.yb-pivot .lk-opt' : '[data-act="pivotopen"]'); break;
        case 'pivot': ui.pivot = false; act({ t: 'pivot', to: b.getAttribute('data-to') }); break;
        case 'ev': act({ t: 'ev', c: +b.getAttribute('data-c') }, '.yb-out'); break;
        case 'next': act({ t: 'next' }); break;
        case 'offer': act({ t: 'offer', k: +b.getAttribute('data-k'), c: b.getAttribute('data-c') }, S.raise.offers.length > 1 ? '.yb-offer [data-act="offer"]' : '[data-act="next"]'); break;
        case 'signall': act({ t: 'signall' }, '[data-act="next"]'); break;
        case 'close': act({ t: 'close' }); break;
        case 'dd': var d = ddPicks(); act({ t: 'dd', sent: d.sent, metric: d.metric, amt: d.amt, cap: d.cap }); break;
        case 'skip': act({ t: 'skip' }); break;
        case 'turn': var tp = turnPlan(); act({ t: 'turn', hire: tp.hire, spend: tp.spend, focus: tp.focus, price: tp.price, offsite: tp.offsite, sa: tp.sa }); break;
        case 'term': act({ t: 'term', A: ui.termA || .2 }); ui.termA = null; break;
        case 'decline': act({ t: 'decline' }); break;
        case 'labyc': LAB = { S: 15, o: 8, A: 25, P: 10, Spr: 15, cap: LAB.cap }; X3.src = 'lab'; labCalc(); K.say('Loaded YC’s worked example: founders keep 47.38%.'); break;
        case 'reset':
          if (!confirmReset) { confirmReset = true; b.textContent = 'Sure? This batch will be lost'; return; }
          confirmReset = false; store.clear(); start(newSeed()); render(); break;
      }
    });
    K.on(root, 'click', '[data-step]', function (ev, b) {
      if (b.disabled) return;
      var id = b.getAttribute('data-a'), d = +b.getAttribute('data-step'), P = curPlan(), A = null;
      ACTS.forEach(function (x) { if (x.id === id) A = x; });
      var next = P[id] + d, free = freeAt(S, S.week);
      if (next < 0 || (A.max && next > A.max) || (d > 0 && (why(S, id, P) || planCost(P) + (A.cost || 1) > free))) return;
      P[id] = next;
      if (id === 'launch' && !next) { var P2 = cleanPlan(S, P); ACTS.forEach(function (x) { P[x.id] = P2[x.id]; }); }
      render('[data-a="' + id + '"][data-step="' + d + '"]');
      sayText('.yb-desk .yb-tokl');
    });
    K.on(root, 'click', '[data-hire]', function (ev, b) {
      if (b.disabled) return;
      var p = turnPlan(); p.hire = clamp(p.hire + (+b.getAttribute('data-hire')), S.hires.length ? -1 : 0, 3);
      render('[data-hire="' + b.getAttribute('data-hire') + '"]');
    });
    K.on(root, 'click', '[data-dd]', function (ev, b) {
      var d = ddPicks(), k = b.getAttribute('data-dd'), v = b.getAttribute('data-v');
      d[k] = k === 'sent' ? +v : v;
      if (d.sent != null && d.metric != null && d.cap == null) d.cap = M.round(ddScore(S, d.sent).V);
      render('[data-dd="' + k + '"][data-v="' + v + '"]');
      if (d.sent != null && d.metric != null) K.say('Wren’s read: ' + wrenRead(ddScore(S, d.sent)) + ' ' + ddPreview());
    });
    K.on(root, 'change', '[data-chk]', function (ev, i) { var p = turnPlan(); p[i.getAttribute('data-chk')] = !!i.checked; render('[data-chk="' + i.getAttribute('data-chk') + '"]'); });
    K.on(root, 'input', 'input[type=range]', function (ev, r) {
      var v = +r.value, k = r.getAttribute('data-range'), lk = r.getAttribute('data-lab');
      if (lk) { LAB[lk] = v; X3.src = 'lab'; labCalc(); return; }
      if (k === 'ddcap') { ddPicks().cap = v; root.querySelector('#yb-ddcapo').textContent = capM(v); r.setAttribute('aria-valuetext', capM(v) + ' post-money cap'); var pv = root.querySelector('.yb-preview'); if (pv) { pv.textContent = ddPreview(); sayLater('.yb-desk .yb-preview'); } }
      if (k === 'rcap') { rnd().cap = v; root.querySelector('#yb-rcapo').textContent = capM(v); r.setAttribute('aria-valuetext', capM(v) + ' post-money cap'); }
      K.sfill(r.parentNode);
    });
    K.on(root, 'click', '.yb-read[data-note]', function (ev, b) { shelf.notes.open(b.getAttribute('data-note')); });
    K.on(root, 'toggle', 'details', function (ev, d) {
      if (d.classList.contains('yb-lab') && d.open) labCalc();
      var k = d.getAttribute('data-det');
      if (k) { ui.open[k] = d.open; if (d.open) paint(); }
    });

    K.repaint(paint, root);
    start(newSeed());
    render(false);
    DBG.scenes = function () { var c = root.querySelector('.yb-cyl'); return Promise.all([boot3D(el.tw), c && boot3D(c)]); };
    DBG.x3 = X3; DBG.snaps = function () { return snaps; };
    DBG.state = function () { return { seed: seed, log: log.slice(), phase: S.phase, week: S.week, turn: S.turn, MRR: S.MRR, cash: S.cash, ending: S.ending }; };
    DBG.open = function (sd, lg) { start(sd, lg || []); drainNotes(); render(); return DBG.state(); };
    DBG.sim = function (sd, kind, id, mode) {
      var R = create(sd), pre = [{ t: 'begin' }, { t: 'idea', id: id || R.pd.deal3[0] }, { t: 'team', m: mode || 'friend' }, { t: 'vest', v: true }, { t: 'iv', pick: 0 }, { t: 'iv', pick: 0 }, { t: 'iv', pick: 0 }, { t: 'ok' }, { t: 'deal' }];
      pre.forEach(function (a) { apply(R, a); });
      return runBot(R, kind || 'playbook').sum;
    };
    return {
      pause: function () {},
      resume: function () { paint(); },
      destroy: function () { if (X3.io) X3.io.disconnect(); if (X3.tw) X3.tw.destroy(); if (X3.cy) X3.cy.destroy(); store.set({ v: 1, seed: seed, log: log, done: !!(S && S.phase === 'end'), runs: runs, best: best }); }
    };
  }
  K.mount(SLUG, null, init);
})();
