(function () {
  const INTRO_KEY = 'colorado_intro_seen';
  const SESSION_KEY = 'colorado_session';
  let introAbort = null;

  function initHomeIntro() {
    introAbort?.abort();
    introAbort = new AbortController();
    const { signal } = introAbort;

    const intro = document.getElementById('home-intro');
    const video = document.getElementById('home-intro-video');
    const startBtn = document.getElementById('home-intro-start');
    const skipBtn = document.getElementById('home-intro-skip');

    if (!intro || !document.body.classList.contains('home-intro-active')) {
      if (intro) {
        intro.classList.add('is-hidden');
        intro.classList.remove('is-playing', 'is-gate', 'is-locked', 'is-fading');
        intro.setAttribute('aria-hidden', 'true');
      }
      return;
    }

    intro.classList.remove('is-hidden');
    intro.setAttribute('aria-hidden', 'false');

    function dismissIntro() {
      try {
        localStorage.setItem(INTRO_KEY, '1');
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch (err) {
        /* storage blocked */
      }

      intro.classList.add('is-hidden');
      intro.classList.remove('is-playing', 'is-gate', 'is-locked', 'is-fading');
      document.body.classList.remove('home-intro-active', 'home-intro-sigla');

      /* Landing immediata sul primo viewport: niente caccia allo scroll */
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.body.classList.add('home-intro-landed');
      window.setTimeout(() => document.body.classList.remove('home-intro-landed'), 4200);

      window.setTimeout(() => {
        intro.setAttribute('aria-hidden', 'true');
      }, 700);

      if (video) {
        video.pause();
        video.currentTime = 0;
      }

      document.dispatchEvent(new CustomEvent('colorado:intro-dismissed'));
    }

    function unlockGate() {
      intro.classList.remove('is-locked');
    }

    /** Fine sigla: dissolvenza sul sito (scrim semitrasparente) + CTA. */
    function showGate() {
      intro.classList.add('is-fading');
      intro.classList.remove('is-playing');
      document.body.classList.remove('home-intro-sigla');

      if (video) {
        video.pause();
      }

      const revealGate = () => {
        intro.classList.remove('is-fading');
        intro.classList.add('is-gate');

        const consentPending = typeof window.coloradoCookieChoicePending === 'function'
          && window.coloradoCookieChoicePending();

        if (consentPending) {
          intro.classList.add('is-locked');
          document.addEventListener('colorado:cookies-settled', unlockGate, { once: true, signal });
        } else {
          unlockGate();
        }

        document.dispatchEvent(new CustomEvent('colorado:intro-gate'));
      };

      /* Lascia completare il fade video → sito prima del bottone */
      window.setTimeout(revealGate, prefersReducedMotion() ? 0 : 700);
    }

    function prefersReducedMotion() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /** Autoplay: prova con audio; se bloccato, muted + letterbox (mobile). */
    function playSigla() {
      if (!video) {
        showGate();
        return;
      }

      intro.classList.add('is-playing');
      intro.classList.remove('is-gate', 'is-fading');
      document.body.classList.add('home-intro-sigla');

      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.playsInline = true;

      const tryPlay = (muted) => {
        video.muted = muted;
        return video.play();
      };

      const start = tryPlay(false);
      if (start && typeof start.then === 'function') {
        start.catch(() => {
          const mutedPlay = tryPlay(true);
          if (mutedPlay && typeof mutedPlay.then === 'function') {
            mutedPlay.catch(() => showGate());
          }
        });
      }
    }

    if (startBtn) startBtn.addEventListener('click', dismissIntro, { signal });
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        /* Skip = fine anticipata della sigla → stessa fase gate (musica può partire). */
        showGate();
      }, { signal });
    }
    if (video) {
      video.addEventListener('ended', () => {
        showGate();
      }, { signal });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (intro.classList.contains('is-locked')) {
        return;
      }
      if (intro.classList.contains('is-gate')) {
        dismissIntro();
      } else if (intro.classList.contains('is-playing') || intro.classList.contains('is-fading')) {
        showGate();
      }
    }, { signal });

    playSigla();
  }

  initHomeIntro();
  document.addEventListener('colorado:pagechange', initHomeIntro);
})();
