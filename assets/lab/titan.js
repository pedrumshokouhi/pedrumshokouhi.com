/* The titan's ledger: two Gilded Age campaigns (Rockefeller's oil, Carnegie's steel) on one seeded engine.
   Registers with LAB_KIT.mount('titan'). Real crossroads are sourced; rivals are composites; every number the engine
   produces is a model. The other ledger (harms) never nets against money or gifts. ES5, no globals. */
(function () {
  'use strict';
  var K = window.LAB_KIT;
  if (!K || K.v < 1) return;
  var SLUG = 'titan';
  var F = K.fmt, MINUS = '−';

  /* ---------------------------------------------------------------- sources ---------------------------------------------------------------- */
  var SRC = {
    tarbell: { t: 'Ida M. Tarbell, The History of the Standard Oil Company (1904), Project Gutenberg', u: 'https://www.gutenberg.org/files/60692/60692-h/60692-h.htm' },
    wSO: { t: 'Wikipedia: Standard Oil', u: 'https://en.wikipedia.org/wiki/Standard_Oil' },
    wSIC: { t: 'Wikipedia: South Improvement Company', u: 'https://en.wikipedia.org/wiki/South_Improvement_Company' },
    colum: { t: 'Columbia Law School, American Legal History: History of Standard Oil, the Cleveland Massacre', u: 'https://moglen.law.columbia.edu/twiki/bin/view/AmLegalHist/TylerConwayProject' },
    ech: { t: 'Encyclopedia of Cleveland History: BP America', u: 'https://case.edu/ech/articles/b/bp-america' },
    pbsRock: { t: 'PBS American Experience: The Rockefellers, timeline', u: 'https://www.pbs.org/wgbh/americanexperience/features/rockefellers-timeline/' },
    rac: { t: 'Rockefeller Archive Center: John D. Rockefeller, 1839 to 1937', u: 'https://rockarch.org/resources/about-the-rockefellers/john-d-rockefeller-sr/' },
    nara: { t: 'National Archives: Sherman Anti-Trust Act (1890)', u: 'https://www.archives.gov/milestone-documents/sherman-anti-trust-act' },
    scotus: { t: 'Supreme Court Historical Society: Standard Oil Company v. United States', u: 'https://civics.supremecourthistory.org/article/standard-oil-company-v-united-states/' },
    wSOvUS: { t: 'Wikipedia: Standard Oil Co. of New Jersey v. United States', u: 'https://en.wikipedia.org/wiki/Standard_Oil_Co._of_New_Jersey_v._United_States' },
    eiaQ: { t: 'U.S. Energy Information Administration: U.S. field production of crude oil, annual', u: 'https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=pet&s=mcrfpus1&f=a' },
    eiaP: { t: 'U.S. Energy Information Administration: U.S. crude oil first purchase price, annual', u: 'https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=PET&s=F000000__3&f=A' },
    scherer: { t: 'F. M. Scherer, Technological Innovation and Monopolization (U.S. Department of Justice, Antitrust Division)', u: 'https://www.justice.gov/archives/atr/technological-innovation-and-monopolization' },
    khan: { t: 'B. Zorina Khan, Who’s Afraid of Standard Oil? (Bowdoin College)', u: 'https://research.bowdoin.edu/zorina-khan/life-on-the-margin/whos-afraid-of-standard-oil/' },
    mcgee: { t: 'John S. McGee, Predatory Price Cutting: The Standard Oil (N.J.) Case, Journal of Law and Economics 1 (1958)', u: 'https://chicagounbound.uchicago.edu/jle/vol1/iss1/10' },
    leslie: { t: 'Christopher R. Leslie, Revisiting the Revisionist History of Standard Oil, 85 Southern California Law Review 573 (2012)', u: 'https://southerncalifornialawreview.com/wp-content/uploads/2018/01/85_573.pdf' },
    tide: { t: 'ExplorePAHistory: Tidewater Pipe Company historical marker', u: 'https://explorepahistory.com/hmarker.php?markerId=1-A-76' },
    wHist: { t: 'Wikipedia: The History of the Standard Oil Company', u: 'https://en.wikipedia.org/wiki/The_History_of_the_Standard_Oil_Company' },
    yale: { t: 'Yale Energy History: Ida M. Tarbell, The History of the Standard Oil Company, 1904', u: 'https://energyhistory.yale.edu/ida-m-tarbell-the-history-of-the-standard-oil-company-1904/' },
    elkins: { t: 'Wikipedia: Elkins Act', u: 'https://en.wikipedia.org/wiki/Elkins_Act' },
    spindle: { t: 'Wikipedia: Spindletop', u: 'https://en.wikipedia.org/wiki/Spindletop' },
    tainted: { t: 'eJewishPhilanthropy: How a 1905 debate about “tainted” Rockefeller money is a reminder of ethical dilemmas today', u: 'https://ejewishphilanthropy.com/how-a-1905-debate-about-tainted-rockefeller-money-is-a-reminder-of-ethical-dilemmas-today/' },
    ludlow: { t: 'Wikipedia: Ludlow Massacre', u: 'https://en.wikipedia.org/wiki/Ludlow_Massacre' },
    uf: { t: 'Sean Adams, Steel: Carnegie and Creative Destruction, in Impact of Materials on Society (University of Florida)', u: 'https://ufl.pb.unizin.org/imos/chapter/steel/' },
    cphys: { t: 'Brian Potter, The Rise of Steel, Part II (Construction Physics)', u: 'https://www.construction-physics.com/p/the-rise-of-steel-part-ii' },
    census: { t: 'Twelfth Census of the United States (1900), Manufactures, Part IV: Iron and Steel', u: 'https://www2.census.gov/library/publications/decennial/1900/volume-10/volume-10-p2.pdf' },
    wET: { t: 'Wikipedia: Edgar Thomson Steel Works', u: 'https://en.wikipedia.org/wiki/Edgar_Thomson_Steel_Works' },
    wq: { t: 'Wikiquote: Andrew Carnegie', u: 'https://en.wikiquote.org/wiki/Andrew_Carnegie' },
    pbsSteel: { t: 'PBS American Experience: The Steel Business', u: 'https://www.pbs.org/wgbh/americanexperience/features/carnegie-steel-business/' },
    pbsHS: { t: 'PBS American Experience: The Strike at Homestead Mill', u: 'https://www.pbs.org/wgbh/americanexperience/features/carnegie-strike-homestead-mill/' },
    loc: { t: 'Library of Congress: Homestead Strike, topics in Chronicling America', u: 'https://guides.loc.gov/chronicling-america-homestead-strike' },
    wHS: { t: 'Wikipedia: Homestead strike', u: 'https://en.wikipedia.org/wiki/Homestead_strike' },
    haer: { t: 'Historic American Engineering Record PA-115: U.S. Steel Duquesne Works (Library of Congress)', u: 'https://tile.loc.gov/storage-services/master/pnp/habshaer/pa/pa1700/pa1778/data/pa1778data.pdf' },
    pbsFrick: { t: 'PBS American Experience: A Tough Partner', u: 'https://www.pbs.org/wgbh/americanexperience/features/carnegie-tough-partner/' },
    duane: { t: 'Duane Morris: Frick v. Carnegie, the ultimate minority shareholder oppression suit', u: 'https://www.duanemorris.com/articles/frick_v_carnegie_ultimate_minority_shareholder_oppression_suit_0425.html' },
    mnop: { t: 'MNopedia (Minnesota Historical Society): Oliver Iron Mining Company', u: 'https://www.mnhs.org/mnopedia/search/index/group/oliver-iron-mining-company' },
    time: { t: 'Time: Steel: Who Said Competition?', u: 'https://time.com/archive/6762807/steel-who-said-competition/' },
    ah: { t: 'John Steele Gordon, The Armor-plate Scandal (American Heritage)', u: 'https://www.americanheritage.com/armor-plate-scandal' },
    wHW: { t: 'Wikipedia: Homestead Steel Works', u: 'https://en.wikipedia.org/wiki/Homestead_Steel_Works' },
    wSF: { t: 'Wikipedia: South Fork Fishing and Hunting Club', u: 'https://en.wikipedia.org/wiki/South_Fork_Fishing_and_Hunting_Club' },
    wCS: { t: 'Wikipedia: Carnegie Steel Company', u: 'https://en.wikipedia.org/wiki/Carnegie_Steel_Company' },
    wAC: { t: 'Wikipedia: Andrew Carnegie', u: 'https://en.wikipedia.org/wiki/Andrew_Carnegie' },
    wUSS: { t: 'Wikipedia: U.S. Steel', u: 'https://en.wikipedia.org/wiki/U.S._Steel' },
    pbsFilm: { t: 'PBS American Experience: The Richest Man in the World: Andrew Carnegie', u: 'https://www.pbs.org/wgbh/americanexperience/films/carnegie/' },
    pmhb: { t: 'Robert Hessen, Charles M. Schwab, President of United States Steel, 1901 to 1904 (Pennsylvania Magazine of History and Biography, 1972)', u: 'https://journals.psu.edu/pmhb/article/download/42841/42562' },
    fordham: { t: 'Andrew Carnegie, Wealth (1889), Internet Modern History Sourcebook (Fordham University)', u: 'https://sourcebooks.fordham.edu/mod/1889carnegie.asp' },
    cc: { t: 'Carnegie Council: Andrew Carnegie biography', u: 'https://www.carnegiecouncil.org/andrew-carnegie-biography' },
    ccny: { t: 'Carnegie Corporation of New York: Andrew Carnegie’s Free Public Library Philanthropy', u: 'https://www.carnegie.org/our-work/article/andrew-carnegies-free-public-library-philanthropy/' },
    eastman: { t: 'Crystal Eastman, Work-Accidents and the Law (The Pittsburgh Survey, 1910), Internet Archive', u: 'https://archive.org/details/cu31924019223035' },
    pitt: { t: 'University of Pittsburgh, Homestead Strike collection: Was Andrew Carnegie a friend of labor unions?', u: 'http://homesteadstrike.library.pitt.edu/pdfs/Was%20Andrew%20Carnegie%20a%20friend%20of%20labor%20unions.pdf' },
    hay: { t: 'Wikipedia: Haymarket affair', u: 'https://en.wikipedia.org/wiki/Haymarket_affair' },
    wICA: { t: 'Wikipedia: Interstate Commerce Act of 1887', u: 'https://en.wikipedia.org/wiki/Interstate_Commerce_Act_of_1887' },
    caseOH: { t: 'State ex rel. Watson v. Standard Oil Co., 49 Ohio St. 137 (decided March 2, 1892), Caselaw Access Project', u: 'https://static.case.law/ohio-st/49/cases/0137-01.json' }
  };
  function S_(k) { return Array.prototype.slice.call(arguments).map(function (x) { return SRC[x]; }).filter(Boolean); }

  /* ---------------------------------------------------------------- field notes (27; each campaign shows 20) ---------------------------------------------------------------- */
  var NOTES = [
    { id: 'fn1', term: 'The cost curve', src: S_('scherer'), hint: 'the first chapter opens and the cost curve draws',
      note: 'Line up every producer from cheapest to dearest, each bar as wide as its capacity, and you have the industry cost curve. Price settles near the cost of the last producer the market needs. Whoever sits at the left end earns the widest margin at any price, which is why both titans worried about cost before anything else.' },
    { id: 'fn2', term: 'Fixed and variable cost', src: [], hint: 'a rival’s bar sits above the market price, or your own plants run below 70 percent',
      note: 'Variable costs (crude, ore, labor) stop when the plant stops; fixed costs (interest, idle equipment, salaried staff) do not. A firm keeps running as long as price covers its variable cost, even while it loses money overall, which is why an overbuilt industry can bleed for years before anyone quits.' },
    { id: 'fn3', term: 'Overcapacity', src: S_('tarbell'), hint: 'the industry’s plants run below 60 percent of what they could make',
      note: 'When capacity far exceeds demand, every producer cuts price to fill its own plant and they all lose money. By 1872 refiners had built far more stills than the creeks could fill. Tarbell estimates Standard went from not over 1,500 to 10,000 barrels a day in three months of buying out Cleveland rivals. Consolidation was the market’s brutal cure, and the law’s long suspicion.' },
    { id: 'fn4', term: 'Economies of scale', src: S_('scherer'), hint: 'you build, fold plants together, or build open hearths',
      note: 'Bigger plants spread fixed costs and justify bigger, better equipment. F. M. Scherer, drawing on Alfred Chandler, reports 1885 refining costs of about 1.5 cents a gallon at 1,500 to 2,000 barrel-a-day refineries against 0.452 cents at Standard’s 5,000 to 6,500 barrel plants. In this engine refining cost falls with plant size to the power of minus 0.4, and steel conversion cost to the power of minus 0.3.' },
    { id: 'fn5', term: 'Rebates and the common carrier', src: S_('wSO', 'elkins'), hint: 'the railroad makes its offer in 1868',
      note: 'A rebate was a secret discount off the posted railroad rate. The railroads’ case: a shipper who guaranteed full, steady trains let them haul more cheaply. The independents’ case: a common carrier should charge everyone alike. The Interstate Commerce Act of 1887 banned rate discrimination, and the Elkins Act of 1903 made taking a rebate an offense too.' },
    { id: 'fn6', term: 'Drawbacks', src: S_('tarbell', 'wSIC'), hint: 'you meet the South Improvement Company or collect drawbacks',
      note: 'A drawback went further than a rebate: the railroad paid you part of what your competitors paid to ship. The South Improvement Company contracts of 1872 set a $2.56 open rate on crude from the Oil Regions to New York, a $1.06 rebate to members, and $1.06 to members on every barrel of crude shipped by outsiders; on refined oil from Cleveland to New York the rate was $2.00, 50 cents of it paid over to the company, which shipped for $1.50. The uproar killed the contracts within weeks.' },
    { id: 'fn7', term: 'Horizontal integration', src: S_('tarbell'), hint: 'a rival accepts your first offer',
      note: 'Buying competitors at the same stage of production. It takes capacity out of a glutted market, captures scale, and buys talent, and it concentrates the market in a way the law may later judge. Rockefeller often paid in Standard stock; sellers such as Charles Pratt and Company, whose Henry H. Rogers had led New York’s refiners against the South Improvement Company, became part of the firm.' },
    { id: 'fn8', term: 'Paying in stock', src: [], hint: 'you incorporate, pay for a company in stock, or change your dividend policy',
      note: 'Stock saves cash and turns a seller into a partner who wins when you win, at the price of your own ownership: every share you issue is a slice of every future dollar. Watch your stake in the ledger; paying this way only moves it one direction.' },
    { id: 'fn9', term: 'Vertical integration and hold-up', src: S_('tarbell', 'mnop'), hint: 'you make your first integration move, or meet Frick’s coke or the Mesabi ore',
      note: 'Owning your suppliers or your routes to market. It pays when a supplier could squeeze you (hold-up), when your volume lets you make an input cheaper than the market sells it, or when it hands you a chokepoint others need. Standard’s barrel factories, tank cars and pipelines, and Carnegie’s coke (Frick) and ore (the Mesabi lease) are the classic cases.' },
    { id: 'fn10', term: 'By-products', src: [], hint: 'you hire chemists',
      note: 'A barrel of crude yields several products at once. Selling lubricants, paraffin and naphtha alongside kerosene turns more of each barrel into revenue and lowers the effective cost of the main product. A joint product changes the economics of everything made with it.' },
    { id: 'fn11', term: 'Pipelines and chokepoints', src: S_('tarbell', 'tide'), hint: 'you lay pipe, fight the Empire, or meet the Tidewater line',
      note: 'A pipeline costs a great deal to build and very little to run, so whoever owns the line can charge others far more than it costs to carry their oil. Tarbell wrote that rival refiners paid forty or forty-five cents for a service that cost Standard not over a fourth of that. Own the chokepoint and competitors pay your toll.' },
    { id: 'fn12', term: 'Price leadership and residual demand', src: [], hint: 'your share of capacity passes 40 percent, or you sell through a bogus independent',
      note: 'A dominant firm sets the price; smaller firms take it. Raise it and everyone else sells more under your umbrella; cut it and you take volume but pay the discount on every unit you sell. In this engine your price moves the market in proportion to your share of capacity.' },
    { id: 'fn13', term: 'Limit pricing and entry', src: [], hint: 'new competitors build plants for the first time',
      note: 'High margins are an invitation. Hold price below what an efficient new plant would need (the dotted entry line on the chart) and fewer rivals build. It is the quiet way a dominant firm protects its position, and it hands consumers the savings.' },
    { id: 'fn14', term: 'Predatory pricing', src: S_('mcgee', 'leslie'), hint: 'you cut to kill, buy the waybills, or undercut the market while a rival fails',
      note: 'Pricing below your own cost to drive a rival out, then raising prices to recoup. John McGee argued in 1958 that Standard’s record showed no such thing and that buying rivals is cheaper than starving them; Christopher Leslie argued in 2012 that the revisionist history is wrong. The game charges you the discount, so you can check the arithmetic yourself.' },
    { id: 'fn15', term: 'Pools and cartels', src: S_('nara'), hint: 'the steel pool is proposed, or the oil game reaches 1886',
      note: 'An agreement among competitors to split a market or hold a price. Pools could not be enforced in court and every member was tempted to cheat, so they tended to break, often into a price war. After 1890 they were also illegal under the Sherman Act.' },
    { id: 'fn16', term: 'The trust and the holding company', src: S_('nara', 'wSO', 'tarbell'), hint: 'you reach the nine trustees in 1882',
      note: 'On January 2, 1882, some forty stockholders placed the stock of 40 companies with nine trustees: one command over firms chartered in different states. After Ohio’s Supreme Court barred Standard of Ohio from the trust agreement in 1892 and the holders voted to end it, the companies were run in concert and in 1899 regrouped under Standard Oil of New Jersey as a holding company.' },
    { id: 'fn17', term: 'The Sherman Act and the rule of reason', src: S_('nara', 'scotus'), hint: 'the oil game reaches 1890, or the steel pool is proposed',
      note: 'The Sherman Act (1890) outlawed contracts and combinations in restraint of interstate trade, and monopolization. In 1911 the Supreme Court held that it forbids only unreasonable restraints, judged by their effects, and gave Standard Oil six months to divest its subsidiaries. That rule of reason still frames American antitrust.' },
    { id: 'fn18', term: 'Public opinion and the muckrakers', src: S_('wHist', 'yale'), hint: 'Tarbell’s series begins, or you answer your critics in print',
      note: 'Ida Tarbell’s nineteen-part McClure’s series, begun in November 1902 and published as a book in 1904, turned rebates, drawbacks and the South Improvement scheme into a national story. Opinion is not law, but it is where prosecutors and legislators learn what the public will reward.' },
    { id: 'fn19', term: 'Cost accounting', src: S_('uf'), hint: 'you install cost sheets',
      note: 'Carnegie’s works tracked costs department by department and ton by ton, so a rising cost showed up in days instead of at the end of the year. A maxim attributed to Carnegie: “Watch the costs and the profits will take care of themselves.” In this engine your cost sheet stays a single number until you install the system.' },
    { id: 'fn20', term: 'Throughput and hard driving', src: S_('uf'), hint: 'you drive the furnaces',
      note: 'Run the furnaces as hard as they will go and rebuild them when they wear out. A University of Florida open-textbook chapter describes one Carnegie blast furnace going from 13,000 to 100,000 tons a year, and furnaces replaced about every three years where British ones lasted twelve. More tons per dollar of plant, and more strain on the plant and on the men.' },
    { id: 'fn21', term: 'Creative destruction', src: S_('uf'), hint: 'you scrap a working mill for a better one',
      note: 'Tear out a working machine because a better one exists. Carnegie had a rail mill that was only three months old ripped out for a more efficient design. Sunk costs are sunk; the only question is the cost per ton from here.' },
    { id: 'fn22', term: 'Sliding-scale wages', src: S_('uf', 'pbsHS', 'wHS'), hint: 'you change mill policy, or reach Homestead',
      note: 'Wages tied to the selling price of the product, so they fall in bad years and rise in good ones. The iron puddlers’ Sons of Vulcan won a sliding scale in 1865. At Homestead in 1892 the fight began over a proposed 22 percent cut for about half the union’s members; PBS ties it to steel prices falling from about $35 to $22 a gross ton, though Wikipedia describes the industry as doing well.' },
    { id: 'fn23', term: 'Lockouts, strikebreakers and the state', src: S_('pbsHS', 'loc', 'wHS'), hint: 'you reach Homestead in 1892',
      note: 'A lockout is an employer closing the works to force terms. In 1892 Homestead was fenced and its workers locked out; on July 6 about 300 Pinkerton agents came up the river on barges and a battle followed, and the state militia marched in on July 12. The union was broken, and by 1900 no steel plant in Pennsylvania was unionized.' },
    { id: 'fn24', term: 'Industrial accidents', src: S_('eastman'), hint: 'your mills report their first deaths',
      note: 'The Pittsburgh Survey counted 195 deaths in the steel industry of Allegheny County in one year, July 1906 to June 1907, among about 70,000 steelworkers: roughly 2.8 per 1,000. This engine uses that rate as its baseline for mills run on twelve-hour turns with hard driving, and shows the excess above an eight-hour, safety-first mill.' },
    { id: 'fn25', term: 'Carnegie’s three modes', src: S_('fordham', 'wq'), hint: 'you settle the estate, or give your first library',
      note: 'Carnegie’s 1889 essay, Wealth, names three ways to dispose of a surplus fortune: leave it to family, bequeath it for public purposes at death, or administer it during life. He called the first “the most injudicious” and the third “the true antidote,” welcomed heavy taxes on large estates, and wrote that the man who dies thus rich dies disgraced.' },
    { id: 'fn26', term: 'Scientific philanthropy', src: S_('rac'), hint: 'you give wholesale, step back in 1893, or fund medical research or public health',
      note: 'Frederick T. Gates, hired to manage Rockefeller’s giving, helped move it toward large institutions aimed at root causes: the University of Chicago, the Rockefeller Institute for Medical Research (1901), the General Education Board (1902), the Rockefeller Sanitary Commission against hookworm in eleven Southern states (1909), and the Rockefeller Foundation (1913). His giving totaled about $540 million.' },
    { id: 'fn27', term: 'Enterprise value and the sale', src: S_('wCS', 'pmhb', 'pbsFilm'), hint: 'Morgan asks your price',
      note: 'A buyer pays a multiple of the profits it expects. Carnegie Steel earned about $21 million in 1899 and, by Schwab’s figures, about $40 million in 1900. Carnegie named his price by hand, Schwab carried it to Morgan, and Morgan accepted: $480 million in PBS’s telling, $492 million in others, roughly twelve times that 1900 profit. The tube works Carnegie planned at Conneaut, Ohio, a direct threat to Morgan’s National Tube, is usually told as part of why Morgan bought.' }
  ];
  var SCOPE = {
    oil: ['fn1', 'fn2', 'fn3', 'fn4', 'fn5', 'fn6', 'fn7', 'fn8', 'fn9', 'fn10', 'fn11', 'fn12', 'fn13', 'fn14', 'fn15', 'fn16', 'fn17', 'fn18', 'fn25', 'fn26'],
    steel: ['fn1', 'fn2', 'fn3', 'fn4', 'fn7', 'fn8', 'fn9', 'fn12', 'fn13', 'fn14', 'fn15', 'fn17', 'fn19', 'fn20', 'fn21', 'fn22', 'fn23', 'fn24', 'fn25', 'fn27']
  };

  /* ---------------------------------------------------------------- glossary ---------------------------------------------------------------- */
  var DEFS = {
    rebate: { t: 'Rebate', d: 'A secret discount off the posted railroad rate, usually in return for guaranteed volume.', note: 'fn5' },
    drawback: { t: 'Drawback', d: 'A payment from a railroad to one shipper out of the freight paid by that shipper’s competitors.', note: 'fn6' },
    carrier: { t: 'Common carrier', d: 'A carrier, like a railroad, expected to serve all shippers on equal terms.', note: 'fn5' },
    pipage: { t: 'Pipage', d: 'The toll charged to move oil through a pipeline.', note: 'fn11' },
    trust: { t: 'Trust', d: 'An arrangement in which trustees hold the stock of many companies and run them as one.', note: 'fn16' },
    holding: { t: 'Holding company', d: 'A corporation whose business is owning the stock of other companies.', note: 'fn16' },
    reason: { t: 'Rule of reason', d: 'The Supreme Court’s 1911 reading that the Sherman Act forbids only unreasonable restraints of trade.', note: 'fn17' },
    bessemer: { t: 'Bessemer converter', d: 'A vessel that blows air through molten iron to burn out carbon, making steel in minutes.' },
    hearth: { t: 'Open hearth', d: 'A slower steelmaking furnace that allows closer control of the steel’s chemistry.' },
    coke: { t: 'Coke', d: 'Coal baked to drive off impurities; the fuel of the blast furnace.', note: 'fn9' },
    sliding: { t: 'Sliding scale', d: 'A wage tied to the selling price of the product.', note: 'fn22' },
    lockout: { t: 'Lockout', d: 'An employer closing the works to force terms on its workers.', note: 'fn23' },
    pinkertons: { t: 'Pinkertons', d: 'Agents of the Pinkerton National Detective Agency, hired by employers as guards and strikebreakers.', note: 'fn23' },
    ironclad: { t: 'Iron-Clad Agreement', d: 'The Carnegie partners’ rule letting them force a partner to sell his stake at book value.' },
    util: { t: 'Capacity utilization', d: 'Output divided by what the plants could make.', note: 'fn3' },
    appraisal: { t: 'Appraisal', d: 'The engine’s estimate of a rival’s value: half the cost of its plant, less a discount for distress, plus its cash.' },
    ev: { t: 'Enterprise value', d: 'What a buyer would pay for the whole business: here ten times average profit (or book value, if higher) plus cash minus debt.', note: 'fn27' },
    dilution: { t: 'Dilution', d: 'The shrinking of your ownership when you issue new stock.', note: 'fn8' },
    predatory: { t: 'Predatory pricing', d: 'Pricing below your own cost to drive a rival out, planning to raise prices later.', note: 'fn14' },
    limitp: { t: 'Limit pricing', d: 'Holding price below what a new entrant would need, to discourage entry.', note: 'fn13' },
    kbd: { t: 'kb/d', d: 'Thousand barrels of crude oil a day, the size of a refinery.' },
    kt: { t: 'kt', d: 'Thousand gross tons of steel a year, the size of a works.' },
    heat: { t: 'Heat', d: 'The engine’s measure of legal and political exposure. Conduct heat comes from what you did (rebates, drawbacks, pressure, predation) and fades by a fifth each chapter, though what is exposed stays on the record; structural heat comes from a dominant share and prices well above the new-entrant benchmark, and grows as the law hardens.', note: 'fn17' },
    standing: { t: 'Standing', d: 'What the public thinks of you, from 0 to 100. Low standing makes customers loyal to your rivals and makes courts less forgiving.', note: 'fn18' },
    bench: { t: 'New-entrant cost', d: 'The price an efficient new plant of ordinary size would need to cover all its costs. Above it, new plants get built; below it, they mostly do not.', note: 'fn13' }
  };

  /* ---------------------------------------------------------------- take it with you ---------------------------------------------------------------- */
  var TAKE = {
    oil: [
      'Your position on the cost curve is the moat. The cheapest producer decides who else gets to earn money.',
      'Overcapacity punishes everyone who has fixed costs. Consolidation is the market’s brutal cure and the law’s standing suspicion.',
      'Scale economies compound only when volume is guaranteed; rebates, pipelines and your own marketing were all ways to guarantee it.',
      'Own the chokepoint and your rivals pay your toll.',
      'High prices invite entry and low prices build walls. A dominant firm chooses between profit now and position later.',
      'Paying in stock buys talent and saves cash, and it costs you a slice of every future dollar.',
      'Under the rule of reason, how you got big matters more than how big you are.',
      'Gifts and harms live in different columns. Neither erases the other.'
    ],
    steel: [
      'Cost accounting first: you cannot cut what you cannot see.',
      'Throughput is a strategy: run full, scrap what is only good, and price to fill the mill.',
      'Integrate backward where a supplier could hold you up: coke, ore, freight.',
      'Build in the bust if you have the cash. Panics are when capacity is cheap and rivals are tired.',
      'Labor savings are real, and so is what they cost; the second number is kept in the other ledger.',
      'A company is worth a multiple of what it earns, plus the credibility of what it could do next.',
      'Carnegie’s three ways to dispose of a fortune: leave it, bequeath it, or give it while you live.',
      'Gifts and harms live in different columns. Neither erases the other.'
    ],
    both: [
      'Your position on the industry cost curve is the moat: the cheapest producer decides who else gets to earn money.',
      'Overcapacity punishes everyone with fixed costs; consolidation is the market’s brutal cure and the law’s standing suspicion.',
      'Scale economies compound only when volume is guaranteed; rebates, pipelines and running full were all ways to guarantee it.',
      'Integrate where a supplier or a chokepoint could hold you up; own the chokepoint and your rivals pay your toll.',
      'High prices invite entry and low prices build walls; a dominant firm chooses between profit now and position later.',
      'Paying in stock buys talent and saves cash, and it costs you a slice of every future dollar.',
      'Under the rule of reason, how you got big matters more than how big you are, and labor savings and dark deals are paid for in another ledger.',
      'Gifts and harms live in different columns. Neither erases the other.'
    ]
  };

  /* ---------------------------------------------------------------- the case files ---------------------------------------------------------------- */
  function fx(text, src) { return { text: text, src: src }; }
  var ASSUME_COMMON = [
    'Each chapter clears one market. Every firm is a bar on the cost curve; the going rate sits just above the cost of the last firm the market needs, rising when the plants are full and falling when they are idle, and never more than 15 percent above the chapter’s reference price.',
    'Your price moves the market in proportion to your share of capacity. Buyers split their orders by capacity, price and loyalty, with low public standing sending customers to your rivals: strongly for kerosene sold to families through grocers, weakly for rails sold to railroad purchasing agents.',
    'Rivals build when the price runs above what an efficient new plant would need (the new-entrant benchmark) and hold back when it runs below. They fail when their losses exceed twice a year of fixed costs.',
    'A rival accepts an offer by chance, with the odds set by your price against its reservation price: its appraisal, how stubborn its owner is, whether it is making money, and how distressed it is. Stock is worth more to sellers when your company is making money.',
    'Heat, standing, state suits, strikes, exposures and the verdict are simplified rules chosen to make the real trade-offs legible. They are not a reconstruction of anyone’s books or of any court’s reasoning.',
    'Enterprise value is ten times average annual profit (or book value, if higher) plus cash minus debt. Your fortune is your stake in it plus the dividends you took home, less what you gave away.',
    'The consumer line compares the market price with the new-entrant benchmark on the units you sold, chapter by chapter. It measures your part of the bargain, not the whole industry’s.'
  ];
  var CASE = {
    oil: {
      lede: 'The oil campaign: what is reported history, what is the engine’s assumption, and what is invented.',
      facts: [
        fx('Standard Oil Company (Ohio) was incorporated in January 1870 with $1 million of capital; Rockefeller received 2,667 of the first 10,000 shares.', S_('wSO')),
        fx('In 1868 the Lake Shore’s new vice-president, J. H. Devereux, gave the firm a secret rebate off the rate every Cleveland refiner had agreed to pay on crude, a cent a gallon (Tarbell). About 1870, by Devereux’s affidavit, Flagler guaranteed the road sixty carloads of refined oil a day for a through rate of $1.75 a barrel from the Oil Regions to New York: 35 cents for crude to Cleveland and $1.30 for refined to New York.', S_('tarbell', 'wSO')),
        fx('The South Improvement Company (1871 to 1872), set up by Tom Scott of the Pennsylvania Railroad with the Pennsylvania, the Erie and the New York Central, set a $2.56 open rate on crude from the Oil Regions to New York, a $1.06 rebate to members, and $1.06 to members on each outsider’s barrel of crude, and on refined oil from Cleveland to New York a $2.00 rate, 50 cents of it paid over to the company, which shipped for $1.50. Rockefeller and his partners held 900 of its 2,000 shares. The railroads ended the contracts on March 25, 1872, and Pennsylvania suspended the charter on April 2.', S_('wSIC', 'tarbell')),
        fx('In about six weeks in February and March 1872, Standard bought most of Cleveland’s 26 refineries: 21 by the Encyclopedia of Cleveland History and Tarbell’s count (“at least twenty-one”), 22 in some accounts. Tarbell estimates its capacity rose from not over 1,500 to 10,000 barrels a day, over a fifth of the country’s refining capacity.', S_('ech', 'tarbell', 'colum')),
        fx('Standard paid a 37 percent dividend in 1872 and cut it to 15 percent in 1873, putting profits into barrel factories, tank cars and New York terminals. On October 15, 1874, it secretly bought Charles Pratt and Company of New York.', S_('tarbell')),
        fx('By 1880 Standard held about 90 percent of American refining capacity; PBS dates “almost 90 percent” to 1877.', S_('wSO', 'pbsRock')),
        fx('By 1911 Standard’s share of American refining capacity had shrunk to between 60 and 65 percent, as competitors such as Pure Oil, Texaco and Gulf expanded (Wikipedia, citing Yergin).', S_('wSO')),
        fx('In 1877 the Empire Transportation Company sold Standard its pipelines ($1,094,805.56), its New York and Philadelphia refineries ($501,652.78), $900,000 of tank cars and other property: a cash payment of $3,400,000 in all.', S_('tarbell')),
        fx('The Tidewater Pipe Company, incorporated by Byron Benson in 1878, began pumping on May 28, 1879, through a six-inch line 109 miles to Williamsport. Standard later bought about a third of its stock and made it an ally; its National Transit Company came to control the pipelines.', S_('tide', 'tarbell')),
        fx('On April 29, 1879, a grand jury in Clarion County, Pennsylvania indicted John D. Rockefeller and eight associates for conspiracy. New York’s Hepburn Committee took testimony on railroad rebates the same year.', S_('tarbell')),
        fx('On January 2, 1882, about forty stockholders (Wikipedia gives 41 and 37 in different places; Tarbell says some fifty) signed the Standard Oil Trust Agreement, pooling the securities of 40 companies under nine trustees, who elected the component companies’ officers and set their dividends.', S_('wSO', 'nara', 'tarbell')),
        fx('The Interstate Commerce Act (1887) banned railroad rate discrimination. The Sherman Act was signed on July 2, 1890, after votes of 51 to 1 in the Senate and 242 to 0 in the House. The Elkins Act (1903) penalized shippers who took rebates as well as the railroads that paid them.', S_('nara', 'elkins')),
        fx('On March 2, 1892, the Supreme Court of Ohio barred Standard Oil of Ohio from the trust agreement; on March 21 the trust’s certificate holders voted to terminate it, and its holdings were reorganized into 20 companies. In 1899 Standard Oil of New Jersey became their holding company. The court wrote that cheaper prices are “the usual pretext on which monopolies of this kind are defended.”', S_('caseOH', 'tarbell', 'wSO')),
        fx('Tarbell’s history ran in nineteen parts in McClure’s from November 1902 and became a book in 1904; she began by interviewing Henry H. Rogers. It is credited with hastening the breakup.', S_('wHist', 'yale')),
        fx('On January 10, 1901, the Lucas gusher at Spindletop, Texas blew about 100,000 barrels a day for nine days. Gulf Oil and Texaco were formed to develop the field; state antitrust law and public feeling kept Standard from moving in aggressively.', S_('spindle')),
        fx('The federal suit was filed in 1906. In 1911 the Supreme Court, in an opinion by Chief Justice White, announced the rule of reason and gave Standard six months to divest; the Supreme Court Historical Society counts 34 successor companies.', S_('scotus', 'wSOvUS')),
        fx('F. M. Scherer, citing Alfred Chandler, reports 1885 refining costs of 1.5 cents a gallon at 1,500 to 2,000 barrel-a-day independents against 0.452 cents at Standard’s 5,000 to 6,500 barrel refineries.', S_('scherer')),
        fx('Kerosene fell from 58 cents a gallon in 1865 to 26 cents in 1870 by Wikipedia’s figures; Zorina Khan gives about 30 cents in 1870 and about 6 cents two decades later.', S_('wSO', 'khan')),
        fx('Rockefeller retired from active leadership in 1896, at 57, and gave about $540 million in all. PBS puts his wealth at its peak, $900 million, in 1913, helped by the rise in the successor companies’ shares.', S_('rac', 'pbsRock')),
        fx('The historians disagree about predation: John McGee argued in 1958 that Standard did not use predatory pricing; Christopher Leslie argued in 2012 that this revisionist history is wrong.', S_('mcgee', 'leslie')),
        fx('After the game’s end: on April 20, 1914, at Ludlow, Colorado, soldiers of the Colorado National Guard and private guards employed by the Colorado Fuel and Iron Company attacked and burned a tent colony of striking miners and their families. Wikipedia counts about 21 dead and PBS at least 24, among them two women and eleven children. John D. Rockefeller Jr., who held the family’s controlling interest in CF&I, had recently appeared before a congressional hearing on the strike.', S_('ludlow', 'pbsRock'))
      ],
      assumptions: [
        'Market volume follows real U.S. crude production (EIA), averaged over each chapter’s years, and the crude cost follows real first-purchase prices (EIA). The reference price path for refined oil is a model anchored to reported prices around 1870 and 1885.',
        'Refining cost falls with plant size to the power of minus 0.4. Freight, barrels, by-product credit, the rebate’s value and the pipeline tolls are simplified per-gallon amounts that shrink a few percent a year.'
      ].concat(ASSUME_COMMON, [
        'State suits (from 1890) and the 1911 verdict are model rules driven by conduct heat, structural heat, share, standing and the record: exposed contracts, testimony and leaks, which never fade. History ran the experiment once; the engine lets it come out either way.'
      ]),
      fiction: [
        'Every rival refinery is a composite with an invented name. Offers, refusals, partners, entrants, state suits and every number the engine produces are fiction.',
        'Options not taken in history are counterfactuals. Historical people appear only in sourced crossroads text, and nothing is put in their mouths.'
      ],
      sources: []
    },
    steel: {
      lede: 'The steel campaign: what is reported history, what is the engine’s assumption, and what is invented.',
      facts: [
        fx('Carnegie was born in Dunfermline, Scotland in 1835, emigrated with his family in 1848 at twelve, and started as a bobbin boy at $1.20 a week.', S_('cc', 'uf')),
        fx('Ground was broken for the Edgar Thomson works on January 1, 1873; it cost about $1.2 million. Its converter produced its first heat on August 22, 1875, for 2,000 rails for the Pennsylvania Railroad, whose president it was named for. Alexander Holley built it and Captain Bill Jones ran it.', S_('wET')),
        fx('A Bessemer steel rail cost $167 a ton in the U.S. in 1867 and $17.62 in 1898 (Temin, via Construction Physics).', S_('cphys')),
        fx('Carnegie’s first ton of steel cost about $56 to make and by 1900 about $11.50. One furnace went from 13,000 to 100,000 tons a year; furnaces were replaced about every three years where British ones lasted twelve; a rail mill only three months old was ripped out for a better one.', S_('uf')),
        fx('The average price of iron and steel products fell from $63.49 a ton in 1870 to $27.25 in 1900; open hearths made 28.5 percent of U.S. steel by 1900.', S_('census')),
        fx('In 1881 Carnegie joined forces with Henry Clay Frick for his coke; in 1889 he put Frick in charge of the steel business; Frick resigned from the board on December 5, 1899.', S_('pbsFrick')),
        fx('Carnegie bought the two-year-old Homestead works, built for the Pittsburgh Bessemer Steel Company, in 1883. For many years it was the largest steel mill in the world.', S_('wHW')),
        fx('In 1886 The Forum published Carnegie’s “An Employer’s View of the Labor Question,” which called workingmen’s right to form trade unions “no less sacred” than the manufacturers’ right to associate. It appeared around the time of the Haymarket bombing in Chicago on May 4, 1886.', S_('pitt', 'hay')),
        fx('At Duquesne, the Allegheny Bessemer Steel Company rolled rails without reheating. The National Park Service’s engineering record says Carnegie falsely discredited the process in a circular to the railroads, bought the mill in 1890 for $1,000,000 in bonds, then adopted direct rolling in all his mills.', S_('haer')),
        fx('On May 31, 1889, the South Fork dam failed above Johnstown and 2,209 people died. Carnegie and Frick were members of the South Fork Fishing and Hunting Club, which owned the dam.', S_('wSF')),
        fx('Homestead, 1892: PBS says prices had fallen from $35 a gross ton to $22, while Wikipedia says the industry was doing well and the union asked for a raise; the contract expired June 30 and Frick countered with a 22 percent cut affecting about half the union’s members; about 3,800 men were locked out behind a three-mile fence; about 300 Pinkertons came by river on July 6. Seven strikers and three Pinkertons is the most common count of the dead (Wikipedia gives three to eight Pinkertons; the Library of Congress guide says sixteen were killed). Militia marched in on July 12; Alexander Berkman shot and stabbed Frick on July 23; the union voted to end its restrictions in November. Carnegie was in Scotland. He had approved the strategy on May 4, ordered stockpiling and drafted a notice withdrawing recognition of the union; questioned in Scotland, he said Frick was in charge (Wikipedia). When it was over he cabled Frick, “Life worth living again” (PBS).', S_('pbsHS', 'wHS', 'loc')),
        fx('PBS reports that in November 1892, in a riot against Black strikebreakers, “Two thousand white workers attacked Homestead’s 50 black families.”', S_('pbsHS')),
        fx('After Homestead, PBS reports, wages were cut, twelve-hour days imposed and 500 jobs eliminated. The Amalgamated Association fell from over 24,000 members in 1891 to 10,000 in 1894, and by 1900 no Pennsylvania steel plant was unionized.', S_('pbsHS', 'wHS')),
        fx('Steelworkers worked twelve-hour shifts, seven days a week, with the Fourth of July as the one holiday; pay averaged about $10 a week in 1890.', S_('pbsSteel')),
        fx('Armor plate, 1893: on workers’ evidence the Navy moved to fine the company 15 percent of the contract; President Cleveland cut it to 10 percent, $140,484.94. John Steele Gordon’s revisionist account calls the affair mostly government incompetence.', S_('ah')),
        fx('Mesabi, 1896: Frick and Henry Oliver leased Rockefeller’s mines at a royalty of 25 cents a ton when other mines drew 65 cents; Oliver mined, Rockefeller’s railroad and boats carried, Carnegie made steel.', S_('time', 'mnop')),
        fx('Invoking the partners’ Iron-Clad Agreement, Carnegie claimed Frick was owed book value, about $5 million. Frick sued in 1900, put Carnegie Steel’s assets above $250 million on the record, and settled for shares worth over $30 million in a new company combining Carnegie Steel and Frick Coke.', S_('duane')),
        fx('Schwab laid out a single great steel combination at a University Club dinner on December 12, 1900, with Morgan among the guests. Carnegie had been planning a tube works at Conneaut Harbor, Ohio that would have eclipsed Morgan’s National Tube.', S_('pmhb')),
        fx('Carnegie Steel earned about $21 million in 1899; Schwab’s figures put 1900 at about $40 million. PBS says Morgan paid $480 million; Wikipedia and Hessen give $492 million (Hessen: first named at $400 million, raised to include the junior partners). Carnegie’s share was about $226 million in 5 percent gold bonds. U.S. Steel was capitalized at $1.4 billion, the world’s first billion-dollar corporation.', S_('wCS', 'pmhb', 'pbsFilm', 'wAC', 'wUSS')),
        fx('The Pittsburgh Survey counted 526 work-accident deaths in Allegheny County from July 1906 to June 1907, 195 of them in the steel industry, in a county with about 70,000 steelworkers.', S_('eastman')),
        fx('Carnegie’s 1889 essay Wealth names three ways to dispose of a surplus fortune and calls giving it away during life “the true antidote.” He gave away more than $350 million; he and his foundation gave about $56 million for 2,509 public libraries, 1,681 of them in the United States.', S_('fordham', 'cc', 'ccny'))
      ],
      assumptions: [
        'Market volume is a model interpolation anchored to reported U.S. steel output in 1870, 1880, 1890 and 1900. The reference price path is anchored to reported rail prices in 1867 and 1898.',
        'Costs are ore, coke, freight and conversion; conversion falls with works size to the power of minus 0.3, and labor is 45 percent of conversion. Buyers want a second source, so a dominant works gets a smaller slice of each new order.',
        'The Homestead hard plan applies a flat 22 percent cut to the whole wage bill; in 1892 the proposed cut fell on about half the union’s members. This is a model simplification. Breaking the union also ends its output rules, worth ten percent more tons from the same mills in this model, and the 500 jobs PBS says were cut take 7 percent off the labor bill.',
        'Deaths in your mills are a model estimate scaled to the Pittsburgh Survey’s 1906 to 1907 rate for twelve-hour mills run hard without a safety program; the historical Homestead count is shown as reported, never simulated.',
        'Morgan values the company at about twelve times its latest annual profit, give or take a tenth that you learn only from his answer; more if he believes the Conneaut threat (about seven times in ten), less if the Frick fight or your record made noise. A sale pays you your stake of the price, less your stake of whatever Conneaut cost.'
      ].concat(ASSUME_COMMON),
      fiction: [
        'Every rival works is a composite with an invented name, except the Homestead and Duquesne works, which appear where history put them. Offers, strikes, entrants, the pool and every number the engine produces are fiction.',
        'Options not taken in history are counterfactuals. Historical people appear only in sourced crossroads text, and nothing is put in their mouths.'
      ],
      sources: []
    }
  };
  (function () {
    function bib(ks) { return ks.map(function (k) { return SRC[k]; }); }
    CASE.oil.sources = bib(['tarbell', 'wSO', 'wSIC', 'colum', 'ech', 'pbsRock', 'rac', 'nara', 'scotus', 'wSOvUS', 'eiaQ', 'eiaP', 'scherer', 'khan', 'mcgee', 'leslie', 'tide', 'wHist', 'yale', 'elkins', 'spindle', 'tainted', 'ludlow', 'fordham', 'wq', 'wICA', 'caseOH']);
    CASE.steel.sources = bib(['uf', 'cphys', 'census', 'wET', 'wq', 'pbsSteel', 'pbsHS', 'loc', 'wHS', 'haer', 'pbsFrick', 'duane', 'mnop', 'time', 'ah', 'wHW', 'wSF', 'wCS', 'wAC', 'wUSS', 'pbsFilm', 'pmhb', 'fordham', 'cc', 'ccny', 'eastman', 'pitt', 'hay', 'nara']);
    CASE.both = {
      lede: 'Both campaigns. Choose one and this file narrows to it. Reported history is sourced line by line; the engine’s rules are assumptions; the rivals are invented.',
      facts: CASE.oil.facts.slice(0, 4).concat(CASE.oil.facts.slice(9, 12), CASE.steel.facts.slice(1, 2), CASE.steel.facts.slice(8, 13), CASE.steel.facts.slice(17, 19)),
      assumptions: ASSUME_COMMON,
      fiction: CASE.oil.fiction.concat(CASE.steel.fiction.slice(0, 1)),
      sources: CASE.oil.sources.concat(CASE.steel.sources.filter(function (s) { return CASE.oil.sources.indexOf(s) < 0; }))
    };
  })();

  /* ---------------------------------------------------------------- the two campaigns ---------------------------------------------------------------- */
  var CFG = {
    oil: { id: 'oil', label: 'Oil', who: 'John D. Rockefeller', G: 0.105, eps: 0.5, y0: 1868, fpu0: 0.12, fdec: 0.98, capex0: 0.55, cdec: 0.975,
      cash: 0.6, personal: 0.3, own: 0.267, standing: 55, rel: 60, payout: 0.4, payAlt: 0.1, seed: 1870, end: 1911,
      unit: 'gallon', light: 'light', movesBonusAt: 4,
      T: [
        { y: 1868, g: 2, Q: 10.8, cr: 4.60, P: 30.0, law: 0.3, x: 'c1' },
        { y: 1870, g: 2, Q: 14.3, cr: 4.10, P: 26.0, law: 0.3, x: 'c2' },
        { y: 1872, g: 2, Q: 22.2, cr: 2.74, P: 22.0, law: 0.4, x: 'c3' },
        { y: 1874, g: 3, Q: 29.4, cr: 1.68, P: 14.0, law: 0.4, x: 'c4', panic: 1 },
        { y: 1877, g: 2, Q: 39.4, cr: 1.78, P: 14.0, law: 0.5, x: 'c5' },
        { y: 1879, g: 3, Q: 67.5, cr: 0.91, P: 10.0, law: 0.6, x: 'c6' },
        { y: 1882, g: 4, Q: 68.4, cr: 0.90, P: 8.5, law: 0.6, x: 'c7' },
        { y: 1886, g: 4, Q: 81.6, cr: 0.70, P: 7.5, law: 0.8, x: 'c8' },
        { y: 1890, g: 3, Q: 137.6, cr: 0.61, P: 6.5, law: 1.0, x: 'c9' },
        { y: 1893, g: 6, Q: 148.2, cr: 0.81, P: 6.8, law: 1.0, x: 'c10', panic: 1, shock: 0.92 },
        { y: 1899, g: 5, Q: 207.5, cr: 1.00, P: 7.5, law: 1.1, x: 'c11' },
        { y: 1904, g: 7, Q: 436.6, cr: 0.71, P: 6.0, law: 1.3, x: 'c12' }
      ] },
    steel: { id: 'steel', label: 'Steel', who: 'Andrew Carnegie', G: 0.001, eps: 0.8, y0: 1872, fpu0: 0.008, fdec: 0.96, capex0: 0.02, cdec: 0.99,
      cash: 1.4, personal: 1.0, own: 0.55, standing: 60, rel: 60, payout: 0.2, payAlt: 0.4, seed: 1875, end: 1901,
      unit: 'ton', light: 'steel', movesBonusAt: 3,
      T: [
        { y: 1872, g: 1, Q: 140, P: 112, law: 0.2, x: 's1' },
        { y: 1873, g: 2, Q: 200, P: 100, law: 0.2, x: 's2', panic: 1, shock: 0.8 },
        { y: 1875, g: 3, Q: 450, P: 58, law: 0.2, x: 's3' },
        { y: 1878, g: 3, Q: 950, P: 50, law: 0.2, x: 's4' },
        { y: 1881, g: 2, Q: 1600, P: 55, law: 0.3, x: 's5' },
        { y: 1883, g: 3, Q: 1650, P: 32, law: 0.3, x: 's6' },
        { y: 1886, g: 3, Q: 2600, P: 34, law: 0.3, x: 's7' },
        { y: 1889, g: 3, Q: 3900, P: 30, law: 0.4, x: 's8' },
        { y: 1892, g: 1, Q: 4900, P: 29, law: 0.5, x: 's9' },
        { y: 1893, g: 3, Q: 4600, P: 25, law: 0.5, x: 's10', panic: 1, shock: 0.8 },
        { y: 1896, g: 3, Q: 6800, P: 21, law: 0.5, x: 's11' },
        { y: 1899, g: 2, Q: 10000, P: 25, law: 0.5, x: 's12' }
      ] }
  };
  var FR = { CLE: 3.4, REG: 3.2, PIT: 3.3, NYC: 2.9, PHL: 2.9, BAL: 3.0, TEX: 2.4, NEW: 3.0 };
  var CITY = { CLE: 'Cleveland', REG: 'the Oil Regions', PIT: 'Pittsburgh', NYC: 'New York', PHL: 'Philadelphia', BAL: 'Baltimore', TEX: 'Texas',
    NEW: 'the new fields', PA: 'Pennsylvania', NY: 'New York', IL: 'Chicago', OH: 'Ohio', MON: 'the Monongahela', WV: 'West Virginia', AL: 'Alabama' };
  /* name, city, capacity, efficiency, able operator, stubbornness, owner (all invented) */
  var ROSTER = {
    oil: [
      ['Erie Street Refining', 'CLE', 0.60, 1.00, 0, 1.0, 'Amos Hale'], ['Kingsbury Run Oil Works', 'CLE', 0.50, 1.04, 0, 1.2, 'Silas Whitcomb'],
      ['Cuyahoga Light & Oil', 'CLE', 0.70, 0.96, 1, 1.0, 'Jonas Kerr'], ['Walworth Run Refinery', 'CLE', 0.40, 1.06, 0, 0.9, 'Elias Burnham'],
      ['Flats Oil Company', 'CLE', 0.55, 1.02, 0, 1.3, 'Walter Pruett'], ['Newburgh Illuminating', 'CLE', 0.45, 1.05, 0, 1.0, 'Ezra Talmadge'],
      ['Oil Creek Refiners', 'REG', 1.10, 1.00, 1, 1.3, 'Caleb Dwight'], ['Titusville Refining', 'REG', 0.80, 0.98, 0, 1.2, 'Josiah Merriam'],
      ['Allegheny Oil Works', 'PIT', 0.90, 1.00, 0, 1.0, 'Levi Thorne'], ['Monongahela Refining', 'PIT', 0.70, 1.03, 0, 1.1, 'Asa Crandall'],
      ['Long Island Kerosene', 'NYC', 1.20, 0.95, 1, 1.0, 'Nathan Pell'], ['Hunters Point Oil', 'NYC', 0.90, 1.00, 0, 1.1, 'Horace Wendt'],
      ['Schuylkill Refining', 'PHL', 1.00, 0.97, 1, 1.0, 'Obadiah Lusk'], ['Patapsco Oil Works', 'BAL', 0.50, 1.04, 0, 1.0, 'Isaiah Brandt']
    ],
    steel: [
      ['Juniata Iron & Rail', 'PA', 40, 1.00, 0, 1.0, 'Reuben Stroud'], ['Lehigh Converter Works', 'PA', 35, 0.98, 1, 1.1, 'Morris Fenn'],
      ['Susquehanna Steel', 'PA', 30, 1.03, 0, 1.0, 'Abner Keel'], ['Troy Bessemer Company', 'NY', 20, 1.02, 0, 0.9, 'Thaddeus Voss'],
      ['Conemaugh Rail Works', 'PA', 38, 0.97, 1, 1.3, 'Cyrus Lamb'], ['Lakefront Rolling & Bessemer', 'IL', 25, 1.00, 0, 1.1, 'Gideon Marsh'],
      ['Wyoming Valley Rail', 'PA', 18, 1.05, 0, 1.0, 'Isaac Rutter'], ['Ohio Valley Bessemer', 'OH', 22, 1.02, 0, 1.0, 'Hiram Bock']
    ]
  };
  var ENTRANTS = {
    oil: [['Bradford Independent', 'REG'], ['Warren Oil Works', 'REG'], ['Olean Kerosene', 'NEW'], ['Franklin Refinery', 'REG'], ['Parkersburg Light', 'NEW'],
      ['Buffalo Illuminating', 'NEW'], ['Marietta Oil', 'NEW'], ['Maumee Refining', 'NEW'], ['Lima Crude & Refining', 'NEW'], ['Allegheny Valley Oil', 'PIT']],
    steel: [['Mahoning Rail', 'OH'], ['Shenango Steel', 'PA'], ['Wheeling Creek Bessemer', 'WV'], ['Calumet Rolling Mill', 'IL'], ['Buffalo Steel Works', 'NY'],
      ['Kanawha Iron & Steel', 'WV'], ['Monongahela Valley Steel', 'PA'], ['Great Lakes Rail', 'OH'], ['Birmingham Iron & Steel', 'AL'], ['Beaver Falls Steel', 'PA']]
  };

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function logistic(x) { return 1 / (1 + Math.exp(-x)); }
  function sum(a, f) { var s = 0; for (var i = 0; i < a.length; i++) s += f ? f(a[i]) : a[i]; return s; }

  /* ---------------------------------------------------------------- state helpers ---------------------------------------------------------------- */
  function Cf(S) { return CFG[S.camp]; }
  function Tt(S) { return Cf(S).T[Math.min(S.t, 11)]; }
  function yr(S) { return S.t >= 12 ? Cf(S).end : Tt(S).y; }
  function yEnd(S) { return S.t >= 11 ? Cf(S).end : Cf(S).T[S.t + 1].y; }
  function yOf(S) { return Tt(S).y - Cf(S).y0; }
  function Fc(S, cap, player) { var C = Cf(S); return cap * C.fpu0 * Math.pow(C.fdec, yOf(S)) * (player ? S.m.fixed : 1); }
  function capex(S) { var C = Cf(S); return C.capex0 * Math.pow(C.cdec, yOf(S)); }
  function Qnext(S) { return Cf(S).T[Math.min(11, S.t + 1)].Q; }
  function capTot(S) { return sum(S.plants, function (p) { return p.cap; }); }
  function capPend(S) { return sum(S.pend, function (x) { return x.cap; }); }
  function book(S) { return capTot(S) * capex(S) * 0.6; }
  function avgAnnual(S) { return (S.lastAnnual[0] + S.lastAnnual[1]) / 2; }
  function EV(S) { return Math.max(book(S), 10 * Math.max(0, avgAnnual(S))) + S.cash - S.debt; }
  function fortune(S) { return S.sold ? S.personal : S.own * Math.max(0, EV(S)) + S.personal; }
  function Vstock(S) { return 3 * Math.max(book(S), 12 * Math.max(0, S.lastAnnual[1])) + Math.max(0, S.cash); }
  function limit(S) { return (0.5 * book(S) + 2 * Math.max(0, S.lastAnnual[1]) + 0.5) * (S.flags.partnership ? 0.8 : 1); }
  function room(S) { return Math.max(0, S.cash) + Math.max(0, limit(S) - S.debt); }
  function spend(S, c) { var a = Math.min(Math.max(0, S.cash), c); S.cash -= a; S.debt += c - a; }
  function great(S) { for (var i = 0; i < S.plants.length; i++) if (S.plants[i].great) return S.plants[i]; return null; }
  function rivalById(S, id) { for (var i = 0; i < S.rivals.length; i++) if (S.rivals[i].id === id) return S.rivals[i]; return null; }
  function plantById(S, id) { for (var i = 0; i < S.plants.length; i++) if (S.plants[i].id === id) return S.plants[i]; return null; }
  function live(S) { return S.rivals.filter(function (r) { return r.alive; }); }
  function heat(S) { return Math.min(100, Math.round(Math.max(0, S.hc + S.hcA) + S.hs)); }
  function harm(S, kind, text, w) { S.harms.push({ t: S.t, year: yr(S), kind: kind, text: text, w: w == null ? 1 : w }); }
  function note(S, text) { S.notes.push({ t: S.t, year: yr(S), text: text }); }
  function say(S, text) { S.news.push(text); }
  function unlock(S, id, where) { S.unlockQ.push([id, where || '']); }
  function harmsW(S) { return S.harms.filter(function (h) { return h.w >= 1; }).length; }
  function worksName(S) { if (ownsHomestead(S)) return 'Homestead'; var g = great(S); if (!g) return 'your works'; return /^The /.test(g.name) ? 'the ' + g.name.slice(4) : 'the ' + (g.name === 'New works' ? 'new works' : g.name); }
  function ownsHomestead(S) { return S.plants.some(function (p) { return p.homestead; }); }
  function movesMax(S) {
    var b = 2 + ((S.flags.trust || (S.flags.frick && !S.flags.frickGone)) ? 1 : 0) + (S.partners >= Cf(S).movesBonusAt ? 1 : 0) - (S.flags.stepBack ? 1 : 0);
    return clamp(b, 2, 4);
  }
  function movesLeft(S) { return Math.max(0, movesMax(S) - S.used); }

  /* ---------------------------------------------------------------- costs ---------------------------------------------------------------- */
  function penR(S, r) {
    if (S.camp !== 'oil' || r.noBuy) return 0;
    var d = Math.pow(0.97, yOf(S)), m = S.m, p = 0;
    if (m.gather) p += 0.2;
    if (m.trunk) p += 0.3;
    if (m.drawback) p += 0.9 * d;
    if (S.flags.sicLive === S.t) p += 2.5 * d;
    if (S.flags.tideOpen) p -= 0.3;
    return p;
  }
  /* the cost to make one more unit; for the player the parts are returned too (the cost sheet) */
  function vcost(S, cap, eff, city, player, parts) {
    var y = yOf(S), m = S.m, T = Tt(S), v, P = parts || {};
    if (S.camp === 'oil') {
      var d97 = Math.pow(0.97, y), d985 = Math.pow(0.985, y);
      var crude = T.cr * 100 / 31.5, fr = (FR[city] || 3.0) * d97;
      var conv = 2.4 * Math.pow(Math.max(cap, 0.2) / 1.5, -0.4) * d985 * eff;
      var cont = Math.max(1.0, 3.0 * d985), byp = Math.min(0.5, 0.2 + 0.01 * y);
      if (player) {
        fr = fr * m.freight * (S.flags.pennT > S.t ? 1.1 : 1) - (m.rebate ? 0.9 * d97 : 0);
        fr = Math.max(0.15, fr);
        conv *= m.conv; cont = Math.max(0.6, cont * m.cont); byp += m.byp;
      }
      P.crude = crude; P.freight = fr; P.conv = conv; P.cont = cont; P.byp = -byp;
      v = Math.max(0.5, crude + fr + conv + cont - byp);
      if (player && S.flags.warT === S.t) { v += 0.8; P.war = 0.8; }
      return v;
    }
    var ore = 18 * Math.pow(0.97, y), coke = 6 * Math.pow(0.97, y), frs = 5 * Math.pow(0.97, y);
    var cv = 26 * Math.pow(Math.max(cap, 5) / 60, -0.3) * Math.pow(0.97, y) * eff, lab = 0;
    if (player) {
      ore *= m.ore * (S.oreRoll || 1); coke *= m.coke * (S.cokeRoll || 1); frs *= m.freight;
      var wage = m.wage * (1 + 0.1 * S.wageAct), morale = 1 + Math.max(0, 40 - S.rel) / 400;
      lab = cv * 0.45 * wage * (m.shift12 ? 1 : 1.18) * (m.union ? 1.06 : 1) * m.labor * morale;
      cv = cv * 0.55 * m.conv;
      if (m.hard) { cv *= 0.92; lab *= 0.92; }
    }
    P.ore = ore; P.coke = coke; P.freight = frs; P.conv = cv; P.labor = lab;
    return ore + coke + frs + cv + lab;
  }
  function vP(S, p, parts) { return vcost(S, p.cap, p.eff, p.city, true, parts); }
  function vR(S, r) { return vcost(S, r.cap, r.eff, r.city, false) + penR(S, r); }
  /* a broken union takes its output rules with it: ten percent more tons from the same mills */
  function noRules(S) { return S.camp === 'steel' && !S.m.union && !!S.flags.unionBroken; }
  function capE(S, p) { return p.cap * (S.camp === 'steel' && S.m.hard ? 1.15 : 1) * (noRules(S) ? 1.1 : 1) * S.capMult; }
  function centOf(S) {
    var ecap = 0.05 * Tt(S).Q, C = Cf(S);
    return vcost(S, ecap, 1.0, S.camp === 'oil' ? 'NEW' : 'PA', false) + Fc(S, ecap) / (ecap * C.G * 0.8);
  }

  /* ---------------------------------------------------------------- the market ---------------------------------------------------------------- */
  function firms(S) {
    var out = [];
    S.plants.forEach(function (p) { if (p.cap > 0) out.push({ k: 'p', o: p, id: p.id, cap: capE(S, p), v: vP(S, p) }); });
    S.rivals.forEach(function (r) { if (r.alive) out.push({ k: 'r', o: r, id: r.id, cap: r.cap, v: vR(S, r) }); });
    return out;
  }
  function going(S, fs) {
    fs = fs || firms(S);
    var T = Tt(S), s = fs.slice().sort(function (a, b) { return a.v - b.v; }), K = sum(s, function (f) { return f.cap; });
    var cum = 0, vm = s.length ? s[s.length - 1].v : T.P, i;
    for (i = 0; i < s.length; i++) { cum += s[i].cap; if (cum >= T.Q) { vm = s[i].v; break; } }
    var U = T.Q / Math.max(1e-9, K), ph = Math.min(Math.max(1.02 * vm, T.P * Math.pow(U / 0.75, 0.6)), 1.15 * T.P);
    if (S.flags.warT === S.t) ph *= 0.9;
    if (S.m.pool) ph *= 1.15;
    if (S.flags.poolBreakT === S.t) ph *= 0.85;
    return { ph: ph, K: K, U: U, vm: vm };
  }
  function clear(S, pY, o) {
    o = o || {};
    var C = Cf(S), T = Tt(S), fs = firms(S), g = going(S, fs), ph = g.ph;
    var pp = fs.filter(function (f) { return f.k === 'p'; }), rv = fs.filter(function (f) { return f.k === 'r'; });
    var KP = sum(pp, function (f) { return f.cap; }), K = g.K;
    pY = clamp(pY, 0.6 * ph, 1.5 * ph);
    var sig = clamp(1.15 * KP / Math.max(1e-9, K), 0, 1), pM = ph + sig * (pY - ph);
    var shock = o.shock != null ? o.shock : (T.shock || 1);
    var D = T.Q * Math.pow(T.P / pM, C.eps) * shock;
    var sat = S.camp === 'steel' ? 1 / (1 + 3 * Math.max(0, KP / Math.max(1e-9, K) - 0.5)) : 1;
    var capP = KP;
    /* an honest pool member sells its quota: last year's share, re-set as your mills grow but a step behind them */
    if (S.m.pool === 1 && S.poolShare) capP = Math.min(KP, Math.max(S.poolShare, 0.9 * KP / Math.max(1e-9, K)) * D);
    var acc = S.m.access * (S.flags.boycottT === S.t ? 0.75 : 1) + (S.m.bogus ? 0.6 : 0) + (S.m.spies ? 0.15 : 0);
    var ws = [{ cap: capP, w: KP > 0 ? KP * acc * sat * Math.min(3, Math.pow(pM / pY, 6)) : 0 }];
    /* kerosene reached families through grocers, who heard what their customers thought; rails went to railroad purchasing agents, who mostly heard the price */
    var stL = S.standing + (S.m.bogus ? 20 : 0), loy = 1 + Math.max(0, (50 - stL) / 50) * (S.camp === 'oil' ? 1.5 : 0.5), cuts = o.noCut ? [] : S.cuts;
    rv.forEach(function (f) {
      var w = f.cap * f.o.acc * loy * logistic((pM - f.v) / (0.04 * pM));
      if (cuts.indexOf(f.id) >= 0) { ws[0].w += w; w = 0; }
      ws.push({ cap: f.cap, w: w });
    });
    var q = ws.map(function () { return 0; }), rem = D, act = ws.map(function (x, i) { return i; }), pass;
    for (pass = 0; pass < 5 && rem > 1e-9; pass++) {
      var W = sum(act, function (i) { return ws[i].w; });
      if (W <= 0) break;
      var nxt = [], used = 0;
      act.forEach(function (i) {
        var give = rem * ws[i].w / W, rm = ws[i].cap - q[i];
        if (give >= rm) { q[i] += rm; used += rm; } else { q[i] += give; used += give; nxt.push(i); }
      });
      rem -= used; act = nxt;
    }
    var qP = q[0], left = qP, op = 0, vs = 0, Fsum = 0, marg = null;
    var real = S.camp === 'oil' ? (S.m.market ? 0.3 : 0) : (S.m.oh ? 0.02 * pY : 0);
    pp.slice().sort(function (a, b) { return a.v - b.v; }).forEach(function (x) {
      var use = Math.min(x.cap, left);
      left -= use; x.q = use;
      op += (pY + real - x.v) * use * C.G; vs += x.v * use;
      if (use > 1e-9) marg = x.v;
    });
    pp.forEach(function (x) { Fsum += Fc(S, x.o.cap, true); });
    op -= Fsum;
    var rivalVol = 0;
    rv.forEach(function (f, i) { f.q = q[i + 1]; if (!f.o.noBuy) rivalVol += f.q; });
    var minV = pp.length ? Math.min.apply(null, pp.map(function (x) { return x.v; })) : NaN;
    var unitVar = qP > 1e-9 ? vs / qP : minV;
    return { ph: ph, pM: pM, pY: pY, D: D, qP: qP, KP: KP, K: K, U: g.U, share: qP / Math.max(1e-9, D), capShare: KP / Math.max(1e-9, K),
      op: op, Fsum: Fsum, unitVar: unitVar, unitAll: qP > 1e-9 ? unitVar + Fsum / (qP * C.G) : NaN, marg: marg == null ? minV : marg,
      fs: fs, pp: pp, rv: rv, real: real, rivalVol: rivalVol, sig: sig, shock: shock, capP: capP };
  }
  function pYof(S) { var g = going(S); return clamp(S.pr * g.ph, 0.6 * g.ph, 1.5 * g.ph); }
  /* Carnegie's rule: the highest price that still fills 97 percent of your mills, or of your pool quota (no randomness consumed) */
  function runFull(S) {
    var g = going(S), lo = 0.6 * g.ph, hi = g.ph, KP = sum(S.plants, function (p) { return p.cap > 0 ? capE(S, p) : 0; });
    if (KP <= 0) return g.ph;
    function full(pY) { var r = clear(S, pY); return r.qP >= 0.97 * Math.min(KP, r.capP); }
    if (full(hi)) return hi;
    for (var i = 0; i < 26; i++) { var mid = (lo + hi) / 2; if (full(mid)) lo = mid; else hi = mid; }
    return lo;
  }

  /* ---------------------------------------------------------------- a new history ---------------------------------------------------------------- */
  function newGame(camp, seed) {
    var C = CFG[camp];
    seed = seed >>> 0;
    var S = { camp: camp, seed: seed, t: 0, phase: 'play', over: null, sold: false,
      rM: K.rng(seed), rR: K.rng((seed + 101) >>> 0), rJ: K.rng((seed + 7) >>> 0),
      cash: C.cash, debt: 0, own: C.own, own0: C.own, personal: C.personal, payout: C.payout,
      plants: [], pend: [], rivals: [], nid: 0, eIdx: 0,
      m: { rebate: 0, rebMode: '', rebExposed: false, access: 1, freight: 1, cont: 1, byp: 0, conv: 1, fixed: 1, ore: 1, coke: 1,
        hard: 0, shift12: 1, wage: 1, union: 1, labor: 1, safety: 0, drawback: 0, gather: 0, trunk: 0, market: 0, spies: 0, bogus: 0,
        coop: 0, tank: 0, term: 0, chem: 0, costSheets: 0, oh: 0, scraps: 0, rail: 0, oreOwn: 0, cokeOwn: 0, pool: 0, essays: 0, men: 0, bonds: 0 },
      standing: C.standing, hc: 0, hcA: 0, hs: 0, rel: C.rel,
      partners: 0, used: 0, offerBonus: 0, capMult: 1, wageAct: 0, wageDelta: 0, pr: 1, oreRoll: 1, cokeRoll: 1,
      harms: [], notes: [], gifts: [], giftTotal: 0, libraries: 0, consumer: 0, deaths: 0, deathsExcess: 0, deathLines: 0, workers12: 0,
      lastAnnual: [0, 0], hist: [], choices: [], news: [], feed: [], unlockQ: [], cuts: [], cutsLast: [], cutLog: [],
      flags: {}, crises: 0, stockDeals: 0, cashDeals: 0, offers: 0, accepts: 0, acqCost: 0, cutCost: 0, cutRuined: 0, cutBuyCost: 0,
      rebateSaved: 0, drawbackTake: 0, entrantsCount: 0, undercutChapters: 0, integ: [], folds: 0, poolShare: 0,
      rec: 0, cutStreak: 0, overT: null,
      cross: null, special: null, verdict: null, morgan: null, dist: null };
    ROSTER[camp].forEach(function (a, i) {
      var r = { id: 'r' + i, name: a[0], city: a[1], cap: a[2] * (0.85 + 0.3 * S.rJ()), eff: a[3] * (0.95 + 0.1 * S.rJ()), talent: a[4],
        stub: a[5] * (0.9 + 0.2 * S.rJ()), owner: a[6], cash: 0, alive: true, acc: 1, lastPr: 0, lastQ: 0, known: false };
      r.cash = 1.5 * Fc(S, r.cap);
      S.rivals.push(r);
    });
    S.rid = S.rivals.length;
    if (camp === 'oil') S.plants.push({ id: 'p' + (S.nid++), name: 'The works', cap: 1.5, eff: 0.97, great: true, city: 'CLE', acq: false, since: 1868 });
    startChapter(S);
    S.news.unshift(camp === 'oil'
      ? 'Cleveland, 1868. You own a quarter of a refinery on the Cuyahoga, one of dozens along the river, all buying the same crude from the same creeks and shipping on the same three railroads. Kerosene is the country’s light. The cheapest gallon wins.'
      : 'Pittsburgh, 1872. You are rich from bridges, railroads and bonds, and you have seen a Bessemer converter turn molten iron into steel in minutes. The railroads need rails that last. Nobody has built a works that makes them cheaply.');
    return S;
  }
  function addRival(S, name, city, cap, eff, o) {
    o = o || {};
    var r = { id: 'r' + (S.rid++), name: name, city: city, cap: cap, eff: eff, talent: o.talent || 0, stub: o.stub || 1, owner: o.owner || '',
      cash: 1.5 * Fc(S, cap), alive: true, acc: 1, lastPr: 0, lastQ: 0, noBuy: !!o.noBuy, scripted: !!o.scripted, known: false, born: S.t };
    if (o.noBuyUntil != null) r.noBuyUntil = o.noBuyUntil;
    S.rivals.push(r);
    return r;
  }
  function entrant(S, cap) {
    var L = ENTRANTS[S.camp], e = L[S.eIdx % L.length], lap = Math.floor(S.eIdx / L.length);
    S.eIdx++;
    var tal = S.rM() < 0.3 ? 1 : 0, stub = 0.9 + 0.4 * S.rM();
    S.entrantsCount++;
    return addRival(S, e[0] + (lap ? ' No. ' + (lap + 1) : ''), e[1], cap, 0.97, { talent: tal, stub: stub });
  }

  /* ---------------------------------------------------------------- chapter start: fixed order of events and rolls ---------------------------------------------------------------- */
  function startChapter(S) {
    var T = Tt(S), t = S.t, oil = S.camp === 'oil';
    S.used = 0; S.offerBonus = 0; S.capMult = 1; S.wageAct = 0; S.wageDelta = 0; S.buildDisc = 1; S.cuts = []; S.feed = [];
    S.special = null; S.pr = 1; S.news = S.news || [];
    S.rivals.forEach(function (r) { if (r.accUntil != null && r.accUntil <= t) { r.acc = 1; r.accUntil = null; } });
    if (oil) {
      if (t === 5) {
        say(S, 'April 29: a grand jury in Clarion County, Pennsylvania indicts you and eight associates for conspiracy. In New York the Hepburn Committee is putting railroad men under oath about rebates. On May 28 an independent pipeline starts pumping crude 109 miles over the mountains to Williamsport.');
        if (S.m.rebate && S.m.rebMode === 'secret' && !S.m.rebExposed) {
          S.m.rebExposed = true; S.standing -= 8; S.hcA += 6; S.rec += 6; harm(S, 'rebate', 'Rebates exposed under oath', 1);
          say(S, 'Railroad clerks testify about your rates. Your rebate is now a matter of public record.');
        }
      }
      if (t === 7) { say(S, 'Congress is writing the Interstate Commerce Act of 1887: railroad rate discrimination will be illegal and railroad pools banned, though enforcement will stay weak for years. Your agents are replacing independent jobbers town by town.'); unlock(S, 'fn15', 'Oil, 1886'); }
      if (t === 8) { say(S, 'On July 2, 1890, the Sherman Act makes every contract, combination or conspiracy in restraint of interstate trade illegal, and makes monopolizing a crime.'); unlock(S, 'fn17', 'Oil, 1890'); }
      if (t === 8 && !(S.flags.trust || heat(S) >= 30)) say(S, 'Ohio’s attorney general reads the papers and looks for easier targets.');
      if (t === 10) {
        var n = harmsW(S);
        S.standing -= 8 + 1.5 * n; S.hcA += 1.2 * n;
        say(S, 'In 1899 your companies regroup under Standard Oil of New Jersey. On January 10, 1901, the Lucas gusher at Spindletop, Texas blows oil for nine days; new companies rise to develop the field, and Texas law and Texans keep you from dominating it. In November 1902 McClure’s Magazine publishes the first part of Ida Tarbell’s history of your company. ' +
          (S.flags.sic ? 'She has the South Improvement contracts, the Hepburn testimony, and ' + n + ' other entries from your record.' : 'She has ' + n + ' entries from your record.'));
        unlock(S, 'fn18', 'Oil, 1899: Tarbell');
      }
      if (t === 11) say(S, 'New companies in Texas, Indian Territory and California are pumping and refining oil you do not control. In 1906 the federal government sues you under the Sherman Act; in 1909 a federal circuit court rules against you. The case goes to the Supreme Court.');
      if (S.flags.paperT === t) { S.hcA += 10; say(S, 'The papers notice that the twenty “separate” companies still share offices, officers and a price list.'); }
      if (S.flags.sicLeakT === t) { S.standing -= 8; say(S, 'Word of the secret contracts leaks anyway, a year late and worse for the delay.'); }
    } else {
      /* the fixed order of chapter-start rolls: pool, coke, ore, strike, then the scripted steel events */
      if (S.m.pool) {
        if (S.m.pool === 2 && S.rR() < 0.5) {
          S.m.pool = 0; S.standing -= 3; harm(S, 'pool', 'Cheated on the pool', 0.3);
          say(S, 'The other members compare order books. They find your extra tons, and the pool is over.');
        } else if (S.rR() < 0.3) {
          S.m.pool = 0; S.flags.poolBreakT = t;
          say(S, 'Somebody undercut the quota. The pool breaks, and rail prices fall through the floor this season.');
        } else {
          if (t >= 8) S.hcA += 3;
        }
      }
      if (S.flags.cokeContract) {
        S.cokeRoll = 0.9 + 0.4 * S.rR();
        if (S.rR() < 0.1) { S.capMult *= 0.85; say(S, 'The coke region strikes. Your furnaces wait for fuel.'); }
      } else S.cokeRoll = 1;
      S.oreRoll = S.flags.oreMarket ? 0.9 + 0.3 * S.rR() : 1;
      var pStrike = (S.rel < 30 ? (30 - S.rel) / (S.m.union ? 60 : S.flags.unionBroken ? 480 : 120) : 0) + (S.cutStreak >= 2 ? 0.1 * (S.cutStreak - 1) : 0);
      if (t !== 8 && t > 0 && pStrike > 0 && S.rR() < pStrike) {
        S.capMult *= 0.7; S.standing -= 3; S.rel += 5;
        say(S, S.cutStreak >= 2 ? 'After ' + S.cutStreak + ' wage cuts in a row your men walk out. Half the furnaces bank for the season.' : 'Your men walk out. Half the furnaces bank for the season.');
      }
      if (t === 2) {
        var gw = great(S);
        say(S, gw && gw.cap > 0 ? 'August 22, 1875: your converter blows its first heat. The first order is 2,000 steel rails for the Pennsylvania Railroad.'
          : 'Downriver, other converters are blowing their first heats. Your own works is still going up.');
      }
      if (t === 4) addRival(S, 'Homestead Works (Pittsburgh Bessemer Steel Co.)', 'MON', 0.06 * T.Q, 0.98, { scripted: true, stub: 1.1, owner: 'Its owners', noBuyUntil: 5 });
      if (t === 5) {
        var hs = S.rivals.filter(function (r) { return r.alive && /^Homestead/.test(r.name); })[0];
        if (hs) hs.cash = -1 * Fc(S, hs.cap);
      }
      if (t === 6) {
        addRival(S, 'Duquesne Works (Allegheny Bessemer Steel Co.)', 'MON', 0.05 * T.Q, 0.90, { scripted: true, stub: 1.1, owner: 'Its owners', noBuyUntil: 7 });
        if (S.flags.hsB) {
          var hr = S.rivals.filter(function (r) { return r.alive && /^Homestead/.test(r.name); })[0];
          if (hr) {
            var ap = appraise(S, hr), price = 0.5 * ap.A;
            if (S.flags.hsB === 'win' && room(S) >= price) {
              acquire(S, hr, price, 'cash', 1);
              say(S, 'Homestead’s creditors sell you the works for ' + fM(price) + '. It cost you a year of waiting and very little money.');
            } else {
              var big = live(S).filter(function (r) { return r !== hr && !r.scripted; }).sort(function (a, b) { return b.cap - a.cap; })[0];
              hr.alive = false; hr.goneT = t;
              if (big) { big.cap += hr.cap; say(S, big.name + ' buys the Homestead works out of receivership. It will be a rival for years.'); }
            }
          }
          S.flags.hsB = null;
        }
        say(S, 'Strikes are spreading across the country. The Forum, a new magazine, asks you, a steel employer, for your view of the labor question.');
      }
      if (t === 7) {
        say(S, 'Downriver at Duquesne, the Allegheny Bessemer Steel Company rolls rails straight from the ingot without reheating, and sells them cheaper than you can. On May 31 the South Fork dam above Johnstown fails and 2,209 people die. You are a member of the South Fork Fishing and Hunting Club, which owned the dam; so is Henry Clay Frick.' +
          (S.flags.frick ? ' This year Frick takes charge of your company.' : ''));
        harm(S, 'association', 'Member of the South Fork Fishing and Hunting Club, whose dam failed on May 31, 1889', 0.5);
      }
      if (S.flags.duqAuto === t) {
        var dq = S.rivals.filter(function (r) { return r.alive && /^Duquesne/.test(r.name); })[0];
        if (dq) {
          var qd = quote(S, dq, null, 'bonds', { level: 0.6, pressure: 1.4 });
          S.offers++;
          if (S.rR() < qd.P) { acquire(S, dq, qd.price, 'bonds', qd.pressure); say(S, 'Duquesne’s owners, their markets gone, sell you the works for ' + fM(qd.price) + ' in bonds.'); unlock(S, 'fn7', 'Steel, Duquesne'); }
          else { dq.stub += 0.1; say(S, 'Duquesne’s owners refuse your bonds. They will sell to someone, but not this year, and not to you.'); }
        }
      }
      if (t === 8) {
        var lastPM = S.hist.length ? S.hist[S.hist.length - 1].pM : NaN;
        say(S, 'PBS reports rolled-steel prices down from about $35 a gross ton to $22 early in 1892, though Wikipedia describes the industry as doing well; in this model your rails fetched about ' + fmtP(S, lastPM) + ' last chapter. The contract with the Amalgamated Association of Iron and Steel Workers at ' + worksName(S) + ' expires on June 30. You are due in Scotland for the summer; ' + (S.flags.frick ? 'Frick will handle it, on a plan you approve before you sail.' : 'your managers will handle it, on a plan you approve before you sail.'));
      }
      if (t === 9) {
        say(S, 'Another panic, another depression. Rivals are struggling, and money is dear.');
        if (ownsHomestead(S) && S.rel < 30) {
          spend(S, 0.14); S.standing -= 4; harm(S, 'armor', 'Armor plate: defects hidden from Navy inspectors (contested)', 0.5);
          say(S, 'Workmen at Homestead tell the Navy that armor plate was doctored while its inspectors were away. The Navy moves to fine you 15 percent of the contract; President Cleveland cuts it to 10 percent, $140,484.94.');
        }
      }
      if (t === 11) say(S, S.flags.frick && !S.flags.frickGone ? 'On December 5, 1899, Frick resigns from the board after a quarrel with you.' : 'Your company makes more steel than any other in the country, and the bankers have noticed.');
    }
    S.cross = crossFor(S);
    if (S.cross && S.cross.def.auto) S.cross.def.auto(S);
  }

  /* ---------------------------------------------------------------- acquisitions ---------------------------------------------------------------- */
  var LEVEL = { low: 0.7, fair: 1.0, rich: 1.3 };
  function appraise(S, r) {
    var Fr = Fc(S, r.cap), dist = clamp(-r.cash / (2 * Fr), 0, 1);
    return { A: r.cap * capex(S) * 0.5 * (1 - 0.4 * dist) + Math.max(0, r.cash), dist: dist };
  }
  function quote(S, r, lvl, pay, ctx) {
    ctx = ctx || {};
    var ap = appraise(S, r), R = ap.A * r.stub * (r.lastPr > 0 ? 1.3 : 1) * (1 - 0.5 * ap.dist);
    var lv = ctx.level || LEVEL[lvl] || 1, pr = ctx.pressure || 1;
    if (S.cuts.indexOf(r.id) >= 0 || S.cutsLast.indexOf(r.id) >= 0) pr = Math.max(pr, 1.25);
    if (S.m.spies) pr *= 1.1;
    var sf = pay === 'stock' ? (S.lastAnnual[1] > 0 ? 1.2 : 0.8) + (S.flags.regFriend && r.city === 'REG' ? 0.1 : 0) : 1;
    var P = clamp(logistic(6 * (ap.A * lv * sf * pr / Math.max(1e-9, R) - 1)), 0.02, 0.98);
    return { A: ap.A, dist: ap.dist, R: R, price: ap.A * lv, P: P, pressure: pr, sf: sf, band: P >= 0.7 ? 'Likely' : P >= 0.35 ? 'Maybe' : 'Long shot' };
  }
  function acquire(S, r, price, pay, pressure, o) {
    o = o || {};
    r.alive = false; r.boughtT = S.t;
    var p = { id: 'p' + (S.nid++), name: r.name.replace(/ \(.*\)$/, ''), cap: r.cap, eff: r.eff, city: r.city, acq: true, since: yr(S), great: false,
      homestead: /^Homestead/.test(r.name) };
    S.plants.push(p);
    if (pay === 'stock') { var V = Math.max(1e-6, Vstock(S)); S.own *= V / (V + price); S.stockDeals++; if (r.talent) S.partners++; unlock(S, 'fn8', 'Paying in stock for ' + p.name); }
    else if (pay === 'bonds') { S.debt += price; S.cashDeals++; }
    else { spend(S, price); S.cashDeals++; }
    if (pressure > 1 && !o.quiet) harm(S, 'duress', 'Bought ' + p.name + ' under pressure', 1);
    S.accepts++; S.acqCost += price;
    unlock(S, 'fn7', 'Buying ' + p.name);
    return p;
  }
  function offer(S, rid, lvl, pay, ctx) {
    var r = rivalById(S, rid);
    if (!r || !r.alive) return { ok: false, text: 'That company is gone.' };
    var q = quote(S, r, lvl, pay, ctx);
    S.offers++;
    var hit = S.rR() < q.P;
    if (hit) {
      acquire(S, r, q.price, pay, q.pressure, ctx);
      var t = r.name + ' accepts ' + fM(q.price) + ' in ' + (pay === 'stock' ? 'stock' : pay === 'bonds' ? 'bonds' : 'cash') + '.';
      if (pay === 'stock' && r.talent) t += ' ' + (r.owner || 'Its owner') + ' joins you as a partner.';
      return { ok: true, hit: true, text: t, q: q };
    }
    r.stub += 0.1; r.noTalkT = S.t;
    return { ok: true, hit: false, q: q, text: r.name + ' says no. ' + (r.owner ? r.owner + ' would rather sink than sell to you this year.' : 'Its owners would rather sink than sell to you this year.') };
  }
  function canOffer(S, r) {
    if (!r || !r.alive) return 'gone';
    if (r.noBuy) return S.camp === 'oil' ? 'State antitrust law and local hostility keep your companies out of this field.' : 'Bankers own this combination. It is not for sale to you.';
    if (r.noBuyUntil != null && S.t < r.noBuyUntil) return 'Not for sale yet.';
    if (r.noTalkT === S.t) return 'Refused you this chapter.';
    return null;
  }

  /* ---------------------------------------------------------------- building ---------------------------------------------------------------- */
  function buildCost(S, add) {
    var cur = Math.max(capTot(S) + capPend(S), 1e-9);
    return add * capex(S) * (1 + 0.6 * Math.max(0, add / cur - 0.25)) * S.buildDisc;
  }
  function buildMax(S) { return Math.max(capTot(S) + capPend(S), 0.02 * Qnext(S)); }
  function buildFit(S) {
    var hi = buildMax(S), rm = room(S);
    if (buildCost(S, hi) <= rm) return hi;
    var lo = 0;
    for (var i = 0; i < 30; i++) { var mid = (lo + hi) / 2; if (buildCost(S, mid) <= rm) lo = mid; else hi = mid; }
    return lo;
  }
  function build(S, add) {
    var g = great(S);
    if (!g || !(add > 0)) return 0;
    var c = buildCost(S, add);
    spend(S, c);
    S.pend.push({ cap: add, pid: g.id, on: S.t + 1 });
    unlock(S, 'fn4', 'Building out ' + g.name);
    return c;
  }
  function sellCapacity(S, frac, mult, why) {
    var want = frac * capTot(S), got = 0, cash = 0;
    S.plants.filter(function (p) { return p.acq; }).sort(function (a, b) { return a.cap - b.cap; }).forEach(function (p) {
      if (got >= want - 1e-9) return;
      var take = Math.min(p.cap, want - got), val = take * capex(S) * 0.5 * mult;
      p.cap -= take; got += take; cash += val;
      addRival(S, p.name + (p.cap > 1e-9 ? ' (part)' : ''), p.city, take, p.eff, { stub: 1.2 });
    });
    S.plants = S.plants.filter(function (p) { return p.great || p.cap > 1e-9; });
    if (got < want - 1e-9) {
      var g = great(S), take2 = Math.min(g.cap * 0.5, want - got);
      g.cap -= take2; got += take2; cash += take2 * capex(S) * 0.5 * mult;
      addRival(S, (S.camp === 'oil' ? 'Independent Refining' : 'Independent Rail') + ' No. ' + (S.rid + 1), g.city, take2, g.eff * 1.02, { stub: 1.2 });
    }
    S.cash += cash;
    note(S, why + ': sold ' + fmtCap(S, got) + ' of capacity for ' + fM(cash) + '.');
    return { cap: got, cash: cash };
  }
  function fM(v, d) { return typeof v === 'number' && Math.abs(v) < 0.005 ? '$0' : F.M(v, d); }
  function plantRef(p) { return !p ? 'your works' : p.name === 'The works' ? 'the works' : p.name === 'New works' ? 'the new works' : p.name; }
  function fmtCap(S, v) { return S.camp === 'oil' ? (v < 10 ? v.toFixed(1) : F.n(v)) + ' kb/d' : F.n(v) + ' kt'; }
  function fmtP(S, v) { return !isFinite(v) ? '–' : S.camp === 'oil' ? v.toFixed(1) + '¢' : '$' + v.toFixed(2); }

  /* ---------------------------------------------------------------- crossroads ----------------------------------------------------------------
     Text may carry [[key|label]] glossary markers; the view turns them into inline terms. hist: the option history took.
     model: no single historical decision; the reveal says so. fx(S, c) applies effects and may push lines into c.out. */
  function rebateOn(S, why) {
    S.m.rebate = 1; S.m.rebMode = 'secret'; S.m.access += 0.5; S.hcA += 3;
    harm(S, 'rebate', 'Secret railroad rebate', 1);
    unlock(S, 'fn5', why);
  }
  function empireAssets(S, c) {
    if (!S.m.gather) { S.m.gather = 1; S.m.freight *= 0.85; S.m.access += 0.2; S.integ.push('gathering lines'); }
    if (!S.m.tank) { S.m.tank = 1; S.m.cont *= 0.8; S.m.access += 0.3; S.integ.push('tank cars'); }
    var p = { id: 'p' + (S.nid++), name: 'Empire refineries', cap: 0.06 * Tt(S).Q, eff: 0.98, city: 'PHL', acq: true, since: yr(S), great: false };
    S.plants.push(p);
    unlock(S, 'fn9', 'The Empire war'); unlock(S, 'fn11', 'The Empire war');
    c.out.push('Empire sells you its pipelines, its tank cars and its refineries for ' + fM(S.flags.empirePrice) + '.');
  }
  var X = {
    c1: { y: '1868', title: 'The railroad’s offer', notes: ['fn5'],
      ctx: 'The Lake Shore road will cut your rate if you promise it a steady volume every day. The cut would be a secret [[rebate|rebate]]. Your rivals would keep paying the posted price.',
      opts: [
        { k: 'A', l: 'Take it, and keep it quiet.', s: 'Cheaper freight and priority for your oil; a secret that can come out.', hist: 1, dark: 1,
          fx: function (S) { rebateOn(S, 'The railroad’s offer, 1868'); } },
        { k: 'B', l: 'Take it only if any shipper of your size gets the same terms.', s: 'A smaller saving, nothing to hide.',
          fx: function (S) { S.m.freight *= 0.85; S.m.access += 0.2; S.standing += 3; S.m.rebMode = 'open'; } },
        { k: 'C', l: 'Decline. Win on the refinery floor.', s: 'No favors, no discount.', fx: function (S) { S.standing += 2; } }
      ],
      hist: 'In 1868 the Lake Shore’s vice-president, J. H. Devereux, gave the firm a secret rebate off the cent-a-gallon rate every Cleveland refiner paid on crude (Tarbell). About 1870 Flagler guaranteed the road sixty carloads of refined oil a day in return for a through rate of $1.75 a barrel from the Oil Regions to New York. The railroads argued that steady trainloads were cheaper to haul; the independents argued that a [[carrier|common carrier]] must charge everyone alike.',
      src: S_('tarbell', 'wSO') },
    c2: { y: '1870', title: 'The charter', notes: ['fn8'],
      ctx: 'Your partnership can become a corporation. More capital means faster building; more shareholders mean a smaller slice for you.',
      opts: [
        { k: 'A', l: 'Incorporate: $1 million of capital; you keep 26.7 percent.', s: 'The historical split.', hist: 1, fx: function (S) { S.cash += 0.3; } },
        { k: 'B', l: 'Sell more stock and build faster.', s: 'More money now, less of the company forever.', fx: function (S) { S.own = 0.20; S.cash += 1.2; } },
        { k: 'C', l: 'Stay a partnership.', s: 'Keep more; borrow less easily.', fx: function (S) { S.own = 0.30; S.flags.partnership = true; } }
      ],
      hist: 'In January 1870 the partnership became the Standard Oil Company of Ohio with $1 million of capital. Rockefeller received 2,667 of its first 10,000 shares, about 26.7 percent.',
      src: S_('wSO') },
    c3: { y: '1872', title: 'The South Improvement Company', notes: ['fn6', 'fn3'],
      ctx: 'There are far more stills than crude to run through them, and prices are sliding below what most refiners need to live. Tom Scott of the Pennsylvania Railroad has a plan: three trunk lines, the Pennsylvania, the Erie and the New York Central, will give members of a secret company large rebates on their own oil and pay them [[drawback|drawbacks]] on every barrel shipped by everyone else. On paper: a $2.56 open rate on crude from the Oil Regions to New York, $1.06 back to members, and $1.06 to members on each outsider’s barrel of crude.',
      opts: [
        { k: 'A', l: 'Join.', s: 'The strongest hand in Cleveland, if it stays secret.', hist: 1, dark: 1,
          fx: function (S, c) {
            S.flags.sic = true; S.hcA += 12; S.rec += 12; harm(S, 'sic', 'Member of the South Improvement Company', 2);
            if (S.rR() < 0.85) {
              S.flags.boycottT = S.t; S.standing -= 12;
              c.out.push('The Oil Regions revolt. Producers refuse to sell crude to the members, the railroads cancel the contracts on March 25, and Pennsylvania suspends the charter on April 2. The Oil Regions remember the name for years.');
            } else {
              S.flags.sicLive = S.t; S.flags.sicLeakT = S.t + 1;
              c.out.push('The contracts hold, for now. This season your rivals pay the railroads more, and part of what they pay comes to you.');
            }
            S.special = { kind: 'cle', left: 6, pressure: 1.4, disc: 0.7, res: {} };
          } },
        { k: 'B', l: 'Refuse, and buy on the merits.', s: 'No leverage, no scandal.', fx: function (S) { S.standing += 3; S.special = { kind: 'cle', left: 6, pressure: 1, res: {} }; } },
        { k: 'C', l: 'Refuse publicly and side with the Oil Regions.', s: 'Friends in the creeks; sellers who hold out.',
          fx: function (S) { S.standing += 10; S.flags.regFriend = true; S.special = { kind: 'cle', left: 6, pressure: 0.9, res: {} }; } }
      ],
      hist: 'Rockefeller and his partners held 900 of the company’s 2,000 shares. The railroads ended the contracts on March 25, 1872, and Pennsylvania suspended the charter on April 2. In about six weeks that February and March, Standard bought most of Cleveland’s 26 refineries: at least 21 by Tarbell’s count and the Encyclopedia of Cleveland History’s, 22 in some accounts. Tarbell estimates its capacity rose from not over 1,500 to 10,000 barrels a day, over a fifth of the country’s refining capacity.',
      src: S_('wSIC', 'tarbell', 'ech', 'colum') },
    c4: { y: '1874', title: 'The quiet alliances', notes: ['fn7'],
      ctx: 'The Panic of 1873 has emptied the banks and the order books. Crude is under two dollars a barrel. The strongest refiners in New York, Pittsburgh and Philadelphia are tired, and they would take your stock and keep their own names over the door.',
      opts: [
        { k: 'A', l: 'Secret alliances, paid in stock.', s: 'Three big rivals at once; nobody outside knows.', hist: 1, dark: 1,
          fx: function (S, c) { allianceOffers(S, c, 1.1); S.hcA += 4; harm(S, 'secret', 'Secretly owned “independent” refiners', 0.5); } },
        { k: 'B', l: 'Merge openly.', s: 'The same deals, in daylight.', fx: function (S, c) { allianceOffers(S, c, 1.0); S.standing -= 3; } },
        { k: 'C', l: 'Stay in Cleveland and compete on cost.', s: 'Keep your stake whole.' }
      ],
      hist: 'In 1874 W. G. Warden of Philadelphia and Charles Lockhart of Pittsburgh transferred their refineries to Standard for stock, on the understanding that the union would stay secret and the firms keep their own names. On October 15 Standard bought Charles Pratt and Company of New York the same way, bringing in Henry H. Rogers, who in 1872 had led New York’s refiners against the South Improvement Company. Tarbell notes that the dividend had fallen from 37 percent in 1872 to 15 percent in 1873 as profits went into barrel factories, tank cars and terminals.',
      src: S_('tarbell') },
    c5: { y: '1877', title: 'The Empire war', notes: ['fn11', 'fn9'],
      ctx: 'The Pennsylvania Railroad’s Empire Transportation Company owns pipelines, tank cars and now refineries of its own. It wants to be your carrier and your competitor at once.',
      opts: [
        { k: 'A', l: 'Fight: shut the plants on its line, move freight to rival roads, cut prices.', s: 'Expensive this year; decisive if it works.', hist: 1,
          fx: function (S, c) {
            S.flags.warT = S.t;
            if (S.rR() < 0.8) { S.flags.empirePrice = 3.4; spend(S, 3.4); empireAssets(S, c); }
            else c.out.push('The war ends in a stalemate. Empire keeps its pipes, and you keep this year’s losses.');
          } },
        { k: 'B', l: 'Settle and pay the Pennsylvania’s rates.', s: 'Peace at a price.', fx: function (S) { S.flags.pennT = S.t + 2; } },
        { k: 'C', l: 'Buy Empire outright at a premium.', s: 'Skip the war; pay for it.', can: function (S) { return room(S) < 6 ? 'Needs ' + fM(6) + '; you can fund ' + fM(room(S)) + '.' : null; },
          fx: function (S, c) { S.flags.empirePrice = 6; spend(S, 6); S.hcA += 3; empireAssets(S, c); } }
      ],
      hist: 'After a rate and price war in 1877 the Pennsylvania Railroad and its Empire Transportation Company gave up. Tarbell records Empire selling Standard its pipeline interest for $1,094,805.56, its refineries in New York and Philadelphia for $501,652.78, $900,000 of tank cars and other property: $3,400,000 in cash in all.',
      src: S_('tarbell') },
    c6: { y: '1879', title: 'The pipeline over the mountain', notes: ['fn11'],
      ctx: 'The Tidewater line could free the independents from the railroads, and from you.',
      opts: [
        { k: 'A', l: 'Fight it, then buy in.', s: 'Block the refiners it would serve; then make it an ally.', hist: 1, dark: 1,
          can: function (S) { return room(S) < 4 ? 'Needs ' + fM(4) + '; you can fund ' + fM(room(S)) + '.' : null; },
          fx: function (S) { spend(S, 4); S.hcA += 8; harm(S, 'tide', 'War on the Tidewater pipeline', 0.5); S.m.access += 0.3; S.flags.tideA = true; } },
        { k: 'B', l: 'Build your own trunk lines.', s: 'Beat it with a bigger network.',
          can: function (S) { return S.m.trunk ? 'You already own trunk lines.' : room(S) < 8 ? 'Needs ' + fM(8) + '; you can fund ' + fM(room(S)) + '.' : null; },
          fx: function (S) {
            spend(S, 8);
            if (!S.m.gather) { S.m.gather = 1; S.m.freight *= 0.85; S.m.access += 0.2; S.integ.push('gathering lines'); }
            S.m.trunk = 1; S.m.freight *= 0.6; S.m.access += 0.3; S.integ.push('trunk pipelines');
          } },
        { k: 'C', l: 'Let it run and compete on refining.', s: 'Cheaper crude for everyone, including rivals.', fx: function (S) { S.flags.tideOpen = true; S.standing += 6; } }
      ],
      hist: 'The Tidewater Pipe Company began pumping on May 28, 1879, through a six-inch line 109 miles over the mountains to Williamsport. Standard fought it, then bought about a third of its stock and made it an ally; its National Transit Company came to control the pipelines. Tarbell wrote that rival refiners paid forty or forty-five cents for a service that cost Standard not over a fourth of that. In April a Clarion County grand jury had indicted Rockefeller and eight associates for conspiracy.',
      src: S_('tide', 'tarbell') },
    c7: { y: '1882', title: 'Nine trustees', notes: ['fn16'],
      ctx: function (S) {
        var h = S.hist[S.hist.length - 1];
        return 'You now refine ' + F.pct(h ? h.share : 0) + ' of the country’s oil, through companies chartered in different states and held through a tangle of partners.';
      },
      opts: [
        { k: 'A', l: 'Form the [[trust|trust]].', s: 'One command over forty companies; a structure the law will study.', hist: 1,
          fx: function (S) { S.flags.trust = true; S.m.fixed *= 0.92; S.hcA += 8; } },
        { k: 'B', l: 'Keep the loose alliance.', s: 'Less power, less exposure.', fx: function (S) { S.m.fixed *= 1.03; } },
        { k: 'C', l: 'Split into regional companies with separate boards.', s: 'Harder to run, harder to sue.', fx: function (S) { S.m.fixed *= 1.06; S.flags.split = true; S.standing += 5; } }
      ],
      hist: 'On January 2, 1882, some forty stockholders signed the Standard Oil Trust Agreement, placing the securities of 40 companies with nine trustees. The National Archives notes that the trustees elected the component companies’ directors and officers and set their dividends, so the nine ran them all.',
      src: S_('nara', 'wSO') },
    c8: { y: '1887', title: 'The Interstate Commerce Act', notes: ['fn5'], model: 1,
      ctx: function (S) {
        return 'On February 4, 1887, President Cleveland signs the Interstate Commerce Act. Railroad rates must be “reasonable and just” and published, rebates and rate discrimination are illegal, and a new Interstate Commerce Commission will hear complaints. It cannot set rates, and your lawyers expect the courts to trim what it can do.' +
          (S.m.rebate ? ' Your railroad discount is now against federal law on every interstate barrel.' : ' You ship at posted rates already; your rivals are watching whether everyone else will.');
      },
      opts: [
        { k: 'A', l: 'Comply: posted rates and nothing else.', s: 'Lose any discount; lose its heat.',
          fx: function (S, c) {
            S.flags.ica = 'A'; S.standing += 3; S.hcA -= 4;
            if (S.m.rebate) { S.m.rebate = 0; S.m.access = Math.max(1, S.m.access - 0.5); c.out.push('Your freight bills rise to the posted rate. So does your credibility with the commission.'); }
            else c.out.push('You file your rates and say so in the papers. It costs you nothing, this time.');
          } },
        { k: 'B', l: 'Keep the discount through side agreements nobody files.', s: 'The old freight bill, a new federal offense.', dark: 1,
          can: function (S) { return S.m.rebate ? null : 'You have no discount to keep.'; },
          fx: function (S) { S.flags.ica = 'B'; S.m.rebMode = 'secret'; S.hcA += 6; S.rec += 4; harm(S, 'rebate', 'Secret railroad rates kept after the Interstate Commerce Act', 1); } },
        { k: 'C', l: 'Turn it into a published volume rate any shipper of your size can take.', s: 'Half the discount, in daylight.',
          can: function (S) { return S.m.rebate ? null : 'You have no discount to convert.'; },
          fx: function (S) { S.flags.ica = 'C'; S.m.rebate = 0; S.m.access = Math.max(1, S.m.access - 0.3); S.m.freight *= 0.9; S.m.rebMode = 'open'; S.standing += 2; S.hcA -= 2; } }
      ],
      hist: 'The act made rebates and rate discrimination illegal and created the Interstate Commerce Commission, the first independent regulatory agency of the U.S. government, but it did not let the government fix rates. Over time the courts narrowed the commission’s authority: by 1906, Wikipedia reports, the Supreme Court had ruled for the railroad in fifteen of the sixteen commission cases it heard. In 1903 the Elkins Act made taking a rebate an offense too.',
      src: S_('wICA', 'elkins') },
    c9: { y: '1892', title: 'The Ohio ruling', notes: ['fn16', 'fn17'],
      ctx: 'On March 2, 1892, the Supreme Court of Ohio bars Standard Oil of Ohio from the trust agreement. The trust’s certificate holders have to decide what that means.',
      opts: [
        { k: 'A', l: 'Dissolve on paper: twenty companies, the same owners, run in concert.', s: 'Nothing changes but the letterhead, for now.', hist: 1,
          fx: function (S) { S.hcA -= 5; S.flags.paperT = S.t + 1; } },
        { k: 'B', l: 'Separate the companies in fact.', s: 'Lose the trust’s command; lose most of the heat.',
          fx: function (S) { ohioSplit(S); } },
        { k: 'C', l: 'Fight it in court.', s: 'Win and keep everything; lose and do the second road anyway.',
          fx: function (S, c) {
            if (S.rR() < 0.5) { S.hcA += 10; S.standing -= 4; c.out.push('You win on appeal. The trust stands, and every editor in Ohio now knows its structure by heart.'); }
            else { ohioSplit(S); S.hcA += 5; c.out.push('You lose. The court orders a real separation, and the fight has made it louder.'); }
          } }
      ],
      hist: 'On March 2, 1892, the Supreme Court of Ohio barred Standard Oil of Ohio from the trust agreement, and on March 21 the certificate holders voted to terminate the trust. Its holdings were reorganized into 20 companies with the same owners, and in 1899 Standard Oil of New Jersey became their [[holding|holding company]]. Tarbell quotes the court: cheaper prices are “the usual pretext on which monopolies of this kind are defended.”',
      src: S_('caseOH', 'wSO', 'tarbell') },
    c10: { y: '1893', title: 'Step back?', notes: [],
      ctx: 'A panic opens a long depression. You are in your fifties and tired, and the business increasingly runs itself.',
      opts: [
        { k: 'A', l: 'Hand daily command to your lieutenants and turn to giving.', s: 'One fewer move a chapter; wholesale giving opens now.', hist: 1,
          fx: function (S) { S.flags.stepBack = true; S.standing += 3; unlock(S, 'fn26', 'Stepping back, 1893'); } },
        { k: 'B', l: 'Stay in command.', s: 'Your hand on everything.' }
      ],
      hist: 'The Rockefeller Archive Center dates his retirement from active leadership to 1896, at 57. He had hired the Reverend Frederick T. Gates to manage his giving, which grew into the University of Chicago, the Rockefeller Institute for Medical Research and the General Education Board.',
      src: S_('rac') },
    c11: { y: '1902', title: 'Answering Tarbell', notes: ['fn18'], model: 1,
      ctx: 'McClure’s is running her history in parts, and every part is read aloud in the Oil Regions. Your lawyers, your partners and your pastor all have advice.',
      opts: [
        { k: 'A', l: 'Say nothing. Let the work speak.', s: 'Silence costs nothing today.' },
        { k: 'B', l: 'Open the books: publish costs, rebates, all of it.', s: 'Sunlight cuts both ways.',
          fx: function (S, c) {
            if (harmsW(S) <= 4) { S.standing += 10; S.hcA -= 5; c.out.push('The books are duller than the rumors. The story cools.'); }
            else { S.standing -= 6; S.hcA += 8; S.rec += 6; c.out.push('The books confirm the rumors, with dates. The story runs another year.'); }
          } },
        { k: 'C', l: 'Discredit her.', s: 'Attack the messenger.', dark: 1,
          fx: function (S, c) {
            S.standing -= 6; S.hcA += 6; harm(S, 'press', 'Campaign to discredit a journalist', 1);
            if (S.rR() < 0.4) { S.standing -= 8; S.rec += 6; c.out.push('The campaign is traced to your office, and becomes a chapter of its own.'); }
          } }
      ],
      hist: 'The series ran in nineteen parts and became a book in 1904. Tarbell began by interviewing Henry H. Rogers, by then one of Rockefeller’s colleagues. The work is credited with hastening the federal case and the breakup.',
      src: S_('wHist', 'yale') },
    c12: { y: '1906', title: 'United States v. Standard Oil', notes: ['fn17'],
      ctx: 'Your lawyers want a strategy before the argument.',
      opts: [
        { k: 'A', l: 'Fight it to the Supreme Court.', s: 'All or nothing, on the record you built.', hist: 1, fx: function (S) { S.flags.posture = 1; } },
        { k: 'B', l: 'Offer to sell the pipelines and three regional companies.', s: 'Give up a quarter to keep the rest.',
          fx: function (S, c) { var r = sellCapacity(S, 0.25, 0.8, 'The settlement offer'); S.flags.posture = 0.6; c.out.push('You sell ' + fmtCap(S, r.cap) + ' of capacity for ' + fM(r.cash) + '. The government takes the offer to the Court as a sign of weakness, or of good faith; the Court will decide which.'); } },
        { k: 'C', l: 'Break yourself up on your own terms.', s: 'Certain dissolution, your way.', fx: function (S) { S.flags.selfSplit = true; S.standing += 8; } }
      ],
      hist: 'Standard fought the case all the way to the Supreme Court. What the Court decided comes when you close these books.',
      src: S_('scotus') },

    s1: { y: '1872', title: 'One basket', notes: [],
      ctx: 'You are thirty-six, rich from bridges, railroad work and investments. Iron rails wear out fast on busy lines. Steel rails sold for well over a hundred dollars a ton only a few years ago, and the [[bessemer|Bessemer converter]] can make steel by the ton.',
      opts: [
        { k: 'A', l: 'Put everything into steel: a Bessemer works on the Monongahela.', s: 'One basket; watch it.', hist: 1,
          fx: function (S) { newWorks(S, 60, 1.0, 2); S.cash += 0.8; spend(S, 1.2); S.flags.worksCost = 1.2; } },
        { k: 'B', l: 'Build steel but keep the iron mills and the bridge works.', s: 'Safer, slower, distracted.',
          fx: function (S) { newWorks(S, 45, 1.0, 2); spend(S, 0.9); S.flags.worksCost = 0.9; S.flags.side = true; S.m.conv *= 1.05; } },
        { k: 'C', l: 'Wait a year and see whether Bessemer steel is a fad.', s: 'Enter late; you may be too small to ride out the next panic.', fx: function (S) { S.flags.waited = true; S.flags.rootRisk = 's1C'; } }
      ],
      hist: 'Ground was broken for the Edgar Thomson Steel Works on January 1, 1873; it cost about $1.2 million. In an 1885 speech to a Pittsburgh commercial college, Carnegie told the students to put all their eggs in one basket, and then watch that basket.',
      src: S_('wET', 'wq') },
    s2: { y: '1873', title: 'The Panic of 1873', notes: [],
      ctx: function (S) {
        return 'In September a great banking house fails and a panic spreads. Rail orders vanish, money is scarce, and half-built mills stand in the rain.' +
          (S.flags.waited ? ' You waited. Contractors are desperate and iron is cheap.' : '');
      },
      opts: function (S) {
        if (S.flags.waited) return [
          { k: 'A', l: 'Build now, at depression prices.', s: 'The same works for 20 percent less; it runs from 1878.',
            fx: function (S) { newWorks(S, 60, 1.0, S.t + 2); spend(S, 0.96); S.flags.worksCost = 0.96; } },
          { k: 'B', l: 'Wait until it passes.', s: 'Build in 1875 at full price; it runs from 1878, with less cushion for the next panic.', fx: function (S) { S.flags.waitMore = true; S.flags.rootRisk = 's2Bw'; } },
          { k: 'C', l: 'Bring in partners and build now.', s: 'Less risk, less company.', fx: function (S) { S.own = 0.45; S.cash += 0.6; newWorks(S, 60, 1.0, S.t + 2); spend(S, 0.96); S.flags.worksCost = 0.96; } }
        ];
        return [
          { k: 'A', l: 'Keep building. Sell whatever you must.', s: 'Cheaper labor and materials; less sleep.', hist: 1,
            fx: function (S) { S.cash += 0.15 * (S.flags.worksCost || 1.2) + 0.5; S.personal = Math.max(0, S.personal - 0.5); } },
          { k: 'B', l: 'Pause until it passes.', s: 'Safe cash now; a later start, and a thinner cushion when the next panic comes.', fx: function (S) { S.pend.forEach(function (x) { x.on += 1; }); S.flags.rootRisk = 's2B'; } },
          { k: 'C', l: 'Bring in partners to finance it.', s: 'Less risk, less company.', fx: function (S) { S.own = 0.45; S.cash += 0.6; } }
        ];
      },
      hist: 'Work continued through the depression, and the Edgar Thomson works made its first steel on August 22, 1875.',
      src: S_('wET') },
    s3: { y: '1875', title: 'A name over the gate', notes: [],
      ctx: 'The works needs a name over the gate, and the first customers are reading the letterhead.',
      opts: [
        { k: 'A', l: 'Name it for J. Edgar Thomson, the Pennsylvania’s president.', s: 'Flattery with a purchasing department.', hist: 1,
          fx: function (S) { S.m.access += 0.3; nameWorks(S, 'Edgar Thomson works'); } },
        { k: 'B', l: 'Name it for the town, Braddock.', s: 'The neighbors notice.', fx: function (S) { S.standing += 3; nameWorks(S, 'Braddock works'); } },
        { k: 'C', l: 'Name it for yourself.', s: 'Your name, your works.', fx: function (S) { S.standing += 1; nameWorks(S, 'Carnegie works'); } }
      ],
      hist: 'The works was named for J. Edgar Thomson, president of the Pennsylvania Railroad, and its first heat of steel became 2,000 rails for that railroad. Alexander Holley built it and Captain Bill Jones ran it.',
      src: S_('wET') },
    s4: { y: '1878', title: 'The pool', notes: ['fn15', 'fn17'], model: 1,
      ctx: 'Rail makers are tired of price wars. A pool is proposed: each mill gets a quota and the price holds.',
      opts: [
        { k: 'A', l: 'Join, and keep your quota.', s: 'Stable prices; a quota that lags your mills.', fx: function (S) { S.m.pool = 1; S.poolShare = Math.max(0.05, lastShare(S)); S.flags.rootRisk = 's4A'; } },
        { k: 'B', l: 'Stay out and undercut.', s: 'The cheapest mill does not need a truce.' },
        { k: 'C', l: 'Join and cheat on the quota.', s: 'Their price, your volume.', dark: 1, fx: function (S) { S.m.pool = 2; } }
      ],
      hist: 'Pools were a common Gilded Age answer to price wars. They could not be enforced in court and every member was tempted to cheat, so they tended to break; after 1890 they were illegal under the Sherman Act.',
      src: S_('nara') },
    s5: { y: '1881', title: 'Frick', notes: ['fn9'],
      ctx: 'Coke is the fuel of the blast furnace, and a young operator named Henry Clay Frick controls some of the best of it. Whoever controls your [[coke|coke]] can squeeze you.',
      opts: [
        { k: 'A', l: 'Take Frick in as a partner and buy control of his coke company.', s: 'Cheap coke and a hard, brilliant manager.', hist: 1,
          fx: function (S) { S.m.coke *= 0.65; S.flags.frick = true; S.own *= 0.9; S.integ.push('coke (with Frick)'); } },
        { k: 'B', l: 'Build your own coke ovens.', s: 'Your coke, your way.',
          can: function (S) { var c = cokeCost(S); return room(S) < c ? 'Needs ' + fM(c) + '; you can fund ' + fM(room(S)) + '.' : null; },
          fx: function (S) { spend(S, cokeCost(S)); S.m.coke *= 0.75; S.m.cokeOwn = 1; S.integ.push('coke ovens'); } },
        { k: 'C', l: 'Buy coke on contract.', s: 'No capital; no control.', fx: function (S) { S.flags.cokeContract = true; } }
      ],
      hist: 'In 1881 Carnegie joined forces with Frick to get the coke he wanted, and soon held a majority of Frick’s coke company. In 1889 he put Frick in charge of the steel business.',
      src: S_('pbsFrick') },
    s6: { y: '1883', title: 'Homestead for sale', notes: [],
      ctx: 'Steel prices are falling hard. Across the river, the two-year-old Homestead works of the Pittsburgh Bessemer Steel Company is in trouble.',
      opts: [
        { k: 'A', l: 'Buy it at the distressed price.', s: 'A modern mill, cheap.', hist: 1,
          can: function (S) { var r = homesteadRival(S); if (!r) return 'Homestead is gone.'; var p = 0.8 * appraise(S, r).A; return room(S) < p ? 'Needs ' + fM(p) + '; you can fund ' + fM(room(S)) + '.' : null; },
          fx: function (S, c) { var r = homesteadRival(S), p = 0.8 * appraise(S, r).A; acquire(S, r, p, 'cash', 1); c.out.push('You buy the Homestead works for ' + fM(p) + ' in cash.'); } },
        { k: 'B', l: 'Let it fail and buy the pieces.', s: 'Cheaper, if nobody beats you to it.', fx: function (S) { S.flags.hsB = S.rR() < 0.5 ? 'win' : 'lose'; } },
        { k: 'C', l: 'Pass.', s: 'Someone else’s problem.' }
      ],
      hist: 'Carnegie bought the two-year-old Homestead works in 1883. For many years it was the largest steel mill in the world.',
      src: S_('wHW') },
    s7: { y: '1886', title: 'An employer’s view', notes: [],
      ctx: 'The magazine wants two thousand words from a steel employer, and it will print whatever you send.',
      opts: [
        { k: 'A', l: 'Publish: workers have as much right to organize as owners do.', s: 'Goodwill now; a promise on the record.', hist: 1,
          fx: function (S) { S.standing += 8; S.rel += 8; S.flags.promise = true; } },
        { k: 'B', l: 'Publish it and practice it: recognize the union for good and arbitrate every dispute.', s: 'Peace, at union rates.',
          fx: function (S) { S.rel += 15; S.flags.unionLock = true; S.m.union = 1; S.m.labor *= 1.03; } },
        { k: 'C', l: 'Decline to write.', s: 'Say nothing you would have to keep.' }
      ],
      hist: 'In 1886 The Forum published Carnegie’s “An Employer’s View of the Labor Question,” which called workingmen’s right to form trade unions “no less sacred” than the manufacturers’ right to associate. It appeared around the time of the Haymarket bombing in Chicago on May 4, 1886. Wikipedia’s account of Homestead notes that Carnegie was publicly in favor of unions and condemned the use of strikebreakers. Privately, in 1892, he told Frick the Homestead works would go non-union.',
      src: S_('pitt', 'hay', 'wHS') },
    s8: { y: '1889', title: 'Direct rolling', notes: [],
      ctx: 'Their process is cheaper than yours. You can match it, buy it, or make the railroads afraid of it.',
      opts: [
        { k: 'A', l: 'Send the railroads a circular warning that directly rolled rails lack a homogeneous structure.', s: 'Their customers hesitate; their price falls.', hist: 1, dark: 1,
          fx: function (S) {
            var r = duquesne(S);
            if (r) { r.acc = 0.4; r.accUntil = S.t + 2; r.cash -= 0.6 * Fc(S, r.cap); }
            S.flags.circT = S.t; S.flags.duqAuto = S.t + 1;
            harm(S, 'circular', 'A false circular about a rival’s rails', 1);
          } },
        { k: 'B', l: 'Adopt direct rolling yourself.', s: 'Match the cost.',
          can: function (S) { var c = 0.1 * capTot(S) * capex(S); return room(S) < c ? 'Needs ' + fM(c) + '; you can fund ' + fM(room(S)) + '.' : null; },
          fx: function (S) { spend(S, 0.1 * capTot(S) * capex(S)); S.m.conv *= 0.94; } },
        { k: 'C', l: 'Offer a fair price now.', s: 'Pay for the innovation.',
          can: function (S) { var r = duquesne(S); if (!r) return 'Duquesne is gone.'; var p = 1.2 * appraise(S, r).A; return room(S) < p ? 'Needs ' + fM(p) + '; you can fund ' + fM(room(S)) + '.' : null; },
          fx: function (S, c) {
            var r = duquesne(S), res = offer(S, r.id, null, 'cash', { level: 1.2 });
            c.out.push(res.text);
            if (res.hit) { S.m.conv *= 0.94; c.out.push('Their direct rolling goes into every one of your mills.'); }
          } }
      ],
      hist: 'The National Park Service’s engineering record says Carnegie falsely discredited direct rolling in a circular to the railroads, citing rails that lacked a homogeneous structure. With its markets shrinking and a strike that began in April 1889, the mill sold to Carnegie in 1890 for $1,000,000 in bonds. He adopted direct rolling in all his mills at once, and nothing more was heard of its dangers.',
      src: S_('haer') },
    s9: { y: '1892', title: 'Homestead', notes: ['fn22', 'fn23'],
      ctx: function (S) { return 'How do you want the contract at ' + worksName(S) + ' handled? The men’s pay rides on a [[sliding|sliding scale]], and the scale is what is on the table.'; },
      opts: function (S) {
        var fr = S.flags.frick && !S.flags.frickGone;
        return [
          { k: 'A', l: 'Renew with the union; split the difference on the scale.', s: 'Lower savings, labor peace.',
            fx: function (S, c) { S.m.wage *= 0.96; S.rel += 5; if (S.rR() < 0.15) { S.capMult *= 0.9; c.out.push('A short strike over the details, then a signed contract.'); } else c.out.push('A signed contract, and a summer of full furnaces.'); } },
          { k: 'B', l: (fr ? 'Frick’s plan, with your approval' : 'The hard plan') + ': a 22 percent cut for about half the union men, refuse to bargain with the union, fence the works, lock the men out, and bring in 300 Pinkerton agents by river.',
            s: 'The lowest labor cost in the industry, if you can stand what it costs.', hist: 1, dark: 1, fx: function (S, c) { homesteadB(S, c, 1); } },
          { k: 'C', l: 'Lock them out, but no Pinkertons. Wait for winter.', s: 'Slower, quieter, still a [[lockout|lockout]].', dark: 1, fx: function (S, c) { homesteadC(S, c, 1); } },
          { k: 'D', l: 'Cut short the trip and negotiate yourself.', s: 'Your name on the line' + (fr ? ', not Frick’s.' : '.'),
            fx: function (S, c) {
              S.rel += 10;
              if (S.rR() < 0.7) { S.m.wage *= 0.9; S.rel = 45; S.standing += 2; c.out.push('You sit across the table for four days. The union takes a cut; you keep the union.'); }
              else {
                c.out.push('Four days of talks, and nothing. The men will not take the cut, and you will not drop it. Now choose.');
                c.sub = [
                  { k: 'B', l: 'Bring in the Pinkertons after all.', s: 'The hard plan, a month late.', dark: 1, fx: function (S, c) { homesteadB(S, c, 0.8); } },
                  { k: 'C', l: 'Lock them out and wait for winter.', s: 'The slow plan.', dark: 1, fx: function (S, c) { homesteadC(S, c, 0.8); } }
                ];
              }
            } }
        ];
      },
      hist: 'The lockout began on June 29 with about 3,800 men outside a three-mile fence. On July 6 some 300 [[pinkertons|Pinkerton agents]] came up the Monongahela on barges and a battle followed. Seven workers and three Pinkertons is the most common count of the dead; accounts vary, and the Library of Congress guide says sixteen were killed. The state militia marched in on July 12, 8,500 strong by PBS’s count. On July 23 the anarchist Alexander Berkman tried to assassinate Frick, who survived. In November the union voted to end its restrictions. Carnegie spent the summer in Scotland, but the plan was his too. Before he sailed he wrote Frick that the works would be “necessarily non-union” after the contract expired, ordered inventory stockpiled to weather a strike, drafted a notice withdrawing recognition of the union, and on May 4 formally approved Frick’s tactics (Wikipedia). When it was over he cabled Frick, “Life worth living again,” and “First happy morning since July” (PBS). In the years after, PBS reports, came lower wages, twelve-hour days and 500 fewer jobs; by 1900 no steel plant in Pennsylvania was unionized.',
      src: S_('pbsHS', 'loc', 'wHS') },
    s10: { y: '1893', title: 'Buy in the bust?', notes: [], model: 1,
      ctx: 'Rivals are short of cash and long on furnaces. You could be the buyer of last resort, the builder of first resort, or the one still standing.',
      opts: [
        { k: 'A', l: 'Buy distressed rivals at depression prices.', s: 'Two extra offers this chapter, at 60 percent of appraisal and hard terms.', dark: 1,
          fx: function (S) { S.offerBonus = 2; S.flags.bustT = S.t; } },
        { k: 'B', l: 'Build while steel and labor are cheap.', s: 'New capacity at 25 percent off this chapter.', fx: function (S) { S.buildDisc = 0.75; } },
        { k: 'C', l: 'Hoard cash.', s: 'Survive first; the bankers like you better for it.', fx: function (S) { S.flags.rateCutT = S.t + 2; } }
      ],
      hist: 'A model crossroads, not a documented decision: buying and building in a depression is the classic counter-cyclical play. The question is always whether you have the cash when everyone else does not.',
      src: [] },
    s11: { y: '1896', title: 'The Mesabi lease', notes: ['fn9'],
      ctx: 'The richest iron ore in the country lies in Minnesota’s Mesabi Range. John D. Rockefeller owns a great deal of it, along with the railroad and ore boats to move it.',
      opts: [
        { k: 'A', l: 'Lease Rockefeller’s mines through Henry Oliver at a low royalty; ship on his railroad and boats.', s: 'Cheap ore from the other titan.', hist: 1,
          fx: function (S) { S.m.ore *= 0.55; S.flags.mesabi = true; S.integ.push('ore (the Mesabi lease)'); } },
        { k: 'B', l: 'Buy your own ore lands and a fleet.', s: 'Owned outright, at a price.',
          can: function (S) { if (S.m.oreOwn) return 'You already own ore lands.'; var c = 0.4 * capTot(S) * capex(S); return room(S) < c ? 'Needs ' + fM(c) + '; you can fund ' + fM(room(S)) + '.' : null; },
          fx: function (S) { spend(S, 0.4 * capTot(S) * capex(S)); S.m.ore *= 0.62; S.m.oreOwn = 1; S.integ.push('ore lands and a fleet'); } },
        { k: 'C', l: 'Keep buying ore on the market.', s: 'No capital, no control.', fx: function (S) { S.flags.oreMarket = true; } }
      ],
      hist: 'In 1896 Frick and Henry Oliver leased Rockefeller’s Mesabi mines at a royalty of 25 cents a ton, Time reported, when other mines drew 65 cents. Oliver mined the ore, Rockefeller’s railroad and boats carried it, and Carnegie made it into steel.',
      src: S_('time', 'mnop') },
    s12: { y: '1899', title: 'Frick, then Morgan', notes: [],
      ctx: 'The partners’ [[ironclad|Iron-Clad Agreement]] lets you force him out at book value. His lawyers will say his stake is worth far more.',
      opts: [
        { k: 'A', l: 'Enforce the Iron-Clad Agreement: buy him out at book value.', s: 'The contract says book; the lawyers will say more.', hist: 1,
          fx: function (S, c) { var x = 0.05 * Math.max(0, EV(S)); spend(S, x); S.standing -= 4; S.flags.frickFight = true; S.flags.frickGone = true; c.out.push('Frick sues. The settlement costs ' + fM(x) + ', and the size of your company is now a matter of public record.'); } },
        { k: 'B', l: 'Pay him market value and part as friends.', s: 'Expensive, quiet.',
          fx: function (S, c) { var x = 0.10 * Math.max(0, EV(S)); spend(S, x); S.standing += 2; S.flags.frickGone = true; c.out.push('You pay ' + fM(x) + ' and shake hands. Nobody outside the office learns what the company is worth.'); } }
      ],
      hist: 'Invoking the Iron-Clad Agreement, Carnegie claimed Frick was owed book value, about $5 million. Frick sued in 1900, put Carnegie Steel’s assets above $250 million on the public record, and settled for shares worth over $30 million in a new company combining Carnegie Steel and Frick Coke.',
      src: S_('duane', 'pbsFrick') }
  };
  var BOOM = { NYC: ['Newtown Creek Refining', 'Greenpoint Oil Works', 'Kill van Kull Oil', 'Harlem River Refining'], PHL: ['Gray’s Ferry Oil Works', 'Delaware River Refining', 'Frankford Oil'],
    PIT: ['Sharpsburg Refining', 'Herrs Island Oil'], BAL: ['Canton Oil Works', 'Locust Point Refining'], REG: ['Oil City Refining', 'Rouseville Oil Works', 'Petroleum Centre Refining'], CLE: [] };
  function allianceOffers(S, c, pressure) {
    ['NYC', 'PIT', 'PHL'].forEach(function (city) {
      var r = live(S).filter(function (x) { return x.city === city && !canOffer(S, x); }).sort(function (a, b) { return b.cap - a.cap; })[0];
      if (!r) return;
      var res = offer(S, r.id, 'rich', 'stock', { pressure: pressure, quiet: true });
      c.out.push(res.text);
    });
  }
  function ohioSplit(S) { S.flags.trust = false; S.m.fixed *= 1.08; S.hc = Math.max(0, S.hc - 25); S.standing += 10; S.flags.split = true; }
  function newWorks(S, cap, eff, on) {
    var g = great(S);
    if (!g) { g = { id: 'p' + (S.nid++), name: 'New works', cap: 0, eff: eff, great: true, city: 'MON', acq: false, since: yr(S) + 1 }; S.plants.push(g); }
    S.pend.push({ cap: cap, pid: g.id, on: on });
  }
  function nameWorks(S, n) { var g = great(S); if (g) g.name = n; }
  function cokeCost(S) { return 2.5 * capex(S) / 0.02; }
  function lastShare(S) { var h = S.hist[S.hist.length - 1]; return h ? h.share : 0; }
  function homesteadRival(S) { return S.rivals.filter(function (r) { return r.alive && /^Homestead/.test(r.name); })[0] || null; }
  function duquesne(S) { return S.rivals.filter(function (r) { return r.alive && /^Duquesne/.test(r.name); })[0] || null; }
  function homesteadB(S, c, k) {
    var hs = ownsHomestead(S), w = worksName(S), pen = S.flags.unionLock ? 45 : S.flags.promise ? 37 : 25;
    S.m.wage *= 0.78; S.m.union = 0; S.m.shift12 = 1; S.flags.shiftLock = true; S.rel = 35; S.standing -= pen * k; S.capMult *= 0.95; S.m.labor *= 0.93;
    S.flags.unionBroken = true;
    if (hs) {
      harm(S, 'homestead', 'Homestead lockout: about 3,800 men shut out behind a fence', 2);
      harm(S, 'homestead', 'July 6, 1892: seven steelworkers and three Pinkerton agents killed (the most common count; accounts vary)', 2);
      harm(S, 'homestead', 'The union broken at Homestead', 2);
    } else {
      harm(S, 'homestead', 'Lockout at ' + w + ': the men shut out behind a fence', 2);
      harm(S, 'homestead', 'A gun battle between Pinkerton agents and locked-out men at ' + w + ' (at Homestead in 1892 it left seven workers and three Pinkertons dead, by the most common count)', 2);
      harm(S, 'homestead', 'The union broken at ' + w, 2);
    }
    c.out.push('The barges come up the river at dawn. The other ledger records what follows; the engine does not roll for it.');
  }
  function homesteadC(S, c, k) {
    S.capMult *= 0.7;
    if (S.rR() < 0.6) {
      S.m.wage *= 0.8; S.m.union = 0; S.rel = 20; S.standing -= 12 * k; S.flags.unionBroken = true;
      harm(S, 'homestead', 'The union starved out at ' + worksName(S), 1);
      c.out.push('By December the men come back one at a time, without the union.');
    } else { S.m.wage *= 0.9; S.rel = 35; S.standing -= 4 * k; c.out.push('By December both sides are broke enough to settle: a smaller cut, and the union survives.'); }
    if (S.rR() < 0.1) harm(S, 'homestead', 'Clashes at the gate', 0.5);
  }
  function optsOf(S, d) { return typeof d.opts === 'function' ? d.opts(S) : d.opts; }
  function crossFor(S) {
    var id = Tt(S).x;
    if (!id) return null;
    if (id === 'c9' && !(S.flags.trust || heat(S) >= 30)) return null;
    if (id === 's12' && !(S.flags.frick && !S.flags.frickGone)) return null;
    return { id: id, def: X[id], chosen: null, out: [], sub: null, subChosen: null };
  }
  function crossDone(S) { var c = S.cross; return !c || (c.chosen && (!c.sub || c.subChosen)); }
  function choose(S, key) {
    var c = S.cross;
    if (!c) return { ok: false };
    var opts, o;
    if (c.chosen && c.sub && !c.subChosen) {
      o = c.sub.filter(function (x) { return x.k === key; })[0];
      if (!o) return { ok: false };
      c.subChosen = key;
      if (o.fx) o.fx(S, c);
      var ch = S.choices[S.choices.length - 1];
      ch.label += ' Talks failed; then: ' + o.l;
      ch.hist = key === 'B';
      return { ok: true };
    }
    if (c.chosen) return { ok: false };
    opts = optsOf(S, c.def);
    o = opts.filter(function (x) { return x.k === key; })[0];
    if (!o) return { ok: false };
    var why = o.can ? o.can(S) : null;
    if (why) return { ok: false, text: why };
    c.chosen = key; c.label = o.l;
    if (o.fx) o.fx(S, c);
    S.choices.push({ id: c.id, t: S.t, year: c.def.y, title: c.def.title, key: key, label: o.l, hist: !!o.hist, model: !!c.def.model });
    (c.def.notes || []).forEach(function (n) { unlock(S, n, c.def.title + ', ' + c.def.y); });
    return { ok: true };
  }

  /* ---------------------------------------------------------------- the moves ---------------------------------------------------------------- */
  function acqPlants(S) { return S.plants.filter(function (p) { return p.acq && p.cap > 0; }); }
  function once(key) { return function (S) { return !!S.m[key]; }; }
  function giveModes(S) {
    var oil = S.camp === 'oil', big = oil ? (S.flags.stepBack || yEnd(S) > 1889) : yEnd(S) > 1895;
    return [
      { k: 'small', l: oil ? 'Give retail' : 'A library for a town', amt: 0.02 * S.personal, st: 3, ok: S.personal > 0.01 },
      { k: 'big', l: oil ? 'Give wholesale' : 'Endow an institute', amt: Math.max(oil ? 1 : 1, 0.1 * S.personal), st: 6, ok: big && S.personal >= 1,
        why: !big ? (oil ? 'Wholesale giving opens in 1889, or when you step back' : 'Institutes open in 1895') : S.personal < 1 ? 'Needs $1M of your own money' : null }
    ];
  }
  var INST_O = ['a new university in the Midwest', 'an institute for medical research', 'a board for schools in the South', 'a commission against hookworm', 'a foundation for the well-being of mankind'];
  var INST_S = ['a technical institute for Pittsburgh', 'an institution for scientific research', 'a pension fund for college teachers', 'an endowment for international peace', 'a trust for the libraries'];
  var MV = {
    o_build: { cat: 'Build', name: 'Build out the works', kind: 'build', note: 'fn4',
      eff: 'Add capacity to your biggest refinery, online next chapter. The bigger the works, the lower the refining cost per gallon.' },
    o_fold: { cat: 'Build', name: 'Fold the plants into the works', note: 'fn4',
      eff: 'Close the refineries you bought and rebuild their capacity at the works, at its scale and its efficiency.',
      need: function (S) { return acqPlants(S).length ? null : 'Needs a refinery you bought'; },
      cost: function (S) { return sum(acqPlants(S), function (p) { return p.cap; }) * capex(S) * 0.4; },
      go: function (S) {
        var a = acqPlants(S), mv = sum(a, function (p) { return p.cap; }), g = great(S), c = mv * capex(S) * 0.4;
        spend(S, c); g.cap += mv; S.plants = S.plants.filter(function (p) { return a.indexOf(p) < 0; }); S.folds++;
        note(S, 'Closed ' + a.length + ' ' + F.plural(a.length, 'refinery', 'refineries') + '; their crews let go');
        unlock(S, 'fn4', 'Folding plants into the works');
        return 'You close ' + a.length + ' ' + F.plural(a.length, 'refinery', 'refineries') + ' and rebuild ' + fmtCap(S, mv) + ' at ' + plantRef(g) + ' for ' + fM(c) + '.';
      } },
    o_chem: { cat: 'Squeeze', name: 'Hire chemists; sell the whole barrel', note: 'fn10',
      eff: 'Lubricants, paraffin and naphtha from every barrel: a by-product credit against the cost of kerosene. A second stage from 1882 also cuts refining cost.',
      done: function (S) { return S.m.chem >= 2; },
      need: function (S) { return S.m.chem === 1 && yEnd(S) <= 1882 ? 'The second stage opens in 1882' : null; },
      cost: function (S) { return S.m.chem ? 2.0 : 0.3; },
      go: function (S) {
        if (!S.m.chem) { spend(S, 0.3); S.m.byp += 0.5; S.m.chem = 1; unlock(S, 'fn10', 'Hiring chemists'); return 'Your chemists find money in what the river used to take: the by-product credit rises half a cent a gallon.'; }
        spend(S, 2.0); S.m.byp += 0.3; S.m.conv *= 0.9; S.m.chem = 2; return 'A research laboratory at the works: a richer barrel and a cheaper refining run.';
      } },
    o_coop: { cat: 'Integrate', name: 'Make your own barrels', year: 1870, note: 'fn9', done: once('coop'), cost: function () { return 0.5; },
      eff: 'Your own cooperage and timber: barrels and cars cost 45 percent less.',
      go: function (S) { spend(S, 0.5); S.m.coop = 1; S.m.cont *= 0.55; S.integ.push('barrels'); unlock(S, 'fn9', 'Making your own barrels'); return 'Your cooperage turns out barrels for less than the coopers charged, and on your schedule.'; } },
    o_tank: { cat: 'Integrate', name: 'Buy tank cars', year: 1872, note: 'fn9', done: once('tank'), cost: function () { return 1.0; },
      eff: 'Your own tank cars: cheaper containers and first claim on the rails.',
      go: function (S) { spend(S, 1.0); S.m.tank = 1; S.m.cont *= 0.8; S.m.access += 0.3; S.integ.push('tank cars'); unlock(S, 'fn9', 'Buying tank cars'); return 'Your tank cars roll. The railroads no longer decide whose oil waits for cars.'; } },
    o_term: { cat: 'Integrate', name: 'Control the New York terminals', year: 1874, note: 'fn9', done: once('term'), cost: function () { return 1.5; },
      eff: 'The docks where export oil meets the ships: lower freight, better access.',
      go: function (S) { spend(S, 1.5); S.m.term = 1; S.m.freight *= 0.9; S.m.access += 0.3; S.integ.push('the New York terminals'); unlock(S, 'fn9', 'The New York terminals'); return 'The terminals are yours. Export buyers now come through your gate.'; } },
    o_gather: { cat: 'Integrate', name: 'Gathering lines to the wells', year: 1874, note: 'fn11', done: once('gather'), cost: function () { return 3.0; },
      eff: 'Pipes from the wells to the railheads. Your freight falls, and rivals pay your [[pipage|pipage]].',
      go: function (S) { spend(S, 3.0); S.m.gather = 1; S.m.freight *= 0.85; S.m.access += 0.2; S.integ.push('gathering lines'); unlock(S, 'fn11', 'Gathering lines'); return 'Your gathering lines reach the wells. Every independent’s crude now pays you a toll on its way out.'; } },
    o_trunk: { cat: 'Integrate', name: 'Trunk lines to the sea', year: 1879, note: 'fn11', done: once('trunk'), cost: function () { return 8.0; },
      need: function (S) { return S.m.gather ? null : 'Needs gathering lines first'; },
      eff: 'Pipe instead of railroad to the coast: freight falls 40 percent, and the toll grows.',
      go: function (S) { spend(S, 8.0); S.m.trunk = 1; S.m.freight *= 0.6; S.m.access += 0.3; S.integ.push('trunk pipelines'); unlock(S, 'fn11', 'Trunk lines'); return 'Crude runs to the coast through your pipe. The railroads are now your customers’ problem.'; } },
    o_market: { cat: 'Integrate', name: 'Sell direct: tank wagons to the grocer', year: 1882, note: 'fn9', done: once('market'), cost: function () { return 5.0; },
      eff: 'Your own wagons and agents replace the jobbers: more customers, and 0.3¢ more per gallon.',
      go: function (S) { spend(S, 5.0); S.m.market = 1; S.m.access += 0.4; S.integ.push('marketing and tank wagons'); unlock(S, 'fn9', 'Selling direct'); return 'Your wagons deliver to the grocer’s door. The jobbers are gone, and so is their margin.'; } },
    o_offer: { cat: 'Buy', name: 'Make an offer', kind: 'offer', note: 'fn7', eff: 'Buy a rival for stock or cash. They say yes when your price beats what they think they are worth.' },
    o_rebate: { cat: 'Railroads', name: 'Ask for a volume rebate', year: 1870, dark: 1, note: 'fn5',
      done: function (S) { return !!S.m.rebate; }, cost: function () { return 0; },
      need: function (S) { return S.flags.ica === 'A' || S.flags.ica === 'C' ? 'You pledged published rates in 1887' : null; },
      eff: 'A secret discount for guaranteed volume, as the Lake Shore offered in 1868.',
      go: function (S) { rebateOn(S, 'Asking for a rebate'); return 'The road agrees, in private. Your freight falls; your rivals’ does not.'; } },
    o_draw: { cat: 'Dark', name: 'Collect drawbacks on rivals’ oil', year: 1877, dark: 1, ongoing: 'drawback', note: 'fn6',
      eff: 'The railroad pays you part of what your rivals pay it. They pay more; you are paid for it.',
      need: function (S) { return !S.m.rebate ? 'Needs a railroad rebate' : capShareNow(S) < 0.3 ? 'Needs 30 percent of the industry’s capacity' : null; },
      cost: function () { return 0; },
      go: function (S) { S.m.drawback = 1; unlock(S, 'fn6', 'Collecting drawbacks'); return 'The railroad agrees to pay you on every barrel your rivals ship.'; } },
    o_cut: { cat: 'Dark', name: 'Cut to kill in one rival’s market', year: 1877, dark: 1, kind: 'target', note: 'fn14',
      eff: 'Undersell one rival in its own towns this chapter. You pay the discount at the close; it pays with its customers.',
      cost: function () { return 0; },
      go: function (S, p) {
        var r = rivalById(S, p.rid);
        S.cuts.push(r.id); S.hcA += 5 * (S.t >= 8 ? 1.5 : 1);
        S.harms.push({ t: S.t, year: yr(S), kind: 'cut', rid: r.id, text: 'Cut to kill: ' + r.name, w: 1 });
        unlock(S, 'fn14', 'Cutting to kill');
        return 'Your agents undersell ' + r.name + ' in every town it serves. The bill arrives at the close.';
      } },
    o_spy: { cat: 'Dark', name: 'Buy the waybills', year: 1880, dark: 1, ongoing: 'spies', note: 'fn14', cost: function () { return 0.2; },
      eff: 'Railway clerks report every rival shipment: you see exact odds and every rival’s cash, your agents reach some of their customers first, and cutting to kill costs less.',
      go: function (S) {
        spend(S, 0.2); S.m.spies = 1; S.hcA += 4; S.rivals.forEach(function (r) { r.known = true; });
        if (!S.flags.spyHarm) { S.flags.spyHarm = true; harm(S, 'spies', 'Railway clerks paid to report rivals’ shipments', 1); }
        unlock(S, 'fn14', 'Buying the waybills');
        return 'The first reports arrive by the next train: who shipped what, to whom, at what price.';
      } },
    o_bogus: { cat: 'Dark', name: 'Sell through a “bogus” independent', year: 1886, dark: 1, ongoing: 'bogus', note: 'fn12', cost: function () { return 0.5; },
      eff: 'Companies that look independent and sell your oil to dealers who will not buy from you.',
      go: function (S) {
        spend(S, 0.5); S.m.bogus = 1;
        if (!S.flags.bogusHarm) { S.flags.bogusHarm = true; harm(S, 'bogus', 'Fake independent oil companies', 1); }
        unlock(S, 'fn12', 'The bogus independents');
        return 'The Liberty Oil Company opens in six states. Nobody who buys from it knows it is you.';
      } },
    o_give: { cat: 'Public', name: 'Give', year: 1870, kind: 'give', note: 'fn26', eff: 'Give from your own fortune. Gifts go in their own column and subtract from nothing in the other ledger.' },
    o_press: { cat: 'Public', name: 'Answer your critics', year: 1879, note: 'fn18', cost: function () { return 0.1; },
      eff: 'Interviews, pamphlets, friendly editors. Helps, unless your record is hotter than your prose.',
      go: function (S) {
        spend(S, 0.1); unlock(S, 'fn18', 'Answering your critics');
        if (S.hc > 40 && S.rR() < 0.35) { S.standing -= 6; return 'The interview runs next to a list of your rebates. It does not help.'; }
        S.standing += 5; return 'A calm interview in a friendly paper. Some readers come around.';
      } },
    o_divest: { cat: 'Law', name: 'Sell capacity to independents', year: 1890, note: 'fn17', cost: function () { return 0; },
      eff: 'Sell a fifth of your capacity at a discount to buyers who will compete with you. Less heat, more rivals.',
      go: function (S) { var r = sellCapacity(S, 0.2, 0.8, 'Divestiture'); S.hs = Math.max(0, S.hs - 10); S.standing += 3; return 'You sell ' + fmtCap(S, r.cap) + ' for ' + fM(r.cash) + '. The buyers will be rivals by the next chapter.'; } },

    s_build: { cat: 'Build', name: 'Build furnaces and mills', kind: 'build', note: 'fn4',
      eff: 'Add capacity at your main works, online next chapter. Bigger works, lower conversion cost per ton.',
      need: function (S) { var g = great(S); return !g ? 'Build the works first' : g.cap <= 0 ? 'Your works is still going up' : null; } },
    s_upgrade: { cat: 'Build', name: 'Rebuild a bought works to your standard', kind: 'plant', note: 'fn4',
      eff: 'Bring a works you bought up to your own works’ efficiency.',
      need: function (S) { return upgradable(S).length ? null : 'Needs a bought works below your standard'; } },
    s_cost: { cat: 'Squeeze', name: 'Install cost sheets', year: 1875, note: 'fn19', done: once('costSheets'), cost: function () { return 0.1; },
      eff: 'Cost by department and by ton, every day. Conversion falls 10 percent, and the cost sheet stops being one number.',
      go: function (S) { spend(S, 0.1); S.m.costSheets = 1; S.m.conv *= 0.9; unlock(S, 'fn19', 'Installing cost sheets'); return 'The first itemized cost sheet lands on your desk. Three departments are about to have a bad week.'; } },
    s_hard: { cat: 'Squeeze', name: 'Drive the furnaces', year: 1875, ongoing: 'hard', note: 'fn20', cost: function () { return 0; },
      eff: '15 percent more tons from the same furnaces and lower conversion; relining costs 3 percent of book a year, and the men pay too.',
      go: function (S) { S.m.hard = 1; unlock(S, 'fn20', 'Driving the furnaces'); return 'The furnaces run hotter and longer. The foremen stop asking what the linings will think.'; } },
    s_scrap: { cat: 'Squeeze', name: 'Scrap it for something better', year: 1878, note: 'fn21', cost: function (S) { return 0.2 * capTot(S) * capex(S); },
      done: function (S) { return S.m.scraps >= 3; },
      eff: 'Tear out working equipment for a better design. Conversion falls 10 percent each time (up to three).',
      go: function (S) { spend(S, 0.2 * capTot(S) * capex(S)); S.m.scraps++; S.m.conv *= 0.9; unlock(S, 'fn21', 'Scrapping for something better'); return 'A mill that worked fine last month is scrap by Friday. The new one is faster.'; } },
    s_oh: { cat: 'Squeeze', name: 'Build open hearths', year: 1886, note: 'fn4', done: once('oh'), cost: function (S) { return 0.35 * capTot(S) * capex(S); },
      eff: 'Slower, finer steel with controlled chemistry: conversion falls and structural buyers pay 2 percent more.',
      go: function (S) { spend(S, 0.35 * capTot(S) * capex(S)); S.m.oh = 1; S.m.conv *= 0.88; unlock(S, 'fn4', 'Building open hearths'); return 'The first [[hearth|open hearths]] are lit. The bridge builders like what they test.'; } },
    s_coke: { cat: 'Integrate', name: 'Build your own coke ovens', note: 'fn9', cost: function (S) { return 0.25 * capTot(S) * capex(S); },
      done: function (S) { return !!S.m.cokeOwn; },
      need: function (S) { return S.flags.frick ? 'Frick’s coke already feeds your furnaces' : !great(S) ? 'Build the works first' : null; },
      eff: 'Your own coke: a quarter off the fuel bill, and nobody to squeeze you.',
      go: function (S) { spend(S, 0.25 * capTot(S) * capex(S)); S.m.cokeOwn = 1; S.m.coke *= 0.75; S.flags.cokeContract = false; S.integ.push('coke ovens'); unlock(S, 'fn9', 'Your own coke'); return 'Your ovens glow along the Youghiogheny.'; } },
    s_rail: { cat: 'Integrate', name: 'Build your own railroad', year: 1883, note: 'fn9', done: once('rail'), cost: function (S) { return 0.3 * capTot(S) * capex(S); },
      eff: 'Your own line between the furnaces, the mills and the trunk railroads: freight falls 45 percent.',
      go: function (S) { spend(S, 0.3 * capTot(S) * capex(S)); S.m.rail = 1; S.m.freight *= 0.55; S.m.access += 0.2; S.integ.push('a railroad'); unlock(S, 'fn9', 'Your own railroad'); return 'Your locomotives now move your ore, your coke and your rails. The railroads quote you better rates overnight.'; } },
    s_ore: { cat: 'Integrate', name: 'Buy ore lands and a fleet', year: 1890, note: 'fn9', cost: function (S) { return 0.4 * capTot(S) * capex(S); },
      done: function (S) { return !!S.m.oreOwn; },
      need: function (S) { return S.flags.mesabi ? 'The Mesabi lease already feeds you' : null; },
      eff: 'Own the ore and the boats that carry it: the ore bill falls 38 percent.',
      go: function (S) { spend(S, 0.4 * capTot(S) * capex(S)); S.m.oreOwn = 1; S.m.ore *= 0.62; S.flags.oreMarket = false; S.integ.push('ore lands and a fleet'); unlock(S, 'fn9', 'Buying ore lands'); return 'Your ore boats clear the Soo locks.'; } },
    s_offer: { cat: 'Buy', name: 'Make an offer', kind: 'offer', note: 'fn7', eff: 'Buy a rival works for stock or cash. They say yes when your price beats what they think they are worth.' },
    s_men: { cat: 'Squeeze', name: 'Hire the best mill men you can find', note: 'fn19', done: once('men'), cost: function () { return 0.1; },
      eff: 'A superintendent who has run converters, and the crews who follow him: conversion 5 percent cheaper from the first heat, and relations +3.',
      go: function (S) { spend(S, 0.1); S.m.men = 1; S.m.conv *= 0.95; S.rel = clamp(S.rel + 3, 0, 100); return 'You hire a mill captain who has blown Bessemer heats before, at a salary the trade calls absurd, and let him pick his own crews.'; } },
    s_bonds: { cat: 'Finance', name: 'Sell railroad bonds in Europe', note: 'fn8', cost: function () { return 0; },
      done: function (S) { return S.m.bonds >= 2; },
      need: function (S) { return S.t >= 3 ? 'The works needs you more than London does' : null; },
      eff: 'Commissions on American railroad bonds placed with European bankers: about $0.3M for the works, less in a panic, and a season of your attention. Twice at most.',
      go: function (S) { var a = Tt(S).panic ? 0.15 : 0.3; S.cash += a; S.m.bonds++; return 'You spend a season in London and Frankfurt placing railroad bonds. The commissions, ' + fM(a) + ', go into the works.'; } },
    s_safety: { cat: 'Labor', name: 'Invest in safety', year: 1886, ongoing: 'safety', note: 'fn24', cost: function (S) { return 0.05 * capTot(S) * capex(S); },
      eff: 'Guards, lights, inspectors and fewer men in the pit: accidents fall a third, relations improve. $0.2M a chapter after the first year.',
      go: function (S) { spend(S, 0.05 * capTot(S) * capex(S)); S.m.safety = 1; return 'Railings go up around the pits and a safety inspector walks every turn.'; } },
    s_essay: { cat: 'Public', name: 'Write for the magazines', year: 1886, note: 'fn18', cost: function () { return 0; },
      done: function (S) { return S.m.essays >= 3; },
      eff: 'Essays on wealth, work and democracy. Each one helps less than the last.',
      go: function (S) { var g = [5, 3, 1][S.m.essays] || 0; S.m.essays++; S.standing += g; unlock(S, 'fn18', 'Writing for the magazines'); return 'Your essay runs in the North American Review. Standing +' + g + '.'; } },
    s_give: { cat: 'Public', name: 'Give', year: 1881, kind: 'give', note: 'fn25', eff: 'A library for a town, or later an institute. Gifts go in their own column and subtract from nothing in the other ledger.' }
  };
  var MOVES = {
    oil: ['o_build', 'o_offer', 'o_fold', 'o_chem', 'o_coop', 'o_tank', 'o_term', 'o_gather', 'o_trunk', 'o_market', 'o_rebate', 'o_draw', 'o_cut', 'o_spy', 'o_bogus', 'o_give', 'o_press', 'o_divest'],
    steel: ['s_build', 's_offer', 's_men', 's_bonds', 's_upgrade', 's_cost', 's_hard', 's_scrap', 's_oh', 's_coke', 's_rail', 's_ore', 's_safety', 's_essay', 's_give']
  };
  function capShareNow(S) { var g = going(S), KP = sum(S.plants, function (p) { return p.cap > 0 ? capE(S, p) : 0; }); return KP / Math.max(1e-9, g.K); }
  function upgradable(S) { var g = great(S); return g ? acqPlants(S).filter(function (p) { return p.eff > g.eff + 0.005; }) : []; }
  function buildChoices(S) {
    var Qn = Qnext(S), mx = buildMax(S), rm = room(S);
    var out = [0.10, 0.25, 0.50].map(function (f, i) {
      var add = Math.min(f * Qn, mx), c = buildCost(S, add);
      return { k: ['a', 'b', 'c'][i], label: '+' + Math.round(f * 100) + '%', add: add, cost: c, ok: c <= rm + 1e-9, capped: add < f * Qn - 1e-9 };
    });
    var fit = buildFit(S);
    if (!out[0].ok && fit > 0.005 * Qn) out.push({ k: 'fit', label: 'What you can fund', add: fit, cost: buildCost(S, fit), ok: true });
    return out;
  }
  /* the state of one move card: done, why it is closed, what it costs */
  function mvState(S, id) {
    var d = MV[id], st = { id: id, d: d, done: false, on: false, why: null, cost: d.cost ? d.cost(S) : null };
    if (d.ongoing && S.m[d.ongoing]) { st.on = true; st.done = true; return st; }
    if (d.done && d.done(S)) { st.done = true; return st; }
    var offerFree = d.kind === 'offer' && S.offerBonus > 0 && S.flags.bustT === S.t;
    if (S.phase !== 'play') st.why = 'The books are closed';
    else if (!crossDone(S)) st.why = 'Settle the crossroads first';
    else if (S.special && S.special.left > 0 && !S.special.done) st.why = 'Finish the six weeks in Cleveland first';
    else if (d.year && yEnd(S) <= d.year) st.why = 'Opens in ' + d.year;
    else if (d.kind === 'build' && S.t >= 11) st.why = 'Opens nothing: this is the last chapter';
    else if (S.camp === 'steel' && capTot(S) <= 0 && !/^s_(offer|give|essay|build|men|bonds)$/.test(id)) st.why = 'Your works is still going up';
    else if (d.need && d.need(S)) st.why = d.need(S);
    else if (movesLeft(S) <= 0 && !offerFree) st.why = 'No moves left this chapter';
    else if (st.cost != null && st.cost > room(S) + 1e-9) st.why = 'Costs ' + fM(st.cost) + '; you can fund ' + fM(room(S));
    else if (d.kind === 'offer' && !offerTargets(S).length) st.why = 'Nobody left to buy';
    else if (d.kind === 'target' && !live(S).length) st.why = 'Nobody left to cut';
    else if (d.kind === 'build' && !buildChoices(S).some(function (b) { return b.ok; })) st.why = 'You can fund ' + fM(room(S)) + ', not enough to build';
    else if (d.kind === 'give' && !giveModes(S).some(function (g) { return g.ok; })) st.why = 'Nothing of your own to give yet';
    return st;
  }
  function offerTargets(S) { return live(S).filter(function (r) { return !canOffer(S, r); }); }
  function useMove(S, id) { if (MV[id].kind === 'offer' && S.offerBonus > 0 && S.flags.bustT === S.t) S.offerBonus--; else S.used++; }
  function doMove(S, id, p) {
    p = p || {};
    var st = mvState(S, id), d = MV[id], text;
    if (st.done || st.why) return { ok: false, text: st.why || 'Done' };
    if (d.kind === 'build') {
      var b = buildChoices(S).filter(function (x) { return x.k === p.size; })[0];
      if (!b || !b.ok) return { ok: false, text: 'You cannot fund that.' };
      var c = build(S, b.add);
      text = 'You break ground on ' + fmtCap(S, b.add) + ' at ' + plantRef(great(S)) + ' for ' + fM(c) + '. It runs next chapter.';
    } else if (d.kind === 'offer') {
      var r = rivalById(S, p.rid);
      if (canOffer(S, r)) return { ok: false, text: canOffer(S, r) };
      var bust = S.offerBonus > 0 && S.flags.bustT === S.t, ctx = bust ? { level: 0.6, pressure: 1.2 } : null;
      var q = quote(S, r, p.lvl, p.pay, ctx);
      if (p.pay === 'cash' && q.price > room(S) + 1e-9) return { ok: false, text: 'You can fund ' + fM(room(S)) + ' in cash.' };
      var res = offer(S, r.id, p.lvl, p.pay, ctx);
      text = res.text;
    } else if (d.kind === 'target') {
      if (!rivalById(S, p.rid)) return { ok: false, text: 'Choose a rival.' };
      text = d.go(S, p);
    } else if (d.kind === 'plant') {
      var pl = plantById(S, p.pid), g = great(S);
      if (!pl || upgradable(S).indexOf(pl) < 0) return { ok: false, text: 'Choose a works.' };
      var cu = 0.3 * pl.cap * capex(S);
      if (cu > room(S)) return { ok: false, text: 'You can fund ' + fM(room(S)) + '.' };
      spend(S, cu); pl.eff = g.eff; unlock(S, 'fn4', 'Rebuilding ' + pl.name);
      text = 'You rebuild ' + pl.name + ' to the standard of ' + plantRef(g) + ' for ' + fM(cu) + '.';
    } else if (d.kind === 'give') {
      var gm = giveModes(S).filter(function (x) { return x.k === p.mode; })[0];
      if (!gm || !gm.ok) return { ok: false, text: gm && gm.why || 'Not yet.' };
      text = give(S, gm);
    } else text = d.go(S, p);
    useMove(S, id);
    S.feed.push(text);
    return { ok: true, text: text };
  }
  function give(S, gm) {
    var amt = Math.min(S.personal, gm.amt), oil = S.camp === 'oil', what;
    S.personal -= amt; S.giftTotal += amt; S.standing += gm.st;
    if (gm.k === 'small') {
      if (oil) what = 'Gifts to churches, missions and schools';
      else { S.libraries++; what = 'A free public library for a mill town (No. ' + S.libraries + ')'; unlock(S, 'fn25', 'Your first library'); }
    } else {
      var L = oil ? INST_O : INST_S, n = S.gifts.filter(function (g) { return g.big; }).length;
      what = 'Endowed ' + L[n % L.length];
      if (oil) unlock(S, 'fn26', 'Giving wholesale');
    }
    S.gifts.push({ t: S.t, year: yr(S), text: what, amt: amt, big: gm.k === 'big' });
    return what + ': ' + fM(amt) + ' of your own money. Standing +' + gm.st + '.';
  }
  function stopMove(S, id) {
    var d = MV[id];
    if (!d.ongoing || !S.m[d.ongoing]) return;
    S.m[d.ongoing] = 0;
    S.feed.push('You stop: ' + d.name.charAt(0).toLowerCase() + d.name.slice(1) + '.');
  }
  function closePlant(S, pid) {
    var p = plantById(S, pid);
    if (!p || p.great) return;
    var val = p.cap * capex(S) * 0.2;
    S.cash += val;
    S.plants = S.plants.filter(function (x) { return x !== p; });
    note(S, 'Closed ' + p.name + '; its crew let go');
    unlock(S, 'fn2', 'Closing a plant');
    S.feed.push('You close ' + p.name + ' and sell the equipment for ' + fM(val) + '.');
  }
  /* the Cleveland round's terms: a threat lowers the price a seller will take (disc) and raises the odds (pressure) */
  function spCtx(sp, lvl) { return { pressure: sp.pressure, level: (LEVEL[lvl] || 1) * (sp.disc || 1) }; }
  function specialOffer(S, rid, lvl, pay) {
    var sp = S.special;
    if (!sp || sp.left <= 0 || sp.done) return { ok: false };
    var r = rivalById(S, rid);
    if (canOffer(S, r)) return { ok: false, text: canOffer(S, r) };
    var sx = spCtx(sp, lvl);
    if (pay === 'cash' && quote(S, r, lvl, pay, sx).price > room(S) + 1e-9) return { ok: false, text: 'You can fund ' + fM(room(S)) + ' in cash.' };
    var res = offer(S, rid, lvl, pay, sx);
    sp.left--; sp.res[rid] = res.text;
    if (sp.left <= 0) sp.done = true;
    return res;
  }

  /* ---------------------------------------------------------------- closing the books ---------------------------------------------------------------- */
  function closeBooks(S) {
    if (S.phase !== 'play' || !crossDone(S)) return null;
    if (S.special && !S.special.done) S.special.done = true;
    var C = Cf(S), T = Tt(S), g = T.g, y = yOf(S), oil = S.camp === 'oil', m = S.m, d97 = Math.pow(0.97, y), G = C.G, t = S.t;
    var pY = pYof(S);
    S.news = [];
    /* 1. the season's luck, then the market */
    var shock = Math.exp(0.06 * S.rM.normal()) * (T.shock || 1);
    var base = S.cuts.length ? clear(S, pY, { shock: shock, noCut: true }) : null;
    var res = clear(S, pY, { shock: shock });
    pY = res.pY;
    /* 2. fees, the P&L, dividends */
    var fees = 0;
    if (oil) {
      if (m.drawback) { var dt = 0.9 * d97 * 1.0 * res.rivalVol * G; fees += dt; S.drawbackTake += dt * g; }
      if (S.flags.sicLive === t) { var ds = 1.2 * d97 * 0.5 * res.rivalVol * G; fees += ds; S.drawbackTake += ds * g; }
      var prate = (m.gather ? 0.3 : 0) + (m.trunk ? 0.3 : 0) + (S.flags.tideA ? 0.1 : 0);
      if (prate) fees += prate * d97 * 0.6 * res.rivalVol * G;
      if (m.rebate) S.rebateSaved += 0.9 * d97 * res.qP * G * g;
    }
    var rate = (T.panic ? 0.10 : 0.07) - (S.flags.rateCutT > t ? 0.01 : 0);
    var annual = res.op + fees + (S.flags.side ? 0.15 : 0) - S.debt * rate - (m.hard ? 0.03 * book(S) : 0);
    S.cash += annual * g;
    var div = Math.max(0, annual) * S.payout * g;
    S.cash -= div; S.personal += div * S.own;
    if (m.safety) S.cash -= 0.2;
    /* 3. the bill for cutting to kill */
    S.cuts.forEach(function (id) {
      var f = base ? base.rv.filter(function (x) { return x.id === id; })[0] : null, qT = f ? f.q : 0, r = rivalById(S, id);
      var cost = 0.2 * res.pM * qT * G * g * (m.spies ? 0.5 : 1);
      S.cash -= cost; S.cutCost += cost;
      if (r) S.cutBuyCost += appraise(S, r).A;
    });
    if (pY < 0.95 * res.ph) S.undercutChapters++;
    /* 4. the rivals' books; who fails */
    res.rv.forEach(function (f) { var r = f.o, pr = (res.pM - f.v) * f.q * G - Fc(S, r.cap); r.cash += pr * g; r.lastPr = pr; r.lastQ = f.q; r.lastV = f.v; });
    var failed = [];
    live(S).forEach(function (r) {
      if (r.cash >= -2 * Fc(S, r.cap)) return;
      r.alive = false; r.failedT = t; failed.push(r);
      if (S.cuts.indexOf(r.id) >= 0) {
        S.cutRuined++;
        S.harms.forEach(function (h) { if (h.kind === 'cut' && h.rid === r.id && h.t === t) h.text = 'Cut to kill: ' + r.name + ', which failed'; });
      } else if (pY < 0.95 * res.ph) harm(S, 'ruined', r.name + ' failed while you were undercutting the market', 1);
      else note(S, r.name + ' failed in a glutted market');
    });
    if (failed.length && pY < 0.9 * res.ph) unlock(S, 'fn14', 'Undercutting while ' + failed[0].name + ' failed');
    /* 5. consumers against the new-entrant benchmark */
    var cent = centOf(S);
    S.consumer += (cent - res.pM) * res.D * G * g * res.share;
    /* 6. exposures, in a fixed order */
    if (oil && m.rebate && m.rebMode === 'secret' && !m.rebExposed && S.rR() < 0.15) { m.rebExposed = true; S.standing -= 6; S.hcA += 4; S.rec += 6; say(S, 'A clerk’s ledger reaches the newspapers: your rebate is public.'); }
    if (m.drawback && !S.flags.drawExp && S.rR() < 0.25) { S.flags.drawExp = true; S.standing -= 12; S.rec += 6; say(S, 'Independents learn they have been paying you on every barrel.'); }
    if (m.spies && !S.flags.spyExp && S.rR() < 0.2) { S.flags.spyExp = true; S.standing -= 8; S.rec += 6; say(S, 'A railway clerk confesses whom he was reporting to.'); }
    if (m.bogus && !S.flags.bogusExp && S.rR() < 0.3) { S.flags.bogusExp = true; S.standing -= 8; S.hcA += 6; S.rec += 6; say(S, 'A dealer discovers his “independent” supplier is you.'); }
    if (S.flags.circT === t && S.rR() < 0.35) { S.standing -= 10; say(S, 'An engineer tells a trade journal your circular was nonsense.'); }
    /* 7. heat */
    if (m.rebate) S.hcA += 2 * (t >= 10 ? 4 : t >= 7 ? 2 : 1);
    if (m.drawback) { S.hcA += 8; S.rec += 4; harm(S, 'drawback', 'Drawbacks collected on rivals’ shipments, ' + yr(S) + ' to ' + yEnd(S), 1); }
    if (m.spies) S.hcA += 2;
    if (m.bogus) S.hcA += 3;
    S.hc = Math.max(0, S.hc * 0.8 + S.hcA); S.hcA = 0;
    S.hs = S.hs * 0.8 + T.law * (Math.max(0, res.share - 0.7) * 40 + Math.max(0, res.pM / cent - 1.1) * 60) * (1 + (50 - S.standing) / 100) * (S.flags.split ? 0.7 : 1);
    /* 8. standing */
    var prev = S.hist.length ? S.hist[S.hist.length - 1].pM : null;
    S.standing += (50 - S.standing) * 0.1;
    if (prev) { if (res.pM <= 0.9 * prev) S.standing += 2; else if (res.pM >= 1.1 * prev) S.standing -= 3; }
    S.standing = clamp(S.standing, 0, 100);
    /* 9. the state attorneys general (oil, from 1890) */
    if (oil && t >= 8 && heat(S) > 50) {
      var H = heat(S);
      if (S.rR() < (H - 50) / 100) { var fine = 0.02 * Math.max(0, EV(S)) * (H - 50) / 50; S.cash -= fine; S.fines = (S.fines || 0) + fine; say(S, 'A state attorney general files suit against one of your companies. The settlement costs ' + fM(fine) + '.'); }
    }
    /* 10. the mills: relations and the dead */
    if (!oil) {
      S.rel += (m.shift12 ? -2 : 2) + (m.hard ? -3 : 0) + S.wageDelta + (m.union ? 1 : 0) + (S.flags.frick && !S.flags.frickGone && t >= 7 ? -2 : 0) + (m.safety ? 2 : 0);
      S.rel += (50 - S.rel) * 0.1; S.rel = clamp(S.rel, 0, 100);
      if (S.wageAct < 0 && capTot(S) > 0) { S.cutStreak++; harm(S, 'wages', 'Wages cut 10 percent at ' + worksName(S) + ', ' + yr(S) + ' to ' + yEnd(S), 0.5); }
      else S.cutStreak = 0;
      var W = capTot(S) * 20 * Math.pow(0.95, y);
      if (W > 0) {
        var r0 = 0.0028 / 1.5, lam = W * r0 * (m.shift12 ? 1.2 : 0.9) * (m.hard ? 1.25 : 1) * (m.safety ? 0.65 : 1) * g, lamB = W * r0 * 0.9 * 0.65 * g;
        var nd = Math.round(lam);
        S.deaths += nd; S.deathsExcess += Math.max(0, nd - lamB);
        if (m.shift12) S.workers12 += W * g;
        if (nd > 0) { harm(S, 'deaths', 'Deaths in your mills, ' + yr(S) + ' to ' + yEnd(S) + ': about ' + nd + ' (model estimate)', 0); unlock(S, 'fn24', 'Your mills, ' + yr(S)); }
      }
    }
    /* 11. rivals build toward what the next chapter will need */
    var newPlants = 0;
    if (t < 11) {
      var mrel = (res.pM - cent) / res.pM, KR = sum(live(S), function (r) { return r.cap; }), KPn = capTot(S) + capPend(S), Qn = Qnext(S);
      var tgt = Math.max(0, Qn / 0.85 * clamp(0.95 + 1.5 * mrel, 0.75, 1.3) - KPn);
      if (tgt > KR) {
        var dK = Math.min(tgt - KR, Math.max(KR, 0.05 * Qn) * 0.5 * g), prof = live(S).filter(function (r) { return r.lastPr > 0; });
        var shNew = prof.length ? 0.4 : 1, pc = sum(prof, function (r) { return r.cap; });
        prof.forEach(function (r) { r.cap += dK * (1 - shNew) * r.cap / pc; });
        var n = 1 + Math.floor(S.rM() * 2);
        for (var j = 0; j < n; j++) entrant(S, dK * shNew / n);
        newPlants = n;
        unlock(S, 'fn13', 'New plants, ' + yr(S) + ' to ' + yEnd(S));
      }
    }
    /* 12. history's own arrivals */
    if (oil && t === 1) {
      /* the refinery boom: every refining town builds toward its 1872 weight (Tarbell: Cleveland, New York and the Oil Regions near 10,000 barrels a day each) */
      var tg = 2.2 * Qnext(S), wt = { CLE: 0.22, REG: 0.21, NYC: 0.21, PIT: 0.13, PHL: 0.15, BAL: 0.08 };
      [['Superior Street Oil Works', 'CLE'], ['Lakeside Refining', 'CLE'], ['Pithole Creek Refining', 'REG']].forEach(function (e) { addRival(S, e[0], e[1], 0.6, 1.02, { stub: 1.0 }).fresh = 1; });
      var each = 0.05 * tg;
      Object.keys(wt).forEach(function (c) {
        var want = wt[c] * tg - (c === 'CLE' ? capTot(S) + capPend(S) : 0), rs = live(S).filter(function (r) { return r.city === c; }), have = sum(rs, function (r) { return r.cap; });
        if (have > 0 && want > have) rs.forEach(function (r) { var k = Math.min(want / have, Math.max(1, each / r.cap)); r.cap *= k; r.cash *= k; });
        have = sum(live(S).filter(function (r) { return r.city === c; }), function (r) { return r.cap; });
        var names = BOOM[c] || [], i = 0;
        while (want - have > 0.25 * each && i < names.length) { var add = Math.min(0.8 * each, want - have); addRival(S, names[i++], c, add, 1.0, { stub: 1.0 }).fresh = 1; have += add; }
      });
      /* the new stills were bought on credit: the whole trade enters 1872 with thin cash, the newest refiners already in debt */
      live(S).forEach(function (r) { r.cash = r.fresh ? -0.4 * Fc(S, r.cap) : Math.min(r.cash, 1.0 * Fc(S, r.cap)); r.fresh = 0; });
      newPlants += 3;
      say(S, 'Stills are going up faster than wells. By the winter there will be room to refine more than two barrels for every one the creeks produce.');
    }
    if (oil && t === 10) {
      var Qx = Qnext(S);
      addRival(S, 'Sabine Refining', 'TEX', 0.10 * Qx, 0.90, { noBuy: true }); addRival(S, 'Neches Oil', 'TEX', 0.06 * Qx, 0.90, { noBuy: true });
      addRival(S, 'Red Fork Refining', 'NEW', 0.08 * Qx, 0.95, { noBuy: true }); addRival(S, 'Kern Valley Oil', 'NEW', 0.06 * Qx, 0.95, { noBuy: true });
      newPlants += 4;
    }
    if (!oil && t === 10) {
      var big3 = live(S).filter(function (r) { return !r.scripted && !r.noBuy; }).sort(function (a, b) { return b.cap - a.cap; }).slice(0, 3);
      if (big3.length >= 2) {
        var cap3 = sum(big3, function (r) { return r.cap; }), eff3 = sum(big3, function (r) { return r.eff * r.cap; }) / cap3 * 0.92;
        big3.forEach(function (r) { r.alive = false; r.goneT = t; });
        var nc = addRival(S, 'The new combination', 'IL', cap3, eff3, { noBuy: true, owner: 'Its bankers' });
        nc.cash = sum(big3, function (r) { return Math.max(0, r.cash); }) + 1.5 * Fc(S, cap3);
        say(S, 'Bankers are merging your rivals into combinations with ore, mills and railroads of their own. Federal Steel, organized with J. P. Morgan’s backing in 1898, is one.');
      }
    }
    /* 13. the bankers */
    var crisis = false;
    if (S.cash < 0) {
      var need = -S.cash, can = Math.max(0, limit(S) - S.debt);
      if (can >= need) { S.debt += need; S.cash = 0; }
      else {
        S.debt += can; S.cash += can;
        var sold = acqPlants(S).sort(function (a, b) { return a.cap - b.cap; });
        while (S.cash < 0 && sold.length) {
          var p = sold.shift(), val = 0.5 * p.cap * capex(S) * 0.5;
          S.cash += val; S.plants = S.plants.filter(function (x) { return x !== p; });
          addRival(S, p.name, p.city, p.cap, p.eff, { stub: 1.1 });
          say(S, 'To cover the hole you sell ' + p.name + ' for ' + fM(val) + '.');
        }
        if (S.cash < 0) {
          crisis = true; S.crises++; S.own *= 0.75; S.cash = 0;
          say(S, 'The bankers cover the hole and take a quarter of your stake for the favor.');
          if (S.crises >= 2) { S.over = 'receivership'; S.overT = t; }
        }
      }
    }
    /* 14. the record */
    var gp = going(S);
    S.lastAnnual = [S.lastAnnual[1], annual];
    var h = { t: t, year: yr(S), y2: yEnd(S), pM: res.pM, pY: pY, ph: res.ph, cent: cent, entry: 1.15 * cent, share: res.share, capShare: res.capShare,
      unitAll: res.unitAll, unitVar: res.unitVar, annual: annual, cash: S.cash, debt: S.debt, KP: res.KP, K: res.K, U: res.U, D: res.D, qP: res.qP,
      hc: S.hc, hs: S.hs, heat: heat(S), standing: S.standing, rel: S.rel, own: S.own, fortune: fortune(S), failed: failed.length, entrants: newPlants,
      rivalsAlive: live(S).length, fees: fees, crisis: crisis, shock: shock, g: g };
    S.hist.push(h);
    if (res.U < 0.6 || gp.U < 0.6) unlock(S, 'fn3', 'Oversupply, ' + yr(S));
    if (res.rv.some(function (f) { return f.v > res.pM; }) || res.qP < 0.7 * res.KP) unlock(S, 'fn2', 'The books for ' + yr(S) + ' to ' + yEnd(S));
    if (res.capShare > 0.4) unlock(S, 'fn12', 'Holding ' + F.pct(res.capShare) + ' of capacity');
    S.pend = S.pend.filter(function (x) { if (x.on <= t + 1) { var pl = plantById(S, x.pid); if (pl) pl.cap += x.cap; return false; } return true; });
    S.cutsLast = S.cuts.slice();
    S.rivals = S.rivals.filter(function (r) { return r.alive || (r.failedT === t); });
    var sum1 = 'The books for ' + yr(S) + ' to ' + yEnd(S) + ': ' + (annual >= 0 ? 'profit ' : 'a loss of ') + fM(Math.abs(annual)) + ' a year, a ' + F.pct(res.share) + ' share, market price ' + fmtP(S, res.pM) + '. ' +
      (failed.length ? failed.length + ' ' + F.plural(failed.length, 'rival') + ' failed' : 'No rival failed') + '; ' + (newPlants ? newPlants + ' new ' + F.plural(newPlants, 'plant') + ' went up.' : 'nobody new built.');
    S.news.unshift(sum1);
    S.lastClose = { h: h, res: res, failed: failed.map(function (r) { return r.name; }), summary: sum1 };
    S.t++; S.feed = [];
    if (S.flags.waitMore && S.t === 2) { newWorks(S, 60, 1.0, 3); spend(S, 1.2); S.flags.worksCost = 1.2; S.flags.waitMore = false; say(S, 'The panic is ending and you break ground at last, at full price. The works will run in 1878.'); }
    if (S.over) { S.phase = 'dist'; S.news.push('The bankers call your loans. The receivers take the works.'); return h; }
    if (S.t >= 12) {
      S.cross = null; S.special = null;
      if (oil) { S.phase = 'verdict'; S.verdict = { heard: false }; unlock(S, 'fn17', 'The verdict'); }
      else { S.phase = 'morgan'; S.morgan = { conneaut: false, mult: 10, done: false, z: 0.9 + 0.2 * S.rR(), cred: S.rR() < 0.7 }; unlock(S, 'fn27', 'Morgan’s question'); }
      return h;
    }
    startChapter(S);
    return h;
  }

  /* ---------------------------------------------------------------- the endgames ---------------------------------------------------------------- */
  function pBreak(S) {
    if (S.flags.selfSplit) return 1;
    var h = S.hist[S.hist.length - 1], share = h ? h.share : 0;
    return clamp(0.03 + 0.008 * S.hc + 0.004 * S.hs + 0.01 * S.rec + 0.6 * Math.max(0, share - 0.7) - 0.004 * (S.standing - 50), 0.03, 0.95) * (S.flags.posture || 1);
  }
  function hearVerdict(S) {
    if (!S.verdict || S.verdict.heard) return S.verdict;
    var p = pBreak(S);
    S.verdict.p = p;
    S.verdict.dissolved = S.flags.selfSplit ? true : S.rR() < p;
    S.verdict.heard = true;
    return S.verdict;
  }
  function morganValue(S, conneaut) {
    var M0 = S.morgan || {};
    return 12 * Math.max(0, S.lastAnnual[1]) * (conneaut && M0.cred !== false ? 1.15 : 1) * (S.flags.frickFight ? 0.95 : 1) * (heat(S) >= 40 ? 0.9 : 1) * (M0.z || 1);
  }
  function sellToMorgan(S, mult, conneaut) {
    var M0 = S.morgan;
    if (!M0 || M0.done) return M0;
    var conCost = 0;
    if (conneaut && !M0.conneautPaid) { conCost = 0.03 * Math.max(0, EV(S)); spend(S, conCost); M0.conneautPaid = true; M0.conCost = conCost; }
    var ask = mult * Math.max(0, S.lastAnnual[1]), M = morganValue(S, conneaut);
    M0.mult = mult; M0.ask = ask; M0.M = M; M0.conneaut = conneaut; M0.done = true;
    /* the tube works was paid for out of the company Morgan is buying: your stake of its cost comes off your proceeds */
    if (mult > 0 && ask <= M) { M0.sold = true; S.proceeds = Math.max(0, S.own * (ask - conCost)); S.personal += S.proceeds; S.sold = true; }
    else holdout(S, M0);
    return M0;
  }
  function holdout(S, M0) {
    var k = 0.75 + 0.4 * S.rR();
    M0.sold = false; M0.k = k;
    S.holdFortune = S.own * Math.max(0, EV(S)) * k + S.personal;
    S.personal = S.holdFortune; S.sold = true;
  }
  function refuseMorgan(S, conneaut) {
    var M0 = S.morgan;
    if (!M0 || M0.done) return M0;
    if (conneaut && !M0.conneautPaid) { spend(S, 0.03 * Math.max(0, EV(S))); M0.conneautPaid = true; }
    M0.done = true; M0.refused = true; M0.M = morganValue(S, conneaut); M0.conneaut = conneaut;
    holdout(S, M0);
    return M0;
  }
  var CAUSES = ['Libraries', 'Universities', 'Medical research', 'Public health campaigns', 'Teachers’ pensions', 'Peace', 'Science', 'Your hometown'];
  var MODES = [
    { k: 'family', l: 'Leave it to your family.', s: 'Carnegie called this “the most injudicious” of the three.' },
    { k: 'bequest', l: 'Bequeath it for public use when you die.', s: 'Carnegie’s objection: the good waits for your death, and wills are often not carried out as intended.' },
    { k: 'living', l: 'Give it away while you live.', s: 'Carnegie called this “the true antidote” for the unequal distribution of wealth.' }
  ];
  function settle(S, mode, causes) {
    var md = MODES.filter(function (x) { return x.k === mode; })[0];
    if (!md) return;
    S.dist = { mode: mode, causes: (causes || []).slice(0, 3), fortune: fortune(S) };
    var cz = S.dist.causes.length ? S.dist.causes.join(', ').toLowerCase() : 'no causes named';
    S.gifts.push({ t: 12, year: S.over ? yr(S) : Cf(S).end, big: true, amt: 0,
      text: mode === 'family' ? 'The estate left to the family' + (S.dist.causes.length ? ', with small bequests to ' + cz : '') : mode === 'bequest' ? 'The estate bequeathed at death to ' + cz : 'A pledge to give the fortune away while living: ' + cz });
    unlock(S, 'fn25', 'The distribution');
    if (S.dist.causes.indexOf('Medical research') >= 0 || S.dist.causes.indexOf('Public health campaigns') >= 0) unlock(S, 'fn26', 'The distribution');
    S.phase = 'end';
  }

  /* ---------------------------------------------------------------- endings ---------------------------------------------------------------- */
  function finalShare(S) { var h = S.hist[S.hist.length - 1]; return h ? h.share : 0; }
  function ending(S) {
    var oil = S.camp === 'oil', C = Cf(S), sh = finalShare(S), e;
    if (S.over) {
      var pan = S.overT != null && C.T[S.overT] && C.T[S.overT].panic;
      e = oil ? { k: 'recv', title: 'The receivership', text: (pan ? 'The panic found you with more plant than cash.' : 'Prices broke while your debts were at their longest.') + ' The refineries you built will make someone else rich. That story is as old as the business, and now it is yours.' }
        : { k: 'recv', title: pan ? 'The panic’s casualty' : 'The receivership', text: (pan ? 'A depression arrived while your debts were at their longest.' : 'Prices broke while your debts were at their longest.') + ' The bankers kept the works, and a rival will buy it from them at a price that would have saved you.' };
      var root = { s1C: 'Waiting out 1872 left you a year behind and short of cash when the trouble came.', s2B: 'The pause in 1873 left you a year late and short of cash when the trouble came.', s2Bw: 'Waiting until 1875 to build left you small and short of cash when the trouble came.', s4A: 'The pool’s quota kept your mills idle while your debts ran on.' }[S.flags.rootRisk];
      if (root) e.text += ' ' + root;
    }
    else if (oil) {
      var V = S.verdict || {};
      if (S.flags.selfSplit) e = { k: 'self', title: 'The self-dissolution', text: 'You broke up your own company before a court could. The pieces were worth more apart, which the market would have told you in about a year.' };
      else if (V.dissolved && sh >= 0.5) e = { k: 'dissolved', title: 'The trust, dissolved', text: 'The Court read the whole record' + (S.flags.sic ? ', from the South Improvement Company to the last rebate,' : '') + ' and ordered you taken apart. Your successor companies will be household names for a century. So will you.' };
      else if (!V.dissolved && sh >= 0.5 && S.hc < 25) e = { k: 'charter', title: 'The monopolist who kept the charter', text: 'You held most of the market and kept most of the record clean, and the rule of reason read it that way. History never tested this path; the engine says it is possible and expensive.' };
      else if (!V.dissolved && sh >= 0.5) e = { k: 'narrow', title: 'The narrow escape', text: 'The Court came close. Your lawyers will credit the brief; the chart suggests it was the price.' };
      else if (V.dissolved) e = { k: 'dissolved2', title: 'Dissolved anyway', text: 'You never owned the market, and the Court took you apart for how you competed for it. Conduct, not size, was the charge.' };
      else if (sh >= 0.2) e = { k: 'indep', title: 'The great independent', text: 'You never owned the market, and nobody could quite take it from you.' };
      else e = { k: 'also', title: 'An also-ran with good books', text: 'Your costs were fine. The oil business rewarded whoever was biggest by the end of 1872.' };
    } else {
      var M0 = S.morgan || {};
      if (M0.sold && M0.ask >= 400) e = { k: 'deal', title: 'The deal of the century', text: 'You wrote a number on a slip of paper and the most powerful banker in America said yes. What you do with it is the last chapter.' };
      else if (M0.sold) e = { k: 'early', title: 'The early exit', text: 'A fair price for the company you had, and a poor one for the company you could have had.' };
      else e = { k: 'hold', title: 'The holdout', text: 'The combinations spend the next years fighting you for every order. ' + (M0.k > 1 ? 'You won the war and nobody paid you for it.' : 'You were right about the tube works and wrong about Morgan’s patience.') };
    }
    var subs = [], nh = harmsW(S) + (oil ? 0 : S.deathsExcess / 50);
    if (nh >= 10) subs.push('and a long other ledger'); else if (nh <= 2 && (oil || S.deathsExcess <= 0.25 * S.deaths)) subs.push('with clean hands');
    if (S.consumer > 0) subs.push('and cheaper ' + Cf(S).light);
    if (!oil && S.flags.unionBroken && S.m.shift12) subs.push('run by the hard-driving rule');
    else if (!oil && S.m.union && !S.m.shift12) subs.push('run as a fair employer');
    e.sub = subs.slice(0, 2).join(', ');
    return e;
  }

  /* ---------------------------------------------------------------- what history did, in one line per crossroads ---------------------------------------------------------------- */
  var HSHORT = {
    c1: 'Took the secret rebate on the Lake Shore.', c2: 'Incorporated with $1 million; Rockefeller kept 26.7 percent.',
    c3: 'Joined; then bought at least 21 of Cleveland’s 26 refineries in about six weeks.', c4: 'Secret alliances with Warden, Lockhart and Pratt, paid in stock.',
    c5: 'Fought and won; bought Empire’s pipes, cars and refineries for $3.4 million.', c6: 'Fought Tidewater, then bought about a third and made it an ally.',
    c7: 'Formed the trust: 40 companies, nine trustees.', c8: 'No single historical answer.', c9: 'Dissolved on paper into 20 companies with the same owners.',
    c10: 'Retired from active leadership in 1896, at 57.', c11: 'No single historical answer.', c12: 'Fought to the Supreme Court, and lost in 1911.',
    s1: 'Put everything into the Edgar Thomson works.', s2: 'Kept building through the depression.', s3: 'Named it for J. Edgar Thomson.',
    s4: 'No single historical answer.', s5: 'Took Frick in and bought control of his coke.', s6: 'Bought Homestead in 1883.',
    s7: 'Published: the right to organize is “no less sacred.”', s8: 'Sent the circular; bought Duquesne for $1 million in bonds.',
    s9: 'Carnegie and Frick’s plan: the lockout, the Pinkertons, the union broken.', s10: 'No single historical answer.', s11: 'Leased the Mesabi mines at 25 cents a ton.',
    s12: 'Enforced the Iron-Clad; Frick sued and settled for over $30 million.'
  };

  /* ---------------------------------------------------------------- lessons, tied to what the player did ---------------------------------------------------------------- */
  function lessons(S) {
    var oil = S.camp === 'oil', H = S.hist, C = Cf(S), u = C.unit, out = [], P = function (v) { return fmtP(S, v); };
    var fin = H.filter(function (h) { return isFinite(h.unitAll); }), first = fin[0], last = fin[fin.length - 1];
    function add(k, cond, o) { if (cond) { o.k = k; out.push(o); } }
    var drop = first && last ? (first.unitAll - last.unitAll) / first.unitAll : 0;
    add('L1', !!first, { title: 'Cost is the moat',
      you: 'Your all-in cost to make a ' + u + ' went from ' + P(first ? first.unitAll : NaN) + ' to ' + P(last ? last.unitAll : NaN) + ', ' + F.pct(Math.abs(drop)) + (drop >= 0 ? ' lower.' : ' higher.'),
      principle: (drop >= 0.6 ? 'That is the moat. Every other lever in this game works better for whoever is cheapest.' : 'The titans’ first obsession was cost, because every other lever works better for whoever is cheapest. Yours fell less than theirs did.') +
        (oil ? ' The levers in the other ledger are not free money: the secret rebate pays handsomely in this engine, while drawbacks, spies and the South Improvement Company mostly buy speed and send their bill, in standing, heat and the record, before the books close.' : ' The hard levers on labor buy tons and dollars in this engine, and their bill goes to the other ledger, where no profit can net against it.'),
      history: oil ? 'Zorina Khan puts kerosene at about 30 cents a gallon in 1870 and about 6 cents two decades later.' : 'Carnegie’s first ton of steel cost about $56 to make; by 1900 it cost about $11.50.',
      src: oil ? S_('khan') : S_('uf') });
    if (oil && S.folds > 0) {
      var g = great(S), pa = {}, med = live(S).map(function (r) { return r.cap; }).sort(function (a, b) { return a - b; });
      vcost(S, g.cap, g.eff, g.city, true, pa);
      var pr = {}; vcost(S, med.length ? med[med.length >> 1] : 1, 1, 'NEW', false, pr);
      add('L2', true, { title: 'Scale shows up in the refining line',
        you: 'You folded bought plants into one great works ' + (S.folds === 1 ? 'once' : S.folds === 2 ? 'twice' : S.folds + ' times') + '. By the last chapter the model’s refining cost was ' + pa.conv.toFixed(2) + '¢ a gallon at your works against ' + pr.conv.toFixed(2) + '¢ at a typical independent' + (pa.conv < 0.5 * pr.conv ? ', less than half.' : '.'),
        principle: 'Economies of scale: a bigger plant spreads its fixed costs and pays for better equipment, but only when the volume is there to fill it.',
        history: 'F. M. Scherer, drawing on Chandler, reports 0.452 cents a gallon at Standard’s big refineries in 1885 against about 1.5 cents at small ones.', src: S_('scherer') });
    }
    add('L3', S.stockDeals >= 3, { title: 'The cheapest money, until you add it up',
      you: 'You paid for ' + S.stockDeals + ' companies with stock. It saved cash for plant and pipe, made ' + (S.partners === 1 ? 'one seller a partner' : S.partners + ' sellers into partners') + ', and took your stake from ' + F.pct(S.own0, 1) + ' to ' + F.pct(S.own, 1) + '.',
      principle: 'Paying in stock turns a seller into an ally and costs you a slice of every future dollar. It is the cheapest money you will ever raise, until you add up what it cost.',
      history: oil ? 'In 1874 Warden and Lockhart took Standard stock for their refineries and kept their names over the door; Pratt’s firm came in the same way, and brought Henry H. Rogers.' : 'Carnegie kept his firm a partnership, and the partners’ Iron-Clad Agreement let them force a member out at book value, keeping the shares inside the firm.',
      src: oil ? S_('tarbell') : S_('duane') });
    add('L4', S.cutCost > 0 || S.undercutChapters >= 2, { title: 'Starving versus buying',
      you: S.cutCost > 0 ? 'Cutting to kill cost you ' + fM(S.cutCost) + ' in discounts and ruined ' + S.cutRuined + ' ' + F.plural(S.cutRuined, 'rival') + '. The same companies would have cost about ' + fM(S.cutBuyCost) + ' to buy.'
        : 'You priced below the market in ' + S.undercutChapters + ' chapters, and every discount came off your own margin first.',
      principle: 'Predation is a loan against the future: you pay now in discounts and hope to collect later in higher prices, or in cheaper surrenders.',
      history: 'John McGee argued in 1958 that buying rivals is cheaper than starving them and that Standard’s record showed no predation; Christopher Leslie argued in 2012 that predation also buys a reputation that makes the next seller cheaper.',
      src: S_('mcgee', 'leslie') });
    var mono = H.filter(function (h) { return h.share >= 0.6 && h.pM > 1.1 * h.cent; }), over = sum(mono, function (h) { return (h.pM - h.cent) * h.D * h.share * C.G * h.g; });
    add('L5', mono.length >= 2, { title: 'The umbrella over the market',
      you: 'For ' + mono.length + ' chapters you held most of the market and priced above what an efficient new plant would have needed. In the model’s arithmetic, your buyers paid about ' + fM(over) + ' more in those chapters than a competitive industry would have charged them.',
      principle: 'Monopoly profit is borrowed from buyers, and courts and legislatures keep the receipts.',
      history: oil ? 'The Ohio court in 1892 called cheaper prices “the usual pretext on which monopolies of this kind are defended.”' : 'After 1890, agreements and combinations to fix prices were illegal under the Sherman Act.',
      src: oil ? S_('tarbell') : S_('nara') });
    add('L6', S.consumer > 0, { title: 'The defenders’ case',
      you: 'Your prices ran below the new-entrant benchmark on balance: in the model, buyers saved about ' + fM(S.consumer) + ' on what you sold, against an industry of efficient independents.',
      principle: 'Scale made the product cheap, and the buyers kept the difference. This is the defenders’ case for the titans, and in your run it is also true.',
      history: oil ? 'Kerosene fell from 58 cents a gallon in 1865 to 26 cents by 1870 by Wikipedia’s figures, and to about 6 cents two decades after that by Khan’s.' : 'The average price of iron and steel products fell from $63.49 a ton in 1870 to $27.25 in 1900, by the 1900 Census.',
      src: oil ? S_('wSO', 'khan') : S_('census') });
    add('L7', oil && (S.m.rebate || S.drawbackTake > 0), { title: 'Rebates and drawbacks',
      you: 'Rebates saved you about ' + fM(S.rebateSaved) + (S.drawbackTake > 0 ? '; drawbacks took ' + fM(S.drawbackTake) + ' out of your rivals’ own freight.' : '. You never collected drawbacks.'),
      principle: 'The railroads’ defense of a rebate was efficiency: steady trainloads are cheaper to haul. A drawback had no such defense. It made competitors pay you to ship.',
      history: 'The South Improvement contracts would have paid members $1.06 on every outsider’s barrel of crude shipped to New York. The Interstate Commerce Act of 1887 banned rate discrimination, and the Elkins Act of 1903 punished shippers who took rebates.',
      src: S_('tarbell', 'wSIC', 'elkins') });
    add('L8', S.integ.length >= 3, { title: 'Owning the chokepoints',
      you: 'You owned ' + listJoin(S.integ) + '.',
      principle: 'Each one took a supplier’s margin and a supplier’s leverage off your cost sheet. Integration pays where someone could hold you up; elsewhere it is capital you could have used better.',
      history: oil ? 'Standard built barrel factories, bought tank cars and New York terminals, and its National Transit Company came to control the pipelines.' : 'Carnegie took control of Frick’s coke in the 1880s and in 1896 leased Rockefeller’s Mesabi ore at 25 cents a ton when others paid 65.',
      src: oil ? S_('tarbell') : S_('pbsFrick', 'time') });
    var avgP = H.length ? sum(H, function (h) { return h.pM; }) / H.length : 0, avgE = H.length ? sum(H, function (h) { return h.entry; }) / H.length : 0;
    add('L9', S.entrantsCount >= 3 && avgP > avgE, { title: 'The invitation',
      you: S.entrantsCount + ' new competitors built plants under your price umbrella. Your average market price was ' + P(avgP) + ' against an average entry price of ' + P(avgE) + '.',
      principle: 'High margins are an invitation. The dotted line on the chart was the price at which it went out.',
      history: oil ? 'After Spindletop in 1901, Gulf Oil and Texaco were formed to develop the new field, and state law kept Standard from moving in aggressively.' : 'By 1898 bankers were building combinations with ore and mills of their own, such as Morgan’s Federal Steel under Elbert Gary.',
      src: oil ? S_('spindle') : S_('pmhb') });
    if (oil) {
      var V = S.verdict || {};
      add('L10', true, { title: 'The record, not the size',
        you: 'The Court’s reading turned on conduct heat of ' + Math.round(S.hc) + ', structural heat of ' + Math.round(S.hs) + ' and a record of ' + Math.round(S.rec) + '. ' + (S.flags.selfSplit ? 'You split the company yourself before it ruled.' : V.dissolved ? 'It ordered you dissolved.' : 'It declined to order dissolution.'),
        principle: 'Under the rule of reason, size alone rarely sank a company. The record of how it got big did.',
        history: 'In 1911 the Supreme Court ordered Standard to divest its subsidiaries within six months, into 34 companies by the Supreme Court Historical Society’s count. By the time of the decision, Standard’s share of refining capacity had already fallen to 60 to 65 percent, a fact its defenders still cite.',
        src: S_('scotus', 'wSO') });
    }
    if (!oil) {
      var c9 = S.choices.filter(function (c) { return c.id === 's9'; })[0], k9 = c9 ? (c9.label.indexOf('Talks failed') >= 0 ? (c9.hist ? 'B' : 'C') : c9.key) : null;
      var t11 = { A: 'You renewed with the union and paid for it in the cost sheet. Nobody died at your gate.',
        B: (S.flags.frick ? 'The plan you approved for Frick' : 'The hard plan') + ' cut union rates about 22 percent and bought the lowest labor cost in the industry. What it cost is in the other ledger, in lines the engine did not roll.',
        C: 'You took most of the wage cut without the barges. A lockout is still a lockout; the other ledger says so.',
        D: 'You went yourself and bought peace at 90 percent of the old scale. History never ran this experiment.' };
      add('L11', !!k9, { title: 'Homestead',
        you: t11[k9] || '', principle: 'Labor savings are real, and so is what they cost; this machine keeps the second number in the other ledger, where no profit can net against it.',
        history: 'In 1892 the lockout, the Pinkertons and the militia broke the union at Homestead; by 1900 no steel plant in Pennsylvania was unionized.',
        src: S_('pbsHS', 'wHS') });
      var yrs = Cf(S).end - (S.hist.filter(function (h) { return h.KP > 0; })[0] || { year: 1875 }).year;
      add('L12', true, { title: 'The men who paid part of the cost',
        you: 'The model estimates about ' + F.n(S.deaths) + ' deaths in your mills over ' + yrs + ' years, about ' + F.n(S.deathsExcess) + ' of them above an eight-hour, safety-first baseline.' + (S.m.safety ? ' Your safety program cut the rate by about a third once it began.' : ''),
        principle: 'Twelve-hour turns and hard driving were cheaper per ton partly because some of the cost was paid by the men.',
        history: 'The Pittsburgh Survey counted 195 deaths in the steel industry of Allegheny County in one year, July 1906 to June 1907, among about 70,000 steelworkers.',
        src: S_('eastman') });
      var M0 = S.morgan || {};
      add('L13', !!M0.done, { title: 'The number on the slip',
        you: M0.sold ? 'You asked ' + M0.mult.toFixed(1) + ' times your latest annual profit, ' + fM(M0.ask) + ', and Morgan’s bankers were willing to pay up to about ' + fM(M0.M) + '. Your share came to ' + fM(S.proceeds) + '.'
          : 'You ' + (M0.refused ? 'refused to sell' : 'asked ' + fM(M0.ask) + ', above the ' + fM(M0.M) + ' Morgan would pay') + ', and kept the company and the fight.',
        principle: 'A company is worth a multiple of what it earns, plus the credibility of what it could do next. The Conneaut threat was worth money only because Morgan believed it.',
        history: 'Carnegie named his price by hand and Morgan accepted. PBS says $480 million; Wikipedia and Hessen give $492 million. Carnegie Steel had earned about $40 million in 1900, by Schwab’s figures.',
        src: S_('pbsFilm', 'wCS', 'pmhb') });
    }
    var dm = S.dist ? MODES.filter(function (x) { return x.k === S.dist.mode; })[0] : null;
    add('L14', !!dm, { title: 'The distribution',
      you: 'You chose to ' + (dm ? dm.l.charAt(0).toLowerCase() + dm.l.slice(1).replace(/\.$/, '') : '') + (S.dist && S.dist.causes.length ? ', for ' + listJoin(S.dist.causes.map(function (c) { return c.toLowerCase(); })) : '') + '. Over the game you gave ' + fM(S.giftTotal) + ' while working.',
      principle: 'Carnegie called leaving a fortune to family the most injudicious choice and giving it away while living the true antidote. The engine keeps gifts in their own column and subtracts them from nothing in the other ledger.',
      history: 'Carnegie gave away more than $350 million, about $56 million of it for 2,509 libraries; Rockefeller gave about $540 million.',
      src: S_('cc', 'ccny', 'rac') });
    var must = oil ? ['L10', 'L14'] : ['L12', 'L11', 'L14'], pick = [];
    out.forEach(function (l) { if (must.indexOf(l.k) < 0 && pick.length < 7 - must.length) pick.push(l); });
    return out.filter(function (l) { return pick.indexOf(l) >= 0 || must.indexOf(l.k) >= 0; });
  }
  function listJoin(a) { a = a.slice(); if (a.length <= 1) return a.join(''); var l = a.pop(); return a.join(', ') + ' and ' + l; }

  var ENGINE = { CFG: CFG, X: X, MV: MV, MOVES: MOVES, newGame: newGame, closeBooks: closeBooks, choose: choose, doMove: doMove, specialOffer: specialOffer,
    stopMove: stopMove, closePlant: closePlant, going: going, clear: clear, pYof: pYof, runFull: runFull, quote: quote, offerTargets: offerTargets,
    buildChoices: buildChoices, mvState: mvState, hearVerdict: hearVerdict, pBreak: pBreak, morganValue: morganValue, sellToMorgan: sellToMorgan,
    refuseMorgan: refuseMorgan, settle: settle, ending: ending, lessons: lessons, fortune: fortune, EV: EV, heat: heat, live: live, great: great,
    room: room, giveModes: giveModes, crossDone: crossDone, optsOf: optsOf, capShareNow: capShareNow, acqPlants: acqPlants, upgradable: upgradable,
    movesLeft: movesLeft, canOffer: canOffer, centOf: centOf, harmsW: harmsW };
  var DBG = { engine: ENGINE };
  K.hook(SLUG, DBG);

  /* ================================================================ the works, drawn to cost ================================================================
     An isometric drawing of the main works, one building per line of the cost sheet. Each building stands as tall as its line
     (cents a gallon, dollars a ton). Decisions settle it, integration builds new parts in place, and every entry in the other ledger
     stains the ground under the building that caused it. The drawing only reads the engine; PS3D loads on first need. */
  var WK = {
    H: 3, REF: { oil: 15, steel: 20 }, SLOTS: 12,
    names: {
      oil: [['crude', 'Crude oil'], ['freight', 'Freight'], ['conv', 'Refining'], ['cont', 'Barrels and cars'], ['byp', 'By-product credit'], ['fixed', 'Fixed, at your output']],
      steel: [['ore', 'Ore'], ['coke', 'Coke'], ['freight', 'Freight'], ['conv', 'Conversion: fuel and plant'], ['labor', 'Conversion: labor'], ['fixed', 'Fixed, at your output']]
    },
    short: { crude: 'crude', freight: 'freight', conv: 'refining', cont: 'barrels and cars', byp: 'the by-product credit', fixed: 'fixed cost', ore: 'ore', coke: 'coke', labor: 'labor', sconv: 'conversion' },
    /* footprint per line: centre x, centre z, half width, half depth (stains spread from its edge) */
    fp: {
      oil: { crude: [-3.4, -1.7, 1.15, 1.15], freight: [2.4, 2.05, 2, 0.2], conv: [0.2, -2.1, 1.8, 0.75], cont: [3.6, -1.9, 1.1, 0.8], byp: [4.5, 0.15, 0.7, 0.75], fixed: [-3.6, 1.2, 0.7, 0.5] },
      steel: { ore: [-3.25, -2.15, 1.35, 0.55], coke: [2.8, -2.3, 1.7, 0.4], freight: [1.4, 1.35, 0.7, 0.5], conv: [-1, -0.95, 1, 0.8], labor: [-2.6, 1.3, 2, 0.6], fixed: [3.8, 1.2, 0.6, 0.5] }
    },
    stain: { oil: { rebate: 'freight', sic: 'freight', drawback: 'freight', spies: 'freight', tide: 'crude', cut: 'conv', ruined: 'conv' },
      steel: { homestead: 'labor', union: 'labor', wages: 'labor', armor: 'labor', deaths: 'conv', rebate: 'freight' } },
    why: {
      crude: 'The tank farm. You buy crude at the market price, so this line moves with the oil fields.',
      freight: 'The siding and the loading rack. Rebates, pipelines and terminals cut this line.',
      conv: 'The stills. Bigger works and better chemistry bring the refining cost down.',
      cont: 'The cooperage. Every gallon leaves in a barrel or a car.',
      byp: 'The by-product works, drawn below grade because it is a credit: lubricants, paraffin and naphtha pay back part of every gallon.',
      fixed: 'The office. Fixed costs spread across everything you sell, so volume shrinks this line.',
      ore: 'The ore house and dock. Ore is the largest line when the works opens.',
      coke: 'The coke ovens. Coke fires the furnaces.',
      sfreight: 'The rail yard. Ore and coke come in, rails go out.',
      sconv: 'The blast furnace and the Bessemer converter. Cost sheets, scrapping and open hearths cut this line.',
      labor: 'The rolling mill and the men who run it. Shifts, wages and the union move this line.'
    }
  };
  function wkName(camp, key) { var n = WK.names[camp]; for (var i = 0; i < n.length; i++) if (n[i][0] === key) return n[i][1]; return key; }
  /* load the engine once, on first need */
  function wkNeed() {
    var W = window;
    if (W.PS3D && W.PS3D.v >= 1) return Promise.resolve(W.PS3D);
    if (wkNeed.p) return wkNeed.p;
    return (wkNeed.p = new Promise(function (res, rej) {
      var s = document.querySelector('script[src*="/assets/3d/core.js"]'), t = setTimeout(function () { wkNeed.p = null; rej(new Error('3D timed out')); }, 15000);
      function ok() { clearTimeout(t); if (W.PS3D) res(W.PS3D); else { wkNeed.p = null; rej(new Error('3D missing')); } }
      if (!s) { s = document.createElement('script'); s.src = '/assets/3d/core.js?v=3'; s.async = true; document.head.appendChild(s); }
      s.addEventListener('load', ok);
      s.addEventListener('error', function () { clearTimeout(t); wkNeed.p = null; rej(new Error('3D failed to load')); });
    }));
  }
  function wkModels(P) {
    if (P.getModel('titan-refinery')) return;
    var B = P.B, M = Math;
    function bx(x, y, z, w, h, d, o) { return B.box(x, y, z, w, h, d, o); }
    function cy(x, y, z, r, h, o) { return B.cyl([x, y, z], r, h, o); }
    function ln(a, n, o) { return B.lines(a, P._ext({ n: n }, o)); }
    /* a pitched roof on a footprint, ridge along x; hip pulls the ridge in from both ends */
    function roof(x0, x1, z0, z1, h, hip, o, y) {
      var zc = (z0 + z1) / 2, a = x0 + hip, b = x1 - hip, y0 = y || 0, y1 = y0 + h;
      return [[[x0, y0, z1], [x1, y0, z1], [b, y1, zc], [a, y1, zc]], [[x1, y0, z0], [x0, y0, z0], [a, y1, zc], [b, y1, zc]], [[x0, y0, z0], [x0, y0, z1], [a, y1, zc]], [[x1, y0, z1], [x1, y0, z0], [b, y1, zc]]]
        .map(function (p) { return B.poly(p, o); });
    }
    /* window rectangles on the +z (or +x) face: c is the face plane, a0..a1 the run, y0..y1 the band, nx by ny */
    function wins(ax, c, a0, a1, y0, y1, nx, ny) {
      var o = [], w = (a1 - a0) / nx, h = (y1 - y0) / ny, q, r;
      for (var i = 0; i < nx; i++) for (var j = 0; j < ny; j++) {
        var u0 = a0 + w * (i + .3), u1 = a0 + w * (i + .7), v0 = y0 + h * (j + .25), v1 = y0 + h * (j + .75);
        q = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
        for (r = 0; r < 4; r++) { var p = q[r], s = q[(r + 1) % 4]; o.push.apply(o, ax === 'z' ? [p[0], p[1], c, s[0], s[1], c] : [c, p[1], p[0], c, s[1], s[0]]); }
      }
      return ln(o, ax === 'z' ? [0, 0, 1] : [1, 0, 0], { mat: 'quiet' });
    }
    function rails(zs, x0, x1, ties) {
      var o = [], x;
      zs.forEach(function (z) {
        if (!ties) o.push(x0, .02, z, x1, .02, z, x0, .02, z + .26, x1, .02, z + .26);
        else for (x = x0 + .1; x < x1; x += .4) o.push(x, .01, z - .08, x, .01, z + .34);
      });
      return o;
    }
    function blob(seed, sc) {
      var r = B.rng(seed), p = [[0, .006, 0]], n = 11, k0, o = sc ? r() * .3 - .15 : 0;
      sc = sc || 1;
      for (var i = 0; i <= n; i++) { var a = (i % n) / n * M.PI * 2, k = i === n ? k0 : (.55 + r() * .45) * sc; if (!i) k0 = k; p.push([M.cos(a) * k + o, .006, M.sin(a) * k + o]); }
      return p;
    }
    /* one cost line: a body drawn at unit height (scaled to the line), a top that rides on it, the first-chapter outline,
       stain slots, and anything integration adds */
    function line(camp, key, n, body, top, kids, o) {
      o = o || {};
      var f = WK.fp[camp][key], d = M.sqrt(f[0] * f[0] + f[1] * f[1]) || 1, ch = [], i;
      ch.push(B.part(key + '.b', { layer: o.layer || 0 }, body));
      if (o.bg) ch.push(B.part(key + '.bg', {}, o.bg));
      if (top) ch.push(B.part(key + '.t', {}, top));
      if (o.tg) ch.push(B.part(key + '.tg', {}, o.tg));
      var x0 = f[0] - f[2] - .06, x1 = f[0] + f[2] + .06, z0 = f[1] - f[3] - .06, z1 = f[1] + f[3] + .06, y = o.below ? -1 : 1;
      ch.push(B.part(key + '.g', { pick: false, fit: false, visible: false }, [ln([x0, y, z0, x1, y, z0, x1, y, z0, x1, y, z1, x1, y, z1, x0, y, z1, x0, y, z1, x0, y, z0,
        x0, 0, z0, x0, y, z0, x1, 0, z0, x1, y, z0, x1, 0, z1, x1, y, z1, x0, 0, z1, x0, y, z1], null, { mat: 'ghost', lineA: .34 })]));
      for (i = 0; i < WK.SLOTS; i++) ch.push(B.part(key + '.s' + i, { layer: -.5, visible: false }, [B.poly(blob(n * 97 + i * 13 + 5), { mat: 'stain', edges: false }), B.poly(blob(n * 89 + i * 7 + 3, .5), { mat: 'stain', edges: false })]));
      return B.part(key, { n: n, lift: .07, name: wkName(camp, key), why: WK.why[(camp === 'steel' && WK.why['s' + key]) ? 's' + key : key], explode: [f[0] / d * .85, .25, f[1] / d * .85] }, [], ch.concat(kids || []));
    }
    var mats = { stain: { kind: 'flat', face: 'ink', faceA: .22, line: 'none' }, pit: { face: 'card', line: 'ink2' }, bought: { face: 'none', line: 'ink2', dash: 4, lineA: .75 } };
    function upd(root, prm, ctx) {
      if (!ctx.init) return null;
      /* the framing pose: everything at a little over full height, so no later state leaves the frame */
      for (var id in root.parts) {
        var nd = root.parts[id];
        if (/\.bg?$/.test(id)) nd.scl[1] = WK.H;
        else if (/\.tg?$/.test(id)) nd.pos[1] = /^byp/.test(id) ? -WK.H * .4 : WK.H;
      }
      return null;
    }
    var common = { v: 1, camera: 'ortho', mats: mats, margin: .98, pitchRange: [12, 82], zoomRange: [.7, 2.8], flowFor: 3200, update: upd,
      views: { iso: { yaw: 45, pitch: 35.264, zoom: 1.12 }, plan: { yaw: 0, pitch: 82 } } };

    /* ---- Oil: a Cleveland refinery on the Cuyahoga, 1868 ---- */
    var tanks = [[-4, -2.3], [-2.8, -2.3], [-4, -1.1], [-2.8, -1.1]], stills = [-1.2, -.4, .4, 1.2], cars = [0, 1, 2, 3, 4, 5].map(function (i) { return -4.4 + i * 1.05; });
    P.model('titan-refinery', P._ext({
      title: 'The refinery, drawn to its cost sheet', desc: 'Each building stands as tall as its line on the cost sheet.',
      flows: [
        { id: 'crude', path: [[-3, .5, 2.73], [-3, .2, .4], [-3.4, .3, -.6], [-3.4, .7, -1.7]], points: 18, speed: .3, color: 'ink2', size: 3 },
        { id: 'pipe', paths: [[[-6, .06, -2.6], [-4.6, .06, -2], [-3.4, .5, -1.7]], [[-6, .06, -1.4], [-4.6, .06, -1.6], [-3.4, .5, -1.7]], [[-6, .06, -.2], [-4.6, .06, -1.2], [-3.4, .5, -1.7]]], points: 24, speed: .3, color: 'ink2', size: 3 },
        { id: 'run', path: [[-2.6, .4, -1.7], [-1.2, .55, -2.1], [1.2, .55, -2.1], [1.6, .3, -.6], [2.4, .7, 2.05], [1, .5, 2.73], [-4.4, .5, 2.73]], points: 34, speed: .22, color: 'ink2', size: 3 }
      ],
      build: function () {
        var out = [];
        out.push(B.part('site', { pick: false, layer: -1 }, [
          B.prism([[-5.2, -3.3], [5.2, -3.3], [5.2, -.6], [3.8, -.6], [3.8, .9], [5.2, .9], [5.2, 3.3], [-5.2, 3.3]], -.12, 0, { mat: 'quiet' }),
          ]));
        out.push(line('oil', 'crude', 1, tanks.map(function (t) { return cy(t[0], 0, t[1], .5, 1, { seg: 20, mat: 'metal' }); }),
          tanks.reduce(function (a, t) { var l = []; for (var i = 0; i < 8; i++) { var q = i / 8 * M.PI * 2; l.push(t[0] + M.cos(q) * .5, 0, t[1] + M.sin(q) * .5, t[0], .14, t[1]); } return a.concat([ln(l, null, { mat: 'quiet' })]); }, []),
          [B.part('crude.k', {}, [ln([-4.65, .07, -2.95, -2.15, .07, -2.95, -2.15, .07, -2.95, -2.15, .07, -.45, -2.15, .07, -.45, -4.65, .07, -.45, -4.65, .07, -.45, -4.65, .07, -2.95], [0, 1, 0], { mat: 'quiet' })]),
            B.part('gather', { name: 'Gathering lines', why: 'Pipes from the wells to your tanks. Freight falls 15 percent, and rivals pay you to use them.' },
              [-2.6, -1.4, -.2].map(function (z) { return ln([-6.25, 0, z - .25, -6, 1.3, z, -5.75, 0, z - .25, -6, 1.3, z, -6.25, 0, z + .25, -6, 1.3, z, -5.75, 0, z + .25, -6, 1.3, z, -6.13, .6, z - .13, -5.87, .6, z - .13, -6.13, .6, z + .13, -5.87, .6, z + .13], null); })
                .concat([B.path([[-5.75, .06, -2.6], [-4.6, .06, -2], [-4.45, .06, -1.9]], { w: 1.25 }), B.path([[-5.75, .06, -1.4], [-4.45, .06, -1.6]], { w: 1.25 }), B.path([[-5.75, .06, -.2], [-4.45, .06, -1.2]], { w: 1.25 })])),
            B.part('trunk', { name: 'Trunk line to the sea', why: 'Pipe instead of railroad to the coast. Freight falls another 40 percent.' },
              [cy(-2.2, .14, -3.05, .07, 8.2, { axis: 'x', seg: 8, mat: 'metal' }), bx(1, 0, -3.05, .6, .45, .5)].concat(roof(.7, 1.3, -3.3, -2.8, .2, 0), [ln([6, .14, -3.05, 6.3, .14, -3.05], null, { dash: 3 })]))]));
        out.push(line('oil', 'conv', 3, stills.map(function (x) { return bx(x, 0, -2.2, .78, .3, .78); })
          .concat(stills.map(function (x) { return cy(x, .3, -2.2, .34, .7, { seg: 16, mat: 'metal' }); }), [bx(0, 0, -1.35, 3.2, .35, .5), bx(1.95, 0, -2.75, .3, 1.7, .3),
            ln(stills.reduce(function (a, x) { return a.concat([x, 1, -2.05, x, 1.08, -1.75, x, 1.08, -1.75, x, .35, -1.5]); }, []), null)]), null));
        out.push(line('oil', 'cont', 4, [bx(3.6, 0, -1.9, 2.2, 1, 1.6), wins('z', -1.098, 2.6, 4.6, .2, .8, 4, 1), wins('x', 4.702, -2.6, -1.2, .2, .8, 3, 1)],
          roof(2.5, 4.7, -2.7, -1.1, .38, 0),
          [B.part('cont.x', {}, [[2.75, 0], [3.02, 0], [3.29, 0], [2.885, .32], [3.155, .32], [3.02, .64]].map(function (p) { return cy(p[0], p[1], -.75, .12, .32, { seg: 10 }); })),
            B.part('cont.w', {}, [bx(4.4, 0, -.75, 1, .08, .5), bx(4.4, .08, -.75, 1, .08, .5), bx(4.4, .16, -.75, 1, .08, .5)])],
          { bg: [bx(3.6, 0, -1.9, 2.2, 1, 1.6, { mat: 'bought' })], tg: roof(2.5, 4.7, -2.7, -1.1, .38, 0, { mat: 'bought' }) }));
        out.push(line('oil', 'byp', 5, [bx(4.5, -1, .15, 1.4, 1, 1.5, { mat: 'pit', open: '+y' })],
          [cy(4.1, 0, -.15, .16, .7, { axis: 'x', seg: 12, mat: 'metal' }), cy(4.1, 0, .45, .16, .7, { axis: 'x', seg: 12, mat: 'metal' })],
          [B.part('chem', { name: 'The laboratory', why: 'Chemists find money in what the river used to take. The by-product credit rises.' },
            [bx(2.6, 0, .75, .7, .5, .7), cy(2.8, .5, .55, .06, .55, { seg: 8 })].concat(roof(2.25, 2.95, .4, 1.1, .22, 0, null, .5)))],
          { below: 1, layer: -2 }));
        out.push(line('oil', 'fixed', 6, [bx(-3.6, 0, 1.2, 1.4, 1, 1), wins('z', 1.702, -4.2, -3, .12, .9, 3, 2), wins('x', -2.898, .8, 1.6, .12, .9, 2, 2)],
          roof(-4.3, -2.9, .7, 1.7, .3, .5),
          [B.part('market', { name: 'Tank wagons', why: 'Your wagons deliver to the grocer’s door. The jobbers and their margin are gone.' }, [[-.6, 1.5], [.3, 1.75]].reduce(function (a, w) {
            return a.concat([bx(w[0], .14, w[1], .62, .05, .3), cy(w[0] - .27, .32, w[1], .13, .54, { axis: 'x', seg: 10, mat: 'metal' }), cy(w[0] - .2, .1, w[1] - .17, .1, .34, { axis: 'z', seg: 10 }), cy(w[0] + .2, .1, w[1] - .17, .1, .34, { axis: 'z', seg: 10 })]);
          }, []))]));
        out.push(line('oil', 'freight', 2, [0, 1, 2, 3, 4].map(function (i) { return bx(.6 + i * .95, 0, 2.05, .06, .94, .06); }).concat([bx(2.5, .94, 2.05, 4.1, .06, .34)]),
          [ln([.45, .14, 1.9, 4.55, .14, 1.9, .45, 0, 1.9, .45, .14, 1.9, 4.55, 0, 1.9, 4.55, .14, 1.9], null, { mat: 'quiet' })],
          [B.part('freight.r', { pick: false }, [ln(rails([2.6], -5.2, 5.2), [0, 1, 0])]), B.part('freight.y', { pick: false }, [ln(rails([2.6], -5.2, 5.2, 1), [0, 1, 0], { mat: 'quiet' })]),
            B.part('freight.c', {}, cars.reduce(function (a, x) { return a.concat([bx(x, .1, 2.73, .95, .06, .42), bx(x, .16, 2.73, .9, .4, .4)]); }, [])),
            B.part('tankcars', { name: 'Tank cars', why: 'Your own tank cars. Barrels and cars cost 20 percent less, and your oil stops waiting for cars.' },
              cars.reduce(function (a, x) { return a.concat([bx(x, .1, 2.73, .86, .06, .4), cy(x - .34, .37, 2.73, .19, .68, { axis: 'x', seg: 12, mat: 'metal' }), cy(x, .55, 2.73, .07, .09, { seg: 8 })]); }, [])),
            B.part('term', { name: 'The New York terminals', why: 'The docks where export oil meets the ships. Freight falls 10 percent.' },
              [bx(5.8, -.04, 2.05, 1.2, .08, .5), B.prism([[5.3, 1.25], [6.5, 1.25], [6.85, 1.45], [6.5, 1.65], [5.3, 1.65]], -.1, .2), bx(5.75, .2, 1.45, .45, .22, .3), ln([6.2, .2, 1.45, 6.2, 1.1, 1.45], null)]),
            B.part('war', { name: 'The Empire war', why: 'The war with the Pennsylvania Railroad costs 0.8¢ on every gallon this chapter.' }, [bx(2.5, 0, 2.05, 4.1, WK.H / WK.REF.oil * .8, .34, { mat: 'bought' })])]));
        return out;
      }
    }, common));

    /* ---- Steel: a Bessemer works on the Monongahela, 1872 ---- */
    P.model('titan-steel', P._ext(P._ext({
      title: 'The steel works, drawn to its cost sheet', desc: 'Each building stands as tall as its line on the cost sheet.',
      flows: [
        { id: 'ore', path: [[-3, .25, -3], [-2.8, .5, -2.1], [-1, .6, -1], [-.4, .9, -.9]], points: 18, speed: .3, color: 'ink2', size: 3 },
        { id: 'iron', path: [[-.4, .25, -.9], [.6, .3, -.6], [1, .7, -.55]], points: 10, speed: .4, color: 'ink2', size: 3 },
        { id: 'steel', path: [[1, .3, -.55], [.2, .3, .3], [-.6, .45, 1.3], [-2.6, .45, 1.3], [-.4, .3, 2.48], [3.9, .3, 2.48]], points: 26, speed: .22, color: 'ink2', size: 3 },
        { id: 'heat', paths: [0, 1, 2, 3, 4, 5, 6].map(function (i) {
          var a = i / 7 * M.PI * 2, r = .5 + (i % 3) * .2, p = [];
          for (var k = 0; k <= 6; k++) { var t = k / 6; p.push([1 + M.cos(a) * r * t, 1.06 + 1.1 * t - 1.3 * t * t, -.55 + M.sin(a) * r * t]); }
          return p;
        }), points: 42, speed: .9, color: 'accent', size: 2.5 }
      ],
      build: function () {
        var out = [], gon = [.6, 1.7, 2.8, 3.9];
        out.push(B.part('site', { pick: false, layer: -1 }, [bx(0, -.12, 0, 10.4, .12, 6.6, { mat: 'quiet' }),
          ]));
        out.push(line('steel', 'ore', 1, [bx(-3.25, 0, -2.15, 2.7, 1, 1.1), ln([-4.3, -3.95, -3.6, -3.25, -2.9, -2.55, -2.2].reduce(function (a, x) {
          return a.concat([x - .14, .55, -1.598, x, .15, -1.598, x, .15, -1.598, x + .14, .55, -1.598, x - .14, .55, -1.598, x + .14, .55, -1.598]);
        }, []), [0, 0, 1], { mat: 'quiet' })],
          roof(-4.6, -1.9, -2.7, -1.6, .32, 0),
          [B.part('ore.d', {}, [bx(-2.8, 0, -3.05, 4.8, .05, .5), ln([-5.1, .05, -3.3, -.5, .05, -3.3].concat([-4.8, -4, -3.2, -2.4, -1.6, -.8].reduce(function (a, x) { return a.concat([x, -.12, -3.3, x, .05, -3.3]); }, [])), null, { mat: 'quiet' })]),
            B.part('oreboat', { name: 'Ore boats', why: 'Ore from the Lake Superior ranges, on your own terms. The ore bill falls by a third or more.' },
              [B.prism([[-4.4, -3.75], [-1.6, -3.75], [-1.2, -3.95], [-1.6, -4.15], [-4.4, -4.15]], -.12, .14), bx(-4.05, .14, -3.95, .4, .26, .3), cy(-2, .14, -3.95, .07, .4, { seg: 8 })])]));
        out.push(line('steel', 'coke', 2, [bx(2.8, 0, -2.3, 3.4, 1, .8), ln([1.4, 2, 2.6, 3.2, 3.8, 4.4].reduce(function (a, x) {
          return a.concat([x - .14, 0, -1.898, x - .14, .3, -1.898, x + .14, 0, -1.898, x + .14, .3, -1.898, x - .14, .3, -1.898, x, .42, -1.898, x, .42, -1.898, x + .14, .3, -1.898]);
        }, []), [0, 0, 1], { mat: 'quiet' })], [cy(1.3, 0, -2.3, .08, .5, { seg: 8 }), cy(4.3, 0, -2.3, .08, .5, { seg: 8 })], null,
          { bg: [bx(2.8, 0, -2.3, 3.4, 1, .8, { mat: 'bought' })] }));
        out.push(line('steel', 'conv', 4, [cy(-.4, 0, -.9, .5, 1, { seg: 20, mat: 'metal' }), cy(-1.6, 0, -1.4, .32, .9, { seg: 16, mat: 'metal' }), cy(-1.6, 0, -.5, .32, .9, { seg: 16, mat: 'metal' }),
          B.path([[-.4, 1, -.9], [-1, 1.1, -.9], [-1.6, .9, -.95]])],
          [ln([-.9, 0, -.9, -.4, .22, -.9, .1, 0, -.9, -.4, .22, -.9, -.4, 0, -1.4, -.4, .22, -.9, -.4, 0, -.4, -.4, .22, -.9], null), cy(-.4, .22, -.9, .07, .16, { seg: 8 })],
          [B.part('conv.p', {}, [bx(.55, 0, -.55, .1, .62, .14), bx(1.45, 0, -.55, .1, .62, .14), ln([.55, .62, -.55, 1.45, .62, -.55], null)]),
            B.part('conv.v', { pos: [1, .62, -.55] }, [cy(0, -.32, 0, .3, .58, { seg: 16, mat: 'metal' }), cy(0, .26, 0, .17, .16, { seg: 12, mat: 'metal' })]),
            B.part('oh', { name: 'Open hearths', why: 'Slower, finer steel with controlled chemistry. Conversion falls 12 percent, and bridge builders pay more.' },
              [bx(2.9, 0, -.55, 2.2, .5, .9), cy(2.2, .5, -.85, .07, .8, { seg: 8 }), cy(3.6, .5, -.85, .07, .8, { seg: 8 })].concat(roof(1.8, 4, -1, -.1, .22, 0, null, .5)))]));
        out.push(line('steel', 'labor', 5, [bx(-2.6, 0, 1.3, 4, 1, 1.2), wins('z', 1.902, -4.4, -.8, .55, .85, 8, 1), wins('x', -.598, .8, 1.8, .1, .7, 2, 1)],
          roof(-4.6, -.6, .7, 1.9, .42, 0).concat([ln([-4.4, .42, 1.3, -.8, .42, 1.3], null, { mat: 'quiet' })]), null));
        out.push(line('steel', 'freight', 3, [bx(1.4, 0, 1.35, 1.4, 1, 1), ln([.9, 0, 1.852, .9, .6, 1.852, 1.3, 0, 1.852, 1.3, .6, 1.852, .9, .6, 1.852, 1.1, .75, 1.852, 1.1, .75, 1.852, 1.3, .6, 1.852,
          1.5, 0, 1.852, 1.5, .6, 1.852, 1.9, 0, 1.852, 1.9, .6, 1.852, 1.5, .6, 1.852, 1.7, .75, 1.852, 1.7, .75, 1.852, 1.9, .6, 1.852], [0, 0, 1], { mat: 'quiet' })],
          roof(.7, 2.1, .85, 1.85, .3, 0),
          [B.part('freight.r', { pick: false }, [ln(rails([2.35, 2.85], -5.2, 5.2).concat(rails([2.35, 2.85], -5.2, 5.2, 1)), [0, 1, 0], { mat: 'quiet' })]),
            B.part('freight.c', {}, gon.reduce(function (a, x) { return a.concat([bx(x, .1, 2.48, .95, .06, .42), bx(x, .16, 2.48, .9, .28, .4, { open: '+y' })]); }, [])),
            B.part('rail', { name: 'Your railroad', why: 'Your own line between the furnaces, the mills and the trunk railroads. Freight falls 45 percent.' },
              [bx(-.7, .1, 2.98, 1.1, .06, .4), cy(-1.15, .34, 2.98, .17, .7, { axis: 'x', seg: 12, mat: 'metal' }), bx(-.05, .16, 2.98, .4, .42, .4), cy(-1.05, .5, 2.98, .06, .26, { seg: 8 }),
                ln(rails([2.85], 5.2, 6.4).concat(rails([2.85], 5.2, 6.4, 1)), [0, 1, 0], { mat: 'quiet' })])]));
        out.push(line('steel', 'fixed', 6, [bx(3.8, 0, 1.2, 1.2, 1, 1), wins('z', 1.702, 3.3, 4.3, .12, .9, 3, 2), wins('x', 4.402, .8, 1.6, .12, .9, 2, 2)],
          roof(3.2, 4.4, .7, 1.7, .3, .45)));
        return out;
      }
    }, common), { margin: 1.02, views: { iso: { yaw: 45, pitch: 35.264, zoom: 1 }, plan: { yaw: 0, pitch: 82 } } }));
  }

  /* ================================================================ the view ================================================================ */
  var E_ = K.esc, UID = 0;
  /* the two works at rest, at their first chapter's costs: shaded SVG posters drawn once by the engine's poster writer
     (PS3D.debug.poster, through DBG.poster below) and kept here, so the chooser is composed on its first frame with no 3D loaded.
     Their faces print through the p-* classes in titan.css, so they follow every light. */
  var POSTER = { oil: '<svg xmlns="http://www.w3.org/2000/svg" class="ps3d-poster" data-reg="1" data-v="2" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><clipPath id="p372qc0"><path d="M264.2 95.5L569.8 271.9L375.8 383.9L70.2 207.4Z"/></clipPath><clipPath id="p372qc1"><path d="M264.2 95.5L569.8 271.9L375.8 383.9L70.2 207.4Z"/></clipPath><clipPath id="p372qc2"><path d="M173.1 170.8L214.3 194.6L184.8 211.6L143.6 187.8Z"/></clipPath><clipPath id="p372qc3"><path d="M264.2 95.5L569.8 271.9L375.8 383.9L70.2 207.4Z"/></clipPath><clipPath id="p372qc4"><path d="M264.2 95.5L569.8 271.9L375.8 383.9L70.2 207.4Z"/></clipPath><clipPath id="p372qc5"><path d="M264.2 95.5L569.8 271.9L375.8 383.9L70.2 207.4Z"/></clipPath><clipPath id="p372qc6"><path d="M264.2 95.5L569.8 271.9L375.8 383.9L70.2 207.4Z"/></clipPath><clipPath id="p372qk"><path d="M264.2 95.4L569.8 271.9L375.8 383.9L70.2 207.4Z"/></clipPath><filter id="p372qb1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1"/></filter><filter id="p372qb2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter><filter id="p372qb3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter><filter id="p372qb4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter><filter id="p372qb5" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter><filter id="p372qb16" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter></defs><g data-part="site" style="--i:1"><path class="p-plaster" d="M264.2 95.5L569.8 271.9L490.4 317.8L449.3 294L405.2 319.5L446.4 343.2L375.8 383.9L70.2 207.5Z"/><path class="p-right" d="M569.8 276L490.4 321.8L490.4 317.8L569.8 271.9ZM375.8 388L70.2 211.5L70.2 207.5L375.8 383.9ZM490.4 321.8L449.3 298.1L449.3 294L490.4 317.8ZM449.3 298.1L405.2 323.5L405.2 319.5L449.3 294ZM446.4 347.3L375.8 388L375.8 383.9L446.4 343.2Z"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.35" d="M264.2 95.5L569.8 271.9"/><path class="p-line2" stroke-width="0.72" stroke-opacity="0.20" d="M569.8 271.9L490.4 317.8M490.4 317.8L449.3 294M449.3 294L405.2 319.5M375.8 383.9L70.2 207.5M449.3 298.1L449.3 294"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.47" d="M405.2 319.5L446.4 343.2"/><path class="p-line2" stroke-width="0.72" stroke-opacity="0.22" d="M446.4 343.2L375.8 383.9M375.8 388L375.8 383.9"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.32" d="M70.2 207.5L264.2 95.5"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.44" d="M569.8 276L490.4 321.8M375.8 388L70.2 211.5"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.45" d="M490.4 321.8L449.3 298.1M449.3 298.1L405.2 323.5"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.49" d="M446.4 347.3L375.8 388"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.42" d="M569.8 276L569.8 271.9"/><path class="p-line2" stroke-width="0.72" stroke-opacity="0.21" d="M490.4 321.8L490.4 317.8"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.46" d="M405.2 323.5L405.2 319.5"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.48" d="M446.4 347.3L446.4 343.2"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.37" d="M70.2 211.5L70.2 207.5"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p372qb2)" d="M452.8 311.4L474.3 323.9L446.3 340.1L424.8 327.6Z"/></g><g clip-path="url(#p372qk)"><g opacity="0.360" filter="url(#p372qb2)"><path class="p-shadow" d="M249.5 134.7L249.5 130.9L311.3 141.7L311.3 145.4ZM251.5 138.3L249.5 134.7L311.3 145.4L313.3 149ZM290.6 134.7L288.6 138.3L350.3 149L352.3 145.4ZM255.3 141.3L251.5 138.3L313.3 149L317.1 152ZM288.6 138.3L284.7 141.3L346.5 152L350.3 149ZM284.7 141.3L279.5 143.5L341.3 154.2L346.5 152ZM260.6 143.5L255.3 141.3L317.1 152L322.4 154.2ZM279.5 143.5L273.3 144.7L335.1 155.4L341.3 154.2ZM266.8 144.7L260.6 143.5L322.4 154.2L328.6 155.4ZM273.3 144.7L266.8 144.7L328.6 155.4L335.1 155.4ZM284.8 155.1L284.8 151.3L346.6 162L346.6 165.8ZM214.3 155.1L214.3 151.3L276 162L276 165.8ZM286.8 158.6L284.8 155.1L346.6 165.8L348.6 169.4ZM325.8 155.1L323.8 158.6L385.6 169.4L387.6 165.8ZM216.3 158.6L214.3 155.1L276 165.8L278 169.4ZM255.3 155.1L253.3 158.6L315.1 169.4L317.1 165.8ZM346.5 152L341.3 154.2L335.1 155.4L328.6 155.4L322.4 154.2L317.1 152L313.3 149L311.3 145.4L311.3 141.7L313.3 138.1L317.1 135.1L322.4 132.9L328.6 131.7L335.1 131.7L341.3 132.9L346.5 135.1L350.3 138.1L352.3 141.7L352.3 145.4L350.3 149ZM290.6 161.7L286.8 158.6L348.6 169.4L352.4 172.4ZM323.8 158.6L320 161.7L381.8 172.4L385.6 169.4ZM220.1 161.7L216.3 158.6L278 169.4L281.9 172.4ZM253.3 158.6L249.5 161.7L311.3 172.4L315.1 169.4ZM320 161.7L314.7 163.9L376.5 174.6L381.8 172.4ZM295.9 163.9L290.6 161.7L352.4 172.4L357.7 174.6ZM249.5 161.7L244.2 163.9L306 174.6L311.3 172.4ZM225.3 163.9L220.1 161.7L281.9 172.4L287.1 174.6ZM302.1 165L295.9 163.9L357.7 174.6L363.8 175.8ZM231.5 165L225.3 163.9L287.1 174.6L293.3 175.8ZM314.7 163.9L308.6 165L370.3 175.8L376.5 174.6ZM244.2 163.9L238 165L299.8 175.8L306 174.6ZM308.6 165L302.1 165L363.8 175.8L370.3 175.8ZM238 165L231.5 165L293.3 175.8L299.8 175.8ZM249.5 175.4L249.5 171.7L311.3 182.4L311.3 186.1ZM251.5 179L249.5 175.4L311.3 186.1L313.3 189.7ZM290.6 175.4L288.6 179L350.3 189.7L352.3 186.1ZM381.8 172.4L376.5 174.6L370.3 175.8L363.8 175.8L357.7 174.6L352.4 172.4L348.6 169.4L346.6 165.8L346.6 162L348.6 158.5L352.4 155.4L357.7 153.2L363.8 152.1L370.3 152.1L376.5 153.2L381.8 155.4L385.6 158.5L387.6 162L387.6 165.8L385.6 169.4ZM311.3 172.4L306 174.6L299.8 175.8L293.3 175.8L287.1 174.6L281.9 172.4L278 169.4L276 165.8L276 162L278 158.5L281.9 155.4L287.1 153.2L293.3 152.1L299.8 152.1L306 153.2L311.3 155.4L315.1 158.5L317.1 162L317.1 165.8L315.1 169.4ZM255.3 182L251.5 179L313.3 189.7L317.1 192.7ZM288.6 179L284.7 182L346.5 192.7L350.3 189.7ZM284.7 182L279.5 184.2L341.3 195L346.5 192.7ZM260.6 184.2L255.3 182L317.1 192.7L322.4 195ZM279.5 184.2L273.3 185.4L335.1 196.1L341.3 195ZM266.8 185.4L260.6 184.2L322.4 195L328.6 196.1ZM273.3 185.4L266.8 185.4L328.6 196.1L335.1 196.1ZM346.5 192.7L341.3 195L335.1 196.1L328.6 196.1L322.4 195L317.1 192.7L313.3 189.7L311.3 186.1L311.3 182.4L313.3 178.8L317.1 175.8L322.4 173.6L328.6 172.4L335.1 172.4L341.3 173.6L346.5 175.8L350.3 178.8L352.3 182.4L352.3 186.1L350.3 189.7ZM148.5 196.4L189.7 220.2L219 203.2L177.9 179.5ZM143.7 195.6L184.8 219.4L189.7 220.2L148.5 196.4ZM184.8 219.4L214.2 202.4L219 203.2L189.7 220.2ZM177.9 179.5L148.5 196.4L184.2 197.5ZM219 203.2L177.9 179.5L184.2 197.5L196 204.3ZM148.5 196.4L189.7 220.2L196 204.3L184.2 197.5ZM189.7 220.2L219 203.2L196 204.3ZM329.4 182.5L352.3 195.8L375.3 182.5L352.3 169.3ZM339.3 185.7L338.2 182.5L345.1 183.7L346.2 186.9ZM366.5 182.5L365.4 185.7L372.3 186.9L373.4 183.7ZM349.4 195.3L372.3 182L375.3 182.5L352.3 195.8ZM326.5 182L349.4 195.3L352.3 195.8L329.4 182.5ZM369.2 189.5L364.6 191.3L359.2 191.9L353.8 191.3L349.2 189.5L346.2 186.9L345.1 183.7L346.2 180.6L349.2 178L353.8 176.2L359.2 175.6L364.6 176.2L369.2 178L372.3 180.6L373.4 183.7L372.3 186.9ZM342.4 188.3L339.3 185.7L346.2 186.9L349.2 189.5ZM365.4 185.7L362.3 188.3L369.2 189.5L372.3 186.9ZM362.3 188.3L357.7 190.1L364.6 191.3L369.2 189.5ZM346.9 190.1L342.4 188.3L349.2 189.5L353.8 191.3ZM357.7 190.1L352.3 190.7L359.2 191.9L364.6 191.3ZM352.3 190.7L346.9 190.1L353.8 191.3L359.2 191.9ZM352.9 196.1L375.9 209.3L398.8 196.1L375.9 182.9ZM362.8 199.2L361.7 196.1L368.6 197.3L369.7 200.4ZM390 196.1L388.9 199.2L395.8 200.4L396.9 197.3ZM372.9 208.8L395.8 195.6L398.8 196.1L375.9 209.3ZM350 195.6L372.9 208.8L375.9 209.3L352.9 196.1ZM392.7 203.1L388.2 204.8L382.7 205.5L377.3 204.8L372.8 203.1L369.7 200.4L368.6 197.3L369.7 194.2L372.8 191.5L377.3 189.8L382.7 189.2L388.2 189.8L392.7 191.5L395.8 194.2L396.9 197.3L395.8 200.4ZM365.9 201.9L362.8 199.2L369.7 200.4L372.8 203.1ZM388.9 199.2L385.8 201.9L392.7 203.1L395.8 200.4ZM385.8 201.9L381.3 203.7L388.2 204.8L392.7 203.1ZM370.4 203.7L365.9 201.9L372.8 203.1L377.3 204.8ZM381.3 203.7L375.9 204.3L382.7 205.5L388.2 204.8ZM375.9 204.3L370.4 203.7L377.3 204.8L382.7 205.5ZM376.4 209.7L399.4 222.9L422.3 209.7L399.4 196.5ZM413.5 209.7L412.4 212.8L419.3 214L420.4 210.9ZM386.3 212.8L385.2 209.7L392.1 210.9L393.2 214ZM373.5 209.2L396.4 222.4L399.4 222.9L376.4 209.7ZM396.4 222.4L419.3 209.2L422.3 209.7L399.4 222.9ZM416.2 216.7L411.7 218.4L406.3 219L400.8 218.4L396.3 216.7L393.2 214L392.1 210.9L393.2 207.8L396.3 205.1L400.8 203.3L406.3 202.7L411.7 203.3L416.2 205.1L419.3 207.8L420.4 210.9L419.3 214ZM389.4 215.5L386.3 212.8L393.2 214L396.3 216.7ZM412.4 212.8L409.4 215.5L416.2 216.7L419.3 214ZM308.8 194.5L402.8 248.8L417.5 240.3L323.4 186ZM409.4 215.5L404.8 217.2L411.7 218.4L416.2 216.7ZM394 217.2L389.4 215.5L396.3 216.7L400.8 218.4ZM404.8 217.2L399.4 217.8L406.3 219L411.7 218.4ZM399.4 217.8L394 217.2L400.8 218.4L406.3 219ZM305.3 193.9L399.3 248.2L402.8 248.8L308.8 194.5ZM399.9 223.3L422.9 236.5L445.8 223.3L422.9 210ZM409.8 226.4L408.7 223.3L415.6 224.5L416.7 227.6ZM437 223.3L435.9 226.4L442.8 227.6L443.9 224.5ZM419.9 236L442.8 222.7L445.8 223.3L422.9 236.5ZM397 222.7L419.9 236L422.9 236.5L399.9 223.3ZM439.8 230.2L435.2 232L429.8 232.6L424.4 232L419.8 230.2L416.7 227.6L415.6 224.5L416.7 221.3L419.8 218.7L424.4 216.9L429.8 216.3L435.2 216.9L439.8 218.7L442.8 221.3L443.9 224.5L442.8 227.6ZM412.9 229L409.8 226.4L416.7 227.6L419.8 230.2ZM435.9 226.4L432.9 229L439.8 230.2L442.8 227.6ZM432.9 229L428.3 230.8L435.2 232L439.8 230.2ZM417.5 230.8L412.9 229L419.8 230.2L424.4 232ZM458.1 231.2L466.9 226.1L483.7 229L474.9 234.1ZM449.3 226.1L458.1 231.2L474.9 234.1L466 229ZM428.3 230.8L422.9 231.4L429.8 232.6L435.2 232ZM422.9 231.4L417.5 230.8L424.4 232L429.8 232.6ZM466 229L474.9 234.1L483.7 229L474.9 224ZM399.3 248.2L414 239.7L417.5 240.3L402.8 248.8ZM93.7 207.5L121.6 223.6L134 216.5L106.1 200.3ZM92.5 207.3L120.4 223.4L121.6 223.6L93.7 207.5ZM103.2 209.2L129.7 224.5L141.4 217.7L115 202.4ZM94.8 207.7L121.2 223L129.7 224.5L103.2 209.2ZM120.4 223.4L132.7 216.2L134 216.5L121.6 223.6ZM121.2 223L133 216.2L141.4 217.7L129.7 224.5ZM124.6 225.3L152.5 241.4L164.8 234.3L136.9 218.2ZM123.3 225.1L151.2 241.2L152.5 241.4L124.6 225.3ZM134.1 227L160.5 242.3L172.3 235.5L145.8 220.2ZM125.6 225.5L152.1 240.8L160.5 242.3L134.1 227ZM151.2 241.2L163.6 234.1L164.8 234.3L152.5 241.4ZM152.1 240.8L163.8 234L172.3 235.5L160.5 242.3ZM155.4 243.1L183.4 259.2L195.7 252.1L167.8 236ZM154.2 242.9L182.1 259L183.4 259.2L155.4 243.1ZM164.9 244.8L191.4 260.1L203.1 253.3L176.7 238ZM156.5 243.4L182.9 258.6L191.4 260.1L164.9 244.8ZM182.1 259L194.4 251.9L195.7 252.1L183.4 259.2ZM182.9 258.6L194.7 251.8L203.1 253.3L191.4 260.1ZM186.3 260.9L214.2 277L226.6 269.9L198.6 253.8ZM185 260.7L212.9 276.8L214.2 277L186.3 260.9ZM195.8 262.6L222.2 277.9L234 271.1L207.5 255.9ZM187.3 261.2L213.8 276.4L222.2 277.9L195.8 262.6ZM212.9 276.8L225.3 269.7L226.6 269.9L214.2 277ZM213.8 276.4L225.5 269.7L234 271.1L222.2 277.9ZM217.2 278.7L245.1 294.8L257.4 287.7L229.5 271.6ZM215.9 278.5L243.8 294.6L245.1 294.8L217.2 278.7ZM226.6 280.5L253.1 295.7L264.8 288.9L238.4 273.7ZM218.2 279L244.6 294.3L253.1 295.7L226.6 280.5ZM243.8 294.6L256.1 287.5L257.4 287.7L245.1 294.8ZM244.6 294.3L256.4 287.5L264.8 288.9L253.1 295.7ZM248 296.5L275.9 312.7L288.3 305.5L260.3 289.4ZM246.7 296.3L274.7 312.4L275.9 312.7L248 296.5ZM257.5 298.3L283.9 313.5L295.7 306.8L269.3 291.5ZM249 296.8L275.5 312.1L283.9 313.5L257.5 298.3ZM274.7 312.4L287 305.3L288.3 305.5L275.9 312.7ZM275.5 312.1L287.2 305.3L295.7 306.8L283.9 313.5ZM418.4 275L417.9 273.2L424.7 274.4L425.2 276.1ZM427.8 274.1L426.4 275.7L433.1 276.9L434.5 275.3ZM420.6 276.2L418.4 275L425.2 276.1L427.4 277.4ZM426.4 275.7L423.6 276.5L430.4 277.7L433.1 276.9ZM423.6 276.5L420.6 276.2L427.4 277.4L430.4 277.7ZM433.1 276.9L430.4 277.7L427.4 277.4L425.2 276.1L424.7 274.4L426.1 272.8L428.8 272L431.9 272.3L434.1 273.5L434.5 275.3ZM426.3 279.5L425.9 277.8L432.6 279L433.1 280.7ZM435.7 278.7L434.3 280.3L441.1 281.4L442.5 279.9ZM428.5 280.8L426.3 279.5L433.1 280.7L435.3 282ZM434.3 280.3L431.6 281.1L438.3 282.2L441.1 281.4ZM431.6 281.1L428.5 280.8L435.3 282L438.3 282.2ZM441.1 281.4L438.3 282.2L435.3 282L433.1 280.7L432.6 279L434 277.4L436.8 276.6L439.8 276.8L442 278.1L442.5 279.9ZM429.1 278.4L428.7 276.7L435.4 277.8L435.9 279.6ZM438.5 277.6L437.1 279.1L443.9 280.3L445.3 278.7ZM434.3 284.1L433.8 282.4L440.6 283.5L441 285.3ZM431.3 279.7L429.1 278.4L435.9 279.6L438.1 280.9ZM437.1 279.1L434.4 280L441.1 281.1L443.9 280.3ZM443.6 283.3L442.3 284.8L449 286L450.4 284.4ZM434.4 280L431.3 279.7L438.1 280.9L441.1 281.1ZM443.9 280.3L441.1 281.1L438.1 280.9L435.9 279.6L435.4 277.8L436.8 276.3L439.6 275.4L442.6 275.7L444.8 277L445.3 278.7ZM436.5 285.4L434.3 284.1L441 285.3L443.2 286.5ZM442.3 284.8L439.5 285.7L446.3 286.8L449 286ZM439.5 285.7L436.5 285.4L443.2 286.5L446.3 286.8ZM449 286L446.3 286.8L443.2 286.5L441 285.3L440.6 283.5L442 281.9L444.7 281.1L447.8 281.4L449.9 282.7L450.4 284.4ZM437.1 283L436.6 281.2L443.4 282.4L443.9 284.2ZM446.5 282.1L445.1 283.7L451.8 284.9L453.2 283.3ZM439.3 284.3L437.1 283L443.9 284.2L446 285.4ZM445.1 283.7L442.3 284.5L449.1 285.7L451.8 284.9ZM442.3 284.5L439.3 284.3L446 285.4L449.1 285.7ZM451.8 284.9L449.1 285.7L446 285.4L443.9 284.2L443.4 282.4L444.8 280.8L447.5 280L450.6 280.3L452.7 281.6L453.2 283.3ZM439.9 281.9L439.4 280.1L446.2 281.3L446.7 283.1ZM449.3 281L447.9 282.6L454.6 283.8L456 282.2ZM442.1 283.1L439.9 281.9L446.7 283.1L448.8 284.3ZM447.9 282.6L445.1 283.4L451.9 284.6L454.6 283.8ZM445.1 283.4L442.1 283.1L448.8 284.3L451.9 284.6ZM454.6 283.8L451.9 284.6L448.8 284.3L446.7 283.1L446.2 281.3L447.6 279.7L450.3 278.9L453.4 279.2L455.5 280.4L456 282.2ZM440.8 309.1L442.5 308.1L463.1 320L461.4 321ZM448.9 305.7L447 307.1L467.6 319L469.5 317.5ZM440.2 309.4L440.8 309.1L461.4 321L460.8 321.3ZM447 307.1L444.2 308.4L464.8 320.3L467.6 319ZM441.2 309.2L440.2 309.4L460.8 321.3L461.8 321ZM444.2 308.4L441.2 309.2L461.8 321L464.8 320.3ZM467.6 319L464.8 320.3L461.8 321L460.8 321.3L461.4 321L463.1 320L465.5 318.6L467.8 317.2L469.5 316.3L470.2 315.9L470 316.3L469.5 317.5ZM423.2 319.3L424.9 318.3L445.5 330.1L443.8 331.1ZM431.3 315.8L429.4 317.3L449.9 329.2L451.8 327.7ZM422.6 319.6L423.2 319.3L443.8 331.1L443.1 331.5ZM429.4 317.3L426.6 318.6L447.1 330.4L449.9 329.2ZM423.6 319.3L422.6 319.6L443.1 331.5L444.2 331.2ZM426.6 318.6L423.6 319.3L444.2 331.2L447.1 330.4ZM449.9 329.2L447.1 330.4L444.2 331.2L443.1 331.5L443.8 331.1L445.5 330.1L447.8 328.8L450.2 327.4L451.9 326.4L452.5 326.1L452.3 326.5L451.8 327.7ZM275.6 284.7L277.4 285.7L290.9 288L289.1 287ZM277.4 285.7L279.2 284.7L292.7 287L290.9 288ZM289.1 287L290.9 288L292.7 287L290.9 286ZM305.3 301.8L307.1 300.8L320.6 303.1L318.8 304.2ZM303.5 300.8L305.3 301.8L318.8 304.2L317.1 303.1ZM317.1 303.1L318.8 304.2L320.6 303.1L318.8 302.1ZM333.2 317.9L335 316.9L348.5 319.3L346.7 320.3ZM331.5 316.9L333.2 317.9L346.7 320.3L345 319.3ZM345 319.3L346.7 320.3L348.5 319.3L346.7 318.2ZM282.4 287.5L402.9 357.1L412.8 351.3L292.4 281.7ZM281.5 287.4L402 356.9L402.9 357.1L282.4 287.5ZM359.4 333L361.1 334L374.7 336.4L372.9 335.4ZM361.1 334L362.9 333L376.4 335.4L374.7 336.4ZM372.9 335.4L374.7 336.4L376.4 335.4L374.7 334.4ZM389.1 350.2L390.8 349.1L404.3 351.5L402.6 352.5ZM387.3 349.1L389.1 350.2L402.6 352.5L400.8 351.5ZM400.8 351.5L402.6 352.5L404.3 351.5L402.6 350.5ZM402 356.9L412 351.2L412.8 351.3L402.9 357.1Z"/></g></g><g data-part="byp" style="--i:0"><path class="p-right" d="M490.4 319.8L449.3 296L449.3 294L490.4 317.8ZM449.3 296L405.2 321.5L405.2 319.5L449.3 294ZM446.4 345.2L490.4 319.8L490.4 317.8L446.4 343.2ZM405.2 321.5L446.4 345.2L446.4 343.2L405.2 319.5Z"/><path class="p-plaster" d="M449.3 296L490.4 319.8L446.4 345.2L405.2 321.5Z"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.79" d="M446.4 345.2L490.4 319.8M490.4 317.8L446.4 343.2M446.4 345.2L405.2 321.5M446.4 343.2L405.2 319.5"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.77" d="M490.4 319.8L490.4 317.8M405.2 321.5L405.2 319.5"/><path class="p-line2" stroke-width="0.72" stroke-opacity="0.36" d="M446.4 343.2L446.4 345.2"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.76" d="M405.2 319.5L449.3 294M449.3 294L490.4 317.8"/><path class="p-metal p-lo" d="M440.8 313.8L442.5 314.8L463.1 326.7L461.4 325.7ZM440.2 311.5L440.8 313.8L461.4 325.7L460.8 323.4ZM440.8 308.4L440.2 311.5L460.8 323.4L461.4 320.3ZM465.5 315.2L463.1 317.3L461.4 320.3L460.8 323.4L461.4 325.7L463.1 326.7L465.5 326.1L467.8 324L469.5 321L470.2 317.9L469.5 315.6L467.8 314.6ZM423.2 324L424.9 325L445.5 336.9L443.8 335.9ZM422.6 321.7L423.2 324L443.8 335.9L443.1 333.5ZM423.2 318.6L422.6 321.7L443.1 333.5L443.8 330.5ZM447.8 325.4L445.5 327.5L443.8 330.5L443.1 333.5L443.8 335.9L445.5 336.9L447.8 336.3L450.2 334.2L451.9 331.2L452.5 328.1L451.9 325.8L450.2 324.8Z"/><path class="p-metal" d="M447.2 302.7L444.9 303.3L465.5 315.2L467.8 314.6ZM444.9 303.3L442.5 305.4L463.1 317.3L465.5 315.2ZM442.5 305.4L440.8 308.4L461.4 320.3L463.1 317.3ZM429.6 312.9L427.3 313.5L447.8 325.4L450.2 324.8ZM427.3 313.5L424.9 315.6L445.5 327.5L447.8 325.4ZM424.9 315.6L423.2 318.6L443.8 330.5L445.5 327.5Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.76" d="M444.9 303.3L442.5 305.4M442.5 305.4L440.8 308.4M440.8 308.4L440.2 311.5M440.2 311.5L440.8 313.8M440.8 313.8L442.5 314.8M442.5 314.8L463.1 326.7M447.2 302.7L444.9 303.3"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.35" d="M463.1 317.3L465.5 315.2M461.4 320.3L463.1 317.3M460.8 323.4L461.4 320.3M461.4 325.7L460.8 323.4M463.1 326.7L461.4 325.7M465.5 315.2L467.8 314.6M445.5 327.5L447.8 325.4M443.8 330.5L445.5 327.5M443.1 333.5L443.8 330.5M443.8 335.9L443.1 333.5M445.5 336.9L443.8 335.9M447.8 325.4L450.2 324.8"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.77" d="M465.5 326.1L463.1 326.7M467.8 324L465.5 326.1M469.5 321L467.8 324M470.2 317.9L469.5 321M469.5 315.6L470.2 317.9M447.2 302.7L467.8 314.6M467.8 314.6L469.5 315.6M427.3 313.5L424.9 315.6M424.9 315.6L423.2 318.6M423.2 318.6L422.6 321.7M422.6 321.7L423.2 324M423.2 324L424.9 325M429.6 312.9L427.3 313.5"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.78" d="M424.9 325L445.5 336.9M447.8 336.3L445.5 336.9M450.2 334.2L447.8 336.3M451.9 331.2L450.2 334.2M452.5 328.1L451.9 331.2M451.9 325.8L452.5 328.1M429.6 312.9L450.2 324.8M450.2 324.8L451.9 325.8"/></g><g data-part="crude" style="--i:2"><g clip-path="url(#p372qc0)"><path class="p-shadow" opacity="0.633" filter="url(#p372qb16)" d="M299.1 115.7L372.8 158.2L299.1 200.7L225.4 158.2Z"/></g><path class="p-line2" stroke-width="0.60" stroke-opacity="0.20" d="M270 108.4L343.5 150.8M196.6 150.8L270 108.4"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.22" d="M343.5 150.8L270 193.2M270 193.2L196.6 150.8"/><path class="p-metal p-lo" d="M249.5 134.7L249.5 130.9L249.5 31.8L249.5 35.6ZM251.5 138.3L249.5 134.7L249.5 35.6L251.5 39.2ZM290.6 134.7L288.6 138.3L288.6 39.2L290.6 35.6ZM255.3 141.3L251.5 138.3L251.5 39.2L255.3 42.2ZM288.6 138.3L284.7 141.3L284.7 42.2L288.6 39.2ZM284.7 141.3L279.5 143.5L279.5 44.4L284.7 42.2ZM260.6 143.5L255.3 141.3L255.3 42.2L260.6 44.4ZM279.5 143.5L273.3 144.7L273.3 45.6L279.5 44.4ZM266.8 144.7L260.6 143.5L260.6 44.4L266.8 45.6ZM273.3 144.7L266.8 144.7L266.8 45.6L273.3 45.6ZM284.8 155.1L284.8 151.3L284.8 52.2L284.8 56ZM214.3 155.1L214.3 151.3L214.3 52.2L214.3 56ZM286.8 158.6L284.8 155.1L284.8 56L286.8 59.5ZM325.8 155.1L323.8 158.6L323.8 59.5L325.8 56ZM216.3 158.6L214.3 155.1L214.3 56L216.3 59.5ZM255.3 155.1L253.3 158.6L253.3 59.5L255.3 56ZM290.6 161.7L286.8 158.6L286.8 59.5L290.6 62.6ZM323.8 158.6L320 161.7L320 62.6L323.8 59.5ZM220.1 161.7L216.3 158.6L216.3 59.5L220.1 62.6ZM253.3 158.6L249.5 161.7L249.5 62.6L253.3 59.5ZM320 161.7L314.7 163.9L314.7 64.8L320 62.6ZM295.9 163.9L290.6 161.7L290.6 62.6L295.9 64.8ZM249.5 161.7L244.2 163.9L244.2 64.8L249.5 62.6ZM225.3 163.9L220.1 161.7L220.1 62.6L225.3 64.8ZM302.1 165L295.9 163.9L295.9 64.8L302.1 65.9ZM231.5 165L225.3 163.9L225.3 64.8L231.5 65.9ZM314.7 163.9L308.6 165L308.6 65.9L314.7 64.8ZM244.2 163.9L238 165L238 65.9L244.2 64.8ZM308.6 165L302.1 165L302.1 65.9L308.6 65.9ZM238 165L231.5 165L231.5 65.9L238 65.9ZM249.5 175.4L249.5 171.7L249.5 72.6L249.5 76.3ZM251.5 179L249.5 175.4L249.5 76.3L251.5 79.9ZM290.6 175.4L288.6 179L288.6 79.9L290.6 76.3ZM255.3 182L251.5 179L251.5 79.9L255.3 82.9ZM288.6 179L284.7 182L284.7 82.9L288.6 79.9ZM284.7 182L279.5 184.2L279.5 85.1L284.7 82.9ZM260.6 184.2L255.3 182L255.3 82.9L260.6 85.1ZM279.5 184.2L273.3 185.4L273.3 86.3L279.5 85.1ZM266.8 185.4L260.6 184.2L260.6 85.1L266.8 86.3ZM273.3 185.4L266.8 185.4L266.8 86.3L273.3 86.3Z"/><path class="p-metal" d="M284.7 42.2L279.5 44.4L273.3 45.6L266.8 45.6L260.6 44.4L255.3 42.2L251.5 39.2L249.5 35.6L249.5 31.8L251.5 28.3L255.3 25.2L260.6 23L266.8 21.9L273.3 21.9L279.5 23L284.7 25.2L288.6 28.3L290.6 31.8L290.6 35.6L288.6 39.2ZM320 62.6L314.7 64.8L308.6 65.9L302.1 65.9L295.9 64.8L290.6 62.6L286.8 59.5L284.8 56L284.8 52.2L286.8 48.6L290.6 45.6L295.9 43.4L302.1 42.2L308.6 42.2L314.7 43.4L320 45.6L323.8 48.6L325.8 52.2L325.8 56L323.8 59.5ZM249.5 62.6L244.2 64.8L238 65.9L231.5 65.9L225.3 64.8L220.1 62.6L216.3 59.5L214.3 56L214.3 52.2L216.3 48.6L220.1 45.6L225.3 43.4L231.5 42.2L238 42.2L244.2 43.4L249.5 45.6L253.3 48.6L255.3 52.2L255.3 56L253.3 59.5ZM284.7 82.9L279.5 85.1L273.3 86.3L266.8 86.3L260.6 85.1L255.3 82.9L251.5 79.9L249.5 76.3L249.5 72.6L251.5 69L255.3 66L260.6 63.7L266.8 62.6L273.3 62.6L279.5 63.7L284.7 66L288.6 69L290.6 72.6L290.6 76.3L288.6 79.9Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.52" d="M284.7 141.3L279.5 143.5M260.6 143.5L255.3 141.3M255.3 141.3L251.5 138.3M251.5 138.3L249.5 134.7M290.6 134.7L288.6 138.3M288.6 138.3L284.7 141.3"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.26" d="M279.5 44.4L284.7 42.2M273.3 45.6L279.5 44.4M266.8 45.6L273.3 45.6M260.6 44.4L266.8 45.6M255.3 42.2L260.6 44.4M251.5 39.2L255.3 42.2M249.5 35.6L251.5 39.2M249.5 31.8L249.5 35.6M288.6 39.2L290.6 35.6M284.7 42.2L288.6 39.2"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.53" d="M279.5 143.5L273.3 144.7M273.3 144.7L266.8 144.7M266.8 144.7L260.6 143.5"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.51" d="M249.5 134.7L249.5 130.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.54" d="M249.5 130.9L249.5 31.8M290.6 134.7L290.6 35.6M286.8 158.6L284.8 155.1M284.8 155.1L284.8 151.3M325.8 155.1L323.8 158.6M216.3 158.6L214.3 155.1M214.3 155.1L214.3 151.3M255.3 155.1L253.3 158.6"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.57" d="M251.5 28.3L249.5 31.8M255.3 25.2L251.5 28.3M288.6 28.3L284.7 25.2M290.6 31.8L288.6 28.3M284.8 151.3L284.8 52.2M325.8 155.1L325.8 56M214.3 151.3L214.3 52.2M255.3 155.1L255.3 56M255.3 182L251.5 179M251.5 179L249.5 175.4M290.6 175.4L288.6 179M288.6 179L284.7 182"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.56" d="M260.6 23L255.3 25.2M266.8 21.9L260.6 23M273.3 21.9L266.8 21.9M279.5 23L273.3 21.9M284.7 25.2L279.5 23M249.5 175.4L249.5 171.7"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.58" d="M290.6 35.6L290.6 31.8M284.7 182L279.5 184.2M279.5 184.2L273.3 185.4M273.3 185.4L266.8 185.4M266.8 185.4L260.6 184.2M260.6 184.2L255.3 182"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.55" d="M320 161.7L314.7 163.9M314.7 163.9L308.6 165M308.6 165L302.1 165M302.1 165L295.9 163.9M295.9 163.9L290.6 161.7M290.6 161.7L286.8 158.6M323.8 158.6L320 161.7M249.5 161.7L244.2 163.9M244.2 163.9L238 165M238 165L231.5 165M231.5 165L225.3 163.9M225.3 163.9L220.1 161.7M220.1 161.7L216.3 158.6M253.3 158.6L249.5 161.7"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.28" d="M314.7 64.8L320 62.6M308.6 65.9L314.7 64.8M302.1 65.9L308.6 65.9M295.9 64.8L302.1 65.9M290.6 62.6L295.9 64.8M244.2 64.8L249.5 62.6M238 65.9L244.2 64.8M231.5 65.9L238 65.9M225.3 64.8L231.5 65.9M220.1 62.6L225.3 64.8M249.5 72.6L249.5 76.3"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.27" d="M286.8 59.5L290.6 62.6M284.8 56L286.8 59.5M284.8 52.2L284.8 56M323.8 59.5L325.8 56M320 62.6L323.8 59.5M216.3 59.5L220.1 62.6M214.3 56L216.3 59.5M214.3 52.2L214.3 56M253.3 59.5L255.3 56M249.5 62.6L253.3 59.5"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.60" d="M286.8 48.6L284.8 52.2M325.8 52.2L323.8 48.6M325.8 56L325.8 52.2M216.3 48.6L214.3 52.2M255.3 52.2L253.3 48.6M255.3 56L255.3 52.2M249.5 171.7L249.5 72.6M290.6 175.4L290.6 76.3"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.59" d="M290.6 45.6L286.8 48.6M295.9 43.4L290.6 45.6M302.1 42.2L295.9 43.4M308.6 42.2L302.1 42.2M314.7 43.4L308.6 42.2M320 45.6L314.7 43.4M323.8 48.6L320 45.6M220.1 45.6L216.3 48.6M225.3 43.4L220.1 45.6M231.5 42.2L225.3 43.4M238 42.2L231.5 42.2M244.2 43.4L238 42.2M249.5 45.6L244.2 43.4M253.3 48.6L249.5 45.6"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.29" d="M279.5 85.1L284.7 82.9M273.3 86.3L279.5 85.1M266.8 86.3L273.3 86.3M260.6 85.1L266.8 86.3M255.3 82.9L260.6 85.1M251.5 79.9L255.3 82.9M249.5 76.3L251.5 79.9M288.6 79.9L290.6 76.3M284.7 82.9L288.6 79.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.63" d="M251.5 69L249.5 72.6M290.6 72.6L288.6 69M290.6 76.3L290.6 72.6"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.62" d="M255.3 66L251.5 69M260.6 63.7L255.3 66M266.8 62.6L260.6 63.7M273.3 62.6L266.8 62.6M279.5 63.7L273.3 62.6M284.7 66L279.5 63.7M288.6 69L284.7 66"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.23" d="M284.7 42.2L270 29M270 45.7L270 29M255.3 42.2L270 29M290.6 45.6L305.3 49.3M305.3 42.1L305.3 49.3M320 45.6L305.3 49.3M220.1 45.6L234.8 49.3M234.8 42.1L234.8 49.3M249.5 45.6L234.8 49.3"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.22" d="M249.3 33.7L270 29M255.3 25.2L270 29M270 21.7L270 29M284.7 25.2L270 29M290.8 33.7L270 29"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.24" d="M320 62.6L305.3 49.3M305.3 66.1L305.3 49.3M290.6 62.6L305.3 49.3M284.5 54.1L305.3 49.3M326.1 54.1L305.3 49.3M249.5 62.6L234.8 49.3M234.8 66.1L234.8 49.3M220.1 62.6L234.8 49.3M214 54.1L234.8 49.3M255.6 54.1L234.8 49.3M255.3 66L270 69.7M270 62.4L270 69.7M284.7 66L270 69.7"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.25" d="M284.7 82.9L270 69.7M270 86.4L270 69.7M255.3 82.9L270 69.7M249.3 74.4L270 69.7M290.8 74.4L270 69.7"/></g><g data-part="fixed" style="--i:3"><g clip-path="url(#p372qc1)"><path class="p-shadow" opacity="0.633" filter="url(#p372qb1)" d="M175.3 178.6L217.2 202.8L187.1 220.2L145.2 196Z"/></g><g clip-path="url(#p372qc2)"><path class="p-shadow" opacity="0.633" filter="url(#p372qb2)" d="M176 170.8L218.1 195.1L187.8 212.6L145.7 188.3Z"/></g><path class="p-top" d="M143.7 187.8L184.8 211.6L214.2 194.6L173.1 170.9Z"/><path class="p-left" d="M143.7 195.6L184.8 219.4L184.8 211.6L143.7 187.8Z"/><path class="p-right" d="M184.8 219.4L214.2 202.4L214.2 194.6L184.8 211.6Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.62" d="M184.8 219.4L214.2 202.4"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.61" d="M214.2 202.4L214.2 194.6M184.8 219.4L143.7 195.6"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.28" d="M214.2 194.6L184.8 211.6M184.8 211.6L184.8 219.4M143.7 187.8L184.8 211.6"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.60" d="M143.7 195.6L143.7 187.8"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.59" d="M143.7 187.8L173.1 170.9M214.2 194.6L173.1 170.9"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.23" d="M150.1 197.7L154.8 200.4M154.8 200.4L154.8 198.9M154.8 198.9L150.1 196.2M150.1 196.2L150.1 197.7M150.1 194.7L154.8 197.4M150.1 193.1L150.1 194.7"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.24" d="M154.8 197.4L154.8 195.9M154.8 195.9L150.1 193.1M161.8 204.5L166.5 207.2M166.5 207.2L166.5 205.7M166.5 205.7L161.8 203M161.8 203L161.8 204.5M161.8 201.4L166.5 204.2M166.5 204.2L166.5 202.6M166.5 202.6L161.8 199.9M161.8 199.9L161.8 201.4M173.6 211.3L178.3 214M178.3 214L178.3 212.5M178.3 212.5L173.6 209.7M173.6 209.7L173.6 211.3M173.6 208.2L178.3 210.9M178.3 210.9L178.3 209.4M178.3 209.4L173.6 206.7M173.6 206.7L173.6 208.2M207.8 204.5L203.1 207.2M203.1 207.2L203.1 205.7M203.1 205.7L207.8 203M207.8 203L207.8 204.5M207.8 201.4L203.1 204.2M203.1 204.2L203.1 202.6M203.1 202.6L207.8 199.9M207.8 199.9L207.8 201.4M196 211.3L191.3 214M191.3 214L191.3 212.5M191.3 212.5L196 209.7M196 209.7L196 211.3M196 208.2L191.3 210.9M191.3 210.9L191.3 209.4M191.3 209.4L196 206.7M196 206.7L196 208.2"/><path class="p-top" d="M173.1 170.9L143.7 187.8L173.1 177.7ZM143.7 187.8L184.8 211.6L184.8 184.5L173.1 177.7Z"/><path class="p-left" d="M214.2 194.6L173.1 170.9L173.1 177.7L184.8 184.5ZM184.8 211.6L214.2 194.6L184.8 184.5Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.62" d="M143.7 187.8L184.8 211.6M184.8 211.6L214.2 194.6"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.63" d="M184.8 211.6L184.8 184.5M184.8 184.5L184.8 211.6"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.61" d="M184.8 184.5L173.1 177.7M173.1 177.7L184.8 184.5M184.8 184.5L214.2 194.6M214.2 194.6L184.8 184.5"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.60" d="M173.1 177.7L143.7 187.8M143.7 187.8L173.1 177.7"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.59" d="M214.2 194.6L173.1 170.9M173.1 170.9L173.1 177.7M173.1 170.9L143.7 187.8M173.1 177.7L173.1 170.9"/></g><g data-part="conv" style="--i:4"><g clip-path="url(#p372qc3)"><path class="p-shadow" opacity="0.633" filter="url(#p372qb4)" d="M366.1 163.3L477.3 227.5L421.9 259.4L310.7 195.2Z"/></g><path class="p-top" d="M326.5 177.3L349.4 190.5L372.3 177.3L349.4 164.1ZM350 190.9L372.9 204.1L395.8 190.9L372.9 177.6ZM373.5 204.4L396.4 217.7L419.3 204.4L396.4 191.2ZM305.3 188.4L399.3 242.7L414 234.2L320 179.9ZM397 218L419.9 231.2L442.8 218L419.9 204.8ZM449.3 199.3L458.1 204.4L466.9 199.3L458.1 194.2Z"/><path class="p-metal p-lo" d="M336.3 180.4L335.3 177.3L335.3 166.2L336.3 169.3ZM363.5 177.3L362.4 180.4L362.4 169.3L363.5 166.2ZM339.4 183.1L336.3 180.4L336.3 169.3L339.4 172ZM362.4 180.4L359.4 183.1L359.4 172L362.4 169.3ZM359.4 183.1L354.8 184.8L354.8 173.8L359.4 172ZM344 184.8L339.4 183.1L339.4 172L344 173.8ZM354.8 184.8L349.4 185.4L349.4 174.4L354.8 173.8ZM349.4 185.4L344 184.8L344 173.8L349.4 174.4ZM359.8 194L358.8 190.9L358.8 179.8L359.8 182.9ZM387 190.9L386 194L386 182.9L387 179.8ZM362.9 196.6L359.8 194L359.8 182.9L362.9 185.6ZM386 194L382.9 196.6L382.9 185.6L386 182.9ZM382.9 196.6L378.3 198.4L378.3 187.3L382.9 185.6ZM367.5 198.4L362.9 196.6L362.9 185.6L367.5 187.3ZM378.3 198.4L372.9 199L372.9 188L378.3 187.3ZM372.9 199L367.5 198.4L367.5 187.3L372.9 188ZM410.5 204.4L409.5 207.6L409.5 196.5L410.5 193.4ZM383.4 207.6L382.3 204.4L382.3 193.4L383.4 196.5ZM386.4 210.2L383.4 207.6L383.4 196.5L386.4 199.1ZM409.5 207.6L406.4 210.2L406.4 199.1L409.5 196.5ZM406.4 210.2L401.8 212L401.8 200.9L406.4 199.1ZM391 212L386.4 210.2L386.4 199.1L391 200.9ZM401.8 212L396.4 212.6L396.4 201.5L401.8 200.9ZM396.4 212.6L391 212L391 200.9L396.4 201.5ZM406.9 221.1L405.8 218L405.8 206.9L406.9 210.1ZM434 218L433 221.1L433 210.1L434 206.9ZM409.9 223.8L406.9 221.1L406.9 210.1L409.9 212.7ZM433 221.1L429.9 223.8L429.9 212.7L433 210.1ZM429.9 223.8L425.3 225.5L425.3 214.5L429.9 212.7ZM414.5 225.5L409.9 223.8L409.9 212.7L414.5 214.5ZM425.3 225.5L419.9 226.2L419.9 215.1L425.3 214.5ZM419.9 226.2L414.5 225.5L414.5 214.5L419.9 215.1Z"/><path class="p-right" d="M349.4 195.3L372.3 182L372.3 177.3L349.4 190.5ZM326.5 182L349.4 195.3L349.4 190.5L326.5 177.3ZM372.9 208.8L395.8 195.6L395.8 190.9L372.9 204.1ZM350 195.6L372.9 208.8L372.9 204.1L350 190.9ZM373.5 209.2L396.4 222.4L396.4 217.7L373.5 204.4ZM396.4 222.4L419.3 209.2L419.3 204.4L396.4 217.7ZM419.9 236L442.8 222.7L442.8 218L419.9 231.2ZM397 222.7L419.9 236L419.9 231.2L397 218ZM458.1 231.2L466.9 226.1L466.9 199.3L458.1 204.4ZM399.3 248.2L414 239.7L414 234.2L399.3 242.7Z"/><path class="p-metal" d="M359.4 172L354.8 173.8L349.4 174.4L344 173.8L339.4 172L336.3 169.3L335.3 166.2L336.3 163.1L339.4 160.5L344 158.7L349.4 158.1L354.8 158.7L359.4 160.5L362.4 163.1L363.5 166.2L362.4 169.3ZM382.9 185.6L378.3 187.3L372.9 188L367.5 187.3L362.9 185.6L359.8 182.9L358.8 179.8L359.8 176.7L362.9 174L367.5 172.3L372.9 171.6L378.3 172.3L382.9 174L386 176.7L387 179.8L386 182.9ZM406.4 199.1L401.8 200.9L396.4 201.5L391 200.9L386.4 199.1L383.4 196.5L382.3 193.4L383.4 190.3L386.4 187.6L391 185.8L396.4 185.2L401.8 185.8L406.4 187.6L409.5 190.3L410.5 193.4L409.5 196.5ZM429.9 212.7L425.3 214.5L419.9 215.1L414.5 214.5L409.9 212.7L406.9 210.1L405.8 206.9L406.9 203.8L409.9 201.2L414.5 199.4L419.9 198.8L425.3 199.4L429.9 201.2L433 203.8L434 206.9L433 210.1Z"/><path class="p-left" d="M305.3 193.9L399.3 248.2L399.3 242.7L305.3 188.4ZM449.3 226.1L458.1 231.2L458.1 204.4L449.3 199.3Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.58" d="M349.4 195.3L372.3 182M372.3 182L372.3 177.3M326.5 182L326.5 177.3M349.4 195.3L326.5 182M339.4 183.1L336.3 180.4M336.3 180.4L335.3 177.3M335.3 177.3L335.3 166.2M336.3 163.1L335.3 166.2M339.4 160.5L336.3 163.1M344 158.7L339.4 160.5M359.4 160.5L354.8 158.7M362.4 163.1L359.4 160.5M363.5 177.3L363.5 166.2M363.5 166.2L362.4 163.1M363.5 177.3L362.4 180.4M362.4 180.4L359.4 183.1"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.26" d="M372.3 177.3L349.4 190.5M326.5 177.3L349.4 190.5M336.3 169.3L339.4 172M335.3 166.2L336.3 169.3M362.4 169.3L363.5 166.2M359.4 172L362.4 169.3"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.27" d="M349.4 190.5L349.4 195.3M395.8 190.9L372.9 204.1M350 190.9L372.9 204.1M354.8 173.8L359.4 172M349.4 174.4L354.8 173.8M344 173.8L349.4 174.4M339.4 172L344 173.8M359.8 182.9L362.9 185.6M358.8 179.8L359.8 182.9M386 182.9L387 179.8M382.9 185.6L386 182.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.57" d="M326.5 177.3L349.4 164.1M372.3 177.3L349.4 164.1M349.4 158.1L344 158.7M354.8 158.7L349.4 158.1"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.60" d="M372.9 208.8L395.8 195.6M395.8 195.6L395.8 190.9M350 195.6L350 190.9M372.9 208.8L350 195.6M362.9 196.6L359.8 194M359.8 194L358.8 190.9M358.8 190.9L358.8 179.8M359.8 176.7L358.8 179.8M362.9 174L359.8 176.7M367.5 172.3L362.9 174M382.9 174L378.3 172.3M386 176.7L382.9 174M387 190.9L387 179.8M387 179.8L386 176.7M387 190.9L386 194M386 194L382.9 196.6"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.28" d="M372.9 204.1L372.9 208.8M419.3 204.4L396.4 217.7M396.4 217.7L396.4 222.4M373.5 204.4L396.4 217.7M378.3 187.3L382.9 185.6M372.9 188L378.3 187.3M367.5 187.3L372.9 188M362.9 185.6L367.5 187.3M401.8 200.9L406.4 199.1M386.4 199.1L391 200.9M383.4 196.5L386.4 199.1M382.3 193.4L383.4 196.5M409.5 196.5L410.5 193.4M406.4 199.1L409.5 196.5M305.3 188.4L399.3 242.7"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.59" d="M350 190.9L372.9 177.6M395.8 190.9L372.9 177.6M359.4 183.1L354.8 184.8M354.8 184.8L349.4 185.4M349.4 185.4L344 184.8M344 184.8L339.4 183.1M372.9 171.6L367.5 172.3M378.3 172.3L372.9 171.6M305.3 193.9L305.3 188.4M305.3 188.4L320 179.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.62" d="M396.4 222.4L419.3 209.2M419.3 209.2L419.3 204.4M373.5 209.2L373.5 204.4M396.4 222.4L373.5 209.2M386.4 210.2L383.4 207.6M383.4 207.6L382.3 204.4M382.3 204.4L382.3 193.4M383.4 190.3L382.3 193.4M386.4 187.6L383.4 190.3M391 185.8L386.4 187.6M406.4 187.6L401.8 185.8M409.5 190.3L406.4 187.6M410.5 204.4L410.5 193.4M410.5 193.4L409.5 190.3M410.5 204.4L409.5 207.6M409.5 207.6L406.4 210.2M414 234.2L320 179.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.61" d="M373.5 204.4L396.4 191.2M419.3 204.4L396.4 191.2M382.9 196.6L378.3 198.4M378.3 198.4L372.9 199M372.9 199L367.5 198.4M367.5 198.4L362.9 196.6M396.4 185.2L391 185.8M401.8 185.8L396.4 185.2"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.64" d="M419.9 236L442.8 222.7M442.8 222.7L442.8 218M397 222.7L397 218M419.9 236L397 222.7M409.9 223.8L406.9 221.1M406.9 221.1L405.8 218M405.8 218L405.8 206.9M406.9 203.8L405.8 206.9M409.9 201.2L406.9 203.8M414.5 199.4L409.9 201.2M429.9 201.2L425.3 199.4M433 203.8L429.9 201.2M434 218L434 206.9M434 206.9L433 203.8M434 218L433 221.1M433 221.1L429.9 223.8M458.1 231.2L466.9 226.1M458.1 231.2L449.3 226.1"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.29" d="M442.8 218L419.9 231.2M419.9 231.2L419.9 236M397 218L419.9 231.2M396.4 201.5L401.8 200.9M391 200.9L396.4 201.5M425.3 214.5L429.9 212.7M419.9 215.1L425.3 214.5M414.5 214.5L419.9 215.1M409.9 212.7L414.5 214.5M406.9 210.1L409.9 212.7M405.8 206.9L406.9 210.1M433 210.1L434 206.9M429.9 212.7L433 210.1M458.1 204.4L458.1 231.2"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.63" d="M397 218L419.9 204.8M442.8 218L419.9 204.8M406.4 210.2L401.8 212M401.8 212L396.4 212.6M396.4 212.6L391 212M391 212L386.4 210.2M419.9 198.8L414.5 199.4M425.3 199.4L419.9 198.8M399.3 248.2L305.3 193.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.65" d="M429.9 223.8L425.3 225.5M425.3 225.5L419.9 226.2M419.9 226.2L414.5 225.5M414.5 225.5L409.9 223.8M466.9 226.1L466.9 199.3M449.3 226.1L449.3 199.3"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.67" d="M399.3 248.2L414 239.7"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.66" d="M414 239.7L414 234.2M449.3 199.3L458.1 194.2M466.9 199.3L458.1 194.2"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.30" d="M414 234.2L399.3 242.7M399.3 242.7L399.3 248.2M466.9 199.3L458.1 204.4M449.3 199.3L458.1 204.4"/><path class="p-line" stroke-width="0.60" stroke-opacity="0.38" d="M345 168.8L336.2 172.6"/><path class="p-line" stroke-width="0.60" stroke-opacity="0.39" d="M336.2 172.6L328.8 188.4"/><path class="p-line" stroke-width="0.60" stroke-opacity="0.40" d="M368.5 182.3L359.7 186.2M359.7 186.2L352.3 201.9"/><path class="p-line" stroke-width="0.60" stroke-opacity="0.41" d="M392 195.9L383.2 199.7M383.2 199.7L375.8 215.5"/><path class="p-line" stroke-width="0.60" stroke-opacity="0.42" d="M415.5 209.5L406.7 213.3"/><path class="p-line" stroke-width="0.60" stroke-opacity="0.43" d="M406.7 213.3L399.3 229.1"/></g><g data-part="freight" style="--i:5"><g clip-path="url(#p372qc4)"><path class="p-shadow" opacity="0.578" filter="url(#p372qb3)" d="M108.9 199.7L293 306L278.7 314.2L94.6 207.9Z"/></g><g clip-path="url(#p372qc6)"><path class="p-shadow" opacity="0.633" filter="url(#p372qb4)" d="M284.7 279.2L407.3 349.9L395.2 356.9L272.7 286.2Z"/></g><path class="p-top" d="M90.3 201.5L118.3 217.6L130.6 210.4L102.7 194.3ZM91.4 188.1L117.8 203.4L129.6 196.6L103.1 181.3ZM121.2 219.3L149.1 235.4L161.5 228.3L133.5 212.1ZM122.2 205.9L148.7 221.2L160.4 214.4L134 199.2ZM152.1 237.1L180 253.2L192.3 246.1L164.4 230ZM153.1 223.8L179.5 239L191.3 232.2L164.8 217ZM182.9 254.9L210.8 271L223.2 263.9L195.3 247.8ZM183.9 241.6L210.4 256.8L222.1 250.1L195.7 234.8ZM213.8 272.7L241.7 288.8L254 281.7L226.1 265.6ZM214.8 259.4L241.2 274.7L253 267.9L226.5 252.6ZM244.6 290.5L272.5 306.6L284.9 299.5L257 283.4ZM245.7 277.2L272.1 292.5L283.9 285.7L257.4 270.4Z"/><path class="p-right" d="M90.3 203.5L118.3 219.6L118.3 217.6L90.3 201.5ZM118.3 219.6L130.6 212.5L130.6 210.4L118.3 217.6ZM117.8 217L129.6 210.2L129.6 196.6L117.8 203.4ZM121.2 221.3L149.1 237.4L149.1 235.4L121.2 219.3ZM149.1 237.4L161.5 230.3L161.5 228.3L149.1 235.4ZM148.7 234.8L160.4 228L160.4 214.4L148.7 221.2ZM152.1 239.1L180 255.2L180 253.2L152.1 237.1ZM180 255.2L192.3 248.1L192.3 246.1L180 253.2ZM179.5 252.6L191.3 245.8L191.3 232.2L179.5 239ZM182.9 256.9L210.8 273.1L210.8 271L182.9 254.9ZM210.8 273.1L223.2 265.9L223.2 263.9L210.8 271ZM210.4 270.4L222.1 263.6L222.1 250.1L210.4 256.8ZM213.8 274.7L241.7 290.9L241.7 288.8L213.8 272.7ZM241.7 290.9L254 283.7L254 281.7L241.7 288.8ZM241.2 288.2L253 281.5L253 267.9L241.2 274.7ZM244.6 292.6L272.5 308.7L272.5 306.6L244.6 290.5ZM272.5 308.7L284.9 301.6L284.9 299.5L272.5 306.6ZM272.1 306.1L283.9 299.3L283.9 285.7L272.1 292.5Z"/><path class="p-left" d="M91.4 201.7L117.8 217L117.8 203.4L91.4 188.1ZM122.2 219.5L148.7 234.8L148.7 221.2L122.2 205.9ZM153.1 237.3L179.5 252.6L179.5 239L153.1 223.8ZM183.9 255.2L210.4 270.4L210.4 256.8L183.9 241.6ZM214.8 273L241.2 288.2L241.2 274.7L214.8 259.4ZM245.7 290.8L272.1 306.1L272.1 292.5L245.7 277.2Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.63" d="M118.3 219.6L130.6 212.5M130.6 212.5L130.6 210.4M118.3 219.6L90.3 203.5M117.8 217L129.6 210.2M129.6 210.2L129.6 196.6M129.6 196.6L103.1 181.3M117.8 217L91.4 201.7"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.28" d="M130.6 210.4L118.3 217.6M90.3 201.5L118.3 217.6M91.4 188.1L117.8 203.4"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.29" d="M118.3 217.6L118.3 219.6M129.6 196.6L117.8 203.4M117.8 203.4L117.8 217M121.2 219.3L149.1 235.4"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.61" d="M90.3 203.5L90.3 201.5M90.3 201.5L102.7 194.3"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.62" d="M130.6 210.4L102.7 194.3M91.4 201.7L91.4 188.1M91.4 188.1L103.1 181.3"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.66" d="M149.1 237.4L161.5 230.3M148.7 234.8L160.4 228M160.4 228L160.4 214.4M152.1 237.1L164.4 230"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.65" d="M161.5 230.3L161.5 228.3M149.1 237.4L121.2 221.3M122.2 219.5L122.2 205.9M122.2 205.9L134 199.2M160.4 214.4L134 199.2M148.7 234.8L122.2 219.5"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.30" d="M161.5 228.3L149.1 235.4M149.1 235.4L149.1 237.4M160.4 214.4L148.7 221.2M148.7 221.2L148.7 234.8M122.2 205.9L148.7 221.2M152.1 237.1L180 253.2"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.64" d="M121.2 221.3L121.2 219.3M121.2 219.3L133.5 212.1M161.5 228.3L133.5 212.1"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.69" d="M180 255.2L192.3 248.1M179.5 252.6L191.3 245.8M191.3 245.8L191.3 232.2M182.9 254.9L195.3 247.8"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.68" d="M192.3 248.1L192.3 246.1M180 255.2L152.1 239.1M191.3 232.2L164.8 217M179.5 252.6L153.1 237.3"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.31" d="M192.3 246.1L180 253.2M180 253.2L180 255.2M191.3 232.2L179.5 239M179.5 239L179.5 252.6M153.1 223.8L179.5 239"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.67" d="M152.1 239.1L152.1 237.1M192.3 246.1L164.4 230M153.1 237.3L153.1 223.8M153.1 223.8L164.8 217"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.71" d="M210.8 273.1L223.2 265.9M223.2 265.9L223.2 263.9M210.8 273.1L182.9 256.9M210.4 270.4L222.1 263.6M222.1 263.6L222.1 250.1M222.1 250.1L195.7 234.8M210.4 270.4L183.9 255.2"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.32" d="M223.2 263.9L210.8 271M210.8 271L210.8 273.1M182.9 254.9L210.8 271M222.1 250.1L210.4 256.8M210.4 256.8L210.4 270.4M183.9 241.6L210.4 256.8"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.70" d="M182.9 256.9L182.9 254.9M223.2 263.9L195.3 247.8M183.9 255.2L183.9 241.6M183.9 241.6L195.7 234.8"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.74" d="M241.7 290.9L254 283.7M241.2 288.2L253 281.5M253 281.5L253 267.9M244.6 290.5L257 283.4"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.73" d="M254 283.7L254 281.7M241.7 290.9L213.8 274.7M214.8 273L214.8 259.4M214.8 259.4L226.5 252.6M253 267.9L226.5 252.6M241.2 288.2L214.8 273"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.33" d="M254 281.7L241.7 288.8M241.7 288.8L241.7 290.9M213.8 272.7L241.7 288.8M253 267.9L241.2 274.7M241.2 274.7L241.2 288.2M214.8 259.4L241.2 274.7"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.72" d="M213.8 274.7L213.8 272.7M213.8 272.7L226.1 265.6M254 281.7L226.1 265.6"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.76" d="M272.5 308.7L284.9 301.6M284.9 301.6L284.9 299.5M272.5 308.7L244.6 292.6M272.1 306.1L283.9 299.3M283.9 299.3L283.9 285.7M283.9 285.7L257.4 270.4M272.1 306.1L245.7 290.8"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.34" d="M284.9 299.5L272.5 306.6M272.5 306.6L272.5 308.7M244.6 290.5L272.5 306.6M245.7 277.2L272.1 292.5"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.75" d="M244.6 292.6L244.6 290.5M284.9 299.5L257 283.4M245.7 290.8L245.7 277.2M245.7 277.2L257.4 270.4"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.35" d="M283.9 285.7L272.1 292.5M272.1 292.5L272.1 306.1"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.23" d="M96.1 195.6L83.7 202.7"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.24" d="M107.8 202.4L95.5 209.5M119.6 209.2L107.2 216.3M131.3 216L119 223.1"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.25" d="M143.1 222.7L130.7 229.9M154.8 229.5L142.5 236.7"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.26" d="M166.6 236.3L154.3 243.4M178.4 243.1L166 250.2M190.1 249.9L177.8 257"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.27" d="M201.9 256.7L189.5 263.8M213.6 263.5L201.3 270.6"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.28" d="M225.4 270.3L213 277.4M237.1 277L224.8 284.2M248.9 283.8L236.5 291"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.29" d="M260.6 290.6L248.3 297.7M272.4 297.4L260.1 304.5"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.30" d="M284.1 304.2L271.8 311.3M295.9 311L283.6 318.1M307.7 317.8L295.3 324.9"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.31" d="M319.4 324.5L307.1 331.7M331.2 331.3L318.8 338.5M342.9 338.1L330.6 345.2M354.7 344.9L342.3 352"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.32" d="M366.4 351.7L354.1 358.8M378.2 358.5L365.8 365.6M389.9 365.3L377.6 372.4"/><path class="p-line" stroke-width="0.60" stroke-opacity="0.47" d="M90.8 194.9L396.4 371.4M83.1 199.3L388.8 375.8"/><path class="p-left" d="M275.6 284.7L277.4 285.7L277.4 264L275.6 263ZM303.5 300.8L305.3 301.8L305.3 280.1L303.5 279.1ZM331.5 316.9L333.2 317.9L333.2 296.2L331.5 295.2ZM268 263.3L388.5 332.9L388.5 331.5L268 261.9ZM359.4 333L361.1 334L361.1 312.4L359.4 311.3ZM387.3 349.1L389.1 350.2L389.1 328.5L387.3 327.5Z"/><path class="p-right" d="M277.4 285.7L279.2 284.7L279.2 263L277.4 264ZM305.3 301.8L307.1 300.8L307.1 279.1L305.3 280.1ZM333.2 317.9L335 316.9L335 295.2L333.2 296.2ZM361.1 334L362.9 333L362.9 311.3L361.1 312.4ZM389.1 350.2L390.8 349.1L390.8 327.5L389.1 328.5ZM388.5 332.9L398.5 327.1L398.5 325.7L388.5 331.5Z"/><path class="p-top" d="M275.6 263L277.4 264L279.2 263L277.4 262ZM303.5 279.1L305.3 280.1L307.1 279.1L305.3 278.1ZM331.5 295.2L333.2 296.2L335 295.2L333.2 294.2ZM268 261.9L388.5 331.5L398.5 325.7L278 256.2ZM359.4 311.3L361.1 312.4L362.9 311.3L361.1 310.3ZM387.3 327.5L389.1 328.5L390.8 327.5L389.1 326.4Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.73" d="M277.4 285.7L279.2 284.7M277.4 285.7L275.6 284.7"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.74" d="M279.2 284.7L279.2 263M275.6 284.7L275.6 263M275.6 263L277.4 262M279.2 263L277.4 262M268 263.3L268 261.9M268 261.9L278 256.2"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.33" d="M279.2 263L277.4 264M277.4 264L277.4 285.7M275.6 263L277.4 264"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.75" d="M305.3 301.8L307.1 300.8M305.3 301.8L303.5 300.8"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.76" d="M307.1 300.8L307.1 279.1M303.5 300.8L303.5 279.1M303.5 279.1L305.3 278.1M307.1 279.1L305.3 278.1"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.34" d="M307.1 279.1L305.3 280.1M305.3 280.1L305.3 301.8M303.5 279.1L305.3 280.1"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.77" d="M333.2 317.9L335 316.9M333.2 317.9L331.5 316.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.78" d="M335 316.9L335 295.2M331.5 316.9L331.5 295.2M331.5 295.2L333.2 294.2M335 295.2L333.2 294.2M398.5 325.7L278 256.2"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.35" d="M335 295.2L333.2 296.2M333.2 296.2L333.2 317.9M331.5 295.2L333.2 296.2M268 261.9L388.5 331.5"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.79" d="M361.1 334L362.9 333M361.1 334L359.4 333M388.5 332.9L268 263.3"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.80" d="M362.9 333L362.9 311.3M359.4 333L359.4 311.3M359.4 311.3L361.1 310.3M362.9 311.3L361.1 310.3"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.36" d="M362.9 311.3L361.1 312.4M361.1 312.4L361.1 334M359.4 311.3L361.1 312.4M389.1 328.5L389.1 350.2"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.81" d="M389.1 350.2L390.8 349.1M390.8 349.1L390.8 327.5M387.3 349.1L387.3 327.5M389.1 350.2L387.3 349.1"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.37" d="M390.8 327.5L389.1 328.5M387.3 327.5L389.1 328.5M398.5 325.7L388.5 331.5M388.5 331.5L388.5 332.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.82" d="M387.3 327.5L389.1 326.4M390.8 327.5L389.1 326.4M388.5 332.9L398.5 327.1M398.5 327.1L398.5 325.7"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.30" d="M277.4 251.8L397.9 321.3"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.29" d="M277.4 256.5L277.4 251.8"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.32" d="M397.9 326.1L397.9 321.3"/></g><g data-part="cont" style="--i:6"><g clip-path="url(#p372qc5)"><path class="p-shadow" opacity="0.633" filter="url(#p372qb5)" d="M432.2 269.6L458.1 284.5L448.4 290.1L422.6 275.2Z"/></g><path class="p-line2" stroke-width="0.80" stroke-opacity="0.65" stroke-dasharray="4 4" d="M490.4 300.8L537.5 273.6M425.8 243.1L490.4 280.4"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.63" stroke-dasharray="4 4" d="M537.5 273.6L537.5 253.3"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.66" stroke-dasharray="4 4" d="M537.5 253.3L490.4 280.4"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.67" stroke-dasharray="4 4" d="M490.4 280.4L490.4 300.8"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.60" stroke-dasharray="4 4" d="M472.8 236.3L425.8 263.5M472.8 236.3L537.5 273.6"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.62" stroke-dasharray="4 4" d="M425.8 263.5L425.8 243.1M537.5 253.3L472.8 216"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.61" stroke-dasharray="4 4" d="M425.8 243.1L472.8 216"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.58" stroke-dasharray="4 4" d="M472.8 216L472.8 236.3"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.64" stroke-dasharray="4 4" d="M490.4 300.8L425.8 263.5"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.65" stroke-dasharray="4 4" d="M425.8 243.1L490.4 280.4M514 254L537.5 253.3M537.5 253.3L514 254"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.67" stroke-dasharray="4 4" d="M490.4 280.4L514 254M514 254L490.4 280.4"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.64" stroke-dasharray="4 4" d="M514 254L449.3 216.6M449.3 216.6L514 254"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.62" stroke-dasharray="4 4" d="M449.3 216.6L425.8 243.1M537.5 253.3L472.8 216M425.8 243.1L449.3 216.6"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.61" stroke-dasharray="4 4" d="M472.8 216L449.3 216.6M472.8 216L425.8 243.1M449.3 216.6L472.8 216"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.66" stroke-dasharray="4 4" d="M490.4 280.4L537.5 253.3"/><path class="p-top" d="M418.4 275L417.9 273.2L417.9 262.3L418.4 264.1ZM426.4 264.8L423.6 265.6L420.6 265.4L418.4 264.1L417.9 262.3L419.3 260.8L422.1 259.9L425.1 260.2L427.3 261.5L427.8 263.2ZM426.3 279.5L425.9 277.8L425.9 266.9L426.3 268.7ZM434.3 269.4L431.6 270.2L428.5 269.9L426.3 268.7L425.9 266.9L427.3 265.3L430 264.5L433.1 264.8L435.2 266.1L435.7 267.8ZM422.4 266.4L421.9 264.6L421.9 253.8L422.4 255.5ZM434.3 284.1L433.8 282.4L433.8 271.5L434.3 273.3ZM430.3 256.3L427.6 257.1L424.6 256.8L422.4 255.5L421.9 253.8L423.3 252.2L426 251.4L429.1 251.7L431.3 252.9L431.7 254.7ZM442.3 274L439.5 274.8L436.5 274.5L434.3 273.3L433.8 271.5L435.2 269.9L437.9 269.1L441 269.4L443.2 270.6L443.6 272.4ZM430.3 271L429.8 269.2L429.8 258.3L430.3 260.1ZM438.3 260.8L435.5 261.6L432.5 261.4L430.3 260.1L429.8 258.3L431.2 256.8L434 256L437 256.2L439.2 257.5L439.7 259.3ZM426.3 257.8L425.9 256.1L425.9 245.2L426.3 247ZM434.3 247.7L431.6 248.5L428.5 248.2L426.3 247L425.9 245.2L427.3 243.6L430 242.8L433.1 243.1L435.2 244.3L435.7 246.1Z"/><path class="p-right" d="M427.8 274.1L426.4 275.7L426.4 264.8L427.8 263.2ZM426.4 275.7L423.6 276.5L423.6 265.6L426.4 264.8ZM423.6 276.5L420.6 276.2L420.6 265.4L423.6 265.6ZM435.7 278.7L434.3 280.3L434.3 269.4L435.7 267.8ZM434.3 280.3L431.6 281.1L431.6 270.2L434.3 269.4ZM431.6 281.1L428.5 280.8L428.5 269.9L431.6 270.2ZM431.7 265.5L430.3 267.1L430.3 256.3L431.7 254.7ZM430.3 267.1L427.6 267.9L427.6 257.1L430.3 256.3ZM443.6 283.3L442.3 284.8L442.3 274L443.6 272.4ZM427.6 267.9L424.6 267.6L424.6 256.8L427.6 257.1ZM442.3 284.8L439.5 285.7L439.5 274.8L442.3 274ZM439.5 285.7L436.5 285.4L436.5 274.5L439.5 274.8ZM439.7 270.1L438.3 271.7L438.3 260.8L439.7 259.3ZM438.3 271.7L435.5 272.5L435.5 261.6L438.3 260.8ZM435.5 272.5L432.5 272.2L432.5 261.4L435.5 261.6ZM435.7 257L434.3 258.5L434.3 247.7L435.7 246.1ZM434.3 258.5L431.6 259.4L431.6 248.5L434.3 247.7ZM431.6 259.4L428.5 259.1L428.5 248.2L431.6 248.5Z"/><path class="p-left" d="M420.6 276.2L418.4 275L418.4 264.1L420.6 265.4ZM428.5 280.8L426.3 279.5L426.3 268.7L428.5 269.9ZM424.6 267.6L422.4 266.4L422.4 255.5L424.6 256.8ZM436.5 285.4L434.3 284.1L434.3 273.3L436.5 274.5ZM432.5 272.2L430.3 271L430.3 260.1L432.5 261.4ZM428.5 259.1L426.3 257.8L426.3 247L428.5 248.2Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.72" d="M426.4 275.7L423.6 276.5M423.6 276.5L420.6 276.2M417.9 273.2L417.9 262.3M419.3 260.8L417.9 262.3M422.1 259.9L419.3 260.8M425.1 260.2L422.1 259.9M427.3 261.5L425.1 260.2M427.8 274.1L427.8 263.2M427.8 263.2L427.3 261.5M434.3 280.3L431.6 281.1M431.6 281.1L428.5 280.8M428.5 280.8L426.3 279.5M426.3 279.5L425.9 277.8M425.9 277.8L425.9 266.9M427.3 265.3L425.9 266.9M430 264.5L427.3 265.3M433.1 264.8L430 264.5M435.2 266.1L433.1 264.8M435.7 278.7L435.7 267.8M435.7 278.7L434.3 280.3M422.4 266.4L421.9 264.6M431.7 265.5L430.3 267.1"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.32" d="M423.6 265.6L426.4 264.8M420.6 265.4L423.6 265.6M418.4 264.1L420.6 265.4M417.9 262.3L418.4 264.1M426.4 264.8L427.8 263.2M425.9 266.9L426.3 268.7"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.71" d="M420.6 276.2L418.4 275M418.4 275L417.9 273.2M427.8 274.1L426.4 275.7"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.33" d="M431.6 270.2L434.3 269.4M428.5 269.9L431.6 270.2M426.3 268.7L428.5 269.9M434.3 269.4L435.7 267.8M439.5 274.8L442.3 274M436.5 274.5L439.5 274.8M434.3 273.3L436.5 274.5M433.8 271.5L434.3 273.3M442.3 274L443.6 272.4M427.6 257.1L430.3 256.3M424.6 256.8L427.6 257.1M422.4 255.5L424.6 256.8M421.9 253.8L422.4 255.5M430.3 256.3L431.7 254.7M435.5 261.6L438.3 260.8M432.5 261.4L435.5 261.6M430.3 260.1L432.5 261.4M429.8 258.3L430.3 260.1M438.3 260.8L439.7 259.3M431.6 248.5L434.3 247.7M428.5 248.2L431.6 248.5M426.3 247L428.5 248.2M425.9 245.2L426.3 247M434.3 247.7L435.7 246.1"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.73" d="M435.7 267.8L435.2 266.1M442.3 284.8L439.5 285.7M439.5 285.7L436.5 285.4M436.5 285.4L434.3 284.1M434.3 284.1L433.8 282.4M433.8 282.4L433.8 271.5M435.2 269.9L433.8 271.5M437.9 269.1L435.2 269.9M441 269.4L437.9 269.1M443.2 270.6L441 269.4M443.6 283.3L443.6 272.4M443.6 272.4L443.2 270.6M443.6 283.3L442.3 284.8M430.3 267.1L427.6 267.9M427.6 267.9L424.6 267.6M424.6 267.6L422.4 266.4M421.9 264.6L421.9 253.8M423.3 252.2L421.9 253.8M426 251.4L423.3 252.2M429.1 251.7L426 251.4M431.3 252.9L429.1 251.7M431.7 265.5L431.7 254.7M431.7 254.7L431.3 252.9M438.3 271.7L435.5 272.5M435.5 272.5L432.5 272.2M432.5 272.2L430.3 271M430.3 271L429.8 269.2M429.8 269.2L429.8 258.3M434 256L431.2 256.8M437 256.2L434 256M439.2 257.5L437 256.2M439.7 270.1L439.7 259.3M439.7 270.1L438.3 271.7M426.3 257.8L425.9 256.1"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.74" d="M431.2 256.8L429.8 258.3M439.7 259.3L439.2 257.5M434.3 258.5L431.6 259.4M431.6 259.4L428.5 259.1M428.5 259.1L426.3 257.8M425.9 256.1L425.9 245.2M427.3 243.6L425.9 245.2M430 242.8L427.3 243.6M433.1 243.1L430 242.8M435.2 244.3L433.1 243.1M435.7 257L435.7 246.1M435.7 246.1L435.2 244.3M435.7 257L434.3 258.5"/></g></svg>', steel: '<svg xmlns="http://www.w3.org/2000/svg" class="ps3d-poster" data-reg="1" data-v="2" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><clipPath id="p42rnc0"><path d="M264 94.4L570.7 271.5L376 383.9L69.3 206.8Z"/></clipPath><clipPath id="p42rnc1"><path d="M264 22.9L343.6 68.8L311.1 87.6L231.5 41.6Z"/></clipPath><clipPath id="p42rnc2"><path d="M264 94.4L570.7 271.5L376 383.9L69.3 206.8Z"/></clipPath><clipPath id="p42rnc3"><path d="M264 94.4L570.7 271.5L376 383.9L69.3 206.8Z"/></clipPath><clipPath id="p42rnc4"><path d="M264 94.4L570.7 271.5L376 383.9L69.3 206.8Z"/></clipPath><clipPath id="p42rnc5"><path d="M163.7 109.4L281.7 177.5L246.3 198L128.2 129.8Z"/></clipPath><clipPath id="p42rnc6"><path d="M264 94.4L570.7 271.5L376 383.9L69.3 206.8Z"/></clipPath><clipPath id="p42rnc7"><path d="M264 94.4L570.7 271.5L376 383.9L69.3 206.8Z"/></clipPath><clipPath id="p42rnc8"><path d="M315.6 240L356.9 263.8L327.3 280.9L286 257Z"/></clipPath><clipPath id="p42rnc9"><path d="M264 94.4L570.7 271.5L376 383.9L69.3 206.8Z"/></clipPath><clipPath id="p42rnc10"><path d="M264 94.4L570.7 271.5L376 383.9L69.3 206.8Z"/></clipPath><clipPath id="p42rnc11"><path d="M393.7 264.7L429.2 285.1L399.6 302.2L364.2 281.7Z"/></clipPath><clipPath id="p42rnk"><path d="M264 94.4L570.7 271.5L376 383.8L69.3 206.7Z"/></clipPath><filter id="p42rnb1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1"/></filter><filter id="p42rnb2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter><filter id="p42rnb3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter><filter id="p42rnb4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter><filter id="p42rnb5" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter><filter id="p42rnb6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter><filter id="p42rnb7" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter><filter id="p42rnb10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter><filter id="p42rnb13" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="13"/></filter><filter id="p42rnb14" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter></defs><g data-part="site" style="--i:0"><path class="p-plaster" d="M69.3 206.8L376 383.9L570.7 271.5L264 94.4Z"/><path class="p-right" d="M69.3 210.9L376 388L376 383.9L69.3 206.8ZM376 388L570.7 275.6L570.7 271.5L376 383.9Z"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.47" d="M376 388L570.7 275.6"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.42" d="M570.7 275.6L570.7 271.5"/><path class="p-line2" stroke-width="0.72" stroke-opacity="0.21" d="M570.7 271.5L376 383.9"/><path class="p-line2" stroke-width="0.72" stroke-opacity="0.22" d="M376 383.9L376 388"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.37" d="M69.3 210.9L69.3 206.8"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.32" d="M69.3 206.8L264 94.4"/><path class="p-line2" stroke-width="0.72" stroke-opacity="0.20" d="M69.3 206.8L376 383.9"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.35" d="M570.7 271.5L264 94.4"/><path class="p-line2" stroke-width="1.28" stroke-opacity="0.44" d="M376 388L69.3 210.9"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p42rnb5)" d="M265.2 97L574.8 275.8L377.2 389.9L67.6 211.1Z"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p42rnb1)" d="M265.7 98.5L407.8 180.5L392.5 189.3L250.4 107.3Z"/></g><g clip-path="url(#p42rnk)"><g opacity="0.360" filter="url(#p42rnb2)"><path class="p-shadow" d="M250.3 103.1L391.9 184.9L406.6 176.3L265 94.6ZM249.2 102.9L390.8 184.7L391.9 184.9L250.3 103.1ZM390.8 184.7L405.5 176.2L406.6 176.3L391.9 184.9ZM231.5 133.6L311.2 179.6L368.5 189.5L288.8 143.5ZM288.8 143.5L368.5 189.5L400.9 170.8L321.3 124.8ZM311.2 179.6L343.6 160.8L400.9 170.8L368.5 189.5ZM321.3 124.8L288.8 143.5L311.9 135.3ZM400.9 170.8L321.3 124.8L311.9 135.3L391.5 181.3ZM288.8 143.5L368.5 189.5L391.5 181.3L311.9 135.3ZM368.5 189.5L400.9 170.8L391.5 181.3ZM301.8 191L300.8 188.1L341.7 195.2L342.8 198.1ZM327.4 188.1L326.4 191L367.4 198.1L368.4 195.2ZM304.7 193.5L301.8 191L342.8 198.1L345.6 200.6ZM326.4 191L323.5 193.5L364.5 200.6L367.4 198.1ZM323.5 193.5L319.2 195.2L360.2 202.3L364.5 200.6ZM309 195.2L304.7 193.5L345.6 200.6L350 202.3ZM319.2 195.2L314.1 195.8L355.1 202.9L360.2 202.3ZM314.1 195.8L309 195.2L350 202.3L355.1 202.9ZM364.5 200.6L360.2 202.3L355.1 202.9L350 202.3L345.6 200.6L342.8 198.1L341.7 195.2L342.8 192.2L345.6 189.7L350 188.1L355.1 187.5L360.2 188.1L364.5 189.7L367.4 192.2L368.4 195.2L367.4 198.1ZM275.2 206.4L274.2 203.4L315.2 210.5L316.2 213.5ZM300.9 203.4L299.9 206.4L340.9 213.5L341.9 210.5ZM278.1 208.9L275.2 206.4L316.2 213.5L319.1 216ZM299.9 206.4L297 208.9L338 216L340.9 213.5ZM297 208.9L292.7 210.5L333.6 217.6L338 216ZM282.4 210.5L278.1 208.9L319.1 216L323.4 217.6ZM292.7 210.5L287.6 211.1L328.5 218.2L333.6 217.6ZM287.6 211.1L282.4 210.5L323.4 217.6L328.5 218.2ZM314.1 218.9L314.1 215.1L359.7 223L359.7 226.8ZM338 216L333.6 217.6L328.5 218.2L323.4 217.6L319.1 216L316.2 213.5L315.2 210.5L316.2 207.6L319.1 205.1L323.4 203.4L328.5 202.8L333.6 203.4L338 205.1L340.9 207.6L341.9 210.5L340.9 213.5ZM316.2 222.5L314.1 218.9L359.7 226.8L361.7 230.4ZM355.3 218.9L353.3 222.5L398.9 230.4L400.9 226.8ZM353.3 222.5L349.5 225.5L395 233.4L398.9 230.4ZM320 225.5L316.2 222.5L361.7 230.4L365.5 233.4ZM325.3 227.8L320 225.5L365.5 233.4L370.8 235.7ZM349.5 225.5L344.2 227.8L389.8 235.7L395 233.4ZM344.2 227.8L338 228.9L383.5 236.8L389.8 235.7ZM331.5 228.9L325.3 227.8L370.8 235.7L377 236.8ZM338 228.9L331.5 228.9L377 236.8L383.5 236.8ZM395 233.4L389.8 235.7L383.5 236.8L377 236.8L370.8 235.7L365.5 233.4L361.7 230.4L359.7 226.8L359.7 223L361.7 219.5L365.5 216.4L370.8 214.2L377 213L383.5 213L389.8 214.2L395 216.4L398.9 219.5L400.9 223L400.9 226.8L398.9 230.4ZM128.3 193.2L246.3 261.3L285.8 268.2L167.8 200ZM167.8 200L285.8 268.2L321.2 247.7L203.2 179.6ZM246.3 261.3L281.7 240.9L321.2 247.7L285.8 268.2ZM351.9 241.2L356 238.8L369.1 241.1L365 243.5ZM348.9 239.5L351.9 241.2L365 243.5L362.1 241.8ZM362.1 241.8L365 243.5L369.1 241.1L366.2 239.4ZM378.4 256.5L382.5 254.2L395.7 256.4L391.6 258.8ZM375.5 254.8L378.4 256.5L391.6 258.8L388.6 257.1ZM388.6 257.1L391.6 258.8L395.7 256.4L392.7 254.7ZM203.2 179.6L167.8 200L194.4 191.4ZM321.2 247.7L203.2 179.6L194.4 191.4L312.4 259.5ZM167.8 200L285.8 268.2L312.4 259.5L194.4 191.4ZM285.8 268.2L321.2 247.7L312.4 259.5ZM382.9 226.9L382 225.7L385.4 226.3L386.3 227.5ZM387.9 225.7L387 226.9L390.4 227.5L391.3 226.3ZM390.4 227.5L388.4 228L386.3 227.5L385.4 226.3L386.3 225.1L388.4 224.6L390.4 225.1L391.3 226.3ZM387 226.9L385 227.4L388.4 228L390.4 227.5ZM385 227.4L382.9 226.9L386.3 227.5L388.4 228ZM360.5 250.7L359.6 247.9L371.9 250.1L372.8 252.8ZM384.6 247.9L383.6 250.7L396 252.8L396.9 250.1ZM363.2 253L360.5 250.7L372.8 252.8L375.6 255.2ZM383.6 250.7L380.9 253L393.2 255.2L396 252.8ZM393.2 255.2L389.2 256.7L384.4 257.3L379.6 256.7L375.6 255.2L372.8 252.8L371.9 250.1L372.8 247.3L375.6 245L379.6 243.4L384.4 242.8L389.2 243.4L393.2 245L396 247.3L396.9 250.1L396 252.8ZM380.9 253L376.9 254.6L389.2 256.7L393.2 255.2ZM367.3 254.6L363.2 253L375.6 255.2L379.6 256.7ZM377.6 251.1L377.6 249L380.9 249.6L380.9 251.7ZM372.1 255.2L367.3 254.6L379.6 256.7L384.4 257.3ZM376.9 254.6L372.1 255.2L384.4 257.3L389.2 256.7ZM392.8 253.6L389.6 254.6L386 254.6L382.8 253.6L380.9 251.7L380.9 249.6L382.8 247.8L386 246.7L389.6 246.7L392.8 247.8L394.6 249.6L394.6 251.7ZM379.4 253L377.6 251.1L380.9 251.7L382.8 253.6ZM391.2 251.1L389.4 253L392.8 253.6L394.6 251.7ZM389.4 253L386.2 254L389.6 254.6L392.8 253.6ZM382.6 254L379.4 253L382.8 253.6L386 254.6ZM386.2 254L382.6 254L386 254.6L389.6 254.6ZM302 285.4L343.3 309.2L372.8 292.2L331.5 268.3ZM286.1 282.6L327.4 306.4L343.3 309.2L302 285.4ZM327.4 306.4L356.9 289.4L372.8 292.2L343.3 309.2ZM331.5 268.3L302 285.4L323.1 277.9ZM372.8 292.2L331.5 268.3L323.1 277.9L364.4 301.8ZM302 285.4L343.3 309.2L364.4 301.8L323.1 277.9ZM343.3 309.2L372.8 292.2L364.4 301.8ZM260.6 281.1L248.8 287.9L254.7 289L266.5 282.2ZM287.1 296.5L260.6 281.1L266.5 282.2L293.1 297.5ZM260.6 281.1L287.1 296.5L275.3 303.3L248.8 287.9ZM247.7 287.7L275.8 303.9L288.2 296.7L260.1 280.5ZM246.5 287.5L274.5 303.6L275.8 303.9L247.7 287.7ZM248.8 287.9L275.3 303.3L281.3 304.3L254.7 289ZM274.5 303.6L286.9 296.5L288.2 296.7L275.8 303.9ZM275.3 303.3L287.1 296.5L293.1 297.5L281.3 304.3ZM293 299.9L281.2 306.7L287.2 307.7L299 300.9ZM319.6 315.2L293 299.9L299 300.9L325.5 316.2ZM280.2 306.4L308.2 322.6L320.6 315.5L292.6 299.3ZM293 299.9L319.6 315.2L307.8 322L281.2 306.7ZM278.9 306.2L306.9 322.4L308.2 322.6L280.2 306.4ZM281.2 306.7L307.8 322L313.7 323L287.2 307.7ZM306.9 322.4L319.3 315.2L320.6 315.5L308.2 322.6ZM307.8 322L319.6 315.2L325.5 316.2L313.7 323ZM325.5 318.6L313.7 325.4L319.6 326.4L331.4 319.6ZM352 333.9L325.5 318.6L331.4 319.6L358 335ZM312.6 325.2L340.7 341.3L353 334.2L325 318ZM325.5 318.6L352 333.9L340.2 340.7L313.7 325.4ZM311.4 324.9L339.4 341.1L340.7 341.3L312.6 325.2ZM313.7 325.4L340.2 340.7L346.2 341.8L319.6 326.4ZM339.4 341.1L351.8 334L353 334.2L340.7 341.3ZM340.2 340.7L352 333.9L358 335L346.2 341.8ZM357.9 337.3L346.1 344.1L352.1 345.2L363.9 338.4ZM384.5 352.7L357.9 337.3L363.9 338.4L390.4 353.7ZM345.1 343.9L373.1 360.1L385.5 352.9L357.5 336.7ZM357.9 337.3L384.5 352.7L372.7 359.5L346.1 344.1ZM343.8 343.7L371.8 359.8L373.1 360.1L345.1 343.9ZM346.1 344.1L372.7 359.5L378.6 360.5L352.1 345.2ZM371.8 359.8L384.2 352.7L385.5 352.9L373.1 360.1ZM372.7 359.5L384.5 352.7L390.4 353.7L378.6 360.5ZM364.2 322.6L399.6 343L425.1 347.5L389.7 327ZM389.7 327L425.1 347.5L454.6 330.4L419.2 310ZM399.6 343L429.1 326L454.6 330.4L425.1 347.5ZM419.2 310L389.7 327L424.1 327.3ZM454.6 330.4L419.2 310L424.1 327.3L433 332.4ZM389.7 327L425.1 347.5L433 332.4L424.1 327.3ZM425.1 347.5L454.6 330.4L433 332.4Z"/></g></g><g data-part="ore" style="--i:1"><g clip-path="url(#p42rnc0)"><path class="p-shadow" opacity="0.633" filter="url(#p42rnb14)" d="M290.9 114.7L378.9 165.5L338.1 189.1L250.1 138.3Z"/></g><g clip-path="url(#p42rnc1)"><path class="p-shadow" opacity="0.633" filter="url(#p42rnb2)" d="M267.2 22.8L347.8 69.4L314.3 88.7L233.7 42.1Z"/></g><path class="p-top" d="M249.2 101.2L390.8 183L405.5 174.5L264 92.7Z"/><path class="p-left" d="M249.2 102.9L390.8 184.7L390.8 183L249.2 101.2Z"/><path class="p-right" d="M390.8 184.7L405.5 176.2L405.5 174.5L390.8 183Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.57" d="M390.8 184.7L405.5 176.2M405.5 176.2L405.5 174.5"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.26" d="M405.5 174.5L390.8 183M390.8 183L390.8 184.7"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.49" d="M249.2 102.9L249.2 101.2M249.2 101.2L264 92.7"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.24" d="M249.2 101.2L390.8 183"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.52" d="M405.5 174.5L264 92.7"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.53" d="M390.8 184.7L249.2 102.9"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.20" d="M266.9 94.4L402.6 172.8M322.9 132.6L322.9 126.8M346.5 146.2L346.5 140.4"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.19" d="M275.8 105.3L275.8 99.5M299.4 118.9L299.4 113.2"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.21" d="M370.1 159.8L370.1 154"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.22" d="M393.7 173.4L393.7 167.6"/><path class="p-left" d="M231.5 133.6L311.2 179.6L311.2 87.6L231.5 41.6Z"/><path class="p-top" d="M231.5 41.6L311.2 87.6L343.6 68.9L264 22.9Z"/><path class="p-right" d="M311.2 179.6L343.6 160.8L343.6 68.9L311.2 87.6Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.56" d="M311.2 179.6L343.6 160.8M231.5 41.6L264 22.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.58" d="M343.6 160.8L343.6 68.9M343.6 68.9L264 22.9"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.28" d="M343.6 68.9L311.2 87.6"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.27" d="M311.2 87.6L311.2 179.6M231.5 41.6L311.2 87.6"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.54" d="M231.5 133.6L231.5 41.6M311.2 179.6L231.5 133.6"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.21" d="M236.2 85.8L240.3 124.9M240.3 124.9L244.4 90.5M236.2 85.8L244.4 90.5M246.5 91.7L250.6 130.9M250.6 130.9L254.8 96.5M256.8 97.7L261 136.9"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.22" d="M246.5 91.7L254.8 96.5M261 136.9L265.1 102.5M256.8 97.7L265.1 102.5M267.1 103.7L271.3 142.8M271.3 142.8L275.4 108.4M267.1 103.7L275.4 108.4M277.5 109.6L281.6 148.8M281.6 148.8L285.7 114.4M287.8 115.6L291.9 154.7"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.23" d="M277.5 109.6L285.7 114.4M291.9 154.7L296 120.3M287.8 115.6L296 120.3M298.1 121.5L302.2 160.7M302.2 160.7L306.4 126.3M298.1 121.5L306.4 126.3"/><path class="p-right" d="M264 22.9L231.5 41.6L247.7 21.4ZM311.2 87.6L343.6 68.9L327.4 67.3Z"/><path class="p-left" d="M343.6 68.9L264 22.9L247.7 21.4L327.4 67.3Z"/><path class="p-top" d="M231.5 41.6L311.2 87.6L327.4 67.3L247.7 21.4Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.60" d="M231.5 41.6L311.2 87.6M327.4 67.3L247.7 21.4M247.7 21.4L327.4 67.3"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.64" d="M311.2 87.6L327.4 67.3M327.4 67.3L311.2 87.6"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.57" d="M247.7 21.4L231.5 41.6M231.5 41.6L247.7 21.4"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.58" d="M343.6 68.9L264 22.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.56" d="M264 22.9L247.7 21.4M264 22.9L231.5 41.6M247.7 21.4L264 22.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.62" d="M327.4 67.3L343.6 68.9M343.6 68.9L327.4 67.3"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.63" d="M311.2 87.6L343.6 68.9"/></g><g data-part="conv" style="--i:2"><g clip-path="url(#p42rnc2)"><path class="p-shadow" opacity="0.633" filter="url(#p42rnb13)" d="M337.7 177L404.6 215.6L351.8 246.1L284.9 207.5Z"/></g><g clip-path="url(#p42rnc4)"><path class="p-shadow" opacity="0.633" filter="url(#p42rnb3)" d="M359.2 237.1L390.6 255.2L384.6 258.7L353.2 240.5Z"/></g><g clip-path="url(#p42rnc6)"><path class="p-shadow" opacity="0.465" filter="url(#p42rnb7)" d="M377.9 236.4L399.5 248.9L377.9 261.4L356.3 248.9Z"/></g><path class="p-metal p-lo" d="M301.8 191L300.8 188.1L300.8 122.3L301.8 125.3ZM327.4 188.1L326.4 191L326.4 125.3L327.4 122.3ZM304.7 193.5L301.8 191L301.8 125.3L304.7 127.8ZM326.4 191L323.5 193.5L323.5 127.8L326.4 125.3ZM323.5 193.5L319.2 195.2L319.2 129.5L323.5 127.8ZM309 195.2L304.7 193.5L304.7 127.8L309 129.5ZM319.2 195.2L314.1 195.8L314.1 130L319.2 129.5ZM314.1 195.8L309 195.2L309 129.5L314.1 130ZM275.2 206.4L274.2 203.4L274.2 137.7L275.2 140.6ZM300.9 203.4L299.9 206.4L299.9 140.6L300.9 137.7ZM278.1 208.9L275.2 206.4L275.2 140.6L278.1 143.1ZM299.9 206.4L297 208.9L297 143.1L299.9 140.6ZM297 208.9L292.7 210.5L292.7 144.8L297 143.1ZM282.4 210.5L278.1 208.9L278.1 143.1L282.4 144.8ZM292.7 210.5L287.6 211.1L287.6 145.4L292.7 144.8ZM287.6 211.1L282.4 210.5L282.4 144.8L287.6 145.4ZM314.1 218.9L314.1 215.1L314.1 142.1L314.1 145.9ZM316.2 222.5L314.1 218.9L314.1 145.9L316.2 149.4ZM355.3 218.9L353.3 222.5L353.3 149.4L355.3 145.9ZM353.3 222.5L349.5 225.5L349.5 152.5L353.3 149.4ZM320 225.5L316.2 222.5L316.2 149.4L320 152.5ZM325.3 227.8L320 225.5L320 152.5L325.3 154.7ZM349.5 225.5L344.2 227.8L344.2 154.7L349.5 152.5ZM344.2 227.8L338 228.9L338 155.9L344.2 154.7ZM331.5 228.9L325.3 227.8L325.3 154.7L331.5 155.9ZM338 228.9L331.5 228.9L331.5 155.9L338 155.9Z"/><path class="p-metal" d="M323.5 127.8L319.2 129.5L314.1 130L309 129.5L304.7 127.8L301.8 125.3L300.8 122.3L301.8 119.4L304.7 116.9L309 115.2L314.1 114.6L319.2 115.2L323.5 116.9L326.4 119.4L327.4 122.3L326.4 125.3ZM297 143.1L292.7 144.8L287.6 145.4L282.4 144.8L278.1 143.1L275.2 140.6L274.2 137.7L275.2 134.7L278.1 132.2L282.4 130.5L287.6 130L292.7 130.5L297 132.2L299.9 134.7L300.9 137.7L299.9 140.6ZM349.5 152.5L344.2 154.7L338 155.9L331.5 155.9L325.3 154.7L320 152.5L316.2 149.4L314.1 145.9L314.1 142.1L316.2 138.5L320 135.5L325.3 133.2L331.5 132.1L338 132.1L344.2 133.2L349.5 135.5L353.3 138.5L355.3 142.1L355.3 145.9L353.3 149.4Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.64" d="M349.5 225.5L344.2 227.8M344.2 227.8L338 228.9M338 228.9L331.5 228.9M331.5 228.9L325.3 227.8M325.3 227.8L320 225.5M320 225.5L316.2 222.5M353.3 222.5L349.5 225.5M287.6 130L282.4 130.5M292.7 130.5L287.6 130"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.31" d="M344.2 154.7L349.5 152.5M338 155.9L344.2 154.7M331.5 155.9L338 155.9M325.3 154.7L331.5 155.9M320 152.5L325.3 154.7M316.2 149.4L320 152.5M314.1 145.9L316.2 149.4M314.1 142.1L314.1 145.9M353.3 149.4L355.3 145.9M349.5 152.5L353.3 149.4"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.63" d="M316.2 222.5L314.1 218.9M314.1 218.9L314.1 215.1M355.3 218.9L353.3 222.5M301.8 119.4L300.8 122.3M304.7 116.9L301.8 119.4M326.4 119.4L323.5 116.9M327.4 122.3L326.4 119.4M274.2 203.4L274.2 137.7M300.9 203.4L300.9 137.7"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.65" d="M314.1 215.1L314.1 142.1M275.2 134.7L274.2 137.7M278.1 132.2L275.2 134.7M282.4 130.5L278.1 132.2M297 132.2L292.7 130.5M299.9 134.7L297 132.2M300.9 137.7L299.9 134.7"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.68" d="M316.2 138.5L314.1 142.1M355.3 142.1L353.3 138.5M355.3 145.9L355.3 142.1"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.67" d="M320 135.5L316.2 138.5M325.3 133.2L320 135.5M331.5 132.1L325.3 133.2M344.2 133.2L338 132.1M349.5 135.5L344.2 133.2M353.3 138.5L349.5 135.5"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.66" d="M338 132.1L331.5 132.1M355.3 218.9L355.3 145.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.59" d="M323.5 193.5L319.2 195.2M319.2 195.2L314.1 195.8M314.1 195.8L309 195.2M309 195.2L304.7 193.5M304.7 193.5L301.8 191M301.8 191L300.8 188.1M327.4 188.1L326.4 191M326.4 191L323.5 193.5"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.29" d="M319.2 129.5L323.5 127.8M314.1 130L319.2 129.5M309 129.5L314.1 130M304.7 127.8L309 129.5M301.8 125.3L304.7 127.8M323.5 127.8L326.4 125.3M274.2 137.7L275.2 140.6M299.9 140.6L300.9 137.7"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.61" d="M300.8 188.1L300.8 122.3M327.4 188.1L327.4 122.3M278.1 208.9L275.2 206.4M275.2 206.4L274.2 203.4M300.9 203.4L299.9 206.4M299.9 206.4L297 208.9"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.28" d="M300.8 122.3L301.8 125.3M326.4 125.3L327.4 122.3"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.62" d="M309 115.2L304.7 116.9M314.1 114.6L309 115.2M319.2 115.2L314.1 114.6M323.5 116.9L319.2 115.2M297 208.9L292.7 210.5M292.7 210.5L287.6 211.1M287.6 211.1L282.4 210.5M282.4 210.5L278.1 208.9"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.30" d="M292.7 144.8L297 143.1M287.6 145.4L292.7 144.8M282.4 144.8L287.6 145.4M278.1 143.1L282.4 144.8M275.2 140.6L278.1 143.1M297 143.1L299.9 140.6"/><path class="p-line" stroke-width="0.60" stroke-opacity="0.44" d="M334.7 144L317.1 126.5"/><path class="p-line" stroke-width="0.60" stroke-opacity="0.43" d="M317.1 126.5L300.8 130"/><path class="p-right" d="M351.9 241.2L356 238.8L356 217.7L351.9 220.1ZM378.4 256.5L382.5 254.2L382.5 233L378.4 235.4Z"/><path class="p-left" d="M348.9 239.5L351.9 241.2L351.9 220.1L348.9 218.4ZM375.5 254.8L378.4 256.5L378.4 235.4L375.5 233.7Z"/><path class="p-top" d="M348.9 218.4L351.9 220.1L356 217.7L353 216ZM375.5 233.7L378.4 235.4L382.5 233L379.6 231.3Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.66" d="M351.9 241.2L356 238.8M351.9 241.2L348.9 239.5"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.67" d="M356 238.8L356 217.7M348.9 239.5L348.9 218.4M356 217.7L353 216"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.30" d="M356 217.7L351.9 220.1M351.9 220.1L351.9 241.2M348.9 218.4L351.9 220.1"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.68" d="M348.9 218.4L353 216M378.4 256.5L382.5 254.2"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.69" d="M382.5 254.2L382.5 233M375.5 254.8L375.5 233.7M378.4 256.5L375.5 254.8"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.31" d="M382.5 233L378.4 235.4M378.4 235.4L378.4 256.5M375.5 233.7L378.4 235.4"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.70" d="M375.5 233.7L379.6 231.3M382.5 233L379.6 231.3"/><path class="p-line" stroke-width="0.60" stroke-opacity="0.45" d="M352.4 218.1L379 233.4"/><path class="p-top" d="M332.7 137.7L331.8 136.5L331.8 131L332.7 132.2ZM336.8 132.2L334.7 132.7L332.7 132.2L331.8 131L332.7 129.8L334.7 129.3L336.8 129.8L337.7 131Z"/><path class="p-right" d="M337.7 136.5L336.8 137.7L336.8 132.2L337.7 131ZM336.8 137.7L334.7 138.2L334.7 132.7L336.8 132.2ZM334.7 138.2L332.7 137.7L332.7 132.2L334.7 132.7Z"/><path class="p-line" stroke-width="0.60" stroke-opacity="0.44" d="M320 135.5L334.7 136.5M349.5 135.5L334.7 136.5"/><path class="p-line" stroke-width="0.60" stroke-opacity="0.45" d="M349.5 152.5L334.7 136.5M320 152.5L334.7 136.5"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.69" d="M336.8 137.7L334.7 138.2M334.7 138.2L332.7 137.7M332.7 137.7L331.8 136.5M331.8 136.5L331.8 131M332.7 129.8L331.8 131M334.7 129.3L332.7 129.8M336.8 129.8L334.7 129.3M337.7 136.5L337.7 131M337.7 131L336.8 129.8M337.7 136.5L336.8 137.7"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.31" d="M334.7 132.7L336.8 132.2M332.7 132.2L334.7 132.7M331.8 131L332.7 132.2M336.8 132.2L337.7 131"/><path class="p-metal p-lo" d="M354.2 239.4L353.2 236.6L353.2 216.9L354.2 219.6ZM378.2 236.6L377.3 239.4L377.3 219.6L378.2 216.9ZM356.9 241.7L354.2 239.4L354.2 219.6L356.9 222ZM377.3 239.4L374.6 241.7L374.6 222L377.3 219.6ZM374.6 241.7L370.5 243.3L370.5 223.5L374.6 222ZM360.9 243.3L356.9 241.7L356.9 222L360.9 223.5ZM358.9 217.9L358.9 215.8L358.9 210.3L358.9 212.5ZM365.7 243.8L360.9 243.3L360.9 223.5L365.7 224.1ZM370.5 243.3L365.7 243.8L365.7 224.1L370.5 223.5ZM360.7 219.8L358.9 217.9L358.9 212.5L360.7 214.3ZM372.6 217.9L370.7 219.8L370.7 214.3L372.6 212.5ZM370.7 219.8L367.6 220.8L367.6 215.4L370.7 214.3ZM363.9 220.8L360.7 219.8L360.7 214.3L363.9 215.4ZM367.6 220.8L363.9 220.8L363.9 215.4L367.6 215.4Z"/><path class="p-metal" d="M374.6 222L370.5 223.5L365.7 224.1L360.9 223.5L356.9 222L354.2 219.6L353.2 216.9L354.2 214.1L356.9 211.8L360.9 210.2L365.7 209.6L370.5 210.2L374.6 211.8L377.3 214.1L378.2 216.9L377.3 219.6ZM370.7 214.3L367.6 215.4L363.9 215.4L360.7 214.3L358.9 212.5L358.9 210.3L360.7 208.5L363.9 207.5L367.6 207.5L370.7 208.5L372.6 210.3L372.6 212.5Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.69" d="M374.6 241.7L370.5 243.3M370.5 243.3L365.7 243.8M365.7 243.8L360.9 243.3M360.9 243.3L356.9 241.7M356.9 241.7L354.2 239.4M353.2 236.6L353.2 216.9M354.2 214.1L353.2 216.9M356.9 211.8L354.2 214.1M360.9 210.2L356.9 211.8M374.6 211.8L370.5 210.2M377.3 214.1L374.6 211.8M378.2 236.6L378.2 216.9M378.2 216.9L377.3 214.1M377.3 239.4L374.6 241.7M358.9 217.9L358.9 215.8M363.9 207.5L360.7 208.5M367.6 207.5L363.9 207.5M370.7 208.5L367.6 207.5"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.31" d="M370.5 223.5L374.6 222M356.9 222L360.9 223.5M354.2 219.6L356.9 222M353.2 216.9L354.2 219.6M377.3 219.6L378.2 216.9M374.6 222L377.3 219.6M367.6 215.4L370.7 214.3M360.7 214.3L363.9 215.4M358.9 212.5L360.7 214.3M358.9 210.3L358.9 212.5M370.7 214.3L372.6 212.5"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.32" d="M365.7 224.1L370.5 223.5M360.9 223.5L365.7 224.1M363.9 215.4L367.6 215.4"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.68" d="M354.2 239.4L353.2 236.6M365.7 209.6L360.9 210.2M370.5 210.2L365.7 209.6M378.2 236.6L377.3 239.4"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.70" d="M370.7 219.8L367.6 220.8M367.6 220.8L363.9 220.8M363.9 220.8L360.7 219.8M360.7 219.8L358.9 217.9M358.9 215.8L358.9 210.3M360.7 208.5L358.9 210.3M372.6 210.3L370.7 208.5M372.6 217.9L372.6 212.5M372.6 212.5L372.6 210.3M372.6 217.9L370.7 219.8"/></g><g data-part="labor" style="--i:3"><g clip-path="url(#p42rnc3)"><path class="p-shadow" opacity="0.633" filter="url(#p42rnb10)" d="M182.3 172.6L306.1 244.1L264.8 267.9L141 196.4Z"/></g><g clip-path="url(#p42rnc5)"><path class="p-shadow" opacity="0.633" filter="url(#p42rnb2)" d="M167.9 109.3L287.2 178.2L250.5 199.4L131.2 130.5Z"/></g><path class="p-left" d="M128.3 193.2L246.3 261.3L246.3 197.9L128.3 129.8Z"/><path class="p-top" d="M128.3 129.8L246.3 197.9L281.7 177.5L163.7 109.4Z"/><path class="p-right" d="M246.3 261.3L281.7 240.9L281.7 177.5L246.3 197.9Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.68" d="M246.3 261.3L281.7 240.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.69" d="M281.7 240.9L281.7 177.5"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.32" d="M281.7 177.5L246.3 197.9M246.3 197.9L246.3 261.3"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.61" d="M128.3 193.2L128.3 129.8"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.62" d="M128.3 129.8L163.7 109.4"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.31" d="M128.3 129.8L246.3 197.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.66" d="M281.7 177.5L163.7 109.4"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.64" d="M246.3 261.3L128.3 193.2"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.25" d="M138.1 159.3L143.4 162.4M143.4 162.4L143.4 152.9M143.4 152.9L138.1 149.8M138.1 149.8L138.1 159.3M151.4 167L156.7 170.1M156.7 170.1L156.7 160.6M156.7 160.6L151.4 157.5M151.4 157.5L151.4 167M164.6 174.7L170 177.7M164.6 165.2L164.6 174.7"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.26" d="M170 177.7L170 168.2M170 168.2L164.6 165.2M177.9 182.3L183.2 185.4M183.2 185.4L183.2 175.9M183.2 175.9L177.9 172.8M177.9 172.8L177.9 182.3M191.2 190L196.5 193M191.2 180.5L191.2 190"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.27" d="M196.5 193L196.5 183.5M196.5 183.5L191.2 180.5M204.5 197.6L209.8 200.7M209.8 200.7L209.8 191.2M209.8 191.2L204.5 188.1M204.5 188.1L204.5 197.6M217.7 205.3L223 208.4M223 208.4L223 198.9M217.7 195.8L217.7 205.3M274.3 229.3L268.4 232.7M268.4 232.7L268.4 213.7M268.4 213.7L274.3 210.3M274.3 210.3L274.3 229.3M259.6 237.8L253.7 241.2M253.7 241.2L253.7 222.2M259.6 218.8L259.6 237.8"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.28" d="M223 198.9L217.7 195.8M231 213L236.3 216M236.3 216L236.3 206.5M236.3 206.5L231 203.5M231 203.5L231 213M253.7 222.2L259.6 218.8"/><path class="p-right" d="M163.7 109.4L128.3 129.8L146 105.3ZM246.3 197.9L281.7 177.5L264 173.4Z"/><path class="p-left" d="M281.7 177.5L163.7 109.4L146 105.3L264 173.4Z"/><path class="p-top" d="M128.3 129.8L246.3 197.9L264 173.4L146 105.3Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.69" d="M128.3 129.8L246.3 197.9M264 173.4L146 105.3M146 105.3L264 173.4"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.74" d="M246.3 197.9L264 173.4M264 173.4L246.3 197.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.64" d="M146 105.3L128.3 129.8M128.3 129.8L146 105.3"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.66" d="M281.7 177.5L163.7 109.4"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.62" d="M163.7 109.4L146 105.3M163.7 109.4L128.3 129.8M146 105.3L163.7 109.4"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.72" d="M264 173.4L281.7 177.5M281.7 177.5L264 173.4"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.73" d="M246.3 197.9L281.7 177.5"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.27" d="M151.9 108.7L258.1 170"/></g><g data-part="coke" style="--i:4"><path class="p-line2" stroke-width="0.80" stroke-opacity="0.63" stroke-dasharray="4 4" d="M508.8 283.4L532.4 269.8M532.4 269.8L532.4 239.2"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.65" stroke-dasharray="4 4" d="M532.4 239.2L508.8 252.8M508.8 252.8L508.8 283.4"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.56" stroke-dasharray="4 4" d="M432.1 211.9L408.5 225.5M432.1 181.3L432.1 211.9"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.57" stroke-dasharray="4 4" d="M408.5 225.5L408.5 194.9"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.58" stroke-dasharray="4 4" d="M408.5 194.9L432.1 181.3M432.1 211.9L532.4 269.8"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.62" stroke-dasharray="4 4" d="M408.5 194.9L508.8 252.8"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.61" stroke-dasharray="4 4" d="M532.4 239.2L432.1 181.3"/><path class="p-line2" stroke-width="0.80" stroke-opacity="0.60" stroke-dasharray="4 4" d="M508.8 283.4L408.5 225.5"/></g><g data-part="freight" style="--i:5"><g clip-path="url(#p42rnc7)"><path class="p-shadow" opacity="0.633" filter="url(#p42rnb4)" d="M323.1 265.5L366.7 290.7L334.8 309.1L291.2 283.9Z"/></g><g clip-path="url(#p42rnc8)"><path class="p-shadow" opacity="0.633" filter="url(#p42rnb2)" d="M318.6 240L360.8 264.3L330.4 281.9L288.1 257.5Z"/></g><g clip-path="url(#p42rnc9)"><path class="p-shadow" opacity="0.537" filter="url(#p42rnb3)" d="M261.7 279.9L388.7 353.2L374.7 361.2L247.8 287.9Z"/></g><path class="p-line2" stroke-width="0.60" stroke-opacity="0.28" d="M97.3 190L404.1 367.1M89.6 194.4L396.4 371.5M82.6 198.5L389.3 375.6M244.2 272.4L231.8 279.5M256 279.2L243.6 286.3M205.9 267.3L193.5 274.4M217.7 274.1L205.3 281.2M229.4 280.9L217.1 288"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.29" d="M74.9 202.9L381.6 380M267.8 286L255.4 293.1M279.6 292.8L267.2 300M291.4 299.6L279 306.8M241.2 287.7L228.9 294.9M253 294.5L240.7 301.7M264.8 301.3L252.5 308.5"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.23" d="M102.6 190.6L90.2 197.8M114.4 197.4L102 204.6"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.24" d="M126.2 204.3L113.8 211.4M138 211.1L125.6 218.2M87.9 199.1L75.5 206.3M99.7 206L87.3 213.1M111.5 212.8L99.1 219.9"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.25" d="M149.8 217.9L137.4 225M161.6 224.7L149.2 231.8M173.4 231.5L161 238.7M123.3 219.6L110.9 226.7M135.1 226.4L122.7 233.5"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.26" d="M185.2 238.3L172.8 245.5M197 245.1L184.6 252.3M146.9 233.2L134.5 240.4M158.7 240L146.3 247.2M170.5 246.8L158.1 254"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.27" d="M208.8 251.9L196.4 259.1M220.6 258.8L208.2 265.9M232.4 265.6L220 272.7M182.3 253.6L169.9 260.8M194.1 260.5L181.7 267.6"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.30" d="M303.2 306.4L290.8 313.6M315 313.2L302.6 320.4M326.8 320.1L314.4 327.2M276.6 308.1L264.3 315.3M288.4 314.9L276.1 322.1M300.2 321.8L287.9 328.9"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.31" d="M338.6 326.9L326.2 334M350.4 333.7L338 340.8M362.2 340.5L349.8 347.6M374 347.3L361.6 354.5M312 328.6L299.6 335.7M323.8 335.4L311.4 342.5M335.6 342.2L323.2 349.3"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.32" d="M385.8 354.1L373.4 361.3M397.6 360.9L385.2 368.1M347.4 349L335 356.2M359.2 355.8L346.8 363M371 362.6L358.6 369.8M382.8 369.4L370.4 376.6"/><path class="p-top" d="M286.1 257L327.4 280.9L356.9 263.9L315.6 240Z"/><path class="p-left" d="M286.1 282.6L327.4 306.4L327.4 280.9L286.1 257Z"/><path class="p-right" d="M327.4 306.4L356.9 289.4L356.9 263.9L327.4 280.9Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.75" d="M327.4 306.4L356.9 289.4"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.74" d="M356.9 289.4L356.9 263.9M356.9 263.9L315.6 240M327.4 306.4L286.1 282.6"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.34" d="M356.9 263.9L327.4 280.9M327.4 280.9L327.4 306.4M286.1 257L327.4 280.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.73" d="M286.1 282.6L286.1 257M286.1 257L315.6 240"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.29" d="M291.9 286L291.9 270.7M303.7 292.8L303.7 277.5M291.9 270.7L297.8 270.3M297.8 270.3L303.7 277.5M309.6 296.2L309.6 280.9M321.4 303.1L321.4 287.7M309.6 280.9L315.5 280.5"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.30" d="M315.5 280.5L321.4 287.7"/><path class="p-right" d="M315.6 240L286.1 257L300.8 238.3ZM327.4 280.9L356.9 263.9L342.1 262.2Z"/><path class="p-left" d="M356.9 263.9L315.6 240L300.8 238.3L342.1 262.2Z"/><path class="p-top" d="M286.1 257L327.4 280.9L342.1 262.2L300.8 238.3Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.76" d="M286.1 257L327.4 280.9M342.1 262.2L300.8 238.3M300.8 238.3L342.1 262.2M342.1 262.2L356.9 263.9M327.4 280.9L356.9 263.9M356.9 263.9L342.1 262.2"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.77" d="M327.4 280.9L342.1 262.2M342.1 262.2L327.4 280.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.74" d="M300.8 238.3L286.1 257M356.9 263.9L315.6 240M286.1 257L300.8 238.3"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.73" d="M315.6 240L300.8 238.3M315.6 240L286.1 257M300.8 238.3L315.6 240"/><path class="p-right" d="M257.2 275.1L245.4 281.9L245.4 272.4L257.2 265.6ZM244.3 283.7L272.4 299.9L272.4 297.8L244.3 281.7ZM272.4 299.9L284.8 292.7L284.8 290.7L272.4 297.8ZM271.9 297.2L283.7 290.4L283.7 280.9L271.9 287.7ZM289.6 293.8L277.8 300.6L277.8 291.1L289.6 284.3ZM276.8 302.4L304.8 318.6L304.8 316.6L276.8 300.4ZM304.8 318.6L317.2 311.5L317.2 309.4L304.8 316.6ZM304.4 316L316.2 309.2L316.2 299.6L304.4 306.4ZM322.1 312.6L310.3 319.4L310.3 309.8L322.1 303ZM309.2 321.2L337.3 337.3L337.3 335.3L309.2 319.1ZM337.3 337.3L349.6 330.2L349.6 328.1L337.3 335.3ZM336.8 334.7L348.6 327.9L348.6 318.4L336.8 325.2ZM354.5 331.3L342.7 338.1L342.7 328.6L354.5 321.8ZM341.7 339.9L369.7 356.1L369.7 354L341.7 337.8ZM369.7 356.1L382.1 348.9L382.1 346.9L369.7 354ZM369.3 353.4L381.1 346.6L381.1 337.1L369.3 343.9Z"/><path class="p-left" d="M283.7 290.4L257.2 275.1L257.2 265.6L283.7 280.9ZM245.4 281.9L271.9 297.2L271.9 287.7L245.4 272.4ZM316.2 309.2L289.6 293.8L289.6 284.3L316.2 299.6ZM277.8 300.6L304.4 316L304.4 306.4L277.8 291.1ZM348.6 327.9L322.1 312.6L322.1 303L348.6 318.4ZM310.3 319.4L336.8 334.7L336.8 325.2L310.3 309.8ZM381.1 346.6L354.5 331.3L354.5 321.8L381.1 337.1ZM342.7 338.1L369.3 353.4L369.3 343.9L342.7 328.6Z"/><path class="p-top" d="M257.2 275.1L283.7 290.4L271.9 297.2L245.4 281.9ZM244.3 281.7L272.4 297.8L284.8 290.7L256.7 274.5ZM276.8 300.4L304.8 316.6L317.2 309.4L289.2 293.2ZM289.6 293.8L316.2 309.2L304.4 316L277.8 300.6ZM309.2 319.1L337.3 335.3L349.6 328.1L321.6 312ZM322.1 312.6L348.6 327.9L336.8 334.7L310.3 319.4ZM341.7 337.8L369.7 354L382.1 346.9L354.1 330.7ZM354.5 331.3L381.1 346.6L369.3 353.4L342.7 338.1Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.75" d="M272.4 299.9L284.8 292.7M284.8 292.7L284.8 290.7M272.4 299.9L244.3 283.7M271.9 297.2L283.7 290.4M283.7 290.4L283.7 280.9M271.9 297.2L245.4 281.9M271.9 287.7L245.4 272.4"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.34" d="M284.8 290.7L272.4 297.8M272.4 297.8L272.4 299.9M271.9 287.7L271.9 297.2"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.74" d="M244.3 283.7L244.3 281.7M284.8 290.7L256.7 274.5M245.4 281.9L245.4 272.4M245.4 272.4L257.2 265.6M257.2 265.6L283.7 280.9"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.73" d="M244.3 281.7L256.7 274.5"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.33" d="M244.3 281.7L272.4 297.8"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.76" d="M283.7 280.9L271.9 287.7M276.8 302.4L276.8 300.4M276.8 300.4L289.2 293.2M317.2 309.4L289.2 293.2M277.8 300.6L277.8 291.1M277.8 291.1L289.6 284.3"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.78" d="M304.8 318.6L317.2 311.5M304.4 316L316.2 309.2M316.2 309.2L316.2 299.6M316.2 299.6L304.4 306.4M304.4 306.4L277.8 291.1M309.2 321.2L309.2 319.1M309.2 319.1L321.6 312"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.77" d="M317.2 311.5L317.2 309.4M304.8 318.6L276.8 302.4M304.4 316L277.8 300.6M289.6 284.3L316.2 299.6"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.35" d="M317.2 309.4L304.8 316.6M304.8 316.6L304.8 318.6M276.8 300.4L304.8 316.6M304.4 306.4L304.4 316"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.80" d="M337.3 337.3L349.6 330.2M336.8 334.7L348.6 327.9M348.6 327.9L348.6 318.4M348.6 318.4L336.8 325.2M336.8 325.2L310.3 309.8M341.7 337.8L354.1 330.7"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.79" d="M349.6 330.2L349.6 328.1M349.6 328.1L321.6 312M337.3 337.3L309.2 321.2M310.3 319.4L310.3 309.8M310.3 309.8L322.1 303M336.8 334.7L310.3 319.4M322.1 303L348.6 318.4"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.36" d="M349.6 328.1L337.3 335.3M337.3 335.3L337.3 337.3M309.2 319.1L337.3 335.3M336.8 325.2L336.8 334.7M341.7 337.8L369.7 354"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.82" d="M369.7 356.1L382.1 348.9M369.3 353.4L381.1 346.6M381.1 346.6L381.1 337.1M381.1 337.1L369.3 343.9M369.3 343.9L342.7 328.6"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.81" d="M382.1 348.9L382.1 346.9M341.7 339.9L341.7 337.8M382.1 346.9L354.1 330.7M369.7 356.1L341.7 339.9M342.7 338.1L342.7 328.6M342.7 328.6L354.5 321.8M369.3 353.4L342.7 338.1M354.5 321.8L381.1 337.1"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.37" d="M382.1 346.9L369.7 354M369.7 354L369.7 356.1M369.3 343.9L369.3 353.4"/></g><g data-part="fixed" style="--i:6"><g clip-path="url(#p42rnc10)"><path class="p-shadow" opacity="0.633" filter="url(#p42rnb6)" d="M405.7 305.5L444.9 328.1L411.6 347.3L372.5 324.7Z"/></g><g clip-path="url(#p42rnc11)"><path class="p-shadow" opacity="0.633" filter="url(#p42rnb2)" d="M396.7 264.7L433.1 285.6L402.6 303.2L366.3 282.2Z"/></g><path class="p-left" d="M364.2 322.6L399.6 343L399.6 302.2L364.2 281.7Z"/><path class="p-top" d="M364.2 281.7L399.6 302.2L429.1 285.1L393.7 264.7Z"/><path class="p-right" d="M399.6 343L429.1 326L429.1 285.1L399.6 302.2Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.79" d="M399.6 343L429.1 326M364.2 322.6L364.2 281.7M364.2 281.7L393.7 264.7M399.6 343L364.2 322.6"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.80" d="M429.1 326L429.1 285.1M429.1 285.1L393.7 264.7"/><path class="p-line" stroke-width="0.72" stroke-opacity="0.36" d="M429.1 285.1L399.6 302.2M399.6 302.2L399.6 343M364.2 281.7L399.6 302.2"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.31" d="M370.1 317.2L374 319.4M374 319.4L374 311.5M374 311.5L370.1 309.2M370.1 309.2L370.1 317.2M370.1 301.2L374 303.5M374 303.5L374 295.5M374 295.5L370.1 293.3M370.1 293.3L370.1 301.2M379.9 322.8L383.8 325.1M383.8 325.1L383.8 317.1M383.8 317.1L379.9 314.9M379.9 314.9L379.9 322.8M379.9 306.9L383.8 309.2M383.8 309.2L383.8 301.2M383.8 301.2L379.9 298.9M379.9 298.9L379.9 306.9M389.7 328.5L393.7 330.8M393.7 330.8L393.7 322.8M393.7 322.8L389.7 320.5M389.7 320.5L389.7 328.5M389.7 312.6L393.7 314.8M422.7 320.9L418 323.6M418 323.6L418 315.7M418 315.7L422.7 312.9M422.7 312.9L422.7 320.9M422.7 305L418 307.7M418 307.7L418 299.7M418 299.7L422.7 297M422.7 297L422.7 305M410.9 327.7L406.2 330.4M406.2 330.4L406.2 322.5M406.2 322.5L410.9 319.7M410.9 319.7L410.9 327.7M410.9 311.8L406.2 314.5M410.9 303.8L410.9 311.8"/><path class="p-line2" stroke-width="0.60" stroke-opacity="0.32" d="M393.7 314.8L393.7 306.9M393.7 306.9L389.7 304.6M389.7 304.6L389.7 312.6M406.2 314.5L406.2 306.5M406.2 306.5L410.9 303.8"/><path class="p-top" d="M393.7 264.7L364.2 281.7L392.3 270.7ZM364.2 281.7L399.6 302.2L401.1 275.8L392.3 270.7Z"/><path class="p-left" d="M429.1 285.1L393.7 264.7L392.3 270.7L401.1 275.8ZM399.6 302.2L429.1 285.1L401.1 275.8Z"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.81" d="M364.2 281.7L399.6 302.2M401.1 275.8L392.3 270.7M392.3 270.7L401.1 275.8M401.1 275.8L429.1 285.1M399.6 302.2L429.1 285.1M429.1 285.1L401.1 275.8"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.82" d="M399.6 302.2L401.1 275.8M401.1 275.8L399.6 302.2"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.80" d="M392.3 270.7L364.2 281.7M429.1 285.1L393.7 264.7M393.7 264.7L392.3 270.7M364.2 281.7L392.3 270.7M392.3 270.7L393.7 264.7"/><path class="p-sil" stroke-width="1.28" stroke-opacity="0.79" d="M393.7 264.7L364.2 281.7"/></g></svg>' };
  /* the two sitters, from the site's image manifest (images.json, world.f-02 and world.f-01), credited on the card */
  var WM = 'https://upload.wikimedia.org/wikipedia/commons/thumb/';
  var PORT = {
    oil: { f: 'a/a0/Portrait_of_J._D._Rockefeller.jpg', w: 250, h: 342, alt: 'John D. Rockefeller', mono: 'JR', focal: '50% 30%',
      by: 'Scientific American Compiling Department, 1895', page: 'https://commons.wikimedia.org/wiki/File:Portrait_of_J._D._Rockefeller.jpg' },
    steel: { f: 'b/b0/Andrew_Carnegie%2C_by_Theodore_Marceau_%28cropped%29_%282%29.jpg', w: 250, h: 313, alt: 'Andrew Carnegie', mono: 'AC', focal: '50% 30%',
      by: 'Theodore C. Marceau', page: 'https://commons.wikimedia.org/wiki/File:Andrew_Carnegie,_by_Theodore_Marceau_(cropped)_(2).jpg' }
  };
  function thumb(p, px) { var n = p.f.split('/').pop(); return WM + p.f + '/' + px + 'px-' + n; }
  /* a poster without its registration mark: the live drawing frames itself, so it crossfades instead of swapping */
  function posterOf(camp, cls) { return (POSTER[camp] || '').replace(' data-reg="1"', '').replace('class="ps3d-poster"', 'class="ps3d-poster ' + (cls || '') + '"'); }
  /* [[key|label]] markers become inline glossary terms; plain mode (inside buttons) keeps only the label */
  function rich(s, plainMode) {
    s = s == null ? '' : String(s);
    var out = '', re = /\[\[([a-z0-9]+)\|([^\]]+)\]\]/g, last = 0, m;
    while ((m = re.exec(s))) { out += E_(s.slice(last, m.index)) + (plainMode || !DEFS[m[1]] ? E_(m[2]) : K.term(m[1], m[2])); last = re.lastIndex; }
    return out + E_(s.slice(last));
  }
  function srcLinks(src) {
    if (!src || !src.length) return '';
    return '<p class="lk-src">' + (src.length > 1 ? 'Sources: ' : 'Source: ') + src.map(function (s) {
      return '<a href="' + E_(s.u) + '" target="_blank" rel="noopener">' + E_(s.t) + '<span class="vh"> (opens in a new tab)</span></a>';
    }).join('; ') + '</p>';
  }
  function segHTML(name, opts, cur, label, extra) {
    return '<div class="lk-seg ti-seg" role="radiogroup" aria-label="' + E_(label) + '" data-seg="' + name + '"' + (extra || '') + '>' + opts.map(function (o) {
      var on = String(o.v) === String(cur);
      return '<button type="button" role="radio" data-v="' + E_(o.v) + '" data-fk="seg-' + name + '-' + E_(o.v) + '" aria-checked="' + on + '" tabindex="' + (on ? 0 : -1) + '"' +
        (o.dis ? ' disabled' : '') + (o.title ? ' aria-describedby="' + o.title + '"' : '') + '>' + E_(o.l) + '</button>';
    }).join('') + '</div>';
  }
  function cell(k, v, cls, sub, aria) {
    return '<div class="lk-cell' + (cls ? ' ' + cls : '') + '"' + (aria ? ' role="group" aria-label="' + E_(aria) + '"' : '') + '><span class="lk-k">' + k + '</span><span class="lk-v">' + v + '</span>' + (sub ? '<span class="ti-sub">' + sub + '</span>' : '') + '</div>';
  }

  function init(root, ctx) {
    var store = ctx.store, saved = store.get() || {}, S = null, curveH = 240, uid = 'ti' + (++UID);
    var U = { sel: null, hover: null, open: null, size: null, lvl: 'fair', pay: 'stock', give: 'small', tgt: null, pl: null, sp: {}, more: false,
      lay: null, from: null, blend: 1, cancel: null, confirm: null, confT: 0, morgan: { mult: 10, con: false }, dist: { mode: null, causes: [] }, fresh: [] };
    /* a run is saved as its seed plus the log of every engine call; the engine is deterministic on both, so replaying the log restores it */
    var LOGV = 3, log = [];
    function save() {
      if (!S) return;
      saved = { v: LOGV, camp: S.camp, seed: S.seed, log: log, ch: S.t, phase: S.phase, done: S.phase === 'end' };
      store.set(saved);
    }
    function setPolicy(n, v) {
      if (n === 'payout') { S.payout = +v; unlock(S, 'fn8', 'Setting the dividend'); }
      else if (n === 'shift') { if (S.flags.shiftLock) return false; S.m.shift12 = +v; unlock(S, 'fn22', 'Mill policy'); }
      else if (n === 'wage') { S.wageAct = +v; S.wageDelta = +v < 0 ? -8 : +v > 0 ? 6 : 0; unlock(S, 'fn22', 'Mill policy'); }
      else return false;
      return true;
    }
    function unionAct(v) {
      if (v === 'break') {
        if (!S.m.union) return false;
        var pen = S.flags.unionLock ? 20 : S.flags.promise ? 15 : 10;
        S.m.union = 0; S.standing -= pen; S.rel = clamp(S.rel - 25, 0, 100); S.flags.unionBroken = true;
        harm(S, 'union', 'Broke the union at ' + worksName(S), 1); unlock(S, 'fn22', 'Breaking the union');
        S.feed.push('You refuse to deal with the union. Standing ' + MINUS + pen + ', relations ' + MINUS + '25.');
        return true;
      }
      if (S.m.union) return false;
      S.m.union = 1; S.rel = clamp(S.rel + 5, 0, 100); S.feed.push('You recognize the union at your works.');
      return true;
    }
    /* the one place the view changes the engine's state; every call here is logged and replayable */
    function apply(a) {
      var r;
      switch (a.f) {
        case 'x': return choose(S, a.k);
        case 'm': return doMove(S, a.id, a.p || {});
        case 'sp': r = specialOffer(S, a.rid, a.lvl, a.pay); if (r && r.ok && r.text) S.feed.push(r.text); return r || { ok: false };
        case 'spdone': if (!S.special || S.special.done) return { ok: false }; S.special.done = true; return { ok: true };
        case 'stop': if (!MV[a.id] || !MV[a.id].ongoing || !S.m[MV[a.id].ongoing]) return { ok: false }; stopMove(S, a.id); return { ok: true };
        case 'closep': if (!plantById(S, a.pid)) return { ok: false }; closePlant(S, a.pid); return { ok: true };
        case 'set': return { ok: setPolicy(a.n, a.v) };
        case 'union': return { ok: unionAct(a.v) };
        case 'close': S.pr = +a.pr || 1; r = closeBooks(S); return { ok: !!r, h: r };
        case 'hear': if (S.phase !== 'verdict') return { ok: false }; hearVerdict(S); return { ok: true };
        case 'sell': if (S.phase !== 'morgan') return { ok: false }; sellToMorgan(S, +a.mult, !!a.con); return { ok: true };
        case 'refuse': if (S.phase !== 'morgan') return { ok: false }; refuseMorgan(S, !!a.con); return { ok: true };
        case 'todist': if (S.phase !== 'verdict' && S.phase !== 'morgan') return { ok: false }; S.phase = 'dist'; return { ok: true };
        case 'settle': if (S.phase !== 'dist') return { ok: false }; settle(S, a.mode, a.causes || []); return { ok: S.phase === 'end' };
      }
      return { ok: false };
    }
    function act(a) {
      var pre = WV.ex && S && S.phase === 'play' ? wkLines(clear(S, pYof(S))) : null, r = apply(a);
      if (r && r.ok !== false) { log.push(JSON.parse(JSON.stringify(a))); save(); wkNote(a, pre); }
      return r || { ok: false };
    }
    function canResume(sv) { return !!(sv && sv.v === LOGV && CFG[sv.camp] && sv.log && sv.log.length && !sv.done && isFinite(sv.seed)); }
    var cfg = { slug: SLUG, notes: NOTES, caseFile: CASE.both, take: { items: TAKE.both, personal: personal }, meta: '' };
    root.innerHTML = '<div class="ti"><div class="ti-stage"></div><div class="ti-end"></div><div class="ti-foot"></div></div>';
    var stage = root.querySelector('.ti-stage'), endEl = root.querySelector('.ti-end');
    var shelf = K.shelf(root.querySelector('.ti-foot'), cfg);
    K.glossary(root, DEFS);
    var el = {};

    /* ---------------------------------------------------------------- the works, drawn to cost ---------------------------------------------------------------- */
    var WV = { ex: null, fig: null, gen: 0, first: null, firstY: 0, moved: {}, nH: 0, now: '', sel: null, run: [], arts: [] };
    function wkLines(p) {
      var g = great(S);
      if (!g || g.cap <= 0) return null;
      var C = CFG[S.camp], q = {}, L;
      vP(S, g, q);
      L = S.camp === 'oil' ? { crude: q.crude, freight: q.freight, conv: q.conv, cont: q.cont, byp: -q.byp } : { ore: q.ore, coke: q.coke, freight: q.freight, conv: q.conv, labor: q.labor };
      L.fixed = p && p.qP > 0 ? p.Fsum / (p.qP * C.G) : NaN; L.war = q.war || 0;
      return L;
    }
    /* the costs a works would run at, before it runs: the chooser drawings and the plan of a works still going up */
    function wkPlan(T) {
      var g = great(T), cap = g && g.cap > 0 ? g.cap : capPend(T) || (T.camp === 'oil' ? 1 : 60), q = {};
      vcost(T, cap, g ? g.eff : 1, g ? g.city : 'PIT', true, q);
      q.fixed = Fc(T, cap, true) / (cap * CFG[T.camp].G); q.byp = -q.byp;
      return q;
    }
    function wkNowP() { return S && S.phase === 'play' ? clear(S, pYof(S)) : S && S.lastClose ? S.lastClose.res : null; }
    function wkFirst() { if (!WV.first && S && S.phase === 'play') { var L = wkLines(wkNowP()); if (L) { WV.first = L; WV.firstY = yr(S); } } }
    function wkDrop() {
      WV.gen++;
      clearTimeout(WV.tm); WV.run.forEach(function (f) { f(); }); WV.run = [];
      if (WV.ex) { try { WV.ex.destroy(); } catch (e) {} }
      WV.arts.forEach(function (a) { try { a.destroy(); } catch (e) {} }); WV.arts = [];
      if (WV.fig && WV.fig.parentNode) WV.fig.parentNode.removeChild(WV.fig);
      if (WV.off) { WV.off(); WV.off = null; }
      WV.ex = WV.fig = null; WV.sel = null;
    }
    /* a works at its first chapter's costs, nothing yet integrated: the pose the chooser posters are drawn in */
    function wkPose(R, camp) {
      var q = wkPlan(newGame(camp, CFG[camp].seed)), k = WK.H / WK.REF[camp];
      WK.names[camp].forEach(function (n) {
        var key = n[0], hh = clamp(k * (q[key] || 0), .06, WK.H);
        ['.b', '.bg'].forEach(function (x) { if (R[key + x]) R[key + x].scl[1] = hh; });
        ['.t', '.tg'].forEach(function (x) { if (R[key + x]) R[key + x].pos[1] = key === 'byp' ? -hh : hh; });
      });
      ['gather', 'trunk', 'tankcars', 'term', 'market', 'chem', 'war', 'cont.b', 'cont.t', 'cont.w', 'oreboat', 'coke.b', 'coke.t', 'rail', 'oh'].forEach(function (id) { if (R[id]) R[id].visible = false; });
    }
    /* debug only (?labdebug=1): __lab.titan.poster('oil', 640, 400) resolves to the SVG string kept in POSTER above */
    DBG.poster = function (camp, w, h, fill) {
      return wkNeed().then(function (P) {
        wkModels(P);
        return P.load('c2d').then(function () {
          var host = document.createElement('div');
          host.style.cssText = 'position:fixed;left:0;top:0;width:' + w + 'px;height:' + h + 'px;visibility:hidden;pointer-events:none';
          root.appendChild(host);
          return P.stage(host, camp === 'oil' ? 'titan-refinery' : 'titan-steel', { renderer: '2d', margin: 1 / (fill || .9) }).then(function (st) {
            wkPose(st.nodes, camp);
            var svg = P.debug.poster(st, { w: w, h: h, label: '' });
            st.destroy(); root.removeChild(host);
            return svg;
          });
        });
      });
    };
    function wkMount() {
      wkDrop();
      var host = el.yard && el.yard.querySelector('.ti-yard-s');
      if (!host) return;
      var gen = WV.gen, oil = S.camp === 'oil', fig = document.createElement('figure');
      WV.moved = {}; WV.nH = S.harms.length; WV.now = '';
      fig.className = 'iso lk-scene ti-scene';
      fig.setAttribute('data-iso-h', '380');
      fig.innerHTML = '<p class="lk-kicker ti-figk">Your works, drawn to the cost sheet</p>' +
        '<div class="iso-stage" tabindex="0" role="group" aria-roledescription="3D model" aria-label="Your ' + (oil ? 'refinery' : 'steel works') + ', one building per cost line" aria-describedby="' + uid + '-wd">' +
        '<div class="ti-wpw">' + posterOf(S.camp, 'ti-wpost') + '</div></div><figcaption><p class="ti-wd" id="' + uid + '-wd"></p><p class="ti-wnow"></p>' +
        '<div class="iso-ctl"><button type="button" class="ps-cap" data-act="explode" aria-pressed="false">Separate the cost lines</button><button type="button" class="ps-cap" data-act="reset">Reset view</button></div>' +
        '<p class="iso-live vh" aria-live="polite"></p></figcaption>';
      host.insertBefore(fig, host.firstChild);
      WV.fig = fig;
      wkNeed().then(function (P) {
        if (gen !== WV.gen) return null;
        wkModels(P);
        /* narrow stages frame the whole plate; the wide refinery comes in a little closer */
        var id = oil ? 'titan-refinery' : 'titan-steel', d = P.getModel(id), sg = fig.querySelector('.iso-stage');
        d.views = P._ext({}, d.views); d.views.iso = P._ext(P._ext({}, d.views.iso), { zoom: oil && sg.offsetWidth > 1.6 * sg.offsetHeight ? 1.12 : 1 });
        return P.mount(fig, id, { list: false, steps: false, margin: sg.offsetWidth < 480 ? 1 : .92 });
      }).then(function (ex) {
        if (!ex) return;
        if (gen !== WV.gen) { ex.destroy(); return; }
        WV.ex = ex;
        ex.showFlows([]);
        ex.on('select', function (id) { WV.sel = id; wkMark(); });
        WV.off = window.PS3D.onTheme(wkTone); wkTone();
        wkSync(wkNowP(), true);
        wkArrive(fig);
      }, function (e) {
        if (gen === WV.gen) fig.hidden = true;
        if (K.debug && window.console) console.warn('[lab:titan] 3D', e);
      });
    }
    /* the first time the drawing comes into view, the works goes up from its foundations, one line at a time */
    function wkArrive(fig) {
      var P = window.PS3D, ex = WV.ex;
      if (!('IntersectionObserver' in window) || P.reduced()) return;
      var io = new IntersectionObserver(function (es) {
        if (!es[es.length - 1].isIntersecting || WV.ex !== ex) return;
        io.disconnect();
        if (P.reduced()) return;
        WK.names[S.camp].forEach(function (n, i) {
          var g = ex.parts[n[0]], sp = g && g._sp;
          if (!sp) return;
          sp.snap(.02);
          WV.run.push(P.tween({ dur: 0, delay: 90 + i * 70, done: function () { sp.set(g._ht); } }));
        });
      }, { threshold: .35 });
      io.observe(fig.querySelector('.iso-stage'));
      WV.run.push(function () { io.disconnect(); });
    }
    function wkTone() {
      var ex = WV.ex, P = window.PS3D;
      if (!ex || !P) return;
      var dk = P._bgLum(ex.vw) < .25;
      for (var id in ex.parts) if (/\.s\d+$/.test(id)) { var n = ex.parts[id]; n.geom.F.forEach(function (f) { f.c = dk ? 0 : 7; f.a = dk ? .12 : .3; }); n.touch(); }
      ex.vw.invalidate();
    }
    function wkMark() { if (el.sheet) Array.prototype.forEach.call(el.sheet.querySelectorAll('[data-wk]'), function (r) { r.classList.toggle('is-on', r.getAttribute('data-wk') === WV.sel); }); }
    function wkD(v) { return (S.camp === 'oil' ? Math.abs(v).toFixed(2) + '¢' : '$' + Math.abs(v).toFixed(2)); }
    /* move the drawing to the engine's state; instant on mount, sprung after a decision */
    function wkSync(p, instant) {
      var ex = WV.ex;
      if (!ex || !S) return;
      var P = window.PS3D, R = ex.parts, oil = S.camp === 'oil', C = CFG[S.camp], k = WK.H / WK.REF[S.camp], L = wkLines(p), m = S.m;
      var veil = !oil && !m.costSheets && !!L, keys = WK.names[S.camp], tot = 0, inst = instant || P.reduced(), list = ex.list, plan = L ? null : wkPlan(S);
      if (L) keys.forEach(function (n) { tot += isFinite(L[n[0]]) ? L[n[0]] : 0; });
      var own = oil ? { gather: m.gather, trunk: m.trunk, tankcars: m.tank, 'freight.c': !m.tank, term: m.term, market: m.market, chem: m.chem, war: L && L.war > 0, 'cont.b': m.coop, 'cont.t': m.coop, 'cont.x': 1, 'cont.w': m.coop, 'cont.bg': !m.coop, 'cont.tg': !m.coop }
        : { oreboat: m.oreOwn || S.flags.mesabi, 'coke.b': m.cokeOwn || S.flags.frick, 'coke.t': m.cokeOwn || S.flags.frick, 'coke.bg': !(m.cokeOwn || S.flags.frick), rail: m.rail, oh: m.oh };
      var rise = {};
      Object.keys(own).forEach(function (id) { var nd = R[id]; if (nd && nd._wk && !inst && own[id] && !nd.visible && /\.b$/.test(id)) rise[id.split('.')[0]] = 1; });
      list.length = 0;
      keys.forEach(function (n) {
        var key = n[0], g = R[key], v = L ? L[key] : NaN, h = !L ? .05 : veil ? k * tot / 6 : isFinite(v) ? clamp(k * v, .04, WK.H * 1.15) : .04;
        if (key === 'byp' && L) h = Math.max(.06, h);
        if (!g._sp) g._sp = P.spring({ k: 120, c: 18, x: h, onUpdate: function (x) { wkH(key, x); } });
        g._ht = h;
        if (inst) g._sp.snap(h); else { if (rise[key]) g._sp.snap(.02); g._sp.set(h); }
        var gh = R[key + '.g'], f = !L ? plan[key] : WV.first && WV.first[key], fh = clamp(k * (f || 0), .04, WK.H * 1.15);
        gh.visible = !L || !!(!veil && isFinite(f) && Math.abs(fh - h) > .06);
        gh.scl[1] = fh; gh.alpha = L ? 1 : 2.2;
        var mv = WV.moved[key], why = WK.why[!oil && WK.why['s' + key] ? 's' + key : key];
        if (key === 'cont') why += m.coop ? ' Yours, so this line is 45 percent lower.' : ' You buy from the coopers, drawn dashed.';
        if (key === 'coke') why += m.cokeOwn ? ' Your own ovens.' : S.flags.frick ? ' Frick’s ovens, in partnership.' : ' Bought on the market, drawn dashed.';
        if (key === 'freight' && oil && m.rebate) why += ' The rails are lit: a secret rebate runs on this siding.';
        g.fig = !L ? '–' : veil ? '?' : isFinite(v) ? (key === 'byp' ? MINUS : '') + fmtP(S, Math.abs(v)) : '–';
        g.why = !L ? 'Your works is still going up. The dashed outline is the plan.' : veil ? 'Unmeasured. Without cost sheets you see one number: ' + fmtP(S, tot) + ' a ' + C.unit + ', all in.'
          : why + (gh.visible ? ' Dashed: ' + fmtP(S, Math.abs(f)) + ' in ' + WV.firstY + '.' : '') + (mv ? ' Last moved by ' + mv.by + ': ' + wkD(mv.d) + (mv.d < 0 ? ' lower.' : ' higher.') : '');
        list.push(g);
      });
      /* integration builds in place; what you buy from others is drawn dashed */
      Object.keys(own).forEach(function (id) {
        var nd = R[id], on = !!own[id];
        if (!nd || nd.visible === on && nd._wk) return;
        nd._wk = 1;
        if (!on || inst || nd.visible === on) { nd.visible = on; if (!/\.bg?$/.test(id)) nd.scl[1] = 1; nd.alpha = 1; return; }
        nd.visible = true;
        if (/\.(b|bg)$/.test(id)) return;
        WV.run.push(P.tween({ from: .02, to: 1, dur: 900, ease: 'out', update: function (x) { nd.scl[1] = x; nd.alpha = Math.min(1, x * 2); ex.vw.invalidate(); } }));
      });
      /* a works still going up shows foundations and the plan, no roofs */
      for (var tid in R) if (/\.tg?$/.test(tid) && (!L || !(tid in own))) R[tid].visible = !!L;
      Object.keys(own).forEach(function (id) { var nd = R[id]; if (nd && nd.visible && nd.name) list.push(nd); });
      if (oil) R['freight.r'].hl = m.rebate ? 1 : 0;
      /* the other ledger: one stain per line, under the building that caused it; they never fade */
      var cnt = {}, fresh = [];
      S.harms.forEach(function (x, i) {
        var key = WK.stain[S.camp][x.kind] || 'fixed', j = cnt[key] = (cnt[key] || 0) + 1, nd = R[key + '.s' + (j - 1)];
        if (!nd) return;
        var f = WK.fp[S.camp][key], r = K.rng(i * 7919 + 17), a = r() * Math.PI * 2, s = .28 + .14 * Math.min(2, x.w) + r() * .1;
        nd.pos = [clamp(f[0] + Math.cos(a) * (f[2] + s * .55) * (.85 + r() * .35), -4.9, 4.9), 0, clamp(f[1] + Math.sin(a) * (f[3] + s * .55) * (.85 + r() * .35), -3, 3)];
        nd.name = 'The other ledger'; nd.fig = String(x.year); nd.why = x.text + '.';
        if (!nd.visible) { nd.visible = true; nd.scl = [s, 1, s]; if (!inst && i >= WV.nH) fresh.push([nd, s]); }
        list.push(nd);
      });
      fresh.forEach(function (q) { WV.run.push(P.tween({ from: .08, to: q[1], dur: 1100, ease: 'out', update: function (x) { q[0].scl[0] = q[0].scl[2] = x; ex.vw.invalidate(); } })); });
      WV.nH = S.harms.length; WV.hadL = !!L;
      var d = WV.fig.querySelector('.ti-wd'), w = WV.fig.querySelector('.ti-wnow');
      if (d) d.textContent = S.phase === 'end' ? 'The works as you left it, drawn to its last cost sheet.' + (WV.first ? ' Dashed outlines show where each line stood in ' + WV.firstY + '.' : '') + ' Each stain on the ground is an entry in the other ledger.'
        : !L ? 'Your works is still going up. Dashed outlines show the plan, drawn to the costs it should run at. The buildings rise when the first ' + C.unit + ' comes out.'
        : veil ? 'Without cost sheets every building stands at the same height: the total, split six ways. Install cost sheets to see each line.'
        : 'Each building stands as tall as its line on the cost sheet, in ' + (oil ? 'cents a gallon' : 'dollars a ton') + '. Cut a cost and the building settles.' + (WV.first ? ' Dashed outlines show where each line stood in ' + WV.firstY + '.' : '') + ' Stains on the ground are the other ledger. They never wash out.';
      if (w) w.textContent = WV.now;
      if (ex._cn && ex._card) ex._card(ex._cn);
      ex.vw.invalidate();
      wkMark();
    }
    function wkH(key, h) {
      var ex = WV.ex, R = ex && ex.parts;
      if (!R) return;
      ['.b', '.bg'].forEach(function (s) { if (R[key + s]) R[key + s].scl[1] = h; });
      ['.t', '.tg'].forEach(function (s) { if (R[key + s]) R[key + s].pos[1] = key === 'byp' ? -h : h; });
      if (key === 'freight' && R.war) R.war.pos[1] = h;
      ex.vw.invalidate();
    }
    /* what each decision moved: kept for the callout, said once under the drawing, and the moved buildings pulse */
    function wkNote(a, pre) {
      wkFirst();
      if (!S || S.phase !== 'play' || !WV.ex) return;
      var post = wkLines(clear(S, pYof(S))), by = '', ch = [], msg = '', veil = S.camp === 'steel' && !S.m.costSheets;
      if (!post) return;
      if (!pre) { if (WV.hadL === false) WV.now = 'Your works is running, ' + yr(S) + '.'; return; }
      if (a.f === 'x') by = S.cross ? S.cross.def.title : 'the crossroads';
      else if (a.f === 'm') by = MV[a.id] ? MV[a.id].name : '';
      else if (a.f === 'close') by = 'the new chapter, ' + yr(S);
      else if (a.f === 'set') by = a.n === 'payout' ? 'the dividend policy' : 'mill policy';
      else if (a.f === 'union') by = a.v === 'break' ? 'Break the union' : 'Recognize the union';
      else if (a.f === 'sp') by = 'the Cleveland offers';
      else if (a.f === 'stop') by = 'Stop: ' + (MV[a.id] ? MV[a.id].name : '');
      else if (a.f === 'closep') by = 'closing a plant';
      else return;
      WK.names[S.camp].forEach(function (n) {
        var d = post[n[0]] - pre[n[0]];
        if (isFinite(d) && Math.abs(d) >= .005 && !veil) { WV.moved[n[0]] = { by: by, d: d }; ch.push([n, d]); }
      });
      if (veil) {
        var dt = 0; WK.names[S.camp].forEach(function (n) { dt += (post[n[0]] || 0) - (pre[n[0]] || 0); });
        if (isFinite(dt) && Math.abs(dt) >= .005) msg = by.charAt(0).toUpperCase() + by.slice(1) + ': the total ' + wkD(dt) + (dt < 0 ? ' lower' : ' higher') + '. Cost sheets would show which line moved.';
      }
      ch.sort(function (x, y) { return Math.abs(y[1]) - Math.abs(x[1]); });
      var nh = S.harms.length > WV.nH ? S.harms[S.harms.length - 1] : null;
      if (ch.length) msg = by.charAt(0).toUpperCase() + by.slice(1) + ': ' + ch.slice(0, 3).map(function (c) { return WK.short[S.camp === 'steel' && c[0][0] === 'conv' ? 'sconv' : c[0][0]] + ' ' + wkD(c[1]) + (c[1] < 0 ? ' lower' : ' higher'); }).join(', ') + '.';
      if (nh) msg = (msg ? msg + ' ' : '') + 'The other ledger: ' + nh.text + '.';
      if (msg) WV.now = msg;
      if (a.f !== 'close' && ch.length) wkPulse(ch[0][0][0]);
    }
    function wkPulse(key) {
      var ex = WV.ex, P = window.PS3D, g = ex && ex.parts[key];
      if (!g || P.reduced() || ex.sel != null || ex.hov != null) return;
      WV.run.push(P.tween({ from: .9, to: 0, dur: 1400, ease: 'in', update: function (x) { g.hl = ex.sel === key || ex.hov === key ? 1 : ex.sel == null && ex.hov == null ? x : 0; ex.vw.invalidate(); } }));
    }
    /* closing the books runs the works for a chapter: oil moves through the plant, a Bessemer heat throws sparks and pours */
    function wkRun() {
      var ex = WV.ex, P = window.PS3D, oil;
      if (!ex || !P || P.reduced() || !S || S.phase !== 'play' || !great(S) || great(S).cap <= 0) return;
      oil = S.camp === 'oil';
      ex.showFlows(oil ? ['run', S.m.gather ? 'pipe' : 'crude'] : ['ore', 'iron', 'steel', 'heat']);
      clearTimeout(WV.tm);
      WV.tm = setTimeout(function () { if (WV.ex === ex) ex.showFlows([]); }, 3400);
      if (oil) return;
      var v = ex.parts['conv.v'], spin = function (x) { v.rot = P.q.axis([1, 0, 0], x); ex.vw.invalidate(); };
      v.hl = 1;
      WV.run.push(P.tween({ from: 0, to: 72, dur: 640, delay: 1500, ease: 'io', update: spin, done: function () {
        WV.run.push(P.tween({ from: 72, to: 0, dur: 640, delay: 500, ease: 'io', update: spin, done: function () { v.hl = 0; ex.vw.invalidate(); } }));
      } }));
    }

    function personal() {
      if (!S || S.phase !== 'end') return null;
      var e = ending(S), fin = S.hist.filter(function (h) { return isFinite(h.unitAll); }), a = fin[0], b = fin[fin.length - 1];
      var down = a && b ? (a.unitAll - b.unitAll) / a.unitAll : 0;
      return 'My run (' + Cf(S).label + ', seed #' + S.seed + '): ' + e.title + (e.sub ? ', ' + e.sub : '') + '; cost down ' + F.pct(down) + '; final share ' + F.pct(finalShare(S)) +
        '; fortune ' + fM(fortune(S)) + '; ' + S.harms.length + ' ' + F.plural(S.harms.length, 'entry', 'entries') + ' in the other ledger.';
    }
    function setCaseFile(spec) {
      cfg.caseFile = spec;
      var body = shelf.el.querySelector('.lk-drawer[data-shelf="case"] .lk-drawer-body'), d = body && body.parentNode;
      if (body) { body.innerHTML = ''; if (d && !d.hidden) K.caseFile(body, spec); }
    }
    function setCampaign(camp) {
      if (camp) {
        shelf.notes.setScope(SCOPE[camp]); setCaseFile(CASE[camp]); cfg.take.items = TAKE[camp];
        shelf.setMeta('Seeded history #' + S.seed + ' · Same seed, same choices, same history');
      } else { shelf.notes.setScope(null); setCaseFile(CASE.both); cfg.take.items = TAKE.both; shelf.setMeta(''); }
    }

    /* ---------------------------------------------------------------- chooser ---------------------------------------------------------------- */
    function renderChooser(focus) {
      wkDrop(); S = null; U.lay = null; endEl.innerHTML = ''; setCampaign(null);
      var last = saved.camp, rs = canResume(saved) ? saved : null;
      var where = rs ? (rs.phase === 'play' ? 'chapter ' + (Math.min(11, rs.ch) + 1) + ' of 12' : rs.phase === 'verdict' ? 'the verdict' : rs.phase === 'morgan' ? 'Morgan’s question' : 'the distribution') : '';
      stage.innerHTML = '<div class="ti-choose" data-ground="espresso">' +
        '<div class="lk-head ti-chead"><p class="lk-kicker">Two fortunes, one engine</p><h4 class="lk-title ti-h" tabindex="-1">Choose a titan</h4>' +
        '<p class="lk-lede">Build the cheapest, largest business in your industry, then decide what it costs and who pays. The engine keeps two ledgers. Only one of them is money, and they never net.</p></div>' +
        (rs ? '<div class="ti-resume"><p>You left a run in progress: ' + E_(CFG[rs.camp].label) + ', seeded history #' + E_(String(rs.seed)) + ', at ' + E_(where) + '.</p><button type="button" class="ebtn" data-act="resume" data-fk="resume">Resume ' + E_(CFG[rs.camp].label) + ' (' + E_(where) + ')</button></div>' : '') +
        '<div class="ti-tombs">' + tomb('oil', '1868', 'Oil · Cleveland', 'John D. Rockefeller', 'Twelve chapters, from a Cleveland refinery to the Supreme Court.', last === 'oil') +
        tomb('steel', '1872', 'Steel · Pittsburgh', 'Andrew Carnegie', 'Twelve chapters, from a bet on Bessemer steel to Morgan’s question.', last === 'steel') + '</div>' +
        '<p class="ti-fine">Before you start: almost every crossroads is real history, the rivals are composites and the numbers are a model. The case file below says which is which. A run takes 10 to 25 minutes.</p></div>';
      var PSg = window.PS;
      if (PSg) { try { if (PSg.plates) PSg.plates(stage); if (PSg.img) PSg.img(stage); if (PSg.foil) PSg.foil(stage); } catch (e) {} }
      if (focus) K.focus(stage.querySelector('.ti-h'), { scroll: true });
    }
    function tomb(camp, year, kick, who, line, last) {
      var p = PORT[camp];
      return '<article class="ti-tomb' + (last ? ' is-last' : '') + '" data-camp="' + camp + '">' +
        '<div class="ti-tart" aria-hidden="true">' + posterOf(camp, 'ti-tpost') + '</div>' +
        '<div class="ti-tid"><figure class="ti-cameo frame-gilt"><div class="plate" data-plate data-mono="' + p.mono + '" style="--ratio:4/5;--focal:' + p.focal + '">' +
          '<img data-src="' + thumb(p, 250) + '" data-srcset="' + thumb(p, 250) + ' 250w, ' + thumb(p, 500) + ' 500w" data-sizes="96px" width="' + p.w + '" height="' + p.h + '" alt="' + p.alt + '" decoding="async"></div></figure>' +
          '<div class="ti-tyr"><p class="stat foil ti-yr">' + year + '</p><p class="lk-kicker ti-tk">' + kick + '</p></div></div>' +
        '<h5 class="ti-tn">' + who + '</h5><p class="ti-ti">' + line + '</p>' + (last ? '<p class="ti-lastl">Your last campaign</p>' : '') +
        '<div class="ti-tfoot"><button type="button" class="ebtn ti-play" data-act="play" data-camp="' + camp + '" data-fk="play-' + camp + '">Play ' + CFG[camp].label + '</button>' +
        '<p class="credit2 ti-credit"><span>' + E_(p.by) + '</span><a href="' + p.page + '" target="_blank" rel="noopener">Public domain<span class="vh"> (opens in a new tab)</span></a></p></div></article>';
    }

    /* ---------------------------------------------------------------- the game skeleton ---------------------------------------------------------------- */
    function start(camp, seed, replay) {
      if (U.cancel) { U.cancel(true); U.cancel = null; }
      clearTimeout(U.confT); U.confirm = null;
      wkDrop();
      S = newGame(camp, seed == null ? CFG[camp].seed : seed);
      log = []; WV.first = null; wkFirst(); U.sheenT = Date.now();
      if (replay) replay.forEach(function (a) { var r = apply(a); if (!r || r.ok === false) throw new Error('The saved run no longer replays at step ' + (log.length + 1)); log.push(a); wkFirst(); });
      save();
      U.sel = U.hover = U.open = null; U.sp = {}; U.lay = null; U.lastParts = null; U.more = false; U.morgan = { mult: 10, con: false }; U.dist = { mode: null, causes: [] }; U.fresh = [];
      endEl.innerHTML = '';
      setCampaign(camp);
      var oil = camp === 'oil', C = CFG[camp];
      stage.innerHTML = '<div class="ti-game ti-' + camp + '">' +
        '<header class="ti-head"><div class="ti-headl"><p class="lk-kicker lk-kicker--foil ti-kick"></p><h4 class="lk-title ti-h" tabindex="-1"></h4></div></header>' +
        '<div class="lk-strip ti-strip" style="--lk-cols:5"></div>' +
        '<div class="ti-news"></div>' +
        '<div class="ti-cross"></div><div class="ti-special"></div><div class="ti-final"></div>' +
        '<section class="ti-yard" data-ground="espresso" aria-label="Your works and its cost sheet"><div class="ti-yard-s"></div><div class="ti-yard-r"><div class="ti-sheet"></div></div></section>' +
        '<div class="ti-board">' +
          '<div class="ti-left"><figure class="ti-fig"><p class="lk-kicker ti-figk">The industry cost curve, this chapter, at your price</p>' +
            '<canvas class="ti-curve" aria-hidden="true"></canvas>' +
            '<figcaption class="ti-legend"><span class="ti-key"><i class="is-you"></i>Your plants</span><span class="ti-key"><i class="is-riv"></i>Rivals</span><span class="ti-key"><i class="is-sub"></i>Below water</span>' +
            (oil ? '<span class="ti-key"><i class="is-hatch"></i>Out of reach</span>' : '') + ' Each bar is a firm: its width is capacity (' + K.term(oil ? 'kbd' : 'kt', oil ? 'kb/d' : 'kt') + '), its height the cost to make one more ' + C.unit + '. The pale cap is fixed cost per unit at the firm’s current output. The dotted line is the ' + K.term('bench', 'new-entrant cost') + '.</figcaption></figure>' +
            '<p class="ti-readout"></p>' +
            '<div class="ti-price"><div class="ti-price-top"><label class="lk-k" for="' + uid + '-pr">Your price</label><output class="ti-pout lk-num" id="' + uid + '-po" for="' + uid + '-pr"></output></div>' +
              '<input type="range" class="ti-range" id="' + uid + '-pr" aria-describedby="' + uid + '-pv">' +
              '<div class="ti-pbtns"><button type="button" class="ebtn2" data-act="follow" data-fk="follow">Follow the market</button>' +
              (oil ? '' : '<button type="button" class="ebtn2" data-act="runfull" data-fk="runfull">Run full</button><span class="ti-hint">Carnegie’s rule: the price that fills your mills.</span>') + '</div>' +
              '<p class="ti-prev" id="' + uid + '-pv"></p></div>' +
          '</div>' +
          '<div class="ti-right"><div class="ti-ledgers"></div></div>' +
        '</div>' +
        '<section class="ti-movewrap" aria-labelledby="' + uid + '-mv"><h5 class="lk-kicker ti-cap" id="' + uid + '-mv"></h5><div class="ti-moves"></div></section>' +
        '<div class="ti-policy"></div><div class="ti-works"></div>' +
        '<div class="btnrow ti-actions"></div>' +
        '<table class="vh ti-sr"><caption>Firms on the cost curve this chapter</caption><thead><tr><th scope="col">Firm</th><th scope="col">Where</th><th scope="col">Capacity</th><th scope="col">Cost of one more</th><th scope="col">Status</th></tr></thead><tbody></tbody></table>' +
        '</div>';
      ['head', 'kick', 'h', 'strip', 'news', 'cross', 'special', 'final', 'yard', 'board', 'curve', 'readout', 'price', 'range', 'pout', 'prev', 'sheet', 'ledgers', 'movewrap', 'cap', 'moves', 'policy', 'works', 'actions', 'sr'].forEach(function (k) {
        el[k] = stage.querySelector('.ti-' + k);
      });
      el.srb = el.sr.querySelector('tbody');
      wkMount();
      drain();
      render({ focus: el.h });
      unlockN('fn1', oil ? 'Oil, 1868' : 'Steel, 1872');
      render();
      if (S.phase === 'end') renderDebrief();
    }
    function resume() {
      var sv = saved;
      if (!canResume(sv)) { renderChooser(true); return; }
      try { start(sv.camp, sv.seed, sv.log); K.say('Run restored at ' + (S.phase === 'play' ? 'chapter ' + (S.t + 1) : 'the end of the story') + '.'); }
      catch (e) {
        if (K.debug && window.console) console.warn('[lab:titan]', e);
        saved = { camp: sv.camp }; store.set(saved);
        renderChooser(true);
        K.say('That run could not be restored. Start a new one.');
      }
    }

    /* ---------------------------------------------------------------- field notes: drain the engine's queue ---------------------------------------------------------------- */
    function unlockN(id, where) {
      if (shelf.notes.unlock(id, { where: where, announce: false }) && SCOPE[S ? S.camp : 'oil'].indexOf(id) >= 0) {
        U.fresh.push(id);
        var n = NOTES.filter(function (x) { return x.id === id; })[0];
        K.say('New field note: ' + n.term + '.');
      }
    }
    function drain() { if (!S) return; var q = S.unlockQ.splice(0); q.forEach(function (u) { unlockN(u[0], u[1]); }); }

    /* ---------------------------------------------------------------- render ---------------------------------------------------------------- */
    function render(o) {
      if (!S) return;
      o = o || {};
      var ae = document.activeElement, fk = ae && root.contains(ae) ? ae.getAttribute('data-fk') : null;
      drain();
      var C = CFG[S.camp], oil = S.camp === 'oil', play = S.phase === 'play';
      var prev = play ? clear(S, pYof(S)) : (S.lastClose ? S.lastClose.res : null);
      el.kick.textContent = C.label + ' · ' + (S.phase === 'play' ? 'Chapter ' + (S.t + 1) + ' of 12' : 'The end of the story');
      el.h.innerHTML = S.phase === 'play' ? E_(yr(S) + ' to ' + yEnd(S)) + (S.cross ? ' <span class="ti-hsub">' + E_(S.cross.def.title) + '</span>' : '')
        : S.phase === 'verdict' ? '1911 <span class="ti-hsub">The verdict</span>' : S.phase === 'morgan' ? '1901 <span class="ti-hsub">Morgan’s question</span>'
        : '<span class="ti-hsub">' + (S.phase === 'dist' ? 'The distribution' : 'The books are closed') + '</span>';
      renderStrip(prev);
      renderNews();
      renderCross();
      renderSpecial();
      renderFinal();
      var showBoard = play;
      el.board.hidden = !showBoard; el.yard.hidden = !play; el.movewrap.hidden = !play; el.policy.hidden = !play; el.works.hidden = !play;
      if (play) { renderPrice(prev); renderSheet(prev); renderMoves(); renderPolicy(); renderWorks(); renderSR(prev); wkSync(prev); }
      renderLedgers(el.ledgers, prev);
      renderActions();
      K.sfill(stage);
      paintCurve();
      if (play && !U.hover) readout(null);
      var tf = typeof o.focus === 'string' ? stage.querySelector(o.focus) : o.focus;
      if (tf) K.focus(tf, { scroll: true });
      else if (fk) { var t = stage.querySelector('[data-fk="' + fk + '"]'); if (t && t !== document.activeElement) { try { t.focus({ preventScroll: true }); } catch (e) {} } }
    }
    function renderStrip(p) {
      var C = CFG[S.camp], oil = S.camp === 'oil', H = heat(S), pips = '';
      for (var i = 0; i < 12; i++) pips += '<i class="lk-pip' + (i < S.t ? ' is-past' : i === S.t ? ' is-now' : '') + '"></i>';
      var h = cell('Year', S.t < 12 ? String(yr(S)) : String(C.end), '', '<span class="lk-pips ti-pips" aria-hidden="true">' + pips + '</span>', 'Year ' + yr(S) + ', chapter ' + Math.min(12, S.t + 1) + ' of 12');
      h += cell('Cash', fM(S.cash), S.cash < 0 ? 'is-bad' : '');
      h += cell('Debt', fM(S.debt), S.debt > limit(S) * 0.9 && S.debt > 0.1 ? 'is-warn' : '', 'limit ' + fM(limit(S)));
      h += cell('Your cost', p && isFinite(p.unitAll) ? fmtP(S, p.unitAll) : '–', '', 'per ' + C.unit + ', all in', 'Your all-in cost per ' + C.unit + ': ' + (p && isFinite(p.unitAll) ? fmtP(S, p.unitAll) : 'none yet'));
      h += cell('Market price', p ? fmtP(S, p.pM) : '–', '', S.phase === 'play' ? 'at your price' : 'last chapter');
      h += cell('Share', p ? F.pct(p.share) : '–', '', 'of sales');
      h += cell('Your fortune', fM(fortune(S)), '', 'stake ' + F.pct(S.own, 1));
      h += cell('Standing', String(Math.round(S.standing)), S.standing < 30 ? 'is-bad' : S.standing >= 65 ? 'is-good' : '', 'out of 100');
      if (oil) h += cell('Heat', String(H), H >= 50 ? 'is-bad' : H >= 30 ? 'is-warn' : '', 'conduct ' + Math.round(Math.max(0, S.hc + S.hcA)) + ' · structure ' + Math.round(S.hs));
      else h += cell('Relations', String(Math.round(S.rel)), S.rel < 30 ? 'is-bad' : S.rel >= 65 ? 'is-good' : '', 'with the men · heat ' + H);
      h += cell('Moves left', S.phase === 'play' ? movesLeft(S) + ' of ' + movesMax(S) : '–', '', S.offerBonus > 0 && S.flags.bustT === S.t ? '+' + S.offerBonus + ' bust offers' : 'this chapter');
      el.strip.innerHTML = h;
    }
    function renderNews() {
      var h = '';
      (S.news || []).forEach(function (t, i) { h += '<p class="ti-dl' + (i === 0 && S.t > 0 ? ' ti-books' : '') + '">' + rich(t) + '</p>'; });
      if (S.t === 0 && S.phase === 'play' && !S.hist.length) h += '<p class="lk-coach ti-how">A chapter: settle the crossroads, make up to ' + movesMax(S) + ' moves, set your price against the cost curve, then close the books. Crossroads never cost a move. Watch your ' + K.term('standing', 'standing') + (S.camp === 'oil' ? ' and your ' + K.term('heat', 'heat') : ' and your men') + ' in the strip; the dispatch and the two ledgers tell you what your choices did.</p>';
      U.fresh.forEach(function (id) {
        var n = NOTES.filter(function (x) { return x.id === id; })[0];
        h += '<p class="ti-nl"><span class="lk-chip lk-chip--foil">Field note</span>' + E_(n.term) + ' <button type="button" class="ti-read" data-note="' + id + '" data-fk="read-' + id + '">Read it</button></p>';
      });
      (S.feed || []).forEach(function (t) { h += '<p class="ti-fl"><span class="lk-chip">You</span>' + rich(t) + '</p>'; });
      el.news.innerHTML = h;
    }
    function renderCross() {
      var c = S.cross;
      if (!c || S.phase !== 'play') { el.cross.innerHTML = ''; el.cross.hidden = true; return; }
      el.cross.hidden = false;
      var d = c.def, opts = optsOf(S, d), ctxT = typeof d.ctx === 'function' ? d.ctx(S) : d.ctx, h = '';
      h += '<section class="lk-card ti-x' + (c.chosen ? ' is-done' : '') + '" aria-labelledby="' + uid + '-xt"><p class="lk-kicker lk-kicker--foil">Crossroads · ' + E_(d.y) + '</p>' +
        '<h5 class="ti-xt" id="' + uid + '-xt">' + E_(d.title) + '</h5><p class="ti-xc">' + rich(ctxT) + '</p>';
      if (!c.chosen) {
        h += '<div class="ti-opts" role="group" aria-label="Your choice">' + opts.map(function (o) {
          var why = o.can ? o.can(S) : null;
          return '<button type="button" class="lk-opt ti-opt" data-cross="' + o.k + '" data-fk="x-' + o.k + '" aria-pressed="false"' + (why ? ' disabled' : '') + '>' +
            '<span class="lk-opt-l">' + rich(o.l, true) + '</span><span class="lk-opt-s">' + rich(o.s, true) + '</span>' +
            (o.dark ? '<span class="ti-dark">Other ledger</span>' : '') + (why ? '<span class="lk-opt-why">' + E_(why) + '</span>' : '') + '</button>';
        }).join('') + '</div>';
      } else {
        h += '<div class="ti-chosen"><span class="lk-k">You chose</span><p>' + rich(c.label, true) + '</p></div>';
        h += '<div class="ti-reveal lk-in"><h6 class="lk-kicker ti-rh" tabindex="-1" id="' + uid + '-rh">What happened</h6>';
        if (c.out.length) h += '<p class="ti-histk">In your history</p><div class="ti-outs">' + c.out.map(function (t) { return '<p class="ti-out">' + rich(t) + '</p>'; }).join('') + '</div>';
        if (c.sub && !c.subChosen) {
          h += '<div class="ti-opts" role="group" aria-label="Your next choice">' + c.sub.map(function (o) {
            return '<button type="button" class="lk-opt ti-opt" data-cross="' + o.k + '" data-fk="xs-' + o.k + '" aria-pressed="false"><span class="lk-opt-l">' + rich(o.l, true) + '</span><span class="lk-opt-s">' + rich(o.s, true) + '</span>' +
              (o.dark ? '<span class="ti-dark">Other ledger</span>' : '') + '</button>';
          }).join('') + '</div>';
        } else {
          var ch = S.choices.filter(function (x) { return x.id === c.id; })[0] || {};
          h += (c.out.length ? '<p class="ti-histk">In history</p>' : '') + '<p class="ti-hist">' + rich(d.hist) + '</p>' + srcLinks(d.src) +
            '<p class="ti-tagl">' + matchTag(ch, d) + '</p>';
        }
        h += '</div>';
      }
      h += '</section>';
      el.cross.innerHTML = h;
    }
    function matchTag(ch, d) {
      if (d.model) return '<span class="ti-match is-model"><i aria-hidden="true"></i>No single historical answer; this is a model crossroads.</span>';
      return ch.hist ? '<span class="ti-match is-same"><i aria-hidden="true"></i>Same as history</span>' : '<span class="ti-match is-dep"><i aria-hidden="true"></i>You departed from history</span>';
    }
    function renderSpecial() {
      var sp = S.special;
      if (!sp || S.phase !== 'play' || !crossDone(S)) { el.special.innerHTML = ''; el.special.hidden = true; return; }
      el.special.hidden = false;
      var list = S.rivals.filter(function (r) { return r.city === 'CLE' && (r.alive || sp.res[r.id]); });
      list.forEach(function (r) { r.known = true; });
      var h = '<section class="lk-card lk-card--event ti-sp" aria-labelledby="' + uid + '-sp"><p class="lk-kicker lk-kicker--foil">Special round · 1872</p>' +
        '<h5 class="ti-xt" id="' + uid + '-sp" tabindex="-1">Six weeks in Cleveland</h5>' +
        '<p class="ti-xc">Six offers. Every Cleveland refiner is on the table, and most of them are losing money. You know these men personally, so you know which ones can run a refinery.' +
        (sp.pressure > 1 ? ' They also know what the South Improvement contracts would do to them, which makes every offer harder to refuse and cheaper' + (sp.disc < 1 ? ' (you pay ' + F.pct(sp.disc) + ' of the usual price)' : '') + ', and every yes a line in the other ledger.' : '') + '</p>' +
        '<p class="ti-offl" aria-live="polite">' + (sp.done ? 'The six weeks are over.' : 'Offers left: <b>' + sp.left + '</b>') + '</p><div class="ti-spgrid">';
      list.forEach(function (r) {
        var st = U.sp[r.id] || (U.sp[r.id] = { lvl: 'fair', pay: 'stock' }), res = sp.res[r.id], ap = appraise(S, r);
        h += '<article class="ti-spc' + (res ? ' is-done' : '') + '"><h6 class="ti-cn">' + E_(r.name) + '</h6><p class="ti-cat">' + E_(r.owner || '') + (r.talent ? ' · <span class="ti-able">Able operator</span>' : '') + '</p>' +
          '<p class="ti-fin lk-num">' + fmtCap(S, r.cap) + ' · cost ' + fmtP(S, vR(S, r)) + ' · cash ' + fM(r.cash) + '</p>' +
          '<p class="ti-distl"><span class="lk-k">Distress</span><span class="lk-bar lk-bar--loss" role="img" aria-label="Distress ' + F.pct(ap.dist) + '"><i style="--w:' + ap.dist.toFixed(3) + '"></i></span></p>';
        if (res) h += '<p class="ti-res">' + E_(res) + '</p>';
        else if (r.alive && !sp.done) {
          var q = quote(S, r, st.lvl, st.pay, spCtx(sp, st.lvl)), cant = canOffer(S, r);
          h += segHTML('sl-' + r.id, [{ v: 'low', l: 'Low' }, { v: 'fair', l: 'Fair' }, { v: 'rich', l: 'Rich' }], st.lvl, 'Offer level for ' + r.name) +
            segHTML('sp-' + r.id, [{ v: 'stock', l: 'Stock' }, { v: 'cash', l: 'Cash' }], st.pay, 'Pay ' + r.name + ' in') +
            '<p class="ti-quote lk-num">' + fM(q.price) + ' in ' + st.pay + ' · <b>' + q.band + '</b> to sell' + (S.m.spies ? ' (' + F.prob(q.P) + ')' : '') + '</p>' +
            '<button type="button" class="ebtn2" data-act="spoffer" data-rid="' + r.id + '" data-fk="spo-' + r.id + '"' + (cant || (st.pay === 'cash' && q.price > room(S)) ? ' disabled' : '') + '>Offer</button>';
        } else if (!r.alive) h += '<p class="ti-res">Gone.</p>';
        h += '</article>';
      });
      h += '</div>' + (sp.done ? '' : '<div class="btnrow"><button type="button" class="ebtn2" data-act="spdone" data-fk="spdone">Done in Cleveland</button></div>') + '</section>';
      el.special.innerHTML = h;
    }

    /* ---------------------------------------------------------------- price lever ---------------------------------------------------------------- */
    function renderPrice(p) {
      var g = going(S), oil = S.camp === 'oil', step = oil ? 0.05 : 0.25, r = el.range;
      var lo = Math.ceil(0.6 * g.ph / step) * step, hi = Math.floor(1.5 * g.ph / step) * step;
      r.min = lo.toFixed(2); r.max = hi.toFixed(2); r.step = String(step);
      r.value = clamp(pYof(S), lo, hi).toFixed(2);
      priceText(p);
    }
    function priceText(p) {
      var pY = pYof(S), g = going(S), live0 = p.rv.filter(function (f) { return f.v > p.pM; }).length, cent = centOf(S);
      el.pout.textContent = fmtP(S, pY) + ' (market ' + fmtP(S, p.pM) + ')';
      el.range.setAttribute('aria-valuetext', fmtP(S, pY) + ', market ' + fmtP(S, p.pM) + (Math.abs(S.pr - 1) < 0.005 ? ', following the market' : ''));
      var marg = isFinite(p.unitAll) ? pY - p.unitAll : NaN;
      el.prev.innerHTML = p.KP > 0 ? 'At ' + fmtP(S, pY) + ' you sell ' + fmtCap(S, p.qP) + ' of ' + fmtCap(S, p.D) + ' (' + F.pct(p.share) + '), ' +
        (isFinite(marg) ? (marg >= 0 ? 'a margin of ' + fmtP(S, marg) : '<span class="lk-loss">a loss of ' + fmtP(S, -marg) + '</span>') + ' per ' + CFG[S.camp].unit + ' all in, ' : '') +
        live0 + ' ' + F.plural(live0, 'rival') + ' below water, and new plants pay above ' + fmtP(S, 1.15 * cent) + '. ' + (S.pr < 0.95 ? '<span class="lk-warn">Undercutting the going rate of ' + fmtP(S, g.ph) + '.</span>' : S.pr > 1.05 ? '<span class="lk-warn">Above the going rate of ' + fmtP(S, g.ph) + '; watch your share.</span>' : 'The going rate is ' + fmtP(S, g.ph) + '.')
        : 'You have nothing to sell this chapter. The going rate is ' + fmtP(S, g.ph) + ', and the price lever wakes up when your works does.';
      el.range.disabled = !(p.KP > 0);
    }
    var qPrice = 0;
    function onPrice() {
      var g = going(S), v = parseFloat(el.range.value);
      S.pr = v / g.ph;
      K.sfill(el.price);
      if (qPrice) return;
      qPrice = requestAnimationFrame(function () {
        qPrice = 0;
        if (!S || S.phase !== 'play') return;
        var p = clear(S, pYof(S));
        priceText(p); renderStrip(p); renderSheet(p); renderLedgers(el.ledgers, p); renderSR(p); paintCurve(); wkSync(p);
      });
    }

    /* ---------------------------------------------------------------- cost sheet ---------------------------------------------------------------- */
    /* the total's foil passes its sheen once, in the renders that open a chapter; every later render prints it at rest */
    function sheen() { return Date.now() - (U.sheenT || 0) < 80 ? ' is-lit' : ''; }
    function renderSheet(p) {
      var oil = S.camp === 'oil', g = great(S), C = CFG[S.camp], h = '<h5 class="lk-kicker ti-shk">Your cost sheet, per ' + C.unit + ' at ' + E_(g ? g.name.toLowerCase() : 'the works') + '</h5>';
      if (!g || g.cap <= 0) { el.sheet.innerHTML = h + '<p class="ti-empty">No works running yet. The cost sheet opens when the first ' + C.unit + ' comes out.</p>'; return; }
      var parts = {}, v = vP(S, g, parts), fpu = p && p.qP > 0 ? p.Fsum / (p.qP * C.G) : NaN, lastP = U.lastParts || {};
      var rows = oil ? [['Crude oil', parts.crude, 'crude'], ['Freight', parts.freight, 'freight'], ['Refining', parts.conv, 'conv'], ['Barrels and cars', parts.cont, 'cont'], ['By-product credit', parts.byp, 'byp']]
        : [['Ore', parts.ore, 'ore'], ['Coke', parts.coke, 'coke'], ['Freight', parts.freight, 'freight'], ['Conversion: fuel and plant', parts.conv, 'conv'], ['Conversion: labor', parts.labor, 'labor']];
      if (parts.war) rows.push(['The Empire war', parts.war, 'war']);
      rows.push(['Fixed, at your output', fpu, 'fixed']);
      var tot = v + (isFinite(fpu) ? fpu : 0), mx = Math.max.apply(null, rows.map(function (r) { return Math.abs(r[1]) || 0; }).concat([0.01]));
      if (!oil && !S.m.costSheets) {
        el.sheet.innerHTML = h + '<div class="ti-shrow ti-shtot"><span class="ti-shl">Total</span><span class="ti-shv ti-shbig stat foil' + sheen() + '">' + fmtP(S, tot) + '</span></div>' +
          '<p class="ti-empty">You have no cost sheets yet. You cannot cut what you cannot see.</p>';
        return;
      }
      h += '<div class="ti-shrows">' + rows.map(function (r) {
        var d = lastP[r[2]], dv = isFinite(d) && isFinite(r[1]) ? r[1] - d : 0, dt = Math.abs(dv) >= 0.005 ? '<span class="ti-shd ' + (dv > 0 ? 'lk-loss' : 'lk-gain') + '">' + (dv > 0 ? '+' : MINUS) + Math.abs(dv).toFixed(2) + '</span>' : '<span class="ti-shd"></span>';
        return '<div class="ti-shrow' + (WV.sel === r[2] ? ' is-on' : '') + '" data-wk="' + (r[2] === 'war' ? 'freight' : r[2]) + '"><span class="ti-shl">' + r[0] + '</span><span class="ti-shv lk-num' + (r[1] < 0 ? ' lk-gain' : '') + '">' + (isFinite(r[1]) ? (r[1] < 0 ? MINUS : '') + fmtP(S, Math.abs(r[1])) : '–') + '</span>' + dt +
          '<span class="lk-bar ti-shb' + (r[2] === 'fixed' ? '' : '') + '" aria-hidden="true"><i style="--w:' + (isFinite(r[1]) ? Math.min(1, Math.abs(r[1]) / mx) : 0).toFixed(3) + '"></i></span></div>';
      }).join('') + '<div class="ti-shrow ti-shtot"><span class="ti-shl">Total, all in</span><span class="ti-shv ti-shbig stat foil' + sheen() + '">' + fmtP(S, tot) + '</span></div></div>' +
        '<p class="ti-shnote">Changes are against last chapter. A market price of ' + fmtP(S, p.pM) + ' leaves ' + (p.pM - tot >= 0 ? fmtP(S, p.pM - tot) : MINUS + fmtP(S, tot - p.pM)) + ' a ' + C.unit + '.</p>';
      el.sheet.innerHTML = h;
    }

    /* ---------------------------------------------------------------- the two ledgers ---------------------------------------------------------------- */
    function renderLedgers(host, p, final) {
      if (!host || !S) return;
      var C = CFG[S.camp], fin = S.hist.filter(function (x) { return isFinite(x.unitAll); }), c0 = fin[0], cNow = p && isFinite(p.unitAll) ? p.unitAll : fin.length ? fin[fin.length - 1].unitAll : NaN;
      var money = [
        ['Your fortune', fM(fortune(S))],
        ['Company value', S.sold ? 'Sold' : fM(Math.max(0, EV(S)))],
        ['Your stake', F.pct(S.own, 1)],
        ['Share of sales', p ? F.pct(p.share) : '–'],
        ['Cost per ' + C.unit, (c0 && isFinite(cNow) && fin.length > 1 ? '<s class="ti-was">' + fmtP(S, c0.unitAll) + '</s> ' : '') + (isFinite(cNow) ? fmtP(S, cNow) : '–')],
        ['Market price', p ? fmtP(S, p.pM) : '–'],
        ['Your buyers vs an efficient industry', !S.hist.length ? '–' : S.consumer >= 0 ? '<span class="lk-gain">saved ' + fM(S.consumer) + '</span>' : '<span class="lk-loss">overpaid ' + fM(-S.consumer) + '</span>']
      ];
      var other = S.harms.slice().reverse(), notesN = S.notes.slice().reverse(), shown = final || U.more ? other : other.slice(0, 5);
      var gifts = S.gifts.slice().reverse();
      var h = '<div class="ti-lg ti-lgm"><h5 class="ti-lgh">The money ledger</h5><dl class="ti-lgrows">' + money.map(function (r) { return '<div class="ti-lgrow"><dt>' + r[0] + '</dt><dd class="lk-num">' + r[1] + '</dd></div>'; }).join('') + '</dl>' +
        '<h6 class="ti-lgsub">Gifts' + (S.giftTotal > 0 ? ' · ' + fM(S.giftTotal) : '') + '</h6>' +
        (gifts.length ? '<ul class="ti-lgl">' + gifts.map(function (g) { return '<li><span class="ti-lgy lk-num">' + g.year + '</span>' + E_(g.text) + (g.amt ? ' <span class="lk-num">' + fM(g.amt) + '</span>' : '') + '</li>'; }).join('') + '</ul>' : '<p class="ti-empty">None yet. Gifts live here and nowhere else.</p>') + '</div>' +
        '<div class="ti-lg ti-lgo"><h5 class="ti-lgh">The other ledger</h5>' +
        (other.length ? '<ul class="ti-lgl">' + shown.map(function (x) { return '<li class="ti-k-' + x.kind + '"><span class="ti-lgy lk-num">' + x.year + '</span>' + E_(x.text) + '</li>'; }).join('') + '</ul>' +
          (!final && other.length > 5 ? '<button type="button" class="ti-more" data-act="more" data-fk="more" aria-expanded="' + U.more + '">' + (U.more ? 'Show the newest five' : '+ ' + (other.length - 5) + ' more') + '</button>' : '')
          : '<p class="ti-empty">Nothing yet. Every line that lands here stays.</p>') +
        (notesN.length ? '<details class="ti-neutral"' + (final ? ' open' : '') + '><summary>Closures and failures (' + notesN.length + ')</summary><ul class="ti-lgl">' + notesN.map(function (x) { return '<li><span class="ti-lgy lk-num">' + x.year + '</span>' + E_(x.text) + '</li>'; }).join('') + '</ul></details>' : '') +
        '</div><p class="ti-lgfoot">The books do not balance. They are not supposed to.</p>';
      host.innerHTML = h;
    }

    /* ---------------------------------------------------------------- moves ---------------------------------------------------------------- */
    function renderMoves() {
      var ids = MOVES[S.camp], sts = ids.map(function (id) { return mvState(S, id); });
      var open = sts.filter(function (s) { return !s.why && !s.done; }), on = sts.filter(function (s) { return s.done; });
      var later = sts.filter(function (s) { return s.why && !s.done && /^Opens in/.test(s.why); }), shut = sts.filter(function (s) { return s.why && !s.done && !/^Opens in/.test(s.why); });
      el.cap.textContent = 'Moves this chapter · ' + movesLeft(S) + ' of ' + movesMax(S) + ' left' + (S.offerBonus > 0 && S.flags.bustT === S.t ? ' · plus ' + S.offerBonus + ' bust offers' : '');
      var h = '';
      if (!crossDone(S)) h += '<p class="ti-gate">Settle the crossroads above first. Crossroads never cost a move.</p>';
      else if (S.special && !S.special.done) h += '<p class="ti-gate">Finish the six weeks in Cleveland first.</p>';
      h += '<div class="ti-moves-g">' + open.map(card).join('') + on.map(card).join('') + '</div>';
      later = shut.concat(later);
      if (!crossDone(S) || (S.special && !S.special.done)) later = later.filter(function (s) { return !/^(Settle the crossroads|Finish the six weeks)/.test(s.why); });
      if (later.length) h += '<details class="ti-later"' + (U.laterOpen ? ' open' : '') + '><summary>Not available now (' + later.length + ')</summary><ul>' + later.map(function (s) {
        return '<li><span>' + E_(s.d.name) + '</span><span class="ti-lw">' + E_(s.why) + '</span></li>'; }).join('') + '</ul></details>';
      el.moves.innerHTML = h;
      K.sfill(el.moves);
    }
    function card(st) {
      var d = st.d, id = st.id, isOpen = U.open === id && !st.why && !st.done, param = d.kind && d.kind !== 'simple';
      var cost = st.cost != null ? (st.cost > 0 ? 'Costs ' + fM(st.cost) : 'No cost') : d.kind === 'build' ? 'Cost depends on size' : d.kind === 'offer' ? 'Stock or cash' : d.kind === 'give' ? 'From your own money' : '';
      var h = '<article class="ti-card' + (d.dark ? ' ti-card--dark' : '') + (st.done ? ' is-done' : '') + (st.why ? ' is-shut' : '') + (isOpen ? ' is-open' : '') + '" data-mv="' + id + '">' +
        '<p class="ti-cat">' + E_(d.cat) + (d.dark ? ' · <span class="ti-dark">Other ledger</span>' : '') + '</p>' +
        '<h6 class="ti-cn">' + E_(d.name) + '</h6><p class="ti-ce">' + rich(d.eff) + '</p>' + (cost ? '<p class="ti-cc lk-num">' + cost + '</p>' : '');
      if (st.on) h += '<p class="ti-cs is-on"><span class="ti-onl">On</span> <button type="button" class="ti-stop" data-stop="' + id + '" data-fk="stop-' + id + '">Stop</button></p>';
      else if (st.done) h += '<p class="ti-cs is-done"><span aria-hidden="true">✓</span> Done</p>';
      else if (st.why) h += '<p class="ti-cs">' + E_(st.why) + '</p>';
      else if (!isOpen) h += '<button type="button" class="ebtn2 ti-go" data-go="' + id + '" data-fk="go-' + id + '"' + (param ? ' aria-expanded="false"' : '') + '>' + (param ? 'Choose' : 'Do it') + '</button>';
      if (isOpen) h += panel(id, d);
      return h + '</article>';
    }
    function panel(id, d) {
      var h = '<div class="ti-panel" role="group" aria-label="' + E_(d.name) + '">';
      if (d.kind === 'build') {
        var ch = buildChoices(S);
        if (!U.size || !ch.some(function (b) { return b.k === U.size && b.ok; })) U.size = (ch.filter(function (b) { return b.ok; })[0] || {}).k;
        h += '<p class="lk-k">Add, as a share of next chapter’s market</p>' + segHTML('size', ch.map(function (b) { return { v: b.k, l: b.label, dis: !b.ok }; }), U.size, 'How much to build');
        var b = ch.filter(function (x) { return x.k === U.size; })[0];
        h += '<p class="ti-quote lk-num">' + (b ? fmtCap(S, b.add) + ' for ' + fM(b.cost) + (b.capped ? ' (you can at most double in one chapter)' : '') + ' · runs next chapter' : '') + '</p>' +
          '<button type="button" class="ebtn" data-commit="' + id + '" data-fk="commit-' + id + '"' + (b ? '' : ' disabled') + '>Break ground</button>';
      } else if (d.kind === 'offer' || d.kind === 'target') {
        var tg = d.kind === 'offer' ? offerTargets(S) : live(S);
        tg.sort(function (a, b) { return b.cap - a.cap; });
        if (!U.tgt || !tg.some(function (r) { return r.id === U.tgt; })) U.tgt = U.sel && tg.some(function (r) { return r.id === U.sel; }) ? U.sel : (tg[0] || {}).id;
        h += '<label class="lk-k" for="' + uid + '-tg-' + id + '">' + (d.kind === 'offer' ? 'Whom to buy' : 'Whose market') + '</label><select class="ti-sel" id="' + uid + '-tg-' + id + '" data-tsel="1" data-fk="tsel-' + id + '">' +
          tg.map(function (r) { return '<option value="' + r.id + '"' + (r.id === U.tgt ? ' selected' : '') + '>' + E_(r.name) + ' · ' + fmtCap(S, r.cap) + '</option>'; }).join('') + '</select>' +
          '<p class="ti-hint">Or pick a bar on the chart.</p>';
        if (d.kind === 'offer') {
          var bust = S.offerBonus > 0 && S.flags.bustT === S.t;
          if (!bust) h += segHTML('lvl', [{ v: 'low', l: 'Low' }, { v: 'fair', l: 'Fair' }, { v: 'rich', l: 'Rich' }], U.lvl, 'Offer level');
          else h += '<p class="ti-hint">Depression terms: 60 percent of appraisal, and the seller knows why.</p>';
          h += segHTML('pay', [{ v: 'stock', l: 'Stock' }, { v: 'cash', l: 'Cash' }], U.pay, 'Pay in');
          h += '<p class="ti-quote lk-num" aria-live="polite">' + offerQuoteText(id) + '</p>';
          h += '<button type="button" class="ebtn" data-commit="' + id + '" data-fk="commit-' + id + '">Make the offer</button>';
        } else {
          var tr = rivalById(S, U.tgt), bc = tr ? 0.2 * clear(S, pYof(S)).pM * (tr.lastQ || tr.cap * 0.5) * CFG[S.camp].G * Tt(S).g * (S.m.spies ? 0.5 : 1) : 0;
          h += '<p class="ti-quote lk-num">Expect to pay about ' + fM(bc) + ' in discounts at the close.</p><button type="button" class="ebtn" data-commit="' + id + '" data-fk="commit-' + id + '">Cut to kill</button>';
        }
      } else if (d.kind === 'plant') {
        var ps = upgradable(S);
        if (!U.pl || !ps.some(function (p) { return p.id === U.pl; })) U.pl = (ps[0] || {}).id;
        h += '<label class="lk-k" for="' + uid + '-pl">Which works</label><select class="ti-sel" id="' + uid + '-pl" data-psel="1">' + ps.map(function (p) {
          return '<option value="' + p.id + '"' + (p.id === U.pl ? ' selected' : '') + '>' + E_(p.name) + ' · ' + fM(0.3 * p.cap * capex(S)) + '</option>'; }).join('') + '</select>' +
          '<button type="button" class="ebtn" data-commit="' + id + '" data-fk="commit-' + id + '">Rebuild it</button>';
      } else if (d.kind === 'give') {
        var gm = giveModes(S);
        if (!gm.some(function (x) { return x.k === U.give && x.ok; })) U.give = (gm.filter(function (x) { return x.ok; })[0] || {}).k;
        h += segHTML('give', gm.map(function (x) { return { v: x.k, l: x.l, dis: !x.ok }; }), U.give, 'How to give');
        var gg = gm.filter(function (x) { return x.k === U.give; })[0];
        h += '<p class="ti-quote lk-num">' + (gg ? fM(Math.min(S.personal, gg.amt)) + ' of your own money · standing +' + gg.st : gm.map(function (x) { return x.why; }).filter(Boolean).join('. ')) + '</p>' +
          '<button type="button" class="ebtn" data-commit="' + id + '" data-fk="commit-' + id + '"' + (gg ? '' : ' disabled') + '>Give</button>';
      }
      return h + '<button type="button" class="ti-cancel" data-cancel="1" data-fk="cancel-' + id + '">Cancel</button></div>';
    }
    function offerQuoteText(id) {
      var r = rivalById(S, U.tgt);
      if (!r) return '';
      var bust = S.offerBonus > 0 && S.flags.bustT === S.t, q = quote(S, r, U.lvl, U.pay, bust ? { level: 0.6, pressure: 1.2 } : null);
      var poor = U.pay === 'cash' && q.price > room(S);
      return fM(q.price) + ' in ' + U.pay + ' · <b>' + q.band + '</b> to sell' + (S.m.spies ? ' (' + F.prob(q.P) + ', from the waybills)' : '') +
        (q.pressure > 1 ? ' · <span class="lk-loss">under pressure: a line in the other ledger if they say yes</span>' : '') +
        (poor ? ' · <span class="lk-loss">you can fund ' + fM(room(S)) + ' in cash</span>' : '') +
        (U.pay === 'stock' ? ' · your stake would fall to about ' + F.pct(S.own * Vstock(S) / (Vstock(S) + q.price), 1) : '');
    }

    /* ---------------------------------------------------------------- policy, works ---------------------------------------------------------------- */
    function renderPolicy() {
      var C = CFG[S.camp], oil = S.camp === 'oil', h = '<h5 class="lk-kicker">' + (oil ? 'Dividend policy' : 'Mill policy') + '</h5><div class="ti-pol">';
      var hi = Math.max(C.payout, C.payAlt), lo = Math.min(C.payout, C.payAlt);
      h += '<div class="ti-polf"><span class="lk-k" id="' + uid + '-dv">Dividends</span>' + segHTML('payout', [{ v: String(lo), l: 'Plow back ' + Math.round((1 - lo) * 100) + '%' }, { v: String(hi), l: 'Pay out ' + Math.round(hi * 100) + '%' }], String(S.payout), 'Dividends') + '</div>';
      if (!oil && capTot(S) <= 0) h += '<div class="ti-polf"><span class="lk-k">The mills</span><p class="ti-unl">Shifts, wages and the union become yours to set when the works runs.</p></div>';
      else if (!oil) {
        h += '<div class="ti-polf"><span class="lk-k">Shifts</span>' + segHTML('shift', [{ v: '1', l: 'Two 12-hour turns' }, { v: '0', l: 'Three 8-hour turns', dis: !!S.flags.shiftLock }], String(S.m.shift12), 'Shifts') +
          (S.flags.shiftLock ? '<p class="ti-hint">Locked since Homestead.</p>' : '') + '</div>';
        h += '<div class="ti-polf"><span class="lk-k">Wages this chapter</span>' + segHTML('wage', [{ v: '-1', l: 'Cut 10%' }, { v: '0', l: 'Hold' }, { v: '1', l: 'Raise 10%' }], String(S.wageAct), 'Wages this chapter') + '</div>';
        h += '<div class="ti-polf"><span class="lk-k">The union</span><p class="ti-unl">' + (S.m.union ? 'Recognized at your works.' : 'Refused at your works.') + '</p>' +
          (S.m.union ? '<button type="button" class="ebtn2 ti-break" data-act="breakunion" data-fk="union">Break the union</button><p class="ti-hint">Its output rules go with it: more tons from the same mills. Standing and relations fall, and it goes in the other ledger.</p>'
            : '<button type="button" class="ebtn2" data-act="recognize" data-fk="union">Recognize the union</button>') + '</div>';
      }
      el.policy.innerHTML = h + '</div>';
    }
    function renderWorks() {
      var C = CFG[S.camp], lc = S.lastClose && S.lastClose.res, used = {};
      if (lc) lc.pp.forEach(function (x) { used[x.id] = x.cap > 0 ? x.q / x.cap : 0; });
      var rows = S.plants.map(function (p) {
        var pend = sum(S.pend.filter(function (x) { return x.pid === p.id; }), function (x) { return x.cap; });
        return '<tr><td>' + E_(p.name) + (p.great ? ' <span class="ti-main">main works</span>' : '') + '</td><td data-l="Capacity">' + (p.cap > 0 ? fmtCap(S, p.cap) : '–') + (pend > 0 ? ' <span class="ti-pend">+' + fmtCap(S, pend) + ' next</span>' : '') + '</td>' +
          '<td data-l="Cost of one more">' + (p.cap > 0 ? fmtP(S, vP(S, p)) : '–') + '</td><td data-l="Used last chapter">' + (used[p.id] != null ? F.pct(used[p.id]) : '–') + '</td>' +
          '<td data-l="Action">' + (p.great ? '' : '<button type="button" class="ti-closep" data-closep="' + p.id + '" data-fk="closep-' + p.id + '">Close it (+' + fM(p.cap * capex(S) * 0.2) + ')</button>') + '</td></tr>';
      }).join('');
      el.works.innerHTML = '<h5 class="lk-kicker">Your works</h5>' + (S.plants.length ? '<div class="lk-scroll"><table class="lk-table lk-table--stack ti-wt"><thead><tr><th scope="col">Plant</th><th scope="col">Capacity</th><th scope="col">Cost of one more</th><th scope="col">Used last chapter</th><th scope="col"><span class="vh">Action</span></th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<p class="ti-empty">No works yet.</p>');
    }
    function renderSR(p) {
      if (!p) return;
      el.srb.innerHTML = p.fs.slice().sort(function (a, b) { return a.v - b.v; }).map(function (f) {
        var o = f.o;
        return '<tr><td>' + E_(f.k === 'p' ? 'Yours: ' + o.name : o.name) + '</td><td>' + E_(CITY[o.city] || '') + '</td><td>' + fmtCap(S, f.cap) + '</td><td>' + fmtP(S, f.v) + '</td><td>' + (f.v > p.pM ? 'below water' : f.q < 0.3 * f.cap ? 'producing little' : 'producing') + '</td></tr>';
      }).join('');
    }
    function renderActions() {
      var h = '', play = S.phase === 'play';
      if (play) {
        var ok = crossDone(S);
        h += '<button type="button" class="ebtn ti-closeb" data-act="close" data-fk="close"' + (ok ? '' : ' disabled aria-describedby="' + uid + '-cw"') + '>Close the books: ' + yr(S) + ' to ' + yEnd(S) + '</button>' +
          (ok ? '' : '<span class="ti-hint" id="' + uid + '-cw">Settle the crossroads first.</span>');
      }
      h += conf('replay', 'Replay this history') + conf('new', 'New history') + conf('switch', 'Switch titan');
      el.actions.innerHTML = h;
    }
    function conf(a, label) {
      var ask = U.confirm === a;
      return '<button type="button" class="ebtn2' + (ask ? ' is-ask' : '') + '" data-act="' + a + '" data-fk="act-' + a + '">' + (ask ? 'Start over? Press again' : label) + '</button>';
    }

    /* ---------------------------------------------------------------- endgames ---------------------------------------------------------------- */
    function renderFinal() {
      var ph = S.phase, h = '';
      if (ph === 'verdict') h = verdictHTML();
      else if (ph === 'morgan') h = morganHTML();
      else if (ph === 'dist' || ph === 'end') h = distHTML();
      el.final.innerHTML = h; el.final.hidden = !h;
      K.sfill(el.final);
    }
    function verdictHTML() {
      var V = S.verdict, p = pBreak(S), h = '<section class="lk-card lk-card--tomb ti-docket" data-ground="espresso" aria-labelledby="' + uid + '-dk"><p class="lk-kicker lk-kicker--foil">The Supreme Court · May 1911</p><h5 class="ti-xt" id="' + uid + '-dk" tabindex="-1">The docket</h5>';
      var bars = [['Conduct heat', S.hc, 'What you did: rebates, drawbacks, pressure, predation'], ['The record', S.rec, 'What came out: contracts, testimony and leaks; unlike heat, it never fades'], ['Structural heat', S.hs, 'How big you got and how far above the benchmark you priced'], ['Standing', S.standing, 'What the public thinks of you']];
      h += '<div class="ti-dbars">' + bars.map(function (b) {
        return '<div class="ti-dbar"><span class="lk-k">' + b[0] + '</span><span class="lk-num ti-dv">' + Math.round(b[1]) + '</span><span class="lk-bar' + (b[0] === 'Standing' ? '' : ' lk-bar--loss') + '" role="img" aria-label="' + b[0] + ' ' + Math.round(b[1]) + ' of 100"><i style="--w:' + clamp(b[1] / 100, 0, 1).toFixed(3) + '"></i></span><span class="ti-hint">' + b[2] + '</span></div>';
      }).join('') + '</div>';
      h += '<p class="ti-dread">' + (S.flags.selfSplit ? 'You have already broken yourself up; the Court has little left to decide.' : 'The Court’s likely reading: <b>' + (p >= 0.5 ? 'dissolution' : 'no dissolution') + '</b> (' + F.prob(p) + ' chance of dissolution' + (S.flags.posture === 0.6 ? ', after your settlement offer' : '') + ').') + '</p>';
      if (!V.heard) h += '<div class="btnrow"><button type="button" class="ebtn" data-act="hear" data-fk="hear">Hear the decision</button></div>';
      else {
        h += '<div class="ti-reveal lk-in"><h6 class="lk-kicker ti-rh" tabindex="-1">The decision</h6><p class="ti-out">' + (V.dissolved
          ? 'May 15, 1911. For the Court, Chief Justice White: the Sherman Act forbids unreasonable restraints of trade, judged by their effects, and yours were unreasonable. Your holding company has six months to divest its subsidiaries.'
          : 'The Court agrees that the Sherman Act forbids only unreasonable restraints, and on this record declines to order dissolution. This did not happen in history; in this playthrough your record was thin enough.') + '</p>' +
          '<p class="ti-histk">In history</p><p class="ti-hist">Standard was split into 34 companies by the Supreme Court Historical Society’s count. Their shares mostly doubled, and PBS puts Rockefeller’s wealth at its lifetime peak, $900 million, in 1913. The engine does not pretend to price those markets; your fortune stands as the books left it.</p>' +
          srcLinks(S_('scotus', 'wSO', 'pbsRock')) + '<div class="btnrow"><button type="button" class="ebtn" data-act="todist" data-fk="todist">Settle your fortune</button></div></div>';
      }
      return h + '</section>';
    }
    function morganHTML() {
      var M0 = S.morgan, base = Math.max(0, S.lastAnnual[1]), h = '<section class="lk-card lk-card--tomb ti-morgan" data-ground="espresso" aria-labelledby="' + uid + '-mg"><p class="lk-kicker lk-kicker--foil">New York · December 1900</p><h5 class="ti-xt" id="' + uid + '-mg" tabindex="-1">Morgan’s question</h5>' +
        '<p class="ti-xc">On December 12, 1900, Charles Schwab, who runs your company day to day, speaks at a University Club dinner about one great combination of the steel companies. J. P. Morgan is listening. You have also been planning a giant tube works at Conneaut, Ohio, that would compete head-on with Morgan’s National Tube. Now Morgan wants your price.</p>';
      if (!M0.done) {
        var ask = U.morgan.mult * base;
        h += '<button type="button" class="lk-opt ti-con" data-act="conneaut" data-fk="conneaut" aria-pressed="' + U.morgan.con + '"><span class="lk-opt-l">Break ground at Conneaut first</span><span class="lk-opt-s">Costs ' + fM(0.03 * Math.max(0, EV(S))) + ' of company money, and your stake of that comes off whatever Morgan pays you. A threat he can see is worth more than one he has only heard about, if he believes you will build it.</span></button>' +
          '<div class="ti-field"><div class="ti-price-top"><label class="lk-k" for="' + uid + '-mp">Your price</label><output class="lk-num ti-mout" for="' + uid + '-mp">' + fM(ask) + ' · ' + U.morgan.mult.toFixed(1) + '× your latest annual profit</output></div>' +
          '<input type="range" class="ti-mrange" id="' + uid + '-mp" min="8" max="16" step="0.5" value="' + U.morgan.mult + '" aria-valuetext="' + fM(ask) + ', ' + U.morgan.mult.toFixed(1) + ' times profit"></div>' +
          '<p class="ti-hint">In this model Morgan’s bankers value a steel company at about nine to thirteen times its latest profit, adjusted for what they have heard and a mood you cannot see, and a little more if they believe a threat. Ask above what he will pay and he walks. Your stake is ' + F.pct(S.own, 1) + '.</p>' +
          '<div class="btnrow"><button type="button" class="ebtn" data-act="writeit" data-fk="writeit">Write it down</button><button type="button" class="ebtn2" data-act="refuse" data-fk="refuse">Refuse to sell</button></div>';
      } else {
        h += '<div class="ti-reveal lk-in"><h6 class="lk-kicker ti-rh" tabindex="-1">Morgan’s answer</h6><p class="ti-out">' + (M0.sold
          ? 'You write ' + fM(M0.ask) + ' on a slip of paper. Schwab carries it to Morgan, who reads it and says yes. Your share is ' + fM(S.proceeds) + ', in bonds' + (M0.conneaut ? ', after your stake of the Conneaut ground-breaking.' : '.')
          : M0.refused ? 'You refuse. The combinations spend the next years fighting you for every order. ' + (M0.k > 1 ? 'You won the war and nobody paid you for it.' : 'You were right about the tube works and wrong about Morgan’s patience.')
          : 'You write ' + fM(M0.ask) + '. Morgan was ready to go to about ' + fM(M0.M) + ', and he walks. ' + (M0.k > 1 ? 'You won the war that followed, and nobody paid you for it.' : 'You were right about the tube works and wrong about Morgan’s patience.')) +
          (M0.conneaut ? ' ' + (M0.cred === false ? 'He never believed you would build at Conneaut, so the ground-breaking bought nothing.' : 'He believed the Conneaut threat, and it raised his number.') : '') + '</p>' +
          '<p class="ti-histk">In history</p><p class="ti-hist">Carnegie named his price by hand and Schwab carried it to Morgan, who accepted. PBS says Morgan paid $480 million; Wikipedia and Robert Hessen give $492 million. Carnegie’s own share was about $226 million, in gold bonds, and U.S. Steel was capitalized at $1.4 billion, the world’s first billion-dollar corporation. Carnegie Steel had earned about $21 million in 1899 and, by Schwab’s figures, about $40 million in 1900.</p>' +
          srcLinks(S_('pbsFilm', 'wCS', 'pmhb', 'wAC', 'wUSS')) + '<div class="btnrow"><button type="button" class="ebtn" data-act="todist" data-fk="todist">Settle your fortune</button></div></div>';
      }
      return h + '</section>';
    }
    function distHTML() {
      var dn = S.phase === 'end', h = '<section class="lk-card ti-dist" aria-labelledby="' + uid + '-ds"><p class="lk-kicker lk-kicker--foil">' + (S.over ? 'After the receivers' : 'The last chapter') + '</p><h5 class="ti-xt" id="' + uid + '-ds" tabindex="-1">The distribution</h5>' +
        '<p class="ti-xc">' + (S.over ? 'What the receivers left you: ' + fM(fortune(S)) + '. In 1889 Carnegie wrote that there are three ways to dispose of a surplus fortune; they still apply, on a smaller scale.' : 'You have ' + fM(fortune(S)) + ' of your own. In 1889 Carnegie wrote that there are three ways to dispose of a surplus fortune.') + '</p>';
      if (!dn) {
        h += '<div class="ti-opts" role="group" aria-label="What to do with it">' + MODES.map(function (m) {
          return '<button type="button" class="lk-opt ti-opt" data-mode="' + m.k + '" data-fk="mode-' + m.k + '" aria-pressed="' + (U.dist.mode === m.k) + '"><span class="lk-opt-l">' + E_(m.l) + '</span><span class="lk-opt-s">' + E_(m.s) + '</span></button>';
        }).join('') + '</div><p class="lk-k" id="' + uid + '-cz">Choose up to three causes</p><div class="ti-causes" role="group" aria-labelledby="' + uid + '-cz">' + CAUSES.map(function (c, i) {
          var on = U.dist.causes.indexOf(c) >= 0;
          return '<button type="button" class="lk-chip-btn ti-cause" data-cause="' + i + '" data-fk="cause-' + i + '" aria-pressed="' + on + '"' + (!on && U.dist.causes.length >= 3 ? ' disabled' : '') + '>' + E_(c) + '</button>';
        }).join('') + '</div><p class="ti-hint">No score. The engine writes what you choose into the gifts column and nowhere else.</p>' +
          '<div class="btnrow"><button type="button" class="ebtn" data-act="settle" data-fk="settle"' + (U.dist.mode ? '' : ' disabled') + '>Settle the estate</button></div>';
      } else {
        var md = MODES.filter(function (m) { return m.k === S.dist.mode; })[0];
        h += '<div class="ti-chosen"><span class="lk-k">You chose</span><p>' + E_(md.l) + (S.dist.causes.length ? ' For ' + E_(listJoin(S.dist.causes.map(function (c) { return c.toLowerCase(); }))) + '.' : '') + '</p></div>' +
          '<div class="ti-reveal"><p class="ti-histk">In history</p><p class="ti-hist">Carnegie gave away more than $350 million; he and his foundation gave about $56 million for 2,509 public libraries, 1,681 of them in the United States. Rockefeller gave about $540 million, to the University of Chicago, the Rockefeller Institute for Medical Research (1901), the General Education Board (1902), the Rockefeller Sanitary Commission against hookworm (1909) and the Rockefeller Foundation (1913). In 1905 the minister Washington Gladden objected to a mission board accepting a $100,000 Rockefeller gift; the argument went down as the debate over “tainted money.”</p>' +
          srcLinks(S_('cc', 'ccny', 'rac', 'tainted', 'fordham')) + '</div>';
      }
      return h + '</section>';
    }

    /* ---------------------------------------------------------------- the debrief ---------------------------------------------------------------- */
    function renderDebrief() {
      endEl.innerHTML = '';
      var e = ending(S), C = CFG[S.camp], oil = S.camp === 'oil', fin = S.hist.filter(function (h) { return isFinite(h.unitAll); }), a = fin[0], b = fin[fin.length - 1];
      var ls = lessons(S), rows = S.choices.map(function (c) {
        var d = X[c.id], tag = d.model ? '<span class="ti-match is-model"><i aria-hidden="true"></i>Model</span>' : c.hist ? '<span class="ti-match is-same"><i aria-hidden="true"></i>Same as history</span>' : '<span class="ti-match is-dep"><i aria-hidden="true"></i>Departed</span>';
        return '<tr><td>' + E_(c.year) + ' · ' + E_(d.title) + '</td><td data-l="Your choice">' + rich(c.label, true) + '</td><td data-l="What happened">' + E_(HSHORT[c.id] || '') +
          (d.src && d.src[0] ? ' <a class="ti-srcmini" href="' + E_(d.src[0].u) + '" target="_blank" rel="noopener">Source<span class="vh">: ' + E_(d.src[0].t) + ' (opens in a new tab)</span></a>' : '') + '</td><td data-l="Match">' + tag + '</td></tr>';
      }).join('');
      var same = S.choices.filter(function (c) { return c.hist && !X[c.id].model; }).length, real = S.choices.filter(function (c) { return !X[c.id].model; }).length;
      var lg = document.createElement('div');
      renderLedgers(lg, S.lastClose ? S.lastClose.res : null, true);
      var sections = [
        { label: 'The two ledgers, closed', html: '<div class="ti-ledgers ti-ledgers--end">' + lg.innerHTML + '</div>' },
        WV.fig && !WV.fig.hidden ? { label: 'The works you left', html: '<div class="ti-endworks" data-ground="espresso"></div>' } : null,
        { label: 'Price, your cost and the new-entrant benchmark', html: '<canvas class="lk-chart ti-endchart" aria-hidden="true"></canvas><p class="ti-legend"><span class="ti-key"><i class="is-line"></i>Market price</span><span class="ti-key"><i class="is-you"></i>Your all-in cost and share</span><span class="ti-key"><i class="is-dot"></i>New-entrant cost</span> The tinted band between price and your cost is your margin; the bars under it are your share of sales, chapter by chapter.</p>' + endSummary() },
        { label: 'You and history · ' + same + ' of ' + real + ' real crossroads the same', html: '<div class="lk-scroll"><table class="lk-table lk-table--stack ti-vh"><thead><tr><th scope="col">Chapter</th><th scope="col">Your choice</th><th scope="col">What happened</th><th scope="col">Match</th></tr></thead><tbody>' + rows + '</tbody></table></div>' },
        { label: 'Your decisions, and the principles behind them', html: ls.map(function (l) { return K.lesson({ title: l.title, you: l.you, principle: l.principle, history: l.history, src: l.src }); }).join('') }
      ];
      K.debrief(endEl, { kicker: 'Ending · ' + C.label + ' · seed #' + S.seed, title: e.title, sub: e.sub, lede: e.text,
        stats: [
          { k: 'Your fortune', v: fM(fortune(S)) },
          { k: 'Final share', v: F.pct(finalShare(S)) },
          { k: 'Cost per ' + C.unit + (a && b ? ', ' + fmtP(S, a.unitAll) + ' to ' + fmtP(S, b.unitAll) : ''), v: a && b ? F.pct((b.unitAll - a.unitAll) / a.unitAll, 0, true) : '–', tone: a && b && b.unitAll < a.unitAll ? 'gain' : null },
          { k: 'Your buyers vs an efficient industry', v: (S.consumer >= 0 ? 'saved ' : 'overpaid ') + fM(Math.abs(S.consumer)), tone: S.consumer >= 0 ? 'gain' : 'loss' },
          { k: 'Other ledger', v: S.harms.length + ' ' + F.plural(S.harms.length, 'line') },
          { k: 'Gifts while working', v: S.giftTotal > 0 ? fM(S.giftTotal) : 'None' }
        ],
        sections: sections.filter(Boolean),
        principles: oil ? ['fn1', 'fn3', 'fn4', 'fn7', 'fn11', 'fn13', 'fn14', 'fn17', 'fn25'] : ['fn1', 'fn19', 'fn20', 'fn9', 'fn22', 'fn23', 'fn24', 'fn27', 'fn25'],
        take: true,
        actions: [{ label: 'Replay this history', primary: true, onClick: function () { start(S.camp, S.seed); } },
          { label: 'New history', onClick: function () { start(S.camp, newSeed()); } },
          { label: 'Switch titan', onClick: function () { renderChooser(true); } }]
      });
      var ew = endEl.querySelector('.ti-endworks');
      if (ew && WV.fig) { WV.now = ''; ew.appendChild(WV.fig); var fk = WV.fig.querySelector('.ti-figk'); if (fk) fk.hidden = true; wkSync(S.lastClose ? S.lastClose.res : null, true); }
      K.sfill(endEl);
      paintEnd();
    }
    function endSummary() {
      var H = S.hist;
      return '<table class="vh"><caption>Chapter by chapter</caption><thead><tr><th scope="col">Chapter</th><th scope="col">Market price</th><th scope="col">Your cost</th><th scope="col">New-entrant cost</th><th scope="col">Your share</th></tr></thead><tbody>' +
        H.map(function (h) { return '<tr><td>' + h.year + ' to ' + h.y2 + '</td><td>' + fmtP(S, h.pM) + '</td><td>' + fmtP(S, h.unitAll) + '</td><td>' + fmtP(S, h.cent) + '</td><td>' + F.pct(h.share) + '</td></tr>'; }).join('') + '</tbody></table>';
    }
    function newSeed() { return 10000 + (K.seed() % 90000); }

    /* ---------------------------------------------------------------- the cost curve canvas ---------------------------------------------------------------- */
    function layout(p) {
      var list = p.fs.map(function (f) { return { id: f.id, k: f.k, o: f.o, cap: f.cap, v: f.v, q: f.q || 0, F: f.k === 'p' ? Fc(S, f.o.cap, true) : Fc(S, f.o.cap), dead: false }; });
      S.rivals.forEach(function (r) { if (!r.alive && r.failedT === S.t - 1 && r.lastV) list.push({ id: r.id, k: 'r', o: r, cap: r.cap, v: r.lastV, q: 0, F: 0, dead: true }); });
      list.sort(function (a, b) { return a.v - b.v; });
      var tot = sum(list, function (x) { return x.cap; }), cum = 0;
      list.forEach(function (x) { x.x0 = cum / tot; cum += x.cap; x.x1 = cum / tot; });
      return { list: list, tot: tot };
    }
    function paintCurve() {
      var c = el.curve;
      if (!S || !c || S.phase !== 'play' || !c.isConnected || el.board.hidden) return;
      var narrow = root.clientWidth < 560;
      curveH = narrow ? 200 : 240;
      var f = K.fitCanvas(c, curveH), x = f.ctx, W = f.W, H = curveH;
      if (!(W > 0)) return;
      x.clearRect(0, 0, W, H);
      var p = clear(S, pYof(S)), L0 = layout(p);
      U.lastP = p;
      var list = L0.list, cent = centOf(S), entry = 1.15 * cent, pY = p.pY, oil = S.camp === 'oil';
      var vs = list.map(function (b) { return b.v; }).sort(function (a, b) { return a - b; }), p95 = vs.length ? vs[Math.min(vs.length - 1, Math.floor(vs.length * 0.95))] : p.pM;
      var yMax = 1.2 * Math.max(p.pM, pY, entry, p95), L = narrow ? 36 : 44, R = 12, T = 18, B = 28, pw = W - L - R, phh = H - T - B;
      var Y = function (v) { return T + phh * (1 - Math.min(v, yMax) / yMax); };
      var from = U.from, k = U.blend;
      var sc = c.parentNode || root, acc = K.ACC(), ink = function (a) { return K.labColorA('--ink', a, sc); }, card = K.labColor('--card', sc);
      function tx(t, tx0, ty0, o) { o.px = 11; if (o.halo !== false) o.halo = card; K.cvText(x, t, tx0, ty0, o); }
      /* grid and ticks */
      x.lineWidth = 1;
      for (var i = 0; i <= 4; i++) {
        var tv = yMax * i / 4, ty = K.snap(Y(tv));
        x.strokeStyle = ink(i === 0 ? 0.35 : 0.08); x.beginPath(); x.moveTo(L, ty); x.lineTo(W - R, ty); x.stroke();
        if (i > 0) tx(oil ? tv.toFixed(0) + '¢' : '$' + tv.toFixed(0), L - 6, ty + 3, { align: 'right', raw: true, halo: false, color: ink(0.6) });
      }
      /* bars */
      var lay = {};
      list.forEach(function (b) {
        var fx0 = b.x0, fx1 = b.x1, fv = b.v, fr = from && from[b.id];
        if (fr && k < 1) { fx0 = fr.x0 + (b.x0 - fr.x0) * k; fx1 = fr.x1 + (b.x1 - fr.x1) * k; fv = fr.v + (b.v - fr.v) * k; }
        else if (from && !fr && k < 1) fv = b.v * k;
        var bx = L + fx0 * pw, bw = Math.max(1, (fx1 - fx0) * pw - 1), by = Y(fv), bh = T + phh - by;
        lay[b.id] = { x0: b.x0, x1: b.x1, v: b.v, px0: bx, px1: bx + bw, b: b };
        var mine = b.k === 'p', sel = b.id === U.sel || b.id === U.hover, below = !mine && b.v > p.pM;
        if (b.dead) { x.setLineDash([3, 3]); x.strokeStyle = ink(0.4); x.strokeRect(K.snap(bx), K.snap(by), Math.max(1, bw - 1), bh); x.setLineDash([]); return; }
        var fpu = b.q > 0 ? b.F / (b.q * CFG[S.camp].G) : b.F / (Math.max(b.cap, 1e-9) * 0.5 * CFG[S.camp].G);
        var capTop = Y(fv + Math.min(fpu, yMax));
        if (below) { x.strokeStyle = ink(0.4); x.strokeRect(K.snap(bx), K.snap(by), Math.max(1, bw - 1), bh); }
        else {
          /* a rival is a light wash under a drawn top edge, so the curve reads as one engraved line; yours is solid */
          x.fillStyle = mine ? acc : ink(b.q >= 0.3 * b.cap ? 0.2 : 0.1);
          x.fillRect(bx, by, bw, bh);
          if (!mine) { x.fillStyle = ink(b.q >= 0.3 * b.cap ? 0.8 : 0.5); x.fillRect(bx, by, bw, 1.5); }
          x.fillStyle = mine ? K.ACCA(0.3) : ink(0.07);
          x.fillRect(bx, capTop, bw, by - capTop);
        }
        if (b.o.noBuy) {
          x.save(); x.beginPath(); x.rect(bx, by, bw, bh); x.clip(); x.strokeStyle = ink(0.35); x.lineWidth = 1; x.beginPath();
          for (var hx = bx - bh; hx < bx + bw; hx += 5) { x.moveTo(hx, by + bh); x.lineTo(hx + bh, by); }
          x.stroke(); x.restore();
        }
        if (sel) { x.lineWidth = 2; x.strokeStyle = mine ? ink(0.85) : acc; x.strokeRect(bx + 1, by + 1, Math.max(1, bw - 2), bh - 2); x.lineWidth = 1; }
      });
      U.lay = lay;
      /* demand, entry, price lines */
      var dx = L + Math.min(1, p.D / L0.tot) * pw;
      x.setLineDash([4, 4]); x.strokeStyle = ink(0.45); x.beginPath(); x.moveTo(K.snap(dx), T); x.lineTo(K.snap(dx), T + phh); x.stroke(); x.setLineDash([]);
      tx('Demand', Math.min(dx + 4, W - R - 50), T + 10, { color: ink(0.7) });
      var ey = K.snap(Y(entry));
      x.setLineDash([1, 3]); x.strokeStyle = ink(0.6); x.lineWidth = 1.5; x.beginPath(); x.moveTo(L, ey); x.lineTo(W - R, ey); x.stroke(); x.setLineDash([]); x.lineWidth = 1;
      var my = K.snap(Y(p.pM));
      x.strokeStyle = ink(0.85); x.lineWidth = 1.5; x.beginPath(); x.moveTo(L, my); x.lineTo(W - R, my); x.stroke(); x.lineWidth = 1;
      tx('Market ' + fmtP(S, p.pM), W - R - 2, my - 5, { align: 'right', raw: false, color: ink(0.85) });
      tx((narrow ? 'Entry ' : 'New plants above ') + fmtP(S, entry), L + 4, Math.abs(ey - my) < 14 ? ey + 13 : ey - 5, { color: ink(0.7) });
      if (Math.abs(pY - p.pM) > 0.005 * p.pM) {
        var yy = K.snap(Y(pY));
        x.setLineDash([6, 4]); x.strokeStyle = acc; x.lineWidth = 1.5; x.beginPath(); x.moveTo(L, yy); x.lineTo(W - R, yy); x.stroke(); x.setLineDash([]); x.lineWidth = 1;
        tx('Your price ' + fmtP(S, pY), W - R - 2, pY > p.pM ? yy - 5 : yy + 13, { align: 'right', color: ink(0.85) });
      }
      tx('Cheapest', L, H - 10, { color: ink(0.55) });
      tx('Dearest · capacity →', W - R, H - 10, { align: 'right', color: ink(0.55) });
    }
    function hitBar(ev) {
      if (!U.lay) return null;
      var r = el.curve.getBoundingClientRect(), px = ev.clientX - r.left, best = null;
      Object.keys(U.lay).forEach(function (id) { var l = U.lay[id]; if (px >= l.px0 - 1 && px <= l.px1 + 1 && !l.b.dead) best = l.b; });
      return best;
    }
    function readout(b) {
      if (!b) { el.readout.textContent = U.sel ? '' : 'Point at a bar to read a firm. Pick a rival to aim an offer at it.'; if (U.sel) { var s = U.lay && U.lay[U.sel]; if (s) readout(s.b); } return; }
      var o = b.o, t;
      if (b.k === 'p') t = 'Yours: ' + o.name + ' · ' + (CITY[o.city] || '') + ' · ' + fmtCap(S, b.cap) + ' · cost ' + fmtP(S, b.v);
      else {
        var why = canOffer(S, o), q = !why ? quote(S, o, U.lvl, U.pay) : null;
        t = o.name + ' · ' + (CITY[o.city] || '') + ' · ' + fmtCap(S, b.cap) + ' · cost ' + fmtP(S, b.v) + ' · ' + (o.known || S.m.spies ? 'cash ' + fM(o.cash) + ' · ' : '') + (U.lastP && b.v > U.lastP.pM ? 'under water at this price' : 'covering its costs at this price') +
          ' · ' + (q ? q.band + ' to sell' : why) + (o.talent && (o.known || S.m.spies) ? ' · Able operator' : '');
      }
      el.readout.textContent = t;
    }
    var qHover = 0;
    K.on(root, 'pointermove', '.ti-curve', function (ev) {
      var b = hitBar(ev), id = b ? b.id : null;
      if (id === U.hover) return;
      U.hover = id; readout(b);
      if (!qHover) qHover = requestAnimationFrame(function () { qHover = 0; paintCurve(); });
    });
    K.on(root, 'mouseleave', '.ti-curve', function () { U.hover = null; readout(null); paintCurve(); });
    K.on(root, 'click', '.ti-curve', function (ev) {
      var b = hitBar(ev);
      if (!b || b.k !== 'r') return;
      U.sel = b.id; U.tgt = b.id; readout(b); K.say(el.readout.textContent);
      if (U.open && (MV[U.open].kind === 'offer' || MV[U.open].kind === 'target')) render(); else paintCurve();
    });

    /* the debrief chart: price, your all-in cost and the benchmark above; your share of sales below */
    function paintEnd() {
      var c = endEl.querySelector('.ti-endchart');
      if (!c || !S) return;
      var narrow = root.clientWidth < 560, Hc = narrow ? 180 : 200, f = K.fitCanvas(c, Hc), x = f.ctx, W = f.W;
      if (!(W > 0)) return;
      x.clearRect(0, 0, W, Hc);
      var H0 = S.hist, n = H0.length;
      if (!n) return;
      var L = 40, R = 12, T = 14, top = Math.round((Hc - 22) * 0.65), gap = 10, bT = top + gap, bB = Hc - 20, pw = W - L - R;
      var ys = []; H0.forEach(function (h) { ys.push(h.pM, h.cent); if (isFinite(h.unitAll)) ys.push(h.unitAll); });
      var yMax = Math.max.apply(null, ys) * 1.1, X0 = function (i) { return L + pw * (n === 1 ? 0.5 : i / (n - 1)); }, Y = function (v) { return T + (top - T) * (1 - v / yMax); };
      var sc = c.parentNode || root, ink = function (a) { return K.labColorA('--ink', a, sc); }, acc = K.ACC(), card = K.labColor('--card', sc);
      function tx(t, tx0, ty0, o) { o.px = 11; if (o.halo !== false) o.halo = card; K.cvText(x, t, tx0, ty0, o); }
      x.strokeStyle = ink(0.12); x.lineWidth = 1;
      [0, 0.5, 1].forEach(function (q) { var yy = K.snap(Y(yMax * q)); x.beginPath(); x.moveTo(L, yy); x.lineTo(W - R, yy); x.stroke(); tx(S.camp === 'oil' ? (yMax * q).toFixed(0) + '¢' : '$' + (yMax * q).toFixed(0), L - 5, yy + 3, { align: 'right', raw: true, halo: false, color: ink(0.6) }); });
      /* margin band */
      x.fillStyle = K.ACCA(0.12); x.beginPath(); var st = false;
      H0.forEach(function (h, i) { if (!isFinite(h.unitAll)) return; if (!st) { x.moveTo(X0(i), Y(h.pM)); st = true; } else x.lineTo(X0(i), Y(h.pM)); });
      for (var j = n - 1; j >= 0; j--) if (isFinite(H0[j].unitAll)) x.lineTo(X0(j), Y(H0[j].unitAll));
      if (st) { x.closePath(); x.fill(); }
      function line(get, col, lw, dash) {
        x.strokeStyle = col; x.lineWidth = lw; x.setLineDash(dash || []); x.beginPath(); var s = false;
        H0.forEach(function (h, i) { var v = get(h); if (!isFinite(v)) { s = false; return; } if (!s) { x.moveTo(X0(i), Y(v)); s = true; } else x.lineTo(X0(i), Y(v)); });
        x.stroke(); x.setLineDash([]); x.lineWidth = 1;
      }
      line(function (h) { return h.cent; }, ink(0.5), 1.5, [1, 3]);
      line(function (h) { return h.pM; }, ink(0.85), 1.5);
      line(function (h) { return h.unitAll; }, acc, 2.2);
      tx('Price', X0(0) + 2, Y(H0[0].pM) - 6, { color: ink(0.8) });
      /* share bars */
      var bw = Math.max(3, pw / n * 0.5), half = K.snap(bB - (bB - bT) * 0.5);
      H0.forEach(function (h, i) { var bh = (bB - bT) * Math.min(1, h.share); x.fillStyle = acc; x.fillRect(X0(i) - bw / 2, bB - bh, bw, bh); });
      x.strokeStyle = ink(0.35); x.setLineDash([2, 3]); x.beginPath(); x.moveTo(L, half); x.lineTo(W - R, half); x.stroke(); x.setLineDash([]);
      tx('Share 50%', W - R, half - 4, { align: 'right', color: ink(0.7) });
      H0.forEach(function (h, i) { if (narrow && i % 2) return; tx(String(h.year), X0(i), Hc - 6, { align: 'center', raw: true, halo: false, color: ink(0.6) }); });
    }
    function paintAll() { paintCurve(); paintEnd(); }
    K.repaint(paintAll, root);

    /* ---------------------------------------------------------------- actions ---------------------------------------------------------------- */
    function after(focusSel) { render(focusSel ? { focus: focusSel } : null); }
    function closeChapter() {
      if (U.cancel) { U.cancel(true); U.cancel = null; }
      var before = U.lay, oldParts = {};
      var g = great(S); if (g && g.cap > 0) vP(S, g, oldParts);
      var r = act({ f: 'close', pr: S.pr });
      if (!r.ok) return;
      U.lastParts = oldParts; U.open = null; U.sel = null; U.hover = null; U.fresh = []; U.more = false; U.sheenT = Date.now();
      if (U.sel && !rivalById(S, U.sel)) U.sel = null;
      K.say(S.lastClose.summary);
      drain();
      render({ focus: el.h });
      wkRun();
      if (S.phase === 'play' && before) {
        U.from = before; U.blend = 0;
        U.cancel = K.tween(450, function (e) { U.blend = e; paintCurve(); }, function () { U.blend = 1; U.from = null; U.cancel = null; paintCurve(); });
      }
    }
    var CONF = { replay: 'Replay this history', 'new': 'New history', 'switch': 'Switch titan' };
    function unconfirm() {
      clearTimeout(U.confT); U.confT = 0;
      var a = U.confirm; U.confirm = null;
      var t = a && el.actions && el.actions.querySelector('[data-act="' + a + '"]');
      if (t) { t.textContent = CONF[a]; t.classList.remove('is-ask'); }
    }
    K.on(root, 'click', '[data-act]', function (ev, b) {
      var a = b.getAttribute('data-act');
      if (a === 'play') { start(b.getAttribute('data-camp')); return; }
      if (a === 'resume') { resume(); return; }
      if (!S) return;
      if (a === 'replay' || a === 'new' || a === 'switch') {
        var mid = S.phase !== 'end' && (S.hist.length > 0 || S.choices.length > 0);
        if (mid && U.confirm !== a) {
          unconfirm(); U.confirm = a; renderActions();
          U.confT = setTimeout(unconfirm, 4000);
          var t = el.actions.querySelector('[data-act="' + a + '"]'); if (t) t.focus(); K.say('Press again to start over.'); return;
        }
        clearTimeout(U.confT); U.confirm = null;
        if (a === 'replay') start(S.camp, S.seed); else if (a === 'new') start(S.camp, newSeed());
        else { if (mid) { saved = { camp: S.camp }; store.set(saved); } renderChooser(true); }
        return;
      }
      if (a === 'close') { closeChapter(); return; }
      if (a === 'follow') { S.pr = 1; render(); return; }
      if (a === 'runfull') { S.pr = runFull(S) / going(S).ph; render(); return; }
      if (a === 'more') { U.more = !U.more; renderLedgers(el.ledgers, S.phase === 'play' ? clear(S, pYof(S)) : S.lastClose && S.lastClose.res); var m = el.ledgers.querySelector('.ti-more'); if (m) m.focus(); return; }
      if (a === 'spoffer') {
        var rid = b.getAttribute('data-rid'), st = U.sp[rid] || { lvl: 'fair', pay: 'stock' }, res = act({ f: 'sp', rid: rid, lvl: st.lvl, pay: st.pay });
        if (res && res.text) K.say(res.text);
        render();
        var nx = stage.querySelector('.ti-sp [data-act="spoffer"]:not([disabled])') || stage.querySelector('.ti-movewrap .ti-cap');
        if (nx && (!document.activeElement || !root.contains(document.activeElement) || document.activeElement === document.body)) K.focus(nx);
        return;
      }
      if (a === 'spdone') { act({ f: 'spdone' }); after('.ti-movewrap .ti-cap'); return; }
      if (a === 'breakunion') { if (act({ f: 'union', v: 'break' }).ok) K.say('You broke the union.'); render(); return; }
      if (a === 'recognize') { act({ f: 'union', v: 'rec' }); render(); return; }
      if (a === 'hear') { act({ f: 'hear' }); render({ focus: '.ti-final .ti-rh' }); return; }
      if (a === 'conneaut') { U.morgan.con = !U.morgan.con; renderFinal(); var cb = el.final.querySelector('[data-act="conneaut"]'); if (cb) cb.focus(); return; }
      if (a === 'writeit') { act({ f: 'sell', mult: U.morgan.mult, con: U.morgan.con }); drain(); render({ focus: '.ti-final .ti-rh' }); return; }
      if (a === 'refuse') { act({ f: 'refuse', con: U.morgan.con }); drain(); render({ focus: '.ti-final .ti-rh' }); return; }
      if (a === 'todist') { act({ f: 'todist' }); render({ focus: '.ti-final .ti-xt' }); return; }
      if (a === 'settle') { if (!U.dist.mode) return; act({ f: 'settle', mode: U.dist.mode, causes: U.dist.causes.slice() }); drain(); render(); renderDebrief(); return; }
    });
    K.on(root, 'click', '[data-cross]', function (ev, b) {
      var r = act({ f: 'x', k: b.getAttribute('data-cross') });
      if (!r || !r.ok) { if (r && r.text) K.say(r.text); return; }
      drain();
      render({ focus: '.ti-cross .ti-rh' });
    });
    K.on(root, 'click', '[data-go]', function (ev, b) {
      var id = b.getAttribute('data-go'), d = MV[id];
      if (d.kind) { U.open = id; render({ focus: '.ti-card.is-open .ti-panel [role="radio"][aria-checked="true"], .ti-card.is-open .ti-panel select, .ti-card.is-open .ti-panel .ebtn' }); return; }
      var r = act({ f: 'm', id: id, p: {} });
      if (r.text) K.say(r.text);
      render({ focus: '.ti-card[data-mv="' + id + '"] .ti-cn' });
    });
    K.on(root, 'click', '[data-commit]', function (ev, b) {
      var id = b.getAttribute('data-commit'), d = MV[id], p = {};
      if (d.kind === 'build') p.size = U.size;
      else if (d.kind === 'offer') { p.rid = U.tgt; p.lvl = U.lvl; p.pay = U.pay; }
      else if (d.kind === 'target') p.rid = U.tgt;
      else if (d.kind === 'plant') p.pid = U.pl;
      else if (d.kind === 'give') p.mode = U.give;
      var r = act({ f: 'm', id: id, p: p });
      if (r.text) K.say(r.text);
      if (r.ok) { U.open = null; if (d.kind === 'offer' || d.kind === 'target') U.sel = null; }
      render({ focus: r.ok ? '.ti-card[data-mv="' + id + '"] .ti-cn' : null });
    });
    K.on(root, 'click', '[data-cancel]', function () { var id = U.open; U.open = null; render({ focus: '[data-go="' + id + '"]' }); });
    K.on(root, 'click', '[data-stop]', function (ev, b) { act({ f: 'stop', id: b.getAttribute('data-stop') }); render(); });
    K.on(root, 'click', '[data-closep]', function (ev, b) { act({ f: 'closep', pid: b.getAttribute('data-closep') }); render({ focus: '.ti-works .lk-kicker' }); });
    K.on(root, 'click', '[data-note]', function (ev, b) { shelf.notes.open(b.getAttribute('data-note')); });
    K.on(root, 'click', '[data-mode]', function (ev, b) { U.dist.mode = b.getAttribute('data-mode'); renderFinal(); var t = el.final.querySelector('[data-mode="' + U.dist.mode + '"]'); if (t) t.focus(); });
    K.on(root, 'click', '[data-cause]', function (ev, b) {
      var c = CAUSES[+b.getAttribute('data-cause')], i = U.dist.causes.indexOf(c);
      if (i >= 0) U.dist.causes.splice(i, 1); else if (U.dist.causes.length < 3) U.dist.causes.push(c);
      renderFinal(); var t = el.final.querySelector('[data-cause="' + b.getAttribute('data-cause') + '"]'); if (t) t.focus();
    });
    /* radio pills: click and arrow keys */
    function pickSeg(g, btn) {
      var name = g.getAttribute('data-seg'), v = btn.getAttribute('data-v');
      if (/^s[lp]-/.test(name)) { var rid = name.slice(3), st = U.sp[rid] || (U.sp[rid] = { lvl: 'fair', pay: 'stock' }); if (name[1] === 'l') st.lvl = v; else st.pay = v; render(); return; }
      if (name === 'size') U.size = v; else if (name === 'lvl') U.lvl = v; else if (name === 'pay') U.pay = v; else if (name === 'give') U.give = v;
      else if (name === 'payout' || name === 'shift' || name === 'wage') { if (!act({ f: 'set', n: name, v: +v }).ok) return; }
      render();
    }
    K.on(root, 'click', '.ti-seg [role="radio"]', function (ev, b) { if (!b.disabled) pickSeg(b.parentNode, b); });
    K.on(root, 'keydown', '.ti-seg [role="radio"]', function (ev, b) {
      var k = ev.key, g = b.parentNode, list = Array.prototype.filter.call(g.querySelectorAll('[role="radio"]'), function (x) { return !x.disabled; }), i = list.indexOf(b), n = -1;
      if (k === 'ArrowRight' || k === 'ArrowDown') n = (i + 1) % list.length; else if (k === 'ArrowLeft' || k === 'ArrowUp') n = (i - 1 + list.length) % list.length;
      else if (k === 'Home') n = 0; else if (k === 'End') n = list.length - 1;
      if (n < 0 || !list[n]) return;
      ev.preventDefault();
      var fk = list[n].getAttribute('data-fk');
      pickSeg(g, list[n]);
      var t = stage.querySelector('[data-fk="' + fk + '"]'); if (t) t.focus();
    });
    K.on(root, 'change', 'select[data-tsel]', function (ev, s) { U.tgt = s.value; U.sel = s.value; var q = el.moves.querySelector('.ti-card.is-open .ti-quote'); if (q && MV[U.open].kind === 'offer') q.innerHTML = offerQuoteText(U.open); paintCurve(); readout(U.lay && U.lay[U.sel] ? U.lay[U.sel].b : null); });
    K.on(root, 'toggle', '.ti-later', function (ev, d) { if (ev.target === d) U.laterOpen = d.open; });
    K.on(root, 'change', 'select[data-psel]', function (ev, s) { U.pl = s.value; });
    K.on(root, 'input', '.ti-range', function () { onPrice(); });
    K.on(root, 'input', '.ti-mrange', function (ev, r) {
      U.morgan.mult = +r.value;
      var ask = U.morgan.mult * Math.max(0, S.lastAnnual[1]), o = el.final.querySelector('.ti-mout');
      if (o) o.textContent = fM(ask) + ' · ' + U.morgan.mult.toFixed(1) + '× your latest annual profit';
      r.setAttribute('aria-valuetext', fM(ask) + ', ' + U.morgan.mult.toFixed(1) + ' times profit');
      K.sfill(el.final);
    });
    /* Escape closes an open move panel (the glossary and the shelf handle their own) */
    K.on(root, 'keydown', '.ti-panel', function (ev) {
      if (ev.key !== 'Escape' || ev.defaultPrevented || !U.open) return;
      ev.preventDefault(); var id = U.open; U.open = null; render({ focus: '[data-go="' + id + '"]' });
    });

    renderChooser(false);
    DBG.open = function (camp, seed) { start(camp || 'oil', seed); return S; };
    DBG.state = function () { return S; };
    DBG.works = function () { return WV; };
    DBG.sim = { lessons: function () { return S ? lessons(S) : null; }, ending: function () { return S ? ending(S) : null; } };
    /* the cost sheet points at the drawing: hover a line to light its building, click to pin it */
    K.on(root, 'mouseover', '.ti-shrow[data-wk]', function (ev, r) { var ex = WV.ex; if (ex && ex.sel == null) { ex.hov = r.getAttribute('data-wk'); ex._apply(); } });
    K.on(root, 'mouseout', '.ti-shrow[data-wk]', function (ev, r) { var ex = WV.ex; if (ex && ex.hov != null && !(ev.relatedTarget && r.contains(ev.relatedTarget))) { ex.hov = null; ex._apply(); } });
    K.on(root, 'click', '.ti-shrow[data-wk]', function (ev, r) { var ex = WV.ex, id = r.getAttribute('data-wk'); if (ex) ex.select(ex.sel === id ? null : id); });
    return {
      pause: function () { if (U.cancel) { U.cancel(true); U.cancel = null; } if (S) save(); if (WV.ex) WV.ex.vw.pause(); },
      resume: function () { paintAll(); if (WV.ex) WV.ex.vw.resume(); },
      destroy: function () { clearTimeout(U.confT); if (U.cancel) { U.cancel(true); U.cancel = null; } if (S) save(); wkDrop(); }
    };
  }

  K.mount(SLUG, null, init);
})();
