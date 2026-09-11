import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

async function initWorkPdf() {
  const root = document.querySelector('.work-pdf');
  if (!root || root.dataset.pdfInit === '1') return;
  root.dataset.pdfInit = '1';

  const url = root.dataset.pdf;
  if (!url) return;

  const viewportEl = root.querySelector('.work-pdf__viewport');
  const canvas = root.querySelector('.work-pdf__canvas');
  const prevBtn = root.querySelector('.work-pdf__btn--prev');
  const nextBtn = root.querySelector('.work-pdf__btn--next');
  const currentEl = root.querySelector('.work-pdf__current');
  const totalEl = root.querySelector('.work-pdf__total');
  const loadingEl = root.querySelector('.work-pdf__loading');
  const filmstripMount = root.querySelector('.work-pdf__filmstrip-wrap');

  if (!viewportEl || !canvas || !prevBtn || !nextBtn || !currentEl || !totalEl) return;

  let pdfDoc = null;
  let pageNum = 1;
  let rendering = false;
  let pendingPage = null;
  let filmstrip = null;
  let thumbButtons = [];

  try {
    pdfDoc = await pdfjsLib.getDocument(url).promise;
  } catch (err) {
    if (loadingEl) {
      loadingEl.textContent = 'Could not load PDF.';
      loadingEl.classList.add('is-error');
    }
    return;
  }

  const totalPages = pdfDoc.numPages;
  totalEl.textContent = String(totalPages);
  if (loadingEl) loadingEl.hidden = true;
  canvas.hidden = false;

  if (filmstripMount) {
    filmstrip = buildFilmstrip(filmstripMount, totalPages);
    thumbButtons = [...filmstrip.querySelectorAll('.work-pdf__thumb')];
  }

  updateButtons();
  await renderPage(pageNum);
  if (thumbButtons.length) renderThumbs();

  prevBtn.addEventListener('click', () => {
    if (pageNum <= 1) return;
    queueRender(pageNum - 1);
  });

  nextBtn.addEventListener('click', () => {
    if (pageNum >= totalPages) return;
    queueRender(pageNum + 1);
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prevBtn.click();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextBtn.click();
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => queueRender(pageNum), 120);
  });

  function buildFilmstrip(wrap, pages) {
    wrap.replaceChildren();

    const strip = document.createElement('div');
    strip.className = 'work-pdf__filmstrip';
    strip.setAttribute('role', 'listbox');
    strip.setAttribute('aria-label', 'PDF page previews');
    strip.setAttribute('data-i18n-aria-label', 'a11y.work3.pdf.pages');

    for (let i = 1; i <= pages; i += 1) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'work-pdf__thumb';
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', i === 1 ? 'true' : 'false');
      btn.setAttribute('aria-label', `Page ${i}`);
      btn.dataset.page = String(i);
      if (i === 1) btn.classList.add('is-active');

      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.className = 'work-pdf__thumb-canvas';
      btn.appendChild(thumbCanvas);

      btn.addEventListener('click', () => queueRender(i));
      strip.appendChild(btn);
    }

    wrap.appendChild(strip);
    return strip;
  }

  async function renderThumbs() {
    const thumbWidth = 144;
    for (let i = 0; i < thumbButtons.length; i += 1) {
      const page = await pdfDoc.getPage(i + 1);
      const base = page.getViewport({ scale: 1 });
      const scale = thumbWidth / base.width;
      const viewport = page.getViewport({ scale });
      const thumbCanvas = thumbButtons[i].querySelector('canvas');
      if (!thumbCanvas) continue;
      const ctx = thumbCanvas.getContext('2d');
      thumbCanvas.width = Math.floor(viewport.width);
      thumbCanvas.height = Math.floor(viewport.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
    }
  }

  function syncFilmstrip(num) {
    thumbButtons.forEach((btn, index) => {
      const active = index + 1 === num;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    const activeThumb = thumbButtons[num - 1];
    if (!activeThumb) return;
    const filmstrip = activeThumb.closest('.work-pdf__filmstrip, .work-gallery__filmstrip');
    if (!filmstrip) return;
    const target =
      activeThumb.offsetLeft - (filmstrip.clientWidth - activeThumb.offsetWidth) / 2;
    filmstrip.scrollTo({
      left: Math.max(0, target),
      behavior: 'smooth',
    });
  }

  function updateButtons() {
    prevBtn.disabled = pageNum <= 1;
    nextBtn.disabled = pageNum >= totalPages;
  }

  function queueRender(num) {
    pageNum = num;
    if (rendering) {
      pendingPage = num;
      return;
    }
    renderPage(num);
  }

  async function renderPage(num) {
    rendering = true;
    const page = await pdfDoc.getPage(num);
    const baseViewport = page.getViewport({ scale: 1 });
    const containerWidth = Math.max(viewportEl.clientWidth, 280);
    const scale = containerWidth / baseViewport.width;
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext('2d');

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    await page.render({ canvasContext: context, viewport }).promise;

    currentEl.textContent = String(num);
    canvas.setAttribute('aria-label', `Page ${num} of ${totalPages}`);
    updateButtons();
    syncFilmstrip(num);
    rendering = false;

    if (pendingPage !== null) {
      const next = pendingPage;
      pendingPage = null;
      await renderPage(next);
    }
  }
}

initWorkPdf();
document.addEventListener('colorado:pagechange', initWorkPdf);
