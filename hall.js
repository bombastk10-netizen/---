import { venues } from './data.js?v=20261014-filters1';
import { roomPhotos, renderHallDetails } from './hall-details.js?v=20261014-filters1';
import { initHallSlideshow } from './hall-slideshow.js?v=20261014-filters1';
const hall=venues.find(v=>v.id===1);
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const n=v=>new Intl.NumberFormat('ar-SA').format(v);
renderHallDetails(hall);
const album=roomPhotos;
const images=album.map(photo=>photo.src);
let current=0;
let saved=new Set();
let comparison=new Set();
try{saved=new Set(JSON.parse(localStorage.getItem('daleel-samar-favorites-v1')||'[]'))}catch{}
try{comparison=new Set(JSON.parse(sessionStorage.getItem('daleel-samar-compare-v1')||'[]'))}catch{}
function notify(text){const el=$('#hall-toast');el.textContent=text;el.hidden=false;clearTimeout(window.hallToast);window.hallToast=setTimeout(()=>el.hidden=true,2600)}
function syncSave(){$$('[data-save-hall]').forEach(el=>{el.setAttribute('aria-pressed',saved.has(1));el.setAttribute('aria-label',saved.has(1)?'إزالة القاعة الأولى من المفضلة':'حفظ القاعة الأولى في المفضلة')})}
$$('[data-save-hall]').forEach(el=>el.addEventListener('click',()=>{saved.has(1)?saved.delete(1):saved.add(1);try{localStorage.setItem('daleel-samar-favorites-v1',JSON.stringify([...saved]))}catch{}syncSave();notify(saved.has(1)?'حفظنا القاعة الأولى في المفضلة':'أزلنا القاعة الأولى من المفضلة')}));syncSave();
function syncCompare(){$$('[data-compare-hall]').forEach(b=>{b.setAttribute('aria-pressed',comparison.has(1));b.querySelector('span').textContent=comparison.has(1)?'أُضيفت للمقارنة':'أضف للمقارنة'})}
$$('[data-compare-hall]').forEach(b=>b.addEventListener('click',()=>{if(comparison.has(1))comparison.delete(1);else{if(comparison.size>=3)return notify('تقدر تقارن بين ٣ قاعات. أزل خيارًا لإضافة القاعة الأولى.');comparison.add(1)}try{sessionStorage.setItem('daleel-samar-compare-v1',JSON.stringify([...comparison]))}catch{}syncCompare();notify(comparison.has(1)?'أضفنا القاعة الأولى للمقارنة':'أزلنا القاعة الأولى من المقارنة')}));syncCompare();
const slideshow=initHallSlideshow(album);
$('#hall-preview-note')?.remove();
$('#photos-button-label').textContent=`كل الصور (${n(images.length)})`;
const dialog=$('#hall-lightbox');
function showPhoto(index){current=(index+images.length)%images.length;const photo=album[current];$('#lightbox-image').src=photo.src;$('#lightbox-image').alt=`${photo.name} — القاعة الأولى`;$('#lightbox-title').textContent=photo.name;$('#lightbox-note').textContent='القاعة الأولى للاحتفالات';$('#lightbox-count').textContent=`${n(current+1)} / ${n(images.length)}`}
if(images.length<2){$('#previous-photo').hidden=true;$('#next-photo').hidden=true}
document.addEventListener('click',e=>{const b=e.target.closest('[data-photo]');if(b){showPhoto(Number(b.dataset.photo));dialog.showModal();slideshow.setModalOpen(true)}});
dialog.addEventListener('close',()=>slideshow.setModalOpen(false));
$('#close-photos').addEventListener('click',()=>dialog.close());$('#previous-photo').addEventListener('click',()=>showPhoto(current-1));$('#next-photo').addEventListener('click',()=>showPhoto(current+1));
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
document.addEventListener('keydown',e=>{if(!dialog.open)return;if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(current+1)}if(e.key==='ArrowRight'){e.preventDefault();showPhoto(current-1)}});
let touch=null;$('.hall-lightbox-image').addEventListener('touchstart',e=>{touch={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});$('.hall-lightbox-image').addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4)showPhoto(current+(dx>0?1:-1));touch=null},{passive:true});
$('#share-hall').addEventListener('click',async()=>{const data={title:'القاعة الأولى — دليل سمر',text:'القاعة الأولى للاحتفالات، جدة — حي الصفوة',url:location.href};try{if(navigator.share){await navigator.share(data);return}if(navigator.clipboard){await navigator.clipboard.writeText(location.href);notify('نسخنا رابط القاعة');return}notify('تقدر تنسخ رابط الصفحة من شريط العنوان')}catch(e){if(e.name!=='AbortError')notify('تقدر تنسخ رابط الصفحة من شريط العنوان')}});
const links=$$('.hall-section-nav a');if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting);if(!visible.length)return;const id=visible[0].target.id;links.forEach(a=>a.classList.toggle('active',a.hash===`#${id}`))},{rootMargin:'-20% 0px -55% 0px',threshold:0});links.forEach(a=>{const section=document.querySelector(a.hash);if(section)observer.observe(section)})}
