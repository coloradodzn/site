import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

async function initWorkPdf() {
  const root = document.querySelector('.work-pdf');
  if (!root) return;

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
  updateButtons();
  await renderPage(pageNum);

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
    rendering = false;

    if (pendingPage !== null) {
      const next = pendingPage;
      pendingPage = null;
      await renderPage(next);
    }
  }
}

initWorkPdf();
