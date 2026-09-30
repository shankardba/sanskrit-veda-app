#!/usr/bin/env python3
"""Build data/chants/<id>.json from a hand-checked, section-marked Devanagari
source file in scripts/marked_sources/<id>.txt, generating IAST with
deva_to_iast (house style). For chants with no paired IAST page to scrape —
the Raksha Stotrams and Kavachams, sourced from sanskritdocuments.org.

Source file format:
    # id: rama-raksha-stotram          header keys: id, title_deva,
    # title_deva: श्रीरामरक्षास्तोत्रम्     title_iast, site, url, note,
    # section_unit: Verse              section_unit ('' = bare labels)
    @ 1                                a section, labelled "1"
    first line of the section
    second line
    @@ colophon                        optional closing colophon line
    इति ... सम्पूर्णम् ॥

Usage: python3 build_marked_chant.py <id> [<id> ...]
"""
import json
import sys
from pathlib import Path

from deva_to_iast import deva_to_iast

ROOT = Path(__file__).resolve().parent.parent
SOURCES = Path(__file__).resolve().parent / 'marked_sources'


def build(chant_id: str) -> dict:
    meta = {}
    sections = []
    colophon = None
    current = None
    n = 0
    for raw in (SOURCES / f'{chant_id}.txt').read_text(encoding='utf-8').splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith('# '):
            key, _, value = line[2:].partition(':')
            meta[key.strip()] = value.strip()
        elif line.startswith('@@ colophon'):
            current = 'colophon'
        elif line.startswith('@ '):
            current = {'label': line[2:].strip(), 'lines': []}
            sections.append(current)
        elif current == 'colophon':
            colophon = line
        else:
            n += 1
            current['lines'].append({'n': n, 'devanagari': line, 'iast': deva_to_iast(line)})

    chant = {
        'id': meta['id'],
        'language': 'sanskrit',
        'title': {'devanagari': meta['title_deva'], 'iast': meta['title_iast']},
        'source': {'site': meta['site'], 'devanagari_url': meta['url'], 'note': meta['note']},
    }
    if colophon:
        chant['colophon'] = {'devanagari': colophon, 'iast': deva_to_iast(colophon)}
    chant['sectionUnit'] = meta.get('section_unit', 'Verse')
    chant['sections'] = sections
    return chant


if __name__ == '__main__':
    for chant_id in sys.argv[1:]:
        chant = build(chant_id)
        out = ROOT / 'data' / 'chants' / f'{chant_id}.json'
        out.write_text(json.dumps(chant, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        lines = sum(len(s['lines']) for s in chant['sections'])
        print(f'{chant_id}: {len(chant["sections"])} sections, {lines} lines -> {out.relative_to(ROOT)}')
