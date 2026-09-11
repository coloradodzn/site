(function initWorkGallery() {
  const gallery = document.querySelector('.work-gallery');
  if (!gallery) return;

  const stage = gallery.querySelector('.work-gallery__stage');
  const stageImg = gallery.querySelector('.work-gallery__image');
  const stageVideo = gallery.querySelector('.work-gallery__video');
  const stageSet = gallery.querySelector('.work-gallery__set');
  const thumbs = [...gallery.querySelectorAll('.work-gallery__thumb')];
  if ((!stageImg && !stageVideo && !stageSet) || !thumbs.length) return;

  const prevBtn = gallery.querySelector('.work-gallery__btn--prev');
  const nextBtn = gallery.querySelector('.work-gallery__btn--next');
  const currentEl = gallery.querySelector('.work-gallery__current');
  const totalEl = gallery.querySelector('.work-gallery__total');

  if (totalEl) totalEl.textContent = String(thumbs.length);

  let activeIndex = thumbs.findIndex((thumb) => thumb.classList.contains('is-active'));
  if (activeIndex < 0) activeIndex = 0;

  function scrollThumbIntoView(thumb) {
    const filmstrip = thumb.closest('.work-gallery__filmstrip');
    if (!filmstrip) return;

    // Scroll only inside the filmstrip — never the page (avoids cutting the title).
    const target =
      thumb.offsetLeft - (filmstrip.clientWidth - thumb.offsetWidth) / 2;
    filmstrip.scrollTo({
      left: Math.max(0, target),
      behavior: 'smooth',
    });
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

  function hideSet() {
    if (!stageSet) return;
    stageSet.hidden = true;
    stageSet.replaceChildren();
    stageSet.classList.remove('work-gallery__set--portrait');
    if (stage) stage.classList.remove('work-gallery__stage--set');
  }

  function showImage(src, alt, { portrait = false } = {}) {
    pauseStageVideo();
    hideSet();
    if (stageVideo) {
      stageVideo.removeAttribute('src');
      stageVideo.load();
      stageVideo.hidden = true;
    }
    if (!stageImg) return;
    stageImg.hidden = false;
    stageImg.classList.toggle('is-portrait', portrait);
    if (stageImg.getAttribute('src') !== src) {
      stageImg.classList.add('is-swapping');
      stageImg.addEventListener('load', () => stageImg.classList.remove('is-swapping'), { once: true });
      stageImg.src = src;
    }
    if (alt) stageImg.alt = alt;
  }

  function showSet(srcs, { portrait = false } = {}) {
    if (!stageSet || !srcs.length) return;
    pauseStageVideo();
    if (stageVideo) {
      stageVideo.removeAttribute('src');
      stageVideo.load();
      stageVideo.hidden = true;
    }
    if (stageImg) {
      stageImg.hidden = true;
      stageImg.classList.remove('is-portrait');
    }
    stageSet.hidden = false;
    stageSet.classList.toggle('work-gallery__set--portrait', portrait);
    if (stage) stage.classList.add('work-gallery__stage--set');
    stageSet.replaceChildren(
      ...srcs.map((src) => {
        const img = document.createElement('img');
        img.className = 'work-gallery__set-img';
        img.src = src;
        img.alt = '';
        img.decoding = 'async';
        return img;
      })
    );
  }

  function showVideo(src, poster) {
    hideSet();
    if (stageImg) {
      stageImg.hidden = true;
      stageImg.classList.remove('is-portrait');
    }
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

  function setActive(index, { focus = false, scroll = true } = {}) {
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
    const setSrcs = (thumb.dataset.srcs || '')
      .split('|')
      .map((src) => src.trim())
      .filter(Boolean);
    const portrait = thumb.dataset.layout === 'portrait' || type === 'portrait';

    if (type === 'video' && nextSrc) showVideo(nextSrc, poster);
    else if (type === 'set' && setSrcs.length) showSet(setSrcs, { portrait });
    else if (nextSrc) showImage(nextSrc, nextAlt, { portrait });

    if (currentEl) currentEl.textContent = String(safeIndex + 1);

    if (scroll) scrollThumbIntoView(thumb);
    updateButtons();
    if (focus) thumb.focus({ preventScroll: true });
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

  setActive(activeIndex, { scroll: false });
})();
