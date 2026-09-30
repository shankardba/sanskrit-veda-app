// Vedavani viewer engine — chant-agnostic: given a chant JSON file matching
// the schema written by scripts/ingest_chant.py, renders Devanagari lines
// with their IAST transliteration underneath, toggle-able on/off, and boxes
// repeated words/phrases so recurring formulas are visible at a glance.
//
// Manual line breaks: a literal "\n" inside a devanagari/iast string (in
// data/chants/*.json) or a translation string (in data/translations/*.json)
// renders as an actual line break in that column — see segmentLine/
// renderScriptLine (Sanskrit side) and renderTranslationText (English
// side). Intended for hand-editing an unusually long verse-line so its
// three columns wrap to a similar, more balanced height; each column's
// break points are independent (Sanskrit and English word order differ),
// and alignTranslationLines already measures actual rendered height per
// line rather than assuming one, so wrapped lines don't need special
// handling elsewhere.

// Every chant belongs to one `collection` (a form or corpus: Antāti,
// Thirukkural, Laharī, Kavacham...). The chant menu (see buildChantMenu)
// lists collections, each of which expands to show its own chants, so the
// list never gets unmanageably long. `language` is still what chants.html's
// ?lang= filter and the Tamil script font switch key off; `subgroup` puts a
// chant under a subheading inside its collection (listed after the
// ungrouped chants — see COLLECTIONS below).
const CHANTS = [
  { id: 'abirami-antati', label: 'Abirami Antati', language: 'tamil', collection: 'antati', subgroup: 'devi' },
  { id: 'saraswati-antati', label: 'Saraswati Antati', language: 'tamil', collection: 'antati', subgroup: 'devi' },
  { id: 'arpudha-tiruvantati', label: 'Arpudha Tiruvantati', language: 'tamil', collection: 'antati', subgroup: 'shaiva' },
  { id: 'tiruvirattai-manimalai', label: 'Tiruvirattai Manimalai', language: 'tamil', collection: 'antati', subgroup: 'shaiva' },
  { id: 'ponvannattantati', label: 'Ponvannattantati', language: 'tamil', collection: 'antati', subgroup: 'shaiva' },
  { id: 'tiruttondar-tiruvantati', label: 'Tiruttondar Tiruvantati', language: 'tamil', collection: 'antati', subgroup: 'shaiva' },
  { id: 'mudhal-tiruvantati', label: 'Mudhal Tiruvantati', language: 'tamil', collection: 'antati', subgroup: 'vaishnava' },
  { id: 'irandam-tiruvantati', label: 'Irandam Tiruvantati', language: 'tamil', collection: 'antati', subgroup: 'vaishnava' },
  { id: 'munram-tiruvantati', label: 'Munram Tiruvantati', language: 'tamil', collection: 'antati', subgroup: 'vaishnava' },
  { id: 'kanninun-cirutampu', label: 'Kanninun Cirutampu', language: 'tamil', collection: 'antati', subgroup: 'vaishnava' },
  { id: 'nanmukan-tiruvantati', label: 'Nanmukan Tiruvantati', language: 'tamil', collection: 'antati', subgroup: 'vaishnava' },
  { id: 'periya-tiruvantati', label: 'Periya Tiruvantati', language: 'tamil', collection: 'antati', subgroup: 'vaishnava' },
  { id: 'ramanuja-nurrantati', label: 'Ramanuja Nurrantati', language: 'tamil', collection: 'antati', subgroup: 'vaishnava' },
  { id: 'kantar-antati', label: 'Kantar Antati', language: 'tamil', collection: 'antati', subgroup: 'murugan' },
  { id: 'thirukkural-arathuppal', label: 'Aratthuppal (Virtue)', language: 'tamil', collection: 'thirukkural' },
  { id: 'thirukkural-porutpal', label: 'Porutpal (Wealth)', language: 'tamil', collection: 'thirukkural' },
  { id: 'thirukkural-kaamathuppal', label: 'Kaamathuppal (Love)', language: 'tamil', collection: 'thirukkural' },
  { id: 'vel-maaral-tamil', label: 'Vel Maaral', language: 'tamil', collection: 'tamil-hymns' },
  { id: 'sri-rudram-namakam', label: 'Namakam', language: 'sanskrit', collection: 'rudram' },
  { id: 'sri-rudram-chamakam', label: 'Chamakam', language: 'sanskrit', collection: 'rudram' },
  // linkScope: 'local' — Soundarya Lahari is a continuous 100-verse poem, not
  // a litany like Namakam/Chamakam where the same refrain deliberately spans
  // the whole text. A concept word here (e.g. bhūmi/"earth") recurring in two
  // unrelated verses 90 verses apart is just ordinary vocabulary reuse, not a
  // meaningful structural echo — so clicking it should only connect its
  // occurrences within the same verse or an adjacent one, not the whole
  // chant (see the section-proximity check in initRepeatClickHandling).
  { id: 'soundarya-lahari', label: 'Soundarya Lahari', language: 'sanskrit', collection: 'lahari', linkScope: 'local' },
  // linkScope: 'local' — same reasoning as Soundarya Lahari above: a
  // continuous 100-verse devotional poem (also Śaṅkara's), not a litany,
  // so word recurrence across distant verses is ordinary vocabulary reuse
  // rather than a deliberate refrain.
  { id: 'shivananda-lahari', label: 'Shivananda Lahari', language: 'sanskrit', collection: 'lahari', linkScope: 'local' },
  // Protection hymns: rakṣā stotrams, and their sister genre the kavacham
  // ("armor"), which has the same purpose but is built as an explicit
  // head-to-foot body map. The two Buddhist rakṣā texts sit under their own
  // "Buddhist" subheading so their tradition is visible at a glance.
  { id: 'bala-raksha-stotram', label: 'Sri Bala Raksha Stotram', language: 'sanskrit', collection: 'raksha' },
  { id: 'rama-raksha-stotram', label: 'Sri Rama Raksha Stotram', language: 'sanskrit', collection: 'raksha' },
  { id: 'krishna-raksha-stotram', label: 'Sri Krishna Raksha (Gopi Krta)', language: 'sanskrit', collection: 'raksha' },
  { id: 'shiva-raksha-stotram', label: 'Sri Shiva Raksha Stotram', language: 'sanskrit', collection: 'raksha' },
  { id: 'vishnu-raksha-stotram', label: 'Sri Vishnu Raksha Stotram', language: 'sanskrit', collection: 'raksha' },
  { id: 'hanumad-raksha-stotram', label: 'Sri Hanumad Raksha Stotram', language: 'sanskrit', collection: 'raksha' },
  { id: 'shani-raksha-stava', label: 'Sri Shani Raksha Stava', language: 'sanskrit', collection: 'raksha' },
  { id: 'ashtamurti-raksha-stotram', label: 'Ashtamurti Raksha Stotram', language: 'sanskrit', collection: 'raksha' },
  { id: 'narasimha-kavacham', label: 'Sri Narasimha Kavacham', language: 'sanskrit', collection: 'kavacham' },
  { id: 'devi-kavacham', label: 'Sri Durga Kavacham (Devi Kavacham)', language: 'sanskrit', collection: 'kavacham' },
  { id: 'bala-krishna-raksha-kavacham', label: 'Bala Krishna Raksha Kavacham (Nandagopa)', language: 'sanskrit', collection: 'kavacham' },
  { id: 'vakratunda-ganesha-kavacham', label: 'Vakratunda Ganesha Kavacham', language: 'sanskrit', collection: 'kavacham' },
  { id: 'raghavendra-raksha-kavacham', label: 'Sri Raghavendra Raksha Kavacham', language: 'sanskrit', collection: 'kavacham' },
  { id: 'pancharaksha-devi-stotrani', label: 'Pancharaksha Devi Stotrani', language: 'sanskrit', collection: 'raksha', subgroup: 'buddhist' },
  { id: 'raksha-kala-kara-stava', label: 'Raksha Kala Kara Stava', language: 'sanskrit', collection: 'raksha', subgroup: 'buddhist' },
];

// Collection order/labels for the chant menu. Tamil first so Abirami
// Antati (CHANTS[0], also the default chant on a first visit) stays first.
const LANGUAGE_LABELS = { tamil: 'Tamil', sanskrit: 'Sanskrit' };
const COLLECTIONS = [
  {
    id: 'antati',
    language: 'tamil',
    label: 'Antatis',
    subgroups: [
      { id: 'devi', label: 'Devi' },
      { id: 'shaiva', label: 'Shaiva' },
      { id: 'vaishnava', label: 'Vaishnava' },
      { id: 'murugan', label: 'Murugan' },
    ],
  },
  { id: 'thirukkural', language: 'tamil', label: 'Thirukkural' },
  { id: 'tamil-hymns', language: 'tamil', label: 'Other Hymns' },
  { id: 'rudram', language: 'sanskrit', label: 'Sri Rudram' },
  { id: 'lahari', language: 'sanskrit', label: 'Laharis of Shankara' },
  { id: 'raksha', language: 'sanskrit', label: 'Raksha Stotrams', subgroups: [{ id: 'buddhist', label: 'Buddhist' }] },
  { id: 'kavacham', language: 'sanskrit', label: 'Kavachams' },
];

// Optional per-section popup notes, keyed by chant id then section label —
// a section-label only becomes clickable (see renderChant) when an entry
// exists here. Content is built lazily (each value a function, not the
// note itself) since it's only ever needed once the user actually clicks.
const SECTION_NOTES = {
  'sri-rudram-namakam': {
    1: () => buildWeaponsPacifiedNote(),
    2: () => buildPatayeLitanyNote(),
    3: () => buildRudraOutcastsNote(),
    10: () => buildProtectiveRefrainNote(),
    11: () => buildRudraGanasNote(),
    12: () => buildRudraVishnuDeathNote(),
  },
  'sri-rudram-chamakam': {
    6: () => buildChamakamPantheonNote(),
    7: () => buildSomaRitualNote(),
    9: () => buildAshvamedhaNote(),
    11: () => buildSquaresMathNote(),
  },
  'vel-maaral-tamil': {
    'Refrain (×12)': () => buildVelMaaralStructureNote(),
  },
  'thirukkural-arathuppal': {
    1: () => buildRegisterVarianceNote(),
    30: () => buildNegativeNominalizerNote(),
  },
  'thirukkural-porutpal': {
    49: () => buildConditionalSuffixNote(),
  },
  'soundarya-lahari': {
    1: () => buildEarthAndYouDeclensionNote(),
    3: () => buildGenitivePluralAnaphoraNote(),
    9: () => buildKundaliniChakraNote(),
    11: () => buildSriChakraGeometryNote(),
    42: () => buildTwoPartStructureNote(),
    101: () => buildColophonAndAppendixNote(),
    103: () => buildNiAlliterationNote(),
  },
  'shivananda-lahari': {
    1: () => buildDualEndingAndParticipleChainNote(),
  },
  'bala-raksha-stotram': {
    1: () => buildBalaRakshaSignificanceNote(),
  },
  'rama-raksha-stotram': {
    Viniyoga: () => buildRamaRakshaSignificanceNote(),
    'Verse 37': () => buildRamaCaseGarlandNote(),
  },
  'narasimha-kavacham': {
    1: () => buildNarasimhaKavachamSignificanceNote(),
    31: () => buildNarasimhaParticipleCascadeNote(),
  },
  'krishna-raksha-stotram': {
    1: () => buildKrishnaRakshaSignificanceNote(),
  },
  'shiva-raksha-stotram': {
    Viniyoga: () => buildShivaRakshaSignificanceNote(),
  },
  'vishnu-raksha-stotram': {
    114: () => buildVishnuRakshaSignificanceNote(),
  },
  'hanumad-raksha-stotram': {
    1: () => buildHanumadRakshaSignificanceNote(),
  },
  'shani-raksha-stava': {
    'Pūrvapīṭhikā': () => buildShaniRakshaSignificanceNote(),
  },
  'ashtamurti-raksha-stotram': {
    1: () => buildAshtamurtiSignificanceNote(),
  },
  'bala-krishna-raksha-kavacham': {
    Nandagopa: () => buildBalaKrishnaKavachamSignificanceNote(),
  },
  'vakratunda-ganesha-kavacham': {
    1: () => buildVakratundaKavachamSignificanceNote(),
  },
  'raghavendra-raksha-kavacham': {
    1: () => buildRaghavendraKavachamSignificanceNote(),
  },
  'pancharaksha-devi-stotrani': {
    'Mahāpratisarā': () => buildPancharakshaSignificanceNote(),
  },
  'raksha-kala-kara-stava': {
    Invocation: () => buildRakshaKalaKaraSignificanceNote(),
  },
  'devi-kavacham': {
    Viniyoga: () => buildDeviKavachamSignificanceNote(),
    'Verse 21': () => buildDeviKavachamWholePersonNote(),
  },
  'abirami-antati': {
    Kāppu: () => buildAbiramiAntatiSignificanceNote(),
    79: () => buildAbiramiMoonNote(),
  },
  'arpudha-tiruvantati': {
    1: () => buildArpudhaTiruvantatiSignificanceNote(),
  },
  'saraswati-antati': {
    'Kaṭavuḷ Vāḻttu 1': () => buildSaraswatiAntatiSignificanceNote(),
  },
  'mudhal-tiruvantati': {
    1: () => buildThreeLampsNote('mudhal'),
  },
  'irandam-tiruvantati': {
    1: () => buildThreeLampsNote('irandam'),
  },
  'munram-tiruvantati': {
    1: () => buildThreeLampsNote('munram'),
  },
  'kanninun-cirutampu': {
    1: () => buildKanninunSignificanceNote(),
  },
  'tiruvirattai-manimalai': {
    1: () => buildTiruvirattaiSignificanceNote(),
  },
  'ponvannattantati': {
    1: () => buildPonvannattantatiSignificanceNote(),
  },
  'tiruttondar-tiruvantati': {
    1: () => buildTiruttondarSignificanceNote(),
  },
  'nanmukan-tiruvantati': {
    1: () => buildNanmukanSignificanceNote(),
  },
  'periya-tiruvantati': {
    1: () => buildPeriyaTiruvantatiSignificanceNote(),
  },
  'ramanuja-nurrantati': {
    1: () => buildRamanujaNurrantatiSignificanceNote(),
  },
  'kantar-antati': {
    1: () => buildKantarAntatiSignificanceNote(),
  },
};

// Optional intermediate grouping between a chant and its sections, keyed by
// chant id — a topic-navigator block (see buildTopicNav) only renders when
// an entry exists here. Each group is a contiguous run of section labels
// (numeric, inclusive `from`/`to`); Thirukkural's three books use this for
// their traditional 13 iyal ("part") groupings over the 133 adhikārams.
const SECTION_GROUPS = {
  'thirukkural-arathuppal': [
    { label: 'Prologue', from: 1, to: 4 },
    { label: 'Domestic Virtue', from: 5, to: 24 },
    { label: 'Ascetic Virtue', from: 25, to: 37 },
    { label: 'Fate', from: 38, to: 38 },
  ],
  'thirukkural-porutpal': [
    { label: 'Royalty', from: 39, to: 63 },
    { label: 'Ministers of State', from: 64, to: 73 },
    { label: 'The Essentials of a State', from: 74, to: 75 },
    { label: 'Way of Making Wealth', from: 76, to: 76 },
    { label: 'The Excellence of an Army', from: 77, to: 78 },
    { label: 'Friendship', from: 79, to: 95 },
    { label: 'Miscellaneous', from: 96, to: 108 },
  ],
  'thirukkural-kaamathuppal': [
    { label: 'The Pre-marital love', from: 109, to: 115 },
    { label: 'The Post-marital love', from: 116, to: 133 },
  ],
};

// One-line summaries of what each anuvāka is actually doing, shown next to
// its "Anuvāka N" label in the translation column — read top to bottom,
// each chant's sequence traces a single arc. First pass; expect these to
// get edited.
const ANUVAKA_TAGLINES = {
  'sri-rudram-namakam': {
    1: 'Rudra as a power beyond us — his weapons turned aside',
    2: 'Rudra as lord of every place, creature, and calling',
    3: 'Rudra among outcasts and wanderers, and every bodily stance',
    4: 'Rudra as lord of every craft, army, and hunt',
    5: 'Rudra in every extreme — the great and the small, the swift and the slow',
    6: 'Rudra in every age of life and every terrain',
    7: 'Rudra in Nature — cloud, storm, river, and well',
    8: 'Rudra gentled — river-crossings, and his most auspicious names',
    9: 'Rudra reaching into the home — and into affliction itself',
    10: 'A turn to plea — protect this family, this village, this body',
    11: 'Rudra everywhere at once — on earth, in the sky, in heaven',
    12: "Rudra found within — “this hand of mine is divine”",
  },
  'sri-rudram-chamakam': {
    1: "A child's first needs — breath, body, and the senses",
    2: 'Learning to grow — understanding, truth, and resolve',
    3: 'A settled life — security, peace, and freedom from harm',
    4: 'Running a household — grain, milk, and the harvest',
    5: "A household's wealth — land, metal, herds, and home",
    6: "A prince's allies — the gods invoked, one by one",
    7: "A prince's craft — mastering the sacrifice's rites",
    8: "A king's court — every vessel and altar of the rite",
    9: "A king's dominion — the horse-sacrifice, and the Vedas",
    10: "A king's herds — and the sacrifice that fashions the self",
    11: 'Secrets of the Universe — the numbers beneath all things',
    12: 'Becoming one with the gods — their favor, and peace',
  },
  'thirukkural-arathuppal': {
    1: 'The Praise of God',
    2: 'The Blessing of Rain',
    3: 'The Greatness of Ascetics',
    4: 'Assertion of the Strength of Virtue',
    5: 'Domestic Life',
    6: 'The Worth of a Wife',
    7: 'The Wealth of Children',
    8: 'The Possession of Love',
    9: 'Hospitality',
    10: 'The Utterance of Pleasant Words',
    11: 'Gratitude',
    12: 'Impartiality',
    13: 'The Possession of Self-restraint',
    14: 'The Possession of Decorum',
    15: 'Not coveting another\'s Wife',
    16: 'The Possession of Patience, Forbearance',
    17: 'Not Envying',
    18: 'Not Coveting',
    19: 'Not Backbiting',
    20: 'Against Vain Speaking',
    21: 'Dread of Evil Deeds',
    22: 'Duty to Society',
    23: 'Giving',
    24: 'Renown',
    25: 'Compassion',
    26: 'Abstinence from Flesh',
    27: 'Penance',
    28: 'Imposture',
    29: 'The Absence of Fraud',
    30: 'Veracity',
    31: 'Restraining Anger',
    32: 'Not doing Evil',
    33: 'Not killing',
    34: 'Instability',
    35: 'Renunciation',
    36: 'Truth-Conciousness',
    37: 'Curbing of Desire',
    38: 'Fate',
  },
  'thirukkural-porutpal': {
    39: 'The Greatness of a King',
    40: 'Learning',
    41: 'Ignorance',
    42: 'Hearing',
    43: 'The Possession of Knowledge',
    44: 'The Correction of Faults',
    45: 'Seeking the Aid of Great Men',
    46: 'Avoiding mean Associations',
    47: 'Acting after due Consideration',
    48: 'The Knowledge of Power',
    49: 'Knowing the fitting Time',
    50: 'Knowing the Place',
    51: 'Selection and Confidence',
    52: 'Selection and Employment',
    53: 'Cherishing Kinsmen',
    54: 'Unforgetfulness',
    55: 'The Right Sceptre',
    56: 'The Cruel Sceptre',
    57: 'Absence of Terrorism',
    58: 'Benignity',
    59: 'Detectives',
    60: 'Energy',
    61: 'Unsluggishness',
    62: 'Manly Effort',
    63: 'Hopefulness in Trouble',
    64: 'The Office of Minister of state',
    65: 'Power of Speech',
    66: 'Purity in Action',
    67: 'Power in Action',
    68: 'Modes of Action',
    69: 'The Envoy',
    70: 'Conduct in the Presence of the King',
    71: 'The Knowledge of Indications',
    72: 'The Knowledge of the Council Chamber',
    73: 'Not to dread the Council',
    74: 'The Land',
    75: 'The Fortification',
    76: 'Way of Accumulating Wealth',
    77: 'The Excellence of an Army',
    78: 'Military Spirit',
    79: 'Friendship',
    80: 'Investigation in forming Friendships',
    81: 'Familiarity',
    82: 'Evil Friendship',
    83: 'Unreal Friendship',
    84: 'Folly',
    85: 'Ignorance',
    86: 'Hostility',
    87: 'The Might of Hatred',
    88: 'Knowing the Quality of Hate',
    89: 'Enmity within',
    90: 'Not Offending the Great',
    91: 'Being led by Women',
    92: 'Wanton Women',
    93: 'Not Drinking Palm-Wine',
    94: 'Gambling',
    95: 'Medicine',
    96: 'Nobility',
    97: 'Honour',
    98: 'Greatness',
    99: 'Perfectness',
    100: 'Courtesy',
    101: 'Wealth without Benefaction',
    102: 'Shame',
    103: 'The Way of Maintaining the Family',
    104: 'Farming',
    105: 'Poverty',
    106: 'Mendicancy',
    107: 'The Dread of Mendicancy',
    108: 'Baseness',
  },
  'thirukkural-kaamathuppal': {
    109: 'The Pre-marital love',
    110: 'Recognition of the Signs',
    111: 'Rejoicing in the Embrace',
    112: 'The Praise of her Beauty',
    113: 'Declaration of Love\'s special Excellence',
    114: 'The Abandonment of Reserve',
    115: 'The Announcement of the Rumour',
    116: 'Separation unendurable',
    117: 'Complainings',
    118: 'Eyes consumed with Grief',
    119: 'The Pallid Hue',
    120: 'The Solitary Anguish',
    121: 'Sad Memories',
    122: 'The Visions of the Night',
    123: 'Lamentations at Eventide',
    124: 'Wasting Away',
    125: 'Soliloquy',
    126: 'Reserve Overcome',
    127: 'Mutual Desire',
    128: 'The Reading of the Signs',
    129: 'Desire for Reunion',
    130: 'Expostulation with Oneself',
    131: 'Pouting',
    132: 'Feigned Anger',
    133: 'The Pleasures of Temporary Variance',
  },
};

// Chamakam anuvāka 11 recites two number sequences — 1, 3, 5, ... 33 (Ēkāṃ
// cha mē tisraścha mē, ...) and then 4, 8, 12, ... 48 (Dvādaśa cha mē
// ṣōḍaśa cha mē, ...) — that are exactly the first- and second-order
// differences of the squares 0² through 17². Builds the explanatory table
// and callouts for that, mirroring the classic "differences of squares are
// odd numbers, sums of consecutive odd numbers are multiples of four"
// construction.
function buildSquaresMathNote() {
  const maxN = 17;
  const oddDiffs = []; // N² − (N−1)², N = 1..17 → 1..33 (the verse's full first sequence)
  for (let n = 1; n <= maxN; n++) oddDiffs.push(2 * n - 1);
  // The verse's second sequence stops at 48, i.e. exactly 12 overlapping-pair
  // sums — only the first 13 odd differences (1..25) are needed to produce
  // them, not all 17 (which would run past 48 up to 31+33=64).
  const VERSE_SUM_COUNT = 12;
  const fourSums = [];
  for (let i = 0; i < VERSE_SUM_COUNT; i++) fourSums.push(oddDiffs[i] + oddDiffs[i + 1]);

  let tableRows = '';
  for (let n = 0; n <= maxN; n++) {
    const sq = n * n;
    const diffCell = n === 0 ? '' : `${sq} − ${(n - 1) * (n - 1)} = ${2 * n - 1}`;
    tableRows += `<tr><td>R<sub>${n + 1}</sub></td><td>${n}</td><td>${sq}</td><td class="diff-col">${diffCell}</td></tr>`;
  }

  const diffLines = oddDiffs.map((diff, i) => `${(i + 1) * (i + 1)} − ${i * i} = ${diff}`).join('<br>');
  const sumLines = fourSums
    .map((sum, i) => `${oddDiffs[i]} + ${oddDiffs[i + 1]} = ${sum}`)
    .join('<br>');

  return {
    title: 'The Mathematics of Anuvāka 11',
    subtitle: 'Śrī Rudram Chamakam · Anuvāka 11',
    bodyHtml: `
      <p>This anuvāka recites two number sequences in a row — <em>one and three, five and seven, nine and eleven…</em> up through <em>thirty-three</em>, then <em>twelve and sixteen, twenty and twenty-four and twenty-eight…</em> up through <em>forty-eight</em>. Both fall directly out of the squares 0² through 17².</p>
      <div class="math-callouts">
        <div class="math-callout">
          <h4>First sequence — differences</h4>
          <div class="formula">N² − (N−1)² = 2N − 1</div>
          <div class="sequence">${diffLines}</div>
        </div>
        <div class="math-callout">
          <h4>Second sequence — sums</h4>
          <div class="formula">(2N−1) + (2N+1) = 4N</div>
          <div class="sequence">${sumLines}</div>
        </div>
      </div>
      <p>Every odd number the verse counts off is the gap between two consecutive squares; every multiple of four it counts off next is what two neighboring gaps add up to. The table below is the same thing laid out row by row.</p>
      <div class="math-table-wrap">
        <table class="math-table">
          <thead><tr><th>Row</th><th>N</th><th>N²</th><th>R<sub>N<sup>2</sup></sub> − R<sub>N<sup>(2−1)</sup></sub></th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    `,
  };
}

// Vel Maaral's 65 numbered verses are only 16 verses that are textually
// unique — every other verse is a literal repeat of one of those 16 (see
// scripts/build_vel_maaral.py's SEQUENCE). Grouped into 8 consecutive pairs
// (1-2, 3-4, ... 15-16), the 65-verse order is that set of 8 pairs recited
// forward, then backward, then forward again with each pair's own two
// verses swapped, then backward again — a nested mirror, not a random
// shuffle. This builds that explanation, reusing the same clickable-note
// mechanism as Chamakam's anuvāka 11 (see buildSquaresMathNote/openMathModal).
function buildVelMaaralStructureNote() {
  const pairRows = [
    ['1–16', 'straight through, pairs 1→8'],
    ['17–32', 'reversed, pairs 8→1 (each pair still forward)'],
    ['33–48', 'straight through again, but every pair itself reversed'],
    ['49–64', 'reversed again, pairs still individually reversed'],
    ['65', 'verse 2 once more — the refrain-verse itself, closing the frame'],
  ];
  const tableRows = pairRows
    .map(([range, desc]) => `<tr><td>${range}</td><td>${desc}</td></tr>`)
    .join('');

  return {
    title: 'The Structure of Vel Maaral',
    subtitle: 'Vēl Māṟal · verses 1–65',
    bodyHtml: `
      <p>Two patterns run underneath the 65 numbered verses.</p>
      <p><strong>The refrain is a macro, not a repeat.</strong> "( ... tiru ... )" after every verse is an instruction, not chant text: at that word, recite the full four-line opening verse again in full. Printed once and expanded 65 times, this chant is really 65 short verses interleaved with 65 recitations of one refrain.</p>
      <p><strong>The 65 verses are 16 verses in a mirrored order.</strong> Grouped into 8 pairs by the order they first appear, the recitation moves through those pairs and back again, twice — the second pass with each pair's own two verses swapped:</p>
      <div class="consonant-table-wrap">
        <table class="consonant-table math-table"><tbody>${tableRows}</tbody></table>
      </div>
      <p>Nothing in the second half (33–64) lands in the same verse-pair position as its counterpart in the first half (1–32) — every verse returns, but never the same way twice. Also: verses 15–16 recur immediately as 17–18 before the mirroring proper begins, on both the Tamil and English source pages — likely deliberate emphasis rather than a transcription slip, but flagged here since it's the one place the otherwise-exact symmetry above doesn't hold.</p>
    `,
  };
}

// Namakam anuvāka 1 individually addresses Rudra's weapons — bow, arrow,
// quiver, hand — asking each one by name to become auspicious, rather than
// asking for protection in the abstract.
function buildWeaponsPacifiedNote() {
  return {
    title: 'Naming the Weapon to Disarm It',
    subtitle: 'Śrī Rudram Namakam · Anuvāka 1',
    bodyHtml: `
      <p>This anuvāka's real subject is disarmament, done one item at a time: the bow (<em>dhanuḥ</em>), the arrow (<em>iṣu</em>), the quiver (<em>iṣudhi</em>), and Rudra's own hand (<em>hasta</em>) are each separately named and separately asked to become auspicious — not "protect us" as one general request, but a sequence of specific objects, addressed and negotiated with individually.</p>
      <p>That's a distinct ritual logic from simply asking a feared power to go away or stay away: a thing that's dangerous gets approached directly, named precisely, and asked to change its nature, rather than being denied, suppressed, or left unmentioned. The same instinct — enumerate the specific thing, then ask it to be well-disposed — reappears at a much larger scale in the anuvākas just ahead, where it's entire trades and social classes being named one after another rather than a god's weapons.</p>
    `,
  };
}

// Namakam anuvāka 2 opens the "-pataye namaḥ" litany that structures most
// of anuvākas 2-4: dozens of lines, each built by taking a domain, adding
// "lord of" in the dative, and closing with "namaḥ."
function buildPatayeLitanyNote() {
  return {
    title: 'One Suffix, Built Fresh a Dozen Times',
    subtitle: 'Śrī Rudram Namakam · Anuvāka 2',
    bodyHtml: `
      <p>Nearly every line here follows the same small grammatical machine: a noun naming some domain, <em>-pati</em> ("lord, master") attached to it, the dative case ending <em>-ye</em> ("to"), and the hymn's recurring <em>namaḥ</em> ("salutation") — "salutation to the lord of ___." This anuvāka runs it against animals, foods, trees, thickets, forests, foot-soldiers, and more; the litany continues into anuvāka 3 (see its own note on where the list turns pointedly toward outcasts) and anuvāka 4's crafts and professions.</p>
      <p>The device itself is a genre feature, not unique to this hymn — Vedic praise-poetry often works by accumulation rather than by a single perfect description, piling up named instances of a quality (here, lordship) until the sheer comprehensiveness becomes the point. No one domain is more important than the others; the exhaustiveness is what does the praising.</p>
    `,
  };
}

// Namakam anuvāka 3's litany explicitly salutes Rudra as lord of thieves,
// robbers, plunderers, and cutthroats, alongside soldiers and hunters —
// one of the most-discussed features of this hymn, so worth unpacking
// rather than letting it read as a stray oddity in the translation column.
function buildRudraOutcastsNote() {
  return {
    title: 'Rudra as Patron of Outcasts and Thieves',
    subtitle: 'Śrī Rudram Namakam · Anuvāka 3',
    bodyHtml: `
      <p>Most of this anuvāka's "salutation to X, and to the lord of Y" pairs are unremarkable — archers, riders, assemblies, horses. A few aren't: <em>lord of thieves</em>, <em>lord of robbers</em>, <em>lord of thieves-in-hiding</em>, <em>lord of marauders</em>, <em>lord of cutthroats</em>. Rudra is being named, explicitly, as the patron of society's outcasts and its criminals — not in spite of his fearsomeness but because of it.</p>
      <p>Many readers of this hymn take that as an early, Vedic-period glimpse of the same character later Purāṇic mythology develops fully in Rudra's successor Śiva: a god who stands outside the ordinary social order rather than presiding over it from within — at home in the cremation ground, in the company of ghosts and ascetics, on the margins rather than at the center. That later mythology is centuries removed from this text, so treat the connection as a thread worth noticing rather than a settled equivalence — but the impulse to place Rudra among the excluded, right here in one of the oldest layers of the hymn, is genuinely striking on its own terms.</p>
    `,
  };
}

// Namakam anuvāka 11 repeats "thousands of Rudras" — on earth, in the
// mid-region, in heaven — rather than treating Rudra as a single deity.
function buildRudraGanasNote() {
  return {
    title: 'Many Rudras — the Seed of Śiva’s Gaṇas',
    subtitle: 'Śrī Rudram Namakam · Anuvāka 11',
    bodyHtml: `
      <p>This anuvāka doesn't address one Rudra — it counts them: "thousands, by the thousands," dwelling on earth, in the ocean and sky, and in heaven. That's a plural, a whole class of beings, the same grammatical move the Veda makes with troops like the Maruts or the Vasus — not "a god," but "a host."</p>
      <p>This plurality is generally read as the historical root of something the later Śaiva tradition names outright: Śiva's <em>gaṇas</em>, his retinue of attendant beings (Gaṇapati/Ganesha is literally "lord of the gaṇas"). The word gaṇa itself never appears in this text — the connection is a matter of tracing a theme back to its earliest visible form, not a direct citation — but the idea that Rudra comes as a multitude, not a singular figure, is already fully present right here.</p>
    `,
  };
}

