import { venues, styleLabels } from './data.js?v=20261014-filters1';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const arabicNumbers = new Intl.NumberFormat('ar-SA');
const number = value => arabicNumbers.format(value);
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const icons = {
  heart: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m14 6-6 6 6 6M8 12h13"/></svg>',
  compare: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 3v18M16 3v18M3 7h5m8 10h5M5 4l-3 3 3 3m14 4 3 3-3 3"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.4"/><path d="m21 15-5-5L5 21"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/></svg>',
};

function readSaved(key, storage) {
  try {
    const parsed = JSON.parse(storage.getItem(key) || '[]');
    return new Set(Array.isArray(parsed) ? parsed.map(Number).filter(id => venues.some(venue => venue.id === id)) : []);
  } catch { return new Set(); }
}

let favorites = new Set();
let comparison = new Set();
try { favorites = readSaved('daleel-samar-favorites-v1', window.localStorage); } catch { /* Browser storage is optional. */ }
try { comparison = new Set([...readSaved('daleel-samar-compare-v1', window.sessionStorage)].slice(0, 3)); } catch { /* Browser storage is optional. */ }

const state = {
  query: '', zone: '', guests: '', sort: 'recommended',
  favoritesOnly: false, limit: 6, favorites, comparison,
};
let activeVenue = null;
let galleryIndex = 0;
let toastTimer;
let searchTimer;
let navigationSection = 'home';
let refreshCardsOnDetailClose = false;
let deferredCardFocus = null;

function focusAfterUpdate(selector, scroll = false) {
  if (!selector) return;
  requestAnimationFrame(() => {
    const element = $(selector);
    if (!element || !element.isConnected) return;
    element.focus({ preventScroll: true });
    if (scroll) element.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
  });
}

function persist() {
  try { localStorage.setItem('daleel-samar-favorites-v1', JSON.stringify([...state.favorites])); } catch { /* The interface continues without storage. */ }
  try { sessionStorage.setItem('daleel-samar-compare-v1', JSON.stringify([...state.comparison])); } catch { /* The interface continues without storage. */ }
}

function normalize(value) {
  return String(value).trim().toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
}

function filteredVenues() {
  const terms = normalize(state.query).split(/\s+/).filter(Boolean);
  const list = venues.filter(venue => {
    const searchable = normalize(`${venue.name} قاعة ${venue.id} ${venue.district} ${venue.city || ''} ${venue.zone} ${styleLabels[venue.style]} ${venue.features.join(' ')}`);
    return terms.every(term => searchable.includes(term))
      && (!state.zone || venue.zone === state.zone)
      && (!state.guests || (Number.isFinite(venue.capacity) && venue.capacity >= Number(state.guests)))
      && (!state.favoritesOnly || state.favorites.has(venue.id));
  });
  if (state.sort === 'capacity-asc' || state.sort === 'capacity-desc') list.sort((a, b) => {
    if (!Number.isFinite(a.capacity)) return Number.isFinite(b.capacity) ? 1 : 0;
    if (!Number.isFinite(b.capacity)) return -1;
    return state.sort === 'capacity-asc' ? a.capacity - b.capacity : b.capacity - a.capacity;
  });
  return list;
}

const capacityLabel = venue => !Number.isFinite(venue.capacity) ? 'تواصل مع القاعة' : `حتى ${number(venue.capacity)} ضيف`;
const sampleCountLabel = (venue, field, unit) => Number.isFinite(venue[field]) ? `${number(venue[field])} ${unit}` : 'تواصل مع القاعة';

function venueLink(venue, className, content, label = '') {
  const attributes = `${className ? `class="${className}"` : ''} data-open-venue="${venue.id}"${label ? ` aria-label="${escapeHTML(label)}"` : ''}`;
  return venue.url ? `<a href="${escapeHTML(venue.url)}" ${attributes}>${content}</a>` : `<button type="button" ${attributes}>${content}</button>`;
}

