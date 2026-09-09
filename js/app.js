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
const toggleLabel = document.getElementById('toggleLabel');

// The current chant's text column and side-rail network SVG, rebuilt on
// every renderChant() call — see buildNetworkOverlay/updateNetworkOverlay.
let chantTextEl = null;
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
  const devaPara = el('p', 'deva-line');
  devaPara.appendChild(renderScriptLine(line.devanagari, 'deva', devaCounts, lineKey));
  wrapper.appendChild(devaPara);
  const iastPara = el('p', 'iast-line');
  iastPara.appendChild(renderScriptLine(line.iast, 'iast', iastCounts, lineKey));
  wrapper.appendChild(iastPara);
  return wrapper;
}

function renderChant(chant) {
  chantTitleDeva.textContent = chant.title.devanagari;
  chantTitleIast.textContent = chant.title.iast;
  chantSource.innerHTML = `Source: <a href="${chant.source.devanagari_url}" target="_blank" rel="noopener">${chant.source.site}</a>`;

  chantBody.innerHTML = '';
  const layout = el('div', 'chant-layout');
  chantTextEl = el('div', 'chant-text');
  networkRail = el('div', 'chant-rail');
  networkSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  networkSvg.setAttribute('class', 'network-svg');
  networkRail.appendChild(networkSvg);
  layout.appendChild(chantTextEl);
  layout.appendChild(networkRail);
  chantBody.appendChild(layout);

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
    const devaPara = el('p', 'deva-line');
    devaPara.appendChild(renderScriptLine(chant.colophon.devanagari, 'deva', devaCounts, 'colophon'));
    colophon.appendChild(devaPara);
    const iastPara = el('p', 'iast-line');
    iastPara.appendChild(renderScriptLine(chant.colophon.iast, 'iast', iastCounts, 'colophon'));
    colophon.appendChild(iastPara);
    chantTextEl.appendChild(colophon);
  }

  for (const section of chant.sections) {
    const devaCounts = buildRepeatCounts(section.lines.map((l) => l.devanagari), 'deva');
    const iastCounts = buildRepeatCounts(section.lines.map((l) => l.iast), 'iast');
    const block = el('div', 'section-block');
    block.appendChild(el('div', 'section-label', `Anuvāka ${section.label}`));
    for (const line of section.lines) {
      block.appendChild(renderLine(line, devaCounts, iastCounts));
    }
    chantTextEl.appendChild(block);
  }

  updateNetworkOverlay();
}

// --- Side-rail network: connects every currently-highlighted occurrence --
//
// One node per verse-line that contains an active occurrence (deduped, so a
// line with both a Devanagari and an IAST hit — or two hits in one script —
// still gets a single node), joined by a single vertical trunk with a
// horizontal stub reaching toward each node's row. Orthogonal lines only
// ("square"), confined entirely to the rail so it never touches the text.
const RAIL_STUB_INSET = 6;

function updateNetworkOverlay() {
  const rail = networkRail;
  const svg = networkSvg;
  if (!rail || !svg) return;
  if (rail.offsetParent === null) return; // hidden (e.g. narrow viewport)

  const width = rail.clientWidth;
  const height = rail.clientHeight;
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.innerHTML = '';

  const activeSpans = [...chantTextEl.querySelectorAll('.token-repeat.active')].filter(
    (node) => node.offsetParent !== null
  );
  if (activeSpans.length === 0) return;

  const railRect = rail.getBoundingClientRect();
  const rowYByLine = new Map();
  for (const span of activeSpans) {
    const lineKey = span.dataset.line;
    if (rowYByLine.has(lineKey)) continue;
    const row = span.closest('.verse-line') || span.closest('.colophon');
    if (!row) continue;
    const rowRect = row.getBoundingClientRect();
    rowYByLine.set(lineKey, rowRect.top + rowRect.height / 2 - railRect.top);
  }

  const ys = [...rowYByLine.values()].sort((a, b) => a - b);
  if (ys.length === 0) return;

  const trunkX = width - RAIL_STUB_INSET;
  const stubX = RAIL_STUB_INSET;
  const svgNS = 'http://www.w3.org/2000/svg';

  if (ys.length > 1) {
    const trunk = document.createElementNS(svgNS, 'line');
    trunk.setAttribute('x1', trunkX);
    trunk.setAttribute('x2', trunkX);
    trunk.setAttribute('y1', ys[0]);
    trunk.setAttribute('y2', ys[ys.length - 1]);
    svg.appendChild(trunk);
  }

  for (const y of ys) {
    const stub = document.createElementNS(svgNS, 'line');
    stub.setAttribute('x1', stubX);
    stub.setAttribute('x2', trunkX);
    stub.setAttribute('y1', y);
    stub.setAttribute('y2', y);
    svg.appendChild(stub);

    const node = document.createElementNS(svgNS, 'circle');
    node.setAttribute('cx', stubX);
    node.setAttribute('cy', y);
    node.setAttribute('r', 2.5);
    node.setAttribute('class', 'network-node');
    svg.appendChild(node);
  }
}

