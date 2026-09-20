import test from 'node:test';
import assert from 'node:assert/strict';
import { isMobileViewport, getWm, calcVc, pxToVc } from '../src/scripts/viewport-scale.js';

test('isMobileViewport correctly classifies viewports by width and aspect ratio (>= 16/13)', () => {
  // Mobile portrait (ratio ~0.46 < 16/13, width < 960)
  assert.equal(isMobileViewport(390, 844), true);
  assert.equal(isMobileViewport(375, 667), true);

  // Tablet portrait (ratio 0.75 < 16/13, width < 960)
  assert.equal(isMobileViewport(768, 1024), true);
  assert.equal(isMobileViewport(820, 1180), true);

  // Mobile landscape (ratio ~2.16 >= 16/13) -> compact desktop mode
  assert.equal(isMobileViewport(844, 390), false);
  assert.equal(isMobileViewport(932, 430), false);
  assert.equal(isMobileViewport(667, 375), false);

  // Compact tablet landscape (ratio ~1.67 >= 16/13) -> compact desktop mode
  assert.equal(isMobileViewport(800, 480), false);

  // Standard tablet landscape (width >= 960 and ratio >= 16/13) -> desktop mode
  assert.equal(isMobileViewport(1024, 768), false);

  // Desktop and wide viewports (width >= 960)
  assert.equal(isMobileViewport(1440, 900), false);
  assert.equal(isMobileViewport(1920, 1080), false);

  // Narrow desktop window (narrow vertical, ratio < 16/13, width < 960)
  assert.equal(isMobileViewport(600, 900), true);
});

test('getWm uses compact desktop base (1040) for landscape viewports below 1440px', () => {
  // Mobile landscape uses 1040 base instead of 390
  assert.equal(getWm(844, 390), 844 / 1040);
  assert.equal(getWm(932, 430), 932 / 1040);
  assert.equal(getWm(667, 375), 667 / 1040);

  // Compact tablet landscape uses 1040 base
  assert.equal(getWm(800, 480), 800 / 1040);

  // Tablet landscape (1024x768) uses 1040 base
  assert.equal(getWm(1024, 768), 1024 / 1040);

  // Mobile portrait uses 390 base
  assert.equal(getWm(390, 844), 1);
  assert.equal(getWm(375, 667), 375 / 390);

  // Tablet portrait uses 390 base
  assert.equal(getWm(768, 1024), 768 / 390);

  // Desktop viewports
  assert.equal(getWm(1440, 900), 1);
  assert.equal(getWm(1920, 1080), 1920 / 1440);
});

test('getWm preserves backwards compatibility when height is omitted', () => {
  assert.equal(getWm(1440), 1);
  assert.equal(getWm(1040), 1);
  assert.equal(getWm(390), 1);
  assert.equal(getWm(1920), 1920 / 1440);
});

test('calcVc and pxToVc support custom viewport dimensions', () => {
  // At 844x390 landscape: wm = 844 / 1040
  const expectedWm = 844 / 1040;
  assert.equal(calcVc(13, 844, 390), 13 * expectedWm);
  assert.equal(pxToVc(100, 844, 390), 100 / expectedWm);
});
