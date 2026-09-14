import assert from 'node:assert/strict';
import test from 'node:test';

import { renderPage } from '../src/template.mjs';

test('renders a single h1 heading within main for both languages', () => {
  for (const lang of ['ru', 'en']) {
    const html = renderPage(lang);

    const h1Matches = html.match(/<h1[\s\S]*?<\/h1>/g) || [];
    assert.equal(h1Matches.length, 1, `Expected exactly 1 <h1> in ${lang}`);

    assert.match(
      html,
      /<main class="body__main" id="main">\s*<h1 class="sr-only">[\s\S]*?<\/h1>/,
      `Expected <h1> to be directly inside <main id="main"> in ${lang}`
    );
  }
});

test('renders h2 section titles with aria-labelledby and aria-hidden slashes', () => {
  const expectedSections = ['whoami', 'works', 'preview', 'contact'];

  for (const lang of ['ru', 'en']) {
    const html = renderPage(lang);

    for (const sec of expectedSections) {
      assert.match(
        html,
        new RegExp(`<section[^>]*id="${sec}"[^>]*aria-labelledby="heading-${sec}"`),
        `Expected section #${sec} to have aria-labelledby="heading-${sec}" in ${lang}`
      );

      assert.match(
        html,
        new RegExp(`<h2 class="section-header__title" id="heading-${sec}">\\s*<span class="section-header__slash" aria-hidden="true">// <\\/span>`),
        `Expected heading-##${sec} to be an <h2> with aria-hidden slash in ${lang}`
      );
    }
  }
});

test('renders preview project name as h3', () => {
  for (const lang of ['ru', 'en']) {
    const html = renderPage(lang);

    assert.match(
      html,
      /<h3 class="preview-name" data-preview-name>/,
      `Expected preview project name to be <h3> in ${lang}`
    );
  }
});
