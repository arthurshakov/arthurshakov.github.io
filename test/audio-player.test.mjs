import assert from 'node:assert/strict';
import test from 'node:test';

import { createPlaylistPlayer } from '../src/scripts/audio-player.js';

function createFakeAudio({ rejectPlay = false } = {}) {
  const listeners = new Map();

  return {
    currentTime: 0,
    paused: true,
    playCalls: 0,
    pauseCalls: 0,
    volume: 1,
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    removeEventListener(type, listener) {
      if (listeners.get(type) === listener) listeners.delete(type);
    },
    emit(type) {
      listeners.get(type)?.();
    },
    async play() {
      this.playCalls += 1;
      if (rejectPlay) throw new Error('Playback blocked');
      this.paused = false;
    },
    pause() {
      this.pauseCalls += 1;
      this.paused = true;
    },
  };
}

function createMemoryStorage() {
  const values = new Map();

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

function createTimers() {
  const timers = new Set();

  return {
    setTimer(callback) {
      const timer = { callback, active: true };
      timers.add(timer);
      return timer;
    },
    clearTimer(timer) {
      timer.active = false;
    },
    flush() {
      for (let pass = 0; pass < 20; pass += 1) {
        [...timers].forEach((timer) => {
          if (timer.active) timer.callback();
        });
      }
    },
  };
}

function makePlayer({ rejectPlay = false, crossfadeMs = 1000 } = {}) {
  const audios = [];
  const storage = createMemoryStorage();
  const timers = createTimers();
  let time = 0;
  const player = createPlaylistPlayer({
    tracks: ['/first.mp3', '/second.mp3'],
    audioFactory: () => {
      const audio = createFakeAudio({ rejectPlay: rejectPlay && audios.length === 0 });
      audios.push(audio);
      return audio;
    },
    storage,
    crossfadeMs,
    now: () => {
      time += 250;
      return time;
    },
    setTimer: timers.setTimer,
    clearTimer: timers.clearTimer,
  });

  return { player, audios, storage, timers };
}

test('does not create or play audio before an explicit start', () => {
  const { player, audios } = makePlayer();

  assert.deepEqual(player.getState(), { playing: false, trackIndex: 0 });
  assert.equal(audios.length, 0);
});

test('starts the first track and stores the enabled choice', async () => {
  const { player, audios, storage } = makePlayer();

  await player.start();

  assert.equal(audios.length, 1);
  assert.equal(audios[0].playCalls, 1);
  assert.equal(audios[0].paused, false);
  assert.equal(storage.getItem('portfolio:music'), 'on');
  assert.deepEqual(player.getState(), { playing: true, trackIndex: 0 });
});

test('crossfades to the next track after a track ends', async () => {
  const { player, audios, timers } = makePlayer();

  await player.start();
  audios[0].emit('ended');
  await Promise.resolve();

  assert.equal(audios.length, 2);
  assert.equal(audios[1].playCalls, 1);
  assert.equal(audios[1].volume, 0);

  timers.flush();

  assert.equal(audios[0].paused, true);
  assert.equal(audios[1].volume, 1);
  assert.deepEqual(player.getState(), { playing: true, trackIndex: 1 });
});

test('returns to off when playback is rejected', async () => {
  const { player, storage } = makePlayer({ rejectPlay: true });

  await assert.rejects(player.start(), /Playback blocked/);

  assert.equal(storage.getItem('portfolio:music'), 'off');
  assert.deepEqual(player.getState(), { playing: false, trackIndex: 0 });
});

