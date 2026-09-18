/**
 * Настройки анимации фоновой сетки (Lattice Sparks & Relays)
 * Значения вынесены в константы для удобного редактирования.
 */
export const GRID_ANIMATION_CONFIG = {
  // Прозрачность линий-связок между точками при скролле (0.0 .. 1.0)
  lineMaxAlpha: 0.5,

  // Максимальное количество одновременно активных связок на пике скролла
  maxLinks: 28,

  // Тип связок между точками:
  // 'both' (вертикальные + горизонтальные), 'vert' (только вертикальные), 'mesh' (с диагоналями)
  relayType: 'both',

  // Прозрачность вертикальных шлейфов (0.0 .. 1.0)
  trailMaxAlpha: 0.25,

  // Максимальная длина шлейфа в единицах vc (vc(30))
  maxTrailLength: 30,

  // Базовые размеры точки в единицах vc на десктопе (vc(1.5)xvc(1.5))
  dotBaseWidth: 1.5,
  dotBaseHeight: 1.5,
  dotEnergyDelta: 0.5,

  // Базовые размеры точки в единицах vc на мобилке (<960px) (vc(1)xvc(1))
  mobileDotBaseWidth: 1,
  mobileDotBaseHeight: 1,
  mobileDotEnergyDelta: 0.33,

  // Базовая толщина линий шлейфов и связок в единицах vc (vc(1))
  lineWidthBase: 1,

  // Базовый шаг сетки на десктопе, соответствующий vc(64) в стилях
  vertStepBase: 64,
  horizStepBase: 64,

  // Базовый шаг сетки на мобилке (<960px). По умолчанию 40 (квадратная ячейка vc(40))
  mobileStepBase: 40,
  mobileHorizStepBase: 40,
  mobileVertStepBase: 40,

  // Чувствительность к скорости скролла (множитель импульса) на десктопе и мобилке
  scrollSensitivity: 0.5,
  mobileScrollSensitivity: 0.4,

  // Базовая яркость/прозрачность точек в состоянии покоя (0.0 .. 1.0)
  particleBaseAlpha: 0.30,

  // Максимальная яркость/прозрачность точек при энергичном скролле (0.0 .. 1.0)
  particleMaxAlpha: 0.75,

  // Инерция затухания энергии после остановки скролла (0.80 .. 0.98)
  damping: 0.93,

  // Цвет акцента (Signal Lime #A8E05B) в формате RGB
  accentRgb: '168, 224, 91',
};

/**
 * Вычисляет точное значение vc(value) в пикселях строго по правилам _functions.scss / _tokens.scss:
 * vc(v) = calc(v * var(--wm)), где:
 * - на mobile (<960px): --w-base = 390
 * - на desktop (>=960px): --w-base = 1440
 * - при ширине >=1920px: ширина замораживается на 1920px
 *
 * @param {number} value Значение в единицах макета (например, 64)
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

/**
 * @typedef {Object} GridNode
 * @property {number} x
 * @property {number} y
 * @property {number} col
 * @property {number} row
 */

/**
 * Инициализирует канвас-анимацию сетки с привязкой к вертикальным линиям и скроллу.
 *
 * @param {HTMLCanvasElement | null} canvas
 * @param {HTMLElement | null} [gridContainer]
 * @param {Partial<typeof GRID_ANIMATION_CONFIG>} [customConfig]
 * @returns {{ destroy: () => void, feedVelocity: (v: number) => void }}
 */
