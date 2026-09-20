/**
 * Определяет, находится ли вьюпорт в мобильном режиме:
 * - если ширина >= 960px: desktop (false)
 * - если альбомная ориентация (aspect ratio >= 16/13): desktop (false)
 * - иначе: mobile (true)
 *
 * @param {number} [customViewW] Опциональная ширина вьюпорта для тестов
 * @param {number} [customViewH] Опциональная высота вьюпорта для тестов
 * @returns {boolean}
 */
export function isMobileViewport(customViewW, customViewH) {
  if (typeof customViewW === 'number' && typeof customViewH === 'number') {
    if (customViewW >= 960) return false;
    if (customViewH > 0 && (customViewW / customViewH) >= (16 / 13)) return false;
    return true;
  }
  if (typeof window === 'undefined') {
    return typeof customViewW === 'number' ? customViewW < 960 : false;
  }
  if (window.innerWidth >= 960) return false;
  if (window.matchMedia && window.matchMedia('(min-aspect-ratio: 16/13)').matches) {
    return false;
  }
  return true;
}

/**
 * Вычисляет множитель масштабирования --wm строго по правилам _tokens.scss:
 * - на mobile (<960px и aspect-ratio <= 16/13): --w-base = 390
 * - на compact desktop (960px..1439px или aspect-ratio >= 16/13): --w-base = 1040
 * - на desktop (>=1440px): --w-base = 1440
 * - при ширине >=1920px: ширина замораживается на 1920px (--w-cur = 1920px)
 *
 * @param {number} [customViewW] Опциональная ширина вьюпорта для тестов
 * @param {number} [customViewH] Опциональная высота вьюпорта для тестов
 * @returns {number}
 */
export function getWm(customViewW, customViewH) {
  const viewW = typeof customViewW === 'number'
    ? customViewW
    : (typeof window !== 'undefined' ? window.innerWidth : 1440);
  const isMobile = isMobileViewport(customViewW, customViewH);
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
 * @param {number} [customViewH] Опциональная высота вьюпорта для тестов
 * @returns {number}
 */
export function calcVc(value, customViewW, customViewH) {
  return value * getWm(customViewW, customViewH);
}

/**
 * Переводит значение в физических пикселях в единицы vc макета:
 * vc = px / wm
 *
 * @param {number} pxValue Значение в пикселях
 * @param {number} [customViewW] Опциональная ширина вьюпорта для тестов
 * @param {number} [customViewH] Опциональная высота вьюпорта для тестов
 * @returns {number}
 */
export function pxToVc(pxValue, customViewW, customViewH) {
  const wm = getWm(customViewW, customViewH);
  return wm > 0 ? pxValue / wm : pxValue;
}
