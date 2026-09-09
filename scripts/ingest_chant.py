#!/usr/bin/env python3
"""Ingest a chant from vignanam.org: pairs the Devanagari and IAST-transliteration
pages line-by-line (by DOM position) and writes a single cached JSON file.

Usage:
    python3 ingest_chant.py <chant-id> <devanagari-url> <iast-url> <title-devanagari> <title-iast> [section-unit]

section-unit labels each chant.sections[] block in the UI (default "Anuvāka";
pass e.g. "Verse" for a stotram numbered by individual verses rather than
grouped sections).

Relies on the two source pages sharing identical <p>/<br> structure, which is
true for vignanam.org's per-language renderings of the same stotram.
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)
VERSE_MARKER_RE = re.compile(r"॥\s*(\d+)\s*॥")
# Vedic svara (pitch-accent) marks: udatta, anudatta, and the two dependent
# svarita variants. A paragraph carrying none of these and no verse-ending
# danda is front-matter (title/lineage), not chant content. Not every source
# text carries these marks at all (later devotional stotras vs. Vedic
# mantras) — a chant without any accents simply never matches here, which is
# fine since DANDA_RE alone still identifies real verse content.
ACCENT_RE = re.compile("[॒᳝॑᳚]")
DANDA_RE = re.compile("[।॥]")
# Editorial alternate-reading annotations vignanam.org appends inline after
# some words/verses, e.g. "...शरणकोणाः परिणताः ॥ 11 ॥ [चरणकोणाः, भवनकिणाः]" —
# not part of the chant text itself, so stripped rather than ingested.
BRACKET_ANNOTATION_RE = re.compile(r"\s*\[[^\]]*\]")

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "chants"


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8")


def extract_paragraphs(html: str) -> list[list[str]]:
    """Return a list of paragraphs, each a list of line strings (split on <br>)."""
    soup = BeautifulSoup(html, "lxml")
    content = soup.select_one("#stext span[style*='font-family']")
    if content is None:
        raise ValueError("Could not find the stotram text span inside #stext")

    paragraphs = []
    for p in content.find_all("p", class_=lambda c: c != "relatedCategories"):
        # Split this <p>'s contents on <br> tags, preserving text order.
        lines: list[str] = []
        current: list[str] = []
        for node in p.children:
            if getattr(node, "name", None) == "br":
                lines.append(BRACKET_ANNOTATION_RE.sub("", "".join(current)).strip())
                current = []
            else:
                current.append(node.get_text() if hasattr(node, "get_text") else str(node))
        lines.append(BRACKET_ANNOTATION_RE.sub("", "".join(current)).strip())
        lines = [ln for ln in lines if ln]
        if lines:
            paragraphs.append(lines)
    return paragraphs


def flatten(paragraphs: list[list[str]]) -> list[str]:
    return [line for para in paragraphs for line in para]


def build_chant(
    chant_id: str,
    deva_url: str,
    iast_url: str,
    title_deva: str,
    title_iast: str,
    section_unit: str = "Anuvāka",
) -> dict:
    deva_html = fetch(deva_url)
    iast_html = fetch(iast_url)

    deva_paragraphs = extract_paragraphs(deva_html)
    iast_paragraphs = extract_paragraphs(iast_html)

    if len(deva_paragraphs) != len(iast_paragraphs):
        raise ValueError(
            f"Paragraph count mismatch: devanagari={len(deva_paragraphs)} "
            f"iast={len(iast_paragraphs)} — pages are not structurally aligned"
        )

    deva_lines = flatten(deva_paragraphs)
    iast_lines = flatten(iast_paragraphs)
    if len(deva_lines) != len(iast_lines):
        raise ValueError(
            f"Line count mismatch: devanagari={len(deva_lines)} iast={len(iast_lines)}"
        )

    # Some chants open with a plain title/lineage paragraph (no accents, no
    # danda) before the numbered content; others start straight into anuvaka
    # 1. Detect which by content, not position.
    first_para_is_colophon = not any(
        ACCENT_RE.search(line) or DANDA_RE.search(line) for line in deva_paragraphs[0]
    )
    if first_para_is_colophon:
        colophon = {
            "devanagari": " / ".join(deva_paragraphs[0]),
            "iast": " / ".join(iast_paragraphs[0]),
        }
        body_deva = flatten(deva_paragraphs[1:])
        body_iast = flatten(iast_paragraphs[1:])
    else:
        colophon = None
        body_deva = flatten(deva_paragraphs)
        body_iast = flatten(iast_paragraphs)

    sections: dict[str, list[dict]] = {}
    current_section = "1"
    n = 0
    for deva_line, iast_line in zip(body_deva, body_iast):
        n += 1
        sections.setdefault(current_section, []).append(
            {"n": n, "devanagari": deva_line, "iast": iast_line}
        )
        m = VERSE_MARKER_RE.search(deva_line)
        if m:
            current_section = str(int(m.group(1)) + 1)

    return {
        "id": chant_id,
        "title": {"devanagari": title_deva, "iast": title_iast},
        "source": {
            "site": "vignanam.org",
            "devanagari_url": deva_url,
            "iast_url": iast_url,
        },
        "colophon": colophon,
        "sectionUnit": section_unit,
        "sections": [
            {"label": label, "lines": lines} for label, lines in sections.items()
        ],
    }


def main() -> None:
    if len(sys.argv) not in (6, 7):
        print(__doc__)
        sys.exit(1)

    chant_id, deva_url, iast_url, title_deva, title_iast = sys.argv[1:6]
    section_unit = sys.argv[6] if len(sys.argv) == 7 else "Anuvāka"
    chant = build_chant(chant_id, deva_url, iast_url, title_deva, title_iast, section_unit)

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    out_path = DATA_DIR / f"{chant_id}.json"
    out_path.write_text(json.dumps(chant, ensure_ascii=False, indent=2), encoding="utf-8")

    total_lines = sum(len(s["lines"]) for s in chant["sections"])
    print(f"Wrote {out_path} — {len(chant['sections'])} sections, {total_lines} lines")


if __name__ == "__main__":
    main()
