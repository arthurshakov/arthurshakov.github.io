// Избранные проекты. Порядок = featured, НЕ по годам.
// Метаданные: "portfolio projects.md" и уточнения автора.

/** @type {import('../types/portfolio.d.ts').Project[]} */
export const projects = [
  // POWER X TIME
  {
    slug: 'power-x-time',
    year: 2024,
    client: {
      ru: 'ТАСС / Росатом (веб-студия Ninelines)',
      en: 'TASS / Rosatom (Ninelines web-studio)',
    },
    type: { ru: 'интерактивный таймлайн', en: 'interactive timeline' },
    // url: 'https://spec.tass.ru/power-x-time/',
    url: 'https://tass-power-x-time.linestest.com/',
    site: 'tass-power-x-time.linestest.com',
    categories: ['timeline'],
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
      ru: 'В «Девяти линиях» я разработал фронтенд интерактивного спецпроекта: бесшовные переходы между разделами на Barba.js, сложную скролл-анимацию таймлайна на GSAP (ScrollTrigger и ScrollSmoother), а также интерактивные карточки и световые эффекты на Canvas. Реализовал динамическую навигацию по эпохам и событиям, оптимизировал производительность и создал отдельную мобильную версию с жестовым управлением и туториалом.',
      en: 'At Nine Lines, I developed the frontend for this interactive campaign: seamless page transitions powered by Barba.js, complex timeline scroll animations using GSAP (ScrollTrigger and ScrollSmoother), and Canvas-based interactive cards with lighting effects. I implemented dynamic navigation across historical eras and milestones, optimized performance, and delivered a dedicated mobile experience with gesture controls and an onboarding tutorial.',
    },
  },

  // BEST CASHIER
  {
    slug: 'best-cashier',
    year: 2026,
    client: {
      ru: 'X5 / food.ru / Пятёрочка  (веб-студия Ninelines)',
      en: 'X5 / food.ru / Pyaterochka (Ninelines web-studio)',
    },
    type: { ru: 'игра / обучение', en: 'game / training' },
    url: 'https://best-cashier.food.ru/',
    site: 'best-cashier.food.ru',
    categories: ['games', 'education'],
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/best-cashier.webm',
      mp4: '/assets/video/best-cashier.mp4',
    },
    tags: ['Nuxt', 'GSAP', 'game', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд интерактивной игры-тренажёра на Nuxt 4: симулятор кассового узла с движущейся конвейерной лентой, механику сканирования штрихкодов, взвешивания и ручного ввода кодов, а также анимированный на GSAP спидометр скорости обслуживания с контролем нормативов. Реализовал диалоговые сценарии с 7 виртуальными покупателями, образовательные модули с памятками, звуковое сопровождение и соревновательный режим с турнирной таблицей.',
      en: 'At Nine Lines, I developed the frontend for this interactive training game built with Nuxt 4: a checkout counter simulation with a moving conveyor belt, barcode scanning, product weighing, and manual code lookup, alongside a GSAP-animated speedometer tracking scanning speed against retail SLA benchmarks. I implemented dialogue scenarios with seven virtual customer personas, educational modules with cheat sheets, sound effects, and a competitive leaderboard mode.',
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
      ru: 'бренд-сайт / сайт-каталог',
      en: 'brand site / product showcase',
    },
    url: 'https://glass-decor.ru/en/',
    site: 'glass-decor.ru',
    categories: ['awwwards', 'catalogue', 'brand'],
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

  // VMESTE AI
  {
    slug: 'vmeste-ai',
    year: 2026,
    client: {
      ru: 'ТАСС / Фонд Потанина (веб-студия Ninelines)',
      en: 'TASS / Potanin Foundation (Ninelines web-studio)',
    },
    type: { ru: 'цикл видеолекций', en: 'video-lecture series' },
    url: 'https://tass.ru/specialprojects/vmeste-ai',
    site: 'tass.ru/specialprojects/vmeste-ai',
    categories: ['video'],
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/vmeste-ai.webm',
      mp4: '/assets/video/vmeste-ai.mp4',
    },
    tags: ['video.js', 'Barba.js', 'Swiper', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд мультимедийного спецпроекта: бесшовные PJAX-переходы между разделами на Barba.js, интерактивный плеер на video.js со стримингом HLS (.m3u8) и кликабельными тайм-кодами, а также синхронизированные Swiper-слайдеры с фоновыми видеолупами. Реализовал эффекты матового стекла на SVG-фильтрах шума, кастомный курсор и отдельный табовый интерфейс для мобильных устройств.',
      en: 'At Nine Lines, I developed the frontend for this multimedia campaign: seamless Barba.js page transitions, an interactive video.js player with HLS streaming (.m3u8) and clickable timecodes, alongside synchronized Swiper sliders with background video loops. I implemented frosted-glass styling using SVG noise filters, a custom cursor, and a dedicated tabbed interface for mobile devices.',
    },
  },

  // CAREER NORNICKEL
  {
    slug: 'career-nornickel',
    year: '2024-2026',
    client: {
      ru: 'Норникель (веб-студия Ninelines)',
      en: 'Nornickel (Ninelines web-studio)',
    },
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
    tags: ['Vue', 'Barba.js', 'SCSS', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд официального карьерного портала «Норникеля»: бесшовные переходы между разделами на Barba.js, интерактивный каталог вакансий на Vue с полнотекстовым поиском, мультифильтрацией и сортировкой, а также интерактивную карту городов присутствия и предприятий на Яндекс Картах. Реализовал детальные страницы вакансий с ключевыми условиями работы, формы отклика и отправки резюме с валидацией и интеграцией Yandex SmartCaptcha, а также адаптивную вёрстку для всех устройств.',
      en: 'At Nine Lines, I developed the frontend for the official Nornickel career portal: seamless page transitions powered by Barba.js, an interactive Vue-based job search catalogue featuring full-text search, multi-criteria filtering, and sorting, alongside an interactive Yandex Maps experience displaying enterprise locations and production sites across Russia. I implemented detailed vacancy pages highlighting role conditions, job application and resume submission forms with client-side validation and Yandex SmartCaptcha integration, and fully responsive layouts across all devices.',
    },
  },

  // KRYLATSKAYA 33
  {
    slug: 'krylatskaya33',
    year: 2026,
    client: {
      ru: 'РБК / ЖК Крылатская33  (веб-студия Ninelines)',
      en: 'RBC / RC Krylatskaya 33  (Ninelines web-studio)',
    },
    type: { ru: 'спецпроект о недвижимости', en: 'real estate campaign' },
    url: 'https://krylatskaya33.rbc.ru/',
    site: 'krylatskaya33.rbc.ru',
    categories: ['promo', 'real-estate'],
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/krylatskaya33.webm',
      mp4: '/assets/video/krylatskaya33.mp4',
    },
    tags: ['Nuxt', 'GSAP', 'Lenis', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд спецпроекта РБК о недвижимости «Крылатская от А до Я» на Nuxt: сплит-скрин лейаут с маской открытия, плавный скролл на Lenis, типографический прелоадер и скролл-анимации на GSAP (ScrollTrigger). Реализовал интерактивный алфавитный гид с динамической сменой разделов, синхронизированную со скроллом медиа-карусель рендеров комплекса, детальные модальные карточки статей с алфавитной навигацией, а также адаптивную вёрстку для всех устройств.',
      en: 'At Nine Lines, I developed the frontend for the RBC real estate campaign "Krylatskaya from A to Z" built with Nuxt: a split-screen layout with an animated reveal mask, smooth scrolling powered by Lenis, an animated typographic preloader, and scroll-driven interactions using GSAP (ScrollTrigger). I implemented an interactive alphabet guide with dynamic section tracking, a scroll-synchronized media carousel showcasing architectural renderings, full-detail modal article cards with rapid alphabet navigation, and fully responsive layouts across all devices.',
    },
  },

  // KLASSNYE SBORY
  {
    slug: 'klassnie-sbory',
    year: 2026,
    client: {
      ru: 'food.ru / Чижик (веб-студия Ninelines)',
      en: 'food.ru / Chizhik (Ninelines web-studio)',
    },
    type: { ru: 'промо / игра', en: 'promo / game' },
    url: 'https://klassnie-sbory.food.ru/',
    site: 'klassnie-sbory.food.ru',
    categories: ['promo', 'games'],
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/klassnie-sbory.webm',
      mp4: '/assets/video/klassnie-sbory.mp4',
    },
    tags: ['Nuxt', 'GSAP', 'promo', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд промокампании «снова в школу» на Nuxt 4: интерактивную веб-игру с адаптивной сеткой мыльных пузырей, анимацией взрыва частиц и таймером перерождения, а также анимированную на GSAP призовую рулетку с начислением «класс-коинов». Реализовал личный кабинет участника с балансом бонусов, интеграцию со сценариями мобильного приложения доставки «Чижика» (раздел «Надо успеть»), страницы правил акции и публикацию победителей розыгрышей.',
      en: 'At Nine Lines, I developed the frontend for this back-to-school promotional campaign built with Nuxt 4: an interactive bubble-popping game with a responsive grid layout, burst particle animations, and dynamic bubble regrowth, alongside a GSAP-animated prize roulette awarding bonus "class-coins". I implemented the participant dashboard with authentication and coin tracking, integration with Chizhik delivery app promo mechanics, campaign rules pages, and the raffle winners showcase.',
    },
  },

  // ASTRA DRIVE
  {
    slug: 'astra-drive',
    year: 2025,
    client: {
      ru: 'Astrawireless (веб-студия Ninelines)',
      en: 'Astrawireless (Ninelines web-studio)',
    },
    type: { ru: 'бренд-сайт / сайт-каталог', en: 'brand site / product showcase' },
    url: 'https://astradrive.net/',
    site: 'astradrive.net',
    categories: ['brand', 'catalogue'],
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/astra-drive.webm',
      mp4: '/assets/video/astra-drive.mp4',
    },
    tags: ['GSAP', 'Barba.js', 'Swiper', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд бренд-сайта беспроводных телекоммуникационных решений Astra Drive: бесшовные переходы между разделами на Barba.js, интерактивные табы отраслевых решений (Mining, Trains, Maritime) с динамической сменой контента и HLS-видеолупами (.m3u8), а также скролл-анимации на GSAP. Реализовал Swiper-слайдеры преимуществ оборудования, выдвижное меню, модальную форму обратной связи с клиентской валидацией, а также адаптивную вёрстку для всех устройств.',
      en: 'At Nine Lines, I developed the frontend for the Astra Drive wireless telecommunications brand website: seamless page transitions powered by Barba.js, interactive industry solution tabs (Mining, Trains, Maritime) with synchronized HLS video streaming (.m3u8), and scroll-driven animations using GSAP. I implemented Swiper sliders showcasing hardware capabilities, an off-canvas navigation menu, a modal contact form with client-side validation, and fully responsive layouts across all devices.',
    },
  },

  // HILL8
  {
    slug: 'hill8',
    year: 2018,
    client: {
      ru: 'ЖК Hill8 (веб-студия Whitemark)',
      en: 'RC Hill8 (Whitemark web-studio)',
    },
    type: { ru: 'сайт апартаментов · выборщик', en: 'residential showcase · selector' },
    url: 'http://hill8.whitemark-it.com/',
    site: 'hill8.whitemark-it.com',
    categories: ['awwwards', 'real-estate'],
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

  // RBC TANK
  {
    slug: 'rbc-tank',
    year: 2023,
    client: {
      ru: 'РБК / TANK (веб-студия Ninelines)',
      en: 'RBC / TANK (Ninelines web-studio)',
    },
    type: { ru: 'автомобильный спецпроект', en: 'automotive campaign' },
    url: 'https://rbc-tank.linestest.com/',
    site: 'rbc-tank.linestest.com',
    categories: ['promo', 'auto'],
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
    tags: ['GSAP', 'Three.js', 'Canvas', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд автомобильного спецпроекта РБК о внедорожнике TANK 300 City: плавный скролл на GSAP ScrollSmoother, интерактивный первый экран с раскрывающейся шторкой и фоновые визуальные эффекты на Three.js и Canvas. Реализовал скролл-анимации на ScrollTrigger с фиксацией секций, цитаты экспертов и фотогалереи автомобиля, полноэкранное навигационное меню, а также адаптивную вёрстку для всех устройств.',
      en: 'At Nine Lines, I developed the frontend for this RBC automotive special project featuring the TANK 300 City SUV: smooth scrolling powered by GSAP ScrollSmoother, an interactive hero section with an animated reveal curtain, and Three.js/Canvas-driven background wave visuals. I implemented ScrollTrigger-based scroll animations with pinned sections, expert editorial reviews, vehicle photo galleries, an off-canvas navigation overlay, and fully responsive layouts across all devices.',
    },
  },

  // SL SOFT
  {
    slug: 'sl-soft',
    year: '2024-2026',
    client: {
      ru: 'Praxis (веб-студия Ninelines)',
      en: 'Praxis (Ninelines web-studio)',
    },
    type: { ru: 'корпоративный сайт', en: 'corporate site' },
    url: 'https://slsoft.ru/',
    site: 'slsoft.ru',
    categories: ['corporate', 'brand', 'catalogue'],
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/sl-soft.webm',
      mp4: '/assets/video/sl-soft.mp4',
    },
    tags: ['GSAP', 'Webpack', 'SCSS', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд корпоративного сайта разработчика российских бизнес-приложений SL Soft: плавный скролл на GSAP ScrollSmoother, анимацию загрузки с фирменным SVG-прелоадером и интерактивное мега-меню с видеопревью продуктов. Реализовал модальные окна и формы обратной связи с клиентской валидацией и интеграцией Yandex SmartCaptcha, а также адаптивную вёрстку для всех устройств.',
      en: 'At Nine Lines, I developed the frontend for the SL Soft corporate website, a major Russian enterprise software vendor: smooth scrolling powered by GSAP ScrollSmoother, entrance animations with a custom SVG brand preloader, and an interactive mega-menu featuring video product previews. I implemented modal dialogs and contact forms with client-side validation and Yandex SmartCaptcha integration, alongside fully responsive layouts across devices.',
    },
  },

  // KATTY PRO
  {
    slug: 'katty-pro',
    year: 2025,
    client: {
      ru: 'food.ru / KATTY PRO (веб-студия Ninelines)',
      en: 'food.ru / KATTY PRO (Ninelines web-studio)',
    },
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
    tags: ['Vue', 'GSAP', 'Vite', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд мобильной промоигры «Мур-комбо для котиков!» для «Пятёрочки» и food.ru на Vue 3: интерактивную механику подбора персонального бокса под характер питомца и микроанимации элементов на GSAP. Реализовал сценарии выбора рациона и повадок котика, динамическую распаковку призового бокса, генерацию карточки результата для шеринга, а также оптимизированную под мобильные экраны адаптивную вёрстку.',
      en: 'At Nine Lines, I developed the frontend for the "Purr-Combo for Cats" mobile promotional game for Pyaterochka and food.ru built with Vue 3: interactive pet personality quiz mechanics, and GSAP-driven micro-animations. I implemented diet and behavior selection steps, an animated prize box unboxing flow, shareable result card generation, and high-performance mobile-first responsive layouts.',
    },
  },

  // ETALON GROUP
  {
    slug: 'etalon-group',
    year: '2025-2026',
    client: {
      ru: 'Praxis (веб-студия Ninelines)',
      en: 'Praxis (Ninelines web-studio)',
    },
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
    tags: ['GSAP', 'Webpack', 'SCSS', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд корпоративного портала девелопера «Эталон» и раздела презентаций для инвесторов: интерактивную систему фильтрации отчётов по годам и типам, карточки документов с отображением форматов и размеров файлов, а также динамическую пагинацию. Реализовал полноэкранное навигационное меню с биржевыми котировками, модальные окна для просмотра видеопрезентаций, формы обратной связи с валидацией и адаптивную вёрстку для всех устройств.',
      en: 'At Nine Lines, I developed the frontend for the Etalon Group corporate portal and its investor presentations hub: an interactive document filtering system categorized by period and report type, downloadable document cards displaying file metadata, and dynamic pagination. I implemented a full-screen navigation overlay displaying live stock quotes, modal dialogs for video presentations, validated contact forms, and fully responsive layouts across all devices.',
    },
  },

  // TASS RZHD BAM
  {
    slug: 'tass-rzhd-bam',
    year: 2024,
    client: {
      ru: 'ТАСС / РЖД (веб-студия Ninelines)',
      en: 'TASS / Russian Railways (Ninelines web-studio)',
    },
    type: { ru: 'интерактивный таймлайн', en: 'interactive timeline' },
    url: 'https://tass-rzhd-bam.linestest.com/',
    site: 'tass-rzhd-bam.linestest.com',
    categories: ['promo', 'timeline'],
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
    tags: ['GSAP', 'Barba.js', 'SCSS', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд мультимедийного спецпроекта к 50-летию БАМа: бесшовные PJAX-переходы на Barba.js, интерактивный исторический таймлайн со сквозной анимацией поезда на GSAP и видеоэлементами вдоль скролла, интерактивный кастомный курсор, а также адаптивную вёрстку для всех устройств.',
      en: 'At Nine Lines, I developed the frontend for this BAM 50th anniversary multimedia campaign: seamless Barba.js PJAX page transitions, an interactive historical timeline featuring a continuous GSAP train animation and in-scroll video elements, a custom interactive cursor, and fully responsive layouts across all devices.',
    },
  },

  // DREAMRIVA
  {
    slug: 'dreamriva',
    year: 2026,
    client: {
      ru: 'РБК / ЖК Дрим Рива (веб-студия Ninelines)',
      en: 'RBC / RC Dream Riva (Ninelines web-studio)',
    },
    type: { ru: 'спецпроект о недвижимости', en: 'real estate campaign' },
    url: 'https://dreamriva.rbc.ru/',
    site: 'dreamriva.rbc.ru',
    categories: ['promo', 'real-estate'],
    star: false,
    awwwards: null,
    video: {
      webm: '/assets/video/dreamriva.webm',
      mp4: '/assets/video/dreamriva.mp4',
    },
    tags: ['GSAP', 'Barba.js', 'SCSS', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд спецпроекта РБК о прибрежном квартале «Дрим Рива»: интерактивный сторителлинг с выбором персонажей-резидентов и скролл-анимации на GSAP (ScrollTrigger и ScrollSmoother). Реализовал полноэкранные сцены с курортной инфраструктурой и яхтенной мариной, фиксированные фоновые медиа-блоки, адаптивное навигационное меню, а также вёрстку для всех устройств.',
      en: 'At Nine Lines, I developed the frontend for the RBC special project showcasing the Dream Riva waterfront residential district: interactive resident storytelling with character selection and smooth scroll animations powered by GSAP (ScrollTrigger and ScrollSmoother). I implemented full-screen scenes exploring resort-level amenities and the private yacht marina, fixed background visual stages, an off-canvas navigation menu, and fully responsive layouts across all devices.',
    },
  },

  // RBC MOSKVICH
  {
    slug: 'rbc-moskvich',
    year: 2024,
    client: {
      ru: 'РБК / Москвич (веб-студия Ninelines)',
      en: 'RBC / Moskvich (Ninelines web-studio)',
    },
    type: { ru: 'автомобильный спецпроект', en: 'automotive campaign' },
    url: 'https://rbc-moskvich.linestest.com/',
    site: 'rbc-moskvich.linestest.com',
    categories: ['promo', 'auto'],
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
    tags: ['GSAP', 'Webpack', 'SCSS', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд автомобильного спецпроекта РБК и бренда «Москвич»: плавный скролл на GSAP ScrollSmoother, интерактивное меню-навигатор по мифам об автомобилях и кинематографичную анимацию карточек на ScrollTrigger. Реализовал интерактивные сплит-блоки «миф / реальность» с техническими характеристиками моделей Москвич 3, 3е и Москвич 6, модальные окна о команде проекта, а также адаптивную вёрстку для всех устройств.',
      en: 'At Nine Lines, I developed the frontend for this RBC and Moskvich automotive campaign: smooth scrolling powered by GSAP ScrollSmoother, an interactive sticky navigation menu browsing through common automotive myths, and cinematic card animations via ScrollTrigger. I implemented interactive "myth vs reality" split-screens detailing technical specs for the Moskvich 3, 3e, and Moskvich 6 models, project team modals, and fully responsive layouts across all devices.',
    },
  },

  // HALS SUMMER
  {
    slug: 'hals-summer',
    year: 2024,
    client: {
      ru: 'РБК / Галс (веб-студия Ninelines)',
      en: 'RBC / Hals (Ninelines web-studio)',
    },
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
    tags: ['GSAP', 'Barba.js', 'SCSS', 'JavaScript'],
    description: {
      ru: 'В «Девяти линиях» я разработал фронтенд спецпроекта РБК и девелопера «Галс» «Лето в городе»: плавный скролл на GSAP ScrollSmoother, бесшовные переходы между разделами на Barba.js и интерактивную иллюстрированную карту Москвы со скролл-анимацией пинов на ScrollTrigger. Реализовал динамическую смену карточек маршрутов при прокрутке карты, карусель летних сценариев отдыха, модальные окна с описанием премиальных жилых кварталов, а также адаптивную вёрстку для всех устройств.',
      en: 'At Nine Lines, I developed the frontend for the RBC and Hals-Development "Summer in the City" special project: smooth scrolling powered by GSAP ScrollSmoother, seamless Barba.js page transitions, and an interactive illustrated map of Moscow with ScrollTrigger-animated location pins. I implemented synchronized route card switching during map progression, a summer activity carousel, modal dialogs detailing premium residential districts, and fully responsive layouts across all devices.',
    },
  },
];
