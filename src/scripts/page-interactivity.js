import { createWorksFilters } from './works-filters.js';
import { createProjectPreview } from './project-preview.js';

// Состояние переживает замену DOM; контроллеры принадлежат одной языковой странице.
export function createPageInteractivity({
  lenis = null,
  createFilters = createWorksFilters,
  createPreview = createProjectPreview,
} = {}) {
  /** @type {string | null} */
  let currentSlug = null;
  let activeFilter = 'all';
  const videoPositions = new Map();
  /** @type {{ destroy(): void } | null} */
  let filters = null;
  /** @type {{ destroy(): void } | null} */
  let preview = null;

  return function bindPageInteractivity(pageData) {
    if (!pageData) return;
    filters?.destroy();
    preview?.destroy();
    filters = createFilters(pageData, {
      activeFilter,
      onChange: (filter) => { activeFilter = filter; },
    });
    preview = createPreview(pageData, {
      lenis, currentSlug, videoPositions,
      onSelect: (slug) => { currentSlug = slug; },
    });
  };
}