// Namakam anuvāka 10 is largely a compilation of separately well-known
// verses built on the same protective refrain, "mā naḥ" — the prohibitive
// mood, not ordinary negation.
function buildProtectiveRefrainNote() {
  return {
    title: '"Let It Not" — a Different Grammar of "No"',
    subtitle: 'Śrī Rudram Namakam · Anuvāka 10',
    bodyHtml: `
      <p>This anuvāka's recurring <em>mā naḥ</em> / <em>mā naḥ</em> ("let it not [harm] us") isn't built from <em>na</em>, the ordinary Sanskrit word for "not." Sanskrit keeps a separate negative particle, <em>mā</em>, reserved specifically for the prohibitive — used with the injunctive mood to forbid or ward something off, closer to "don't let X happen" than to a flat statement that X isn't the case. English collapses both into one word, "not"; Sanskrit doesn't.</p>
      <p>The anuvāka itself reads as a chain of these prohibitions rather than one continuous composition — harm to neither great nor small, neither growing nor grown, neither father nor mother, neither children nor cattle nor horses — each clause a separate plea built on the identical grammatical template. Verses in exactly this mold are among the most independently recited fragments of the whole Rudram, valued and chanted on their own well outside a full recitation of the hymn.</p>
    `,
  };
}

// Namakam anuvāka 12 pairs Rudra with Vishnu as one invoked figure, and
// addresses Death directly with the same ritual exclamation (svāhā) used
// when making an offering to a god. It also embeds the Mahāmṛtyuñjaya
// mantra and the "this hand of mine is divine" gesture-affirmation.
function buildRudraVishnuDeathNote() {
  return {
    title: 'Rudra-Vishnu, and an Offering to Death Itself',
    subtitle: 'Śrī Rudram Namakam · Anuvāka 12',
    bodyHtml: `
      <p>Two things in this closing anuvāka are easy to read past. First: "Om, salutation to the blessed Rudra-Vishnu" addresses the two as one compound figure, not two gods invoked in sequence. The sectarian lines that later separate Śaiva and Vaiṣṇava worship hadn't hardened yet when this layer of the Veda took shape — a deity could be named jointly with another, or identified with another, without that being a contradiction the way it would become in much later, more partisan theology.</p>
      <p>Second: "Svāhā to Death! Svāhā to Death!" — svāhā is the standard exclamation said <em>while pouring an oblation into the sacrificial fire</em>, the ritual formula for giving something to a god. Aiming it at Death (Mṛtyu) treats Death as a power to be ritually addressed and rendered harmless, the same way any other deity would be approached — not simply feared, denied, or left unnamed.</p>
      <p>This anuvāka also opens with <em>tryambakaṃ yajāmahe...</em> — the Mahāmṛtyuñjaya ("great death-conquering") mantra, almost certainly the single most independently recited verse in this entire hymn, chanted on its own far more often than the full Rudram ever is. And a few lines later, "this hand of mine is divine, this other hand of mine is even more divine" treats the reciter's own body as something to be actively affirmed as sacred, not just a vessel offering praise to something external to it.</p>
    `,
  };
}

// Chamakam anuvāka 6 invokes eleven named deities plus "all the gods" and
// the cosmic regions, each one paired with "and Indra be mine" — a
// snapshot of the Vedic pantheon at a point before several of these names
// receded from everyday worship.
function buildChamakamPantheonNote() {
  const deities = [
    ['Agni', 'Fire itself, and the officiant who carries every offering to the other gods.'],
    ['Soma', 'The sacred pressed drink of the ritual, and the god identified with it.'],
    ['Savitr', 'The sun specifically in its impelling, rousing aspect — the one who sets things in motion.'],
    ['Sarasvati', 'Goddess of a river and of speech; her association with learning and the arts develops later.'],
    ['Pushan', 'Guardian of roads, herds, and safe journeys — a pastoral, path-watching god.'],
    ['Brihaspati', 'Priest and preceptor of the gods, lord of sacred speech and counsel.'],
    ['Mitra', 'God of contracts, alliances, and the bonds friendship and oath-taking depend on.'],
    ['Varuna', 'Guardian of cosmic and moral order (ṛta), sovereign over the waters and the oceans.'],
    ['Tvashtr', 'The divine craftsman — shaper of forms, including Indra’s own weapon.'],
    ['Dhatr', 'The establisher — the one who sets things in their place, close in role to a creator.'],
    ['the Aśvins', 'Twin horse-headed gods of healing, dawn, and rescue.'],
    ['the Maruts', 'Storm-gods riding with Indra, his retinue in battle and in the tempest.'],
  ];
  const items = deities
    .map(([name, desc]) => `<dt>${name}</dt><dd>${desc}</dd>`)
    .join('');
  return {
    title: 'Who’s Who in the Pantheon Invoked Here',
    subtitle: 'Śrī Rudram Chamakam · Anuvāka 6',
    bodyHtml: `
      <p>Every single item in this anuvāka is paired with "and Indra be mine" — Indra is the one constant partner across eleven other names, reflecting his standing as the pre-eminent king-god of the Vedic pantheon, a rank later classical Hinduism largely transfers to Vishnu and Shiva. Several of the names beside him are far less familiar today than they'd have been to the hymn's original audience:</p>
      <dl class="modal-glossary">${items}</dl>
      <p>The anuvāka closes by widening from named deities to the cosmic regions themselves — earth, mid-region, sky, the directions, "the summit" — and finally to Prajapati, "lord of creatures," a figure whose role as an overarching creator is later folded into Brahma.</p>
      <p>Worth noticing linguistically: every "X be mine" is literally "X-<em>cha</em> me," with <em>cha</em> ("and") glued onto the end of the word it follows rather than standing on its own the way English "and" does. Sanskrit's <em>cha</em> is an enclitic — it leans backward onto whatever precedes it and can never open a clause — much like Latin's <em>-que</em> ("Senatus Populusque Romanus," not "et Senatus Populus Romanus"). That's why so many of the deity names here end up spelled fused to it (<em>indraścha</em>, <em>agniścha</em>, <em>varuṇaścha</em>) rather than as two separate words — see the site's own <a href="grammar.html">Sanskrit Grammar</a> page on indeclinables for the broader family this belongs to.</p>
    `,
  };
}

// Chamakam anuvāka 7's items are the named cups (graha) and offerings of a
// full Soma sacrifice, in something close to their ritual order.
function buildSomaRitualNote() {
  return {
    title: 'The Soma Sacrifice’s Own Inventory',
    subtitle: 'Śrī Rudram Chamakam · Anuvāka 7',
    bodyHtml: `
      <p>Soma is both a plant and the drink pressed from it — offered to the gods and, in the ritual itself, drunk by the officiating priests — and one of the oldest and most elaborate rites in the whole Vedic corpus is built entirely around pressing and offering it in a fixed sequence of named cups (<em>graha</em>), each one dedicated to a particular deity or pair: a cup for Indra-Vāyu, one for Mitra-Varuna, one for the Aśvins, and so on. This anuvāka is close to a checklist of that sequence.</p>
      <p>A few of its terms name specific, technical moments in the rite rather than generic offerings: the "silently-pressed soma" (<em>upāṃśu-graha</em>) is pressed and offered in near-silence, without the chanting that normally accompanies a pressing — a deliberately quiet exception inside an otherwise loudly recited ceremony. The exact botanical identity of the original Soma plant is itself debated among scholars and was likely already uncertain within the Vedic period's own later centuries; what this anuvāka preserves is the ritual's structure, not a specimen.</p>
    `,
  };
}

// Chamakam anuvāka 9 names the horse-sacrifice (aśvamedha) directly,
// immediately before the hymn moves into cattle by generation and then
// the "through the sacrifice, may it be fashioned" refrain that closes
// anuvāka 10 on the sacrifice itself.
function buildAshvamedhaNote() {
  return {
    title: 'The Horse-Sacrifice, and the Three Vedas',
    subtitle: 'Śrī Rudram Chamakam · Anuvāka 9',
    bodyHtml: `
      <p>"The horse-sacrifice be mine" names the <em>aśvamedha</em>, traditionally among the most prestigious and costly rites in the Vedic world — and one reserved for a king, specifically a sovereign asserting supremacy over other rulers. In its classical form a consecrated horse is released to wander for a year, escorted by the king's men; whatever territory it crosses unopposed is thereby claimed, and its return is marked by a grand sacrifice. Naming it here, as this Anuvāka's list turns from ritual apparatus toward cattle, breath, and eventually the self, reads as a marker of scale — the offering a king alone could make.</p>
      <p>The same lines name the Rik, Sāman, and Yajus formulas together — the three genres of Vedic recitation this whole corpus is organized around: verses meant to be recited (Ṛgveda), set to melody (Sāmaveda), and murmured or spoken to accompany a specific ritual action (Yajurveda, the very text this hymn belongs to). A fourth, the Atharvaveda, wasn't always counted alongside these three in the earliest reckonings — so "the three Vedas" named here is itself a genuinely old way of dividing the tradition, not a later simplification.</p>
    `,
  };
}

function buildRegisterVarianceNote() {
  return {
    title: 'One Tamil Word, Several English Words',
    subtitle: 'Thirukkural · Araththuppāl, Adhikāram 1',
    bodyHtml: `
      <p>As you read on, several boxed Tamil words connect to more than one English word depending on where they show up — not because the Tamil word means something different each time, but because a single translator's word choice shifts with genre and register. நெஞ்சு is "mind" in Araththuppāl's ethics and "heart"/"soul" in Kaamaththuppāl's love poetry; நோய் ("sickness") is metaphorical "evil" in the ethical books and literal "malady"/"disease" for lovesickness in the romantic ones; படை ("army") becomes "weapon" once Kaamaththuppāl needs an image for whatever wounds a longing heart — a flute's sound, a lover's words. சான்றோர் and துணை get whichever of "the wise/learned/great" or "aid/help/support/friend/companion" fits a given line's specific claim about a person of worth or a source of steadiness. Click any of these and every occurrence lights up together, whichever English word each happens to be wearing.</p>
      <p>A few equally frequent words were deliberately left <em>unboxed</em>, for the opposite reason: they aren't one word wearing different clothes, they're genuinely two different words (or two different jobs) sharing one spelling. கண் is usually "eye," but the same syllable also does duty as a locative postposition ("at/in") with no eye in sight — the same kind of trap பொருள் sets throughout this text, one of Thirukkural's most frequent words and literally the title of its second book, yet shifting so freely between "wealth," "meaning," and "reality" that no single English gloss could follow it without misconnecting some of its occurrences. Forcing a gloss onto a genuine homograph would connect lines that don't actually share a word, so these stay unlinked here rather than guessed at.</p>
    `,
  };
}

// Thirukkural Araththuppāl Adhikāram 30 (Veracity) turns the -ஆமை
// negative-nominalizer suffix into its central rhetorical device — most
// visibly in its own 6th kural, which doubles two different verbs onto it
// in the same line.
function buildNegativeNominalizerNote() {
  return {
    title: '"Not-Doing-Ness": Turning a Verb into a Noun by Negating It',
    subtitle: 'Thirukkural · Adhikāram 30, Veracity',
    bodyHtml: `
      <p>Tamil builds an abstract noun out of a verb root by adding <em>-ஆமை</em> (or its shorter cousin <em>-மை</em>) directly onto it — not "not lying" as an action, but "not-lying-ness" as a thing, a quality a person can be said to possess. பொய் ("lie," the root) becomes பொய்யாமை ("truthfulness," literally "the not-telling-lies"); செய் ("do") becomes செய்யாமை ("the not-doing"). English has no single equivalent suffix — it has to reach for a whole phrase ("abstaining from," "the practice of not—") to say what Tamil does by just gluing four letters onto a verb.</p>
      <p>This adhikāram's sixth couplet puts the device on display outright: <em>poyyāmai poyyāmai āṟṟin aramp̱ira seyyāmai seyyāmai naṉṟu</em> — "if a man has the strength for truthfulness, truthfulness [alone], not-doing other virtues, not-doing, is good [enough]." Each of the two negated verbs is said twice in a row for rhetorical weight, a repetition (Tamil poetics calls this figure <em>maṭakku</em>) that a plain word-for-word translation flattens out, since English can't easily double a noun for emphasis the way Tamil can double this one. Compare <a href="tamil-grammar.html">Tamil Grammar</a>'s own note on agglutination — this suffix is exactly that principle applied to negation specifically.</p>
    `,
  };
}

// Thirukkural Porutpāl Adhikāram 49 (Knowing the Fitting Time) leans hard on
// the -இன் conditional-participle suffix, Tamil's own way of saying "if."
function buildConditionalSuffixNote() {
  return {
    title: '"If" Without a Word for "If"',
    subtitle: 'Thirukkural · Adhikāram 49, Knowing the Fitting Time',
    bodyHtml: `
      <p>Tamil has no separate word standing in for English "if." Instead, a suffix — <em>-இன்</em> (or, after some stems, <em>-ஆயின்</em>) — attaches straight onto a verb to make it conditional on its own: செய் ("do") becomes செயின் ("if [one] does"), காண் ("see") becomes காணின் ("if [one] sees"). The whole clause "if he acts, with the right instruments, at the right time" needs no separate conditional particle at all — the single verb form <em>seyin</em> already carries "if...acts" packed into it.</p>
      <p>This adhikāram uses the pattern repeatedly and back to back — <em>kālam aṟindu seyin</em> ("if [one] acts, having known the time"), <em>iṭaththāl seyin</em> ("if [one] acts, by [the right] place"), <em>kāṇin</em> twice more a few couplets on — because its whole subject is contingency: action's success depends on timing, and Tamil's own conditional grammar is doing real rhetorical work here, not just decorating the point.</p>
    `,
  };
}

function buildEarthAndYouDeclensionNote() {
  return {
    title: 'One Word, Many Cases',
    subtitle: 'Soundarya Lahari · Verse 1',
    bodyHtml: `
      <p>Sanskrit nouns and pronouns change their ending depending on their grammatical role (case), not their word order the way English does — this opening verse gives two clean examples back to back.</p>
      <p><em>bhūmau</em> ("on the earth") and <em>bhūmi</em> ("the earth," inside <em>bhūmi-rē-vāvalambanam</em>, itself <em>bhūmiḥ + eva + avalambanam</em>, "the earth itself becomes the support") are the same noun, भूमि/bhūmi, in two different cases — locative and nominative. English keeps one word, "earth," and moves a preposition around it ("on the earth" / "the earth itself"); Sanskrit keeps the reference to case-endings and lets the ending itself carry that job.</p>
      <p>The same thing happens with the pronoun addressing the Goddess: <em>tvayi</em> ("against you," locative) and <em>tvam-eva</em> ("you alone," nominative + the enclitic <em>eva</em>, "indeed/alone") are both त्वम्/tvam, "you," declined two ways in the same line. See the site's own <a href="grammar.html">Sanskrit Grammar</a> page for the full 8-case pattern this follows.</p>
      <p>Worth watching for as you read on: <em>śivaḥ</em> (line 3) is unambiguously the god Śiva. <em>śivē</em> (line 2) looks like a one-letter case-shift of the same word, but it's usually the vocative of the <em>feminine</em> शिवा/Śivā — "O auspicious one," addressing the Goddess herself — a different word that happens to share a root, not a different case of this one. (Rarely, later in the poem, <em>śivē</em> resurfaces as the locative of this masculine word instead, meaning "toward Shiva" — same three letters, three possible readings, depending on gender and context.)</p>
      <p>And one thread that isn't a grammatical pattern but is worth noticing anyway: this verse invokes Hari, Hara, and Viriñca (Vishnu, Shiva, and Brahma) together as those who must worship the Goddess — and the very next verse turns immediately to Viriñca alone, showing him gathering dust from her feet to build the world with. The trio introduced here gets picked up one at a time as the poem continues.</p>
    `,
  };
}

function buildGenitivePluralAnaphoraNote() {
  return {
    title: 'One Ending, Four Classes of People',
    subtitle: 'Soundarya Lahari · Verse 3',
    bodyHtml: `
      <p>Verse 1 promised that Hari, Hara, and Viriñca — introduced together as a trio — would each get picked up by name as the poem continued; verse 2 delivers on it immediately: Viriñca (Brahma) gathers the dust explicitly, Śauriḥ ("descendant of Śūra," an epithet of Vishnu) bears it on his thousand heads, and Haraḥ (Shiva) grinds it into the ash he wears — the same three gods, one line each, now doing something with what the dust means rather than just praising it.</p>
      <p>Verse 3 turns that dust into a showcase of its own: four different kinds of people, each getting one line and one metaphor for what the dust does for them — अविद्यानाम् ("for the ignorant"), जडानाम् ("for the inert"), दरिद्राणाम् ("for the poor"), निमग्नानाम् ("for those sinking" in the ocean of rebirth). All four end in <em>-ānām</em>, Sanskrit's genitive plural ending — "of/belonging to [a class of] X" — attached to four completely unrelated stems in a row, the grammatical equivalent of a drumbeat. English has to reach for a fresh preposition each time ("for the ignorant," "for the inert"...); Sanskrit just repeats one ending and lets the parallelism do the work. See the site's own <a href="grammar.html">Sanskrit Grammar</a> page for where this ending sits among the other seven cases.</p>
    `,
  };
}

function buildKundaliniChakraNote() {
  return {
    title: 'Six Centers, One Ascent',
    subtitle: 'Soundarya Lahari · Verse 9',
    bodyHtml: `
      <p>This verse walks straight up the body's six energy centers (<em>cakras</em>) and the crown beyond them, one per phrase: <em>mūlādhāre</em> (root, base of the spine), <em>maṇipūre</em> (navel), <em>svādhiṣṭhāne</em> (sacral), <em>hṛdi</em> (heart), <em>ākāśam upari</em> ("space, above that" — the throat), <em>bhrūmadhye</em> (between the brows), and finally <em>sahasrāre padmē</em>, the thousand-petaled lotus at the crown. Each of the first six is traditionally paired with one of the five elements plus mind, in a fixed order: mūlādhāra-earth, svādhiṣṭhāna-water, maṇipūra-fire, anāhata (heart)-air, viśuddhi (throat)-space, ājñā (brow)-mind.</p>
      <p>Worth reading closely rather than skimming past: this verse's own word order doesn't quite match that standard list. <em>Hutavahaṃ sthitaṃ svādhiṣṭhāne</em> — "fire, situated in svādhiṣṭhāna" — reads fire into the sacral center, while the navel center gets only <em>kam api</em>, "a certain something," left unnamed. <em>Kam</em> is an old poetic word for water (it survives in a handful of Vedic riddle-verses); read that way, the verse quietly swaps water and fire from where tantric texts like the Lalitā Sahasranāma usually put them. Commentators have argued about this for centuries — whether it's a deliberate variant, a copying slip inherited from an early manuscript, or a discretion (water/generative fluid at the navel being a more sensitive thing to name outright than fire is) — and most reciters simply substitute the standard pairing by ear regardless of what the words literally say. Either way, it's a real crux in the text, not a translation smoothing it over.</p>
      <p><em>Kulapathaṃ</em>, "the path of the lineage" (line 37), is this tradition's name for the <em>suṣumṇā nāḍī</em> — the central channel the verse's whole ascent moves through, piercing each center in turn (<em>bhitvā</em>, "having pierced") rather than passing beside them.</p>
      <p>The verse ends where verse 1 began, only now enacted rather than stated: verse 1 opened by declaring that Śiva can only create when united with Śakti (<em>śivaḥ śaktyā yuktō... bhavati śaktaḥ prabhavituṃ</em>); here, at the top of that same ascent, she reaches the crown and sports <em>rahasi patyā</em> — "in secret, with her lord" — the union verse 1 stated as a general principle, now happening in one specific place.</p>
    `,
  };
}

function buildSriChakraGeometryNote() {
  return {
    title: 'The Geometry Behind the Verse',
    subtitle: 'Soundarya Lahari · Verse 11',
    bodyHtml: `
      <p>This verse is a construction manual in miniature. It counts out the Śrī Chakra piece by piece: four upward triangles (<em>śrīkaṇṭhaiḥ</em>, "Shiva's") and five downward ones (<em>śivayuvatibhiḥ</em>, "Shakti's") — nine in all, <em>navabhiḥ mūlaprakṛtibhiḥ</em>, "the nine root-natures" — interlocking to form forty-four corners (<em>chatuśchatvāriṃśat</em>), then wrapped in two lotus rings, three encircling lines, and three circles. The verse calls the whole structure your <em>śaraṇa</em>, "citadel" or "refuge" — the same root as verse 1's <em>śaraṇaṃ</em>, "the refuge," now spelled out as an actual floor plan.</p>
      <p>Why "forty-four" when nine interlocking triangles only cross at forty-three points? Commentators count the central point itself — the <em>bindu</em>, where the goddess is said to reside in her subtlest form — as the forty-fourth "corner," folding the one point that isn't really a corner into the tally of things this citadel contains.</p>
      <p>Later Śrī Vidya tradition organizes everything this verse lists into nine concentric enclosures (<em>āvaraṇas</em>), each with its own presiding form of the Goddess, read from the outside in: three encircling lines forming a walled square (<em>trailōkya-mōhana</em>), the sixteen-petaled lotus, the eight-petaled lotus, then four rings of triangles built from the nine-triangle mesh's forty-three corners — fourteen, ten, ten, and eight of them — and finally the single central triangle holding the bindu itself, where Lalitā Tripurasundarī, the "beautiful one of the three cities" this whole poem praises, is said to dwell. The verse itself only gives the raw count; this nine-tier reading of what that count means is the tradition built up around it afterward.</p>
      <p>Some commentators go a step further and read the forty-three triangles as a body: the same number as the thirty-six <em>tattvas</em> (the building blocks of manifest reality in this tradition's cosmology) plus the seven <em>dhātus</em> (the traditional bodily constituents — the tissues a body is said to be made of). On that reading the Śrī Chakra isn't just a diagram of the cosmos out there; it's a diagram of the person looking at it, which is very much in keeping with verse 9's route through the body's own chakras a few verses earlier.</p>
      <p>The site's own <a href="yantras.html">Yantras</a> page builds this exact nine-triangle mesh step by step from its underlying circles and triangles, if you want to see in a diagram what this verse is describing in words.</p>
    `,
  };
}

function buildTwoPartStructureNote() {
  return {
    title: 'A New Poem Begins Here',
    subtitle: 'Soundarya Lahari · Verse 42',
    bodyHtml: `
      <p>The line just before this verse — <em>dvitīya bhāgaḥ, saundaryalaharī</em>, "Second Part, the Wave of Beauty" — marks a real seam in the text, not just a label. Everything up to verse 41 (its own traditional name is <em>Ānanda Laharī</em>, "the Wave of Bliss") has been about the Goddess's subtle form: the chakras and kuṇḍalinī of verse 9, the Śrī Chakra's geometry of verse 11, mantra and tantra. From here through verse 100, the poem describes her physical form instead — and does it in a fixed order, a genre convention called <em>nakha-śikha-varṇana</em> ("toe-to-crown description," though this poem in fact works crown-to-toe): hair, forehead, eyebrows, eyes, and ears in the verses immediately ahead, then cheeks, lips, neck, arms, breasts, waist, and on down. Nothing about the Sanskrit changes at this seam — same meter, same grammar to untangle — but it's worth knowing you've crossed from one kind of poem into another.</p>
    `,
  };
}

function buildColophonAndAppendixNote() {
  return {
    title: 'The Poem Ends Here — Then Keeps Going',
    subtitle: 'Soundarya Lahari · Verse 100 / Appendix',
    bodyHtml: `
      <p>Verse 100 closes with its own final line comparing the hymn itself to waving a lamp at the sun or offering the ocean water drawn from the ocean — any praise of the Goddess, even hers, can only give back what already came from her. Right after it, the text includes its own colophon: <em>iti śrīmat-paramahaṃsa-parivrājakāchāryasya śrī-gōvinda-bhagavat-pūjyapāda-śiṣyasya śrīmach-chhaṅkara-bhagavataḥ kṛtau saundaryalaharī sampūrṇā</em> — "thus, in the work of the venerable Śaṅkara Bhagavatpāda, disciple of the worshipful Govinda Bhagavatpāda, the Saundarya Laharī is complete." Traditionally the poem is exactly 100 verses, and this line marks that count as finished.</p>
      <p>And then three more verses follow anyway, under their own heading: <em>anubandhaḥ</em>, "appendix." Most printed editions include them, but they're understood as a later addition rather than part of the original 100 — worth knowing as you read on, since the poem has already formally ended. They also carry something the first 100 verses don't: explicit <em>pāṭhabhēda</em> notes ("variant reading") recording places where manuscripts disagree on the exact wording, a small window into how differently this text has been transmitted over the centuries.</p>
    `,
  };
}

function buildNiAlliterationNote() {
  return {
    title: 'Ten Words, One Syllable',
    subtitle: 'Soundarya Lahari · Verse 103',
    bodyHtml: `
      <p>Read this verse's first three lines aloud and the pattern is hard to miss: <em>nidhē nityasmērē niravadhiguṇē nītinipuṇē nirāghātajñānē niyamaparachittaikanilayē niyatyā nirmuktē nikhilanigamāntastutipadē nirātaṅkē nityē</em> — ten words in a row, every one of them starting with <em>ni-</em>, before the verse finally relaxes into ordinary phrasing for its closing request (<em>nigamaya mamāpi stutim imām</em>, "accept this hymn of mine too"). This is alliteration used as structure, not just ornament — a display of the same virtuosity Sanskrit poets prized in devices like the maṭakku-style repetition seen elsewhere on this site (see Thirukkural's Adhikāram 30 note), just built from a shared initial sound instead of a repeated word.</p>
      <p>Most of these <em>ni-</em> words are the negating prefix <em>nir-/nis-</em> ("without, free from") fused onto a noun — <em>nirāghāta</em>, "without disturbance"; <em>nirātaṅka</em>, "without affliction." Sanskrit has more than one way to negate a word this way — verse 1's <em>akṛtapuṇyaḥ</em> ("one without merit") uses the other common prefix, <em>a-/an-</em>, just once in passing; here, a whole verse is built by leaning on <em>nir-</em> instead, turning a grammatical tool into the verse's entire sound.</p>
    `,
  };
}

function buildDualEndingAndParticipleChainNote() {
  return {
    title: 'A Pair, Praised as One',
    subtitle: 'Shivananda Lahari · Verses 1-2',
    bodyHtml: `
      <p>This poem opens by bowing not to Shiva alone but to Shiva-and-Pārvatī together, and its grammar says so before its meaning does: <em>kaḻābhyāṃ ... śaśikaḻābhyāṃ ... phalābhyāṃ ... phalābhyāṃ ... śivābhyāṃ ... śivābhyāṃ ... bhavābhyāṃ ... anubhavābhyāṃ</em> — eight words in four lines, every one of them ending in <em>-ābhyām</em>, the dual instrumental/dative ending Sanskrit reserves specifically for "the two of them." English has to keep repeating "the pair" or "both of them" to say what Sanskrit says once, structurally, by choosing this one ending and never letting go of it. <em>śivābhyām</em> itself appears twice — first the bare dual of शिव, then again as the last member of a compound (अस्तोकत्रिभुवनशिवाभ्यां, "abundant source of auspiciousness for all three worlds") — the same grammatical shape doing double duty.</p>
      <p>Verse 2 shifts to a different device for the same effect: <em>gaḻantī ... daḻantī ... patantī ... diśantī ... vasantī</em> — five feminine present participles in a row (flowing, breaking, falling, bestowing, dwelling), each one describing the wave of bliss the verse is building toward, which turns out at the very last word to be the poem's own name: <em>śivānandalaharī</em>, "the wave of Shiva-bliss" — the same phrase the whole book is titled after, woven into its own second verse. Naming a work inside itself like this is a real convention in Sanskrit devotional poetry, not a coincidence; it functions a bit like a composer's signature.</p>
    `,
  };
}

function buildBalaRakshaSignificanceNote() {
  return {
    title: 'Protection, All the Way Up',
    subtitle: 'Sri Bala Raksha Stotram · Spiritual Significance',
    bodyHtml: `
      <p><strong>Who is being asked.</strong> Bālā ("the girl") is Tripurasundarī in her youngest form — the goddess of the Śrī Vidyā tradition, pictured as a nine-year-old child. In many Śrī Vidyā lineages her three-syllable mantra is the first one an initiate receives, before the fuller mantras of Lalitā herself; she is the doorway into the whole practice. That shows in the text: verse 8 asks for <em>sarvāvaraṇa-vidyā</em>, the ritual knowledge of the Śrī Chakra's nine enclosures (the same āvaraṇas the Soundarya Lahari's verse 11 note describes), and for <em>deśikāṅghri-smṛti</em>, remembrance of the guru's feet. This is a prayer written from inside an initiated practice, not a general-purpose charm.</p>
      <p><strong>What "protection" turns out to mean.</strong> A rakṣā stotra is, by genre, a hymn asking a deity to guard the one who recites it. What makes this one worth studying is how far up it takes that request. It moves in clear stages:</p>
      <ul>
        <li><em>Verses 1-2</em> — outward harm: petty evils, the "nets" of the world's misfortunes.</li>
        <li><em>Verses 3-6</em> — inward harm: sin carried over from a hundred, then a thousand, earlier births, done knowingly or not, by oneself or one's own people.</li>
        <li><em>Verses 7-10</em> — the request turns positive: not only keep bad things away, but give good things — right action, communion with the deity, an unwavering mind, the state the gods themselves worship. The refrain <em>dēhi mē</em>, "grant me," takes over from <em>rakṣa</em>, "protect."</li>
        <li><em>Verses 11-14</em> — the circle widens outward to kin, dependents, benefactors, friends — and even the enemy, who is to be <em>turned into</em> a friend (<em>dviṣantam anukūlaya</em>) rather than defeated.</li>
        <li><em>Verses 15-18</em> — unconditioned bliss, unwavering devotion, and finally: lift me out of the ocean of worldly existence and set me at your feet.</li>
      </ul>
      <p>So by the last verse the danger being guarded against is no longer anything in the world — it is <em>bhava</em>, worldly existence itself. The tradition's point is that protection, followed far enough, becomes liberation: the fullest safety a goddess can give is to take the devotee out of the place where harm happens at all.</p>
      <p><strong>Two verbs for "protect."</strong> Notice the stotra alternates two different roots: <em>rakṣa</em> (from √rakṣ, "guard" — the word the whole genre is named for) and <em>pāhi</em> (from √pā, "keep, shelter" — the root Sanskrit grammarians traditionally derived <em>pitṛ</em>, "father," from: <em>pāti iti pitā</em>, "he who protects is the father"). Click either one to see where each falls.</p>
    `,
  };
}

function buildRamaRakshaSignificanceNote() {
  return {
    title: 'A Story Worn as Armor',
    subtitle: 'Sri Rama Raksha Stotram · Spiritual Significance',
    bodyHtml: `
      <p><strong>A hymn treated as a mantra.</strong> These first four lines are the <em>viniyoga</em>, the formal "specification" recited before a mantra is used. It names six things: the <em>ṛṣi</em> (the seer who first perceived it: Budhakauśika), the <em>devatā</em> (the deity it is addressed to: Sītā and Rāma together), the <em>chandas</em> (its meter: anuṣṭubh), the <em>śakti</em> (its power: Sītā), the <em>kīlaka</em> (its "pin" or lock: Hanumān), and the <em>viniyoga</em> proper (its purpose). A stotra that opens this way is claiming to be more than a poem of praise; it is presented as a working instrument. Hanumān as the kīlaka fits especially well: the pin that keeps the mantra's power fastened is the guardian-servant who never leaves Rāma's side.</p>
      <p><strong>Where it came from.</strong> Verse 15 gives the text's own origin story: Śiva (<em>Hara</em>) recited it to Budhakauśika in a dream, and he wrote it down on waking. So a Vaiṣṇava hymn is presented as a Śaiva teaching. Śiva appears as Rāma's own devotee, a bridge the tradition values; the famous closing verse (38) is Śiva speaking to Pārvatī (<em>varānane</em>, "fair-faced one"), the same verse he speaks to her at the close of the Viṣṇu Sahasranāma, telling her that one repetition of Rāma's name equals the thousand names.</p>
      <p><strong>The body as a map of the Rāmāyaṇa.</strong> Verses 4-9 are a true kavacham, walking head to feet, and each body part is given to a different title of Rāma that recalls an episode of his story. His forehead is guarded by the son of Daśaratha; the eyes by Kausalyā's son; the ears by Viśvāmitra's beloved; the arms by the one who broke Śiva's bow; the heart by the one who defeated Paraśurāma; the shins by the slayer of Rāvaṇa; the feet by the one who gave Vibhīṣaṇa his kingdom. Reciting the armor means retelling the epic onto one's own body, from Rāma's birth to his victory. Verse 14 names this armor the <em>vajrapañjara</em>, the "diamond cage."</p>
      <p><strong>The name itself protects.</strong> After the body map, the stotra's focus shifts from Rāma's form to his name: those guarded by "the names of Rāma" cannot even be seen by hostile beings (v.11); remembering "Rāma" brings both worldly enjoyment and liberation (v.12); the roar of "Rāma, Rāma" roasts the seeds of rebirth (v.36). This is the root of the <em>Rāma-nāma</em> devotion that runs through later Indian religion; a widely told tradition holds that Śiva whispers Rāma's name into the ears of the dying at Kāśī as the <em>tāraka</em> mantra, the one that "carries across." As with every rakṣā text, the protection being asked for widens as it goes: from demons (v.11), to sin (v.12), to rebirth itself (v.25: those who praise him "are no longer bound to the round of rebirth"), ending in v.37's plea, "O Rāma, lift me up."</p>
    `,
  };
}

