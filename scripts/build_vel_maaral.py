#!/usr/bin/env python3
"""Build data/chants/vel-maaral-tamil.json.

Vel Maaral (Tamil, composed by Vallimalai Sri Sacchidananda Swamigal) isn't
ingested with ingest_chant.py's generic paragraph-pairing logic, because its
source pages (vignanam.org/tamil, vignanam.org/english) print each of the
65 numbered verses in an abbreviated form: three lines of actual verse text,
followed by an editorial marker "( ... tiru ... )" meaning "recite the full
opening refrain here." Rather than mechanically re-typing the four-line
refrain 65 times, the 16 verses that are textually unique are stored once
(VERSES) and the 65-verse recitation order (SEQUENCE, 1-indexed into
VERSES) rebuilds every section, matching vignanam.org's own numbering
exactly — including its one genuine irregularity, verses 15-16 immediately
repeating as 17-18 (present on both the Tamil and English pages, so this is
the source's own transcription, not a fetch artifact).

Each of VERSES[i]["ta"] / ["en"] is transcribed verbatim from vignanam.org.
"""
import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "chants"

# The 16 textually-unique verses, in the order they first appear (as verses
# 1-16). Each is the three-line verse body only — the trailing
# "( ... tiru ... )" refrain-marker is appended uniformly in build_chant().
VERSES = [
    {
        "ta": "பருத்தமுலை சிருத்திடை வெளுத்தனகை\nகருத்தகுழல் சிவத்திதழ் மறச்சிருமி\nவிழிக்குனிகர் ஆகும்",
        "en": "paruttamulai chiṛttiṭai veḻuttanakai\nkaṛttakuzhal chivattitazh maRachchiṛmi\nvizhikkunikar ākum",
    },
    {
        "ta": "திருத்தணியில் உதித்(து)அருளும் ஒருத்தன்மலை\nவிருத்தனென(து) உளத்திலுறை\nகருத்தன்மயில் நடத்துகுகன் வேலே",
        "en": "tiruttaṇiyil utit(tu)aruḻum oruttanmalai\nviruttanena(tu) uḻattiluRai\nkaruttanmayil naṭattukukan vēlē",
    },
    {
        "ta": "சொலற்(கு)அரிய திருப்புகழை உரைத்தவரை\nஅடுத்தபகை அருத்(து)எறிய\nஉருக்கிஎழும் அறத்தைனிலை காணும்",
        "en": "cholaR(ku)ariya tiruppukazhai uraittavarai\naṭuttapakai aṛt(tu)eRiya\nuṛkkiezhuṃ aRattainilai kāṇum",
    },
    {
        "ta": "தருக்கினமன் முருக்கவரின் எருக்குமதி\nதரித்தமுடி படைத்தவிறல் படைத்திறை\nகழற்குனிகர் ஆகும்",
        "en": "tarukkinaman murukkavarin erukkumati\ntarittamuṭi paṭaittaviRal paṭaittiRai\nkazhaRkunikar ākum",
    },
    {
        "ta": "பனைக்கைமுக படக்கரட மதத்தவள\nகஜக்கடவுள் பதத்(து)இடு(ம்)னி\nகளத்துமுளை தெறிக்கவரம் ஆகும்",
        "en": "panaikkaimuka paṭakkaraṭa matattavaḻa\nkajakkaṭavuḻ patat(tu)iṭu(m)ni\nkaḻattumuḻai teRikkavaraṃ ākum",
    },
    {
        "ta": "சினத்(து)அவுணர் எதிர்த்தரண களத்தில்வெகு\nகுறைத்தலைகள் சிரித்(து)எயிரு\nகடித்துவிழி விழித்(து)அலற மோதும்",
        "en": "chinat(tu)avuṇar etirttaraṇa kaḻattilveku\nkuRaittalaikaḻ chirit(tu)eyiṛ\nkaṭittuvizhi vizhit(tu)alaRa mōtum",
    },
    {
        "ta": "துதிக்குமடி யவர்க்(கு)ஒருவர் கெடுக்கிடர்\nநினைக்கினவர் குலத்தைமுதல் அறக்களையும்\nஎனக்(கு)ஓர் துணை ஆகும்",
        "en": "tutikkumaṭi yavark(ku)oruvar keṭukkiṭar\nninaikkinavar kulattaimutal aRakkaḻaiyum\nenak(ku)ōr tuṇai ākum",
    },
    {
        "ta": "தலத்திலுள கணத்தொகுதி களிப்பினுண\nவழைப்ப(து) என மலர்க்கமல கரத்தின்முனை\nவிதிர்க்கவளை(வு) ஆகும்",
        "en": "talattiluḻa kaṇattokuti kaḻippinuṇa\nvazhaippa(tu) ena malarkkamala karattinmunai\nvitirkkavaḻai(vu) ākum",
    },
    {
        "ta": "பழுத்தமுது தமிழ்ப்பலகை இருக்குமொரு\nகவிப்புலவன் இசைக்(கு)உருகி\nவரைக்குகையை இடித்துவழி காணும்",
        "en": "pazhuttamutu tamizhppalakai irukkumoru\nkavippulavan ichaik(ku)uruki\nvaraikkukaiyai iṭittuvazhi kāṇum",
    },
    {
        "ta": "திசைக்கிரியை முதற்குலிசன் அருத்தசிறை\nமுளைத்த(து)என முகட்டினிடை\nபறக்கற விசைத்(து) அதிர ஓடும்",
        "en": "tichaikkiriyai mutaRkulichan aṛttachiRai\nmuḻaitta(tu)ena mukaṭṭiniṭai\npaRakkaRa vichait(tu) atira ōṭum",
    },
    {
        "ta": "சுடர்ப்பரிதி ஒளிப்பனில(வு) ஒழுக்கு(ம்)மதி\nஒளிப்பலை அடக்குதழல் ஒளிப்பொளிர்\nஒளிப்பிரபை வீசும்",
        "en": "chuṭarppariti oḻippanila(vu) ozhukku(m)mati\noḻippalai aṭakkutazhal oḻippoḻir\noḻippirapai vīchum",
    },
    {
        "ta": "தனித்துவழி நடக்குமென(து) இடத்துமொரு\nவலத்துமிரு புறத்துமரு(கு)\nஅடுத்(து)இரவு பகற்றுணைய(து) ஆகும்",
        "en": "tanittuvazhi naṭakkumena(tu) iṭattumoru\nvalattumiru puRattumaru(ku)\naṭut(tu)iravu pakarruṇaiya(tu) ākum",
    },
    {
        "ta": "பசித்(து)அலகை முசித்(து)அழுது முறைப்படுதல்\nஒழித்(து)அவுணர் உரத்(து)உதிர\nநிணத்தசைகள் புசிக்கருள் நேரும்",
        "en": "pachit(tu)alakai muchit(tu)azhutu muRaippaṭutal\nozhit(tu)avuṇar urat(tu)utira\nniṇattachaikaḻ puchikkaruḻ nērum",
    },
    {
        "ta": "திரைக்கடலை உடைத்துனிறை புனற்கடிது\nகுடித்(து)உடையும் உடைப்(பு) அடைய\nஅடைத்(து)உதிரம் நிறைத்துவிளை யாடும்",
        "en": "tiraikkaṭalai uṭaittuniRai punaRkaṭitu\nkuṭit(tu)uṭaiyuṃ uṭaip(pu) aṭaiya\naṭait(tu)utiraṃ niRaittuviḻai yāṭum",
    },
    {
        "ta": "சுரர்க்கு(ம்)முனி வரர்க்கு(ம்)மக பதிக்கும்விதி\nதனக்கு(ம்)அரி தனக்கு(ம்)னரர் தமக்குமுரும்\nஇடுக்கண்வினை சாடும்",
        "en": "churarkku(m)muni vararkku(m)maka patikkumviti\ntanakku(m)ari tanakku(m)narar tamakkumuṛm\niṭukkaṇvinai chāṭum",
    },
    {
        "ta": "சலத்துவரும் அரக்கருடல் கொழுத்துவளர்\nபெருத்தகுடர் சிவத்ததொடை\nஎனச்சிகையில் விருப்பமொடு சூடும்",
        "en": "chalattuvaruṃ arakkaruṭal kozhuttuvaḻar\nperuttakuṭar chivattatoṭai\nenachchikaiyil viruppamoṭu chūṭum",
    },
]

