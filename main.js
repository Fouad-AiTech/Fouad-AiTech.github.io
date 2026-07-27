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

// ── misc ─────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();
