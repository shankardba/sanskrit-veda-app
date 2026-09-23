#!/usr/bin/env python3
"""Build data/chants/saraswati-antati.json from aanmeegam.org.

Source: https://aanmeegam.org/slogas/saraswathi-anthathi/ (Tamil) and
https://aanmeegam.org/en/slokas/saraswathi-anthathi-lyrics/ (English
romanization) — Kambar's 32-stanza hymn to Saraswati: two kaṭavuḷ vāḻttu
(invocation) verses followed by 30 numbered verses in kalitturai meter.

Same site family as build_abirami_antati.py's source, but a different page
layout — the Tamil page mixes verses with label paragraphs (a "கடவுள்
வாழ்த்து" heading before the two invocation verses, a "நூல்: கலித்துறை"
meter-label before the 30 numbered ones) rather than one <h3> per verse, so
those specific label strings are filtered out rather than matched against.
"""
import json
import re
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)

TAMIL_URL = "https://aanmeegam.org/slogas/saraswathi-anthathi/"
ENGLISH_URL = "https://aanmeegam.org/en/slokas/saraswathi-anthathi-lyrics/"

NON_VERSE_PREFIXES = ("கடவுள் வாழ்த்து", "நூல்:", "இராமாயணம்", "Also")
TRAILING_NUMBER_RE = re.compile(r"\s*\d+\s*$")

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "chants"


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8")


def extract_tamil_verses(html: str) -> list[str]:
    soup = BeautifulSoup(html, "lxml")
    article = soup.select_one("article.prose")
    verses = []
    for p in article.find_all("p", recursive=False):
        text = p.get_text().strip()
        if not text or text.startswith(NON_VERSE_PREFIXES):
            continue
        verses.append(TRAILING_NUMBER_RE.sub("", text).strip())
    return verses


def extract_english_verses(html: str) -> list[str]:
    soup = BeautifulSoup(html, "lxml")
    article = soup.select_one("article.prose")
    verses = []
    for p in article.find_all("p", recursive=False):
        text = p.get_text().strip()
        if not text:
            continue
        verses.append(TRAILING_NUMBER_RE.sub("", text).strip())
    return verses


def main() -> None:
    ta_verses = extract_tamil_verses(fetch(TAMIL_URL))
    en_verses = extract_english_verses(fetch(ENGLISH_URL))

    if len(ta_verses) != len(en_verses):
        raise ValueError(f"Verse count mismatch: tamil={len(ta_verses)} english={len(en_verses)}")
    if len(ta_verses) != 32:
        raise ValueError(f"Expected 32 stanzas (2 invocation + 30 numbered), got {len(ta_verses)}")

    for i, (ta, en) in enumerate(zip(ta_verses, en_verses)):
        if len(ta.split("\n")) != len(en.split("\n")):
            raise ValueError(f"Line-count mismatch at stanza {i}")

    section_labels = ["Kaṭavuḷ Vāḻttu 1", "Kaṭavuḷ Vāḻttu 2"] + [str(n) for n in range(1, 31)]

    sections = []
    for label, ta, en in zip(section_labels, ta_verses, en_verses):
        ta_lines = ta.split("\n")
        en_lines = en.split("\n")
        sections.append({
            "label": label,
            "lines": [
                {"n": i + 1, "devanagari": tl, "iast": el}
                for i, (tl, el) in enumerate(zip(ta_lines, en_lines))
            ],
        })

    chant = {
        "id": "saraswati-antati",
        "language": "tamil",
        "title": {"devanagari": "சரஸ்வதி அந்தாதி", "iast": "Sarasvati Antāti"},
        "source": {
            "site": "aanmeegam.org",
            "devanagari_url": TAMIL_URL,
            "iast_url": ENGLISH_URL,
        },
        "colophon": {
            "devanagari": "கம்பர் அருளிய சரஸ்வதி அந்தாதி",
            "iast": "Composed by Kambar (Kavichakravarthy, 12th century CE), best known for the Kambaramayanam — one of nine works attributed to him. A hymn to Saraswati, goddess of learning.",
        },
        "sectionUnit": "",
        "sections": sections,
    }

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    out_path = DATA_DIR / f"{chant['id']}.json"
    out_path.write_text(json.dumps(chant, ensure_ascii=False, indent=2), encoding="utf-8")
    total_lines = sum(len(s["lines"]) for s in chant["sections"])
    print(f"Wrote {out_path} — {len(chant['sections'])} sections, {total_lines} lines")


if __name__ == "__main__":
    main()
