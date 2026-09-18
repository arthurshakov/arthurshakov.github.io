import { initGridAnimation } from './grid-animation.js';

export function initScrollEffects(reduceMotion) {
  /** @type {any} */
  let lenis = null;
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

  return lenis;
}
