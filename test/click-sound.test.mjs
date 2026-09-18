import { createPageLifetime } from '../src/scripts/page-lifetime.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

import {
  playSineBlip,
  isClickableTarget,
  bindClickSound,
  setAudioContext,
} from '../src/scripts/click-sound.js';

function createMockAudioContext({ state = 'running', currentTime = 10.0 } = {}) {
  const context = {
    state,
    currentTime,
    resumeCalls: 0,
    async resume() {
      this.resumeCalls += 1;
      this.state = 'running';
    },
    destination: { name: 'destination' },
    createdOscillators: [],
    createdGains: [],
    createOscillator() {
      const osc = {
        type: '',
        frequency: {
          setValueCalls: [],
          exponentialRampCalls: [],
          setValueAtTime(val, time) {
            this.setValueCalls.push({ val, time });
          },
          exponentialRampToValueAtTime(val, time) {
            this.exponentialRampCalls.push({ val, time });
          },
        },
        connections: [],
        connect(target) {
          this.connections.push(target);
        },
        disconnectCalls: 0,
        disconnect() {
          this.disconnectCalls += 1;
        },
        startCalls: [],
        start(time) {
          this.startCalls.push(time);
        },
        stopCalls: [],
        stop(time) {
          this.stopCalls.push(time);
        },
        onended: null,
      };
      context.createdOscillators.push(osc);
      return osc;
    },
    createGain() {
      const gain = {
        gain: {
          setValueCalls: [],
          exponentialRampCalls: [],
          setValueAtTime(val, time) {
            this.setValueCalls.push({ val, time });
          },
          exponentialRampToValueAtTime(val, time) {
            this.exponentialRampCalls.push({ val, time });
          },
        },
        connections: [],
        connect(target) {
          this.connections.push(target);
        },
        disconnectCalls: 0,
        disconnect() {
          this.disconnectCalls += 1;
        },
      };
      context.createdGains.push(gain);
      return gain;
    },
  };
  return context;
}

test('playSineBlip synthesizes a sine frequency ramp and gain envelope', () => {
  const mockContext = createMockAudioContext();
  playSineBlip({ volume: 1.0, pitch: 1.25, context: mockContext });

  assert.equal(mockContext.createdOscillators.length, 1);
  assert.equal(mockContext.createdGains.length, 1);

  const osc = mockContext.createdOscillators[0];
  const gain = mockContext.createdGains[0];

  assert.equal(osc.type, 'sine');
  // Frequency: 1600 * 1.25 = 2000, 400 * 1.25 = 500
  assert.deepEqual(osc.frequency.setValueCalls, [{ val: 2000, time: 10.0 }]);
  assert.deepEqual(osc.frequency.exponentialRampCalls, [{ val: 500, time: 10.018 }]);

  // Gain: 0.5 * 1.0 = 0.5 down to 0.0001
  assert.deepEqual(gain.gain.setValueCalls, [{ val: 0.5, time: 10.0 }]);
  assert.deepEqual(gain.gain.exponentialRampCalls, [{ val: 0.0001, time: 10.018 }]);

  // Connections and timing
  assert.equal(osc.connections[0], gain);
  assert.equal(gain.connections[0], mockContext.destination);
  assert.deepEqual(osc.startCalls, [10.0]);
  assert.deepEqual(osc.stopCalls, [10.02]);

  // Node disconnect upon ending
  assert.equal(typeof osc.onended, 'function');
  osc.onended();
  assert.equal(osc.disconnectCalls, 1);
  assert.equal(gain.disconnectCalls, 1);
});

test('playSineBlip resumes a suspended audio context', async () => {
  const mockContext = createMockAudioContext({ state: 'suspended' });
  playSineBlip({ volume: 0.8, pitch: 1.0, context: mockContext });

  assert.equal(mockContext.resumeCalls, 1);
});

test('playSineBlip supports positional arguments and returns early when volume is 0', () => {
  const mockContext = createMockAudioContext();
  setAudioContext(mockContext);

  playSineBlip(0, 1.25);
  assert.equal(mockContext.createdOscillators.length, 0);

  playSineBlip(0.8, 1.5);
  assert.equal(mockContext.createdOscillators.length, 1);
  const osc = mockContext.createdOscillators[0];
  assert.equal(osc.frequency.setValueCalls[0].val, 1600 * 1.5);

  setAudioContext(null);
});

