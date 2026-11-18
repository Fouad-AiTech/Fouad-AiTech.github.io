// ── theme ────────────────────────────────────────────
const root = document.documentElement;
const stored = localStorage.getItem('theme');
if (stored) root.setAttribute('data-theme', stored);
else if (window.matchMedia('(prefers-color-scheme: light)').matches) root.setAttribute('data-theme', 'light');

document.getElementById('themeToggle').addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ── nav state + progress + active link ───────────────
const nav = document.getElementById('nav');
const progress = document.getElementById('progress');
const navLinks = [...document.querySelectorAll('.nav-pill a[href^="#"]')];
const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle('stuck', y > 14);

  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = max > 0 ? `${(y / max) * 100}%` : '0%';

  let current = null;
  for (const s of sections) {
    if (s.getBoundingClientRect().top <= window.innerHeight * 0.4) current = s;
  }
  navLinks.forEach(a => a.classList.toggle('active', !!current && a.getAttribute('href') === `#${current.id}`));
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── mobile menu ──────────────────────────────────────
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

menuBtn.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('show');
  menuBtn.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
});
mobileMenu.addEventListener('click', e => {
  if (e.target.tagName !== 'A') return;
  mobileMenu.classList.remove('show');
  menuBtn.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
});

// ── reveal on scroll ─────────────────────────────────
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    io.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.up').forEach(el => io.observe(el));

// ── count-up numbers ─────────────────────────────────
const counters = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    counters.unobserve(el);

    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1100;
    const start = performance.now();

    const tick = now => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + (t === 1 ? suffix : '');
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-count]').forEach(el => counters.observe(el));

// ── cursor glow + card spotlight ─────────────────────
const glow = document.getElementById('cursorGlow');
let gx = 0, gy = 0, cx = 0, cy = 0;

window.addEventListener('pointermove', e => {
  gx = e.clientX; gy = e.clientY;
}, { passive: true });

(function loop() {
  cx += (gx - cx) * 0.09;
  cy += (gy - cy) * 0.09;
  glow.style.transform = `translate(${cx}px, ${cy}px)`;
  requestAnimationFrame(loop);
})();

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// ── project galleries ────────────────────────────────
const GALLERIES = {
  tawsil:         { title: 'Tawsil',           ext: 'jpeg', count: 7 },
  imraa:          { title: 'Imraa',            ext: 'jpeg', count: 4 },
  tabibi:         { title: 'Tabibi',           ext: 'jpeg', count: 4 },
  la_famille_auto:{ title: 'La Famille Auto',  ext: 'jpeg', count: 4 },
  karya:          { title: 'Karya-auto',       ext: 'jpeg', count: 4 },
  debieb_graphic: { title: 'Debieb Graphique', ext: 'webp', count: 4 },
  lila:           { title: 'Lila',             ext: 'jpeg', count: 2 },
  cita:           { title: 'Cita',             ext: 'jpeg', count: 3 },
  para_pharmacy:  { title: 'Parapharmacie',    ext: 'jpeg', count: 4 },
};

const srcsFor = key => {
  const g = GALLERIES[key];
  return Array.from({ length: g.count }, (_, i) => `assets/projects/${key}/${i + 1}.${g.ext}`);
};

const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbTitle = document.getElementById('lbTitle');
const lbCounter = document.getElementById('lbCounter');
const lbThumbs = document.getElementById('lbThumbs');

let shots = [];
let index = 0;
let lastFocus = null;

function show(i) {
  index = (i + shots.length) % shots.length;
  lbImg.src = shots[index];
  lbImg.alt = `${lbTitle.textContent} — screen ${index + 1}`;
  lbCounter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(shots.length).padStart(2, '0')}`;
  [...lbThumbs.children].forEach((t, n) => t.classList.toggle('on', n === index));
  // restart the entry animation
  lbImg.style.animation = 'none';
  void lbImg.offsetWidth;
  lbImg.style.animation = '';
}

function openGallery(key, startAt = 0) {
  const g = GALLERIES[key];
  if (!g) return;

  lastFocus = document.activeElement;
  shots = srcsFor(key);
  lbTitle.textContent = g.title;

  lbThumbs.innerHTML = '';
  shots.forEach((src, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Show screen ${i + 1}`);
    b.innerHTML = `<img src="${src}" alt="" loading="lazy" />`;
    b.addEventListener('click', () => show(i));
    lbThumbs.appendChild(b);
  });

  lb.hidden = false;
  document.body.classList.add('lb-lock');
  requestAnimationFrame(() => lb.classList.add('open'));
  show(startAt);
  document.getElementById('lbClose').focus();
}

function closeGallery() {
  lb.classList.remove('open');
  document.body.classList.remove('lb-lock');
  setTimeout(() => { lb.hidden = true; lbImg.src = ''; }, 320);
  if (lastFocus) lastFocus.focus();
}

document.querySelectorAll('.card.shot .media').forEach(btn => {
  btn.addEventListener('click', () => openGallery(btn.closest('.card').dataset.gallery));
});

document.getElementById('lbClose').addEventListener('click', closeGallery);
document.getElementById('lbPrev').addEventListener('click', () => show(index - 1));
document.getElementById('lbNext').addEventListener('click', () => show(index + 1));
lb.querySelector('[data-close]').addEventListener('click', closeGallery);

document.addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeGallery();
  if (e.key === 'ArrowLeft') show(index - 1);
  if (e.key === 'ArrowRight') show(index + 1);
});

// swipe on touch
let touchX = null;
lb.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 55) show(index + (dx < 0 ? 1 : -1));
  touchX = null;
}, { passive: true });

// ── misc ─────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();
