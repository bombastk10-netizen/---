export const roomPhotos = [
  {name:'الواجهة الخارجية',src:'assets/hall-1/photo-4.webp'},
  {name:'مبنى القاعة والمواقف',src:'assets/hall-1/photo-6.webp',position:'35% 50%'},
  {name:'صالة القاعة',src:'assets/hall-1/photo-1.webp'},
  {name:'الشاشة والجلسات',src:'assets/hall-1/photo-2.webp'},
  {name:'مدخل القاعة',src:'assets/hall-1/photo-3.webp'},
  {name:'صالة الطعام',src:'assets/hall-1/photo-5.webp'},
];

export function renderHallDetails(hall){
  const n=value=>new Intl.NumberFormat('ar-SA').format(value);
  const icon=name=>`<svg aria-hidden="true"><use href="#h-${name}"/></svg>`;
  const header=(title,subtitle='',id='')=>`<div class="hall-section-title">${icon('hall')}<h2${id?` id="${id}"`:''}>${title}</h2></div>${subtitle?`<p class="hall-section-description">${subtitle}</p>`:''}`;
  const roomHTML=roomPhotos.map((room,i)=>`<button type="button" class="hall-room-card" data-photo="${i}" aria-label="عرض ${room.name}"><span class="hall-room-image"><img src="${room.src}" alt="${room.name} — القاعة الأولى" loading="lazy" width="600" height="400"></span><span class="hall-room-caption"><strong>${room.name}</strong>${icon('image')}</span></button>`).join('');
  const old=document.querySelector('.hall-space-section');
  old.outerHTML=`<div class="hall-demo-content">
    <section id="hall-capacity" class="hall-content-section hall-capacity-section">
      ${header('مساحة لكل أحبابك','تعرّف على سعة الصالات وتوزيع الضيوف.')}
      <div class="hall-total-capacity"><span>${icon('hall')}<span>إجمالي سعة القاعة<small>قسمان منفصلان للرجال والنساء</small></span></span><strong>${n(hall.capacity)}<small>ضيف</small></strong></div>
      <div class="hall-capacity-grid"><article><span class="hall-capacity-label">قسم الرجال</span><strong>${n(hall.menCapacity)}</strong><span class="hall-capacity-unit">ضيف في صالة الرجال</span><div><span>صالة الطعام</span><b>${n(hall.diningMenCapacity)} شخص</b></div></article><article><span class="hall-capacity-label">قسم النساء</span><strong>${n(hall.womenCapacity)}</strong><span class="hall-capacity-unit">ضيفة في صالة النساء</span><div><span>صالة الطعام</span><b>${n(hall.diningWomenCapacity)} شخص</b></div></article></div>
      <p class="hall-capacity-foot">الجلسات موزعة على ١٠٠ طاولة و١٬٠٠٠ كرسي.</p>
    </section>
    <section id="hall-rooms" class="hall-content-section">
      ${header('جولة في القاعة','شاهد الصالة والجلسات والمدخل والواجهة الخارجية.')}
      <div class="hall-rooms-grid">${roomHTML}</div>
    </section>
    <section id="hall-access" class="hall-content-section">
      ${header('من الوصول… للترحيب','مداخل مستقلة ومساحات منظمة لضيوف مناسبتك.')}
      <div class="hall-parking-stat"><div class="hall-parking-icon">${icon('pin')}</div><div><strong>${n(hall.parking)} <span>موقف سيارة</span></strong><p>مواقف خاصة بالقاعة • خدمة صف السيارات حسب الطلب</p></div></div>
      <h3 class="hall-detail-subtitle">المداخل والخصوصية</h3><div class="hall-entry-grid"><div>${icon('check')}<span>مدخل رجال مستقل</span></div><div>${icon('check')}<span>مدخل نساء مستقل</span></div><div>${icon('check')}<span>مدخل خاص للعروس</span></div></div>
      <h3 class="hall-detail-subtitle">سهولة الوصول</h3><div class="hall-amenity-pills"><span>مصعد</span><span>منحدرات للكراسي المتحركة</span><span>دورات مياه مهيأة</span><span>لوحات إرشادية</span></div>
    </section>
    <section id="hall-amenities" class="hall-content-section">
      ${header('تجهيزات تكمل الليلة','تفاصيل المساحات والتجهيزات المتوفرة لمناسبتك.')}
      <div class="hall-equipment-grid">${[
        ['كوشة ومسرح','منصة رئيسية لتفاصيل مناسبتك'],['إضاءة ديكورية','إضاءة عامة وإضاءة للمسرح'],['صوتيات وشاشات','نظام صوت وشاشتا عرض'],['غرفة عروس','غرفة تجهيز بدورة مياه خاصة'],['الطاولات والكراسي','١٠٠ طاولة • ١٬٠٠٠ كرسي'],['دورات المياه','١٠ دورات مياه موزعة على القسمين'],['جلسات خارجية','مساحة للاستقبال والجلسات'],['تكييف مركزي','يشمل الصالات ومساحات الضيافة']
      ].map(([title,desc])=>`<div>${icon('check')}<span><strong>${title}</strong><small>${desc}</small></span></div>`).join('')}</div>
    </section>
    <section id="hall-services" class="hall-content-section">
      ${header('ضيافة تليق بضيوفك','جميع خدمات الضيافة والتنظيم متوفرة حسب الطلب.')}
      <div class="hall-service-list">${[
        ['ضيافة القهوة والشاي','حسب الطلب'],['مشرف ومشرفات للقاعة','حسب الطلب'],['تنظيم واستقبال الضيوف','حسب الطلب'],['تنظيف وتجهيز المساحات','حسب الطلب'],['خدمة تقديم الطعام','حسب الطلب'],['خدمة صف السيارات','حسب الطلب']
      ].map(([title,status])=>`<div><span>${icon('check')}${title}</span><small class="${status==='حسب الطلب'?'optional':''}">${status}</small></div>`).join('')}</div>
    </section>
  </div>`;
  const nav=document.querySelector('.hall-section-nav');
  nav.innerHTML='<a href="#hall-capacity" class="active">السعة</a><a href="#hall-rooms">صور الأقسام</a><a href="#hall-access">المواقف</a><a href="#hall-amenities">المرافق</a><a href="#hall-services">الخدمات</a><a href="#hall-location">الموقع</a>';
  const quick=document.createElement('button');quick.type='button';quick.className='hall-compare-button hall-inline-compare';quick.dataset.compareHall='';quick.setAttribute('aria-pressed','false');quick.innerHTML=`${icon('compare')}<span>أضف للمقارنة</span>`;document.querySelector('.hall-tags').append(quick);
  document.querySelector('#compare-hall').dataset.compareHall='';
}
