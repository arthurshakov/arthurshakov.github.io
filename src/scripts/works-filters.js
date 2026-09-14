import { query, queryAll } from './dom.js';
import { confirmClick } from './click-sound.js';
import { PREVIEW_SLIDER_CONFIG } from './preview-slider.js';

export function createWorksFilters(currentPageData, { activeFilter = 'all', onChange = (filter) => {} } = {}) {
  const DraggableClass = /** @type {any} */ (window).Draggable;
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

  function getFiltersBounds() {
    if (!filtersStrip || !filtersTrack) return { minX: 0, maxX: 0 };
    const stripW = filtersStrip.clientWidth;
    const trackW = Math.max(filtersTrack.scrollWidth, filtersTrack.offsetWidth || 0);
    const minX = Math.min(0, stripW - trackW);
    return { minX, maxX: 0 };
  }

  function scrollFilterIntoView(chip) {
    if (!filtersStrip || !filtersTrack || !chip) return;
    if (filtersDraggable && (filtersDraggable.isDragging || filtersDraggable.isThrowing)) return;

    const stripWidth = filtersStrip.clientWidth;
    const chipLeft = chip.offsetLeft;
    const chipWidth = chip.clientWidth;
    const targetX = (stripWidth / 2) - (chipLeft + chipWidth / 2);
    const bounds = getFiltersBounds();
    const clampedTargetX = Math.max(bounds.minX, Math.min(bounds.maxX, targetX));

    if (window.gsap) {
      window.gsap.to(filtersTrack, {
        x: clampedTargetX,
        duration: PREVIEW_SLIDER_CONFIG.stripScrollDurationS || 0.35,
        ease: PREVIEW_SLIDER_CONFIG.stripScrollEase || 'power2.out',
        overwrite: 'auto',
        onUpdate() {
          if (filtersDraggable) filtersDraggable.update();
        },
      });
    } else {
      filtersTrack.style.transform = 'translate3d(' + clampedTargetX + 'px, 0, 0)';
    }
  }

  /** @type {any} */
  let filtersDraggable = null;
  if (DraggableClass && filtersTrack && filtersStrip) {
    filtersStrip.classList.add('filters--draggable');
    const initialBounds = getFiltersBounds();
    filtersDraggable = DraggableClass.create(filtersTrack, {
      type: 'x',
      inertia: true,
      bounds: initialBounds,
      edgeResistance: PREVIEW_SLIDER_CONFIG.filtersEdgeResistance ?? PREVIEW_SLIDER_CONFIG.stripEdgeResistance,
      throwResistance: PREVIEW_SLIDER_CONFIG.filtersThrowResistance ?? PREVIEW_SLIDER_CONFIG.stripThrowResistance,
      cursor: 'grab',
      activeCursor: 'grabbing',
      dragClickables: true,
      onPressInit() {
        this.applyBounds(getFiltersBounds());
      },
      onDragStart() {
        filtersStrip.classList.add('is-dragging');
      },
      onDragEnd() {
        filtersStrip.classList.remove('is-dragging');
      },
      onThrowComplete() {
        filtersStrip.classList.remove('is-dragging');
      },
    })[0];
  }

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
    chip.addEventListener('click', () => {
      if (
        filtersDraggable &&
        (filtersDraggable.isDragging || filtersDraggable.isThrowing || filtersDraggable.timeSinceDrag() < 0.1)
      ) {
        return;
      }
      if (chip.dataset.filter === activeFilter) {
        return;
      }
      applyFilter(chip.dataset.filter);
      confirmClick(chip);
      if (chip.closest('.mobile-only')) {
        scrollFilterIntoView(chip);
      }
    });
  });

  // Пересчитываем только собственную ленту фильтров.
  let resizeTimer;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      filtersDraggable?.applyBounds(getFiltersBounds());
      filtersDraggable?.update();
    }, 60);
  };
  window.addEventListener('resize', onResize);
  if (activeFilter !== 'all') applyFilter(activeFilter);
  return {
    destroy() {
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      filtersDraggable?.kill();
      window.gsap?.killTweensOf(filtersTrack);
    },
  };
}
