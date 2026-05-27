/* gallery.js — AJ Photography SPA */
'use strict';
 
// ─── Routes ───────────────────────────────────────────────────
const ROUTES = {
  '':            { label: 'Portfolio',    filter: () => true },
  'gigs':        { label: 'Gigs',         filter: p => p.category === 'gigs' },
  'portraits':   { label: 'Portraits',    filter: p => p.category === 'portraits' },
  'red-carpets': { label: 'Red Carpets',  filter: p => p.category === 'red-carpets' },
  'fuji-xh1':   { label: 'Fuji XH1',     filter: p => p.camera === 'fuji-xh1' },
  'olympus':     { label: 'Olympus',      filter: p => p.camera === 'olympus' },
  'mamiya-c220': { label: 'Mamiya C220',  filter: p => p.camera === 'mamiya-c220' },
  'mamiya-s23':  { label: 'Mamiya S23',   filter: p => p.camera === 'mamiya-s23' },
};
 
// ─── State ────────────────────────────────────────────────────
let allPhotos  = [];
let photos     = [];
let index      = 0;
 
// ─── Elements ─────────────────────────────────────────────────
const el = {
  cursor:       document.getElementById('cursor'),
  overlay:      document.getElementById('loading-overlay'),
  loadingTitle: document.getElementById('loading-title'),
  photo:        document.getElementById('photo'),
  noPhotos:     document.getElementById('no-photos'),
  photoMeta:    document.getElementById('photo-meta'),
  mCount:       document.getElementById('mobile-count'),
  mPhotoInfo:   document.getElementById('mobile-photo-info'),
  navPrev:      document.getElementById('nav-prev'),
  navNext:      document.getElementById('nav-next'),
};
 
// ─── Cursor ───────────────────────────────────────────────────
document.addEventListener('mousemove', e => {
  el.cursor.style.left = e.clientX + 'px';
  el.cursor.style.top  = e.clientY + 'px';
});
 
function updateCursor() {
  if (!photos.length) { el.cursor.textContent = ''; return; }
  el.cursor.textContent = `${index + 1} / ${photos.length}`;
}
 
// ─── Fetch ────────────────────────────────────────────────────
async function fetchPhotos() {
  try {
    const res = await fetch('/data/photos.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const d = await res.json();
    return Array.isArray(d.photos) ? d.photos : [];
  } catch (e) {
    console.warn('Could not load photos.json:', e);
    return [];
  }
}
 
// ─── Render ───────────────────────────────────────────────────
function buildMeta(p) {
  const parts = [];
  if (p.event)  parts.push(p.event);
  if (p.date)   parts.push(p.date);
  if (p.film)   parts.push(p.film);
  if (p.theme)  parts.push(p.theme);
  return parts.join(' · ');
}
 
function render() {
  if (!photos.length) {
    el.photo.src = '';
    el.photo.alt = '';
    el.noPhotos.classList.add('visible');
    el.photoMeta.textContent = '';
    el.mCount.textContent = '';
    el.mPhotoInfo.textContent = '';
    document.body.classList.remove('photo-landscape');
    updateCursor();
    return;
  }
 
  el.noPhotos.classList.remove('visible');
  const p = photos[index];
  const src = p.src || p.image || '';
  const meta = buildMeta(p);
 
  // blur while loading
  el.photo.classList.add('loading');
  el.photo.onload = () => {
    el.photo.classList.remove('loading');
    const isLandscape = el.photo.naturalWidth > el.photo.naturalHeight;
    document.body.classList.toggle('photo-landscape', isLandscape);
  };
  el.photo.onerror = () => {
    el.photo.classList.remove('loading');
    document.body.classList.remove('photo-landscape');
  };
 
  el.photo.src = src;
  el.photo.alt = p.event || '';
 
  el.photoMeta.textContent    = meta;
  el.mPhotoInfo.textContent   = meta;
  el.mCount.textContent       = `${index + 1} / ${photos.length}`;
 
  updateCursor();
}
 
// ─── Navigation ───────────────────────────────────────────────
function go(dir) {
  if (!photos.length) return;
  index = (index + dir + photos.length) % photos.length;
  render();
}
 
el.navPrev.addEventListener('click', () => go(-1));
el.navNext.addEventListener('click', () => go(1));
 
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  go(-1);
  if (e.key === 'ArrowRight') go(1);
});
 
// Click left / right half of photo panel
document.getElementById('photo-panel').addEventListener('click', e => {
  const mid = e.currentTarget.getBoundingClientRect().left
            + e.currentTarget.offsetWidth / 2;
  go(e.clientX < mid ? -1 : 1);
});
 
// Touch swipe
let touchX = null;
document.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  touchX = null;
  if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
});
 
// ─── Routing ──────────────────────────────────────────────────
function route() {
  const hash  = location.hash.replace(/^#\/?/, '');
  const route = ROUTES[hash] || ROUTES[''];
  index  = 0;
  photos = allPhotos.filter(route.filter);
 
  // update loading title to gallery name
  el.loadingTitle.textContent = route.label;
 
  render();
}
 
window.addEventListener('hashchange', route);
 
// ─── Boot ─────────────────────────────────────────────────────
(async () => {
  allPhotos = await fetchPhotos();
 
  // hide overlay
  el.overlay.classList.add('hidden');
 
  route();
})();