# Japan Bound Education

## What it is
A marketing site for an educational consultancy that helps high-school students from South Asia
(Pakistan, India, Bangladesh, Nepal) apply to and settle into Japanese universities.

Register: **brand** — design IS the product. Single-page marketing site, no app UI.

## Audience
Two readers with different needs, on the same page:
- **Students** — aspirational, scanning, want to know if this is possible for them.
- **Parents** — cautious, decision-makers, want safety, cost and support answered plainly.

## Voice
Plain and honest, not salesy. The site deliberately avoids invented statistics and guarantees.
Copy is client-supplied and should be preserved as written unless they ask otherwise.

## Brand
- Ink `#15120F`, brand red `#BC002D`, paper `#fbf8f7` (matched to the hero artwork's own background).
- Japanese ink-wash aesthetic: real watercolor plum-branch artwork in the hero, brush calligraphy
  (`日本で、夢を叶える`, Yuji Mai) that writes itself in on load.
- Logo: a red medallion with a torii-gate-and-graduation-cap silhouette knocked out of it.
- Typography is system-fallback by client request (Iowan Old Style / Georgia serif + system sans).
  Do NOT introduce webfonts for body or headings; the one exception is the Japanese calligraphy.

## Constraints
- Single self-contained `index.html`. No build step, no framework.
- GSAP + ScrollTrigger are available; three.js was deliberately removed.
- `Website_Overview.png` is the hero artwork; `logo/` holds brand exports.
- A backup copy of the site exists outside this file; redesign work happens in `index.html`.

## Current design problem (2026-09, client brief)
Sections read as one undifferentiated scroll: four consecutive sections are all "numbered list of
items, each a heading + paragraph in a hairline box" (27 numbered items in a row). Why Japan and
For Parents use the *identical* component. Every section opens with the same eyebrow + h2 + lead.
Goal: keep all the information, but give each section its own layout logic so the page has rhythm.
