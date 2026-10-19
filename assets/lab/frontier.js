/* Frontier: the scaling bet. A deep sim of the P.S. Lab, loaded on demand by the lab kit (window.LAB_KIT).
   You run Aldermoor, a fictional AI lab, for eight half-years. The engine is a set of pure functions of one state
   object S; every change goes through apply(S, action), so a seed plus the action log replays the same four years.
   The lab, its rivals and every number in play are fiction; the case file keeps the sourced history separate. */
(function () {
  'use strict';
  var K = window.LAB_KIT;
  if (!K || K.v < 1) return;
  var SLUG = 'frontier', F = K.fmt;

  /* ======================= sources (every one opened before handoff) ======================= */
  function s(t, u) { return { t: t, u: u }; }
  var SRC = {
    kaplan: s('Kaplan et al., Scaling Laws for Neural Language Models (2020)', 'https://arxiv.org/abs/2001.08361'),
    hoff: s('Hoffmann et al., Training Compute-Optimal Large Language Models (2022)', 'https://arxiv.org/abs/2203.15556'),
    epochfit: s('Besiroglu et al. (Epoch AI), Chinchilla Scaling: A replication attempt (2024)', 'https://arxiv.org/abs/2404.10102'),
    ho: s('Ho et al., Algorithmic progress in language models (2024)', 'https://arxiv.org/abs/2403.05812'),
    egrow: s('Epoch AI, Training compute of frontier AI models grows by 4 to 5× per year', 'https://epoch.ai/blog/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year'),
    cottier: s('Cottier et al. (Epoch AI), The rising costs of training frontier AI models', 'https://arxiv.org/abs/2405.21015'),
    eprice: s('Epoch AI, LLM inference prices have fallen rapidly but unequally across tasks (March 2025)', 'https://epoch.ai/data-insights/llm-inference-price-trends'),
    eoai: s('Epoch AI, Most of OpenAI’s 2024 compute went to experiments', 'https://epoch.ai/data-insights/openai-compute-spend'),
    gpt4: s('OpenAI, GPT-4 Technical Report (2023)', 'https://arxiv.org/abs/2303.08774'),
    herd: s('Meta, The Llama 3 Herd of Models (2024)', 'https://arxiv.org/abs/2407.21783'),
    llama3: s('Meta, Introducing Meta Llama 3 (April 18, 2024)', 'https://ai.meta.com/blog/meta-llama-3/'),
    h100: s('NVIDIA, H100 Tensor Core GPU', 'https://www.nvidia.com/en-us/data-center/h100/'),
    o1: s('OpenAI, Learning to reason with LLMs (September 12, 2024)', 'https://openai.com/index/learning-to-reason-with-llms/'),
    metr: s('METR, Measuring AI Ability to Complete Long Tasks (March 19, 2025)', 'https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/'),
    distill: s('Hinton, Vinyals and Dean, Distilling the Knowledge in a Neural Network (2015)', 'https://arxiv.org/abs/1503.02531'),
    bitter: s('Wikipedia, The Bitter Lesson', 'https://en.wikipedia.org/wiki/The_Bitter_Lesson'),
    jevons: s('Wikipedia, Jevons paradox', 'https://en.wikipedia.org/wiki/Jevons_paradox'),
    oai15: s('CNBC, OpenAI began a decade ago as a nonprofit lab (December 11, 2025)', 'https://www.cnbc.com/2025/12/11/openai-began-decade-ago-as-nonprofit-lab-musk-and-altman-now-rivals.html'),
    oailp: s('OpenAI, OpenAI LP (March 11, 2019)', 'https://openai.com/index/openai-lp/'),
    tc19: s('TechCrunch, OpenAI shifts from nonprofit to capped-profit (March 11, 2019)', 'https://techcrunch.com/2019/03/11/openai-shifts-from-nonprofit-to-capped-profit-to-attract-capital/'),
    ms19: s('CNBC, Microsoft invests $1 billion in OpenAI (July 22, 2019)', 'https://www.cnbc.com/2019/07/22/microsoft-invests-1-billion-in-elon-musks-openai.html'),
    ms23: s('CNBC, Microsoft announces new multibillion-dollar investment in OpenAI (January 23, 2023)', 'https://www.cnbc.com/2023/01/23/microsoft-announces-multibillion-dollar-investment-in-chatgpt-maker-openai.html'),
    chatgpt: s('Wikipedia, ChatGPT', 'https://en.wikipedia.org/wiki/ChatGPT'),
    oust: s('CNBC, OpenAI brings Sam Altman back as CEO (November 22, 2023)', 'https://www.cnbc.com/2023/11/22/openai-brings-sam-altman-back-as-ceo-days-after-ouster.html'),
    ousttl: s('TechCrunch, A timeline of Sam Altman’s firing from OpenAI and the fallout', 'https://techcrunch.com/2024/01/05/a-timeline-of-sam-altmans-firing-from-openai-and-the-fallout/'),
    evolve: s('OpenAI, Evolving OpenAI’s structure (May 5, 2025)', 'https://openai.com/index/evolving-our-structure/'),
    msrecap: s('Microsoft, The next chapter of the Microsoft and OpenAI partnership (October 28, 2025)', 'https://blogs.microsoft.com/blog/2025/10/28/the-next-chapter-of-the-microsoft-openai-partnership/'),
    tcrecap: s('TechCrunch, OpenAI completes its for-profit recapitalization (October 28, 2025)', 'https://techcrunch.com/2025/10/28/openai-completes-its-for-profit-recapitalization/'),
    oai300: s('Crunchbase News, SoftBank and OpenAI’s historic startup financing (March 2025)', 'https://news.crunchbase.com/venture/softbank-openai-historic-startup-financing-ai-unicorn/'),
    oai852: s('CNBC, OpenAI closes funding round at an $852 billion valuation (March 31, 2026)', 'https://www.cnbc.com/2026/03/31/openai-funding-round-ipo.html'),
    stargate: s('DCD, OpenAI announces the Stargate Project (January 2025)', 'https://www.datacenterdynamics.com/en/news/openai-announces-the-stargate-project-500bn-over-four-years-on-ai-infrastructure/'),
    nvloi: s('OpenAI, OpenAI and NVIDIA strategic partnership (September 22, 2025)', 'https://openai.com/index/openai-nvidia-systems-partnership/'),
    amd: s('OpenAI, AMD and OpenAI strategic partnership (October 6, 2025)', 'https://openai.com/index/openai-amd-strategic-partnership/'),
    amdir: s('AMD, AMD and OpenAI announce strategic partnership to deploy 6 gigawatts of AMD GPUs (October 6, 2025)', 'https://ir.amd.com/news-events/press-releases/detail/1260/amd-and-openai-announce-strategic-partnership-to-deploy-6-gigawatts-of-amd-gpus'),
    wau: s('TechCrunch, ChatGPT has hit 800M weekly active users (October 6, 2025)', 'https://techcrunch.com/2025/10/06/sam-altman-says-chatgpt-has-hit-800m-weekly-active-users/'),
    prep: s('OpenAI, Preparedness Framework, Version 2 (April 15, 2025)', 'https://cdn.openai.com/pdf/18a02b5d-6b67-4cec-ab64-68cdfbddebcd/preparedness-framework-v2.pdf'),
    prepb: s('OpenAI, Preparedness Framework (Beta) (December 2023)', 'https://cdn.openai.com/openai-preparedness-framework-beta.pdf'),
    oss: s('OpenAI, gpt-oss-120b and gpt-oss-20b model card (August 2025)', 'https://arxiv.org/abs/2508.10925'),
    nyt: s('Wikipedia, The New York Times v. Microsoft and OpenAI', 'https://en.wikipedia.org/wiki/The_New_York_Times_v._Microsoft_and_OpenAI'),
    brit: s('Britannica, Anthropic', 'https://www.britannica.com/money/Anthropic-PBC'),
    ltbt: s('Anthropic, The Long-Term Benefit Trust (September 19, 2023)', 'https://www.anthropic.com/news/the-long-term-benefit-trust'),
    rsp: s('Anthropic, Responsible Scaling Policy (September 2023)', 'https://www.anthropic.com/news/anthropics-responsible-scaling-policy'),
    rsp3: s('Anthropic, Responsible Scaling Policy Version 3.0 (February 24, 2026)', 'https://www.anthropic.com/news/responsible-scaling-policy-v3'),
    asl3: s('Anthropic, Activating AI Safety Level 3 protections (May 2025)', 'https://www.anthropic.com/news/activating-asl3-protections'),
    asl3c: s('CNBC, Anthropic adds Claude 4 security measures (May 23, 2025)', 'https://www.cnbc.com/2025/05/23/anthropic-claude-4-weapons.html'),
    amzn: s('Anthropic, Powering the next generation of AI development with AWS (November 2024)', 'https://www.anthropic.com/news/anthropic-amazon-trainium'),
    serF: s('Anthropic, Series F at $183B post-money (September 2, 2025)', 'https://www.anthropic.com/news/anthropic-raises-series-f-at-usd183b-post-money-valuation'),
    serG: s('Anthropic, Series G at $380B post-money (February 12, 2026)', 'https://www.anthropic.com/news/anthropic-raises-30-billion-series-g-funding-380-billion-post-money-valuation'),
    serH: s('TechCrunch, Anthropic raises $65 billion (May 28, 2026)', 'https://techcrunch.com/2026/05/28/anthropic-raises-65-billion-nears-1t-valuation-ahead-of-ipo/'),
    tpu: s('Anthropic, Expanding our use of Google Cloud TPUs (October 23, 2025)', 'https://www.anthropic.com/news/expanding-our-use-of-google-cloud-tpus-and-services'),
    msnv: s('Official Microsoft Blog: NVIDIA and Anthropic strategic partnerships (November 18, 2025)', 'https://blogs.microsoft.com/blog/2025/11/18/microsoft-nvidia-and-anthropic-announce-strategic-partnerships/'),
    bartz: s('Copyright Alliance, What to know about the Bartz v. Anthropic settlement', 'https://copyrightalliance.org/participating-bartz-v-anthropic-settlement/'),
    bartzF: s('JURIST, Judge approves record $1.5 billion settlement involving Anthropic (July 2026)', 'https://www.jurist.org/news/2026/07/judge-approves-record-1-5-billion-settlement-involving-anthropic/'),
    llama2: s('Meta, Meta and Microsoft introduce the next generation of Llama (July 18, 2023)', 'https://about.fb.com/news/2023/07/llama-2/'),
    r1: s('DeepSeek, DeepSeek-R1 release (January 20, 2025)', 'https://api-docs.deepseek.com/news/news250120'),
    nvda: s('Forbes, Nvidia sheds nearly $600 billion as DeepSeek shakes AI darling (January 27, 2025)', 'https://www.forbes.com/sites/dereksaul/2025/01/27/biggest-market-loss-in-history-nvidia-stock-sheds-nearly-600-billion-as-deepseek-shakes-ai-darling/'),
    dswiki: s('Wikipedia, DeepSeek', 'https://en.wikipedia.org/wiki/DeepSeek'),
    v3: s('DeepSeek-AI, DeepSeek-V3 Technical Report (December 2024)', 'https://arxiv.org/abs/2412.19437'),
    gdm: s('Wikipedia, Google DeepMind', 'https://en.wikipedia.org/wiki/Google_DeepMind'),
    gemini: s('Google, Introducing Gemini (December 6, 2023)', 'https://blog.google/technology/ai/google-gemini-ai/'),
    fsf: s('Google DeepMind, Updating the Frontier Safety Framework', 'https://deepmind.google/blog/updating-the-frontier-safety-framework/'),
    metaai: s('Wikipedia, Meta AI', 'https://en.wikipedia.org/wiki/Meta_AI'),
    faf: s('Meta, Our approach to frontier AI (February 3, 2025)', 'https://about.fb.com/news/2025/02/meta-approach-frontier-ai/'),
    seoul: s('Computer Weekly, AI Seoul Summit: 16 AI firms make voluntary safety commitments (May 2024)', 'https://www.computerweekly.com/news/366585914/AI-Seoul-Summit-16-AI-firms-make-voluntary-safety-commitments'),
    rand: s('RAND, Securing AI Model Weights (May 30, 2024)', 'https://www.rand.org/news/press/2024/05/30.html'),
    euact: s('AI Act high-level summary', 'https://artificialintelligenceact.eu/high-level-summary/'),
    sb53: s('Future of Privacy Forum, California’s SB 53 explained', 'https://fpf.org/blog/californias-sb-53-the-first-frontier-ai-law-explained/'),
    sb53b: s('Brookings, What is California’s AI safety law?', 'https://www.brookings.edu/articles/what-is-californias-ai-safety-law/'),
    eo: s('NIST, Executive Order on Safe, Secure, and Trustworthy AI', 'https://www.nist.gov/artificial-intelligence/executive-order-safe-secure-and-trustworthy-artificial-intelligence'),
    ukaisi: s('GOV.UK, Tackling AI security risks to unleash growth and deliver Plan for Change (February 14, 2025)', 'https://www.gov.uk/government/news/tackling-ai-security-risks-to-unleash-growth-and-deliver-plan-for-change'),
    caisi: s('FedScoop, AI Safety Institute renamed Center for AI Standards and Innovation (June 2025)', 'https://fedscoop.com/trump-administration-rebrands-ai-safety-institute-aisi-caisi/'),
    racing: s('Armstrong, Bostrom and Shulman, Racing to the precipice (FHI technical report, 2013)', 'https://nickbostrom.com/papers/racing-to-the-precipice.pdf'),
    racingj: s('Springer, Racing to the precipice, AI and Society 31 (2016)', 'https://link.springer.com/article/10.1007/s00146-015-0590-y'),
    meta100: s('CNBC, Sam Altman says Meta offered OpenAI staff $100 million bonuses (June 18, 2025)', 'https://www.cnbc.com/2025/06/18/sam-altman-says-meta-tried-to-poach-openai-staff-with-100-million-bonuses-mark-zuckerberg.html'),
    beyer: s('Fortune, Former OpenAI researcher pours cold water on the $100 million Meta bonus (June 26, 2025)', 'https://fortune.com/2025/06/26/former-openai-researcher-lucas-beyer-pours-cold-water-on-100-million-meta-signing-bonus/')
  };
  function S_(keys) { return keys.split(' ').map(function (k) { return SRC[k]; }); }

  /* ======================= field notes: 22, in canonical order ======================= */
  var NOTES = [
    { id: 'scaling', term: 'Scaling laws', src: S_('kaplan gpt4'), hint: 'you open the Train tab or read a run forecast',
      note: 'Loss falls as a smooth power law in model size, data and compute across more than seven orders of magnitude (Kaplan et al., 2020). That smoothness turns a lab’s roadmap into a spending plan: the GPT-4 report says parts of its performance were predicted from models trained with no more than 1/1,000th of its compute. The catch is the exponent: each step costs ten times the last.' },
    { id: 'chinchilla', term: 'Compute-optimal training', src: S_('hoff epochfit'), hint: 'you choose a shape for a training run',
      note: 'Hoffmann et al. (2022) found that for a fixed compute budget, parameters and training tokens should grow in equal proportion; their 70B-parameter Chinchilla, trained on about 1.4 trillion tokens, beat much larger models. Epoch AI’s 2024 refit of the same law lands near the rule of thumb everyone quotes: about 20 tokens per parameter.' },
    { id: 'overtrain', term: 'Overtraining for inference', src: S_('llama3'), hint: 'you start a lean or very lean run',
      note: 'Compute-optimal is optimal for training, not for serving. Meta noted the Chinchilla-optimal data for its 8B model was about 200B tokens, then trained it on up to 15 trillion and watched it keep improving. A smaller model costs more to train to a given quality and less to serve for the rest of its life; in this lab, serving cost scales with the square root of 20 divided by tokens per parameter.' },
    { id: 'flops', term: 'The FLOP arithmetic', src: S_('herd h100'), hint: 'you start your first training run',
      note: 'Training compute is about 6 × parameters × tokens; generating one token costs about 2 × active parameters. An H100 SXM peaks at 989 trillion dense BF16 FLOP per second, and large runs achieve a fraction: Meta reported 38 to 43% utilization across its Llama 3.1 405B training configurations, up to 16,384 H100s, with 3.8 × 10²⁵ FLOP. Serving does worse, because generating tokens is limited by memory bandwidth, not arithmetic.' },
    { id: 'algo', term: 'Effective compute and algorithmic progress', src: S_('ho egrow'), hint: 'you finish your first half',
      note: 'Hardware is half the story. Ho et al. (2024) estimated that the compute needed to reach a given language-model performance halved about every 8 months (95% CI 5 to 14 months). Combine that with frontier training compute growing 4 to 5× a year (Epoch AI) and you get the pace your rivals move at here.' },
    { id: 'research', term: 'Most compute is research', src: S_('eoai'), hint: 'you set research below 20% or above 50%, or reach the second half',
      note: 'Epoch AI estimated, from reported investor documents, that OpenAI spent about $5B on R&D compute in 2024, roughly $4.5B of it on research, experiments and unreleased models rather than final training runs, against about $1.8B on inference. The final run is the tip; the experiments that chose it are the iceberg.' },
    { id: 'ttc', term: 'Test-time compute', src: S_('o1 metr'), hint: 'your research reaches reasoning',
      note: 'In September 2024 OpenAI reported that o1’s performance improved smoothly with more reinforcement-learning training and with more time spent thinking at inference. That made inference a second scaling axis, and a margin problem: a model that thinks longer serves more tokens per answer.' },
    { id: 'margin', term: 'Inference gross margin', src: S_('eprice h100'), hint: 'you read your first half report',
      note: 'Your cost to serve a million tokens is roughly the hourly cost of your accelerators divided by the tokens they produce in that hour, which improves with fewer active parameters, better batching and cheaper chips. Your price is set by the market for your capability tier. Gross margin is the gap, and it moves every half.' },
    { id: 'pricefall', term: 'The price of a fixed capability collapses', src: S_('eprice'), hint: 'open weights or a price war hit the market, or you fall 6 points behind',
      note: 'Epoch AI found the price of reaching a fixed level of LLM performance fell between 9× and 900× per year depending on the task, and 40× per year for GPT-4-level performance on PhD-level science questions. One generation behind is a different business.' },
    { id: 'takepay', term: 'Take-or-pay and the depreciation clock', src: S_('stargate nvloi tpu'), hint: 'you sign a reserved contract or build a campus',
      note: 'A reserved contract is cheaper per hour because you pay whether or not you use it. An owned campus is cheaper still once it exists: capital up front, a construction delay, and hardware that ages as each chip generation arrives. The frontier labs now make this decision in gigawatts: Stargate’s announced $500B over four years, OpenAI’s letter of intent with Nvidia and definitive agreement with AMD, Anthropic’s deal for up to one million Google TPUs.' },
    { id: 'ifthen', term: 'If-then safety commitments', src: S_('rsp prep fsf seoul'), hint: 'you choose a safety posture',
      note: 'Anthropic’s Responsible Scaling Policy (September 2023) tied AI Safety Levels to capability thresholds; OpenAI’s Preparedness Framework (December 2023, revised April 2025) and Google DeepMind’s Frontier Safety Framework (May 2024) use similar thresholds, and 16 companies signed the Frontier AI Safety Commitments in Seoul in May 2024. A commitment is tested only when it binds, which is when it costs a launch.' },
    { id: 'evals', term: 'Dangerous-capability evals', src: S_('asl3 asl3c'), hint: 'an eval result lands on your desk',
      note: 'Evals test whether a model gives meaningful uplift on tasks such as cyberattacks or acquiring chemical and biological weapons. In May 2025 Anthropic activated ASL-3 protections for Claude Opus 4 as a precaution, saying it could not rule out that the model needed them. A real eval program sometimes returns the answer you did not want the week before a launch you already announced.' },
    { id: 'weights', term: 'Securing model weights', src: S_('rand'), hint: 'you upgrade security or catch a leak attempt',
      note: 'RAND’s 2024 study mapped 38 attack vectors and five security levels, SL1 to SL5, from amateur attackers to top nation-state operations. Stolen weights carry the capability without the safeguards, so security is part of safety, paid for in the currency researchers hate most: friction.' },
    { id: 'open', term: 'Open versus closed weights', src: S_('llama2 r1 nvda oss'), hint: 'open weights hit the market, or you open a model',
      note: 'Open weights (Meta’s Llama 2 in July 2023, DeepSeek-R1 under an MIT license in January 2025, OpenAI’s gpt-oss in August 2025) spread capability, build ecosystems and commoditize rivals’ products. They cannot be recalled. On January 27, 2025, as DeepSeek-R1 drew attention, Nvidia lost about $589B of market value, a record one-day loss.' },
    { id: 'gov', term: 'Governance as pre-commitment', src: S_('oailp tcrecap ltbt oust'), hint: 'you choose a charter',
      note: 'OpenAI began as a nonprofit (2015), created a capped-profit arm in 2019 with first-round returns capped at 100×, and in October 2025 recapitalized its business as OpenAI Group PBC, controlled by the OpenAI Foundation, which holds about 26%. Anthropic is a Delaware public benefit corporation whose Long-Term Benefit Trust elects a growing share of its board. Structures trade fundraising flexibility for mission lock, and they get tested under stress, as when OpenAI’s board removed and then reinstated its CEO within days in November 2023.' },
    { id: 'racing', term: 'Racing dynamics', src: S_('racing racingj'), hint: 'a rival passes you, or you delay a launch',
      note: 'Armstrong, Bostrom and Shulman modeled teams racing to build powerful AI and found that more teams, more enmity, and even more information about each other’s capabilities can raise the danger, because each team is tempted to skimp on safety to finish first. Every launch you delay while a rival ships is a small experiment in that model.' },
    { id: 'regthreshold', term: 'Regulation by compute threshold', src: S_('euact sb53'), hint: 'a state bill arrives, or a run crosses 10²⁶ FLOP',
      note: 'Regulators use training compute as a proxy for capability. The EU AI Act presumes systemic risk above 10²⁵ FLOP, with general-purpose model obligations from August 2, 2025. California’s SB 53, signed September 29, 2025, applies to frontier models above 10²⁶ FLOP: transparency reports, critical-incident reports within 15 days and whistleblower protections for every such developer, plus a published safety framework for those above $500M in revenue.' },
    { id: 'runrate', term: 'Valuation on run-rate', src: S_('serF serG'), hint: 'you open your first round',
      note: 'Private AI labs have been priced on annualized revenue and growth. Anthropic’s Series F valued it at $183B when its run-rate was over $5B (September 2025), and its Series G at $380B on a $14B run-rate (February 2026), roughly 27 to 37 times. At those multiples a half of fast growth is worth more than a year of profit.' },
    { id: 'failures', term: 'Hardware fails at scale', src: S_('herd'), hint: 'a training run stalls',
      note: 'Meta recorded 419 unexpected interruptions in a 54-day snapshot of Llama 3 405B pretraining, and about 78% were confirmed or suspected hardware issues. A frontier run is an operations problem: checkpoints, spare capacity, and the discipline not to jump thirtyfold in one step.' },
    { id: 'jevons', term: 'Jevons paradox', src: S_('jevons'), hint: 'demand spikes, or your cost per million tokens halves',
      note: 'In The Coal Question (1865), William Stanley Jevons argued that using coal more efficiently would raise total coal consumption, not lower it. In this sim, API demand is elastic: cut your price and the tokens you serve grow by more than the price fell, so cheaper tokens tend to raise the compute bill rather than shrink it. That is the pattern Jevons described, and here it is a model assumption, not a measured law.' },
    { id: 'talent', term: 'Talent density', src: S_('meta100 beyer'), hint: 'a rival tries to hire your team',
      note: 'In June 2025 Sam Altman said Meta had offered some OpenAI staff signing bonuses as high as $100 million; a researcher who joined Meta publicly disputed the figure. Either way, frontier research concentrates in few people, and a lab’s retention tools are money, mission and momentum, only one of which is on the balance sheet.' },
    { id: 'copyright', term: 'Training data and copyright', src: S_('bartz bartzF nyt'), hint: 'a copyright suit lands',
      note: 'Anthropic agreed in 2025 to a $1.5B class settlement with authors after a judge held that training on lawfully bought books was fair use but keeping pirated copies was not; the court granted preliminary approval in September 2025 and final approval in July 2026, reported as the largest copyright settlement to date. The New York Times’ 2023 suit against OpenAI and Microsoft over training data is still being litigated. Where data came from is now a line item, not a footnote.' }
  ];
  var NOTE_BY = {};
  NOTES.forEach(function (n) { NOTE_BY[n.id] = n; });

  /* ======================= glossary: explained in place, never in a popover ======================= */
  var DEFS = {
    flop: { t: 'FLOP', d: 'One floating-point operation. Training compute is counted in total FLOP, so 4 × 10²⁶ FLOP is four hundred trillion trillion of them.', note: 'flops' },
    token: { t: 'Token', d: 'A chunk of text, roughly three quarters of a word. Models read and write tokens, and APIs bill per million.' },
    param: { t: 'Parameter', d: 'A learned number inside the model. Frontier models have hundreds of billions to trillions of them.' },
    active: { t: 'Active parameters', d: 'The parameters used for each token. In a mixture-of-experts model only a fraction are active, and that fraction sets the serving cost.', note: 'margin' },
    moe: { t: 'Mixture of experts', d: 'An architecture that routes each token through a few specialist sub-networks instead of the whole model.' },
    gpueq: { t: 'GPU-equivalent', d: 'Capacity measured in H100-class accelerators. This machine counts them in thousands.' },
    mfu: { t: 'Utilization (MFU)', d: 'The share of peak arithmetic a system achieves. 38 to 43% is good for a large training run; serving achieves much less.', note: 'flops' },
    effc: { t: 'Effective compute', d: 'Physical compute multiplied by your algorithmic efficiency: what the scaling law sees.', note: 'algo' },
    loss: { t: 'Loss', d: 'How surprised the model is by the next token. Lower is better, and it falls as a power law with compute.', note: 'scaling' },
    tpp: { t: 'Tokens per parameter', d: 'Training data divided by model size. About 20 is compute-optimal; more gives a smaller model that is cheaper to serve.', note: 'chinchilla' },
    runrate: { t: 'Run-rate', d: 'This period’s revenue, annualized. Here, one half’s revenue times two.', note: 'runrate' },
    gm: { t: 'Gross margin', d: 'Revenue minus the direct cost of serving it, as a share of revenue.', note: 'margin' },
    tp: { t: 'Take-or-pay', d: 'A contract you pay for whether or not you use it.', note: 'takepay' },
    capex: { t: 'Capex', d: 'Money spent now on assets that last, like a data center.', note: 'takepay' },
    openw: { t: 'Open weights', d: 'Publishing the model’s parameters so anyone can run and modify it. It cannot be taken back.', note: 'open' },
    eval: { t: 'Eval', d: 'A structured test of what a model can do, including dangerous capabilities.', note: 'evals' },
    redteam: { t: 'Red team', d: 'People paid to break the model before anyone else does.' },
    ready: { t: 'Readiness', d: 'A game term: your evals, mitigations and response capacity, from 0 to 100. Safety compute and safety staff raise it; every big launch makes the old evals stale, and a bigger step raises the bar.' },
    risk: { t: 'Risk level', d: 'A game term: the capability tier (Level 2, 3 and 4 begin at FI 60, 72 and 84) that sets the readiness and weight-security bar.', note: 'ifthen' },
    sl: { t: 'Security level', d: 'How hard your weights are to steal, from SL1 (amateurs) to SL5 (top nation-state operations), after RAND.', note: 'weights' },
    pbc: { t: 'Public benefit corporation', d: 'A company whose directors must balance shareholders’ interests with a stated public benefit.', note: 'gov' },
    capped: { t: 'Capped profit', d: 'Investor returns limited to a multiple, with anything above the cap going to a nonprofit.', note: 'gov' },
    post: { t: 'Post-money valuation', d: 'The company’s price right after new money comes in: the pre-money price plus the new money.', note: 'runrate' },
    dilution: { t: 'Dilution', d: 'The share of the company existing holders give up when new shares are sold.' },
    spendx: { t: 'Cost multiple', d: 'A game term: last half’s total costs divided by its revenue. Growth leads here discount a round above 2.5× and will not lead one above 6×.', note: 'runrate' },
    credits: { t: 'Compute credits', d: 'Capacity paid for with equity instead of cash.' },
    fi: { t: 'Frontier Index', d: 'A teaching scale, not a benchmark: 50 plus 50 times the log of how far reducible loss (the part above the irreducible floor) has fallen from a 10²⁵ FLOP model. Each tenfold of effective compute adds about 8.9.', note: 'scaling' }
  };
  function T(k, label) { return K.term(k, label); }

  /* ======================= take it with you ======================= */
  var TAKE = [
    'Every tenfold of effective compute buys about the same step. The frontier is a multiplication problem, and the bill compounds with it.',
    'Effective compute is hardware times algorithms. Algorithms have halved the compute needed for a given result about every eight months, so the recipe is worth paying for: one estimate found most of OpenAI’s 2024 R&D compute went to research and experiments, not the final run.',
    'Model size is an inference decision. A smaller model trained on more data costs more to train and less to serve for the rest of its life.',
    'The price of a fixed capability collapses, 9× to 900× a year by one estimate. Margin lives at the frontier, or in trust, distribution and cost per token.',
    'Compute contracts are the real balance sheet. Take-or-pay commitments and depreciation clocks turn one slow half into a solvency problem.',
    'A safety commitment is worth what it costs you when it binds. Measure safety counterfactually: the incident that did not happen is the product.',
    'Governance is a pre-commitment device. Nonprofit control, benefit-corporation duties and independent trusts trade flexibility for mission lock, and they are tested once, under pressure.',
    'Open weights are irreversible. They build ecosystems and commoditize rivals, and they cannot be recalled.'
  ];

  /* ======================= the case file: reported fact, model assumption, fiction ======================= */
  var ASOF = 'September 30, 2026', NOSRC = 'This file cites no source on this topic.';
  function cf(org, part, text, keys, asOf) {
    return { html: '<span class="fr-cf">' + org + ' <span aria-hidden="true">·</span> ' + part + '</span>' + text, src: keys ? S_(keys) : null, asOf: asOf || null };
  }
  var CASE = {
    lede: 'What is real, what is a model assumption, and what is invented. Organizations appear in alphabetical order, each under the same five headings, with sourced public facts only.',
    asOf: ASOF,
    facts: [
      cf('Anthropic', 'Founding and structure', 'Founded in 2021 by former OpenAI employees including Dario and Daniela Amodei. A Delaware public benefit corporation; in September 2023 it announced a Long-Term Benefit Trust of five initial trustees, set to elect a majority of the board within four years.', 'brit ltbt'),
      cf('Anthropic', 'Funding and compute', 'Amazon invested an additional $4B in November 2024, $8B in total. Series F, September 2025: $13B at $183B post-money, with run-rate revenue reported as rising from about $1B at the start of 2025 to over $5B by August. October 2025: plans to use up to one million Google TPUs. November 2025: a $30B Azure compute commitment, with Nvidia investing up to $10B and Microsoft up to $5B. Series G, February 2026: $30B at $380B post-money on a $14B run-rate. Series H, May 2026: $65B at $965B post-money on a $47B run-rate, as reported by TechCrunch.', 'amzn serF tpu msnv serG serH', ASOF),
      cf('Anthropic', 'Models and releases', 'Claude Opus 4 was released in May 2025, alongside the activation of ASL-3 protections described below.', 'asl3'),
      cf('Anthropic', 'Safety framework', 'Responsible Scaling Policy with AI Safety Levels, September 2023. ASL-3 protections activated for Claude Opus 4 in May 2025, described by the company as a precaution. Version 3.0, February 24, 2026, replaces some earlier unilateral commitments with what the company calls more realistic ones that are still achievable, moves the higher safeguards into an industry-wide recommendations map it says may be impossible to implement without collective action, and adds a Frontier Safety Roadmap and periodic Risk Reports with external review.', 'rsp asl3 asl3c rsp3'),
      cf('Anthropic', 'Disputes and legal matters', 'Bartz v. Anthropic: in June 2025 Judge William Alsup ruled that training on lawfully acquired books was fair use, but that downloading and keeping pirated copies in a central library was not. A $1.5B class settlement with authors followed; preliminary approval September 25, 2025, final approval July 20, 2026, reported as the largest copyright settlement to date.', 'bartzF bartz'),
      cf('DeepSeek', 'Founding and structure', 'Founded in July 2023 by Liang Wenfeng; owned and funded by the Chinese hedge fund High-Flyer.', 'dswiki'),
      cf('DeepSeek', 'Funding and compute', 'The DeepSeek-V3 technical report (December 2024) states that full training required 2.788 million H800 GPU hours.', 'v3'),
      cf('DeepSeek', 'Models and releases', 'DeepSeek-R1 was released on January 20, 2025 with open weights under the MIT License. On January 27, 2025, as the model drew wide attention, Nvidia lost about $589B of market value, a record one-day loss.', 'r1 nvda'),
      cf('DeepSeek', 'Safety framework', NOSRC),
      cf('DeepSeek', 'Disputes and legal matters', 'Australia’s Department of Home Affairs directed government entities to prevent the use or installation of DeepSeek products on their systems.', 'dswiki'),
      cf('Google DeepMind', 'Founding and structure', 'DeepMind was founded in November 2010, acquired by Google in January 2014, and merged with Google Brain in April 2023 to form Google DeepMind.', 'gdm'),
      cf('Google DeepMind', 'Funding and compute', 'Google reported that Gemini 1.0 was trained on its in-house Tensor Processing Units, versions 4 and 5e.', 'gemini'),
      cf('Google DeepMind', 'Models and releases', 'Gemini was introduced on December 6, 2023.', 'gemini'),
      cf('Google DeepMind', 'Safety framework', 'Frontier Safety Framework, introduced in May 2024 and built around Critical Capability Levels; it has been updated since.', 'fsf'),
      cf('Google DeepMind', 'Disputes and legal matters', 'In July 2017 the UK Information Commissioner’s Office found that the Royal Free London NHS Foundation Trust did not comply with data protection law when it shared about 1.6 million patient records with DeepMind for its Streams app; the finding was against the Trust, not DeepMind.', 'gdm'),
      cf('Meta', 'Founding and structure', 'Meta’s AI research began as Facebook AI Research (FAIR) in 2013; in 2025 Meta reorganized its AI work under Meta Superintelligence Labs.', 'metaai'),
      cf('Meta', 'Funding and compute', 'Meta reported training Llama 3.1 405B with 3.8 × 10²⁵ FLOP on 15.6 trillion tokens on up to 16,384 H100 GPUs at 38 to 43% utilization across its training configurations, and recorded 419 unexpected interruptions in a 54-day snapshot, about 78% of them attributed to hardware.', 'herd'),
      cf('Meta', 'Models and releases', 'Llama 2 was released in July 2023 with weights free for research and commercial use. For Llama 3 (April 2024), Meta noted the compute-optimal data for its 8B model was about 200B tokens, and that the model kept improving up to 15 trillion.', 'llama2 llama3'),
      cf('Meta', 'Safety framework', 'Frontier AI Framework, February 2025, focused on cybersecurity and chemical and biological risks, with risk thresholds and mitigations.', 'faf'),
      cf('Meta', 'Disputes and legal matters', 'In a class action filed in July 2023, authors including Richard Kadrey, Sarah Silverman and Ta-Nehisi Coates alleged Meta trained its models on their books without permission. In 2025 Judge Vince Chhabria ruled for Meta, stating that the ruling did not establish that such training is lawful.', 'nyt'),
      cf('OpenAI', 'Founding and structure', 'Launched as a nonprofit on December 11, 2015. Created OpenAI LP in March 2019, with first-round investor returns capped at 100×. In May 2025 it announced the nonprofit would keep control and the for-profit LLC would become a public benefit corporation; on October 28, 2025 it completed a recapitalization into OpenAI Group PBC, controlled by the OpenAI Foundation, which holds about 26%, with Microsoft holding about 27%.', 'oai15 oailp tc19 evolve msrecap tcrecap'),
      cf('OpenAI', 'Funding and compute', 'Microsoft invested $1B in July 2019 and announced a multiyear, multibillion-dollar investment in January 2023. The Stargate Project was announced in January 2025 at $500B over four years. A $40B round at $300B post-money followed in March 2025, then a letter of intent with Nvidia (at least 10 GW, with Nvidia intending to invest up to $100B progressively; September 2025) and a definitive agreement with AMD (6 GW, with a warrant for up to 160 million AMD shares; October 2025). A round of $122B in committed capital closed at an $852B valuation in March 2026. Epoch AI estimated, from reported investor documents, that about $4.5B of roughly $5B of 2024 R&D compute went to research, experiments and unreleased models.', 'ms19 ms23 stargate oai300 nvloi amd amdir oai852 eoai', ASOF),
      cf('OpenAI', 'Models and releases', 'ChatGPT was released on November 30, 2022; 800 million weekly users were announced in October 2025. o1 (September 2024) was reported to improve with more reinforcement-learning training and more thinking time at inference. gpt-oss-120b and gpt-oss-20b were released with open weights under Apache 2.0 in August 2025.', 'chatgpt wau o1 oss'),
      cf('OpenAI', 'Safety framework', 'Preparedness Framework, in beta from December 2023; version 2 in April 2025.', 'prepb prep'),
      cf('OpenAI', 'Disputes and legal matters', 'On November 17, 2023 the board removed the chief executive, saying he had not been consistently candid with it; he returned under an agreement announced November 22 with a new initial board. On December 27, 2023 The New York Times sued OpenAI and Microsoft for copyright infringement over training data; in 2025 the court denied most of the motions to dismiss.', 'oust ousttl nyt'),
      cf('Industry and policy', 'Commitments', 'Sixteen companies signed the Frontier AI Safety Commitments at the AI Seoul Summit on May 21, 2024.', 'seoul'),
      cf('Industry and policy', 'Security', 'RAND’s Securing AI Model Weights (May 2024) mapped 38 attack vectors and five security levels, SL1 to SL5.', 'rand'),
      cf('Industry and policy', 'Law', 'The EU AI Act entered into force on August 1, 2024; general-purpose model obligations apply from August 2, 2025, with systemic risk presumed above 10²⁵ FLOP of training compute. California’s SB 53, signed September 29, 2025, applies to developers training frontier models above 10²⁶ FLOP: transparency reports before deployment, critical safety incident reports within 15 days, and whistleblower protections. Developers with more than $500M in revenue must also publish an annual frontier AI framework.', 'euact sb53 sb53b'),
      cf('Industry and policy', 'Government', 'US Executive Order 14110 was issued on October 30, 2023 and rescinded on January 20, 2025. The UK AI Safety Institute became the AI Security Institute in February 2025; the US AI Safety Institute became the Center for AI Standards and Innovation in June 2025.', 'eo ukaisi caisi'),
      cf('Industry and policy', 'Talent', 'In June 2025 OpenAI’s chief executive said Meta had offered some OpenAI staff signing bonuses as high as $100 million; a researcher who joined Meta publicly disputed the figure.', 'meta100 beyer'),
      cf('Research', 'Scaling', 'Kaplan et al. (January 2020): loss falls as a power law in model size, data and compute over more than seven orders of magnitude. Hoffmann et al. (March 2022): parameters and tokens should scale equally; Chinchilla, 70B parameters on about 1.4 trillion tokens, outperformed larger models. Epoch AI’s 2024 refit gives about 20 tokens per parameter and the loss law this machine runs on. The GPT-4 report (March 2023) predicted aspects of performance from models trained with no more than 1/1,000th of the compute.', 'kaplan hoff epochfit gpt4'),
      cf('Research', 'Trends', 'Ho et al. (March 2024): the compute needed for a given performance halved about every 8 months (95% CI 5 to 14). Epoch AI: frontier training compute grew 4 to 5× a year; the amortized cost of the largest runs grew 2.4× a year since 2016; the price of a fixed level of performance fell 9× to 900× a year depending on the task. METR (March 2025): the length of tasks models complete with 50% reliability has doubled about every 7 months.', 'ho egrow cottier eprice metr'),
      cf('Research', 'Foundations', 'NVIDIA’s H100 SXM peaks at 989 TFLOPS dense BF16. Hinton, Vinyals and Dean described distillation in 2015; Rich Sutton published The Bitter Lesson on March 13, 2019; Jevons published The Coal Question in 1865; Armstrong, Bostrom and Shulman published Racing to the precipice as a 2013 report and in AI and Society in 2016.', 'h100 distill bitter jevons racing racingj')
    ],
    assumptions: [
      'The Frontier Index (FI) is a teaching scale: FI = 50 + 50 · log10(0.0946 ÷ reducible loss), using Epoch AI’s refit of the Chinchilla loss law at your effective compute (physical FLOP × your algorithmic multiplier). Each tenfold adds about 8.9. It is not a benchmark, and no real model is placed on it.',
      'One thousand H100-equivalents for half a year deliver 6.24 × 10²⁴ FLOP at 40% utilization. Training compute is 6 × parameters × tokens; each generated token costs 2 × active parameters.',
      'At the industry’s pace your recipe gets 1.68× better each half (compute halving every 8 months). Your own pace depends on research share, researchers and morale; research also brings sparse experts, reasoning, distillation, kernels and AI-assisted research at fixed thresholds.',
      'Capacity costs $14.0M (spot) or $9.5M (reserved) per thousand per half, about $3.20 and $2.17 per GPU-hour; a campus costs $38M per thousand plus $2.6M per half to run and comes online two halves later; new capacity gets 12% cheaper each half.',
      'Serving assumes 9% effective utilization and 2 FLOP per active parameter per token, with 12% of parameters active (7% after sparse experts). Thinking mode multiplies tokens per answer by 2.2 on the API and in enterprise, 1.5 in consumer.',
      'Risk levels at FI 60, 72 and 84, their readiness bars (40, 60, 80), the extra readiness a big step demands (+1 for every FI point a launch lands beyond 5 above the model in service), incident probabilities, and the security levels (named after RAND’s SL1 to SL5) are fictional mechanics.',
      'The best ending, the frontier with receipts, requires a published if-then policy and no breaches, because only published thresholds can be shown to have been kept. Principles or silence can still finish at the frontier, with an asterisk.',
      'Growth rounds are discounted when last half’s costs ran above 2.5× its revenue and when you raised the half before; no lead prices one above 6×, and leads stop at 35% dilution a year. These are teaching mechanics, not a description of any real investor.',
      'Industry revenue pools, price sensitivities, rival trajectories, fair value at 22× run-rate (within the roughly 20× to 37× implied by the reported Anthropic rounds, Series F to H), and every event are plausible assumptions tuned to teach, not forecasts. Nothing here is investment advice.',
      'The same world and the same choices reproduce the same four years; a different choice never changes what the world draws.'
    ],
    fiction: [
      'Aldermoor, Obelisk, Vesper, Sable, Skyloft Cloud, the Keelstone Fund, Fallowfield Growth, Anvil Silicon, every character (Ines Kowal, Dayo Oyelaran, Hanna Brandt, Marcus Oduya, Margaret Ashdown) and every line of dialogue, the Frontier Index, the risk levels, and every event, date and outcome in play are fiction.',
      'Real labs are not placed on the Frontier Index or ranked against one another. Nothing here says what any real lab should have done or will do.',
      'Some governance events (the board weekend, the open letter, a public resignation) are loosely patterned on public episodes at several labs; they are simplified mechanics for a fictional lab, and the real record is in the case file.'
    ],
    sources: Object.keys(SRC).map(function (k) { return SRC[k]; })
  };

  /* ======================= the engine: constants (all model assumptions, listed in the case file) ======================= */
  var FPK = 6.24e24, LREF = 0.0945657, ALG = 1.68, HW = 0.88, SPOT0 = 14, RES0 = 9.5, CAP0 = 38, OPEX = 2.6, CREDIT = 10.5,
    USERVE = 0.09, PAPI = 10, RPMC = 2.5, RPME = 8, TAIL = 0.35, HEAD = 0.0006, PEAK = 989e12, HALF = 15.768e6,
    JUMP = 1, JFREE = 5, DILCAP = .35, SXD = 2.5, SXR = 6, BACK = .85;
  var BETA = { api: .2, con: .11, ent: .15 }, KADJ = { api: .6, con: .35, ent: .25 }, LINES = ['api', 'con', 'ent'];
  var LV = { base: [0, .03, .07, .12, .18], req: [0, 0, 40, 60, 80], sl: [0, 1, 2, 3, 4], sev: [0, 0, .08, .25, .45] };
  var SLUP = [0, .02, .05, .15, .40, 1.0], SLCOST = [0, 0, 0, .25, .8, 2.0], THEFT = [0, 4, 2, 1, .3, .08];
  var FTM = { tight: .8, std: 1, gen: 1.45 }, ENTT = { lean: .8, std: 1, fd: 1.3 }, ENTC = { lean: .03, std: .10, fd: .30 };
  var DOMAIN = ['cyber', 'cyber', 'cyber', 'bio and chem', 'autonomy'];
  var RIV = [
    { id: 'obelisk', nm: 'Obelisk', fi: 56, g: 3.1, tr: 66, pr: 1, br: .8, en: 1.5, j: 3 },
    { id: 'vesper', nm: 'Vesper', fi: 58, g: 3.3, tr: 56, pr: 1, br: 1.6, en: .9, j: 2 },
    { id: 'sable', nm: 'Sable', fi: 50, g: 3.8, tr: 44, pr: .3, br: .5, en: .5, j: 4 }
  ];
  var WHO = { RESEARCH: 'Ines Kowal, chief scientist', SAFETY: 'Dayo Oyelaran, head of alignment', CFO: 'Hanna Brandt, chief financial officer',
    PRODUCT: 'Marcus Oduya, head of product', BOARD: 'Margaret Ashdown, board chair', INVESTOR: 'Your lead investors', PRESS: 'The press',
    REGULATOR: 'A state legislature', RIVAL: 'The market' };
  var SHAPES = [[8, 'Big and hungry'], [20, 'Compute-optimal'], [100, 'Lean'], [300, 'Very lean']];
  var UNL = [
    ['sparse', 5, 'Sparse experts work. Runs started from now use 7% active parameters instead of 12%, so they are cheaper to serve.'],
    ['reason', 11, 'Reasoning works. Thinking mode is on the Ship tab: +5 on the Frontier Index, and more tokens for every answer.'],
    ['distill', 18, 'Distillation works. Serving now gets 1.4× more tokens out of every GPU.'],
    ['kernels', 26, 'Custom kernels work. Serving efficiency is up another 1.3×.'],
    ['aird', 36, 'AI-assisted research works. The switch is on the Ship tab; it speeds research and counts as a Level 4 capability under any policy.']
  ];

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lg(v) { return Math.log(v) / Math.LN10; }
  function FI(C, r) {
    var N = Math.sqrt(C / (6 * r)), D = r * N;
    return 50 + 50 * lg(LREF / (482.01 / Math.pow(N, .3478) + 2085.43 / Math.pow(D, .3658)));
  }
  function lvOf(fi) { return fi < 60 ? 1 : fi < 72 ? 2 : fi < 84 ? 3 : 4; }
  function hl(t) { return 'Y' + (Math.floor(t / 2) + 1) + '·H' + (t % 2 + 1); }
  function pool(L, t) { return L === 'api' ? 1.2 * Math.pow(1.45, t) : L === 'con' ? .9 * Math.pow(1.35, t) : .6 * Math.pow(1.6, t); }
  function on(S, k) { return S.fx[k] != null && S.fx[k] >= S.t; }
  function flagship(S) { for (var i = S.models.length - 1; i >= 0; i--) if (S.models[i].st === 'live') return S.models[i]; return null; }
  function youFI(S) { var f = flagship(S); return f ? f.fi + (S.think ? 5 : 0) : 0; }
  function rivMax(S) { var m = 0; S.riv.forEach(function (r) { if (r.fi > m) m = r.fi; }); return m; }
  function topFI(S) { return Math.max(youFI(S), rivMax(S)); }
  function rankOf(S) { var y = youFI(S), n = 1; S.riv.forEach(function (r) { if (r.fi > y) n++; }); return n; }
  function reqOf(S, lv) { var q = LV.req[lv] || 0; if (S.amended && lv >= 3) q -= 10; return q; }
  /* a bigger step needs more readiness: evals built for the model in service do not cover one far beyond it */
  function jumpOf(S, fi) { var base = youFI(S) || S.models[0].fi; return lvOf(fi) >= 2 ? Math.round(JUMP * Math.max(0, fi - base - JFREE)) : 0; }
  function modelBy(S, id) { for (var i = 0; i < S.models.length; i++) if (S.models[i].id === id) return S.models[i]; return null; }
  function credOn(S, t) { return S.credits.k > 0 && S.credits.start <= t && t <= S.credits.end; }
  function ftm(S) { return S.fx.freeGen === S.t ? FTM.gen : FTM[S.free]; }
  function lockOf(S, k) { var l = S.lk[k]; return l && l.until >= S.t ? l : null; }
  function feed(S, sp, tx, note) { if (S.feed) S.feed.push({ t: S.t, sp: sp, tx: tx, note: note || null }); }
  function noteQ(S, id, where) {
    if (!NOTE_BY[id] || S.met[id] != null) return;
    S.met[id] = S.t;
    S.nq.push({ id: id, where: hl(S.t) + ', ' + where });
    feed(S, 'FIELD NOTE', NOTE_BY[id].term, id);
  }
  function rcard(S) { var r = K.rng(S.rs.card), u = r(); S.rs.card = r.state(); return u; }
  function Bn(v) { return F.B(v, Math.abs(v) < 10 ? 2 : Math.abs(v) < 100 ? 1 : 0); }
  function fi1(v) { return (Math.round(v * 10) / 10).toFixed(1); }

  function fleet(S, t) {
    var o = { res: 0, own: 0, cred: 0, spot: 0, resBill: 0, ownBill: 0, spotBill: 0 }, hw = Math.pow(HW, t);
    S.contracts.forEach(function (c) { if (c.start <= t && t <= c.end) { o.res += c.k; o.resBill += c.k * c.p / 1000; } });
    S.owned.forEach(function (w) { if (w.on <= t) o.own += w.k; });
    o.ownBill = o.own * OPEX / 1000;
    if (credOn(S, t)) o.cred = S.credits.k;
    if (t === S.t && S.spot > 0) { o.spot = S.spot; o.spotBill = S.spot * SPOT0 * hw / 1000; }
    o.K = o.res + o.own + o.cred + o.spot;
    o.bill = o.resBill + o.ownBill + o.spotBill;
    o.econ = o.bill + o.cred * CREDIT * hw / 1000;
    o.price = o.K > 0 ? o.econ * 1000 / o.K : RES0 * hw;
    return o;
  }
  /* locks from cards hold a share inside a range; the sum never exceeds the whole fleet */
  function fixAlloc(S) {
    var a = S.al;
    ['sa', 're'].forEach(function (k) { var l = lockOf(S, k); if (l) a[k] = clamp(a[k], l.min, l.max); });
    ['tr', 're', 'sa'].forEach(function (k) { a[k] = clamp(Math.round(a[k] * 100) / 100, 0, .9); });
    var over = a.tr + a.re + a.sa - 1;
    if (over > 1e-9) { var c = Math.min(over, a.tr); a.tr -= c; over -= c; }
    if (over > 1e-9) { var lr = lockOf(S, 're'), c2 = Math.min(over, a.re - (lr ? lr.min : 0)); a.re -= c2; over -= c2; }
    if (over > 1e-9) a.sa -= over;
    ['tr', 're', 'sa'].forEach(function (k) { a[k] = Math.max(0, Math.round(a[k] * 100) / 100); });
  }

  /* each lab's pull on each market line; your share moves toward yourScore / (all scores + the long tail) */
  function targets(S, t, you, top) {
    var out = {}, fl = flagship(S);
    LINES.forEach(function (L) {
      var ys = 0, rs = 0;
      if (you > 0 && fl) {
        var foc = S.lead === 'bal' ? 1 : S.lead === L ? 1.5 : .8, b = Math.exp(BETA[L] * (you - top)) * foc, tr = Math.max(1, S.trust) / 60;
        if (L === 'api') ys = b * Math.pow(S.p, -1.5) * Math.pow(tr, .3) * Math.min(1.3, 1 + .08 * S.eco) * (credOn(S, t) ? 1.15 : 1) *
          (fl.open ? 1.3 : 1) * (fl.mode === 'staged' ? .8 : 1) * (on(S, 'walk') ? .8 : 1);
        else if (L === 'con') ys = b * Math.pow(ftm(S), .8) * Math.pow(tr, .5) * (fl.mode === 'staged' ? .5 : 1);
        else ys = b * ENTT[S.entTeam] * Math.pow(tr, 1.5) * (S.SL >= 3 ? 1.1 : 1) * (on(S, 'entBoost') ? 1.1 : 1);
      }
      S.riv.forEach(function (r) {
        var b = Math.exp(BETA[L] * (r.fi - top)), tr = r.tr / 60;
        if (L === 'api') rs += b * Math.pow(r.pr, -1.5) * Math.pow(tr, .3) * (r.id === 'sable' && on(S, 'sableHit') ? .6 : 1);
        else if (L === 'con') rs += b * r.br * Math.pow(tr, .5);
        else rs += b * r.en * Math.pow(tr, 1.5);
      });
      out[L] = ys / (ys + rs + TAIL);
    });
    return out;
  }
  function tpk(S, m) {
    var Na = Math.sqrt(m.Cp / (6 * m.r)) * m.af, eff = (S.unl.distill != null ? 1.4 : 1) * (S.unl.kernels != null ? 1.3 : 1);
    return 1000 * PEAK * USERVE * eff * HALF / (2 * Na);
  }
  function cpmOf(S, m, price) { return price * 1e12 / tpk(S, m); }
  /* spot is capped at twice the larger of the contracted fleet and last half's whole fleet, never at zero */
  function spotCap(S) { var f = fleet(S, S.t), lastK = S.hist.length ? S.hist[S.hist.length - 1].K : 40; return Math.max(40, Math.round(2 * Math.max(f.K - f.spot, lastK) / 5) * 5); }

  /* ======================= a new world: the schedule is drawn before any play ======================= */
  var DECK = ['mega', 'poach', 'bill', 'sov', 'rocket', 'war', 'bench', 'result', 'govt', 'suit', 'acq'];
  function newWorld(seed) {
    seed = seed >>> 0;
    var w = K.rng(seed), S = {
      v: 1, seed: seed, t: 0, ph: 'setup', over: null, gov: null, pol: null, opening: null,
      cash: 5.0, cash0: 5.0, contracts: [{ k: 40, p: 9.5, start: 0, end: 3, src: 'legacy' }], owned: [], credits: { k: 0, start: 0, end: -1 },
      spot: 0, al: { tr: .25, re: .35, sa: .05 }, lk: {}, algo: 1, RP: 0, unl: {}, think: false, aird: false,
      R: 140, S: 20, morale: 70, hireR: 'steady', hireS: 'steady', SR: 25, SL: 2, slP: null,
      trust: 60, trustBase: 60, BC: null, lowG: 0,
      models: [{ id: 1, nm: 'Alder 1', Cp: 4e25, r: 20, fi: FI(4e25, 20), af: .12, st: 'live', mode: 'full', open: false, t: -1, evald: true }],
      run: null, prevMax: 4e25, sh: { api: 0, con: 0, ent: 0 }, p: 1, free: 'std', lead: 'bal', entTeam: 'std',
      reg: 0, RPr: 0, cap: { you: .62, inv: .38, strat: 0, sov: 0 }, chF: 1, rcap: .25, FV: 0, lastRev: 0, lastPost: 0, raisedT: -1,
      nextMul: 1, fvMul: 1, eco: 0, openCount: 0, leaked: false, susp: -1, breaches: 0, brT: [], inc: { minor: 0, serious: 0, severe: 0 },
      incidents: [], Eact: 0, Ezero: 0, fx: {}, sched: [], used: {}, card: null, hist: [], feed: [], nq: [], met: {}, launches: [],
      rounds: [], raised: 0, delays: 0, delaysBehind: 0, stalls: 0, idle: 0, spend: { spot: 0, res: 0, own: 0, capex: 0, cred: 0 },
      oneOff: 0, finIn: 0, reSum: 0, thinkH: [], weekends: 0, dayoGone: false, amended: false, amendT: -9, polNext: null,
      recap: null, recapT: -9, pbcConv: false, sovDone: false, sovOK: false, govK: 0, lic: -1, srMul: 1, stratHit: false,
      billAmend: false, shocked: false, weekendDue: false, reviewDone: false, track: null, cpm0: 0, gmMin: 1, gmMax: 0, gmSum: 0
    };
    S.shockT = 2 + w.int(3);
    S.riv = RIV.map(function (r) { return { id: r.id, nm: r.nm, fi: r.fi, g: r.g, tr: r.tr, pr: r.pr, br: r.br, en: r.en, j: r.j + w.int(3) - 1, inc: 0 }; });
    S.deck = w.shuffle(DECK.slice());
    S.rs = { w: w.state(), run: (seed + 11) >>> 0, risk: (seed + 23) >>> 0, card: (seed + 37) >>> 0 };
    var tg = targets(S, 0, youFI(S), topFI(S));
    LINES.forEach(function (L) { S.sh[L] = tg[L]; });
    return S;
  }

  function found(S, gov, pol, opening) {
    if (S.ph !== 'setup') return false;
    if (!/^(np|pbc|corp)$/.test(gov) || !/^(ifthen|prin|none)$/.test(pol) || !/^(reserve|spot|strategic)$/.test(opening)) return false;
    S.gov = gov; S.pol = pol; S.opening = opening;
    S.trustBase = 60 + { np: 3, pbc: 2, corp: -5 }[gov] + { ifthen: 6, prin: 2, none: -4 }[pol];
    S.trust = S.trustBase;
    S.BC = gov === 'np' ? 70 : gov === 'pbc' ? 75 : null;
    S.chF = { np: .75, pbc: .95, corp: 1 }[gov];
    S.rcap = gov === 'np' ? .15 : .25;
    if (opening === 'reserve') S.contracts.push({ k: 40, p: 9.0, start: 1, end: 6, src: 'opening' });
    if (opening === 'strategic') {
      S.credits = { k: 60, start: 0, end: 5 };
      ['you', 'inv', 'sov'].forEach(function (k) { S.cap[k] *= .82; });
      S.cap.strat = .18;
      S.rounds.push({ t: 0, who: 'strat', amt: 60 * CREDIT * 6 / 1000, pre: 0, post: 0, d: .18 });
    }
    S.ph = 'play';
    var tg = targets(S, 0, youFI(S), topFI(S));
    LINES.forEach(function (L) { S.sh[L] = tg[L]; });
    var d = step(dryClone(S), true), h = d.hist[d.hist.length - 1];
    S.lastRev = h.real; S.FV = 2 * h.real * 22 * S.chF * Math.pow(S.trust / 60, .3) * clamp(Math.exp(.05 * (youFI(S) - topFI(S))), .5, 1.3);
    S.lastPost = S.FV; S.cpm0 = h.cpm;
    S.track = { you: [], riv: [[], [], []] };
    feed(S, 'YOU', 'Founded Aldermoor as ' + { np: 'a nonprofit in control of a capped-profit company', pbc: 'a public benefit corporation with an independent trust', corp: 'an ordinary Delaware corporation' }[gov] +
      ', with ' + { ifthen: 'a published if-then scaling policy', prin: 'published principles and no thresholds', none: 'no public safety commitments' }[pol] + '.');
    noteQ(S, 'gov', 'the charter');
    noteQ(S, 'ifthen', 'the safety posture');
    if (opening === 'reserve') noteQ(S, 'takepay', 'the opening compute');
    feed(S, 'RIVAL', 'Vesper leads at 58.0, Obelisk is at 56.0 and Sable at 50.0. Alder 1 is at ' + fi1(youFI(S)) + '.');
    feed(S, 'CFO', 'We have ' + Bn(S.cash) + ' and a 40,000-GPU contract that runs through ' + hl(3) + (opening === 'reserve' ? ', plus 40,000 more from next half.' : opening === 'strategic' ? ', plus 60,000 in Skyloft credits through ' + hl(5) + '.' : '. Anything more, we rent.'));
    pickCard(S); brief(S);
    return true;
  }

  function dryClone(S) { return JSON.parse(JSON.stringify(S, function (k, v) { return k === 'feed' || k === 'log' ? undefined : v; })); }

  /* ======================= one half: the fifteen steps ======================= */
  function step(S, dry) {
    var t = S.t, h = { t: t, ev: [] }, i;
    var rR = K.rng(S.rs.run), rK = K.rng(S.rs.risk), rW = K.rng(S.rs.w);
    var uF = rR(), nF = rR.normal(), u1 = rK(), u2 = rK(), u3 = rK(), nW = [rW.normal(), rW.normal(), rW.normal()], uW = [rW(), rW(), rW()];
    S.rs.run = rR.state(); S.rs.risk = rK.state(); S.rs.w = rW.state();
    if (dry) { uF = 1; nF = 0; u1 = 1; u2 = 1; u3 = 1; nW = [0, 0, 0]; uW = [1, 1, 1]; }
    function ev(sp, tx, note) { h.ev.push({ sp: sp, tx: tx }); feed(S, sp, tx, note); }
    var you0 = youFI(S), ahead0 = S.riv.map(function (r) { return you0 >= r.fi; });

    /* scheduled consequences of earlier choices */
    S.sched = S.sched.filter(function (e) {
      if (e.t !== t) return true;
      if (e.k === 'suit') { S.cash -= 2.0; S.trust -= 5; S.oneOff += 2.0; ev('PRESS', 'The court ruled against Aldermoor on how some training copies were obtained: $2.0B in damages.'); }
      if (e.k === 'expose') { S.trust -= e.v; S.morale -= e.m || 0; ev('PRESS', 'A researcher outside the lab found the benchmark contamination in Alder’s training data. The story is about what Aldermoor knew and when.'); }
      return false;
    });

    /* 1 the fleet and the split */
    fixAlloc(S);
    var fl = fleet(S, t), Kf = fl.K, al = S.al, sv = Math.max(0, 1 - al.tr - al.re - al.sa);
    h.K = Kf; h.fl = fl; h.al = { tr: al.tr, re: al.re, sa: al.sa, sv: sv };
    S.spend.spot += fl.spotBill; S.spend.res += fl.resBill; S.spend.own += fl.ownBill; S.spend.cred += fl.econ - fl.bill;
    S.reSum += al.re; S.saSum = (S.saSum || 0) + al.sa;

    /* 2 research */
    var tau = clamp(Math.pow(S.R / 140, .4) * (.55 + .45 * S.morale / 70), .3, 1.8), e = al.re * tau;
    var scF = clamp(Math.pow(Math.max(1e-3, Kf * al.re / 10), .1), .8, 1.3);
    var q = clamp(.35 + 1.6 * e, .3, 1.55) * scF + (S.aird ? .25 : 0);
    if (S.SL === 5) q *= .92;
    S.algo *= Math.pow(ALG, q); S.RP += e * 10 * scF; h.q = q;
    UNL.forEach(function (u) {
      if (S.unl[u[0]] != null || S.RP < u[1]) return;
      if (u[0] === 'aird' && you0 < 72) return;
      S.unl[u[0]] = t; ev('RESEARCH', u[2]);
      if (u[0] === 'reason') noteQ(S, 'ttc', 'the reasoning breakthrough');
    });
    if (al.re < .2 || al.re > .5 || t >= 1) noteQ(S, 'research', al.re < .2 ? 'a half with little research' : al.re > .5 ? 'a research-heavy half' : 'the second half');

    /* 3 training */
    if (S.run) {
      var run = S.run, pf = clamp(.05 + .08 * Math.max(0, lg(run.Cp / run.pm) - .5), .05, .25) - (al.re >= .35 ? .03 : 0), add = Kf * al.tr * FPK;
      if (add > 0 && uF < pf) {
        add *= .75; S.stalls++; h.stall = 1;
        ev('RESEARCH', 'Node failures and a loss spike; restored from the last checkpoint. A quarter of this half’s training is gone.');
        noteQ(S, 'failures', 'a stalled run');
      }
      run.prog += add;
      if (run.prog >= run.Cp) {
        var fi = FI(run.Cp * Math.pow(run.a0, .7) * Math.pow(S.algo, .3), run.r) + nF, id = S.models.length + 1;
        var m = { id: id, nm: 'Alder ' + id, Cp: run.Cp, r: run.r, fi: fi, af: run.af, st: 'ready', mode: null, open: false, t: t + 1, evald: false, eff: run.Cp * Math.pow(run.a0, .7) * Math.pow(S.algo, .3) };
        S.models.push(m); S.prevMax = Math.max(S.prevMax, run.Cp); S.run = null; h.done = id;
        ev('RESEARCH', m.nm + ' finished training at Frontier Index ' + fi1(fi) + ', Level ' + lvOf(fi) + '. It is ready to evaluate and ship.');
      }
    }

    /* 4 the market */
    var fg = flagship(S), you = youFI(S), youM = you ? you - (S.fx.fiPen === t ? 1 : 0) : 0, top0 = rivMax(S), top = Math.max(you, top0), gap = Math.max(0, top - you);
    var tg = targets(S, t, youM, Math.max(youM, top0));
    LINES.forEach(function (L) { S.sh[L] += KADJ[L] * (tg[L] - S.sh[L]); });
    var mg = Math.exp(-gap / 8), shockP = (t === S.shockT || t === S.shockT + 1) ? .8 : 1, open = !!(fg && fg.open), sus = S.susp === t ? .3 : 1;
    var rA = 0, rC0 = 0, rC = 0, rE = 0, rG = S.govK ? .1 * Math.pow(1.3, t) * S.govK : 0;
    if (fg) {
      rA = pool('api', t) * S.sh.api * S.p * mg * shockP * (open ? .4 : 1);
      rC0 = pool('con', t) * S.sh.con; rC = rC0 * (S.fx.paywall === t ? 1.3 : 1);
      rE = pool('ent', t) * S.sh.ent;
    }

    /* 5 serving and inference economics */
    var need = 0, needNT = 0, cpm = 0, T1 = 1;
    if (fg) {
      T1 = tpk(S, fg); cpm = fl.price * 1e12 / T1;
      var th = S.think, vA = pool('api', t) * S.sh.api * (open ? .4 : 1) * 1e9 / PAPI, vC = rC0 * 1e9 / RPMC * ftm(S) * (S.fx.rocket === t ? 1.8 : 1), vE = (rE + rG) * 1e9 / RPME;
      need = (vA * (th ? 2.2 : 1) + vC * (th ? 1.5 : 1) + vE * (th ? 2.2 : 1)) * sus * 1e6 / T1;
      needNT = (vA + vC + vE) * sus * 1e6 / T1;
    }
    var kS = Kf * sv, phi = need > 0 ? Math.min(1, kS / need) : 1, gross = (rA + rC + rE + rG) * sus, real = gross * phi;
    var used = Math.min(need, kS), sCost = used * fl.price / 1000, gm = real > 0 ? (real - sCost) / real : 0;
    var gmNT = real > 0 ? (real - Math.min(needNT, kS) * fl.price / 1000) / real : 0;
    S.idle += Math.max(0, kS - need) * fl.price / 1000;
    if (phi < .95) {
      S.trust -= (.95 - phi) * 25;
      LINES.forEach(function (L) { S.sh[L] *= 1 - .3 * (.95 - phi); });
    }
    h.rA = rA * sus * phi; h.rC = rC * sus * phi; h.rE = (rE + rG) * sus * phi; h.real = real; h.need = need; h.kS = kS; h.phi = phi;
    h.gm = gm; h.gmNT = gmNT; h.cpm = cpm; h.think = !!(S.think && fg); h.you = you; h.top = top; h.gap = gap;
    if (real > 0) { S.gmMin = Math.min(S.gmMin, gm); S.gmMax = Math.max(S.gmMax, gm); S.gmSum += gm; }
    if (h.think) S.thinkH.push(t);
    if (S.cpm0 > 0 && cpm > 0 && cpm <= S.cpm0 / 2) noteQ(S, 'jevons', 'your cost per million tokens halving');

    /* 6 readiness */
    var x = al.sa * Math.sqrt(S.S / 20), srs = Math.min(98, 100 * (1 - Math.exp(-8.6 * x))) * S.srMul;
    S.SR = clamp(S.SR + .4 * (srs - S.SR), 0, 100);

    /* 7 incidents and theft */
    var lv = fg ? lvOf(you) : 0, reach = !fg ? 0 : open ? 1.6 : fg.mode === 'staged' ? .45 : 1, req = lv ? reqOf(S, lv) : 0, rsl = lv ? LV.sl[lv] : 1;
    var mit = Math.max(.05, clamp(.5 + (S.SR - req) / 40, .05, .95) - (S.SL < rsl ? .2 : 0));
    if (open) mit = .15;
    var base = lv ? LV.base[lv] + (S.aird ? .03 : 0) : 0, p = base * reach * (1 - mit) * (S.leaked ? 1.3 : 1), p0 = base * reach * .95, po = 0, olv = 0;
    S.models.forEach(function (mo) { if (mo.open && mo !== fg) { var l2 = lvOf(mo.fi); po += LV.base[l2] * .8 * .85; olv = Math.max(olv, l2); } });
    var pt = Math.min(.95, p + po);
    S.Eact += pt; S.Ezero += Math.min(.95, p0 + po); h.p = pt; h.p0 = Math.min(.95, p0 + po);
    if (u1 < pt) {
      var fromOpen = u1 >= p, lvI = fromOpen ? olv : lv, sev = LV.sev[lvI] * (!fromOpen && S.SR >= req && S.SL >= rsl ? .4 : 1);
      incident(S, u2 < sev ? 'severe' : u2 < sev + .35 ? 'serious' : 'minor', lvI, fromOpen, fg, ev, h);
    }
    if (fg && !open && !S.over) {
      var pth = .015 * Math.pow(you / 60, 3) * THEFT[S.SL] * (on(S, 'theftX') ? 1.5 : 1);
      h.pth = pth;
      if (u3 < pth) {
        /* a leak is a price and trust hit; no named rival is ever cast as the thief */
        S.sh.api *= .8; S.trust -= 8; S.leaked = true; h.theft = 1;
        ev('PRESS', 'Alder’s weights turned up outside the lab. Within weeks a gray-market model appeared that looks very much like it, and some of your API customers moved to it. Security was SL' + S.SL + '.');
        noteQ(S, 'weights', 'the theft of your weights');
      }
    }

    /* 8 costs and cash */
    var nR = S.hireR === 'agg' ? .30 * S.R : S.hireR === 'steady' ? .12 * S.R : 0, nS = S.hireS === 'agg' ? 10 : S.hireS === 'steady' ? 4 : 0;
    var c = { comp: fl.bill, ppl: (S.R + S.S) * HEAD + (nR + nS) * .0003, gtm: .04 + .03 * t + ENTC[S.entTeam], sec: SLUP[S.SL] + (S.reg >= 2 ? .15 : S.reg >= 1 ? (S.billAmend ? .025 : .05) : 0) + (S.lic >= t ? .15 : 0) };
    c.total = c.comp + c.ppl + c.gtm + c.sec;
    S.cash += real - c.total;
    h.c = c; h.one = S.oneOff; h.fin = S.finIn; h.credV = fl.econ - fl.bill;

    /* 9 people */
    var att = S.morale < 50 ? .08 : .03;
    S.R = (S.R + nR) * (1 - att); S.S = (S.S + nS) * (1 - att);
    if (S.hireR === 'agg' || S.hireS === 'agg') S.morale -= 3;
    S.morale += (you >= top - 2 ? 3 : 0) + (al.re < .2 ? -4 : 0) + (S.brT.indexOf(t) < 0 && S.gov !== 'corp' && S.pol === 'ifthen' ? 1 : 0);
    S.morale = clamp(S.morale + (65 - S.morale) * .1, 10, 95);

    /* 10 the board, or the investors */
    if (S.BC != null) {
      S.BC += 4;
      if (al.sa < .04) { S.BC -= 10; ev('BOARD', 'The board noted that safety received ' + F.pct(al.sa) + ' of compute this half. The minutes use the phrase “mission drift”.'); }
      if (S.gov === 'np' && !S.stratHit && S.cap.strat > .2) { S.BC -= 6; S.stratHit = true; }
      S.BC = clamp(S.BC, 0, 100);
      if (S.BC < 25) S.weekendDue = true;
    } else if (t >= 2 && S.lastRev > 0) S.lowG = real < S.lastRev * 1.15 ? S.lowG + 1 : 0;

    /* 11 trust and fair value */
    S.trust = clamp(S.trust + (S.trustBase - S.trust) * .15, 0, 100);
    var prev = S.lastRev > 0 ? S.lastRev : real, gr = clamp(prev > 0 ? real / prev : 1, .8, 1.8);
    S.FV = Math.max(.5, 2 * (real + prev) / 2 * 22 * Math.pow(gr, .6) * clamp(Math.exp(.05 * (you - top)), .5, 1.3) * S.chF * Math.pow(Math.max(10, S.trust) / 60, .3) * S.fvMul);
    S.lastRev = real;
    if (real > 0) S.lastGM = gm;

    /* 12 the rivals move */
    h.riv = S.riv.map(function (r) { return r.fi; });
    var bump = (S.fx.rivBump === t ? 1.5 : 0) + (S.fx.rivLater === t ? 1 : 0);
    if (S.fx.rivLater === t) S.morale = Math.min(95, S.morale + 3);
    S.riv.forEach(function (r, k) {
      r.fi += r.g + .8 * nW[k] + (r.j === t ? 5 : 0) + bump;
      if (uW[k] < .05 * Math.pow(r.fi / 70, 2)) { S.RPr += 1; r.inc++; r.incT = t; ev('PRESS', r.nm + ' reported a serious misuse incident. Regulators are asking every lab the same questions.'); }
    });
    /* Sable is a fast follower: it closes on the leaders and never quite leads */
    var sab = S.riv[2], mx = Math.max(S.riv[0].fi, S.riv[1].fi);
    if (t + 1 === S.shockT) { sab.fi = Math.max(sab.fi, mx - 2); sab.pr = .18; S.shocked = true; }
    if (t === S.shockT + 1) sab.pr = .35;
    sab.fi = Math.min(sab.fi, mx - 1.5);
    var nr = S.RPr >= 6 ? 2 : S.RPr >= 3 ? 1 : 0;
    if (nr > S.reg) {
      S.reg = nr;
      ev('REGULATOR', nr === 1 ? 'New rules take effect: frontier developers must publish a safety framework and report critical incidents. Compliance costs about $0.05B a half.' :
        'New rules take effect: Level 3 and above models need a pre-deployment evaluation, and their weights may not be opened. Compliance costs about $0.15B a half.');
      if (S.pol === 'none') { S.pol = 'prin'; ev('REGULATOR', 'The law made you publish your safety practices. Your posture is now principles, not thresholds.'); }
    }

    /* 13 the bridge, or the fire sale */
    if (S.cash < 0 && !S.over) {
      var amt = -S.cash + .5, pre = .55 * S.FV;
      if (amt > .35 * S.FV) { S.over = 'fire'; ev('CFO', 'Cash is ' + Bn(S.cash) + ' and no one will fund the gap at any price we can accept.'); }
      else {
        dilute(S, 'inv', amt, pre, 'bridge'); S.cash += amt; S.morale -= 5; S.trust -= 3; h.bridge = amt;
        ev('PRESS', 'The down round: Aldermoor raised ' + Bn(amt) + ' at ' + Bn(pre) + ' pre-money, well under its last price, to cover the compute bills.');
      }
    }

    /* 14 the record, then the clock */
    h.topEnd = topFI(S); h.cash = S.cash; h.FV = S.FV; h.SR = S.SR; h.SL = S.SL; h.trust = S.trust; h.net = S.cash - S.cash0; h.cap = JSON.parse(JSON.stringify(S.cap));
    h.card = S.card ? S.card.id : null; h.pick = S.card ? S.card.pick : -1; h.rank = rankOf(S);
    S.hist.push(h);
    if (!dry) {
      if (S.track) { S.track.you.push(you); S.riv.forEach(function (r, k) { S.track.riv[k].push(h.riv[k]); }); }
      if (t === 0) noteQ(S, 'algo', 'the first half closing');
      if (t === 0) noteQ(S, 'margin', 'the first half report');
      if (gap >= 6) noteQ(S, 'pricefall', 'a half 6 points behind');
      var you1 = youFI(S);
      S.riv.forEach(function (r, k) { if (ahead0[k] && r.fi > you1) { noteQ(S, 'racing', r.nm + ' passing you'); } });
    }
    S.spot = 0; S.oneOff = 0; S.finIn = 0;
    S.t = t + 1;
    if (S.slP && S.slP.at <= S.t) { S.SL = S.slP.to; S.slP = null; feed(S, 'SAFETY', 'Weight security is now SL' + S.SL + '.'); }
    if (S.polNext) { S.pol = S.polNext; S.polNext = null; }
    if (S.recap && S.recap.at <= S.t) {
      if (S.recap.ok) { S.gov = 'pbc'; S.chF = .95; S.rcap = .25; S.trust -= 2; feed(S, 'BOARD', 'The recapitalization closed: Aldermoor is now a public benefit corporation under nonprofit control. Rounds can be larger; the mission lock stays.'); }
      else { S.trust -= 4; S.recapT = S.t; feed(S, 'BOARD', 'The recapitalization stalled in review. The attorneys general want more time; you can try again in a year.'); }
      S.recap = null;
    }
    S.models.forEach(function (mo) { if (mo.st === 'review' && mo.at <= S.t) goLive(S, mo, mo.pmode, mo.popen, true); });
    S.cash0 = S.cash;
    if (!S.over && S.t >= 8) S.over = endingOf(S);
    if (!S.over && !dry) { pickCard(S); brief(S); }
    if (S.over && !dry) { S.ph = 'over'; S.ending = S.over; }
    return S;
  }

  function incident(S, kind, lvI, fromOpen, fg, ev, h) {
    var mult = (fromOpen ? .5 : 1) * (S.pol === 'prin' ? 1.3 : 1), dom = DOMAIN[lvI] || 'cyber', who = fromOpen ? 'an opened Alder model' : (fg ? fg.nm : 'Alder');
    S.inc[kind]++; S.incidents.push({ t: S.t, kind: kind, dom: dom, open: fromOpen, lv: lvI }); h.inc = kind;
    if (kind === 'minor') { S.trust -= 3 * mult; if (S.BC != null) S.BC -= 2; ev('SAFETY', 'A minor misuse incident involving ' + who + ' (' + dom + '). Caught, disclosed, patched.'); }
    else if (kind === 'serious') {
      S.trust -= 10 * mult; if (S.BC != null) S.BC -= 10; S.sh.ent *= .85; S.RPr += 1;
      ev('SAFETY', 'A serious misuse incident involving ' + who + ' (' + dom + '). Enterprise customers are asking for the incident report before they renew.');
    } else {
      S.trust -= 25 * mult; S.trustBase -= 3; if (S.BC != null) S.BC -= 25; S.RPr += 2; S.susp = S.t + 1;
      if (S.reg < 1) S.reg = 1;
      ev('SAFETY', 'A severe misuse incident involving ' + who + ' (' + dom + '). Regulators suspended the deployment for next half while they investigate.');
      if (lvI >= 4 && !fromOpen) S.over = 'shutdown';
    }
  }

  function dilute(S, who, amt, pre, kind) {
    var post = pre + amt, d = amt / post;
    ['you', 'inv', 'strat', 'sov'].forEach(function (k) { S.cap[k] *= (1 - d); });
    S.cap[who] += d;
    S.rounds.push({ t: S.t, who: who, amt: amt, pre: pre, post: post, d: d, kind: kind || who });
    S.raised += amt;
    return post;
  }

  function endingOf(S) {
    var you = youFI(S), top = topFI(S), gap = top - you, br = S.breaches, sev = S.inc.severe, ser = S.inc.serious, last = S.hist[S.hist.length - 1];
    var kept = S.pol === 'ifthen' && !br, careful = S.pol === 'ifthen' || S.saSum / Math.max(1, S.hist.length) >= .1;
    if (S.cap.strat >= .5) return 'sub';
    if (gap <= 1 && kept && !sev && ser <= 1) return 'receipts';
    if (gap <= 1) return 'asterisk';
    if (gap <= 5 && S.pol !== 'none' && !br && !sev && S.sh.ent >= .18 && (S.lastGM || 0) >= .5) return 'second';
    if (S.openCount >= 2) return 'insurgent';
    if (!br && careful && gap > 8) return 'careful';
    if (gap > 5 && last && last.real - last.c.total >= 0) return 'utility';
    return 'survivor';
  }

  /* ======================= launches, gates and breaches ======================= */
  function gateOf(S, m, mode, openW) {
    var fi = m.fi + (S.think ? 5 : 0), lv = lvOf(fi), jp = jumpOf(S, fi), req = reqOf(S, lv) + jp - (mode === 'staged' ? 10 : 0), rsl = LV.sl[lv];
    var met = S.SR >= req && S.SL >= rsl;
    if (openW && lv >= 3 && S.SR < req + 20) met = false;
    var metOld = S.SR >= LV.req[lv] + jp - (mode === 'staged' ? 10 : 0) && S.SL >= rsl;
    return { lv: lv, req: req, rsl: rsl, met: met, metOld: metOld, jump: jp, step: Math.max(0, fi - (youFI(S) || S.models[0].fi)) };
  }
  function breach(S, what) {
    S.breaches++; S.brT.push(S.t);
    S.trust -= 15; S.trustBase -= 2; S.morale -= 12;
    if (S.BC != null) S.BC -= (S.gov === 'pbc' && S.t >= 4 ? 35 : 25);
    feed(S, 'SAFETY', 'That ' + what + ' breached the scaling policy Aldermoor published. It is on the record now, inside the lab and out.');
    if (rcard(S) < .3 && !S.dayoGone) alignQuit(S);
  }
  function alignQuit(S) {
    S.dayoGone = true; S.S *= .7; S.SR = Math.max(0, S.SR - 10); S.trust -= 6;
    feed(S, 'PRESS', 'Dayo Oyelaran, head of alignment, resigned publicly, saying the lab had stopped doing what it said it would do.');
  }
  function goLive(S, m, mode, openW, fromReview) {
    var old = flagship(S), oldFI = old ? old.fi : 0, g = gateOf(S, m, mode, openW);
    if (old && old !== m) old.st = 'retired';
    m.st = 'live'; m.mode = mode; m.lt = S.t;
    if (m.delayedBehind && m.holdUntil != null && m.lt > m.holdUntil) S.delaysBehind++;
    S.SR = Math.max(0, S.SR - .8 * Math.max(0, m.fi - oldFI));
    if (openW) openModel(S, m);
    S.launches.push({ t: S.t, id: m.id, fi: m.fi, lv: g.lv, met: m.gateMet != null ? m.gateMet : g.met, mode: mode, open: !!openW });
    if (S.pol === 'none' && g.lv >= 3) S.RPr += 1;
    feed(S, 'YOU', (fromReview ? 'The evaluation cleared. ' : '') + m.nm + ' is live: ' + (openW ? 'open weights' : mode === 'staged' ? 'staged, to API and vetted enterprise customers' : 'a full launch') + ', FI ' + fi1(m.fi) + ', Level ' + lvOf(m.fi) + '.');
  }
  function openModel(S, m) {
    if (m.open) return;
    m.open = true; S.eco += 1; S.openCount += 1; S.morale = Math.min(95, S.morale + 6); S.trust += 2; S.fx.sableHit = S.t + 1;
    feed(S, 'YOU', 'Published the weights of ' + m.nm + '. Anyone can run it now, and no one can take it back.');
    noteQ(S, 'open', 'opening ' + m.nm);
  }
  function launch(S, id, mode, openW, force) {
    var m = modelBy(S, id);
    if (!m || (m.st !== 'ready' && m.st !== 'internal')) return false;
    if (mode === 'internal') { m.st = 'internal'; m.evald = true; feed(S, 'YOU', 'Kept ' + m.nm + ' internal. No revenue, no deployment risk.'); return true; }
    if (m.holdUntil != null && S.t <= m.holdUntil) return { err: 'You promised the evaluators a half. ' + m.nm + ' can launch next half.' };
    if (on(S, 'hold')) return { err: 'Launches wait until next half: you promised the letter’s signers a pause.' };
    var g = gateOf(S, m, mode, openW);
    if (openW && S.reg >= 2 && g.lv >= 3) return { err: 'The law forbids opening the weights of a Level 3 model or above.' };
    if (S.pol === 'ifthen' && !g.met && !force) return { gate: true, g: g, nm: m.nm };
    m.evald = true; m.gateMet = g.met;
    if (!g.met && S.pol === 'ifthen') breach(S, 'launch');
    if (S.amended && S.t <= S.amendT + 1 && g.met && !g.metOld) {
      S.trust -= 6; feed(S, 'PRESS', 'Aldermoor launched ' + m.nm + ' days after amending its thresholds. The headline writes itself: amended under pressure.');
    }
    if (S.reg >= 2 && g.lv >= 3 && S.SR < reqOf(S, g.lv) + 10) {
      m.st = 'review'; m.pmode = mode; m.popen = openW; m.at = S.t + 1;
      feed(S, 'REGULATOR', m.nm + ' is Level ' + g.lv + ' and readiness is under the bar plus 10. The pre-deployment evaluation takes a half; it goes live next half.');
      return true;
    }
    goLive(S, m, mode, openW);
    return true;
  }

  /* ======================= cards: one dilemma a half ======================= */
  function etaOf(S, Cp, trSh, prog) {
    var need = Cp - (prog || 0), k = 0;
    while (need > 0 && k < 16) { var Kk = fleet(S, S.t + k).K - (k ? 0 : 0); need -= Kk * trSh * FPK; k++; }
    return need > 0 ? 99 : Math.max(1, k);
  }
  function startRun(S, lc, r) {
    if (S.run) return false;
    var Cp = Math.pow(10, lc);
    if (!(Cp >= 1e25 && Cp <= 3.2e28) || [8, 20, 100, 300].indexOf(r) < 0) return false;
    S.run = { Cp: Cp, r: r, prog: 0, a0: S.algo, t0: S.t, pm: S.prevMax, af: S.unl.sparse != null ? .07 : .12 };
    feed(S, 'YOU', 'Started a run: ' + F.sci(Cp) + ' FLOP at ' + r + ' tokens per parameter.');
    noteQ(S, 'flops', 'your first run');
    noteQ(S, 'chinchilla', 'choosing a shape');
    if (r >= 100) noteQ(S, 'overtrain', 'a lean run');
    if (Cp >= 1e26) { noteQ(S, 'regthreshold', 'a run above 10²⁶ FLOP'); if (!S.fx.thr26) { S.fx.thr26 = 99; feed(S, 'REGULATOR', 'This run crosses 10²⁶ FLOP, the line California’s SB 53 draws for frontier models, and is well past the EU’s 10²⁵ presumption of systemic risk.'); } }
    return true;
  }
  function sayOpt(S, o) { feed(S, 'YOU', o); }

  var CARDS = {
    first: { sp: 'RESEARCH', title: 'The first run',
      body: function () { return 'Alder 1 was trained on 4 × 10²⁵ ' + T('flop') + '. The frontier labs are about a generation ahead and move about a generation a year. I can start the next run today on today’s recipe, or give the research team one half to improve it. Every half we wait, the recipe gets better and the frontier gets further away.'; },
      opts: [
        { l: 'Go big: 10× on the compute-optimal recipe', s: function (S) { var n = etaOf(S, 4e26, .35); return 'Forecast FI ' + fi1(FI(4e26 * S.algo, 20)) + ' in about ' + n + ' ' + F.plural(n, 'half', 'halves') + '. The frontier will be near ' + fi1(rivMax(S) + 3.4 * n) + ' by then.'; },
          fx: function (S) { S.al = { tr: .35, re: .30, sa: .05 }; startRun(S, lg(4e26), 20); } },
        { l: 'Go lean: 4× at 100 tokens per parameter', s: function (S) { var n = etaOf(S, 1.6e26, .30); return 'Forecast FI ' + fi1(FI(1.6e26 * S.algo, 100)) + ' in ' + n + ' ' + F.plural(n, 'half', 'halves') + ', and about 55% cheaper to serve than a compute-optimal model of the same compute.'; },
          fx: function (S) { S.al.tr = .30; fixAlloc(S); startRun(S, lg(1.6e26), 100); } },
        { l: 'Wait a half and fund the recipe', s: function () { return 'No new model until Year 2. Research compounds; so does the gap.'; },
          fx: function (S) { S.al = { tr: 0, re: .5, sa: .05 }; S.RP += 2; } }
      ] },
    eval: { sp: 'SAFETY', title: 'The eval result',
      body: function (S, x) {
        var m = modelBy(S, x.id), g = gateOf(S, m, 'full', false), riv = null, n = 0;
        S.riv.forEach(function (r) { if (!riv && r.fi >= m.fi - 1) riv = r; });
        if (riv) { var k = S.hist.length - 1; while (k >= 0 && S.hist[k].riv[S.riv.indexOf(riv)] >= m.fi - 1) { n++; k--; } }
        return m.nm + ' finished at FI ' + fi1(m.fi + (S.think ? 5 : 0)) + ': ' + T('risk', 'Level ' + g.lv) + '. On our dangerous-capability ' + T('eval', 'evals') + ' it shows meaningful uplift in ' + DOMAIN[g.lv] + '. ' + T('ready', 'Readiness') + ' is ' + Math.round(S.SR) + ' against a Level ' + g.lv + ' bar of ' + g.req + (g.jump ? ' (' + (g.req - g.jump) + ' for the level, +' + g.jump + ' because it is ' + fi1(g.step) + ' points past the model in service)' : '') + '; weight security is SL' + S.SL + ' against SL' + g.rsl + '. ' +
          (riv ? riv.nm + ' shipped something comparable ' + (n <= 1 ? 'last half.' : n + ' halves ago.') : 'Nobody else has shipped anything this capable.');
      },
      opts: [
        { l: 'Delay a half and build the mitigations', s: function () { return 'Readiness +12 now, $0.1B, morale +3. The model cannot launch until next half, so its revenue starts a half later.'; },
          fx: function (S, x) { var m = modelBy(S, x.id); S.SR = Math.min(100, S.SR + 12); S.cash -= .1; S.oneOff += .1; S.morale += 3; S.delays++; m.holdUntil = S.t; m.delayedBehind = rivMax(S) > youFI(S); m.evald = true; noteQ(S, 'racing', 'delaying a launch'); } },
        { l: 'Ship to vetted customers first', s: function (S, x) { var g = gateOf(S, modelBy(S, x.id), 'staged'); return 'A staged launch now: API and enterprise under usage monitoring, consumers wait. $0.1B for classifiers, readiness +4. ' + barLine(S, g, 4); },
          fx: function (S, x, force) { S.cash -= .1; S.oneOff += .1; S.SR = Math.min(100, S.SR + 4); return launch(S, x.id, 'staged', false, force); }, gate: function (S, x) { var g = gateOf(S, modelBy(S, x.id), 'staged'); g.SR = S.SR + 4; return S.pol === 'ifthen' && !(S.SR + 4 >= g.req && S.SL >= g.rsl); } },
        { l: 'Ship it to everyone', s: function (S, x) { return 'Full revenue now. ' + barLine(S, gateOf(S, modelBy(S, x.id), 'full'), 0); },
          fx: function (S, x, force) { return launch(S, x.id, 'full', false, force); }, gate: function (S, x) { var g = gateOf(S, modelBy(S, x.id), 'full'); return S.pol === 'ifthen' && !g.met; } }
      ] },
    shock: { sp: 'PRESS', title: 'The open-weights shock',
      body: function (S) { var sb = S.riv[2]; return 'Sable released ' + T('openw', 'open weights') + ' within ' + fi1(Math.max(0, rivMax(S) - sb.fi)) + ' points of the frontier under a permissive license, trained for a fraction of what you spent. Prices for anything below the frontier are resetting overnight, and your largest API customers want to know why they pay $' + (PAPI * S.p).toFixed(2) + ' per million ' + T('token', 'tokens') + '.'; },
      opts: [
        { l: 'Match on price', s: function (S) { return 'API price to ' + F.x(Math.max(.5, S.p * .6)) + ' list. Defend share; give back margin.'; }, fx: function (S) { S.p = Math.max(.5, Math.round(S.p * .6 * 20) / 20); } },
        { l: 'Hold price and sell trust', s: function () { return 'Lead with enterprise; enterprise pull +10% for two halves. Let the price-sensitive go.'; }, fx: function (S) { S.lead = 'ent'; S.fx.entBoost = S.t + 1; } },
        { l: 'Open your previous model', s: function () { return 'Commoditize the commoditizer. Your ecosystem grows, Sable’s API pull drops for two halves. Irreversible.'; },
          ok: function (S) { var m = S.models.filter(function (mo) { return (mo.st === 'retired' || mo.st === 'internal') && !mo.open; }).pop(); if (!m) return 'Needs a retired model: you have only ever shipped one.'; if (S.reg >= 2 && lvOf(m.fi) >= 3) return 'The law forbids opening Level 3 weights.'; return ''; },
          gate: function (S) { var m = S.models.filter(function (mo) { return (mo.st === 'retired' || mo.st === 'internal') && !mo.open; }).pop(); return !!m && S.pol === 'ifthen' && lvOf(m.fi) >= 3 && S.SR < reqOf(S, lvOf(m.fi)) + 20; },
          fx: function (S) { var m = S.models.filter(function (mo) { return (mo.st === 'retired' || mo.st === 'internal') && !mo.open; }).pop(); if (!m) return; if (S.pol === 'ifthen' && lvOf(m.fi) >= 3 && S.SR < reqOf(S, lvOf(m.fi)) + 20) breach(S, 'release'); openModel(S, m); } }
      ] },
    mega: { sp: 'CFO', title: 'The mega-contract',
      ctx: function (S) { var k = Math.max(60, Math.round(1.5 * fleet(S, S.t).K / 5) * 5); return { k: k, p: .75 * RES0 * Math.pow(HW, S.t) }; },
      body: function (S, x) { return 'Anvil Silicon will sell us ' + F.n(x.k) + 'k ' + T('gpueq', 'GPU-equivalents') + ' at 25% under market, ' + F.M(x.p, 2) + ' per thousand per half, ' + T('tp', 'take-or-pay') + ' for eight halves: ' + Bn(x.k * x.p * 8 / 1000) + ' of obligations. Hardware gets about 12% cheaper every half; this locks today’s discount against tomorrow’s price.'; },
      opts: [
        { l: 'Sign all', s: function (S, x) { return F.n(x.k) + 'k from next half, ' + Bn(x.k * x.p / 1000) + ' a half for eight halves.'; }, fx: function (S, x) { S.contracts.push({ k: x.k, p: x.p, start: S.t + 1, end: S.t + 8, src: 'Anvil' }); noteQ(S, 'takepay', 'the Anvil contract'); } },
        { l: 'Sign half', s: function (S, x) { return F.n(x.k / 2) + 'k, ' + Bn(x.k * x.p / 2000) + ' a half.'; }, fx: function (S, x) { S.contracts.push({ k: x.k / 2, p: x.p, start: S.t + 1, end: S.t + 8, src: 'Anvil' }); noteQ(S, 'takepay', 'the Anvil contract'); } },
        { l: 'Pass', s: function () { return 'Keep the balance sheet light and the price risk yours.'; }, fx: function () {} }
      ] },
    poach: { sp: 'RESEARCH', title: 'The poach',
      ctx: function (S) { return { n: Math.max(4, Math.round(.08 * S.R)) }; },
      body: function (S, x) { return 'Vesper made offers to ' + x.n + ' of our best researchers, packages we cannot match without it showing up in everyone’s comp review. Two of them lead the team behind our next run.'; },
      opts: [
        { l: 'Match the offers', s: function (S, x) { return Bn(x.n * .025) + ' in retention packages; morale −2 from everyone who did not get one.'; }, fx: function (S, x) { S.cash -= x.n * .025; S.oneOff += x.n * .025; S.morale -= 2; } },
        { l: 'Make the mission case', s: function (S) { return 'Chance they stay: about ' + F.pct(poachP(S)) + '. If they stay, morale +5.'; },
          fx: function (S, x) { if (rcard(S) < poachP(S)) { S.morale += 5; sayOpt(S, 'They stayed. Two of them said it was the first straight pitch they had heard all year.'); } else { S.R -= x.n; S.morale -= 4; sayOpt(S, 'They left for Vesper. The run will be slower.'); } } },
        { l: 'Let them go', s: function (S, x) { return x.n + ' fewer researchers, morale −4, and some of the recipe walks out the door.'; }, fx: function (S, x) { S.R -= x.n; S.morale -= 4; S.RP = Math.max(0, S.RP - 1); } }
      ] },
    bill: { sp: 'REGULATOR', title: 'The state bill',
      body: function () { return 'A state bill would require developers training above 10²⁶ FLOP to publish transparency reports and report critical safety incidents within 15 days, and those above $500M in revenue to publish a safety framework. An industry group wants your signature on its opposition letter.'; },
      opts: [
        { l: 'Support it', s: function () { return 'Trust +4. Regulatory pressure rises; if you had no commitments, you now have principles.'; }, fx: function (S) { S.trust += 4; S.RPr += 2; if (S.pol === 'none') S.pol = 'prin'; } },
        { l: 'Oppose it', s: function () { return 'Trust −4. Even odds it dies or passes anyway.'; }, fx: function (S) { S.trust -= 4; if (rcard(S) < .5) { S.RPr = Math.max(0, S.RPr - 1); sayOpt(S, 'The bill died in committee.'); } else { if (S.reg < 1) S.reg = 1; S.trust -= 3; sayOpt(S, 'The bill passed anyway, with your name on the letter against it.'); } } },
        { l: 'Support it with amendments', s: function () { return 'Trust +2, pressure +1, and your compliance cost is halved if rules arrive.'; }, fx: function (S) { S.trust += 2; S.RPr += 1; S.billAmend = true; } }
      ] },
    sov: { sp: 'INVESTOR', who: 'The Keelstone Fund, a sovereign infrastructure fund', title: 'The sovereign offer',
      ctx: function (S) { return { amt: .2 * S.FV }; },
      body: function (S, x) { return 'The Keelstone Fund, a sovereign infrastructure fund, will invest ' + Bn(x.amt) + ' at 10% above fair value, on one condition: half of it builds a campus in its jurisdiction to run your models. It is the largest check you have seen.'; },
      opts: [
        { l: 'Accept', s: function (S) { return 'Half the money in cash, half as a campus online in two halves. Trust −' + (S.gov === 'corp' ? 3 : 6) + (S.SL >= 4 ? '.' : '; regulators notice weights leaving your security perimeter.'); }, fx: function (S, x) { sovDeal(S, x.amt); } },
        { l: 'Accept with conditions', s: function (S) { return 'Half the amount, and the campus must run at SL4' + (S.SL >= 4 ? '.' : ': you pay for the upgrade now.') + ' Trust −1.'; },
          fx: function (S, x) { if (S.SL < 4) { var cst = 0; for (var l = S.SL + 1; l <= 4; l++) cst += SLCOST[l]; S.cash -= cst; S.oneOff += cst; S.slP = { to: 4, at: S.t + 1 }; } sovDeal(S, x.amt / 2, true); } },
        { l: 'Decline', s: function () { return 'Keep the cap table and the jurisdiction simple.'; }, fx: function () {} }
      ] },
    rocket: { sp: 'PRODUCT', title: 'The consumer rocket',
      body: function () { return 'A feature went viral. Consumer demand this half is running at two and a half times plan. Every free user costs ' + T('token', 'tokens') + '; every paying one started as a free one.'; },
      opts: [
        { l: 'Go generous', s: function () { return 'Generous free tier this half, consumer share +4 points, and consumer tokens ×1.8. Check your serving capacity.'; }, fx: function (S) { S.fx.freeGen = S.t; S.sh.con += .04; S.fx.rocket = S.t; noteQ(S, 'jevons', 'the consumer rocket'); } },
        { l: 'Rate-limit', s: function () { return 'Share +1 point; trust −3 from everyone who hit the wall.'; }, fx: function (S) { S.sh.con += .01; S.trust -= 3; noteQ(S, 'jevons', 'the consumer rocket'); } },
        { l: 'Paywall the new feature', s: function () { return 'Consumer revenue ×1.3 this half; share −1 point.'; }, fx: function (S) { S.fx.paywall = S.t; S.sh.con = Math.max(0, S.sh.con - .01); noteQ(S, 'jevons', 'the consumer rocket'); } }
      ] },
    war: { sp: 'RIVAL', who: 'Vesper', title: 'The price war',
      body: function () { return 'Vesper cut its API prices in half this morning and called it passing efficiency on to customers. Their ' + T('gm', 'margin') + ' is their problem; our share is ours.'; },
      opts: [
        { l: 'Match', s: function (S) { return 'API price to ' + F.x(Math.max(.5, S.p * .6)) + ' list.'; }, fx: function (S) { S.p = Math.max(.5, Math.round(S.p * .6 * 20) / 20); noteQ(S, 'pricefall', 'the price war'); } },
        { l: 'Differentiate with thinking', s: function () { return 'Thinking mode on and price ×1.15: sell the better answer, pay for the extra tokens.'; }, ok: function (S) { return S.unl.reason != null ? '' : 'Needs the reasoning breakthrough from research.'; },
          fx: function (S) { S.think = true; S.p = Math.min(2, Math.round(S.p * 1.15 * 20) / 20); noteQ(S, 'pricefall', 'the price war'); } },
        { l: 'Walk away from the low end', s: function () { return 'Lead with enterprise; your API pull ×0.8 for two halves.'; }, fx: function (S) { S.lead = 'ent'; S.fx.walk = S.t + 1; noteQ(S, 'pricefall', 'the price war'); } }
      ] },
    bench: { sp: 'RESEARCH', title: 'The benchmark',
      body: function () { return 'We found test questions from a headline benchmark in Alder’s training data. Our published score is about three points higher than it should be. No one outside knows yet.'; },
      opts: [
        { l: 'Publish a correction', s: function () { return 'Trust +5. For one half the market reads you a point lower.'; }, fx: function (S) { S.trust += 5; S.fx.fiPen = S.t; } },
        { l: 'Fix it silently in the next model', s: function () { return 'A 40% chance someone finds it within two halves: trust −12.'; }, fx: function (S) { if (rcard(S) < .4) S.sched.push({ t: S.t + (rcard(S) < .5 ? 1 : 2), k: 'expose', v: 12 }); } },
        { l: 'Say nothing', s: function () { return 'A 60% chance it comes out: trust −15, morale −5.'; }, fx: function (S) { if (rcard(S) < .6) S.sched.push({ t: S.t + (rcard(S) < .5 ? 1 : 2), k: 'expose', v: 15, m: 5 }); } }
      ] },
    result: { sp: 'RESEARCH', title: 'The research result',
      body: function () { return 'The team has a training-efficiency result that looks like a twofold gain in ' + T('effc', 'effective compute') + '. Publishing it would be the paper of the year. It would also be a gift to every lab we compete with.'; },
      opts: [
        { l: 'Publish now', s: function () { return 'Your recipe ×1.5; every rival +1.5 FI this half; morale +8; trust +3.'; }, fx: function (S) { S.algo *= 1.5; S.fx.rivBump = S.t; S.morale += 8; S.trust += 3; } },
        { l: 'Keep it', s: function () { return 'Your recipe ×2. Theft risk ×1.5 for two halves: it is now worth stealing.'; }, fx: function (S) { S.algo *= 2; S.fx.theftX = S.t + 1; } },
        { l: 'Publish in a year', s: function () { return 'Your recipe ×2 now; in two halves the rivals get +1 and your researchers get to publish (morale +3).'; }, fx: function (S) { S.algo *= 2; S.fx.rivLater = S.t + 2; } }
      ] },
    govt: { sp: 'PRODUCT', title: 'The government contract',
      body: function () { return 'A national security agency wants a dedicated, air-gapped deployment of Alder for analysis work. It pays well, it requires weight ' + T('sl', 'security') + ' of SL3 or better, and some of your staff have asked where the line is.'; },
      opts: [
        { l: 'Accept', s: function (S) { return 'About ' + Bn(.1 * Math.pow(1.3, S.t)) + ' a half, growing. Trust +1, morale −4.'; }, ok: function (S) { return S.SL >= 3 ? '' : 'Needs SL3 or better. You are at SL' + S.SL + '.'; }, fx: function (S) { S.govK = 1; S.trust += 1; S.morale -= 4; } },
        { l: 'Accept with a published use policy', s: function () { return 'Revenue ×0.6, trust +2, and the staff know where the line is.'; }, ok: function (S) { return S.SL >= 3 ? '' : 'Needs SL3 or better. You are at SL' + S.SL + '.'; }, fx: function (S) { S.govK = .6; S.trust += 2; } },
        { l: 'Decline', s: function () { return 'Morale +2.'; }, fx: function (S) { S.morale += 2; } }
      ] },
    suit: { sp: 'PRESS', title: 'The copyright suit',
      body: function () { return 'Authors have filed a class action over books in our training data. Our lawyers think we win on some claims and lose on how some of the copies were obtained.'; },
      opts: [
        { l: 'Settle now', s: function () { return '$0.8B now, trust +2, and the matter is closed: regulatory pressure −1.'; }, fx: function (S) { S.cash -= .8; S.oneOff += .8; S.trust += 2; S.RPr = Math.max(0, S.RPr - 1); } },
        { l: 'Fight it', s: function () { return '$0.1B now in fees; even odds of losing $2.0B and trust −5 in a year.'; }, fx: function (S) { S.cash -= .1; S.oneOff += .1; if (rcard(S) < .5) S.sched.push({ t: S.t + 2, k: 'suit' }); } },
        { l: 'License going forward and settle the past', s: function () { return '$0.4B now plus $0.15B a half for three halves, this one included ($0.85B in all); trust +4.'; }, fx: function (S) { S.cash -= .4; S.oneOff += .4; S.lic = S.t + 2; S.trust += 4; } }
      ] },
    power: { sp: 'CFO', title: 'The power problem',
      body: function () { return 'The grid operator pushed our interconnection date back a half. The buildings are ready; the electricity is not.'; },
      opts: [
        { l: 'Onsite gas turbines', s: function (S) { return Bn(.15 + .0005 * dueK(S)) + ', no delay, trust −2.'; }, fx: function (S) { var c = .15 + .0005 * dueK(S); S.cash -= c; S.oneOff += c; S.trust -= 2; } },
        { l: 'Wait', s: function () { return 'The campus comes online a half late.'; }, fx: function (S) { S.owned.forEach(function (w) { if (w.on === S.t + 1) w.on += 1; }); } },
        { l: 'Pay for firm power', s: function () { return '$0.3B, no delay.'; }, fx: function (S) { S.cash -= .3; S.oneOff += .3; } }
      ] },
    acq: { sp: 'RIVAL', who: 'Obelisk’s parent company', title: 'The acquisition offer',
      body: function (S) { return 'Obelisk’s parent offers to buy Aldermoor for ' + Bn(1.3 * S.FV) + '. Your team keeps its jobs, your models get their distribution, and your investors get a number that starts with a B.'; },
      opts: [
        { l: 'Sell', s: function (S) { return 'The experiment ends here, at 1.3× fair value.'; }, fx: function (S) { S.exitX = 1.3; S.exitV = 1.3 * S.FV; S.over = 'exit'; } },
        { l: 'Negotiate', s: function () { return 'Even odds of 1.45× and a sale, or the offer is withdrawn (morale −3).'; }, fx: function (S) { if (rcard(S) < .5) { S.exitX = 1.45; S.exitV = 1.45 * S.FV; S.over = 'exit'; } else { S.morale -= 3; sayOpt(S, 'They withdrew the offer. The team heard about it anyway.'); } } },
        { l: 'Decline', s: function () { return 'Morale +3.'; }, fx: function (S) { S.morale += 3; } }
      ] },
    leak: { sp: 'SAFETY', title: 'The leak attempt',
      body: function (S) { return 'Security caught an insider copying model weights to a personal device. We stopped it this time. At SL' + S.SL + ', “this time” is doing a lot of work.'; },
      opts: [
        { l: 'Upgrade to SL3 now', s: function () { return '$0.33B, a rush premium of 30%. SL3 from next half.'; }, fx: function (S) { S.cash -= .325; S.oneOff += .325; S.slP = { to: 3, at: S.t + 1 }; noteQ(S, 'weights', 'the leak attempt'); } },
        { l: 'Stay the course', s: function () { return 'Nothing changes, including the odds.'; }, fx: function (S) { noteQ(S, 'weights', 'the leak attempt'); } },
        { l: 'Report it and upgrade', s: function () { return '$0.25B, SL3 from next half, trust +3; regulators take note.'; }, fx: function (S) { S.cash -= .25; S.oneOff += .25; S.slP = { to: 3, at: S.t + 1 }; S.trust += 3; S.RPr += 1; noteQ(S, 'weights', 'the leak attempt'); } }
      ] },
    weekend: { sp: 'BOARD', title: 'The weekend',
      ctx: function (S) { return { why: S.breaches ? 'a published commitment you broke' : S.inc.severe ? 'a severe incident' : 'a pattern of choosing speed over the mission' }; },
      body: function (S, x) { return 'The board met without you on Friday. By Sunday it had voted to remove you as chief executive, citing ' + x.why + '. Your staff are on a group chat you are not in.'; },
      opts: [
        { l: 'Accept the decision', s: function () { return 'The experiment ends here.'; }, fx: function (S) { S.over = 'weekend'; } },
        { l: 'Rally the staff', s: function (S) { return S.morale >= 65 ? 'Morale is ' + Math.round(S.morale) + ': a 60% chance they bring you back (trust −8).' : 'Morale is ' + Math.round(S.morale) + '. Below 65, nobody signs the letter.'; },
          fx: function (S) { if (S.morale >= 65 && rcard(S) < .6) { S.BC = 50; S.trust -= 8; S.RPr += 1; sayOpt(S, 'Most of the staff signed a letter. The board reversed itself; you are back, on a shorter leash and with a longer memory.'); } else S.over = 'weekend'; } },
        { l: 'Offer an independent review', s: function () { return 'Board confidence +20, safety at 12% or more for two halves, trust −3.'; }, ok: function (S) { return S.reviewDone ? 'You already offered one. It will not work twice.' : ''; },
          fx: function (S) { S.reviewDone = true; S.BC = Math.min(100, S.BC + 20); S.lk.sa = { min: .12, max: .9, until: S.t + 1 }; fixAlloc(S); S.trust -= 3; } }
      ] },
    letter: { sp: 'INVESTOR', title: 'The investors’ letter',
      body: function () { return 'Your lead investors have written, politely, that growth has stalled for two halves and they expect a plan by the next board meeting.'; },
      opts: [
        { l: 'Cut safety and research to the bone', s: function () { return 'Safety locked at 3% and research at 25% for two halves; fair value ×1.1.'; }, fx: function (S) { S.lk.sa = { min: .03, max: .03, until: S.t + 1 }; S.lk.re = { min: .25, max: .25, until: S.t + 1 }; S.al.sa = .03; S.al.re = .25; fixAlloc(S); S.fvMul *= 1.1; } },
        { l: 'Cut headcount 15%', s: function () { return 'Researchers ×0.85; morale −10.'; }, fx: function (S) { S.R *= .85; S.morale -= 10; } },
        { l: 'Tell them no', s: function () { return 'Fair value ×0.85, and your next growth round prices 10% lower.'; }, fx: function (S) { S.fvMul *= .85; S.nextMul = .9; } }
      ] },
    openl: { sp: 'SAFETY', title: 'The open letter',
      body: function () { return 'Forty of your staff published an open letter: the lab, they write, is shipping capabilities faster than it can evaluate them.'; },
      opts: [
        { l: 'Engage: pause the next launch and raise safety spend', s: function () { return 'No launches this half; safety at 12% or more for two halves; trust +5, morale +6.'; }, fx: function (S) { S.fx.hold = S.t; S.lk.sa = { min: .12, max: .9, until: S.t + 1 }; fixAlloc(S); S.trust += 5; S.morale += 6; } },
        { l: 'Thank them and carry on', s: function () { return 'Morale −10, and a 40% chance the head of alignment resigns in public.'; }, fx: function (S) { S.morale -= 10; if (rcard(S) < .4 && !S.dayoGone) alignQuit(S); } },
        { l: 'Fold safety into product', s: function () { return 'Safety staff ×0.8, morale −8, trust −4, and readiness never climbs as high again.'; }, fx: function (S) { S.S *= .8; S.morale -= 8; S.trust -= 4; S.srMul *= .85; } }
      ] },
    quiet: { sp: 'RESEARCH', title: 'A quiet half',
      body: function () { return 'Nothing lands on your desk this half. Quiet halves are when compounding happens.'; },
      opts: [{ l: 'Get back to work', s: function () { return 'Set the desk and run the half.'; }, fx: function () {} }] }
  };
  function barLine(S, g, plus) {
    if (S.pol !== 'ifthen') return 'You published no bar; readiness is ' + Math.round(S.SR + plus) + ' against a Level ' + g.lv + ' bar of ' + g.req + '.';
    return (S.SR + plus >= g.req && S.SL >= g.rsl ? 'The bar you published is met.' : 'The bar you published is not met: this would be a breach.');
  }
  function poachP(S) { return clamp(.3 + (S.gov !== 'corp' ? .25 : 0) + (S.pol === 'ifthen' && !S.breaches ? .2 : 0) + (S.morale - 60) / 100, .1, .9); }
  function dueK(S) { var k = 0; S.owned.forEach(function (w) { if (w.on === S.t + 1) k += w.k; }); return k; }
  function sovDeal(S, amt, cond) {
    var pre = 1.1 * S.FV, capex = amt / 2, k = Math.round(capex * 1000 / (.85 * CAP0 * Math.pow(HW, S.t)));
    dilute(S, 'sov', amt, pre, 'sov');
    S.cash += amt / 2; S.finIn += amt / 2; S.spend.capex += capex;
    S.owned.push({ k: k, capex: capex, on: S.t + 2, built: S.t, sov: true });
    S.trust -= cond ? 1 : (S.gov === 'corp' ? 3 : 6);
    if (!cond && S.SL < 4) S.RPr += 1;
    S.sovDone = true;
    feed(S, 'YOU', 'Took ' + Bn(amt) + ' from the Keelstone Fund at ' + Bn(pre) + ' pre-money; ' + F.n(k) + 'k GPU-equivalents come online in its jurisdiction in two halves.');
  }

  function pickCard(S) {
    var t = S.t, id = null, x = {};
    var ready = S.models.filter(function (m) { return m.st === 'ready' && !m.evald && lvOf(m.fi + (S.think ? 5 : 0)) >= 2; })[0];
    var you = youFI(S), fg = flagship(S);
    if (t === 0) id = 'first';
    else if (S.weekendDue) { id = 'weekend'; S.weekendDue = false; S.weekends++; }
    else if (S.BC == null && S.lowG >= 2 && !S.used.letter) id = 'letter';
    else if (!S.used.openl && (S.brT.indexOf(t - 1) >= 0 || (fg && lvOf(you) >= 3 && S.SR < reqOf(S, lvOf(you)) - 20))) id = 'openl';
    else if (t === S.shockT && !S.used.shock) {
      id = 'shock';
      if (ready) { ready.evald = true; feed(S, 'SAFETY', ready.nm + ' is Level ' + lvOf(ready.fi) + ' and waiting on the Ship tab. Readiness is ' + Math.round(S.SR) + '; the bar is ' + reqOf(S, lvOf(ready.fi)) + '.'); noteQ(S, 'evals', 'the ' + ready.nm + ' evals'); }
    }
    else if (ready) { id = 'eval'; x.id = ready.id; }
    else if (!S.used.leak && S.SL <= 2 && !(S.slP) && you >= 62) id = 'leak';
    else if (!S.used.power && dueK(S) > 0) id = 'power';
    else {
      var W = { mega: [1, 3], poach: [1, 5], bill: [2, 5], sov: [3, 6], rocket: [1, 6], war: [3, 7], bench: [2, 6], result: [2, 6], govt: [2, 7], suit: [1, 5], acq: [4, 6] };
      for (var i = 0; i < S.deck.length && !id; i++) {
        var d = S.deck[i], w = W[d];
        if (S.used[d] || t < w[0] || t > w[1]) continue;
        if (d === 'sov' && (S.FV < 40 || S.sovDone)) continue;
        if (d === 'result' && S.RP < 8) continue;
        if (d === 'acq' && S.gov === 'np') continue;
        id = d;
      }
      if (!id) id = 'quiet';
    }
    var c = CARDS[id];
    if (c.ctx) { var cx = c.ctx(S); for (var k in cx) x[k] = cx[k]; }
    if (id !== 'eval' && id !== 'quiet' && id !== 'weekend') S.used[id] = true;
    S.card = { id: id, x: x, pick: -1, t: t };
    if (id === 'eval') noteQ(S, 'evals', 'the ' + modelBy(S, x.id).nm + ' evals');
    if (id === 'shock') noteQ(S, 'open', 'the open-weights shock');
    if (id === 'shock') noteQ(S, 'pricefall', 'the open-weights shock');
    if (id === 'bill') noteQ(S, 'regthreshold', 'the state bill');
    if (id === 'poach') noteQ(S, 'talent', 'the poach');
    if (id === 'suit') noteQ(S, 'copyright', 'the copyright suit');
    if (id === 'leak') noteQ(S, 'weights', 'the leak attempt');
  }
  function cardOptOk(S, i) {
    var c = CARDS[S.card.id], o = c.opts[i];
    return o && o.ok ? o.ok(S, S.card.x) : '';
  }
  function chooseCard(S, i, force) {
    if (!S.card || S.card.pick >= 0 || S.ph !== 'play') return false;
    var c = CARDS[S.card.id], o = c.opts[i];
    if (!o || cardOptOk(S, i)) return false;
    if (o.gate && !force && o.gate(S, S.card.x)) return { gate: true };
    S.card.pick = i;
    feed(S, 'YOU', c.title + ': ' + o.l + '.');
    var r = o.fx(S, S.card.x, true);
    if (r && r.err) { S.card.pick = -1; return r; }
    if (S.over) { S.ph = 'over'; S.ending = S.over; }
    return true;
  }

  /* ======================= the brief: three or four lines to open each half ======================= */
  function brief(S) {
    var t = S.t, lines = [], h = S.hist[t - 1];
    if (!h) return;
    var top = topFI(S), sb = S.riv[2];
    if (t === S.shockT) lines.push(['PRESS', 'Sable posted open weights within ' + fi1(Math.max(0, top - sb.fi)) + ' points of the frontier, priced at almost nothing.']);
    else {
      var jr = null, ir = null;
      S.riv.forEach(function (r) { if (r.j === t - 1) jr = r; if (r.incT === t - 1) ir = r; });
      if (jr) lines.push(['RIVAL', jr.nm + ' shipped a thinking model; the frontier is now ' + fi1(top) + '.']);
      else if (ir) lines.push(['PRESS', ir.nm + ' reported a serious misuse incident; regulators are asking every lab the same questions.']);
      else if (t === 1) lines.push(['RIVAL', 'Obelisk announced a gigawatt campus; its next model is due in a year. The frontier is ' + fi1(top) + '.']);
      else {
        var mv = S.riv.map(function (r, k) { return [r, r.fi - h.riv[k]]; }).sort(function (a, b) { return b[1] - a[1]; })[0];
        lines.push(['RIVAL', mv[0].nm + ' moved to ' + fi1(mv[0].fi) + '; the frontier is now ' + fi1(top) + '.']);
      }
    }
    var kNow = fleet(S, t).K, kNext = t < 7 ? fleet(S, t + 1).K : 1;
    if (kNow === 0) lines.push(['CFO', 'We have no GPUs under contract this half. Rent spot on the Compute tab or nothing runs: no serving, no training.']);
    else if (kNext === 0) lines.push(['CFO', 'Next half we have no GPUs under contract. Reserve now, or plan to rent spot next half.']);
    var burn = -(h.real - h.c.total), run = burn > 0 ? S.cash / burn : 99;
    if (run < 3) lines.push(['CFO', 'Cash ' + Bn(S.cash) + ', burn ' + Bn(burn) + ' a half: ' + (run < 1 ? 'less than one half' : Math.floor(run) + ' ' + F.plural(Math.floor(run), 'half', 'halves')) + ' of runway. A round takes a half to close in real life and one click here; do not make me need it in the same half.']);
    S.contracts.forEach(function (c) { if (c.end >= t && c.end <= t + 1 && lines.length < 4) lines.push(['CFO', 'Our ' + F.n(c.k) + 'k reserved contract ends after ' + hl(c.end) + '. Renew, replace, or plan to be smaller.']); });
    var nx = S.run ? { fi: FI(S.run.Cp * S.algo, S.run.r) } : S.models.filter(function (m) { return m.st === 'ready'; })[0];
    if (nx && lines.length < 4) {
      var L = lvOf(nx.fi), rq = reqOf(S, L) + jumpOf(S, nx.fi);
      if (L >= 2 && (S.SR < rq || S.SL < LV.sl[L])) lines.push(['SAFETY', 'The next model forecasts at Level ' + L + '. The bar is readiness ' + rq + ' and SL' + LV.sl[L] + '; we are at ' + Math.round(S.SR) + ' and SL' + S.SL + '. At ' + F.pct(S.al.sa) + ' of compute we approach ' + Math.round(Math.min(98, 100 * (1 - Math.exp(-8.6 * S.al.sa * Math.sqrt(S.S / 20)))) * S.srMul) + '.']);
    }
    if (!S.run && lines.length < 4) lines.push(['RESEARCH', 'No run in progress. Every half without one is a half the frontier gets for free.']);
    if (S.al.re < .2 && lines.length < 4) lines.push(['RESEARCH', 'We are spending the seed corn. The recipe for the run after next is being written now, or not at all.']);
    if (h.phi < .95 && lines.length < 4) lines.push(['PRODUCT', 'We turned away ' + F.pct(1 - h.phi) + ' of demand last half. Customers who hit rate limits try someone else.']);
    if (h.real > 0 && h.gm < .4 && lines.length < 4) lines.push(['PRODUCT', 'Inference margin is ' + F.pct(h.gm) + '. Either the model is too big to serve, or we are too far behind to charge for it.']);
    if (top - youFI(S) >= 6 && lines.length < 4) lines.push(['CFO', 'We are ' + fi1(top - youFI(S)) + ' points behind. The price of our tier is falling about ' + F.pct(1 - Math.exp(-3.3 / 8)) + ' a half whether we like it or not.']);
    if (S.BC != null && S.BC < 45 && lines.length < 4) lines.push(['BOARD', 'The board would like to understand how recent decisions fit the mission. They would like to understand it soon.']);
    lines.slice(0, 4).forEach(function (l) { feed(S, l[0], l[1]); });
  }

  /* ======================= apply: every change to S goes through here, so the log replays ======================= */
  function apply(S, a) {
    if (!a || !a.a) return false;
    if (a.a === 'found') return found(S, a.gov, a.pol, a.open);
    if (S.ph !== 'play') return false;
    var t = S.t, hw = Math.pow(HW, t);
    switch (a.a) {
      case 'card': return chooseCard(S, a.i, a.force);
      case 'step':
        if (!S.card || S.card.pick < 0) return false;
        step(S, false); return true;
      case 'alloc':
        S.al = { tr: +a.tr || 0, re: +a.re || 0, sa: +a.sa || 0 }; fixAlloc(S); return true;
      case 'spot': S.spot = clamp(Math.round(+a.k || 0), 0, spotCap(S)); return true;
      case 'reserve':
        if (!(a.k > 0)) return false;
        S.contracts.push({ k: +a.k, p: RES0 * hw, start: t + 1, end: t + 6, src: 'reserved' });
        feed(S, 'YOU', 'Reserved ' + F.n(a.k) + 'k GPU-equivalents for three years from next half, at ' + F.M(RES0 * hw, 2) + ' per thousand per half.');
        noteQ(S, 'takepay', 'a reserved contract'); return true;
      case 'build':
        if (!(a.k > 0) || credOn(S, t) || credOn(S, t + 1)) return false;
        var cx = a.k * CAP0 * hw / 1000;
        if (cx > S.cash) return { err: 'Not enough cash for that campus.' };
        S.cash -= cx; S.oneOff += cx; S.spend.capex += cx; S.owned.push({ k: +a.k, capex: cx, on: t + 2, built: t });
        feed(S, 'YOU', 'Broke ground on a ' + F.n(a.k) + 'k campus: ' + Bn(cx) + ' now, online ' + hl(t + 2) + '.');
        noteQ(S, 'takepay', 'building a campus'); return true;
      case 'run': return startRun(S, +a.lc, +a.r);
      case 'abort':
        if (!S.run) return false;
        feed(S, 'YOU', 'Aborted the run at ' + F.pct(S.run.prog / S.run.Cp) + '. The compute is spent.'); S.run = null; return true;
      case 'launch': return launch(S, a.id, a.mode, !!a.open, !!a.force);
      case 'openw':
        var m = modelBy(S, a.id);
        if (!m || m.open || (m.st !== 'retired' && m.st !== 'internal' && m.st !== 'live')) return false;
        var lvm = lvOf(m.fi);
        if (S.reg >= 2 && lvm >= 3) return { err: 'The law forbids opening the weights of a Level 3 model or above.' };
        if (S.pol === 'ifthen' && lvm >= 3 && S.SR < reqOf(S, lvm) + 20) { if (!a.force) return { gate: true, g: { lv: lvm, req: reqOf(S, lvm) + 20, rsl: 0 }, nm: m.nm, open: true }; breach(S, 'release'); }
        openModel(S, m); return true;
      case 'think':
        if (S.unl.reason == null) return false;
        var fgt = flagship(S);
        if (a.on && fgt && S.pol === 'ifthen') {
          var l0 = lvOf(fgt.fi), l1 = lvOf(fgt.fi + 5);
          if (l1 > l0 && !(S.SR >= reqOf(S, l1) && S.SL >= LV.sl[l1])) { if (!a.force) return { gate: true, g: { lv: l1, req: reqOf(S, l1), rsl: LV.sl[l1] }, nm: 'Thinking mode' }; breach(S, 'switch'); }
        }
        S.think = !!a.on; return true;
      case 'aird':
        if (S.unl.aird == null) return false;
        if (a.on && S.pol === 'ifthen' && !(S.SR >= reqOf(S, 4) && S.SL >= 4)) { if (!a.force) return { gate: true, g: { lv: 4, req: reqOf(S, 4), rsl: 4 }, nm: 'AI-assisted research' }; breach(S, 'switch'); }
        S.aird = !!a.on; return true;
      case 'price': S.p = clamp(Math.round(+a.p * 20) / 20, .5, 2); return true;
      case 'free': if (!FTM[a.v]) return false; S.free = a.v; return true;
      case 'lead': if (!/^(bal|api|con|ent)$/.test(a.v)) return false; S.lead = a.v; return true;
      case 'ent': if (!ENTT[a.v]) return false; S.entTeam = a.v; return true;
      case 'hire': if (!/^(freeze|steady|agg)$/.test(a.v)) return false; if (a.who === 'S') S.hireS = a.v; else S.hireR = a.v; return true;
      case 'raise': return raise(S, a.kind, +a.f);
      case 'sec':
        if (S.slP || S.SL >= 5) return false;
        var to = S.SL + 1, cost = SLCOST[to];
        if (cost > S.cash) return { err: 'Not enough cash for the upgrade.' };
        S.cash -= cost; S.oneOff += cost; S.slP = { to: to, at: t + (to === 5 ? 2 : 1) };
        feed(S, 'YOU', 'Ordered the upgrade to SL' + to + ': ' + Bn(cost) + ', ready ' + hl(S.slP.at) + '.');
        noteQ(S, 'weights', 'a security upgrade'); return true;
      case 'publish':
        if (S.pol === 'ifthen' || S.polNext) return false;
        S.polNext = 'ifthen'; S.trust += 4; S.trustBase += 3;
        feed(S, 'YOU', 'Published an if-then scaling policy. The gates apply from next half.'); return true;
      case 'amend':
        if (S.pol !== 'ifthen' || S.amended) return false;
        S.amended = true; S.amendT = t; S.trust -= 6; S.morale -= 6; if (S.BC != null) S.BC -= 10;
        feed(S, 'YOU', 'Amended the policy: the readiness bars at Levels 3 and 4 drop by 10.'); return true;
      case 'recap':
        if (S.gov !== 'np' || S.recap || t < 3 || t < S.recapT + 2) return false;
        var pr = .7 + (S.breaches ? 0 : .2) - (S.inc.severe ? .3 : 0);
        S.cash -= .2; S.oneOff += .2; S.recap = { at: t + 1, ok: rcard(S) < pr };
        feed(S, 'YOU', 'Filed to recapitalize as a public benefit corporation under nonprofit control. It resolves next half.'); return true;
      case 'reinc':
        if (S.gov !== 'corp' || S.pbcConv) return false;
        S.cash -= .05; S.oneOff += .05; S.pbcConv = true; S.chF = .95; S.trustBase += 3; S.FV *= .97;
        feed(S, 'YOU', 'Reincorporated as a public benefit corporation. Directors now owe a duty to the stated benefit as well as to shareholders.'); return true;
    }
    return false;
  }
  /* growth rounds price off fair value, discounted for a heavy cost base and for coming back too soon, and leads stop at 35% dilution a year */
  function spendX(S) { var h = S.hist[S.hist.length - 1]; return h ? h.c.total / Math.max(.1, h.real) : 1; }
  function dilYear(S, t) { var keep = 1; S.rounds.forEach(function (r) { if (Math.floor(r.t / 2) === Math.floor(t / 2) && /^(growth|strat|sov)$/.test(r.kind)) keep *= 1 - r.d; }); return 1 - keep; }
  function growthTerms(S) {
    var t = S.t, gap = topFI(S) - youFI(S), sx = spendX(S), mul = sx > SXD ? clamp(SXD / sx, .5, 1) : 1, back = S.raisedT >= 0 && S.raisedT === t - 1 ? BACK : 1, dy = dilYear(S, t);
    var pre = S.FV * ((S.lastGM || 0) < 0 ? .8 : 1) * (S.trust < 40 ? .9 : 1) * S.nextMul * mul * back, room = Math.max(0, 1 - (1 - DILCAP) / (1 - dy));
    var err = S.raisedT === t ? 'One round a half.' : S.trust < 30 || gap > 12 ? 'No lead will price this round: trust below 30 or more than 12 points behind.' :
      sx > SXR ? 'No lead will price a round at this burn: last half cost ' + F.x(sx, 1) + ' its revenue, and leads stop at ' + F.x(SXR, 0) + '.' :
      room < .05 - 1e-9 ? 'Leads stop at ' + F.pct(DILCAP) + ' dilution a year, and you have sold ' + F.pct(dy) + ' of the company this year.' + (2 * Math.floor(t / 2) + 2 <= 7 ? ' The next year opens ' + hl(2 * Math.floor(t / 2) + 2) + '.' : '') : null;
    return { pre: pre, sx: sx, mul: mul, back: back, dy: dy, room: room, max: Math.min(S.rcap, room), err: err };
  }
  function raise(S, kind, f) {
    var t = S.t;
    if (S.raisedT === t) return { err: 'One round a half.' };
    if (kind === 'growth') {
      var gt = growthTerms(S);
      if (gt.err) return { err: gt.err };
      if (!(f >= .05 && f <= gt.max + 1e-9)) return f > gt.room + 1e-9 && f <= S.rcap + 1e-9 ? { err: 'That would take dilution this year past ' + F.pct(DILCAP) + '. The most you can sell now is ' + F.pct(gt.room) + '.' } : false;
      var pre = gt.pre, amt = pre * f / (1 - f);
      var post = dilute(S, 'inv', amt, pre, 'growth');
      S.nextMul = 1; S.cash += amt; S.finIn += amt;
      if (post > S.lastPost) S.morale = Math.min(95, S.morale + 4);
      S.lastPost = post;
      feed(S, 'YOU', 'Fallowfield Growth led a ' + Bn(amt) + ' round at ' + Bn(post) + ' post-money. You sold ' + F.pct(f) + '.');
    } else if (kind === 'strat') {
      if (!(f >= .1 && f <= .3 + 1e-9)) return false;
      var amt2 = f * S.FV, pre2 = .85 * S.FV, k = Math.round(amt2 * 1000 / (4 * CREDIT * Math.pow(HW, t))), was = credOn(S, t) ? S.credits.k : 0;
      dilute(S, 'strat', amt2, pre2, 'strat');
      S.credits = { k: was + k, start: t, end: t + 3 }; S.lastPost = pre2 + amt2;
      feed(S, 'YOU', 'Took ' + Bn(amt2) + ' of Skyloft credits for equity at ' + Bn(pre2) + ' pre-money: ' + F.n(k) + 'k GPU-equivalents a half for four halves, exclusive.');
    } else if (kind === 'sov') {
      if (S.sovDone || S.FV < 60) return { err: 'The Keelstone Fund talks to labs worth $60B or more.' };
      if (!(f >= .1 && f <= .25 + 1e-9)) return false;
      sovDeal(S, f * S.FV);
    } else return false;
    S.raisedT = t;
    noteQ(S, 'runrate', 'your first round');
    return true;
  }

  /* ======================= endings ======================= */
  var END = {
    shutdown: ['The shutdown', function () { return 'Regulators suspended your frontier deployment after a severe incident at Level 4. Whatever else this lab built, this is the sentence it will be remembered by. The model was ready before the lab was.'; }],
    fire: ['The fire sale', function () { return 'The compute bills arrived on schedule; the next round did not. Obelisk’s parent bought the team and the weights for less than the contracts you signed. Take-or-pay means exactly what it says.'; }],
    weekend: ['The weekend', function () { return 'Your board removed you, and it held. The structure you chose did the job it was built for; you were on the wrong side of it.'; }],
    exit: ['The exit', function (S) { return 'You sold to Obelisk’s parent at ' + F.x(S.exitX || 1.3, 2) + ' fair value, ' + Bn(S.exitV || 0) + '. Your investors are pleased and your models now ship under someone else’s name. It is a real outcome, and it ends the experiment early.'; }],
    sub: ['The subsidiary', function (S) { return 'Skyloft now owns ' + F.pct(S.cap.strat) + ' of you. You still run the lab; you no longer decide what it is for. Compute for equity is cheap until the equity is the company.'; }],
    receipts: ['The frontier, with receipts', function () { return 'You finished at the frontier without breaking a published commitment or causing a severe incident. It cost you launches you wanted and money you needed. This is the rare ending, by design.'; }],
    asterisk: ['The race won, with an asterisk', function (S) {
      var a = S.inc.severe ? 'caused a severe incident' : S.breaches ? 'broke ' + S.breaches + ' published ' + F.plural(S.breaches, 'commitment') : S.inc.serious > 1 ? 'caused ' + S.inc.serious + ' serious incidents' :
        S.pol === 'none' ? 'got there without publishing a single commitment anyone could hold you to' : 'got there on principles with no thresholds, so no one can say which lines you did not cross';
      return 'You finished at the frontier. You also ' + a + '. The scoreboard shows the first half of that sentence; everyone who matters remembers the second.'; }],
    second: ['The trusted second', function (S) { return 'Not the most capable lab: the one enterprises trusted with the keys. You finished ' + fi1(topFI(S) - youFI(S)) + ' points behind the frontier with your commitments intact and a real margin. Plenty of empires were second.'; }],
    insurgent: ['The insurgent', function (S) { return 'You opened ' + S.openCount + ' models and turned the frontier into a commodity for everyone else. Your ecosystem is enormous; your revenue is not. Whether that was strategy or generosity depends on what you open next.'; }],
    careful: ['The careful lab that fell behind', function (S) { return 'You kept every commitment and finished ' + fi1(topFI(S) - youFI(S)) + ' points behind. Safety the market cannot see does not pay for itself, and the next round will ask what you are for.'; }],
    utility: ['The utility', function () { return 'You run a profitable model business a generation behind the frontier: real margins, real customers, and no seat at the table where the next threshold gets decided.'; }],
    survivor: ['The survivor', function () { return 'You are still here, which in this industry is not nothing. The debrief below shows where four years went.'; }]
  };
  var SPK = { SAFETY: 'lk-chip--safety', 'FIELD NOTE': 'lk-chip--foil', YOU: 'fr-chip-you' };
  var CHOICES = {
    gov: [['np', 'Nonprofit in control, capped profit beneath it', 'A nonprofit board controls the company and investor returns are capped. The strongest mission lock and the hardest fundraising (valuations at 0.75×, rounds capped at 15%). The board can remove you.'],
      ['pbc', 'Public benefit corporation with an independent trust', 'Directors must weigh a public benefit alongside shareholders, and an independent trust elects a growing share of the board, a majority from Year 3. Near-normal fundraising; broken promises get expensive later.'],
      ['corp', 'Ordinary Delaware corporation', 'The fastest money and the fewest constraints. Nobody can remove you for mission drift; your investors can make slow growth very uncomfortable. You start with less public trust.']],
    pol: [['ifthen', 'Publish an if-then scaling policy', 'At each risk level you will not launch until readiness and weight security meet the bar. Trust rises and safety-minded researchers stay. The policy will bind at the worst possible moment; that is what it is for.'],
      ['prin', 'Publish principles, not thresholds', 'Say what you value without saying what you will not do. No gates. Incidents cost more trust, because you said you cared.'],
      ['none', 'Say nothing', 'No promises to break. Less trust, no gates, and regulators notice every high-risk launch.']],
    open: [['reserve', 'Reserve 40,000 more GPUs for three years', '$9.0M per thousand per half from next half, take-or-pay. The cheapest reliable capacity, locked at today’s price while hardware gets about 12% cheaper every half.'],
      ['spot', 'Stay flexible', 'Rent by the half at $14.0M per thousand, falling about 12% a half, up to twice your fleet each half. Costs more; commits nothing. When the 40,000-GPU contract ends, everything you run is rented.'],
      ['strategic', 'Take Skyloft Cloud’s deal', '60,000 GPU-equivalents of credits for three years in exchange for 18% of the company, an exclusive training relationship (no campus of your own while it lasts), and a place in their marketplace. Compute today; a partner on your cap table forever.']]
  };
  var POLN = { ifthen: 'If-then scaling policy', prin: 'Principles, not thresholds', none: 'No public commitments' };
  function govName(S) { return S.pbcConv ? 'Public benefit corporation (converted)' : { np: 'Nonprofit in control, capped profit', pbc: 'Public benefit corporation', corp: 'Delaware corporation' }[S.gov] || ''; }

  /* ======================= the hall in 3D (frontier-hall): power, halls, models. It only reads S ======================= */
  var RW = .12, RH = .28, RD = 1.1, RP = .22, DEP = 2 * RD + .9, YS = .06, X0 = 2.9, GAP = .7, LVT = [60, 72, 84];
  /* role: [ink tint, line colour, line alpha, width, dash, face alpha] */
  var ROLE = { tr: [.62, 0, 1, 1, 0, 1], re: [0, 3, 1, 1.25, 0, 1], sa: [.3, 1, .9, 1, 0, 1], sv: [0, 1, .8, 1, 0, 1], id: [0, 1, .5, .75, 0, .35] };
  var USE = { tr: 'Training', re: 'Research', sa: 'Safety', sv: 'Serving', id: 'Idle' };
  var EXP = { own: [0, 0, 0], res: [0, 1.1, 0], rent: [0, 2.2, 0] };
  function hgt(fi) { return Math.max(.3, .3 + (fi - 45) * .055); }
  function facets(fi) { return clamp(Math.round(3 + (fi - 40) / 4), 4, 16); }
  function kGPU(k) { return F.n(Math.round(k * 1000)) + ' GPUs'; }
  function rowAt(h, j) { return [-h.len / 2 + .25 + ((j >> 1) + .5) * RP, j & 1 ? -(RD / 2 + .45) : RD / 2 + .45]; }
  function hallName(h) { return { Anvil: 'Anvil Silicon hall', own: 'Your campus', keel: 'Keelstone campus', cred: 'Skyloft hall', spot: 'Spot hall' }[h.src] || 'Reserved hall'; }
  function statusOf(h) { return h.pv ? 'if you choose it' : h.src === 'spot' ? 'this half' : h.fut ? (h.kind === 'own' ? 'online ' : 'from ') + hl(h.from) : h.kind === 'own' ? 'owned' : 'to ' + hl(h.to); }
  function hallWhy(h) {
    if (h.pv) return h.kind === 'res' ? '40,000 more GPUs from ' + hl(1) + ' for three years, take-or-pay.' : '60,000 GPU-equivalents of credits for 18% of the company.';
    if (h.kind === 'own') return h.fut ? 'Under construction: ' + Bn(h.cap) + ' spent, online ' + hl(h.from) + '.' : 'Owned. It cost ' + Bn(h.cap) + ' to build and costs ' + F.M(OPEX, 2) + ' per thousand a half to run.';
    if (h.src === 'spot') return 'Rented for this half only, at ' + F.M(h.cost, 2) + ' per thousand. Nothing is committed after it.';
    if (h.src === 'cred') return 'Paid for in equity and exclusive through ' + hl(h.to) + ': no campus of your own until then.';
    return (h.fut ? 'Signed. It opens ' + hl(h.from) + '. ' : '') + 'Take-or-pay through ' + hl(h.to) + ' at ' + F.M(h.cost, 2) + ' per thousand a half. You pay for every row, busy or idle.';
  }
  function rowWhy(h, r, U) {
    var c = F.M(U * h.cost, 2);
    if (r === 'id' && h.kind !== 'rent') return 'Idle this half. The contract is take-or-pay, so it still costs ' + c + '.';
    return USE[r] + ' this half. ' + (h.kind === 'own' ? 'Owned: ' + F.M(U * OPEX, 2) + ' a half to run.' : h.src === 'spot' ? 'Rented on spot: ' + c + '.' :
      h.src === 'cred' ? 'Skyloft credits, paid in equity: worth ' + c + ' a half.' : 'Reserved through ' + hl(h.to) + ': ' + c + ' a half.');
  }
  function wallWhy(w) {
    var bar = 'readiness ' + w.req + ' and SL' + w.sl;
    return (w.pol === 'ifthen' ? 'Your published bar: ' + bar + '.' : w.pol ? 'You published no threshold here. Readiness ' + w.req + ' and SL' + w.sl + ' still set the incident odds.' :
      'Level ' + w.L + ' begins at FI ' + w.T + '. Your safety posture decides whether this line is public.') + (w.br ? ' A model launched past it without them, so the wall is drawn broken.' : '');
  }
  function hallParams(S, ui, wrap) {
    var su = S.ph === 'setup', tt = S.ph === 'over' && S.hist.length ? S.hist[S.hist.length - 1].t : S.t, hw = Math.pow(HW, tt), H = [], all = 0, run = 0;
    function add(id, kind, src, k, from, to, cost, cap, pv) {
      var h = { id: id, kind: kind, src: src, k: k, from: from, to: to, cost: cost, cap: cap || 0, pv: !!pv, fut: !!pv || from > tt };
      H.push(h); all += k; if (!h.fut) run += k;
    }
    S.contracts.forEach(function (c, j) { if (c.end >= tt) add('c' + j, 'res', c.src, c.k, c.start, c.end, c.p); });
    S.owned.forEach(function (w, j) { add('w' + j, 'own', w.sov ? 'keel' : 'own', w.k, w.on, 99, OPEX, w.capex); });
    if (S.credits.k > 0 && S.credits.end >= tt) add('cr', 'rent', 'cred', S.credits.k, S.credits.start, S.credits.end, CREDIT * hw);
    if (S.spot > 0 && S.ph === 'play') add('sp', 'rent', 'spot', S.spot, tt, tt, SPOT0 * hw);
    if (su && ui.setup.open === 'reserve') add('pv', 'res', 'opening', 40, 1, 6, 9, 0, 1);
    if (su && ui.setup.open === 'strategic') add('pv', 'rent', 'cred', 60, 0, 5, CREDIT, 0, 1);
    var U = [1, 2, 2.5, 5, 10, 20, 50].filter(function (u) { return all / u <= 96; })[0] || 100, tot = -GAP, x = X0, s = 0, xm = X0, rows = [];
    H.forEach(function (h) { h.n = Math.max(1, Math.round(h.k / U)); h.len = Math.ceil(h.n / 2) * RP + .5; tot += h.len + GAP; });
    var ns = Math.min(wrap, H.length), per = ns > 1 ? tot / ns : 1e9;
    H.forEach(function (h) {
      if (x > X0 && x - X0 + h.len / 2 > per && s < ns - 1) { s++; x = X0; }
      h.cx = x + h.len / 2; h.cz = -s * (DEP + 1.6); x += h.len + GAP; xm = Math.max(xm, x - GAP);
      for (var j = 0; !h.fut && j < h.n; j++) rows.push({ id: h.id + 'r' + j, h: h, p: rowAt(h, j) });
    });
    rows.sort(function (a, b) { return (a.h.cx + a.p[0]) - (b.h.cx + b.p[0]) || b.p[1] - a.p[1]; });
    var N = rows.length, al = S.al, n1 = Math.round(al.tr * N), n2 = Math.min(N - n1, Math.round(al.re * N)), n3 = Math.min(N - n1 - n2, Math.round(al.sa * N));
    var p = S.ph === 'play' ? ui.pre : null, nid = p ? Math.min(N - n1 - n2 - n3, Math.round(Math.max(0, p.kS - p.need) / U)) : 0, roles = {};
    rows.forEach(function (r, i) { roles[r.id] = i < n1 ? 'tr' : i < n1 + n2 ? 're' : i < n1 + n2 + n3 ? 'sa' : i >= N - nid ? 'id' : 'sv'; });
    var fg = flagship(S), you = youFI(S), B = null, nx;
    if (S.run && S.ph === 'play') { var rn = S.run; B = { id: 'run', nm: 'Alder ' + (S.models.length + 1), fi: FI(rn.Cp * rn.a0 * Math.pow(S.algo / rn.a0, .3), rn.r), prog: rn.prog / rn.Cp }; }
    else if ((nx = S.models.filter(function (m) { return /^(ready|internal|review)$/.test(m.st); }).pop())) B = { id: 'm' + nx.id, nm: nx.nm, fi: nx.fi, st: nx.st };
    var pol = su ? ui.setup.pol || null : S.pol, near = Math.max(you, B ? B.fi : 0);
    return {
      halls: H, unit: U, run: run, px: xm + 2.3, pz: -s * (DEP + 1.6) / 2, pf: clamp(run / 100, .35, 3), su: su, t: tt, you: you, top: topFI(S), B: B,
      A: fg ? { id: 'm' + fg.id, nm: fg.nm, fi: you, think: S.think } : null, riv: S.riv.map(function (r) { return { nm: r.nm, fi: r.fi }; }),
      walls: [2, 3, 4].map(function (L) {
        var T2 = LVT[L - 2], br = S.launches.some(function (l) { return l.lv === L && !l.met; });
        return { L: L, T: T2, br: br, pol: pol, req: reqOf(S, L), sl: LV.sl[L], up: br || near >= T2 - 6 || S.launches.some(function (l) { return l.lv >= L; }) };
      }),
      roles: roles, order: rows.map(function (r) { return r.id; })
    };
  }
  function hallBuild(B, P) {
    var parts = [], M2 = Math, f = M2.sqrt(P.pf), px = P.px, pz = P.pz, fan = [], ix;
    function gem(r, h, n, mat) {
      var pts = [], out = [], i, y1 = h * .78;
      for (i = 0; i < n; i++) { var a = (i + .5) / n * 2 * M2.PI; pts.push([r * M2.cos(a), r * M2.sin(a)]); }
      out.push(B.prism(pts, 0, y1, { mat: mat, caps: false }));
      for (i = 0; i < n; i++) {
        var p = pts[i], q2 = pts[(i + 1) % n];
        out.push(B.poly([[p[0], y1, p[1]], [q2[0], y1, q2[1]], [0, h, 0]], { mat: mat, edges: false }), B.lines([p[0], y1, p[1], 0, h, 0], { mat: mat, n: B.v3.norm([p[0], r * .5, p[1]]) }));
      }
      return out;
    }
    for (ix = 0; ix < 6; ix++) fan.push(B.cyl([(ix % 3 - 1) * .62, 0, ix < 3 ? .3 : -.3], .17, .05, { mat: 'fan', seg: 16 }));
    parts.push(B.part('sub', { n: 9, name: 'Substation', fig: kGPU(P.run), why: 'Power for the whole fleet. It grows with every row you rent, reserve or build.', pos: [1.2, 0, .85], layer: -1, data: { pw: 1 } },
      [B.box(0, 0, 0, 2, .04, 1.3, { mat: 'floor' }), B.box(0, .04, 0, 2, .26, 1.3, { mat: 'frame', faces: false, dash: 3, open: '+y-y' })],
      [B.part('subx', { scl: [1, f, 1] }, [-.6, 0, .6].map(function (x) { return B.box(x, .04, 0, .34, .42, .5, { mat: 'plant' }); }))]));
    parts.push(B.part('cool', { n: 10, name: 'Cooling plant', fig: kGPU(P.run), why: 'Every watt the racks draw comes back as heat. It grows with the fleet.', pos: [1.2, 0, -1.05] }, [],
      [B.part('coolx', { scl: [1, f, 1] }, [B.box(0, 0, 0, 2, .5, 1.3, { mat: 'plant' })]), B.part('fans', { pos: [0, .5 * f, 0] }, fan)]));
    P.halls.forEach(function (h, k) {
      var rows = [], gh = h.fut;
      for (var j = 0; j < h.n; j++) {
        var q = rowAt(h, j);
        rows.push(B.part(h.id + 'r' + j, gh ? { pick: false } : { name: 'Row ' + (j + 1) + ', ' + hallName(h), fig: kGPU(P.unit), mat: 'row', data: { h: h, x: q[0], z: q[1] } },
          [B.box(q[0], YS, q[1], RW, RH, RD, gh ? { mat: 'ghost', lineA: .32, dash: 0 } : null)]));
      }
      rows.push(B.part(null, { pick: false }, [B.box(-h.len / 2 + .5, YS, DEP / 2 - .12, .6, .02, .12, { mat: gh ? 'ghost' : 'paper' })]));
      parts.push(B.part(h.id, { n: 11 + k, name: hallName(h), fig: kGPU(h.k), why: hallWhy(h), pos: [h.cx, 0, h.cz], layer: -1, explode: EXP[h.kind], data: { hall: h } },
        [B.box(0, 0, 0, h.len, YS, DEP, { mat: gh ? 'ghost' : h.kind === 'own' ? 'slabO' : 'slab', dash: h.kind === 'rent' ? 3 : 0 })], rows));
    });
    parts.push(B.part('plinth', { pick: false, layer: -1, pos: [px, 0, pz] }, [B.box(0, 0, 0, 2.7, .12, 2.7, { mat: 'floor' })]));
    P.walls.forEach(function (w, i) {
      var s = 1.3 + i * .45, z = s / 2, hh = hgt(w.T), sh = [B.box(0, 0, 0, s, hh, s, { mat: w.pol === 'ifthen' ? 'glass' : 'glassD', open: w.br ? '+y+z' : '+y' })];
      if (w.br) sh.push(B.lines([-z, hh * .62, z, -s / 5, hh * .38, z, -s / 5, hh * .38, z, .05, hh * .58, z, .05, hh * .58, z, s / 4, hh * .3, z, s / 4, hh * .3, z, z, hh * .5, z,
        -.1, .01, z + .05, .12, .01, z + .12, .12, .01, z + .12, .02, .01, z + .18, .3, .01, z + .06, .44, .01, z + .14], { mat: 'you', w: 1 }));
      parts.push(B.part('L' + w.L, { n: 6 + i, name: 'Risk level ' + w.L, fig: 'FI ' + w.T, why: wallWhy(w), pos: [px, .12, pz], scl: [1, w.up ? 1 : .02, 1], data: { wall: w } }, sh));
    });
    function cry(c, slot) {
      var h = hgt(c.fi), n = facets(c.fi), lv = lvOf(c.fi), st = { ready: 'ready', internal: 'kept internal', review: 'in review' }[c.st], o = { n: slot, pos: [px + (slot - 1.5) * .64, .12, pz + (slot - 1.5) * .2] };
      if (c.prog != null) return B.part(c.id, ext(o, { name: c.nm + ', in training', fig: F.pct(c.prog) + ' trained', why: 'Forecast FI ' + fi1(c.fi) + ' ±2, Level ' + lv + '. The dashed outline is the forecast; the solid crystal is how far the run has come.' }),
        gem(.28, h, n, 'ghost'), [B.part(c.id + 'x', { scl: [1, M2.max(.02, c.prog), 1], data: { ch: h } }, gem(.28, h, n, 'next'))]);
      return B.part(c.id, ext(o, { name: c.nm + ', ' + (st || 'in service'), fig: 'FI ' + fi1(c.fi) + ' · Level ' + lv, data: { ch: h },
        why: (st ? 'Trained and waiting on the Ship tab.' : 'Your model in service' + (c.think ? ', counting +5 for thinking mode' : '') + '.') + ' Facets follow the Frontier Index: ' + n + ' at ' + fi1(c.fi) + '.' }), gem(.28, h, n, slot === 1 ? 'you' : 'next'));
    }
    if (P.A) parts.push(cry(P.A, 1));
    if (P.B) parts.push(cry(P.B, 2));
    P.riv.forEach(function (r, i) {
      var d = r.fi - P.you;
      parts.push(B.part('rv' + i, { n: 3 + i, name: r.nm, fig: 'FI ' + fi1(r.fi), pos: [px + (i - .4) * 1.9, 0, pz - 2.6],
        why: (r.fi >= P.top - 1e-9 ? 'The frontier: the tallest crystal on the board. ' : 'A rival lab. ') + (P.you ? fi1(M2.abs(d)) + ' points ' + (d >= 0 ? 'ahead of' : 'behind') + ' your model in service.' : '') },
        [B.box(0, 0, 0, .62, .07, .62, { mat: 'floor' })], [B.part('rv' + i + 'x', { pos: [0, .07, 0], data: { ch: hgt(r.fi) } }, gem(.24, hgt(r.fi), facets(r.fi), 'rival'))]));
    });
    return parts;
  }
  function ext(a, b) { for (var k in b) a[k] = b[k]; return a; }
  /* the hall stands in the room's espresso light: racks and plant in metal, floors in plaster, the risk walls and the run in
     training in glass, and the one live thing, your model in service, in foil. Shadows on; the floor reflection stays the Window's */
  var HMG = 1.18;
  var HALL = {
    v: 1, title: 'The data hall', camera: 'ortho', margin: HMG, views: {}, build: hallBuild,
    mats: {
      row: { kind: 'metal', face: 'card', line: 'ink2', lineA: .8 }, slab: { kind: 'plaster', face: 'card', line: 'ink2', lineA: .55 },
      slabO: { kind: 'plaster', face: 'card', line: 'ink', lineA: .8 }, frame: { face: 'none', line: 'ink2', lineA: .5, w: .75 },
      plant: { kind: 'metal', face: 'card', line: 'ink2', lineA: .85 }, fan: { kind: 'ink', face: 'ink', line: 'ink2', lineA: .5 },
      floor: { kind: 'plaster', face: 'card', line: 'ink2', lineA: .45 },
      glassD: { kind: 'glass', face: 'paper', faceA: .06, line: 'ink2', lineA: .6, dash: 3 }, you: { kind: 'foil', face: 'accent', line: 'accent', w: 1.25 },
      next: { kind: 'glass', face: 'paper', faceA: .1, line: 'ink' }, rival: { kind: 'metal', face: 'card', line: 'ink2', lineA: .9 }
    }
  };
  /* the hall's first frame: posters drawn by PS3D.debug.poster at the charter's rest pose (world 1956), one for the wide stage
     (9:4, yaw 38) and one for the narrow (4:3, yaw 58), coordinates rounded to whole units. They are not registered
     (data-reg="0"): the GL frame lights the training rows the poster leaves in plain metal, so the handoff fades over 120ms */
  var POSTER = {
    w: '<svg xmlns="http://www.w3.org/2000/svg" class="ps3d-poster" data-reg="0" data-v="2" data-tone="dark" viewBox="0 0 1080 480" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><style>.ps3d-poster[data-v="2"] .p-top{fill:var(--m-top,color-mix(in srgb,var(--paper) 55%,#fff))}.ps3d-poster[data-v="2"] .p-left{fill:var(--m-left,color-mix(in srgb,var(--paper) 88.5%,#74654A))}.ps3d-poster[data-v="2"] .p-right{fill:var(--m-right,color-mix(in srgb,var(--paper) 70%,#74654A))}.ps3d-poster[data-v="2"] .p-plaster{fill:var(--m-plaster,color-mix(in srgb,var(--paper) 94%,var(--ink)))}.ps3d-poster[data-v="2"] .p-foil{fill:var(--m-foil,var(--accent))}.ps3d-poster[data-v="2"] .p-metal{fill:var(--m-metal-hi,color-mix(in srgb,var(--muted) 45%,var(--paper)))}.ps3d-poster[data-v="2"] .p-metal.p-lo{fill:var(--m-metal-lo,color-mix(in srgb,var(--muted) 70%,var(--ink)))}.ps3d-poster[data-v="2"] .p-inkf{fill:var(--ink)}.ps3d-poster[data-v="2"] .p-inkc{fill:var(--ink)}.ps3d-poster[data-v="2"] .p-glass{fill:var(--ink-2)}.ps3d-poster[data-v="2"] .p-shadow{fill:var(--m-shadow,var(--ink));stroke:none}.ps3d-poster[data-v="2"] :is(.p-sil,.p-line,.p-line2,.p-fl){fill:none;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.ps3d-poster[data-v="2"] .p-sil{stroke:var(--m-sil,var(--ink))}.ps3d-poster[data-v="2"] .p-line{stroke:var(--ink)}.ps3d-poster[data-v="2"] .p-line2{stroke:var(--ink-2)}.ps3d-poster[data-v="2"] .p-fl{stroke:var(--foil-line)}.ps3d-poster[data-v="2"] .p-plate{filter:grayscale(1) sepia(.22) contrast(1.08) brightness(1.02)}.ps3d-poster[data-v="2"] .p-plate.is-dev{filter:none}.ps3d-poster[data-v="2"] .p-txt{fill:var(--ink)}.ps3d-poster[data-v="2"] .p-txt2{fill:var(--ink-2)}:is(:root[data-tone="dark"],.tone-dark,.band--dark,[data-ground="espresso"],[data-ground="forest"],[data-ground="slate"]) .ps3d-poster[data-v="2"] .p-top,.ps3d-poster[data-v="2"][data-tone="dark"] .p-top{fill:var(--m-top,color-mix(in srgb,var(--dark) 80%,var(--on-dark)))}:is(:root[data-tone="dark"],.tone-dark,.band--dark,[data-ground="espresso"],[data-ground="forest"],[data-ground="slate"]) .ps3d-poster[data-v="2"] .p-left,.ps3d-poster[data-v="2"][data-tone="dark"] .p-left{fill:var(--m-left,color-mix(in srgb,var(--dark) 87%,var(--on-dark)))}:is(:root[data-tone="dark"],.tone-dark,.band--dark,[data-ground="espresso"],[data-ground="forest"],[data-ground="slate"]) .ps3d-poster[data-v="2"] .p-right,.ps3d-poster[data-v="2"][data-tone="dark"] .p-right{fill:var(--m-right,color-mix(in srgb,var(--dark) 92%,var(--on-dark)))}:is(:root[data-tone="dark"],.tone-dark,.band--dark,[data-ground="espresso"],[data-ground="forest"],[data-ground="slate"]) .ps3d-poster[data-v="2"] .p-plaster,.ps3d-poster[data-v="2"][data-tone="dark"] .p-plaster{fill:var(--m-plaster,color-mix(in srgb,var(--dark) 95%,var(--on-dark)))}.ps3d-poster[data-v="2"][data-tone="dark"] .p-sil{stroke:var(--m-sil,var(--on-dark))}.ps3d-poster[data-v="2"][data-tone="dark"] .p-line{stroke:var(--on-dark)}.ps3d-poster[data-v="2"][data-tone="dark"] .p-line2{stroke:var(--on-dark-2)}.ps3d-poster[data-v="2"][data-tone="dark"] .p-shadow{fill:#000}.ps3d-poster[data-v="2"][data-tone="dark"] .p-inkf{fill:color-mix(in srgb,var(--dark) 93%,var(--on-dark))}.ps3d-poster[data-v="2"][data-tone="dark"] .p-inkc{fill:var(--on-dark)}.ps3d-poster[data-v="2"][data-tone="dark"] .p-glass{fill:var(--on-dark)}</style><defs><clipPath id="p17fmc0"><path d="M219 40L329 91L273 132L164 82Z"/></clipPath><clipPath id="p17fmc1"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc2"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc3"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc4"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc5"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc6"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc7"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc8"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc9"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc10"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc11"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc12"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc13"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc14"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc15"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc16"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc17"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc18"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc19"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc20"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc21"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc22"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc23"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc24"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc25"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc26"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc27"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc28"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc29"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc30"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc31"><path d="M755 237L789 253L763 273L729 257Z"/></clipPath><clipPath id="p17fmc32"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc33"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc34"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc35"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc36"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc37"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc38"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc39"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc40"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc41"><path d="M860 285L894 301L867 321L833 305Z"/></clipPath><clipPath id="p17fmc42"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc43"><path d="M361 128L630 251L497 351L228 227Z"/></clipPath><clipPath id="p17fmc44"><path d="M964 333L998 349L971 369L937 353Z"/></clipPath><clipPath id="p17fmc45"><path d="M673 278L821 346L706 433L558 365Z"/></clipPath><clipPath id="p17fmk"><path d="M361 127L630 251L497 351L228 227Z"/></clipPath><filter id="p17fmb1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1"/></filter><filter id="p17fmb2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter><filter id="p17fmb3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter><filter id="p17fmb4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter><filter id="p17fmb5" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter><filter id="p17fmb8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter><filter id="p17fmb9" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter><filter id="p17fmb10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter></defs><g data-part="sub" style="--i:0"><path class="p-plaster" d="M82 159L192 209L248 168L138 117Z"/><path class="p-right" d="M82 161L192 212L192 209L82 159ZM192 212L248 170L248 168L192 209Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.27" d="M192 212L248 170M248 170L248 168M192 212L82 161"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.12" d="M248 168L192 209M82 159L192 209"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.13" d="M192 209L192 212"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.26" d="M82 161L82 159M82 159L138 117M248 168L138 117"/><path class="p-line2" stroke-width="0.64" stroke-opacity="0.36" stroke-dasharray="3 3" d="M192 209L248 168M248 153L192 195M82 159L192 209M192 195L82 144"/><path class="p-line2" stroke-width="0.64" stroke-opacity="0.35" stroke-dasharray="3 3" d="M248 168L248 153M82 159L82 144"/><path class="p-line2" stroke-width="0.64" stroke-opacity="0.37" stroke-dasharray="3 3" d="M192 195L192 209"/><path class="p-line2" stroke-width="0.64" stroke-opacity="0.34" stroke-dasharray="3 3" d="M138 117L82 159M82 144L138 102M248 168L138 117M138 102L248 153"/><path class="p-line2" stroke-width="0.64" stroke-opacity="0.33" stroke-dasharray="3 3" d="M138 102L138 117"/><path class="p-metal" d="M112 138L131 146L152 130L134 122ZM145 153L164 162L185 145L166 137ZM178 168L196 177L218 160L199 152Z"/><path class="p-metal p-lo" d="M131 161L152 145L152 130L131 146ZM112 153L131 161L131 146L112 138ZM164 176L185 160L185 145L164 162ZM145 168L164 176L164 162L145 153ZM196 192L218 175L218 160L196 177ZM178 183L196 192L196 177L178 168Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.50" d="M131 161L152 145M112 153L112 138M112 138L134 122M131 161L112 153M185 160L185 145M185 145L166 137"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.49" d="M152 145L152 130M152 130L134 122"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.22" d="M152 130L131 146"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.23" d="M131 146L131 161M112 138L131 146M185 145L164 162M164 162L164 176M145 153L164 162M218 160L196 177M196 177L196 192M178 168L196 177"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.51" d="M164 176L185 160M145 168L145 153M145 153L166 137M164 176L145 168M218 175L218 160M218 160L199 152"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.52" d="M196 192L218 175M178 183L178 168M178 168L199 152M196 192L178 183"/></g><g data-part="c0" style="--i:1"><g clip-path="url(#p17fmc1)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M382 135L390 139L342 175L334 172Z"/></g><g clip-path="url(#p17fmc2)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M394 141L402 144L354 181L346 177Z"/></g><g clip-path="url(#p17fmc3)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M406 146L414 150L366 186L358 183Z"/></g><g clip-path="url(#p17fmc4)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M418 152L426 156L378 192L370 188Z"/></g><g clip-path="url(#p17fmc5)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M430 157L438 161L390 197L382 194Z"/></g><g clip-path="url(#p17fmc6)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M442 163L450 167L402 203L394 199Z"/></g><g clip-path="url(#p17fmc7)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M454 168L462 172L414 208L406 205Z"/></g><g clip-path="url(#p17fmc8)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M466 174L474 178L426 214L418 210Z"/></g><g clip-path="url(#p17fmc9)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M478 179L487 183L438 220L430 216Z"/></g><g clip-path="url(#p17fmc10)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M490 185L499 189L450 225L442 221Z"/></g><g clip-path="url(#p17fmc11)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M502 190L511 194L462 231L454 227Z"/></g><g clip-path="url(#p17fmc12)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M515 196L523 200L474 236L466 232Z"/></g><g clip-path="url(#p17fmc13)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M296 200L304 203L256 240L248 236Z"/></g><g clip-path="url(#p17fmc14)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M527 202L535 205L486 242L478 238Z"/></g><g clip-path="url(#p17fmc15)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M308 205L316 209L268 245L260 242Z"/></g><g clip-path="url(#p17fmc16)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M539 207L547 211L498 247L490 244Z"/></g><g clip-path="url(#p17fmc17)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M320 211L329 214L280 251L272 247Z"/></g><g clip-path="url(#p17fmc18)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M551 213L559 216L511 253L502 249Z"/></g><g clip-path="url(#p17fmc19)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb1)" d="M247 227L280 242L275 246L242 231Z"/></g><g clip-path="url(#p17fmc20)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M332 216L341 220L292 256L284 253Z"/></g><g clip-path="url(#p17fmc21)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M563 218L571 222L523 258L514 255Z"/></g><g clip-path="url(#p17fmc22)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M344 222L353 226L304 262L296 258Z"/></g><g clip-path="url(#p17fmc23)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M575 224L583 228L535 264L526 260Z"/></g><g clip-path="url(#p17fmc24)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M357 227L365 231L316 267L308 264Z"/></g><g clip-path="url(#p17fmc25)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M587 229L595 233L547 269L539 266Z"/></g><g clip-path="url(#p17fmc26)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M369 233L377 236L328 273L320 269Z"/></g><g clip-path="url(#p17fmc27)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M599 235L607 239L559 275L551 271Z"/></g><g clip-path="url(#p17fmc28)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M381 238L389 242L340 278L332 275Z"/></g><g clip-path="url(#p17fmc29)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M611 240L619 244L571 280L563 277Z"/></g><g clip-path="url(#p17fmc30)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M393 244L401 248L353 284L344 280Z"/></g><g clip-path="url(#p17fmc32)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M405 249L413 253L365 290L356 286Z"/></g><g clip-path="url(#p17fmc33)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M417 255L425 259L377 295L368 291Z"/></g><g clip-path="url(#p17fmc34)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M429 260L437 264L389 301L381 297Z"/></g><g clip-path="url(#p17fmc35)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M441 266L449 270L401 306L393 302Z"/></g><g clip-path="url(#p17fmc36)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M453 272L461 275L413 312L405 308Z"/></g><g clip-path="url(#p17fmc37)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M465 277L473 281L425 317L417 314Z"/></g><g clip-path="url(#p17fmc38)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M477 283L485 286L437 323L429 319Z"/></g><g clip-path="url(#p17fmc39)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M489 288L497 292L449 328L441 325Z"/></g><g clip-path="url(#p17fmc40)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M501 294L510 298L461 334L453 330Z"/></g><g clip-path="url(#p17fmc42)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M513 299L522 303L473 339L465 336Z"/></g><g clip-path="url(#p17fmc43)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M525 305L534 308L485 345L477 341Z"/></g><path class="p-plaster" d="M228 228L497 351L630 251L361 128Z"/><path class="p-right" d="M228 231L497 354L497 351L228 228ZM497 354L630 254L630 251L497 351Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.39" d="M497 354L630 254"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.36" d="M630 254L630 251"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.17" d="M630 251L497 351M228 228L497 351"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.18" d="M497 351L497 354"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.35" d="M228 231L228 228"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.33" d="M228 228L361 128"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.34" d="M630 251L361 128"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.38" d="M497 354L228 231"/><path class="p-metal p-lo" d="M337 174L384 138L384 122L337 158ZM330 171L337 174L337 158L330 155Z"/><path class="p-metal" d="M330 155L337 158L384 122L378 119Z"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.59" d="M337 174L384 138M330 155L378 119"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.58" d="M384 138L384 122M384 122L378 119"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.27" d="M384 122L337 158M337 158L337 174M330 155L337 158"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.60" d="M330 171L330 155M337 174L330 171"/><path class="p-metal p-lo" d="M349 179L396 144L396 128L349 163ZM342 176L349 179L349 163L342 160Z"/><path class="p-metal" d="M342 160L349 163L396 128L390 125Z"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.59" d="M349 179L396 144"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.58" d="M396 144L396 128M396 128L390 125"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.27" d="M396 128L349 163M349 163L349 179M342 160L349 163"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.61" d="M342 176L342 160"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.60" d="M342 160L390 125M349 179L342 176"/><path class="p-metal p-lo" d="M361 185L408 149L408 134L361 169ZM354 182L361 185L361 169L354 166Z"/><path class="p-metal" d="M354 166L361 169L408 134L402 130Z"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.60" d="M361 185L408 149M354 166L402 130"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.59" d="M408 149L408 134M408 134L402 130"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.27" d="M408 134L361 169M361 169L361 185"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.61" d="M354 182L354 166M361 185L354 182"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.28" d="M354 166L361 169"/><path class="p-metal p-lo" d="M373 190L420 155L420 139L373 174ZM366 187L373 190L373 174L366 171Z"/><path class="p-metal" d="M366 171L373 174L420 139L414 136Z"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.60" d="M373 190L420 155M366 171L414 136"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.59" d="M420 155L420 139M420 139L414 136"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.27" d="M420 139L373 174"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.28" d="M373 174L373 190M366 171L373 174"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.62" d="M366 187L366 171"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.61" d="M373 190L366 187"/><path class="p-metal p-lo" d="M385 196L432 160L432 144L385 180ZM379 193L385 196L385 180L379 177Z"/><path class="p-metal" d="M379 177L385 180L432 144L426 142Z"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.60" d="M385 196L432 160M432 144L426 142"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.59" d="M432 160L432 144"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.27" d="M432 144L385 180"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.28" d="M385 180L385 196M379 177L385 180"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.62" d="M379 193L379 177M385 196L379 193"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.61" d="M379 177L426 142"/><path class="p-metal p-lo" d="M397 201L444 166L444 150L397 186ZM391 198L397 201L397 186L391 182Z"/><path class="p-metal" d="M391 182L397 186L444 150L438 147Z"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.61" d="M397 201L444 166M391 182L438 147"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.60" d="M444 166L444 150M444 150L438 147"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.28" d="M444 150L397 186M397 186L397 201M391 182L397 186"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.62" d="M391 198L391 182M397 201L391 198"/><path class="p-metal p-lo" d="M409 207L456 171L456 156L409 191ZM403 204L409 207L409 191L403 188Z"/><path class="p-metal" d="M403 188L409 191L456 156L450 153Z"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.61" d="M409 207L456 171"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.60" d="M456 171L456 156M456 156L450 153"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.28" d="M456 156L409 191M409 191L409 207M403 188L409 191"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.63" d="M403 204L403 188M409 207L403 204"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.62" d="M403 188L450 153"/><path class="p-metal p-lo" d="M421 212L468 177L468 161L421 197ZM415 209L421 212L421 197L415 194Z"/><path class="p-metal" d="M415 194L421 197L468 161L462 158Z"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.62" d="M421 212L468 177M415 194L462 158"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.61" d="M468 177L468 161M468 161L462 158"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.28" d="M468 161L421 197M421 197L421 212M415 194L421 197"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.63" d="M415 209L415 194M421 212L415 209"/><path class="p-metal p-lo" d="M433 218L480 182L480 167L433 202ZM427 215L433 218L433 202L427 199Z"/><path class="p-metal" d="M427 199L433 202L480 167L474 164Z"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.62" d="M433 218L480 182"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.61" d="M480 182L480 167M480 167L474 164"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.28" d="M480 167L433 202"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.29" d="M433 202L433 218M427 199L433 202"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.64" d="M427 215L427 199M433 218L427 215"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.63" d="M427 199L474 164"/><path class="p-metal p-lo" d="M446 223L493 188L493 172L446 208ZM439 220L446 223L446 208L439 205Z"/><path class="p-metal" d="M439 205L446 208L493 172L486 169Z"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.63" d="M446 223L493 188M439 205L486 169"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.62" d="M493 188L493 172M493 172L486 169"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.28" d="M493 172L446 208"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.29" d="M446 208L446 223M439 205L446 208"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.64" d="M439 220L439 205M446 223L439 220"/><path class="p-metal p-lo" d="M458 229L505 194L505 178L458 213ZM451 226L458 229L458 213L451 210Z"/><path class="p-metal" d="M451 210L458 213L505 178L498 175Z"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.63" d="M458 229L505 194"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.62" d="M505 194L505 178M505 178L498 175"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.29" d="M505 178L458 213M458 213L458 229M451 210L458 213"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.65" d="M451 226L451 210"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.64" d="M451 210L498 175M458 229L451 226"/><path class="p-metal p-lo" d="M470 234L517 199L517 183L470 219ZM463 232L470 234L470 219L463 216Z"/><path class="p-metal" d="M463 216L470 219L517 183L510 180Z"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.64" d="M470 234L517 199M463 216L510 180"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.62" d="M517 199L517 183"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.29" d="M517 183L470 219M470 219L470 234M463 216L470 219"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.65" d="M463 232L463 216M470 234L463 232"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.63" d="M517 183L510 180"/><path class="p-metal p-lo" d="M251 238L298 203L298 187L251 222ZM245 235L251 238L251 222L245 219Z"/><path class="p-metal" d="M245 219L251 222L298 187L292 184Z"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.64" d="M251 238L298 203M245 219L292 184"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.63" d="M298 203L298 187M298 187L292 184"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.29" d="M298 187L251 222M251 222L251 238M245 219L251 222"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.65" d="M245 235L245 219M251 238L245 235"/><path class="p-metal p-lo" d="M482 240L529 205L529 189L482 224ZM475 237L482 240L482 224L475 221Z"/><path class="p-metal" d="M475 221L482 224L529 189L522 186Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.58" d="M482 240L529 205M475 221L522 186"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.57" d="M529 205L529 189M529 189L522 186"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.26" d="M529 189L482 224M482 224L482 240"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.59" d="M475 237L475 221M482 240L475 237"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.27" d="M475 221L482 224"/><path class="p-metal p-lo" d="M263 244L310 208L310 192L263 228ZM257 241L263 244L263 228L257 225Z"/><path class="p-metal" d="M257 225L263 228L310 192L304 189Z"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.64" d="M263 244L310 208"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.63" d="M310 208L310 192M310 192L304 189"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.29" d="M310 192L263 228"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.30" d="M263 228L263 244M257 225L263 228"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.66" d="M257 241L257 225M263 244L257 241"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.65" d="M257 225L304 189"/><path class="p-metal p-lo" d="M494 246L541 210L541 194L494 230ZM487 243L494 246L494 230L487 227Z"/><path class="p-metal" d="M487 227L494 230L541 194L534 191Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.52" d="M494 246L541 210M487 227L534 191"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.51" d="M541 210L541 194M541 194L534 191"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.23" d="M541 194L494 230"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.24" d="M494 230L494 246M487 227L494 230"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.53" d="M487 243L487 227M494 246L487 243"/><path class="p-metal p-lo" d="M275 249L322 214L322 198L275 233ZM269 246L275 249L275 233L269 230Z"/><path class="p-metal" d="M269 230L275 233L322 198L316 195Z"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.65" d="M275 249L322 214M269 230L316 195"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.64" d="M322 214L322 198M322 198L316 195"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.29" d="M322 198L275 233"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.30" d="M275 233L275 249M269 230L275 233"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.66" d="M269 246L269 230M275 249L269 246"/><path class="p-metal p-lo" d="M506 251L553 216L553 200L506 235ZM499 248L506 251L506 235L499 232Z"/><path class="p-metal" d="M499 232L506 235L553 200L546 197Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.52" d="M506 251L553 216M499 232L546 197"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.51" d="M553 216L553 200M553 200L546 197"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.23" d="M553 200L506 235"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.24" d="M506 235L506 251M499 232L506 235"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.53" d="M499 248L499 232M506 251L499 248"/><path class="p-plaster" d="M242 229L275 245L280 241L247 226Z"/><path class="p-right" d="M242 231L275 246L275 245L242 229ZM275 246L280 242L280 241L275 245Z"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.66" d="M275 246L280 242M280 242L280 241"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.29" d="M280 241L275 245M275 245L275 246M242 229L275 245"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.65" d="M242 231L242 229M242 229L247 226M280 241L247 226M275 246L242 231"/><path class="p-metal p-lo" d="M288 255L335 219L335 204L288 239ZM281 252L288 255L288 239L281 236Z"/><path class="p-metal" d="M281 236L288 239L335 204L328 200Z"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.65" d="M288 255L335 219"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.64" d="M335 219L335 204M335 204L328 200"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.29" d="M335 204L288 239"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.30" d="M288 239L288 255M281 236L288 239"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.67" d="M281 252L281 236"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.66" d="M281 236L328 200M288 255L281 252"/><path class="p-metal p-lo" d="M518 257L565 221L565 206L518 241ZM511 254L518 257L518 241L511 238Z"/><path class="p-metal" d="M511 238L518 241L565 206L558 202Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.52" d="M518 257L565 221M565 206L558 202"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.51" d="M565 221L565 206"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.24" d="M565 206L518 241M518 241L518 257M511 238L518 241"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.53" d="M511 254L511 238M511 238L558 202M518 257L511 254"/><path class="p-metal p-lo" d="M300 260L347 225L347 209L300 244ZM293 257L300 260L300 244L293 241Z"/><path class="p-metal" d="M293 241L300 244L347 209L340 206Z"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.66" d="M300 260L347 225M293 241L340 206"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.65" d="M347 225L347 209M347 209L340 206"/><path class="p-line" stroke-width="0.77" stroke-opacity="0.30" d="M347 209L300 244M300 244L300 260M293 241L300 244"/><path class="p-sil" stroke-width="1.37" stroke-opacity="0.67" d="M293 257L293 241M300 260L293 257"/><path class="p-metal p-lo" d="M530 262L577 227L577 211L530 246ZM523 259L530 262L530 246L523 243Z"/><path class="p-metal" d="M523 243L530 246L577 211L570 208Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.53" d="M530 262L577 227M523 243L570 208"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.52" d="M577 227L577 211M577 211L570 208"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.24" d="M577 211L530 246M530 246L530 262M523 243L530 246"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.54" d="M523 259L523 243M530 262L523 259"/><path class="p-metal p-lo" d="M312 266L359 230L359 214L312 250ZM305 263L312 266L312 250L305 247Z"/><path class="p-metal" d="M305 247L312 250L359 214L352 212Z"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.66" d="M312 266L359 230"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.65" d="M359 230L359 214M359 214L352 212"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.30" d="M359 214L312 250M312 250L312 266M305 247L312 250"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.68" d="M305 263L305 247"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.67" d="M305 247L352 212M312 266L305 263"/><path class="p-metal p-lo" d="M542 268L589 232L589 216L542 252ZM535 265L542 268L542 252L535 249Z"/><path class="p-metal" d="M535 249L542 252L589 216L582 214Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.53" d="M542 268L589 232M535 249L582 214"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.52" d="M589 232L589 216M589 216L582 214"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.24" d="M589 216L542 252M542 252L542 268M535 249L542 252"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.54" d="M535 265L535 249M542 268L535 265"/><path class="p-metal p-lo" d="M324 271L371 236L371 220L324 256ZM317 268L324 271L324 256L317 252Z"/><path class="p-metal" d="M317 252L324 256L371 220L364 217Z"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.67" d="M324 271L371 236M317 252L364 217"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.65" d="M371 236L371 220"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.30" d="M371 220L324 256"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.31" d="M324 256L324 271M317 252L324 256"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.68" d="M317 268L317 252M324 271L317 268"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.66" d="M371 220L364 217"/><path class="p-metal p-lo" d="M554 273L601 238L601 222L554 258ZM547 270L554 273L554 258L547 254Z"/><path class="p-metal" d="M547 254L554 258L601 222L595 219Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.53" d="M554 273L601 238M601 222L595 219"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.52" d="M601 238L601 222"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.24" d="M601 222L554 258M554 258L554 273"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.55" d="M547 270L547 254"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.54" d="M547 254L595 219M554 273L547 270"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.25" d="M547 254L554 258"/><path class="p-metal p-lo" d="M336 277L383 241L383 226L336 261ZM329 274L336 277L336 261L329 258Z"/><path class="p-metal" d="M329 258L336 261L383 226L376 223Z"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.67" d="M336 277L383 241M329 258L376 223"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.66" d="M383 241L383 226M383 226L376 223"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.30" d="M383 226L336 261"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.31" d="M336 261L336 277M329 258L336 261"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.68" d="M329 274L329 258M336 277L329 274"/><path class="p-metal p-lo" d="M566 279L613 243L613 228L566 263ZM560 276L566 279L566 263L560 260Z"/><path class="p-metal" d="M560 260L566 263L613 228L607 225Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.54" d="M566 279L613 243M560 260L607 225"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.53" d="M613 243L613 228M613 228L607 225"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.24" d="M613 228L566 263"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.25" d="M566 263L566 279M560 260L566 263"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.55" d="M560 276L560 260M566 279L560 276"/><path class="p-metal p-lo" d="M348 282L395 247L395 231L348 267ZM341 279L348 282L348 267L341 264Z"/><path class="p-metal" d="M341 264L348 267L395 231L388 228Z"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.67" d="M348 282L395 247M395 231L388 228"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.66" d="M395 247L395 231"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.30" d="M395 231L348 267"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.31" d="M348 267L348 282M341 264L348 267"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.69" d="M341 279L341 264M348 282L341 279"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.68" d="M341 264L388 228"/><path class="p-metal p-lo" d="M360 288L407 252L407 237L360 272ZM353 285L360 288L360 272L353 269Z"/><path class="p-metal" d="M353 269L360 272L407 237L400 234Z"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.68" d="M360 288L407 252M353 269L400 234"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.67" d="M407 252L407 237M407 237L400 234"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.31" d="M407 237L360 272M360 272L360 288M353 269L360 272"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.69" d="M353 285L353 269M360 288L353 285"/><path class="p-metal p-lo" d="M372 293L419 258L419 242L372 278ZM365 290L372 293L372 278L365 275Z"/><path class="p-metal" d="M365 275L372 278L419 242L412 239Z"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.68" d="M372 293L419 258"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.67" d="M419 258L419 242M419 242L412 239"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.31" d="M419 242L372 278M372 278L372 293M365 275L372 278"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.70" d="M365 290L365 275M372 293L365 290"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.69" d="M365 275L412 239"/><path class="p-metal p-lo" d="M384 299L431 264L431 248L384 283ZM377 296L384 299L384 283L377 280Z"/><path class="p-metal" d="M377 280L384 283L431 248L424 245Z"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.69" d="M384 299L431 264M377 280L424 245"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.68" d="M431 264L431 248M431 248L424 245"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.31" d="M431 248L384 283"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.32" d="M384 283L384 299M377 280L384 283"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.70" d="M377 296L377 280M384 299L377 296"/><path class="p-metal p-lo" d="M396 304L443 269L443 253L396 289ZM389 302L396 304L396 289L389 286Z"/><path class="p-metal" d="M389 286L396 289L443 253L436 250Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.62" d="M396 304L443 269"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.61" d="M443 269L443 253M443 253L436 250"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.28" d="M443 253L396 289"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.29" d="M396 289L396 304M389 286L396 289"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.64" d="M389 302L389 286"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.63" d="M389 286L436 250M396 304L389 302"/><path class="p-metal p-lo" d="M408 310L455 275L455 259L408 294ZM402 307L408 310L408 294L402 291Z"/><path class="p-metal" d="M402 291L408 294L455 259L449 256Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.56" d="M408 310L455 275M402 291L449 256"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.55" d="M455 275L455 259M455 259L449 256"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.25" d="M455 259L408 294"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.26" d="M408 294L408 310M402 291L408 294"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.57" d="M402 307L402 291M408 310L402 307"/><path class="p-metal p-lo" d="M420 316L467 280L467 264L420 300ZM414 313L420 316L420 300L414 297Z"/><path class="p-metal" d="M414 297L420 300L467 264L461 261Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.56" d="M420 316L467 280M414 297L461 261"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.55" d="M467 280L467 264M467 264L461 261"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.25" d="M467 264L420 300"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.26" d="M420 300L420 316M414 297L420 300"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.57" d="M414 313L414 297M420 316L414 313"/><path class="p-metal p-lo" d="M432 321L479 286L479 270L432 305ZM426 318L432 321L432 305L426 302Z"/><path class="p-metal" d="M426 302L432 305L479 270L473 267Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.56" d="M432 321L479 286M479 286L479 270M479 270L473 267"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.25" d="M479 270L432 305"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.26" d="M432 305L432 321M426 302L432 305"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.58" d="M426 318L426 302"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.57" d="M426 302L473 267M432 321L426 318"/><path class="p-metal p-lo" d="M444 327L491 291L491 276L444 311ZM438 324L444 327L444 311L438 308Z"/><path class="p-metal" d="M438 308L444 311L491 276L485 272Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.57" d="M444 327L491 291M438 308L485 272"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.56" d="M491 291L491 276M491 276L485 272"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.26" d="M491 276L444 311M444 311L444 327M438 308L444 311"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.58" d="M438 324L438 308M444 327L438 324"/><path class="p-metal p-lo" d="M456 332L503 297L503 281L456 316ZM450 329L456 332L456 316L450 313Z"/><path class="p-metal" d="M450 313L456 316L503 281L497 278Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.57" d="M456 332L503 297M450 313L497 278"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.56" d="M503 297L503 281M503 281L497 278"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.26" d="M503 281L456 316M456 316L456 332M450 313L456 316"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.58" d="M450 329L450 313M456 332L450 329"/><path class="p-metal p-lo" d="M468 338L516 302L516 286L468 322ZM462 335L468 338L468 322L462 319Z"/><path class="p-metal" d="M462 319L468 322L516 286L509 284Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.57" d="M468 338L516 302M516 302L516 286M516 286L509 284"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.26" d="M516 286L468 322M468 322L468 338M462 319L468 322"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.59" d="M462 335L462 319"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.58" d="M462 319L509 284M468 338L462 335"/><path class="p-metal p-lo" d="M480 343L528 308L528 292L480 328ZM474 340L480 343L480 328L474 324Z"/><path class="p-metal" d="M474 324L480 328L528 292L521 289Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.58" d="M480 343L528 308M474 324L521 289"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.57" d="M528 308L528 292M528 292L521 289"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.26" d="M528 292L480 328M480 328L480 343M474 324L480 328"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.59" d="M474 340L474 324M480 343L474 340"/></g><g data-part="plinth" style="--i:2"><path class="p-plaster" d="M558 365L706 433L821 346L673 278Z"/><path class="p-right" d="M706 440L821 353L821 346L706 433ZM558 372L706 440L706 433L558 365Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.35" d="M706 440L821 353M706 440L558 372"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.33" d="M821 353L821 346M558 365L673 278"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.16" d="M821 346L706 433M706 433L706 440M558 365L706 433"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.34" d="M558 372L558 365"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.32" d="M821 346L673 278"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M143 119L254 170L197 213L86 162Z"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p17fmb4)" d="M362 130L633 254L498 356L227 231Z"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p17fmb4)" d="M675 284L825 353L708 441L558 372Z"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p17fmb3)" d="M224 58L336 109L279 152L167 101Z"/></g><g><path class="p-shadow" opacity="0.621" filter="url(#p17fmb3)" d="M138 138L225 178L202 195L116 155Z"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p17fmb1)" d="M756 241L791 257L764 278L730 262Z"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p17fmb1)" d="M861 289L895 305L868 325L834 309Z"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p17fmb1)" d="M965 337L999 353L972 373L938 357Z"/></g><g clip-path="url(#p17fmk)"><g opacity="0.360" filter="url(#p17fmb2)"><path class="p-shadow" d="M173 98L282 149L338 107L228 56ZM164 97L273 147L282 149L173 98ZM273 147L329 105L338 107L282 149ZM246 76L246 79L248 80L248 77ZM246 82L242 84L238 85L233 84L229 83L226 81L224 78L225 76L227 73L230 72L235 71L239 71L243 72L246 74L248 77L248 80ZM224 81L223 78L224 78L226 81ZM246 79L244 82L246 82L248 80ZM227 83L224 81L226 81L229 83ZM244 82L240 83L242 84L246 82ZM231 84L227 83L229 83L233 84ZM240 83L236 84L238 85L242 84ZM236 84L231 84L233 84L238 85ZM280 92L280 95L282 95L282 92ZM279 98L276 99L272 100L267 100L263 99L260 97L258 94L259 91L261 89L264 87L269 86L273 87L277 88L280 90L282 92L282 95ZM258 96L257 94L258 94L260 97ZM280 95L278 97L279 98L282 95ZM220 96L220 98L222 99L222 96ZM261 98L258 96L260 97L263 99ZM220 101L216 103L212 104L207 104L203 102L200 100L199 98L199 95L201 93L205 91L209 90L214 90L218 92L221 94L222 96L222 99ZM278 97L274 99L276 99L279 98ZM198 100L197 98L199 98L200 100ZM265 100L261 98L263 99L267 100ZM274 99L270 100L272 100L276 99ZM220 98L218 101L220 101L222 99ZM270 100L265 100L267 100L272 100ZM201 102L198 100L200 100L203 102ZM218 101L214 103L216 103L220 101ZM206 103L201 102L203 102L207 104ZM214 103L210 104L212 104L216 103ZM210 104L206 103L207 104L212 104ZM314 108L314 110L316 111L316 108ZM313 113L310 115L306 116L301 116L297 114L294 112L292 110L293 107L295 105L298 103L303 102L307 102L311 103L314 106L316 108L316 111ZM292 112L291 109L292 110L294 112ZM314 110L312 113L313 113L316 111ZM254 112L254 114L256 114L256 112ZM295 114L292 112L294 112L297 114ZM254 117L250 119L246 120L241 119L237 118L234 116L233 114L233 111L235 108L239 107L243 106L248 106L252 107L255 109L256 112L256 114ZM312 113L308 115L310 115L313 113ZM232 116L231 113L233 114L234 116ZM299 115L295 114L297 114L301 116ZM308 115L304 116L306 116L310 115ZM254 114L252 117L254 117L256 114ZM304 116L299 115L301 116L306 116ZM235 118L232 116L234 116L237 118ZM252 117L248 118L250 119L254 117ZM240 119L235 118L237 118L241 119ZM248 118L244 119L246 120L250 119ZM244 119L240 119L241 119L246 120ZM288 127L288 130L290 130L290 127ZM288 132L284 134L280 135L275 135L271 134L268 132L267 129L267 126L269 124L273 122L277 121L282 122L286 123L289 125L290 127L290 130ZM266 131L265 129L267 129L268 132ZM288 130L286 132L288 132L290 130ZM269 133L266 131L268 132L271 134ZM286 132L282 134L284 134L288 132ZM274 135L269 133L271 134L275 135ZM282 134L278 135L280 135L284 134ZM278 135L274 135L275 135L280 135ZM729 258L763 274L790 254L756 238ZM763 274L789 254L790 254L763 274ZM729 258L763 274L763 274L729 258ZM776 258L767 265L792 270L801 263ZM752 265L743 258L768 263L777 270ZM784 251L797 254L792 262ZM771 255L784 251L792 262ZM767 265L752 265L777 270L792 270ZM797 254L801 263L792 262ZM768 263L771 255L792 262ZM801 263L792 270L792 262ZM777 270L768 263L792 262ZM792 270L777 270L792 262ZM833 306L867 322L894 302L860 286ZM867 322L894 302L894 302L867 322ZM833 306L867 322L867 322L833 306ZM849 309L848 301L876 306L877 314ZM880 306L872 312L900 318L908 312ZM859 313L849 309L877 314L887 319ZM883 301L896 300L900 311ZM872 312L859 313L887 319L900 318ZM896 300L906 304L900 311ZM876 306L883 301L900 311ZM906 304L908 312L900 311ZM877 314L876 306L900 311ZM908 312L900 318L900 311ZM887 319L877 314L900 311ZM900 318L887 319L900 311ZM937 354L971 369L998 349L964 334ZM971 369L998 349L998 349L971 369ZM937 354L971 369L971 369L937 354ZM977 346L994 347L988 356ZM957 359L951 350L967 353L973 362ZM967 353L977 346L988 356ZM984 353L974 361L990 364L1000 356ZM994 347L1000 356L988 356ZM974 361L957 359L973 362L990 364ZM973 362L967 353L988 356ZM1000 356L990 364L988 356ZM990 364L973 362L988 356ZM702 341L717 345L709 354ZM687 346L702 341L709 354ZM697 350L687 358L711 363L721 355ZM670 358L659 351L683 355L694 363ZM687 358L670 358L694 363L711 363ZM717 345L721 355L709 354ZM683 355L687 346L709 354ZM721 355L711 363L709 354ZM694 363L683 355L709 354ZM711 363L694 363L709 354Z"/></g></g><g data-part="cool" style="--i:3"><g clip-path="url(#p17fmc0)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb1)" d="M224 51L311 91L270 122L183 82Z"/></g><path class="p-metal" d="M164 82L273 133L329 91L219 40Z"/><path class="p-metal p-lo" d="M164 100L273 150L273 133L164 82ZM273 150L329 108L329 91L273 133Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.48" d="M273 150L329 108M273 150L164 100"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.47" d="M329 108L329 91M164 100L164 82"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.22" d="M329 91L273 133M273 133L273 150M164 82L273 133"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.46" d="M164 82L219 40M329 91L219 40"/><path class="p-inkf" d="M237 60L237 63L237 60L237 58ZM235 63L231 64L227 65L222 65L218 64L215 62L214 59L214 56L216 54L219 52L224 52L228 52L233 53L236 55L237 58L237 60ZM215 65L214 62L214 59L215 62ZM237 63L235 66L235 63L237 60ZM218 67L215 65L215 62L218 64ZM235 66L231 67L231 64L235 63ZM222 68L218 67L218 64L222 65ZM231 67L227 68L227 65L231 64ZM227 68L222 68L222 65L227 65ZM271 76L271 79L271 76L271 73ZM269 78L265 80L261 81L256 81L252 80L249 77L248 75L248 72L250 70L253 68L258 67L262 67L266 68L270 71L271 73L271 76ZM249 80L248 78L248 75L249 77ZM271 79L269 81L269 78L271 76ZM211 80L211 82L211 80L211 77ZM252 82L249 80L249 77L252 80ZM209 82L205 84L201 85L196 84L192 83L189 81L188 79L188 76L190 73L194 72L198 71L203 71L207 72L210 74L211 77L211 80ZM269 81L265 83L265 80L269 78ZM189 84L188 81L188 79L189 81ZM256 84L252 82L252 80L256 81ZM265 83L261 84L261 81L265 80ZM211 82L209 85L209 82L211 80ZM261 84L256 84L256 81L261 81ZM192 86L189 84L189 81L192 83ZM209 85L205 87L205 84L209 82ZM196 87L192 86L192 83L196 84ZM205 87L201 87L201 85L205 84ZM201 87L196 87L196 84L201 85ZM305 92L305 94L305 92L305 89ZM303 94L299 96L295 96L290 96L286 95L283 93L282 90L282 88L284 85L287 84L292 83L296 83L300 84L304 86L305 89L305 92ZM283 96L282 93L282 90L283 93ZM305 94L303 97L303 94L305 92ZM245 95L245 98L245 95L245 92ZM286 98L283 96L283 93L286 95ZM243 98L239 99L235 100L230 100L226 99L223 97L222 94L222 92L224 89L228 87L232 86L237 87L241 88L244 90L245 92L245 95ZM303 97L299 98L299 96L303 94ZM223 100L222 97L222 94L223 97ZM290 99L286 98L286 95L290 96ZM299 98L295 99L295 96L299 96ZM245 98L243 100L243 98L245 95ZM295 99L290 99L290 96L295 96ZM226 102L223 100L223 97L226 99ZM243 100L239 102L239 99L243 98ZM230 103L226 102L226 99L230 100ZM239 102L235 103L235 100L239 99ZM235 103L230 103L230 100L235 100ZM279 111L279 114L279 111L279 108ZM277 113L273 115L269 116L264 116L260 114L257 112L256 110L256 107L258 105L262 103L266 102L271 102L275 104L278 106L279 108L279 111ZM257 115L256 113L256 110L257 112ZM279 114L277 116L277 113L279 111ZM260 117L257 115L257 112L260 114ZM277 116L273 118L273 115L277 113ZM264 118L260 117L260 114L264 116ZM273 118L269 119L269 116L273 115ZM269 119L264 118L264 116L269 116Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.28" d="M209 85L205 87M205 87L201 87M201 87L196 87M196 87L192 86M192 86L189 84M189 84L188 81M188 81L188 79M188 76L188 79M211 82L209 85M243 100L239 102M239 102L235 103M235 103L230 103M230 103L226 102M226 102L223 100M223 100L222 97M222 97L222 94M222 92L222 94M224 89L222 92M228 87L224 89M232 86L228 87M237 87L232 86M241 88L237 87M244 90L241 88M245 95L245 92M245 92L244 90M245 95L245 98M245 98L243 100M262 103L258 105M266 102L262 103M271 102L266 102M275 104L271 102M278 106L275 104M269 81L265 83M265 83L261 84M261 84L256 84M256 84L252 82M303 97L299 98M299 98L295 99M295 99L290 99M290 99L286 98M286 98L283 96M283 96L282 93M282 93L282 90M282 88L282 90M284 85L282 88M287 84L284 85M292 83L287 84M296 83L292 83M300 84L296 83M304 86L300 84M305 92L305 89M305 89L304 86M305 92L305 94M305 94L303 97"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.12" d="M205 84L209 82M201 85L205 84M196 84L201 85M192 83L196 84M189 81L192 83M188 79L189 81M211 80L211 77M209 82L211 80M231 64L235 63M227 65L231 64M222 65L227 65M218 64L222 65M215 62L218 64M214 59L215 62M237 60L237 58M235 63L237 60M265 80L269 78M261 81L265 80M256 81L261 81M252 80L256 81M249 77L252 80M248 75L249 77M271 76L271 73M269 78L271 76M305 92L305 89"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.27" d="M190 73L188 76M194 72L190 73M198 71L194 72M203 71L198 71M207 72L203 71M210 74L207 72M211 80L211 77M211 77L210 74M211 80L211 82M235 66L231 67M231 67L227 68M227 68L222 68M222 68L218 67M218 67L215 65M215 65L214 62M214 62L214 59M214 56L214 59M216 54L214 56M219 52L216 54M224 52L219 52M228 52L224 52M233 53L228 52M236 55L233 53M237 60L237 58M237 58L236 55M237 60L237 63M237 63L235 66M252 82L249 80M249 80L248 78M248 78L248 75M248 72L248 75M250 70L248 72M253 68L250 70M258 67L253 68M262 67L258 67M266 68L262 67M270 71L266 68M271 76L271 73M271 73L270 71M271 76L271 79M271 79L269 81"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.13" d="M239 99L243 98M235 100L239 99M230 100L235 100M226 99L230 100M223 97L226 99M222 94L223 97M245 95L245 92M243 98L245 95M273 115L277 113M269 116L273 115M264 116L269 116M260 114L264 116M257 112L260 114M256 110L257 112M279 111L279 108M277 113L279 111M299 96L303 94M295 96L299 96M290 96L295 96M286 95L290 96M283 93L286 95M282 90L283 93M303 94L305 92"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.29" d="M277 116L273 118M273 118L269 119M269 119L264 118M264 118L260 117M260 117L257 115M257 115L256 113M256 113L256 110M256 107L256 110M258 105L256 107M279 111L279 108M279 108L278 106M279 111L279 114M279 114L277 116"/></g><g data-part="rv0" style="--i:4"><g clip-path="url(#p17fmc31)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb9)" d="M770 242L800 256L776 274L746 260Z"/></g><path class="p-plaster" d="M729 258L763 273L789 253L755 238Z"/><path class="p-right" d="M763 277L789 257L789 253L763 273ZM729 261L763 277L763 273L729 258Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.30" d="M763 277L789 257M789 257L789 253M729 261L729 258M729 258L755 238M789 253L755 238M763 277L729 261"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.14" d="M789 253L763 273M763 273L763 277M729 258L763 273"/><path class="p-metal p-lo" d="M775 257L766 264L766 224L775 218ZM752 264L743 258L743 218L752 224ZM759 206L772 209L759 204ZM746 210L759 206L759 204ZM766 264L752 264L752 224L766 224Z"/><path class="p-metal" d="M772 209L775 218L759 204ZM743 218L746 210L759 204ZM775 218L766 224L759 204ZM752 224L743 218L759 204ZM766 224L752 224L759 204Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.61" d="M766 264L752 264M743 258L743 218M746 210L743 218M759 206L746 210M772 209L759 206M775 257L775 218M775 218L772 209"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.27" d="M752 264L752 224M766 224L766 264"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.62" d="M752 224L766 224M743 218L752 224M766 224L775 218"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.60" d="M752 264L743 258M743 258L746 249M772 249L775 257M775 257L766 264"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.59" d="M746 249L759 246M759 246L772 249"/><path class="p-line2" stroke-width="0.64" stroke-opacity="0.40" d="M766 224L759 204M752 224L759 204M743 218L759 204M746 210L759 204M759 206L759 204M772 209L759 204M775 218L759 204"/></g><g data-part="rv1" style="--i:5"><g clip-path="url(#p17fmc41)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb10)" d="M877 290L907 304L883 322L853 308Z"/></g><path class="p-plaster" d="M833 305L867 321L894 301L860 285Z"/><path class="p-right" d="M867 325L894 305L894 301L867 321ZM833 309L867 325L867 321L833 305Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.32" d="M867 325L894 305M894 305L894 301M833 309L833 305M867 325L833 309"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.14" d="M894 301L867 321M867 321L867 325M833 305L867 321"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.31" d="M833 305L860 285M894 301L860 285"/><path class="p-metal p-lo" d="M849 308L847 300L847 256L849 263ZM879 306L871 312L871 267L879 261ZM859 313L849 308L849 263L859 268ZM855 250L868 249L863 246ZM871 312L859 313L859 268L871 267ZM868 249L878 254L863 246Z"/><path class="p-metal" d="M847 256L855 250L863 246ZM878 254L879 261L863 246ZM849 263L847 256L863 246ZM879 261L871 267L863 246ZM859 268L849 263L863 246ZM871 267L859 268L863 246Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.64" d="M871 312L859 313M859 313L849 308M849 308L847 300M847 300L847 256M879 306L871 312"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.29" d="M859 313L859 268M871 267L871 312M849 308L849 263"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.66" d="M859 268L871 267M849 263L859 268M871 267L879 261"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.65" d="M847 256L849 263M855 250L847 256M868 249L855 250M878 254L868 249M879 306L879 261M879 261L878 254"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.63" d="M847 300L855 295M855 295L868 294M868 294L878 298M878 298L879 306"/><path class="p-line2" stroke-width="0.64" stroke-opacity="0.42" d="M871 267L863 246M849 263L863 246M847 256L863 246M855 250L863 246M868 249L863 246M878 254L863 246M879 261L863 246"/><path class="p-line2" stroke-width="0.64" stroke-opacity="0.43" d="M859 268L863 246"/></g><g data-part="rv2" style="--i:6"><g clip-path="url(#p17fmc44)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb5)" d="M975 338L1002 350L978 367L952 355Z"/></g><path class="p-plaster" d="M937 353L971 369L998 349L964 333Z"/><path class="p-right" d="M971 373L998 353L998 349L971 369ZM937 357L971 373L971 369L937 353Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.34" d="M971 373L998 353M971 373L937 357"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.33" d="M998 353L998 349M937 357L937 353M937 353L964 333M998 349L964 333"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.15" d="M998 349L971 369M971 369L971 373M937 353L971 369"/><path class="p-metal" d="M961 317L978 318L967 319ZM951 324L961 317L967 319ZM978 318L984 327L967 319ZM957 334L951 324L967 319ZM984 327L974 335L967 319ZM974 335L957 334L967 319Z"/><path class="p-metal p-lo" d="M957 359L951 350L951 324L957 334ZM984 352L974 360L974 335L984 327ZM974 360L957 359L957 334L974 335Z"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.67" d="M974 360L957 359M957 359L951 350M951 350L951 324M961 317L951 324M978 318L961 317M978 343L984 352M984 352L984 327M984 327L978 318M984 352L974 360"/><path class="p-line2" stroke-width="0.77" stroke-opacity="0.30" d="M957 359L957 334M974 335L974 360"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.68" d="M957 334L974 335M951 324L957 334M974 335L984 327"/><path class="p-line2" stroke-width="1.37" stroke-opacity="0.66" d="M951 350L961 342M961 342L978 343"/><path class="p-line2" stroke-width="0.64" stroke-opacity="0.44" d="M974 335L967 319M957 334L967 319M951 324L967 319M961 317L967 319M978 318L967 319M984 327L967 319"/></g><g data-part="L3" style="--i:7"><path class="p-glass" fill-opacity="0.09" d="M775 349L679 305L679 303L775 347ZM604 362L700 406L700 404L604 360Z"/><path class="p-glass" fill-opacity="0.12" d="M679 305L604 362L604 360L679 303ZM700 406L775 349L775 347L700 404Z"/><path class="p-glass" fill-opacity="0.10" d="M679 305L775 349L700 406L604 362Z"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.54" stroke-dasharray="3 3" d="M700 406L775 349M775 347L700 404M700 406L604 362M700 404L604 360"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.53" stroke-dasharray="3 3" d="M775 349L775 347M604 362L604 360"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.55" stroke-dasharray="3 3" d="M700 404L700 406"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.52" stroke-dasharray="3 3" d="M679 305L604 362M604 360L679 303"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.50" stroke-dasharray="3 3" d="M679 303L679 305"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.51" stroke-dasharray="3 3" d="M679 305L775 349M679 303L775 347"/></g><g data-part="L4" style="--i:8"><path class="p-glass" fill-opacity="0.09" d="M797 348L676 292L676 290L797 345ZM582 363L702 418L702 416L582 360Z"/><path class="p-glass" fill-opacity="0.12" d="M676 292L582 363L582 360L676 290ZM702 418L797 348L797 345L702 416Z"/><path class="p-glass" fill-opacity="0.10" d="M676 292L797 348L702 418L582 363Z"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.54" stroke-dasharray="3 3" d="M702 418L797 348M797 345L702 416"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.52" stroke-dasharray="3 3" d="M797 348L797 345"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.56" stroke-dasharray="3 3" d="M702 416L702 418"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.51" stroke-dasharray="3 3" d="M676 292L582 363M582 360L676 290M676 292L797 348M676 290L797 345"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.53" stroke-dasharray="3 3" d="M582 363L582 360"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.49" stroke-dasharray="3 3" d="M676 290L676 292"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.55" stroke-dasharray="3 3" d="M702 418L582 363M702 416L582 360"/></g><g data-part="m1" style="--i:9"><g clip-path="url(#p17fmc45)"><path class="p-shadow" opacity="0.633" filter="url(#p17fmb8)" d="M686 328L720 344L693 365L659 349Z"/></g><path class="p-foil" d="M676 294L691 299L676 295ZM661 299L676 294L676 295ZM695 347L685 354L685 316L695 308ZM668 354L657 347L657 309L668 316ZM685 354L668 354L668 316L685 316ZM691 299L695 308L676 295ZM657 309L661 299L676 295ZM695 308L685 316L676 295ZM668 316L657 309L676 295ZM685 316L668 316L676 295Z"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.75" d="M685 354L668 354M668 354L657 347M657 347L657 309M661 299L657 309M676 294L661 299M691 299L676 294M695 347L695 308M695 308L691 299"/><path class="p-fl" stroke-width="0.77" stroke-opacity="0.34" d="M668 354L668 316M685 316L685 354"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.76" d="M668 316L685 316M657 309L668 316M685 316L695 308"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.74" d="M657 347L661 337M691 337L695 347M695 347L685 354"/><path class="p-fl" stroke-width="1.58" stroke-opacity="0.73" d="M661 337L676 333M676 333L691 337"/><path class="p-fl" stroke-width="1.07" stroke-opacity="0.49" d="M685 316L676 295M668 316L676 295M657 309L676 295M661 299L676 295M676 294L676 295M691 299L676 295M695 308L676 295"/></g><g data-part="L2" style="--i:10"><path class="p-glass" fill-opacity="0.09" d="M753 351L682 318L682 255L753 288ZM626 360L697 393L697 329L626 297Z"/><path class="p-glass" fill-opacity="0.10" d="M682 318L753 351L697 393L626 360Z"/><path class="p-glass" fill-opacity="0.12" d="M682 318L626 360L626 297L682 255ZM697 393L753 351L753 288L697 329Z"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.54" stroke-dasharray="3 3" d="M697 393L753 351M626 360L626 297M626 297L682 255M697 393L626 360"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.53" stroke-dasharray="3 3" d="M753 351L753 288M682 255L753 288"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.55" stroke-dasharray="3 3" d="M753 288L697 329M697 329L697 393M697 329L626 297"/><path class="p-line2" stroke-width="0.86" stroke-opacity="0.52" stroke-dasharray="3 3" d="M682 318L626 360M682 255L682 318M682 318L753 351"/></g></svg>',
    n: '<svg xmlns="http://www.w3.org/2000/svg" class="ps3d-poster" data-reg="0" data-v="2" data-tone="dark" viewBox="0 0 840 630" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><style>.ps3d-poster[data-v="2"] .p-top{fill:var(--m-top,color-mix(in srgb,var(--paper) 55%,#fff))}.ps3d-poster[data-v="2"] .p-left{fill:var(--m-left,color-mix(in srgb,var(--paper) 88.5%,#74654A))}.ps3d-poster[data-v="2"] .p-right{fill:var(--m-right,color-mix(in srgb,var(--paper) 70%,#74654A))}.ps3d-poster[data-v="2"] .p-plaster{fill:var(--m-plaster,color-mix(in srgb,var(--paper) 94%,var(--ink)))}.ps3d-poster[data-v="2"] .p-foil{fill:var(--m-foil,var(--accent))}.ps3d-poster[data-v="2"] .p-metal{fill:var(--m-metal-hi,color-mix(in srgb,var(--muted) 45%,var(--paper)))}.ps3d-poster[data-v="2"] .p-metal.p-lo{fill:var(--m-metal-lo,color-mix(in srgb,var(--muted) 70%,var(--ink)))}.ps3d-poster[data-v="2"] .p-inkf{fill:var(--ink)}.ps3d-poster[data-v="2"] .p-inkc{fill:var(--ink)}.ps3d-poster[data-v="2"] .p-glass{fill:var(--ink-2)}.ps3d-poster[data-v="2"] .p-shadow{fill:var(--m-shadow,var(--ink));stroke:none}.ps3d-poster[data-v="2"] :is(.p-sil,.p-line,.p-line2,.p-fl){fill:none;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.ps3d-poster[data-v="2"] .p-sil{stroke:var(--m-sil,var(--ink))}.ps3d-poster[data-v="2"] .p-line{stroke:var(--ink)}.ps3d-poster[data-v="2"] .p-line2{stroke:var(--ink-2)}.ps3d-poster[data-v="2"] .p-fl{stroke:var(--foil-line)}.ps3d-poster[data-v="2"] .p-plate{filter:grayscale(1) sepia(.22) contrast(1.08) brightness(1.02)}.ps3d-poster[data-v="2"] .p-plate.is-dev{filter:none}.ps3d-poster[data-v="2"] .p-txt{fill:var(--ink)}.ps3d-poster[data-v="2"] .p-txt2{fill:var(--ink-2)}:is(:root[data-tone="dark"],.tone-dark,.band--dark,[data-ground="espresso"],[data-ground="forest"],[data-ground="slate"]) .ps3d-poster[data-v="2"] .p-top,.ps3d-poster[data-v="2"][data-tone="dark"] .p-top{fill:var(--m-top,color-mix(in srgb,var(--dark) 80%,var(--on-dark)))}:is(:root[data-tone="dark"],.tone-dark,.band--dark,[data-ground="espresso"],[data-ground="forest"],[data-ground="slate"]) .ps3d-poster[data-v="2"] .p-left,.ps3d-poster[data-v="2"][data-tone="dark"] .p-left{fill:var(--m-left,color-mix(in srgb,var(--dark) 87%,var(--on-dark)))}:is(:root[data-tone="dark"],.tone-dark,.band--dark,[data-ground="espresso"],[data-ground="forest"],[data-ground="slate"]) .ps3d-poster[data-v="2"] .p-right,.ps3d-poster[data-v="2"][data-tone="dark"] .p-right{fill:var(--m-right,color-mix(in srgb,var(--dark) 92%,var(--on-dark)))}:is(:root[data-tone="dark"],.tone-dark,.band--dark,[data-ground="espresso"],[data-ground="forest"],[data-ground="slate"]) .ps3d-poster[data-v="2"] .p-plaster,.ps3d-poster[data-v="2"][data-tone="dark"] .p-plaster{fill:var(--m-plaster,color-mix(in srgb,var(--dark) 95%,var(--on-dark)))}.ps3d-poster[data-v="2"][data-tone="dark"] .p-sil{stroke:var(--m-sil,var(--on-dark))}.ps3d-poster[data-v="2"][data-tone="dark"] .p-line{stroke:var(--on-dark)}.ps3d-poster[data-v="2"][data-tone="dark"] .p-line2{stroke:var(--on-dark-2)}.ps3d-poster[data-v="2"][data-tone="dark"] .p-shadow{fill:#000}.ps3d-poster[data-v="2"][data-tone="dark"] .p-inkf{fill:color-mix(in srgb,var(--dark) 93%,var(--on-dark))}.ps3d-poster[data-v="2"][data-tone="dark"] .p-inkc{fill:var(--on-dark)}.ps3d-poster[data-v="2"][data-tone="dark"] .p-glass{fill:var(--on-dark)}</style><defs><clipPath id="p17itc0"><path d="M231 73L306 144L228 173L153 102Z"/></clipPath><clipPath id="p17itc1"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc2"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc3"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc4"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc5"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc6"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc7"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc8"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc9"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc10"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc11"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc12"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc13"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc14"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc15"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc16"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc17"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc18"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc19"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc20"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc21"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc22"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc23"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc24"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc25"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc26"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc27"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc28"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc29"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc30"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc31"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc32"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc33"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc34"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc35"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc36"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc37"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc38"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc39"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc40"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc41"><path d="M636 373L659 395L622 409L598 387Z"/></clipPath><clipPath id="p17itc42"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><clipPath id="p17itc43"><path d="M707 440L730 462L693 476L670 454Z"/></clipPath><clipPath id="p17itc44"><path d="M531 395L633 490L470 550L369 454Z"/></clipPath><clipPath id="p17itc45"><path d="M779 507L802 529L765 543L741 521Z"/></clipPath><clipPath id="p17itk"><path d="M323 187L508 360L321 429L137 255Z"/></clipPath><filter id="p17itb1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1"/></filter><filter id="p17itb2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter><filter id="p17itb3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter><filter id="p17itb4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter><filter id="p17itb5" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter><filter id="p17itb7" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter><filter id="p17itb8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter></defs><g data-part="sub" style="--i:0"><path class="p-plaster" d="M38 160L113 231L192 202L116 131Z"/><path class="p-right" d="M38 162L113 233L113 231L38 160ZM113 233L192 204L192 202L113 231Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.26" d="M113 233L192 204"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.25" d="M192 204L192 202M113 233L38 162"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.12" d="M192 202L113 231M113 231L113 233"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.24" d="M38 162L38 160M38 160L116 131M192 202L116 131"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.11" d="M38 160L113 231"/><path class="p-line2" stroke-width="0.84" stroke-opacity="0.34" stroke-dasharray="3 3" d="M113 231L192 202M192 187L113 216"/><path class="p-line2" stroke-width="0.84" stroke-opacity="0.33" stroke-dasharray="3 3" d="M192 202L192 187M38 160L113 231M113 216L38 145"/><path class="p-line2" stroke-width="0.84" stroke-opacity="0.35" stroke-dasharray="3 3" d="M113 216L113 231"/><path class="p-line2" stroke-width="0.84" stroke-opacity="0.31" stroke-dasharray="3 3" d="M116 131L38 160M38 145L116 116M116 116L116 131"/><path class="p-line2" stroke-width="0.84" stroke-opacity="0.32" stroke-dasharray="3 3" d="M38 160L38 145M192 202L116 131M116 116L192 187"/><path class="p-metal" d="M71 145L84 157L114 146L101 134ZM94 166L106 178L136 167L124 155ZM116 187L129 199L159 188L146 176Z"/><path class="p-metal p-lo" d="M71 160L84 172L84 157L71 145ZM84 172L114 161L114 146L84 157ZM94 181L106 193L106 178L94 166ZM106 193L136 182L136 167L106 178ZM116 202L129 214L129 199L116 187ZM129 214L159 203L159 188L129 199Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.46" d="M84 172L114 161M114 161L114 146M71 160L71 145M71 145L101 134M114 146L101 134M84 172L71 160"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.21" d="M114 146L84 157M84 157L84 172M71 145L84 157M136 167L106 178M106 178L106 193M94 166L106 178"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.47" d="M106 193L136 182M136 182L136 167M94 181L94 166M94 166L124 155M136 167L124 155M106 193L94 181"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.48" d="M129 214L159 203M159 203L159 188M116 202L116 187M116 187L146 176M159 188L146 176M129 214L116 202"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.22" d="M159 188L129 199M129 199L129 214M116 187L129 199"/></g><g data-part="c0" style="--i:1"><g clip-path="url(#p17itc1)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M340 197L345 203L277 228L272 222Z"/></g><g clip-path="url(#p17itc2)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M348 205L354 210L286 235L280 230Z"/></g><g clip-path="url(#p17itc3)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M356 213L362 218L294 243L288 238Z"/></g><g clip-path="url(#p17itc4)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M364 221L370 226L302 251L296 246Z"/></g><g clip-path="url(#p17itc5)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M373 229L378 234L310 259L305 254Z"/></g><g clip-path="url(#p17itc6)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M381 236L387 242L319 267L313 261Z"/></g><g clip-path="url(#p17itc7)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M219 242L225 247L157 272L151 267Z"/></g><g clip-path="url(#p17itc8)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M389 244L395 249L327 274L321 269Z"/></g><g clip-path="url(#p17itc9)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M228 249L233 255L165 280L160 274Z"/></g><g clip-path="url(#p17itc10)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M398 252L403 257L335 282L330 277Z"/></g><g clip-path="url(#p17itc11)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb1)" d="M155 258L178 280L171 282L148 261Z"/></g><g clip-path="url(#p17itc12)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M236 257L241 262L173 287L168 282Z"/></g><g clip-path="url(#p17itc13)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M406 260L411 265L343 290L338 285Z"/></g><g clip-path="url(#p17itc14)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M244 265L250 270L182 295L176 290Z"/></g><g clip-path="url(#p17itc15)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M414 267L420 273L352 298L346 292Z"/></g><g clip-path="url(#p17itc16)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M252 273L258 278L190 303L184 298Z"/></g><g clip-path="url(#p17itc17)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M422 275L428 281L360 305L354 300Z"/></g><g clip-path="url(#p17itc18)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M261 281L266 286L198 311L193 306Z"/></g><g clip-path="url(#p17itc19)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M431 283L436 288L368 313L363 308Z"/></g><g clip-path="url(#p17itc20)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M269 288L275 294L207 319L201 313Z"/></g><g clip-path="url(#p17itc21)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M439 291L445 296L377 321L371 316Z"/></g><g clip-path="url(#p17itc22)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M277 296L283 301L215 326L209 321Z"/></g><g clip-path="url(#p17itc23)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M447 299L453 304L385 329L379 324Z"/></g><g clip-path="url(#p17itc24)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M285 304L291 309L223 334L218 329Z"/></g><g clip-path="url(#p17itc25)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M455 306L461 312L393 337L387 331Z"/></g><g clip-path="url(#p17itc26)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M294 312L299 317L231 342L226 337Z"/></g><g clip-path="url(#p17itc27)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M464 314L469 319L401 344L396 339Z"/></g><g clip-path="url(#p17itc28)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M302 319L308 325L240 350L234 344Z"/></g><g clip-path="url(#p17itc29)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M472 322L478 327L410 352L404 347Z"/></g><g clip-path="url(#p17itc30)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M310 327L316 333L248 357L242 352Z"/></g><g clip-path="url(#p17itc31)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M480 330L486 335L418 360L412 355Z"/></g><g clip-path="url(#p17itc32)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M319 335L324 340L256 365L251 360Z"/></g><g clip-path="url(#p17itc33)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M489 337L494 343L426 368L421 362Z"/></g><g clip-path="url(#p17itc34)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M327 343L332 348L264 373L259 368Z"/></g><g clip-path="url(#p17itc35)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M497 345L502 351L434 376L429 370Z"/></g><g clip-path="url(#p17itc36)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M335 351L341 356L273 381L267 376Z"/></g><g clip-path="url(#p17itc37)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M343 358L349 364L281 389L275 383Z"/></g><g clip-path="url(#p17itc38)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M352 366L357 371L289 396L284 391Z"/></g><g clip-path="url(#p17itc39)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M360 374L366 379L298 404L292 399Z"/></g><g clip-path="url(#p17itc40)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M368 382L374 387L306 412L300 407Z"/></g><g clip-path="url(#p17itc42)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M376 389L382 395L314 420L309 414Z"/></g><path class="p-plaster" d="M137 255L321 429L508 360L323 187Z"/><path class="p-right" d="M137 259L321 432L321 429L137 255ZM321 432L508 364L508 360L321 429Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.39" d="M321 432L508 364"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.38" d="M508 364L508 360"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.18" d="M508 360L321 429M321 429L321 432"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.33" d="M137 259L137 255"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.32" d="M137 255L323 187"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.17" d="M137 255L321 429"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.34" d="M508 360L323 187"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.37" d="M321 432L137 259"/><path class="p-metal p-lo" d="M273 226L339 202L339 186L273 210ZM268 222L273 226L273 210L268 206Z"/><path class="p-metal" d="M268 206L273 210L339 186L335 181Z"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.58" d="M273 226L339 202M268 206L335 181M273 226L268 222"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.57" d="M339 202L339 186M339 186L335 181"/><path class="p-line" stroke-width="1.01" stroke-opacity="0.26" d="M339 186L273 210M273 210L273 226M268 206L273 210"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.59" d="M268 222L268 206"/><path class="p-metal p-lo" d="M281 234L347 209L347 193L281 218ZM277 230L281 234L281 218L277 213Z"/><path class="p-metal" d="M277 213L281 218L347 193L343 189Z"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.58" d="M281 234L347 209M347 209L347 193M277 213L343 189M347 193L343 189"/><path class="p-line" stroke-width="1.01" stroke-opacity="0.26" d="M347 193L281 218"/><path class="p-line" stroke-width="1.01" stroke-opacity="0.27" d="M281 218L281 234M277 213L281 218"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.59" d="M277 230L277 213M281 234L277 230"/><path class="p-metal p-lo" d="M289 242L356 217L356 201L289 225ZM285 237L289 242L289 225L285 221Z"/><path class="p-metal" d="M285 221L289 225L356 201L351 197Z"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.59" d="M289 242L356 217M285 221L351 197"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.58" d="M356 217L356 201M356 201L351 197"/><path class="p-line" stroke-width="1.01" stroke-opacity="0.27" d="M356 201L289 225M289 225L289 242M285 221L289 225"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.60" d="M285 237L285 221M289 242L285 237"/><path class="p-metal p-lo" d="M298 249L364 225L364 209L298 233ZM293 245L298 249L298 233L293 229Z"/><path class="p-metal" d="M293 229L298 233L364 209L359 205Z"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.59" d="M298 249L364 225M364 225L364 209M364 209L359 205"/><path class="p-line" stroke-width="1.01" stroke-opacity="0.27" d="M364 209L298 233M298 233L298 249M293 229L298 233"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.60" d="M293 245L293 229M293 229L359 205M298 249L293 245"/><path class="p-metal p-lo" d="M306 257L372 233L372 217L306 241ZM301 253L306 257L306 241L301 237Z"/><path class="p-metal" d="M301 237L306 241L372 217L368 212Z"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.60" d="M306 257L372 233M301 237L368 212"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.59" d="M372 233L372 217M372 217L368 212"/><path class="p-line" stroke-width="1.01" stroke-opacity="0.27" d="M372 217L306 241M306 241L306 257M301 237L306 241"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.61" d="M301 253L301 237M306 257L301 253"/><path class="p-metal p-lo" d="M314 265L380 241L380 225L314 249ZM310 261L314 265L314 249L310 245Z"/><path class="p-metal" d="M310 245L314 249L380 225L376 220Z"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.61" d="M314 265L380 241M310 261L310 245M310 245L376 220M314 265L310 261"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.60" d="M380 241L380 225M380 225L376 220"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.27" d="M380 225L314 249"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.28" d="M314 249L314 265M310 245L314 249"/><path class="p-metal p-lo" d="M153 270L219 246L219 230L153 254ZM148 266L153 270L153 254L148 250Z"/><path class="p-metal" d="M148 250L153 254L219 230L214 226Z"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.61" d="M153 270L219 246M148 250L214 226"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.60" d="M219 246L219 230M219 230L214 226"/><path class="p-line" stroke-width="1.01" stroke-opacity="0.28" d="M219 230L153 254M153 254L153 270M148 250L153 254"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.62" d="M148 266L148 250M153 270L148 266"/><path class="p-metal p-lo" d="M323 273L389 248L389 232L323 257ZM318 268L323 273L323 257L318 252Z"/><path class="p-metal" d="M318 252L323 257L389 232L384 228Z"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.61" d="M323 273L389 248M389 248L389 232M318 252L384 228M389 232L384 228"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.28" d="M389 232L323 257M323 257L323 273M318 252L323 257"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.62" d="M318 268L318 252M323 273L318 268"/><path class="p-metal p-lo" d="M161 278L227 254L227 238L161 262ZM156 274L161 278L161 262L156 258Z"/><path class="p-metal" d="M156 258L161 262L227 238L223 233Z"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.62" d="M161 278L227 254M156 274L156 258M156 258L223 233M161 278L156 274"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.61" d="M227 254L227 238M227 238L223 233"/><path class="p-line" stroke-width="1.01" stroke-opacity="0.28" d="M227 238L161 262M161 262L161 278M156 258L161 262"/><path class="p-metal p-lo" d="M331 280L397 256L397 240L331 264ZM326 276L331 280L331 264L326 260Z"/><path class="p-metal" d="M326 260L331 264L397 240L392 236Z"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.62" d="M331 280L397 256M326 260L392 236M331 280L326 276"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.61" d="M397 256L397 240M397 240L392 236"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.28" d="M397 240L331 264M331 264L331 280M326 260L331 264"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.63" d="M326 276L326 260"/><path class="p-plaster" d="M148 260L170 281L178 279L155 257Z"/><path class="p-right" d="M148 261L170 282L170 281L148 260ZM170 282L178 280L178 279L170 281Z"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.63" d="M170 282L178 280M178 280L178 279"/><path class="p-line" stroke-width="1.01" stroke-opacity="0.28" d="M178 279L170 281M170 281L170 282M148 260L170 281"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.61" d="M148 261L148 260M148 260L155 257"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.62" d="M178 279L155 257M170 282L148 261"/><path class="p-metal p-lo" d="M169 286L235 261L235 245L169 270ZM165 282L169 286L169 270L165 265Z"/><path class="p-metal" d="M165 265L169 270L235 245L231 241Z"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.62" d="M169 286L235 261M235 261L235 245M165 265L231 241M235 245L231 241"/><path class="p-line" stroke-width="1.01" stroke-opacity="0.28" d="M235 245L169 270M169 270L169 286M165 265L169 270"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.63" d="M165 282L165 265M169 286L165 282"/><path class="p-metal p-lo" d="M339 288L405 264L405 248L339 272ZM335 284L339 288L339 272L335 268Z"/><path class="p-metal" d="M335 268L339 272L405 248L401 244Z"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.62" d="M339 288L405 264M405 264L405 248M405 248L401 244"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.28" d="M405 248L339 272M339 272L339 288"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.63" d="M335 284L335 268M335 268L401 244M339 288L335 284"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.29" d="M335 268L339 272"/><path class="p-metal p-lo" d="M177 294L244 269L244 253L177 277ZM173 289L177 294L177 277L173 273Z"/><path class="p-metal" d="M173 273L177 277L244 253L239 249Z"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.63" d="M177 294L244 269M173 273L239 249"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.62" d="M244 269L244 253M244 253L239 249"/><path class="p-line" stroke-width="1.01" stroke-opacity="0.28" d="M244 253L177 277"/><path class="p-line" stroke-width="1.01" stroke-opacity="0.29" d="M177 277L177 294M173 273L177 277"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.64" d="M173 289L173 273M177 294L173 289"/><path class="p-metal p-lo" d="M347 296L414 272L414 256L347 280ZM343 292L347 296L347 280L343 276Z"/><path class="p-metal" d="M343 276L347 280L414 256L409 251Z"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.63" d="M347 296L414 272M343 276L409 251"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.62" d="M414 272L414 256M414 256L409 251"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.28" d="M414 256L347 280"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.29" d="M347 280L347 296M343 276L347 280"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.64" d="M343 292L343 276M347 296L343 292"/><path class="p-metal p-lo" d="M186 301L252 277L252 261L186 285ZM181 297L186 301L186 285L181 281Z"/><path class="p-metal" d="M181 281L186 285L252 261L247 257Z"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.63" d="M186 301L252 277M252 277L252 261M252 261L247 257"/><path class="p-line" stroke-width="1.01" stroke-opacity="0.29" d="M252 261L186 285M186 285L186 301M181 281L186 285"/><path class="p-sil" stroke-width="1.80" stroke-opacity="0.64" d="M181 297L181 281M181 281L247 257M186 301L181 297"/><path class="p-metal p-lo" d="M356 304L422 280L422 263L356 288ZM351 300L356 304L356 288L351 283Z"/><path class="p-metal" d="M351 283L356 288L422 263L417 259Z"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.64" d="M356 304L422 280M351 300L351 283M351 283L417 259M356 304L351 300"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.63" d="M422 280L422 263M422 263L417 259"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.29" d="M422 263L356 288M356 288L356 304M351 283L356 288"/><path class="p-metal p-lo" d="M194 309L260 285L260 269L194 293ZM189 305L194 309L194 293L189 289Z"/><path class="p-metal" d="M189 289L194 293L260 269L256 264Z"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.64" d="M194 309L260 285M189 289L256 264"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.63" d="M260 285L260 269M260 269L256 264"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.29" d="M260 269L194 293M194 293L194 309M189 289L194 293"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.65" d="M189 305L189 289M194 309L189 305"/><path class="p-metal p-lo" d="M364 312L430 287L430 271L364 296ZM359 307L364 312L364 296L359 291Z"/><path class="p-metal" d="M359 291L364 296L430 271L426 267Z"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.64" d="M364 312L430 287M430 287L430 271M359 291L426 267M430 271L426 267"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.29" d="M430 271L364 296M364 296L364 312M359 291L364 296"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.65" d="M359 307L359 291M364 312L359 307"/><path class="p-metal p-lo" d="M202 317L268 293L268 277L202 301ZM198 313L202 317L202 301L198 297Z"/><path class="p-metal" d="M198 297L202 301L268 277L264 272Z"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.65" d="M202 317L268 293M198 297L264 272M202 317L198 313"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.64" d="M268 293L268 277M268 277L264 272"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.29" d="M268 277L202 301M202 301L202 317"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.66" d="M198 313L198 297"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.30" d="M198 297L202 301"/><path class="p-metal p-lo" d="M372 319L438 295L438 279L372 303ZM368 315L372 319L372 303L368 299Z"/><path class="p-metal" d="M368 299L372 303L438 279L434 275Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.58" d="M372 319L438 295M438 295L438 279M438 279L434 275"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.26" d="M438 279L372 303"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.27" d="M372 303L372 319M368 299L372 303"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.59" d="M368 315L368 299M368 299L434 275M372 319L368 315"/><path class="p-metal p-lo" d="M210 325L277 300L277 284L210 309ZM206 320L210 325L210 309L206 304Z"/><path class="p-metal" d="M206 304L210 309L277 284L272 280Z"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.65" d="M210 325L277 300M277 300L277 284M277 284L272 280"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.29" d="M277 284L210 309"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.30" d="M210 309L210 325M206 304L210 309"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.66" d="M206 320L206 304M206 304L272 280M210 325L206 320"/><path class="p-metal p-lo" d="M380 327L447 303L447 287L380 311ZM376 323L380 327L380 311L376 307Z"/><path class="p-metal" d="M376 307L380 311L447 287L442 283Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.52" d="M380 327L447 303M447 303L447 287M447 287L442 283"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.24" d="M447 287L380 311M380 311L380 327M376 307L380 311"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.53" d="M376 323L376 307M376 307L442 283M380 327L376 323"/><path class="p-metal p-lo" d="M219 332L285 308L285 292L219 316ZM214 328L219 332L219 316L214 312Z"/><path class="p-metal" d="M214 312L219 316L285 292L280 288Z"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.66" d="M219 332L285 308M214 312L280 288"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.65" d="M285 308L285 292M285 292L280 288"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.30" d="M285 292L219 316M219 316L219 332M214 312L219 316"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.67" d="M214 328L214 312M219 332L214 328"/><path class="p-metal p-lo" d="M389 335L455 311L455 295L389 319ZM384 331L389 335L389 319L384 315Z"/><path class="p-metal" d="M384 315L389 319L455 295L450 290Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.53" d="M389 335L455 311M384 315L450 290M389 335L384 331"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.52" d="M455 311L455 295M455 295L450 290"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.24" d="M455 295L389 319M389 319L389 335M384 315L389 319"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.54" d="M384 331L384 315"/><path class="p-metal p-lo" d="M227 340L293 316L293 300L227 324ZM222 336L227 340L227 324L222 320Z"/><path class="p-metal" d="M222 320L227 324L293 300L289 296Z"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.66" d="M227 340L293 316M293 316L293 300M293 300L289 296"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.30" d="M293 300L227 324M227 324L227 340M222 320L227 324"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.67" d="M222 336L222 320M222 320L289 296M227 340L222 336"/><path class="p-metal p-lo" d="M397 343L463 318L463 302L397 327ZM392 338L397 343L397 327L392 322Z"/><path class="p-metal" d="M392 322L397 327L463 302L459 298Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.53" d="M397 343L463 318M463 318L463 302M463 302L459 298"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.24" d="M463 302L397 327M397 327L397 343M392 322L397 327"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.54" d="M392 338L392 322M392 322L459 298M397 343L392 338"/><path class="p-metal p-lo" d="M235 348L301 324L301 308L235 332ZM231 344L235 348L235 332L231 328Z"/><path class="p-metal" d="M231 328L235 332L301 308L297 303Z"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.67" d="M235 348L301 324M231 328L297 303M301 308L297 303"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.66" d="M301 324L301 308"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.30" d="M301 308L235 332"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.31" d="M235 332L235 348M231 328L235 332"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.68" d="M231 344L231 328M235 348L231 344"/><path class="p-metal p-lo" d="M405 351L471 326L471 310L405 334ZM401 346L405 351L405 334L401 330Z"/><path class="p-metal" d="M401 330L405 334L471 310L467 306Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.54" d="M405 351L471 326M401 330L467 306M405 351L401 346"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.53" d="M471 326L471 310M471 310L467 306"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.24" d="M471 310L405 334"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.25" d="M405 334L405 351M401 330L405 334"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.55" d="M401 346L401 330"/><path class="p-metal p-lo" d="M244 356L310 331L310 315L244 340ZM239 352L244 356L244 340L239 335Z"/><path class="p-metal" d="M239 335L244 340L310 315L305 311Z"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.68" d="M244 356L310 331M239 335L305 311M244 356L239 352"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.67" d="M310 331L310 315M310 315L305 311"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.31" d="M310 315L244 340M244 340L244 356M239 335L244 340"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.69" d="M239 352L239 335"/><path class="p-metal p-lo" d="M414 358L480 334L480 318L414 342ZM409 354L414 358L414 342L409 338Z"/><path class="p-metal" d="M409 338L414 342L480 318L475 314Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.54" d="M414 358L480 334M480 334L480 318M480 318L475 314"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.25" d="M480 318L414 342M414 342L414 358M409 338L414 342"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.55" d="M409 354L409 338M409 338L475 314M414 358L409 354"/><path class="p-metal p-lo" d="M252 364L318 339L318 323L252 348ZM247 359L252 364L252 348L247 343Z"/><path class="p-metal" d="M247 343L252 348L318 323L314 319Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.61" d="M252 364L318 339M318 339L318 323M318 323L314 319"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.28" d="M318 323L252 348M252 348L252 364M247 343L252 348"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.62" d="M247 359L247 343M247 343L314 319M252 364L247 359"/><path class="p-metal p-lo" d="M422 366L488 342L488 326L422 350ZM417 362L422 366L422 350L417 346Z"/><path class="p-metal" d="M417 346L422 350L488 326L483 321Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.55" d="M422 366L488 342M417 346L483 321M422 366L417 362"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.54" d="M488 342L488 326M488 326L483 321"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.25" d="M488 326L422 350M422 350L422 366M417 346L422 350"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.56" d="M417 362L417 346"/><path class="p-metal p-lo" d="M260 371L326 347L326 331L260 355ZM256 367L260 371L260 355L256 351Z"/><path class="p-metal" d="M256 351L260 355L326 331L322 327Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.55" d="M260 371L326 347M326 347L326 331M256 351L322 327M326 331L322 327"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.25" d="M326 331L260 355M260 355L260 371M256 351L260 355"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.56" d="M256 367L256 351M260 371L256 367"/><path class="p-metal p-lo" d="M430 374L496 350L496 333L430 358ZM426 370L430 374L430 358L426 354Z"/><path class="p-metal" d="M426 354L430 358L496 333L492 329Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.55" d="M430 374L496 350M496 350L496 333M496 333L492 329"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.25" d="M496 333L430 358M430 358L430 374M426 354L430 358"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.56" d="M426 370L426 354M426 354L492 329M430 374L426 370"/><path class="p-metal p-lo" d="M268 379L335 355L335 339L268 363ZM264 375L268 379L268 363L264 359Z"/><path class="p-metal" d="M264 359L268 363L335 339L330 335Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.56" d="M268 379L335 355M264 375L264 359M264 359L330 335M268 379L264 375"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.55" d="M335 355L335 339M335 339L330 335"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.25" d="M335 339L268 363M268 363L268 379M264 359L268 363"/><path class="p-metal p-lo" d="M277 387L343 363L343 347L277 371ZM272 383L277 387L277 371L272 367Z"/><path class="p-metal" d="M272 367L277 371L343 347L338 342Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.56" d="M277 387L343 363M343 363L343 347M272 367L338 342M343 347L338 342"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.25" d="M343 347L277 371"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.26" d="M277 371L277 387M272 367L277 371"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.57" d="M272 383L272 367M277 387L272 383"/><path class="p-metal p-lo" d="M285 395L351 370L351 354L285 379ZM280 390L285 395L285 379L280 374Z"/><path class="p-metal" d="M280 374L285 379L351 354L347 350Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.57" d="M285 395L351 370M280 390L280 374M280 374L347 350M285 395L280 390"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.56" d="M351 370L351 354M351 354L347 350"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.26" d="M351 354L285 379M285 379L285 395M280 374L285 379"/><path class="p-metal p-lo" d="M293 402L359 378L359 362L293 386ZM289 398L293 402L293 386L289 382Z"/><path class="p-metal" d="M289 382L293 386L359 362L355 358Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.57" d="M293 402L359 378M359 378L359 362M289 382L355 358M359 362L355 358"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.26" d="M359 362L293 386M293 386L293 402M289 382L293 386"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.58" d="M289 398L289 382M293 402L289 398"/><path class="p-metal p-lo" d="M301 410L368 386L368 370L301 394ZM297 406L301 410L301 394L297 390Z"/><path class="p-metal" d="M297 390L301 394L368 370L363 366Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.58" d="M301 410L368 386M297 406L297 390M297 390L363 366M301 410L297 406"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.57" d="M368 386L368 370M368 370L363 366"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.26" d="M368 370L301 394M301 394L301 410M297 390L301 394"/><path class="p-metal p-lo" d="M310 418L376 394L376 378L310 402ZM305 414L310 418L310 402L305 398Z"/><path class="p-metal" d="M305 398L310 402L376 378L371 373Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.58" d="M310 418L376 394M305 398L371 373M376 378L371 373"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.57" d="M376 394L376 378"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.26" d="M376 378L310 402M310 402L310 418M305 398L310 402"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.59" d="M305 414L305 398M310 418L305 414"/></g><g data-part="plinth" style="--i:2"><path class="p-plaster" d="M369 454L470 550L633 490L531 395Z"/><path class="p-right" d="M369 461L470 557L470 550L369 454ZM470 557L633 497L633 490L470 550Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.36" d="M470 557L633 497M470 557L369 461"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.35" d="M633 497L633 490"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.16" d="M633 490L470 550M470 550L470 557M369 454L470 550"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.34" d="M369 461L369 454M633 490L531 395"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.33" d="M369 454L531 395"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p17itb2)" d="M122 133L198 205L118 235L42 163Z"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p17itb4)" d="M325 189L511 364L321 434L135 259Z"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p17itb3)" d="M534 401L637 498L472 558L369 461Z"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p17itb3)" d="M237 91L313 163L233 193L156 121Z"/></g><g><path class="p-shadow" opacity="0.621" filter="url(#p17itb3)" d="M107 150L166 206L134 218L75 162Z"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p17itb1)" d="M637 377L661 399L623 413L599 391Z"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p17itb1)" d="M708 444L732 466L694 480L671 458Z"/></g><g><path class="p-shadow" opacity="0.633" filter="url(#p17itb1)" d="M780 511L804 534L766 548L742 525Z"/></g><g clip-path="url(#p17itk)"><g opacity="0.360" filter="url(#p17itb2)"><path class="p-shadow" d="M162 119L237 189L315 161L240 90ZM153 117L228 187L237 189L162 119ZM228 187L306 159L315 161L237 189ZM245 110L245 113L247 113L247 110ZM242 117L237 118L232 118L228 117L225 115L223 112L223 110L225 107L229 105L233 104L238 104L242 106L245 108L247 110L247 113L245 115ZM223 115L221 112L223 112L225 115ZM245 113L243 115L245 115L247 113ZM226 117L223 115L225 115L228 117ZM243 115L240 117L242 117L245 115ZM231 118L226 117L228 117L232 118ZM240 117L235 118L237 118L242 117ZM235 118L231 118L232 118L237 118ZM209 123L209 126L211 126L211 123ZM205 131L201 132L196 131L192 130L189 128L187 126L187 123L189 120L193 119L197 118L202 118L206 119L209 121L211 123L211 126L209 129ZM187 128L185 125L187 126L189 128ZM209 126L207 128L209 129L211 126ZM190 130L187 128L189 128L192 130ZM207 128L204 130L205 131L209 129ZM194 131L190 130L192 130L196 131ZM204 130L199 131L201 132L205 131ZM199 131L194 131L196 131L201 132ZM269 132L268 134L270 135L270 132ZM265 139L260 140L256 140L251 139L248 137L247 134L247 132L249 129L252 127L256 126L261 126L265 127L269 129L270 132L270 135L268 137ZM246 137L245 134L247 134L248 137ZM268 134L266 137L268 137L270 135ZM250 139L246 137L248 137L251 139ZM266 137L263 139L265 139L268 137ZM254 140L250 139L251 139L256 140ZM263 139L259 140L260 140L265 139ZM259 140L254 140L256 140L260 140ZM232 145L232 148L234 148L234 145ZM229 153L224 153L220 153L215 152L212 150L210 148L211 145L212 142L216 140L220 140L225 140L229 141L233 143L234 145L234 148L232 151ZM210 150L209 147L210 148L212 150ZM232 148L230 150L232 151L234 148ZM214 152L210 150L212 150L215 152ZM230 150L227 152L229 153L232 151ZM218 153L214 152L215 152L220 153ZM227 152L223 153L224 153L229 153ZM223 153L218 153L220 153L224 153ZM292 154L292 156L293 157L294 154ZM288 161L284 162L279 162L275 161L272 159L270 156L270 154L272 151L275 149L280 148L284 148L289 149L292 151L294 154L293 157L292 159ZM270 159L268 156L270 156L272 159ZM292 156L290 159L292 159L293 157ZM273 161L270 159L272 159L275 161ZM290 159L286 161L288 161L292 159ZM277 162L273 161L275 161L279 162ZM286 161L282 162L284 162L288 161ZM282 162L277 162L279 162L284 162ZM256 167L256 170L257 170L258 167ZM252 174L248 175L243 175L239 174L235 172L234 170L234 167L236 164L239 162L244 161L248 162L253 163L256 165L258 167L257 170L255 173ZM234 172L232 169L234 170L235 172ZM256 170L254 172L255 173L257 170ZM237 174L234 172L235 172L239 174ZM254 172L250 174L252 174L255 173ZM241 175L237 174L239 174L243 175ZM250 174L246 175L248 175L252 174ZM246 175L241 175L243 175L248 175ZM599 387L622 409L659 396L636 374ZM598 387L622 409L622 409L599 387ZM622 409L659 396L659 396L622 409ZM645 388L643 397L669 402L671 393ZM617 399L612 390L638 395L642 403ZM646 388L660 387L662 398ZM643 397L631 401L656 406L669 402ZM660 387L671 393L662 398ZM631 401L617 399L642 403L656 406ZM638 395L646 388L662 398ZM671 393L669 402L662 398ZM642 403L638 395L662 398ZM669 402L656 406L662 398ZM656 406L642 403L662 398ZM670 455L693 477L731 463L707 441ZM670 455L693 476L693 477L670 455ZM693 476L730 463L731 463L693 477ZM717 457L714 465L743 470L746 463ZM691 467L684 460L712 466L719 472ZM714 465L703 469L732 474L743 470ZM726 454L739 456L737 466ZM703 469L691 467L719 472L732 474ZM715 458L726 454L737 466ZM739 456L746 463L737 466ZM712 466L715 458L737 466ZM746 463L743 470L737 466ZM719 472L712 466L737 466ZM743 470L732 474L737 466ZM732 474L719 472L737 466ZM516 459L514 469L538 474L540 464ZM483 471L477 461L502 466L507 476ZM511 457L528 456L528 469ZM528 456L540 464L528 469ZM502 466L511 457L528 469ZM514 469L499 474L524 479L538 474ZM499 474L483 471L507 476L524 479ZM540 464L538 474L528 469ZM507 476L502 466L528 469ZM538 474L524 479L528 469ZM524 479L507 476L528 469ZM742 522L765 544L802 530L779 508ZM741 522L765 544L765 544L742 522ZM765 544L802 530L802 530L765 544ZM757 531L757 521L773 524L774 534ZM788 519L803 524L793 530ZM773 524L788 519L793 530ZM787 531L773 536L789 539L803 534ZM773 536L757 531L774 534L789 539ZM803 524L803 534L793 530ZM774 534L773 524L793 530ZM803 534L789 539L793 530ZM789 539L774 534L793 530Z"/></g></g><g data-part="cool" style="--i:3"><g clip-path="url(#p17itc0)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb1)" d="M229 84L289 141L231 162L171 105Z"/></g><path class="p-metal" d="M153 102L228 173L306 144L231 73Z"/><path class="p-metal p-lo" d="M153 120L228 191L228 173L153 102ZM228 191L306 162L306 144L228 173Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.46" d="M228 191L306 162M306 162L306 144"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.21" d="M306 144L228 173M228 173L228 191"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.44" d="M153 120L153 102M306 144L231 73"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.43" d="M153 102L231 73"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.20" d="M153 102L228 173"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.45" d="M228 191L153 120"/><path class="p-inkf" d="M236 93L236 96L236 93L236 90ZM230 98L226 99L221 99L217 97L214 95L212 93L212 90L214 87L218 86L222 85L227 85L231 86L234 88L236 90L236 93L234 96ZM214 98L212 96L212 93L214 95ZM236 96L234 99L234 96L236 93ZM217 100L214 98L214 95L217 97ZM234 99L230 100L230 98L234 96ZM221 101L217 100L217 97L221 99ZM230 100L226 101L226 99L230 98ZM226 101L221 101L221 99L226 99ZM200 107L200 109L200 106L200 104ZM194 111L190 112L185 112L181 111L178 109L176 106L176 103L178 101L182 99L186 98L191 98L195 99L198 101L200 104L200 106L198 109ZM178 111L176 109L176 106L178 109ZM200 109L198 112L198 109L200 106ZM181 114L178 111L178 109L181 111ZM198 112L194 114L194 111L198 109ZM185 115L181 114L181 111L185 112ZM194 114L190 115L190 112L194 111ZM190 115L185 115L185 112L190 112ZM259 115L259 118L259 115L259 112ZM254 120L249 121L245 120L240 119L237 117L235 115L236 112L238 109L241 108L245 107L250 107L254 108L258 110L259 112L259 115L257 118ZM237 120L235 118L235 115L237 117ZM259 118L257 121L257 118L259 115ZM240 122L237 120L237 117L240 119ZM257 121L254 122L254 120L257 118ZM245 123L240 122L240 119L245 120ZM254 122L249 123L249 121L254 120ZM249 123L245 123L245 120L249 121ZM223 128L223 131L223 128L223 126ZM218 133L213 134L209 134L204 133L201 131L199 128L199 125L201 123L205 121L209 120L214 120L218 121L221 123L223 126L223 128L221 131ZM201 133L199 131L199 128L201 131ZM223 131L221 134L221 131L223 128ZM204 135L201 133L201 131L204 133ZM221 134L218 136L218 133L221 131ZM209 137L204 135L204 133L209 134ZM218 136L213 137L213 134L218 133ZM213 137L209 137L209 134L213 134ZM283 137L282 140L282 137L283 134ZM277 141L273 142L268 142L264 141L260 139L259 137L259 134L261 131L264 129L269 128L273 129L278 130L281 132L283 134L282 137L280 140ZM260 142L259 140L259 137L260 139ZM282 140L280 142L280 140L282 137ZM264 144L260 142L260 139L264 141ZM280 142L277 144L277 141L280 140ZM268 145L264 144L264 141L268 142ZM277 144L273 145L273 142L277 141ZM273 145L268 145L268 142L273 142ZM246 150L246 153L246 150L246 148ZM241 155L237 156L232 156L228 155L224 152L223 150L223 147L225 145L228 143L233 142L237 142L242 143L245 145L246 148L246 150L244 153ZM224 155L223 153L223 150L224 152ZM246 153L244 156L244 153L246 150ZM228 157L224 155L224 152L228 155ZM244 156L241 158L241 155L244 153ZM232 159L228 157L228 155L232 156ZM241 158L237 159L237 156L241 155ZM237 159L232 159L232 156L237 156Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.26" d="M194 114L190 115M190 115L185 115M185 115L181 114M181 114L178 111M178 111L176 109M176 109L176 106M176 103L176 106M178 101L176 103M182 99L178 101M186 98L182 99M191 98L186 98M195 99L191 98M198 101L195 99M200 107L200 104M200 104L198 101M200 107L200 109M200 109L198 112M198 112L194 114M230 100L226 101M226 101L221 101M221 101L217 100M217 100L214 98M214 98L212 96M212 96L212 93M212 90L212 93M214 87L212 90M218 86L214 87M222 85L218 86M227 85L222 85M231 86L227 85M234 88L231 86M236 93L236 90M236 90L234 88M236 93L236 96M236 96L234 99M234 99L230 100M240 122L237 120M237 120L235 118M235 118L235 115M236 112L235 115M238 109L236 112M241 108L238 109M245 107L241 108M250 107L245 107M254 108L250 107M258 110L254 108M259 115L259 112M259 112L258 110M259 115L259 118M259 118L257 121M257 121L254 122"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.12" d="M190 112L194 111M185 112L190 112M181 111L185 112M178 109L181 111M176 106L178 109M200 106L200 104M198 109L200 106M194 111L198 109M213 134L218 133M209 134L213 134M204 133L209 134M201 131L204 133M199 128L201 131M223 128L223 126M221 131L223 128M218 133L221 131M237 156L241 155M232 156L237 156M228 155L232 156M224 152L228 155M223 150L224 152M246 150L246 148M244 153L246 150M241 155L244 153M226 99L230 98M221 99L226 99M217 97L221 99M214 95L217 97M212 93L214 95M236 93L236 90M234 96L236 93M230 98L234 96M249 121L254 120M245 120L249 121M240 119L245 120M237 117L240 119M235 115L237 117M259 115L259 112M257 118L259 115M254 120L257 118M273 142L277 141M268 142L273 142M264 141L268 142M260 139L264 141M259 137L260 139M282 137L283 134M280 140L282 137M277 141L280 140"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.27" d="M218 136L213 137M213 137L209 137M209 137L204 135M204 135L201 133M201 133L199 131M199 131L199 128M199 125L199 128M201 123L199 125M205 121L201 123M209 120L205 121M214 120L209 120M218 121L214 120M221 123L218 121M223 128L223 126M223 126L221 123M223 128L223 131M223 131L221 134M221 134L218 136M223 153L223 150M223 147L223 150M225 145L223 147M228 143L225 145M233 142L228 143M237 142L233 142M242 143L237 142M245 145L242 143M246 150L246 148M246 148L245 145M246 150L246 153M254 122L249 123M249 123L245 123M245 123L240 122M277 144L273 145M273 145L268 145M268 145L264 144M264 144L260 142M260 142L259 140M259 140L259 137M259 134L259 137M261 131L259 134M264 129L261 131M269 128L264 129M273 129L269 128M278 130L273 129M281 132L278 130M283 137L283 134M283 134L281 132M283 137L282 140M282 140L280 142M280 142L277 144"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.28" d="M241 158L237 159M237 159L232 159M232 159L228 157M228 157L224 155M224 155L223 153M246 153L244 156M244 156L241 158"/></g><g data-part="rv0" style="--i:4"><g clip-path="url(#p17itc41)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb7)" d="M650 377L671 397L637 409L616 390Z"/></g><path class="p-plaster" d="M598 387L622 409L659 395L636 373Z"/><path class="p-right" d="M598 391L622 413L622 409L598 387ZM622 413L659 399L659 395L622 409Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.32" d="M622 413L659 399M659 399L659 395M598 391L598 387M598 387L636 373M659 395L636 373M622 413L598 391"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.15" d="M659 395L622 409M622 409L622 413"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.14" d="M598 387L622 409"/><path class="p-metal p-lo" d="M645 388L643 396L643 356L645 347ZM617 398L612 390L612 349L617 357ZM620 342L634 341L629 339ZM643 396L631 401L631 360L643 356ZM631 401L617 398L617 357L631 360Z"/><path class="p-metal" d="M634 341L645 347L629 339ZM612 349L620 342L629 339ZM645 347L643 356L629 339ZM617 357L612 349L629 339ZM643 356L631 360L629 339ZM631 360L617 357L629 339Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.65" d="M631 401L617 398M612 390L612 349M620 342L612 349M634 341L620 342M645 388L645 347M645 347L634 341M643 396L631 401"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.29" d="M617 398L617 357M631 360L631 401M643 396L643 356"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.66" d="M617 357L631 360M612 349L617 357M643 356L645 347M631 360L643 356"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.64" d="M617 398L612 390M612 390L620 382M620 382L634 381M634 381L645 388M645 388L643 396"/><path class="p-line2" stroke-width="0.84" stroke-opacity="0.43" d="M631 360L629 339M617 357L629 339M612 349L629 339M645 347L629 339M643 356L629 339"/><path class="p-line2" stroke-width="0.84" stroke-opacity="0.42" d="M620 342L629 339M634 341L629 339"/></g><g data-part="rv1" style="--i:5"><g clip-path="url(#p17itc43)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb8)" d="M723 445L744 465L711 477L690 458Z"/></g><path class="p-plaster" d="M670 454L693 476L730 462L707 440Z"/><path class="p-right" d="M670 458L693 480L693 476L670 454ZM693 480L730 466L730 462L693 476Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.35" d="M693 480L730 466"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.34" d="M730 466L730 462M670 458L670 454M670 454L707 440M730 462L707 440M693 480L670 458"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.15" d="M730 462L693 476M670 454L693 476"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.16" d="M693 476L693 480"/><path class="p-metal p-lo" d="M717 456L714 464L714 418L717 411ZM690 466L683 460L683 414L690 421ZM714 464L703 468L703 422L714 418ZM697 403L710 404L700 400ZM703 468L690 466L690 421L703 422ZM686 407L697 403L700 400Z"/><path class="p-metal" d="M710 404L717 411L700 400ZM683 414L686 407L700 400ZM717 411L714 418L700 400ZM690 421L683 414L700 400ZM714 418L703 422L700 400ZM703 422L690 421L700 400Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.69" d="M703 468L690 466M690 466L683 460M683 460L683 414M683 460L686 452M717 456L717 411M717 456L714 464M714 464L703 468"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.31" d="M690 466L690 421M703 422L703 468M714 464L714 418"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.71" d="M690 421L703 422M703 422L714 418"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.70" d="M683 414L690 421M686 407L683 414M697 403L686 407M710 404L697 403M717 411L710 404M714 418L717 411"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.68" d="M686 452L697 448M697 448L710 450M710 450L717 456"/><path class="p-line2" stroke-width="0.84" stroke-opacity="0.46" d="M703 422L700 400M690 421L700 400M714 418L700 400"/><path class="p-line2" stroke-width="0.84" stroke-opacity="0.45" d="M683 414L700 400M686 407L700 400M697 403L700 400M710 404L700 400M717 411L700 400"/></g><g data-part="m1" style="--i:6"><g clip-path="url(#p17itc44)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb7)" d="M516 443L540 465L501 479L478 457Z"/></g><path class="p-foil" d="M514 455L512 465L512 426L514 416ZM481 467L475 457L475 419L481 428ZM484 410L501 409L495 409ZM501 409L514 416L495 409ZM475 419L484 410L495 409ZM512 465L497 470L497 431L512 426ZM497 470L481 467L481 428L497 431ZM514 416L512 426L495 409ZM481 428L475 419L495 409ZM512 426L497 431L495 409ZM497 431L481 428L495 409Z"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.77" d="M497 470L481 467M481 467L475 457M475 457L475 419M501 409L484 410M514 455L514 416M514 416L501 409M514 455L512 465M512 465L497 470"/><path class="p-fl" stroke-width="1.01" stroke-opacity="0.35" d="M481 467L481 428M497 431L497 470M512 465L512 426"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.79" d="M481 428L497 431M497 431L512 426"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.78" d="M475 419L481 428M484 410L475 419M512 426L514 416"/><path class="p-fl" stroke-width="2.07" stroke-opacity="0.76" d="M475 457L484 449M484 449L501 448M501 448L514 455"/><path class="p-fl" stroke-width="1.41" stroke-opacity="0.51" d="M497 431L495 409M481 428L495 409M475 419L495 409M512 426L495 409"/><path class="p-fl" stroke-width="1.41" stroke-opacity="0.50" d="M484 410L495 409M501 409L495 409M514 416L495 409"/></g><g data-part="L3" style="--i:7"><path class="p-glass" fill-opacity="0.08" d="M521 422L415 461L415 459L521 420ZM481 523L586 484L586 482L481 521Z"/><path class="p-glass" fill-opacity="0.14" d="M586 484L521 422L521 420L586 482ZM415 461L481 523L481 521L415 459Z"/><path class="p-glass" fill-opacity="0.10" d="M521 422L586 484L481 523L415 461Z"/><path class="p-line2" stroke-width="1.13" stroke-opacity="0.56" stroke-dasharray="3 3" d="M481 523L586 484M586 482L481 521M481 523L415 461M481 521L415 459"/><path class="p-line2" stroke-width="1.13" stroke-opacity="0.55" stroke-dasharray="3 3" d="M586 484L586 482"/><path class="p-line2" stroke-width="1.13" stroke-opacity="0.57" stroke-dasharray="3 3" d="M481 521L481 523"/><path class="p-line2" stroke-width="1.13" stroke-opacity="0.53" stroke-dasharray="3 3" d="M521 422L415 461M415 459L521 420"/><path class="p-line2" stroke-width="1.13" stroke-opacity="0.54" stroke-dasharray="3 3" d="M415 461L415 459M521 422L586 484M521 420L586 482"/><path class="p-line2" stroke-width="1.13" stroke-opacity="0.52" stroke-dasharray="3 3" d="M521 420L521 422"/></g><g data-part="L4" style="--i:8"><path class="p-glass" fill-opacity="0.08" d="M526 409L393 458L393 455L526 406ZM476 536L608 487L608 484L476 533Z"/><path class="p-glass" fill-opacity="0.14" d="M608 487L526 409L526 406L608 484ZM393 458L476 536L476 533L393 455Z"/><path class="p-glass" fill-opacity="0.10" d="M526 409L608 487L476 536L393 458Z"/><path class="p-line2" stroke-width="1.13" stroke-opacity="0.56" stroke-dasharray="3 3" d="M476 536L608 487M608 484L476 533M476 536L393 458M476 533L393 455"/><path class="p-line2" stroke-width="1.13" stroke-opacity="0.55" stroke-dasharray="3 3" d="M608 487L608 484"/><path class="p-line2" stroke-width="1.13" stroke-opacity="0.57" stroke-dasharray="3 3" d="M476 533L476 536"/><path class="p-line2" stroke-width="1.13" stroke-opacity="0.53" stroke-dasharray="3 3" d="M526 409L393 458M393 455L526 406"/><path class="p-line2" stroke-width="1.13" stroke-opacity="0.54" stroke-dasharray="3 3" d="M393 458L393 455M526 409L608 487M526 406L608 484"/><path class="p-line2" stroke-width="1.13" stroke-opacity="0.52" stroke-dasharray="3 3" d="M526 406L526 409"/></g><g data-part="L2" style="--i:9"><path class="p-glass" fill-opacity="0.08" d="M515 435L437 464L437 399L515 370ZM486 510L564 481L564 416L486 445Z"/><path class="p-glass" fill-opacity="0.10" d="M515 435L564 481L486 510L437 464Z"/><path class="p-glass" fill-opacity="0.14" d="M564 481L515 435L515 370L564 416ZM437 464L486 510L486 445L437 399Z"/><path class="p-line2" stroke-width="1.13" stroke-opacity="0.56" stroke-dasharray="3 3" d="M486 510L564 481M564 481L564 416M515 370L564 416"/><path class="p-line2" stroke-width="1.13" stroke-opacity="0.57" stroke-dasharray="3 3" d="M564 416L486 445M486 445L486 510M486 445L437 399"/><path class="p-line2" stroke-width="1.13" stroke-opacity="0.54" stroke-dasharray="3 3" d="M515 435L437 464M515 370L515 435M515 435L564 481"/><path class="p-line2" stroke-width="1.13" stroke-opacity="0.55" stroke-dasharray="3 3" d="M437 464L437 399M437 399L515 370M486 510L437 464"/></g><g data-part="rv2" style="--i:10"><g clip-path="url(#p17itc45)"><path class="p-shadow" opacity="0.633" filter="url(#p17itb5)" d="M789 513L806 529L774 541L756 525Z"/></g><path class="p-plaster" d="M741 521L765 543L802 529L779 507Z"/><path class="p-right" d="M741 525L765 547L765 543L741 521ZM765 547L802 533L802 529L765 543Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.36" d="M765 547L802 533M802 533L802 529M741 525L741 521M741 521L779 507M802 529L779 507M765 547L741 525"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.16" d="M802 529L765 543M765 543L765 547M741 521L765 543"/><path class="p-metal p-lo" d="M757 531L757 521L757 495L757 505ZM787 530L772 535L772 510L787 504ZM772 535L757 531L757 505L772 510Z"/><path class="p-metal" d="M771 490L786 494L772 492ZM757 495L771 490L772 492ZM786 494L787 504L772 492ZM757 505L757 495L772 492ZM787 504L772 510L772 492ZM772 510L757 505L772 492Z"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.73" d="M772 535L757 531M757 505L772 510M757 495L757 505M771 490L757 495M786 494L771 490M787 530L787 504M787 504L786 494M787 530L772 535M772 510L787 504"/><path class="p-line2" stroke-width="1.01" stroke-opacity="0.33" d="M757 531L757 505M772 510L772 535"/><path class="p-line2" stroke-width="1.80" stroke-opacity="0.72" d="M757 531L757 521M757 521L757 495M757 521L771 515M771 515L786 520M786 520L787 530"/><path class="p-line2" stroke-width="0.84" stroke-opacity="0.47" d="M772 510L772 492M757 505L772 492M757 495L772 492M771 490L772 492M786 494L772 492M787 504L772 492"/></g></svg>'
  };
  /* the engine, injected on first need */
  function core3d() {
    var W = window;
    return W.PS3D ? Promise.resolve(W.PS3D) : core3d.p || (core3d.p = new Promise(function (res, rej) {
      var s = document.createElement('script'), t = setTimeout(no, 15000);
      function no() { clearTimeout(t); core3d.p = null; rej(new Error('the 3D engine did not load')); }
      s.src = '/assets/3d/core.js?v=3'; s.async = true; s.onerror = no;
      s.onload = function () { clearTimeout(t); if (W.PS3D) res(W.PS3D); else no(); };
      document.head.appendChild(s);
    }));
  }

  /* ======================= the machine ======================= */
  function init(root, ctx) {
    var S = null, LOG = [], seen = [], id = 'fr' + (ctx.num || 41), cancelTw = null, dead = false;
    var ui = { tab: 0, view: 'card', gate: null, round: false, gf: .1, sf: .2, vf: .1, resK: 20, buildK: 20, lc: 26.6, r: 20, ask: null, fed: 0, fedT: -1, anim: 1, pre: null, db: false, setup: {}, newN: [] };
    var TABS = ['Compute', 'Train', 'Ship', 'Money', 'People and policy'];
    /* the room: one espresso stage that holds the lab itself. The figure that matters, the hall in 3D (its poster is the first
       frame, so the stage is never empty), the vitals and the race. The charter, the card and the desk sit on paper below it */
    root.innerHTML = '<div class="fr">' +
      '<div class="fr-room" data-ground="espresso">' +
      '<div class="fr-top"><div class="fr-id"><p class="fr-kick"></p><p class="fr-hero"></p>' +
        '<p class="fr-begin-w"><button type="button" class="ps-cap ps-cap--foil fr-begin" data-act="begin" data-fk="begin">Set the charter</button></p></div><p class="fr-lead"></p></div>' +
      '<figure class="iso lk-scene fr-hall"><div class="iso-stage" tabindex="0" role="group" aria-roledescription="3D model" aria-label="The lab in 3D: power, halls of GPUs and the models they train" aria-describedby="' + id + '-hd">' +
        posterH() + '</div><figcaption><p class="fr-hall-d" id="' + id + '-hd"></p><p class="fr-hall-key" aria-hidden="true">' +
        ['tr', 're', 'sa', 'sv', 'id'].map(function (r) { return '<span class="fr-hk fr-hk--' + r + '"><i></i>' + USE[r] + '</span>'; }).join('') +
        '</p><ol class="fr-hall-list" aria-label="The halls"></ol><p class="iso-live vh" aria-live="polite"></p></figcaption></figure>' +
      '<div class="fr-strip lk-strip" style="--lk-cols:4"></div>' +
      '<figure class="fr-race"><canvas class="fr-rc" aria-hidden="true"></canvas><figcaption class="fr-leg"></figcaption>' +
      '<table class="vh fr-rtab"></table></figure>' +
      '</div>' +
      '<div class="fr-setup"></div>' +
      '<div class="fr-grid">' +
        '<div class="fr-left"><div class="lk-feed fr-feed" role="log" aria-label="The lab’s feed" tabindex="0"></div><div class="fr-stage"></div></div>' +
        '<div class="fr-right"><h4 class="vh" id="' + id + '-desk">The desk</h4><div class="lk-tabs fr-tabs" aria-labelledby="' + id + '-desk">' +
          TABS.map(function (n, i) { return '<button type="button" class="lk-tab" role="tab" id="' + id + '-t' + i + '" aria-controls="' + id + '-p' + i + '" aria-selected="' + (i ? 'false' : 'true') + '" data-fk="tab' + i + '">' + n + '</button>'; }).join('') +
          '</div>' + TABS.map(function (n, i) { return '<div class="lk-panel fr-panel" role="tabpanel" id="' + id + '-p' + i + '" aria-labelledby="' + id + '-t' + i + '"' + (i ? ' hidden' : '') + '></div>'; }).join('') +
          '<p class="fr-prev"></p><div class="fr-go"></div></div>' +
      '</div>' +
      '<div class="fr-end"></div><div class="fr-foot"></div></div>';
    function $(q) { return root.querySelector(q); }
    var E = { kick: $('.fr-kick'), hero: $('.fr-hero'), lead: $('.fr-lead'), room: $('.fr-room'), begin: $('.fr-begin-w'), strip: $('.fr-strip'), hall: $('.fr-hall'), hallD: $('.fr-hall-d'), hallL: $('.fr-hall-list'), race: $('.fr-race'), rc: $('.fr-rc'), leg: $('.fr-leg'), rtab: $('.fr-rtab'), setup: $('.fr-setup'),
      grid: $('.fr-grid'), feed: $('.fr-feed'), stage: $('.fr-stage'), right: $('.fr-right'), tabs: $('.fr-tabs'), prev: $('.fr-prev'), go: $('.fr-go'), end: $('.fr-end'), foot: $('.fr-foot') };
    var panels = TABS.map(function (n, i) { return $('#' + id + '-p' + i); });

    K.glossary(root, DEFS);
    var shelf = K.shelf(E.foot, { slug: SLUG, notes: NOTES, caseFile: CASE, take: { items: TAKE, personal: personal } });
    K.tabs(E.tabs, function (i) {
      ui.tab = i; ui.ask = null; renderPanel();
      if (i === 1 && S && S.ph === 'play') { noteQ(S, 'scaling', 'the Train tab'); drain(); renderFeed(); }
    });

    /* ---------- state, log, storage ---------- */
    function save() { ctx.store.set({ v: 1, seed: S.seed, log: LOG, seen: seen }); }
    function replay(seed, log) {
      var s0 = newWorld(seed);
      log.forEach(function (a) { var r = apply(s0, a); if (r === false || (r && (r.gate || r.err))) throw new Error('replay diverged at ' + a.a); });
      return s0;
    }
    var COAL = { alloc: 1, spot: 1, price: 1, free: 1, lead: 1, ent: 1 };
    function logA(a) {
      var last = LOG[LOG.length - 1];
      if (last && COAL[a.a] && last.a === a.a) LOG[LOG.length - 1] = a;
      else if (last && a.a === 'hire' && last.a === 'hire' && last.who === a.who) LOG[LOG.length - 1] = a;
      else LOG.push(a);
    }
    function drain(silent) {
      var got = [];
      while (S.nq.length) {
        var n = S.nq.shift();
        if (shelf.notes.unlock(n.id, { where: n.where, announce: false }) && !silent) got.push(NOTE_BY[n.id].term);
      }
      if (got.length) ui.newN = ui.newN.concat(got);
    }
    function act(a, light) {
      var r = apply(S, a);
      if (r === false) return r;
      if (r && r.err) { K.say(r.err); ui.err = r.err; render(); return r; }
      if (r && r.gate) return r;
      ui.err = null;
      logA(a);
      if (S.ph === 'over' && seen.indexOf(S.ending) < 0) seen.push(S.ending);
      if (!light) save();
      drain();
      if (light) lightRender(); else render();
      return r;
    }
    function reset(seed) { S = newWorld(seed); LOG = []; ui.fed = 0; ui.fedT = -1; ui.newN = []; ui.err = null; ui.pre = null; E.feed.innerHTML = ''; E.end.innerHTML = ''; ui.db = false; }
    function fresh(seed, keep) {
      reset(seed); ui.view = 'card'; ui.gate = null; ui.round = false; ui.ask = null;
      if (!keep) ui.setup = {};
      E.end.innerHTML = ''; save(); render(); paintAll();
      K.focus($('#' + id + '-su'), { scroll: true });
    }

    /* ---------- small builders ---------- */
    function esc(v) { return K.esc(v); }
    function cell(k, v, cls, extra) { return '<div class="lk-cell' + (cls ? ' ' + cls : '') + '"><span class="lk-k">' + k + '</span><span class="lk-v">' + v + '</span>' + (extra || '') + '</div>'; }
    function segH(name, label, opts, cur, dis) {
      return '<div class="lk-seg fr-seg" data-seg="' + name + '" aria-label="' + esc(label) + '">' + opts.map(function (o) {
        var d = dis && dis(o[0]);
        return '<button type="button" data-v="' + o[0] + '" aria-checked="' + (String(o[0]) === String(cur) ? 'true' : 'false') + '" data-fk="seg-' + name + '-' + o[0] + '"' + (d ? ' disabled' : '') + '>' + o[1] + '</button>';
      }).join('') + '</div>';
    }
    function rangeH(key, label, val, min, max, st, out, vt) {
      var i = id + '-r-' + key;
      return '<div class="lk-field fr-f"><label for="' + i + '">' + label + '</label><output class="lk-range-out" id="' + i + '-o" for="' + i + '">' + out + '</output>' +
        '<input type="range" id="' + i + '" min="' + min + '" max="' + max + '" step="' + st + '" value="' + val + '" data-rg="' + key + '" aria-valuetext="' + esc(vt) + '" data-fk="rg-' + key + '"></div>';
    }
    function stepH(key, val, label, lo, hi) {
      return '<div class="lk-step" role="group" aria-label="' + esc(label) + '"><button type="button" data-act="stp" data-k="' + key + '" data-d="-1" aria-label="Less: ' + esc(label) + '" data-fk="stp-' + key + '-m"' + (lo ? ' disabled' : '') + '>−</button>' +
        '<output aria-live="polite">' + val + '</output><button type="button" data-act="stp" data-k="' + key + '" data-d="1" aria-label="More: ' + esc(label) + '" data-fk="stp-' + key + '-p"' + (hi ? ' disabled' : '') + '>+</button></div>';
    }
    function btn(actn, label, cls, attrs) { return '<button type="button" class="' + (cls || 'ebtn2') + '" data-act="' + actn + '" data-fk="b-' + actn + (attrs && attrs.fk ? '-' + attrs.fk : '') + '"' + (attrs && attrs.x ? ' ' + attrs.x : '') + '>' + label + '</button>'; }
    function pct(v) { return F.pct(v); }
    function kx(v) { return F.n(v, v < 10 && v % 1 ? 1 : 0) + 'k'; }
    /* the run size read aloud: plain digits, never superscripts */
    function sciSay(lc) { var ex = Math.floor(lc + 1e-9), mant = Math.pow(10, lc - ex); if (+mant.toFixed(1) >= 10) { mant /= 10; ex++; } return mant.toFixed(1) + ' times 10 to the ' + ex + ' FLOP'; }
    function baseK() { var f = fleet(S, S.t); return f.K - f.spot; }

    /* ---------- the preview: a dry run of this half that consumes no randomness ---------- */
    function preview() { var c = dryClone(S); step(c, true); ui.pre = c.hist[c.hist.length - 1]; ui.preS = c; return ui.pre; }

    /* ---------- personal line for the takeaways ---------- */
    function personal() {
      if (!S || S.ph === 'setup') return null;
      var you = youFI(S), top = topFI(S), n = S.inc.minor + S.inc.serious + S.inc.severe;
      if (S.ph === 'over') return 'My run: ' + END[S.ending][0] + ' · world #' + S.seed + ' · FI ' + fi1(you) + ' vs ' + fi1(top) + ' · ' + Bn(S.FV) + ' · ' + (S.pol === 'ifthen' || S.breaches ? S.breaches + ' ' + F.plural(S.breaches, 'breach', 'breaches') : 'no thresholds published') + ' · ' + n + ' ' + F.plural(n, 'incident') + '.';
      return 'My run so far: ' + hl(Math.min(S.t, 7)) + ' · world #' + S.seed + ' · FI ' + fi1(you) + ' vs ' + fi1(top) + ' · ' + Bn(S.FV) + '.';
    }

    /* ---------- render ---------- */
    function render() {
      if (dead) return;
      var ph = S.ph;
      E.kick.textContent = 'Aldermoor · world #' + S.seed + (ph === 'setup' ? ' · the charter' : ph === 'over' ? ' · the end of Year ' + Math.max(1, Math.ceil(S.t / 2)) : ' · ' + hl(S.t));
      shelf.setMeta('World #' + S.seed + ' · same world, same choices, same four years');
      E.setup.hidden = ph !== 'setup'; E.begin.hidden = ph !== 'setup'; E.strip.hidden = ph === 'setup'; E.grid.hidden = ph === 'setup'; E.right.hidden = ph === 'over';
      renderHero();
      if (ph === 'setup') { renderSetup(); renderRaceText(); hallSync(); return; }
      if (ph === 'play') preview(); else ui.pre = S.hist[S.hist.length - 1] || null;
      renderStrip(); renderFeed(); renderStage(); renderRaceText();
      if (ph === 'play') { renderPanel(); renderPrev(); renderGo(); }
      K.sfill(root);
      hallSync();
    }
    function lightRender() { if (S.ph === 'play') preview(); renderStrip(); renderPrev(); renderGo(); lightPanel(); paintAll(); hallSync(); }
    function keepFocus(fn) {
      var a = document.activeElement, fk = a && root.contains(a) ? a.getAttribute('data-fk') : null;
      fn();
      if (fk) { var n = root.querySelector('[data-fk="' + fk + '"]'); if (n && n !== document.activeElement && !n.disabled) { try { n.focus({ preventScroll: true }); } catch (e) {} } }
    }

    function renderSetup() {
      var s = ui.setup, all = s.gov && s.pol && s.open;
      function fs(key, legend, help) {
        return '<fieldset class="fr-fs"><legend class="lk-kicker">' + legend + '</legend>' + (help ? '<p class="fr-help">' + help + '</p>' : '') + CHOICES[key].map(function (c) {
          return '<label class="lk-opt fr-choice"><input type="radio" name="' + id + '-' + key + '" value="' + c[0] + '" data-su="' + key + '"' + (s[key] === c[0] ? ' checked' : '') + ' data-fk="su-' + key + '-' + c[0] + '">' +
            '<span class="lk-opt-l">' + c[1] + '</span><span class="lk-opt-s">' + c[2] + '</span></label>';
        }).join('') + '</fieldset>';
      }
      keepFocus(function () {
        E.setup.innerHTML = '<section class="fr-su" aria-labelledby="' + id + '-su">' +
          '<h4 class="lk-title" id="' + id + '-su" tabindex="-1">Three decisions that are hard to undo</h4>' +
          '<p class="lk-lede">Aldermoor has one model in the market (Alder 1, ' + T('fi') + ' 55.4), 140 researchers, 20 people on safety, $5.0B in the bank and a 40,000-GPU contract that ends in two years. The frontier is at 58.0 and moving. Each half you answer one card, set the desk and run the half. After eight halves, the game ends.</p>' +
          fs('gov', 'The charter') + fs('pol', 'The safety posture') + fs('open', 'The opening compute') +
          '<p class="fr-help">The vocabulary, if you want it: ' + T('capped', 'capped profit') + ', ' + T('pbc', 'public benefit corporation') + ', ' + T('tp', 'take-or-pay') + ', ' + T('credits', 'compute credits') + '.</p>' +
          '<div class="fr-world"><label class="lk-k" for="' + id + '-seed">World</label><input type="text" inputmode="numeric" id="' + id + '-seed" class="fr-seed" value="' + S.seed + '" maxlength="9" data-fk="seed" autocomplete="off">' +
          btn('roll', 'Roll a new world', 'ebtn2') + '</div>' +
          '<p class="fr-help">The same world and the same choices reproduce the same four years; replay it to change one thing and watch what moves. Default world 1956, the year of the Dartmouth workshop.</p>' +
          (all ? '' : '<p class="fr-help fr-need" id="' + id + '-need">Choose all three to found the lab.</p>') +
          '<div class="btnrow">' + btn('found', 'Found the lab', 'ebtn', { x: all ? '' : 'disabled aria-describedby="' + id + '-need"' }) + '</div>' +
          (seen.length ? '<p class="fr-help">Endings found in this browser: ' + seen.length + ' of 12.</p>' : '') + '</section>';
      });
    }

    /* the hero: your model's Frontier Index in foil, and the lab that holds the frontier */
    function renderHero() {
      var you = youFI(S), fg = flagship(S), ld = null;
      S.riv.forEach(function (r) { if (!ld || r.fi > ld.fi) ld = r; });
      var mine = you >= ld.fi - 1e-9, gap = Math.abs(ld.fi - you);
      E.hero.innerHTML = '<span class="fr-fi stat foil">' + fi1(you) + '</span><span class="fr-fi-k"><span class="fr-l">Frontier Index</span>' +
        '<span class="fr-fi-s">' + (fg ? esc(fg.nm) + (S.think ? ', thinking' : '') : 'No model in service') + '</span><span class="fr-fi-s">' + (fg ? 'Level ' + lvOf(you) + ' · ' : '') + 'Rank ' + rankOf(S) + ' of 4</span></span>';
      E.lead.innerHTML = '<span class="fr-l">The frontier</span><span class="fr-lead-n stat">' + fi1(Math.max(you, ld.fi)) + '</span>' +
        '<span class="fr-lead-s">' + (mine ? 'Aldermoor' + (gap > .05 ? ', ' + fi1(gap) + ' clear of ' + esc(ld.nm) : '') : esc(ld.nm) + ', ' + fi1(gap) + ' ahead of you') + '</span>';
      if (window.PS && PS.foil) PS.foil(E.hero);
    }
    function renderStrip() {
      var p = ui.pre, you = youFI(S), top = topFI(S), lv = lvOf(you), rq = reqOf(S, lv), cf = p ? p.real - p.c.total : 0, burn = -cf;
      var pips = '<span class="lk-pips fr-pips" aria-hidden="true">' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (k) { return '<i class="lk-pip' + (k < S.t ? ' is-past' : k === S.t && S.ph === 'play' ? ' is-now' : '') + '"></i>'; }).join('') + '</span>';
      var run = burn > 0 ? S.cash / burn : Infinity;
      E.strip.innerHTML =
        cell('Half', S.ph === 'over' ? 'Done' : hl(S.t), '', pips) +
        cell('Cash', Bn(S.cash), S.cash < 1 ? 'is-bad' : '') +
        cell(S.ph === 'over' ? 'Last half’s burn' : 'Burn per half', burn > 0 ? Bn(burn) : 'Cash positive', burn > 0 ? '' : 'is-good') +
        cell('Runway', run === Infinity ? '∞' : (run < 1 ? 'Under 1 half' : F.n(Math.floor(run)) + ' ' + F.plural(Math.floor(run), 'half', 'halves')), run < 2 ? 'is-bad' : run < 3 ? 'is-warn' : '') +
        cell('Readiness', lv >= 2 ? Math.round(S.SR) + ' / ' + rq + ' for L' + lv : String(Math.round(S.SR)), S.SR < rq ? 'is-bad' : '', lv >= 2 ? '' : '<small>no bar at Level 1</small>') +
        cell('Trust', F.n(S.trust), S.trust < 40 ? 'is-bad' : '') +
        cell('Fair value', Bn(S.FV)) +
        cell('Your stake', pct(S.cap.you) + ' <small class="lk-dim">' + Bn(S.cap.you * S.FV) + '</small>', 'fr-c-stake');
    }

    function lineH(f) {
      var chip = '<span class="lk-chip ' + (SPK[f.sp] || '') + '">' + esc(f.sp) + '</span>';
      return '<p class="lk-line">' + chip + esc(f.tx) + (f.note ? ' <button type="button" class="fr-read" data-act="read" data-note="' + f.note + '">Read</button>' : '') + '</p>';
    }
    function renderFeed() {
      if (ui.fed > S.feed.length || !E.feed.firstChild && ui.fed) { ui.fed = 0; ui.fedT = -1; E.feed.innerHTML = ''; }
      var h = '', lt = ui.fedT;
      for (var i = ui.fed; i < S.feed.length; i++) {
        var f = S.feed[i];
        if (f.t !== lt) { h += '<p class="fr-half">' + hl(Math.min(f.t, 7)) + (f.t >= 8 ? ' · the end' : '') + '</p>'; lt = f.t; }
        h += lineH(f);
      }
      if (h) { E.feed.insertAdjacentHTML('beforeend', h); E.feed.scrollTop = E.feed.scrollHeight; }
      ui.fed = S.feed.length; ui.fedT = lt;
    }

    function cardH() {
      var c = CARDS[S.card.id], x = S.card.x, pick = S.card.pick, who = c.who || WHO[c.sp];
      if (c.sp === 'SAFETY' && S.dayoGone) who = 'Acting head of alignment';
      var h = '<article class="lk-card lk-card--event fr-card" aria-labelledby="' + id + '-ct">' +
        '<p class="fr-card-k"><span class="lk-chip ' + (SPK[c.sp] || '') + '">' + c.sp + '</span><span class="fr-who">' + esc(who) + '</span></p>' +
        '<p class="lk-kicker">' + hl(S.card.t) + ' · the card</p><h4 class="fr-ct" id="' + id + '-ct" tabindex="-1">' + c.title + '</h4>' +
        '<p class="fr-cb">' + c.body(S, x) + '</p><div class="fr-opts" role="group" aria-labelledby="' + id + '-ct">';
      c.opts.forEach(function (o, i) {
        var why = pick < 0 ? cardOptOk(S, i) : '', chosen = pick === i;
        h += '<button type="button" class="lk-opt" data-act="card" data-i="' + i + '" data-fk="opt' + i + '" aria-pressed="' + (chosen ? 'true' : 'false') + '"' +
          (pick >= 0 ? (chosen ? ' aria-disabled="true"' : ' disabled') : why ? ' disabled' : '') + '><span class="lk-opt-l">' + o.l + '</span>' +
          (pick < 0 || chosen ? '<span class="lk-opt-s">' + o.s(S, x) + '</span>' : '') + (why ? '<span class="lk-opt-why">' + esc(why) + '</span>' : '') + '</button>';
      });
      h += '</div>';
      if (ui.gate && ui.gate.kind === 'card') h += gateH();
      if (pick >= 0 && S.ph === 'play') h += '<p class="fr-chosen">Decided. The rest of the half is on the desk' + (window.innerWidth < 700 ? ' below' : '') + '; when it is set, run the half.</p>';
      if (S.ph === 'over') h += '<p class="fr-chosen">The experiment ends here.</p><div class="btnrow">' + btn('todb', 'Read the debrief', 'ebtn') + '</div>';
      return h + '</article>';
    }
    function gateH() {
      var g = ui.gate.info && ui.gate.info.g;
      return '<div class="fr-gate" role="alert"><p><b>This breaches the scaling policy you published.</b> ' + (g ? 'The bar is readiness ' + g.req + (g.rsl ? ' and SL' + g.rsl : '') + '; you are at ' + Math.round(S.SR) + ' and SL' + S.SL + '. ' : '') +
        'A breach costs trust, morale and board confidence, and it stays on the record.</p><div class="btnrow">' +
        btn('gate-yes', ui.gate.open ? 'Release anyway' : ui.gate.kind === 'aird' || ui.gate.kind === 'think' ? 'Switch it on anyway' : 'Launch anyway', 'ebtn') +
        btn('gate-no', ui.gate.kind === 'card' ? 'Choose again' : 'Not now', 'ebtn2') + '</div></div>';
    }
    function reportH() {
      var h = S.hist[S.hist.length - 1], fl = h.fl, over = S.ph === 'over';
      function row(k, v, sub, cls) { return '<li' + (cls ? ' class="' + cls + '"' : '') + '><span class="ledger-k">' + k + (sub ? '<small class="fr-sub">' + sub + '</small>' : '') + '</span><span class="ledger-n">' + v + '</span></li>'; }
      var net = h.net, rows =
        row('Revenue', Bn(h.real), 'API ' + Bn(h.rA) + ' · Consumer ' + Bn(h.rC) + ' · Enterprise ' + Bn(h.rE)) +
        row('Compute', Bn(-h.c.comp), 'Reserved ' + Bn(fl.resBill) + ' · Owned ' + Bn(fl.ownBill) + ' · Spot ' + Bn(fl.spotBill) + (h.credV > 0 ? ' · credits used, worth ' + Bn(h.credV) + ', cost no cash' : '')) +
        row('People', Bn(-h.c.ppl)) + row('Go-to-market', Bn(-h.c.gtm)) + row('Security, compliance and licenses', Bn(-h.c.sec)) +
        (h.one ? row('One-off', Bn(-h.one), 'capex, cards, upgrades') : '') + (h.fin || h.bridge ? row('Financing', Bn((h.fin || 0) + (h.bridge || 0)), h.bridge ? 'including the down round' : '') : '') +
        row('Net change in cash', Bn(net), '', 'rule-double fr-net ' + (net >= 0 ? 'is-good' : 'is-bad'));
      var nn = ui.newN.length ? '<p class="fr-newn"><span class="lk-kicker lk-kicker--foil">New field notes</span>' + ui.newN.map(esc).join(' · ') + '</p>' : '';
      var nextL = over ? 'Read the debrief' : 'Open ' + hl(S.t);
      return '<section class="lk-card fr-rep" aria-labelledby="' + id + '-rt"><p class="lk-kicker">The report</p><h4 class="fr-ct" id="' + id + '-rt" tabindex="-1">' + hl(h.t) + ' closed</h4>' +
        '<p class="fr-rep-l">Frontier: you ' + fi1(h.you) + ', top ' + fi1(h.top) + (h.topEnd != null && h.topEnd - h.top > .05 ? ' at the start of the half, ' + fi1(h.topEnd) + ' now' : '') + '. Serving covered ' + pct(h.phi) + ' of demand at ' + pct(h.gm) + ' ' + T('gm', 'inference margin') + ', ' + F.usd(h.cpm, 2) + ' per million tokens. Incident risk was ' + F.prob(h.p) + ' (' + F.prob(h.p0) + ' with no safety work).</p>' +
        '<ol class="ledger ledger--data fr-ledger" aria-label="The ledger for ' + hl(h.t) + '">' + rows + '</ol>' +
        (h.ev.length ? '<ul class="fr-evs">' + h.ev.map(function (e) { return '<li><span class="lk-chip ' + (SPK[e.sp] || '') + '">' + esc(e.sp) + '</span>' + esc(e.tx) + '</li>'; }).join('') + '</ul>' : '') + nn +
        '<div class="btnrow">' + btn(over ? 'todb' : 'next', nextL, 'ebtn') + '</div></section>';
    }
    function renderStage() {
      keepFocus(function () { E.stage.innerHTML = ui.view === 'report' && S.hist.length ? reportH() : cardH(); });
    }

    /* ---------- the desk ---------- */
    function renderPanel() { if (S.ph !== 'play') return; keepFocus(function () { panels[ui.tab].innerHTML = PANEL[ui.tab](); }); wireSegs(panels[ui.tab]); K.sfill(panels[ui.tab]); }
    function lightPanel() {
      var P = panels[ui.tab];
      if (ui.tab === 0) { var a = P.querySelector('.fr-alloc'); if (a) a.innerHTML = allocInfo(); }
      if (ui.tab === 1) { var r = P.querySelector('.fr-trd'); if (r) r.innerHTML = trainRead(); }
      if (ui.tab === 3) { var g = P.querySelector('.fr-gauge-w'); if (g) g.innerHTML = gaugeH(); }
    }
    function wireSegs(P) {
      Array.prototype.forEach.call(P.querySelectorAll('[data-seg]'), function (el) {
        var name = el.getAttribute('data-seg');
        K.seg(el, function (v) {
          if (name === 'shape') { ui.r = +v; var r = P.querySelector('.fr-trd'); if (r) r.innerHTML = trainRead(); noteQ(S, 'chinchilla', 'choosing a shape'); drain(); renderFeed(); return; }
          if (name === 'gf') { ui.gf = +v; renderPanel(); return; }
          if (name === 'sf') { ui.sf = +v; renderPanel(); return; }
          if (name === 'vf') { ui.vf = +v; renderPanel(); return; }
          if (name === 'hireR' || name === 'hireS') { act({ a: 'hire', who: name === 'hireS' ? 'S' : 'R', v: v }); return; }
          act({ a: name, v: v });
        });
      });
    }
    function allocInfo() {
      var a = S.al, sv = Math.max(0, 1 - a.tr - a.re - a.sa), p = ui.pre, K0 = p ? p.K : 0, kS = K0 * sv, need = p ? p.need : 0;
      return '<div class="fr-abar" aria-hidden="true"><i class="fr-a-tr" style="flex-grow:' + a.tr + '"></i><i class="fr-a-re" style="flex-grow:' + a.re + '"></i><i class="fr-a-sa" style="flex-grow:' + a.sa + '"></i><i class="fr-a-sv" style="flex-grow:' + sv + '"></i></div>' +
        '<p class="fr-akey" aria-hidden="true"><span><i class="fr-a-tr"></i>Training</span><span><i class="fr-a-re"></i>Research</span><span><i class="fr-a-sa"></i>Safety</span><span><i class="fr-a-sv"></i>Serving</span></p>' +
        '<p class="fr-serve' + (kS < need * .95 ? ' lk-loss' : '') + '">Serving gets ' + pct(sv) + ' of the fleet, ' + kx(kS) + ' GPU-equivalents, against about ' + kx(need) + ' needed this half' + (kS < need * .95 ? ': customers will hit rate limits.' : '.') + '</p>' +
        (ui.flash ? '<p class="fr-help fr-flash">' + esc(ui.flash) + '</p>' : '');
    }
    function allocRange(k, label) {
      var v = S.al[k], l = lockOf(S, k === 'sa' ? 'sa' : k === 're' ? 're' : 'x'), w = { tr: 'Training', re: 'Research', sa: 'Safety' }[k];
      return rangeH(k, label, Math.round(v * 100), 0, 90, 1, pct(v), w + ' ' + Math.round(v * 100) + ' percent of compute') +
        (l ? '<p class="fr-lock">Locked between ' + pct(l.min) + ' and ' + pct(l.max) + ' through ' + hl(l.until) + '.</p>' : '');
    }
    function oblH() {
      var cells = '', vals = [], mx = 0, k;
      for (k = 0; k < 8; k++) {
        var t = S.t + k, v = 0;
        S.contracts.forEach(function (c) { if (c.start <= t && t <= c.end) v += c.k * c.p / 1000; });
        S.owned.forEach(function (w) { if (w.on <= t) v += w.k * OPEX / 1000; });
        vals.push(v); mx = Math.max(mx, v);
      }
      vals.forEach(function (v, i) {
        var t = S.t + i;
        cells += '<li class="' + (i === 0 ? 'is-now lk-foil-mark' : '') + '"><span class="fr-ob-bar"><i style="--h:' + (mx ? v / mx : 0).toFixed(3) + '"></i></span><span class="fr-ob-v">' + (v ? Bn(v) : '–') + '</span><span class="fr-ob-t">' + hl(t) + '</span></li>';
      });
      return '<ol class="fr-obl" aria-label="Committed compute payments for the next eight halves">' + cells + '</ol>';
    }
    function fleetRows() {
      var t = S.t, rows = '';
      S.contracts.forEach(function (c) {
        if (c.end < t) return;
        rows += '<tr><td>' + { legacy: 'Reserved, legacy', opening: 'Reserved, opening', Anvil: 'Anvil Silicon', reserved: 'Reserved' }[c.src] + (c.start > t ? ' <span class="lk-dim">from ' + hl(c.start) + '</span>' : '') + '</td><td data-l="Thousand GPU-eq">' + kx(c.k) + '</td><td data-l="$M per k-half">' + F.M(c.p, 2) + '</td><td data-l="Halves left">' + (c.end - Math.max(t, c.start) + 1) + '</td></tr>';
      });
      S.owned.forEach(function (w) { rows += '<tr><td>' + (w.sov ? 'Keelstone campus' : 'Campus') + (w.on > t ? ' <span class="lk-dim">online ' + hl(w.on) + '</span>' : '') + '</td><td data-l="Thousand GPU-eq">' + kx(w.k) + '</td><td data-l="$M per k-half">' + F.M(OPEX, 2) + ' to run</td><td data-l="Halves left">owned</td></tr>'; });
      if (S.credits.k && S.credits.end >= t) rows += '<tr><td>Skyloft credits</td><td data-l="Thousand GPU-eq">' + kx(S.credits.k) + '</td><td data-l="$M per k-half">paid in equity</td><td data-l="Halves left">' + (S.credits.end - t + 1) + '</td></tr>';
      if (S.spot) rows += '<tr><td>Spot, this half</td><td data-l="Thousand GPU-eq">' + kx(S.spot) + '</td><td data-l="$M per k-half">' + F.M(SPOT0 * Math.pow(HW, t), 2) + '</td><td data-l="Halves left">1</td></tr>';
      return rows;
    }
    var PANEL = [
      function compute() {
        var t = S.t, hw = Math.pow(HW, t), bk = baseK(), scap = spotCap(S), cred = credOn(S, t) || credOn(S, t + 1), sp = SPOT0 * hw, rp = RES0 * hw, cp = CAP0 * hw;
        return '<p class="fr-help">Split this half’s fleet of ' + kx(ui.pre ? ui.pre.K : bk) + ' ' + T('gpueq', 'GPU-equivalents') + '. Training builds the next model, research makes every future run cheaper, safety raises readiness, and whatever is left serves customers.</p>' +
          allocRange('tr', 'Training') + allocRange('re', 'Research') + allocRange('sa', 'Safety') +
          '<div class="fr-alloc">' + allocInfo() + '</div>' +
          '<div class="btnrow">' + btn('serve', 'Serve what we need') + '</div>' +
          '<h5 class="fr-h">The fleet</h5><div class="lk-scroll"><table class="lk-table lk-table--stack fr-fleet"><thead><tr><th>Capacity</th><th>k</th><th>$M per k-half</th><th>Halves left</th></tr></thead><tbody>' + fleetRows() + '</tbody></table></div>' +
          '<div class="fr-buy">' +
            '<div class="fr-buy-r"><div class="fr-buy-t"><span class="lk-k">Rent spot this half</span><span class="fr-buy-s">' + F.M(sp, 1) + ' per thousand, this half only, up to ' + kx(scap) + (S.spot ? ': ' + Bn(S.spot * sp / 1000) + '.' : '.') + '</span></div>' + stepH('spot', kx(S.spot), 'Spot capacity this half', S.spot <= 0, S.spot >= scap) + '</div>' +
            (S.spot >= scap ? '<p class="fr-help fr-cap-note">Spot is capped at ' + kx(scap) + ' this half: twice the larger of your contracted fleet and last half’s whole fleet.</p>' : '') +
            '<div class="fr-buy-r"><div class="fr-buy-t"><span class="lk-k">Reserve for three years</span><span class="fr-buy-s">From ' + hl(t + 1) + ' at ' + F.M(rp, 2) + ' per thousand per half, ' + T('tp', 'take-or-pay') + ': ' + Bn(ui.resK * rp / 1000) + ' a half, ' + Bn(ui.resK * rp * 6 / 1000) + ' committed.</span></div>' +
              stepH('resK', kx(ui.resK), 'Capacity to reserve', ui.resK <= 5, ui.resK >= Math.max(40, 2 * bk)) + btn('reserve', 'Sign for ' + kx(ui.resK), 'ebtn2') + '</div>' +
            '<div class="fr-buy-r"><div class="fr-buy-t"><span class="lk-k">Build a campus</span><span class="fr-buy-s">' + (cred ? 'Exclusive with Skyloft until ' + hl(S.credits.end) + '.' : Bn(ui.buildK * cp / 1000) + ' of ' + T('capex', 'capex') + ' now, online ' + hl(t + 2) + ', then ' + F.M(OPEX, 1) + ' per thousand per half to run.') + '</span></div>' +
              stepH('buildK', kx(ui.buildK), 'Campus size', ui.buildK <= 5, ui.buildK >= Math.max(40, 2 * bk)) + btn('build', 'Build ' + kx(ui.buildK), 'ebtn2', { x: cred || ui.buildK * cp / 1000 > S.cash ? 'disabled' : '' }) + '</div>' +
          '</div>' +
          '<h5 class="fr-h">Committed compute payments</h5>' + oblH();
      },
      function train() {
        if (S.run) {
          var r = S.run, pr = r.prog / r.Cp, n = etaOf(S, r.Cp, S.al.tr, r.prog), f = FI(r.Cp * r.a0 * Math.pow(S.algo / r.a0, .3), r.r);
          return '<p class="lk-kicker">Run in progress</p><p class="fr-help">' + F.sci(r.Cp) + ' ' + T('flop', 'FLOP') + ' at ' + r.r + ' ' + T('tpp', 'tokens per parameter') + ', started ' + hl(r.t0) + '.</p>' +
            '<span class="lk-bar lk-bar--foil fr-prog"><i style="--w:' + pr.toFixed(3) + '"></i></span>' +
            '<p class="fr-help">' + pct(pr) + ' done. ' + (S.al.tr > 0 ? 'At ' + pct(S.al.tr) + ' of the fleet it finishes in about ' + (n >= 99 ? 'more halves than you have' : n + ' ' + F.plural(n, 'half', 'halves')) : 'Training gets 0% of the fleet: the run is standing still') + '. Forecast FI ' + fi1(f) + ' ±2, Level ' + lvOf(f) + '.</p>' +
            (ui.ask === 'abort' ? '<div class="fr-gate" role="alert"><p>Abort the run? ' + pct(pr) + ' of ' + F.sci(r.Cp) + ' FLOP is lost.</p><div class="btnrow">' + btn('abort-yes', 'Abort the run', 'ebtn') + btn('ask-no', 'Keep training', 'ebtn2') + '</div></div>' :
              '<div class="btnrow">' + btn('abort', 'Abort the run', 'ebtn2') + '</div>');
        }
        if (!ui.lcSet) ui.lc = clamp(Math.round(lg(S.prevMax * 4) * 20) / 20, 25, 28.5);
        return '<p class="fr-help">A ' + T('loss', 'scaling law') + ' turns ' + T('effc', 'effective compute') + ' into capability: every tenfold adds about 8.9 on the ' + T('fi') + '. Choose the size and the shape, then give it training share on the Compute tab.</p>' +
          rangeH('lc', 'Size of the run', ui.lc, 25, 28.5, .05, F.sci(Math.pow(10, ui.lc)) + ' FLOP', sciSay(ui.lc)) +
          '<p class="lk-kicker">Shape</p>' + segH('shape', 'Tokens per parameter', SHAPES.map(function (s) { return [s[0], s[0] + ' · ' + s[1]]; }), ui.r) +
          '<div class="fr-trd lk-strip" style="--lk-cols:4">' + trainRead() + '</div>' +
          '<p class="fr-help">Shape is ' + T('tpp', 'tokens per parameter') + '. About 20 is compute-optimal. More tokens on a smaller model costs a little capability and makes every ' + T('token', 'token') + ' you ever serve cheaper, because serving cost follows ' + T('active', 'active parameters') + '.</p>' +
          '<div class="btnrow">' + btn('run', 'Start the run', 'ebtn') + '</div>';
      },
      function ship() {
        var rows = S.models.slice().reverse().map(function (m) {
          var st = { live: 'Live', ready: 'Ready', internal: 'Internal', retired: 'Retired', review: 'In review' }[m.st], acc = m.open ? 'Open' : m.mode === 'staged' ? 'Staged' : m.st === 'live' ? 'Full' : '–';
          var fi = m.fi + (m.st === 'live' && S.think ? 5 : 0);
          return '<tr' + (m.st === 'live' ? ' class="is-sel"' : '') + '><td>' + m.nm + '</td><td data-l="FI">' + fi1(fi) + (m.st === 'live' && S.think ? ' <span class="lk-dim">thinking</span>' : '') + '</td><td data-l="Level">L' + lvOf(fi) + '</td><td data-l="Status">' + st + '</td><td data-l="Access">' + acc + '</td><td data-l="$ per M tokens">' + F.usd(cpmOf(S, m, ui.pre ? ui.pre.fl.price : RES0), 2) + '</td></tr>';
        }).join('');
        var h = '<div class="lk-scroll"><table class="lk-table lk-table--stack fr-models"><thead><tr><th>Model</th><th>FI</th><th>Level</th><th>Status</th><th>Access</th><th>$ per M tokens</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
        S.models.forEach(function (m) {
          if (m.st !== 'ready' && m.st !== 'internal') return;
          var g = gateOf(S, m, 'full', false), gs = gateOf(S, m, 'staged', false), held = m.holdUntil != null && S.t <= m.holdUntil;
          h += '<div class="fr-ship lk-card"><p class="fr-ship-h">' + m.nm + ' is ' + (m.st === 'ready' ? 'ready' : 'internal') + ': FI ' + fi1(m.fi) + (S.think ? ' (' + fi1(m.fi + 5) + ' with thinking on)' : '') + ', Level ' + g.lv + '.</p>' +
            (S.think && lvOf(m.fi) < g.lv ? '<p class="fr-help">Thinking mode lifts it a level. Switch thinking off below and it launches at Level ' + lvOf(m.fi) + ', with that level’s bar.</p>' : '') +
            '<p class="fr-help">' + (g.lv >= 2 ? 'Full launch needs ' + T('ready', 'readiness') + ' ' + g.req + ' and SL' + g.rsl + '; staged needs ' + gs.req + '. You have ' + Math.round(S.SR) + ' and SL' + S.SL + '. ' + (S.pol === 'ifthen' ? 'Your published policy gates both.' : 'No published policy gates it; the incident odds still do.') + (g.jump ? ' The bar includes +' + g.jump + ': this model is ' + fi1(g.step) + ' points past the one in service, and evals built for the old model do not cover it.' : '') : 'Level 1: no bar to meet.') + '</p>' +
            (m.holdUntil != null && S.t <= m.holdUntil ? '<p class="fr-help fr-hold">Held for the evaluators: it can launch from ' + hl(m.holdUntil + 1) + '.</p>' : '') +
            '<div class="btnrow">' + btn('launch', 'Launch', 'ebtn', { fk: m.id + 'f', x: 'data-id="' + m.id + '" data-mode="full"' + (held ? ' disabled' : '') }) + btn('launch', 'Staged launch', 'ebtn2', { fk: m.id + 's', x: 'data-id="' + m.id + '" data-mode="staged"' + (held ? ' disabled' : '') }) +
            (m.st === 'ready' ? btn('launch', 'Keep internal', 'ebtn2', { fk: m.id + 'i', x: 'data-id="' + m.id + '" data-mode="internal"' }) : '') + '</div>' +
            '<label class="fr-check"><input type="checkbox" data-openw="' + m.id + '" data-fk="ow' + m.id + '"' + (ui.ow === m.id ? ' checked' : '') + '> Release as open weights with the launch (irreversible)</label></div>';
        });
        if (ui.gate && ui.gate.kind !== 'card') h += gateH();
        var closed = S.models.filter(function (m) { return !m.open && (m.st === 'retired' || m.st === 'internal' || m.st === 'live'); });
        if (closed.length) {
          h += '<h5 class="fr-h">Open weights</h5><p class="fr-help">Opening a model grows the ecosystem around you and undercuts Sable’s price, forever. Its incidents can no longer be patched.</p><div class="btnrow">' +
            closed.map(function (m) { return btn('openw', 'Open ' + m.nm, 'ebtn2', { fk: m.id, x: 'data-id="' + m.id + '"' }); }).join('') + '</div>';
          if (ui.ask && ui.ask.openw) h += '<div class="fr-gate" role="alert"><p>Publish the weights of ' + modelBy(S, ui.ask.openw).nm + '? Anyone can run it, forever.</p><div class="btnrow">' + btn('openw-yes', 'Publish the weights', 'ebtn') + btn('ask-no', 'Not yet', 'ebtn2') + '</div></div>';
        }
        h += '<h5 class="fr-h">Deployment switches</h5>' +
          '<div class="fr-tog">' + btn('think', 'Thinking mode: ' + (S.think ? 'on' : 'off'), 'ebtn2', { x: 'aria-pressed="' + S.think + '"' + (S.unl.reason == null ? ' disabled' : '') }) +
            '<p class="fr-help">' + (S.unl.reason == null ? 'Opens when research reaches reasoning.' : '+5 on the Frontier Index, 2.2× the tokens per API and enterprise answer, 1.5× per consumer answer.') + '</p></div>' +
          '<div class="fr-tog">' + btn('aird', 'AI-assisted research: ' + (S.aird ? 'on' : 'off'), 'ebtn2', { x: 'aria-pressed="' + S.aird + '"' + (S.unl.aird == null ? ' disabled' : '') }) +
            '<p class="fr-help">' + (S.unl.aird == null ? 'Opens with research and a Level 3 model in service.' : 'Research speed +0.25 a half; flagship incident odds +3 points; a Level 4 capability for the policy (readiness ' + reqOf(S, 4) + ', SL4).') + '</p></div>';
        return h;
      },
      function money() {
        var t = S.t, p = ui.pre, you = youFI(S), gap = topFI(S) - you;
        var h = rangeH('p', 'API price per million tokens', S.p, .5, 2, .05, F.usd(PAPI * S.p, 2) + ' (' + F.x(S.p) + ')', F.usd(PAPI * S.p, 2) + ' per million tokens') +
          '<div class="fr-gauge-w">' + gaugeH() + '</div>' +
          '<p class="lk-kicker">Free tier</p>' + segH('free', 'Free tier', [['tight', 'Tight'], ['std', 'Standard'], ['gen', 'Generous']], S.free) +
          '<p class="lk-kicker">Lead market</p>' + segH('lead', 'Lead market', [['bal', 'Balanced'], ['api', 'API'], ['con', 'Consumer'], ['ent', 'Enterprise']], S.lead) +
          '<p class="lk-kicker">Enterprise team</p>' + segH('ent', 'Enterprise team', [['lean', 'Lean'], ['std', 'Standard'], ['fd', 'Forward-deployed']], S.entTeam) +
          '<h5 class="fr-h">Cap table</h5>' + capH() +
          '<div class="btnrow">' + btn('round', ui.round ? 'Close the term sheets' : 'Open a round', 'ebtn2', { x: 'aria-expanded="' + ui.round + '"' }) + '</div>';
        if (ui.round) {
          var done = S.raisedT === t, gt = growthTerms(S), gopts = [.05, .1, .15, .2, .25].filter(function (f) { return f <= gt.max + 1e-9; }).map(function (f) { return [f, pct(f)]; });
          if (gopts.length && ui.gf > gopts[gopts.length - 1][0]) ui.gf = gopts[gopts.length - 1][0];
          var gok = !gt.err && gopts.length > 0, pre = gt.pre, amt = pre * ui.gf / (1 - ui.gf), disc = gt.mul * gt.back, why = [];
          if (gt.mul < 1) why.push('last half cost ' + F.x(gt.sx, 1) + ' its revenue');
          if (gt.back < 1) why.push('you raised last half');
          var gLines = gok ? [['You sell', segH('gf', 'Share to sell', gopts, ui.gf)], ['Amount', Bn(amt)], ['Pre-money', Bn(pre) + (disc < 1 ? ' <span class="lk-dim">' + pct(1 - disc) + ' off, because ' + why.join(' and ') + '</span>' : '')], ['Post-money', Bn(pre + amt)],
              ['Cost multiple', F.x(gt.sx, 1) + ' last half'], ['This year', 'Sold ' + pct(gt.dy) + ' so far; up to ' + pct(gt.max) + ' more'], ['Strings', 'None beyond a board observer.']] :
            [['Status', done ? 'You raised this half.' : gt.err || 'Leads stop at ' + pct(DILCAP) + ' dilution a year.'], ['Cost multiple', F.x(gt.sx, 1) + ' last half'], ['This year', 'Sold ' + pct(gt.dy) + ' so far']];
          h += '<p class="fr-help">Rounds price off ' + T('runrate', 'run-rate') + ': about 22 times it here, adjusted for growth, your distance from the frontier, trust and charter. The ' + T('post', 'post-money') + ' price is what you are worth the moment the money lands; ' + T('dilution', 'dilution') + ' is what everyone already on the cap table gives up. Growth leads discount a heavy ' + T('spendx', 'cost multiple') + ' (costs above ' + F.x(SXD, 1) + ' revenue) and a round straight after another, walk away above ' + F.x(SXR, 0) + ', and stop at ' + pct(DILCAP) + ' dilution a year. One round a half.' + (done ? ' <b>You raised this half.</b>' : '') + '</p><div class="fr-sheets">' +
            sheetH('Fallowfield Growth', 'Growth round', gLines, gok && !done ? btn('raise', 'Sign for ' + Bn(amt), 'ebtn', { fk: 'g', x: 'data-k="growth"' }) : '') +
            sheetH('Skyloft Cloud', 'Strategic credits', [['Credits', segH('sf', 'Credits as a share of fair value', [[.1, '10%'], [.2, '20%'], [.3, '30%']], ui.sf)], ['Amount', Bn(ui.sf * S.FV) + ' in ' + T('credits', 'compute credits')], ['Pre-money', Bn(.85 * S.FV) + ', 15% under fair value'], ['Capacity', kx(Math.round(ui.sf * S.FV * 1000 / (4 * CREDIT * Math.pow(HW, t)))) + ' a half for four halves'], ['Strings', credOn(S, t) ? 'Adds to the ' + kx(S.credits.k) + ' already running and resets the four halves; exclusive, no campus while it runs.' : 'Exclusive: no campus while it runs.']],
              !done ? btn('raise', 'Take the credits', 'ebtn', { fk: 's', x: 'data-k="strat"' }) : '') +
            sheetH('The Keelstone Fund', 'Sovereign', S.sovDone ? [['Status', 'Already on your cap table.']] : S.FV < 60 ? [['Status', 'Talks to labs worth $60B or more.']] : [['Size', segH('vf', 'Size as a share of fair value', [[.1, '10%'], [.25, '25%']], ui.vf)], ['Amount', Bn(ui.vf * S.FV)], ['Pre-money', Bn(1.1 * S.FV) + ', 10% over fair value'], ['Strings', 'Half builds a campus in its jurisdiction; trust −' + (S.gov === 'corp' ? 3 : 6) + '.']],
              !S.sovDone && S.FV >= 60 && !done ? btn('raise', 'Sign with Keelstone', 'ebtn', { fk: 'v', x: 'data-k="sov"' }) : '') + '</div>';
        }
        return h;
      },
      function people() {
        var lv = lvOf(youFI(S)), nx = S.SL + 1;
        var h = '<p class="lk-kicker">Research hiring</p>' + segH('hireR', 'Research hiring', [['freeze', 'Freeze'], ['steady', 'Steady'], ['agg', 'Aggressive']], S.hireR) +
          '<p class="lk-kicker">Safety hiring</p>' + segH('hireS', 'Safety hiring', [['freeze', 'Freeze'], ['steady', 'Steady'], ['agg', 'Aggressive']], S.hireS) +
          '<p class="fr-help">' + F.n(S.R) + ' researchers and ' + F.n(S.S) + ' on safety. Research speed grows with researchers and morale; readiness grows with safety compute and safety staff.</p>' +
          '<h5 class="fr-h">Weight security</h5><p class="fr-help">SL' + S.SL + ' now (' + T('sl', 'security level') + '); your Level ' + lv + ' model calls for SL' + Math.max(1, LV.sl[lv]) + '. Upkeep ' + Bn(SLUP[S.SL]) + ' a half.' + (S.slP ? ' SL' + S.slP.to + ' arrives ' + hl(S.slP.at) + '.' : '') + '</p>' +
          (S.SL < 5 && !S.slP ? '<div class="btnrow">' + btn('sec', 'Upgrade to SL' + nx + ' · ' + Bn(SLCOST[nx]) + ', ready ' + hl(S.t + (nx === 5 ? 2 : 1)), 'ebtn2', { x: SLCOST[nx] > S.cash ? 'disabled' : '' }) + '</div>' : '') +
          '<h5 class="fr-h">Safety posture</h5><p class="fr-help">' + POLN[S.pol] + (S.polNext ? '; an if-then policy takes effect next half' : '') + (S.amended ? '; thresholds amended in ' + hl(S.amendT) : '') + '.</p>' +
          (S.pol !== 'ifthen' && !S.polNext ? '<div class="btnrow">' + btn('publish', 'Publish an if-then policy', 'ebtn2') + '</div><p class="fr-help">Trust +4 and a higher trust floor. The gates apply from next half.</p>' : '') +
          (S.pol === 'ifthen' && !S.amended ? '<div class="btnrow">' + btn('amend', 'Amend the thresholds', 'ebtn2') + '</div><p class="fr-help">Once only: the readiness bars at Levels 3 and 4 drop by 10. Trust −6, morale −6, board −10. Revising a framework openly and in advance reads very differently from revising it the week it binds.</p>' : '') +
          '<h5 class="fr-h">Charter</h5><p class="fr-help">' + govName(S) + '. Valuations at ' + F.x(S.chF) + ', rounds up to ' + pct(S.rcap) + '.</p>';
        if (S.gov === 'np') h += S.recap ? '<p class="fr-help">Recapitalization filed; it resolves next half.</p>' : S.t < 3 ? '<p class="fr-help">From ' + hl(3) + ' you can file to recapitalize as a public benefit corporation under nonprofit control.</p>' :
          S.t < S.recapT + 2 ? '<p class="fr-help">You can try the recapitalization again in ' + hl(S.recapT + 2) + '.</p>' :
          '<div class="btnrow">' + btn('recap', 'Recapitalize as a PBC under nonprofit control · $0.2B', 'ebtn2') + '</div><p class="fr-help">About ' + pct(.7 + (S.breaches ? 0 : .2) - (S.inc.severe ? .3 : 0)) + ' likely to clear. Larger rounds and better valuations; the mission lock stays.</p>';
        if (S.gov === 'corp' && !S.pbcConv) h += '<div class="btnrow">' + btn('reinc', 'Reincorporate as a public benefit corporation · $0.05B', 'ebtn2') + '</div><p class="fr-help">Valuation ×0.95, a higher trust floor, and duties to a stated public benefit.</p>';
        h += '<h5 class="fr-h">Meters</h5><dl class="fr-meters"><dt>Morale</dt><dd>' + K.meter(S.morale / 25, 'Morale ' + Math.round(S.morale) + ' of 100') + ' <span class="lk-num">' + Math.round(S.morale) + '</span></dd>' +
          (S.BC != null ? '<dt>Board confidence</dt><dd>' + K.meter(S.BC / 25, 'Board confidence ' + Math.round(S.BC) + ' of 100') + ' <span class="lk-num' + (S.BC < 25 ? ' lk-loss' : '') + '">' + Math.round(S.BC) + '</span></dd>' :
            '<dt>Investor patience</dt><dd>' + (S.lowG ? S.lowG + ' slow ' + F.plural(S.lowG, 'half', 'halves') + ' in a row' : 'Fine') + '</dd>') +
          '<dt>Regulation</dt><dd>' + ['None yet', 'Transparency rules', 'Pre-deployment evaluation'][S.reg] + ' <span class="lk-dim">(pressure ' + S.RPr + ')</span></dd></dl>';
        return h;
      }
    ];
    function sheetH(who, kind, lines, b) {
      return '<div class="lk-card fr-sheet"><p class="lk-kicker">' + kind + '</p><p class="fr-sheet-h">' + who + '</p><dl>' +
        lines.map(function (l) { return '<dt>' + l[0] + '</dt><dd>' + l[1] + '</dd>'; }).join('') + '</dl>' + (b ? '<div class="btnrow">' + b + '</div>' : '') + '</div>';
    }
    function gaugeH() {
      var p = ui.pre, fg = flagship(S), price = PAPI * S.p * (p ? Math.exp(-(p.gap || 0) / 8) : 1), cost = p ? p.cpm * (S.think ? 2.2 : 1) : 0, mx = Math.max(price, cost) * 1.1 || 1, m = price > 0 ? (price - cost) / price : 0;
      return '<div class="fr-gauge" aria-hidden="true"><span class="fr-g-cost" style="--w:' + (cost / mx).toFixed(3) + '"></span><span class="fr-g-price" style="--w:' + (price / mx).toFixed(3) + '"></span></div>' +
        '<p class="fr-help">You realize about ' + F.usd(price, 2) + ' per million API tokens after the frontier discount; each answer costs ' + F.usd(cost, 2) + ' per million to serve' + (S.think ? ' with thinking' : '') + '. <span class="' + (m >= 0 ? 'lk-gain' : 'lk-loss') + '">Margin ' + pct(m) + '.</span>' + (fg ? '' : '') + '</p>';
    }
    function capH() {
      var c = S.cap, seg = [['you', 'Founders and staff'], ['inv', 'Investors'], ['strat', 'Skyloft'], ['sov', 'Keelstone']];
      return '<div class="fr-cap" aria-hidden="true">' + seg.map(function (s) { return c[s[0]] > .001 ? '<i class="fr-cap-' + s[0] + '" style="flex-grow:' + c[s[0]].toFixed(4) + '"></i>' : ''; }).join('') + '</div>' +
        '<p class="fr-capkey">' + seg.filter(function (s) { return c[s[0]] > .001; }).map(function (s) { return '<span><i class="fr-cap-' + s[0] + '"></i>' + s[1] + ' ' + pct(c[s[0]]) + '</span>'; }).join('') + '</p>';
    }
    function trainRead() {
      var Cp = Math.pow(10, ui.lc), r = ui.r, n = etaOf(S, Cp, Math.max(S.al.tr, .01), 0), f = FI(Cp * S.algo, r), L = lvOf(f), fg = flagship(S);
      var pf = clamp(.05 + .08 * Math.max(0, lg(Cp / S.prevMax) - .5), .05, .25) - (S.al.re >= .35 ? .03 : 0);
      var cpm = cpmOf(S, { Cp: Cp, r: r, af: S.unl.sparse != null ? .07 : .12 }, ui.pre ? ui.pre.fl.price : RES0 * Math.pow(HW, S.t));
      var thr = Cp >= 1e26 ? 'Above 10²⁶ and 10²⁵' : Cp >= 1e25 ? 'Above 10²⁵' : 'None';
      return cell('Compute', F.sci(Cp), '', '<small class="lk-dim">' + F.x(Cp / S.prevMax, 1) + ' your largest run</small>') +
        cell('Finishes in', n >= 99 ? 'Not in time' : n + ' ' + F.plural(n, 'half', 'halves'), n >= 99 || S.t + n > 8 ? 'is-bad' : '', '<small class="lk-dim">at ' + pct(S.al.tr) + ' training share</small>') +
        cell('Forecast', 'FI ' + fi1(f) + ' ±2', '', '<small class="lk-dim">vs frontier ' + fi1(rivMax(S)) + ' today</small>') +
        cell('Risk level', 'Level ' + L, S.SR < reqOf(S, L) + jumpOf(S, f) ? 'is-warn' : '', '<small class="lk-dim">bar: readiness ' + (reqOf(S, L) + jumpOf(S, f)) + (jumpOf(S, f) ? ' with the step' : '') + ', SL' + Math.max(1, LV.sl[L]) + '</small>') +
        cell('Serving cost', F.usd(cpm, 2), '', '<small class="lk-dim">per million tokens' + (fg ? '; now ' + F.usd(cpmOf(S, fg, ui.pre ? ui.pre.fl.price : RES0), 2) : '') + '</small>') +
        cell('Stall risk', F.prob(Math.max(.02, pf)), '', '<small class="lk-dim">a half, from the size of the jump</small>') +
        cell('Thresholds', thr, Cp >= 1e26 ? 'is-warn' : '', '<small class="lk-dim">EU 10²⁵, California 10²⁶</small>') +
        cell('Shape cost', F.x(Math.sqrt(20 / r), 2), '', '<small class="lk-dim">serving cost vs compute-optimal</small>');
    }
    function renderPrev() {
      var p = ui.pre; if (!p) return;
      var cf = p.real - p.c.total - S.oneOff * 0, runway = cf >= 0 ? 'cash-positive' : Math.max(0, Math.floor(p.cash / -cf)) + ' ' + F.plural(Math.max(0, Math.floor(p.cash / -cf)), 'half', 'halves') + ' of runway';
      var rl = 'No run in progress.';
      if (S.run) {
        var c2 = ui.preS && ui.preS.run, done = !c2;
        if (done) { var m = ui.preS.models[ui.preS.models.length - 1]; rl = 'The run finishes: forecast FI ' + fi1(m.fi) + ' ±2, Level ' + lvOf(m.fi) + '.'; }
        else { var n0 = etaOf(ui.preS, c2.Cp, S.al.tr, c2.prog), n = n0 + 1; rl = 'The run reaches ' + pct(c2.prog / c2.Cp) + (S.al.tr > 0 ? (n0 >= 99 || S.t + n > 8 ? ', and will not finish before the end of Year 4 at this training share.' : ' (finishes in about ' + n + ' ' + F.plural(n, 'half', 'halves') + ').') : ', and no further until training gets a share.'); }
      }
      E.prev.innerHTML = '<span class="lk-kicker">If the half goes to plan</span>Revenue ' + Bn(p.real) + ', costs ' + Bn(p.c.total) + ', cash after ' + Bn(p.cash) + ' (' + runway + '). Serving covers ' + pct(p.phi) + ' of demand at ' + pct(p.gm) + ' inference margin. ' + rl + ' Incident risk ' + F.prob(p.p) + ' (' + F.prob(p.p0) + ' with no safety work).';
    }
    function renderGo() {
      var ok = S.card && S.card.pick >= 0;
      keepFocus(function () {
        E.go.innerHTML = (ui.err ? '<p class="fr-err lk-loss" role="status">' + esc(ui.err) + '</p>' : '') +
          '<button type="button" class="ebtn fr-run" data-act="step" data-fk="run"' + (ok ? '' : ' disabled') + '>' + (ok ? 'Run ' + hl(S.t) : 'Answer the card first') + '</button>';
      });
    }

    /* ---------- the race board ---------- */
    function series() {
      var n = Math.min(S.t, 8), tr = S.track || { you: [], riv: [[], [], []] };
      return { n: n, you: tr.you.slice(0, n).concat([youFI(S)]), riv: [0, 1, 2].map(function (k) { return tr.riv[k].slice(0, n).concat([S.riv[k].fi]); }) };
    }
    var RIVA = [.62, .46, .34];
    /* canvas colours read from the canvas's own ground, so the same painter works on paper and in the dark room */
    function inkIn(c) { var sc = c.parentNode; return function (a) { return K.labColorA('--ink', a, sc); }; }
    function paintRace(c, H, anim) {
      var f = K.fitCanvas(c, H), x = f.ctx, W = f.W, ink = inkIn(c), card = K.labColor('--paper', c.parentNode), LB = { px: 11, halo: card };
      if (!(W > 0)) return;
      function lb(o) { for (var k3 in LB) if (o[k3] == null) o[k3] = LB[k3]; return o; }
      x.clearRect(0, 0, W, H);
      var sr = series(), n = sr.n, all = [], i, k;
      sr.you.concat(sr.riv[0], sr.riv[1], sr.riv[2]).forEach(function (v) { if (v > 0) all.push(v); });
      var lo = Math.min(45, Math.min.apply(null, all) - 3), hi = Math.max(95, Math.max.apply(null, all) + 3), wide = W >= 520;
      /* wide: the four names stand in a column right of the plot, each on a thin leader to its point, so they never stack on
         the risk lines or on each other; the plot gives up exactly the column's width */
      var labs = [], colW = 0;
      function tw(s2) { x.save(); x.font = K.LBL(LB.px); if ('letterSpacing' in x) x.letterSpacing = '1px'; var m = x.measureText(s2).width; x.restore(); return m; }
      if (wide) {
        labs.push({ v: sr.you[n] || 0, s: 'YOU ' + fi1(sr.you[n] || 0), c: ink(.92), you: true });
        S.riv.forEach(function (r, k2) { labs.push({ v: sr.riv[k2][n], s: r.nm.toUpperCase() + ' ' + fi1(sr.riv[k2][n]), c: ink(Math.max(.62, RIVA[k2] + .2)) }); });
        labs.forEach(function (l) { colW = Math.max(colW, tw(l.s)); });
      }
      var L = 14, R = W - (wide ? Math.ceil(colW) + 40 : 14), T = 26, B = H - 30;
      function X(k2) { return L + (R - L) * k2 / 8; }
      function Y(v) { return B - (v - lo) / (hi - lo) * (B - T); }
      x.lineWidth = 1;
      [[60, 'LEVEL 2'], [72, 'LEVEL 3'], [84, 'LEVEL 4']].forEach(function (lv) {
        var y = K.snap(Y(lv[0]));
        x.strokeStyle = ink(.22); x.setLineDash([3, 5]); x.beginPath(); x.moveTo(L, y); x.lineTo(R, y); x.stroke(); x.setLineDash([]);
        K.cvText(x, lv[1], L + 2, y - 5, lb({ color: ink(.6) }));
      });
      for (i = 0; i < 4; i++) {
        K.cvText(x, 'Y' + (i + 1), (X(2 * i) + X(2 * i + 2)) / 2, H - 10, lb({ align: 'center', color: ink(.6) }));
        if (i) { x.strokeStyle = ink(.18); x.beginPath(); x.moveTo(K.snap(X(2 * i)), B); x.lineTo(K.snap(X(2 * i)), B + 6); x.stroke(); }
      }
      x.strokeStyle = ink(.3); x.beginPath(); x.moveTo(L, K.snap(B)); x.lineTo(R, K.snap(B)); x.stroke();
      K.cvText(x, 'THE FRONTIER INDEX', W - 14, 14, lb({ align: 'right', color: ink(.6) }));
      if (S.ph !== 'over' && n < 8) {
        var tp = Math.max.apply(null, sr.riv.map(function (a) { return a[n]; })), pe = tp + 3.3 * (8 - n);
        x.strokeStyle = ink(.3); x.lineWidth = 1; x.setLineDash([1, 4]); x.beginPath(); x.moveTo(X(n), Y(tp)); x.lineTo(X(8), Y(pe)); x.stroke(); x.setLineDash([]);
        if (wide) K.cvText(x, 'THE PACE', X(8) - 4, Y(pe) - 6, lb({ align: 'right', color: ink(.6) }));
      }
      if (S.ph !== 'over' && n < 8) { var nx = K.snap(X(n)); x.strokeStyle = K.ACCA(.55); x.beginPath(); x.moveTo(nx, T - 6); x.lineTo(nx, B); x.stroke(); K.cvText(x, 'NOW', nx, T - 10, lb({ align: 'center', color: ink(.7) })); }
      function path(a, col, lw, dash) {
        x.strokeStyle = col; x.lineWidth = lw; x.lineJoin = 'round'; x.lineCap = 'round'; x.setLineDash(dash || []);
        x.beginPath(); x.moveTo(X(0), Y(a[0]));
        for (k = 1; k <= n; k++) {
          var e = k === n ? anim : 1;
          x.lineTo(X(k - 1) + (X(k) - X(k - 1)) * e, Y(a[k - 1]));
          if (e >= 1) x.lineTo(X(k), Y(a[k]));
        }
        x.stroke(); x.setLineDash([]);
      }
      for (i = 2; i >= 0; i--) path(sr.riv[i], ink(RIVA[i]), 1.4, i === 2 ? [5, 4] : null);
      path(sr.you, K.ACC(), 2.4);
      if (anim >= 1) {
        sr.riv.forEach(function (a, k2) { x.fillStyle = ink(Math.min(.8, RIVA[k2] + .12)); x.beginPath(); x.arc(X(n), Y(a[n]), 2.6, 0, 6.2832); x.fill(); });
        if (sr.you[n] > 0) { x.fillStyle = card; x.beginPath(); x.arc(X(n), Y(sr.you[n]), 5, 0, 6.2832); x.fill(); x.fillStyle = K.ACC(); x.beginPath(); x.arc(X(n), Y(sr.you[n]), 3.6, 0, 6.2832); x.fill(); }
      }
      x.fillStyle = K.ACC();
      S.launches.forEach(function (l) { if (l.t <= n && (l.t < n || anim >= 1)) { x.beginPath(); x.arc(X(l.t), Y(sr.you[l.t] || l.fi), 3.2, 0, 6.2832); x.fill(); } });
      if (S.run && S.ph === 'play') {
        var eta = etaOf(S, S.run.Cp, S.al.tr, S.run.prog), fx = FI(S.run.Cp * S.run.a0 * Math.pow(S.algo / S.run.a0, .3), S.run.r), ex = X(Math.min(8, n + eta)), ey = Y(fx);
        x.strokeStyle = K.ACC(); x.lineWidth = 1.2;
        x.beginPath(); x.moveTo(ex, Y(fx + 2)); x.lineTo(ex, Y(fx - 2)); x.stroke();
        x.fillStyle = card; x.beginPath(); x.arc(ex, ey, 4.5, 0, 6.2832); x.fill(); x.lineWidth = 1.6; x.stroke();
        if (wide) { var nm2 = n + eta > 8 ? 'NEXT MODEL, AFTER Y4' : 'NEXT MODEL', nw = tw(nm2); K.cvText(x, nm2, Math.max(L + nw / 2, Math.min(ex, R - nw / 2)), ey - 10, lb({ align: 'center', color: ink(.72) })); }
      }
      if (wide && anim >= 1) {
        var cx = R + 26, px0 = X(n);
        labs.forEach(function (l) { l.py = Y(l.v); l.y = l.py; });
        labs.sort(function (a, b) { return a.y - b.y; });
        for (k = 1; k < labs.length; k++) if (labs[k].y - labs[k - 1].y < 15) labs[k].y = labs[k - 1].y + 15;
        var ov = labs[labs.length - 1].y - (B - 2); if (ov > 0) labs.forEach(function (l) { l.y -= ov; });
        var un = T + 6 - labs[0].y; if (un > 0) labs.forEach(function (l) { l.y += un; });
        /* each leader: a faint dotted run from the point to the plot's edge (none once the race is over), then a solid
           elbow into the column */
        x.lineWidth = 1;
        labs.forEach(function (l) {
          var ex0 = Math.max(R, px0 + 7);
          if (ex0 > px0 + 7) { x.strokeStyle = ink(.2); x.setLineDash([1, 3]); x.beginPath(); x.moveTo(px0 + 7, K.snap(l.py)); x.lineTo(ex0, K.snap(l.py)); x.stroke(); x.setLineDash([]); }
          x.strokeStyle = l.you ? K.ACCA(.75) : ink(.42);
          x.beginPath(); x.moveTo(ex0, l.py); x.lineTo(ex0 + 6, l.py); x.lineTo(cx - 6, l.y); x.stroke();
          K.cvText(x, l.s, cx, l.y + 4, lb({ color: l.c }));
        });
      }
    }
    function renderRaceText() {
      var sr = series(), n = sr.n, you = sr.you[n] || 0;
      E.leg.innerHTML = '<span class="fr-key fr-key--you"><i></i>You ' + fi1(you) + '</span>' + S.riv.map(function (r, k) { return '<span class="fr-key fr-key--r' + k + '"><i></i>' + r.nm + ' ' + fi1(r.fi) + '</span>'; }).join('') +
        '<span class="fr-key fr-key--lv">Dashed lines: risk levels 2, 3, 4</span>';
      var rows = '';
      for (var k = 0; k <= n; k++) rows += '<tr><th scope="row">' + (k < 8 ? hl(k) : 'Final') + '</th><td>' + fi1(sr.you[k] || 0) + '</td>' + sr.riv.map(function (a) { return '<td>' + fi1(a[k]) + '</td>'; }).join('') + '</tr>';
      E.rtab.innerHTML = '<caption>The Frontier Index by half, you and the three rivals</caption><thead><tr><th scope="col">Half</th><th scope="col">You</th><th scope="col">Obelisk</th><th scope="col">Vesper</th><th scope="col">Sable</th></tr></thead><tbody>' + rows + '</tbody>';
    }
    function paintMoney(c) {
      var H = 240, f = K.fitCanvas(c, H), x = f.ctx, W = f.W, hs = S.hist, ink = inkIn(c), card = K.labColor('--paper', c.parentNode), LB = { px: 11, halo: card };
      function lb(o) { for (var k3 in LB) if (o[k3] == null) o[k3] = LB[k3]; return o; }
      if (!(W > 0) || !hs.length) return;
      x.clearRect(0, 0, W, H);
      var L = 50, R = W - 54, T = 34, B = H - 30, mx = 0, cmin = 0, cmax = 0, n = hs.length, i, lab = ink(.72);
      hs.forEach(function (h) { mx = Math.max(mx, h.real, h.c.total); cmin = Math.min(cmin, h.cash); cmax = Math.max(cmax, h.cash); });
      mx = mx * 1.1 || 1; cmax = cmax > 0 ? cmax * 1.1 : 1; if (cmin < 0) cmin *= 1.1;
      var bw = (R - L) / 8, Yv = function (v) { return B - v / mx * (B - T); }, Yc = function (v) { return B - (v - cmin) / (cmax - cmin || 1) * (B - T); };
      K.cvText(x, W < 420 ? 'REVENUE AND COST, $B PER HALF' : 'REVENUE BY LINE AND TOTAL COST, $B PER HALF', 14, 12, lb({ color: lab }));
      K.cvText(x, 'CASH, RIGHT SCALE', W - 4, 26, lb({ align: 'right', color: lab }));
      /* the left scale: gridlines at zero, half and the top */
      [0, mx / 2, mx].forEach(function (v) {
        var y = K.snap(Yv(v));
        x.strokeStyle = ink(v ? .14 : .3); x.lineWidth = 1; x.beginPath(); x.moveTo(L, y); x.lineTo(R, y); x.stroke();
        K.cvText(x, Bn(v), L - 6, y + 4, lb({ align: 'right', color: lab, ls: '0px' }));
      });
      /* the right scale for cash, with a dashed zero when cash went negative */
      (cmin < 0 ? [cmin, 0, cmax] : [0, cmax]).forEach(function (v) {
        var y = K.snap(Yc(v));
        x.strokeStyle = ink(.3); x.lineWidth = 1; x.beginPath(); x.moveTo(R, y); x.lineTo(R + 4, y); x.stroke();
        K.cvText(x, Bn(v), R + 8, y + 4, lb({ color: lab, ls: '0px' }));
      });
      if (cmin < 0) { var yz = K.snap(Yc(0)); x.strokeStyle = ink(.35); x.setLineDash([2, 3]); x.beginPath(); x.moveTo(L, yz); x.lineTo(R, yz); x.stroke(); x.setLineDash([]); }
      x.strokeStyle = ink(.3); x.beginPath(); x.moveTo(K.snap(R), T); x.lineTo(K.snap(R), B); x.stroke();
      for (i = 0; i < n; i++) {
        var h = hs[i], x0 = L + bw * i + bw * .2, w = bw * .6, y = B;
        [[h.rA, K.ACC()], [h.rC, ink(.62)], [h.rE, ink(.36)]].forEach(function (s2) {
          var hh = s2[0] / mx * (B - T); x.fillStyle = s2[1]; x.fillRect(x0, y - hh, w, hh); y -= hh;
          x.fillStyle = card; x.fillRect(x0, y - .5, w, 1);
        });
        if (bw >= 40) K.cvText(x, hl(h.t).replace('·', ' '), x0 + w / 2, H - 10, lb({ align: 'center', color: lab, ls: '0px' }));
      }
      /* narrow: one label per year, under its two halves */
      if (bw < 40) for (i = 0; i < 4 && 2 * i < n; i++) {
        K.cvText(x, 'Y' + (i + 1), L + bw * (2 * i + 1), H - 10, lb({ align: 'center', color: lab }));
        if (i) { x.strokeStyle = ink(.18); x.lineWidth = 1; x.beginPath(); x.moveTo(K.snap(L + bw * 2 * i), B); x.lineTo(K.snap(L + bw * 2 * i), B + 6); x.stroke(); }
      }
      x.strokeStyle = ink(.8); x.lineWidth = 1.5; x.beginPath();
      for (i = 0; i < n; i++) { var cx = L + bw * (i + .5), cy = Yv(hs[i].c.total); if (i) x.lineTo(cx, cy); else x.moveTo(cx, cy); }
      x.stroke(); x.fillStyle = ink(.8);
      for (i = 0; i < n; i++) x.fillRect(L + bw * (i + .5) - 2.5, Yv(hs[i].c.total) - 2.5, 5, 5);
      x.strokeStyle = ink(.55); x.lineWidth = 1.5; x.setLineDash([4, 3]); x.beginPath();
      for (i = 0; i < n; i++) { var dx = L + bw * (i + .5), dy = Yc(hs[i].cash); if (i) x.lineTo(dx, dy); else x.moveTo(dx, dy); }
      x.stroke(); x.setLineDash([]);
    }
    function paintAll() {
      if (dead || !S) return;
      if (E.rc.clientWidth) paintRace(E.rc, E.rc.clientWidth < 420 ? 190 : 220, ui.anim);
      var d1 = root.querySelector('.fr-db-race'), d2 = root.querySelector('.fr-db-money');
      if (d1 && d1.clientWidth) paintRace(d1, d1.clientWidth < 420 ? 190 : 220, 1);
      if (d2 && d2.clientWidth) paintMoney(d2);
    }
    K.repaint(paintAll, root);

    /* ---------- the hall: mounted near the viewport, rebuilt only when its shape changes ---------- */
    var HL = { tags: [] };
    HL.lay = function (full) { tagsLayout(full); };   /* QA: the labdebug hook lays the names out on demand */
    /* the first frame: the engine's poster of the hall at rest, drawn for this stage's aspect (wide or narrow) */
    function posterH() { return (root.clientWidth || 700) < 600 ? POSTER.n : POSTER.w; }
    function hallView() { return hallAsp() < 1.4 ? { yaw: 58, pitch: 36 } : { yaw: 38, pitch: 36 }; }
    function hallAsp() { var st = E.hall.querySelector('.iso-stage'), w = st.clientWidth, h = st.clientHeight; return w && h ? w / h : 2; }
    /* wide: two rows of halls; phone: one row, corner to corner */
    function hallWrap() { return hallAsp() >= 1.4 ? 2 : 1; }
    /* the frame's margin: the wide stage keeps air for the names over two rows of halls; the phone's 4:3 stage frames tighter,
       so the hall fills about 70% of it either way */
    function hallMg() { return hallAsp() < 1.4 ? 1.1 : HMG; }
    function hallVis() { var r = E.hall.getBoundingClientRect(), vh = window.innerHeight || 0; return !document.hidden && r.width > 0 && r.bottom > vh * .1 && r.top < vh * .9; }
    function sigOf(p) { return JSON.stringify(p, function (k, v) { return k === 'roles' || k === 'order' ? undefined : v; }); }
    function hallInit() {
      if (HL.go || dead) return;
      HL.go = true;
      core3d().then(function (P) {
        if (dead) return null;
        HL.P = P;
        if (!P.getModel('frontier-hall')) P.model('frontier-hall', HALL);
        HALL.views.iso = hallView();
        var prm = HL.prm = hallParams(S, ui, hallWrap()), o = HL.o = { params: prm, list: false, pins: false, flows: false, margin: hallMg() };
        HL.sig = sigOf(prm);
        return typeof K.scene === 'function' ? K.scene(E.hall, 'frontier-hall', o) : P.mount(E.hall, 'frontier-hall', o);
      }).then(function (X) {
        if (X && !X._build && !dead) { if (X.destroy) X.destroy(); return HL.P.mount(E.hall, 'frontier-hall', HL.o); }
        return X;
      }).then(function (X) {
        if (!X) return;
        if (dead || !X.vw || !X._build) { if (X.destroy) X.destroy(); if (!dead) E.hall.hidden = true; return; }
        HL.X = X;
        X.vw.on('frame', tagsLayout);
        X.vw.on('resize', function () { tagsReset(); if (X.o.margin !== hallMg()) { X.o.margin = hallMg(); X._frame(); } clearTimeout(HL.q); HL.q = setTimeout(hallSync, 120); });
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!dead && HL.X) { tagsReset(); HL.X.vw.invalidate(); } });
        X.on('explode', function () { reframe(700); });
        if ('IntersectionObserver' in window) { HL.io = new IntersectionObserver(hallFlush, { threshold: [0, .3, .6] }); HL.io.observe(E.hall); }
        document.addEventListener('visibilitychange', hallFlush);
        /* framed on the drawing at rest, so no air waits above it for the exploded halls; taking it apart widens the frame */
        styleAll(HL.prm); fpCalc(); reframe(0); tagsBuild(HL.prm); hallSync();
      }).catch(function (e) { E.hall.hidden = true; if (K.debug) console.warn('[frontier] the 3D hall did not load', e); });
    }
    /* restyle a row in place: no rebuild */
    function rowStyle(n, r) {
      var d = n.data, s = ROLE[r === 'id' && d.h.kind !== 'rent' ? 'sv' : r], L = n.geom.L, Fc = n.geom.F, i;
      for (i = 0; i < L.length; i += 17) { L[i + 12] = s[3]; L[i + 13] = s[1]; L[i + 14] = s[4]; L[i + 16] = s[2]; }
      for (i = 0; i < Fc.length; i++) Fc[i].a = s[5];
      n.tint = s[0]; d.role = r; n.why = rowWhy(d.h, r, HL.prm.unit); n.touch();
    }
    function styleAll(prm) { var X = HL.X; prm.order.forEach(function (id) { if (X.parts[id]) rowStyle(X.parts[id], prm.roles[id]); }); X.vw.invalidate(); }
    /* the split recolours as a wave from the substation */
    function hallRoles(prm) {
      var X = HL.X, P = HL.P, ch = [], k = 0, N = prm.order.length;
      prm.order.forEach(function (id, i) { var n = X.parts[id]; if (n && n.data.role !== prm.roles[id]) ch.push([n, i, prm.roles[id]]); });
      if (HL.wave) HL.wave();
      HL.wave = null;
      if (!ch.length) return;
      if (P.reduced() || !hallVis()) { ch.forEach(function (c) { rowStyle(c[0], c[2]); }); X.vw.invalidate(); return; }
      HL.wave = P.tween({ from: 0, to: N, dur: Math.min(560, 9 * N), ease: 'linear', update: function (v) {
        while (k < ch.length && ch[k][1] <= v) { rowStyle(ch[k][0], ch[k][2]); k++; }
        X.vw.invalidate();
      } });
    }
    function hallSync() {
      var X = HL.X, step = HL.st, prm;
      HL.st = false;
      if (dead) return;
      if (!X) return hallCap(hallParams(S, ui, 1));
      prm = hallParams(S, ui, hallWrap());
      var sig = sigOf(prm), snap = { h: {}, s: {}, up: {}, pf: HL.prm.pf };
      if (sig !== HL.sig) {
        Object.keys(X.parts).forEach(function (id) { var n = X.parts[id], d = n.data || {}; if (d.hall) snap.h[id] = 1; if (d.ch) snap.s[id] = d.ch * n.scl[1]; if (d.wall) snap.up[id] = n.scl[1] > .5; });
        HL.sig = sig; HL.prm = prm;
        rebuild(prm);
        hallAnim(snap, step);
      } else { HL.prm.roles = prm.roles; if (step) hallAnim(null, true); }
      hallRoles(prm);
      hallCap(prm);
    }
    function rebuild(prm) {
      var X = HL.X, e = X.ex;
      if (HL.wave) HL.wave();
      X._build(prm);
      if (e > .5) { X._xn.forEach(function (n) { n._e = 1; X._pose(n); }); X.ex = 1; }
      styleAll(prm);
      fpCalc(); reframe(900);
      tagsBuild(prm);
    }
    /* the frame points: the drawing at rest, and at rest plus taken apart */
    function fpCalc() {
      var X = HL.X, V = X.vw, a, b;
      function flip() { X._xn.forEach(function (n) { n._e = 1 - n._e; X._pose(n); }); }
      a = V.corners(); flip(); b = V.corners(); flip();
      HL.fpR = X.ex > .5 ? b : a; HL.fpE = a.concat(b);
    }
    function reframe(dur) {
      var X = HL.X, V = X && X.vw, c, o, t0;
      if (!V || !HL.fpR) return;
      c = V.camera; X._fp = X.ex > .5 ? HL.fpE : HL.fpR;
      X.o.margin = hallMg();
      o = V.frameCalc(X._fp, X.o.margin, X.home.yaw, X.home.pitch);
      if (HL.cam) { HL.cam(); HL.cam = null; }
      if (!o) return;
      if (!dur || HL.P.reduced() || !hallVis()) { c.target = o.target; c.radius = o.radius; c.span = o.span; V.invalidate(); return; }
      t0 = c.target.slice();
      HL.cam = HL.P.tween({ from: t0.concat(c.radius, c.span), to: o.target.concat(o.radius, o.span), dur: dur, ease: 'io',
        update: function (a) { c.target = a.slice(0, 3); c.radius = a[3]; c.span = a[4]; V.invalidate(); } });
    }
    function grow(n, a, b, dl, dur) {
      var P = HL.P;
      function u(v) { n.scl[1] = Math.max(.001, v); HL.X.vw.invalidate(); }
      u(a);
      if (!dur) P.tween({ dur: 0, delay: dl, done: function () { P.spring({ k: 120, c: 18, x: a, target: b, onUpdate: u }); } });
      else P.tween({ from: a, to: b, dur: dur, delay: dl, ease: 'out', update: u });
    }
    /* halls rise, crystals grow, walls come up: on screen, or saved until it is */
    function hallFlush() { if ((HL.pend || HL.pst) && hallVis()) hallAnim(HL.pend, HL.pst); }
    function hallAnim(snap, step) {
      if (!hallVis()) { if (snap && !HL.pend) HL.pend = snap; if (step) HL.pst = true; return; }
      if (HL.pend) snap = HL.pend;
      HL.pend = HL.pst = null;
      var X = HL.X, k = 0, d0 = step ? 640 : 0, f1 = HL.prm.pf;
      if (snap) Object.keys(X.parts).forEach(function (id) {
        var n = X.parts[id], d = n.data || {}, to = n.scl[1], fr = (snap.s[id] || 0) / d.ch;
        if (d.hall && !snap.h[id]) grow(n, .001, 1, k++ * 70);
        if (d.ch && Math.abs(fr - to) > .004) grow(n, Math.max(.001, fr), to, d0, 900);
        if (d.wall && to > .5 && !snap.up[id]) grow(n, .02, 1, d0 + 360, 900);
        if (d.pw && Math.abs(snap.pf - f1) > .001) HL.P.tween({ from: snap.pf, to: f1, dur: 900, ease: 'out', update: function (v) {
          X.parts.subx.scl[1] = X.parts.coolx.scl[1] = Math.sqrt(v); X.parts.fans.pos[1] = .5 * Math.sqrt(v); X.vw.invalidate();
        } });
      });
      if (step) pulse();
    }
    function pulse() {
      var X = HL.X, P = HL.P, seg = [], g = P.geom([]), nd = new P.Node({ id: 'pulse' }), Sg = g.S;
      if (P.reduced()) return;
      X.vw.update();
      HL.prm.order.forEach(function (id) {
        var n = X.parts[id], d = n && n.data, y = YS + RH + .04;
        if (!d || d.role !== 'tr') return;
        seg.push([P.m4.tp(n.wm, [d.x, y, d.z + RD / 2]), P.m4.tp(n.wm, [d.x, y, d.z - RD / 2])]);
        Sg.push(0, 0, 0, -4, 3, -1, 0);
      });
      var N = seg.length, st = Math.min(12, 420 / N), T = 620 + st * N;
      if (!N) return;
      nd.geom = g; nd.nopick = true; X.root.add(nd);
      P.tween({ dur: T, ease: 'linear', update: function (v) {
        seg.forEach(function (s, i) {
          var u = clamp((v * T - i * st) / 620, 0, 1), e = u * u * (3 - 2 * u), j = i * 7;
          Sg[j] = s[0][0] + (s[1][0] - s[0][0]) * e; Sg[j + 1] = s[0][1]; Sg[j + 2] = s[0][2] + (s[1][2] - s[0][2]) * e; Sg[j + 6] = u > 0 && u < 1 ? 1 : 0;
        });
        nd.touch(); X.vw.invalidate();
      }, done: function () { if (nd.parent) nd.parent.remove(nd); X.vw.invalidate(); } });
    }
    /* names and hall numbers are laid out here, not in the engine's shared layer, so they keep clear of every mark the
       drawing makes (racks, plant, towers, crystals, the risk walls) as well as of each other. A name keeps its place while
       the place stays clear, and otherwise takes the nearest clear one on a thin leader. A hall number stands off its hall's
       front edge until it clears the rows. On the phone's stage a model's pill carries only its name; picking the part
       shows its figures */
    var SVGN = 'http://www.w3.org/2000/svg';
    function tagsBuild(prm) {
      var X = HL.X, seen = {}, narrow = hallAsp() < 1.4;
      HL.tags.forEach(function (t) { if (t.e.parentNode) t.e.parentNode.removeChild(t.e); if (t.ln && t.ln.parentNode) t.ln.parentNode.removeChild(t.ln); });
      HL.tags = [];
      if (!HL.ld || HL.ld.parentNode !== X.pinsEl) {
        HL.ld = document.createElementNS(SVGN, 'svg'); HL.ld.setAttribute('class', 'fr-ld'); HL.ld.setAttribute('aria-hidden', 'true');
        X.pinsEl.insertBefore(HL.ld, X.pinsEl.firstChild);
      }
      function tg(id, txt, at, cls, pri, show) {
        var n = X.parts[id], pin = cls === 'fr-pin', e, ln = null;
        if (!n) return;
        e = document.createElement('span');
        e.className = pin ? 'fr-pin' : 'iso-label fr-lb' + (cls ? ' ' + cls : ''); e.textContent = txt; e.style.display = 'none';
        X.pinsEl.appendChild(e);
        if (!pin) { ln = HL.ld.appendChild(document.createElementNS(SVGN, 'line')); if (cls === 'fr-lb-you') ln.setAttribute('class', 'is-you'); ln.style.display = 'none'; }
        HL.tags.push({ n: n, e: e, ln: ln, at: at, pin: pin, pri: pri, o: 1, w: 0, h: 0, off: null, cands: null,
          show: show || function () { return n.scl[1] > .5; } });
      }
      prm.halls.forEach(function (h, k) {
        var n = X.parts[h.id];
        tg(h.id, String(k + 1), [-h.len / 2 + .3, 0, DEP / 2], 'fr-pin', 0);
        if (!seen[h.kind]) { seen[h.kind] = 1; tg(h.id, { own: 'Owned', res: 'Reserved', rent: 'Rented' }[h.kind], [-h.len / 2, RH + .5, -DEP / 2], 'fr-lb-g', 5, function () { return X.ex > .5 && n && n.scl[1] > .5; }); }
      });
      [prm.A, prm.B].forEach(function (c, i) { if (c) tg(c.id, narrow ? c.nm : c.nm + ' · ' + fi1(c.fi), [0, hgt(c.fi) + .06, 0], i ? '' : 'fr-lb-you', 1 + i); });
      prm.riv.forEach(function (r, i) { tg('rv' + i + 'x', r.nm, [0, hgt(r.fi) + .06, 0], r.fi >= prm.top - 1e-9 ? 'fr-lb-top' : '', 3); });
      HL.tags.sort(function (a, b) { return a.pri - b.pri; });
      HL.lsig = null;
      X.vw.update();
      tagsLayout(true);
    }
    /* every mark on screen: a box from its corners first, its faces only when a name comes near it. The risk walls are glass,
       and a name may stand over one only when no clear place is left */
    function tagMarks(V, m4) {
      var out = [];
      HL.X.root.walk(function (n) {
        var g = n.geom, bb, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, c, q;
        if (!g || !g.F || !g.F.length || !n._ev || (n.layer || 0) < 0) return;
        bb = g.bb;
        for (c = 0; c < 8; c++) {
          q = V.project(m4.tp(n.wm, [bb[c & 1 ? 3 : 0], bb[c & 2 ? 4 : 1], bb[c & 4 ? 5 : 2]]));
          if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1];
        }
        out.push({ n: n, b: [x0, y0, x1, y1], f: null, glass: !!(n.data && n.data.wall) });
      });
      return out;
    }
    function tagFaces(mk, V, m4) {
      if (mk.f) return mk.f;
      var Fc = mk.n.geom.F, out = [], i, k, p, a, q;
      for (i = 0; i < Fc.length; i++) {
        p = Fc[i].p; if (!p || p.length < 9) continue;
        a = [];
        for (k = 0; k < p.length; k += 3) { q = V.project(m4.tp(mk.n.wm, [p[k], p[k + 1], p[k + 2]])); a.push(q[0], q[1]); }
        out.push(a);
      }
      return (mk.f = out);
    }
    /* a rectangle [x0, y0, x1, y1] against a convex polygon or a segment [x, y, ...]: separating axes */
    function tagHit(r, q) {
      var n = q.length, i, j, k, d, nx, ny, a0, a1, b0, b1, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, rc = [r[0], r[1], r[2], r[1], r[2], r[3], r[0], r[3]];
      for (i = 0; i < n; i += 2) { if (q[i] < x0) x0 = q[i]; if (q[i] > x1) x1 = q[i]; if (q[i + 1] < y0) y0 = q[i + 1]; if (q[i + 1] > y1) y1 = q[i + 1]; }
      if (x1 <= r[0] || x0 >= r[2] || y1 <= r[1] || y0 >= r[3]) return false;
      for (i = 0; i < n; i += 2) {
        j = (i + 2) % n; nx = q[j + 1] - q[i + 1]; ny = q[i] - q[j];
        if (Math.abs(nx) + Math.abs(ny) < 1e-6) continue;
        a0 = b0 = 1e18; a1 = b1 = -1e18;
        for (k = 0; k < n; k += 2) { d = q[k] * nx + q[k + 1] * ny; if (d < a0) a0 = d; if (d > a1) a1 = d; }
        for (k = 0; k < 8; k += 2) { d = rc[k] * nx + rc[k + 1] * ny; if (d < b0) b0 = d; if (d > b1) b1 = d; }
        if (a1 <= b0 || b1 <= a0) return false;
      }
      return true;
    }
    /* -1: the rectangle hits a seated name or number or a solid mark; 1: it stands only over glass; 0: it is clear */
    function tagClear(r, marks, boxes, V, m4) {
      var i, j, b, f, gl = 0;
      for (i = 0; i < boxes.length; i++) { b = boxes[i]; if (r[0] < b[2] && r[2] > b[0] && r[1] < b[3] && r[3] > b[1]) return -1; }
      for (i = 0; i < marks.length; i++) {
        b = marks[i].b;
        if (r[0] >= b[2] || r[2] <= b[0] || r[1] >= b[3] || r[3] <= b[1] || (gl && marks[i].glass)) continue;
        f = tagFaces(marks[i], V, m4);
        for (j = 0; j < f.length; j++) if (tagHit(r, f[j])) { if (!marks[i].glass) return -1; gl = 1; break; }
      }
      return gl;
    }
    /* the places a name may take, nearest first: rings around its natural spot, 6px apart, with a stop every 10px or so
       along each ring; going below the anchor costs double, so a name rises before it drops */
    function tagCands(R2) {
      var out = [{ dx: 0, dy: 0, c: 0 }], r, k, n, th, dx, dy;
      for (r = 6; r <= R2; r += 6) for (n = Math.max(12, Math.round(2 * Math.PI * r / 10)), k = 0; k < n; k++) {
        th = 2 * Math.PI * k / n; dx = Math.round(r * Math.cos(th)); dy = -Math.round(r * Math.sin(th));
        out.push({ dx: dx, dy: dy, c: r * (dy > 0 ? 2 : 1) + .2 * Math.abs(dx) });
      }
      return out.sort(function (a, b) { return a.c - b.c; });
    }
    /* full: the whole search, run once the view comes to rest. Otherwise (the view is moving) each name keeps its place while
       it stays clear and looks only a short way for a better one; a full pass follows 140ms after the motion stops */
    function tagsLayout(full) {
      var X = HL.X, V = X && X.vw, m4 = HL.P && HL.P.m4, W2 = V && V.w, H2 = V && V.h, pad = 6, gap = 3, marks = null, anc = [], pins = [], names = [], base = [], sig;
      if (!W2 || !H2 || !HL.tags.length) return;
      full = full === true;
      function fits(r) { return r[0] >= pad && r[1] >= pad && r[2] <= W2 - pad && r[3] <= H2 - pad; }
      function hide(t) { if (t.e.style.display !== 'none') t.e.style.display = 'none'; if (t.ln) t.ln.style.display = 'none'; t.off = null; t.a = null; }
      HL.tags.forEach(function (t) {
        var a = t.show() && t.n._ev ? V.project(m4.tp(t.n.wm, t.at)) : null, o;
        if (!a || !a[3] || a[0] < 0 || a[0] > W2 || a[1] < 0 || a[1] > H2) return hide(t);
        if (t.e.style.display === 'none') t.e.style.display = '';
        if (!t.w) { t.w = t.e.offsetWidth; t.h = t.e.offsetHeight; t.cands = null; if (!t.w) return hide(t); }
        /* a name fades with its part when another part is picked */
        o = t.n._ea < .9 ? .35 : 1;
        if (t.o !== o) { t.o = o; t.e.style.opacity = o; if (t.ln) t.ln.style.opacity = o; }
        t.a = a;
        if (t.pin) pins.push(t);
        else { names.push(t); anc.push({ t: t, r: [a[0] - 5, a[1] - 5, a[0] + 5, a[1] + 5] }); }
      });
      /* nothing moved since the last pass (a recolour wave, a pulse): every place stands */
      sig = 0;
      for (var pid in X.parts) sig += X.parts[pid].scl[1] + X.parts[pid].pos[1];
      sig = W2 + ',' + H2 + ',' + sig.toFixed(3) + ',' + HL.tags.map(function (t) { return t.a ? Math.round(t.a[0]) + ':' + Math.round(t.a[1]) + ':' + t.w : '-'; }).join(',');
      if (sig === HL.lsig && !(full && HL.lmode !== 'full')) return;
      HL.lsig = sig; HL.lmode = full ? 'full' : 'fast';
      clearTimeout(HL.lt);
      if (!full) HL.lt = setTimeout(function () { if (!dead && HL.X) { HL.lsig = null; tagsLayout(true); } }, 140);
      marks = tagMarks(V, m4);
      /* a hall number walks out from its hall's front edge, toward the viewer, until it clears the rows */
      pins.forEach(function (t) {
        var a = t.a, b = V.project(m4.tp(t.n.wm, [t.at[0], t.at[1], t.at[2] + 1])), ux = b[0] - a[0], uy = b[1] - a[1], ul = Math.sqrt(ux * ux + uy * uy) || 1, R = t.w / 2, at = null, d, r;
        ux /= ul; uy /= ul;
        for (d = 0; d <= 72 && !at; d += 3) {
          r = [a[0] + ux * d - R - gap, a[1] + uy * d - R - gap, a[0] + ux * d + R + gap, a[1] + uy * d + R + gap];
          if (fits(r) && tagClear(r, marks, base, V, m4) === 0) at = [a[0] + ux * d - R, a[1] + uy * d - R];
        }
        if (!at) at = [a[0] + ux * (R + 6) - R, a[1] + uy * (R + 6) - R];
        t.e.style.transform = 'translate(' + at[0].toFixed(1) + 'px,' + at[1].toFixed(1) + 'px)';
        base.push([at[0] - gap, at[1] - gap, at[0] + t.w + gap, at[1] + t.h + gap]);
      });
      /* seat the names in one order. Each takes the cheapest place: its distance from the natural spot over the anchor (twice
         that below it), plus 45 for standing over a glass wall and 320 for each leader that would cross a pill. A place is
         never on the frame's edge, a solid mark, a seated name or number, or another name's anchor */
      function place(list, hyst, cap) {
        var boxes = base.slice(), segs = [], out = [], cost = 0;
        list.forEach(function (t) {
          var a = t.a, nx = a[0] - t.w / 2, ny = a[1] - 6 - t.h, i, c, pick = null, best = 1e9, v, n2;
          if (!t.cands || t.cH !== H2) { t.cands = tagCands(Math.max(120, Math.round(Math.min(W2, H2) * .6))); t.cH = H2; }
          n2 = Math.min(t.cands.length, cap);
          function at2(c2) { return { dx: clamp(nx + c2.dx, pad + gap, W2 - pad - gap - t.w) - nx, dy: c2.dy, c: c2.c }; }
          function lead(c2) { var x1 = nx + c2.dx, y1 = ny + c2.dy; return Math.abs(c2.dx) + Math.abs(c2.dy) > 3 ? [a[0], a[1], clamp(a[0], x1, x1 + t.w), clamp(a[1], y1, y1 + t.h)] : null; }
          function price(c2) {
            var r2 = [nx + c2.dx - gap, ny + c2.dy - gap, nx + c2.dx + t.w + gap, ny + c2.dy + t.h + gap], s2, k, q2, g, p2;
            if (!fits(r2)) return 1e9;
            for (k = 0; k < anc.length; k++) { q2 = anc[k].r; if (anc[k].t !== t && r2[0] < q2[2] && r2[2] > q2[0] && r2[1] < q2[3] && r2[3] > q2[1]) return 1e9; }
            if ((g = tagClear(r2, marks, boxes, V, m4)) < 0) return 1e9;
            p2 = c2.c + 45 * g;
            for (k = 0; k < segs.length; k++) if (tagHit(r2, segs[k])) p2 += 320;
            if ((s2 = lead(c2))) for (k = 0; k < boxes.length; k++) if (tagHit(boxes[k], s2)) p2 += 320;
            return p2;
          }
          /* the old place stands while it is still allowed: while the view moves, outright; at rest, unless one at least 6
             cheaper turns up */
          if (hyst && t.off) { v = price(t.off); if (v < 1e9) { pick = t.off; best = v - 6; if (!full) n2 = 0; } }
          for (i = 0; i < n2 && t.cands[i].c < best; i++) {
            c = at2(t.cands[i]); v = price(c);
            if (v < best) { best = v; pick = c; }
          }
          if (!pick && hyst && t.off && !full) pick = t.off;
          if (!pick) pick = { dx: clamp(nx, pad, W2 - pad - t.w) - nx, dy: clamp(ny, pad, H2 - pad - t.h) - ny, c: 1e4 };
          var x0 = nx + pick.dx, y0 = ny + pick.dy, ld = lead(pick);
          boxes.push([x0 - gap, y0 - gap, x0 + t.w + gap, y0 + t.h + gap]);
          if (ld) segs.push(ld);
          out.push({ t: t, x: x0, y: y0, ld: ld, off: pick, tier: Math.round(best) });
          cost += Math.min(best, 1e4);
        });
        return { out: out, cost: cost };
      }
      /* the order matters when space is tight, so at rest five are tried and the cleanest, then the most compact, wins: your
         model and the run first, then the rivals from the highest anchor down, right to left or left to right; or the rivals
         first (highest anchor down, or right to left) and your model after. The hall kinds always go last. While the view
         moves, only the order that won last time runs */
      var keys = [function (t) { return t.a[1]; }, function (t) { return -t.a[0]; }, function (t) { return t.a[0]; }, function (t) { return t.a[1]; }, function (t) { return -t.a[0]; }];
      function grp(t, k) { return t.pri === 5 ? 9 : t.pri === 0 ? 0 : k < 3 ? (t.pri < 3 ? t.pri : 3) : (t.pri === 3 ? 1 : 1 + t.pri); }
      function order(k) { return names.slice().sort(function (p, q) { return grp(p, k) - grp(q, k) || keys[k](p) - keys[k](q); }); }
      var k0 = HL.ord || 0, best = place(order(k0), true, full ? 1e9 : 90), bk = k0, k, res;
      for (k = 0; full && k < keys.length; k++) {
        if (k === k0) continue;
        res = place(order(k), false, 1e9);
        if (res.cost < best.cost - 1) { best = res; bk = k; }
      }
      HL.ord = bk;
      best.out.forEach(function (p) {
        var t = p.t;
        t.off = p.off; t.tier = p.tier;
        t.e.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px)';
        if (!t.ln) return;
        if (p.ld) {
          t.ln.setAttribute('x1', p.ld[0].toFixed(1)); t.ln.setAttribute('y1', p.ld[1].toFixed(1)); t.ln.setAttribute('x2', p.ld[2].toFixed(1)); t.ln.setAttribute('y2', p.ld[3].toFixed(1));
          t.ln.style.display = '';
        } else t.ln.style.display = 'none';
      });
    }
    function tagsReset() { HL.lsig = null; HL.tags.forEach(function (t) { t.w = 0; t.cands = null; }); }
    function hallCap(prm) {
      var n = 0, fut = 0, L;
      prm.halls.forEach(function (h) { if (h.fut) fut++; else n++; });
      E.hallD.textContent = (prm.su ? 'The hall you inherit: ' : S.ph === 'over' ? 'The hall at the end: ' : hl(prm.t) + ': ') + kGPU(prm.run) + ' running in ' + n + ' ' + F.plural(n, 'hall') +
        '. Each row is ' + kGPU(prm.unit) + ', shaded by this half’s split from the substation end.' + (fut ? ' Dashed halls are ' + (prm.su ? 'what your opening choice would add.' : 'signed and not yet running.') : '');
      L = prm.halls.map(function (h, k) {
        return '<li><button type="button" data-part="' + h.id + '" aria-pressed="false"><span class="n">' + (k + 1) + '</span><span>' + hallName(h) + '</span><span class="v">' + kGPU(h.k) + ' · ' + statusOf(h) + '</span></button></li>';
      }).join('');
      if (L !== HL.list) { HL.list = L; E.hallL.innerHTML = L; if (HL.X) HL.X._apply(true); }
    }

    /* ---------- the debrief ---------- */
    function renderEnd() {
      ui.db = true;
      var e = S.ending, you = youFI(S), top = topFI(S), gap = Math.max(0, top - you), hs = S.hist, nH = Math.max(1, hs.length), last = hs[hs.length - 1] || {};
      var brV = S.pol === 'ifthen' || S.breaches ? String(S.breaches) : '–', incN = S.inc.minor + S.inc.serious + S.inc.severe, mets = S.launches.filter(function (l) { return l.met; }).length, rank = rankOf(S);
      var book = 0; S.owned.forEach(function (w) { if (w.on <= S.t) book += w.capex * Math.max(0, 1 - (S.t - w.on) / 10); });
      var cashF = S.cash + .5 * book, trained = S.models.slice(1), big = trained.reduce(function (a, m) { return m.Cp > a.Cp ? m : a; }, S.models[0]);
      var jumps = trained.map(function (m, i) { var prev = i ? Math.max.apply(null, S.models.slice(0, i + 1).map(function (q) { return q.Cp; })) : 4e25; return m.Cp / prev; });
      var maxJ = jumps.length ? Math.max.apply(null, jumps) : 0, fg = flagship(S), fr = fg ? fg.r : 20;
      var obl = 0, oblK = 0, oblP = 0, nH0 = hs.length, ind = Math.pow(ALG, nH0), endT = Math.max(1, S.t), afterL = hl(endT - 1);
      var span = nH0 >= 8 ? 'four years' : nH0 % 2 === 0 && nH0 > 0 ? ['', 'one year', 'two years', 'three years'][nH0 / 2] : nH0 + ' ' + F.plural(nH0, 'half', 'halves');
      S.contracts.forEach(function (c) { var n2 = Math.max(0, c.end - Math.max(endT, c.start) + 1); obl += n2 * c.k * c.p / 1000; if (n2) { oblK += c.k * n2; oblP += c.k * c.p * n2; } });
      var todayP = RES0 * Math.pow(HW, endT), prem = oblK ? (oblP / oblK) / todayP - 1 : 0;
      var th = S.thinkH.length ? hs[S.thinkH[S.thinkH.length - 1]] : null;
      var unl = UNL.filter(function (u) { return S.unl[u[0]] != null; }).map(function (u) { return { sparse: 'sparse experts', reason: 'reasoning', distill: 'distillation', kernels: 'kernels', aird: 'AI-assisted research' }[u[0]] + ' (' + hl(S.unl[u[0]] + 1 > 7 ? 7 : S.unl[u[0]] + 1) + ')'; });
      var behind = hs.filter(function (h) { return h.top > h.you + .05; }).length, cpm0 = hs.length ? hs[0].cpm : 0, cpm1 = last.cpm || 0;
      var gmAvg = S.gmSum / nH, shorts = hs.filter(function (h) { return h.phi < .95; }).length;
      function src(keys) { return S_(keys); }
      var shape = fr === 20 ? 'Your flagship trained compute-optimal: the most capability per training FLOP, and the priciest model to serve at that size.' :
        fr === 8 ? 'Your flagship trained big and hungry: the same capability as compute-optimal for about 58% more serving cost. The Chinchilla paper exists to stop exactly this.' :
        'Your flagship trained lean (' + fr + ' tokens per parameter): about ' + fi1(FI(fg.Cp, 20) - FI(fg.Cp, fr)) + ' FI below compute-optimal and ' + pct(1 - Math.sqrt(20 / fr)) + ' cheaper to serve on every token afterward.';
      var lessons = [
        K.lesson({ title: 'Scaling', you: trained.length ? 'You trained ' + trained.length + ' ' + F.plural(trained.length, 'model') + '; the largest used ' + F.sci(big.Cp) + ' FLOP of physical compute (' + F.sci(big.eff || big.Cp) + ' effective). ' + (maxJ > 12 ? 'One run jumped ' + F.x(maxJ, 0) + ' over your previous largest; big jumps are the runs that stall. ' : '') + shape : 'You trained no new models; Alder 1 carried the lab for ' + span + '.',
          principle: 'Each tenfold of effective compute bought about 9 FI. Staying at the frontier is multiplication.',
          history: 'Meta trained Llama 3.1 405B on 3.8 × 10²⁵ FLOP and 15.6 trillion tokens on more than 16,000 H100s, and trained its 8B model on up to 15 trillion tokens against a compute-optimal 200 billion.', src: src('herd llama3') }),
        K.lesson({ title: 'Research versus product', you: 'Your algorithmic multiplier ended at ' + F.x(S.algo, 1) + ' against ' + F.x(ind, 0) + ' at the industry’s pace over the same ' + F.plural(nH0, 'half', 'halves') + '. Average research share: ' + pct(S.reSum / nH) + '. ' + (unl.length ? 'Opened: ' + unl.join(', ') + '.' : 'No research breakthrough landed.'),
          principle: 'Algorithms have halved the compute needed for a result about every 8 months; research compute is the recipe, not overhead.',
          history: 'Epoch AI estimated that about $4.5B of OpenAI’s roughly $5B of 2024 R&D compute went to research, experiments and unreleased models rather than final training runs.', src: src('eoai ho') }),
        K.lesson({ title: 'Inference economics', you: 'Inference margin averaged ' + pct(gmAvg) + ' (best ' + pct(S.gmMax) + ', worst ' + pct(Math.min(S.gmMin, 1)) + '); your cost per million tokens went from ' + F.usd(cpm0, 2) + ' to ' + F.usd(cpm1, 2) + '. ' +
            (th ? 'Thinking mode was on for ' + S.thinkH.length + ' ' + F.plural(S.thinkH.length, 'half', 'halves') + '. ' : '') + (shorts ? 'You turned customers away in ' + shorts + ' ' + F.plural(shorts, 'half', 'halves') + '.' : 'You never ran out of serving capacity.'),
          principle: 'Serving cost is set by active parameters, utilization and hardware; price is set by how far you are from the frontier.',
          history: 'Epoch AI found the price of a fixed level of performance fell 9× to 900× a year depending on the task; OpenAI reported in 2024 that o1 improves with more thinking at inference, which also means more tokens per answer.', src: src('eprice o1') }),
        K.lesson({ title: 'Compute contracts', you: 'Spend by type: spot ' + Bn(S.spend.spot) + ', reserved ' + Bn(S.spend.res) + ', owned ' + Bn(S.spend.own + S.spend.capex) + ' (including ' + Bn(S.spend.capex) + ' of capex), credits worth ' + Bn(S.spend.cred) + '. ' + Bn(S.idle) + ' of serving capacity sat idle. ' +
            (obl > 0 ? 'You end locked into ' + Bn(obl) + ' of payments after ' + afterL + ', ' + (prem >= 0 ? pct(prem) + ' above' : pct(-prem) + ' below') + ' what the same capacity would cost to reserve today.' : 'You end with no payments locked in past ' + afterL + '.'),
          principle: 'Take-or-pay is cheap per hour and expensive in a bad half; owned capacity pays only if it is built early and kept busy.',
          history: 'The frontier labs now sign compute in gigawatts: Stargate’s announced $500B over four years, OpenAI’s letter of intent with Nvidia (10 GW) and definitive agreement with AMD (6 GW), Anthropic’s deal for up to one million Google TPUs and a $30B Azure commitment.', src: src('stargate nvloi amd amdir tpu msnv') }),
        K.lesson({ title: 'Safety and commitments', you: 'Posture: ' + POLN[S.pol].toLowerCase() + '. You launched ' + S.launches.length + ' ' + F.plural(S.launches.length, 'model') + '; readiness met the bar at ' + mets + ' of those launches. ' + (S.pol === 'ifthen' || S.breaches ? 'Breaches: ' + S.breaches + '.' : 'No thresholds, so no breaches to count.') + ' Incidents: ' + S.inc.minor + ' minor, ' + S.inc.serious + ' serious, ' + S.inc.severe + ' severe. Expected incidents given your safety work: ' + S.Eact.toFixed(2) + '; with none: ' + S.Ezero.toFixed(2) + '.',
          principle: 'Safety is measured in incidents that did not happen; count them against the ones that would have.',
          history: 'Anthropic activated ASL-3 protections for Claude Opus 4 in May 2025 as a precaution; OpenAI’s Preparedness Framework and Google DeepMind’s Frontier Safety Framework use similar capability thresholds; 16 companies signed the Seoul commitments in May 2024.', src: src('asl3 prep fsf seoul') }),
        K.lesson({ title: 'Money and governance', you: 'You raised ' + Bn(S.raised) + ' in ' + S.rounds.length + ' ' + F.plural(S.rounds.length, 'round') + '; your side owns ' + pct(S.cap.you) + ' of a ' + Bn(S.FV) + ' company (' + Bn(S.cap.you * S.FV) + '). ' +
            (S.cap.strat > .001 || S.cap.sov > .001 ? 'Skyloft holds ' + pct(S.cap.strat) + ' and the Keelstone Fund ' + pct(S.cap.sov) + '. ' : '') + (S.weekends ? 'The board met without you ' + S.weekends + ' ' + F.plural(S.weekends, 'time') + '.' : S.gov === 'corp' && !S.pbcConv ? 'No one could remove you for the mission; investors could only write letters.' : 'Your charter never had to hold.'),
          principle: 'Structure trades fundraising flexibility for mission lock, and it is tested once, under pressure.',
          history: 'OpenAI moved from nonprofit (2015) to capped profit (2019) to a PBC controlled by its foundation (October 2025); Anthropic is a PBC with a Long-Term Benefit Trust; OpenAI’s board removed and then reinstated its CEO within five days in November 2023.', src: src('oailp tcrecap ltbt oust') }),
        K.lesson({ title: 'Openness', you: S.openCount ? 'You opened ' + S.openCount + ' ' + F.plural(S.openCount, 'model') + '. Your ecosystem pull ended at ' + F.x(Math.min(1.3, 1 + .08 * S.eco), 2) + ' on the API, and those weights are still out there.' : 'You kept every model closed.',
          principle: 'Open weights build ecosystems and commoditize rivals, and cannot be recalled.',
          history: 'Llama 2 (July 2023), DeepSeek-R1 (January 2025, MIT license) and OpenAI’s gpt-oss (August 2025) were released with open weights; the day DeepSeek-R1 drew global attention, Nvidia lost about $589B of market value.', src: src('llama2 r1 oss nvda') }),
        K.lesson({ title: 'Racing', you: 'A rival led you for ' + behind + ' of ' + hs.length + ' halves. You delayed ' + S.delaysBehind + ' ' + F.plural(S.delaysBehind, 'launch', 'launches') + ' for safety while behind. ' + (S.breaches ? 'You breached your own policy ' + S.breaches + ' ' + F.plural(S.breaches, 'time') + '.' : S.pol !== 'ifthen' ? 'You published no thresholds, so there was nothing to breach.' : 'You never broke a published commitment to catch up.'),
          principle: 'In a race, each team is tempted to trade safety for speed; more rivals and more information about them can make it worse.',
          history: 'Armstrong, Bostrom and Shulman, Racing to the precipice (FHI technical report 2013; AI and Society 2016).', src: src('racing racingj') })
      ].join('');
      function led(k, v) { return '<div><dt>' + k + '</dt><dd>' + v + '</dd></div>'; }
      var ledger = '<div class="fr-ledg">' +
        '<div class="lk-card"><p class="lk-kicker">Frontier</p><dl>' + led('Rank', rank + ' of 4') + led('You vs top', fi1(you) + ' vs ' + fi1(top)) + led('Gap', fi1(gap)) + '</dl></div>' +
        '<div class="lk-card"><p class="lk-kicker">Value</p><dl>' + led('Fair value', e === 'exit' ? Bn(S.exitV) + ' sale' : Bn(S.FV)) + led('Your side', pct(S.cap.you) + ', ' + Bn(S.cap.you * (e === 'exit' ? S.exitV : S.FV))) + led('Cash, with half of owned book', Bn(cashF)) + '</dl></div>' +
        '<div class="lk-card"><p class="lk-kicker">Record</p><dl>' + led('Posture', POLN[S.pol]) + led('Launches that met the bar', mets + ' of ' + S.launches.length) + led('Breaches', brV) + led('Incidents', S.inc.minor + ' minor · ' + S.inc.serious + ' serious · ' + S.inc.severe + ' severe') + led('Expected incidents', S.Eact.toFixed(2) + ' with your safety work; ' + S.Ezero.toFixed(2) + ' with none') + '</dl></div>' +
        '<div class="lk-card"><p class="lk-kicker">Independence</p><dl>' + led('Skyloft', pct(S.cap.strat)) + led('Keelstone', pct(S.cap.sov)) + led('Charter', govName(S)) + led('Board weekends', S.weekends) + '</dl></div></div>';
      var cfx = [
        ['Your flagship’s shape', fg ? F.x(Math.sqrt(20 / fr), 2) + ' the serving cost of a compute-optimal model of the same compute, for ' + fi1(FI(fg.Cp, 20) - FI(fg.Cp, fr)) + ' FI' : '–'],
        ['Algorithmic multiplier', F.x(S.algo, 1) + ' vs ' + F.x(ind, 0) + ' at the industry’s pace over the same ' + F.plural(nH0, 'half', 'halves')],
        ['Expected incidents', S.Eact.toFixed(2) + ' with your safety work; ' + S.Ezero.toFixed(2) + ' with none. Actual: ' + incN],
        ['Idle serving capacity', Bn(S.idle) + ' of compute that served no one'],
        ['Obligations after ' + afterL, obl > 0 ? Bn(obl) + ', ' + (prem >= 0 ? pct(prem) + ' above' : pct(-prem) + ' below') + ' today’s reserved price' : 'None'],
        ['Thinking mode', th ? 'Last half on (' + hl(th.t) + '): margin ' + pct(th.gm) + ' with it, about ' + pct(th.gmNT) + ' on the same revenue without it, and 5 FI further from the frontier' : 'Never switched on']
      ].map(function (r) { return '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('');
      var journal = '<div class="lk-feed fr-journal" tabindex="0" role="region" aria-label="The journal">' + S.feed.map(lineH).join('') + '</div>';
      var endsLeft = 12 - seen.length;
      K.debrief(E.end, {
        kicker: 'Ending', title: END[e][0], sub: 'World #' + S.seed + ' · ' + seen.length + ' of 12 endings found in this browser',
        lede: END[e][1](S),
        stats: [{ k: 'Frontier', v: fi1(you) + ' vs ' + fi1(top), tone: gap <= 1 ? 'gain' : gap > 8 ? 'loss' : null }, { k: 'Rank', v: rank + ' of 4' },
          { k: 'Fair value', v: Bn(e === 'exit' ? S.exitV : S.FV) }, { k: 'Your stake', v: Bn(S.cap.you * (e === 'exit' ? S.exitV : S.FV)) },
          { k: 'Breaches', v: brV, tone: S.breaches ? 'loss' : S.pol === 'ifthen' ? 'gain' : null }, { k: 'Incidents', v: String(incN), tone: S.inc.severe ? 'loss' : null }],
        sections: [
          { label: span.charAt(0).toUpperCase() + span.slice(1) + ' on one board', html: '<figure class="fr-db-fig" data-ground="forest"><canvas class="fr-db-race lk-chart" aria-hidden="true"></canvas><canvas class="fr-db-money lk-chart" aria-hidden="true"></canvas><figcaption class="fr-help">Top: your deployed Frontier Index in foil against Obelisk, Vesper and Sable (dashed), with the risk levels. Bottom: revenue by line (API in foil, then consumer, then enterprise) and total cost as the solid line with squares, both on the left scale in $B per half; cash is the dashed line, on the right-hand scale. The race table above the desk holds every Frontier Index value, and the journal below holds every report.</figcaption></figure>' },
          { label: 'The final ledger', html: ledger },
          { label: 'Your decisions, and the principle behind each', html: lessons },
          { label: 'What the engine can tell you that the scoreboard cannot', html: '<div class="lk-scroll"><table class="lk-table fr-cfx"><tbody>' + cfx + '</tbody></table></div>' },
          { label: 'The journal', html: journal }
        ],
        principles: ['scaling', 'chinchilla', 'algo', 'research', 'margin', 'pricefall', 'takepay', 'ifthen', 'evals', 'gov', 'open', 'racing'],
        take: true,
        actions: [{ label: 'Replay this world', primary: true, onClick: function () { fresh(S.seed, true); } }, { label: 'New world', onClick: function () { fresh(K.seed() % 1000000, false); } }]
      });
      K.sfill(E.end);
      paintAll();
      if (endsLeft === 0) K.say('You have found all twelve endings.');
    }

    /* ---------- input ---------- */
    K.on(root, 'change', '[data-su]', function (ev, r) { ui.setup[r.getAttribute('data-su')] = r.value; renderSetup(); hallSync(); });
    K.on(root, 'change', '.fr-seed', function (ev, inp) { var v = parseInt(String(inp.value).replace(/\D/g, ''), 10); if (!(v >= 0)) v = 1956; v = v % 1000000000; if (v !== S.seed) { reset(v); save(); } render(); paintAll(); });
    K.on(root, 'change', '[data-openw]', function (ev, c) { ui.ow = c.checked ? +c.getAttribute('data-openw') : null; });
    K.on(root, 'input', '[data-rg]', function (ev, r) {
      var k = r.getAttribute('data-rg'), v = +r.value, o = root.querySelector('#' + r.id + '-o');
      if (k === 'tr' || k === 're' || k === 'sa') {
        ui.flash = null;
        var a = { tr: S.al.tr, re: S.al.re, sa: S.al.sa }, others = a.tr + a.re + a.sa - a[k];
        a[k] = Math.min(v / 100, Math.max(0, 1 - others)); r.value = Math.round(a[k] * 100);
        act({ a: 'alloc', tr: a.tr, re: a.re, sa: a.sa }, true);
        r.value = Math.round(S.al[k] * 100); if (o) o.textContent = pct(S.al[k]);
        r.setAttribute('aria-valuetext', { tr: 'Training', re: 'Research', sa: 'Safety' }[k] + ' ' + Math.round(S.al[k] * 100) + ' percent of compute');
      } else if (k === 'p') {
        act({ a: 'price', p: v }, true); if (o) o.textContent = F.usd(PAPI * S.p, 2) + ' (' + F.x(S.p) + ')'; r.setAttribute('aria-valuetext', F.usd(PAPI * S.p, 2) + ' per million tokens');
      } else if (k === 'lc') {
        ui.lc = v; ui.lcSet = true; var s2 = F.sci(Math.pow(10, v)); if (o) o.textContent = s2 + ' FLOP'; r.setAttribute('aria-valuetext', sciSay(v));
        var rd = root.querySelector('.fr-trd'); if (rd) rd.innerHTML = trainRead();
      }
      K.sfill(r.parentNode);
    });
    K.on(root, 'change', '[data-rg]', function () { save(); renderStrip(); renderPrev(); if (ui.tab === 0) keepFocus(function () { var P = panels[0]; P.querySelector('.fr-alloc').innerHTML = allocInfo(); }); });
    function refocus(fk) { var n = fk && root.querySelector('[data-fk="' + fk + '"]'); if (n && !n.disabled) K.focus(n); }
    K.on(root, 'click', '[data-act]', function (ev, b) {
      if (b.disabled || b.getAttribute('aria-disabled') === 'true') return;
      var A = b.getAttribute('data-act'), r;
      if (/^(card|launch|openw|think|aird|abort)$/.test(A)) ui.opener = b.getAttribute('data-fk');
      switch (A) {
        case 'found': if (ui.setup.gov && ui.setup.pol && ui.setup.open) { act({ a: 'found', gov: ui.setup.gov, pol: ui.setup.pol, open: ui.setup.open }); ui.view = 'card'; paintAll(); K.focus(root.querySelector('#' + id + '-ct'), { scroll: true }); } break;
        case 'roll': reset(K.seed() % 1000000); save(); render(); paintAll(); break;
        case 'begin':
          var su = root.querySelector('#' + id + '-su');
          if (window.PS && PS.scrollTo && su) { PS.scrollTo(su.parentNode); K.focus(su); } else K.focus(su, { scroll: true });
          break;
        case 'card':
          r = act({ a: 'card', i: +b.getAttribute('data-i') });
          if (r && r.gate) { ui.gate = { kind: 'card', i: +b.getAttribute('data-i'), info: r, open: S.card.id === 'shock' }; renderStage(); K.focus(root.querySelector('.fr-gate [data-act="gate-yes"]')); }
          else if (S.ph === 'over') { render(); paintAll(); }
          else K.focus(root.querySelector('[data-fk="opt' + b.getAttribute('data-i') + '"]'));
          break;
        case 'gate-yes':
          var g = ui.gate; ui.gate = null;
          if (g.kind === 'card') act({ a: 'card', i: g.i, force: true });
          else { g.a.force = true; act(g.a); }
          if (S.ph === 'over') { render(); paintAll(); }
          break;
        case 'gate-no': ui.gate = null; render(); refocus(ui.opener); break;
        case 'step':
          var t0 = S.t; ui.flash = null;
          HL.st = true; r = act({ a: 'step' }); HL.st = false;
          if (r !== false && S.t > t0) {
            ui.view = 'report'; render();
            ui.newN = [];
            if (cancelTw) cancelTw(true);
            ui.anim = 0;
            cancelTw = K.tween(600, function (e) { ui.anim = e; if (E.rc.clientWidth) paintRace(E.rc, E.rc.clientWidth < 420 ? 190 : 220, e); }, function () { ui.anim = 1; cancelTw = null; paintAll(); });
            K.focus(root.querySelector('#' + id + '-rt'), { scroll: true });
          }
          break;
        case 'next': ui.view = 'card'; ui.gate = null; render(); K.focus(root.querySelector('#' + id + '-ct'), { scroll: true }); break;
        case 'todb': if (!ui.db) renderEnd(); else { var dt = E.end.querySelector('.lk-debrief .lk-title'); if (dt) K.focus(dt, { scroll: true }); } break;
        case 'read': shelf.notes.open(b.getAttribute('data-note')); break;
        case 'serve':
          /* serving takes what it needs from training and research; safety is left where you put it */
          var p = ui.pre, a0 = S.al, want = 1.05 * (p ? p.need : 0) / Math.max(1, p ? p.K : 1), sv = Math.min(.7, want), room = Math.max(0, 1 - sv - a0.sa), tr0 = a0.tr + a0.re;
          ui.flash = p && p.K < 1 ? 'There is no fleet to serve from this half. Rent spot below, or reserve for next half.' : want > .7 ? 'Serving needs ' + (want > 3 ? 'more than three times the fleet' : pct(want) + ' of the fleet') + '; the button stops at 70%. Rent or reserve more, or ship a leaner model.' : null;
          if (ui.flash) K.say(ui.flash);
          var sc = tr0 > 0 ? room / tr0 : 0;
          act({ a: 'alloc', tr: Math.floor(a0.tr * sc * 100) / 100, re: Math.floor(a0.re * sc * 100) / 100, sa: a0.sa });
          break;
        case 'stp':
          var k = b.getAttribute('data-k'), d = +b.getAttribute('data-d'), bk = baseK();
          if (k === 'spot') act({ a: 'spot', k: clamp(S.spot + d * 5, 0, spotCap(S)) });
          else { var stp = ui[k] >= 200 ? 10 : 5; ui[k] = clamp(ui[k] + d * stp, 5, Math.max(40, Math.round(2 * bk / 5) * 5)); renderPanel(); }
          break;
        case 'reserve': act({ a: 'reserve', k: ui.resK }); break;
        case 'build': act({ a: 'build', k: ui.buildK }); break;
        case 'run': if (act({ a: 'run', lc: Math.round(ui.lc * 100) / 100, r: ui.r }) !== false) { ui.lcSet = false; paintAll(); } break;
        case 'abort': ui.ask = 'abort'; renderPanel(); K.focus(root.querySelector('[data-act="abort-yes"]')); break;
        case 'abort-yes': ui.ask = null; act({ a: 'abort' }); paintAll(); break;
        case 'ask-no': ui.ask = null; renderPanel(); refocus(ui.opener); break;
        case 'launch':
          var la = { a: 'launch', id: +b.getAttribute('data-id'), mode: b.getAttribute('data-mode'), open: ui.ow === +b.getAttribute('data-id') && b.getAttribute('data-mode') !== 'internal' };
          r = act(la);
          if (r && r.gate) { ui.gate = { kind: 'launch', a: la, info: r, open: la.open }; renderPanel(); K.focus(root.querySelector('.fr-gate [data-act="gate-yes"]')); }
          else { ui.ow = null; paintAll(); }
          break;
        case 'openw': ui.ask = { openw: +b.getAttribute('data-id') }; renderPanel(); K.focus(root.querySelector('[data-act="openw-yes"]')); break;
        case 'openw-yes':
          var oa = { a: 'openw', id: ui.ask.openw }; ui.ask = null; r = act(oa);
          if (r && r.gate) { ui.gate = { kind: 'openw', a: oa, info: r, open: true }; renderPanel(); }
          break;
        case 'think':
          var ta = { a: 'think', on: !S.think }; r = act(ta);
          if (r && r.gate) { ui.gate = { kind: 'think', a: ta, info: r }; renderPanel(); } else paintAll();
          break;
        case 'aird':
          var aa = { a: 'aird', on: !S.aird }; r = act(aa);
          if (r && r.gate) { ui.gate = { kind: 'aird', a: aa, info: r }; renderPanel(); }
          break;
        case 'round': ui.round = !ui.round; if (ui.round) { noteQ(S, 'runrate', 'the term sheets'); drain(); renderFeed(); } renderPanel(); break;
        case 'raise': var kd = b.getAttribute('data-k'); act({ a: 'raise', kind: kd, f: kd === 'growth' ? ui.gf : kd === 'strat' ? ui.sf : ui.vf }); break;
        case 'sec': case 'publish': case 'amend': case 'recap': case 'reinc': act({ a: A }); break;
      }
    });
    K.on(root, 'keydown', '.fr-gate', function (ev) {
      if (ev.key !== 'Escape' || (!ui.gate && !ui.ask)) return;
      ev.preventDefault(); ui.gate = null; ui.ask = null; render(); refocus(ui.opener);
    });

    /* ---------- boot: restore the saved run, or open the charter ---------- */
    var sv = ctx.store.get();
    if (sv && sv.v === 1 && Array.isArray(sv.seen)) seen = sv.seen.filter(function (e) { return END[e]; });
    if (sv && sv.v === 1 && Array.isArray(sv.log) && typeof sv.seed === 'number') {
      try { S = replay(sv.seed, sv.log); LOG = sv.log.slice(); } catch (e) { S = null; }
    }
    if (!S) { S = newWorld(sv && typeof sv.seed === 'number' && !sv.log ? sv.seed : 1956); LOG = []; }
    drain(true);
    if (S.ph === 'setup' && S.gov) ui.setup = { gov: S.gov, pol: S.pol, open: S.opening };
    render();
    paintAll();
    if ('IntersectionObserver' in window) {
      HL.hio = new IntersectionObserver(function (es) { if (es[es.length - 1].isIntersecting) { HL.hio.disconnect(); hallInit(); } }, { rootMargin: '600px 0px' });
      HL.hio.observe(E.hall);
    } else hallInit();

    HOOK.state = function () { return S; };
    HOOK.hall = function () { hallInit(); return HL; };
    HOOK.open = function (i) { var t = root.querySelector('#' + id + '-t' + i); if (t) t.click(); };
    HOOK.play = function (a) { return act(a); };
    return {
      pause: function () { if (cancelTw) { cancelTw(true); cancelTw = null; } ui.anim = 1; if (HL.X) HL.X.vw.pause(); },
      resume: function () { paintAll(); if (HL.X) HL.X.vw.resume(); },
      destroy: function () { dead = true; if (cancelTw) cancelTw(); if (HL.hio) HL.hio.disconnect(); if (HL.io) HL.io.disconnect(); document.removeEventListener('visibilitychange', hallFlush); if (HL.X) HL.X.destroy(); }
    };
  }

  /* a headless run for QA: policy(S, apply) sets the desk each half; unanswered cards take their first open option */
  function sim(seed, setup, policy) {
    var S = newWorld(seed);
    apply(S, { a: 'found', gov: setup.gov, pol: setup.pol, open: setup.open });
    while (S.ph === 'play') {
      if (policy) policy(S, apply);
      if (S.card.pick < 0) for (var i = 0; i < CARDS[S.card.id].opts.length && S.card.pick < 0; i++) { var r = apply(S, { a: 'card', i: i }); if (r && r.gate) apply(S, { a: 'card', i: i, force: true }); }
      if (S.ph !== 'play') break;
      apply(S, { a: 'step' });
    }
    return S;
  }

  var HOOK = { sim: sim, FI: FI, apply: apply, newWorld: newWorld, dryClone: dryClone, step: step, endingOf: endingOf };
  K.hook(SLUG, HOOK);
  K.mount(SLUG, null, init);
})();
