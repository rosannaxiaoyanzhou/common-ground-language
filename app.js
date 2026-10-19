// Common Ground: a searchable dictionary of the font's symbols and a
// keyboard that turns what you type, in your own language, into symbols.

const CATEGORIES = ["w", "s", "m"]; // words, roots, markers (the glyph name prefix)

// ---- data: one entry per symbol, with its meanings in every language ----

const vocab = {};
for (const line of VOCAB.trim().split("\n")) {
  const [name, ...cols] = line.split("|").map(s => s.trim());
  vocab[name] = {};
  VOCAB_COLUMNS.forEach((lang, i) => {
    vocab[name][lang] = (cols[i] || "").split("/").map(s => s.trim()).filter(Boolean);
  });
}

const entries = GLYPHS
  .filter(g => g.typed.length && CATEGORIES.includes(g.name[0]))
  .map(g => {
    const isMarker = g.name[0] === "m";
    // "[opposite-of]" reads as "opposite of", "lose-game" as "lose game"
    const plain = g.typed.map(t => t.replace(/[[\]]/g, "").replace(/-/g, " "));
    return {
      name: g.name,
      cat: g.name[0],
      char: String.fromCodePoint(g.unicode),
      typed: g.typed,
      isMarker,
      meanings: { en: plain, ...(vocab[g.name] || {}) },
    };
  });

// ---- language ----

// always the browser's language; there's no picker on the page
const lang = pickLanguage();
const t = key => (LANGS[lang] && LANGS[lang][key]) || LANGS.en[key] || "";
const meaning = (entry, l = lang) => (entry.meanings[l] && entry.meanings[l][0]) || entry.meanings.en[0];

function applyLanguage() {
  document.documentElement.lang = lang === "zh" ? "zh-Hans" : lang;
  document.title = t("title");
  for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n).replace("{n}", entries.length);
  for (const el of document.querySelectorAll("[data-i18n-placeholder]")) el.placeholder = t(el.dataset.i18nPlaceholder);
  for (const el of document.querySelectorAll("[data-i18n-aria-label]")) el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
  buildLexicon();
  renderFilters();
  renderGrid();
  renderPalette();
  renderOutput();
}

// ---- views ----

const views = ["dictionary", "keyboard"];

function showView() {
  const name = views.includes(location.hash.slice(1)) ? location.hash.slice(1) : "dictionary";
  // the sections are "view-…" rather than the bare hash, so the browser doesn't also scroll to them
  for (const v of views) document.getElementById("view-" + v).hidden = v !== name;
  for (const a of document.querySelectorAll(".nav-card")) {
    if (a.dataset.tab === name) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
  if (name === "keyboard") kbInput.focus({ preventScroll: true });
}
window.addEventListener("hashchange", () => {
  showView();
  // on narrow screens the page sits below the column, so bring it into view
  if (matchMedia("(max-width: 900px)").matches) document.querySelector("main").scrollIntoView({ behavior: "smooth" });
});

// ---- dictionary ----

const grid = document.getElementById("grid");
const search = document.getElementById("search");
const filters = document.getElementById("filters");
let activeFilter = "all";

// lower-case, without accents, so "cafe" finds "café" and "Agua" finds "agua"
const fold = s => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

function renderFilters() {
  filters.replaceChildren();
  for (const key of ["all", ...CATEGORIES]) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = t("filter_" + key);
    if (key !== "all") b.title = t(`filter_${key}_hint`);
    b.setAttribute("aria-pressed", key === activeFilter);
    b.addEventListener("click", () => { activeFilter = key; renderFilters(); renderGrid(); });
    filters.append(b);
  }
}

