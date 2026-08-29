// ── FRECCIA INDIETRO (case study + pagine categoria portfolio) ──
function isWorkDetailPage() {
  return /^lavoro-\d+\.html$/i.test(
    window.location.pathname.split('/').pop() || ''
  );
}

function isPortfolioCategoryPage() {
  const page = window.location.pathname.split('/').pop() || '';
  return page === 'success-projects.html' || page === 'independent-projects.html';
}

function initBackButton() {
  const isWork = isWorkDetailPage();
  const isCategory = isPortfolioCategoryPage();
  if (!isWork && !isCategory) return;
  if (document.querySelector('.work-back')) return;

  if (isWork) {
    document.body.classList.add('is-work-detail');
  }
  if (isCategory) {
    document.body.classList.add('is-portfolio-category');
  }

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'work-back';
  back.setAttribute('aria-label', 'Torna indietro');
  back.setAttribute('data-i18n-aria-label', 'a11y.back');
  back.innerHTML = `<svg class="work-back__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M19 12H5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
    <path d="M12 19l-7-7 7-7" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  back.addEventListener('click', () => {
    if (isCategory) {
      window.location.assign('portfolio.html');
      return;
    }

    const sameOriginReferrer = document.referrer
      && new URL(document.referrer, window.location.href).origin === window.location.origin;

    if (window.history.length > 1 || sameOriginReferrer) {
      window.history.back();
      return;
    }

    window.location.assign('portfolio.html');
  });

  document.body.insertBefore(back, document.body.firstChild);
}

initBackButton();

const nav = document.querySelector('.navbar');
const toggle = document.querySelector('.navbar__toggle');
const menu = document.querySelector('.navbar__menu');
const langRoot = document.querySelector('.navbar__lang');
const langToggle = document.querySelector('.navbar__lang-toggle');
const DESKTOP_NAV = 768;

function isDesktopNav() {
  return window.innerWidth >= DESKTOP_NAV;
}

function setMenuOpen(open) {
  if (!toggle || !menu) return;
  const next = open && !isDesktopNav();
  menu.classList.toggle('is-open', next);
  toggle.classList.toggle('is-open', next);
  toggle.setAttribute('aria-expanded', String(next));
  document.body.classList.toggle('nav-open', next);
}

function setLangOpen(open) {
  if (!langRoot || !langToggle) return;
  const next = open && !isDesktopNav();
  langRoot.classList.toggle('is-open', next);
  langToggle.setAttribute('aria-expanded', String(next));
}

if (toggle && menu) {
  setMenuOpen(false);

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = !menu.classList.contains('is-open');
    setLangOpen(false);
    setMenuOpen(open);
  });
}

if (langToggle && langRoot) {
  langToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = !langRoot.classList.contains('is-open');
    setMenuOpen(false);
    setLangOpen(open);
  });
}

document.querySelectorAll('.navbar__lang-btn').forEach((btn) => {
  btn.addEventListener('click', () => setLangOpen(false));
});

document.addEventListener('click', (event) => {
  if (!nav || nav.contains(event.target)) return;
  setMenuOpen(false);
  setLangOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  setMenuOpen(false);
  setLangOpen(false);
});

window.addEventListener('resize', () => {
  if (!isDesktopNav()) return;
  setMenuOpen(false);
  setLangOpen(false);
  alignPortfolioDropdown();
});

function alignPortfolioDropdown() {
  const label = document.querySelector('.navbar__dropdown-label');
  const dropdown = document.querySelector('.navbar__dropdown');
  const item = document.querySelector('.navbar__item--dropdown');
  if (!label || !dropdown || !item) return;

  if (!isDesktopNav()) {
    dropdown.style.removeProperty('left');
    return;
  }

  if (typeof CSS !== 'undefined' && CSS.supports('anchor-name', '--portfolio-label')) {
    dropdown.style.removeProperty('left');
    return;
  }

  const itemRect = item.getBoundingClientRect();
  const labelRect = label.getBoundingClientRect();
  dropdown.style.left = `${labelRect.left - itemRect.left}px`;
}

alignPortfolioDropdown();

const header = document.querySelector('.site-header');

if (header) {
  const updateScrolled = () => {
    if (document.body.classList.contains('home')) {
      header.classList.remove('scrolled');
      return;
    }
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

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  const statusEl = contactForm.querySelector('.contact-form__status');

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!statusEl) return;

    statusEl.hidden = false;
    statusEl.classList.remove('is-ok', 'is-err');
    statusEl.textContent = '';

    try {
      const data = new FormData(contactForm);
      const picked = contactForm.querySelector('input[name="subject"]:checked');

      if (picked) {
        const label = picked.closest('.contact-feather')?.querySelector('.contact-feather__name')?.textContent?.trim();
        if (label) data.set('subject', label);
        data.set('_subject', 'Nuovo contatto — ' + (label || picked.value));
      }

      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });

      const lang = document.documentElement.lang || 'it';
      const dict = (typeof I18N !== 'undefined' && I18N[lang]) ? I18N[lang] : {};

      if (response.ok) {
        contactForm.reset();
        statusEl.classList.add('is-ok');
        statusEl.textContent = dict['contact.ok'] || 'Sent.';
      } else {
        statusEl.classList.add('is-err');
        statusEl.textContent = dict['contact.err'] || 'Error.';
      }
    } catch (err) {
      const lang = document.documentElement.lang || 'it';
      const dict = (typeof I18N !== 'undefined' && I18N[lang]) ? I18N[lang] : {};
      statusEl.classList.add('is-err');
      statusEl.textContent = dict['contact.err'] || 'Error.';
    }
  });
}
