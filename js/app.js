// Vedavani viewer engine — chant-agnostic: given a chant JSON file matching
// the schema written by scripts/ingest_chant.py, renders Devanagari lines
// with their IAST transliteration underneath, toggle-able on/off, and boxes
// repeated words/phrases so recurring formulas are visible at a glance.

const CHANTS = [
  { id: 'sri-rudram-namakam', label: 'Sri Rudram Namakam' },
  { id: 'sri-rudram-chamakam', label: 'Sri Rudram Chamakam' },
];

const chantSelect = document.getElementById('chantSelect');
const chantBody = document.getElementById('chantBody');
const chantTitleDeva = document.getElementById('chantTitleDeva');
const chantTitleIast = document.getElementById('chantTitleIast');
const chantSource = document.getElementById('chantSource');
const transliterationToggle = document.getElementById('transliterationToggle');

// The current chant's layout (text column + rail + translation column) and
// its network SVG, rebuilt on every renderChant() call — see
// updateNetworkOverlay.
let chantTextEl = null;
let chantTranslationEl = null;
let networkLayout = null;
let networkRail = null;
let networkSvg = null;

function populateChantSelect() {
  for (const chant of CHANTS) {
    const option = document.createElement('option');
    option.value = chant.id;
    option.textContent = chant.label;
    chantSelect.appendChild(option);
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
  { id: 'rudra', deva: ['रुद्र'], iast: ['rudra'], english: ['rudra'] },
  { id: 'shiva', deva: ['शिवा'], iast: ['śivā'], english: ['auspicious'] },
  { id: 'me', deva: ['मे'], iast: ['mē'], english: ['mine', 'me'] },
];

const MEANING_CONCEPTS_BY_ID = new Map(MEANING_CONCEPTS.map((c) => [c.id, c]));
const CONCEPT_BY_DEVA = new Map(MEANING_CONCEPTS.flatMap((c) => c.deva.map((form) => [form, c.id])));
const CONCEPT_BY_IAST = new Map(MEANING_CONCEPTS.flatMap((c) => c.iast.map((form) => [form, c.id])));
const CONCEPT_BY_ENGLISH = new Map(MEANING_CONCEPTS.flatMap((c) => c.english.map((word) => [word, c.id])));

// Which concepts actually occur in this specific verse-line, so an English
// word only gets boxed on lines where its Sanskrit counterpart genuinely
// appears — not everywhere that English word happens to occur in the text.
function conceptsInLine(devanagari, iast) {
  const ids = new Set();
  for (const word of devanagari.split(/\s+/)) {
    const id = CONCEPT_BY_DEVA.get(normalizeToken(word, 'deva'));
    if (id) ids.add(id);
  }
  for (const word of iast.split(/\s+/)) {
    const id = CONCEPT_BY_IAST.get(normalizeToken(word, 'iast'));
    if (id) ids.add(id);
  }
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

// Splits a line into ordered segments, each tagged 'word' (counts toward
// phrases), 'punct' (breaks a phrase run), or 'space' (preserved verbatim,
// doesn't break a run).
function segmentLine(rawText, script) {
  const parts = rawText.match(/\S+|\s+/g) || [];
  return parts.map((text) => {
    if (/^\s+$/.test(text)) return { text, kind: 'space', norm: '' };
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
      else if (seg.kind === 'punct') flushRun();
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

    let matchedN = 0;
    let matchedKey = '';
    for (let n = normsAhead.length; n >= 1; n--) {
      const key = normsAhead.slice(0, n).join(' ');
      if ((counts.get(key) || 0) >= 2) {
        matchedN = n;
        matchedKey = key;
        break;
      }
    }

    if (matchedN === 0) {
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

function renderLine(line, devaCounts, iastCounts) {
  const lineKey = String(line.n);
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
// handling) wherever that word is one of `conceptIds`' mapped English words.
function renderTranslationText(text, conceptIds) {
  const frag = document.createDocumentFragment();
  if (!conceptIds || conceptIds.size === 0) {
    frag.appendChild(document.createTextNode(text));
    return frag;
  }
  const parts = text.match(/[A-Za-z']+|[^A-Za-z']+/g) || [text];
  for (const part of parts) {
    const conceptId = CONCEPT_BY_ENGLISH.get(part.toLowerCase());
    if (conceptId && conceptIds.has(conceptId)) {
      const span = document.createElement('span');
      span.className = 'token-repeat';
      span.dataset.script = 'en';
      span.dataset.key = conceptId;
      span.textContent = part;
      frag.appendChild(span);
    } else {
      frag.appendChild(document.createTextNode(part));
    }
  }
  return frag;
}

function renderChant(chant, translation) {
  chantTitleDeva.textContent = chant.title.devanagari;
  chantTitleIast.textContent = chant.title.iast;
  chantSource.innerHTML = `Source: <a href="${chant.source.devanagari_url}" target="_blank" rel="noopener">${chant.source.site}</a>`;

  chantBody.innerHTML = '';
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
    p.appendChild(renderTranslationText(text, conceptIds));
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

  for (const section of chant.sections) {
    const devaCounts = buildRepeatCounts(section.lines.map((l) => l.devanagari), 'deva');
    const iastCounts = buildRepeatCounts(section.lines.map((l) => l.iast), 'iast');
    const block = el('div', 'section-block');
    block.appendChild(el('div', 'section-label', `Anuvāka ${section.label}`));
    for (const line of section.lines) {
      block.appendChild(renderLine(line, devaCounts, iastCounts));
      appendTranslationLine(
        String(line.n),
        translationLines[String(line.n)],
        conceptsInLine(line.devanagari, line.iast)
      );
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
      `.verse-line[data-line="${para.dataset.line}"], .colophon[data-line="${para.dataset.line}"]`
    );
    if (!target) continue;
    const top = target.getBoundingClientRect().top - containerRect.top;
    para.style.top = `${top}px`;
  }
}

// --- Connector network: links every currently-highlighted occurrence -----
//
// One right-angle elbow per *row* that contains an active occurrence — all
// occurrences sharing a row (e.g. two "cha" in the same Devanagari line)
// resolve to a single connector, anchored at the rightmost one, rather than
// each drawing its own. Devanagari and IAST rows of the same verse-line
// still land at different points on the trunk (never merged with each
// other), since they're different rows.
//
// Anchoring at the rightmost occurrence in a row keeps the flat run short:
// usually there's nothing left after the last repeated word but punctuation
// or a verse number, neither of which carries an accent mark to graze.
// Combined with the tighter accent marks (udatta/svarita now reach only 5px
// above, IAST's own anudatta only 2.5px below), a short drop clears both the
// row-below's ticks and this row's own trailing marks without needing a
// curve.
const SVG_NS = 'http://www.w3.org/2000/svg';
const CONNECTOR_DROP = 3;
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

  const activeSpans = [...chantTextEl.querySelectorAll('.token-repeat.active')].filter(
    (node) => node.offsetParent !== null
  );
  if (activeSpans.length === 0) return;

  const railRect = rail.getBoundingClientRect();
  const trunkX = railRect.left - layoutRect.left + railRect.width / 2;

  // One anchor span per (line, script) row — keep whichever is furthest
  // right, so the flat run to the trunk covers as little of the row as
  // possible.
  const anchorByRow = new Map();
  for (const span of activeSpans) {
    const rowKey = `${span.dataset.line}:${span.dataset.script}`;
    const existing = anchorByRow.get(rowKey);
    if (!existing || span.getBoundingClientRect().right > existing.getBoundingClientRect().right) {
      anchorByRow.set(rowKey, span);
    }
  }

  const elbowYs = [];
  for (const span of anchorByRow.values()) {
    const boxRect = span.getBoundingClientRect();
    const boxX = boxRect.left + boxRect.width / 2 - layoutRect.left;
    const boxY = boxRect.bottom - layoutRect.top;
    const elbowY = boxY + CONNECTOR_DROP;
    elbowYs.push(elbowY);

    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', `M ${boxX} ${boxY} L ${boxX} ${elbowY} L ${trunkX} ${elbowY}`);
    path.setAttribute('class', 'network-path');
    svg.appendChild(path);
  }

  // Mirror stub on the translation side: one per active verse-line (not per
  // row — Devanagari and IAST both point at the same single translation
  // line), reaching left to the trunk. Its own point is added to the
  // trunk's span too, so the shared vertical line is what actually bridges
  // the gap between wherever the Sanskrit box sits and wherever its
  // translation line happens to fall — no attempt to vertically align the
  // two columns, since wrapped lines make that unreliable.
  if (chantTranslationEl && chantTranslationEl.offsetParent !== null) {
    const translationRect = chantTranslationEl.getBoundingClientRect();
    const translationX = translationRect.left - layoutRect.left + TRANSLATION_STUB_INSET;
    const seenLines = new Set();
    for (const span of activeSpans) {
      const lineKey = span.dataset.line;
      if (seenLines.has(lineKey)) continue;
      seenLines.add(lineKey);
      const para = chantTranslationEl.querySelector(`.translation-line[data-line="${lineKey}"]`);
      if (!para) continue;
      const paraRect = para.getBoundingClientRect();
      const paraY = paraRect.top + paraRect.height / 2 - layoutRect.top;
      elbowYs.push(paraY);

      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', `M ${translationX} ${paraY} L ${trunkX} ${paraY}`);
      path.setAttribute('class', 'network-path');
      svg.appendChild(path);
    }
  }

  if (elbowYs.length > 1) {
    const trunk = document.createElementNS(SVG_NS, 'line');
    trunk.setAttribute('x1', trunkX);
    trunk.setAttribute('x2', trunkX);
    trunk.setAttribute('y1', Math.min(...elbowYs));
    trunk.setAttribute('y2', Math.max(...elbowYs));
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
        const otherScript = script === 'deva' ? 'iast' : 'deva';
        const sibling = chantBody.querySelector(
          `.token-repeat[data-script="${otherScript}"][data-line="${line}"][data-slot="${slot}"]`
        );
        if (sibling) activeKeys[otherScript].add(sibling.dataset.key);
        addConcept((script === 'deva' ? CONCEPT_BY_DEVA : CONCEPT_BY_IAST).get(key));
      }
    }

    document.querySelectorAll('.token-repeat').forEach((node) => {
      node.classList.toggle('active', activeKeys[node.dataset.script].has(node.dataset.key));
    });
    updateNetworkOverlay();
  });
}

function init() {
  populateChantSelect();
  initRepeatClickHandling();

  const savedShow = localStorage.getItem('vedavani:showTransliteration');
  let showTransliteration = savedShow === null ? true : savedShow === 'true';
  applyTransliterationPref(showTransliteration);

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

  window.addEventListener('resize', () => {
    alignTranslationLines();
    updateNetworkOverlay();
  });

  const lastChant = localStorage.getItem('vedavani:lastChant');
  const initialId = CHANTS.some((c) => c.id === lastChant) ? lastChant : CHANTS[0].id;
  chantSelect.value = initialId;
  loadChant(initialId);

  chantSelect.addEventListener('change', () => loadChant(chantSelect.value));
}

init();
