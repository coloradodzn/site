/* About page — CTA/footer reveal + claim fit su 2–3 righe */
(function () {
  let aboutAbort = null;
  let fitRaf = 0;

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Scala il font del claim finché le 3 righe entrano (mobile: ultima può wrap → max 4). */
  function fitClaimToWidth() {
    const statement = document.querySelector('.about-cta__statement');
    const claim = document.querySelector('.about-cta__claim');
    if (!statement || !claim) return;

    const lines = [...statement.querySelectorAll('.about-cta__line')];
    if (!lines.length) return;

    const maxWidth = claim.clientWidth;
    if (maxWidth <= 0) return;

    const isMobile = window.innerWidth < 768;
    const last = lines[lines.length - 1];
    const fixedLines = isMobile && last ? lines.slice(0, -1) : lines;

    // Mobile: fit sulle prime 2 nowrap; l’ultima può andare a capo una volta
    const minPx = isMobile ? 13 : 11;
    const maxPx = isMobile
      ? Math.min(22, Math.max(15, maxWidth * 0.055))
      : Math.min(56, maxWidth * 0.08);
    let lo = minPx;
    let hi = maxPx;

    const fits = (size) => {
      statement.style.fontSize = `${size}px`;
      const fixedOk = fixedLines.every((line) => line.scrollWidth <= maxWidth + 0.5);
      if (!fixedOk) return false;
      if (!isMobile || !last) return true;
      // ultima riga: ok se sta in una riga, o wrap in al massimo 2 (totale ≤ 4)
      if (last.scrollWidth <= maxWidth + 0.5) return true;
      const style = getComputedStyle(last);
      const lineHeight = parseFloat(style.lineHeight) || size * 1.28;
      return last.scrollHeight <= lineHeight * 2.15;
    };

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

  /** Lista servizi AQuest-style: preview al hover (desktop) o al tap (mobile). */
  function initAboutServices(signal) {
    const root = document.querySelector('[data-about-services]');
    const preview = document.querySelector('[data-about-services-preview]');
    const track = document.querySelector('[data-about-services-track]');
    const rows = [...document.querySelectorAll('[data-about-service-index]')];
    if (!root || !preview || !track || !rows.length) return;

    const count = Math.max(rows.length, 1);
    preview.style.setProperty('--services-count', String(count));

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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

    if (!canHover) {
      rows.forEach((row) => {
        const index = Number.parseInt(row.getAttribute('data-about-service-index') || '0', 10);
        row.addEventListener('click', () => {
          if (active === index && visible) {
            hide();
            return;
          }
          setIndex(index);
          show();
        }, { signal });
      });

      signal.addEventListener('abort', hide, { once: true });
      return;
    }

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

  /** Processo: freccia pull-to-reveal (drag ↓ o tap; scroll pagina libero). */
  function initAboutProcess(signal) {
    const root = document.querySelector('[data-about-process]');
    const pull = document.querySelector('[data-about-process-pull]');
    const stem = pull?.querySelector('.about-process__pull-stem');
    const steps = [...document.querySelectorAll('[data-about-process-step]')];
    if (!root || !pull || !stem || steps.length < 2) return;

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const THRESHOLD = coarse ? 44 : 56;
    const STEM_BASE = 26;
    const STEM_MAX = coarse ? 56 : 72;

    const revealAll = () => {
      steps.forEach((step) => {
        step.hidden = false;
        step.classList.add('is-visible');
      });
      root.classList.add('is-complete');
      pull.hidden = true;
    };

    if (prefersReducedMotion()) {
      revealAll();
      return;
    }

    let visibleCount = Math.max(
      1,
      steps.filter((s) => s.classList.contains('is-visible') && !s.hidden).length
    );
    const pullLabelBase =
      pull.getAttribute('aria-label') || 'Trascina o tocca per lo step successivo';

    const sync = () => {
      steps.forEach((step, i) => {
        const show = i < visibleCount;
        step.hidden = !show;
        step.classList.toggle('is-visible', show);
      });

      const done = visibleCount >= steps.length;
      const wasComplete = root.classList.contains('is-complete');
      root.classList.toggle('is-complete', done);
      pull.hidden = done;
      if (!done) {
        pull.setAttribute('aria-label', `${pullLabelBase} (${visibleCount}/${steps.length})`);
        return;
      }
      if (!wasComplete) {
        root.classList.remove('is-celebrating');
        void root.offsetWidth;
        root.classList.add('is-celebrating');
        // Porta tutto il flusso in vista (centro) per vedere il glow completo
        requestAnimationFrame(() => {
          const list = root.querySelector('.about-process__list');
          const target = list || root;
          try {
            target.scrollIntoView({
              block: 'center',
              inline: 'nearest',
              behavior: prefersReducedMotion() ? 'auto' : 'smooth'
            });
          } catch (_) {
            /* no-op */
          }
        });
      }
    };

    const revealNext = () => {
      if (visibleCount >= steps.length) return;
      visibleCount += 1;
      const completing = visibleCount >= steps.length;
      sync();
      // Durante il reveal step-by-step: solo nearest.
      // Al complete: sync fa già scroll center sul flusso intero.
      if (completing) return;
      const revealed = steps[visibleCount - 1];
      if (!revealed?.scrollIntoView) return;
      try {
        const rect = revealed.getBoundingClientRect();
        const vh = window.innerHeight || 0;
        const inView = rect.top >= 0 && rect.bottom <= vh;
        if (!inView) {
          revealed.scrollIntoView({
            block: 'nearest',
            behavior: prefersReducedMotion() ? 'auto' : 'smooth'
          });
        }
      } catch (_) {
        /* no-op */
      }
    };

    const resetPullVisual = () => {
      pull.classList.remove('is-dragging');
      pull.style.transform = '';
      stem.style.transform = '';
    };

    let pointerId = null;
    let startY = 0;
    let pullDist = 0;
    let dragged = false;
    let suppressClick = false;

    const onPointerDown = (event) => {
      if (event.button != null && event.button !== 0) return;
      if (visibleCount >= steps.length) return;
      pointerId = event.pointerId;
      startY = event.clientY;
      pullDist = 0;
      dragged = false;
      pull.classList.add('is-dragging');
      try {
        pull.setPointerCapture?.(pointerId);
      } catch (_) {
        /* alcuni browser possono rifiutare capture */
      }
    };

    const onPointerMove = (event) => {
      if (pointerId == null || event.pointerId !== pointerId) return;
      const dy = Math.max(0, event.clientY - startY);
      pullDist = dy;
      if (dy > 8) dragged = true;
      // scaleY = niente reflow (più leggero di height su mobile)
      const scale = Math.min(STEM_MAX / STEM_BASE, 1 + dy * 0.02);
      stem.style.transform = `scaleY(${scale})`;
      pull.style.transform = `translateY(${Math.min(dy * 0.35, 28)}px)`;
      if (dragged) event.preventDefault();
    };

    const onPointerUp = (event) => {
      if (pointerId == null || event.pointerId !== pointerId) return;
      const shouldReveal = pullDist >= THRESHOLD || (!dragged && pullDist < 10);
      pointerId = null;
      resetPullVisual();
      if (!shouldReveal) return;
      suppressClick = true;
      revealNext();
      window.setTimeout(() => {
        suppressClick = false;
      }, 320);
    };

    const onPointerCancel = (event) => {
      if (pointerId == null || event.pointerId !== pointerId) return;
      pointerId = null;
      resetPullVisual();
    };

    pull.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      revealNext();
    }, { signal });

    // Evita doppio reveal: pointerup + click sintetico su mobile
    pull.addEventListener('click', (event) => {
      if (suppressClick) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      revealNext();
    }, { signal });

    pull.addEventListener('pointerdown', onPointerDown, { signal });
    pull.addEventListener('pointermove', onPointerMove, { signal, passive: false });
    pull.addEventListener('pointerup', onPointerUp, { signal });
    pull.addEventListener('pointercancel', onPointerCancel, { signal });
    pull.addEventListener('lostpointercapture', () => {
      pointerId = null;
      resetPullVisual();
    }, { signal });

    sync();
  }

  function initAboutPage() {
    aboutAbort?.abort();
    aboutAbort = new AbortController();
    const { signal } = aboutAbort;

    if (!document.body.classList.contains('page-about')) return;

    initAboutReveals(signal);
    initWhyFlipCards(signal);
    initAboutServices(signal);
    initAboutProcess(signal);
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
