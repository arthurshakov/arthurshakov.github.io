// Прогрессивное усиление. Разметка уже отрендерена на сборке — здесь только поведение:
// фильтры works, смена кадра в // preview, клик по строке -> preview.

(() => {
  const boot = window.__PORTFOLIO__;
  if (!boot) return;

  const byId = new Map(boot.projects.map((p) => [p.slug, p]));
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ------------------------------------------------------------- lenis-скролл
  // Плавный (инерционный) скролл. При prefers-reduced-motion не инициализируем —
  // остаётся нативный скролл. Сетка на фоне статична, поэтому не «плывёт».
  let lenis = null;
  if (!reduceMotion.matches && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  // ---------------------------------------------------------------- фильтры
  const rows = $$('[data-rows] .works-row');
  const cards = $$('[data-cards] .works-card');
  const chips = $$('.chip');

  function matches(el, filter) {
    if (filter === 'all') return true;
    return (el.dataset.cats || '').split(/\s+/).includes(filter);
  }

  function relastify(list, hiddenClass, lastClass) {
    let last = null;
    list.forEach((el) => {
      el.classList.remove(lastClass);
      if (!el.classList.contains(hiddenClass)) last = el;
    });
    if (last) last.classList.add(lastClass);
  }

  function applyFilter(filter) {
    chips.forEach((c) => {
      const on = c.dataset.filter === filter;
      c.classList.toggle('chip--on', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    rows.forEach((el) => el.classList.toggle('is-hidden', !matches(el, filter)));
    cards.forEach((el) => el.classList.toggle('is-hidden', !matches(el, filter)));
    relastify(rows, 'is-hidden', 'works-row--last');
    relastify(cards, 'is-hidden', 'works-card--last');
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => applyFilter(chip.dataset.filter));
  });

  // ---------------------------------------------------------------- preview
  const pv = {
    slug: $('[data-pv-slug]'),
    site: $('[data-pv-site]'),
    open: $('[data-pv-open]'),
    shotSrc: $('[data-pv-shot-src]'),
    shotImg: $('[data-pv-shot-img]'),
    name: $('[data-pv-name]'),
    star: $('[data-pv-star]'),
    sub: $('[data-pv-sub]'),
    desc: $('[data-pv-desc]'),
    tags: $('[data-pv-tags]'),
    cta: $('[data-pv-cta]'),
    awards: $('[data-pv-awards]'),
    awardsText: $('[data-pv-awards-text]'),
  };
  const thumbs = $$('.preview-thumbnail');

  let current = null;

  function setActive(slug, { scroll = false } = {}) {
    const p = byId.get(slug);
    if (!p || slug === current) {
      if (scroll) scrollToPreview();
      return;
    }
    current = slug;

    if (pv.slug) pv.slug.textContent = p.slug;
    if (pv.site) pv.site.textContent = p.site;
    if (pv.open) pv.open.href = p.url;
    if (pv.shotSrc) {
      // Единственный современный <source>: и type, и srcset берутся из
      // манифеста сборки (какой формат — avif/webp — оказался легче).
      pv.shotSrc.setAttribute('type', p.shotModType);
      pv.shotSrc.setAttribute('srcset', p.shotMod);
    }
    if (pv.shotImg) {
      pv.shotImg.src = p.shot;
      pv.shotImg.alt = p.slug;
    }
    if (pv.name) pv.name.textContent = p.slug;
    if (pv.star) pv.star.hidden = !p.star;
    if (pv.sub) pv.sub.textContent = `${p.client} · ${p.year}`;
    if (pv.desc) pv.desc.textContent = p.desc;
    if (pv.tags) {
      pv.tags.textContent = '';
      p.tags.forEach((tag) => {
        const s = document.createElement('span');
        s.className = 'tag';
        s.textContent = tag;
        pv.tags.appendChild(s);
      });
    }
    if (pv.cta) pv.cta.href = p.url;
    if (pv.awards) {
      pv.awards.hidden = !p.awwwards;
      if (p.awwwards && pv.awardsText) pv.awardsText.textContent = p.awwwards;
    }

    thumbs.forEach((btn) => {
      const on = btn.dataset.slug === slug;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    [...rows, ...cards].forEach((el) =>
      el.classList.toggle('is-active', el.dataset.slug === slug)
    );

    if (scroll) scrollToPreview();
  }

  function scrollToPreview() {
    const el = document.getElementById('preview');
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, { offset: 0 });
      return;
    }
    el.scrollIntoView({
      behavior: reduceMotion.matches ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  thumbs.forEach((btn) => {
    btn.addEventListener('click', () => setActive(btn.dataset.slug));
  });

  // клик по строке / карточке -> preview (но не по вложенной ссылке "open")
  function wireRow(el) {
    el.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      setActive(el.dataset.slug, { scroll: true });
    });
  }
  rows.forEach(wireRow);
  cards.forEach(wireRow);

  // фиксируем стартовое активное состояние без анимации-«появления»
  current = boot.projects[0] ? boot.projects[0].slug : null;
})();
