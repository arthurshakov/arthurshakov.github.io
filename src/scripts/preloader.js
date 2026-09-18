// Прелоадер запускается один раз; скроллер доступен после синхронной инициализации app.
/** @param {() => any} getLenis */
export function initPreloader(getLenis = () => null) {
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
    const lenis = getLenis();
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

}
