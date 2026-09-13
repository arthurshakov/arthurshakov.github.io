/**
 * @fileoverview Digital Sine Blip audio synthesis and interaction bindings.
 */

/** @type {AudioContext | null} */
let sharedContext = null;

/**
 * Returns a shared AudioContext instance, lazily created on demand.
 * @returns {AudioContext | null}
 */
export function getAudioContext() {
  if (!sharedContext && typeof window !== 'undefined') {
    const AudioCtx = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
    if (AudioCtx) {
      sharedContext = new AudioCtx();
    }
  }
  return sharedContext;
}

/**
 * Overrides or sets the shared AudioContext (useful for testing or custom graphs).
 * @param {AudioContext | null} ctx
 */
export function setAudioContext(ctx) {
  sharedContext = ctx;
}

export const DEFAULT_CLICK_VOLUME = 0.35;
export const DEFAULT_CLICK_PITCH = 1.25;

/**
 * @typedef {Object} PlaySineBlipOptions
 * @property {number} [volume]
 * @property {number} [pitch]
 * @property {AudioContext | null} [context]
 */

/**
 * Plays a synthesized digital sine blip using the Web Audio API.
 * 
 * @param {number | PlaySineBlipOptions} [volumeOrOptions]
 * @param {number} [pitchArg]
 * @param {AudioContext | null} [contextArg]
 */
export function playSineBlip(
  volumeOrOptions = DEFAULT_CLICK_VOLUME,
  pitchArg = DEFAULT_CLICK_PITCH,
  contextArg = null
) {
  let volume = DEFAULT_CLICK_VOLUME;
  let pitch = DEFAULT_CLICK_PITCH;
  /** @type {AudioContext | null} */
  let context = null;

  if (typeof volumeOrOptions === 'object' && volumeOrOptions !== null) {
    volume = volumeOrOptions.volume ?? DEFAULT_CLICK_VOLUME;
    pitch = volumeOrOptions.pitch ?? DEFAULT_CLICK_PITCH;
    context = volumeOrOptions.context ?? null;
  } else {
    volume = typeof volumeOrOptions === 'number' ? volumeOrOptions : DEFAULT_CLICK_VOLUME;
    pitch = typeof pitchArg === 'number' ? pitchArg : DEFAULT_CLICK_PITCH;
    context = contextArg;
  }

  if (volume <= 0) return;

  const ctx = context || getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1600 * pitch, now);
  osc.frequency.exponentialRampToValueAtTime(400 * pitch, now + 0.018);

  const startGain = Math.max(0.0001, 0.5 * volume);
  gain.gain.setValueAtTime(startGain, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.onended = () => {
    try {
      osc.disconnect();
      gain.disconnect();
    } catch {
      // Safe cleanup fallback
    }
  };

  osc.start(now);
  osc.stop(now + 0.02);
}

const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  '[role="button"]',
  '[tabindex]:not([tabindex="-1"])',
  '.works-row',
  '.works-card',
  '[data-slug]',
  '[data-filter]',
  '[data-audio-toggle]',
  '[data-audio-previous]',
  '[data-audio-next]',
  '[data-preview-prev]',
  '[data-preview-next]',
  '[data-preview-nav]',
  '.preview-thumbnail',
  '.preview-slider__trail-item',
  '.preview-slider__track',
  '.pill',
].join(', ');

/**
 * Determines whether a target element is interactive and should emit a click sound.
 * @param {EventTarget | null} target
 * @returns {boolean}
 */
export function isClickableTarget(target) {
  if (!(target instanceof Element)) return false;

  // Disabled controls are not clickable
  if (target.closest('button:disabled, [aria-disabled="true"], [disabled]')) {
    return false;
  }

  if (target.closest(INTERACTIVE_SELECTOR)) {
    return true;
  }

  if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
    let current = /** @type {Element | null} */ (target);
    let depth = 0;
    while (current && depth < 3 && current !== document.body && current !== document.documentElement) {
      try {
        if (window.getComputedStyle(current).cursor === 'pointer') {
          return true;
        }
      } catch {
        break;
      }
      current = current.parentElement;
      depth += 1;
    }
  }

  return false;
}

/**
 * @typedef {Object} BindClickSoundOptions
 * @property {EventTarget | null} [root]
 * @property {number} [volume]
 * @property {number} [pitch]
 * @property {boolean} [interactiveOnly]
 * @property {(() => boolean)} [isSoundEnabled]
 * @property {AudioContext | null} [context]
 */

/**
 * Binds pointerdown and keyboard interaction listeners to play the digital sine blip.
 * 
 * @param {BindClickSoundOptions} [options]
 * @returns {(() => void)} Unsubscribe cleanup function
 */
export function bindClickSound({
  root = typeof window !== 'undefined' ? window : null,
  volume = DEFAULT_CLICK_VOLUME,
  pitch = DEFAULT_CLICK_PITCH,
  interactiveOnly = true,
  isSoundEnabled = () => true,
  context = null,
} = {}) {
  if (!root || typeof root.addEventListener !== 'function') {
    return () => {};
  }

  /**
   * @param {Element | null} target
   */
  const handleTrigger = (target) => {
    if (!target) return;

    if (interactiveOnly && !isClickableTarget(target)) {
      return;
    }

    const isToggle = Boolean(target.closest('[data-audio-toggle]'));
    const enabled = isSoundEnabled();

    // If sound is off, only clicking the toggle (which switches it on) blips
    if (!enabled && !isToggle) {
      return;
    }

    try {
      playSineBlip({ volume, pitch, context });
    } catch {
      // Audio is progressive enhancement; never break UI interaction
    }
  };

  /**
   * @param {PointerEvent} event
   */
  const onPointerDown = (event) => {
    // Only primary button (left click or touch)
    if (event.button !== undefined && event.button !== 0) return;
    const target = event.target instanceof Element ? event.target : null;
    handleTrigger(target);
  };

  /**
   * @param {MouseEvent} event
   */
  const onClick = (event) => {
    // Keyboard activation (Enter/Space on focused button/link) triggers click with detail === 0
    if (event.detail === 0) {
      const target = event.target instanceof Element ? event.target : null;
      handleTrigger(target);
    }
  };

  root.addEventListener('pointerdown', /** @type {EventListener} */ (onPointerDown), { passive: true });
  root.addEventListener('click', /** @type {EventListener} */ (onClick), { passive: true });

  return () => {
    root.removeEventListener('pointerdown', /** @type {EventListener} */ (onPointerDown));
    root.removeEventListener('click', /** @type {EventListener} */ (onClick));
  };
}
