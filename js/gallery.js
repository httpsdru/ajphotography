/* ============================================================
   AJ PHOTOGRAPHY — gallery.js
   ============================================================ */

(function () {

  const ROUTES = {
    '':            { name: 'Portfolio',          filter: null },
    'gigs':        { name: 'Gigs',               filter: { type: 'category', value: 'gigs' } },
    'portraits':   { name: 'Portraits',          filter: { type: 'category', value: 'portraits' } },
    'red-carpets': { name: 'Red Carpets',        filter: { type: 'category', value: 'red-carpets' } },
    'fuji-xh1':    { name: 'Fuji XH1',           filter: { type: 'camera',   value: 'fuji-xh1' } },
    'olympus':     { name: 'Olympus OM1n OM2n',  filter: { type: 'camera',   value: 'olympus' } },
    'mamiya-c220': { name: 'Mamiya c3/220',      filter: { type: 'camera',   value: 'mamiya-c220' } },
    'mamiya-s23':  { name: 'Mamiya Standard 23', filter: { type: 'camera',   value: 'mamiya-s23' } },
  };

  const $ = id => document.getElementById(id);

  const el = {
    cursor:     $('cursor'),
    overlay:    $('loading-overlay'),
    overlTitle: $('loading-title'),
    photo:      $('photo'),
    noPhotos:   $('no-photos'),
    photoMeta:  $('photo-meta'),
    mCount:     $('mobile-count'),
    mPhotoInfo: $('mobile-photo-info'),
    navPrev:    $('nav-prev'),
    navNext:    $('nav-next'),
  };

  let allPhotos = [];
  let photos    = [];
  let index     = 0;

  /* ── Boot ───────────────────────────────────────────────── */
  async function boot() {
    setupCursor();
    setupKeyboard();
    setupSwipe();
    setupNavButtons();

    allPhotos = await fetchPhotos();
    navigate(currentHash());

    window.addEventListener('hashchange', () => showOverlay(currentHash()));
  }

  /* ── Fetch ──────────────────────────────────────────────── */
  async function fetchPhotos() {
    try {
      const r = await fetch('/data/photos.json');
      if (!r.ok) throw new Error(r.status);
      const d = await r.json();
      return Array.isArray(d.photos) ? d.photos : [];
    } catch (e) {
      console.warn('Could not load photos.json:', e.message);
      return [];
    }
  }

  function currentHash() {
    return window.location.hash.replace(/^#/, '').toLowerCase().trim();
  }

  /* ── Routing ────────────────────────────────────────────── */
  function showOverlay(hash) {
    const route = ROUTES[hash] || ROUTES[''];
    if (el.overlTitle) el.overlTitle.textContent = route.name;
    const ov = el.overlay;
    ov.style.display = '';
    void ov.offsetWidth;
    ov.classList.remove('out');
    setTimeout(() => navigate(hash), 50);
  }

  function navigate(hash) {
    const { filter } = ROUTES[hash] || ROUTES[''];

    if (!filter) {
      photos = allPhotos.slice();
    } else if (filter.type === 'category') {
      photos = allPhotos.filter(p => p.category === filter.value);
    } else if (filter.type === 'camera') {
      photos = allPhotos.filter(p => p.camera === filter.value);
    }

    index = 0;
    render();
    hideOverlay();
  }

  /* ── Render ─────────────────────────────────────────────── */
  function render() {
    const empty = photos.length === 0;
    if (el.noPhotos) el.noPhotos.style.display = empty ? 'flex' : 'none';
    if (el.photo)    el.photo.style.display     = empty ? 'none' : 'block';
    if (empty) { updateCounter(''); return; }

    const p       = photos[index];
    const counter = `${index + 1} / ${photos.length}`;

    updateCounter(counter);

    if (el.photo) {
      el.photo.classList.add('loading');

      // Pages.cms stores the path as 'image'; manually added entries use 'src'
      el.photo.src = p.src || p.image || '';
      el.photo.alt = p.event || p.theme || '';

      el.photo.onload = () => {
        el.photo.classList.remove('loading');
        // Landscape photos fill the full viewport on desktop
        const isLandscape = el.photo.naturalWidth > el.photo.naturalHeight;
        document.body.classList.toggle('photo-landscape', isLandscape);
      };

      el.photo.onerror = () => {
        el.photo.classList.remove('loading');
        document.body.classList.remove('photo-landscape');
      };
    }

    const parts = [p.event, p.date, p.film ? `on ${p.film}` : null].filter(Boolean);
    const meta  = parts.join('; ');
    if (el.photoMeta)  el.photoMeta.textContent  = meta;
    if (el.mPhotoInfo) el.mPhotoInfo.textContent = meta;
  }

  function updateCounter(text) {
    if (el.cursor) el.cursor.textContent = text;
    if (el.mCount) el.mCount.textContent = text;
  }

  /* ── Overlay ────────────────────────────────────────────── */
  function hideOverlay() {
    const ov = el.overlay;
    if (!ov) return;
    setTimeout(() => {
      ov.classList.add('out');
      ov.addEventListener('transitionend', () => {
        ov.style.display = 'none';
      }, { once: true });
    }, 680);
  }

  /* ── Navigation ─────────────────────────────────────────── */
  function go(dir) {
    if (!photos.length) return;
    index = (index + dir + photos.length) % photos.length;
    render();
  }

  function setupKeyboard() {
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1);
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   go(-1);
    });
  }

  function setupSwipe() {
    let sx = 0, sy = 0;
    document.addEventListener('touchstart', e => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 38) go(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  function setupNavButtons() {
    if (el.navPrev) el.navPrev.addEventListener('click', () => go(-1));
    if (el.navNext) el.navNext.addEventListener('click', () => go(1));
    const panel = document.getElementById('photo-panel');
    if (panel) {
      panel.addEventListener('click', e => {
        const { left, width } = panel.getBoundingClientRect();
        go((e.clientX - left) > width / 2 ? 1 : -1);
      });
    }
  }

  /* ── Cursor ─────────────────────────────────────────────── */
  function setupCursor() {
    const cur = el.cursor;
    if (!cur || !window.matchMedia('(pointer: fine)').matches) return;
    let raf;
    document.addEventListener('mousemove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        cur.style.left = e.clientX + 'px';
        cur.style.top  = e.clientY + 'px';
      });
    });
    document.addEventListener('mouseenter', () => cur.classList.add('visible'));
    document.addEventListener('mouseleave', () => cur.classList.remove('visible'));
  }

  document.addEventListener('DOMContentLoaded', boot);

})();