function buildRamaCaseGarlandNote() {
  return {
    title: 'Rāma in Every Case',
    subtitle: 'Sri Rama Raksha Stotram · Verse 37 (with 16 and 36)',
    bodyHtml: `
      <p>This verse is a famous grammatical showpiece: it runs the name Rāma through all eight Sanskrit cases, in the traditional order, one per half-line:</p>
      <ul>
        <li><em>rāmō</em> rājamaṇiḥ... "Rāma is victorious": <strong>nominative</strong>, the subject</li>
        <li><em>rāmaṃ</em> ramēśaṃ bhajē, "I worship Rāma": <strong>accusative</strong>, the object</li>
        <li><em>rāmēṇ</em>ābhihatā, "struck down by Rāma": <strong>instrumental</strong>, the agent or means</li>
        <li><em>rāmāya</em> tasmai namaḥ, "salutation to that Rāma": <strong>dative</strong>, the recipient</li>
        <li><em>rāmān</em>nāsti parāyaṇam, "there is no refuge higher than Rāma": <strong>ablative</strong>, "than/from"</li>
        <li><em>rāmasya</em> dāsō'smi, "I am Rāma's servant": <strong>genitive</strong>, possession</li>
        <li><em>rāmē</em> chittalayaḥ, "mind dissolved in Rāma": <strong>locative</strong>, "in"</li>
        <li><em>bhō rāma</em> māmuddhara, "O Rāma, lift me up": <strong>vocative</strong>, direct address</li>
      </ul>
      <p>The devotional point rides on the grammar: Rāma is made the subject, object, means, recipient, source, owner, location, and finally the one addressed. The name fills every relationship a word can have to a sentence, and by implication every relationship the devotee can have to the world. The last case, the vocative, is the only one that speaks <em>to</em> him rather than about him, and it is where the verse ends. Click any boxed form of Rāma here to see the others. (The instrumental <em>rāmēṇa</em> and ablative <em>rāmāt</em> are sandhi-fused to the words after them, <em>rāmēṇābhihatā</em> and <em>rāmānnāsti</em>, so they can't be boxed separately.)</p>
      <p><strong>Two more wordplays in the same stotra.</strong> Verse 16 builds four words on the same root, √ram, "to delight, to rest": <em>ārāmaḥ</em> (a garden, "place of delight"), <em>virāmaḥ</em> (cessation, "the end" of calamities), <em>abhirāmaḥ</em> (delightful), and finally <em>rāmaḥ</em> himself. The prefix changes the sense each time, and the bare root, the name, comes last. Verse 36 is built on rhyme instead: <em>bharjanam</em> (roasting), <em>arjanam</em> (earning), <em>tarjanam</em> (terrifying), <em>garjanam</em> (roaring). The fourth word names what does the other three: the roar of "Rāma, Rāma."</p>
    `,
  };
}

function buildNarasimhaKavachamSignificanceNote() {
  return {
    title: 'The Protector Who Came for a Child',
    subtitle: 'Sri Narasimha Kavacham · Spiritual Significance',
    bodyHtml: `
      <p><strong>Why Narasimha.</strong> Narasimha, the Man-Lion, is the form of Viṣṇu that appeared for one purpose: to protect a devotee. The demon-king Hiraṇyakaśipu had won a boon that he could be killed by neither man nor beast, neither by day nor by night, neither indoors nor outdoors, by no weapon, neither on earth nor in the sky, and he turned his power against his own son Prahlāda, a child devoted to Viṣṇu. When the father struck a pillar and asked whether Prahlāda's god was in it, Narasimha burst out of the pillar, neither man nor beast, at twilight, on the threshold, and killed him on his lap with his claws. A kavacham addressed to Narasimha therefore calls on the one form of God that is, by its whole story, protection answering a devotee in danger. It is fitting that the kavacham is put in Prahlāda's own mouth (v.1): the child who was protected becomes the teacher of protection.</p>
      <p>Verse 8 compresses that theology into four words: <em>sarvagō'pi stambhavāsaḥ</em>, "though everywhere, he dwelt in the pillar." He was in the pillar because he is in everything. (Verse 13 names the demon he tore open as <em>Hiraṇyākṣa</em>, the brother whom Viṣṇu killed as the Boar, rather than Hiraṇyakaśipu; the text reads that way in this edition, whether as a conflation of the two brothers or an inherited variant.)</p>
      <p><strong>How the armor is built.</strong> The kavacham has a clear architecture:</p>
      <ul>
        <li><em>Verses 2-6</em>: a <em>dhyāna</em>, a visualization of the deity to be held in mind, three-eyed, embraced by Lakṣmī, with Garuḍa praising him.</li>
        <li><em>Verse 7</em>: "seat him in the lotus of your own heart, then recite." The protection begins from inside.</li>
        <li><em>Verses 7-16</em>: the body, head to feet, each part given to a different name. It ends by handing the whole body to the "thousand-headed Person" (<em>sahasraśīrṣā puruṣaḥ</em>), the opening words of the Ṛg Veda's Puruṣa Sūkta, so Narasimha is identified with the cosmic Person himself.</li>
        <li><em>Verses 17-19</em>: the space around the body, direction by direction (east, southeast, south, southwest, west, northwest, north, northeast). First the body is sealed, then the world around it.</li>
      </ul>
      <p><strong>A mantra hidden in the directions.</strong> Look at the names that guard the eight directions: <em>mahōgra</em>, <em>mahāvīra</em>, <em>mahāviṣṇu</em>, <em>mahājvāla</em>, <em>sarvatōmukha</em>, <em>nṛsiṃha</em>, <em>bhīṣaṇa</em>, <em>bhadra</em>, and then <em>mṛtyōr mṛtyuḥ</em>. These are, in order, the nine key words of Narasimha's most famous mantra, the <em>Mantrarāja</em>: <em>ugraṃ vīraṃ mahāviṣṇuṃ jvalantaṃ sarvatōmukham / nṛsiṃhaṃ bhīṣaṇaṃ bhadraṃ mṛtyumṛtyuṃ namāmyaham</em>. The directional armor is that mantra laid out around the body. (This also settles a variant: some copies read <em>bhūṣaṇavigrahaḥ</em>, "ornament-formed," in verse 18, but the mantra's <em>bhīṣaṇa</em>, "terrifying," is what belongs there.)</p>
      <p><strong>From danger to death to deathlessness.</strong> The last protection asked for (v.19) is from <em>saṃsāra-bhaya</em>, the fear of worldly existence itself, and it is given by the one called <em>mṛtyōr mṛtyuḥ</em>, "the death of Death." The phala-śruti that follows (vv.20-30) mixes the worldly (long life, wealth, cures for scorpion sting and belly-ache) with the ritual: the kavacham can be written on birch bark or a palm leaf and worn at the wrist (v.24), or recited over sacred ash or water. The "armor" is meant both to be spoken and, quite literally, to be worn.</p>
    `,
  };
}

function buildNarasimhaParticipleCascadeNote() {
  return {
    title: 'Fourteen Participles, One Lion',
    subtitle: 'Sri Narasimha Kavacham · Verse 31',
    bodyHtml: `
      <p>The kavacham closes on a single long verse in the <em>sragdharā</em> meter (21 syllables per line, in three groups of seven), and almost the whole verse is one device: fourteen present participles in a row, every one in the accusative ending <em>-antam</em>, all describing the lion before the verse finally reaches its verb, <em>namāmi</em>, "I bow."</p>
      <p><em>garjantaṃ garjayantaṃ ... sphōṭayantaṃ haṭhantaṃ / rūpyantaṃ tāpayantaṃ ... kṣēpayantaṃ kṣipantam / krandantaṃ rōṣayantaṃ ... saṃharantaṃ bharantaṃ / vīkṣantaṃ ghūrṇayantaṃ ...</em></p>
      <p>Several come in pairs that show off Sanskrit's causative, an <em>-aya-</em> inserted into the verb stem that turns "doing" into "making someone do": <em>garjantam</em>, "roaring," next to <em>garjayantam</em>, "making [others] roar"; <em>kṣipantam</em>, "hurling," beside <em>kṣēpayantam</em>, "causing to be hurled." The one that matters most theologically is the pair in the third line: <em>saṃharantam</em>, "destroying," immediately followed by <em>bharantam</em>, "sustaining." The same terrifying form that destroys the demons is the one holding the world up.</p>
      <p>Compare the Shivananda Lahari's second verse, which uses the same technique on a smaller scale: five feminine participles in a row. Stacking participles lets a Sanskrit poet delay the main verb, so the listener sees the deity in motion before being told what to do about it. Here the delay is fourteen actions long, and the release is the simplest possible response: "I bow."</p>
    `,
  };
}

function buildKrishnaRakshaSignificanceNote() {
  return {
    title: 'When the Mothers Protect God',
    subtitle: 'Sri Krishna Raksha (Gopi Krta) · Spiritual Significance',
    bodyHtml: `
      <p><strong>The scene.</strong> These eight verses come from the Bhāgavata Purāṇa (10.6.22-29). The demoness Pūtanā has just tried to kill the infant Kṛṣṇa by nursing him with poisoned milk, and he has sucked the life out of her instead. The cowherd women of Vraja rush in, find the baby playing on her corpse, and do what any village mothers would do: they perform a protective rite over him. They wave a cow's tail around him and mark twelve places on his body, each with one of Viṣṇu's twelve names (the same twelve that the Vishnu Raksha Stotram calls a "cage"). They touch the names onto their own bodies and then onto his, and recite this.</p>
      <p><strong>The paradox the tradition loves.</strong> The names they call on (Aja, Acyuta, Keśava, Viṣṇu, Govinda, Mādhava, Nārāyaṇa) are all names of the child in their arms. The gopīs are asking Viṣṇu to protect Viṣṇu. Bhāgavata commentators treat this as the point rather than a slip: their love is <em>vātsalya</em>, parental love, so complete that it hides his divinity from them, and he lets it. In this tradition, God preferring to be protected by those who love him over being praised by those in awe of him is one of the highest forms devotion can take.</p>
      <p><strong>How thoroughly they cover him.</strong> The protection is laid over the child in widening layers:</p>
      <ul>
        <li><em>Verse 1</em>: the body, from the feet up to the head (<em>kam</em>, an old word for "head").</li>
        <li><em>Verse 2</em>: the space around him, in front, behind, at the sides and corners, above, below, and all around.</li>
        <li><em>Verses 3-4</em>: his inner faculties: senses, breath, consciousness, mind, intellect, self.</li>
        <li><em>Verses 4-5</em>: his activities, playing, sleeping, walking, sitting, eating. He is guarded not only in space but through the whole day.</li>
      </ul>
      <p><strong>What they are afraid of.</strong> Verses 6-8 name the enemies, and the list reads like a pediatric textbook, because in a sense it is one. The <em>bāla-grahas</em> or "child-seizers" (Revatī, Jyeṣṭhā, Pūtanā herself, the Mātṛkās) are the spirits that Āyurveda's pediatrics (<em>kaumārabhṛtya</em>) held responsible for childhood fevers, convulsions (<em>apasmāra</em>), and wasting. The final line turns on a pun: all these <em>grahas</em>, "seizers" (from √grah, "to seize"), flee in terror at the <em>grahaṇa</em>, the "seizing" (that is, the uttering) of Viṣṇu's name. The name takes hold before they can.</p>
      <p>Two more verbs for "protect" appear here besides <em>pātu</em>: <em>avyāt</em> and <em>avatu</em>, both from a third root, √av. (They are glued by sandhi to the words before them, as in <em>nārāyaṇō'vatu</em>, so they can't be boxed.)</p>
    `,
  };
}

function buildShivaRakshaSignificanceNote() {
  return {
    title: 'The Mirror of the Rama Raksha',
    subtitle: 'Sri Shiva Raksha Stotram · Spiritual Significance',
    bodyHtml: `
      <p><strong>One template, two gods.</strong> Read this beside the Rama Raksha Stotram and the resemblance is unmistakable, often word for word:</p>
      <ul>
        <li>v.1 <em>charitaṃ dēvadēvasya</em>, "the story of the god of gods," answers Rama Raksha v.1's <em>charitaṃ raghunāthasya</em>, "the story of the lord of the Raghus."</li>
        <li>v.9 <em>ētāṃ śivabalōpētāṃ rakṣāṃ yaḥ sukṛtī paṭhēt</em> is Rama Raksha v.10 exactly, with <em>śiva</em> in place of <em>rāma</em>.</li>
        <li>v.11's "named Abhayaṅkara... whoever wears it at the throat" mirrors Rama Raksha v.13-14's "named Vajrapañjara... whoever wears it at the throat."</li>
        <li>v.12, the origin story, is the most striking: <em>Nārāyaṇa</em> teaches this Śiva-shield in a dream, and the yogi Yājñavalkya writes it down at dawn. In the Rama Raksha it is the other way round: <em>Śiva</em> teaches the Rāma-shield in a dream to Budhakauśika.</li>
      </ul>
      <p>Each god hands down the other's armor. Whichever text came first, the pairing says something the tradition says often: Viṣṇu and Śiva are each other's devotees, and a protection-hymn to either one is taught by the other. (Its alternative title, <em>Abhayaṅkara Kavacham</em>, means "the armor that makes one fearless.")</p>
      <p><strong>The epithet fits the body part.</strong> This kavacham's body map is more carefully matched than most. The name chosen to guard each part is usually the one whose story involves that part:</p>
      <ul>
        <li>the <em>neck</em> is guarded by Śitikandhara, "the dark-necked," whose throat turned blue when he drank the world-poison;</li>
        <li>the <em>throat</em> by Śrīkaṇṭha, "the beautiful-throated";</li>
        <li>the <em>tongue</em> by Vāgīśvara, "the lord of speech";</li>
        <li>the <em>head</em> by Gaṅgādhara, who catches the Ganges in his hair, and the <em>forehead</em> by the one who wears the crescent moon there;</li>
        <li>the <em>hands</em> by the bearer of the Pināka bow; the <em>hips</em> by the one who wears the tiger skin at his waist.</li>
      </ul>
      <p><strong>Where it leads.</strong> The reward promised in verse 9 is <em>śiva-sāyujya</em>, "union with Śiva," the Śaiva name for liberation. As with the Rama Raksha, the shield that starts by warding off ghosts and planets ends by delivering the reciter into the god himself.</p>
    `,
  };
}

function buildVishnuRakshaSignificanceNote() {
  return {
    title: 'The Cage of Twelve Names',
    subtitle: 'Sri Vishnu Raksha Stotram · Spiritual Significance',
    bodyHtml: `
      <p><strong>A daily practice, in its source text.</strong> This passage from the Nārada Purāṇa, taught by the sage Sanatkumāra, calls itself the <em>nāma-dvādaśa-pañjara</em>, "the cage of the twelve names," and it is "without a single gap" (<em>niśchidram</em>, v.126). The twelve names are the ones every Vaiṣṇava knows: Keśava, Nārāyaṇa, Mādhava, Govinda, Viṣṇu, Madhusūdana, Trivikrama, Vāmana, Śrīdhara, Hṛṣīkeśa, Padmanābha, Dāmodara. They are recited in the daily sipping-purification (<em>ācamana</em>), and they are the names spoken when the twelve <em>ūrdhvapuṇḍra</em>, the vertical tilaka marks, are drawn on twelve points of the body each morning. This passage is the scriptural form of that practice: placing God's names on the body as protection.</p>
      <p><strong>Two passes.</strong> The armor goes on twice:</p>
      <ul>
        <li><em>Verses 114-117</em>: on the body, one name per part, in the canonical order of the twelve. Where the Rama, Shiva, Narasimha, and Shani texts all go head to foot, this one (like the gopīs' Krishna Raksha) starts at the <em>feet</em> (Keśava) and ends at the <em>head</em> (Dāmodara), building the protection upward from the ground. (The heart's guardian here is <em>Nara</em>, where the standard list has Vāmana; the text is kept as it reads.)</li>
        <li><em>Verses 119-125</em>: "place them once more, meditating": the same names are set around the body, each with its own weapon and color (Keśava in front with the discus, gleaming like river gold; Nārāyaṇa behind with the conch, dark as a rain cloud; and so on through the directions, above, and below), making a ring of armed, luminous guardians.</li>
      </ul>
      <p>Then verse 125 closes it in both directions at once: may Dāmodara Hari guard the body <em>bāhyābhyantare</em>, "outside and within." Only then does the reciter say, in the first person, "I have entered it; no fear can ever touch me."</p>
      <p><strong>A link to Narasimha.</strong> The chapter this comes from is about the mantras of Narasimha, and its last verse says this cage of names is "the rule for all the groups of mantras of the Man-Lion" (<em>nṛharēḥ</em>). So it was taught as the protective frame placed around Narasimha worship, which connects it to the Narasimha Kavacham in the Kavachams section.</p>
    `,
  };
}

function buildHanumadRakshaSignificanceNote() {
  return {
    title: 'Protection by Beholding',
    subtitle: 'Sri Hanumad Raksha Stotram · Spiritual Significance',
    bodyHtml: `
      <p><strong>A rakṣā without a body map.</strong> Unlike the other texts here, this "protection hymn" never asks Hanumān to guard a single limb. It is six <em>dhyāna</em> verses, six portraits to be held in the mind. In this tradition, visualizing the protector clearly <em>is</em> the protection: to hold Hanumān's form steadily before the inner eye is to stand in his presence. Each verse paints a different aspect:</p>
      <ul>
        <li><em>v.1</em>: the warrior, with the mountain that shatters enemies in one hand (recalling the mountain of healing herbs he carried to revive Lakṣmaṇa) and a chisel that cuts chains in the other;</li>
        <li><em>v.2</em>: the jeweled one, seated in a grove of golden plantains, the <em>kadalī-vana</em> the Mahābhārata places him in when Bhīma meets him on the road;</li>
        <li><em>v.3</em>: the radiant scholar, "master of every science";</li>
        <li><em>v.4</em>: the joy of Rāma's heart, his hands showing the gestures of fearlessness and boon-giving;</li>
        <li><em>v.5</em>: the fighter who crushed Rāvaṇa's hands;</li>
        <li><em>v.6</em>: the humble servant, palms joined in reverence.</li>
      </ul>
      <p>The sequence moves from power to devotion: the last image is not the warrior but the servant with folded hands. In the Rama Raksha, Hanumān is named as its <em>kīlaka</em>, the pin that holds its power fast. His own hymn suggests why: his strength is entirely in the service of someone else.</p>
      <p><strong>One word, three animals.</strong> The last word the verse gives Hanumān is <em>hariṃ</em>, and here <em>hari</em> means "monkey." It is the same word that means <em>Viṣṇu</em> in the Krishna Raksha (<em>harir astu paśchāt</em>, "may Hari be behind you") and "lion" inside Narasimha's name <em>nṛhari</em>, "man-lion." The underlying sense is a color: the tawny, yellowish-green shared by the lion's mane, the monkey's fur, and the gold of Viṣṇu's garment. Because the same form means such different things from text to text, it is deliberately left unlinked here.</p>
    `,
  };
}

function buildShaniRakshaSignificanceNote() {
  return {
    title: 'Asking the Feared One to Guard',
    subtitle: 'Sri Shani Raksha Stava · Spiritual Significance',
    bodyHtml: `
      <p><strong>A protector who is also the danger.</strong> Śani, the planet Saturn, is the most feared of the nine grahas in Indian astrology; his slow passage through a birth chart, above all the seven-and-a-half-year <em>sāḍhe-sātī</em>, is associated with hardship, delay, and loss. What makes this hymn distinctive is whom it asks for protection: not a god against Śani, but Śani himself. That is the logic of navagraha worship in general. The planets are not enemies to be defeated but powers to be honored, and the planet that could afflict is the one best placed to spare.</p>
      <p><strong>His story in his names.</strong> Each part of the body is guarded by an epithet that carries Śani's mythology:</p>
      <ul>
        <li><em>Bhāskari</em> and <em>Ravinandana</em>, "son of the Sun," and <em>Chāyāsuta</em>, "son of Chāyā," Shadow, the wife the Sun took in his first wife's absence;</li>
        <li><em>Kōṭarākṣa</em>, "hollow-eyed," and <em>Śikhikaṇṭhanibha</em>, "dark as a peacock's neck," his dark blue form;</li>
        <li><em>Saṃvartaka</em>, "the dissolver," the fire at the end of an age;</li>
        <li><em>Mandagati</em> and <em>Śanaiśchara</em>, "the slow-goer" (<em>śanaiḥ</em>, "slowly" + <em>chara</em>, "moving"). His very name is astronomy: Saturn is the slowest planet visible to the naked eye, taking about 29.5 years to circle the sky.</li>
      </ul>
      <p><strong>Built on the Rama Raksha.</strong> The body map follows the Rama Raksha almost part for part (head, forehead, eyes, ears, nose, mouth, shoulders, arms, heart, navel, hips, feet, and finally "the whole body," <em>akhilaṃ vapuḥ</em>), and the closing promise, <em>sukhī putrī chirāyuḥ</em>, "happy, blessed with children, long-lived," repeats Rama Raksha v.10 nearly word for word. The Rama Raksha served as a model that other rakṣā hymns were built on.</p>
      <p><strong>The body as the mantra's home.</strong> Before the hymn proper comes a short <em>ṛṣyādinyāsa</em>: the reciter touches the head while naming the seer (Sindhudvīpa), the mouth while naming the meter, and the heart while naming the deity. The mantra's lineage is placed on the body in a logical order: its origin at the head, its sound at the mouth, its god in the heart. Then the whole body is dedicated to the purpose.</p>
    `,
  };
}

function buildAshtamurtiSignificanceNote() {
  return {
    title: 'Up the Elements and Back Down',
    subtitle: 'Ashtamurti Raksha Stotram · Spiritual Significance',
    bodyHtml: `
      <p><strong>Śiva's eight forms.</strong> The <em>aṣṭamūrti</em>, "eight forms," are the classical list of the ways Śiva is present in the visible world: the five elements (earth, water, fire, wind, space), the sun, the moon, and the <em>yajamāna</em>, the one who offers sacrifice, the conscious self. Kālidāsa opens his play <em>Śākuntalam</em> with a blessing that names exactly these eight as the Lord's eight visible bodies, and that blessing is itself a protection prayer: it ends <em>avatu vas tābhir aṣṭābhir īśaḥ</em>, "may the Lord protect you with these eight." To ask the Aṣṭamūrti for protection is to ask to be held by the whole universe, understood as the god's own body.</p>
      <p><strong>The five element temples.</strong> The first five verses go further and place each element at one of the <em>Pañcabhūta Sthalas</em>, the five great Śiva temples of South India, four of them in Tamil Nadu, where Śiva is worshipped as that element:</p>
      <ul>
        <li><em>Earth</em>: Kāñcīpuram (v.1). The verse calls him <em>saugandhya</em>, "fragrant," because in Indian philosophy smell is the quality that belongs to earth alone.</li>
        <li><em>Water</em>: Jambukeśvaram at Tiruvānaikkāval (v.2), "wet with compassion, forever bathed"; the liṅga there stands in a perpetual underground spring.</li>
        <li><em>Fire</em>: Aruṇācala at Tiruvaṇṇāmalai (v.3), "the fire at the end of time," smeared with ash, who burned Kāma.</li>
        <li><em>Wind</em>: Śrī Kāḷahasti (v.4), addressed by the old Vedic name of the wind-god, <em>Mātariśvan</em>.</li>
        <li><em>Space</em>: Chidambaram (v.5), "lord of the Hall of Consciousness," whose body is "like the partless sky." His dwelling is the <em>dahara</em>, the Upaniṣads' "small space within the heart."</li>
      </ul>
      <p><strong>A ladder climbed, then descended.</strong> Notice the order. Verses 1-5 go from the grossest element to the subtlest (earth, water, fire, wind, space), the direction a meditator travels inward, dissolving each element into the next. Verse 9 then comes back down in the opposite direction, and in words taken almost straight from the Taittirīya Upaniṣad (2.1): "from the Self, space was born; from space, wind; from wind, fire; from fire, water; from water, earth." The hymn climbs up through the elements to the Self and then walks back down the way creation came. The last line calls all eight forms <em>saṃvinmaya</em>, "made of pure awareness": the world that protects the devotee is consciousness itself.</p>
    `,
  };
}

function buildBalaKrishnaKavachamSignificanceNote() {
  return {
    title: 'A Father’s Armor',
    subtitle: 'Bala Krishna Raksha Kavacham · Spiritual Significance',
    bodyHtml: `
      <p><strong>The same night, told twice.</strong> This is the Viṣṇu Purāṇa's telling (5.5) of the moment the Bhāgavata Purāṇa tells in the gopīs' Krishna Raksha (see the Raksha Stotrams section): the demoness Pūtanā has died at the infant's mouth, and the family shields the child. In the Bhāgavata, the protection is spoken by the mothers of Vraja. Here, Yaśodā waves a cow's tail over him and Nanda the cowherd, his foster-father, places a little cow-dung on his head and speaks this kavacham. Two Purāṇas, two parents, one gesture.</p>
      <p><strong>Protected by his own deeds.</strong> Nanda's first four verses don't name body parts. They call on four great acts of Viṣṇu: the lotus rising from his navel from which the world was made; the Boar lifting the earth on its tusk; the Man-Lion tearing open the demon's chest; the dwarf Vāmana becoming Trivikrama and crossing the three worlds in three strides. Each was a moment when Viṣṇu saved the world. Nanda, not knowing, invokes them over a baby who is Viṣṇu. The child is guarded by his own past (and, as avatars, future) rescues: the same paradox as in the gopīs' text, where Viṣṇu's names protect Viṣṇu.</p>
      <p><strong>From the body outward.</strong> Then comes the kavacham proper: head, throat, belly, shins and feet (v.18), face, arms, mind, and senses (v.19), the conch-blast that scatters every hostile spirit (v.20), and finally the directions (v.21): the four quarters, the four in-between, the sky above, and the earth below. The last guardian is <em>Mahīdhara</em>, "bearer of the earth," the Boar again, placed at the ground beneath the child, returning to verse 15's image.</p>
      <p>(sanskritdocuments.org also carries this same passage, with the Purāṇa's narrative verses around it, as the <em>Bālagraharakṣāstotram</em>; that copy is too scan-damaged to use, so this clean one stands for both.)</p>
    `,
  };
}

function buildVakratundaKavachamSignificanceNote() {
  return {
    title: 'The Lord of Obstacles, Head to Foot',
    subtitle: 'Vakratunda Ganesha Kavacham · Spiritual Significance',
    bodyHtml: `
      <p><strong>Protection as the removal of obstacles.</strong> Gaṇeśa is <em>Vighneśvara</em>, lord of obstacles: the one who places them and the one who removes them, which is why he is worshipped before any undertaking begins. A Gaṇeśa kavacham therefore protects in a particular way: not by fighting enemies but by clearing the path. The name in the title, <em>Vakratuṇḍa</em>, "the one with the curving trunk," is the first of Gaṇeśa's eight incarnations in the Mudgala Purāṇa, the one who subdues the demon of envy. Several of the other seven (Ekadanta, Lambodara, Gajānana, Vighnarāja) also appear in this kavacham as guardians.</p>
      <p><strong>His body guards yours.</strong> As in the Shiva Raksha, the epithets are chosen to fit the part they guard, often by Gaṇeśa's own anatomy:</p>
      <ul>
        <li>the <em>eyes</em>, by the three-eyed one; the <em>ears</em>, by <em>Śūrpakarṇa</em>, "winnowing-fan ears";</li>
        <li>the <em>mouth</em>, by <em>Gajānana</em>, "elephant-faced";</li>
        <li>the <em>waist</em>, by <em>Lambodara</em>, "pot-bellied";</li>
        <li>the <em>shins</em>, by the rider of the mouse; the <em>feet</em>, by the one seated in lotus posture.</li>
      </ul>
      <p>Then the directions (front, behind, sides, everywhere between), and then, as in the gopīs' Krishna Raksha, the activities of a day: "walking or standing, waking, sleeping, or eating." Protection covers space and time together.</p>
      <p><strong>A number written in words.</strong> Verse 11 prescribes chanting the mantra <em>rasa-lakṣam</em> times. <em>Lakṣa</em> is 100,000; <em>rasa</em>, "taste," stands for 6, because Indian thought counts six tastes. So "taste-lakh" means 600,000. This is <em>bhūtasaṅkhyā</em>, the Sanskrit custom of writing numbers in verse with object-words ("eyes" = 2, "Vedas" = 4, "tastes" = 6). It is a different system from Āryabhaṭa's syllable-based numerals on the site's Āryabhaṭa numeration page, but it serves the same purpose: making numbers fit a meter. The verse also names Gaṇeśa's day: <em>chaturthī</em>, the fourth day of the lunar fortnight, on which this kavacham is to be recited.</p>
    `,
  };
}

function buildRaghavendraKavachamSignificanceNote() {
  return {
    title: 'Protected by a Saint',
    subtitle: 'Sri Raghavendra Raksha Kavacham · Spiritual Significance',
    bodyHtml: `
      <p><strong>A human protector.</strong> Every other kavacham here calls on a god. This one calls on a guru: Rāghavendra Tīrtha (1595-1671), the Mādhva saint and scholar who, in 1671, entered his <em>vṛndāvana</em>, his tomb-shrine at Mantrālayam on the Tuṅgabhadrā river, while still alive. His devotees hold that he remains present there, and this is the key to the text. Verse 2 says the kavacham "brings about his presence" (<em>sannidhi</em>), and verse 22 ends by asking protection from "the guru whose presence I have invoked." For his devotees, the saint is a living presence, and the kavacham is how he is called.</p>
      <p><strong>Back to Narasimha.</strong> Verse 10 gives the throat to "the foremost devotee of <em>kaṇṭhīrava</em>," a poetic word for the lion ("the one who roars from the throat"), meaning Narasimha. There is a pun (the <em>throat</em> is guarded by the devotee of the <em>throat</em>-roarer), and there is a deeper link. Rāghavendra's devotees hold that in an earlier life he was Prahlāda, the child Narasimha came to save and the speaker of the Narasimha Kavacham in the Kavachams section.</p>
      <p><strong>The most thorough body map here.</strong> Where most kavachams name 15 or 20 body parts, this one names more than 30: topknot, head, forehead, brows, beard, eyes, ears, cheeks, lips, nose, tongue, teeth, chin, face, throat, shoulders, arms, hands, fingers, chest, belly, sides, back, hips, thighs, knees, shins, ankles, feet. Then it adds a catch-all (v.14): "whatever part of me I have not named here, may the compassionate one guard all of it." The epithets echo his reputation as a healer. The giver of sight guards the eyes, the remover of deafness the ears, the giver of speech the tongue, the giver of food the teeth.</p>
      <p><strong>Protection through relics.</strong> Verses 16-17 name the saint's physical traces as protectors: his staff (<em>daṇḍa</em>), the dust of his feet, the water that has washed his feet, and "that clay" (<em>mṛttikā</em>), the sacred earth from his shrine that pilgrims carry home from Mantrālayam to this day. A god protects through his names and forms; a saint protects, as well, through the things he touched.</p>
      <p><strong>A living genre.</strong> The author, Kṛṣṇāvadhūta Paṇḍita, is modern, and he names himself in verse 2 as the guru's "beloved son." The kavacham form (seer, meter, meditation, directions, body, family, dangers, blessings, phala-śruti) is still being written, and still used to bring a living tradition's protector close.</p>
    `,
  };
}

