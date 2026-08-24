const toggle = document.querySelector('.navbar__toggle');
const social = document.querySelector('.navbar__social');

if (toggle && social) {
  toggle.addEventListener('click', () => {
    const isOpen = social.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen);
  });
}

const header = document.querySelector('.site-header');

if (header) {
  const updateScrolled = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  };
  updateScrolled();
  window.addEventListener('scroll', updateScrolled, { passive: true });
}

// ── TEMA CHIARO / SCURO ──
const THEME_KEY = 'theme';
const themeToggle = document.querySelector('.navbar__theme-toggle');

function currentTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme, persist) {
  document.documentElement.setAttribute('data-theme', theme);
  if (persist) localStorage.setItem(THEME_KEY, theme);
  if (themeToggle) {
    // icona provvisoria: sole se sei in dark (per passare a light), luna se sei in light
    themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  }
}

applyTheme(currentTheme(), false);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = (document.documentElement.getAttribute('data-theme') || currentTheme()) === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  });
}