function saveButton(venue, extraClass = '') {
  const saved = state.favorites.has(venue.id);
  return `<button type="button" class="${extraClass} ${saved ? 'is-saved' : ''}" data-save="${venue.id}" aria-pressed="${saved}" aria-label="${saved ? 'إزالة' : 'حفظ'} ${escapeHTML(venue.name)} ${saved ? 'من' : 'في'} المفضلة" title="${saved ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}">${icons.heart}</button>`;
}

function compareButton(venue, extraClass = 'card-compare') {
  const selected = state.comparison.has(venue.id);
  return `<button type="button" class="${extraClass} ${selected ? 'is-selected' : ''}" data-compare="${venue.id}" aria-pressed="${selected}" aria-label="${selected ? 'إزالة' : 'إضافة'} ${escapeHTML(venue.name)} ${selected ? 'من' : 'إلى'} المقارنة">${selected ? icons.check : icons.compare}<span>${selected ? 'بالمقارنة' : 'قارن'}</span></button>`;
}

function venueCard(venue) {
  const gallery = `<img src="${venue.photos[0]}" alt="${venue.demo === false ? 'صورة من' : 'صورة لأجواء'} ${escapeHTML(venue.name)}" loading="lazy" decoding="async" width="960" height="720">
    <span class="card-badge">${escapeHTML(styleLabels[venue.style])}</span>
    <span class="card-photo-count">${icons.image}<span>${number(venue.photos.length)}</span></span>`;
  const metadata = venue.demo === false
    ? `<span>${icons.pin}مدينة ${escapeHTML(venue.city)}</span><span><a href="${escapeHTML(venue.mapsUrl)}" target="_blank" rel="noopener noreferrer" aria-label="عرض موقع ${escapeHTML(venue.name)} على الخريطة">عرض الموقع</a></span>`
    : `<span>${icons.users}${capacityLabel(venue)}</span><span>${escapeHTML(venue.features[0] || 'تفاصيل القاعة')}</span>`;
  return `<article class="venue-card" data-venue-card="${venue.id}">
    <div class="card-image-wrap">
      ${venueLink(venue, 'gallery-open', gallery, `شاهد صور وتفاصيل ${venue.name}`)}
      ${saveButton(venue, 'card-save')}
    </div>
    <div class="card-body">
      <p class="card-location">${icons.pin}<span>${escapeHTML(venue.district)} <span class="location-divider">·</span> ${escapeHTML(venue.city || venue.zone)}</span></p>
      <div class="card-title-row"><h3>${venueLink(venue, '', escapeHTML(venue.name))}</h3></div>
      <div class="card-meta">${metadata}</div>
      <div class="card-bottom">${venueLink(venue, 'card-details', `<span>اكتشف القاعة</span>${icons.arrow}`)}${compareButton(venue)}</div>
    </div>
  </article>`;
}

