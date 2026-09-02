// ── SESSIONE SITO (navigazione interna → niente intro in home) ──
(function loadColoradoNav() {
  if (document.querySelector('script[data-colorado-nav]')) return;
  const script = document.createElement('script');
  script.src = 'js/nav.js';
  script.setAttribute('data-colorado-nav', '');
  document.head.appendChild(script);
})();

function markSiteSession() {
  try {
    const onHome = document.body.classList.contains('home');
    const introPending = document.body.classList.contains('home-intro-active');
    if (!onHome || !introPending) {
      sessionStorage.setItem('colorado_session', '1');
    }
  } catch (err) {
    /* storage blocked */
  }
}

// ── ICONE UI (SVG custom in img/icons/) ──
const UI_ICON_FILES = {
  moon: 'img/icons/moon.svg',
  sun: 'img/icons/sun.svg',
  extlink: 'img/icons/extlink.svg',
  download: 'img/icons/download.svg',
  'arrow-left': 'img/icons/arrow.svg',
  dropdown: 'img/icons/dropdown.svg',
};

const UI_ICON_TARGETS = [
  { selector: '.site-footer__email-arrow', icon: 'extlink' },
  { selector: '.contact-card__submit-arrow', icon: 'extlink' },
  { selector: '.work-download__arrow', icon: 'download' },
  { selector: '.navbar__dropdown-chevron', icon: 'dropdown' },
  { selector: '.portfolio-filter__chevron', icon: 'dropdown' },
];

function mountUiIcon(el, iconName) {
  if (!el || el.dataset.uiIconMounted === '1') return;
  const src = UI_ICON_FILES[iconName];
  if (!src) return;

  el.textContent = '';
  el.classList.add('ui-icon', `ui-icon--${iconName}`);

  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  img.decoding = 'async';
  img.width = 24;
  img.height = 24;
  if (iconName === 'arrow-left') {
    el.classList.add('ui-icon--flip');
  }
  el.appendChild(img);
  el.dataset.uiIconMounted = '1';
}

function initUiIcons() {
  UI_ICON_TARGETS.forEach(({ selector, icon }) => {
    document.querySelectorAll(selector).forEach((el) => mountUiIcon(el, icon));
  });
}

function setThemeToggleIcon(theme, themeToggle) {
  if (!themeToggle) return;
  themeToggle.textContent = '';
  const wrap = document.createElement('span');
  wrap.className = `ui-icon ui-icon--${theme === 'dark' ? 'sun' : 'moon'}`;
  wrap.setAttribute('aria-hidden', 'true');

  const img = document.createElement('img');
  img.src = UI_ICON_FILES[theme === 'dark' ? 'sun' : 'moon'];
  img.alt = '';
  img.decoding = 'async';
  img.width = 28;
  img.height = 28;
  wrap.appendChild(img);
  themeToggle.appendChild(wrap);
}

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

function initBackButton(signal) {
  document.querySelector('.work-back')?.remove();

  const isWork = isWorkDetailPage();
  const isCategory = isPortfolioCategoryPage();
  if (!isWork && !isCategory) return;

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
  back.innerHTML = '<span class="ui-icon ui-icon--arrow-left ui-icon--flip work-back__icon" aria-hidden="true"><img src="img/icons/arrow.svg" alt="" width="40" height="40" decoding="async"></span>';

  back.addEventListener('click', () => {
    if (isCategory) {
      if (typeof window.coloradoNavigate === 'function') {
        window.coloradoNavigate('portfolio.html');
      } else {
        window.location.assign('portfolio.html');
      }
      return;
    }

    const sameOriginReferrer = document.referrer
      && new URL(document.referrer, window.location.href).origin === window.location.origin;

    if (window.history.length > 1 || sameOriginReferrer) {
      window.history.back();
      return;
    }

    if (typeof window.coloradoNavigate === 'function') {
      window.coloradoNavigate('portfolio.html');
    } else {
      window.location.assign('portfolio.html');
    }
  }, { signal });

  document.body.insertBefore(back, document.body.firstChild);
}

const DESKTOP_NAV = 768;
const THEME_KEY = 'theme';

let pageAbort = new AbortController();

function isDesktopNav() {
  return window.innerWidth >= DESKTOP_NAV;
}

function setMenuOpen(open, toggle, menu) {
  if (!toggle || !menu) return;
  const next = open && !isDesktopNav();
  menu.classList.toggle('is-open', next);
  toggle.classList.toggle('is-open', next);
  toggle.setAttribute('aria-expanded', String(next));
  document.body.classList.toggle('nav-open', next);
}

function setLangOpen(open, langRoot, langToggle) {
  if (!langRoot || !langToggle) return;
  const next = open && !isDesktopNav();
  langRoot.classList.toggle('is-open', next);
  langToggle.setAttribute('aria-expanded', String(next));
}

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

function closePortfolioDropdown() {
  const item = document.querySelector('.navbar__item--dropdown');
  const trigger = document.getElementById('navbar-portfolio-trigger');
  if (!item || !trigger) return;
  item.classList.remove('is-open', 'is-collapsed');
  trigger.setAttribute('aria-expanded', 'false');
}

