# Repository instructions

## Product intent

- This is a study-aid hub for technology students: hands-on learning tools, curated course/resource lists, cheat sheets for many scenarios, and more over time.
- Scope starts in systems development, but keep the content data (arrays, categories, render functions) shaped so other tech areas can be added without restructuring the app.
- The terminal/TUI aesthetic is a product requirement, not decoration: preserve the monospace/CRT look, ASCII-style labels, and the theme tokens in `style.css`.
- Simplicity and GitHub Pages hosting are hard constraints: no build step, no bundler, no server-side code, no runtime backend.
- User-facing copy is Brazilian Portuguese (`<html lang="pt-BR">`); new content should match that language and tone.

## Project shape

- This is a no-bundle static SPA/PWA. There is no dependency manifest or configured install, build, formatter, lint, typecheck, test, or codegen command; edited files are shipped directly.
- Use relative asset paths (`./index.html`, `./style.css`, `./sw.js`, `./js/app.js`, as already used in `manifest.json` and `js/app.js`). GitHub Pages project sites are served from a repository subdirectory, so root-absolute paths like `/sw.js` break the deployed app.
- Layout: `index.html` is the shell and the only place that lists scripts; `js/app.js` holds the global `app` (state, router, shared behavior, PWA); `js/views/<id>.js` is one file per nav view and registers `app.views.<id> = { render(), init? }`; `js/data/<name>.js` holds content arrays as top-level consts (`DIAGRAMS`, `CHEATSHEETS`, `LINKS`, `APOSTILAS`); `js/main.js` is the bootstrap; `style.css` holds themes/layout; `sw.js` caching; `manifest.json` install metadata.
- Script load order is load-bearing: `js/app.js` must come before any `js/views/*` file (views assign to `app.views` at load time) and `js/main.js` must be last (it calls `app.init()`).
- A new navigation view needs four coordinated edits: a `data-view` button in `index.html`, a `js/views/<id>.js` file exposing `render()` (and `init()` only if it needs listeners), a `<script>` tag in `index.html`, and an entry in `sw.js` `ASSETS` with `CACHE_NAME` bumped.
- The global `app` object is load-bearing: inline `onclick` handlers and the `js/main.js` bootstrap depend on it. Do not wrap `js/app.js` in a module or rename `app` without updating the generated markup.
- Views replace `#view-container` via `innerHTML`. The delegated `window` input handler in `js/app.js` survives rerenders, but new per-view listeners belong in that view's `init()`, which `loadView()` calls right after injecting the markup.

## Runtime gotchas

- Theme and favorites are persisted under the exact `localStorage` keys `edu_theme` and `edu_favorites`; changing either key discards existing user state. Converter selections and values are in-memory only.
- `sw.js` pre-caches the Google Fonts and Mermaid URLs used by `index.html`; keep those URLs synchronized. First install therefore needs network access even though later launches are offline-capable.
- After adding or changing any file in `sw.js` `ASSETS` (that includes every new file under `js/`), increment `CACHE_NAME`; activation deletes all other named caches, and a version change is how clients are forced onto the new cache.
- Service-worker registration, install, and update behavior require an HTTP(S) origin, not `file://`. Test PWA update behavior only after changing the worker or its cache version.
- Brand colors are declared twice and currently differ: `index.html` has `<meta name="theme-color" content="#000000">` while `manifest.json` has `"theme_color": "#00FF41"`. Align them whenever either is changed.

## Local verification

- There is no automated test suite. Serve the repository root over HTTP, for example `python -m http.server 8000`, then open `http://localhost:8000`.
- If Node.js is available, syntax-check the JS you touched with `node --check <file>` (for example `node --check js/app.js` and `node --check sw.js`); this does not validate HTML, CSS, browser behavior, or external resources.
- Manual smoke coverage should include all seven navigation views, theme and favorite persistence, converter validation/swapping, CDN-backed Mermaid rendering, and service-worker install/update behavior.
