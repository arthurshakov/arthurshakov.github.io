import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const buildScript = path.join(root, 'src/build.mjs');
const distAudio = path.join(root, 'dist/assets/audio');

test('build copies the selected playlist files into dist assets', async () => {
  const result = spawnSync(process.execPath, [buildScript], {
    cwd: root,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr);
  await assert.doesNotReject(access(path.join(distAudio, 'filtered-aperture.mp3')));
  await assert.doesNotReject(access(path.join(distAudio, 'through-the-glass.mp3')));
});

