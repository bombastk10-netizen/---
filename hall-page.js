import { venues } from './data.js?v=20261016-halls2';
import { renderHallDetails } from './hall-details.js?v=20261016-halls2';
import { initHallSlideshow } from './hall-slideshow.js?v=20261016-halls2';

const hall = venues.find(item => item.id === Number(document.body.dataset.hallId));
if (!hall) throw new Error('Hall page identity is missing.');
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const n = value => new Intl.NumberFormat('ar-SA').format(value);
renderHallDetails(hall);
const album = hall.album;
const slideshow = album.length ? initHallSlideshow(album) : { setModalOpen() {} };
$('#hall-gallery-grid').setAttribute('aria-label', `صور ${hall.name}`);
if (album.length) $('#photos-button-label').textContent = `كل الصور (${n(album.length)})`;

function readIDs(storage, key) {
  try { const ids = JSON.parse(storage.getItem(key) || '[]'); return new Set(Array.isArray(ids) ? ids.map(Number).filter(id => venues.some(item => item.id === id)) : []); }
  catch { return new Set(); }
}
let saved = readIDs(localStorage, 'daleel-samar-favorites-v1');
let comparison = readIDs(sessionStorage, 'daleel-samar-compare-v1');
let toastTimer;
function notify(text) { const el = $('#hall-toast'); el.textContent = text; el.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => el.hidden = true, 2600); }
function syncSave() { $$('[data-save-hall]').forEach(button => { const selected = saved.has(hall.id); button.setAttribute('aria-pressed', String(selected)); button.setAttribute('aria-label', `${selected ? 'إزالة' : 'حفظ'} ${hall.name} ${selected ? 'من' : 'في'} المفضلة`); const label = button.querySelector('span'); if (label) label.textContent = selected ? 'محفوظة في المفضلة' : 'احفظ القاعة'; }); }
function syncCompare() { $$('[data-compare-hall]').forEach(button => { const selected = comparison.has(hall.id); button.setAttribute('aria-pressed', String(selected)); button.querySelector('span').textContent = selected ? 'أُضيفت للمقارنة' : 'أضف للمقارنة'; }); }
$$('[data-save-hall]').forEach(button => button.addEventListener('click', () => {
  saved.has(hall.id) ? saved.delete(hall.id) : saved.add(hall.id);
  try { localStorage.setItem('daleel-samar-favorites-v1', JSON.stringify([...saved])); } catch {}
  syncSave(); notify(saved.has(hall.id) ? `حفظنا ${hall.name} في المفضلة` : `أزلنا ${hall.name} من المفضلة`);
}));
$$('[data-compare-hall]').forEach(button => button.addEventListener('click', () => {
  if (comparison.has(hall.id)) comparison.delete(hall.id);
  else { if (comparison.size >= 3) return notify('تقدر تقارن بين ٣ قاعات. أزل خيارًا لإضافة هذه القاعة.'); comparison.add(hall.id); }
  try { sessionStorage.setItem('daleel-samar-compare-v1', JSON.stringify([...comparison])); } catch {}
  syncCompare(); notify(comparison.has(hall.id) ? `أضفنا ${hall.name} للمقارنة` : `أزلنا ${hall.name} من المقارنة`);
}));
syncSave(); syncCompare();
window.addEventListener('storage', event => { if (event.key === 'daleel-samar-favorites-v1') { saved = readIDs(localStorage, event.key); syncSave(); } });

const dialog = $('#hall-lightbox');
let current = 0;
function showPhoto(index) {
  if (!album.length) return;
  current = (index + album.length) % album.length;
  const photo = album[current];
  $('#lightbox-image').src = photo.src; $('#lightbox-image').alt = `${photo.name} — ${hall.name}`;
  $('#lightbox-title').textContent = photo.name; $('#lightbox-note').textContent = hall.name;
  $('#lightbox-count').textContent = `${n(current + 1)} / ${n(album.length)}`;
}
if (album.length < 2) { $('#previous-photo').hidden = true; $('#next-photo').hidden = true; }
document.addEventListener('click', event => { const button = event.target.closest('[data-photo]'); if (!button || !album.length) return; const index = Number(button.dataset.photo); if (!Number.isInteger(index) || !album[index]) return; showPhoto(index); dialog.showModal(); slideshow.setModalOpen(true); });
dialog.addEventListener('close', () => slideshow.setModalOpen(false));
$('#close-photos').addEventListener('click', () => dialog.close());
$('#previous-photo').addEventListener('click', () => showPhoto(current - 1));
$('#next-photo').addEventListener('click', () => showPhoto(current + 1));
dialog.addEventListener('click', event => { if (event.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); });
document.addEventListener('keydown', event => { if (!dialog.open) return; if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(current + 1); } if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(current - 1); } });
let touch;
$('.hall-lightbox-image').addEventListener('touchstart', event => { touch = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }, { passive: true });
$('.hall-lightbox-image').addEventListener('touchend', event => { if (!touch) return; const dx = event.changedTouches[0].clientX - touch.x, dy = event.changedTouches[0].clientY - touch.y; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) showPhoto(current + (dx > 0 ? 1 : -1)); touch = null; }, { passive: true });
$('#share-hall').addEventListener('click', async () => { const data = { title: `${hall.name} — دليل سمر`, text: hall.name, url: location.href }; try { if (navigator.share) { await navigator.share(data); return; } if (navigator.clipboard) { await navigator.clipboard.writeText(location.href); notify('نسخنا رابط القاعة'); } } catch (error) { if (error.name !== 'AbortError') notify('تقدر تنسخ رابط الصفحة من شريط العنوان'); } });
const links = $$('.hall-section-nav a');
if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => { const active = entries.find(entry => entry.isIntersecting); if (active) links.forEach(link => link.classList.toggle('active', link.hash === `#${active.target.id}`)); }, { rootMargin: '-20% 0px -55% 0px' }); links.forEach(link => { const section = document.querySelector(link.hash); if (section) observer.observe(section); }); }

if (Number.isFinite(hall.latitude) && Number.isFinite(hall.longitude)) {
  const map = document.createElement('div'); map.className = 'hall-map';
  const iframe = document.createElement('iframe'); iframe.title = `موقع ${hall.name}`; iframe.loading = 'lazy'; iframe.referrerPolicy = 'no-referrer-when-downgrade'; iframe.src = `https://maps.google.com/maps?q=${hall.latitude},${hall.longitude}&z=15&output=embed&hl=ar`; map.append(iframe); $('#location')?.append(map);
}
