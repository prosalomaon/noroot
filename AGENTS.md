# Repository instructions

## Project shape

- This is a no-bundle static SPA/PWA. There is no dependency manifest or configured install, build, formatter, lint, typecheck, test, or codegen command; edited files are shipped directly.
- `index.html` is the shell and runtime dependency entrypoint; `script.js` contains all view data/markup, navigation, behavior, and PWA UI; `style.css` contains shared themes/layout; `sw.js` handles caching; `manifest.json` contains install metadata.
- A new navigation view needs a matching `data-view` in `index.html`, a `loadView()` branch and renderer in `script.js`, and any per-view listener initialization from `loadView()`.
- The global `app` object is load-bearing: inline `onclick` handlers and startup calls depend on it. Do not wrap `script.js` in a module or rename `app` without updating the generated markup.
- Views replace `#view-container` via `innerHTML`. The delegated `window` input handler survives rerenders, but new per-view listeners must be attached after `loadView()` injects the view.

## Runtime gotchas

- Theme and favorites are persisted under the exact `localStorage` keys `edu_theme` and `edu_favorites`; changing either key discards existing user state. Converter selections and values are in-memory only.
- `sw.js` pre-caches the Google Fonts and Mermaid URLs used by `index.html`; keep those URLs synchronized. First install therefore needs network access even though later launches are offline-capable.
- After changing any file in `sw.js` `ASSETS` or its contents, increment `CACHE_NAME`; activation deletes all other named caches, and a version change is how clients are forced onto the new cache.
- Service-worker registration, install, and update behavior require an HTTP(S) origin, not `file://`. Test PWA update behavior only after changing the worker or its cache version.

## Local verification

- There is no automated test suite. Serve the repository root over HTTP, for example `python -m http.server 8000`, then open `http://localhost:8000`.
- If Node.js is available, use `node --check script.js` and `node --check sw.js` for syntax-only checks; they do not validate HTML, CSS, browser behavior, or external resources.
- Manual smoke coverage should include all seven navigation views, theme and favorite persistence, converter validation/swapping, CDN-backed Mermaid rendering, and service-worker install/update behavior.
