import assert from 'node:assert/strict';
import test from 'node:test';

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

function createMockElement(tagName, { attributes = {}, classes = [], parent = null } = {}) {
  const classList = new Set(classes);
  const attrs = new Map(Object.entries(attributes));

  const element = {
    tagName: tagName.toUpperCase(),
    parentElement: parent,
    classList: {
      contains: (name) => classList.has(name),
      add: (name) => classList.add(name),
    },
    getAttribute: (name) => attrs.get(name) ?? null,
    hasAttribute: (name) => attrs.has(name),
    closest(selector) {
      const parts = selector.split(',').map((s) => s.trim());
      let current = this;
      while (current) {
        for (const part of parts) {
          if (part === 'button' && current.tagName === 'BUTTON') return current;
          if (part === 'a[href]' && current.tagName === 'A' && current.hasAttribute('href')) return current;
          if (part.startsWith('.') && current.classList.contains(part.slice(1))) return current;
          if (part.startsWith('[data-') && part.endsWith(']')) {
            const attrName = part.slice(1, -1);
            if (current.hasAttribute(attrName)) return current;
          }
          if (part === 'button:disabled' && current.tagName === 'BUTTON' && current.hasAttribute('disabled')) return current;
          if (part === '[aria-disabled="true"]' && current.getAttribute('aria-disabled') === 'true') return current;
        }
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

test('isClickableTarget distinguishes interactive controls from passive elements', () => {
  const button = Object.setPrototypeOf(createMockElement('button'), globalThis.Element.prototype);
  const link = Object.setPrototypeOf(createMockElement('a', { attributes: { href: 'https://example.com' } }), globalThis.Element.prototype);
  const disabledButton = Object.setPrototypeOf(createMockElement('button', { attributes: { disabled: '' } }), globalThis.Element.prototype);
  const chip = Object.setPrototypeOf(createMockElement('button', { classes: ['chip'], attributes: { 'data-filter': 'all' } }), globalThis.Element.prototype);
  const worksRow = Object.setPrototypeOf(createMockElement('div', { classes: ['works-row'], attributes: { 'data-slug': 'project-1' } }), globalThis.Element.prototype);
  const worksChild = Object.setPrototypeOf(createMockElement('span', { parent: worksRow }), globalThis.Element.prototype);
  const passiveDiv = Object.setPrototypeOf(createMockElement('div'), globalThis.Element.prototype);

  assert.equal(isClickableTarget(button), true);
  assert.equal(isClickableTarget(link), true);
  assert.equal(isClickableTarget(chip), true);
  assert.equal(isClickableTarget(worksChild), true);
  assert.equal(isClickableTarget(disabledButton), false);
  assert.equal(isClickableTarget(passiveDiv), false);
});

test('bindClickSound fires on pointerdown only for interactive targets when sound is enabled', () => {
  const listeners = new Map();
  const mockRoot = {
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    removeEventListener(type, listener) {
      if (listeners.get(type) === listener) listeners.delete(type);
    },
  };

  const mockContext = createMockAudioContext();
  let soundEnabled = false;

  const unsubscribe = bindClickSound({
    root: mockRoot,
    context: mockContext,
    isSoundEnabled: () => soundEnabled,
  });

  const pointerdown = listeners.get('pointerdown');
  assert.equal(typeof pointerdown, 'function');

  const button = Object.setPrototypeOf(createMockElement('button'), globalThis.Element.prototype);
  const audioToggle = Object.setPrototypeOf(createMockElement('button', { attributes: { 'data-audio-toggle': '' } }), globalThis.Element.prototype);
  const passive = Object.setPrototypeOf(createMockElement('div'), globalThis.Element.prototype);

  // When sound is disabled: passive click -> no sound
  pointerdown({ button: 0, target: passive });
  assert.equal(mockContext.createdOscillators.length, 0);

  // When sound is disabled: normal button -> no sound
  pointerdown({ button: 0, target: button });
  assert.equal(mockContext.createdOscillators.length, 0);

  // When sound is disabled: clicking audio toggle -> plays blip
  pointerdown({ button: 0, target: audioToggle });
  assert.equal(mockContext.createdOscillators.length, 1);

  // Enable sound
  soundEnabled = true;

  // Secondary mouse button (right click) -> no sound
  pointerdown({ button: 2, target: button });
  assert.equal(mockContext.createdOscillators.length, 1);

  // Primary click on interactive element -> plays blip
  pointerdown({ button: 0, target: button });
  assert.equal(mockContext.createdOscillators.length, 2);

  // Keyboard activation (click with detail === 0) -> plays blip
  const click = listeners.get('click');
  click({ detail: 0, target: button });
  assert.equal(mockContext.createdOscillators.length, 3);

  // Keyboard activation on non-interactive element -> no sound
  click({ detail: 0, target: passive });
  assert.equal(mockContext.createdOscillators.length, 3);

  unsubscribe();
  assert.equal(listeners.has('pointerdown'), false);
  assert.equal(listeners.has('click'), false);
});
