# Common Ground

A website for the **CommonGround** symbol font: a dictionary of every
symbol, and a keyboard that turns what you type into symbols as you write.
The interface follows the visitor's browser language (Chrome: Settings →
Languages), currently English, 中文, Español, Français and 日本語, falling
back to English for anything else.

## Run it

It's plain HTML, CSS and JavaScript with no build step. Open `index.html`, or
serve the folder:

```sh
python3 -m http.server
```

Then visit http://localhost:8000. It works as-is on GitHub Pages.

## Files

| Path | What it is |
| --- | --- |
| `index.html`, `style.css`, `app.js` | the site: an intro column, the dictionary and the keyboard |
| `i18n.js` | interface text per language, and the browser-language pick |
| `data/vocabulary.js` | what each symbol means in each language (edit this one by hand) |
| `data/glyphs.js` | glyph names, codepoints and the English words that type them (generated) |
| `fonts/` | `CommonGround.ttf` / `.woff` (generated) |
| `source/LoCoSVocabulary.glyphs` | the font source |
| `tools/build_font.py` | builds the fonts and `data/glyphs.js` from the source |

## Rebuilding the font

Glyphs' own export kept failing, so `tools/build_font.py` compiles the
`.glyphs` file directly with [fontTools](https://github.com/fonttools/fonttools):

```sh
pip install fonttools
python3 tools/build_font.py
```

It copies the outlines (all straight-line shapes) and compiles the ligature
features exactly as written in the source, so typing `water` with the font
gives the water symbol in any app, and `[past]` gives the past marker. It also
writes `tools/features.fea`, the full feature code, which is handy for finding
out what the Glyphs exporter complains about.

## Adding a language

1. Add a column to `data/vocabulary.js` and its code to `VOCAB_COLUMNS`.
2. Add the interface text to `LANGS` in `i18n.js`, keyed by the language code
   browsers report (`de`, `ko`, `pt`, …).

The keyboard picks up the new words automatically. For languages written
without spaces (Chinese, Japanese) it matches words anywhere in the text. For
the others it matches whole words only.
