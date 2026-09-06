const BAR_COUNT = 5;

export function createAudioVisualizer({
  graphFactory = () => {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    const context = new Context();
    const analyser = context.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.72;
    return {
      context,
      analyser,
      destination: context.destination,
      createMediaElementSource: (audio) => context.createMediaElementSource(audio),
    };
  },
  smoothing = 0.72,
} = {}) {
  let graph = null;
  let destinationConnected = false;
  let levels = Array(BAR_COUNT).fill(0);
  const attached = new WeakSet();

  const ensureGraph = () => {
    graph ??= graphFactory();
    return graph;
  };

  return {
    attach(audio) {
      if (!audio || attached.has(audio)) return;
      const currentGraph = ensureGraph();
      if (!currentGraph) return;

      const source = currentGraph.createMediaElementSource(audio);
      source.connect(currentGraph.analyser);
      if (!destinationConnected) {
        currentGraph.analyser.connect(currentGraph.destination);
        destinationConnected = true;
      }
      attached.add(audio);
    },
    async resume() {
      const currentGraph = ensureGraph();
      const resume = currentGraph?.context?.resume ?? currentGraph?.resume;
      if (resume) await resume.call(currentGraph.context ?? currentGraph);
    },
    sample() {
      const analyser = graph?.analyser;
      if (!analyser) return levels;

      const frequencies = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(frequencies);
      levels = levels.map((previous, index) => {
        const from = Math.floor((index * frequencies.length) / BAR_COUNT);
        const to = Math.max(from + 1, Math.floor(((index + 1) * frequencies.length) / BAR_COUNT));
        let total = 0;
        for (let bucket = from; bucket < to; bucket += 1) total += frequencies[bucket] ?? 0;
        const raw = total / (to - from) / 255;
        return previous * smoothing + raw * (1 - smoothing);
      });
      return levels;
    },
    reset() {
      levels = Array(BAR_COUNT).fill(0);
      return levels;
    },
    destroy() {
      graph?.analyser?.disconnect?.();
      graph?.context?.close?.();
      graph = null;
      destinationConnected = false;
      levels = Array(BAR_COUNT).fill(0);
    },
  };
}

