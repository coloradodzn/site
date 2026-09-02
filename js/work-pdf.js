import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

const THUMB_WIDTH = 88;

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

  filmstrip = buildFilmstrip(root, totalPages);
  thumbButtons = [...filmstrip.querySelectorAll('.work-pdf__thumb')];

  updateButtons();
  updateActiveThumb();
  await renderPage(pageNum);
  renderThumbnails();

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

  function buildFilmstrip(pdfRoot, pages) {
    const wrap = document.createElement('div');
    wrap.className = 'work-pdf__filmstrip-wrap';

    const strip = document.createElement('div');
    strip.className = 'work-pdf__filmstrip';
    strip.setAttribute('role', 'tablist');
    strip.setAttribute('aria-label', 'PDF pages');
    strip.setAttribute('data-i18n-aria-label', 'a11y.work3.pdf.pages');

    for (let i = 1; i <= pages; i += 1) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `work-pdf__thumb${i === 1 ? ' is-active' : ''}`;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === 1 ? 'true' : 'false');
      btn.setAttribute('aria-label', `Page ${i}`);
      btn.tabIndex = i === 1 ? 0 : -1;
      btn.dataset.page = String(i);

      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.className = 'work-pdf__thumb-canvas';
      thumbCanvas.width = THUMB_WIDTH;
      thumbCanvas.height = Math.round(THUMB_WIDTH * 0.5625);
      btn.appendChild(thumbCanvas);

      btn.addEventListener('click', () => queueRender(i, { focus: true }));
      strip.appendChild(btn);
    }

    wrap.appendChild(strip);

    const controls = pdfRoot.querySelector('.work-pdf__controls');
    if (controls) {
      pdfRoot.insertBefore(wrap, controls);
    } else {
      pdfRoot.appendChild(wrap);
    }

    return strip;
  }

  async function renderThumbnails() {
    await Promise.all(
      thumbButtons.map(async (btn) => {
        const pageIndex = Number(btn.dataset.page);
        const thumbCanvas = btn.querySelector('.work-pdf__thumb-canvas');
        if (!thumbCanvas || thumbCanvas.dataset.rendered === '1') return;

        const page = await pdfDoc.getPage(pageIndex);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = THUMB_WIDTH / baseViewport.width;
        const viewport = page.getViewport({ scale });

        thumbCanvas.width = Math.floor(viewport.width);
        thumbCanvas.height = Math.floor(viewport.height);

        await page.render({
          canvasContext: thumbCanvas.getContext('2d'),
          viewport,
        }).promise;

        thumbCanvas.dataset.rendered = '1';
      })
    );
  }

  function updateActiveThumb() {
    thumbButtons.forEach((btn) => {
      const isActive = Number(btn.dataset.page) === pageNum;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      btn.tabIndex = isActive ? 0 : -1;
      if (isActive) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }

  function updateButtons() {
    prevBtn.disabled = pageNum <= 1;
    nextBtn.disabled = pageNum >= totalPages;
  }

  function queueRender(num, { focus = false } = {}) {
    pageNum = num;
    if (rendering) {
      pendingPage = num;
      return;
    }
    renderPage(num, { focus });
  }

  async function renderPage(num, { focus = false } = {}) {
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
    updateActiveThumb();
    rendering = false;

    if (focus) {
      const activeThumb = thumbButtons.find((btn) => Number(btn.dataset.page) === num);
      activeThumb?.focus();
    }

    if (pendingPage !== null) {
      const next = pendingPage;
      pendingPage = null;
      await renderPage(next);
    }
  }
}

initWorkPdf();
document.addEventListener('colorado:pagechange', initWorkPdf);
