import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { renderPage } from '../src/template.mjs';

const readSrc = (name) => readFile(new URL(`../src/${name}`, import.meta.url), 'utf8');

test('uses the real status bar as the preloader surface in both languages', () => {
  for (const lang of ['en', 'ru']) {
    const html = renderPage(lang);

    assert.match(html, /<div class="preloader" data-preloader aria-live="polite"/);
    assert.match(html, /data-preloader-prompt/);
    assert.match(html, /data-preloader-command/);
    assert.match(html, /data-preloader-result/);
    assert.doesNotMatch(html, /preloader__terminal/);
  }
});

test('locks scrolling while the preloader is active, reserving the scrollbar gutter', async () => {
  const criticalStyles = await readSrc('styles/_critical.scss');
  const appJs = await readSrc('scripts/preloader.js');

  assert.match(criticalStyles, /html\.preloader-pending\s*\{[\s\S]*?overflow: hidden/);
  assert.match(criticalStyles, /html\.preloader-pending\s*\{[\s\S]*?scrollbar-gutter: stable/);
  assert.match(criticalStyles, /html\.preloader-pending body\s*\{\s*overflow: hidden/);

  // Одного overflow мало: lenis скроллит программно, поэтому его надо
  // остановить на время прелоадера и вернуть в finish().
  assert.match(appJs, /lenis\?\.stop\(\)/);
  assert.match(appJs, /lenis\?\.start\(\)/);
  assert.ok(
    appJs.indexOf('const lenis = getLenis();') < appJs.indexOf('lenis?.stop()'),
    'lenis handle must be declared before the preloader uses it'
  );
});

test('runs the preloader once per session, deciding before the first paint', () => {
  for (const lang of ['en', 'ru']) {
    const html = renderPage(lang);
    const head = html.slice(0, html.indexOf('</head>'));

    // Решение принимается в инлайн-скрипте <head>, до разметки, иначе
    // оверлей успел бы мигнуть на повторном заходе.
    assert.match(head, /sessionStorage\.getItem\('portfolio:preloader'\) === '1'/);
    assert.match(head, /sessionStorage\.setItem\('portfolio:preloader', '1'\)/);
    assert.match(head, /if \(!seen\) root\.classList\.add\('preloader-pending'\);/);
    // Недоступное хранилище (приватный режим) не должно ломать страницу:
    // seen остаётся false и прелоадер просто показывается.
    assert.match(head, /let seen = false;\s*try \{/);
    // Страховка на .page живёт вне ветки — она нужна и без прелоадера.
    assert.ok(
      head.indexOf("if (!seen) root.classList.add('preloader-pending');") < head.indexOf('const hardFinish'),
      'the hard fallback must be armed regardless of the session flag'
    );
  }
});

test('holds off the hard fallback once the preloader animation actually starts', async () => {
  const appJs = await readSrc('scripts/preloader.js');
  const html = renderPage('en');

  assert.match(html, /window\.__holdPreloaderFallback = \(\) => \{[\s\S]*?timeout = window\.setTimeout\(hardFinish, 4000\)/);
  assert.match(appJs, /holdFallback\(\);\s*const timeline = window\.gsap\.timeline\(/);
});

test('critical CSS covers background, grid and fonts, and hides real content until fonts are loaded', async () => {
  const criticalStyles = await readSrc('styles/_critical.scss');

  assert.match(criticalStyles, /\.bg-grid\s*\{/);
  assert.match(criticalStyles, /font-family:\s*var\(--mono\)/);
  assert.match(criticalStyles, /html:not\(\.fonts-loaded\)\s*\.page\s*\{\s*visibility:\s*hidden/);
});

test('inlines critical CSS in <head> and defers the main stylesheet until it loads', () => {
  const html = renderPage('en', {}, '.bg-grid{color:red}');

  assert.match(html, /<style>\.bg-grid\{color:red\}<\/style>/);
  assert.match(html, /<link rel="preload" as="style" href="\/styles\.css" id="main-styles" onload="this\.onload=null;this\.rel='stylesheet'">/);
  assert.match(html, /<noscript><link rel="stylesheet" href="\/styles\.css"><style>\.page\{visibility:visible\}<\/style><\/noscript>/);
});

test('gates the preloader/typewriter start on fonts and main styles being ready', async () => {
  const appJs = await readSrc('scripts/preloader.js');

  assert.match(appJs, /getElementById\('main-styles'\)/);
  assert.match(appJs, /document\.fonts\?\.ready/);
  assert.match(appJs, /classList\.add\('fonts-loaded'\)/);
});

test('shows the whole right side of the header from the start, together with the left one', async () => {
  const statusbarStyles = await readSrc('styles/_statusbar.scss');
  const appJs = await readSrc('scripts/preloader.js');

  // Ни правый блок целиком, ни пилюли больше не прячутся на время прелоадера.
  assert.doesNotMatch(statusbarStyles, /data-preloader-meta/);
  assert.doesNotMatch(statusbarStyles, /data-preloader-pill/);
  assert.doesNotMatch(appJs, /data-preloader-meta/);
  assert.doesNotMatch(appJs, /data-preloader-pill/);

  for (const lang of ['en', 'ru']) {
    const html = renderPage(lang);

    // Правая часть — обычная разметка: без служебных атрибутов и без is-ready.
    assert.match(html, /<span class="statusbar-meta__content"><span>[^<]+<\/span>/);
    assert.match(html, /<a class="pill[^"]*" href="\/ru\/"[^>]*>ru<\/a>/);
    assert.match(html, /<a class="pill[^"]*" href="\/"[^>]*>en<\/a>/);
  }
});

test('renders the ready blip under the header, not inside the prompt line', async () => {
  const statusbarStyles = await readSrc('styles/_statusbar.scss');

  for (const lang of ['en', 'ru']) {
    const html = renderPage(lang);
    const headers = [...html.matchAll(/<header class="statusbar[\s\S]*?<\/header>/g)].map((m) => m[0]);

    assert.equal(headers.length, 2, 'desktop and mobile status bars are both rendered');
    for (const header of headers) {
      const promptEnd = header.indexOf('</div>');
      const resultAt = header.indexOf('data-preloader-result');

      assert.ok(resultAt > -1, 'ready blip is present in the header');
      assert.ok(resultAt > promptEnd, 'ready blip sits outside the prompt line');
    }
  }

  // Позиционируется от хэдера (он relative на время прелоадера) вниз, с
  // отступом слева по padding шапки.
  assert.match(statusbarStyles, /\.statusbar-preloader__result\s*\{[\s\S]*?position: absolute/);
  assert.match(statusbarStyles, /\.statusbar-preloader__result\s*\{[\s\S]*?inset-block-start: 100%/);
  assert.match(statusbarStyles, /html\.preloader-pending \.statusbar\s*\{\s*position: relative/);
});

test('waits a tunable exec delay before showing ready, then clears it with the command', async () => {
  const appJs = await readSrc('scripts/preloader.js');

  const execDelayDecl = appJs.match(/const EXEC_DELAY = ([\d.]+);/);
  assert.ok(execDelayDecl, 'EXEC_DELAY must be declared as a single tunable constant');
  assert.ok(
    Number(execDelayDecl[1]) >= 0.5,
    'EXEC_DELAY must be at least 0.5s so "ready" reads as work happening, not instant'
  );
  assert.match(appJs, /setResult\(true\), null, `\+=\$\{EXEC_DELAY\}`\)/);

  // Держим ready на экране READY_HOLD, потом снимаем оверлей.
  assert.match(appJs, /preloader\.hidden = true;\s*\}, null, `\+=\$\{READY_HOLD\}`\)/);
  assert.match(appJs, /const clearPrompt = \(\) => \{\s*setText\(preloaderCommands, ''\);\s*setResult\(false\);/);
});

test('clears the command line and ready in step with the content reveal', async () => {
  const appJs = await readSrc('scripts/preloader.js');

  // Обе анимации ставятся на одну и ту же метку таймлайна.
  assert.match(appJs, /const revealAt = timeline\.duration\(\);\s*fadeOutPrompt\(timeline, revealAt\);\s*revealContent\(timeline, revealAt\);/);
  // Уходят строка команды, курсор и ready — курсор обязательно вместе с
  // текстом, иначе он прыгнет влево на «чистое» место после $.
  assert.match(appJs, /const promptElements = \[\.\.\.preloaderCommands, \.\.\.preloaderCarets, \.\.\.preloaderResults\];/);
  // Длительность вынесена в PROMPT_FADE: 0 — мгновенно, больше — затухание.
  assert.match(appJs, /opacity: 0,\s*duration: PROMPT_FADE/);
  // Текст чистится только когда затухание закончилось.
  assert.match(appJs, /onComplete: \(\) => \{\s*clearPrompt\(\);\s*window\.gsap\.set\(promptElements, \{ clearProps: 'opacity' \}\);/);
});

test('unlocks scrolling only after the content is fully revealed', async () => {
  const appJs = await readSrc('scripts/preloader.js');

  // Разблокировка — в onComplete всего таймлайна, то есть после раскрытия,
  // а не в момент снятия оверлея.
  assert.match(appJs, /const unlockScroll = \(\) => \{\s*finishFallback\(\);\s*lenis\?\.start\(\);/);
  assert.match(appJs, /window\.gsap\.timeline\(\{ onComplete: unlockScroll \}\)/);
  // Шаг снятия оверлея больше ничего не делает — скролл там не возвращается.
  assert.match(
    appJs,
    /timeline\.call\(\(\) => \{\s*preloader\.hidden = true;\s*\}, null, `\+=\$\{READY_HOLD\}`\);/
  );
});

test('reveals the content with a top-to-bottom mask once the preloader is done', async () => {
  const appJs = await readSrc('scripts/preloader.js');

  // Маска живёт на .body, а не на оверлее: раскрывается сам контент.
  assert.match(appJs, /const content = document\.querySelector\('\.body'\)/);
  assert.match(appJs, /clipPath = `inset\(0 0 \$\{Math\.max\(total - line, 0\)\}px 0\)`/);
  // Линия раскрытия проходит видимую высоту, а не всю длину страницы.
  assert.match(appJs, /Math\.max\(window\.innerHeight - top, 0\)/);
  // По окончании подрезка снимается.
  assert.match(appJs, /content\.style\.clipPath = '';/);
  assert.doesNotMatch(appJs, /clipPath: 'inset\(100% 0 0 0\)'/);
});
