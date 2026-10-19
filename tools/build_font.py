"""Build fonts/CommonGround.{ttf,woff} and data/glyphs.js straight from
source/LoCoSVocabulary.glyphs, without going through the Glyphs exporter.

    python3 tools/build_font.py

Needs only fontTools (pip install fonttools). The outlines in the source are
all straight-line polygons, so they convert to TrueType one-to-one; the
ligature features are compiled as written in the source, so typing a word
like "water" in any app using the font turns it into its symbol.
"""
import json
import re
from pathlib import Path

from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

import extra_glyphs

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "source" / "LoCoSVocabulary.glyphs"
FAMILY = "CommonGround"


# ---- a small reader for the OpenStep-style plist that .glyphs files use ----

TOKEN = re.compile(r'\s*(?:(?P<punct>[{}();=,])|"(?P<str>(?:[^"\\]|\\.)*)"|(?P<bare>[^\s{}();=,"]+))', re.S)


def tokenize(text):
    pos = 0
    while True:
        m = TOKEN.match(text, pos)
        if not m:
            if text[pos:].strip():
                raise ValueError(f"cannot parse near: {text[pos:pos + 40]!r}")
            return
        pos = m.end()
        if m.group("punct"):
            yield ("p", m.group("punct"))
        elif m.group("str") is not None:
            s = m.group("str")
            s = re.sub(r'\\(.)', lambda e: {"n": "\n", "t": "\t"}.get(e.group(1), e.group(1)), s)
            yield ("s", s)
        else:
            yield ("s", m.group("bare"))


def parse(text):
    tokens = list(tokenize(text))
    i = 0

    def value():
        nonlocal i
        kind, tok = tokens[i]
        i += 1
        if kind == "p" and tok == "{":
            d = {}
            while tokens[i] != ("p", "}"):
                key = tokens[i][1]
                i += 1
                assert tokens[i] == ("p", "="), tokens[i]
                i += 1
                d[key] = value()
                assert tokens[i] == ("p", ";"), tokens[i]
                i += 1
            i += 1
            return d
        if kind == "p" and tok == "(":
            arr = []
            while tokens[i] != ("p", ")"):
                arr.append(value())
                if tokens[i] == ("p", ","):
                    i += 1
            i += 1
            return arr
        return tok

    return value()


def num(v):
    f = float(v)
    return int(f) if f.is_integer() else f


# ---- build ----

