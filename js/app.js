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

// language here (not just each chant JSON's own "language" field) is what
// populateChantSelect groups the dropdown by — see CHANT_GROUPS below.
const CHANTS = [
  { id: 'abirami-antati', label: 'Abirami Antati', language: 'tamil' },
  { id: 'kanninun-cirutampu', label: 'Kanninun Cirutampu', language: 'tamil' },
  { id: 'arpudha-tiruvantati', label: 'Arpudha Tiruvantati', language: 'tamil' },
  { id: 'saraswati-antati', label: 'Saraswati Antati', language: 'tamil' },
  { id: 'mudhal-tiruvantati', label: 'Mudhal Tiruvantati', language: 'tamil' },
  { id: 'irandam-tiruvantati', label: 'Irandam Tiruvantati', language: 'tamil' },
  { id: 'munram-tiruvantati', label: 'Munram Tiruvantati', language: 'tamil' },
  { id: 'vel-maaral-tamil', label: 'Vel Maaral', language: 'tamil' },
  { id: 'thirukkural-arathuppal', label: 'Thirukkural — Aratthuppal', language: 'tamil' },
  { id: 'thirukkural-porutpal', label: 'Thirukkural — Porutpal', language: 'tamil' },
  { id: 'thirukkural-kaamathuppal', label: 'Thirukkural — Kaamathuppal', language: 'tamil' },
  { id: 'sri-rudram-namakam', label: 'Sri Rudram Namakam', language: 'sanskrit' },
  { id: 'sri-rudram-chamakam', label: 'Sri Rudram Chamakam', language: 'sanskrit' },
  { id: 'soundarya-lahari', label: 'Soundarya Lahari', language: 'sanskrit' },
  { id: 'shivananda-lahari', label: 'Shivananda Lahari', language: 'sanskrit' },
];

// Dropdown group order/labels — Tamil first so Abirami Antati (CHANTS[0],
// also the default chant on a first visit) stays the first option overall.
const CHANT_GROUPS = [
  { language: 'tamil', label: 'Tamil' },
  { language: 'sanskrit', label: 'Sanskrit' },
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

// Namakam anuvāka 3's litany explicitly salutes Rudra as lord of thieves,
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

const chantSelect = document.getElementById('chantSelect');
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

// languageFilter (from chants.html's own ?lang= query param — see the
// Chants hub's two cards on index.html) restricts the dropdown to a single
// group, dropping the optgroup wrapper entirely since a label is redundant
// when there's nothing to distinguish it from. Falls back to every chant,
// grouped as usual, when absent/unrecognized (e.g. chants.html visited
// directly, no query param) — segregation is an entry point, not a lock.
function populateChantSelect(languageFilter) {
  const groups = CHANT_GROUPS.filter((g) => !languageFilter || g.language === languageFilter);
  for (const group of groups) {
    const parent = languageFilter ? chantSelect : document.createElement('optgroup');
    if (!languageFilter) parent.label = group.label;
    for (const chant of CHANTS.filter((c) => c.language === group.language)) {
      const option = document.createElement('option');
      option.value = chant.id;
      option.textContent = chant.label;
      parent.appendChild(option);
    }
    if (!languageFilter) chantSelect.appendChild(parent);
  }
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
    deva: ['रुद्र', 'रुद्राय', 'रुद्रा', 'रुद्रो', 'रुद्रस्य', 'रुद्रेभ्यो', 'रुद्रोत'],
    iast: ['rudra', 'rudrāya', 'rudrā', 'rudrō', 'rudrasya', 'rudrēbhyō', 'rudrōta'],
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
  // Concentrated in Namakam anuvākas 1, 5, 10, 11, and 12.
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
  // பொருள் (poruḷ) is deliberately NOT registered as a concept, despite
  // being one of Thirukkural's most frequent words and literally the title
  // of its second book: checked occurrence-by-occurrence, it shifts sense
  // constantly — "wealth"/"property" in some lines, but "meaning" (சொற்பொருள்),
  // "the true thing/reality" (மெய்ப்பொருள்), "subject matter" (நுண்பொருள்),
  // "advantage" (அதுபொருள்), and more elsewhere. A single english gloss
  // would box several of these wrongly and connect them to unrelated
  // translation words. Left out rather than forced — same judgment call
  // as the sanskrit-in-tamil-script Math-domain KB decision earlier.
];

const MEANING_CONCEPTS_BY_ID = new Map(MEANING_CONCEPTS.map((c) => [c.id, c]));
const CONCEPT_BY_DEVA = new Map(MEANING_CONCEPTS.flatMap((c) => c.deva.map((form) => [form, c.id])));
const CONCEPT_BY_IAST = new Map(MEANING_CONCEPTS.flatMap((c) => c.iast.map((form) => [form, c.id])));
const CONCEPT_BY_ENGLISH = new Map(MEANING_CONCEPTS.flatMap((c) => c.english.map((word) => [word, c.id])));

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
  const parts = text.match(/[A-Za-z']+|\n|[^A-Za-z'\n]+/g) || [text];
  const isWord = (p) => /^[A-Za-z']+$/.test(p);
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
      const conceptId = hasConcepts ? CONCEPT_BY_ENGLISH.get(key) : null;
      if (conceptId && conceptIds.has(conceptId)) {
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
      node.classList.toggle('active', activeKeys[node.dataset.script].has(node.dataset.key));
    });
    updateNetworkOverlay();
  });
}

function init() {
  const requestedLang = new URLSearchParams(window.location.search).get('lang');
  const languageFilter = CHANT_GROUPS.some((g) => g.language === requestedLang) ? requestedLang : null;
  populateChantSelect(languageFilter);
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
  chantSelect.value = initialId;
  loadChant(initialId);

  chantSelect.addEventListener('change', () => loadChant(chantSelect.value));
}

init();
