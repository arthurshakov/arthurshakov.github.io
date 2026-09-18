import { pxToVc } from './viewport-scale.js';

function getAwardsHtml(awards, t) {
  if (!awards || awards.length === 0) return '';
  return awards.map((a) => {
    const lastSpace = a.text.lastIndexOf(' ');
    const prefix = lastSpace > -1 ? `${a.text.slice(0, lastSpace)} ` : '';
    const suffix = a.text.slice(lastSpace + 1);
    let content;
    if (a.url) {
      const ariaLabel = t?.newTab ? ` aria-label="${a.text} (${t.newTab})"` : '';
      content = `<a class="preview-awards__link" href="${a.url}" target="_blank" rel="noopener noreferrer"${ariaLabel}>${prefix}<span class="preview-awards__suffix">${suffix}<svg class="icon icon-size-11" aria-hidden="true" focusable="false"><use href="#i-ext"/></svg></span></a>`;
    } else {
      content = `<span>${a.text}</span>`;
    }
    return `<div class="preview-awards__item"><svg class="icon icon-size-12 icon--accent" aria-hidden="true" focusable="false"><use href="#i-star"/></svg>${content}</div>`;
  }).join('');
}

// Описание проекта и измерение его высоты используют DOM текущего языка.
export function createPreviewDetails(currentPageData, preview, infoBox) {
  let disposed = false;
  const scrambleIntervals = new Map();
  /** @type {HTMLElement | null} */
  let measurer = null;

  function scrambleText(element, finalText, durationMs = 200) {
    if (disposed || !element) return;
    window.clearInterval(scrambleIntervals.get(element));
    const chars = '01#_$%*/~<>[]';
    const original = finalText;
    const start = performance.now();
    const interval = window.setInterval(() => {
      const progress = (performance.now() - start) / durationMs;
      if (progress >= 1) {
        window.clearInterval(interval);
        scrambleIntervals.delete(element);
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
    scrambleIntervals.set(element, interval);
  }



  function calculateMaxHeight() {
    if (disposed || !infoBox) return;
    const currentWidth = infoBox.getBoundingClientRect().width;
    if (currentWidth <= 0) return;

    let clone = measurer;
    if (!clone) {
      clone = document.createElement('div');
      clone.id = 'preview-measurer-clone';
      measurer = clone;
      clone.style.cssText = 'position: absolute; left: -9999px; top: 0; visibility: hidden; pointer-events: none;';
      // Замер должен наследовать тот же vc-шрифт и line-height, что и слайд.
      infoBox.insertAdjacentElement('afterend', clone);
    }

    clone.className = 'preview-info';
    clone.style.width = currentWidth + 'px';
    clone.style.minHeight = '0px';

    let maxH = 0;

    currentPageData.projects.forEach((p) => {
      const awards = p.awards || [];
      const awardsHtml = getAwardsHtml(awards, currentPageData.t);

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
    if (disposed) return;
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
      const awards = project.awards || [];
      preview.awards.hidden = awards.length === 0;
      if (preview.awardsText) {
        preview.awardsText.innerHTML = getAwardsHtml(awards, currentPageData.t);
      }
    }
  }

  return {
    scrambleText,
    calculateMaxHeight,
    updateTextDetails,
    destroy() {
      disposed = true;
      scrambleIntervals.forEach(interval => window.clearInterval(interval));
      scrambleIntervals.clear();
      measurer?.remove();
      measurer = null;
    },
  };
}