function buildPancharakshaSignificanceNote() {
  return {
    title: 'Five Protective Goddesses',
    subtitle: 'Pancharaksha Devi Stotrani (Buddhist) · Spiritual Significance',
    bodyHtml: `
      <p><strong>The genre crosses traditions.</strong> Protection-literature is not only Hindu. Mahāyāna Buddhism has its own great rakṣā collection, the <em>Pañcarakṣā</em>, "the Five Protections": five <em>dhāraṇī</em> scriptures, each centered on a protective spell taught by or connected to the Buddha. Over time each spell was personified as a goddess. In Nepal's Newar Buddhist tradition the Pañcarakṣā became one of the most frequently copied of all manuscripts, kept in homes and recited for protection. The word <em>dhāraṇī</em> means "that which holds," from √dhṛ, the same root as <em>dhārayet</em>, "should wear," in the Rama Raksha's "whoever wears it at the throat."</p>
      <p><strong>Every verse tells a story.</strong> Each of these five short hymns alludes, verse by verse, to episodes told in its goddess's scripture:</p>
      <ul>
        <li><em>Mahāpratisarā</em>, "the great amulet" (a <em>pratisara</em> is a protective cord tied on the body): Indra winning his war with her spell on his banner, King Brahmadatta gaining his kingdom, a condemned criminal saved and raised to rule, merchants who remembered her brought safely back from the sea with their jewels.</li>
        <li><em>Mahāmantrānusāriṇī</em>, "she who follows the great mantra": protection from the six <em>ītis</em>, the classic agricultural calamities of flood, drought, locusts, rats, birds, and invading armies.</li>
        <li><em>Mahāmāyūrī</em>, "the great peahen": safety even beside a black serpent (her scripture's frame story is a monk saved from a snakebite by her spell), and the golden peacock who chanted her spell and could not be caught by any snare.</li>
        <li><em>Mahāśītavatī</em>, "she of the cool grove," which is a euphemism for the charnel ground: the Buddha's own son Rāhula, harassed by spirits, protected by her spell; knotted threads worn as amulets.</li>
        <li><em>Mahāsāhasrapramardinī</em>, "crusher of the great thousand [worlds]": the city of Vaiśālī delivered from plague, the Buddha himself shielded from poison.</li>
      </ul>
      <p><strong>Familiar shapes.</strong> Side by side with the Hindu texts in this section, the parallels stand out: spells worn as knotted threads or written amulets (compare the Narasimha Kavacham's birch-bark amulet), lists of seizing spirits and epidemics, and a protection that ends in liberation. Mahāmāyūrī, verse 5, calls the goddess "giver of awakening to the Buddhas": the final protection, here as elsewhere, is from ignorance itself.</p>
    `,
  };
}

function buildRakshaKalaKaraSignificanceNote() {
  return {
    title: 'The Lord Who Looks Down',
    subtitle: 'Raksha Kala Kara Stava (Buddhist) · Spiritual Significance',
    bodyHtml: `
      <p><strong>Avalokiteśvara.</strong> This hymn is addressed to the bodhisattva of compassion, Avalokiteśvara, "the lord who looks down" on the suffering of the world. He is called here by the names he is known by in Nepal: <em>Lokanātha</em> and <em>Lokanāyaka</em>, "lord" and "guide of the world." Thirteen of its fifteen verses close on the same refrain, <em>rakṣa māṃ lokanāyaka</em>, "protect me, O guide of the world."</p>
      <p><strong>A story from the Kathmandu Valley.</strong> Verse 2 anchors the hymn in a specific place and legend: "in Nepal, for twelve years, the rains failed." The story Newar Buddhists tell is that a great drought struck the valley, and King Narendradeva, with the priest Bandhudatta, journeyed to Kāmarūpa (in Assam) and brought back Avalokiteśvara in the form of Karuṇāmaya, "made of compassion," after which the rains returned. The event is still re-enacted every year in the chariot festival of Bunga-dyaḥ, also called Rato Machindranāth, in Patan. It is the longest-running chariot procession in Nepal, and Hindus and Buddhists alike worship the same deity at its center. Verse 6's "you are made of all the gods, and of all the Buddhas" reflects that shared devotion.</p>
      <p><strong>A bodhisattva's promise.</strong> Verse 9 turns the plea into something larger: "until every being has reached Sukhāvatī" (the Pure Land of bliss), "so long, in this pit of rebirth, protect me." This echoes the bodhisattva's own vow to remain in the world until all beings are freed. The protection asked for lasts as long as his compassion does.</p>
      <p><strong>Ending on his name.</strong> The last verse, as best it can be read (its first half is damaged in the source), asks that his <em>glance</em> fall on the devotee always. That is the meaning of his name: <em>avalokita</em>, "looked upon." The hymn closes by asking the Lord Who Looks Down to do exactly that.</p>
      <p><em>A note on the language:</em> this is Nepalese Buddhist Sanskrit, which freely uses forms that classical grammar would not (the <em>-ka</em> endings of <em>śatrukaḥ</em>, "enemy," and <em>sarvasattvakam</em>, "all beings," for instance). These are features of the tradition, not errors, and they are kept as they stand. Verse 12's opening words are obscure and are translated by their evident sense.</p>
    `,
  };
}

function buildDeviKavachamSignificanceNote() {
  return {
    title: 'A Ring of Goddesses',
    subtitle: 'Sri Durga Kavacham (Devi Kavacham) · Spiritual Significance',
    bodyHtml: `
      <p><strong>The gateway to the Durgā Saptaśatī.</strong> This is the kavacham most people mean by "Durga Kavach." It is the first of three preparatory texts (Kavacha, Argalā, Kīlaka) recited before the <em>Durgā Saptaśatī</em>, the seven hundred verses of the Devī Māhātmya that tell of the Goddess's victories over the demons. Verse 53 says so directly: "let one recite the Saptaśatī, the Chaṇḍī, having first recited the armor." Before entering the story of the Goddess's battles, the reciter puts on her armor.</p>
      <p><strong>The nine Durgās (vv.3-5).</strong> Brahmā opens with a list that has become one of the best known in Hindu practice: Śailaputrī, Brahmachāriṇī, Chandraghaṇṭā, Kūṣmāṇḍā, Skandamātā, Kātyāyanī, Kālarātri, Mahāgaurī, Siddhidātrī, the <em>Navadurgā</em>. These are the nine forms worshipped one per night through the nine nights of Navarātri, and this kavacham is the standard source for their names and their order.</p>
      <p><strong>The Mothers (vv.9-15).</strong> Then come the <em>Mātṛkās</em>, each on her mount: Chāmuṇḍā on a corpse, Vārāhī on a buffalo, Aindrī on an elephant, Vaiṣṇavī on Garuḍa, Māheśvarī on a bull, Kaumārī on a peacock, Brāhmī on a swan. They are the powers (<em>śaktis</em>) of the male gods (Indra, Viṣṇu, Śiva, Skanda, Brahmā, Viṣṇu's Boar), and in the Devī Māhātmya they stream out of those gods to fight beside the Goddess. Here they ride out in chariots, armed, "for the fearlessness of devotees."</p>
      <p><strong>All the guardians are goddesses.</strong> The frame is male (Brahmā speaks it to the sage Mārkaṇḍeya, and the colophon credits Hari, Hara, and Brahmā together), but every one of the dozens of guardians it names is feminine. First the ten directions (east to northeast, then above and below), then the four sides (Jayā, Vijayā, Ajitā, Aparājitā, "Victory," "Triumph," "Unconquered," "Undefeated"), then the body. Among them is <em>Nārasiṃhī</em>, the female Man-Lion, guarding the ankles: the Narasimha of the Kavachams section, in the Goddess's form.</p>
      <p><strong>True to its genre's name.</strong> Where the Rama Raksha and Narasimha Kavacham ask again and again with <em>pātu</em> (√pā), this kavacham almost never does. Its verbs come from √rakṣ, the root that gives the genre its name: <em>rakṣa</em>, <em>rakṣatu</em>, <em>rakṣet</em>. Verse 43 states the practice plainly: "one should not take a single step without the armor."</p>
    `,
  };
}

function buildDeviKavachamWholePersonNote() {
  return {
    title: 'From the Topknot to the Three Guṇas',
    subtitle: 'Sri Durga Kavacham (Devi Kavacham) · Verses 21-42',
    bodyHtml: `
      <p>Every kavacham maps the body. This one maps the whole person, and it keeps going long after the other texts stop. Follow verses 21-42 in order and the protection moves steadily inward, then back outward into the world:</p>
      <ul>
        <li><strong>The body's surface</strong> (vv.21-33): topknot, crown, forehead, brows, nose, eyes, ears, cheeks, lips, tongue, teeth, throat, uvula, palate, chin, even <em>speech</em>, then down to the toes and the soles of the feet, and finally nails, hair, pores, and skin.</li>
        <li><strong>The tissues</strong> (vv.34-36): blood, marrow, grease, flesh, bone, fat, and (v.36) semen, which is nearly the full list of the seven <em>dhātus</em>, the bodily tissues of Āyurveda; then the entrails, bile and phlegm (two of Āyurveda's three humors), and every joint.</li>
        <li><strong>The shadow</strong> (v.36): <em>chhāyām chhatreśvarī</em>, "Chhatreśvarī, my shadow." Even the shape the body throws on the ground is covered.</li>
        <li><strong>The inner instrument</strong> (v.36): ego, mind, and intellect.</li>
        <li><strong>The breath</strong> (v.37): the five <em>prāṇas</em> (prāṇa, apāna, vyāna, samāna, udāna), the vital currents yoga describes, which also stand in for the third humor, <em>vāta</em>, wind.</li>
        <li><strong>The senses and the guṇas</strong> (v.38): taste, form, smell, sound, and touch; then <em>sattva, rajas, tamas</em>, the three strands that, in Sāṃkhya thought, make up all of nature.</li>
        <li><strong>A life</strong> (vv.39-41): life span, dharma, fame, fortune, wealth, learning, family line, cattle, sons, wife, the path one walks, the road, the king's gate.</li>
      </ul>
      <p>And then, in verse 42, the catch-all every thorough kavacham ends with: "whatever place is left without protection, not covered by the armor, protect all of it for me." Read in order, it is almost a map of how Indian thought describes a human being, from the outermost hair to the three guṇas at the root of nature and back out into a household and a kingdom, with a goddess stationed at every layer.</p>
    `,
  };
}

const ANTATI_FORM_LINK = '<a href="antati-form.html">Antāti form page</a>';

function buildAbiramiAntatiSignificanceNote() {
  return {
    title: 'A Hundred Verses Sung Over a Fire',
    subtitle: 'Abirami Antati · Spiritual Significance',
    bodyHtml: `
      <p><strong>The poet and the goddess.</strong> The Abirami Antati was composed in the eighteenth century by Subramaniya Iyer, a temple priest at Thirukkadaiyur in the Kaveri delta, who became known as Abirami Bhattar. He was devoted to Abirami, the goddess of that temple, consort of Shiva as Amritaghateshvara ("lord of the pot of nectar"). His devotion was so absorbed that the townspeople took him for a madman.</p>
      <p><strong>The story told about it.</strong> The tradition is that the Maratha king of Thanjavur, visiting the temple, asked him the date. Lost in the vision of the goddess's moonlike face, Bhattar answered that it was the full moon, on what was in fact the new-moon night. Challenged to make good on it or die, he had a fire lit beneath a hanging platform and began to sing, cutting one rope for each verse. As he reached the 79th verse, the story says, the goddess appeared and flung her earring into the sky, where it shone as the full moon. (See the Σ note on verse 79.) He went on to complete the hundred.</p>
      <p><strong>How it is used.</strong> The hundred verses are sung as a whole in Tamil Shakta households and temples, and single verses are widely recited for specific blessings, with the closing <em>nūl payan</em> ("fruit of the text") promising that "no harm whatsoever can ever come to those who worship her." The opening verse sets the tone: it piles image on image for her radiant red form (the rising sun, the forehead mark, a ruby, a pomegranate bud, a lotus, lightning, kumkum) and ends on the single word that matters, <em>vizhut-tuṇaiyē</em>, "my true refuge."</p>
      <p><strong>The chain.</strong> As an antāti, each verse begins with the last word of the one before: verse 1 ends <em>…tuṇaiyē</em>, and verse 2 opens <em>tuṇaiyum…</em>. The whole hymn is a single garland, and its hundredth verse links back to the first. See the ${ANTATI_FORM_LINK} for how the form works.</p>
    `,
  };
}

function buildAbiramiMoonNote() {
  return {
    title: 'The Verse That Raised the Moon',
    subtitle: 'Abirami Antati · Verse 79',
    bodyHtml: `
      <p>This is the verse at which, according to the story told about the Abirami Antati, the goddess answered her poet. Abirami Bhattar had declared a new-moon night to be the full moon; to save him, she threw her earring into the sky and it shone as the moon.</p>
      <p>The verse itself does not mention the moon. It is about grace and the choice of a path: "Even in her mere glance there is grace, for Abirama Valli; and we too have hearts willing to walk the path the Vedas have shown." Its point is that the goddess's grace is already given, in her glance alone; the only question is whether the devotee turns toward it. That the tradition places the miracle here, on a verse about grace being already present in a look, rather than on one that asks for a sign, fits the whole hymn's devotional logic.</p>
    `,
  };
}

function buildArpudhaTiruvantatiSignificanceNote() {
  return {
    title: 'The First Antāti, by the "Ghoul" of Kāraikkāl',
    subtitle: 'Arpudha Tiruvantati · Spiritual Significance',
    bodyHtml: `
      <p><strong>Where Tamil bhakti begins.</strong> Kāraikkāl Ammaiyār, "the Mother of Kāraikkāl," lived around the sixth century and is one of the three women among the sixty-three Nāyanmār, the Tamil Shaiva saints. Her <em>Arpudat Tiruvantāti</em>, "the Sacred Antāti of Wonder," is among the earliest works of Tamil devotional poetry, and tradition credits her with inventing the antāti form itself. It is preserved in the eleventh book of the Shaiva canon, the <em>Tirumurai</em>.</p>
      <p><strong>Her story.</strong> Born Punitavati, a merchant's wife, she once offered a mango meant for her husband to a Shaiva ascetic; when her husband asked for it, she prayed, and a second mango appeared in her hand. Frightened of a wife who could work miracles, he left her. She then asked Shiva to take away her beauty, now useless to her, and give her the form of a <em>pēy</em>, a gaunt, ghoul-like being of the cremation grounds, so that she could devote herself entirely to him. The tradition says she climbed Mount Kailāsa on her hands, and that Shiva greeted her as <em>Ammai</em>, "Mother."</p>
      <p><strong>A signature in the last verse.</strong> Verse 101 names the poet as <em>Kāraikkāl pēy</em>, "the ghoul of Kāraikkāl," and promises that those who recite "this garland of antāti verses" will be born into "a love that never departs." Like Shankara naming his Shivananda Lahari inside its own second verse, she signs her work inside it, and signs it with the name of the form she chose.</p>
      <p><strong>The poem's first words</strong> set the terms of everything after: "Ever since I was born and learned to speak, my whole love has turned... to reach your radiant red feet alone." It is love as a whole life, not an episode. See the ${ANTATI_FORM_LINK} for the word-chain that links each verse to the next.</p>
    `,
  };
}

function buildSaraswatiAntatiSignificanceNote() {
  return {
    title: 'The Scholar’s Prayer',
    subtitle: 'Saraswati Antati · Spiritual Significance',
    bodyHtml: `
      <p><strong>Who it is for.</strong> Sarasvatī is the goddess of learning, speech, music, and the arts, and this antāti is traditionally attributed to Kambar, the twelfth-century poet of the Tamil Rāmāyaṇa (the <em>Kamba Rāmāyaṇam</em>). A great poet's prayer to the goddess of poetry: it is recited above all by students and scholars, and especially at Sarasvatī Pūjā, the day in the Navarātri festival when books, instruments, and tools are placed before her and not used.</p>
      <p><strong>The opening invocation</strong> is one of the best-known verses in Tamil devotion: <em>āya kalaigaḷ aṟupattu nāṉkiṉaiyum ēya uṇarvikkum eṉ ammai</em>, "my Mother, who grants fitting understanding of all the sixty-four arts." The <em>sixty-four arts</em> (Sanskrit <em>catuḥṣaṣṭi kalāḥ</em>) is the classical Indian list of every accomplishment, from music, dance, and painting to perfumery, riddles, and architecture. Its promise is simple: if her bright, crystal-clear form dwells in the heart, "no misfortune will ever come near it."</p>
      <p><strong>Speech as her gift.</strong> The first verse of the hymn proper asks a rhetorical question that is really the hymn's whole theology: if one praises her night and day without ceasing, "will not even a stone break into song?" Eloquence is not the poet's own; it is Sarasvatī's, lent. The closing verse lists what she gives in return for praise: wisdom, the essence of the Vedas, refined wealth, and "imperishable, great glory." See the ${ANTATI_FORM_LINK} for the form.</p>
    `,
  };
}

function buildThreeLampsNote(which) {
  const place = {
    mudhal: 'the first of the three',
    irandam: 'the second of the three',
    munram: 'the third of the three',
  }[which];
  return {
    title: 'Three Poets, Three Lamps, One Night',
    subtitle: {
      mudhal: 'Mudhal Tiruvantati · Spiritual Significance',
      irandam: 'Irandam Tiruvantati · Spiritual Significance',
      munram: 'Munram Tiruvantati · Spiritual Significance',
    }[which],
    bodyHtml: `
      <p><strong>The story behind all three.</strong> The Mudhal, Irandam, and Munram Tiruvantātis ("First," "Second," and "Third" Sacred Antātis) are by the three earliest Āzhvārs, the Tamil Vaishnava poet-saints: Poygai Āzhvār, Bhūtattāzhvār, and Pēyāzhvār. This one is ${place}. The tradition tells how the three, who had never met, were caught one stormy night at Tirukkōvalūr and took shelter in the same tiny covered porch, a space "where one could lie, two could sit, three could stand." As they stood pressed together in the dark, they felt a fourth presence crowding in among them. It was Vishnu, who is worshipped at Tirukkōvalūr as Trivikrama. Each poet then sang a hundred verses.</p>
      <p><strong>The first verse of each is one step of a single vision:</strong></p>
      <ul>
        <li><em>Poygai Āzhvār</em> (Mudhal Tiruvantāti): "With the <em>earth</em> as the lamp's saucer, the vast <em>ocean</em> as its ghee, and the fierce-rayed <em>sun</em> as its flame." An outer lamp, made of the whole world, to see God by.</li>
        <li><em>Bhūtattāzhvār</em> (Irandam Tiruvantāti): "With <em>love</em> as the lamp's saucer, <em>ardor</em> as the ghee, and a melting <em>heart</em> as the wick, I have lit a lamp of wisdom." An inner lamp, made of devotion.</li>
        <li><em>Pēyāzhvār</em> (Munram Tiruvantāti): "<em>Tiru kaṇḍēṉ</em>, I have seen Śrī; I have seen his golden form... the discus, the conch, today." By the light of both lamps, the vision itself.</li>
      </ul>
      <p>Read together, the three opening verses move from the cosmos to the heart to direct sight: outer lamp, inner lamp, vision. Together these three hymns open the <em>Iyaṟpā</em> section of the <em>Nālāyira Divya Prabandham</em>, the four-thousand-verse Tamil Vaishnava canon.</p>
      <p>All three are antātis: see the ${ANTATI_FORM_LINK} for how each verse is chained to the next.</p>
    `,
  };
}

function buildKanninunSignificanceNote() {
  return {
    title: 'The Disciple Who Sang Only of His Guru',
    subtitle: 'Kanninun Cirutampu · Spiritual Significance',
    bodyHtml: `
      <p><strong>A hymn to a person, not a god.</strong> Madhurakavi Āzhvār's eleven verses are unique in the Divya Prabandham: they praise not Vishnu but Madhurakavi's own teacher, the poet-saint Nammāzhvār ("Nampi of southern Kurukūr"). The first verse says it outright. Even the Lord who "let himself be bound with a fine, slender rope" (the child Krishna, tied to a mortar by his mother Yaśodā, which is why he is called <em>Dāmodara</em>, "rope-bellied") is less sweet on Madhurakavi's tongue than the name of his guru. The title comes from that rope: <em>kaṇṇi nuṇ ciṟut tāmpu</em>, "the knotted, fine, small cord."</p>
      <p><strong>The story of the meeting.</strong> The tradition says Madhurakavi, travelling in the north, saw a light in the southern sky and followed it for days, to a tamarind tree at Kurukūr where a young man sat in unbroken silence. To test him, Madhurakavi asked a riddle: "If the small one is born in the body of the dead, what will it eat, and where will it lie?" (How does a soul, in an inert body, live?) The silent one spoke for the first time: "That it will eat, and there it will lie." Madhurakavi became his disciple and served him for the rest of his life.</p>
      <p><strong>The key to the canon.</strong> In the Śrīvaiṣṇava tradition this small hymn has a large role. Nāthamuni, who assembled the Divya Prabandham in the tenth century, is said to have recovered Nammāzhvār's lost verses by reciting <em>Kaṇṇinuṇ Ciṟuttāmpu</em> twelve thousand times, until Nammāzhvār appeared and gave him all four thousand. So it is recited before Nammāzhvār's great <em>Tiruvāymozhi</em>, as the way in. Its last verse promises Vaikuṇṭha to "those who trust these words." Devotion to the guru is the door to devotion to God.</p>
      <p>Like the others in this collection it is an antāti; see the ${ANTATI_FORM_LINK}.</p>
    `,
  };
}

function buildTiruvirattaiSignificanceNote() {
  return {
    title: 'A Garland of Two Gems',
    subtitle: 'Tiruvirattai Manimalai · Spiritual Significance',
    bodyHtml: `
      <p><strong>The form in the name.</strong> <em>Iraṭṭai maṇimālai</em> means "double gem garland." Like a necklace strung with two kinds of stone in turn, its twenty verses alternate between two meters: the odd verses are in <em>kaṭṭaḷaik kalitturai</em>, a long four-line stanza, and the even ones in <em>veṇpā</em>, the short, tight meter of the Thirukkural. It is also an antāti, each verse opening on the last word of the one before, and it closes the circle: the last verse ends on <em>kiḷarntu</em>, "rise up," and the first begins with the same word.</p>
      <p><strong>The same poet as the Arpudha Tiruvantati.</strong> This is the second antāti of Kāraikkāl Ammaiyār (see the Arpudha Tiruvantati's note for her story), and it is in her unmistakable voice. She talks to her own heart ("O heart, do not shrink in fear," v.1; "O heart as deep as the sea, rise up," v.20). She also talks to Shiva with a familiarity only a very old devotee would dare. If Uma sees the Ganga sitting in your hair, what will you do? (v.5). How is anyone supposed to reach you through love, with a snake on you that lets no one near? (v.17). And, looking for a mount as fine as your bull for Uma and finding none, you simply took her up behind you (v.19).</p>
      <p><strong>The poet in her own poem.</strong> Verse 15 pictures Shiva dancing on the cremation ground while "wailing, strong-mouthed ghouls stand and sing." Kāraikkāl Ammaiyār had asked to become exactly such a <em>pēy</em>, a ghoul of the burning ground, so that she could sing beside that dance. Tradition places her at Tiruvālaṅkāṭu, singing at the feet of the dancing Lord. In this verse she is describing her own place.</p>
      <p><strong>Wordplay.</strong> Verse 12 turns on <em>kūṟṟu</em>, which means both "a share" and "Death": Shiva is the one who has Uma as his <em>kūṟṟu</em> (his other half) and who burned the <em>kūṟṟu</em> (Death himself). Verse 14 plays the same way on <em>āṟu</em> ("river") and <em>āṭi</em> ("bathing," "dancing"): a river bathes him, he dances in fire, he bathes in its ash, he bathes in ghee.</p>
    `,
  };
}

function buildPonvannattantatiSignificanceNote() {
  return {
    title: 'The Color of Gold',
    subtitle: 'Ponvannattantati · Spiritual Significance',
    bodyHtml: `
      <p><strong>A king's antāti.</strong> The poet is Cēramāṉ Perumāḷ Nāyaṉār, a Chera king of Kerala and the close friend of the saint Sundarar. The tradition calls him <em>Kaḻaṟṟaṟivār</em>, "the one who knows what the anklets say," because each day, at the end of his worship, he heard the anklets of the dancing Shiva of Chidambaram. His hundred verses are addressed to that dancer, and verse 101, a traditional closing verse naming the author, tells the story of his end: when Shiva sent a white elephant to carry Sundarar to Kailāsa, Cēramāṉ rode after him on his horse and, before Shiva, recited his <em>Ulā</em>.</p>
      <p><strong>Framed in gold.</strong> The first verse gives the poem its name: "Whatever the color of gold, that is the color of his body... and whatever color I turned when I saw him, that color has become the Lord's." The last verse answers it. Even a crow that flies near the golden mountain takes on "the color of gold" that same day, so what need is there to say that his devotees reach heaven? The title word, <em>poṉvaṇṇam</em>, opens the garland and closes it.</p>
      <p><strong>Devotion as love-longing.</strong> Many of these verses are in the mode of Tamil <em>akam</em>, the classical poetry of love. The devotee becomes a young woman pining for Shiva, and we hear her mother, her friend, and her own voice. Her bangles slip from her wrists, the moon and the south wind torment her, her mother drags her away from the alms-seeking stranger (v.2). Sometimes she argues with him (v.63: "if he touches the flowers in my hair, I will be angry"). Tamil bhakti made this its most intimate register: the soul's desire for God, spoken as a girl's desire for her lover.</p>
      <p><strong>Two portraits of the divided body.</strong> Verse 6 paints Shiva as <em>Harihara</em>, left half Vishnu and right half himself: tulasi on one side and konrai on the other, cloth and hide, discus and deer, dark and red. Verse 65 paints him as <em>Ardhanārīśvara</em>, right half Shiva and left half Uma: warrior's anklet and woman's anklet, ash and sandal paste, spear and ring, matted locks and cool tresses. The same body can be shared with the goddess or with Vishnu. Compare the Shiva Raksha Stotram's note on Vishnu and Shiva teaching each other's armor.</p>
      <p><strong>Two classical devices.</strong> Verse 36 is a <em>respective</em> list: six nouns (teeth, life, half, body, head, hide), six owners (Sun, Death, Woman, Archer, Brahmin, Elephant), and six verbs (plucked, kicked, embraced, burned, cut, flayed), to be read across in order, each one Shiva's mythic deed. Verse 95 does the same for Shiva, Brahma, and Vishnu's abodes, colors, garlands, and mounts. And in verses 24-25 the king-poet apologizes for his "poor words" beside the gods' praise, like a firefly going out undaunted to meet the rising moon.</p>
    `,
  };
}

function buildTiruttondarSignificanceNote() {
  return {
    title: 'The Sixty-Three, One Verse Each',
    subtitle: 'Tiruttondar Tiruvantati · Spiritual Significance',
    bodyHtml: `
      <p><strong>A saint's list, expanded.</strong> The saint Sundarar once sang a hymn of eleven verses, the <em>Tiruttoṇṭattokai</em> ("Collection of the Devotees"), naming Shiva's devotees one after another. In the tenth century Nampiyāṇṭār Nampi, the scholar who gathered the Tamil Shaiva hymns into the <em>Tirumurai</em>, expanded that list into this antāti: one verse for each of the sixty-three Nāyanmār, and a verse each for the groups of devotees Sundarar names. The first verse credits the knowledge to Gaṇapati: tradition says the elephant-faced god of Tirunāraiyūr revealed the saints' lives to Nampi. The verse labels here name the saint each verse is about. Two centuries later, Sekkiḻār's great <em>Periya Purāṇam</em> would tell these same lives at full length.</p>
      <p><strong>Who the saints are.</strong> The list is striking for its range. There are kings (a Pandya, a Chola, a Pallava, a Chera) and a potter, a washerman, a fisherman, an oil-presser, a weaver, a hunter (Kaṇṇappa, v.12), and an outcaste, Nandanār, "the one who would go tomorrow" (v.21), before whom the three thousand priests of Chidambaram folded their hands. There are women (Kāraikkāl Ammaiyār, the Pandya queen Maṅkaiyarkkaraci, Sundarar's mother Icaiñāṉi) and a Buddhist who worshipped by throwing a stone (v.42). The claim is that devotion, not birth, makes the saint.</p>
      <p><strong>Devotion without limit.</strong> Many of the deeds are extreme, and the text tells them without softening: a devotee who gives his wife to an ascetic who asks (v.4), a father who cooks his only son for a guest (v.44), a man who cuts off his wife's hand when she hesitates to serve a devotee (v.54), a Jain-defeating debate that ends in impalement (vv.27, 61). The hagiographic tradition presents these as tests where total surrender to Shiva outweighs every other duty, and in most of the stories Shiva restores what was given. Modern readers, including devout ones, often read them as a genre's extreme way of saying "hold nothing back," not as models to imitate.</p>
      <p><strong>Other poets in this collection appear here as saints.</strong> Verse 29 is Kāraikkāl Ammaiyār, poet of the Arpudha Tiruvantati and the Tiruvirattai Manimalai, walking up Kailāsa on her head rather than set her feet on Shiva's mountain, and called "my mother" by Shiva himself. Verses 45-46 and 87 are Cēramāṉ Perumāḷ, poet of the Ponvannattantati, who once bowed to a washerman because the fuller's earth on his body looked like sacred ash.</p>
      <p><strong>A book about a book.</strong> The closing verses turn to the source. Verse 88 counts the devotees: nine groups and sixty-three by name, seventy-two in all. Verse 89 quotes, in order, the opening words of each of the eleven verses of Sundarar's <em>Tiruttoṇṭattokai</em>. Verse 90 asks what penance the poet could ever have done to deserve to tell of them.</p>
    `,
  };
}

function buildNanmukanSignificanceNote() {
  return {
    title: 'Before the Four-Faced One',
    subtitle: 'Nanmukan Tiruvantati · Spiritual Significance',
    bodyHtml: `
      <p><strong>The title is the first word.</strong> <em>Nāṉmukaṉ</em> means "the Four-Faced One," Brahmā, and the poem is named for the word it opens on. Verse 1 lays out the whole doctrine in four lines: Nārāyaṇa made Brahmā, and Brahmā in turn made Śaṅkara (Shiva) from his own face. "I have set out this deep truth in an antāti: take it without spilling it, having weighed it well." The poet is Tirumaḻisai Āḻvār, whom tradition calls <em>Bhaktisāra</em>, "the essence of devotion." He is said to have studied the Jain, Buddhist, and Shaiva paths one after another before settling on Vishnu. That history explains the tone of the poem.</p>
      <p><strong>A poem that argues.</strong> This is the most openly sectarian work in the Divya Prabandham, and it is best read as what it is. Verse 6 dismisses Jains, Buddhists, and Shaivas by name. Verse 53 will have "no god but Kakutstha" (Rāma), and verse 66 refuses to place "the moon-wearer" or Brahmā beside Vishnu, or even to walk around them in reverence. Other verses make the same claim more gently. Verse 2 says there is one God, whose greatness no one knows. Verse 54 says those who do not see that "all who stand, whoever they are, are tall Mal" have learned nothing. Verse 96, the last, closes on the confession: "Now I know: the God of Īśa and of the Four-Faced One... you are the cause... Nārāyaṇa: I know it well." Compare the Shaiva antātis in this collection, which say the same things of Shiva; the two traditions grew up side by side in the same temples and the same language.</p>
      <p><strong>"You are nothing without me."</strong> Under the polemic is one of the boldest lines in Tamil bhakti. Verse 7: "I am nothing without you, O Nārāyaṇa, and you are nothing without me." Śrīvaiṣṇava commentators read it as a statement of relation: a Lord needs someone to be Lord of, and God's own nature as protector is fulfilled only in the soul he protects.</p>
      <p><strong>The hill of Venkaṭam.</strong> A long run of verses in the middle (roughly vv.34-48) turns to Tiruvēṅkaṭam, the hill of Tirupati: its waterfalls "sweeping jewels," its elephants and snakes, and the poet who "sang of Venkaṭam and made it my home" (v.40). Tirumaḻisai is also linked with Kumbakōṇam and with the temple at Tiruvekkā, where, the story goes, the Lord rolled up his serpent bed and followed the poet out of town when the poet was banished, and came back when he returned.</p>
      <p>This is one of the <em>Iyaṟpā</em> antātis, which follow the Three Lamps (the Mudhal, Irandam, and Munram Tiruvantatis) in the canon. See the ${ANTATI_FORM_LINK}.</p>
    `,
  };
}

