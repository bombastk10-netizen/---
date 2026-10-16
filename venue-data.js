const numbers = new Intl.NumberFormat('ar-SA', { useGrouping: false });
export const styleLabels = { classic: 'طابع كلاسيكي', modern: 'طابع عصري', garden: 'مساحات مفتوحة', celebration: 'قاعة احتفالات' };
const field = (key, label) => ({ key, label, value: null });
const group = (id, title, fields) => ({ id, title, fields: fields.map(([key, label]) => field(key, label)), photos: [] });
function emptyContent() {
  return [
    { id: 'hall-information', title: 'معلومات القاعة', groups: [
      group('identity', 'اسم القاعة والواجهة', [['officialName', 'اسم القاعة الرسمي']]),
      { ...group('location', 'العنوان والموقع', [['city', 'المدينة'], ['district', 'الحي'], ['street', 'الشارع'], ['address', 'العنوان'], ['mapsUrl', 'الموقع على الخريطة']]), showPhotos: false },
      { ...group('contact', 'التواصل مع القاعة', [['phone', 'رقم الاتصال'], ['whatsapp', 'رقم الواتساب'], ['contactHours', 'أوقات التواصل']]), showPhotos: false },
    ] },
    { id: 'hall-capacity', title: 'السعة والجلسات', groups: [
      group('men', 'قسم الرجال', [['menCapacity', 'عدد الضيوف'], ['menSeating', 'نوع الجلسات'], ['menHalls', 'عدد الصالات']]),
      group('women', 'قسم النساء', [['womenCapacity', 'عدد الضيفات'], ['womenSeating', 'نوع الجلسات'], ['womenHalls', 'عدد الصالات']]),
      group('furniture', 'الطاولات والكراسي', [['menTables', 'طاولات قسم الرجال'], ['menChairs', 'كراسي قسم الرجال'], ['womenTables', 'طاولات قسم النساء'], ['womenChairs', 'كراسي قسم النساء'], ['furnitureTypes', 'أنواع الطاولات والكراسي'], ['rearrangement', 'إمكانية تغيير التوزيع']]),
      group('additional', 'الجلسات الإضافية', [['additionalSeating', 'المجالس والجلسات المتوفرة'], ['additionalCapacity', 'سعة كل مساحة']]),
    ] },
    { id: 'hall-dining', title: 'صالات الطعام', groups: [
      group('men-dining', 'صالة طعام الرجال', [['diningMenCapacity', 'عدد الأشخاص في الوقت نفسه'], ['diningMenTables', 'عدد الطاولات'], ['diningMenChairs', 'عدد الكراسي']]),
      group('women-dining', 'صالة طعام النساء', [['diningWomenCapacity', 'عدد الأشخاص في الوقت نفسه'], ['diningWomenTables', 'عدد الطاولات'], ['diningWomenChairs', 'عدد الكراسي']]),
      group('buffet', 'البوفيه وتقديم الطعام', [['buffetLocation', 'موقع البوفيه'], ['servingMethod', 'طريقة التقديم'], ['separateBuffets', 'منطقة مستقلة لكل قسم']]),
    ] },
    { id: 'hall-spaces', title: 'الغرف والمساحات الخاصة', groups: [
      group('groom', 'غرفة العريس', [['groomRoom', 'غرفة العريس'], ['groomCapacity', 'عدد الأشخاص'], ['groomSeating', 'الجلسات'], ['groomAC', 'التكييف'], ['groomBathroom', 'دورة مياه خاصة']]),
      group('bride', 'غرفة العروس', [['brideRoom', 'غرفة العروس'], ['bridePreparation', 'مساحة التجهيز'], ['brideMirrors', 'المرايا'], ['brideLighting', 'الإضاءة'], ['brideSeating', 'الجلسات'], ['brideBathroom', 'دورة مياه خاصة']]),
      group('stage', 'الكوشة والمسرح', [['stageLocation', 'الموقع داخل القاعة'], ['stageDimensions', 'الأبعاد'], ['stageCustomization', 'إمكانية تغيير التجهيز']]),
      group('outdoor', 'المساحات الخارجية', [['outdoorAreas', 'الحديقة والفناء والجلسات'], ['outdoorCapacity', 'سعة كل مساحة'], ['outdoorUse', 'استخدام المساحات']]),
    ] },
    { id: 'hall-access', title: 'مواقف السيارات', groups: [
      group('parking', 'مواقف السيارات', [['parking', 'عدد المواقف'], ['privateParking', 'مواقف خاصة بالقاعة'], ['parkingShade', 'مظللة أو مكشوفة'], ['accessibleParking', 'مواقف مهيأة لذوي الإعاقة']]),
    ] },
  ];
}
// Populate each hall with approved information here. Empty values remain null.
const hallRecords = {
  1: {
    values: {
      officialName: 'القاعة الأولى', city: 'جدة', district: 'حي الصفوة',
      street: 'عبدالحميد الزهراوي', address: '7044 عبدالحميد الزهراوي، حي الصفوة، جدة',
      mapsUrl: 'https://maps.app.goo.gl/wKrqrTgqWnP5YNZy6', phone: '0533599962',
    },
    latitude: 21.8617421, longitude: 39.2256429, zone: 'شمال المدينة',
    album: [
      { name: 'الواجهة الخارجية', src: 'assets/hall-1/photo-4.webp' },
      { name: 'مبنى القاعة والمواقف', src: 'assets/hall-1/photo-6.webp', position: '35% 50%' },
      { name: 'صالة القاعة', src: 'assets/hall-1/photo-1.webp' },
      { name: 'الشاشة والجلسات', src: 'assets/hall-1/photo-2.webp' },
      { name: 'مدخل القاعة', src: 'assets/hall-1/photo-3.webp' },
      { name: 'صالة الطعام', src: 'assets/hall-1/photo-5.webp' },
    ],
    groupPhotos: { identity: [0], furniture: [2, 3], parking: [1] },
  },
};
export const venues = Array.from({ length: 17 }, (_, index) => {
  const id = index + 1, record = hallRecords[id] || {}, values = record.values || {}, album = record.album || [];
  const content = emptyContent();
  for (const section of content) for (const item of section.groups) {
    for (const entry of item.fields) if (Object.hasOwn(values, entry.key)) entry.value = values[entry.key];
    item.photos = (record.groupPhotos?.[item.id] || []).map(i => album[i]).filter(Boolean);
  }
  const value = key => values[key] ?? null;
  const capacity = Number.isFinite(value('menCapacity')) && Number.isFinite(value('womenCapacity')) ? value('menCapacity') + value('womenCapacity') : null;
  return {
    id, name: value('officialName') || `قاعة ${numbers.format(id)}`, officialName: value('officialName'),
    url: `hall-${id}.html`, city: value('city') || '', district: value('district') || '', zone: record.zone || '',
    address: value('address') || '', phone: value('phone') || '', whatsapp: value('whatsapp') || '', mapsUrl: value('mapsUrl') || '',
    latitude: record.latitude ?? null, longitude: record.longitude ?? null,
    capacity, menCapacity: value('menCapacity'), womenCapacity: value('womenCapacity'),
    diningMenCapacity: value('diningMenCapacity'), diningWomenCapacity: value('diningWomenCapacity'), parking: value('parking'),
    style: '', features: [], description: '', photos: album.map(photo => photo.src), album, content, photosProvided: album.length > 0,
  };
});