function syncNavigation() {
  $$('#nav-home, #nav-explore, #nav-favorites').forEach(button => {
    const active = state.favoritesOnly ? button.id === 'nav-favorites' : button.id === `nav-${navigationSection}`;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  const favoriteToggle = $('#favorites-toggle');
  if (favoriteToggle) {
    favoriteToggle.classList.toggle('active', state.favoritesOnly);
    favoriteToggle.setAttribute('aria-pressed', String(state.favoritesOnly));
    favoriteToggle.setAttribute('aria-label', state.favoritesOnly ? 'عرض جميع القاعات' : `عرض المفضلة، ${number(state.favorites.size)} قاعات محفوظة`);
  }
  $$('[data-favorites-count]').forEach(element => {
    element.textContent = number(state.favorites.size);
    element.hidden = state.favorites.size === 0;
  });
}

function render({ focusSelector = null, scrollFocus = false } = {}) {
  const list = filteredVenues();
  const grid = $('#venue-grid');
  if (grid) grid.innerHTML = list.slice(0, state.limit).map(venueCard).join('');
  const count = $('#result-count');
  if (count) count.textContent = `${number(list.length)} قاعة${state.favoritesOnly ? ' في المفضلة' : ' بانتظارك'}`;
  const empty = $('#empty-state');
  if (empty) empty.hidden = list.length > 0;
  if ($('#empty-title')) $('#empty-title').textContent = state.favoritesOnly && state.favorites.size === 0 ? 'القاعات اللي تحبها، هنا' : 'خلّنا نوسّع الخيارات';
  if ($('#empty-copy')) $('#empty-copy').textContent = state.favoritesOnly && state.favorites.size === 0 ? 'اضغط على القلب بجانب أي قاعة، وارجع لها بسهولة وقت ما تحب.' : 'ما لقينا قاعة تطابق اختيارك. جرّب تغيير البحث أو إزالة بعض الفلاتر.';
  const loadMore = $('#load-more');
  if (loadMore) {
    loadMore.hidden = list.length <= state.limit;
    const remaining = Math.min(6, list.length - state.limit);
    if (remaining > 0) loadMore.setAttribute('aria-label', `عرض ${number(remaining)} قاعات إضافية`);
  }
  $$('[data-zone]').forEach(button => {
    const active = button.dataset.zone === state.zone;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const activeFilters = [state.zone, state.guests].filter(Boolean).length;
  if ($('#filter-count')) {
    $('#filter-count').textContent = number(activeFilters);
    $('#filter-count').hidden = activeFilters === 0;
  }
  if ($('#filter-summary')) {
    $('#filter-summary').textContent = state.guests ? `${number(state.guests)} ضيف فأكثر` : '';
    $('#filter-summary').hidden = !state.guests;
  }
  syncNavigation();
  syncComparison();
  focusAfterUpdate(focusSelector, scrollFocus);
}

function notify(message) {
  const toast = $('#toast');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.hidden = true;
  }, 3100);
}

function toggleFavorite(id) {
  const venue = venues.find(item => item.id === id);
  if (!venue) return;
  const saved = !state.favorites.has(id);
  let focusSelector = null;
  if (state.favoritesOnly) {
    const currentList = filteredVenues();
    const position = currentList.findIndex(item => item.id === id);
    const nextVenue = currentList[position + 1] || currentList[position - 1];
    focusSelector = saved ? `#venue-grid [data-save="${id}"]` : nextVenue ? `#venue-grid [data-save="${nextVenue.id}"]` : '#nav-favorites';
  }
  if (saved) state.favorites.add(id);
  else state.favorites.delete(id);
  persist();
  if (state.favoritesOnly) {
    if ($('#detail-dialog')?.open) {
      refreshCardsOnDetailClose = true;
      deferredCardFocus = focusSelector;
    } else render({ focusSelector });
  }
  $$(`[data-save="${id}"]`).forEach(button => {
    button.classList.toggle('is-saved', saved);
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', `${saved ? 'إزالة' : 'حفظ'} ${venue.name} ${saved ? 'من' : 'في'} المفضلة`);
    button.title = saved ? 'إزالة من المفضلة' : 'حفظ في المفضلة';
    const label = button.querySelector('.detail-save-label');
    if (label) label.textContent = saved ? 'محفوظة في المفضلة' : 'احفظ القاعة';
  });
  syncNavigation();
  notify(saved ? `حفظنا ${venue.name} في المفضلة` : `أزلنا ${venue.name} من المفضلة`);
}

function syncComparison() {
  const count = state.comparison.size;
  const bar = $('#compare-bar');
  if (bar) bar.hidden = count === 0;
  if ($('#compare-count')) $('#compare-count').textContent = number(count);
  if ($('#nav-compare-count')) {
    $('#nav-compare-count').textContent = number(count);
    $('#nav-compare-count').hidden = !count;
  }
  document.body.classList.toggle('has-comparison', count > 0);
  $$('[data-compare]').forEach(button => {
    const selected = state.comparison.has(Number(button.dataset.compare));
    const venue = venues.find(item => item.id === Number(button.dataset.compare));
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', `${selected ? 'إزالة' : 'إضافة'} ${venue?.name || 'القاعة'} ${selected ? 'من' : 'إلى'} المقارنة`);
    button.innerHTML = `${selected ? icons.check : icons.compare}<span>${selected ? 'بالمقارنة' : 'قارن'}</span>`;
  });
  const miniatures = $('#compare-miniatures');
  if (miniatures) miniatures.innerHTML = [...state.comparison].map(id => {
    const venue = venues.find(item => item.id === id);
    return `<img src="${venue.photos[0]}" width="44" height="44" alt="${escapeHTML(venue.name)}">`;
  }).join('');
}

function toggleCompare(id) {
  const venue = venues.find(item => item.id === id);
  if (!venue) return;
  const removing = state.comparison.has(id);
  let focusSelector = null;
  if (removing && $('#compare-dialog')?.open) {
    const current = [...state.comparison];
    const position = current.indexOf(id);
    const nextId = current[position + 1] || current[position - 1];
    focusSelector = nextId ? `#compare-dialog [data-remove-compare="${nextId}"]` : '#compare-dialog .dialog-header [data-close-dialog]';
  }
  if (removing) state.comparison.delete(id);
  else {
    if (state.comparison.size >= 3) return notify('تقدر تقارن بين ٣ قاعات. أزل قاعة لإضافة خيار جديد.');
    state.comparison.add(id);
    notify(`أضفنا ${venue.name} للمقارنة`);
  }
  persist();
  syncComparison();
  if ($('#compare-dialog')?.open) renderComparison({ focusSelector });
}

function updateDialogState() {
  document.body.classList.toggle('dialog-open', $$('dialog[open]').length > 0);
}

function openDialog(dialog) {
  if (!dialog || dialog.open) return;
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  updateDialogState();
}

function closeDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
  updateDialogState();
}

function openVenue(id, updateHash = true) {
  const venue = venues.find(item => item.id === id);
  if (!venue) return;
  if (venue.url) {
    location.assign(venue.url);
    return;
  }
  const dialog = $('#detail-dialog');
  const content = $('#detail-content');
  if (!dialog || !content) return;
  activeVenue = venue;
  galleryIndex = 0;
  content.innerHTML = `
    <div class="detail-gallery" id="detail-gallery" aria-roledescription="معرض صور" aria-label="صور ${escapeHTML(venue.name)}">
      <img id="detail-gallery-image" src="${venue.photos[0]}" alt="صورة ${number(1)} من ${number(venue.photos.length)} لأجواء ${escapeHTML(venue.name)}" width="1200" height="800">
      <span class="detail-gallery-counter gallery-counter" id="detail-gallery-counter">${number(1)} / ${number(venue.photos.length)}</span>
      <button type="button" class="gallery-arrow gallery-nav gallery-prev" data-gallery-step="-1" aria-label="الصورة السابقة">${icons.chevron}</button>
      <button type="button" class="gallery-arrow gallery-nav gallery-next" data-gallery-step="1" aria-label="الصورة التالية">${icons.chevron}</button>
      <div class="gallery-dots" id="gallery-dots">${venue.photos.map((_, index) => `<button type="button" data-gallery-index="${index}" class="${index === 0 ? 'active' : ''}" aria-label="عرض الصورة ${number(index + 1)}" aria-pressed="${index === 0}"></button>`).join('')}</div>
    </div>
    <div class="detail-body">
      <div class="detail-heading"><div><p class="detail-eyebrow">${escapeHTML(styleLabels[venue.style])}</p><h2 id="detail-title">${escapeHTML(venue.name)}</h2><p class="card-location detail-location">${icons.pin}<span>${escapeHTML(venue.district)} · ${escapeHTML(venue.zone)}</span></p></div>${saveButton(venue, 'detail-save-icon')}</div>
      <p class="detail-description">${escapeHTML(venue.description)}</p>
      <div class="detail-specs"><div class="detail-spec">${icons.users}<span>السعة</span><strong>${capacityLabel(venue)}</strong></div><div class="detail-spec">${icons.spark}<span>طابع المكان</span><strong>${escapeHTML(styleLabels[venue.style])}</strong></div></div>
      <h3 class="detail-section-title">تفاصيل تكمّل مناسبتك</h3>
      <ul class="detail-features feature-list">${venue.features.map(feature => `<li>${icons.check}<span>${escapeHTML(feature)}</span></li>`).join('')}</ul>
      <div class="detail-note"><strong>تواصل مباشر مع القاعة</strong><p>للاستفسار عن تفاصيل مناسبتك، تواصل مع إدارة القاعة مباشرة.</p></div>
      <div class="detail-actions">${compareButton(venue, 'button button-primary primary-button detail-compare')}<button type="button" class="button button-secondary secondary-button detail-save ${state.favorites.has(venue.id) ? 'is-saved' : ''}" data-save="${venue.id}" aria-pressed="${state.favorites.has(venue.id)}">${icons.heart}<span class="detail-save-label">${state.favorites.has(venue.id) ? 'محفوظة في المفضلة' : 'احفظ القاعة'}</span></button></div>
    </div>`;
  dialog.setAttribute('aria-labelledby', 'detail-title');
  openDialog(dialog);
  if (updateHash && location.hash !== `#hall-${id}`) history.pushState(null, '', `#hall-${id}`);
  connectGallerySwipe();
}

function showGallery(index) {
  if (!activeVenue) return;
  galleryIndex = (index + activeVenue.photos.length) % activeVenue.photos.length;
  const image = $('#detail-gallery-image');
  if (image) {
    image.src = activeVenue.photos[galleryIndex];
    image.alt = `صورة ${number(galleryIndex + 1)} من ${number(activeVenue.photos.length)} لأجواء ${activeVenue.name}`;
  }
  if ($('#detail-gallery-counter')) $('#detail-gallery-counter').textContent = `${number(galleryIndex + 1)} / ${number(activeVenue.photos.length)}`;
  $$('[data-gallery-index]').forEach(button => {
    const active = Number(button.dataset.galleryIndex) === galleryIndex;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function connectGallerySwipe() {
  const gallery = $('#detail-gallery');
  if (!gallery) return;
  let touchX = 0;
  let touchY = 0;
  gallery.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) return;
    touchX = event.touches[0].clientX;
    touchY = event.touches[0].clientY;
  }, { passive: true });
  gallery.addEventListener('touchend', event => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    const distanceX = touch.clientX - touchX;
    const distanceY = touch.clientY - touchY;
    if (Math.abs(distanceX) > 45 && Math.abs(distanceX) > Math.abs(distanceY) * 1.4) showGallery(galleryIndex + (distanceX > 0 ? 1 : -1));
  }, { passive: true });
}

