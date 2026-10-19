"""Symbols drawn in code rather than in the .glyphs source: the pronouns.

Each one is the "person" arch with a sign inside. They're drawn as strokes
(lines, rings and dots) and turned into outlines in the same weight as the
rest of the font. tools/build_font.py adds them to the font and gives them
their typing words; if a glyph with the same name is ever drawn in the
.glyphs source, that one is used instead.
"""
import math

STROKE = 38          # stroke width of the font
R = STROKE / 2

# the arch every pronoun sits in: legs, rounded shoulders, flat top
LEFT, RIGHT, BASE, TOP, CORNER = 290, 710, 100, 520, 130


def capsule(p, q, steps=8):
    """A straight stroke from p to q with round ends, as one clockwise contour."""
    (x1, y1), (x2, y2) = p, q
    a = math.atan2(y2 - y1, x2 - x1)
    pts = []
    # round end at q, then at p; clockwise in a y-up space
    for i in range(steps + 1):
        t = a + math.pi / 2 - math.pi * i / steps
        pts.append((x2 + R * math.cos(t), y2 + R * math.sin(t)))
    for i in range(steps + 1):
        t = a - math.pi / 2 - math.pi * i / steps
        pts.append((x1 + R * math.cos(t), y1 + R * math.sin(t)))
    return [(round(x), round(y)) for x, y in pts]


def polyline(points):
    return [capsule(points[i], points[i + 1]) for i in range(len(points) - 1)]


def arc(cx, cy, r, start, end, steps):
    return [(cx + r * math.cos(math.radians(start + (end - start) * i / steps)),
             cy + r * math.sin(math.radians(start + (end - start) * i / steps)))
            for i in range(steps + 1)]


def ring(cx, cy, r, steps=40):
    return polyline(arc(cx, cy, r, 0, 360, steps))


def dot(cx, cy, r, steps=24):
    # clockwise, like the strokes
    return [(round(cx + r * math.cos(-2 * math.pi * i / steps)),
             round(cy + r * math.sin(-2 * math.pi * i / steps))) for i in range(steps)]


def arch():
    pts = [(LEFT, BASE)]
    pts += arc(LEFT + CORNER, TOP - CORNER, CORNER, 180, 90, 10)
    pts += arc(RIGHT - CORNER, TOP - CORNER, CORNER, 90, 0, 10)
    pts.append((RIGHT, BASE))
    return polyline(pts)


def me():
    # a chevron pointing down at a dot over a line: "this one, here"
    return arch() + polyline([(430, 445), (500, 380), (570, 445)]) \
        + [dot(500, 250, 42)] + polyline([(380, 110), (620, 110)])


def you():
    # an arrow pointing out: "the one I'm facing"
    return arch() + polyline([(350, 340), (650, 340)]) \
        + polyline([(575, 415), (650, 340), (575, 265)])


def she():
    return arch() + ring(500, 340, 80) + polyline([(500, 260), (500, 100)]) \
        + polyline([(430, 165), (570, 165)])


def he():
    cx, cy, r = 445, 215, 90
    # the arrow leaves the ring at 45°
    edge = (cx + r * math.cos(math.pi / 4), cy + r * math.sin(math.pi / 4))
    tip = (610, 380)
    return arch() + ring(cx, cy, r) + polyline([edge, tip]) \
        + polyline([(520, 380), tip, (610, 300)])


def us():
    # three people together
    return arch() + [dot(500, 320, 30), dot(435, 205, 30), dot(565, 205, 30)]


# name: (codepoint, drawing, the words that type it; the first is the one shown)
GLYPHS = {
    "s.me": (0xE13E, me, ["me", "i"]),
    "s.you": (0xE13F, you, ["you"]),
    "s.she": (0xE140, she, ["she", "her"]),
    "s.he": (0xE141, he, ["he", "him"]),
    "s.us": (0xE142, us, ["us", "we", "they", "them"]),
}
WIDTH = 1000
