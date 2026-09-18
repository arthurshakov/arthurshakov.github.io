import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { renderPage } from '../src/template.mjs';

test('hides the empty awards block for an initial project without an award', () => {
  const html = renderPage('en');

  assert.match(
    html,
    /<div class="preview-awards" data-preview-awards hidden>[\s\S]*?<span data-preview-awards-text><\/span>/
  );
});

test('includes the award URL in the preview boot data', () => {
  const html = renderPage('en');
  const bootData = JSON.parse(html.match(/window\.__PORTFOLIO__=(.+);<\/script>/)[1]);

  assert.equal(
    bootData.projects.find(({ slug }) => slug === 'glass-decor').awards[0].url,
    'https://www.awwwards.com/sites/glass-decor'
  );
});

test('styles award links green by default and underlined on hover', async () => {
  const styles = await readFile('src/styles/_preview.scss', 'utf8');

  assert.match(
    styles,
    /\.preview-awards__link \{[\s\S]*color: var\(--accent\);[\s\S]*&:hover \{[\s\S]*text-decoration: underline;/
  );
});

test('supports an array of multiple awards in boot data and projects', () => {
  const html = renderPage('en');
  const bootData = JSON.parse(html.match(/window\.__PORTFOLIO__=(.+);<\/script>/)[1]);
  const hill8 = bootData.projects.find(({ slug }) => slug === 'hill8');

  assert.equal(Array.isArray(hill8.awards), true);
  assert.equal(hill8.awards.length, 2);
  assert.equal(hill8.awards[0].url, 'https://www.awwwards.com/sites/hill8');
  assert.equal(hill8.awards[1].url, 'https://www.cssdesignawards.com/sites/hill8/34364/');
});

test('styles award items stacked vertically with proper gap', async () => {
  const styles = await readFile('src/styles/_preview.scss', 'utf8');

  assert.match(
    styles,
    /\[data-preview-awards-text\] \{[\s\S]*display: flex;[\s\S]*flex-direction: column;/
  );
  assert.match(
    styles,
    /\.preview-awards__item \{[\s\S]*display: flex;[\s\S]*align-items: flex-start;/
  );
});

