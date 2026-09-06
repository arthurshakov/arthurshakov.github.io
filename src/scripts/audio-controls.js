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
