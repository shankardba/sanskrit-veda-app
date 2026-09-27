// Sound-Law Machine (sound-laws.html): one Proto-Indo-European word, two
// ordered rulebooks. Each sound law is a context-sensitive string-rewrite
// rule; running a branch's list in order turns the ancestor into that
// branch's word. The same pattern ids as slavic.html's cognate explorer.
//
// Words are tokenized into single internal characters so every rule is a
// plain regex over one symbol per sound. DISPLAY maps them back.

const DISPLAY = {
  K: 'ḱ', G: 'ǵ', Z: 'ǵʰ', Q: 'kʷ', W: 'gʷ', X: 'gʷʰ',
  B: 'bʰ', D: 'dʰ', J: 'gʰ', 1: 'h₁', 2: 'h₂', 3: 'h₃', H: 'H',
  L: 'l̥', R: 'r̥', M: 'm̥', N: 'n̥', Y: 'y',
  // Sanskrit aspirates, once the "breathy stops kept" rule has fired
  'ƀ': 'bh', 'đ': 'dh', 'ǥ': 'gh',
};

const VOWELS = 'aeiouāēīōūṛLRMNъьěYę';
const V = `[${VOWELS}]`;
const C = `[^${VOWELS}]`;

function tokenize(raw) {
  let s = raw.trim().replace(/^\*/, '').replace(/[-*\s]/g, '');
  s = s.replace(/[A-GI-Z]/g, c => c.toLowerCase());
  s = s.normalize('NFD')
    .replace(/ǵʰ/g, 'Z').replace(/ḱ/g, 'K').replace(/ǵ/g, 'G')
    .replace(/[̀́]/g, '')
    .normalize('NFC');
  return s
    .replace(/gʷʰ/g, 'X').replace(/kʷ/g, 'Q').replace(/gʷ/g, 'W')
    .replace(/bʰ/g, 'B').replace(/dʰ/g, 'D').replace(/gʰ/g, 'J')
    .replace(/h₁|h1/g, '1').replace(/h₂|h2/g, '2').replace(/h₃|h3/g, '3')
    .replace(/l̥/g, 'L').replace(/r̥/g, 'R')
    .replace(/m̥/g, 'M').replace(/n̥/g, 'N')
    .replace(/i̯/g, 'y').replace(/u̯/g, 'w');
}

function display(s) {
  return [...s].map(ch => DISPLAY[ch] ?? ch).join('');
}

const re = (src, flags = 'g') => new RegExp(src, flags);

// Shared first step: laryngeals color a neighbouring e and lengthen the
// vowel before them, then disappear.
function laryngeals(s, branch) {
  s = s.replace(/2e/g, 'a').replace(/3e/g, 'o').replace(/1e/g, 'e')
    .replace(/e2/g, 'ā').replace(/e3/g, 'ō').replace(/e1/g, 'ē')
    .replace(/[oa][123H]/g, m => (m[0] === 'o' ? 'ō' : 'ā'))
    .replace(/i[123H]/g, 'ī').replace(/u[123H]/g, 'ū');
  if (branch === 'skt') {
    s = s.replace(re(`([pbmwB]?)([LR])[123H](?=${C}|$)`), (m, lab) => `${lab}${lab ? 'ūr' : 'īr'}`)
      .replace(re(`(${C})[123H](?=${C})`), '$1i');
  }
  return s.replace(/[123H]/g, '');
}

