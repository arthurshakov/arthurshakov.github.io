const STORAGE_KEY = 'portfolio:music';

const clamp = (value) => Math.max(0, Math.min(1, value));

export function createPlaylistPlayer({
  tracks,
  audioFactory = (src) => new Audio(src),
  storage = window.localStorage,
  crossfadeMs = 1000,
  fadeInMs = 300,
  fadeOutMs = 100,
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
  let fadingAudio = null;
  let currentIndex = 0;
  let fadeTimer = null;
  let transitionToken = 0;
  let playing = false;
  let destroyed = false;
  const listeners = new Set();
  const endedListeners = new WeakMap();
  const errorListeners = new WeakMap();

  const state = () => ({ playing, trackIndex: currentIndex });
  const notify = () => listeners.forEach((listener) => listener(state()));

  const persist = (value) => {
    try {
      storage?.setItem(STORAGE_KEY, value);
    } catch {
      // Storage is an enhancement; playback must remain usable without it.
    }
  };

  const hasStoredEnabledPreference = () => {
    try {
      return storage?.getItem(STORAGE_KEY) === 'on';
    } catch {
      return false;
    }
  };

  const clearFade = () => {
    if (!fadeTimer) return;
    clearTimer(fadeTimer);
    fadeTimer = null;
  };

  const stopFadingAudio = () => {
    if (!fadingAudio) return;
    const audio = fadingAudio;
    fadingAudio = null;
    stopAudio(audio);
  };

  const runFade = ({ duration, onFrame, onComplete = () => {} }) => {
    clearFade();
    if (duration <= 0) {
      onFrame(1);
      onComplete();
      return;
    }

    const startedAt = now();
    fadeTimer = setTimer(() => {
      const progress = clamp((now() - startedAt) / duration);
      onFrame(progress);

      if (progress < 1) return;
      clearFade();
      onComplete();
    }, 50);
  };

  const removeEndedListener = (audio) => {
    const listener = endedListeners.get(audio);
    if (!listener) return;
    audio.removeEventListener('ended', listener);
    endedListeners.delete(audio);
  };

  const removeErrorListener = (audio) => {
    const listener = errorListeners.get(audio);
    if (!listener) return;
    audio.removeEventListener('error', listener);
    errorListeners.delete(audio);
  };

  const createAudio = (index) => {
    const audio = audioFactory(tracks[index]);
    audio.preload = 'auto';
    prepareAudio(audio);
    attachErrorListener(audio);
    return audio;
  };

  const pauseAudio = (audio) => {
    if (!audio) return;
    audio.pause();
  };

  const stopAudio = (audio) => {
    if (!audio) return;
    removeEndedListener(audio);
    removeErrorListener(audio);
    pauseAudio(audio);
    try {
      audio.currentTime = 0;
    } catch {
      // Some media implementations expose a read-only currentTime.
    }
  };

  const attachEndedListener = (audio) => {
    removeEndedListener(audio);
    const listener = () => {
      if (audio !== currentAudio || !playing) return;
      select((currentIndex + 1) % tracks.length).catch(() => {
        if (audio === currentAudio) {
          clearFade();
          stopFadingAudio();
          playing = false;
          persist('off');
          notify();
        }
      });
    };
    endedListeners.set(audio, listener);
    audio.addEventListener('ended', listener);
  };

  const attachErrorListener = (audio) => {
    removeErrorListener(audio);
    const listener = () => {
      if (audio !== currentAudio && audio !== fadingAudio) return;
      if (!playing) return;
      transitionToken += 1;
      clearFade();
      stopFadingAudio();
      playing = false;
      pauseAudio(audio);
      persist('off');
      notify();
    };
    errorListeners.set(audio, listener);
    audio.addEventListener('error', listener);
  };

  const transitionTo = async (nextIndex) => {
    if (!playing || destroyed) return;

    const token = ++transitionToken;
    const outgoing = currentAudio;
    const incoming = createAudio(nextIndex);
    incoming.volume = 0;

    try {
      await incoming.play();
    } catch (error) {
      stopAudio(incoming);
      if (token === transitionToken) {
        clearFade();
        stopFadingAudio();
        playing = false;
        persist('off');
        notify();
      }
      throw error;
    }

    if (token !== transitionToken || !playing || destroyed) {
      stopAudio(incoming);
      return;
    }

    stopFadingAudio();
    clearFade();

    attachEndedListener(incoming);
    currentAudio = incoming;
    fadingAudio = outgoing;

    if (!outgoing) {
      incoming.volume = 1;
      return;
    }

    removeEndedListener(outgoing);
    const outgoingVolume = outgoing.volume;
    runFade({
      duration: crossfadeMs,
      onFrame: (progress) => {
        incoming.volume = progress;
        outgoing.volume = outgoingVolume * (1 - progress);
      },
      onComplete: () => {
        if (fadingAudio === outgoing) {
          stopFadingAudio();
        }
      },
    });
  };

  const start = async ({ persistPreference = true } = {}) => {
    if (destroyed) throw new Error('Playlist player has been destroyed');
    if (playing) return;

    transitionToken += 1;
    clearFade();
    stopFadingAudio();
    currentAudio ??= createAudio(currentIndex);
    if (currentAudio.paused) currentAudio.volume = 0;

    try {
      await resumeAudioGraph();
      await currentAudio.play();
    } catch (error) {
      playing = false;
      if (persistPreference) persist('off');
      notify();
      throw error;
    }

    attachEndedListener(currentAudio);
    playing = true;
    if (persistPreference) persist('on');
    notify();

    const startingVolume = currentAudio.volume;
    runFade({
      duration: fadeInMs,
      onFrame: (progress) => {
        currentAudio.volume = startingVolume + (1 - startingVolume) * progress;
      },
    });
  };

  const stop = () => {
    transitionToken += 1;
    clearFade();
    stopFadingAudio();
    playing = false;
    persist('off');
    notify();

    const outgoingAudio = currentAudio;
    if (!outgoingAudio) return;
    const outgoingVolume = outgoingAudio.volume;
    runFade({
      duration: fadeOutMs,
      onFrame: (progress) => {
        outgoingAudio.volume = outgoingVolume * (1 - progress);
      },
      onComplete: () => pauseAudio(outgoingAudio),
    });
  };

  const suspend = () => {
    if (!playing) return false;
    transitionToken += 1;
    clearFade();
    stopFadingAudio();
    playing = false;
    pauseAudio(currentAudio);
    notify();
    return true;
  };

  const resume = async () => {
    if (playing || !currentAudio) return;
    await start({ persistPreference: false });
  };

  const select = async (index) => {
    const nextIndex = ((index % tracks.length) + tracks.length) % tracks.length;
    if (nextIndex === currentIndex && (playing ? currentAudio : true)) return;

    if (!playing) {
      transitionToken += 1;
      clearFade();
      stopFadingAudio();
      stopAudio(currentAudio);
      currentAudio = null;
      currentIndex = nextIndex;
      notify();
      return;
    }

    currentIndex = nextIndex;
    notify();
    await transitionTo(nextIndex);
  };

  return {
    start,
    stop,
    suspend,
    resume,
    select,
    next() {
      return select(currentIndex + 1);
    },
    previous() {
      return select(currentIndex - 1);
    },
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
    hasStoredEnabledPreference,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      transitionToken += 1;
      clearFade();
      stopFadingAudio();
      stopAudio(currentAudio);
      listeners.clear();
    },
  };
}
