#!/usr/bin/env python3
"""Devanagari -> IAST in this site's house style (vignanam.org's conventions,
which every scraped chant already follows): च=ch, छ=Ch, ए/ओ always ē/ō,
anusvāra=ṃ, ळ=ḻ, avagraha=', Devanagari digits -> ASCII, Vedic svara marks
kept as combining accents (॑ -> U+030D, ॒ -> U+0320).

Used for chants that have no paired IAST source page to scrape (e.g. the
Raksha Stotrams/Kavachams, sourced from sanskritdocuments.org Devanagari).

Usage as a module: from deva_to_iast import deva_to_iast
Usage as a script: python3 deva_to_iast.py "देवनागरी पाठः"
"""
import sys

CONSONANTS = {
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ṅ',
    'च': 'ch', 'छ': 'Ch', 'ज': 'j', 'झ': 'jh', 'ञ': 'ñ',
    'ट': 'ṭ', 'ठ': 'ṭh', 'ड': 'ḍ', 'ढ': 'ḍh', 'ण': 'ṇ',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'ळ': 'ḻ',
    'श': 'ś', 'ष': 'ṣ', 'स': 's', 'ह': 'h',
}
VOWELS = {
    'अ': 'a', 'आ': 'ā', 'इ': 'i', 'ई': 'ī', 'उ': 'u', 'ऊ': 'ū',
    'ऋ': 'ṛ', 'ॠ': 'ṝ', 'ऌ': 'ḷ', 'ए': 'ē', 'ऐ': 'ai', 'ओ': 'ō', 'औ': 'au',
}
MATRAS = {
    'ा': 'ā', 'ि': 'i', 'ी': 'ī', 'ु': 'u', 'ू': 'ū', 'ृ': 'ṛ', 'ॄ': 'ṝ',
    'ॢ': 'ḷ', 'े': 'ē', 'ै': 'ai', 'ो': 'ō', 'ौ': 'au',
}
OTHER = {
    'ं': 'ṃ', 'ः': 'ḥ', 'ँ': 'm̐', 'ऽ': "'", 'ॐ': 'ōṃ',
    '॑': '̍', '॒': '̠', '᳚': '̎', '᳝': '̱',
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
}
VIRAMA = '्'
NUKTA = '़'
ACCENTS = {'॑', '॒', '᳚', '᳝'}
# sanskritdocuments.org puts a ZWJ inside श‍ृ purely as a font-rendering
# hint; it carries no sound, so it's dropped rather than copied into IAST.
ZERO_WIDTH = {'‍', '‌'}


def deva_to_iast(text: str) -> str:
    out = []
    i = 0
    n = len(text)
    while i < n:
        ch = text[i]
        if ch in CONSONANTS:
            out.append(CONSONANTS[ch])
            j = i + 1
            while j < n and (text[j] == NUKTA or text[j] in ZERO_WIDTH):
                j += 1
            # Vedic accents sit on the syllable's vowel, so skip past any
            # that precede the matra/virama and re-emit them after it.
            accents = []
            while j < n and text[j] in ACCENTS:
                accents.append(OTHER[text[j]])
                j += 1
            if j < n and text[j] == VIRAMA:
                j += 1
            elif j < n and text[j] in MATRAS:
                out.append(MATRAS[text[j]])
                j += 1
            else:
                out.append('a')
            out.extend(accents)
            i = j
        elif ch in VOWELS:
            out.append(VOWELS[ch])
            i += 1
        elif ch in OTHER:
            out.append(OTHER[ch])
            i += 1
        elif ch in ZERO_WIDTH:
            i += 1
        else:
            out.append(ch)
            i += 1
    return ''.join(out)


if __name__ == '__main__':
    print(deva_to_iast(' '.join(sys.argv[1:])))
