const arabicNumber = new Intl.NumberFormat('ar-SA');
const sectionIcons = {
  'hall-information': 'spark',
  'hall-capacity': 'hall',
  'hall-dining': 'hall',
  'hall-spaces': 'spark',
  'hall-access': 'pin',
};

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
}

function isMissing(value) {
  return value === null || value === undefined ||
    (typeof value === 'string' && (!value.trim() || value.trim().toLowerCase() === 'undefined')) ||
    (typeof value === 'number' && !Number.isFinite(value));
}

function displayValue(value) {
  if (isMissing(value)) return '—';
  if (value === true) return 'نعم';
  if (value === false) return 'لا';
  if (typeof value === 'number') return arabicNumber.format(value);
  return typeof value === 'string' ? value.trim() : '—';
}

function icon(name, className = '') {
  return `<svg${className ? ` class="${className}"` : ''} aria-hidden="true"><use href="#h-${name}"/></svg>`;
}

function safeHTTPURL(value) {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value.trim())) return '';
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

function phoneNumber(value) {
  if (isMissing(value) || typeof value === 'boolean') return '';
  const normalized = String(value).trim()
    .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[\s()-]/g, '');
  return /^\+?\d{7,15}$/.test(normalized) ? normalized : '';
}

function safePosition(value) {
  const position = typeof value === 'string' ? value.trim() : '';
  return /^(?:(?:left|right|center|top|bottom|-?\d+(?:\.\d+)?%?)\s*){1,2}$/.test(position) ? position : 'center';
}

function renderFieldValue(field) {
  if (field.key === 'mapsUrl') {
    const url = safeHTTPURL(field.value);
    return url ? `<a class="hc-field-link" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">عرض الموقع<span aria-hidden="true">↗</span></a>` : '—';
  }
  if (field.key === 'phone') {
    const phone = phoneNumber(field.value);
    if (phone) return `<a class="hc-field-link hc-phone-link" href="tel:${phone}" dir="ltr">${escapeHTML(String(field.value).trim())}</a>`;
  }
  if (field.key === 'whatsapp') {
    const phone = phoneNumber(field.value);
    const url = safeHTTPURL(field.value) || (phone && /^\+?[1-9]\d{9,14}$/.test(phone) ? `https://wa.me/${phone.replace(/^\+/, '')}` : '');
    if (url) return `<a class="hc-field-link" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">واتساب<span aria-hidden="true">↗</span></a>`;
  }
  return escapeHTML(displayValue(field.value));
}

function renderFields(fields) {
  return `<dl class="hc-fields">${fields.map(field => {
    const value = renderFieldValue(field);
    const empty = value === '—';
    const wide = !empty && !value.includes('<a ') && displayValue(field.value).length > 38;
    return `<div class="hc-field${wide ? ' hc-field--wide' : ''}">
      <dt>${escapeHTML(field.label || '')}</dt>
      <dd${empty ? ' class="hc-value-empty" aria-label="غير محدد"' : ''}>${value}</dd>
    </div>`;
  }).join('')}</dl>`;
}

function renderGallery(group, album, hallName) {
  const photos = Array.isArray(group.photos) ? group.photos : [];
  const matchedPhotos = photos.map(photo => ({
    ...photo,
    albumIndex: album.findIndex(item => item.src === photo.src),
  })).filter(photo => typeof photo.src === 'string' && photo.src && photo.albumIndex >= 0);

  if (!matchedPhotos.length) {
    return `<div class="hc-gallery-empty" role="img" aria-label="مساحة صور ${escapeHTML(group.title || '')}">
      <span class="hc-empty-image">${icon('image')}</span>
      <span class="hc-empty-decoration" aria-hidden="true"></span>
    </div>`;
  }

  return `<div class="hc-group-gallery${matchedPhotos.length === 1 ? ' hc-group-gallery--single' : ''}" aria-label="صور ${escapeHTML(group.title || '')}">
    ${matchedPhotos.map(photo => {
      const name = photo.name || group.title || 'القاعة';
      return `<button type="button" class="hc-photo" data-photo="${photo.albumIndex}" aria-label="تكبير ${escapeHTML(name)}">
        <span class="hc-photo-frame"><img src="${escapeHTML(photo.src)}" alt="${escapeHTML(name)} — ${escapeHTML(hallName)}" loading="lazy" decoding="async" width="800" height="500" style="object-position:${safePosition(photo.position)}"></span>
        <span class="hc-photo-caption"><span>${escapeHTML(name)}</span>${icon('image')}</span>
      </button>`;
    }).join('')}
  </div>`;
}

/** Render content only. Navigation, page chrome and gallery behavior belong to hall.js. */
export function renderHallDetails(hall) {
  const root = document.querySelector('#hall-details-root');
  if (!root) return;

  const sections = Array.isArray(hall?.content) ? hall.content : [];
  const album = Array.isArray(hall?.album) ? hall.album : [];
  const hallName = hall?.name || 'القاعة';

  root.classList.add('hall-details-content');
  root.innerHTML = sections.map((section, sectionIndex) => {
    const groups = Array.isArray(section.groups) ? section.groups : [];
    const sectionNumber = arabicNumber.format(sectionIndex + 1).padStart(2, '٠');
    return `<section id="${escapeHTML(section.id)}" class="hc-section" aria-labelledby="${escapeHTML(section.id)}-heading">
      <header class="hc-section-header">
        <span class="hc-section-mark">${icon(sectionIcons[section.id] || 'hall')}</span>
        <h2 id="${escapeHTML(section.id)}-heading">${escapeHTML(section.title || '')}</h2>
        <span class="hc-section-number" aria-hidden="true">${sectionNumber}</span>
      </header>
      <div class="hc-groups">
        ${groups.map(group => `<article class="hc-group${groups.length === 1 ? ' hc-group--only' : ''}"${group.id ? ` id="${escapeHTML(group.id)}"` : ''}>
          <div class="hc-group-heading"><h3>${escapeHTML(group.title || '')}</h3><span aria-hidden="true"></span></div>
          ${renderFields(Array.isArray(group.fields) ? group.fields : [])}
          ${group.showPhotos === false ? '' : renderGallery(group, album, hallName)}
        </article>`).join('')}
      </div>
    </section>`;
  }).join('');
}
