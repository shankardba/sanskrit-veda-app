// Sanskrit ↔ Slavic page (slavic.html): the closeness ranking, the cognate
// explorer, and the grammar cards' cross-links. Pattern-first by design —
// each word exists as evidence for a sound pattern, and each pattern links to
// the grammar cards where the same correspondence shows up again.

const LANGS = [
  { id: 'sc', name: 'Serbian / Croatian', short: 'Serb./Croat.' },
  { id: 'cs', name: 'Czech', short: 'Czech' },
  { id: 'pl', name: 'Polish', short: 'Polish' },
  { id: 'uk', name: 'Ukrainian', short: 'Ukrainian', cyrillic: true },
  { id: 'sl', name: 'Slovene', short: 'Slovene' },
  { id: 'bg', name: 'Bulgarian', short: 'Bulgarian', cyrillic: true },
  { id: 'ru', name: 'Russian', short: 'Russian', cyrillic: true },
  { id: 'cu', name: 'Old Church Slavonic', short: 'OCS', reference: true },
];

// Inherited features (scored) and look-alikes rebuilt independently (shown,
// not scored). Values: 1 kept, 0.5 partial/relic, 0 lost, null unknown.
const FEATURES = [
  { id: 'cases', label: 'Case system', skt: 'Sanskrit: 8 cases' },
  { id: 'voc', label: 'Vocative', skt: 'Sanskrit: deva!' },
  { id: 'dual', label: 'Dual', skt: 'Sanskrit: full dual' },
  { id: 'aorist', label: 'Aorist', skt: 'Sanskrit: s-aorist' },
  { id: 'clitics', label: '2nd-place clitics', skt: 'Vedic: enclitic me, te' },
  { id: 'm1sg', label: '-m on all verbs', skt: 'Sanskrit: -mi (bhavāmi)', convergent: true },
  { id: 'sylr', label: 'r as a vowel', skt: 'Sanskrit: ṛ', convergent: true },
  { id: 'pitch', label: 'Pitch accent', skt: 'Vedic: udātta / svarita', convergent: true },
];

const SCORES = {
  sc: {
    cases: [1, '7 cases, locative and instrumental included'],
    voc: [1, 'Alive: Bože! brate!'],
    dual: [0.5, 'Relics: -ama/-ima endings, dva stola'],
    aorist: [0.5, 'Literary and southern/eastern speech: rekoh "I said"'],
    clitics: [1, 'Strict second position: Brat mi je dao knjigu'],
    m1sg: [1, 'Every verb: znam, pišem'],
    sylr: [1, 'srce, krv, mrtav'],
    pitch: [1, 'Rising and falling pitch accents'],
  },
  cs: {
    cases: [1, '7 cases'],
    voc: [1, 'Alive: Petře! bratře!'],
    dual: [0.5, 'Relics: očima, rukama'],
    aorist: [0, 'Lost'],
    clitics: [1, 'Second position: Dal jsem mu ho'],
    m1sg: [0.5, 'Partly: znám, dělám, but píšu'],
    sylr: [1, 'vlk, prst, plný'],
    pitch: [0, 'No: fixed first-syllable stress'],
  },
  pl: {
    cases: [1, '7 cases'],
    voc: [1, 'Alive: Boże! bracie!'],
    dual: [0.5, 'Relics: oczyma, rękoma'],
    aorist: [0, 'Lost'],
    clitics: [0.5, 'Partly: mobile się and person endings'],
    m1sg: [0.5, 'Partly: znam, czytam, but piszę'],
    sylr: [0, 'No'],
    pitch: [0, 'No: fixed next-to-last stress'],
  },
  uk: {
    cases: [1, '7 cases'],
    voc: [1, 'Alive: Боже! брате!'],
    dual: [0.5, 'Relics after 2–4'],
    aorist: [0, 'Lost'],
    clitics: [0.5, 'Weak: particles ж, би'],
    m1sg: [0, 'No: знаю'],
    sylr: [0, 'No'],
    pitch: [0, 'No: free stress'],
  },
  sl: {
    cases: [1, '6 cases, locative and instrumental included'],
    voc: [0, 'Lost'],
    dual: [1, 'Full dual: midva sva "we two are"'],
    aorist: [0, 'Lost'],
    clitics: [1, 'Second position'],
    m1sg: [1, 'Every verb: znam, pišem'],
    sylr: [0.5, 'Partly: r with a light vowel (prst)'],
    pitch: [0.5, 'Tonal in some varieties'],
  },
  bg: {
    cases: [0, 'Lost noun cases (pronouns keep them)'],
    voc: [1, 'Alive: Иване! Боже!'],
    dual: [0.5, 'Relic: count form два стола'],
    aorist: [1, 'Fully alive, with the imperfect: казах'],
    clitics: [0.5, 'Clitics attach to the verb instead'],
    m1sg: [0.5, 'Partly: знам, имам, but пиша'],
    sylr: [0, 'No: a full vowel (вълк)'],
    pitch: [0, 'No: free stress'],
  },
  ru: {
    cases: [1, '6 cases, locative and instrumental included'],
    voc: [0, 'Lost (Боже, Господи are fossils)'],
    dual: [0.5, 'Relic: два стола'],
    aorist: [0, 'Lost'],
    clitics: [0.5, 'Weak: particles ли, же only'],
    m1sg: [0, 'No: знаю (fossils ем, дам)'],
    sylr: [0, 'No'],
    pitch: [0, 'No: free stress'],
  },
  cu: {
    cases: [1, '7 cases'],
    voc: [1, 'Alive'],
    dual: [1, 'Full dual'],
    aorist: [1, 'Aorist and imperfect'],
    clitics: [1, 'Enclitics mi, ti, že, li'],
    m1sg: [0, 'Only jesmь, damь, jamь, věmь, as in PIE'],
    sylr: [null, 'Uncertain from the spelling'],
    pitch: [null, 'Unknown'],
  },
};

