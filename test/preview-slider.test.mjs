import test from 'node:test';
import assert from 'node:assert/strict';
import { PREVIEW_SLIDER_CONFIG } from '../src/scripts/preview-slider.js';
import { calcVc, pxToVc, getWm } from '../src/scripts/viewport-scale.js';

test('preview slider configuration exports user-approved constants', () => {
  assert.equal(typeof PREVIEW_SLIDER_CONFIG, 'object');
  assert.equal(PREVIEW_SLIDER_CONFIG.minHeightVc, 460);
  assert.equal(PREVIEW_SLIDER_CONFIG.minHeightMobileVc, 480);
  assert.equal(PREVIEW_SLIDER_CONFIG.lineThicknessVc, 4);
  assert.equal(PREVIEW_SLIDER_CONFIG.trailLengthVc, 140);
  assert.equal(PREVIEW_SLIDER_CONFIG.trailOpacity, 0.68);
  assert.equal(PREVIEW_SLIDER_CONFIG.descOffsetVc, 4);
  assert.equal(PREVIEW_SLIDER_CONFIG.swipeThresholdPx, 35);
  assert.equal(PREVIEW_SLIDER_CONFIG.stripEdgeResistance, 0.97);
  assert.equal(PREVIEW_SLIDER_CONFIG.filtersEdgeResistance, 0.97);
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

test('pxToVc converts measured pixel height back to layout vc units across viewports', () => {
  // Desktop 1440px (1:1 scale): 460px -> 460vc
  assert.equal(pxToVc(460, 1440), 460);

  // Compact desktop 1040px (1:1 scale against base 1040): 460px -> 460vc
  assert.equal(pxToVc(460, 1040), 460);

  // Mobile 390px (1:1 scale against base 390): 480px -> 480vc
  assert.equal(pxToVc(480, 390), 480);

  // Desktop wide 1920px: scaled by 1920 / 1440 -> returns original vc
  const scaledPx1920 = 460 * (1920 / 1440);
  assert.equal(Math.round(pxToVc(scaledPx1920, 1920)), 460);

  // getWm follows _tokens.scss base values
  assert.equal(getWm(1440), 1);
  assert.equal(getWm(1040), 1);
  assert.equal(getWm(390), 1);
  assert.equal(getWm(1920), 1920 / 1440);
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

  assert.match(styles, /--preview-info-height-vc:\s*460/);
  assert.match(styles, /--preview-info-height-mobile-vc:\s*480/);
  assert.match(styles, /--preview-info-height:\s*calc\(var\(--preview-info-height-vc,\s*460\)\s*\*\s*var\(--wm\)\)/);
  assert.match(styles, /--preview-info-height-mobile:\s*calc\(var\(--preview-info-height-mobile-vc,\s*480\)\s*\*\s*var\(--wm\)\)/);
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
  const appJs = await readFile(new URL('../src/scripts/project-preview.js', import.meta.url), 'utf8');

  const entry = await readFile(new URL('../src/scripts/app.js', import.meta.url), 'utf8');
  assert.match(entry, /win\.gsap\.registerPlugin\(win\.Draggable/);
  assert.match(appJs, /createDraggableStrip\(strip,\s*track/);
  assert.match(appJs, /edgeResistance:\s*PREVIEW_SLIDER_CONFIG\.stripEdgeResistance/);
  assert.match(appJs, /throwResistance:\s*PREVIEW_SLIDER_CONFIG\.stripThrowResistance/);
  assert.match(appJs, /scrambleText\(preview\.name/);
  assert.match(appJs, /swipeThresholdPx/);
  assert.match(appJs, /pointerdown/);
  assert.match(appJs, /pointerup/);
  assert.match(appJs, /ArrowLeft/);
  assert.match(appJs, /ArrowRight/);
});

test('draggable-strip.js strip wheel listener reacts only to horizontal scroll and ignores vertical scroll', async () => {
  const { readFile } = await import('node:fs/promises');
  const stripJs = await readFile(new URL('../src/scripts/draggable-strip.js', import.meta.url), 'utf8');

  // Must not fall back to deltaY when scrolling
  assert.doesNotMatch(stripJs, /Math\.abs\(e\.deltaX\)\s*>=\s*Math\.abs\(e\.deltaY\)\s*\?\s*e\.deltaX\s*:\s*e\.deltaY/);

  // Must check deltaX and ignore vertical or dominant-vertical scroll
  assert.match(stripJs, /Math\.abs\(e\.deltaX\)\s*<\s*1\s*\|\|\s*Math\.abs\(e\.deltaX\)\s*<=\s*Math\.abs\(e\.deltaY\)/);
  assert.match(stripJs, /const delta\s*=\s*e\.deltaX\s*\*\s*speed/);
});

test('app.js scrolls to preview slider when clicking active project in list', async () => {
  const { readFile } = await import('node:fs/promises');
  const appJs = await readFile(new URL('../src/scripts/project-preview.js', import.meta.url), 'utf8');

  // Clicking a row or card requests scrolling: setActive(slug, { scroll: true })
  assert.match(appJs, /setActive\(projectElement\.dataset\.slug,\s*\{\s*scroll:\s*true\s*\}\)/);

  // When clicking the already active slug, must still call scrollToPreview before returning
  assert.match(
    appJs,
    /if\s*\(\s*animate\s*&&\s*slug\s*===\s*currentSlug\s*\)\s*\{\s*if\s*\(\s*scroll\s*\)\s*scrollToPreview\(\s*\);/
  );
});

test('app.js calculates and assigns slider min-height in vc units instead of fixed pixels', async () => {
  const { readFile } = await import('node:fs/promises');
  const appJs = await readFile(new URL('../src/scripts/preview-details.js', import.meta.url), 'utf8');

  // Must import pxToVc from the shared viewport-scale module
  assert.match(appJs, /import\s*\{[^}]*pxToVc[^}]*\}\s*from\s*['"]\.\/viewport-scale\.js['"]/);

  // Must convert measured pixel height to vc units
  assert.match(appJs, /const maxHVc\s*=\s*Math\.ceil\(\s*pxToVc\(\s*maxH\s*\)\s*\)/);

  // Must set custom property and minHeight using calc(... * var(--wm))
  assert.match(appJs, /const heightVal\s*=\s*`calc\(\$\{maxHVc\}\s*\*\s*var\(--wm\)\)`/);
  assert.match(appJs, /document\.documentElement\.style\.setProperty\(\s*['"]--preview-info-height['"]\s*,\s*heightVal\s*\)/);
  assert.match(appJs, /document\.documentElement\.style\.setProperty\(\s*['"]--preview-info-height-mobile['"]\s*,\s*heightVal\s*\)/);
  assert.match(appJs, /infoBox\.style\.minHeight\s*=\s*heightVal/);

  // Must NOT assign raw pixels to infoBox.style.minHeight or CSS variables
  assert.doesNotMatch(appJs, /infoBox\.style\.minHeight\s*=\s*maxH\s*\+\s*['"]px['"]/);
  assert.doesNotMatch(appJs, /--preview-info-height['"]\s*,\s*maxH\s*\+\s*['"]px['"]/);
});


