# AJ Photography

Single HTML file · hash routing · no build step.

## Quick start

1. Put font files in `/fonts/` (see fonts/README.txt)
2. Replace `YOUR_INSTAGRAM_HANDLE` in `index.html` (×2)
3. Open with VS Code Live Server to preview
4. Push to GitHub → connect Cloudflare Pages (build command: blank, output: /)

## Gallery URLs

| URL hash           | Gallery              |
|--------------------|----------------------|
| (none)             | Portfolio — all      |
| `#gigs`            | Gigs                 |
| `#portraits`       | Portraits            |
| `#red-carpets`     | Red Carpets          |
| `#fuji-xh1`        | Fuji XH1             |
| `#olympus`         | Olympus OM1n OM2n    |
| `#mamiya-c220`     | Mamiya c3/220        |
| `#mamiya-s23`      | Mamiya Standard 23   |

## Adding photos manually

Edit `data/photos.json`:
  - src: "/images/filename.jpg"
  - category: gigs · portraits · red-carpets
  - camera: fuji-xh1 · olympus · mamiya-c220 · mamiya-s23
  - event, date (DD-MM-YY), film, theme

## Adjusting text colour / size

Edit the variables at the top of `css/style.css`:
  --text:      #c0c0c0   (gray on black via exclusion — change to taste)
  --font-size: 1.1rem    (all body text — one value controls everything)