const PATTERNS = [
  {
    id: 'eo', label: 'a ↔ e / o', name: 'The vowel test', kind: 'proof',
    formula: 'Sanskrit a ↔ Slavic e or o',
    text: 'Proto-Indo-European had e, o and a. Sanskrit merged all three into a; Slavic kept e and o apart, correctly, word by word. A daughter can\'t un-merge its parent\'s vowels, so this pattern is the proof that Slavic isn\'t descended from Sanskrit. Sanskrit still carries a fossil of the lost e: the c of catvāraḥ "four" is a k that softened before an e that later turned into a.',
    grammar: ['g-case', 'g-causative', 'g-small'],
  },
  {
    id: 'satem', label: 'ś, j ↔ s, z', name: 'Satem', kind: 'shared',
    formula: 'Sanskrit ś, j ↔ Slavic s, z',
    text: 'PIE\'s palatal k and g became hissing sounds in both families (the "satem" change, named for Avestan satəm "hundred"). Latin kept them hard: decem, (g)nōscō. Baltic, Armenian and Albanian share it too, so it marks a neighbourhood inside PIE, not descent.',
    grammar: ['g-m1sg'],
  },
  {
    id: 'aspirate', label: 'bh, dh ↔ b, d', name: 'Breathy stops', kind: 'inherited',
    formula: 'Sanskrit bh, dh, gh ↔ Slavic b, d, g',
    text: 'Sanskrit kept PIE\'s breathy stops; Slavic merged them into plain b, d, g. Here Sanskrit is the conservative side, the reverse of the vowel test. That is exactly what cousins look like: each keeps something the other lost.',
    grammar: ['g-be', 'g-causative'],
  },
  {
    id: 'longu', label: 'ū ↔ y', name: 'Long ū', kind: 'inherited',
    formula: 'Sanskrit ū ↔ Slavic y (Russian ы)',
    text: 'Sanskrit long ū regularly appears as Slavic y: Russian ы, Czech and Polish y. Serbian, Croatian, Slovene and Bulgarian later merged that y into i, which is why sūnu is syn in Russian but sin in Serbian.',
    grammar: ['g-be'],
  },
  {
    id: 'ruki', label: 'ṣ ↔ x', name: 'RUKI', kind: 'shared',
    formula: 'after r, u, k, i: Sanskrit ṣ ↔ Slavic x (ch)',
    text: 'After r, u, k or i, PIE s shifted in both families: to ṣ in Sanskrit, to x (the "ch" of Bach) in Slavic. It\'s the closest thing to a private Sanskrit–Slavic sound law. The different outcomes suggest a shared tendency that each side finished on its own.',
    grammar: ['g-case', 'g-aorist'],
  },
  {
    id: 'syllabic', label: 'ṛ ↔ r̥, l̥', name: 'r and l as vowels', kind: 'convergent',
    formula: 'Sanskrit ṛ ↔ Slavic vowel + r/l, or r/l as a vowel again',
    text: 'PIE had r and l acting as vowels, and Sanskrit kept ṛ (vṛka, mṛta). Slavic first broke them into vowel + r/l. Later Serbian/Croatian, Czech and Slovak collapsed them back into syllabic r and l, so Czech vlk and Serbian mrtav look like Sanskrit again, by a second, independent route.',
    grammar: ['g-participle'],
  },
  {
    id: 'palatal', label: 'c, j ↔ č, ž', name: 'Softening', kind: 'convergent',
    formula: 'Sanskrit c, j ↔ Slavic č, ž',
    text: 'Both families softened k and g before front vowels (Sanskrit\'s "law of palatals", Slavic\'s "first palatalization"), independently and centuries apart. Same instinct, separate events. The Slavic vocative vuče! "O wolf!" shows it happening inside a single word.',
    grammar: ['g-case'],
  },
];

