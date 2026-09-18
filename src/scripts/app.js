// Точка входа: постоянные эффекты сессии и привязка сменяемого контента.
import { initPreloader } from './preloader.js';
import { initAudioSession } from './audio-session.js';
import { initScrollEffects } from './scroll-effects.js';
import { createPageInteractivity } from './page-interactivity.js';
import { createPjaxRouter } from './pjax.js';

(() => {
  const pageData = window.__PORTFOLIO__;
  let lenis = null;
  initPreloader(() => lenis);
  if (!pageData) return;

  initAudioSession(pageData);
  lenis = initScrollEffects(window.matchMedia('(prefers-reduced-motion: reduce)'));

  // Регистрация GSAP плагинов для инерционной ленты миниатюр
  const win = /** @type {any} */ (window);
  if (win.gsap && win.Draggable) {
    if (win.InertiaPlugin) {
      win.gsap.registerPlugin(win.Draggable, win.InertiaPlugin);
    } else {
      win.gsap.registerPlugin(win.Draggable);
    }
  }

  const bindPageInteractivity = createPageInteractivity({ lenis });
  bindPageInteractivity(pageData);
  createPjaxRouter({
    onNavigate: ({ bootData }) => {
      bindPageInteractivity(bootData || window.__PORTFOLIO__);
    },
  });
})();
