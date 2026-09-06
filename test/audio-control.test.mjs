import assert from 'node:assert/strict';
import test from 'node:test';

import { bindAudioControls, bindAudioVisualizer } from '../src/scripts/audio-controls.js';
import { renderPage } from '../src/template.mjs';

function createButton() {
  const listeners = new Map();
  const attributes = new Map();

  const bars = Array.from({ length: 5 }, () => {
    const values = new Map();
    return {
      style: {
        setProperty(name, value) {
          values.set(name, String(value));
        },
        getPropertyValue(name) {
          return values.get(name) ?? '';
        },
      },
    };
  });

  return {
    dataset: {
      audioLabelOn: 'sound on',
      audioLabelOff: 'sound off',
      audioStart: 'turn on background music',
      audioStop: 'turn off background music',
    },
    label: { textContent: '' },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    querySelector(selector) {
      return selector === '[data-audio-label]' ? this.label : null;
    },
    querySelectorAll(selector) {
      return selector === '.audio-control__bar' ? bars : [];
    },
    bars,
    async click() {
      await listeners.get('click')?.();
    },
  };
}

function createPlayer() {
  let listener = null;

  return {
    toggleCalls: 0,
    subscribe(next) {
      listener = next;
      next({ playing: false, trackIndex: 0 });
      return () => {
        listener = null;
      };
    },
    async toggle() {
      this.toggleCalls += 1;
    },
    emit(state) {
      listener?.(state);
    },
  };
}

test('renders an off audio button in both locales', () => {
  for (const lang of ['en', 'ru']) {
    const html = renderPage(lang);

    assert.match(html, /<button[^>]*data-audio-toggle[^>]*aria-pressed="false"/);
    assert.match(html, /data-audio-label/);
    assert.match(html, /data-audio-bars/);
  }
});

test('binds an equalizer button to the player state and action', async () => {
  const button = createButton();
  const player = createPlayer();

  const unbind = bindAudioControls([button], player);
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  assert.equal(button.getAttribute('aria-label'), 'turn on background music');
  assert.equal(button.label.textContent, 'sound off');

  await button.click();
  assert.equal(player.toggleCalls, 1);

  player.emit({ playing: true, trackIndex: 0 });
  assert.equal(button.getAttribute('aria-pressed'), 'true');
  assert.equal(button.getAttribute('aria-label'), 'turn off background music');
  assert.equal(button.label.textContent, 'sound on');

  unbind();
});

test('writes live analyser levels into equalizer bar properties while playing', () => {
  const button = createButton();
  const player = createPlayer();
  const frames = [];
  const visualizer = { sample: () => [0, 0.25, 0.5, 0.75, 1], reset: () => {} };

  const unbind = bindAudioVisualizer([button], player, visualizer, {
    requestFrame: (callback) => {
      frames.push(callback);
      return callback;
    },
    cancelFrame: () => {},
    reducedMotion: { matches: false, addEventListener: () => {}, removeEventListener: () => {} },
  });

  player.emit({ playing: true, trackIndex: 0 });
  frames.shift()();

  assert.equal(button.bars[0].style.getPropertyValue('--audio-level'), '0');
  assert.equal(button.bars[3].style.getPropertyValue('--audio-level'), '0.75');
  assert.equal(button.bars[4].style.getPropertyValue('--audio-level'), '1');

  unbind();
});
