import { pxToVc } from './viewport-scale.js';

// Описание проекта и измерение его высоты используют DOM текущего языка.
export function createPreviewDetails(currentPageData, preview, infoBox) {
  function scrambleText(element, finalText, durationMs = 200) {
    if (!element) return;
    const chars = '01#_$%*/~<>[]';
    const original = finalText;
    const start = performance.now();
    const interval = window.setInterval(() => {
      const progress = (performance.now() - start) / durationMs;
      if (progress >= 1) {
        window.clearInterval(interval);
        element.textContent = original;
        return;
      }
      let current = '';
      for (let i = 0; i < original.length; i++) {
        if (i < original.length * progress) {
          current += original[i];
        } else {
          current += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      element.textContent = current;
    }, 25);
  }

  let measuredMaxHeight = 0;

  function calculateMaxHeight() {
    if (!infoBox) return;
    const currentWidth = infoBox.getBoundingClientRect().width;
    if (currentWidth <= 0) return;

    let clone = /** @type {HTMLElement | null} */ (document.getElementById('preview-measurer-clone'));
    if (!clone) {
      clone = document.createElement('div');
      clone.id = 'preview-measurer-clone';
      clone.style.cssText = 'position: absolute; left: -9999px; top: 0; visibility: hidden; pointer-events: none;';
      // Замер должен наследовать тот же vc-шрифт и line-height, что и слайд.
      infoBox.insertAdjacentElement('afterend', clone);
    }

    clone.className = 'preview-info';
    clone.style.width = currentWidth + 'px';
    clone.style.minHeight = '0px';

    let maxH = 0;

    currentPageData.projects.forEach((p) => {
      let awardsHtml = '';
      const awards = p.awards || (p.awwwards ? [p.awwwards] : []);
      if (awards.length > 0) {
        awardsHtml = awards.map((a) => {
          const lastSpace = a.text.lastIndexOf(' ');
          const prefix = lastSpace > -1 ? `${a.text.slice(0, lastSpace)} ` : '';
          const suffix = a.text.slice(lastSpace + 1);
          return (
            '<div class="preview-awards__item">' +
            '<svg class="icon icon-size-12 icon--accent"><use href="#i-star"/></svg>' +
            (a.url
              ? '<a class="preview-awards__link">' + prefix + '<span class="preview-awards__suffix">' + suffix + '<svg class="icon icon-size-11"><use href="#i-ext"/></svg></span></a>'
              : '<span>' + a.text + '</span>'
            ) +
            '</div>'
          );
        }).join('');
      }

      const noteHtml = p.note
        ? '<div class="preview-note"><span class="preview-note__slash">// </span><span class="preview-note__text">' + p.note + '</span></div>'
        : '';
      const tagsHtml = (p.tags || []).map((t) => '<span class="tag">' + t + '</span>').join('');

      if (clone) {
        clone.innerHTML =
          '<div class="preview-name-row"><h3 class="preview-name">' + p.slug + '</h3></div>' +
          '<div class="preview-meta-body">' +
          '<div class="preview-subtitle">' + p.client + ' · ' + p.year + '</div>' +
          '<p class="preview-description">' + p.description + '</p>' +
          '<div class="preview-tags">' + tagsHtml + '</div>' +
          '<div class="preview-actions"><a class="btn btn--primary"><span>' + (currentPageData.t?.openSite || 'OPEN') + '</span></a></div>' +
          (noteHtml || '') +
          (awardsHtml ? '<div class="preview-awards"><span data-preview-awards-text>' + awardsHtml + '</span></div>' : '') +
          '</div>';

        const h = Math.ceil(clone.getBoundingClientRect().height);
        if (h > maxH) maxH = h;
      }
    });

    if (maxH > 0) {
      measuredMaxHeight = maxH;
      const maxHVc = Math.ceil(pxToVc(maxH));
      const heightVal = `calc(${maxHVc} * var(--wm))`;
      if (window.innerWidth >= 960) {
        document.documentElement.style.setProperty('--preview-info-height-vc', String(maxHVc));
        document.documentElement.style.setProperty('--preview-info-height', heightVal);
      } else {
        document.documentElement.style.setProperty('--preview-info-height-mobile-vc', String(maxHVc));
        document.documentElement.style.setProperty('--preview-info-height-mobile', heightVal);
      }
      infoBox.style.minHeight = heightVal;
    }
  }

  function updateTextDetails(project) {
    if (preview.slug) preview.slug.textContent = project.slug;
    if (preview.site) preview.site.textContent = project.site;
    if (preview.open) {
      preview.open.href = project.url;
      preview.open.rel = 'noopener noreferrer';
      if (currentPageData.t?.newTab) {
        preview.open.setAttribute('aria-label', `${project.site} (${currentPageData.t.newTab})`);
      }
    }
    if (preview.star) preview.star.hidden = !project.star;
    if (preview.sub) preview.sub.textContent = `${project.client} · ${project.year}`;
    if (preview.description) preview.description.textContent = project.description;
    if (preview.tags) {
      preview.tags.textContent = '';
      project.tags.forEach((tag) => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        preview.tags.appendChild(tagElement);
      });
    }
    if (preview.cta) {
      preview.cta.href = project.url;
      preview.cta.rel = 'noopener noreferrer';
      if (currentPageData.t?.newTab && currentPageData.t?.openSite) {
        preview.cta.setAttribute('aria-label', `${currentPageData.t.openSite}: ${project.slug} (${currentPageData.t.newTab})`);
      }
    }
    if (preview.note) {
      preview.note.hidden = !project.note;
      if (preview.noteText) {
        preview.noteText.textContent = project.note || '';
      }
    }
    if (preview.awards) {
      const awards = project.awards || (project.awwwards ? [project.awwwards] : []);
      preview.awards.hidden = awards.length === 0;
      if (preview.awardsText) {
        preview.awardsText.replaceChildren();
        awards.forEach((award) => {
          const item = document.createElement('div');
          item.className = 'preview-awards__item';

          const starIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          starIcon.setAttribute('class', 'icon icon-size-12 icon--accent');
          starIcon.setAttribute('aria-hidden', 'true');
          starIcon.setAttribute('focusable', 'false');
          const starIconUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
          starIconUse.setAttribute('href', '#i-star');
          starIcon.appendChild(starIconUse);
          item.appendChild(starIcon);

          if (award.url) {
            const awardLink = document.createElement('a');
            awardLink.className = 'preview-awards__link';
            awardLink.href = award.url;
            awardLink.target = '_blank';
            awardLink.rel = 'noopener noreferrer';
            if (currentPageData.t?.newTab) {
              awardLink.setAttribute('aria-label', `${award.text} (${currentPageData.t.newTab})`);
            }
            const lastSpace = award.text.lastIndexOf(' ');
            if (lastSpace > -1) awardLink.append(`${award.text.slice(0, lastSpace)} `);
            const awardSuffix = document.createElement('span');
            awardSuffix.className = 'preview-awards__suffix';
            awardSuffix.textContent = award.text.slice(lastSpace + 1);
            const awardIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            awardIcon.setAttribute('class', 'icon icon-size-11');
            awardIcon.setAttribute('aria-hidden', 'true');
            awardIcon.setAttribute('focusable', 'false');
            const awardIconUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            awardIconUse.setAttribute('href', '#i-ext');
            awardIcon.appendChild(awardIconUse);
            awardSuffix.appendChild(awardIcon);
            awardLink.appendChild(awardSuffix);
            item.appendChild(awardLink);
          } else {
            const textSpan = document.createElement('span');
            textSpan.textContent = award.text;
            item.appendChild(textSpan);
          }

          preview.awardsText.appendChild(item);
        });
      }
    }
  }

  return {
    scrambleText,
    calculateMaxHeight,
    updateTextDetails,
    destroy() {
      document.getElementById('preview-measurer-clone')?.remove();
    },
  };
}
