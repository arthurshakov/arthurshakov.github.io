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
  assert.equal(GRID_ANIMATION_CONFIG.dotBaseWidth, 1.5);
  assert.equal(GRID_ANIMATION_CONFIG.dotBaseHeight, 1.5);
  assert.equal(GRID_ANIMATION_CONFIG.dotEnergyDelta, 0.5);
  assert.equal(GRID_ANIMATION_CONFIG.mobileDotBaseWidth, 1);
  assert.equal(GRID_ANIMATION_CONFIG.mobileDotBaseHeight, 1);
  assert.equal(GRID_ANIMATION_CONFIG.mobileDotEnergyDelta, 0.33);
  assert.equal(GRID_ANIMATION_CONFIG.lineWidthBase, 1);
  assert.equal(GRID_ANIMATION_CONFIG.vertStepBase, 64);
  assert.equal(GRID_ANIMATION_CONFIG.horizStepBase, 64);
  assert.equal(GRID_ANIMATION_CONFIG.mobileStepBase, 40);
  assert.equal(GRID_ANIMATION_CONFIG.mobileHorizStepBase, 40);
  assert.equal(GRID_ANIMATION_CONFIG.mobileVertStepBase, 40);
  assert.equal(GRID_ANIMATION_CONFIG.scrollSensitivity, 0.5);
  assert.equal(GRID_ANIMATION_CONFIG.mobileScrollSensitivity, 0.4);
  assert.equal(GRID_ANIMATION_CONFIG.particleBaseAlpha, 0.30);
  assert.equal(GRID_ANIMATION_CONFIG.particleMaxAlpha, 0.75);
  assert.equal(GRID_ANIMATION_CONFIG.damping, 0.93);
});

test('calcVc scales dot size and trail length proportionally across breakpoints', () => {
  // Desktop 1440px: 1:1 scale
  assert.equal(calcVc(GRID_ANIMATION_CONFIG.dotBaseWidth, 1440), 1.5);
  assert.equal(calcVc(GRID_ANIMATION_CONFIG.maxTrailLength, 1440), 30);

  // Desktop wide >=1920px: scaled up by 1920 / 1440 = 4 / 3
  assert.equal(calcVc(GRID_ANIMATION_CONFIG.dotBaseWidth, 1920), 1.5 * (1920 / 1440));
  assert.equal(calcVc(GRID_ANIMATION_CONFIG.maxTrailLength, 1920), 30 * (1920 / 1440));

  // Mobile 390px: mobile dot base = 1, mobile energy delta = 0.33
  assert.equal(calcVc(GRID_ANIMATION_CONFIG.mobileDotBaseWidth, 390), 1);
  assert.equal(calcVc(GRID_ANIMATION_CONFIG.mobileDotBaseHeight, 390), 1);
  assert.equal(calcVc(GRID_ANIMATION_CONFIG.mobileDotEnergyDelta, 390), 0.33);
  assert.equal(calcVc(GRID_ANIMATION_CONFIG.maxTrailLength, 390), 30);
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

  // Mobile at base width 390: vc(52) === 52, vc(40) === 40
  assert.equal(calcVc(52, 390), 52);
  assert.equal(calcVc(40, 390), 40);

  // Mobile at scaled width 414: vc(52) === 52 * (414 / 390), vc(40) === 40 * (414 / 390)
  assert.equal(calcVc(52, 414), 52 * (414 / 390));
  assert.equal(calcVc(40, 414), 40 * (414 / 390));
});

test('initGridAnimation handles null canvas gracefully', () => {
  const instance = initGridAnimation(null);
  assert.equal(typeof instance.destroy, 'function');
  assert.equal(typeof instance.feedVelocity, 'function');
  assert.doesNotThrow(() => instance.destroy());
  assert.doesNotThrow(() => instance.feedVelocity(10));
});

test('initGridAnimation accepts custom scrollSensitivity in customConfig', () => {
  const instance = initGridAnimation(null, null, { scrollSensitivity: 1.5, mobileScrollSensitivity: 0.8 });
  assert.equal(typeof instance.feedVelocity, 'function');
  assert.doesNotThrow(() => instance.feedVelocity(20));
  assert.doesNotThrow(() => instance.destroy());
});
