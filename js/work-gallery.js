(function initWorkGallery() {
  const gallery = document.querySelector('.work-gallery');
  if (!gallery) return;

  const stageImg = gallery.querySelector('.work-gallery__image');
  const thumbs = [...gallery.querySelectorAll('.work-gallery__thumb')];
  if (!stageImg || !thumbs.length) return;

  let activeIndex = thumbs.findIndex((thumb) => thumb.classList.contains('is-active'));
  if (activeIndex < 0) activeIndex = 0;

  function scrollThumbIntoView(thumb) {
    thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  function setActive(index, { focus = false } = {}) {
    const safeIndex = ((index % thumbs.length) + thumbs.length) % thumbs.length;
    activeIndex = safeIndex;
    const thumb = thumbs[safeIndex];

    thumbs.forEach((item, i) => {
      const isActive = i === safeIndex;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', String(isActive));
      item.tabIndex = isActive ? 0 : -1;
    });

    const nextSrc = thumb.dataset.src || thumb.querySelector('img')?.getAttribute('src') || '';
    const nextAlt = thumb.dataset.alt || thumb.querySelector('img')?.getAttribute('alt') || '';

    if (stageImg.getAttribute('src') !== nextSrc) {
      stageImg.classList.add('is-swapping');
      stageImg.addEventListener('load', () => stageImg.classList.remove('is-swapping'), { once: true });
      stageImg.src = nextSrc;
    }

    if (nextAlt) stageImg.alt = nextAlt;

    scrollThumbIntoView(thumb);
    if (focus) thumb.focus();
  }

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => setActive(index));
  });

  gallery.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!gallery.contains(target)) return;

    event.preventDefault();

    if (event.key === 'ArrowLeft') setActive(activeIndex - 1, { focus: true });
    if (event.key === 'ArrowRight') setActive(activeIndex + 1, { focus: true });
    if (event.key === 'Home') setActive(0, { focus: true });
    if (event.key === 'End') setActive(thumbs.length - 1, { focus: true });
  });

  setActive(activeIndex);
})();