function buildPeriyaTiruvantatiSignificanceNote() {
  return {
    title: 'Talking to the Heart',
    subtitle: 'Periya Tiruvantati · Spiritual Significance',
    bodyHtml: `
      <p><strong>The "great" antāti.</strong> These 87 verses are by Nammāḻvār, the greatest of the Āḻvārs, whose <em>Tiruvāymoḻi</em> is called the "Tamil Veda." Of his four works, this is the one in the Iyaṟpā. Tradition calls it <em>Periya</em>, "great," not for its length but for its theme: the greatness of the Lord, and the greater greatness of the one who holds him in his heart.</p>
      <p><strong>A dialogue with the heart.</strong> The poem opens: "O heart, you who have risen up and gone on ahead, join with us" (v.1), and it keeps talking to that heart all the way through. It coaxes the heart, scolds it, is afraid for it, and sometimes gives up on it: "When I say, 'Bow your head and fold your two hands,' you will not fold them... even if you stay as you are, stay" (v.84). Verse 49 turns the other way: now the heart runs off on its own every time it sees anything dark, a rain cloud or a mountain or the sea, "saying, 'That is Kaṇṇaṉ's great form.'"</p>
      <p><strong>Who is greater?</strong> Verse 75 is the poem's most famous paradox: "The earth and the vast sky are within you; you, entering by the path of my ear, are within me. So that I am great and you are great, who can know it?" If the Lord contains the world and the devotee contains the Lord, which one is larger? Verse 76 follows up: once the film over the heart breaks, will I too become as great as the world?</p>
      <p><strong>What to ask for.</strong> Verse 58 is a key text for Śrīvaiṣṇava teaching on what a devotee should want. "Not freedom from birth, nor even service beneath your feet: what I want is never to forget you." Compare the Kavachams in this collection, which ask for protection. Here the whole request is memory.</p>
      <p><strong>Everything dark is him.</strong> Verse 73 names four dark-blue flowers (the <em>kāyā</em>, the <em>pūvai</em>, the blue lily, and the <em>kāvi</em>): "every time I see them, my life and body swell with joy, saying all of them are the Lord's form." See the ${ANTATI_FORM_LINK}.</p>
    `,
  };
}

function buildRamanujaNurrantatiSignificanceNote() {
  return {
    title: 'A Hundred and Eight for a Teacher',
    subtitle: 'Ramanuja Nurrantati · Spiritual Significance',
    bodyHtml: `
      <p><strong>A hymn to a human teacher.</strong> Every other antāti in this collection praises a god or a goddess. This one praises Rāmānuja (traditionally 1017-1137), the philosopher of Viśiṣṭādvaita and the great teacher of the Śrīvaiṣṇava community. The poet, Tiruvaraṅgattu Amudaṉār, was a Srirangam temple official who, the story goes, first opposed Rāmānuja, then became a disciple through Rāmānuja's disciple Kūrattāḻvāṉ (named in v.7). The hymn has 108 verses, the sacred number of Vishnu's temples. It is the only work in the Divya Prabandham not by an Āḻvār, and it was added to the canon, tradition says, because Rāmānuja himself approved it. Its other name is <em>Prapanna Gāyatrī</em>, "the Gāyatrī of those who have surrendered," because devotees recite it daily as others recite the Gāyatrī mantra.</p>
      <p><strong>The Āḻvārs, one by one.</strong> Verses 8-21 run through the poet-saints in order, each verse praising Rāmānuja as the one who holds that saint in his heart. Verse 8 is Poygai, who "twisted a wick and lit the holy lamp"; verse 9 is Bhūtam, who "lit the full lamp called wisdom"; verse 10 is Pēy, "who shows how he saw the wonder... at Kōvalūr." That is the Three Lamps story (see the note on the Mudhal Tiruvantati). Then come Tiruppāṇ (11), Tirumaḻisai (12, the poet of the Nanmukan Tiruvantati), Toṇṭaraṭippoṭi (13), Kulacēkara (14), Periyāḻvār (15), Āṇṭāḷ (16, "who wore and then gave the garland"), Tirumaṅkai (17), and Nammāḻvār (18-19), followed by the teachers Nāthamuni (20) and Yāmuna (21). The effect is a lineage: Rāmānuja as the place where the whole tradition comes together.</p>
      <p><strong>The teacher as the way.</strong> The poem's theology is that grace reaches the devotee through the teacher. In verse 69 the poet says the Lord of Srirangam gave him a mind and senses, but not his own feet; Rāmānuja "came and lifted me up today." In verse 104: even if you gave me Kṛṣṇa like a fruit in my hand, I want nothing but your glory. Verse 107 asks, whatever births may come, only to be the servant of Rāmānuja's devotees. Compare the Kanninun Cirutampu, Madhurakavi's eleven verses to his own teacher Nammāḻvār: this is the same devotion, a hundred and eight verses long.</p>
      <p><strong>A closed garland.</strong> Verse 1 opens with <em>pū maṉṉu mātu</em>, "the lady who dwells on the lotus," Lakṣmī on the Lord's chest. Verse 108 ends on the same Lakṣmī, and its last words, <em>pū maṉṉavē</em>, "may they abide as flowers" on our heads, echo the opening sound so the garland can be recited around again. See the ${ANTATI_FORM_LINK}.</p>
    `,
  };
}

function buildKantarAntatiSignificanceNote() {
  return {
    title: 'One Sound, Four Meanings',
    subtitle: 'Kantar Antati · Spiritual Significance',
    bodyHtml: `
      <p><strong>The poet of the Tiruppukaḻ.</strong> Aruṇakirinātar, the fifteenth-century poet of Tiruvaṇṇāmalai, is best known for the <em>Tiruppukaḻ</em>, his thousands of rhythmic songs to Murugan (Kantan, Skanda). The tradition says he wasted his youth, tried to end his life by throwing himself from the temple tower, and was caught by Murugan himself, who gave him the first word of his first song. The <em>Kantar Antāti</em> is his virtuoso piece: a hundred verses to Kantan in which every line of each verse begins with <em>the same string of sounds</em>, which has to be divided into words differently each time.</p>
      <p><strong>How the first verse works.</strong> This device is called <em>maṭakku</em> (Sanskrit <em>yamaka</em>). All four lines of verse 1 open with <em>tiruvāviṉaṉkuṭi</em>, and each time it means something different:</p>
      <ul>
        <li>Line 1: <em>tiru āvi naṉ kuṭi paṅkāḷar</em>, "Tirumāl, Lakṣmī's lord, and Shiva, who shares his side with the good goddess."</li>
        <li>Line 2: joined to the last syllable of line 1, <em>ca-tir uvāviṉaṉ kuṭi</em>, "the skillful youth dwells."</li>
        <li>Line 3: <em>Tiruvāviṉaṉkuṭi</em>, the shrine at Palani, as a place-name.</li>
        <li>Line 4: again joined to the previous line, <em>a-tir uvā iṉaṉ kuṭikoṇṭa</em>, "where herds of elephants that shake the ground have their home."</li>
      </ul>
      <p>The translation here follows the word divisions and meanings of the Tamil commentary on kaumaram.com. A line of English can only give one of the readings the sound allows, so read these translations as a guide to the sense, not a match for the wordplay.</p>
      <p><strong>The six abodes.</strong> The same first verse names Murugan's six sacred places, the <em>Āṟupaṭai Vīṭu</em>: Tirupparaṅkuṉṟam, Alaivāy (Tiruchendur), Tiruvāviṉaṉkuṭi (Palani), Ērakam (Swamimalai), "every hill where he plays" (Kuṉṟutōṟāṭal), and the cool cloud-wrapped hill of Paḻamutircōlai. It ends: "praise them all." Tiruchendur, "Chendur" in these verses, comes back again and again.</p>
      <p><strong>Murugan as teacher.</strong> The verses keep coming back to one story: the child Murugan teaching the meaning of <em>Om</em> to his own father, Shiva, who "covered his mouth and gave ear" (vv.4, 19, 52, 64). Brahmā, who could not explain it, was imprisoned (vv.45, 51). This is why Murugan is called <em>Swaminatha</em>, "the father's teacher," at Swamimalai. Several verses also follow the Tamil Shaiva belief that Murugan was born as the child-saint Sambandar: he cured the Pandya king's fever and hunched back with sacred ash (vv.56, 65, 96), made male palm trees bear fruit (v.75), and defeated the Jains in debate (vv.27, 29, 89). The last verse sends the heart to worship at Kaḻumalam (Sirkazhi), Sambandar's birthplace.</p>
      <p><strong>Love poetry and prayer together.</strong> Many verses are in the voice of a girl pining for Murugan: the moon burns her, the south wind torments her, sandal paste feels like fire (v.7), and her family sacrifices a goat to cure her lovesickness (v.24). Others are plain prayers, like v.97's advice to misers: "at least when you sneeze, say 'Kumara, refuge!' and be saved." At the end, when Death's messengers come, the refuge is "your holy feet with their anklets" (v.95).</p>
      <p><strong>A verse in one letter.</strong> Verse 54 is built entirely from syllables of the letter <em>ta</em> (த, தா, தி, தீ, து, தே, தை, தொ) and still makes sense: it praises the Lord whom Shiva, Brahmā, and Vishnu worship, and asks that on the day the body burns, the mind that praised him may cling to him. The hundredth verse ends on <em>tiruvaṭiyē</em>, "the holy feet," and the first begins with <em>tiru</em>, so the garland closes. See the ${ANTATI_FORM_LINK}.</p>
    `,
  };
}

let mathModalOverlay = null;

function ensureMathModal() {
  if (mathModalOverlay) return mathModalOverlay;
  const overlay = el('div', 'modal-overlay');
  overlay.id = 'mathModalOverlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true">
      <button type="button" class="modal-close" aria-label="Close">&times;</button>
      <h2 class="modal-title"><span class="glow-gold" id="mathModalTitle"></span></h2>
      <p class="modal-subtitle" id="mathModalSubtitle"></p>
      <div class="modal-body" id="mathModalBody"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => {
    overlay.hidden = true;
  };
  overlay.querySelector('.modal-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) close();
  });

  mathModalOverlay = overlay;
  return overlay;
}

function openMathModal(note) {
  const overlay = ensureMathModal();
  overlay.querySelector('#mathModalTitle').textContent = note.title;
  overlay.querySelector('#mathModalSubtitle').textContent = note.subtitle || '';
  overlay.querySelector('#mathModalBody').innerHTML = note.bodyHtml;
  overlay.hidden = false;
}

const chantMenuButton = document.getElementById('chantMenuButton');
const chantMenuCollection = document.getElementById('chantMenuCollection');
const chantMenuCurrent = document.getElementById('chantMenuCurrent');
const chantMenu = document.getElementById('chantMenu');
const chantBody = document.getElementById('chantBody');
const chantTitleDeva = document.getElementById('chantTitleDeva');
const chantTitleIast = document.getElementById('chantTitleIast');
const chantSource = document.getElementById('chantSource');
const transliterationToggle = document.getElementById('transliterationToggle');
const translationToggle = document.getElementById('translationToggle');

// The current chant's layout (text column + rail + translation column) and
// its network SVG, rebuilt on every renderChant() call — see
// updateNetworkOverlay.
let chantTextEl = null;
let chantTranslationEl = null;
let networkLayout = null;
let networkRail = null;
let networkSvg = null;

// The currently rendered chant, and a lineKey -> section-label lookup for it
// — both rebuilt on every renderChant() call. Used only by
// initRepeatClickHandling's local-scope proximity check (see linkScope on
// the CHANTS entries above); a global click handler has no other way to know
// which chant/section a clicked .token-repeat span belongs to.
let currentChant = null;
let lineSectionMap = new Map();

// The chant menu: one button in the header that opens a panel of
// collections (grouped by language); clicking a collection expands it to
// show its chants, one collection open at a time.
//
// languageFilter (from chants.html's own ?lang= query param — see the
// Chants hub's two cards on index.html) restricts the menu to one language,
// dropping the language headings since they'd be redundant. Falls back to
// every collection when absent or unrecognized — segregation is an entry
// point, not a lock.
function buildChantMenu(languageFilter) {
  chantMenu.innerHTML = '';
  const languages = [...new Set(COLLECTIONS.map((c) => c.language))].filter(
    (lang) => !languageFilter || lang === languageFilter
  );
  for (const lang of languages) {
    if (!languageFilter) chantMenu.appendChild(el('div', 'chant-menu-language', LANGUAGE_LABELS[lang]));
    for (const collection of COLLECTIONS.filter((c) => c.language === lang)) {
      const members = CHANTS.filter((c) => c.collection === collection.id);
      const section = el('div', 'chant-menu-collection');
      section.dataset.collection = collection.id;

      const toggle = el('button', 'chant-menu-collection-toggle');
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.append(el('span', 'chant-menu-collection-name', collection.label), el('span', 'chant-menu-count', String(members.length)));
      toggle.addEventListener('click', () => {
        setCollectionExpanded(collection.id, toggle.getAttribute('aria-expanded') !== 'true');
      });

      const list = el('div', 'chant-menu-list');
      list.hidden = true;
      const addItems = (chants) => {
        for (const chant of chants) {
          const item = el('button', 'chant-menu-item', chant.label);
          item.type = 'button';
          item.dataset.chant = chant.id;
          list.appendChild(item);
        }
      };
      addItems(members.filter((c) => !c.subgroup));
      for (const subgroup of collection.subgroups || []) {
        const inGroup = members.filter((c) => c.subgroup === subgroup.id);
        if (!inGroup.length) continue;
        list.appendChild(el('div', 'chant-menu-subgroup', subgroup.label));
        addItems(inGroup);
      }

      section.append(toggle, list);
      chantMenu.appendChild(section);
    }
  }
}

function setCollectionExpanded(collectionId, expanded) {
  for (const section of chantMenu.querySelectorAll('.chant-menu-collection')) {
    const open = expanded && section.dataset.collection === collectionId;
    section.querySelector('.chant-menu-collection-toggle').setAttribute('aria-expanded', String(open));
    section.querySelector('.chant-menu-list').hidden = !open;
  }
}

let activeChantId = null;

function openChantMenu() {
  const active = CHANTS.find((c) => c.id === activeChantId);
  setCollectionExpanded(active && active.collection, true);
  for (const item of chantMenu.querySelectorAll('.chant-menu-item')) {
    item.classList.toggle('is-current', item.dataset.chant === activeChantId);
  }
  chantMenu.hidden = false;
  chantMenuButton.setAttribute('aria-expanded', 'true');
}

function closeChantMenu() {
  chantMenu.hidden = true;
  chantMenuButton.setAttribute('aria-expanded', 'false');
}

function selectChant(id) {
  activeChantId = id;
  const chant = CHANTS.find((c) => c.id === id);
  chantMenuCollection.textContent = COLLECTIONS.find((c) => c.id === chant.collection).label;
  chantMenuCurrent.textContent = chant.label;
  loadChant(id);
}

function initChantMenu() {
  chantMenuButton.addEventListener('click', () => {
    if (chantMenu.hidden) openChantMenu();
    else closeChantMenu();
  });
  chantMenu.addEventListener('click', (e) => {
    const item = e.target.closest('.chant-menu-item');
    if (!item) return;
    closeChantMenu();
    selectChant(item.dataset.chant);
  });
  document.addEventListener('click', (e) => {
    if (!chantMenu.hidden && !e.target.closest('.chant-menu-wrap')) closeChantMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !chantMenu.hidden) {
      closeChantMenu();
      chantMenuButton.focus();
    }
  });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Vedic pitch-accent (svara) marks, as combining diacritics in the IAST text.
// Many fonts can't stack these over a base letter (tofu boxes), so instead of
// relying on font glyph coverage we render them ourselves as small strokes —
// this is also the actual teaching signal: udatta = raised pitch (line
// above), anudatta = lowered pitch (line below).
const ACCENT_CLASS = {
  '̍': 'accent-udatta', // combining vertical line above
  '̎': 'accent-svarita', // combining double vertical line above
  '̠': 'accent-anudatta', // combining minus sign below
};

function renderIastChars(text) {
  const frag = document.createDocumentFragment();
  const chars = Array.from(text);
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const accentClass = ACCENT_CLASS[chars[i + 1]];
    if (accentClass) {
      const span = document.createElement('span');
      span.className = `accented-char ${accentClass}`;
      span.textContent = ch;
      frag.appendChild(span);
      i += 1; // consume the combining mark
    } else {
      frag.appendChild(document.createTextNode(ch));
    }
  }
  return frag;
}

