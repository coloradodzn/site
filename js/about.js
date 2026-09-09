/* About page — CTA/footer reveal + claim fit su 2–3 righe */
(function () {
  let aboutAbort = null;
  let fitRaf = 0;

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Scala il font del claim finché entrambe le righe entrano nella larghezza disponibile. */
  function fitClaimToWidth() {
    const statement = document.querySelector('.about-cta__statement');
    const claim = document.querySelector('.about-cta__claim');
    if (!statement || !claim) return;

    const lines = statement.querySelectorAll('.about-cta__line');
    if (!lines.length) return;

    const maxWidth = claim.clientWidth;
    if (maxWidth <= 0) return;

    const minPx = 11;
    const maxPx = Math.min(56, maxWidth * 0.08);
    let lo = minPx;
    let hi = maxPx;

    const fits = (size) => {
      statement.style.fontSize = `${size}px`;
      return [...lines].every((line) => line.scrollWidth <= maxWidth + 0.5);
    };

    // se anche il minimo non entra, resta al minimo (mobile molto stretto)
    if (!fits(minPx)) {
      statement.style.fontSize = `${minPx}px`;
      return;
    }

    for (let i = 0; i < 18; i += 1) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) lo = mid;
      else hi = mid;
    }

    statement.style.fontSize = `${lo}px`;
  }

  function scheduleClaimFit() {
    cancelAnimationFrame(fitRaf);
    fitRaf = requestAnimationFrame(() => {
      fitClaimToWidth();
      // secondo passaggio dopo layout/font
      requestAnimationFrame(fitClaimToWidth);
    });
  }

  /**
   * Reveal una tantum (fade + rise) quando l’elemento entra nella zona utile.
   * rootMargin negativo in basso = serve scroll intenzionale, non peek.
   */
  function initScrollReveal(el, signal, { className, threshold, rootMargin }) {
    if (!el) return;

    el.classList.add(className);

    if (prefersReducedMotion()) {
      el.classList.add('is-revealed');
      return;
    }

    const reveal = () => el.classList.add('is-revealed');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal();
          observer.disconnect();
        });
      },
      { root: null, threshold, rootMargin }
    );

    observer.observe(el);
    signal.addEventListener('abort', () => observer.disconnect(), { once: true });
  }

  function initAboutReveals(signal) {
    const cta = document.querySelector('body.page-about .about-cta');
    const footer = document.querySelector('body.page-about > .site-footer');

    // CTA: entra mentre lo stage prende la viewport
    initScrollReveal(cta, signal, {
      className: 'about-cta--reveal',
      threshold: 0.22,
      rootMargin: '0px 0px -8% 0px'
    });

    // Footer: solo dopo che claim+CTA è stato al centro e si scorre ancora
    initScrollReveal(footer, signal, {
      className: 'site-footer--about-reveal',
      threshold: 0.12,
      rootMargin: '0px 0px -18% 0px'
    });
  }

  function initAboutPage() {
    aboutAbort?.abort();
    aboutAbort = new AbortController();
    const { signal } = aboutAbort;

    if (!document.body.classList.contains('page-about')) return;

    initAboutReveals(signal);
    scheduleClaimFit();

    window.addEventListener('resize', scheduleClaimFit, { passive: true, signal });
    window.addEventListener('colorado:langchange', scheduleClaimFit, { signal });

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!signal.aborted) scheduleClaimFit();
      });
    }
  }

  window.coloradoInitAbout = initAboutPage;
  initAboutPage();
  document.addEventListener('colorado:pagechange', initAboutPage);
})();
