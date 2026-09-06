// Прогрессивное усиление. Разметка уже отрендерена на сборке — здесь только поведение:
// фильтры works, смена кадра в // preview, клик по строке -> preview.

import { createPlaylistPlayer } from './audio-player.js';
import { bindAudioControls, bindAudioVisualizer } from './audio-controls.js';
import { createAudioVisualizer } from './audio-visualizer.js';

(() => {
  const boot = window.__PORTFOLIO__;
  const preloader = document.querySelector('[data-preloader]');
  const preloaderCommands = [...document.querySelectorAll('[data-preloader-command]')];
  const preloaderResults = [...document.querySelectorAll('[data-preloader-result]')];
  // Курсор убирается вместе с командой: иначе в момент очистки строки он
  // прыгнул бы влево, на своё «чистое» место после $.
  const preloaderCarets = [...document.querySelectorAll('[data-preloader-prompt] .caret')];
  const content = document.querySelector('.body');
  const finishFallback = () => window.__finishPreloaderFallback?.();
  const holdFallback = () => window.__holdPreloaderFallback?.();
  // Инстанс создаётся ниже, синхронно — к моменту старта прелоадера он уже
  // здесь. Нужен, чтобы на время прелоадера остановить скролл: lenis сам
  // скроллит программно и не считается с overflow: hidden.
  let lenis = null;

  // Тайминги прелоадера — в секундах, как их ждёт gsap.
  // Скорость печати — на символ.
  const CHAR_DURATION = 0.016;
  // Пауза между концом печати команды и появлением ready — имитация
  // выполнения. Не меньше 0.5с, иначе ready выглядит мгновенным.
  const EXEC_DELAY = 0.5;
  // Сколько ready остаётся на экране, прежде чем исчезнуть вместе с командой.
  const READY_HOLD = 0.7;
  // Длительность раскрытия контента маской сверху вниз.
  const REVEAL_DURATION = 0.25;
  // Затухание строки команды и ready. Начинается одновременно с раскрытием,
  // поэтому держать его меньше REVEAL_DURATION; 0 — исчезают сразу, без
  // затухания.
  const PROMPT_FADE = 0;

  // Реальный контент скрыт (см. _critical.scss) до этого класса — иначе
  // виден флэш запасным шрифтом, пока грузится JetBrains Mono.
  const markFontsLoaded = () => document.documentElement.classList.add('fonts-loaded');

  const mainStylesLink = document.getElementById('main-styles');
  const stylesReady = !mainStylesLink || mainStylesLink.rel === 'stylesheet'
    ? Promise.resolve()
    : new Promise((resolve) => mainStylesLink.addEventListener('load', resolve, { once: true }));
  const fontsReady = document.fonts?.ready ?? Promise.resolve();

  function runPreloader() {
    if (!preloader) {
      finishFallback();
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const setText = (els, value) => els.forEach((el) => {
      el.textContent = value;
    });
    const setResult = (visible) => preloaderResults.forEach((el) => {
      el.hidden = !visible;
    });
    const clearPrompt = () => {
      setText(preloaderCommands, '');
      setResult(false);
    };
    // Скролл возвращается только когда контент показан целиком: класс
    // preloader-pending уходит из <html>, lenis снова слушает колесо.
    const unlockScroll = () => {
      finishFallback();
      lenis?.start();
    };
    // Короткий путь (reduce-motion / нет gsap): прелоадер снимается целиком,
    // без печати и раскрытия.
    const finish = () => {
      clearPrompt();
      preloader.hidden = true;
      unlockScroll();
    };

    lenis?.stop();

    const commandText = preloaderCommands[0]?.dataset.command || '';

    if (!commandText || reduceMotion.matches || !window.gsap) {
      setText(preloaderCommands, commandText);
      window.setTimeout(finish, 80);
      return;
    }

    const typeInto = (timeline, els, text, duration) => {
      if (!text) return timeline;
      const state = { length: 0 };
      return timeline.to(state, {
        length: text.length,
        duration,
        ease: 'none',
        onUpdate: () => setText(els, text.slice(0, Math.round(state.length))),
      });
    };

    // Контент выезжает из маски сверху вниз. Линия раскрытия проходит ровно
    // высоту видимой части (от низа хэдера до низа вьюпорта) — иначе на
    // длинной странице она пролетала бы её за первые кадры. По окончании
    // clip-path снимается, чтобы не подрезать остальную страницу.
    const revealContent = (timeline, position) => {
      if (!content) return;
      const total = content.offsetHeight;
      const top = content.getBoundingClientRect().top;
      const visible = Math.max(window.innerHeight - top, 0);
      const state = { line: 0 };
      const clipTo = (line) => {
        content.style.clipPath = `inset(0 0 ${Math.max(total - line, 0)}px 0)`;
      };
      clipTo(0);
      timeline.to(state, {
        line: visible,
        duration: REVEAL_DURATION,
        ease: 'power1.inOut',
        onUpdate: () => clipTo(state.line),
        onComplete: () => {
          content.style.clipPath = '';
        },
      }, position);
    };

    // Команда, курсор и ready уходят не «до» раскрытия, а вместе с ним —
    // анимация ставится на ту же метку таймлайна. При PROMPT_FADE = 0 это
    // мгновенная очистка в том же кадре, при большем — затухание внахлёст.
    const fadeOutPrompt = (timeline, position) => {
      const els = [...preloaderCommands, ...preloaderCarets, ...preloaderResults];
      timeline.to(els, {
        opacity: 0,
        duration: PROMPT_FADE,
        ease: 'power1.out',
        onComplete: () => {
          clearPrompt();
          window.gsap.set(els, { clearProps: 'opacity' });
        },
      }, position);
    };

    holdFallback();
    const tl = window.gsap.timeline({ onComplete: unlockScroll });
    typeInto(tl, preloaderCommands, commandText, commandText.length * CHAR_DURATION);
    tl.call(() => setResult(true), null, `+=${EXEC_DELAY}`);
    // Одна и та же метка на таймлайне: уходит оверлей, уходят строка
    // команды с ready, контент начинает выезжать из маски.
    tl.call(() => {
      preloader.hidden = true;
    }, null, `+=${READY_HOLD}`);
    const revealAt = tl.duration();
    fadeOutPrompt(tl, revealAt);
    revealContent(tl, revealAt);
  }

  Promise.all([stylesReady, fontsReady]).then(markFontsLoaded, markFontsLoaded).then(() => {
    // Хард-фолбэк из <head> мог уже снять preloader-pending, пока грузились
    // шрифты/стили — тогда прелоадер уже скрыт и повторно анимировать не надо.
    if (document.documentElement.classList.contains('preloader-pending')) {
      runPreloader();
    }
  });

  if (!boot) return;

  const byId = new Map(boot.projects.map((p) => [p.slug, p]));
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const audioToggles = $$('[data-audio-toggle]');
  if (audioToggles.length) {
    const musicFadeInMs = 500;
    const musicFadeOutMs = 50;
    const visualizer = createAudioVisualizer();
    const player = createPlaylistPlayer({
      tracks: [
        '/assets/audio/filtered-aperture.mp3',
        '/assets/audio/through-the-glass.mp3',
      ],
      fadeInMs: musicFadeInMs,
      fadeOutMs: musicFadeOutMs,
      prepareAudio: (audio) => visualizer.attach(audio),
      resumeAudioGraph: () => visualizer.resume(),
    });
    bindAudioControls(audioToggles, player);
    bindAudioVisualizer(audioToggles, player, visualizer);

    const resumeVisualizer = () => visualizer.resumeIfAttached().catch(() => {});
    let resumeAfterVisibility = false;
    window.addEventListener('pointerdown', resumeVisualizer, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        resumeAfterVisibility = player.suspend();
        return;
      }

      resumeVisualizer();
      if (!resumeAfterVisibility) return;
      resumeAfterVisibility = false;
      player.resume().catch(() => {});
    });
  }

  // ------------------------------------------------------------- lenis-скролл
  // Плавный (инерционный) скролл. При prefers-reduced-motion не инициализируем —
  // остаётся нативный скролл. Сетка на фоне статична, поэтому не «плывёт».
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
