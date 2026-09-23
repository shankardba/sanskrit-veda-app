#!/usr/bin/env python3
"""Build data/chants/abirami-antati.json from aanmeegam.org's Tamil and
English (romanized) pages for Abirami Antati.

Unlike vignanam.org's paragraph-per-<p>-with-<br> structure (see
ingest_chant.py), aanmeegam.org marks each of the 102 stanzas (kāppu + 100
numbered verses + the closing payan) with its own <h3> heading immediately
followed by a single <p> holding the full four-line verse (lines joined by
literal newlines, no <br> tags) — and, on the Tamil page only, further <p>
elements per verse giving a word-meaning/commentary breakdown, skipped here
(not yet carried onto the site — see the script's own docstring note below).

Usage:
    python3 ingest_abirami_antati.py
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

TAMIL_URL = "https://aanmeegam.org/slogas/abirami-anthathi/"
ENGLISH_URL = "https://aanmeegam.org/en/slokas/abirami-anthathi-lyrics-in-english/"

# Trailing verse-number / "– kaappu" markers aanmeegam appends to the
# English (but not Tamil) verse text — stripped since this site supplies its
# own section labels instead.
TRAILING_MARKER_RE = re.compile(r"\s*(–\s*kaappu|\d+)\s*$")

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "chants"


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8")


def extract_tamil_verses(html: str) -> list[str]:
    soup = BeautifulSoup(html, "lxml")
    article = soup.select_one("article.prose")
    verses = []
    for h3 in article.find_all("h3", recursive=False):
        para = h3.find_next_sibling()
        if para is None or para.name != "p" or para.get_text().startswith("பொருள்:"):
            raise ValueError(f"Unexpected structure after heading: {h3.get_text()!r}")
        verses.append(para.get_text().strip())
    return verses


def extract_english_verses(html: str) -> list[str]:
    soup = BeautifulSoup(html, "lxml")
    article = soup.select_one("article.prose")
    verses = []
    for p in article.find_all("p", recursive=False):
        text = p.get_text().strip()
        if text == "Noorpayan":
            continue
        verses.append(TRAILING_MARKER_RE.sub("", text).strip())
    return verses


def main() -> None:
    ta_verses = extract_tamil_verses(fetch(TAMIL_URL))
    en_verses = extract_english_verses(fetch(ENGLISH_URL))

    if len(ta_verses) != len(en_verses):
        raise ValueError(f"Verse count mismatch: tamil={len(ta_verses)} english={len(en_verses)}")
    if len(ta_verses) != 102:
        raise ValueError(f"Expected 102 stanzas (kāppu + 100 + payan), got {len(ta_verses)}")

    for i, (ta, en) in enumerate(zip(ta_verses, en_verses)):
        ta_lines = ta.split("\n")
        en_lines = en.split("\n")
        if len(ta_lines) != len(en_lines):
            raise ValueError(f"Line-count mismatch at stanza {i}: ta={len(ta_lines)} en={len(en_lines)}")

    section_labels = ["Kāppu"] + [str(n) for n in range(1, 101)] + ["Payan"]

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
        "id": "abirami-antati",
        "language": "tamil",
        "title": {"devanagari": "அபிராமி அந்தாதி", "iast": "Apirāmi Antāti"},
        "source": {
            "site": "aanmeegam.org",
            "devanagari_url": TAMIL_URL,
            "iast_url": ENGLISH_URL,
        },
        "colophon": {
            "devanagari": "அபிராமி பட்டர் அருளிய அபிராமி அந்தாதி",
            "iast": "Composed by Abirami Bhattar (Subramanya Iyer, 18th century CE) in praise of the goddess Abirami of Thirukadaiyur.",
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