function renderComparison({ focusSelector = null } = {}) {
  const content = $('#compare-content');
  if (!content) return;
  const selected = [...state.comparison].map(id => venues.find(venue => venue.id === id));
  if (selected.length === 0) {
    content.innerHTML = `<div class="compare-empty">${icons.compare}<h3>خلّ خياراتك قدامك</h3><p>أضف قاعتين أو ثلاث من بطاقات القاعات، وشاهد الفروقات في مكان واحد.</p><button class="button button-primary primary-button" type="button" data-close-dialog>استكشف القاعات</button></div>`;
    focusAfterUpdate(focusSelector);
    return;
  }
  content.innerHTML = `<p class="compare-intro">${selected.length === 1 ? 'أضف قاعة ثانية لتظهر لك المقارنة بشكل أوضح.' : 'نظرة جنبًا إلى جنب، لاختيار أقرب لمناسبتك.'}</p><div class="compare-table-wrap compare-scroll"><table class="compare-table"><caption class="sr-only">مقارنة مواصفات القاعات المختارة</caption><thead><tr><th scope="col">التفاصيل</th>${selected.map(venue => `<th scope="col"><div class="compare-venue"><img src="${venue.photos[0]}" alt="${venue.demo === false ? 'صورة من' : 'صورة لـ'} ${escapeHTML(venue.name)}" width="240" height="160"><h3>${escapeHTML(venue.name)}</h3><button type="button" class="compare-remove" data-remove-compare="${venue.id}" aria-label="إزالة ${escapeHTML(venue.name)} من المقارنة">${icons.close}<span>إزالة</span></button></div></th>`).join('')}</tr></thead><tbody>
    <tr><th scope="row">الحي</th>${selected.map(venue => `<td>${escapeHTML(venue.district)}</td>`).join('')}</tr>
    <tr><th scope="row">المنطقة</th>${selected.map(venue => `<td>${escapeHTML(venue.zone)}</td>`).join('')}</tr>
    <tr><th scope="row">السعة</th>${selected.map(venue => `<td><strong>${capacityLabel(venue)}</strong></td>`).join('')}</tr>
    <tr><th scope="row">قسم الرجال</th>${selected.map(venue => `<td>${sampleCountLabel(venue, 'menCapacity', 'ضيف')}</td>`).join('')}</tr>
    <tr><th scope="row">قسم النساء</th>${selected.map(venue => `<td>${sampleCountLabel(venue, 'womenCapacity', 'ضيفة')}</td>`).join('')}</tr>
    <tr><th scope="row">المواقف</th>${selected.map(venue => `<td>${sampleCountLabel(venue, 'parking', 'موقف')}</td>`).join('')}</tr>
    <tr><th scope="row">طابع المكان</th>${selected.map(venue => `<td>${escapeHTML(styleLabels[venue.style])}</td>`).join('')}</tr>
    <tr><th scope="row">التجهيزات</th>${selected.map(venue => `<td>${venue.features.length ? `<ul>${venue.features.map(feature => `<li>${escapeHTML(feature)}</li>`).join('')}</ul>` : 'تواصل مع القاعة'}</td>`).join('')}</tr>
    <tr><th scope="row">اكتشف أكثر</th>${selected.map(venue => `<td><button class="compare-view" type="button" data-compare-view="${venue.id}">الصور والتفاصيل ${icons.arrow}</button></td>`).join('')}</tr>
  </tbody></table></div><p class="compare-note">للاستفسار والتنسيق، تواصل مع القاعة مباشرة.</p>`;
  focusAfterUpdate(focusSelector);
}

