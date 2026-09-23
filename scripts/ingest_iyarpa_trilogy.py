#!/usr/bin/env python3
"""Build data/chants/{mudhal,irandam,munram}-tiruvantati.json.

Source: divyaprabandham.koyil.org's 2017-18 per-pasuram English series (one
WordPress post per verse, e.g. "mudhal-thiruvandhadhi-42"). Romanized verse
text + commentary only, no Tamil-script companion found for these three
(unlike Kanninun Cirutampu's later "simple explanation" series, which never
got written for this trilogy) — ingested English-only per the user's call,
mirroring (in reverse) the choice already made for Arpudha Tiruvantati.

Each work's 100 posts are miscategorized inconsistently on the site (a
category-listing fetch alone misses several), so this resolves each verse's
URL individually via the WordPress REST API's ?slug= filter rather than
trusting category membership.

Verse extraction: on each post, the verse is the <p> immediately preceding
the "Word by Word Meaning" heading <p> — consistent across the whole series
regardless of how the surrounding nav links/commentary vary post to post.
"""
import json
import re
import time
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)
API_BASE = "https://divyaprabandham.koyil.org/wp-json/wp/v2/posts"
DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "chants"

WORKS = [
    {
        "id": "mudhal-tiruvantati",
        "slug_prefix": "mudhal-thiruvandhadhi",
        "title": "mudhal thiruvandhAdhi",
        "author": "Poigai Alvar",
    },
    {
        "id": "irandam-tiruvantati",
        "slug_prefix": "irandam-thiruvandhadhi",
        "title": "iraNdAm thiruvandhAdhi",
        "author": "Bhoothath Alvar",
    },
    {
        "id": "munram-tiruvantati",
        "slug_prefix": "munram-thiruvandhadhi",
        "title": "mUnRAm thiruvandhAdhi",
        "author": "Peyalvar",
    },
]
TOTAL_VERSES = 100

# A handful of posts across the series use a descriptive slug suffix
# instead of the plain "<work>-thiruvandhadhi-N" pattern every other post
# follows (found by following each page's "<< Previous" link to the actual
# URL) — {slug_prefix: {verse_number: full_slug}}.
SLUG_OVERRIDES = {
    "irandam-thiruvandhadhi": {45: "irandam-thiruvandhadhi-45-uladhenru-irumavar"},
    "munram-thiruvandhadhi": {
        41: "munram-thiruvandhadhi-41-mannu-mudi-nindu",
        84: "munram-thiruvandhadhi-84-ulanaya-nanmaraiyin",
    },
}


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read()


def resolve_url(slug: str) -> str:
    data = json.loads(fetch(f"{API_BASE}?slug={slug}&_fields=link").decode("utf-8"))
    if not data:
        raise ValueError(f"No post found for slug {slug!r}")
    return data[0]["link"]


def extract_verse(html: str) -> str:
    soup = BeautifulSoup(html, "lxml")
    article = soup.select_one("article")
    content = article.select_one(".entry-content") or article
    paras = content.find_all(["p", "h1", "h2", "h3", "h4"], recursive=False)
    for i, p in enumerate(paras):
        # Wording varies across the series: "Word by Word Meaning(s)",
        # "Word for Word Meanings", even "Word by Word Meanimg" (a typo on
        # the source site itself) — matching on "word" alone in a short
        # heading-like fragment catches all variants without being so loose
        # it matches something else (no other paragraph this short contains
        # "word" on any page checked).
        text = p.get_text().strip().lower()
        if len(text) < 40 and "word" in text:
            verse_p = paras[i - 1]
            return verse_p.get_text("\n").strip()
    raise ValueError("Could not find a 'word...meaning' marker")


def build_work(work: dict) -> dict:
    sections = []
    failures = []
    for n in range(1, TOTAL_VERSES + 1):
        slug = SLUG_OVERRIDES.get(work["slug_prefix"], {}).get(n, f"{work['slug_prefix']}-{n}")
        try:
            url = resolve_url(slug)
            verse = extract_verse(fetch(url).decode("utf-8"))
            lines = [l.strip() for l in verse.split("\n") if l.strip()]
            if not lines:
                raise ValueError("empty verse text")
        except Exception as e:  # noqa: BLE001 - collect and report at the end
            print(f"  {work['id']} {n}/{TOTAL_VERSES}: FAILED ({e})")
            failures.append(n)
            lines = []
        else:
            print(f"  {work['id']} {n}/{TOTAL_VERSES}: {len(lines)} lines")
        sections.append({
            "label": str(n),
            "lines": [{"n": i + 1, "devanagari": "", "iast": line} for i, line in enumerate(lines)],
        })
        time.sleep(0.2)

    if failures:
        print(f"  {work['id']}: FAILED verses (need manual fix): {failures}")

    return {
        "id": work["id"],
        "language": "tamil",
        "title": {"devanagari": work["title"], "iast": ""},
        "source": {
            "site": "divyaprabandham.koyil.org",
            "devanagari_url": f"https://divyaprabandham.koyil.org/index.php/category/iyarpa/{work['slug_prefix']}/",
            "iast_url": f"https://divyaprabandham.koyil.org/index.php/category/iyarpa/{work['slug_prefix']}/",
        },
        "colophon": {
            "devanagari": "",
            "iast": f"Composed by {work['author']}, one of the three Mudhalazhwars (\"first Alvars\") whose Tiruvantatis open the Iyaṟpā section of the Naalayira Divya Prabandham. No Tamil-script source found yet — English romanization only for now.",
        },
        "sectionUnit": "",
        "sections": sections,
    }


def main() -> None:
    for work in WORKS:
        print(f"=== {work['id']} ===")
        chant = build_work(work)
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        out_path = DATA_DIR / f"{chant['id']}.json"
        out_path.write_text(json.dumps(chant, ensure_ascii=False, indent=2), encoding="utf-8")
        total_lines = sum(len(s["lines"]) for s in chant["sections"])
        print(f"Wrote {out_path} — {len(chant['sections'])} sections, {total_lines} lines")


if __name__ == "__main__":
    main()
