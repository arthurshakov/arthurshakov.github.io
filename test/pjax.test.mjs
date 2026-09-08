import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import { projects } from '../src/data/projects.mjs';
import { renderPage } from '../src/template.mjs';
import { normalizePath, parsePage, applyPage, createPjaxRouter } from '../src/scripts/pjax.js';

test('build copies pjax.js into dist', async () => {
  const root = path.resolve(import.meta.dirname, '..');
  await assert.doesNotReject(access(path.join(root, 'dist/pjax.js')));
});

test('normalizePath normalizes roots, extensions and slashes correctly', () => {
  assert.equal(normalizePath(''), '/');
  assert.equal(normalizePath('/'), '/');
  assert.equal(normalizePath('/index.html'), '/');
  assert.equal(normalizePath('/ru'), '/ru/');
  assert.equal(normalizePath('/ru/'), '/ru/');
  assert.equal(normalizePath('/ru/index.html'), '/ru/');
});

test('parsePage extracts metadata, main content, and boot data from rendered pages', () => {
  for (const lang of ['en', 'ru']) {
    const html = renderPage(lang);
    const parsed = parsePage(html);

    assert.equal(parsed.lang, lang);
    assert.equal(parsed.dir, 'ltr');
    assert.ok(parsed.title.length > 0);
    assert.ok(parsed.description.length > 0);
    assert.ok(parsed.mainHtml.includes('section--whoami'));
    assert.ok(parsed.mainHtml.includes('section--works'));
    assert.ok(parsed.mainHtml.includes('section--preview'));
    assert.ok(parsed.mainHtml.includes('section--contact'));
    assert.ok(parsed.statusbarLanguages.length >= 1);
    assert.ok(parsed.audioLabels);
    assert.ok(parsed.audioLabels.start);
    assert.ok(parsed.audioLabels.stop);
    assert.ok(parsed.bootData);
    assert.equal(parsed.bootData.lang, lang);
    assert.equal(parsed.bootData.projects.length, projects.length);
  }
});

test('applyPage updates document metadata, statusbar languages, and main content', () => {
  let appliedTitle = '';
  let htmlLang = 'en';
  let mainContent = '<div class="old-main">old</div>';
  const metaAttrs = new Map();
  const canonicalAttrs = new Map();
  const langPills = [
    { innerHTML: '<a class="pill--on">en</a><a class="pill--off">ru</a>' },
    { innerHTML: '<a class="pill--on">en</a><a class="pill--off">ru</a>' },
  ];
  const audioBtn = {
    attrs: new Map([
      ['data-audio-state', 'off'],
      ['data-audio-label-on', 'sound on'],
      ['data-audio-label-off', 'sound off'],
      ['data-audio-start', 'turn on'],
      ['data-audio-stop', 'turn off'],
      ['aria-label', 'turn on'],
    ]),
    labelEl: { textContent: 'sound off' },
    getAttribute(name) {
      return this.attrs.get(name);
    },
    setAttribute(name, val) {
      this.attrs.set(name, val);
    },
    querySelector(sel) {
      if (sel === '[data-audio-label]') return this.labelEl;
      return null;
    },
  };

  const fakeDoc = {
    set title(val) {
      appliedTitle = val;
    },
    get title() {
      return appliedTitle;
    },
    documentElement: {
      setAttribute(attr, val) {
        if (attr === 'lang') htmlLang = val;
      },
    },
    querySelector(sel) {
      if (sel === 'meta[name="description"]') {
        return {
          setAttribute(attr, val) {
            metaAttrs.set(attr, val);
          },
        };
      }
      if (sel === 'link[rel="canonical"]') {
        return {
          setAttribute(attr, val) {
            canonicalAttrs.set(attr, val);
          },
        };
      }
      if (sel === '.body__main') {
        return {
          set innerHTML(val) {
            mainContent = val;
          },
          get innerHTML() {
            return mainContent;
          },
        };
      }
      return null;
    },
    querySelectorAll(sel) {
      if (sel === '.statusbar-language') return langPills;
      if (sel === '[data-audio-toggle]') return [audioBtn];
      if (sel === '.statusbar-meta__content > span:first-child') return [];
      return [];
    },
  };

  const fakeWindow = {
    __PORTFOLIO__: null,
  };

  const parsedRu = {
    title: 'Артур Шаков — портфолио',
    lang: 'ru',
    dir: 'ltr',
    description: 'Описание на русском',
    mainHtml: '<div class="new-main">новый контент</div>',
    statusbarLanguages: [
      '<a class="pill--off">en</a><a class="pill--on">ru</a>',
      '<a class="pill--off">en</a><a class="pill--on">ru</a>',
    ],
    audioLabels: {
      on: 'звук вкл',
      off: 'звук выкл',
      start: 'включить музыку',
      stop: 'выключить музыку',
    },
    bootData: { lang: 'ru' },
  };

  applyPage(parsedRu, { doc: fakeDoc, windowObj: fakeWindow });

  assert.equal(appliedTitle, 'Артур Шаков — портфолио');
  assert.equal(htmlLang, 'ru');
  assert.equal(metaAttrs.get('content'), 'Описание на русском');
  assert.equal(canonicalAttrs.get('href'), '/ru/');
  assert.equal(mainContent, '<div class="new-main">новый контент</div>');
  assert.equal(langPills[0].innerHTML, '<a class="pill--off">en</a><a class="pill--on">ru</a>');
  assert.equal(audioBtn.getAttribute('data-audio-label-on'), 'звук вкл');
  assert.equal(audioBtn.getAttribute('aria-label'), 'включить музыку');
  assert.equal(audioBtn.labelEl.textContent, 'звук выкл');
  assert.deepEqual(fakeWindow.__PORTFOLIO__, { lang: 'ru' });
});