function openComparison() {
  renderComparison();
  openDialog($('#compare-dialog'));
}

function scrollToVenues() {
  $('#venues')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
}

function clearSearchFilters() {
  Object.assign(state, { query: '', zone: '', guests: '', limit: 6 });
  if ($('#search-input')) $('#search-input').value = '';
  ['#filter-zone', '#filter-guests'].forEach(selector => { if ($(selector)) $(selector).value = ''; });
}

function resetFilters({ showAll = false } = {}) {
  clearSearchFilters();
  if (showAll) state.favoritesOnly = false;
  render();
}

document.addEventListener('click', event => {
  const save = event.target.closest('[data-save]');
  if (save) return toggleFavorite(Number(save.dataset.save));
  const compare = event.target.closest('[data-compare]');
  if (compare) return toggleCompare(Number(compare.dataset.compare));
  const venueLink = event.target.closest('[data-open-venue]');
  if (venueLink) {
    const linkedVenue = venues.find(venue => venue.id === Number(venueLink.dataset.openVenue));
    if (venueLink.tagName === 'A' && linkedVenue?.url) return;
    return openVenue(Number(venueLink.dataset.openVenue));
  }
  const close = event.target.closest('[data-close-dialog]');
  if (close) return closeDialog(close.closest('dialog'));
  const filterOpener = event.target.closest('[data-open-filters]');
  if (filterOpener) {
    if ($('#filter-zone')) $('#filter-zone').value = state.zone;
    if ($('#filter-guests')) $('#filter-guests').value = state.guests;
    return openDialog($('#filter-dialog'));
  }
  const zone = event.target.closest('[data-zone]');
  if (zone) {
    state.zone = zone.dataset.zone;
    state.limit = 6;
    return render();
  }
  const step = event.target.closest('[data-gallery-step]');
  if (step) return showGallery(galleryIndex + Number(step.dataset.galleryStep));
  const dot = event.target.closest('[data-gallery-index]');
  if (dot) return showGallery(Number(dot.dataset.galleryIndex));
  const remove = event.target.closest('[data-remove-compare]');
  if (remove) return toggleCompare(Number(remove.dataset.removeCompare));
  const compareView = event.target.closest('[data-compare-view]');
  if (compareView) {
    closeDialog($('#compare-dialog'));
    return openVenue(Number(compareView.dataset.compareView));
  }
  if (event.target.closest('[data-reset-filters], #empty-reset')) return resetFilters({ showAll: true });
  if (event.target.closest('a[href="#venues"]')) {
    navigationSection = 'explore';
    resetFilters({ showAll: true });
    return;
  }
  if (event.target.closest('[data-open-owner]')) return openDialog($('#owner-dialog'));
});

