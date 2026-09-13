// Рендер одной языковой страницы в строку HTML.
// Обе раскладки (.desktop-only / .mobile-only) присутствуют в DOM, переключение — CSS по 960px.
// Разметка works / preview / filmstrip пре-рендерится здесь (сайт работает без JS);
// app.js только усиливает (фильтры, смена кадра, клик по строке).

import { strings, contactHref } from './data/strings.mjs';
import { audioTracks } from './data/audio.mjs';
import { projects } from './data/projects.mjs';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => esc(s).replace(/"/g, '&quot;');

// В сборку попадает только один современный формат на кадр (avif или webp —
// который легче); manifest (slug -> { shot, thumb }) приходит из build.mjs.
const shot = (slug) => `/assets/shots/${slug}.jpg`;
const thumb = (slug) => `/assets/shots/${slug}-thumb.jpg`;
const shotMod = (slug, m) => `/assets/shots/${slug}.${(m && m.shot) || 'webp'}`;
const thumbMod = (slug, m) => `/assets/shots/${slug}-thumb.${(m && m.thumb) || 'webp'}`;
const shotType = (m) => `image/${(m && m.shot) || 'webp'}`;
const thumbType = (m) => `image/${(m && m.thumb) || 'webp'}`;

const SPRITE = `
<svg width="0" height="0" class="sr-only" aria-hidden="true" focusable="false"><defs>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-ext" viewBox="0 0 24 24"><path d="M14 5h5v5M19 5l-9 9M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-star" viewBox="0 0 24 24"><path d="M12 3.6l2.6 5.55 6.05.86-4.38 4.2 1.05 5.93L12 17.5l-5.37 2.64 1.05-5.93L3.3 10.01l6.05-.86z" fill="currentColor"/></symbol>
  <symbol id="i-dot" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" fill="currentColor"/></symbol>
</defs></svg>`;

const icon = (id, sizeClass, accent = false) =>
  `<svg class="icon ${sizeClass}${accent ? ' icon--accent' : ''}" aria-hidden="true" focusable="false"><use href="#i-${id}"/></svg>`;

function preloader(t, lang) {
  return '<div class="preloader" data-preloader aria-live="polite" aria-atomic="true"></div>';
}

function audioControl(t, variant = '') {
  const bars = Array.from(
    { length: 5 },
    () => '<span class="audio-control__bar"></span>'
  ).join('');

  return `<div class="audio-control ${variant}" data-audio-control><button class="audio-control__toggle" type="button" data-audio-toggle aria-pressed="false" data-audio-state="off" data-audio-label-on="${escAttr(
    t.audio.on
  )}" data-audio-label-off="${escAttr(t.audio.off)}" data-audio-start="${escAttr(
    t.audio.start
  )}" data-audio-stop="${escAttr(t.audio.stop)}" aria-label="${escAttr(t.audio.start)}"><span class="audio-control__bars" data-audio-bars aria-hidden="true">${bars}</span><span class="audio-control__label" data-audio-label>${esc(t.audio.off)}</span></button><button class="audio-control__skip" type="button" data-audio-previous aria-label="${escAttr(t.audio.previous)}">←</button><span class="audio-control__track" data-audio-track><span class="audio-control__track-position"><span data-audio-track-current>01</span><span aria-hidden="true"> / </span><span data-audio-track-total>03</span></span><span data-audio-track-name>${esc(t.audio.track)}</span></span><button class="audio-control__skip" type="button" data-audio-next aria-label="${escAttr(t.audio.next)}">→</button></div>`;
}

// ---------- status bar ----------
function statusBar(t, lang) {
  const command = `./render --locale=${lang}`;
  const commandSlot =
    `<span class="statusbar-preloader__command" data-preloader-command data-command="${escAttr(
      command
    )}"></span>`;
  const result = '<span class="statusbar-preloader__result" data-preloader-result hidden>✓ ready</span>';
  const metaText = (text) => `<span>${esc(text)}</span>`;
  const pills = (mobile) => {
    const ru = `<a class="pill ${lang === 'ru' ? 'pill--on' : 'pill--off'}" href="/ru/"${
      lang === 'ru' ? ' aria-current="page"' : ''
    }>ru</a>`;
    const en = `<a class="pill ${lang === 'en' ? 'pill--on' : 'pill--off'}" href="/"${
      lang === 'en' ? ' aria-current="page"' : ''
    }>en</a>`;
    const label = mobile
      ? ''
      : `<span class="statusbar-language__label">${esc(t.langLabel)}</span>`;
    return `<span class="statusbar-language">${label}${ru}${en}</span>`;
  };
  const p = t.prompt;
  const promptD =
    `<span class="statusbar-prompt__user">${esc(p.user)}</span>` +
    `<span class="statusbar-prompt__at">${esc(p.at)}</span>` +
    `<span class="statusbar-prompt__host">${esc(p.host)}</span>` +
    `<span class="statusbar-prompt__separator">${esc(p.sep)}</span>` +
    `<span class="statusbar-prompt__path">${esc(p.path)}</span>` +
    `<span class="statusbar-prompt__dollar">${esc(p.dollar)}</span> ` +
    commandSlot +
    `<span class="caret" aria-hidden="true"></span>`;
  const promptM =
    `<span class="statusbar-prompt__user">${esc(p.user)}</span>` +
    `<span class="statusbar-prompt__host">${esc(p.at)}${esc(p.host)}</span>` +
    `<span class="statusbar-prompt__dollar">${esc(p.dollar)}</span> ` +
    commandSlot +
    `<span class="caret" aria-hidden="true"></span>`;

  return `
  <header class="statusbar desktop-only">
    <div class="statusbar-prompt" data-preloader-prompt>${promptD}</div>
    <div class="statusbar-meta">
      <span class="statusbar-meta__content">${metaText(t.selected)}${audioControl(t, 'audio-control--tuner')}${pills(false)}</span>
    </div>
    ${result}
  </header>
  <header class="statusbar mobile-only">
    <div class="statusbar-prompt" data-preloader-prompt>${promptM}</div>
    <div class="statusbar-meta">
      <span class="statusbar-meta__content">${metaText(t.selectedM)}${audioControl(t, 'audio-control--tuner')}${pills(true)}</span>
    </div>
    ${result}
  </header>`;
}

// ---------- whoami ----------
function whoami(t) {
  const w = t.whoami;
  const awards = `${icon('star', 'icon-size-13', true)} <span>${esc(w.awardsText)}${
    w.awardsNote ? ` <span class="whoami-note">${esc(w.awardsNote)}</span>` : ''
  }${w.awardsExtra ? ` ${esc(w.awardsExtra)}` : ''}</span>`;
  const status = `${icon('dot', 'icon-size-9', true)} `;

  const desk = w.desktop || {};
  const mob = w.mobile || {};

  const grid = `
    <div class="whoami desktop-only">
      <div class="whoami-grid">
        <span class="whoami-label">${esc(t.w.name)}</span><span class="whoami-value whoami-value--name"><span>${esc(w.name)}</span><span class="whoami-status">${status}${esc(desk.status)}</span></span>
        <span class="whoami-label">${esc(t.w.role)}</span><span class="whoami-value">${esc(w.role)}</span>
        <span class="whoami-label">${esc(t.w.bio)}</span><span class="whoami-value whoami-value--bio">${esc(desk.bio)}</span>
        <span class="whoami-label">${esc(t.w.stack)}</span><span class="whoami-value">${esc(desk.stack)}</span>
        <span class="whoami-label">${esc(t.w.awards)}</span><span class="whoami-value whoami-value--awards">${awards}</span>
        <span class="whoami-label">${esc(t.w.clients)}</span><span class="whoami-value">${esc(desk.clients)}</span>
        <span class="whoami-label">${esc(t.w.workflow)}</span><span class="whoami-value">${esc(desk.workflow)}</span>
        <span class="whoami-label">${esc(t.w.languages)}</span><span class="whoami-value">${esc(w.languages)}</span>
        <span class="whoami-label">${esc(t.w.location)}</span><span class="whoami-value whoami-value--location">${esc(desk.location)}</span>
      </div>
    </div>`;

  const mBio = mob.bio ?? desk.bio ?? '';
  const mStack = mob.stack ?? desk.stack ?? '';
  const mClients = mob.clients ?? desk.clients ?? '';
  const mWorkflow = mob.workflow ?? desk.workflow ?? '';
  const stack = `
    <div class="whoami mobile-only">
      <div class="whoami-label">${esc(t.w.name)}</div><div class="whoami-value whoami-value--name"><span>${esc(w.name)}</span><span class="whoami-status">${status}${esc(desk.status)}</span></div>
      <div class="whoami-label">${esc(t.w.role)}</div><div class="whoami-value">${esc(w.role)}</div>
      <div class="whoami-label">${esc(t.w.bio)}</div><div class="whoami-value whoami-value--bio">${esc(mBio)}</div>
      <div class="whoami-label">${esc(t.w.stack)}</div><div class="whoami-value">${esc(mStack)}</div>
      <div class="whoami-label">${esc(t.w.awards)}</div><div class="whoami-value whoami-value--awards">${awards}</div>
      <div class="whoami-label">${esc(t.w.clients)}</div><div class="whoami-value">${esc(mClients)}</div>
      <div class="whoami-label">${esc(t.w.workflow)}</div><div class="whoami-value">${esc(mWorkflow)}</div>
      <div class="whoami-label">${esc(t.w.languages)}</div><div class="whoami-value">${esc(w.languages)}</div>
      <div class="whoami-label">${esc(t.w.location)}</div><div class="whoami-value whoami-value--location">${esc(desk.location)}</div>
    </div>`;

  return `
  <section class="section section--whoami">
    <div class="section-header section-header--whoami">
      <span class="section-header__title"><span class="section-header__slash">// </span>${esc(t.secWhoami)}</span>
    </div>
    ${grid}
    ${stack}
  </section>`;
}

// ---------- works ----------
function works(t, lang) {
  const chips = (mobile) =>
    t.filters
      .map(
        (f, i) =>
          `<button class="chip${i === 0 ? ' chip--on' : ''}" type="button" data-filter="${escAttr(
            f.id
          )}" aria-pressed="${i === 0 ? 'true' : 'false'}">${esc(f.label)}</button>`
      )
      .join(mobile ? '' : '\n        ');

  const rows = projects
    .map((p, i) => {
      const last = i === projects.length - 1 ? ' works-row--last' : '';
      const star = p.star ? ` ${icon('star', 'icon-size-12', true)}` : '';
      return `<div class="works-row${last}${i === 0 ? ' is-active' : ''}" data-slug="${escAttr(
        p.slug
      )}" data-categories="${escAttr((p.categories || []).join(' '))}">
          <span class="works-row__year works-column--year">${p.year}</span>
          <span class="works-row__project works-column--project">${esc(p.slug)}${star}</span>
          <span class="works-row__client works-column--client">${esc(p.client[lang])}</span>
          <span class="works-row__type works-column--type">${esc(p.type[lang])}</span>
          <span class="works-row__action works-column--action"><a href="${escAttr(
            p.url
          )}" target="_blank" rel="noopener">${esc(t.rowOpen)} ${icon('ext', 'icon-size-12')}</a></span>
        </div>`;
    })
    .join('\n        ');

  const cards = projects
    .map((p, i) => {
      const last = i === projects.length - 1 ? ' works-card--last' : '';
      const star = p.star ? ` ${icon('star', 'icon-size-12', true)}` : '';
      return `<div class="works-card${last}${i === 0 ? ' is-active' : ''}" data-slug="${escAttr(
        p.slug
      )}" data-categories="${escAttr((p.categories || []).join(' '))}">
          <div class="works-card__top"><span class="works-card__year">${p.year}</span><span class="works-card__name">${esc(
            p.slug
          )}</span>${star}</div>
          <div class="works-card__meta">${esc(p.client[lang])} · ${esc(p.type[lang])}</div>
        </div>`;
    })
    .join('\n        ');

  const archiveDesktop = t.archiveDesktop;
  const archiveMobile = t.archiveMobile;

  return `
  <section class="section section--works" id="works">
    <div class="section-header section-header--works">
      <span class="section-header__title"><span class="section-header__slash">// </span>${esc(t.secWorks)}</span>
    </div>

    <div class="filters desktop-only">
      <span class="filters__label">${esc(t.grep)}</span>
      ${chips(false)}
    </div>
    <div class="filters mobile-only" data-filters-strip><div class="filters-track" data-filters-track>${chips(true)}</div></div>

    <div class="works-table desktop-only">
      <div class="works-table__header">
        <span class="works-column--year">${esc(t.thead.year)}</span>
        <span class="works-column--project">${esc(t.thead.project)}</span>
        <span class="works-column--client">${esc(t.thead.client)}</span>
        <span class="works-column--type">${esc(t.thead.type)}</span>
        <span class="works-column--action"></span>
      </div>
      <div class="works-rows" data-rows>
        ${rows}
      </div>
    </div>

    <div class="works-cards mobile-only" data-cards>
        ${cards}
    </div>
  </section>
  `;

  /*
  <div class="archive desktop-only">
      <span class="dollar">$</span> ${esc(archiveDesktop.cmd)} &nbsp;<span class="archive__arrow">${esc(
        archiveDesktop.arrow
      )}</span>&nbsp; ${esc(archiveDesktop.tail)} &nbsp;<span class="archive__link" title="полный список — по запросу">${esc(archiveDesktop.link)}</span>
    </div>
    <div class="archive mobile-only">
      <span class="dollar">$</span> ${esc(archiveMobile.cmd)} ${esc(
        archiveMobile.arrow
      )} &nbsp;<span class="archive__link" title="полный список — по запросу">${esc(archiveMobile.link)}</span>
    </div>
  */
}

// ---------- preview ----------
function preview(t, lang, shots = {}) {
  const first = projects[0];
  const tags = (p) =>
    (p.tags || []).map((tag) => `<span class="tag">${esc(tag)}</span>`).join('');
  const firstNote = first.note ? first.note[lang] : null;
  const noteHidden = firstNote ? '' : ' hidden';
  const noteText = firstNote ? esc(firstNote) : '';
  const firstAwards = first.awards
    ? first.awards.map((a) => ({ text: a[lang], url: a.url || null }))
    : first.awwwards
      ? [{ text: first.awwwards[lang], url: first.awwwards.url || null }]
      : [];
  const awardsHidden = firstAwards.length ? '' : ' hidden';
  const renderAwardItem = (award) => {
    const lastSpace = award.text.lastIndexOf(' ');
    const prefix = lastSpace > -1 ? `${esc(award.text.slice(0, lastSpace))} ` : '';
    const suffix = esc(award.text.slice(lastSpace + 1));
    const content = award.url
      ? `<a class="preview-awards__link" href="${escAttr(award.url)}" target="_blank" rel="noopener">${prefix}<span class="preview-awards__suffix">${suffix}${icon(
          'ext',
          'icon-size-11'
        )}</span></a>`
      : `<span>${esc(award.text)}</span>`;
    return `<div class="preview-awards__item">${icon('star', 'icon-size-12', true)}${content}</div>`;
  };
  const awardsHtml = firstAwards.map(renderAwardItem).join('');

  return `
  <section class="section section--preview" id="preview">
    <div class="section-header section-header--preview">
      <span class="section-header__title"><span class="section-header__slash">// </span>${esc(t.secPreview)}</span>
      <span class="section-header__meta" data-preview-slug>${esc(first.slug)}</span>
    </div>

    <div class="preview-grid">
      <div class="preview-frame">
        <div class="preview-address">
          <div class="preview-address__left">
            <span class="preview-address__command">$ open</span>
            <a class="preview-address__url" data-preview-open href="${escAttr(
              first.url
            )}" target="_blank" rel="noopener"><span data-preview-site>${esc(
              first.site
            )}</span> ${icon('ext', 'icon-size-11')}</a>
          </div>
          <div class="preview-controls" data-preview-controls>
            <span class="preview-stepper-counter" data-preview-counter>[ <span class="preview-stepper-counter__current">01</span> / ${String(projects.length).padStart(2, '0')} ]</span>
            <button class="v-btn" data-preview-prev type="button" aria-label="${escAttr(t.prevProject)}">&lt;</button>
            <button class="v-btn" data-preview-next type="button" aria-label="${escAttr(t.nextProject)}">&gt;</button>
          </div>
        </div>
        <div class="preview-media" data-preview-media-box>
          <div class="preview-media-layer preview-media-layer--a" data-preview-layer-a>
            <picture data-preview-picture data-preview-picture-a>
              <source data-preview-shot-source data-preview-shot-source-a type="${shotType(shots[first.slug])}" srcset="${escAttr(
                shotMod(first.slug, shots[first.slug])
              )}">
              <img class="preview-screenshot" data-preview-shot-image data-preview-shot-image-a src="${escAttr(shot(first.slug))}" alt="${escAttr(
                first.slug
              )}" width="319" height="180" decoding="async" draggable="false">
            </picture>
            <video class="preview-screenshot preview-video" data-preview-video data-preview-video-a width="319" height="180" muted loop playsinline preload="none" aria-hidden="true"></video>
          </div>

          <div class="preview-media-layer preview-media-layer--b" data-preview-layer-b style="clip-path: inset(0 0 0 100%);">
            <picture data-preview-picture-b>
              <source data-preview-shot-source-b type="${shotType(shots[first.slug])}" srcset="${escAttr(
                shotMod(first.slug, shots[first.slug])
              )}">
              <img class="preview-screenshot" data-preview-shot-image-b src="${escAttr(shot(first.slug))}" alt="${escAttr(
                first.slug
              )}" width="319" height="180" decoding="async" draggable="false">
            </picture>
            <video class="preview-screenshot preview-video" data-preview-video-b width="319" height="180" muted loop playsinline preload="none" aria-hidden="true"></video>
          </div>

          <div class="scanline-trail" data-scanline-trail aria-hidden="true"></div>
          <div class="scanline-mask-line" data-scanline-line aria-hidden="true"></div>
        </div>
      </div>

      <div class="preview-info" data-preview-info>
        <div class="preview-name-row">
          <span class="preview-name" data-preview-name>${esc(first.slug)}</span>
          <span data-preview-star${first.star ? '' : ' hidden'}>${icon('star', 'icon-size-14', true)}</span>
        </div>
        <div class="preview-meta-body" data-preview-meta-body>
          <div class="preview-subtitle" data-preview-subtitle>${esc(first.client[lang])} · ${first.year}</div>
          <p class="preview-description" data-preview-description>${esc(first.description[lang])}</p>
          <div class="preview-tags" data-preview-tags>${tags(first)}</div>
          <div class="preview-actions">
            <a class="btn btn--primary" data-preview-call-to-action href="${escAttr(
              first.url
            )}" target="_blank" rel="noopener"><span data-preview-call-to-action-label>${esc(
              t.openSite
            )}</span> ${icon('ext', 'icon-size-13')}</a>
          </div>
          <div class="preview-note" data-preview-note${noteHidden}>
            <span class="preview-note__slash">// </span><span class="preview-note__text" data-preview-note-text>${noteText}</span>
          </div>
          <div class="preview-awards" data-preview-awards${awardsHidden}>
            <span data-preview-awards-text>${awardsHtml}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="preview-strip-caption"><span class="desktop-inline-only">${esc(
      t.stripCaptionD
    )}</span><span class="mobile-inline-only">${esc(t.stripCaptionM)}</span></div>
    <div class="preview-strip" data-preview-strip role="group" aria-label="${escAttr(t.secPreview)}">
      <div class="preview-strip-track" data-preview-track>
        ${projects
          .map(
            (p, i) => `<button class="preview-thumbnail${
              i === 0 ? ' is-active' : ''
            }" type="button" data-slug="${escAttr(p.slug)}" aria-pressed="${
              i === 0 ? 'true' : 'false'
            }"><picture><source type="${thumbType(shots[p.slug])}" srcset="${escAttr(
              thumbMod(p.slug, shots[p.slug])
            )}"><img src="${escAttr(thumb(p.slug))}" alt="${escAttr(
              p.slug
            )}" loading="lazy" decoding="async" width="1000" height="565" draggable="false"></picture></button>`
          )
          .join('\n        ')}
      </div>
    </div>
  </section>`;
}

// ---------- contact ----------
function contact(t) {
  const cv = t.contactValues;
  const cf = t.contactFlags;
  const a = (key, ext = true) =>
    `<a href="${escAttr(contactHref[key])}"${
      ext ? ' target="_blank" rel="noopener"' : ''
    }>${esc(cv[key])}</a>`;

  const lineD =
    `<span class="dollar">$</span> ${esc(t.contactCmd)} ` +
    `<span class="flag">${esc(cf.email)}</span> ${a('email', false)} ` +
    `<span class="flag">${esc(cf.github)}</span> ${a('github')} ` +
    `<span class="flag">${esc(cf.tg)}</span> ${a('tg')} ` +
    `<span class="flag">${esc(cf.cv)}</span> ${a('cv')}`;

  const lineM =
    `<span class="dollar">$</span> ${esc(t.contactCmd)}<br>` +
    `<span class="flag">${esc(cf.email)}</span> ${a('email', false)}<br>` +
    `<span class="flag">${esc(cf.github)}</span> ${a('github')}<br>` +
    `<span class="flag">${esc(cf.tg)}</span> ${a('tg')}<br>` +
    `<span class="flag">${esc(cf.cv)}</span> ${a('cv')}`;

  return `
  <section class="section section--contact" id="contact">
    <div class="section-header section-header--contact">
      <span class="section-header__title"><span class="section-header__slash">// </span>${esc(t.secContact)}</span>
    </div>
    <div class="contact-line desktop-only">${lineD}</div>
    <div class="contact-note desktop-only">${esc(t.contactNote)}</div>
    <div class="colophon desktop-only">${esc(t.colophonD)}</div>

    <div class="contact-line mobile-only">${lineM}</div>
    <div class="colophon mobile-only">${esc(t.colophonM)}</div>
  </section>`;
}

// ---------- данные для app.js (уже локализованные) ----------
function bootData(lang, t, shots = {}) {
  const list = projects.map((p) => {
    const awards = p.awards
      ? p.awards.map((a) => ({ text: a[lang], url: a.url || null }))
      : p.awwwards
        ? [{ text: p.awwwards[lang], url: p.awwwards.url || null }]
        : [];
    return {
      slug: p.slug,
      year: p.year,
      client: p.client[lang],
      type: p.type[lang],
      url: p.url,
      site: p.site,
      star: Boolean(p.star),
      categories: p.categories || [],
      tags: p.tags || [],
      description: p.description[lang],
      awards,
      awwwards: awards[0] || null,
      shot: shot(p.slug),
      shotMod: shotMod(p.slug, shots[p.slug]),
      shotModType: shotType(shots[p.slug]),
      video: p.video || null,
      note: p.note ? p.note[lang] : null,
    };
  });
  return {
    lang,
    t: { openSite: t.openSite },
    audioTracks,
    projects: list,
  };
}

// ---------- страница ----------
export function renderPage(lang, shots = {}, criticalCss = '') {
  const t = strings[lang];
  const altEn = '/';
  const altRu = '/ru/';
  const canonical = lang === 'ru' ? altRu : altEn;
  const favicon =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230A0C0A'/%3E%3Cpath d='M7 9l6 7-6 7' fill='none' stroke='%23A8E05B' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3Crect x='17' y='21' width='8' height='3' fill='%23A8E05B'/%3E%3C/svg%3E";

  return `<!doctype html>
