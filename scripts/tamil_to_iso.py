#!/usr/bin/env python3
"""Tamil script -> ISO 15919 romanization, matching the scholarly spelling
this site's Tamil chant titles already use (Aṟputat Tiruvantāti, Iraṇṭām,
Kaṇṇinuṇ Ciṟuttāmpu): ற=ṟ, ன=ṉ, ழ=ḻ, ள=ḷ, ச=c, short e/o vs long ē/ō, and
no voicing of stops (க is always k, ப always p). Grantha letters get their
Sanskrit values (ஜ=j, ஷ=ṣ, ஸ=s, ஹ=h, ஶ=ś).

Used for Tamil chants with no scraped romanization (the antātis sourced
from Project Madurai). Usage: from tamil_to_iso import tamil_to_iso
"""
import sys

CONSONANTS = {
    'க': 'k', 'ங': 'ṅ', 'ச': 'c', 'ஞ': 'ñ', 'ட': 'ṭ', 'ண': 'ṇ',
    'த': 't', 'ந': 'n', 'ப': 'p', 'ம': 'm', 'ய': 'y', 'ர': 'r',
    'ல': 'l', 'வ': 'v', 'ழ': 'ḻ', 'ள': 'ḷ', 'ற': 'ṟ', 'ன': 'ṉ',
    'ஜ': 'j', 'ஷ': 'ṣ', 'ஸ': 's', 'ஹ': 'h', 'ஶ': 'ś',
}
VOWELS = {
    'அ': 'a', 'ஆ': 'ā', 'இ': 'i', 'ஈ': 'ī', 'உ': 'u', 'ஊ': 'ū',
    'எ': 'e', 'ஏ': 'ē', 'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'ō', 'ஔ': 'au',
}
SIGNS = {
    'ா': 'ā', 'ி': 'i', 'ீ': 'ī', 'ு': 'u', 'ூ': 'ū',
    'ெ': 'e', 'ே': 'ē', 'ை': 'ai', 'ொ': 'o', 'ோ': 'ō', 'ௌ': 'au',
}
PULLI = '்'
OTHER = {'ஃ': 'ḵ', 'ௐ': 'ōm'}
ZERO_WIDTH = {'‌', '‍'}


def tamil_to_iso(text: str) -> str:
    # ஸ்ரீ is the conventional Tamil spelling of Sanskrit śrī.
    text = text.replace('ஸ்ரீ', '\u0001')
    out = []
    i, n = 0, len(text)
    while i < n:
        ch = text[i]
        if ch in CONSONANTS:
            out.append(CONSONANTS[ch])
            j = i + 1
            while j < n and text[j] in ZERO_WIDTH:
                j += 1
            if j < n and text[j] == PULLI:
                j += 1
            elif j < n and text[j] in SIGNS:
                out.append(SIGNS[text[j]])
                j += 1
            else:
                out.append('a')
            i = j
        elif ch in VOWELS:
            out.append(VOWELS[ch])
            i += 1
        elif ch in OTHER:
            out.append(OTHER[ch])
            i += 1
        elif ch in ZERO_WIDTH:
            i += 1
        elif ch == '\u0001':
            out.append('śrī')
            i += 1
        else:
            out.append(ch)
            i += 1
    return ''.join(out)


if __name__ == '__main__':
    print(tamil_to_iso(' '.join(sys.argv[1:])))
