import assert from 'node:assert/strict';
import test from 'node:test';

import { strings } from '../src/data/strings.mjs';
import { renderPage } from '../src/template.mjs';

test('presents web development with frontend and AI-assisted backend focus in both languages', () => {
  assert.equal(
    strings.whoami.role.ru,
    'веб‑разработчик\u00A0— frontend, AI‑assisted backend и\u00A0интерактивные спецпроекты'
  );
  assert.match(strings.title.ru, /веб[‑-]разработчик/);
  assert.match(strings.description.ru, /AI[‑-]assisted backend/);
  assert.equal(strings.prompt.host, 'web-developer');

  assert.equal(
    strings.whoami.role.en,
    'web\u00A0developer\u00A0— frontend, AI‑assisted backend &\u00A0interactive projects'
  );
  assert.match(strings.title.en, /web[\s\u00A0]+developer/);
  assert.match(strings.description.en, /AI[‑-]assisted backend/);
  assert.equal(strings.prompt.host, 'web-developer');
});

test('places availability beside the name instead of in a separate status row', () => {
  for (const [lang, status] of [
    ['ru', 'доступен для\u00A0проектов'],
    ['en', 'available for\u00A0work'],
  ]) {
    const html = renderPage(lang);

    assert.match(
      html,
      new RegExp(`whoami-value--name[\\s\\S]*whoami-status[\\s\\S]*${status}`)
    );
    assert.doesNotMatch(html, /whoami-label">status<\//);
    assert.equal(html.match(new RegExp(status, 'g')).length, 2);
    assert.doesNotMatch(strings.whoami.bio[lang], new RegExp(status, 'i'));
  }
});
