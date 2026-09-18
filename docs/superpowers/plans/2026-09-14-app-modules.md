# App modules implementation plan

Goal: split app.js by responsibility, preserving bilingual UI and existing behavior.
Architecture: app.js owns persistent navigation state and connects independent controllers; page controllers expose destroy(), while audio and scrolling persist across language changes.
Scope: audit item 3 only. Existing media lifecycle defects and rendering duplication remain separate steps.

- [x] Add a runtime orchestration test: rebinding cleans up the old page, preserves selected project/filter/video positions, and ignores missing page data.
- [x] Extract preloader.js (initPreloader), audio-session.js (initAudioSession), scroll-effects.js (initScrollEffects).
- [x] Extract works-filters.js (createWorksFilters), preview-details.js (createPreviewDetails), project-preview.js (createProjectPreview), page-interactivity.js (createPageInteractivity).
- [x] Update build copying, source-based test paths and README module map.
- [x] Run all Node tests, typecheck and production build; check EN/RU filters, preview navigation and language changes at mobile and desktop widths.

No new dependencies, CSS changes, commits or deployment. Keep existing viewport-scale and localStorage fixes.
