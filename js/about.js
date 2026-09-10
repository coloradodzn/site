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

  /** Desktop: flip via CSS hover. Touch: tap per girare; Esc chiude. */
  function initWhyFlipCards(signal) {
    const cards = [...document.querySelectorAll('[data-about-why-card]')];
    if (!cards.length) return;

    const hoverFlip = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const setFlipped = (card, open) => {
      card.classList.toggle('is-flipped', open);
      card.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    const closeOthers = (except) => {
      cards.forEach((card) => {
        if (card !== except) setFlipped(card, false);
      });
    };

    if (hoverFlip) {
      cards.forEach((card) => {
        const item = card.closest('.about-why__item');
        if (!item) return;
        item.addEventListener('mouseenter', () => setFlipped(card, true), { signal });
        item.addEventListener('mouseleave', () => setFlipped(card, false), { signal });
        card.addEventListener('focus', () => setFlipped(card, true), { signal });
        card.addEventListener('blur', () => setFlipped(card, false), { signal });
      });
      return;
    }

    cards.forEach((card) => {
      let startX = 0;
      let startY = 0;
      let dragged = false;

      card.addEventListener('pointerdown', (event) => {
        startX = event.clientX;
        startY = event.clientY;
        dragged = false;
      }, { signal });

      card.addEventListener('pointermove', (event) => {
        if (Math.hypot(event.clientX - startX, event.clientY - startY) > 10) {
          dragged = true;
        }
      }, { signal });

      card.addEventListener('click', () => {
        if (dragged) {
          dragged = false;
          return;
        }
        const open = !card.classList.contains('is-flipped');
        if (open) closeOthers(card);
        setFlipped(card, open);
      }, { signal });
    });

    const grid = document.querySelector('.about-why__grid');
    if (grid) {
      let scrollClose = false;
      grid.addEventListener('scroll', () => {
        if (scrollClose) return;
        scrollClose = true;
        requestAnimationFrame(() => {
          scrollClose = false;
          closeOthers(null);
        });
      }, { passive: true, signal });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      closeOthers(null);
    }, { signal });
  }

  /** Lista servizi AQuest-style: preview immagine che segue il mouse. */
  function initAboutServices(signal) {
    const root = document.querySelector('[data-about-services]');
    const preview = document.querySelector('[data-about-services-preview]');
    const track = document.querySelector('[data-about-services-track]');
    const rows = [...document.querySelectorAll('[data-about-service-index]')];
    if (!root || !preview || !track || !rows.length) return;

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canHover) return;

    const count = Math.max(rows.length, 1);
    preview.style.setProperty('--services-count', String(count));

    let active = -1;
    let visible = false;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = 0;

    const setIndex = (index) => {
      active = index;
      track.style.transform = `translate3d(0, ${index * -(100 / count)}%, 0)`;
      rows.forEach((row, i) => {
        row.closest('.about-services__item')?.classList.toggle('is-active', i === index);
      });
    };

    const show = () => {
      visible = true;
      preview.classList.add('is-visible');
      preview.setAttribute('aria-hidden', 'false');
    };

    const hide = () => {
      visible = false;
      active = -1;
      preview.classList.remove('is-visible');
      preview.setAttribute('aria-hidden', 'true');
      rows.forEach((row) => row.closest('.about-services__item')?.classList.remove('is-active'));
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      preview.style.left = `${currentX}px`;
      preview.style.top = `${currentY}px`;
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!raf && visible) raf = requestAnimationFrame(tick);
    };

    rows.forEach((row) => {
      const index = Number.parseInt(row.getAttribute('data-about-service-index') || '0', 10);
      row.addEventListener('mouseenter', (event) => {
        setIndex(index);
        targetX = event.clientX;
        targetY = event.clientY;
        if (!visible) {
          currentX = targetX;
          currentY = targetY;
          preview.style.left = `${currentX}px`;
          preview.style.top = `${currentY}px`;
        }
        show();
        if (!raf) raf = requestAnimationFrame(tick);
      }, { signal });

      row.addEventListener('focus', () => {
        setIndex(index);
        show();
      }, { signal });
    });

    root.addEventListener('mouseleave', hide, { signal });
    root.addEventListener('mousemove', onMove, { passive: true, signal });
    signal.addEventListener('abort', () => {
      cancelAnimationFrame(raf);
      hide();
    }, { once: true });
  }

  function initAboutPage() {
    aboutAbort?.abort();
    aboutAbort = new AbortController();
    const { signal } = aboutAbort;

    if (!document.body.classList.contains('page-about')) return;

    initAboutReveals(signal);
    initWhyFlipCards(signal);
    initAboutServices(signal);
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
