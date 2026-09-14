/**
 * Настройки анимации слайдера проектов (шторка, люминесцентный трейл, смещение текста)
 * Значения вынесены в константы для удобного редактирования.
 */
export const PREVIEW_SLIDER_CONFIG = {
  // Базовая минимальная высота описания в единицах vc (vc(460) на десктопе, vc(480) на мобильных)
  minHeightVc: 460,
  minHeightMobileVc: 480,

  // Базовая толщина линии шторки в единицах vc (vc(4))
  lineThicknessVc: 4,

  // Базовая длина люминесцентного хвоста/трейла в единицах vc (vc(140))
  trailLengthVc: 140,

  // Максимальная плотность/прозрачность свечения трейла (0.0 .. 1.0)
  trailOpacity: 0.68,

  // Дистанция смещения описания при появлении в единицах vc (vc(4))
  descOffsetVc: 4,

  // Порог свайпа по видео-превью в пикселях (влево — Next, вправо — Prev)
  swipeThresholdPx: 35,

  // Инерция ленты миниатюр (Draggable + InertiaPlugin)
  stripThrowResistance: 1200, // Сопротивление броску ленты миниатюр (меньше = дольше скользит)
  stripEdgeResistance: 0.97,  // Упругость у границ ленты миниатюр (0..1, 1 = жесткая стена, 0.85 = эластичная оттяжка)

  // Инерция мобильной ленты кнопок-фильтров
  filtersThrowResistance: 1200, // Сопротивление броску ленты фильтров
  filtersEdgeResistance: 0.97,  // Упругость у границ ленты фильтров

  // Скорость движения горизонтальной шторки в миллисекундах
  sweepDurationMs: 320,

  // Длительность появления текста описания в секундах (GSAP power2.out)
  descDurationS: 0.55,

  // Изинг появления описания (синхронизирован со скроллом ленты)
  descEase: 'power2.out',

  // Длительность мягкого угасания трейла в конце движения в секундах
  trailFadeDurationS: 0.28,

  // Длительность эффекта декодирования названия slug (Text Scramble) в миллисекундах
  scrambleDurationMs: 200,

  // Длительность и изинг плавного центрирования активной миниатюры в ленте
  stripScrollDurationS: 0.55,
  stripScrollEase: 'power2.out',

  // Горизонтальная прокрутка ленты миниатюр (тачпад / горизонтальное колесо / Shift+колесо)
  stripWheelSpeed: 1.5,        // Множитель скорости горизонтальной прокрутки (больше = быстрее)
  stripWheelDurationS: 0.32,   // Длительность анимации доезда при горизонтальном скролле в секундах
};

/**
 * Вычисляет множитель масштабирования --wm строго по правилам _tokens.scss:
 * - на mobile (<960px): --w-base = 390
 * - на compact desktop (960px..1439px): --w-base = 1040
 * - на desktop (>=1440px): --w-base = 1440
 * - при ширине >=1920px: ширина замораживается на 1920px (--w-cur = 1920px)
 *
 * @param {number} [customViewW] Опциональная ширина вьюпорта для тестов
 * @returns {number}
 */
export function getWm(customViewW) {
  const viewW = typeof customViewW === 'number'
    ? customViewW
    : (typeof window !== 'undefined' ? window.innerWidth : 1440);
  const isMobile = viewW < 960;
  const baseW = isMobile ? 390 : (viewW < 1440 ? 1040 : 1440);
  const curW = Math.min(viewW, 1920);
  return curW / baseW;
}

/**
 * Вычисляет точное значение vc(value) в пикселях строго по правилам _functions.scss / _tokens.scss:
 * vc(v) = calc(v * var(--wm))
 *
 * @param {number} value Значение в единицах макета (например, 24)
 * @param {number} [customViewW] Опциональная ширина вьюпорта для тестов
 * @returns {number}
 */
export function calcVc(value, customViewW) {
  return value * getWm(customViewW);
}

/**
 * Переводит значение в физических пикселях в единицы vc макета:
 * vc = px / wm
 *
 * @param {number} pxValue Значение в пикселях
 * @param {number} [customViewW] Опциональная ширина вьюпорта для тестов
 * @returns {number}
 */
export function pxToVc(pxValue, customViewW) {
  const wm = getWm(customViewW);
  return wm > 0 ? pxValue / wm : pxValue;
}