const SANSKRIT_RULES = [
  { id: 'lar', name: 'Laryngeals', pattern: null,
    desc: 'The three PIE "laryngeal" sounds color a neighbouring e (h₂e → a, h₃e → o), lengthen a vowel before them (eh₂ → ā, uH → ū, ih₃ → ī), then vanish. Sanskrit turns r̥/l̥ + laryngeal into īr, or ūr after a lip sound.',
    apply: s => laryngeals(s, 'skt') },
  { id: 'satem', name: 'Satem', pattern: 'satem',
    desc: 'Palatal ḱ, ǵ, ǵʰ become ś, j, h.',
    apply: s => s.replace(/K/g, 'ś').replace(/G/g, 'j').replace(/Z/g, 'h') },
  { id: 'labio', name: 'Labiovelars unround', pattern: null,
    desc: 'kʷ, gʷ, gʷʰ lose their lip-rounding: k, g, gh.',
    apply: s => s.replace(/Q/g, 'k').replace(/W/g, 'g').replace(/X/g, 'ǥ') },
  { id: 'asp', name: 'Breathy stops kept', pattern: 'aspirate',
    desc: 'bʰ, dʰ, gʰ survive as Sanskrit bh, dh, gh. Slavic loses the breath; Sanskrit keeps it.',
    apply: s => s.replace(/B/g, 'ƀ').replace(/D/g, 'đ').replace(/J/g, 'ǥ') },
  { id: 'palatal', name: 'Law of Palatals', pattern: 'palatal',
    desc: 'k and g soften to c and j before a front vowel (e, i). It has to fire now, while e still exists: two rules later every e turns into a.',
    apply: s => s.replace(/k(?=[eēiīy])/g, 'c').replace(/g(?=[eēiīy])/g, 'j') },
  { id: 'syll', name: 'Syllabic r̥, l̥', pattern: 'syllabic',
    desc: 'r̥ and l̥ merge as the vowel ṛ. Syllabic m̥, n̥ become a.',
    apply: s => s.replace(/[LR]/g, 'ṛ').replace(/[MN]/g, 'a') },
  { id: 'brugmann', name: "Brugmann's law", pattern: 'eo',
    desc: 'o in an open syllable (one consonant, then a vowel) lengthens to ā. It explains vāhayati, but it is debated: *h₂ówis "sheep" gives Sanskrit avi-, not āvi-.',
    apply: s => s.replace(re(`o(?=${C}${V})`), 'ō') },
  { id: 'merge', name: 'The vowel merger', pattern: 'eo',
    desc: 'e and o collapse into a (ē, ō into ā). This is the merger Slavic never went through.',
    apply: s => s.replace(/[eo]/g, 'a').replace(/[ēō]/g, 'ā') },
  { id: 'ruki', name: 'RUKI', pattern: 'ruki',
    desc: 's becomes ṣ after r, u, k or i (and y), but not at the very end of a word.',
    apply: s => s.replace(/(?<=[rṛuūkiīy])s(?!$)/g, 'ṣ') },
  { id: 'mono', name: 'New e and o', pattern: 'eo',
    desc: 'The diphthongs ay, aw shrink to e, o before a consonant or at the end. So Sanskrit e and o are new vowels, rebuilt from diphthongs after the old e and o were gone.',
    apply: s => s.replace(re(`ay(?=${C}|$)`), 'e').replace(re(`aw(?=${C}|$)`), 'o') },
  { id: 'wv', name: 'w becomes v', pattern: null,
    desc: 'w shifts to v.',
    apply: s => s.replace(/w/g, 'v') },
  { id: 'grassmann', name: "Grassmann's law", pattern: 'aspirate',
    desc: 'Two breathy stops close together can\'t both keep their breath: the first loses it (bh…dh → b…dh).',
    apply: s => s.replace(/[ƀđǥ](?=[^ƀđǥ]*[ƀđǥ])/g, m => ({ 'ƀ': 'b', 'đ': 'd', 'ǥ': 'g' })[m]) },
  { id: 'nati', name: 'n after r → ṇ', pattern: null,
    desc: 'n becomes retroflex ṇ after r, ṛ or ṣ (the same rule sandhi applies between words).',
    apply: s => s.replace(/([rṛṣ][^tdnsścjṭḍ]*?)n(?=[aeiouāīūṛ])/g, '$1ṇ') },
  { id: 'final', name: 'Word end', pattern: null,
    desc: 'At the end of a word, s becomes the visarga ḥ and d hardens to t.',
    apply: s => s.replace(/s$/, 'ḥ').replace(/d$/, 't') },
];

