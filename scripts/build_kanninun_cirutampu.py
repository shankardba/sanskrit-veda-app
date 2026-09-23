#!/usr/bin/env python3
"""Build data/chants/kanninun-cirutampu.json.

Source: divyaprabandham.koyil.org's Tamil and English "simple explanation"
pages for kaNNinuN chiRuth thAmbu (Madhurakavi Alvar's 11-pasuram tribute to
his guru Nammalvar) —
  https://divyaprabandham.koyil.org/index.php/2020/03/kanninun-chiruth-thambu-tamil-simple/
  https://divyaprabandham.koyil.org/index.php/2020/04/kanninun-chiruth-thambu-simple/

Not scraped programmatically: unlike vignanam.org/aanmeegam.org, this site
interleaves each pasuram with prose commentary in the same flow of <p> tags
(no consistent per-verse element to select), so the 11 pasurams below were
copied by hand from both pages, matched by their "First pAsuram." /
"Second pAsuram." ... markers.

Romanization note: koyil.org's own house style is mixed-case ASCII (capital
letters marking retroflex/long sounds, e.g. "kaNNi" = kaṇṇi, "AzhwAr" =
āḻvār) rather than the diacritic IAST-style transliteration vignanam.org and
aanmeegam.org use elsewhere on this site (see Vel Maaral, Abirami Antati).
Kept as the source gives it rather than hand-converted, so the "iast" field
name here is a slight misnomer for this one chant — consistent with the
site's established policy of not renaming shared JSON keys per-chant (see
js/app.js's chant-lang-tamil comment).
"""
import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "chants"

VERSES = [
    {
        "ta": "கண்ணி நுண் சிறுத்தாம்பினால் கட்டுண்ணப்\nபண்ணிய பெரு மாயன் என் அப்பனில்\nநண்ணித் தென் குருகூர் நம்பி என்றக்கால்\nஅண்ணிக்கும் அமுது ஊறும் என் நாவுக்கே",
        "en": "kaNNi nuN chiRuththAmbinAl kattuNNap\npaNNiya peru mAyan en appanil\nnaNNith then kurugUr nambi enRakkAl\naNNikkum amudhURum en nAvukkE",
    },
    {
        "ta": "நாவினால் நவிற்று இன்பம் எய்தினேன்\nமேவினேன் அவன் பொன்னடி மெய்ம்மையே\nதேவு மற்று அறியேன் குருகூர் நம்பி\nபாவின் இன்னிசை பாடித் திரிவனே",
        "en": "nAvinAl naviRRu inbam eydhinEn\nmEvinEn avan ponnadi meymmaiyE\ndhEvu maRRu aRiyEn kurugUr nambi\npAvin innisai pAdith thirivanE",
    },
    {
        "ta": "திரிதந்து ஆகிலும் தேவபிரான் உடைக்\nகரிய கோலத் திருவுருக் காண்பன் நான்\nபெரிய வண் குருகூர் நகர் நம்பிக்கு ஆள்\nஉரியனாய் அடியேன் பெற்ற நன்மையே",
        "en": "thiri thandhAgilum dhEvapirAn udai\nkariya kOlath thiru uruk kANban nAn\nperiya vaN kurugUr nagar nambikku AL\nuriyanAy adiyEn peRRa nanmaiyE",
    },
    {
        "ta": "நன்மையால் மிக்க நான்மறையாளர்கள்\nபுன்மை ஆகக் கருதுவர் ஆதலில்\nஅன்னையாய் அத்தனாய் என்னை ஆண்டிடும்\nதன்மையான் சடகோபன் என் நம்பியே",
        "en": "nanmaiyAl mikka nAnmaRaiyALargaL\npunmai Agak karudhuvar Adhalil\nannaiyAy aththanAy ennai ANdidum\nthanmaiyAn sadagOpan en nambiyE",
    },
    {
        "ta": "நம்பினேன் பிறர் நன்பொருள் தன்னையும்\nநம்பினேன் மடவாரையும் முன்னெலாம்\nசெம்பொன் மாடத் திருக் குருகூர் நம்பிக்கு\nஅன்பனாய் அடியேன் சதிர்த்தேன் இன்றே",
        "en": "nambinEn piRar nanporuL thannaiyum\nnambinEn madavAraiyum munnelAm\nsem pon mAdath thukkurugUr nambikku\nanbanAy adiyEn sadhirththEn inRE",
    },
    {
        "ta": "இன்று தொட்டும் எழுமையும் எம்பிரான்\nநின்று தன் புகழ் ஏத்த அருளினான்\nகுன்ற மாடத் திருக் குருகூர் நம்பி\nஎன்றும் என்னை இகழ்வு இலன் காண்மினே",
        "en": "inRu thottum ezhumaiyum empirAn\nninRu than pugazh Eththa aruLinAn\nkunRa mAdath thirukkurugUr nambi\nenRum ennai igazhvu ilan kANminE",
    },
    {
        "ta": "கண்டு கொண்டு என்னைக் காரிமாறப் பிரான்\nபண்டை வல் வினை பாற்றி அருளினான்\nஎண் திசையும் அறிய இயம்புகேன்\nஒண் தமிழ்ச் சடகோபன் அருளையே",
        "en": "kaNdu koNdu ennaik kArimARap pirAn\npaNdai valvinai pARRi aruLinAn\neN thisaiyum aRiya iyambugEn\noN thamizh sadagOpan aruLaiyE",
    },
    {
        "ta": "அருள் கொண்டாடும் அடியவர் இன்புற\nஅருளினான் அவ்வருமறையின் பொருள்\nஅருள்கொண்டு ஆயிரம் இன் தமிழ் பாடினான்\nஅருள் கண்டீர் இவ் உலகினில் மிக்கதே",
        "en": "aruL koNdAdum adiyavar inbuRa\naruLinAn avvarumaRaiyin poruL\naruL koNdu Ayiram in thamizh pAdinAn\naruL kaNdIr iv vulaginil mikkadhE",
    },
    {
        "ta": "மிக்க வேதியர் வேதத்தின் உட்பொருள்\nநிற்கப் பாடி என் நெஞ்சுள் நிறுத்தினான்\nதக்க சீர்ச் சடகோபன் என் நம்பிக்கு ஆட்\nபுக்க காதல் அடிமைப் பயன் அன்றே",
        "en": "mikka vEdhiyar vEdhaththin utporuL\nniRkap pAdi en nenjuL niRuththinAn\nthakka sIrch chatakOpan en nambikku At\npukka kAdhal adimaip payan anRE",
    },
    {
        "ta": "பயன் அன்று ஆகிலும் பாங்கு அல்லர் ஆகிலும்\nசெயல் நன்றாகத் திருத்திப் பணி கொள்வான்\nகுயில் நின்று ஆர் பொழில் சூழ் குருகூர் நம்பி\nமுயல்கின்றேன் உன்தன் மொய் கழற்கு அன்பையே",
        "en": "payan anRu Agilum pAngu allar Agilum\nseyal nanRAgath thiruththip paNi koLvAn\nkuyil ninRu Ar pozhil sUzh kurugUr nambi\nmuyalginREn un than moy kazhaRku anbaiyE",
    },
    {
        "ta": "அன்பன் தன்னை அடைந்தவர்கட்கு எல்லாம்\nஅன்பன் தென் குருகூர் நகர் நம்பிக்கு\nஅன்பனாய் மதுரகவி சொன்ன சொல்\nநம்புவார் பதி வைகுந்தம் காண்மினே",
        "en": "anban thannai adaindhavargatku ellAm\nanban then kurugUr nagar nambikku\nanbanAy madhurakavi sonna sol\nnambuvAr padhi vaikundham kANminE",
    },
]


