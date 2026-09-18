import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';

import { projects } from '../src/data/projects.mjs';

test('power-x-time has web video assets wired to its project entry', () => {
  const project = projects.find(({ slug }) => slug === 'power-x-time');

  assert.deepEqual(project.video, {
    webm: '/assets/video/tass-power-x-time.webm',
    mp4: '/assets/video/tass-power-x-time.mp4',
  });
  assert.equal(existsSync('src/assets/video/tass-power-x-time.webm'), true);
  assert.equal(existsSync('src/assets/video/tass-power-x-time.mp4'), true);
});
