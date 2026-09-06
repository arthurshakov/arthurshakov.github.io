import assert from 'node:assert/strict';
import test from 'node:test';

import { bindAudioControls } from '../src/scripts/audio-controls.js';
import { renderPage } from '../src/template.mjs';

function createButton() {
  const listeners = new Map();
  const attributes = new Map();

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