// --- Word-meaning links between Sanskrit and the English translation -----
//
// A small, hand-curated dictionary: each entry ties surface forms in both
// scripts to the English word(s) that translate them, so a box on one side
// can highlight its counterpart on the other. This is intentionally a
// starter set of high-precision, high-frequency words rather than an
// attempt at full automatic alignment (which would need real bilingual
// alignment data to do reliably) — extend this array as more mappings are
// confirmed. Notably excludes "cha" -> "and": "and" is used in the
// translation for other Sanskrit connectives too (e.g. "uta"), so mapping
// it would box far more English words than actually correspond to "cha".
const MEANING_CONCEPTS = [
  { id: 'namah', deva: ['नमः', 'नमो', 'नमस्ते'], iast: ['namaḥ', 'namastē'], english: ['salutation'] },
  // Catalogued individually the same way yajña/sahasra are — a different
  // case-form at nearly every occurrence, not stem-matched. रुद्रोत is
  // रुद्र + उत ("Rudra, and") fused by sandhi, its own token. Deliberately
  // excludes bigger compound epithets that merely happen to contain रुद्र
  // as one member (कालाग्निरुद्राय "Rudra as the fire of time",
  // रुद्रायातताविने "Rudra of the unstrung bow") — boxing those whole
  // tokens as plain "Rudra" would misrepresent them as the bare name
  // rather than the fuller epithet they actually are.
  {
    id: 'rudra',
    // रुद्रः/rudraḥ (Soundarya Lahari v.24, "रुद्रः क्षपयते," "Rudra
    // dissolves [the world]") is रुद्रो's own un-sandhied nominative — रुद्रो
    // is what रुद्रः becomes before a voiced sound, but here it precedes
    // the voiceless क्, so visarga stays visarga rather than shifting to
    // ओ. Same case, different sandhi environment, another chant-agnostic
    // form catalogued the same way as सहस्र's. रुद्रं/rudraṃ (v.83,
    // accusative, "पराजेतुं रुद्रं," "to conquer Rudra") is one more.
    deva: ['रुद्र', 'रुद्राय', 'रुद्रा', 'रुद्रो', 'रुद्रस्य', 'रुद्रेभ्यो', 'रुद्रोत', 'रुद्रः', 'रुद्रं'],
    iast: ['rudra', 'rudrāya', 'rudrā', 'rudrō', 'rudrasya', 'rudrēbhyō', 'rudrōta', 'rudraḥ', 'rudraṃ'],
    english: ['rudra'],
  },
  { id: 'shiva', deva: ['शिवा'], iast: ['śivā'], english: ['auspicious'] },
  // -पतये/-patayē ("to the lord of") — the recurring second half of
  // Namakam anuvākas 2-4's "salutation to X, and LORD OF Y, salutation"
  // structure (dozens of lines each). म्पतये is the same word with a
  // stranded nasal from the preceding compound's sandhi split (vignanam.org
  // hyphenates e.g. "पशूना-म्पतये" splitting mid-join) — same word, not a
  // different one, exactly like मे/म below. Deliberately excludes
  // स्थपतये/sthapatayē ("architect" — sthapati, an unrelated word that
  // only happens to contain इ"पतये" as a substring) and पशुपतये/
  // paśupatayē ("Pashupati", translated as the proper name itself rather
  // than decomposed to "lord" in context) — checked occurrence-by-
  // occurrence before adding, per the polysemy-cataloging habit.
  { id: 'lord', deva: ['पतये', 'म्पतये'], iast: ['patayē', 'mpatayē'], english: ['lord'] },
  // 'म'/'ma' is the regular sandhi elision of मे before a vowel-initial
  // word (e.g. मे + एकादश -> म एकादश) — same word, not a different one.
  // म्मे carries the same stranded-nasal doubling as म्पतये above (e.g.
  // "अय-म्मे" from "अयम्" + "मे" split mid-join) — still मे, not a distinct
  // word. (म्म, the equivalent doubling of the elided म form, doesn't
  // actually occur anywhere in either chant — checked, not just assumed —
  // so it's not listed.)
  { id: 'me', deva: ['मे', 'म', 'म्मे'], iast: ['mē', 'ma', 'mmē'], english: ['mine', 'me'] },
  // इन्द्र/indra: registered so the fused-cha prefix-boxing added to
  // conceptsInLine/renderScriptLine picks it out of इन्द्रश्च/indraścha —
  // Chamakam anuvāka 6 pairs Indra with a different deity in nearly every
  // line (20 occurrences), all as this same fused compound, never
  // appearing unfused.
  { id: 'indra', deva: ['इन्द्र'], iast: ['indra'], english: ['indra'] },
  // धनुः/hand — Namakam anuvāka 1's recurring weapon vocabulary (see
  // buildWeaponsPacifiedNote). Cataloged forms include the stranded-nasal
  // hyphenation ("विज्य-न्धनुः" splits to न्धनुः, same phenomenon as
  // म्पतये/म्मे above) and the tvam-enclitic fusion धनुस्त्वग्ं — both still
  // just "bow" underneath, not a different word. Excludes "धन्वनस्त्वमुभयोरार्त्नि"
  // (anuvāka 1 line 21) — too much else fused into that one token
  // (you/both-ends/bowstring all mashed in) to safely box as plain "bow."
  {
    id: 'namakam-bow',
    deva: ['धनुः', 'धन्वने', 'धन्वनो', 'न्धनुः', 'धनुस्त्वग्ं'],
    iast: ['dhanuḥ', 'dhanvanē', 'dhanvanō', 'ndhanuḥ', 'dhanustvagṃ'],
    english: ['bow'],
  },
  { id: 'namakam-hand', deva: ['हस्ते', 'हस्त'], iast: ['hastē', 'hasta'], english: ['hand'] },
  // Chamakam anuvāka 6's invoked pantheon (see buildChamakamPantheonNote) —
  // each deity named once, paired with Indra via the fused-cha mechanism
  // above (e.g. वरुणश्च splits to वरुण + श्च the same way इन्द्रश्च does).
  // Three of the twelve (Savitr, Sarasvati, Pushan, Tvashtr, Dhatr, and the
  // Aśvins) appear unfused — cha is a separate word after them rather than
  // sandhi-glued on — so they need no fused-prefix handling at all, just
  // plain registration. देवा ("gods," from "विश्वे च मे देवा") is the
  // anuvāka's one collective (non-individually-named) entry.
  { id: 'chamakam-agni', deva: ['अग्नि'], iast: ['agni'], english: ['agni'] },
  { id: 'chamakam-soma', deva: ['सोम'], iast: ['sōma'], english: ['soma'] },
  { id: 'chamakam-savitr', deva: ['सविता'], iast: ['savitā'], english: ['savitr'] },
  { id: 'chamakam-sarasvati', deva: ['सरस्वती'], iast: ['sarasvatī'], english: ['sarasvati'] },
  { id: 'chamakam-pushan', deva: ['पूषा'], iast: ['pūṣā'], english: ['pushan'] },
  { id: 'chamakam-brihaspati', deva: ['बृहस्पति'], iast: ['bṛhaspati'], english: ['brihaspati'] },
  { id: 'chamakam-mitra', deva: ['मित्र'], iast: ['mitra'], english: ['mitra'] },
  { id: 'chamakam-varuna', deva: ['वरुण'], iast: ['varuṇa'], english: ['varuna'] },
  { id: 'chamakam-tvashtr', deva: ['त्वष्ठा'], iast: ['tvaṣṭhā'], english: ['tvashtr'] },
  { id: 'chamakam-dhatr', deva: ['धाता'], iast: ['dhātā'], english: ['dhatr'] },
  { id: 'chamakam-vishnu', deva: ['विष्णु'], iast: ['viṣṇu'], english: ['vishnu'] },
  // The avagraha (ऽ) is part of the actual surface form here, not
  // decorative — "मे-ऽश्विनौ" elides मे's final vowel into अश्विनौ's
  // initial अ, and vignanam.org marks that elision explicitly rather than
  // writing अश्विनौ plain. Registering the elided form since that's the
  // only way it ever appears in this corpus.
  { id: 'chamakam-ashvins', deva: ['ऽश्विनौ'], iast: ["'śvinau"], english: ['ashvins'] },
  { id: 'chamakam-maruts', deva: ['मरुत'], iast: ['maruta'], english: ['maruts'] },
  { id: 'chamakam-prajapati', deva: ['प्रजापति'], iast: ['prajāpati'], english: ['prajapati'] },
  { id: 'chamakam-gods', deva: ['देवा'], iast: ['dēvā'], english: ['gods'] },
  // Known imprecise: "and" also translates other Sanskrit connectives (e.g.
  // uta), so this will box some "and"s that aren't actually cha — kept in
  // deliberately for manual review/correction rather than left out.
  //
  // ञ्च/ñcha (visible here as its own surface form) covers the cases the
  // source data already writes with a hyphen before it (श्रोत्र-ञ्च,
  // "śrōtra-ñcha" — segmentLine already splits on the hyphen, so this
  // isolates cleanly as its own token like any other word). श्च/च्च
  // (ścha/chcha) are never hyphenated in the source — cha sandhi-fused
  // onto the END of a bigger word (वाजश्च from vājaḥ+cha via visarga
  // sandhi; जगच्च from jagat+cha, the -t assimilating before cha) — those
  // two never appear as their own token at all, so they're registered
  // here only so FUSED_CHA_SUFFIXES' matches (see matchFusedChaSuffix)
  // resolve to this same concept for cross-script highlighting; the
  // rendering/detection logic that actually finds and boxes them lives in
  // renderScriptLine and conceptsInLine, not in the ordinary word lookup
  // this array otherwise drives.
  { id: 'cha', deva: ['च', 'ञ्च', 'श्च', 'च्च'], iast: ['cha', 'ñcha', 'ścha', 'chcha'], english: ['and'] },
  // मधु also means "honey" as a plain offering noun elsewhere (Chamakam's
  // ghee-and-honey line) rather than "sweet" as here — harmless in
  // practice since repeat-counting is scoped per section and that line
  // doesn't repeat "मधु" within its own section, so it never gets boxed.
  { id: 'madhu', deva: ['मधु'], iast: ['madhu'], english: ['sweet'] },
  // यज्ञ (sacrifice): यज्ञेन "through the sacrifice" is the common
  // instrumental refrain (Chamakam's "may X be fashioned through the
  // sacrifice" lines, sections 5/9/10); यज्ञो "the sacrifice itself"
  // (nominative, Chamakam 150) and यज्ञस्य "of the sacrifice" (genitive,
  // Namakam 207) are catalogued too. Doesn't include यज्ञनी (Chamakam
  // 168), a different word — an epithet ("leading the sacrifices"), not
  // this noun.
  { id: 'yajna', deva: ['यज्ञेन', 'यज्ञो', 'यज्ञस्य'], iast: ['yajñēna', 'yajñō', 'yajñasya'], english: ['sacrifice'] },
  // सहस्र (thousand): a different case/compound form at almost every
  // occurrence (dative सहस्राक्षाय, plural सहस्राणि, adverbial सहस्रधा/
  // सहस्रशः, locative-compound सहस्रयोजने, the सहस्र+अयुत compound
  // सहस्रमयुत-), catalogued individually the same way yajna's case-forms
  // are above rather than attempting stem-matching. सहस्राक्षाय and
  // सहस्रशो each have a doubled-स् variant (स्सहस्राक्षाय/स्सहस्रशो)
  // because vignanam.org's own Devanagari and IAST pages don't always
  // agree on whether the preceding visarga's sandhi (namaḥ + sahasra- ->
  // namas-sahasra-) gets written into the Devanagari or only into the
  // IAST — both spellings are kept rather than picking one as
  // "correct" (see the similar cha mē discrepancy noted in
  // sanskrit-into-tamil-script-transliteration-rules on Claude Hub).
  // Concentrated in Namakam anuvākas 1, 5, 10, 11, and 12. सहस्रेण
  // (instrumental, "with a thousand") added for Soundarya Lahari verse 2's
  // "vahatyēnaṃ śauriḥ ... sahasrēṇa śirasāṃ" (Vishnu bearing the dust
  // "upon his thousand heads") — same word, a chant-agnostic concept, one
  // more case-form catalogued the same way as the rest of this entry.
  // सहस्रारे (verse 9, "सहस्रारे पद्मे," the thousand-petaled crown-chakra
  // lotus) is सहस्र+अर compounded into its own noun rather than सहस्र
  // simply declined — added as one more literal whole-token form, same
  // "catalog the compound as-is" trick as भूमिस्त्वयि/धनुस्त्वग्ं elsewhere.
  {
    id: 'sahasra',
    deva: [
      'सहस्राक्ष',
      'सहस्राक्षाय',
      'स्सहस्राक्षाय',
      'सहस्राणि',
      'सहस्रग्ं',
      'सहस्रधा',
      'सहस्रयोजने',
      'सहस्रशो',
      'स्सहस्रशो',
      'सहस्रमयुत',
      'सहस्रेण',
      'सहस्रारे',
    ],
    iast: [
      'sahasrākṣa',
      'sahasrākṣāya',
      'ssahasrākṣāya',
      'sahasrāṇi',
      'sahasragṃ',
      'sahasradhā',
      'sahasrayōjanē',
      'sahasraśō',
      'ssahasraśō',
      'sahasramayuta',
      'sahasrēṇa',
      'sahasrārē',
    ],
    english: ['thousand', 'thousands'],
  },
  // कल्प- "may/would be fashioned/made" (optative of kḷp): कल्पतां/कल्पताम्
  // is singular, कल्पन्तां plural (Chamakam 78 — only appears once in its
  // own section, so not yet its own box there), कल्पेताम् dual (Chamakam
  // 134), कल्पताग् a sandhi variant before a following श् (Chamakam 147).
  // English side is the full phrase "may it be fashioned" (matched as a
  // unit — see renderTranslationText) rather than just "fashioned", to
  // read as the actual optative sense rather than a bare past participle.
  // Flattened to one phrase regardless of the Sanskrit's own number
  // (कल्पन्तां is plural "may they", कल्पेताम् dual "may they both") for a
  // single, consistently boxable English form.
  {
    id: 'kalpatam',
    deva: ['कल्पतां', 'कल्पताम्', 'कल्पन्तां', 'कल्पेताम्', 'कल्पताग्'],
    iast: ['kalpatāṃ', 'kalpatām', 'kalpantāṃ', 'kalpētām', 'kalpatāg'],
    english: ['may it be fashioned'],
  },
  // च मे / च म ("cha mē" / "cha ma") is Chamakam's real recurring unit, not
  // two independent words that happen to sit next to each other: it closes
  // nearly every single item in every anuvāka's enumeration ("X be mine,
  // and Y be mine, ..."), मे regularly eliding to म by the ordinary sandhi
  // rule before a vowel-initial word (confirmed against the chant data:
  // 49x "च मे", 14x "च म", no other variant). Registered as one two-word
  // concept — rather than 'cha' and 'me' individually, as they otherwise
  // would be — so it boxes and highlights as a single unit end to end: see
  // the multi-word branch in renderScriptLine/conceptsInLine, which checks
  // a concept lookup for an adjacent word-pair before falling back to
  // single-word matching. english is "be mine" (not just "mine") since
  // that's the fixed two-word unit that appears in the translation every
  // single time (verified: all 342 occurrences of "mine" across this
  // chant's translation are immediately preceded by "be").
  //
  // ञ्च मे / ñcha mē (and their elided ...म/...ma forms) round out the
  // same unit for the one fused-cha spelling that's already its own token
  // after hyphen-splitting (see the 'cha' entry above) — an ordinary
  // 2-word phrase match, no different from "च मे" itself. श्च/च्च मे
  // don't get their own phrase entries here: those never form a clean
  // "word word" pair to register since cha is glued inside the FIRST
  // word rather than being one — matchFusedChaSuffix + the fused-match
  // branches in renderScriptLine/conceptsInLine reconstruct "च मे" as the
  // lookup key on the fly instead, so this same phrase entry still
  // catches them without needing a literal entry per fused spelling.
  {
    id: 'cha-me',
    deva: ['च मे', 'च म', 'ञ्च मे', 'ञ्च म'],
    iast: ['cha mē', 'cha ma', 'ñcha mē', 'ñcha ma'],
    english: ['be mine'],
  },

  // --- Thirukkural (Tamil) ------------------------------------------
  //
  // Thirukkural is 1330 independent couplets, not one continuous hymn, so
  // there's no litany-style refrain the way Namakam/Chamakam have "cha mē" —
  // instead these are each book's own recurring thematic vocabulary,
  // registered so clicking one instance connects every other occurrence
  // (via the network-svg curves) to its English gloss in the translation
  // column, the same cross-column linking Namakam/Chamakam already have.
  // Every entry below was checked occurrence-by-occurrence against its
  // translation line for a single, consistent sense — see the deliberate
  // omission of பொருள்/poruḷ just below this list for why that check
  // matters and what it rules out.
  {
    id: 'thirukkural-aram',
    deva: ['அறம்', 'அறம்பெருகும்', 'அறம்பார்க்கும்', 'அறம்பிற'],
    iast: ['aram', 'aramperukum', 'arampaarkkum', 'arampira'],
    english: ['virtue'],
  },
  {
    id: 'thirukkural-kaamam',
    deva: ['காமம்', 'காமம்போல்', 'இவைகாமம்'],
    iast: ['kaamam', 'kaamampol', 'ivaikaamam'],
    english: ['love', 'desire', 'lust'],
  },
  {
    id: 'thirukkural-inbam',
    deva: ['இன்பம்', 'இன்பம்போல்'],
    iast: ['inpam', 'inpampol'],
    english: ['pleasure'],
  },
  // Only 3 occurrences, all in Araththuppāl's Adhikāram 1 — already boxed
  // there by plain repeat-detection (it repeats within that one section),
  // but registering it as a concept is what additionally links it to
  // "God" in the translation column.
  { id: 'thirukkural-iraivan', deva: ['இறைவன்'], iast: ['iraivan'], english: ['god'] },
  {
    id: 'thirukkural-king',
    deva: ['மன்னவன்', 'வேந்தன்', 'வேந்தன்கண்'],
    iast: ['mannavan', 'vendhan', 'vendhankan'],
    english: ['king'],
  },
  {
    id: 'thirukkural-friendship',
    deva: [
      'நட்பு', 'நட்பும்',
      'கேண்மை', 'கேண்மைவே', 'கேண்மையும்', 'கேண்மையொன்', 'கேண்மையார்',
      'புன்கேண்மை', 'பவர்கேண்மை',
    ],
    iast: [
      'natpu', 'natpum',
      'kenmai', 'kenmaive', 'kenmaiyum', 'kenmaion', 'kenmaiyaar',
      'punkenmai', 'pavarkenmai',
    ],
    english: ['friendship'],
  },
  // செல்வம் (wealth/riches) — not பொருள் (see note below): செல்வம் means
  // "wealth" consistently everywhere it appears, unlike பொருள். Chelvam
  // and Selvam are the source site's own two inconsistent spellings of the
  // same word (kept both rather than picking one, same policy as the
  // sahasra/cha mē spelling variants above).
  {
    id: 'thirukkural-wealth',
    deva: [
      'செல்வம்', 'பெருஞ்செல்வம்', 'பொருட்செல்வம்', 'விழுச்செல்வம்',
      'செவிச்செல்வம்', 'நெடுஞ்செல்வம்', 'உடைசெல்வம்',
    ],
    iast: [
      'chelvam', 'selvam', 'perunjelvam', 'porutchelvam', 'vizhuchchelvam',
      'chevichchelvam', 'netunjelvam', 'utaiselvam',
    ],
    english: ['wealth', 'riches'],
  },
  // பேதை (fool/folly/ignorant) — checked occurrence-by-occurrence across
  // all three books; unlike பொருள், its sense never shifts. Now includes
  // பேதைமை (pedhaimai, "foolishness" — the "-மை" abstract-noun derivation of
  // the same word, 9 occurrences, glossed "folly"/"foolishness" everywhere,
  // already covered by this concept's existing english list), catalogued
  // the same way Soundarya Lahari catalogs a word's different case-forms
  // under one concept rather than guessing at a stem match. Still excludes
  // பேதையார்/பேதைக்கு (plural/dative) — not yet checked occurrence-by-
  // occurrence, unlike பேதை/பேதைமை above.
  {
    id: 'thirukkural-pedhai',
    deva: ['பேதை', 'பேதைமை'],
    iast: ['pedhai', 'pedhaimai'],
    english: ['fool', 'fools', 'folly', 'foolish', 'ignorant', 'foolishness'],
  },
  // நெஞ்சு (mind/heart/soul) — the seat of feeling and thought, rendered
  // differently by register rather than by a real change in sense:
  // Araththuppāl mostly renders it "mind," Kaamaththuppāl's love poetry
  // mostly "heart"/"soul." All three glosses point at the same word.
  // நெஞ்சே/நெஞ்சமே, "O heart" — the antātis' constant self-address (Kāraikkāl
  // Ammaiyār, Cēramāṉ Perumāḷ, the Āḻvārs), in the ISO spelling their
  // transliteration uses; Thirukkural's informal "nenju" is kept alongside.
  {
    id: 'thirukkural-nenju',
    deva: ['நெஞ்சு', 'நெஞ்சே', 'நெஞ்சமே', 'நெஞ்சம்'],
    iast: ['nenju', 'neñcē', 'neñcamē', 'neñcam'],
    english: ['mind', 'heart', 'soul'],
  },
  // --- 2026-09-26 deepening pass: corpus-wide frequency scan across all
  // three books surfaced these as consistent, checkable content words (see
  // buildRegisterVarianceNote at Araththuppāl 1 for why several of them
  // carry more than one english gloss — same "one word, several registers"
  // phenomenon as நெஞ்சு above, not a sense-shift). Words considered and
  // rejected this same pass, with reasons, are listed further below, right
  // before பொருள்.
  { id: 'thirukkural-perumai', deva: ['பெருமை'], iast: ['perumai'], english: ['greatness', 'great'] },
  { id: 'thirukkural-ulaku', deva: ['உலகு'], iast: ['ulaku'], english: ['world'] },
  { id: 'thirukkural-naatu', deva: ['நாடு'], iast: ['naatu'], english: ['kingdom', 'country'] },
  { id: 'thirukkural-nandri', deva: ['நன்றி'], iast: ['nandri'], english: ['benefit', 'benefits'] },
  // துணை (aid/support/help/friend/companion) — one word for whatever
  // steadies a person: a virtue that outlasts you (4.36), a spouse who
  // shares a household's means (6.51), a listening ear in adversity
  // (42.416), a companion through a sleepless night (117.1163). The
  // English gloss tracks what kind of support is meant, not a change in
  // the underlying word.
  { id: 'thirukkural-thunai', deva: ['துணை'], iast: ['thunai'], english: ['aid', 'help', 'support', 'friend', 'companion'] },
  // சான்றோர் (the wise/learned/great/perfect) — Thirukkural's recurring
  // honorific for people of proven worth; which English word a translator
  // reaches for varies, the class of person it names doesn't.
  { id: 'thirukkural-saandror', deva: ['சான்றோர்'], iast: ['saandror'], english: ['wise', 'learned', 'great', 'perfect'] },
  // நோய் (evil/disease/malady/suffering) — literally "sickness," used two
  // ways depending on register: Araththuppāl/Porutpāl's ethical maxims
  // extend it metaphorically to "evil(s)"/moral affliction, while
  // Kaamaththuppāl's love poetry uses it closer to its literal sense for
  // lovesickness ("malady," "disease"). Same word as நெஞ்சு's mind/heart
  // split — register, not polysemy.
  { id: 'thirukkural-noi', deva: ['நோய்'], iast: ['noi'], english: ['evil', 'evils', 'disease', 'malady', 'suffering'] },
  { id: 'thirukkural-itumpai', deva: ['இடும்பை'], iast: ['itumpai'], english: ['sorrow', 'sorrows', 'trouble', 'troubles', 'distress'] },
  // படை — literally "army," but Kaamaththuppāl's love poetry repurposes it
  // as "weapon" for whatever wounds the speaker (a flute's sound, a
  // lover's words, a memory) — an army is a massed instrument of attack, a
  // weapon is a single one; the same underlying image, extended by genre
  // rather than genuinely renamed.
  { id: 'thirukkural-patai', deva: ['படை'], iast: ['patai'], english: ['army', 'weapon'] },
  { id: 'thirukkural-kaadhalar', deva: ['காதலர்'], iast: ['kaadhalar'], english: ['lover', 'beloved'] },
  // இன்னா (painful/disagreeable/unpleasant) — the negative counterpart of
  // இனிது ("sweet/pleasant"); the two form the title pair of Araththuppāl's
  // adhikārams 12/13, "இனியவை கூறல்" (Speaking Sweetly) and "இன்னாசெய்யாமை"
  // (Not Causing Pain). Registered conservatively — several of its ~17
  // occurrences are paraphrased loosely enough that no single English word
  // matches, so this only boxes where the translation happens to use one
  // of the three glosses below; the rest stay unboxed on the Tamil side
  // rather than risk a wrong connection.
  { id: 'thirukkural-innaa', deva: ['இன்னா'], iast: ['innaa'], english: ['painful', 'disagreeable', 'unpleasant'] },
  // ஒழுக்கம்/ozhukkam ("propriety of conduct") is Adhikāram 14's own subject
  // (its title, ஒழுக்கமுடைமை, literally means "the possession of ozhukkam")
  // and recurs there in several case/compound forms, all glossed the same
  // "propriety"/"conduct" pair: bare ஒழுக்கம் (131), the pre-compound stem
  // ஒழுக்க (6, 133, 135, 139 — a genuine sandhi vowel/consonant drop before
  // the next word, not a typo), the assimilated ஒழுக்கந் (ம்->ந் before a
  // following த-, 132), the locative ஒழுக்கத்து (21), and ஒழுக்காறாக் (161,
  // from the related noun ஒழுக்காறு). ஒழுக்கத்தின் (dative/locative) shows a
  // real Tamil-specific wrinkle: at 136/137 its final ன் migrates onto the
  // FOLLOWING vowel-initial word when they're on the same source line
  // (ஒழுக்கத்தின் ஒல்கார் -> ஒழுக்கத்தி னொல்கார்), so the Devanagari-column
  // token is the truncated ஒழுக்கத்தி while the IAST column (tokenized
  // differently, no migration) keeps the full ozhukkaththin — both are
  // catalogued below rather than picking one. Excludes ஒழுக்கி (48) — a verb
  // form ("conducting oneself"), not this noun, and its translation doesn't
  // contain "conduct"/"propriety" either.
  {
    id: 'thirukkural-ozhukkam',
    deva: ['ஒழுக்கம்', 'ஒழுக்க', 'ஒழுக்கந்', 'ஒழுக்கத்து', 'ஒழுக்கத்தி', 'ஒழுக்காறாக்'],
    iast: ['ozhukkam', 'ozhukka', 'ozhukkaththu', 'ozhukkaththin', 'ozhukkaaraak'],
    english: ['propriety', 'conduct'],
  },
  // இழுக்கம்/izhukkam ("impropriety") — ஒழுக்கம்'s direct antonym, same
  // adhikāram (133, 136, 137) plus the related noun இழுக்காற்றின் (164,
  // "from transgression"). Excludes இழுக்கா (35, 48) — the negative verb
  // participle ("not deviating"), not this noun; its translations don't
  // contain "impropriety"/"transgression" either, same reasoning as
  // ஒழுக்கி above.
  {
    id: 'thirukkural-izhukkam',
    deva: ['இழுக்கம்', 'இழுக்கத்தின்', 'இழுக்காற்றின்'],
    iast: ['izhukkam', 'izhukkaththin', 'izhukkaatrin'],
    english: ['impropriety', 'transgression'],
  },
  // Considered and deliberately excluded this same pass (checked
  // occurrence-by-occurrence, not just assumed):
  // - ஆக்கம் (gain/growth) — no stable single gloss; renders as "source of
  //   happiness," "glory," "advantage," "wealth," and "property" across its
  //   12 occurrences with no consistent pattern to the variation, unlike
  //   நோய்/படை's clean register split above.
  // - இன்மை ("-மை" on இல், "the absence of X") — structural, not lexical:
  //   like Tamil's -ஆமை negative-nominalizer suffix (see
  //   buildNegativeNominalizerNote, Araththuppāl 30) or Sanskrit's a-
  //   privative, its English rendering is whatever "X" is negated (poverty,
  //   disgrace, want, freedom-from-bias), not one fixed word.
  // - வாழ்க்கை (life/living) — too loosely paraphrased in this translation
  //   to reliably match; several occurrences render it as "prosperity" with
  //   no literal "life"/"living" substring at all.
  // - கண் — genuine polysemy, not register variance: usually "eye" (very
  //   consistent in Kaamaththuppāl's love poetry), but at least one
  //   occurrence (Araththuppāl 15) is instead the unrelated locative
  //   postposition ("at/in," cognate with இடம்) with no "eye" in sight —
  //   the same trap as பொருள், just less famous.
  // - சொல் — noun ("word/speech") and verb root ("to say") both attested,
  //   with no reliable way to tell which from the surface form alone.
  // - தலை — heavy polysemy (head / chief / first / highest), needs
  //   individual-occurrence disambiguation this pass didn't do.
  // - நன்று, அரிது — common adjectives ("good," "rare") whose gloss floats
  //   too freely in this translation's loose paraphrasing to attribute
  //   reliably to this specific word rather than incidental phrasing
  //   elsewhere in the same line.
  // - வினை (deed/action/work) — real sense, but scattered across too many
  //   English words (evils/actions/acts/deeds/work/undertaking) with too
  //   little repetition in any one of them to be worth registering.
  //
  // பொருள் (poruḷ) is deliberately NOT registered as a concept, despite
  // being one of Thirukkural's most frequent words and literally the title
  // of its second book: checked occurrence-by-occurrence, it shifts sense
  // constantly — "wealth"/"property" in some lines, but "meaning" (சொற்பொருள்),
  // "the true thing/reality" (மெய்ப்பொருள்), "subject matter" (நுண்பொருள்),
  // "advantage" (அதுபொருள்), and more elsewhere. A single english gloss
  // would box several of these wrongly and connect them to unrelated
  // translation words. Left out rather than forced — same judgment call
  // as the sanskrit-in-tamil-script Math-domain KB decision earlier.

  // --- Soundarya Lahari (see linkScope: 'local' on the CHANTS entry — these
  // still catalog every attested case-form of a word across the whole poem,
  // same discipline as Namakam/Chamakam above, but a click only lights up
  // occurrences within the same verse or an adjacent one; the point here is
  // recognizing the SAME word wearing a different case-ending, not building
  // a hymn-wide word cloud.) ---
  //
  // भूमि/bhūmi ("earth") — v.1's भूमौ (locative, "on the earth") and भूमि
  // (from भूमि-रे-वावलम्बनम्, itself भूमिः+एव+अवलम्बनम् sandhi-fused but
  // already hyphen-split by the source into its own clean token) are the
  // same noun in two cases. भूमिस्त्वयि (v.35, "त्वं भूमिः" + त्वयि sandhi-
  // fused with no source hyphen this time) is added as one more literal
  // whole-token form, same trick as धनुस्त्वग्ं above — the त्वयि/"in you"
  // riding along inside that fused token isn't separately boxed. Excludes
  // भूमिं (v.10, "अवाप्य स्वां भूमिं") — checked in context, that line is
  // the kuṇḍalinī-cakra visualization and भूमिं there means "level/plane,"
  // not "earth," a real sense-shift rather than just a different case.
  {
    id: 'sl-earth',
    deva: ['भूमौ', 'भूमि', 'भूमिस्त्वयि'],
    iast: ['bhūmau', 'bhūmi', 'bhūmistvayi'],
    english: ['earth'],
  },
  // त्वम्/tvam ("you," addressing the Goddess) — v.1's त्वयि (locative,
  // "against you") and त्वमेव (त्वम्+एव, "you alone/yourself") are the same
  // pronoun in different cases, the second carrying एव ("indeed/alone") as
  // an enclitic the way च/cha does elsewhere on this site. Excludes त्वाम्
  // (v.1 line 5, "अतस्त्वामाराध्यां") — its final म् sandhi-merges directly
  // into the vowel of the next word (आ) with no halant or hyphen left to
  // split on, unlike म्पतये/धनुस्त्वग्ं's cleaner boundaries, so it can't be
  // safely extracted as its own token. v.4 adds त्वमेका (त्वम्+एका, "you
  // alone" again but with एका — feminine "one," agreeing with the Goddess —
  // rather than एव's enclitic "indeed"; different word, same gloss, so
  // folded into this concept's existing "you alone" rather than a new
  // one). v.5 adds त्वां/tvāṃ, the accusative — cleanly its own token this
  // time ("स्मरः...त्वां नत्वा," "bowing to you"), unlike v.1's त्वाम् above,
  // because it's followed by a consonant (नत्वा) rather than a vowel, so
  // ordinary anusvāra sandhi applies instead of the vowel-merge that made
  // त्वाम् unextractable. Since linkScope: 'local' only lets adjacent
  // verses connect, त्वमेका (v.4) and त्वां (v.5) light up together, but
  // neither reaches back to v.1's forms three verses away. v.15 adds त्वा/
  // tvā — an unaccented enclitic accusative, a lighter alternative to
  // त्वाम्/त्वां still current in classical (not just Vedic) Sanskrit, same
  // case and meaning as v.5's त्वां, just a different, shorter surface form
  // of it ("सकृन्न त्वा नत्वा," "without bowing to you even once"). v.22
  // adds त्वं — the bare nominative this time ("भवानि त्वं दासे मयि,"
  // "Bhavani, you [cast your glance] on me, your servant"), spelled with
  // an anusvāra like सतां/सन्तः rather than an explicit म्+virāma; verified
  // against the source's exact codepoints this time rather than assumed,
  // after the सताम्/सतां mixup documented on सत् below.
  {
    id: 'sl-you',
    deva: ['त्वयि', 'त्वमेव', 'त्वमेका', 'त्वां', 'त्वा', 'त्वं'],
    iast: ['tvayi', 'tvamēva', 'tvamēkā', 'tvāṃ', 'tvā', 'tvaṃ'],
    english: ['you', 'you alone'],
  },
  // भवानि/bhavāni ("O Bhavani," vocative — an epithet of the Goddess)
  // repeats twice in v.22, describing a devotee who tries and fails to
  // finish a prayer: "Bhavani, [have mercy]..." trails into just
  // "Bhavani, you..." before the words give out. Same spelling both
  // times, no case variation to catalog, but still worth registering
  // since a plain repeated proper name doesn't automatically link to its
  // English translation the way a MEANING_CONCEPTS entry does — the
  // generic same-section repeat-detection would box both occurrences on
  // the Sanskrit/IAST side regardless, but never bridge to "Bhavani" in
  // the English column without this.
  { id: 'sl-bhavani', deva: ['भवानि'], iast: ['bhavāni'], english: ['bhavani'] },
  // पूजा/pūjā ("worship") — doubled for emphasis in v.25 line 100 itself
  // ("भवेत् पूजा पूजा," roughly "becomes worship, [very] worship") the same
  // way Thirukkural doubles a negated verb for its own rhetorical weight
  // (see buildNegativeNominalizerNote) — a Sanskrit माटक्कु-style repeat
  // rather than a scribal accident.
  { id: 'sl-puja', deva: ['पूजा'], iast: ['pūjā'], english: ['worship'] },
  // विरिञ्चिः/viriñchiḥ (Brahma) — v.1 mentions him only deep inside a
  // compound ("हरिहरविरिञ्चादिभिः," not boxable, see the v.1 note) and v.12's
  // "विरिञ्चिप्रभृतयः" is likewise fused; v.26 is his first CLEAN standalone
  // occurrence ("विरिञ्चिः पञ्चत्वं व्रजति," "Brahma himself passes away," in
  // the great-dissolution verse) — registered now so it's ready to connect
  // the next time he appears unfused nearby.
  { id: 'sl-virinchi', deva: ['विरिञ्चिः'], iast: ['viriñchiḥ'], english: ['brahma'] },
  // शम्भु/śambhu ("the benevolent one," an epithet of Shiva distinct from
  // the bare name शिव) — शम्भोः (genitive, Soundarya Lahari v.34, "शरीरं
  // त्वं शम्भोः," "you are the very body of Shambhu") and शम्भुं
  // (accusative, v.36, "परं शम्भुं वन्दे," "I bow to the supreme Shambhu").
  // Chant-agnostic like rudra/sahasra above — id keeps its "sl-" prefix
  // from where it was first registered, but शम्भो (vocative) was added for
  // Shivananda Lahari verses 2 and 4 ("गलन्ती शम्भो," "चिरं याचे शम्भो"),
  // a different poem entirely; v.6's शम्भोः ("पदाम्भोजं शम्भोर्भज") is
  // sandhi-fused there, not boxable.
  {
    id: 'sl-shambhu',
    deva: ['शम्भोः', 'शम्भुं', 'शम्भो'],
    iast: ['śambhōḥ', 'śambhuṃ', 'śambhō'],
    english: ['shambhu'],
  },
  // दृष्टि/dṛṣṭi ("glance") — v.51's "जननी दृष्टिः सकरुणा," "mother, let
  // that glance turn compassionate," a clean nominative. Kept separate
  // from दृश्/dṛś below despite the near-identical meaning and shared root
  // (√dṛś, "to see") — दृष्टि is its own -ति-suffixed noun, not a case-form
  // of the root-noun दृश् itself, so folding them into one concept would
  // misrepresent two different (if closely related) words as one.
  { id: 'sl-drishti', deva: ['दृष्टिः'], iast: ['dṛṣṭiḥ'], english: ['glance'] },
  // दृश्/dṛś ("eye/glance," an irregular root-noun declined directly off
  // √dṛś rather than through a derived stem) — दृशः (v.55, ablative/
  // genitive, "your eyes/glances") and दृशा (v.57, instrumental, "by your
  // glance"). Two verses apart, outside linkScope's adjacent window, but
  // still the same word in two cases.
  // दृशौ/dṛśau (dual, "the two eyes") — Rama Raksha v.5 and Narasimha
  // Kavacham v.8, the kavacham body-map's eyes.
  { id: 'sl-drsh', deva: ['दृशः', 'दृशा', 'दृशौ'], iast: ['dṛśaḥ', 'dṛśā', 'dṛśau'], english: ['eyes', 'glance'] },
  // नेत्र/nētra ("eye") — v.52's "इमे नेत्रे," "these two eyes," a clean
  // dual. v.53's नेत्रत्रितयम् and v.54's नेत्रैः are both sandhi-fused into
  // a bigger compound in this source ("त्वन्नेत्रत्रितयम्,"
  // "दयामित्रैर्नेत्रैररुण..."), so only this one occurrence is boxable for
  // now — a third word for "eye" in this stretch of the poem, alongside
  // दृष्टि and दृश् above, each grammatically its own noun rather than a
  // shared root's case-forms.
  // नयने/nayanē (Shiva Raksha v.3), the same dual "two eyes" with a
  // different noun, added to this concept rather than a new one.
  { id: 'sl-netra', deva: ['नेत्रे', 'नयने'], iast: ['nētrē', 'nayanē'], english: ['eyes'] },
  // जननि/janani ("O mother," vocative) — v.28 and v.64, identical spelling
  // both times, far enough apart (36 verses) that linkScope keeps them
  // from cross-connecting, but each still boxes and links to "mother" on
  // its own line. One more vocative epithet for the Goddess alongside
  // भवानि, rotating in as the poem's other addresses do.
  { id: 'sl-janani', deva: ['जननि'], iast: ['janani'], english: ['mother'] },
  // देवि/dēvi ("O goddess," vocative) — v.72, "समं देवि स्कन्द...". A third
  // rotating vocative epithet for the Goddess alongside भवानि/जननि; this
  // poem rarely addresses her the same way twice in a row.
  { id: 'sl-devi', deva: ['देवि'], iast: ['dēvi'], english: ['goddess'] },
  // गिरिसुता/girisutā ("daughter of the mountain") — गिरिसुते, vocative,
  // clean in v.67 and v.82 (its v.78 sibling, "नाभिर्गिरिसुते," is sandhi-
  // fused and not boxable). Far enough apart not to cross-link under
  // linkScope: 'local', but the same recurring epithet either way.
  { id: 'sl-girisuta', deva: ['गिरिसुते'], iast: ['girisutē'], english: ['daughter of the mountain'] },
  // पार्वति/pārvati — her own name used as a vocative, v.81, distinct from
  // the epithets (भवानि/जननि/देवि/गिरिसुता) that surround it elsewhere.
  { id: 'sl-parvati', deva: ['पार्वति'], iast: ['pārvati'], english: ['parvati'] },
  // मातृ/mātṛ ("mother") — मातः, vocative, v.84 ("ममाप्येतौ मातः शिरसि
  // दयया," "place these two [feet] on my head too, O mother"). A
  // different word from जननि/sl-janani despite the identical gloss — the
  // CONCEPT_BY_ENGLISH fix above is exactly what lets both safely share
  // "mother" now. v.65's मातः ("विलीयन्ते मातस्तव") is sandhi-fused
  // (मातः+तव), not boxable.
  { id: 'sl-matar', deva: ['मातः'], iast: ['mātaḥ'], english: ['mother'] },
  // चरण/charaṇa ("foot") — the recurring subject of verses 83-90, the
  // poem's closing stretch on the Goddess's feet. चरणौ (dual, v.84 and
  // v.89 — "धेहि चरणौ"/"ते चण्डि चरणौ") and चरणे (locative, v.90 — "यातु
  // चरणे"), the last two adjacent verses so this pair also cross-links
  // under linkScope: 'local', unlike the wider-spaced repeats above.
  { id: 'sl-charana', deva: ['चरणौ', 'चरणे'], iast: ['charaṇau', 'charaṇē'], english: ['feet', 'foot'] },
  // वाच्/vāch ("speech/words") — वाचां, genitive plural, in the poem's own
  // closing verse (v.100, "tava janani vāchāṃ stutiriyam," "this hymn of
  // praise to your powers of speech"). Every earlier candidate for this
  // word (v.16's वाग्भिः, v.17's वाचाम्) was sandhi-fused into its neighbor
  // with no space to split on — this is the first (and, in this poem,
  // only) occurrence clean enough to box.
  { id: 'sl-vach', deva: ['वाचां'], iast: ['vāchāṃ'], english: ['speech'] },
  // शिवः/śivaḥ — unambiguously the god Śiva, nominative masculine, every
  // time it occurs (v.1, v.32, v.92 all translate it as the proper name).
  // Deliberately does NOT include शिवे despite looking like a one-letter
  // case-shift of the same word: शिवे is usually the VOCATIVE of the
  // feminine शिवा ("O auspicious one," addressing the Goddess — see
  // buildEarthAndYouDeclensionNote) but once (v.51, "शिवे शृङ्गारार्द्रा")
  // is instead the LOCATIVE of this masculine शिवः ("melting toward Shiva").
  // Same spelling, two different words depending on gender/case/context —
  // exactly the polysemy trap catalogued for பொருள் above, so it's
  // explained in the verse-1 note rather than mapped to either gloss.
  // शिव (vocative, "O Shiva") added for Shivananda Lahari v.4, "याचे शम्भो
  // शिव तव पदाम्भोज-भजनम्" — chant-agnostic like rudra/sahasra/sl-shambhu,
  // unambiguous here (unlike शिवे above, this bare vocative masculine form
  // has no feminine-word homograph to worry about).
  { id: 'sl-shiva', deva: ['शिवः', 'शिव'], iast: ['śivaḥ', 'śiva'], english: ['shiva'] },
  // सत्/sat ("the good/wise [people]," used substantively) — सतां (genitive
  // plural) in v.15 twice and v.16 once, सन्तः (nominative plural) in v.16
  // once: same word, two cases, three clean occurrences across two adjacent
  // verses. Spelled सतां with an anusvāra (ं, U+0902) every time in this
  // source, not the equivalent-sounding सताम् with an explicit म्+virāma —
  // caught only because the IAST side (which does spell it satāṃ either
  // way) boxed correctly while the Devanagari side silently didn't, since
  // CONCEPT_BY_DEVA is an exact-string lookup with no normalization between
  // an anusvāra and the nasal consonant it stands in for. Worth checking
  // for on any future word ending in a nasal before adding it here. Both
  // वाग्भिः (v.16) and वाचाम् (v.17) mean "speech" and share a root too, but
  // neither is a clean token — both are sandhi-fused with no space or
  // hyphen to split on ("गभीराभिर्वाग्भिर्विदधति," "सवित्रीभिर्वाचां"), unlike
  // सतां/सन्तः which sit as their own space-separated words every time — so
  // "speech" isn't registered here.
  {
    id: 'sl-satam',
    deva: ['सतां', 'सन्तः'],
    iast: ['satāṃ', 'santaḥ'],
    english: ['the wise', 'wise', 'good souls'],
  },

  // --- Shivananda Lahari (also linkScope: 'local' — see the CHANTS entry
  // above; another continuous 100-verse Śaṅkara poem, not a litany) ---
  //
  // पशुपति/paśupati ("Lord of bound souls/creatures," one of this poem's
  // most frequent epithets for Shiva) — पशुपतिं (accusative, v.3) and
  // पशुपते (vocative, v.5 and v.8).
  {
    id: 'shl-pashupati',
    // पशूनां पते (v.31, "त्वेकं पशूनां पते," "O Lord of bound souls, is
    // this one [deed] alone...") says the same thing analytically — पशु
    // ("bound souls") genitive plural + पते ("lord") vocative, two words —
    // rather than as one compound. Same two-word-phrase mechanism as
    // Namakam/Chamakam's cha mē (see phrase-level-meaning-concepts-vs-
    // single-word on Claude Hub): registered as its own literal phrase
    // form on this concept rather than a different one.
    deva: ['पशुपतिं', 'पशुपते', 'पशूनां पते'],
    iast: ['paśupatiṃ', 'paśupatē', 'paśūnāṃ patē'],
    english: ['lord of bound souls', 'lord of creatures'],
  },
  // दीन ("poor/distressed") — दीनानां (genitive plural, v.14, "परमबन्धुः
  // दीनानां," "closest kinsman of the distressed"). v.13's दीनः is
  // sandhi-fused ("दीनस्तव"), not boxable.
  { id: 'shl-dina', deva: ['दीनानां'], iast: ['dīnānāṃ'], english: ['distressed'] },
  // विभु/vibhu ("all-pervading," a standing epithet this poem reaches for
  // constantly) — विभो, vocative, already clean in v.21/22/23/29 within
  // this one batch alone; expect it throughout. Glossed "pervading," not
  // the hyphenated "all-pervading" the translation actually uses — the
  // English-side tokenizer splits on hyphens (see the leading-apostrophe
  // gotcha fixed earlier for the same class of issue), so a hyphenated
  // multi-word gloss can never match; "all" and "pervading" end up as two
  // separate word-runs at render time, and only the second one is usable.
  { id: 'shl-vibhu', deva: ['विभो'], iast: ['vibhō'], english: ['pervading'] },
  // शङ्कर/śaṅkara ("Shankara," a name of Shiva — also, unrelatedly, the
  // author's own name) — the closing words of v.22 and v.23 are identical
  // ("कथमिह सहे शङ्कर विभो," "how could I bear it here, O Shankara, O
  // all-pervading one"), a real refrain spanning two adjacent verses, not
  // a coincidence. Since buildRepeatCounts only scans repeats within a
  // single section, a cross-verse refrain like this NEEDS a MEANING_CONCEPTS
  // entry to connect at all — the generic repeat-boxing alone would treat
  // v.22 and v.23 as unrelated.
  { id: 'shl-shankara', deva: ['शङ्कर'], iast: ['śaṅkara'], english: ['shankara'] },
  // स्वामिन्/svāmin ("Master") — clean once, v.21 ("जय स्वामिन् शक्त्या
  // सह," "reign there in triumph, O Master, together with Shakti"). Its
  // v.24 and v.30 siblings are both broken by the source's own mid-word
  // hyphenation (स्वामि-न्परमशिव, stranding the final न् with the next
  // word — the same phenomenon as म्पतये/म्मे in Namakam) or sandhi-fused
  // (स्वामिंस्त्रिलोकीगुरो), so only this one is boxable for now.
  { id: 'shl-svamin', deva: ['स्वामिन्'], iast: ['svāmin'], english: ['master'] },
  // गिरिश/giriśa ("Lord of the mountain," an epithet distinct from
  // गिरिसुता/girisutā, Soundarya Lahari's "daughter of the mountain," for
  // the parallel form) — v.26 and v.27, adjacent verses.
  // गिरिशो/giriśō (v.44, "गिरिशो विशदाकृतिश्च," "the mountain Lord, of
  // pure and shining form") is the nominative — गिरिशः sandhi-realized as
  // -o before the voiced विशदाकृतिः that follows — one more case-form
  // alongside v.43's vocative गिरिश.
  { id: 'shl-girisha', deva: ['गिरिश', 'गिरिशो'], iast: ['giriśa', 'giriśō'], english: ['lord of the mountain'] },
  // देव/deva ("God"), vocative — v.33, "सकृदेव देव भवतः," "O God, is not
  // even a single [deed]..." — सकृदेव (sakṛt+eva, "even once") is the
  // fused word right before it; देव itself sits clean and separate.
  { id: 'shl-deva', deva: ['देव'], iast: ['dēva'], english: ['god'] },

  // --- Sri Bala Raksha Stotram (first entry in the "Raksha & Kavacham"
  // collection — see COLLECTIONS/CHANTS above). A litany
  // of short protective imperatives to the goddess, not a continuous poem,
  // so no linkScope: 'local' — whole-chant linking is correct here, same
  // as Namakam/Chamakam. ---
  // देहि मे/dēhi mē, "grant me" — the stotra's structural refrain, closing
  // six of its eighteen verses' second line (v.7-10, 15, 17): a two-word
  // phrase like Namakam's "cha mē," so it's registered whole rather than
  // relying on the standalone "me" concept above, which would otherwise
  // catch every one of these "मे" tokens on its own. v.10's देहि is
  // sandhi-fused to the previous word (यत्तद्देहि, यत्तत्+देहि with no
  // word-space) so it doesn't register there — same sandhi-fusion
  // exclusion as elsewhere.
  { id: 'brs-dehi-me', deva: ['देहि मे'], iast: ['dēhi mē'], english: ['grant me'] },
  // रक्ष/rakṣa, the bare imperative "protect" — the verb the whole genre
  // (and this stotra's own title) is named for. v.1, v.2, v.11 (doubled,
  // "रक्ष रक्ष माम्"), v.13. परिरक्ष (v.12) is the same root under a
  // prefix, a different surface token, so left unboxed here.
  // रक्षतु/rakṣatu, the third-person "may [he] protect" (Narasimha
  // Kavacham v.8) — same root, added here rather than as a new concept.
  // रक्षेत्/रक्षेद् (optative) and रक्षसे ("you protect") — the Devi
  // Kavacham's verbs, nearly all from √rakṣ.
  { id: 'brs-raksha', deva: ['रक्ष', 'रक्षतु', 'रक्षेत्', 'रक्षेद्', 'रक्षसे'], iast: ['rakṣa', 'rakṣatu', 'rakṣēt', 'rakṣēd', 'rakṣasē'], english: ['protect'] },
  // पाहि मां/pāhi māṃ, "protect me" — a synonymous refrain built on a
  // different root (√pā, not √rakṣ), alternating with rakṣa's imperative
  // through the stotra: v.3, v.5, v.14 read "पाहि मां," while v.4 reverses
  // the word order ("मां पाहि"), so both orders are registered.
  {
    id: 'brs-pahi-mam',
    deva: ['पाहि मां', 'मां पाहि'],
    iast: ['pāhi māṃ', 'māṃ pāhi'],
    english: ['protect me'],
  },
  // कृपया/kṛpayā, "with compassion" — v.3 (कृपयाऽनिशम्, avagraha-separated,
  // so still a clean token), v.11, v.18. v.17's कृपयेश्वरि is sandhi-fused
  // (kṛpayā+īśvari → kṛpayē-), so excluded.
  { id: 'brs-kripaya', deva: ['कृपया'], iast: ['kṛpayā'], english: ['compassion'] },
  // Four distinct goddess-vocatives, each addressed to her under a
  // different aspect — kept as separate concepts rather than merged,
  // matching how Soundarya/Shivananda Lahari keep देवि, जननि, मातः etc.
  // distinct even though all gloss roughly "goddess/mother" in English.
  { id: 'brs-devesi', deva: ['देवेशि'], iast: ['dēvēśi'], english: ['queen of the gods'] },
  { id: 'brs-parameshvari', deva: ['परमेश्वरि'], iast: ['paramēśvari'], english: ['supreme goddess'] },
  { id: 'brs-jagadishvari', deva: ['जगदीश्वरि'], iast: ['jagadīśvari'], english: ['ruler of the world'] },
  { id: 'brs-paradevate', deva: ['परदेवते'], iast: ['paradēvatē'], english: ['supreme deity'] },

  // --- Shared across the Raksha Stotrams & Kavachams (chant-agnostic) ---
  // पातु/pātu, "may [he] protect" — the third-person imperative every
  // kavacham is built on, one per body part ("शिरो मे राघवः पातु," "may
  // Raghava protect my head"). A different root (√pā) from रक्ष (√rakṣ),
  // which is why the two stay separate concepts even though both gloss
  // "protect" in English.
  // पायात्/pāyāt — the optative of the same root (Raghavendra Raksha Kavacham).
  { id: 'patu', deva: ['पातु', 'पायात्'], iast: ['pātu', 'pāyāt'], english: ['protect'] },
  // नमामि/प्रणमामि, "I bow" — the closing act of Rama Raksha v.29,
  // Narasimha v.31, Ashtamurti v.9, and the Pañcarakṣā refrains; also links
  // Shivananda Lahari's "शिरसा चैव सदाशिवं नमामि" (v.90).
  { id: 'namami', deva: ['नमामि', 'प्रणमामि'], iast: ['namāmi', 'praṇamāmi'], english: ['bow'] },
  // The kavacham head-to-foot body map. Registered once, chant-agnostic,
  // since every kavacham walks the same body in the same order — any
  // future kavacham gets these connections with no new registration.
  // Case-forms vary by text (Rama Raksha's कटी vs. Narasimha's कटिम्, ऊरू
  // vs. ऊरु), so each attested surface form is catalogued individually.
  { id: 'body-head', deva: ['शिरो', 'शिरः', 'शिरसा', 'शिरसि', 'शीर्षं', 'मूर्ध्नि'], iast: ['śirō', 'śiraḥ', 'śirasā', 'śirasi', 'śīrṣaṃ', 'mūrdhni'], english: ['head'] },
  { id: 'body-topknot', deva: ['शिखां'], iast: ['śikhāṃ'], english: ['topknot'] },
  { id: 'body-crown', deva: ['मौलिं'], iast: ['mauliṃ'], english: ['crown'] },
  { id: 'body-brows', deva: ['भ्रुवौ'], iast: ['bhruvau'], english: ['brows'] },
  { id: 'body-beard', deva: ['कूर्चं'], iast: ['kūrchaṃ'], english: ['beard'] },
  { id: 'body-cheeks', deva: ['गण्डौ', 'कपोलौ'], iast: ['gaṇḍau', 'kapōlau'], english: ['cheeks'] },
  { id: 'body-lips', deva: ['ओष्ठाधरौ'], iast: ['ōṣṭhādharau'], english: ['lips'] },
  { id: 'body-teeth', deva: ['दन्तान्'], iast: ['dantān'], english: ['teeth'] },
  { id: 'body-chin', deva: ['चिबुकं'], iast: ['chibukaṃ'], english: ['chin'] },
  { id: 'body-forehead', deva: ['भालं', 'ललाटे'], iast: ['bhālaṃ', 'lalāṭē'], english: ['forehead'] },
  { id: 'body-ears', deva: ['श्रुती', 'कर्णौ'], iast: ['śrutī', 'karṇau'], english: ['ears'] },
  { id: 'body-nose', deva: ['घ्राणं', 'नासं', 'नासां', 'नासिके', 'नासिकायां'], iast: ['ghrāṇaṃ', 'nāsaṃ', 'nāsāṃ', 'nāsikē', 'nāsikāyāṃ'], english: ['nose'] },
  { id: 'body-mouth', deva: ['मुखं', 'मुखे'], iast: ['mukhaṃ', 'mukhē'], english: ['mouth'] },
  { id: 'body-neck', deva: ['कंधरां', 'ग्रीवायां'], iast: ['kaṃdharāṃ', 'grīvāyāṃ'], english: ['neck'] },
  { id: 'body-tongue', deva: ['जिह्वां', 'रसनां', 'जिह्वायां'], iast: ['jihvāṃ', 'rasanāṃ', 'jihvāyāṃ'], english: ['tongue'] },
  { id: 'body-face', deva: ['वक्त्रं', 'वदनं'], iast: ['vaktraṃ', 'vadanaṃ'], english: ['face'] },
  { id: 'body-throat', deva: ['कण्ठं', 'कण्ठे'], iast: ['kaṇṭhaṃ', 'kaṇṭhē'], english: ['throat'] },
  { id: 'body-shoulders', deva: ['स्कन्धौ', 'स्कन्धयोः'], iast: ['skandhau', 'skandhayōḥ'], english: ['shoulders'] },
  { id: 'body-arms', deva: ['भुजौ', 'बाहू'], iast: ['bhujau', 'bāhū'], english: ['arms'] },
  { id: 'body-chest', deva: ['स्तनौ', 'वक्षो'], iast: ['stanau', 'vakṣō'], english: ['chest', 'breasts'] },
  { id: 'body-fingers', deva: ['हस्ताङ्गुलीन्'], iast: ['hastāṅgulīn'], english: ['fingers'] },
  { id: 'body-sides', deva: ['पार्श्वे'], iast: ['pārśvē'], english: ['sides'] },
  { id: 'body-back', deva: ['पृष्ठं'], iast: ['pṛṣṭhaṃ'], english: ['back'] },
  { id: 'body-hands', deva: ['करौ'], iast: ['karau'], english: ['hands'] },
  { id: 'body-heart', deva: ['हृदयं', 'हृदि', 'हृदये'], iast: ['hṛdayaṃ', 'hṛdi', 'hṛdayē'], english: ['heart'] },
  { id: 'body-belly', deva: ['जठरं', 'कुक्षिं', 'कुक्षौ', 'उदरे'], iast: ['jaṭharaṃ', 'kukṣiṃ', 'kukṣau', 'udarē'], english: ['belly'] },
  { id: 'body-waist', deva: ['मध्यं'], iast: ['madhyaṃ'], english: ['waist'] },
  { id: 'body-navel', deva: ['नाभिं', 'नाभौ'], iast: ['nābhiṃ', 'nābhau'], english: ['navel'] },
  { id: 'body-hips', deva: ['कटी', 'कटिम्', 'कटिं', 'जघनं', 'कट्यां'], iast: ['kaṭī', 'kaṭim', 'kaṭiṃ', 'jaghanaṃ', 'kaṭyāṃ'], english: ['hips'] },
  { id: 'body-haunches', deva: ['सक्थिनी'], iast: ['sakthinī'], english: ['haunches'] },
  // उरू (Shiva Raksha v.7) is the source's own spelling of ऊरू, kept as-is.
  { id: 'body-thighs', deva: ['ऊरू', 'ऊरु', 'उरू'], iast: ['ūrū', 'ūru', 'urū'], english: ['thighs'] },
  { id: 'body-knees', deva: ['जानुनी'], iast: ['jānunī'], english: ['knees'] },
  { id: 'body-shins', deva: ['जङ्घे'], iast: ['jaṅghē'], english: ['shins'] },
  { id: 'body-ankles', deva: ['गुल्फौ'], iast: ['gulphau'], english: ['ankles'] },
  { id: 'body-feet', deva: ['पादौ'], iast: ['pādau'], english: ['feet'] },
  { id: 'body-whole', deva: ['वपुः', 'सर्वाङ्गे'], iast: ['vapuḥ', 'sarvāṅgē'], english: ['body'] },
  { id: 'body-skin', deva: ['त्वचं'], iast: ['tvachaṃ'], english: ['skin'] },
  { id: 'body-limbs', deva: ['सर्वाङ्गानि'], iast: ['sarvāṅgāni'], english: ['limbs'] },
  // भुक्तिं मुक्तिं, "worldly enjoyment and liberation" — the standard
  // phala-śruti pairing; Rama Raksha v.12 and Narasimha Kavacham v.26
  // close on the identical words ("भुक्तिं मुक्तिं च विन्दति").
  { id: 'bhukti', deva: ['भुक्तिं'], iast: ['bhuktiṃ'], english: ['enjoyment'] },
  { id: 'mukti', deva: ['मुक्तिं'], iast: ['muktiṃ'], english: ['liberation'] },
  // शरणं/śaraṇaṃ, "refuge" — Rama Raksha's closing refrain (शरणं प्रपद्ये,
  // "I take refuge," v.29/32/33), and also Soundarya Lahari v.1's
  // "त्वमेव शरणं शिवे," so it connects there too.
  { id: 'sharanam', deva: ['शरणं'], iast: ['śaraṇaṃ'], english: ['refuge'] },

  // --- Sri Rama Raksha Stotram (Raksha Stotrams sub-section) ---
  // राम in every clean case-form the stotra uses — v.37 deliberately runs
  // the name through all eight cases in order (see its Σ note), though its
  // instrumental (रामेणाभिहता) and ablative (रामान्नास्ति) are sandhi-fused
  // to the next word and so can't be boxed.
  {
    id: 'rama',
    deva: ['राम', 'रामः', 'रामो', 'रामं', 'रामाय', 'रामस्य', 'रामे'],
    iast: ['rāma', 'rāmaḥ', 'rāmō', 'rāmaṃ', 'rāmāya', 'rāmasya', 'rāmē'],
    english: ['rama'],
  },
  {
    id: 'ramachandra',
    deva: ['रामचन्द्रम्', 'रामचन्द्राय', 'रामचन्द्रः', 'रामचन्द्रो'],
    iast: ['rāmachandram', 'rāmachandrāya', 'rāmachandraḥ', 'rāmachandrō'],
    english: ['ramachandra'],
  },
  { id: 'raghava', deva: ['राघवः', 'राघवं'], iast: ['rāghavaḥ', 'rāghavaṃ'], english: ['raghava'] },

  // --- Sri Narasimha Kavacham (Kavachams sub-section) ---
  { id: 'narasimha', deva: ['नृसिंहं', 'नृसिंहो', 'नृसिंहः'], iast: ['nṛsiṃhaṃ', 'nṛsiṃhō', 'nṛsiṃhaḥ'], english: ['narasimha'] },
  // नृकेसरी/नृहरिः, "Man-Lion" — synonyms of the name itself rather than
  // the name (nṛ, "man" + kesarin, "maned one" / hari, "lion"). Glossed
  // "man lion" without a hyphen since a hyphenated gloss can never match
  // (the translation tokenizer splits on hyphens).
  { id: 'nrkesari', deva: ['नृकेसरी', 'नृहरिः'], iast: ['nṛkēsarī', 'nṛhariḥ'], english: ['man lion'] },

  // --- Pañcarakṣā Devī Stotrāṇi (Buddhist) — each of the five hymns closes
  // every verse on its own goddess's name, so each name is its refrain. ---
  { id: 'pr-pratisara', deva: ['प्रतिसरां'], iast: ['pratisarāṃ'], english: ['pratisara'] },
  { id: 'pr-mantranusarini', deva: ['मन्त्रानुसारिणीम्'], iast: ['mantrānusāriṇīm'], english: ['mantranusarini'] },
  { id: 'pr-mayuri', deva: ['मायूरीं'], iast: ['māyūrīṃ'], english: ['mayuri'] },
  { id: 'pr-shitavati', deva: ['शीतवतीं'], iast: ['śītavatīṃ'], english: ['shitavati'] },
  { id: 'pr-sahasramardini', deva: ['साहस्रमर्दिनीम्'], iast: ['sāhasramardinīm'], english: ['sahasramardini'] },
  // --- Rakṣā Kāla Kara Stava (Buddhist) — "रक्ष मां लोकनायक" closes 13 of
  // its 15 verses; रक्ष already connects via brs-raksha. ---
  { id: 'lokanayaka', deva: ['लोकनायक'], iast: ['lōkanāyaka'], english: ['lokanayaka'] },

  // --- Sri Devi Kavacham / Durga Kavach (Kavachams sub-section) — the
  // Mātṛkās and other goddess-guardians who recur across its verses. ---
  { id: 'dk-varahi', deva: ['वाराही'], iast: ['vārāhī'], english: ['varahi'] },
  { id: 'dk-vaishnavi', deva: ['वैष्णवी'], iast: ['vaiṣṇavī'], english: ['vaishnavi'] },
  { id: 'dk-kaumari', deva: ['कौमारी'], iast: ['kaumārī'], english: ['kaumari'] },
  { id: 'dk-brahmani', deva: ['ब्रह्माणी'], iast: ['brahmāṇī'], english: ['brahmani'] },
  { id: 'dk-chandika', deva: ['चण्डिका', 'चण्डिके'], iast: ['chaṇḍikā', 'chaṇḍikē'], english: ['chandika'] },
  { id: 'dk-shuladharini', deva: ['शूलधारिणी'], iast: ['śūladhāriṇī'], english: ['trident bearer'] },
];