export function initGridAnimation(canvas, gridContainer, customConfig = {}) {
  if (!canvas) {
    return { destroy: () => { }, feedVelocity: () => { } };
  }

  const targetCanvas = canvas;
  const ctx = targetCanvas.getContext('2d', { alpha: true });
  if (!ctx) {
    return { destroy: () => { }, feedVelocity: () => { } };
  }

  const config = { ...GRID_ANIMATION_CONFIG, ...customConfig };
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (reduceMotionQuery.matches) {
    return { destroy: () => { }, feedVelocity: () => { } };
  }

  const container = gridContainer || targetCanvas.parentElement || document.body;

  let dpr = 1;
  let stepX = 64;
  let stepY = 64;
  let colsCount = 0;
  let rowsCount = 0;
  /** @type {GridNode[]} */
  let nodes = [];
  /** @type {GridNode[][]} */
  let nodeGrid = [];

  // Физика скролла
  let lastScrollY = window.scrollY;
  let lastScrollTime = performance.now();
  let scrollVelocity = 0;
  let smoothVelocity = 0;
  let kineticEnergy = 0;
  let isAnimating = false;
  let rafId = 0;

  let startCol = 0;
  let currentSensitivity = 1.0;
  let scaledMaxTrail = 30;
  let scaledMinTrail = 2;
  let scaledDotW = 1.5;
  let scaledDotH = 1.5;
  let scaledDotEnergyDelta = 0.5;
  let scaledLineWidth = 1;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = window.innerHeight;

    targetCanvas.width = Math.round(width * dpr);
    targetCanvas.height = Math.round(height * dpr);
    targetCanvas.style.width = width + 'px';
    targetCanvas.style.height = height + 'px';

    const viewW = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const isMobile = viewW < 960;
    const baseHoriz = isMobile
      ? (config.mobileHorizStepBase ?? config.mobileStepBase ?? 40)
      : (config.horizStepBase ?? 64);

    const baseVert = isMobile
      ? (config.mobileVertStepBase ?? config.mobileStepBase ?? (config.vertStepBase === 64 ? 40 : config.vertStepBase))
      : config.vertStepBase;

    // Шаг сетки строго в единицах vc(...)
    stepX = calcVc(baseHoriz, viewW);
    stepY = calcVc(baseVert, viewW);
    startCol = isMobile ? 0 : 1;

    // Чувствительность к скроллу
    currentSensitivity = isMobile
      ? (config.mobileScrollSensitivity ?? config.scrollSensitivity ?? 1.0)
      : (config.scrollSensitivity ?? 1.0);

    // Размеры точек, шлейфов и линий в единицах vc(...) с учетом dpr
    const baseDotW = isMobile
      ? (config.mobileDotBaseWidth ?? 1)
      : config.dotBaseWidth;
    const baseDotH = isMobile
      ? (config.mobileDotBaseHeight ?? 1)
      : config.dotBaseHeight;
    const baseEnergyDelta = isMobile
      ? (config.mobileDotEnergyDelta ?? 0.33)
      : config.dotEnergyDelta;

    scaledMaxTrail = calcVc(config.maxTrailLength, viewW) * dpr;
    scaledMinTrail = calcVc(2, viewW) * dpr;
    scaledDotW = calcVc(baseDotW, viewW) * dpr;
    scaledDotH = calcVc(baseDotH, viewW) * dpr;
    scaledDotEnergyDelta = calcVc(baseEnergyDelta, viewW) * dpr;
    scaledLineWidth = Math.max(1, calcVc(config.lineWidthBase, viewW)) * dpr;

    buildNodes(width, height);
    drawFrame(0);
  }

  /**
   * @param {number} width
   * @param {number} height
   */
  function buildNodes(width, height) {
    nodes = [];
    nodeGrid = [];

    colsCount = Math.floor(width / stepX) + 1;
    rowsCount = Math.ceil(height / stepY) + 2;

    for (let c = startCol; c < colsCount; c++) {
      nodeGrid[c] = [];
      const x = Math.round(c * stepX);

      for (let r = 0; r < rowsCount; r++) {
        const y = Math.round(r * stepY);
        const nodeObj = { x, y, col: c, row: r };
        nodes.push(nodeObj);
        nodeGrid[c][r] = nodeObj;
      }
    }
  }

  function onScroll() {
    const now = performance.now();
    const dt = Math.max(1, now - lastScrollTime);
    const dy = window.scrollY - lastScrollY;

    scrollVelocity = (dy / dt) * currentSensitivity;
    lastScrollY = window.scrollY;
    lastScrollTime = now;

    if (!isAnimating) {
      isAnimating = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    }
  }

  /**
   * Отрисовывает один кадр состояния сетки
   * @param {number} energy
   */
  function drawFrame(energy) {
    if (!ctx) return;
    ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

    const maxLen = scaledMaxTrail;
    const speedFactor = Math.min(1.0, Math.abs(smoothVelocity) * 0.45 + energy * 0.55);
    const trailLen = Math.max(scaledMinTrail, speedFactor * maxLen);
    const trailDir = smoothVelocity >= 0 ? -1 : 1;

    ctx.lineWidth = scaledLineWidth;

    // 1. Точки на линиях сетки и их шлейфы
    const minAlpha = config.particleBaseAlpha;
    const maxAlpha = config.particleMaxAlpha;
    const dotAlpha = minAlpha + energy * (maxAlpha - minAlpha);

    ctx.fillStyle = `rgba(${config.accentRgb}, ${dotAlpha})`;
    const dotH = scaledDotH + energy * scaledDotEnergyDelta;
    const dotW = scaledDotW;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const px = node.x * dpr;
      const py = node.y * dpr;

      ctx.fillRect(px - dotW / 2, py - dotH / 2, dotW, dotH);

      if (energy > 0.04) {
        const trailAlpha = energy * config.trailMaxAlpha;
        const endY = py + trailDir * trailLen;
        const grad = ctx.createLinearGradient(px, py, px, endY);
        grad.addColorStop(0, `rgba(${config.accentRgb}, ${trailAlpha})`);
        grad.addColorStop(0.35, `rgba(${config.accentRgb}, ${trailAlpha * 0.7})`);
        grad.addColorStop(1, `rgba(${config.accentRgb}, 0)`);

        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, endY);
        ctx.stroke();
      }
    }

    // 2. Линии-связки между точками (Relays)
    if (config.lineMaxAlpha > 0.01 && energy > 0.08) {
      const linkCount = Math.floor(energy * config.maxLinks);
      const colSpan = colsCount - startCol;

      if (colSpan > 0) {
        for (let k = 0; k < linkCount; k++) {
          const c1 = Math.floor(Math.random() * colSpan) + startCol;
          const r1 = Math.floor(Math.random() * rowsCount);
          const n1 = nodeGrid[c1]?.[r1];
          if (!n1) continue;

          /** @type {GridNode | null} */
          let n2 = null;
          const type = config.relayType;

          if (type === 'vert') {
            n2 = nodeGrid[c1]?.[r1 + 1] || nodeGrid[c1]?.[r1 - 1] || null;
          } else if (type === 'both') {
            if (Math.random() < 0.6) {
              n2 = nodeGrid[c1]?.[r1 + 1] || null;
            } else {
              const deltaCol = Math.random() < 0.5 ? 1 : -1;
              const nextCol = c1 + deltaCol;
              if (nextCol >= startCol && nextCol < colsCount) {
                n2 = nodeGrid[nextCol]?.[r1] || null;
              }
            }
          } else if (type === 'mesh') {
            const dc = Math.floor(Math.random() * 3) - 1;
            const dr = Math.floor(Math.random() * 3) - 1;
            const nextCol = c1 + dc;
            if (nextCol >= startCol && nextCol < colsCount && (dc !== 0 || dr !== 0)) {
              n2 = nodeGrid[nextCol]?.[r1 + dr] || null;
            }
          }

          if (n2) {
            const x1 = n1.x * dpr;
            const y1 = n1.y * dpr;
            const x2 = n2.x * dpr;
            const y2 = n2.y * dpr;

            const grad = ctx.createLinearGradient(x1, y1, x2, y2);
            const linkAlpha = (Math.random() * 0.4 + 0.6) * energy * config.lineMaxAlpha;
            grad.addColorStop(0, `rgba(${config.accentRgb}, 0)`);
            grad.addColorStop(0.2, `rgba(${config.accentRgb}, ${linkAlpha})`);
            grad.addColorStop(0.8, `rgba(${config.accentRgb}, ${linkAlpha})`);
            grad.addColorStop(1, `rgba(${config.accentRgb}, 0)`);

            ctx.strokeStyle = grad;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }
    }
  }

  let lastTime = performance.now();

  /**
   * Главный цикл анимации: активен только при движении, засыпает в покое
   * @param {number} now
   */
  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    smoothVelocity += (scrollVelocity - smoothVelocity) * 0.2;
    scrollVelocity *= 0.86;

    const scrollPower = Math.min(Math.abs(smoothVelocity) * 0.45, 1.0);
    if (scrollPower > kineticEnergy) {
      kineticEnergy += (scrollPower - kineticEnergy) * 0.3;
    } else {
      kineticEnergy *= config.damping;
    }

    if (kineticEnergy < 0.002 && Math.abs(smoothVelocity) < 0.01) {
      kineticEnergy = 0;
      smoothVelocity = 0;
      scrollVelocity = 0;
      isAnimating = false;
      drawFrame(0);
      return;
    }

    drawFrame(kineticEnergy);
    rafId = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('scroll', onScroll, { passive: true });

  resize();

  return {
    /**
     * Позволяет внешнему скроллеру (Lenis) передавать скорость
     * @param {number} velocity
     */
    feedVelocity(velocity) {
      scrollVelocity = velocity * 0.1 * currentSensitivity;
      if (!isAnimating) {
        isAnimating = true;
        lastTime = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    },
    destroy() {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
      if (ctx) ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    },
  };
}
