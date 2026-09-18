import assert from 'node:assert/strict';
import test from 'node:test';
import { createPreviewDetails } from '../src/scripts/preview-details.js';
import { createProjectPreview } from '../src/scripts/project-preview.js';

test('destroy stops scrambling the detached title', (t) => {
  const pending = new Map();
  t.mock.method(globalThis, 'setInterval', (callback) => { pending.set(1, callback); return 1; });
  t.mock.method(globalThis, 'clearInterval', (id) => pending.delete(id));
  const oldWindow = globalThis.window;
  const oldDocument = globalThis.document;
  globalThis.window = globalThis;
  globalThis.document = { getElementById: () => null };
  t.after(() => { globalThis.window = oldWindow; globalThis.document = oldDocument; });
  const details = createPreviewDetails({ projects: [] }, {}, null);
  const title = { textContent: 'original' };
  details.scrambleText(title, 'next');
  details.destroy();
  for (const callback of pending.values()) callback();
  assert.equal(title.textContent, 'original');
  assert.equal(pending.size, 0);
});

test('destroy prevents deferred measurements from touching the old page', async (t) => {
  const old = Object.fromEntries(['window', 'document', 'requestAnimationFrame', 'cancelAnimationFrame'].map(key => [key, globalThis[key]]));
  t.after(() => Object.assign(globalThis, old));
  let fontsReady;
  let measurements = 0;
  const frames = new Map();
  const info = { getBoundingClientRect() { measurements++; return { width: 0 }; } };
  globalThis.window = Object.assign(new EventTarget(), { matchMedia: () => ({ matches: false }), clearTimeout });
  globalThis.document = Object.assign(new EventTarget(), {
    querySelector: (selector) => selector === '[data-preview-info]' ? info : null,
    querySelectorAll: () => [],
    getElementById: () => null,
    fonts: { ready: new Promise(resolve => { fontsReady = resolve; }) },
  });
  globalThis.requestAnimationFrame = callback => { frames.set(1, callback); return 1; };
  globalThis.cancelAnimationFrame = id => frames.delete(id);
  const preview = createProjectPreview({ projects: [] });
  assert.equal(measurements, 1);
  preview.destroy();
  fontsReady();
  await Promise.resolve();
  for (const callback of frames.values()) callback();
  assert.equal(measurements, 1);
  assert.equal(frames.size, 0);
});

for (const phase of ['loading', 'metadata', 'prepared', 'sweeping']) {
  test(`language switch during ${phase} stops both old videos and preserves positions`, async (t) => {
    const keys = ['window', 'document', 'requestAnimationFrame', 'cancelAnimationFrame', 'IntersectionObserver'];
    const old = Object.fromEntries(keys.map(key => [key, globalThis[key]]));
    t.after(() => Object.assign(globalThis, old));
    const frames = new Map();
    const timers = new Map();
    let nextId = 0;
    const frame = callback => { frames.set(++nextId, callback); return nextId; };
    const flushFrames = () => {
      const callbacks = [...frames.values()]; frames.clear();
      callbacks.forEach(callback => callback(performance.now()));
    };
    const node = () => Object.assign(new EventTarget(), {
      style: {}, classList: { add() {}, remove() {} },
      removeAttribute() {}, replaceChildren() {}, append() {},
    });
    const video = () => Object.assign(node(), {
      readyState: 2, currentTime: 0, paused: true,
      load() {}, pause() { this.paused = true; },
      play() { this.paused = false; return Promise.resolve(); },
    });
    const outgoing = video();
    const incoming = video();
    incoming.readyState = phase === 'loading' ? 0 : phase === 'metadata' ? 1 : 2;
    const next = node();
    const elements = new Map([
      ['[data-preview-video-a]', outgoing], ['[data-preview-video-b]', incoming],
      ['[data-preview-next]', next], ['.preview-frame', node()],
      ['[data-preview-layer-a]', node()], ['[data-preview-layer-b]', node()],
      ['[data-scanline-line]', node()], ['[data-scanline-trail]', node()],
    ]);
    const observers = [];
    globalThis.IntersectionObserver = class {
      constructor(callback) { observers.push(callback); }
      observe() {} disconnect() {}
    };
    globalThis.window = Object.assign(new EventTarget(), {
      innerWidth: 1440, matchMedia: () => ({ matches: false }),
      setTimeout: callback => { timers.set(++nextId, callback); return nextId; },
      clearTimeout: id => timers.delete(id),
    });
    globalThis.document = Object.assign(new EventTarget(), {
      querySelector: selector => elements.get(selector) || null,
      querySelectorAll: () => [], createElement: () => node(),
    });
    globalThis.requestAnimationFrame = frame;
    globalThis.cancelAnimationFrame = id => frames.delete(id);
    const projects = ['first', 'second'].map(slug => ({ slug, video: { webm: `${slug}.webm`, mp4: `${slug}.mp4` } }));
    const positions = new Map([['second', 12]]);
    let selected;
    const preview = createProjectPreview({ projects }, { videoPositions: positions, onSelect: slug => { selected = slug; } });
    observers[0]([{ isIntersecting: true }]);
    outgoing.currentTime = 7;
    assert.equal(outgoing.paused, false);
    next.dispatchEvent(new Event('click'));
    assert.equal(selected, 'second');
    if (phase === 'prepared' || phase === 'sweeping') {
      assert.equal(incoming.currentTime, 12);
      incoming.currentTime = 13;
    }
    if (phase === 'sweeping') {
      flushFrames(); flushFrames(); await Promise.resolve(); flushFrames();
    }
    preview.destroy();
    preview.destroy();
    incoming.dispatchEvent(new Event('canplay'));
    for (const callback of timers.values()) callback();
    flushFrames();
    await Promise.resolve();
    assert.equal(outgoing.paused, true);
    assert.equal(incoming.paused, true);
    assert.equal(positions.get('first'), 7);
    assert.equal(positions.get('second'), ['loading', 'metadata'].includes(phase) ? 12 : 13);
    assert.equal(selected, 'second');
    assert.equal(frames.size, 0);
    assert.equal(timers.size, 0);
  });
}
