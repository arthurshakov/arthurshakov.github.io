import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { renderPage } from '../src/template.mjs';
import { GRID_ANIMATION_CONFIG, initGridAnimation, calcVc } from '../src/scripts/grid-animation.js';

const root = path.join(import.meta.dirname, '..');

test('grid animation configuration exports user-approved constants', () => {
  assert.equal(typeof initGridAnimation, 'function');
  assert.equal(typeof GRID_ANIMATION_CONFIG, 'object');

  assert.equal(GRID_ANIMATION_CONFIG.lineMaxAlpha, 0.5);
  assert.equal(GRID_ANIMATION_CONFIG.maxLinks, 28);
  assert.equal(GRID_ANIMATION_CONFIG.relayType, 'both');
  assert.equal(GRID_ANIMATION_CONFIG.trailMaxAlpha, 0.25);
  assert.equal(GRID_ANIMATION_CONFIG.maxTrailLength, 30);
  assert.equal(GRID_ANIMATION_CONFIG.vertStepBase, 64);
  assert.equal(GRID_ANIMATION_CONFIG.particleBaseAlpha, 0.30);
  assert.equal(GRID_ANIMATION_CONFIG.particleMaxAlpha, 0.75);
  assert.equal(GRID_ANIMATION_CONFIG.damping, 0.93);
});

test('renderPage embeds body__rail and bg-grid-canvas inside .bg-grid', () => {
  const htmlEn = renderPage('en', {}, '');
  assert.match(htmlEn, /<div class="bg-grid"[^>]*><div class="body__rail" aria-hidden="true"><\/div><canvas class="bg-grid-canvas" id="bg-grid-canvas" aria-hidden="true"><\/canvas><\/div>/);

  const htmlRu = renderPage('ru', {}, '');
  assert.match(htmlRu, /<div class="bg-grid"[^>]*><div class="body__rail" aria-hidden="true"><\/div><canvas class="bg-grid-canvas" id="bg-grid-canvas" aria-hidden="true"><\/canvas><\/div>/);
});

test('critical CSS includes .bg-grid-canvas rules', () => {
  const criticalScss = readFileSync(path.join(root, 'src/styles/_critical.scss'), 'utf8');
  assert.match(criticalScss, /\.bg-grid-canvas\s*\{/);
});

test('critical CSS defines .bg-grid as fixed viewport container', () => {
  const criticalScss = readFileSync(path.join(root, 'src/styles/_critical.scss'), 'utf8');
  assert.match(criticalScss, /\.bg-grid\s*\{[^}]*position:\s*fixed;/);
  assert.doesNotMatch(criticalScss, /\.bg-grid\s*\{[^}]*background-image:/);
});

test('calcVc strictly corresponds to vc(value) in styles', () => {
  // Desktop at base width 1440: vc(64) === 64
  assert.equal(calcVc(64, 1440), 64);

  // Desktop at scaled width 1600: vc(64) === 64 * (1600 / 1440)
  assert.equal(calcVc(64, 1600), 64 * (1600 / 1440));

  // Desktop wide at >= 1920: frozen at 1920px
  assert.equal(calcVc(64, 1920), 64 * (1920 / 1440));
  assert.equal(calcVc(64, 2560), 64 * (1920 / 1440));

  // Mobile at base width 390: vc(52) === 52
  assert.equal(calcVc(52, 390), 52);

  // Mobile at scaled width 414: vc(52) === 52 * (414 / 390)
  assert.equal(calcVc(52, 414), 52 * (414 / 390));
});

test('initGridAnimation handles null canvas gracefully', () => {
  const instance = initGridAnimation(null);
  assert.equal(typeof instance.destroy, 'function');
  assert.equal(typeof instance.feedVelocity, 'function');
  assert.doesNotThrow(() => instance.destroy());
  assert.doesNotThrow(() => instance.feedVelocity(10));
});