const SLAVIC_RULES = [
  { id: 'lar', name: 'Laryngeals', pattern: null,
    desc: 'The same first step as Sanskrit: laryngeals color and lengthen neighbouring vowels, then vanish.',
    apply: s => laryngeals(s, 'slavic') },
  { id: 'satem', name: 'Satem', pattern: 'satem',
    desc: 'Palatal ḱ, ǵ, ǵʰ become s, z, z.',
    apply: s => s.replace(/K/g, 's').replace(/[GZ]/g, 'z') },
  { id: 'asp', name: 'Breathy stops lost', pattern: 'aspirate',
    desc: 'bʰ, dʰ, gʰ, gʷʰ merge with plain b, d, g.',
    apply: s => s.replace(/B/g, 'b').replace(/D/g, 'd').replace(/J/g, 'g').replace(/X/g, 'g') },
  { id: 'labio', name: 'Labiovelars unround', pattern: null,
    desc: 'kʷ, gʷ lose their lip-rounding: k, g.',
    apply: s => s.replace(/Q/g, 'k').replace(/W/g, 'g') },
  { id: 'syll', name: 'Syllabic r̥, l̥', pattern: 'syllabic',
    desc: 'r̥, l̥ break into a short vowel plus a consonant: ьr, ьl. Syllabic m̥, n̥ become the nasal vowel ę.',
    apply: s => s.replace(/L/g, 'ьl').replace(/R/g, 'ьr').replace(/[MN]/g, 'ę') },
  { id: 'ruki', name: 'RUKI', pattern: 'ruki',
    desc: 's becomes x (the "ch" of Bach) after r, u, k or i (and y), before a vowel. Same trigger as Sanskrit, different result.',
    apply: s => s.replace(re(`(?<=[rukiīūy])s(?=${V})`), 'x') },
  { id: 'pal1', name: 'First palatalization', pattern: 'palatal',
    desc: 'k, g, x soften to č, ž, š before a front vowel. Like Sanskrit\'s Law of Palatals, but a separate event.',
    apply: s => s.replace(/k(?=[eēiīě])/g, 'č').replace(/g(?=[eēiīě])/g, 'ž').replace(/x(?=[eēiīě])/g, 'š') },
  { id: 'prothesis', name: 'j- before e-', pattern: null,
    desc: 'A word can\'t start with a bare e: it gains a j.',
    apply: s => s.replace(/^e/, 'je') },
  { id: 'final', name: 'Final -os, -us → ъ', pattern: null,
    desc: 'Word-final -os and -us shrink to the short vowel ъ.',
    apply: s => s.replace(/[ou]s$/, 'ъ') },
  { id: 'open', name: 'Open syllables', pattern: null,
    desc: 'Slavic stops tolerating consonants at the end of a word, so any left over is dropped. (A final diphthong like -oy is kept; it shrinks later.)',
    apply: s => s.replace(re(`[^${VOWELS}yw]$`), '') },
  { id: 'jers', name: 'Short u, i → ъ, ь', pattern: null,
    desc: 'Short u and i become the "jers" ъ and ь, the ultra-short vowels of Old Church Slavonic.',
    apply: s => s.replace(/u/g, 'ъ').replace(/i/g, 'ь') },
  { id: 'long', name: 'Vowels regroup', pattern: 'longu',
    desc: 'Short a and o merge as o; long ā and ō merge as a. ē becomes ě, ū becomes y (Russian ы), ī becomes plain i. Slavic merges a with o, but never e with o.',
    apply: s => s.replace(/a/g, 'o').replace(/[āō]/g, 'a').replace(/ē/g, 'ě').replace(/ū/g, 'Y').replace(/ī/g, 'i') },
  { id: 'eye', name: 'Causative -eye- → -i-', pattern: null,
    desc: 'The PIE causative suffix -éye- contracts to -i-.',
    apply: s => s.replace(/eye/g, 'i') },
  { id: 'mono', name: 'Diphthongs shrink', pattern: 'eo',
    desc: 'oy → ě, ey → i, ow and ew → u, before a consonant or at the end.',
    apply: s => s.replace(re(`oy(?=${C}|$)`), 'ě').replace(re(`ey(?=${C}|$)`), 'i').replace(re(`[oe]w(?=${C}|$)`), 'u') },
  { id: 'wv', name: 'w becomes v', pattern: null,
    desc: 'w shifts to v.',
    apply: s => s.replace(/w/g, 'v') },
  { id: 'pal2', name: 'Second palatalization', pattern: 'palatal',
    desc: 'k, g, x soften again, to c, dz, s, but only before the new ě made from oy. The first palatalization had already finished by then.',
    apply: s => s.replace(/k(?=ě)/g, 'c').replace(/g(?=ě)/g, 'dz').replace(/x(?=ě)/g, 's') },
];

