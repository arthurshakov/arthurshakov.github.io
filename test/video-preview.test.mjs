import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { projects } from '../src/data/projects.mjs';
import { renderPage } from '../src/template.mjs';

test('projects expose the prepared preview-video formats with a static fallback', () => {
  const powerXTime = projects.find(({ slug }) => slug === 'power-x-time');
  const glassDecor = projects.find(({ slug }) => slug === 'glass-decor');
  const vmesteAi = projects.find(({ slug }) => slug === 'vmeste-ai');

  assert.deepEqual(powerXTime.video, {
    webm: '/assets/video/tass-power-x-time.webm',
    mp4: '/assets/video/tass-power-x-time.mp4',
  });
  assert.deepEqual(glassDecor.video, {
    webm: '/assets/video/glass-decor.webm',
    mp4: '/assets/video/glass-decor.mp4',
  });
  assert.deepEqual(vmesteAi.video, {
    webm: '/assets/video/vmeste-ai.webm',
    mp4: '/assets/video/vmeste-ai.mp4',
  });

  const html = renderPage('en');

  assert.match(html, /data-preview-video/);
  assert.match(html, /data-preview-picture/);
  assert.match(html, /tass-power-x-time\.webm/);
  assert.match(html, /tass-power-x-time\.mp4/);
  assert.match(html, /"video":\{"webm":/);
  assert.match(html, /"mp4":"\/assets\/video\/tass-power-x-time\.mp4"/);
});

test('preview media uses the video display ratio for both its fallback and loop', async () => {
  const styles = await readFile(new URL('../src/styles/_preview.scss', import.meta.url), 'utf8');
  const html = renderPage('en');

  assert.match(html, /<img class="preview-screenshot"[^>]*width="319" height="180"/);
  assert.match(html, /<video class="preview-screenshot preview-video"[^>]*width="319" height="180"/);
  assert.match(styles, /\.preview-media\s*\{[\s\S]*aspect-ratio:\s*319\s*\/\s*(?:180|179|178)/);
  assert.match(styles, /\.preview-screenshot\s*\{[\s\S]*height:\s*100%/);
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
  assert.match(styles, /transition: opacity 500ms ease-out/);
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

  assert.match(html, /data-categories="[^"]*\bawwwards\b[^"]*"/);
  assert.match(html, /data-preview-description/);
  assert.doesNotMatch(html, /data-cats/);
  assert.doesNotMatch(html, /data-pv-/);
  assert.match(source, /projectElement\.dataset\.categories/);
  assert.doesNotMatch(source, /dataset\.cats/);
});
