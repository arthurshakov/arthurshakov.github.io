// Тексты «хрома» интерфейса. Значения — дословно из Main*.dc.html / MainEN*.dc.html.
// Где артборды desktop и mobile расходятся по копирайту — обе версии (d / m).

import { projects } from './projects.mjs';

const PROJECT_COUNT = projects.length;

const STACK_STRING = 'JavaScript / TypeScript · React · Vue / Nuxt · GSAP · THREE.js · video.js · SCSS · Pug · Vite / Webpack / Gulp · PHP · Bitrix CMS · WordPress · Figma';

export const strings = {
  ru: {
    htmlLang: 'ru',
    dir: 'ltr',
    title: 'Артур Шаков — веб-разработчик: frontend, AI-assisted backend, спецпроекты',
    description:
      'Портфолио Артура Шакова: frontend, AI-assisted backend и интерактивные спецпроекты. Vue/Nuxt, GSAP, THREE.js. 2× Awwwards Honorable Mention.',
    // status bar
    prompt: {
      user: 'arthur_shakov',
      at: '@',
      host: 'web-developer',
      sep: ':',
      path: '~/portfolio',
      dollar: '$',
    },
    selected: `${PROJECT_COUNT} selected · 60+ total`,
    selectedM: `${PROJECT_COUNT} selected · 60+ total`,
    langLabel: '--lang=',
    audio: {
      on: 'звук вкл',
      off: 'звук выкл',
      start: 'включить фоновую музыку',
      stop: 'выключить фоновую музыку',
      previous: 'предыдущий трек',
      next: 'следующий трек',
      track: 'трек',
    },
    // section headers
    secWhoami: 'whoami',
    secWorks: 'works',
    secPreview: 'preview',
    secContact: 'contact',
    worksCountD: `${PROJECT_COUNT} отобрано из 60+`,
    worksCountM: `${PROJECT_COUNT} / 60+`,
    // whoami — labels
    w: {
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
    whoami: {
      name: 'Артур Шаков',
      role: 'веб-разработчик — frontend, AI-assisted backend и интерактивные спецпроекты',
      awardsText: '2× Awwwards Honorable Mention',
      awardsNote: '[+ Mobile Excellence]',
      awardsExtra: '· 2× CSSDA Special Kudos',
      languages: 'RU native · EN C1',
      desktop: {
        bio: 'Собираю спецпроекты с 2017 года: концепция, семантичная БЭМ‑вёрстка, сложные анимации (GSAP, THREE.js), Vue/Nuxt, SPA, интеграция с бэкендом, выкат в прод. Работаю spec-first: подробное ТЗ, затем реализация в паре с AI (Claude Code, Antigravity, Codex). Начинал в Whitemark — награды Awwwards и CSS Design Awards; сейчас — в агентстве «Девять Линий».',
        stack: STACK_STRING,
        clients: 'РБК · ТАСС · X5 (Пятёрочка, Перекрёсток, Чижик) · food.ru · Норникель · Сбер · Росатом · Etalon Group',
        workflow: 'Claude Code · Antigravity · Codex (spec-first — сначала спецификация, затем код)',
        status: 'доступен для проектов',
        location: 'UTC+3 · удалёнка/гибрид · готов рассмотреть переезд',
      },
      mobile: {
        // bio и stack берутся с десктопа автоматически
        clients: 'РБК · ТАСС · X5 · food.ru · Норникель · Сбер · Росатом · Etalon Group',
        workflow: 'Claude Code · Antigravity · Codex (spec-first)',
        // на мобиле status и location объединены в одну строку
        statusCombined: 'доступен для проектов · UTC+3 · готов рассмотреть переезд',
      },
    },
    // works
    grep: 'grep:',
    sort: 'sort: featured',
    filters: [
      { id: 'all', label: 'all' },
      { id: 'awwwards', label: 'awwwards' },
      { id: 'genai', label: 'genai' },
      { id: 'games', label: 'игры' },
      { id: 'promo', label: 'промо' },
      { id: 'corporate', label: 'корпоративные' },
    ],
    thead: { year: 'year', project: 'project', client: 'client', type: 'type' },
    rowOpen: 'open',
    // archiveDesktop: {
    //   cmd: 'ls works/_archive/ | wc -l',
    //   arrow: '→ 60+',
    //   tail: '— промо, игры, конфигураторы, лендинги для food.ru, РБК, ТАСС, Норникеля',
    //   link: '[ показать все ]',
    // },
    // archiveMobile: { cmd: 'ls _archive/', arrow: '→ 60+', link: '[ показать все ]' },
    // preview
    openSite: 'открыть сайт',
    stripCaptionD: '// клик по превью — меняет большой кадр',
    stripCaptionM: '// свайп — меняет большой кадр',
    // contact
    contactCmd: 'contact',
    contactFlags: { email: '--email', github: '--github', tg: '--tg', cv: '--cv' },
    contactValues: {
      email: 'arthurshakov@gmail.com',
      github: 'github.com/arthurshakov',
      tg: '@arthur_shakov',
      cv: 'resume.pdf',
    },
    contactNote: '// открыт к интересным спецпроектам и продуктовым командам',
    colophonD: 'built with vanilla JS + Lenis · no framework · © 2026',
    colophonM: 'built with vanilla JS + Lenis · © 2026',
  },

  en: {
    htmlLang: 'en',
    dir: 'ltr',
    title: 'Arthur Shakov — web developer: frontend, AI-assisted backend & interactive projects',
    description:
      'Portfolio of Arthur Shakov: frontend, AI-assisted backend & interactive projects. GSAP, THREE.js, Vue/Nuxt. 2× Awwwards Honorable Mention.',
    prompt: {
      user: 'arthur_shakov',
      at: '@',
      host: 'web-developer',
      sep: ':',
      path: '~/portfolio',
      dollar: '$',
    },
    selected: `${PROJECT_COUNT} selected · 60+ total`,
    selectedM: `${PROJECT_COUNT} selected · 60+ total`,
    langLabel: '--lang=',
    audio: {
      on: 'sound on',
      off: 'sound off',
      start: 'turn on background music',
      stop: 'turn off background music',
      previous: 'previous track',
      next: 'next track',
      track: 'track',
    },
    secWhoami: 'whoami',
    secWorks: 'works',
    secPreview: 'preview',
    secContact: 'contact',
    worksCountD: `${PROJECT_COUNT} selected of 60+`,
    worksCountM: `${PROJECT_COUNT} / 60+`,
    w: {
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
    whoami: {
      name: 'Arthur Shakov',
      role: 'web developer — frontend, AI-assisted backend & interactive projects',
      awardsText: '2× Awwwards Honorable Mention',
      awardsNote: '[+ Mobile Excellence]',
      awardsExtra: '· 2× CSSDA Special Kudos',
      languages: 'RU native · EN C1',
      desktop: {
        bio: 'Building campaign projects since 2017: concept, semantic BEM markup, heavy animation (GSAP, THREE.js), Vue/Nuxt, SPA, backend integration, shipping to production. Work spec-first: a detailed spec, then implementation paired with AI agents (Claude Code, Antigravity, Codex). Started at Whitemark — Awwwards & CSS Design Awards; now at Nine Lines agency.',
        stack: STACK_STRING,
        clients: 'RBC · TASS · X5 (Pyaterochka, Perekrestok, Chizhik) · food.ru · Nornickel · Sber · Rosatom · Etalon Group',
        workflow: 'Claude Code · Antigravity · Codex (spec-first — a written spec before code)',
        status: 'available for work',
        location: 'UTC+3 · remote/hybrid · open to relocation',
      },
      mobile: {
        // bio and stack fall back to desktop automatically
        clients: 'RBC · TASS · X5 · food.ru · Nornickel · Sber · Rosatom · Etalon Group',
        workflow: 'Claude Code · Antigravity · Codex (spec-first)',
        statusCombined: 'available for work · Chegem · relocation ok',
      },
    },
    grep: 'grep:',
    sort: 'sort: featured',
    filters: [
      { id: 'all', label: 'all' },
      { id: 'awwwards', label: 'awwwards' },
      { id: 'genai', label: 'genai' },
      { id: 'games', label: 'games' },
      { id: 'promo', label: 'promo' },
      { id: 'corporate', label: 'corporate' },
    ],
    thead: { year: 'year', project: 'project', client: 'client', type: 'type' },
    rowOpen: 'open',
    archiveDesktop: {
      cmd: 'ls works/_archive/ | wc -l',
      arrow: '→ 60+',
      tail: '— promo, games, configurators and landing pages for food.ru, RBC, TASS, Nornickel',
      link: '[ show all ]',
    },
    archiveMobile: { cmd: 'ls _archive/', arrow: '→ 60+', link: '[ show all ]' },
    openSite: 'open site',
    stripCaptionD: '// click a preview to swap the main shot',
    stripCaptionM: '// swipe to swap the main shot',
    contactCmd: 'contact',
    contactFlags: { email: '--email', github: '--github', tg: '--tg', cv: '--cv' },
    contactValues: {
      email: 'arthurshakov@gmail.com',
      github: 'github.com/arthurshakov',
      tg: '@arthur_shakov',
      cv: 'resume.pdf',
    },
    contactNote: '// open to interesting campaign work and product teams',
    colophonD: 'built with vanilla JS + Lenis · no framework · © 2026',
    colophonM: 'built with vanilla JS + Lenis · © 2026',
  },
};

// Реальные href для контактов (значения-подписи — в contactValues).
export const contactHref = {
  email: 'mailto:arthurshakov@gmail.com',
  github: 'https://github.com/arthurshakov',
  tg: 'https://t.me/arthur_shakov',
  cv: '/assets/arthur-shakov-resume.pdf',
};