// "Break the order" demo: run each rulebook with one rule moved out of its
// historical place, to show that the order is part of the rule system.
const REORDERED = {
  skt: { move: 'palatal', after: 'mono' },
  slavic: { move: 'pal1', after: 'mono' },
};

function reorder(rules, { move, after }) {
  const list = rules.filter(r => r.id !== move);
  const idx = list.findIndex(r => r.id === after);
  list.splice(idx + 1, 0, rules.find(r => r.id === move));
  return list;
}

function derive(pie, rules) {
  let s = tokenize(pie);
  const steps = [];
  for (const rule of rules) {
    const before = s;
    s = rule.apply(s);
    steps.push({ rule, before, after: s, fired: before !== s });
  }
  return { start: tokenize(pie), steps, result: s };
}

const WORDS = [
  { id: 'honey', group: 'words', gloss: 'honey, mead', pie: '*médʰu',
    skt: 'madhu', deva: 'मधु', sl: 'medъ', modern: { ru: 'мёд', sc: 'med' },
    note: 'The vowel test in one short word: the same PIE e comes out as Sanskrit a and Slavic e.' },
  { id: 'is', group: 'words', gloss: 'is', pie: '*h₁ésti',
    skt: 'asti', deva: 'अस्ति', sl: 'jestь', modern: { ru: 'есть', sc: 'je / jest' } },
  { id: 'son', group: 'words', gloss: 'son', pie: '*suHnús',
    skt: 'sūnuḥ', deva: 'सूनुः', sl: 'synъ', modern: { ru: 'сын', sc: 'sin' } },
  { id: 'smoke', group: 'words', gloss: 'smoke', pie: '*dʰuh₂mós',
    skt: 'dhūmaḥ', deva: 'धूमः', sl: 'dymъ', modern: { ru: 'дым', sc: 'dim' } },
  { id: 'alive', group: 'words', gloss: 'alive', pie: '*gʷih₃wós',
    skt: 'jīvaḥ', deva: 'जीवः', sl: 'živъ', modern: { ru: 'живой', sc: 'živ' } },
  { id: 'light', group: 'words', gloss: 'white · light, world', pie: '*ḱwoytós',
    skt: 'śvetaḥ', deva: 'श्वेतः', sl: 'světъ', modern: { ru: 'свет', sc: 'svijet' },
    note: 'Sanskrit śveta is often traced to the e-grade *ḱweyt- instead. Both grades give Sanskrit e, which is the vowel merger hiding the difference again.' },
  { id: 'full', group: 'words', gloss: 'full', pie: '*pl̥h₁nós',
    skt: 'pūrṇaḥ', deva: 'पूर्णः', sl: 'pьlnъ', modern: { ru: 'полный', sc: 'pun' } },
  { id: 'dil', group: 'words', gloss: 'daughter-in-law', pie: '*snuséh₂',
    skt: 'snuṣā', deva: 'स्नुषा', sl: 'snъxa', modern: { ru: 'сноха', sc: 'snaha' },
    note: 'RUKI on both sides of the same word: s after u becomes Sanskrit ṣ and Slavic x.' },
  { id: 'wake', group: 'words', gloss: 'wakes someone', pie: '*bʰowdʰéyeti',
    skt: 'bodhayati', deva: 'बोधयति', sl: 'buditь', modern: { ru: 'будит', sc: 'budi' },
    note: 'Grassmann\'s law turns bh…dh into b…dh in Sanskrit. Buddha, "the awakened one", comes from the same root.' },
  { id: 'carries', group: 'grades', gloss: 'carries', pie: '*wéǵʰeti',
    skt: 'vahati', deva: 'वहति', sl: 'vezetь', modern: { ru: 'везёт', sc: 'veze' },
    note: 'e-grade. Compare "transports": Slavic shows e here and o there; Sanskrit shows a and ā.' },
  { id: 'transports', group: 'grades', gloss: 'transports (makes carry)', pie: '*wóǵʰeyeti',
    skt: 'vāhayati', deva: 'वाहयति', sl: 'vozitь', modern: { ru: 'возит', sc: 'vozi' },
    note: 'o-grade causative. The Slavic e : o alternation (vezetь : vozitь) is the ablaut Sanskrit\'s merger made invisible.' },
  { id: 'wolf-nom', group: 'wolf', gloss: 'wolf', pie: '*wĺ̥kʷos',
    skt: 'vṛkaḥ', deva: 'वृकः', sl: 'vьlkъ', modern: { ru: 'волк', sc: 'vuk' } },
  { id: 'wolf-abl', group: 'wolf', gloss: 'from the wolf → of the wolf', pie: '*wĺ̥kʷōd',
    skt: 'vṛkāt', deva: 'वृकात्', sl: 'vьlka', modern: { ru: 'волка', sc: 'vuka' },
    note: 'One PIE ablative, two jobs: Sanskrit keeps it as "from the wolf"; Slavic uses it as the genitive "of the wolf".' },
  { id: 'wolf-loc', group: 'wolf', gloss: 'in / on the wolf', pie: '*wĺ̥kʷoy',
    skt: 'vṛke', deva: 'वृके', sl: 'vьlcě', modern: { ru: '(о) волке', sc: '(o) vuku, a newer ending' },
    note: 'Watch the order. Sanskrit\'s Law of Palatals and Slavic\'s first palatalization both fire before oy shrinks, so neither softens this k. Try "Break the order" below.' },
  { id: 'wolf-voc', group: 'wolf', gloss: 'O wolf!', pie: '*wĺ̥kʷe',
    skt: 'vṛka', deva: 'वृक', sl: 'vьlče', modern: { ru: 'none (vocative lost)', sc: 'vuče' },
    note: 'The rules predict Sanskrit vṛca, but Sanskrit says vṛka. Every other form of the word has k, and speakers restored it here by analogy. Sound laws are regular; speakers also level their paradigms.' },
  { id: 'wolf-locpl', group: 'wolf', gloss: 'among wolves', pie: '*wĺ̥kʷoysu',
    skt: 'vṛkeṣu', deva: 'वृकेषु', sl: 'vьlcěxъ', modern: { ru: '(о) волках', sc: '(o) vukovima, a newer ending' },
    note: 'RUKI fires after the y of oy, then oy shrinks. In Slavic the new ě also triggers the second palatalization (k → c).' },
];

