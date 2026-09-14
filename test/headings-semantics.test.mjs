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
      /<main class="body__main" id="main"[^>]*>\s*<h1 class="sr-only">[\s\S]*?<\/h1>/,
      `Expected <h1> to be directly inside <main id="main"> in ${lang}`
    );
  }
});

test('renders accessible skip-link and language navigation', () => {
  for (const lang of ['ru', 'en']) {
    const html = renderPage(lang);

    assert.match(
      html,
      /<a class="skip-link" href="#main">[^<]+<\/a>/,
      `Expected skip-link at top of body in ${lang}`
    );

    assert.match(
      html,
      /<main class="body__main" id="main" tabindex="-1">/,
      `Expected main to have tabindex="-1" for skip-link focus targeting in ${lang}`
    );

    assert.match(
      html,
      /<nav class="statusbar-language" aria-label="[^"]+">/,
      `Expected statusbar-language to be a <nav> with aria-label in ${lang}`
    );

    assert.match(
      html,
      /href="\/ru\/" hreflang="ru" lang="ru"/,
      `Expected RU link to have hreflang and lang in ${lang}`
    );

    assert.match(
      html,
      /href="\/" hreflang="en" lang="en"/,
      `Expected EN link to have hreflang and lang in ${lang}`
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

test('renders accessible project selection buttons and mobile cards', () => {
  for (const lang of ['ru', 'en']) {
    const html = renderPage(lang);

    assert.match(
      html,
      /<button class="works-row__btn" type="button" aria-label="[^"]+power-x-time[^"]*" aria-pressed="true">power-x-time<\/button>/,
      `Expected works-row button with aria-label in ${lang}`
    );

    assert.match(
      html,
      /<div class="works-card[^"]*" role="button" tabindex="0" data-slug="power-x-time"[^>]*aria-label="[^"]+power-x-time[^"]*" aria-pressed="true">/,
      `Expected works-card with role="button" and tabindex="0" in ${lang}`
    );

    assert.match(
      html,
      /<a href="[^"]+" target="_blank" rel="noopener noreferrer" aria-label="open power-x-time/i,
      `Expected external open link to have rel and aria-label in ${lang}`
    );

    assert.match(
      html,
      /<span class="sr-only"> \((избранный проект|featured project)\)<\/span>/,
      `Expected featured star to have sr-only text in ${lang}`
    );
  }
});

test('renders polite live announcers for works filtering and preview selection', () => {
  for (const lang of ['ru', 'en']) {
    const html = renderPage(lang);

    assert.match(
      html,
      /<p class="sr-only" aria-live="polite" aria-atomic="true" data-works-announcer><\/p>/,
      `Expected works live announcer in ${lang}`
    );

    assert.match(
      html,
      /<p class="sr-only" aria-live="polite" aria-atomic="true" data-preview-announcer><\/p>/,
      `Expected preview live announcer in ${lang}`
    );
  }
});
