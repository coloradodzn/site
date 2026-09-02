(function initColoradoNav() {
  if (window.__coloradoNavInit) return;
  window.__coloradoNavInit = true;

  const CORE_SCRIPTS = new Set([
    'js/seo.js',
    'js/main.js',
    'js/i18n.js',
    'js/audio.js',
    'js/nav.js'
  ]);

  const loadedScripts = new Set(
    [...document.querySelectorAll('script[src]')]
      .map((script) => script.getAttribute('src'))
      .filter(Boolean)
  );

  let navigating = false;

  function normalizePath(pathname) {
    return pathname.replace(/\/index\.html$/i, '/').replace(/\/$/, '') || '/';
  }

  function isHomePath(pathname) {
    const normalized = normalizePath(pathname);
    return normalized === '/' || /index\.html$/i.test(pathname);
  }

  function isInternalLink(anchor) {
    try {
      const url = new URL(anchor.href, window.location.href);
      return url.origin === window.location.origin;
    } catch (err) {
      return false;
    }
  }

  function shouldBypass(anchor, event) {
    if (!anchor || anchor.target === '_blank') return true;
    if (anchor.hasAttribute('download')) return true;
    if (anchor.dataset.noSpa !== undefined) return true;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return true;

    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return true;

    return !isInternalLink(anchor);
  }

  function updateHead(doc) {
    document.title = doc.title;

    const nextDesc = doc.querySelector('meta[name="description"]');
    const currentDesc = document.querySelector('meta[name="description"]');
    if (nextDesc && currentDesc) {
      currentDesc.setAttribute('content', nextDesc.getAttribute('content') || '');
    }

    const lang = doc.documentElement.getAttribute('lang');
    if (lang) document.documentElement.setAttribute('lang', lang);
  }

  function loadScript(src, type) {
    const key = src.split('?')[0];
    if (loadedScripts.has(key)) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      if (type) script.type = type;
      script.onload = () => {
        loadedScripts.add(key);
        resolve();
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async function loadPageScripts(doc) {
    const scripts = [...doc.body.querySelectorAll('script[src]')];
    for (const script of scripts) {
      const src = script.getAttribute('src');
      if (!src || CORE_SCRIPTS.has(src)) continue;
      await loadScript(src, script.type || undefined);
    }
  }

  function buildFetchUrl(url) {
    if (isHomePath(url.pathname)) {
      return new URL('index.html', window.location.href).pathname;
    }
    return url.pathname + url.search;
  }

  function applyHomeBodyState() {
    if (!document.body.classList.contains('home')) return;

    document.body.classList.remove('home-intro-active', 'home-intro-sigla', 'home-flow-complete');

    let showIntro = true;
    try {
      if (localStorage.getItem('colorado_intro_seen') === '1') showIntro = false;
      if (sessionStorage.getItem('colorado_session') === '1') showIntro = false;
    } catch (err) {
      /* storage blocked */
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) showIntro = false;
    if (showIntro) document.body.classList.add('home-intro-active');

    const intro = document.getElementById('home-intro');
    if (intro && !showIntro) {
      intro.classList.add('is-hidden');
      intro.classList.remove('is-playing', 'is-gate');
      intro.setAttribute('aria-hidden', 'true');
    }
  }

  async function navigateTo(href, push = true) {
    if (navigating) return;

    const url = new URL(href, window.location.href);
    if (push && url.href === window.location.href) return;

    navigating = true;

    try {
      const response = await fetch(buildFetchUrl(url), {
        credentials: 'same-origin',
        headers: { Accept: 'text/html' }
      });

      if (!response.ok) throw new Error('Navigation failed');

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const audioWidget = document.getElementById('ambient-audio');

      updateHead(doc);
      document.body.className = doc.body.className;
      if (isHomePath(url.pathname)) applyHomeBodyState();

      const fragment = document.createDocumentFragment();
      [...doc.body.childNodes].forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'SCRIPT') return;
        if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
        fragment.appendChild(node.cloneNode(true));
      });

      document.body.replaceChildren(fragment);
      if (audioWidget) document.body.appendChild(audioWidget);

      window.scrollTo(0, 0);
      if (url.hash) {
        requestAnimationFrame(() => {
          document.querySelector(url.hash)?.scrollIntoView();
        });
      }

      if (push) {
        history.pushState({ coloradoNav: true }, '', url.pathname + url.search + url.hash);
      }

      await loadPageScripts(doc);

      if (typeof window.coloradoInitPage === 'function') {
        window.coloradoInitPage();
      }

      document.dispatchEvent(new CustomEvent('colorado:pagechange', {
        detail: { url: url.href }
      }));

      if (typeof i18nApply === 'function' && typeof i18nDetectLang === 'function') {
        i18nApply(i18nDetectLang());
      }
    } catch (err) {
      window.location.assign(url.href);
    } finally {
      navigating = false;
    }
  }

  window.coloradoNavigate = (href) => navigateTo(href, true);

  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href]');
    if (!anchor || shouldBypass(anchor, event)) return;
    event.preventDefault();
    navigateTo(anchor.href, true);
  });

  window.addEventListener('popstate', () => {
    navigateTo(window.location.href, false);
  });

  history.replaceState({ coloradoNav: true }, '', window.location.href);
})();
