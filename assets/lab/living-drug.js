/* The living drug (machine 43): a CAR-T program from the antigen to the access readout.
   Educational model only. Every engine number is a labeled model assumption; the case file keeps the
   real reported facts, with sources, separate from the fiction. No doses, no thresholds, no protocols.
   Registers with LAB_KIT.mount('living-drug'); prefix lv-. ES5, no build step. */
(function () {
  'use strict';
  var K = window.LAB_KIT;
  if (!K || K.v < 1) return;
  var SLUG = 'living-drug', F = K.fmt;

  var DISC = 'Educational model. Not medical advice, not a treatment protocol, and not a guide to any real decision. ' +
    'Drug classes are named because they are part of the public history of this field. The machine gives no doses and no instructions.';

  /* ---------- Act I: the targets. pop is addressable patients a year, in thousands (model assumption). ---------- */
  var LV_TARGETS = {
    cd19: { nm: 'CD19', dis: 'B-cell acute lymphoblastic leukemia', kind: 'liquid',
      dens: 1.00, esc: 0.25, tme: 1.00, traffic: 1.00, oot: 0.10, pop: 8, reg: 1.15, crRate: 0.62,
      ootKind: 'normal B cells', cellT: 'blast', cellH: 'b', hn: 'B cells',
      why: 'On every B cell and on almost nothing else you need. The reason this whole field exists.' },
    bcma: { nm: 'BCMA', dis: 'relapsed multiple myeloma', kind: 'liquid',
      dens: 0.85, esc: 0.30, tme: 0.90, traffic: 0.95, oot: 0.15, pop: 14, reg: 1.10, crRate: 0.55,
      ootKind: 'normal plasma cells', cellT: 'plasma', cellH: 'plasma', hn: 'Plasma cells',
      why: 'Plasma-cell restricted, a bigger population, and relapse is the rule rather than the exception.' },
    cldn: { nm: 'CLDN18.2', dis: 'advanced gastric and gastroesophageal cancer', kind: 'solid',
      dens: 0.60, esc: 0.35, tme: 0.55, traffic: 0.70, oot: 0.30, pop: 40, reg: 0.85, crRate: 0.10,
      ootKind: 'the normal lining of the stomach', cellT: 'solid', cellH: 'gut', hn: 'Stomach lining',
      why: 'A solid tumor with an unusually tidy antigen: in normal tissue it sits on the differentiated lining of the stomach.' },
    gd2: { nm: 'GD2', dis: 'diffuse midline glioma', kind: 'solid', route: true,
      dens: 0.70, esc: 0.30, tme: 0.45, traffic: 0.55, oot: 0.35, pop: 3, reg: 0.90, crRate: 0.05,
      ootKind: 'peripheral nerve', cellT: 'solid', cellH: 'nerve', hn: 'Nerve',
      why: 'A children’s brain tumor with no good options. The cells have to get into the central nervous system.' },
    her2: { nm: 'HER2', dis: 'metastatic colorectal cancer', kind: 'solid', hard: true,
      dens: 0.55, esc: 0.40, tme: 0.50, traffic: 0.60, oot: 0.85, pop: 60, reg: 0.80, crRate: 0.08,
      ootKind: 'the lining of the lung', cellT: 'solid', cellH: 'lung', hn: 'Lung lining',
      why: 'A huge population, a strong antigen, and a normal-tissue pattern linked to a patient’s death in a real trial.' }
  };
  var TORDER = ['cd19', 'bcma', 'cldn', 'gd2', 'her2'];

  /* ---------- Act II: the receptor, one domain at a time ---------- */
  var LV_BINDER = {
    mur: { nm: 'Murine, high affinity', pot: 0.20, tox: 0.15, imm: 0.35, per: 1.00,
      s: 'Hits hard, and the immune system may eventually notice that the receptor is not yours.' },
    hum: { nm: 'Humanized, moderate', pot: 0.08, tox: 0.05, imm: 0.10, per: 1.00,
      s: 'The boring middle. Boring is a strategy.' },
    fast: { nm: 'Fast off-rate, low affinity', pot: -0.05, tox: -0.18, imm: 0.08, per: 1.15, dens: 0.75, esc: 1.15,
      s: 'Lets go quickly, so the cell activates less per contact, exhausts less and shouts less. It gives up some response, more against dim targets, and lets more antigen-low relapses through.' }
  };
  var LV_HTM = {
    cd8: { nm: 'CD8 alpha hinge and transmembrane', pot: -0.02, tox: -0.10,
      s: 'Reported to produce less cytokine and less activation-induced death, with similar killing.' },
    cd28h: { nm: 'CD28 hinge and transmembrane', pot: 0.05, tox: 0.10,
      s: 'More signal per engagement, and more of everything that comes with signal.' }
  };
  var LV_COSTIM = {
    cd28: { nm: 'CD28', exp: 1.60, per: 0.60, tox: 0.18, dens: 1.06, mfg: 1.00,
      s: 'Fast, glycolytic, enormous early expansion, shorter stay.' },
    bb: { nm: '4-1BB', exp: 1.00, per: 1.60, tox: 0.00, dens: 1.00, mfg: 1.00,
      s: 'Slower peak, memory-like metabolism, longer persistence.' },
    dual: { nm: 'CD28 and 4-1BB, armored', exp: 1.35, per: 1.30, tox: 0.22, dens: 1.03, mfg: 0.85,
      tmeBonus: 0.25, trust: -5, dev: 14,
      s: 'Everything at once, plus a year of process development and a regulator who now has questions.' }
  };
  var LV_VECTOR = {
    retro: { nm: 'Gammaretroviral', per: 1.00, cogs: 1.00, supply: 0.25, mfgOk: 0.96,
      s: 'Needs dividing cells. Decades of clinical experience behind it.' },
    lenti: { nm: 'Lentiviral', per: 1.00, cogs: 1.15, supply: 0.30, mfgOk: 1.00,
      s: 'Transduces resting cells too. Costs more per batch.' },
    nonv: { nm: 'Non-viral (transposon or messenger RNA)', per: 0.70, cogs: 0.55, supply: 0.05, mfgOk: 0.92,
      s: 'Cheap and fast. If it is messenger RNA the receptor fades, and you are in the repeat-dosing business.' }
  };
  var LD = { none: 0.45, cy: 0.80, cyflu: 1.00 };
  var LDN = { none: 'None', cy: 'Cyclophosphamide alone', cyflu: 'Cyclophosphamide with fludarabine' };
  var DLN = ['DL1', 'DL2', 'DL3', 'DL4', 'DL5'];
  var MDS = [0.25, 0.5, 1, 2.5, 5];          /* model exposure units, never shown as cells */
  var TOXN = { reactive: 'Treat severe events only', earlyIL6: 'Interleukin-6 receptor blockade early',
    earlySteroid: 'Corticosteroids early' };
  var BURDN = { asis: 'Take patients as they come', bridge: 'Bridge first, then infuse' };

  /* ---------- the seeded event deck ---------- */
  var LV_EVENTS = [
    { id: 'vector', t: 'A vector supply crunch',
      l: 'Your vector supplier loses a suite to a contamination event. Everybody in the field is queueing behind the same three manufacturers.',
      ch: function (S) {
        var o = [], f = crunchOf(S);
        if (!S.mfg.secondSource) o.push({ l: 'Qualify a second vector source now', cost: 20, s: 'Costs ' + F.M(20, 0) + ', a rush premium over the usual ' + F.M(14, 0) + ', and eight weeks of paperwork. It is the boring answer, and it is the right one.', act: function (s) { s.cash -= 20; s.mfg.secondSource = true; advance(s, 2); if (s.ev.flags.crunch) { s.mfg.slots = s.ev.flags.slots0 || s.mfg.slots; s.ev.flags.slots0 = 0; s.ev.flags.crunch = 0; } } });
        o.push({ l: 'Ride it out', s: S.mfg.secondSource ? 'Your second source covers the gap. This is what it was for.'
          : S.mfg.platform !== 'auto' ? 'Your platform does not make a batch per patient, so the crunch slows the research and leaves the queue alone.'
          : S.cx.vector === 'nonv' ? 'You do not depend on a viral vector, so the crunch mostly passes you by: your slots run at about ' + F.pct(f, 0) + ' of capacity.'
            : 'Your slots run at about ' + F.pct(f, 0) + ' of capacity until somebody qualifies a second source. Patients wait in the chair, and some of them do not have that long.',
          act: function (s) { if (!s.mfg.secondSource && s.mfg.platform === 'auto') { s.ev.flags.crunch = 1; s.ev.flags.slots0 = s.mfg.slots; s.mfg.slots = Math.max(1, Math.round(s.mfg.slots * crunchOf(s))); } } });
        return o;
      } },
    { id: 'secondary', t: 'A class warning arrives',
      l: 'The regulator adds a warning about T-cell cancers to the whole class of gene-modified autologous products. Your investigators want to know what you are going to do about long-term follow-up.',
      pre: function (s) { s.trust -= 6; },
      ch: function (S) {
        return [
          { l: 'Fund a fifteen-year follow-up registry', cost: 8, s: 'Costs $8M. Nobody gets a press release out of it.', act: function (s) { s.cash -= 8; s.trust += 8; s.ev.flags.registry = 1; } },
          { l: 'Do the minimum the label requires', s: S.piv.done ? 'Cheaper now. Payers and treating centers will notice.' : 'Cheaper now. The question comes back at the pivotal review.', act: function (s) { s.ev.flags.minimal = 1; if (s.piv.done) s.trust -= 3; } }
        ];
      } },
    { id: 'rems', t: 'The risk-management program is lifted',
      l: 'The regulator decides the field knows how to manage these toxicities and drops the special certification and stocking rules for approved products. The monitoring window shortens.',
      pre: function (s) { s.ev.flags.rems = 1; } },
    { id: 'earlier', t: 'A rival moves the therapy earlier',
      l: 'A competitor reads out a randomized trial in an earlier line and wins. The eligible population grows by a quarter, and the thing you will be compared against just got better.',
      pre: function (s) { s.ev.flags.earlier = 1; } },
    { id: 'escape', t: 'The relapses come back antigen negative',
      l: 'Your first relapses are not resistance to the cells. The cancer has stopped showing the protein you aimed at.',
      ch: function (S) {
        return [
          { l: 'Add a second target to the construct', cost: 40, s: 'Costs $40M and twelve months. It also halves your escape rate for the rest of the run.', act: function (s) { s.cash -= 40; advance(s, 12); s.cx.dual2 = true; } },
          { l: 'Accept it and read out', s: 'The escape rate stands. Somebody else will solve this, possibly you, later.', act: function () {} }
        ];
      } },
    { id: 'immuno', t: 'An immune response against your receptor',
      l: 'Some patients are clearing the cells early. The assay says their own T cells have learned to recognize the receptor you built.',
      pre: function (s) { if (s.cx.binder === 'mur') s.ev.flags.immPer = 1; },
      ch: function (S) {
        var o = [];
        if (S.cx.binder === 'mur') o.push({ l: 'Humanize the binder', cost: 18, s: 'Costs $18M and eight months, and restores persistence.', act: function (s) { s.cash -= 18; advance(s, 8); s.cx.binder = 'hum'; s.ev.flags.immPer = 0; } });
        o.push({ l: 'Note it and carry on', s: S.cx.binder === 'mur' ? 'Persistence takes the hit. The data will show it.' : 'Your binder was already human enough that the hit is small.', act: function () {} });
        return o;
      } },
    { id: 'quiet', t: 'A quiet year', l: 'Nothing happens. The cells do not care about your board meeting.' }
  ];

  /* lines said twice: in the copy and on the 3D drawings */
  var W_OOT = 'The receptor cannot tell a tumor from healthy tissue carrying the same protein.',
    W_OOS = 'A batch that misses specification forces a choice between discarding the only batch this patient has and releasing it under a special pathway.',
    W_CUL = 'A short culture leaves fitter, less differentiated cells. It is also likelier to miss the dose in a heavily pretreated patient, whose T cells are the raw material you were given rather than the raw material you wanted.',
    W_QUE = 'Each cohort of three shares the queue with four patients from the rest of the program, so slots turn into days, and days turn into patients who never get infused.',
    W_CRY = ' costs a little fitness and buys you distance, scheduling and a network. Fresh is slightly better product and a much smaller map',
    W_LOST = 'Every patient who is enrolled and not infused is in the denominator of the real world and out of the numerator of your paper.';

  /* ---------- field notes: twenty ideas, unlocked where you meet them ---------- */
  var S_ELIANA = { t: 'Maude et al., NEJM 2018 (ELIANA)', u: 'https://pubmed.ncbi.nlm.nih.gov/29385370/' };
  var S_ZUMA1 = { t: 'Neelapu et al., NEJM 2017 (ZUMA-1)', u: 'https://pubmed.ncbi.nlm.nih.gov/29226797/' };
  var S_ZUMA1_5 = { t: 'Blood 2023: five-year follow-up of ZUMA-1', u: 'https://pubmed.ncbi.nlm.nih.gov/36821768/' };
  var S_JULIET = { t: 'Schuster et al., NEJM 2019 (JULIET)', u: 'https://pubmed.ncbi.nlm.nih.gov/30501490/' };
  var S_ZUMA7 = { t: 'NEJM 2022: axicabtagene ciloleucel as second-line therapy (ZUMA-7)', u: 'https://pubmed.ncbi.nlm.nih.gov/34891224/' };
  var S_ZUMA7OS = { t: 'NEJM 2023: survival with axicabtagene ciloleucel (ZUMA-7)', u: 'https://pubmed.ncbi.nlm.nih.gov/37272527/' };
  var S_ASTCT = { t: 'Lee et al., ASTCT consensus grading, 2019', u: 'https://pubmed.ncbi.nlm.nih.gov/30592986/' };
  var S_CAPPELL = { t: 'Cappell and Kochenderfer, Nat Rev Clin Oncol 2021', u: 'https://pubmed.ncbi.nlm.nih.gov/34230645/' };
  var S_KAWA = { t: 'Kawalekar et al., Immunity 2016', u: 'https://pubmed.ncbi.nlm.nih.gov/26885860/' };
  var S_LONG = { t: 'Long et al., Nature Medicine 2015', u: 'https://pubmed.ncbi.nlm.nih.gov/25939063/' };
  var S_IMAI = { t: 'Imai et al., Leukemia 2004', u: 'https://pubmed.ncbi.nlm.nih.gov/14961035/' };
  var S_ALAB = { t: 'Alabanza et al., Molecular Therapy 2017', u: 'https://pubmed.ncbi.nlm.nih.gov/28807568/' };
  var S_GIAV = { t: 'Giavridis et al., Nature Medicine 2018', u: 'https://pubmed.ncbi.nlm.nih.gov/29808005/' };
  var S_NOREL = { t: 'Norelli et al., Nature Medicine 2018', u: 'https://pubmed.ncbi.nlm.nih.gov/29808007/' };
  var S_TURTLE = { t: 'Turtle et al., J Clin Invest 2016', u: 'https://www.jci.org/articles/view/85309' };
  var S_PARK = { t: 'Park et al., NEJM 2018', u: 'https://pubmed.ncbi.nlm.nih.gov/29385376/' };
  var S_MORGAN = { t: 'Morgan et al., Molecular Therapy 2010', u: 'https://pubmed.ncbi.nlm.nih.gov/20179677/' };
  var S_SEER = { t: 'Blood Advances 2025: inequalities in CAR T-cell therapy access (SEER-Medicare)', u: 'https://pubmed.ncbi.nlm.nih.gov/40378343/' };
  var S_BLOODREV = { t: 'Kaparis et al., Blood Reviews 2026 (access review)', u: 'https://pubmed.ncbi.nlm.nih.gov/41448976/' };
  var S_YESC = { t: 'Yescarta prescribing information, DailyMed', u: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=9b70606e-b99c-4272-a0f1-b5523cce0c59' };
  var S_KYM = { t: 'Kymriah prescribing information, DailyMed', u: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=aad3ba54-dfd3-4cb3-9e2b-c5ef89559189' };
  var S_AUC = { t: 'Aucatzyl prescribing information, DailyMed', u: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4fef6986-b988-45e4-8c20-b14f0ef1f538' };
  var S_FELIX = { t: 'NEJM 2024: obecabtagene autoleucel in adults with B-cell ALL (FELIX)', u: 'https://pubmed.ncbi.nlm.nih.gov/39602653/' };
  var S_CARPALL = { t: 'Ghorashian et al., Nature Medicine 2019 (CARPALL)', u: 'https://pubmed.ncbi.nlm.nih.gov/31477906/' };
  var S_FDA24 = { t: 'FDA safety labeling change notification, January 19, 2024', u: 'https://www.fda.gov/media/175624/download' };
  var S_REMS = { t: 'AABB: FDA eliminates REMS for approved CAR T-cell therapies', u: 'https://www.aabb.org/news-resources/news/article/2025/06/30/fda-eliminates-rems-for-approved-car-t-cell-therapies' };
  var S_NOV = { t: 'Novartis media release, August 30, 2017', u: 'https://www.novartis.com/news/media-releases/novartis-receives-first-ever-fda-approval-car-t-cell-therapy-kymriahtm-ctl019-children-and-young-adults-b-cell-all-refractory-or-has-relapsed-least-twice' };
  var S_HMPI = { t: 'Pulice and Schulman, HMPI 2026: CAR-T therapy, escalating costs in an expanding market', u: 'https://hmpi.org/2026/02/18/car-t-therapy-escalating-costs-in-an-expanding-market/' };
  var S_MEDLET = { t: 'The Medical Letter, December 23, 2024: obecabtagene autoleucel (Aucatzyl)', u: 'https://secure.medicalletter.org/TML-article-1718f' };
  var S_BPD = { t: 'BioPharma Dive, December 6, 2018', u: 'https://www.biopharmadive.com/news/in-car-t-manufacturing-a-hurdle-novartis-has-yet-to-clear/543624/' };
  var S_NCI = { t: 'National Cancer Institute: CAR T cells', u: 'https://www.cancer.gov/about-cancer/treatment/research/car-t-cells' };
  var S_SATRI = { t: 'The Lancet 2025: satri-cel against physician\u2019s choice (CT041-ST-01)', u: 'https://pubmed.ncbi.nlm.nih.gov/40460847/' };
  var S_NMPA = { t: 'OncLive, June 22, 2026', u: 'https://www.onclive.com/view/china-s-nmpa-approves-first-car-t-cell-therapy-for-cldn18--2-her2-advanced-gastric-gej-adenocarcinoma' };
  var S_GD2 = { t: 'Nature 2024 (online; print 2025): intravenous and intracranial GD2-CAR T cells', u: 'https://pubmed.ncbi.nlm.nih.gov/39537919/' };
  var S_UCART = { t: 'Blood Advances 2025: gene-edited universal CAR19, long-term outcomes', u: 'https://pubmed.ncbi.nlm.nih.gov/40601899/' };
  var S_33 = { t: 'Clinical Cancer Research 2016: rendering the 3+3 design to rest', u: 'https://pubmed.ncbi.nlm.nih.gov/27250933/' };
  var S_FDALIST = { t: 'FDA: approved cellular and gene therapy products', u: 'https://www.fda.gov/vaccines-blood-biologics/cellular-gene-therapy-products/approved-cellular-and-gene-therapy-products' };
  var S_AJMC = { t: 'AJMC, July 2026: CAR T-cell therapy in 2026', u: 'https://www.ajmc.com/view/car-t-cell-therapy-in-2026-evolving-evidence-expanding-indications-path-to-broader-access' };
  var S_TROGO = { t: 'Hamieh et al., Nature 2019 (trogocytosis)', u: 'https://pubmed.ncbi.nlm.nih.gov/30918399/' };
  var S_CASTLE = { t: 'Nature Medicine 2026: the CASTLE basket trial', u: 'https://pubmed.ncbi.nlm.nih.gov/41501497/' };
  var S_LUPUS = { t: 'Nature Medicine 2022: anti-CD19 CAR T cells in refractory lupus', u: 'https://pubmed.ncbi.nlm.nih.gov/36109639/' };
  var S_CLDN = { t: 'Clinical Cancer Research 2008: claudin-18 splice variant 2 as a pan-cancer target', u: 'https://pubmed.ncbi.nlm.nih.gov/19047087/' };
  var S_SCHOLAR = { t: 'Crump et al., Blood 2017 (SCHOLAR-1)', u: 'https://pubmed.ncbi.nlm.nih.gov/28774879/' };
  var S_CTL019 = { t: 'Porter et al., NEJM 2011', u: 'https://pubmed.ncbi.nlm.nih.gov/21830940/' };
  var S_MAUDE14 = { t: 'NEJM 2014: sustained remissions in leukemia', u: 'https://pubmed.ncbi.nlm.nih.gov/25317870/' };
  var S_GRUPP13 = { t: 'Grupp et al., NEJM 2013', u: 'https://pubmed.ncbi.nlm.nih.gov/23527958/' };
  var S_ESHHAR = { t: 'Eshhar et al., PNAS 1993', u: 'https://pubmed.ncbi.nlm.nih.gov/8421711/' };
  var S_GROSS = { t: 'Gross, Waks and Eshhar, PNAS 1989', u: 'https://pubmed.ncbi.nlm.nih.gov/2513569/' };
  var S_MAHER = { t: 'Maher et al., Nature Biotechnology 2002', u: 'https://pubmed.ncbi.nlm.nih.gov/11753365/' };
  var S_ICASP = { t: 'Di Stasi et al., NEJM 2011 (inducible safety switch)', u: 'https://pubmed.ncbi.nlm.nih.gov/22047558/' };
  var S_LEE15 = { t: 'Lee et al., Lancet 2015', u: 'https://pubmed.ncbi.nlm.nih.gov/25319501/' };

  var NOTES = [
    { id: 'car', term: 'Chimeric antigen receptor', hint: 'you open the receptor bench',
      note: 'One engineered protein that gives a T cell a new target. Outside the cell, an antibody fragment that grips a surface protein; then a hinge and a transmembrane segment; then, inside, a costimulatory domain and the CD3 zeta signaling tail borrowed from the normal T-cell receptor. Chimeric receptors were built in the late 1980s and early 1990s; putting a costimulatory domain inside the cell is what made these cells survive and proliferate in patients.',
      src: [S_GROSS, S_ESHHAR, S_MAHER] },
    { id: 'scfv', term: 'The binder, affinity and off-rate', hint: 'you choose a binder',
      note: 'The binder is usually a single-chain antibody fragment. Higher affinity is not automatically better: a receptor that holds on tightly signals harder, which means more killing, more cytokine and more exhaustion, and it also makes a low level of the same protein on healthy tissue dangerous. A lower-affinity anti-CD19 receptor was reported to expand more, persist longer and cause no severe cytokine release syndrome in a pediatric trial, and the leukemia product built on that design was approved in 2024.',
      src: [S_CARPALL, S_FELIX, S_AUC] },
    { id: 'hinge', term: 'Hinge and transmembrane domain', hint: 'you choose a hinge',
      note: 'The boring middle of the receptor is not neutral. In a published comparison of otherwise similar anti-CD19 receptors, constructs using a CD8 alpha hinge and transmembrane region produced lower cytokine levels and less activation-induced cell death than CD28-derived ones, while clearing established tumors in mice about as well.',
      src: [S_ALAB] },
    { id: 'costim', term: 'Costimulation: CD28 or 4-1BB', hint: 'you choose a costimulatory domain',
      note: 'CD28 drives a fast, glycolytic, effector-like cell: huge early expansion, shorter persistence. 4-1BB drives a memory-like metabolism with more mitochondrial capacity: slower peak, longer stay, and less exhaustion under constant receptor signaling. Both are in approved, curative products. A review of the two domains reported similar anticancer activity across the approved anti-CD19 products, with higher reported neurological toxicity rates for the CD28 products, probably from several causes rather than the domain alone. This machine sharpens the difference so you can see it. The literature is less tidy.',
      src: [S_KAWA, S_LONG, S_CAPPELL] },
    { id: 'vector', term: 'The vector', hint: 'you choose a vector',
      note: 'The receptor gene has to get into the cell. Gammaretroviral vectors need dividing cells; lentiviral vectors also transduce resting cells. Approved products use both: the first approved leukemia product is lentiviral, the first approved lymphoma product is gammaretroviral. Non-viral methods are cheaper, and a messenger RNA receptor is transient by design, which turns a one-time therapy into a repeat-dosing therapy.',
      src: [S_KYM, S_YESC] },
    { id: 'oot', term: 'On-target, off-tumor toxicity', hint: 'you choose a target that healthy tissue also carries',
      note: W_OOT + ' In a published 2010 case report, a patient with metastatic colon cancer who received a very large dose of cells carrying a high-affinity receptor against a protein expressed at a low level on normal lung lining went into respiratory distress within fifteen minutes and died five days later. Target choice, binder affinity, delivery route and the first dose level are safety decisions, not engineering preferences.',
      src: [S_MORGAN] },
    { id: 'v2v', term: 'Leukapheresis and vein-to-vein time', hint: 'you open the factory',
      note: 'The patient’s white cells are collected, shipped, engineered, grown, tested, released, shipped back and infused. The whole span is called vein-to-vein time. One approved product’s label reports a median of 17 to 18 days from collection to delivery of the product to the treating site, with a range running past seven weeks. Patients with aggressive disease can progress inside that window, which is why a therapy’s effectiveness is partly a property of its supply chain.',
      src: [S_YESC, S_NCI] },
    { id: 'oos', term: 'Out of specification', hint: 'a batch of yours misses its release criteria',
      note: 'Every batch has to meet release criteria: cell number, viability, transduction, sterility, potency. In the registration trials, manufacturing failed for about 9 percent of enrolled patients for one product and for 1 of 111 for another, and early in the first product’s commercial life batches that were safe but outside the tighter commercial viability specification were supplied at no charge. ' + W_OOS,
      src: [S_KYM, S_ZUMA1, S_BPD] },
    { id: 'ld', term: 'Lymphodepletion', hint: 'you set the conditioning regimen',
      note: 'Chemotherapy given before the cells, to reduce the competing lymphocytes and the cytokines they consume. Adding fludarabine to cyclophosphamide was reported to improve persistence and disease-free survival in an adult leukemia study, and it also increases cytopenia and infection risk. The therapy is the cells; the conditioning decides how well they take.',
      src: [S_TURTLE, S_YESC] },
    { id: 'dose', term: '3+3, DLT, MTD, RP2D', hint: 'you finish your first cohort',
      note: 'A conventional phase 1 escalation: three patients at a dose level; no dose-limiting toxicity means escalate, one means expand to six, two or more means that level is too high; the level below is expanded to six, and if no more than one of those six has a dose-limiting toxicity it is the maximum tolerated dose, which is often, not always, the recommended phase 2 dose. It is slow, it treats few patients at the dose that matters, and statisticians have argued for years for better designs. For a living drug the dose is only half the story, because the real exposure is how much the cells expand after they go in.',
      src: [S_33] },
    { id: 'crs', term: 'Cytokine release syndrome', hint: 'a patient of yours has a cytokine event',
      note: 'Fever, then falling blood pressure, then trouble getting enough oxygen, driven by cytokines from the activated T cells and, importantly, from the patient’s own macrophages and monocytes. The 2019 consensus grading system requires fever for the diagnosis and sets the grade by the more severe of the circulatory and the respiratory problem. Before that system three or four incompatible scales were in use, which is why toxicity numbers from different years do not compare cleanly.',
      src: [S_ASTCT, S_GIAV] },
    { id: 'icans', term: 'ICANS and the ICE score', hint: 'a patient of yours has a neurological event',
      note: 'Immune effector cell associated neurotoxicity syndrome: confusion, trouble finding words, tremor, sometimes seizures, usually a few days after the cytokine syndrome. It is graded in the same 2019 consensus, partly with a ten-point bedside assessment covering orientation, naming three objects, following a command, writing a sentence and counting backwards. The score is deliberately dull, because dull is repeatable at three in the morning.',
      src: [S_ASTCT] },
    { id: 'il6', term: 'Interleukin-6, interleukin-1 and the macrophage', hint: 'your protocol first uses a cytokine-directed drug',
      note: 'The first child treated for leukemia with these cells, in 2012, was rescued with an arthritis drug that blocks the interleukin-6 receptor, and that class is now standard for the cytokine syndrome. Two 2018 mouse studies then showed the driver cytokines come largely from the host’s own macrophages and monocytes, and that blocking interleukin-1 prevented both the cytokine syndrome and the delayed neurological toxicity, while interleukin-6 receptor blockade did not prevent the neurological one. The antibody is not expected to reach the central nervous system, which is the mechanistic reason the two syndromes need different tools.',
      src: [S_GIAV, S_NOREL, S_GRUPP13] },
    { id: 'escape', term: 'Antigen escape', hint: 'a relapse of yours comes back antigen negative',
      note: 'The cancer stops showing the protein you aimed at. After anti-CD19 therapy a large share of relapses are antigen negative, by mutation, alternative splicing, lineage switch, or because the T cell physically strips the protein off the tumor cell, a reversible process called trogocytosis that also blunts the T cells doing it. Dual targeting is the obvious answer and a second development program.',
      src: [S_TROGO, S_GRUPP13] },
    { id: 'burden', term: 'Disease burden and bridging', hint: 'you set the enrollment policy',
      note: 'How much cancer is present when the cells go in changes everything. In a phase 1 study of 53 adults with relapsed B-cell leukemia, 83 percent reached complete remission, and the patients with a low marrow burden had markedly less cytokine release syndrome and neurotoxicity and longer survival, with median overall survival of 20.1 months against 12.9 months for the whole cohort. So bridging therapy before infusion is part of the treatment, and it costs you time in the queue.',
      src: [S_PARK, S_TURTLE] },
    { id: 'pivotal', term: 'Single-arm or randomized evidence', hint: 'you choose the pivotal design',
      note: 'Single-arm trials with response-rate endpoints got this field to patients years earlier than a randomized program would have. Randomized trials came later and answered the harder question: in second-line lymphoma, median event-free survival was 8.3 months against 2.0 months for standard care, and the four-year overall survival was 54.6 against 46.0 percent. In solid tumors the first randomized trial of this modality reported median progression-free survival of 3.25 months against 1.77. All three of those are real wins, and they are not the same size.',
      src: [S_ZUMA7, S_ZUMA7OS, S_SATRI] },
    { id: 'pay', term: 'Outcomes-based payment', hint: 'you choose a payment model',
      note: 'For a one-time therapy priced in the hundreds of thousands, payers and manufacturers have experimented with paying only if the patient responds. The 2017 arrangement announced with the first approval tied payment for pediatric and young adult leukemia patients to a response by the end of the first month. The mechanism moves risk. It does not move the cost of making a living product one patient at a time.',
      src: [S_NOV, S_HMPI] },
    { id: 'access', term: 'Eligible and treated', hint: 'you reach the access readout',
      note: 'The gap between the label and the ward. In a SEER-Medicare analysis, 122 of 2,241 Medicare patients treated in the third line or later for diffuse large B-cell lymphoma between 2017 and 2020 received a CAR-T therapy, about 5.4 percent. Distance is part of it: the same analysis estimated that closing the gap between poor-access states, averaging 104 miles to the nearest authorized center, and better-access states at 34 miles would raise the number treated by 37.6 percent. A therapy can work in most of the people who receive it and still, in that analysis, reach a small minority of the people who qualified.',
      src: [S_SEER, S_BLOODREV] },
    { id: 'platform', term: 'Autologous, allogeneic, in vivo', hint: 'you reach the platform fork',
      note: 'Autologous means the patient is the raw material, so every dose is its own manufacturing run with its own queue. Allogeneic means a donor product made in advance, which needs gene editing to reduce graft-versus-host risk and still faces rejection by the patient’s immune system; children treated with gene-edited universal anti-CD19 cells have now been followed for years. In vivo approaches skip the factory by delivering the receptor gene inside the body with a vector or a lipid nanoparticle, and they are early.',
      src: [S_UCART, S_AJMC, S_NCI] },
    { id: 'secondary', term: 'The secondary cancer warning', hint: 'the class warning reaches your program',
      note: 'In January 2024 the United States regulator required a boxed warning about T-cell cancers on the approved BCMA- and CD19-directed autologous products as a class, after post-marketing and trial reports of mature T-cell cancers, some of them carrying the receptor. Long-term follow-up of gene-modified cells is part of this modality rather than a footnote, and a full risk conversation includes it next to the survival data.',
      src: [S_FDA24] }
  ];

  /* ---------- glossary: terms explained where they appear ---------- */
  var DEFS = {
    apheresis: { t: 'Leukapheresis', d: 'The collection step: blood is drawn, the white cells are separated out, and the rest is returned. Everything downstream starts with what comes out of that machine.', note: 'v2v' },
    scfv: { t: 'scFv', d: 'Single-chain variable fragment: the gripping end of an antibody, reduced to one protein chain so it can be built into a receptor.', note: 'scfv' },
    affinity: { t: 'Affinity and off-rate', d: 'How tightly the binder holds and how quickly it lets go. A fast off-rate means less signal per contact, which turns out to matter as much as how hard it grips.', note: 'scfv' },
    hinge: { t: 'Hinge and transmembrane', d: 'The stalk that holds the binder away from the cell and the segment that crosses the membrane. They set the geometry, and the geometry sets the signal.', note: 'hinge' },
    costim: { t: 'Costimulatory domain', d: 'The second signal, inside the cell. Without it, a receptor can recognize a target and then do very little about it.', note: 'costim' },
    zeta: { t: 'CD3 zeta', d: 'The signaling tail borrowed from the normal T-cell receptor. It is the part that says: this is a target, act.', note: 'car' },
    transduce: { t: 'Transduction', d: 'Getting the receptor gene into the cell, usually with a modified virus that can deliver but not replicate.', note: 'vector' },
    cryo: { t: 'Cryopreservation', d: 'Freezing the product, so collection, manufacture and infusion do not all have to happen in the same week in the same place.', note: 'v2v' },
    dlt: { t: 'Dose-limiting toxicity', d: 'A toxicity, defined in advance in the protocol, that says this dose level is too high. In this model it is a grade 4 cytokine or neurological event, a treatment-related death, a grade 4 event from healthy tissue recognition, or a grade 3 event that does not settle inside the window. Real definitions are broader still, which is part of why they are argued over for months.', note: 'dose' },
    mtd: { t: 'Maximum tolerated dose', d: 'The highest level at which no more than one of six patients has a dose-limiting toxicity.', note: 'dose' },
    rp2d: { t: 'Recommended phase 2 dose', d: 'The level you take forward. Usually the maximum tolerated dose, and for a living drug not necessarily the best one, because expansion inside the patient varies more than the dose you gave.', note: 'dose' },
    crs: { t: 'Cytokine release syndrome', d: 'Fever, then low blood pressure, then trouble oxygenating, from the cytokine storm that the activated cells and the patient’s own macrophages set off together.', note: 'crs' },
    icans: { t: 'ICANS', d: 'Immune effector cell associated neurotoxicity syndrome: confusion, word-finding trouble, tremor, sometimes seizures, usually a few days behind the cytokine syndrome.', note: 'icans' },
    burden: { t: 'Disease burden', d: 'How much cancer is in the body when the cells go in. It moves both the response and the toxicity, in opposite directions.', note: 'burden' },
    bridging: { t: 'Bridging therapy', d: 'Treatment given between collection and infusion, to hold the disease still while the batch is made.', note: 'burden' },
    tme: { t: 'Tumor microenvironment', d: 'The neighborhood around a solid tumor: short on oxygen, full of signals that switch T cells off. Liquid cancers have one too, but in the blood and marrow it is usually far less hostile than in a solid mass.', note: 'car' },
    orr: { t: 'Overall response rate', d: 'The share of patients whose tumor shrinks by the trial’s definition. It is the endpoint single-arm trials are built on; several early approvals in this field rested on it, some as regular approvals and some under accelerated approval, and it says nothing about how long the response lasts.', note: 'pivotal' },
    hr: { t: 'Hazard ratio', d: 'From a randomized trial: the rate of events in your arm divided by the rate in the comparator. Below 1 favors you, and how far below is the size of the win.', note: 'pivotal' },
    escape: { t: 'Antigen escape', d: 'The relapse that comes back without the protein you aimed at, so your receptor has nothing to hold.', note: 'escape' }
  };

  var TAKE = [
    'The receptor is four separate decisions (binder, hinge and transmembrane, costimulation, vector) and each one trades early force against durability. There is no setting that maximizes both.',
    'CD28 costimulation expands fast and fades; 4-1BB builds slowly and stays. Both are in approved, curative products, so the useful question is which failure mode you can afford.',
    'The toxicity comes from the same activation that does the curing, which is why grading, timing and the choice of cytokine to block matter more than trying to avoid it.',
    'An autologous cell therapy is a logistics company with a biology department. Vein-to-vein time, manufacturing slots and out-of-specification rates decide who gets treated.',
    'Disease burden at infusion changes both toxicity and survival, so buying time with bridging therapy is part of the treatment rather than a delay.',
    'Liquid cancers handed this field a clean, uniformly expressed antigen and an accessible target. Solid tumors take away all three advantages, so a genuine solid-tumor win currently looks like months of progression-free survival rather than a cure.',
    'Price is only one of the access variables. Distance to an authorized center, the number of centers, income and the payment model also shape who is treated.',
    'A therapy can work in most of the people who receive it and still, in one Medicare analysis of its early years, reach only about one in twenty of the people who qualified. Both facts are true at once, and only one of them shows up in the trial paper.'
  ];

  /* ---------- the case file: reported fact, model assumption, fiction ---------- */
  var CASE = {
    disclaimer: DISC,
    lede: 'This machine is built on the public record of one modality. Everything below is sorted into what has been reported, what the model assumes, and what is invented for the game.',
    asOf: 'September 30, 2026',
    facts: [
      { text: 'The first CAR-T therapy approved in the United States was tisagenlecleucel, cleared on August 30, 2017 for patients up to 25 years old with B-cell precursor acute lymphoblastic leukemia that was refractory or in second or later relapse. The manufacturer described it as both the first CAR-T therapy and the first therapy based on gene transfer approved by the FDA.', src: [S_NOV, S_FDALIST] },
      { text: 'In the pivotal pediatric leukemia trial, 75 infused patients were evaluable: the overall remission rate within three months was 81 percent, cytokine release syndrome occurred in 77 percent of patients, of whom 48 percent received an interleukin-6 receptor blocker, and neurological events occurred in 40 percent. Event-free survival at twelve months was 50 percent and overall survival 76 percent.', src: [S_ELIANA] },
      { text: 'In the pivotal refractory large B-cell lymphoma trial, 111 patients were enrolled, the product was successfully manufactured for 110 of them (99 percent) and administered to 101 (91 percent). The objective response rate was 82 percent with 54 percent complete responses, and grade 3 or higher cytokine release syndrome and neurological events occurred in 13 and 28 percent.', src: [S_ZUMA1] },
      { text: 'Five years later, that same cohort showed an 83 percent objective response rate, 58 percent complete responses, responses still ongoing in 31 percent, and an estimated five-year overall survival of 42.6 percent. Long persistence of B-cell aplasia turned out not to be required for a durable response.', src: [S_ZUMA1_5] },
      { text: 'For context, before this modality existed, a pooled analysis of 636 patients with refractory diffuse large B-cell lymphoma reported a 26 percent objective response rate, 7 percent complete responses, median overall survival of 6.3 months and 20 percent alive at two years.', src: [S_SCHOLAR] },
      { text: 'The adult lymphoma trial of the first approved product reports 93 infused patients evaluable for efficacy, with a best overall response rate of 52 percent and 40 percent complete responses. Its label records that of 160 patients enrolled, 106 received the product, and that 11 of the 160 did not because manufacturing failed.', src: [S_JULIET, S_KYM] },
      { text: 'In the randomized second-line trial of the lymphoma product, median event-free survival was 8.3 months against 2.0 months for standard care (hazard ratio 0.40), and the prespecified five-year analysis reported four-year overall survival of 54.6 percent against 46.0 percent (hazard ratio 0.73).', src: [S_ZUMA7, S_ZUMA7OS] },
      { text: 'The approved products differ in exactly the places this machine lets you choose. The first leukemia product uses a murine anti-CD19 binder with a CD8 alpha hinge and transmembrane region, a 4-1BB costimulatory domain and CD3 zeta, delivered by a lentiviral vector. The first lymphoma product uses a murine binder with CD28 and CD3 zeta, delivered by a gammaretroviral vector.', src: [S_KYM, S_YESC] },
      { text: 'A published comparison of the two costimulatory domains found that preclinical cytokine release is usually greater with CD28, that the approved anti-CD19 products show similar anticancer activity regardless of which domain they use, and that reported neurological toxicity rates have been higher for the CD28 products, probably from a combination of factors rather than CD28 signaling alone.', src: [S_CAPPELL] },
      { text: 'The mechanism underneath that difference: 4-1BB constructs produced central memory cells with enhanced respiratory capacity, more fatty-acid oxidation and more mitochondrial biogenesis, while CD28 constructs produced effector memory cells with a glycolytic signature. A separate study found CD28 costimulation augments, and 4-1BB reduces, the exhaustion caused by constant receptor signaling.', src: [S_KAWA, S_LONG] },
      { text: 'The 4-1BB anti-CD19 design traces to a 2004 paper showing that a receptor carrying a 4-1BB signaling domain was far more cytotoxic against acute lymphoblastic leukemia than the same receptor without costimulation.', src: [S_IMAI] },
      { text: 'Hinge and transmembrane choice is not cosmetic: anti-CD19 receptors built with CD8 alpha hinge and transmembrane regions produced lower cytokine levels and less activation-induced cell death than CD28-derived ones, while eliminating established mouse tumors similarly well.', src: [S_ALAB] },
      { text: 'Binder affinity is a design lever too. A lower-affinity anti-CD19 receptor produced greater expansion and longer persistence with no severe cytokine release syndrome in a pediatric trial, and the adult leukemia product built on an intermediate-affinity receptor reported grade 3 or higher cytokine release syndrome in 2.4 percent and grade 3 or higher neurotoxicity in 7.1 percent of 127 infused patients.', src: [S_CARPALL, S_FELIX] },
      { text: 'The severity of the cytokine syndrome is driven largely by the patient’s own macrophages and monocytes rather than by the engineered cells. In mouse models, blocking the interleukin-1 receptor abolished both the cytokine syndrome and the delayed neurotoxicity, while interleukin-6 receptor blockade prevented the cytokine syndrome but not the delayed neurological toxicity.', src: [S_GIAV, S_NOREL] },
      { text: 'The 2019 consensus grading system requires fever for a diagnosis of cytokine release syndrome and sets the grade by the more severe of the circulatory and the respiratory problem. Neurotoxicity is graded in the same document, partly with a ten-point bedside assessment covering orientation, naming three objects, following a command, writing a sentence and counting backwards. Before it, several incompatible scales were in use, which is why toxicity rates across trials from different years do not compare cleanly.', src: [S_ASTCT] },
      { text: 'Conditioning matters. Adding fludarabine to cyclophosphamide improved persistence and disease-free survival in an adult leukemia study, in which high cell dose and high tumor burden also increased the risk of severe cytokine release syndrome and neurotoxicity, and immune responses against the receptor limited persistence in some patients.', src: [S_TURTLE] },
      { text: 'Disease burden at infusion moves both halves of the ledger. In 53 adults with relapsed B-cell leukemia, 83 percent reached complete remission, and those with a low marrow burden had markedly less cytokine release syndrome and neurotoxicity and a median overall survival of 20.1 months against 12.9 months for the cohort as a whole.', src: [S_PARK] },
      { text: 'The label of one approved product gives the lymphodepleting regimen as cyclophosphamide and fludarabine on the fifth, fourth and third days before infusion, and reports a median of 17 to 18 days from collection to delivery of the product to the treating site, with a range reaching past seven weeks.', src: [S_YESC] },
      { text: 'The worst documented failure mode of this modality is healthy tissue carrying the same antigen. In a 2010 case report, a patient with metastatic colon cancer received a very large dose of cells carrying a high-affinity receptor against a protein present at a low level on normal lung lining, went into respiratory distress within fifteen minutes and died five days later.', src: [S_MORGAN] },
      { text: 'Relapse is not always resistance. A reversible mechanism called trogocytosis transfers the target antigen from the tumor cell onto the T cell, lowering the density the receptor sees and blunting the T cells that did it, which is one of several routes to an antigen-negative relapse.', src: [S_TROGO] },
      { text: 'Solid tumors take away the advantages that made the liquid cancers tractable: a clean antigen that healthy tissue does not share, easy access to the target, and uniform expression across the tumor.', src: [S_NCI] },
      { text: 'The first randomized trial of this modality in a solid tumor read out in 2025: in previously treated advanced gastric or gastroesophageal junction cancer, median progression-free survival was 3.25 months for the CLDN18.2-directed therapy against 1.77 months for physician’s choice, hazard ratio 0.37. China’s regulator approved it on June 22, 2026 for CLDN18.2-positive, HER2-negative disease after at least two prior lines. In normal tissue that antigen is confined to the differentiated lining of the stomach and is absent from the gastric stem cell zone.', src: [S_SATRI, S_NMPA, S_CLDN] },
      { text: 'In a phase 1 trial in children with H3K27M-mutant diffuse midline glioma, GD2-directed cells were given intravenously and then into the cerebrospinal fluid through a ventricular reservoir. Four of the treated patients had major volumetric tumor reductions of 52, 54, 91 and 100 percent, one complete response was ongoing beyond 30 months, and every patient had tumor inflammation-associated neurotoxicity.', src: [S_GD2] },
      { text: 'Manufacturing is a real constraint and it moves over time. Roughly 7 to 9 percent of enrolled patients in the registration studies of the first approved product (pediatric and young adult leukemia, adult lymphoma) did not receive it because manufacturing failed, against about 1 percent for the lymphoma product, and early in its commercial life batches that were safe but outside the tighter commercial viability specification were supplied at no charge. End to end, collection to infusion currently takes about three to five weeks.', src: [S_KYM, S_BPD, S_NCI] },
      { text: 'In January 2024 the United States regulator required a boxed warning about T-cell cancers on the approved BCMA- and CD19-directed autologous products as a class, after post-marketing and trial reports of mature T-cell cancers, some of them carrying the receptor.', src: [S_FDA24] },
      { text: 'In June 2025 the same regulator removed the risk evaluation and mitigation strategy from six approved products, so treating sites no longer need special certification or on-site stocking of an interleukin-6 receptor blocker, and the recommended period of staying near a treating facility, and of not driving, is now two weeks.', src: [S_REMS, S_YESC] },
      { text: 'Launch list prices, by wholesale acquisition cost: $475,000 for the 2017 leukemia product, $373,000 for the 2017 lymphoma product, $373,000 in 2020, $410,300 and $419,500 in 2021, $465,000 in 2022, and $525,000 for the 2024 adult leukemia product. By 2025 the same products carried list prices from $462,000 to $593,533. One analysis puts the cost of the whole episode of care above one million dollars a patient.', src: [S_HMPI, S_MEDLET, S_AJMC] },
      { text: 'The first approval came with an outcomes-based arrangement announced with the United States payer, under which payment for pediatric and young adult leukemia patients was tied to a response by the end of the first month.', src: [S_NOV] },
      { text: 'The access gap is the number this machine is really about. In a SEER-Medicare analysis, 122 of 2,241 patients treated in the third line or later for diffuse large B-cell lymphoma between 2017 and 2020 received a CAR-T therapy, about 5.4 percent. Patients in poor-access states averaged 104.4 miles to the nearest authorized center against 34.2 miles in better-access states, and the authors estimate that closing that distance gap would raise the share treated from 6.6 to 9.1 percent, a 37.6 percent increase in patients treated.', src: [S_SEER] },
      { text: 'A 2026 scoping review of 37 studies found barriers to commercial CAR-T access at every level, patient, provider, institution and policy, with inequities falling hardest on racial and ethnic minority populations, and identified only two published interventions aimed at those disparities.', src: [S_BLOODREV] },
      { text: 'Two ways out of the autologous factory are in the clinic. Donor-derived, gene-edited universal anti-CD19 cells have now been followed for years in children at a single center, with host rejection still the unsolved problem; and in vivo approaches deliver the receptor gene inside the body with a viral vector or a lipid nanoparticle, and remain investigational.', src: [S_UCART, S_AJMC] },
      { text: 'The modality has also left oncology. Five patients with refractory systemic lupus erythematosus reached drug-free remission after anti-CD19 cells in a 2022 report, and a phase 1 and 2 basket trial in treatment-refractory autoimmune disease published in 2026, in which 22 of 24 patients met predefined efficacy endpoints with no cytokine release syndrome above grade 2 and no neurotoxicity syndrome.', src: [S_LUPUS, S_CASTLE] },
      { text: 'The history, briefly: chimeric receptors joining an antibody’s specificity to T-cell signaling in 1989 and 1993; a single CD28 and CD3 zeta receptor driving primary human T cells in 2002; more than a thousandfold expansion and six-month persistence with a complete remission in chronic lymphocytic leukemia in 2011; two children, treated in 2012, reported in 2013; 90 percent complete remission in 30 children and adults in 2014; and a conventional phase 1 dose escalation in children and young adults reported in 2015. An inducible suicide switch shown in 2011 could eliminate more than 90 percent of modified T cells within 30 minutes.', src: [S_GROSS, S_ESHHAR, S_MAHER, S_CTL019, S_GRUPP13, S_MAUDE14, S_LEE15, S_ICASP] },
      { text: 'As of September 2026 the regulator’s list of approved cellular and gene therapy products includes seven autologous CAR-T products, one engineered T-cell receptor therapy and one tumor-infiltrating lymphocyte therapy.', src: [S_FDALIST] }
    ],
    assumptions: [
      'The dose levels are labeled DL1 to DL5, each roughly double the last, in model units. They are deliberately not cell counts, and nothing here should be read as a dose.',
      'Every probability in the engine is invented for playability: the response, durability, toxicity grade, manufacturing failure, loss while waiting and fatal-event chances are all model numbers, not published rates.',
      'Potency, persistence, toxicity propensity and manufacturing reliability are four scalar indices built out of the construct, the process and the target. Real programs do not have four dials.',
      'The CD28 and 4-1BB difference is sharpened well past the literature, so that you can see it inside one session. The published comparison of the two domains found similar anticancer activity across approved anti-CD19 products.',
      'The toxicity model treats the cytokine and the neurological syndrome as two draws from one activation index, with the interleukin-6 and interleukin-1 effects taken from the direction of the mouse studies rather than any clinical estimate.',
      'The management options are program-level protocol policies with model effects. They are not doses, thresholds, orders or advice, and no real protocol looks like this.',
      'Addressable population figures (thousands of patients a year per target) and the 35 percent of them who qualify are invented round numbers.',
      'The access formula, with its center count, price drag, payment bonus and trust term, is a toy. It is shaped to reflect one real finding, that distance to a center measurably changes the treated share; how price and the payment model compare with distance is the model’s assumption, not a published result.',
      'A fresh, never-frozen product counts its treating network at a little over half strength, because it has to reach the patient within hours of release. The size of that discount is invented.',
      'Vein-to-vein time is culture days plus a fixed logistics allowance plus a queue term, which is a crude version of a real scheduling problem.',
      'Commercial capacity is counted in manufacturing suites of 480 batches a year. Real capacity is a function of suites, shifts, release testing and vector supply.',
      'The trial is a textbook 3+3, including the expansion to six at the level below one that fails, with no site variation, no eligibility drift and no censoring. Real dose-finding is messier and slower.',
      'The efficacy penalty for corticosteroids is a model choice. Published cohorts disagree on whether, and how much, steroids blunt response.',
      'Infection deaths during the low blood counts after conditioning are a small model probability, higher with fludarabine added, so that the conditioning decision has a cost as well as a benefit.',
      'The dose-limiting toxicity definition here is a grade 4 event, a treatment-related death, a grade 4 healthy-tissue event, or a grade 3 event that fails to settle, which the model resolves with a coin weighted at 0.35. A real protocol spells this out over several pages.',
      'Each cohort of three is assumed to share the manufacturing queue with four patients from the rest of the program at all times, which is what turns slots into days and days into patients who are never infused.',
      'Approval is followed by a launch financing of a fixed invented size, and a platform bet brings a fixed partner payment, because a program with a label or a platform can raise money and one with neither cannot.',
      'The pivotal readout draws fresh patients from the same engine at the recommended dose, so it inherits every assumption above.',
      'Approval is granted by rule: a response-rate threshold that differs for liquid and solid targets, a ceiling on fatal events and a floor on your trust score. Real review is not a formula.',
      'The hazard ratio on the randomized path is derived from your durability rather than simulated patient by patient.',
      'Trust is a single number standing in for what regulators, investigators, payers and patients think of you. It does not exist.',
      'Money is a single cash balance with a fixed monthly burn. There is no debt, no partner, no equity and no revenue until approval.',
      'The load-bearing decisions in the debrief are computed by flipping one decision at a time and rerunning the readout on a fixed seed. That holds everything else constant, which a real program never does.'
    ],
    fiction: [
      'Meridian Cell Therapeutics, its board, its factory and its cash balance.',
      'Every patient in the trial. They are cohort numbers with model numbers attached, and no line in this machine describes a real person.',
      'Every dollar figure inside the game: the starting cash, the cost of a slot, a suite, a center, a pivotal trial or an amendment.',
      'The event deck. The supply crunch, the rival trial, the immune response against the receptor and the quiet year are plausible composites, not reported events.',
      'All five target programs as playable programs. The antigens and the diseases are real, and the state of the science on each is in the reported facts above; the company running them is not.',
      'The endings, including their names. They are the shapes this machine can end in, not a taxonomy anybody uses.',
      'The hard-mode program is built on a real published death, which is in the facts above. The program around it is invented, and the model will not protect you from the decision that caused it.'
    ],
    sources: [
      S_FDALIST, S_NOV, S_ELIANA, S_ZUMA1, S_ZUMA1_5, S_JULIET, S_ZUMA7, S_ZUMA7OS, S_SCHOLAR,
      S_KYM, S_YESC, S_AUC, S_FELIX, S_CARPALL, S_ASTCT, S_CAPPELL, S_KAWA, S_LONG, S_IMAI, S_ALAB,
      S_GIAV, S_NOREL, S_TURTLE, S_PARK, S_MORGAN, S_TROGO, S_CLDN, S_SATRI, S_NMPA, S_GD2,
      S_BPD, S_NCI, S_FDA24, S_REMS, S_HMPI, S_AJMC, S_SEER, S_BLOODREV, S_UCART, S_LUPUS, S_CASTLE,
      S_33, S_GROSS, S_ESHHAR, S_MAHER, S_CTL019, S_GRUPP13, S_MAUDE14, S_LEE15, S_ICASP, S_MEDLET
    ]
  };

  /* ENGINE-START (the harness in scratchpad/lab-harness/living-drug.js evaluates this block verbatim) */
  var BURN = 1.6, PCOST = 0.42, SLOT = 18, SUITE = 26, CENTER = 9, OUTPT = 22, AMEND_C = 12, AMEND_M = 4, LAUNCH = 180;
  var PIV = { fast: { c: 75, m: 16, n: 100 }, rand: { c: 105, m: 28, n: 340 } };
  var CLOCK = 132, GRADES = [0.35, 0.65, 0.95, 1.25], QOTHER = 4, ANAK = 0.05;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function grade(v) { var g = 0, i; for (i = 0; i < 4; i++) if (v >= GRADES[i]) g = i + 1; return g; }

  function mkState(seed) {
    return { seed: seed >>> 0, act: 1, month: 0, cash: 260, trust: 62, target: null,
      cx: { binder: null, htm: null, costim: null, vector: null, armor: false, locked: false, dual2: false, amends: 0, amending: false, dualDone: false },
      mfg: { days: 12, specs: 'tight', cryo: true, slots: 4, platform: 'auto', secondSource: false, route: 'iv', autoSlots: 4 },
      tr: { dl: 1, levels: [], ld: 'cyflu', burden: 'asis', tox: 'reactive', anakinra: false,
        enrolled: 0, infused: 0, oos: 0, oosRel: 0, lost: 0, deaths: 0, holds: 0, mtd: null, rp2d: null, ceil: 0, how: null, floored: false,
        cohort: [], stopped: false, interrupts: 0 },
      piv: { design: null, done: false, n: 0, orr: 0, cr: 0, dur: 0, crs3: 0, icans3: 0, g5: 0, deaths: 0, hr: null, approved: false, tries: 0 },
      world: { price: 400, pay: 'list', centers: 12, outpatient: false, suites: 1, reach: 0, eligible: 0, demand: 0, capacity: 0, annual: 0, lives3: 0, done: false },
      ev: { deck: [], at: 0, flags: {}, pending: null },
      pts: [], log: [], ending: null, over: false, wound: false, streams: null };
  }
  function streams(S) {
    if (!S.streams) S.streams = { m: K.rng(S.seed), p: K.rng((S.seed + 404) >>> 0), e: K.rng((S.seed + 919) >>> 0) };
    return S.streams;
  }
  function derive(S) {
    var T = LV_TARGETS[S.target] || LV_TARGETS.cd19, B = LV_BINDER[S.cx.binder] || LV_BINDER.hum,
      H = LV_HTM[S.cx.htm] || LV_HTM.cd8, C = LV_COSTIM[S.cx.costim] || LV_COSTIM.bb,
      V = LV_VECTOR[S.cx.vector] || LV_VECTOR.lenti, m = S.mfg;
    var armor = S.cx.costim === 'dual';
    var dens = T.dens * (B.dens || 1) * C.dens;
    var fit = m.days === 3 ? 1.12 : m.days === 9 ? 1.05 : 1.00;
    if (m.cryo) fit *= 0.98; else fit *= 1.02;
    var miss = m.days === 3 ? 0.10 : m.days === 9 ? 0.05 : 0.02;
    var traffic = T.traffic * (T.route && m.route === 'local' ? 1.35 : 1);
    var POT = (1.15 + B.pot + H.pot) * C.exp * dens * traffic;
    var PER = C.per * (1 - B.imm * 0.5) * V.per * (armor ? 1.10 : 1) * B.per;
    if (S.ev.flags.immPer) PER *= 0.75;
    if (m.platform === 'allo') PER *= 0.70; else if (m.platform === 'vivo') PER *= 0.55;
    var TOXP = Math.max(0.12, 0.30 + B.tox + H.tox + C.tox);
    var TMEE = Math.min(1, T.tme + (armor ? C.tmeBonus : 0));
    var MFG = 0.92 * V.mfgOk * C.mfg * (m.days >= 12 ? 1.04 : m.days >= 9 ? 1.00 : 0.92) * (m.secondSource ? 1.02 : 1);
    /* the response ceiling: how much of the tumor carries enough antigen, at this binder's grip, to be killed at all.
       Dose buys expansion; it does not buy back the cells your receptor cannot see. */
    var CEIL = clamp(0.23 + 0.65 * dens, 0.10, 0.88);
    return { T: T, B: B, H: H, C: C, V: V, dens: dens, fit: fit, miss: miss, POT: POT, PER: PER, TOXP: TOXP, TMEE: TMEE, MFG: MFG,
      CEIL: CEIL, esc: T.esc * (S.cx.dual2 ? 0.55 : 1) * (B.esc || 1), cogs: V.cogs };
  }
  /* a vector supply crunch hits a viral process hardest; a second source is the fix */
  function crunchOf(S) {
    var V = LV_VECTOR[S.cx.vector] || LV_VECTOR.lenti;
    return clamp(1 - V.supply * 1.8, 0.3, 1);
  }
  function queueWait(S) {
    if (S.mfg.platform !== 'auto') return 0;
    /* your cohort of three, at least, plus four patients from the rest of the program; the same number in the
       Act III preview, inside a cohort and in the pivotal, so the day count you see is the day count they get */
    var pending = Math.max(S.tr.cohort.length, 3) + QOTHER;
    return Math.max(0, 30 * (pending / Math.max(1, S.mfg.slots) - 1));
  }
  function v2v(S) {
    if (S.mfg.platform === 'vivo') return 1;
    if (S.mfg.platform === 'allo') return 3;
    return Math.round(S.mfg.days + (S.mfg.cryo ? 10 : 6) + queueWait(S));
  }
  function pOOS(S, D, pt) {
    if (S.mfg.platform !== 'auto') return 0.01;
    return clamp(0.03 + (1 - D.MFG) * 0.35 + 0.05 * pt.burden + D.miss - (S.mfg.specs === 'wide' ? 0.04 : 0), 0.01, 0.35);
  }
  function pLost(S, pt) {
    var scale = 200 * (pt.burden < 0.5 ? 1.6 : 1.0);
    return 1 - Math.exp(-(pt.v2v != null ? pt.v2v : v2v(S)) / scale);
  }
  function advance(S, months) {
    S.month += months;
    S.cash -= months * BURN;
    /* the crunch does not time out: a single-source supply chain stays broken until somebody fixes it */
  }
  /* what a pivotal trial costs on this construct: a fifth of it is manufacturing, so the vector's cost per batch shows */
  function pivCost(S, d) { return Math.round(PIV[d].c * (0.8 + 0.2 * LVD(S).cogs) * 10) / 10; }
  /* what it takes to start one and still be solvent when it reads out */
  function pivNeed(S, d) { return pivCost(S, d) + PIV[d].m * BURN + (S.tr.anakinra ? PIV[d].n * ANAK : 0); }
  /* one patient: every uniform is drawn here, in a fixed order, so the run stays deterministic
     whichever protocol action the player picks afterwards */
  function simPatient(S, D, dl, r, tag) {
    var pt = { id: tag, dl: dl, burden: 0, e: 0, crs: 0, icans: 0, resp: false, durable: false, escape: false,
      death: false, infection: false, oot: 0, fatal: false, oos: false, oosInfused: false, lost: false, infused: false, icu: false,
      peak: 8, act: null, cost: 0, v2v: v2v(S) };
    pt.burden = S.tr.burden === 'bridge' ? 0.15 + 0.30 * r() : 0.45 + 0.40 * r();
    pt.u = { noise: 0.85 + 0.30 * r(), resp: r(), dur: r(), esc: r(), sevN: r.normal(), sev: r.normal(),
      death: r(), peak: r(), oot: r(), oos: r(), lost: r(), slow: r() };
    pt.peak = 6 + Math.round(3 * pt.u.peak);
    pt.oos = pt.u.oos < pOOS(S, D, pt);
    pt.lost = !pt.oos && pt.u.lost < pLost(S, pt);
    if (pt.oos && S.mfg.specs === 'wide') { pt.oosInfused = true; pt.infused = !pt.lost; }
    else if (pt.oos) pt.infused = false;
    else pt.infused = !pt.lost;
    return pt;
  }
  function rawSev(S, D, pt) {
    var md = MDS[pt.dl - 1], ldM = LD[S.tr.ld];
    var E = D.POT * D.fit * Math.pow(md, 0.55) * ldM * (1 + 0.25 * pt.burden) * pt.u.noise;
    /* 4-1BB builds slowly: at the low levels some of the expansion has not arrived by the time it is needed */
    if (S.cx.costim === 'bb') E *= Math.min(1, 0.7 + 0.1 * pt.dl);
    if (pt.oosInfused) E *= 0.85;
    var h = D.TOXP * (0.60 + 0.90 * pt.burden) * Math.pow(md, 0.40) * Math.sqrt(Math.max(0.05, E));
    return { E: E, h: h, sev: h + 0.25 * pt.u.sev, sevN: 0.75 * h * (S.cx.costim === 'cd28' ? 1.25 : 1.00) + 0.20 * pt.u.sevN };
  }
  function actFor(S, pt) {
    var g = grade(rawSev(S, LVD(S), pt).sev);
    if (g < 2) return 'none';
    return S.tr.tox === 'earlyIL6' ? 'il6' : S.tr.tox === 'earlySteroid' ? 'steroid' : 'none';
  }
  /* the protocol action is applied here: a program-level policy with model effects, nothing more.
     No side effects on the program: what a patient costs is returned on pt.cost and charged by the caller. */
  function finalize(S, D, pt, action) {
    var raw = rawSev(S, D, pt), md = MDS[pt.dl - 1], ldM = LD[S.tr.ld];
    var sev = raw.sev, sevN = raw.sevN, E = raw.E, steroid = false, cyto = false;
    pt.act = action || 'none';
    pt.cost = 0;
    if (pt.act === 'il6') { sev -= 0.35; sevN -= 0.05; cyto = true; }
    else if (pt.act === 'steroid') { sev -= 0.30; sevN -= 0.45; E *= 0.85; steroid = true; }
    if (S.tr.anakinra) { sev -= 0.25; sevN -= 0.25; cyto = true; pt.cost += ANAK; }
    pt.crs = grade(sev);
    pt.icans = grade(sevN);
    pt.e = E;
    if (pt.crs >= 4 || pt.icans >= 4) { pt.icu = true; pt.cost += 0.4; }
    /* healthy tissue recognition: only where the antigen is also on normal tissue */
    var T = D.T, bF = S.cx.binder === 'fast' ? 0.35 : S.cx.binder === 'hum' ? 0.7 : 1;
    var rF = T.route && S.mfg.route === 'local' ? 0.40 : 1, dF = [0.25, 0.5, 0.8, 1, 1][pt.dl - 1];
    if (T.oot >= 0.5) {
      var pCat = 0.30 * bF * rF * dF * (T.oot / 0.85);
      if (pt.u.oot < pCat) { pt.fatal = true; pt.oot = 4; pt.death = true; }
    }
    if (!pt.fatal) {
      var pOot = 0.16 * T.oot * bF * rF * Math.pow(md, 0.5) * 0.7;
      if (pt.u.oot > 1 - pOot) pt.oot = pt.u.oot > 1 - pOot * 0.3 ? 4 : 3;
    }
    var pResp = clamp(0.10 + 0.85 * Math.tanh(1.6 * (E * D.TMEE - 0.30)), 0.03, D.CEIL);
    pt.resp = pt.u.resp < pResp;
    var PERE = D.PER * Math.sqrt(ldM) * D.fit;
    var pDur = clamp(0.40 + 0.20 * (PERE - 1) - 0.45 * D.esc + (pt.burden < 0.5 ? 0.08 : 0) - (steroid ? 0.06 : 0), 0.08, 0.75);
    pt.durable = pt.resp && pt.u.dur < pDur;
    if (pt.resp && !pt.durable) pt.escape = pt.u.esc < (0.35 + 0.9 * D.esc);
    if (!pt.death && (pt.crs >= 4 || pt.icans >= 4)) {
      var pD = (S.tr.tox === 'reactive' && !cyto) ? 0.16 : 0.08;
      pt.death = pt.u.death < pD;
    }
    /* conditioning makes room by emptying the marrow for a while: a small infection risk, larger with fludarabine
       (a model probability; it reuses the top of the settle draw, which the grade 3 rule below never reads) */
    if (!pt.death && pt.u.slow > (S.tr.ld === 'cyflu' ? 0.993 : S.tr.ld === 'cy' ? 0.997 : 2)) { pt.death = true; pt.infection = true; }
    /* the protocol counts a grade 4 event, a treatment-related death, a grade 4 healthy-tissue event,
       and a grade 3 event that does not settle inside the window (a model probability) */
    pt.slow = (pt.crs === 3 || pt.icans === 3) && pt.u.slow < 0.35;
    pt.dlt = !!(pt.crs >= 4 || pt.icans >= 4 || pt.death || pt.oot >= 4 || pt.slow);
    return pt;
  }
  var LVD_CACHE = null, LVD_KEY = '';
  function LVD(S) {
    var k = [S.target, S.cx.binder, S.cx.htm, S.cx.costim, S.cx.vector, S.cx.dual2, S.mfg.days, S.mfg.cryo, S.mfg.specs,
      S.mfg.platform, S.mfg.route, S.mfg.secondSource, S.ev.flags.immPer, S.mfg.slots, S.tr.cohort.length].join('|');
    if (k !== LVD_KEY) { LVD_KEY = k; LVD_CACHE = derive(S); }
    return LVD_CACHE;
  }
  /* the 3+3: three at a level, escalate on none, expand to six on one, stop the level on two */
  function levelOf(S, dl) {
    var i, L = S.tr.levels;
    for (i = 0; i < L.length; i++) if (L[i].dl === dl) return L[i];
    L.push({ dl: dl, n: 0, dlt: 0 });
    return L[L.length - 1];
  }
  function verdict(S, dl) {
    var L = levelOf(S, dl);
    if (L.dlt >= 2) return 'over';
    if (L.n >= 6) return L.dlt <= 1 ? 'up' : 'over';
    if (L.n >= 3) return L.dlt === 0 ? 'up' : L.dlt === 1 ? 'expand' : 'over';
    return 'more';
  }
  function runCohort(S, onPatient) {
    var D = LVD(S), r = streams(S).p, dl = S.tr.dl, out = [], n = 3, i;
    for (i = 0; i < n; i++) {
      S.tr.enrolled += 1;
      var pt = simPatient(S, D, dl, r, S.tr.enrolled);
      S.tr.cohort.push(pt);
      out.push(pt);
    }
    var months = 0;
    for (i = 0; i < out.length; i++) months += 0.62 + (S.tr.burden === 'bridge' ? 0.40 : 0) + out[i].v2v / 90;
    advance(S, months);
    /* every enrolled patient is collected and manufactured, infused or not; the vector sets the cost per batch */
    S.cash -= out.length * PCOST * D.cogs;
    for (i = 0; i < out.length; i++) { if (onPatient) onPatient(out[i]); }
    return out;
  }
  function commit(S, pt, action) {
    var D = LVD(S), L = levelOf(S, pt.dl), qi = S.tr.cohort.indexOf(pt);
    if (qi >= 0) S.tr.cohort.splice(qi, 1);
    if (!pt.infused) {
      if (pt.oos) S.tr.oos += 1;
      if (pt.lost) S.tr.lost += 1;
      S.pts.push(pt);
      return pt;
    }
    if (pt.oos) { S.tr.oos += 1; S.tr.oosRel += 1; }
    S.tr.infused += 1;
    L.n += 1;
    finalize(S, D, pt, action);
    S.cash -= pt.cost;
    if (pt.dlt) L.dlt += 1;
    if (pt.death) S.tr.deaths += 1;
    S.pts.push(pt);
    return pt;
  }
  /* the pivotal readout: fresh patients at the recommended dose, same engine, one fixed stream. Pure: it charges nothing */
  function readout(S, n, seedOff) {
    var D = LVD(S), r = K.rng((S.seed + (seedOff == null ? 1717 : seedOff)) >>> 0), i, pt;
    var resp = 0, dur = 0, c3 = 0, n3 = 0, d = 0, esc = 0, inf = 0, fat = 0, cost = 0;
    for (i = 0; i < n; i++) {
      pt = simPatient(S, D, S.tr.rp2d || S.tr.dl, r, i + 1);
      if (!pt.infused) continue;
      inf += 1;
      finalize(S, D, pt, actFor(S, pt));
      cost += pt.cost;
      if (pt.resp) resp += 1;
      if (pt.durable) dur += 1;
      if (pt.crs >= 3) c3 += 1;
      if (pt.icans >= 3) n3 += 1;
      if (pt.death) d += 1;
      if (pt.fatal) fat += 1;
      if (pt.escape) esc += 1;
    }
    var deaths = d;
    inf = Math.max(1, inf);
    var o = { n: n, inf: inf, orr: resp / inf, dur: dur / inf, crs3: c3 / inf, icans3: n3 / inf, g5: d / inf, esc: esc / inf,
      deaths: deaths, fatal: fat, cost: Math.round(cost * 10) / 10 };
    o.cr = o.orr * D.T.crRate;
    o.hr = clamp(0.95 - 1.60 * (o.dur - 0.10) + (S.ev.flags.earlier ? 0.08 : 0), 0.25, 1.05);
    return o;
  }
  /* what the reviewers bring up before they decide; returns the lines to read out, applies the trust it costs */
  function pivotalReview(S) {
    var notes = [], f = S.ev.flags;
    if (S.mfg.specs === 'wide' && S.tr.oosRel > 0 && !f.wideAsked) {
      f.wideAsked = 1; S.trust -= 4;
      notes.push('The reviewers ask why ' + S.tr.oosRel + ' ' + (S.tr.oosRel === 1 ? 'batch was' : 'batches were') +
        ' released outside specification. Comparability questions cost you four points of trust. This is what a tight specification protects.');
    }
    if (f.minimal && !f.minAsked) {
      f.minAsked = 1; S.trust -= 5;
      notes.push('The reviewers come back to long-term follow-up, as promised. Doing the minimum the label required costs you five points of trust here.');
    }
    return notes;
  }
  function approvalOf(S, o) {
    var T = LV_TARGETS[S.target], liquid = T.kind === 'liquid';
    if (o.g5 > 0.05 || S.trust < 45) return false;
    if (S.piv.design === 'rand') return o.hr < 0.70;
    return liquid ? o.orr >= 0.45 : (o.orr >= 0.25 && o.dur >= 0.12);
  }
  function access(S, w, dur) {
    var T = LV_TARGETS[S.target], bonus = w.pay === 'outcome' ? 0.08 : w.pay === 'instal' ? 0.05 : 0;
    var drag = clamp((w.price - 350) / 900, 0, 0.22);
    /* a fresh product has hours, not days, between release and the vein: the network only counts at a little over half */
    var mapF = (S.mfg.platform !== 'auto' || S.mfg.cryo) ? 1 : 0.55;
    var reach = clamp(0.06 + 0.42 * (1 - Math.exp(-w.centers / 45)) * mapF + (w.outpatient ? 0.10 : 0) + bonus - drag
      + 0.05 * (S.trust - 60) / 40 + (S.ev.flags.rems ? 0.06 : 0) + (S.piv.design === 'rand' ? 0.05 : 0), 0.02, 0.82);
    var eligible = T.pop * 1000 * 0.35 * (S.ev.flags.earlier ? 1.25 : 1);
    var per = S.mfg.platform === 'auto' ? 480 : 1200;
    var capacity = Math.max(1, w.suites || 1) * per;
    var demand = eligible * reach;
    var annual = Math.min(demand, capacity);
    return { reach: reach, eligible: eligible, demand: demand, capacity: capacity, annual: annual,
      lives3: Math.round(annual * 3 * dur) };
  }
  function endingOf(S) {
    var T = LV_TARGETS[S.target], p = S.piv, w = S.world, solid = T.kind === 'solid';
    var ratio = S.tr.enrolled ? S.tr.infused / S.tr.enrolled : 1;
    if (S.ending === 'fatal') return 'fatal';
    if (!p.approved) {
      /* a pivotal that read out answered the question, whatever is left in the bank */
      if (p.done) return ratio < 0.45 ? 'factory' : 'negative';
      /* so did a phase 1 that could not clear its own first level */
      if (S.tr.floored) return 'negative';
      if (S.cash <= 0 || S.month >= CLOCK || S.cash < pivNeed(S, 'fast')) return 'runway';
      return ratio < 0.45 ? 'factory' : 'shelved';
    }
    if (ratio < 0.45) return 'factory';
    if (p.dur > 0.35 && w.reach < 0.18) return 'unaffordable';
    if (p.orr > 0.60 && p.dur < 0.20) return 'flare';
    if (p.dur > 0.45 && w.annual < 600) return 'narrow';
    if (solid && p.dur < 0.30) return 'modest';
    if (S.mfg.platform !== 'auto') return 'shelf';
    if (p.dur >= 0.35 && w.annual >= 1400) return 'living';
    return 'middle';
  }
  /* what was load-bearing: flip one decision at a time, hold the seed, compare durable remissions reached */
  function flipWorld(S, key) {
    var c = JSON.parse(JSON.stringify({ cx: S.cx, mfg: S.mfg, tr: { ld: S.tr.ld, burden: S.tr.burden, tox: S.tr.tox, anakinra: S.tr.anakinra, rp2d: S.tr.rp2d, dl: S.tr.dl }, world: S.world }));
    var T = { seed: S.seed, target: S.target, trust: S.trust, cx: c.cx, mfg: c.mfg, ev: { flags: S.ev.flags }, piv: { design: S.piv.design },
      tr: { ld: c.tr.ld, burden: c.tr.burden, tox: c.tr.tox, anakinra: c.tr.anakinra, rp2d: c.tr.rp2d, dl: c.tr.dl, cohort: [] }, cash: S.cash, world: c.world };
    var lab = null;
    if (key === 'binder') { T.cx.binder = S.cx.binder === 'fast' ? 'hum' : 'fast'; lab = 'the binder (' + LV_BINDER[T.cx.binder].nm.toLowerCase() + ' instead)'; }
    else if (key === 'costim') { T.cx.costim = S.cx.costim === 'bb' ? 'cd28' : 'bb'; lab = 'the costimulatory domain (' + LV_COSTIM[T.cx.costim].nm + ' instead)'; }
    else if (key === 'htm') { T.cx.htm = S.cx.htm === 'cd8' ? 'cd28h' : 'cd8'; lab = 'the hinge'; }
    else if (key === 'days') { T.mfg.days = S.mfg.days === 12 ? 9 : 12; lab = 'culture length (' + T.mfg.days + ' days instead)'; }
    else if (key === 'ld') { T.tr.ld = S.tr.ld === 'cyflu' ? 'cy' : 'cyflu'; lab = 'the conditioning regimen'; }
    else if (key === 'burden') { T.tr.burden = S.tr.burden === 'bridge' ? 'asis' : 'bridge'; lab = 'the enrollment policy (' + BURDN[T.tr.burden].toLowerCase() + ')'; }
    else if (key === 'tox') { T.tr.tox = S.tr.tox === 'earlySteroid' ? 'earlyIL6' : 'earlySteroid'; lab = 'the toxicity policy'; }
    else if (key === 'suites') { T.world.suites = Math.max(1, S.world.suites + (S.world.suites >= 3 ? -1 : 1)); lab = 'factory capacity (' + T.world.suites + ' ' + F.plural(T.world.suites, 'suite') + ' instead)'; }
    else if (key === 'price') { T.world.price = S.world.price >= 400 ? 250 : 550; lab = 'the price (' + F.usd(T.world.price) + 'k instead)'; }
    else if (key === 'pay') { T.world.pay = S.world.pay === 'list' ? 'outcome' : 'list'; lab = 'the payment model'; }
    else if (key === 'centers') { T.world.centers = S.world.centers >= 60 ? 12 : 90; lab = 'the network (' + T.world.centers + ' centers instead)'; }
    else if (key === 'cryo') { if (S.mfg.platform !== 'auto') return null; T.mfg.cryo = !S.mfg.cryo; lab = 'the product form (' + (T.mfg.cryo ? 'cryopreserved' : 'fresh') + ' instead)'; }
    else if (key === 'dose') { T.tr.rp2d = Math.max(1, Math.min(5, (S.tr.rp2d || 3) + ((S.tr.rp2d || 3) >= 4 ? -1 : 1))); lab = 'the recommended dose (' + DLN[T.tr.rp2d - 1] + ' instead)'; }
    if (!lab) return null;
    var o = readoutFor(T, 100, 7777), a = access(T, T.world, o.dur);
    return { key: key, label: lab, lives3: a.lives3, annual: a.annual, dur: o.dur, orr: o.orr };
  }
  /* a readout for a hypothetical program; the cache is handed back exactly as it was found */
  function readoutFor(T, n, off) {
    var saveKey = LVD_KEY, saveCache = LVD_CACHE;
    LVD_KEY = '';
    var o = readout(T, n, off);
    LVD_KEY = saveKey; LVD_CACHE = saveCache;
    return o;
  }
  function sensitivity(S) {
    var keys = ['binder', 'costim', 'htm', 'days', 'ld', 'burden', 'tox', 'cryo', 'suites', 'price', 'pay', 'centers', 'dose'];
    var base = readoutFor(S, 100, 7777), ba = access(S, S.world, base.dur), out = [], i, f;
    for (i = 0; i < keys.length; i++) {
      f = flipWorld(S, keys[i]);
      if (!f) continue;
      f.delta = f.lives3 - ba.lives3;
      out.push(f);
    }
    out.sort(function (a, b) { return Math.abs(b.delta) - Math.abs(a.delta); });
    return { base: ba.lives3, baseDur: base.dur, list: out };
  }
  /* the escalation decision, applied to state; the view turns the code into a line of copy.
     A textbook 3+3: a level that fails sends you back down, and the level below has to hold six before it is called the maximum tolerated dose. */
  function escalate(S) {
    var t = S.tr, dl = t.dl, v = verdict(S, dl), L = levelOf(S, dl);
    if (v === 'more' || v === 'expand') return v;
    if (v === 'up') {
      var capped = t.ceil && dl + 1 >= t.ceil;
      if (capped || dl >= 5) {
        if (L.n < 6) return capped ? 'confirm' : 'confirmTop';
        t.rp2d = dl; t.stopped = true;
        if (capped) { t.mtd = dl; t.how = 'mtd'; return 'mtd'; }
        t.mtd = null; t.how = 'top'; return 'top';
      }
      t.dl = dl + 1;
      return 'up';
    }
    /* over: this level is too high */
    t.ceil = dl;
    if (dl <= 1) { t.floored = true; return 'floor'; }
    t.dl = dl - 1;
    if (levelOf(S, dl - 1).n >= 6) { t.mtd = dl - 1; t.rp2d = dl - 1; t.stopped = true; t.how = 'mtd'; return 'mtd'; }
    return 'back';
  }
  function holdCheck(S) {
    var dAt = 0, i;
    for (i = 0; i < S.pts.length; i++) if (S.pts[i].dl === S.tr.dl && S.pts[i].death) dAt += 1;
    if (dAt >= 2 || (S.tr.deaths >= 2 && !S.tr.holdDone)) {
      S.tr.holds += 1; S.tr.holdDone = true; S.tr.mustChange = true;
      advance(S, 6); S.trust -= 15; S.cash -= 9;
      return true;
    }
    return false;
  }
  /* ENGINE-END */

  /* ---------- small view helpers ---------- */
  var E = K.esc;
  function bar(v, cls) { return '<span class="lk-bar' + (cls ? ' lk-bar--' + cls : '') + '"><i style="--w:' + clamp(v, 0, 1).toFixed(3) + '"></i></span>'; }
  function dial(k, v, cls) { return '<div class="lv-dial"><span class="lk-k">' + E(k) + '</span>' + bar(v, cls) + '</div>'; }
  function cell(k, v, cls) { return '<li class="lv-row' + (cls ? ' ' + cls : '') + '"><span class="ledger-k">' + E(k) + '</span><span class="ledger-n">' + v + '</span></li>'; }
  function vit(k, v, cls) { return '<div class="lv-vit' + (cls ? ' ' + cls : '') + '"><span class="lk-k">' + E(k) + '</span><span class="lv-fig stat">' + v + '</span></div>'; }
  /* a specimen plate for a target card, drawn from the card's own numbers. Left, the tumor, its antigen spikes set by the
     density: a blood cancer floats alone; a solid tumor sits packed in its stroma, the fibers set by how hostile the
     neighborhood is, and behind a wall when the cells have to cross into the brain. Right, the healthy tissue that carries the
     same antigen, in its own form, its spikes set by how much of it does. */
  function glyph(T) {
    var M = Math, R = M.PI / 180, o = '', st = '', sh = '', k;
    function n1(v) { return v.toFixed(1); }
    function pt(x, y) { return n1(x) + ' ' + n1(y); }
    /* a cell is an ellipse [cx, cy, rx, ry, degrees]; the point at parameter a, with its outward normal */
    function on(e, a) {
      var c = M.cos(a), s = M.sin(a), r = (e[4] || 0) * R, cr = M.cos(r), sr = M.sin(r), x = e[2] * c, y = e[3] * s,
        nx = e[3] * c, ny = e[2] * s, l = M.sqrt(nx * nx + ny * ny) || 1;
      return [e[0] + x * cr - y * sr, e[1] + x * sr + y * cr, (nx * cr - ny * sr) / l, (nx * sr + ny * cr) / l];
    }
    function inside(e, x, y) {
      var r = (e[4] || 0) * R, dx = x - e[0], dy = y - e[1], u = dx * M.cos(r) + dy * M.sin(r), v = dy * M.cos(r) - dx * M.sin(r);
      return u * u / (e[2] * e[2]) + v * v / (e[3] * e[3]) < 1;
    }
    function spike(x, y, nx, ny, len, w) {
      var x2 = x + nx * len, y2 = y + ny * len, tx = -ny * (w || 1.3), ty = nx * (w || 1.3);
      return 'M' + pt(x, y) + 'L' + pt(x2, y2) + 'M' + pt(x2 + tx, y2 + ty) + 'L' + pt(x2 - tx, y2 - ty);
    }
    /* n spikes spread evenly over the exposed outline of a group of cells; none reaches into a neighbor or a mask */
    function coat(list, n, len, ph, mask) {
      var c = [], d = '', all = mask ? list.concat(mask) : list, j, i, m;
      for (j = 0; j < list.length; j++) for (i = 0; i < 120; i++) {
        var q = on(list[j], (i * 3 + ph) * R), ok = true;
        for (m = 0; m < all.length && ok; m++) {
          if (m !== j && (inside(all[m], q[0] + q[2] * 1.2, q[1] + q[3] * 1.2) || inside(all[m], q[0] + q[2] * (len + 1.5), q[1] + q[3] * (len + 1.5)))) ok = false;
        }
        if (ok) c.push(q);
      }
      for (i = 0; i < n && c.length; i++) { var p = c[M.floor((i + .5) * c.length / n)]; d += spike(p[0], p[1], p[2], p[3], len); }
      return d;
    }
    function ell(e, cls) {
      return '<ellipse class="' + cls + '" cx="' + n1(e[0]) + '" cy="' + n1(e[1]) + '" rx="' + n1(e[2]) + '" ry="' + n1(e[3]) + '"' +
        (e[4] ? ' transform="rotate(' + e[4] + ' ' + pt(e[0], e[1]) + ')"' : '') + '/>';
    }
    function cell(e, nu, side) { return ell(e, 'lv-gl-c is-' + side) + ell(nu, 'lv-gl-n is-' + side); }
    function shade(x, y, rx) { return ell([x, y, rx, 2.6], 'lv-gl-sh'); }
    function arc(cx, cy, r, a0, a1) { return 'M' + pt(cx + r * M.cos(a0 * R), cy + r * M.sin(a0 * R)) + 'A' + n1(r) + ' ' + n1(r) + ' 0 0 1 ' + pt(cx + r * M.cos(a1 * R), cy + r * M.sin(a1 * R)); }
    var nT = M.round(4 + 22 * T.dens), nH = M.round(26 * T.oot);

    /* ---- the tumor ---- */
    if (T.cellT === 'solid') {
      var cx = 57, cy = 43, f = '', L = [[cx, cy, 8.6, 8.4, 0]];
      o += '<circle class="lv-gl-bed" cx="' + cx + '" cy="' + cy + '" r="36"/>';
      /* collagen: short wavy strands in a ring, more of them the more the neighborhood is against you */
      for (k = 0; k < M.round(16 + 28 * (1 - T.tme)); k++) {
        var a = (k * 137.508 + 20) * R, e2 = a + (12 + 9 * (k * .382 % 1)) * R, am = (a + e2) / 2,
          r0 = 29 + 5.5 * (k * .618 % 1), r1 = r0 + 2.4 * ((k * .754 % 1) - .5), rm = (r0 + r1) / 2 + (k % 2 ? 1.8 : -1.8);
        f += 'M' + pt(cx + r0 * M.cos(a), cy + r0 * M.sin(a)) + 'Q' + pt(cx + rm * M.cos(am), cy + rm * M.sin(am)) + ' ' + pt(cx + r1 * M.cos(e2), cy + r1 * M.sin(e2));
      }
      o += '<path class="lv-gl-f" d="' + f + '"/>';
      if (T.route) {
        var w = arc(cx, cy, 39.5, 200, 340) + arc(cx, cy, 42.5, 200, 340);
        for (k = 0; k <= 10; k++) { var b = (200 + 14 * k) * R; w += 'M' + pt(cx + 39.5 * M.cos(b), cy + 39.5 * M.sin(b)) + 'L' + pt(cx + 42.5 * M.cos(b), cy + 42.5 * M.sin(b)); }
        o += '<path class="lv-gl-w" d="' + w + '"/>';
      }
      [[-118, 14.5, 9.6, .94, 12], [-62, 15, 10, .9, -8], [-4, 14, 9.2, 1, 0], [58, 15.5, 10, .92, 14], [118, 14.5, 9.6, .95, 0], [178, 14, 9.2, 1, -10]]
        .forEach(function (c) { L.push([cx + c[1] * M.cos(c[0] * R), cy + c[1] * M.sin(c[0] * R), c[2], c[2] * c[3], c[4]]); });
      L.forEach(function (e) { o += cell(e, [e[0] + 1, e[1] + .8, 3.8, 3.3, e[4]], 't'); });
      st = coat(L, nT, 5, 1);
    } else if (T.cellT === 'plasma') {
      var pe = [57, 41, 24, 17.5, -14];
      o += shade(60, 70, 19) + cell(pe, [47.3, 43.4, 9, 8.6, 0], 't');
      st = coat([pe], nT, 6.5, 1);
    } else {
      var be = [57, 41, 21, 21, 0];
      o += shade(60, 74, 17) + cell(be, [59, 43, 13.5, 13, 0], 't');
      st = coat([be], nT, 6.5, 1);
    }

    /* ---- the healthy tissue ---- */
    var hy = T.cellH;
    if (hy === 'gut') {
      var top = [27, 25.8, 27.6, 26.4, 27.2];
      for (k = 0; k < 5; k++) {
        o += '<rect class="lv-gl-c is-h" x="' + n1(129 + 9.4 * k) + '" y="' + top[k] + '" width="9.4" height="' + n1(58 - top[k]) + '" rx="2.2"/>' +
          ell([133.7 + 9.4 * k, 50, 2.5, 3.8], 'lv-gl-n is-h');
      }
      o += '<rect class="lv-gl-bed" x="125" y="57" width="56" height="5" rx="1"/><path class="lv-gl-bm" d="M125 57.5H181"/>';
      for (k = 0; k < nH; k++) { var gx = 129.6 + (k + .5) * 45.8 / nH; sh += spike(gx, top[M.min(4, M.floor((gx - 129) / 9.4))], 0, -1, 5); }
    } else if (hy === 'nerve') {
      var so = [138, 40, 9.5, 9, -10], P0 = [147, 42.5], P1 = [160, 44], P2 = [168, 50.5], P3 = [186, 50.5], nA = M.floor(nH / 2);
      o += ell([158, 64, 30, 2.4], 'lv-gl-sh') +
        '<path class="lv-gl-dn" d="M131.5 34L125 27M127.8 30.4L121.5 31M130.5 45.5L123 50M133.5 48L131 56M186 50.5L192 46M186 50.5L193.5 52.5M186 50.5L190 56.5"/>' +
        '<path class="lv-gl-ax" d="M' + pt(P0[0], P0[1]) + 'C' + pt(P1[0], P1[1]) + ' ' + pt(P2[0], P2[1]) + ' ' + pt(P3[0], P3[1]) + '"/>' +
        '<path class="lv-gl-ax2" d="M' + pt(P0[0], P0[1]) + 'C' + pt(P1[0], P1[1]) + ' ' + pt(P2[0], P2[1]) + ' ' + pt(P3[0], P3[1]) + '"/>' +
        cell(so, [139, 40.5, 4, 3.8, 0], 'h');
      sh = coat([so], nH - nA, 5, 2, [[148.5, 42.5, 5, 3.4, 6], [128, 31, 4, 4, 0], [127, 47, 4, 4, 0], [132, 52, 3, 4, 0]]);
      for (k = 0; k < nA; k++) {
        var t = (k + .6) / (nA + .2), u = 1 - t, sg = k % 2 ? 1 : -1,
          bx = u * u * u * P0[0] + 3 * u * u * t * P1[0] + 3 * u * t * t * P2[0] + t * t * t * P3[0],
          by = u * u * u * P0[1] + 3 * u * u * t * P1[1] + 3 * u * t * t * P2[1] + t * t * t * P3[1],
          dx = 3 * u * u * (P1[0] - P0[0]) + 6 * u * t * (P2[0] - P1[0]) + 3 * t * t * (P3[0] - P2[0]),
          dy = 3 * u * u * (P1[1] - P0[1]) + 6 * u * t * (P2[1] - P1[1]) + 3 * t * t * (P3[1] - P2[1]), dl = M.sqrt(dx * dx + dy * dy) || 1;
        sh += spike(bx + sg * dy / dl * 2.1, by - sg * dx / dl * 2.1, sg * dy / dl, -sg * dx / dl, 4.5);
      }
    } else if (hy === 'lung') {
      /* three air sacs sharing their walls: the lining is the wall, the air is the plate showing through */
      var S3 = [[147, 41, 12], [170, 34, 9.5], [164, 56, 8]], walls = S3.map(function (q) { return [q[0], q[1], q[2] + 3, q[2] + 3, 0]; });
      o += shade(157, 74, 24);
      walls.forEach(function (e) { o += ell(e, 'lv-gl-c is-h'); });
      S3.forEach(function (q) { o += ell([q[0], q[1], q[2], q[2]], 'lv-gl-air'); });
      S3.forEach(function (q, i) {
        [40 + 90 * i, 160 + 90 * i, 280 + 90 * i].forEach(function (a) {
          o += ell([q[0] + (q[2] + 1.5) * M.cos(a * R), q[1] + (q[2] + 1.5) * M.sin(a * R), 2.8, 1, a + 90], 'lv-gl-n is-h');
        });
      });
      sh = coat(walls, nH, 4.5, 2);
    } else if (hy === 'plasma') {
      var he = [152, 44, 14.5, 10.5, -14];
      o += shade(154, 64, 12) + cell(he, [146.2, 45.5, 5.6, 5.3, 0], 'h');
      sh = coat([he], nH, 5, 7);
    } else {
      var le = [152, 44, 11.5, 11.5, 0];
      o += shade(154, 65, 10) + cell(le, [153, 45, 8.6, 8.3, 0], 'h');
      sh = coat([le], nH, 5, 7);
    }
    return '<svg class="lv-gl" viewBox="0 0 200 84" aria-hidden="true" focusable="false">' + o +
      (st ? '<path class="lv-gl-s is-t" d="' + st + '"/>' : '') + (sh ? '<path class="lv-gl-s is-h" d="' + sh + '"/>' : '') + '</svg>' +
      '<span class="lv-spec-k" aria-hidden="true"><span>Tumor</span><span>' + E(T.hn || 'Healthy tissue') + '</span></span>';
  }
  function opt(act, val, on, label, sub, why) {
    return '<button type="button" class="lk-opt" data-act="' + act + '" data-v="' + E(val) + '" aria-pressed="' + (on ? 'true' : 'false') + '"' +
      (why ? ' disabled' : '') + '><span class="lk-opt-l">' + label + '</span>' +
      (sub ? '<span class="lk-opt-s">' + sub + '</span>' : '') + (why ? '<span class="lk-opt-why">' + E(why) + '</span>' : '') + '</button>';
  }
  function grp(label, body) { return '<div class="lv-grp" role="group" aria-label="' + E(label) + '"><p class="lk-kicker">' + E(label) + '</p>' + body + '</div>'; }
  /* a radio pill group: one tab stop, arrow keys move and select (wired in init) */
  function seg(act, items, cur, label) {
    var any = items.some(function (it) { return it[0] === cur; });
    var h = '<div class="lk-seg" data-seg="' + act + '" role="radiogroup" aria-label="' + E(label || act) + '">';
    items.forEach(function (it, i) {
      var on = it[0] === cur, stop = on || (!any && i === 0);
      h += '<button type="button" role="radio" data-act="' + act + '" data-v="' + E(it[0]) + '" aria-checked="' + (on ? 'true' : 'false') + '" tabindex="' + (stop ? '0' : '-1') + '">' + E(it[1]) + '</button>';
    });
    return h + '</div>';
  }
  function step(act, out, minus, plus) {
    return '<div class="lk-step"><button type="button" data-act="' + act + '" data-v="-1" aria-label="Fewer"' + (minus ? '' : ' disabled') + '>−</button>' +
      '<output>' + out + '</output><button type="button" data-act="' + act + '" data-v="1" aria-label="More"' + (plus ? '' : ' disabled') + '>+</button></div>';
  }
  function cvs(key, h, label) {
    return '<canvas class="lk-chart lv-cv" data-c="' + key + '" aria-hidden="true" style="height:' + h + 'px"></canvas>' +
      '<p class="vh" data-sum="' + key + '">' + E(label || '') + '</p>';
  }
  function gradeTag(g, kind) {
    if (!g) return '<span class="lk-dim">none</span>';
    var cls = g >= 3 ? 'lk-loss' : g === 2 ? 'lk-warn' : '';
    return '<span class="' + cls + '">' + kind + '\u00a0' + g + '</span>';
  }

  /* ---------- 3D (assets/3d), loaded on first need. It reads the run and never writes to it. ---------- */
  var D3 = { p: null, dead: false }, RT = [Math.SQRT1_2, 0, -Math.SQRT1_2], RR = 2, PI = Math.PI;
  function need3() {
    var W = window, d = document;
    if (W.PS3D && W.PS3D.v >= 1) return Promise.resolve(W.PS3D);
    return D3.p || (D3.p = new Promise(function (res, rej) {
      var s = d.querySelector('script[src*="/assets/3d/core.js"]'), t = setTimeout(no, 15000);
      function no() { clearTimeout(t); D3.p = null; rej(new Error('3D did not load')); }
      if (!s) { s = d.createElement('script'); s.src = '/assets/3d/core.js?v=3'; s.async = true; d.head.appendChild(s); }
      s.addEventListener('load', function () { if (W.PS3D) { clearTimeout(t); res(W.PS3D); } else no(); });
      s.addEventListener('error', no);
    }));
  }
  function mix(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }
  /* paintRec's gaps (8, 4.5 and 1.5 px): how far from the binder the antigen is held */
  function gapOf(b) { return b === 'fast' ? .2 : b === 'hum' ? .11 : b === 'mur' ? .04 : .12; }
  function head(s, c) { return String(s).split(c)[0]; }
  function atR(k, y) { return [RT[0] * k, y, RT[2] * k]; }
  function ringPt(d, T, r, y) { var a = PI / 2 + 2 * PI * d / T; return [r * Math.cos(a), y || 0, r * Math.sin(a)]; }

  function models3(P) {
    if (P.getModel('car-construct')) return P;
    var B = P.B, M = Math, V3 = P.v3, CI = P.CI, Y1 = -.32, Z = [0, 0, 0];
    /* a sphere of paper facets, each lit by its own normal, with soft shared edges inked only at the silhouette */
    function ball(r, nu, nv, lc) {
      var g = P.geom([]), V = [], N = [], i, j;
      function ix(a, b) { return a * nu + (b + nu) % nu; }
      function at(k) { return V3.scale(V[k], r); }
      function L(a, b, n1, n2) { g.L.push.apply(g.L, at(a).concat(at(b), n1, n2, [1, CI[lc || 'ink'], 0, 1, 1])); }
      for (j = 0; j <= nv; j++) for (i = 0; i < nu; i++) V.push([M.sin(PI * j / nv) * M.cos(2 * PI * i / nu), M.cos(PI * j / nv), M.sin(PI * j / nv) * M.sin(2 * PI * i / nu)]);
      for (j = 0; j < nv; j++) for (i = 0; i < nu; i++) {
        var q = [ix(j, i), ix(j + 1, i), ix(j + 1, i + 1), ix(j, i + 1)];
        N.push(V3.norm(V3.add(V3.add(V[q[0]], V[q[1]]), V3.add(V[q[2]], V[q[3]]))));
        g.F.push({ p: at(q[0]).concat(at(q[1]), at(q[2]), at(q[3])), n: N[N.length - 1], c: CI.card, a: 1, ds: true, t: null });
      }
      for (j = 0; j < nv; j++) for (i = 0; i < nu; i++) {
        L(ix(j, i), ix(j + 1, i), N[ix(j, i)], N[ix(j, i - 1)]);
        if (j) L(ix(j, i), ix(j, i + 1), N[ix(j, i)], N[ix(j - 1, i)]);
      }
      return P._finish(g);
    }
    /* proteins on a golden-angle spiral, each with its own normal: a receptor (fork, Y) or an antigen (T) */
    function sticks(r, n, len, hd, seed, fork, to) {
      var out = [], k;
      for (k = 0; k < n; k++) {
        var y = 1 - 2 * (k + .5) / n, w = M.sqrt(1 - y * y), f = k * 2.39996 + seed, d = [w * M.cos(f), y, w * M.sin(f)];
        if (to && V3.dot(d, to) < .42) continue;
        var u = V3.scale(V3.norm(V3.cross(d, M.abs(y) < .9 ? [0, 1, 0] : [1, 0, 0])), hd), b = V3.scale(d, r + len), t = V3.add(b, V3.scale(d, hd * 1.4));
        out.push(B.lines(V3.scale(d, r).concat(b, fork ? b.concat(V3.add(t, u), b, V3.sub(t, u)) : V3.sub(b, u).concat(V3.add(b, u))), { n: d, w: 1.35 }));
      }
      return out;
    }
    function rect(y, w, d, m) { return B.path([[-w, y, -d], [w, y, -d], [w, y, d], [-w, y, d]], { closed: true, mat: m }); }
    function loop(r, o) { var a = [], i; for (i = 0; i < 28; i++) a.push([r * M.cos(i * PI / 14), r * M.sin(i * PI / 14), 0]); return B.path(a, mix({ closed: true }, o)); }
    function geo(n, s) { if (n) n.setGeom(P.geom(s)); }
    function lz(root) { return root.lz || (root.lz = {}); }

    /* ---- the receptor: five domains across a membrane, the vector beside it ---- */
    function hl(p) { return p.htm === 'cd8' ? .84 : p.htm === 'cd28h' ? .62 : .72; }
    function low(p) { return Y1 - .04 - (p.costim === 'dual' ? .72 : p.costim === 'bb' ? .4 : .34); }
    function mt(on, o) { return mix({ mat: on ? 'paper' : 'ghost' }, o); }
    var REC = {
      ag: function (p) { var y = hl(p) + .34 + gapOf(p.binder); return [B.box(0, y, 0, .24, .2, .24, mt(p.ag)), rect(y + .2, .86, .54, 'ghost')]; },
      binder: function (p) { var y = hl(p), o = mt(p.binder, { seg: 14 }); return [B.cyl([-.14, y, 0], .13, .34, o), B.cyl([.14, y, 0], .13, .34, o), B.path([[-.14, y + .34, 0], [0, y + .42, 0], [.14, y + .34, 0]], o)]; },
      htm: function (p) {
        var h = [], i;
        for (i = 0; i <= 48; i++) h.push([.09 * M.cos(i * PI / 8), Y1 - Y1 * i / 48, .09 * M.sin(i * PI / 8)]);
        return [B.box(0, 0, 0, .09, hl(p), .09, mt(p.htm)), B.path(h, mt(p.htm, { w: 1 }))];
      },
      costim: function (p) {
        var t = Y1 - .04, o = mt(p.costim);
        function hx(y) { return B.cyl([0, y - .4, 0], .2, .4, mt(p.costim, { seg: 6 })); }
        return p.costim === 'bb' ? [hx(t)] : p.costim === 'dual' ? [B.box(0, t - .3, 0, .3, .3, .3, o), hx(t - .32)] : [B.box(0, t - .34, 0, .36, .34, .36, o)];
      },
      zeta: function (p) { var t = low(p) - .08; return [B.box(0, t - .9, 0, .17, .9, .17), rect(t - .22, .13, .13, 'quiet'), rect(t - .48, .13, .13, 'quiet'), rect(t - .74, .13, .13, 'quiet')]; },
      vec: function (p) { var o = mt(p.vector); return p.vector === 'nonv' ? [loop(.17, o), loop(.11, o)] : [B.sphere(Z, .15, o)].concat(p.vector ? sticks(.15, 14, .07, .025, 0) : []); }
    };
    var AX = { ag: [0, 1, 0], binder: [0, 1, 0], htm: [0, 1, 0], costim: [0, -1, 0], zeta: [0, -1, 0], vec: [-1, .4, 0] };
    function part(id, n, name, ex, pos) { return { id: id, n: n, name: name, explode: ex, pos: pos, children: [{ id: 'g-' + id }] }; }
    P.model('car-construct', {
      title: 'Your receptor', views: { iso: { yaw: 32, pitch: 14 } }, fill: .94,
      parts: [
        { id: 'mem', pick: false, shapes: [B.box(0, Y1, 0, 2.3, -Y1, 1.5, { mat: 'quiet', faceA: .38, edges: false }), rect(0, 1.15, .75, 'quiet'), rect(Y1, 1.15, .75, 'quiet')] },
        part('ag', 1, 'Antigen', [0, .42, 0]), part('binder', 2, 'Binder', [0, .26, 0]), part('htm', 3, 'Hinge and transmembrane'),
        part('costim', 4, 'Costimulatory domain', [0, -.22, 0]), part('zeta', 5, 'Signaling tail', [0, -.4, 0]), part('vec', 6, 'Vector', [-.28, .14, 0], [-.9, .55, .4])
      ],
      update: function (root, p, ctx) {
        var R = root.parts, f = {}, T = LV_TARGETS[p.ag], y = hl(p), c = p.drop && !ctx.init && R['g-' + p.drop], k;
        for (k in REC) geo(R['g-' + k], REC[k](p));
        function put(id, fig, why, an) { f[id] = fig; R[id].why = why; R[id].anchor = an; }
        function pick(id, tab, v, sep, def, an) { put(id, v ? head(tab[v].nm, sep) : 'Not chosen', v ? tab[v].s : def, an); }
        put('ag', T ? T.nm : 'No target yet', 'The protein your receptor grips on the tumor cell. A tighter binder holds it closer.', [.5, y + .44 + gapOf(p.binder), 0]);
        pick('binder', LV_BINDER, p.binder, ',', DEFS.scfv.d, [.5, y + .17, 0]);
        pick('htm', LV_HTM, p.htm, ' hinge', DEFS.hinge.d, [.5, y * .45, 0]);
        pick('costim', LV_COSTIM, p.costim, ',', DEFS.costim.d, [.5, Y1 - .24, 0]);
        put('zeta', 'CD3 zeta', DEFS.zeta.d, [.5, low(p) - .55, 0]);
        pick('vec', LV_VECTOR, p.vector, ' (', DEFS.transduce.d, [0, .27, 0]);
        /* the domain you chose drops in on a spring */
        if (c) {
          var ax = AX[p.drop], v = ctx.view;
          if (c.sp) c.sp.stop();
          c.pos = V3.scale(ax, .8); c.alpha = .05;
          c.sp = P.spring({ k: 150, c: 17, x: 1, target: 0, eps: 1e-4, onUpdate: function (x) { c.pos = V3.scale(ax, .8 * x); c.alpha = M.max(.05, M.min(1, 1 - x)); v.invalidate(); } });
        }
        return { figs: f };
      }
    });

    /* ---- the cells: tumor and healthy tissue (Act I), then your T cell at the tumor (Act IV) ---- */
    P.model('car-cells', {
      title: 'A tumor cell and a healthy cell', views: { iso: { yaw: 45, pitch: 18 } }, fill: .9,
      build: function (B2, p) {
        var o = [{ id: 'dish', pick: false, layer: -1, shapes: [B.cyl([0, -.1, 0], 2.5, .1, { seg: 72 })] },
          { id: 'tumor', n: 1, name: 'Tumor cell', pos: atR(-1.2, 1.05), anchor: [0, 1.22, 0], children: [{ geom: ball(1, 40, 20) }, { id: 'tumor-s', layer: 1 }] }];
        if (p.mode !== 4) o.push({ id: 'healthy', n: 2, name: 'Healthy tissue', pos: atR(1.45, .85), anchor: [0, .9, 0], children: [{ geom: ball(.72, 34, 17, 'ink2') }, { id: 'healthy-s', layer: 1 }] });
        else o.push({ id: 'tcell', n: 2, name: 'Your CAR-T cell', anchor: [0, .74, 0], children: [{ geom: ball(.55, 32, 16) }, { geom: P.geom(sticks(.55, 72, .12, .05, 3, 1, [-RT[0], 0, -RT[2]])), layer: 1 }] },
          { id: 'burst', n: 3, name: 'Cytokine release', anchor: [0, .3, 0], layer: 1 });
        return o;
      },
      update: function (root, p, ctx) {
        var R = root.parts, Q = lz(root), v = ctx.view, T = LV_TARGETS[p.t] || LV_TARGETS.cd19, f = { tumor: T.nm }, t = R.tcell, b = R.burst;
        if (Q.t !== p.t) {
          var s = [R['tumor-s'], R['healthy-s']].filter(Boolean);
          geo(s[0], sticks(1, M.round(12 + 60 * T.dens), .2, .05, 1));
          geo(s[1], sticks(.72, M.round(64 * T.oot), .17, .045, 2));
          if (!ctx.init) {
            if (Q.fd) Q.fd();
            s.forEach(function (n) { n.alpha = 0; });
            Q.fd = P.tween({ dur: 320, update: function (k) { s.forEach(function (n) { n.alpha = k; }); v.invalidate(); } });
          }
          Q.t = p.t;
        }
        R.tumor.why = T.why;
        if (R.healthy) { R.healthy.why = W_OOT; f.healthy = T.ootKind.charAt(0).toUpperCase() + T.ootKind.slice(1); }
        if (t) {
          var home = atR(.67 + p.gap, 1.05), far = atR(1.4 + p.gap, 1.05), key = p.pid + '|' + p.crs;
          b.pos = atR(p.gap / 2, 1.05);
          if (Q.k !== key) {
            /* the burst: particles only, more of them for a worse event; never a number */
            var g = P.geom([]), rnd = B.rng(p.pid * 7919 + 13), n = [0, 12, 24, 40, 60][p.crs] || 0, sp = .5 + .25 * p.crs;
            while (n--) {
              var d = [rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1], r = sp * (.3 + .7 * rnd());
              d = V3.scale(V3.norm(V3.sub(d, V3.scale(RT, V3.dot(d, RT) * .85))), r);
              g.S.push(d[0], d[1] * .8, d[2], -5 - 3 * rnd(), CI.accent, -1, 1);
            }
            b.setGeom(P._finish(g)); Q.k = key;
          }
          f.tcell = p.b ? head(LV_BINDER[p.b].nm, ',') : 'Your receptor';
          t.why = p.b ? LV_BINDER[p.b].s : DEFS.affinity.d; b.why = DEFS.crs.d;
          t.visible = !p.pid || p.inf; b.visible = !!(p.inf && p.crs);
          if (Q.tw) Q.tw();
          t.pos = p.pid ? home : far; b.scl = [1, 1, 1];
          if (p.play && p.inf && !ctx.init) {
            /* contact at the binder's gap, then the burst */
            t.pos = far; b.scl = [.02, .02, .02];
            Q.tw = P.tween({ dur: 440, update: function (k) { t.pos = V3.lerp(far, home, k); v.invalidate(); }, done: function () {
              Q.tw = P.tween({ dur: 660, update: function (k) { k = .02 + .98 * k; b.scl = [k, k, k]; v.invalidate(); } });
            } });
          }
        }
        return { figs: f };
      }
    });

    /* ---- vein to vein as a loop, one tick a day ---- */
    var VAN = [B.box(-.05, 0, 0, .24, .13, .14), B.box(.13, 0, 0, .1, .09, .14)];
    P.model('vein-ring', {
      title: 'Vein to vein', views: { iso: { yaw: 45, pitch: 36 } }, fill: .86,
      build: function (B2, p) {
        var o = [
          { id: 'plinth', pick: false, layer: -1, shapes: [B.cyl([0, -.12, 0], 2.75, .12, { mat: 'quiet', seg: 72 })] },
          { id: 'track', pick: false },
          { id: 'hosp', n: 1, name: 'Hospital', children: [{ id: 'hosp-g' }, { id: 'hosp-b', shapes: [B.box(.1, 0, 0, 1.02, .04, .62, { mat: 'plaster' }), B.box(0, .04, 0, .56, .46, .42), B.box(.42, .04, .02, .3, .24, .48)] }] },
          { id: 'queue', n: 2, name: 'The queue' },
          { id: 'fac', n: 3, name: 'Factory', children: [{ id: 'fac-g' }, { id: 'fac-b', shapes: [B.box(0, 0, 0, 1.04, .05, .6, { mat: 'plaster' }),
            B.cyl([-.3, .05, 0], .1, .2, { seg: 18 }), B.cyl([0, .05, 0], .1, .2, { seg: 18 }), B.cyl([.3, .05, 0], .1, .2, { seg: 18 }),
            B.box(0, .05, 0, .96, .32, .52, { mat: 'glass' }), B.box(-.24, .37, 0, .3, .1, .24, { mat: 'quiet' })] }] },
          { id: 'cour', n: 4, name: 'Courier', children: [{ id: 'cour-g' }, { id: 'van1', shapes: VAN }, { id: 'van2', shapes: VAN }] },
          { id: 'pt', pick: false, visible: false, shapes: [B.sphere(Z, -11, { face: 'accent', line: 'accent' })] }
        ];
        if (p.act === 4) o.push({ id: 'lost', n: 5, name: 'Lost while waiting' }, { id: 'oos', n: 6, name: 'Out of specification' });
        return o;
      },
      update: function (root, p, ctx) {
        var R = root.parts, Q = lz(root), v = ctx.view, T = M.max(1, p.tot), A = p.auto, f = {}, c1 = 1 + p.q, c2 = c1 + p.days + 3, tk = [], d;
        function arc(d0, d1, o) { var s = [], n = M.max(2, M.ceil((d1 - d0) / T * 96)), i; for (i = 0; i <= n; i++) s.push(ringPt(d0 + (d1 - d0) * i / n, T, RR, .02)); return B.path(s, o); }
        function seat(n, dd, r) { n.pos = ringPt(dd, T, r); n.rot = P.q.y(-180 - 360 * dd / T); }
        function put(id, fig, why, an) { f[id] = fig; R[id].why = why; R[id].anchor = an; }
        for (d = 0; d < T; d++) tk.push.apply(tk, ringPt(d, T, RR + .07, .01).concat(ringPt(d, T, RR + (d % 7 ? .15 : .28), .01)));
        geo(R.track, [arc(0, T, { mat: 'quiet' }), B.lines(tk, { mat: 'quiet' })]);
        geo(R['hosp-g'], [arc(0, A ? 1 : T, { w: 2 })]);
        geo(R.queue, A && p.q ? [arc(1, c1, { mat: 'foil', w: 2 })] : []);
        geo(R['fac-g'], A ? [arc(c1, c2, { w: 2 })] : []);
        geo(R['cour-g'], A ? [arc(c2, T, { w: 2, dash: 4 })] : []);
        seat(R['hosp-b'], 0, RR - .74); seat(R['fac-b'], A ? (c1 + c2) / 2 : T / 2, RR - .78);
        seat(R.van1, A ? c1 : T * .3, RR - .32); seat(R.van2, A ? (c2 + T) / 2 : T * .8, RR - .32);
        R.fac.alpha = R.cour.alpha = A ? 1 : .3;
        put('hosp', 'Day 0 and day ' + T, DEFS.apheresis.d, V3.add(R['hosp-b'].pos, [0, .5, 0]));
        put('queue', A && p.q ? p.q + ' days' : 'No wait', W_QUE, ringPt(A ? 1 + p.q / 2 : 0, T, RR, .04));
        put('fac', A ? p.days + ' days, then 3 to release' : 'Not needed', W_CUL, V3.add(R['fac-b'].pos, [0, .45, 0]));
        put('cour', A ? p.ret + ' days back' : 'Not needed', 'Cryopreservation' + W_CRY + '.', V3.add(R.van2.pos, [0, .16, 0]));
        /* Act IV: lost patients drop off as dots, failed batches as rings */
        function dots(n, cnt, dm, fc, key, fig, why) {
          var g = P.geom([]), S0 = g.S, fr = [], to = [], was = Q[key] || 0, fly = !ctx.init && cnt > was && !P.reduced(), i;
          for (i = 0; i < cnt; i++) {
            var dd = dm + (i - (cnt - 1) / 2) * T / 40;
            to.push(ringPt(dd, T, RR + .48 + i % 2 * .14, .15)); fr.push(ringPt(dd, T, RR, .15));
            S0.push.apply(S0, (fly && i >= was ? fr : to)[i].concat([-9, fc, CI.ink, 1]));
          }
          n.setGeom(P._finish(g));
          put(n.id, cnt + ' ' + fig, why, ringPt(dm, T, RR + .55, .06));
          if (fly) P.tween({ dur: 560, update: function (k) {
            for (var j = was; j < cnt; j++) { S0[j * 7] = fr[j][0] + (to[j][0] - fr[j][0]) * k; S0[j * 7 + 1] = .15 + .32 * M.sin(PI * k); S0[j * 7 + 2] = fr[j][2] + (to[j][2] - fr[j][2]) * k; }
            n.touch(); v.invalidate();
          } });
          Q[key] = cnt;
        }
        if (R.lost) {
          dots(R.lost, p.lost, A ? 1 + p.q / 2 : T / 2, CI.ink, 'nl', F.plural(p.lost, 'patient'), W_LOST);
          dots(R.oos, p.oos, A ? c2 - 1 : T / 2, -1, 'no', F.plural(p.oos, 'batch', 'batches'), W_OOS);
        }
        /* one trip round when the loop changes length, then rest */
        if (p.trip && !ctx.init && !P.reduced()) {
          var pn = R.pt;
          if (Q.tr) Q.tr();
          pn.visible = true;
          Q.tr = P.tween({ dur: 1100, ease: 'io', update: function (k) { pn.pos = ringPt(T * k, T, RR, .18); v.invalidate(); }, done: function () { pn.visible = false; v.invalidate(); } });
        }
        return { figs: f };
      }
    });
    /* ---- Act V: who the therapy reaches. Four slabs a year, each as wide as its number, stacked from the people who qualify
       to the ones in durable remission. A slab the run has not decided yet is a dashed outline. ---- */
    var ACC = [['q', 'Qualify each year'], ['r', 'Reached by label, price and map'], ['t', 'Treated, factory limit'], ['d', 'In durable remission']];
    P.model('car-access', {
      title: 'Who your therapy reaches', views: { iso: { yaw: 22, pitch: 24 } }, fill: .88,
      build: function (B2, p) {
        var o = [{ id: 'base', pick: false, layer: -1, shapes: [B.box(0, -.1, 0, 3.5, .1, 1.1)] }];
        ACC.forEach(function (a, i) { o.push({ id: a[0], n: i + 1, name: a[1] }); });
        return o;
      },
      update: function (root, p, ctx) {
        var R = root.parts, Q = lz(root), v = ctx.view, f = {}, vals = [p.q, p.r, p.t, p.d], mx = M.max(1, p.q || 1), to = [], i;
        for (i = 0; i < 4; i++) to.push(vals[i] == null ? -1 : M.max(.03, 3 * vals[i] / mx));
        function draw(ws) {
          for (var j = 0; j < 4; j++) {
            var a = ACC[j], w = ws[j] < 0 ? 3 : ws[j], y = j * .24;
            geo(R[a[0]], [B.box(0, y, 0, w, .2, .72, { mat: ws[j] < 0 ? 'ghost' : j === 3 ? 'foil' : 'paper' })]);
            R[a[0]].anchor = [w / 2, y + .2, .36];
          }
        }
        for (i = 0; i < 4; i++) f[ACC[i][0]] = vals[i] == null ? '–' : F.n(M.round(vals[i]));
        /* the slabs ease to their new widths when a lever moves them; a slab that turns from dashed to solid simply appears */
        var was = Q.w, moved = was && !ctx.init && !P.reduced();
        if (Q.tw) Q.tw();
        function at(k) { var ws = [], j; for (j = 0; j < 4; j++) ws.push(to[j] < 0 || was[j] < 0 ? to[j] : was[j] + (to[j] - was[j]) * k); return ws; }
        if (moved) {
          draw(at(0));
          Q.tw = P.tween({ dur: 420, update: function (k) { draw(at(k)); v.invalidate(); } });
        } else draw(to);
        Q.w = to;
        return { figs: f };
      }
    });
    return P;
  }

  /* ---------- registered posters for the hall: the first frame of a drawing, at rest, in the hall's stage tokens ----------
     cells: Act I at CD19 (16:10), written from the live explorer's own camera as smooth vector (lit dish, lit cells, the antigen
     in front of and behind each cell). rec: Act II before any decision (5:4), from PS3D.debug.poster. See posterFor. */
  var LV_POSTER = {
    cells: '<svg xmlns="http://www.w3.org/2000/svg" class="ps3d-poster lvp" data-reg="1" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><style>.lvp .lvp-dish{fill:var(--m-plaster)}.lvp .lvp-side{fill:var(--m-left)}.lvp .lvp-cell{fill:url(#lvpg)}.lvp .lvp-s1{stop-color:var(--m-top)}.lvp .lvp-s2{stop-color:var(--m-left)}.lvp .lvp-s3{stop-color:var(--m-right)}.lvp .lvp-sh{fill:var(--m-shadow);opacity:.32;filter:url(#lvpb)}.lvp :is(.lvp-sil,.lvp-rim,.lvp-ag){fill:none;stroke:var(--m-sil);stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.lvp .lvp-sil{stroke-width:1.4px;stroke-opacity:.9}.lvp .lvp-rim{stroke-width:0.7px;stroke-opacity:.42}.lvp .lvp-ag{stroke-width:1.1px;stroke-opacity:.55}</style><defs><radialGradient id="lvpg" cx=".36" cy=".3" r=".78" fx=".3" fy=".24"><stop offset="0" class="lvp-s1"/><stop offset=".55" class="lvp-s2"/><stop offset="1" class="lvp-s3"/></radialGradient><filter id="lvpb" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7"/></filter></defs><path class="lvp-side" d="M116.4 259.7L116.8 263.8L118.1 267.9L120.3 271.9L123.3 275.9L127.2 279.9L131.9 283.7L137.4 287.5L143.6 291.1L150.7 294.6L158.4 298L166.9 301.1L176 304.2L185.7 307L196 309.6L206.9 312L218.2 314.2L229.9 316.1L242.1 317.8L254.5 319.2L267.3 320.4L280.3 321.4L293.4 322L306.7 322.4L320 322.6L333.3 322.4L346.6 322L359.7 321.4L372.7 320.4L385.5 319.2L397.9 317.8L410.1 316.1L421.8 314.2L433.1 312L444 309.6L454.3 307L464 304.2L473.1 301.1L481.6 298L489.3 294.6L496.4 291.1L502.6 287.5L508.1 283.7L512.8 279.9L516.7 275.9L519.7 271.9L521.9 267.9L523.2 263.8L523.6 259.7L523.6 267.4L523.2 271.5L521.9 275.6L519.7 279.7L516.7 283.7L512.8 287.6L508.1 291.5L502.6 295.2L496.4 298.9L489.3 302.4L481.6 305.7L473.1 308.9L464 311.9L454.3 314.7L444 317.3L433.1 319.7L421.8 321.9L410.1 323.8L397.9 325.5L385.5 327L372.7 328.2L359.7 329.1L346.6 329.8L333.3 330.2L320 330.3L306.7 330.2L293.4 329.8L280.3 329.1L267.3 328.2L254.5 327L242.1 325.5L229.9 323.8L218.2 321.9L206.9 319.7L196 317.3L185.7 314.7L176 311.9L166.9 308.9L158.4 305.7L150.7 302.4L143.6 298.9L137.4 295.2L131.9 291.5L127.2 287.6L123.3 283.7L120.3 279.7L118.1 275.6L116.8 271.5L116.4 267.4Z"/><path class="lvp-dish" d="M464 304.2L454.3 307L444 309.6L433.1 312L421.8 314.2L410.1 316.1L397.9 317.8L385.5 319.2L372.7 320.4L359.7 321.4L346.6 322L333.3 322.4L320 322.6L306.7 322.4L293.4 322L280.3 321.4L267.3 320.4L254.5 319.2L242.1 317.8L229.9 316.1L218.2 314.2L206.9 312L196 309.6L185.7 307L176 304.2L166.9 301.1L158.4 298L150.7 294.6L143.6 291.1L137.4 287.5L131.9 283.7L127.2 279.9L123.3 275.9L120.3 271.9L118.1 267.9L116.8 263.8L116.4 259.7L116.8 255.5L118.1 251.4L120.3 247.4L123.3 243.4L127.2 239.4L131.9 235.6L137.4 231.8L143.6 228.2L150.7 224.7L158.4 221.3L166.9 218.2L176 215.2L185.7 212.3L196 209.7L206.9 207.3L218.2 205.2L229.9 203.2L242.1 201.5L254.5 200.1L267.3 198.9L280.3 197.9L293.4 197.3L306.7 196.9L320 196.7L333.3 196.9L346.6 197.3L359.7 197.9L372.7 198.9L385.5 200.1L397.9 201.5L410.1 203.2L421.8 205.2L433.1 207.3L444 209.7L454.3 212.3L464 215.2L473.1 218.2L481.6 221.3L489.3 224.7L496.4 228.2L502.6 231.8L508.1 235.6L512.8 239.4L516.7 243.4L519.7 247.4L521.9 251.4L523.2 255.5L523.6 259.7L523.2 263.8L521.9 267.9L519.7 271.9L516.7 275.9L512.8 279.9L508.1 283.7L502.6 287.5L496.4 291.1L489.3 294.6L481.6 298L473.1 301.1Z"/><path class="lvp-sil" d="M116.4 259.7L116.8 263.8L118.1 267.9L120.3 271.9L123.3 275.9L127.2 279.9L131.9 283.7L137.4 287.5L143.6 291.1L150.7 294.6L158.4 298L166.9 301.1L176 304.2L185.7 307L196 309.6L206.9 312L218.2 314.2L229.9 316.1L242.1 317.8L254.5 319.2L267.3 320.4L280.3 321.4L293.4 322L306.7 322.4L320 322.6L333.3 322.4L346.6 322L359.7 321.4L372.7 320.4L385.5 319.2L397.9 317.8L410.1 316.1L421.8 314.2L433.1 312L444 309.6L454.3 307L464 304.2L473.1 301.1L481.6 298L489.3 294.6L496.4 291.1L502.6 287.5L508.1 283.7L512.8 279.9L516.7 275.9L519.7 271.9L521.9 267.9L523.2 263.8L523.6 259.7L523.6 267.4L523.2 271.5L521.9 275.6L519.7 279.7L516.7 283.7L512.8 287.6L508.1 291.5L502.6 295.2L496.4 298.9L489.3 302.4L481.6 305.7L473.1 308.9L464 311.9L454.3 314.7L444 317.3L433.1 319.7L421.8 321.9L410.1 323.8L397.9 325.5L385.5 327L372.7 328.2L359.7 329.1L346.6 329.8L333.3 330.2L320 330.3L306.7 330.2L293.4 329.8L280.3 329.1L267.3 328.2L254.5 327L242.1 325.5L229.9 323.8L218.2 321.9L206.9 319.7L196 317.3L185.7 314.7L176 311.9L166.9 308.9L158.4 305.7L150.7 302.4L143.6 298.9L137.4 295.2L131.9 291.5L127.2 287.6L123.3 283.7L120.3 279.7L118.1 275.6L116.8 271.5L116.4 267.4Z"/><path class="lvp-rim" d="M464 304.2L454.3 307L444 309.6L433.1 312L421.8 314.2L410.1 316.1L397.9 317.8L385.5 319.2L372.7 320.4L359.7 321.4L346.6 322L333.3 322.4L320 322.6L306.7 322.4L293.4 322L280.3 321.4L267.3 320.4L254.5 319.2L242.1 317.8L229.9 316.1L218.2 314.2L206.9 312L196 309.6L185.7 307L176 304.2L166.9 301.1L158.4 298L150.7 294.6L143.6 291.1L137.4 287.5L131.9 283.7L127.2 279.9L123.3 275.9L120.3 271.9L118.1 267.9L116.8 263.8L116.4 259.7L116.8 255.5L118.1 251.4L120.3 247.4L123.3 243.4L127.2 239.4L131.9 235.6L137.4 231.8L143.6 228.2L150.7 224.7L158.4 221.3L166.9 218.2L176 215.2L185.7 212.3L196 209.7L206.9 207.3L218.2 205.2L229.9 203.2L242.1 201.5L254.5 200.1L267.3 198.9L280.3 197.9L293.4 197.3L306.7 196.9L320 196.7L333.3 196.9L346.6 197.3L359.7 197.9L372.7 198.9L385.5 200.1L397.9 201.5L410.1 203.2L421.8 205.2L433.1 207.3L444 209.7L454.3 212.3L464 215.2L473.1 218.2L481.6 221.3L489.3 224.7L496.4 228.2L502.6 231.8L508.1 235.6L512.8 239.4L516.7 243.4L519.7 247.4L521.9 251.4L523.2 255.5L523.6 259.7L523.2 263.8L521.9 267.9L519.7 271.9L516.7 275.9L512.8 279.9L508.1 283.7L502.6 287.5L496.4 291.1L489.3 294.6L481.6 298L473.1 301.1Z"/><ellipse class="lvp-sh" cx="454.2" cy="259.7" rx="63.6" ry="20.4"/><ellipse class="lvp-sh" cx="238.4" cy="259.7" rx="85.1" ry="27.2"/><path class="lvp-ag" d="M461.3 151.9L466.7 142.1M463.5 141.5L470 142.6M389.1 193.6L377.6 193.6M375.6 194.5L379.5 192.6M488.1 218.9L499.9 224.8M499.2 223.7L500.5 225.9"/><circle class="lvp-cell" cx="438.1" cy="193.8" r="58.7"/><circle class="lvp-sil" cx="438.1" cy="193.8" r="58.7"/><path class="lvp-ag" d="M407.7 150.8L400.6 140.7M401.8 141.7L399.3 139.6M453.5 201.7L457.1 203.6M460.6 203.3L453.6 203.9M418.5 248.3L413.9 261.1M416.8 261.8L411 260.5"/><path class="lvp-ag" d="M237.2 99.2L240.2 83.4M236.5 83L244 83.9M212.5 104.5L210.6 89.7M206.6 90L214.6 89.5M263.8 113.7L272.2 100.7M269.2 99.9L275.2 101.6M178 117.2L169.2 105M166.2 105.8L172.2 104.1M234.3 117.2L236.7 105M232.7 104.8L240.7 105.2M152.3 137L138.3 128.8M137.3 130L139.4 127.6M287.4 134.4L300.5 125.7M298.6 124.6L302.4 126.8M193.3 127.7L187.5 117.6M183.8 118.1L191.3 117.1M261.2 134.9L269 126.2M265.5 125.5L272.5 126.8M157.4 146L144.4 139.5M142.1 140.6L146.8 138.5M301.2 159L317 155.1M316.5 153.8L317.6 156.3M218.8 141.6L218.1 134.3M214 134.3L222.1 134.2M141.3 169.7L125.1 167.9M124.9 169.2L125.2 166.7M284.5 156.8L297 152.5M294.4 151.5L299.6 153.5M175.6 156.6L166.3 152.3M162.9 153L169.6 151.5M246.8 159.8L251.7 156M247.8 155.7L255.6 156.4M147.6 178.4L132.7 178.4M131.1 179.6L134.3 177.3M297.9 181.7L313.1 182.4M311.7 181.2L314.5 183.5M201.8 170.7L197.7 169.1M193.8 169.4L201.6 168.8M269.8 181.8L279.4 182.5M276.1 181.8L282.6 183.3M166.1 189.2L154.8 191.4M152.1 192.3L157.6 190.5M297.8 207.4L312.9 213.3M312.9 212L312.9 214.5M228.9 189L230.2 191.2M226.2 191.1L234.3 191.3M152.2 212.1L138.2 218.8M137.5 220.1L138.9 217.6M281.3 206.6L293.1 212.2M291 211.2L295.3 213.3M191.6 204L185.4 209.2M181.8 209.8L189 208.6M248.6 211.6L253.8 218.3M250.1 217.8L257.5 218.8M172.6 224.2L162.6 233.4M160.6 234.5L164.7 232.3M276.1 231.7L286.9 242.4M286 241.2L287.8 243.6M216 224.4L214.7 233.6M210.7 233.8L218.8 233.4M179 244.5L170.4 257.7M170.5 258.9L170.2 256.4M250.3 237.5L255.9 249.4M253 248.5L258.8 250.3M203.2 243.3L199.4 256.3M202.3 255.3L196.5 257.3M245.3 253.5L249.9 268.6M252.7 267L247.1 270.1M211.1 257.1L208.9 272.8M211.7 272.6L206.1 273.1"/><circle class="lvp-cell" cx="222.2" cy="178.3" r="81.5"/><circle class="lvp-sil" cx="222.2" cy="178.3" r="81.5"/><path class="lvp-ag" d="M219.4 106L218.8 91.5M215.9 93L221.6 90.1M210.5 97.8L208.2 81.8M205.3 82.4L211.1 81.2M250.7 109L256.4 95.1M253.6 95.3L259.3 94.9M190.5 113L184.2 99.9M181.6 102.3L186.8 97.5M237.2 125.2L240.2 114.6M244 114.2L236.3 115M180.8 108.2L172.5 94.2M170.6 95.3L174.4 93.1M270.3 113L279.9 99.9M278.8 98.7L281 101.1M194.1 132.9L188.5 123.8M191.9 124.4L185 123.1M267.9 134.2L277.1 125.4M279.6 124.4L274.6 126.4M162.8 127.2L150.9 117M151.3 118.3L150.6 115.8M222.4 149.5L222.4 143.8M226.5 143.8L218.3 143.8M289 136L302.3 127.5M302.7 126.2L302 128.7M168 149.2L157.1 143.4M159.6 144.4L154.6 142.4M260.6 159.2L268.2 155.4M271.7 154.7L264.8 156M196.8 168.8L191.7 166.9M195.5 167.3L187.9 166.4M291.5 161.4L305.3 158M307.1 156.8L303.6 159.1M148.6 160.7L133.9 157.2M135.1 158.4L132.7 156M239.3 181.6L242.7 182.2M246.6 181.9L238.7 182.5M170.7 183.3L160.4 184.3M163.5 185.1L157.3 183.5M279.4 186.3L290.8 187.9M293.7 187L287.9 188.8M211.6 200L209.4 204.4M213.4 204.5L205.4 204.2M301.7 184.9L317.6 186.2M318.5 184.9L316.8 187.4M151.7 194.1L137.6 197.2M139.6 198.3L135.6 196.1M256.4 208.6L263.2 214.6M266.9 214.1L259.5 215.1M185.1 214.2L177.7 221.4M181.3 222L174.1 220.8M288.9 209.8L302.2 216.1M304.4 215L300 217.1M144.8 202.9L129.4 207.8M130.1 209.1L128.7 206.6M228.8 226.8L230.1 236.5M234.1 236.4L226 236.6M167.1 225L156.1 234.4M158.8 235.3L153.4 233.4M266.1 231.6L274.9 242.3M278.1 241.5L271.7 243M204.3 240.7L200.7 253.2M204.6 253.5L196.8 252.8M283.6 231.6L295.8 242.2M297.2 241L294.4 243.4M163.4 234.2L151.6 245.3M153.2 246.5L150.1 244.2M239.9 248.6L243.5 262.7M247.4 262.3L239.6 263.1M191.9 250.8L185.8 265.2M189.1 266L182.5 264.5M257.9 251.1L265 265.7M267.6 264.7L262.4 266.6M220.5 259.1L220.2 275.2M222.9 275.7L217.5 274.8"/></svg>',
    rec: '<svg xmlns="http://www.w3.org/2000/svg" class="ps3d-poster" data-reg="1" data-v="2" viewBox="0 0 560 448" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><style>.ps3d-poster[data-v="2"] .p-top{fill:var(--m-top,color-mix(in srgb,var(--paper) 55%,#fff))}.ps3d-poster[data-v="2"] .p-left{fill:var(--m-left,color-mix(in srgb,var(--paper) 88.5%,#74654A))}.ps3d-poster[data-v="2"] .p-right{fill:var(--m-right,color-mix(in srgb,var(--paper) 70%,#74654A))}.ps3d-poster[data-v="2"] .p-plaster{fill:var(--m-plaster,color-mix(in srgb,var(--paper) 94%,var(--ink)))}.ps3d-poster[data-v="2"] .p-foil{fill:var(--m-foil,var(--accent))}.ps3d-poster[data-v="2"] .p-metal{fill:var(--m-metal-hi,color-mix(in srgb,var(--muted) 45%,var(--paper)))}.ps3d-poster[data-v="2"] .p-metal.p-lo{fill:var(--m-metal-lo,color-mix(in srgb,var(--muted) 70%,var(--ink)))}.ps3d-poster[data-v="2"] .p-inkf{fill:var(--ink)}.ps3d-poster[data-v="2"] .p-inkc{fill:var(--ink)}.ps3d-poster[data-v="2"] .p-glass{fill:var(--ink-2)}.ps3d-poster[data-v="2"] .p-shadow{fill:var(--m-shadow,var(--ink));stroke:none}.ps3d-poster[data-v="2"] :is(.p-sil,.p-line,.p-line2,.p-fl){fill:none;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.ps3d-poster[data-v="2"] .p-sil{stroke:var(--m-sil,var(--ink))}.ps3d-poster[data-v="2"] .p-line{stroke:var(--ink)}.ps3d-poster[data-v="2"] .p-line2{stroke:var(--ink-2)}.ps3d-poster[data-v="2"] .p-fl{stroke:var(--foil-line)}.ps3d-poster[data-v="2"] .p-plate{filter:grayscale(1) sepia(.22) contrast(1.08) brightness(1.02)}.ps3d-poster[data-v="2"] .p-plate.is-dev{filter:none}.ps3d-poster[data-v="2"] .p-txt{fill:var(--ink)}.ps3d-poster[data-v="2"] .p-txt2{fill:var(--ink-2)}:is(:root[data-tone="dark"],.tone-dark,.band--dark,[data-ground="espresso"],[data-ground="forest"],[data-ground="slate"]) .ps3d-poster[data-v="2"] .p-top,.ps3d-poster[data-v="2"][data-tone="dark"] .p-top{fill:var(--m-top,color-mix(in srgb,var(--dark) 80%,var(--on-dark)))}:is(:root[data-tone="dark"],.tone-dark,.band--dark,[data-ground="espresso"],[data-ground="forest"],[data-ground="slate"]) .ps3d-poster[data-v="2"] .p-left,.ps3d-poster[data-v="2"][data-tone="dark"] .p-left{fill:var(--m-left,color-mix(in srgb,var(--dark) 87%,var(--on-dark)))}:is(:root[data-tone="dark"],.tone-dark,.band--dark,[data-ground="espresso"],[data-ground="forest"],[data-ground="slate"]) .ps3d-poster[data-v="2"] .p-right,.ps3d-poster[data-v="2"][data-tone="dark"] .p-right{fill:var(--m-right,color-mix(in srgb,var(--dark) 92%,var(--on-dark)))}:is(:root[data-tone="dark"],.tone-dark,.band--dark,[data-ground="espresso"],[data-ground="forest"],[data-ground="slate"]) .ps3d-poster[data-v="2"] .p-plaster,.ps3d-poster[data-v="2"][data-tone="dark"] .p-plaster{fill:var(--m-plaster,color-mix(in srgb,var(--dark) 95%,var(--on-dark)))}.ps3d-poster[data-v="2"][data-tone="dark"] .p-sil{stroke:var(--m-sil,var(--on-dark))}.ps3d-poster[data-v="2"][data-tone="dark"] .p-line{stroke:var(--on-dark)}.ps3d-poster[data-v="2"][data-tone="dark"] .p-line2{stroke:var(--on-dark-2)}.ps3d-poster[data-v="2"][data-tone="dark"] .p-shadow{fill:#000}.ps3d-poster[data-v="2"][data-tone="dark"] .p-inkf{fill:color-mix(in srgb,var(--dark) 93%,var(--on-dark))}.ps3d-poster[data-v="2"][data-tone="dark"] .p-inkc{fill:var(--on-dark)}.ps3d-poster[data-v="2"][data-tone="dark"] .p-glass{fill:var(--on-dark)}</style><defs><clipPath id="p15dhk"><path d="M63.2 185L1137.8 347.5L501.7 593.8L-572.9 431.3Z"/></clipPath><filter id="p15dhb2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter><filter id="p15dhb13" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="13"/></filter></defs><g><path class="p-shadow" opacity="0.276" filter="url(#p15dhb13)" d="M298.1 381L329.6 385.7L309.9 393.4L278.5 388.6Z"/></g><g clip-path="url(#p15dhk)"><g opacity="0.160" filter="url(#p15dhb2)"><path class="p-shadow" d="M285.3 392.4L294.7 388.8L343.2 383.7L333.8 387.4ZM270.2 390.1L285.3 392.4L333.8 387.4L318.7 385.1ZM318.7 385.1L333.8 387.4L343.2 383.7L328.1 381.4ZM430 373.2L451.3 376.4L464.6 371.3L443.3 368ZM440.5 377.5L453.8 372.4L464.6 371.3L451.3 376.4ZM419.2 374.3L440.5 377.5L451.3 376.4L430 373.2Z"/></g></g><g data-part="zeta" style="--i:0"><path class="p-right" d="M285.3 392.4L294.7 388.8L294.7 297.5L285.3 301.2Z"/><path class="p-top" d="M270.2 390.1L285.3 392.4L285.3 301.2L270.2 298.9ZM270.2 298.9L285.3 301.2L294.7 297.5L279.6 295.2Z"/><path class="p-sil" stroke-width="1.40" stroke-opacity="0.65" d="M285.3 392.4L294.7 388.8M294.7 388.8L294.7 297.5M285.3 392.4L270.2 390.1"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.29" d="M294.7 297.5L285.3 301.2M270.2 298.9L285.3 301.2"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.28" d="M285.3 301.2L285.3 392.4"/><path class="p-sil" stroke-width="1.40" stroke-opacity="0.66" d="M270.2 390.1L270.2 298.9M294.7 297.5L279.6 295.2"/><path class="p-sil" stroke-width="1.40" stroke-opacity="0.67" d="M270.2 298.9L279.6 295.2"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.24" d="M278.1 316L301.2 319.5M263.7 321.5L278.1 316M278.1 342.3L301.2 345.8M301.2 345.8L286.8 351.4M263.7 347.9L278.1 342.3M301.2 372.2L286.8 377.8M286.8 377.8L263.7 374.3M263.7 374.3L278.1 368.7"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.25" d="M301.2 319.5L286.8 325M286.8 325L263.7 321.5M286.8 351.4L263.7 347.9"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.23" d="M278.1 368.7L301.2 372.2"/></g><g data-part="costim" style="--i:1"><path class="p-line2" stroke-width="0.80" stroke-opacity="0.53" stroke-dasharray="4 4" d="M288.4 296.4L308.4 288.6M256.5 291.5L256.5 257"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.52" stroke-dasharray="4 4" d="M308.4 288.6L308.4 254.1M276.5 283.8L256.5 291.5M256.5 257L276.5 249.3M308.4 254.1L276.5 249.3"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.54" stroke-dasharray="4 4" d="M308.4 254.1L288.4 261.9M288.4 296.4L256.5 291.5"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.55" stroke-dasharray="4 4" d="M288.4 261.9L288.4 296.4M256.5 257L288.4 261.9"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.51" stroke-dasharray="4 4" d="M276.5 249.3L276.5 283.8M276.5 283.8L308.4 288.6"/></g><g data-part="mem" style="--i:2"><path class="p-top" fill-opacity="0.38" d="M139 219.8L342.8 250.6L425.9 218.4L222 187.6ZM139 252.2L342.8 283L342.8 250.6L139 219.8Z"/><path class="p-right" fill-opacity="0.38" d="M342.8 283L425.9 250.9L425.9 218.4L342.8 250.6Z"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.23" d="M222 187.6L425.9 218.4M139 219.8L222 187.6M139 252.2L222 220"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.28" d="M425.9 218.4L342.8 250.6M342.8 250.6L139 219.8M425.9 250.9L342.8 283M342.8 283L139 252.2"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.22" d="M222 220L425.9 250.9"/></g><g data-part="vec" style="--i:3"><circle cx="180.5" cy="159.8" r="15.7" fill="none" class="p-sil" stroke-width="1"/></g><g data-part="htm" style="--i:4"><path class="p-line2" stroke-width="0.80" stroke-opacity="0.54" stroke-dasharray="4 4" d="M283.9 220.7L288.9 218.7M280.9 217.5L276 219.5M280.9 144.5L280.9 217.5M280.9 217.5L288.9 218.7M283.9 220.7L276 219.5"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.55" stroke-dasharray="4 4" d="M288.9 218.7L288.9 145.7M276 219.5L276 146.4M288.9 145.7L280.9 144.5"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.56" stroke-dasharray="4 4" d="M288.9 145.7L283.9 147.6M283.9 147.6L283.9 220.7M276 146.4L280.9 144.5M276 146.4L283.9 147.6"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.30" stroke-dasharray="4 4" d="M290.4 252.7L287.9 252.7M287.9 252.7L284.6 252.4M284.6 252.4L280.9 251.8M280.9 251.8L277.5 250.8M277.5 250.8L274.8 249.5M274.8 249.5L273.3 248M291.7 241.8L290.4 241.9M290.4 241.9L287.9 241.9M287.9 241.9L284.6 241.6M284.6 241.6L280.9 240.9M280.9 240.9L277.5 239.9M277.5 239.9L274.8 238.7M274.8 238.7L273.3 237.2M273.3 237.2L273.2 235.6M291.6 230.7L291.7 231M291.7 231L290.4 231.1M290.4 231.1L287.9 231.1M287.9 231.1L284.6 230.8M284.6 230.8L280.9 230.1M280.9 230.1L277.5 229.1M277.5 229.1L274.8 227.8M274.8 227.8L273.3 226.4M273.3 226.4L273.2 224.8M273.2 224.8L274.5 223.3M290.1 219.8L291.6 219.9M291.6 219.9L291.7 220.1M291.7 220.1L290.4 220.3"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.29" stroke-dasharray="4 4" d="M273.3 248L273.2 246.4M273.2 246.4L274.5 244.9M274.5 244.9L277 243.6M277 243.6L280.3 242.6M280.3 242.6L284 241.9M284 241.9L287.4 241.5M287.4 241.5L290.1 241.4M290.1 241.4L291.6 241.6M291.6 241.6L291.7 241.8M273.2 235.6L274.5 234.1M274.5 234.1L277 232.8M277 232.8L280.3 231.7M280.3 231.7L284 231M284 231L287.4 230.7M287.4 230.7L290.1 230.6M290.1 230.6L291.6 230.7M274.5 223.3L277 222M277 222L280.3 220.9M280.3 220.9L284 220.2M284 220.2L287.4 219.9M287.4 219.9L290.1 219.8"/></g><g data-part="binder" style="--i:5"><path class="p-line2" stroke-width="0.80" stroke-opacity="0.56" stroke-dasharray="4 4" d="M281.6 145.9L277.3 147M277.3 147L271.6 147.5M271.6 147.5L265.6 147.3M265.6 147.3L260.4 146.5M260.4 146.5L257.2 145.3M256.5 109.4L257.2 110.8M283.5 110.1L282.8 108.6M281.6 111.5L283.5 110.1M281.3 147.6L283.3 146.2M283.3 146.2L287.6 145.2M287.6 110.7L283.3 111.7M293.3 110.2L287.6 110.7M299.3 110.4L293.3 110.2M304.4 111.1L299.3 110.4M304.4 145.6L307.7 146.9M307.7 146.9L308.4 148.3"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.57" stroke-dasharray="4 4" d="M277.3 112.5L281.6 111.5M271.6 113L277.3 112.5M265.6 112.8L271.6 113M260.4 112L265.6 112.8M257.2 110.8L260.4 112M306.4 149.7L302.1 150.7M290.4 151.1L285.3 150.3M285.3 150.3L282 149M282 149L281.3 147.6M281.3 113.1L282 114.6M283.3 111.7L281.3 113.1M307.7 112.4L304.4 111.1M308.4 113.8L307.7 112.4M308.4 148.3L306.4 149.7"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.55" stroke-dasharray="4 4" d="M257.2 145.3L256.5 143.8M256.5 143.8L258.5 142.5M258.5 108L256.5 109.4M262.8 106.9L258.5 108M268.5 106.4L262.8 106.9M274.5 106.6L268.5 106.4M279.6 107.4L274.5 106.6M282.8 108.6L279.6 107.4M282.8 143.1L283.5 144.6M283.5 144.6L281.6 145.9M287.6 145.2L293.3 144.7M293.3 144.7L299.3 144.8M299.3 144.8L304.4 145.6"/><path class="p-line2" stroke-width="1.40" stroke-opacity="0.50" stroke-dasharray="4 4" d="M256.5 143.8L256.5 109.4M283.5 144.6L283.5 110.1"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.54" stroke-dasharray="4 4" d="M258.5 142.5L262.8 141.4M262.8 141.4L268.5 140.9M268.5 140.9L274.5 141.1M274.5 141.1L279.6 141.9M279.6 141.9L282.8 143.1"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.58" stroke-dasharray="4 4" d="M302.1 116.2L306.4 115.2M302.1 150.7L296.4 151.2M296.4 116.7L302.1 116.2M296.4 151.2L290.4 151.1M290.4 116.6L296.4 116.7M285.3 115.8L290.4 116.6M282 114.6L285.3 115.8M306.4 115.2L308.4 113.8"/><path class="p-line2" stroke-width="1.40" stroke-opacity="0.51" stroke-dasharray="4 4" d="M281.3 147.6L281.3 113.1M308.4 148.3L308.4 113.8"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.31" stroke-dasharray="4 4" d="M270 109.7L282.4 103.5M282.4 103.5L294.8 113.5"/></g><g data-part="ag" style="--i:6"><path class="p-top" d="M265.2 80.1L286.4 83.3L299.7 78.2L278.4 75ZM265.2 100.4L286.4 103.6L286.4 83.3L265.2 80.1Z"/><path class="p-right" d="M286.4 103.6L299.7 98.5L299.7 78.2L286.4 83.3Z"/><path class="p-sil" stroke-width="1.40" stroke-opacity="0.74" d="M286.4 103.6L299.7 98.5M265.2 100.4L265.2 80.1M286.4 103.6L265.2 100.4"/><path class="p-sil" stroke-width="1.40" stroke-opacity="0.73" d="M299.7 98.5L299.7 78.2M265.2 80.1L278.4 75"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.31" d="M299.7 78.2L286.4 83.3"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.32" d="M286.4 83.3L286.4 103.6M265.2 80.1L286.4 83.3"/><path class="p-sil" stroke-width="1.40" stroke-opacity="0.72" d="M299.7 78.2L278.4 75"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.29" stroke-dasharray="4 4" d="M236.1 56L388.6 79.1M176.3 79.2L236.1 56"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.34" stroke-dasharray="4 4" d="M388.6 79.1L328.8 102.2M328.8 102.2L176.3 79.2"/></g></svg>'
  };

  /* ---------- the module ---------- */
  function init(root, ctx) {
    var store = ctx.store, saved = store.get() || {}, hardOK = !!saved.hard;
    var S = null, shelf = null, sel = -1, queue = [], pend = null, tw = null, els = {}, cohortIn = 0;

    root.classList.add('lv');
    root.innerHTML =
      '<div class="lv-hall" data-ground="espresso">' +
      '<p class="lv-disc"><span class="lk-tag lk-tag--warn">Read this first</span> ' + E(DISC) + '</p>' +
      '<ol class="lv-rail" aria-hidden="true"></ol>' +
      '<div class="lv-hero"><div class="lv-act"></div><div class="lv-show"></div></div>' +
      '<div class="lv-vitals" role="group" aria-label="Program vitals"></div></div>' +
      '<div class="lv-cols"><div class="lv-main">' +
      '<div class="lv-ev"></div><div class="lv-stage"></div>' +
      '<div class="lk-feed lv-feed" role="region" aria-label="Program log" tabindex="0"></div><div class="btnrow lv-btns"></div>' +
      '</div><aside class="lv-side"></aside></div>' +
      '<div class="lv-end"></div><div class="lv-foot"></div>';
    els.hall = root.querySelector('.lv-hall');
    els.rail = root.querySelector('.lv-rail');
    els.hero = root.querySelector('.lv-hero');
    els.show = root.querySelector('.lv-show');
    els.vitals = root.querySelector('.lv-vitals');
    els.act = root.querySelector('.lv-act');
    els.ev = root.querySelector('.lv-ev');
    els.stage = root.querySelector('.lv-stage');
    els.feed = root.querySelector('.lv-feed');
    els.btns = root.querySelector('.lv-btns');
    els.side = root.querySelector('.lv-side');
    els.end = root.querySelector('.lv-end');
    els.foot = root.querySelector('.lv-foot');

    K.glossary(root, DEFS);
    shelf = K.shelf(els.foot, { slug: SLUG, notes: NOTES, caseFile: CASE,
      take: { items: TAKE, personal: function () {
        if (!S || !S.ending) return null;
        var T = LV_TARGETS[S.target];
        return 'My run: ' + (T ? T.nm : 'no target') + ', ' + (S.piv.approved ? 'approved' : 'not approved') + ', ' +
          F.pct(S.piv.dur || 0, 0) + ' of infused patients in durable remission, ' + F.n(S.world.annual || 0) +
          ' patients reached a year, month ' + F.n(S.month) + ', ' + F.M(S.cash, 0) + ' left.';
      } },
      meta: '' });

    /* ---------- feed and notes ---------- */
    var hush = false, sayBox = null;
    function plain(html) {
      if (!sayBox) sayBox = document.createElement('div');
      sayBox.innerHTML = html;
      return sayBox.textContent;
    }
    function feed(text, chip, noteId) {
      S.log.push({ t: text, c: chip || null, n: noteId || null });
      if (S.log.length > 60) S.log.shift();
      renderFeed();
      /* the log is rebuilt on every render, so it is not a live region; the new line alone is spoken */
      if (!hush) K.say((chip ? chip + ': ' : '') + plain(text));
    }
    function renderFeed() {
      var h = '';
      S.log.forEach(function (l) {
        h += '<p class="lk-line">' + (l.c ? '<span class="lk-chip' + (l.c === 'Safety' ? ' lk-chip--safety' : l.c === 'You' ? ' lk-chip--foil' : '') + '">' + E(l.c) + '</span>' : '') +
          l.t + (l.n ? ' <button type="button" class="lv-read" data-act="read" data-v="' + E(l.n) + '">Read the note</button>' : '') + '</p>';
      });
      els.feed.innerHTML = h;
      els.feed.scrollTop = els.feed.scrollHeight;
    }
    function unlock(id, where) {
      if (shelf.notes.has(id)) return;
      var n = null;
      NOTES.forEach(function (x) { if (x.id === id) n = x; });
      shelf.notes.unlock(id, { where: where || null, announce: false });
      if (n) feed('Field note added: <b>' + E(n.term) + '</b>.', 'Notes', id);
    }

    /* ---------- run control ---------- */
    function newRun(seed) {
      if (tw) { tw(); tw = null; }
      S = mkState(seed);
      LVD_KEY = '';
      var ids = LV_EVENTS.map(function (e) { return e.id; }).filter(function (i) { return i !== 'quiet'; });
      streams(S).e.shuffle(ids);
      ids.push('quiet');
      S.ev.deck = ids;
      sel = -1; queue = []; pend = null; cohortIn = 0; peekT = null;
      els.end.innerHTML = '';
      els.ev.innerHTML = ''; els.ev.removeAttribute('data-k');
      S.log = [];
      hush = true;
      feed('Meridian Cell Therapeutics, one asset, ' + F.M(S.cash, 0) + ' in the bank. The goal is a therapy that works and reaches the people who qualify for it, before the money or the clock runs out.', 'Board');
      feed('Everything downstream is a consequence of the first choice. Pick the antigen and you have picked your population, your toxicity, your escape route and your regulator’s mood.', 'Program');
      hush = false;
      shelf.setMeta('Seed #' + S.seed + ' · same seed, same choices, same run');
      renderAll();
    }
    function ender(reason) {
      if (S.over) return;
      S.over = true;
      if (reason === 'fatal') S.ending = 'fatal';
      else S.ending = endingOf(S);
      try { store.set({ hard: 1, last: { seed: S.seed, ending: S.ending } }); } catch (e) {}
      hardOK = true;
      S.ev.pending = null;
      renderAll();
      debrief();
    }

    /* ---------- the event deck ---------- */
    /* only: the card ids that can still matter at this point in the run; the first of them in the deck is played */
    function fireEvent(only) {
      if (S.over || S.ev.at >= S.ev.deck.length) return false;
      var deck = S.ev.deck, j = S.ev.at;
      if (only) {
        while (j < deck.length && only.indexOf(deck[j]) < 0) j++;
        if (j >= deck.length) return false;
        var sw = deck[j]; deck[j] = deck[S.ev.at]; deck[S.ev.at] = sw;
      }
      var id = deck[S.ev.at++], card = null;
      LV_EVENTS.forEach(function (e) { if (e.id === id) card = e; });
      if (!card) return false;
      /* an unanswered card does not vanish: its default, the last choice, stands */
      if (S.ev.pending) {
        var prev = S.ev.pending, dc = prev.ch[prev.ch.length - 1];
        dc.act(S);
        feed('No answer came on ' + E(prev.t.toLowerCase()) + ', so the default stood: ' + E(dc.l.toLowerCase()) + '.', 'Program');
        S.ev.pending = null;
      }
      if (card.pre) card.pre(S);
      if (id === 'secondary') unlock('secondary', 'The class warning');
      if (id === 'escape') unlock('escape', 'Your first antigen-negative relapses');
      var ch = card.ch ? card.ch(S) : null;
      S.ev.pending = ch && ch.length ? { id: id, t: card.t, l: card.l, ch: ch } : null;
      feed('<b>' + E(card.t) + '</b> ' + E(card.l), 'Event');
      if (S.ev.pending) S.ev.pending.k = id + '#' + S.ev.at;
      renderEv();
      renderVitals();
      return true;
    }
    function renderEv() {
      if (pend) { renderInterrupt(); return; }
      var p = S.ev.pending;
      if (!p) { els.ev.innerHTML = ''; els.ev.removeAttribute('data-k'); return; }
      /* the same card is not rebuilt, so focus and the reader stay where they are */
      var key = p.k + '|' + Math.round(S.cash);
      if (els.ev.getAttribute('data-k') === key && els.ev.firstChild) return;
      var h = '<div class="lk-card lk-card--event lv-evcard"><p class="lk-kicker lk-kicker--foil">Event · answer before you go on</p><h5 class="lv-evt" tabindex="-1">' + E(p.t) + '</h5>' +
        '<p class="lk-lede">' + E(p.l) + '</p>';
      p.ch.forEach(function (c, i) {
        var why = c.cost && S.cash < c.cost ? 'Not affordable: ' + F.M(S.cash, 0) + ' in the bank' : '';
        h += opt('evpick', String(i), false, E(c.l), E(c.s), why);
      });
      keep(els.ev, function () { els.ev.innerHTML = h + '</div>'; });
      els.ev.setAttribute('data-k', key);
    }
    /* after a step that rebuilt the controls: an open event card takes the focus, otherwise the next thing to press */
    function settle() {
      var eh = els.ev.querySelector('.lv-evt');
      if (eh) { K.focus(eh, { scroll: true }); return; }
      var ae = document.activeElement;
      if (ae && ae !== document.body && root.contains(ae)) return;
      var b = els.btns.querySelector('button:not([disabled])'), c = els.stage.querySelectorAll('.lv-evt, button:not([disabled])'), i;
      for (i = 0; !b && i < c.length; i++) if (!c[i].closest('.lv-scene')) b = c[i];
      K.focus(b || els.act.querySelector('.lv-h'), { scroll: true });
    }

    /* ---------- render ---------- */
    function renderAll() {
      renderVitals(); renderAct(); renderStage(); renderSide(); renderBtns(); renderFeed(); renderEv();
      K.sfill(root);
      paintAll();
    }
    function renderVitals() {
      var d = S.piv.done ? F.pct(S.piv.dur, 0) : '–', a = S.world.done ? F.n(S.world.annual) : '–';
      var v = [d, a, F.n(S.month), F.M(S.cash, 0), F.n(Math.round(S.trust))], was = els.vitals._v || v;
      /* a figure that moved sets again (opacity and a small rise, motion allowed only); the rest hold still */
      function mv(i) { return was[i] !== v[i] ? ' lv-chg' : ''; }
      els.vitals.innerHTML =
        vit('In remission', d, (S.piv.done && S.piv.dur >= 0.3 ? 'is-good' : '') + mv(0)) +
        vit('Reached a year', a, (S.world.done && S.world.annual >= 1000 ? 'is-good' : '') + mv(1)) +
        vit('Month', v[2], (S.month > 108 ? 'is-warn' : '') + mv(2)) +
        vit('Capital', v[3], (S.cash < 40 ? 'is-bad' : '') + mv(3)) +
        vit('Trust', v[4], (S.trust < 45 ? 'is-bad' : S.trust >= 70 ? 'is-good' : '') + mv(4));
      els.vitals._v = v;
    }
    var ACTS = [
      { k: 'Act I of V', t: 'The target', l: 'Four programs you can run, and one to read about first. Each card shows the four numbers that decide the rest: how much antigen the tumor shows, how much healthy tissue also carries, how easily the cancer can stop showing it, and what the tumor’s neighborhood does to a T cell.' },
      { k: 'Act II of V', t: 'The receptor', l: 'Four decisions, outside the cell to inside. Nothing here is free: every setting that buys you force costs you either durability, tolerability or a year of process development.' },
      { k: 'Act III of V', t: 'The factory', l: 'A cell therapy company is a logistics company with a biology department attached. The biology decides whether it works. The logistics decide whether it happens.' },
      { k: 'Act IV of V', t: 'The trial', l: 'This is where the design stops being an argument and becomes a number. You set the policies, the escalation rules decide the dose, and the toxicity you cause is the same biology as the cure.' },
      { k: 'Act V of V', t: 'The world', l: 'A therapy that works is not yet a therapy people get. Choose the evidence you are going to buy, then argue about the price, the payment model and the map.' }
    ];
    var ROMAN = ['I', 'II', 'III', 'IV', 'V'];
    function renderAct() {
      var a = ACTS[S.act - 1], r = '', i;
      for (i = 1; i <= 5; i++) {
        r += '<li class="' + (i < S.act ? 'is-past' : i === S.act ? 'is-now' : 'is-next') + '"><span class="lv-rn">' + ROMAN[i - 1] +
          '</span><span class="lv-rt">' + E(ACTS[i - 1].t) + '</span></li>';
      }
      els.rail.innerHTML = r;
      var h = '<p class="lv-numeral foil" aria-hidden="true">' + ROMAN[S.act - 1] + '</p><div class="lv-actx"><p class="lk-kicker">' + E(a.k) + '</p>' +
        '<h4 class="lk-title lv-h" tabindex="-1">' + E(a.t) + '</h4><p class="lk-lede">' + E(a.l) + '</p>' + (S.act === 1 && !S.over ? picks() : '') + '</div>';
      if (els.act._h !== h) {
        var turn = els.act._n && els.act._n !== S.act;
        els.act._n = S.act;
        keep(els.act, function () { els.act.innerHTML = h; });
        if (turn) els.act.classList.add('lv-turn');
        else els.act.classList.remove('lv-turn');
        els.act._h = h;
        if (window.PS && PS.foil) { try { PS.foil(els.act); } catch (e) {} }
      }
    }
    /* Act I on the hall: the runnable targets as one row of chips, the same choice the cards below make */
    function picks() {
      var h = '';
      TORDER.forEach(function (k) {
        var T = LV_TARGETS[k];
        if (T.hard && (!hardOK || !S.ev.flags.her2ack)) return;
        h += '<button type="button" class="lv-pk" data-act="target" data-v="' + k + '" aria-pressed="' + (S.target === k ? 'true' : 'false') + '">' +
          '<span class="lv-pk-n">' + E(T.nm) + '</span><span class="lv-pk-d">' + E(T.kind === 'liquid' ? 'Liquid cancer' : 'Solid tumor') + '</span></button>';
      });
      return '<div class="lv-pks" role="group" aria-label="Choose a target">' + h + '</div>';
    }
    function renderSide() {
      var h = '';
      if (S.act >= 4 && S.pts.length) {
        h += '<div class="lv-sidebox"><p class="lk-kicker">Dose levels</p><div class="lk-scroll"><table class="lk-table"><caption class="vh">Patients and dose-limiting toxicities by level</caption>' +
          '<thead><tr><th scope="col">Level</th><th scope="col">Infused</th><th scope="col">DLT</th></tr></thead><tbody>';
        S.tr.levels.forEach(function (L) {
          h += '<tr' + (L.dl === S.tr.dl && !S.tr.stopped ? ' class="is-sel"' : '') + '><td>' + DLN[L.dl - 1] + '</td><td>' + L.n + '</td><td>' + (L.dlt ? '<span class="lk-loss">' + L.dlt + '</span>' : '0') + '</td></tr>';
        });
        h += '</tbody></table></div><p class="lv-note">Counts ' + K.term('dlt', 'dose-limiting toxicities') + ' among infused patients, level by level.</p>';
        if (S.tr.mtd) h += '<p class="lv-note">' + K.term('mtd', 'Maximum tolerated dose') + ': <b>' + DLN[S.tr.mtd - 1] + '</b>.</p>';
        else if (S.tr.how === 'top') h += '<p class="lv-note">Highest dose tested: <b>' + DLN[4] + '</b>. No maximum tolerated dose reached.</p>';
        else if (S.tr.how === 'declared') h += '<p class="lv-note">Recommended dose, declared by you: <b>' + DLN[S.tr.rp2d - 1] + '</b>. No maximum tolerated dose established.</p>';
        h += '</div>';
      }
      h += '<div class="lv-sidebox lv-seed"><p class="lk-kicker">This program</p><p class="lv-note">Seed <b>#' + S.seed + '</b>. The same seed with the same choices gives the same run, patient for patient. Seed 20170830 is the date of the first approval in this field.</p></div>';
      els.side.innerHTML = h;
    }

    /* a re-render replaces the markup, so the keyboard gets put back where it was standing */
    function keyOf(el) {
      if (!el || el === document.body) return null;
      var a = el.getAttribute && el.getAttribute('data-act');
      if (a) return '[data-act="' + a + '"]' + (el.getAttribute('data-v') != null ? '[data-v="' + el.getAttribute('data-v') + '"]' : '');
      if (el.id) return '#' + el.id;
      return null;
    }
    function keep(host, fn) {
      var ae = document.activeElement, k = ae && host.contains(ae) ? keyOf(ae) : null;
      fn();
      if (!k) return;
      var el = host.querySelector(k);
      if (el && !el.disabled) { try { el.focus({ preventScroll: true }); } catch (e) {} }
    }

    /* ---------- the stage: one act at a time ---------- */
    function renderStage() {
      var h = '';
      if (S.act === 1) h = stage1();
      else if (S.act === 2) h = stage2();
      else if (S.act === 3) h = stage3();
      else if (S.act === 4) h = stage4();
      else h = stage5();
      keep(els.stage, function () { els.stage.innerHTML = h; });
      if (S.over) {
        /* the run is closed: the ledger stays readable, the levers stop taking input; the drawings stay explorable */
        var kill = els.stage.querySelectorAll('button, input, select');
        Array.prototype.forEach.call(kill, function (x) { if (!x.closest('.lv-scene')) x.disabled = true; });
      } else if (S.ev.pending) {
        var wait = els.stage.querySelectorAll('[data-act="design"], [data-act="again"], [data-act="wind"]');
        Array.prototype.forEach.call(wait, function (x) { x.disabled = true; });
      }
      K.sfill(els.stage);
      renderShow();
    }
    /* the hall's drawing for this act: one live figure (two in the trial), or the 2D drawing when the engine is away */
    function renderShow() {
      var k = '', h = '';
      if (D3.dead) {
        if (S.act === 2) { k = 'd-rec'; h = cvs('rec', 200, 'Receptor schematic.'); }
        else if (S.act === 3) { k = 'd-queue'; h = cvs('queue', 84, 'The queue.'); }
      } else if (S.act === 1) { k = 'cells'; h = slot('cells'); }
      else if (S.act === 2) { k = 'rec'; h = slot('rec'); }
      else if (S.act === 3) { k = 'ring'; h = slot('ring'); }
      else if (S.act === 4) { k = 'pair'; h = '<div class="lv-pair">' + slot('cells4') + slot('ring4') + '</div>'; }
      else if (S.act === 5) { k = 'access'; h = slot('access'); }
      if (els.show.getAttribute('data-k') !== k) {
        els.show.innerHTML = h;
        els.show.setAttribute('data-k', k);
        if (h) els.hero.classList.add('has-show'); else els.hero.classList.remove('has-show');
        if (k === 'pair') els.hero.classList.add('is-wide'); else els.hero.classList.remove('is-wide');
      }
      place3();
    }
    function stage1() {
      var h = '<div class="lk-grid lv-targets">';
      TORDER.forEach(function (k) {
        var T = LV_TARGETS[k], on = S.target === k;
        if (T.hard && !hardOK) {
          h += '<div class="lk-card lv-tcard is-locked"><p class="lk-kicker">Hard mode</p><h5>' + E(T.nm) + '</h5>' +
            '<p class="lv-why">Opens when you finish a program, whatever the ending. It is the one target in this machine that can end a run in the first week.</p></div>';
          return;
        }
        if (T.hard && !S.ev.flags.her2ack) {
          h += '<div class="lk-card lv-tcard lk-card--event"><p class="lk-kicker lk-kicker--foil">Hard mode</p><h5>' + E(T.nm) + '</h5>' +
            '<p class="lv-why">Read the case file first. In a case report published in 2010, a patient died five days after receiving cells with a high-affinity receptor against this antigen; the authors attributed it, tentatively, to low levels of the same antigen on normal lung lining. You may still run it. The model will not protect you.</p>' +
            '<div class="btnrow"><button type="button" class="ebtn2" data-act="her2ack">I have read it</button></div></div>';
          return;
        }
        h += '<button type="button" class="lk-card lv-tcard" data-act="target" data-v="' + k + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
          '<span class="lv-spec">' + glyph(T) + '</span>' +
          '<span class="lv-tag">' + E(T.kind === 'liquid' ? 'Liquid cancer' : 'Solid tumor') + '</span>' +
          '<span class="lv-tnm">' + E(T.nm) + '</span><span class="lv-tdis">' + E(T.dis) + '</span>' +
          '<span class="lv-why">' + E(T.why) + '</span><span class="lv-dials">' +
          dial('Antigen density', T.dens) + dial('Healthy tissue carries it', T.oot, 'loss') +
          dial('Escape risk', T.esc, 'loss') + dial('Neighborhood against you', 1 - T.tme, 'loss') +
          '</span><span class="lv-tpop">' + F.n(T.pop * 1000) + ' patients a year, model assumption</span></button>';
      });
      return h + '</div>';
    }
    function stage2() {
      var D = LVD(S), cx = S.cx, lk = cx.locked;
      var h = '<ol class="lk-strip ledger ledger--data lv-led">' +
        cell('Potency', F.x(D.POT, 2)) + cell('Persistence', F.x(D.PER, 2)) +
        cell('Toxicity propensity', F.x(D.TOXP, 2), D.TOXP > 0.45 ? 'is-bad' : '') +
        cell('Manufacturing', F.pct(D.MFG, 0), D.MFG < 0.85 ? 'is-warn' : '') + '</ol>';
      function row(act, table, order, cur) {
        var b = '';
        order.forEach(function (k) {
          b += opt(act, k, cur === k, E(table[k].nm), E(table[k].s) + (table[k].dev ? ' Costs ' + table[k].dev + ' months of process development.' : ''));
        });
        return b;
      }
      h += '<div class="lv-grps">';
      h += grp('The binder', '<p class="lv-note">The gripping end: an ' + K.term('scfv') + ' whose ' + K.term('affinity', 'affinity and off-rate') + ' decide how hard each contact pushes.</p>' +
        row('binder', LV_BINDER, ['mur', 'hum', 'fast'], cx.binder));
      h += grp('Hinge and transmembrane', '<p class="lv-note">The ' + K.term('hinge', 'hinge and transmembrane') + ' segments: geometry, and therefore signal.</p>' +
        row('htm', LV_HTM, ['cd8', 'cd28h'], cx.htm));
      h += grp('Costimulation', '<p class="lv-note">The second signal inside the cell, above the ' + K.term('zeta') + ' tail. This is the ' + K.term('costim', 'costimulation') + ' decision, and it shows up in persistence and in the toxicity tables more than in the survival curves.</p>' +
        row('costim', LV_COSTIM, ['cd28', 'bb', 'dual'], cx.costim));
      h += grp('The vector', '<p class="lv-note">How you ' + K.term('transduce', 'transduce') + ' the cell. A viral vector is the costliest input in every batch, which is why the choice shows up in the cost of every patient and every trial.</p>' +
        row('vector', LV_VECTOR, ['retro', 'lenti', 'nonv'], cx.vector));
      h += '</div>';
      if (lk) h += '<p class="lk-coach">The construct is locked. An amendment costs ' + F.M(AMEND_C, 0) + ' and about ' + (AMEND_M + 2 + 4) + ' months with requalification, and it restarts the dose escalation, which is exactly why programs ship the construct they have rather than the one they want.</p>';
      else if (S.cx.amending) h += '<p class="lk-coach">You are amending the construct. Relocking takes two months of requalification rather than the original ten, and the trial reopens at the first dose level.</p>';
      return h;
    }
    var PLAT = { allo: { c: 70, back: 55, m: 18 }, vivo: { c: 95, back: 70, m: 26 } };
    function platNeed(k) { return PLAT[k].c - PLAT[k].back + PLAT[k].m * BURN; }
    function stage3() {
      var m = S.mfg, D = LVD(S), T = D.T, auto = m.platform === 'auto';
      var h = '<ol class="lk-strip ledger ledger--data lv-led">' +
        cell('Vein to vein', F.n(v2v(S)) + ' d', v2v(S) > 32 ? 'is-bad' : v2v(S) <= 20 ? 'is-good' : '') +
        cell('Slots a month', auto ? F.n(m.slots) : 'Not needed') +
        cell('Out of spec', F.pct(pOOS(S, D, { burden: 0.5 }), 0), pOOS(S, D, { burden: 0.5 }) > 0.12 ? 'is-warn' : '') +
        cell('Lost while waiting', F.pct(pLost(S, { burden: 0.6 }), 0), pLost(S, { burden: 0.6 }) > 0.4 ? 'is-bad' : '') + '</ol>';
      h += '<div class="lv-cards">';
      h += '<div class="lk-card"><p class="lk-kicker">Culture length</p>' +
        seg('days', [['3', '3 days'], ['9', '9 days'], ['12', '12 days']], String(m.days), 'Culture length') +
        '<p class="lv-note">' + W_CUL + '</p></div>';
      h += '<div class="lk-card"><p class="lk-kicker">Release specification</p>' +
        seg('specs', [['tight', 'Tight'], ['wide', 'Wide']], m.specs, 'Release specification') +
        '<p class="lv-note">Tight means a batch that misses its criteria is not infused. Wide means it can be released at reduced potency. Tight protects the label: every batch released outside specification is a question at the pivotal review. Wide treats the patient in front of you.</p></div>';
      h += '<div class="lk-card"><p class="lk-kicker">Product form</p>' +
        seg('cryo', [['1', 'Cryopreserved'], ['0', 'Fresh']], m.cryo ? '1' : '0', 'Product form') +
        '<p class="lv-note">' + K.term('cryo') + W_CRY + ': at launch, a fresh product only reaches patients near the factory, so your treating network counts at about half.</p></div>';
      var slotWhy = auto && m.slots < 24 && S.cash < SLOT;
      h += '<div class="lk-card"><p class="lk-kicker">Clinical capacity</p>' + step('slots', auto ? F.n(m.slots) + ' slots' : 'Not needed', false, auto && m.slots < 24 && S.cash >= SLOT) +
        '<p class="lv-note">Each block of four slots costs ' + F.M(SLOT, 0) + (slotWhy ? ', and you have ' + F.M(S.cash, 0) : '') + '. ' + W_QUE + ' The queue is the part nobody puts in the pitch deck.</p>' +
        (m.secondSource ? '<p class="lv-note"><b>Second vector source qualified.</b></p>'
          : '<div class="btnrow"><button type="button" class="ebtn2" data-act="second"' + (S.cash < 14 ? ' disabled' : '') + '>Qualify a second vector source (' + F.M(14, 0) + ')</button></div>') +
        '</div>';
      if (T.route) {
        h += '<div class="lk-card"><p class="lk-kicker">Delivery route</p>' +
          seg('route', [['iv', 'Intravenous only'], ['local', 'Intravenous, then into the fluid around the brain']], m.route, 'Delivery route') +
          '<p class="lv-note">The cells have to reach the tumor. Delivering into the cerebrospinal fluid through a reservoir is how the published trial in this disease did it, and it changes both the trafficking and the toxicity you see.</p></div>';
      }
      h += '</div>';
      function pw(k) {
        if (!auto) return m.platform === k ? '' : 'Committed. A platform bet is a one-way door.';
        if (k === 'auto') return '';
        return S.cash < platNeed(k) ? 'Not affordable: ' + F.M(S.cash, 0) + ' in the bank against ' + F.M(platNeed(k), 0) + ' with burn' : '';
      }
      h += grp('The platform', '<p class="lv-note">Offered once, here. A platform bet is a one-way door.</p>' +
        opt('platform', 'auto', m.platform === 'auto', 'Stay autologous', 'The patient is the raw material. Every dose is its own manufacturing run, with its own queue and its own way to fail.', pw('auto')) +
        opt('platform', 'allo', m.platform === 'allo', 'Start an allogeneic program', 'Donor derived, gene edited to reduce graft-versus-host risk. Costs ' + F.M(PLAT.allo.c, 0) + ' and ' + PLAT.allo.m + ' months, brings ' + F.M(PLAT.allo.back, 0) + ' of partner money, removes the queue, and hands you rejection as a permanent research problem.', pw('allo')) +
        opt('platform', 'vivo', m.platform === 'vivo', 'Bet on making the receptor inside the patient', 'No factory at all. Costs ' + F.M(PLAT.vivo.c, 0) + ' and ' + PLAT.vivo.m + ' months, brings ' + F.M(PLAT.vivo.back, 0) + ' of partner money, and the persistence you get is whatever the delivery gives you. This is early science.', pw('vivo')));
      return h;
    }
    function stage4() {
      var h = '', t = S.tr, D = LVD(S);
      h += '<ol class="lk-strip ledger ledger--data lv-led">' +
        cell('Dose level', t.stopped ? DLN[(t.rp2d || t.dl) - 1] + ' (declared)' : DLN[t.dl - 1]) +
        cell('Enrolled', F.n(t.enrolled)) +
        cell('Infused', F.n(t.infused) + (t.enrolled ? ' (' + F.pct(t.infused / t.enrolled, 0) + ')' : ''), t.enrolled && t.infused / t.enrolled < 0.6 ? 'is-bad' : '') +
        cell('Deaths', F.n(t.deaths), t.deaths ? 'is-bad' : '') + '</ol>';
      h += '<div class="lv-cards lv-pol">';
      h += '<div class="lk-card"><p class="lk-kicker">Conditioning</p>' +
        seg('ld', [['none', 'None'], ['cy', 'Cyclophosphamide'], ['cyflu', 'With fludarabine']], t.ld, 'Conditioning') +
        '<p class="lv-note">Making room. More room means more expansion and more persistence, and also more cytopenia and more infection risk, which this model counts as an occasional infection death.</p></div>';
      h += '<div class="lk-card"><p class="lk-kicker">Who you enroll</p>' +
        seg('burden', [['asis', 'As they come'], ['bridge', 'Bridge first']], t.burden, 'Who you enroll') +
        '<p class="lv-note">' + K.term('bridging', 'Bridging therapy') + ' lowers the ' + K.term('burden', 'disease burden') + ' before infusion. It slows accrual by about forty percent and it changes both halves of the ledger.</p></div>';
      h += '<div class="lk-card"><p class="lk-kicker">Protocol policy for severe events</p>' +
        seg('tox', [['reactive', 'Severe only'], ['earlyIL6', 'Interleukin-6 early'], ['earlySteroid', 'Corticosteroids early']], t.tox, 'Protocol policy for severe events') +
        '<p class="lv-note">A program-level policy in a model, not a clinical instruction. Interleukin-6 receptor blockade barely touches the neurological syndrome, and the field notes say why. Corticosteroids reach it; whether and how much they blunt efficacy is still argued, and in this model they cost some expansion.</p>' +
        '<button type="button" class="lk-opt lv-toggle" data-act="anakinra" aria-pressed="' + (t.anakinra ? 'true' : 'false') + '"><span class="lk-opt-l">Add interleukin-1 blockade to the protocol</span><span class="lk-opt-s">Investigational in this setting, and in this machine. It reaches both syndromes in the mouse work. ' +
        (t.anakinra ? 'In the protocol now, at ' + F.M(ANAK, 2) + ' a patient.' : 'Adding it is a protocol amendment: a month, three points of trust with a regulator who now has questions, and ' + F.M(ANAK, 2) + ' a patient.') + '</span></button></div>';
      h += '</div>';
      if (t.holds) h += '<p class="lk-coach">The program has been on clinical hold ' + t.holds + ' ' + F.plural(t.holds, 'time') + '. A hold is six months, fifteen points of trust, and a change you have to make before you resume.</p>';
      if (S.pts.length) {
        h += '<div class="lk-scroll"><table class="lk-table lk-table--stack lv-ledger"><caption class="vh">Every patient in the trial, in order</caption><thead><tr>' +
          '<th scope="col">Patient</th><th scope="col">Burden</th><th scope="col">Level</th><th scope="col">Peak expansion</th>' +
          '<th scope="col">Cytokine</th><th scope="col">Neuro</th><th scope="col">Day 28</th><th scope="col">Month 12</th></tr></thead><tbody>';
        S.pts.forEach(function (p, i) {
          var d28 = !p.infused ? '<span class="lk-dim">not infused</span>' : p.death ? '<span class="lk-loss">died</span>' : p.resp ? '<span class="lk-gain">response</span>' : 'no response';
          var m12 = !p.infused ? (p.oos ? 'batch out of spec' : 'lost waiting') : p.death ? '–' : p.durable ? '<span class="lk-gain">in remission</span>' : p.resp ? (p.escape ? 'relapse, antigen negative' : 'relapse') : '–';
          h += '<tr class="' + (i === sel ? 'is-sel' : '') + (i >= cohortIn ? ' lv-new' : '') + '" style="--i:' + (i - cohortIn) + '">' +
            '<td><button type="button" class="lv-pick" data-act="pick" data-v="' + i + '">Patient ' + (p.id < 10 ? '0' : '') + p.id + '</button></td>' +
            '<td data-l="Burden">' + F.pct(p.burden, 0) + '</td>' +
            '<td data-l="Level">' + DLN[p.dl - 1] + '</td>' +
            '<td data-l="Peak expansion">' + (p.infused ? F.x(p.e, 2) : '–') + '</td>' +
            '<td data-l="Cytokine">' + (p.infused ? gradeTag(p.crs, 'grade') : '–') + '</td>' +
            '<td data-l="Neuro">' + (p.infused ? gradeTag(p.icans, 'grade') : '–') + '</td>' +
            '<td data-l="Day 28">' + d28 + '</td><td data-l="Month 12">' + m12 + '</td></tr>';
        });
        h += '</tbody></table></div>';
      }
      if (sel >= 0 && S.pts[sel] && S.pts[sel].infused) {
        var p = S.pts[sel];
        h += '<p class="lk-kicker">Patient ' + (p.id < 10 ? '0' : '') + p.id + ', receptor-positive cells after infusion</p>' + cvs('exp', 180, 'Expansion curve.');
      }
      if (t.stopped) h += '<p class="lk-coach">Recommended dose: ' + DLN[(t.rp2d || t.dl) - 1] +
        (t.how === 'mtd' ? ', the maximum tolerated dose.' : t.how === 'top' ? ', the highest dose tested. No maximum tolerated dose was reached.' : ', declared by you before the rules found a ceiling.') +
        ' The ' + K.term('rp2d', 'recommended phase 2 dose') + ' is what the pivotal trial will use, and for a living drug it is only half the exposure story.</p>';
      else if (t.floored) h += '<p class="lk-coach">Two dose-limiting toxicities at the first level, and there is nothing below it in this protocol. Amend the construct and the escalation starts again, or wind the program down.</p>';
      return h;
    }
    function stage5() {
      var p = S.piv, w = S.world, T = LV_TARGETS[S.target], h = '';
      if (!p.design) {
        var nf = pivNeed(S, 'fast'), nr = pivNeed(S, 'rand');
        if (S.cash < nf) {
          return '<div class="lk-card lk-card--event"><p class="lk-kicker lk-kicker--foil">The board meeting</p>' +
            '<h5 class="lv-evt" tabindex="-1">There is not enough money for a pivotal trial</h5>' +
            '<p class="lk-lede">You have ' + F.M(S.cash, 0) + ' and the cheapest pivotal trial needs ' + F.M(nf, 0) +
            ', counting the burn while it runs. This is one of the most common ways a cell therapy program ends, and it has nothing to do with the biology.</p>' +
            opt('wind', '1', false, 'Wind the program down', 'Publish the phase 1, archive the cell bank, and let somebody else pick up the target.') + '</div>';
        }
        var noRand = S.cash < nr ? 'Not affordable: ' + F.M(S.cash, 0) + ' in the bank against ' + F.M(nr, 0) + ' with burn' : '';
        return grp('The pivotal trial', '<p class="lv-note">You are buying evidence. The question is how much, and what it will answer. This is the ' + K.term('orr', 'response-rate') + ' decision. Each price below includes manufacturing on your vector; you also need the burn while the trial runs, ' + F.M(nf, 0) + ' in all for the single-arm trial and ' + F.M(nr, 0) + ' for the randomized one.</p>' +
          opt('design', 'fast', false, 'Single arm, response rate', F.M(pivCost(S, 'fast'), 0) + ', ' + PIV.fast.m + ' months, ' + PIV.fast.n + ' patients. Answers whether tumors shrink, sooner. Leaves the harder question open, and your payers know it.') +
          opt('design', 'rand', false, 'Randomized against standard care', F.M(pivCost(S, 'rand'), 0) + ', ' + PIV.rand.m + ' months, ' + PIV.rand.n + ' patients. Gives you a ' + K.term('hr', 'hazard ratio') + ', a stronger label, ten points of trust and five points of reach for the rest of the run. It costs you two years and most of the bank, and if it reads out negative there is no money left for anything else.', noRand));
      }
      h += '<ol class="lk-strip ledger ledger--data lv-led">' +
        cell('Response rate', F.pct(p.orr, 0), p.orr >= (T.kind === 'liquid' ? 0.45 : 0.25) ? 'is-good' : 'is-bad') +
        cell('Complete', F.pct(p.cr, 0)) +
        cell('Durable', F.pct(p.dur, 0), p.dur >= 0.3 ? 'is-good' : '') +
        cell('Grade 3+ cytokine', F.pct(p.crs3, 0), p.crs3 > 0.2 ? 'is-warn' : '') +
        cell(p.design === 'rand' ? 'Hazard ratio' : 'Grade 3+ neuro', p.design === 'rand' ? F.x(p.hr, 2, false).replace('×', '') : F.pct(p.icans3, 0),
          p.design === 'rand' ? (p.hr < 0.7 ? 'is-good' : 'is-bad') : (p.icans3 > 0.2 ? 'is-warn' : '')) + '</ol>' +
        '<p class="lv-note lv-deaths">Treatment-related deaths in the pivotal: <b>' + F.n(p.deaths || 0) + '</b> of ' + F.n(p.inf || p.n) + ' infused, ' + F.pct(p.g5, 1) + '.</p>';
      if (!p.approved) {
        var need2 = pivNeed(S, p.design);
        var againWhy = p.tries >= 2 ? 'You have run two. A third is not a strategy.'
          : S.cash < need2 ? 'Not affordable: ' + F.M(S.cash, 0) + ' in the bank against ' + F.M(need2, 0) + ' with burn' : '';
        h += '<div class="lk-card lk-card--event"><p class="lk-kicker lk-kicker--foil">The board meeting</p><h5 class="lv-evt" tabindex="-1">The readout did not clear the bar</h5>' +
          '<p class="lk-lede">' + E(p.why || 'The evidence does not support approval on this path.') + ' There are two honest options and no third one.</p>' +
          opt('again', '1', false, 'Run a second pivotal trial', 'Same design, fresh patients, ' + F.M(pivCost(S, p.design), 0) + ' and ' + PIV[p.design].m + ' months you may not have.', againWhy) +
          opt('wind', '1', false, 'Wind the program down', 'A negative trial is information. It is also the end of this company.') + '</div>';
        return h;
      }
      var a = access(S, w, p.dur);
      h += '<div class="lv-cards">';
      h += '<div class="lk-card"><div class="lk-field"><label for="lvPrice">Price a patient</label><output class="lk-range-out" id="lvPriceOut">' + F.usd(w.price) + 'k</output>' +
        '<input type="range" id="lvPrice" data-act="price" min="200" max="600" step="10" value="' + w.price + '"></div>' +
        '<p class="lv-note">Somebody has to decide what a one-time therapy is worth, and everybody involved is allowed to hate the answer. Launch prices for the first six products, 2017 to 2022, ran from $373,000 to $475,000; the 2024 leukemia product launched at $525,000, and list prices have climbed since.</p></div>';
      h += '<div class="lk-card"><p class="lk-kicker">Payment model</p>' +
        seg('pay', [['list', 'List price'], ['outcome', 'Outcomes based'], ['instal', 'Instalments']], w.pay, 'Payment model') +
        '<p class="lv-note">Outcomes-based payment moves risk off the payer. It does not move the cost of making a living product one patient at a time.</p></div>';
      var oc = S.ev.flags.rems ? OUTPT / 2 : OUTPT, oTox = p.crs3 >= 0.15, oCash = !w.outpatient && S.cash < oc;
      h += '<div class="lk-card"><p class="lk-kicker">The network</p>' + step('centers', F.n(w.centers) + ' centers', w.centers > 12, w.centers < 138 && S.cash >= CENTER) +
        '<p class="lv-note">Six more certified centers cost ' + F.M(CENTER, 0) + ', and the returns flatten past about sixty. Distance is the access variable nobody budgets for: in the real analysis, patients in the worst-served states averaged 104 miles to a center against 34 in the best-served.' +
        (S.mfg.platform === 'auto' && !S.mfg.cryo ? ' Your product is shipped fresh, so this network counts at about half.' : '') + '</p>' +
        '<button type="button" class="lk-opt lv-toggle" data-act="outpt" aria-pressed="' + (w.outpatient ? 'true' : 'false') + '"' + (oTox || oCash ? ' disabled' : '') + '>' +
        '<span class="lk-opt-l">Enable outpatient administration</span><span class="lk-opt-s">' + F.M(oc, 0) +
        (oTox ? '. Not available: your grade 3 or higher cytokine rate is ' + F.pct(p.crs3, 0) + '.'
          : '. Ten points of reach, for the people who cannot move near a treating center for two weeks.') + '</span>' +
        (!oTox && oCash ? '<span class="lk-opt-why">Not affordable: ' + E(F.M(S.cash, 0)) + ' in the bank</span>' : '') + '</button></div>';
      h += '<div class="lk-card"><p class="lk-kicker">Commercial capacity</p>' + step('suites', F.n(w.suites) + ' ' + F.plural(w.suites, 'suite'), w.suites > 1, w.suites < 5 && S.cash >= SUITE) +
        '<p class="lv-note">Each suite runs ' + F.n(S.mfg.platform === 'auto' ? 480 : 1200) + ' batches a year and costs ' + F.M(SUITE, 0) + '. The trial queue and the commercial factory are two different problems, and the second one is the one that caps your ceiling.</p>' +
        '<p class="lv-note">Launch budget left: <b>' + F.M(S.cash, 0) + '</b>. Centers, suites and outpatient care all come out of it, and selling capacity back recovers half.</p></div>';
      h += '</div>';
      h += '<ol class="lk-strip ledger ledger--data lv-led">' +
        cell('Qualify a year', F.n(Math.round(a.eligible))) +
        cell('Reach', F.pct(a.reach, 0), a.reach < 0.18 ? 'is-bad' : a.reach > 0.4 ? 'is-good' : '') +
        cell('Treated a year', F.n(Math.round(a.annual)), a.annual >= a.demand - 1 ? 'is-good' : 'is-warn') +
        cell('Durable a year', F.n(Math.round(a.annual * p.dur)), a.annual * p.dur > 400 ? 'is-good' : '') + '</ol>' +
        cvs('access', 190, 'Access chart.') +
        '<p class="lk-coach">' + (a.annual < a.demand - 1
          ? 'Demand is ' + F.n(Math.round(a.demand)) + ' and the factory can make ' + F.n(Math.round(a.capacity)) + '. Right now you are a manufacturing company that happens to own a therapy.'
          : 'The factory can cover the demand you have created. The constraint is now the label, the price and the map.') + '</p>';
      return h;
    }
    /* only a level that has actually been tested, and passed, can be called the dose */
    function canDeclare() {
      var L = null;
      S.tr.levels.forEach(function (x) { if (x.dl === S.tr.dl) L = x; });
      return !!(L && L.n >= 3 && (L.dlt === 0 || (L.n >= 6 && L.dlt <= 1)));
    }
    function renderBtns() {
      var h = '', t = S.tr;
      if (S.over) {
        h = '<button type="button" class="ebtn" data-act="replay">Replay this program</button>' +
          '<button type="button" class="ebtn2" data-act="fresh">New program</button>' +
          '<button type="button" class="ebtn2" data-act="case">Open the case file</button>';
      } else if (S.act === 1) {
        h = S.target ? '<button type="button" class="ebtn" data-act="toact2">Take it to the bench</button>' : '<span class="lv-hint">Choose a target to begin.</span>';
      } else if (S.act === 2) {
        var full = S.cx.binder && S.cx.htm && S.cx.costim && S.cx.vector;
        h = !S.cx.locked
          ? (full ? '<button type="button" class="ebtn" data-act="lock">Lock the construct</button><span class="lv-hint">Ten months of vector work, release assays and a package in animals follow.</span>'
            : '<span class="lv-hint">Four decisions, then you can lock it.</span>')
          : '<button type="button" class="ebtn" data-act="toact3">Go to the factory</button>';
      } else if (S.act === 3) {
        h = '<button type="button" class="ebtn" data-act="toact4">Open the trial</button>' +
          '<span class="lv-hint">Four months of facility qualification and one regulatory filing.</span>';
      } else if (S.act === 4) {
        var amend = '<button type="button" class="ebtn2" data-act="amend"' + (S.cash < AMEND_C ? ' disabled' : '') + '>Amend the construct (' + F.M(AMEND_C, 0) + ', about ' + (AMEND_M + 2 + 4) + ' months with requalification)</button>';
        if (t.stopped) {
          h = '<button type="button" class="ebtn" data-act="toact5">Take it to the world</button>' + amend;
        } else if (t.floored) {
          h = amend;
        } else {
          h = '<button type="button" class="ebtn" data-act="cohort">Enroll the next three</button>';
          if (canDeclare()) h += '<button type="button" class="ebtn2" data-act="declare">Declare this the dose</button>';
          h += amend;
        }
        h += '<button type="button" class="ebtn2" data-act="wind">Wind the program down</button>';
      } else if (S.act === 5) {
        if (S.piv.approved) h = '<button type="button" class="ebtn" data-act="close">Close the program and read the ledger</button>';
      }
      /* an open event card has to be answered before the program moves */
      if (S.ev.pending && !S.over) h = h.replace(/<button type="button" class="(ebtn2?)" data-act="(toact\d|cohort|declare|amend|lock|close|wind)"/g, '<button type="button" class="$1" disabled data-act="$2"') +
        '<span class="lv-hint">Answer the event first.</span>';
      keep(els.btns, function () { els.btns.innerHTML = h; });
    }


    /* ---------- canvases ---------- */
    function sum(key, text) {
      var p = root.querySelector('p[data-sum="' + key + '"]');
      if (p) p.textContent = text;
    }
    var SCOPE = null;
    function paintAll() {
      var list = root.querySelectorAll('canvas.lv-cv');
      Array.prototype.forEach.call(list, function (c) {
        var key = c.getAttribute('data-c'), h = parseInt(c.style.height, 10) || 150, f = K.fitCanvas(c, h);
        if (!(f.W > 4)) return;
        SCOPE = c.closest('.lv-hall');
        f.ctx.clearRect(0, 0, f.W + 2, h + 2);
        if (key === 'rec') paintRec(f, h);
        else if (key === 'queue') paintQueue(f, h);
        else if (key === 'exp') paintExp(f, h);
        else if (key === 'access') paintAccess(f, h);
      });
    }
    function ink(a) { return SCOPE ? K.labColorA('--ink', a, SCOPE) : K.inkColor(a); }
    function txt(c, str, x, y, o) { if (SCOPE && o.halo == null) o.halo = K.labColor('--card', SCOPE); K.cvText(c, str, x, y, o); }
    function paintRec(f, h) {
      var c = f.ctx, W = f.W, cx = Math.max(46, Math.min(84, W * 0.20)), lx = cx + 34;
      var last = S.cx.last, acc = K.ACC(), card = K.labColor('--card', SCOPE), T = LV_TARGETS[S.target];
      var memT = 82, memH = 22;
      var parts = [
        { k: 'scfv', y: 30, hh: 28, w: 34 },
        { k: 'hinge', y: 58, hh: memT - 58, w: 12 },
        { k: 'tm', y: memT, hh: memH, w: 20 },
        { k: 'costim', y: 112, hh: 28, w: 30 },
        { k: 'zeta', y: 144, hh: 26, w: 30 }
      ];
      var rows = [
        { y: 44, lbl: 'Binder (scFv)', nm: S.cx.binder ? LV_BINDER[S.cx.binder].nm : 'not chosen yet', on: last === 'binder' },
        { y: 90, lbl: 'Hinge and transmembrane', nm: S.cx.htm ? LV_HTM[S.cx.htm].nm : 'not chosen yet', on: last === 'htm' },
        { y: 124, lbl: 'Costimulatory domain', nm: S.cx.costim ? LV_COSTIM[S.cx.costim].nm : 'not chosen yet', on: last === 'costim' },
        { y: 156, lbl: 'Signaling tail', nm: 'CD3 zeta', on: false }
      ];
      /* the membrane */
      c.fillStyle = ink(0.05);
      c.fillRect(0, memT, W, memH);
      c.strokeStyle = ink(0.22); c.lineWidth = 1;
      c.beginPath(); c.moveTo(0, K.snap(memT)); c.lineTo(W, K.snap(memT));
      c.moveTo(0, K.snap(memT + memH)); c.lineTo(W, K.snap(memT + memH)); c.stroke();
      /* the antigen, held at a distance the binder decides */
      var gap = S.cx.binder === 'fast' ? 8 : S.cx.binder === 'hum' ? 4.5 : 1.5;
      var agTxt = T ? 'Antigen: ' + T.nm : 'The antigen';
      /* the two labels share the top line only when they fit side by side; otherwise the side label drops to the membrane */
      c.save(); c.font = K.LBL(10); if ('letterSpacing' in c) c.letterSpacing = '1px';
      var aw = c.measureText(agTxt.toUpperCase()).width, ow = c.measureText('OUTSIDE THE CELL').width;
      c.restore();
      if (lx + aw + 16 < W - 8 - ow) txt(c, 'Outside the cell', W - 8, 16, { px: 10, align: 'right', color: ink(0.45) });
      else txt(c, 'Outside the cell', W - 8, memT - 6, { px: 10, align: 'right', color: ink(0.45) });
      txt(c, 'Inside', W - 8, h - 8, { px: 10, align: 'right', color: ink(0.45) });
      c.fillStyle = ink(0.16); c.strokeStyle = ink(0.5); c.lineWidth = 1;
      c.beginPath(); c.rect(K.snap(cx - 17), K.snap(30 - 12 - gap), 34, 10); c.fill(); c.stroke();
      txt(c, agTxt, lx, 30 - 5 - gap, { px: 10, color: ink(0.6) });
      var onKey = { scfv: 'binder', hinge: 'htm', tm: 'htm', costim: 'costim', zeta: null };
      parts.forEach(function (p) {
        var on = last && onKey[p.k] === last;
        c.beginPath();
        c.rect(K.snap(cx - p.w / 2), K.snap(p.y), p.w, p.hh);
        c.fillStyle = on ? K.ACCA(0.18) : card; c.fill();
        c.lineWidth = on ? 2 : 1; c.strokeStyle = on ? acc : ink(0.55); c.stroke();
      });
      rows.forEach(function (r0) {
        txt(c, r0.lbl, lx, r0.y, { px: 10, color: ink(0.5) });
        txt(c, r0.nm, lx, r0.y + 15, { raw: true, font: '400 13px Georgia, serif', ls: '0px',
          color: r0.on ? K.labColor('--foil-text', SCOPE) : ink(0.88) });
      });
      sum('rec', 'Receptor, outside to inside: ' + rows.map(function (r0) { return r0.lbl + ', ' + r0.nm; }).join('; ') + '.');
    }
    function paintQueue(f, h) {
      var c = f.ctx, W = f.W, L = 10, R = W - 10, y = Math.round(h * 0.42), bh = 16;
      var days = v2v(S), q = Math.round(queueWait(S));
      var segs = [['Collect', 1], ['Manufacture', S.mfg.days], ['Release', 3], [S.mfg.cryo ? 'Freeze, ship, infuse' : 'Ship and infuse', Math.max(1, (S.mfg.cryo ? 10 : 6) - 3)]];
      if (q > 0) segs.push(['In the queue', q]);
      if (S.mfg.platform !== 'auto') segs = [[S.mfg.platform === 'allo' ? 'Off the shelf, thaw and infuse' : 'One infusion, no factory', days]];
      var tot = 0, i;
      for (i = 0; i < segs.length; i++) tot += segs[i][1];
      var x = L, sc = (R - L) / Math.max(1, tot);
      for (i = 0; i < segs.length; i++) {
        var w = segs[i][1] * sc, isQ = segs[i][0] === 'In the queue';
        c.beginPath(); c.rect(K.snap(x), K.snap(y), Math.max(1, w - 2), bh);
        c.fillStyle = isQ ? K.ACCA(0.14) : ink(0.06 + 0.05 * i); c.fill();
        c.lineWidth = 1; c.strokeStyle = isQ ? K.ACC() : ink(0.4); c.stroke();
        if (isQ) {
          c.save(); c.beginPath(); c.rect(x, y, Math.max(1, w - 2), bh); c.clip();
          c.strokeStyle = K.ACCA(0.5); c.beginPath();
          for (var hx = x - bh; hx < x + w; hx += 5) { c.moveTo(hx, y + bh); c.lineTo(hx + bh, y); }
          c.stroke(); c.restore();
        }
        c.save();
        c.font = K.LBL(10);
        if ('letterSpacing' in c) c.letterSpacing = '1px';
        var fits = c.measureText(segs[i][0].toUpperCase()).width + 10 < w;
        c.restore();
        if (fits) txt(c, segs[i][0], x + 4, y - 6, { px: 10, color: ink(0.55) });
        if (w > 26) txt(c, segs[i][1] + 'd', x + 4, y + bh + 13, { px: 10, color: ink(0.5) });
        x += w;
      }
      txt(c, 'Vein to vein: ' + days + ' days', L, h - 6, { px: 11, color: K.labColor('--foil-text', SCOPE) });
      sum('queue', 'Vein to vein ' + days + ' days: ' + segs.map(function (s) { return s[0] + ' ' + s[1] + ' days'; }).join(', ') + '.');
    }
    function paintExp(f, h) {
      var c = f.ctx, W = f.W, p = S.pts[sel], D = LVD(S);
      if (!p || !p.infused) return;
      var L = 34, R = W - 8, T0 = 16, B = h - 22, split = L + (R - L) * 0.72;
      var top = Math.max(0.6, p.e * 1.35), tau = 26 * Math.max(0.3, D.PER);
      function X(t) { return t <= 28 ? L + (split - L) * (t / 28) : split + (R - split) * Math.min(1, (t - 28) / 152); }
      function Y(v) { return B - (B - T0) * clamp(v / top, 0, 1); }
      function val(t) {
        if (t <= 0) return 0;
        if (t <= 28) return p.e * Math.pow(t / p.peak, 1.6) * Math.exp(1.6 * (1 - t / p.peak));
        var v28 = p.e * Math.pow(28 / p.peak, 1.6) * Math.exp(1.6 * (1 - 28 / p.peak));
        return v28 * Math.exp(-(t - 28) / tau);
      }
      /* the window where the cytokine trouble lives */
      c.fillStyle = K.inkColor(0.05);
      c.fillRect(X(1), T0, X(14) - X(1), B - T0);
      K.cvText(c, 'Cytokine window', X(1) + 4, T0 + 11, { px: 10, color: ink(0.5) });
      c.strokeStyle = ink(0.18); c.lineWidth = 1;
      c.beginPath(); c.moveTo(L, K.snap(B)); c.lineTo(R, K.snap(B)); c.stroke();
      c.setLineDash([2, 4]);
      c.beginPath(); c.moveTo(K.snap(split), T0); c.lineTo(K.snap(split), B); c.stroke();
      c.setLineDash([]);
      [[7, 'Day 7'], [14, 'Day 14'], [28, 'Day 28'], [90, 'Month 3'], [180, 'Month 6']].forEach(function (t) {
        K.cvText(c, t[1], X(t[0]), h - 6, { px: 10, align: t[0] === 180 ? 'right' : 'center', color: ink(0.45) });
      });
      K.cvText(c, 'Cells', 4, T0 + 4, { px: 10, color: ink(0.45) });
      c.strokeStyle = K.ACC(); c.lineWidth = 2; c.lineJoin = 'round';
      c.beginPath();
      for (var t = 0; t <= 180; t += 0.75) {
        var xx = X(t), yy = Y(val(t));
        if (t === 0) c.moveTo(xx, yy); else c.lineTo(xx, yy);
      }
      c.stroke();
      c.fillStyle = K.ACC();
      c.beginPath(); c.arc(X(p.peak), Y(p.e), 3, 0, 6.2832); c.fill();
      K.cvText(c, 'Peak ' + F.x(p.e, 2) + ' on day ' + p.peak, Math.min(R - 4, X(p.peak) + 6), Y(p.e) - 8, { px: 10, color: K.labColor('--foil-text'), align: X(p.peak) > W * 0.6 ? 'right' : 'left' });
      var marks = [];
      if (p.crs) marks.push([3, 'Cytokine grade ' + p.crs]);
      if (p.icans) marks.push([8, 'Neuro grade ' + p.icans]);
      marks.forEach(function (m, mi) {
        var xx = X(m[0]), tick = 12 + mi * 20, bad = (mi === 0 ? p.crs : p.icans) >= 3;
        c.strokeStyle = ink(0.45); c.lineWidth = 1;
        c.beginPath(); c.moveTo(K.snap(xx), B); c.lineTo(K.snap(xx), B - tick); c.stroke();
        K.cvText(c, m[1], xx + 4, B - tick - 3, { px: 10, color: K.labColor(bad ? '--loss' : '--ink-2') });
      });
      var m6 = val(180) / Math.max(0.0001, p.e);
      sum('exp', 'Peak expansion index ' + F.x(p.e, 2) + ' on day ' + p.peak + '. ' +
        (p.crs ? 'Cytokine release syndrome grade ' + p.crs + '. ' : 'No cytokine event. ') +
        (p.icans ? 'Neurological event grade ' + p.icans + '. ' : 'No neurological event. ') +
        'At month six the curve is at ' + F.pct(m6, 0) + ' of its peak.');
    }
    function paintAccess(f, h) {
      var c = f.ctx, W = f.W, a = access(S, S.world, S.piv.dur), L = 8, R = W - 8;
      var rows = [['Qualify each year', a.eligible, 'ink'], ['Reached by label, price and map', a.demand, 'ink2'],
        ['Treated, factory limit', a.annual, 'foil'], ['In durable remission', a.annual * S.piv.dur, 'gain']];
      var max = Math.max(1, a.eligible), bh = 18, gap = Math.max(10, (h - 26 - rows.length * bh) / rows.length);
      var y = 18;
      rows.forEach(function (r) {
        var w = (R - L) * clamp(r[1] / max, 0, 1);
        K.cvText(c, r[0], L, y - 5, { px: 10, color: ink(0.55) });
        c.beginPath(); c.rect(K.snap(L), K.snap(y), Math.max(2, w), bh);
        c.fillStyle = r[2] === 'foil' ? K.ACCA(0.85) : r[2] === 'gain' ? K.labColorA('--gain', 0.8) : K.inkColor(r[2] === 'ink' ? 0.16 : 0.3);
        c.fill();
        if (r[2] !== 'foil' && r[2] !== 'gain') { c.lineWidth = 1; c.strokeStyle = ink(0.35); c.stroke(); }
        K.cvText(c, F.n(Math.round(r[1])), Math.min(R - 2, L + w + 6), y + 13, { px: 11, align: L + w + 60 > R ? 'right' : 'left', color: ink(0.8) });
        y += bh + gap;
      });
      sum('access', 'Of about ' + F.n(Math.round(a.eligible)) + ' patients who qualify each year, ' + F.n(Math.round(a.demand)) +
        ' are reached by the label, the price and the map, the factory can treat ' + F.n(Math.round(a.annual)) +
        ', and about ' + F.n(Math.round(a.annual * S.piv.dur)) + ' of those go into durable remission.');
    }


    /* ---------- the 3D drawings: one live figure per scene, moved into its slot on each render ---------- */
    var SC = {}, peekT = null, SCN = {
      cells: ['car-cells', 'Drawing the cells.', 'A tumor cell and a healthy cell, in 3D',
        'Each spike is the antigen your receptor will grip. The tumor cell is on the left; the healthy tissue that carries the same antigen is on the right.'],
      rec: ['car-construct', 'Drawing the receptor.', 'Your receptor, in 3D',
        'Your receptor crosses the T cell’s membrane, with the binder outside and the signaling tail inside. Each domain drops in as you choose it. Tap one for its trade-off.'],
      ring: ['vein-ring', 'Drawing the loop.', 'Vein to vein, in 3D',
        'One patient’s trip as a loop: collection at the hospital, the queue, the factory, the courier back. One tick is one day.'],
      cells4: ['car-cells', 'Drawing the cells.', 'Your T cell meeting the tumor, in 3D',
        'Your cell meets the tumor at the distance your binder sets. The burst is the cytokine release that followed, larger when the event was more severe.'],
      ring4: ['vein-ring', 'Drawing the loop.', 'The trial’s vein-to-vein loop, in 3D',
        'Every enrolled patient rides this loop. A dot beside it is a patient lost in the queue; a ring is a batch that missed specification.'],
      access: ['car-access', '', 'Who your therapy reaches, in 3D',
        'Four slabs a year, each as wide as its number: the people who qualify, the ones the label, the price and the map reach, the ones the factory can treat, and the ones in durable remission. A dashed slab waits for the pivotal readout.']
    };
    function slot(k) { return D3.dead ? '' : '<div class="lv-slot" data-slot="' + k + '"></div>'; }
    function shownPt() {
      var p = sel >= 0 ? S.pts[sel] : null, i;
      for (i = S.pts.length - 1; !p && i >= 0; i--) if (S.pts[i].infused) p = S.pts[i];
      return p || S.pts[S.pts.length - 1] || null;
    }
    function p3(k) {
      var m = S.mfg, auto = m.platform === 'auto', pt = shownPt();
      if (k === 'rec') return { ag: S.target, binder: S.cx.binder, htm: S.cx.htm, costim: S.cx.costim, vector: S.cx.vector };
      if (k === 'cells') return { mode: 1, t: peekT || S.target || 'cd19' };
      if (k === 'cells4') return { mode: 4, t: S.target, b: S.cx.binder, gap: gapOf(S.cx.binder), pid: pt ? pt.id : 0, inf: !!(pt && pt.infused), crs: pt && pt.infused ? pt.crs : 0 };
      if (k === 'access') {
        var ac = access(S, S.world, S.piv.dur), ok = !!S.piv.approved;
        return { q: Math.round(ac.eligible), r: ok ? Math.round(ac.demand) : null, t: ok ? Math.round(ac.annual) : null, d: ok ? Math.round(ac.annual * S.piv.dur) : null };
      }
      return { act: k === 'ring4' ? 4 : 3, tot: v2v(S), q: auto ? Math.round(queueWait(S)) : 0, days: m.days, ret: m.cryo ? 6 : 2, auto: auto, lost: S.tr.lost, oos: S.tr.oos - S.tr.oosRel };
    }
    function now3(k, o) {
      var T = LV_TARGETS[o.t], p = shownPt();
      if (k === 'cells') return T.nm + ' · ' + T.dis + (S.target === o.t ? ' · your target' : '');
      if (k === 'cells4') return p ? 'Patient ' + pad(p.id) + ' · ' + DLN[p.dl - 1] + (p.infused ? '' : ' · not infused') : 'No patient infused yet';
      if (k === 'rec') return [o.binder, o.htm, o.costim, o.vector].filter(Boolean).length + ' of 4 decisions made';
      if (k === 'access') return o.r == null ? 'Qualify a year · ' + F.n(o.q) : 'Reach · ' + F.pct(o.r / Math.max(1, o.q), 0) + ' · Treated a year · ' + F.n(o.t);
      return 'Vein to vein · ' + o.tot + ' days' + (o.q ? ' · ' + o.q + ' in the queue' : '');
    }
    /* the first frame of a drawing: its registered poster (PS3D.debug.poster at rest, drawn on the hall) when the run is in
       the pose the poster shows, so the canvas takes over in the same frame. Otherwise the lit floor waits a frame for the engine. */
    function posterFor(k) {
      var o = p3(k);
      if (k === 'cells' && o.t === 'cd19' && LV_POSTER.cells) return LV_POSTER.cells;
      if (k === 'rec' && !(o.binder || o.htm || o.costim || o.vector) && LV_POSTER.rec) return LV_POSTER.rec;
      return '';
    }
    function mk3(k) {
      var c = SCN[k], f = document.createElement('figure'), id = 'lv3-' + k, sc;
      f.className = 'iso lk-scene lv-scene lv-scene--' + k.replace('4', '');
      f.innerHTML = '<div class="iso-stage" id="' + id + 's" tabindex="0" role="group" aria-roledescription="3D model" aria-label="' + E(c[2]) +
        '" aria-describedby="' + id + '">' + posterFor(k) + '</div>' +
        '<figcaption><p class="lv-3d" id="' + id + '">' + E(c[3]) + '</p><p class="lv-3now"></p></figcaption>';
      sc = SC[k] = { fig: f, now: f.querySelector('.lv-3now') };
      need3().then(function (P) {
        if (SC[k] !== sc) return null;
        var o = { params: p3(k), tilt: false, pins: k.indexOf('4') < 0 && k !== 'cells' };
        models3(P);
        return typeof K.scene === 'function' ? K.scene(f, c[0], o) : P.mount(f, c[0], o);
      }).then(function (ex) {
        if (ex && SC[k] !== sc) ex.destroy();
        else if (ex) {
          sc.ex = ex;
          /* the pins wait for the first drawn frame, so nothing stacks in a corner over the poster */
          ex.vw.on('shown', function () { f.classList.add('is-shown'); });
          if (k === 'cells') badges(ex);
          sync(k, true);
        }
      }).catch(dead3);
      return sc;
    }
    /* Act I's two numbers stand off their cells on the shared label layer, each on a hairline to the membrane it names, so
       neither sits on the drawing. The layer keeps them in frame and clear of each other; a tap selects the cell, as a pin does. */
    function badges(ex) {
      var L = ex.labs, host = ex.pinsEl, NS = 'http://www.w3.org/2000/svg', its = [], svg;
      if (!L || !L.add || !host) return;
      /* the leaders get their own sheet: the explorer empties the pin layer when it builds, the layer's own sheet with it */
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'ps3d-leaders lv-leads'); svg.setAttribute('aria-hidden', 'true');
      host.insertBefore(svg, host.firstChild);
      [['tumor', 1, [-.39, .84, .39], 'is-l'], ['healthy', 2, [.28, .6, -.28], 'is-r']].forEach(function (b) {
        var n = ex.parts[b[0]];
        if (!n) return;
        var el = document.createElement('span'), ln = document.createElementNS(NS, 'line'), dot = document.createElementNS(NS, 'circle');
        el.className = 'iso-pin lv-badge ' + b[3];
        el.textContent = String(b[1]);
        el.setAttribute('data-part', b[0]);
        el.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        el.addEventListener('click', function () { ex.select(ex.sel === b[0] ? null : b[0]); });
        host.appendChild(el);
        ln.setAttribute('class', 'lv-lead'); dot.setAttribute('class', 'lv-lead-dot'); dot.setAttribute('r', '1.8');
        svg.appendChild(ln); svg.appendChild(dot);
        its.push({ it: L.add({ el: el, at: b[2], n: n, leader: false }), ln: ln, dot: dot });
      });
      ex.vw.on('frame', function () {
        its.forEach(function (q) {
          var it = q.it, cx = it.x + it.w / 2, cy = it.y + it.h / 2, dx = cx - it.ax, dy = cy - it.ay, d = Math.sqrt(dx * dx + dy * dy);
          if (!it.vis || it.out || d < it.w) { q.ln.style.display = q.dot.style.display = 'none'; return; }
          var r = (d - it.w / 2 - 2) / d;
          q.ln.setAttribute('x1', it.ax.toFixed(1)); q.ln.setAttribute('y1', it.ay.toFixed(1));
          q.ln.setAttribute('x2', (it.ax + dx * r).toFixed(1)); q.ln.setAttribute('y2', (it.ay + dy * r).toFixed(1));
          q.dot.setAttribute('cx', it.ax.toFixed(1)); q.dot.setAttribute('cy', it.ay.toFixed(1));
          q.ln.style.display = q.dot.style.display = '';
        });
      });
      ex.vw.invalidate();
    }
    function drop3(k) {
      var sc = SC[k];
      delete SC[k];
      if (sc && sc.ex) { try { sc.ex.destroy(); } catch (e) {} }
      if (sc && sc.fig.parentNode) sc.fig.parentNode.removeChild(sc.fig);
    }
    /* no engine: the 2D receptor and queue drawings come back */
    function dead3(e) {
      if (D3.dead) return;
      D3.dead = true;
      try { console.warn('[lab:living-drug] 3D unavailable; the 2D drawings stay', e); } catch (x) {}
      Object.keys(SC).forEach(drop3);
      renderStage(); paintAll();
    }
    function sync(k, first) {
      var sc = SC[k], o = p3(k), was = sc && sc.o, key = JSON.stringify(o), d = null;
      if (!sc) return;
      sc.now.textContent = now3(k, o);
      if (!sc.ex || (!first && key === sc.key)) return;
      sc.key = key; sc.o = o;
      if (k === 'rec') {
        if (was) ['binder', 'htm', 'costim', 'vector'].forEach(function (x) { if (o[x] && o[x] !== was[x]) d = x === 'vector' ? 'vec' : x; });
        sc.ex.set(mix(o, { drop: d }));
        if (d) sc.ex.select(d, false);
      } else if (k === 'access') sc.ex.set(o);
      else sc.ex.set(mix(o, k === 'cells4' ? { play: first || was.pid !== o.pid } : { trip: first || was.tot !== o.tot }));
    }
    function place3() {
      var want = {};
      Array.prototype.forEach.call(els.show.querySelectorAll('[data-slot]'), function (s) {
        var k = s.getAttribute('data-slot'), fg = (SC[k] || mk3(k)).fig;
        want[k] = 1;
        if (fg.parentNode !== s) s.appendChild(fg);
        sync(k);
      });
      Object.keys(SC).forEach(function (k) { if (!want[k]) drop3(k); });
    }
    /* Act I: a hovered or focused target card previews in the drawing */
    function peek(t) { if (peekT !== t) { peekT = t; sync('cells'); } }
    function out(ev, g) { if (!(ev.relatedTarget && g.contains(ev.relatedTarget))) peek(null); }
    K.on(root, 'mouseover', '.lv-tcard[data-v], .lv-pk[data-v]', function (ev, b) { peek(b.getAttribute('data-v')); });
    K.on(root, 'focusin', '.lv-tcard[data-v], .lv-pk[data-v]', function (ev, b) { peek(b.getAttribute('data-v')); });
    K.on(root, 'mouseout', '.lv-targets, .lv-pks', out);
    K.on(root, 'focusout', '.lv-targets, .lv-pks', out);

    /* ---------- wiring ---------- */
    var ENDINGS = {
      fatal: { t: 'The first in human', s: 'and the last', l: 'You gave cells whose receptor recognized a little of your antigen on a patient’s healthy tissue. The receptor did exactly what you built it to do. This is the one failure mode in this field with no gentle version, and it is why binder affinity, delivery route and the first dose level are safety decisions rather than paperwork.' },
      factory: { t: 'The factory failure', s: 'the therapy worked, the program did not', l: 'Your therapy worked in the patients who got it. Most of them did not get it. Somewhere between the collection chair and the release assay, the program died of logistics.' },
      unaffordable: { t: 'The unaffordable cure', s: 'approved, durable, out of reach', l: 'The label says who qualifies. The price, the network and the distance say who is treated, and those are the numbers you moved least.' },
      flare: { t: 'The expansion trap', s: 'everybody responded, almost nobody stayed', l: 'You built a receptor that goes off like a flare: enormous early expansion, and nothing left in the tank at month six. The response rate is the best number in your deck and the least useful one in the clinic.' },
      narrow: { t: 'The narrow miracle', s: 'worth doing, not yet a public health event', l: 'One of the better therapies in the field, delivered to a small number of people, by a small number of centers, at the speed of one factory.' },
      modest: { t: 'The modest solid-tumor win', s: 'measured in months', l: 'You moved a solid-tumor curve, which almost nobody has done, and the size of the move is measured in months.' },
      shelf: { t: 'The off-the-shelf bet', s: 'the queue is gone', l: 'You traded the patient’s own cells for a product that exists before the patient does. The queue is gone. The immune system’s objection to somebody else’s cells is now your permanent research problem.' },
      living: { t: 'The living drug', s: 'the ceiling of the genre', l: 'A one-time therapy, made from the patient, that puts a meaningful share of the people who qualify into durable remission and reaches them. This is the top of what this modality can currently do, and it took the whole board’s patience to get here.' },
      middle: { t: 'The middle of the field', s: 'approved, with a clear label', l: 'A real therapy with a real label, sitting in the middle of the distribution. It helps, it does not hold most of the people who get it, and the next version is somebody’s whole career.' },
      negative: { t: 'The clear negative', s: 'information, expensively bought', l: 'The trial answered the question and the answer was no. That is a result, it is publishable, and it is the end of this company.' },
      runway: { t: 'The runway', s: 'a common ending in this field', l: 'The money and the calendar ran out first, which is how many cell therapy programs end.' },
      shelved: { t: 'The shelved program', s: 'stopped before the answer', l: 'You stopped with money in the bank and the question still open. Sometimes that is discipline and sometimes it is nerve, and the ledger cannot tell which. The cell bank goes in the freezer and the target goes back on the market.' }
    };
    /* the same safety failure reads differently when a small phase 1 missed it and the pivotal did not */
    var FATAL_PIV = { t: 'The fatal readout', s: 'too rare for a phase 1 to see',
      l: 'Your phase 1 was too small to see it; a pivotal trial was not. Cells whose receptor recognized a little of your antigen on healthy tissue killed a patient, and the trial stops here. Rare catastrophic events are the reason the first dose levels are small and the first cohorts are watched so closely, and the reason a clean phase 1 is not proof of safety.' };

    /* ---------- the trial flow ---------- */
    function feedNotInfused(pt) {
      if (pt.oos && !pt.oosInfused) feed('Patient ' + pad(pt.id) + ': the batch missed its release criteria and, under a tight specification, was not infused. One patient, one batch, no second try.', 'Factory');
      else if (pt.lost) feed('Patient ' + pad(pt.id) + ' was lost while waiting. Vein to vein was ' + (pt.v2v != null ? pt.v2v : v2v(S)) + ' days, and the disease did not wait that long.', 'Factory');
      else feed('Patient ' + pad(pt.id) + ' was not infused.', 'Factory');
      if (pt.oos) unlock('oos', 'A batch of your own');
      if (pt.lost) unlock('v2v', 'A patient lost in the queue');
    }
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function feedPatient(pt) {
      if (pt.fatal) {
        feed('Patient ' + pad(pt.id) + ' died within days of infusion. The event was attributed to the receptor recognizing the antigen on healthy tissue. The trial stops here.', 'Safety');
        unlock('oot', 'The first in human');
        return;
      }
      var bits = [];
      bits.push('peak expansion ' + F.x(pt.e, 2));
      bits.push(pt.crs ? 'cytokine grade ' + pt.crs : 'no cytokine event');
      bits.push(pt.icans ? 'neurological grade ' + pt.icans : 'no neurological event');
      bits.push(pt.resp ? 'response at day 28' : 'no response at day 28');
      feed('Patient ' + pad(pt.id) + ', ' + DLN[pt.dl - 1] + ', burden ' + F.pct(pt.burden, 0) + ': ' + bits.join(', ') + '.' +
        (pt.oosInfused ? ' Released out of specification, at reduced potency.' : '') +
        (pt.oot >= 3 ? ' A grade ' + pt.oot + ' event attributed to the receptor recognizing ' + E(LV_TARGETS[S.target].ootKind) + '.' : ''), 'Trial');
      if (pt.death) feed('Patient ' + pad(pt.id) + ' died' + (pt.infection ? ' of an infection while the blood counts were still low after conditioning' : '') + '. The death is counted as treatment related and as a dose-limiting toxicity at ' + DLN[pt.dl - 1] + '.', 'Safety');
      if (pt.crs) unlock('crs', 'Patient ' + pad(pt.id));
      if (pt.icans) unlock('icans', 'Patient ' + pad(pt.id));
      if (pt.act === 'il6' || pt.act === 'steroid' || S.tr.anakinra) unlock('il6', 'Your protocol policy');
      if (pt.escape) unlock('escape', 'Patient ' + pad(pt.id));
      if (pt.oosInfused) unlock('oos', 'A batch released wide');
    }
    function doCohort() {
      if (S.over || pend) return;
      cohortIn = S.pts.length;
      var out = runCohort(S);
      queue = out.slice();
      processQueue();
    }
    function processQueue() {
      while (queue.length) {
        var pt = queue.shift();
        if (!pt.infused) { commit(S, pt, 'none'); feedNotInfused(pt); continue; }
        var raw = rawSev(S, LVD(S), pt), g = Math.max(grade(raw.sev), grade(raw.sevN));
        if (g >= 2 && S.tr.interrupts < 6) {
          S.tr.interrupts += 1;
          pend = { pt: pt, g: grade(raw.sev), gn: grade(raw.sevN) };
          renderVitals(); renderStage(); renderSide(); renderBtns(); renderFeed();
          renderInterrupt();
          return;
        }
        commit(S, pt, actFor(S, pt));
        feedPatient(pt);
      }
      afterCohort();
    }
    function renderInterrupt() {
      var p = pend.pt, cur = S.tr.tox;
      var h = '<div class="lk-card lk-card--event lv-evcard"><p class="lk-kicker lk-kicker--foil">The safety monitor asks</p>' +
        '<h5 class="lv-evt" tabindex="-1">Patient ' + pad(p.id) + ', ' + DLN[p.dl - 1] + ': ' + (pend.g >= 2 ? 'a grade ' + pend.g + ' cytokine event' : 'a grade ' + pend.gn + ' neurological event') + '</h5>' +
        '<p class="lk-lede">Your written policy is <b>' + E(TOXN[cur]) + '</b>. The monitor wants to know whether the protocol should say something else for this cohort. This is a model decision about a protocol, and nothing here is a clinical instruction.</p>' +
        opt('ipick', 'none', false, 'Leave the protocol as written', 'Supportive care only. You learn what the construct does without a drug in the way, and you carry the risk of it getting worse.') +
        opt('ipick', 'il6', false, 'Amend to interleukin-6 receptor blockade', 'The standard tool for the cytokine syndrome. It does very little for the neurological one, and the field note explains why.') +
        opt('ipick', 'steroid', false, 'Amend to corticosteroids', 'Reaches both syndromes, including the neurological one. In this model it costs some of the expansion you were counting on; in the clinic that cost is still debated.') +
        '</div>';
      els.ev.innerHTML = h;
      els.ev.removeAttribute('data-k');
      K.focus(els.ev.querySelector('.lv-evt'), { scroll: true });
    }
    function afterCohort() {
      var dl = S.tr.dl, i, fatal = false;
      for (i = 0; i < S.pts.length; i++) if (S.pts[i].fatal) fatal = true;
      unlock('dose', 'Your first cohort');
      unlock('ld', 'Your first cohort');
      if (fatal) { ender('fatal'); return; }
      if (holdCheck(S)) feed('The program is on clinical hold. Six months, fifteen points of trust, and you cannot resume until you change something: the dose, the construct, the conditioning or who you enroll.', 'Safety');
      var code = escalate(S), L = levelOf(S, dl);
      var WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
      function nw(n) { return WORDS[n] || F.n(n); }
      if (code === 'up') feed('No dose-limiting toxicity at ' + DLN[dl - 1] + '. The escalation rules move you to ' + DLN[dl] + ', which is roughly double.', 'Trial');
      else if (code === 'confirm') feed('At ' + DLN[dl - 1] + ', ' + nw(L.dlt) + ' of ' + nw(L.n) + ' patients had a dose-limiting toxicity, and the level above has already failed. Before anybody calls this the maximum tolerated dose, the rule wants six patients here.', 'Trial');
      else if (code === 'confirmTop') feed('No dose-limiting toxicity in ' + nw(L.n) + ' patients at ' + DLN[4] + ', the top of the protocol. The rule fills the level to six before you take it forward.', 'Trial');
      else if (code === 'top') feed('At ' + DLN[4] + ', ' + nw(L.dlt) + ' of ' + nw(L.n) + ' patients had a dose-limiting toxicity. There is nothing above it in this protocol, so ' + DLN[4] + ' is the highest dose tested and the recommended dose; no maximum tolerated dose was reached. You can still amend the construct if you think the ceiling is in the wrong place.', 'Trial');
      else if (code === 'expand') feed('One dose-limiting toxicity in ' + nw(L.n) + ' patients at ' + DLN[dl - 1] + '. The rule expands the level to six patients rather than deciding on three.', 'Trial');
      else if (code === 'back') feed('At ' + DLN[dl - 1] + ', ' + nw(L.dlt) + ' of ' + nw(L.n) + ' patients had a dose-limiting toxicity. That level is too high, so the rules step back to ' + DLN[dl - 2] + ' and expand it to six before anybody calls it the maximum tolerated dose.', 'Trial');
      else if (code === 'mtd') feed((S.tr.mtd === dl ? 'Six patients at ' + DLN[dl - 1] + ' with no more than one dose-limiting toxicity, and the level above has failed.'
        : 'At ' + DLN[dl - 1] + ', ' + nw(L.dlt) + ' of ' + nw(L.n) + ' patients had a dose-limiting toxicity, and the level below already holds six.') +
        ' ' + DLN[S.tr.mtd - 1] + ' is the maximum tolerated dose and the recommended dose.', 'Trial');
      else if (code === 'floor') feed('Two dose-limiting toxicities at the first level, and there is nothing below it in this protocol. Amend the construct and the escalation starts again, or wind the program down.', 'Safety');
      if (S.cash <= 0 || S.month >= CLOCK) { ender(); return; }
      renderAll();
      settle();
    }
    var POST = ['rems', 'earlier', 'secondary', 'quiet'];   /* the cards that still change anything once a label exists */
    function runPivotal() {
      var d = PIV[S.piv.design], i;
      S.piv.tries += 1;
      S.cash -= pivCost(S, S.piv.design);
      advance(S, d.m);
      if (S.piv.design === 'rand' && S.piv.tries === 1) S.trust += 10;
      var rev = pivotalReview(S);
      for (i = 0; i < rev.length; i++) feed(E(rev[i]), 'Regulator');
      var o = readout(S, d.n, 1717 + S.piv.tries * 37);
      S.cash -= o.cost;
      S.piv.n = d.n; S.piv.inf = o.inf; S.piv.orr = o.orr; S.piv.cr = o.cr; S.piv.dur = o.dur;
      S.piv.crs3 = o.crs3; S.piv.icans3 = o.icans3; S.piv.g5 = o.g5; S.piv.hr = o.hr; S.piv.deaths = o.deaths;
      S.piv.done = true;
      feed('Pivotal readout, ' + F.n(d.n) + ' patients: response ' + F.pct(o.orr, 0) + ', complete ' + F.pct(o.cr, 0) + ', durable ' +
        F.pct(o.dur, 0) + ', grade 3 or higher cytokine ' + F.pct(o.crs3, 0) + ', grade 3 or higher neurological ' + F.pct(o.icans3, 0) +
        (S.piv.design === 'rand' ? ', hazard ratio ' + F.x(o.hr, 2, false).replace('×', '') : '') + '.', 'Trial');
      if (o.deaths) feed('In the pivotal trial, ' + F.n(o.deaths) + ' ' + F.plural(o.deaths, 'patient') + ' died of treatment-related causes, ' + F.pct(o.g5, 1) + ' of those infused.', 'Safety');
      if (o.fatal && LV_TARGETS[S.target].hard) {
        S.piv.fatalHere = true;
        feed('A patient died within days of infusion. The event was attributed to the receptor recognizing the antigen on healthy tissue. The trial stops here.', 'Safety');
        unlock('oot', 'The fatal readout');
        ender('fatal');
        return;
      }
      S.piv.approved = approvalOf(S, o);
      var T = LV_TARGETS[S.target], bar = T.kind === 'liquid' ? 0.45 : 0.25;
      S.piv.why = S.piv.approved ? ''
        : S.piv.g5 > 0.05 ? 'The treatment-related death rate was ' + F.pct(S.piv.g5, 1) + ', above the five percent the reviewers will accept from this model.'
          : S.trust < 45 ? 'Your trust score is ' + Math.round(S.trust) + '. The reviewers have questions you have not answered.'
            : S.piv.design === 'rand' ? 'The hazard ratio was ' + F.x(S.piv.hr, 2, false).replace('×', '') + '. This model wants it under 0.70 for a full approval.'
              : 'The response rate was ' + F.pct(S.piv.orr, 0) + ' against the ' + F.pct(bar, 0) + ' this model wants from a single-arm trial in this setting.';
      feed(S.piv.approved ? '<b>Approved.</b> The label is yours. Now find out who can get it.' : '<b>Not approved.</b> ' + E(S.piv.why), 'Regulator');
      if (S.piv.approved && !S.ev.flags.launch) {
        S.ev.flags.launch = 1; S.cash += LAUNCH;
        feed('With a label in hand the board raises ' + F.M(LAUNCH, 0) + ' for the launch. It is the only moment in this story when money is easy.', 'Board');
      }
      if (S.cash <= 0 || S.month >= CLOCK) { ender(); return; }
      /* once the label exists, only the cards that can still move access are played */
      fireEvent(S.piv.approved ? POST : null);
      renderAll();
      settle();
    }
    function closeProgram() {
      var a = access(S, S.world, S.piv.dur), w = S.world;
      w.reach = a.reach; w.eligible = a.eligible; w.demand = a.demand; w.capacity = a.capacity;
      w.annual = a.annual; w.lives3 = a.lives3; w.done = true;
      unlock('access', 'Your own access readout');
      ender();
    }

    /* ---------- the debrief ---------- */
    function debrief() {
      var T = LV_TARGETS[S.target] || LV_TARGETS.cd19, p = S.piv, w = S.world, t = S.tr;
      var end = ENDINGS[S.ending] || ENDINGS.runway, D = LVD(S);
      if (S.ending === 'fatal' && p.fatalHere) end = FATAL_PIV;
      var ratio = t.enrolled ? t.infused / t.enrolled : 0, allDead = t.deaths + (p.deaths || 0);
      var stats = [
        { k: 'Months elapsed', v: F.n(S.month) },
        { k: 'Capital spent', v: F.M(260 - S.cash + (S.ev.flags.launch ? LAUNCH : 0) + (S.ev.flags.partner || 0), 0) },
        { k: 'Enrolled, infused', v: F.n(t.enrolled) + ', ' + F.n(t.infused), tone: ratio && ratio < 0.6 ? 'loss' : null },
        { k: 'Grade 3+ cytokine', v: p.done ? F.pct(p.crs3, 0) : '–', tone: p.done && p.crs3 > 0.2 ? 'loss' : null },
        { k: 'Treatment-related deaths', v: F.n(allDead), tone: allDead ? 'loss' : null },
        { k: 'Durable remissions', v: p.done ? F.pct(p.dur, 0) : '–', tone: p.done && p.dur >= 0.35 ? 'gain' : null },
        { k: 'Reached a year', v: w.done ? F.n(Math.round(w.annual)) : '–' },
        { k: 'Of those who qualify', v: w.done ? F.pct(w.annual / Math.max(1, w.eligible), 1) : '–', tone: w.done && w.annual / Math.max(1, w.eligible) < 0.18 ? 'loss' : null }
      ];
      var mine = [];
      mine.push(K.lesson({ title: 'The receptor you built',
        you: { html: 'You chose ' + (S.cx.binder ? E(LV_BINDER[S.cx.binder].nm.toLowerCase()) : 'no binder') + ', a ' +
          (S.cx.htm ? E(LV_HTM[S.cx.htm].nm.split(' hinge')[0]) : 'default') + ' hinge, ' +
          (S.cx.costim ? E(LV_COSTIM[S.cx.costim].nm) : 'no') + ' costimulation and a ' +
          (S.cx.vector ? E(LV_VECTOR[S.cx.vector].nm.toLowerCase()) : 'default') + ' vector. That came out as potency ' +
          F.x(D.POT, 2) + ', persistence ' + F.x(D.PER, 2) + ' and toxicity propensity ' + F.x(D.TOXP, 2) + '.' },
        principle: 'Force and durability are traded, not added. Affinity, hinge geometry and costimulation each move early expansion and long persistence in opposite directions.',
        history: 'The two first-approved anti-CD19 products differ in exactly these places: one pairs a CD8 alpha hinge with 4-1BB on a lentiviral vector, the other pairs a CD28 hinge and domain on a gammaretroviral vector. Both cure people.',
        src: [S_KYM, S_YESC, S_CAPPELL] }));
      mine.push(K.lesson({ title: 'The factory you built',
        you: 'Culture ' + S.mfg.days + ' days, ' + (S.mfg.specs === 'tight' ? 'tight' : 'wide') + ' release specifications, ' +
          (S.mfg.cryo ? 'cryopreserved' : 'fresh') + ', ' + S.mfg.slots + ' clinical slots, ' +
          (S.mfg.platform === 'auto' ? 'autologous' : S.mfg.platform === 'allo' ? 'an allogeneic program' : 'an in vivo bet') +
          '. Vein to vein ended at ' + v2v(S) + ' days, ' + F.n(t.oos) + ' ' + F.plural(t.oos, 'batch', 'batches') +
          ' missed specification and ' + F.n(t.lost) + ' ' + F.plural(t.lost, 'patient') + ' were lost waiting.',
        principle: 'In an autologous therapy the supply chain is part of the mechanism of action. A batch that arrives late or out of specification has an efficacy of zero for that patient.',
        history: 'In the registration trials, the product was manufactured for 99 percent of enrolled patients and given to 91 percent for one product, while roughly 7 to 9 percent of enrolled patients in another product’s leukemia and lymphoma registration studies never received it because manufacturing failed.',
        src: [S_ZUMA1, S_KYM, S_BPD] }));
      mine.push(K.lesson({ title: 'The trial you ran',
        you: 'Conditioning: ' + LDN[t.ld].toLowerCase() + '. Enrollment: ' + BURDN[t.burden].toLowerCase() + '. Policy for severe events: ' +
          TOXN[t.tox].toLowerCase() + (t.anakinra ? ', with interleukin-1 blockade added' : '') + '. You escalated to ' +
          DLN[(t.rp2d || t.dl) - 1] + (t.mtd ? ' with the maximum tolerated dose at ' + DLN[t.mtd - 1]
            : t.how === 'top' ? ', the highest dose tested, with no maximum tolerated dose reached'
              : t.how === 'declared' ? ', which you declared before the rules found a ceiling' : t.floored ? ', where the first level failed' : '') +
          ', across ' + F.n(t.infused) + ' infused patients, with ' + F.n(t.deaths) + ' treatment-related ' + F.plural(t.deaths, 'death') + ' in the dose-finding trial' +
          (p.done ? ' and ' + F.n(p.deaths || 0) + ' in the pivotal' : '') + '.',
        principle: 'The toxicity and the cure are the same biology. Disease burden at infusion moves both, conditioning moves both, and the drug you pick to blunt the storm decides which syndrome you reach.',
        history: 'Patients with a low marrow burden had markedly less cytokine release syndrome and neurotoxicity and longer survival in a phase 1 study of 53 adults; adding fludarabine to conditioning improved persistence and disease-free survival in another; and in mouse work, blocking interleukin-1 prevented both syndromes while interleukin-6 blockade did not prevent the delayed neurological one.',
        src: [S_PARK, S_TURTLE, S_NOREL] }));
      if (p.design) {
        mine.push(K.lesson({ title: 'The evidence you bought',
          you: p.design === 'rand'
            ? 'A randomized trial: ' + F.n(p.n) + ' patients, ' + PIV.rand.m + ' months, ' + F.M(pivCost(S, 'rand'), 0) + ', hazard ratio ' + F.x(p.hr, 2, false).replace('×', '') + '.'
            : 'A single-arm response-rate trial: ' + F.n(p.n) + ' patients, ' + PIV.fast.m + ' months, ' + F.M(pivCost(S, 'fast'), 0) + ', response rate ' + F.pct(p.orr, 0) + '.',
          principle: 'A response rate tells you whether tumors shrink. A randomized comparison tells you whether people live longer. The first one is faster, cheaper and easier to argue with.',
          history: 'Single-arm response-rate trials brought this modality to patients years earlier. The randomized second-line trial that followed reported median event-free survival of 8.3 against 2.0 months and, at the five-year analysis, four-year overall survival of 54.6 against 46.0 percent.',
          src: [S_ZUMA7, S_ZUMA7OS] }));
      }
      if (w.done) {
        mine.push(K.lesson({ title: 'The access you built',
          you: F.usd(w.price) + 'k a patient on a ' + (w.pay === 'list' ? 'list price' : w.pay === 'outcome' ? 'pay-for-response' : 'three-year instalment') +
            ' basis, ' + F.n(w.centers) + ' centers, ' + (w.outpatient ? 'outpatient enabled' : 'inpatient only') + ', ' + w.suites + ' ' +
            F.plural(w.suites, 'manufacturing suite') + '. Reach ' + F.pct(w.reach, 0) + ', treated ' + F.n(Math.round(w.annual)) +
            ' of about ' + F.n(Math.round(w.eligible)) + ' who qualify.',
          principle: 'Eligible and treated are different numbers, and the gap between them is made of price, payment mechanics, accredited centers and driving distance.',
          history: 'In a SEER-Medicare analysis, 122 of 2,241 patients treated in the third line or later for one lymphoma received a CAR-T therapy, about 5.4 percent, and closing the distance gap between poor-access and better-access states was estimated to raise the number treated by 37.6 percent.',
          src: [S_SEER, S_BLOODREV] }));
      }
      var rec = [];
      if (t.enrolled) {
        rec.push(K.lesson({ title: 'Enrolled against infused',
          you: 'Yours: ' + F.n(t.infused) + ' of ' + F.n(t.enrolled) + ', ' + F.pct(ratio, 0) + '.',
          principle: W_LOST,
          history: 'One pivotal lymphoma trial manufactured for 110 of 111 enrolled patients and infused 101. The label of another product records 106 of 160 enrolled patients receiving it, with 11 manufacturing failures. Same modality, same years, different factory.',
          src: [S_ZUMA1, S_KYM] }));
        rec.push(K.lesson({ title: 'Vein to vein',
          you: 'Yours: ' + v2v(S) + ' days at the end of the run.',
          principle: 'The clock between collection and infusion is part of the therapy, because the disease keeps moving inside it.',
          history: 'An approved product’s label reports a median of 17 to 18 days from collection to delivery of the product to the treating site, with a range reaching past seven weeks, and the plain-language description of the whole process is three to five weeks.',
          src: [S_YESC, S_NCI] }));
      }
      if (p.done) {
        rec.push(K.lesson({ title: 'Toxicity, and why the numbers do not compare',
          you: 'Yours: ' + F.pct(p.crs3, 0) + ' grade 3 or higher cytokine release syndrome and ' + F.pct(p.icans3, 0) + ' grade 3 or higher neurological events at the recommended dose.',
          principle: 'Cross-trial toxicity comparisons are mostly comparisons of grading systems and patient selection.',
          history: 'Reported grade 3 or higher rates vary widely: for example, 13 percent cytokine and 28 percent neurological in one 2017 lymphoma trial, against 2.4 and 7.1 percent in a 2024 leukemia trial of an intermediate-affinity receptor. A consensus grading system was only published in 2019, which is exactly why the older numbers do not line up.',
          src: [S_ZUMA1, S_FELIX, S_ASTCT] }));
        rec.push(K.lesson({ title: 'The costimulation argument',
          you: 'You chose ' + (S.cx.costim ? LV_COSTIM[S.cx.costim].nm : 'the default') + '.',
          principle: 'This machine sharpens the CD28 and 4-1BB difference so that one session is enough to see it. Hold your conclusion loosely.',
          history: 'A published review of the two domains found similar anticancer activity across the approved anti-CD19 products regardless of which domain they used, with higher reported neurological toxicity rates for the CD28 products, probably from a combination of causes rather than the domain alone.',
          src: [S_CAPPELL, S_KAWA] }));
      }
      if (w.done) {
        rec.push(K.lesson({ title: 'Price and payment',
          you: 'Yours: ' + F.usd(w.price) + 'k, on a ' + (w.pay === 'list' ? 'list price' : w.pay === 'outcome' ? 'pay-for-response' : 'three-year instalment') + ' basis.',
          principle: 'A one-time therapy breaks the machinery that pays for medicine monthly, so the payment model becomes part of the product design.',
          history: 'Launch list prices for the first six products ran from $373,000 to $475,000 between 2017 and 2022, a 2024 leukemia product launched at $525,000, and list prices have climbed since; one analysis puts the whole episode of care above a million dollars, and the first approval came with an arrangement tying payment to a response by the end of the first month.',
          src: [S_HMPI, S_MEDLET, S_AJMC, S_NOV] }));
      }
      var sens = null, sHtml = '';
      try { sens = sensitivity(S); } catch (e) { sens = null; }
      if (sens && sens.list.length) {
        var top = sens.list.slice(0, 3);
        sHtml = '<p>Holding the seed and every other decision still, and rerunning the readout and the access model with one decision flipped at a time, three of your choices did most of the work in this run.</p>' +
          '<div class="lk-scroll"><table class="lk-table lk-table--stack"><caption class="vh">The three decisions that moved the outcome most</caption><thead><tr>' +
          '<th scope="col">If you had changed</th><th scope="col">Durable remissions in three years</th><th scope="col">Against your ' + F.n(sens.base) + '</th></tr></thead><tbody>';
        top.forEach(function (x) {
          sHtml += '<tr><td>' + E(x.label) + '</td><td data-l="Durable in three years">' + F.n(x.lives3) + '</td>' +
            '<td data-l="Change"><span class="' + (x.delta > 0 ? 'lk-loss' : x.delta < 0 ? 'lk-gain' : 'lk-dim') + '">' + F.signed(x.delta, 0) + '</span></td></tr>';
        });
        sHtml += '</tbody></table></div><p class="lv-note">A positive number is a road you did not take that would have reached more people. A negative one is a decision that was already doing the work.</p>';
      }
      var prin = ['car', 'scfv', 'costim', 'v2v', 'oos', 'ld', 'dose', 'crs', 'icans', 'il6', 'burden', 'escape', 'pivotal', 'pay', 'access', 'platform'];
      var secs = [{ label: 'Your decisions, and the principle behind each', html: mine.join('') }];
      if (rec.length) secs.push({ label: 'Against the record', html: rec.join('') });
      if (sHtml) secs.push({ label: 'What was load-bearing in this run', html: sHtml });
      els.end.innerHTML = '';
      K.debrief(els.end, {
        kicker: 'Ending',
        title: end.t, sub: end.s,
        lede: end.l + (S.ending === 'runway' ? ' Yours ran out at month ' + F.n(S.month) + '.' : '') +
          (S.ending === 'negative' && p.done && p.g5 > 0.05 ? ' The question it answered was the safety one: ' + F.pct(p.g5, 1) + ' of infused patients died of treatment-related causes.' : '') +
          (S.ending === 'negative' && !p.done && t.floored ? ' Here the answer came in phase 1: the first dose level was already too toxic for this construct.' : ''),
        stats: stats, sections: secs, principles: prin, take: true,
        actions: [
          { label: 'Replay this program', primary: true, onClick: function () { newRun(S.seed); } },
          { label: 'New program', onClick: function () { newRun(K.seed()); } },
          { label: 'Open the case file', onClick: function () { shelf.open('case'); } }
        ]
      });
    }

    /* ---------- events ---------- */
    var BLOCK = ['toact2', 'toact3', 'toact4', 'toact5', 'cohort', 'design', 'again', 'close', 'lock', 'amend', 'declare', 'wind'];
    function setLast(k) { S.cx.last = k; }
    function needChange() {
      if (!S.tr.mustChange) return false;
      feed('The hold is still in place. Change the dose level, the construct, the conditioning or who you enroll, and you can resume.', 'Safety');
      renderFeed();
      return true;
    }
    function changed() { if (S.tr.mustChange) { S.tr.mustChange = false; feed('The amendment is filed and the hold lifts.', 'Regulator'); } }
    K.on(root, 'click', '[data-act]', function (ev, b) {
      var a = b.getAttribute('data-act'), v = b.getAttribute('data-v');
      if (a === 'read') { shelf.notes.open(v); return; }
      if (a === 'case') { shelf.open('case'); return; }
      if (a === 'replay') { newRun(S.seed); return; }
      if (a === 'fresh') { newRun(K.seed()); return; }
      if (S.over) return;
      if (a === 'ipick') {
        if (!pend) return;
        var pt = pend.pt;
        commit(S, pt, v);
        feedPatient(pt);
        pend = null;
        els.ev.innerHTML = '';
        processQueue();
        return;
      }
      if (a === 'evpick') {
        var p = S.ev.pending;
        if (!p) return;
        var c = p.ch[+v];
        if (!c || (c.cost && S.cash < c.cost)) return;
        c.act(S); feed('You chose: ' + E(c.l) + '.', 'You');
        S.ev.pending = null;
        if (S.cash <= 0 || S.month >= CLOCK) { ender(); return; }
        renderAll();
        settle();
        return;
      }
      if (pend) return;
      /* an open event card blocks every step that moves the program forward */
      if (S.ev.pending && BLOCK.indexOf(a) >= 0) {
        feed('Answer the event first.', 'Program');
        var eh = els.ev.querySelector('.lv-evt');
        if (eh) K.focus(eh, { scroll: true });
        return;
      }
      if (a === 'target') {
        S.target = v;
        var T = LV_TARGETS[v];
        feed('Program set: a receptor against <b>' + E(T.nm) + '</b> in ' + E(T.dis) + '. ' + E(T.why), 'You');
        if (T.oot >= 0.3) { unlock('oot', 'A target healthy tissue shares'); feed('Healthy tissue shows this antigen as well: ' + E(T.ootKind) + '. That is a design constraint now, not a footnote.', 'Safety'); }
        renderAll();
      } else if (a === 'her2ack') {
        S.ev.flags.her2ack = 1; renderStage();
      } else if (a === 'toact2') {
        if (!S.target) return;
        S.act = 2; unlock('car', 'The receptor bench'); renderAll(); K.focus(els.act.querySelector('.lv-h'), { scroll: true });
      } else if (a === 'binder' || a === 'htm' || a === 'costim' || a === 'vector') {
        if (S.cx.locked) return;
        S.cx[a] = v;
        setLast(a === 'htm' ? 'htm' : a);
        S.cx.armor = S.cx.costim === 'dual';
        unlock(a === 'binder' ? 'scfv' : a === 'htm' ? 'hinge' : a === 'costim' ? 'costim' : 'vector', 'The receptor bench');
        changed();
        renderVitals(); renderStage(); renderBtns(); paintAll();
      } else if (a === 'lock') {
        if (!(S.cx.binder && S.cx.htm && S.cx.costim && S.cx.vector) || S.cx.locked) return;
        var amending = S.cx.amending, dualNew = S.cx.costim === 'dual' && !S.cx.dualDone;
        S.cx.locked = true; S.cx.amending = false;
        advance(S, amending ? 2 : 10);
        if (dualNew) { advance(S, LV_COSTIM.dual.dev); S.trust += LV_COSTIM.dual.trust; S.cx.dualDone = true; }
        feed((amending ? 'Amended construct locked. Two months of requalification' : 'Construct locked. Ten months of vector work, release assays and a package in animals') +
          (dualNew ? ', plus fourteen more for the armored construct and a regulator who now has questions' : '') +
          '. The clock is the part nobody budgets for.', 'Program');
        S.act = 3;
        unlock('v2v', 'The factory floor');
        unlock('platform', 'The platform fork');
        if (!amending) fireEvent();
        if (S.cash <= 0 || S.month >= CLOCK) { ender(); return; }
        renderAll();
        if (S.ev.pending) settle(); else K.focus(els.act.querySelector('.lv-h'), { scroll: true });
      } else if (a === 'toact3') {
        S.act = 3; renderAll();
      } else if (a === 'days') {
        S.mfg.days = +v; changed(); renderStage(); renderVitals(); paintAll();
      } else if (a === 'specs') {
        S.mfg.specs = v; renderStage(); paintAll();
      } else if (a === 'cryo') {
        S.mfg.cryo = v === '1'; renderStage(); paintAll();
      } else if (a === 'route') {
        S.mfg.route = v; changed(); renderStage(); paintAll();
      } else if (a === 'slots') {
        if (+v > 0 && S.mfg.platform === 'auto' && S.mfg.slots < 24 && S.cash >= SLOT) { S.mfg.slots += 4; if (S.ev.flags.slots0) S.ev.flags.slots0 += 4; S.cash -= SLOT; feed('Four more slots. ' + F.M(SLOT, 0) + ', and the queue gets shorter for everybody behind the next patient.', 'Factory'); }
        renderVitals(); renderStage(); paintAll();
      } else if (a === 'second') {
        if (!S.mfg.secondSource && S.cash >= 14) {
          S.mfg.secondSource = true; S.cash -= 14; advance(S, 2);
          if (S.ev.flags.crunch) { S.mfg.slots = S.ev.flags.slots0 || S.mfg.slots; S.ev.flags.slots0 = 0; S.ev.flags.crunch = 0; feed('A second vector source is qualified and the slots come back up. Nobody thanks you for this until the day it matters, and today is that day.', 'Factory'); }
          else feed('A second vector source is qualified. Nobody will thank you for this until the day it matters.', 'Factory');
        }
        renderVitals(); renderStage(); paintAll();
      } else if (a === 'platform') {
        if (S.mfg.platform === v) return;
        if (v !== 'auto' && S.mfg.platform === 'auto' && S.cash < platNeed(v)) return;
        if (v === 'allo' && S.mfg.platform === 'auto') { S.cash -= PLAT.allo.c - PLAT.allo.back; S.ev.flags.partner = PLAT.allo.back; advance(S, PLAT.allo.m); S.trust -= 6; S.mfg.platform = 'allo'; S.mfg.autoSlots = S.mfg.slots; S.mfg.slots = 999; feed('You start an allogeneic program: a donor product, gene edited to reduce graft-versus-host risk, made before the patient exists. The queue is gone, rejection is now your permanent research problem, and a partner puts ' + F.M(55, 0) + ' in, because a platform is the one thing this industry will pay for before it works.', 'You'); }
        else if (v === 'vivo' && S.mfg.platform === 'auto') { S.cash -= PLAT.vivo.c - PLAT.vivo.back; S.ev.flags.partner = PLAT.vivo.back; advance(S, PLAT.vivo.m); S.mfg.platform = 'vivo'; S.mfg.autoSlots = S.mfg.slots; S.mfg.slots = 999; feed('You bet on making the receptor inside the patient. No factory, no queue, and the persistence you get is whatever the delivery gives you. This is the early end of the science, and a partner still puts ' + F.M(70, 0) + ' in for it.', 'You'); }
        else return;   /* a platform bet is a one-way door */
        unlock('platform', 'The platform fork');
        if (S.cash <= 0) { ender(); return; }
        renderAll();
      } else if (a === 'toact4') {
        S.act = 4; advance(S, 4);
        feed(S.cx.amends ? 'Four months of requalification and an amended filing later, the trial reopens at ' + DLN[S.tr.dl - 1] + ' with the new construct, because a new construct is a new dose-finding question.'
          : 'Four months of facility qualification and one regulatory filing later, the trial is open. Three patients at ' + DLN[S.tr.dl - 1] + ' to start, because that is what the escalation rules say.', 'Program');
        fireEvent();
        if (S.cash <= 0 || S.month >= CLOCK) { ender(); return; }
        renderAll();
        if (S.ev.pending) settle(); else K.focus(els.act.querySelector('.lv-h'), { scroll: true });
      } else if (a === 'ld') {
        S.tr.ld = v; unlock('ld', 'Setting the conditioning'); changed(); renderStage();
      } else if (a === 'burden') {
        S.tr.burden = v; unlock('burden', 'Setting the enrollment policy'); changed(); renderStage();
      } else if (a === 'tox') {
        S.tr.tox = v; renderStage();
      } else if (a === 'anakinra') {
        S.tr.anakinra = !S.tr.anakinra;
        if (S.tr.anakinra) {
          advance(S, 1); S.trust -= 3;
          feed('Interleukin-1 blockade goes into the protocol as an amendment: a month, three points of trust, and ' + F.M(ANAK, 2) + ' for every patient infused from here on.', 'Regulator');
        }
        renderVitals(); renderStage();
        if (S.cash <= 0 || S.month >= CLOCK) { ender(); return; }
      } else if (a === 'cohort') {
        if (needChange()) return;
        doCohort();
      } else if (a === 'pick') {
        sel = +v; renderStage(); paintAll();
        var cv = root.querySelector('canvas[data-c="exp"]');
        if (cv) K.focus(cv.previousSibling && cv.previousSibling.nodeType === 1 ? cv.previousSibling : cv, { scroll: true });
      } else if (a === 'declare') {
        if (S.tr.stopped || !canDeclare()) return;
        S.tr.rp2d = S.tr.dl; S.tr.stopped = true; S.tr.how = 'declared';
        feed('You declare ' + DLN[S.tr.dl - 1] + ' the recommended dose. The escalation stops here, which means you will never know what the next level would have done.', 'You');
        renderAll();
      } else if (a === 'amend') {
        if (S.cash < AMEND_C) return;
        S.cash -= AMEND_C; advance(S, AMEND_M);
        S.cx.locked = false; S.cx.amending = true; S.cx.amends += 1; S.act = 2; S.tr.mustChange = false;
        /* a new construct is a new dose-finding question: the escalation starts again from the first level */
        S.tr.levels = []; S.tr.dl = 1; S.tr.mtd = null; S.tr.rp2d = null; S.tr.stopped = false; S.tr.ceil = 0; S.tr.how = null; S.tr.floored = false;
        feed('Construct amendment filed: ' + F.M(AMEND_C, 0) + ' and ' + AMEND_M + ' months, then two more to requalify and four to reopen the trial at ' + DLN[0] + '. This is the cost of learning something after the lock.', 'Program');
        if (S.cash <= 0) { ender(); return; }
        renderAll();
        K.focus(els.act.querySelector('.lv-h'), { scroll: true });
      } else if (a === 'toact5') {
        S.act = 5; renderAll(); K.focus(els.act.querySelector('.lv-h'), { scroll: true });
      } else if (a === 'design') {
        if (S.piv.design || !PIV[v] || S.cash < pivNeed(S, v)) return;
        S.piv.design = v;
        unlock('pivotal', 'Choosing the pivotal design');
        feed(v === 'rand' ? 'You buy the randomized trial: ' + PIV.rand.n + ' patients, ' + PIV.rand.m + ' months, ' + F.M(pivCost(S, 'rand'), 0) + ', and a comparison nobody can argue with.'
          : 'You buy the single-arm path: ' + PIV.fast.n + ' patients, ' + PIV.fast.m + ' months, ' + F.M(pivCost(S, 'fast'), 0) + ', and a response rate.', 'You');
        runPivotal();
      } else if (a === 'again') {
        if (S.piv.tries >= 2) return;
        if (S.cash < pivNeed(S, S.piv.design)) { feed('There is not enough cash for a second pivotal trial. The board is asking the other question.', 'Board'); return; }
        feed('A second pivotal trial, same design, fresh patients. The board votes yes because the alternative is a wind-down.', 'Board');
        runPivotal();
      } else if (a === 'wind') {
        S.wound = true;
        feed('The program winds down. The data is published, the cell bank is archived, and somebody else will pick up the target.', 'Board');
        ender();
      } else if (a === 'pay') {
        S.world.pay = v; unlock('pay', 'Choosing a payment model'); renderStage(); paintAll();
      } else if (a === 'centers') {
        var dc = +v > 0 ? 6 : -6;
        if (dc > 0 && S.world.centers < 138 && S.cash >= CENTER) { S.world.centers += 6; S.cash -= CENTER; }
        else if (dc < 0 && S.world.centers > 12) { S.world.centers -= 6; S.cash += CENTER * 0.5; }
        renderVitals(); renderStage(); paintAll();
      } else if (a === 'outpt') {
        if (S.piv.crs3 >= 0.15) return;
        var oc = S.ev.flags.rems ? OUTPT / 2 : OUTPT;
        if (!S.world.outpatient) { if (S.cash < oc) return; S.world.outpatient = true; S.cash -= oc; }
        else S.world.outpatient = false;
        renderVitals(); renderStage(); paintAll();
      } else if (a === 'suites') {
        if (+v > 0 && S.world.suites < 5 && S.cash >= SUITE) { S.world.suites += 1; S.cash -= SUITE; }
        else if (+v < 0 && S.world.suites > 1) { S.world.suites -= 1; S.cash += SUITE * 0.5; }
        renderVitals(); renderStage(); paintAll();
      } else if (a === 'close') {
        closeProgram();
      }
    });
    K.on(root, 'input', 'input[data-act="price"]', function (ev, r) {
      S.world.price = +r.value;
      var o = root.querySelector('#lvPriceOut');
      if (o) o.textContent = F.usd(S.world.price) + 'k';
      K.sfill(root);
      var a = access(S, S.world, S.piv.dur);
      var st = els.stage.querySelectorAll('.lk-strip');
      if (st.length) {
        var last = st[st.length - 1];
        last.innerHTML = cell('Qualify a year', F.n(Math.round(a.eligible))) +
          cell('Reach', F.pct(a.reach, 0), a.reach < 0.18 ? 'is-bad' : a.reach > 0.4 ? 'is-good' : '') +
          cell('Treated a year', F.n(Math.round(a.annual)), a.annual >= a.demand - 1 ? 'is-good' : 'is-warn') +
          cell('Durable a year', F.n(Math.round(a.annual * S.piv.dur)), a.annual * S.piv.dur > 400 ? 'is-good' : '');
      }
      paintAll();
      sync('access');
    });
    /* arrow keys inside a radio pill group: move and select, the WAI-ARIA radiogroup pattern.
       Focus moves first, so the re-render puts the keyboard back on the new choice. */
    K.on(root, 'keydown', '.lk-seg [role="radio"]', function (ev, b) {
      var k = ev.key, grp = b.parentNode;
      if (k !== 'ArrowDown' && k !== 'ArrowUp' && k !== 'ArrowLeft' && k !== 'ArrowRight' && k !== 'Home' && k !== 'End') return;
      var list = Array.prototype.filter.call(grp.querySelectorAll('[role="radio"]'), function (x) { return !x.disabled; });
      var i = list.indexOf(b);
      if (i < 0 || !list.length) return;
      var n = k === 'Home' ? 0 : k === 'End' ? list.length - 1
        : (k === 'ArrowDown' || k === 'ArrowRight') ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
      ev.preventDefault();
      list[n].focus();
      if (list[n].getAttribute('aria-checked') !== 'true') list[n].click();
    });
    /* arrow keys inside a choice group */
    K.on(root, 'keydown', '.lv-grp .lk-opt, .lv-targets .lv-tcard, .lv-pks .lv-pk', function (ev, b) {
      var k = ev.key;
      if (k !== 'ArrowDown' && k !== 'ArrowUp' && k !== 'ArrowLeft' && k !== 'ArrowRight') return;
      var scope = b.closest('.lv-grp') || b.closest('.lv-targets') || b.closest('.lv-pks');
      if (!scope) return;
      var list = Array.prototype.filter.call(scope.querySelectorAll('.lk-opt, .lv-tcard, .lv-pk'), function (x) { return !x.disabled; });
      var i = list.indexOf(b);
      if (i < 0) return;
      var n = (k === 'ArrowDown' || k === 'ArrowRight') ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
      ev.preventDefault();
      list[n].focus();
    });

    K.repaint(paintAll, root);
    K.hook(SLUG, { state: function () { return S; }, eng: { derive: derive, readout: readout, access: access, sensitivity: sensitivity, endingOf: endingOf },
      go: function (n) { for (var i = 0; i < (n || 1); i++) doCohort(); }, scenes: SC });
    newRun(20170830);


    return {
      pause: function () { if (tw) { tw(); tw = null; } Object.keys(SC).forEach(function (k) { if (SC[k].ex) SC[k].ex.vw.pause(); }); },
      resume: function () { paintAll(); Object.keys(SC).forEach(function (k) { if (SC[k].ex) SC[k].ex.vw.resume(); }); }
    };
  }

  K.mount(SLUG, null, init);
})();
