import assert from 'node:assert/strict';
import test from 'node:test';

import path from 'node:path';
import { readFile } from 'node:fs/promises';

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

  const trackCurrent = { textContent: '' };
  const trackTotal = { textContent: '' };
  const trackName = { textContent: '' };
  const previousListeners = new Map();
  const nextListeners = new Map();
  const previousButton = {
    addEventListener(type, listener) {
      previousListeners.set(type, listener);
    },
    removeEventListener(type, listener) {
      if (previousListeners.get(type) === listener) previousListeners.delete(type);
    },
    async click() {
      await previousListeners.get('click')?.();
    },
  };
  const nextButton = {
    addEventListener(type, listener) {
      nextListeners.set(type, listener);
    },
    removeEventListener(type, listener) {
      if (nextListeners.get(type) === listener) nextListeners.delete(type);
    },
    async click() {
      await nextListeners.get('click')?.();
    },
  };
  const control = {
    dataset: {},
    querySelector(selector) {
      if (selector === '[data-audio-track-current]') return trackCurrent;
      if (selector === '[data-audio-track-total]') return trackTotal;
      if (selector === '[data-audio-track-name]') return trackName;
      if (selector === '[data-audio-previous]') return previousButton;
      if (selector === '[data-audio-next]') return nextButton;
      return null;
    },
  };

  return {
    dataset: {
      audioLabelOn: 'sound on',
      audioLabelOff: 'sound off',
      audioStart: 'turn on background music',
      audioStop: 'turn off background music',
    },
    label: { textContent: '' },
    parentElement: control,
    control,
    previousButton,
    nextButton,
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
    nextCalls: 0,
    previousCalls: 0,
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
    async next() {
      this.nextCalls += 1;
    },
    async previous() {
      this.previousCalls += 1;
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
    assert.match(html, /data-audio-previous/);
    assert.match(html, /data-audio-next/);
    assert.match(html, /data-audio-track/);
  }
});

test('shares the ordered playlist with the browser bootstrap data', () => {
  const html = renderPage('en');
  const bootData = JSON.parse(html.match(/window\.__PORTFOLIO__=(.+);<\/script>/)[1]);

  assert.deepEqual(
    bootData.audioTracks.map(({ file }) => file),
    [
      'i-am-light.mp3',
      'radiant-pulse.mp3',
      'mountain-breath.mp3',
      'filtered-aperture.mp3',
      'eastern-silk.mp3',
    ]
  );
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
  assert.equal(button.control.dataset.audioState, 'on');

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

test('binds skip buttons to player next and previous', async () => {
  const button = createButton();
  const player = createPlayer();

  const unbind = bindAudioControls([button], player, ['Track 1', 'Track 2']);

  await button.nextButton.click();
  assert.equal(player.nextCalls, 1);

  await button.previousButton.click();
  assert.equal(player.previousCalls, 1);

  unbind();
});

test('audio control hover styles are scoped to hover: hover and do not force accent color when off', async () => {
  const root = path.resolve(import.meta.dirname, '..');
  const css = await readFile(path.join(root, 'dist/styles.css'), 'utf8');

  assert.match(css, /@media\(hover:\s*hover\)/);
  assert.match(css, /\.audio-control__toggle\[data-audio-state=on\]\{color:var\(--accent\)\}/);
});
