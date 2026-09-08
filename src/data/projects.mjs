// 12 работ. Порядок = featured (как в Main.dc.html), НЕ по годам.
// Источник значений: DESIGN-SPEC.md + Main*.dc.html + "portfolio projects.md".
// description для всех, кроме glass-decor, — заглушки (по договорённости). client/year/url/awwwards — настоящие.

const TODO_RU = '// описание — TODO';
const TODO_EN = '// description — TODO';

/** @type {import('../types/portfolio.d.ts').Project[]} */
export const projects = [
  // POWER X TIME
  {
    slug: 'power-x-time',
    year: 2024,
    client: {
      ru: 'ТАСС × Росатом  (веб-студия Ninelines)',
      en: 'TASS × Rosatom  (Ninelines web-studio)',
    },
    type: { ru: 'интерактивный таймлайн', en: 'interactive timeline' },
    // url: 'https://spec.tass.ru/power-x-time/',
    url: 'https://tass-power-x-time.linestest.com/',
    site: 'tass-power-x-time.linestest.com',
    categories: [],
    note: {
      ru: 'кампания завершена · боевой сайт отключён · ссылка ведёт на тестовый стенд',
      en: 'campaign ended · live site offline · link points to staging environment',
    },
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/tass-power-x-time.webm',
      mp4: '/assets/video/tass-power-x-time.mp4',
    },
    tags: ['GSAP', 'Barba.js', 'Canvas', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд интерактивного спецпроекта: бесшовные переходы между разделами на Barba.js, сложную скролл-анимацию таймлайна на GSAP (ScrollTrigger и ScrollSmoother), а также интерактивные карточки и световые эффекты на Canvas. Реализовал динамическую навигацию по эпохам и событиям, оптимизировал производительность и создал отдельную мобильную версию с жестовым управлением и туториалом. Также настроил передачу пользовательских событий в Яндекс Метрику в соответствии с аналитической схемой проекта.',
      en: 'At Nine Lines, I developed the frontend for this interactive campaign: seamless page transitions powered by Barba.js, complex timeline scroll animations using GSAP (ScrollTrigger and ScrollSmoother), and Canvas-based interactive cards with lighting effects. I implemented dynamic navigation across historical eras and milestones, optimized performance, and delivered a dedicated mobile experience with gesture controls and an onboarding tutorial. I also integrated custom event tracking with Yandex Metrica based on the project’s analytics specification.',
    },
  },

  // VMESTE AI
  {
    slug: 'vmeste-ai',
    year: 2026,
    client: {
      ru: 'Фонд Потанина × ТАСС  (веб-студия Ninelines)',
      en: 'Potanin Foundation × TASS  (Ninelines web-studio)',
    },
    type: { ru: 'цикл видеолекций', en: 'video-lecture series' },
    url: 'https://tass.ru/specialprojects/vmeste-ai',
    site: 'tass.ru/specialprojects/vmeste-ai',
    categories: [],
    star: false,
    awwwards: null,
    tags: ['video.js', 'Barba.js', 'Swiper', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд мультимедийного спецпроекта: бесшовные PJAX-переходы между разделами на Barba.js, интерактивный плеер на video.js со стримингом HLS (.m3u8) и кликабельными тайм-кодами, а также синхронизированные Swiper-слайдеры с фоновыми видеолупами. Реализовал эффекты матового стекла на SVG-фильтрах шума, кастомный курсор и отдельный табовый интерфейс для мобильных устройств. Также настроил передачу пользовательских событий в Яндекс Метрику в соответствии с аналитической схемой проекта.',
      en: 'At Nine Lines, I developed the frontend for this multimedia campaign: seamless Barba.js page transitions, an interactive video.js player with HLS streaming (.m3u8) and clickable timecodes, alongside synchronized Swiper sliders with background video loops. I implemented frosted-glass styling using SVG noise filters, a custom cursor, and a dedicated tabbed interface for mobile devices. I also integrated custom event tracking with Yandex Metrica based on the project’s analytics specification.',
    },
  },

  // GLASS DECOR
  {
    slug: 'glass-decor',
    year: 2019,
    client: {
      ru: 'Glass Decor (веб-студия Whitemark)',
      en: 'Glass Decor (Whitemark web-studio)',
    },
    type: {
      ru: 'сайт-каталог',
      en: 'product showcase',
    },
    url: 'https://glass-decor.ru/en/',
    site: 'glass-decor.ru',
    categories: ['awwwards'],
    star: true,
    awards: [
      {
        ru: 'Awwwards — Honorable Mention + Mobile Excellence',
        en: 'Awwwards — Honorable Mention + Mobile Excellence',
        url: 'https://www.awwwards.com/sites/glass-decor',
      },

      {
        ru: 'CSS Design Awards — Special Kudos',
        en: 'CSS Design Awards — Special Kudos',
        url: 'https://www.cssdesignawards.com/sites/glass-decor/37869/',
      },
    ],
    video: {
      webm: '/assets/video/glass-decor.webm',
      mp4: '/assets/video/glass-decor.mp4',
    },
    tags: ['GSAP', 'Vue', 'THREE.js', 'Gulp', 'Bitrix CMS'],
    description: {
      ru: 'В Whitemark я полностью разработал фронтенд: анимации и переходы на GSAP, THREE.js, а также каталог на Vue, связанный с административной панелью Bitrix CMS. Также интегрировал адаптивную вёрстку в Bitrix CMS и подготовил отдельные мобильную и двуязычную — русскую и английскую — версии сайта.',
      en: 'At Whitemark, I built the frontend: immersive Three.js scenes, GSAP and THREE.js-led animations and transitions, and a Vue-based catalogue connected to the Bitrix CMS admin panel. I also integrated the responsive layouts into Bitrix CMS and delivered dedicated mobile and bilingual English/Russian versions.',
    },
  },

  // HILL8
  {
    slug: 'hill8',
    year: 2018,
    client: {
      ru: 'Hill8 (веб-студия Whitemark)',
      en: 'Hill8 (Whitemark web-studio)',
    },
    type: { ru: 'сайт апартаментов · выборщик', en: 'residential showcase · selector' },
    url: 'http://hill8.whitemark-it.com/',
    site: 'hill8.whitemark-it.com',
    categories: ['awwwards'],
    star: true,
    note: {
      ru: 'боевой сайт отключён · ссылка ведёт на тестовый стенд',
      en: 'live site offline · link points to staging environment',
    },
    awards: [
      {
        ru: 'Awwwards — Honorable Mention',
        en: 'Awwwards — Honorable Mention',
        url: 'https://www.awwwards.com/sites/hill8',
      },
      {
        ru: 'CSS Design Awards — Special Kudos',
        en: 'CSS Design Awards — Special Kudos',
        url: 'https://www.cssdesignawards.com/sites/hill8/34364/',
      },
    ],
    tags: ['GSAP', 'Vue', 'Bitrix CMS', 'JavaScript'],
    description: {
      ru: 'В Whitemark я разработал фронтенд промосайта премиального комплекса апартаментов HILL8: бесшовные кинематографичные переходы между страницами и меню на GSAP, интерактивный выборщик апартаментов на Vue (с подбором на схеме комплекса, поэтажными планами и фильтрацией по планировкам), а также адаптивную вёрстку с интеграцией в Bitrix CMS. Проект отмечен Awwwards Honorable Mention, CSS Design Awards и признан лучшим девелоперским сайтом Европы на European Property Awards.',

      en: 'At Whitemark, I built the frontend for the HILL8 luxury apartment complex: seamless cinematic page and menu transitions powered by GSAP, an interactive Vue-based apartment selector (featuring interactive building schemes, floor plans, and layout filtering), and responsive layouts integrated into Bitrix CMS. The project received an Awwwards Honorable Mention, a CSS Design Awards Special Kudos, and won Developer Website Europe at the European Property Awards.',
    },
  },

  // GIGACHAT
  // {
  //   slug: 'gigachat',
  //   year: 2025,
  //   client: { ru: 'РБК × Сбер', en: 'RBC × Sber' },
  //   type: { ru: 'GenAI-спецпроект', en: 'GenAI campaign' },
  //   url: 'https://genai.rbc.ru/',
  //   site: 'genai.rbc.ru',
  //   categories: ['genai'],
  //   star: false,
  //   awwwards: null,
  //   tags: ['GenAI', 'JavaScript', 'SCSS'],
  //   description: { ru: TODO_RU, en: TODO_EN },
  // },

  // NORNICKEL 90
  // {
  //   slug: 'nornickel-90',
  //   year: 2025,
  //   client: { ru: 'ТАСС', en: 'TASS' },
  //   type: { ru: 'спецпроект-лонгрид', en: 'editorial longread' },
  //   url: 'https://tass.ru/specialprojects/nornickel-90',
  //   site: 'tass.ru/specialprojects/nornickel-90',
  //   categories: [],
  //   star: false,
  //   awwwards: null,
  //   tags: ['longread', 'GSAP', 'JavaScript'],
  //   description: { ru: TODO_RU, en: TODO_EN },
  // },

  // BEST CASHIER
  {
    slug: 'best-cashier',
    year: 2026,
    client: { ru: 'X5 / food.ru', en: 'X5 / food.ru' },
    type: { ru: 'игра-тренажёр', en: 'training game' },
    url: 'https://best-cashier.food.ru/',
    site: 'best-cashier.food.ru',
    categories: ['games'],
    star: false,
    awwwards: null,
    tags: ['game', 'Canvas', 'JavaScript'],
    description: { ru: TODO_RU, en: TODO_EN },
  },

  // KLASSNYE SBORY
  {
    slug: 'klassnie-sbory',
    year: 2026,
    client: { ru: 'Чижик', en: 'Chizhik' },
    type: { ru: 'промо «снова в школу»', en: 'back-to-school promo' },
    url: 'https://klassnie-sbory.food.ru/',
    site: 'klassnie-sbory.food.ru',
    categories: ['promo'],
    star: false,
    awwwards: null,
    tags: ['Nuxt', 'GSAP', 'promo'],
    description: { ru: TODO_RU, en: TODO_EN },
  },

  // SL SOFT
  {
    slug: 'sl-soft',
    year: 2025,
    client: { ru: 'Praxis', en: 'Praxis' },
    type: { ru: 'корпоративный сайт', en: 'corporate site' },
    url: 'https://slsoft.ru/',
    site: 'slsoft.ru',
    categories: ['corporate'],
    star: false,
    awwwards: null,
    tags: ['corporate', 'JavaScript', 'SCSS'],
    description: { ru: TODO_RU, en: TODO_EN },
  },

  // ETALON GROUP
  {
    slug: 'etalon-group',
    year: 2025,
    client: { ru: 'Praxis', en: 'Praxis' },
    type: { ru: 'девелопер · инвест-презентации', en: 'developer · investor decks' },
    url: 'https://www.etalongroup.com/',
    site: 'etalongroup.com',
    categories: ['corporate'],
    star: false,
    awwwards: null,
    tags: ['corporate', 'JavaScript', 'SCSS'],
    description: { ru: TODO_RU, en: TODO_EN },
  },

  // CAREER NORNICKEL
  {
    slug: 'career-nornickel',
    year: 2026,
    client: { ru: 'Норникель', en: 'Nornickel' },
    type: { ru: 'карьерный сайт', en: 'careers site' },
    url: 'https://career.nornickel.ru/',
    site: 'career.nornickel.ru',
    categories: ['corporate'],
    star: false,
    awwwards: null,
    tags: ['corporate', 'JavaScript', 'SCSS'],
    description: { ru: TODO_RU, en: TODO_EN },
  },

  // ASTRA DRIVE
  {
    slug: 'astra-drive',
    year: 2025,
    client: { ru: 'Astra', en: 'Astra' },
    type: { ru: 'бренд-сайт', en: 'brand site' },
    url: 'https://astradrive.net/',
    site: 'astradrive.net',
    categories: ['promo'],
    star: false,
    awwwards: null,
    tags: ['brand', 'GSAP', 'JavaScript'],
    description: { ru: TODO_RU, en: TODO_EN },
  },
];
