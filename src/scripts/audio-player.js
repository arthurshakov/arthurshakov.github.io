const STORAGE_KEY = 'portfolio:music';

const clamp = (value) => Math.max(0, Math.min(1, value));

export function createPlaylistPlayer({
  tracks,
  audioFactory = (src) => new Audio(src),
  storage = window.localStorage,
  crossfadeMs = 1500,
  now = () => Date.now(),
  setTimer = window.setInterval,
  clearTimer = window.clearInterval,
  prepareAudio = () => {},
  resumeAudioGraph = async () => {},
} = {}) {
  if (!Array.isArray(tracks) || tracks.length === 0) {
    throw new TypeError('createPlaylistPlayer requires at least one track');
  }

  let currentAudio = null;
  let currentIndex = 0;
  let fadeTimer = null;
  let playing = false;
  let destroyed = false;
  const listeners = new Set();
  const endedListeners = new WeakMap();

  const state = () => ({ playing, trackIndex: currentIndex });
  const notify = () => listeners.forEach((listener) => listener(state()));

  const persist = (value) => {
    try {
      storage?.setItem(STORAGE_KEY, value);
    } catch {
      // Storage is an enhancement; playback must remain usable without it.
    }
  };

  const clearFade = () => {
    if (!fadeTimer) return;
    clearTimer(fadeTimer);
    fadeTimer = null;
  };

  const removeEndedListener = (audio) => {
    const listener = endedListeners.get(audio);
    if (!listener) return;
    audio.removeEventListener('ended', listener);
    endedListeners.delete(audio);
  };

  const createAudio = (index) => {
    const audio = audioFactory(tracks[index]);
    audio.preload = 'auto';
    prepareAudio(audio);
    return audio;
  };

  const stopAudio = (audio) => {
    if (!audio) return;
    removeEndedListener(audio);
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch {
      // Some media implementations expose a read-only currentTime.
    }
  };

  const attachEndedListener = (audio) => {
    const listener = () => {
      transition(audio).catch(() => {
        if (audio === currentAudio) {
          playing = false;
          persist('off');
          notify();
        }
      });
    };
    endedListeners.set(audio, listener);
    audio.addEventListener('ended', listener);
  };

  const transition = async (outgoing) => {
    if (!playing || destroyed || outgoing !== currentAudio) return;

    const nextIndex = (currentIndex + 1) % tracks.length;
    const incoming = createAudio(nextIndex);
    incoming.volume = 0;

    try {
      await incoming.play();
    } catch (error) {
      stopAudio(incoming);
      playing = false;
      persist('off');
      notify();
      throw error;
    }

    attachEndedListener(incoming);
    currentAudio = incoming;
    currentIndex = nextIndex;
    notify();

    const startedAt = now();
    clearFade();
    fadeTimer = setTimer(() => {
      const progress = clamp((now() - startedAt) / crossfadeMs);
      incoming.volume = progress;
      outgoing.volume = 1 - progress;

      if (progress < 1) return;
      clearFade();
      stopAudio(outgoing);
      incoming.volume = 1;
    }, 50);
  };

  const start = async () => {
    if (destroyed) throw new Error('Playlist player has been destroyed');
    if (playing) return;

    clearFade();
    currentAudio ??= createAudio(currentIndex);

    try {
      await resumeAudioGraph();
      await currentAudio.play();
    } catch (error) {
      playing = false;
      persist('off');
      notify();
      throw error;
    }

    attachEndedListener(currentAudio);
    playing = true;
    persist('on');
    notify();
  };

  const stop = () => {
    clearFade();
    playing = false;
    stopAudio(currentAudio);
    persist('off');
    notify();
  };

  return {
    start,
    stop,
    async toggle() {
      if (playing) {
        stop();
        return;
      }
      await start();
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(state());
      return () => listeners.delete(listener);
    },
    getState: state,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      clearFade();
      stopAudio(currentAudio);
      listeners.clear();
    },
  };
}
