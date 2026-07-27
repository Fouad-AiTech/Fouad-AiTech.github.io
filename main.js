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

// ── nav state + scroll progress ──────────────────────
const nav = document.getElementById('nav');
const progress = document.getElementById('scrollProgress');
const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = navLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle('stuck', y > 12);

  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = max > 0 ? `${(y / max) * 100}%` : '0%';

  let current = null;
  for (const s of sections) {
    if (s.getBoundingClientRect().top <= window.innerHeight * 0.35) current = s;
  }
  navLinks.forEach(a => a.classList.toggle('active', current && a.getAttribute('href') === `#${current.id}`));
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

// ── scroll reveal ────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i % 6, 5) * 70}ms`;
  observer.observe(el);
});

// ── project card spotlight ───────────────────────────
document.querySelectorAll('.proj').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// ── misc ─────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();
