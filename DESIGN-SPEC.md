<!-- markdownlint-disable -->
# Портфолио Артура Шакова — спецификация для вёрстки

Это дизайн-деливерабл. Задача разработки — собрать по нему **продакшн-статику** сайта, попиксельно близко.

## Источники истины

| Файл | Что это |
|---|---|
| `Main.dc.html` | RU, desktop (1440) — эталон экрана |
| `MainEN.dc.html` | EN, desktop (1440) |
| `MainMobile.dc.html` | RU, mobile (390) |
| `MainMobileEN.dc.html` | EN, mobile (390) |
| `src/assets/images/screenshots/*` | готовые скриншоты без адресной строки, названные по slug проекта (`<slug>.webp`) |
| `src/assets/docs/arthur-shakov-resume-en.pdf`, `src/assets/docs/arthur-shakov-resume-ru.pdf` | резюме (ссылка `--cv`, en / ru) |
| `portfolio projects.md` | полный список проектов (в портфолио — только отобранные ниже) |

**Формат `.dc.html`:** это Design Components (обёртки `<x-dc>`, `<helmet>`, строка `<script src="./support.js">`). Как приложение НЕ запускать. Разметка внутри — статический HTML с инлайновыми стилями: значения цветов, отступов, размеров брать из них напрямую, ничего не «округлять» под сетку 4/8.

Прочие артборды на холсте (`ShotB`, `ShotC`, `Sketch*`, `Editorial`, `Kinetic`) — отклонённые варианты, в вёрстку не идут.

## Задача

Собрать статический сайт-портфолио: **одна страница со скроллом**, направление «Terminal» (тёмный техно-брутализм, моноширинный шрифт). Два брейкпоинта: 390 и 1440 (между ними — резина, ≥1440 контент не растягивать сверх ~1320–1400).

Обязательно:
- **Живой переключатель RU/EN** (в макете `--lang=ru/en` — статичный тумблер; сделать рабочим: `<html lang>`, подмена текстов, запоминание выбора).
- Ховер-состояния строк таблицы и ссылок (в макете строка 1 показана как hover — это состояние, не дефолт).
- Лента превью в `// preview`: клик по миниатюре меняет большой кадр и мету; активная миниатюра — рамка `2px` акцентом.
- Доступность: контраст, фокус-кольца от палитры, `prefers-reduced-motion` (гасит мигание каретки, любые появления и плавный скролл — Lenis не инициализируется, остаётся нативный скролл).
- Хит-таргеты на мобиле ≥ 44px.
- Скриншоты — из `src/assets/images/screenshots/`; `buildImages()` в `src/build.mjs` обрабатывает их через Sharp: полный кадр в исходном разрешении и миниатюра шириной до 1000px, для каждого — меньший из AVIF/WebP (качество 90) плюс JPEG (качество 82).

Стек на усмотрение исполнителя (хватит vanilla HTML/(S)CSS/JS(TypeScript); допустимы Astro). Без тяжёлых фреймворков без причины.

## Дизайн-система (из `.dc.html`)

**Шрифт:** `'JetBrains Mono'` (Google Fonts), fallback `ui-monospace, 'SF Mono', Menlo, monospace`. Веса 400 / 500 / 700. Базовый размер `13px`, `line-height: 1.55`, `font-variant-numeric: tabular-nums`.

**Цвета:**
```
--bg:            #0A0C0A   (фон страницы)
--bg-panel:      #0B0E0B   (статус-бар)
--bg-elev:       #0E110E   (строка адреса $ open)
--line-faint:    #171C17   (границы строк таблицы)
--line:          #1C221C   (границы секций, левый рельс)
--line-strong:   #2A322A   (рамки картинок, чипов, шапка таблицы)
--text:          #C4CFC0   (основной)
--text-bright:   #E9EFE4   (заголовки, имена проектов)
--text-body:     #A6B2A2   (абзацы)
--text-2:        #93A08F   (второстепенный: клиент, подписи)
--text-3:        #7E8B7B   (третичный: тип работы, // префиксы, флаги)
--text-dim:      #6E7A6B   (колофон)
--accent:        #A8E05B   (lime — промпт $, каретка, активное, ссылки, ★)
--accent-hover:  #C4EC8A
```
`::selection` → bg `#A8E05B`, color `#0A0C0A`. Скроллбар тёмный, thumb `#2A322A`. Ссылки — `--accent`, hover — подчёркивание `1px` с `text-underline-offset: 3px`.

