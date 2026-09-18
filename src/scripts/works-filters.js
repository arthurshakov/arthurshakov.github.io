import { createPageLifetime } from './page-lifetime.js';
import { query, queryAll } from './dom.js';
import { confirmClick } from './click-sound.js';
import { PREVIEW_SLIDER_CONFIG } from './preview-slider.js';
import { createDraggableStrip } from './draggable-strip.js';

export function createWorksFilters(currentPageData, { activeFilter = 'all', onChange = (filter) => {} } = {}) {
  const lifetime = createPageLifetime();
  const rows = queryAll('[data-rows] .works-row');
  const cards = queryAll('[data-cards] .works-card');
  const chips = queryAll('.chip');
  const filtersStrip = /** @type {HTMLElement | null} */ (query('[data-filters-strip]'));
  const filtersTrack = /** @type {HTMLElement | null} */ (query('[data-filters-track]'));
  const worksAnnouncer = query('[data-works-announcer]');

  function matches(projectElement, filter) {
    // Кнопка all не фильтрует; остальные сравниваются с категориями из data-атрибута.
    if (filter === 'all') return true;
    const categories = (projectElement.dataset.categories || '').split(/\s+/);
    if (filter === 'brand') {
      return categories.includes('brand') || categories.includes('catalogue');
    }
    if (filter === 'auto') {
      return categories.includes('auto') || categories.includes('automobiles');
    }
    return categories.includes(filter);
  }

  function markLastVisibleElement(elements, hiddenClass, lastClass) {
    // Нижней видимой строке нужна отдельная стилизация границы.
    let last = /** @type {any} */ (null);
    for (const projectElement of elements) {
      projectElement.classList.remove(lastClass);
      if (!projectElement.classList.contains(hiddenClass)) last = projectElement;
    }
    if (last) last.classList.add(lastClass);
  }

  const stripManager = createDraggableStrip(filtersStrip, filtersTrack, {
    draggableClass: 'filters--draggable',
    edgeResistance: PREVIEW_SLIDER_CONFIG.filtersEdgeResistance,
    throwResistance: PREVIEW_SLIDER_CONFIG.filtersThrowResistance,
  });

  function applyFilter(filter) {
    // Синхронно обновляем состояние кнопок, список на десктопе и карточки на mobile.
    activeFilter = filter;
    onChange(filter);
    chips.forEach((chip) => {
      const isActive = chip.dataset.filter === filter;
      chip.classList.toggle('chip--on', isActive);
      chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    rows.forEach((projectElement) => projectElement.classList.toggle('is-hidden', !matches(projectElement, filter)));
    cards.forEach((projectElement) => projectElement.classList.toggle('is-hidden', !matches(projectElement, filter)));
    markLastVisibleElement(rows, 'is-hidden', 'works-row--last');
    markLastVisibleElement(cards, 'is-hidden', 'works-card--last');

    if (worksAnnouncer && currentPageData.t?.filterAnnounce) {
      const visibleCount = rows.filter((r) => !r.classList.contains('is-hidden')).length;
      const totalCount = rows.length;
      worksAnnouncer.textContent = currentPageData.t.filterAnnounce
        .replace('{count}', String(visibleCount))
        .replace('{total}', String(totalCount));
    }
  }

  chips.forEach((chip) => {
    lifetime.listen(chip, 'click', () => {
      if (stripManager.isInteracting()) {
        return;
      }
      if (chip.dataset.filter === activeFilter) {
        return;
      }
      applyFilter(chip.dataset.filter);
      confirmClick(chip);
      if (chip.closest('.mobile-only')) {
        stripManager.smoothScrollTo(chip);
      }
    });
  });

  // Пересчитываем только собственную ленту фильтров.
  let resizeTimer;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      stripManager.update();
    }, 60);
  };
  lifetime.listen(window, 'resize', onResize);
  if (activeFilter !== 'all') applyFilter(activeFilter);
  return {
    destroy() {
      lifetime.destroy();
      window.clearTimeout(resizeTimer);
      stripManager.destroy();
    },
  };
}