function renderGrid() {
  const q = fold(search.value.trim());
  const shown = entries.filter(e =>
    (activeFilter === "all" || e.cat === activeFilter) &&
    (!q || [e.name, ...e.typed, ...Object.values(e.meanings).flat()].some(w => fold(w).includes(q))));

  grid.replaceChildren(...shown.map(e => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.innerHTML = `<span class="glyph"></span><span class="word"></span><span class="typed"></span>`;
    card.querySelector(".glyph").textContent = e.char;
    card.querySelector(".word").textContent = meaning(e);
    // the English spelling is what you type in the font; worth showing in every language
    card.querySelector(".typed").textContent = lang === "en" ? "" : e.typed[0];
    card.addEventListener("click", () => openDetail(e));
    return card;
  }));
  document.getElementById("count").textContent = t("count").replace("{n}", shown.length);
  document.getElementById("none").hidden = shown.length > 0;
}
search.addEventListener("input", renderGrid);

// ---- detail ----

const detail = document.getElementById("detail");
let detailEntry = null;

function openDetail(e) {
  detailEntry = e;
  document.getElementById("detail-glyph").textContent = e.char;
  document.getElementById("detail-word").textContent = (e.meanings[lang] || e.meanings.en).join(" / ");
  document.getElementById("detail-typed").textContent = e.typed.join("  ·  ");
  const dl = document.getElementById("detail-langs");
  dl.replaceChildren();
  for (const code of Object.keys(LANGS)) {
    if (code === lang || !e.meanings[code] || !e.meanings[code].length) continue;
    const dt = document.createElement("dt");
    dt.textContent = LANGS[code].name;
    const dd = document.createElement("dd");
    dd.textContent = e.meanings[code].join(" / ");
    dd.lang = code;
    dl.append(dt, dd);
  }
  document.getElementById("detail-copy").textContent = t("copy");
  detail.showModal();
}

document.getElementById("detail-copy").addEventListener("click", ev => {
  copy(detailEntry.typed[0], ev.currentTarget);
});

document.getElementById("detail-use").addEventListener("click", () => {
  insertWord(detailEntry);
  detail.close();
  location.hash = "#keyboard";
});

// clicking the backdrop closes the dialog too
detail.addEventListener("click", ev => { if (ev.target === detail) detail.close(); });

// ---- keyboard: text in, symbols out ----

const kbInput = document.getElementById("kb-input");
const kbOutput = document.getElementById("kb-output");
let lexicon = new Map();   // first letter -> [[phrase, entry], ...], longest first

// every way to write each symbol: its English spelling in the font, and the
// words for it in the chosen language (markers in brackets, like "[过去]")
function buildLexicon() {
  const phrases = new Map();
  const add = (phrase, e) => { if (phrase) phrases.set(phrase.toLowerCase(), e); };
  for (const e of entries) {
    for (const typed of e.typed) {
      add(typed, e);
      add(typed.replace(/-/g, " "), e);
    }
    if (lang !== "en") {
      for (const word of e.meanings[lang] || []) add(e.isMarker ? `[${word}]` : word, e);
    }
  }
  lexicon = new Map();
  for (const [phrase, e] of phrases) {
    const first = phrase[0];
    if (!lexicon.has(first)) lexicon.set(first, []);
    lexicon.get(first).push([phrase, e]);
  }
  for (const list of lexicon.values()) list.sort((a, b) => b[0].length - a[0].length);
}

const isLetter = ch => !!ch && /[\p{L}\p{M}]/u.test(ch);
// scripts written without spaces between words match anywhere
const noSpaces = ch => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(ch);

// split text into runs of plain text and matched symbols, preferring the
// longest phrase at each spot, and (for spaced scripts) whole words only
function convert(text) {
  const lower = text.toLowerCase();
  const src = lower.length === text.length ? lower : text;
  const parts = [];
  let plain = "";
  let i = 0;
  while (i < text.length) {
    let hit = null;
    for (const [phrase, e] of lexicon.get(src[i]) || []) {
      if (!src.startsWith(phrase, i)) continue;
      const end = i + phrase.length;
      const spaced = !noSpaces(phrase[0]);
      if (spaced && (isLetter(text[i - 1]) || isLetter(text[end]))) continue;
      hit = { e, end };
      break;
    }
    // a particle that only ties a modifier to a noun (我的爱 → 我 爱) is left out,
    // but only straight after a symbol, so words like 目的 stay whole
    const particle = !hit && !plain && parts.length && typeof parts[parts.length - 1] !== "string" &&
      (LANGS[lang].attributive || []).find(p => src.startsWith(p, i));
    if (particle) {
      i += particle.length;
      continue;
    }
    if (hit) {
      if (plain) parts.push(plain);
      plain = "";
      parts.push({ entry: hit.e, source: text.slice(i, hit.end) });
      i = hit.end;
    } else {
      plain += text[i];
      i++;
    }
  }
  if (plain) parts.push(plain);
  return parts;
}