if (typeof module !== 'undefined') {
  module.exports = { tokenize, display, derive, reorder, SANSKRIT_RULES, SLAVIC_RULES, REORDERED, WORDS };
}

// --- Browser UI ------------------------------------------------------------

const PATTERN_LABELS = {
  eo: 'a ↔ e / o', satem: 'ś ↔ s', aspirate: 'bh ↔ b', longu: 'ū ↔ y',
  ruki: 'ṣ ↔ x', syllabic: 'ṛ ↔ ьl', palatal: 'c ↔ č',
};

const GROUPS = [
  { id: 'words', label: 'Words' },
  { id: 'grades', label: 'One root, two vowel grades' },
  { id: 'wolf', label: 'One word through the cases' },
];

const BRANCHES = [
  { id: 'skt', name: 'Sanskrit', rules: SANSKRIT_RULES, attested: w => w.skt },
  { id: 'slavic', name: 'Proto-Slavic', rules: SLAVIC_RULES, attested: w => w.sl },
];

const PALETTE = ['ḱ', 'ǵ', 'ǵʰ', 'kʷ', 'gʷ', 'gʷʰ', 'bʰ', 'dʰ', 'gʰ', 'h₁', 'h₂', 'h₃', 'l̥', 'r̥', 'm̥', 'n̥', 'ē', 'ō'];

