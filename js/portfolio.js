const PORTFOLIO_SECTIONS = {
  'success-projects': 'success',
  'independent-projects': 'independent'
};

function getPortfolioFilter() {
  const hash = window.location.hash.replace('#', '');
  return PORTFOLIO_SECTIONS[hash] || null;
}

function applyPortfolioView() {
  const page = document.querySelector('.portfolio-page');
  if (!page) return;

  const filter = getPortfolioFilter();

  page.classList.remove('is-view-all', 'is-filter-success', 'is-filter-independent');
  if (filter === 'success') {
    page.classList.add('is-filter-success');
  } else if (filter === 'independent') {
    page.classList.add('is-filter-independent');
  } else {
    page.classList.add('is-view-all');
  }

  document.querySelectorAll('.navbar__dropdown-link[href*="portfolio.html#"]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const linkHash = href.includes('#') ? href.split('#')[1] : '';
    link.classList.toggle('is-active', Boolean(filter && linkHash === window.location.hash.replace('#', '')));
  });

  if (filter) {
    const target = document.getElementById(`${filter === 'success' ? 'success' : 'independent'}-projects`);
    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function initPortfolioCarousels() {
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.portfolio-carousel__track');
    const prev = carousel.querySelector('.portfolio-carousel__btn--prev');
    const next = carousel.querySelector('.portfolio-carousel__btn--next');
    if (!track) return;

    const scrollStep = () => Math.max(track.clientWidth * 0.75, 240);

    prev?.addEventListener('click', () => {
      track.scrollBy({ left: -scrollStep(), behavior: 'smooth' });
    });

    next?.addEventListener('click', () => {
      track.scrollBy({ left: scrollStep(), behavior: 'smooth' });
    });
  });
}

window.addEventListener('hashchange', applyPortfolioView);
applyPortfolioView();
initPortfolioCarousels();
