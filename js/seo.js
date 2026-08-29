(function () {
  // Impostare l'URL di produzione al deploy (es. https://www.coloradodesign.it)
  const SITE_URL = 'https://www.coloradodesign.it';

  function getPagePath() {
    const path = window.location.pathname.replace(/\\/g, '/');
    const page = path.split('/').pop() || 'index.html';
    return page === '' ? 'index.html' : page;
  }

  function getPageUrl() {
    const page = getPagePath();
    if (SITE_URL) {
      return page === 'index.html' ? `${SITE_URL}/` : `${SITE_URL}/${page}`;
    }
    return window.location.href.split(/[?#]/)[0];
  }

  function getImageUrl() {
    if (SITE_URL) return `${SITE_URL}/img/mainback.jpg`;
    try {
      return new URL('img/mainback.jpg', window.location.href).href;
    } catch {
      return 'img/mainback.jpg';
    }
  }

  function upsertMeta(attr, name, content) {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function upsertLink(rel, href) {
    if (!href) return;
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
  }

  const title = document.title.trim();
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
  const url = getPageUrl();
  const image = getImageUrl();
  const lang = document.documentElement.lang || 'it';

  upsertMeta('name', 'robots', 'index, follow');
  upsertLink('canonical', url);

  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:site_name', 'Colorado Design');
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:url', url);
  upsertMeta('property', 'og:image', image);
  upsertMeta('property', 'og:locale', lang === 'it' ? 'it_IT' : `${lang}_${lang.toUpperCase()}`);

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', image);

  if (document.body.classList.contains('home')) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Colorado Design',
      url: SITE_URL || url,
      email: 'info.coloradodesign@gmail.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Rome',
        addressCountry: 'IT'
      },
      sameAs: [
        'https://www.instagram.com/colorado.design/',
        'https://www.behance.net/coloradodzn',
        'https://www.linkedin.com/in/colorado-design-977297308/'
      ]
    });
    document.head.appendChild(script);
  }
})();
