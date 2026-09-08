import assert from 'node:assert/strict';
import test from 'node:test';

import { strings } from '../src/data/strings.mjs';
import { renderPage } from '../src/template.mjs';

test('presents web development with frontend and AI-assisted backend focus in both languages', () => {
  assert.equal(
    strings.ru.whoami.role,
    'веб-разработчик — frontend, AI-assisted backend и интерактивные спецпроекты'
  );
  assert.match(strings.ru.title, /веб-разработчик/);
  assert.match(strings.ru.description, /AI-assisted backend/);
  assert.equal(strings.ru.prompt.host, 'web-developer');

  assert.equal(
    strings.en.whoami.role,
    'web developer — frontend, AI-assisted backend & interactive projects'
  );
  assert.match(strings.en.title, /web developer/);
  assert.match(strings.en.description, /AI-assisted backend/);
  assert.equal(strings.en.prompt.host, 'web-developer');
});

test('places availability beside the name instead of in a separate status row', () => {
  for (const [lang, status] of [
    ['ru', 'доступен для проектов'],
    ['en', 'available for work'],
  ]) {
    const html = renderPage(lang);

    assert.match(
      html,
      new RegExp(`whoami-value--name[\\s\\S]*whoami-status[\\s\\S]*${status}`)
    );
    assert.doesNotMatch(html, /whoami-label">status<\//);
    assert.equal(html.match(new RegExp(status, 'g')).length, 2);
    assert.doesNotMatch(strings[lang].whoami.desktop.bio, new RegExp(status, 'i'));
  }
});
