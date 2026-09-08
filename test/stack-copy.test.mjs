import assert from 'node:assert/strict';
import test from 'node:test';

import { renderPage } from '../src/template.mjs';

test('presents React in the stack in both language versions', () => {
  for (const lang of ['ru', 'en']) {
    const html = renderPage(lang);

    assert.match(html, /JavaScript \/ TypeScript · React · Vue \/ Nuxt/);
  }
});
