import assert from 'node:assert/strict';
import test from 'node:test';
import { createPageInteractivity } from '../src/scripts/page-interactivity.js';

test('language navigation disposes old controllers and preserves selection and video positions', () => {
  const events = [];
  const controllers = [];
  const bindPage = createPageInteractivity({
    createFilters(data, options) {
      controllers.push({ kind: 'filters', data, options });
      events.push(`filters:${data.lang}`);
      return { destroy: () => events.push(`destroy-filters:${data.lang}`) };
    },
    createPreview(data, options) {
      controllers.push({ kind: 'preview', data, options });
      events.push(`preview:${data.lang}`);
      return { destroy: () => events.push(`destroy-preview:${data.lang}`) };
    },
  });
  const projects = [{ slug: 'first' }, { slug: 'second' }];
  bindPage({ lang: 'en', projects });
  controllers[0].options.onChange('games');
  controllers[1].options.onSelect('second');
  controllers[1].options.videoPositions.set('second', 12);
  bindPage(null);
  assert.equal(controllers.length, 2);
  bindPage({ lang: 'ru', projects });
  assert.deepEqual(events, ['filters:en', 'preview:en', 'destroy-filters:en', 'destroy-preview:en', 'filters:ru', 'preview:ru']);
  assert.equal(controllers[2].options.activeFilter, 'games');
  assert.equal(controllers[3].options.currentSlug, 'second');
  assert.equal(controllers[3].options.videoPositions.get('second'), 12);
});
