// Прогрессивное усиление. Разметка уже отрендерена на сборке — здесь только поведение:
// фильтры works, смена кадра в // preview, клик по строке -> preview.

import { createPlaylistPlayer } from './audio-player.js';
import { bindAudioControls, bindAudioVisualizer } from './audio-controls.js';
import { createAudioVisualizer } from './audio-visualizer.js';
import { createPjaxRouter } from './pjax.js';

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

    // Браузеры разрешают звук только после жеста пользователя. Если посетитель
    // ранее включал музыку, возобновляем её при первом клике вне переключателя.
    if (player.hasStoredEnabledPreference()) {
      window.addEventListener('pointerdown', (event) => {
        if (event.target instanceof Element && event.target.closest('[data-audio-toggle]')) return;
        player.start().catch(() => {});
      }, { once: true, passive: true });
    }

    // AudioContext тоже может быть заблокирован до жеста или при скрытой вкладке.
    // Здесь отдельно поддерживается визуализатор и сам проигрыватель.
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
      easing: (progress) => Math.min(1, 1.001 - Math.pow(2, -10 * progress)),
    });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  // ---------------------------------------------------------------- интерактивность страницы
  // Состояние выбирается независимо от DOM, чтобы его можно было восстановить
  // после PJAX-навигации, когда элементы страницы пересоздаются.
  let currentSlug = pageData.projects[0] ? pageData.projects[0].slug : null;
  let activeFilter = 'all';
  let disposePreviewMedia = () => {};
  const videoPositions = new Map();

  function bindPageInteractivity(currentPageData) {
    if (!currentPageData) return;

    // При PJAX-навигации снимаем старые observers и обработчики, прежде чем
    // привязать их к новой разметке.
    disposePreviewMedia();

    // Быстрый доступ к проекту по slug вместо поиска по массиву при каждом клике.
    const projectsBySlug = new Map(currentPageData.projects.map((project) => [project.slug, project]));
    const rows = queryAll('[data-rows] .works-row');
    const cards = queryAll('[data-cards] .works-card');
    const chips = queryAll('.chip');

    function matches(projectElement, filter) {
      // Кнопка all не фильтрует; остальные сравниваются с категориями из data-атрибута.
      if (filter === 'all') return true;
      return (projectElement.dataset.categories || '').split(/\s+/).includes(filter);
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
      chip.addEventListener('click', () => applyFilter(chip.dataset.filter));
    });

    // ---------------------------------------------------------------- preview
    // Все части preview собраны в объект, чтобы смена проекта обновляла один
    // согласованный набор DOM-элементов.
    const preview = {
      slug: query('[data-preview-slug]'),
      site: query('[data-preview-site]'),
      open: query('[data-preview-open]'),
      shotSrc: query('[data-preview-shot-source]'),
      shotImg: query('[data-preview-shot-image]'),
      picture: query('[data-preview-picture]'),
      video: query('[data-preview-video]'),
      name: query('[data-preview-name]'),
      star: query('[data-preview-star]'),
      sub: query('[data-preview-subtitle]'),
      description: query('[data-preview-description]'),
      tags: query('[data-preview-tags]'),
      cta: query('[data-preview-call-to-action]'),
      note: query('[data-preview-note]'),
      noteText: query('[data-preview-note-text]'),
      awards: query('[data-preview-awards]'),
      awardsText: query('[data-preview-awards-text]'),
    };
    const thumbnails = queryAll('.preview-thumbnail');
    const previewFrame = query('.preview-frame');
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
      preview.video.poster = project.shot;
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
      if (loadedVideoSlug !== currentSlug || !preview.video) return;
      syncPreviewMedia();
    };
    const onVideoError = showImage;
    preview.video?.addEventListener('loadeddata', onVideoReady);
    preview.video?.addEventListener('canplay', onVideoReady);
    preview.video?.addEventListener('error', onVideoError);
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
    // Возвращаем функцию очистки наружу, чтобы следующий PJAX-экран не оставил
    // обработчики и сетевые загрузки у удалённых DOM-элементов.
    disposePreviewMedia = () => {
      observer?.disconnect();
      preloadObserver?.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      preview.video?.removeEventListener('loadeddata', onVideoReady);
      preview.video?.removeEventListener('canplay', onVideoReady);
      preview.video?.removeEventListener('error', onVideoError);
      pauseVideo();
    };

    function setActive(slug, { scroll = false } = {}) {
      // Это единственная точка смены проекта: она обновляет данные, выделение
      // в списках и состояние медиа одновременно.
      const project = projectsBySlug.get(slug);
      if (!project) return;
      currentSlug = slug;

      if (preview.slug) preview.slug.textContent = project.slug;
      if (preview.site) preview.site.textContent = project.site;
      if (preview.open) preview.open.href = project.url;
      if (preview.shotSrc) {
        // Единственный современный <source>: и type, и srcset берутся из
        // манифеста сборки (какой формат — avif/webp — оказался легче).
        preview.shotSrc.setAttribute('type', project.shotModType);
        preview.shotSrc.setAttribute('srcset', project.shotMod);
      }
      if (preview.shotImg) {
        preview.shotImg.src = project.shot;
        preview.shotImg.alt = project.slug;
      }
      showImage();
      if (preview.name) preview.name.textContent = project.slug;
      if (preview.star) preview.star.hidden = !project.star;
      if (preview.sub) preview.sub.textContent = `${project.client} · ${project.year}`;
      if (preview.description) preview.description.textContent = project.description;
      if (preview.tags) {
        // Теги пересоздаются, потому что их количество и текст меняются у проекта.
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

      thumbnails.forEach((thumbnail) => {
        const isActive = thumbnail.dataset.slug === slug;
        thumbnail.classList.toggle('is-active', isActive);
        thumbnail.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      [...rows, ...cards].forEach((projectElement) =>
        projectElement.classList.toggle('is-active', projectElement.dataset.slug === slug)
      );

      // После обновления данных перепроверяем: может понадобиться включить новое
      // видео или вернуть фолбэк-картинку.
      syncPreviewMedia();

      if (scroll) scrollToPreview();
    }

    function scrollToPreview() {
      // Используем Lenis, если он активен, чтобы клик и колесо имели одинаковую
      // плавность; иначе оставляем нативное поведение браузера.
      const previewElement = document.getElementById('preview');
      if (!previewElement) return;
      if (lenis) {
        lenis.scrollTo(previewElement, { offset: 0 });
        return;
      }
      previewElement.scrollIntoView({
        behavior: reduceMotion.matches ? 'auto' : 'smooth',
        block: 'start',
      });
    }

    // Миниатюры меняют активный проект, не прокручивая страницу.
    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener('click', () => setActive(thumbnail.dataset.slug));
    });

    // клик по строке / карточке -> preview (но не по вложенной ссылке "open")
    function wireRow(projectElement) {
      projectElement.addEventListener('click', (event) => {
        if (event.target.closest('a')) return;
        setActive(projectElement.dataset.slug, { scroll: true });
      });
    }
    rows.forEach(wireRow);
    cards.forEach(wireRow);

    // После PJAX возвращаем выбранный фильтр и проект, если они существуют
    // в текущей языковой версии/на текущей странице.
    if (activeFilter !== 'all') {
      applyFilter(activeFilter);
    }
    if (currentSlug && projectsBySlug.has(currentSlug)) {
      setActive(currentSlug);
    } else if (currentPageData.projects[0]) {
      setActive(currentPageData.projects[0].slug);
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