function renderOutput() {
  const parts = convert(kbInput.value);
  kbOutput.replaceChildren(...parts.map(p => {
    if (typeof p === "string") return document.createTextNode(p);
    const s = document.createElement("span");
    s.className = "sym";
    s.textContent = p.entry.char;
    s.title = p.source;
    return s;
  }));
}
kbInput.addEventListener("input", renderOutput);

const outputText = () => convert(kbInput.value).map(p => typeof p === "string" ? p : p.entry.char).join("");

// put a symbol's word at the cursor, with a space on either side as needed
function insertWord(e) {
  const word = lang === "en" ? e.typed[0] : (e.isMarker ? `[${meaning(e)}]` : meaning(e));
  const { selectionStart: a, selectionEnd: b, value } = kbInput;
  const before = value.slice(0, a);
  const after = value.slice(b);
  const pad = s => (s && !/\s$/.test(s) && !noSpaces(word[0]) ? " " : "");
  const text = pad(before) + word + (after && !/^\s/.test(after) && !noSpaces(word[0]) ? " " : "");
  kbInput.setRangeText(text, a, b, "end");
  renderOutput();
}

function renderPalette() {
  const palette = document.getElementById("palette");
  palette.replaceChildren(...entries.map(e => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "key";
    b.innerHTML = `<span class="glyph"></span><span class="word"></span>`;
    b.querySelector(".glyph").textContent = e.char;
    b.querySelector(".word").textContent = meaning(e);
    b.title = e.typed[0];
    // keep the text box focused so the cursor stays where it was
    b.addEventListener("mousedown", ev => ev.preventDefault());
    b.addEventListener("click", () => { insertWord(e); kbInput.focus({ preventScroll: true }); });
    return b;
  }));
}

document.getElementById("kb-clear").addEventListener("click", () => {
  kbInput.value = "";
  renderOutput();
  kbInput.focus();
});
document.getElementById("kb-copy").addEventListener("click", ev => copy(outputText(), ev.currentTarget));
document.getElementById("kb-image").addEventListener("click", saveImage);

function copy(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const label = button.textContent;
    button.textContent = t("copied");
    setTimeout(() => { button.textContent = label; }, 1200);
  });
}

// draw the symbols onto a canvas, wrapping at spaces, and download a PNG
async function saveImage() {
  const text = outputText().trim();
  if (!text) return;
  const size = 72, pad = 64, maxWidth = 1400, lineHeight = size * 1.5;
  const font = `${size}px CommonGround, system-ui, sans-serif`;
  await document.fonts.load(font, text);
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = font;

  const lines = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(/(\s+)/)) {
      if (line && ctx.measureText(line + word).width > maxWidth) {
        lines.push(line.trimEnd());
        line = word.trimStart();
      } else {
        line += word;
      }
    }
    lines.push(line);
  }

  const width = Math.min(maxWidth, Math.max(...lines.map(l => ctx.measureText(l).width))) + pad * 2;
  const canvas = ctx.canvas;
  const scale = 2;
  canvas.width = Math.ceil(width) * scale;
  canvas.height = Math.ceil(lines.length * lineHeight + pad * 2) * scale;
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#111111";
  ctx.font = font;
  ctx.textBaseline = "middle";
  lines.forEach((l, i) => ctx.fillText(l, pad, pad + lineHeight * (i + 0.5)));

  canvas.toBlob(blob => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "common-ground.png";
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

// ---- start ----

applyLanguage();
showView();
