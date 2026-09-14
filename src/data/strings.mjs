// Тексты «хрома» интерфейса. Значения — дословно из Main*.dc.html / MainEN*.dc.html.
// Где артборды desktop и mobile расходятся по копирайту — обе версии (d / m).

import { projects } from './projects.mjs';

const PROJECT_COUNT = projects.length;

/**
 * Исходный словарь строк интерфейса.
 * Локализуемые свойства задаются объектом { ru, en }.
 * Общие свойства (не зависящие от языка) задаются строками или объектами.
 */
export const strings = {
  htmlLang: {
    ru: 'ru',
    en: 'en',
  },

  dir: 'ltr',

  title: {
    ru: 'Артур Шаков\u00A0— веб‑разработчик: frontend, AI‑assisted backend, спецпроекты',
    en: 'Arthur Shakov\u00A0— web\u00A0developer: frontend, AI‑assisted backend & interactive projects',
  },

  description: {
    ru: 'Портфолио Артура Шакова: frontend, AI‑assisted backend и\u00A0интерактивные спецпроекты. Vue/Nuxt, GSAP, THREE.js. 2×\u00A0Awwwards Honorable Mention.',
    en: 'Portfolio of\u00A0Arthur Shakov: frontend, AI‑assisted backend &\u00A0interactive projects. GSAP, THREE.js, Vue/Nuxt. 2×\u00A0Awwwards Honorable Mention.',
  },

  shareImage: '/assets/images/share.jpg',

  // status bar
  prompt: {
    user: 'arthur_shakov',
    at: '@',
    host: 'web-developer',
    sep: ':',
    path: '~/portfolio',
    dollar: '$',
  },

  selected: {
    ru: `показано ${PROJECT_COUNT} работ · 70+ всего`,
    en: `showing ${PROJECT_COUNT} works · 70+ total`,
  },

  skipToContent: {
    ru: 'перейти к\u00A0основному контенту',
    en: 'skip to\u00A0main content',
  },

  langLabel: '--lang=',

  langNavLabel: {
    ru: 'выбор языка',
    en: 'language selection',
  },

  audio: {
    on: { ru: 'звук вкл', en: 'sound on' },
    off: { ru: 'звук выкл', en: 'sound off' },
    start: { ru: 'включить фоновую музыку', en: 'turn on background music' },
    stop: { ru: 'выключить фоновую музыку', en: 'turn off background music' },
    previous: { ru: 'предыдущий трек', en: 'previous track' },
    next: { ru: 'следующий трек', en: 'next track' },
    track: { ru: 'трек', en: 'track' },
  },

  // section headers
  secWhoami: 'whoami',
  secWorks: 'works',
  secPreview: 'preview',
  secContact: 'contact',

  whoami: {
    labels: {
      name: 'name',
      role: 'role',
      bio: 'bio',
      stack: 'stack',
      awards: 'awards',
      clients: 'clients',
      workflow: 'workflow',
      languages: 'languages',
      status: 'status',
      location: 'location',
    },

    name: {
      ru: 'Артур Шаков',
      en: 'Arthur Shakov',
    },

    role: {
      ru: 'веб‑разработчик\u00A0— frontend, AI‑assisted backend и\u00A0интерактивные спецпроекты',
      en: 'web\u00A0developer\u00A0— frontend, AI‑assisted backend &\u00A0interactive projects',
    },

    awardsText:
      '2×\u00A0Awwwards Honorable Mention [+ Mobile Excellence] · 2×\u00A0CSSDA Special Kudos',

    languages: 'RU\u00A0native · EN\u00A0C1',

    bio: {
      ru: 'Собираю спецпроекты с\u00A02017\u00A0года: концепция, семантичная БЭМ‑вёрстка, сложные анимации (GSAP, THREE.js), Vue/Nuxt, React/Next, интеграция с\u00A0бэкендом, выкат в\u00A0прод. Работаю spec‑first: подробное\u00A0ТЗ, затем реализация в\u00A0паре с\u00A0AI (Codex, Claude\u00A0Code, Antigravity). Начинал в\u00A0Whitemark\u00A0— награды Awwwards и\u00A0CSS Design Awards; сейчас\u00A0— в\u00A0агентстве «Девять\u00A0Линий».',

      en: 'Building campaign projects since\u00A02017: concept, semantic BEM\u00A0markup, heavy animation (GSAP, THREE.js), Vue/Nuxt, React/Next, backend integration, shipping to\u00A0production. Work spec‑first: a\u00A0detailed spec, then implementation paired with AI\u00A0agents (Codex, Claude\u00A0Code, Antigravity). Started at\u00A0Whitemark\u00A0— Awwwards &\u00A0CSS Design Awards; now at\u00A0Nine\u00A0Lines agency.',
    },

    stack: 'JavaScript / TypeScript · Vue / Nuxt · React / Next · GSAP · THREE.js · video.js · SCSS · Pug · Vite / Webpack / Gulp · PHP · Bitrix CMS · WordPress · Figma',

    clients: {
      ru: 'РБК · ТАСС · X5 (Пятёрочка, Перекрёсток, Чижик) · food.ru · Норникель · Сбер · Росатом · Etalon\u00A0Group · Praxis',
      en: 'RBC · TASS · X5 (Pyaterochka, Perekrestok, Chizhik) · food.ru · Nornickel · Sber · Rosatom · Etalon\u00A0Group · Praxis',
    },

    workflow: {
      ru: 'Codex · Claude\u00A0Code · Antigravity (spec‑first\u00A0— сначала спецификация, затем\u00A0код)',
      en: 'Codex · Claude\u00A0Code · Antigravity (spec‑first\u00A0— a\u00A0written spec before\u00A0code)',
    },

    status: {
      ru: 'доступен для\u00A0проектов',
      en: 'available for\u00A0work',
    },

    location: {
      ru: 'UTC+3 · удалёнка/гибрид · готов рассмотреть переезд',
      en: 'UTC+3 · remote/hybrid · open to\u00A0relocation',
    },
  },

  // works
  grep: 'grep:',

  filters: [
    { id: 'all', label: { ru: 'все', en: 'all' } },
    { id: 'awwwards', label: { ru: 'awwwards', en: 'awwwards' } },
    { id: 'promo', label: { ru: 'промо', en: 'promo' } },
    { id: 'games', label: { ru: 'игры', en: 'games' } },
    { id: 'corporate', label: { ru: 'корпоративные', en: 'corporate' } },
    { id: 'real-estate', label: { ru: 'недвижимость', en: 'real estate' } },
    { id: 'brand', label: { ru: 'бренды / каталоги', en: 'brand / catalogue' } },
    { id: 'auto', label: { ru: 'авто', en: 'auto' } },
    { id: 'timeline', label: { ru: 'таймлайн', en: 'timeline' } },
    { id: 'video', label: { ru: 'видео', en: 'video' } },
  ],

  thead: { year: 'year', project: 'project', client: 'client', type: 'type' },

  rowOpen: 'open',

  newTab: {
    ru: 'в\u00A0новой вкладке',
    en: 'opens in\u00A0new tab',
  },

  selectProject: {
    ru: 'выбрать проект',
    en: 'select project',
  },

  featured: {
    ru: 'избранный проект',
    en: 'featured project',
  },

  filterAnnounce: {
    ru: 'показано проектов: {count} из {total}',
    en: 'showing {count} of {total} projects',
  },

  previewAnnounce: {
    ru: 'выбран проект {slug}, {index} из {total}',
    en: 'selected project {slug}, {index} of {total}',
  },

  // preview
  openSite: {
    ru: 'открыть сайт',
    en: 'open site',
  },

  prevProject: {
    ru: 'предыдущий проект',
    en: 'previous project',
  },

  nextProject: {
    ru: 'следующий проект',
    en: 'next project',
  },

  stripCaption: {
    ru: '// клик по\u00A0превью\u00A0— меняет большой кадр',
    en: '// click a\u00A0preview to\u00A0swap the\u00A0main\u00A0shot',
  },

  // contacts
  contacts: {
    cmd: 'contact',
    items: [
      {
        key: 'email',
        flag: '--email',
        label: 'arthurshakov@gmail.com',
        href: 'mailto:arthurshakov@gmail.com',
        ext: false,
      },
      {
        key: 'github',
        flag: '--github',
        label: 'github.com/arthurshakov',
        href: 'https://github.com/arthurshakov',
        ext: true,
      },
      {
        key: 'tg',
        flag: '--tg',
        label: '@arthur_shakov',
        href: 'https://t.me/arthur_shakov',
        ext: true,
      },
      {
        key: 'cv',
        flag: '--cv',
        label: 'resume.pdf',
        href: '/assets/arthur-shakov-resume.pdf',
        ext: true,
      },
    ],
    note: {
      ru: '// открыт к\u00A0интересным спецпроектам и\u00A0продуктовым командам',
      en: '// open to\u00A0interesting campaign work and\u00A0product teams',
    },
  },

  colophon: {
    ru: 'сделано на\u00A0vanilla\u00A0JS + Lenis + GSAP · без\u00A0фреймворков · ©\u00A02026',
    en: 'built with\u00A0vanilla\u00A0JS + Lenis + GSAP · no\u00A0frameworks · ©\u00A02026',
  },
};

