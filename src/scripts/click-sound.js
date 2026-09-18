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

export const DEFAULT_CLICK_VOLUME = 0.9;
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
    ctx.resume().catch(() => { });
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
  '.pill',
].join(', ');

/**
 * Determines whether a target element is interactive and should emit a click sound.
 * Elements that are disabled or already in their active/selected state where clicking
 * produces no state change return false.
 *
 * @param {EventTarget | null} target
 * @returns {boolean}
 */
export function isClickableTarget(target) {
  if (!(target instanceof Element)) return false;

  // Disabled controls are not clickable
  if (target.closest('button:disabled, [aria-disabled="true"], [disabled]')) {
    return false;
  }

  // Audio toggle is always interactive (clicking toggles play/pause state)
  const isAudioToggle = Boolean(target.closest('[data-audio-toggle]'));

  if (!isAudioToggle) {
    // Controls that are already active/selected and produce no action when clicked:
    // 1. Active thumbnail in slider: .preview-thumbnail.is-active or aria-pressed="true"
    // 2. Active filter chip: .chip--on or chip with aria-pressed="true"
    // 3. Current page navigation link: [aria-current="page"] or [aria-current="true"] or .pill--on[aria-current]
    if (
      target.closest(
        '.preview-thumbnail.is-active, .preview-thumbnail[aria-pressed="true"], .preview-thumbnail[aria-selected="true"], ' +
        '.chip--on, [data-filter].chip--on, [data-filter][aria-pressed="true"], ' +
        'a[aria-current="page"], a[aria-current="true"], .pill--on[aria-current]'
      )
    ) {
      return false;
    }
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

/** Emit only after an application handler accepts the action.
 * @param {Element} target
 */
export function confirmClick(target) {
  target.dispatchEvent(new CustomEvent('ui:action', { bubbles: true }));
}

const CONFIRMED_CONTROLS = '.preview-thumbnail, [data-filter], [data-preview-prev], [data-preview-next], .works-row, .works-card';

/**
 * Native links/buttons use click; stateful controls report accepted actions explicitly.
 * @param {BindClickSoundOptions} [options]
 */
export function bindClickSound({
  root = typeof window !== 'undefined' ? window : null,
  volume = DEFAULT_CLICK_VOLUME,
  pitch = DEFAULT_CLICK_PITCH,
  interactiveOnly = true,
  isSoundEnabled = () => true,
  context = null,
} = {}) {
  if (!root || typeof root.addEventListener !== 'function') return () => {};

  const handleTrigger = (/** @type {Element | null} */ target, confirmed = false) => {
    if (!target || target.closest('button:disabled, [aria-disabled="true"], [disabled]')) return;
    if (!confirmed && interactiveOnly && !isClickableTarget(target)) return;
    // All music controls can start playback, including next/previous while muted.
    const startsAudio = target.closest('[data-audio-toggle], [data-audio-previous], [data-audio-next]');
    if (!isSoundEnabled() && !startsAudio) return;
    try {
      playSineBlip({ volume, pitch, context });
    } catch {
      // Sound must never break the action.
    }
  };

  const onClick = (/** @type {MouseEvent} */ event) => {
    if (event.defaultPrevented || (event.button !== undefined && event.button !== 0)) return;
    const target = event.target instanceof Element ? event.target : null;
    // Links nested in project rows have their own native action.
    if (!target?.closest('a[href]') && target?.closest(CONFIRMED_CONTROLS)) return;
    handleTrigger(target);
  };
  const onAction = (/** @type {Event} */ event) => {
    handleTrigger(event.target instanceof Element ? event.target : null, true);
  };
  root.addEventListener('ui:action', onAction);
  root.addEventListener('click', /** @type {EventListener} */ (onClick));
  return () => {
    root.removeEventListener('ui:action', onAction);
    root.removeEventListener('click', /** @type {EventListener} */ (onClick));
  };
}
