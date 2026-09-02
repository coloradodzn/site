function initPortfolioCarousels() {
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    if (carousel.dataset.carouselInit === '1') return;

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

    carousel.dataset.carouselInit = '1';
  });
}

initPortfolioCarousels();
document.addEventListener('colorado:pagechange', initPortfolioCarousels);