const KIND_LABEL = {
  proof: 'The proof', inherited: 'Inherited', shared: 'Shared change',
  convergent: 'Rebuilt independently',
};

// Cyrillic-script forms are [cyrillic, romanization].
const WORDS = [
  { gloss: 'brother', deva: 'भ्रातृ', iast: 'bhrātṛ', pie: '*bʰréh₂tēr', pat: { aspirate: 'bh → b' },
    f: { cu: 'bratrъ', sc: 'brat', sl: 'brat', cs: 'bratr', pl: 'brat', bg: ['брат', 'brat'], uk: ['брат', 'brat'], ru: ['брат', 'brat'] } },
  { gloss: 'sister', deva: 'स्वसृ', iast: 'svasṛ', pie: '*swésōr', pat: { eo: 'a → e' },
    f: { cu: 'sestra', sc: 'sestra', sl: 'sestra', cs: 'sestra', pl: 'siostra', bg: ['сестра', 'sestra'], uk: ['сестра', 'sestra'], ru: ['сестра', 'sestra'] } },
  { gloss: 'is', deva: 'अस्ति', iast: 'asti', pie: '*h₁ésti', pat: { eo: 'a → e' },
    f: { cu: 'jestъ', sc: 'je / jest', sl: 'je', cs: 'je / jest', pl: 'jest', bg: ['е', 'e'], uk: ['є', 'je'], ru: ['есть', 'jest’'] } },
  { gloss: 'night', deva: 'नक्त', iast: 'nakta', pie: '*nókʷts', pat: { eo: 'a → o' },
    f: { cu: 'noštь', sc: 'noć', sl: 'noč', cs: 'noc', pl: 'noc', bg: ['нощ', 'nošt'], uk: ['ніч', 'nič'], ru: ['ночь', 'noč’'] } },
  { gloss: 'eye', deva: 'अक्षि', iast: 'akṣi', pie: '*h₃ókʷ-', pat: { eo: 'a → o' },
    f: { cu: 'oko', sc: 'oko', sl: 'oko', cs: 'oko', pl: 'oko', bg: ['око', 'oko'], uk: ['око', 'oko'], ru: ['око', 'oko'] },
    note: 'Russian око is poetic; the everyday word is глаз.' },
  { gloss: 'ten', deva: 'दश', iast: 'daśa', pie: '*déḱm̥', pat: { satem: 'ś → s', eo: 'a → e' },
    f: { cu: 'desętь', sc: 'deset', sl: 'deset', cs: 'deset', pl: 'dziesięć', bg: ['десет', 'deset'], uk: ['десять', 'desjat’'], ru: ['десять', 'desjat’'] } },
  { gloss: 'four', deva: 'चत्वारः', iast: 'catvāraḥ', pie: '*kʷetwóres', pat: { palatal: 'c → č', eo: 'a → e' },
    f: { cu: 'četyre', sc: 'četiri', sl: 'štiri', cs: 'čtyři', pl: 'cztery', bg: ['четири', 'četiri'], uk: ['чотири', 'čotyry'], ru: ['четыре', 'četyre'] } },
  { gloss: 'light, world', deva: 'श्वेत', iast: 'śveta', pie: '*ḱweyt-', pat: { satem: 'ś → s' },
    f: { cu: 'světъ', sc: 'svijet', sl: 'svet', cs: 'svět', pl: 'świat', bg: ['свят', 'svjat'], uk: ['світ', 'svit'], ru: ['свет', 'svet'] },
    note: 'Sanskrit śveta means "white". In Slavic the same root came to mean both "light" and "world".' },
  { gloss: 'I know', deva: 'जानामि', iast: 'jānāmi', pie: '*ǵneh₃-', pat: { satem: 'j → z' },
    f: { cu: 'znajǫ', sc: 'znam', sl: 'znam', cs: 'znám', pl: 'znam', bg: ['знам', 'znam'], uk: ['знаю', 'znaju'], ru: ['знаю', 'znaju'] },
    note: 'The final -m matches Sanskrit -mi in some languages but not others. See "Every verb ending in -m" in Grammar.' },
  { gloss: 'son', deva: 'सूनु', iast: 'sūnu', pie: '*suHnús', pat: { longu: 'ū → y' },
    f: { cu: 'synъ', sc: 'sin', sl: 'sin', cs: 'syn', pl: 'syn', bg: ['син', 'sin'], uk: ['син', 'syn'], ru: ['сын', 'syn'] } },
  { gloss: 'smoke', deva: 'धूम', iast: 'dhūma', pie: '*dʰuh₂mós', pat: { aspirate: 'dh → d', longu: 'ū → y' },
    f: { cu: 'dymъ', sc: 'dim', sl: 'dim', cs: 'dým', pl: 'dym', bg: ['дим', 'dim'], uk: ['дим', 'dym'], ru: ['дым', 'dym'] } },
  { gloss: 'wake someone', deva: 'बोधयति', iast: 'bodhayati', pie: '*bʰowdʰéyeti', pat: { aspirate: 'bh, dh → b, d' },
    f: { cu: 'buditi', sc: 'buditi', sl: 'buditi', cs: 'budit', pl: 'budzić', bg: ['будя', 'budja'], uk: ['будити', 'budyty'], ru: ['будить', 'budit’'] },
    note: 'Same root as Buddha, "the awakened one".' },
  { gloss: 'widow', deva: 'विधवा', iast: 'vidhavā', pie: '*h₁widʰéwh₂', pat: { aspirate: 'dh → d' },
    f: { cu: 'vьdova', sc: 'udovica', sl: 'vdova', cs: 'vdova', pl: 'wdowa', bg: ['вдовица', 'vdovica'], uk: ['вдова', 'vdova'], ru: ['вдова', 'vdova'] } },
  { gloss: 'share → god', deva: 'भग', iast: 'bhaga', pie: '*bʰeh₂g-', pat: { aspirate: 'bh → b' },
    f: { cu: 'bogъ', sc: 'bog', sl: 'bog', cs: 'bůh', pl: 'bóg', bg: ['бог', 'bog'], uk: ['бог', 'boh'], ru: ['бог', 'bog'] },
    note: 'The word is inherited, but its meaning "god" came from Scythian neighbours. See Borrowed.' },
  { gloss: 'dry', deva: 'शुष्क', iast: 'śuṣka', pie: '*h₂sews-', pat: { ruki: 'ṣ → x' },
    f: { cu: 'suxъ', sc: 'suh', sl: 'suh', cs: 'suchý', pl: 'suchy', bg: ['сух', 'suh'], uk: ['сухий', 'suxyj'], ru: ['сухой', 'suxoj'] } },
  { gloss: 'alive', deva: 'जीव', iast: 'jīva', pie: '*gʷih₃wós', pat: { palatal: 'j → ž' },
    f: { cu: 'živъ', sc: 'živ', sl: 'živ', cs: 'živý', pl: 'żywy', bg: ['жив', 'živ'], uk: ['живий', 'žyvyj'], ru: ['живой', 'živoj'] } },
  { gloss: 'wolf', deva: 'वृक', iast: 'vṛka', pie: '*wĺ̥kʷos', pat: { syllabic: 'ṛ ↔ l̥' },
    f: { cu: 'vlьkъ', sc: 'vuk', sl: 'volk', cs: 'vlk', pl: 'wilk', bg: ['вълк', 'vălk'], uk: ['вовк', 'vovk'], ru: ['волк', 'volk'] } },
  { gloss: 'dead', deva: 'मृत', iast: 'mṛta', pie: '*mr̥tós', pat: { syllabic: 'ṛ ↔ r̥' },
    f: { cu: 'mrьtvъ', sc: 'mrtav', sl: 'mrtev', cs: 'mrtvý', pl: 'martwy', bg: ['мъртъв', 'mărtăv'], uk: ['мертвий', 'mertvyj'], ru: ['мёртвый', 'mjórtvyj'] } },
  { gloss: 'full', deva: 'पूर्ण', iast: 'pūrṇa', pie: '*pl̥h₁nós', pat: { syllabic: 'ūr ↔ l̥' },
    f: { cu: 'plьnъ', sc: 'pun', sl: 'poln', cs: 'plný', pl: 'pełny', bg: ['пълен', 'pălen'], uk: ['повний', 'povnyj'], ru: ['полный', 'polnyj'] } },
  { gloss: 'two', deva: 'द्व', iast: 'dva', pie: '*dwóh₁', pat: {},
    f: { cu: 'dъva', sc: 'dva', sl: 'dva', cs: 'dva', pl: 'dwa', bg: ['два', 'dva'], uk: ['два', 'dva'], ru: ['два', 'dva'] },
    note: 'Practically unchanged on both sides.' },
  { gloss: 'mother', deva: 'मातृ', iast: 'mātṛ', pie: '*méh₂tēr', pat: {},
    f: { cu: 'mati', sc: 'mati · majka', sl: 'mati · mama', cs: 'máti · matka', pl: 'matka', bg: ['майка', 'majka'], uk: ['мати', 'maty'], ru: ['мать', 'mat’'] },
    note: 'The -r- of mātṛ survives in Russian матери "of the mother".' },
];