test('createPjaxRouter caches pages and avoids re-fetching on repeat navigation', async () => {
  let fetchCount = 0;
  const pages = {
    '/': renderPage('en'),
    '/ru/': renderPage('ru'),
  };

  const fakeWindow = {
    location: {
      href: 'https://example.com/',
      pathname: '/',
      origin: 'https://example.com',
    },
    history: {
      pushState(state, title, url) {
        fakeWindow.location.pathname = url;
        fakeWindow.location.href = `https://example.com${url}`;
      },
    },
    addEventListener() {},
  };

  const fakeDoc = {
    addEventListener() {},
    title: '',
    documentElement: { setAttribute() {} },
    querySelector() {
      return { setAttribute() {}, set innerHTML(val) {} };
    },
    querySelectorAll() {
      return [];
    },
  };

  let navigatedCount = 0;
  const router = createPjaxRouter({
    fetchHtml: async (url) => {
      fetchCount += 1;
      return pages[url] || pages['/'];
    },
    onNavigate: () => {
      navigatedCount += 1;
    },
    windowObj: fakeWindow,
    docObj: fakeDoc,
  });

  await router.navigate('/ru/');
  assert.equal(fetchCount, 1);
  assert.equal(navigatedCount, 1);
  assert.equal(fakeWindow.location.pathname, '/ru/');

  // Повторный переход на /ru/ должен взять из кэша (fetchCount не растёт)
  fakeWindow.location.pathname = '/'; // симулируем возврат
  await router.navigate('/ru/');
  assert.equal(fetchCount, 1, 'repeat navigation must be served from cache');
  assert.equal(navigatedCount, 2);
});

test('transitions isolate audio-tuner in its own top-level view-transition group', async () => {
  const root = path.resolve(import.meta.dirname, '..');
  const cssPath = path.join(root, 'dist/styles.css');
  const { readFile } = await import('node:fs/promises');
  const css = await readFile(cssPath, 'utf8');

  assert.match(css, /\.audio-control--tuner\{[^}]*view-transition-name:\s*audio-tuner/);
  assert.match(css, /::view-transition-group\(audio-tuner\)\{[^}]*z-index:\s*10/);
  assert.match(css, /::view-transition-old\(audio-tuner\)\{[^}]*display:\s*none/);
});
