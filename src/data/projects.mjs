// Избранные проекты. Порядок = featured, НЕ по годам.
// Метаданные: "portfolio projects.md" и уточнения автора.

/** @type {import('../types/portfolio.d.ts').Project[]} */
export const projects = [
  // POWER X TIME
  {
    slug: 'power-x-time',
    year: 2024,
    client: {
      ru: 'ТАСС / Росатом (веб‑студия Ninelines)',
      en: 'TASS / Rosatom (Ninelines web‑studio)',
    },
    type: { ru: 'интерактивный таймлайн', en: 'interactive timeline' },
    // url: 'https://spec.tass.ru/power-x-time/',
    url: 'https://tass-power-x-time.linestest.com/',
    site: 'tass-power-x-time.linestest.com',
    categories: ['timeline'],
    note: {
      ru: 'кампания завершена · боевой сайт отключён · ссылка ведёт на\u00A0тестовый стенд',
      en: 'campaign ended · live site offline · link points to\u00A0staging environment',
    },
    star: false,
    video: {
      webm: '/assets/video/tass-power-x-time.webm',
      mp4: '/assets/video/tass-power-x-time.mp4',
    },
    tags: ['GSAP', 'Barba.js', 'Canvas'],
    description: {
      ru: 'В\u00A0«Девяти\u00A0линиях» я\u00A0разработал фронтенд интерактивного спецпроекта: бесшовные переходы между разделами на\u00A0Barba.js, сложную скролл‑анимацию таймлайна на\u00A0GSAP (ScrollTrigger и\u00A0ScrollSmoother), а\u00A0также интерактивные карточки и\u00A0световые эффекты на\u00A0Canvas. Реализовал динамическую навигацию по\u00A0эпохам и\u00A0событиям, оптимизировал производительность и\u00A0создал отдельную мобильную версию с\u00A0жестовым управлением и\u00A0туториалом.',
      en: 'At\u00A0Nine\u00A0Lines, I\u00A0developed the\u00A0frontend for\u00A0this interactive campaign: seamless page transitions powered by\u00A0Barba.js, complex timeline scroll animations using\u00A0GSAP (ScrollTrigger and\u00A0ScrollSmoother), and\u00A0Canvas-based interactive cards with lighting effects. I\u00A0implemented dynamic navigation across historical eras and milestones, optimized performance, and\u00A0delivered a\u00A0dedicated mobile experience with gesture controls and\u00A0an\u00A0onboarding tutorial.',
    },
  },

  // BEST CASHIER
  {
    slug: 'best-cashier',
    year: 2026,
    client: {
      ru: 'X5 / food.ru / «Пятёрочка» (веб‑студия Ninelines)',
      en: 'X5 / food.ru / Pyaterochka (Ninelines web‑studio)',
    },
    type: { ru: 'игра / обучение', en: 'game / training' },
    url: 'https://best-cashier.food.ru/',
    site: 'best-cashier.food.ru',
    categories: ['games', 'education'],
    star: false,
    video: {
      webm: '/assets/video/best-cashier.webm',
      mp4: '/assets/video/best-cashier.mp4',
    },
    tags: ['Nuxt', 'GSAP'],
    description: {
      ru: 'В\u00A0«Девяти\u00A0линиях» я\u00A0разработал фронтенд интерактивной игры‑тренажёра на\u00A0Nuxt\u00A04: симулятор кассового узла с\u00A0движущейся конвейерной лентой, механику сканирования штрихкодов, взвешивания и\u00A0ручного ввода кодов, а\u00A0также анимированный на\u00A0GSAP спидометр скорости обслуживания с\u00A0контролем нормативов. Реализовал диалоговые сценарии с\u00A07\u00A0виртуальными покупателями, образовательные модули с\u00A0памятками, звуковое сопровождение и\u00A0соревновательный режим с\u00A0турнирной таблицей.',
      en: 'At\u00A0Nine\u00A0Lines, I\u00A0developed the\u00A0frontend for\u00A0this interactive training game built with Nuxt\u00A04: a\u00A0checkout counter simulation with a\u00A0moving conveyor belt, barcode scanning, product weighing, and\u00A0manual code lookup, alongside a\u00A0GSAP-animated speedometer tracking scanning speed against retail SLA\u00A0benchmarks. I\u00A0implemented dialogue scenarios with seven virtual customer personas, educational modules with cheat sheets, sound effects, and\u00A0a\u00A0competitive leaderboard mode.',
    },
  },

  // GLASS DECOR
  {
    slug: 'glass-decor',
    year: 2019,
    client: {
      ru: 'Glass Decor (веб‑студия Whitemark)',
      en: 'Glass Decor (Whitemark web‑studio)',
    },
    type: {
      ru: 'бренд‑сайт / сайт‑каталог',
      en: 'brand site / product showcase',
    },
    url: 'https://glass-decor.ru/en/',
    site: 'glass-decor.ru',
    categories: ['awwwards', 'catalogue', 'brand'],
    star: true,
    awards: [
      {
        ru: 'Awwwards\u00A0— Honorable Mention + Mobile Excellence',
        en: 'Awwwards\u00A0— Honorable Mention + Mobile Excellence',
        url: 'https://www.awwwards.com/sites/glass-decor',
      },

      {
        ru: 'CSS Design Awards\u00A0— Special Kudos',
        en: 'CSS Design Awards\u00A0— Special Kudos',
        url: 'https://www.cssdesignawards.com/sites/glass-decor/37869/',
      },
    ],
    video: {
      webm: '/assets/video/glass-decor.webm',
      mp4: '/assets/video/glass-decor.mp4',
    },
    tags: ['GSAP', 'Vue', 'THREE.js', 'Bitrix CMS'],
    description: {
      ru: 'В\u00A0Whitemark я\u00A0полностью разработал фронтенд: анимации и\u00A0переходы на\u00A0GSAP, THREE.js, а\u00A0также каталог на\u00A0Vue, связанный с\u00A0административной панелью Bitrix\u00A0CMS. Также интегрировал адаптивную вёрстку в\u00A0Bitrix\u00A0CMS и\u00A0подготовил отдельные мобильную и\u00A0двуязычную\u00A0— русскую и\u00A0английскую\u00A0— версии сайта.',
      en: 'At\u00A0Whitemark, I\u00A0built the\u00A0frontend: immersive Three.js scenes, GSAP and\u00A0THREE.js-led animations and\u00A0transitions, and\u00A0a\u00A0Vue-based catalogue connected to\u00A0the\u00A0Bitrix\u00A0CMS admin panel. I\u00A0also integrated the\u00A0responsive layouts into Bitrix\u00A0CMS and\u00A0delivered dedicated mobile and\u00A0bilingual English/Russian versions.',
    },
  },

  // VMESTE AI
  {
    slug: 'vmeste-ai',
    year: 2026,
    client: {
      ru: 'ТАСС / Фонд Потанина (веб‑студия Ninelines)',
      en: 'TASS / Potanin Foundation (Ninelines web‑studio)',
    },
    type: { ru: 'цикл видеолекций', en: 'video‑lecture series' },
    url: 'https://tass.ru/specialprojects/vmeste-ai',
    site: 'tass.ru/specialprojects/vmeste-ai',
    categories: ['video'],
    star: false,
    video: {
      webm: '/assets/video/vmeste-ai.webm',
      mp4: '/assets/video/vmeste-ai.mp4',
    },
    tags: ['GSAP', 'video.js', 'Barba.js', 'Swiper'],
    description: {
      ru: 'В\u00A0«Девяти\u00A0линиях» я\u00A0разработал фронтенд мультимедийного спецпроекта: бесшовные PJAX‑переходы между разделами на\u00A0Barba.js, интерактивный плеер на\u00A0video.js со\u00A0стримингом HLS (.m3u8) и\u00A0кликабельными тайм‑кодами, а\u00A0также синхронизированные Swiper‑слайдеры с\u00A0фоновыми видеолупами. Реализовал эффекты матового стекла на\u00A0SVG‑фильтрах шума, кастомный курсор и\u00A0отдельный табовый интерфейс для\u00A0мобильных устройств.',
      en: 'At\u00A0Nine\u00A0Lines, I\u00A0developed the\u00A0frontend for\u00A0this multimedia campaign: seamless Barba.js page transitions, an\u00A0interactive video.js player with HLS\u00A0streaming (.m3u8) and\u00A0clickable timecodes, alongside synchronized Swiper sliders with background video loops. I\u00A0implemented frosted-glass styling using SVG noise filters, a\u00A0custom cursor, and\u00A0a\u00A0dedicated tabbed interface for\u00A0mobile devices.',
    },
  },

  // CAREER NORNICKEL
  {
    slug: 'career-nornickel',
    year: '2024–2026',
    client: {
      ru: 'Норникель (веб‑студия Ninelines)',
      en: 'Nornickel (Ninelines web‑studio)',
    },
    type: { ru: 'карьерный сайт', en: 'careers site' },
    url: 'https://career.nornickel.ru/',
    site: 'career.nornickel.ru',
    categories: ['corporate'],
    star: false,
    video: {
      webm: '/assets/video/career-nornickel.webm',
      mp4: '/assets/video/career-nornickel.mp4',
    },
    tags: ['GSAP', 'Vue', 'Barba.js'],
    description: {
      ru: 'В\u00A0«Девяти\u00A0линиях» я\u00A0разработал фронтенд официального карьерного портала «Норникеля»: бесшовные переходы между разделами на\u00A0Barba.js, интерактивный каталог вакансий на\u00A0Vue с\u00A0полнотекстовым поиском, мультифильтрацией и\u00A0сортировкой, а\u00A0также интерактивную карту городов присутствия и\u00A0предприятий на\u00A0Яндекс Картах. Реализовал детальные страницы вакансий с\u00A0ключевыми условиями работы, формы отклика и\u00A0отправки резюме с\u00A0валидацией и\u00A0интеграцией Yandex SmartCaptcha, а\u00A0также адаптивную вёрстку для\u00A0всех устройств.',
      en: 'At\u00A0Nine\u00A0Lines, I\u00A0developed the\u00A0frontend for\u00A0the\u00A0official Nornickel career portal: seamless page transitions powered by\u00A0Barba.js, an\u00A0interactive Vue-based job search catalogue featuring full-text search, multi-criteria filtering, and\u00A0sorting, alongside an\u00A0interactive Yandex Maps experience displaying enterprise locations and\u00A0production sites across Russia. I\u00A0implemented detailed vacancy pages highlighting role conditions, job application and resume submission forms with client-side validation and\u00A0Yandex SmartCaptcha integration, and\u00A0fully responsive layouts across all\u00A0devices.',
    },
  },

  // KRYLATSKAYA 33
  {
    slug: 'krylatskaya33',
    year: 2026,
    client: {
      ru: 'РБК / ЖК «Крылатская33» (веб‑студия Ninelines)',
      en: 'RBC / RC Krylatskaya\u00A033 (Ninelines web‑studio)',
    },
    type: { ru: 'спецпроект о\u00A0недвижимости', en: 'real estate campaign' },
    url: 'https://krylatskaya33.rbc.ru/',
    site: 'krylatskaya33.rbc.ru',
    categories: ['promo', 'real-estate'],
    star: false,
    video: {
      webm: '/assets/video/krylatskaya33.webm',
      mp4: '/assets/video/krylatskaya33.mp4',
    },
    tags: ['Nuxt', 'GSAP', 'Lenis'],
    description: {
      ru: 'В\u00A0«Девяти\u00A0линиях» я\u00A0разработал фронтенд спецпроекта РБК о\u00A0недвижимости «Крылатская от\u00A0А\u00A0до\u00A0Я» на\u00A0Nuxt\u00A04: сплит‑скрин лейаут с\u00A0маской открытия, плавный скролл на\u00A0Lenis, типографический прелоадер и\u00A0скролл‑анимации на\u00A0GSAP (ScrollTrigger). Реализовал интерактивный алфавитный гид с\u00A0динамической сменой разделов, синхронизированную со\u00A0скроллом медиакарусель рендеров комплекса, детальные модальные карточки статей с\u00A0алфавитной навигацией, а\u00A0также адаптивную вёрстку для\u00A0всех устройств.',
      en: 'At\u00A0Nine\u00A0Lines, I\u00A0developed the\u00A0frontend for\u00A0the\u00A0RBC real estate campaign “Krylatskaya from\u00A0A\u00A0to\u00A0Z” built with Nuxt\u00A04: a\u00A0split-screen layout with an\u00A0animated reveal mask, smooth scrolling powered by\u00A0Lenis, an\u00A0animated typographic preloader, and\u00A0scroll-driven interactions using GSAP (ScrollTrigger). I\u00A0implemented an\u00A0interactive alphabet guide with dynamic section tracking, a\u00A0scroll-synchronized media carousel showcasing architectural renderings, full-detail modal article cards with rapid alphabet navigation, and\u00A0fully responsive layouts across all\u00A0devices.',
    },
  },

  // KLASSNYE SBORY
  {
    slug: 'klassnie-sbory',
    year: 2026,
    client: {
      ru: 'food.ru / «Чижик» (веб‑студия Ninelines)',
      en: 'food.ru / Chizhik (Ninelines web‑studio)',
    },
    type: { ru: 'промо / игра', en: 'promo / game' },
    url: 'https://klassnie-sbory.food.ru/',
    site: 'klassnie-sbory.food.ru',
    categories: ['promo', 'games'],
    star: false,
    video: {
      webm: '/assets/video/klassnie-sbory.webm',
      mp4: '/assets/video/klassnie-sbory.mp4',
    },
    tags: ['Nuxt', 'GSAP'],
    description: {
      ru: 'В\u00A0«Девяти\u00A0линиях» я\u00A0разработал фронтенд промокампании «снова в\u00A0школу» на\u00A0Nuxt\u00A04: интерактивную веб‑игру с\u00A0адаптивной сеткой мыльных пузырей, анимацией взрыва частиц и\u00A0таймером перерождения, а\u00A0также анимированную на\u00A0GSAP призовую рулетку с\u00A0начислением «класс‑коинов». Реализовал личный кабинет участника с\u00A0балансом бонусов, интеграцию со\u00A0сценариями мобильного приложения доставки «Чижика» (раздел «Надо успеть»), страницы правил акции и\u00A0публикацию победителей розыгрышей.',
      en: 'At\u00A0Nine\u00A0Lines, I\u00A0developed the\u00A0frontend for\u00A0this back-to-school promotional campaign built with\u00A0Nuxt\u00A04: an\u00A0interactive bubble-popping game with a\u00A0responsive grid layout, burst particle animations, and\u00A0dynamic bubble regrowth, alongside a\u00A0GSAP-animated prize roulette awarding bonus “class‑coins”. I\u00A0implemented the\u00A0participant dashboard with authentication and\u00A0coin tracking, integration with Chizhik delivery app promo mechanics, campaign rules pages, and\u00A0the\u00A0raffle winners showcase.',
    },
  },

  // ASTRA DRIVE
  {
    slug: 'astra-drive',
    year: 2025,
    client: {
      ru: 'Astrawireless (веб‑студия Ninelines)',
      en: 'Astrawireless (Ninelines web‑studio)',
    },
    type: { ru: 'бренд‑сайт / сайт‑каталог', en: 'brand site / product showcase' },
    url: 'https://astradrive.net/',
    site: 'astradrive.net',
    categories: ['brand', 'catalogue'],
    star: false,
    video: {
      webm: '/assets/video/astra-drive.webm',
      mp4: '/assets/video/astra-drive.mp4',
    },
    tags: ['GSAP', 'Barba.js', 'Swiper'],
    description: {
      ru: 'В\u00A0«Девяти\u00A0линиях» я\u00A0разработал фронтенд бренд‑сайта беспроводных телекоммуникационных решений Astra\u00A0Drive: бесшовные переходы между разделами на\u00A0Barba.js, интерактивные табы отраслевых решений (Mining, Trains, Maritime) с\u00A0динамической сменой контента и\u00A0HLS‑видеолупами (.m3u8), а\u00A0также скролл‑анимации на\u00A0GSAP. Реализовал Swiper‑слайдеры преимуществ оборудования, выдвижное меню, модальную форму обратной связи с\u00A0клиентской валидацией, а\u00A0также адаптивную вёрстку для\u00A0всех устройств.',
      en: 'At Nine Lines, I\u00A0developed the\u00A0frontend for\u00A0the\u00A0Astra\u00A0Drive wireless telecommunications brand website: seamless page transitions powered by\u00A0Barba.js, interactive industry solution tabs (Mining, Trains, Maritime) with synchronized HLS video streaming (.m3u8), and scroll-driven animations using\u00A0GSAP. I\u00A0implemented Swiper sliders showcasing hardware capabilities, an\u00A0off-canvas navigation menu, a\u00A0modal contact form with client-side validation, and\u00A0fully responsive layouts across all\u00A0devices.',
    },
  },

  // HILL8
  {
    slug: 'hill8',
    year: 2018,
    client: {
      ru: 'ЖК Hill8 (веб‑студия Whitemark)',
      en: 'RC Hill8 (Whitemark web‑studio)',
    },
    type: { ru: 'сайт апартаментов · выборщик', en: 'residential showcase · selector' },
    url: 'http://hill8.whitemark-it.com/',
    site: 'hill8.whitemark-it.com',
    categories: ['awwwards', 'real-estate'],
    star: true,
    note: {
      ru: 'боевой сайт отключён · ссылка ведёт на\u00A0тестовый стенд',
      en: 'live site offline · link points to\u00A0staging environment',
    },
    awards: [
      {
        ru: 'Awwwards\u00A0— Honorable Mention',
        en: 'Awwwards\u00A0— Honorable Mention',
        url: 'https://www.awwwards.com/sites/hill8',
      },
      {
        ru: 'CSS Design Awards\u00A0— Special Kudos',
        en: 'CSS Design Awards\u00A0— Special Kudos',
        url: 'https://www.cssdesignawards.com/sites/hill8/34364/',
      },
    ],
    video: {
      webm: '/assets/video/hill8.webm',
      mp4: '/assets/video/hill8.mp4',
    },
    tags: ['GSAP', 'Vue', 'Bitrix CMS'],
    description: {
      ru: 'В\u00A0Whitemark я\u00A0разработал фронтенд промосайта премиального комплекса апартаментов HILL8: бесшовные кинематографичные переходы между страницами и\u00A0меню на\u00A0GSAP, интерактивный выборщик апартаментов на\u00A0Vue (с\u00A0подбором на\u00A0схеме комплекса, поэтажными планами и\u00A0фильтрацией по\u00A0планировкам), а\u00A0также адаптивную вёрстку с\u00A0интеграцией в\u00A0Bitrix\u00A0CMS. Проект отмечен Awwwards Honorable Mention, CSS Design Awards и\u00A0признан лучшим девелоперским сайтом Европы на\u00A0European Property Awards.',

      en: 'At\u00A0Whitemark, I\u00A0built the\u00A0frontend for\u00A0the\u00A0HILL8 luxury apartment complex: seamless cinematic page and\u00A0menu transitions powered by\u00A0GSAP, an\u00A0interactive Vue-based apartment selector (featuring interactive building schemes, floor plans, and\u00A0layout filtering), and\u00A0responsive layouts integrated into Bitrix\u00A0CMS. The\u00A0project received an\u00A0Awwwards Honorable Mention, a\u00A0CSS Design Awards Special Kudos, and\u00A0won Developer Website Europe at\u00A0the\u00A0European Property Awards.',
    },
  },

  // RBC TANK
  {
    slug: 'rbc-tank',
    year: 2023,
    client: {
      ru: 'РБК / TANK (веб‑студия Ninelines)',
      en: 'RBC / TANK (Ninelines web‑studio)',
    },
    type: { ru: 'автомобильный спецпроект', en: 'automotive campaign' },
    url: 'https://rbc-tank.linestest.com/',
    site: 'rbc-tank.linestest.com',
    categories: ['promo', 'auto'],
    note: {
      ru: 'ссылка ведёт на\u00A0тестовый стенд',
      en: 'link points to\u00A0staging environment',
    },
    star: false,
    video: {
      webm: '/assets/video/rbc-tank.webm',
      mp4: '/assets/video/rbc-tank.mp4',
    },
    tags: ['GSAP', 'Three.js'],
    description: {
      ru: 'В\u00A0«Девяти\u00A0линиях» я\u00A0разработал фронтенд автомобильного спецпроекта РБК о\u00A0внедорожнике TANK\u00A0300 City: плавный скролл на\u00A0GSAP ScrollSmoother, интерактивный первый экран с\u00A0раскрывающейся шторкой и\u00A0фоновые визуальные эффекты на\u00A0Three.js и\u00A0Canvas. Реализовал скролл‑анимации на\u00A0ScrollTrigger, цитаты экспертов и\u00A0фотогалереи автомобиля, а\u00A0также адаптивную вёрстку для\u00A0всех устройств.',
      en: 'At\u00A0Nine\u00A0Lines, I\u00A0developed the\u00A0frontend for\u00A0this RBC automotive special project featuring the\u00A0TANK\u00A0300 City SUV: smooth scrolling powered by\u00A0GSAP ScrollSmoother, an\u00A0interactive hero section with an\u00A0animated reveal curtain, and\u00A0Three.js/Canvas-driven background wave visuals. I\u00A0implemented ScrollTrigger-based scroll animations, expert editorial reviews, vehicle photo galleries, and\u00A0fully responsive layouts across all\u00A0devices.',
    },
  },

  // SL SOFT
  {
    slug: 'sl-soft',
    year: '2024–2026',
    client: {
      ru: 'Praxis (веб‑студия Ninelines)',
      en: 'Praxis (Ninelines web‑studio)',
    },
    type: { ru: 'корпоративный сайт', en: 'corporate site' },
    url: 'https://slsoft.ru/',
    site: 'slsoft.ru',
    categories: ['corporate', 'brand', 'catalogue'],
    star: false,
    video: {
      webm: '/assets/video/sl-soft.webm',
      mp4: '/assets/video/sl-soft.mp4',
    },
    tags: ['GSAP', 'Barba.js'],
    description: {
      ru: 'В\u00A0«Девяти\u00A0линиях» я\u00A0разработал фронтенд корпоративного сайта разработчика российских бизнес‑приложений SL\u00A0Soft: плавный скролл на\u00A0GSAP ScrollSmoother, анимацию загрузки с\u00A0фирменным SVG‑прелоадером и\u00A0интерактивное мега‑меню с\u00A0видеопревью продуктов. Реализовал модальные окна и\u00A0формы обратной связи с\u00A0клиентской валидацией и\u00A0интеграцией Yandex SmartCaptcha, а\u00A0также адаптивную вёрстку для\u00A0всех устройств.',
      en: 'At\u00A0Nine\u00A0Lines, I\u00A0developed the\u00A0frontend for\u00A0the\u00A0SL\u00A0Soft corporate website, a\u00A0major Russian enterprise software vendor: smooth scrolling powered by\u00A0GSAP ScrollSmoother, entrance animations with a\u00A0custom SVG brand preloader, and\u00A0an\u00A0interactive mega‑menu featuring video product previews. I\u00A0implemented modal dialogs and\u00A0contact forms with client-side validation and Yandex SmartCaptcha integration, alongside fully responsive layouts across devices.',
    },
  },

  // KATTY PRO
  {
    slug: 'katty-pro',
    year: 2025,
    client: {
      ru: 'food.ru / KATTY PRO (веб‑студия Ninelines)',
      en: 'food.ru / KATTY PRO (Ninelines web‑studio)',
    },
    type: { ru: 'промоигра', en: 'promotional game' },
    url: 'https://kattypro-box.linestest.com/',
    site: 'kattypro-box.linestest.com',
    categories: ['games', 'promo'],
    note: {
      ru: 'ссылка ведёт на\u00A0тестовый стенд',
      en: 'link points to\u00A0staging environment',
    },
    star: false,
    video: {
      webm: '/assets/video/katty-pro.webm',
      mp4: '/assets/video/katty-pro.mp4',
    },
    tags: ['Vue', 'GSAP'],
    description: {
      ru: 'В\u00A0«Девяти\u00A0линиях» я\u00A0разработал фронтенд мобильной промоигры «Мур‑комбо для\u00A0котиков!» для\u00A0«Пятёрочки» и\u00A0food.ru на\u00A0Vue\u00A03: интерактивную механику подбора персонального бокса под\u00A0характер питомца, микроанимации элементов на\u00A0GSAP, а\u00A0также оптимизированную под\u00A0мобильные экраны адаптивную вёрстку.',
      en: 'At\u00A0Nine\u00A0Lines, I\u00A0developed the\u00A0frontend for\u00A0the\u00A0“Purr‑Combo for\u00A0Cats” mobile promotional game for\u00A0Pyaterochka and\u00A0food.ru built with\u00A0Vue\u00A03: interactive pet personality quiz mechanics, GSAP-driven micro-animations, and\u00A0optimized responsive layouts for\u00A0mobile devices.',
    },
  },

  // ETALON GROUP
  {
    slug: 'etalon-group',
    year: '2025–2026',
    client: {
      ru: 'Etalon Group (веб‑студия Ninelines)',
      en: 'Etalon Group (Ninelines web‑studio)',
    },
    type: { ru: 'девелопер · инвест‑презентации', en: 'developer · investor decks' },
    url: 'https://www.etalongroup.com/',
    site: 'etalongroup.com',
    categories: ['corporate'],
    star: false,
    video: {
      webm: '/assets/video/etalon-group.webm',
      mp4: '/assets/video/etalon-group.mp4',
    },
    tags: ['GSAP', 'Barba.js'],
    description: {
      ru: 'В\u00A0«Девяти\u00A0линиях» я\u00A0разработал фронтенд корпоративного портала девелопера «Эталон» и\u00A0раздела презентаций для\u00A0инвесторов: интерактивную систему фильтрации отчётов по\u00A0годам и\u00A0типам, карточки документов с\u00A0отображением форматов и\u00A0размеров файлов, а\u00A0также динамическую пагинацию. Реализовал полноэкранное навигационное меню с\u00A0биржевыми котировками, модальные окна для\u00A0просмотра видеопрезентаций, формы обратной связи с\u00A0валидацией, версии на\u00A0русском и\u00A0английском языках, а\u00A0также адаптивную вёрстку для\u00A0всех устройств.',
      en: 'At\u00A0Nine\u00A0Lines, I\u00A0developed the\u00A0frontend for\u00A0the\u00A0Etalon\u00A0Group corporate portal and its investor presentations hub: an\u00A0interactive document filtering system categorized by\u00A0period and\u00A0report type, downloadable document cards displaying file metadata, and\u00A0dynamic pagination. I\u00A0implemented a\u00A0full-screen navigation overlay displaying live stock quotes, modal dialogs for\u00A0video presentations, validated contact forms, bilingual English and\u00A0Russian versions, and\u00A0fully responsive layouts across all\u00A0devices.',
    },
  },

  // TASS RZHD BAM
  {
    slug: 'tass-rzhd-bam',
    year: 2024,
    client: {
      ru: 'ТАСС / РЖД (веб‑студия Ninelines)',
      en: 'TASS / Russian Railways (Ninelines web‑studio)',
    },
    type: { ru: 'интерактивный таймлайн', en: 'interactive timeline' },
    url: 'https://tass-rzhd-bam.linestest.com/',
    site: 'tass-rzhd-bam.linestest.com',
    categories: ['promo', 'timeline'],
    note: {
      ru: 'ссылка ведёт на\u00A0тестовый стенд',
      en: 'link points to\u00A0staging environment',
    },
    star: false,
    video: {
      webm: '/assets/video/tass-rzhd-bam.webm',
      mp4: '/assets/video/tass-rzhd-bam.mp4',
    },
    tags: ['GSAP', 'Barba.js'],
    description: {
      ru: 'В\u00A0«Девяти\u00A0линиях» я\u00A0разработал фронтенд мультимедийного спецпроекта к\u00A050‑летию БАМа: бесшовные PJAX‑переходы на\u00A0Barba.js, интерактивный исторический таймлайн со\u00A0сквозной анимацией поезда на\u00A0GSAP и\u00A0видеоэлементами вдоль скролла, интерактивный кастомный курсор, а\u00A0также адаптивную вёрстку для\u00A0всех устройств.',
      en: 'At\u00A0Nine\u00A0Lines, I\u00A0developed the\u00A0frontend for\u00A0this\u00A0BAM 50th\u00A0anniversary multimedia campaign: seamless Barba.js PJAX page transitions, an\u00A0interactive historical timeline featuring a\u00A0continuous GSAP train animation and\u00A0in-scroll video elements, a\u00A0custom interactive cursor, and\u00A0fully responsive layouts across all\u00A0devices.',
    },
  },

  // DREAMRIVA
  {
    slug: 'dreamriva',
    year: 2026,
    client: {
      ru: 'РБК / ЖК «Дрим Рива» (веб‑студия Ninelines)',
      en: 'RBC / RC Dream Riva (Ninelines web‑studio)',
    },
    type: { ru: 'спецпроект о\u00A0недвижимости', en: 'real estate campaign' },
    url: 'https://dreamriva.rbc.ru/',
    site: 'dreamriva.rbc.ru',
    categories: ['promo', 'real-estate'],
    star: false,
    video: {
      webm: '/assets/video/dreamriva.webm',
      mp4: '/assets/video/dreamriva.mp4',
    },
    tags: ['GSAP', 'Barba.js'],
    description: {
      ru: 'В\u00A0«Девяти\u00A0линиях» я\u00A0разработал фронтенд спецпроекта РБК о\u00A0прибрежном квартале «Дрим\u00A0Рива»: интерактивный сторителлинг с\u00A0выбором персонажей‑резидентов и\u00A0скролл‑анимации на\u00A0GSAP (ScrollTrigger и\u00A0ScrollSmoother). Реализовал полноэкранные сцены, знакомящие с\u00A0инфраструктурой курортного уровня и\u00A0яхтенной мариной, фиксированные фоновые медиаблоки, адаптивное навигационное меню, а\u00A0также вёрстку для\u00A0всех устройств.',
      en: 'At\u00A0Nine\u00A0Lines, I\u00A0developed the\u00A0frontend for\u00A0the\u00A0RBC special project showcasing the\u00A0Dream\u00A0Riva waterfront residential district: interactive resident storytelling with character selection and\u00A0smooth scroll animations powered by\u00A0GSAP (ScrollTrigger and\u00A0ScrollSmoother). I\u00A0implemented full-screen scenes exploring resort-level amenities and\u00A0the\u00A0private yacht marina, fixed background visual stages, an\u00A0off-canvas navigation menu, and\u00A0fully responsive layouts across all\u00A0devices.',
    },
  },

  // RBC MOSKVICH
  {
    slug: 'rbc-moskvich',
    year: 2024,
    client: {
      ru: 'РБК / «Москвич» (веб‑студия Ninelines)',
      en: 'RBC / Moskvich (Ninelines web‑studio)',
    },
    type: { ru: 'автомобильный спецпроект', en: 'automotive campaign' },
    url: 'https://rbc-moskvich.linestest.com/',
    site: 'rbc-moskvich.linestest.com',
    categories: ['promo', 'auto'],
    note: {
      ru: 'ссылка ведёт на\u00A0тестовый стенд',
      en: 'link points to\u00A0staging environment',
    },
    star: false,
    video: {
      webm: '/assets/video/rbc-moskvich.webm',
      mp4: '/assets/video/rbc-moskvich.mp4',
    },
    tags: ['GSAP', 'Canvas'],
    description: {
      ru: 'В\u00A0«Девяти\u00A0линиях» я\u00A0разработал фронтенд автомобильного спецпроекта РБК и\u00A0бренда «Москвич»: плавный скролл на\u00A0GSAP ScrollSmoother, интерактивное меню‑навигатор по\u00A0мифам об\u00A0автомобилях и\u00A0анимацию карточек на\u00A0ScrollTrigger. Реализовал интерактивные сплит‑блоки «миф / реальность» с\u00A0техническими характеристиками моделей Москвич\u00A03, 3е и\u00A0Москвич\u00A06, модальные окна о\u00A0команде проекта, а\u00A0также адаптивную вёрстку для\u00A0всех устройств.',
      en: 'At\u00A0Nine\u00A0Lines, I\u00A0developed the\u00A0frontend for\u00A0this RBC and Moskvich automotive campaign: smooth scrolling powered by\u00A0GSAP ScrollSmoother, an\u00A0interactive sticky navigation menu browsing through common automotive myths, and\u00A0card animations via\u00A0ScrollTrigger. I\u00A0implemented interactive “myth vs\u00A0reality” split-screens detailing technical specs for\u00A0the\u00A0Moskvich\u00A03, 3e, and\u00A0Moskvich\u00A06 models, project team modals, and\u00A0fully responsive layouts across all\u00A0devices.',
    },
  },

  // HALS SUMMER
  {
    slug: 'hals-summer',
    year: 2024,
    client: {
      ru: 'РБК / «Галс» (веб‑студия Ninelines)',
      en: 'RBC / Hals (Ninelines web‑studio)',
    },
    type: { ru: 'спецпроект «Лето в\u00A0городе»', en: '“Summer in the City” campaign' },
    url: 'https://hals-summer.rbc.ru/',
    site: 'hals-summer.rbc.ru',
    categories: ['promo'],
    star: false,
    video: {
      webm: '/assets/video/hals-summer.webm',
      mp4: '/assets/video/hals-summer.mp4',
    },
    tags: ['GSAP', 'Barba.js'],
    description: {
      ru: 'В\u00A0«Девяти\u00A0линиях» я\u00A0разработал фронтенд спецпроекта РБК и\u00A0девелопера Галс «Лето в\u00A0городе»: плавный скролл на\u00A0GSAP ScrollSmoother, бесшовные переходы между разделами на\u00A0Barba.js и\u00A0интерактивную иллюстрированную карту Москвы со\u00A0анимацией пинов на\u00A0ScrollTrigger. Реализовал динамическую смену карточек маршрутов при\u00A0прокрутке карты, карусель летних сценариев отдыха, модальные окна с\u00A0описанием премиальных жилых кварталов, а\u00A0также адаптивную вёрстку для\u00A0всех устройств.',
      en: 'At\u00A0Nine\u00A0Lines, I\u00A0developed the\u00A0frontend for\u00A0the\u00A0RBC and\u00A0Hals-Development “Summer in\u00A0the\u00A0City” special project: smooth scrolling powered by\u00A0GSAP ScrollSmoother, seamless Barba.js page transitions, and\u00A0an\u00A0interactive illustrated map of\u00A0Moscow with animated location pins. I\u00A0implemented synchronized route card switching during map progression, a\u00A0summer activity carousel, modal dialogs detailing premium residential districts, and\u00A0fully responsive layouts across all\u00A0devices.',
    },
  },
];