$('#search-input')?.addEventListener('input', event => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.query = event.target.value;
    state.limit = 6;
    render();
  }, 130);
});

$('#search-form')?.addEventListener('submit', event => {
  event.preventDefault();
  clearTimeout(searchTimer);
  state.query = $('#search-input')?.value || '';
  state.limit = 6;
  render();
  scrollToVenues();
  $('#search-input')?.blur();
});

$('#apply-filters')?.addEventListener('click', event => {
  event.preventDefault();
  state.zone = $('#filter-zone')?.value || '';
  state.guests = $('#filter-guests')?.value || '';
  state.limit = 6;
  render();
  closeDialog($('#filter-dialog'));
  scrollToVenues();
});
$('#reset-filters')?.addEventListener('click', event => { event.preventDefault(); resetFilters(); });
$('#sort-select')?.addEventListener('change', event => { state.sort = event.target.value; state.limit = 6; render(); });
$('#load-more')?.addEventListener('click', () => {
  const nextVenue = filteredVenues()[state.limit];
  state.limit += 6;
  render({ focusSelector: nextVenue ? `#venue-grid [data-venue-card="${nextVenue.id}"] .card-details` : null, scrollFocus: true });
});

function showFavorites() {
  state.favoritesOnly = !state.favoritesOnly;
  clearSearchFilters();
  render();
  scrollToVenues();
}
$('#favorites-toggle')?.addEventListener('click', showFavorites);
$('#nav-favorites')?.addEventListener('click', event => {
  event.preventDefault();
  state.favoritesOnly = true;
  clearSearchFilters();
  render();
  scrollToVenues();
});
$('#nav-explore')?.addEventListener('click', event => {
  event.preventDefault();
  state.favoritesOnly = false;
  navigationSection = 'explore';
  render();
  scrollToVenues();
});
$('#nav-home')?.addEventListener('click', event => {
  event.preventDefault();
  state.favoritesOnly = false;
  navigationSection = 'home';
  render();
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
});
$('#compare-open')?.addEventListener('click', openComparison);
$('#nav-compare')?.addEventListener('click', event => { event.preventDefault(); openComparison(); });
$('#compare-clear')?.addEventListener('click', () => {
  state.comparison.clear();
  persist();
  syncComparison();
  if ($('#compare-dialog')?.open) renderComparison({ focusSelector: '#compare-dialog .dialog-header [data-close-dialog]' });
});