const state = { lang: 'sc', pattern: 'all', open: null };

const langById = Object.fromEntries(LANGS.map(l => [l.id, l]));
const patternById = Object.fromEntries(PATTERNS.map(p => [p.id, p]));

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function score(langId) {
  return FEATURES.filter(f => !f.convergent)
    .reduce((sum, f) => sum + (SCORES[langId][f.id][0] || 0), 0);
}

function dot(value, convergent, note) {
  const cls = value === null ? 'is-unknown' : value === 1 ? 'is-full' : value === 0.5 ? 'is-half' : 'is-none';
  const d = el('span', `sl-dot ${cls}${convergent ? ' is-conv' : ''}`);
  d.title = note;
  d.setAttribute('aria-label', note);
  return d;
}

function renderRanking() {
  const table = document.getElementById('slRank');
  table.textContent = '';
  const inheritedCount = FEATURES.filter(f => !f.convergent).length;

  const thead = el('thead');
  const hr = el('tr');
  hr.appendChild(el('th', 'sl-rank-lang', 'Language'));
  hr.appendChild(el('th', 'sl-rank-score', 'Kept'));
  FEATURES.forEach(f => {
    const th = el('th', f.convergent ? 'is-conv-col' : '', f.label);
    th.title = f.skt;
    hr.appendChild(th);
  });
  thead.appendChild(hr);
  table.appendChild(thead);

  const tbody = el('tbody');
  const ordered = [...LANGS].sort((a, b) =>
    (!!a.reference - !!b.reference) || (score(b.id) - score(a.id)));
  ordered.forEach(lang => {
    const tr = el('tr', `${lang.reference ? 'is-reference' : ''}${lang.id === state.lang ? ' is-selected' : ''}`);
    tr.tabIndex = 0;
    tr.dataset.lang = lang.id;

    const nameCell = el('td', 'sl-rank-lang');
    nameCell.appendChild(el('span', 'sl-rank-name', lang.name));
    if (lang.reference) nameCell.appendChild(el('span', 'sl-rank-tag', 'oldest written, for reference'));
    tr.appendChild(nameCell);

    const s = score(lang.id);
    const scoreCell = el('td', 'sl-rank-score');
    const bar = el('span', 'sl-bar');
    const fill = el('span', 'sl-bar-fill');
    fill.style.width = `${(s / inheritedCount) * 100}%`;
    bar.appendChild(fill);
    scoreCell.appendChild(bar);
    scoreCell.appendChild(el('span', 'sl-bar-num', `${s} / ${inheritedCount}`));
    tr.appendChild(scoreCell);

    FEATURES.forEach(f => {
      const [value, note] = SCORES[lang.id][f.id];
      const td = el('td', f.convergent ? 'is-conv-col' : '');
      td.appendChild(dot(value, f.convergent, `${lang.name} — ${f.label}: ${note}`));
      tr.appendChild(td);
    });

    tr.addEventListener('click', () => setLang(lang.id));
    tr.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLang(lang.id); }
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}

function chip(label, active, onClick, extraCls) {
  const b = el('button', `sl-chip${active ? ' active' : ''}${extraCls ? ' ' + extraCls : ''}`, label);
  b.type = 'button';
  b.setAttribute('aria-pressed', active ? 'true' : 'false');
  b.addEventListener('click', onClick);
  return b;
}

function renderChips() {
  const langWrap = document.getElementById('slLangChips');
  langWrap.textContent = '';
  LANGS.forEach(l => langWrap.appendChild(chip(l.short, l.id === state.lang, () => setLang(l.id))));

  const patWrap = document.getElementById('slPatternChips');
  patWrap.textContent = '';
  patWrap.appendChild(chip('All words', state.pattern === 'all', () => setPattern('all')));
  PATTERNS.forEach(p => patWrap.appendChild(
    chip(p.label, p.id === state.pattern, () => setPattern(p.id), `kind-${p.kind}`)));
}

function renderPatternPanel() {
  const panel = document.getElementById('slPatternPanel');
  panel.textContent = '';
  if (state.pattern === 'all') {
    panel.classList.add('is-empty');
    panel.appendChild(el('p', 'sl-panel-hint',
      `${WORDS.length} Sanskrit words and their ${langById[state.lang].name} cousins. Choose a pattern above to see which words carry it and why.`));
    return;
  }
  panel.classList.remove('is-empty');
  const p = patternById[state.pattern];
  const head = el('div', 'sl-panel-head');
  head.appendChild(el('span', `sl-kind kind-${p.kind}`, KIND_LABEL[p.kind]));
  head.appendChild(el('h3', 'sl-panel-title', p.name));
  panel.appendChild(head);
  panel.appendChild(el('div', 'formula', p.formula));
  panel.appendChild(el('p', 'sl-panel-text', p.text));

  const count = WORDS.filter(w => w.pat[p.id]).length;
  const foot = el('div', 'sl-gfoot');
  foot.appendChild(el('span', null, `${count} word${count === 1 ? '' : 's'} below · In the grammar`));
  const links = el('span', 'sl-plinks');
  p.grammar.forEach(gid => {
    const card = document.getElementById(gid);
    const a = el('a', 'sl-link', card ? card.querySelector('h3').textContent : gid);
    a.href = `#${gid}`;
    links.appendChild(a);
  });
  foot.appendChild(links);
  panel.appendChild(foot);
}

function formNode(langId, form, big) {
  const wrap = el('span', `sl-form${big ? ' is-big' : ''}`);
  if (Array.isArray(form)) {
    wrap.appendChild(el('span', 'sl-form-main', form[0]));
    wrap.appendChild(el('span', 'sl-form-rom', form[1]));
  } else {
    wrap.appendChild(el('span', 'sl-form-main', form));
  }
  return wrap;
}

function renderWords() {
  const grid = document.getElementById('slWordGrid');
  grid.textContent = '';
  WORDS.forEach((w, i) => {
    const matches = state.pattern === 'all' || !!w.pat[state.pattern];
    const card = el('button', `sl-word${matches ? '' : ' is-dim'}${state.open === i ? ' is-open' : ''}`);
    card.type = 'button';
    card.setAttribute('aria-expanded', state.open === i ? 'true' : 'false');

    card.appendChild(el('span', 'sl-word-gloss', w.gloss));
    const pair = el('span', 'sl-word-pair');
    const skt = el('span', 'sl-word-skt');
    skt.appendChild(el('span', 'sl-word-deva', w.deva));
    skt.appendChild(el('span', 'sl-word-iast', w.iast));
    pair.appendChild(skt);
    pair.appendChild(el('span', 'sl-word-arrow', '↔'));
    pair.appendChild(formNode(state.lang, w.f[state.lang], true));
    card.appendChild(pair);

    const corr = el('span', 'sl-word-corr');
    Object.entries(w.pat).forEach(([pid, text]) => {
      corr.appendChild(el('span', `sl-corr kind-${patternById[pid].kind}${pid === state.pattern ? ' active' : ''}`, text));
    });
    corr.appendChild(el('span', 'sl-word-pie', w.pie));
    card.appendChild(corr);

    if (state.open === i) {
      const all = el('span', 'sl-word-all');
      LANGS.forEach(l => {
        const row = el('span', `sl-all-row${l.id === state.lang ? ' is-selected' : ''}`);
        row.appendChild(el('span', 'sl-all-lang', l.short));
        row.appendChild(formNode(l.id, w.f[l.id], false));
        all.appendChild(row);
      });
      card.appendChild(all);
    }
    if (w.note && (state.open === i)) card.appendChild(el('span', 'sl-word-note', w.note));

    card.addEventListener('click', () => {
      state.open = state.open === i ? null : i;
      renderWords();
    });
    grid.appendChild(card);
  });
}

function renderGrammarLinks() {
  document.querySelectorAll('.sl-gcard').forEach(card => {
    const langs = (card.dataset.langs || '').split(',').filter(Boolean);
    card.classList.toggle('is-lang-match', langs.includes(state.lang));
    const llinks = card.querySelector('.sl-llinks');
    if (llinks) {
      llinks.textContent = '';
      const all = langs.length === LANGS.length;
      if (all) {
        llinks.appendChild(el('span', 'sl-lchip active', 'every Slavic language'));
      } else {
        langs.forEach(id => llinks.appendChild(
          el('span', `sl-lchip${id === state.lang ? ' active' : ''}`, langById[id].short)));
      }
    }
    card.querySelectorAll('.sl-plinks[data-patterns]').forEach(span => {
      span.textContent = '';
      span.dataset.patterns.split(',').forEach(pid => {
        const p = patternById[pid];
        const b = chip(p.label, pid === state.pattern, () => {
          setPattern(pid);
          document.getElementById('explorer').scrollIntoView({ behavior: 'smooth' });
        }, `kind-${p.kind} is-small`);
        span.appendChild(b);
      });
    });
  });
}

function setLang(id) {
  state.lang = id;
  try { localStorage.setItem('vedavani-slavic-lang', id); } catch (e) { /* storage unavailable */ }
  render();
}

function setPattern(id) {
  state.pattern = id;
  state.open = null;
  render();
}

function render() {
  renderRanking();
  renderChips();
  renderPatternPanel();
  renderWords();
  renderGrammarLinks();
}

try {
  const saved = localStorage.getItem('vedavani-slavic-lang');
  if (saved && langById[saved]) state.lang = saved;
} catch (e) { /* storage unavailable */ }

render();
