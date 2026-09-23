#!/usr/bin/env python3
"""Build data/chants/arpudha-tiruvantati.json from Tamil Wikisource.

Source: https://ta.wikisource.org/wiki/அற்புதத்_திருவந்தாதி/அற்புதத்_திருவந்தாதி
— a scanned-and-proofread scholarly edition (Peraciriyar K. Vellaivaranam's
commentary), Tamil text only. No English/romanized companion page was found
for this one (unlike vignanam.org/aanmeegam.org for this site's other
chants) — ingested as Tamil-script-only rather than delay or hand-guess a
transliteration; the "iast" field is left empty per line.

The page numbers each of the 101 venba verses, but inconsistently: most as
"(N)", a few as "(N" (missing the closing paren — a transcription slip, see
verse 11) or as a bare standalone "N" with no parens at all (verses
46-49, 52, 64). All three forms are matched; for each marker the four
non-blank lines immediately preceding it are taken as that verse (the
scholarly prose commentary that follows every verse, and precedes the next,
is discarded). Cross-checked structurally: verse 1 ends "...thīrppa thidar"
and verse 2 opens "idarkaḷaiyā..." — the expected antāti chain (each verse's
close feeds the next verse's opening) confirms the extraction boundaries are
correct, not just a coincidence of the "last 4 lines" heuristic.
"""
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)
URL = "https://ta.wikisource.org/wiki/அற்புதத்_திருவந்தாதி/அற்புதத்_திருவந்தாதி"
TOTAL_VERSES = 101

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "chants"


def fetch(url: str) -> str:
    safe_url = urllib.parse.quote(url, safe=":/")
    req = urllib.request.Request(safe_url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8")


def extract_verses(html: str) -> dict[int, list[str]]:
    soup = BeautifulSoup(html, "lxml")
    content = soup.select_one("#mw-content-text .mw-parser-output")
    text = content.get_text("\n")
    lines = text.split("\n")

    verses: dict[int, list[str]] = {}

    # Parenthesized markers, closing paren optional: "(46)" or "(11".
    for m in re.finditer(r"\((\d{1,3})\)?", text):
        num = int(m.group(1))
        if not (1 <= num <= TOTAL_VERSES):
            continue
        pre_lines = [l.strip() for l in text[: m.start()].split("\n") if l.strip()]
        verses.setdefault(num, pre_lines[-4:])

    # Bare standalone-line markers: a line containing only digits.
    for i, line in enumerate(lines):
        stripped = line.strip()
        if re.fullmatch(r"\d{1,3}", stripped):
            num = int(stripped)
            if not (1 <= num <= TOTAL_VERSES) or num in verses:
                continue
            pre_lines = [l.strip() for l in lines[:i] if l.strip()]
            verses[num] = pre_lines[-4:]

    return verses


def main() -> None:
    verses = extract_verses(fetch(URL))
    missing = [n for n in range(1, TOTAL_VERSES + 1) if n not in verses]
    if missing:
        raise ValueError(f"Missing verses: {missing}")
    for n, lines in verses.items():
        if len(lines) != 4:
            raise ValueError(f"Verse {n} has {len(lines)} lines, expected 4: {lines}")

    sections = []
    for n in range(1, TOTAL_VERSES + 1):
        sections.append({
            "label": str(n),
            "lines": [
                {"n": i + 1, "devanagari": line, "iast": ""}
                for i, line in enumerate(verses[n])
            ],
        })

    chant = {
        "id": "arpudha-tiruvantati",
        "language": "tamil",
        "title": {"devanagari": "அற்புதத் திருவந்தாதி", "iast": "Aṟputat Tiruvantāti"},
        "source": {
            "site": "ta.wikisource.org",
            "devanagari_url": URL,
            "iast_url": URL,
        },
        "colophon": {
            "devanagari": "காரைக்காலம்மையார் அருளிச்செய்த அற்புதத் திருவந்தாதி",
            "iast": "Composed by Karaikal Ammaiyar, one of the 63 Nayanmars and, by tradition, the first poet ever to compose an antati. No English translation source found yet — Tamil script only for now.",
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
