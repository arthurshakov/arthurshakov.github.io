import { confirmClick } from './click-sound.js';

// Легковесный PJAX-модуль для бесшовных переходов между страницами.
// Перехватывает клики по внутренним ссылкам, загружает страницу через fetch,
// парсит контент и применяет View Transitions без перезагрузки страницы.

export function normalizePath(pathname) {
  if (!pathname) return '/';
  let p = pathname.replace(/\/index\.html$/, '');
  if (!p) return '/';
  if (!p.endsWith('/')) p += '/';
  return p;
}

export function parsePage(html, { parser = null } = {}) {
  if (typeof DOMParser !== 'undefined' || parser) {
    const domParser = parser || new DOMParser();
    const doc = domParser.parseFromString(html, 'text/html');

    const title = doc.title || '';
    const lang = doc.documentElement.getAttribute('lang') || 'en';
    const dir = doc.documentElement.getAttribute('dir') || 'ltr';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';

    const mainEl = doc.querySelector('.body__main');
    const mainHtml = mainEl ? mainEl.innerHTML : '';

    const statusbarLanguages = [...doc.querySelectorAll('.statusbar-language')].map(
      (el) => el.innerHTML
    );

    const metaContents = [...doc.querySelectorAll('.statusbar-meta__content')].map((el) => {
      const first = el.querySelector(':scope > span:first-child');
      return first ? first.textContent : '';
    });

    const audioControl = doc.querySelector('[data-audio-toggle]');
    const audioLabels = audioControl
      ? {
          on: audioControl.getAttribute('data-audio-label-on') || '',
          off: audioControl.getAttribute('data-audio-label-off') || '',
          start: audioControl.getAttribute('data-audio-start') || '',
          stop: audioControl.getAttribute('data-audio-stop') || '',
        }
      : null;

    let bootData = null;
    for (const script of doc.querySelectorAll('script')) {
      const match = (script.textContent || '').match(/window\.__PORTFOLIO__\s*=\s*(\{[\s\S]*?\});/);
      if (match) {
        try {
          bootData = JSON.parse(match[1]);
          break;
        } catch {
          // ignore parse error
        }
      }
    }

    return {
      title,
      lang,
      dir,
      description,
      mainHtml,
      statusbarLanguages,
      metaContents,
      audioLabels,
      bootData,
    };
  }

  // Фолбэк для окружений без DOMParser (например, unit-тесты в чистом Node.js)
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const langMatch = html.match(/<html[^>]*\blang=["']([^"']*)["']/i);
  const dirMatch = html.match(/<html[^>]*\bdir=["']([^"']*)["']/i);
  const descMatch = html.match(/<meta[^>]*\bname=["']description["'][^>]*\bcontent=["']([^"']*)["']/i);
  const mainMatch = html.match(/<main[^>]*class=["'][^"']*body__main[^"']*["'][^>]*>([\s\S]*?)<\/main>/i);
  const bootMatch = html.match(/window\.__PORTFOLIO__\s*=\s*(\{[\s\S]*?\});/);
  const langPillMatches = [
    ...html.matchAll(/<(?:span|nav)[^>]*class=["'][^"']*statusbar-language[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|nav)>/g),
  ].map((m) => m[1]);
  const audioToggleMatch = html.match(/<button[^>]*data-audio-toggle[^>]*>/i);
  /** @type {{ on: string, off: string, start: string, stop: string } | null} */
  let audioLabels = null;
  if (audioToggleMatch) {
    const tag = audioToggleMatch[0];
    const getAttr = (name) => {
      const m = tag.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'));
      return m ? m[1] : '';
    };
    audioLabels = {
      on: getAttr('data-audio-label-on'),
      off: getAttr('data-audio-label-off'),
      start: getAttr('data-audio-start'),
      stop: getAttr('data-audio-stop'),
    };
  }

  /** @type {any} */
  let bootData = null;
  if (bootMatch) {
    try {
      bootData = JSON.parse(bootMatch[1]);
    } catch {
      // ignore
    }
  }

  return {
    title: titleMatch ? titleMatch[1] : '',
    lang: langMatch ? langMatch[1] : 'en',
    dir: dirMatch ? dirMatch[1] : 'ltr',
    description: descMatch ? descMatch[1] : '',
    mainHtml: mainMatch ? mainMatch[1] : '',
    statusbarLanguages: langPillMatches,
    metaContents: [],
    audioLabels,
    bootData,
  };
}

export function applyPage(parsed, { doc = document, windowObj = typeof window !== 'undefined' ? window : null } = {}) {
  if (parsed.title) doc.title = parsed.title;
  if (parsed.lang) doc.documentElement.setAttribute('lang', parsed.lang);
  if (parsed.dir) doc.documentElement.setAttribute('dir', parsed.dir);

  const metaDesc = doc.querySelector('meta[name="description"]');
  if (metaDesc && parsed.description) {
    metaDesc.setAttribute('content', parsed.description);
  }

  const canonical = doc.querySelector('link[rel="canonical"]');
  if (canonical && parsed.lang) {
    canonical.setAttribute('href', parsed.lang === 'ru' ? '/ru/' : '/');
  }

  // Обновляем переключатели языка в статус-баре
  const currentLangEls = doc.querySelectorAll('.statusbar-language');
  currentLangEls.forEach((el, index) => {
    if (parsed.statusbarLanguages && parsed.statusbarLanguages[index]) {
      el.innerHTML = parsed.statusbarLanguages[index];
    }
  });

  // Обновляем мета-текст статус-бара (кол-во работ)
  const metaSpans = doc.querySelectorAll('.statusbar-meta__content > span:first-child');
  metaSpans.forEach((span, index) => {
    if (parsed.metaContents && parsed.metaContents[index]) {
      span.textContent = parsed.metaContents[index];
    }
  });

  // Обновляем локализованные подписи кнопки аудио, не трогая сам DOM-узел и обработчики
  if (parsed.audioLabels) {
    /** @type {NodeListOf<HTMLElement>} */
    const audioButtons = doc.querySelectorAll('[data-audio-toggle]');
    audioButtons.forEach((btn) => {
      const isPlaying = (btn.dataset?.audioState || btn.getAttribute('data-audio-state')) === 'on';
      const { on, off, start, stop } = parsed.audioLabels;
      if (on) {
        btn.setAttribute('data-audio-label-on', on);
        if (btn.dataset) btn.dataset.audioLabelOn = on;
      }
      if (off) {
        btn.setAttribute('data-audio-label-off', off);
        if (btn.dataset) btn.dataset.audioLabelOff = off;
      }
      if (start) {
        btn.setAttribute('data-audio-start', start);
        if (btn.dataset) btn.dataset.audioStart = start;
      }
      if (stop) {
        btn.setAttribute('data-audio-stop', stop);
        if (btn.dataset) btn.dataset.audioStop = stop;
      }

      btn.setAttribute('aria-label', isPlaying ? stop : start);
      const labelEl = btn.querySelector('[data-audio-label]');
      if (labelEl) {
        labelEl.textContent = isPlaying ? on : off;
      }
    });
  }

  // Заменяем основной контент страницы
  const main = doc.querySelector('.body__main');
  if (main && parsed.mainHtml) {
    main.innerHTML = parsed.mainHtml;
  }

  // Обновляем глобальные данные
  if (parsed.bootData && windowObj) {
    windowObj.__PORTFOLIO__ = parsed.bootData;
  }
}

/**
 * @typedef {Object} PjaxNavigateEvent
 * @property {string} url
 * @property {any} bootData
 * @property {string} lang
 */

/**
 * @typedef {Object} PjaxRouterOptions
 * @property {((url: string) => Promise<string>)} [fetchHtml]
 * @property {((event: PjaxNavigateEvent) => void)} [onNavigate]
 * @property {any} [windowObj]
 * @property {any} [docObj]
 */

/**
 * @param {PjaxRouterOptions} [options]
 */
export function createPjaxRouter({
  fetchHtml = (url) =>
    fetch(url).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    }),
  onNavigate = () => {},
  windowObj = typeof window !== 'undefined' ? window : null,
  docObj = typeof document !== 'undefined' ? document : null,
} = /** @type {PjaxRouterOptions} */ ({})) {
  const cache = new Map();
  let isNavigating = false;

  async function executeTransition(updateFn) {
    const reduceMotion = windowObj?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (!reduceMotion && typeof docObj?.startViewTransition === 'function') {
      const vt = docObj.startViewTransition(() => updateFn());
      try {
        await vt.finished;
      } catch {
        // ignore transition abort
      }
    } else {
      updateFn();
    }
  }

  async function loadPage(path) {
    const normalized = normalizePath(path);
    if (cache.has(normalized)) {
      return cache.get(normalized);
    }
    const html = await fetchHtml(normalized);
    const parsed = parsePage(html);
    cache.set(normalized, parsed);
    return parsed;
  }

  async function navigate(targetUrl, { pushHistory = true } = {}) {
    if (!windowObj || !docObj) return;
    const targetPath = normalizePath(new URL(targetUrl, windowObj.location.href).pathname);
    const currentPath = normalizePath(windowObj.location.pathname);

    if (targetPath === currentPath && pushHistory) {
      return;
    }

    if (isNavigating) return;
    isNavigating = true;

    try {
      const parsed = await loadPage(targetPath);
      await executeTransition(() => {
        applyPage(parsed, { doc: docObj, windowObj });
        if (pushHistory) {
          windowObj.history.pushState({ path: targetPath }, '', targetPath);
        }
        onNavigate({
          url: targetPath,
          bootData: parsed.bootData || windowObj.__PORTFOLIO__,
          lang: parsed.lang,
        });
      });
    } catch (err) {
      console.error('PJAX navigation failed, falling back to location change:', err);
      if (pushHistory) {
        windowObj.location.href = targetUrl;
      }
    } finally {
      isNavigating = false;
    }
  }

  function shouldIntercept(anchor, event) {
    if (!windowObj) return false;
    if (event.defaultPrevented) return false;
    if (event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (anchor.target && anchor.target !== '_self') return false;
    if (anchor.hasAttribute('download')) return false;

    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;

    const url = new URL(anchor.href, windowObj.location.href);
    if (url.origin !== windowObj.location.origin) return false;

    return true;
  }

  if (docObj && windowObj) {
    docObj.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest('a');
      if (!anchor) return;
      if (!shouldIntercept(anchor, event)) return;

      event.preventDefault();
      const targetPath = normalizePath(new URL(anchor.href, windowObj.location.href).pathname);
      if (isNavigating || targetPath === normalizePath(windowObj.location.pathname)) return;
      confirmClick(anchor);
      navigate(anchor.href);
    });

    windowObj.addEventListener('popstate', () => {
      navigate(windowObj.location.pathname, { pushHistory: false });
    });
  }

  return {
    navigate,
    loadPage,
    cache,
  };
}
