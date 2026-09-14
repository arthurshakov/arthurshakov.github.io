# Repository Guidelines

## Project Structure & Module Organization

This is a static, bilingual portfolio site built with Node.js, SCSS, and vanilla JavaScript. Source lives in `src/`:

- `build.mjs` compiles styles, renders pages, copies static files, and optimizes screenshots into `dist/`.
- `template.mjs` renders both language variants; UI copy is in `data/strings.mjs` and portfolio entries are in `data/projects.mjs`.
- `styles/` contains Sass partials such as `_layout.scss` and `_preview.scss`; `main.scss` is the entry point.
- `scripts/app.js` contains progressive-enhancement behavior. Keep the rendered page usable without it.
- `vendor/` holds third-party browser assets. Source screenshots are under `src/assets/images/screenshots/`.

Automated tests live in `test/` and are executed via Node's native runner (`node --test`). Utility scripts (such as `scripts/prepare-videos.mjs`) live in `scripts/`.

`dist/` is generated output and should not be edited directly. Visual references and the design contract are in `DESIGN-SPEC.md` and the `*.dc.html` files.

## Build, Test, and Development Commands

```bash
npm install            # install development dependencies
npm run build          # generate production files in dist/
npm run dev            # watch src/, rebuild, and serve dist/ at localhost:5173
npm test               # run automated test suite (node --test)
npm run typecheck      # run TypeScript check (tsc --noEmit)
npm run prepare:videos # encode and prepare preview videos
npm run clean          # remove generated dist/ output
```

Automated tests are located in `test/` (covering router navigation, audio control/player/visualizer, preloader, video preview handling, and bilingual copy). Before submitting a change, run `npm test`, `npm run typecheck`, and `npm run build`; for visual or interaction changes, also use `npm run dev` and check both `/` (English) and `/ru/` (Russian) at mobile and desktop widths.

## Coding Style & Naming Conventions

Use two-space indentation and ES modules (`.mjs`) for build and template code. Prefer `const`, `async`/`await`, descriptive camelCase identifiers, and small focused helpers. Use kebab-case SCSS partial names (`_statusbar.scss`) and BEM-like CSS classes (`.works-row__project`, `.pill--on`). Keep project data ordered by featured priority, preserve `slug` values, and provide both `ru` and `en` text whenever copy changes.

## Assets and Build Behavior

Add a project screenshot using `<slug>.(webp|png|jpg)` in `src/assets/images/screenshots/`; the build generates full and thumbnail AVIF/WebP/JPEG assets. Do not hand-edit `dist/assets/shots/`, which is a build cache. Avoid changing the responsive `vc()` token system without verifying the 390px, 960px, and 1920px layout behavior.

## Commit & Pull Request Guidelines

The available history has one short subject (`Initial portfolio site`), so no stronger convention is established. Use a concise, imperative summary per commit, such as `Update project metadata`. Pull requests should explain the user-visible change, note data or asset updates, link relevant issues when available, and include screenshots for visual changes. Do not add co-author trailers to commit messages.
