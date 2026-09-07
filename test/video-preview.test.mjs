import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { projects } from '../src/data/projects.mjs';
import { renderPage } from '../src/template.mjs';

test('projects can opt into preview video while image-only projects keep the fallback', () => {
  assert.deepEqual(projects[0].video, {
    webm: '/assets/video/glass-decor.webm',
    mp4: '/assets/video/glass-decor.mp4',
  });
  assert.equal(projects[1].video, undefined);

  const html = renderPage('en');

  assert.match(html, /data-preview-video/);
  assert.match(html, /data-preview-picture/);
  assert.match(html, /glass-decor\.webm/);
  assert.match(html, /glass-decor\.mp4/);
  assert.match(html, /"video":\{"webm":/);
  assert.match(html, /"mp4":"\/assets\/video\/glass-decor\.mp4"/);
});

test('returning to an already loaded video reveals it before playback resumes', async () => {
  const source = await readFile(new URL('../src/scripts/app.js', import.meta.url), 'utf8');

  assert.match(source, /if \(preview\.video\?\.readyState < 2\) return;[\s\S]*revealVideo\(\);[\s\S]*preview\.video\.play\(\)/);
});

test('first visible preview waits for a decoded frame before starting playback', async () => {
  const source = await readFile(new URL('../src/scripts/app.js', import.meta.url), 'utf8');

  assert.match(source, /if \(preview\.video\?\.readyState < 2\) return;/);
  assert.match(source, /addEventListener\('canplay', onVideoReady\)/);
  assert.doesNotMatch(source, /preview\.video\?\.play\(\)\.catch\(\(\) => \{\}\)/);
});

test('preview video warms one viewport before it enters view and fades over its poster', async () => {
  const source = await readFile(new URL('../src/scripts/app.js', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../src/styles/_preview.scss', import.meta.url), 'utf8');
  const html = renderPage('en');

  assert.match(source, /function preloadVideo\(\)/);
  assert.match(source, /rootMargin: '100% 0px'/);
  assert.match(source, /preloadObserver\?\.observe\(previewFrame\)/);
  assert.match(styles, /\.preview-video\.is-visible/);
  assert.match(styles, /transition: opacity 120ms ease-out/);
  assert.match(styles, /visibility: hidden/);
  assert.doesNotMatch(html, /data-preview-video[^>]* hidden/);
  assert.doesNotMatch(source, /preview\.video\.hidden/);
});

test('preview video stores and restores playback positions by project slug', async () => {
  const source = await readFile(new URL('../src/scripts/app.js', import.meta.url), 'utf8');

  assert.match(source, /const videoPositions = new Map\(\);/);
  assert.match(source, /videoPositions\.set\(loadedVideoSlug, preview\.video\.currentTime\);/);
  assert.match(source, /preview\.video\.currentTime = position;/);
});

test('project categories and descriptions use descriptive names throughout the rendered page', async () => {
  const source = await readFile(new URL('../src/scripts/app.js', import.meta.url), 'utf8');
  const html = renderPage('en');

  assert.match(html, /data-categories="awwwards"/);
  assert.match(html, /data-preview-description/);
  assert.doesNotMatch(html, /data-cats/);
  assert.doesNotMatch(html, /data-pv-/);
  assert.match(source, /projectElement\.dataset\.categories/);
  assert.doesNotMatch(source, /dataset\.cats/);
});
