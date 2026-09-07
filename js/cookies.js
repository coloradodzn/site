(function () {
  const COOKIE_KEY = 'colorado_cookies_choice';
  let cookieAbort = null;

  function getStoredChoice() {
    try {
      return localStorage.getItem(COOKIE_KEY);
    } catch (err) {
      return null;
    }
  }

  function hasAcceptedCookies() {
    return getStoredChoice() === 'accepted';
  }

  function persistChoice(choice) {
    try {
      localStorage.setItem(COOKIE_KEY, choice);
    } catch (err) {
      /* storage blocked */
    }
  }

  function getBanner() {
    return document.getElementById('cookie-banner');
  }

  function getPanel() {
    return document.getElementById('cookie-banner-panel');
  }

  function getChip() {
    return document.getElementById('cookie-banner-chip');
  }

  function buildBanner() {
    let banner = getBanner();
    if (banner) {
      ensurePanelCloseButton(banner);
      return banner;
    }

    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.id = 'cookie-banner';
    banner.hidden = true;
    banner.setAttribute('aria-hidden', 'true');
    banner.innerHTML = `
      <button
        type="button"
        class="cookie-banner__chip"
        id="cookie-banner-chip"
        aria-expanded="false"
        aria-controls="cookie-banner-panel"
        data-i18n-aria-label="cookie.chip"
        aria-label="Cookie"
      >
        <svg class="cookie-banner__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.75"/>
          <circle cx="9" cy="9.5" r="1.15" fill="currentColor"/>
          <circle cx="14.2" cy="8.8" r="1" fill="currentColor"/>
          <circle cx="11.2" cy="13.4" r="1.2" fill="currentColor"/>
          <circle cx="15.1" cy="13.1" r="0.95" fill="currentColor"/>
          <circle cx="8.6" cy="14.8" r="0.85" fill="currentColor"/>
        </svg>
        <span class="cookie-banner__chip-label" data-i18n="cookie.chip">Cookie</span>
      </button>

      <div
        class="cookie-banner__panel"
        id="cookie-banner-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-text"
        hidden
      >
        <div class="cookie-banner__header">
          <p id="cookie-banner-title" class="cookie-banner__title" data-i18n="cookie.title">Informativa privacy</p>
          <button
            type="button"
            class="cookie-banner__dismiss"
            id="cookie-banner-dismiss"
            data-i18n-aria-label="cookie.close"
            aria-label="Chiudi"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <p id="cookie-banner-text" class="cookie-banner__text">
          <span data-i18n="cookie.text">Questo sito tratta dati personali e usa memorizzazione locale per il funzionamento e le preferenze. Maggiori dettagli nella</span>
          <a href="privacy.html" class="cookie-banner__link" data-i18n="cookie.privacyLink">Privacy Policy</a>.
        </p>
        <div class="cookie-banner__actions">
          <button type="button" class="cookie-banner__reject" id="cookie-banner-reject" data-i18n="cookie.reject">Rifiuta</button>
          <button type="button" class="cookie-banner__accept" id="cookie-banner-accept" data-i18n="cookie.accept">Accetta</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    if (typeof window.coloradoRefreshI18n === 'function') {
      window.coloradoRefreshI18n();
    }

    return banner;
  }

  function ensurePanelCloseButton(banner) {
    const panel = banner.querySelector('#cookie-banner-panel');
    if (!panel || panel.querySelector('#cookie-banner-dismiss')) return;

    const title = panel.querySelector('#cookie-banner-title');
    if (!title) return;

    const header = document.createElement('div');
    header.className = 'cookie-banner__header';
    title.replaceWith(header);
    header.appendChild(title);

    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'cookie-banner__dismiss';
    dismiss.id = 'cookie-banner-dismiss';
    dismiss.setAttribute('data-i18n-aria-label', 'cookie.close');
    dismiss.setAttribute('aria-label', 'Chiudi');
    dismiss.innerHTML = '<span aria-hidden="true">&times;</span>';
    header.appendChild(dismiss);

    if (typeof window.coloradoRefreshI18n === 'function') {
      window.coloradoRefreshI18n();
    }
  }

  function syncChoiceUi() {
    const choice = getStoredChoice();
    const acceptBtn = document.getElementById('cookie-banner-accept');
    const rejectBtn = document.getElementById('cookie-banner-reject');

    acceptBtn?.classList.toggle('is-selected', choice === 'accepted');
    rejectBtn?.classList.toggle('is-selected', choice === 'rejected');
    acceptBtn?.setAttribute('aria-pressed', String(choice === 'accepted'));
    rejectBtn?.setAttribute('aria-pressed', String(choice === 'rejected'));
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function setPanelOpen(open, { center = false } = {}) {
    const banner = getBanner();
    const panel = getPanel();
    const chip = getChip();
    if (!banner || !panel || !chip) return;

    panel.classList.remove('is-collapsing');
    banner.classList.toggle('cookie-banner--center', open && center);
    panel.hidden = !open;
    chip.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('cookie-banner-open', open);
    // prima scelta in corso: la modale sta sopra l'intro e il gate resta bloccato
    document.body.classList.toggle('cookie-consent-pending', open && center);

    if (open) {
      syncChoiceUi();
      window.setTimeout(() => {
        document.getElementById('cookie-banner-accept')?.focus({ preventScroll: true });
      }, 40);
    } else if (
      document.activeElement === document.getElementById('cookie-banner-accept')
      || document.activeElement === document.getElementById('cookie-banner-reject')
      || document.activeElement === document.getElementById('cookie-banner-dismiss')
    ) {
      chip.focus({ preventScroll: true });
    }
  }

  /** Il pannello si rimpicciolisce fin dentro il chip cookie, poi si chiude. */
  function collapseIntoChip(onDone) {
    const banner = getBanner();
    const panel = getPanel();
    const chip = getChip();

    if (!banner || !panel || !chip || panel.hidden || prefersReducedMotion()) {
      setPanelOpen(false);
      onDone?.();
      return;
    }

    const panelBox = panel.getBoundingClientRect();
    const chipBox = chip.getBoundingClientRect();
    const isCentered = banner.classList.contains('cookie-banner--center');

    panel.style.setProperty(
      '--cookie-collapse-base',
      isCentered ? 'translate(-50%, -50%)' : 'translate(0px, 0px)'
    );
    panel.style.setProperty(
      '--cookie-collapse-x',
      `${(chipBox.left + chipBox.width / 2) - (panelBox.left + panelBox.width / 2)}px`
    );
    panel.style.setProperty(
      '--cookie-collapse-y',
      `${(chipBox.top + chipBox.height / 2) - (panelBox.top + panelBox.height / 2)}px`
    );

    chip.classList.remove('is-catching');
    panel.classList.add('is-collapsing');

    // il chip "accoglie" il pannello poco prima della fine dell'animazione
    window.setTimeout(() => chip.classList.add('is-catching'), 300);
    chip.addEventListener('animationend', () => chip.classList.remove('is-catching'), { once: true });

    panel.addEventListener('animationend', () => {
      panel.style.removeProperty('--cookie-collapse-base');
      panel.style.removeProperty('--cookie-collapse-x');
      panel.style.removeProperty('--cookie-collapse-y');
      setPanelOpen(false);
      onDone?.();
    }, { once: true });
  }

  function showChip(banner) {
    if (!banner) return;
    banner.hidden = false;
    banner.classList.add('is-visible');
    banner.setAttribute('aria-hidden', 'false');
    // prima visita: pannello al centro dello schermo; poi solo il chip
    setPanelOpen(getStoredChoice() === null, { center: true });
    syncChoiceUi();
  }

  function hideChip(banner) {
    if (!banner) return;
    setPanelOpen(false);
    banner.hidden = true;
    banner.classList.remove('is-visible');
    banner.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cookie-banner-open');
  }

  function settleCookies(choice) {
    persistChoice(choice);
    syncChoiceUi();
    // il gate dell'intro si sblocca solo a pannello richiuso
    collapseIntoChip(() => {
      document.dispatchEvent(new CustomEvent('colorado:cookies-settled', { detail: { choice } }));
    });
    document.dispatchEvent(new CustomEvent(
      choice === 'accepted' ? 'colorado:cookies-accepted' : 'colorado:cookies-rejected'
    ));
  }

  /**
   * Sulla home la modale entra nel gate dell'intro: dopo la sigla e prima
   * che compaia il bottone di ingresso.
   */
  function maybeShowAfterIntro(banner, signal) {
    const intro = document.getElementById('home-intro');
    const introRunning = document.body.classList.contains('home-intro-active');

    if (!introRunning || intro?.classList.contains('is-gate')) {
      showChip(banner);
      return;
    }

    let shown = false;
    const reveal = () => {
      if (shown) return;
      shown = true;
      showChip(banner);
    };

    document.addEventListener('colorado:intro-gate', reveal, { once: true, signal });
    // rete di sicurezza: intro chiusa senza passare dal gate
    document.addEventListener('colorado:intro-dismissed', reveal, { once: true, signal });
  }

  function initCookieBanner() {
    cookieAbort?.abort();
    cookieAbort = new AbortController();
    const { signal } = cookieAbort;

    const banner = buildBanner();
    if (!banner) return;

    const chip = getChip();
    const acceptBtn = document.getElementById('cookie-banner-accept');
    const rejectBtn = document.getElementById('cookie-banner-reject');
    const dismissBtn = document.getElementById('cookie-banner-dismiss');

    chip?.addEventListener('click', () => {
      const panel = getPanel();
      setPanelOpen(Boolean(panel?.hidden));
    }, { signal });

    // la prima scelta è obbligatoria: dalla modale centrale non si esce senza decidere
    const isMandatory = () => banner.classList.contains('cookie-banner--center');

    acceptBtn?.addEventListener('click', () => settleCookies('accepted'), { signal });
    rejectBtn?.addEventListener('click', () => settleCookies('rejected'), { signal });
    dismissBtn?.addEventListener('click', () => {
      if (!isMandatory()) setPanelOpen(false);
    }, { signal });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (banner.hidden || isMandatory()) return;
      const panel = getPanel();
      if (panel && !panel.hidden) setPanelOpen(false);
    }, { signal });

    maybeShowAfterIntro(banner, signal);
  }

  window.coloradoHasAcceptedCookies = hasAcceptedCookies;
  window.coloradoCookieChoicePending = () => getStoredChoice() === null;
  window.coloradoInitCookies = initCookieBanner;

  initCookieBanner();
  document.addEventListener('colorado:pagechange', initCookieBanner);
})();
