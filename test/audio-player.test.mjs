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
  tracks = ['/first.mp3', '/second.mp3'],
  rejectPlay = false,
  crossfadeMs = 1000,
  fadeInMs,
  fadeOutMs,
  initialPreference,
  manualClock = false,
} = {}) {
  const audios = [];
  const prepared = [];
  const storage = createMemoryStorage();
  if (initialPreference) storage.setItem('portfolio:music', initialPreference);
  const timers = createTimers();
  let graphResumes = 0;
  let time = 0;
  const player = createPlaylistPlayer({
    tracks,
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

test('moves to the next track with a crossfade while playing', async () => {
  const { player, audios, timers, advance } = makePlayer({
    crossfadeMs: 100,
    manualClock: true,
  });

  await player.start();
  await player.next();

  assert.equal(player.getState().trackIndex, 1);
  assert.equal(audios.length, 2);
  assert.equal(audios[1].playCalls, 1);
  assert.equal(audios[1].volume, 0);

  advance(100);
  timers.tick();
  assert.equal(audios[0].paused, true);
  assert.equal(audios[1].volume, 1);
});

test('reports a stored enabled preference without creating audio', () => {
  const { player, audios } = makePlayer({ initialPreference: 'on' });

  assert.equal(player.hasStoredEnabledPreference(), true);
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
  const { player, audios, timers, advance } = makePlayer({
    fadeInMs: 100,
    fadeOutMs: 100,
    manualClock: true,
  });

  await player.start();
  advance(100);
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

test('temporarily suspends and resumes without changing the saved preference', async () => {
  const { player, audios, storage } = makePlayer();

  await player.start();
  player.suspend();

  assert.equal(audios[0].paused, true);
  assert.equal(storage.getItem('portfolio:music'), 'on');
  assert.deepEqual(player.getState(), { playing: false, trackIndex: 0 });

  await player.resume();
  assert.equal(audios[0].playCalls, 2);
  assert.equal(storage.getItem('portfolio:music'), 'on');
  assert.deepEqual(player.getState(), { playing: true, trackIndex: 0 });
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

test('returns to off when the active audio element errors', async () => {
  const { player, audios, storage } = makePlayer();

  await player.start();
  audios[0].emit('error');

  assert.equal(storage.getItem('portfolio:music'), 'off');
  assert.deepEqual(player.getState(), { playing: false, trackIndex: 0 });
});

test('rapidly switching tracks cancels intermediate transitions without overlapping audio', async () => {
  const { player, audios, timers } = makePlayer({
    tracks: ['/1.mp3', '/2.mp3', '/3.mp3', '/4.mp3'],
    crossfadeMs: 1000,
  });

  await player.start();
  assert.equal(player.getState().trackIndex, 0);
  assert.equal(audios.filter((a) => !a.paused).length, 1);

  // Rapidly trigger multiple skips
  const p1 = player.next();
  const p2 = player.next();
  const p3 = player.next();
  await Promise.all([p1, p2, p3]);

  // Index points to track 3 immediately
  assert.equal(player.getState().trackIndex, 3);

  // Complete crossfade
  timers.flush();

  // Exactly one track should be playing now: track 3
  const playingAudios = audios.filter((a) => !a.paused);
  assert.equal(playingAudios.length, 1);
  assert.equal(audios[3].paused, false);
  assert.equal(audios[3].volume, 1);
  assert.equal(audios[0].paused, true);
  assert.equal(audios[1].paused, true);
  assert.equal(audios[2].paused, true);
});

test('switching tracks during crossfade immediately stops the previous fading track', async () => {
  const { player, audios, timers, advance } = makePlayer({
    tracks: ['/1.mp3', '/2.mp3', '/3.mp3'],
    crossfadeMs: 1000,
    manualClock: true,
  });

  await player.start();
  assert.equal(player.getState().trackIndex, 0);

  // Switch to track 1
  await player.next();
  assert.equal(player.getState().trackIndex, 1);

  // Advance 500ms into the 1000ms crossfade
  advance(500);
  timers.tick();
  assert.equal(audios[0].paused, false); // still fading out
  assert.equal(audios[1].paused, false); // fading in

  // Now switch to track 2 in the middle of the crossfade
  await player.next();
  assert.equal(player.getState().trackIndex, 2);

  // audios[0] MUST be stopped immediately
  assert.equal(audios[0].paused, true);

  // Complete crossfade between track 1 and track 2
  advance(1000);
  timers.tick();
  assert.equal(audios[1].paused, true);
  assert.equal(audios[2].paused, false);
  assert.equal(audios[2].volume, 1);

  const playingAudios = audios.filter((a) => !a.paused);
  assert.equal(playingAudios.length, 1);
});

test('starts playback and switches to the next track when next is called while stopped', async () => {
  const { player, audios, storage } = makePlayer({
    tracks: ['/1.mp3', '/2.mp3', '/3.mp3'],
  });

  assert.equal(player.getState().playing, false);
  assert.equal(player.getState().trackIndex, 0);

  await player.next();

  assert.equal(player.getState().playing, true);
  assert.equal(player.getState().trackIndex, 1);
  assert.equal(storage.getItem('portfolio:music'), 'on');
  assert.equal(audios.length, 1);
  assert.equal(audios[0].paused, false);
  assert.equal(audios[0].playCalls, 1);
});

test('starts playback and switches to the previous track when previous is called while stopped', async () => {
  const { player, audios, storage } = makePlayer({
    tracks: ['/1.mp3', '/2.mp3', '/3.mp3'],
  });

  assert.equal(player.getState().playing, false);
  assert.equal(player.getState().trackIndex, 0);

  await player.previous();

  assert.equal(player.getState().playing, true);
  assert.equal(player.getState().trackIndex, 2);
  assert.equal(storage.getItem('portfolio:music'), 'on');
  assert.equal(audios.length, 1);
  assert.equal(audios[0].paused, false);
  assert.equal(audios[0].playCalls, 1);
});

test('allows selecting track without starting playback when play option is false', async () => {
  const { player, audios, storage } = makePlayer({
    tracks: ['/1.mp3', '/2.mp3', '/3.mp3'],
  });

  await player.select(2, { play: false });

  assert.equal(player.getState().playing, false);
  assert.equal(player.getState().trackIndex, 2);
  assert.equal(storage.getItem('portfolio:music'), null);
  assert.equal(audios.length, 0);
});