# The 65-verse recitation order, 1-indexed into VERSES — transcribed
# directly from vignanam.org's own verse numbers 1-65 (including its
# 1௦/2௦/... Tamil-numeral spellings of 10/20/30/etc., not reproduced here
# since only the *order* is needed).
SEQUENCE = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    15, 16, 13, 14, 11, 12, 9, 10, 7, 8, 5, 6, 3, 4, 1, 2,
    4, 3, 2, 1, 8, 7, 6, 5, 12, 11, 10, 9, 16, 15, 14, 13,
    14, 13, 16, 15, 10, 9, 12, 11, 6, 5, 8, 7, 2, 1, 4, 3, 2,
]
assert len(SEQUENCE) == 65

REFRAIN_MARKER = {"ta": "( ... திரு ... )", "en": "( ... tiru ... )"}


def build() -> dict:
    sections = []

    sections.append({
        "label": "Refrain (×12)",
        "lines": [
            {"n": 1, "devanagari": "( ... இந்த அடியை முதலில் 12 முறை ஓதவும் ... )",
             "iast": "( ... inta aṭiyai mutalil 12 muRai ōtavum ... )"},
            {"n": 2, "devanagari": VERSES[1]["ta"] + ".", "iast": VERSES[1]["en"] + "."},
            {"n": 3, "devanagari": "( ... பின்வரும் ஒவ்வோரடியின் முடிவிலும் \"திரு\" என்ற இடத்தில்\nமேற்கண்ட முழு அடியையும் கூறவேண்டும் ... )",
             "iast": "( ... pinvarum ovvōraṭiyin muṭivilum \"tiru\" enRa iṭattil\nmēRkaṇṭa muzhu aṭiyaiyuṃ kūRavēṇṭum ... )"},
        ],
    })

    for verse_num, verse_idx in enumerate(SEQUENCE, start=1):
        verse = VERSES[verse_idx - 1]
        ta_lines = verse["ta"].split("\n") + [REFRAIN_MARKER["ta"]]
        en_lines = verse["en"].split("\n") + [REFRAIN_MARKER["en"]]
        sections.append({
            "label": str(verse_num),
            "lines": [
                {"n": i + 1, "devanagari": ta, "iast": en}
                for i, (ta, en) in enumerate(zip(ta_lines, en_lines))
            ],
        })

    sections.append({
        "label": "Refrain (×12), reprise",
        "lines": [
            {"n": 1, "devanagari": "( ... முடிவிலும் இந்த அடியை 12 முறை ஓதவும் ... )",
             "iast": "( ... muṭiviluṃ inta aṭiyai 12 muRai ōtavum ... )"},
        ],
    })

    sections.append({
        "label": "Closing I",
        "lines": [
            {"n": 1,
             "devanagari": "தேரணி யிட்டுப் புரம் எரித் தான்மகன் செங்கையில்வேற்\nகூரணி யிட்டணு வாகிக் கிரௌஞ்சங் குலைந்தரக்கர்\nநேரணி யிட்டு வளைந்த கடகம் நெளிந்து சூர்ப்\nபேரணி கெட்டது தேவேந்த்ர லோகம் பிழைத்ததுவே.",
             "iast": "tēraṇi yiṭṭup puram erit tānmakan cheṅkaiyilvēR\nkūraṇi yiṭṭaṇu vākik kirauñchaṅ kulaintarakkar\nnēraṇi yiṭṭu vaḻainta kaṭakaṃ neḻintu chūrp\npēraṇi keṭṭatu tēvēntra lōkaṃ pizhaittatuvē."},
        ],
    })

    sections.append({
        "label": "Closing II",
        "lines": [
            {"n": 1,
             "devanagari": "வீரவேல் தாரைவேல் விண்ணோர் சிறை மீட்ட\nதீரவேல் செவ்வேள் திருக்கைவேல் - வாரி\nகுளித்தவேல் கொற்றவேல் சூர்மார்பும் குன்ரும்\nதொளைத்தவேல் உண்டே துணை.",
             "iast": "vīravēl tāraivēl viṇṇōr chiRai mīṭṭa\ntīravēl chevvēḻ tirukkaivēl - vāri\nkuḻittavēl korravēl chūrmārpuṃ kunṛm\ntoḻaittavēl uṇṭē tuṇai."},
            {"n": 2,
             "devanagari": "... ... ... வேலும் மயிலும் துணை ... ... ...",
             "iast": "... ... ... vēluṃ mayiluṃ tuṇai ... ... ..."},
        ],
    })

    return {
        "id": "vel-maaral-tamil",
        "language": "tamil",
        "title": {"devanagari": "வேல் மாறல்", "iast": "Vēl Māṟal"},
        "source": {
            "site": "vignanam.org",
            "devanagari_url": "https://vignanam.org/tamil/vel-maaral-tamil.html",
            "iast_url": "https://vignanam.org/english/vel-maaral-tamil.html",
        },
        "colophon": {
            "devanagari": "வள்ளிமலை ஸ்ரீ சச்சிதானந்த சுவாமிகள் தொகுத்தருளிய 'வேல் மாறல்'\n... வேலும் மயிலும் துணை ...",
            "iast": "vaḻḻimalai srī chachchitānanta chuvāmikaḻ tokuttaruḻiya 'vēl māRal'\n... vēluṃ mayiluṃ tuṇai ...",
        },
        "sectionUnit": "Verse",
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
