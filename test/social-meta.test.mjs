import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import { renderPage } from '../src/template.mjs';

const root = path.resolve(import.meta.dirname, '..');

test('renders complete Open Graph and Twitter Card meta tags in both languages', () => {
  for (const lang of ['en', 'ru']) {
    const html = renderPage(lang);

    // Open Graph
    assert.match(html, /<meta property="og:type" content="website">/);
    assert.match(html, /<meta property="og:image" content="\/assets\/images\/share\.jpg">/);
    assert.match(html, /<meta property="og:image:width" content="1730">/);
    assert.match(html, /<meta property="og:image:height" content="909">/);
    assert.match(html, /<meta property="og:image:type" content="image\/jpeg">/);
    assert.match(html, new RegExp(`<meta property="og:url" content="${lang === 'ru' ? '/ru/' : '/'}">`));
    assert.match(html, new RegExp(`<meta property="og:locale" content="${lang === 'ru' ? 'ru_RU' : 'en_US'}">`));

    // Twitter Cards
    assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
    assert.match(html, /<meta name="twitter:image" content="\/assets\/images\/share\.jpg">/);
    assert.match(html, /<meta name="twitter:title" content="[^"]+">/);
    assert.match(html, /<meta name="twitter:description" content="[^"]+">/);
  }
});

test('dist contains share.jpg in assets/images after build', async () => {
  const distShare = path.join(root, 'dist/assets/images/share.jpg');
  await assert.doesNotReject(access(distShare));
});