function initPortfolioDropdown(signal) {
  const trigger = document.getElementById('navbar-portfolio-trigger');
  const item = document.querySelector('.navbar__item--dropdown');
  const chevron = trigger?.querySelector('.navbar__dropdown-chevron');
  if (!trigger || !item || !chevron) return;

  trigger.addEventListener('click', (event) => {
    if (!isDesktopNav()) return;
    if (!chevron.contains(event.target)) return;
    event.preventDefault();
    event.stopPropagation();

    const open = !item.classList.contains('is-open');
    item.classList.toggle('is-open', open);
    item.classList.toggle('is-collapsed', !open);
    trigger.setAttribute('aria-expanded', String(open));
  }, { signal });

  item.addEventListener('mouseleave', () => {
    if (!isDesktopNav()) return;
    item.classList.remove('is-collapsed', 'is-open');
    trigger.setAttribute('aria-expanded', 'false');
  }, { signal });
}

function currentTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme, persist, themeToggle) {
  document.documentElement.setAttribute('data-theme', theme);
  if (persist) localStorage.setItem(THEME_KEY, theme);
  if (themeToggle) {
    setThemeToggleIcon(theme, themeToggle);
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  }
}

function initContactForm(signal) {
  const contactForm = document.querySelector('.contact-form');
  if (!contactForm) return;

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
  }, { signal });
}

function loadAmbientAudio() {
  if (document.querySelector('script[data-colorado-audio]') || document.getElementById('ambient-audio')) return;
  const script = document.createElement('script');
  script.src = 'js/audio.js';
  script.setAttribute('data-colorado-audio', '');
  document.body.appendChild(script);
}

function initWorkGalleryPage() {
  if (!document.querySelector('.work-gallery')) return;
  document.body.classList.add('work-gallery-page');
  if (document.querySelector('script[data-colorado-work-gallery]')) return;
  const script = document.createElement('script');
  script.src = 'js/work-gallery.js';
  script.setAttribute('data-colorado-work-gallery', '');
  document.body.appendChild(script);
}

function initWorkPdfViewer() {
  if (!document.querySelector('.work-pdf')) return;
  if (document.querySelector('script[data-colorado-work-pdf]')) return;
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'js/work-pdf.js';
  script.setAttribute('data-colorado-work-pdf', '');
  document.body.appendChild(script);
}

function initWorkProjectsNav() {
  if (!document.querySelector('main') || !/^lavoro-\d+\.html$/i.test(window.location.pathname.split('/').pop() || '')) return;
  if (document.querySelector('script[data-colorado-work-projects-nav]')) return;
  const script = document.createElement('script');
  script.src = 'js/work-projects-nav.js';
  script.setAttribute('data-colorado-work-projects-nav', '');
  document.body.appendChild(script);
}

function coloradoInitPage() {
  pageAbort.abort();
  pageAbort = new AbortController();
  const { signal } = pageAbort;

  markSiteSession();

  const nav = document.querySelector('.navbar');
  const toggle = document.querySelector('.navbar__toggle');
  const menu = document.querySelector('.navbar__menu');
  const langRoot = document.querySelector('.navbar__lang');
  const langToggle = document.querySelector('.navbar__lang-toggle');
  const themeToggle = document.querySelector('.navbar__theme-toggle');
  const header = document.querySelector('.site-header');

  if (toggle && menu) {
    setMenuOpen(false, toggle, menu);
    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = !menu.classList.contains('is-open');
      setLangOpen(false, langRoot, langToggle);
      setMenuOpen(open, toggle, menu);
    }, { signal });
  }

  if (langToggle && langRoot) {
    langToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = !langRoot.classList.contains('is-open');
      setMenuOpen(false, toggle, menu);
      setLangOpen(open, langRoot, langToggle);
    }, { signal });
  }

  document.querySelectorAll('.navbar__lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => setLangOpen(false, langRoot, langToggle), { signal });
  });

  document.addEventListener('click', (event) => {
    const portfolioItem = document.querySelector('.navbar__item--dropdown');
    if (portfolioItem && !portfolioItem.contains(event.target)) {
      closePortfolioDropdown();
    }
    if (!nav || nav.contains(event.target)) return;
    setMenuOpen(false, toggle, menu);
    setLangOpen(false, langRoot, langToggle);
  }, { signal });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closePortfolioDropdown();
    setMenuOpen(false, toggle, menu);
    setLangOpen(false, langRoot, langToggle);
  }, { signal });

  window.addEventListener('resize', () => {
    if (!isDesktopNav()) return;
    setMenuOpen(false, toggle, menu);
    setLangOpen(false, langRoot, langToggle);
    closePortfolioDropdown();
    alignPortfolioDropdown();
  }, { signal });

  alignPortfolioDropdown();
  initPortfolioDropdown(signal);
  initBackButton(signal);
  initContactForm(signal);
  loadAmbientAudio();
  initWorkGalleryPage();
  initWorkPdfViewer();
  initWorkProjectsNav();

  applyTheme(currentTheme(), false, themeToggle);
  initUiIcons();

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = (document.documentElement.getAttribute('data-theme') || currentTheme()) === 'dark' ? 'light' : 'dark';
      applyTheme(next, true, themeToggle);
    }, { signal });
  }

  if (header) {
    const updateScrolled = () => {
      if (document.body.classList.contains('home')) {
        header.classList.remove('scrolled');
        return;
      }
      header.classList.toggle('scrolled', window.scrollY > 50);
    };
    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true, signal });
  }
}

window.coloradoInitPage = coloradoInitPage;
window.initUiIcons = initUiIcons;
coloradoInitPage();
