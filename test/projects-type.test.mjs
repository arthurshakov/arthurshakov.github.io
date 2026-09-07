import assert from 'node:assert/strict';
import test from 'node:test';

import { projects } from '../src/data/projects.mjs';

test('each project exposes its bilingual project type through type', () => {
  for (const project of projects) {
    assert.deepEqual(Object.keys(project.type).sort(), ['en', 'ru'], project.slug);
    assert.equal('stack' in project, false, project.slug);
  }
});

