import test from 'node:test';
import assert from 'node:assert/strict';
import { PREVIEW_SLIDER_CONFIG, calcVc } from '../src/scripts/preview-slider.js';

test('preview slider configuration exports user-approved constants', () => {
  assert.equal(typeof PREVIEW_SLIDER_CONFIG, 'object');
  assert.equal(PREVIEW_SLIDER_CONFIG.lineThicknessVc, 4);
  assert.equal(PREVIEW_SLIDER_CONFIG.trailLengthVc, 140);
  assert.equal(PREVIEW_SLIDER_CONFIG.trailOpacity, 0.68);
  assert.equal(PREVIEW_SLIDER_CONFIG.descOffsetVc, 4);
  assert.equal(PREVIEW_SLIDER_CONFIG.swipeThresholdPx, 35);
  assert.equal(PREVIEW_SLIDER_CONFIG.stripThrowResistance, 1200);
  assert.equal(PREVIEW_SLIDER_CONFIG.stripEdgeResistance, 0.85);
  assert.equal(PREVIEW_SLIDER_CONFIG.sweepDurationMs, 320);
  assert.equal(PREVIEW_SLIDER_CONFIG.descDurationS, 0.55);
  assert.equal(PREVIEW_SLIDER_CONFIG.descEase, 'power2.out');
  assert.equal(PREVIEW_SLIDER_CONFIG.trailFadeDurationS, 0.28);
  assert.equal(PREVIEW_SLIDER_CONFIG.scrambleDurationMs, 200);
  assert.equal(PREVIEW_SLIDER_CONFIG.stripScrollDurationS, 0.55);
  assert.equal(PREVIEW_SLIDER_CONFIG.stripScrollEase, 'power2.out');
  assert.equal(PREVIEW_SLIDER_CONFIG.stripWheelSpeed, 1.5);
  assert.equal(PREVIEW_SLIDER_CONFIG.stripWheelDurationS, 0.32);
});

test('calcVc scales description offset and line parameters across viewports', () => {
  // Desktop 1440px: 1:1 scale
  assert.equal(calcVc(PREVIEW_SLIDER_CONFIG.descOffsetVc, 1440), 4);
  assert.equal(calcVc(PREVIEW_SLIDER_CONFIG.lineThicknessVc, 1440), 4);
  assert.equal(calcVc(PREVIEW_SLIDER_CONFIG.trailLengthVc, 1440), 140);

  // Desktop wide >=1920px: scaled up by 1920 / 1440 = 4 / 3
  assert.equal(calcVc(PREVIEW_SLIDER_CONFIG.descOffsetVc, 1920), 4 * (1920 / 1440));

  // Mobile 390px: 1:1 scale relative to mobile base 390
  assert.equal(calcVc(PREVIEW_SLIDER_CONFIG.descOffsetVc, 390), 4);
});

test('preview slider markup renders dual layers, controls, trail, and track in both languages', async () => {
  const { renderPage } = await import('../src/template.mjs');
  const enHtml = renderPage('en');
  const ruHtml = renderPage('ru');

  for (const html of [enHtml, ruHtml]) {
    assert.match(html, /class="preview-controls"/);
    assert.match(html, /data-preview-counter/);
    assert.match(html, /class="preview-stepper-counter__current">01<\/span>/);
    assert.match(html, /data-preview-prev/);
    assert.match(html, /data-preview-next/);
    assert.match(html, /data-preview-layer-a/);
    assert.match(html, /data-preview-layer-b/);
    assert.match(html, /data-scanline-trail/);
    assert.match(html, /data-scanline-line/);
    assert.match(html, /data-preview-track/);
    assert.match(html, /src="\/Draggable\.min\.js"/);
    assert.match(html, /src="\/InertiaPlugin\.min\.js"/);
  }

  assert.match(enHtml, /aria-label="previous project"/i);
  assert.match(enHtml, /aria-label="next project"/i);
  assert.match(ruHtml, /aria-label="предыдущий проект"/i);
  assert.match(ruHtml, /aria-label="следующий проект"/i);
});

test('preview slider styles define accent line, glowing trail, and inert draggable track', async () => {
  const { readFile } = await import('node:fs/promises');
  const styles = await readFile(new URL('../src/styles/_preview.scss', import.meta.url), 'utf8');

  assert.match(styles, /--mask-line-width/);
  assert.match(styles, /--mask-trail-width/);
  assert.match(styles, /--mask-trail-opacity/);
  assert.match(styles, /--desc-offset-vc/);
  assert.match(styles, /\.preview-stepper-counter__current\s*\{[\s\S]*color:\s*var\(--accent\)/);
  assert.match(styles, /\.preview-thumbnail\.is-active\s*\{[\s\S]*cursor:\s*default/);
  assert.match(styles, /\.preview-strip\s*\{[\s\S]*cursor:\s*grab/);
  assert.match(styles, /\.scanline-trail\.trail-next/);
  assert.match(styles, /\.scanline-trail\.trail-prev/);
});

test('app.js integrates Draggable, InertiaPlugin, video swipe, and text scramble', async () => {
  const { readFile } = await import('node:fs/promises');
  const appJs = await readFile(new URL('../src/scripts/app.js', import.meta.url), 'utf8');

  assert.match(appJs, /win\.gsap\.registerPlugin\(win\.Draggable/);
  assert.match(appJs, /DraggableClass\.create\(track/);
  assert.match(appJs, /edgeResistance:\s*PREVIEW_SLIDER_CONFIG\.stripEdgeResistance/);
  assert.match(appJs, /throwResistance:\s*PREVIEW_SLIDER_CONFIG\.stripThrowResistance/);
  assert.match(appJs, /function scrambleText/);
  assert.match(appJs, /swipeThresholdPx/);
  assert.match(appJs, /pointerdown/);
  assert.match(appJs, /pointerup/);
  assert.match(appJs, /ArrowLeft/);
  assert.match(appJs, /ArrowRight/);
});

