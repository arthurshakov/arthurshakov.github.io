import { PREVIEW_SLIDER_CONFIG } from './preview-slider.js';

/**
 * Creates a generic draggable and scrollable strip.
 *
 * @param {HTMLElement | null} strip 
 * @param {HTMLElement | null} track 
 * @param {object} config 
 * @param {number} [config.scrollDurationS]
 * @param {string} [config.scrollEase]
 * @param {number} [config.edgeResistance]
 * @param {number} [config.throwResistance]
 * @param {boolean} [config.enableWheel]
 * @param {string} [config.draggableClass]
 */
export function createDraggableStrip(strip, track, config = {}) {
  const DraggableClass = /** @type {any} */ (window).Draggable;
  /** @type {any} */
  let draggableInstance = null;
  /** @type {number | null} */
  let wheelTargetX = null;

  function getBounds() {
    if (!strip || !track) return { minX: 0, maxX: 0 };
    const stripW = strip.clientWidth;
    const trackW = Math.max(track.scrollWidth, track.offsetWidth || 0);
    const minX = Math.min(0, stripW - trackW);
    return { minX, maxX: 0 };
  }

  function smoothScrollTo(targetElement) {
    if (!strip || !track || !targetElement) return;
    wheelTargetX = null;
    if (draggableInstance && (draggableInstance.isDragging || draggableInstance.isThrowing)) return;

    const stripWidth = strip.clientWidth;
    const elLeft = targetElement.offsetLeft;
    const elWidth = targetElement.clientWidth;
    const targetX = (stripWidth / 2) - (elLeft + elWidth / 2);
    const bounds = getBounds();
    const clampedTargetX = Math.max(bounds.minX, Math.min(bounds.maxX, targetX));

    if (window.gsap) {
      window.gsap.to(track, {
        x: clampedTargetX,
        duration: config.scrollDurationS || PREVIEW_SLIDER_CONFIG.stripScrollDurationS || 0.35,
        ease: config.scrollEase || PREVIEW_SLIDER_CONFIG.stripScrollEase || 'power2.out',
        overwrite: 'auto',
        onUpdate() {
          if (draggableInstance) draggableInstance.update();
        },
      });
    } else {
      track.style.transform = 'translate3d(' + clampedTargetX + 'px, 0, 0)';
    }
  }

  if (DraggableClass && track && strip) {
    if (config.draggableClass) {
      strip.classList.add(config.draggableClass);
    }
    const initialBounds = getBounds();
    draggableInstance = DraggableClass.create(track, {
      type: 'x',
      inertia: true,
      bounds: initialBounds,
      edgeResistance: config.edgeResistance ?? PREVIEW_SLIDER_CONFIG.stripEdgeResistance,
      throwResistance: config.throwResistance ?? PREVIEW_SLIDER_CONFIG.stripThrowResistance,
      cursor: 'grab',
      activeCursor: 'grabbing',
      dragClickables: true,
      onPressInit() {
        wheelTargetX = null;
        this.applyBounds(getBounds());
      },
      onDragStart() {
        strip.classList.add('is-dragging');
      },
      onDragEnd() {
        strip.classList.remove('is-dragging');
      },
      onThrowComplete() {
        strip.classList.remove('is-dragging');
      },
    })[0];
  }

  /** @type {((e: WheelEvent) => void) | null} */
  let wheelListener = null;
  if (config.enableWheel && strip && track) {
    wheelListener = (/** @type {WheelEvent} */ e) => {
      if (draggableInstance && draggableInstance.isDragging) return;
      if (Math.abs(e.deltaX) < 1 || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();

      const speed = PREVIEW_SLIDER_CONFIG.stripWheelSpeed ?? 2.0;
      const delta = e.deltaX * speed;

      if (window.gsap && track) {
        const bounds = getBounds();
        const currentX = /** @type {number} */ (window.gsap.getProperty(track, 'x')) || 0;
        const startX = wheelTargetX !== null ? wheelTargetX : currentX;
        wheelTargetX = Math.max(bounds.minX, Math.min(bounds.maxX, startX - delta));

        window.gsap.to(track, {
          x: wheelTargetX,
          duration: PREVIEW_SLIDER_CONFIG.stripWheelDurationS ?? 0.32,
          ease: 'power2.out',
          overwrite: 'auto',
          onUpdate() {
            if (draggableInstance) draggableInstance.update();
          },
          onComplete() {
            wheelTargetX = null;
          },
        });
      }
    };
    strip.addEventListener('wheel', wheelListener, { passive: false });
  }

  function update() {
    if (draggableInstance) {
      draggableInstance.applyBounds(getBounds());
      draggableInstance.update();
    }
  }

  function destroy() {
    if (wheelListener && strip) {
      strip.removeEventListener('wheel', wheelListener);
    }
    if (draggableInstance) {
      draggableInstance.kill();
      draggableInstance = null;
    }
    if (window.gsap && track) {
      window.gsap.killTweensOf(track);
    }
  }

  function isInteracting() {
    return Boolean(draggableInstance && (draggableInstance.isDragging || draggableInstance.isThrowing || draggableInstance.timeSinceDrag() < 0.1));
  }

  return {
    smoothScrollTo,
    update,
    destroy,
    isInteracting,
  };
}
