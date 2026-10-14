# مصادر الصور والخطوط

صور القاعة الأولى قدّمها صاحب الموقع.

## Photographs

All paths below are relative to `assets/photos/`. Images are locally hosted JPEGs. The hero is 1440px wide; venue images are 1200px wide, except venue-7 at 900px. Files range from 162KB to 232KB.

| File | Content | Photographer | Original source and license |
|---|---|---|---|
| `hero.jpg` | Cream and champagne wedding hall, floral aisle arches, chandeliers and a bridal stage. | Simply thrilled | [Unsplash original](https://unsplash.com/photos/elegant-wedding-reception-hall-with-floral-archway-and-white-decor-65mh04qlcBU) · [Unsplash License](https://unsplash.com/license) |
| `venue-1.jpg` | Expansive gold hall with chandeliers, cream sofas and a central red carpet. | Raj | [Pexels original](https://www.pexels.com/photo/luxurious-wedding-hall-interior-with-chandeliers-33852450/) · [Pexels License](https://www.pexels.com/license/) |
| `venue-2.jpg` | Elegant cream ballroom, crystal chandeliers and round banquet tables. | Rene Terp | [Pexels original](https://www.pexels.com/photo/crystal-chandeliers-hanging-above-tables-13834493/) · [Pexels License](https://www.pexels.com/license/) |
| `venue-3.jpg` | Modern hall with white floral tables, black chairs, glass walls and greenery. | Matheus Bertelli | [Pexels original](https://www.pexels.com/photo/luxury-wedding-space-17315416/) · [Pexels License](https://www.pexels.com/license/) |
| `venue-4.jpg` | Warm gold chandelier hall with floral bridal stage and cream seating. | The Visionary Vows | [Pexels original](https://www.pexels.com/photo/elegant-wedding-hall-with-luxurious-decor-33914530/) · [Pexels License](https://www.pexels.com/license/) |
| `venue-5.jpg` | Airy white hall with exposed beams, chandeliers and long banquet tables. | Shepherd Yuriel | [Pexels original](https://www.pexels.com/photo/elegant-wedding-reception-venue-with-chandeliers-30219469/) · [Pexels License](https://www.pexels.com/license/) |
| `venue-6.jpg` | Evening reception hall with mirrored tables and lush pink floral decor. | Matheus Bertelli | [Pexels original](https://www.pexels.com/photo/floral-decor-of-wedding-reception-venue-16120230/) · [Pexels License](https://www.pexels.com/license/) |
| `venue-7.jpg` | Tall historic cream hall with crystal chandeliers and white banquet tables; portrait orientation. | Valerie | [Pexels original](https://www.pexels.com/photo/elegant-banquet-hall-with-crystal-chandeliers-29703684/) · [Pexels License](https://www.pexels.com/license/) |
| `venue-8.jpg` | White-flower table setting, warm timber furniture and hanging lights. | Jonathan Borba | [Pexels original](https://www.pexels.com/photo/wedding-venue-with-table-setting-and-white-flowers-12876485/) · [Pexels License](https://www.pexels.com/license/) |

Images were downloaded from the original platforms' image CDNs, resized and compressed by their image services. No AI-generated venue photography is used.

Pexels download pattern: `https://images.pexels.com/photos/PHOTO_ID/pexels-photo-PHOTO_ID.jpeg?auto=compress&cs=tinysrgb&w=1200&q=80` (venue-7 uses `w=900&q=75`; venue-4 uses `q=82`).

Hero download URL: `https://images.unsplash.com/photo-1779308936221-89739e035a53?auto=format&fit=crop&fm=jpg&q=80&w=1440`.

## Arabic typography

IBM Plex Sans Arabic, weights 400, 500, 600 and 700, with Arabic and Latin WOFF2 subsets is self-hosted in `assets/fonts/`.

- Add `assets/fonts/fonts.css` to the page for local font loading.
- Font family: `IBM Plex Sans Arabic`.
- Source: [Google Fonts family repository](https://github.com/google/fonts/tree/main/ofl/ibmplexsansarabic).
- Google Fonts stylesheet used: `https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap`.
- License: SIL Open Font License 1.1. The complete license is included locally as `assets/fonts/OFL.txt`.
- Eight WOFF2 font files total approximately 257KB; each weight loads only its required subsets. `font-display: swap` avoids invisible text during font loading.
