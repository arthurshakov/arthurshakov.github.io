import { createPageLifetime } from './page-lifetime.js';
import { query, queryAll } from './dom.js';
import { confirmClick } from './click-sound.js';
import { PREVIEW_SLIDER_CONFIG } from './preview-slider.js';
import { calcVc } from './viewport-scale.js';
import { createPreviewDetails } from './preview-details.js';
import { createDraggableStrip } from './draggable-strip.js';

/**
 * @param {any} currentPageData
 * @param {{ lenis?: any, currentSlug?: string | null, onSelect?: (slug: string) => void, videoPositions?: Map<string, number>, reduceMotion?: MediaQueryList }} [options]
 */
export function createProjectPreview(currentPageData, {
  lenis = null,
  currentSlug = null,
  onSelect = (slug) => { },
  videoPositions = new Map(),
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)'),
} = {}) {
  const lifetime = createPageLifetime();
  let incomingVideoSlug = null;
  let incomingVideoPrepared = false;
  const projectsBySlug = new Map(currentPageData.projects.map((project) => [project.slug, project]));
  const DraggableClass = /** @type {any} */ (window).Draggable;
  const rows = queryAll('[data-rows] .works-row');
  const cards = queryAll('[data-cards] .works-card');
  const previewAnnouncer = query('[data-preview-announcer]');
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
    spinner: /** @type {HTMLElement | null} */ (query('[data-preview-spinner-a]')),
    spinnerSlug: query('[data-preview-spinner-slug-a]'),
    spinnerGlyph: query('[data-preview-spinner-glyph-a]'),
    spinnerText: query('[data-preview-spinner-text-a]'),
    spinnerBar: query('[data-preview-spinner-bar-a]'),
  };
  const slotB = {
    layer: layerB,
    picture: /** @type {HTMLElement | null} */ (query('[data-preview-picture-b]')),
    src: /** @type {HTMLSourceElement | null} */ (query('[data-preview-shot-source-b]')),
    img: /** @type {HTMLImageElement | null} */ (query('[data-preview-shot-image-b]')),
    video: /** @type {any} */ (query('[data-preview-video-b]')),
    spinner: /** @type {HTMLElement | null} */ (query('[data-preview-spinner-b]')),
    spinnerSlug: query('[data-preview-spinner-slug-b]'),
    spinnerGlyph: query('[data-preview-spinner-glyph-b]'),
    spinnerText: query('[data-preview-spinner-text-b]'),
    spinnerBar: query('[data-preview-spinner-bar-b]'),
  };

  let activeIsA = true;
  let isAnimating = false;
  preview.video = slotA.video;
  preview.picture = slotA.picture;
  preview.shotSrc = slotA.src;
  preview.shotImg = slotA.img;

  const SPINNER_GLYPHS = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  function formatProgressBar(pct) {
    const totalBlocks = 14;
    const filled = Math.min(totalBlocks, Math.floor((pct / 100) * totalBlocks));
    const empty = Math.max(0, totalBlocks - filled);
    return '[' + '▓'.repeat(filled) + '░'.repeat(empty) + '] ' + pct + '%';
  }

  /** @type {{ accelerate: () => void, cancel: () => void, isCompleted: () => boolean } | null} */
  let activeSlotProgress = null;
  /** @type {{ accelerate: () => void, cancel: () => void, isCompleted: () => boolean } | null} */
  let incomingSlotProgress = null;
  const fullyLoadedVideos = new Set();

  function stopSpinner(slot) {
    if (!slot) return;
    if (slot === slotA && activeIsA && activeSlotProgress) {
      activeSlotProgress.cancel();
      activeSlotProgress = null;
    } else if (slot === slotB && !activeIsA && activeSlotProgress) {
      activeSlotProgress.cancel();
      activeSlotProgress = null;
    }
    if (slot.spinner) {
      slot.spinner.classList.remove('is-visible');
    }
  }

  /**
   * @param {any} slot
   * @param {string} slug
   * @param {(() => void) | undefined} [onComplete]
   */
  function startSpinner(slot, slug, onComplete) {
    if (!slot || !slot.spinner || reduceMotion.matches) return null;

    if (slot.spinnerSlug) slot.spinnerSlug.textContent = slug;
    if (slot.spinnerText) slot.spinnerText.textContent = 'BUFFERING_STREAM';
    if (slot.spinnerBar) slot.spinnerBar.textContent = formatProgressBar(0);
    slot.spinner.classList.add('is-visible');

    let percent = 0;
    let isFastForward = false;
    let active = true;
    /** @type {number | undefined} */
    let timer = undefined;
    let glyphIdx = 0;
    /** @type {number | undefined} */
    let glyphTimer = undefined;
    const updateGlyph = () => {
      if (!active || lifetime.disposed) return;
      glyphIdx = (glyphIdx + 1) % SPINNER_GLYPHS.length;
      if (slot.spinnerGlyph) slot.spinnerGlyph.textContent = SPINNER_GLYPHS[glyphIdx];
      glyphTimer = lifetime.timeout(updateGlyph, 80);
    };
    glyphTimer = lifetime.timeout(updateGlyph, 80);

    const step = () => {
      if (!active || lifetime.disposed) return;

      if (isFastForward) {
        const remaining = 100 - percent;
        const jump = Math.max(3, Math.ceil(remaining * 0.38));
        percent = Math.min(100, percent + jump);
        if (slot.spinnerBar) slot.spinnerBar.textContent = formatProgressBar(percent);

        if (percent >= 100) {
          active = false;
          lifetime.clearTimeout(glyphTimer);
          if (slot.spinnerText) slot.spinnerText.textContent = 'STREAM_READY';
          if (onComplete) onComplete();
          return;
        }
        timer = lifetime.timeout(step, 22);
      } else {
        if (percent < 85) {
          const factor = (88 - percent) / 88;
          const inc = Math.max(1, Math.round(factor * 5));
          percent += inc;
          if (slot.spinnerBar) slot.spinnerBar.textContent = formatProgressBar(percent);
        }
        const delay = 35 + Math.random() * 20;
        timer = lifetime.timeout(step, delay);
      }
    };

    step();

    return {
      accelerate: () => {
        isFastForward = true;
      },
      cancel: () => {
        active = false;
        lifetime.clearTimeout(timer);
        lifetime.clearTimeout(glyphTimer);
      },
      isCompleted: () => percent >= 100,
    };
  }

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
    if (lifetime.disposed) return;
    if (isAnimating) return;
    // Скриншот — универсальный фолбэк: для проектов без ролика, reduce-motion,
    // скрытого превью, неактивной вкладки и ошибки загрузки.
    if (preview.video) {
      pauseVideo();
      revealRequest += 1;
      preview.video.classList.remove('is-visible');
    }
    activeSlotProgress?.cancel();
    activeSlotProgress = null;
    incomingSlotProgress?.cancel();
    incomingSlotProgress = null;
    stopSpinner(slotA);
    stopSpinner(slotB);
    if (preview.picture) {
      preview.picture.hidden = false;
      preview.picture.style.opacity = '1';
    }
  }

  function loadVideo(project) {
    // Источники добавляются лениво, только для выбранного проекта: иначе
    // браузер загрузил бы ролики всех карточек сразу.
    if (!preview.video || !project.video || (loadedVideoSlug === project.slug && preview.video.childElementCount > 0)) return;
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
    const currentSlot = activeIsA ? slotA : slotB;

    const showVideoFrame = () => {
      lifetime.frame(() => {
        if (request === revealRequest) {
          if (loadedVideoSlug) fullyLoadedVideos.add(loadedVideoSlug);
          preview.video?.classList.add('is-visible');
          lifetime.timeout(() => {
            currentSlot.spinner?.classList.remove('is-visible');
          }, 120);
        }
      });
    };

    if (activeSlotProgress && !activeSlotProgress.isCompleted()) {
      const accelerateToFinish = () => {
        activeSlotProgress?.accelerate();
      };
      if ('requestVideoFrameCallback' in preview.video) {
        let fired = false;
        preview.video.requestVideoFrameCallback(() => {
          if (fired) return;
          fired = true;
          accelerateToFinish();
        });
        lifetime.timeout(() => {
          if (fired) return;
          fired = true;
          accelerateToFinish();
        }, 120);
      } else {
        lifetime.timeout(accelerateToFinish, 60);
      }
    } else {
      showVideoFrame();
    }
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
    if (lifetime.disposed) return;
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

    const currentSlot = activeIsA ? slotA : slotB;
    if (currentSlot.picture) {
      currentSlot.picture.style.opacity = '0';
    }

    const isAlreadyLoaded = fullyLoadedVideos.has(project.slug);
    const isVideoVisible = Boolean(preview.video?.classList?.contains?.('is-visible'));

    if (isAlreadyLoaded) {
      stopSpinner(currentSlot);
      if (!isVideoVisible && preview.video?.readyState >= 2) {
        preview.video.classList.add('is-visible');
      }
    } else if (!isVideoVisible && !activeSlotProgress) {
      activeSlotProgress = startSpinner(currentSlot, project.slug, () => {
        fullyLoadedVideos.add(project.slug);
        lifetime.timeout(() => {
          lifetime.frame(() => {
            preview.video?.classList.add('is-visible');
            lifetime.timeout(() => {
              currentSlot.spinner?.classList.remove('is-visible');
            }, 120);
          });
        }, 80);
      });
    }

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
    if (lifetime.disposed) return;
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
  lifetime.listen(preview.video, 'loadeddata', onVideoReady);
  lifetime.listen(preview.video, 'canplay', onVideoReady);
  lifetime.listen(preview.video, 'error', onVideoError);
  lifetime.listen(slotB.video, 'loadeddata', onVideoReady);
  lifetime.listen(slotB.video, 'canplay', onVideoReady);
  lifetime.listen(slotB.video, 'error', onVideoError);

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
  lifetime.listen(document, 'visibilitychange', onVisibilityChange);

  const details = createPreviewDetails(currentPageData, preview, infoBox);
  const { scrambleText, calculateMaxHeight, updateTextDetails } = details;

  const stripManager = createDraggableStrip(strip, track, {
    enableWheel: true,
    edgeResistance: PREVIEW_SLIDER_CONFIG.stripEdgeResistance,
    throwResistance: PREVIEW_SLIDER_CONFIG.stripThrowResistance,
  });

  /**
   * @param {string} slug
   * @param {{ direction?: 'next' | 'prev' | string, scroll?: boolean, animate?: boolean }} [options]
   */
  function setActive(slug, { direction, scroll = false, animate = true } = {}) {
    if (lifetime.disposed) return false;
    const project = projectsBySlug.get(slug);
    if (!project) return;
    if (animate && slug === currentSlug) {
      if (scroll) scrollToPreview();
      if (scroll && !reduceMotion.matches && !document.hidden) {
        syncPreviewMedia();
      }
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
    [...rows, ...cards].forEach((projectElement) => {
      const isActive = projectElement.dataset.slug === slug;
      projectElement.classList.toggle('is-active', isActive);
      projectElement.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    document.querySelectorAll('.works-row__btn').forEach((btn) => {
      const row = btn.closest('.works-row');
      const isActive = row instanceof HTMLElement && row.dataset.slug === slug;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (counter) {
      const num = String(targetIndex + 1).padStart(2, '0');
      const total = String(currentPageData.projects.length).padStart(2, '0');
      counter.innerHTML = '[ <span class="preview-stepper-counter__current">' + num + '</span> / ' + total + ' ]';
    }

    if (previewAnnouncer && currentPageData.t?.previewAnnounce) {
      previewAnnouncer.textContent = currentPageData.t.previewAnnounce
        .replace('{slug}', project.slug)
        .replace('{index}', String(targetIndex + 1))
        .replace('{total}', String(currentPageData.projects.length));
    }

    if (!stripManager.isInteracting()) {
      stripManager.smoothScrollTo(thumbnails[targetIndex]);
    }

    if (!animate || reduceMotion.matches) {
      currentSlug = slug;
      onSelect(slug);
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
    onSelect(slug);
    isAnimating = true;
    previewFrame?.classList.add('is-animating');
    const activeSlot = activeIsA ? slotA : slotB;
    const incomingSlot = activeIsA ? slotB : slotA;

    if (incomingSlot.layer) {
      incomingSlot.layer.style.clipPath = dir === 'next' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
      incomingSlot.layer.style.zIndex = '2';
    }
    if (activeSlot.layer) activeSlot.layer.style.zIndex = '1';

    const isAlreadyLoaded = fullyLoadedVideos.has(project.slug);

    if (incomingSlot.picture) {
      incomingSlot.picture.style.opacity = isAlreadyLoaded ? '1' : '0';
    }
    if (incomingSlot.src) {
      incomingSlot.src.setAttribute('type', project.shotModType);
      incomingSlot.src.setAttribute('srcset', project.shotMod);
    }
    if (incomingSlot.img) {
      const img = incomingSlot.img;
      const targetSlug = project.slug;
      
      const onLoad = () => {
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onLoad);
        if (img.alt === targetSlug && incomingSlot.picture && (isAlreadyLoaded || reduceMotion.matches || !project.video)) {
          incomingSlot.picture.style.opacity = '1';
        }
      };
      
      img.addEventListener('load', onLoad);
      img.addEventListener('error', onLoad);
      
      img.src = project.shot;
      img.alt = project.slug;
      
      lifetime.frame(() => {
        if (img.complete && img.naturalWidth > 0 && img.alt === targetSlug && incomingSlot.picture && (isAlreadyLoaded || reduceMotion.matches || !project.video)) {
          incomingSlot.picture.style.opacity = '1';
          img.removeEventListener('load', onLoad);
          img.removeEventListener('error', onLoad);
        }
      });
    }

    incomingVideoSlug = null;
    incomingVideoPrepared = false;
    incomingSlotProgress?.cancel();
    incomingSlotProgress = null;

    let prepPromise = Promise.resolve();
    if (incomingSlot.video && project.video && project.video.webm && (previewVisible || scroll) && !reduceMotion.matches && !document.hidden) {
      incomingVideoSlug = project.slug;
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

      const isAlreadyLoaded = fullyLoadedVideos.has(project.slug);
      if (!isAlreadyLoaded) {
        incomingSlotProgress = startSpinner(incomingSlot, project.slug, () => {
          fullyLoadedVideos.add(project.slug);
          lifetime.timeout(() => {
            lifetime.frame(() => {
              if (incomingSlot.video) {
                incomingSlot.video.classList.add('is-visible');
                lifetime.timeout(() => {
                  incomingSlot.spinner?.classList.remove('is-visible');
                }, 120);
              }
            });
          }, 80);
        });
      } else {
        stopSpinner(incomingSlot);
      }

      prepPromise = new Promise((resolve) => {
        let resolved = false;
        const removeReadyListeners = [];
        let preparationTimer;
        const finish = () => {
          if (resolved || lifetime.disposed) return;
          resolved = true;
          lifetime.clearTimeout(preparationTimer);
          removeReadyListeners.forEach(remove => remove());
          
          const isReady = incomingSlot.video && incomingSlot.video.readyState >= 1;
          
          if (Number.isFinite(savedPos) && isReady) {
            incomingSlot.video.currentTime = savedPos;
          }
          restoredVideoSlug = project.slug;
          incomingVideoPrepared = true;

          const accelerateWhenReady = () => {
            if (incomingSlotProgress) {
              if ('requestVideoFrameCallback' in incomingSlot.video) {
                let fired = false;
                incomingSlot.video.requestVideoFrameCallback(() => {
                  if (fired) return;
                  fired = true;
                  incomingSlotProgress?.accelerate();
                });
                lifetime.timeout(() => {
                  if (fired) return;
                  fired = true;
                  incomingSlotProgress?.accelerate();
                }, 120);
              } else {
                lifetime.timeout(() => incomingSlotProgress?.accelerate(), 60);
              }
            }
          };

          if (isAlreadyLoaded) {
            const onFrameReady = () => {
              if (incomingSlot.video) {
                incomingSlot.video.classList.add('is-visible');
              }
              stopSpinner(incomingSlot);
              lifetime.frame(() => {
                lifetime.frame(() => {
                  resolve();
                });
              });
            };

            const startPlayback = () => {
              if (!incomingSlot.video) {
                resolve();
                return;
              }
              incomingSlot.video.style.transition = 'none';
              incomingSlot.video.play().then(() => {
                if ('requestVideoFrameCallback' in incomingSlot.video) {
                  let fired = false;
                  incomingSlot.video.requestVideoFrameCallback(() => {
                    if (fired) return;
                    fired = true;
                    onFrameReady();
                  });
                  lifetime.timeout(() => {
                    if (fired) return;
                    fired = true;
                    onFrameReady();
                  }, 80);
                } else {
                  onFrameReady();
                }
              }).catch(() => {
                onFrameReady();
              });
            };

            if (incomingSlot.video?.seeking) {
              const onSeeked = () => {
                incomingSlot.video?.removeEventListener?.('seeked', onSeeked);
                startPlayback();
              };
              incomingSlot.video.addEventListener?.('seeked', onSeeked, { once: true });
              lifetime.timeout(onSeeked, 80);
            } else {
              startPlayback();
            }
          } else {
            if (incomingSlot.video) {
              incomingSlot.video.style.transition = 'none';
              if (incomingSlot.video.readyState >= 2) {
                incomingSlot.video.play().then(accelerateWhenReady).catch(() => {
                  incomingSlotProgress?.accelerate();
                });
              } else {
                const onCanPlay = () => {
                  incomingSlot.video.removeEventListener('canplay', onCanPlay);
                  incomingSlot.video.play().then(accelerateWhenReady).catch(() => {
                    incomingSlotProgress?.accelerate();
                  });
                };
                incomingSlot.video.addEventListener('canplay', onCanPlay, { once: true });
              }
            }
            lifetime.frame(() => {
              lifetime.frame(() => {
                resolve();
              });
            });
          }
        };
        if (incomingSlot.video?.readyState >= 2) {
          finish();
        } else {
          removeReadyListeners.push(lifetime.listen(incomingSlot.video, 'playing', finish, { once: true }));
          removeReadyListeners.push(lifetime.listen(incomingSlot.video, 'canplay', finish, { once: true }));
          removeReadyListeners.push(lifetime.listen(incomingSlot.video, 'loadeddata', finish, { once: true }));
          preparationTimer = lifetime.timeout(finish, 140);
        }
      });
    } else if (incomingSlot.video) {
      incomingSlot.video.pause();
      incomingSlot.video.classList.remove('is-visible');
      incomingSlot.video.replaceChildren();
      incomingSlot.video.removeAttribute('poster');
      stopSpinner(incomingSlot);
    }

    prepPromise.then(() => {
      if (lifetime.disposed) return;
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
          if (lifetime.disposed) return;
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
            lifetime.frame(animateSweep);
          } else {
            if (incomingSlot.layer) incomingSlot.layer.style.clipPath = 'none';

            const completeSweep = () => {
              if (lifetime.disposed) return;
              if (activeSlot.video) {
                if (loadedVideoSlug && Number.isFinite(activeSlot.video.currentTime)) {
                  videoPositions.set(loadedVideoSlug, activeSlot.video.currentTime);
                }
                activeSlot.video.pause();
                activeSlot.video.classList.remove('is-visible');
                activeSlot.video.replaceChildren();
                activeSlot.video.removeAttribute('poster');
              }
              stopSpinner(activeSlot);
              if (activeSlot.layer) activeSlot.layer.style.clipPath = 'inset(0 0 0 100%)';
              activeIsA = !activeIsA;
              preview.video = (activeIsA ? slotA : slotB).video;
              preview.picture = (activeIsA ? slotA : slotB).picture;
              preview.shotSrc = (activeIsA ? slotA : slotB).src;
              preview.shotImg = (activeIsA ? slotA : slotB).img;
              loadedVideoSlug = incomingVideoSlug;
              incomingVideoSlug = null;
              activeSlotProgress?.cancel();
              activeSlotProgress = incomingSlotProgress;
              incomingSlotProgress = null;
              if (incomingSlot.video) {
                incomingSlot.video.style.transition = '';
              }
              isAnimating = false;
              previewFrame?.classList.remove('is-animating');
              syncPreviewMedia();
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

        lifetime.frame(animateSweep);
      }

      lifetime.timeout(() => {
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
        onComplete: () => {
          syncPreviewMedia();
        },
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
    lifetime.listen(thumbnail, 'click', (e) => {
      if (stripManager.isInteracting()) {
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

  function navigateProject(direction, triggerElement = null) {
    if (lifetime.disposed) return;
    const projects = currentPageData.projects;
    const idx = projects.findIndex((p) => p.slug === currentSlug);
    
    const targetIdx = direction === 'next' 
      ? (idx + 1) % projects.length 
      : (idx - 1 + projects.length) % projects.length;

    if (setActive(projects[targetIdx].slug, { direction })) {
      if (triggerElement) confirmClick(triggerElement);
    }
  }

  const onPrevClick = (/** @type {Event} */ e) => {
    e.preventDefault();
    navigateProject('prev', btnPrev);
  };
  const onNextClick = (/** @type {Event} */ e) => {
    e.preventDefault();
    navigateProject('next', btnNext);
  };
  lifetime.listen(btnPrev, 'click', onPrevClick);
  lifetime.listen(btnNext, 'click', onNextClick);

  const onKeydown = (/** @type {KeyboardEvent} */ e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const target = e.target instanceof Element ? e.target : null;
    const isRelevant = !target || target === document.body || Boolean(target.closest('#preview, #works, [data-preview-strip]'));
    if (!isRelevant) return;

    if (e.key === 'ArrowLeft') {
      navigateProject('prev');
    } else if (e.key === 'ArrowRight') {
      navigateProject('next');
    }
  };
  lifetime.listen(window, 'keydown', onKeydown);

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
      if (diffX < 0) {
        navigateProject('next');
      } else {
        navigateProject('prev');
      }
    }
  }

  if (mediaBox) {
    lifetime.listen(mediaBox, 'pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      handleSwipeStart(e.clientX, e.clientY);
      try {
        mediaBox.setPointerCapture(e.pointerId);
      } catch (_) { }
    });

    lifetime.listen(mediaBox, 'pointerup', (e) => {
      try {
        mediaBox.releasePointerCapture(e.pointerId);
      } catch (_) { }
      handleSwipeEnd(e.clientX, e.clientY);
    });

    lifetime.listen(mediaBox, 'pointercancel', (e) => {
      try {
        mediaBox.releasePointerCapture(e.pointerId);
      } catch (_) { }
      isSwiping = false;
    });

    lifetime.listen(mediaBox, 'dragstart', (e) => e.preventDefault());
  }

  let resizeTimer;
  const onWindowResize = () => {
    lifetime.clearTimeout(resizeTimer);
    resizeTimer = lifetime.timeout(() => {
      calculateMaxHeight();
      stripManager.update();
      const activeThumb = thumbnails.find((t) => t.dataset.slug === currentSlug);
      if (activeThumb) stripManager.smoothScrollTo(activeThumb);
    }, 60);
  };
  lifetime.listen(window, 'resize', onWindowResize);

  // Возвращаем функцию очистки наружу, чтобы следующий PJAX-экран не оставил
  // обработчики и сетевые загрузки у удалённых DOM-элементов.
  const destroy = () => {
    if (lifetime.disposed) return;
    revealRequest += 1;
    lifetime.clearTimeout(resizeTimer);
    pauseVideo();
    lifetime.destroy();
    observer?.disconnect();
    preloadObserver?.disconnect();
    // Во время перехода выбран уже входящий проект, но preview.video ещё
    // указывает на исходящий ролик. Сохраняем оба до удаления источников.
    const incomingVideo = (activeIsA ? slotB : slotA).video;
    if (incomingVideoSlug && incomingVideoPrepared && incomingVideo?.readyState >= 1 && Number.isFinite(incomingVideo.currentTime)) {
      videoPositions.set(incomingVideoSlug, incomingVideo.currentTime);
    }
    for (const slot of [slotA, slotB]) {
      if (!slot.video) continue;
      slot.video.pause();
      slot.video.replaceChildren();
      slot.video.removeAttribute('src');
      slot.video.load();
    }
    details.destroy();
    stripManager.destroy();
    if (window.gsap) {
      window.gsap.killTweensOf([maskLine, maskTrail, metaBody]);
    }
    previewFrame?.classList.remove('is-animating');
  };

  // клик по строке / карточке -> preview (но не по вложенной ссылке "open")
  function wireRow(projectElement) {
    const handleSelect = (event) => {
      if (event.target?.closest?.('a')) return;
      if (event.type === 'keydown') {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault?.();
      }
      if (setActive(projectElement.dataset.slug, { scroll: true })) confirmClick(projectElement);
    };
    lifetime.listen(projectElement, 'click', handleSelect);
    lifetime.listen(projectElement, 'keydown', handleSelect);
  }
  rows.forEach(wireRow);
  cards.forEach(wireRow);

  calculateMaxHeight();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (lifetime.disposed) return;
      calculateMaxHeight();
    });
  }
  lifetime.frame(() => {
    calculateMaxHeight();
  });

  // После смены языка восстанавливаем выбранный проект.
  if (currentSlug && projectsBySlug.has(currentSlug)) {
    setActive(currentSlug, { animate: false });
  } else if (currentPageData.projects[0]) {
    setActive(currentPageData.projects[0].slug, { animate: false });
  }

  // Изменившийся контент влияет на вычисленную длину smooth-scroll.
  lenis?.resize?.();
  return { destroy };
}
