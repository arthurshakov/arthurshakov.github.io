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
    tick() {
      [...timers].forEach((timer) => {
        if (timer.active) timer.callback();
      });
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

function makePlayer({
  rejectPlay = false,
  crossfadeMs = 1000,
  fadeInMs,
  fadeOutMs,
  manualClock = false,
} = {}) {
  const audios = [];
  const prepared = [];
  const storage = createMemoryStorage();
  const timers = createTimers();
  let graphResumes = 0;
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
    fadeInMs,
    fadeOutMs,
    now: () => {
      if (manualClock) return time;
      time += 250;
      return time;
    },
    setTimer: timers.setTimer,
    clearTimer: timers.clearTimer,
    prepareAudio: (audio) => prepared.push(audio),
    resumeAudioGraph: async () => {
      graphResumes += 1;
    },
  });

  return {
    player,
    audios,
    storage,
    timers,
    prepared,
    get graphResumes() {
      return graphResumes;
    },
    advance(milliseconds) {
      time += milliseconds;
    },
  };
}

test('does not create or play audio before an explicit start', () => {
  const { player, audios } = makePlayer();

  assert.deepEqual(player.getState(), { playing: false, trackIndex: 0 });
  assert.equal(audios.length, 0);
});

test('starts the first track and stores the enabled choice', async () => {
  const { player, audios, storage, prepared } = makePlayer();

  await player.start();

  assert.equal(audios.length, 1);
  assert.equal(audios[0].playCalls, 1);
  assert.equal(audios[0].paused, false);
  assert.equal(storage.getItem('portfolio:music'), 'on');
  assert.deepEqual(prepared, [audios[0]]);
  assert.deepEqual(player.getState(), { playing: true, trackIndex: 0 });
});

test('fades the first track in over the configured duration', async () => {
  const { player, audios, timers, advance } = makePlayer({ fadeInMs: 100, manualClock: true });

  await player.start();

  assert.equal(audios[0].volume, 0);
  advance(50);
  timers.tick();
  assert.equal(audios[0].volume, 0.5);
  advance(50);
  timers.tick();
  assert.equal(audios[0].volume, 1);
});

test('fades the active track out before stopping it', async () => {
  const { player, audios, timers, advance } = makePlayer({ fadeOutMs: 100, manualClock: true });

  await player.start();
  advance(200);
  timers.tick();
  player.stop();

  assert.equal(audios[0].paused, false);
  advance(50);
  timers.tick();
  assert.equal(audios[0].volume, 0.5);
  advance(50);
  timers.tick();
  assert.equal(audios[0].paused, true);
});

test('resumes the active track from the position where it was paused', async () => {
  const { player, audios, timers, advance } = makePlayer({
    fadeInMs: 200,
    fadeOutMs: 200,
    manualClock: true,
  });

  await player.start();
  advance(200);
  timers.tick();
  audios[0].currentTime = 37;
  player.stop();
  advance(200);
  timers.tick();

  assert.equal(audios[0].currentTime, 37);
  await player.start();
  assert.equal(audios[0].currentTime, 37);
  assert.equal(audios[0].playCalls, 2);
});

test('resumes the audio graph from the explicit start path', async () => {
  const setup = makePlayer();

  await setup.player.start();

  assert.equal(setup.graphResumes, 1);
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
