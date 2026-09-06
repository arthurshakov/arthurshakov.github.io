import assert from 'node:assert/strict';
import test from 'node:test';

import { createAudioVisualizer } from '../src/scripts/audio-visualizer.js';

function createGraph(values) {
  const graph = {
    analyser: {
      frequencyBinCount: values.length,
      getByteFrequencyData(target) {
        target.set(values);
      },
    },
    connectCalls: 0,
    createMediaElementSource() {
      return {
        connect: () => {
          this.connectCalls += 1;
        },
      };
    },
    createAnalyser() {
      return this.analyser;
    },
    destination: {},
    resumeCalls: 0,
    async resume() {
      this.resumeCalls += 1;
    },
  };
  graph.analyser.connect = () => {
    graph.connectCalls += 1;
  };
  return graph;
}

test('maps analyser frequencies into five normalized equalizer levels', () => {
  const graph = createGraph([0, 64, 128, 192, 255]);
  const visualizer = createAudioVisualizer({ graphFactory: () => graph, smoothing: 0 });

  visualizer.attach({});

  assert.deepEqual(visualizer.sample().map((value) => Number(value.toFixed(2))), [
    0,
    0.25,
    0.5,
    0.75,
    1,
  ]);
});

test('creates and resumes the audio graph only after an audio element is attached', async () => {
  let factoryCalls = 0;
  const graph = createGraph([0, 0, 0, 0, 0]);
  const visualizer = createAudioVisualizer({
    graphFactory: () => {
      factoryCalls += 1;
      return graph;
    },
  });

  assert.equal(factoryCalls, 0);

  visualizer.attach({});
  await visualizer.resume();

  assert.equal(factoryCalls, 1);
  assert.equal(graph.connectCalls, 2);
  assert.equal(graph.resumeCalls, 1);
});
