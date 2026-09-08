// Vedavani viewer engine — chant-agnostic: given a chant JSON file matching
// the schema written by scripts/ingest_chant.py, renders Devanagari lines
// with their IAST transliteration underneath, toggle-able on/off.

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

function renderIast(text) {
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

function renderLine(line) {
  const wrapper = el('div', 'verse-line');
  wrapper.appendChild(el('p', 'deva-line', line.devanagari));
  const iastPara = el('p', 'iast-line');
  iastPara.appendChild(renderIast(line.iast));
  wrapper.appendChild(iastPara);
  return wrapper;
}

function renderChant(chant) {
  chantTitleDeva.textContent = chant.title.devanagari;
  chantTitleIast.textContent = chant.title.iast;
  chantSource.innerHTML = `Source: <a href="${chant.source.devanagari_url}" target="_blank" rel="noopener">${chant.source.site}</a>`;

  chantBody.innerHTML = '';

  if (chant.colophon) {
    const colophon = el('div', 'colophon');
    colophon.appendChild(el('p', 'deva-line', chant.colophon.devanagari));
    const iastPara = el('p', 'iast-line');
    iastPara.appendChild(renderIast(chant.colophon.iast));
    colophon.appendChild(iastPara);
    chantBody.appendChild(colophon);
  }

  for (const section of chant.sections) {
    const block = el('div', 'section-block');
    block.appendChild(el('div', 'section-label', `Anuvāka ${section.label}`));
    for (const line of section.lines) {
      block.appendChild(renderLine(line));
    }
    chantBody.appendChild(block);
  }
}

async function loadChant(id) {
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

function init() {
  populateChantSelect();

  const savedShow = localStorage.getItem('vedavani:showTransliteration');
  const showInitially = savedShow === null ? true : savedShow === 'true';
  transliterationToggle.checked = showInitially;
  applyTransliterationPref(showInitially);

  transliterationToggle.addEventListener('change', () => {
    const show = transliterationToggle.checked;
    applyTransliterationPref(show);
    localStorage.setItem('vedavani:showTransliteration', String(show));
  });

  const lastChant = localStorage.getItem('vedavani:lastChant');
  const initialId = CHANTS.some((c) => c.id === lastChant) ? lastChant : CHANTS[0].id;
  chantSelect.value = initialId;
  loadChant(initialId);

  chantSelect.addEventListener('change', () => loadChant(chantSelect.value));
}

init();
