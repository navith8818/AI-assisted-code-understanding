# Novacore — Inference at the Edge (landing page)

A recreation of the dark/orange "AI inference at the edge" landing page style
shown in your reference video — plain HTML/CSS/JS, no build step, so you can
open it straight in Antigravity (or any editor) and start editing.

## Structure

```
index.html      → all page markup (header, hero, sections, footer)
css/style.css   → all styling (tokens at the top of the file under :root)
js/main.js      → interactions: mobile nav, FAQ accordion, pricing currency
                  toggle, animated globe (canvas), demo "playground"
```

## Running it locally

No build tools needed. Either:
- Open `index.html` directly in a browser, or
- Run a tiny local server (recommended, avoids any file:// quirks):
  ```bash
  cd novacore-site
  python3 -m http.server 8080
  # then visit http://localhost:8080
  ```

## Where to make common edits

- **Brand name / logo** — search `NOVACORE` in `index.html` (header + footer),
  and the inline SVG mark right next to it.
- **Colors** — `css/style.css`, top `:root` block. `--amber` / `--amber-strong`
  are the accent glow color; `--bg-dark` / `--bg-light` are the two section
  backgrounds.
- **Copy/text** — all in `index.html`, organized in clearly commented
  `<section>` blocks (`HERO`, `TRY IT`, `GLOBAL NETWORK`, `PRICING`, `FAQ`, etc).
- **Pricing numbers** — `.price-card` blocks in `index.html`. The $/€ toggle
  logic lives in `js/main.js` → `initCurrencyToggle()`.
- **Globe animation** — `js/main.js` → `initGlobe()`. It's a hand-rolled
  canvas dot-sphere (Fibonacci sphere distribution), no external library.
- **FAQ accordion** — markup in the `#faq` section; behavior in
  `js/main.js` → `initAccordion()`.

## Notes

- Fonts are loaded from Google Fonts (Manrope + JetBrains Mono) via the
  `<link>` tags in `<head>`. Swap those out if you want different type.
- Everything is responsive down to mobile (hamburger menu included), and
  respects `prefers-reduced-motion`.
- The "Run inference" playground is a front-end simulation only — it doesn't
  call a real model. Wire it up to an actual API in `initPlayground()` in
  `js/main.js` if you want real output.
