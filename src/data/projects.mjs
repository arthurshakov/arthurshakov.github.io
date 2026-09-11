// Избранные проекты. Порядок = featured, НЕ по годам.
// Метаданные: "portfolio projects.md" и уточнения автора.
// Незаполненные описания отмечены TODO на обоих языках.

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
    video: {
      webm: '/assets/video/vmeste-ai.webm',
      mp4: '/assets/video/vmeste-ai.mp4',
    },
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
    video: {
      webm: '/assets/video/hill8.webm',
      mp4: '/assets/video/hill8.mp4',
    },
    tags: ['GSAP', 'Vue', 'Bitrix CMS', 'JavaScript'],
    description: {
      ru: 'В Whitemark я разработал фронтенд промосайта премиального комплекса апартаментов HILL8: бесшовные кинематографичные переходы между страницами и меню на GSAP, интерактивный выборщик апартаментов на Vue (с подбором на схеме комплекса, поэтажными планами и фильтрацией по планировкам), а также адаптивную вёрстку с интеграцией в Bitrix CMS. Проект отмечен Awwwards Honorable Mention, CSS Design Awards и признан лучшим девелоперским сайтом Европы на European Property Awards.',

      en: 'At Whitemark, I built the frontend for the HILL8 luxury apartment complex: seamless cinematic page and menu transitions powered by GSAP, an interactive Vue-based apartment selector (featuring interactive building schemes, floor plans, and layout filtering), and responsive layouts integrated into Bitrix CMS. The project received an Awwwards Honorable Mention, a CSS Design Awards Special Kudos, and won Developer Website Europe at the European Property Awards.',
    },
  },

  // BEST CASHIER
  {
    slug: 'best-cashier',
    year: 2026,
    client: {
      ru: 'X5 / food.ru  (веб-студия Ninelines)',
      en: 'X5 / food.ru  (Ninelines web-studio)',
    },
    type: { ru: 'игра-тренажёр', en: 'training game' },
    url: 'https://best-cashier.food.ru/',
    site: 'best-cashier.food.ru',
    categories: ['games'],
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/best-cashier.webm',
      mp4: '/assets/video/best-cashier.mp4',
    },
    tags: ['Nuxt', 'GSAP', 'game', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд интерактивной игры-тренажёра на Nuxt 4: симулятор кассового узла с движущейся конвейерной лентой, механику сканирования штрихкодов, взвешивания и ручного ввода кодов, а также анимированный на GSAP спидометр скорости обслуживания с контролем нормативов. Реализовал диалоговые сценарии с 7 виртуальными покупателями, образовательные модули с памятками, звуковое сопровождение и соревновательный режим с турнирной таблицей. Также настроил передачу пользовательских событий в Яндекс Метрику в соответствии с аналитической схемой проекта.',
      en: 'At Nine Lines, I developed the frontend for this interactive training game built with Nuxt 4: a checkout counter simulation with a moving conveyor belt, barcode scanning, product weighing, and manual code lookup, alongside a GSAP-animated speedometer tracking scanning speed against retail SLA benchmarks. I implemented dialogue scenarios with seven virtual customer personas, educational modules with cheat sheets, sound effects, and a competitive leaderboard mode. I also integrated custom event tracking with Yandex Metrica based on the project’s analytics specification.',
    },
  },

  // KLASSNYE SBORY
  {
    slug: 'klassnie-sbory',
    year: 2026,
    client: {
      ru: 'Чижик / food.ru (веб-студия Ninelines)',
      en: 'Chizhik / food.ru (Ninelines web-studio)',
    },
    type: { ru: 'промо «снова в школу»', en: 'back-to-school promo' },
    url: 'https://klassnie-sbory.food.ru/',
    site: 'klassnie-sbory.food.ru',
    categories: ['promo'],
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/klassnie-sbory.webm',
      mp4: '/assets/video/klassnie-sbory.mp4',
    },
    tags: ['Nuxt', 'GSAP', 'promo', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд промокампании «снова в школу» на Nuxt 4: интерактивную веб-игру с адаптивной сеткой мыльных пузырей, анимацией взрыва частиц и таймером перерождения, а также анимированную на GSAP призовую рулетку с начислением «класс-коинов». Реализовал личный кабинет участника с балансом бонусов, интеграцию со сценариями мобильного приложения доставки «Чижика» (раздел «Надо успеть»), страницы правил акции и публикацию победителей розыгрышей. Также настроил передачу пользовательских событий в Яндекс Метрику в соответствии с аналитической схемой проекта.',
      en: 'At Nine Lines, I developed the frontend for this back-to-school promotional campaign built with Nuxt 4: an interactive bubble-popping game with a responsive grid layout, burst particle animations, and dynamic bubble regrowth, alongside a GSAP-animated prize roulette awarding bonus "class-coins". I implemented the participant dashboard with authentication and coin tracking, integration with Chizhik delivery app promo mechanics, campaign rules pages, and the raffle winners showcase. I also integrated custom event tracking with Yandex Metrica based on the project’s analytics specification.',
    },
  },

  // SL SOFT
  {
    slug: 'sl-soft',
    year: 2025,
    client: {
      ru: 'Praxis (веб-студия Ninelines)',
      en: 'Praxis (Ninelines web-studio)',
    },
    type: { ru: 'корпоративный сайт', en: 'corporate site' },
    url: 'https://slsoft.ru/',
    site: 'slsoft.ru',
    categories: ['corporate'],
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/sl-soft.webm',
      mp4: '/assets/video/sl-soft.mp4',
    },
    tags: ['GSAP', 'Webpack', 'SCSS', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд корпоративного сайта разработчика российских бизнес-приложений SL Soft: плавный скролл на GSAP ScrollSmoother, анимацию загрузки с фирменным SVG-прелоадером и интерактивное мега-меню с видеопревью продуктов. Реализовал модальные окна и формы обратной связи с клиентской валидацией и интеграцией Yandex SmartCaptcha, а также адаптивную вёрстку для всех устройств. Также настроил передачу пользовательских событий в Яндекс Метрику в соответствии с аналитической схемой проекта.',
      en: 'At Nine Lines, I developed the frontend for the SL Soft corporate website, a major Russian enterprise software vendor: smooth scrolling powered by GSAP ScrollSmoother, entrance animations with a custom SVG brand preloader, and an interactive mega-menu featuring video product previews. I implemented modal dialogs and contact forms with client-side validation and Yandex SmartCaptcha integration, alongside fully responsive layouts across devices. I also integrated custom event tracking with Yandex Metrica based on the project’s analytics specification.',
    },
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
    video: {
      webm: '/assets/video/etalon-group.webm',
      mp4: '/assets/video/etalon-group.mp4',
    },
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
    video: {
      webm: '/assets/video/career-nornickel.webm',
      mp4: '/assets/video/career-nornickel.mp4',
    },
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
    video: {
      webm: '/assets/video/astra-drive.webm',
      mp4: '/assets/video/astra-drive.mp4',
    },
    tags: ['brand', 'GSAP', 'JavaScript'],
    description: { ru: TODO_RU, en: TODO_EN },
  },

  // KRYLATSKAYA 33
  {
    slug: 'krylatskaya33',
    year: 2026,
    client: { ru: 'РБК', en: 'RBC' },
    type: { ru: 'спецпроект о недвижимости', en: 'real estate campaign' },
    url: 'https://krylatskaya33.rbc.ru/',
    site: 'krylatskaya33.rbc.ru',
    categories: ['promo'],
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/krylatskaya33.webm',
      mp4: '/assets/video/krylatskaya33.mp4',
    },
    tags: [],
    description: { ru: TODO_RU, en: TODO_EN },
  },

  // TASS RZHD BAM
  {
    slug: 'tass-rzhd-bam',
    year: 2024,
    client: { ru: 'ТАСС × РЖД', en: 'TASS × Russian Railways' },
    type: { ru: 'спецпроект «БАМ 50 лет»', en: 'BAM 50th anniversary campaign' },
    url: 'https://tass-rzhd-bam.linestest.com/',
    site: 'tass-rzhd-bam.linestest.com',
    categories: [],
    note: {
      ru: 'ссылка ведёт на тестовый стенд',
      en: 'link points to staging environment',
    },
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/tass-rzhd-bam.webm',
      mp4: '/assets/video/tass-rzhd-bam.mp4',
    },
    tags: [],
    description: { ru: TODO_RU, en: TODO_EN },
  },

  // RBC MOSKVICH
  {
    slug: 'rbc-moskvich',
    year: 2024,
    client: { ru: 'РБК × Москвич', en: 'RBC × Moskvich' },
    type: { ru: 'автомобильный спецпроект', en: 'automotive campaign' },
    url: 'https://rbc-moskvich.linestest.com/',
    site: 'rbc-moskvich.linestest.com',
    categories: ['promo'],
    note: {
      ru: 'ссылка ведёт на тестовый стенд',
      en: 'link points to staging environment',
    },
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/rbc-moskvich.webm',
      mp4: '/assets/video/rbc-moskvich.mp4',
    },
    tags: [],
    description: { ru: TODO_RU, en: TODO_EN },
  },

  // RBC TANK
  {
    slug: 'rbc-tank',
    year: 2023,
    client: { ru: 'РБК × TANK', en: 'RBC × TANK' },
    type: { ru: 'автомобильный спецпроект', en: 'automotive campaign' },
    url: 'https://rbc-tank.linestest.com/',
    site: 'rbc-tank.linestest.com',
    categories: ['promo'],
    note: {
      ru: 'ссылка ведёт на тестовый стенд',
      en: 'link points to staging environment',
    },
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/rbc-tank.webm',
      mp4: '/assets/video/rbc-tank.mp4',
    },
    tags: [],
    description: { ru: TODO_RU, en: TODO_EN },
  },

  // KATTY PRO
  {
    slug: 'katty-pro',
    year: 2025,
    client: { ru: 'Пятёрочка × food.ru', en: 'Pyaterochka × food.ru' },
    type: { ru: 'промоигра', en: 'promotional game' },
    url: 'https://kattypro-box.linestest.com/',
    site: 'kattypro-box.linestest.com',
    categories: ['games', 'promo'],
    note: {
      ru: 'ссылка ведёт на тестовый стенд',
      en: 'link points to staging environment',
    },
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/katty-pro.webm',
      mp4: '/assets/video/katty-pro.mp4',
    },
    tags: [],
    description: { ru: TODO_RU, en: TODO_EN },
  },

  // HALS SUMMER
  {
    slug: 'hals-summer',
    year: 2024,
    client: { ru: 'РБК × Галс', en: 'RBC × Hals' },
    type: { ru: 'спецпроект «Лето в городе»', en: 'Summer in the City campaign' },
    url: 'https://hals-summer.rbc.ru/',
    site: 'hals-summer.rbc.ru',
    categories: ['promo'],
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/hals-summer.webm',
      mp4: '/assets/video/hals-summer.mp4',
    },
    tags: [],
    description: { ru: TODO_RU, en: TODO_EN },
  },

  // DREAMRIVA
  {
    slug: 'dreamriva',
    year: 2026,
    client: { ru: 'РБК × Дрим Рива', en: 'RBC × Dream Riva' },
    type: { ru: 'спецпроект о недвижимости', en: 'real estate campaign' },
    url: 'https://dreamriva.rbc.ru/',
    site: 'dreamriva.rbc.ru',
    categories: ['promo'],
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/dreamriva.webm',
      mp4: '/assets/video/dreamriva.mp4',
    },
    tags: [],
    description: { ru: TODO_RU, en: TODO_EN },
  },
];
