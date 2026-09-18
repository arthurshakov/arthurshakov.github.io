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
