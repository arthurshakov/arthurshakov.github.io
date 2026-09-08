export function bindAudioControls(controls, player, trackNames = []) {
  const buttons = [...controls];

  const render = ({ playing, trackIndex }) => {
    buttons.forEach((button) => {
      const label = playing ? button.dataset.audioLabelOn : button.dataset.audioLabelOff;
      const action = playing ? button.dataset.audioStop : button.dataset.audioStart;

      button.dataset.audioState = playing ? 'on' : 'off';
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-label', action);
      const labelElement = button.querySelector('[data-audio-label]');
      if (labelElement) labelElement.textContent = label;

      const control = button.parentElement;
      control?.dataset && (control.dataset.audioState = playing ? 'on' : 'off');
      const currentElement = control?.querySelector?.('[data-audio-track-current]');
      const totalElement = control?.querySelector?.('[data-audio-track-total]');
      const nameElement = control?.querySelector?.('[data-audio-track-name]');
      if (currentElement) currentElement.textContent = String(trackIndex + 1).padStart(2, '0');
      if (totalElement) totalElement.textContent = String(trackNames.length).padStart(2, '0');
      if (nameElement) nameElement.textContent = trackNames[trackIndex] ?? '';
    });
  };

  const handlers = buttons.map((button) => {
    const handler = async () => {
      try {
        await player.toggle();
      } catch {
        // Browser autoplay policy can reject play(); player state has already reset.
      }
    };
    button.addEventListener('click', handler);
    return [button, handler];
  });

  const unsubscribe = player.subscribe(render);

  const skipHandlers = buttons.flatMap((button) => {
    const control = button.parentElement;
    const previous = control?.querySelector?.('[data-audio-previous]');
    const next = control?.querySelector?.('[data-audio-next]');
    const handlers = [];
    if (previous) {
      const handler = () => player.previous().catch(() => {});
      previous.addEventListener('click', handler);
      handlers.push([previous, handler]);
    }
    if (next) {
      const handler = () => player.next().catch(() => {});
      next.addEventListener('click', handler);
      handlers.push([next, handler]);
    }
    return handlers;
  });

  return () => {
    unsubscribe();
    handlers.forEach(([button, handler]) => button.removeEventListener?.('click', handler));
    skipHandlers.forEach(([button, handler]) => button.removeEventListener?.('click', handler));
  };
}

export function bindAudioVisualizer(
  controls,
  player,
  visualizer,
  {
    requestFrame = window.requestAnimationFrame,
    cancelFrame = window.cancelAnimationFrame,
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)'),
  } = {}
) {
  const buttons = [...controls];
  /** @type {number | null} */
  let frame = null;
  let playing = false;

  const setLevels = (levels) => {
    buttons.forEach((button) => {
      button.querySelectorAll('.audio-control__bar').forEach((bar, index) => {
        bar.style.setProperty('--audio-level', levels[index] ?? 0);
      });
    });
  };

  const reset = () => {
    if (frame !== null) cancelFrame(frame);
    frame = null;
    visualizer.reset();
    setLevels([]);
  };

  const paint = () => {
    frame = null;
    if (!playing || reducedMotion.matches) return;
    setLevels(visualizer.sample());
    frame = requestFrame(paint);
  };

  const update = (state) => {
    playing = state.playing;
    if (!playing || reducedMotion.matches) {
      reset();
      return;
    }
    if (frame === null) frame = requestFrame(paint);
  };

  const onMotionChange = () => update({ playing });
  const unsubscribe = player.subscribe(update);
  reducedMotion.addEventListener?.('change', onMotionChange);

  return () => {
    unsubscribe();
    reducedMotion.removeEventListener?.('change', onMotionChange);
    reset();
  };
}
