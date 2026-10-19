/* Make the call (Lab No. 13, Wing II): six hard calls, from FedEx in 1973 to Netflix in 2011, in one kraft folder.
   Moved from the World in v3.1. The cases, their sources, the scoring and the saved card are the World room's, unchanged;
   only the frame is new. Registers with LAB_KIT.mount('calls'). ES5, no build step; the markup below has no entities. */
(function () {
  'use strict';
  var K = window.LAB_KIT;
  if (!K || K.v < 1) return;
  var W = window, D = document, SLUG = 'calls';
  var HTML = [
    '<div class="lab-calls">',
    '<div class="dossier" id="callFile">',
    '  <div class="df-back" aria-hidden="true"></div>',
    '  <div class="df-sheet" id="callSheet">',
    '    <div class="df-head">',
    '      <p class="df-count" id="callCount">Case 1 of 6</p>',
    '      <ol class="df-ticks" aria-label="Cases">',
    '        <li><button type="button" data-go="0" aria-label="Case 1, Intel 1985"><span>01</span></button></li>',
    '        <li><button type="button" data-go="1" aria-label="Case 2, Tylenol 1982"><span>02</span></button></li>',
    '        <li><button type="button" data-go="2" aria-label="Case 3, FedEx 1973"><span>03</span></button></li>',
    '        <li><button type="button" data-go="3" aria-label="Case 4, Apple 1997"><span>04</span></button></li>',
    '        <li><button type="button" data-go="4" aria-label="Case 5, Netflix 2011"><span>05</span></button></li>',
    '        <li><button type="button" data-go="5" aria-label="Case 6, Toys R Us 2005"><span>06</span></button></li>',
    '      </ol>',
    '    </div>',
    '    <div class="df-cases">',
    '      <article class="case is-on" id="call-1" data-did="1" aria-labelledby="call-1-k">',
    '        <div class="case-q"><span class="call-yr" aria-hidden="true">1985</span>',
    '          <p class="case-k" id="call-1-k">Intel · Santa Clara · 1985</p>',
    '          <p class="case-sit">Intel was built on memory chips. By 1985, Japanese makers were selling them for less than Intel could make them. The business that made Intel’s name was losing money.</p>',
    '          <div class="case-grid">',
    '            <div class="case-knew"><h4 class="case-l">What they knew that day</h4><ul><li>Intel’s 1103, sold from 1970, was the first big-selling DRAM.</li><li>IBM’s PC, launched in 1981, ran on Intel’s 8088 microprocessor. Microprocessors were a side business.</li><li>Andy Grove asked Gordon Moore what a new CEO would do if the board replaced them. Moore answered at once: get out of memories.</li></ul></div>',
    '            <div class="case-call" role="group" aria-labelledby="call-1-c"><h4 class="case-l" id="call-1-c">Your call</h4>',
    '              <button type="button" class="pick" data-c="0" aria-pressed="false"><span class="pick-l" aria-hidden="true">A</span><span class="pick-t">Defend memory. It is who Intel is.</span></button>',
    '              <button type="button" class="pick" data-c="1" aria-pressed="false"><span class="pick-l" aria-hidden="true">B</span><span class="pick-t">Leave memory. Bet the company on microprocessors.</span></button>',
    '            </div>',
    '          </div>',
    '        </div>',
    '        <div class="case-a">',
    '          <p class="case-k" aria-hidden="true">Intel · Santa Clara · 1985</p>',
    '          <div class="case-agrid">',
    '            <div class="case-story">',
    '              <ol class="case-opts"><li data-c="0"><span class="pick-l" aria-hidden="true">A</span><span class="pick-t">Defend memory. It is who Intel is.</span><span class="case-tags"></span></li><li data-c="1"><span class="pick-l" aria-hidden="true">B</span><span class="pick-t">Leave memory. Bet the company on microprocessors.</span><span class="case-tags"></span></li></ol>',
    '              <h4 class="case-l">What they did</h4><p class="case-p">Intel left the DRAM business in 1985. It closed plants, laid off more than 7,000 people (about a third of its workforce) and put everything behind the microprocessor. The first products built on its 386 chip shipped in the third quarter of 1986.</p>',
    '              <p class="case-lesson"><span class="case-l">The lesson</span>Ask what your replacement would do, then do it yourself.</p>',
    '            </div>',
    '            <div class="case-side">',
    '              <figure class="case-chart">',
    '                <div class="cc" data-bars=\'[["1986", -173, "−173"], ["1987", 248, "+248"]]\'><p class="cc-cap">Intel net income, $M</p><ol class="cc-alt"><li>1986: −173</li><li>1987: +248</li></ol></div>',
    '              </figure>',
    '              <h4 class="case-l">What it cost</h4><p class="case-p">A $173M loss in 1986. A year later revenue was up 51% and net income was $248M.</p>',
    '              <p class="case-src" data-src="https://www.kunc.org/npr-news/2012-04-06/intel-legends-moore-and-grove-making-it-last https://www.intel.com/content/www/us/en/history/history-1987-annual-report.html"><span class="case-l">Sources</span>Andrew S. Grove, <i>Only the Paranoid Survive</i> (1996); NPR, “Intel Legends Moore and Grove: Making It Last,” Apr 6, 2012; Intel 1986 and 1987 Annual Reports.</p>',
    '            </div>',
    '          </div>',
    '        </div>',
    '      </article>',
    '      <article class="case" id="call-2" data-did="1" aria-labelledby="call-2-k">',
    '        <div class="case-q"><span class="call-yr" aria-hidden="true">1982</span>',
    '          <p class="case-k" id="call-2-k">Johnson & Johnson · New Brunswick · Oct 1982</p>',
    '          <p class="case-sit">Starting Sept 29, 1982, seven people in the Chicago area died after taking Extra-Strength Tylenol capsules laced with cyanide. The poison was added after the bottles left the factory. Tylenol held about 35% of the US over-the-counter pain-reliever market.</p>',
    '          <div class="case-grid">',
    '            <div class="case-knew"><h4 class="case-l">What they knew that day</h4><ul><li>Every death was in Cook and DuPage counties.</li><li>Chicago had already pulled Tylenol from its shelves.</li><li>A national recall meant about 31 million bottles and about $100 million.</li></ul></div>',
    '            <div class="case-call" role="group" aria-labelledby="call-2-c"><h4 class="case-l" id="call-2-c">Your call</h4>',
    '              <button type="button" class="pick" data-c="0" aria-pressed="false"><span class="pick-l" aria-hidden="true">A</span><span class="pick-t">Recall in Chicago. That is where the tampering happened.</span></button>',
    '              <button type="button" class="pick" data-c="1" aria-pressed="false"><span class="pick-l" aria-hidden="true">B</span><span class="pick-t">Recall every bottle in the country.</span></button>',
    '            </div>',
    '          </div>',
    '        </div>',
    '        <div class="case-a">',
    '          <p class="case-k" aria-hidden="true">Johnson & Johnson · New Brunswick · Oct 1982</p>',
    '          <div class="case-agrid">',
    '            <div class="case-story">',
    '              <ol class="case-opts"><li data-c="0"><span class="pick-l" aria-hidden="true">A</span><span class="pick-t">Recall in Chicago. That is where the tampering happened.</span><span class="case-tags"></span></li><li data-c="1"><span class="pick-l" aria-hidden="true">B</span><span class="pick-t">Recall every bottle in the country.</span><span class="case-tags"></span></li></ol>',
    '              <h4 class="case-l">What they did</h4><p class="case-p">On Oct 5, 1982, J&J recalled about 31 million bottles nationwide at a cost of about $100 million. About six weeks later it relaunched Tylenol in a triple-sealed, tamper-resistant package. Federal rules requiring tamper-resistant packaging for over-the-counter drugs followed.</p>',
    '              <p class="case-lesson"><span class="case-l">The lesson</span>Trust is cheaper to keep than to rebuild.</p>',
    '            </div>',
    '            <div class="case-side">',
    '              <figure class="case-chart">',
    '                <div class="cc" data-bars=\'[["Before", 35, "35%"], ["Weeks after", 8, "8%"], ["A year later", 30, "About 30%"]]\'><p class="cc-cap">Tylenol share of US pain-reliever market</p><ol class="cc-alt"><li>Before: 35%</li><li>Weeks after: 8%</li><li>A year later: About 30%</li></ol></div>',
    '                <figcaption class="case-small">Sources vary on the recovery, from about 80% of the old share within a year to a full recovery by the end of 1983.</figcaption>',
    '              </figure>',
    '              <h4 class="case-l">What it cost</h4><p class="case-p">About $100 million and a share that fell from 35% to 8% within weeks. Within about a year Tylenol was back near its old share.</p>',
    '              <p class="case-src" data-src="https://bpb-us-e1.wpmucdn.com/wp.nyu.edu/dist/e/21986/files/2025/11/F25-Ortel-Case-Study.pdf https://en.wikipedia.org/wiki/Chicago_Tylenol_murders https://interestingengineering.com/tamper-resistant-packaging-began-in-1982-with-7-still-unsolved-murders"><span class="case-l">Sources</span>NYU, “The Tylenol Crisis” case study (2025); Wikipedia, “Chicago Tylenol murders” and “Tylenol (brand)”; Interesting Engineering, “Tamper-resistant packaging began in 1982”.</p>',
    '            </div>',
    '          </div>',
    '        </div>',
    '      </article>',
    '      <article class="case" id="call-3" data-did="0" aria-labelledby="call-3-k">',
    '        <div class="case-q"><span class="call-yr" aria-hidden="true">1973</span>',
    '          <p class="case-k" id="call-3-k">Federal Express · Memphis · 1973<span class="case-tag">The case against copying this</span></p>',
    '          <p class="case-sit">Federal Express started flying in 1973 with 14 Falcon jets serving 25 cities. A loan it needed was denied, and the company was down to $5,000. A $24,000 fuel bill was due.</p>',
    '          <div class="case-grid">',
    '            <div class="case-knew"><h4 class="case-l">What they knew that day</h4><ul><li>Cash on hand: $5,000.</li><li>Fuel bill due: $24,000.</li><li>Fred Smith had started the company with a $4 million inheritance.</li></ul></div>',
    '            <div class="case-call" role="group" aria-labelledby="call-3-c"><h4 class="case-l" id="call-3-c">Your call</h4>',
    '              <button type="button" class="pick" data-c="0" aria-pressed="false"><span class="pick-l" aria-hidden="true">A</span><span class="pick-t">Take the last $5,000 to Las Vegas.</span></button>',
    '              <button type="button" class="pick" data-c="1" aria-pressed="false"><span class="pick-l" aria-hidden="true">B</span><span class="pick-t">Ground the planes and keep asking for money.</span></button>',
    '            </div>',
    '          </div>',
    '        </div>',
    '        <div class="case-a">',
    '          <p class="case-k" aria-hidden="true">Federal Express · Memphis · 1973</p>',
    '          <div class="case-agrid">',
    '            <div class="case-story">',
    '              <ol class="case-opts"><li data-c="0"><span class="pick-l" aria-hidden="true">A</span><span class="pick-t">Take the last $5,000 to Las Vegas.</span><span class="case-tags"></span></li><li data-c="1"><span class="pick-l" aria-hidden="true">B</span><span class="pick-t">Ground the planes and keep asking for money.</span><span class="case-tags"></span></li></ol>',
    '              <h4 class="case-l">What he did</h4><p class="case-p">Smith flew to Las Vegas, played blackjack and came back with $27,000. The fuel bill was paid, and the company had one more week. The story is widely retold, and the amounts vary by source.</p>',
    '              <p class="case-lesson"><span class="case-l">The lesson</span>Survivorship makes gambles look like strategy.</p>',
    '              <p class="case-foot">You hear this story because the cards fell right. Founders who lost their last $5,000 at a blackjack table are not profiled.</p>',
    '            </div>',
    '            <div class="case-side">',
    '              <figure class="case-chart">',
    '                <div class="cc" data-bars=\'[["Stake", 5000, "$5,000"], ["Won", 27000, "$27,000"], ["Fuel bill", 24000, "$24,000"]]\'><p class="cc-cap">Dollars</p><ol class="cc-alt"><li>Stake: $5,000</li><li>Won: $27,000</li><li>Fuel bill: $24,000</li></ol></div>',
    '              </figure>',
    '              <h4 class="case-l">What it cost</h4><p class="case-p">Nothing, this time. The win bought about one week. FedEx later raised $91 million in venture capital.</p>',
    '              <p class="case-src" data-src="https://en.wikipedia.org/wiki/Frederick_W._Smith"><span class="case-l">Sources</span>Wikipedia, “Frederick W. Smith” (the anecdote is flagged there as needing a better source); Fox Business, “How Fred Smith rescued FedEx… by playing blackjack.”</p>',
    '            </div>',
    '          </div>',
    '        </div>',
    '      </article>',
    '      <article class="case" id="call-4" data-did="0" aria-labelledby="call-4-k">',
    '        <div class="case-q"><span class="call-yr" aria-hidden="true">1997</span>',
    '          <p class="case-k" id="call-4-k">Apple · Cupertino · Aug 1997</p>',
    '          <p class="case-sit">Apple lost $816 million in fiscal 1996 and was on course to lose about $1 billion in 1997. Its CEO was pushed out in July. Microsoft, its oldest rival, offered to invest.</p>',
    '          <div class="case-grid">',
    '            <div class="case-knew"><h4 class="case-l">What they knew that day</h4><ul><li>Steve Jobs had been back since Apple bought NeXT, and was running the company without the CEO title.</li><li>Apple and Microsoft were locked in a long-running patent dispute.</li><li>The offer: $150 million for non-voting shares, plus five more years of Office for the Mac.</li></ul></div>',
    '            <div class="case-call" role="group" aria-labelledby="call-4-c"><h4 class="case-l" id="call-4-c">Your call</h4>',
    '              <button type="button" class="pick" data-c="0" aria-pressed="false"><span class="pick-l" aria-hidden="true">A</span><span class="pick-t">Take Microsoft’s money.</span></button>',
    '              <button type="button" class="pick" data-c="1" aria-pressed="false"><span class="pick-l" aria-hidden="true">B</span><span class="pick-t">Refuse. Do not let the rival in.</span></button>',
    '            </div>',
    '          </div>',
    '        </div>',
    '        <div class="case-a">',
    '          <p class="case-k" aria-hidden="true">Apple · Cupertino · Aug 1997</p>',
    '          <div class="case-agrid">',
    '            <div class="case-story">',
    '              <ol class="case-opts"><li data-c="0"><span class="pick-l" aria-hidden="true">A</span><span class="pick-t">Take Microsoft’s money.</span><span class="case-tags"></span></li><li data-c="1"><span class="pick-l" aria-hidden="true">B</span><span class="pick-t">Refuse. Do not let the rival in.</span><span class="case-tags"></span></li></ol>',
    '              <h4 class="case-l">What they did</h4><p class="case-p">Jobs announced the deal at Macworld Boston on Aug 6, 1997, and the crowd booed when Bill Gates appeared on the screen. The terms were $150 million in non-voting stock, Office for Mac for at least five years, the patent dispute settled, and Internet Explorer as the Mac’s default browser.</p>',
    '              <p class="case-lesson"><span class="case-l">The lesson</span>Pride is expensive when you are losing $1 billion a year.</p>',
    '            </div>',
    '            <div class="case-side">',
    '              <figure class="case-chart">',
    '                <div class="cc" data-bars=\'[["1996", -816, "−816"], ["1997", -1000, "About −1,000"], ["1998", 309, "+309"]]\'><p class="cc-cap">Apple net income, fiscal years, $M</p><ol class="cc-alt"><li>1996: −816</li><li>1997: About −1,000</li><li>1998: +309</li></ol></div>',
    '              </figure>',
    '              <h4 class="case-l">What it cost</h4><p class="case-p">Some pride, and the default browser. In fiscal 1998 Apple earned $309 million, its first profitable year since 1995.</p>',
    '              <p class="case-src" data-src="https://www.mentalfloss.com/article/84258/date-1997-microsoft-invested-apple https://money.cnn.com/1998/10/14/technology/apple/ https://tidbits.com/1997/10/16/apple-posts-161-million-fourth-quarter-loss/"><span class="case-l">Sources</span>TidBITS, Aug 1997; Engadget, 2014; Mental Floss, “On This Date in 1997, Microsoft Invested in Apple”; CNN Money, Oct 15, 1997 and Oct 14, 1998.</p>',
    '            </div>',
    '          </div>',
    '        </div>',
    '      </article>',
    '      <article class="case" id="call-5" data-did="0" aria-labelledby="call-5-k">',
    '        <div class="case-q"><span class="call-yr" aria-hidden="true">2011</span>',
    '          <p class="case-k" id="call-5-k">Netflix · Los Gatos · July 2011</p>',
    '          <p class="case-sit">Netflix wanted its future in streaming, while DVDs by mail still paid most of the bills. Its basic plan, unlimited streaming plus one DVD at a time, cost $9.99, and it had 24.6 million US subscribers. The stock had just hit $304.</p>',
    '          <div class="case-grid">',
    '            <div class="case-knew"><h4 class="case-l">What they knew that day</h4><ul><li>Streaming was growing, and every DVD carried a postage cost.</li><li>Splitting the plans would raise the price of having both from $9.99 to $15.98, a 60% increase.</li><li>Customers had never been asked to pay that much more at once.</li></ul></div>',
    '            <div class="case-call" role="group" aria-labelledby="call-5-c"><h4 class="case-l" id="call-5-c">Your call</h4>',
    '              <button type="button" class="pick" data-c="0" aria-pressed="false"><span class="pick-l" aria-hidden="true">A</span><span class="pick-t">Split the plans now and charge for each.</span></button>',
    '              <button type="button" class="pick" data-c="1" aria-pressed="false"><span class="pick-l" aria-hidden="true">B</span><span class="pick-t">Keep the $9.99 bundle and move people over slowly.</span></button>',
    '            </div>',
    '          </div>',
    '        </div>',
    '        <div class="case-a">',
    '          <p class="case-k" aria-hidden="true">Netflix · Los Gatos · July 2011</p>',
    '          <div class="case-agrid">',
    '            <div class="case-story">',
    '              <ol class="case-opts"><li data-c="0"><span class="pick-l" aria-hidden="true">A</span><span class="pick-t">Split the plans now and charge for each.</span><span class="case-tags"></span></li><li data-c="1"><span class="pick-l" aria-hidden="true">B</span><span class="pick-t">Keep the $9.99 bundle and move people over slowly.</span><span class="case-tags"></span></li></ol>',
    '              <h4 class="case-l">What they did</h4><p class="case-p">On July 12, 2011, Netflix split the plans and raised the combined price by up to 60%. In September it announced Qwikster, a separate brand for DVDs. On Oct 10 it dropped Qwikster but kept the new prices.</p>',
    '              <p class="case-lesson"><span class="case-l">The lesson</span>Move customers at the speed they will accept, even when you are right.</p>',
    '            </div>',
    '            <div class="case-side">',
    '              <figure class="case-chart case-chart--2">',
    '                <div class="cc" data-bars=\'[["Q2 2011", 24.6, "24.6"], ["Q3 2011", 23.8, "23.8"]]\'><p class="cc-cap">US subscribers (millions)</p><ol class="cc-alt"><li>Q2 2011: 24.6</li><li>Q3 2011: 23.8</li></ol></div>',
    '                <div class="cc" data-bars=\'[["July high", 304, "$304"], ["Oct 25", 77, "About $77"]]\'><p class="cc-cap">Stock</p><ol class="cc-alt"><li>July high: $304</li><li>Oct 25: About $77</li></ol></div>',
    '              </figure>',
    '              <h4 class="case-l">What it cost</h4><p class="case-p">About 800,000 US subscribers in one quarter, and about three quarters of its market value.</p>',
    '              <p class="case-src" data-src="https://www.csmonitor.com/Technology/Latest-News-Wires/2011/1025/NFLX-Netflix-stock-tanks-as-800-000-subscribers-flee https://www.upbeacon.com/article/2011/10/quick-end-for-qwikster https://cases.som.yale.edu/netflix-and-qwikster"><span class="case-l">Sources</span>AP via Washington Times, Oct 25, 2011; CS Monitor, “Netflix stock tanks as 800,000 subscribers flee,” Oct 25, 2011; Time Techland; The Beacon, “Quick end for Qwikster,” Oct 2011; Yale SOM case, “Netflix and Qwikster”.</p>',
    '            </div>',
    '          </div>',
    '        </div>',
    '      </article>',
    '      <article class="case" id="call-6" data-did="0" aria-labelledby="call-6-k">',
    '        <div class="case-q"><span class="call-yr" aria-hidden="true">2005</span>',
    '          <p class="case-k" id="call-6-k">Toys R Us · Wayne, New Jersey · Mar 2005</p>',
    '          <p class="case-sit">Toys R Us was the best-known toy store in America, but it no longer sold the most toys. Bain Capital, KKR and Vornado offered $6.6 billion to take it private. Most of the price would be borrowed and left on the company.</p>',
    '          <div class="case-grid">',
    '            <div class="case-knew"><h4 class="case-l">What they knew that day</h4><ul><li>Walmart had passed Toys R Us as the largest US toy seller in 1998.</li><li>The buyers would put in about $1.3 billion of equity and borrow the rest.</li><li>Vornado, one of the three buyers, is a real estate trust.</li></ul></div>',
    '            <div class="case-call" role="group" aria-labelledby="call-6-c"><h4 class="case-l" id="call-6-c">Your call</h4>',
    '              <button type="button" class="pick" data-c="0" aria-pressed="false"><span class="pick-l" aria-hidden="true">A</span><span class="pick-t">Sell to the buyout group.</span></button>',
    '              <button type="button" class="pick" data-c="1" aria-pressed="false"><span class="pick-l" aria-hidden="true">B</span><span class="pick-t">Stay public and fight Walmart without the debt.</span></button>',
    '            </div>',
    '          </div>',
    '        </div>',
    '        <div class="case-a">',
    '          <p class="case-k" aria-hidden="true">Toys R Us · Wayne, New Jersey · Mar 2005</p>',
    '          <div class="case-agrid">',
    '            <div class="case-story">',
    '              <ol class="case-opts"><li data-c="0"><span class="pick-l" aria-hidden="true">A</span><span class="pick-t">Sell to the buyout group.</span><span class="case-tags"></span></li><li data-c="1"><span class="pick-l" aria-hidden="true">B</span><span class="pick-t">Stay public and fight Walmart without the debt.</span><span class="case-tags"></span></li></ol>',
    '              <h4 class="case-l">What they did</h4><p class="case-p">The board accepted. The buyout was announced on Mar 17, 2005. Twelve years later the company carried about $5 billion of debt and paid about $400 million a year in interest. It filed for Chapter 11 on Sept 18, 2017, and closed its US stores in 2018.</p>',
    '              <p class="case-lesson"><span class="case-l">The lesson</span>Debt takes away the time a struggling business needs to change.</p>',
    '            </div>',
    '            <div class="case-side">',
    '              <figure class="case-chart">',
    '                <div class="cc" data-bars=\'[["2005 purchase", 6.6, "6.6", 1.3, "Equity 1.3"], ["2017 debt", 5, "About 5"], ["Yearly interest", 0.4, "0.4"]]\'><p class="cc-cap">$ billions</p><ol class="cc-alt"><li>2005 purchase: 6.6 (Equity 1.3)</li><li>2017 debt: About 5</li><li>Yearly interest: 0.4</li></ol></div>',
    '              </figure>',
    '              <h4 class="case-l">What it cost</h4><p class="case-p">The owners’ equity was wiped out, and the US stores closed. Along the way, the owners collected more than $470 million in fees and interest.</p>',
    '              <p class="case-src" data-src="https://en.wikipedia.org/wiki/Toys_%22R%22_Us https://www.bloomberg.com/news/articles/2017-09-19/bain-kkr-vornado-suffer-wipeout-in-toys-r-us-bankruptcy https://www.bikebiz.com/tru-seeks-sale-wal-mart-to-blame-say-analysts/"><span class="case-l">Sources</span>Wikipedia, “Toys “R” Us”; Bloomberg, “Bain, KKR, Vornado Suffer Wipeout in Toys ’R’ Us Bankruptcy,” Sept 19, 2017; Fortune, Sept 16, 2017; Reuters via The Peninsula, “How $5.2bn of debt caught up with Toys ’R’ Us,” Sept 2017; BikeBiz on Walmart passing Toys R Us in 1998.</p>',
    '            </div>',
    '          </div>',
    '        </div>',
    '      </article>',
    '      <section class="case case--end" id="callEnd" aria-labelledby="callTally">',
    '        <p class="df-tally" id="callTally">You matched <b id="callN">0</b> of 6.</p>',
    '        <ol class="df-marks" id="callMarks">',
    '          <li data-i="0"><span class="dm-dot" aria-hidden="true"></span><span class="dm-t">Intel 1985</span></li>',
    '          <li data-i="1"><span class="dm-dot" aria-hidden="true"></span><span class="dm-t">Tylenol 1982</span></li>',
    '          <li data-i="2"><span class="dm-dot" aria-hidden="true"></span><span class="dm-t">FedEx 1973</span></li>',
    '          <li data-i="3"><span class="dm-dot" aria-hidden="true"></span><span class="dm-t">Apple 1997</span></li>',
    '          <li data-i="4"><span class="dm-dot" aria-hidden="true"></span><span class="dm-t">Netflix 2011</span></li>',
    '          <li data-i="5"><span class="dm-dot" aria-hidden="true"></span><span class="dm-t">Toys R Us 2005</span></li>',
    '        </ol>',
    '        <p class="df-foot">A match on FedEx counts, and proves nothing.</p>',
    '        <div class="df-act">',
    '          <button type="button" class="ebtn" id="callSave">Save the result<span class="arr arr--down" aria-hidden="true">↓</span></button>',
    '          <button type="button" class="ebtn2" id="callAgain">Start again</button>',
    '        </div>',
    '      </section>',
    '    </div>',
    '    <div class="df-nav">',
    '      <button type="button" class="ebtn2" data-step="-1"><span class="arr arr--back" aria-hidden="true">←</span>Previous case</button>',
    '      <button type="button" class="ebtn2" data-step="1">Next case<span class="arr" aria-hidden="true">→</span></button>',
    '    </div>',
    '  </div>',
    '  <div class="df-lid" id="callLid">',
    '    <p class="df-tab">Case files · 6 decisions</p>',
    '    <ol class="df-index">',
    '      <li><button type="button" data-open="0"><span class="n">01</span><span class="t">Intel</span><span class="m">Santa Clara · 1985</span></button></li>',
    '      <li><button type="button" data-open="1"><span class="n">02</span><span class="t">Johnson & Johnson</span><span class="m">New Brunswick · Oct 1982</span></button></li>',
    '      <li><button type="button" data-open="2"><span class="n">03</span><span class="t">Federal Express</span><span class="m">Memphis · 1973</span></button></li>',
    '      <li><button type="button" data-open="3"><span class="n">04</span><span class="t">Apple</span><span class="m">Cupertino · Aug 1997</span></button></li>',
    '      <li><button type="button" data-open="4"><span class="n">05</span><span class="t">Netflix</span><span class="m">Los Gatos · July 2011</span></button></li>',
    '      <li><button type="button" data-open="5"><span class="n">06</span><span class="t">Toys R Us</span><span class="m">Wayne, New Jersey · Mar 2005</span></button></li>',
    '    </ol>',
    '    <button type="button" class="ebtn" id="callOpen">Open the file<span class="arr" aria-hidden="true">→</span></button>',
    '  </div>',
    '</div>',
    '<p class="df-src">Sources are listed under each case. Dates and figures come from company filings and contemporary reporting.</p>',
    '</div>'
  ].join('\n');

  function init(root) {
    root.innerHTML = HTML;
    function $(id) { return D.getElementById(id); }
    function each(list, fn) { Array.prototype.forEach.call(list || [], fn); }
    function reduced() { return K.reducedMotion(); }
    function saved(btn) { if (W.PS && PS.confirm) PS.confirm(btn, 'Saved'); }

    /* ---------- a dossier, six cases, one tally ---------- */
    var file = $('callFile');
    file.classList.add('js');
    var lid = $('callLid'), sheet = $('callSheet'), faces = [].slice.call(file.querySelectorAll('.df-cases > .case')), N = 6;
    var ticks = [].slice.call(file.querySelectorAll('.df-ticks button')), count = $('callCount'), marks = [].slice.call(file.querySelectorAll('#callMarks li'));
    var navs = file.querySelectorAll('.df-nav [data-step]'), prevB = navs[0], nextB = navs[1], picks = [], cur = 0, openT = 0;
    sheet.inert = true;
    function did(k) { return +faces[k].getAttribute('data-did'); }
    function done() { for (var k = 0; k < N; k++) if (picks[k] == null) return false; return true; }
    function open1st() { for (var k = 0; k < N; k++) if (picks[k] == null) return k; return N; }
    function show(i, focus) {
      i = Math.max(0, Math.min(N, i));
      if (i === N && !done()) i = open1st();
      faces.forEach(function (c, k) { var on = k === i; c.classList.toggle('is-on', on); c.inert = !on; if (!on) c.classList.remove('is-fresh'); });
      cur = i;
      ticks.forEach(function (t, k) { if (k === i) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current'); t.classList.toggle('is-done', picks[k] != null); });
      count.textContent = i < N ? 'Case ' + (i + 1) + ' of 6' : 'Case files · 6 decisions';
      prevB.disabled = i === 0;
      nextB.disabled = i === N;
      if (i === N) tally(true);
      if (focus) { faces[i].tabIndex = -1; try { faces[i].focus({ preventScroll: true }); } catch (e) {} }
      var r = sheet.getBoundingClientRect();
      if (focus && (r.top < 0 || r.top > innerHeight * .6)) sheet.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    }
    function chart(cc) {
      if (cc.classList.contains('is-drawn')) return;
      var bars = JSON.parse(cc.getAttribute('data-bars')), n = bars.length, VW = Math.max(150, Math.round(cc.clientWidth) || 320), VH = 172, top = 22, bot = 22, plot = VH - top - bot;
      var mx = 0, mn = 0;
      bars.forEach(function (b) { mx = Math.max(mx, b[1]); mn = Math.min(mn, b[1]); });
      var span = (mx - mn) || 1, y0 = top + plot * mx / span, g = VW / n, bw = Math.min(56, g * .46), s = '';
      bars.forEach(function (b, k) {
        var cx = g * (k + .5), h = Math.max(1, Math.abs(b[1]) / span * plot), neg = b[1] < 0, y = neg ? y0 : y0 - h;
        s += '<rect class="bar' + (neg ? ' neg' : '') + '" style="--k:' + k + '" x="' + (cx - bw / 2).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '"/>';
        if (b.length > 3) {
          var hi = b[3] / span * plot;
          s += '<rect class="bar in" style="--k:' + k + '" x="' + (cx - bw / 2 + 4).toFixed(1) + '" y="' + (y0 - hi).toFixed(1) + '" width="' + (bw - 8).toFixed(1) + '" height="' + hi.toFixed(1) + '"/>';
          s += '<text class="vi" style="--k:' + k + '" x="' + (cx + bw / 2 + 7).toFixed(1) + '" y="' + (y0 - hi / 2 + 4).toFixed(1) + '" font-size="11.5">' + b[4] + '</text>';
        }
        s += '<text style="--k:' + k + '" x="' + cx.toFixed(1) + '" y="' + (neg ? y + h + 16 : y - 8).toFixed(1) + '" text-anchor="middle" font-size="14">' + b[2] + '</text>';
        s += '<text class="k" style="--k:' + k + '" x="' + cx.toFixed(1) + '" y="' + (neg ? y0 - 8 : y0 + 16).toFixed(1) + '" text-anchor="middle" font-size="11">' + b[0] + '</text>';
      });
      s += '<line class="base" pathLength="1" x1="0" x2="' + VW + '" y1="' + y0.toFixed(1) + '" y2="' + y0.toFixed(1) + '"/>';
      cc.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 ' + VW + ' ' + VH + '" aria-hidden="true" focusable="false">' + s + '</svg>');
      cc.classList.add('is-drawn');
    }
    function reveal(k) {
      var art = faces[k], c = picks[k], d = did(k), he = /What he did/.test(art.querySelector('.case-story').textContent);
      each(art.querySelectorAll('.case-opts li'), function (li) {
        var j = +li.getAttribute('data-c'), tg = li.querySelector('.case-tags'), h = '';
        if (j === c) h += '<span class="t-you' + (c === d ? ' is-match' : '') + '">Your call</span>';
        if (j === d) h += '<span class="t-did">' + (he ? 'What he did' : 'What they did') + '</span>';
        tg.innerHTML = h; li.classList.toggle('is-did', j === d);
      });
      art.classList.add('is-done', 'is-fresh');
      each(art.querySelectorAll('.cc'), chart);
      ticks[k].classList.add('is-done');
      var a = art.querySelector('.case-a'); a.tabIndex = -1;
      try { a.focus({ preventScroll: true }); } catch (e) {}
      if (done()) tally(false);
    }
    function choose(k, c, btn) {
      if (picks[k] != null) return;
      picks[k] = c;
      each(faces[k].querySelectorAll('.pick'), function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); b.disabled = true; });
      setTimeout(function () { reveal(k); }, reduced() ? 0 : 420);
    }
    function tally(fresh) {
      var n = 0;
      marks.forEach(function (m, k) { var hit = picks[k] === did(k); if (hit) n++; m.classList.toggle('is-match', hit); m.style.setProperty('--k', k); });
      $('callN').textContent = n;
      var end = faces[N];
      if (fresh && !reduced()) { end.classList.remove('is-fresh'); void end.offsetWidth; end.classList.add('is-fresh'); }
      return n;
    }
    faces.slice(0, N).forEach(function (art, k) {
      each(art.querySelectorAll('.pick'), function (b) { b.addEventListener('click', function () { choose(k, +b.getAttribute('data-c'), b); }); });
    });
    ticks.forEach(function (t, k) { t.addEventListener('click', function () { show(k, true); }); });
    prevB.addEventListener('click', function () { show(cur - 1, true); });
    nextB.addEventListener('click', function () { show(cur + 1, true); });
    function openFile(at) {
      clearTimeout(openT);
      file.classList.add('is-open');
      lid.inert = true; sheet.inert = false;
      show(at, false);
      var r = file.getBoundingClientRect();
      if (r.top < 0 || r.top > innerHeight * .5) file.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      openT = setTimeout(function () { var f = faces[at]; f.tabIndex = -1; try { f.focus({ preventScroll: true }); } catch (e) {} }, reduced() ? 0 : 380);
    }
    each(lid.querySelectorAll('[data-open]'), function (b) { b.addEventListener('click', function () { openFile(+b.getAttribute('data-open')); }); });
    $('callOpen').addEventListener('click', function () { openFile(Math.min(open1st(), N - 1)); });
    $('callSave').addEventListener('click', function () {
      var n = tally(false);
      K.savePNG('make-the-call.png', 'Make the call · pedrumshokouhi.com/experiments#exp-13', 'I matched ' + n + ' of 6.', 'Intel 1985 · Tylenol 1982 · FedEx 1973 · Apple 1997 · Netflix 2011 · Toys R Us 2005',
        marks.map(function (m) { return m.classList.contains('is-match'); }));
      saved($('callSave'));
    });
    $('callAgain').addEventListener('click', function () {
      picks = [];
      faces.slice(0, N).forEach(function (art) {
        art.classList.remove('is-done', 'is-fresh');
        each(art.querySelectorAll('.pick'), function (b) { b.setAttribute('aria-pressed', 'false'); b.disabled = false; });
        each(art.querySelectorAll('.case-tags'), function (t) { t.innerHTML = ''; });
        each(art.querySelectorAll('.case-opts li'), function (li) { li.classList.remove('is-did'); });
        each(art.querySelectorAll('.cc'), function (cc) { var s = cc.querySelector('svg'); if (s) s.remove(); cc.classList.remove('is-drawn'); });
      });
      file.classList.remove('is-open');
      lid.inert = false; sheet.inert = true;
      show(0, false);
      try { $('callOpen').focus({ preventScroll: true }); } catch (e) {}
    });
    show(0, false);
    K.hook(SLUG, { picks: function () { return picks.slice(); }, open: openFile, choose: function (k, c) { var b = faces[k].querySelectorAll('.pick')[c]; if (b) b.click(); }, tally: function () { return tally(false); } });
    return {};
  }
  K.mount(SLUG, null, init);
})();