const MEANING_CONCEPTS_BY_ID = new Map(MEANING_CONCEPTS.map((c) => [c.id, c]));
const CONCEPT_BY_DEVA = new Map(MEANING_CONCEPTS.flatMap((c) => c.deva.map((form) => [form, c.id])));
const CONCEPT_BY_IAST = new Map(MEANING_CONCEPTS.flatMap((c) => c.iast.map((form) => [form, c.id])));
// Maps to an ARRAY of concept ids, not a single id — unlike deva/iast forms
// (which are naturally distinct per word), two different Sanskrit words can
// easily share an English gloss (सल-drishti, sl-drsh, and sl-netra are all
// "eye"/"glance" near-synonyms). A single-id map silently let the
// last-registered concept win a collision, breaking the per-line gating the
// comment above promises: whichever concept SHOULD have boxed a line
// (found via conceptsInLine on the Sanskrit side) would fail to match here
// because CONCEPT_BY_ENGLISH.get(word) returned a different concept's id.
// See renderTranslationText's matching loop below for the fix on the read
// side — it now checks every id sharing that word against the line's own
// active set, not just the first/last one registered.
const CONCEPT_BY_ENGLISH = new Map();
for (const c of MEANING_CONCEPTS) {
  for (const word of c.english) {
    if (!CONCEPT_BY_ENGLISH.has(word)) CONCEPT_BY_ENGLISH.set(word, []);
    CONCEPT_BY_ENGLISH.get(word).push(c.id);
  }
}

// Which concepts actually occur in this specific verse-line, so an English
// word only gets boxed on lines where its Sanskrit counterpart genuinely
// appears — not everywhere that English word happens to occur in the text.
//
// Checks adjacent word-pairs before single words (e.g. "cha mē" as one
// concept, not 'cha' and 'me' independently) — see the matching MEANING_CONCEPTS
// entries and the equivalent two-word-first check in renderScriptLine.
function conceptsInLine(devanagari, iast) {
  const ids = new Set();
  const scan = (text, script, lookup) => {
    // Tokenized with segmentLine (the same hyphen-aware splitter renderScriptLine
    // uses for the Sanskrit/IAST side), not a naive whitespace split — vignanam.org
    // hyphenates plenty of sandhi joins with no surrounding space ("अय-म्मे",
    // "पशूना-म्पतये"), and a plain text.split(/\s+/) would leave "म्मे"/"म्पतये"
    // fused inside a bigger "अय-म्मे"-shaped token that never matches anything
    // in CONCEPT_BY_DEVA/IAST — silently breaking the translation-side box even
    // though the Sanskrit/IAST side (which already used segmentLine) boxed it
    // correctly. `null` marks a punctuation/break boundary so word-adjacency
    // checks below still only fire on two words with nothing between them.
    const words = segmentLine(text, script)
      .filter((s) => s.kind !== 'space')
      .map((s) => (s.kind === 'word' ? s.norm : null));
    for (let i = 0; i < words.length; i++) {
      if (!words[i]) continue;
      if (words[i + 1]) {
        const phraseId = lookup.get(`${words[i]} ${words[i + 1]}`);
        if (phraseId) {
          ids.add(phraseId);
          i += 1;
          continue;
        }
      }
      const id = lookup.get(words[i]);
      if (id) {
        ids.add(id);
        continue;
      }
      // No exact match — check for "cha" sandhi-fused onto this word's
      // tail (see matchFusedChaSuffix) so the translation panel still
      // boxes "be mine"/"and" on these lines the same as it would if the
      // source spelled cha as its own word.
      const fusedSuffix = matchFusedChaSuffix(words[i], script);
      if (fusedSuffix) {
        // The word's own stem, minus the fused cha suffix — e.g. "indra" out
        // of "indraścha" — checked as its own concept independently of
        // whichever cha/cha-mē match follows, so a concept-registered prefix
        // (इन्द्र/indra) still links to its translation word even though the
        // whole token never appears unfused (see the matching prefix-boxing
        // branch in renderScriptLine, and fusedPrefixConceptId's use in
        // initRepeatClickHandling for the case — इन्द्रश्च itself, which
        // repeats as a whole token — where the Sanskrit side never gets
        // split into two boxes in the first place).
        const prefixId = fusedPrefixConceptId(words[i], script);
        if (prefixId) ids.add(prefixId);

        const chaKey = script === 'deva' ? 'च' : 'cha';
        const pairId = words[i + 1] ? lookup.get(`${chaKey} ${words[i + 1]}`) : null;
        if (pairId) {
          ids.add(pairId);
          i += 1;
        } else {
          const chaId = lookup.get(fusedSuffix);
          if (chaId) ids.add(chaId);
        }
      }
    }
  };
  scan(devanagari, 'deva', CONCEPT_BY_DEVA);
  scan(iast, 'iast', CONCEPT_BY_IAST);
  return ids;
}

// --- Repeated word/phrase detection -----------------------------------
//
// Devanagari and IAST don't always tokenize 1:1 (e.g. one script joins a
// sandhi pair with a hyphen where the other keeps a space), so each script's
// repeats are computed and highlighted independently rather than trying to
// force a cross-script word alignment.

