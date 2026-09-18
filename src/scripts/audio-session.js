import { createPlaylistPlayer } from './audio-player.js';
import { bindAudioControls, bindAudioVisualizer } from './audio-controls.js';
import { createAudioVisualizer } from './audio-visualizer.js';
import { bindClickSound } from './click-sound.js';
import { queryAll } from './dom.js';

// Живёт всю сессию страницы: смена языка сохраняет плеер и его DOM-кнопки.
export function initAudioSession(pageData) {
  const audioToggles = queryAll('[data-audio-toggle]');
  if (audioToggles.length) {
    const musicFadeInMs = 500;
    const musicFadeOutMs = 50;
    const musicCrossfadeMs = 1000;
    const visualizer = createAudioVisualizer();
    const musicTracks = pageData.audioTracks.map(({ file, name }) => ({
      src: `/assets/audio/${file}`,
      name,
    }));
    const player = createPlaylistPlayer({
      tracks: musicTracks.map((track) => track.src),
      crossfadeMs: musicCrossfadeMs,
      fadeInMs: musicFadeInMs,
      fadeOutMs: musicFadeOutMs,
      prepareAudio: (audio) => visualizer.attach(audio),
      resumeAudioGraph: () => visualizer.resume(),
    });
    bindAudioControls(audioToggles, player, musicTracks.map((track) => track.name));
    bindAudioVisualizer(audioToggles, player, visualizer);
    bindClickSound({
      isSoundEnabled: () => player.getState().playing || player.hasStoredEnabledPreference(),
    });

    // Браузеры разрешают звук только после жеста пользователя. Если посетитель
    // ранее включал музыку, возобновляем её при первом клике вне переключателя.
    if (player.hasStoredEnabledPreference()) {
      window.addEventListener('pointerdown', (event) => {
        if (event.target instanceof Element && event.target.closest('[data-audio-toggle]')) return;
        player.start().catch(() => { });
      }, { once: true, passive: true });
    }

    // AudioContext тоже может быть заблокирован до жеста или при скрытой вкладке.
    // Здесь отдельно поддерживается визуализатор и сам проигрыватель.
    const resumeVisualizer = () => visualizer.resumeIfAttached().catch(() => { });
    let resumeAfterVisibility = false;
    window.addEventListener('pointerdown', resumeVisualizer, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        resumeAfterVisibility = player.suspend();
        return;
      }

      resumeVisualizer();
      if (!resumeAfterVisibility) return;
      resumeAfterVisibility = false;
      player.resume().catch(() => { });
    });
  } else {
    bindClickSound({
      isSoundEnabled: () => true,
    });
  }

}
