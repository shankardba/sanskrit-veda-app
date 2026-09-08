#!/usr/bin/env python3
"""Ingest a chant from vignanam.org: pairs the Devanagari and IAST-transliteration
pages line-by-line (by DOM position) and writes a single cached JSON file.

Usage:
    python3 ingest_chant.py <chant-id> <devanagari-url> <iast-url> <title-devanagari> <title-iast>

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
VERSE_MARKER_RE = re.compile(r"॥\s*(\d+)\s*॥\s*$")

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
                lines.append("".join(current).strip())
                current = []
            else:
                current.append(node.get_text() if hasattr(node, "get_text") else str(node))
        lines.append("".join(current).strip())
        lines = [ln for ln in lines if ln]
        if lines:
            paragraphs.append(lines)
    return paragraphs


def flatten(paragraphs: list[list[str]]) -> list[str]:
    return [line for para in paragraphs for line in para]


def build_chant(chant_id: str, deva_url: str, iast_url: str, title_deva: str, title_iast: str) -> dict:
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

    # First paragraph is the colophon (text lineage), not chant content.
    colophon_deva = deva_paragraphs[0]
    colophon_iast = iast_paragraphs[0]
    colophon = {
        "devanagari": " / ".join(colophon_deva),
        "iast": " / ".join(colophon_iast),
    }

    body_deva = flatten(deva_paragraphs[1:])
    body_iast = flatten(iast_paragraphs[1:])

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
        "sections": [
            {"label": label, "lines": lines} for label, lines in sections.items()
        ],
    }


def main() -> None:
    if len(sys.argv) != 6:
        print(__doc__)
        sys.exit(1)

    chant_id, deva_url, iast_url, title_deva, title_iast = sys.argv[1:6]
    chant = build_chant(chant_id, deva_url, iast_url, title_deva, title_iast)

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    out_path = DATA_DIR / f"{chant_id}.json"
    out_path.write_text(json.dumps(chant, ensure_ascii=False, indent=2), encoding="utf-8")

    total_lines = sum(len(s["lines"]) for s in chant["sections"])
    print(f"Wrote {out_path} — {len(chant['sections'])} sections, {total_lines} lines")


if __name__ == "__main__":
    main()