<html lang="${t.htmlLang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t.title)}</title>
<meta name="description" content="${escAttr(t.description)}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="${altEn}">
<link rel="alternate" hreflang="ru" href="${altRu}">
<link rel="alternate" hreflang="x-default" href="${altEn}">
<link rel="icon" href="${favicon}">
<meta name="color-scheme" content="dark">
<meta property="og:type" content="website">
<meta property="og:title" content="${escAttr(t.title)}">
<meta property="og:description" content="${escAttr(t.description)}">
<style>${criticalCss}</style>
<script>
  (() => {
    const root = document.documentElement;
    // Прелоадер — один раз на сессию: перезагрузка и переход между /ru/ и /
    // показывают страницу сразу. Решаем здесь, до первого пейнта, иначе
    // оверлей успел бы мигнуть. Отметку ставим сразу на старте: если уйти
    // с середины прелоадера, второй раз он уже не нужен.
    let seen = false;
    try {
      seen = window.sessionStorage.getItem('portfolio:preloader') === '1';
      window.sessionStorage.setItem('portfolio:preloader', '1');
    } catch (e) {
      // sessionStorage может быть недоступен (приватный режим, запрет на
      // данные сайтов) — тогда просто показываем прелоадер как обычно.
    }
    if (!seen) root.classList.add('preloader-pending');
    // Страховка нужна в обоих случаях: она же снимает .page с visibility:
    // hidden, если app.js не доехал.
    const hardFinish = () => {
      root.classList.remove('preloader-pending');
      root.classList.add('fonts-loaded');
    };
    let timeout = window.setTimeout(hardFinish, 1800);
    // Прелоадер стартует только после шрифтов и стилей — на медленной сети
    // позже жёсткой страховки. Как только он реально пошёл, страховку
    // отодвигаем, иначе она снимет оверлей посреди анимации.
    window.__holdPreloaderFallback = () => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(hardFinish, 4000);
    };
    window.__finishPreloaderFallback = () => {
      window.clearTimeout(timeout);
      root.classList.remove('preloader-pending');
    };
  })();
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap">
<link rel="preload" as="style" href="/styles.css" id="main-styles" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/styles.css"><style>.page{visibility:visible}</style></noscript>
</head>
<body>
<div class="bg-grid" aria-hidden="true"><div class="body__rail" aria-hidden="true"></div><canvas class="bg-grid-canvas" id="bg-grid-canvas" aria-hidden="true"></canvas></div>
${preloader(t, lang)}
<div class="page">
${SPRITE}
${statusBar(t, lang)}
  <div class="body">
    <main class="body__main">
${whoami(t)}
${works(t, lang)}
${preview(t, lang, shots)}
${contact(t)}
    </main>
  </div>
</div>
<script>window.__PORTFOLIO__=${JSON.stringify(bootData(lang, t, shots))};</script>
<script src="/lenis.min.js"></script>
<script src="/gsap.min.js"></script>
<script src="/Draggable.min.js"></script>
<script src="/InertiaPlugin.min.js"></script>
<script type="module" src="/app.js"></script>
</body>
</html>
`;
}
