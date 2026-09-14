import assert from 'node:assert/strict';
import test from 'node:test';

import { strings } from '../src/data/strings.mjs';

test('strings stores ru and en side-by-side on individual properties', () => {
  assert.equal(strings.whoami.name.ru, 'Артур Шаков');
  assert.equal(strings.whoami.name.en, 'Arthur Shakov');

  assert.equal(
    strings.whoami.role.ru,
    'веб‑разработчик\u00A0— frontend, AI‑assisted backend и\u00A0интерактивные спецпроекты'
  );
  assert.equal(
    strings.whoami.role.en,
    'web\u00A0developer\u00A0— frontend, AI‑assisted backend &\u00A0interactive projects'
  );
  assert.equal(strings.whoami.labels.name, 'name');
  assert.equal(strings.whoami.labels.role, 'role');
  assert.ok(Array.isArray(strings.filters));
  for (const filter of strings.filters) {
    assert.ok(filter.id, 'Filter must have an id');
    assert.ok(filter.label.ru, `Filter ${filter.id} must have ru label`);
    assert.ok(filter.label.en, `Filter ${filter.id} must have en label`);
  }
});

test('strings contains unified non-duplicated properties and contacts', () => {
  assert.equal(typeof strings.dir, 'string');
  assert.equal(typeof strings.colophon.ru, 'string');
  assert.equal(typeof strings.colophon.en, 'string');
  assert.equal(typeof strings.stripCaption.ru, 'string');
  assert.equal(typeof strings.stripCaption.en, 'string');

  assert.equal(strings.contacts.cmd, 'contact');
  assert.equal(strings.contacts.items.length, 4);
  const email = strings.contacts.items.find((i) => i.key === 'email');
  assert.equal(email?.href, 'mailto:arthurshakov@gmail.com');
  assert.equal(email?.ext, false);
});