async function loadChant(id) {
  chantTextEl = null;
  networkRail = null;
  networkSvg = null;
  chantBody.innerHTML = '<p class="loading">Loading chant…</p>';
  try {
    const res = await fetch(`data/chants/${id}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const chant = await res.json();
    renderChant(chant);
    localStorage.setItem('vedavani:lastChant', id);
  } catch (err) {
    chantBody.innerHTML = `<p class="error">Could not load this chant (${err.message}). If you opened this file directly in the browser, serve it over local HTTP instead (e.g. "python3 -m http.server").</p>`;
  }
}

function applyTransliterationPref(show) {
  document.body.classList.toggle('hide-transliteration', !show);
  toggleLabel.textContent = show ? 'Hide transliteration' : 'Show transliteration';
}

// Links the click across scripts: activating a word also activates its
// counterpart in the other script (same line, same position among that
// line's repeat-spans), so the highlighted word stays the same regardless of
// whether transliteration is shown. If no counterpart exists at that slot
// (the two scripts split that particular line into a different number of
// repeat-spans), only the clicked script's matches are activated.
function initRepeatClickHandling() {
  chantBody.addEventListener('click', (e) => {
    const span = e.target.closest('.token-repeat');
    if (!span) return;
    const { script, key, line, slot } = span.dataset;
    const wasActive = span.classList.contains('active');

    const otherScript = script === 'deva' ? 'iast' : 'deva';
    const sibling = wasActive
      ? null
      : chantBody.querySelector(
          `.token-repeat[data-script="${otherScript}"][data-line="${line}"][data-slot="${slot}"]`
        );
    const activeKeys = { [script]: wasActive ? null : key, [otherScript]: sibling ? sibling.dataset.key : null };

    document.querySelectorAll('.token-repeat').forEach((node) => {
      node.classList.toggle('active', node.dataset.key === activeKeys[node.dataset.script]);
    });
    updateNetworkOverlay();
  });
}

function init() {
  populateChantSelect();
  initRepeatClickHandling();

  const savedShow = localStorage.getItem('vedavani:showTransliteration');
  const showInitially = savedShow === null ? true : savedShow === 'true';
  transliterationToggle.checked = showInitially;
  applyTransliterationPref(showInitially);

  transliterationToggle.addEventListener('change', () => {
    const show = transliterationToggle.checked;
    applyTransliterationPref(show);
    localStorage.setItem('vedavani:showTransliteration', String(show));
    // Rows reflow when transliteration is shown/hidden, so node positions
    // need recomputing even though the active selection itself didn't change.
    updateNetworkOverlay();
  });

  window.addEventListener('resize', () => updateNetworkOverlay());

  const lastChant = localStorage.getItem('vedavani:lastChant');
  const initialId = CHANTS.some((c) => c.id === lastChant) ? lastChant : CHANTS[0].id;
  chantSelect.value = initialId;
  loadChant(initialId);

  chantSelect.addEventListener('change', () => loadChant(chantSelect.value));
}

init();