function matchesSelector(el, selector) {
  const parts = selector.split(',').map((s) => s.trim());
  return parts.some((sel) => {
    // Check tag (e.g. "button", "a")
    const tagMatch = sel.match(/^([a-z0-9]+)/i);
    if (tagMatch && el.tagName !== tagMatch[1].toUpperCase()) {
      return false;
    }
    // Check classes (e.g. ".preview-thumbnail", ".is-active")
    const classMatches = [...sel.matchAll(/\.([a-zA-Z0-9_-]+)/g)];
    for (const cm of classMatches) {
      if (!el.classList.contains(cm[1])) return false;
    }
    // Check attributes (e.g. "[data-slug]", '[aria-pressed="true"]')
    const attrMatches = [...sel.matchAll(/\[([a-zA-Z0-9_-]+)(?:="([^"]*)")?\]/g)];
    for (const am of attrMatches) {
      const attrName = am[1];
      const attrVal = am[2];
      if (!el.hasAttribute(attrName)) return false;
      if (attrVal !== undefined && el.getAttribute(attrName) !== attrVal) return false;
    }
    // Check pseudo-class :disabled
    if (sel.includes(':disabled') && !el.hasAttribute('disabled')) {
      return false;
    }
    return true;
  });
}

function createMockElement(tagName, { attributes = {}, classes = [], parent = null } = {}) {
  const classList = new Set(classes);
  const attrs = new Map(Object.entries(attributes));

  const element = {
    tagName: tagName.toUpperCase(),
    parentElement: parent,
    classList: {
      contains: (name) => classList.has(name),
      add: (name) => classList.add(name),
      remove: (name) => classList.delete(name),
    },
    getAttribute: (name) => attrs.get(name) ?? null,
    hasAttribute: (name) => attrs.has(name),
    closest(selector) {
      let current = this;
      while (current) {
        if (matchesSelector(current, selector)) return current;
        current = current.parentElement;
      }
      return null;
    },
  };
  return element;
}

// Ensure Element is available for instanceof check
if (typeof globalThis.Element === 'undefined') {
  globalThis.Element = class Element {};
}

test('isClickableTarget distinguishes interactive controls from passive and non-actionable elements', () => {
  const button = Object.setPrototypeOf(createMockElement('button'), globalThis.Element.prototype);
  const link = Object.setPrototypeOf(createMockElement('a', { attributes: { href: 'https://example.com' } }), globalThis.Element.prototype);
  const disabledButton = Object.setPrototypeOf(createMockElement('button', { attributes: { disabled: '' } }), globalThis.Element.prototype);
  const chip = Object.setPrototypeOf(createMockElement('button', { classes: ['chip'], attributes: { 'data-filter': 'all' } }), globalThis.Element.prototype);
  const activeChip = Object.setPrototypeOf(createMockElement('button', { classes: ['chip', 'chip--on'], attributes: { 'data-filter': 'all', 'aria-pressed': 'true' } }), globalThis.Element.prototype);
  const worksRow = Object.setPrototypeOf(createMockElement('div', { classes: ['works-row'], attributes: { 'data-slug': 'project-1' } }), globalThis.Element.prototype);
  const worksChild = Object.setPrototypeOf(createMockElement('span', { parent: worksRow }), globalThis.Element.prototype);
  const passiveDiv = Object.setPrototypeOf(createMockElement('div'), globalThis.Element.prototype);

  // Inactive vs active preview thumbnails
  const inactiveThumb = Object.setPrototypeOf(createMockElement('button', { classes: ['preview-thumbnail'], attributes: { 'data-slug': 'project-2', 'aria-pressed': 'false' } }), globalThis.Element.prototype);
  const inactiveThumbImg = Object.setPrototypeOf(createMockElement('img', { parent: inactiveThumb }), globalThis.Element.prototype);
  const activeThumb = Object.setPrototypeOf(createMockElement('button', { classes: ['preview-thumbnail', 'is-active'], attributes: { 'data-slug': 'project-1', 'aria-pressed': 'true' } }), globalThis.Element.prototype);
  const activeThumbImg = Object.setPrototypeOf(createMockElement('img', { parent: activeThumb }), globalThis.Element.prototype);

  // Navigation language links
  const activeLangPill = Object.setPrototypeOf(createMockElement('a', { classes: ['pill', 'pill--on'], attributes: { href: '/ru/', 'aria-current': 'page' } }), globalThis.Element.prototype);
  const inactiveLangPill = Object.setPrototypeOf(createMockElement('a', { classes: ['pill', 'pill--off'], attributes: { href: '/' } }), globalThis.Element.prototype);

  // Animating or dragging slider container
  const animatingParent = Object.setPrototypeOf(createMockElement('div', { classes: ['preview-frame', 'is-animating'] }), globalThis.Element.prototype);
  const thumbInsideAnimation = Object.setPrototypeOf(createMockElement('button', { classes: ['preview-thumbnail'], parent: animatingParent, attributes: { 'data-slug': 'project-3', 'aria-pressed': 'false' } }), globalThis.Element.prototype);


  // Audio toggle (remains clickable even when aria-pressed is true)
  const audioToggleOn = Object.setPrototypeOf(createMockElement('button', { attributes: { 'data-audio-toggle': '', 'aria-pressed': 'true' } }), globalThis.Element.prototype);
  const audioToggleOff = Object.setPrototypeOf(createMockElement('button', { attributes: { 'data-audio-toggle': '', 'aria-pressed': 'false' } }), globalThis.Element.prototype);

  assert.equal(isClickableTarget(button), true);
  assert.equal(isClickableTarget(link), true);
  assert.equal(isClickableTarget(chip), true);
  assert.equal(isClickableTarget(worksChild), true);
  assert.equal(isClickableTarget(disabledButton), false);
  assert.equal(isClickableTarget(passiveDiv), false);

  // Active elements produce no state change and should not emit click sounds
  assert.equal(isClickableTarget(inactiveThumb), true);
  assert.equal(isClickableTarget(inactiveThumbImg), true);
  assert.equal(isClickableTarget(activeThumb), false);
  assert.equal(isClickableTarget(activeThumbImg), false);
  assert.equal(isClickableTarget(activeChip), false);
  assert.equal(isClickableTarget(activeLangPill), false);
  assert.equal(isClickableTarget(inactiveLangPill), true);
  assert.equal(isClickableTarget(thumbInsideAnimation), true);

  // Audio toggle always toggles state
  assert.equal(isClickableTarget(audioToggleOn), true);
  assert.equal(isClickableTarget(audioToggleOff), true);
});

function soundHarness() {
  const listeners = new Map();
  const context = createMockAudioContext();
  let enabled = true;
  const cleanup = bindClickSound({
    root: {
      addEventListener: (type, handler) => listeners.set(type, handler),
      removeEventListener: (type) => listeners.delete(type),
    }, context, isSoundEnabled: () => enabled,
  });
  return {
    listeners, cleanup, context,
    mute: () => { enabled = false; },
    count: () => context.createdOscillators.length,
    click: (target, detail = 1, button = 0) => listeners.get('click')({ target, detail, button }),
    confirmClick: (target) => listeners.get('ui:action')({ target }),
  };
}
const element = (tag, options) => Object.setPrototypeOf(createMockElement(tag, options), Element.prototype);

test('ordinary clicks sound once; presses, disabled controls and secondary clicks stay silent', () => {
  const h = soundHarness();
  const link = element('a', { attributes: { href: '/ru/' } });
  assert.equal(h.listeners.has('pointerdown'), false);
  assert.equal(h.count(), 0); // A press cancelled before click cannot play sound.
  h.click(link);
  h.click(link, 0);
  assert.equal(h.count(), 2);
  h.click(link, 1, 2);
  h.click(element('button', { attributes: { disabled: '' } }));
  h.click(element('div'));
  assert.equal(h.count(), 2);
  h.mute();
  h.click(link);
  assert.equal(h.count(), 2);
  h.cleanup();
  assert.equal(h.listeners.size, 0);
});

test('stateful controls need confirmation, while nested links work during animation', () => {
  const h = soundHarness();
  const frame = element('div', { classes: ['is-animating'] });
  const row = element('div', { classes: ['works-row'] });
  const chip = element('button', { classes: ['chip--on'], attributes: { 'data-filter': 'all' } });
  const nav = element('button', { parent: frame, attributes: { 'data-preview-next': '' } });
  for (const control of [row, chip, nav]) {
    h.click(control);
    h.click(control, 0);
  }
  assert.equal(h.count(), 0);
  for (const control of [row, chip, nav]) h.confirmClick(control);
  assert.equal(h.count(), 3);
  h.click(element('a', { parent: row, attributes: { href: 'https://example.com' } }));
  h.click(element('a', { parent: frame, attributes: { href: 'https://example.com' } }), 0);
  assert.equal(h.count(), 5);
  h.click(element('a', { attributes: { href: '/', 'aria-current': 'page' } }));
  assert.equal(h.count(), 5);
  h.mute();
  h.confirmClick(chip);
  assert.equal(h.count(), 5);
});

test('all music controls sound on click even when starting from muted state', () => {
  const h = soundHarness();
  h.mute();
  for (const attr of ['data-audio-toggle', 'data-audio-next', 'data-audio-previous']) {
    const button = element('button', { attributes: { [attr]: '' } });
    h.click(button);
    h.click(button, 0);
  }
  assert.equal(h.count(), 6);
});

// Exercise the actual app thumbnail handler together with the sound bindings.
test('thumbnail selection sounds only for accepted mouse and keyboard clicks', async () => {
  const app = await readFile(new URL('../src/scripts/project-preview.js', import.meta.url), 'utf8');
  const start = app.indexOf('  thumbnails.forEach((thumbnail) => {', app.indexOf('// Миниатюры меняют'));
  const end = app.indexOf('  const onPrevClick', start);
  assert.ok(start >= 0 && end > start);
  const listeners = new Map();
  const context = createMockAudioContext();
  const unsubscribe = bindClickSound({
    root: {
      addEventListener: (type, listener) => listeners.set(type, listener),
      removeEventListener: (type) => listeners.delete(type),
    },
    context,
  });
  const thumb = Object.setPrototypeOf(createMockElement('button', {
    classes: ['preview-thumbnail'], attributes: { 'data-slug': 'second' },
  }), globalThis.Element.prototype);
  let select;
  thumb.dataset = { slug: 'second' };
  thumb.addEventListener = (type, handler) => { select = handler; };
  thumb.dispatchEvent = (event) => listeners.get(event.type)?.({ target: thumb });
  let dragAge = 1;
  const scope = {
    lifetime: createPageLifetime(),
    thumbnails: [thumb], currentSlug: 'first', isAnimating: false,
    stripDraggable: { isDragging: false, isThrowing: false, timeSinceDrag: () => dragAge },
    window: { innerWidth: 390 },
    confirmClick: (target) => listeners.get('ui:action')({ target }),
    setActive(slug) {
      if (slug !== 'second') return;
      scope.currentSlug = slug;
      thumb.classList.add('is-active');
    },
  };
  vm.runInNewContext(app.slice(start, end), scope);
  const click = (detail = 1) => {
    const event = { detail, target: thumb, preventDefault() {} };
    select(event);
    listeners.get('click')(event);
  };
  const press = () => { assert.equal(listeners.has('pointerdown'), false); };
  const reset = () => {
    scope.currentSlug = 'first';
    thumb.classList.remove('is-active');
  };

  press(); // Start a drag on an inactive thumbnail.
  scope.stripDraggable.isDragging = true;
  click();
  scope.stripDraggable.isDragging = false;
  scope.stripDraggable.isThrowing = true;
  click();
  scope.stripDraggable.isThrowing = false;
  dragAge = 0.05;
  click();
  assert.equal(scope.currentSlug, 'first');
  assert.equal(context.createdOscillators.length, 0);

  dragAge = 1;
  scope.isAnimating = true;
  press();
  click();
  assert.equal(scope.currentSlug, 'first');
  assert.equal(context.createdOscillators.length, 0);
  scope.isAnimating = false;

  press();
  click();
  assert.equal(scope.currentSlug, 'second');
  assert.equal(context.createdOscillators.length, 1);
  press();
  click(); // Already active.
  assert.equal(context.createdOscillators.length, 1);

  reset();
  click(0); // Enter/Space: no pointerdown, state updated before bubbling click.
  assert.equal(scope.currentSlug, 'second');
  assert.equal(context.createdOscillators.length, 2);

  reset();
  thumb.dataset.slug = 'missing';
  click();
  assert.equal(scope.currentSlug, 'first');
  assert.equal(context.createdOscillators.length, 2);
  unsubscribe();
});

test('actual filter handler confirms only accepted selections, including keyboard', async () => {
  const source = await readFile(new URL('../src/scripts/works-filters.js', import.meta.url), 'utf8');
  const start = source.indexOf('  chips.forEach((chip) => {\n    lifetime.listen(chip,');
  const end = source.indexOf('  // Пересчитываем только собственную ленту фильтров.', start);
  assert.ok(start > 0 && end > start);
  const h = soundHarness();
  const chip = element('button', { attributes: { 'data-filter': 'games' } });
  chip.dataset = { filter: 'games' };
  let handler;
  chip.addEventListener = (_, fn) => { handler = fn; };
  const scope = {
    lifetime: createPageLifetime(),
    chips: [chip], activeFilter: 'all',
    filtersDraggable: { isDragging: false, isThrowing: false, timeSinceDrag: () => 1 },
    confirmClick: h.confirmClick,
    applyFilter: (filter) => { scope.activeFilter = filter; chip.classList.add('chip--on'); },
    scrollFilterIntoView() {},
  };
  vm.runInNewContext(source.slice(start, end), scope);
  scope.filtersDraggable.isDragging = true;
  handler(); h.click(chip);
  scope.filtersDraggable.isDragging = false;
  scope.filtersDraggable.isThrowing = true;
  handler(); h.click(chip);
  assert.equal(h.count(), 0);
  scope.filtersDraggable.isThrowing = false;
  handler(); h.click(chip, 0);
  assert.equal(scope.activeFilter, 'games');
  assert.equal(h.count(), 1);
  handler(); h.click(chip);
  assert.equal(h.count(), 1);
});

test('actual preview navigation and row handlers sound only when setActive accepts', async () => {
  const source = await readFile(new URL('../src/scripts/project-preview.js', import.meta.url), 'utf8');
  const h = soundHarness();
  const handlers = new Map();
  const control = (attrs, classes = []) => {
    const target = element('button', { attributes: attrs, classes });
    target.dataset = { slug: 'second' };
    target.addEventListener = (_, fn) => handlers.set(target, fn);
    return target;
  };
  const prev = control({ 'data-preview-prev': '' });
  const next = control({ 'data-preview-next': '' });
  const row = control({ 'data-slug': 'second' }, ['works-row']);
  let accepted = false;
  const scope = {
    lifetime: createPageLifetime(),
    btnPrev: prev, btnNext: next, rows: [row], cards: [], currentSlug: 'first',
    currentPageData: { projects: [{slug:'first'}, {slug:'second'}] },
    setActive: () => accepted, confirmClick: h.confirmClick,
  };
  let start = source.indexOf('  const onPrevClick');
  let end = source.indexOf('  const onKeydown', start);
  vm.runInNewContext(source.slice(start, end), scope);
  start = source.indexOf('  function wireRow');
  end = source.indexOf('  calculateMaxHeight();', start);
  vm.runInNewContext(source.slice(start, end), scope);
  for (const target of [prev, next, row]) {
    handlers.get(target)({ target, preventDefault() {} }); h.click(target, 0);
  }
  assert.equal(h.count(), 0);
  accepted = true;
  for (const target of [prev, next, row]) {
    handlers.get(target)({ target, preventDefault() {} }); h.click(target, 0);
  }
  assert.equal(h.count(), 3);
  const link = element('a', { parent: row, attributes: { href: 'https://example.com' } });
  handlers.get(row)({ target: link }); h.click(link);
  assert.equal(h.count(), 4); // The row must not also confirm the nested link.
});

test('cancelled native clicks stay silent; PJAX confirms one accepted language change', async () => {
  const { createPjaxRouter } = await import('../src/scripts/pjax.js');
  const h = soundHarness();
  const link = element('a', { attributes: { href: '/ru/' } });
  link.href = 'https://example.com/ru/';
  link.dispatchEvent = () => h.confirmClick(link);
  const previousCustomEvent = globalThis.CustomEvent;
  globalThis.CustomEvent ??= class { constructor(type) { this.type = type; } };
  try {
    let onClick;
    createPjaxRouter({
      docObj: { addEventListener: (_, fn) => { onClick = fn; } },
      windowObj: {
        location: { href: 'https://example.com/', pathname: '/', origin: 'https://example.com' },
        addEventListener() {},
      },
      fetchHtml: () => new Promise(() => {}),
    });
    const event = () => ({ target: link, button: 0, detail: 0, defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; } });
    const cancelled = event(); cancelled.preventDefault();
    h.listeners.get('click')(cancelled);
    assert.equal(h.count(), 0);
    const first = event(); onClick(first); h.listeners.get('click')(first);
    assert.equal(h.count(), 1);
    const repeated = event(); onClick(repeated); h.listeners.get('click')(repeated);
    assert.equal(h.count(), 1);
  } finally {
    if (previousCustomEvent === undefined) delete globalThis.CustomEvent;
    else globalThis.CustomEvent = previousCustomEvent;
  }
});
