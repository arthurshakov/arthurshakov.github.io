export function bindAudioControls(controls, player) {
  const buttons = [...controls];

  const render = ({ playing }) => {
    buttons.forEach((button) => {
      const label = playing ? button.dataset.audioLabelOn : button.dataset.audioLabelOff;
      const action = playing ? button.dataset.audioStop : button.dataset.audioStart;

      button.dataset.audioState = playing ? 'on' : 'off';
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-label', action);
      const labelElement = button.querySelector('[data-audio-label]');
      if (labelElement) labelElement.textContent = label;
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

  return () => {
    unsubscribe();
    handlers.forEach(([button, handler]) => button.removeEventListener?.('click', handler));
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