def main():
    src = parse(SOURCE.read_text(encoding="utf-8"))
    master = src["fontMaster"][0]
    master_id = master["id"]
    # metric order in the master matches the font-level "metrics" list
    metric_types = [m.get("type") for m in src["metrics"]]
    metrics = {t: num(v.get("pos", 0)) for t, v in zip(metric_types, master["metricValues"])}
    ascender = metrics.get("ascender", 800)
    descender = metrics.get("descender", -200)
    upm = int(src.get("unitsPerEm", 1000))

    glyph_order = [".notdef"]
    cmap, advances, outlines = {}, {".notdef": 500}, {}
    info = []

    for g in src["glyphs"]:
        name = g["glyphname"]
        layer = next(l for l in g["layers"] if l["layerId"] == master_id)
        glyph_order.append(name)
        advances[name] = int(num(layer.get("width", 0)))
        outlines[name] = [
            [(num(n[0]), num(n[1])) for n in shape["nodes"]]
            for shape in layer.get("shapes", [])
            if "nodes" in shape
        ]
        if "unicode" in g:
            code = int(g["unicode"])
            cmap[code] = name
        info.append({"name": name, "unicode": int(g["unicode"]) if "unicode" in g else None,
                     "width": advances[name]})

    # symbols drawn in tools/extra_glyphs.py, unless the source already has them
    extra = {name: v for name, v in extra_glyphs.GLYPHS.items() if name not in outlines}
    for name, (code, draw, _) in extra.items():
        glyph_order.append(name)
        advances[name] = extra_glyphs.WIDTH
        outlines[name] = draw()
        cmap[code] = name
        info.append({"name": name, "unicode": code, "width": extra_glyphs.WIDTH})

    pen_glyphs = {}
    y_min, y_max = 0, 0
    for name in glyph_order:
        pen = TTGlyphPen(None)
        if name == ".notdef":
            for box in ([(50, 0), (50, 700), (450, 700), (450, 0)], [(100, 50), (400, 50), (400, 650), (100, 650)]):
                pen.moveTo(box[0])
                for pt in box[1:]:
                    pen.lineTo(pt)
                pen.closePath()
        else:
            for contour in outlines[name]:
                pen.moveTo(contour[0])
                for pt in contour[1:]:
                    pen.lineTo(pt)
                pen.closePath()
                ys = [p[1] for p in contour]
                y_min, y_max = min(y_min, *ys), max(y_max, *ys)
        glyph = pen.glyph()
        # the strokes overlap one another; flag that so every rasterizer fills them nonzero
        if glyph.numberOfContours > 0:
            glyph.flags[0] |= 0x40  # OVERLAP_SIMPLE
        pen_glyphs[name] = glyph

    fb = FontBuilder(upm, isTTF=True)
    fb.setupGlyphOrder(glyph_order)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(pen_glyphs)
    metrics_table = {}
    for name in glyph_order:
        metrics_table[name] = (advances[name], pen_glyphs[name].xMin if pen_glyphs[name].numberOfContours else 0)
    fb.setupHorizontalMetrics(metrics_table)
    fb.setupHorizontalHeader(ascent=ascender, descent=descender)
    fb.setupNameTable({
        "familyName": FAMILY,
        "styleName": "Regular",
        "uniqueFontIdentifier": f"{FAMILY.replace(' ', '')}-Regular-{src.get('versionMajor', 1)}.{src.get('versionMinor', 0):03}",
        "fullName": f"{FAMILY} Regular",
        "psName": FAMILY.replace(" ", "") + "-Regular",
        "version": f"Version {src.get('versionMajor', 1)}.{int(src.get('versionMinor', 0)):03d}",
    })
    fb.setupOS2(
        sTypoAscender=ascender, sTypoDescender=descender, sTypoLineGap=0,
        usWinAscent=max(ascender, y_max), usWinDescent=max(-descender, -y_min),
        sxHeight=metrics.get("x-height", 400), sCapHeight=metrics.get("cap height", 650),
        fsSelection=0x40 | 0x80,  # REGULAR | USE_TYPO_METRICS
        achVendID="NONE", version=4,
    )
    fb.setupPost()

    # features: classes + prefixes + features exactly as in the source
    fea = []
    for c in src.get("classes", []):
        fea.append(f"@{c['name']} = [{c['code']}];")
    for p in src.get("featurePrefixes", []):
        fea.append(p["code"])
    for f in src.get("features", []):
        fea.append(f"feature {f['tag']} {{\n{f['code']}\n}} {f['tag']};")
    fea_text = "\n".join(fea)
    # their typing words go at the end of the WORDS lookup, as whole words like the rest
    # longest first: the rule that keeps "you" whole would otherwise stop "your" ever matching
    rules = []
    pairs = [(word, name) for name, (_, _, typed_words) in extra.items() for word in typed_words]
    for word, name in sorted(pairs, key=lambda p: -len(p[0])):
        marked = " ".join(f"{ch}'" for ch in word)
        rules += [f"ignore sub @LET {marked};", f"ignore sub {marked} @LET;", f"sub {marked} by {name};"]
    if rules:
        fea_text = fea_text.replace("} WORDS;", "\n".join(rules) + "\n} WORDS;", 1)
    (ROOT / "tools" / "features.fea").write_text(fea_text, encoding="utf-8")
    addOpenTypeFeaturesFromString(fb.font, fea_text)

    fonts = ROOT / "fonts"
    fonts.mkdir(exist_ok=True)
    fb.save(fonts / "CommonGround.ttf")
    fb.font.flavor = "woff"
    fb.save(fonts / "CommonGround.woff")

    # which typed word becomes which glyph, read from the "sub ... by" rules
    words = {}
    for m in re.finditer(r"^sub ((?:\S+' )+)by (\S+);", fea_text, re.M):
        letters = [t.rstrip("'") for t in m.group(1).split()]
        typed = "".join({"bracketleft": "[", "bracketright": "]", "hyphen": "-"}.get(t, t) for t in letters)
        words.setdefault(m.group(2), []).append(typed)
    for item in info:
        # extra glyphs list their words in reading order ("me" before "mine")
        item["typed"] = extra[item["name"]][2] if item["name"] in extra else words.get(item["name"], [])
    # a plain script rather than JSON so the site also works opened straight from disk
    (ROOT / "data" / "glyphs.js").write_text(
        "// generated by tools/build_font.py from source/LoCoSVocabulary.glyphs, do not edit\n"
        "window.GLYPHS = " + json.dumps(info, separators=(",", ":")) + ";\n", encoding="utf-8")

    print(f"{len(glyph_order) - 1} glyphs, {sum(len(v) for v in words.values())} ligature words -> fonts/")


if __name__ == "__main__":
    main()