**Фоновая сетка:** канвас-слой точек и связок (bg-grid-canvas), шаг `64px` (desktop) / `40px` (mobile). Рисуется отдельным **статичным слоем во вьюпорте** (`position: fixed; inset: 0; z-index: -1`), отцентрованным по тем же `max-width: 1440px; margin-inline: auto`, что и контент, — при скролле не двигается (иначе 1px-линии «дрожат» на инерционном скролле). Горизонтальных линий в сетке нет: при статичном слое они «плыли» относительно границ секций/строк таблицы (муар); горизонтальный ритм несут границы контента. Фон страницы держит `body`.

**Раскладка desktop:** левый «рельс редактора» — колонка `64px` с правой границей `1px --line`, контент в `padding: 0 64px 0 40px`. Секции — вертикальный ритм ~`44–56px`.
**Раскладка mobile:** `padding: 0 20px`, статус-бар в две строки.

**Компоненты:**
- **Статус-бар:** `arthur_shakov` (700, bright) `:` (`--text-3`) `~/portfolio` (`--text-2`) `$` (accent) + мигающая каретка (`8×15px` блок accent, `blink 1.1s step-end`). Справа: `показано 17 работ · 70+ всего` (RU) / `showing 17 works · 70+ total` (EN) и `--lang=` [ru][en] (активный — фон accent, текст `--bg`).
- **Заголовок секции:** `// name` — `// ` в `--text-3`, слово в `--text-2`, `12px`, вес 500, снизу граница `1px --line`.
- **whoami:** grid `132px 1fr`, gap `14px 28px`. Строки: name (24px/700) со статусом доступности рядом (● dot + текст, accent), role, bio (`max-width: 68ch`), stack, awards (★ + текст), clients, languages, location.
- **works — таблица:** flex-строки, `gap: 20px`, `padding: 13px 0`, граница снизу `1px --line-faint`. Колонки: `year` 52px (`--text-2`) · `project` flex 2 (bright/500, ★ у Awwwards) · `client` 190px (`--text-2`) · `type` flex 3 (`--text-3`) · action 88px (ссылка `open ↗`, видна в ховере). Шапка `11px --text-3`, граница `1px --line-strong`. Ховер строки: фон `rgba(168,224,91,0.09)`, левая граница `1px --accent`. Над таблицей — чипы-фильтры `grep: все (all) / awwwards / промо / игры / корпоративные / недвижимость / бренды / каталоги / авто / таймлайн / видео` (активный — фон accent, на мобиле — инерционная перетаскиваемая лента на Draggable) и `sort: featured`.
- **preview:** grid `1.35fr 1fr`. Слева: строка адреса — `$ open` (`--text-3`) + `<url>` (accent) + ссылка `открыть ↗` справа; фон `--bg-elev`, граница `1px --line-strong` без низа; под ней `<img>` 16:10, `object-fit: cover`, граница `1px --line-strong`. Справа: имя+★, `Whitemark · 2019`, описание (`max-width: 52ch`), теги-чипы, кнопки `открыть сайт / кейс` (min-height 44px), плашка `★ Awwwards — Honorable Mention + Mobile Excellence`.
- **filmstrip:** подпись `// клик по превью — меняет большой кадр`, флекс-лента с `overflow-x: auto`, миниатюры `150×90` (desktop) / `148×90` (mobile), `object-fit: cover`, граница `1px --line-strong`; активная — `2px --accent`.
- **contact:** `$ contact --email <a> --github <a> --tg <a> --cv <a>` (флаги `--text-3`, значения — ссылки accent). Ниже `// открыт к интересным спецпроектам и продуктовым командам`. Колофон (RU: `сделано на vanilla JS + Lenis · без фреймворков · © 2026`, EN: `built with vanilla JS + Lenis · no framework · © 2026`, одинаковый для desktop и mobile) (`--text-dim`).

**Иконки:** только инлайновый SVG (sprite `<symbol>`): arrow-right, external-link, star (заливка), dot, chevron. Обводка `1.7`, сетка 24. Никаких эмодзи/юникод-глифов как иконок.

**Каретка/анимация:** CSS-анимация мигания каретки. Стартовый терминальный прелоадер (посимвольный ввод команды и маска раскрытия контента) анимируется через GSAP (вендор-скрипт `src/vendor/gsap.min.js`, глобал `window.gsap`). Дополнительный эффект — **плавный (инерционный) скролл** через Lenis (вендор-скрипт `src/vendor/lenis.min.js`, глобал `window.Lenis`; в бандл кладётся как `dist/lenis.min.js` перед `app.js`). Анимации выключаются при `prefers-reduced-motion: reduce`.

