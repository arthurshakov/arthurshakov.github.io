// Прогрессивное усиление. Разметка уже отрендерена на сборке — здесь только поведение:
// фильтры works, смена кадра в // preview, клик по строке -> preview.

import { createPlaylistPlayer } from './audio-player.js';
import { bindAudioControls, bindAudioVisualizer } from './audio-controls.js';
import { createAudioVisualizer } from './audio-visualizer.js';
import { bindClickSound, confirmClick } from './click-sound.js';
import { initGridAnimation } from './grid-animation.js';
import { createPjaxRouter } from './pjax.js';
import { PREVIEW_SLIDER_CONFIG, calcVc } from './preview-slider.js';

(() => {
  // Данные текущей языковой версии страницы встраиваются в HTML на сборке.
  const pageData = window.__PORTFOLIO__;
  // Элементы прелоадера собираются один раз: затем функция анимации работает
  // только с этими ссылками, не повторяя поиск по DOM.
  const preloader = /** @type {HTMLElement | null} */ (document.querySelector('[data-preloader]'));
  const preloaderCommands = /** @type {HTMLElement[]} */ ([...document.querySelectorAll('[data-preloader-command]')]);
  const preloaderResults = /** @type {HTMLElement[]} */ ([...document.querySelectorAll('[data-preloader-result]')]);
  // Курсор убирается вместе с командой: иначе в момент очистки строки он
  // прыгнул бы влево, на своё «чистое» место после $.
  const preloaderCarets = [...document.querySelectorAll('[data-preloader-prompt] .caret')];
  /** @type {HTMLElement | null} */
  const content = document.querySelector('.body');
  const finishFallback = () => window.__finishPreloaderFallback?.();
  const holdFallback = () => window.__holdPreloaderFallback?.();
  // Инстанс создаётся ниже, синхронно — к моменту старта прелоадера он уже
  // здесь. Нужен, чтобы на время прелоадера остановить скролл: lenis сам
  // скроллит программно и не считается с overflow: hidden.
  /** @type {any} */
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

  // Анимация старта ждёт готовых стилей и шрифтов, чтобы контент не мигал
  // промежуточной типографикой во время раскрытия.
  const mainStylesLink = /** @type {HTMLLinkElement | null} */ (document.getElementById('main-styles'));
  const stylesReady = !mainStylesLink || mainStylesLink.rel === 'stylesheet'
    ? Promise.resolve()
    : new Promise((resolve) => mainStylesLink.addEventListener('load', resolve, { once: true }));
  const fontsReady = document.fonts?.ready ?? Promise.resolve();

  function runPreloader() {
    if (!preloader) {
      finishFallback();
      return;
    }

    // Системная настройка доступности отключает декоративную анимацию.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const setText = (elements, value) => elements.forEach((element) => {
      element.textContent = value;
    });
    const setResult = (visible) => preloaderResults.forEach((resultElement) => {
      resultElement.hidden = !visible;
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

    // GSAP меняет только длину строки, а текст для каждого кадра вычисляется
    // из исходной команды — так получается эффект печати без таймеров.
    const typeInto = (timeline, elements, text, duration) => {
      if (!text) return timeline;
      const state = { length: 0 };
      return timeline.to(state, {
        length: text.length,
        duration,
        ease: 'none',
        onUpdate: () => setText(elements, text.slice(0, Math.round(state.length))),
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
      const promptElements = [...preloaderCommands, ...preloaderCarets, ...preloaderResults];
      timeline.to(promptElements, {
        opacity: 0,
        duration: PROMPT_FADE,
        ease: 'power1.out',
        onComplete: () => {
          clearPrompt();
          window.gsap.set(promptElements, { clearProps: 'opacity' });
        },
      }, position);
    };

    // Фолбэк из <head> не даёт странице открыться раньше, чем завершится
    // управляемая GSAP-последовательность.
    holdFallback();
    const timeline = window.gsap.timeline({ onComplete: unlockScroll });
    typeInto(timeline, preloaderCommands, commandText, commandText.length * CHAR_DURATION);
    timeline.call(() => setResult(true), null, `+=${EXEC_DELAY}`);
    // Одна и та же метка на таймлайне: уходит оверлей, уходят строка
    // команды с ready, контент начинает выезжать из маски.
    timeline.call(() => {
      preloader.hidden = true;
    }, null, `+=${READY_HOLD}`);
    const revealAt = timeline.duration();
    fadeOutPrompt(timeline, revealAt);
    revealContent(timeline, revealAt);
  }

  // Даже при ошибке загрузки шрифтов снимаем защитный класс: страница должна
  // остаться доступной, а не бесконечно ждать прелоадер.
  Promise.all([stylesReady, fontsReady]).then(markFontsLoaded, markFontsLoaded).then(() => {
    // Хард-фолбэк из <head> мог уже снять preloader-pending, пока грузились
    // шрифты/стили — тогда прелоадер уже скрыт и повторно анимировать не надо.
    if (document.documentElement.classList.contains('preloader-pending')) {
      runPreloader();
    }
  });

  // Без данных сборки интерактивность не инициализируется, но статичная
  // разметка остаётся рабочей как прогрессивный фолбэк.
  if (!pageData) return;

  // Короткие помощники для выборки одного или нескольких DOM-элементов.
  const query = (selector, context = document) => context.querySelector(selector);
  const queryAll = (selector, context = document) => [...context.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ------------------------------------------------------------- фоновая музыка
  const audioToggles = queryAll('[data-audio-toggle]');
  if (audioToggles.length) {
    const musicFadeInMs = 500;
    const musicFadeOutMs = 50;
    const musicCrossfadeMs = 1000;
    const visualizer = createAudioVisualizer();
    const musicTracks = pageData.audioTracks.map(({ file, name }) => ({
      src: `/assets/audio/${file}`,
      name,
    }));
    const player = createPlaylistPlayer({
      tracks: musicTracks.map((track) => track.src),
      crossfadeMs: musicCrossfadeMs,
      fadeInMs: musicFadeInMs,
      fadeOutMs: musicFadeOutMs,
      prepareAudio: (audio) => visualizer.attach(audio),
      resumeAudioGraph: () => visualizer.resume(),
    });
    bindAudioControls(audioToggles, player, musicTracks.map((track) => track.name));
    bindAudioVisualizer(audioToggles, player, visualizer);
    bindClickSound({
      isSoundEnabled: () => player.getState().playing || player.hasStoredEnabledPreference(),
    });

    // Браузеры разрешают звук только после жеста пользователя. Если посетитель
    // ранее включал музыку, возобновляем её при первом клике вне переключателя.
    if (player.hasStoredEnabledPreference()) {
      window.addEventListener('pointerdown', (event) => {
        if (event.target instanceof Element && event.target.closest('[data-audio-toggle]')) return;
        player.start().catch(() => { });
      }, { once: true, passive: true });
    }

    // AudioContext тоже может быть заблокирован до жеста или при скрытой вкладке.
    // Здесь отдельно поддерживается визуализатор и сам проигрыватель.
    const resumeVisualizer = () => visualizer.resumeIfAttached().catch(() => { });
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
      player.resume().catch(() => { });
    });
  } else {
    bindClickSound({
      isSoundEnabled: () => true,
    });
  }

  // ------------------------------------------------------------- lenis-скролл
  // Плавный (инерционный) скролл. При prefers-reduced-motion не инициализируем —
  // остаётся нативный скролл. Сетка на фоне статична, поэтому не «плывёт».
  if (!reduceMotion.matches && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({
      duration: 1.1,
      easing: (progress) => Math.min(1, 1.001 - Math.pow(2, -10 * progress)),
    });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  // ------------------------------------------------------------- анимация сетки
  const gridCanvas = /** @type {HTMLCanvasElement | null} */ (document.getElementById('bg-grid-canvas'));
  const gridContainer = /** @type {HTMLElement | null} */ (document.querySelector('.bg-grid'));
  const gridAnim = initGridAnimation(gridCanvas, gridContainer);

  if (lenis && gridAnim && typeof gridAnim.feedVelocity === 'function') {
    lenis.on('scroll', (/** @type {{ velocity?: number }} */ e) => {
      if (typeof e.velocity === 'number') {
        gridAnim.feedVelocity(e.velocity);
      }
    });
  }

  // ---------------------------------------------------------------- интерактивность страницы
  // Состояние выбирается независимо от DOM, чтобы его можно было восстановить
  // после PJAX-навигации, когда элементы страницы пересоздаются.
  let currentSlug = pageData.projects[0] ? pageData.projects[0].slug : null;
  let activeFilter = 'all';
  let disposePreviewMedia = () => { };
  const videoPositions = new Map();

  // Регистрация GSAP плагинов для инерционной ленты миниатюр
  const win = /** @type {any} */ (window);
  if (win.gsap && win.Draggable) {
    if (win.InertiaPlugin) {
      win.gsap.registerPlugin(win.Draggable, win.InertiaPlugin);
    } else {
      win.gsap.registerPlugin(win.Draggable);
    }
  }

  function bindPageInteractivity(currentPageData) {
    if (!currentPageData) return;

    // При PJAX-навигации снимаем старые observers и обработчики, прежде чем
    // привязать их к новой разметке.
    disposePreviewMedia();

    // Быстрый доступ к проекту по slug вместо поиска по массиву при каждом клике.
    const projectsBySlug = new Map(currentPageData.projects.map((project) => [project.slug, project]));
    const DraggableClass = /** @type {any} */ (window).Draggable;
    const rows = queryAll('[data-rows] .works-row');
    const cards = queryAll('[data-cards] .works-card');
    const chips = queryAll('.chip');
    const filtersStrip = /** @type {HTMLElement | null} */ (query('[data-filters-strip]'));
    const filtersTrack = /** @type {HTMLElement | null} */ (query('[data-filters-track]'));

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
      chips.forEach((chip) => {
        const isActive = chip.dataset.filter === filter;
        chip.classList.toggle('chip--on', isActive);
        chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      rows.forEach((projectElement) => projectElement.classList.toggle('is-hidden', !matches(projectElement, filter)));
      cards.forEach((projectElement) => projectElement.classList.toggle('is-hidden', !matches(projectElement, filter)));
      markLastVisibleElement(rows, 'is-hidden', 'works-row--last');
      markLastVisibleElement(cards, 'is-hidden', 'works-card--last');
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

    // ---------------------------------------------------------------- preview
    // Все части preview собраны в объект, чтобы смена проекта обновляла один
    // согласованный набор DOM-элементов.
    const preview = {
      slug: query('[data-preview-slug]'),
      site: query('[data-preview-site]'),
      open: /** @type {HTMLAnchorElement | null} */ (query('[data-preview-open]')),
      shotSrc: /** @type {HTMLSourceElement | null} */ (query('[data-preview-shot-source]')),
      shotImg: /** @type {HTMLImageElement | null} */ (query('[data-preview-shot-image]')),
      picture: /** @type {HTMLElement | null} */ (query('[data-preview-picture]')),
      video: /** @type {any} */ (query('[data-preview-video]')),
      name: query('[data-preview-name]'),
      star: query('[data-preview-star]'),
      sub: query('[data-preview-subtitle]'),
      description: query('[data-preview-description]'),
      tags: query('[data-preview-tags]'),
      cta: /** @type {HTMLAnchorElement | null} */ (query('[data-preview-call-to-action]')),
      note: query('[data-preview-note]'),
      noteText: query('[data-preview-note-text]'),
      awards: query('[data-preview-awards]'),
      awardsText: query('[data-preview-awards-text]'),
    };
    const thumbnails = queryAll('.preview-thumbnail');
    const previewFrame = query('.preview-frame');
    const infoBox = /** @type {HTMLElement | null} */ (query('[data-preview-info]') || query('.preview-info'));
    const mediaBox = /** @type {HTMLElement | null} */ (query('[data-preview-media-box]'));
    const metaBody = /** @type {HTMLElement | null} */ (query('[data-preview-meta-body]'));
    const counter = query('[data-preview-counter]');
    const btnPrev = query('[data-preview-prev]');
    const btnNext = query('[data-preview-next]');
    const maskLine = /** @type {HTMLElement | null} */ (query('[data-scanline-line]'));
    const maskTrail = /** @type {HTMLElement | null} */ (query('[data-scanline-trail]'));
    const strip = /** @type {HTMLElement | null} */ (query('[data-preview-strip]'));
    const track = /** @type {HTMLElement | null} */ (query('[data-preview-track]'));

    const layerA = /** @type {HTMLElement | null} */ (query('[data-preview-layer-a]'));
    const layerB = /** @type {HTMLElement | null} */ (query('[data-preview-layer-b]'));
    const slotA = {
      layer: layerA,
      picture: /** @type {HTMLElement | null} */ (query('[data-preview-picture-a]')),
      src: /** @type {HTMLSourceElement | null} */ (query('[data-preview-shot-source-a]')),
      img: /** @type {HTMLImageElement | null} */ (query('[data-preview-shot-image-a]')),
      video: /** @type {any} */ (query('[data-preview-video-a]')),
    };
    const slotB = {
      layer: layerB,
      picture: /** @type {HTMLElement | null} */ (query('[data-preview-picture-b]')),
      src: /** @type {HTMLSourceElement | null} */ (query('[data-preview-shot-source-b]')),
      img: /** @type {HTMLImageElement | null} */ (query('[data-preview-shot-image-b]')),
      video: /** @type {any} */ (query('[data-preview-video-b]')),
    };

    let activeIsA = true;
    let isAnimating = false;
    preview.video = slotA.video;
    preview.picture = slotA.picture;
    preview.shotSrc = slotA.src;
    preview.shotImg = slotA.img;

    // Эти значения описывают жизненный цикл видео, а не данные проекта:
    // видно ли превью, какой ролик загружен и какую позицию уже восстановили.
    let previewVisible = false;
    let loadedVideoSlug = null;
    let restoredVideoSlug = null;
    let revealRequest = 0;
    let playbackRequest = 0;

    function pauseVideo() {
      if (!preview.video) return;
      // Любое устаревшее завершение play() больше не может показать ролик,
      // который уже ушёл за границы preview.
      playbackRequest += 1;
      // Запоминаем позицию перед паузой: при возврате к проекту ролик продолжается,
      // а не начинает воспроизведение с нуля.
      if (loadedVideoSlug && Number.isFinite(preview.video.currentTime)) {
        videoPositions.set(loadedVideoSlug, preview.video.currentTime);
      }
      preview.video.pause();
    }

    function showImage() {
      if (isAnimating) return;
      // Скриншот — универсальный фолбэк: для проектов без ролика, reduce-motion,
      // скрытого превью, неактивной вкладки и ошибки загрузки.
      if (preview.video) {
        pauseVideo();
        revealRequest += 1;
        preview.video.classList.remove('is-visible');
      }
      if (preview.picture) preview.picture.hidden = false;
    }

    function loadVideo(project) {
      // Источники добавляются лениво, только для выбранного проекта: иначе
      // браузер загрузил бы ролики всех карточек сразу.
      if (!preview.video || !project.video || loadedVideoSlug === project.slug) return;
      preview.video.replaceChildren();
      const webm = document.createElement('source');
      webm.src = project.video.webm;
      webm.type = 'video/webm';
      const mp4 = document.createElement('source');
      mp4.src = project.video.mp4;
      mp4.type = 'video/mp4';
      preview.video.append(webm, mp4);
      preview.video.removeAttribute('poster');
      loadedVideoSlug = project.slug;
      restoredVideoSlug = null;
      preview.video.load();
    }

    function revealVideo() {
      if (!preview.video) return;
      // requestAnimationFrame отделяет смену класса от загрузки кадра, поэтому
      // CSS-переход opacity успевает анимироваться.
      const request = ++revealRequest;
      requestAnimationFrame(() => {
        if (request === revealRequest) preview.video?.classList.add('is-visible');
      });
    }

    function restoreVideoPosition() {
      // currentTime можно задавать лишь после появления метаданных; флаг не даёт
      // повторно прыгать по таймлайну при каждом событии готовности.
      if (!preview.video || restoredVideoSlug === loadedVideoSlug || preview.video.readyState < 1) return;
      const position = videoPositions.get(loadedVideoSlug);
      if (Number.isFinite(position)) preview.video.currentTime = position;
      restoredVideoSlug = loadedVideoSlug;
    }

    function syncPreviewMedia() {
      if (isAnimating) return;
      const project = projectsBySlug.get(currentSlug);
      // Видео разрешено только у выбранного проекта, в видимом preview и активной
      // вкладке. Во всех остальных состояниях остаётся статичная картинка.
      if (!project || !project.video || reduceMotion.matches || !previewVisible || document.hidden) {
        showImage();
        return;
      }
      loadVideo(project);
      restoreVideoPosition();
      // Не запускаем воспроизведение до первого декодированного кадра. При
      // первом входе в блок load() и observer приходят в разном порядке;
      // событие canplay ниже вызовет эту функцию повторно, когда кадр готов.
      if (preview.video?.readyState < 2) return;
      const request = ++playbackRequest;
      revealVideo();
      // muted + playsinline позволяют autoplay. AbortError здесь ожидаем,
      // когда пользователь успел увести preview до завершения play().
      preview.video.play().catch((error) => {
        if (request !== playbackRequest || error.name === 'AbortError') return;
        showImage();
      });
    }

    function preloadVideo() {
      // Начинаем подгрузку заранее, но не запускаем ролик, пока preview не видно.
      const project = projectsBySlug.get(currentSlug);
      if (!project || !project.video || reduceMotion.matches) return;
      loadVideo(project);
    }

    // После первого декодированного кадра повторно синхронизируем состояние:
    // теперь можно восстановить позицию, показать и запустить видео.
    const onVideoReady = () => {
      if (isAnimating || loadedVideoSlug !== currentSlug || !preview.video) return;
      syncPreviewMedia();
    };
    const onVideoError = showImage;
    preview.video?.addEventListener('loadeddata', onVideoReady);
    preview.video?.addEventListener('canplay', onVideoReady);
    preview.video?.addEventListener('error', onVideoError);
    slotB.video?.addEventListener('loadeddata', onVideoReady);
    slotB.video?.addEventListener('canplay', onVideoReady);
    slotB.video?.addEventListener('error', onVideoError);

    // Основной observer запускает/ставит на паузу ролик, когда в зоне видимости
    // находится не менее 15% блока preview.
    const observer = typeof IntersectionObserver === 'function' && previewFrame
      ? new IntersectionObserver(([entry]) => {
        previewVisible = entry.isIntersecting;
        syncPreviewMedia();
      }, { threshold: 0.15 })
      : null;
    // Второй observer подготавливает файл за один экран до preview, чтобы не
    // показывать долгую загрузку в момент скролла к нему.
    const preloadObserver = typeof IntersectionObserver === 'function' && previewFrame
      ? new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) preloadVideo();
      }, { rootMargin: '100% 0px' })
      : null;
    // В старом браузере без IntersectionObserver выбираем доступность: видео
    // можно запустить, а изображение всё равно останется фолбэком при ошибке.
    if (!observer) previewVisible = true;
    observer?.observe(previewFrame);
    preloadObserver?.observe(previewFrame);
    const onVisibilityChange = () => syncPreviewMedia();
    document.addEventListener('visibilitychange', onVisibilityChange);

    function scrambleText(element, finalText, durationMs = 200) {
      if (!element) return;
      const chars = '01#_$%*/~<>[]';
      const original = finalText;
      const start = performance.now();
      const interval = window.setInterval(() => {
        const progress = (performance.now() - start) / durationMs;
        if (progress >= 1) {
          window.clearInterval(interval);
          element.textContent = original;
          return;
        }
        let current = '';
        for (let i = 0; i < original.length; i++) {
          if (i < original.length * progress) {
            current += original[i];
          } else {
            current += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        element.textContent = current;
      }, 25);
    }

    let measuredMaxHeight = 0;

    function calculateMaxHeight() {
      if (!infoBox) return;
      const currentWidth = infoBox.getBoundingClientRect().width;
      if (currentWidth <= 0) return;

      let clone = /** @type {HTMLElement | null} */ (document.getElementById('preview-measurer-clone'));
      if (!clone) {
        clone = document.createElement('div');
        clone.id = 'preview-measurer-clone';
        clone.style.cssText = 'position: absolute; left: -9999px; top: 0; visibility: hidden; pointer-events: none;';
        document.body.appendChild(clone);
      }

      clone.className = 'preview-info';
      clone.style.width = currentWidth + 'px';
      clone.style.minHeight = '0px';

      let maxH = 0;

      currentPageData.projects.forEach((p) => {
        let awardsHtml = '';
        const awards = p.awards || (p.awwwards ? [p.awwwards] : []);
        if (awards.length > 0) {
          awardsHtml = awards.map((a) => {
            const lastSpace = a.text.lastIndexOf(' ');
            const prefix = lastSpace > -1 ? `${a.text.slice(0, lastSpace)} ` : '';
            const suffix = a.text.slice(lastSpace + 1);
            return (
              '<div class="preview-awards__item">' +
              '<svg class="icon icon-size-12 icon--accent"><use href="#i-star"/></svg>' +
              (a.url
                ? '<a class="preview-awards__link">' + prefix + '<span class="preview-awards__suffix">' + suffix + '<svg class="icon icon-size-11"><use href="#i-ext"/></svg></span></a>'
                : '<span>' + a.text + '</span>'
              ) +
              '</div>'
            );
          }).join('');
        }

        const noteHtml = p.note
          ? '<div class="preview-note"><span class="preview-note__slash">// </span><span class="preview-note__text">' + p.note + '</span></div>'
          : '';
        const tagsHtml = (p.tags || []).map((t) => '<span class="tag">' + t + '</span>').join('');

        if (clone) {
          clone.innerHTML =
            '<div class="preview-name-row"><span class="preview-name">' + p.slug + '</span></div>' +
            '<div class="preview-meta-body">' +
            '<div class="preview-subtitle">' + p.client + ' · ' + p.year + '</div>' +
            '<p class="preview-description">' + p.description + '</p>' +
            '<div class="preview-tags">' + tagsHtml + '</div>' +
            '<div class="preview-actions"><a class="btn btn--primary"><span>' + (currentPageData.t?.openSite || 'OPEN') + '</span></a></div>' +
            (noteHtml || '') +
            (awardsHtml ? '<div class="preview-awards"><span data-preview-awards-text>' + awardsHtml + '</span></div>' : '') +
            '</div>';

          const h = clone.offsetHeight;
          if (h > maxH) maxH = h;
        }
      });

      if (maxH > 0) {
        measuredMaxHeight = maxH;
        if (window.innerWidth >= 960) {
          document.documentElement.style.setProperty('--preview-info-height', measuredMaxHeight + 'px');
        } else {
          document.documentElement.style.setProperty('--preview-info-height-mobile', measuredMaxHeight + 'px');
        }
        infoBox.style.minHeight = measuredMaxHeight + 'px';
      }
    }

    function getTrackBounds() {
      if (!strip || !track) return { minX: 0, maxX: 0 };
      const stripW = strip.clientWidth;
      const trackW = Math.max(track.scrollWidth, track.offsetWidth || 0);
      const minX = Math.min(0, stripW - trackW);
      return { minX, maxX: 0 };
    }

    function smoothScrollThumbnails(activeThumb) {
      if (!strip || !track || !activeThumb) return;
      wheelTargetX = null;
      if (stripDraggable && (stripDraggable.isDragging || stripDraggable.isThrowing)) return;

      const stripWidth = strip.clientWidth;
      const thumbLeft = activeThumb.offsetLeft;
      const thumbWidth = activeThumb.clientWidth;
      const targetX = (stripWidth / 2) - (thumbLeft + thumbWidth / 2);
      const bounds = getTrackBounds();
      const clampedTargetX = Math.max(bounds.minX, Math.min(bounds.maxX, targetX));

      if (window.gsap) {
        window.gsap.to(track, {
          x: clampedTargetX,
          duration: PREVIEW_SLIDER_CONFIG.stripScrollDurationS,
          ease: PREVIEW_SLIDER_CONFIG.stripScrollEase,
          overwrite: 'auto',
          onUpdate() {
            if (stripDraggable) stripDraggable.update();
          },
        });
      } else {
        track.style.transform = 'translate3d(' + clampedTargetX + 'px, 0, 0)';
      }
    }

    /** @type {any} */
    let stripDraggable = null;
    if (DraggableClass && track) {
      const initialBounds = getTrackBounds();
      stripDraggable = DraggableClass.create(track, {
        type: 'x',
        inertia: true,
        bounds: initialBounds,
        edgeResistance: PREVIEW_SLIDER_CONFIG.stripEdgeResistance,
        throwResistance: PREVIEW_SLIDER_CONFIG.stripThrowResistance,
        cursor: 'grab',
        activeCursor: 'grabbing',
        dragClickables: true,
        onPressInit() {
          wheelTargetX = null;
          this.applyBounds(getTrackBounds());
        },
        onDragStart() {
          strip?.classList.add('is-dragging');
        },
        onDragEnd() {
          strip?.classList.remove('is-dragging');
        },
        onThrowComplete() {
          strip?.classList.remove('is-dragging');
        },
      })[0];
    }

    let wheelTargetX = /** @type {number | null} */ (null);

    const onStripWheel = (/** @type {WheelEvent} */ e) => {
      if (stripDraggable && stripDraggable.isDragging) return;
      // Реагируем только на горизонтальный скролл (трекпад горизонтально, колесо наклона или Shift + колесо).
      // Вертикальный скролл не перехватываем, чтобы страница скроллилась нормально.
      if (Math.abs(e.deltaX) < 1 || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();

      const speed = PREVIEW_SLIDER_CONFIG.stripWheelSpeed ?? 2.0;
      const delta = e.deltaX * speed;

      if (window.gsap && track) {
        const bounds = getTrackBounds();
        const currentX = /** @type {number} */ (window.gsap.getProperty(track, 'x')) || 0;
        const startX = wheelTargetX !== null ? wheelTargetX : currentX;
        wheelTargetX = Math.max(bounds.minX, Math.min(bounds.maxX, startX - delta));

        window.gsap.to(track, {
          x: wheelTargetX,
          duration: PREVIEW_SLIDER_CONFIG.stripWheelDurationS ?? 0.32,
          ease: 'power2.out',
          overwrite: 'auto',
          onUpdate() {
            if (stripDraggable) stripDraggable.update();
          },
          onComplete() {
            wheelTargetX = null;
          },
        });
      }
    };
    strip?.addEventListener('wheel', onStripWheel, { passive: false });

    function updateTextDetails(project) {
      if (preview.slug) preview.slug.textContent = project.slug;
      if (preview.site) preview.site.textContent = project.site;
      if (preview.open) preview.open.href = project.url;
      if (preview.star) preview.star.hidden = !project.star;
      if (preview.sub) preview.sub.textContent = `${project.client} · ${project.year}`;
      if (preview.description) preview.description.textContent = project.description;
      if (preview.tags) {
        preview.tags.textContent = '';
        project.tags.forEach((tag) => {
          const tagElement = document.createElement('span');
          tagElement.className = 'tag';
          tagElement.textContent = tag;
          preview.tags.appendChild(tagElement);
        });
      }
      if (preview.cta) preview.cta.href = project.url;
      if (preview.note) {
        preview.note.hidden = !project.note;
        if (preview.noteText) {
          preview.noteText.textContent = project.note || '';
        }
      }
      if (preview.awards) {
        const awards = project.awards || (project.awwwards ? [project.awwwards] : []);
        preview.awards.hidden = awards.length === 0;
        if (preview.awardsText) {
          preview.awardsText.replaceChildren();
          awards.forEach((award) => {
            const item = document.createElement('div');
            item.className = 'preview-awards__item';

            const starIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            starIcon.setAttribute('class', 'icon icon-size-12 icon--accent');
            starIcon.setAttribute('aria-hidden', 'true');
            starIcon.setAttribute('focusable', 'false');
            const starIconUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            starIconUse.setAttribute('href', '#i-star');
            starIcon.appendChild(starIconUse);
            item.appendChild(starIcon);

            if (award.url) {
              const awardLink = document.createElement('a');
              awardLink.className = 'preview-awards__link';
              awardLink.href = award.url;
              awardLink.target = '_blank';
              awardLink.rel = 'noopener';
              const lastSpace = award.text.lastIndexOf(' ');
              if (lastSpace > -1) awardLink.append(`${award.text.slice(0, lastSpace)} `);
              const awardSuffix = document.createElement('span');
              awardSuffix.className = 'preview-awards__suffix';
              awardSuffix.textContent = award.text.slice(lastSpace + 1);
              const awardIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
              awardIcon.setAttribute('class', 'icon icon-size-11');
              awardIcon.setAttribute('aria-hidden', 'true');
              awardIcon.setAttribute('focusable', 'false');
              const awardIconUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
              awardIconUse.setAttribute('href', '#i-ext');
              awardIcon.appendChild(awardIconUse);
              awardSuffix.appendChild(awardIcon);
              awardLink.appendChild(awardSuffix);
              item.appendChild(awardLink);
            } else {
              const textSpan = document.createElement('span');
              textSpan.textContent = award.text;
              item.appendChild(textSpan);
            }

            preview.awardsText.appendChild(item);
          });
        }
      }
    }

    /**
     * @param {string} slug
     * @param {{ direction?: 'next' | 'prev' | string, scroll?: boolean, animate?: boolean }} [options]
     */
    function setActive(slug, { direction, scroll = false, animate = true } = {}) {
      const project = projectsBySlug.get(slug);
      if (!project) return;
      if (animate && slug === currentSlug) {
        if (scroll) scrollToPreview();
        return scroll;
      }
      if (isAnimating) return;

      const currentIndex = currentPageData.projects.findIndex((p) => p.slug === currentSlug);
      const targetIndex = currentPageData.projects.findIndex((p) => p.slug === slug);
      const dir = direction || (targetIndex >= currentIndex ? 'next' : 'prev');

      thumbnails.forEach((thumbnail) => {
        const isActive = thumbnail.dataset.slug === slug;
        thumbnail.classList.toggle('is-active', isActive);
        thumbnail.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      [...rows, ...cards].forEach((projectElement) =>
        projectElement.classList.toggle('is-active', projectElement.dataset.slug === slug)
      );

      if (counter) {
        const num = String(targetIndex + 1).padStart(2, '0');
        const total = String(currentPageData.projects.length).padStart(2, '0');
        counter.innerHTML = '[ <span class="preview-stepper-counter__current">' + num + '</span> / ' + total + ' ]';
      }

      if (!stripDraggable || (!stripDraggable.isDragging && !stripDraggable.isThrowing)) {
        smoothScrollThumbnails(thumbnails[targetIndex]);
      }

      if (!animate || reduceMotion.matches) {
        currentSlug = slug;
        updateTextDetails(project);
        if (preview.name) preview.name.textContent = project.slug;
        const curSlot = activeIsA ? slotA : slotB;
        if (curSlot.src) {
          curSlot.src.setAttribute('type', project.shotModType);
          curSlot.src.setAttribute('srcset', project.shotMod);
        }
        if (curSlot.img) {
          curSlot.img.src = project.shot;
          curSlot.img.alt = project.slug;
        }
        showImage();
        syncPreviewMedia();
        if (scroll) scrollToPreview();
        return true;
      }

      currentSlug = slug;
      isAnimating = true;
      previewFrame?.classList.add('is-animating');
      const activeSlot = activeIsA ? slotA : slotB;
      const incomingSlot = activeIsA ? slotB : slotA;

      if (incomingSlot.layer) {
        incomingSlot.layer.style.clipPath = dir === 'next' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
        incomingSlot.layer.style.zIndex = '2';
      }
      if (activeSlot.layer) activeSlot.layer.style.zIndex = '1';

      if (incomingSlot.src) {
        incomingSlot.src.setAttribute('type', project.shotModType);
        incomingSlot.src.setAttribute('srcset', project.shotMod);
      }
      if (incomingSlot.img) {
        incomingSlot.img.src = project.shot;
        incomingSlot.img.alt = project.slug;
      }

      let prepPromise = Promise.resolve();
      if (incomingSlot.video && project.video && project.video.webm && previewVisible && !reduceMotion.matches && !document.hidden) {
        incomingSlot.video.replaceChildren();
        const webm = document.createElement('source');
        webm.src = project.video.webm;
        webm.type = 'video/webm';
        const mp4 = document.createElement('source');
        mp4.src = project.video.mp4;
        mp4.type = 'video/mp4';
        incomingSlot.video.append(webm, mp4);
        incomingSlot.video.removeAttribute('poster');
        incomingSlot.video.load();
        const savedPos = videoPositions.get(project.slug);
        prepPromise = new Promise((resolve) => {
          let resolved = false;
          const finish = () => {
            if (resolved) return;
            resolved = true;
            if (Number.isFinite(savedPos) && incomingSlot.video) {
              incomingSlot.video.currentTime = savedPos;
            }
            if (incomingSlot.video) {
              incomingSlot.video.style.transition = 'none';
              incomingSlot.video.classList.add('is-visible');
              incomingSlot.video.play().catch(() => { });
            }
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                resolve();
              });
            });
          };
          if (incomingSlot.video?.readyState >= 2) {
            finish();
          } else {
            incomingSlot.video?.addEventListener('playing', finish, { once: true });
            incomingSlot.video?.addEventListener('canplay', finish, { once: true });
            incomingSlot.video?.addEventListener('loadeddata', finish, { once: true });
            window.setTimeout(finish, 140);
          }
        });
      } else if (incomingSlot.video) {
        incomingSlot.video.pause();
        incomingSlot.video.classList.remove('is-visible');
        incomingSlot.video.replaceChildren();
        incomingSlot.video.removeAttribute('poster');
      }

      prepPromise.then(() => {
        const offsetPx = calcVc(PREVIEW_SLIDER_CONFIG.descOffsetVc);
        const startY = (dir === 'next' ? 1 : -1) * offsetPx;
        if (window.gsap && metaBody) {
          window.gsap.fromTo(metaBody,
            { opacity: 0, y: startY },
            {
              opacity: 1,
              y: 0,
              duration: PREVIEW_SLIDER_CONFIG.descDurationS,
              ease: PREVIEW_SLIDER_CONFIG.descEase,
              overwrite: 'auto',
            }
          );
        }

        if (preview.name) {
          scrambleText(preview.name, project.slug, PREVIEW_SLIDER_CONFIG.scrambleDurationMs);
        }

        if (maskLine && maskTrail && incomingSlot.layer) {
          if (window.gsap) window.gsap.killTweensOf([maskLine, maskTrail]);
          maskTrail.className = 'scanline-trail ' + (dir === 'next' ? 'trail-next' : 'trail-prev');
          if (dir === 'next') {
            maskLine.style.left = '100%';
            maskTrail.style.left = '100%';
            maskTrail.style.right = 'auto';
          } else {
            maskLine.style.left = '0%';
            maskTrail.style.left = 'calc(0% - var(--mask-trail-width))';
            maskTrail.style.right = 'auto';
          }
          maskLine.style.opacity = '1';
          maskTrail.style.opacity = '1';

          const sweepDuration = PREVIEW_SLIDER_CONFIG.sweepDurationMs;
          const startTime = performance.now();

          const animateSweep = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / sweepDuration, 1);
            const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            const fadeFactor = progress > 0.65 ? Math.max(0, 1 - (progress - 0.65) / 0.4) : 1;
            maskTrail.style.opacity = String(fadeFactor);

            if (dir === 'next') {
              const pctNum = (1 - eased) * 100;
              const pct = pctNum.toFixed(2);
              maskLine.style.left = pct + '%';
              maskTrail.style.left = pct + '%';
              maskTrail.style.right = 'auto';
              if (incomingSlot.layer) incomingSlot.layer.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
            } else {
              const pctNum = eased * 100;
              const pct = pctNum.toFixed(2);
              maskLine.style.left = pct + '%';
              maskTrail.style.left = 'calc(' + pct + '% - var(--mask-trail-width))';
              maskTrail.style.right = 'auto';
              if (incomingSlot.layer) incomingSlot.layer.style.clipPath = 'inset(0 ' + (100 - pctNum).toFixed(2) + '% 0 0)';
            }

            if (progress < 1) {
              requestAnimationFrame(animateSweep);
            } else {
              if (incomingSlot.layer) incomingSlot.layer.style.clipPath = 'none';

              const completeSweep = () => {
                if (activeSlot.video) {
                  if (loadedVideoSlug && Number.isFinite(preview.video.currentTime)) {
                    videoPositions.set(loadedVideoSlug, preview.video.currentTime);
                  }
                  activeSlot.video.pause();
                  activeSlot.video.classList.remove('is-visible');
                  activeSlot.video.replaceChildren();
                  activeSlot.video.removeAttribute('poster');
                }
                if (activeSlot.layer) activeSlot.layer.style.clipPath = 'inset(0 0 0 100%)';
                activeIsA = !activeIsA;
                preview.video = (activeIsA ? slotA : slotB).video;
                preview.picture = (activeIsA ? slotA : slotB).picture;
                preview.shotSrc = (activeIsA ? slotA : slotB).src;
                preview.shotImg = (activeIsA ? slotA : slotB).img;
                loadedVideoSlug = project.slug;
                if (incomingSlot.video) {
                  incomingSlot.video.style.transition = '';
                }
                isAnimating = false;
                previewFrame?.classList.remove('is-animating');
              };

              if (window.gsap) {
                window.gsap.to([maskLine, maskTrail], {
                  opacity: 0,
                  duration: PREVIEW_SLIDER_CONFIG.trailFadeDurationS,
                  ease: 'power2.out',
                  onComplete: completeSweep,
                });
              } else {
                maskLine.style.opacity = '0';
                maskTrail.style.opacity = '0';
                completeSweep();
              }
            }
          };

          requestAnimationFrame(animateSweep);
        }

        window.setTimeout(() => {
          updateTextDetails(project);
        }, 40);
      });

      if (scroll) scrollToPreview();
      return true;
    }

    function scrollToPreview(target = (window.innerWidth < 960 ? (previewFrame || document.getElementById('preview')) : (document.getElementById('preview') || previewFrame))) {
      if (!target) return;
      const isMobile = window.innerWidth < 960;
      const statusbar = /** @type {HTMLElement | null} */ (document.querySelector(isMobile ? '.statusbar.mobile-only' : '.statusbar'));
      const headerHeight = statusbar ? statusbar.getBoundingClientRect().height : 0;
      const extraOffset = isMobile ? 8 : 16;
      const offset = -(headerHeight + extraOffset);

      if (lenis) {
        lenis.scrollTo(target, {
          offset,
          duration: reduceMotion.matches ? 0 : 0.8,
        });
        return;
      }
      const targetY = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0) + offset;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: reduceMotion.matches ? 'auto' : 'smooth',
      });
    }

    // Миниатюры меняют активный проект; на мобилке также плавно прокручивают к слайдеру.
    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener('click', (e) => {
        if (stripDraggable && (stripDraggable.isDragging || stripDraggable.isThrowing || stripDraggable.timeSinceDrag() < 0.1)) {
          e.preventDefault();
          return;
        }
        if (isAnimating || thumbnail.dataset.slug === currentSlug) {
          e.preventDefault();
          return;
        }
        const shouldScroll = window.innerWidth < 960;
        const previousSlug = currentSlug;
        setActive(thumbnail.dataset.slug, { scroll: shouldScroll });
        if (currentSlug !== previousSlug && currentSlug === thumbnail.dataset.slug) {
          confirmClick(thumbnail);
        }
      });
    });

    const onPrevClick = (/** @type {Event} */ e) => {
      e.preventDefault();
      const idx = currentPageData.projects.findIndex((p) => p.slug === currentSlug);
      const prevIdx = (idx - 1 + currentPageData.projects.length) % currentPageData.projects.length;
      if (setActive(currentPageData.projects[prevIdx].slug, { direction: 'prev' })) confirmClick(btnPrev);
    };
    const onNextClick = (/** @type {Event} */ e) => {
      e.preventDefault();
      const idx = currentPageData.projects.findIndex((p) => p.slug === currentSlug);
      const nextIdx = (idx + 1) % currentPageData.projects.length;
      if (setActive(currentPageData.projects[nextIdx].slug, { direction: 'next' })) confirmClick(btnNext);
    };
    btnPrev?.addEventListener('click', onPrevClick);
    btnNext?.addEventListener('click', onNextClick);

    const onKeydown = (/** @type {KeyboardEvent} */ e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') {
        const idx = currentPageData.projects.findIndex((p) => p.slug === currentSlug);
        const prevIdx = (idx - 1 + currentPageData.projects.length) % currentPageData.projects.length;
        setActive(currentPageData.projects[prevIdx].slug, { direction: 'prev' });
      } else if (e.key === 'ArrowRight') {
        const idx = currentPageData.projects.findIndex((p) => p.slug === currentSlug);
        const nextIdx = (idx + 1) % currentPageData.projects.length;
        setActive(currentPageData.projects[nextIdx].slug, { direction: 'next' });
      }
    };
    window.addEventListener('keydown', onKeydown);

    let swipeStartX = 0;
    let swipeStartY = 0;
    let isSwiping = false;

    function handleSwipeStart(x, y) {
      isSwiping = true;
      swipeStartX = x;
      swipeStartY = y;
    }

    function handleSwipeEnd(x, y) {
      if (!isSwiping) return;
      isSwiping = false;

      const diffX = x - swipeStartX;
      const diffY = y - swipeStartY;
      const threshold = PREVIEW_SLIDER_CONFIG.swipeThresholdPx;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) >= threshold) {
        const idx = currentPageData.projects.findIndex((p) => p.slug === currentSlug);
        if (diffX < 0) {
          const nextIdx = (idx + 1) % currentPageData.projects.length;
          setActive(currentPageData.projects[nextIdx].slug, { direction: 'next' });
        } else {
          const prevIdx = (idx - 1 + currentPageData.projects.length) % currentPageData.projects.length;
          setActive(currentPageData.projects[prevIdx].slug, { direction: 'prev' });
        }
      }
    }

    if (mediaBox) {
      mediaBox.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        handleSwipeStart(e.clientX, e.clientY);
        try {
          mediaBox.setPointerCapture(e.pointerId);
        } catch (_) { }
      });

      mediaBox.addEventListener('pointerup', (e) => {
        try {
          mediaBox.releasePointerCapture(e.pointerId);
        } catch (_) { }
        handleSwipeEnd(e.clientX, e.clientY);
      });

      mediaBox.addEventListener('pointercancel', (e) => {
        try {
          mediaBox.releasePointerCapture(e.pointerId);
        } catch (_) { }
        isSwiping = false;
      });

      mediaBox.addEventListener('dragstart', (e) => e.preventDefault());
    }

    let resizeTimer;
    const onWindowResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        calculateMaxHeight();
        if (filtersDraggable) {
          filtersDraggable.applyBounds(getFiltersBounds());
          filtersDraggable.update();
        }
        if (stripDraggable) {
          stripDraggable.applyBounds(getTrackBounds());
          stripDraggable.update();
        }
        const activeThumb = thumbnails.find((t) => t.dataset.slug === currentSlug);
        if (activeThumb) smoothScrollThumbnails(activeThumb);
      }, 60);
    };
    window.addEventListener('resize', onWindowResize);

    // Возвращаем функцию очистки наружу, чтобы следующий PJAX-экран не оставил
    // обработчики и сетевые загрузки у удалённых DOM-элементов.
    disposePreviewMedia = () => {
      observer?.disconnect();
      preloadObserver?.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      preview.video?.removeEventListener('loadeddata', onVideoReady);
      preview.video?.removeEventListener('canplay', onVideoReady);
      preview.video?.removeEventListener('error', onVideoError);
      slotA.video?.removeEventListener('loadeddata', onVideoReady);
      slotA.video?.removeEventListener('canplay', onVideoReady);
      slotA.video?.removeEventListener('error', onVideoError);
      slotB.video?.removeEventListener('loadeddata', onVideoReady);
      slotB.video?.removeEventListener('canplay', onVideoReady);
      slotB.video?.removeEventListener('error', onVideoError);
      pauseVideo();
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('keydown', onKeydown);
      strip?.removeEventListener('wheel', onStripWheel);
      btnPrev?.removeEventListener('click', onPrevClick);
      btnNext?.removeEventListener('click', onNextClick);
      const clone = document.getElementById('preview-measurer-clone');
      if (clone) clone.remove();
      if (filtersDraggable) {
        filtersDraggable.kill();
        filtersDraggable = null;
      }
      if (stripDraggable) {
        stripDraggable.kill();
        stripDraggable = null;
      }
      if (window.gsap) {
        window.gsap.killTweensOf([maskLine, maskTrail, track, metaBody, filtersTrack]);
      }
      previewFrame?.classList.remove('is-animating');
    };

    // клик по строке / карточке -> preview (но не по вложенной ссылке "open")
    function wireRow(projectElement) {
      projectElement.addEventListener('click', (event) => {
        if (event.target.closest('a')) return;
        if (setActive(projectElement.dataset.slug, { scroll: true })) confirmClick(projectElement);
      });
    }
    rows.forEach(wireRow);
    cards.forEach(wireRow);

    calculateMaxHeight();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        calculateMaxHeight();
      });
    }
    requestAnimationFrame(() => {
      calculateMaxHeight();
    });

    // После PJAX возвращаем выбранный фильтр и проект, если они существуют
    // в текущей языковой версии/на текущей странице.
    if (activeFilter !== 'all') {
      applyFilter(activeFilter);
    }
    if (currentSlug && projectsBySlug.has(currentSlug)) {
      setActive(currentSlug, { animate: false });
    } else if (currentPageData.projects[0]) {
      setActive(currentPageData.projects[0].slug, { animate: false });
    }

    // Изменившийся контент влияет на вычисленную длину smooth-scroll.
    lenis?.resize?.();
  }

  // Первая привязка для HTML, отрендеренного при начальной загрузке.
  bindPageInteractivity(pageData);

  // ---------------------------------------------------------------- PJAX навигация
  createPjaxRouter({
    onNavigate: ({ bootData }) => {
      bindPageInteractivity(bootData || window.__PORTFOLIO__);
    },
  });
})();