const MAX_PHRASE_WORDS = 6;
const DEVA_ACCENT_RE = /[॒॑᳚]/g;
const IAST_ACCENT_RE = /[̠̍̎]/g;
const PUNCT_ONLY_RE = /^[।॥,.;:'’‘"()[\]\-–—]+$/;

function normalizeToken(raw, script) {
  const stripped = (script === 'deva' ? raw.replace(DEVA_ACCENT_RE, '') : raw.replace(IAST_ACCENT_RE, '')).trim();
  if (!stripped || PUNCT_ONLY_RE.test(stripped) || /^\d+$/.test(stripped)) return '';
  return stripped.toLowerCase();
}

// "cha" written fused onto the tail of a bigger word via a conjunct,
// rather than as its own space/hyphen-separated token — e.g. Chamakam's
// number litany writes वाजश्च (vājaścha, from vājaḥ + cha via visarga
// sandhi) and जगच्च (jagachcha, from jagat + cha, the -t assimilating
// before cha) as one fused word, never split out the way ञ्च/ñcha
// already is (see the 'cha' MEANING_CONCEPTS entry — that one's always
// hyphenated in the source, so segmentLine's own hyphen-splitting already
// isolates it as an ordinary token and needs no special handling here).
// Longest suffix first so च्च doesn't shadow a match that's actually the
// longer श्च.
const FUSED_CHA_SUFFIXES = {
  deva: ['श्च', 'च्च'],
  iast: ['ścha', 'chcha'],
};

function matchFusedChaSuffix(norm, script) {
  if (!norm) return null;
  const suffixes = [...FUSED_CHA_SUFFIXES[script]].sort((a, b) => b.length - a.length);
  for (const suffix of suffixes) {
    if (norm.length > suffix.length && norm.endsWith(suffix)) return suffix;
  }
  return null;
}

// A registered concept's stem hiding as the prefix of a normalized token
// that's fused with "cha" onto its tail (इन्द्रश्च/indraścha → इन्द्र/indra) —
// used wherever a whole fused token has already been boxed some other way
// (e.g. as a plain repeated word, इन्द्रश्च itself repeats 20x in Chamakam 6)
// so its own literal key was never split into prefix+suffix at render time,
// but a click still needs to resolve the concept that's really sitting
// inside it. Shared by conceptsInLine and initRepeatClickHandling rather
// than each re-deriving it.
function fusedPrefixConceptId(norm, script) {
  const fusedSuffix = matchFusedChaSuffix(norm, script);
  if (!fusedSuffix) return null;
  const prefix = norm.slice(0, norm.length - fusedSuffix.length);
  if (!prefix) return null;
  const lookup = script === 'deva' ? CONCEPT_BY_DEVA : CONCEPT_BY_IAST;
  return lookup.get(prefix) || null;
}

// Maps a suffix length measured on the accent-stripped normalized form
// (what matchFusedChaSuffix matches against) back to a raw-text split
// length, so a fused-cha match still carries along whichever side any
// interleaved Vedic accent mark actually decorates in the ORIGINAL text
// — e.g. धीतिश्च॑'s trailing udātta stays with the श्च suffix it marks,
// while वाज॑श्च's accent (sitting between the prefix and the suffix)
// stays with the वाज prefix it marks — rather than a naive
// rawText.endsWith(suffix) either missing the match (blocked by a
// trailing accent) or silently dropping/misplacing one mid-conjunct.
function rawSuffixLength(rawText, script, normSuffixLength) {
  const accentRe = script === 'deva' ? DEVA_ACCENT_RE : IAST_ACCENT_RE;
  let normSeen = 0;
  for (let i = rawText.length - 1; i >= 0; i--) {
    accentRe.lastIndex = 0;
    if (!accentRe.test(rawText[i])) {
      normSeen += 1;
      if (normSeen === normSuffixLength) return rawText.length - i;
    }
  }
  return normSuffixLength;
}

// Splits a line into ordered segments, each tagged 'word' (counts toward
// phrases), 'punct' (breaks a phrase run), 'space' (preserved verbatim,
// doesn't break a run), or 'break' (a manually-inserted "\n" in the source
// data, rendered as an actual line break — see renderScriptLine — and
// treated like punctuation for phrase-matching purposes: a repeated phrase
// never spans across one).
//
// Hyphens split out as their own segment (rather than staying fused inside
// a \S+ run) for the same reason: vignanam.org marks a sandhi/avagraha
// join with a hyphen instead of a space throughout — "मे-ऽष्टौ" (mē +
// aṣṭau), "चित्त-ञ्च" (chitta + cha), "भूमि-रे-वावलम्बनम्" — and this is
// not rare (well over a hundred lines per chant). Left fused, whichever
// word sits on either side of that hyphen is invisible to both repeat
// detection and MEANING_CONCEPTS: e.g. the "मे" inside "मे-ऽष्टौ" (Chamakam
// 11's numbers list) never boxed or linked to its "mine" siblings, purely
// because this one occurrence happened to be spelled with a hyphen rather
// than a space. Splitting it out costs nothing on the rendering side
// (PUNCT_ONLY_RE already treats a bare hyphen as punctuation, so it prints
// exactly as before) and costs nothing on the matching side (it already
// breaks a phrase run the same as any other punctuation) — it only adds
// the word on each side back into consideration.
function segmentLine(rawText, script) {
  const parts = rawText.match(/[^\s-]+|-+|\n|[^\S\n]+/g) || [];
  return parts.map((text) => {
    if (text === '\n') return { text, kind: 'break', norm: '' };
    if (/^[^\S\n]+$/.test(text)) return { text, kind: 'space', norm: '' };
    const norm = normalizeToken(text, script);
    return { text, kind: norm ? 'word' : 'punct', norm };
  });
}

// Counts every contiguous word n-gram (1..MAX_PHRASE_WORDS), never crossing
// a punctuation segment, across the whole chant for one script.
function buildRepeatCounts(lineTexts, script) {
  const counts = new Map();
  for (const text of lineTexts) {
    const segments = segmentLine(text, script);
    let run = [];
    const flushRun = () => {
      for (let n = 1; n <= MAX_PHRASE_WORDS; n++) {
        for (let i = 0; i + n <= run.length; i++) {
          const key = run.slice(i, i + n).join(' ');
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      }
      run = [];
    };
    for (const seg of segments) {
      if (seg.kind === 'word') run.push(seg.norm);
      else if (seg.kind === 'punct' || seg.kind === 'break') flushRun();
    }
    flushRun();
  }
  return counts;
}

// Renders one line's text, wrapping the longest repeated word-run starting
// at each position in a `.token-repeat` span (greedy, non-overlapping).
//
// Each span also gets `data-line`/`data-slot`: the line it came from and its
// order among that line's repeat-spans in this script. Devanagari and IAST
// don't always tokenize 1:1 (see note above), but within one line their
// repeat-spans usually appear in the same relative order, so (line, slot) is
// used to bridge a click on one script to its counterpart in the other —
// see initRepeatClickHandling.
function renderScriptLine(rawText, script, counts, lineKey) {
  const frag = document.createDocumentFragment();
  const segments = segmentLine(rawText, script);
  let slot = 0;
  let i = 0;
  while (i < segments.length) {
    const seg = segments[i];
    if (seg.kind === 'break') {
      frag.appendChild(document.createElement('br'));
      i += 1;
      continue;
    }
    if (seg.kind !== 'word') {
      frag.appendChild(document.createTextNode(seg.text));
      i += 1;
      continue;
    }

    const normsAhead = [];
    let k = i;
    while (k < segments.length && normsAhead.length < MAX_PHRASE_WORDS) {
      if (segments[k].kind === 'word') {
        normsAhead.push(segments[k].norm);
        k += 1;
      } else if (segments[k].kind === 'space') {
        k += 1;
      } else {
        break; // punctuation ends the run
      }
    }

    const conceptLookup = script === 'deva' ? CONCEPT_BY_DEVA : CONCEPT_BY_IAST;
    let matchedN = 0;
    let matchedKey = '';

    // An explicitly registered two-word concept (e.g. "cha mē") always wins,
    // regardless of repeat count — it's not a coincidental repeated phrase,
    // it's the actual grammatical/idiomatic unit, so it should box and link
    // as one even the first time it's seen. Checked before the general
    // repeat-phrase loop below so it isn't shadowed by that loop's own
    // single-word-concept guard (next comment).
    if (normsAhead.length >= 2) {
      const phraseKey = `${normsAhead[0]} ${normsAhead[1]}`;
      if (conceptLookup.has(phraseKey)) {
        matchedN = 2;
        matchedKey = phraseKey;
      }
    }

    // Otherwise, a multi-word candidate is skipped if it would start or end
    // on a word that has its own meaning mapping (MEANING_CONCEPTS) —
    // without this, a short, near-universal collocation would greedily
    // swallow a concept word every time it's adjacent to one (e.g.
    // "yajñēna kalpatāṃ" swallowing yajñēna so it never links to
    // "sacrifice" on its own). A concept word always gets to be its own
    // unit, on either end; longer genuine phrases (e.g. a repeated
    // invocation line) still match as long as neither end is one — which in
    // practice tends to split an old joint phrase-box into two adjacent
    // concept boxes instead (e.g. yajñēna and kalpatāṃ each standing
    // alone), which is what lets each link separately.
    //
    // A single word (n===1) that's itself a registered MEANING_CONCEPTS
    // form always matches too, same as a 2-word concept phrase does above
    // — it's a curated entry, not a coincidental repeat, so it shouldn't
    // need to ALSO happen to repeat twice in its own section just to get
    // its box (सहस्र/sahasra is a different case-form at nearly every
    // occurrence, so almost none of them would otherwise ever reach 2;
    // conceptsInLine already boxes these words' English counterparts
    // unconditionally — this just brings the Sanskrit/IAST side in line
    // with that instead of leaving it under-gated).
    if (matchedN === 0) {
      for (let n = normsAhead.length; n >= 1; n--) {
        if (n > 1 && (conceptLookup.has(normsAhead[n - 1]) || conceptLookup.has(normsAhead[0]))) continue;
        const key = normsAhead.slice(0, n).join(' ');
        if ((counts.get(key) || 0) >= 2 || (n === 1 && conceptLookup.has(key))) {
          matchedN = n;
          matchedKey = key;
          break;
        }
      }
    }

    if (matchedN === 0) {
      // Still no match — check whether "cha" is sandhi-fused onto the tail
      // of THIS word (वाजश्च/vājaścha, जगच्च/jagachcha — see
      // matchFusedChaSuffix) rather than sitting as its own token, which is
      // why neither check above could have found it. When it is, split off
      // just that fused tail as its own box — merged with a following
      // mē/ma into the same cha-me box the unfused "च मे" case gets (so
      // this reads as the same pattern either way the source happened to
      // spell it), or boxed alone as plain "cha" otherwise.
      const fusedSuffix = matchFusedChaSuffix(normsAhead[0], script);
      if (fusedSuffix) {
        const rawLen = rawSuffixLength(seg.text, script, fusedSuffix.length);
        const splitAt = seg.text.length - rawLen;
        const prefixRaw = seg.text.slice(0, splitAt);
        const suffixRaw = seg.text.slice(splitAt);
        if (prefixRaw) {
          // Box the prefix too when it's itself a registered concept (e.g.
          // इन्द्र/indra out of इन्द्रश्च/indraścha) — mirrors the prefix
          // handling added to conceptsInLine, so the Sanskrit/IAST side
          // links to its translation word the same way the ordinary
          // matched-word branch below does.
          const prefixConceptId = conceptLookup.get(normalizeToken(prefixRaw, script));
          if (prefixConceptId) {
            const prefixSpan = document.createElement('span');
            prefixSpan.className = 'token-repeat';
            prefixSpan.dataset.script = script;
            prefixSpan.dataset.key = normalizeToken(prefixRaw, script);
            prefixSpan.dataset.line = lineKey;
            prefixSpan.dataset.slot = String(slot);
            slot += 1;
            prefixSpan.appendChild(script === 'iast' ? renderIastChars(prefixRaw) : document.createTextNode(prefixRaw));
            frag.appendChild(prefixSpan);
          } else {
            frag.appendChild(script === 'iast' ? renderIastChars(prefixRaw) : document.createTextNode(prefixRaw));
          }
        }

        const chaKey = script === 'deva' ? 'च' : 'cha';
        const phraseKey = normsAhead[1] ? `${chaKey} ${normsAhead[1]}` : null;
        const mergeWithNext = phraseKey && conceptLookup.has(phraseKey);

        const fusedSpan = document.createElement('span');
        fusedSpan.className = 'token-repeat';
        fusedSpan.dataset.script = script;
        fusedSpan.dataset.line = lineKey;
        fusedSpan.dataset.slot = String(slot);
        slot += 1;
        fusedSpan.appendChild(script === 'iast' ? renderIastChars(suffixRaw) : document.createTextNode(suffixRaw));

        if (mergeWithNext) {
          fusedSpan.dataset.key = phraseKey;
          let p = i + 1;
          while (p < segments.length && segments[p].kind === 'space') {
            fusedSpan.appendChild(document.createTextNode(segments[p].text));
            p += 1;
          }
          if (p < segments.length && segments[p].kind === 'word') {
            fusedSpan.appendChild(
              script === 'iast' ? renderIastChars(segments[p].text) : document.createTextNode(segments[p].text)
            );
            p += 1;
          }
          frag.appendChild(fusedSpan);
          i = p;
        } else {
          fusedSpan.dataset.key = fusedSuffix;
          frag.appendChild(fusedSpan);
          i += 1;
        }
        continue;
      }

      frag.appendChild(script === 'iast' ? renderIastChars(seg.text) : document.createTextNode(seg.text));
      i += 1;
      continue;
    }

    const span = document.createElement('span');
    span.className = 'token-repeat';
    span.dataset.script = script;
    span.dataset.key = matchedKey;
    span.dataset.line = lineKey;
    span.dataset.slot = String(slot);
    slot += 1;
    let consumedWords = 0;
    let p = i;
    while (p < segments.length && consumedWords < matchedN) {
      const s = segments[p];
      if (s.kind === 'word') {
        span.appendChild(script === 'iast' ? renderIastChars(s.text) : document.createTextNode(s.text));
        consumedWords += 1;
      } else if (s.kind === 'space') {
        span.appendChild(document.createTextNode(s.text));
      }
      p += 1;
    }
    frag.appendChild(span);
    i = p;
  }
  return frag;
}

function renderLine(line, devaCounts, iastCounts, lineKey) {
  const wrapper = el('div', 'verse-line');
  wrapper.dataset.line = lineKey;
  const devaPara = el('p', 'deva-line');
  devaPara.appendChild(renderScriptLine(line.devanagari, 'deva', devaCounts, lineKey));
  wrapper.appendChild(devaPara);
  const iastPara = el('p', 'iast-line');
  iastPara.appendChild(renderScriptLine(line.iast, 'iast', iastCounts, lineKey));
  wrapper.appendChild(iastPara);
  return wrapper;
}

// Wraps English words in a `.token-repeat` box (same class as the Sanskrit
// side, so it picks up the same dim/active styling and the same click
// handling) wherever a run of them is one of `conceptIds`' mapped English
// phrases. Concept phrases can be more than one word (e.g. "may it be
// fashioned") — matched the same greedy-longest-first way the Sanskrit/IAST
// side matches multi-word repeats, just against MEANING_CONCEPTS directly
// rather than a repeat count, since English concept text is deliberately
// consistent rather than something to detect. Tagged with the same
// `data-line` as its Sanskrit/IAST counterparts so updateNetworkOverlay can
// anchor a connector to it, not just to a generic point in the translation
// column.
function renderTranslationText(text, conceptIds, lineKey) {
  const frag = document.createDocumentFragment();
  const hasConcepts = conceptIds && conceptIds.size > 0;
  // A word run can contain an apostrophe mid-word (isn't, Goddess's) but
  // must not START with one — some translations open a quoted line with a
  // '-mark glued straight onto the first word ("'Bhavani, cast..."), and
  // the older [A-Za-z']+ pattern let that leading quote get sucked into
  // the word token itself ("'Bhavani"), which then never matched a
  // registered concept's lowercase english gloss ("bhavani") no matter how
  // correctly it was registered. A lone leading/trailing quote mark now
  // falls into the punctuation alternative instead.
  const parts = text.match(/[A-Za-z]+(?:'[A-Za-z]+)*|\n|[^A-Za-z\n]+/g) || [text];
  const isWord = (p) => /^[A-Za-z]+(?:'[A-Za-z]+)*$/.test(p);
  const isSpace = (p) => /^\s+$/.test(p);

  let i = 0;
  while (i < parts.length) {
    const part = parts[i];
    if (part === '\n') {
      frag.appendChild(document.createElement('br'));
      i += 1;
      continue;
    }
    if (!isWord(part)) {
      frag.appendChild(document.createTextNode(part));
      i += 1;
      continue;
    }

    // Collect up to MAX_PHRASE_WORDS word-parts ahead (by index into
    // `parts`), skipping spaces, stopping at the first non-space/non-word.
    const wordIdxAhead = [];
    let k = i;
    while (k < parts.length && wordIdxAhead.length < MAX_PHRASE_WORDS) {
      if (isWord(parts[k])) {
        wordIdxAhead.push(k);
        k += 1;
      } else if (isSpace(parts[k])) {
        k += 1;
      } else {
        break;
      }
    }

    let matchedConceptId = null;
    let matchedEndIdx = -1;
    for (let n = wordIdxAhead.length; n >= 1; n--) {
      const key = wordIdxAhead
        .slice(0, n)
        .map((idx) => parts[idx].toLowerCase())
        .join(' ');
      const candidateIds = hasConcepts ? CONCEPT_BY_ENGLISH.get(key) : null;
      const conceptId = candidateIds ? candidateIds.find((id) => conceptIds.has(id)) : null;
      if (conceptId) {
        matchedConceptId = conceptId;
        matchedEndIdx = wordIdxAhead[n - 1];
        break;
      }
    }

    if (!matchedConceptId) {
      frag.appendChild(document.createTextNode(part));
      i += 1;
      continue;
    }

    const span = document.createElement('span');
    span.className = 'token-repeat';
    span.dataset.script = 'en';
    span.dataset.key = matchedConceptId;
    span.dataset.line = lineKey;
    span.textContent = parts.slice(i, matchedEndIdx + 1).join('');
    frag.appendChild(span);
    i = matchedEndIdx + 1;
  }
  return frag;
}

// Collapsed-by-default topic map for a chant with a SECTION_GROUPS entry —
// one <details> per group (e.g. Thirukkural's 13 traditional iyals), each
// holding a chip per section that jumps straight to it (href="#topic-N"
// against the id renderChant gives every .section-block). Chip text pairs
// the section's own number with its ANUVAKA_TAGLINES gloss when one exists,
// so a reader can find a topic by name instead of scrolling past everything
// before it. Returns null (render nothing) for a chant with no groups
// registered — most chants are short enough not to need this at all.
function buildTopicNav(chant) {
  const groups = SECTION_GROUPS[chant.id];
  if (!groups) return null;
  const taglines = ANUVAKA_TAGLINES[chant.id] || {};
  const sectionUnit = chant.sectionUnit ?? 'Anuvāka';

  const nav = el('nav', 'topic-nav');
  nav.appendChild(el('div', 'topic-nav-heading', 'Topics'));
  for (const group of groups) {
    const details = document.createElement('details');
    details.className = 'topic-group';
    const rangeText = group.to > group.from ? `${group.from}–${group.to}` : `${group.from}`;
    details.appendChild(el('summary', null, `${group.label} (${rangeText})`));
    const grid = el('div', 'topic-chip-grid');
    for (let n = group.from; n <= group.to; n += 1) {
      const chip = document.createElement('a');
      chip.className = 'topic-chip';
      chip.href = `#topic-${n}`;
      const tagline = taglines[n];
      chip.textContent = tagline ? `${n}. ${tagline}` : `${sectionUnit} ${n}`;
      grid.appendChild(chip);
    }
    details.appendChild(grid);
    nav.appendChild(details);
  }
  return nav;
}

function renderChant(chant, translation) {
  // chant itself comes straight from data/chants/<id>.json and has no
  // linkScope field — that's site-behavior config, not chant content, so it
  // only lives on the CHANTS registry entry above. Merged in here rather
  // than duplicated into every chant JSON file.
  const chantMeta = CHANTS.find((c) => c.id === chant.id);
  currentChant = { ...chant, linkScope: chantMeta && chantMeta.linkScope };
  lineSectionMap = new Map();

  // Drives which script font .deva-line/.chant-title-deva render in — see
  // the body.chant-lang-tamil rules in styles.css. Devanagari and Tamil are
  // both stored under the same "devanagari" JSON key (see build_vel_maaral.py
  // for why: renaming that key everywhere it's read/written was a much
  // larger, riskier change than this app.js/CSS is worth for a label that's
  // never shown to the user).
  document.body.classList.toggle('chant-lang-tamil', chant.language === 'tamil');

  chantTitleDeva.textContent = chant.title.devanagari;
  chantTitleIast.textContent = chant.title.iast;
  chantSource.innerHTML = `Source: <a href="${chant.source.devanagari_url}" target="_blank" rel="noopener">${chant.source.site}</a>`;

  chantBody.innerHTML = '';
  const topicNav = buildTopicNav(chant);
  if (topicNav) chantBody.appendChild(topicNav);
  networkLayout = el('div', 'chant-layout');
  chantTextEl = el('div', 'chant-text');
  networkRail = el('div', 'chant-rail');
  chantTranslationEl = el('div', 'chant-translation');
  networkSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  networkSvg.setAttribute('class', 'network-svg');
  networkLayout.appendChild(chantTextEl);
  networkLayout.appendChild(networkRail);
  networkLayout.appendChild(chantTranslationEl);
  networkLayout.appendChild(networkSvg);
  chantBody.appendChild(networkLayout);

  const translationLines = translation ? translation.lines : {};

  function appendTranslationLine(lineKey, text, conceptIds) {
    if (!text) return;
    const p = el('p', 'translation-line');
    p.dataset.line = lineKey;
    p.appendChild(renderTranslationText(text, conceptIds, lineKey));
    chantTranslationEl.appendChild(p);
  }

  // Repeat detection is scoped to each anuvāka rather than the whole chant:
  // two unrelated epithet-litany sections can coincidentally share one rare
  // phrase (e.g. the same deity name shows up once in anuvāka 7 and once in
  // anuvāka 9), which would otherwise "win" over a word like cha/च that
  // genuinely repeats throughout the local section. Scoping to the section
  // — already the app's natural unit of context — keeps the highlighting
  // reflecting what actually recurs *here*, not coincidences elsewhere.
  if (chant.colophon) {
    const devaCounts = buildRepeatCounts([chant.colophon.devanagari], 'deva');
    const iastCounts = buildRepeatCounts([chant.colophon.iast], 'iast');
    const colophon = el('div', 'colophon');
    colophon.dataset.line = 'colophon';
    const devaPara = el('p', 'deva-line');
    devaPara.appendChild(renderScriptLine(chant.colophon.devanagari, 'deva', devaCounts, 'colophon'));
    colophon.appendChild(devaPara);
    const iastPara = el('p', 'iast-line');
    iastPara.appendChild(renderScriptLine(chant.colophon.iast, 'iast', iastCounts, 'colophon'));
    colophon.appendChild(iastPara);
    chantTextEl.appendChild(colophon);
    appendTranslationLine(
      'colophon',
      translation && translation.colophon,
      conceptsInLine(chant.colophon.devanagari, chant.colophon.iast)
    );
  }

  // Keys translation/data-line lookups on a running position counter rather
  // than each line's own "n" field: Namakam/Chamakam/Soundarya Lahari number
  // "n" as a running count across the whole chant already (so this is a
  // no-op for them), but the Tamil antatis restart "n" at 1 for every
  // 4-line verse — keying on raw "n" there would collide every verse's
  // lines onto the same 4 keys and show verse 1's translation everywhere.
  let lineIndex = 0;
  for (const section of chant.sections) {
    const devaCounts = buildRepeatCounts(section.lines.map((l) => l.devanagari), 'deva');
    const iastCounts = buildRepeatCounts(section.lines.map((l) => l.iast), 'iast');
    const block = el('div', 'section-block');
    // Jump target for buildTopicNav's chips (and any other future in-page
    // link) — whitespace stripped since an id can't contain it, e.g.
    // "Refrain (×12)" becomes "topic-Refrain-(×12)".
    block.id = `topic-${String(section.label).replace(/\s+/g, '-')}`;
    // '' explicitly means "no unit word, just the label" (e.g. Abirami
    // Antati's "Kāppu"/"1"/"Payan" labels, which already say what they are)
    // — nullish-coalescing rather than `||` so that empty string doesn't
    // fall through to the 'Anuvāka' default the way undefined does.
    const sectionUnit = chant.sectionUnit ?? 'Anuvāka';
    const labelText = sectionUnit ? `${sectionUnit} ${section.label}` : section.label;
    const buildNote = SECTION_NOTES[chant.id] && SECTION_NOTES[chant.id][section.label];
    const labelEl = el('div', buildNote ? 'section-label has-note' : 'section-label', labelText);
    if (buildNote) {
      labelEl.addEventListener('click', () => openMathModal(buildNote()));
    }
    const tagline = ANUVAKA_TAGLINES[chant.id] && ANUVAKA_TAGLINES[chant.id][section.label];
    if (tagline) {
      const sectionKey = `section-${section.label}`;
      labelEl.dataset.line = sectionKey;
      const taglineEl = el('p', 'translation-line anuvaka-tagline', tagline);
      taglineEl.dataset.line = sectionKey;
      chantTranslationEl.appendChild(taglineEl);
    }
    block.appendChild(labelEl);
    for (const line of section.lines) {
      lineIndex += 1;
      const lineKey = String(lineIndex);
      lineSectionMap.set(lineKey, section.label);
      block.appendChild(renderLine(line, devaCounts, iastCounts, lineKey));
      appendTranslationLine(lineKey, translationLines[lineKey], conceptsInLine(line.devanagari, line.iast));
    }
    chantTextEl.appendChild(block);
  }

  alignTranslationLines();
  updateNetworkOverlay();
}

// Positions each translation paragraph at the same vertical offset as its
// matching Sanskrit verse-line, rather than letting the translation column
// flow independently (which drifts out of sync and finishes early/late,
// since English and Sanskrit+IAST rarely take the same vertical space per
// line). Absolute positioning inside chant-translation is used instead of
// margins so a short translation next to a tall wrapped Sanskrit line
// doesn't accumulate drift — every line is placed fresh from its own
// verse-line's measured position.
function alignTranslationLines() {
  if (!chantTextEl || !chantTranslationEl) return;
  if (chantTranslationEl.offsetParent === null) return; // hidden (narrow viewport)

  chantTranslationEl.style.height = `${chantTextEl.scrollHeight}px`;
  const containerRect = chantTranslationEl.getBoundingClientRect();

  for (const para of chantTranslationEl.querySelectorAll('.translation-line')) {
    const target = chantTextEl.querySelector(
      `.verse-line[data-line="${para.dataset.line}"], .colophon[data-line="${para.dataset.line}"], .section-label[data-line="${para.dataset.line}"]`
    );
    if (!target) continue;
    const top = target.getBoundingClientRect().top - containerRect.top;
    para.style.top = `${top}px`;
  }
}

// --- Connector network: links every currently-highlighted occurrence -----
//
// Every verse-line converges on exactly one point on the trunk, shared by
// its Devanagari row, its IAST row, and its boxed English word(s) in the
// translation column — not one point per row, and not wherever the
// translation paragraph itself happens to sit (it can wrap to a different
// height than the Sanskrit/IAST pair), but the vertical midpoint between
// the Devanagari and IAST rows — the middle of the *line* itself.
//
// Each row's connector stays flat for a short safety drop, then bends —
// not at a fixed point, but as soon as it has cleared its own anchor box
// (plus a small clearance for whatever trailing punctuation follows it).
// Bending immediately rather than waiting for the far edge of its column
// gives the curve the most horizontal room to work with, which is what
// keeps it gentle: the same vertical rise spread over more distance is a
// shallower, smoother arc instead of a sharp last-minute bend. That bend
// is an S-curve with a horizontal tangent at both ends — level leaving the
// row, level again arriving at the shared point — so it never touches the
// trunk while still visibly curving. This applies uniformly to every side:
// Devanagari, IAST, and the English translation column alike — the rail
// itself is wide enough (RAIL curve budget, see styles.css) that even the
// translation column, which sits much closer to the trunk than the wide
// Sanskrit/IAST column does, still gets a real curve rather than a sharp
// point.
//
// The bend itself is the *entire* rest of the path once a row has cleared
// its text — no further straight segments once it starts curving. It runs
// all the way to the shared point on the trunk, so every row belonging to
// the same verse-line arrives there as one continuous curve, from
// whichever side (Sanskrit/IAST from the left, English from the right),
// meeting exactly at that point rather than flattening out early.
//
// One anchor span per (line, script) row — occurrences sharing a row (e.g.
// two "cha" in the same Devanagari line) still resolve to a single
// connector, anchored at whichever occurrence sits closest to the trunk,
// keeping the flat run short.
//
// English is chosen differently: a translated line can wrap across several
// visual rows (unlike Devanagari/IAST, which don't), so "two mine's in one
// translated line" can actually mean two mine's at two different heights.
// Picking whichever is horizontally closest to the trunk, ignoring height,
// could anchor to one on a *different* wrapped row than the convergence
// point, forcing the curve to travel past — visually through — the other
// wrapped row on its way there. Instead, English anchors on whichever
// occurrence's own row is vertically closest to the line's convergence
// point, so the curve only ever travels within (or near) its own row.
//
// A line whose translation exists but happens not to contain any boxed
// concept word (a plain repeat with no English mapping yet) still gets a
// generic stub into the translation column, anchored at a fixed inset
// rather than a specific word, so it isn't left disconnected.
const SVG_NS = 'http://www.w3.org/2000/svg';
const CONNECTOR_DROP = 3;
const ROW_CLEARANCE = 16;
const TRANSLATION_STUB_INSET = 6;

function updateNetworkOverlay() {
  const layout = networkLayout;
  const rail = networkRail;
  const svg = networkSvg;
  if (!layout || !rail || !svg) return;

  const layoutRect = layout.getBoundingClientRect();
  svg.setAttribute('width', String(layout.clientWidth));
  svg.setAttribute('height', String(layout.scrollHeight));
  svg.innerHTML = '';

  if (rail.offsetParent === null) return; // hidden (e.g. narrow viewport)

  const activeSpans = [...layout.querySelectorAll('.token-repeat.active')].filter(
    (node) => node.offsetParent !== null
  );
  if (activeSpans.length === 0) return;

  const railRect = rail.getBoundingClientRect();
  const trunkX = railRect.left - layoutRect.left + railRect.width / 2;

  // One anchor span per Devanagari/IAST row — keep whichever occurrence
  // sits furthest right (closest to the trunk), so the flat run toward the
  // trunk covers as little of the row as possible. English is handled
  // separately below, once each line's convergence point is known.
  const anchorByRow = new Map();
  const enSpansByLine = new Map();
  for (const span of activeSpans) {
    if (span.dataset.script === 'en') {
      const lineKey = span.dataset.line;
      if (!enSpansByLine.has(lineKey)) enSpansByLine.set(lineKey, []);
      enSpansByLine.get(lineKey).push(span);
      continue;
    }
    const rowKey = `${span.dataset.line}:${span.dataset.script}`;
    const existing = anchorByRow.get(rowKey);
    if (!existing || span.getBoundingClientRect().right > existing.getBoundingClientRect().right) {
      anchorByRow.set(rowKey, span);
    }
  }

  function rowClearance(boxRect, isEnglish) {
    // Where this row's connector has cleared its own anchor (plus whatever
    // trailing text follows it) and may begin to bend — measured from the
    // box itself, not the shared column edge, so short lines and early
    // anchors get a wide, gentle bend rather than being squeezed into the
    // narrow gutter right before the trunk. Mirrored for English: it
    // clears leftward, toward the trunk on its right.
    return isEnglish
      ? Math.max(boxRect.left - layoutRect.left - ROW_CLEARANCE, trunkX)
      : Math.min(boxRect.right - layoutRect.left + ROW_CLEARANCE, trunkX);
  }

  // Group Devanagari/IAST row anchors by verse-line, so every row belonging
  // to the same line can be aimed at one shared convergence point below.
  const rowsByLine = new Map();
  for (const span of anchorByRow.values()) {
    const lineKey = span.dataset.line;
    const boxRect = span.getBoundingClientRect();
    const dropY = boxRect.bottom - layoutRect.top + CONNECTOR_DROP;
    if (!rowsByLine.has(lineKey)) rowsByLine.set(lineKey, []);
    rowsByLine.get(lineKey).push({ span, dropY, rowClearX: rowClearance(boxRect, false), isEnglish: false });
  }

  const translationVisible = chantTranslationEl && chantTranslationEl.offsetParent !== null;
  const translationRect = translationVisible ? chantTranslationEl.getBoundingClientRect() : null;

  const allLineKeys = new Set([...rowsByLine.keys(), ...enSpansByLine.keys()]);

  const convergeYs = [];
  for (const lineKey of allLineKeys) {
    const rows = [...(rowsByLine.get(lineKey) || [])];
    const enCandidates = enSpansByLine.get(lineKey) || [];

    // The shared point every row of this line bends toward: the vertical
    // midpoint between its Devanagari/IAST rows, so the network reads as
    // arriving at the middle of the line, not wherever the translation
    // text sits. Falls back to averaging the English candidates when a
    // line is (unusually) all-English, e.g. clicked directly with no
    // matching Sanskrit/IAST box currently active.
    const convergeY =
      rows.length > 0
        ? rows.reduce((sum, r) => sum + r.dropY, 0) / rows.length
        : enCandidates.reduce((sum, s) => sum + (s.getBoundingClientRect().bottom - layoutRect.top + CONNECTOR_DROP), 0) /
          enCandidates.length;
    convergeYs.push(convergeY);

    // English anchors on whichever occurrence's own row sits vertically
    // closest to convergeY — not simply the one closest to the trunk — so
    // a translated line that wraps across several visual rows never forces
    // the curve to travel past (visually through) another one of its own
    // wrapped rows just to reach the point.
    let hasEnglishAnchor = enCandidates.length > 0;
    if (hasEnglishAnchor) {
      let best = null;
      let bestDropY = 0;
      let bestDist = Infinity;
      for (const span of enCandidates) {
        const boxRect = span.getBoundingClientRect();
        const dropY = boxRect.bottom - layoutRect.top + CONNECTOR_DROP;
        const dist = Math.abs(dropY - convergeY);
        if (dist < bestDist) {
          best = span;
          bestDropY = dropY;
          bestDist = dist;
        }
      }
      const boxRect = best.getBoundingClientRect();
      rows.push({ span: best, dropY: bestDropY, rowClearX: rowClearance(boxRect, true), isEnglish: true });
    }

    for (const { span, dropY, rowClearX } of rows) {
      const boxRect = span.getBoundingClientRect();
      const boxX = boxRect.left + boxRect.width / 2 - layoutRect.left;
      const boxY = boxRect.bottom - layoutRect.top;
      const bendMidX = (rowClearX + trunkX) / 2;

      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute(
        'd',
        `M ${boxX} ${boxY} L ${boxX} ${dropY} L ${rowClearX} ${dropY} ` +
          `C ${bendMidX} ${dropY} ${bendMidX} ${convergeY} ${trunkX} ${convergeY}`
      );
      path.setAttribute('class', 'network-path');
      svg.appendChild(path);
    }

    const para = translationVisible
      ? chantTranslationEl.querySelector(`.translation-line[data-line="${lineKey}"]`)
      : null;
    if (para && !hasEnglishAnchor) {
      const translationX = translationRect.left - layoutRect.left + TRANSLATION_STUB_INSET;
      const stub = document.createElementNS(SVG_NS, 'path');
      stub.setAttribute('d', `M ${translationX} ${convergeY} L ${trunkX} ${convergeY}`);
      stub.setAttribute('class', 'network-path');
      svg.appendChild(stub);
    }
  }

  if (convergeYs.length > 1) {
    const trunk = document.createElementNS(SVG_NS, 'line');
    trunk.setAttribute('x1', trunkX);
    trunk.setAttribute('x2', trunkX);
    trunk.setAttribute('y1', Math.min(...convergeYs));
    trunk.setAttribute('y2', Math.max(...convergeYs));
    trunk.setAttribute('class', 'network-trunk');
    svg.appendChild(trunk);
  }
}

async function loadTranslation(id) {
  try {
    const res = await fetch(`data/translations/${id}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null; // translation is optional — chant still renders without it
  }
}

async function loadChant(id) {
  chantTextEl = null;
  chantTranslationEl = null;
  networkLayout = null;
  networkRail = null;
  networkSvg = null;
  chantBody.innerHTML = '<p class="loading">Loading chant…</p>';
  try {
    const [res, translation] = await Promise.all([fetch(`data/chants/${id}.json`), loadTranslation(id)]);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const chant = await res.json();
    renderChant(chant, translation);
    localStorage.setItem('vedavani:lastChant', id);
  } catch (err) {
    chantBody.innerHTML = `<p class="error">Could not load this chant (${err.message}). If you opened this file directly in the browser, serve it over local HTTP instead (e.g. "python3 -m http.server").</p>`;
  }
}

function applyTransliterationPref(show) {
  document.body.classList.toggle('hide-transliteration', !show);
  transliterationToggle.classList.toggle('active', show);
  transliterationToggle.setAttribute('aria-pressed', String(show));
}

function applyTranslationPref(show) {
  document.body.classList.toggle('hide-translation', !show);
  translationToggle.classList.toggle('active', show);
  translationToggle.setAttribute('aria-pressed', String(show));
}

// Links a click across all three columns. Two mechanisms, both additive:
//
// 1. Cross-script bridge (deva <-> iast): activating a word also activates
//    its counterpart at the same (line, slot) in the other script, so the
//    highlight survives toggling transliteration. Unaffected by whether the
//    word has a meaning mapping.
// 2. Meaning concept (deva/iast <-> en): if the clicked word is in
//    MEANING_CONCEPTS, every surface form of that concept lights up in both
//    scripts (e.g. नमः, नमो, and नमस्ते together) along with its English
//    word(s) in the translation panel. Clicking an English box runs this in
//    reverse.
//
// Each side tracks a Set (not a single key) since a concept can span
// multiple surface forms in the same script.
//
// For a chant with linkScope: 'local' (see the CHANTS registry), a key match
// alone isn't enough to light two spans up together — they also need to be
// in the same verse or an adjacent one. lineSectionMap resolves each span's
// data-line back to its verse/section label so that distance can be
// measured; a non-numeric or unresolvable label (colophon, or any chant
// that never sets linkScope) falls back to unrestricted, which reproduces
// the old whole-chant behavior exactly.
function inLocalScope(clickedLine, nodeLine) {
  if (!currentChant || currentChant.linkScope !== 'local') return true;
  if (clickedLine === nodeLine) return true;
  const clickedSection = Number(lineSectionMap.get(clickedLine));
  const nodeSection = Number(lineSectionMap.get(nodeLine));
  if (!Number.isFinite(clickedSection) || !Number.isFinite(nodeSection)) return true;
  return Math.abs(clickedSection - nodeSection) <= 1;
}

function initRepeatClickHandling() {
  chantBody.addEventListener('click', (e) => {
    const span = e.target.closest('.token-repeat');
    if (!span) return;
    const { script, key, line, slot } = span.dataset;
    const wasActive = span.classList.contains('active');

    const activeKeys = { deva: new Set(), iast: new Set(), en: new Set() };

    if (!wasActive) {
      const addConcept = (conceptId) => {
        const concept = MEANING_CONCEPTS_BY_ID.get(conceptId);
        if (!concept) return;
        concept.deva.forEach((k) => activeKeys.deva.add(k));
        concept.iast.forEach((k) => activeKeys.iast.add(k));
        activeKeys.en.add(conceptId);
      };

      if (script === 'en') {
        addConcept(key);
      } else {
        activeKeys[script].add(key);
        // Assumes deva/iast box the same words in the same order per line,
        // which is true almost everywhere but not guaranteed — e.g.
        // Chamakam 147's "śrōtraṃ-yajñēna" is one hyphen-joined token in
        // Devanagari (यज्ञेन stays fused, never its own box) but two
        // space-separated words in the IAST source, so their boxes there
        // land on different slots and this pairs the wrong ones. Harmless
        // currently since both यज्ञेन and कल्पतां are registered concepts
        // that end up highlighted together anyway, but worth knowing if a
        // future concept pair on either side of a slot mismatch like this
        // should stay independent.
        const otherScript = script === 'deva' ? 'iast' : 'deva';
        const sibling = chantBody.querySelector(
          `.token-repeat[data-script="${otherScript}"][data-line="${line}"][data-slot="${slot}"]`
        );
        if (sibling) activeKeys[otherScript].add(sibling.dataset.key);
        const lookup = script === 'deva' ? CONCEPT_BY_DEVA : CONCEPT_BY_IAST;
        addConcept(lookup.get(key) || fusedPrefixConceptId(key, script));
      }
    }

    document.querySelectorAll('.token-repeat').forEach((node) => {
      const isMatch = activeKeys[node.dataset.script].has(node.dataset.key);
      node.classList.toggle('active', isMatch && inLocalScope(line, node.dataset.line));
    });
    updateNetworkOverlay();
  });
}

function init() {
  const requestedLang = new URLSearchParams(window.location.search).get('lang');
  const languageFilter = COLLECTIONS.some((c) => c.language === requestedLang) ? requestedLang : null;
  buildChantMenu(languageFilter);
  initChantMenu();
  initRepeatClickHandling();

  const savedShow = localStorage.getItem('vedavani:showTransliteration');
  let showTransliteration = savedShow === null ? true : savedShow === 'true';
  applyTransliterationPref(showTransliteration);

  const savedShowTranslation = localStorage.getItem('vedavani:showTranslation');
  let showTranslation = savedShowTranslation === null ? true : savedShowTranslation === 'true';
  applyTranslationPref(showTranslation);

  transliterationToggle.addEventListener('click', () => {
    showTransliteration = !showTransliteration;
    applyTransliterationPref(showTransliteration);
    localStorage.setItem('vedavani:showTransliteration', String(showTransliteration));
    // Rows reflow when transliteration is shown/hidden, so both the
    // translation column's positions and the network need recomputing even
    // though the active selection itself didn't change.
    alignTranslationLines();
    updateNetworkOverlay();
  });

  translationToggle.addEventListener('click', () => {
    showTranslation = !showTranslation;
    applyTranslationPref(showTranslation);
    localStorage.setItem('vedavani:showTranslation', String(showTranslation));
    // chant-text's width changes (640px cap dropped/restored) when the
    // translation column is hidden/shown, so both need recomputing even
    // though the active selection itself didn't change.
    alignTranslationLines();
    updateNetworkOverlay();
  });

  window.addEventListener('resize', () => {
    alignTranslationLines();
    updateNetworkOverlay();
  });

  // Within a language-filtered dropdown, a remembered chant from the other
  // language isn't one of its options — fall back to that language's own
  // first chant instead of the site-wide default.
  const eligible = languageFilter ? CHANTS.filter((c) => c.language === languageFilter) : CHANTS;
  const lastChant = localStorage.getItem('vedavani:lastChant');
  const initialId = eligible.some((c) => c.id === lastChant) ? lastChant : eligible[0].id;
  selectChant(initialId);
}

init();
