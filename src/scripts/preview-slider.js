/**
 * Настройки анимации слайдера проектов (шторка, люминесцентный трейл, смещение текста)
 * Значения вынесены в константы для удобного редактирования.
 */
export const PREVIEW_SLIDER_CONFIG = {
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
  stripThrowResistance: 1200, // Сопротивление броску ленты (меньше = дольше скользит)
  stripEdgeResistance: 0.85,  // Упругость у границ ленты

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

  // Прокрутка ленты миниатюр колесом мыши
  stripWheelSpeed: 1.5,        // Множитель скорости прокрутки колесом (больше = быстрее)
  stripWheelDurationS: 0.32,   // Длительность анимации доезда при скролле колесом в секундах
};

/**
 * Вычисляет точное значение vc(value) в пикселях строго по правилам _functions.scss / _tokens.scss:
 * vc(v) = calc(v * var(--wm)), где:
 * - на mobile (<960px): --w-base = 390
 * - на desktop (>=960px): --w-base = 1440
 * - при ширине >=1920px: ширина замораживается на 1920px
 *
 * @param {number} value Значение в единицах макета (например, 24)
 * @param {number} [customViewW] Опциональная ширина вьюпорта для тестов
 * @returns {number}
 */
export function calcVc(value, customViewW) {
  const viewW = typeof customViewW === 'number'
    ? customViewW
    : (typeof window !== 'undefined' ? window.innerWidth : 1440);
  const isMobile = viewW < 960;
  const baseW = isMobile ? 390 : 1440;
  const curW = Math.min(viewW, 1920);
  const wm = curW / baseW;
  return value * wm;
}