def build() -> dict:
    sections = []
    for n, verse in enumerate(VERSES, start=1):
        ta_lines = verse["ta"].split("\n")
        en_lines = verse["en"].split("\n")
        sections.append({
            "label": str(n),
            "lines": [
                {"n": i + 1, "devanagari": ta, "iast": en}
                for i, (ta, en) in enumerate(zip(ta_lines, en_lines))
            ],
        })

    return {
        "id": "kanninun-cirutampu",
        "language": "tamil",
        "title": {"devanagari": "கண்ணிநுண் சிறுத்தாம்பு", "iast": "kaNNinuN chiRuththAmbu"},
        "source": {
            "site": "divyaprabandham.koyil.org",
            "devanagari_url": "https://divyaprabandham.koyil.org/index.php/2020/03/kanninun-chiruth-thambu-tamil-simple/",
            "iast_url": "https://divyaprabandham.koyil.org/index.php/2020/04/kanninun-chiruth-thambu-simple/",
        },
        "colophon": {
            "devanagari": "மதுரகவி ஆழ்வார் அருளிச்செய்த கண்ணிநுண் சிறுத்தாம்பு",
            "iast": "Composed by Madhurakavi Alvar in devotion to his guru Nammalvar. Famously, when the Naalayira Divya Prabandham had been lost, the scholar Nathamuni recited these eleven verses 12,000 times to recover it.",
        },
        "sectionUnit": "",
        "sections": sections,
    }


def main() -> None:
    chant = build()
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    out_path = DATA_DIR / f"{chant['id']}.json"
    out_path.write_text(json.dumps(chant, ensure_ascii=False, indent=2), encoding="utf-8")
    total_lines = sum(len(s["lines"]) for s in chant["sections"])
    print(f"Wrote {out_path} — {len(chant['sections'])} sections, {total_lines} lines")


if __name__ == "__main__":
    main()