$$('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
  });
  dialog.addEventListener('close', () => {
    updateDialogState();
    if (dialog.id === 'detail-dialog') {
      activeVenue = null;
      if (/^#hall-\d+$/.test(location.hash)) history.replaceState(null, '', `${location.pathname}${location.search}`);
      if (refreshCardsOnDetailClose) {
        refreshCardsOnDetailClose = false;
        render({ focusSelector: deferredCardFocus });
        deferredCardFocus = null;
      }
    }
  });
});

document.addEventListener('keydown', event => {
  if (!$('#detail-dialog')?.open || $('#compare-dialog')?.open || !activeVenue) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); showGallery(galleryIndex + 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showGallery(galleryIndex - 1); }
});

function handleHash() {
  const match = location.hash.match(/^#hall-(\d+)$/);
  if (match) openVenue(Number(match[1]), false);
  else if ($('#detail-dialog')?.open) closeDialog($('#detail-dialog'));
}
window.addEventListener('hashchange', handleHash);

$('#owner-form')?.addEventListener('submit', event => {
  event.preventDefault();
  notify('للاستفسار عن إضافة قاعة، تواصل مع إدارة دليل سمر.');
});

// A short introduction can never hold the page hostage, even if the video fails.
function initIntro() {
  const loader = $('#intro-loader');
  const video = $('#intro-video');
  if (!loader) return;
  let finished = false;
  let timeout;
  let skippedByUser = false;
  const skipButton = $('#skip-intro');
  const previousFocus = document.activeElement;
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(timeout);
    loader.classList.add('is-hidden', 'is-leaving');
    loader.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('intro-loading');
    $$('[data-intro-inert]').forEach(element => {
      element.inert = false;
      element.removeAttribute('data-intro-inert');
    });
    if (document.activeElement === skipButton) {
      if (skippedByUser) {
        const returnTo = previousFocus && previousFocus !== document.body && !loader.contains(previousFocus) ? previousFocus : $('.site-header .brand');
        returnTo?.focus({ preventScroll: true });
      } else skipButton.blur();
    }
    video?.pause();
    try { sessionStorage.setItem('daleel-samar-intro-v1', 'seen'); } catch { /* Session storage is optional. */ }
    setTimeout(() => { loader.hidden = true; }, 350);
  }
  let seen = false;
  try { seen = sessionStorage.getItem('daleel-samar-intro-v1') === 'seen'; } catch { /* Session storage is optional. */ }
  if (seen || document.documentElement.classList.contains('skip-intro') || matchMedia('(prefers-reduced-motion: reduce)').matches || !video || /^#hall-\d+$/.test(location.hash) || $$('dialog[open]').length) return finish();
  $$('main, .site-header, .site-footer, .mobile-nav, .skip-link').forEach(element => {
    if (element.inert) return;
    element.inert = true;
    element.setAttribute('data-intro-inert', '');
  });
  skipButton?.focus({ preventScroll: true });
  timeout = setTimeout(finish, 2800);
  skipButton?.addEventListener('click', () => { skippedByUser = true; finish(); }, { once: true });
  video.muted = true;
  video.playsInline = true;
  video.addEventListener('ended', finish, { once: true });
  video.addEventListener('error', finish, { once: true });
  try {
    const playback = video.play();
    if (playback && typeof playback.catch === 'function') playback.catch(finish);
  } catch { finish(); }
}

window.addEventListener('storage', event => {
  if (event.key !== 'daleel-samar-favorites-v1') return;
  try { state.favorites = readSaved('daleel-samar-favorites-v1', localStorage); } catch { return; }
  if ($('#detail-dialog')?.open) refreshCardsOnDetailClose = true;
  else render();
  if (activeVenue) $$(`[data-save="${activeVenue.id}"]`).forEach(button => {
    const saved = state.favorites.has(activeVenue.id);
    button.classList.toggle('is-saved', saved);
    button.setAttribute('aria-pressed', String(saved));
    const label = button.querySelector('.detail-save-label');
    if (label) label.textContent = saved ? 'محفوظة في المفضلة' : 'احفظ القاعة';
  });
});

window.daleelState = {
  get snapshot() {
    return { ...state, favorites: [...state.favorites], comparison: [...state.comparison], visibleResults: filteredVenues().length };
  },
};

render();
handleHash();
initIntro();

// Keep the mobile navigation aligned with the section being viewed.
const venueSection = $('#venues');
if (venueSection) {
  const updateSection = () => {
    navigationSection = venueSection.getBoundingClientRect().top <= window.innerHeight * 0.45 ? 'explore' : 'home';
    syncNavigation();
  };
  if ('IntersectionObserver' in window) {
    let sectionObserver;
    const observeSection = () => {
      sectionObserver?.disconnect();
      sectionObserver = new IntersectionObserver(updateSection, {
        rootMargin: `-${Math.round(window.innerHeight * 0.15)}px 0px -${Math.round(window.innerHeight * 0.55)}px 0px`,
        threshold: 0,
      });
      sectionObserver.observe(venueSection);
    };
    observeSection();
    window.addEventListener('resize', observeSection, { passive: true });
  } else {
    let framePending = false;
    window.addEventListener('scroll', () => {
      if (framePending) return;
      framePending = true;
      requestAnimationFrame(() => { updateSection(); framePending = false; });
    }, { passive: true });
  }
  window.addEventListener('resize', updateSection, { passive: true });
}
