import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { renderPage } from '../src/template.mjs';

test('renders the visible note for initial project power-x-time in both languages', () => {
  const htmlRu = renderPage('ru');
  assert.match(
    htmlRu,
    /<div class="preview-note" data-preview-note>\s*<span class="preview-note__slash">\/\/\s*<\/span><span class="preview-note__text" data-preview-note-text>кампания завершена · боевой сайт отключён · ссылка ведёт на[\s\u00A0]тестовый стенд<\/span>\s*<\/div>/
  );

  const htmlEn = renderPage('en');
  assert.match(
    htmlEn,
    /<div class="preview-note" data-preview-note>\s*<span class="preview-note__slash">\/\/\s*<\/span><span class="preview-note__text" data-preview-note-text>campaign ended · live site offline · link points to[\s\u00A0]staging environment<\/span>\s*<\/div>/
  );
});

test('includes the localized note in boot data for power-x-time and null for projects without note', () => {
  const htmlRu = renderPage('ru');
  const bootRu = JSON.parse(htmlRu.match(/window\.__PORTFOLIO__=(.+);<\/script>/)[1]);
  const powerXRu = bootRu.projects.find(({ slug }) => slug === 'power-x-time');
  const glassDecorRu = bootRu.projects.find(({ slug }) => slug === 'glass-decor');

  assert.equal(
    powerXRu.note,
    'кампания завершена · боевой сайт отключён · ссылка ведёт на\u00A0тестовый стенд'
  );
  assert.equal(glassDecorRu.note, null);

  const htmlEn = renderPage('en');
  const bootEn = JSON.parse(htmlEn.match(/window\.__PORTFOLIO__=(.+);<\/script>/)[1]);
  const powerXEn = bootEn.projects.find(({ slug }) => slug === 'power-x-time');

  assert.equal(
    powerXEn.note,
    'campaign ended · live site offline · link points to\u00A0staging environment'
  );
});

test('styles preview-note with monospace tone and hidden state', async () => {
  const styles = await readFile('src/styles/_preview.scss', 'utf8');

  assert.match(styles, /\.preview-note\s*\{/);
  assert.match(styles, /&\[hidden\]\s*\{\s*display:\s*none;\s*\}/);
  assert.match(styles, /\.preview-note__slash\s*\{/);
  assert.match(styles, /\.preview-note__text\s*\{/);
});