function initSoundLawMachine() {
  const state = { wordId: 'honey', custom: null, step: Infinity, reordered: false, timer: null };
  const $ = id => document.getElementById(id);
  const byId = Object.fromEntries(WORDS.map(w => [w.id, w]));

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  const currentPie = () => (state.custom ? `*${state.custom.replace(/^\*/, '')}` : byId[state.wordId].pie);
  const currentWord = () => (state.custom ? null : byId[state.wordId]);
  const rulesFor = branch => (state.reordered ? reorder(branch.rules, REORDERED[branch.id]) : branch.rules);
  const maxSteps = () => Math.max(...BRANCHES.map(b => b.rules.length));

  // Wrap the part of `after` that differs from `before` in a <mark>.
  function diffNodes(before, after) {
    const a = [...display(before)], b = [...display(after)];
    let start = 0;
    while (start < a.length && start < b.length && a[start] === b[start]) start++;
    let endA = a.length, endB = b.length;
    while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) { endA--; endB--; }
    const frag = document.createDocumentFragment();
    frag.append(b.slice(0, start).join(''));
    const mark = el('mark', null, b.slice(start, endB).join(''));
    if (!mark.textContent) mark.classList.add('is-deletion');
    frag.append(mark, b.slice(endB).join(''));
    return frag;
  }

  function renderWordChips() {
    const wrap = $('slmWords');
    wrap.textContent = '';
    GROUPS.forEach(g => {
      const row = el('div', 'slm-group');
      row.appendChild(el('span', 'sl-control-label', g.label));
      const chips = el('div', 'sl-chips');
      WORDS.filter(w => w.group === g.id).forEach(w => {
        const b = el('button', `sl-chip${!state.custom && w.id === state.wordId ? ' active' : ''}`);
        b.type = 'button';
        b.append(el('span', 'slm-chip-pie', w.pie), el('span', 'slm-chip-gloss', w.gloss));
        b.setAttribute('aria-pressed', !state.custom && w.id === state.wordId ? 'true' : 'false');
        b.addEventListener('click', () => { state.custom = null; state.wordId = w.id; resetSteps(true); });
        chips.appendChild(b);
      });
      row.appendChild(chips);
      wrap.appendChild(row);
    });
  }

  function renderColumn(branch) {
    const col = $(`slm-${branch.id}`);
    col.textContent = '';
    const rules = rulesFor(branch);
    const run = derive(currentPie(), rules);
    const shown = Math.min(state.step, rules.length);
    const current = shown === 0 ? run.start : run.steps[shown - 1].after;

    const head = el('div', 'slm-col-head');
    head.appendChild(el('h3', 'slm-col-title', branch.name));
    const form = el('div', 'slm-current');
    form.appendChild(el('span', 'slm-current-form', display(current)));
    head.appendChild(form);
    col.appendChild(head);

    const list = el('ol', 'slm-rules');
    rules.forEach((rule, i) => {
      const step = run.steps[i];
      const done = i < shown;
      const li = el('li', `slm-rule${done ? (step.fired ? ' is-fired' : ' is-idle') : ' is-pending'}${done && i === shown - 1 && state.step !== Infinity ? ' is-current' : ''}${state.reordered && rule.id === REORDERED[branch.id].move ? ' is-moved' : ''}`);
      const top = el('div', 'slm-rule-top');
      top.appendChild(el('span', 'slm-rule-num', String(i + 1)));
      top.appendChild(el('span', 'slm-rule-name', rule.name));
      if (rule.pattern) {
        const a = el('a', 'slm-rule-pattern', PATTERN_LABELS[rule.pattern]);
        a.href = 'slavic.html#explorer';
        a.title = 'This pattern in the Cognate Explorer';
        top.appendChild(a);
      }
      if (done && !step.fired) top.appendChild(el('span', 'slm-rule-idle', 'no change'));
      li.appendChild(top);
      if (done && step.fired) {
        const change = el('div', 'slm-change');
        change.appendChild(el('span', 'slm-before', display(step.before)));
        change.appendChild(el('span', 'slm-arrow', '→'));
        const after = el('span', 'slm-after');
        after.appendChild(diffNodes(step.before, step.after));
        change.appendChild(after);
        li.appendChild(change);
        li.appendChild(el('p', 'slm-rule-desc', rule.desc));
      }
      list.appendChild(li);
    });
    col.appendChild(list);

    const result = el('div', 'slm-result');
    const w = currentWord();
    if (shown < rules.length) {
      result.appendChild(el('span', 'slm-result-wait', `${rules.length - shown} rule${rules.length - shown === 1 ? '' : 's'} to go`));
    } else if (!w) {
      result.appendChild(el('span', 'slm-result-label', 'Prediction'));
      result.appendChild(el('span', 'slm-result-form', display(run.result)));
      result.appendChild(el('span', 'slm-result-note', 'No attested form to check against. The rules are simplified, so treat this as a prediction.'));
    } else {
      const want = branch.attested(w);
      const match = display(run.result) === want;
      result.classList.add(match ? 'is-match' : 'is-miss');
      result.appendChild(el('span', 'slm-result-label', match ? '✓ Matches the attested form' : '≠ Attested form differs'));
      if (!match) {
        const got = el('span', 'slm-result-form is-predicted');
        got.append(el('span', 'slm-result-tag', 'machine'), display(run.result));
        result.appendChild(got);
      }
      const forms = el('span', 'slm-result-form');
      if (!match) forms.appendChild(el('span', 'slm-result-tag', 'attested'));
      if (branch.id === 'skt') forms.appendChild(el('span', 'slm-deva', w.deva));
      forms.append(want);
      result.appendChild(forms);
      if (branch.id === 'slavic') {
        const modern = el('span', 'slm-modern');
        modern.append('Today: Russian ', el('b', null, w.modern.ru), ' · Serbian/Croatian ', el('b', null, w.modern.sc));
        result.appendChild(modern);
      }
    }
    col.appendChild(result);
  }

  function renderStepper() {
    const total = maxSteps();
    const shown = Math.min(state.step, total);
    $('slmCounter').textContent = state.step === Infinity ? `All ${total} steps shown` : `Step ${shown} of ${total}`;
    $('slmPlay').textContent = state.timer ? 'Pause' : 'Play';
    $('slmStep').disabled = state.step !== Infinity && shown >= total;
  }

  function renderNote() {
    const note = $('slmNote');
    note.textContent = '';
    const w = currentWord();
    const parts = [];
    if (state.reordered) {
      parts.push('Out of order: Sanskrit\'s Law of Palatals and Slavic\'s first palatalization now run after the diphthongs shrink. Pick "in / on the wolf" to see both come out wrong.');
    }
    if (w && w.note) parts.push(w.note);
    if (!w) parts.push('Your own word. Type PIE with the buttons for special letters. Accents are ignored.');
    parts.forEach(t => note.appendChild(el('p', null, t)));
    note.hidden = parts.length === 0;
  }

  function render() {
    renderWordChips();
    BRANCHES.forEach(renderColumn);
    renderStepper();
    renderNote();
    $('slmReorder').checked = state.reordered;
  }

  function stopPlay() {
    if (state.timer) { clearInterval(state.timer); state.timer = null; }
  }

  function resetSteps(showAll) {
    stopPlay();
    state.step = showAll ? Infinity : 0;
    render();
  }

  function stepOnce() {
    const total = maxSteps();
    if (state.step === Infinity) state.step = 0;
    if (state.step < total) state.step += 1;
    if (state.step >= total) stopPlay();
    render();
  }

  $('slmStep').addEventListener('click', () => { stopPlay(); stepOnce(); });
  $('slmReset').addEventListener('click', () => resetSteps(false));
  $('slmAll').addEventListener('click', () => resetSteps(true));
  $('slmPlay').addEventListener('click', () => {
    if (state.timer) { stopPlay(); render(); return; }
    if (state.step === Infinity || state.step >= maxSteps()) state.step = 0;
    state.timer = setInterval(stepOnce, 900);
    stepOnce();
  });
  $('slmReorder').addEventListener('change', e => { state.reordered = e.target.checked; resetSteps(true); });

  const input = $('slmInput');
  const palette = $('slmPalette');
  PALETTE.forEach(ch => {
    const b = el('button', 'slm-key', ch);
    b.type = 'button';
    b.addEventListener('click', () => {
      const { selectionStart: a, selectionEnd: z, value } = input;
      input.value = value.slice(0, a) + ch + value.slice(z);
      input.focus();
      input.setSelectionRange(a + ch.length, a + ch.length);
    });
    palette.appendChild(b);
  });
  $('slmForm').addEventListener('submit', e => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    state.custom = v;
    resetSteps(true);
  });

  document.querySelectorAll('[data-slm-demo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [wordId, mode] = btn.dataset.slmDemo.split(':');
      state.custom = null;
      state.wordId = wordId;
      state.reordered = mode === 'reordered';
      resetSteps(true);
      $('machine').scrollIntoView({ behavior: 'smooth' });
    });
  });

  render();
}

if (typeof document !== 'undefined') initSoundLawMachine();
