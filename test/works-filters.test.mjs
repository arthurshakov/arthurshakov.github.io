import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { projects } from '../src/data/projects.mjs';
import { strings } from '../src/data/strings.mjs';
import { renderPage } from '../src/template.mjs';

test('works filters are defined bilingually with matching IDs and localized labels', () => {
  const ids = strings.filters.map((f) => f.id);

  assert.equal(ids[0], 'all');
  assert.equal(strings.filters[0].label.ru, 'все');
  assert.equal(strings.filters[0].label.en, 'all');

  assert.ok(ids.includes('auto'), 'Should include auto filter');

  for (const filter of strings.filters) {
    assert.ok(filter.id, 'Filter must have an id');
    assert.ok(filter.label.ru, 'Filter must have a ru label');
    assert.ok(filter.label.en, 'Filter must have an en label');
  }
});

test('every filter targets at least one project and every project has a matching filter', () => {
  const filterIds = strings.filters.map((f) => f.id).filter((id) => id !== 'all');

  function projectMatchesFilter(project, filterId) {
    const cats = project.categories || [];
    if (filterId === 'brand') {
      return cats.includes('brand') || cats.includes('catalogue');
    }
    if (filterId === 'auto') {
      return cats.includes('auto') || cats.includes('automobiles');
    }
    return cats.includes(filterId);
  }

  // Every non-all filter matches at least one project
  for (const filterId of filterIds) {
    const matching = projects.filter((p) => projectMatchesFilter(p, filterId));
    assert.ok(
      matching.length > 0,
      `Filter "${filterId}" should match at least one project, but matched 0`
    );
  }

  // Every project is matched by at least one non-all filter
  for (const project of projects) {
    const matchingFilters = filterIds.filter((fId) => projectMatchesFilter(project, fId));
    assert.ok(
      matchingFilters.length > 0,
      `Project "${project.slug}" should be matched by at least one filter, but matched none (categories: ${JSON.stringify(project.categories)})`
    );
  }
});

test('rendered HTML includes all filter chips with correct data-filter attributes in both languages', () => {
  for (const lang of ['ru', 'en']) {
    const html = renderPage(lang);
    for (const filter of strings.filters) {
      assert.match(
        html,
        new RegExp(`data-filter="${filter.id}"`),
        `Missing data-filter="${filter.id}" in ${lang} HTML`
      );
      assert.match(
        html,
        new RegExp(`>${filter.label[lang]}</button>`),
        `Missing label "${filter.label[lang]}" in ${lang} HTML`
      );
    }
  }
});

test('mobile filters markup has a draggable strip and track structure', async () => {
  const html = renderPage('ru');
  const source = await readFile(new URL('../src/scripts/works-filters.js', import.meta.url), 'utf8');

  assert.match(html, /<div class="filters mobile-only" data-filters-strip>/);
  assert.match(html, /<div class="filters-track" data-filters-track>/);

  assert.match(source, /const filtersStrip = .*query\('\[data-filters-strip\]'\)/);
  assert.match(source, /const filtersTrack = .*query\('\[data-filters-track\]'\)/);
  assert.match(source, /filtersDraggable = DraggableClass\.create\(filtersTrack/);
  assert.match(source, /scrollFilterIntoView/);
});