## Контент

**Персона:** Артур Шаков / Arthur Shakov. Роль: `веб-разработчик — frontend, AI-assisted backend и интерактивные спецпроекты` / `web developer — frontend, AI-assisted backend & interactive projects`.
**Контакты:** `arthurshakov@gmail.com` · `github.com/arthurshakov` · Telegram `@arthur_shakov` · `arthur-shakov-resume.pdf`.
**Локация:** Чегем · удалёнка/гибрид · готов к переезду · UTC+3. **Языки:** RU native · EN C1.
**Awwwards:** 2× Honorable Mention (+ Mobile Excellence у Glass Decor).
**Клиенты:** РБК · ТАСС · X5 (Пятёрочка, Перекрёсток, Чижик) · food.ru · Норникель · Сбер · Росатом · Etalon Group.

**Работы (17, порядок = `featured`, НЕ по годам):**

| slug | год | клиент | тип | URL для `$ open` / кнопки | Awwwards |
|---|---|---|---|---|---|
| power-x-time | 2024 | ТАСС × Росатом (веб-студия Ninelines) | интерактивный таймлайн | tass-power-x-time.linestest.com |  |
| best-cashier | 2026 | X5 / food.ru | игра-тренажёр | best-cashier.food.ru |  |
| glass-decor | 2019 | Glass Decor (веб-студия Whitemark) | сайт-каталог | glass-decor.ru | ★ HM + Mobile Excellence |
| vmeste-ai | 2026 | Фонд Потанина × ТАСС (веб-студия Ninelines) | цикл видеолекций | tass.ru/specialprojects/vmeste-ai |  |
| career-nornickel | 2026 | Норникель | карьерный сайт | career.nornickel.ru |  |
| krylatskaya33 | 2026 | РБК | спецпроект о недвижимости | krylatskaya33.rbc.ru |  |
| klassnie-sbory | 2026 | Чижик | промо «снова в школу» | klassnie-sbory.food.ru |  |
| astra-drive | 2025 | Astra | бренд-сайт | astradrive.net |  |
| hill8 | 2018 | Hill8 (веб-студия Whitemark) | сайт апартаментов · выборщик | awwwards.com/sites/hill8 | ★ HM |
| rbc-tank | 2024 | РБК × TANK (веб-студия Ninelines) | автомобильный спецпроект | rbc-tank.linestest.com |  |
| sl-soft | 2025 | Praxis | корпоративный сайт | slsoft.ru |  |
| katty-pro | 2024 | Пятёрочка × food.ru (веб-студия Ninelines) | промоигра с формой | katty-pro.linestest.com |  |
| etalon-group | 2025 | Praxis | девелопер · инвест-презентации | etalongroup.com |  |
| tass-rzhd-bam | 2024 | ТАСС × РЖД | спецпроект «БАМ 50 лет» | tass-rzhd-bam.linestest.com |  |
| dreamriva | 2026 | РБК × Дрим Рива (веб-студия Ninelines) | спецпроект о недвижимости | dreamriva.rbc.ru |  |
| rbc-moskvich | 2024 | РБК × Москвич (веб-студия Ninelines) | автомобильный спецпроект | rbc-moskvich.linestest.com |  |
| hals-summer | 2024 | РБК × Галс (веб-студия Ninelines) | интерактивная карта-спецпроект | hals-summer.rbc.ru |  |

Скриншоты после сборки: `dist/assets/shots/<slug>.*`, миниатюры — `<slug>-thumb.*`; выбранные форматы указаны в `_manifest.json`. Исходники берутся из `src/assets/images/screenshots/<slug>.*`; готовые файлы кэшируются по mtime исходников. Ниже таблицы в макете — строка `$ ls works/_archive/ | wc -l → 60+` (в текущем шаблоне скрыта, чтобы не оставлять некликабельный элемент без страницы архива).

EN-версия: slug'и не переводятся; клиенты/типы — на английском (см. `MainEN.dc.html`), `Девять Линий` → `Nine Lines`, «спецпроект» → `campaign / editorial project`.

## Чего НЕ делать

- Не «улучшать» дизайн — это спецификация, задача попасть в неё.
- Не рисовать фейковый статус-бар iOS / фейковую клавиатуру.
- Не заменять моноширинный шрифт, палитру или сетку.
- `href="#"` в макете — заглушки; проставить реальные ссылки из таблицы.
