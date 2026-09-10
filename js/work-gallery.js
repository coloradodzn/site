(function initWorkGallery() {
  const gallery = document.querySelector('.work-gallery');
  if (!gallery) return;

  const stageImg = gallery.querySelector('.work-gallery__image');
  const stageVideo = gallery.querySelector('.work-gallery__video');
  const thumbs = [...gallery.querySelectorAll('.work-gallery__thumb')];
  if ((!stageImg && !stageVideo) || !thumbs.length) return;

  const prevBtn = gallery.querySelector('.work-gallery__btn--prev');
  const nextBtn = gallery.querySelector('.work-gallery__btn--next');
  const currentEl = gallery.querySelector('.work-gallery__current');
  const totalEl = gallery.querySelector('.work-gallery__total');

  if (totalEl) totalEl.textContent = String(thumbs.length);

  let activeIndex = thumbs.findIndex((thumb) => thumb.classList.contains('is-active'));
  if (activeIndex < 0) activeIndex = 0;

  function scrollThumbIntoView(thumb) {
    thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  function updateButtons() {
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = activeIndex <= 0;
    nextBtn.disabled = activeIndex >= thumbs.length - 1;
  }

  function pauseStageVideo() {
    if (!stageVideo) return;
    stageVideo.pause();
  }

  function showImage(src, alt) {
    pauseStageVideo();
    if (stageVideo) {
      stageVideo.removeAttribute('src');
      stageVideo.load();
      stageVideo.hidden = true;
    }
    if (!stageImg) return;
    stageImg.hidden = false;
    if (stageImg.getAttribute('src') !== src) {
      stageImg.classList.add('is-swapping');
      stageImg.addEventListener('load', () => stageImg.classList.remove('is-swapping'), { once: true });
      stageImg.src = src;
    }
    if (alt) stageImg.alt = alt;
  }

  function showVideo(src, poster) {
    if (stageImg) stageImg.hidden = true;
    if (!stageVideo) return;
    pauseStageVideo();
    stageVideo.hidden = false;
    if (poster) stageVideo.setAttribute('poster', poster);
    else stageVideo.removeAttribute('poster');
    if (stageVideo.getAttribute('src') !== src) {
      stageVideo.src = src;
      stageVideo.load();
    }
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

    const type = thumb.dataset.type || 'image';
    const nextSrc = thumb.dataset.src || thumb.querySelector('img, video')?.getAttribute('src') || '';
    const nextAlt = thumb.dataset.alt || '';
    const poster = thumb.dataset.poster || '';

    if (type === 'video' && nextSrc) showVideo(nextSrc, poster);
    else if (nextSrc) showImage(nextSrc, nextAlt);

    if (currentEl) currentEl.textContent = String(safeIndex + 1);

    scrollThumbIntoView(thumb);
    updateButtons();
    if (focus) thumb.focus();
  }

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => setActive(index));
  });

  if (prevBtn) prevBtn.addEventListener('click', () => setActive(activeIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => setActive(activeIndex + 1));

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
