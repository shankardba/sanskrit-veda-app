#!/usr/bin/env python3
"""Build the three Thirukkural chant JSON files (one per book) plus their
translation files, from api.gokulnath.com — the JSON API behind
thirukkural.gokulnath.com (discovered via its app bundle's thirukkuralsRepository
service; thirukkural.gokulnath.com itself is Tamil-commentary-only, with no
English or romanization on its default view).

Each of the 1330 couplets (kurals) becomes ONE lines[] entry, its two
physical lines joined with a literal "\n" — the app's documented manual-
line-break convention — rather than two separate line entries. That keeps
each kural's EnglishMeaning as a single coherent sentence in the
translation panel instead of an arbitrary mid-sentence split.

Usage:
    python3 build_thirukkural.py
"""
import html
import json
import re
import time
import urllib.request
from pathlib import Path

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
API_BASE = "https://api.gokulnath.com/"
BR_RE = re.compile(r'<br\s*/?>')

DATA_CHANTS = Path(__file__).resolve().parent.parent / "data" / "chants"
DATA_TRANSLATIONS = Path(__file__).resolve().parent.parent / "data" / "translations"

# (chapter_range) confirmed via thirukkuralsections/{1,2,3}/chapters: Book 1
# (Virtue) = adhikārams 1-38, Book 2 (Wealth) = 39-108, Book 3 (Love) = 109-133.
BOOKS = [
    {
        'id': 'thirukkural-arathuppal',
        'chapter_range': (1, 38),
        'title_devanagari': 'திருக்குறள் — அறத்துப்பால்',
        'title_iast': 'Thirukkural — Araththuppāl (Virtue)',
        'colophon_devanagari': 'திருவள்ளுவர் அருளிய திருக்குறள் — அறத்துப்பால்',
        'colophon_iast': (
            'Composed by Thiruvalluvar, traditionally dated to around the 5th century CE — 1330 couplets '
            '(kurals), sorted into 133 chapters of ten each, grouped into three books. Here begins the first, '
            'Araththuppāl ("Virtue") — domestic and ascetic life, in 38 sections.'
        ),
    },
    {
        'id': 'thirukkural-porutpal',
        'chapter_range': (39, 108),
        'title_devanagari': 'திருக்குறள் — பொருட்பால்',
        'title_iast': 'Thirukkural — Porutpāl (Wealth)',
        'colophon_devanagari': 'திருவள்ளுவர் அருளிய திருக்குறள் — பொருட்பால்',
        'colophon_iast': (
            'The second of Thirukkural\'s three books, Porutpāl ("Wealth") — 70 sections, the longest book, '
            'on statecraft, kingship, and the conduct of public and economic life.'
        ),
    },
    {
        'id': 'thirukkural-kaamathuppal',
        'chapter_range': (109, 133),
        'title_devanagari': 'திருக்குறள் — காமத்துப்பால்',
        'title_iast': 'Thirukkural — Kaamaththuppāl (Love)',
        'colophon_devanagari': 'திருவள்ளுவர் அருளிய திருக்குறள் — காமத்துப்பால்',
        'colophon_iast': (
            'The third and final book, Kaamaththuppāl ("Love") — 25 sections on romantic love, cast '
            '(following Sangam convention) in the voices of a man, a woman, and her companions.'
        ),
    },
]

SOURCE = {
    'site': 'thirukkural.gokulnath.com',
    'devanagari_url': 'https://thirukkural.gokulnath.com/#/thirukkuralchapters/1/thirukkurals',
    'iast_url': 'https://thirukkural.gokulnath.com/#/thirukkuralchapters/1/thirukkurals',
}


def fetch(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.load(resp)['Data']


def clean(text: str) -> str:
    """Collapse a <br/>-joined API field into "\n"-joined physical lines,
    unescaping entities and normalizing internal whitespace on each line."""
    if not text:
        return ''
    text = BR_RE.sub('\n', html.unescape(text))
    parts = [re.sub(r'\s+', ' ', p.strip()) for p in text.split('\n')]
    return '\n'.join(p for p in parts if p)


def main() -> None:
    chapters = fetch(API_BASE + 'thirukkuralchapters')
    chapters_by_index = {c['Index']: c for c in chapters}
    if len(chapters) != 133:
        raise ValueError(f"expected 133 adhikārams, got {len(chapters)}")

    kurals_by_chapter = {}
    for chapter_idx in chapters_by_index:
        kurals_by_chapter[chapter_idx] = fetch(f"{API_BASE}thirukkuralchapters/{chapter_idx}/thirukkurals")
        time.sleep(0.05)

    DATA_CHANTS.mkdir(parents=True, exist_ok=True)
    DATA_TRANSLATIONS.mkdir(parents=True, exist_ok=True)

    grand_total = 0
    for book in BOOKS:
        lo, hi = book['chapter_range']
        sections, translation_lines, line_index = [], {}, 0

        for chapter_idx in range(lo, hi + 1):
            kural_list = kurals_by_chapter[chapter_idx]
            if len(kural_list) != 10:
                raise ValueError(f"chapter {chapter_idx} has {len(kural_list)} kurals, expected 10")

            lines = []
            for k in kural_list:
                lines.append({
                    'n': k['Index'],
                    'devanagari': clean(k['Tamil']),
                    'iast': clean(k['TamilTransliteration']),
                })
                line_index += 1
                translation_lines[str(line_index)] = clean(k['EnglishMeaning'])

            sections.append({'label': str(chapter_idx), 'lines': lines})

        chant = {
            'id': book['id'],
            'language': 'tamil',
            'title': {'devanagari': book['title_devanagari'], 'iast': book['title_iast']},
            'source': dict(SOURCE),
            'colophon': {'devanagari': book['colophon_devanagari'], 'iast': book['colophon_iast']},
            'sectionUnit': 'Adhikāram',
            'sections': sections,
        }
        (DATA_CHANTS / f"{book['id']}.json").write_text(
            json.dumps(chant, ensure_ascii=False, indent=2), encoding='utf-8'
        )
        (DATA_TRANSLATIONS / f"{book['id']}.json").write_text(
            json.dumps({'id': book['id'], 'lines': translation_lines}, ensure_ascii=False, indent=2),
            encoding='utf-8',
        )

        total_lines = sum(len(s['lines']) for s in sections)
        grand_total += total_lines
        print(f"Wrote {book['id']}.json — {len(sections)} sections, {total_lines} lines")

    print('grand total kural lines:', grand_total)

    # Print ANUVAKA_TAGLINES entries (English adhikāram title per chapter,
    # keyed by chant id then section label) for hand-pasting into app.js —
    # not written automatically since ANUVAKA_TAGLINES also covers non-
    # Thirukkural chants this script doesn't own.
    print("\n--- ANUVAKA_TAGLINES entries (paste into js/app.js) ---")
    for book in BOOKS:
        lo, hi = book['chapter_range']
        print(f"  '{book['id']}': {{")
        for chapter_idx in range(lo, hi + 1):
            title = chapters_by_index[chapter_idx]['English'].strip().replace("'", "\\'")
            print(f"    {chapter_idx}: '{title}',")
        print('  },')


if __name__ == '__main__':
    main()
